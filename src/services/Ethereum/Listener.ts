import {environment} from '../../environments/environment';
import {EthereumService} from './EthereumService';
import * as web3 from 'web3';
import * as admin from "firebase-admin";
import * as abiDecoder from 'abi-decoder';
import {BigNumber} from 'bignumber.js';
import fetch from 'node-fetch';

const ethereumService = new EthereumService();

const securePlatformWallet = environment.blockchain.ETH.securePlatformWallet;

export class Listener{
	private web3:any;
	private wallets:Array<any>;

	constructor(){
		this.web3 = new web3();
		this.web3.setProvider(new web3.providers.HttpProvider(environment.blockchain.ETH.nodeURL));

		abiDecoder.addABI(environment.contractABI);

		if (this.web3.isConnected()) {
			console.log('Connected to the Ethereum network');
		}else{
			let err = new Error("A web3 valid instance must be provided");
      err.name = "Web3InstanceError";
      throw err;
		}
	}


	public watchForDeposits(){

		this.getDepositWallets();

		this.watchForConfirmedDeposits();

	}


	private getDepositWallets(){
		const db = admin.firestore();
		db.collection(`private`)
		.onSnapshot((querySnapshot)=>{

			this.wallets = [];

			querySnapshot.forEach(doc=> {
				let data = doc.data();
				data.uid = doc.id;
				this.wallets.push(data);
			});

		});
	}


	private watchForConfirmedDeposits(){
	  let filter = this.web3.eth.filter('latest');
	  filter.watch((err, hash)=>{
	    if(!err){
	    	// try{

		      let confirmedBlock = this.web3.eth.getBlock(this.web3.eth.getBlock(hash).number-11, true);

		      if(confirmedBlock.transactions.length > 0 && this.wallets && this.wallets.length>0){
		      	for(let transaction of confirmedBlock.transactions){
	      		try{


							if(transaction.to){ //transaction it's not a contrat creation

								let receiver = transaction.to.toLowerCase();


	      				// ETH NORMAL TRANSACTIONS
		      	
	      				let [userETHWallet, userTokenWallet, currency] = this.findETHReceiverWallet(receiver);

	      				let tokenContractCalled = environment.tokens.find(tokens=>tokens.contractAddress.toLowerCase()==receiver);


		      			if (userETHWallet && receiver!=securePlatformWallet.address.toLowerCase()) { //ETH deposited
		      				
		      				console.log('ETH deposited by user');
		      				this.forwardMoney('ETH', userETHWallet, transaction);

		      			}else if(userTokenWallet && transaction.from.toLowerCase()==securePlatformWallet.address.toLowerCase() && receiver!=securePlatformWallet.address.toLowerCase()){ //ETH sent by platform to approve forward the token
		      				console.log('ETH sent by platform to approve forward the token');
		      				this.approve(currency, userTokenWallet.wallet[currency], userTokenWallet.wallet[currency].feeToApprove, transaction);

		      			} else if(receiver==securePlatformWallet.address.toLowerCase()){ //ETH received by platform
		      				console.log('ETH received in platform wallet');
		      				this.sendRequest('ETH',transaction);





	      				// CONTRACT TRANSACTIONS

		      			} else if(tokenContractCalled && transaction.input.length>2){

		      				const decodedData = abiDecoder.decodeMethod(transaction.input);

	      					let currency = tokenContractCalled.symbol;

		      				if(this.isTokenTransfer(decodedData)){ //TOKEN TRANSFER
		      					let {from, to, amount} = this.getTransferParams(decodedData);

		      					let userTokenWallet = this.wallets.find(item=>{return (item.wallet[currency] && item.wallet[currency].address==to.toLowerCase() )});

		      					if (userTokenWallet && to.toLowerCase()!=securePlatformWallet.address.toLowerCase()) { //Token deposited
		      						
		      						console.log('Token transfer detected');
		      						console.log('Token deposited by user');
		      						this.forwardMoney(currency, userTokenWallet, transaction);

		      					} else if(to.toLowerCase()==securePlatformWallet.address.toLowerCase()){ //Token received by platform
		      						console.log('Token transfer detected');
		      						console.log('Token received in platform wallet');
		      						transaction.token = {from, to, amount};
		      						this.sendRequest(tokenContractCalled.symbol, transaction);
		      					}


		      				} else if(this.isTokenApproval(decodedData)){ //TOKEN APPROVAL
	      						let {spender, amount} = this.getApprovalParams(decodedData);

	      						let userTokenWallet = this.wallets.find(item=>{return (item.wallet[currency] && item.wallet[currency].address==transaction.from.toLowerCase() )});

		      					if(userTokenWallet && spender.toLowerCase()==securePlatformWallet.address.toLowerCase()){ //Platform was allowed to forward tokens
		      						console.log('Token approval detected');
		      						this.forwardMoney(currency, userTokenWallet, transaction);
		      					}
		      				}
		      			}
							}

	      		}catch(e){
	      			console.log(e.message || e);
	      		}
		      	}
		      }

	    // }catch(error){
	    // 	console.log(error.message || error);
	    // }

	    }else{
				throw new Error(err.message || err);
	      // console.log(err.message || err);
	    }
	  });

	}


	private async forwardMoney(currency:string, userWallet:any, transaction:any){
		let wallet = userWallet.wallet[currency];
		let txStatus = this.web3.eth.getTransactionReceipt(transaction.hash).status;

		if(txStatus=='0x1'){ //successful Transaction

			if (currency=='ETH') {
				let gasPrice = this.web3.eth.gasPrice.toString(10);
				let balance = this.web3.eth.getBalance(wallet.address).toString(10);
				let gasLimit = '21000';
				let fee = new BigNumber(gasPrice).times(gasLimit).toString(10);
				let amountToSend = new BigNumber(balance).minus(fee).toString(10);
				
				if(new BigNumber(amountToSend).isGreaterThan(0)){ //There's enough ETH to forward
					console.log('Forwarding ETH to the platform wallet...');
					ethereumService.transfer(currency, wallet.address, wallet.privateKey, securePlatformWallet.address, amountToSend,gasPrice, gasLimit);
				
				}else{
					// console.log('Amount too small to forward');
				}




			} else {
				let contractAddress = environment.tokens.find(tokens=>tokens.symbol==currency).contractAddress;
				let myContractInstance = this.web3.eth.contract(environment.contractABI).at(contractAddress);

				let amountToSend = myContractInstance.balanceOf(wallet.address).toString(10);

				if(new BigNumber(amountToSend).isGreaterThan(0)) {//There are tokens to forward
					if (new BigNumber(myContractInstance.allowance(wallet.address, securePlatformWallet.address)).isGreaterThanOrEqualTo(amountToSend)) { //Platform is allowed to forward token
						
						console.log('Forwarding token to the platform wallet...');
						ethereumService.transferFrom(currency, securePlatformWallet.address, securePlatformWallet.privateKey, wallet.address, securePlatformWallet.address, amountToSend);
					
					} else { //Platform is not allowed to forward tokens. Sending ETH to user deposit wallet to set approval...
					
						console.log(`Platform is not allowed to forward tokens. Sending ETH to the user deposit wallet to set approval for ${currency}...`);
						let totalAmountToForward = new BigNumber(2).pow(256).minus(1).toString(10);
						let gasPrice = this.web3.eth.gasPrice.toString(10);
						let gasLimit = String(Math.round(1.25*myContractInstance.approve.estimateGas(securePlatformWallet.address, totalAmountToForward, {from:wallet.address})));
						
						const db = admin.firestore();
						let feeToSave:any = {};
						feeToSave[`wallet.${currency}.feeToApprove`]= {gasPrice, gasLimit};
						
						await db.doc(`private/${userWallet.uid}`).update(feeToSave);

						let feeToApprove = new BigNumber(gasLimit).times(gasPrice).toString(10);
						ethereumService.transfer('ETH', securePlatformWallet.address, securePlatformWallet.privateKey, wallet.address, feeToApprove);

					}

				}else{
					// console.log('No available tokens to forward');
				}
			}
		}
	}



	private approve(currency:string,wallet:any, feeToApprove:any, transaction:any){
		let txStatus = this.web3.eth.getTransactionReceipt(transaction.hash).status;
		let contractAddress = environment.tokens.find(tokens=>tokens.symbol==currency).contractAddress;
		let myContractInstance = this.web3.eth.contract(environment.contractABI).at(contractAddress);

		if(txStatus=='0x1'){
			let allowedAmount = myContractInstance.allowance(wallet.address, securePlatformWallet.address);

			if(new BigNumber(allowedAmount).isEqualTo(0)){
				
				console.log(`Approving user wallet to forward tokens for ${currency}..`);
				let totalAmountToForward = new BigNumber(2).pow(256).minus(1).toString(10);
				ethereumService.approve(currency, wallet.address, wallet.privateKey, securePlatformWallet.address, totalAmountToForward, feeToApprove.gasPrice, feeToApprove.gasLimit);
			
			}else if(new BigNumber(allowedAmount).isLessThan(myContractInstance.balanceOf(wallet.address))){

				console.log(`Approving user wallet to forward tokens for ${currency}..`);
				let totalAmountToForward = new BigNumber(2).pow(256).minus(1).toString(10);
				ethereumService.approve(currency, wallet.address, wallet.privateKey, securePlatformWallet.address, totalAmountToForward, feeToApprove.gasPrice, feeToApprove.gasLimit);
			}
		}
	}


	private isTokenTransfer(decodedData:any){
		return (decodedData.name=='transfer' || decodedData.name=='transferFrom');
	}

	private isTokenApproval(decodedData:any){
		return (decodedData.name=='approve');
	}


	public getTransferParams(decodedData:any){
		let from = decodedData.params.find(param=>{return param.name=='_from'})? decodedData.params.find(param=>{return param.name=='_from'}).value : null;
		let to = decodedData.params.find(param=>{return param.name=='_to'}).value;
		let amount = decodedData.params.find(param=>{return param.name=='_value'})? decodedData.params.find(param=>{return param.name=='_value'}).value: decodedData.params.find(param=>{return param.name=='_amount'}).value;
		return {from, to, amount};
	}


	public getApprovalParams(decodedData:any){
		let spender = decodedData.params.find(param=>{return param.name=='_spender'}).value;
		let amount = decodedData.params.find(param=>{return param.name=='_value'})? decodedData.params.find(param=>{return param.name=='_value'}).value: decodedData.params.find(param=>{return param.name=='_amount'}).value;
		return {spender, amount};
	}


	private findETHReceiverWallet(receiver:any){
		
		let userETHWallet;
		let userTokenWallet;
		let currency;

		top:
		for(let item of this.wallets){

			for(let symbol in item.wallet){
				if(receiver==item.wallet[symbol].address){
					if (symbol=='ETH') {
						userETHWallet = item;
					} else {
						userTokenWallet = item;
						currency = symbol;
					}
					break top;
				}
			}

		}
		
		return [userETHWallet, userTokenWallet, currency];
	}	


	private async sendRequest(currency:string, transaction:any){
		console.log('Sending request to server...');

    try{
    	let transactionReceipt = this.web3.eth.getTransactionReceipt(transaction.hash);
    	transaction.status = transactionReceipt.status;
    	transaction.gasUsed = transactionReceipt.gasUsed;
    	transaction.currency = currency;

    	delete transaction.gas, delete transaction.publicKey, delete transaction.r, delete transaction.raw, delete transaction.s, 
    	delete transaction.standardV, delete transaction.chainId, delete transaction.condition, delete transaction.creates;
    	delete transaction.v;

			await fetch(environment.server.api, { 
				method: 'POST',
				body:    JSON.stringify(transaction),
				headers: { 'Content-Type': 'application/json' },
			})
			
			
    }catch(err){
    	console.log('Error sending request:', err.message || err);
    }
	}




}
import {environment} from '../../environments/environment';
import * as web3 from 'web3';
import * as Tx from 'ethereumjs-tx';
import * as admin from "firebase-admin";
const ethereumjsWallet = require('ethereumjs-wallet');

export class EthereumService{

	private web3:web3;
	// private myContractInstance:any;
	constructor(){
		this.web3 = new web3();
		this.web3.setProvider(new web3.providers.HttpProvider(environment.blockchain.ETH.nodeURL));

		if (this.web3.isConnected()) {
		} else {
      let err = new Error("A web3 valid instance must be provided");
      err.name = "Web3InstanceError";
      throw err;
		}		
	}

	public createDepositWallet():Promise<any>{
		const db = admin.firestore();
		return new Promise(async (resolve,reject)=>{
			try{
				let wallet = {};
				let addresses = {}
				let generatedETHWallet = ethereumjsWallet.generate();
				
				wallet['ETH'] = {address:generatedETHWallet.getAddressString().toLowerCase(), privateKey:this.cleanPrefix(generatedETHWallet.getPrivateKeyString())};
				addresses['ETH'] = wallet['ETH'].address;

				for(let token of environment.tokens){
					let generatedTokenWallet = ethereumjsWallet.generate();
					wallet[token.symbol] = {address:generatedTokenWallet.getAddressString().toLowerCase(), privateKey:this.cleanPrefix(generatedTokenWallet.getPrivateKeyString())};
					addresses[token.symbol] = wallet[token.symbol].address;
				}

				await db.collection('private').add({wallet});
				resolve(addresses);

			}catch(err){
				reject('Unexpected error generating wallet. Try again later');
			}
		});
	}

	public createPersonalWallet():Promise<{address:string,privateKey:string}>{
		return new Promise((resolve,reject)=>{
			try{
			let generatedWallet = ethereumjsWallet.generate();
			let ETHWallet = {address:generatedWallet.getAddressString().toLowerCase(), privateKey:this.cleanPrefix(generatedWallet.getPrivateKeyString())};
			resolve(ETHWallet);
			}catch(err){
				reject('Unexpected error generating wallet. Try again later');
			}
		});
	}

	public getTransaction(txHash:string){
		return new Promise(async (resolve,reject)=>{
			try{
				resolve(this.web3.eth.getTransaction(txHash));
			}catch(err){
				reject(err.message);
			}
		});
	}

	public getTransactionReceipt(txHash:string){
		return new Promise(async (resolve,reject)=>{
			try{
				resolve(this.web3.eth.getTransactionReceipt(txHash));
			}catch(err){
				reject(err.message);
			}
		});
	}


	public estimateFee(currency:string, from?, to?, amount?){
		return new Promise((resolve,reject)=>{
			try{
				let gasPrice = this.web3.eth.gasPrice;
				let estimateGas;

				if (currency=='ETH') {
					estimateGas = 21000;

				} else {
					let contractAddress = environment.tokens.find(tokens=>tokens.symbol==currency).contractAddress;
					let myContractInstance = this.web3.eth.contract(environment.contractABI).at(contractAddress);
					estimateGas = myContractInstance.transfer.estimateGas(to,amount,{from:from});
				}

				let fee = gasPrice*estimateGas;
				resolve({gasPrice:gasPrice, gasCost:estimateGas, fee:fee});

			}catch(err){
				reject(err.message);
			}

		});
	}


	public transfer(currency:string, from:string, privateKey:string, to:string, amount:string | number, _gasPrice?, gasLimit?){
		return new Promise((resolve,reject)=>{
			try{
					let gasPrice = _gasPrice;
					let estimateGas = gasLimit;

					if(!gasPrice){
						gasPrice = this.web3.eth.gasPrice;
					}

					if(!estimateGas){

						if (currency=='ETH') {
							estimateGas = this.web3.eth.estimateGas({
					  		from:from,
					      to: to,
					      value: this.web3.toHex(amount)
					  	});

						} else {
							let contractAddress = environment.tokens.find(tokens=>tokens.symbol==currency).contractAddress;
							let myContractInstance = this.web3.eth.contract(environment.contractABI).at(contractAddress);
							estimateGas = Math.round(1.25*myContractInstance.transfer.estimateGas(to,amount,{from:from}));
						}
					}

			    let rawTx:any = {
		        nonce: this.web3.toHex(this.web3.eth.getTransactionCount(from)),
		        gasPrice: this.web3.toHex(gasPrice),
		        gasLimit: this.web3.toHex(estimateGas)
			    };

			    if (currency=='ETH') {
			    	rawTx.to = to;
			    	rawTx.value = this.web3.toHex(amount);

			    } else {
			    	let contractAddress = environment.tokens.find(tokens=>tokens.symbol==currency).contractAddress;
						let myContractInstance = this.web3.eth.contract(environment.contractABI).at(contractAddress);
			    	rawTx.to = contractAddress;
			    	rawTx.value = '0x00';
			    	rawTx.data = myContractInstance.transfer.getData(to,amount);
			    }
	        // Generate tx
	        let tx = new Tx(rawTx);
	        tx.sign(Buffer.from(privateKey, 'hex')); //Sign transaction
	        let serializedTx = `0x${tx.serialize().toString('hex')}`;
            this.web3.eth.sendRawTransaction(serializedTx, (err, hash)=> {
              if(err){
              	reject(String(err));
              } else{
              	resolve(hash);
              }               
            });
			}catch(err){
				reject(err.message);
			}
		});
	}


	public approve(currency:string, from:string, privateKey:string, spender:string, amount:string, _gasPrice?, gasLimit?){
		return new Promise((resolve,reject)=>{
			try{
					let gasPrice = _gasPrice;
					let estimateGas = gasLimit;
					let contractAddress = environment.tokens.find(tokens=>tokens.symbol==currency).contractAddress;
					let myContractInstance = this.web3.eth.contract(environment.contractABI).at(contractAddress);

					if(!gasPrice){
						gasPrice = this.web3.eth.gasPrice;
					}
					if(!estimateGas){
						estimateGas = Math.round(1.25*myContractInstance.approve.estimateGas(spender,amount,{from:from}));
					}

			    let rawTx = {
			        nonce: this.web3.toHex(this.web3.eth.getTransactionCount(from)),
			        gasPrice: this.web3.toHex(gasPrice),
			        gasLimit: this.web3.toHex(estimateGas),
			        to: contractAddress,
			        value: '0x00',
			        data: myContractInstance.approve.getData(spender,amount)
			    };
	        // Generate tx
	        let tx = new Tx(rawTx);
	        tx.sign(Buffer.from(privateKey, 'hex')); //Sign transaction
	        let serializedTx = `0x${tx.serialize().toString('hex')}`;
          this.web3.eth.sendRawTransaction(serializedTx, (err, hash)=> {
            if(err){
            	reject(String(err));
            } else{
            	resolve(hash);
            }               
          });
			}catch(err){
				reject(err.message);
			}
		});
	}


	public transferFrom(currency:string, from:string, privateKey:string, recipient:string,to:string, amount:string, _gasPrice?, gasLimit?){
		return new Promise((resolve,reject)=>{
			try{
					let gasPrice = _gasPrice;
					let estimateGas = gasLimit;
					let contractAddress = environment.tokens.find(tokens=>tokens.symbol==currency).contractAddress;
					let myContractInstance = this.web3.eth.contract(environment.contractABI).at(contractAddress);

					if(!gasPrice){
						gasPrice = this.web3.eth.gasPrice;
					}
					if(!estimateGas){
						estimateGas = Math.round(1.25*myContractInstance.transferFrom.estimateGas(recipient,to,amount,{from:from}));
					}

			    let rawTx = {
			        nonce: this.web3.toHex(this.web3.eth.getTransactionCount(from)),
			        gasPrice: this.web3.toHex(gasPrice),
			        gasLimit: this.web3.toHex(estimateGas),
			        to: contractAddress,
			        value: '0x00',
			        data: myContractInstance.transferFrom.getData(recipient,to,amount)
			    };
		        // Generate tx
		        let tx = new Tx(rawTx);
		        tx.sign(Buffer.from(privateKey, 'hex')); //Sign transaction
		        let serializedTx = `0x${tx.serialize().toString('hex')}`;
		            this.web3.eth.sendRawTransaction(serializedTx, (err, hash)=> {
		                if(err){
		                	reject(String(err));
		                } else{
		                	resolve(hash);
		                }               
		            });
			}catch(err){
				reject(err.message);
			}
		});
	}


	public balanceOf(currency:string, address:string):Promise<any>{
		return new Promise((resolve,reject)=>{
			try{
				let contractAddress = environment.tokens.find(tokens=>tokens.symbol==currency).contractAddress;
				let myContractInstance = this.web3.eth.contract(environment.contractABI).at(contractAddress);
				resolve(myContractInstance.balanceOf(address));
			}catch(err){
				reject(err.message);
			}
		});
	}


	public getBalances(address:string):Promise<any>{
		return new Promise((resolve,reject)=>{
			try{
				let batch = this.web3.createBatch();
				let balances = {};

				batch.add(this.web3.eth.getBalance.request((err,response)=>{
					if (!err) { 
						balances['ETH'] = response;
					}else{
						reject(String(err));
					}
				}));


				for(let i in environment.tokens){
					let token = environment.tokens[i];
					let myContractInstance = this.web3.eth.contract(environment.contractABI).at(token.contractAddress);

					batch.add(myContractInstance.balanceOf(address).request((err,response)=>{
						if (!err) {
							balances[token.symbol] = response;
							
							if(Number(i)==environment.tokens.length-1){
								resolve(balances);
							}
						}else{
							reject(String(err));
					}
					}));
				}

				batch.execute();

			}catch(err){
				reject(err.message);
			}
		});		
	}


	public allowance(currency:string,from:string, spender:string):Promise<any>{
		return new Promise((resolve,reject)=>{
			try{
				let contractAddress = environment.tokens.find(tokens=>tokens.symbol==currency).contractAddress;
				let myContractInstance = this.web3.eth.contract(environment.contractABI).at(contractAddress);
				resolve(myContractInstance.allowance(from, spender));
			}catch(err){
				return(err.message);
			}
		});
	}

	public getTokenTransactions(currency:string,address:string):Promise<any>{
		return new Promise((resolve,reject)=>{
			try{
			let contractAddress = environment.tokens.find(tokens=>tokens.symbol==currency).contractAddress;
			let myContractInstance = this.web3.eth.contract(environment.contractABI).at(contractAddress);
			let events = myContractInstance.Transfer({from:address}, {fromBlock:0,toBlock:'latest'});
			events.get((err,results)=>{
				if(!err){
					resolve(results);
				}else{
					reject('Error loading list. Try again later');
				}
			})

			}catch(err){
				return(err.message);
			}
		});
	}


	private cleanPrefix(data:string){
		return data.indexOf('0x')==0? data.substring(2): data;
	}
}
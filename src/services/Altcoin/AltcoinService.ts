const bitcoin = require('bitcoinjs-lib');
const zcash = require('zcashjs-lib');
import {environment} from '../../environments/environment';
import * as admin from "firebase-admin";
const fetch = require('node-fetch');
import {BigNumber} from 'bignumber.js';
const coinSelect = require('coinselect');
const bchaddr = require('bchaddrjs');

export class AltcoinService{

  public createDepositWallet(currency:string):Promise<any>{
    const db = admin.firestore();
		return new Promise(async (resolve,reject)=>{
      try {

        const altcoin = currency=='ZEC'? zcash : bitcoin;
        
        if(currency=='KOD' || currency=='PPC') {

          const address = await this.handleRequest(currency, 'getnewaddress', 'depositWallets');
          const wif = await this.handleRequest(currency, 'dumpprivkey', address);

          await db.collection('altcoinWallets').add({
            currency:currency,
            address:address,
            searchable:address.toLowerCase(),
            wif:wif
          });
          
          resolve(address);
          
        }else{
          
          const keyPair = altcoin.ECPair.makeRandom({network:environment.blockchain[currency].network});
          const { address } = altcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network:environment.blockchain[currency].network });

          await this.handleRequest(currency, 'importaddress', address,'depositWallets', false);
          
          let cashAddr:string;
          if(currency=='BCH') cashAddr = bchaddr.toCashAddress(address);

          let obj = {
            currency:currency,
            address:currency=='BCH'? cashAddr.substring(cashAddr.indexOf(':') + 1) : address,
            privateKey:keyPair.privateKey.toString('hex')
          };

          obj['searchable'] = obj.address.toLowerCase();

          await db.collection('altcoinWallets').add(obj);

          resolve(obj.address);
        }


      } catch (err) {
        reject(err.message || err);
      }
    });
  }

  public createPersonalWallet(currency:string):Promise<{address:string,privateKey:string,legacyAddress?}>{
    return new Promise(async(resolve, reject)=>{
      try {

        const altcoin = currency=='ZEC'? zcash : bitcoin;

        if (currency=='KOD' || currency=='PPC') {
          
          const address = await this.handleRequest(currency, 'getnewaddress','depositWallets');

          const wif = await this.handleRequest(currency, 'dumpprivkey', address);
          
          const keyPair = altcoin.ECPair.fromWIF(wif, environment.blockchain[currency].network);
          
          resolve({
            address:address,
            privateKey:keyPair.privateKey.toString('hex')
          });
          
        } else {
          const keyPair = altcoin.ECPair.makeRandom({network:environment.blockchain[currency].network});
          
          const { address } = altcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network:environment.blockchain[currency].network });
          
          await this.handleRequest(currency, 'importaddress', address,'depositWallets', false);

          let cashAddr:string;
          if(currency=='BCH') cashAddr = bchaddr.toCashAddress(address);

          let obj = {
            currency:currency,
            address:currency=='BCH'? cashAddr.substring(cashAddr.indexOf(':') + 1) : address,
            privateKey:keyPair.privateKey.toString('hex')
          };

          obj['searchable'] = obj.address.toLowerCase();

          resolve({
            address:obj.address,
            legacyAddress:currency=='BCH'? address:undefined,
            privateKey:obj.privateKey
          });
        }
        

      } catch (err) {
        reject(err.message || err);
      }
    });
  }


  public transfer(currency:string, from:string, privateKey:string, to:string, amount:number){
    return new Promise(async(resolve, reject)=>{
      try {

        const altcoin = currency=='ZEC'? zcash : bitcoin;
        const zcashFee = currency=='ZEC'? 0.0001 : 0;
        
        let utxos:any[] = await this.listUnspentUTXO(currency, from);

        let balance = '0';

        for(let i in utxos){
          utxos[i].value = +this.toSatoshi(utxos[i].amount, currency);
          balance = new BigNumber(balance).plus(utxos[i].amount).toString(10);
          delete utxos[i].amount;
        }

        if (new BigNumber(balance).isGreaterThan(+amount+zcashFee)) {

          let estimatefeePerKb:number; //0.00054 5.7884298 doge

          if (currency=='ZEC') estimatefeePerKb = 0;
          else estimatefeePerKb = (await this.estimatefeePerKb(currency)).feerate;
          // else estimatefeePerKb = 5.7884298;

          if (currency=='ZEC' || (currency!='ZEC' && estimatefeePerKb>0) ) {
            

            let estimatefeeInSatoshiPerByte = this.toSatoshi(new BigNumber(estimatefeePerKb).div(1000), currency);

            let { inputs, outputs, fee } = coinSelect(utxos, 
              [{
                address: currency=='BCH'? await this.toLegacyAddress(to) : to, 
                value: +this.toSatoshi(+amount+zcashFee, currency) 
              }], 
              +estimatefeeInSatoshiPerByte);
            
            fee = this.toBitcoin(fee, currency);

            const txb = new altcoin.TransactionBuilder(environment.blockchain[currency].network);
            if(currency=='DASH') txb.setVersion(2);
            else txb.setVersion(1);

            
            inputs.forEach(input => txb.addInput(input.txid, input.vout));

            for(let output of outputs){
              // watch out, outputs may have been added that you need to provide an output address/script for
              if (!output.address) output.address = currency=='BCH'? await this.toLegacyAddress(from) : from;
              else output.value = +output.value - (+this.toSatoshi(zcashFee, currency));

              txb.addOutput(output.address, output.value);
            }


            const keyPair = altcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), {network:environment.blockchain[currency].network});

            let rawTx = currency=='BCH'? txb.buildIncomplete().toHex() : '';
            
            for(let i = 0; i<inputs.length; i++){
              if(currency=='BCH') rawTx = (await this.signrawtransaction(currency, rawTx, keyPair.toWIF())).hex;
              else txb.sign(i, keyPair);
            }

            let hash = await this.sendrawtransaction(currency, currency=='BCH'? rawTx : txb.build().toHex());

            resolve(hash);


          } else {
            reject(`Wrong fee per Kb value: ${this.estimatefeePerKb}`);
          }

        } else {
          reject('Insufficient funds');
        }

        
      } catch (err) {
        reject(err.message || err);
      }

    });
  }




  public async estimateFee(currency){ //1 input - 1 output
    if(currency=='ZEC') return 0.0001;

    let estimatefeePerKb = (await this.estimatefeePerKb(currency)).feerate;
    let decimalPlaces = currency=='PPC'? 6 : 8;
    let fee = new BigNumber(+estimatefeePerKb).div(1000).times( (1*180) + (1*34) + 10 +1 ).decimalPlaces(decimalPlaces).toString(10);
    return fee;
  }

  public async estimatefeePerKb(currency:string){
    if(currency=='BCH' || currency=='KOD') return {feerate: await this.handleRequest(currency, 'estimatefee', 2)};
    else if(currency=='PPC') return {feerate:0.01};
    return this.handleRequest(currency, 'estimatesmartfee', 2);
  }

  public toBitcoin(amount:number | string | BigNumber, currency:string){
    let decimalPlaces = currency=='PPC'? 6 : 8;
    return new BigNumber(amount).times(new BigNumber(10).pow(-decimalPlaces)).decimalPlaces(decimalPlaces).toString(10);
  }

  public toSatoshi(amount:number | string | BigNumber, currency:string){
    let decimalPlaces = currency=='PPC'? 6 : 8;
    return new BigNumber(amount).decimalPlaces(decimalPlaces).times(new BigNumber(10).pow(decimalPlaces)).toString(10);
  }

  public async toWIF(currency:string, privateKey:string){
    const altcoin = currency=='ZEC'? zcash : bitcoin;
    const keyPair = altcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), {network:environment.blockchain[currency].network});
    return keyPair.toWIF();
  }

  public async toPrivateKey(currency:string, wif:string){
    const altcoin = currency=='ZEC'? zcash : bitcoin;
    const keyPair = altcoin.ECPair.fromWIF(wif, environment.blockchain[currency].network);
    return keyPair.privateKey.toString('hex');
  }


  public async getBalance(currency:string, address:string){
    let utxos = ((await this.listUnspentUTXO(currency, address)) as any[]);
    let balance = '0';
    for(let utxo of utxos){
      balance = new BigNumber(balance).plus(utxo.amount).toString(10);
    }
    return balance;
  }

  public async getBlock(currency:string, hashOrHeight:string | number){
    if (typeof hashOrHeight=='string') return this.getBlockByHash(currency, hashOrHeight); 
    return this.getBlockByHash(currency, (await this.getBlockHash(currency, hashOrHeight)) );
  }


  public getBlockByHash(currency:string, hash:string){
    return this.handleRequest(currency, 'getblock', hash);
  }

  public getBlockHash(currency:string, height:number){
    return this.handleRequest(currency, 'getblockhash', height);
  }

  public getTransaction(currency:string, hash:string){
    const verbose = (currency=='ZEC' || currency=='KOD' || currency=='PPC')? 1 : true;
    return  this.handleRequest(currency, 'getrawtransaction', hash, verbose);
  }

  public listUnspentUTXO(currency:string, address:string){
    return this.handleRequest(currency, 'listunspent', 1, 9999999, [address]);
  }

  public signrawtransaction(currency:string, rawTx:string, privateKey:string){
    return this.handleRequest(currency, 'signrawtransaction', rawTx, null, [privateKey]);
  }

  public sendrawtransaction(currency:string, rawTx:string){
    return this.handleRequest(currency, 'sendrawtransaction', rawTx);
  }

  public toLegacyAddress(address:string){
    return new Promise((resolve, reject)=>{
      try {
        resolve(bchaddr.toLegacyAddress(address));
        
      } catch (err) {
        reject(err.message);
      }
    });
  }




  private handleRequest(currency:string, method:string, ...params:(string | number | boolean | string[])[]):Promise<any>{
    return new Promise(async (resolve, reject)=>{
      try {
        let res = await fetch(environment.blockchain[currency].nodeURL, { 
          method: 'POST',
          body:    JSON.stringify({
            id:"curltest", 
            method: method, 
            params: params
          }),
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Basic dXNlcjpwYXNzd29yZA=='
          },
        });
  
        let response = await res.json();
        
        if (!response.error) {
          resolve(response.result);
          
        } else {
          if (method=='getrawtransaction') resolve(null);
          else reject(response.error.message);
        }
        
      } catch (err) {
        if(method=='getrawtransaction') resolve(null);
        else reject(err.message || err);
      }


    });
  }

  public getBlockCypherfeePerKb(currency:string):Promise<any>{
    return new Promise(async (resolve, reject)=>{
      try {
        let res = await fetch(`https://api.blockcypher.com/v1/${currency.toLowerCase()}/main`, { 
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json'
          },
        });
  
        if (res.ok) {
          let response = await res.json();
  
          if (!response.error) resolve(this.toBitcoin(response.high_fee_per_kb, currency));
          else reject(response.error.message || response.error);
          
        } else {
          reject(res.statusText);
        }
        
      } catch (err) {
        reject(err.message || err);
      }
    });
  }
}
const bitcoin = require('bitcoinjs-lib');
const zcash = require('zcashjs-lib');
import * as admin from "firebase-admin";
import {environment} from '../../environments/environment';
import {BigNumber} from 'bignumber.js';
import {AltcoinService} from './AltcoinService';
import { BehaviorSubject } from 'rxjs';
import {tap, filter} from 'rxjs/operators';
import fetch from 'node-fetch';

const altcoinService = new AltcoinService();

interface depositWallet {address:string, searchable:string, currency:string, privateKey?, wif?};

export let txListener = new BehaviorSubject({currency:null, hash:null});


export class Listener{
  private txs:any = {};
  public currency:string;
  private securePlatformWallet:{address:string, privateKey:string, legacyAddress?};
  
  constructor(currency:string){
    this.currency = currency;
    this.securePlatformWallet = environment.blockchain[currency].securePlatformWallet;
  }


  public async watchForDeposits(){
    await this.getPendingTxs(this.currency, 'deposit');
    console.log('Txs downloaded!');
    this.watchForPendingTxs(this.currency);
    
    this.watchForTxsConfirmations(this.currency, 'deposit');
  }


  private async getPendingTxs(currency:string, type:string){
    const db = admin.firestore();

    let querySnapshot = await db.collection(`transactions`)
      .where('type','==',type)
      .where('currency','==',currency)
      .where('status','==','pending')
      .get();
      
    this.txs[type] = [];
    
    querySnapshot.forEach(doc=> this.txs[type].push(doc.data()) );
  }


  private watchForPendingTxs(currency:string){

    txListener.pipe(filter(tx=>tx.currency==currency && tx.hash), tap(async (tx)=>{

      const hash = tx.hash;

      let transaction = await altcoinService.getTransaction(currency, hash);
      
      if(transaction && transaction.vout){
        
        for(let vout of transaction.vout){

          if(vout.scriptPubKey && vout.scriptPubKey.addresses && vout.scriptPubKey.addresses[0]){
            let to:string = vout.scriptPubKey.addresses[0].toLowerCase();
            if(currency=='BCH') to = to.substring(to.indexOf(':') + 1);

            let receiverWallet = await this.getDepositWallet(currency, to);
            
            if(receiverWallet){
              console.log(`${currency} deposited by user. Pending tx`);
              this.uploadPendingTx(currency, receiverWallet, transaction).catch(err=>console.log(err.message || err));
            }
          }
        }
      }
    })).subscribe();

  }


  private async getDepositWallet(currency:string, address:string){
    const db = admin.firestore();
    let snapshot = await db.collection(`altcoinWallets`)
      .where('currency','==',currency)
      .where('searchable','==',address)
      .limit(1)
      .get();

    if(snapshot.empty) return null;
    else return <depositWallet>snapshot.docs[0].data();
  }


  private async uploadPendingTx(currency:string, wallet:depositWallet, transaction:any){
    const db = admin.firestore();

    if(!((this.txs['deposit'] as Array<any>).find(tx=> tx.currency==currency && tx.searchable==transaction.txid.toLowerCase())) ){ //The pending transaction is not on DB yet
    
      const id = db.collection('uniqueID').doc().id;

      let txObj = {
        type: 'deposit',
        currency: currency,
        status: 'pending',
        address: wallet.address,
        processed: false,
        txHash: transaction.txid,
        searchable: transaction.txid.toLowerCase(),
        id: id
      };

      await db.doc(`transactions/${id}`).set(txObj);

      this.txs['deposit'].push(txObj);

      return true;

    }else{ //The pending transaction is already on DB
      return true;
    }
  }


  private watchForTxsConfirmations(currency:string, type:string){
    const db = admin.firestore();

    let interval = setInterval(async ()=>{

      if(this.txs[type]){
      
        for(let tx of this.txs[type]){

          let transaction = await altcoinService.getTransaction(currency, tx.txHash);

          if (transaction) { //If the tx exists 

            if(transaction.confirmations>=1){

              for(let vout of transaction.vout){

                let to:string = vout.scriptPubKey.addresses[0].toLowerCase();
                if(currency=='BCH') to = to.substring(to.indexOf(':') + 1);

                let receiverWallet = await this.getDepositWallet(currency, to);

                if(receiverWallet){
                  console.log(`${currency} deposited by user. Confirmed tx`);
                  this.forwardMoney(currency, receiverWallet, tx).catch(err=>console.log(err.message || err));

                }else if(to==this.securePlatformWallet.address.toLowerCase() && transaction.confirmations>=2){
                  console.log(`${currency} received in platform wallet. Confirmed tx`);
                  await this.sendRequest(currency, transaction, tx).catch(err=>console.log(err.message || err));
                }
              }
            }

          } else{ //If it doesn't exist. (might have dissappeared)
            db.doc(`transactions/${tx.id}`).delete().then(()=> this.deleteTx(type, tx.id) ).catch(err=>console.log(err.message || err)); //Delete the tx from database
          }
        }
      }

    }, environment.blockchain[currency].listenerTimer);
  }



  private async forwardMoney(currency:string, wallet:depositWallet, tx:any){

    const altcoin = currency=='ZEC'? zcash : bitcoin;

    const txb = new altcoin.TransactionBuilder(environment.blockchain[currency].network);

    if(currency=='DASH') txb.setVersion(2);
    else txb.setVersion(1);

    
    let utxos = await altcoinService.listUnspentUTXO(currency, wallet.address);
    let balance = '0';

    for(let utxo of utxos){
      balance = new BigNumber(balance).plus(utxo.amount).toString(10);
      txb.addInput(utxo.txid, utxo.vout);
    }

    let fee:string;
    let decimalPlaces = currency=='PPC'? 6 : 8;
    
    if (currency=='ZEC') {
      fee = '0.0001';
    }else{
      let estimatefeePerKb:number;
      estimatefeePerKb = (await altcoinService.estimatefeePerKb(currency)).feerate; //0.000054 5.7884298 doge
      if(currency=='KOD' && estimatefeePerKb<=0 ) estimatefeePerKb = 0.0005;
      fee = new BigNumber(+estimatefeePerKb).div(1000).times( (utxos.length*180) + (1*34) + 10 + utxos.length ).decimalPlaces(decimalPlaces).toString(10);
    }

    if(new BigNumber(fee).isGreaterThan(0)){

            
      let amountToSend = new BigNumber(balance).minus(fee).decimalPlaces(decimalPlaces).toString(10);
      
      if(new BigNumber(amountToSend).isGreaterThan(0)){ //There's enough money to forward
        console.log('Forwarding Altcoin to the platform wallet...');
        txb.addOutput(this.securePlatformWallet[currency=='BCH'? 'legacyAddress' : 'address'], +altcoinService.toSatoshi(amountToSend, currency));
        

        let keyPair;
        if(currency=='KOD' || currency=='PPC') {keyPair = altcoin.ECPair.fromWIF(wallet.wif, environment.blockchain[currency].network);}
        else {keyPair = altcoin.ECPair.fromPrivateKey(Buffer.from(wallet.privateKey, 'hex'), {network:environment.blockchain[currency].network});}

        
        let rawTx = currency=='BCH'? txb.buildIncomplete().toHex() : '';

        for(let i = 0; i<utxos.length; i++){
          if(currency=='BCH') rawTx = (await altcoinService.signrawtransaction(currency, rawTx, keyPair.toWIF())).hex;
          else txb.sign(i, keyPair);
        }

        let hash = await altcoinService.sendrawtransaction(currency, currency=='BCH'? rawTx : txb.build().toHex());
        console.log('hash:', hash);
        const db = admin.firestore();
        const batch = db.batch();
        const id = db.collection('uniqueID').doc().id;

        let txObj = {
          type: 'deposit',
          currency: currency,
          status: 'pending',
          address: wallet.address,
          processed: true,
          amount: amountToSend,
          fee: fee,
          txHash: hash,
          searchable: hash.toLowerCase(),
          id: id,
          creationTS: new Date().getTime()
        };

        let req = {
          currency: currency,
          hash: hash,
          status: 'pending',
          from: wallet.address,
          to: this.securePlatformWallet.address,
          fee: fee,
          value: amountToSend
        };

        await fetch(environment.server.api, {
          method: 'POST',
          body:    JSON.stringify(req),
          headers: { 'Content-Type': 'application/json' },
        });

        batch.set(db.doc(`transactions/${id}`), txObj);
        batch.delete(db.doc(`transactions/${tx.id}`));

        await batch.commit();

        (<any[]>this.txs['deposit']).push(txObj);

        this.deleteTx('deposit', tx.id);

        return true;
      
      }else{
        console.log('Not enough balance:',balance,'Deleting tx from DB');
        const db = admin.firestore();
        await db.doc(`transactions/${tx.id}`).delete();
        this.deleteTx('deposit', tx.id);
        return true;
      }

    }else {
      console.log('Wrong fee value:', fee);
    }
  }



  private async sendRequest(currency:string, transaction:any, tx:any){
    console.log('Sending request to server...');
    const db = admin.firestore();

    let req = {
      currency: currency,
      hash: transaction.txid,
      blockHash: transaction.blockhash,
      status: 'confirmed',
      from: tx.address,
      to: this.securePlatformWallet.address,
      fee: tx.fee,
      value: transaction.vout[0].value.toString()
    };


    await fetch(environment.server.api, {
      method: 'POST',
      body:    JSON.stringify(req),
      headers: { 'Content-Type': 'application/json' },
    });

    await db.doc(`transactions/${tx.id}`).delete();

    this.deleteTx('deposit', tx.id);

    console.log('Request sent');

  }




  private deleteTx(type:string, id:string){
    (<any[]>this.txs[type]).splice((<any[]>this.txs[type]).findIndex(_tx=> _tx.id==id), 1);
  }


}
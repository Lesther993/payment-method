import {Database, connectedToXRP} from "../Database";
import * as admin from "firebase-admin";
import {environment} from '../../environments/environment';
import {filter} from 'rxjs/operators';
import {BigNumber} from 'bignumber.js';
import {XRPService} from './XRPService';
const fetch = require('node-fetch');

const xrpService = new XRPService();


interface depositWallet {address:string, currency:string, destinationTag:number};



export class Listener{

  private txs:any = {};
  private securePlatformWallet:{address:string, secret:string};

  constructor(){
    this.securePlatformWallet = environment.blockchain.XRP.securePlatformWallet;
  }


  public async watchForDeposits(){
    await this.getPendingTxs('deposit');
    console.log('Txs downloaded!');
    this.watchForPendingTxs();
    
    this.watchForTxsConfirmations('deposit');
  }


  private async getPendingTxs(type:string){
    const db = admin.firestore();

    let querySnapshot = await db.collection(`transactions`)
      .where('type','==',type)
      .where('currency','==','XRP')
      .where('status','==','pending')
      .get();
      
    this.txs[type] = [];
    
    querySnapshot.forEach(doc=> this.txs[type].push(doc.data()) );
  }



  private watchForPendingTxs(){
    
    connectedToXRP.pipe(filter(bool=>bool)).subscribe(async()=>{
          
      Database.api.connection.on('transaction', async (result) => {

          let transaction = result.transaction;
    
          if(result.type=='transaction' && transaction.TransactionType=='Payment' && 
             ((typeof transaction.Amount)=='string' || (typeof transaction.Amount)=='number') && 
             transaction.Destination.toLowerCase()==this.securePlatformWallet.address.toLowerCase() && 
             transaction.DestinationTag>0
            ){

            let receiverWallet = await this.getDepositWallet(transaction.DestinationTag);

            if(receiverWallet){
              console.log(`XRP deposited by user. Pending tx`);
              this.uploadPendingTx(receiverWallet, transaction).catch(err=>console.log(err.message || err));
            }
          }

      });

      
      try {
        
        let response = await Database.api.request('subscribe', {
            accounts: [ this.securePlatformWallet.address ]
        });
        
        if (response.status === 'success') {
          console.log('Successfully subscribed');
        }
    
      } catch (err) {
        console.log(err.message || err);    
      }

    });

    

  }




  private async getDepositWallet(destinationTag:string){
    const db = admin.firestore();
    let snapshot = await db.collection(`altcoinWallets`)
      .where('currency','==','XRP')
      .where('searchable','==',this.securePlatformWallet.address.toLowerCase())
      .where('destinationTag','==',destinationTag)
      .limit(1)
      .get();

    if(snapshot.empty) return null;
    else return <depositWallet>snapshot.docs[0].data();
  }



  private async uploadPendingTx(wallet:depositWallet, transaction:any){
    const db = admin.firestore();

    if(!((this.txs['deposit'] as Array<any>).find(tx=> tx.currency=='XRP' && tx.searchable==transaction.hash.toLowerCase())) ){ //The pending transaction is not on DB yet
    
      const id = db.collection('uniqueID').doc().id;

      let txObj = {
        type: 'deposit',
        currency: 'XRP',
        status: 'pending',
        address: wallet.address,
        destinationTag:wallet.destinationTag,
        processed: false,
        txHash: transaction.hash,
        searchable: transaction.hash.toLowerCase(),
        id: id
      };

      await db.doc(`transactions/${id}`).set(txObj);

      this.txs['deposit'].push(txObj);

      return true;

    }else{ //The pending transaction is already on DB
      return true;
    }
  }



  private watchForTxsConfirmations(type:string){
    const db = admin.firestore();
    let interval = setInterval(async ()=>{

      if(this.txs[type]){

        for(let tx of this.txs[type]){
          let transaction = await xrpService.getTransaction(tx.txHash);

          if (transaction && transaction.TransactionType=='Payment' && 
            transaction.Destination.toLowerCase()==this.securePlatformWallet.address.toLowerCase() && 
            ((typeof transaction.meta.delivered_amount)=='string' || (typeof transaction.meta.delivered_amount)=='number') &&
            transaction.DestinationTag>0 && transaction.meta.TransactionResult=='tesSUCCESS' && transaction.validated
            ) { //If the tx exists 
          
            let receiverWallet = await this.getDepositWallet(transaction.DestinationTag);

            if(receiverWallet){
              console.log(`XRP received in platform wallet. Confirmed tx`);
              await this.sendRequest(transaction, tx).catch(err=>console.log(err.message || err));
            }
          }
        }
      }
    }, environment.blockchain.XRP.listenerTimer);
  }


  private async sendRequest(transaction:any, tx:any){
    console.log('Sending request to server...');
    const db = admin.firestore();

    let req = {
      currency: 'XRP',
      hash: transaction.hash,
      ledgerIndex: transaction.ledger_index,
      status: 'confirmed',
      from: transaction.Destination,
      destinationTag: transaction.DestinationTag,
      value: xrpService.toXRP(transaction.meta.delivered_amount)
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
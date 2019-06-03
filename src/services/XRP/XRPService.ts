import {environment} from '../../environments/environment';
import * as admin from "firebase-admin";
import {BigNumber} from 'bignumber.js';
import {Database} from "../Database";


export class XRPService{
  public createDepositWallet():Promise<any>{
    return new Promise(async (resolve,reject)=>{
      try {
        const db = admin.firestore();
        const batch = db.batch();
        const id = db.collection('uniqueID').doc().id;

        const destinationTag = (await db.doc('destinationTag/sequence').get()).data().number;

        batch.update(db.doc('destinationTag/sequence'),{
          number:destinationTag + 1
        });
        batch.set(db.doc(`altcoinWallets/${id}`), {
          currency:'XRP',
          address:environment.blockchain.XRP.securePlatformWallet.address,
          searchable:environment.blockchain.XRP.securePlatformWallet.address.toLowerCase(),
          destinationTag
        });

        await batch.commit();

        resolve({
          address:environment.blockchain.XRP.securePlatformWallet.address,
          destinationTag
        });


      } catch (err) {
        reject(err.message || err);
      }
    });
  };

  
  public async createPersonalWallet(){
    return Database.api.generateAddress();
  }


  public async transfer(from:string, secret:string, to:string, amount:string, destinationTag:number){
    return new Promise(async (resolve,reject)=>{

    

      const address = from;

      const payment = {
        source: {
          address: from,
          maxAmount: {
            value: this.toDrops(amount),
            currency: "drops"
          }
        },
        destination: {
          address: to,
          amount: {
            value: this.toDrops(amount),
            currency: "drops"
          }
        }
      };

      if(destinationTag) payment.destination['tag'] = destinationTag;
      
      const prepared  = await Database.api.preparePayment(address, payment);
      const signedTransaction = Database.api.sign(prepared.txJSON, secret).signedTransaction;

      let transaction = await Database.api.request('submit', {
        tx_blob:signedTransaction
      });

      if(transaction.engine_result=='tesSUCCESS'){
        resolve(transaction.tx_json.hash);

      }else{
        reject(transaction.engine_result_message);
      }
    });
  };


  public estimateFee(){
    return Database.api.getFee();
  }


  public toXRP(amount:number | string | BigNumber){
    return new BigNumber(amount).times(new BigNumber(10).pow(-6)).decimalPlaces(6).toString(10);
  }

  public toDrops(amount:number | string | BigNumber){
    return new BigNumber(amount).decimalPlaces(6).times(new BigNumber(10).pow(6)).toString(10);
  }

  public async getBalance(address:string){
    return (await Database.api.getBalances(address, { currency:'XRP'}))[0].value;
  }

  public getTransaction(hash:string):Promise<any>{
    return new Promise(async (resolve, reject)=>{

      try {
        let tx = await Database.api.request('tx', { transaction:hash });
        resolve(tx);
      } catch (err) {
        resolve(null);
      }
    
    });
  }







}
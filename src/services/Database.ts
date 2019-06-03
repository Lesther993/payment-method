import * as admin from "firebase-admin";
import {environment} from "../environments/environment";
import * as Ripple from 'ripple-lib';
const RippleAPI = Ripple.RippleAPI;
import { BehaviorSubject } from 'rxjs';

export let connectedToXRP = new BehaviorSubject(false);

export class Database {
	private config:any;
	public static api:Ripple.RippleAPI;

	constructor(){
		this.config = { 
		  credential: admin.credential.cert(environment.firebaseConfig.credential),
		  databaseURL: environment.firebaseConfig.databaseURL
		}
	}

	public async init() {
		admin.initializeApp(this.config);

		Database.api = new RippleAPI({
      server: environment.blockchain.XRP.socketURL // Public rippled server hosted by Ripple, Inc.
    });

    Database.api.on('connected', () => {
      console.log('Connected to the XRP Ledger');
    });

    Database.api.on('error', (err, message) => {
      console.log(err + ': ' + message);
    });

    Database.api.on('disconnected', (code) => {
      // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
      // will be 1000 if this was normal closure
      console.log('Disconnected, code:', code);
    });

    
		await Database.api.connect();
		connectedToXRP.next(true);
		
	}

}
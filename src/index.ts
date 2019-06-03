
import bodyParser = require('body-parser');
import cors = require('cors');
import * as express from 'express';


/*Database initialization */
import {Database} from "./services/Database";

let database = new Database();
database.init();

// Routes
// import {EthereumRoutes} from "./routes/EthereumRoutes";
import {AltcoinRoutes} from "./routes/AltcoinRoutes";
import {ListenerRoutes} from './routes/ListenerRoutes';
import {XRPRoutes} from './routes/XRPRoutes';



// Services
// import {Listener as ETH} from "./services/Ethereum/Listener";
import {Listener as Altcoin} from "./services/Altcoin/Listener";
import {Listener as XRP} from "./services/XRP/Listener";


// Express server
const app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// Cors Requests Security
let whitelist: any[] = [];
let corsOptions: any = {};



app.use(cors(corsOptions));


/*
* Set Port
* */

const PORT = process.env.PORT || 8080;


app.get('/', (req, res) => {
  res.send('Hello world :)');
});


// app.use('/ethereum', EthereumRoutes);

app.use('/altcoin', AltcoinRoutes);

app.use('/XRP', XRPRoutes);

app.use('/listener', ListenerRoutes);



//173.82.103.250

// const ETHlistener = new ETH();
// ETHlistener.watchForDeposits();

// const BCHListener = new Altcoin('BCH');
// BCHListener.watchForDeposits();

// const ZECListener = new Altcoin('ZEC');
// ZECListener.watchForDeposits();

// const PPCListener = new Altcoin('PPC');
// PPCListener.watchForDeposits();



//173.82.140.234

const LTCListener = new Altcoin('LTC');
LTCListener.watchForDeposits();

const BTCListener = new Altcoin('BTC');
BTCListener.watchForDeposits();

const DASHListener = new Altcoin('DASH');
DASHListener.watchForDeposits();

const DOGEListener = new Altcoin('DOGE');
DOGEListener.watchForDeposits();

const XRPListener = new XRP();
XRPListener.watchForDeposits();



// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});

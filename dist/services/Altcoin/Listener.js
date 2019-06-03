"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bitcoin = require('bitcoinjs-lib');
var zcash = require('zcashjs-lib');
var admin = require("firebase-admin");
var environment_1 = require("../../environments/environment");
var bignumber_js_1 = require("bignumber.js");
var AltcoinService_1 = require("./AltcoinService");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var node_fetch_1 = require("node-fetch");
var altcoinService = new AltcoinService_1.AltcoinService();
;
exports.txListener = new rxjs_1.BehaviorSubject({ currency: null, hash: null });
var Listener = (function () {
    function Listener(currency) {
        this.txs = {};
        this.currency = currency;
        this.securePlatformWallet = environment_1.environment.blockchain[currency].securePlatformWallet;
    }
    Listener.prototype.watchForDeposits = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getPendingTxs(this.currency, 'deposit')];
                    case 1:
                        _a.sent();
                        console.log('Txs downloaded!');
                        this.watchForPendingTxs(this.currency);
                        this.watchForTxsConfirmations(this.currency, 'deposit');
                        return [2];
                }
            });
        });
    };
    Listener.prototype.getPendingTxs = function (currency, type) {
        return __awaiter(this, void 0, void 0, function () {
            var db, querySnapshot;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = admin.firestore();
                        return [4, db.collection("transactions")
                                .where('type', '==', type)
                                .where('currency', '==', currency)
                                .where('status', '==', 'pending')
                                .get()];
                    case 1:
                        querySnapshot = _a.sent();
                        this.txs[type] = [];
                        querySnapshot.forEach(function (doc) { return _this.txs[type].push(doc.data()); });
                        return [2];
                }
            });
        });
    };
    Listener.prototype.watchForPendingTxs = function (currency) {
        var _this = this;
        exports.txListener.pipe(operators_1.filter(function (tx) { return tx.currency == currency && tx.hash; }), operators_1.tap(function (tx) { return __awaiter(_this, void 0, void 0, function () {
            var hash, transaction, _i, _a, vout, to, receiverWallet;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        hash = tx.hash;
                        return [4, altcoinService.getTransaction(currency, hash)];
                    case 1:
                        transaction = _b.sent();
                        if (!(transaction && transaction.vout)) return [3, 5];
                        _i = 0, _a = transaction.vout;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3, 5];
                        vout = _a[_i];
                        if (!(vout.scriptPubKey && vout.scriptPubKey.addresses && vout.scriptPubKey.addresses[0])) return [3, 4];
                        to = vout.scriptPubKey.addresses[0].toLowerCase();
                        if (currency == 'BCH')
                            to = to.substring(to.indexOf(':') + 1);
                        return [4, this.getDepositWallet(currency, to)];
                    case 3:
                        receiverWallet = _b.sent();
                        if (receiverWallet) {
                            console.log(currency + " deposited by user. Pending tx");
                            this.uploadPendingTx(currency, receiverWallet, transaction).catch(function (err) { return console.log(err.message || err); });
                        }
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3, 2];
                    case 5: return [2];
                }
            });
        }); })).subscribe();
    };
    Listener.prototype.getDepositWallet = function (currency, address) {
        return __awaiter(this, void 0, void 0, function () {
            var db, snapshot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = admin.firestore();
                        return [4, db.collection("altcoinWallets")
                                .where('currency', '==', currency)
                                .where('searchable', '==', address)
                                .limit(1)
                                .get()];
                    case 1:
                        snapshot = _a.sent();
                        if (snapshot.empty)
                            return [2, null];
                        else
                            return [2, snapshot.docs[0].data()];
                        return [2];
                }
            });
        });
    };
    Listener.prototype.uploadPendingTx = function (currency, wallet, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var db, id, txObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = admin.firestore();
                        if (!!(this.txs['deposit'].find(function (tx) { return tx.currency == currency && tx.searchable == transaction.txid.toLowerCase(); }))) return [3, 2];
                        id = db.collection('uniqueID').doc().id;
                        txObj = {
                            type: 'deposit',
                            currency: currency,
                            status: 'pending',
                            address: wallet.address,
                            processed: false,
                            txHash: transaction.txid,
                            searchable: transaction.txid.toLowerCase(),
                            id: id
                        };
                        return [4, db.doc("transactions/" + id).set(txObj)];
                    case 1:
                        _a.sent();
                        this.txs['deposit'].push(txObj);
                        return [2, true];
                    case 2: return [2, true];
                }
            });
        });
    };
    Listener.prototype.watchForTxsConfirmations = function (currency, type) {
        var _this = this;
        var db = admin.firestore();
        var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var _loop_1, this_1, _i, _a, tx;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.txs[type]) return [3, 4];
                        _loop_1 = function (tx) {
                            var transaction, _i, _a, vout, to, receiverWallet;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4, altcoinService.getTransaction(currency, tx.txHash)];
                                    case 1:
                                        transaction = _b.sent();
                                        if (!transaction) return [3, 8];
                                        if (!(transaction.confirmations >= 1)) return [3, 7];
                                        _i = 0, _a = transaction.vout;
                                        _b.label = 2;
                                    case 2:
                                        if (!(_i < _a.length)) return [3, 7];
                                        vout = _a[_i];
                                        to = vout.scriptPubKey.addresses[0].toLowerCase();
                                        if (currency == 'BCH')
                                            to = to.substring(to.indexOf(':') + 1);
                                        return [4, this_1.getDepositWallet(currency, to)];
                                    case 3:
                                        receiverWallet = _b.sent();
                                        if (!receiverWallet) return [3, 4];
                                        console.log(currency + " deposited by user. Confirmed tx");
                                        this_1.forwardMoney(currency, receiverWallet, tx).catch(function (err) { return console.log(err.message || err); });
                                        return [3, 6];
                                    case 4:
                                        if (!(to == this_1.securePlatformWallet.address.toLowerCase() && transaction.confirmations >= 2)) return [3, 6];
                                        console.log(currency + " received in platform wallet. Confirmed tx");
                                        return [4, this_1.sendRequest(currency, transaction, tx).catch(function (err) { return console.log(err.message || err); })];
                                    case 5:
                                        _b.sent();
                                        _b.label = 6;
                                    case 6:
                                        _i++;
                                        return [3, 2];
                                    case 7: return [3, 9];
                                    case 8:
                                        db.doc("transactions/" + tx.id).delete().then(function () { return _this.deleteTx(type, tx.id); }).catch(function (err) { return console.log(err.message || err); });
                                        _b.label = 9;
                                    case 9: return [2];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _a = this.txs[type];
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 4];
                        tx = _a[_i];
                        return [5, _loop_1(tx)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        }); }, environment_1.environment.blockchain[currency].listenerTimer);
    };
    Listener.prototype.forwardMoney = function (currency, wallet, tx) {
        return __awaiter(this, void 0, void 0, function () {
            var altcoin, txb, utxos, balance, _i, utxos_1, utxo, fee, decimalPlaces, estimatefeePerKb, amountToSend, keyPair, rawTx, i, hash, db, batch, id, txObj, req, db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        altcoin = currency == 'ZEC' ? zcash : bitcoin;
                        txb = new altcoin.TransactionBuilder(environment_1.environment.blockchain[currency].network);
                        if (currency == 'DASH')
                            txb.setVersion(2);
                        else
                            txb.setVersion(1);
                        return [4, altcoinService.listUnspentUTXO(currency, wallet.address)];
                    case 1:
                        utxos = _a.sent();
                        balance = '0';
                        for (_i = 0, utxos_1 = utxos; _i < utxos_1.length; _i++) {
                            utxo = utxos_1[_i];
                            balance = new bignumber_js_1.BigNumber(balance).plus(utxo.amount).toString(10);
                            txb.addInput(utxo.txid, utxo.vout);
                        }
                        decimalPlaces = currency == 'PPC' ? 6 : 8;
                        if (!(currency == 'ZEC')) return [3, 2];
                        fee = '0.0001';
                        return [3, 4];
                    case 2:
                        estimatefeePerKb = void 0;
                        return [4, altcoinService.estimatefeePerKb(currency)];
                    case 3:
                        estimatefeePerKb = (_a.sent()).feerate;
                        if (currency == 'KOD' && estimatefeePerKb <= 0)
                            estimatefeePerKb = 0.0005;
                        fee = new bignumber_js_1.BigNumber(+estimatefeePerKb).div(1000).times((utxos.length * 180) + (1 * 34) + 10 + utxos.length).decimalPlaces(decimalPlaces).toString(10);
                        _a.label = 4;
                    case 4:
                        if (!new bignumber_js_1.BigNumber(fee).isGreaterThan(0)) return [3, 16];
                        amountToSend = new bignumber_js_1.BigNumber(balance).minus(fee).decimalPlaces(decimalPlaces).toString(10);
                        if (!new bignumber_js_1.BigNumber(amountToSend).isGreaterThan(0)) return [3, 13];
                        console.log('Forwarding Altcoin to the platform wallet...');
                        txb.addOutput(this.securePlatformWallet[currency == 'BCH' ? 'legacyAddress' : 'address'], +altcoinService.toSatoshi(amountToSend, currency));
                        keyPair = void 0;
                        if (currency == 'KOD' || currency == 'PPC') {
                            keyPair = altcoin.ECPair.fromWIF(wallet.wif, environment_1.environment.blockchain[currency].network);
                        }
                        else {
                            keyPair = altcoin.ECPair.fromPrivateKey(Buffer.from(wallet.privateKey, 'hex'), { network: environment_1.environment.blockchain[currency].network });
                        }
                        rawTx = currency == 'BCH' ? txb.buildIncomplete().toHex() : '';
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < utxos.length)) return [3, 9];
                        if (!(currency == 'BCH')) return [3, 7];
                        return [4, altcoinService.signrawtransaction(currency, rawTx, keyPair.toWIF())];
                    case 6:
                        rawTx = (_a.sent()).hex;
                        return [3, 8];
                    case 7:
                        txb.sign(i, keyPair);
                        _a.label = 8;
                    case 8:
                        i++;
                        return [3, 5];
                    case 9: return [4, altcoinService.sendrawtransaction(currency, currency == 'BCH' ? rawTx : txb.build().toHex())];
                    case 10:
                        hash = _a.sent();
                        console.log('hash:', hash);
                        db = admin.firestore();
                        batch = db.batch();
                        id = db.collection('uniqueID').doc().id;
                        txObj = {
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
                        req = {
                            currency: currency,
                            hash: hash,
                            status: 'pending',
                            from: wallet.address,
                            to: this.securePlatformWallet.address,
                            fee: fee,
                            value: amountToSend
                        };
                        return [4, node_fetch_1.default(environment_1.environment.server.api, {
                                method: 'POST',
                                body: JSON.stringify(req),
                                headers: { 'Content-Type': 'application/json' },
                            })];
                    case 11:
                        _a.sent();
                        batch.set(db.doc("transactions/" + id), txObj);
                        batch.delete(db.doc("transactions/" + tx.id));
                        return [4, batch.commit()];
                    case 12:
                        _a.sent();
                        this.txs['deposit'].push(txObj);
                        this.deleteTx('deposit', tx.id);
                        return [2, true];
                    case 13:
                        console.log('Not enough balance:', balance, 'Deleting tx from DB');
                        db = admin.firestore();
                        return [4, db.doc("transactions/" + tx.id).delete()];
                    case 14:
                        _a.sent();
                        this.deleteTx('deposit', tx.id);
                        return [2, true];
                    case 15: return [3, 17];
                    case 16:
                        console.log('Wrong fee value:', fee);
                        _a.label = 17;
                    case 17: return [2];
                }
            });
        });
    };
    Listener.prototype.sendRequest = function (currency, transaction, tx) {
        return __awaiter(this, void 0, void 0, function () {
            var db, req;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Sending request to server...');
                        db = admin.firestore();
                        req = {
                            currency: currency,
                            hash: transaction.txid,
                            blockHash: transaction.blockhash,
                            status: 'confirmed',
                            from: tx.address,
                            to: this.securePlatformWallet.address,
                            fee: tx.fee,
                            value: transaction.vout[0].value.toString()
                        };
                        return [4, node_fetch_1.default(environment_1.environment.server.api, {
                                method: 'POST',
                                body: JSON.stringify(req),
                                headers: { 'Content-Type': 'application/json' },
                            })];
                    case 1:
                        _a.sent();
                        return [4, db.doc("transactions/" + tx.id).delete()];
                    case 2:
                        _a.sent();
                        this.deleteTx('deposit', tx.id);
                        console.log('Request sent');
                        return [2];
                }
            });
        });
    };
    Listener.prototype.deleteTx = function (type, id) {
        this.txs[type].splice(this.txs[type].findIndex(function (_tx) { return _tx.id == id; }), 1);
    };
    return Listener;
}());
exports.Listener = Listener;

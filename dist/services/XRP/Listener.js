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
var Database_1 = require("../Database");
var admin = require("firebase-admin");
var environment_1 = require("../../environments/environment");
var operators_1 = require("rxjs/operators");
var XRPService_1 = require("./XRPService");
var fetch = require('node-fetch');
var xrpService = new XRPService_1.XRPService();
;
var Listener = (function () {
    function Listener() {
        this.txs = {};
        this.securePlatformWallet = environment_1.environment.blockchain.XRP.securePlatformWallet;
    }
    Listener.prototype.watchForDeposits = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getPendingTxs('deposit')];
                    case 1:
                        _a.sent();
                        console.log('Txs downloaded!');
                        this.watchForPendingTxs();
                        this.watchForTxsConfirmations('deposit');
                        return [2];
                }
            });
        });
    };
    Listener.prototype.getPendingTxs = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var db, querySnapshot;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = admin.firestore();
                        return [4, db.collection("transactions")
                                .where('type', '==', type)
                                .where('currency', '==', 'XRP')
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
    Listener.prototype.watchForPendingTxs = function () {
        var _this = this;
        Database_1.connectedToXRP.pipe(operators_1.filter(function (bool) { return bool; })).subscribe(function () { return __awaiter(_this, void 0, void 0, function () {
            var response, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Database_1.Database.api.connection.on('transaction', function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var transaction, receiverWallet;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        transaction = result.transaction;
                                        if (!(result.type == 'transaction' && transaction.TransactionType == 'Payment' &&
                                            ((typeof transaction.Amount) == 'string' || (typeof transaction.Amount) == 'number') &&
                                            transaction.Destination.toLowerCase() == this.securePlatformWallet.address.toLowerCase() &&
                                            transaction.DestinationTag > 0)) return [3, 2];
                                        return [4, this.getDepositWallet(transaction.DestinationTag)];
                                    case 1:
                                        receiverWallet = _a.sent();
                                        if (receiverWallet) {
                                            console.log("XRP deposited by user. Pending tx");
                                            this.uploadPendingTx(receiverWallet, transaction).catch(function (err) { return console.log(err.message || err); });
                                        }
                                        _a.label = 2;
                                    case 2: return [2];
                                }
                            });
                        }); });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, Database_1.Database.api.request('subscribe', {
                                accounts: [this.securePlatformWallet.address]
                            })];
                    case 2:
                        response = _a.sent();
                        if (response.status === 'success') {
                            console.log('Successfully subscribed');
                        }
                        return [3, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.log(err_1.message || err_1);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        }); });
    };
    Listener.prototype.getDepositWallet = function (destinationTag) {
        return __awaiter(this, void 0, void 0, function () {
            var db, snapshot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = admin.firestore();
                        return [4, db.collection("altcoinWallets")
                                .where('currency', '==', 'XRP')
                                .where('searchable', '==', this.securePlatformWallet.address.toLowerCase())
                                .where('destinationTag', '==', destinationTag)
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
    Listener.prototype.uploadPendingTx = function (wallet, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var db, id, txObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = admin.firestore();
                        if (!!(this.txs['deposit'].find(function (tx) { return tx.currency == 'XRP' && tx.searchable == transaction.hash.toLowerCase(); }))) return [3, 2];
                        id = db.collection('uniqueID').doc().id;
                        txObj = {
                            type: 'deposit',
                            currency: 'XRP',
                            status: 'pending',
                            address: wallet.address,
                            destinationTag: wallet.destinationTag,
                            processed: false,
                            txHash: transaction.hash,
                            searchable: transaction.hash.toLowerCase(),
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
    Listener.prototype.watchForTxsConfirmations = function (type) {
        var _this = this;
        var db = admin.firestore();
        var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, tx, transaction, receiverWallet;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.txs[type]) return [3, 6];
                        _i = 0, _a = this.txs[type];
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 6];
                        tx = _a[_i];
                        return [4, xrpService.getTransaction(tx.txHash)];
                    case 2:
                        transaction = _b.sent();
                        if (!(transaction && transaction.TransactionType == 'Payment' &&
                            transaction.Destination.toLowerCase() == this.securePlatformWallet.address.toLowerCase() &&
                            ((typeof transaction.meta.delivered_amount) == 'string' || (typeof transaction.meta.delivered_amount) == 'number') &&
                            transaction.DestinationTag > 0 && transaction.meta.TransactionResult == 'tesSUCCESS' && transaction.validated)) return [3, 5];
                        return [4, this.getDepositWallet(transaction.DestinationTag)];
                    case 3:
                        receiverWallet = _b.sent();
                        if (!receiverWallet) return [3, 5];
                        console.log("XRP received in platform wallet. Confirmed tx");
                        return [4, this.sendRequest(transaction, tx).catch(function (err) { return console.log(err.message || err); })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3, 1];
                    case 6: return [2];
                }
            });
        }); }, environment_1.environment.blockchain.XRP.listenerTimer);
    };
    Listener.prototype.sendRequest = function (transaction, tx) {
        return __awaiter(this, void 0, void 0, function () {
            var db, req;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Sending request to server...');
                        db = admin.firestore();
                        req = {
                            currency: 'XRP',
                            hash: transaction.hash,
                            ledgerIndex: transaction.ledger_index,
                            status: 'confirmed',
                            from: transaction.Destination,
                            destinationTag: transaction.DestinationTag,
                            value: xrpService.toXRP(transaction.meta.delivered_amount)
                        };
                        return [4, fetch(environment_1.environment.server.api, {
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

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
var environment_1 = require("../../environments/environment");
var admin = require("firebase-admin");
var bignumber_js_1 = require("bignumber.js");
var Database_1 = require("../Database");
var XRPService = (function () {
    function XRPService() {
    }
    XRPService.prototype.createDepositWallet = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var db, batch, id, destinationTag, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        db = admin.firestore();
                        batch = db.batch();
                        id = db.collection('uniqueID').doc().id;
                        return [4, db.doc('destinationTag/sequence').get()];
                    case 1:
                        destinationTag = (_a.sent()).data().number;
                        batch.update(db.doc('destinationTag/sequence'), {
                            number: destinationTag + 1
                        });
                        batch.set(db.doc("altcoinWallets/" + id), {
                            currency: 'XRP',
                            address: environment_1.environment.blockchain.XRP.securePlatformWallet.address,
                            searchable: environment_1.environment.blockchain.XRP.securePlatformWallet.address.toLowerCase(),
                            destinationTag: destinationTag
                        });
                        return [4, batch.commit()];
                    case 2:
                        _a.sent();
                        resolve({
                            address: environment_1.environment.blockchain.XRP.securePlatformWallet.address,
                            destinationTag: destinationTag
                        });
                        return [3, 4];
                    case 3:
                        err_1 = _a.sent();
                        reject(err_1.message || err_1);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        }); });
    };
    ;
    XRPService.prototype.createPersonalWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, Database_1.Database.api.generateAddress()];
            });
        });
    };
    XRPService.prototype.transfer = function (from, secret, to, amount, destinationTag) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var address, payment, prepared, signedTransaction, transaction;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    address = from;
                                    payment = {
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
                                    if (destinationTag)
                                        payment.destination['tag'] = destinationTag;
                                    return [4, Database_1.Database.api.preparePayment(address, payment)];
                                case 1:
                                    prepared = _a.sent();
                                    signedTransaction = Database_1.Database.api.sign(prepared.txJSON, secret).signedTransaction;
                                    return [4, Database_1.Database.api.request('submit', {
                                            tx_blob: signedTransaction
                                        })];
                                case 2:
                                    transaction = _a.sent();
                                    if (transaction.engine_result == 'tesSUCCESS') {
                                        resolve(transaction.tx_json.hash);
                                    }
                                    else {
                                        reject(transaction.engine_result_message);
                                    }
                                    return [2];
                            }
                        });
                    }); })];
            });
        });
    };
    ;
    XRPService.prototype.estimateFee = function () {
        return Database_1.Database.api.getFee();
    };
    XRPService.prototype.toXRP = function (amount) {
        return new bignumber_js_1.BigNumber(amount).times(new bignumber_js_1.BigNumber(10).pow(-6)).decimalPlaces(6).toString(10);
    };
    XRPService.prototype.toDrops = function (amount) {
        return new bignumber_js_1.BigNumber(amount).decimalPlaces(6).times(new bignumber_js_1.BigNumber(10).pow(6)).toString(10);
    };
    XRPService.prototype.getBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, Database_1.Database.api.getBalances(address, { currency: 'XRP' })];
                    case 1: return [2, (_a.sent())[0].value];
                }
            });
        });
    };
    XRPService.prototype.getTransaction = function (hash) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var tx, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, Database_1.Database.api.request('tx', { transaction: hash })];
                    case 1:
                        tx = _a.sent();
                        resolve(tx);
                        return [3, 3];
                    case 2:
                        err_2 = _a.sent();
                        resolve(null);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
    return XRPService;
}());
exports.XRPService = XRPService;

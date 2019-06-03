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
var environment_1 = require("../../environments/environment");
var admin = require("firebase-admin");
var fetch = require('node-fetch');
var bignumber_js_1 = require("bignumber.js");
var coinSelect = require('coinselect');
var bchaddr = require('bchaddrjs');
var AltcoinService = (function () {
    function AltcoinService() {
    }
    AltcoinService.prototype.createDepositWallet = function (currency) {
        var _this = this;
        var db = admin.firestore();
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var altcoin, address, wif, keyPair, address, cashAddr, obj, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        altcoin = currency == 'ZEC' ? zcash : bitcoin;
                        if (!(currency == 'KOD' || currency == 'PPC')) return [3, 4];
                        return [4, this.handleRequest(currency, 'getnewaddress', 'depositWallets')];
                    case 1:
                        address = _a.sent();
                        return [4, this.handleRequest(currency, 'dumpprivkey', address)];
                    case 2:
                        wif = _a.sent();
                        return [4, db.collection('altcoinWallets').add({
                                currency: currency,
                                address: address,
                                searchable: address.toLowerCase(),
                                wif: wif
                            })];
                    case 3:
                        _a.sent();
                        resolve(address);
                        return [3, 7];
                    case 4:
                        keyPair = altcoin.ECPair.makeRandom({ network: environment_1.environment.blockchain[currency].network });
                        address = altcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: environment_1.environment.blockchain[currency].network }).address;
                        return [4, this.handleRequest(currency, 'importaddress', address, 'depositWallets', false)];
                    case 5:
                        _a.sent();
                        cashAddr = void 0;
                        if (currency == 'BCH')
                            cashAddr = bchaddr.toCashAddress(address);
                        obj = {
                            currency: currency,
                            address: currency == 'BCH' ? cashAddr.substring(cashAddr.indexOf(':') + 1) : address,
                            privateKey: keyPair.privateKey.toString('hex')
                        };
                        obj['searchable'] = obj.address.toLowerCase();
                        return [4, db.collection('altcoinWallets').add(obj)];
                    case 6:
                        _a.sent();
                        resolve(obj.address);
                        _a.label = 7;
                    case 7: return [3, 9];
                    case 8:
                        err_1 = _a.sent();
                        reject(err_1.message || err_1);
                        return [3, 9];
                    case 9: return [2];
                }
            });
        }); });
    };
    AltcoinService.prototype.createPersonalWallet = function (currency) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var altcoin, address, wif, keyPair, keyPair, address, cashAddr, obj, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        altcoin = currency == 'ZEC' ? zcash : bitcoin;
                        if (!(currency == 'KOD' || currency == 'PPC')) return [3, 3];
                        return [4, this.handleRequest(currency, 'getnewaddress', 'depositWallets')];
                    case 1:
                        address = _a.sent();
                        return [4, this.handleRequest(currency, 'dumpprivkey', address)];
                    case 2:
                        wif = _a.sent();
                        keyPair = altcoin.ECPair.fromWIF(wif, environment_1.environment.blockchain[currency].network);
                        resolve({
                            address: address,
                            privateKey: keyPair.privateKey.toString('hex')
                        });
                        return [3, 5];
                    case 3:
                        keyPair = altcoin.ECPair.makeRandom({ network: environment_1.environment.blockchain[currency].network });
                        address = altcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: environment_1.environment.blockchain[currency].network }).address;
                        return [4, this.handleRequest(currency, 'importaddress', address, 'depositWallets', false)];
                    case 4:
                        _a.sent();
                        cashAddr = void 0;
                        if (currency == 'BCH')
                            cashAddr = bchaddr.toCashAddress(address);
                        obj = {
                            currency: currency,
                            address: currency == 'BCH' ? cashAddr.substring(cashAddr.indexOf(':') + 1) : address,
                            privateKey: keyPair.privateKey.toString('hex')
                        };
                        obj['searchable'] = obj.address.toLowerCase();
                        resolve({
                            address: obj.address,
                            legacyAddress: currency == 'BCH' ? address : undefined,
                            privateKey: obj.privateKey
                        });
                        _a.label = 5;
                    case 5: return [3, 7];
                    case 6:
                        err_2 = _a.sent();
                        reject(err_2.message || err_2);
                        return [3, 7];
                    case 7: return [2];
                }
            });
        }); });
    };
    AltcoinService.prototype.transfer = function (currency, from, privateKey, to, amount) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var altcoin, zcashFee, utxos, balance, i, estimatefeePerKb, estimatefeeInSatoshiPerByte, _a, inputs, outputs, fee, _b, _c, _d, _e, txb_1, _i, outputs_1, output, _f, _g, keyPair, rawTx, i, hash, err_3;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 26, , 27]);
                        altcoin = currency == 'ZEC' ? zcash : bitcoin;
                        zcashFee = currency == 'ZEC' ? 0.0001 : 0;
                        return [4, this.listUnspentUTXO(currency, from)];
                    case 1:
                        utxos = _h.sent();
                        balance = '0';
                        for (i in utxos) {
                            utxos[i].value = +this.toSatoshi(utxos[i].amount, currency);
                            balance = new bignumber_js_1.BigNumber(balance).plus(utxos[i].amount).toString(10);
                            delete utxos[i].amount;
                        }
                        if (!new bignumber_js_1.BigNumber(balance).isGreaterThan(+amount + zcashFee)) return [3, 24];
                        estimatefeePerKb = void 0;
                        if (!(currency == 'ZEC')) return [3, 2];
                        estimatefeePerKb = 0;
                        return [3, 4];
                    case 2: return [4, this.estimatefeePerKb(currency)];
                    case 3:
                        estimatefeePerKb = (_h.sent()).feerate;
                        _h.label = 4;
                    case 4:
                        if (!(currency == 'ZEC' || (currency != 'ZEC' && estimatefeePerKb > 0))) return [3, 22];
                        estimatefeeInSatoshiPerByte = this.toSatoshi(new bignumber_js_1.BigNumber(estimatefeePerKb).div(1000), currency);
                        _b = coinSelect;
                        _c = [utxos];
                        _d = {};
                        if (!(currency == 'BCH')) return [3, 6];
                        return [4, this.toLegacyAddress(to)];
                    case 5:
                        _e = _h.sent();
                        return [3, 7];
                    case 6:
                        _e = to;
                        _h.label = 7;
                    case 7:
                        _a = _b.apply(void 0, _c.concat([[(_d.address = _e,
                                    _d.value = +this.toSatoshi(+amount + zcashFee, currency),
                                    _d)], +estimatefeeInSatoshiPerByte])), inputs = _a.inputs, outputs = _a.outputs, fee = _a.fee;
                        fee = this.toBitcoin(fee, currency);
                        txb_1 = new altcoin.TransactionBuilder(environment_1.environment.blockchain[currency].network);
                        if (currency == 'DASH')
                            txb_1.setVersion(2);
                        else
                            txb_1.setVersion(1);
                        inputs.forEach(function (input) { return txb_1.addInput(input.txid, input.vout); });
                        _i = 0, outputs_1 = outputs;
                        _h.label = 8;
                    case 8:
                        if (!(_i < outputs_1.length)) return [3, 15];
                        output = outputs_1[_i];
                        if (!!output.address) return [3, 12];
                        _f = output;
                        if (!(currency == 'BCH')) return [3, 10];
                        return [4, this.toLegacyAddress(from)];
                    case 9:
                        _g = _h.sent();
                        return [3, 11];
                    case 10:
                        _g = from;
                        _h.label = 11;
                    case 11:
                        _f.address = _g;
                        return [3, 13];
                    case 12:
                        output.value = +output.value - (+this.toSatoshi(zcashFee, currency));
                        _h.label = 13;
                    case 13:
                        txb_1.addOutput(output.address, output.value);
                        _h.label = 14;
                    case 14:
                        _i++;
                        return [3, 8];
                    case 15:
                        keyPair = altcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network: environment_1.environment.blockchain[currency].network });
                        rawTx = currency == 'BCH' ? txb_1.buildIncomplete().toHex() : '';
                        i = 0;
                        _h.label = 16;
                    case 16:
                        if (!(i < inputs.length)) return [3, 20];
                        if (!(currency == 'BCH')) return [3, 18];
                        return [4, this.signrawtransaction(currency, rawTx, keyPair.toWIF())];
                    case 17:
                        rawTx = (_h.sent()).hex;
                        return [3, 19];
                    case 18:
                        txb_1.sign(i, keyPair);
                        _h.label = 19;
                    case 19:
                        i++;
                        return [3, 16];
                    case 20: return [4, this.sendrawtransaction(currency, currency == 'BCH' ? rawTx : txb_1.build().toHex())];
                    case 21:
                        hash = _h.sent();
                        resolve(hash);
                        return [3, 23];
                    case 22:
                        reject("Wrong fee per Kb value: " + this.estimatefeePerKb);
                        _h.label = 23;
                    case 23: return [3, 25];
                    case 24:
                        reject('Insufficient funds');
                        _h.label = 25;
                    case 25: return [3, 27];
                    case 26:
                        err_3 = _h.sent();
                        reject(err_3.message || err_3);
                        return [3, 27];
                    case 27: return [2];
                }
            });
        }); });
    };
    AltcoinService.prototype.estimateFee = function (currency) {
        return __awaiter(this, void 0, void 0, function () {
            var estimatefeePerKb, decimalPlaces, fee;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (currency == 'ZEC')
                            return [2, 0.0001];
                        return [4, this.estimatefeePerKb(currency)];
                    case 1:
                        estimatefeePerKb = (_a.sent()).feerate;
                        decimalPlaces = currency == 'PPC' ? 6 : 8;
                        fee = new bignumber_js_1.BigNumber(+estimatefeePerKb).div(1000).times((1 * 180) + (1 * 34) + 10 + 1).decimalPlaces(decimalPlaces).toString(10);
                        return [2, fee];
                }
            });
        });
    };
    AltcoinService.prototype.estimatefeePerKb = function (currency) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(currency == 'BCH' || currency == 'KOD')) return [3, 2];
                        _a = {};
                        return [4, this.handleRequest(currency, 'estimatefee', 2)];
                    case 1: return [2, (_a.feerate = _b.sent(), _a)];
                    case 2:
                        if (currency == 'PPC')
                            return [2, { feerate: 0.01 }];
                        _b.label = 3;
                    case 3: return [2, this.handleRequest(currency, 'estimatesmartfee', 2)];
                }
            });
        });
    };
    AltcoinService.prototype.toBitcoin = function (amount, currency) {
        var decimalPlaces = currency == 'PPC' ? 6 : 8;
        return new bignumber_js_1.BigNumber(amount).times(new bignumber_js_1.BigNumber(10).pow(-decimalPlaces)).decimalPlaces(decimalPlaces).toString(10);
    };
    AltcoinService.prototype.toSatoshi = function (amount, currency) {
        var decimalPlaces = currency == 'PPC' ? 6 : 8;
        return new bignumber_js_1.BigNumber(amount).decimalPlaces(decimalPlaces).times(new bignumber_js_1.BigNumber(10).pow(decimalPlaces)).toString(10);
    };
    AltcoinService.prototype.toWIF = function (currency, privateKey) {
        return __awaiter(this, void 0, void 0, function () {
            var altcoin, keyPair;
            return __generator(this, function (_a) {
                altcoin = currency == 'ZEC' ? zcash : bitcoin;
                keyPair = altcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network: environment_1.environment.blockchain[currency].network });
                return [2, keyPair.toWIF()];
            });
        });
    };
    AltcoinService.prototype.toPrivateKey = function (currency, wif) {
        return __awaiter(this, void 0, void 0, function () {
            var altcoin, keyPair;
            return __generator(this, function (_a) {
                altcoin = currency == 'ZEC' ? zcash : bitcoin;
                keyPair = altcoin.ECPair.fromWIF(wif, environment_1.environment.blockchain[currency].network);
                return [2, keyPair.privateKey.toString('hex')];
            });
        });
    };
    AltcoinService.prototype.getBalance = function (currency, address) {
        return __awaiter(this, void 0, void 0, function () {
            var utxos, balance, _i, utxos_1, utxo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.listUnspentUTXO(currency, address)];
                    case 1:
                        utxos = (_a.sent());
                        balance = '0';
                        for (_i = 0, utxos_1 = utxos; _i < utxos_1.length; _i++) {
                            utxo = utxos_1[_i];
                            balance = new bignumber_js_1.BigNumber(balance).plus(utxo.amount).toString(10);
                        }
                        return [2, balance];
                }
            });
        });
    };
    AltcoinService.prototype.getBlock = function (currency, hashOrHeight) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (typeof hashOrHeight == 'string')
                            return [2, this.getBlockByHash(currency, hashOrHeight)];
                        _a = this.getBlockByHash;
                        _b = [currency];
                        return [4, this.getBlockHash(currency, hashOrHeight)];
                    case 1: return [2, _a.apply(this, _b.concat([(_c.sent())]))];
                }
            });
        });
    };
    AltcoinService.prototype.getBlockByHash = function (currency, hash) {
        return this.handleRequest(currency, 'getblock', hash);
    };
    AltcoinService.prototype.getBlockHash = function (currency, height) {
        return this.handleRequest(currency, 'getblockhash', height);
    };
    AltcoinService.prototype.getTransaction = function (currency, hash) {
        var verbose = (currency == 'ZEC' || currency == 'KOD' || currency == 'PPC') ? 1 : true;
        return this.handleRequest(currency, 'getrawtransaction', hash, verbose);
    };
    AltcoinService.prototype.listUnspentUTXO = function (currency, address) {
        return this.handleRequest(currency, 'listunspent', 1, 9999999, [address]);
    };
    AltcoinService.prototype.signrawtransaction = function (currency, rawTx, privateKey) {
        return this.handleRequest(currency, 'signrawtransaction', rawTx, null, [privateKey]);
    };
    AltcoinService.prototype.sendrawtransaction = function (currency, rawTx) {
        return this.handleRequest(currency, 'sendrawtransaction', rawTx);
    };
    AltcoinService.prototype.toLegacyAddress = function (address) {
        return new Promise(function (resolve, reject) {
            try {
                resolve(bchaddr.toLegacyAddress(address));
            }
            catch (err) {
                reject(err.message);
            }
        });
    };
    AltcoinService.prototype.handleRequest = function (currency, method) {
        var _this = this;
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var res, response, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4, fetch(environment_1.environment.blockchain[currency].nodeURL, {
                                method: 'POST',
                                body: JSON.stringify({
                                    id: "curltest",
                                    method: method,
                                    params: params
                                }),
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Basic dXNlcjpwYXNzd29yZA=='
                                },
                            })];
                    case 1:
                        res = _a.sent();
                        return [4, res.json()];
                    case 2:
                        response = _a.sent();
                        if (!response.error) {
                            resolve(response.result);
                        }
                        else {
                            if (method == 'getrawtransaction')
                                resolve(null);
                            else
                                reject(response.error.message);
                        }
                        return [3, 4];
                    case 3:
                        err_4 = _a.sent();
                        if (method == 'getrawtransaction')
                            resolve(null);
                        else
                            reject(err_4.message || err_4);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        }); });
    };
    AltcoinService.prototype.getBlockCypherfeePerKb = function (currency) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var res, response, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4, fetch("https://api.blockcypher.com/v1/" + currency.toLowerCase() + "/main", {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                            })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok) return [3, 3];
                        return [4, res.json()];
                    case 2:
                        response = _a.sent();
                        if (!response.error)
                            resolve(this.toBitcoin(response.high_fee_per_kb, currency));
                        else
                            reject(response.error.message || response.error);
                        return [3, 4];
                    case 3:
                        reject(res.statusText);
                        _a.label = 4;
                    case 4: return [3, 6];
                    case 5:
                        err_5 = _a.sent();
                        reject(err_5.message || err_5);
                        return [3, 6];
                    case 6: return [2];
                }
            });
        }); });
    };
    return AltcoinService;
}());
exports.AltcoinService = AltcoinService;

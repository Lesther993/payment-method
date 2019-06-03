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
var web3 = require("web3");
var Tx = require("ethereumjs-tx");
var admin = require("firebase-admin");
var ethereumjsWallet = require('ethereumjs-wallet');
var EthereumService = (function () {
    function EthereumService() {
        this.web3 = new web3();
        this.web3.setProvider(new web3.providers.HttpProvider(environment_1.environment.blockchain.ETH.nodeURL));
        if (this.web3.isConnected()) {
        }
        else {
            var err = new Error("A web3 valid instance must be provided");
            err.name = "Web3InstanceError";
            throw err;
        }
    }
    EthereumService.prototype.createDepositWallet = function () {
        var _this = this;
        var db = admin.firestore();
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var wallet, addresses, generatedETHWallet, _i, _a, token, generatedTokenWallet, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        wallet = {};
                        addresses = {};
                        generatedETHWallet = ethereumjsWallet.generate();
                        wallet['ETH'] = { address: generatedETHWallet.getAddressString().toLowerCase(), privateKey: this.cleanPrefix(generatedETHWallet.getPrivateKeyString()) };
                        addresses['ETH'] = wallet['ETH'].address;
                        for (_i = 0, _a = environment_1.environment.tokens; _i < _a.length; _i++) {
                            token = _a[_i];
                            generatedTokenWallet = ethereumjsWallet.generate();
                            wallet[token.symbol] = { address: generatedTokenWallet.getAddressString().toLowerCase(), privateKey: this.cleanPrefix(generatedTokenWallet.getPrivateKeyString()) };
                            addresses[token.symbol] = wallet[token.symbol].address;
                        }
                        return [4, db.collection('private').add({ wallet: wallet })];
                    case 1:
                        _b.sent();
                        resolve(addresses);
                        return [3, 3];
                    case 2:
                        err_1 = _b.sent();
                        reject('Unexpected error generating wallet. Try again later');
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
    EthereumService.prototype.createPersonalWallet = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var generatedWallet = ethereumjsWallet.generate();
                var ETHWallet = { address: generatedWallet.getAddressString().toLowerCase(), privateKey: _this.cleanPrefix(generatedWallet.getPrivateKeyString()) };
                resolve(ETHWallet);
            }
            catch (err) {
                reject('Unexpected error generating wallet. Try again later');
            }
        });
    };
    EthereumService.prototype.getTransaction = function (txHash) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    resolve(this.web3.eth.getTransaction(txHash));
                }
                catch (err) {
                    reject(err.message);
                }
                return [2];
            });
        }); });
    };
    EthereumService.prototype.getTransactionReceipt = function (txHash) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    resolve(this.web3.eth.getTransactionReceipt(txHash));
                }
                catch (err) {
                    reject(err.message);
                }
                return [2];
            });
        }); });
    };
    EthereumService.prototype.estimateFee = function (currency, from, to, amount) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var gasPrice = _this.web3.eth.gasPrice;
                var estimateGas = void 0;
                if (currency == 'ETH') {
                    estimateGas = 21000;
                }
                else {
                    var contractAddress = environment_1.environment.tokens.find(function (tokens) { return tokens.symbol == currency; }).contractAddress;
                    var myContractInstance = _this.web3.eth.contract(environment_1.environment.contractABI).at(contractAddress);
                    estimateGas = myContractInstance.transfer.estimateGas(to, amount, { from: from });
                }
                var fee = gasPrice * estimateGas;
                resolve({ gasPrice: gasPrice, gasCost: estimateGas, fee: fee });
            }
            catch (err) {
                reject(err.message);
            }
        });
    };
    EthereumService.prototype.transfer = function (currency, from, privateKey, to, amount, _gasPrice, gasLimit) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var gasPrice = _gasPrice;
                var estimateGas = gasLimit;
                if (!gasPrice) {
                    gasPrice = _this.web3.eth.gasPrice;
                }
                if (!estimateGas) {
                    if (currency == 'ETH') {
                        estimateGas = _this.web3.eth.estimateGas({
                            from: from,
                            to: to,
                            value: _this.web3.toHex(amount)
                        });
                    }
                    else {
                        var contractAddress = environment_1.environment.tokens.find(function (tokens) { return tokens.symbol == currency; }).contractAddress;
                        var myContractInstance = _this.web3.eth.contract(environment_1.environment.contractABI).at(contractAddress);
                        estimateGas = Math.round(1.25 * myContractInstance.transfer.estimateGas(to, amount, { from: from }));
                    }
                }
                var rawTx = {
                    nonce: _this.web3.toHex(_this.web3.eth.getTransactionCount(from)),
                    gasPrice: _this.web3.toHex(gasPrice),
                    gasLimit: _this.web3.toHex(estimateGas)
                };
                if (currency == 'ETH') {
                    rawTx.to = to;
                    rawTx.value = _this.web3.toHex(amount);
                }
                else {
                    var contractAddress = environment_1.environment.tokens.find(function (tokens) { return tokens.symbol == currency; }).contractAddress;
                    var myContractInstance = _this.web3.eth.contract(environment_1.environment.contractABI).at(contractAddress);
                    rawTx.to = contractAddress;
                    rawTx.value = '0x00';
                    rawTx.data = myContractInstance.transfer.getData(to, amount);
                }
                var tx = new Tx(rawTx);
                tx.sign(Buffer.from(privateKey, 'hex'));
                var serializedTx = "0x" + tx.serialize().toString('hex');
                _this.web3.eth.sendRawTransaction(serializedTx, function (err, hash) {
                    if (err) {
                        reject(String(err));
                    }
                    else {
                        resolve(hash);
                    }
                });
            }
            catch (err) {
                reject(err.message);
            }
        });
    };
    EthereumService.prototype.approve = function (currency, from, privateKey, spender, amount, _gasPrice, gasLimit) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var gasPrice = _gasPrice;
                var estimateGas = gasLimit;
                var contractAddress = environment_1.environment.tokens.find(function (tokens) { return tokens.symbol == currency; }).contractAddress;
                var myContractInstance = _this.web3.eth.contract(environment_1.environment.contractABI).at(contractAddress);
                if (!gasPrice) {
                    gasPrice = _this.web3.eth.gasPrice;
                }
                if (!estimateGas) {
                    estimateGas = Math.round(1.25 * myContractInstance.approve.estimateGas(spender, amount, { from: from }));
                }
                var rawTx = {
                    nonce: _this.web3.toHex(_this.web3.eth.getTransactionCount(from)),
                    gasPrice: _this.web3.toHex(gasPrice),
                    gasLimit: _this.web3.toHex(estimateGas),
                    to: contractAddress,
                    value: '0x00',
                    data: myContractInstance.approve.getData(spender, amount)
                };
                var tx = new Tx(rawTx);
                tx.sign(Buffer.from(privateKey, 'hex'));
                var serializedTx = "0x" + tx.serialize().toString('hex');
                _this.web3.eth.sendRawTransaction(serializedTx, function (err, hash) {
                    if (err) {
                        reject(String(err));
                    }
                    else {
                        resolve(hash);
                    }
                });
            }
            catch (err) {
                reject(err.message);
            }
        });
    };
    EthereumService.prototype.transferFrom = function (currency, from, privateKey, recipient, to, amount, _gasPrice, gasLimit) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var gasPrice = _gasPrice;
                var estimateGas = gasLimit;
                var contractAddress = environment_1.environment.tokens.find(function (tokens) { return tokens.symbol == currency; }).contractAddress;
                var myContractInstance = _this.web3.eth.contract(environment_1.environment.contractABI).at(contractAddress);
                if (!gasPrice) {
                    gasPrice = _this.web3.eth.gasPrice;
                }
                if (!estimateGas) {
                    estimateGas = Math.round(1.25 * myContractInstance.transferFrom.estimateGas(recipient, to, amount, { from: from }));
                }
                var rawTx = {
                    nonce: _this.web3.toHex(_this.web3.eth.getTransactionCount(from)),
                    gasPrice: _this.web3.toHex(gasPrice),
                    gasLimit: _this.web3.toHex(estimateGas),
                    to: contractAddress,
                    value: '0x00',
                    data: myContractInstance.transferFrom.getData(recipient, to, amount)
                };
                var tx = new Tx(rawTx);
                tx.sign(Buffer.from(privateKey, 'hex'));
                var serializedTx = "0x" + tx.serialize().toString('hex');
                _this.web3.eth.sendRawTransaction(serializedTx, function (err, hash) {
                    if (err) {
                        reject(String(err));
                    }
                    else {
                        resolve(hash);
                    }
                });
            }
            catch (err) {
                reject(err.message);
            }
        });
    };
    EthereumService.prototype.balanceOf = function (currency, address) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var contractAddress = environment_1.environment.tokens.find(function (tokens) { return tokens.symbol == currency; }).contractAddress;
                var myContractInstance = _this.web3.eth.contract(environment_1.environment.contractABI).at(contractAddress);
                resolve(myContractInstance.balanceOf(address));
            }
            catch (err) {
                reject(err.message);
            }
        });
    };
    EthereumService.prototype.getBalances = function (address) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var batch = _this.web3.createBatch();
                var balances_1 = {};
                batch.add(_this.web3.eth.getBalance.request(function (err, response) {
                    if (!err) {
                        balances_1['ETH'] = response;
                    }
                    else {
                        reject(String(err));
                    }
                }));
                var _loop_1 = function (i) {
                    var token = environment_1.environment.tokens[i];
                    var myContractInstance = _this.web3.eth.contract(environment_1.environment.contractABI).at(token.contractAddress);
                    batch.add(myContractInstance.balanceOf(address).request(function (err, response) {
                        if (!err) {
                            balances_1[token.symbol] = response;
                            if (Number(i) == environment_1.environment.tokens.length - 1) {
                                resolve(balances_1);
                            }
                        }
                        else {
                            reject(String(err));
                        }
                    }));
                };
                for (var i in environment_1.environment.tokens) {
                    _loop_1(i);
                }
                batch.execute();
            }
            catch (err) {
                reject(err.message);
            }
        });
    };
    EthereumService.prototype.allowance = function (currency, from, spender) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var contractAddress = environment_1.environment.tokens.find(function (tokens) { return tokens.symbol == currency; }).contractAddress;
                var myContractInstance = _this.web3.eth.contract(environment_1.environment.contractABI).at(contractAddress);
                resolve(myContractInstance.allowance(from, spender));
            }
            catch (err) {
                return (err.message);
            }
        });
    };
    EthereumService.prototype.getTokenTransactions = function (currency, address) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var contractAddress = environment_1.environment.tokens.find(function (tokens) { return tokens.symbol == currency; }).contractAddress;
                var myContractInstance = _this.web3.eth.contract(environment_1.environment.contractABI).at(contractAddress);
                var events = myContractInstance.Transfer({ from: address }, { fromBlock: 0, toBlock: 'latest' });
                events.get(function (err, results) {
                    if (!err) {
                        resolve(results);
                    }
                    else {
                        reject('Error loading list. Try again later');
                    }
                });
            }
            catch (err) {
                return (err.message);
            }
        });
    };
    EthereumService.prototype.cleanPrefix = function (data) {
        return data.indexOf('0x') == 0 ? data.substring(2) : data;
    };
    return EthereumService;
}());
exports.EthereumService = EthereumService;

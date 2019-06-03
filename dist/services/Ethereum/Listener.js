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
var EthereumService_1 = require("./EthereumService");
var web3 = require("web3");
var admin = require("firebase-admin");
var abiDecoder = require("abi-decoder");
var bignumber_js_1 = require("bignumber.js");
var node_fetch_1 = require("node-fetch");
var ethereumService = new EthereumService_1.EthereumService();
var securePlatformWallet = environment_1.environment.blockchain.ETH.securePlatformWallet;
var Listener = (function () {
    function Listener() {
        this.web3 = new web3();
        this.web3.setProvider(new web3.providers.HttpProvider(environment_1.environment.blockchain.ETH.nodeURL));
        abiDecoder.addABI(environment_1.environment.contractABI);
        if (this.web3.isConnected()) {
            console.log('Connected to the Ethereum network');
        }
        else {
            var err = new Error("A web3 valid instance must be provided");
            err.name = "Web3InstanceError";
            throw err;
        }
    }
    Listener.prototype.watchForDeposits = function () {
        this.getDepositWallets();
        this.watchForConfirmedDeposits();
    };
    Listener.prototype.getDepositWallets = function () {
        var _this = this;
        var db = admin.firestore();
        db.collection("private")
            .onSnapshot(function (querySnapshot) {
            _this.wallets = [];
            querySnapshot.forEach(function (doc) {
                var data = doc.data();
                data.uid = doc.id;
                _this.wallets.push(data);
            });
        });
    };
    Listener.prototype.watchForConfirmedDeposits = function () {
        var _this = this;
        var filter = this.web3.eth.filter('latest');
        filter.watch(function (err, hash) {
            if (!err) {
                var confirmedBlock = _this.web3.eth.getBlock(_this.web3.eth.getBlock(hash).number - 11, true);
                if (confirmedBlock.transactions.length > 0 && _this.wallets && _this.wallets.length > 0) {
                    var _loop_1 = function (transaction) {
                        try {
                            if (transaction.to) {
                                var receiver_1 = transaction.to.toLowerCase();
                                var _a = _this.findETHReceiverWallet(receiver_1), userETHWallet = _a[0], userTokenWallet = _a[1], currency = _a[2];
                                var tokenContractCalled = environment_1.environment.tokens.find(function (tokens) { return tokens.contractAddress.toLowerCase() == receiver_1; });
                                if (userETHWallet && receiver_1 != securePlatformWallet.address.toLowerCase()) {
                                    console.log('ETH deposited by user');
                                    _this.forwardMoney('ETH', userETHWallet, transaction);
                                }
                                else if (userTokenWallet && transaction.from.toLowerCase() == securePlatformWallet.address.toLowerCase() && receiver_1 != securePlatformWallet.address.toLowerCase()) {
                                    console.log('ETH sent by platform to approve forward the token');
                                    _this.approve(currency, userTokenWallet.wallet[currency], userTokenWallet.wallet[currency].feeToApprove, transaction);
                                }
                                else if (receiver_1 == securePlatformWallet.address.toLowerCase()) {
                                    console.log('ETH received in platform wallet');
                                    _this.sendRequest('ETH', transaction);
                                }
                                else if (tokenContractCalled && transaction.input.length > 2) {
                                    var decodedData = abiDecoder.decodeMethod(transaction.input);
                                    var currency_1 = tokenContractCalled.symbol;
                                    if (_this.isTokenTransfer(decodedData)) {
                                        var _b = _this.getTransferParams(decodedData), from = _b.from, to_1 = _b.to, amount = _b.amount;
                                        var userTokenWallet_1 = _this.wallets.find(function (item) { return (item.wallet[currency_1] && item.wallet[currency_1].address == to_1.toLowerCase()); });
                                        if (userTokenWallet_1 && to_1.toLowerCase() != securePlatformWallet.address.toLowerCase()) {
                                            console.log('Token transfer detected');
                                            console.log('Token deposited by user');
                                            _this.forwardMoney(currency_1, userTokenWallet_1, transaction);
                                        }
                                        else if (to_1.toLowerCase() == securePlatformWallet.address.toLowerCase()) {
                                            console.log('Token transfer detected');
                                            console.log('Token received in platform wallet');
                                            transaction.token = { from: from, to: to_1, amount: amount };
                                            _this.sendRequest(tokenContractCalled.symbol, transaction);
                                        }
                                    }
                                    else if (_this.isTokenApproval(decodedData)) {
                                        var _c = _this.getApprovalParams(decodedData), spender = _c.spender, amount = _c.amount;
                                        var userTokenWallet_2 = _this.wallets.find(function (item) { return (item.wallet[currency_1] && item.wallet[currency_1].address == transaction.from.toLowerCase()); });
                                        if (userTokenWallet_2 && spender.toLowerCase() == securePlatformWallet.address.toLowerCase()) {
                                            console.log('Token approval detected');
                                            _this.forwardMoney(currency_1, userTokenWallet_2, transaction);
                                        }
                                    }
                                }
                            }
                        }
                        catch (e) {
                            console.log(e.message || e);
                        }
                    };
                    for (var _i = 0, _a = confirmedBlock.transactions; _i < _a.length; _i++) {
                        var transaction = _a[_i];
                        _loop_1(transaction);
                    }
                }
            }
            else {
                throw new Error(err.message || err);
            }
        });
    };
    Listener.prototype.forwardMoney = function (currency, userWallet, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, txStatus, gasPrice, balance, gasLimit, fee, amountToSend, contractAddress, myContractInstance, amountToSend, totalAmountToForward, gasPrice, gasLimit, db, feeToSave, feeToApprove;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wallet = userWallet.wallet[currency];
                        txStatus = this.web3.eth.getTransactionReceipt(transaction.hash).status;
                        if (!(txStatus == '0x1')) return [3, 5];
                        if (!(currency == 'ETH')) return [3, 1];
                        gasPrice = this.web3.eth.gasPrice.toString(10);
                        balance = this.web3.eth.getBalance(wallet.address).toString(10);
                        gasLimit = '21000';
                        fee = new bignumber_js_1.BigNumber(gasPrice).times(gasLimit).toString(10);
                        amountToSend = new bignumber_js_1.BigNumber(balance).minus(fee).toString(10);
                        if (new bignumber_js_1.BigNumber(amountToSend).isGreaterThan(0)) {
                            console.log('Forwarding ETH to the platform wallet...');
                            ethereumService.transfer(currency, wallet.address, wallet.privateKey, securePlatformWallet.address, amountToSend, gasPrice, gasLimit);
                        }
                        else {
                        }
                        return [3, 5];
                    case 1:
                        contractAddress = environment_1.environment.tokens.find(function (tokens) { return tokens.symbol == currency; }).contractAddress;
                        myContractInstance = this.web3.eth.contract(environment_1.environment.contractABI).at(contractAddress);
                        amountToSend = myContractInstance.balanceOf(wallet.address).toString(10);
                        if (!new bignumber_js_1.BigNumber(amountToSend).isGreaterThan(0)) return [3, 5];
                        if (!new bignumber_js_1.BigNumber(myContractInstance.allowance(wallet.address, securePlatformWallet.address)).isGreaterThanOrEqualTo(amountToSend)) return [3, 2];
                        console.log('Forwarding token to the platform wallet...');
                        ethereumService.transferFrom(currency, securePlatformWallet.address, securePlatformWallet.privateKey, wallet.address, securePlatformWallet.address, amountToSend);
                        return [3, 4];
                    case 2:
                        console.log("Platform is not allowed to forward tokens. Sending ETH to the user deposit wallet to set approval for " + currency + "...");
                        totalAmountToForward = new bignumber_js_1.BigNumber(2).pow(256).minus(1).toString(10);
                        gasPrice = this.web3.eth.gasPrice.toString(10);
                        gasLimit = String(Math.round(1.25 * myContractInstance.approve.estimateGas(securePlatformWallet.address, totalAmountToForward, { from: wallet.address })));
                        db = admin.firestore();
                        feeToSave = {};
                        feeToSave["wallet." + currency + ".feeToApprove"] = { gasPrice: gasPrice, gasLimit: gasLimit };
                        return [4, db.doc("private/" + userWallet.uid).update(feeToSave)];
                    case 3:
                        _a.sent();
                        feeToApprove = new bignumber_js_1.BigNumber(gasLimit).times(gasPrice).toString(10);
                        ethereumService.transfer('ETH', securePlatformWallet.address, securePlatformWallet.privateKey, wallet.address, feeToApprove);
                        _a.label = 4;
                    case 4: return [3, 5];
                    case 5: return [2];
                }
            });
        });
    };
    Listener.prototype.approve = function (currency, wallet, feeToApprove, transaction) {
        var txStatus = this.web3.eth.getTransactionReceipt(transaction.hash).status;
        var contractAddress = environment_1.environment.tokens.find(function (tokens) { return tokens.symbol == currency; }).contractAddress;
        var myContractInstance = this.web3.eth.contract(environment_1.environment.contractABI).at(contractAddress);
        if (txStatus == '0x1') {
            var allowedAmount = myContractInstance.allowance(wallet.address, securePlatformWallet.address);
            if (new bignumber_js_1.BigNumber(allowedAmount).isEqualTo(0)) {
                console.log("Approving user wallet to forward tokens for " + currency + "..");
                var totalAmountToForward = new bignumber_js_1.BigNumber(2).pow(256).minus(1).toString(10);
                ethereumService.approve(currency, wallet.address, wallet.privateKey, securePlatformWallet.address, totalAmountToForward, feeToApprove.gasPrice, feeToApprove.gasLimit);
            }
            else if (new bignumber_js_1.BigNumber(allowedAmount).isLessThan(myContractInstance.balanceOf(wallet.address))) {
                console.log("Approving user wallet to forward tokens for " + currency + "..");
                var totalAmountToForward = new bignumber_js_1.BigNumber(2).pow(256).minus(1).toString(10);
                ethereumService.approve(currency, wallet.address, wallet.privateKey, securePlatformWallet.address, totalAmountToForward, feeToApprove.gasPrice, feeToApprove.gasLimit);
            }
        }
    };
    Listener.prototype.isTokenTransfer = function (decodedData) {
        return (decodedData.name == 'transfer' || decodedData.name == 'transferFrom');
    };
    Listener.prototype.isTokenApproval = function (decodedData) {
        return (decodedData.name == 'approve');
    };
    Listener.prototype.getTransferParams = function (decodedData) {
        var from = decodedData.params.find(function (param) { return param.name == '_from'; }) ? decodedData.params.find(function (param) { return param.name == '_from'; }).value : null;
        var to = decodedData.params.find(function (param) { return param.name == '_to'; }).value;
        var amount = decodedData.params.find(function (param) { return param.name == '_value'; }) ? decodedData.params.find(function (param) { return param.name == '_value'; }).value : decodedData.params.find(function (param) { return param.name == '_amount'; }).value;
        return { from: from, to: to, amount: amount };
    };
    Listener.prototype.getApprovalParams = function (decodedData) {
        var spender = decodedData.params.find(function (param) { return param.name == '_spender'; }).value;
        var amount = decodedData.params.find(function (param) { return param.name == '_value'; }) ? decodedData.params.find(function (param) { return param.name == '_value'; }).value : decodedData.params.find(function (param) { return param.name == '_amount'; }).value;
        return { spender: spender, amount: amount };
    };
    Listener.prototype.findETHReceiverWallet = function (receiver) {
        var userETHWallet;
        var userTokenWallet;
        var currency;
        top: for (var _i = 0, _a = this.wallets; _i < _a.length; _i++) {
            var item = _a[_i];
            for (var symbol in item.wallet) {
                if (receiver == item.wallet[symbol].address) {
                    if (symbol == 'ETH') {
                        userETHWallet = item;
                    }
                    else {
                        userTokenWallet = item;
                        currency = symbol;
                    }
                    break top;
                }
            }
        }
        return [userETHWallet, userTokenWallet, currency];
    };
    Listener.prototype.sendRequest = function (currency, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionReceipt, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Sending request to server...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        transactionReceipt = this.web3.eth.getTransactionReceipt(transaction.hash);
                        transaction.status = transactionReceipt.status;
                        transaction.gasUsed = transactionReceipt.gasUsed;
                        transaction.currency = currency;
                        delete transaction.gas, delete transaction.publicKey, delete transaction.r, delete transaction.raw, delete transaction.s,
                            delete transaction.standardV, delete transaction.chainId, delete transaction.condition, delete transaction.creates;
                        delete transaction.v;
                        return [4, node_fetch_1.default(environment_1.environment.server.api, {
                                method: 'POST',
                                body: JSON.stringify(transaction),
                                headers: { 'Content-Type': 'application/json' },
                            })];
                    case 2:
                        _a.sent();
                        return [3, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.log('Error sending request:', err_1.message || err_1);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    return Listener;
}());
exports.Listener = Listener;

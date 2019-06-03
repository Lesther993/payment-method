"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var EthereumService_1 = require("../services/Ethereum/EthereumService");
var EthereumRoutes = express.Router();
exports.EthereumRoutes = EthereumRoutes;
var ethereumService = new EthereumService_1.EthereumService();
EthereumRoutes.route('/createDepositWallet').post(function (req, res) {
    ethereumService.createDepositWallet()
        .then(function (response) {
        res.send({ success: true, data: response, error: null });
    })
        .catch(function (err) {
        res.send({ success: false, data: null, error: { message: err } });
    });
});
EthereumRoutes.route('/createPersonalWallet').post(function (req, res) {
    ethereumService.createPersonalWallet()
        .then(function (response) {
        res.send({ success: true, data: response, error: null });
    })
        .catch(function (err) {
        res.send({ success: false, data: null, error: { message: err } });
    });
});
EthereumRoutes.route('/estimateFee').post(function (req, res) {
    if (req.body.currency) {
        ethereumService.estimateFee(req.body.currency, req.body.from, req.body.to, req.body.amount)
            .then(function (txHash) {
            res.send({ success: true, data: txHash, error: null });
        })
            .catch(function (err) {
            res.send({ success: false, data: null, error: { message: err } });
        });
    }
    else {
        res.send({ success: false, data: null, error: { message: "missing parameters" } });
    }
});
EthereumRoutes.route('/getTransaction').post(function (req, res) {
    if (req.body.txHash) {
        ethereumService.getTransaction(req.body.txHash)
            .then(function (response) {
            res.send({ success: true, data: response, error: null });
        })
            .catch(function (err) {
            res.send({ success: false, data: null, error: { message: err } });
        });
    }
    else {
        res.send({ success: false, data: null, error: { message: "missing parameters" } });
    }
});
EthereumRoutes.route('/getTransactionReceipt').post(function (req, res) {
    if (req.body.txHash) {
        ethereumService.getTransactionReceipt(req.body.txHash)
            .then(function (response) {
            res.send({ success: true, data: response, error: null });
        })
            .catch(function (err) {
            res.send({ success: false, data: null, error: { message: err } });
        });
    }
    else {
        res.send({ success: false, data: null, error: { message: "missing parameters" } });
    }
});
EthereumRoutes.route('/getBalances').post(function (req, res) {
    if (req.body.address) {
        ethereumService.getBalances(req.body.address)
            .then(function (response) {
            res.send({ success: true, data: response, error: null });
        })
            .catch(function (err) {
            res.send({ success: false, data: null, error: { message: err } });
        });
    }
    else {
        res.send({ success: false, data: null, error: { message: "missing parameters" } });
    }
});
EthereumRoutes.route('/transfer').post(function (req, res) {
    if (req.body.currency && req.body.from && req.body.privateKey && req.body.to && req.body.amount) {
        ethereumService.transfer(req.body.currency, req.body.from, req.body.privateKey, req.body.to, req.body.amount, req.body.gasPrice, req.body.gasLimit)
            .then(function (txHash) {
            res.send({ success: true, data: txHash, error: null });
        })
            .catch(function (err) {
            res.send({ success: false, data: null, error: { message: err } });
        });
    }
    else {
        res.send({ success: false, data: null, error: { message: "missing parameters" } });
    }
});
EthereumRoutes.route('/approve').post(function (req, res) {
    if (req.body.currency && req.body.from && req.body.privateKey && req.body.spender && req.body.amount) {
        ethereumService.approve(req.body.currency, req.body.from, req.body.privateKey, req.body.spender, req.body.amount, req.body.gasPrice, req.body.gasLimit)
            .then(function (txHash) {
            res.send({ success: true, data: txHash, error: null });
        })
            .catch(function (err) {
            res.send({ success: false, data: null, error: { message: err } });
        });
    }
    else {
        res.send({ success: false, data: null, error: { message: "missing parameters" } });
    }
});
EthereumRoutes.route('/transferFrom').post(function (req, res) {
    if (req.body.currency && req.body.from && req.body.privateKey && req.body.recipient && req.body.to && req.body.amount) {
        ethereumService.transferFrom(req.body.currency, req.body.from, req.body.privateKey, req.body.recipient, req.body.to, req.body.amount, req.body.gasPrice, req.body.gasLimit)
            .then(function (txHash) {
            res.send({ success: true, data: txHash, error: null });
        })
            .catch(function (err) {
            res.send({ success: false, data: null, error: { message: err } });
        });
    }
    else {
        res.send({ success: false, data: null, error: { message: "missing parameters" } });
    }
});
EthereumRoutes.route('/balanceOf').post(function (req, res) {
    if (req.body.currency && req.body.address) {
        ethereumService.balanceOf(req.body.currency, req.body.address)
            .then(function (response) { return res.send({ success: true, data: response, error: null }); })
            .catch(function (err) { return res.send({ success: false, data: null, error: { message: err } }); });
    }
    else {
        res.send({ success: false, data: null, error: 'Missing parameters' });
    }
});
EthereumRoutes.route('/allowance').post(function (req, res) {
    if (req.body.currency && req.body.from && req.body.spender) {
        ethereumService.allowance(req.body.currency, req.body.from, req.body.spender)
            .then(function (response) { return res.send({ success: true, data: response, error: null }); })
            .catch(function (err) { return res.send({ success: false, data: null, error: { message: err } }); });
    }
    else {
        res.send({ success: false, data: null, error: 'Missing parameters' });
    }
});
EthereumRoutes.route('/getTokenTransactions').post(function (req, res) {
    if (req.body.currency && req.body.address) {
        ethereumService.getTokenTransactions(req.body.currency, req.body.address)
            .then(function (response) { return res.send({ success: true, data: response, error: null }); })
            .catch(function (err) { return res.send({ success: false, data: null, error: { message: err } }); });
    }
    else {
        res.send({ success: false, data: null, error: 'Missing parameters' });
    }
});
EthereumRoutes.route('/server').post(function (req, res) {
    res.send(true);
    console.log('Incoming transaction:', req.body);
});

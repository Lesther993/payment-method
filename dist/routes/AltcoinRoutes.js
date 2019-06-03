"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var AltcoinService_1 = require("../services/Altcoin/AltcoinService");
var AltcoinRoutes = express.Router();
exports.AltcoinRoutes = AltcoinRoutes;
var altcoinService = new AltcoinService_1.AltcoinService();
AltcoinRoutes.route('/createDepositWallet').post(function (req, res) {
    if (req.body.currency) {
        altcoinService.createDepositWallet(req.body.currency.toUpperCase())
            .then(function (response) {
            res.send({ success: true, data: response, error: null });
        })
            .catch(function (err) {
            res.send({ success: false, data: null, error: { message: err } });
        });
    }
    else {
        res.send({ success: false, data: null, error: 'Missing parameters' });
    }
});
AltcoinRoutes.route('/createPersonalWallet').post(function (req, res) {
    if (req.body.currency) {
        altcoinService.createPersonalWallet(req.body.currency.toUpperCase())
            .then(function (response) {
            res.send({ success: true, data: response, error: null });
        })
            .catch(function (err) {
            res.send({ success: false, data: null, error: { message: err } });
        });
    }
    else {
        res.send({ success: false, data: null, error: 'Missing parameters' });
    }
});
AltcoinRoutes.route('/getBalance').post(function (req, res) {
    if (req.body.address && req.body.currency) {
        altcoinService.getBalance(req.body.currency, req.body.address)
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
AltcoinRoutes.route('/estimatefeePerKb').post(function (req, res) {
    if (req.body.currency) {
        altcoinService.estimatefeePerKb(req.body.currency)
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
AltcoinRoutes.route('/estimatefee').post(function (req, res) {
    if (req.body.currency) {
        altcoinService.estimateFee(req.body.currency)
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
AltcoinRoutes.route('/transfer').post(function (req, res) {
    if (req.body.currency && req.body.from && req.body.privateKey && req.body.to && req.body.amount) {
        altcoinService.transfer(req.body.currency, req.body.from, req.body.privateKey, req.body.to, req.body.amount)
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
AltcoinRoutes.route('/toWIF').post(function (req, res) {
    if (req.body.currency && req.body.privateKey) {
        altcoinService.toWIF(req.body.currency, req.body.privateKey)
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
AltcoinRoutes.route('/toPrivateKey').post(function (req, res) {
    if (req.body.currency && req.body.wif) {
        altcoinService.toPrivateKey(req.body.currency, req.body.wif)
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var XRPService_1 = require("../services/XRP/XRPService");
var XRPRoutes = express.Router();
exports.XRPRoutes = XRPRoutes;
var xrpService = new XRPService_1.XRPService();
XRPRoutes.route('/createDepositWallet').post(function (req, res) {
    xrpService.createDepositWallet()
        .then(function (response) {
        res.send({ success: true, data: response, error: null });
    })
        .catch(function (err) {
        res.send({ success: false, data: null, error: { message: err } });
    });
});
XRPRoutes.route('/createPersonalWallet').post(function (req, res) {
    xrpService.createPersonalWallet()
        .then(function (response) {
        res.send({ success: true, data: response, error: null });
    })
        .catch(function (err) {
        res.send({ success: false, data: null, error: { message: err } });
    });
});
XRPRoutes.route('/transfer').post(function (req, res) {
    if (req.body.from && req.body.secret && req.body.to && req.body.amount) {
        xrpService.transfer(req.body.from, req.body.secret, req.body.to, req.body.amount, req.body.destinationTag)
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
XRPRoutes.route('/estimatefee').post(function (req, res) {
    xrpService.estimateFee()
        .then(function (response) {
        res.send({ success: true, data: response, error: null });
    })
        .catch(function (err) {
        res.send({ success: false, data: null, error: { message: err } });
    });
});
XRPRoutes.route('/getBalance').post(function (req, res) {
    if (req.body.address) {
        xrpService.getBalance(req.body.address)
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
XRPRoutes.route('/getTransaction').post(function (req, res) {
    if (req.body.hash) {
        xrpService.getTransaction(req.body.hash)
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

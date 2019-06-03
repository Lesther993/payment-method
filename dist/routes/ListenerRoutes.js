"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Listener_1 = require("../services/Altcoin/Listener");
var ListenerRoutes = express.Router();
exports.ListenerRoutes = ListenerRoutes;
ListenerRoutes.post('/new-tx', (function (req, res) {
    res.send(true);
    if (req.body.currency && req.body.hash) {
        Listener_1.txListener.next({ currency: req.body.currency, hash: req.body.hash });
    }
}));

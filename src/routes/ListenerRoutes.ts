import express = require("express");
import {txListener} from '../services/Altcoin/Listener';

const ListenerRoutes = express.Router();

ListenerRoutes.post('/new-tx', ((req, res)=>{

  res.send(true);
  
  if(req.body.currency && req.body.hash){
    txListener.next({currency:req.body.currency, hash:req.body.hash});
  }


}));

export {ListenerRoutes};
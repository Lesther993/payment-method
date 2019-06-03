import express = require("express");

import {AltcoinService} from "../services/Altcoin/AltcoinService";


const AltcoinRoutes = express.Router();

const altcoinService = new AltcoinService();


AltcoinRoutes.route('/createDepositWallet').post((req,res)=>{

  if (req.body.currency) {
    altcoinService.createDepositWallet(req.body.currency.toUpperCase())
      .then(response=>{
        res.send({success:true,data:response ,error:null});
      })
      .catch(err=>{
        res.send({success:false,data:null,error:{message:err}});
      });
    
  } else {
    res.send({success:false,data:null,error:'Missing parameters'});
  }
										
});


AltcoinRoutes.route('/createPersonalWallet').post((req,res)=>{

  if (req.body.currency) {
    altcoinService.createPersonalWallet(req.body.currency.toUpperCase())
      .then(response=>{
        res.send({success:true,data:response ,error:null});
      })
      .catch(err=>{
        res.send({success:false,data:null,error:{message:err}});
      });
    
  } else {
    res.send({success:false,data:null,error:'Missing parameters'});
  }
	
});


AltcoinRoutes.route('/getBalance').post((req,res)=>{

	if (req.body.address && req.body.currency) {
		altcoinService.getBalance(req.body.currency, req.body.address)
			.then(response=>{
				res.send({success:true,data:response,error:null});
			})
			.catch(err=>{
				res.send({success:false,data:null,error:{message:err}});
			});	
	} else {
		res.send({success:false,data:null,error:{message:"missing parameters"}});
	}											
});


AltcoinRoutes.route('/estimatefeePerKb').post((req,res)=>{

	if ( req.body.currency) {
		altcoinService.estimatefeePerKb(req.body.currency)
			.then(response=>{
				res.send({success:true,data:response,error:null});
			})
			.catch(err=>{
				res.send({success:false,data:null,error:{message:err}});
			});	
	} else {
		res.send({success:false,data:null,error:{message:"missing parameters"}});
	}											
});


AltcoinRoutes.route('/estimatefee').post((req,res)=>{

	if ( req.body.currency) {
		altcoinService.estimateFee(req.body.currency)
			.then(response=>{
				res.send({success:true,data:response,error:null});
			})
			.catch(err=>{
				res.send({success:false,data:null,error:{message:err}});
			});	
	} else {
		res.send({success:false,data:null,error:{message:"missing parameters"}});
	}											
});


AltcoinRoutes.route('/transfer').post((req,res)=>{

	if (req.body.currency && req.body.from && req.body.privateKey && req.body.to && req.body.amount) {
		altcoinService.transfer(req.body.currency, req.body.from, req.body.privateKey, req.body.to, req.body.amount)
			.then(response=>{
				res.send({success:true,data:response,error:null});
			})
			.catch(err=>{
				res.send({success:false,data:null,error:{message:err}});
			});	
	} else {
		res.send({success:false,data:null,error:{message:"missing parameters"}});
	}											
});


AltcoinRoutes.route('/toWIF').post((req,res)=>{

	if (req.body.currency && req.body.privateKey) {
		altcoinService.toWIF(req.body.currency, req.body.privateKey)
			.then(response=>{
				res.send({success:true,data:response,error:null});
			})
			.catch(err=>{
				res.send({success:false,data:null,error:{message:err}});
			});	
	} else {
		res.send({success:false,data:null,error:{message:"missing parameters"}});
	}											
});



AltcoinRoutes.route('/toPrivateKey').post((req,res)=>{

	if (req.body.currency && req.body.wif) {
		altcoinService.toPrivateKey(req.body.currency, req.body.wif)
			.then(response=>{
				res.send({success:true,data:response,error:null});
			})
			.catch(err=>{
				res.send({success:false,data:null,error:{message:err}});
			});	
	} else {
		res.send({success:false,data:null,error:{message:"missing parameters"}});
	}											
});


export {AltcoinRoutes};
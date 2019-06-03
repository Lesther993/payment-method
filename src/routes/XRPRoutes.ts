import express = require("express");

import {XRPService} from "../services/XRP/XRPService";


const XRPRoutes = express.Router();

const xrpService = new XRPService();


XRPRoutes.route('/createDepositWallet').post((req, res)=>{

  xrpService.createDepositWallet()
    .then(response=>{
      res.send({success:true,data:response ,error:null});
    })
    .catch(err=>{
      res.send({success:false,data:null, error:{message:err}});
    });
 
});


XRPRoutes.route('/createPersonalWallet').post((req,res)=>{

  xrpService.createPersonalWallet()
    .then(response=>{
      res.send({success:true,data:response, error:null});
    })
    .catch(err=>{
      res.send({success:false,data:null,error:{message:err}});
    });
  									
});


XRPRoutes.route('/transfer').post((req, res)=>{

	if (req.body.from && req.body.secret && req.body.to && req.body.amount) {
		xrpService.transfer(req.body.from, req.body.secret, req.body.to, req.body.amount, req.body.destinationTag)
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


XRPRoutes.route('/estimatefee').post((req, res)=>{

  xrpService.estimateFee()
    .then(response=>{
      res.send({success:true,data:response,error:null});
    })
    .catch(err=>{
      res.send({success:false,data:null,error:{message:err}});
    });									
});


XRPRoutes.route('/getBalance').post((req,res)=>{
  if (req.body.address) {
    xrpService.getBalance(req.body.address)
      .then(response=>{
        res.send({success:true,data:response,error:null});
      })
      .catch(err=>{
        res.send({success:false,data:null,error:{message:err}});
      });									
    
  }else{
    res.send({success:false,data:null,error:{message:"missing parameters"}});
  }
});


XRPRoutes.route('/getTransaction').post((req,res)=>{
  if (req.body.hash) {
    xrpService.getTransaction(req.body.hash)
      .then(response=>{
        res.send({success:true,data:response,error:null});
      })
      .catch(err=>{
        res.send({success:false,data:null,error:{message:err}});
      });									
    
  }else{
    res.send({success:false,data:null,error:{message:"missing parameters"}});
  }
});


export {XRPRoutes};
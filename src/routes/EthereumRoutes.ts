import express = require("express");

import {EthereumService} from "../services/Ethereum/EthereumService";


const EthereumRoutes = express.Router();

const ethereumService = new EthereumService();


EthereumRoutes.route('/createDepositWallet').post((req,res)=>{

	ethereumService.createDepositWallet()
		.then(response=>{
			res.send({success:true,data:response,error:null});
		})
		.catch(err=>{
			res.send({success:false,data:null,error:{message:err}});
		});
										
});

EthereumRoutes.route('/createPersonalWallet').post((req,res)=>{

	ethereumService.createPersonalWallet()
		.then(response=>{
			res.send({success:true,data:response,error:null});
		})
		.catch(err=>{
			res.send({success:false,data:null,error:{message:err}});
		});
										
});

EthereumRoutes.route('/estimateFee').post((req,res)=>{

	if (req.body.currency) { 
		ethereumService.estimateFee(req.body.currency, req.body.from, req.body.to, req.body.amount)
			.then(txHash=>{
				res.send({success:true,data:txHash,error:null});
			})
			.catch(err=>{
				res.send({success:false,data:null,error:{message:err}});
			});	
	} else {
		res.send({success:false,data:null,error:{message:"missing parameters"}});
	}											
});

EthereumRoutes.route('/getTransaction').post((req,res)=>{

	if (req.body.txHash) { 
		ethereumService.getTransaction(req.body.txHash)
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

EthereumRoutes.route('/getTransactionReceipt').post((req,res)=>{

	if (req.body.txHash) { 
		ethereumService.getTransactionReceipt(req.body.txHash)
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

EthereumRoutes.route('/getBalances').post((req,res)=>{

	if (req.body.address) {
		ethereumService.getBalances(req.body.address)
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

EthereumRoutes.route('/transfer').post((req,res)=>{

	if (req.body.currency && req.body.from && req.body.privateKey && req.body.to && req.body.amount) { 
		ethereumService.transfer(req.body.currency, req.body.from, req.body.privateKey, req.body.to, req.body.amount, req.body.gasPrice, req.body.gasLimit)
			.then(txHash=>{
				res.send({success:true,data:txHash,error:null});
			})
			.catch(err=>{
				res.send({success:false,data:null,error:{message:err}});
			});	
	} else {
		res.send({success:false,data:null,error:{message:"missing parameters"}});
	}											
});

EthereumRoutes.route('/approve').post((req,res)=>{

	if (req.body.currency && req.body.from && req.body.privateKey && req.body.spender && req.body.amount) { 
		ethereumService.approve(req.body.currency,req.body.from, req.body.privateKey, req.body.spender, req.body.amount, req.body.gasPrice, req.body.gasLimit)
			.then(txHash=>{
				res.send({success:true,data:txHash,error:null});
			})
			.catch(err=>{
				res.send({success:false,data:null,error:{message:err}});
			});	
	} else {
		res.send({success:false,data:null,error:{message:"missing parameters"}});
	}											
});

EthereumRoutes.route('/transferFrom').post((req,res)=>{

	if (req.body.currency && req.body.from && req.body.privateKey && req.body.recipient && req.body.to && req.body.amount) { 
		ethereumService.transferFrom(req.body.currency, req.body.from, req.body.privateKey, req.body.recipient, req.body.to, req.body.amount, req.body.gasPrice, req.body.gasLimit)
			.then(txHash=>{
				res.send({success:true,data:txHash,error:null});
			})
			.catch(err=>{
				res.send({success:false,data:null,error:{message:err}});
			});	
	} else {
		res.send({success:false,data:null,error:{message:"missing parameters"}});
	}											
});

EthereumRoutes.route('/balanceOf').post((req,res)=>{
	if (req.body.currency && req.body.address) {
		ethereumService.balanceOf(req.body.currency, req.body.address)
			.then(response=>res.send({success:true,data:response,error:null}))
			.catch(err=>res.send({success:false,data:null,error:{message:err}}));
		
	} else {
		res.send({success:false,data:null,error:'Missing parameters'});
	}
});

EthereumRoutes.route('/allowance').post((req,res)=>{
	if (req.body.currency && req.body.from && req.body.spender) {
		ethereumService.allowance(req.body.currency, req.body.from, req.body.spender)
			.then(response=>res.send({success:true,data:response,error:null}))
			.catch(err=>res.send({success:false,data:null,error:{message:err}}));
		
	} else {
		res.send({success:false,data:null,error:'Missing parameters'});
	}
});

EthereumRoutes.route('/getTokenTransactions').post((req,res)=>{
	if (req.body.currency && req.body.address) {
		ethereumService.getTokenTransactions(req.body.currency, req.body.address)
			.then(response=>res.send({success:true,data:response,error:null}))
			.catch(err=>res.send({success:false,data:null,error:{message:err}}));
		
	} else {
		res.send({success:false,data:null,error:'Missing parameters'});
	}
});



EthereumRoutes.route('/server').post((req,res)=>{
	res.send(true);
	console.log('Incoming transaction:',req.body);
});

export { EthereumRoutes };
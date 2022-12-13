var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/', function (req, res, next) {
	return res.render('index.ejs');
});


router.post('/', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf,
							balance: 500
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.send({"Success":"You are registered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('data.ejs', {"name":data.username,"email":data.email,"balance":data.balance});
		}
	});
});

router.post('/transfer', function (req, res, next) {
	console.log("transfer");
	var transferInfo = req.body;

	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);

		if(data){

			data.balance -= transferInfo.amount;
			console.log(data.balance);

			data.save();
			
		}else{
			res.send({"Success":"Failed"});
		}
	});

	User.findOne({email:transferInfo.email},function(err,data){
		console.log("data");
		console.log(data);

		if(data){

			data.balance += parseInt(transferInfo.amount);
			console.log(data.balance);
			console.log("doneee");

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					res.redirect('/profile');
			});
			
		}else{
			res.send({"Success":"Failed"});
		}
	});
	
});

router.get('/transfer', function (req, res, next) {
	console.log("transfer");
	var transferInfo = req.query;

	User.findOne({email:transferInfo.sender},function(err,data){
		console.log("balance decude data");
		console.log(data);

		if(data){

			data.balance -= transferInfo.amount;
			console.log(transferInfo.receiver);

			data.save();
			
		}else{
			res.send({"Success":"Failed"});
		}
	});

	User.findOne({email:transferInfo.recevier},function(err,data){
		console.log("credited money data");
		console.log(data);

		if(data){

			data.balance += parseInt(transferInfo.amount);
			console.log(data.balance);

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					res.redirect('/');
			});
			
		}else{
			res.send({"Success":"Failed"});
		}
	});
	
});

router.get('/delete', function (req, res, next) {
	res.render("delete.ejs");
});

router.get('/delete/account', function (req, res, next) {
	console.log("transfer");
	User.deleteOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		res.redirect('/');
	});
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

module.exports = router;
var _exp = require('Express.js');

var exp = new _exp(null);
exp.Init();

var expSSL = new _exp({
	"listen" : {
		host : "127.0.0.1",
		port : 8081,
	},
	"https" : {
		enabled : true,
		key : "/tmp/cert.pem",
		cert : "/tmp/key.pem"
	}
})

expSSL.Init();


var expIO = new _exp({
	"listen" : {
		host : "127.0.0.1",
		port : 8082,
	},
	"io" : {
		enabled : true
	},
	"mw.static" : {
		enabled : true,
		local : "/tmp/pub",
		remote : "/pub",
	}
});

expIO.Init();


var expHijack_CB_get = function(req,res,next,original_cb) {
	console.log("HIJACKED GET!", req.url);
	return original_cb(req,res,next);
}

var expHijack_CB_post = function(req,res,next,original_cb) {
	console.log("HIJACKED POST!", req.url);
	return original_cb(req,res,next);
}

var expHijack_CB_use = function(req,res,next) {
	console.log("HIJACKED MIDDLEWARE!", req.url);
	return next();
}


var expHijack = new _exp({
	listen : {
		host : "127.0.0.1",
		port : 8086,
	},
	hijack : {
		get : {
			enabled : true,
			cb : expHijack_CB_get
		},
		post : {
			enabled : true,
			cb : expHijack_CB_post
		},
		use : {
			enabled : true,
			cb : expHijack_CB_use
		},
	},
	"mw.static" : {
		enabled : true,
		local : "/tmp/pub",
		remote : "/boss",
	}
});

expHijack.Init();



var expWrecked = new _exp({
	"listen" : {
		host : "127.0.0.1",
		port : 8085,
	},
	"mw.static" : {
		poop: "hi"
	}
});

expWrecked.Init();

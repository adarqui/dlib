'use strict';

var
	express = require('express'),
	http = require('http'),
	https = require('https'),
	io = require('socket.io'),
	connect = require('connect'),
	fs = require('fs'),
	_ = require('underscore');

var _Express = function(opts) {
	var Express = this;
	var Private = {};


	Private.Test_Route = function(req,res,next) {
		return res.send("1");
	}


	Private.defaults = {
		debug : true,
		listen : {
			host : "127.0.0.1",
			port : 8080
		},
		https : {
			enabled : false,
			/* ca, cert, key */
		},
		io : {
			enabled : false,
		},
		hijack : {
			get : {
				enabled : false,
				cb : function(req,res,next) { next(); },
			},
			/* post, delete, use */
		},
		mw : {
			session : {
				enabled : true,
				secret : "hihihi"
			},
			bodyParser : {
				enabled : true,
			},
			cookieParser : {
				enabled : true,
			},
			static : {
				enabled : false,
				local : "/tmp/pub/",
				remote : "/pub",
			},
			logger : {
				enabled : true,
			},
			basicAuth : {
				enabled : false,
				auth : {
					user : "root",
					pass : "pass",
				}
			},
			favicon : {
				enabled : false,
			},
		},
		routes : {
			get : {
				"test_route" : {
					routes : [ "/test_route", "/test/route", "/test/route/:name" ],
					cb : Private.Test_Route,
				}
			},
			post : {
				"test_route" : {
					routes : "test_route",
					cb : Private.Test_Route,
				}
			},
			delete : {
				"test_route" : {
					routes : "test_route",
					cb : Private.Test_Route,
				},
			},
		}
	}
	Private.opts = opts;
	Private.app = null;
	Private.server = null;
	Private.io = null;

	Express.opts = function() { return Private.opts }
	Express.app = function() { return Private.app }
	Express.Shutdown = function() {
		Private.Debug("Express.Shutdown()");
		try { Private.server.close(); }
		catch(err) { Private.Debug("Express.Shutdown() : Error:",err); }
		Private.app = null;
		Private.server = null;
		Private.io = null;
	}

	Private.Debug = function(msg,data) {
		console.log("Express:", msg, data ? data : "");
	}

	Private.CreateApp = function() {
		Private.Debug("Private.CreateApp()");
		Private.app = express();
	}

	Private.Middleware = function() {
		Private.Debug("Private.Middleware()");
		if(Private.opts.mw.logger.enabled == true) {
			Private.app.use(express.logger());
		}

		try {
		if(Private.opts.hijack.use.enabled == true) {
			Private.app.use(Private.opts.hijack.use.cb);
		}
		} catch(err) {
			Private.Debug("Private.Middleware() : HIJACK->USE : ERROR", err);
		}

		if(Private.opts.mw.cookieParser.enabled == true) {
			Private.app.use(express.cookieParser());
		}

		if(Private.opts.mw.session.enabled == true) {
			Private.app.use(express.cookieSession({ secret : Private.opts.mw.session.secret }))
		}

		if(Private.opts.mw.bodyParser.enabled == true) {
			Private.app.use(express.bodyParser());
		}

		if(Private.opts.mw.favicon.enabled == true) {
		} else {
			Private.app.use(express.favicon());
		}

		if(Private.opts.mw.static.enabled == true) {
			Private.app.use(Private.opts.mw.static.remote,express.static(Private.opts.mw.static.local));
		}

	}

	Private.Routes_Insert = function(obj, method, route, cb) {
		var the_cb = cb;
		try {
		if(Private.opts.hijack[method].enabled == true) {
			the_cb = (function(original_cb) {
				return function(req,res,next) { return Private.opts.hijack[method].cb(req,res,next,original_cb) };
			})(cb)
		}
		} catch(err) {
			Private.Debug("Private.Routes_Insert() : ERROR", err);
		}
		Private.app[method](route,the_cb);
	}

	Private.Routes = function() {
		Private.Debug("Private.Routes()");
		_.each(Private.opts.routes, function(method_value,method_key,method_list) {
			_.each(method_value, function(route_value,route_key,route_list) {
				if(route_value.routes instanceof Array) {
					_.each(route_value.routes, function(specific_route) {
						Private.Routes_Insert(route_value, method_key, specific_route, route_value.cb);
					});
				}
				else if(typeof route_value.routes === 'string') {
					Private.Routes_Insert(route_value, method_key, route_value.routes, route_value.cb);
				}
				else {
					return;
				}
			});
		});
	}

	Private.HttpsKeys = function() {
		Private.Debug("Private.HttpsKeys()");
		try {
			Private.opts.https.key = fs.readFileSync(Private.opts.https.key)/*.toString()*/;
		} catch(err) {
			Private.Debug("Private.HttpsKeys() : ERROR (key)", err);
		}

		try {
			Private.opts.https.cert = fs.readFileSync(Private.opts.https.cert)/*.toString()*/;
		} catch(err) {
			Private.Debug("Private.HttpsKeys() : ERROR (cert)", err);
		}
	}

	Private.Listen = function() {
		Private.Debug("Private.Listen()");
		if(Private.opts.https.enabled == true) {
			Private.HttpsKeys();
			Private.server = https.createServer(Private.opts.https, Private.app).listen(Private.opts.listen.port);
		} else {
			Private.server = http.createServer(Private.app).listen(Private.opts.listen.port);
		}
		//Private.server = Private.app.listen(Private.opts.listen.port);
		if(Private.opts.io.enabled == true) {
			Private.io = io.listen(Private.server)
		}
	}


	Private.SetOpt = function(str,value) {
		try {
			var arr = str.split('.')
			var obj = Private.defaults;
			_.each(arr, function(val,key,list) {
				obj = obj[val];
			});
			_.each(_.keys(obj),function(key) {
				delete(obj[key]);
			});
			_.each(value, function(a,b,c) {
				obj[b] = a;
			});
			return obj;
		} catch(err) {
			return null;
		}
	}

	Private.Opts = function() {
		Private.Debug("Private.Opts()");
		if(Private.opts == null) {
			Private.opts = Private.defaults;
			return
		}
		_.each(Private.opts, function(value,key,list) {
			//Private.defaults[key] = value;
			var obj = Private.SetOpt(key,value);
		});
		Private.opts = Private.defaults;
	}

	Private.Init = function() {
		Private.Debug("Private.Init()");
		Private.Opts();
		Private.CreateApp();
		Private.Middleware();
		Private.Listen();
		Private.Routes();
	}

	Express.Init = function() {
		Private.Debug("Express.Init()");
		Private.Init();
	}
}

module.exports = _Express

var
	assert = require('assert'),
	tls = require('tls'),
	fs = require('fs'),
	_ = require('underscore')
	;

var _Tls = function(opts) {
	var Tls = this;
	var Private = {
		opts : opts,
		channel : {},
		prefix : "tls"
	}

	Private.Error = function(m,data) {
		throw new Error(m,data);
		return;
	}

	Private.Debug = function(fn,data) {
		console.log(Private.prefix+fn+"()",data ? data : '');
	}

	Private.ClientCB = function(stream) {
		Private.Debug("Tls.ClientCB",stream);
	}

	Private.ServerCB = function(stream) {
		Private.Debug("Tls.ServerCB",stream);
	}

	Private.ClientSetup = function() {
		Private.channel.on('data', function(data) {
			Private.Debug("Private.ClientSetup","Received data : ["+data+"]");
		});
		Private.channel.on('end', function() {
			Private.Debug("Private.ClientSetup","Received disconnect");
		});
	}

	Private.ServerSetup = function() {
		Private.channel.listen(Private.opts.channel.port, function() {
			Private.Debug("Private.ServerSetup", "listening!");
		});
	}

	Tls.Init = function() {
		try {
			switch(Private.opts.channel.type) {
				case 'client': {
					Private.channel = tls.connect(Private.opts.channel.port, Private.opts.options, Private.ClientCB);
					Private.ClientSetup();
					Private.prefix = Private.prefix + ':client:';
					break;
				}
				case 'server' : {
					console.log(Private.opts.options);
					Private.channel = tls.createServer(Private.opts.options, Private.ServerCB);
					Private.ServerSetup();
					Private.prefix = Private.prefix + ':server:';
					break;
				}
				default : return Private.Error("Must specify client or server", {});
			}
		} catch(err) {
			Private.Debug("Tls.Init",err);
		}
	}


	Private.InitOptions = function() {

		if(Private.opts == undefined) {
			return Private.Error("You must specify some options");
		}

		if(Private.opts.cert == undefined) {
			return Private.Error("You must specify public & private key certificates");
		}

		Private.opts.options.cert = fs.readFileSync(Private.opts.cert.pub).toString();
		Private.opts.options.key = fs.readFileSync(Private.opts.cert.key).toString();

		if(Private.opts.cert.ca) {
			Private.opts.options.ca = fs.readFileSync(Private.opts.cert.ca).toString();
		}
	}

	Private.Init = function() {
		try {
			Private.InitOptions();
		} catch(err) {
			Private.Debug("Private.Init","Incorrect options");
		}
	}

	Private.Init();
}

module.exports = _Tls;

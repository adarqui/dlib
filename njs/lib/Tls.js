var
	assert = require('assert'),
	redis = require('redis'),
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
	Private.on = {
		client : {
			/*
			 * connection
			 * data
			 * end
			 * error
			 */
		},
		server : {
			/*
			 * listening
			 * connection
			 * data
			 * end
			 * server_error
			 * client_error
			 * secure
			 */
		},
	}

	Private.Error = function(m,data) {
		throw new Error(m,data);
		return;
	}

	Private.Debug = function(fn,data) {
		console.log(Private.prefix+fn+"()",data ? data : '');
	}

	Private.on.client.Connection = function(stream) {
		Private.Debug("Tls.Client:Connection");
	}

	Private.on.client.Data = function(data) {
		Private.Debug("Data",data);
	}

	Private.on.client.End = function(stream) {
		Private.Debug("End");
		if(Private.opts.options.reconnect == true) {
			setTimeout(function() {
				Private.Connect();
			}, 5000);
		}
		else {
			stream.end();
		}
	}

	Private.on.client.Error = function() {
		Private.Debug("Error");
	}

	Private.ClientSetup = function() {
		Private.channel.on('data', Private.on.client.Data);
		Private.channel.on('end', Private.on.client.End);
		Private.channel.on('error', Private.on.client.Error);
	}

	Private.ServerSetup = function() {
		Private.channel.listen(Private.opts.channel.port, Private.on.server.Listening);
	}

	Private.on.server.Listening = function(stream) {
		Private.Debug("Tls.Server:Listening",stream);
	}

	Private.Handle_Connection = function(stream) {
		stream.on('data', Private.on.server.Data);
		stream.on('error', Private.on.server.Client_Error);
		if(Private.opts.on.connection) {
			return Private.opts.on.connection(stream);
		}
	}

	Private.on.server.Connection = function(stream) {
		console.log("CONNECTED!!!!!!!!!!",Private.opts, stream.getPeerCertificate(), "poooooooooooooooooooooooooooooooooooooooooooooooooooooooop");

		if(Private.opts.options.tlsKeys) {

			Private.redis.hget(Private.prefix+':tls_keys',stream.getPeerCertificate().fingerprint, function(err,data) {
				if(err || !data) {
					Private.Debug("Private.on.server.Connection","Key not found!");
					return stream.end();
				}
				console.log("client authorized!");
				Private.Handle_Connection(stream);
			});

		} else {
			Private.Handle_Connection(stream);
		}
	}

	Private.on.server.Server_Error = function(err) {
		Private.Debug("Server_Error");
	}

	Private.on.server.Client_Error = function(err, stream) {
		Private.Debug("Client_Error");
	}

	Private.RedisConnect = function() {
		Private.redis = redis.createClient();
		if(Private.opts.redis.sock) {
			Private.redis(Private.opts.redis.sock);
		}
		else if(Private.opts.redis.host) {
			Private.redis(Private.opts.redis.port,Private.opts.redis.host,Private.opts.redis.options ? Private.opts.redis.options : {});
		}
		else {
			/* need a connect poller */
			Private.Error("Private.RedisConnect");
			return;
		}
		Private.redis.on('error', function(err) {
			Private.Debug("Private.RedisConnect",err);
		});
	}


	Private.AuthKey_Fill = function(cb) {
		/*
		if(!Private.redis) {
			Private.redis.hgetall(Private.prefix+'tls-keys',
		}
		*/
	}

	Tls.Write = function(data) {
		Private.channel.write(data);
	}

	Private.Connect = function() {
		Private.channel = tls.connect(Private.opts.channel.port, Private.opts.options, Private.on.client.Connection);
		Private.ClientSetup();
	}

	Tls.Init = function() {
		try {
			switch(Private.opts.channel.type) {
				case 'client': {
					if(Private.opts.on.connection) {
						Private.on.client.Connection = Private.opts.on.connection;
					}
					if(Private.opts.on.data) {
						Private.on.client.Data = Private.opts.on.data;
					}
					if(Private.opts.on.end) {
						Private.on.client.End = Private.opts.on.end;
					}
					if(Private.opts.on.error) {
						Private.on.client.Error = Private.opts.on.error;
					}
					console.log(Private.opts.on, '--------------', Private.on);
					/*
					Private.channel = tls.connect(Private.opts.channel.port, Private.opts.options, Private.on.client.Connection);
					Private.ClientSetup();
					*/
					Private.Connect();
					//Private.prefix = Private.prefix + ':client:';
					break;
				}
				case 'server' : {
					console.log(Private.opts.options);

					if(Private.opts.on.data) {
						Private.on.server.Data = Private.opts.on.data;
					}
					if(Private.opts.on.server_error) {
						Private.on.server.Server_Error = Private.opts.on.server_error;
					}
					if(Private.opts.on.client_error) {
						Private.on.server.Client_Error = Private.opts.on.client_error;
					}

					Private.channel = tls.createServer(Private.opts.options, Private.on.server.Connection);
					Private.channel.on('error', Private.on.server.Server_Error);
					Private.ServerSetup();
					//Private.prefix = Private.prefix + ':server:';
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

		if(Private.opts.redis) {
			Private.RedisConnect();
		}

		if(Private.opts.options.tlsKeys) {
			if(!Private.redis) {
				return Private.Error("Private.InitOptions", "tlsKeys can only be used with redis");
			}
		}

		Private.opts.options.handshakeTimeout = 10;
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

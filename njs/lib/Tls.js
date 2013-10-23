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

	Private.on.client.End = function() {
		Private.Debug("End");
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

	Private.on.server.Connection = function(stream) {
		console.log("CONNECTED!!!!!!!!!!",stream);
		stream.on('data', Private.on.server.Data);
		Private.channel.on('data', Private.on.server.Data);

		stream.on('error', Private.on.server.Client_Error);

		if(Private.opts.on.connection) {
			return Private.opts.on.connection(stream);
		}
	}

	Private.on.server.Server_Error = function(err) {
		Private.Debug("Server_Error");
	}

	Private.on.server.Client_Error = function(err, stream) {
		Private.Debug("Client_Error");
	}


	Tls.Write = function(data) {
		Private.channel.write(data);
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
					Private.channel = tls.connect(Private.opts.channel.port, Private.opts.options, Private.on.client.Connection);
					Private.ClientSetup();
					Private.prefix = Private.prefix + ':client:';
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

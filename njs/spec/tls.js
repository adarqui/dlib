var
	_tls = require('Tls.js')
	;

var tls = new _tls();
tls.Init();

process.env.NODE_TLS_REJECT_UNAUTHORIZED="0";

var tlsServer = new _tls({
	channel : {
		host : "0.0.0.0",
		port : 8080,
		type : "server",
	},
	cert : {
		key : "/tmp/certs/server-key.pem",
		pub : "/tmp/certs/server-cert.pem",
		ca : "/tmp/certs/server-csr.pem",
	},
	options : {
		//requestCert : true,
	},
});
tlsServer.Init();


setTimeout(function() {
	var tlsClient = new _tls({
		channel : {
			host : "127.0.0.1",
			port : 8080,
			type : "client",
		},
		cert : {
			key : "/tmp/certs/client.key",
			pub : "/tmp/certs/client.pem",
		},
		options : {
		},
	});

	tlsClient.Init();
}, 1000);

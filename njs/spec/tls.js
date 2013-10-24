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
	redis : {
		sock : "/tmp/redis.sock",
	},
	options : {
		requestCert : true,
		tlsKeys : true,
	},
	on : {
		connection : function(stream) {
			console.log("authorized?", stream.authorizd, stream.getPeerCertificate());
		},
		data : function(data) {
			console.log("Server data",data.toString());
		},
		server_error : function(err) {
			console.log("Server error", err);
		},
		client_error : function(err,stream) {
			console.log("Client error", err);
		}
	},
});
tlsServer.Init();


setTimeout(function() {

	var timer;
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
			reconnect : true,
		},
		on : {
			connection : function(stream) {
				if(timer) { clearInterval(timer); timer = undefined }
				timer = setInterval(function() { console.log("client"); tlsClient.Write("hi\n"); }, 2000);
			},
			data : function(data) {
				console.log("data",data);
			},
			error : function(err) {
				console.log("client error", err);
			},
		},
	});

//	tlsClient.Init();
}, 1000);



setTimeout(function() {

	var timer;
	var tlsClientWrongKeys = new _tls({
		channel : {
			host : "127.0.0.1",
			port : 8080,
			type : "client",
		},
		cert : {
			key : "/tmp/certs2/client.key",
			pub : "/tmp/certs2/client.pem",
		},
		options : {
			reconnect : true,
		},
		on : {
			connection : function(stream) {
				if(timer) { clearInterval(timer); timer = undefined }
				timer = setInterval(function() { console.log("client"); tlsClientWrongKeys.Write("hi\n"); }, 2000);
			},
			data : function(data) {
				console.log("data",data);
			},
			error : function(err) {
				console.log("client error", err);
			},
		},
	});

	tlsClientWrongKeys.Init();
}, 2000);

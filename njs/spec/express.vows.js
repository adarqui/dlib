var
	_Express = require('Express.js'),
	vows = require('vows'),
	assert = require('assert'),
	request = require('request');

vows.describe("Express module").addBatch({
	"Should create a new object" : {
		topic : new _Express(null),
		"new Express()" : function(topic) {
			assert.isObject(topic);
			topic.Shutdown();
		},
	},
	"Should create a new object and do stuff" : {
		"Should run Express.Init()" : {
			topic : function() { var X = new _Express(null); X.Init(); return X; },
			"new Express()" : function(topic) {
				assert.isObject(topic);
				topic.Shutdown();
			}
		}
	},
	"Should create a new object and setup test routes" : {
		"Should run Private.Test_Route()" : {
			topic : function() {
				var that=this;
				var X = new _Express(null); X.Init(null);
				return X;
				request({
					url : "http://localhost:8080/test_route",
					method : "GET",
				}, that.callback)
			},
			"Testing route" : function(topic) {
				assert.isObject(topic);
				/*
				console.log(err,res,body);
				assert.isEqual(body,"1");
				topic.Shutdown();
				*/
			},
		},
	},

}).run();

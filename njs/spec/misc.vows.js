var
	Misc = require('Misc.js'),
	vows = require('vows'),
	assert = require('assert')
	;

vows.describe("Misc module").addBatch({
	"Calling misc with improper arguments" : {
		"should throw an exception" : function() {
			assert.throws(function() {
				var ret = Misc.SetOpt(null,false);
				console.log(ret);
			}, Error);
		},
	},
	"Calling misc with proper arguments" : {
		topic : function() { return Misc.SetOpt("hello.world", 2, { hello : { world : 1 } } ) },
		"should return an object" : function(topic) {
			console.log("topic",topic);
			assert.isObject(topic);
		}
	},
}).run();

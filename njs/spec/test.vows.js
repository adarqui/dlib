var
	_Test = require('Test.js'),
	Test = new _Test({}),
	vows = require('vows'),
	assert = require('assert');

vows.describe("Test module").addBatch({
	"Should respond with the value you specified" : {
		topic : Test.value(5),
		"Test.value(x) = x" : function(topic) {
			assert.equal(topic, 5);
		},
	},
	"Should NOT respond with the value you specified" : {
		topic : Test.wrongValue(5),
		"Test.wrongValue(x) != x" : function(topic) {
			assert.notEqual(topic,5);
		}
	}
}).run();

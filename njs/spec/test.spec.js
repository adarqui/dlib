var
	_Test = require('Test.js'),
	Test = new _Test({});

describe("Test module", function() {
	it("Should respond with the value you specified", function() {
		expect(Test.value(5)).toEqual(5);
	})
	/*
	it("Should respond with the value you specified in a callback", function(done) {
		Test.timeout(2, done);
	})
	*/
})

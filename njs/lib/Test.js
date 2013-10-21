var _Test = function(opts) {
	var Test = this;

	Test.value = function(value) {
		return value;
	}

	Test.wrongValue = function(value) {
		return value + 1;
	}

	Test.timeout = function(value,cb) {
		setTimeout(function() {
			return cb(value);
		}, value*1000);
	}

	Test.init = function() {
	}

	Test.init();
}

module.exports = _Test;

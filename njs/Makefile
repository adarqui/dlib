test:
	make test_test
	make test_express
	make test_misc

test_test:
	NODE_PATH=./lib/ node spec/test.vows.js

test_express:
	NODE_PATH=./lib/ node spec/express.vows.js

test_misc:
	NODE_PATH=./lib/ node spec/misc.vows.js

express_test:
	# --use_strict
	NODE_PATH=./lib/ node spec/express.js

tls_test:
	NODE_PATH=./lib/ node spec/tls.js

test:
	@./node_modules/.bin/mocha test/commands/config.js test/commands/*  --timeout 15000

.PHONY: test

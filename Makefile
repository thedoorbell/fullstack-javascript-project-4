lint:
	npx eslint .
deps-install:
	npm ci
test:
	npm test
test-coverage:
	npm test -- --coverage

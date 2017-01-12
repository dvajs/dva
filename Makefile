
build:
	npm run build
	rm -rf dist
	mkdir -p dist
	NODE_ENV=development ./node_modules/.bin/browserify index.js --standalone=dva -u react -u react-dom -g browserify-shim -t envify > dist/dva.js
	NODE_ENV=development ./node_modules/.bin/browserify mobile.js --standalone=dva -u react -u react-dom -g browserify-shim -t envify > dist/mobile.js
	NODE_ENV=development ./node_modules/.bin/browserify router.js --standalone=dva.router -u react -u react-dom -g browserify-shim -t envify > dist/router.js
	NODE_ENV=development ./node_modules/.bin/browserify fetch.js --standalone=dva.fetch -u react -u react-dom -g browserify-shim -t envify > dist/fetch.js
	./node_modules/.bin/uglifyjs -o dist/dva-min.js dist/dva.js
	./node_modules/.bin/uglifyjs -o dist/mobile-min.js dist/mobile.js
	./node_modules/.bin/uglifyjs -o dist/router-min.js dist/router.js
	./node_modules/.bin/uglifyjs -o dist/fetch-min.js dist/fetch.js

copy:
	cp lib/* ./examples/user-dashboard/node_modules/dva/lib/

publish: build
	npm publish

publish-sync: publish
	cnpm sync dva
	tnpm sync dva

publish-beta: build
	npm publish --tag beta

publish-sync-beta: publish-beta
	cnpm sync dva
	tnpm sync dva

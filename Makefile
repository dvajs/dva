
publish:
	npm run build
	npm publish

publish-sync: publish
	cnpm sync dva
	tnpm sync dva

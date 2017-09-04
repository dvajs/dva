
cd "$(dirname "$0")"

cd ..
root_path=$PWD
ruban="$root_path/node_modules/.bin/ruban"
umdBundler="$root_path/node_modules/.bin/umd-bundler"
uglifyjs="$root_path/node_modules/.bin/uglifyjs"
lerna="$root_path/node_modules/.bin/lerna"

cd "$root_path/packages/dva-core"
$ruban build
echo 'build dva-core'

cd "$root_path/packages/dva"
$ruban build
echo 'build dva'

cd "$root_path/packages/dva-react-router-3"
$ruban build
echo 'build dva-react-router-3'

cd "$root_path/packages/dva-loading"
$ruban build
echo 'build dva-loading'

cd "$root_path/packages/dva"
rm -rf dist
$umdBundler -g react:React,react-dom:ReactDOM -n dva -i ./index.js -o dist/dva.js
$umdBundler -g react:React,react-dom:ReactDOM -n dva.dynamic -i ./dynamic.js -o dist/dynamic.js
$umdBundler -g react:React,react-dom:ReactDOM -n dva.fetch -i ./fetch.js -o dist/fetch.js
$umdBundler -g react:React,react-dom:ReactDOM -n dva.router -i ./router.js -o dist/router.js
$umdBundler -g react:React,react-dom:ReactDOM -n dva.saga -i ./saga.js -o dist/saga.js
$uglifyjs -o dist/dva-min.js dist/dva.js
$uglifyjs -o dist/dynamic-min.js dist/dynamic.js
$uglifyjs -o dist/fetch-min.js dist/fetch.js
$uglifyjs -o dist/router-min.js dist/router.js
$uglifyjs -o dist/saga-min.js dist/saga.js
echo 'umd-bundler dva'

cd "$root_path/packages/dva-react-router-3"
rm -rf dist
$umdBundler -g react:React,react-dom:ReactDOM -n dva -i ./index.js -o dist/dva.js
$umdBundler -g react:React,react-dom:ReactDOM -n dva.fetch -i ./fetch.js -o dist/fetch.js
$umdBundler -g react:React,react-dom:ReactDOM -n dva.router -i ./router.js -o dist/router.js
$umdBundler -g react:React,react-dom:ReactDOM -n dva.saga -i ./saga.js -o dist/saga.js
$uglifyjs -o dist/dva-min.js dist/dva.js
$uglifyjs -o dist/fetch-min.js dist/fetch.js
$uglifyjs -o dist/router-min.js dist/router.js
$uglifyjs -o dist/saga-min.js dist/saga.js
echo 'umd-bundler dva-react-router-3'

cd "$root_path/packages/dva-no-router"
rm -rf dist
$umdBundler -g react:React,react-dom:ReactDOM -n dva -i ./index.js -o dist/dva.js
$umdBundler -g react:React,react-dom:ReactDOM -n dva.fetch -i ./fetch.js -o dist/fetch.js
$umdBundler -g react:React,react-dom:ReactDOM -n dva.saga -i ./saga.js -o dist/saga.js
$uglifyjs -o dist/dva-min.js dist/dva.js
$uglifyjs -o dist/fetch-min.js dist/fetch.js
$uglifyjs -o dist/saga-min.js dist/saga.js
echo 'umd-bundler dva-no-router'

cd "$root_path"
$lerna publish "$@"

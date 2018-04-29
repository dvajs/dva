
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

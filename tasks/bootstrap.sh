
cd "$(dirname "$0")"

cd ..
root_path=$PWD
ruban="$root_path/node_modules/.bin/ruban"
lerna="$root_path/node_modules/.bin/lerna"

cd "$root_path"
$lerna bootstrap "$@"

cd "$root_path/packages/dva-core"
$ruban build

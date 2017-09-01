
cd "$(dirname "$0")"

cd ..
root_path=$PWD
ruban="$root_path/node_modules/.bin/ruban"

cd "$root_path/packages/dva-core"
$ruban build

cd "$root_path/packages/dva"
$ruban build

cd "$root_path/packages/dva-react-router-3"
$ruban build

# ./node_modules/.bin/lerna publish

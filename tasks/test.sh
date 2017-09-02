
cd "$(dirname "$0")"

# Go to root
cd ..
root_path=$PWD
ruban="$root_path/node_modules/.bin/ruban"

cd "$root_path/packages/dva-core"
$ruban test

cd "$root_path/packages/dva"
$ruban test

cd "$root_path/packages/dva-react-router-3"
$ruban test

cd "$root_path/packages/dva-no-router"
$ruban test

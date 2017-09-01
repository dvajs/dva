
cd "$(dirname "$0")"

# Go to root
cd ..
root_path=$PWD
ruban="$PWD/node_modules/.bin/ruban"

cd "$root_path"
cd packages/dva-core
$ruban test

cd "$root_path"
cd packages/dva
$ruban test

cd "$root_path"
cd packages/dva-react-router-3
$ruban test

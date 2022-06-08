#!/usr/bin/env bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";

rm -rf $SCRIPT_DIR/gun

mkdir $SCRIPT_DIR/gun
cp -a $SCRIPT_DIR/../../gun/* $SCRIPT_DIR/gun/.

rm -rf $SCRIPT_DIR/gun/gun.js

MAIN_FILE="$(cat ${SCRIPT_DIR}/main.js)"
echo "${MAIN_FILE}" > $SCRIPT_DIR/gun/gun.js

npm exec -c "browserify ${SCRIPT_DIR}/gun/gun.js -d -s GUN --node --list"
npm exec -c "browserify ${SCRIPT_DIR}/gun/gun.js -d -s GUN --node -o  ${SCRIPT_DIR}/gun.js"
rm -rf $SCRIPT_DIR/gun

if [ -e $SCRIPT_DIR/../../docs/gun/gun.js ]; then
    rm $SCRIPT_DIR/../../docs/gun/gun.js
    cp $SCRIPT_DIR/gun.js $SCRIPT_DIR/../../docs/gun/gun.js
    echo "replaced gun in ./docs";
fi
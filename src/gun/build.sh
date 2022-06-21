#!/usr/bin/env bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
BUILD_DIR="${SCRIPT_DIR}/../../docs/gun";

rm -rf $SCRIPT_DIR/gun

# make default
mkdir $SCRIPT_DIR/gun
cp -a $SCRIPT_DIR/../../gun/* $SCRIPT_DIR/gun/.

rm -rf $SCRIPT_DIR/gun/gun.js

MAIN_FILE="$(cat ${SCRIPT_DIR}/main.js)"
echo "${MAIN_FILE}" > $SCRIPT_DIR/gun/gun.js

npm exec -c "browserify ${SCRIPT_DIR}/gun/gun.js -d -s GUN --node --list"
npm exec -c "browserify ${SCRIPT_DIR}/gun/gun.js -d -s GUN --node -o  ${SCRIPT_DIR}/gun.js"
rm -rf $SCRIPT_DIR/gun

if [ -e $BUILD_DIR/gun.js ]; then
    rm $BUILD_DIR/gun.js
    cp $SCRIPT_DIR/gun.js $BUILD_DIR/gun.js
    echo "replaced gun in ./docs";
fi


# make sw default
mkdir $SCRIPT_DIR/gun
cp -a $SCRIPT_DIR/../../gun/* $SCRIPT_DIR/gun/.

rm -rf $SCRIPT_DIR/gun/gun.js

MAIN_FILE="$(cat ${SCRIPT_DIR}/main.sw.js)"
echo "${MAIN_FILE}" > $SCRIPT_DIR/gun/gun.js

npm exec -c "browserify ${SCRIPT_DIR}/gun/gun.js -d -s GUN --node --list"
npm exec -c "browserify ${SCRIPT_DIR}/gun/gun.js -d -s GUN --node -o  ${SCRIPT_DIR}/gun.sw.js"
rm -rf $SCRIPT_DIR/gun

if [ -e $BUILD_DIR/gun.sw.js ]; then
    rm $BUILD_DIR/gun.sw.js
    cp $SCRIPT_DIR/gun.sw.js $BUILD_DIR/gun.sw.js
    echo "replaced gun in ./docs";
fi


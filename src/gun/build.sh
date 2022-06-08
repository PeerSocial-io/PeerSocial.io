#!/usr/bin/env bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
cp -a $SCRIPT_DIR/../../node_modules/gun $SCRIPT_DIR/gun

rm -rf $SCRIPT_DIR/gun/gun.js
echo "module.exports = require('./src/root');" > $SCRIPT_DIR/gun/gun.js

npm exec -c "browserify ${SCRIPT_DIR}/main.js -d -s GUN --node --list"
npm exec -c "browserify ${SCRIPT_DIR}/main.js -d -s GUN --node -o  ${SCRIPT_DIR}/gun.js"
rm -rf $SCRIPT_DIR/gun
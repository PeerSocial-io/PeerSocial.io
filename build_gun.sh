# rm -rf ./node_modules/gun
# npm install gun
GUN_PATH=$(node -e "console.log(require('path').dirname(require.resolve('gun')))") 
# PSIO_CLI_PATH=$(node -e "console.log(require('path').resolve(__dirname))") 

ln -sf $GUN_PATH ./gun
cd ./gun
node lib/unbuild
node lib/unbuild sea
cd ..

./src/gun/build.sh

echo "gun built"

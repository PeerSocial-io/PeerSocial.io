# rm -rf ./node_modules/gun
# npm install gun
cd ./node_modules/gun
node lib/unbuild
node lib/unbuild sea

cd ../..

./src/gun/build.sh

echo "gun built"

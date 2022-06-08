# rm -rf ./node_modules/gun
# npm install gun
ln -sf ./node_modules/gun ./gun
cd ./gun
node lib/unbuild
node lib/unbuild sea
cd ..

./src/gun/build.sh

echo "gun built"

if [ -z ${HEROKU_SLUG_COMMIT+x} ]; 
  then SOURCE_VERSION=$(git rev-parse --verify HEAD); 
fi

echo Build $APP_ENV $SOURCE_VERSION
# npm install
# env

cd ./src
npm version patch
cd ..

sh ./build_gun.sh
npm exec -c "minify ./src/peersocial/lib/r.js >  ./src/peersocial/lib/r.min.js"
SOURCE_VERSION=$SOURCE_VERSION npm run build-app
rm -rf docs/peersocial/additional_plugins
ln -s ../../src/peersocial/additional_plugins docs/peersocial/additional_plugins

rm -rf docs/peersocial/securerender
ln -s ../../src/peersocial/securerender docs/peersocial/securerender

rm -rf docs/peersocial/service
ln -s ../../src/peersocial/service docs/peersocial/service
ln -sf ./peersocial/service/worker.js docs/service.worker.js

echo BUILD DONE $DAPP_PUB_KEY

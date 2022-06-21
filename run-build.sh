if [ -z ${HEROKU_SLUG_COMMIT+x} ]; then 

SOURCE_VERSION=$(git rev-parse --verify HEAD); 


fi

BUILD_DIR="$( node -e "console.log(process.cwd())")/build";

echo Build $APP_ENV $SOURCE_VERSION $BUILD_DIR

# npm install
# env

cd ./src
npm version $(node ../version.js)
cd ..

#build gun
BUILD_DIR=$BUILD_DIR sh ./build_gun.sh

#minifiy r.js
npm exec -c "minify ./src/peersocial/lib/r.js >  ./src/peersocial/lib/r.min.js"

#build app
BUILD_DIR=$BUILD_DIR SOURCE_VERSION=$SOURCE_VERSION npm run build-app

#link additional_plugins
rm -rf $BUILD_DIR/peersocial/additional_plugins
ln -s ../../src/peersocial/additional_plugins $BUILD_DIR/peersocial/additional_plugins


#link service *worker  
rm -rf $BUILD_DIR/peersocial/service
ln -s ../../src/peersocial/service $BUILD_DIR/peersocial/service
ln -sf ./peersocial/service/worker.js $BUILD_DIR/service.worker.js


#link other experimental folders
rm -rf $BUILD_DIR/peersocial/securerender
ln -s ../../src/peersocial/securerender $BUILD_DIR/peersocial/securerender


echo BUILD DONE

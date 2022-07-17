if [ -z ${HEROKU_SLUG_COMMIT+x} ]; then 

SOURCE_VERSION=$(git rev-parse --verify HEAD); 


fi

BUILD_DIR="$( node -e "console.log(process.cwd())")/build";

echo Build $APP_ENV $SOURCE_VERSION $BUILD_DIR

#clean build dir
rm -rf $BUILD_DIR
mkdir $BUILD_DIR

# npm install
# env

cd ./src
npm version $(node ../version.js)
cd ..

#build gun
# BUILD_DIR=$BUILD_DIR sh ./build_gun.sh

#minifiy r.js
# npm exec -c "minify ./src/peersocial/lib/r.js >  ./src/peersocial/lib/r.min.js"

#build app
BUILD_DIR=$BUILD_DIR SOURCE_VERSION=$SOURCE_VERSION npm run build-default

#copy files from src into build
cp -a $BUILD_DIR/../src/* $BUILD_DIR

CP_DIR="$( node -e "console.log(require('path').dirname(require.resolve('gun/package.json')))" )";
cp -a $CP_DIR $BUILD_DIR/gun

CP_DIR="$( node -e "console.log(require('path').resolve( require('path').dirname(require.resolve('ace/package.json')) , './lib/ace'))" )";
cp -a $CP_DIR $BUILD_DIR/peersocial/ace

CP_DIR="$( node -e "console.log(require('path').dirname(require.resolve('@fortawesome/fontawesome-free/package.json')))" )";
cp -a $CP_DIR $BUILD_DIR/fontawesome

#link additional_plugins
rm -rf $BUILD_DIR/peersocial/additional_plugins
ln -s ../../src/peersocial/additional_plugins $BUILD_DIR/peersocial/additional_plugins

#link config
rm -rf $BUILD_DIR/peersocial/config
ln -s ../../src/peersocial/config $BUILD_DIR/peersocial/config

#link service *worker  
rm -rf $BUILD_DIR/peersocial/service
ln -s ../../src/peersocial/service $BUILD_DIR/peersocial/service
ln -sf ./peersocial/service/worker.js $BUILD_DIR/service.worker.js


#link other experimental folders
rm -rf $BUILD_DIR/peersocial/securerender
ln -s ../../src/peersocial/securerender $BUILD_DIR/peersocial/securerender


echo BUILD DONE

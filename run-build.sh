# git rev-parse --verify HEAD >> GIT_HEAD
echo Build $APP_ENV
# npm install
# env
sh ./build_gun.sh
npm exec -c "minify ./src/peersocial/lib/r.js >  ./src/peersocial/lib/r.min.js"
npm run build-app
rm -rf docs/peersocial/additional_plugins
ln -s ../../src/peersocial/additional_plugins docs/peersocial/additional_plugins
rm -rf docs/peersocial/securerender
ln -s ../../src/peersocial/securerender docs/peersocial/securerender
echo BUILD DONE $DAPP_PUB_KEY
# node -e "setInterval(()=>{},1000);"
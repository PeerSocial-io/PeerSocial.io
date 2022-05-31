# git rev-parse --verify HEAD >> GIT_HEAD
echo Build $APP_ENV
# npm install
# env
sh ./build_gun.sh
npm run build-app
echo BUILD DONE $DAPP_PUB_KEY
# node -e "setInterval(()=>{},1000);"
/**
 * @namespace 
 * @alias module:app.dapp_info
 * @property {string}  DAPP_PUB                 - dapp pub key.
 * @property {string}  pub                      - dapp pub key.
 * @property {string}  name                     - The name of the app.
 * @property {array}  relay_peers              - The default treasure.
 */
var dapp_info  = {};

if(process.env.DAPP_KEY){
    dapp_info.DAPP_KEY = process.env.DAPP_KEY;
    console.log('process.env.DAPP_KEY',process.env.DAPP_KEY)
}

dapp_info.pub = dapp_info.DAPP_PUB = "SRmb-SMPPB_5NU13ncuOh5LgHL1alp6jfZcjZKSIunE.8J_26wW0sTF1fW-6bCQhMVtYftYHoDTKw27o0n1u3h4";

dapp_info.name= "peersocial.io";
dapp_info.relay_peers = ["www.peersocial.io", "dev.peersocial.io"];

module.exports = dapp_info;

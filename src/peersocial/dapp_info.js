var dapp_info  = {};

if(process.env.DAPP_KEY){
    dapp_info.DAPP_KEY = process.env.DAPP_KEY;
    console.log('process.env.DAPP_KEY',process.env.DAPP_KEY)
}
/**
 * @type {string}
 * @static
 * @alias module:app.dapp_info.DAPP_PUB
 * @readonly
 */
dapp_info.DAPP_PUB = "SRmb-SMPPB_5NU13ncuOh5LgHL1alp6jfZcjZKSIunE.8J_26wW0sTF1fW-6bCQhMVtYftYHoDTKw27o0n1u3h4";
/**
 * @type {string}
 * @static
 * @alias module:app.dapp_info.name
 * @readonly
 */
dapp_info.name= "peersocial.io";
/**
 * @type {array}
 * @static
 * @alias module:app.dapp_info.relay_peers
 * @readonly
 */
dapp_info.relay_peers = ["www.peersocial.io", "dev.peersocial.io"];
/**
 * @type {string}
 * @static
 * @alias module:app.dapp_info.pub
 * @readonly
 */
dapp_info.pub = dapp_info.DAPP_PUB;

module.exports = dapp_info;

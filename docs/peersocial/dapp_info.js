var dapp_info  = {
    DAPP_KEY : process.env.DAPP_KEY,
    DAPP_PUB : "SRmb-SMPPB_5NU13ncuOh5LgHL1alp6jfZcjZKSIunE.8J_26wW0sTF1fW-6bCQhMVtYftYHoDTKw27o0n1u3h4",
}


dapp_info.name= "peersocial.io";
dapp_info.relay_peers = ["www.peersocial.io", "dev.peersocial.io"];
dapp_info.pub = dapp_info.DAPP_PUB;

module.exports = dapp_info;

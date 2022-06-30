
if (typeof define == "undefined"){
    require("amd-loader");
}

module.exports = require("./src/peersocial/server").start();
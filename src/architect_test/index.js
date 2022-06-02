

if (typeof define == "undefined"){
    require("amd-loader");
}



var architect = require("../peersocial/lib/architect");
var events = require("events");



architect.loadConfig("./package.json",function(err, config){

    console.log(err, config);
})

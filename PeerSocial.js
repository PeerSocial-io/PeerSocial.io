
var casheControl = 0;//1000 * 60 * 60;

var port = process.env.PORT || 8000;
var https = require('https');
var http = require('http');
var express = require('express');
var Gun = require('gun');

//require('gun/axe');// is there a GUN BUG with this?

var app = express();



var GUNDIR = require('path').dirname(require.resolve("gun"));
app.use("/fido2-onlykey/gun/examples/",express.static(GUNDIR + "/examples"));
var commonify = require(__dirname+ "/public/fido2-onlykey/commonify.js");
app.use('/fido2-onlykey/gunjs/', commonify(GUNDIR));
app.use('/fido2-onlykey/commonify/', commonify(__dirname+ "/public/fido2-onlykey/public"));
app.use("/fido2-onlykey/",express.static(__dirname+ "/public/fido2-onlykey/public"));


app.use("/gun",express.static(require('path').dirname(require.resolve("gun")),{ maxAge: casheControl }));
app.use(express.static(__dirname + "/public",{ maxAge: casheControl }));
app.use(Gun.serve);

app.use("/gun-examples/",express.static(require('path').dirname(require.resolve("gun")) + "/examples",{ maxAge: casheControl }));


app.use(function(req,res,next){
    res.sendFile( require("path").join( __dirname, 'public', 'index.html' ));
});

var server = http.createServer(app).listen(port);

var gun = Gun({ file: 'radata', web: server , super:true, stats:true});

// require('gun/lib/stats');
gun.opt({peers: ["https://www.peersocial.io/gun"]});
// gun.opt({peers: ["https://gunjs.herokuapp.com/gun"]})
// gun.opt({peers: ["https://gun-us.herokuapp.com/gun"]})
// gun.opt({peers: ["https://gun-eu.herokuapp.com/gun"]})

console.log('Server started on port ' + port + ' with /gun');



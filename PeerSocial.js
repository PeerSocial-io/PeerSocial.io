
var port = process.env.PORT || 8000;
var https = require('https');
var http = require('http');
var express = require('express');
var Gun = require('gun');
//require('gun/axe');

var app = express();

var GUNDIR = require('path').dirname(require.resolve("gun"));
app.use("/fido2-onlykey/gun/examples/",express.static(GUNDIR + "/examples"));
var commonify = require(__dirname+ "/public/fido2-onlykey/commonify.js");
app.use('/fido2-onlykey/gunjs/', commonify(GUNDIR));
app.use('/fido2-onlykey/commonify/', commonify(__dirname+ "/public/fido2-onlykey/public"));

app.use("/fido2-onlykey/",express.static(__dirname+ "/public/fido2-onlykey/public"));


app.use(express.static(__dirname + "/public"));
app.use(Gun.serve);

var server = http.createServer(app).listen(port);

var gun = Gun({ file: 'data', web: server , super:false});

console.log('Server started on port ' + port + ' with /gun');



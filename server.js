var selfsigned = process.env.PORT ? false : require('selfsigned'); //require('selfsigned');


var port = process.env.PORT || 8765;
var https = require('https');
var http = require('http');
var express = require('express');
var Gun = require('gun');
require('gun/axe');

var app = express();
app.use(express.static(__dirname + "/public"));

app.use(Gun.serve);


var server;

if (selfsigned){
var attrs = null; //[{ name: 'commonName', value: '127.0.0.' }];
var pems = selfsigned.generate(attrs, { days: 365 });

// we will pass our 'app' to 'https' server

    server = https.createServer({
            key: pems.private,
            cert: pems.cert
        }, app)
        .listen(port);
}else{
    server = http.createServer(app)
        .listen(port);
}

var gun = Gun({ file: 'data', web: server });

console.log('Server started on port ' + port + ' with /gun');

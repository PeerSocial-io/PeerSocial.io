
var casheControl = 0;//1000 * 60 * 60;

var port = process.env.PORT || 8000;
var https = require('https');
var http = require('http');
var express = require('express');
var Gun = require('gun');

require('gun/axe');// is there a GUN BUG with this?

var app = express();

app.use("/gun",express.static(require('path').dirname(require.resolve("gun")),{ maxAge: casheControl }));
app.use(express.static(__dirname + "/public",{ maxAge: casheControl }));
app.use(Gun.serve);

var server = http.createServer(app).listen(port);

var gun_peers = ["https://www.peersocial.io/gun"];

if(process.env.ISMASTERPEER)
    gun_peers = [];
    
var gun = Gun({ 
    peers: gun_peers, 
    file: 'radata', 
    web: server , 
    super:true, 
    stats:true});
    
    
require("./server_api/gunfs/gunfs.js")(gun,app);

app.use(function(req,res,next){
    res.sendFile( require("path").join( __dirname, 'public', 'index.html' ));
});

console.log('Server started on port ' + port + ' with /gun');



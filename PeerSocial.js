
var casheControl = process.env.HTTP_MAXAGE || 0;//1000 * 60 * 60;

var port = process.env.PORT || 8765;
//var https = require('https');
var http = require('http');
var express = require('express');
var Gun = require('gun');

Gun.log = function(){};
Gun.log.once = function(){};
    
    
require('gun/axe');// is there a GUN BUG with this?

var app = express();

app.use("/gun",express.static(require('path').dirname(require.resolve("gun")),{ maxAge: casheControl }));
app.use(express.static(__dirname + "/public",{ maxAge: casheControl }));
app.use(Gun.serve);

var server = http.createServer(app).listen(port);

var gunOptions = { 
    peers: ["https://www.peersocial.io/gun"], 
    file: 'radata', 
    web: server , 
    super:true, 
    stats:true
};

if(process.env.ISMASTERPEER){
  gunOptions = { 
        peers: [], 
        file: 'radata', 
        web: server , 
        super:true, 
        stats:true
    };  
}
var gun = Gun(gunOptions);
    

if(process.env.ISMASTERPEER){
}else{
    var mesh = gun.back('opt.mesh'); // DAM;
    mesh.say({ dam: 'opt', opt: { peers: 'https://www.peersocial.io/gun' } });
}
require("./server_api/gunfs/gunfs.js")(gun,app);

app.use(function(req,res,next){
    res.sendFile( require("path").join( __dirname, 'public', 'index.html' ));
});

console.log('Server started on port ' + port + ' with /gun');





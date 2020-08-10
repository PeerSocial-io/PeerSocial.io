module.exports = {
    start: function(nw_app, $console, nwCallback) {
        var console;
        if($console)
            console =  $console;
        else
            console = window.console;
            
            
        var port = process.env.PORT || 8765;

        var http = require('http');

        var Gun = require('gun');


        require('gun/axe'); // is there a GUN BUG with this?
        require('gun/lib/webrtc');
        
        require("gun/sea"); 

        // Gun.log = console.log;
        // Gun.log.once = console.log;


        if (nw_app) {
            nwCallback();
            // require('gun/lib/radix');
            // require('gun/lib/radisk');
            // require('gun/lib/store');
            // require('gun/lib/rindexed');

            // if(nw_app.gun_server){
            //     nwCallback();
            // }else setupServer();
            
            // function setupServer() {
            //     var server = http.createServer().listen(port, function() {
            //         console.log("Local. GunServer Started.")
            //         nw_app.gun_server = server;
                    
            //         nwCallback();
            //     });
            //     var dataDir = process.env.TEMP + "\\ps-radata";
            //     console.log(dataDir) 
            //     var gunOptions = {
            //         peers: ["https://www.peersocial.io/gun"],
            //         // file: dataDir,
            //         // radisk: false,
            //         localStorage: false,
            //         web: server
            //     };
                
            //     nw_app.Gun = Gun;
            //     nw_app.gun = Gun(gunOptions);
                
            // }
        }
        else {
            var casheControl = process.env.HTTP_MAXAGE || 0; //1000 * 60 * 60;
            var express = require('express');
            //var https = require('https');


            var app = express();

            app.use("/gun", express.static(require('path').dirname(require.resolve("gun")), { maxAge: casheControl }));
            app.use(express.static(__dirname + "/public", { maxAge: casheControl }));
            app.use(Gun.serve);

            var server = http.createServer(app).listen(port);

            var gunOptions = {
                peers: ["https://www.peersocial.io/gun"],
                file: 'radata',
                web: server,
                super: false,
                stats: true
            };

            if (process.env.ISMASTERPEER) {
                gunOptions = {
                    peers: [],
                    file: 'radata',
                    web: server,
                    super: true,
                    stats: true
                };
            }
            var gun = Gun(gunOptions);


            if (process.env.ISMASTERPEER) {}
            else {
                // var mesh = gun.back('opt.mesh'); // DAM;
                // mesh.say({ dam: 'opt', opt: { peers: 'https://www.peersocial.io/gun' } });
            }
            require("../../server_api/gunfs/gunfs.js")(gun, app);

            app.use(function(req, res, next) {
                res.sendFile(require("path").join(__dirname, 'public', 'index.html'));
            });

            console.log('Server started on port ' + port + ' with /gun');


        }

    },
};
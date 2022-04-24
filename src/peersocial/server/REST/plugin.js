define(function(require, exports, module) {

    appPlugin.consumes = ["app", "gun", "server", "express"];
    appPlugin.provides = ["REST"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var gun = imports.gun;
        var server = imports.server;
        var express = imports.express;
        var app = server.express_app;

        if (process.env.DAPP_KEY) {
            if (!gun.user().is) {
                var pair = Buffer.from(process.env.DAPP_KEY, "base64").toString("utf8");
                pair = JSON.parse(pair);
                gun.user().auth(pair, function() {
                    console.log("DAPP LOGGEDIN", pair.pub);
                    gun.user().get("body").on((body)=>{
                        console.log("DEPBODY",body);
                    })
                });
            }
        }
        else {
            gun.SEA.pair().then((pair) => {
                pair = JSON.stringify(pair);

                pair = Buffer.from(pair).toString("base64");

                console.log('DAPP_KEY="' + pair + '"');

            });
            return;
        }


        var router = express.Router();

        router.all('/', function(req, res) {
            req.body
            res.json({ good: true });
            
            if(gun.user().is && req.body){
                gun.user().get("body").put(req.body)
            }
        });

        app.use('/api/heroku', router);

        register(null, {
            REST: {
                init: function() {



                    imports.app.on("start", function() {
                
                    });

                }
            }
        });

    }

});
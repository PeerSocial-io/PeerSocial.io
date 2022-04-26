define(function(require, exports, module) {

    appPlugin.consumes = ["app", "gun", "server", "express"];
    appPlugin.provides = ["REST"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var gun = imports.gun;
        var server = imports.server;
        var express = imports.express;
        var app = server.express_app;

        var app_pub = imports.app.dapp_info.DAPP_PUB;
        var is_master = false;

        if (imports.app.dapp_info.DAPP_KEY) {
            if (!gun.user().is) {
                var pair = Buffer.from(imports.app.dapp_info.DAPP_KEY, "base64").toString("utf8");
                pair = JSON.parse(pair);
                gun.user().auth(pair, function() {
                    if (pair.pub == app_pub) {
                        console.log("DAPP PUB LOGGEDIN", app_pub);
                        app_pub = pair.pub;
                        is_master = true;
                    }
                    finalize();
                    // gun.user().get("body").on((body) => {
                    //     console.log("DEPBODY", body);
                    // })
                });
            }
        }
        else if (imports.app.dapp_info.DAPP_PUB) {
            app_pub = imports.app.dapp_info.DAPP_PUB;
            console.log("DAPP PUB", app_pub);
            finalize();
        }
        else {
            gun.SEA.pair().then((pair) => {
                pair = JSON.stringify(pair);

                pair = Buffer.from(pair).toString("base64");

                console.log('DAPP_KEY="' + pair + '"');

            });
            return;
        }

        function finalize() {


            if (is_master) {

                (() => { //add deployed hook to announce updates from heroku
                    var router = express.Router();

                    if (process.env.HEROKY_DEPLOYED_KEY)
                        router.all('/' + process.env.HEROKY_DEPLOYED_KEY, function(req, res) {

                            if (gun.user().is && req.body) {
                                var deploy = {
                                    app: req.body.app,
                                    app_uuid: req.body.app_uuid,
                                    git_log: req.body.git_log,
                                    head: req.body.head,
                                    head_long: req.body.head_long,
                                    prev_head: req.body.prev_head,
                                    release: req.body.release,
                                    url: req.body.url,
                                    user: req.body.user
                                };
                                gun.user().get("release").put(deploy,()=>{
                                    res.json({ good: gun.user().is ? true : false, pub: app_pub});
                                });
                            }
                        });

                    app.use('/api/heroku', router);
                })();
            }
            else {
                gun.user("~"+app_pub).get("release").on((deploy) => {
                    console.log("DEPBODY", deploy);
                })
            }

            register(null, {
                REST: {
                    init: function() {
                        imports.app.on("start", function() {});
                    }
                }
            });

        }
    }

});
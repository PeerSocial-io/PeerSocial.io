// define(function(require, exports, module) {

appPlugin.consumes = ["app", "gun", "server", "express"];
appPlugin.provides = ["dapp_login"];

module.exports = appPlugin;

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
            gun.user().auth(pair, function(res) {
                if (!res.err) {
                    if (pair.pub == app_pub) {
                        console.log("DAPP PUB LOGGEDIN", app_pub);
                        app_pub = pair.pub;
                        is_master = true;
                    }
                    gun.user().get("peersocial_dapp").once(function(peersocial_dapp){
                        if(!peersocial_dapp) {
                            gun.user().get("peersocial_dapp").put({
                                enabled: "yes",
                                callback: "localhost"
                            });
                            gun.user().get("pub").put(app_pub);
                            console.log("peersocial_dapp created!")
                        }
                    });
                    finalize();
                }
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


        register(null, {
            dapp_login: {
                init: function() {
                    imports.app.on("start", function() {

                        gun.get("~" + app_pub).get("release").get("peersocial").once(function(deploy, a) {
                            if (deploy && deploy.release && deploy.domain) {
                                if (deploy.domain == "www.peersocial.io") {
                                    var releaseID = parseInt(deploy.release.toString().replace("v", ""));
                                    console.log("current release", releaseID);

                                    gun.get("~" + app_pub).get("release").get("peersocial").on((deploy) => {
                                        var check_releaseID = parseInt(deploy.release.toString().replace("v", ""));
                                        if (releaseID < check_releaseID) {
                                            releaseID = check_releaseID
                                            console.log("release!", releaseID, deploy);
                                        }
                                    })

                                }
                            }
                        })

                    });
                }
            }
        });

    }
}

// });
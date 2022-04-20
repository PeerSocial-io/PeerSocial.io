define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["nw_app"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var nw = window.nw || false;
        window.name = "PeerSocial"
        
        var nw_app = window.nw_app;
        
        if(!nw_app && window.nw)
         nw_app = nw.Window.get();
        // // console.log(window.nw_app.test())
        // nw_app_core.require = imports.app.nw.require("./nw_app_require.js");
        // r.resolve("./nw_app");

        // var server = r("../server.js");


        // server.start(nw_app_core, console, function() {

        if (nw)
            nw.Window.open("https://www.peersocial.io/blank.html", { id: "node-onlykey", show: false }, function(new_win) {

                var ONLYKEY = require("@trustcrypto/node-onlykey/src/onlykey-api");

                ONLYKEY((OK) => {
                    var ok = OK();
                    // ok.derive_public_key("", 1, false, (err, key) => {
                    //     console.log(key)
                    // });


                    register(null, {
                        nw_app: {
                            init: function() {
                                console.log("nw-app loaded", nw_app)
                            },
                            window: window.nw_app,
                            onlykey: ok
                        }
                    });
                }, false, new_win.window);

            })



        // });
    }

});
define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["nw_app"];

    return appPlugin;

    function appPlugin(options, imports, register) {
        
        var nw = imports.app;
        window.name = "PeerSocial"
        
        var nw_app = window.nw_app;
        // // console.log(window.nw_app.test())
        // nw_app_core.require = imports.app.nw.require("./nw_app_require.js");
        // r.resolve("./nw_app");

        // var server = r("../server.js");


        // server.start(nw_app_core, console, function() {

        register(null, {
            nw_app: {
                init: function() {
                    console.log("nw-app loaded", nw_app)
                }
            }
        });

        // });
    }

});
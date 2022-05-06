// define(function(require, exports, module) {

appPlugin.consumes = ["app", "gun", "server", "express", "dapp_login"];
appPlugin.provides = ["REST"];

module.exports = appPlugin;

function appPlugin(options, imports, register) {

    var { app, express, server } = imports;

    var express_app = server.express_app;

    var router = express.Router()
    // route to trigger the capture
    router.get('/rebuild', function(req, res) {
        res.send('OK')
    });

    finalize();


    function finalize() {


        register(null, {
            REST: {
                init: function() {
                    app.on("start", function() {

                        console.log("REST started");

                    });
                },
                router: express.Router,
                api: function(base, api) {
                    if(typeof api == "function" && typeof base == "string")
                        express_app.use(base, api(express.Router(), base));
                }
            }
        });

    }
}

// });
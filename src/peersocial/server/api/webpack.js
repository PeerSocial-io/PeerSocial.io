// define(function(require, exports, module) {

appPlugin.consumes = ["app", "gun", "server", "express", "dapp_login", "REST"];
appPlugin.provides = ["api_webpack"];

module.exports = appPlugin;

function appPlugin(options, imports, register) {

    var { app, REST } = imports;

    var EventEmitter = require("events").EventEmitter;

    var outStream;

    const config = require('../../../../webpack.config.js');
    const webpack = require('webpack');

    var ProgressPlugin = require('webpack/lib/ProgressPlugin');

    var compiler = webpack(config);

    config.plugins.push(new ProgressPlugin(function(percentage, msg) {
        console.log((percentage * 100) + '%', msg);
    }));

    function runCompiler(req, res) {
        res.header('transfer-encoding', 'chunked');
        res.set('Content-Type', 'text/json');
        
        res.setTimeout(120000, function() {
            console.log('Request has timed out.');
            // res.send(408);
            res.end();
        });

        if (webpackRunning) {
            outStream.on("end", function(chunk) {
                res.write(chunk);
                res.end();
            });
            outStream.on("write", function(chunk) {
                res.write(chunk);
            });
            outStream.emit("write", "Running");
            return;
        }
        webpackRunning = true;

        outStream = new EventEmitter();
        outStream.on("end", function(chunk) {
            res.write(chunk);
            res.end();
        });
        outStream.on("write", function(chunk) {
            res.write(chunk);
        });
        compiler.run((err, stats) => {
            webpackRunning = false;
            if (err) {
                return outStream.emit("end", err);
            }
            outStream.emit("end", stats.toJson({
                assets: false,
                hash: true,
            }));
        });
        outStream.emit("write", "Started");

    }

    // compiler.run(function(err, stats) {
    //     // ...
    // });

    var webpackRunning = false;

    REST.api("/rebuild", function(router) {

        // route to trigger the capture
        router.get('/webpack', runCompiler);
        return router;

    });

    finalize();


    function finalize() {


        register(null, {
            api_webpack: {
                init: function() {
                    app.on("start", function() {

                        console.log("api_webpack started");

                    });
                }
            }
        });

    }
}

// });
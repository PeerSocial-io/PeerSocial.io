var architect = require("./lib/architect");
var events = require("events");

require("./lib/native.history.js");

var provable = require("./lib/provable.min");
window.jQuery = require("./lib/jquery");
window.$ = window.jQuery;

var config = [];

require("./config.js")(config);

setTimeout(function() {

    if (window.nw_app || window.nw) {
        config.push(require("./nw_app/nw_app"));
    }

    (function() {

        appPlugin.consumes = ["hub"];
        appPlugin.provides = ["app", "provable"];

        function appPlugin(options, imports, register) {
            var app = new events.EventEmitter();
            app.events = events;
            app.nw = window.nw;
            register(null, {
                app: app,
                provable: provable
            });
        }

        config.push(appPlugin);
    })();

    architect(config, function(err, app) {
        if (err) return console.error(err.message);
        for (var i in app.services) {
            if (app.services[i].init) app.services[i].init(app);
            app.services.app[i] = app.services[i];
        }

        app.services.app.emit("start");


    });
}, 500)
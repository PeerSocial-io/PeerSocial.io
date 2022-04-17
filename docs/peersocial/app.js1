var architect = require("./lib/architect");
var events = require("events");

require("./lib/native.history.js");

var provable = require("./lib/provable.min");
window.jQuery = require("./lib/jquery");
window.$ = window.jQuery;


var config = [
    require("./welcome/plugin"),

    //"start/start",

    require("./state/plugin"),
    require("./layout/plugin"),
    require("./gun/plugin"),
    require("./user/plugin"),
    require("./profile/plugin"),
    require("./peers/plugin"),
    //"peerapp/plugin",
    // require("./peerapp_v2/plugin"),
    // require("./gun-fs/plugin"),

    
];

setTimeout(function() {

    // if(window.nw_app_core){
    //     config.push(require("./nw_app/nw_app"));
    // }

    (function() {

        appPlugin.consumes = ["hub"];
        appPlugin.provides = ["app", "provable"];

        function appPlugin(options, imports, register) {
            var app = new events.EventEmitter();
            app.nw = window.nw;
            register(null, {
                app: app,
                provable: provable,
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
module.exports = {
    start: function() {

        require("amd-loader");
        var architect = require("./lib/architect");
        var events = require("events");

        var config = [require("./server/plugin"),require("./server/REST/plugin")];

        require("./config.js")(config , true);

        
        (function() {
            appPlugin.provides = ["app"];
            appPlugin.consumes = ["hub"];

            function appPlugin(options, imports, register) {
                var app = new events.EventEmitter();
                app.server = true;
                app.events = events;
                register(null, {
                    app: app
                });
            }

            config.push(appPlugin);
        })();

        (function() {
            architect(config, function(err, app) {
                if (err) return console.error(err.message);
                for (var i in app.services) {
                    if (app.services[i].init) app.services[i].init(app);
                    app.services.app[i] = app.services[i];
                }

                app.services.app.emit("start");

                    
                if (process.send) process.send("ready");
            });
        })();

    },
};

var server = module.exports = {
    start: function () {
        var starter = new Promise((resolve) => {
            setTimeout(function () {
            var architect = require("./lib/architect");

            var events = require("events");
            
            var  server_plugin =  require("./server/plugin");

            if (starter.plugins)
                server_plugin.plugins = [].concat(starter.plugins);    
            if (starter.expose)
                server_plugin.expose = [].concat(starter.expose);     

            var config = [
                server_plugin,
                require("./server/dapp_login"),

                require("./server/rest"),
                // require("./server/api/webpack"), 

            ];

            (function () {
                appPlugin.provides = ["app"];
                appPlugin.consumes = ["hub"];

                function appPlugin(options, imports, register) {
                    var app = new events.EventEmitter();
                    app.dapp_info = require("./dapp_info");
                    app.server = true;
                    app.events = events;
                    app.window = typeof window != "undefined" ? window : global;
                    register(null, {
                        app: app
                    });
                }

                config.push(appPlugin);
            })();

            if (starter.config)
                config = [].concat(config, starter.config);            

            (function () {

                architect(config, function (err, app) {
                    if (err) return console.error(err.message);
                    for (var i in app.services) {
                        if (app.services[i].init) app.services[i].init(app);
                        app.services.app[i] = app.services[i];
                    }

                    
                    resolve(app);

                    setTimeout(function () {
                        app.services.app.emit("start");


                        if (process.send) process.send("ready");

                    }, 500);

                });
            })();
            
            }, 500);
        });

        return starter;

    },
};

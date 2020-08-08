require.config({
    baseUrl: '/peersocial',
    paths: {
        ejs: 'lib/ejs',
        events: 'lib/events',
        text: 'lib/text',
        showdown: 'lib/showdown.min',
        gunfs: 'lib/gunfs'
    }
});

require(["lib/architect", "events"],
    function(architect, events) {
        architect.resolveConfig([
            "welcome/plugin",
            
            //"start/start",
            
            "state/plugin",
            "layout/plugin",
            "gun/plugin",
            "user/plugin",
            "profile/plugin",
            "peers/plugin",
            //"peerapp/plugin",
            "peerapp_v2/plugin",
            "gun-fs/plugin"
        ], function(err, config) {
            config.push({
                packagePath: "app",
                provides: ["app"],
                consumes: ["hub"],
                setup: (options, imports, register) => {
                    register(null, {
                        app: new events.EventEmitter()
                    });
                }
            });
            if (err) throw err;
            architect.createApp(config, function(err, app) {
                if (err) return window.alert(err.message);
                for (var i in app.services) {
                    if (app.services[i].init) app.services[i].init(app);
                    app.services.app[i] = app.services[i];
                }
                
                app.services.app.emit("start");
                
            });
        });

    });
var architect = require("./lib/architect");
var events = require("events");

window.architect = architect;


require("./lib/native.history.js");

var provable = require("./lib/provable.min");
window.jQuery = require("./lib/jquery");
window.$ = window.jQuery;

var config = [];

require("./config.js")(config);

// config = config.concat(package_config);

function RUN(fn, timeout) {
    if (!timeout)
        fn();
    else
        setTimeout(fn, timeout);
}

RUN(function () {

    if (window.nw_app || window.nw) {
        config.push(require("./nw_app/nw_app"));
    }

    (function () {

        appPlugin.consumes = ["hub"];
        appPlugin.provides = ["app", "provable", "babel", "architect"];

        var babel = require("@babel/standalone/babel.js");

        function appPlugin(options, imports, register) {
            /**
             * @module app
             * @description App Instance
             */
            imports.app = new events.EventEmitter();
            var app = imports.app;
            app.hub = imports.hub;
            /**
             * @type {boolean}
             * @static
             * @alias module:app.debug
             * @default false
             */
            app.debug = process.env.DEBUG;
            /**
             * @type {string}
             * @static
             * @alias module:app.source_version
             */
            app.source_version = process.env.SOURCE_VERSION;
            /**
             * @type {object}
             * @static
             * @alias module:app.dapp_info
             * @ignore declare docs in source
             */
            app.dapp_info = require("./dapp_info");
            /**
             * @type {object}
             * @static
             * @alias module:app.package
             */
            app.package = require("../../package.json");
            /**
             * @type {module}
             * @static
             * @alias module:app.events
             * @summery `new events.EventEmitter();`
             */
            app.events = events;
            app.nw = window.nw;
            /**
             * @type {object}
             * @static
             * @alias module:app.window
             */
            app.window = window;
            register(null, {
                app: app,
                /**
                 * @module imports.provable
                 * @description Additional Lib
                 * @private
                 * @summary [website](https://github.com/daywiss/provable)
                 */
                provable: provable,

                /**
                 * @module imports.babel
                 * @description Additional Lib
                 * @private
                 * @summary [website](https://babeljs.io/)
                 */
                babel: babel,
                architect: architect
            });
        }

        config.push(appPlugin);
    })();

    architect(config, function (err, app) {
        if (err) return console.error(err.message);

        if (app.services.app.debug)
            window.$app = app.services.app; //so we can access it in devConsole

        for (var i in app.services) {
            if (app.services[i].init) app.services[i].init(app);
            app.services.app[i] = app.services[i];
        }


        architect.loadConfig("/package.json", function (err, package_config) {
            var count = 0;
            for (var i in package_config)
                ++count;
            if (count == 0)
                app.services.app.emit("start");
            else
                app.loadAdditionalPlugins(package_config, function (err, $app, additionalPlugins) {

                    for (var i in additionalPlugins) {
                        if (additionalPlugins[i].init) additionalPlugins[i].init(app);
                        app.services.app[i] = app.services[i];
                    }

                    app.services.app.emit("start");
                })

        })

    });
}, 0)
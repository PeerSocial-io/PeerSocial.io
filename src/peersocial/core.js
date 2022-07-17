var architect = require("./lib/architect");
var events = require("events");

require("./lib/native.history.js");

var provable = require("./lib/provable.min");
window.jQuery = require("./lib/jquery");
window.$ = window.jQuery;

(function (requirejs) {
    architect.requirejs = requirejs;

    // config = config.concat(package_config);

    // function RUN(fn, timeout) {
    //     if (!timeout)
    //         fn();
    //     else
    //         setTimeout(fn, timeout);
    // }

    // RUN(function () {
    var PeerSocialIO = function (config) {

        if (!config || !(config instanceof Array))
            config = [];


        config.push(require("./service/plugin"));
        config.push(require("./react_vue/plugin"));
        config.push(require("./layout/plugin"));
        config.push(require("./state/plugin"));
        config.push(require("./terminal/plugin"));

        if (window.nw_app || window.nw) {
            config.push(require("./nw_app/nw_app"));
        }

        (function () {

            appPlugin.consumes = ["hub"];
            appPlugin.provides = ["app", "provable", "architect"];

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

                    architect: architect
                });
            }

            config.push(appPlugin);
        })();

        architect(config, function (err, app) {
            if (err) return console.error(err.message);

            app.services.app.$app = app;

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
    }


    var babel = require("@babel/standalone/babel.js");
    var amdPreset = require("@babel/plugin-transform-modules-amd").default;
    var commonjsPreset = require("@babel/plugin-transform-modules-commonjs").default;
    babel.registerPlugin("amd", amdPreset);
    babel.registerPlugin("commonjs", commonjsPreset);

    // requirejs.config({
    //     babel: babel
    // })

    // if (!(typeof window == "undefined")) {
    //     if (!window.require) window.require = requirejs;
    // } else {
    //     requirejs.nodeRequire = $require;
    //     requirejs.config({
    //         nodeRequire: $require
    //     });
    //     if (!(typeof global == "undefined")) {
    //         global.requirejs = requirejs;
    //     }
    //     if (!(typeof globalThis == "undefined")) {
    //         globalThis.requirejs = requirejs;
    //     }
    // }

    requirejs(["/app/app.js"],function(config){
        
        requirejs.config({
            babel: babel
        })

        PeerSocialIO(config)
    })
})(require("./lib/require"));

// if (typeof window == "object") {
//     if (!window.PeerSocial)
//         window.PeerSocial = {
//             io: PeerSocialIO
//         };
// } else
//     module.exports = PeerSocialIO;
// }, 0)
// define(function (require, exports, module) {
/* globals $ */
appPlugin.consumes = ["hub", "architect", "app", "terminal"];
appPlugin.provides = ["plugins"];
import require from "require";

function appPlugin(options, imports, register) {

  const {
    app,
    terminal
  } = imports;

  terminal.on("load", function (args, term, pause) {
    console.log(args, term)
    pause();
    require(args._, function (mod) {
      if(!mod) return pause(true);
      // console.log(mod)
      term.writeln("loaded " + typeof mod + " "+ JSON.stringify(args._) )
      app.$app.loadAdditionalPlugins(
        [mod],
        function (err, $app, additionalPlugins) {
          for (var i in additionalPlugins) {
            if (additionalPlugins[i].init) additionalPlugins[i].init(app);
            $app.services.app[i] = additionalPlugins[i];
            $app.services.app.emit("plugin-loaded", i);
            term.writeln("plugin applied " + i )
          }
          pause(true);
        })

    });
  })

  var architect = imports.architect;


  function Plugin() {}

  var objectKeys = [
    "is",
    "preventExtensions",
    "isExtensible",
    "freeze",
    "isFrozen",
    "seal",
    "isSealed"
  ]

  for (var i of objectKeys) {
    ((i) => {
      if (Object[i])
        Plugin.prototype[i] = function (...args) {
          return Object[i].apply(null, [this].concat(args));
        }
    })(i)
  }

  Object.freeze(Plugin.prototype)
  Object.freeze(Plugin)

  var loadAppPlugin = function (config) {

    appPlugin.consumes = ["hub"];
    appPlugin.provides = ["plugin"];

    function appPlugin(options, imports, register) {
      var app = new imports.app.events.EventEmitter();
      app.hub = imports.hub;
      app.debug = imports.app.debug;
      app.source_version = imports.app.source_version;
      Object.freeze(app)
      register(null, {
        app: app
      });

    }

    config.push(appPlugin);
    return config;
  }
  var additional_plugins;
  register(null, {
    plugins: additional_plugins = {
      Plugin: Plugin,
      load: function (packagePath) {
        var config = loadAppPlugin([]);
        architect(config, function (err, app) {
          if (err) return console.error(err.message);

          if (app.services.app.debug)
            window.$app[packagePath] = app.services.app; //so we can access it in devConsole

          for (var i in app.services) {
            if (app.services[i].init) app.services[i].init(app);
            app.services.app[i] = app.services[i];
          }

          additional_plugins[packagePath] = app;

          app.services.app.emit("start");
        })
      }
    }
  });

}

export default appPlugin;
// });
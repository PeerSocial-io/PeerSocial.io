/* globals $ */
appPlugin.consumes = ["hub", "architect", "app"];
appPlugin.provides = ["plugins"];

function appPlugin(options, imports, register) {

  const {
    app
  } = imports;

  var savedPlugins = window.sessionStorage.savedPlugins;
  if(savedPlugins)
    savedPlugins = JSON.parse(window.sessionStorage.savedPlugins)
  
  var terminal = app.terminal;
  var loadedPlugins = {};
  if (terminal) {
    terminal.help["plugin"] = "initialize plugin into app";
    terminal.on("plugin", function (args, term, pause) {

      var args_help = {};

      args_help["--github"] = "loads plugin from github. ex --github=PeerSocial-io/PeerCode/master/examples/calculator/plugin.js";
      if (args.github) {
        console.log(args, term)
        pause();
        var githubProvider = 'https://raw.githubusercontent.com/';
        var pluginUrl = githubProvider + args.github;
        loadPlugins([pluginUrl], function(didntLoad, url, plugins_list){
          loadedPlugins[url] = plugins_list;
          return pause(true);
        })
        return;
      }

      args_help["--load"] = "plugin1 plugin2 ...";
      if (args.load) {
        console.log(args, term)
        pause();
        loadPlugins(args._, function(didntLoad){
          return pause(true);
        })        
        return;
      }

      args_help["--load-saved"] = "loads saved plugins";
      if (args["load-saved"]) {
        for(var i in savedPlugins){
          term.writeln(i + " " + savedPlugins[i])
        }  
        loadPlugins(savedPlugins, function(didntLoad, url, plugins_list){
            loadedPlugins[url] = plugins_list;
            pause(true);
        });
        return;
      }      

      args_help["--save"] = "save loaded plugins";
      if (args.save) {
        var pluginsList = [];
        for(var i in loadedPlugins){
          pluginsList.push(i)
        }
        window.sessionStorage.savedPlugins = JSON.stringify(pluginsList);
        savedPlugins = pluginsList;
        return;
      }

      args_help["--reset"] = "reset saved plugins";
      if (args.reset) {
        var pluginsList = [];
        window.sessionStorage.savedPlugins = JSON.stringify(pluginsList);
        savedPlugins = pluginsList;
        return;
      }

      args_help["--list"] = "list loaded plugins";
      if (args.list) {
        for(var i in loadedPlugins){
          term.writeln(i + " :  "+JSON.stringify(loadedPlugins[i]))
        }
        return;
      }

      args_help["--list-saved"] = "list saved plugins";
      if (args["list-saved"]) {
        for(var i in savedPlugins){
          term.writeln(savedPlugins[i])
        }  
        return;
      }

      args_help["--url"] = "shows full url to path ex. --url=$URL";
      if (args.url) {
        var context = require.s.newContext("contextName");
        // debugger;
        term.writeln(require.toUrl(args.url))
        return;
      }

      for (var i in args_help) {
        term.writeln(i + " " + args_help[i])
      }

    })
  }


  function loadPlugins(plugins, done){
    for(var i in plugins){
      plugins[i] = require.toUrl(plugins[i]);
    }
    require(plugins, function (...mods) {
      if (!mods[0]) return done(true);
      app.$app.loadAdditionalPlugins(
        mods,
        function (err, $app, additionalPlugins) {
          if(err) return done(err);          
          var url = plugins[0], plugins_list = [];
          for (var i in additionalPlugins) {
            if (additionalPlugins[i].init) additionalPlugins[i].init(app);
            $app.services.app[i] = additionalPlugins[i];
            $app.services.app.emit("plugin-loaded", i);
            terminal.term.writeln("plugin applied " + i)
            plugins_list.push(i);
          }
          done(null, url, plugins_list);
        })
    });
  }

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
      init:function(){
        loadPlugins(savedPlugins, function(didntLoad, url, plugins_list){
            loadedPlugins[url] = plugins_list;
        });
      },
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
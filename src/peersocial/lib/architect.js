"use strict";
define(function ($require, exports, module) {

  var requirejs = $require("./require.js");
  var babel = require("@babel/standalone/babel.js");
  var amdPreset = require("@babel/plugin-transform-modules-amd").default;
  var commonjsPreset = require("@babel/plugin-transform-modules-commonjs").default;
  babel.registerPlugin("amd", amdPreset);
  babel.registerPlugin("commonjs", commonjsPreset);

  requirejs.config({
    babel: babel
  })

  if (!(typeof window == "undefined")) {
    if (!window.require) window.require = requirejs;
  } else {
    requirejs.nodeRequire = $require;
    requirejs.config({
      nodeRequire: $require
    });
    if (!(typeof global == "undefined")) {
      global.requirejs = requirejs;
    }
    if (!(typeof globalThis == "undefined")) {
      globalThis.requirejs = requirejs;
    }
  }

  /**
   * 
   * The MIT License
   * 
   * Copyright (c) 2012 ajax.org B.V
   * 
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   * 
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   */
  var events = require("events");
  var EventEmitter = events.EventEmitter;


  function createApp(config, callback) {
    var app;
    try {
      app = new Architect(config);
    } catch (err) {
      if (!callback) throw err;
      return callback(err, app);
    }
    if (callback) {
      app.on("error", done);
      app.on("ready", onReady);
    }
    return app;

    function onReady(app) {
      done();
    }

    function done(err) {
      if (err) {
        app.destroy();
      }
      app.removeListener("error", done);
      app.removeListener("ready", onReady);
      callback(err, app);
    }
  }

  var exports = createApp;
  exports.createApp = createApp;
  exports.Architect = Architect;

  // Check a plugin config list for bad dependencies and throw on error
  function checkConfig(config, lookup) {

    // Check for the required fields in each plugin.
    config.forEach(function (plugin) {
      if (typeof plugin == "function") plugin.setup = plugin;
      if (plugin.checked) {
        return;
      }
      if (!plugin.hasOwnProperty("setup")) {
        throw new Error("Plugin is missing the setup function " + JSON.stringify(plugin));
      }
      if (!plugin.hasOwnProperty("provides")) {
        throw new Error("Plugin is missing the provides array " + JSON.stringify(plugin));
      }
      if (!plugin.hasOwnProperty("consumes")) {
        throw new Error("Plugin is missing the consumes array " + JSON.stringify(plugin));
      }
    });

    return checkCycles(config, lookup);
  }

  function checkCycles(config, lookup) {
    var plugins = [];
    config.forEach(function (pluginConfig, index) {
      plugins.push({
        packagePath: pluginConfig.packagePath,
        provides: pluginConfig.provides.concat(),
        consumes: pluginConfig.consumes.concat(),
        i: index
      });
    });

    var resolved = {
      hub: true
    };
    var changed = true;
    var sorted = [];

    while (plugins.length && changed) {
      changed = false;

      plugins.concat().forEach(function (plugin) {
        var consumes = plugin.consumes.concat();

        var resolvedAll = true;
        for (var i = 0; i < consumes.length; i++) {
          var service = consumes[i];
          if (!resolved[service] && (!lookup || !lookup(service))) {
            resolvedAll = false;
          } else {
            plugin.consumes.splice(plugin.consumes.indexOf(service), 1);
          }
        }

        if (!resolvedAll)
          return;

        plugins.splice(plugins.indexOf(plugin), 1);
        plugin.provides.forEach(function (service) {
          resolved[service] = true;
        });
        sorted.push(config[plugin.i]);
        changed = true;
      });
    }

    if (plugins.length) {
      var unresolved = {};
      plugins.forEach(function (plugin) {
        delete plugin.config;
        plugin.consumes.forEach(function (name) {
          if (unresolved[name] === false)
            return;
          if (!unresolved[name])
            unresolved[name] = [];
          unresolved[name].push(plugin.packagePath);
        });
        plugin.provides.forEach(function (name) {
          unresolved[name] = false;
        });
      });

      Object.keys(unresolved).forEach(function (name) {
        if (unresolved[name] === false)
          delete unresolved[name];
      });

      var unresolvedList = Object.keys(unresolved);
      var resolvedList = Object.keys(resolved);
      var err = new Error("Could not resolve dependencies\n" +
        (unresolvedList.length ? "Missing services: " + unresolvedList :
          "Config contains cyclic dependencies" // TODO print cycles
        ));
      err.unresolved = unresolvedList;
      err.resolved = resolvedList;
      throw err;
    }

    return sorted;
  }

  function Architect(config) {
    EventEmitter.apply(this);
    var app = this;
    app.config = config;
    app.packages = {};
    app.pluginToPackage = {};

    var isAdditionalMode;
    var services = app.services = {
      hub: app
    };

    // Check the config
    var sortedPlugins = checkConfig(config);

    var destructors = [];
    var recur = 0,
      callnext, ready;

    function startPlugins(additional) {
      var plugin = sortedPlugins.shift();
      if (!plugin) {
        ready = true;
        return app.emit(additional ? "ready-additional" : "ready", app);
      }

      var imports = {};
      if (plugin.consumes) {
        plugin.consumes.forEach(function (name) {
          imports[name] = services[name];
        });
      }

      var m = /^plugins\/([^\/]+)|\/plugins\/[^\/]+\/([^\/]+)/.exec(plugin.packagePath);
      var packageName = m && (m[1] || m[2]);
      if (!app.packages[packageName]) app.packages[packageName] = [];


      try {
        recur++;
        plugin.setup(plugin, imports, register);
      } catch (e) {
        e.plugin = plugin;
        app.emit("error", e);
        throw e;
      } finally {
        while (callnext && recur <= 1) {
          callnext = false;
          startPlugins(additional);
        }
        recur--;
      }

      function register(err, provided) {
        if (err) {
          return app.emit("error", err);
        }
        plugin.provides.forEach(function (name) {
          if (!provided.hasOwnProperty(name)) {
            var err = new Error("Plugin failed to provide " + name + " service. " + JSON.stringify(plugin));
            err.plugin = plugin;
            return app.emit("error", err);
          }
          services[name] = provided[name];
          app.pluginToPackage[name] = {
            path: plugin.packagePath,
            package: packageName,
            version: plugin.version,
            isAdditionalMode: isAdditionalMode
          };
          app.packages[packageName].push(name);

          app.emit("service", name, services[name], plugin);
        });
        if (provided && provided.hasOwnProperty("onDestroy"))
          destructors.push(provided.onDestroy);

        app.emit("plugin", plugin);

        if (recur) return (callnext = true);
        startPlugins(additional);
      }
    }

    // Give createApp some time to subscribe to our "ready" event
    setTimeout(startPlugins);

    this.loadAdditionalPlugins = function (additionalConfig, callback) {
      isAdditionalMode = true;

      exports.resolveConfig(additionalConfig, function (err, additionalConfig) {
        if (err) return callback(err);

        var ap = [];
        for (var plugin of additionalConfig) {
          if (plugin.provides)
            ap = [].concat(ap, plugin.provides)
        }
        app.once(ready ? "ready-additional" : "ready", function (app) {
          var $ap = {};

          for (var i in ap) {
            $ap[ap[i]] = app.services[ap[i]];
          }
          callback(null, app, $ap);
        }); // What about error state?

        // Check the config - hopefully this works
        var _sortedPlugins = checkConfig(additionalConfig, function (name) {
          return services[name];
        });

        if (ready) {
          sortedPlugins = _sortedPlugins;
          // Start Loading additional plugins
          startPlugins(true);
        } else {
          _sortedPlugins.forEach(function (item) {
            sortedPlugins.push(item);
          });
        }
      });
    };

    this.destroy = function () {
      destructors.forEach(function (destroy) {
        destroy();
      });

      destructors = [];
    };
  }
  Architect.prototype = Object.create(EventEmitter.prototype, {
    constructor: {
      value: Architect
    }
  });

  Architect.prototype.getService = function (name) {
    if (!this.services[name]) {
      throw new Error("Service '" + name + "' not found in architect app!");
    }
    return this.services[name];
  };



  // Only define Node-style usage using sync I/O if in node.
  if (typeof module === "object")(function () {
    var path = require('path');
    var url = require('url');
    var dirname = path.dirname;
    var resolve = path.resolve;
    // var exists = require('fs').exists || require('path').exists;
    // var realpath = require('fs').realpath;
    var packagePathCache = {};
    var basePath;

    exports.loadConfig = loadConfig;
    exports.resolveConfig = resolveConfig;

    // This is assumed to be used at startup and uses sync I/O as well as can
    // throw exceptions.  It loads and parses a config file.
    function loadConfig(configPath, callback) {
      var isJSON = (configPath.toString().substr(-4) == "json");
      //isJSON ? "text!" + configPath : 
      requirejs([configPath], function (config) {
        // if (isJSON) config = JSON.parse(config).plugins;
        var base = dirname(configPath);

        resolveConfig(config.plugins, base, callback);
      });
    }

    function resolveConfig(config, base, callback) {
      if (typeof base === 'function') {
        // probably being called from loadAdditionalConfig, use saved base
        callback = base;
        base = basePath;
      } else {
        basePath = base;
      }
      resolveConfigAsync(config, base, callback);
    }

    function resolveConfigAsync(config, base, callback) {
      function resolveNext(i) {
        if (i >= config.length) {
          return callback(null, config);
        }

        var plugin = config[i];

        // Shortcut where string is used for plugin without any options.
        if (typeof plugin === "string") {
          plugin = config[i] = {
            packagePath: plugin
          };
        }
        // The plugin is a package on the disk.  We need to load it.
        if (plugin.hasOwnProperty("packagePath") && !plugin.hasOwnProperty("setup")) {
          var $base = base;
          if (plugin.packagePath.indexOf("http") == 0) {
            $base = plugin.packagePath + "/";
            plugin.packagePath = ".";
          }
          resolveModule($base, plugin.packagePath, function (err, defaults) {
            if (err) return callback(err);

            Object.keys(defaults).forEach(function (key) {
              if (!plugin.hasOwnProperty(key)) {
                plugin[key] = defaults[key];
              }
            });
            plugin.packagePath = defaults.packagePath;
            if (!plugin.setup)
              try {
                plugin.setup = requirejs(plugin.packagePath);
              } catch (e) {
                return callback(e);
              }

            return resolveNext(++i);
          });
          return;
        }

        return resolveNext(++i);
      }

      resolveNext(0);
    }

    // Loads a module, getting metadata from either it's package.json or export
    // object.
    function resolveModule(base, modulePath, callback) {
      resolvePackage(base, modulePath + "/package.json", function (err, packagePath) {
        //if (err && err.code !== "ENOENT") return callback(err);

        var metadata = {};
        if (!err) {
          try {
            packagePath && requirejs([packagePath], function (packageJson) {

              metadata = packageJson.plugin || {};

              (function (next) {
                if (err) {
                  //@todo Fabian what is a better way?
                  resolvePackage(base, modulePath + ".js", next);
                } else if (packagePath) {
                  // next(null, dirname(packagePath));
                  if (packagePath.indexOf("http") == 0) {
                    next(null, url.parse(packagePath).protocol + "//" + url.parse(packagePath).hostname + path.join(dirname(url.parse(packagePath).path), packageJson.main));
                  } else
                    next(null, path.join(dirname(packagePath), packageJson.main));
                } else {
                  resolvePackage(base, modulePath, next);
                }
              })(function (err, modulePath) {
                if (err) return callback(err);

                requirejs([modulePath], function (module) {

                  metadata.provides = module.provides || metadata.provides || [];
                  metadata.consumes = module.consumes || metadata.consumes || [];
                  metadata.packagePath = modulePath;
                  if (typeof module == "function")
                    metadata.setup = module;
                  callback(null, metadata);
                });
              });
            })

          } catch (e) {
            return callback(e);
          }
        }

      });
    }

    function resolvePackage(base, packagePath, callback) {
      var originalBase = base;
      if (!packagePathCache.hasOwnProperty(base)) {
        packagePathCache[base] = {};
      }
      var cache = packagePathCache[base];
      if (cache.hasOwnProperty(packagePath)) {
        return callback(null, cache[packagePath]);
      }
      if (packagePath[0] === "." || packagePath[0] === "/") {
        var newPath;
        if (base.indexOf("http") == 0)
          newPath = url.resolve(base, packagePath);
        else
          newPath = resolve(base, packagePath);
        // exists(newPath, function (exists) {
        //     if (exists) {
        // realpath(newPath, function (err, newPath) {
        //     if (err) return callback(err);

        cache[packagePath] = newPath;
        return callback(null, newPath);
        // });
        //     } else {
        //         var err = new Error("Can't find '" + packagePath + "' relative to '" + originalBase + "'");
        //         err.code = "ENOENT";
        //         return callback(err);
        //     }
        // });
      } else {
        tryNext(base);
      }

      function tryNext(base) {
        if (base == "/") {
          var err = new Error("Can't find '" + packagePath + "' relative to '" + originalBase + "'");
          err.code = "ENOENT";
          return callback(err);
        }

        var newPath = resolve(base, "node_modules", packagePath);
        // exists(newPath, function (exists) {
        //     if (exists) {
        // realpath(newPath, function (err, newPath) {
        //     if (err) return callback(err);

        cache[packagePath] = newPath;
        return callback(null, newPath);
        // });
        //     } else {
        //         var nextBase = resolve(base, '..');
        //         if (nextBase === base)
        //             tryNext("/"); // for windows
        //         else
        //             tryNext(nextBase);
        //     }
        // });
      }
    }


  }());

  /*
  exports.loadConfig = loadConfig;

  function loadConfig(path, callback) {
      requirejs(["text!" + path], function (config) {
          config = JSON.parse(config);
          resolveConfig(config, callback);
      });
  }

  var path = requirejs("path");

  exports.resolveConfig = resolveConfig;

  function resolveConfig(config, base, callback, errback) {
      if (typeof base == "function")
          return resolveConfig(config, "", arguments[1], arguments[2]);

      var paths = [],
          pluginIndexes = {};
      config.plugins.forEach(function (plugin, index) {
          // Shortcut where string is used for plugin without any options.
          if (typeof plugin === "string") {
              plugin = config.plugins[index] = {
                  packagePath: plugin
              };
          }
          // The plugin is a package over the network.  We need to load it.
          if (plugin.hasOwnProperty("packagePath") && !plugin.hasOwnProperty("setup")) {
              paths.push("text!" + path.join((base || ""), plugin.packagePath, "./package.json"));
              pluginIndexes["text!" + path.join((base || ""), plugin.packagePath, "./package.json")] = index;
          }
      });
      requirejs(paths, function () {
          var args = arguments;
          var $paths = [],
              $pluginIndexes = {};
          paths.forEach(function (name, i) {
              var module;
              if (name.substr(-4) == "json")
                  module = JSON.parse(args[i]);
              else
                  module = args[i];
              var plugin = config.plugins[pluginIndexes[name]];
              plugin.package = module;
              plugin.provides = module.provides || plugin.provides || [];
              plugin.consumes = module.consumes || plugin.consumes || [];

              if (plugin.hasOwnProperty("packagePath") && !plugin.hasOwnProperty("setup")) {
                  var p = path.join((base || ""), plugin.packagePath, "./" + path.join("./", plugin.package.main || "index.js"))
                  $paths.push(p);
                  $pluginIndexes[p] = i;
              }

          });
          requirejs($paths, function () {
              var args = arguments;
              $paths.forEach(function (name, i) {
                  var plugin = config.plugins[$pluginIndexes[name]];
                  var module = args[i];
                  plugin.provides = module.provides || plugin.provides || [];
                  plugin.consumes = module.consumes || plugin.consumes || [];
                  plugin.setup = module
              })

              if (callback)
                  callback(null, config.plugins);
          });
      }, errback);
  }

  */

  module.exports = exports;
});
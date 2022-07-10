
import config from "./config.js";

/* globals $ */

appPlugin.consumes = ["hub", "architect", "app", "terminal"];
appPlugin.provides = ["config"];


function appPlugin(options, imports, register) {

  var config_plugin = {}

  console.log(config)

  // var config = require("./config.js")

  // config(config_plugin)

  register(null, {
    config: config_plugin
  });
}

export default appPlugin;
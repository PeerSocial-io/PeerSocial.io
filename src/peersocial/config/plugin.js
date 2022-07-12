/* globals $ */

appPlugin.consumes = ["terminal"];
appPlugin.provides = ["config"];

import config from "./config.js";

function appPlugin(options, imports, register) {

  const config_plugin = config;

  imports.terminal.on("config", (args, terminal) => {
    terminal
  })

  register(null, {
    config: config_plugin
  });
}

export default appPlugin;
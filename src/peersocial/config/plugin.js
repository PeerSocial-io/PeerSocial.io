/* globals $ */

appPlugin.consumes = ["terminal"];
appPlugin.provides = ["config"];

import config from "./config.js";

function appPlugin(options, imports, register) {

  const config_plugin = config;

  imports.terminal.help["config"] = "runs config plugin terminal command";
  imports.terminal.on("config", (args, terminal) => {
    terminal.writeln("hello from config plugin")
  })

  register(null, {
    config: config_plugin
  });
}

export default appPlugin;
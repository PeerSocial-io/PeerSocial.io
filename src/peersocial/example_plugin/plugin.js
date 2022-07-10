/* globals $ */
appPlugin.consumes = [];
appPlugin.provides = ["example_plugin"];

function appPlugin(options, imports, register) {

  var example_plugin = {}

  register(null, {
    example_plugin: example_plugin
  });
}

export default appPlugin;
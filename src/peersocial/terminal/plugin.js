define(function(require, exports, module) {

  /* globals $ */
  appPlugin.consumes = ["app"];
  appPlugin.provides = ["terminal"];

  return appPlugin;

  function appPlugin(options, imports, register) {

    var Terminal = require("xterm").Terminal;

      register(null, {
          terminal: {
              init: function() {
                
                var term = new Terminal();
                // term.open(document.getElementById('terminal'));
                // term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
                
              }
          }
      });

  }

});
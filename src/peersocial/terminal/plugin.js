define(function (require, exports, module) {

  /* globals $ */
  appPlugin.consumes = ["app"];
  appPlugin.provides = ["terminal"];

  return appPlugin;

  function appPlugin(options, imports, register) {

    var Terminal =  require("xterm").Terminal;
    var FitAddon = require("xterm-addon-fit").FitAddon;
    var minimist = require('minimist');
    var Readline = require('xterm-readline').Readline;
    var EventEmitter = imports.app.events.EventEmitter;

    var terminal_plugin = new EventEmitter();
    terminal_plugin.init = function () {

      var isOpen = (window.localStorage.termOpen ? window.localStorage.termOpen == 'false' : true) ;

      // var style = require("text!./xterm.css.html");
      var style = require("./xterm.css.html");
      $("head").append(style);

      var term = new Terminal();
      var terminal_container = $("<div/>");
      var terminal = $("<div/>");
      terminal_container.append(terminal)

      terminal.css("position", "fixed")
      terminal.css("left", 0)
      terminal.css("right", 0)
      terminal.css("top", $(".navbar")[0].offsetHeight)
      terminal.css("bottom", 0)

      $("body").append(terminal_container)

      var fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      var rl = new Readline();
      term.loadAddon(rl);

      term.open(terminal[0]);
      fitAddon.fit();
      clear();
      toggle_terminal();

      term.onData(send => {
				if(send.charCodeAt(0) == 24){ //ctrl+x
					clear();
          setTimeout(readLine,10);
					return;
				}
        if(send.charCodeAt(0) == 18){ //ctrl+r
					terminal_plugin.emit("reload")
					return;
				}
        else console.log(send.charCodeAt(0))
			});

      var headers = [
        "Developer Console v0.0.1 \x1B[1;3;31mxterm.js\x1B[0m\r\n"
      ];

      function header() {
        for (var i in headers) {
          term.write(headers[i]);
        }
      }

      function clear() {
        term.clear();
        header();
      }

      rl.setCheckHandler((text) => {
        let trimmedText = text.trimEnd();
        if (trimmedText.endsWith("&&")) {
          return false;
        }
        return true;
      });

      function readLine() {
        rl.read("PeerSocial.io >")
          .then(processLine);
      }

      function processLine(text) {;
        var args = text.split(" ");
        var cmd = args.shift();
        var argv = minimist(args);
        console.log(cmd, argv);
        terminal_plugin.emit(cmd, argv, term);
        setTimeout(readLine);
      }

      function toggle_terminal() {
        if (isOpen) {
          isOpen = false;
          terminal_container.hide();
        } else {
          isOpen = true;

          terminal.css("position", "fixed")
          terminal.css("left", 0)
          terminal.css("right", 0)
          terminal.css("top", $(".navbar")[0].offsetHeight)
          terminal.css("bottom", 0)

          terminal_container.show();
          fitAddon.fit();
          term.focus();
          setTimeout(readLine,10);

        }
        window.localStorage.termOpen = isOpen;
      }

      $(".navbar-brand[href='/']").on("click", (e) => {
        if (!e.altKey)
          return;
        else
          e.preventDefault();

        toggle_terminal()
      })

      $(document).on("keyup", (e) => {
        var pd = false;
        if (!e.altKey)
          return;

        if (e.key = "`") {
          pd = true;
          // console.log(e)
          toggle_terminal()
        }

        if (pd) e.preventDefault()
      })

    }

    terminal_plugin.help = {
      "?": "Show Help",
      "reload": "reload the app (ctrl+r)"
    };
    terminal_plugin.on("?", function(args, term){
      for(var i in terminal_plugin.help){
        term.writeln(i + " " + terminal_plugin.help[i]);
      }
    })

    terminal_plugin.on("reload", function(args, term){
      window.location = window.location.toString();
    })

    
    register(null, {
      terminal: terminal_plugin
    });

  }

});
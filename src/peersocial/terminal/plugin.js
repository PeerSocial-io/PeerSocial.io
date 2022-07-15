define(function (require, exports, module) {
  
  /* globals $ */
  (function($) {
    $.each(['show', 'hide'], function(i, ev) {
      var el = $.fn[ev];
      $.fn[ev] = function() {
        var e = el.apply(this, arguments);
        this.trigger("on"+ev);
        return e;
      };
    });
  })(jQuery);

  appPlugin.consumes = ["app"];
  appPlugin.provides = ["terminal"];

  return appPlugin;

  function appPlugin(options, imports, register) {

    var Terminal =  require("xterm").Terminal;
    var FitAddon = require("xterm-addon-fit").FitAddon;
    var minimist = require('minimist');
    var Readline = require('xterm-readline').Readline;
    var EventEmitter = imports.app.events.EventEmitter;

    var terminal_container;

    var terminal_plugin = new EventEmitter();
    terminal_plugin.init = function () {

      var isOpen = (window.localStorage.termOpen ? window.localStorage.termOpen == 'false' : true) ;

      // var style = require("text!./xterm.css.html");
      var style = require("./xterm.css.html");
      $("head").append(style);

      var term = new Terminal();
      terminal_container = $("<div/>");
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

      setTimeout(function(){
        clear();
        fitAddon.fit();
        toggle_terminal();
      },50);
      

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
        // else console.log(send.charCodeAt(0))
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
        var pause = false, triggered = false;

        terminal_plugin.emit(cmd, argv, term, function(unpause){
          if(!unpause) return pause = true;
          else {
            if(!triggered)
              readLine()
            pause = false;
          }
        });
        setTimeout(function(){
          if(pause) return;
          triggered = true;
          readLine()
        },100);
      }

      function toggle_terminal() {
        if (isOpen) {
          terminal_container.hide();
        } else {
          
          terminal_container.show();
          

        }
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

      terminal_container.on("onhide",function(){
        isOpen = false;
        window.localStorage.termOpen = isOpen;
      })

      terminal_container.on("onshow",function(){
        isOpen = true;
        window.localStorage.termOpen = isOpen;

        
        terminal.css("position", "fixed")
        terminal.css("left", 0)
        terminal.css("right", 0)
        terminal.css("top", $(".navbar")[0].offsetHeight)
        terminal.css("bottom", 0)

        fitAddon.fit();
        term.focus();
        setTimeout(readLine,10);
      })

    }

    terminal_plugin.help = { "?": "Show Help" };
    terminal_plugin.on("?", function(args, term){
      for(var i in terminal_plugin.help){
        term.writeln(i + " " + terminal_plugin.help[i]);
      }
    })

    terminal_plugin.help["reload"] = "reload the app (ctrl+r)";
    terminal_plugin.on("reload", function(args, term){
      window.location = window.location.toString();
    })

    terminal_plugin.help["exit"] = "closes terminal";
    terminal_plugin.on("exit", function(args, term){
      terminal_container.hide();
    })

    
    register(null, {
      terminal: terminal_plugin
    });

  }

});
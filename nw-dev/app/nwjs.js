/* globals nw*/

var DEBUG = false;


var clog = console.log;
// var util = require("util");
console.log = function() {
  clog.apply(console, arguments);
  var a = Array.from(arguments);
  process.stdout.write(a.join(" ") + '\n');
};


var events = require("events");

// var Gun = require("gun");

// var gun = Gun({});

var win;

function setupWin() {
  win = nw.Window.get();
  if (window.global.nw_app_core) return;

  window.global.nw_app_core = new events.EventEmitter();
  var nw_app_core = window.global.nw_app_core;
  nw_app_core.win = {};

  // win.showDevTools();

  nw.App.on('open', launch);

}

var handleExit = true;

function exitHandler(options, exitCode) {
  // if (options.cleanup){
  //   console.log('clean');
  // } 
  if (exitCode)  console.log("exitCode",exitCode);
  if (options.exit) {

    var nw_app_core = window.global.nw_app_core;

    for (var i in nw_app_core) {
      var new_win = nw_app_core[i];
      if (new_win && new_win.close)
        new_win.close(true);
    }
  
    // setTimeout(nw.App.quit,1000);
    // win = nw.Window.get();
    win.close(true);
    console.log("EXITING");
    // setTimeout(process.exit, 1000);
    // return 1;
  }
}

if (handleExit) {
  process.stdin.resume(); //so the program will not close instantly
  process.on('exit', exitHandler.bind(null, { cleanup: true }));
  process.on('SIGINT', exitHandler.bind(null, { exit: true }));
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
}

function openWindow(pageURL, server) {
  var nw_app_core = window.global.nw_app_core;
  var WINDOW_ID = "test-window:" + pageURL;


  // if(!nw_app_core.win[WINDOW_ID])
  nw.Window.open(pageURL, { id: WINDOW_ID, show: true }, function(new_win) {

    // if(DEBUG) 
      new_win.showDevTools();
    nw_app_core.win[WINDOW_ID] = new_win;
    

    new_win.on("loaded", function() {
      // fire();
      loadAPI();
      console.log("loaded");
    });

    function fire() {

      loadAPI();

      // new_win.window.document.body.innerHTML = "";
      var out = new_win.window.eval(`new Promise( (resolutionFunc,rejectionFunc) => {
        if(!(typeof require == "undefined")) require("./node-onlykey/dist/onlykey3rd-party.js")((ONLYKEY) => resolutionFunc(ONLYKEY()), false, window);
      });`);
      out.then((ok) => {
        ok.derive_public_key("", 1, false, (err, key) => {

          console.log(null, key);
          // new_win.close();
        });

      });
      // console.log("DOMContentLoaded");
    }

    function loadAPI() {
      new_win.window.nw_app = new_win;
    }
    // loadAPI();

    new_win.on('close', function() {
      console.log("closed window,", WINDOW_ID)
      this.hide(); // Pretend to be closed already
      delete nw_app_core.win[WINDOW_ID];
      server.kill();
      
      // new_win.close(true);
      // delete nw_app_core.win[WINDOW_ID];
      win.close(true); // then close it forcefully
      new_win.close(true);
      nw.App.quit();
    });

  });

}

setupWin();

function setupServer(port, cb) {
  // var fs = require('fs');
  var path = require("path");
  var cp = require('child_process');
  var fork = cp.fork;


  // if (window.global.http_server) return;
  var http_server = fork('server.js', [], {
    env: {
      PORT: port,
      GEN_HTTPS: true
    },
    cwd: path.resolve("./", '../..')
  })

  http_server.on('close', (code) => {
    console.log(`http_server process close all stdio with code ${code}`);
  });

  http_server.on('exit', (code) => {
    console.log(`http_server process exited with code ${code}`);
  });

  http_server.on("message", (message) => {
    if (message == "ready" && cb) cb(http_server);
  })

  // setupWin();

  // return http_server;
}

function findPort(cb) {
  var net = require('net');
  var srv = net.createServer(function() {});
  srv.listen(0, function() {
    var p = srv.address().port;
    srv.close(function() {
      cb(p);
    });
  });

}

async function launch(args) {
  // win.show();

  // chrome.developerPrivate.openDevTools({
  //   renderViewId: -1,
  //   renderProcessId: -1,
  //   extensionId: chrome.runtime.id
  // })


  // var port = 8765;//await getPort();
  
  if(DEBUG) win.showDevTools();

  findPort(function(port) {


    setupServer(port, (server) => {

      // var $args = {
      //   port: port
      // };

      // var pageURL = "./app.html";
      
      var pageURL = "https://localhost:" + port + "/";
      
      // var pageURL = "https://dev.peersocial.io/";
      // var pageURL = "https://www.peersocial.io/blank.html";
      // var pageURL = "about:blank";
      // pageURL = './index.html';


      openWindow(pageURL, server);

    });

  })
}

function quitApp(){
  
}

setTimeout(function() {
  launch(nw.App.argv);
}, 1000);
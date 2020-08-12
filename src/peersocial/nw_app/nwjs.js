var events = require("events");

console.log("Gun", window.Gun);

window.global.nw_app_core = new events.EventEmitter();
var nw_app_core = window.global.nw_app_core;
nw_app_core.win = {};

Object.defineProperty(nw_app_core, "stats", {
  get: function() {

    var path = require("path");
    var __dirname = window.global.__dirname;
    var fileName = path.resolve(__dirname, '../store/radata.stats');
    var fs = require("fs");

    return JSON.parse(fs.readFileSync(fileName, "utf8"));
  }
});

nw_app_core.require = require;

var win = nw.Window.get();
win.showDevTools();
nw.App.on('open', lanucher);

var tray = new nw.Tray({ title: "App Tray", icon: './icon.png' });
var traymenu = new nw.Menu();
tray.menu = traymenu;

traymenu.append(new nw.MenuItem({
  type: 'normal',
  label: 'Exit',
  click: function() {


    nw.App.quit();

  }
}));


traymenu.append(new nw.MenuItem({
  type: 'normal',
  label: 'Open',
  click: function() {

    openWindow();

  }
}));

traymenu.append(new nw.MenuItem({
  type: 'normal',
  label: 'DevTools',
  click: function() {

    win.showDevTools();

  }
}));

win.on('close', function() {
  // Remove the tray
  tray.remove();
  tray = null;
  win.close(true); // then close it forcefully
});



function openWindow() {

  var WINDOW_ID = "test-window";
  var pageURL = "https://www.peersocial.io/";
  // pageURL = './index.html';

  var new_win = nw.Window.open(pageURL, { id: WINDOW_ID }, function(new_win) {
    nw_app_core.win[WINDOW_ID] = new_win;
    nw_app_core.win[WINDOW_ID].nw_app = {
      test: function() {
        return true;
      }
    };

    new_win.on("loading", function() {
      console.log("loading");
      loadAPI();
    });


    new_win.on("loaded", function() {
      loadAPI();
      console.log("loaded");
    });

    function loadAPI() {
      new_win.window.nw_app = nw_app_core.win[WINDOW_ID].nw_app;
      new_win.window.nw_app_core = nw_app_core;
    }
    loadAPI();
    new_win.showDevTools();

    new_win.on('close', function() {
      this.hide(); // Pretend to be closed already
      new_win.close(true);
      // win.close(); // then close it forcefully
    });

  });


}


function gunServerSetup(cb) {

  var port = process.env.PORT || 8765;

  var http = require('http');
  var server = http.createServer().listen(port, function() {

    console.log("Local HTTP. GunServer Started.")
    nw_app_core.gun_server = server;
    var dataDir = global.__dirname + "/../store/radata";
    console.log(dataDir)
    var gunOptions = {
      peers: ["https://www.peersocial.io/gun"],
      file: dataDir,
      radisk: true,
      // localStorage: true,
      web: server
    };

    nw_app_core.Gun = Gun;
    nw_app_core.gun = Gun(gunOptions);

    if (cb) cb()
  });

}

setTimeout(function() {
  gunServerSetup(function() {
    lanucher(nw.App.argv);
  })
}, 2000)

function lanucher(args) {
  // win.show();

  openWindow(args);

}
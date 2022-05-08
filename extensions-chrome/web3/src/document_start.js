(function(chrome) {
  /* global Gun */
  require("gun");
  require("gun/sea");

  var chromeConnect = require("./chrome_connect");

  if (chrome) {

    var port = chrome.runtime.connect({ name: "main" });

    chromeConnect(port, true).then((connection) => {

      connection.on("connected", function(client) {
        console.log("master connected", client)
        client.emit("test1", "test2", "test3")
        client.on("test4", console.log)
      })

    });

  }
}(window.chrome));

((window) => {
    (async(chrome) => {

        require("gun"); /* global Gun */
        require("gun/sea");

        var chromeConnect = require("./chrome_connect");

        var keychain = require("./libs/key_chain");

        var gun = Gun("https://www.peersocial.io/gun");
        var SEA = Gun.SEA;


        chrome.runtime.onConnect.addListener(function(port) {

            chromeConnect(port).then((connection) => {

                connection.on("connected", function(client) {
                    console.log("client connected", client)
                    client.emit("test4", "test5", "test6")
                    client.on("test1",console.log)
                })

            });
        });



    })(window.chrome);

})(globalThis.window = globalThis); /* global globalThis */
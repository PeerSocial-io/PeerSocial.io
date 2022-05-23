((window) => { //background script isolated
    (async(chrome) => {

        console.log("background script")
        require("gun"); /* global Gun */
        require("gun/sea");

        // var chromeConnect = require("./chrome_connect");

        var keychain = require("./libs/key_chain");

        var gunA = Gun();
        var SEA = Gun.SEA;

        var gunB = Gun({ peers: [gunA] });

        // gunA.on("in", (...args) => { console.log("gunA",'in', args) })
        // gunA.on("out", (...args) => { console.log("gunA",'out', args) })
        
        gunB.on("in", (...args) => { console.log("gunB",'in', args) })
        gunB.on("out", (...args) => { console.log("gunB",'out', args) })

        setTimeout(()=>{
            gunA.get("some").get("gunA").put("testA")
            // gunA.get("some").get("gunB").put("tesB")
        },1000)
        
        
        chrome.tabs.onCreated.addListener(
            function(tabId, info, tab) {
                console.log(info, tabId)
            }
        )
        chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
            if (info.status === 'complete' && tab.active) {
                // console.log(info, tabId)
                // your code ...

                // function testing123(){
                //     console.log("test",this);
                // }
                // chrome.scripting.executeScript({
                //         target: { tabId: tabId },
                //         // func: testing123,
                //         files: ["app/document_load.js"]
                //     },
                //     (script) => {

                //         console.log(script)
                //     });
            }
        });

        chrome.runtime.onConnect.addListener(function(port) {
            var {
                name,
                origin,
                id,
                tab
            } = port;

            if (name === "main") {
                port.onMessage.addListener(messageListen);
            }


            async function messageListen(msg) {

                console.log("background script received:", msg);
                port.postMessage({ type: "FROM_BACKGROUND", data: msg });
            }

            /*chromeConnect(port).then((connection) => {

                connection.on("connected", function(client) {
                    console.log("client connected", client)
                    client.on("test7", function(cb) {
                        cb("ok")
                    })
                    // client.emit("test4", "test5", "test6");
                    // client.on("test1",console.log)
                })

            });*/
        });



    })(window.chrome);

})(globalThis.window = globalThis); /* global globalThis */
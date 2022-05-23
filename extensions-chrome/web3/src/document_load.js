(function(window) { //injected NOT isolated

    if (!window.web3) {
        var web3 = window.web3 = {
            start: () => {

                window.addEventListener("message", async(event) => {
                    // We only accept messages from ourselves
                    if (event.source != window) {
                        return;
                    }

                    if (event.data) {
                        if (event.data.type && (event.data.type == "FROM_BACKGROUND")) {
                            console.log("MAIN script received:", event.data);
                            // port.postMessage({ type: "FROM_PAGE", data: event.data });
                        }

                    }
                }, false);
                console.log("window.web3.start executed");
                window.postMessage({ my_message: "test" }, "*");

            }
            // ,Gun: () => {
            //     var $Gun;
            //     if (typeof Gun == "undefined") { // global Gun
            //         $Gun = require("gun");
            //         require("gun/sea");
            //     }
            //     return $Gun;

            // }
        };


        var SEA = window.SEA = {
            name: (async(cb, opt) => {
                try {
                    if (cb) { try { cb() } catch (e) { console.log(e) } }
                    return;
                }
                catch (e) {
                    console.log(e);
                    SEA.err = e;
                    if (SEA.throw) { throw e }
                    if (cb) { cb() }
                    return;
                }
            })
        }

        console.log("document_load script");


        // window.postMessage({ my_message: "test" }, "*");

    }


}(window));

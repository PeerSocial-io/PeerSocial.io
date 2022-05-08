module.exports = async function chromeConnect(port, is_content_script) {
    return new Promise(async(resolve, reject) => {

        var forge = require("node-forge");
        var connection_id = false;
        var connections = {};

        function getID($new) {
            if ($new) {
                connection_id = forge.random.getBytesSync(32);
            }
            return connection_id;
        }

        var loaded = false;
        var client_pair = false;

        var {
            name,
            origin,
            id,
            tab
        } = port;

        /* global Gun */
        var SEA = Gun.SEA;

        var EventEmitter = require("events").EventEmitter;

        var connection = new EventEmitter();

        var my_pair = await SEA.pair();
        var my_pair_public = { pub: my_pair.pub, epub: my_pair.epub };
        if (is_content_script) {


            window.addEventListener("message", async(event) => {
                // We only accept messages from ourselves
                if (event.source != window) {
                    return;
                }

                if (event.data) {
                    console.log("Content script received:", event.data);
                    port.postMessage({ type: "FROM_PAGE", data: event.data });

                }
            }, false);

            port.onMessage.addListener(messageListen);

            window.addEventListener("load", async function() {
                console.log("web3 loaded");
                port.postMessage({ type: "FROM_SCRIPT", data: { load: true, pair: my_pair_public, connection_id: getID(true) } });
            });

        }
        else {
            if (name === "main") {
                port.onMessage.addListener(messageListen);
            }
        }

        async function messageListen(msg) {

            if (msg.type == "FROM_SCRIPT") {
                if (msg.data.connection_id && (msg.data.load || (is_content_script && msg.data.connected))) {
                    if (!connections[msg.data.connection_id]) {
                        connections[msg.data.connection_id] = { pair: msg.data.pair };
                        port.postMessage({ type: "FROM_SCRIPT", data: { load: true, pair: my_pair_public, connection_id: msg.data.connection_id } });
                    }
                    else {
                        if (!is_content_script) {
                            port.postMessage({ type: "FROM_SCRIPT", data: { connected: true, pair: my_pair_public, connection_id: msg.data.connection_id } });
                        }
                        if (true) {
                            var c = new EventEmitter()

                            c.$emit = c.emit;
                            c.emit = function(key, val, cb) {
                                port.postMessage({ type: "FROM_SCRIPT", data: { message: true, connection_id: msg.data.connection_id, key: key, val: val, cb: cb } });
                                return this;
                            };
                            
                            connections[msg.data.connection_id].emitter = c;

                            connection.emit("connected", c);
                        }
                    }
                    return;
                }
                else if (msg.data.connection_id && msg.data.message && connections[msg.data.connection_id].emitter) {
                    connections[msg.data.connection_id].emitter.$emit(msg.data.key, msg.data.val, msg.data.cb);
                    // console.log(msg.data);
                }
            }
        }


        resolve(connection);

    });
};

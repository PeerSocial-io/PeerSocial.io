module.exports = async function chromeConnect(port, is_content_script) {
    return new Promise(async(resolve, reject) => {

        var forge = require("node-forge");
        var connection_id = false;
        var connections = {};
        var callbacks = {};
        
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
                // console.log("web3 loaded");
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
                            var c = new EventEmitter();

                            c.$emit = c.emit;
                            c.emit = function(...args) {
                                for(var i in args){
                                    if(typeof args[i] == "function"){
                                        var cb_id = forge.random.getBytesSync(32);
                                        callbacks[cb_id] = args[i];
                                        args[i] = {callback: cb_id};
                                    }
                                }
                                port.postMessage({ type: "FROM_SCRIPT", data: { message: true, connection_id: msg.data.connection_id, args:args } });
                                return this;
                            };
                            
                            connections[msg.data.connection_id].emitter = c;

                            connection.emit("connected", c);
                        }
                    }
                    return;
                }
                else if (msg.data.connection_id && msg.data.message && connections[msg.data.connection_id].emitter) {
                    for(var i in msg.data.args){
                        if(typeof msg.data.args[i] == "object" && msg.data.args[i].callback){
                            var cb_id = msg.data.args[i].callback;
                            msg.data.args[i] = function(...args){
                                port.postMessage({ type: "FROM_SCRIPT", data: { callback: cb_id, connection_id: msg.data.connection_id, args:args } });
                            };
                        }
                        
                    }
                    connections[msg.data.connection_id].emitter.$emit.apply(connections[msg.data.connection_id].emitter, msg.data.args);
                    return;
                    // console.log(msg.data);
                }else if(msg.data.connection_id && msg.data.callback && callbacks[msg.data.callback]){
                    callbacks[msg.data.callback].apply(callbacks[msg.data.callback], msg.data.args);
                    delete callbacks[msg.data.callback];
                    return;
                }
                return;
            }
        }


        resolve(connection);

    });
};

function SecureRender(sr) {
    //this area has html access

    function loadjsfile(filename, done) {
        var r = document.createElement('script')
        r.setAttribute("type", "text/javascript")
        r.setAttribute("src", filename)
        r.onload = done
        if (typeof r != "undefined") document.getElementsByTagName("head")[0].appendChild(r)
    }

    var ready = false;

    loadjsfile("/peersocial/lib/jquery.js", function () {
        loadjsfile("/peersocial/lib/r.js", function () {
            requirejs(["/peersocial/ace/ace", "/peersocial/ace/mode/javascript", "/gun/gun"], (ace, jsMode, Gun) => {
                (function (Gun, u) {
                    if(!Gun) throw "no Gun?";
                                        
                    Gun.chain.mesh = function(g) {
                        var gun = this._;
                        var root = gun.root,
                            opt = root.opt;
                        return opt.mesh || Gun.Mesh(root);
                    };

                })(Gun);
                
                var gun = Gun();
                
                // peer = { wire: l };
                var peer = {
                    wire:{
                        connected:false,
                        send: (msg) => {
                            // debugger;
                            if (!peer.wire.connected)
                                throw 'not attached';
                            peer.wire.connected(msg);
                        }
                    }
                }

                var mesh = gun.mesh();

                mesh.hi(peer);

                sr.on("gun-data",(msg)=>{
                    if(!peer.wire.connected) peer.wire.connected = function(msg){ sr.emit("gun-data", msg)};
                    // console.log("renderer: gun data in", msg)
                    mesh.hear(msg.data || msg, peer);
                });

                sr.emit("gun-attach");


                sr.events.once("state", (state) => {
                    // debugger;
                    $(function () {
                        
                        function chain(){
                            return gun.get("peersocial-sr").get(key);
                        }
                        
                        var key = state.key || "pastedsd";
                        var timeout = setTimeout(function(){
                                if(!$data)
                                chain().put(state.data);
                            },3000)       
                        var $data, editor, updating = false;
                        chain().on(function(data,key){
                                
                            // debugger;
                            if(data && !$data){
                                $data = data;

                                var container = $('<div id="editor-container"></div>');
                                $(document.body).append(container);
                                var output = $('<div id="output-container"></div>');
                                $(document.body).append(output);

                                //editor setup
                                editor = ace.edit(container[0]);
                                editor.session.setUseWorker(false); //cant importScripts in worker like ace wants
                                var JavaScriptMode = jsMode.Mode;
                                editor.session.setMode(new JavaScriptMode());


                                // sr.emit("ready", "test5412")
                                // sr.events.emit("state_external", "ready42313")
                                
                                
                                editor.session.setValue(data);
                                var timeout;
                                editor.session.on('change', (delta)=>{
                                    // if(timeout) clearTimeout(timeout);
                                    // timeout = setTimeout(()=>{
                                        $data = editor.session.getValue();
                                        if(!updating)
                                            chain().put($data)
                                    // }, 1000)
                                });
                            }else if(data && editor){
                                if(data != $data) {
                                    // debugger;
                                    $data = data;
                                    updating = editor.selection.getCursor();
                                    editor.session.setValue(data);
                                    editor.moveCursorTo(updating.row , updating.column)
                                    updating = false;
                                }
                            }

                        });
                        

                        
                    })
                })

                ready = true;
            })

        })
    })


    return async function () {
        return new Promise((resolve, reject) => {

            // while(!ready){} //do something crazy
            var interval = setInterval(() => {
                if (ready) {
                    clearInterval(interval)
                    resolve(renderer)
                }
            }, 1)


            function renderer(exposed) { //exposed to worker  *must use emit to send events
                //this area has NO! html access
                worker.on("state_external", function (msg) {
                    console.log("context state message", msg)
                });

                exposed().then((exposed) => {
                    // console.log(exposed);
                    if (exposed.state)
                        worker.emit("state", exposed.state);

                })
            }

        })
    }

}
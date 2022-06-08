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
            requirejs(["/peersocial/ace/ace", "/peersocial/ace/mode/javascript", "/gun/gun", "/gun/sea" ], (ace, jsMode) => {
                
                var Gun = window.Gun;
                var gun = Gun(['https://'+window.location.hostname+'/gun']);

                sr.on("ready32", (data) => {
                    console.log("ready32", data)
                });
                sr.events.once("state", (state) => {
                    $(function () {
                        
                        var chain = gun.get(state.key || "pastedsd").get("peersocial-sr");
                        var timeout = setTimeout(function(){
                                if(!$data)
                                    chain.put(state.data);
                            },3000)       
                        var $data;
                        chain.on(function(data,key){
                                
                            if(data && !$data){
                                $data = true;

                                var container = $('<div id="editor-container"></div>');
                                $(document.body).append(container);
                                var output = $('<div id="output-container"></div>');
                                $(document.body).append(output);

                                //editor setup
                                var editor = ace.edit(container[0]);
                                editor.session.setUseWorker(false); //cant importScripts in worker like ace wants
                                var JavaScriptMode = jsMode.Mode;
                                editor.session.setMode(new JavaScriptMode());


                                // sr.emit("ready", "test5412")
                                // sr.events.emit("state_external", "ready42313")
                                
                                
                                editor.session.setValue(data);
                                
                                editor.session.on('change', (delta)=>{
                                    chain.put(editor.session.getValue())
                                });
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
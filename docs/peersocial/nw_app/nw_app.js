define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["nw_app"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var nw = imports.app;
        window.name = "testing_ID"
        var nw_app_core = window.global.nw_app_core;
        // // console.log(window.nw_app.test())
        // var r = imports.app.nw.require("./nw_app_require.js");
        // r.resolve("./nw_app");

        // var server = r("../server.js");


        // server.start(nw_app_core, console, function() {


            register(null, {
                nw_app: {
                    Gun:nw_app_core.Gun,
                    gun:nw_app_core.gun,
                    init: function() {
                        
                        window.gun = nw_app_core.gun;
                        window.Gun = nw_app_core.Gun;
                        var gun = nw_app_core.gun;
                        
                        if(!nw_app_core.added_initPeers){
                            nw_app_core.gun._.opt.wire({url:"https://onlykey.herokuapp.com/gun"});
                            nw_app_core.gun._.opt.wire({url:"https://www.peersocial.io/gun"});
                            nw_app_core.added_initPeers = true;
                        }
                        imports.app.on("nw-home", function() {

                            $("#navbar-nav-right").hide();
                            $("#app-footer").hide();

                            imports.app.ejs.render(require("./services.html"), {
                                nw_app_core: nw_app_core
                            }, { async: true }).then(function(pageOutput) {
                                $("#main-container").html(pageOutput);
                            });
                            
                            setInterval(function(){
                                var content = $("#status-interval");
                                var p = gun._.opt.peers;
                                
                                var output = "";
                                
                                for (var i in p){
                                    if(!p[i].wire) continue;
                                    
                                    var type = (  p[i] instanceof gun._.opt.RTCPeerConnection ? "-RTCPeerConnection" : "");
                                    
                                    output += (p[i].url ? p[i].url : i) + type + " " ;
                                    
                                    output += "readyState:"+p[i].wire.readyState;
                                    output += "<br/>";
                                    
                                }
                                
                                content.html(output);
                                // console.log("gun",nw_app_core.gun); 
                                
                            },1000)


                            // console.log(server)

                            //console.log("app started", imports.app)

                            // imports.app.state.on("anchorchange",()=>{
                            //     console.log(imports.app.state.hash)
                            // })

                            // setInterval(()=>{
                            //     imports.app.state.hash = Date.now().toString();
                            // },1000)
                        })

                    }
                }
            });

        // });
    }

});
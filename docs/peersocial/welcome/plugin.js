define(function(require, exports, module) {

    appPlugin.consumes = ["app", "user", "gun", "state"];
    appPlugin.provides = ["welcome"];
    
    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            welcome: {
                init: function() {
                    
                    
                    imports.state.$hash.on("home",function(){
                        // if(!imports.app.nw_app){
                        if(!imports.gun.user().is){
                            $("#main-container").html(require("./welcome.html"))
                        }else{
                            $("#main-container").html(require("./welcome-user.html"))
                        }
                        // }else{
                        //     imports.app.emit("nw-home");
                        if(imports.app.nw_app) 
                            imports.app.emit("nw_app");
                        // }
                    })
                    
                    
                    imports.app.on("start",function(){
                        
                            var app_pub = imports.app.dapp_info.DAPP_PUB;
                            var gun = imports.gun;
                            
                            gun.get("~" + app_pub).get("release").get("peersocial").once((deploy) => {
                                var releaseID = "";
                                if (deploy && deploy.release && deploy.domain) {
                                    if (deploy.domain == "www.peersocial.io") {
                                        releaseID = parseInt(deploy.release.toString().replace("v",""));
                                        gun.get("~" + app_pub).get("release").get("peersocial").on((deploy) => {
                                            var check_releaseID = parseInt(deploy.release.toString().replace("v",""));
                                            if(releaseID < check_releaseID){
                                                console.log("release!", deploy);
                                            }
                                        })

                                    }
                                }
                            })

                    });
                    
                }
            }
        });

    }

});
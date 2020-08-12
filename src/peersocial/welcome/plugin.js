define(function(require, exports, module) {

    appPlugin.consumes = ["app", "user", "gun", "state"];
    appPlugin.provides = ["welcome"];
    
    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            welcome: {
                init: function() {
                    
                    
                    imports.state.$hash.on("home",function(){
                        if(!imports.app.nw_app){
                            if(!imports.gun.user().is){
                                $("#main-container").html(require("./welcome.html"))
                            }else{
                                $("#main-container").html(require("./welcome-user.html"))
                            }
                        }else{
                            imports.app.emit("nw-home");
                        }
                    })
                    
                    
                    imports.app.on("start",function(){
                        
                    });
                    
                }
            }
        });

    }

});
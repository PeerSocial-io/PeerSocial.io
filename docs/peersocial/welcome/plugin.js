define(function(require, exports, module) {

    appPlugin.consumes = ["app", "user", "gun", "state"];
    appPlugin.provides = ["welcome"];
    
    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            welcome: {
                init: function() {
                    
                    
                    imports.state.$hash.on("home",function(){
                        if(!imports.gun.user().is){
                            $("#main-container").html(require("text!./welcome.html"))
                        }else{
                            $("#main-container").html(require("text!./welcome-user.html"))
                        }
                    })
                    
                    
                    imports.app.on("start",function(){
                        
                    });
                    
                }
            }
        });

    }

});
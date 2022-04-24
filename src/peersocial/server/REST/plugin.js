define(function(require, exports, module) {

    appPlugin.consumes = ["app", "gun", "server"];
    appPlugin.provides = ["REST"];
    
    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            REST: {
                init: function() {
                    
                    
                    
                    imports.app.on("start",function(){
                        
                    });
                    
                }
            }
        });

    }

});
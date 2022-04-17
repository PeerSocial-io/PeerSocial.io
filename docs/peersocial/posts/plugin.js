define(function(require, exports, module) {
    /* global $ */
    appPlugin.consumes = ["app", "user", "gun", "state", "user", "profile", "peer"];
    appPlugin.provides = ["posts"];
    
    return appPlugin;

    function appPlugin(options, imports, register) {

        var _self;

        register(null, {
            posts: _self = {
                init: function() {
                    imports.state.$hash.on("posts", function() {
                        
                        loadPeersPosts();
                        
                    });

                }
            }
        });

    }
    
    function loadPeersPosts(){
        
    }

});
define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["layout"];
    
    var ejs = require("ejs");
    
    return appPlugin;
    /* global $ */
    function appPlugin(options, imports, register) {

        register(null, {
            layout: {
                ejs:ejs,
                
                init: function() {
                    
                },
                get: function($selector){
                    return $($selector);
                },
                
            }
        });

    }

});
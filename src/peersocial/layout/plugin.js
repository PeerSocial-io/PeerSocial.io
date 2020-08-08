define(function(require, exports, module) {

    appPlugin.consumes = ["app","state"];
    appPlugin.provides = ["layout"];
    
    var ejs = require("../lib/ejs");
    
    return appPlugin;
    /* global $ */
    function appPlugin(options, imports, register) {

        register(null, {
            layout: {
                ejs:ejs,
                
                init: function() {
                    
                    imports.state.$hash.on("404", function(currentHash, lastHash) {
                        ejs.render(require("./404-page_not_found.html"), {
                            /* options */
                        }, { async: true }).then(function(pageOutput) {
                            $("#main-container").html(pageOutput);
                        });
                    });
                    imports.state.$hash.on("200", function(currentHash, lastHash) {
                        $("#main-container").html(ejs.render(require("./loading.html")));
                    });
                    
                },
                get: function($selector){
                    return $($selector);
                },
                
            }
        });

    }

});
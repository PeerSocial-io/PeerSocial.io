define(function(require, exports, module) {
"use strict";

    appPlugin.consumes = [];
    appPlugin.provides = ["gunfs"];
    
    var GFS = require("../lib/gunfs");
    
    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            gunfs: GFS
        });

    }

});

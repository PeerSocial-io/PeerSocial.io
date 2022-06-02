define(function (require, exports, module) {
    /* globals $ */
    appPlugin.consumes = ["hub", "app"];
    appPlugin.provides = [];

    function appPlugin(options, imports, register) {

        // var marked = require("https://cdn.jsdelivr.net/gh/markedjs/marked/marked.min.js");
        // console.log("marked", marked)
        // console.log("test additional plugins3");

        register(null, {});

    }

    return appPlugin;
});
define(function(require, exports, module) {
    /* globals $ */
    appPlugin.consumes = ["hub"];
    appPlugin.provides = ["red"];

    function appPlugin(options, imports, register) {

        register(null, {
            red: "red"
        });

    }

    return appPlugin;
});
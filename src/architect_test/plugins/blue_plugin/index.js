define(function(require, exports, module) {
    /* globals $ */
    appPlugin.consumes = ["hub"];
    appPlugin.provides = ["blue"];

    function appPlugin(options, imports, register) {

        register(null, {
            blue: "blue"
        });

    }

    return appPlugin;
});
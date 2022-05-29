define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["react", "vue"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var React = require("react");
        React.dom = require("react-dom/client");
        React.ReactDOM = require("react-dom");
        
        React.createApp = function(App, container) {

            App.prototype = React.Component.prototype;

            var root = React.dom.createRoot(container);

            root.render(React.createElement(App));

            return function() {
                try {
                    root.unmount();
                }
                catch (e) {
                    console.log(e);
                }
            };
        };

        var Vue = require("vue");


        Vue.VueWrapper = require("./VueWrapper");

        register(null, {
            react: React,
            vue: Vue
        });

    }

});
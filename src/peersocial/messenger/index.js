define(function(require, exports, module) {
    /* globals $ */
    appPlugin.consumes = ["app", "state", "react", "vue"];
    appPlugin.provides = ["messenger"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var React = imports.react;
        var ReactDOM = React.ReactDOM;
        var Vue = imports.vue;

        register(null, {
            messenger: {
                init: function() {

                    imports.state.$hash.on("/messenger", function(args, currentState, lastState, onDestroy) {
                        
                        $(".navSaver").addClass("d-none");
                        
                        var Messenger = (function() {
                            
                            var MyVue = Vue.VueWrapper(require("./messenger.vue"));
                            
                            this.render = () => {
                                return <MyVue app={imports.app}/>;
                            };
                            

                        });
                        
                        var container = $("<div/>")[0];
                        
                        $("#main-container").html(container);
                        
                        onDestroy(React.createApp(Messenger, container));
                        
                    });

                }
            }
        });

    }

});
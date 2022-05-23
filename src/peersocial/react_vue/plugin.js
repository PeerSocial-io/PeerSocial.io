define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["react", "vue"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var React = require("react");
        React.dom = require("react-dom/client");
        React.ReactDOM = require("react-dom");


        var Vue = require("vue");


        function VueWrapper(MyVueComponent) {
            MyVueComponent.default ? MyVueComponent = MyVueComponent.default : null;
            return function(componentProps) {
                componentProps = componentProps || {};
                const vueRef = React.useRef(null);
                var vueInstance;


                React.useEffect(() => {
                    if (!vueInstance)
                        Vue.createApp({
                            data() {
                                return { props: componentProps };

                            },
                            render: function(h) {
                                return vueInstance = Vue.h(MyVueComponent, this.props);

                            }
                        }).mount(vueRef.current);

                    return () => {
                      (vueInstance.type.$destroy||function(){}).bind(vueInstance)();
                    };
                }, []);

                return <div ref={vueRef}/>;
            };
        }

        Vue.VueWrapper = VueWrapper;

        register(null, {
            react: React,
            vue: Vue
        });

    }

});
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
            return function( componentProps ) {
                componentProps = componentProps || {};
                const vueRef = React.useRef(null);
                const [vueInstance, setVueInstance] = React.useState(undefined)

                React.useEffect(() => {
                    // async function createVueInstance() {}

                    var v;
                    // createVueInstance()
                    setVueInstance(v = Vue.createApp({
                        data() {
                            return { props: componentProps }
                            
                        },
                        render: function(h) {
                            return Vue.h(MyVueComponent, this.props);

                        }
                    }));
                    v.mount(vueRef.current);

                    return () => {
                        vueInstance ? vueInstance.$destroy() : null
                    };
                }, []);

                React.useEffect(() => {
                    if (vueInstance) {
                        vueInstance.props = vueInstance.props || {};
                        const keys = Object.keys(componentProps)
                        keys.forEach(key => vueInstance.props[key] = componentProps[key])
                    }
                }, [Object.values(componentProps)]);

                return <div id="vue-component" ref={vueRef}></div>;
            };
        }

        Vue.VueWrapper = VueWrapper;

        register(null, {
            react: React,
            vue: Vue
        });

    }

});
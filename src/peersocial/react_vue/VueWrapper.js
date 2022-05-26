var React = require("react");
var Vue = require("vue");

function VueWrapper(MyVueComponent) {
    MyVueComponent.default ? MyVueComponent = MyVueComponent.default : null;
    return function(componentProps) {
        
        componentProps = componentProps || {};
        var vueRef = React.useRef(null);
        var [vueInstance, setVueInstance] = React.useState(undefined)

        // var vueInstance;
        React.useEffect(() => {

            var vi;
            var v = Vue.createApp({
                data() {
                    return { props: componentProps };
                },
                render: function(h) {
                    setVueInstance(vi = Vue.h(MyVueComponent, this.props));
                    return vi;
                }
            });
            v.mount(vueRef.current);

            return v.unmount;
            
        }, []);

        React.useEffect(() => {
            if (vueInstance) {
                const keys = Object.keys(componentProps)
                keys.forEach(key => vueInstance.component.data[key] = componentProps[key])
            }
        }, [Object.values(componentProps)]);

        return <div ref={vueRef}/>;
    };
}
module.exports = VueWrapper;
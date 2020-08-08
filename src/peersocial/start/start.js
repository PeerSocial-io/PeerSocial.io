define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["start"];
    
    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            start: {
                init: function() {
                    
                    imports.app.on("start",function(){
                        //console.log("app started", imports.app)
                        
                        // imports.app.state.on("anchorchange",()=>{
                        //     console.log(imports.app.state.hash)
                        // })
                        
                        // setInterval(()=>{
                        //     imports.app.state.hash = Date.now().toString();
                        // },1000)
                    })
                    
                }
            }
        });

    }

});
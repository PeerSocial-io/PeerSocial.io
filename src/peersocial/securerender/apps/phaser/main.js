//main.js

(function(){

    var code = `
        //no access to html.. only access to exposed returned function in js context script
        var exposed = {
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: {x:-100}
                }
            },
            velocity: {x: 2000, y : 1000},
            particle:{
                speed: 500,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD'
            }
        }

        return exposed;`
        
    SecureRender(  
        code, "6tFKd09AxBA0MxJEk4hVLGB2mjd+26PkRRqzmb2347I=", 
        "./renderer.js#"+   "RG3eejYK/GMTYP8JM6PsMq+f4uZniVkkQ2fjazPYxnI=", 
        "./phaser.css#"+    "WgZswPx81sZj3M9wrjGW43N4epaQosPlGjHpCICitPg=").then(function(pubSub){
        pubSub.on("test2",(data)=>{
            console.log("test2", data)
        })
    });

})();
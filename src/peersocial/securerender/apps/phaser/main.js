//main.js

(function(){
        
    var code = `
        //no access to html.. only access to exposed returned function in js context script
        var exposed = {
            velocity: {x: 2000, y : 1000},
            gravity: {x:-100},
            particle:{
                speed: 25,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD'
            }
        }

        return exposed;`

    SecureRender(  
        code, "hBr3rzkZmyqyJenAt8T9BPe8//KXUzVSKn8ZCr63yyg=", 
        "./renderer.js#DhTJ/QXEpeK2joHotro/S2k7GO049Egs4Yp/v3KkOug=", 
        "./phaser.css#WgZswPx81sZj3M9wrjGW43N4epaQosPlGjHpCICitPg=").then(function(pubSub){
        pubSub.on("test2",(data)=>{
            console.log("test2", data)
        })
    });

})();
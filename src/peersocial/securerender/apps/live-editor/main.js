//main.js

(function(){

    var data = JSON.stringify(`var hello = "world";`);

    var code = `
        //no access to html.. only access to exposed returned function in js context script
        console.log(worker)
        return {
            state: {
                data: ${data}
            }
        };`
        
    SecureRender(  
        code, "", 
        "./renderer.js#"+   "", 
        "./index.css#"+    "").then(function(pubSub){
        pubSub.on("ready",(data)=>{
            console.log("test2", data)
            pubSub.emit("ready32", data)
        })
    });

})();
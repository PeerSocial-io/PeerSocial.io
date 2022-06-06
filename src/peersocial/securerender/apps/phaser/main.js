//main.js

(function(){
        
    var code = `
        //no access to html.. only access to exposed returned function in js context script
        var exposed = {
            start: function () {
                emit("test2","test4");//strings are sent to top layer
                // console.log("embeded script");
            }
        }

        return exposed;`

    SecureRender(code, "5WVMa6q6SXA+LXV6oTgFi5CBCQzoPv0xasqhaMkPz6Y=", "./test.js#Er3WwHyON6BxBKTzzzC0DN9zWVD5bl8D9DfFViiVEuI=").then(function(pubSub){
        pubSub.on("test2",(data)=>{
            console.log("test2", data)
        })
    });

})();
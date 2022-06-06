//main.js

(function(){
        
    var code = `
        //no access to html.. only access to exposed returned function in js context script
        var exposed = {
            start: function () {
                emit("test2","test4");//strings are sent to top layer
                console.log("embeded script");
            }
        }

        return exposed;`

    SecureRender(code, "2wR8m1A344w4GUZf8eWdLikUC3EBlPA1lfm2OZQWK70=", "./test.js#CfDtSPH28tPTih/Ga4Lo8JQw49tXA0D/uuUsLsWu6U0=").then(function(pubSub){
        pubSub.on("test2",(data)=>{
            console.log("test2", data)
        })
    });

})();
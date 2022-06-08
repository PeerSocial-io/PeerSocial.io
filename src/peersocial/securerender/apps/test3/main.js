//main.js

(function(){
        
    var code = `
        //no access to html.. only access to exposed returned function in js context script
        var exposed = {
            start: function () {
                console.log("embeded script");
                return "computed data";
            }
        }

        return exposed;`

        SecureRender(  
            code, "EWLdTLj0kIu+ado9lQcytMuwPYKUAEnOPp1taF6wP6k=", 
            "./test.js#"+   "GTImbVISVWP0Z76CXuZ11EUDHA5Yy8g7aOO2xjtXGpw=").then(function(pubSub){
            pubSub.on("ready",(data)=>{
                console.log("test2", data)
                pubSub.emit("ready32", data)
            })
        });

})();
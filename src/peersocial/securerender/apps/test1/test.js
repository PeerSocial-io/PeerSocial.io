function SecureRender(sr,emit){
    //this area has html access
    console.log(sr);
    sr.events["message"] = function(msg){
        console.log("given context message",msg)
        
        emit("message", "test3");    
    }

    
    
    return function renderer(exposed){//exposed to worker  *must use emit to send events
        //this area has NO! html access
        sr.events["message"] = function(msg){
            console.log("context message",msg)
        }

        emit("message", "test1");

        exposed().then((exposed)=>{
            console.log(exposed);
            exposed.start();
                
        })
    }
    
}
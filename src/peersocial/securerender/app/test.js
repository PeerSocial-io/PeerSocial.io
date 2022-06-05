function SecureRender(sr,emit){

    console.log(sr);
    sr.events["message"] = function(msg){
        console.log("given context message",msg)
        
        emit("message", "test3");    
    }

    
    
    return function renderer(exposed){

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
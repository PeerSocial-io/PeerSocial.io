function SecureRender(sr,emit){
    //this area has html access
    console.log(sr);
    sr.events.on("message", function(msg){
        console.log("given context message",msg)
        
        sr.events.emit("message", "test3");    
    })
  
    
    return async function () {
        return new Promise((resolve, reject) => {

            resolve(renderer);

            function renderer(exposed){
                //this area has NO! html access
                worker.on("message", function(msg){
                    console.log("context message",msg)
                })

                exposed().then((exposed)=>{
                    console.log(exposed);
                    
                    worker.emit("message", exposed.start() );
                        
                })
            }
    
        })
    }

}
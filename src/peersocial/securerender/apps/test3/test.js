function SecureRender(sr){
    //this area has html access
    // console.log(sr);
    sr.events.on("message", function(msg){
        // console.log("given context message",msg)
        
        sr.events.emit("message", "test3");    
    })
  
    
    return async function () {
        return new Promise((resolve, reject) => {

            resolve(renderer);

            function renderer(exposed){//exposed to worker  *must use emit to send events
                //this area has NO! html access
                worker.on("message", function(msg){
                    // console.log("context message",msg)
                })

                worker.emit("message", "test1");

                exposed().then((exposed)=>{
                    console.log(exposed);
                    exposed.start();
                        
                })
            }
    
        })
    }

}
function SecureRender(sr){

    console.log(sr);
    
    return function renderer(exposed){
            
        worker.postMessage("test1");

        exposed().then((exposed)=>{
            console.log(exposed);
            exposed.start();
                
        })
    }
    
}
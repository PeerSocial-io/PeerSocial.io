//main.js

(function(){

    Gun.chain.mesh = function(g) {
        var gun = this._;
        var root = gun.root,
            opt = root.opt;
        return opt.mesh || Gun.Mesh(root);
    };

    var gun = new Gun({peers: ['https://'+window.location.hostname+'/gun'] } );

    var mesh = gun.mesh();
    
    
    var data = JSON.stringify(`var hello = "world";`);

    var code = `
        //no access to html.. only access to exposed returned function in js context script
        // console.log(worker)
        return {
            state: {
                data: ${data}
            }
        };`
        
    SecureRender(  
        code, "", 
        "./renderer.js#"+   "", 
        "./index.css#"+    "").then(function(sr){

        sr.once("gun-attach",(data)=>{

            var peer = {
                wire:{
                    connected:false,
                    send: (msg) => {
                        if (!peer.wire.connected)
                            throw 'not attached';
                        peer.wire.connected(msg);
                    }
                }
            }

            sr.on("gun-data",(msg)=>{
                // console.log("main: gun data in", msg)
                mesh.hear(msg, peer);
            });
            if(!peer.wire.connected) 
                peer.wire.connected = function(msg){ 
                    sr.emit("gun-data", msg)
                };
            
            mesh.hi(peer);

        })

    });

})();
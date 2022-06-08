function SecureRender(sr) {
    //this area has html access
    console.log(sr);
    
    sr.events.on("message", function (msg) {
        console.log("given context message", msg)

        sr.events.emit("message", "test3");
    })

    function loadjscssfile(filename, done) {
        var r = document.createElement('script')
        r.setAttribute("type", "text/javascript")
        r.setAttribute("src", filename)
        r.onload = done
        if (typeof r != "undefined") document.getElementsByTagName("head")[0].appendChild(r)
    }

    var ready = false;

    loadjscssfile("/peersocial/lib/r.js", function () {
        var require = window.requirejs;
        require([
            "/peersocial/additional_plugins/test.js",
            "/peersocial/lib/jquery.js"
        ], function (test) {
            console.log(test)
            ready = true;
        })
    })


    return async function () {
        return new Promise((resolve, reject) => {

            // while(!ready){}
            var interval = setInterval(()=>{
                if(ready){
                    clearInterval(interval)
                    resolve(renderer)
                }
            },1)
            

            function renderer(exposed) { //exposed to worker  *must use emit to send events
                //this area has NO! html access
                worker.on("message", function (msg) {
                    console.log("context message", msg)
                })

                worker.emit("message", "test1");

                exposed().then((exposed) => {
                    console.log(exposed);
                    exposed.start("test");

                })
            }

        })
    }

}
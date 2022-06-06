function SecureRender(sr, emit) {
    //this area has html access
    // console.log(sr);
    
    sr.events["message"] = function (msg) {
        // console.log("given context message", msg)

        emit("message", "test3");
    }

    function loadjsfile(filename, done) {
        var r = document.createElement('script')
        r.setAttribute("type", "text/javascript")
        r.setAttribute("src", filename)
        r.onload = done
        if (typeof r != "undefined") document.getElementsByTagName("head")[0].appendChild(r)
    }

    var ready = false;

    loadjsfile("/peersocial/securerender/apps/phaser/phaser.js", function () {
        loadjsfile("/peersocial/lib/r.js", function () {
            var require = window.requirejs;
            require([
                "/peersocial/securerender/apps/phaser/phaser.js"
            ], function (phaser) {
                var Phaser = window.Phaser;

                console.log(Phaser)

                var config = {
                    type: Phaser.AUTO,
                    width: 800,
                    height: 600,
                    physics: {
                        default: 'arcade',
                        arcade: {
                            gravity: { y: 200 }
                        }
                    },
                    scene: {
                        preload: preload,
                        create: create
                    }
                };
            
                var game = new Phaser.Game(config);
            
                function preload ()
                {
                    this.load.setBaseURL('https://'+window.location.hostname);
            
                    this.load.image('sky', 'peersocial/securerender/apps/phaser/assets/space3.png');
                    this.load.image('logo', 'peersocial/securerender/apps/phaser/assets/phaser3-logo.png');
                    this.load.image('red', 'peersocial/securerender/apps/phaser/assets/red.png');
                }
            
                function create ()
                {
                    this.add.image(400, 300, 'sky');
            
                    var particles = this.add.particles('red');
            
                    var emitter = particles.createEmitter({
                        speed: 100,
                        scale: { start: 1, end: 0 },
                        blendMode: 'ADD'
                    });
            
                    var logo = this.physics.add.image(400, 100, 'logo');
            
                    logo.setVelocity(100, 200);
                    logo.setBounce(1, 1);
                    logo.setCollideWorldBounds(true);
            
                    emitter.startFollow(logo);
                }

                ready = true;
            })
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
                sr.events["message"] = function (msg) {
                    // console.log("context message", msg)
                }

                emit("message", "test1");

                exposed().then((exposed) => {
                    // console.log(exposed);
                    exposed.start();

                })
            }

        })
    }

}
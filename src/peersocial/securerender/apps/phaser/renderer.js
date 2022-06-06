function SecureRender(sr, emit) {
    //this area has html access
    // console.log(sr);
    
    function loadjsfile(filename, done) {
        var r = document.createElement('script')
        r.setAttribute("type", "text/javascript")
        r.setAttribute("src", filename)
        r.onload = done
        if (typeof r != "undefined") document.getElementsByTagName("head")[0].appendChild(r)
    }

    var ready = false;
    loadjsfile("/peersocial/securerender/apps/phaser/phaser.js", function () {
        loadjsfile("/peersocial/lib/jquery.js", function () {
            sr.events["state"] = ({velocity, gravity, particle, ...state})=>{
                console.log("given context message", state)
                // debugger;
                var Phaser = window.Phaser;

                console.log(Phaser)

                var config = {
                    type: Phaser.AUTO,
                    width: window.innerWidth,
                    height: window.outerWidth,
                    physics: {
                        default: 'arcade',
                        arcade: {
                            gravity: gravity || { y: 200 }
                        }
                    },
                    scene: {
                        preload: preload,
                        create: create
                    },
                    callbacks: {
                        postBoot: function (game) {
                          // In v3.15, you have to override Phaser's default styles
                          game.canvas.style.width = '100%';
                          game.canvas.style.height = '100%';
                          update()
                        }
                      }
                };
                
                $( window ).resize(function() {
                    update()
                  });

                function update(){
                    (function() {
                        var c = document.getElementsByTagName("canvas")[0];
                        c.style.width = '100%'; // set width to 100%
                        c.style.height = '100%'; // set height to 100%
                    })(); // run function
                }
            
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
                    
                    var background = this.add.image(window.innerWidth/2, window.outerHeight/2, 'sky');
                    background.setDisplaySize(window.innerWidth,window.outerWidth)
                    
                    var particles = this.add.particles('red');
            
                    var emitter = particles.createEmitter(particle);
            
                    var logo = this.physics.add.image(400, 100, 'logo');
            
                    logo.setVelocity(velocity.x, velocity.y);
                    
                    logo.setBounce(1, 1);
                    logo.setCollideWorldBounds(true);
            
                    emitter.startFollow(logo);
                        
                    
                }
            }
            
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
                sr.events["state"] = function (msg) {
                    console.log("context state message", msg)
                }


                exposed().then((exposed) => {
                    // console.log(exposed);
                    
                    emit("state", exposed);

                })
            }

        })
    }

}
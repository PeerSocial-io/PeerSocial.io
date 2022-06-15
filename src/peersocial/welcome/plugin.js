define(function(require, exports, module) {

    /* globals $ */
    appPlugin.consumes = ["app", "user", "gun", "state", "react", "vue"];
    appPlugin.provides = ["welcome"];

    var fabric = require("fabric").fabric;

    return appPlugin;

    function appPlugin(options, imports, register) {

        var React = imports.react;
        var Vue = imports.vue;

        register(null, {
            welcome: {
                init: function() {

                    imports.state.$hash.on("/", function() {
                        // if(!imports.app.nw_app){
                        if (!imports.gun.user().is) {
                            $("#main-container").html(require("./welcome.html"))
                        }
                        else {

                            function App() {
                    
                                this.state = {
                                    num1: 0,
                                    num2: 1
                                };

                                this.handleNum1Change = ({ target }) => {
                                    this.setState({
                                        num1: target.value
                                    });
                                };

                                this.handleNum2Change = ({ target }) => {
                                    this.setState({
                                        num2: target.value
                                    });
                                };

                                this.render = () => {
                                    let { num1, num2 } = this.state;
                                    var MyVue = Vue.VueWrapper(require("./welcome-user.vue"));
                                    return (
                                        <div className="App">
                                            <input type="text" value={num1} onChange={this.handleNum1Change} />
                                            <input type="text" value={num2} onChange={this.handleNum2Change} />
                                            <MyVue num1={num1} num2={num2} />
                                        </div>
                                    );
                                };
                                
                            }
                            App.prototype = React.Component.prototype;

                            var root = React.dom.createRoot(document.getElementById('main-container'));
                            
                            root.render(<App />);
                            
                            // var u = $(require("./welcome-user.html"));

                            // $("#main-container").html(u)

                            /*if (imports.app.debug) {
                                var c = u.find('canvas');
                                if (c.length) {
                                    c = $(c[0]); //select one
                                    var canvas = new fabric.Canvas(c[0]);

                                    imports.user.getUser(function(err, data, user) {
                                        user().get("profileImage").once(function(peer_profile_image) {

                                            fabric.Image.fromURL(peer_profile_image, function(img) {

                                                canvas.insertAt(img, 0);

                                            });
                                        })
                                    })
                                }
                            }*/
                        }
                        // }else{
                        //     imports.app.emit("nw-home");
                        if (imports.app.nw_app)
                            imports.app.emit("nw_app");
                        // }
                    })


                    imports.app.on("start", function() {

                        var app_pub = imports.app.dapp_info.DAPP_PUB;
                        var gun = imports.gun;
                        var source_version = imports.app.source_version;
                        var lastRelease;
                        gun.get("~" + app_pub).get("deploy").get(source_version).once(function(deploy, a) {
                            if (deploy && deploy.release && deploy.domain) {
                                if(deploy.domain == "www.peersocial.io"){
                                    var releaseID;                                    
                                    // console.log("!deploy", deploy);
                                    if (!deploy.next_head && !lastRelease) {
                                        releaseID = lastRelease = parseInt(deploy.release.toString().replace("v", ""));
                                        console.log("Your On Current Release", source_version);
                                    }else if(deploy.next_head){     
                                        lastRelease = deploy.next_head                          
                                        gun.get("~" + app_pub).get("deploy").get(deploy.next_head).once(function(deploy){
                                            // releaseID =  parseInt(deploy.release.toString().replace("v", ""));
                                            console.log("Not in sync with git upstream. or on custom build. `git pull && npm run build` may fix this issue !");
                                        });
                                    }
                                }

                            }else{
                                console.log("Deployment not found.. Not in sync with git upstream. or on custom build")
                            }
                        })

                        if(false){
                            gun.get("~" + app_pub).get("release").get("peersocial").once((deploy) => {
                                if (deploy && deploy.release && deploy.domain) {
                                    if (deploy.domain == "www.peersocial.io") {
                                        var releaseID = parseInt(deploy.release.toString().replace("v", ""));
                                        console.log("current replease", releaseID);

                                        gun.get("~" + app_pub).get("release").get("peersocial").on((deploy) => {
                                            var check_releaseID = parseInt(deploy.release.toString().replace("v", ""));
                                            if (releaseID < check_releaseID) {
                                                releaseID = check_releaseID
                                                if (window.location.host == deploy.domain) {
                                                    console.log("release!", deploy);
                                                    // window.location.reload()
                                                }
                                                else {
                                                    console.log("release on", deploy.domain, deploy);
                                                }
                                            }
                                        })

                                    }
                                }
                            })
                        }

                    });

                }
            }
        });

    }

});
define(function(require, exports, module) {

    appPlugin.consumes = ["app", "provable"];
    appPlugin.provides = ["gun", "sea"];

    // if(window.global && window.global.nw_app_core)    appPlugin.consumes.push("nw_app");

    return appPlugin;

    function appPlugin(options, imports, register) {
        var Gun, gun;

        /* global */
        Gun = require("gun");
        require("gun/sea");
        require("gun/nts");  
        
        // require("gun/lib/webrtc");

        if (!Gun.log.once)
            Gun.log.once = function() {};

        var peers = [];


        //peers.push("https://" + window.location.host + "/gun")
        // else
        //  if (thisHost != "www.peersocial.io")
        // peers.push("https://www.peersocial.io/gun");
        if(typeof window != "undefined")
            peers.push("https://" + window.location.host + "/gun");
            
        peers.push("https://dev.peersocial.io/gun");
        peers.push("https://www.peersocial.io/gun");
        peers.push("https://peersocial-notify.herokuapp.com/gun");
        
        gun = Gun({ peers: peers }); //"https://"+window.location.host+"/gun");

        // var thisHost = window.location.host;

        // setTimeout(function() {

        // gun.opt({ peers: peers });

        // if (thisHost != "www.peersocial.io") {
        //     var mesh = gun.back('opt.mesh'); // DAM;
        //     mesh.say({ dam: 'opt', opt: { peers: 'https://www.peersocial.io/gun' } });
        // }

        // }, 1)
        if(typeof window != "undefined")
            window.gun = gun; 



        var mesh = gun.back('opt.mesh'); // DAM;
        mesh.say({ dam: 'opt', opt: { peers: ['https://www.peersocial.io/gun', 'https://dev.peersocial.io/gun'] } });

        function getPubData(pub) {
            return new Promise(resolve => {
                gun.get(pub).once(resolve);
            });
        }

        gun.generateUID32 = function(pub) {
            return imports.provable.toInt(imports.provable.sha256(pub)).toString().substring(0, 4);
        }

        gun.aliasToPub = function(alias, $uid32, next) {
            if (typeof $uid32 == "function") {
                next = $uid32;
                $uid32 = false
            }

            gun.user(alias).once((data, a, b, c) => {
                for (var i in data) {
                    if (i.indexOf("~") == 0) {

                        if ($uid32) {
                            if ($uid32 == gun.generateUID32(i))
                                return next(i);
                        }
                        else
                            return next(i);
                    }
                }
                next();
            });
        }
        
        gun.SEA = Gun.SEA;
        
        setTimeout(function(){
                
            register(null, {
                gun: gun,
                sea: Gun.SEA,
                gunUser: gun.user()
            });
            
            
        },1000);
    }

});
define(function(require, exports, module) {

    appPlugin.consumes = ["app", "provable"];
    appPlugin.provides = ["gun", "sea", "gunMask"];

    // if(window.global && window.global.nw_app_core)    appPlugin.consumes.push("nw_app");

    return appPlugin;

    function appPlugin(options, imports, register) {
        var Gun, gun;

        /* global $ GUN */
        Gun = require("gun");

        // Gun = require('gun/src/root');
        // require('gun/src/shim');
        // require('gun/src/onto');
        // require('gun/src/valid');
        // require('gun/src/state');
        // require('gun/src/dup');
        // require('gun/src/ask');
        // require('gun/src/chain');
        // require('gun/src/back');
        // require('gun/src/put');
        // require('gun/src/get');
        // require('gun/src/on');
        // require('gun/src/map');
        // require('gun/src/set');
        // require('gun/src/mesh');
        // require('gun/src/websocket');
        // require('gun/src/localStorage');


        require("gun/sea");
        require("gun/nts");
        require("gun/lib/unset");
        require("gun/lib/not");
        require("gun/lib/open");
        require("gun/lib/load");

        GUN.chain.cert = function() {
            var gun = this;

            gun.on('out', console.log)
            /* do stuff */
            ;
            return gun;
        }

        // require("gun/lib/webrtc");

        if (!Gun.log.once)
            Gun.log.once = function() {};

        var peers = [];


        //peers.push("https://" + window.location.host + "/gun")
        // else
        //  if (thisHost != "www.peersocial.io") 
        // peers.push("https://www.peersocial.io/gun");
        if (typeof window != "undefined")
            peers.push("https://" + window.location.host + "/gun");

        addPeer("https://dev.peersocial.io/gun");
        addPeer("https://www.peersocial.io/gun");
        addPeer("https://peersocial-notify.herokuapp.com/gun");
        addPeer("https://gun-manhattan.herokuapp.com/gun");

        function addPeer(peer) {
            if (!(peers.indexOf(peers) > -1)) {
                peers.push(peer); //bradleyab
            }
        }

        var gunOptions = {
            peers: peers,
            // super: true
        };

        gun = Gun(gunOptions); //"https://"+window.location.host+"/gun");

        // var thisHost = window.location.host;

        // setTimeout(function() {

        // gun.opt({ peers: peers });

        // if (thisHost != "www.peersocial.io") {
        //     var mesh = gun.back('opt.mesh'); // DAM;
        //     mesh.say({ dam: 'opt', opt: { peers: 'https://www.peersocial.io/gun' } });
        // }

        // }, 1)
        if (process.env.DEBUG && typeof window != "undefined")
            window.gun = gun;



        // var mesh = gun.back('opt.mesh'); // DAM;
        // mesh.say({ dam: 'opt', opt: { peers: ['https://www.peersocial.io/gun', 'https://dev.peersocial.io/gun'] } });

        // function getPubData(pub) {
        //     return new Promise(resolve => {
        //         gun.get(pub).once(resolve);
        //     });
        // }

        // gun.generateUID32 = function(pub) {
        //     return imports.provable.toInt(imports.provable.sha256(pub)).toString().substring(0, 4);
        // }

        // gun.aliasToPub = function(alias, $uid32, next) {
        //     if (typeof $uid32 == "function") {
        //         next = $uid32;
        //         $uid32 = false
        //     }

        //     gun.user(alias).once((data, a, b, c) => {
        //         for (var i in data) {
        //             if (i.indexOf("~") == 0) {

        //                 if ($uid32) {
        //                     if ($uid32 == gun.generateUID32(i))
        //                         return next(i);
        //                 }
        //                 else
        //                     return next(i);
        //             }
        //         }
        //         next();
        //     });
        // }

        gun.SEA = Gun.SEA;
        gun.Gun = Gun;

        setTimeout(function() {

            register(null, {
                gun: gun,
                gunMask: require("./gun-mask.js")(gun),
                sea: Gun.SEA,
                gunUser: gun.user()
            });


        }, 50);
    }

});
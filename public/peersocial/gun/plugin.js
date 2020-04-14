define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["gun"];

    /* global Gun */
    
    if(!Gun.log.once)
        Gun.log.once = function(){};
    
    var peers = [];

    
        peers.push("https://" + window.location.host + "/gun")
    // else
     if (thisHost != "www.peersocial.io")
         peers.push("https://www.peersocial.io/gun");

    var gun = Gun({super:false, peers: peers}); //"https://"+window.location.host+"/gun");
        
    var thisHost = window.location.host;

    // setTimeout(function() {

        // gun.opt({ peers: peers });
        
        if (thisHost != "www.peersocial.io") {
            var mesh = gun.back('opt.mesh'); // DAM;
            mesh.say({ dam: 'opt', opt: { peers: 'https://www.peersocial.io/gun' } });
        }
        
    // }, 1)

    window.gun = gun;

    function getPubData(pub) {
        return new Promise(resolve => {
            gun.get(pub).once(resolve);
        });
    }

    gun.generateUID32 = function(pub) {
        return Provable.toInt(Provable.sha256(pub)).toString().substring(0, 4);
    }

    gun.aliasToPub = function(alias, $uid32, next) {
        if (typeof $uid32 == "function") { next = $uid32;
            $uid32 = false }

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
    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            gun: gun,
            gunUser: gun.user()
        });

    }

});
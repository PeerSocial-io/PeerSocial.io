define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["gun"];

    /* global Gun */
    var gun = Gun("https://"+window.location.host+"/gun");
    
    // FOR AXE
    //var mesh = gun.back('opt.mesh'); // DAM;
    // Ask local peer to connect to another peer.
    //mesh.say({dam: 'opt', opt: {peers: 'https://www.peersocial.io/gun'}});
    //mesh.say({dam: 'opt', opt: {peers: 'https://gunjs.herokuapp.com/gun'}});

    gun.opt({peers: ["https://www.peersocial.io/gun"]})
    gun.opt({peers: ["https://gunjs.herokuapp.com/gun"]})
    
    window.gun = gun;
    
    function getPubData(pub) {
        return new Promise(resolve => {
            gun.get(pub).once(resolve);
        });
    }

    gun.generateUID32 = function(pub) {
        return Provable.toInt(Provable.sha256(pub)).toString().substring(0, 4);
    }

    gun.aliasToPub = function(alias, $uid32,  next) {
        if(typeof $uid32 == "function"){ next = $uid32; $uid32 = false}
        
        gun.user(alias).once(async (data) => {
            for (var i in data) {
                if (i.indexOf("~") == 0) {
                    
                    if($uid32){
                        if($uid32 == gun.generateUID32(i))
                            return next(i);
                    }else
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
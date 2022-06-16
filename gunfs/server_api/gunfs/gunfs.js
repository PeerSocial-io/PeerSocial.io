module.exports = function(gun, express_app) {
    
    var GFS = require("../../libs/gunfs");

    var peer_profile_key = "profile";
    var peerApps_v2_key = "peerapps_v2";

    console.log("gunfs loaded");


    express_app.use("/gunfs/(*)", function(req, res, next) {
        var gunfs_peersocial_path = req.params[0];

        getFile(gunfs_peersocial_path, function(eeer, data) {
            res.setHeader("Content-Type", "text/javascript");
            res.send(data);
            res.end();
        });
    });


    function getFile(query, callback) {

        var $query = parse_app_query(query);

        getUser($query.alias, $query.uid, function(err, $user, user) {
            if (err) {
                callback(null, "404");
            }
            else {
                var gunfs = GFS(user.get(peer_profile_key).get(peerApps_v2_key).get($query.app_id));
                gunfs.stat($query.url, function(err, stat) {
                    if (err == 404) return callback(null, "404");

                    if (stat.mime != "folder"){
                        gunfs.readfile($query.url, function(err, data) {
                            if($query.url.split(".").pop() == "js"){
                                var defineWrap_top = `define(function(require, exports, module){\n`;
                                var defineWrap_bottom = `\n})\n`;
                                callback(err, defineWrap_top + data + defineWrap_bottom, stat);
                            }else{
                                callback(err, data, stat);
                            }
                        });
                    }
                    
                });
            }

        });

    }

    function keyToInt(key) {
        var crypto = require("crypto");
        var bitHex = 8;
        var hash = crypto.createHash('sha256').update(key).digest('hex');
        return parseInt(hash.slice(-bitHex), 16).toString().substring(0, 4);
    }


    function getUser(alias, $uid32, callback) {
        if (typeof $uid32 == "function") {
            callback = $uid32;
            $uid32 = false;
        }
        aliasToPub("@" + alias, $uid32, (pub) => {
            if (pub) {
                gun.get(pub).once((data) => {
                    if (alias == data.alias) {
                        callback(null, data, gun.get(pub));
                    }
                });
            }
            else {
                callback("User Not Found");
            }
        });

    }



    function aliasToPub(alias, $uid32, next) {
        if (typeof $uid32 == "function") {
            next = $uid32;
            $uid32 = false;
        }

        gun.user(alias).once((data, a, b, c) => {
            for (var i in data) {
                if (i.indexOf("~") == 0) {

                    if ($uid32) {
                        if ($uid32 == keyToInt(i))
                            return next(i);
                    }
                    else
                        return next(i);
                }
            }
            next();
        });
    }

    function parse_app_query(query) {
        //1234@alias~test
        var $query = query.split("@");
        var out = {};
        out.query = query;
        out.app_id = $query[1].split("~");
        out.alias = out.app_id[0];
        out.url = out.app_id[1].split("/").filter(function(el) { return el != ""; });
        out.app_id = out.url.shift();
        out.url = "/" + out.url.join("/");
        out.uid = $query[0];
        return out;
    }
};



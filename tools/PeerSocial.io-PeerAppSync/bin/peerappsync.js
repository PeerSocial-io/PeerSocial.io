#!/usr/bin/env node
var PEER = "https://www.peersocial.io/gun";

var DISABLE_REMOTE_DELETE = false;

var rimraf = require("rimraf");
var path = require('path');
var fs = require("fs");
var peer_sync_dir = process.cwd();
var peer_profile_key = "profile";
var peerApps_v2_key = "peerapps_v2";

var GFS = require("../../../libs/gunfs");

var config = peer_sync_dir + "/peer_config.json";

try {
    config = JSON.parse(fs.readFileSync(config));
}
catch (e) {}

if (!config.peerappssync) {
    return console.log("no peerappssync config found in peer_config.json");
}

var Gun = require("gun");
Gun.log.once = function(){};
require("gun/lib/unset");

var gun;

setTimeout(function() {
        
    gun = Gun({ peers: [PEER], radisk: false, super: false });
    global.gun = gun;
    
    setTimeout(function() {
    
        var act = {};
    
        act.a = function() {
            gun.user().auth(config.peer_user.username.split("@")[1], config.peer_user.password, function(res) {
                if (res.err) {
                    console.log(res.err);
                }else{
                    gun.user().get("profile").once(function(res){
                        console.log("loggedIn", config.peer_user.username.split("@")[1], res.display_name, res.tagline);    
                    });
                }
                act.b();
            });
        };
    
        act.b = function() {
    
            for (var i in config.peerappssync) {
                setupApp(config.peerappssync[i], config.peer_user);
            }
            
        };
        
        if (config.peer_user && !gun.user().is) {
            act.a();
        }
        else act.b();
    
    
    }, 3000);

},3000);

function setupApp(app) {
    var peer_app_query = app + "/";

    var $query = parse_app_query(peer_app_query);

    getUser($query.alias, $query.uid, function(err, $user, user, isMe) {
        if (err) {
            return console.log("404", err);
        }
        
        var gunfs = GFS(user.get(peer_profile_key).get(peerApps_v2_key).get($query.app_id));
        gunfs.stat($query.url, function(err, stat) {
            if (err == 404) return console.log("404");

            global.gunfs = gunfs; //------------------------------------------------------------------------------------------------------

            gunfs.on("*", function(e) {
                setTimeout(function(){
                    gunfs.stat(e.path, function(err, stat) {
                    if (!err && stat.mime == '') {
                        gunfs.readfile(e.path, function(err, data) {
                            if (!err) {
                                var local_filePath = peer_sync_dir + "/" + $query.app_id + e.path;
                                var oldData = false;
                                if(fs.existsSync(local_filePath))
                                    oldData = fs.readFileSync(local_filePath).toString("utf8");
                                    
                                if (data !== oldData) {
                                    ensureDirectoryExistence(local_filePath);
                                    fs.writeFileSync(local_filePath, data);
                                    fs.utimesSync(local_filePath, new Date(), new Date(stat.mtime));
                                    console.log("saved to local", local_filePath);
                                }
                            }
                        });
                    }
                    else if (err || stat && stat.mime == 'folder') {
                        var local_filePath = peer_sync_dir + "/" + $query.app_id + e.path;
                        if (e.event == "delete") {
                            rimraf.sync(local_filePath);
                            console.log("delete dir or file " + local_filePath);
                        }
                        else
                        if (e.event == "change") {
                            ensureDirectoryExistence(local_filePath + "/.");
                            console.log("create dir " + local_filePath);
                        }
                        else
                            console.log(e);
                    }
                });
                },1000);
            });

            if (stat.mime == "folder") {
                setupSync($query.app_id, $query.url, gunfs, isMe);
            }

        });

    });

}

function setupSync(app_id, url, gunfs) {
    var localPath = peer_sync_dir + "/" + app_id;
    var appPath = url;
    gunfs.readdir(appPath, function(err, contence) {


        if (!err) {
            for (var i in contence) {
                sync_GunFS_to_Local(gunfs, appPath + contence[i].name, localPath);
            }

            sync_Local_to_GunFS(gunfs, localPath);
        }
    });

}

function sync_GunFS_to_Local(gunfs, filePath, localPath) {
    var local_filePath = localPath + filePath;
    if (!fs.existsSync(local_filePath)) { //not existed then create
        gunfs.stat(filePath, function(err, gunfs_stats) {
            if (!err && gunfs_stats.mime == '') {
                gunfs.readfile(filePath, function(err, data) {
                    if (!err) {
                        ensureDirectoryExistence(local_filePath);
                        fs.writeFileSync(local_filePath, data);
                        fs.utimesSync(local_filePath, new Date(), new Date(gunfs_stats.mtime));
                        console.log("saved to local", local_filePath);
                    }
                });
            }
            else if (!err && gunfs_stats.mime == 'folder') {
                gunfs.readdir(filePath, function(err, contence) {
                    if (!err) {
                        for (var i in contence) {
                            sync_GunFS_to_Local(gunfs, filePath + "/" + contence[i].name, localPath);
                        }

                    }
                });
            }
        });
    }
    else { //exist to check and see if it needs updates
        gunfs.stat(filePath, function(err, gunfs_stats) {
            if (!err && gunfs_stats.mime == '') {
                var gunMtime = new Date(gunfs_stats.mtime);
                fs.stat(local_filePath, function(err, local_stats) {
                    if (!err && gunMtime.getTime() > local_stats.mtime.getTime()) {
                        gunfs.readfile(filePath, function(err, data) {
                            if (!err) {
                                ensureDirectoryExistence(local_filePath);
                                fs.writeFileSync(local_filePath, data);
                                fs.utimesSync(local_filePath, new Date(), new Date(gunfs_stats.mtime));
                                console.log("saved to existing local", local_filePath);
                            }
                        });
                        console.log(filePath, gunMtime.getTime(), local_stats.mtime.getTime());

                    }
                });
            }
            else if (!err && gunfs_stats.mime == 'folder') {
                gunfs.readdir(filePath, function(err, contence) {
                    if (!err) {
                        for (var i in contence) {
                            sync_GunFS_to_Local(gunfs, filePath + "/" + contence[i].name, localPath);
                        }

                    }
                });
            }
        });
    }
}

function sync_Local_to_GunFS(gunfs, localPath) {
    if (gun.user().is) {
        var watcher = require("chokidar").watch(localPath, { ignored: /(^|[\/\\])\../, persistent: true });

        watcher
            .on('ready', () => {
                watcher
                    .on('addDir', function(path) {
                        var appFile = path.replace(localPath, "");
                        gunfs.mkdir(appFile, function(err, data) {
                            if (err) console.log(err);
                            console.log("Created dir to gun", appFile);
                        });


                        // console.log('addDir', appFile, 'has been addDir');
                    })
                    .on('unlinkDir', function(path) {
                        
                        if(!DISABLE_REMOTE_DELETE){
                            var appFile = path.replace(localPath, "");
                            gunfs.stat(appFile, function(err, gunfs_stats) {
                                if (!err) {
                                    if (gunfs_stats.mime == "folder")
                                        gunfs.rmdir(appFile, function() {
                                            console.log('unlinkDir', appFile, 'has been unlinkDir');
                                        });
                                    else
                                        gunfs.rmfile(appFile, function() {
                                            console.log('File', appFile, 'has been removed');
                                        });
                                }
                            });
                        }
                    })

                    .on('add', function(path) {
                        var appFile = path.replace(localPath, "");
                        fs.stat(localPath + appFile, function(err, local_stats) {
                            if(!err){
                                var newData = fs.readFileSync(localPath + appFile).toString("utf8");
                                gunfs.mkfile(appFile, { value: newData , mtime: local_stats.mtime.getTime()}, function(err) {
                                    if (err) throw err;
                                        gunfs.stat(appFile, function(err, gunfs_stats) {
                                            if (!err) {
                                                fs.utimesSync(localPath + appFile, new Date(), new Date(gunfs_stats.mtime));
                                                console.log("Saved-add file to gun (mtime "+(new Date(gunfs_stats.mtime))+")", appFile);
                                            }
                                        });
                                });
                            }
                        })
                        // console.log('File', appFile, 'has been added');
                    })
                    .on('change', function(path) {
                        var appFile = path.replace(localPath, "");
                        gunfs.readfile(appFile, function(err, data) {
                            if (!err) {
                                var newData = fs.readFileSync(localPath + appFile).toString("utf8");
                                if (data !== newData) {
                                    gunfs.mkfile(appFile, newData, function(err) {
                                        if (err) throw err;
                                        gunfs.stat(appFile, function(err, gunfs_stats) {
                                            if (!err) {
                                                fs.utimesSync(localPath + appFile, new Date(), new Date(gunfs_stats.mtime));
                                                console.log("Saved file to gun (mtime "+(new Date(gunfs_stats.mtime))+")", appFile);
                                            }
                                        });
                                    });
                                }
                            }
                            else {
                                console.log("file prolly not exist")
                                if(err == 404){
                                    fs.stat(localPath + appFile, function(err, local_stats) {
                                        if(!err){
                                            var newData = fs.readFileSync(localPath + appFile).toString("utf8");
                                            gunfs.mkfile(appFile, { value: newData , mtime: local_stats.mtime.getTime()}, function(err) {
                                                if (err) throw err;
                                                    gunfs.stat(appFile, function(err, gunfs_stats) {
                                                        if (!err) {
                                                            fs.utimesSync(localPath + appFile, new Date(), new Date(gunfs_stats.mtime));
                                                            console.log("Saved-add file to gun (mtime "+(new Date(gunfs_stats.mtime))+")", appFile);
                                                        }
                                                    });
                                            });
                                        }
                                    })
                                }
                            }
                        });

                        // console.log('File', appFile, 'has been changed');

                    })
                    .on('unlink', function(path) {
                        if(!DISABLE_REMOTE_DELETE){
                            var appFile = path.replace(localPath, "");
                            gunfs.rmfile(appFile, function() {
                                console.log('File', appFile, 'has been removed');
                            });
                        }
                    })
                    .on('error', function(error) {
                        console.error('Error happened', error);
                    });

            });

    }
}

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname, { recursive: true });
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
                try {
                    if (data && alias == data.alias) {
                        return callback(null, data, gun.get(pub));
                    }
                }
                catch (e) {
                    return callback(e);
                }
                return callback("fail to find pubkey alias");
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

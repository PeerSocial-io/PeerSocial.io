#!/usr/bin/env node
var PEER = "https://www.peersocial.io/gun";

var DISABLE_REMOTE_DELETE = false;

var rimraf = require("rimraf");
var path = require('path');
var fs = require("fs");
var peer_sync_dir = process.cwd();
var peer_profile_key = "profile";
var peerApps_v2_key = "peerapps_v2";

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

function GFS($appQuery){
    
var EventEmitter = require("events").EventEmitter;

// var gun = require("gun")();
function GunFS(dbRoot) {
    this.dbRoot = () => { return dbRoot };
    this.root = this.dbRoot().get("root");
    this.root.on(() => {});
    this.notify = this.dbRoot().get("notify");
    var _self = this;
    var initTime = Date.now();
    var fired = {};
    this.notify.on((a, b, c, d) => {
        if (a && a.t > initTime) {
            initTime = a.t;
            var event = {
                path: a.path,
                to: a.to,
                t: a.t,
                event: a.event
            };

            fired[a.path] = a.t;
            _self._emit(a.path, event);
            _self._emit("*", event);
        }
    });
}
GunFS.prototype = new EventEmitter();
GunFS.prototype._emit = GunFS.prototype.emit;
delete GunFS.prototype.emit;
GunFS.prototype.stat = async function(path, options, callback) {
    if (typeof options == "function") callback = options;
    var _self = this;
    var doPromise = false;
    if (!callback) doPromise = true;

    function run() {
        var $_path = path;

        if ($_path == "/") {
            return callback(null, {
                name: "",
                size: 1,
                mtime: 0,
                ctime: 0,
                mime: "folder"
            });
        }

        if (typeof path == "string") {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
            path = path.split("/");
            var lookupCallback = function(err, list, item, contence) {
                if (err) return callback(err);
                path.shift();
                var $path = path[0];
                if (!$path || $path == "") {
                    return callback(null, list, $_path, item, contence);
                }
                var exist = null;
                for (var i in list) {
                    if (list[i].name == $path) {
                        list[i].uid = i;
                        exist = list[i];
                        break;
                    }
                }
                if (exist && path.length == 1) {
                    var stat = {
                        name: exist.name,
                        size: exist.size || 1,
                        mtime: exist.mt || 0,
                        ctime: exist.ct || 0,
                        mime: exist.type == "folder" ? "folder" : ""
                    };
                    return callback(null, stat);
                }
                if (!exist) return callback(404, null, $_path, item, contence);
                else {
                    var chain = item.get(exist.id);
                    getSet(chain, chain.get("contence"), lookupCallback);
                }
            };
            getSet(_self.root, _self.root.get("contence"), lookupCallback);
        }
        else {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
        }
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.readfile = async function(path, options, callback) {
    if (typeof options == "function") callback = options;
    var _self = this;
    var doPromise = false;
    if (!callback) doPromise = true;

    function run() {
        var $_path = path;
        // var _self = this;
        if (typeof path == "string") {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
            path = path.split("/");
            var lookupCallback = function(err, list, item, contence) {
                if (err) return callback(err);
                path.shift();
                var $path = path[0];
                if (!$path || $path == "") {
                    return callback(null, list, $_path, item, contence);
                }
                var exist = null;
                for (var i in list) {
                    if (list[i].name == $path) {
                        list[i].uid = i;
                        exist = list[i];
                        break;
                    }
                }
                if (exist && (exist.value || exist.value == ""))
                    return _self._decode(exist.value, (value) => {
                        callback(null, value);
                    });
                if (!exist) return callback(404, null, $_path, item, contence);
                else {
                    var chain = item.get(exist.id);
                    getSet(chain, chain.get("contence"), lookupCallback);
                }
            };
            getSet(_self.root, _self.root.get("contence"), lookupCallback);
        }
        else {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
        }
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.readdir = async function(path, options, callback) {
    if (typeof options == "function") callback = options;
    var _self = this;
    var doPromise = false;
    if (!callback) doPromise = true;

    function run() {
        var $_path = path;
        if (typeof path == "string") {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
            path = path.split("/");
            var lookupCallback = function(err, list, item, contence) {
                if (err) return callback(err);
                path.shift();
                var $path = path[0];
                if (!$path || $path == "") {
                    return callback(null, list, $_path, item, contence);
                }
                var exist = null;
                for (var i in list) {
                    if (list[i].name == $path) {
                        list[i].uid = i;
                        exist = list[i];
                        break;
                    }
                }
                if (exist && exist.value) return callback("path is a file");
                if (!exist) return callback(404, null, $_path, item, contence);
                else {
                    var chain = item.get(exist.id);
                    getSet(chain, chain.get("contence"), lookupCallback);
                }
            };
            getSet(_self.root, _self.root.get("contence"), lookupCallback);
        }
        else {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
        }
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.mkfile = async function(path, options, callback) {
    var _self = this;

    var doPromise = false;
    if (!callback) doPromise = true;

    function getValue(cb) {
        var v = "";
        if (typeof options == "object" && options.stream) {
            options.stream.on("data", function(e) {
                if (e) v += e;
            });
            options.stream.on("end", function(e) {
                if (e) v += e;
                cb(v);
            });
        }
        else if (typeof options == "object" && options.value) {
            v = options.value;
            cb(v);
        }
        else if (typeof options == "string") {
            v = options;
            cb(v);
        }
    }

    function run() {
        var parentDir = path.split("/");
        var file_name = parentDir.pop();
        parentDir = parentDir.join("/");
        if (parentDir == "") parentDir = "/";
        _self.readdir(parentDir, (err, list, name, item, contence) => {
            var exist = false;
            if (err == 404) return callback("parent dir not found");
            for (var i in list) {
                if (list[i].name == file_name) {
                    list[i].uid = i;
                    exist = list[i];
                    break;
                }
            }
            var $contence;
            var newFile;
            if (!exist) {
                var pathID = _self.dbRoot().back(-1).opt()._.opt.uuid();
                $contence = item.get(pathID);
                newFile = {
                    name: file_name,
                    //value: value,
                    id: pathID,
                    ct: Date.now(),
                    mt: Date.now(),
                    type: ""
                };
            }
            else {
                $contence = contence.get(exist.uid);
                newFile = {
                    mt: (typeof options == "object" && options.mtime) ? options.mtime : Date.now()
                };
            }
            getValue((value) => {
                _self._encode(value, (value) => {
                    newFile.value = value;
                    newFile.size = lengthInUtf8Bytes(value);
                    $contence.put(newFile, function() {
                        _self.notify.put({ path: path, to: null, t: Date.now(), event: "change", type: "file" });
                        if (!exist) contence.set($contence, (res) => {
                            callback(null);
                        });
                        else callback(null);
                    });
                });
            });
        });
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.mkdir = async function(path, options, callback) {
    if (typeof options == "function") callback = options;
    var _self = this;
    var doPromise = false;
    if (!callback) doPromise = true;

    function run() {
        var parentDir = path.split("/");
        var folder_name = parentDir.pop();
        parentDir = parentDir.join("/");
        if (parentDir == "") parentDir = "/";
        _self.readdir(parentDir, (err, list, name, item, contence) => {
            if (err == 404) return callback("parent dir not found");
            for (var i in list) {
                if (list[i].name == folder_name) return callback("dir already exist");
            }
            var pathID = _self.dbRoot().back(-1).opt()._.opt.uuid();
            var dir = item.get(pathID);
            dir.put({ name: folder_name, id: pathID, ct: Date.now(), mt: Date.now(), type: "folder" , contence: null}, () => {
                _self.notify.put({ path: path, to: null, t: Date.now(), event: "change", type: "folder" });
                contence.set(dir, (res) => {
                    callback(null);
                });
            });
        });
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.rmfile = async function(path, options, callback) {
    return await this.rmdir(path, options, callback);
};
GunFS.prototype.rmdir = async function(path, options, callback) {
    if (typeof options == "function") callback = options;
    var _self = this;
    var doPromise = false;
    if (!callback) doPromise = true;

    function run() {
        var parentDir = path.split("/");
        var folder_name = parentDir.pop();
        parentDir = parentDir.join("/");
        if (parentDir == "") parentDir = "/";
        _self.readdir(parentDir, (err, list, name, item, contence) => {
            var exist = false;
            if (err == 404) return callback("parent path not found");
            for (var i in list) {
                if (list[i].name == folder_name) {
                    list[i].uid = i;
                    exist = list[i];
                    break;
                }
            }
            if (exist) {
                // var pathID = exist.uid;
                // var dir = item.get(exist.id);
                var $contence = contence.get(exist.uid);
                //$contence.put(null,(res)=>{   //<---  should we create a trash bin?
                if (typeof contence.unset != "function")
                    console.log(contence);
                contence.unset($contence);
                _self.notify.put({ path: path, to: null, t: Date.now(), event: "delete" });
                callback(null);
                //})
            }
            else callback("path not found");
        });
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.rename = async function(pathFrom, options, done) {
    var _self = this;
    var pathTo = options.to;
    var doPromise = false;
    if (!done) doPromise = true;

    function run() {
        getTo((err, to_list, to_name, to_item, to_contence, parentDir, $name) => {
            if (err) return done(err);
            getFrom((err, from_parentDir, dir, contence, uid) => {
                if (err) return done(err);
                var $contence = contence.get(uid);
                if (parentDir != from_parentDir) {
                    contence.unset(dir);
                    to_contence.set(dir);
                }
                $contence.put({ name: $name }, (res) => {
                    _self.notify.put({ path: pathFrom, to: parentDir + "/" + $name, t: Date.now(), event: "rename" });
                    done(null);
                });
            });
        });
    }

    function getTo(callback) {
        var parentDir = pathTo.split("/");
        var $name = parentDir.pop();
        parentDir = parentDir.join("/");
        if (parentDir == "") parentDir = "/";
        _self.readdir(parentDir, (err, list, name, item, contence) => {
            if (err == 404) return callback("parent path not found");
            for (var i in list) {
                if (list[i].name == $name) return callback("path already exist");
            }
            callback(err, list, name, item, contence, parentDir, $name);
        });
    }

    function getFrom(callback) {
        var parentDir = pathFrom.split("/");
        var $name = parentDir.pop();
        parentDir = parentDir.join("/");
        if (parentDir == "") parentDir = "/";
        _self.readdir(parentDir, (err, list, name, item, contence) => {
            var exist = false;
            if (err == 404) return callback("parent path not found");
            for (var i in list) {
                if (list[i].name == $name) {
                    list[i].uid = i;
                    exist = list[i];
                    break;
                }
            }
            if (exist) {
                var dir = item.get(exist.id);
                callback(null, parentDir, dir, contence, exist.uid);
            }
            else callback("file not found");
        });
    }
    if (doPromise) return new Promise((resolve) => {
        done = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype._encode = function(value, cb) {
    var data;
    try {
        if (!(Buffer.from(value, 'ascii').toString('ascii') === value))
            throw 0;

        var buff = new Buffer(value, 'ascii');
        data = buff.toString('base64');
        //data = window.btoa(value);
        if (typeof cb == "function")
            cb(data);
    }
    catch (e) {
        data = value;
        if (typeof cb == "function")
            cb(data);
    }
    return data;
};
GunFS.prototype._decode = function(value, cb) {
    var data;
    try {
        if (!(Buffer.from(value, 'base64').toString('base64') === value))
            throw 0;

        var buff = new Buffer(value, 'base64');
        data = buff.toString('ascii');
        //data = window.atob(value);
        if (typeof cb == "function")
            cb(data);
    }
    catch (e) {
        data = value;
        if (typeof cb == "function")
            cb(data);
    }
    return data;
};

async function getSet(listSet, contence, callback) {
        
    var ended = false;
    var list = [];
    var count = 0;
    contence.once(function(a,b) {
        if(!a){
            (async ()=>{
                await contence.put({init:"init"});
                getSet(listSet, contence, callback);
            })();
            return;
        }
        var timOut = 0;
        for (var i in a) {
            if (i.indexOf("_") == 0) continue;
            count += 1;
        }
        if(count == 0){
            timOut = 1000;
        }
        count=0;
        setTimeout(function(){
            listSet.get(b).once(function(a, b, c, d) {
                for (var i in a) {
                    if (i.indexOf("_") == 0) continue;
                    count += 1;
                }
                if (count == 0) {
                    return callback(null, listArrToObj(list), listSet, contence);
                }
                
                contence.map(function(item) {
                    return !!item ? item : null;
                }).once(function(a, b, c, d) {
                    if(a == "init")
                        a = null;
                    if (a == null) count -= 1;
                    if (a) list.push({ a: a, b: b });
                    if (count == list.length) {
                        if(ended) return;
                        ended = true;
                        return callback(null, listArrToObj(list), listSet, contence);
                    }
                });
            });
        },timOut)
    });
    
    function listArrToObj(arr) {
        var obj = {};
        for (var i in arr) {
            var item = arr[i].a;
            if(item.value && !item._decoded){
                 item._decoded = GunFS.prototype._decode(item.value);
            }
            obj[arr[i].b] = item;
            
        }
        return obj;
    }
}
function lengthInUtf8Bytes(str) {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
}

return new GunFS($appQuery);
}


"use strict";
(function() {

    function GFS($appQuery) {

        var EventEmitter = require("events").EventEmitter;
        
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
                if (!file_name || file_name == "") return callback(`can not create file ${parentDir}${file_name}`);
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
                if (!folder_name || folder_name == "") return callback(`can not create dir ${parentDir}${folder_name}`);
                _self.readdir(parentDir, (err, list, name, item, contence) => {
                    if (err == 404) return callback("parent dir not found");
                    for (var i in list) {
                        if (list[i].name == folder_name) return callback("dir already exist");
                    }
                    var pathID = _self.dbRoot().back(-1).opt()._.opt.uuid();
                    var dir = item.get(pathID);
                    dir.put({ name: folder_name, id: pathID, ct: Date.now(), mt: Date.now(), type: "folder", contence: null }, () => {
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
        GunFS.prototype.isWindow = !(typeof window == "undefined");
        GunFS.prototype._encode = function(value, cb) {
            var data;
            try {
                if (this.isWindow) {
                    data = window.btoa(value);
                }
                else {

                    if (!(Buffer.from(value, 'ascii').toString('ascii') === value))
                        throw 0;

                    var buff = new Buffer(value, 'ascii');
                    data = buff.toString('base64');

                }
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
                if (this.isWindow) {
                    data = window.atob(value);
                }
                else {
                    if (!(Buffer.from(value, 'base64').toString('base64') === value))
                        throw 0;

                    var buff = new Buffer(value, 'base64');
                    data = buff.toString('ascii');
                }
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
            contence.once(function(a, b) {
                if (!a) {
                    a = {};
                    /*
                    (async() => {
                        await contence.put({ init: "init" });
                        getSet(listSet, contence, callback);
                    })();
                    return;
                    */
                }
                var timOut = 0;
                for (var i in a) {
                    if (i.indexOf("_") == 0) continue;
                    count += 1;
                }
                if (count == 0) {
                    timOut = 1000;
                }
                count = 0;
                setTimeout(function() {
                    listSet.get(b).once(function(a, b, c, d) {
                        if (!a)
                            a = {};
                            
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
                            if (a == "init") a = null;
                            if (a == null) count -= 1;
                            if (a) list.push({ a: a, b: b });
                            if (count == list.length) {
                                if (ended) return;
                                ended = true;
                                return callback(null, listArrToObj(list), listSet, contence);
                            }
                        });
                    });
                }, timOut)
            });

            function listArrToObj(arr) {
                var obj = {};
                for (var i in arr) {
                    var item = arr[i].a;
                    if (item.value && !item._decoded) {
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

    if (typeof define == "function" && !(typeof module == "object")) {
        define(function(require, exports, module) {
            return module.exports = GFS;
        });
    }
    else {
        return module.exports = GFS;
    }

})();
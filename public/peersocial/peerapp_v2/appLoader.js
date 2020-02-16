define(function(require, exports, module) {

    var exec = function(appSource, gunfs, $query) {

        var require = undefined,
            exports = undefined,
            module = undefined,
            define = undefined;

        if (gunfs) {
            require = function(file) {
                return peerapp(gunfs, file, $query);

                // return Promise.resolve(mod);
            };
            module = {};
            module.exports = exports = {};
            define = function(fn) {
                try{
                    fn(require, exports, module);
                }catch(e){
                    console.log(e);
                }
            };
        }
        try {

            var defineWrap_top = `try{\n(function(){define(async function(require, exports, module){\n`;
            var defineWrap_bottom = `\n})})();\n}catch(e){console.error(e);throw e;}\n`;
            
            var cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
            var deps = [];
            appSource.toString().replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });
            
            console.log(deps)
            
            eval(defineWrap_top + appSource + defineWrap_bottom);
            if (module && module.exports)
                return module.exports;
            else
                return {};
        }
        catch (e) {
            console.log(e);
            return e;
        }
    };

    async function peerapp(gunfs, url, $query, $resolve) {
        return new Promise(function(resolve) {
            var isText = false;
            
            if(url.split("!")[0] == "text"){
                isText = true;
                url = url.split("!")[1]
            }
            
            url = url.split("#")[0];
            
            var __self = function() {
                gunfs.stat(url, function(err, stat) {
                    if (err == 404) return console.log("File Not Found");

                    if (stat.mime == "folder") {
                        var emptyFolder = true;
                        var package_json_file;

                        gunfs.readdir($query.url, function(err, list) {
                            for (var i in list) {
                                emptyFolder = false;
                                if (list[i].name.toLowerCase() == "package.json") package_json_file = list[i];

                            }

                            if (package_json_file) {
                                var packageData;

                                try {
                                    packageData = JSON.parse(package_json_file.value);
                                }
                                catch (e) { console.error(e) }

                                if (packageData && packageData.main) {
                                    var filename = packageData.main;

                                    if (filename.indexOf("./") == 0) {
                                        filename = filename.replace(/\.\//, '')
                                    }

                                    var path = (
                                            [].concat(
                                                $query.url.split("/"), filename
                                            )
                                        )
                                        .filter(function(el) { return el != ""; })
                                        .join("/");

                                    peerapp(gunfs, $query.url + path, $query, $resolve ? $resolve : resolve)
                                }
                            }

                        });
                    }
                    else {
                        gunfs.readfile(url, function(err, file) {
                            if (err) return (err);

                            var appSource = file;

                            try {
                                var execEnd;
                                if(isText){
                                    execEnd = appSource;;
                                }else execEnd = exec(appSource, gunfs, $query);
                                ($resolve ? $resolve : resolve)(execEnd);
                            }
                            catch (e) {
                                console.log(e);
                            }
                        });
                    }


                });
            }
            
            __self();
        });

        //return Promise;

    }

    module.exports = {
        exec: exec,
        peerapp: peerapp
    };
});
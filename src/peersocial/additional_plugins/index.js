define(function (require, exports, module) {
    /* globals $ */
    appPlugin.consumes = ["hub"];
    appPlugin.provides = ["babel"];

    function appPlugin(options, imports, register) {
        var babel = require("@babel/standalone");

        var definedPlugins = {};
        var aditionalPlugins = {
            get define() {
                return function (shortname, url) {
                    definedPlugins[shortname] = url;
                    return new Promise((resolve, reject) => {
                        require([definedPlugins[shortname]], (plugin) => {
                            console.log("aditionalPlugin", shortname, "loaded @", url);
                            aditionalPlugins[shortname] = plugin;
                            resolve(plugin)
                        })
                    })
                }
            },
            get require() {
                return function (shortname, callback) {
                    if (aditionalPlugins[shortname]) {
                        if (callback)
                            callback(aditionalPlugins[shortname]);
                        else return aditionalPlugins[shortname];
                    } else if (definedPlugins[shortname] && callback) {
                        var url = definedPlugins[shortname]
                        require([definedPlugins[shortname]], (plugin) => {
                            console.log("aditionalPlugin", shortname, "loaded @", url);
                            aditionalPlugins[shortname] = plugin;
                            callback(plugin)
                        })
                    } else {
                        throw "i dont know how to handle the request!!"
                    }
                }
            }
        };

        window.aditionalPlugins = aditionalPlugins;

        // (async ()=>{
        //     await aditionalPlugins.define("marked", "https://cdn.jsdelivr.net/gh/markedjs/marked/marked.min.js");

        //     var marked = aditionalPlugins.require("marked")

        //     console.log(marked)
        // })()
        /*
        $(document).on('DOMNodeInserted', function(e) {
            var markeds = $(e.target).find("div.marked");
            
            markeds.each((index,value) => {
                $(value).removeClass("marked")
                var data = $(value).text();
                $(value).text("");
                $(value).removeClass("d-none");
                require(["https://cdn.jsdelivr.net/gh/markedjs/marked/marked.min.js"],(marked)=>{
                    $(value).html(marked.parse(data));
                })
            });
        });

        require(["https://cdn.jsdelivr.net/gh/ajaxorg/ace@master/lib/ace/ace.js"],(ace)=>{
                    console.log("ace loaded",ace)
                })
        */
        register(null, {
            babel: babel
        });

    }

    return appPlugin;
});
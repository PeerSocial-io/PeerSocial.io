define(function(require, exports, module) {
    /* globals $ */
    var EventEmitter = require("events").EventEmitter;
    var url = require("url");
    var cookie = require('cookie');

    function setCookie(cname, cvalue, exdays) {
        exdays = exdays || 365;
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));

        Math.floor((60 * 60 * 24 * 7) / 1000);

        let _cookie = cookie.serialize(cname, cvalue);

        _cookie += "; Max-Age=" + Math.floor((60 * 60 * 24 * exdays) / 1000);
        _cookie += "; Expires=" + d.toUTCString();
        _cookie += "; Path=/";
        // cookie += "; Domain=";
        document.cookie = _cookie;
    }

    function AppState() {

        var _self = this;
        this.currentState = History.getState();
        this.lastState = false;

        // window.onbeforeunload = function() {
        //     return true;
        // };

        // window.addEventListener('unload', function(event) {
        //     console.log('GOOD BYE!');
        // });
/*
        const events = [
            "pagehide", "pageshow",
            "unload", "load"
        ];

        const eventLogger = event => {
            switch (event.type) {
                case "pagehide":
                case "pageshow":
                    let isPersisted = event.persisted ? "persisted" : "not persisted";
                    console.log('Event:', event.type, '-', isPersisted);
                    break;
                default:
                    console.log('Event:', event.type);
                    break;
            }
        };

        events.forEach(eventName =>
            window.addEventListener(eventName, eventLogger)
        );
*/

        // if (this.currentState.hash.split("?")[0] == '/') {
        //     _self.pushState("/home", "Home");
        //     this.currentState = History.getState();
        // }

        History.Adapter.bind(window, 'statechange', function() { // Note: We are using statechange instead of popstate
            if (!_self.is_replaceState) {
                _self.lastState = _self.currentState;
            }
            _self.is_replaceState = false;

            _self.currentState = History.getState(); // Note: We are using History.getState() instead of event.state  
            _self.emitCurrentState();
        });

        $(document).on('DOMNodeInserted',async function(e) {
            $(e.target).find("a").click(function() {
                var urlPath = $(this).attr('href');
                var $url = url.parse(urlPath, true);
                var title = $(this).text();
                if (urlPath && urlPath.indexOf("/") == 0) {
                    //var _hash = urlPath.split("?")[0].split("~").shift().substring(1);

                    var $path = $url.pathname + ($url.hash || '');
                    $path = $path.split("/");
                    $path.shift();

                    var _hash = "/" + $path.shift();

                    if (appState.$hash._events[_hash]) {
                        _self.pushState(urlPath, title, urlPath);
                        e.preventDefault();
                        return false; // prevents default click action of <a ...>
                    }
                }
                else if (urlPath && urlPath.indexOf("#") > -1) {
                    //urlPath = "/"+urlPath.substring(urlPath.indexOf("#")+1);
                    //_self.pushState(urlPath, title, urlPath);
                }
                // else
                //     return false; // cancel click
            });
        });

        function animate(timestamp) {

            appState.$hash.emit("render", timestamp);

            window.requestAnimationFrame(animate);
        }
        window.requestAnimationFrame(animate);
        // 	$("body").on('click', 'a', function(e) {
        //       var urlPath = $(this).attr('href');
        //       var title = $(this).text();
        //       _self.pushState({urlPath: urlPath}, title, urlPath);
        //       e.preventDefault();
        //       return false; // prevents default click action of <a ...>
        //   });

        // _self.replaceState()
    }

    AppState.prototype = new EventEmitter();

    AppState.prototype.$hash = new EventEmitter();

    AppState.prototype.init = function() {

        var _self = this;

        return; //app called init

    };

    AppState.prototype.pushState = function(urlPath, title) {
        title = "PeerSocial.io" + (typeof title == "string" && title != "undefined" ? " " + title : "");

        if (typeof urlPath == "string")
            urlPath = { urlPath: urlPath };

        if (!urlPath) urlPath = {};

        if (!urlPath.urlPath) {
            var $url = url.parse(this.currentState.url, true);
            urlPath.urlPath = $url.path;
        }
        urlPath.render_time = (new Date).getTime();

        History.pushState(urlPath, title, urlPath.urlPath);
        $("title").text(title); //set new title after pushState :)
    };
    AppState.prototype.replaceState = function(urlPath, title) {

        title = "PeerSocial.io" + (typeof title == "string" && title != "undefined" ? " " + title : "");

        if (typeof urlPath == "string")
            urlPath = { urlPath: urlPath };

        if (!urlPath) urlPath = {};

        if (!urlPath.urlPath) {
            var $url = url.parse(this.currentState.url, true);
            urlPath.urlPath = $url.path;
        }
        urlPath.render_time = (new Date).getTime();
        this.is_replaceState = true;
        History.replaceState(urlPath, title, urlPath.urlPath);
        $("title").text(title); //set new title after pushState :)
    };

    AppState.prototype.currentState_destructors = [];

    AppState.prototype.emitCurrentState = function() {

        var _self = this;
        
        appState.$hash.emit('unload', appState.currentState, appState.lastState);
        
        appState.$hash.once("render", function() {

            appState.$hash.emit('200', appState.currentState, appState.lastState);

            while (_self.currentState_destructors.length) {
                _self.currentState_destructors.pop()();
            }
            
            
            // setTimeout(function() {
                appState.$hash.once("render", function() {

                    var $url = url.parse(_self.currentState.url, true);
                    var $path = $url.pathname + ($url.hash || '');
                    $path = $path.split("/");
                    $path.shift();

                    var _hash = "/" + $path.shift();
                    // if (_hash == "index.html") _hash = "home";
                    if (appState.$hash._events[_hash]) {
                        appState.$hash.emit(_hash, $path, appState.currentState, appState.lastState, function onDestroy(fn) {
                            if (typeof fn == "function") _self.currentState_destructors.push(fn);
                        });

                    }
                    else {
                        appState.$hash.emit('404', appState.currentState, appState.lastState);
                    }

                });
            // }, 300)
        });
    };

    Object.defineProperty(
        AppState.prototype,
        'hash', {
            get: function() {
                throw new Error("BAD");
            },
            set: function(hash) {
                throw new Error("BAD");
            }
        }
    );

    Object.defineProperty(
        AppState.prototype,
        'query', {
            get: function() {
                return url.parse(this.currentState.url, true).query;
            }
        }
    );



    AppState.prototype.history = History;

    AppState.prototype.reload = function() {
        this.emitCurrentState();
    };

    AppState.prototype.back = function() {
        this.history.back();
    };

    var appState = new AppState();


    appPlugin.consumes = ["app"];
    appPlugin.provides = ["state"];

    /* global History */
    return appPlugin;

    function appPlugin(options, imports, register) {
        imports.app.on("start", () => {
            setTimeout(function() {

                // appState.emitCurrentState();

                // if(!appState.currentState.data.urlPath)
                appState.replaceState();

            }, 100);
        });
        
        appState.$hash.once("render",()=>{
            register(null, {
                state: appState
            });
        });
    }

});
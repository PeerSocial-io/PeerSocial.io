define(function(require, exports, module) {

    var EventEmitter = require("events").EventEmitter;
    var url = require("url");

    function AppState() {

        var _self = this;
        this.currentState = History.getState();
        this.lastState = false;

        if (this.currentState.hash.split("?")[0] == '/') {
            _self.pushState("/home", "Home");
            this.currentState = History.getState();
        }

        History.Adapter.bind(window, 'statechange', function() { // Note: We are using statechange instead of popstate
            _self.currentState = History.getState(); // Note: We are using History.getState() instead of event.state
            _self.emitCurrentState();
        });

        $(document).on('DOMNodeInserted', function(e) {
            $(e.target).find("a").click(function() {
                var urlPath = $(this).attr('href');
                var title = $(this).text();
                if (urlPath.indexOf("/") == 0) {
                    //var _hash = urlPath.split("?")[0].split("~").shift().substring(1);

                    var $url = url.parse(urlPath, true);
                    var $path = $url.pathname + ($url.hash || '');
                    $path = $path.split("/");
                    $path.shift();

                    var _hash = $path.shift();
                    
                    if (appState.$hash._events[_hash]) {
                        _self.pushState(urlPath, title, urlPath);
                        e.preventDefault();
                    }
                    return false; // prevents default click action of <a ...>
                }
                else if (urlPath.indexOf("#") > -1) {
                    //urlPath = "/"+urlPath.substring(urlPath.indexOf("#")+1);
                    //_self.pushState(urlPath, title, urlPath);
                }
            })
        });

        function animate(timestamp) {

            appState.$hash.emit("/render");

            if (_self.lastHash)
                appState.$hash.emit("/render-" + _self.lastHash);

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

    }

    AppState.prototype = new EventEmitter();

    AppState.prototype.$hash = new EventEmitter();

    AppState.prototype.init = function() {

        var _self = this;
        //console.log("state",_self.currentState);


        // Change our States
        // 	History.pushState({state:1}, "State 1", "?state=1"); // logs {state:1}, "State 1", "?state=1"
        // 	History.pushState({state:2}, "State 2", "?state=2"); // logs {state:2}, "State 2", "?state=2"
        // 	History.replaceState({state:3}, "State 3", "?state=3"); // logs {state:3}, "State 3", "?state=3"
        // 	History.pushState(null, null, "?state=4"); // logs {}, '', "?state=4"
        // 	History.back(); // logs {state:3}, "State 3", "?state=3"
        // 	History.back(); // logs {state:1}, "State 1", "?state=1"
        // 	History.back(); // logs {}, "Home Page", "?"
        // 	History.go(2); // logs {state:3}, "State 3", "?state=3"



        setInterval(function() {

        }, 5000);

    };

    AppState.prototype.pushState = function(urlPath, title) {
        title = "PeerSocial " + (typeof title == "string" && title != "undefined" ? title : false) || "PeerSocial";
        $("title").text(title);
        History.pushState({ urlPath: urlPath }, title || "PeerSocial", urlPath);
    };
    AppState.prototype.replaceState = function(urlPath, title) {
        History.replaceState({ urlPath: urlPath }, "PeerSocial " + title || "PeerSocial", urlPath);
    };

    AppState.prototype.currentState_destructors = [];

    AppState.prototype.emitCurrentState = function() {

        var _self = this;

        appState.$hash.emit('200', appState.currentHash, appState.lastHash);
        while (_self.currentState_destructors.length) {
            _self.currentState_destructors.pop()();
        }

        setTimeout(function() {

            var $url = url.parse(_self.currentState.url, true);
            var $path = $url.pathname + ($url.hash || '');
            $path = $path.split("/");
            $path.shift();

            var _hash = $path.shift();
            // if (_hash == "index.html") _hash = "home";
            if (appState.$hash._events[_hash]) {
                appState.$hash.emit(_hash, $path, appState.currentState, appState.lastHash, function onDestroy(fn) {
                    if (typeof fn == "function") _self.currentState_destructors.push(fn);
                });

            }
            else {
                appState.$hash.emit('404', appState.currentHash, appState.lastHash);
            }

        }, 1)
    }

    Object.defineProperty(
        AppState.prototype,
        'hash', {
            get: function() {
                return this.currentHash;
            },
            set: function(hash) {
                if (hash == this.currentHash)
                    this.emitCurrentState()
                else
                    this.history.setHash(hash);
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
        this.emitCurrentState()
    }


    var appState = new AppState();


    appPlugin.consumes = ["app"];
    appPlugin.provides = ["state"];

    /* global History */
    return appPlugin;

    function appPlugin(options, imports, register) {
        imports.app.on("start", () => {
            setTimeout(function() {

                appState.emitCurrentState();

            }, 100)
        });

        register(null, {
            state: appState
        });

    }

});
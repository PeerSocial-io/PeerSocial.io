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
        /**
         * @type {EventEmitter}
         * @alias module:app.state
         * @description App state control
         * @summery Controls State of the app. URL based event emitter     * 
         */ 
        var _self = this;
        this.started = false;
        this.currentState = History.getState();
        this.lastState = false;

        var $home;
        Object.defineProperty(_self, 'home', {
            set(home) {
                $home = home;
                if(_self.started && _self.currentState.data.urlPath == "/")
                    _self.reload();
            },
            get() {
            return $home;
            }
        });


        History.Adapter.bind(window, 'statechange', function() { // Note: We are using statechange instead of popstate
            if (!_self.is_replaceState) {
                _self.lastState = _self.currentState;
            }
            _self.is_replaceState = false;

            _self.currentState = History.getState(); // Note: We are using History.getState() instead of event.state  
            _self.emitCurrentState();
        });

        this.navigate = function navigate(urlPath, title, done){
            var $url = url.parse(urlPath, true);
            
            if (urlPath && urlPath.indexOf("/") == 0) {
                
                var $path = $url.pathname + ($url.hash || '');
                $path = $path.split("/");
                $path.shift();

                var _hash = "/" + $path.shift();

                if (appState.$hash._events[_hash]) {
                    _self.pushState(urlPath, title, urlPath);
                    (done ? done(true) : true);
                    return true;
                }
            }
            (done ? done() : false);
            window.location = urlPath;
            return false;
        }

        $(document).on('DOMNodeInserted',async function(e) {
            $(e.target).find("a").click(function() {
                var urlPath = $(this).attr('href');
                var title = $(this).text();
                return !_self.navigate(urlPath,title, function(navigated){
                    if(navigated)
                        e.preventDefault();
                })
            });
        });

        function animate(timestamp) {

            /**
             * Triggered by `window.requestAnimationFrame`
             * @event module:app.state.$hash#render
             * @type {timestamp} 
             */
            appState.$hash.emit("render", timestamp);

            window.requestAnimationFrame(animate);
        }
        window.requestAnimationFrame(animate);
    }

    AppState.prototype = new EventEmitter();

    /**
     * @type {EventEmitter}
     * @alias module:app.state.$hash
     * @description App state page control
     * @summery Controls State of the app. URL based event emitter  `state.$hash.on("/mypage",()=>{})`
     */ 
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
        
        /**
         * Triggered before a page is rendered
         * @event module:app.state.$hash#unload
         * @type {object} 
         */
        appState.$hash.emit('unload', appState.currentState, appState.lastState);
        
        appState.$hash.once("render", function() {
            /**
             * Triggered before a page is found
             * @event module:app.state.$hash#200
             * @type {object} 
             */
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
                    if(_hash == "/" && appState.home) _hash = appState.home;                         
                    if (appState.$hash._events[_hash]) {
                        /**
                         * Triggered to load `/{pagename}`
                         * @event module:app.state.$hash#/{pagename}
                         * @property {array} path           -  remaining url string split with `/` 
                         * @property {HistoryState} currentState   -  current History state
                         * @property {HistoryState} lastState      -  last History state
                         */
                        appState.$hash.emit(_hash, $path, appState.currentState, appState.lastState, function onDestroy(fn) {
                            if (typeof fn == "function") _self.currentState_destructors.push(fn);
                        });

                    }
                    else {
                        /**
                         * Triggered before a page is NOT found
                         * @event module:app.state.$hash#400
                         * @type {object} 
                         */
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

    /**
     * @namespace module:app.state.query
     */
    Object.defineProperty(
        AppState.prototype,
        'query', {
            get: function() {
                return url.parse(this.currentState.url, true).query;
            }
        }
    );

    AppState.prototype.history = History;
    
    /**
     * @alias module:app.state.reload
     * @description reload current state
     */ 
    AppState.prototype.reload = function() {
        this.emitCurrentState();
    };

    /**
     * @alias module:app.state.back
     * @description go back 1 state
     */ 
    AppState.prototype.back = function() {
        this.history.back();
    };
    var appState = new AppState();


    appPlugin.consumes = ["app", "terminal"];
    appPlugin.provides = ["state"];

    /* global History */
    return appPlugin;

    function appPlugin(options, imports, register) {

        imports.terminal.on("state",(args,term,pause)=>{
            if(args.navigate){
                appState.navigate(args.navigate)
            }
        })

        imports.app.on("start", () => {
            setTimeout(function() {

                // appState.emitCurrentState();

                // if(!appState.currentState.data.urlPath)
                appState.started = true;
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
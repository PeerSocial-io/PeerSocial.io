define(function(require, exports, module) {

    // var location = window.document.location;

    // var preventNavigation = function() {
    //     var originalHashValue = location.hash;

    //     window.setTimeout(function() {
    //         location.hash = 'preventNavigation' + ~~(9999 * Math.random());
    //         location.hash = originalHashValue;
    //     }, 0);
    // };

    // window.addEventListener('beforeunload', preventNavigation, false);
    // window.addEventListener('unload', preventNavigation, false);



    var EventEmitter = require("events").EventEmitter;

    function AppState() {
        this.currentState = History.getState();
        this.currentHash = History.getHash();
        if (this.currentHash == '') {
            History.setHash("home");
            this.currentHash = History.getHash();
        }
        this.lastHash = false;

    }

    AppState.prototype = new EventEmitter();

    AppState.prototype.$hash = new EventEmitter();

    AppState.prototype.init = function() {
        //conso
        var _self = this;
        // Bind to StateChange Event
        History.Adapter.bind(window, 'statechange', function(err, e) { // Note: We are using statechange instead of popstate

            _self.currentState = History.getState();
            _self.currentHash = History.getHash();
            _self.emit("statechange", _self.currentHash, _self.currentState);
            //console.log("statechange", _self.currentHash, _self.currentState)
        });

        History.Adapter.bind(window, 'anchorchange', function(err, e) { // Note: We are using statechange instead of popstate
            _self.currentState = History.getState();

            var newHash = History.getHash();
            
            //console.log("anchorchange", newHash, _self.currentState)
            if (newHash != _self.currentHash) {
                _self.lastHash = _self.currentHash;
                _self.currentHash = History.getHash();
                _self.emit("anchorchange", _self.currentHash, _self.currentState);
                _self.emitCurrentHashHash();
                //AppState.prototype.$hash.emit(_self.currentHash, _self.currentState, _self.lastHash)
            }
        });

        /*
            // Change our States
            History.pushState({ state: 1 }, "State 1", "?state=1"); // logs {state:1}, "State 1", "?state=1"
            History.pushState({ state: 2 }, "State 2", "?state=2"); // logs {state:2}, "State 2", "?state=2"
            History.replaceState({ state: 3 }, "State 3", "?state=3"); // logs {state:3}, "State 3", "?state=3"
            History.pushState(null, null, "?state=4"); // logs {}, '', "?state=4"
            History.back(); // logs {state:3}, "State 3", "?state=3"
            History.back(); // logs {state:1}, "State 1", "?state=1"
            History.back(); // logs {}, "Home Page", "?"
            History.go(2); // logs {state:3}, "State 3", "?state=3"
        */
    }
    
    
    AppState.prototype.emitCurrentHashHash = function () {

        var hashSplit = appState.currentHash.split("~")
        var _hash = hashSplit.shift();
        hashSplit = hashSplit.join("~")
        appState.$hash.emit(_hash, hashSplit, appState.currentState, appState.lastHash);
    }

    Object.defineProperty(
        AppState.prototype,
        'hash', {
            get: function() {
                return this.currentHash;
            },
            set: function(hash) {
                if(hash == this.currentHash)
                    this.emitCurrentHashHash()
                else
                    this.history.setHash(hash);
            }
        }
    );


    AppState.prototype.history = History;


    var appState = new AppState();


    appPlugin.consumes = ["app"];
    appPlugin.provides = ["state"];

    /* global History */
    return appPlugin;

    function appPlugin(options, imports, register) {
        imports.app.on("start", () => {

            appState.emitCurrentHashHash();
        });

        register(null, {
            state: appState
        });

    }

});
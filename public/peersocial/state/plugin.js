define(function(require, exports, module) {

    var EventEmitter = require("events").EventEmitter;

    function AppState() {
        
        var _self = this;
        this.currentState = History.getState();
        this.lastState = false;
        
        if (this.currentState.hash == '/') {
            _self.pushState("/home","Home");
            this.currentState = History.getState();
        }
        
        History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
    		_self.currentState = History.getState(); // Note: We are using History.getState() instead of event.state
    		_self.emitCurrentState();
    	});
    	
    	$(document).on('DOMNodeInserted',function(e) {
    	    $(e.target).find("a").click(function(){
                var urlPath = $(this).attr('href');
                    var title = $(this).text();
                if(urlPath.indexOf("/") == 0){
                    _self.pushState(urlPath, title, urlPath);
                    e.preventDefault();
                    return false; // prevents default click action of <a ...>
                }else if(urlPath.indexOf("#") > -1){
                    //urlPath = "/"+urlPath.substring(urlPath.indexOf("#")+1);
                    //_self.pushState(urlPath, title, urlPath);
                }
            })
        });

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

    };
    
    
    
    AppState.prototype.pushState = function (urlPath, title) {
        title = "PeerSocial " + title || "PeerSocial";
        $("title").text(title);
        History.pushState({urlPath: urlPath}, title || "PeerSocial", urlPath);
    };
    AppState.prototype.replaceState = function (urlPath, title) {
        History.replaceState({urlPath: urlPath}, "PeerSocial " + title || "PeerSocial", urlPath);
    };
    
    AppState.prototype.emitCurrentState = function () {

        var _self = this;
        
        appState.$hash.emit('200', appState.currentHash, appState.lastHash);
        setTimeout(function(){
            
        
        var hashSplit = _self.currentState.hash.split("?")[0].split("~")
        var _hash = hashSplit.shift().substring(1);
        hashSplit = hashSplit.join("~")
        if(appState.$hash._events[_hash]){
            appState.$hash.emit(_hash, hashSplit, appState.currentState, appState.lastHash);
        }
        else{
            appState.$hash.emit('404', appState.currentHash, appState.lastHash);
        }
        
        },1)
    }

    Object.defineProperty(
        AppState.prototype,
        'hash', {
            get: function() {
                return this.currentHash;
            },
            set: function(hash) {
                if(hash == this.currentHash)
                    this.emitCurrentState()
                else
                    this.history.setHash(hash);
            }
        }
    );


    AppState.prototype.history = History;
    
    AppState.prototype.reload = function(){
        this.emitCurrentState()
    }
    

    var appState = new AppState();


    appPlugin.consumes = ["app"];
    appPlugin.provides = ["state"];

    /* global History */
    return appPlugin;

    function appPlugin(options, imports, register) {
        imports.app.on("start", () => {
            setTimeout(function(){
                
            appState.emitCurrentState();
            
            },100)
        });

        register(null, {
            state: appState
        });

    }

});
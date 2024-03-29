;(function(sr) {
  /* WITHOUT SECURE RENDER, BROWSERS SAVE USER DATA TO THE APPLICATION'S DOMAIN.
  THIS MEANS THE DOMAIN'S OWNER CAN ACCESS YOUR DATA. SECURE RENDER FIXES THIS.
  SECURE RENDER CREATES A SECURITY CONTEXT UNDER THE USER INSTEAD, NOT THE APP.
  APPLICATION LOGIC IS THEN RUN IN A THIRD CONTEXT, ISOLATED FROM ALL DOMAINS.

  THIS CODE IS USED AS BOTH A BROWSER EXTENSION AND A POLYFILL SHIM FOR WEBSITE APPS.
  IF THIS CODE IS RUNNING INSIDE THE BROWSER: USER DATA IS SAVED AND PROTECTED THERE.
  ELSE WARNING: UNTIL BROWSERS SUPPORT THIS, A USER CONTEXT IS SHIMMED UNDER THE POLYFILL,
  WHILE THIS IS MORE SECURE THAN APP OWNERS HAVING ACCESS TO DATA, IT STILL HAS RISKS.
  TO LEARN MORE ABOUT THESE LIMITATIONS, PLEASE READ SECURERENDER.ORG

  HOW SECURE RENDER WORKS: APP -> [ IFRAME SHIELD -> [SECURE RENDER] <-> USER DATA ]
  AN APP ONLY EVER FEEDS IN VIEW LOGIC. DATA IS NEVER SENT BACK UP! */
  /* global location MutationObserver */
  sr = { browser: (window.browser || window.chrome) };
  
  function fail() { document.body.innerHTML = "<center>SecureRender Loader has detected an external threat trying to tamper with the security of your application.<br/>Please reload to restore security. If you still have problems, search for a more trusted source to load the application from.</center>" }
  try { if (window.self !== window.top) { return fail() } }
  catch (e) {}; // App inside iframe could get clickjacked!

  window.addEventListener("load", function() {
    var tag = document.getElementsByTagName('SecureRender');
    if (!tag.length) { tag = document.getElementsByClassName('SecureRender') }
    if (!tag.length) { return } // No Secure Render found.
    if (tag[0].matches('iframe')) { return } // Secure Render already running.
    frame(tag[0]); // Secure Render found, start the window frame to render inside of.
  });

  
  function frame(tag, next) {
    var hash, js, css;
    
    var events = new EventEmitter();
    events._emit = events.emit;
    events.emit = function(...data){
      i.contentWindow.postMessage(['event',data],"*")
    }
    i = document.createElement('iframe');
    i.className = 'SecureRender';
    // i.sandbox = 'allow-scripts allow-popups allow-downloads allow-pointer-lock';
    // i.csp = "script-src 'unsafe-eval' 'self' blob:; "+
    //         "connect-src 'self'; default-src data: blob: mediastream: filesystem:; "+
    //         "style-src 'self' 'unsafe-inline' blob:; "+
    //         "child-src 'self' blob:; "+
    //         "worker-src blob: 'self';"
    
    i.name = "SecureRender-Enclave";
    i.onload = function() { 
      window.addEventListener("message",function(eve) {
        var msg = eve.data;
        if (!msg) { return }//always have data
        if(eve.source === i.contentWindow){//from child
          eve.preventDefault();
          eve.stopImmediatePropagation();
          events._emit(...msg)
        }
      });
      i.onload = null;
      i.contentWindow.postMessage(['html', tag.outerHTML],"*")
      if(next) next(i, events)
    }
    var path = window.location.pathname.toString().split("/");
    path.pop();path = path.join("/")+"/";

    js = tag.getAttribute("content-js");
    if(js){
      tag.removeAttribute("content-js");
      if(js.indexOf("./") == 0)
      js = (path + js.substr(0-js.length+2));
      if(!(js.indexOf("://") > -1)){
        js = (window.location.protocol + "//"+ window.location.host + js);
      }
      tag.setAttribute("src-js",js)
    }

    css = tag.getAttribute("content-css");
    if(css){
      tag.removeAttribute("content-css");
      if(css.indexOf("./") == 0)
      css = (path + css.substr(0-css.length+2));
      if(!(css.indexOf("://") > -1)){
        css = (window.location.protocol + "//"+ window.location.host + css);
      }
      tag.setAttribute("src-css",css)
    }

    var done = (hash)=>{
      i.style = "position: fixed; border: 0; width: 100%; height: 100%; top: 0; left: 0; right: 0; bottom: 0;";
      i.src = '/peersocial/securerender/enclave.html'; // else emulate
      document.body.appendChild(i);
    }

    hash = tag.getAttribute("content-hash");    
    var code = tag.innerHTML;
    var enc = new TextEncoder(); // always utf-8
      tag.removeAttribute("hash");
      crypto.subtle.digest('SHA-256',  enc.encode(code)).then(($hash)=>{
        $hash = btoa(String.fromCharCode.apply(null, new Uint8Array($hash)));
        if(hash == $hash){
          done($hash);
        }else {
          console.error("LOW SECURITY, PLEASE ADD HASH TO RESOUCE", 'context',$hash)
          done($hash);
        }
      })

    return i;
  }

  console.log("SecureRender: THIS IS AN ALPHA FOR DEVELOPERS, NO POLYFILL HAS BEEN PUBLISHED YET, YOU MUST PROTOTYPE IT AS AN UNPACKED EXTENSION!");
  
  var EventEmitter = (function(){
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

    var isArray = Array.isArray;
    var domain;

    function EventEmitter() {
        this.domain = null;
        
        this._events = this._events || null;
        this._maxListeners = this._maxListeners || defaultMaxListeners;
    }
    // exports.EventEmitter = EventEmitter;

    // By default EventEmitters will print a warning if more than
    // 10 listeners are added to it. This is a useful default which
    // helps finding memory leaks.
    //
    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    var defaultMaxListeners = 10;
    EventEmitter.prototype.setMaxListeners = function (n) {
        this._maxListeners = n;
    };

    // non-global reference, for speed.
    var PROCESS;

    EventEmitter.prototype.emit = function (type) {
        // If there is no 'error' event listener then throw.
        if (type === 'error') {
            if (!this._events || !this._events.error || (isArray(this._events.error) && !this._events.error.length)) {
                if (this.domain) {
                    var er = arguments[1];
                    er.domainEmitter = this;
                    er.domain = this.domain;
                    er.domainThrown = false;
                    this.domain.emit('error', er);
                    return false;
                }

                if (arguments[1] instanceof Error) {
                    throw arguments[1]; // Unhandled 'error' event
                } else {
                    throw new Error("Uncaught, unspecified 'error' event.");
                }
                return false;
            }
        }

        if (!this._events) return false;
        var handler = this._events[type];
        if (!handler) return false;

        if (typeof handler == 'function') {
            if (this.domain) {
                PROCESS = PROCESS || process;
                if (this !== PROCESS) {
                    this.domain.enter();
                }
            }
            switch (arguments.length) {
                // fast cases
                case 1:
                    handler.call(this);
                    break;
                case 2:
                    handler.call(this, arguments[1]);
                    break;
                case 3:
                    handler.call(this, arguments[1], arguments[2]);
                    break;
                    // slower
                default:
                    var l = arguments.length;
                    var args = new Array(l - 1);
                    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                    handler.apply(this, args);
            }
            if (this.domain && this !== PROCESS) {
                this.domain.exit();
            }
            return true;

        } else if (isArray(handler)) {
            if (this.domain) {
                PROCESS = PROCESS || process;
                if (this !== PROCESS) {
                    this.domain.enter();
                }
            }
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

            var listeners = handler.slice();
            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(this, args);
            }
            if (this.domain && this !== PROCESS) {
                this.domain.exit();
            }
            return true;

        } else {
            return false;
        }
    };

    EventEmitter.prototype.addListener = function (type, listener) {
        if ('function' !== typeof listener) {
            throw new Error('addListener only takes instances of Function');
        }

        if (!this._events) this._events = {};

        // To avoid recursion in the case that type == "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (this._events.newListener) {
            this.emit('newListener', type, typeof listener.listener === 'function' ? listener.listener : listener);
        }

        if (!this._events[type]) {
            // Optimize the case of one listener. Don't need the extra array object.
            this._events[type] = listener;
        } else if (isArray(this._events[type])) {

            // If we've already got an array, just append.
            this._events[type].push(listener);

        } else {
            // Adding the second element, need to change to array.
            this._events[type] = [this._events[type], listener];

        }

        // Check for listener leak
        if (isArray(this._events[type]) && !this._events[type].warned) {
            var m;
            m = this._maxListeners;

            if (m && m > 0 && this._events[type].length > m) {
                this._events[type].warned = true;
                console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
                console.trace();
            }
        }

        return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function (type, listener) {
        if ('function' !== typeof listener) {
            throw new Error('.once only takes instances of Function');
        }

        var self = this;

        function g() {
            self.removeListener(type, g);
            listener.apply(this, arguments);
        };

        g.listener = listener;
        self.on(type, g);

        return this;
    };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener = function (type, listener) {
        if ('function' !== typeof listener) {
            throw new Error('removeListener only takes instances of Function');
        }

        // does not use listeners(), so no side effect of creating _events[type]
        if (!this._events || !this._events[type]) return this;

        var list = this._events[type];

        if (isArray(list)) {
            var position = -1;
            for (var i = 0, length = list.length; i < length; i++) {
                if (list[i] === listener || (list[i].listener && list[i].listener === listener)) {
                    position = i;
                    break;
                }
            }

            if (position < 0) return this;
            list.splice(position, 1);
            if (list.length == 0) this._events[type] = null;

            if (this._events.removeListener) {
                this.emit('removeListener', type, listener);
            }
        } else if (list === listener || (list.listener && list.listener === listener)) {
            this._events[type] = null;

            if (this._events.removeListener) {
                this.emit('removeListener', type, listener);
            }
        }

        return this;
    };

    EventEmitter.prototype.removeAllListeners = function (type) {
        if (!this._events) return this;

        // fast path
        if (!this._events.removeListener) {
            if (arguments.length === 0) {
                this._events = {};
            } else if (type && this._events && this._events[type]) {
                this._events[type] = null;
            }
            return this;
        }

        // slow(ish) path, emit 'removeListener' events for all removals
        if (arguments.length === 0) {
            for (var key in this._events) {
                if (key === 'removeListener') continue;
                this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = {};
            return this;
        }

        var listeners = this._events[type];
        if (isArray(listeners)) {
            while (listeners.length) {
                // LIFO order
                this.removeListener(type, listeners[listeners.length - 1]);
            }
        } else if (listeners) {
            this.removeListener(type, listeners);
        }
        this._events[type] = null;

        return this;
    };

    EventEmitter.prototype.listeners = function (type) {
        if (!this._events || !this._events[type]) return [];
        if (!isArray(this._events[type])) {
            return [this._events[type]];
        }
        return this._events[type].slice(0);
    };
    return EventEmitter;
  })();

  (function($export, root) { "object" == typeof exports && "undefined" != typeof module ? root(exports) : "function" == typeof define && define.amd ? define(["exports"], root) : root(($export = "undefined" != typeof globalThis ? globalThis : $export || self)) })(this,function(exports){
    

    exports.SecureRender = async function SecureRender(code, codeHash, contextJS ,contextCSS){
        if(!code) return;
      return new Promise(async (resolve,reject)=>{
        if(document.readyState == "loading"){
          window.addEventListener('load',complete)
        }else complete()

        async function complete(){
          var tag = document.createElement('script');
          tag.innerHTML = code;
          if(contextCSS)
            tag.setAttribute("content-css",contextCSS)
          if(contextJS)
            tag.setAttribute("content-js",contextJS)
          if(codeHash)
            tag.setAttribute("content-hash",codeHash)
          frame(tag, (iframe, events)=>{
              var pubsub = new EventEmitter();
              // pubsub._emit = pubsub.emit;
              // pubsub.emit = function(eve,data){
              //   iframe.contentWindow.postMessage({how:eve,data:data},"*")
              // }
              // pubSubs.set(iframe.contentWindow.id, pubsub)
              resolve(events);
          })
        }
    });
    };
  })

  


}());
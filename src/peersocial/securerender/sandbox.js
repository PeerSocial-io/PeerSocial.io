window.SecureRender = function SecureRender() {};;
(function (sr, SecureRender, u) {

    
    var _EventEmitter = (function(){
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
        
        // EventEmitter.prototype = Object.create(globalThis, {
        //     constructor: {
        //         value: EventEmitter
        //     }
        // });
    
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
      });

    var EventEmitter = _EventEmitter();

    sr = new EventEmitter();
    SecureRender = window.SecureRender;

    function fail() {
        fail.yes = 1;
        var text = (newLine) => {
            return `SecureRender has detected an external threat trying to tamper with the security of your application.${newLine}Please reload to restore security. If you still have problems, search for a more trusted source to load the application from.`
        };
        document.body.innerHTML = `<center>${text(`<br/>`)}</center>`;
        window.parent.postMessage({
            how: "fail",
            who: "Sandbox"
        }, '*');
    }

    //   setTimeout(fail,3000)//test sandbox fail

    var window_onmessage;
    window.addEventListener("message", window_onmessage = function (eve) { // hear from enclave, and workers.
        var msg = eve.data;
        if (!msg) return; //always have data

        if (eve.source === window.parent) { // from parent
            eve.preventDefault();
            eve.stopImmediatePropagation();
            sr.emit(...msg);
            return;
        }

        if (eve.currentTarget === sr.workers.get(eve.currentTarget.id)) { //from child
            eve.preventDefault();
            eve.stopImmediatePropagation();
            if (window.parent !== window) { //i am NOT top window
                eve.currentTarget.sr.events._emit.apply(eve.currentTarget.sr.events, msg);
            }
            return;
        }
    });

    var worker_message = function (eve) { // hear from enclave, and workers.
        var msg = eve.data;
        if (!msg) {
            return
        } //always have data

        if (eve.srcElement == global) { //from internal
            eve.preventDefault();
            eve.stopImmediatePropagation();
            worker._emit(...msg);
            return;
        }

    };

    var worker_emitter = `var EventEmitter = ([${_EventEmitter}][0])();`;

    var worker_emit = function (...data) {
        worker.postMessage(data)
    };

    
    var load_hashed_content = function (type, $url, done) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', $url, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var response = xhr.responseText;
                var $hash = $url.split("#")[1]
                var enc = new TextEncoder(); // always utf-8
                response = enc.encode(response);
                url = window.URL.createObjectURL(new Blob([response]));
                if ($hash)

                    crypto.subtle.digest('SHA-256', response).then((hash) => {
                        hash = btoa(String.fromCharCode.apply(null, new Uint8Array(hash)));
                        if (hash == $hash)
                            content_script(type, url, done)
                        else {
                            console.log("SecureRender hash Policy invalid for url", $url.split("#")[0], hash)
                            fail();
                        }
                    });
                else {
                    crypto.subtle.digest('SHA-256', response).then((hash) => {
                        console.error("LOW SECURITY, PLEASE ADD HASH TO RESOUCE", $url, btoa(String.fromCharCode.apply(null, new Uint8Array(hash))))
                        content_script(type, url, done)
                    });
                }
            }
        }

    }

    sr.workers = new Map;
    var workeridc = 0;
    var worker_run = async function (msg) {
        if (sr.workers.get(msg.get)) return;

        var worker,
            $sr = new EventEmitter();

        Object.defineProperty($sr, 'worker', {
            get: function () {
                return worker;
            }
        });
        $sr._emit = $sr.emit;
        $sr.emit = function (...data) {
            window.parent.postMessage(data, "*");
        };
        sr.on("event", (data) => $sr._emit(...data))
        $sr.events = new EventEmitter();
        $sr.events._emit = $sr.events.emit;
        $sr.events.emit = function (...data) {
            worker.postMessage(data);
        };
        $sr.workers = sr.workers;
        var _sr = window.SecureRender ? window.SecureRender : SecureRender ? SecureRender : function SecureRender() {};
        var $r = _sr;
        $r = $r($sr);
        if (!$r) $r = _sr;
        $r = await $r();
        console.warn("spawn untrusted script in worker:", msg);

        var url = window.URL.createObjectURL(new Blob([`var worker;
(worker = (function(){   
    ${worker_emitter}
    var global = globalThis;
    var worker = new EventEmitter();
    worker.postMessage = globalThis.postMessage.bind(globalThis);
    worker.addEventListener = globalThis.addEventListener.bind(globalThis);
    worker._emit = worker.emit;
    worker.emit = ${worker_emit};
    worker.addEventListener("message", ${worker_message} );
    delete globalThis.postMessage;
    delete globalThis.addEventListener;
    delete globalThis.onmessage;
    Object.defineProperty(globalThis, 'onmessage', { get: function() { return null }, set: function() {} });
    delete globalThis.globalThis;
    return ${$r}; 
})())(async function(){ 
    var globalThis, self = function(){ 
        ${msg.put} 
    };self = self.bind(self)(); 
    return self;
});`]));

        worker = SecureWorker(url, {
            name: "SecureRender-" + ++workeridc
        });
        Object.defineProperty(worker, 'sr', {
            get: function () {
                return $sr;
            }
        });
        sr.workers.set(worker.id = msg.get, worker);
        worker.addEventListener('message', window_onmessage);
    }

    //   var view;
    sr.worker = {}; // RPC
    sr.once("html", function (msg) {
        var div = document.createElement('div');
        div.innerHTML = msg;
        var all = div.getElementsByTagName('script'),
            i = 0,
            s, t;
        while (s = all[i++]) {
            if (!s.matches('secured')) {
                s.className = 'secured';
                
                if (t = s.innerText) {
                    ((s) => {
                        var n = () => {
                            worker_run({
                                how: 'script',
                                put: t
                            });
                        };
                        var n2 = () => {
                            if (n2 = s.getAttribute("src-js")) {
                                load_hashed_content("js", n2, n);
                            } else n();
                        };
                        if (s.getAttribute("src-css")) load_hashed_content("css", s.getAttribute("src-css"), n2);
                        else n2();
                    })(s)
                }
            }
        }
    });

    $content_scripts = new Map;
    content_script = function (type, src, next) {
        if ($content_scripts.get(src)) {
            return next()
        }
        var r;
        if (type == "js") {
            r = document.createElement('script');
            r.setAttribute("type", "text/javascript");
            r.setAttribute("src", src);
            r.onload = () => next();
        }
        if (type == "css") {
            r = document.createElement("link")
            r.setAttribute("rel", "stylesheet")
            r.setAttribute("type", "text/css")
            r.setAttribute("href", src)
            r.onload = () => next();
        }
        if (r) {
            $content_scripts.set(src, r);
            document.getElementsByTagName("head")[0].appendChild(r);
        } else next()
    }

    function makeid(length) {
        let result = '';
        let characters = 'abcdefghijklmnopqrstuvwxyz';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    var sandbox_id = makeid(32);
    Object.defineProperty(Window.prototype, 'id', {
        get: function () {
            return sandbox_id;
        }
    });

    function SecureWorker(url, args) {
        var _id = makeid(32);
        var worker = new Worker(url, args);
        Object.defineProperty(worker, '_id', {
            get: function () {
                return _id;
            }
        });
        return worker;
    }


}());
var window = globalThis;

(function (Gun) {
  Gun = Gun();//(["https://www.peersocial.io/gun"]);
  var gun;

  var addResourcesToCache = async (resources) => {
    var cache = await caches.open("v1");
    await cache.put(resources);
  };

  var files = [ 
    "/package.json"
  ]

  self.addEventListener("install", (event) => {
    console.log("?install")
    caches.keys().then(function (names) {
      for (let name of names)
        caches.delete(name);
    });

    self.skipWaiting();
  });


  self.addEventListener("message", (event) => {
    console.log("?message")
  });

  self.addEventListener("statechange", (event) => {
    console.log("?statechange")
  });

  self.addEventListener('offline', function () {
    console.log("?offline")
  })
  self.addEventListener('online', function () {
    console.log("?online")
  })


  self.addEventListener("activate", (event) => {
    console.log("?activated")
    if(!gun)
      gun = Gun(["https://www.peersocial.io/gun"]);
  });

  self.addEventListener('notificationclick', function (event) {
    console.log('?notificationclick');
    event.notification.close();

  });

  self.addEventListener("fetch", async (event) => {
    event.respondWith(check2Cache(event));
    // Let the browser do its default thing
    // for non-GET requests.
    // if (event.request.method != "GET") return; 

    // // Prevent the default, and handle the request ourselves. 
    // event.respondWith(
    //     (async function () { 
    //         // Try to get the response from a cache.
    //         const cache = await caches.open("dynamic-v1");
    //         const cachedResponse = await cache.match(event.request);

    //         if (cachedResponse) {
    //             // If we found a match in the cache, return it, but also
    //             // update the entry in the cache in the background.
    //             event.waitUntil(cache.add(event.request));
    //             return cachedResponse;
    //         }

    //         // If we didn't find a match in the cache, use the network.
    //         return fetch(event.request);
    //     })() 
    // );
  });

  async function putInCache(request, response) {
    var cache = await caches.open("v1");
    await cache.put(request, response);
  };
  async function removeFromCache(request) {
    var cache = await caches.open("v1");
    await cache.delete(request);
  };

  function myFetch(url, resolve) {
    var headers = {
      "Content-Type": "text/html"
    };
    fetch(url)
      .then(response => { headers = response.headers; return response.body})
      .then(rb => {
        const reader = rb.getReader();
        return new Promise((resolve) => {
          console.log("???", url)
          var streamData = [];
          function push() {
            reader.read().then( ({done, value}) => {
              if (done) {
                console.log("ReadableStream done")
                return resolve(new ReadableStream({
                  start(writer) {
                    for (var i in streamData) {
                      writer.enqueue(streamData[i]);
                    }
                    writer.close();
                  }
                }));
              }
              streamData.push(value)
              push();
            })
          }    
          push();
        })
      })
      .then(stream => {        
        return new Promise(async (resolve) => {
          resolve(new Response(await stream, {
            headers: headers
          }))
        })
      })
      .then(async response => {

        var data = (await (await response).clone().text()) + "<!-- this file was loaded from service worker cache -->";
        // console.log(url,data)

        resolve(new Response(data,{
          headers: headers
        }));
      });
  }

  function check2Cache(event) {
    return new Promise(async (resolve) => {
      try {
        var request = event.request,
          cache,resolved = false, reply;

        var checkURL = new Request("/service.worker").url;

        if (cache = await caches.match(request)) {
          console.log("CACHED", request.url)
          finish(cache, true);
        }

        if (request.url == checkURL) {
          myFetch(request.url,async function(response){
            finish(response, resolved)
          });
          return;
        }
        
        var webResponse;
        if(!resolved && (webResponse = await fetch(request)) ) {
          console.log("webResponse",request.url.indexOf(checkURL) == 0, request.url, checkURL)
          finish(webResponse, request.url.indexOf(checkURL) == 0  )
        }

      
        function finish(response, dontSaveToCache){
          if(!resolved){
            resolved = true;
            resolve(response);
          }
          if(!dontSaveToCache)
            putInCache(request, response.clone());
        }



        // var checkURL = new Request("/app/app.js").url;
        // if (request.url == checkURL) {
        //   resolve(reply = await fetch(request));
        //   console.log("caching", request.url)
        //   putInCache(request, reply.clone());
        //   return;
        // }

        // checkURL = new Request("/").url;
        // if (request.url == checkURL) {
        //   myFetch(request.url,resolve);
        //   return;
        // }

        // if(!reply && !cacheResolved)
        //   return resolve(reply = await fetch(request));

      } catch (error) {
        resolve(new Response('Network error happened', {
          status: 408,
          headers: {
            'Content-Type': 'text/plain'
          },
        }))
      }
    })
  };

  self.addEventListener('periodicsync', event => {

    console.log('?periodicsync');
  });



})(function () {

  

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GUN = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    //default gun
    var Gun =   require('./src/root');
    require('./src/shim');
    require('./src/onto');
    require('./src/valid');
    require('./src/state');
    require('./src/dup');
    require('./src/ask');
    require('./src/chain');
    require('./src/back');
    require('./src/put');
    require('./src/get');
    require('./src/on');
    require('./src/map');
    require('./src/set');
    require('./src/mesh');
    require('./src/websocket');
    require('./src/localStorage');
    
    //default extra gun lis to include
    require('./lib/lex');
    
    require("./nts");
    require("./lib/unset");
    require("./lib/not");
    require("./lib/open");
    require("./lib/load");
    
    //include sea in the build
    require('./sea');
    
    module.exports = Gun;
    
    },{"./lib/lex":2,"./lib/load":3,"./lib/not":4,"./lib/open":5,"./lib/unset":6,"./nts":7,"./sea":8,"./src/ask":9,"./src/back":10,"./src/chain":11,"./src/dup":12,"./src/get":13,"./src/localStorage":15,"./src/map":16,"./src/mesh":17,"./src/on":18,"./src/onto":19,"./src/put":20,"./src/root":21,"./src/set":22,"./src/shim":23,"./src/state":24,"./src/valid":25,"./src/websocket":26}],2:[function(require,module,exports){
    (function (Gun, u) {
        /**
         * 
         *  credits: 
         *      github:bmatusiak
         * 
         */    
        var lex = (gun) => {
            function Lex() {}
    
            Lex.prototype = Object.create(Object.prototype, {
                constructor: {
                    value: Lex
                }
            });
            Lex.prototype.toString = function () {
                return JSON.stringify(this);
            }
            Lex.prototype.more = function (m) {
                this[">"] = m;
                return this;
            }
            Lex.prototype.less = function (le) {
                this["<"] = le;
                return this;
            }
            Lex.prototype.in = function () {
                var l = new Lex();
                this["."] = l;
                return l;
            }
            Lex.prototype.of = function () {
                var l = new Lex();
                this.hash(l)
                return l;
            }
            Lex.prototype.hash = function (h) {
                this["#"] = h;
                return this;
            }
            Lex.prototype.prefix = function (p) {
                this["*"] = p;
                return this;
            }
            Lex.prototype.return = function (r) {
                this["="] = r;
                return this;
            }
            Lex.prototype.limit = function (l) {
                this["%"] = l;
                return this;
            }
            Lex.prototype.reverse = function (rv) {
                this["-"] = rv || 1;
                return this;
            }
            Lex.prototype.includes = function (i) {
                this["+"] = i;
                return this;
            }
            Lex.prototype.map = function (...args) {
                return gun.map(this, ...args);
            }
            Lex.prototype.match = lex.match;
            
            return new Lex();
        };
    
        lex.match = function(t,o){ var tmp, u;
            o = o || this || {};            
            if('string' == typeof o){ o = {'=': o} }
            if('string' !== typeof t){ return false }
            tmp = (o['='] || o['*'] || o['>'] || o['<']);
            if(t === tmp){ return true }
            if(u !== o['=']){ return false }
            tmp = (o['*'] || o['>']);
            if(t.slice(0, (tmp||'').length) === tmp){ return true }
            if(u !== o['*']){ return false }
            if(u !== o['>'] && u !== o['<']){
                return (t >= o['>'] && t <= o['<'])? true : false;
            }
            if(u !== o['>'] && t >= o['>']){ return true }
            if(u !== o['<'] && t <= o['<']){ return true }
            return false;
        }
    
        Gun.Lex = lex;
    
        Gun.chain.lex = function () {
            return lex(this);
        }
    
    })((typeof window !== "undefined") ? window.Gun : require('../gun'))
    },{"../gun":1}],3:[function(require,module,exports){
    var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
    Gun.chain.open || require('./open');
    
    Gun.chain.load = function(cb, opt, at){
        (opt = opt || {}).off = !0;
        return this.open(cb, opt, at);
    }
    },{"../gun":1,"./open":5}],4:[function(require,module,exports){
    if(typeof window !== "undefined"){
      var Gun = window.Gun;
    } else { 
      var Gun = require('../gun');
    }
    
    var u;
    
    Gun.chain.not = function(cb, opt, t){
        return this.get(ought, {not: cb});
    }
    
    function ought(at, ev){ ev.off();
        if(at.err || (u !== at.put)){ return }
        if(!this.not){ return }
        this.not.call(at.gun, at.get, function(){ console.log("Please report this bug on https://gitter.im/amark/gun and in the issues."); need.to.implement; });
    }
    },{"../gun":1}],5:[function(require,module,exports){
    var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
    
    Gun.chain.open = function(cb, opt, at, depth){ // this is a recursive function, BEWARE!
        depth = depth || 1;
        opt = opt || {}; // init top level options.
        opt.doc = opt.doc || {};
        opt.ids = opt.ids || {};
        opt.any = opt.any || cb;
        opt.meta = opt.meta || false;
        opt.eve = opt.eve || {off: function(){ // collect all recursive events to unsubscribe to if needed.
            Object.keys(opt.eve.s).forEach(function(i,e){ // switch to CPU scheduled setTimeout.each?
                if(e = opt.eve.s[i]){ e.off() }
            });
            opt.eve.s = {};
        }, s:{}}
        return this.on(function(data, key, ctx, eve){ // subscribe to 1 deeper of data!
            clearTimeout(opt.to); // do not trigger callback if bunch of changes...
            opt.to = setTimeout(function(){ // but schedule the callback to fire soon!
                if(!opt.any){ return }
                opt.any.call(opt.at.$, opt.doc, opt.key, opt, opt.eve); // call it.
                if(opt.off){ // check for unsubscribing.
                    opt.eve.off();
                    opt.any = null;
                }
            }, opt.wait || 9);
            opt.at = opt.at || ctx; // opt.at will always be the first context it finds.
            opt.key = opt.key || key;
            opt.eve.s[this._.id] = eve; // collect all the events together.
            if(true === Gun.valid(data)){ // if primitive value...
                if(!at){
                    opt.doc = data;
                } else {
                    at[key] = data;
                }
                return;
            }
            var tmp = this; // else if a sub-object, CPU schedule loop over properties to do recursion.
            setTimeout.each(Object.keys(data), function(key, val){
                if('_' === key && !opt.meta){ return }
                val = data[key];
                var doc = at || opt.doc, id; // first pass this becomes the root of open, then at is passed below, and will be the parent for each sub-document/object.
                if(!doc){ return } // if no "parent"
                if('string' !== typeof (id = Gun.valid(val))){ // if primitive...
                    doc[key] = val;
                    return;
                }
                if(opt.ids[id]){ // if we've already seen this sub-object/document
                    doc[key] = opt.ids[id]; // link to itself, our already in-memory one, not a new copy.
                    return;
                }
                if(opt.depth <= depth){ // stop recursive open at max depth.
                    doc[key] = doc[key] || val; // show link so app can load it if need.
                    return;
                } // now open up the recursion of sub-documents!
                tmp.get(key).open(opt.any, opt, opt.ids[id] = doc[key] = {}, depth+1); // 3rd param is now where we are "at".
            });
        })
    }
    },{"../gun":1}],6:[function(require,module,exports){
    var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
    
    const rel_ = '#';  // '#'
    const node_ = '_';  // '_'
    
    Gun.chain.unset = function(node){
        if( this && node && node[node_] && node[node_].put && node[node_].put[node_] && node[node_].put[node_][rel_] ){
            this.put( { [node[node_].put[node_][rel_]]:null} );
        }
        return this;
    }
    
    },{"../gun":1}],7:[function(require,module,exports){
    ;(function(){
      var Gun  = (typeof window !== "undefined")? window.Gun : require('./gun');
      var dam  = 'nts';
      var smooth = 2;
    
      Gun.on('create', function(root){ // switch to DAM, deprecated old
          return ; // stub out for now. TODO: IMPORTANT! re-add back in later.
        var opt = root.opt, mesh = opt.mesh;
        if(!mesh) return;
    
        // Track connections
        var connections = [];
        root.on('hi', function(peer) {
          this.to.next(peer);
          connections.push({peer, latency: 0, offset: 0, next: 0});
        });
        root.on('bye', function(peer) {
          this.to.next(peer);
          var found = connections.find(connection => connection.peer.id == peer.id);
          if (!found) return;
          connections.splice(connections.indexOf(found), 1);
        });
    
        function response(msg, connection) {
          var now            = Date.now(); // Lack of drift intentional, provides more accurate RTT
          connection.latency = (now - msg.nts[0]) / 2;
          connection.offset  = (msg.nts[1] + connection.latency) - (now + Gun.state.drift);
          console.log(connection.offset);
          Gun.state.drift   += connection.offset / (connections.length + smooth);
          console.log(`Update time by local: ${connection.offset} / ${connections.length + smooth}`);
        }
    
        // Handle echo & setting based on known connection latency as well
        mesh.hear[dam] = function(msg, peer) {
          console.log('MSG', msg);
          var now   = Date.now() + Gun.state.drift;
          var connection = connections.find(connection => connection.peer.id == peer.id);
          if (!connection) return;
          if (msg.nts.length >= 2) return response(msg, connection);
          mesh.say({dam, '@': msg['#'], nts: msg.nts.concat(now)}, peer);
          connection.offset = msg.nts[0] + connection.latency - now;
          Gun.state.drift  += connection.offset / (connections.length + smooth);
          console.log(`Update time by remote: ${connection.offset} / ${connections.length + smooth}`);
        };
    
        // Handle ping transmission
        setTimeout(function trigger() {
          console.log('TRIGGER');
          if (!connections.length) return setTimeout(trigger, 100);
          var now = Date.now(); // Lack of drift intentional, provides more accurate RTT & NTP reference
    
          // Send pings
          connections.forEach(function(connection) {
            if (connection.next > now) return;
            mesh.say({
              dam,
              '#': String.random(3),
              nts: [now],
            });
          });
    
          // Plan next round of pings
          connections.forEach(function(connection) {
            if (connection.next > now) return;
            // https://discord.com/channels/612645357850984470/612645357850984473/755334349699809300
            var delay = Math.min(2e4, Math.max(250, 150000 / Math.abs((connection.offset)||1)));
            connection.next = now + delay;
          });
    
          // Plan next trigger round
          // May overshoot by runtime of this function
          var nextRound = Infinity;
          connections.forEach(function(connection) {
            nextRound = Math.min(nextRound, connection.next);
          });
          setTimeout(trigger, nextRound - now);
          console.log(`Next sync round in ${(nextRound - now) / 1000} seconds`);
        }, 1);
      });
    
    }());
    
    },{"./gun":1}],8:[function(require,module,exports){
    ;(function(){
    
      /* UNBUILD */
      function USE(arg, req){
        return req? require(arg) : arg.slice? USE[R(arg)] : function(mod, path){
          arg(mod = {exports: {}});
          USE[R(path)] = mod.exports;
        }
        function R(p){
          return p.split('/').slice(-1).toString().replace('.js','');
        }
      }
      if(typeof module !== "undefined"){ var MODULE = module }
      /* UNBUILD */
    
      ;USE(function(module){
        // Security, Encryption, and Authorization: SEA.js
        // MANDATORY READING: https://gun.eco/explainers/data/security.html
        // IT IS IMPLEMENTED IN A POLYFILL/SHIM APPROACH.
        // THIS IS AN EARLY ALPHA!
    
        if(typeof window !== "undefined"){ module.window = window }
    
        var tmp = module.window || module, u;
        var SEA = tmp.SEA || {};
    
        if(SEA.window = module.window){ SEA.window.SEA = SEA }
    
        try{ if(u+'' !== typeof MODULE){ MODULE.exports = SEA } }catch(e){}
        module.exports = SEA;
      })(USE, './root');
    
      ;USE(function(module){
        var SEA = USE('./root');
        try{ if(SEA.window){
          if(location.protocol.indexOf('s') < 0
          && location.host.indexOf('localhost') < 0
          && ! /^127\.\d+\.\d+\.\d+$/.test(location.hostname)
          && location.protocol.indexOf('file:') < 0){
            console.warn('HTTPS needed for WebCrypto in SEA, redirecting...');
            location.protocol = 'https:'; // WebCrypto does NOT work without HTTPS!
          }
        } }catch(e){}
      })(USE, './https');
    
      ;USE(function(module){
        var u;
        if(u+''== typeof btoa){
          if(u+'' == typeof Buffer){
            try{ global.Buffer = USE("buffer", 1).Buffer }catch(e){ console.log("Please `npm install buffer` or add it to your package.json !") }
          }
          global.btoa = function(data){ return Buffer.from(data, "binary").toString("base64") };
          global.atob = function(data){ return Buffer.from(data, "base64").toString("binary") };
        }
      })(USE, './base64');
    
      ;USE(function(module){
        USE('./base64');
        // This is Array extended to have .toString(['utf8'|'hex'|'base64'])
        function SeaArray() {}
        Object.assign(SeaArray, { from: Array.from })
        SeaArray.prototype = Object.create(Array.prototype)
        SeaArray.prototype.toString = function(enc, start, end) { enc = enc || 'utf8'; start = start || 0;
          const length = this.length
          if (enc === 'hex') {
            const buf = new Uint8Array(this)
            return [ ...Array(((end && (end + 1)) || length) - start).keys()]
            .map((i) => buf[ i + start ].toString(16).padStart(2, '0')).join('')
          }
          if (enc === 'utf8') {
            return Array.from(
              { length: (end || length) - start },
              (_, i) => String.fromCharCode(this[ i + start])
            ).join('')
          }
          if (enc === 'base64') {
            return btoa(this)
          }
        }
        module.exports = SeaArray;
      })(USE, './array');
    
      ;USE(function(module){
        USE('./base64');
        // This is Buffer implementation used in SEA. Functionality is mostly
        // compatible with NodeJS 'safe-buffer' and is used for encoding conversions
        // between binary and 'hex' | 'utf8' | 'base64'
        // See documentation and validation for safe implementation in:
        // https://github.com/feross/safe-buffer#update
        var SeaArray = USE('./array');
        function SafeBuffer(...props) {
          console.warn('new SafeBuffer() is depreciated, please use SafeBuffer.from()')
          return SafeBuffer.from(...props)
        }
        SafeBuffer.prototype = Object.create(Array.prototype)
        Object.assign(SafeBuffer, {
          // (data, enc) where typeof data === 'string' then enc === 'utf8'|'hex'|'base64'
          from() {
            if (!Object.keys(arguments).length || arguments[0]==null) {
              throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
            }
            const input = arguments[0]
            let buf
            if (typeof input === 'string') {
              const enc = arguments[1] || 'utf8'
              if (enc === 'hex') {
                const bytes = input.match(/([\da-fA-F]{2})/g)
                .map((byte) => parseInt(byte, 16))
                if (!bytes || !bytes.length) {
                  throw new TypeError('Invalid first argument for type \'hex\'.')
                }
                buf = SeaArray.from(bytes)
              } else if (enc === 'utf8' || 'binary' === enc) { // EDIT BY MARK: I think this is safe, tested it against a couple "binary" strings. This lets SafeBuffer match NodeJS Buffer behavior more where it safely btoas regular strings.
                const length = input.length
                const words = new Uint16Array(length)
                Array.from({ length: length }, (_, i) => words[i] = input.charCodeAt(i))
                buf = SeaArray.from(words)
              } else if (enc === 'base64') {
                const dec = atob(input)
                const length = dec.length
                const bytes = new Uint8Array(length)
                Array.from({ length: length }, (_, i) => bytes[i] = dec.charCodeAt(i))
                buf = SeaArray.from(bytes)
              } else if (enc === 'binary') { // deprecated by above comment
                buf = SeaArray.from(input) // some btoas were mishandled.
              } else {
                console.info('SafeBuffer.from unknown encoding: '+enc)
              }
              return buf
            }
            const byteLength = input.byteLength // what is going on here? FOR MARTTI
            const length = input.byteLength ? input.byteLength : input.length
            if (length) {
              let buf
              if (input instanceof ArrayBuffer) {
                buf = new Uint8Array(input)
              }
              return SeaArray.from(buf || input)
            }
          },
          // This is 'safe-buffer.alloc' sans encoding support
          alloc(length, fill = 0 /*, enc*/ ) {
            return SeaArray.from(new Uint8Array(Array.from({ length: length }, () => fill)))
          },
          // This is normal UNSAFE 'buffer.alloc' or 'new Buffer(length)' - don't use!
          allocUnsafe(length) {
            return SeaArray.from(new Uint8Array(Array.from({ length : length })))
          },
          // This puts together array of array like members
          concat(arr) { // octet array
            if (!Array.isArray(arr)) {
              throw new TypeError('First argument must be Array containing ArrayBuffer or Uint8Array instances.')
            }
            return SeaArray.from(arr.reduce((ret, item) => ret.concat(Array.from(item)), []))
          }
        })
        SafeBuffer.prototype.from = SafeBuffer.from
        SafeBuffer.prototype.toString = SeaArray.prototype.toString
    
        module.exports = SafeBuffer;
      })(USE, './buffer');
    
      ;USE(function(module){
        const SEA = USE('./root')
        const api = {Buffer: USE('./buffer')}
        var o = {}, u;
    
        // ideally we can move away from JSON entirely? unlikely due to compatibility issues... oh well.
        JSON.parseAsync = JSON.parseAsync || function(t,cb,r){ var u; try{ cb(u, JSON.parse(t,r)) }catch(e){ cb(e) } }
        JSON.stringifyAsync = JSON.stringifyAsync || function(v,cb,r,s){ var u; try{ cb(u, JSON.stringify(v,r,s)) }catch(e){ cb(e) } }
    
        api.parse = function(t,r){ return new Promise(function(res, rej){
          JSON.parseAsync(t,function(err, raw){ err? rej(err) : res(raw) },r);
        })}
        api.stringify = function(v,r,s){ return new Promise(function(res, rej){
          JSON.stringifyAsync(v,function(err, raw){ err? rej(err) : res(raw) },r,s);
        })}
    
        if(SEA.window){
          api.crypto = window.crypto || window.msCrypto
          api.subtle = (api.crypto||o).subtle || (api.crypto||o).webkitSubtle;
          api.TextEncoder = window.TextEncoder;
          api.TextDecoder = window.TextDecoder;
          api.random = (len) => api.Buffer.from(api.crypto.getRandomValues(new Uint8Array(api.Buffer.alloc(len))));
        }
        if(!api.TextDecoder)
        {
          const { TextEncoder, TextDecoder } = USE((u+'' == typeof MODULE?'.':'')+'./lib/text-encoding', 1);
          api.TextDecoder = TextDecoder;
          api.TextEncoder = TextEncoder;
        }
        if(!api.crypto)
        {
          try
          {
          var crypto = USE('crypto', 1);
          Object.assign(api, {
            crypto,
            random: (len) => api.Buffer.from(crypto.randomBytes(len))
          });      
          const { Crypto: WebCrypto } = USE('@peculiar/webcrypto', 1);
          api.ossl = api.subtle = new WebCrypto({directory: 'ossl'}).subtle // ECDH
        }
        catch(e){
          console.log("Please `npm install @peculiar/webcrypto` or add it to your package.json !");
        }}
    
        module.exports = api
      })(USE, './shim');
    
      ;USE(function(module){
        var SEA = USE('./root');
        var shim = USE('./shim');
        var s = {};
        s.pbkdf2 = {hash: {name : 'SHA-256'}, iter: 100000, ks: 64};
        s.ecdsa = {
          pair: {name: 'ECDSA', namedCurve: 'P-256'},
          sign: {name: 'ECDSA', hash: {name: 'SHA-256'}}
        };
        s.ecdh = {name: 'ECDH', namedCurve: 'P-256'};
    
        // This creates Web Cryptography API compliant JWK for sign/verify purposes
        s.jwk = function(pub, d){  // d === priv
          pub = pub.split('.');
          var x = pub[0], y = pub[1];
          var jwk = {kty: "EC", crv: "P-256", x: x, y: y, ext: true};
          jwk.key_ops = d ? ['sign'] : ['verify'];
          if(d){ jwk.d = d }
          return jwk;
        };
        
        s.keyToJwk = function(keyBytes) {
          const keyB64 = keyBytes.toString('base64');
          const k = keyB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
          return { kty: 'oct', k: k, ext: false, alg: 'A256GCM' };
        }
    
        s.recall = {
          validity: 12 * 60 * 60, // internally in seconds : 12 hours
          hook: function(props){ return props } // { iat, exp, alias, remember } // or return new Promise((resolve, reject) => resolve(props)
        };
    
        s.check = function(t){ return (typeof t == 'string') && ('SEA{' === t.slice(0,4)) }
        s.parse = async function p(t){ try {
          var yes = (typeof t == 'string');
          if(yes && 'SEA{' === t.slice(0,4)){ t = t.slice(3) }
          return yes ? await shim.parse(t) : t;
          } catch (e) {}
          return t;
        }
    
        SEA.opt = s;
        module.exports = s
      })(USE, './settings');
    
      ;USE(function(module){
        var shim = USE('./shim');
        module.exports = async function(d, o){
          var t = (typeof d == 'string')? d : await shim.stringify(d);
          var hash = await shim.subtle.digest({name: o||'SHA-256'}, new shim.TextEncoder().encode(t));
          return shim.Buffer.from(hash);
        }
      })(USE, './sha256');
    
      ;USE(function(module){
        // This internal func returns SHA-1 hashed data for KeyID generation
        const __shim = USE('./shim')
        const subtle = __shim.subtle
        const ossl = __shim.ossl ? __shim.ossl : subtle
        const sha1hash = (b) => ossl.digest({name: 'SHA-1'}, new ArrayBuffer(b))
        module.exports = sha1hash
      })(USE, './sha1');
    
      ;USE(function(module){
        var SEA = USE('./root');
        var shim = USE('./shim');
        var S = USE('./settings');
        var sha = USE('./sha256');
        var u;
    
        SEA.work = SEA.work || (async (data, pair, cb, opt) => { try { // used to be named `proof`
          var salt = (pair||{}).epub || pair; // epub not recommended, salt should be random!
          opt = opt || {};
          if(salt instanceof Function){
            cb = salt;
            salt = u;
          }
          data = (typeof data == 'string')? data : await shim.stringify(data);
          if('sha' === (opt.name||'').toLowerCase().slice(0,3)){
            var rsha = shim.Buffer.from(await sha(data, opt.name), 'binary').toString(opt.encode || 'base64')
            if(cb){ try{ cb(rsha) }catch(e){console.log(e)} }
            return rsha;
          }
          salt = salt || shim.random(9);
          var key = await (shim.ossl || shim.subtle).importKey('raw', new shim.TextEncoder().encode(data), {name: opt.name || 'PBKDF2'}, false, ['deriveBits']);
          var work = await (shim.ossl || shim.subtle).deriveBits({
            name: opt.name || 'PBKDF2',
            iterations: opt.iterations || S.pbkdf2.iter,
            salt: new shim.TextEncoder().encode(opt.salt || salt),
            hash: opt.hash || S.pbkdf2.hash,
          }, key, opt.length || (S.pbkdf2.ks * 8))
          data = shim.random(data.length)  // Erase data in case of passphrase
          var r = shim.Buffer.from(work, 'binary').toString(opt.encode || 'base64')
          if(cb){ try{ cb(r) }catch(e){console.log(e)} }
          return r;
        } catch(e) { 
          console.log(e);
          SEA.err = e;
          if(SEA.throw){ throw e }
          if(cb){ cb() }
          return;
        }});
    
        module.exports = SEA.work;
      })(USE, './work');
    
      ;USE(function(module){
        var SEA = USE('./root');
        var shim = USE('./shim');
        var S = USE('./settings');
    
        SEA.name = SEA.name || (async (cb, opt) => { try {
          if(cb){ try{ cb() }catch(e){console.log(e)} }
          return;
        } catch(e) {
          console.log(e);
          SEA.err = e;
          if(SEA.throw){ throw e }
          if(cb){ cb() }
          return;
        }});
    
        //SEA.pair = async (data, proof, cb) => { try {
        SEA.pair = SEA.pair || (async (cb, opt) => { try {
    
          var ecdhSubtle = shim.ossl || shim.subtle;
          // First: ECDSA keys for signing/verifying...
          var sa = await shim.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, [ 'sign', 'verify' ])
          .then(async (keys) => {
            // privateKey scope doesn't leak out from here!
            //const { d: priv } = await shim.subtle.exportKey('jwk', keys.privateKey)
            var key = {};
            key.priv = (await shim.subtle.exportKey('jwk', keys.privateKey)).d;
            var pub = await shim.subtle.exportKey('jwk', keys.publicKey);
            //const pub = Buff.from([ x, y ].join(':')).toString('base64') // old
            key.pub = pub.x+'.'+pub.y; // new
            // x and y are already base64
            // pub is UTF8 but filename/URL safe (https://www.ietf.org/rfc/rfc3986.txt)
            // but split on a non-base64 letter.
            return key;
          })
          
          // To include PGPv4 kind of keyId:
          // const pubId = await SEA.keyid(keys.pub)
          // Next: ECDH keys for encryption/decryption...
    
          try{
          var dh = await ecdhSubtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveKey'])
          .then(async (keys) => {
            // privateKey scope doesn't leak out from here!
            var key = {};
            key.epriv = (await ecdhSubtle.exportKey('jwk', keys.privateKey)).d;
            var pub = await ecdhSubtle.exportKey('jwk', keys.publicKey);
            //const epub = Buff.from([ ex, ey ].join(':')).toString('base64') // old
            key.epub = pub.x+'.'+pub.y; // new
            // ex and ey are already base64
            // epub is UTF8 but filename/URL safe (https://www.ietf.org/rfc/rfc3986.txt)
            // but split on a non-base64 letter.
            return key;
          })
          }catch(e){
            if(SEA.window){ throw e }
            if(e == 'Error: ECDH is not a supported algorithm'){ console.log('Ignoring ECDH...') }
            else { throw e }
          } dh = dh || {};
    
          var r = { pub: sa.pub, priv: sa.priv, /* pubId, */ epub: dh.epub, epriv: dh.epriv }
          if(cb){ try{ cb(r) }catch(e){console.log(e)} }
          return r;
        } catch(e) {
          console.log(e);
          SEA.err = e;
          if(SEA.throw){ throw e }
          if(cb){ cb() }
          return;
        }});
    
        module.exports = SEA.pair;
      })(USE, './pair');
    
      ;USE(function(module){
        var SEA = USE('./root');
        var shim = USE('./shim');
        var S = USE('./settings');
        var sha = USE('./sha256');
        var u;
    
        SEA.sign = SEA.sign || (async (data, pair, cb, opt) => { try {
          opt = opt || {};
          if(!(pair||opt).priv){
            if(!SEA.I){ throw 'No signing key.' }
            pair = await SEA.I(null, {what: data, how: 'sign', why: opt.why});
          }
          if(u === data){ throw '`undefined` not allowed.' }
          var json = await S.parse(data);
          var check = opt.check = opt.check || json;
          if(SEA.verify && (SEA.opt.check(check) || (check && check.s && check.m))
          && u !== await SEA.verify(check, pair)){ // don't sign if we already signed it.
            var r = await S.parse(check);
            if(!opt.raw){ r = 'SEA' + await shim.stringify(r) }
            if(cb){ try{ cb(r) }catch(e){console.log(e)} }
            return r;
          }
          var pub = pair.pub;
          var priv = pair.priv;
          var jwk = S.jwk(pub, priv);
          var hash = await sha(json);
          var sig = await (shim.ossl || shim.subtle).importKey('jwk', jwk, {name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign'])
          .then((key) => (shim.ossl || shim.subtle).sign({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, new Uint8Array(hash))) // privateKey scope doesn't leak out from here!
          var r = {m: json, s: shim.Buffer.from(sig, 'binary').toString(opt.encode || 'base64')}
          if(!opt.raw){ r = 'SEA' + await shim.stringify(r) }
    
          if(cb){ try{ cb(r) }catch(e){console.log(e)} }
          return r;
        } catch(e) {
          console.log(e);
          SEA.err = e;
          if(SEA.throw){ throw e }
          if(cb){ cb() }
          return;
        }});
    
        module.exports = SEA.sign;
      })(USE, './sign');
    
      ;USE(function(module){
        var SEA = USE('./root');
        var shim = USE('./shim');
        var S = USE('./settings');
        var sha = USE('./sha256');
        var u;
    
        SEA.verify = SEA.verify || (async (data, pair, cb, opt) => { try {
          var json = await S.parse(data);
          if(false === pair){ // don't verify!
            var raw = await S.parse(json.m);
            if(cb){ try{ cb(raw) }catch(e){console.log(e)} }
            return raw;
          }
          opt = opt || {};
          // SEA.I // verify is free! Requires no user permission.
          var pub = pair.pub || pair;
          var key = SEA.opt.slow_leak? await SEA.opt.slow_leak(pub) : await (shim.ossl || shim.subtle).importKey('jwk', S.jwk(pub), {name: 'ECDSA', namedCurve: 'P-256'}, false, ['verify']);
          var hash = await sha(json.m);
          var buf, sig, check, tmp; try{
            buf = shim.Buffer.from(json.s, opt.encode || 'base64'); // NEW DEFAULT!
            sig = new Uint8Array(buf);
            check = await (shim.ossl || shim.subtle).verify({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, sig, new Uint8Array(hash));
            if(!check){ throw "Signature did not match." }
          }catch(e){
            if(SEA.opt.fallback){
              return await SEA.opt.fall_verify(data, pair, cb, opt);
            }
          }
          var r = check? await S.parse(json.m) : u;
    
          if(cb){ try{ cb(r) }catch(e){console.log(e)} }
          return r;
        } catch(e) {
          console.log(e); // mismatched owner FOR MARTTI
          SEA.err = e;
          if(SEA.throw){ throw e }
          if(cb){ cb() }
          return;
        }});
    
        module.exports = SEA.verify;
        // legacy & ossl memory leak mitigation:
    
        var knownKeys = {};
        var keyForPair = SEA.opt.slow_leak = pair => {
          if (knownKeys[pair]) return knownKeys[pair];
          var jwk = S.jwk(pair);
          knownKeys[pair] = (shim.ossl || shim.subtle).importKey("jwk", jwk, {name: 'ECDSA', namedCurve: 'P-256'}, false, ["verify"]);
          return knownKeys[pair];
        };
    
        var O = SEA.opt;
        SEA.opt.fall_verify = async function(data, pair, cb, opt, f){
          if(f === SEA.opt.fallback){ throw "Signature did not match" } f = f || 1;
          var tmp = data||'';
          data = SEA.opt.unpack(data) || data;
          var json = await S.parse(data), pub = pair.pub || pair, key = await SEA.opt.slow_leak(pub);
          var hash = (f <= SEA.opt.fallback)? shim.Buffer.from(await shim.subtle.digest({name: 'SHA-256'}, new shim.TextEncoder().encode(await S.parse(json.m)))) : await sha(json.m); // this line is old bad buggy code but necessary for old compatibility.
          var buf; var sig; var check; try{
            buf = shim.Buffer.from(json.s, opt.encode || 'base64') // NEW DEFAULT!
            sig = new Uint8Array(buf)
            check = await (shim.ossl || shim.subtle).verify({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, sig, new Uint8Array(hash))
            if(!check){ throw "Signature did not match." }
          }catch(e){ try{
            buf = shim.Buffer.from(json.s, 'utf8') // AUTO BACKWARD OLD UTF8 DATA!
            sig = new Uint8Array(buf)
            check = await (shim.ossl || shim.subtle).verify({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, sig, new Uint8Array(hash))
            }catch(e){
            if(!check){ throw "Signature did not match." }
            }
          }
          var r = check? await S.parse(json.m) : u;
          O.fall_soul = tmp['#']; O.fall_key = tmp['.']; O.fall_val = data; O.fall_state = tmp['>'];
          if(cb){ try{ cb(r) }catch(e){console.log(e)} }
          return r;
        }
        SEA.opt.fallback = 2;
    
      })(USE, './verify');
    
      ;USE(function(module){
        var shim = USE('./shim');
        var S = USE('./settings');
        var sha256hash = USE('./sha256');
    
        const importGen = async (key, salt, opt) => {
          //const combo = shim.Buffer.concat([shim.Buffer.from(key, 'utf8'), salt || shim.random(8)]).toString('utf8') // old
          opt = opt || {};
          const combo = key + (salt || shim.random(8)).toString('utf8'); // new
          const hash = shim.Buffer.from(await sha256hash(combo), 'binary')
          
          const jwkKey = S.keyToJwk(hash)      
          return await shim.subtle.importKey('jwk', jwkKey, {name:'AES-GCM'}, false, ['encrypt', 'decrypt'])
        }
        module.exports = importGen;
      })(USE, './aeskey');
    
      ;USE(function(module){
        var SEA = USE('./root');
        var shim = USE('./shim');
        var S = USE('./settings');
        var aeskey = USE('./aeskey');
        var u;
    
        SEA.encrypt = SEA.encrypt || (async (data, pair, cb, opt) => { try {
          opt = opt || {};
          var key = (pair||opt).epriv || pair;
          if(u === data){ throw '`undefined` not allowed.' }
          if(!key){
            if(!SEA.I){ throw 'No encryption key.' }
            pair = await SEA.I(null, {what: data, how: 'encrypt', why: opt.why});
            key = pair.epriv || pair;
          }
          var msg = (typeof data == 'string')? data : await shim.stringify(data);
          var rand = {s: shim.random(9), iv: shim.random(15)}; // consider making this 9 and 15 or 18 or 12 to reduce == padding.
          var ct = await aeskey(key, rand.s, opt).then((aes) => (/*shim.ossl ||*/ shim.subtle).encrypt({ // Keeping the AES key scope as private as possible...
            name: opt.name || 'AES-GCM', iv: new Uint8Array(rand.iv)
          }, aes, new shim.TextEncoder().encode(msg)));
          var r = {
            ct: shim.Buffer.from(ct, 'binary').toString(opt.encode || 'base64'),
            iv: rand.iv.toString(opt.encode || 'base64'),
            s: rand.s.toString(opt.encode || 'base64')
          }
          if(!opt.raw){ r = 'SEA' + await shim.stringify(r) }
    
          if(cb){ try{ cb(r) }catch(e){console.log(e)} }
          return r;
        } catch(e) { 
          console.log(e);
          SEA.err = e;
          if(SEA.throw){ throw e }
          if(cb){ cb() }
          return;
        }});
    
        module.exports = SEA.encrypt;
      })(USE, './encrypt');
    
      ;USE(function(module){
        var SEA = USE('./root');
        var shim = USE('./shim');
        var S = USE('./settings');
        var aeskey = USE('./aeskey');
    
        SEA.decrypt = SEA.decrypt || (async (data, pair, cb, opt) => { try {
          opt = opt || {};
          var key = (pair||opt).epriv || pair;
          if(!key){
            if(!SEA.I){ throw 'No decryption key.' }
            pair = await SEA.I(null, {what: data, how: 'decrypt', why: opt.why});
            key = pair.epriv || pair;
          }
          var json = await S.parse(data);
          var buf, bufiv, bufct; try{
            buf = shim.Buffer.from(json.s, opt.encode || 'base64');
            bufiv = shim.Buffer.from(json.iv, opt.encode || 'base64');
            bufct = shim.Buffer.from(json.ct, opt.encode || 'base64');
            var ct = await aeskey(key, buf, opt).then((aes) => (/*shim.ossl ||*/ shim.subtle).decrypt({  // Keeping aesKey scope as private as possible...
              name: opt.name || 'AES-GCM', iv: new Uint8Array(bufiv), tagLength: 128
            }, aes, new Uint8Array(bufct)));
          }catch(e){
            if('utf8' === opt.encode){ throw "Could not decrypt" }
            if(SEA.opt.fallback){
              opt.encode = 'utf8';
              return await SEA.decrypt(data, pair, cb, opt);
            }
          }
          var r = await S.parse(new shim.TextDecoder('utf8').decode(ct));
          if(cb){ try{ cb(r) }catch(e){console.log(e)} }
          return r;
        } catch(e) { 
          console.log(e);
          SEA.err = e;
          if(SEA.throw){ throw e }
          if(cb){ cb() }
          return;
        }});
    
        module.exports = SEA.decrypt;
      })(USE, './decrypt');
    
      ;USE(function(module){
        var SEA = USE('./root');
        var shim = USE('./shim');
        var S = USE('./settings');
        // Derive shared secret from other's pub and my epub/epriv 
        SEA.secret = SEA.secret || (async (key, pair, cb, opt) => { try {
          opt = opt || {};
          if(!pair || !pair.epriv || !pair.epub){
            if(!SEA.I){ throw 'No secret mix.' }
            pair = await SEA.I(null, {what: key, how: 'secret', why: opt.why});
          }
          var pub = key.epub || key;
          var epub = pair.epub;
          var epriv = pair.epriv;
          var ecdhSubtle = shim.ossl || shim.subtle;
          var pubKeyData = keysToEcdhJwk(pub);
          var props = Object.assign({ public: await ecdhSubtle.importKey(...pubKeyData, true, []) },{name: 'ECDH', namedCurve: 'P-256'}); // Thanks to @sirpy !
          var privKeyData = keysToEcdhJwk(epub, epriv);
          var derived = await ecdhSubtle.importKey(...privKeyData, false, ['deriveBits']).then(async (privKey) => {
            // privateKey scope doesn't leak out from here!
            var derivedBits = await ecdhSubtle.deriveBits(props, privKey, 256);
            var rawBits = new Uint8Array(derivedBits);
            var derivedKey = await ecdhSubtle.importKey('raw', rawBits,{ name: 'AES-GCM', length: 256 }, true, [ 'encrypt', 'decrypt' ]);
            return ecdhSubtle.exportKey('jwk', derivedKey).then(({ k }) => k);
          })
          var r = derived;
          if(cb){ try{ cb(r) }catch(e){console.log(e)} }
          return r;
        } catch(e) {
          console.log(e);
          SEA.err = e;
          if(SEA.throw){ throw e }
          if(cb){ cb() }
          return;
        }});
    
        // can this be replaced with settings.jwk?
        var keysToEcdhJwk = (pub, d) => { // d === priv
          //var [ x, y ] = shim.Buffer.from(pub, 'base64').toString('utf8').split(':') // old
          var [ x, y ] = pub.split('.') // new
          var jwk = d ? { d: d } : {}
          return [  // Use with spread returned value...
            'jwk',
            Object.assign(
              jwk,
              { x: x, y: y, kty: 'EC', crv: 'P-256', ext: true }
            ), // ??? refactor
            {name: 'ECDH', namedCurve: 'P-256'}
          ]
        }
    
        module.exports = SEA.secret;
      })(USE, './secret');
    
      ;USE(function(module){
        var SEA = USE('./root');
        // This is to certify that a group of "certificants" can "put" anything at a group of matched "paths" to the certificate authority's graph
        SEA.certify = SEA.certify || (async (certificants, policy = {}, authority, cb, opt = {}) => { try {
          /*
          The Certify Protocol was made out of love by a Vietnamese code enthusiast. Vietnamese people around the world deserve respect!
          IMPORTANT: A Certificate is like a Signature. No one knows who (authority) created/signed a cert until you put it into their graph.
          "certificants": '*' or a String (Bob.pub) || an Object that contains "pub" as a key || an array of [object || string]. These people will have the rights.
          "policy": A string ('inbox'), or a RAD/LEX object {'*': 'inbox'}, or an Array of RAD/LEX objects or strings. RAD/LEX object can contain key "?" with indexOf("*") > -1 to force key equals certificant pub. This rule is used to check against soul+'/'+key using Gun.text.match or String.match.
          "authority": Key pair or priv of the certificate authority.
          "cb": A callback function after all things are done.
          "opt": If opt.expiry (a timestamp) is set, SEA won't sync data after opt.expiry. If opt.block is set, SEA will look for block before syncing.
          */
          console.log('SEA.certify() is an early experimental community supported method that may change API behavior without warning in any future version.')
    
          certificants = (() => {
            var data = []
            if (certificants) {
              if ((typeof certificants === 'string' || Array.isArray(certificants)) && certificants.indexOf('*') > -1) return '*'
              if (typeof certificants === 'string') return certificants
              if (Array.isArray(certificants)) {
                if (certificants.length === 1 && certificants[0]) return typeof certificants[0] === 'object' && certificants[0].pub ? certificants[0].pub : typeof certificants[0] === 'string' ? certificants[0] : null
                certificants.map(certificant => {
                  if (typeof certificant ==='string') data.push(certificant)
                  else if (typeof certificant === 'object' && certificant.pub) data.push(certificant.pub)
                })
              }
    
              if (typeof certificants === 'object' && certificants.pub) return certificants.pub
              return data.length > 0 ? data : null
            }
            return
          })()
    
          if (!certificants) return console.log("No certificant found.")
    
          const expiry = opt.expiry && (typeof opt.expiry === 'number' || typeof opt.expiry === 'string') ? parseFloat(opt.expiry) : null
          const readPolicy = (policy || {}).read ? policy.read : null
          const writePolicy = (policy || {}).write ? policy.write : typeof policy === 'string' || Array.isArray(policy) || policy["+"] || policy["#"] || policy["."] || policy["="] || policy["*"] || policy[">"] || policy["<"] ? policy : null
          // The "blacklist" feature is now renamed to "block". Why ? BECAUSE BLACK LIVES MATTER!
          // We can now use 3 keys: block, blacklist, ban
          const block = (opt || {}).block || (opt || {}).blacklist || (opt || {}).ban || {}
          const readBlock = block.read && (typeof block.read === 'string' || (block.read || {})['#']) ? block.read : null
          const writeBlock = typeof block === 'string' ? block : block.write && (typeof block.write === 'string' || block.write['#']) ? block.write : null
    
          if (!readPolicy && !writePolicy) return console.log("No policy found.")
    
          // reserved keys: c, e, r, w, rb, wb
          const data = JSON.stringify({
            c: certificants,
            ...(expiry ? {e: expiry} : {}), // inject expiry if possible
            ...(readPolicy ? {r: readPolicy }  : {}), // "r" stands for read, which means read permission.
            ...(writePolicy ? {w: writePolicy} : {}), // "w" stands for write, which means write permission.
            ...(readBlock ? {rb: readBlock} : {}), // inject READ block if possible
            ...(writeBlock ? {wb: writeBlock} : {}), // inject WRITE block if possible
          })
    
          const certificate = await SEA.sign(data, authority, null, {raw:1})
    
          var r = certificate
          if(!opt.raw){ r = 'SEA'+JSON.stringify(r) }
          if(cb){ try{ cb(r) }catch(e){console.log(e)} }
          return r;
        } catch(e) {
          SEA.err = e;
          if(SEA.throw){ throw e }
          if(cb){ cb() }
          return;
        }});
    
        module.exports = SEA.certify;
      })(USE, './certify');
    
      ;USE(function(module){
        var shim = USE('./shim');
        // Practical examples about usage found in tests.
        var SEA = USE('./root');
        SEA.work = USE('./work');
        SEA.sign = USE('./sign');
        SEA.verify = USE('./verify');
        SEA.encrypt = USE('./encrypt');
        SEA.decrypt = USE('./decrypt');
        SEA.certify = USE('./certify');
        //SEA.opt.aeskey = USE('./aeskey'); // not official! // this causes problems in latest WebCrypto.
    
        SEA.random = SEA.random || shim.random;
    
        // This is Buffer used in SEA and usable from Gun/SEA application also.
        // For documentation see https://nodejs.org/api/buffer.html
        SEA.Buffer = SEA.Buffer || USE('./buffer');
    
        // These SEA functions support now ony Promises or
        // async/await (compatible) code, use those like Promises.
        //
        // Creates a wrapper library around Web Crypto API
        // for various AES, ECDSA, PBKDF2 functions we called above.
        // Calculate public key KeyID aka PGPv4 (result: 8 bytes as hex string)
        SEA.keyid = SEA.keyid || (async (pub) => {
          try {
            // base64('base64(x):base64(y)') => shim.Buffer(xy)
            const pb = shim.Buffer.concat(
              pub.replace(/-/g, '+').replace(/_/g, '/').split('.')
              .map((t) => shim.Buffer.from(t, 'base64'))
            )
            // id is PGPv4 compliant raw key
            const id = shim.Buffer.concat([
              shim.Buffer.from([0x99, pb.length / 0x100, pb.length % 0x100]), pb
            ])
            const sha1 = await sha1hash(id)
            const hash = shim.Buffer.from(sha1, 'binary')
            return hash.toString('hex', hash.length - 8)  // 16-bit ID as hex
          } catch (e) {
            console.log(e)
            throw e
          }
        });
        // all done!
        // Obviously it is missing MANY necessary features. This is only an alpha release.
        // Please experiment with it, audit what I've done so far, and complain about what needs to be added.
        // SEA should be a full suite that is easy and seamless to use.
        // Again, scroll naer the top, where I provide an EXAMPLE of how to create a user and sign in.
        // Once logged in, the rest of the code you just read handled automatically signing/validating data.
        // But all other behavior needs to be equally easy, like opinionated ways of
        // Adding friends (trusted public keys), sending private messages, etc.
        // Cheers! Tell me what you think.
        ((SEA.window||{}).GUN||{}).SEA = SEA;
    
        module.exports = SEA
        // -------------- END SEA MODULES --------------------
        // -- BEGIN SEA+GUN MODULES: BUNDLED BY DEFAULT UNTIL OTHERS USE SEA ON OWN -------
      })(USE, './sea');
    
      ;USE(function(module){
        var SEA = USE('./sea'), Gun, u;
        if(SEA.window){
          Gun = SEA.window.GUN || {chain:{}};
        } else {
          Gun = USE((u+'' == typeof MODULE?'.':'')+'./gun', 1);
        }
        SEA.GUN = Gun;
    
        function User(root){ 
          this._ = {$: this};
        }
        User.prototype = (function(){ function F(){}; F.prototype = Gun.chain; return new F() }()) // Object.create polyfill
        User.prototype.constructor = User;
    
        // let's extend the gun chain with a `user` function.
        // only one user can be logged in at a time, per gun instance.
        Gun.chain.user = function(pub){
          var gun = this, root = gun.back(-1), user;
          if(pub){
            pub = SEA.opt.pub((pub._||'')['#']) || pub;
            return root.get('~'+pub);
          }
          if(user = root.back('user')){ return user }
          var root = (root._), at = root, uuid = at.opt.uuid || lex;
          (at = (user = at.user = gun.chain(new User))._).opt = {};
          at.opt.uuid = function(cb){
            var id = uuid(), pub = root.user;
            if(!pub || !(pub = pub.is) || !(pub = pub.pub)){ return id }
            id = '~' + pub + '/' + id;
            if(cb && cb.call){ cb(null, id) }
            return id;
          }
          return user;
        }
        function lex(){ return Gun.state().toString(36).replace('.','') }
        Gun.User = User;
        User.GUN = Gun;
        User.SEA = Gun.SEA = SEA;
        module.exports = User;
      })(USE, './user');
    
      ;USE(function(module){
        var u, Gun = (''+u != typeof window)? (window.Gun||{chain:{}}) : USE((''+u === typeof MODULE?'.':'')+'./gun', 1);
        Gun.chain.then = function(cb, opt){
          var gun = this, p = (new Promise(function(res, rej){
            gun.once(res, opt);
          }));
          return cb? p.then(cb) : p;
        }
      })(USE, './then');
    
      ;USE(function(module){
        var User = USE('./user'), SEA = User.SEA, Gun = User.GUN, noop = function(){};
    
        // Well first we have to actually create a user. That is what this function does.
        User.prototype.create = function(...args){
          var pair = typeof args[0] === 'object' && (args[0].pub || args[0].epub) ? args[0] : typeof args[1] === 'object' && (args[1].pub || args[1].epub) ? args[1] : null;
          var alias = pair && (pair.pub || pair.epub) ? pair.pub : typeof args[0] === 'string' ? args[0] : null;
          var pass = pair && (pair.pub || pair.epub) ? pair : alias && typeof args[1] === 'string' ? args[1] : null;
          var cb = args.filter(arg => typeof arg === 'function')[0] || null; // cb now can stand anywhere, after alias/pass or pair
          var opt = args && args.length > 1 && typeof args[args.length-1] === 'object' ? args[args.length-1] : {}; // opt is always the last parameter which typeof === 'object' and stands after cb
          
          var gun = this, cat = (gun._), root = gun.back(-1);
          cb = cb || noop;
          opt = opt || {};
          if(false !== opt.check){
            var err;
            if(!alias){ err = "No user." }
            if((pass||'').length < 8){ err = "Password too short!" }
            if(err){
              cb({err: Gun.log(err)});
              return gun;
            }
          }
          if(cat.ing){
            (cb || noop)({err: Gun.log("User is already being created or authenticated!"), wait: true});
            return gun;
          }
          cat.ing = true;
          var act = {}, u;
          act.a = function(pubs){
            act.pubs = pubs;
            if(pubs && !opt.already){
              // If we can enforce that a user name is already taken, it might be nice to try, but this is not guaranteed.
              var ack = {err: Gun.log('User already created!')};
              cat.ing = false;
              (cb || noop)(ack);
              gun.leave();
              return;
            }
            act.salt = String.random(64); // pseudo-randomly create a salt, then use PBKDF2 function to extend the password with it.
            SEA.work(pass, act.salt, act.b); // this will take some short amount of time to produce a proof, which slows brute force attacks.
          }
          act.b = function(proof){
            act.proof = proof;
            pair ? act.c(pair) : SEA.pair(act.c) // generate a brand new key pair or use the existing.
          }
          act.c = function(pair){
            var tmp
            act.pair = pair || {};
            if(tmp = cat.root.user){
              tmp._.sea = pair;
              tmp.is = {pub: pair.pub, epub: pair.epub, alias: alias};
            }
            // the user's public key doesn't need to be signed. But everything else needs to be signed with it! // we have now automated it! clean up these extra steps now!
            act.data = {pub: pair.pub};
            act.d();
          }
          act.d = function(){
            act.data.alias = alias;
            act.e();
          }
          act.e = function(){
            act.data.epub = act.pair.epub; 
            SEA.encrypt({priv: act.pair.priv, epriv: act.pair.epriv}, act.proof, act.f, {raw:1}); // to keep the private key safe, we AES encrypt it with the proof of work!
          }
          act.f = function(auth){
            act.data.auth = JSON.stringify({ek: auth, s: act.salt}); 
            act.g(act.data.auth);
          }
          act.g = function(auth){ var tmp;
            act.data.auth = act.data.auth || auth;
            root.get(tmp = '~'+act.pair.pub).put(act.data).on(act.h); // awesome, now we can actually save the user with their public key as their ID.
            var link = {}; link[tmp] = {'#': tmp}; root.get('~@'+alias).put(link).get(tmp).on(act.i); // next up, we want to associate the alias with the public key. So we add it to the alias list.
          }
          act.h = function(data, key, msg, eve){
            eve.off(); act.h.ok = 1; act.i();
          }
          act.i = function(data, key, msg, eve){
            if(eve){ act.i.ok = 1; eve.off() }
            if(!act.h.ok || !act.i.ok){ return }
            cat.ing = false;
            cb({ok: 0, pub: act.pair.pub}); // callback that the user has been created. (Note: ok = 0 because we didn't wait for disk to ack)
            if(noop === cb){ pair ? gun.auth(pair) : gun.auth(alias, pass) } // if no callback is passed, auto-login after signing up.
          }
          root.get('~@'+alias).once(act.a);
          return gun;
        }
        User.prototype.leave = function(opt, cb){
          var gun = this, user = (gun.back(-1)._).user;
          if(user){
            delete user.is;
            delete user._.is;
            delete user._.sea;
          }
          if(SEA.window){
            try{var sS = {};
            sS = window.sessionStorage;
            delete sS.recall;
            delete sS.pair;
            }catch(e){};
          }
          return gun;
        }
      })(USE, './create');
    
      ;USE(function(module){
        var User = USE('./user'), SEA = User.SEA, Gun = User.GUN, noop = function(){};
        // now that we have created a user, we want to authenticate them!
        User.prototype.auth = function(...args){ // TODO: this PR with arguments need to be cleaned up / refactored.
          var pair = typeof args[0] === 'object' && (args[0].pub || args[0].epub) ? args[0] : typeof args[1] === 'object' && (args[1].pub || args[1].epub) ? args[1] : null;
          var alias = !pair && typeof args[0] === 'string' ? args[0] : null;
          var pass = (alias || (pair && !(pair.priv && pair.epriv))) && typeof args[1] === 'string' ? args[1] : null;
          var cb = args.filter(arg => typeof arg === 'function')[0] || null; // cb now can stand anywhere, after alias/pass or pair
          var opt = args && args.length > 1 && typeof args[args.length-1] === 'object' ? args[args.length-1] : {}; // opt is always the last parameter which typeof === 'object' and stands after cb
          
          var gun = this, cat = (gun._), root = gun.back(-1);
          
          if(cat.ing){
            (cb || noop)({err: Gun.log("User is already being created or authenticated!"), wait: true});
            return gun;
          }
          cat.ing = true;
          
          var act = {}, u;
          act.a = function(data){
            if(!data){ return act.b() }
            if(!data.pub){
              var tmp = []; Object.keys(data).forEach(function(k){ if('_'==k){ return } tmp.push(data[k]) })
              return act.b(tmp);
            }
            if(act.name){ return act.f(data) }
            act.c((act.data = data).auth);
          }
          act.b = function(list){
            var get = (act.list = (act.list||[]).concat(list||[])).shift();
            if(u === get){
              if(act.name){ return act.err('Your user account is not published for dApps to access, please consider syncing it online, or allowing local access by adding your device as a peer.') }
              return act.err('Wrong user or password.') 
            }
            root.get(get).once(act.a);
          }
          act.c = function(auth){
            if(u === auth){ return act.b() }
            if('string' == typeof auth){ return act.c(obj_ify(auth)) } // in case of legacy
            SEA.work(pass, (act.auth = auth).s, act.d, act.enc); // the proof of work is evidence that we've spent some time/effort trying to log in, this slows brute force.
          }
          act.d = function(proof){
            SEA.decrypt(act.auth.ek, proof, act.e, act.enc);
          }
          act.e = function(half){
            if(u === half){
              if(!act.enc){ // try old format
                act.enc = {encode: 'utf8'};
                return act.c(act.auth);
              } act.enc = null; // end backwards
              return act.b();
            }
            act.half = half;
            act.f(act.data);
          }
          act.f = function(pair){
            var half = act.half || {}, data = act.data || {};
            act.g(act.lol = {pub: pair.pub || data.pub, epub: pair.epub || data.epub, priv: pair.priv || half.priv, epriv: pair.epriv || half.epriv});
          }
          act.g = function(pair){
            if(!pair || !pair.pub || !pair.epub){ return act.b() }
            act.pair = pair;
            var user = (root._).user, at = (user._);
            var tmp = at.tag;
            var upt = at.opt;
            at = user._ = root.get('~'+pair.pub)._;
            at.opt = upt;
            // add our credentials in-memory only to our root user instance
            user.is = {pub: pair.pub, epub: pair.epub, alias: alias || pair.pub};
            at.sea = act.pair;
            cat.ing = false;
            try{if(pass && u == (obj_ify(cat.root.graph['~'+pair.pub].auth)||'')[':']){ opt.shuffle = opt.change = pass; } }catch(e){} // migrate UTF8 & Shuffle!
            opt.change? act.z() : (cb || noop)(at);
            if(SEA.window && ((gun.back('user')._).opt||opt).remember){
              // TODO: this needs to be modular.
              try{var sS = {};
              sS = window.sessionStorage; // TODO: FIX BUG putting on `.is`!
              sS.recall = true;
              sS.pair = JSON.stringify(pair); // auth using pair is more reliable than alias/pass
              }catch(e){}
            }
            try{
              if(root._.tag.auth){ // auth handle might not be registered yet
              (root._).on('auth', at) // TODO: Deprecate this, emit on user instead! Update docs when you do.
              } else { setTimeout(function(){ (root._).on('auth', at) },1) } // if not, hackily add a timeout.
              //at.on('auth', at) // Arrgh, this doesn't work without event "merge" code, but "merge" code causes stack overflow and crashes after logging in & trying to write data.
            }catch(e){
              Gun.log("Your 'auth' callback crashed with:", e);
            }
          }
          act.h = function(data){
            if(!data){ return act.b() }
            alias = data.alias
            if(!alias)
              alias = data.alias = "~" + pair.pub        
            if(!data.auth){
              return act.g(pair);
            }
            pair = null;
            act.c((act.data = data).auth);
          }
          act.z = function(){
            // password update so encrypt private key using new pwd + salt
            act.salt = String.random(64); // pseudo-random
            SEA.work(opt.change, act.salt, act.y);
          }
          act.y = function(proof){
            SEA.encrypt({priv: act.pair.priv, epriv: act.pair.epriv}, proof, act.x, {raw:1});
          }
          act.x = function(auth){
            act.w(JSON.stringify({ek: auth, s: act.salt}));
          }
          act.w = function(auth){
            if(opt.shuffle){ // delete in future!
              console.log('migrate core account from UTF8 & shuffle');
              var tmp = {}; Object.keys(act.data).forEach(function(k){ tmp[k] = act.data[k] });
              delete tmp._;
              tmp.auth = auth;
              root.get('~'+act.pair.pub).put(tmp);
            } // end delete
            root.get('~'+act.pair.pub).get('auth').put(auth, cb || noop);
          }
          act.err = function(e){
            var ack = {err: Gun.log(e || 'User cannot be found!')};
            cat.ing = false;
            (cb || noop)(ack);
          }
          act.plugin = function(name){
            if(!(act.name = name)){ return act.err() }
            var tmp = [name];
            if('~' !== name[0]){
              tmp[1] = '~'+name;
              tmp[2] = '~@'+name;
            }
            act.b(tmp);
          }
          if(pair){
            if(pair.priv && pair.epriv)
              act.g(pair);
            else
              root.get('~'+pair.pub).once(act.h);
          } else
          if(alias){
            root.get('~@'+alias).once(act.a);
          } else
          if(!alias && !pass){
            SEA.name(act.plugin);
          }
          return gun;
        }
        function obj_ify(o){
          if('string' != typeof o){ return o }
          try{o = JSON.parse(o);
          }catch(e){o={}};
          return o;
        }
      })(USE, './auth');
    
      ;USE(function(module){
        var User = USE('./user'), SEA = User.SEA, Gun = User.GUN;
        User.prototype.recall = function(opt, cb){
          var gun = this, root = gun.back(-1), tmp;
          opt = opt || {};
          if(opt && opt.sessionStorage){
            if(SEA.window){
              try{
                var sS = {};
                sS = window.sessionStorage; // TODO: FIX BUG putting on `.is`!
                if(sS){
                  (root._).opt.remember = true;
                  ((gun.back('user')._).opt||opt).remember = true;
                  if(sS.recall || sS.pair) root.user().auth(JSON.parse(sS.pair), cb); // pair is more reliable than alias/pass
                }
              }catch(e){}
            }
            return gun;
          }
          /*
            TODO: copy mhelander's expiry code back in.
            Although, we should check with community,
            should expiry be core or a plugin?
          */
          return gun;
        }
      })(USE, './recall');
    
      ;USE(function(module){
        var User = USE('./user'), SEA = User.SEA, Gun = User.GUN, noop = function(){};
        User.prototype.pair = function(){
          var user = this, proxy; // undeprecated, hiding with proxies.
          try{ proxy = new Proxy({DANGER:'\u2620'}, {get: function(t,p,r){
            if(!user.is || !(user._||'').sea){ return }
            return user._.sea[p];
          }})}catch(e){}
          return proxy;
        }
        // If authenticated user wants to delete his/her account, let's support it!
        User.prototype.delete = async function(alias, pass, cb){
          console.log("user.delete() IS DEPRECATED AND WILL BE MOVED TO A MODULE!!!");
          var gun = this, root = gun.back(-1), user = gun.back('user');
          try {
            user.auth(alias, pass, function(ack){
              var pub = (user.is||{}).pub;
              // Delete user data
              user.map().once(function(){ this.put(null) });
              // Wipe user data from memory
              user.leave();
              (cb || noop)({ok: 0});
            });
          } catch (e) {
            Gun.log('User.delete failed! Error:', e);
          }
          return gun;
        }
        User.prototype.alive = async function(){
          console.log("user.alive() IS DEPRECATED!!!");
          const gunRoot = this.back(-1)
          try {
            // All is good. Should we do something more with actual recalled data?
            await authRecall(gunRoot)
            return gunRoot._.user._
          } catch (e) {
            const err = 'No session!'
            Gun.log(err)
            throw { err }
          }
        }
        User.prototype.trust = async function(user){
          console.log("`.trust` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
          // TODO: BUG!!! SEA `node` read listener needs to be async, which means core needs to be async too.
          //gun.get('alice').get('age').trust(bob);
          if (Gun.is(user)) {
            user.get('pub').get((ctx, ev) => {
              console.log(ctx, ev)
            })
          }
          user.get('trust').get(path).put(theirPubkey);
    
          // do a lookup on this gun chain directly (that gets bob's copy of the data)
          // do a lookup on the metadata trust table for this path (that gets all the pubkeys allowed to write on this path)
          // do a lookup on each of those pubKeys ON the path (to get the collab data "layers")
          // THEN you perform Jachen's mix operation
          // and return the result of that to...
        }
        User.prototype.grant = function(to, cb){
          console.log("`.grant` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
          var gun = this, user = gun.back(-1).user(), pair = user._.sea, path = '';
          gun.back(function(at){ if(at.is){ return } path += (at.get||'') });
          (async function(){
          var enc, sec = await user.get('grant').get(pair.pub).get(path).then();
          sec = await SEA.decrypt(sec, pair);
          if(!sec){
            sec = SEA.random(16).toString();
            enc = await SEA.encrypt(sec, pair);
            user.get('grant').get(pair.pub).get(path).put(enc);
          }
          var pub = to.get('pub').then();
          var epub = to.get('epub').then();
          pub = await pub; epub = await epub;
          var dh = await SEA.secret(epub, pair);
          enc = await SEA.encrypt(sec, dh);
          user.get('grant').get(pub).get(path).put(enc, cb);
          }());
          return gun;
        }
        User.prototype.secret = function(data, cb){
          console.log("`.secret` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
          var gun = this, user = gun.back(-1).user(), pair = user.pair(), path = '';
          gun.back(function(at){ if(at.is){ return } path += (at.get||'') });
          (async function(){
          var enc, sec = await user.get('trust').get(pair.pub).get(path).then();
          sec = await SEA.decrypt(sec, pair);
          if(!sec){
            sec = SEA.random(16).toString();
            enc = await SEA.encrypt(sec, pair);
            user.get('trust').get(pair.pub).get(path).put(enc);
          }
          enc = await SEA.encrypt(data, sec);
          gun.put(enc, cb);
          }());
          return gun;
        }
    
        /**
         * returns the decrypted value, encrypted by secret
         * @returns {Promise<any>}
         // Mark needs to review 1st before officially supported
        User.prototype.decrypt = function(cb) {
          let gun = this,
            path = ''
          gun.back(function(at) {
            if (at.is) {
              return
            }
            path += at.get || ''
          })
          return gun
            .then(async data => {
              if (data == null) {
                return
              }
              const user = gun.back(-1).user()
              const pair = user.pair()
              let sec = await user
                .get('trust')
                .get(pair.pub)
                .get(path)
              sec = await SEA.decrypt(sec, pair)
              if (!sec) {
                return data
              }
              let decrypted = await SEA.decrypt(data, sec)
              return decrypted
            })
            .then(res => {
              cb && cb(res)
              return res
            })
        }
        */
        module.exports = User
      })(USE, './share');
    
      ;USE(function(module){
        var SEA = USE('./sea'), S = USE('./settings'), noop = function() {}, u;
        var Gun = (''+u != typeof window)? (window.Gun||{on:noop}) : USE((''+u === typeof MODULE?'.':'')+'./gun', 1);
        // After we have a GUN extension to make user registration/login easy, we then need to handle everything else.
    
        // We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
        Gun.on('opt', function(at){
          if(!at.sea){ // only add SEA once per instance, on the "at" context.
            at.sea = {own: {}};
            at.on('put', check, at); // SEA now runs its firewall on HAM diffs, not all i/o.
          }
          this.to.next(at); // make sure to call the "next" middleware adapter.
        });
    
        // Alright, this next adapter gets run at the per node level in the graph database.
        // correction: 2020 it gets run on each key/value pair in a node upon a HAM diff.
        // This will let us verify that every property on a node has a value signed by a public key we trust.
        // If the signature does not match, the data is just `undefined` so it doesn't get passed on.
        // If it does match, then we transform the in-memory "view" of the data into its plain value (without the signature).
        // Now NOTE! Some data is "system" data, not user data. Example: List of public keys, aliases, etc.
        // This data is self-enforced (the value can only match its ID), but that is handled in the `security` function.
        // From the self-enforced data, we can see all the edges in the graph that belong to a public key.
        // Example: ~ASDF is the ID of a node with ASDF as its public key, signed alias and salt, and
        // its encrypted private key, but it might also have other signed values on it like `profile = <ID>` edge.
        // Using that directed edge's ID, we can then track (in memory) which IDs belong to which keys.
        // Here is a problem: Multiple public keys can "claim" any node's ID, so this is dangerous!
        // This means we should ONLY trust our "friends" (our key ring) public keys, not any ones.
        // I have not yet added that to SEA yet in this alpha release. That is coming soon, but beware in the meanwhile!
    
        function check(msg){ // REVISE / IMPROVE, NO NEED TO PASS MSG/EVE EACH SUB?
          var eve = this, at = eve.as, put = msg.put, soul = put['#'], key = put['.'], val = put[':'], state = put['>'], id = msg['#'], tmp;
          if(!soul || !key){ return }
          if((msg._||'').faith && (at.opt||'').faith && 'function' == typeof msg._){
            SEA.opt.pack(put, function(raw){
            SEA.verify(raw, false, function(data){ // this is synchronous if false
              put['='] = SEA.opt.unpack(data);
              eve.to.next(msg);
            })})
            return 
          }
          var no = function(why){ at.on('in', {'@': id, err: msg.err = why}) }; // exploit internal relay stun for now, maybe violates spec, but testing for now. // Note: this may be only the sharded message, not original batch.
          //var no = function(why){ msg.ack(why) };
          (msg._||'').DBG && ((msg._||'').DBG.c = +new Date);
          if(0 <= soul.indexOf('<?')){ // special case for "do not sync data X old" forget
            // 'a~pub.key/b<?9'
            tmp = parseFloat(soul.split('<?')[1]||'');
            if(tmp && (state < (Gun.state() - (tmp * 1000)))){ // sec to ms
              (tmp = msg._) && (tmp.stun) && (tmp.stun--); // THIS IS BAD CODE! It assumes GUN internals do something that will probably change in future, but hacking in now.
              return; // omit!
            }
          }
          
          if('~@' === soul){  // special case for shared system data, the list of aliases.
            check.alias(eve, msg, val, key, soul, at, no); return;
          }
          if('~@' === soul.slice(0,2)){ // special case for shared system data, the list of public keys for an alias.
            check.pubs(eve, msg, val, key, soul, at, no); return;
          }
          //if('~' === soul.slice(0,1) && 2 === (tmp = soul.slice(1)).split('.').length){ // special case, account data for a public key.
          if(tmp = SEA.opt.pub(soul)){ // special case, account data for a public key.
            check.pub(eve, msg, val, key, soul, at, no, at.user||'', tmp); return;
          }
          if(0 <= soul.indexOf('#')){ // special case for content addressing immutable hashed data.
            check.hash(eve, msg, val, key, soul, at, no); return;
          } 
          check.any(eve, msg, val, key, soul, at, no, at.user||''); return;
          eve.to.next(msg); // not handled
        }
        check.hash = function(eve, msg, val, key, soul, at, no){
          SEA.work(val, null, function(data){
            if(data && data === key.split('#').slice(-1)[0]){ return eve.to.next(msg) }
            no("Data hash not same as hash!");
          }, {name: 'SHA-256'});
        }
        check.alias = function(eve, msg, val, key, soul, at, no){ // Example: {_:#~@, ~@alice: {#~@alice}}
          if(!val){ return no("Data must exist!") } // data MUST exist
          if('~@'+key === link_is(val)){ return eve.to.next(msg) } // in fact, it must be EXACTLY equal to itself
          no("Alias not same!"); // if it isn't, reject.
        };
        check.pubs = function(eve, msg, val, key, soul, at, no){ // Example: {_:#~@alice, ~asdf: {#~asdf}}
          if(!val){ return no("Alias must exist!") } // data MUST exist
          if(key === link_is(val)){ return eve.to.next(msg) } // and the ID must be EXACTLY equal to its property
          no("Alias not same!"); // that way nobody can tamper with the list of public keys.
        };
        check.pub = async function(eve, msg, val, key, soul, at, no, user, pub){ var tmp // Example: {_:#~asdf, hello:'world'~fdsa}}
          const raw = await S.parse(val) || {}
          const verify = (certificate, certificant, cb) => {
            if (certificate.m && certificate.s && certificant && pub)
              // now verify certificate
              return SEA.verify(certificate, pub, data => { // check if "pub" (of the graph owner) really issued this cert
                if (u !== data && u !== data.e && msg.put['>'] && msg.put['>'] > parseFloat(data.e)) return no("Certificate expired.") // certificate expired
                // "data.c" = a list of certificants/certified users
                // "data.w" = lex WRITE permission, in the future, there will be "data.r" which means lex READ permission
                if (u !== data && data.c && data.w && (data.c === certificant || data.c.indexOf('*' || certificant) > -1)) {
                  // ok, now "certificant" is in the "certificants" list, but is "path" allowed? Check path
                  let path = soul.indexOf('/') > -1 ? soul.replace(soul.substring(0, soul.indexOf('/') + 1), '') : ''
                  String.match = String.match || Gun.text.match
                  const w = Array.isArray(data.w) ? data.w : typeof data.w === 'object' || typeof data.w === 'string' ? [data.w] : []
                  for (const lex of w) {
                    if ((String.match(path, lex['#']) && String.match(key, lex['.'])) || (!lex['.'] && String.match(path, lex['#'])) || (!lex['#'] && String.match(key, lex['.'])) || String.match((path ? path + '/' + key : key), lex['#'] || lex)) {
                      // is Certificant forced to present in Path
                      if (lex['+'] && lex['+'].indexOf('*') > -1 && path && path.indexOf(certificant) == -1 && key.indexOf(certificant) == -1) return no(`Path "${path}" or key "${key}" must contain string "${certificant}".`)
                      // path is allowed, but is there any WRITE block? Check it out
                      if (data.wb && (typeof data.wb === 'string' || ((data.wb || {})['#']))) { // "data.wb" = path to the WRITE block
                        var root = eve.as.root.$.back(-1)
                        if (typeof data.wb === 'string' && '~' !== data.wb.slice(0, 1)) root = root.get('~' + pub)
                        return root.get(data.wb).get(certificant).once(value => { // TODO: INTENT TO DEPRECATE.
                          if (value && (value === 1 || value === true)) return no(`Certificant ${certificant} blocked.`)
                          return cb(data)
                        })
                      }
                      return cb(data)
                    }
                  }
                  return no("Certificate verification fail.")
                }
              })
            return
          }
          
          if ('pub' === key && '~' + pub === soul) {
            if (val === pub) return eve.to.next(msg) // the account MUST match `pub` property that equals the ID of the public key.
            return no("Account not same!")
          }
    
          if ((tmp = user.is) && tmp.pub && !raw['*'] && !raw['+'] && (pub === tmp.pub || (pub !== tmp.pub && ((msg._.msg || {}).opt || {}).cert))){
            SEA.opt.pack(msg.put, packed => {
              SEA.sign(packed, (user._).sea, async function(data) {
                if (u === data) return no(SEA.err || 'Signature fail.')
                msg.put[':'] = {':': tmp = SEA.opt.unpack(data.m), '~': data.s}
                msg.put['='] = tmp
      
                // if writing to own graph, just allow it
                if (pub === user.is.pub) {
                  if (tmp = link_is(val)) (at.sea.own[tmp] = at.sea.own[tmp] || {})[pub] = 1
                  JSON.stringifyAsync(msg.put[':'], function(err,s){
                    if(err){ return no(err || "Stringify error.") }
                    msg.put[':'] = s;
                    return eve.to.next(msg);
                  })
                  return
                }
      
                // if writing to other's graph, check if cert exists then try to inject cert into put, also inject self pub so that everyone can verify the put
                if (pub !== user.is.pub && ((msg._.msg || {}).opt || {}).cert) {
                  const cert = await S.parse(msg._.msg.opt.cert)
                  // even if cert exists, we must verify it
                  if (cert && cert.m && cert.s)
                    verify(cert, user.is.pub, _ => {
                      msg.put[':']['+'] = cert // '+' is a certificate
                      msg.put[':']['*'] = user.is.pub // '*' is pub of the user who puts
                      JSON.stringifyAsync(msg.put[':'], function(err,s){
                        if(err){ return no(err || "Stringify error.") }
                        msg.put[':'] = s;
                        return eve.to.next(msg);
                      })
                      return
                    })
                }
              }, {raw: 1})
            })
            return;
          }
    
          SEA.opt.pack(msg.put, packed => {
            SEA.verify(packed, raw['*'] || pub, function(data){ var tmp;
              data = SEA.opt.unpack(data);
              if (u === data) return no("Unverified data.") // make sure the signature matches the account it claims to be on. // reject any updates that are signed with a mismatched account.
              if ((tmp = link_is(data)) && pub === SEA.opt.pub(tmp)) (at.sea.own[tmp] = at.sea.own[tmp] || {})[pub] = 1
              
              // check if cert ('+') and putter's pub ('*') exist
              if (raw['+'] && raw['+']['m'] && raw['+']['s'] && raw['*'])
                // now verify certificate
                verify(raw['+'], raw['*'], _ => {
                  msg.put['='] = data;
                  return eve.to.next(msg);
                })
              else {
                msg.put['='] = data;
                return eve.to.next(msg);
              }
            });
          })
          return
        };
        check.any = function(eve, msg, val, key, soul, at, no, user){ var tmp, pub;
          if(at.opt.secure){ return no("Soul missing public key at '" + key + "'.") }
          // TODO: Ask community if should auto-sign non user-graph data.
          at.on('secure', function(msg){ this.off();
            if(!at.opt.secure){ return eve.to.next(msg) }
            no("Data cannot be changed.");
          }).on.on('secure', msg);
          return;
        }
    
        var valid = Gun.valid, link_is = function(d,l){ return 'string' == typeof (l = valid(d)) && l }, state_ify = (Gun.state||'').ify;
    
        var pubcut = /[^\w_-]/; // anything not alphanumeric or _ -
        SEA.opt.pub = function(s){
          if(!s){ return }
          s = s.split('~');
          if(!s || !(s = s[1])){ return }
          s = s.split(pubcut).slice(0,2);
          if(!s || 2 != s.length){ return }
          if('@' === (s[0]||'')[0]){ return }
          s = s.slice(0,2).join('.');
          return s;
        }
        SEA.opt.stringy = function(t){
          // TODO: encrypt etc. need to check string primitive. Make as breaking change.
        }
        SEA.opt.pack = function(d,cb,k, n,s){ var tmp, f; // pack for verifying
          if(SEA.opt.check(d)){ return cb(d) }
          if(d && d['#'] && d['.'] && d['>']){ tmp = d[':']; f = 1 }
          JSON.parseAsync(f? tmp : d, function(err, meta){
            var sig = ((u !== (meta||'')[':']) && (meta||'')['~']); // or just ~ check?
            if(!sig){ cb(d); return }
            cb({m: {'#':s||d['#'],'.':k||d['.'],':':(meta||'')[':'],'>':d['>']||Gun.state.is(n, k)}, s: sig});
          });
        }
        var O = SEA.opt;
        SEA.opt.unpack = function(d, k, n){ var tmp;
          if(u === d){ return }
          if(d && (u !== (tmp = d[':']))){ return tmp }
          k = k || O.fall_key; if(!n && O.fall_val){ n = {}; n[k] = O.fall_val }
          if(!k || !n){ return }
          if(d === n[k]){ return d }
          if(!SEA.opt.check(n[k])){ return d }
          var soul = (n && n._ && n._['#']) || O.fall_soul, s = Gun.state.is(n, k) || O.fall_state;
          if(d && 4 === d.length && soul === d[0] && k === d[1] && fl(s) === fl(d[3])){
            return d[2];
          }
          if(s < SEA.opt.shuffle_attack){
            return d;
          }
        }
        SEA.opt.shuffle_attack = 1546329600000; // Jan 1, 2019
        var fl = Math.floor; // TODO: Still need to fix inconsistent state issue.
        // TODO: Potential bug? If pub/priv key starts with `-`? IDK how possible.
    
      })(USE, './index');
    }());
    
    },{}],9:[function(require,module,exports){
    
    // request / response module, for asking and acking messages.
    require('./onto'); // depends upon onto!
    module.exports = function ask(cb, as){
        if(!this.on){ return }
        var lack = (this.opt||{}).lack || 9000;
        if(!('function' == typeof cb)){
            if(!cb){ return }
            var id = cb['#'] || cb, tmp = (this.tag||'')[id];
            if(!tmp){ return }
            if(as){
                tmp = this.on(id, as);
                clearTimeout(tmp.err);
                tmp.err = setTimeout(function(){ tmp.off() }, lack);
            }
            return true;
        }
        var id = (as && as['#']) || random(9);
        if(!cb){ return id }
        var to = this.on(id, cb, as);
        to.err = to.err || setTimeout(function(){ to.off();
            to.next({err: "Error: No ACK yet.", lack: true});
        }, lack);
        return id;
    }
    var random = String.random || function(){ return Math.random().toString(36).slice(2) }
        
    },{"./onto":19}],10:[function(require,module,exports){
    
    var Gun = require('./root');
    Gun.chain.back = function(n, opt){ var tmp;
        n = n || 1;
        if(-1 === n || Infinity === n){
            return this._.root.$;
        } else
        if(1 === n){
            return (this._.back || this._).$;
        }
        var gun = this, at = gun._;
        if(typeof n === 'string'){
            n = n.split('.');
        }
        if(n instanceof Array){
            var i = 0, l = n.length, tmp = at;
            for(i; i < l; i++){
                tmp = (tmp||empty)[n[i]];
            }
            if(u !== tmp){
                return opt? gun : tmp;
            } else
            if((tmp = at.back)){
                return tmp.$.back(n, opt);
            }
            return;
        }
        if('function' == typeof n){
            var yes, tmp = {back: at};
            while((tmp = tmp.back)
            && u === (yes = n(tmp, opt))){}
            return yes;
        }
        if('number' == typeof n){
            return (at.back || at).$.back(n - 1);
        }
        return this;
    }
    var empty = {}, u;
        
    },{"./root":21}],11:[function(require,module,exports){
    
    // WARNING: GUN is very simple, but the JavaScript chaining API around GUN
    // is complicated and was extremely hard to build. If you port GUN to another
    // language, consider implementing an easier API to build.
    var Gun = require('./root');
    Gun.chain.chain = function(sub){
        var gun = this, at = gun._, chain = new (sub || gun).constructor(gun), cat = chain._, root;
        cat.root = root = at.root;
        cat.id = ++root.once;
        cat.back = gun._;
        cat.on = Gun.on;
        cat.on('in', Gun.on.in, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
        cat.on('out', Gun.on.out, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
        return chain;
    }
    
    function output(msg){
        var put, get, at = this.as, back = at.back, root = at.root, tmp;
        if(!msg.$){ msg.$ = at.$ }
        this.to.next(msg);
        if(at.err){ at.on('in', {put: at.put = u, $: at.$}); return }
        if(get = msg.get){
            /*if(u !== at.put){
                at.on('in', at);
                return;
            }*/
            if(root.pass){ root.pass[at.id] = at; } // will this make for buggy behavior elsewhere?
            if(at.lex){ Object.keys(at.lex).forEach(function(k){ tmp[k] = at.lex[k] }, tmp = msg.get = msg.get || {}) }
            if(get['#'] || at.soul){
                get['#'] = get['#'] || at.soul;
                msg['#'] || (msg['#'] = text_rand(9)); // A3120 ?
                back = (root.$.get(get['#'])._);
                if(!(get = get['.'])){ // soul
                    tmp = back.ask && back.ask['']; // check if we have already asked for the full node
                    (back.ask || (back.ask = {}))[''] = back; // add a flag that we are now.
                    if(u !== back.put){ // if we already have data,
                        back.on('in', back); // send what is cached down the chain
                        if(tmp){ return } // and don't ask for it again.
                    }
                    msg.$ = back.$;
                } else
                if(obj_has(back.put, get)){ // TODO: support #LEX !
                    tmp = back.ask && back.ask[get];
                    (back.ask || (back.ask = {}))[get] = back.$.get(get)._;
                    back.on('in', {get: get, put: {'#': back.soul, '.': get, ':': back.put[get], '>': state_is(root.graph[back.soul], get)}});
                    if(tmp){ return }
                }
                    /*put = (back.$.get(get)._);
                    if(!(tmp = put.ack)){ put.ack = -1 }
                    back.on('in', {
                        $: back.$,
                        put: Gun.state.ify({}, get, Gun.state(back.put, get), back.put[get]),
                        get: back.get
                    });
                    if(tmp){ return }
                } else
                if('string' != typeof get){
                    var put = {}, meta = (back.put||{})._;
                    Gun.obj.map(back.put, function(v,k){
                        if(!Gun.text.match(k, get)){ return }
                        put[k] = v;
                    })
                    if(!Gun.obj.empty(put)){
                        put._ = meta;
                        back.on('in', {$: back.$, put: put, get: back.get})
                    }
                    if(tmp = at.lex){
                        tmp = (tmp._) || (tmp._ = function(){});
                        if(back.ack < tmp.ask){ tmp.ask = back.ack }
                        if(tmp.ask){ return }
                        tmp.ask = 1;
                    }
                }
                */
                root.ask(ack, msg); // A3120 ?
                return root.on('in', msg);
            }
            //if(root.now){ root.now[at.id] = root.now[at.id] || true; at.pass = {} }
            if(get['.']){
                if(at.get){
                    msg = {get: {'.': at.get}, $: at.$};
                    (back.ask || (back.ask = {}))[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
                    return back.on('out', msg);
                }
                msg = {get: at.lex? msg.get : {}, $: at.$};
                return back.on('out', msg);
            }
            (at.ask || (at.ask = {}))[''] = at;	 //at.ack = at.ack || -1;
            if(at.get){
                get['.'] = at.get;
                (back.ask || (back.ask = {}))[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
                return back.on('out', msg);
            }
        }
        return back.on('out', msg);
    }; Gun.on.out = output;
    
    function input(msg, cat){ cat = cat || this.as; // TODO: V8 may not be able to optimize functions with different parameter calls, so try to do benchmark to see if there is any actual difference.
        var root = cat.root, gun = msg.$ || (msg.$ = cat.$), at = (gun||'')._ || empty, tmp = msg.put||'', soul = tmp['#'], key = tmp['.'], change = (u !== tmp['='])? tmp['='] : tmp[':'], state = tmp['>'] || -Infinity, sat; // eve = event, at = data at, cat = chain at, sat = sub at (children chains).
        if(u !== msg.put && (u === tmp['#'] || u === tmp['.'] || (u === tmp[':'] && u === tmp['=']) || u === tmp['>'])){ // convert from old format
            if(!valid(tmp)){
                if(!(soul = ((tmp||'')._||'')['#'])){ console.log("chain not yet supported for", tmp, '...', msg, cat); return; }
                gun = cat.root.$.get(soul);
                return setTimeout.each(Object.keys(tmp).sort(), function(k){ // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync?
                    if('_' == k || u === (state = state_is(tmp, k))){ return }
                    cat.on('in', {$: gun, put: {'#': soul, '.': k, '=': tmp[k], '>': state}, VIA: msg});
                });
            }
            cat.on('in', {$: at.back.$, put: {'#': soul = at.back.soul, '.': key = at.has || at.get, '=': tmp, '>': state_is(at.back.put, key)}, via: msg}); // TODO: This could be buggy! It assumes/approxes data, other stuff could have corrupted it.
            return;
        }
        if((msg.seen||'')[cat.id]){ return } (msg.seen || (msg.seen = function(){}))[cat.id] = cat; // help stop some infinite loops
    
        if(cat !== at){ // don't worry about this when first understanding the code, it handles changing contexts on a message. A soul chain will never have a different context.
            Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] }, tmp = {}); // make copy of message
            tmp.get = cat.get || tmp.get;
            if(!cat.soul && !cat.has){ // if we do not recognize the chain type
                tmp.$$$ = tmp.$$$ || cat.$; // make a reference to wherever it came from.
            } else
            if(at.soul){ // a has (property) chain will have a different context sometimes if it is linked (to a soul chain). Anything that is not a soul or has chain, will always have different contexts.
                tmp.$ = cat.$;
                tmp.$$ = tmp.$$ || at.$;
            }
            msg = tmp; // use the message with the new context instead;
        }
        unlink(msg, cat);
    
        if(((cat.soul/* && (cat.ask||'')['']*/) || msg.$$) && state >= state_is(root.graph[soul], key)){ // The root has an in-memory cache of the graph, but if our peer has asked for the data then we want a per deduplicated chain copy of the data that might have local edits on it.
            (tmp = root.$.get(soul)._).put = state_ify(tmp.put, key, state, change, soul);
        }
        if(!at.soul /*&& (at.ask||'')['']*/ && state >= state_is(root.graph[soul], key) && (sat = (root.$.get(soul)._.next||'')[key])){ // Same as above here, but for other types of chains. // TODO: Improve perf by preventing echoes recaching.
            sat.put = change; // update cache
            if('string' == typeof (tmp = valid(change))){
                sat.put = root.$.get(tmp)._.put || change; // share same cache as what we're linked to.
            }
        }
    
        this.to && this.to.next(msg); // 1st API job is to call all chain listeners.
        // TODO: Make input more reusable by only doing these (some?) calls if we are a chain we recognize? This means each input listener would be responsible for when listeners need to be called, which makes sense, as they might want to filter.
        cat.any && setTimeout.each(Object.keys(cat.any), function(any){ (any = cat.any[any]) && any(msg) },0,99); // 1st API job is to call all chain listeners. // TODO: .keys( is slow // BUG: Some re-in logic may depend on this being sync.
        cat.echo && setTimeout.each(Object.keys(cat.echo), function(lat){ (lat = cat.echo[lat]) && lat.on('in', msg) },0,99); // & linked at chains // TODO: .keys( is slow // BUG: Some re-in logic may depend on this being sync.
    
        if(((msg.$$||'')._||at).soul){ // comments are linear, but this line of code is non-linear, so if I were to comment what it does, you'd have to read 42 other comments first... but you can't read any of those comments until you first read this comment. What!? // shouldn't this match link's check?
            // is there cases where it is a $$ that we do NOT want to do the following? 
            if((sat = cat.next) && (sat = sat[key])){ // TODO: possible trick? Maybe have `ionmap` code set a sat? // TODO: Maybe we should do `cat.ask` instead? I guess does not matter.
                tmp = {}; Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] });
                tmp.$ = (msg.$$||msg.$).get(tmp.get = key); delete tmp.$$; delete tmp.$$$;
                sat.on('in', tmp);
            }
        }
    
        link(msg, cat);
    }; Gun.on.in = input;
    
    function link(msg, cat){ cat = cat || this.as || msg.$._;
        if(msg.$$ && this !== Gun.on){ return } // $$ means we came from a link, so we are at the wrong level, thus ignore it unless overruled manually by being called directly.
        if(!msg.put || cat.soul){ return } // But you cannot overrule being linked to nothing, or trying to link a soul chain - that must never happen.
        var put = msg.put||'', link = put['=']||put[':'], tmp;
        var root = cat.root, tat = root.$.get(put['#']).get(put['.'])._;
        if('string' != typeof (link = valid(link))){
            if(this === Gun.on){ (tat.echo || (tat.echo = {}))[cat.id] = cat } // allow some chain to explicitly force linking to simple data.
            return; // by default do not link to data that is not a link.
        }
        if((tat.echo || (tat.echo = {}))[cat.id] // we've already linked ourselves so we do not need to do it again. Except... (annoying implementation details)
            && !(root.pass||'')[cat.id]){ return } // if a new event listener was added, we need to make a pass through for it. The pass will be on the chain, not always the chain passed down. 
        if(tmp = root.pass){ if(tmp[link+cat.id]){ return } tmp[link+cat.id] = 1 } // But the above edge case may "pass through" on a circular graph causing infinite passes, so we hackily add a temporary check for that.
    
        (tat.echo||(tat.echo={}))[cat.id] = cat; // set ourself up for the echo! // TODO: BUG? Echo to self no longer causes problems? Confirm.
    
        if(cat.has){ cat.link = link }
        var sat = root.$.get(tat.link = link)._; // grab what we're linking to.
        (sat.echo || (sat.echo = {}))[tat.id] = tat; // link it.
        var tmp = cat.ask||''; // ask the chain for what needs to be loaded next!
        if(tmp[''] || cat.lex){ // we might need to load the whole thing // TODO: cat.lex probably has edge case bugs to it, need more test coverage.
            sat.on('out', {get: {'#': link}});
        }
        setTimeout.each(Object.keys(tmp), function(get, sat){ // if sub chains are asking for data. // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync?
            if(!get || !(sat = tmp[get])){ return }
            sat.on('out', {get: {'#': link, '.': get}}); // go get it.
        },0,99);
    }; Gun.on.link = link;
    
    function unlink(msg, cat){ // ugh, so much code for seemingly edge case behavior.
        var put = msg.put||'', change = (u !== put['='])? put['='] : put[':'], root = cat.root, link, tmp;
        if(u === change){ // 1st edge case: If we have a brand new database, no data will be found.
            // TODO: BUG! because emptying cache could be async from below, make sure we are not emptying a newer cache. So maybe pass an Async ID to check against?
            // TODO: BUG! What if this is a map? // Warning! Clearing things out needs to be robust against sync/async ops, or else you'll see `map val get put` test catastrophically fail because map attempts to link when parent graph is streamed before child value gets set. Need to differentiate between lack acks and force clearing.
            if(cat.soul && u !== cat.put){ return } // data may not be found on a soul, but if a soul already has data, then nothing can clear the soul as a whole.
            //if(!cat.has){ return }
            tmp = (msg.$$||msg.$||'')._||'';
            if(msg['@'] && (u !== tmp.put || u !== cat.put)){ return } // a "not found" from other peers should not clear out data if we have already found it.
            //if(cat.has && u === cat.put && !(root.pass||'')[cat.id]){ return } // if we are already unlinked, do not call again, unless edge case. // TODO: BUG! This line should be deleted for "unlink deeply nested".
            if(link = cat.link || msg.linked){
                delete (root.$.get(link)._.echo||'')[cat.id];
            }
            if(cat.has){ // TODO: Empty out links, maps, echos, acks/asks, etc.?
                cat.link = null;
            }
            cat.put = u; // empty out the cache if, for example, alice's car's color no longer exists (relative to alice) if alice no longer has a car.
            // TODO: BUG! For maps, proxy this so the individual sub is triggered, not all subs.
            setTimeout.each(Object.keys(cat.next||''), function(get, sat){ // empty out all sub chains. // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync? // TODO: BUG? This will trigger deeper put first, does put logic depend on nested order? // TODO: BUG! For map, this needs to be the isolated child, not all of them.
                if(!(sat = cat.next[get])){ return }
                //if(cat.has && u === sat.put && !(root.pass||'')[sat.id]){ return } // if we are already unlinked, do not call again, unless edge case. // TODO: BUG! This line should be deleted for "unlink deeply nested".
                if(link){ delete (root.$.get(link).get(get)._.echo||'')[sat.id] }
                sat.on('in', {get: get, put: u, $: sat.$}); // TODO: BUG? Add recursive seen check?
            },0,99);
            return;
        }
        if(cat.soul){ return } // a soul cannot unlink itself.
        if(msg.$$){ return } // a linked chain does not do the unlinking, the sub chain does. // TODO: BUG? Will this cancel maps?
        link = valid(change); // need to unlink anytime we are not the same link, though only do this once per unlink (and not on init).
        tmp = msg.$._||'';
        if(link === tmp.link || (cat.has && !tmp.link)){
            if((root.pass||'')[cat.id] && 'string' !== typeof link){
    
            } else {
                return;
            }
        }
        delete (tmp.echo||'')[cat.id];
        unlink({get: cat.get, put: u, $: msg.$, linked: msg.linked = msg.linked || tmp.link}, cat); // unlink our sub chains.
    }; Gun.on.unlink = unlink;
    
    function ack(msg, ev){
        //if(!msg['%'] && (this||'').off){ this.off() } // do NOT memory leak, turn off listeners! Now handled by .ask itself
        // manhattan:
        var as = this.as, at = as.$._, root = at.root, get = as.get||'', tmp = (msg.put||'')[get['#']]||'';
        if(!msg.put || ('string' == typeof get['.'] && u === tmp[get['.']])){
            if(u !== at.put){ return }
            if(!at.soul && !at.has){ return } // TODO: BUG? For now, only core-chains will handle not-founds, because bugs creep in if non-core chains are used as $ but we can revisit this later for more powerful extensions.
            at.ack = (at.ack || 0) + 1;
            at.on('in', {
                get: at.get,
                put: at.put = u,
                $: at.$,
                '@': msg['@']
            });
            /*(tmp = at.Q) && setTimeout.each(Object.keys(tmp), function(id){ // TODO: Temporary testing, not integrated or being used, probably delete.
                Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] }, tmp = {}); tmp['@'] = id; // copy message
                root.on('in', tmp);
            }); delete at.Q;*/
            return;
        }
        (msg._||{}).miss = 1;
        Gun.on.put(msg);
        return; // eom
    }
    
    var empty = {}, u, text_rand = String.random, valid = Gun.valid, obj_has = function(o, k){ return o && Object.prototype.hasOwnProperty.call(o, k) }, state = Gun.state, state_is = state.is, state_ify = state.ify;
        
    },{"./root":21}],12:[function(require,module,exports){
    
    require('./shim');
    function Dup(opt){
        var dup = {s:{}}, s = dup.s;
        opt = opt || {max: 999, age: 1000 * 9};//*/ 1000 * 9 * 3};
        dup.check = function(id){
            if(!s[id]){ return false }
            return dt(id);
        }
        var dt = dup.track = function(id){
            var it = s[id] || (s[id] = {});
            it.was = dup.now = +new Date;
            if(!dup.to){ dup.to = setTimeout(dup.drop, opt.age + 9) }
            return it;
        }
        dup.drop = function(age){
            dup.to = null;
            dup.now = +new Date;
            var l = Object.keys(s);
            console.STAT && console.STAT(dup.now, +new Date - dup.now, 'dup drop keys'); // prev ~20% CPU 7% RAM 300MB // now ~25% CPU 7% RAM 500MB
            setTimeout.each(l, function(id){ var it = s[id]; // TODO: .keys( is slow?
                if(it && (age || opt.age) > (dup.now - it.was)){ return }
                delete s[id];
            },0,99);
        }
        return dup;
    }
    module.exports = Dup;
        
    },{"./shim":23}],13:[function(require,module,exports){
    
    var Gun = require('./root');
    Gun.chain.get = function(key, cb, as){
        var gun, tmp;
        if(typeof key === 'string'){
            if(key.length == 0) {	
                (gun = this.chain())._.err = {err: Gun.log('0 length key!', key)};
                if(cb){ cb.call(gun, gun._.err) }
                return gun;
            }
            var back = this, cat = back._;
            var next = cat.next || empty;
            if(!(gun = next[key])){
                gun = key && cache(key, back);
            }
            gun = gun && gun.$;
        } else
        if('function' == typeof key){
            if(true === cb){ return soul(this, key, cb, as), this }
            gun = this;
            var cat = gun._, opt = cb || {}, root = cat.root, id;
            opt.at = cat;
            opt.ok = key;
            var wait = {}; // can we assign this to the at instead, like in once?
            //var path = []; cat.$.back(at => { at.get && path.push(at.get.slice(0,9))}); path = path.reverse().join('.');
            function any(msg, eve, f){
                if(any.stun){ return }
                if((tmp = root.pass) && !tmp[id]){ return }
                var at = msg.$._, sat = (msg.$$||'')._, data = (sat||at).put, odd = (!at.has && !at.soul), test = {}, link, tmp;
                if(odd || u === data){ // handles non-core
                    data = (u === ((tmp = msg.put)||'')['='])? (u === (tmp||'')[':'])? tmp : tmp[':'] : tmp['='];
                }
                if(link = ('string' == typeof (tmp = Gun.valid(data)))){
                    data = (u === (tmp = root.$.get(tmp)._.put))? opt.not? u : data : tmp;
                }
                if(opt.not && u === data){ return }
                if(u === opt.stun){
                    if((tmp = root.stun) && tmp.on){
                        cat.$.back(function(a){ // our chain stunned?
                            tmp.on(''+a.id, test = {});
                            if((test.run || 0) < any.id){ return test } // if there is an earlier stun on gapless parents/self.
                        });
                        !test.run && tmp.on(''+at.id, test = {}); // this node stunned?
                        !test.run && sat && tmp.on(''+sat.id, test = {}); // linked node stunned?
                        if(any.id > test.run){
                            if(!test.stun || test.stun.end){
                                test.stun = tmp.on('stun');
                                test.stun = test.stun && test.stun.last;
                            }
                            if(test.stun && !test.stun.end){
                                //if(odd && u === data){ return }
                                //if(u === msg.put){ return } // "not found" acks will be found if there is stun, so ignore these.
                                (test.stun.add || (test.stun.add = {}))[id] = function(){ any(msg,eve,1) } // add ourself to the stun callback list that is called at end of the write.
                                return;
                            }
                        }
                    }
                    if(/*odd &&*/ u === data){ f = 0 } // if data not found, keep waiting/trying.
                    /*if(f && u === data){
                        cat.on('out', opt.out);
                        return;
                    }*/
                    if((tmp = root.hatch) && !tmp.end && u === opt.hatch && !f){ // quick hack! // What's going on here? Because data is streamed, we get things one by one, but a lot of developers would rather get a callback after each batch instead, so this does that by creating a wait list per chain id that is then called at the end of the batch by the hatch code in the root put listener.
                        if(wait[at.$._.id]){ return } wait[at.$._.id] = 1;
                        tmp.push(function(){any(msg,eve,1)});
                        return;
                    }; wait = {}; // end quick hack.
                }
                // call:
                if(root.pass){ if(root.pass[id+at.id]){ return } root.pass[id+at.id] = 1 }
                if(opt.on){ opt.ok.call(at.$, data, at.get, msg, eve || any); return } // TODO: Also consider breaking `this` since a lot of people do `=>` these days and `.call(` has slower performance.
                if(opt.v2020){ opt.ok(msg, eve || any); return }
                Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] }, tmp = {}); msg = tmp; msg.put = data; // 2019 COMPATIBILITY! TODO: GET RID OF THIS!
                opt.ok.call(opt.as, msg, eve || any); // is this the right
            };
            any.at = cat;
            //(cat.any||(cat.any=function(msg){ setTimeout.each(Object.keys(cat.any||''), function(act){ (act = cat.any[act]) && act(msg) },0,99) }))[id = String.random(7)] = any; // maybe switch to this in future?
            (cat.any||(cat.any={}))[id = String.random(7)] = any;
            any.off = function(){ any.stun = 1; if(!cat.any){ return } delete cat.any[id] }
            any.rid = rid; // logic from old version, can we clean it up now?
            any.id = opt.run || ++root.once; // used in callback to check if we are earlier than a write. // will this ever cause an integer overflow?
            tmp = root.pass; (root.pass = {})[id] = 1; // Explanation: test trade-offs want to prevent recursion so we add/remove pass flag as it gets fulfilled to not repeat, however map map needs many pass flags - how do we reconcile?
            opt.out = opt.out || {get: {}};
            cat.on('out', opt.out);
            root.pass = tmp;
            return gun;
        } else
        if('number' == typeof key){
            return this.get(''+key, cb, as);
        } else
        if('string' == typeof (tmp = valid(key))){
            return this.get(tmp, cb, as);
        } else
        if(tmp = this.get.next){
            gun = tmp(this, key);
        }
        if(!gun){
            (gun = this.chain())._.err = {err: Gun.log('Invalid get request!', key)}; // CLEAN UP
            if(cb){ cb.call(gun, gun._.err) }
            return gun;
        }
        if(cb && 'function' == typeof cb){
            gun.get(cb, as);
        }
        return gun;
    }
    function cache(key, back){
        var cat = back._, next = cat.next, gun = back.chain(), at = gun._;
        if(!next){ next = cat.next = {} }
        next[at.get = key] = at;
        if(back === cat.root.$){
            at.soul = key;
        } else
        if(cat.soul || cat.has){
            at.has = key;
            //if(obj_has(cat.put, key)){
                //at.put = cat.put[key];
            //}
        }
        return at;
    }
    function soul(gun, cb, opt, as){
        var cat = gun._, acks = 0, tmp;
        if(tmp = cat.soul || cat.link){ return cb(tmp, as, cat) }
        if(cat.jam){ return cat.jam.push([cb, as]) }
        cat.jam = [[cb,as]];
        gun.get(function go(msg, eve){
            if(u === msg.put && !cat.root.opt.super && (tmp = Object.keys(cat.root.opt.peers).length) && ++acks <= tmp){ // TODO: super should not be in core code, bring AXE up into core instead to fix? // TODO: .keys( is slow
                return;
            }
            eve.rid(msg);
            var at = ((at = msg.$) && at._) || {}, i = 0, as;
            tmp = cat.jam; delete cat.jam; // tmp = cat.jam.splice(0, 100);
            //if(tmp.length){ process.nextTick(function(){ go(msg, eve) }) }
            while(as = tmp[i++]){ //Gun.obj.map(tmp, function(as, cb){
                var cb = as[0], id; as = as[1];
                cb && cb(id = at.link || at.soul || Gun.valid(msg.put) || ((msg.put||{})._||{})['#'], as, msg, eve);
            } //);
        }, {out: {get: {'.':true}}});
        return gun;
    }
    function rid(at){
        var cat = this.at || this.on;
        if(!at || cat.soul || cat.has){ return this.off() }
        if(!(at = (at = (at = at.$ || at)._ || at).id)){ return }
        var map = cat.map, tmp, seen;
        //if(!map || !(tmp = map[at]) || !(tmp = tmp.at)){ return }
        if(tmp = (seen = this.seen || (this.seen = {}))[at]){ return true }
        seen[at] = true;
        return;
        //tmp.echo[cat.id] = {}; // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
        //obj.del(map, at); // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
        return;
    }
    var empty = {}, valid = Gun.valid, u;
        
    },{"./root":21}],14:[function(require,module,exports){
    
    var Gun = require('./root');
    require('./chain');
    require('./back');
    require('./put');
    require('./get');
    module.exports = Gun;
        
    },{"./back":10,"./chain":11,"./get":13,"./put":20,"./root":21}],15:[function(require,module,exports){
    
    if(typeof Gun === 'undefined'){ return }
    
    var noop = function(){}, store, u;
    try{store = (Gun.window||noop).localStorage}catch(e){}
    if(!store){
        Gun.log("Warning: No localStorage exists to persist data to!");
        store = {setItem: function(k,v){this[k]=v}, removeItem: function(k){delete this[k]}, getItem: function(k){return this[k]}};
    }
    
    var parse = JSON.parseAsync || function(t,cb,r){ var u; try{ cb(u, JSON.parse(t,r)) }catch(e){ cb(e) } }
    var json = JSON.stringifyAsync || function(v,cb,r,s){ var u; try{ cb(u, JSON.stringify(v,r,s)) }catch(e){ cb(e) } }
    
    Gun.on('create', function lg(root){
        this.to.next(root);
        var opt = root.opt, graph = root.graph, acks = [], disk, to, size, stop;
        if(false === opt.localStorage){ return }
        opt.prefix = opt.file || 'gun/';
        try{ disk = lg[opt.prefix] = lg[opt.prefix] || JSON.parse(size = store.getItem(opt.prefix)) || {}; // TODO: Perf! This will block, should we care, since limited to 5MB anyways?
        }catch(e){ disk = lg[opt.prefix] = {}; }
        size = (size||'').length;
    
        root.on('get', function(msg){
            this.to.next(msg);
            var lex = msg.get, soul, data, tmp, u;
            if(!lex || !(soul = lex['#'])){ return }
            data = disk[soul] || u;
            if(data && (tmp = lex['.']) && !Object.plain(tmp)){ // pluck!
                data = Gun.state.ify({}, tmp, Gun.state.is(data, tmp), data[tmp], soul);
            }
            //if(data){ (tmp = {})[soul] = data } // back into a graph.
            //setTimeout(function(){
            Gun.on.get.ack(msg, data); //root.on('in', {'@': msg['#'], put: tmp, lS:1});// || root.$});
            //}, Math.random() * 10); // FOR TESTING PURPOSES!
        });
    
        root.on('put', function(msg){
            this.to.next(msg); // remember to call next middleware adapter
            var put = msg.put, soul = put['#'], key = put['.'], id = msg['#'], ok = msg.ok||'', tmp; // pull data off wire envelope
            disk[soul] = Gun.state.ify(disk[soul], key, put['>'], put[':'], soul); // merge into disk object
            if(stop && size > (4999880)){ root.on('in', {'@': id, err: "localStorage max!"}); return; }
            //if(!msg['@']){ acks.push(id) } // then ack any non-ack write. // TODO: use batch id.
            if(!msg['@'] && (!msg._.via || Math.random() < (ok['@'] / ok['/']))){ acks.push(id) } // then ack any non-ack write. // TODO: use batch id.
            if(to){ return }
            to = setTimeout(flush, 9+(size / 333)); // 0.1MB = 0.3s, 5MB = 15s 
        });
        function flush(){
            if(!acks.length && ((setTimeout.turn||'').s||'').length){ setTimeout(flush,99); return; } // defer if "busy" && no saves.
            var err, ack = acks; clearTimeout(to); to = false; acks = [];
            json(disk, function(err, tmp){
                try{!err && store.setItem(opt.prefix, tmp);
                }catch(e){ err = stop = e || "localStorage failure" }
                if(err){
                    Gun.log(err + " Consider using GUN's IndexedDB plugin for RAD for more storage space, https://gun.eco/docs/RAD#install");
                    root.on('localStorage:error', {err: err, get: opt.prefix, put: disk});
                }
                size = tmp.length;
    
                //if(!err && !Object.empty(opt.peers)){ return } // only ack if there are no peers. // Switch this to probabilistic mode
                setTimeout.each(ack, function(id){
                    root.on('in', {'@': id, err: err, ok: 0}); // localStorage isn't reliable, so make its `ok` code be a low number.
                },0,99);
            })
        }
    
    });
        
    },{}],16:[function(require,module,exports){
    
    var Gun = require('./index'), next = Gun.chain.get.next;
    Gun.chain.get.next = function(gun, lex){ var tmp;
        if(!Object.plain(lex)){ return (next||noop)(gun, lex) }
        if(tmp = ((tmp = lex['#'])||'')['='] || tmp){ return gun.get(tmp) }
        (tmp = gun.chain()._).lex = lex; // LEX!
        gun.on('in', function(eve){
            if(String.match(eve.get|| (eve.put||'')['.'], lex['.'] || lex['#'] || lex)){
                tmp.on('in', eve);
            }
            this.to.next(eve);
        });
        return tmp.$;
    }
    Gun.chain.map = function(cb, opt, t){
        var gun = this, cat = gun._, lex, chain;
        if(Object.plain(cb)){ lex = cb['.']? cb : {'.': cb}; cb = u }
        if(!cb){
            if(chain = cat.each){ return chain }
            (cat.each = chain = gun.chain())._.lex = lex || chain._.lex || cat.lex;
            chain._.nix = gun.back('nix');
            gun.on('in', map, chain._);
            return chain;
        }
        Gun.log.once("mapfn", "Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
        chain = gun.chain();
        gun.map().on(function(data, key, msg, eve){
            var next = (cb||noop).call(this, data, key, msg, eve);
            if(u === next){ return }
            if(data === next){ return chain._.on('in', msg) }
            if(Gun.is(next)){ return chain._.on('in', next._) }
            var tmp = {}; Object.keys(msg.put).forEach(function(k){ tmp[k] = msg.put[k] }, tmp); tmp['='] = next; 
            chain._.on('in', {get: key, put: tmp});
        });
        return chain;
    }
    function map(msg){ this.to.next(msg);
        var cat = this.as, gun = msg.$, at = gun._, put = msg.put, tmp;
        if(!at.soul && !msg.$$){ return } // this line took hundreds of tries to figure out. It only works if core checks to filter out above chains during link tho. This says "only bother to map on a node" for this layer of the chain. If something is not a node, map should not work.
        if((tmp = cat.lex) && !String.match(msg.get|| (put||'')['.'], tmp['.'] || tmp['#'] || tmp)){ return }
        Gun.on.link(msg, cat);
    }
    var noop = function(){}, event = {stun: noop, off: noop}, u;
        
    },{"./index":14}],17:[function(require,module,exports){
    
    require('./shim');
    
    var noop = function(){}
    var parse = JSON.parseAsync || function(t,cb,r){ var u, d = +new Date; try{ cb(u, JSON.parse(t,r), json.sucks(+new Date - d)) }catch(e){ cb(e) } }
    var json = JSON.stringifyAsync || function(v,cb,r,s){ var u, d = +new Date; try{ cb(u, JSON.stringify(v,r,s), json.sucks(+new Date - d)) }catch(e){ cb(e) } }
    json.sucks = function(d){ if(d > 99){ console.log("Warning: JSON blocking CPU detected. Add `gun/lib/yson.js` to fix."); json.sucks = noop } }
    
    function Mesh(root){
        var mesh = function(){};
        var opt = root.opt || {};
        opt.log = opt.log || console.log;
        opt.gap = opt.gap || opt.wait || 0;
        opt.max = opt.max || (opt.memory? (opt.memory * 999 * 999) : 300000000) * 0.3;
        opt.pack = opt.pack || (opt.max * 0.01 * 0.01);
        opt.puff = opt.puff || 9; // IDEA: do a start/end benchmark, divide ops/result.
        var puff = setTimeout.turn || setTimeout;
    
        var dup = root.dup, dup_check = dup.check, dup_track = dup.track;
    
        var ST = +new Date, LT = ST;
    
        var hear = mesh.hear = function(raw, peer){
            if(!raw){ return }
            if(opt.max <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
            if(mesh === this){
                /*if('string' == typeof raw){ try{
                    var stat = console.STAT || {};
                    //console.log('HEAR:', peer.id, (raw||'').slice(0,250), ((raw||'').length / 1024 / 1024).toFixed(4));
                    
                    //console.log(setTimeout.turn.s.length, 'stacks', parseFloat((-(LT - (LT = +new Date))/1000).toFixed(3)), 'sec', parseFloat(((LT-ST)/1000 / 60).toFixed(1)), 'up', stat.peers||0, 'peers', stat.has||0, 'has', stat.memhused||0, stat.memused||0, stat.memax||0, 'heap mem max');
                }catch(e){ console.log('DBG err', e) }}*/
                hear.d += raw.length||0 ; ++hear.c } // STATS!
            var S = peer.SH = +new Date;
            var tmp = raw[0], msg;
            //raw && raw.slice && console.log("hear:", ((peer.wire||'').headers||'').origin, raw.length, raw.slice && raw.slice(0,50)); //tc-iamunique-tc-package-ds1
            if('[' === tmp){
                parse(raw, function(err, msg){
                    if(err || !msg){ return mesh.say({dam: '!', err: "DAM JSON parse error."}, peer) }
                    console.STAT && console.STAT(+new Date, msg.length, '# on hear batch');
                    var P = opt.puff;
                    (function go(){
                        var S = +new Date;
                        var i = 0, m; while(i < P && (m = msg[i++])){ mesh.hear(m, peer) }
                        msg = msg.slice(i); // slicing after is faster than shifting during.
                        console.STAT && console.STAT(S, +new Date - S, 'hear loop');
                        flush(peer); // force send all synchronously batched acks.
                        if(!msg.length){ return }
                        puff(go, 0);
                    }());
                });
                raw = ''; // 
                return;
            }
            if('{' === tmp || ((raw['#'] || Object.plain(raw)) && (msg = raw))){
                if(msg){ return hear.one(msg, peer, S) }
                parse(raw, function(err, msg){
                    if(err || !msg){ return mesh.say({dam: '!', err: "DAM JSON parse error."}, peer) }
                    hear.one(msg, peer, S);
                });
                return;
            }
        }
        hear.one = function(msg, peer, S){ // S here is temporary! Undo.
            var id, hash, tmp, ash, DBG;
            if(msg.DBG){ msg.DBG = DBG = {DBG: msg.DBG} }
            DBG && (DBG.h = S);
            DBG && (DBG.hp = +new Date);
            if(!(id = msg['#'])){ id = msg['#'] = String.random(9) }
            if(tmp = dup_check(id)){ return }
            // DAM logic:
            if(!(hash = msg['##']) && false && u !== msg.put){ /*hash = msg['##'] = Type.obj.hash(msg.put)*/ } // disable hashing for now // TODO: impose warning/penalty instead (?)
            if(hash && (tmp = msg['@'] || (msg.get && id)) && dup.check(ash = tmp+hash)){ return } // Imagine A <-> B <=> (C & D), C & D reply with same ACK but have different IDs, B can use hash to dedup. Or if a GET has a hash already, we shouldn't ACK if same.
            (msg._ = function(){}).via = mesh.leap = peer;
            if((tmp = msg['><']) && 'string' == typeof tmp){ tmp.slice(0,99).split(',').forEach(function(k){ this[k] = 1 }, (msg._).yo = {}) } // Peers already sent to, do not resend.
            // DAM ^
            if(tmp = msg.dam){
                if(tmp = mesh.hear[tmp]){
                    tmp(msg, peer, root);
                }
                dup_track(id);
                return;
            }
            if(tmp = msg.ok){ msg._.near = tmp['/'] }
            var S = +new Date;
            DBG && (DBG.is = S); peer.SI = id;
            root.on('in', mesh.last = msg);
            //ECHO = msg.put || ECHO; !(msg.ok !== -3740) && mesh.say({ok: -3740, put: ECHO, '@': msg['#']}, peer);
            DBG && (DBG.hd = +new Date);
            console.STAT && console.STAT(S, +new Date - S, msg.get? 'msg get' : msg.put? 'msg put' : 'msg');
            (tmp = dup_track(id)).via = peer; // don't dedup message ID till after, cause GUN has internal dedup check.
            if(msg.get){ tmp.it = msg }
            if(ash){ dup_track(ash) } //dup.track(tmp+hash, true).it = it(msg);
            mesh.leap = mesh.last = null; // warning! mesh.leap could be buggy.
        }
        var tomap = function(k,i,m){m(k,true)};
        hear.c = hear.d = 0;
    
        ;(function(){
            var SMIA = 0;
            var loop;
            mesh.hash = function(msg, peer){ var h, s, t;
                var S = +new Date;
                json(msg.put, function hash(err, text){
                    var ss = (s || (s = t = text||'')).slice(0, 32768); // 1024 * 32
                  h = String.hash(ss, h); s = s.slice(32768);
                  if(s){ puff(hash, 0); return }
                    console.STAT && console.STAT(S, +new Date - S, 'say json+hash');
                  msg._.$put = t;
                  msg['##'] = h;
                  mesh.say(msg, peer);
                  delete msg._.$put;
                }, sort);
            }
            function sort(k, v){ var tmp;
                if(!(v instanceof Object)){ return v }
                Object.keys(v).sort().forEach(sorta, {to: tmp = {}, on: v});
                return tmp;
            } function sorta(k){ this.to[k] = this.on[k] }
    
            var say = mesh.say = function(msg, peer){ var tmp;
                if((tmp = this) && (tmp = tmp.to) && tmp.next){ tmp.next(msg) } // compatible with middleware adapters.
                if(!msg){ return false }
                var id, hash, raw, ack = msg['@'];
    //if(opt.super && (!ack || !msg.put)){ return } // TODO: MANHATTAN STUB //OBVIOUSLY BUG! But squelch relay. // :( get only is 100%+ CPU usage :(
                var meta = msg._||(msg._=function(){});
                var DBG = msg.DBG, S = +new Date; meta.y = meta.y || S; if(!peer){ DBG && (DBG.y = S) }
                if(!(id = msg['#'])){ id = msg['#'] = String.random(9) }
                !loop && dup_track(id);//.it = it(msg); // track for 9 seconds, default. Earth<->Mars would need more! // always track, maybe move this to the 'after' logic if we split function.
                //if(msg.put && (msg.err || (dup.s[id]||'').err)){ return false } // TODO: in theory we should not be able to stun a message, but for now going to check if it can help network performance preventing invalid data to relay.
                if(!(hash = msg['##']) && u !== msg.put && !meta.via && ack){ mesh.hash(msg, peer); return } // TODO: Should broadcasts be hashed?
                if(!peer && ack){ peer = ((tmp = dup.s[ack]) && (tmp.via || ((tmp = tmp.it) && (tmp = tmp._) && tmp.via))) || ((tmp = mesh.last) && ack === tmp['#'] && mesh.leap) } // warning! mesh.leap could be buggy! mesh last check reduces this.
                if(!peer && ack){ // still no peer, then ack daisy chain 'tunnel' got lost.
                    if(dup.s[ack]){ return } // in dups but no peer hints that this was ack to ourself, ignore.
                    console.STAT && console.STAT(+new Date, ++SMIA, 'total no peer to ack to'); // TODO: Delete this now. Dropping lost ACKs is protocol fine now.
                    return false;
                } // TODO: Temporary? If ack via trace has been lost, acks will go to all peers, which trashes browser bandwidth. Not relaying the ack will force sender to ask for ack again. Note, this is technically wrong for mesh behavior.
                if(!peer && mesh.way){ return mesh.way(msg) }
                DBG && (DBG.yh = +new Date);
                if(!(raw = meta.raw)){ mesh.raw(msg, peer); return }
                DBG && (DBG.yr = +new Date);
                if(!peer || !peer.id){
                    if(!Object.plain(peer || opt.peers)){ return false }
                    var S = +new Date;
                    var P = opt.puff, ps = opt.peers, pl = Object.keys(peer || opt.peers || {}); // TODO: .keys( is slow
                    console.STAT && console.STAT(S, +new Date - S, 'peer keys');
                    ;(function go(){
                        var S = +new Date;
                        //Type.obj.map(peer || opt.peers, each); // in case peer is a peer list.
                        loop = 1; var wr = meta.raw; meta.raw = raw; // quick perf hack
                        var i = 0, p; while(i < 9 && (p = (pl||'')[i++])){
                            if(!(p = ps[p])){ continue }
                            mesh.say(msg, p);
                        }
                        meta.raw = wr; loop = 0;
                        pl = pl.slice(i); // slicing after is faster than shifting during.
                        console.STAT && console.STAT(S, +new Date - S, 'say loop');
                        if(!pl.length){ return }
                        puff(go, 0);
                        ack && dup_track(ack); // keep for later
                    }());
                    return;
                }
                // TODO: PERF: consider splitting function here, so say loops do less work.
                if(!peer.wire && mesh.wire){ mesh.wire(peer) }
                if(id === peer.last){ return } peer.last = id;  // was it just sent?
                if(peer === meta.via){ return false } // don't send back to self.
                if((tmp = meta.yo) && (tmp[peer.url] || tmp[peer.pid] || tmp[peer.id]) /*&& !o*/){ return false }
                console.STAT && console.STAT(S, ((DBG||meta).yp = +new Date) - (meta.y || S), 'say prep');
                !loop && ack && dup_track(ack); // streaming long responses needs to keep alive the ack.
                if(peer.batch){
                    peer.tail = (tmp = peer.tail || 0) + raw.length;
                    if(peer.tail <= opt.pack){
                        peer.batch += (tmp?',':'')+raw;
                        return;
                    }
                    flush(peer);
                }
                peer.batch = '['; // Prevents double JSON!
                var ST = +new Date;
                setTimeout(function(){
                    console.STAT && console.STAT(ST, +new Date - ST, '0ms TO');
                    flush(peer);
                }, opt.gap); // TODO: queuing/batching might be bad for low-latency video game performance! Allow opt out?
                send(raw, peer);
                console.STAT && (ack === peer.SI) && console.STAT(S, +new Date - peer.SH, 'say ack');
            }
            mesh.say.c = mesh.say.d = 0;
            // TODO: this caused a out-of-memory crash!
            mesh.raw = function(msg, peer){ // TODO: Clean this up / delete it / move logic out!
                if(!msg){ return '' }
                var meta = (msg._) || {}, put, tmp;
                if(tmp = meta.raw){ return tmp }
                if('string' == typeof msg){ return msg }
                var hash = msg['##'], ack = msg['@'];
                if(hash && ack){
                    if(!meta.via && dup_check(ack+hash)){ return false } // for our own out messages, memory & storage may ack the same thing, so dedup that. Tho if via another peer, we already tracked it upon hearing, so this will always trigger false positives, so don't do that!
                    if((tmp = (dup.s[ack]||'').it) || ((tmp = mesh.last) && ack === tmp['#'])){
                        if(hash === tmp['##']){ return false } // if ask has a matching hash, acking is optional.
                        if(!tmp['##']){ tmp['##'] = hash } // if none, add our hash to ask so anyone we relay to can dedup. // NOTE: May only check against 1st ack chunk, 2nd+ won't know and still stream back to relaying peers which may then dedup. Any way to fix this wasted bandwidth? I guess force rate limiting breaking change, that asking peer has to ask for next lexical chunk.
                    }
                }
                if(!msg.dam && !msg['@']){
                    var i = 0, to = []; tmp = opt.peers;
                    for(var k in tmp){ var p = tmp[k]; // TODO: Make it up peers instead!
                        to.push(p.url || p.pid || p.id);
                        if(++i > 6){ break }
                    }
                    if(i > 1){ msg['><'] = to.join() } // TODO: BUG! This gets set regardless of peers sent to! Detect?
                }
                if(msg.put && (tmp = msg.ok)){ msg.ok = {'@':(tmp['@']||1)-1, '/': (tmp['/']==msg._.near)? mesh.near : tmp['/']}; }
                if(put = meta.$put){
                    tmp = {}; Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] });
                    tmp.put = ':])([:';
                    json(tmp, function(err, raw){
                        if(err){ return } // TODO: Handle!!
                        var S = +new Date;
                        tmp = raw.indexOf('"put":":])([:"');
                        res(u, raw = raw.slice(0, tmp+6) + put + raw.slice(tmp + 14));
                        console.STAT && console.STAT(S, +new Date - S, 'say slice');
                    });
                    return;
                }
                json(msg, res);
                function res(err, raw){
                    if(err){ return } // TODO: Handle!!
                    meta.raw = raw; //if(meta && (raw||'').length < (999 * 99)){ meta.raw = raw } // HNPERF: If string too big, don't keep in memory.
                    mesh.say(msg, peer);
                }
            }
        }());
    
        function flush(peer){
            var tmp = peer.batch, t = 'string' == typeof tmp, l;
            if(t){ tmp += ']' }// TODO: Prevent double JSON!
            peer.batch = peer.tail = null;
            if(!tmp){ return }
            if(t? 3 > tmp.length : !tmp.length){ return } // TODO: ^
            if(!t){try{tmp = (1 === tmp.length? tmp[0] : JSON.stringify(tmp));
            }catch(e){return opt.log('DAM JSON stringify error', e)}}
            if(!tmp){ return }
            send(tmp, peer);
        }
        // for now - find better place later.
        function send(raw, peer){ try{
            var wire = peer.wire;
            if(peer.say){
                peer.say(raw);
            } else
            if(wire.send){
                wire.send(raw);
            }
            mesh.say.d += raw.length||0; ++mesh.say.c; // STATS!
        }catch(e){
            (peer.queue = peer.queue || []).push(raw);
        }}
    
        mesh.near = 0;
        mesh.hi = function(peer){
            var wire = peer.wire, tmp;
            if(!wire){ mesh.wire((peer.length && {url: peer, id: peer}) || peer); return }
            if(peer.id){
                opt.peers[peer.url || peer.id] = peer;
            } else {
                tmp = peer.id = peer.id || String.random(9);
                mesh.say({dam: '?', pid: root.opt.pid}, opt.peers[tmp] = peer);
                delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
            }
            if(!peer.met){
                mesh.near++;
                peer.met = +(new Date);
                root.on('hi', peer)
            }
            // @rogowski I need this here by default for now to fix go1dfish's bug
            tmp = peer.queue; peer.queue = [];
            setTimeout.each(tmp||[],function(msg){
                send(msg, peer);
            },0,9);
            //Type.obj.native && Type.obj.native(); // dirty place to check if other JS polluted.
        }
        mesh.bye = function(peer){
            peer.met && --mesh.near;
            delete peer.met;
            root.on('bye', peer);
            var tmp = +(new Date); tmp = (tmp - (peer.met||tmp));
            mesh.bye.time = ((mesh.bye.time || tmp) + tmp) / 2;
        }
        mesh.hear['!'] = function(msg, peer){ opt.log('Error:', msg.err) }
        mesh.hear['?'] = function(msg, peer){
            if(msg.pid){
                if(!peer.pid){ peer.pid = msg.pid }
                if(msg['@']){ return }
            }
            mesh.say({dam: '?', pid: opt.pid, '@': msg['#']}, peer);
            delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
        }
        mesh.hear['mob'] = function(msg, peer){ // NOTE: AXE will overload this with better logic.
            if(!msg.peers){ return }
            var peers = Object.keys(msg.peers), one = peers[Math.floor(Math.random()*peers.length)];
            if(!one){ return }
            mesh.bye(peer);
            mesh.hi(one);
        }
    
        root.on('create', function(root){
            root.opt.pid = root.opt.pid || String.random(9);
            this.to.next(root);
            root.on('out', mesh.say);
        });
    
        root.on('bye', function(peer, tmp){
            peer = opt.peers[peer.id || peer] || peer;
            this.to.next(peer);
            peer.bye? peer.bye() : (tmp = peer.wire) && tmp.close && tmp.close();
            delete opt.peers[peer.id];
            peer.wire = null;
        });
    
        var gets = {};
        root.on('bye', function(peer, tmp){ this.to.next(peer);
            if(tmp = console.STAT){ tmp.peers = mesh.near; }
            if(!(tmp = peer.url)){ return } gets[tmp] = true;
            setTimeout(function(){ delete gets[tmp] },opt.lack || 9000);
        });
        root.on('hi', function(peer, tmp){ this.to.next(peer);
            if(tmp = console.STAT){ tmp.peers = mesh.near }
            if(!(tmp = peer.url) || !gets[tmp]){ return } delete gets[tmp];
            if(opt.super){ return } // temporary (?) until we have better fix/solution?
            setTimeout.each(Object.keys(root.next), function(soul){ var node = root.next[soul]; // TODO: .keys( is slow
                tmp = {}; tmp[soul] = root.graph[soul]; tmp = String.hash(tmp); // TODO: BUG! This is broken.
                mesh.say({'##': tmp, get: {'#': soul}}, peer);
            });
        });
    
        return mesh;
    }
          var empty = {}, ok = true, u;
    
          try{ module.exports = Mesh }catch(e){}
    
        
    },{"./shim":23}],18:[function(require,module,exports){
    
    var Gun = require('./index');
    Gun.chain.on = function(tag, arg, eas, as){ // don't rewrite!
        var gun = this, cat = gun._, root = cat.root, act, off, id, tmp;
        if(typeof tag === 'string'){
            if(!arg){ return cat.on(tag) }
            act = cat.on(tag, arg, eas || cat, as);
            if(eas && eas.$){
                (eas.subs || (eas.subs = [])).push(act);
            }
            return gun;
        }
        var opt = arg;
        (opt = (true === opt)? {change: true} : opt || {}).not = 1; opt.on = 1;
        //opt.at = cat;
        //opt.ok = tag;
        //opt.last = {};
        var wait = {}; // can we assign this to the at instead, like in once?
        gun.get(tag, opt);
        /*gun.get(function on(data,key,msg,eve){ var $ = this;
            if(tmp = root.hatch){ // quick hack!
                if(wait[$._.id]){ return } wait[$._.id] = 1;
                tmp.push(function(){on.call($, data,key,msg,eve)});
                return;
            }; wait = {}; // end quick hack.
            tag.call($, data,key,msg,eve);
        }, opt); // TODO: PERF! Event listener leak!!!?*/
        /*
        function one(msg, eve){
            if(one.stun){ return }
            var at = msg.$._, data = at.put, tmp;
            if(tmp = at.link){ data = root.$.get(tmp)._.put }
            if(opt.not===u && u === data){ return }
            if(opt.stun===u && (tmp = root.stun) && (tmp = tmp[at.id] || tmp[at.back.id]) && !tmp.end){ // Remember! If you port this into `.get(cb` make sure you allow stun:0 skip option for `.put(`.
                tmp[id] = function(){one(msg,eve)};
                return;
            }
            //tmp = one.wait || (one.wait = {}); console.log(tmp[at.id] === ''); if(tmp[at.id] !== ''){ tmp[at.id] = tmp[at.id] || setTimeout(function(){tmp[at.id]='';one(msg,eve)},1); return } delete tmp[at.id];
            // call:
            if(opt.as){
                opt.ok.call(opt.as, msg, eve || one);
            } else {
                opt.ok.call(at.$, data, msg.get || at.get, msg, eve || one);
            }
        };
        one.at = cat;
        (cat.act||(cat.act={}))[id = String.random(7)] = one;
        one.off = function(){ one.stun = 1; if(!cat.act){ return } delete cat.act[id] }
        cat.on('out', {get: {}});*/
        return gun;
    }
    // Rules:
    // 1. If cached, should be fast, but not read while write.
    // 2. Should not retrigger other listeners, should get triggered even if nothing found.
    // 3. If the same callback passed to many different once chains, each should resolve - an unsubscribe from the same callback should not effect the state of the other resolving chains, if you do want to cancel them all early you should mutate the callback itself with a flag & check for it at top of callback
    Gun.chain.once = function(cb, opt){ opt = opt || {}; // avoid rewriting
        if(!cb){ return none(this,opt) }
        var gun = this, cat = gun._, root = cat.root, data = cat.put, id = String.random(7), one, tmp;
        gun.get(function(data,key,msg,eve){
            var $ = this, at = $._, one = (at.one||(at.one={}));
            if(eve.stun){ return } if('' === one[id]){ return }
            if(true === (tmp = Gun.valid(data))){ once(); return }
            if('string' == typeof tmp){ return } // TODO: BUG? Will this always load?
            clearTimeout((cat.one||'')[id]); // clear "not found" since they only get set on cat.
            clearTimeout(one[id]); one[id] = setTimeout(once, opt.wait||99); // TODO: Bug? This doesn't handle plural chains.
            function once(f){
                if(!at.has && !at.soul){ at = {put: data, get: key} } // handles non-core messages.
                if(u === (tmp = at.put)){ tmp = ((msg.$$||'')._||'').put }
                if('string' == typeof Gun.valid(tmp)){
                    tmp = root.$.get(tmp)._.put;
                    if(tmp === u && !f){
                        one[id] = setTimeout(function(){ once(1) }, opt.wait||99); // TODO: Quick fix. Maybe use ack count for more predictable control?
                        return
                    }
                }
                //console.log("AND VANISHED", data);
                if(eve.stun){ return } if('' === one[id]){ return } one[id] = '';
                if(cat.soul || cat.has){ eve.off() } // TODO: Plural chains? // else { ?.off() } // better than one check?
                cb.call($, tmp, at.get);
                clearTimeout(one[id]); // clear "not found" since they only get set on cat. // TODO: This was hackily added, is it necessary or important? Probably not, in future try removing this. Was added just as a safety for the `&& !f` check.
            };
        }, {on: 1});
        return gun;
    }
    function none(gun,opt,chain){
        Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
        (chain = gun.chain())._.nix = gun.once(function(data, key){ chain._.on('in', this._) });
        chain._.lex = gun._.lex; // TODO: Better approach in future? This is quick for now.
        return chain;
    }
    
    Gun.chain.off = function(){
        // make off more aggressive. Warning, it might backfire!
        var gun = this, at = gun._, tmp;
        var cat = at.back;
        if(!cat){ return }
        at.ack = 0; // so can resubscribe.
        if(tmp = cat.next){
            if(tmp[at.get]){
                delete tmp[at.get];
            } else {
    
            }
        }
        // TODO: delete cat.one[map.id]?
        if(tmp = cat.ask){
            delete tmp[at.get];
        }
        if(tmp = cat.put){
            delete tmp[at.get];
        }
        if(tmp = at.soul){
            delete cat.root.graph[tmp];
        }
        if(tmp = at.map){
            Object.keys(tmp).forEach(function(i,at){ at = tmp[i]; //obj_map(tmp, function(at){
                if(at.link){
                    cat.root.$.get(at.link).off();
                }
            });
        }
        if(tmp = at.next){
            Object.keys(tmp).forEach(function(i,neat){ neat = tmp[i]; //obj_map(tmp, function(neat){
                neat.$.off();
            });
        }
        at.on('off', {});
        return gun;
    }
    var empty = {}, noop = function(){}, u;
        
    },{"./index":14}],19:[function(require,module,exports){
    
    // On event emitter generic javascript utility.
    module.exports = function onto(tag, arg, as){
        if(!tag){ return {to: onto} }
        var u, f = 'function' == typeof arg, tag = (this.tag || (this.tag = {}))[tag] || f && (
            this.tag[tag] = {tag: tag, to: onto._ = { next: function(arg){ var tmp;
                if(tmp = this.to){ tmp.next(arg) }
        }}});
        if(f){
            var be = {
                off: onto.off ||
                (onto.off = function(){
                    if(this.next === onto._.next){ return !0 }
                    if(this === this.the.last){
                        this.the.last = this.back;
                    }
                    this.to.back = this.back;
                    this.next = onto._.next;
                    this.back.to = this.to;
                    if(this.the.last === this.the){
                        delete this.on.tag[this.the.tag];
                    }
                }),
                to: onto._,
                next: arg,
                the: tag,
                on: this,
                as: as,
            };
            (be.back = tag.last || tag).to = be;
            return tag.last = be;
        }
        if((tag = tag.to) && u !== arg){ tag.next(arg) }
        return tag;
    };
        
    },{}],20:[function(require,module,exports){
    
    var Gun = require('./root');
    Gun.chain.put = function(data, cb, as){ // I rewrote it :)
        var gun = this, at = gun._, root = at.root;
        as = as || {};
        as.root = at.root;
        as.run || (as.run = root.once);
        stun(as, at.id); // set a flag for reads to check if this chain is writing.
        as.ack = as.ack || cb;
        as.via = as.via || gun;
        as.data = as.data || data;
        as.soul || (as.soul = at.soul || ('string' == typeof cb && cb));
        var s = as.state = as.state || Gun.state();
        if('function' == typeof data){ data(function(d){ as.data = d; gun.put(u,u,as) }); return gun }
        if(!as.soul){ return get(as), gun }
        as.$ = root.$.get(as.soul); // TODO: This may not allow user chaining and similar?
        as.todo = [{it: as.data, ref: as.$}];
        as.turn = as.turn || turn;
        as.ran = as.ran || ran;
        //var path = []; as.via.back(at => { at.get && path.push(at.get.slice(0,9)) }); path = path.reverse().join('.');
        // TODO: Perf! We only need to stun chains that are being modified, not necessarily written to.
        (function walk(){
            var to = as.todo, at = to.pop(), d = at.it, cid = at.ref && at.ref._.id, v, k, cat, tmp, g;
            stun(as, at.ref);
            if(tmp = at.todo){
                k = tmp.pop(); d = d[k];
                if(tmp.length){ to.push(at) }
            }
            k && (to.path || (to.path = [])).push(k);
            if(!(v = valid(d)) && !(g = Gun.is(d))){
                if(!Object.plain(d)){ ran.err(as, "Invalid data: "+ check(d) +" at " + (as.via.back(function(at){at.get && tmp.push(at.get)}, tmp = []) || tmp.join('.'))+'.'+(to.path||[]).join('.')); return }
                var seen = as.seen || (as.seen = []), i = seen.length;
                while(i--){ if(d === (tmp = seen[i]).it){ v = d = tmp.link; break } }
            }
            if(k && v){ at.node = state_ify(at.node, k, s, d) } // handle soul later.
            else {
                if(!as.seen){ ran.err(as, "Data at root of graph must be a node (an object)."); return }
                as.seen.push(cat = {it: d, link: {}, todo: g? [] : Object.keys(d).sort().reverse(), path: (to.path||[]).slice(), up: at}); // Any perf reasons to CPU schedule this .keys( ?
                at.node = state_ify(at.node, k, s, cat.link);
                !g && cat.todo.length && to.push(cat);
                // ---------------
                var id = as.seen.length;
                (as.wait || (as.wait = {}))[id] = '';
                tmp = (cat.ref = (g? d : k? at.ref.get(k) : at.ref))._;
                (tmp = (d && (d._||'')['#']) || tmp.soul || tmp.link)? resolve({soul: tmp}) : cat.ref.get(resolve, {run: as.run, /*hatch: 0,*/ v2020:1, out:{get:{'.':' '}}}); // TODO: BUG! This should be resolve ONLY soul to prevent full data from being loaded. // Fixed now?
                //setTimeout(function(){ if(F){ return } console.log("I HAVE NOT BEEN CALLED!", path, id, cat.ref._.id, k) }, 9000); var F; // MAKE SURE TO ADD F = 1 below!
                function resolve(msg, eve){
                    var end = cat.link['#'];
                    if(eve){ eve.off(); eve.rid(msg) } // TODO: Too early! Check all peers ack not found.
                    // TODO: BUG maybe? Make sure this does not pick up a link change wipe, that it uses the changign link instead.
                    var soul = end || msg.soul || (tmp = (msg.$$||msg.$)._||'').soul || tmp.link || ((tmp = tmp.put||'')._||'')['#'] || tmp['#'] || (((tmp = msg.put||'') && msg.$$)? tmp['#'] : (tmp['=']||tmp[':']||'')['#']);
                    !end && stun(as, msg.$);
                    if(!soul && !at.link['#']){ // check soul link above us
                        (at.wait || (at.wait = [])).push(function(){ resolve(msg, eve) }) // wait
                        return;
                    }
                    if(!soul){
                        soul = [];
                        (msg.$$||msg.$).back(function(at){
                            if(tmp = at.soul || at.link){ return soul.push(tmp) }
                            soul.push(at.get);
                        });
                        soul = soul.reverse().join('/');
                    }
                    cat.link['#'] = soul;
                    !g && (((as.graph || (as.graph = {}))[soul] = (cat.node || (cat.node = {_:{}})))._['#'] = soul);
                    delete as.wait[id];
                    cat.wait && setTimeout.each(cat.wait, function(cb){ cb && cb() });
                    as.ran(as);
                };
                // ---------------
            }
            if(!to.length){ return as.ran(as) }
            as.turn(walk);
        }());
        return gun;
    }
    
    function stun(as, id){
        if(!id){ return } id = (id._||'').id||id;
        var run = as.root.stun || (as.root.stun = {on: Gun.on}), test = {}, tmp;
        as.stun || (as.stun = run.on('stun', function(){ }));
        if(tmp = run.on(''+id)){ tmp.the.last.next(test) }
        if(test.run >= as.run){ return }
        run.on(''+id, function(test){
            if(as.stun.end){
                this.off();
                this.to.next(test);
                return;
            }
            test.run = test.run || as.run;
            test.stun = test.stun || as.stun; return;
            if(this.to.to){
                this.the.last.next(test);
                return;
            }
            test.stun = as.stun;
        });
    }
    
    function ran(as){
        if(as.err){ ran.end(as.stun, as.root); return } // move log handle here.
        if(as.todo.length || as.end || !Object.empty(as.wait)){ return } as.end = 1;
        //(as.retry = function(){ as.acks = 0;
        var cat = (as.$.back(-1)._), root = cat.root, ask = cat.ask(function(ack){
            root.on('ack', ack);
            if(ack.err && !ack.lack){ Gun.log(ack) }
            if(++acks > (as.acks || 0)){ this.off() } // Adjustable ACKs! Only 1 by default.
            if(!as.ack){ return }
            as.ack(ack, this);
        }, as.opt), acks = 0, stun = as.stun, tmp;
        (tmp = function(){ // this is not official yet, but quick solution to hack in for now.
            if(!stun){ return }
            ran.end(stun, root);
            setTimeout.each(Object.keys(stun = stun.add||''), function(cb){ if(cb = stun[cb]){cb()} }); // resume the stunned reads // Any perf reasons to CPU schedule this .keys( ?
        }).hatch = tmp; // this is not official yet ^
        //console.log(1, "PUT", as.run, as.graph);
        if(as.ack && !as.ok){ as.ok = as.acks || 9 } // TODO: In future! Remove this! This is just old API support.
        (as.via._).on('out', {put: as.out = as.graph, ok: as.ok && {'@': as.ok+1}, opt: as.opt, '#': ask, _: tmp});
        //})();
    }; ran.end = function(stun,root){
        stun.end = noop; // like with the earlier id, cheaper to make this flag a function so below callbacks do not have to do an extra type check.
        if(stun.the.to === stun && stun === stun.the.last){ delete root.stun }
        stun.off();
    }; ran.err = function(as, err){
        (as.ack||noop).call(as, as.out = { err: as.err = Gun.log(err) });
        as.ran(as);
    }
    
    function get(as){
        var at = as.via._, tmp;
        as.via = as.via.back(function(at){
            if(at.soul || !at.get){ return at.$ }
            tmp = as.data; (as.data = {})[at.get] = tmp;
        });
        if(!as.via || !as.via._.soul){
            as.via = at.root.$.get(((as.data||'')._||'')['#'] || at.$.back('opt.uuid')())
        }
        as.via.put(as.data, as.ack, as);
        
    
        return;
        if(at.get && at.back.soul){
            tmp = as.data;
            as.via = at.back.$;
            (as.data = {})[at.get] = tmp; 
            as.via.put(as.data, as.ack, as);
            return;
        }
    }
    function check(d, tmp){ return ((d && (tmp = d.constructor) && tmp.name) || typeof d) }
    
    var u, empty = {}, noop = function(){}, turn = setTimeout.turn, valid = Gun.valid, state_ify = Gun.state.ify;
    var iife = function(fn,as){fn.call(as||empty)}
        
    },{"./root":21}],21:[function(require,module,exports){
    
    
    function Gun(o){
        if(o instanceof Gun){ return (this._ = {$: this}).$ }
        if(!(this instanceof Gun)){ return new Gun(o) }
        return Gun.create(this._ = {$: this, opt: o});
    }
    
    Gun.is = function($){ return ($ instanceof Gun) || ($ && $._ && ($ === $._.$)) || false }
    
    Gun.version = 0.2020;
    
    Gun.chain = Gun.prototype;
    Gun.chain.toJSON = function(){};
    
    require('./shim');
    Gun.valid = require('./valid');
    Gun.state = require('./state');
    Gun.on = require('./onto');
    Gun.dup = require('./dup');
    Gun.ask = require('./ask');
    
    ;(function(){
        Gun.create = function(at){
            at.root = at.root || at;
            at.graph = at.graph || {};
            at.on = at.on || Gun.on;
            at.ask = at.ask || Gun.ask;
            at.dup = at.dup || Gun.dup();
            var gun = at.$.opt(at.opt);
            if(!at.once){
                at.on('in', universe, at);
                at.on('out', universe, at);
                at.on('put', map, at);
                Gun.on('create', at);
                at.on('create', at);
            }
            at.once = 1;
            return gun;
        }
        function universe(msg){
            // TODO: BUG! msg.out = null being set!
            //if(!F){ var eve = this; setTimeout(function(){ universe.call(eve, msg,1) },Math.random() * 100);return; } // ADD F TO PARAMS!
            if(!msg){ return }
            if(msg.out === universe){ this.to.next(msg); return }
            var eve = this, as = eve.as, at = as.at || as, gun = at.$, dup = at.dup, tmp, DBG = msg.DBG;
            (tmp = msg['#']) || (tmp = msg['#'] = text_rand(9));
            if(dup.check(tmp)){ return } dup.track(tmp);
            tmp = msg._; msg._ = ('function' == typeof tmp)? tmp : function(){};
            (msg.$ && (msg.$ === (msg.$._||'').$)) || (msg.$ = gun);
            if(msg['@'] && !msg.put){ ack(msg) }
            if(!at.ask(msg['@'], msg)){ // is this machine listening for an ack?
                DBG && (DBG.u = +new Date);
                if(msg.put){ put(msg); return } else
                if(msg.get){ Gun.on.get(msg, gun) }
            }
            DBG && (DBG.uc = +new Date);
            eve.to.next(msg);
            DBG && (DBG.ua = +new Date);
            if(msg.nts || msg.NTS){ return } // TODO: This shouldn't be in core, but fast way to prevent NTS spread. Delete this line after all peers have upgraded to newer versions.
            msg.out = universe; at.on('out', msg);
            DBG && (DBG.ue = +new Date);
        }
        function put(msg){
            if(!msg){ return }
            var ctx = msg._||'', root = ctx.root = ((ctx.$ = msg.$||'')._||'').root;
            if(msg['@'] && ctx.faith && !ctx.miss){ // TODO: AXE may split/route based on 'put' what should we do here? Detect @ in AXE? I think we don't have to worry, as DAM will route it on @.
                msg.out = universe;
                root.on('out', msg);
                return;
            }
            ctx.latch = root.hatch; ctx.match = root.hatch = [];
            var put = msg.put;
            var DBG = ctx.DBG = msg.DBG, S = +new Date; CT = CT || S;
            if(put['#'] && put['.']){ /*root && root.on('put', msg);*/ return } // TODO: BUG! This needs to call HAM instead.
            DBG && (DBG.p = S);
            ctx['#'] = msg['#'];
            ctx.msg = msg;
            ctx.all = 0;
            ctx.stun = 1;
            var nl = Object.keys(put);//.sort(); // TODO: This is unbounded operation, large graphs will be slower. Write our own CPU scheduled sort? Or somehow do it in below? Keys itself is not O(1) either, create ES5 shim over ?weak map? or custom which is constant.
            console.STAT && console.STAT(S, ((DBG||ctx).pk = +new Date) - S, 'put sort');
            var ni = 0, nj, kl, soul, node, states, err, tmp;
            (function pop(o){
                if(nj != ni){ nj = ni;
                    if(!(soul = nl[ni])){
                        console.STAT && console.STAT(S, ((DBG||ctx).pd = +new Date) - S, 'put');
                        fire(ctx);
                        return;
                    }
                    if(!(node = put[soul])){ err = ERR+cut(soul)+"no node." } else
                    if(!(tmp = node._)){ err = ERR+cut(soul)+"no meta." } else
                    if(soul !== tmp['#']){ err = ERR+cut(soul)+"soul not same." } else
                    if(!(states = tmp['>'])){ err = ERR+cut(soul)+"no state." }
                    kl = Object.keys(node||{}); // TODO: .keys( is slow
                }
                if(err){
                    msg.err = ctx.err = err; // invalid data should error and stun the message.
                    fire(ctx);
                    //console.log("handle error!", err) // handle!
                    return;
                }
                var i = 0, key; o = o || 0;
                while(o++ < 9 && (key = kl[i++])){
                    if('_' === key){ continue }
                    var val = node[key], state = states[key];
                    if(u === state){ err = ERR+cut(key)+"on"+cut(soul)+"no state."; break }
                    if(!valid(val)){ err = ERR+cut(key)+"on"+cut(soul)+"bad "+(typeof val)+cut(val); break }
                    //ctx.all++; //ctx.ack[soul+key] = '';
                    ham(val, key, soul, state, msg);
                    ++C; // courtesy count;
                }
                if((kl = kl.slice(i)).length){ turn(pop); return }
                ++ni; kl = null; pop(o);
            }());
        } Gun.on.put = put;
        // TODO: MARK!!! clock below, reconnect sync, SEA certify wire merge, User.auth taking multiple times, // msg put, put, say ack, hear loop...
        // WASIS BUG! local peer not ack. .off other people: .open
        function ham(val, key, soul, state, msg){
            var ctx = msg._||'', root = ctx.root, graph = root.graph, lot, tmp;
            var vertex = graph[soul] || empty, was = state_is(vertex, key, 1), known = vertex[key];
            
            var DBG = ctx.DBG; if(tmp = console.STAT){ if(!graph[soul] || !known){ tmp.has = (tmp.has || 0) + 1 } }
    
            var now = State(), u;
            if(state > now){
                setTimeout(function(){ ham(val, key, soul, state, msg) }, (tmp = state - now) > MD? MD : tmp); // Max Defer 32bit. :(
                console.STAT && console.STAT(((DBG||ctx).Hf = +new Date), tmp, 'future');
                return;
            }
            if(state < was){ /*old;*/ if(!ctx.miss){ return } } // but some chains have a cache miss that need to re-fire. // TODO: Improve in future. // for AXE this would reduce rebroadcast, but GUN does it on message forwarding.
            if(!ctx.faith){ // TODO: BUG? Can this be used for cache miss as well? // Yes this was a bug, need to check cache miss for RAD tests, but should we care about the faith check now? Probably not.
                if(state === was && (val === known || L(val) <= L(known))){ /*console.log("same");*/ /*same;*/ if(!ctx.miss){ return } } // same
            }
            ctx.stun++; // TODO: 'forget' feature in SEA tied to this, bad approach, but hacked in for now. Any changes here must update there.
            var aid = msg['#']+ctx.all++, id = {toString: function(){ return aid }, _: ctx}; id.toJSON = id.toString; // this *trick* makes it compatible between old & new versions.
            root.dup.track(id)['#'] = msg['#']; // fixes new OK acks for RPC like RTC.
            DBG && (DBG.ph = DBG.ph || +new Date);
            root.on('put', {'#': id, '@': msg['@'], put: {'#': soul, '.': key, ':': val, '>': state}, ok: msg.ok, _: ctx});
        }
        function map(msg){
            var DBG; if(DBG = (msg._||'').DBG){ DBG.pa = +new Date; DBG.pm = DBG.pm || +new Date}
              var eve = this, root = eve.as, graph = root.graph, ctx = msg._, put = msg.put, soul = put['#'], key = put['.'], val = put[':'], state = put['>'], id = msg['#'], tmp;
              if((tmp = ctx.msg) && (tmp = tmp.put) && (tmp = tmp[soul])){ state_ify(tmp, key, state, val, soul) } // necessary! or else out messages do not get SEA transforms.
            graph[soul] = state_ify(graph[soul], key, state, val, soul);
            if(tmp = (root.next||'')[soul]){ tmp.on('in', msg) }
            fire(ctx);
            eve.to.next(msg);
        }
        function fire(ctx, msg){ var root;
            if(ctx.stop){ return }
            if(!ctx.err && 0 < --ctx.stun){ return } // TODO: 'forget' feature in SEA tied to this, bad approach, but hacked in for now. Any changes here must update there.
            ctx.stop = 1;
            if(!(root = ctx.root)){ return }
            var tmp = ctx.match; tmp.end = 1;
            if(tmp === root.hatch){ if(!(tmp = ctx.latch) || tmp.end){ delete root.hatch } else { root.hatch = tmp } }
            ctx.hatch && ctx.hatch(); // TODO: rename/rework how put & this interact.
            setTimeout.each(ctx.match, function(cb){cb && cb()}); 
            if(!(msg = ctx.msg) || ctx.err || msg.err){ return }
            msg.out = universe;
            ctx.root.on('out', msg);
    
            CF(); // courtesy check;
        }
        function ack(msg){ // aggregate ACKs.
            var id = msg['@'] || '', ctx, ok, tmp;
            if(!(ctx = id._)){
                var dup = (dup = msg.$) && (dup = dup._) && (dup = dup.root) && (dup = dup.dup);
                if(!(dup = dup.check(id))){ return }
                msg['@'] = dup['#'] || msg['@']; // This doesn't do anything anymore, backtrack it to something else?
                return;
            }
            ctx.acks = (ctx.acks||0) + 1;
            if(ctx.err = msg.err){
                msg['@'] = ctx['#'];
                fire(ctx); // TODO: BUG? How it skips/stops propagation of msg if any 1 item is error, this would assume a whole batch/resync has same malicious intent.
            }
            ctx.ok = msg.ok || ctx.ok;
            if(!ctx.stop && !ctx.crack){ ctx.crack = ctx.match && ctx.match.push(function(){back(ctx)}) } // handle synchronous acks. NOTE: If a storage peer ACKs synchronously then the PUT loop has not even counted up how many items need to be processed, so ctx.STOP flags this and adds only 1 callback to the end of the PUT loop.
            back(ctx);
        }
        function back(ctx){
            if(!ctx || !ctx.root){ return }
            if(ctx.stun || ctx.acks !== ctx.all){ return }
            ctx.root.on('in', {'@': ctx['#'], err: ctx.err, ok: ctx.err? u : ctx.ok || {'':1}});
        }
    
        var ERR = "Error: Invalid graph!";
        var cut = function(s){ return " '"+(''+s).slice(0,9)+"...' " }
        var L = JSON.stringify, MD = 2147483647, State = Gun.state;
        var C = 0, CT, CF = function(){if(C>999 && (C/-(CT - (CT = +new Date))>1)){Gun.window && console.log("Warning: You're syncing 1K+ records a second, faster than DOM can update - consider limiting query.");CF=function(){C=0}}};
    
    }());
    
    ;(function(){
        Gun.on.get = function(msg, gun){
            var root = gun._, get = msg.get, soul = get['#'], node = root.graph[soul], has = get['.'];
            var next = root.next || (root.next = {}), at = next[soul];
            // queue concurrent GETs?
            // TODO: consider tagging original message into dup for DAM.
            // TODO: ^ above? In chat app, 12 messages resulted in same peer asking for `#user.pub` 12 times. (same with #user GET too, yipes!) // DAM note: This also resulted in 12 replies from 1 peer which all had same ##hash but none of them deduped because each get was different.
            // TODO: Moving quick hacks fixing these things to axe for now.
            // TODO: a lot of GET #foo then GET #foo."" happening, why?
            // TODO: DAM's ## hash check, on same get ACK, producing multiple replies still, maybe JSON vs YSON?
            // TMP note for now: viMZq1slG was chat LEX query #.
            /*if(gun !== (tmp = msg.$) && (tmp = (tmp||'')._)){
                if(tmp.Q){ tmp.Q[msg['#']] = ''; return } // chain does not need to ask for it again.
                tmp.Q = {};
            }*/
            /*if(u === has){
                if(at.Q){
                    //at.Q[msg['#']] = '';
                    //return;
                }
                at.Q = {};
            }*/
            var ctx = msg._||{}, DBG = ctx.DBG = msg.DBG;
            DBG && (DBG.g = +new Date);
            //console.log("GET:", get, node, has);
            if(!node){ return root.on('get', msg) }
            if(has){
                if('string' != typeof has || u === node[has]){ return root.on('get', msg) }
                node = state_ify({}, has, state_is(node, has), node[has], soul);
                // If we have a key in-memory, do we really need to fetch?
                // Maybe... in case the in-memory key we have is a local write
                // we still need to trigger a pull/merge from peers.
            }
            //Gun.window? Gun.obj.copy(node) : node; // HNPERF: If !browser bump Performance? Is this too dangerous to reference root graph? Copy / shallow copy too expensive for big nodes. Gun.obj.to(node); // 1 layer deep copy // Gun.obj.copy(node); // too slow on big nodes
            node && ack(msg, node);
            root.on('get', msg); // send GET to storage adapters.
        }
        function ack(msg, node){
            var S = +new Date, ctx = msg._||{}, DBG = ctx.DBG = msg.DBG;
            var to = msg['#'], id = text_rand(9), keys = Object.keys(node||'').sort(), soul = ((node||'')._||'')['#'], kl = keys.length, j = 0, root = msg.$._.root, F = (node === root.graph[soul]);
            console.STAT && console.STAT(S, ((DBG||ctx).gk = +new Date) - S, 'got keys');
            // PERF: Consider commenting this out to force disk-only reads for perf testing? // TODO: .keys( is slow
            node && (function go(){
                S = +new Date;
                var i = 0, k, put = {}, tmp;
                while(i < 9 && (k = keys[i++])){
                    state_ify(put, k, state_is(node, k), node[k], soul);
                }
                keys = keys.slice(i);
                (tmp = {})[soul] = put; put = tmp;
                var faith; if(F){ faith = function(){}; faith.ram = faith.faith = true; } // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
                tmp = keys.length;
                console.STAT && console.STAT(S, -(S - (S = +new Date)), 'got copied some');
                DBG && (DBG.ga = +new Date);
                root.on('in', {'@': to, '#': id, put: put, '%': (tmp? (id = text_rand(9)) : u), $: root.$, _: faith, DBG: DBG});
                console.STAT && console.STAT(S, +new Date - S, 'got in');
                if(!tmp){ return }
                setTimeout.turn(go);
            }());
            if(!node){ root.on('in', {'@': msg['#']}) } // TODO: I don't think I like this, the default lS adapter uses this but "not found" is a sensitive issue, so should probably be handled more carefully/individually.
        } Gun.on.get.ack = ack;
    }());
    
    ;(function(){
        Gun.chain.opt = function(opt){
            opt = opt || {};
            var gun = this, at = gun._, tmp = opt.peers || opt;
            if(!Object.plain(opt)){ opt = {} }
            if(!Object.plain(at.opt)){ at.opt = opt }
            if('string' == typeof tmp){ tmp = [tmp] }
            if(!Object.plain(at.opt.peers)){ at.opt.peers = {}}
            if(tmp instanceof Array){
                opt.peers = {};
                tmp.forEach(function(url){
                    var p = {}; p.id = p.url = url;
                    opt.peers[url] = at.opt.peers[url] = at.opt.peers[url] || p;
                })
            }
            obj_each(opt, function each(k){ var v = this[k];
                if((this && this.hasOwnProperty(k)) || 'string' == typeof v || Object.empty(v)){ this[k] = v; return }
                if(v && v.constructor !== Object && !(v instanceof Array)){ return }
                obj_each(v, each);
            });
            at.opt.from = opt;
            Gun.on('opt', at);
            at.opt.uuid = at.opt.uuid || function uuid(l){ return Gun.state().toString(36).replace('.','') + String.random(l||12) }
            return gun;
        }
    }());
    
    var obj_each = function(o,f){ Object.keys(o).forEach(f,o) }, text_rand = String.random, turn = setTimeout.turn, valid = Gun.valid, state_is = Gun.state.is, state_ify = Gun.state.ify, u, empty = {}, C;
    
    Gun.log = function(){ return (!Gun.log.off && C.log.apply(C, arguments)), [].slice.call(arguments).join(' ') };
    Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) };
    
    if(typeof window !== "undefined"){ (window.GUN = window.Gun = Gun).window = window }
    try{ if(typeof MODULE !== "undefined"){ MODULE.exports = Gun } }catch(e){}
    module.exports = Gun;
    
    (Gun.window||{}).console = (Gun.window||{}).console || {log: function(){}};
    (C = console).only = function(i, s){ return (C.only.i && i === C.only.i && C.only.i++) && (C.log.apply(C, arguments) || s) };
    
    ;"Please do not remove welcome log unless you are paying for a monthly sponsorship, thanks!";
    Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, please ask for help on http://chat.gun.eco if anything takes you longer than 5min to figure out!");
        
    },{"./ask":9,"./dup":12,"./onto":19,"./shim":23,"./state":24,"./valid":25}],22:[function(require,module,exports){
    
    var Gun = require('./index');
    Gun.chain.set = function(item, cb, opt){
        var gun = this, root = gun.back(-1), soul, tmp;
        cb = cb || function(){};
        opt = opt || {}; opt.item = opt.item || item;
        if(soul = ((item||'')._||'')['#']){ (item = {})['#'] = soul } // check if node, make link.
        if('string' == typeof (tmp = Gun.valid(item))){ return gun.get(soul = tmp).put(item, cb, opt) } // check if link
        if(!Gun.is(item)){
            if(Object.plain(item)){
                item = root.get(soul = gun.back('opt.uuid')()).put(item);
            }
            return gun.get(soul || root.back('opt.uuid')(7)).put(item, cb, opt);
        }
        gun.put(function(go){
            item.get(function(soul, o, msg){ // TODO: BUG! We no longer have this option? & go error not handled?
                if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')}) }
                (tmp = {})[soul] = {'#': soul}; go(tmp);
            },true);
        })
        return item;
    }
        
    },{"./index":14}],23:[function(require,module,exports){
    
    // Shim for generic javascript utilities.
    String.random = function(l, c){
        var s = '';
        l = l || 24; // you are not going to make a 0 length random number, so no need to check type
        c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
        while(l-- > 0){ s += c.charAt(Math.floor(Math.random() * c.length)) }
        return s;
    }
    String.match = function(t, o){ var tmp, u;
        if('string' !== typeof t){ return false }
        if('string' == typeof o){ o = {'=': o} }
        o = o || {};
        tmp = (o['='] || o['*'] || o['>'] || o['<']);
        if(t === tmp){ return true }
        if(u !== o['=']){ return false }
        tmp = (o['*'] || o['>']);
        if(t.slice(0, (tmp||'').length) === tmp){ return true }
        if(u !== o['*']){ return false }
        if(u !== o['>'] && u !== o['<']){
            return (t >= o['>'] && t <= o['<'])? true : false;
        }
        if(u !== o['>'] && t >= o['>']){ return true }
        if(u !== o['<'] && t <= o['<']){ return true }
        return false;
    }
    String.hash = function(s, c){ // via SO
        if(typeof s !== 'string'){ return }
            c = c || 0; // CPU schedule hashing by
            if(!s.length){ return c }
            for(var i=0,l=s.length,n; i<l; ++i){
              n = s.charCodeAt(i);
              c = ((c<<5)-c)+n;
              c |= 0;
            }
            return c;
          }
    var has = Object.prototype.hasOwnProperty;
    Object.plain = function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }
    Object.empty = function(o, n){
        for(var k in o){ if(has.call(o, k) && (!n || -1==n.indexOf(k))){ return false } }
        return true;
    }
    Object.keys = Object.keys || function(o){
        var l = [];
        for(var k in o){ if(has.call(o, k)){ l.push(k) } }
        return l;
    }
    ;(function(){ // max ~1ms or before stack overflow 
        var u, sT = setTimeout, l = 0, c = 0, sI = (typeof setImmediate !== ''+u && setImmediate) || sT; // queueMicrotask faster but blocks UI
        sT.hold = sT.hold || 9;
        sT.poll = sT.poll || function(f){ //f(); return; // for testing
            if((sT.hold >= (+new Date - l)) && c++ < 3333){ f(); return }
            sI(function(){ l = +new Date; f() },c=0)
        }
    }());
    ;(function(){ // Too many polls block, this "threads" them in turns over a single thread in time.
        var sT = setTimeout, t = sT.turn = sT.turn || function(f){ 1 == s.push(f) && p(T) }
        , s = t.s = [], p = sT.poll, i = 0, f, T = function(){
            if(f = s[i++]){ f() }
            if(i == s.length || 99 == i){
                s = t.s = s.slice(i);
                i = 0;
            }
            if(s.length){ p(T) }
        }
    }());
    ;(function(){
        var u, sT = setTimeout, T = sT.turn;
        (sT.each = sT.each || function(l,f,e,S){ S = S || 9; (function t(s,L,r){
          if(L = (s = (l||[]).splice(0,S)).length){
              for(var i = 0; i < L; i++){
                  if(u !== (r = f(s[i]))){ break }
              }
              if(u === r){ T(t); return }
          } e && e(r);
        }())})();
    }());
        
    },{}],24:[function(require,module,exports){
    
    require('./shim');
    function State(){
        var t = +new Date;
        if(last < t){
            return N = 0, last = t + State.drift;
        }
        return last = t + ((N += 1) / D) + State.drift;
    }
    State.drift = 0;
    var NI = -Infinity, N = 0, D = 999, last = NI, u; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
    State.is = function(n, k, o){ // convenience function to get the state on a key on a node and return it.
        var tmp = (k && n && n._ && n._['>']) || o;
        if(!tmp){ return }
        return ('number' == typeof (tmp = tmp[k]))? tmp : NI;
    }
    State.ify = function(n, k, s, v, soul){ // put a key's state on a node.
        (n = n || {})._ = n._ || {}; // safety check or init.
        if(soul){ n._['#'] = soul } // set a soul if specified.
        var tmp = n._['>'] || (n._['>'] = {}); // grab the states data.
        if(u !== k && k !== '_'){
            if('number' == typeof s){ tmp[k] = s } // add the valid state.
            if(u !== v){ n[k] = v } // Note: Not its job to check for valid values!
        }
        return n;
    }
    module.exports = State;
        
    },{"./shim":23}],25:[function(require,module,exports){
    
    // Valid values are a subset of JSON: null, binary, number (!Infinity), text,
    // or a soul relation. Arrays need special algorithms to handle concurrency,
    // so they are not supported directly. Use an extension that supports them if
    // needed but research their problems first.
    module.exports = function (v) {
      // "deletes", nulling out keys.
      return v === null ||
        "string" === typeof v ||
        "boolean" === typeof v ||
        // we want +/- Infinity to be, but JSON does not support it, sad face.
        // can you guess what v === v checks for? ;)
        ("number" === typeof v && v != Infinity && v != -Infinity && v === v) ||
        (!!v && "string" == typeof v["#"] && Object.keys(v).length === 1 && v["#"]);
    }
        
    },{}],26:[function(require,module,exports){
    
    var Gun = require('./index');
    Gun.Mesh = require('./mesh');
    
    // TODO: resync upon reconnect online/offline
    //window.ononline = window.onoffline = function(){ console.log('online?', navigator.onLine) }
    
    Gun.on('opt', function(root){
        this.to.next(root);
        if(root.once){ return }
        var opt = root.opt;
        if(false === opt.WebSocket){ return }
    
        var env = Gun.window || {};
        var websocket = opt.WebSocket || env.WebSocket || env.webkitWebSocket || env.mozWebSocket;
        if(!websocket){ return }
        opt.WebSocket = websocket;
    
        var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);
    
        var wire = mesh.wire || opt.wire;
        mesh.wire = opt.wire = open;
        function open(peer){ try{
            if(!peer || !peer.url){ return wire && wire(peer) }
            var url = peer.url.replace(/^http/, 'ws');
            var wire = peer.wire = new opt.WebSocket(url);
            wire.onclose = function(){
                opt.mesh.bye(peer);
                reconnect(peer);
            };
            wire.onerror = function(error){
                reconnect(peer);
            };
            wire.onopen = function(){
                opt.mesh.hi(peer);
            }
            wire.onmessage = function(msg){
                if(!msg){ return }
                opt.mesh.hear(msg.data || msg, peer);
            };
            return wire;
        }catch(e){}}
    
        setTimeout(function(){ !opt.super && root.on('out', {dam:'hi'}) },1); // it can take a while to open a socket, so maybe no longer lazy load for perf reasons?
    
        var wait = 2 * 999;
        function reconnect(peer){
            clearTimeout(peer.defer);
            if(!opt.peers[peer.url]){ return }
            if(doc && peer.retry <= 0){ return }
            peer.retry = (peer.retry || opt.retry+1 || 60) - ((-peer.tried + (peer.tried = +new Date) < wait*4)?1:0);
            peer.defer = setTimeout(function to(){
                if(doc && doc.hidden){ return setTimeout(to,wait) }
                open(peer);
            }, wait);
        }
        var doc = (''+u !== typeof document) && document;
    });
    var noop = function(){}, u;
        
    },{"./index":14,"./mesh":17}]},{},[1])(1)
    });
  
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ejs = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    /*
      * EJS Embedded JavaScript templates
      * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
      *
      * Licensed under the Apache License, Version 2.0 (the "License");
      * you may not use this file except in compliance with the License.
      * You may obtain a copy of the License at
      *
      *         http://www.apache.org/licenses/LICENSE-2.0
      *
      * Unless required by applicable law or agreed to in writing, software
      * distributed under the License is distributed on an "AS IS" BASIS,
      * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      * See the License for the specific language governing permissions and
      * limitations under the License.
      *
    */
    
    'use strict';
    
    /**
     * @file Embedded JavaScript templating engine. {@link http://ejs.co}
     * @author Matthew Eernisse <mde@fleegix.org>
     * @author Tiancheng "Timothy" Gu <timothygu99@gmail.com>
     * @project EJS
     * @license {@link http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0}
     */
    
    /**
     * EJS internal functions.
     *
     * Technically this "module" lies in the same file as {@link module:ejs}, for
     * the sake of organization all the private functions re grouped into this
     * module.
     *
     * @module ejs-internal
     * @private
     */
    
    /**
     * Embedded JavaScript templating engine.
     *
     * @module ejs
     * @public
     */
    
    
    var fs = require('fs');
    var path = require('path');
    var utils = require('./utils');
    
    var scopeOptionWarned = false;
    /** @type {string} */
    var _VERSION_STRING = require('../package.json').version;
    var _DEFAULT_OPEN_DELIMITER = '<';
    var _DEFAULT_CLOSE_DELIMITER = '>';
    var _DEFAULT_DELIMITER = '%';
    var _DEFAULT_LOCALS_NAME = 'locals';
    var _NAME = 'ejs';
    var _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)';
    var _OPTS_PASSABLE_WITH_DATA = ['delimiter', 'scope', 'context', 'debug', 'compileDebug',
      'client', '_with', 'rmWhitespace', 'strict', 'filename', 'async'];
    // We don't allow 'cache' option to be passed in the data obj for
    // the normal `render` call, but this is where Express 2 & 3 put it
    // so we make an exception for `renderFile`
    var _OPTS_PASSABLE_WITH_DATA_EXPRESS = _OPTS_PASSABLE_WITH_DATA.concat('cache');
    var _BOM = /^\uFEFF/;
    var _JS_IDENTIFIER = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
    
    /**
     * EJS template function cache. This can be a LRU object from lru-cache NPM
     * module. By default, it is {@link module:utils.cache}, a simple in-process
     * cache that grows continuously.
     *
     * @type {Cache}
     */
    
    exports.cache = utils.cache;
    
    /**
     * Custom file loader. Useful for template preprocessing or restricting access
     * to a certain part of the filesystem.
     *
     * @type {fileLoader}
     */
    
    exports.fileLoader = fs.readFileSync;
    
    /**
     * Name of the object containing the locals.
     *
     * This variable is overridden by {@link Options}`.localsName` if it is not
     * `undefined`.
     *
     * @type {String}
     * @public
     */
    
    exports.localsName = _DEFAULT_LOCALS_NAME;
    
    /**
     * Promise implementation -- defaults to the native implementation if available
     * This is mostly just for testability
     *
     * @type {PromiseConstructorLike}
     * @public
     */
    
    exports.promiseImpl = (new Function('return this;'))().Promise;
    
    /**
     * Get the path to the included file from the parent file path and the
     * specified path.
     *
     * @param {String}  name     specified path
     * @param {String}  filename parent file path
     * @param {Boolean} [isDir=false] whether the parent file path is a directory
     * @return {String}
     */
    exports.resolveInclude = function(name, filename, isDir) {
      var dirname = path.dirname;
      var extname = path.extname;
      var resolve = path.resolve;
      var includePath = resolve(isDir ? filename : dirname(filename), name);
      var ext = extname(name);
      if (!ext) {
        includePath += '.ejs';
      }
      return includePath;
    };
    
    /**
     * Try to resolve file path on multiple directories
     *
     * @param  {String}        name  specified path
     * @param  {Array<String>} paths list of possible parent directory paths
     * @return {String}
     */
    function resolvePaths(name, paths) {
      var filePath;
      if (paths.some(function (v) {
        filePath = exports.resolveInclude(name, v, true);
        return fs.existsSync(filePath);
      })) {
        return filePath;
      }
    }
    
    /**
     * Get the path to the included file by Options
     *
     * @param  {String}  path    specified path
     * @param  {Options} options compilation options
     * @return {String}
     */
    function getIncludePath(path, options) {
      var includePath;
      var filePath;
      var views = options.views;
      var match = /^[A-Za-z]+:\\|^\//.exec(path);
    
      // Abs path
      if (match && match.length) {
        path = path.replace(/^\/*/, '');
        if (Array.isArray(options.root)) {
          includePath = resolvePaths(path, options.root);
        } else {
          includePath = exports.resolveInclude(path, options.root || '/', true);
        }
      }
      // Relative paths
      else {
        // Look relative to a passed filename first
        if (options.filename) {
          filePath = exports.resolveInclude(path, options.filename);
          if (fs.existsSync(filePath)) {
            includePath = filePath;
          }
        }
        // Then look in any views directories
        if (!includePath && Array.isArray(views)) {
          includePath = resolvePaths(path, views);
        }
        if (!includePath && typeof options.includer !== 'function') {
          throw new Error('Could not find the include file "' +
              options.escapeFunction(path) + '"');
        }
      }
      return includePath;
    }
    
    /**
     * Get the template from a string or a file, either compiled on-the-fly or
     * read from cache (if enabled), and cache the template if needed.
     *
     * If `template` is not set, the file specified in `options.filename` will be
     * read.
     *
     * If `options.cache` is true, this function reads the file from
     * `options.filename` so it must be set prior to calling this function.
     *
     * @memberof module:ejs-internal
     * @param {Options} options   compilation options
     * @param {String} [template] template source
     * @return {(TemplateFunction|ClientFunction)}
     * Depending on the value of `options.client`, either type might be returned.
     * @static
     */
    
    function handleCache(options, template) {
      var func;
      var filename = options.filename;
      var hasTemplate = arguments.length > 1;
    
      if (options.cache) {
        if (!filename) {
          throw new Error('cache option requires a filename');
        }
        func = exports.cache.get(filename);
        if (func) {
          return func;
        }
        if (!hasTemplate) {
          template = fileLoader(filename).toString().replace(_BOM, '');
        }
      }
      else if (!hasTemplate) {
        // istanbul ignore if: should not happen at all
        if (!filename) {
          throw new Error('Internal EJS error: no file name or template '
                        + 'provided');
        }
        template = fileLoader(filename).toString().replace(_BOM, '');
      }
      func = exports.compile(template, options);
      if (options.cache) {
        exports.cache.set(filename, func);
      }
      return func;
    }
    
    /**
     * Try calling handleCache with the given options and data and call the
     * callback with the result. If an error occurs, call the callback with
     * the error. Used by renderFile().
     *
     * @memberof module:ejs-internal
     * @param {Options} options    compilation options
     * @param {Object} data        template data
     * @param {RenderFileCallback} cb callback
     * @static
     */
    
    function tryHandleCache(options, data, cb) {
      var result;
      if (!cb) {
        if (typeof exports.promiseImpl == 'function') {
          return new exports.promiseImpl(function (resolve, reject) {
            try {
              result = handleCache(options)(data);
              resolve(result);
            }
            catch (err) {
              reject(err);
            }
          });
        }
        else {
          throw new Error('Please provide a callback function');
        }
      }
      else {
        try {
          result = handleCache(options)(data);
        }
        catch (err) {
          return cb(err);
        }
    
        cb(null, result);
      }
    }
    
    /**
     * fileLoader is independent
     *
     * @param {String} filePath ejs file path.
     * @return {String} The contents of the specified file.
     * @static
     */
    
    function fileLoader(filePath){
      return exports.fileLoader(filePath);
    }
    
    /**
     * Get the template function.
     *
     * If `options.cache` is `true`, then the template is cached.
     *
     * @memberof module:ejs-internal
     * @param {String}  path    path for the specified file
     * @param {Options} options compilation options
     * @return {(TemplateFunction|ClientFunction)}
     * Depending on the value of `options.client`, either type might be returned
     * @static
     */
    
    function includeFile(path, options) {
      var opts = utils.shallowCopy(utils.createNullProtoObjWherePossible(), options);
      opts.filename = getIncludePath(path, opts);
      if (typeof options.includer === 'function') {
        var includerResult = options.includer(path, opts.filename);
        if (includerResult) {
          if (includerResult.filename) {
            opts.filename = includerResult.filename;
          }
          if (includerResult.template) {
            return handleCache(opts, includerResult.template);
          }
        }
      }
      return handleCache(opts);
    }
    
    /**
     * Re-throw the given `err` in context to the `str` of ejs, `filename`, and
     * `lineno`.
     *
     * @implements {RethrowCallback}
     * @memberof module:ejs-internal
     * @param {Error}  err      Error object
     * @param {String} str      EJS source
     * @param {String} flnm     file name of the EJS file
     * @param {Number} lineno   line number of the error
     * @param {EscapeCallback} esc
     * @static
     */
    
    function rethrow(err, str, flnm, lineno, esc) {
      var lines = str.split('\n');
      var start = Math.max(lineno - 3, 0);
      var end = Math.min(lines.length, lineno + 3);
      var filename = esc(flnm);
      // Error context
      var context = lines.slice(start, end).map(function (line, i){
        var curr = i + start + 1;
        return (curr == lineno ? ' >> ' : '    ')
          + curr
          + '| '
          + line;
      }).join('\n');
    
      // Alter exception message
      err.path = filename;
      err.message = (filename || 'ejs') + ':'
        + lineno + '\n'
        + context + '\n\n'
        + err.message;
    
      throw err;
    }
    
    function stripSemi(str){
      return str.replace(/;(\s*$)/, '$1');
    }
    
    /**
     * Compile the given `str` of ejs into a template function.
     *
     * @param {String}  template EJS template
     *
     * @param {Options} [opts] compilation options
     *
     * @return {(TemplateFunction|ClientFunction)}
     * Depending on the value of `opts.client`, either type might be returned.
     * Note that the return type of the function also depends on the value of `opts.async`.
     * @public
     */
    
    exports.compile = function compile(template, opts) {
      var templ;
    
      // v1 compat
      // 'scope' is 'context'
      // FIXME: Remove this in a future version
      if (opts && opts.scope) {
        if (!scopeOptionWarned){
          console.warn('`scope` option is deprecated and will be removed in EJS 3');
          scopeOptionWarned = true;
        }
        if (!opts.context) {
          opts.context = opts.scope;
        }
        delete opts.scope;
      }
      templ = new Template(template, opts);
      return templ.compile();
    };
    
    /**
     * Render the given `template` of ejs.
     *
     * If you would like to include options but not data, you need to explicitly
     * call this function with `data` being an empty object or `null`.
     *
     * @param {String}   template EJS template
     * @param {Object}  [data={}] template data
     * @param {Options} [opts={}] compilation and rendering options
     * @return {(String|Promise<String>)}
     * Return value type depends on `opts.async`.
     * @public
     */
    
    exports.render = function (template, d, o) {
      var data = d || utils.createNullProtoObjWherePossible();
      var opts = o || utils.createNullProtoObjWherePossible();
    
      // No options object -- if there are optiony names
      // in the data, copy them to options
      if (arguments.length == 2) {
        utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA);
      }
    
      return handleCache(opts, template)(data);
    };
    
    /**
     * Render an EJS file at the given `path` and callback `cb(err, str)`.
     *
     * If you would like to include options but not data, you need to explicitly
     * call this function with `data` being an empty object or `null`.
     *
     * @param {String}             path     path to the EJS file
     * @param {Object}            [data={}] template data
     * @param {Options}           [opts={}] compilation and rendering options
     * @param {RenderFileCallback} cb callback
     * @public
     */
    
    exports.renderFile = function () {
      var args = Array.prototype.slice.call(arguments);
      var filename = args.shift();
      var cb;
      var opts = {filename: filename};
      var data;
      var viewOpts;
    
      // Do we have a callback?
      if (typeof arguments[arguments.length - 1] == 'function') {
        cb = args.pop();
      }
      // Do we have data/opts?
      if (args.length) {
        // Should always have data obj
        data = args.shift();
        // Normal passed opts (data obj + opts obj)
        if (args.length) {
          // Use shallowCopy so we don't pollute passed in opts obj with new vals
          utils.shallowCopy(opts, args.pop());
        }
        // Special casing for Express (settings + opts-in-data)
        else {
          // Express 3 and 4
          if (data.settings) {
            // Pull a few things from known locations
            if (data.settings.views) {
              opts.views = data.settings.views;
            }
            if (data.settings['view cache']) {
              opts.cache = true;
            }
            // Undocumented after Express 2, but still usable, esp. for
            // items that are unsafe to be passed along with data, like `root`
            viewOpts = data.settings['view options'];
            if (viewOpts) {
              utils.shallowCopy(opts, viewOpts);
            }
          }
          // Express 2 and lower, values set in app.locals, or people who just
          // want to pass options in their data. NOTE: These values will override
          // anything previously set in settings  or settings['view options']
          utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS);
        }
        opts.filename = filename;
      }
      else {
        data = utils.createNullProtoObjWherePossible();
      }
    
      return tryHandleCache(opts, data, cb);
    };
    
    /**
     * Clear intermediate JavaScript cache. Calls {@link Cache#reset}.
     * @public
     */
    
    /**
     * EJS template class
     * @public
     */
    exports.Template = Template;
    
    exports.clearCache = function () {
      exports.cache.reset();
    };
    
    function Template(text, opts) {
      opts = opts || utils.createNullProtoObjWherePossible();
      var options = utils.createNullProtoObjWherePossible();
      this.templateText = text;
      /** @type {string | null} */
      this.mode = null;
      this.truncate = false;
      this.currentLine = 1;
      this.source = '';
      options.client = opts.client || false;
      options.escapeFunction = opts.escape || opts.escapeFunction || utils.escapeXML;
      options.compileDebug = opts.compileDebug !== false;
      options.debug = !!opts.debug;
      options.filename = opts.filename;
      options.openDelimiter = opts.openDelimiter || exports.openDelimiter || _DEFAULT_OPEN_DELIMITER;
      options.closeDelimiter = opts.closeDelimiter || exports.closeDelimiter || _DEFAULT_CLOSE_DELIMITER;
      options.delimiter = opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER;
      options.strict = opts.strict || false;
      options.context = opts.context;
      options.cache = opts.cache || false;
      options.rmWhitespace = opts.rmWhitespace;
      options.root = opts.root;
      options.includer = opts.includer;
      options.outputFunctionName = opts.outputFunctionName;
      options.localsName = opts.localsName || exports.localsName || _DEFAULT_LOCALS_NAME;
      options.views = opts.views;
      options.async = opts.async;
      options.destructuredLocals = opts.destructuredLocals;
      options.legacyInclude = typeof opts.legacyInclude != 'undefined' ? !!opts.legacyInclude : true;
    
      if (options.strict) {
        options._with = false;
      }
      else {
        options._with = typeof opts._with != 'undefined' ? opts._with : true;
      }
    
      this.opts = options;
    
      this.regex = this.createRegex();
    }
    
    Template.modes = {
      EVAL: 'eval',
      ESCAPED: 'escaped',
      RAW: 'raw',
      COMMENT: 'comment',
      LITERAL: 'literal'
    };
    
    Template.prototype = {
      createRegex: function () {
        var str = _REGEX_STRING;
        var delim = utils.escapeRegExpChars(this.opts.delimiter);
        var open = utils.escapeRegExpChars(this.opts.openDelimiter);
        var close = utils.escapeRegExpChars(this.opts.closeDelimiter);
        str = str.replace(/%/g, delim)
          .replace(/</g, open)
          .replace(/>/g, close);
        return new RegExp(str);
      },
    
      compile: function () {
        /** @type {string} */
        var src;
        /** @type {ClientFunction} */
        var fn;
        var opts = this.opts;
        var prepended = '';
        var appended = '';
        /** @type {EscapeCallback} */
        var escapeFn = opts.escapeFunction;
        /** @type {FunctionConstructor} */
        var ctor;
        /** @type {string} */
        var sanitizedFilename = opts.filename ? JSON.stringify(opts.filename) : 'undefined';
    
        if (!this.source) {
          this.generateSource();
          prepended +=
            '  var __output = "";\n' +
            '  function __append(s) { if (s !== undefined && s !== null) __output += s }\n';
          if (opts.outputFunctionName) {
            if (!_JS_IDENTIFIER.test(opts.outputFunctionName)) {
              throw new Error('outputFunctionName is not a valid JS identifier.');
            }
            prepended += '  var ' + opts.outputFunctionName + ' = __append;' + '\n';
          }
          if (opts.localsName && !_JS_IDENTIFIER.test(opts.localsName)) {
            throw new Error('localsName is not a valid JS identifier.');
          }
          if (opts.destructuredLocals && opts.destructuredLocals.length) {
            var destructuring = '  var __locals = (' + opts.localsName + ' || {}),\n';
            for (var i = 0; i < opts.destructuredLocals.length; i++) {
              var name = opts.destructuredLocals[i];
              if (!_JS_IDENTIFIER.test(name)) {
                throw new Error('destructuredLocals[' + i + '] is not a valid JS identifier.');
              }
              if (i > 0) {
                destructuring += ',\n  ';
              }
              destructuring += name + ' = __locals.' + name;
            }
            prepended += destructuring + ';\n';
          }
          if (opts._with !== false) {
            prepended +=  '  with (' + opts.localsName + ' || {}) {' + '\n';
            appended += '  }' + '\n';
          }
          appended += '  return __output;' + '\n';
          this.source = prepended + this.source + appended;
        }
    
        if (opts.compileDebug) {
          src = 'var __line = 1' + '\n'
            + '  , __lines = ' + JSON.stringify(this.templateText) + '\n'
            + '  , __filename = ' + sanitizedFilename + ';' + '\n'
            + 'try {' + '\n'
            + this.source
            + '} catch (e) {' + '\n'
            + '  rethrow(e, __lines, __filename, __line, escapeFn);' + '\n'
            + '}' + '\n';
        }
        else {
          src = this.source;
        }
    
        if (opts.client) {
          src = 'escapeFn = escapeFn || ' + escapeFn.toString() + ';' + '\n' + src;
          if (opts.compileDebug) {
            src = 'rethrow = rethrow || ' + rethrow.toString() + ';' + '\n' + src;
          }
        }
    
        if (opts.strict) {
          src = '"use strict";\n' + src;
        }
        if (opts.debug) {
          console.log(src);
        }
        if (opts.compileDebug && opts.filename) {
          src = src + '\n'
            + '//# sourceURL=' + sanitizedFilename + '\n';
        }
    
        try {
          if (opts.async) {
            // Have to use generated function for this, since in envs without support,
            // it breaks in parsing
            try {
              ctor = (new Function('return (async function(){}).constructor;'))();
            }
            catch(e) {
              if (e instanceof SyntaxError) {
                throw new Error('This environment does not support async/await');
              }
              else {
                throw e;
              }
            }
          }
          else {
            ctor = Function;
          }
          fn = new ctor(opts.localsName + ', escapeFn, include, rethrow', src);
        }
        catch(e) {
          // istanbul ignore else
          if (e instanceof SyntaxError) {
            if (opts.filename) {
              e.message += ' in ' + opts.filename;
            }
            e.message += ' while compiling ejs\n\n';
            e.message += 'If the above error is not helpful, you may want to try EJS-Lint:\n';
            e.message += 'https://github.com/RyanZim/EJS-Lint';
            if (!opts.async) {
              e.message += '\n';
              e.message += 'Or, if you meant to create an async function, pass `async: true` as an option.';
            }
          }
          throw e;
        }
    
        // Return a callable function which will execute the function
        // created by the source-code, with the passed data as locals
        // Adds a local `include` function which allows full recursive include
        var returnedFn = opts.client ? fn : function anonymous(data) {
          var include = function (path, includeData) {
            var d = utils.shallowCopy(utils.createNullProtoObjWherePossible(), data);
            if (includeData) {
              d = utils.shallowCopy(d, includeData);
            }
            return includeFile(path, opts)(d);
          };
          return fn.apply(opts.context,
            [data || utils.createNullProtoObjWherePossible(), escapeFn, include, rethrow]);
        };
        if (opts.filename && typeof Object.defineProperty === 'function') {
          var filename = opts.filename;
          var basename = path.basename(filename, path.extname(filename));
          try {
            Object.defineProperty(returnedFn, 'name', {
              value: basename,
              writable: false,
              enumerable: false,
              configurable: true
            });
          } catch (e) {/* ignore */}
        }
        return returnedFn;
      },
    
      generateSource: function () {
        var opts = this.opts;
    
        if (opts.rmWhitespace) {
          // Have to use two separate replace here as `^` and `$` operators don't
          // work well with `\r` and empty lines don't work well with the `m` flag.
          this.templateText =
            this.templateText.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '');
        }
    
        // Slurp spaces and tabs before <%_ and after _%>
        this.templateText =
          this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');
    
        var self = this;
        var matches = this.parseTemplateText();
        var d = this.opts.delimiter;
        var o = this.opts.openDelimiter;
        var c = this.opts.closeDelimiter;
    
        if (matches && matches.length) {
          matches.forEach(function (line, index) {
            var closing;
            // If this is an opening tag, check for closing tags
            // FIXME: May end up with some false positives here
            // Better to store modes as k/v with openDelimiter + delimiter as key
            // Then this can simply check against the map
            if ( line.indexOf(o + d) === 0        // If it is a tag
              && line.indexOf(o + d + d) !== 0) { // and is not escaped
              closing = matches[index + 2];
              if (!(closing == d + c || closing == '-' + d + c || closing == '_' + d + c)) {
                throw new Error('Could not find matching close tag for "' + line + '".');
              }
            }
            self.scanLine(line);
          });
        }
    
      },
    
      parseTemplateText: function () {
        var str = this.templateText;
        var pat = this.regex;
        var result = pat.exec(str);
        var arr = [];
        var firstPos;
    
        while (result) {
          firstPos = result.index;
    
          if (firstPos !== 0) {
            arr.push(str.substring(0, firstPos));
            str = str.slice(firstPos);
          }
    
          arr.push(result[0]);
          str = str.slice(result[0].length);
          result = pat.exec(str);
        }
    
        if (str) {
          arr.push(str);
        }
    
        return arr;
      },
    
      _addOutput: function (line) {
        if (this.truncate) {
          // Only replace single leading linebreak in the line after
          // -%> tag -- this is the single, trailing linebreak
          // after the tag that the truncation mode replaces
          // Handle Win / Unix / old Mac linebreaks -- do the \r\n
          // combo first in the regex-or
          line = line.replace(/^(?:\r\n|\r|\n)/, '');
          this.truncate = false;
        }
        if (!line) {
          return line;
        }
    
        // Preserve literal slashes
        line = line.replace(/\\/g, '\\\\');
    
        // Convert linebreaks
        line = line.replace(/\n/g, '\\n');
        line = line.replace(/\r/g, '\\r');
    
        // Escape double-quotes
        // - this will be the delimiter during execution
        line = line.replace(/"/g, '\\"');
        this.source += '    ; __append("' + line + '")' + '\n';
      },
    
      scanLine: function (line) {
        var self = this;
        var d = this.opts.delimiter;
        var o = this.opts.openDelimiter;
        var c = this.opts.closeDelimiter;
        var newLineCount = 0;
    
        newLineCount = (line.split('\n').length - 1);
    
        switch (line) {
        case o + d:
        case o + d + '_':
          this.mode = Template.modes.EVAL;
          break;
        case o + d + '=':
          this.mode = Template.modes.ESCAPED;
          break;
        case o + d + '-':
          this.mode = Template.modes.RAW;
          break;
        case o + d + '#':
          this.mode = Template.modes.COMMENT;
          break;
        case o + d + d:
          this.mode = Template.modes.LITERAL;
          this.source += '    ; __append("' + line.replace(o + d + d, o + d) + '")' + '\n';
          break;
        case d + d + c:
          this.mode = Template.modes.LITERAL;
          this.source += '    ; __append("' + line.replace(d + d + c, d + c) + '")' + '\n';
          break;
        case d + c:
        case '-' + d + c:
        case '_' + d + c:
          if (this.mode == Template.modes.LITERAL) {
            this._addOutput(line);
          }
    
          this.mode = null;
          this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
          break;
        default:
          // In script mode, depends on type of tag
          if (this.mode) {
            // If '//' is found without a line break, add a line break.
            switch (this.mode) {
            case Template.modes.EVAL:
            case Template.modes.ESCAPED:
            case Template.modes.RAW:
              if (line.lastIndexOf('//') > line.lastIndexOf('\n')) {
                line += '\n';
              }
            }
            switch (this.mode) {
            // Just executing code
            case Template.modes.EVAL:
              this.source += '    ; ' + line + '\n';
              break;
              // Exec, esc, and output
            case Template.modes.ESCAPED:
              this.source += '    ; __append(escapeFn(' + stripSemi(line) + '))' + '\n';
              break;
              // Exec and output
            case Template.modes.RAW:
              this.source += '    ; __append(' + stripSemi(line) + ')' + '\n';
              break;
            case Template.modes.COMMENT:
              // Do nothing
              break;
              // Literal <%% mode, append as raw output
            case Template.modes.LITERAL:
              this._addOutput(line);
              break;
            }
          }
          // In string mode, just add the output
          else {
            this._addOutput(line);
          }
        }
    
        if (self.opts.compileDebug && newLineCount) {
          this.currentLine += newLineCount;
          this.source += '    ; __line = ' + this.currentLine + '\n';
        }
      }
    };
    
    /**
     * Escape characters reserved in XML.
     *
     * This is simply an export of {@link module:utils.escapeXML}.
     *
     * If `markup` is `undefined` or `null`, the empty string is returned.
     *
     * @param {String} markup Input string
     * @return {String} Escaped string
     * @public
     * @func
     * */
    exports.escapeXML = utils.escapeXML;
    
    /**
     * Express.js support.
     *
     * This is an alias for {@link module:ejs.renderFile}, in order to support
     * Express.js out-of-the-box.
     *
     * @func
     */
    
    exports.__express = exports.renderFile;
    
    /**
     * Version of EJS.
     *
     * @readonly
     * @type {String}
     * @public
     */
    
    exports.VERSION = _VERSION_STRING;
    
    /**
     * Name for detection of EJS.
     *
     * @readonly
     * @type {String}
     * @public
     */
    
    exports.name = _NAME;
    
    /* istanbul ignore if */
    if (typeof window != 'undefined') {
      window.ejs = exports;
    }
    
    },{"../package.json":6,"./utils":2,"fs":3,"path":4}],2:[function(require,module,exports){
    /*
      * EJS Embedded JavaScript templates
      * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
      *
      * Licensed under the Apache License, Version 2.0 (the "License");
      * you may not use this file except in compliance with the License.
      * You may obtain a copy of the License at
      *
      *         http://www.apache.org/licenses/LICENSE-2.0
      *
      * Unless required by applicable law or agreed to in writing, software
      * distributed under the License is distributed on an "AS IS" BASIS,
      * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      * See the License for the specific language governing permissions and
      * limitations under the License.
      *
    */
    
    /**
     * Private utility functions
     * @module utils
     * @private
     */
    
    'use strict';
    
    var regExpChars = /[|\\{}()[\]^$+*?.]/g;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var hasOwn = function (obj, key) { return hasOwnProperty.apply(obj, [key]); };
    
    /**
     * Escape characters reserved in regular expressions.
     *
     * If `string` is `undefined` or `null`, the empty string is returned.
     *
     * @param {String} string Input string
     * @return {String} Escaped string
     * @static
     * @private
     */
    exports.escapeRegExpChars = function (string) {
      // istanbul ignore if
      if (!string) {
        return '';
      }
      return String(string).replace(regExpChars, '\\$&');
    };
    
    var _ENCODE_HTML_RULES = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&#34;',
      "'": '&#39;'
    };
    var _MATCH_HTML = /[&<>'"]/g;
    
    function encode_char(c) {
      return _ENCODE_HTML_RULES[c] || c;
    }
    
    /**
     * Stringified version of constants used by {@link module:utils.escapeXML}.
     *
     * It is used in the process of generating {@link ClientFunction}s.
     *
     * @readonly
     * @type {String}
     */
    
    var escapeFuncStr =
      'var _ENCODE_HTML_RULES = {\n'
    + '      "&": "&amp;"\n'
    + '    , "<": "&lt;"\n'
    + '    , ">": "&gt;"\n'
    + '    , \'"\': "&#34;"\n'
    + '    , "\'": "&#39;"\n'
    + '    }\n'
    + '  , _MATCH_HTML = /[&<>\'"]/g;\n'
    + 'function encode_char(c) {\n'
    + '  return _ENCODE_HTML_RULES[c] || c;\n'
    + '};\n';
    
    /**
     * Escape characters reserved in XML.
     *
     * If `markup` is `undefined` or `null`, the empty string is returned.
     *
     * @implements {EscapeCallback}
     * @param {String} markup Input string
     * @return {String} Escaped string
     * @static
     * @private
     */
    
    exports.escapeXML = function (markup) {
      return markup == undefined
        ? ''
        : String(markup)
          .replace(_MATCH_HTML, encode_char);
    };
    exports.escapeXML.toString = function () {
      return Function.prototype.toString.call(this) + ';\n' + escapeFuncStr;
    };
    
    /**
     * Naive copy of properties from one object to another.
     * Does not recurse into non-scalar properties
     * Does not check to see if the property has a value before copying
     *
     * @param  {Object} to   Destination object
     * @param  {Object} from Source object
     * @return {Object}      Destination object
     * @static
     * @private
     */
    exports.shallowCopy = function (to, from) {
      from = from || {};
      if ((to !== null) && (to !== undefined)) {
        for (var p in from) {
          if (!hasOwn(from, p)) {
            continue;
          }
          if (p === '__proto__' || p === 'constructor') {
            continue;
          }
          to[p] = from[p];
        }
      }
      return to;
    };
    
    /**
     * Naive copy of a list of key names, from one object to another.
     * Only copies property if it is actually defined
     * Does not recurse into non-scalar properties
     *
     * @param  {Object} to   Destination object
     * @param  {Object} from Source object
     * @param  {Array} list List of properties to copy
     * @return {Object}      Destination object
     * @static
     * @private
     */
    exports.shallowCopyFromList = function (to, from, list) {
      list = list || [];
      from = from || {};
      if ((to !== null) && (to !== undefined)) {
        for (var i = 0; i < list.length; i++) {
          var p = list[i];
          if (typeof from[p] != 'undefined') {
            if (!hasOwn(from, p)) {
              continue;
            }
            if (p === '__proto__' || p === 'constructor') {
              continue;
            }
            to[p] = from[p];
          }
        }
      }
      return to;
    };
    
    /**
     * Simple in-process cache implementation. Does not implement limits of any
     * sort.
     *
     * @implements {Cache}
     * @static
     * @private
     */
    exports.cache = {
      _data: {},
      set: function (key, val) {
        this._data[key] = val;
      },
      get: function (key) {
        return this._data[key];
      },
      remove: function (key) {
        delete this._data[key];
      },
      reset: function () {
        this._data = {};
      }
    };
    
    /**
     * Transforms hyphen case variable into camel case.
     *
     * @param {String} string Hyphen case string
     * @return {String} Camel case string
     * @static
     * @private
     */
    exports.hyphenToCamel = function (str) {
      return str.replace(/-[a-z]/g, function (match) { return match[1].toUpperCase(); });
    };
    
    /**
     * Returns a null-prototype object in runtimes that support it
     *
     * @return {Object} Object, prototype will be set to null where possible
     * @static
     * @private
     */
    exports.createNullProtoObjWherePossible = (function () {
      if (typeof Object.create == 'function') {
        return function () {
          return Object.create(null);
        };
      }
      if (!({__proto__: null} instanceof Object)) {
        return function () {
          return {__proto__: null};
        };
      }
      // Not possible, just pass through
      return function () {
        return {};
      };
    })();
    
    
    
    },{}],3:[function(require,module,exports){
    
    },{}],4:[function(require,module,exports){
    (function (process){
    // .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
    // backported and transplited with Babel, with backwards-compat fixes
    
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
    
    // resolves . and .. elements in a path array with directory names there
    // must be no slashes, empty elements, or device names (c:\) in the array
    // (so also no leading and trailing slashes - it does not distinguish
    // relative and absolute paths)
    function normalizeArray(parts, allowAboveRoot) {
      // if the path tries to go above the root, `up` ends up > 0
      var up = 0;
      for (var i = parts.length - 1; i >= 0; i--) {
        var last = parts[i];
        if (last === '.') {
          parts.splice(i, 1);
        } else if (last === '..') {
          parts.splice(i, 1);
          up++;
        } else if (up) {
          parts.splice(i, 1);
          up--;
        }
      }
    
      // if the path is allowed to go above the root, restore leading ..s
      if (allowAboveRoot) {
        for (; up--; up) {
          parts.unshift('..');
        }
      }
    
      return parts;
    }
    
    // path.resolve([from ...], to)
    // posix version
    exports.resolve = function() {
      var resolvedPath = '',
          resolvedAbsolute = false;
    
      for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = (i >= 0) ? arguments[i] : process.cwd();
    
        // Skip empty and invalid entries
        if (typeof path !== 'string') {
          throw new TypeError('Arguments to path.resolve must be strings');
        } else if (!path) {
          continue;
        }
    
        resolvedPath = path + '/' + resolvedPath;
        resolvedAbsolute = path.charAt(0) === '/';
      }
    
      // At this point the path should be resolved to a full absolute path, but
      // handle relative paths to be safe (might happen when process.cwd() fails)
    
      // Normalize the path
      resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
        return !!p;
      }), !resolvedAbsolute).join('/');
    
      return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
    };
    
    // path.normalize(path)
    // posix version
    exports.normalize = function(path) {
      var isAbsolute = exports.isAbsolute(path),
          trailingSlash = substr(path, -1) === '/';
    
      // Normalize the path
      path = normalizeArray(filter(path.split('/'), function(p) {
        return !!p;
      }), !isAbsolute).join('/');
    
      if (!path && !isAbsolute) {
        path = '.';
      }
      if (path && trailingSlash) {
        path += '/';
      }
    
      return (isAbsolute ? '/' : '') + path;
    };
    
    // posix version
    exports.isAbsolute = function(path) {
      return path.charAt(0) === '/';
    };
    
    // posix version
    exports.join = function() {
      var paths = Array.prototype.slice.call(arguments, 0);
      return exports.normalize(filter(paths, function(p, index) {
        if (typeof p !== 'string') {
          throw new TypeError('Arguments to path.join must be strings');
        }
        return p;
      }).join('/'));
    };
    
    
    // path.relative(from, to)
    // posix version
    exports.relative = function(from, to) {
      from = exports.resolve(from).substr(1);
      to = exports.resolve(to).substr(1);
    
      function trim(arr) {
        var start = 0;
        for (; start < arr.length; start++) {
          if (arr[start] !== '') break;
        }
    
        var end = arr.length - 1;
        for (; end >= 0; end--) {
          if (arr[end] !== '') break;
        }
    
        if (start > end) return [];
        return arr.slice(start, end - start + 1);
      }
    
      var fromParts = trim(from.split('/'));
      var toParts = trim(to.split('/'));
    
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
    
      var outputParts = [];
      for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push('..');
      }
    
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
    
      return outputParts.join('/');
    };
    
    exports.sep = '/';
    exports.delimiter = ':';
    
    exports.dirname = function (path) {
      if (typeof path !== 'string') path = path + '';
      if (path.length === 0) return '.';
      var code = path.charCodeAt(0);
      var hasRoot = code === 47 /*/*/;
      var end = -1;
      var matchedSlash = true;
      for (var i = path.length - 1; i >= 1; --i) {
        code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            if (!matchedSlash) {
              end = i;
              break;
            }
          } else {
          // We saw the first non-path separator
          matchedSlash = false;
        }
      }
    
      if (end === -1) return hasRoot ? '/' : '.';
      if (hasRoot && end === 1) {
        // return '//';
        // Backwards-compat fix:
        return '/';
      }
      return path.slice(0, end);
    };
    
    function basename(path) {
      if (typeof path !== 'string') path = path + '';
    
      var start = 0;
      var end = -1;
      var matchedSlash = true;
      var i;
    
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }
    
      if (end === -1) return '';
      return path.slice(start, end);
    }
    
    // Uses a mixed approach for backwards-compatibility, as ext behavior changed
    // in new Node.js versions, so only basename() above is backported here
    exports.basename = function (path, ext) {
      var f = basename(path);
      if (ext && f.substr(-1 * ext.length) === ext) {
        f = f.substr(0, f.length - ext.length);
      }
      return f;
    };
    
    exports.extname = function (path) {
      if (typeof path !== 'string') path = path + '';
      var startDot = -1;
      var startPart = 0;
      var end = -1;
      var matchedSlash = true;
      // Track the state of characters (if any) we see before our first dot and
      // after any path separator we find
      var preDotState = 0;
      for (var i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
        if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // extension
          matchedSlash = false;
          end = i + 1;
        }
        if (code === 46 /*.*/) {
            // If this is our first dot, mark it as the start of our extension
            if (startDot === -1)
              startDot = i;
            else if (preDotState !== 1)
              preDotState = 1;
        } else if (startDot !== -1) {
          // We saw a non-dot and non-path separator before our dot, so we should
          // have a good chance at having a non-empty extension
          preDotState = -1;
        }
      }
    
      if (startDot === -1 || end === -1 ||
          // We saw a non-dot character immediately before the dot
          preDotState === 0 ||
          // The (right-most) trimmed path component is exactly '..'
          preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return '';
      }
      return path.slice(startDot, end);
    };
    
    function filter (xs, f) {
        if (xs.filter) return xs.filter(f);
        var res = [];
        for (var i = 0; i < xs.length; i++) {
            if (f(xs[i], i, xs)) res.push(xs[i]);
        }
        return res;
    }
    
    // String.prototype.substr - negative index don't work in IE8
    var substr = 'ab'.substr(-1) === 'b'
        ? function (str, start, len) { return str.substr(start, len) }
        : function (str, start, len) {
            if (start < 0) start = str.length + start;
            return str.substr(start, len);
        }
    ;
    
    }).call(this,require('_process'))
    },{"_process":5}],5:[function(require,module,exports){
    // shim for using process in browser
    var process = module.exports = {};
    
    // cached from whatever global is present so that test runners that stub it
    // don't break things.  But we need to wrap it in a try catch in case it is
    // wrapped in strict mode code which doesn't define any globals.  It's inside a
    // function because try/catches deoptimize in certain engines.
    
    var cachedSetTimeout;
    var cachedClearTimeout;
    
    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    (function () {
        try {
            if (typeof setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
            } else {
                cachedSetTimeout = defaultSetTimout;
            }
        } catch (e) {
            cachedSetTimeout = defaultSetTimout;
        }
        try {
            if (typeof clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
            } else {
                cachedClearTimeout = defaultClearTimeout;
            }
        } catch (e) {
            cachedClearTimeout = defaultClearTimeout;
        }
    } ())
    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }
    
    
    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }
    
    
    
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    
    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }
    
    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
    
        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    
    process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    };
    
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};
    
    function noop() {}
    
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;
    
    process.listeners = function (name) { return [] }
    
    process.binding = function (name) {
        throw new Error('process.binding is not supported');
    };
    
    process.cwd = function () { return '/' };
    process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
    };
    process.umask = function() { return 0; };
    
    },{}],6:[function(require,module,exports){
    module.exports={
      "name": "ejs",
      "description": "Embedded JavaScript templates",
      "keywords": [
        "template",
        "engine",
        "ejs"
      ],
      "version": "3.1.8",
      "author": "Matthew Eernisse <mde@fleegix.org> (http://fleegix.org)",
      "license": "Apache-2.0",
      "bin": {
        "ejs": "./bin/cli.js"
      },
      "main": "./lib/ejs.js",
      "jsdelivr": "ejs.min.js",
      "unpkg": "ejs.min.js",
      "repository": {
        "type": "git",
        "url": "git://github.com/mde/ejs.git"
      },
      "bugs": "https://github.com/mde/ejs/issues",
      "homepage": "https://github.com/mde/ejs",
      "dependencies": {
        "jake": "^10.8.5"
      },
      "devDependencies": {
        "browserify": "^16.5.1",
        "eslint": "^6.8.0",
        "git-directory-deploy": "^1.5.1",
        "jsdoc": "^3.6.7",
        "lru-cache": "^4.0.1",
        "mocha": "^7.1.1",
        "uglify-js": "^3.3.16"
      },
      "engines": {
        "node": ">=0.10.0"
      },
      "scripts": {
        "test": "mocha"
      }
    }
    
    },{}]},{},[1])(1)
    });
    
    return window.GUN;

})
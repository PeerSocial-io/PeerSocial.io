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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ3VuL2d1bi9ndW4uanMiLCJzcmMvZ3VuL2d1bi9saWIvbGV4LmpzIiwic3JjL2d1bi9ndW4vbGliL2xvYWQuanMiLCJzcmMvZ3VuL2d1bi9saWIvbm90LmpzIiwic3JjL2d1bi9ndW4vbGliL29wZW4uanMiLCJzcmMvZ3VuL2d1bi9saWIvdW5zZXQuanMiLCJzcmMvZ3VuL2d1bi9udHMuanMiLCJzcmMvZ3VuL2d1bi9zZWEuanMiLCJzcmMvZ3VuL2d1bi9zcmMvYXNrLmpzIiwic3JjL2d1bi9ndW4vc3JjL2JhY2suanMiLCJzcmMvZ3VuL2d1bi9zcmMvY2hhaW4uanMiLCJzcmMvZ3VuL2d1bi9zcmMvZHVwLmpzIiwic3JjL2d1bi9ndW4vc3JjL2dldC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9pbmRleC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZ3VuL2d1bi9zcmMvbWFwLmpzIiwic3JjL2d1bi9ndW4vc3JjL21lc2guanMiLCJzcmMvZ3VuL2d1bi9zcmMvb24uanMiLCJzcmMvZ3VuL2d1bi9zcmMvb250by5qcyIsInNyYy9ndW4vZ3VuL3NyYy9wdXQuanMiLCJzcmMvZ3VuL2d1bi9zcmMvcm9vdC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9zZXQuanMiLCJzcmMvZ3VuL2d1bi9zcmMvc2hpbS5qcyIsInNyYy9ndW4vZ3VuL3NyYy9zdGF0ZS5qcyIsInNyYy9ndW4vZ3VuL3NyYy92YWxpZC5qcyIsInNyYy9ndW4vZ3VuL3NyYy93ZWJzb2NrZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvL2RlZmF1bHQgZ3VuXG52YXIgR3VuID0gICByZXF1aXJlKCcuL3NyYy9yb290Jyk7XG5yZXF1aXJlKCcuL3NyYy9zaGltJyk7XG5yZXF1aXJlKCcuL3NyYy9vbnRvJyk7XG5yZXF1aXJlKCcuL3NyYy92YWxpZCcpO1xucmVxdWlyZSgnLi9zcmMvc3RhdGUnKTtcbnJlcXVpcmUoJy4vc3JjL2R1cCcpO1xucmVxdWlyZSgnLi9zcmMvYXNrJyk7XG5yZXF1aXJlKCcuL3NyYy9jaGFpbicpO1xucmVxdWlyZSgnLi9zcmMvYmFjaycpO1xucmVxdWlyZSgnLi9zcmMvcHV0Jyk7XG5yZXF1aXJlKCcuL3NyYy9nZXQnKTtcbnJlcXVpcmUoJy4vc3JjL29uJyk7XG5yZXF1aXJlKCcuL3NyYy9tYXAnKTtcbnJlcXVpcmUoJy4vc3JjL3NldCcpO1xucmVxdWlyZSgnLi9zcmMvbWVzaCcpO1xucmVxdWlyZSgnLi9zcmMvd2Vic29ja2V0Jyk7XG5yZXF1aXJlKCcuL3NyYy9sb2NhbFN0b3JhZ2UnKTtcblxuLy9kZWZhdWx0IGV4dHJhIGd1biBsaXMgdG8gaW5jbHVkZVxucmVxdWlyZSgnLi9saWIvbGV4Jyk7XG5cbnJlcXVpcmUoXCIuL250c1wiKTtcbnJlcXVpcmUoXCIuL2xpYi91bnNldFwiKTtcbnJlcXVpcmUoXCIuL2xpYi9ub3RcIik7XG5yZXF1aXJlKFwiLi9saWIvb3BlblwiKTtcbnJlcXVpcmUoXCIuL2xpYi9sb2FkXCIpO1xuXG4vL2luY2x1ZGUgc2VhIGluIHRoZSBidWlsZFxucmVxdWlyZSgnLi9zZWEnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHdW47XG4iLCIoZnVuY3Rpb24gKEd1biwgdSkge1xuICAgIC8qKlxuICAgICAqIFxuICAgICAqICBjcmVkaXRzOiBcbiAgICAgKiAgICAgIGdpdGh1YjpibWF0dXNpYWtcbiAgICAgKiBcbiAgICAgKi8gICAgXG4gICAgdmFyIGxleCA9IChndW4pID0+IHtcbiAgICAgICAgZnVuY3Rpb24gTGV4KCkge31cblxuICAgICAgICBMZXgucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShPYmplY3QucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBMZXhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIExleC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5tb3JlID0gZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIHRoaXNbXCI+XCJdID0gbTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUubGVzcyA9IGZ1bmN0aW9uIChsZSkge1xuICAgICAgICAgICAgdGhpc1tcIjxcIl0gPSBsZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUuaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbCA9IG5ldyBMZXgoKTtcbiAgICAgICAgICAgIHRoaXNbXCIuXCJdID0gbDtcbiAgICAgICAgICAgIHJldHVybiBsO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUub2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbCA9IG5ldyBMZXgoKTtcbiAgICAgICAgICAgIHRoaXMuaGFzaChsKVxuICAgICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5oYXNoID0gZnVuY3Rpb24gKGgpIHtcbiAgICAgICAgICAgIHRoaXNbXCIjXCJdID0gaDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUucHJlZml4ID0gZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHRoaXNbXCIqXCJdID0gcDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUucmV0dXJuID0gZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgIHRoaXNbXCI9XCJdID0gcjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUubGltaXQgPSBmdW5jdGlvbiAobCkge1xuICAgICAgICAgICAgdGhpc1tcIiVcIl0gPSBsO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5yZXZlcnNlID0gZnVuY3Rpb24gKHJ2KSB7XG4gICAgICAgICAgICB0aGlzW1wiLVwiXSA9IHJ2IHx8IDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBMZXgucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHRoaXNbXCIrXCJdID0gaTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBndW4ubWFwKHRoaXMsIC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUubWF0Y2ggPSBsZXgubWF0Y2g7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbmV3IExleCgpO1xuICAgIH07XG5cbiAgICBsZXgubWF0Y2ggPSBmdW5jdGlvbih0LG8peyB2YXIgdG1wLCB1O1xuICAgICAgICBvID0gbyB8fCB0aGlzIHx8IHt9OyAgICAgICAgICAgIFxuICAgICAgICBpZignc3RyaW5nJyA9PSB0eXBlb2Ygbyl7IG8gPSB7Jz0nOiBvfSB9XG4gICAgICAgIGlmKCdzdHJpbmcnICE9PSB0eXBlb2YgdCl7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIHRtcCA9IChvWyc9J10gfHwgb1snKiddIHx8IG9bJz4nXSB8fCBvWyc8J10pO1xuICAgICAgICBpZih0ID09PSB0bXApeyByZXR1cm4gdHJ1ZSB9XG4gICAgICAgIGlmKHUgIT09IG9bJz0nXSl7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIHRtcCA9IChvWycqJ10gfHwgb1snPiddKTtcbiAgICAgICAgaWYodC5zbGljZSgwLCAodG1wfHwnJykubGVuZ3RoKSA9PT0gdG1wKXsgcmV0dXJuIHRydWUgfVxuICAgICAgICBpZih1ICE9PSBvWycqJ10peyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBpZih1ICE9PSBvWyc+J10gJiYgdSAhPT0gb1snPCddKXtcbiAgICAgICAgICAgIHJldHVybiAodCA+PSBvWyc+J10gJiYgdCA8PSBvWyc8J10pPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYodSAhPT0gb1snPiddICYmIHQgPj0gb1snPiddKXsgcmV0dXJuIHRydWUgfVxuICAgICAgICBpZih1ICE9PSBvWyc8J10gJiYgdCA8PSBvWyc8J10peyByZXR1cm4gdHJ1ZSB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBHdW4uTGV4ID0gbGV4O1xuXG4gICAgR3VuLmNoYWluLmxleCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGxleCh0aGlzKTtcbiAgICB9XG5cbn0pKCh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSA/IHdpbmRvdy5HdW4gOiByZXF1aXJlKCcuLi9ndW4nKSkiLCJ2YXIgR3VuID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpPyB3aW5kb3cuR3VuIDogcmVxdWlyZSgnLi4vZ3VuJyk7XG5HdW4uY2hhaW4ub3BlbiB8fCByZXF1aXJlKCcuL29wZW4nKTtcblxuR3VuLmNoYWluLmxvYWQgPSBmdW5jdGlvbihjYiwgb3B0LCBhdCl7XG5cdChvcHQgPSBvcHQgfHwge30pLm9mZiA9ICEwO1xuXHRyZXR1cm4gdGhpcy5vcGVuKGNiLCBvcHQsIGF0KTtcbn0iLCJpZih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgdmFyIEd1biA9IHdpbmRvdy5HdW47XG59IGVsc2UgeyBcbiAgdmFyIEd1biA9IHJlcXVpcmUoJy4uL2d1bicpO1xufVxuXG52YXIgdTtcblxuR3VuLmNoYWluLm5vdCA9IGZ1bmN0aW9uKGNiLCBvcHQsIHQpe1xuXHRyZXR1cm4gdGhpcy5nZXQob3VnaHQsIHtub3Q6IGNifSk7XG59XG5cbmZ1bmN0aW9uIG91Z2h0KGF0LCBldil7IGV2Lm9mZigpO1xuXHRpZihhdC5lcnIgfHwgKHUgIT09IGF0LnB1dCkpeyByZXR1cm4gfVxuXHRpZighdGhpcy5ub3QpeyByZXR1cm4gfVxuXHR0aGlzLm5vdC5jYWxsKGF0Lmd1biwgYXQuZ2V0LCBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyhcIlBsZWFzZSByZXBvcnQgdGhpcyBidWcgb24gaHR0cHM6Ly9naXR0ZXIuaW0vYW1hcmsvZ3VuIGFuZCBpbiB0aGUgaXNzdWVzLlwiKTsgbmVlZC50by5pbXBsZW1lbnQ7IH0pO1xufSIsInZhciBHdW4gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIik/IHdpbmRvdy5HdW4gOiByZXF1aXJlKCcuLi9ndW4nKTtcblxuR3VuLmNoYWluLm9wZW4gPSBmdW5jdGlvbihjYiwgb3B0LCBhdCwgZGVwdGgpeyAvLyB0aGlzIGlzIGEgcmVjdXJzaXZlIGZ1bmN0aW9uLCBCRVdBUkUhXG5cdGRlcHRoID0gZGVwdGggfHwgMTtcblx0b3B0ID0gb3B0IHx8IHt9OyAvLyBpbml0IHRvcCBsZXZlbCBvcHRpb25zLlxuXHRvcHQuZG9jID0gb3B0LmRvYyB8fCB7fTtcblx0b3B0LmlkcyA9IG9wdC5pZHMgfHwge307XG5cdG9wdC5hbnkgPSBvcHQuYW55IHx8IGNiO1xuXHRvcHQubWV0YSA9IG9wdC5tZXRhIHx8IGZhbHNlO1xuXHRvcHQuZXZlID0gb3B0LmV2ZSB8fCB7b2ZmOiBmdW5jdGlvbigpeyAvLyBjb2xsZWN0IGFsbCByZWN1cnNpdmUgZXZlbnRzIHRvIHVuc3Vic2NyaWJlIHRvIGlmIG5lZWRlZC5cblx0XHRPYmplY3Qua2V5cyhvcHQuZXZlLnMpLmZvckVhY2goZnVuY3Rpb24oaSxlKXsgLy8gc3dpdGNoIHRvIENQVSBzY2hlZHVsZWQgc2V0VGltZW91dC5lYWNoP1xuXHRcdFx0aWYoZSA9IG9wdC5ldmUuc1tpXSl7IGUub2ZmKCkgfVxuXHRcdH0pO1xuXHRcdG9wdC5ldmUucyA9IHt9O1xuXHR9LCBzOnt9fVxuXHRyZXR1cm4gdGhpcy5vbihmdW5jdGlvbihkYXRhLCBrZXksIGN0eCwgZXZlKXsgLy8gc3Vic2NyaWJlIHRvIDEgZGVlcGVyIG9mIGRhdGEhXG5cdFx0Y2xlYXJUaW1lb3V0KG9wdC50byk7IC8vIGRvIG5vdCB0cmlnZ2VyIGNhbGxiYWNrIGlmIGJ1bmNoIG9mIGNoYW5nZXMuLi5cblx0XHRvcHQudG8gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IC8vIGJ1dCBzY2hlZHVsZSB0aGUgY2FsbGJhY2sgdG8gZmlyZSBzb29uIVxuXHRcdFx0aWYoIW9wdC5hbnkpeyByZXR1cm4gfVxuXHRcdFx0b3B0LmFueS5jYWxsKG9wdC5hdC4kLCBvcHQuZG9jLCBvcHQua2V5LCBvcHQsIG9wdC5ldmUpOyAvLyBjYWxsIGl0LlxuXHRcdFx0aWYob3B0Lm9mZil7IC8vIGNoZWNrIGZvciB1bnN1YnNjcmliaW5nLlxuXHRcdFx0XHRvcHQuZXZlLm9mZigpO1xuXHRcdFx0XHRvcHQuYW55ID0gbnVsbDtcblx0XHRcdH1cblx0XHR9LCBvcHQud2FpdCB8fCA5KTtcblx0XHRvcHQuYXQgPSBvcHQuYXQgfHwgY3R4OyAvLyBvcHQuYXQgd2lsbCBhbHdheXMgYmUgdGhlIGZpcnN0IGNvbnRleHQgaXQgZmluZHMuXG5cdFx0b3B0LmtleSA9IG9wdC5rZXkgfHwga2V5O1xuXHRcdG9wdC5ldmUuc1t0aGlzLl8uaWRdID0gZXZlOyAvLyBjb2xsZWN0IGFsbCB0aGUgZXZlbnRzIHRvZ2V0aGVyLlxuXHRcdGlmKHRydWUgPT09IEd1bi52YWxpZChkYXRhKSl7IC8vIGlmIHByaW1pdGl2ZSB2YWx1ZS4uLlxuXHRcdFx0aWYoIWF0KXtcblx0XHRcdFx0b3B0LmRvYyA9IGRhdGE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhdFtrZXldID0gZGF0YTtcblx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIHRtcCA9IHRoaXM7IC8vIGVsc2UgaWYgYSBzdWItb2JqZWN0LCBDUFUgc2NoZWR1bGUgbG9vcCBvdmVyIHByb3BlcnRpZXMgdG8gZG8gcmVjdXJzaW9uLlxuXHRcdHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhkYXRhKSwgZnVuY3Rpb24oa2V5LCB2YWwpe1xuXHRcdFx0aWYoJ18nID09PSBrZXkgJiYgIW9wdC5tZXRhKXsgcmV0dXJuIH1cblx0XHRcdHZhbCA9IGRhdGFba2V5XTtcblx0XHRcdHZhciBkb2MgPSBhdCB8fCBvcHQuZG9jLCBpZDsgLy8gZmlyc3QgcGFzcyB0aGlzIGJlY29tZXMgdGhlIHJvb3Qgb2Ygb3BlbiwgdGhlbiBhdCBpcyBwYXNzZWQgYmVsb3csIGFuZCB3aWxsIGJlIHRoZSBwYXJlbnQgZm9yIGVhY2ggc3ViLWRvY3VtZW50L29iamVjdC5cblx0XHRcdGlmKCFkb2MpeyByZXR1cm4gfSAvLyBpZiBubyBcInBhcmVudFwiXG5cdFx0XHRpZignc3RyaW5nJyAhPT0gdHlwZW9mIChpZCA9IEd1bi52YWxpZCh2YWwpKSl7IC8vIGlmIHByaW1pdGl2ZS4uLlxuXHRcdFx0XHRkb2Nba2V5XSA9IHZhbDtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYob3B0Lmlkc1tpZF0peyAvLyBpZiB3ZSd2ZSBhbHJlYWR5IHNlZW4gdGhpcyBzdWItb2JqZWN0L2RvY3VtZW50XG5cdFx0XHRcdGRvY1trZXldID0gb3B0Lmlkc1tpZF07IC8vIGxpbmsgdG8gaXRzZWxmLCBvdXIgYWxyZWFkeSBpbi1tZW1vcnkgb25lLCBub3QgYSBuZXcgY29weS5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYob3B0LmRlcHRoIDw9IGRlcHRoKXsgLy8gc3RvcCByZWN1cnNpdmUgb3BlbiBhdCBtYXggZGVwdGguXG5cdFx0XHRcdGRvY1trZXldID0gZG9jW2tleV0gfHwgdmFsOyAvLyBzaG93IGxpbmsgc28gYXBwIGNhbiBsb2FkIGl0IGlmIG5lZWQuXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH0gLy8gbm93IG9wZW4gdXAgdGhlIHJlY3Vyc2lvbiBvZiBzdWItZG9jdW1lbnRzIVxuXHRcdFx0dG1wLmdldChrZXkpLm9wZW4ob3B0LmFueSwgb3B0LCBvcHQuaWRzW2lkXSA9IGRvY1trZXldID0ge30sIGRlcHRoKzEpOyAvLyAzcmQgcGFyYW0gaXMgbm93IHdoZXJlIHdlIGFyZSBcImF0XCIuXG5cdFx0fSk7XG5cdH0pXG59IiwidmFyIEd1biA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKT8gd2luZG93Lkd1biA6IHJlcXVpcmUoJy4uL2d1bicpO1xuXG5jb25zdCByZWxfID0gJyMnOyAgLy8gJyMnXG5jb25zdCBub2RlXyA9ICdfJzsgIC8vICdfJ1xuXG5HdW4uY2hhaW4udW5zZXQgPSBmdW5jdGlvbihub2RlKXtcblx0aWYoIHRoaXMgJiYgbm9kZSAmJiBub2RlW25vZGVfXSAmJiBub2RlW25vZGVfXS5wdXQgJiYgbm9kZVtub2RlX10ucHV0W25vZGVfXSAmJiBub2RlW25vZGVfXS5wdXRbbm9kZV9dW3JlbF9dICl7XG5cdFx0dGhpcy5wdXQoIHsgW25vZGVbbm9kZV9dLnB1dFtub2RlX11bcmVsX11dOm51bGx9ICk7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59XG4iLCI7KGZ1bmN0aW9uKCl7XG4gIHZhciBHdW4gID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpPyB3aW5kb3cuR3VuIDogcmVxdWlyZSgnLi9ndW4nKTtcbiAgdmFyIGRhbSAgPSAnbnRzJztcbiAgdmFyIHNtb290aCA9IDI7XG5cbiAgR3VuLm9uKCdjcmVhdGUnLCBmdW5jdGlvbihyb290KXsgLy8gc3dpdGNoIHRvIERBTSwgZGVwcmVjYXRlZCBvbGRcbiAgXHRyZXR1cm4gOyAvLyBzdHViIG91dCBmb3Igbm93LiBUT0RPOiBJTVBPUlRBTlQhIHJlLWFkZCBiYWNrIGluIGxhdGVyLlxuICAgIHZhciBvcHQgPSByb290Lm9wdCwgbWVzaCA9IG9wdC5tZXNoO1xuICAgIGlmKCFtZXNoKSByZXR1cm47XG5cbiAgICAvLyBUcmFjayBjb25uZWN0aW9uc1xuICAgIHZhciBjb25uZWN0aW9ucyA9IFtdO1xuICAgIHJvb3Qub24oJ2hpJywgZnVuY3Rpb24ocGVlcikge1xuICAgICAgdGhpcy50by5uZXh0KHBlZXIpO1xuICAgICAgY29ubmVjdGlvbnMucHVzaCh7cGVlciwgbGF0ZW5jeTogMCwgb2Zmc2V0OiAwLCBuZXh0OiAwfSk7XG4gICAgfSk7XG4gICAgcm9vdC5vbignYnllJywgZnVuY3Rpb24ocGVlcikge1xuICAgICAgdGhpcy50by5uZXh0KHBlZXIpO1xuICAgICAgdmFyIGZvdW5kID0gY29ubmVjdGlvbnMuZmluZChjb25uZWN0aW9uID0+IGNvbm5lY3Rpb24ucGVlci5pZCA9PSBwZWVyLmlkKTtcbiAgICAgIGlmICghZm91bmQpIHJldHVybjtcbiAgICAgIGNvbm5lY3Rpb25zLnNwbGljZShjb25uZWN0aW9ucy5pbmRleE9mKGZvdW5kKSwgMSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiByZXNwb25zZShtc2csIGNvbm5lY3Rpb24pIHtcbiAgICAgIHZhciBub3cgICAgICAgICAgICA9IERhdGUubm93KCk7IC8vIExhY2sgb2YgZHJpZnQgaW50ZW50aW9uYWwsIHByb3ZpZGVzIG1vcmUgYWNjdXJhdGUgUlRUXG4gICAgICBjb25uZWN0aW9uLmxhdGVuY3kgPSAobm93IC0gbXNnLm50c1swXSkgLyAyO1xuICAgICAgY29ubmVjdGlvbi5vZmZzZXQgID0gKG1zZy5udHNbMV0gKyBjb25uZWN0aW9uLmxhdGVuY3kpIC0gKG5vdyArIEd1bi5zdGF0ZS5kcmlmdCk7XG4gICAgICBjb25zb2xlLmxvZyhjb25uZWN0aW9uLm9mZnNldCk7XG4gICAgICBHdW4uc3RhdGUuZHJpZnQgICArPSBjb25uZWN0aW9uLm9mZnNldCAvIChjb25uZWN0aW9ucy5sZW5ndGggKyBzbW9vdGgpO1xuICAgICAgY29uc29sZS5sb2coYFVwZGF0ZSB0aW1lIGJ5IGxvY2FsOiAke2Nvbm5lY3Rpb24ub2Zmc2V0fSAvICR7Y29ubmVjdGlvbnMubGVuZ3RoICsgc21vb3RofWApO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBlY2hvICYgc2V0dGluZyBiYXNlZCBvbiBrbm93biBjb25uZWN0aW9uIGxhdGVuY3kgYXMgd2VsbFxuICAgIG1lc2guaGVhcltkYW1dID0gZnVuY3Rpb24obXNnLCBwZWVyKSB7XG4gICAgICBjb25zb2xlLmxvZygnTVNHJywgbXNnKTtcbiAgICAgIHZhciBub3cgICA9IERhdGUubm93KCkgKyBHdW4uc3RhdGUuZHJpZnQ7XG4gICAgICB2YXIgY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25zLmZpbmQoY29ubmVjdGlvbiA9PiBjb25uZWN0aW9uLnBlZXIuaWQgPT0gcGVlci5pZCk7XG4gICAgICBpZiAoIWNvbm5lY3Rpb24pIHJldHVybjtcbiAgICAgIGlmIChtc2cubnRzLmxlbmd0aCA+PSAyKSByZXR1cm4gcmVzcG9uc2UobXNnLCBjb25uZWN0aW9uKTtcbiAgICAgIG1lc2guc2F5KHtkYW0sICdAJzogbXNnWycjJ10sIG50czogbXNnLm50cy5jb25jYXQobm93KX0sIHBlZXIpO1xuICAgICAgY29ubmVjdGlvbi5vZmZzZXQgPSBtc2cubnRzWzBdICsgY29ubmVjdGlvbi5sYXRlbmN5IC0gbm93O1xuICAgICAgR3VuLnN0YXRlLmRyaWZ0ICArPSBjb25uZWN0aW9uLm9mZnNldCAvIChjb25uZWN0aW9ucy5sZW5ndGggKyBzbW9vdGgpO1xuICAgICAgY29uc29sZS5sb2coYFVwZGF0ZSB0aW1lIGJ5IHJlbW90ZTogJHtjb25uZWN0aW9uLm9mZnNldH0gLyAke2Nvbm5lY3Rpb25zLmxlbmd0aCArIHNtb290aH1gKTtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHBpbmcgdHJhbnNtaXNzaW9uXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiB0cmlnZ2VyKCkge1xuICAgICAgY29uc29sZS5sb2coJ1RSSUdHRVInKTtcbiAgICAgIGlmICghY29ubmVjdGlvbnMubGVuZ3RoKSByZXR1cm4gc2V0VGltZW91dCh0cmlnZ2VyLCAxMDApO1xuICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7IC8vIExhY2sgb2YgZHJpZnQgaW50ZW50aW9uYWwsIHByb3ZpZGVzIG1vcmUgYWNjdXJhdGUgUlRUICYgTlRQIHJlZmVyZW5jZVxuXG4gICAgICAvLyBTZW5kIHBpbmdzXG4gICAgICBjb25uZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24ubmV4dCA+IG5vdykgcmV0dXJuO1xuICAgICAgICBtZXNoLnNheSh7XG4gICAgICAgICAgZGFtLFxuICAgICAgICAgICcjJzogU3RyaW5nLnJhbmRvbSgzKSxcbiAgICAgICAgICBudHM6IFtub3ddLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBQbGFuIG5leHQgcm91bmQgb2YgcGluZ3NcbiAgICAgIGNvbm5lY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oY29ubmVjdGlvbikge1xuICAgICAgICBpZiAoY29ubmVjdGlvbi5uZXh0ID4gbm93KSByZXR1cm47XG4gICAgICAgIC8vIGh0dHBzOi8vZGlzY29yZC5jb20vY2hhbm5lbHMvNjEyNjQ1MzU3ODUwOTg0NDcwLzYxMjY0NTM1Nzg1MDk4NDQ3My83NTUzMzQzNDk2OTk4MDkzMDBcbiAgICAgICAgdmFyIGRlbGF5ID0gTWF0aC5taW4oMmU0LCBNYXRoLm1heCgyNTAsIDE1MDAwMCAvIE1hdGguYWJzKChjb25uZWN0aW9uLm9mZnNldCl8fDEpKSk7XG4gICAgICAgIGNvbm5lY3Rpb24ubmV4dCA9IG5vdyArIGRlbGF5O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFBsYW4gbmV4dCB0cmlnZ2VyIHJvdW5kXG4gICAgICAvLyBNYXkgb3ZlcnNob290IGJ5IHJ1bnRpbWUgb2YgdGhpcyBmdW5jdGlvblxuICAgICAgdmFyIG5leHRSb3VuZCA9IEluZmluaXR5O1xuICAgICAgY29ubmVjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihjb25uZWN0aW9uKSB7XG4gICAgICAgIG5leHRSb3VuZCA9IE1hdGgubWluKG5leHRSb3VuZCwgY29ubmVjdGlvbi5uZXh0KTtcbiAgICAgIH0pO1xuICAgICAgc2V0VGltZW91dCh0cmlnZ2VyLCBuZXh0Um91bmQgLSBub3cpO1xuICAgICAgY29uc29sZS5sb2coYE5leHQgc3luYyByb3VuZCBpbiAkeyhuZXh0Um91bmQgLSBub3cpIC8gMTAwMH0gc2Vjb25kc2ApO1xuICAgIH0sIDEpO1xuICB9KTtcblxufSgpKTtcbiIsIjsoZnVuY3Rpb24oKXtcblxuICAvKiBVTkJVSUxEICovXG4gIGZ1bmN0aW9uIFVTRShhcmcsIHJlcSl7XG4gICAgcmV0dXJuIHJlcT8gcmVxdWlyZShhcmcpIDogYXJnLnNsaWNlPyBVU0VbUihhcmcpXSA6IGZ1bmN0aW9uKG1vZCwgcGF0aCl7XG4gICAgICBhcmcobW9kID0ge2V4cG9ydHM6IHt9fSk7XG4gICAgICBVU0VbUihwYXRoKV0gPSBtb2QuZXhwb3J0cztcbiAgICB9XG4gICAgZnVuY3Rpb24gUihwKXtcbiAgICAgIHJldHVybiBwLnNwbGl0KCcvJykuc2xpY2UoLTEpLnRvU3RyaW5nKCkucmVwbGFjZSgnLmpzJywnJyk7XG4gICAgfVxuICB9XG4gIGlmKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpeyB2YXIgTU9EVUxFID0gbW9kdWxlIH1cbiAgLyogVU5CVUlMRCAqL1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICAvLyBTZWN1cml0eSwgRW5jcnlwdGlvbiwgYW5kIEF1dGhvcml6YXRpb246IFNFQS5qc1xuICAgIC8vIE1BTkRBVE9SWSBSRUFESU5HOiBodHRwczovL2d1bi5lY28vZXhwbGFpbmVycy9kYXRhL3NlY3VyaXR5Lmh0bWxcbiAgICAvLyBJVCBJUyBJTVBMRU1FTlRFRCBJTiBBIFBPTFlGSUxML1NISU0gQVBQUk9BQ0guXG4gICAgLy8gVEhJUyBJUyBBTiBFQVJMWSBBTFBIQSFcblxuICAgIGlmKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpeyBtb2R1bGUud2luZG93ID0gd2luZG93IH1cblxuICAgIHZhciB0bXAgPSBtb2R1bGUud2luZG93IHx8IG1vZHVsZSwgdTtcbiAgICB2YXIgU0VBID0gdG1wLlNFQSB8fCB7fTtcblxuICAgIGlmKFNFQS53aW5kb3cgPSBtb2R1bGUud2luZG93KXsgU0VBLndpbmRvdy5TRUEgPSBTRUEgfVxuXG4gICAgdHJ5eyBpZih1KycnICE9PSB0eXBlb2YgTU9EVUxFKXsgTU9EVUxFLmV4cG9ydHMgPSBTRUEgfSB9Y2F0Y2goZSl7fVxuICAgIG1vZHVsZS5leHBvcnRzID0gU0VBO1xuICB9KShVU0UsICcuL3Jvb3QnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdHJ5eyBpZihTRUEud2luZG93KXtcbiAgICAgIGlmKGxvY2F0aW9uLnByb3RvY29sLmluZGV4T2YoJ3MnKSA8IDBcbiAgICAgICYmIGxvY2F0aW9uLmhvc3QuaW5kZXhPZignbG9jYWxob3N0JykgPCAwXG4gICAgICAmJiAhIC9eMTI3XFwuXFxkK1xcLlxcZCtcXC5cXGQrJC8udGVzdChsb2NhdGlvbi5ob3N0bmFtZSlcbiAgICAgICYmIGxvY2F0aW9uLnByb3RvY29sLmluZGV4T2YoJ2ZpbGU6JykgPCAwKXtcbiAgICAgICAgY29uc29sZS53YXJuKCdIVFRQUyBuZWVkZWQgZm9yIFdlYkNyeXB0byBpbiBTRUEsIHJlZGlyZWN0aW5nLi4uJyk7XG4gICAgICAgIGxvY2F0aW9uLnByb3RvY29sID0gJ2h0dHBzOic7IC8vIFdlYkNyeXB0byBkb2VzIE5PVCB3b3JrIHdpdGhvdXQgSFRUUFMhXG4gICAgICB9XG4gICAgfSB9Y2F0Y2goZSl7fVxuICB9KShVU0UsICcuL2h0dHBzJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciB1O1xuICAgIGlmKHUrJyc9PSB0eXBlb2YgYnRvYSl7XG4gICAgICBpZih1KycnID09IHR5cGVvZiBCdWZmZXIpe1xuICAgICAgICB0cnl7IGdsb2JhbC5CdWZmZXIgPSBVU0UoXCJidWZmZXJcIiwgMSkuQnVmZmVyIH1jYXRjaChlKXsgY29uc29sZS5sb2coXCJQbGVhc2UgYG5wbSBpbnN0YWxsIGJ1ZmZlcmAgb3IgYWRkIGl0IHRvIHlvdXIgcGFja2FnZS5qc29uICFcIikgfVxuICAgICAgfVxuICAgICAgZ2xvYmFsLmJ0b2EgPSBmdW5jdGlvbihkYXRhKXsgcmV0dXJuIEJ1ZmZlci5mcm9tKGRhdGEsIFwiYmluYXJ5XCIpLnRvU3RyaW5nKFwiYmFzZTY0XCIpIH07XG4gICAgICBnbG9iYWwuYXRvYiA9IGZ1bmN0aW9uKGRhdGEpeyByZXR1cm4gQnVmZmVyLmZyb20oZGF0YSwgXCJiYXNlNjRcIikudG9TdHJpbmcoXCJiaW5hcnlcIikgfTtcbiAgICB9XG4gIH0pKFVTRSwgJy4vYmFzZTY0Jyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIFVTRSgnLi9iYXNlNjQnKTtcbiAgICAvLyBUaGlzIGlzIEFycmF5IGV4dGVuZGVkIHRvIGhhdmUgLnRvU3RyaW5nKFsndXRmOCd8J2hleCd8J2Jhc2U2NCddKVxuICAgIGZ1bmN0aW9uIFNlYUFycmF5KCkge31cbiAgICBPYmplY3QuYXNzaWduKFNlYUFycmF5LCB7IGZyb206IEFycmF5LmZyb20gfSlcbiAgICBTZWFBcnJheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEFycmF5LnByb3RvdHlwZSlcbiAgICBTZWFBcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbihlbmMsIHN0YXJ0LCBlbmQpIHsgZW5jID0gZW5jIHx8ICd1dGY4Jzsgc3RhcnQgPSBzdGFydCB8fCAwO1xuICAgICAgY29uc3QgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICAgIGlmIChlbmMgPT09ICdoZXgnKSB7XG4gICAgICAgIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMpXG4gICAgICAgIHJldHVybiBbIC4uLkFycmF5KCgoZW5kICYmIChlbmQgKyAxKSkgfHwgbGVuZ3RoKSAtIHN0YXJ0KS5rZXlzKCldXG4gICAgICAgIC5tYXAoKGkpID0+IGJ1ZlsgaSArIHN0YXJ0IF0udG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpXG4gICAgICB9XG4gICAgICBpZiAoZW5jID09PSAndXRmOCcpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oXG4gICAgICAgICAgeyBsZW5ndGg6IChlbmQgfHwgbGVuZ3RoKSAtIHN0YXJ0IH0sXG4gICAgICAgICAgKF8sIGkpID0+IFN0cmluZy5mcm9tQ2hhckNvZGUodGhpc1sgaSArIHN0YXJ0XSlcbiAgICAgICAgKS5qb2luKCcnKVxuICAgICAgfVxuICAgICAgaWYgKGVuYyA9PT0gJ2Jhc2U2NCcpIHtcbiAgICAgICAgcmV0dXJuIGJ0b2EodGhpcylcbiAgICAgIH1cbiAgICB9XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTZWFBcnJheTtcbiAgfSkoVVNFLCAnLi9hcnJheScpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICBVU0UoJy4vYmFzZTY0Jyk7XG4gICAgLy8gVGhpcyBpcyBCdWZmZXIgaW1wbGVtZW50YXRpb24gdXNlZCBpbiBTRUEuIEZ1bmN0aW9uYWxpdHkgaXMgbW9zdGx5XG4gICAgLy8gY29tcGF0aWJsZSB3aXRoIE5vZGVKUyAnc2FmZS1idWZmZXInIGFuZCBpcyB1c2VkIGZvciBlbmNvZGluZyBjb252ZXJzaW9uc1xuICAgIC8vIGJldHdlZW4gYmluYXJ5IGFuZCAnaGV4JyB8ICd1dGY4JyB8ICdiYXNlNjQnXG4gICAgLy8gU2VlIGRvY3VtZW50YXRpb24gYW5kIHZhbGlkYXRpb24gZm9yIHNhZmUgaW1wbGVtZW50YXRpb24gaW46XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9zYWZlLWJ1ZmZlciN1cGRhdGVcbiAgICB2YXIgU2VhQXJyYXkgPSBVU0UoJy4vYXJyYXknKTtcbiAgICBmdW5jdGlvbiBTYWZlQnVmZmVyKC4uLnByb3BzKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ25ldyBTYWZlQnVmZmVyKCkgaXMgZGVwcmVjaWF0ZWQsIHBsZWFzZSB1c2UgU2FmZUJ1ZmZlci5mcm9tKCknKVxuICAgICAgcmV0dXJuIFNhZmVCdWZmZXIuZnJvbSguLi5wcm9wcylcbiAgICB9XG4gICAgU2FmZUJ1ZmZlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEFycmF5LnByb3RvdHlwZSlcbiAgICBPYmplY3QuYXNzaWduKFNhZmVCdWZmZXIsIHtcbiAgICAgIC8vIChkYXRhLCBlbmMpIHdoZXJlIHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJyB0aGVuIGVuYyA9PT0gJ3V0ZjgnfCdoZXgnfCdiYXNlNjQnXG4gICAgICBmcm9tKCkge1xuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGFyZ3VtZW50cykubGVuZ3RoIHx8IGFyZ3VtZW50c1swXT09bnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCBvciBhcnJheS1saWtlIG9iamVjdC4nKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucHV0ID0gYXJndW1lbnRzWzBdXG4gICAgICAgIGxldCBidWZcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCBlbmMgPSBhcmd1bWVudHNbMV0gfHwgJ3V0ZjgnXG4gICAgICAgICAgaWYgKGVuYyA9PT0gJ2hleCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVzID0gaW5wdXQubWF0Y2goLyhbXFxkYS1mQS1GXXsyfSkvZylcbiAgICAgICAgICAgIC5tYXAoKGJ5dGUpID0+IHBhcnNlSW50KGJ5dGUsIDE2KSlcbiAgICAgICAgICAgIGlmICghYnl0ZXMgfHwgIWJ5dGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGZpcnN0IGFyZ3VtZW50IGZvciB0eXBlIFxcJ2hleFxcJy4nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnVmID0gU2VhQXJyYXkuZnJvbShieXRlcylcbiAgICAgICAgICB9IGVsc2UgaWYgKGVuYyA9PT0gJ3V0ZjgnIHx8ICdiaW5hcnknID09PSBlbmMpIHsgLy8gRURJVCBCWSBNQVJLOiBJIHRoaW5rIHRoaXMgaXMgc2FmZSwgdGVzdGVkIGl0IGFnYWluc3QgYSBjb3VwbGUgXCJiaW5hcnlcIiBzdHJpbmdzLiBUaGlzIGxldHMgU2FmZUJ1ZmZlciBtYXRjaCBOb2RlSlMgQnVmZmVyIGJlaGF2aW9yIG1vcmUgd2hlcmUgaXQgc2FmZWx5IGJ0b2FzIHJlZ3VsYXIgc3RyaW5ncy5cbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aFxuICAgICAgICAgICAgY29uc3Qgd29yZHMgPSBuZXcgVWludDE2QXJyYXkobGVuZ3RoKVxuICAgICAgICAgICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogbGVuZ3RoIH0sIChfLCBpKSA9PiB3b3Jkc1tpXSA9IGlucHV0LmNoYXJDb2RlQXQoaSkpXG4gICAgICAgICAgICBidWYgPSBTZWFBcnJheS5mcm9tKHdvcmRzKVxuICAgICAgICAgIH0gZWxzZSBpZiAoZW5jID09PSAnYmFzZTY0Jykge1xuICAgICAgICAgICAgY29uc3QgZGVjID0gYXRvYihpbnB1dClcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IGRlYy5sZW5ndGhcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKVxuICAgICAgICAgICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogbGVuZ3RoIH0sIChfLCBpKSA9PiBieXRlc1tpXSA9IGRlYy5jaGFyQ29kZUF0KGkpKVxuICAgICAgICAgICAgYnVmID0gU2VhQXJyYXkuZnJvbShieXRlcylcbiAgICAgICAgICB9IGVsc2UgaWYgKGVuYyA9PT0gJ2JpbmFyeScpIHsgLy8gZGVwcmVjYXRlZCBieSBhYm92ZSBjb21tZW50XG4gICAgICAgICAgICBidWYgPSBTZWFBcnJheS5mcm9tKGlucHV0KSAvLyBzb21lIGJ0b2FzIHdlcmUgbWlzaGFuZGxlZC5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdTYWZlQnVmZmVyLmZyb20gdW5rbm93biBlbmNvZGluZzogJytlbmMpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBidWZcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBieXRlTGVuZ3RoID0gaW5wdXQuYnl0ZUxlbmd0aCAvLyB3aGF0IGlzIGdvaW5nIG9uIGhlcmU/IEZPUiBNQVJUVElcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaW5wdXQuYnl0ZUxlbmd0aCA/IGlucHV0LmJ5dGVMZW5ndGggOiBpbnB1dC5sZW5ndGhcbiAgICAgICAgaWYgKGxlbmd0aCkge1xuICAgICAgICAgIGxldCBidWZcbiAgICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICAgICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBTZWFBcnJheS5mcm9tKGJ1ZiB8fCBpbnB1dClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIFRoaXMgaXMgJ3NhZmUtYnVmZmVyLmFsbG9jJyBzYW5zIGVuY29kaW5nIHN1cHBvcnRcbiAgICAgIGFsbG9jKGxlbmd0aCwgZmlsbCA9IDAgLyosIGVuYyovICkge1xuICAgICAgICByZXR1cm4gU2VhQXJyYXkuZnJvbShuZXcgVWludDhBcnJheShBcnJheS5mcm9tKHsgbGVuZ3RoOiBsZW5ndGggfSwgKCkgPT4gZmlsbCkpKVxuICAgICAgfSxcbiAgICAgIC8vIFRoaXMgaXMgbm9ybWFsIFVOU0FGRSAnYnVmZmVyLmFsbG9jJyBvciAnbmV3IEJ1ZmZlcihsZW5ndGgpJyAtIGRvbid0IHVzZSFcbiAgICAgIGFsbG9jVW5zYWZlKGxlbmd0aCkge1xuICAgICAgICByZXR1cm4gU2VhQXJyYXkuZnJvbShuZXcgVWludDhBcnJheShBcnJheS5mcm9tKHsgbGVuZ3RoIDogbGVuZ3RoIH0pKSlcbiAgICAgIH0sXG4gICAgICAvLyBUaGlzIHB1dHMgdG9nZXRoZXIgYXJyYXkgb2YgYXJyYXkgbGlrZSBtZW1iZXJzXG4gICAgICBjb25jYXQoYXJyKSB7IC8vIG9jdGV0IGFycmF5XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBBcnJheSBjb250YWluaW5nIEFycmF5QnVmZmVyIG9yIFVpbnQ4QXJyYXkgaW5zdGFuY2VzLicpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFNlYUFycmF5LmZyb20oYXJyLnJlZHVjZSgocmV0LCBpdGVtKSA9PiByZXQuY29uY2F0KEFycmF5LmZyb20oaXRlbSkpLCBbXSkpXG4gICAgICB9XG4gICAgfSlcbiAgICBTYWZlQnVmZmVyLnByb3RvdHlwZS5mcm9tID0gU2FmZUJ1ZmZlci5mcm9tXG4gICAgU2FmZUJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBTZWFBcnJheS5wcm90b3R5cGUudG9TdHJpbmdcblxuICAgIG1vZHVsZS5leHBvcnRzID0gU2FmZUJ1ZmZlcjtcbiAgfSkoVVNFLCAnLi9idWZmZXInKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgY29uc3QgU0VBID0gVVNFKCcuL3Jvb3QnKVxuICAgIGNvbnN0IGFwaSA9IHtCdWZmZXI6IFVTRSgnLi9idWZmZXInKX1cbiAgICB2YXIgbyA9IHt9LCB1O1xuXG4gICAgLy8gaWRlYWxseSB3ZSBjYW4gbW92ZSBhd2F5IGZyb20gSlNPTiBlbnRpcmVseT8gdW5saWtlbHkgZHVlIHRvIGNvbXBhdGliaWxpdHkgaXNzdWVzLi4uIG9oIHdlbGwuXG4gICAgSlNPTi5wYXJzZUFzeW5jID0gSlNPTi5wYXJzZUFzeW5jIHx8IGZ1bmN0aW9uKHQsY2Iscil7IHZhciB1OyB0cnl7IGNiKHUsIEpTT04ucGFyc2UodCxyKSkgfWNhdGNoKGUpeyBjYihlKSB9IH1cbiAgICBKU09OLnN0cmluZ2lmeUFzeW5jID0gSlNPTi5zdHJpbmdpZnlBc3luYyB8fCBmdW5jdGlvbih2LGNiLHIscyl7IHZhciB1OyB0cnl7IGNiKHUsIEpTT04uc3RyaW5naWZ5KHYscixzKSkgfWNhdGNoKGUpeyBjYihlKSB9IH1cblxuICAgIGFwaS5wYXJzZSA9IGZ1bmN0aW9uKHQscil7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXMsIHJlail7XG4gICAgICBKU09OLnBhcnNlQXN5bmModCxmdW5jdGlvbihlcnIsIHJhdyl7IGVycj8gcmVqKGVycikgOiByZXMocmF3KSB9LHIpO1xuICAgIH0pfVxuICAgIGFwaS5zdHJpbmdpZnkgPSBmdW5jdGlvbih2LHIscyl7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXMsIHJlail7XG4gICAgICBKU09OLnN0cmluZ2lmeUFzeW5jKHYsZnVuY3Rpb24oZXJyLCByYXcpeyBlcnI/IHJlaihlcnIpIDogcmVzKHJhdykgfSxyLHMpO1xuICAgIH0pfVxuXG4gICAgaWYoU0VBLndpbmRvdyl7XG4gICAgICBhcGkuY3J5cHRvID0gd2luZG93LmNyeXB0byB8fCB3aW5kb3cubXNDcnlwdG9cbiAgICAgIGFwaS5zdWJ0bGUgPSAoYXBpLmNyeXB0b3x8bykuc3VidGxlIHx8IChhcGkuY3J5cHRvfHxvKS53ZWJraXRTdWJ0bGU7XG4gICAgICBhcGkuVGV4dEVuY29kZXIgPSB3aW5kb3cuVGV4dEVuY29kZXI7XG4gICAgICBhcGkuVGV4dERlY29kZXIgPSB3aW5kb3cuVGV4dERlY29kZXI7XG4gICAgICBhcGkucmFuZG9tID0gKGxlbikgPT4gYXBpLkJ1ZmZlci5mcm9tKGFwaS5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KGFwaS5CdWZmZXIuYWxsb2MobGVuKSkpKTtcbiAgICB9XG4gICAgaWYoIWFwaS5UZXh0RGVjb2RlcilcbiAgICB7XG4gICAgICBjb25zdCB7IFRleHRFbmNvZGVyLCBUZXh0RGVjb2RlciB9ID0gVVNFKCh1KycnID09IHR5cGVvZiBNT0RVTEU/Jy4nOicnKSsnLi9saWIvdGV4dC1lbmNvZGluZycsIDEpO1xuICAgICAgYXBpLlRleHREZWNvZGVyID0gVGV4dERlY29kZXI7XG4gICAgICBhcGkuVGV4dEVuY29kZXIgPSBUZXh0RW5jb2RlcjtcbiAgICB9XG4gICAgaWYoIWFwaS5jcnlwdG8pXG4gICAge1xuICAgICAgdHJ5XG4gICAgICB7XG4gICAgICB2YXIgY3J5cHRvID0gVVNFKCdjcnlwdG8nLCAxKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oYXBpLCB7XG4gICAgICAgIGNyeXB0byxcbiAgICAgICAgcmFuZG9tOiAobGVuKSA9PiBhcGkuQnVmZmVyLmZyb20oY3J5cHRvLnJhbmRvbUJ5dGVzKGxlbikpXG4gICAgICB9KTsgICAgICBcbiAgICAgIGNvbnN0IHsgQ3J5cHRvOiBXZWJDcnlwdG8gfSA9IFVTRSgnQHBlY3VsaWFyL3dlYmNyeXB0bycsIDEpO1xuICAgICAgYXBpLm9zc2wgPSBhcGkuc3VidGxlID0gbmV3IFdlYkNyeXB0byh7ZGlyZWN0b3J5OiAnb3NzbCd9KS5zdWJ0bGUgLy8gRUNESFxuICAgIH1cbiAgICBjYXRjaChlKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiUGxlYXNlIGBucG0gaW5zdGFsbCBAcGVjdWxpYXIvd2ViY3J5cHRvYCBvciBhZGQgaXQgdG8geW91ciBwYWNrYWdlLmpzb24gIVwiKTtcbiAgICB9fVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBhcGlcbiAgfSkoVVNFLCAnLi9zaGltJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBTRUEgPSBVU0UoJy4vcm9vdCcpO1xuICAgIHZhciBzaGltID0gVVNFKCcuL3NoaW0nKTtcbiAgICB2YXIgcyA9IHt9O1xuICAgIHMucGJrZGYyID0ge2hhc2g6IHtuYW1lIDogJ1NIQS0yNTYnfSwgaXRlcjogMTAwMDAwLCBrczogNjR9O1xuICAgIHMuZWNkc2EgPSB7XG4gICAgICBwYWlyOiB7bmFtZTogJ0VDRFNBJywgbmFtZWRDdXJ2ZTogJ1AtMjU2J30sXG4gICAgICBzaWduOiB7bmFtZTogJ0VDRFNBJywgaGFzaDoge25hbWU6ICdTSEEtMjU2J319XG4gICAgfTtcbiAgICBzLmVjZGggPSB7bmFtZTogJ0VDREgnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfTtcblxuICAgIC8vIFRoaXMgY3JlYXRlcyBXZWIgQ3J5cHRvZ3JhcGh5IEFQSSBjb21wbGlhbnQgSldLIGZvciBzaWduL3ZlcmlmeSBwdXJwb3Nlc1xuICAgIHMuandrID0gZnVuY3Rpb24ocHViLCBkKXsgIC8vIGQgPT09IHByaXZcbiAgICAgIHB1YiA9IHB1Yi5zcGxpdCgnLicpO1xuICAgICAgdmFyIHggPSBwdWJbMF0sIHkgPSBwdWJbMV07XG4gICAgICB2YXIgandrID0ge2t0eTogXCJFQ1wiLCBjcnY6IFwiUC0yNTZcIiwgeDogeCwgeTogeSwgZXh0OiB0cnVlfTtcbiAgICAgIGp3ay5rZXlfb3BzID0gZCA/IFsnc2lnbiddIDogWyd2ZXJpZnknXTtcbiAgICAgIGlmKGQpeyBqd2suZCA9IGQgfVxuICAgICAgcmV0dXJuIGp3aztcbiAgICB9O1xuICAgIFxuICAgIHMua2V5VG9Kd2sgPSBmdW5jdGlvbihrZXlCeXRlcykge1xuICAgICAgY29uc3Qga2V5QjY0ID0ga2V5Qnl0ZXMudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgY29uc3QgayA9IGtleUI2NC5yZXBsYWNlKC9cXCsvZywgJy0nKS5yZXBsYWNlKC9cXC8vZywgJ18nKS5yZXBsYWNlKC9cXD0vZywgJycpO1xuICAgICAgcmV0dXJuIHsga3R5OiAnb2N0JywgazogaywgZXh0OiBmYWxzZSwgYWxnOiAnQTI1NkdDTScgfTtcbiAgICB9XG5cbiAgICBzLnJlY2FsbCA9IHtcbiAgICAgIHZhbGlkaXR5OiAxMiAqIDYwICogNjAsIC8vIGludGVybmFsbHkgaW4gc2Vjb25kcyA6IDEyIGhvdXJzXG4gICAgICBob29rOiBmdW5jdGlvbihwcm9wcyl7IHJldHVybiBwcm9wcyB9IC8vIHsgaWF0LCBleHAsIGFsaWFzLCByZW1lbWJlciB9IC8vIG9yIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlKHByb3BzKVxuICAgIH07XG5cbiAgICBzLmNoZWNrID0gZnVuY3Rpb24odCl7IHJldHVybiAodHlwZW9mIHQgPT0gJ3N0cmluZycpICYmICgnU0VBeycgPT09IHQuc2xpY2UoMCw0KSkgfVxuICAgIHMucGFyc2UgPSBhc3luYyBmdW5jdGlvbiBwKHQpeyB0cnkge1xuICAgICAgdmFyIHllcyA9ICh0eXBlb2YgdCA9PSAnc3RyaW5nJyk7XG4gICAgICBpZih5ZXMgJiYgJ1NFQXsnID09PSB0LnNsaWNlKDAsNCkpeyB0ID0gdC5zbGljZSgzKSB9XG4gICAgICByZXR1cm4geWVzID8gYXdhaXQgc2hpbS5wYXJzZSh0KSA6IHQ7XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuXG4gICAgU0VBLm9wdCA9IHM7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzXG4gIH0pKFVTRSwgJy4vc2V0dGluZ3MnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIG1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oZCwgbyl7XG4gICAgICB2YXIgdCA9ICh0eXBlb2YgZCA9PSAnc3RyaW5nJyk/IGQgOiBhd2FpdCBzaGltLnN0cmluZ2lmeShkKTtcbiAgICAgIHZhciBoYXNoID0gYXdhaXQgc2hpbS5zdWJ0bGUuZGlnZXN0KHtuYW1lOiBvfHwnU0hBLTI1Nid9LCBuZXcgc2hpbS5UZXh0RW5jb2RlcigpLmVuY29kZSh0KSk7XG4gICAgICByZXR1cm4gc2hpbS5CdWZmZXIuZnJvbShoYXNoKTtcbiAgICB9XG4gIH0pKFVTRSwgJy4vc2hhMjU2Jyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIC8vIFRoaXMgaW50ZXJuYWwgZnVuYyByZXR1cm5zIFNIQS0xIGhhc2hlZCBkYXRhIGZvciBLZXlJRCBnZW5lcmF0aW9uXG4gICAgY29uc3QgX19zaGltID0gVVNFKCcuL3NoaW0nKVxuICAgIGNvbnN0IHN1YnRsZSA9IF9fc2hpbS5zdWJ0bGVcbiAgICBjb25zdCBvc3NsID0gX19zaGltLm9zc2wgPyBfX3NoaW0ub3NzbCA6IHN1YnRsZVxuICAgIGNvbnN0IHNoYTFoYXNoID0gKGIpID0+IG9zc2wuZGlnZXN0KHtuYW1lOiAnU0hBLTEnfSwgbmV3IEFycmF5QnVmZmVyKGIpKVxuICAgIG1vZHVsZS5leHBvcnRzID0gc2hhMWhhc2hcbiAgfSkoVVNFLCAnLi9zaGExJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBTRUEgPSBVU0UoJy4vcm9vdCcpO1xuICAgIHZhciBzaGltID0gVVNFKCcuL3NoaW0nKTtcbiAgICB2YXIgUyA9IFVTRSgnLi9zZXR0aW5ncycpO1xuICAgIHZhciBzaGEgPSBVU0UoJy4vc2hhMjU2Jyk7XG4gICAgdmFyIHU7XG5cbiAgICBTRUEud29yayA9IFNFQS53b3JrIHx8IChhc3luYyAoZGF0YSwgcGFpciwgY2IsIG9wdCkgPT4geyB0cnkgeyAvLyB1c2VkIHRvIGJlIG5hbWVkIGBwcm9vZmBcbiAgICAgIHZhciBzYWx0ID0gKHBhaXJ8fHt9KS5lcHViIHx8IHBhaXI7IC8vIGVwdWIgbm90IHJlY29tbWVuZGVkLCBzYWx0IHNob3VsZCBiZSByYW5kb20hXG4gICAgICBvcHQgPSBvcHQgfHwge307XG4gICAgICBpZihzYWx0IGluc3RhbmNlb2YgRnVuY3Rpb24pe1xuICAgICAgICBjYiA9IHNhbHQ7XG4gICAgICAgIHNhbHQgPSB1O1xuICAgICAgfVxuICAgICAgZGF0YSA9ICh0eXBlb2YgZGF0YSA9PSAnc3RyaW5nJyk/IGRhdGEgOiBhd2FpdCBzaGltLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgIGlmKCdzaGEnID09PSAob3B0Lm5hbWV8fCcnKS50b0xvd2VyQ2FzZSgpLnNsaWNlKDAsMykpe1xuICAgICAgICB2YXIgcnNoYSA9IHNoaW0uQnVmZmVyLmZyb20oYXdhaXQgc2hhKGRhdGEsIG9wdC5uYW1lKSwgJ2JpbmFyeScpLnRvU3RyaW5nKG9wdC5lbmNvZGUgfHwgJ2Jhc2U2NCcpXG4gICAgICAgIGlmKGNiKXsgdHJ5eyBjYihyc2hhKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgICAgcmV0dXJuIHJzaGE7XG4gICAgICB9XG4gICAgICBzYWx0ID0gc2FsdCB8fCBzaGltLnJhbmRvbSg5KTtcbiAgICAgIHZhciBrZXkgPSBhd2FpdCAoc2hpbS5vc3NsIHx8IHNoaW0uc3VidGxlKS5pbXBvcnRLZXkoJ3JhdycsIG5ldyBzaGltLlRleHRFbmNvZGVyKCkuZW5jb2RlKGRhdGEpLCB7bmFtZTogb3B0Lm5hbWUgfHwgJ1BCS0RGMid9LCBmYWxzZSwgWydkZXJpdmVCaXRzJ10pO1xuICAgICAgdmFyIHdvcmsgPSBhd2FpdCAoc2hpbS5vc3NsIHx8IHNoaW0uc3VidGxlKS5kZXJpdmVCaXRzKHtcbiAgICAgICAgbmFtZTogb3B0Lm5hbWUgfHwgJ1BCS0RGMicsXG4gICAgICAgIGl0ZXJhdGlvbnM6IG9wdC5pdGVyYXRpb25zIHx8IFMucGJrZGYyLml0ZXIsXG4gICAgICAgIHNhbHQ6IG5ldyBzaGltLlRleHRFbmNvZGVyKCkuZW5jb2RlKG9wdC5zYWx0IHx8IHNhbHQpLFxuICAgICAgICBoYXNoOiBvcHQuaGFzaCB8fCBTLnBia2RmMi5oYXNoLFxuICAgICAgfSwga2V5LCBvcHQubGVuZ3RoIHx8IChTLnBia2RmMi5rcyAqIDgpKVxuICAgICAgZGF0YSA9IHNoaW0ucmFuZG9tKGRhdGEubGVuZ3RoKSAgLy8gRXJhc2UgZGF0YSBpbiBjYXNlIG9mIHBhc3NwaHJhc2VcbiAgICAgIHZhciByID0gc2hpbS5CdWZmZXIuZnJvbSh3b3JrLCAnYmluYXJ5JykudG9TdHJpbmcob3B0LmVuY29kZSB8fCAnYmFzZTY0JylcbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH0gY2F0Y2goZSkgeyBcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgU0VBLmVyciA9IGU7XG4gICAgICBpZihTRUEudGhyb3cpeyB0aHJvdyBlIH1cbiAgICAgIGlmKGNiKXsgY2IoKSB9XG4gICAgICByZXR1cm47XG4gICAgfX0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUEud29yaztcbiAgfSkoVVNFLCAnLi93b3JrJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBTRUEgPSBVU0UoJy4vcm9vdCcpO1xuICAgIHZhciBzaGltID0gVVNFKCcuL3NoaW0nKTtcbiAgICB2YXIgUyA9IFVTRSgnLi9zZXR0aW5ncycpO1xuXG4gICAgU0VBLm5hbWUgPSBTRUEubmFtZSB8fCAoYXN5bmMgKGNiLCBvcHQpID0+IHsgdHJ5IHtcbiAgICAgIGlmKGNiKXsgdHJ5eyBjYigpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgcmV0dXJuO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBTRUEuZXJyID0gZTtcbiAgICAgIGlmKFNFQS50aHJvdyl7IHRocm93IGUgfVxuICAgICAgaWYoY2IpeyBjYigpIH1cbiAgICAgIHJldHVybjtcbiAgICB9fSk7XG5cbiAgICAvL1NFQS5wYWlyID0gYXN5bmMgKGRhdGEsIHByb29mLCBjYikgPT4geyB0cnkge1xuICAgIFNFQS5wYWlyID0gU0VBLnBhaXIgfHwgKGFzeW5jIChjYiwgb3B0KSA9PiB7IHRyeSB7XG5cbiAgICAgIHZhciBlY2RoU3VidGxlID0gc2hpbS5vc3NsIHx8IHNoaW0uc3VidGxlO1xuICAgICAgLy8gRmlyc3Q6IEVDRFNBIGtleXMgZm9yIHNpZ25pbmcvdmVyaWZ5aW5nLi4uXG4gICAgICB2YXIgc2EgPSBhd2FpdCBzaGltLnN1YnRsZS5nZW5lcmF0ZUtleSh7bmFtZTogJ0VDRFNBJywgbmFtZWRDdXJ2ZTogJ1AtMjU2J30sIHRydWUsIFsgJ3NpZ24nLCAndmVyaWZ5JyBdKVxuICAgICAgLnRoZW4oYXN5bmMgKGtleXMpID0+IHtcbiAgICAgICAgLy8gcHJpdmF0ZUtleSBzY29wZSBkb2Vzbid0IGxlYWsgb3V0IGZyb20gaGVyZSFcbiAgICAgICAgLy9jb25zdCB7IGQ6IHByaXYgfSA9IGF3YWl0IHNoaW0uc3VidGxlLmV4cG9ydEtleSgnandrJywga2V5cy5wcml2YXRlS2V5KVxuICAgICAgICB2YXIga2V5ID0ge307XG4gICAgICAgIGtleS5wcml2ID0gKGF3YWl0IHNoaW0uc3VidGxlLmV4cG9ydEtleSgnandrJywga2V5cy5wcml2YXRlS2V5KSkuZDtcbiAgICAgICAgdmFyIHB1YiA9IGF3YWl0IHNoaW0uc3VidGxlLmV4cG9ydEtleSgnandrJywga2V5cy5wdWJsaWNLZXkpO1xuICAgICAgICAvL2NvbnN0IHB1YiA9IEJ1ZmYuZnJvbShbIHgsIHkgXS5qb2luKCc6JykpLnRvU3RyaW5nKCdiYXNlNjQnKSAvLyBvbGRcbiAgICAgICAga2V5LnB1YiA9IHB1Yi54KycuJytwdWIueTsgLy8gbmV3XG4gICAgICAgIC8vIHggYW5kIHkgYXJlIGFscmVhZHkgYmFzZTY0XG4gICAgICAgIC8vIHB1YiBpcyBVVEY4IGJ1dCBmaWxlbmFtZS9VUkwgc2FmZSAoaHR0cHM6Ly93d3cuaWV0Zi5vcmcvcmZjL3JmYzM5ODYudHh0KVxuICAgICAgICAvLyBidXQgc3BsaXQgb24gYSBub24tYmFzZTY0IGxldHRlci5cbiAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgIH0pXG4gICAgICBcbiAgICAgIC8vIFRvIGluY2x1ZGUgUEdQdjQga2luZCBvZiBrZXlJZDpcbiAgICAgIC8vIGNvbnN0IHB1YklkID0gYXdhaXQgU0VBLmtleWlkKGtleXMucHViKVxuICAgICAgLy8gTmV4dDogRUNESCBrZXlzIGZvciBlbmNyeXB0aW9uL2RlY3J5cHRpb24uLi5cblxuICAgICAgdHJ5e1xuICAgICAgdmFyIGRoID0gYXdhaXQgZWNkaFN1YnRsZS5nZW5lcmF0ZUtleSh7bmFtZTogJ0VDREgnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSwgdHJ1ZSwgWydkZXJpdmVLZXknXSlcbiAgICAgIC50aGVuKGFzeW5jIChrZXlzKSA9PiB7XG4gICAgICAgIC8vIHByaXZhdGVLZXkgc2NvcGUgZG9lc24ndCBsZWFrIG91dCBmcm9tIGhlcmUhXG4gICAgICAgIHZhciBrZXkgPSB7fTtcbiAgICAgICAga2V5LmVwcml2ID0gKGF3YWl0IGVjZGhTdWJ0bGUuZXhwb3J0S2V5KCdqd2snLCBrZXlzLnByaXZhdGVLZXkpKS5kO1xuICAgICAgICB2YXIgcHViID0gYXdhaXQgZWNkaFN1YnRsZS5leHBvcnRLZXkoJ2p3aycsIGtleXMucHVibGljS2V5KTtcbiAgICAgICAgLy9jb25zdCBlcHViID0gQnVmZi5mcm9tKFsgZXgsIGV5IF0uam9pbignOicpKS50b1N0cmluZygnYmFzZTY0JykgLy8gb2xkXG4gICAgICAgIGtleS5lcHViID0gcHViLngrJy4nK3B1Yi55OyAvLyBuZXdcbiAgICAgICAgLy8gZXggYW5kIGV5IGFyZSBhbHJlYWR5IGJhc2U2NFxuICAgICAgICAvLyBlcHViIGlzIFVURjggYnV0IGZpbGVuYW1lL1VSTCBzYWZlIChodHRwczovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMzk4Ni50eHQpXG4gICAgICAgIC8vIGJ1dCBzcGxpdCBvbiBhIG5vbi1iYXNlNjQgbGV0dGVyLlxuICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgfSlcbiAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgaWYoU0VBLndpbmRvdyl7IHRocm93IGUgfVxuICAgICAgICBpZihlID09ICdFcnJvcjogRUNESCBpcyBub3QgYSBzdXBwb3J0ZWQgYWxnb3JpdGhtJyl7IGNvbnNvbGUubG9nKCdJZ25vcmluZyBFQ0RILi4uJykgfVxuICAgICAgICBlbHNlIHsgdGhyb3cgZSB9XG4gICAgICB9IGRoID0gZGggfHwge307XG5cbiAgICAgIHZhciByID0geyBwdWI6IHNhLnB1YiwgcHJpdjogc2EucHJpdiwgLyogcHViSWQsICovIGVwdWI6IGRoLmVwdWIsIGVwcml2OiBkaC5lcHJpdiB9XG4gICAgICBpZihjYil7IHRyeXsgY2IocikgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICByZXR1cm4gcjtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgU0VBLmVyciA9IGU7XG4gICAgICBpZihTRUEudGhyb3cpeyB0aHJvdyBlIH1cbiAgICAgIGlmKGNiKXsgY2IoKSB9XG4gICAgICByZXR1cm47XG4gICAgfX0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUEucGFpcjtcbiAgfSkoVVNFLCAnLi9wYWlyJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBTRUEgPSBVU0UoJy4vcm9vdCcpO1xuICAgIHZhciBzaGltID0gVVNFKCcuL3NoaW0nKTtcbiAgICB2YXIgUyA9IFVTRSgnLi9zZXR0aW5ncycpO1xuICAgIHZhciBzaGEgPSBVU0UoJy4vc2hhMjU2Jyk7XG4gICAgdmFyIHU7XG5cbiAgICBTRUEuc2lnbiA9IFNFQS5zaWduIHx8IChhc3luYyAoZGF0YSwgcGFpciwgY2IsIG9wdCkgPT4geyB0cnkge1xuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgaWYoIShwYWlyfHxvcHQpLnByaXYpe1xuICAgICAgICBpZighU0VBLkkpeyB0aHJvdyAnTm8gc2lnbmluZyBrZXkuJyB9XG4gICAgICAgIHBhaXIgPSBhd2FpdCBTRUEuSShudWxsLCB7d2hhdDogZGF0YSwgaG93OiAnc2lnbicsIHdoeTogb3B0LndoeX0pO1xuICAgICAgfVxuICAgICAgaWYodSA9PT0gZGF0YSl7IHRocm93ICdgdW5kZWZpbmVkYCBub3QgYWxsb3dlZC4nIH1cbiAgICAgIHZhciBqc29uID0gYXdhaXQgUy5wYXJzZShkYXRhKTtcbiAgICAgIHZhciBjaGVjayA9IG9wdC5jaGVjayA9IG9wdC5jaGVjayB8fCBqc29uO1xuICAgICAgaWYoU0VBLnZlcmlmeSAmJiAoU0VBLm9wdC5jaGVjayhjaGVjaykgfHwgKGNoZWNrICYmIGNoZWNrLnMgJiYgY2hlY2subSkpXG4gICAgICAmJiB1ICE9PSBhd2FpdCBTRUEudmVyaWZ5KGNoZWNrLCBwYWlyKSl7IC8vIGRvbid0IHNpZ24gaWYgd2UgYWxyZWFkeSBzaWduZWQgaXQuXG4gICAgICAgIHZhciByID0gYXdhaXQgUy5wYXJzZShjaGVjayk7XG4gICAgICAgIGlmKCFvcHQucmF3KXsgciA9ICdTRUEnICsgYXdhaXQgc2hpbS5zdHJpbmdpZnkocikgfVxuICAgICAgICBpZihjYil7IHRyeXsgY2IocikgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICAgIHJldHVybiByO1xuICAgICAgfVxuICAgICAgdmFyIHB1YiA9IHBhaXIucHViO1xuICAgICAgdmFyIHByaXYgPSBwYWlyLnByaXY7XG4gICAgICB2YXIgandrID0gUy5qd2socHViLCBwcml2KTtcbiAgICAgIHZhciBoYXNoID0gYXdhaXQgc2hhKGpzb24pO1xuICAgICAgdmFyIHNpZyA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLmltcG9ydEtleSgnandrJywgandrLCB7bmFtZTogJ0VDRFNBJywgbmFtZWRDdXJ2ZTogJ1AtMjU2J30sIGZhbHNlLCBbJ3NpZ24nXSlcbiAgICAgIC50aGVuKChrZXkpID0+IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLnNpZ24oe25hbWU6ICdFQ0RTQScsIGhhc2g6IHtuYW1lOiAnU0hBLTI1Nid9fSwga2V5LCBuZXcgVWludDhBcnJheShoYXNoKSkpIC8vIHByaXZhdGVLZXkgc2NvcGUgZG9lc24ndCBsZWFrIG91dCBmcm9tIGhlcmUhXG4gICAgICB2YXIgciA9IHttOiBqc29uLCBzOiBzaGltLkJ1ZmZlci5mcm9tKHNpZywgJ2JpbmFyeScpLnRvU3RyaW5nKG9wdC5lbmNvZGUgfHwgJ2Jhc2U2NCcpfVxuICAgICAgaWYoIW9wdC5yYXcpeyByID0gJ1NFQScgKyBhd2FpdCBzaGltLnN0cmluZ2lmeShyKSB9XG5cbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBTRUEuZXJyID0gZTtcbiAgICAgIGlmKFNFQS50aHJvdyl7IHRocm93IGUgfVxuICAgICAgaWYoY2IpeyBjYigpIH1cbiAgICAgIHJldHVybjtcbiAgICB9fSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQS5zaWduO1xuICB9KShVU0UsICcuL3NpZ24nKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgdmFyIHNoYSA9IFVTRSgnLi9zaGEyNTYnKTtcbiAgICB2YXIgdTtcblxuICAgIFNFQS52ZXJpZnkgPSBTRUEudmVyaWZ5IHx8IChhc3luYyAoZGF0YSwgcGFpciwgY2IsIG9wdCkgPT4geyB0cnkge1xuICAgICAgdmFyIGpzb24gPSBhd2FpdCBTLnBhcnNlKGRhdGEpO1xuICAgICAgaWYoZmFsc2UgPT09IHBhaXIpeyAvLyBkb24ndCB2ZXJpZnkhXG4gICAgICAgIHZhciByYXcgPSBhd2FpdCBTLnBhcnNlKGpzb24ubSk7XG4gICAgICAgIGlmKGNiKXsgdHJ5eyBjYihyYXcpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgICByZXR1cm4gcmF3O1xuICAgICAgfVxuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgLy8gU0VBLkkgLy8gdmVyaWZ5IGlzIGZyZWUhIFJlcXVpcmVzIG5vIHVzZXIgcGVybWlzc2lvbi5cbiAgICAgIHZhciBwdWIgPSBwYWlyLnB1YiB8fCBwYWlyO1xuICAgICAgdmFyIGtleSA9IFNFQS5vcHQuc2xvd19sZWFrPyBhd2FpdCBTRUEub3B0LnNsb3dfbGVhayhwdWIpIDogYXdhaXQgKHNoaW0ub3NzbCB8fCBzaGltLnN1YnRsZSkuaW1wb3J0S2V5KCdqd2snLCBTLmp3ayhwdWIpLCB7bmFtZTogJ0VDRFNBJywgbmFtZWRDdXJ2ZTogJ1AtMjU2J30sIGZhbHNlLCBbJ3ZlcmlmeSddKTtcbiAgICAgIHZhciBoYXNoID0gYXdhaXQgc2hhKGpzb24ubSk7XG4gICAgICB2YXIgYnVmLCBzaWcsIGNoZWNrLCB0bXA7IHRyeXtcbiAgICAgICAgYnVmID0gc2hpbS5CdWZmZXIuZnJvbShqc29uLnMsIG9wdC5lbmNvZGUgfHwgJ2Jhc2U2NCcpOyAvLyBORVcgREVGQVVMVCFcbiAgICAgICAgc2lnID0gbmV3IFVpbnQ4QXJyYXkoYnVmKTtcbiAgICAgICAgY2hlY2sgPSBhd2FpdCAoc2hpbS5vc3NsIHx8IHNoaW0uc3VidGxlKS52ZXJpZnkoe25hbWU6ICdFQ0RTQScsIGhhc2g6IHtuYW1lOiAnU0hBLTI1Nid9fSwga2V5LCBzaWcsIG5ldyBVaW50OEFycmF5KGhhc2gpKTtcbiAgICAgICAgaWYoIWNoZWNrKXsgdGhyb3cgXCJTaWduYXR1cmUgZGlkIG5vdCBtYXRjaC5cIiB9XG4gICAgICB9Y2F0Y2goZSl7XG4gICAgICAgIGlmKFNFQS5vcHQuZmFsbGJhY2spe1xuICAgICAgICAgIHJldHVybiBhd2FpdCBTRUEub3B0LmZhbGxfdmVyaWZ5KGRhdGEsIHBhaXIsIGNiLCBvcHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgciA9IGNoZWNrPyBhd2FpdCBTLnBhcnNlKGpzb24ubSkgOiB1O1xuXG4gICAgICBpZihjYil7IHRyeXsgY2IocikgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICByZXR1cm4gcjtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpOyAvLyBtaXNtYXRjaGVkIG93bmVyIEZPUiBNQVJUVElcbiAgICAgIFNFQS5lcnIgPSBlO1xuICAgICAgaWYoU0VBLnRocm93KXsgdGhyb3cgZSB9XG4gICAgICBpZihjYil7IGNiKCkgfVxuICAgICAgcmV0dXJuO1xuICAgIH19KTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gU0VBLnZlcmlmeTtcbiAgICAvLyBsZWdhY3kgJiBvc3NsIG1lbW9yeSBsZWFrIG1pdGlnYXRpb246XG5cbiAgICB2YXIga25vd25LZXlzID0ge307XG4gICAgdmFyIGtleUZvclBhaXIgPSBTRUEub3B0LnNsb3dfbGVhayA9IHBhaXIgPT4ge1xuICAgICAgaWYgKGtub3duS2V5c1twYWlyXSkgcmV0dXJuIGtub3duS2V5c1twYWlyXTtcbiAgICAgIHZhciBqd2sgPSBTLmp3ayhwYWlyKTtcbiAgICAgIGtub3duS2V5c1twYWlyXSA9IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLmltcG9ydEtleShcImp3a1wiLCBqd2ssIHtuYW1lOiAnRUNEU0EnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSwgZmFsc2UsIFtcInZlcmlmeVwiXSk7XG4gICAgICByZXR1cm4ga25vd25LZXlzW3BhaXJdO1xuICAgIH07XG5cbiAgICB2YXIgTyA9IFNFQS5vcHQ7XG4gICAgU0VBLm9wdC5mYWxsX3ZlcmlmeSA9IGFzeW5jIGZ1bmN0aW9uKGRhdGEsIHBhaXIsIGNiLCBvcHQsIGYpe1xuICAgICAgaWYoZiA9PT0gU0VBLm9wdC5mYWxsYmFjayl7IHRocm93IFwiU2lnbmF0dXJlIGRpZCBub3QgbWF0Y2hcIiB9IGYgPSBmIHx8IDE7XG4gICAgICB2YXIgdG1wID0gZGF0YXx8Jyc7XG4gICAgICBkYXRhID0gU0VBLm9wdC51bnBhY2soZGF0YSkgfHwgZGF0YTtcbiAgICAgIHZhciBqc29uID0gYXdhaXQgUy5wYXJzZShkYXRhKSwgcHViID0gcGFpci5wdWIgfHwgcGFpciwga2V5ID0gYXdhaXQgU0VBLm9wdC5zbG93X2xlYWsocHViKTtcbiAgICAgIHZhciBoYXNoID0gKGYgPD0gU0VBLm9wdC5mYWxsYmFjayk/IHNoaW0uQnVmZmVyLmZyb20oYXdhaXQgc2hpbS5zdWJ0bGUuZGlnZXN0KHtuYW1lOiAnU0hBLTI1Nid9LCBuZXcgc2hpbS5UZXh0RW5jb2RlcigpLmVuY29kZShhd2FpdCBTLnBhcnNlKGpzb24ubSkpKSkgOiBhd2FpdCBzaGEoanNvbi5tKTsgLy8gdGhpcyBsaW5lIGlzIG9sZCBiYWQgYnVnZ3kgY29kZSBidXQgbmVjZXNzYXJ5IGZvciBvbGQgY29tcGF0aWJpbGl0eS5cbiAgICAgIHZhciBidWY7IHZhciBzaWc7IHZhciBjaGVjazsgdHJ5e1xuICAgICAgICBidWYgPSBzaGltLkJ1ZmZlci5mcm9tKGpzb24ucywgb3B0LmVuY29kZSB8fCAnYmFzZTY0JykgLy8gTkVXIERFRkFVTFQhXG4gICAgICAgIHNpZyA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICAgICAgY2hlY2sgPSBhd2FpdCAoc2hpbS5vc3NsIHx8IHNoaW0uc3VidGxlKS52ZXJpZnkoe25hbWU6ICdFQ0RTQScsIGhhc2g6IHtuYW1lOiAnU0hBLTI1Nid9fSwga2V5LCBzaWcsIG5ldyBVaW50OEFycmF5KGhhc2gpKVxuICAgICAgICBpZighY2hlY2speyB0aHJvdyBcIlNpZ25hdHVyZSBkaWQgbm90IG1hdGNoLlwiIH1cbiAgICAgIH1jYXRjaChlKXsgdHJ5e1xuICAgICAgICBidWYgPSBzaGltLkJ1ZmZlci5mcm9tKGpzb24ucywgJ3V0ZjgnKSAvLyBBVVRPIEJBQ0tXQVJEIE9MRCBVVEY4IERBVEEhXG4gICAgICAgIHNpZyA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICAgICAgY2hlY2sgPSBhd2FpdCAoc2hpbS5vc3NsIHx8IHNoaW0uc3VidGxlKS52ZXJpZnkoe25hbWU6ICdFQ0RTQScsIGhhc2g6IHtuYW1lOiAnU0hBLTI1Nid9fSwga2V5LCBzaWcsIG5ldyBVaW50OEFycmF5KGhhc2gpKVxuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgIGlmKCFjaGVjayl7IHRocm93IFwiU2lnbmF0dXJlIGRpZCBub3QgbWF0Y2guXCIgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgciA9IGNoZWNrPyBhd2FpdCBTLnBhcnNlKGpzb24ubSkgOiB1O1xuICAgICAgTy5mYWxsX3NvdWwgPSB0bXBbJyMnXTsgTy5mYWxsX2tleSA9IHRtcFsnLiddOyBPLmZhbGxfdmFsID0gZGF0YTsgTy5mYWxsX3N0YXRlID0gdG1wWyc+J107XG4gICAgICBpZihjYil7IHRyeXsgY2IocikgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICByZXR1cm4gcjtcbiAgICB9XG4gICAgU0VBLm9wdC5mYWxsYmFjayA9IDI7XG5cbiAgfSkoVVNFLCAnLi92ZXJpZnknKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgdmFyIHNoYTI1Nmhhc2ggPSBVU0UoJy4vc2hhMjU2Jyk7XG5cbiAgICBjb25zdCBpbXBvcnRHZW4gPSBhc3luYyAoa2V5LCBzYWx0LCBvcHQpID0+IHtcbiAgICAgIC8vY29uc3QgY29tYm8gPSBzaGltLkJ1ZmZlci5jb25jYXQoW3NoaW0uQnVmZmVyLmZyb20oa2V5LCAndXRmOCcpLCBzYWx0IHx8IHNoaW0ucmFuZG9tKDgpXSkudG9TdHJpbmcoJ3V0ZjgnKSAvLyBvbGRcbiAgICAgIG9wdCA9IG9wdCB8fCB7fTtcbiAgICAgIGNvbnN0IGNvbWJvID0ga2V5ICsgKHNhbHQgfHwgc2hpbS5yYW5kb20oOCkpLnRvU3RyaW5nKCd1dGY4Jyk7IC8vIG5ld1xuICAgICAgY29uc3QgaGFzaCA9IHNoaW0uQnVmZmVyLmZyb20oYXdhaXQgc2hhMjU2aGFzaChjb21ibyksICdiaW5hcnknKVxuICAgICAgXG4gICAgICBjb25zdCBqd2tLZXkgPSBTLmtleVRvSndrKGhhc2gpICAgICAgXG4gICAgICByZXR1cm4gYXdhaXQgc2hpbS5zdWJ0bGUuaW1wb3J0S2V5KCdqd2snLCBqd2tLZXksIHtuYW1lOidBRVMtR0NNJ30sIGZhbHNlLCBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddKVxuICAgIH1cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGltcG9ydEdlbjtcbiAgfSkoVVNFLCAnLi9hZXNrZXknKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgdmFyIGFlc2tleSA9IFVTRSgnLi9hZXNrZXknKTtcbiAgICB2YXIgdTtcblxuICAgIFNFQS5lbmNyeXB0ID0gU0VBLmVuY3J5cHQgfHwgKGFzeW5jIChkYXRhLCBwYWlyLCBjYiwgb3B0KSA9PiB7IHRyeSB7XG4gICAgICBvcHQgPSBvcHQgfHwge307XG4gICAgICB2YXIga2V5ID0gKHBhaXJ8fG9wdCkuZXByaXYgfHwgcGFpcjtcbiAgICAgIGlmKHUgPT09IGRhdGEpeyB0aHJvdyAnYHVuZGVmaW5lZGAgbm90IGFsbG93ZWQuJyB9XG4gICAgICBpZigha2V5KXtcbiAgICAgICAgaWYoIVNFQS5JKXsgdGhyb3cgJ05vIGVuY3J5cHRpb24ga2V5LicgfVxuICAgICAgICBwYWlyID0gYXdhaXQgU0VBLkkobnVsbCwge3doYXQ6IGRhdGEsIGhvdzogJ2VuY3J5cHQnLCB3aHk6IG9wdC53aHl9KTtcbiAgICAgICAga2V5ID0gcGFpci5lcHJpdiB8fCBwYWlyO1xuICAgICAgfVxuICAgICAgdmFyIG1zZyA9ICh0eXBlb2YgZGF0YSA9PSAnc3RyaW5nJyk/IGRhdGEgOiBhd2FpdCBzaGltLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgIHZhciByYW5kID0ge3M6IHNoaW0ucmFuZG9tKDkpLCBpdjogc2hpbS5yYW5kb20oMTUpfTsgLy8gY29uc2lkZXIgbWFraW5nIHRoaXMgOSBhbmQgMTUgb3IgMTggb3IgMTIgdG8gcmVkdWNlID09IHBhZGRpbmcuXG4gICAgICB2YXIgY3QgPSBhd2FpdCBhZXNrZXkoa2V5LCByYW5kLnMsIG9wdCkudGhlbigoYWVzKSA9PiAoLypzaGltLm9zc2wgfHwqLyBzaGltLnN1YnRsZSkuZW5jcnlwdCh7IC8vIEtlZXBpbmcgdGhlIEFFUyBrZXkgc2NvcGUgYXMgcHJpdmF0ZSBhcyBwb3NzaWJsZS4uLlxuICAgICAgICBuYW1lOiBvcHQubmFtZSB8fCAnQUVTLUdDTScsIGl2OiBuZXcgVWludDhBcnJheShyYW5kLml2KVxuICAgICAgfSwgYWVzLCBuZXcgc2hpbS5UZXh0RW5jb2RlcigpLmVuY29kZShtc2cpKSk7XG4gICAgICB2YXIgciA9IHtcbiAgICAgICAgY3Q6IHNoaW0uQnVmZmVyLmZyb20oY3QsICdiaW5hcnknKS50b1N0cmluZyhvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKSxcbiAgICAgICAgaXY6IHJhbmQuaXYudG9TdHJpbmcob3B0LmVuY29kZSB8fCAnYmFzZTY0JyksXG4gICAgICAgIHM6IHJhbmQucy50b1N0cmluZyhvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKVxuICAgICAgfVxuICAgICAgaWYoIW9wdC5yYXcpeyByID0gJ1NFQScgKyBhd2FpdCBzaGltLnN0cmluZ2lmeShyKSB9XG5cbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH0gY2F0Y2goZSkgeyBcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgU0VBLmVyciA9IGU7XG4gICAgICBpZihTRUEudGhyb3cpeyB0aHJvdyBlIH1cbiAgICAgIGlmKGNiKXsgY2IoKSB9XG4gICAgICByZXR1cm47XG4gICAgfX0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUEuZW5jcnlwdDtcbiAgfSkoVVNFLCAnLi9lbmNyeXB0Jyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBTRUEgPSBVU0UoJy4vcm9vdCcpO1xuICAgIHZhciBzaGltID0gVVNFKCcuL3NoaW0nKTtcbiAgICB2YXIgUyA9IFVTRSgnLi9zZXR0aW5ncycpO1xuICAgIHZhciBhZXNrZXkgPSBVU0UoJy4vYWVza2V5Jyk7XG5cbiAgICBTRUEuZGVjcnlwdCA9IFNFQS5kZWNyeXB0IHx8IChhc3luYyAoZGF0YSwgcGFpciwgY2IsIG9wdCkgPT4geyB0cnkge1xuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgdmFyIGtleSA9IChwYWlyfHxvcHQpLmVwcml2IHx8IHBhaXI7XG4gICAgICBpZigha2V5KXtcbiAgICAgICAgaWYoIVNFQS5JKXsgdGhyb3cgJ05vIGRlY3J5cHRpb24ga2V5LicgfVxuICAgICAgICBwYWlyID0gYXdhaXQgU0VBLkkobnVsbCwge3doYXQ6IGRhdGEsIGhvdzogJ2RlY3J5cHQnLCB3aHk6IG9wdC53aHl9KTtcbiAgICAgICAga2V5ID0gcGFpci5lcHJpdiB8fCBwYWlyO1xuICAgICAgfVxuICAgICAgdmFyIGpzb24gPSBhd2FpdCBTLnBhcnNlKGRhdGEpO1xuICAgICAgdmFyIGJ1ZiwgYnVmaXYsIGJ1ZmN0OyB0cnl7XG4gICAgICAgIGJ1ZiA9IHNoaW0uQnVmZmVyLmZyb20oanNvbi5zLCBvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKTtcbiAgICAgICAgYnVmaXYgPSBzaGltLkJ1ZmZlci5mcm9tKGpzb24uaXYsIG9wdC5lbmNvZGUgfHwgJ2Jhc2U2NCcpO1xuICAgICAgICBidWZjdCA9IHNoaW0uQnVmZmVyLmZyb20oanNvbi5jdCwgb3B0LmVuY29kZSB8fCAnYmFzZTY0Jyk7XG4gICAgICAgIHZhciBjdCA9IGF3YWl0IGFlc2tleShrZXksIGJ1Ziwgb3B0KS50aGVuKChhZXMpID0+ICgvKnNoaW0ub3NzbCB8fCovIHNoaW0uc3VidGxlKS5kZWNyeXB0KHsgIC8vIEtlZXBpbmcgYWVzS2V5IHNjb3BlIGFzIHByaXZhdGUgYXMgcG9zc2libGUuLi5cbiAgICAgICAgICBuYW1lOiBvcHQubmFtZSB8fCAnQUVTLUdDTScsIGl2OiBuZXcgVWludDhBcnJheShidWZpdiksIHRhZ0xlbmd0aDogMTI4XG4gICAgICAgIH0sIGFlcywgbmV3IFVpbnQ4QXJyYXkoYnVmY3QpKSk7XG4gICAgICB9Y2F0Y2goZSl7XG4gICAgICAgIGlmKCd1dGY4JyA9PT0gb3B0LmVuY29kZSl7IHRocm93IFwiQ291bGQgbm90IGRlY3J5cHRcIiB9XG4gICAgICAgIGlmKFNFQS5vcHQuZmFsbGJhY2spe1xuICAgICAgICAgIG9wdC5lbmNvZGUgPSAndXRmOCc7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IFNFQS5kZWNyeXB0KGRhdGEsIHBhaXIsIGNiLCBvcHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgciA9IGF3YWl0IFMucGFyc2UobmV3IHNoaW0uVGV4dERlY29kZXIoJ3V0ZjgnKS5kZWNvZGUoY3QpKTtcbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH0gY2F0Y2goZSkgeyBcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgU0VBLmVyciA9IGU7XG4gICAgICBpZihTRUEudGhyb3cpeyB0aHJvdyBlIH1cbiAgICAgIGlmKGNiKXsgY2IoKSB9XG4gICAgICByZXR1cm47XG4gICAgfX0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUEuZGVjcnlwdDtcbiAgfSkoVVNFLCAnLi9kZWNyeXB0Jyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBTRUEgPSBVU0UoJy4vcm9vdCcpO1xuICAgIHZhciBzaGltID0gVVNFKCcuL3NoaW0nKTtcbiAgICB2YXIgUyA9IFVTRSgnLi9zZXR0aW5ncycpO1xuICAgIC8vIERlcml2ZSBzaGFyZWQgc2VjcmV0IGZyb20gb3RoZXIncyBwdWIgYW5kIG15IGVwdWIvZXByaXYgXG4gICAgU0VBLnNlY3JldCA9IFNFQS5zZWNyZXQgfHwgKGFzeW5jIChrZXksIHBhaXIsIGNiLCBvcHQpID0+IHsgdHJ5IHtcbiAgICAgIG9wdCA9IG9wdCB8fCB7fTtcbiAgICAgIGlmKCFwYWlyIHx8ICFwYWlyLmVwcml2IHx8ICFwYWlyLmVwdWIpe1xuICAgICAgICBpZighU0VBLkkpeyB0aHJvdyAnTm8gc2VjcmV0IG1peC4nIH1cbiAgICAgICAgcGFpciA9IGF3YWl0IFNFQS5JKG51bGwsIHt3aGF0OiBrZXksIGhvdzogJ3NlY3JldCcsIHdoeTogb3B0LndoeX0pO1xuICAgICAgfVxuICAgICAgdmFyIHB1YiA9IGtleS5lcHViIHx8IGtleTtcbiAgICAgIHZhciBlcHViID0gcGFpci5lcHViO1xuICAgICAgdmFyIGVwcml2ID0gcGFpci5lcHJpdjtcbiAgICAgIHZhciBlY2RoU3VidGxlID0gc2hpbS5vc3NsIHx8IHNoaW0uc3VidGxlO1xuICAgICAgdmFyIHB1YktleURhdGEgPSBrZXlzVG9FY2RoSndrKHB1Yik7XG4gICAgICB2YXIgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgcHVibGljOiBhd2FpdCBlY2RoU3VidGxlLmltcG9ydEtleSguLi5wdWJLZXlEYXRhLCB0cnVlLCBbXSkgfSx7bmFtZTogJ0VDREgnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSk7IC8vIFRoYW5rcyB0byBAc2lycHkgIVxuICAgICAgdmFyIHByaXZLZXlEYXRhID0ga2V5c1RvRWNkaEp3ayhlcHViLCBlcHJpdik7XG4gICAgICB2YXIgZGVyaXZlZCA9IGF3YWl0IGVjZGhTdWJ0bGUuaW1wb3J0S2V5KC4uLnByaXZLZXlEYXRhLCBmYWxzZSwgWydkZXJpdmVCaXRzJ10pLnRoZW4oYXN5bmMgKHByaXZLZXkpID0+IHtcbiAgICAgICAgLy8gcHJpdmF0ZUtleSBzY29wZSBkb2Vzbid0IGxlYWsgb3V0IGZyb20gaGVyZSFcbiAgICAgICAgdmFyIGRlcml2ZWRCaXRzID0gYXdhaXQgZWNkaFN1YnRsZS5kZXJpdmVCaXRzKHByb3BzLCBwcml2S2V5LCAyNTYpO1xuICAgICAgICB2YXIgcmF3Qml0cyA9IG5ldyBVaW50OEFycmF5KGRlcml2ZWRCaXRzKTtcbiAgICAgICAgdmFyIGRlcml2ZWRLZXkgPSBhd2FpdCBlY2RoU3VidGxlLmltcG9ydEtleSgncmF3JywgcmF3Qml0cyx7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSwgdHJ1ZSwgWyAnZW5jcnlwdCcsICdkZWNyeXB0JyBdKTtcbiAgICAgICAgcmV0dXJuIGVjZGhTdWJ0bGUuZXhwb3J0S2V5KCdqd2snLCBkZXJpdmVkS2V5KS50aGVuKCh7IGsgfSkgPT4gayk7XG4gICAgICB9KVxuICAgICAgdmFyIHIgPSBkZXJpdmVkO1xuICAgICAgaWYoY2IpeyB0cnl7IGNiKHIpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgIFNFQS5lcnIgPSBlO1xuICAgICAgaWYoU0VBLnRocm93KXsgdGhyb3cgZSB9XG4gICAgICBpZihjYil7IGNiKCkgfVxuICAgICAgcmV0dXJuO1xuICAgIH19KTtcblxuICAgIC8vIGNhbiB0aGlzIGJlIHJlcGxhY2VkIHdpdGggc2V0dGluZ3MuandrP1xuICAgIHZhciBrZXlzVG9FY2RoSndrID0gKHB1YiwgZCkgPT4geyAvLyBkID09PSBwcml2XG4gICAgICAvL3ZhciBbIHgsIHkgXSA9IHNoaW0uQnVmZmVyLmZyb20ocHViLCAnYmFzZTY0JykudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnOicpIC8vIG9sZFxuICAgICAgdmFyIFsgeCwgeSBdID0gcHViLnNwbGl0KCcuJykgLy8gbmV3XG4gICAgICB2YXIgandrID0gZCA/IHsgZDogZCB9IDoge31cbiAgICAgIHJldHVybiBbICAvLyBVc2Ugd2l0aCBzcHJlYWQgcmV0dXJuZWQgdmFsdWUuLi5cbiAgICAgICAgJ2p3aycsXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgandrLFxuICAgICAgICAgIHsgeDogeCwgeTogeSwga3R5OiAnRUMnLCBjcnY6ICdQLTI1NicsIGV4dDogdHJ1ZSB9XG4gICAgICAgICksIC8vID8/PyByZWZhY3RvclxuICAgICAgICB7bmFtZTogJ0VDREgnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfVxuICAgICAgXVxuICAgIH1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gU0VBLnNlY3JldDtcbiAgfSkoVVNFLCAnLi9zZWNyZXQnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgLy8gVGhpcyBpcyB0byBjZXJ0aWZ5IHRoYXQgYSBncm91cCBvZiBcImNlcnRpZmljYW50c1wiIGNhbiBcInB1dFwiIGFueXRoaW5nIGF0IGEgZ3JvdXAgb2YgbWF0Y2hlZCBcInBhdGhzXCIgdG8gdGhlIGNlcnRpZmljYXRlIGF1dGhvcml0eSdzIGdyYXBoXG4gICAgU0VBLmNlcnRpZnkgPSBTRUEuY2VydGlmeSB8fCAoYXN5bmMgKGNlcnRpZmljYW50cywgcG9saWN5ID0ge30sIGF1dGhvcml0eSwgY2IsIG9wdCA9IHt9KSA9PiB7IHRyeSB7XG4gICAgICAvKlxuICAgICAgVGhlIENlcnRpZnkgUHJvdG9jb2wgd2FzIG1hZGUgb3V0IG9mIGxvdmUgYnkgYSBWaWV0bmFtZXNlIGNvZGUgZW50aHVzaWFzdC4gVmlldG5hbWVzZSBwZW9wbGUgYXJvdW5kIHRoZSB3b3JsZCBkZXNlcnZlIHJlc3BlY3QhXG4gICAgICBJTVBPUlRBTlQ6IEEgQ2VydGlmaWNhdGUgaXMgbGlrZSBhIFNpZ25hdHVyZS4gTm8gb25lIGtub3dzIHdobyAoYXV0aG9yaXR5KSBjcmVhdGVkL3NpZ25lZCBhIGNlcnQgdW50aWwgeW91IHB1dCBpdCBpbnRvIHRoZWlyIGdyYXBoLlxuICAgICAgXCJjZXJ0aWZpY2FudHNcIjogJyonIG9yIGEgU3RyaW5nIChCb2IucHViKSB8fCBhbiBPYmplY3QgdGhhdCBjb250YWlucyBcInB1YlwiIGFzIGEga2V5IHx8IGFuIGFycmF5IG9mIFtvYmplY3QgfHwgc3RyaW5nXS4gVGhlc2UgcGVvcGxlIHdpbGwgaGF2ZSB0aGUgcmlnaHRzLlxuICAgICAgXCJwb2xpY3lcIjogQSBzdHJpbmcgKCdpbmJveCcpLCBvciBhIFJBRC9MRVggb2JqZWN0IHsnKic6ICdpbmJveCd9LCBvciBhbiBBcnJheSBvZiBSQUQvTEVYIG9iamVjdHMgb3Igc3RyaW5ncy4gUkFEL0xFWCBvYmplY3QgY2FuIGNvbnRhaW4ga2V5IFwiP1wiIHdpdGggaW5kZXhPZihcIipcIikgPiAtMSB0byBmb3JjZSBrZXkgZXF1YWxzIGNlcnRpZmljYW50IHB1Yi4gVGhpcyBydWxlIGlzIHVzZWQgdG8gY2hlY2sgYWdhaW5zdCBzb3VsKycvJytrZXkgdXNpbmcgR3VuLnRleHQubWF0Y2ggb3IgU3RyaW5nLm1hdGNoLlxuICAgICAgXCJhdXRob3JpdHlcIjogS2V5IHBhaXIgb3IgcHJpdiBvZiB0aGUgY2VydGlmaWNhdGUgYXV0aG9yaXR5LlxuICAgICAgXCJjYlwiOiBBIGNhbGxiYWNrIGZ1bmN0aW9uIGFmdGVyIGFsbCB0aGluZ3MgYXJlIGRvbmUuXG4gICAgICBcIm9wdFwiOiBJZiBvcHQuZXhwaXJ5IChhIHRpbWVzdGFtcCkgaXMgc2V0LCBTRUEgd29uJ3Qgc3luYyBkYXRhIGFmdGVyIG9wdC5leHBpcnkuIElmIG9wdC5ibG9jayBpcyBzZXQsIFNFQSB3aWxsIGxvb2sgZm9yIGJsb2NrIGJlZm9yZSBzeW5jaW5nLlxuICAgICAgKi9cbiAgICAgIGNvbnNvbGUubG9nKCdTRUEuY2VydGlmeSgpIGlzIGFuIGVhcmx5IGV4cGVyaW1lbnRhbCBjb21tdW5pdHkgc3VwcG9ydGVkIG1ldGhvZCB0aGF0IG1heSBjaGFuZ2UgQVBJIGJlaGF2aW9yIHdpdGhvdXQgd2FybmluZyBpbiBhbnkgZnV0dXJlIHZlcnNpb24uJylcblxuICAgICAgY2VydGlmaWNhbnRzID0gKCgpID0+IHtcbiAgICAgICAgdmFyIGRhdGEgPSBbXVxuICAgICAgICBpZiAoY2VydGlmaWNhbnRzKSB7XG4gICAgICAgICAgaWYgKCh0eXBlb2YgY2VydGlmaWNhbnRzID09PSAnc3RyaW5nJyB8fCBBcnJheS5pc0FycmF5KGNlcnRpZmljYW50cykpICYmIGNlcnRpZmljYW50cy5pbmRleE9mKCcqJykgPiAtMSkgcmV0dXJuICcqJ1xuICAgICAgICAgIGlmICh0eXBlb2YgY2VydGlmaWNhbnRzID09PSAnc3RyaW5nJykgcmV0dXJuIGNlcnRpZmljYW50c1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNlcnRpZmljYW50cykpIHtcbiAgICAgICAgICAgIGlmIChjZXJ0aWZpY2FudHMubGVuZ3RoID09PSAxICYmIGNlcnRpZmljYW50c1swXSkgcmV0dXJuIHR5cGVvZiBjZXJ0aWZpY2FudHNbMF0gPT09ICdvYmplY3QnICYmIGNlcnRpZmljYW50c1swXS5wdWIgPyBjZXJ0aWZpY2FudHNbMF0ucHViIDogdHlwZW9mIGNlcnRpZmljYW50c1swXSA9PT0gJ3N0cmluZycgPyBjZXJ0aWZpY2FudHNbMF0gOiBudWxsXG4gICAgICAgICAgICBjZXJ0aWZpY2FudHMubWFwKGNlcnRpZmljYW50ID0+IHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjZXJ0aWZpY2FudCA9PT0nc3RyaW5nJykgZGF0YS5wdXNoKGNlcnRpZmljYW50KVxuICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgY2VydGlmaWNhbnQgPT09ICdvYmplY3QnICYmIGNlcnRpZmljYW50LnB1YikgZGF0YS5wdXNoKGNlcnRpZmljYW50LnB1YilcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBjZXJ0aWZpY2FudHMgPT09ICdvYmplY3QnICYmIGNlcnRpZmljYW50cy5wdWIpIHJldHVybiBjZXJ0aWZpY2FudHMucHViXG4gICAgICAgICAgcmV0dXJuIGRhdGEubGVuZ3RoID4gMCA/IGRhdGEgOiBudWxsXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9KSgpXG5cbiAgICAgIGlmICghY2VydGlmaWNhbnRzKSByZXR1cm4gY29uc29sZS5sb2coXCJObyBjZXJ0aWZpY2FudCBmb3VuZC5cIilcblxuICAgICAgY29uc3QgZXhwaXJ5ID0gb3B0LmV4cGlyeSAmJiAodHlwZW9mIG9wdC5leHBpcnkgPT09ICdudW1iZXInIHx8IHR5cGVvZiBvcHQuZXhwaXJ5ID09PSAnc3RyaW5nJykgPyBwYXJzZUZsb2F0KG9wdC5leHBpcnkpIDogbnVsbFxuICAgICAgY29uc3QgcmVhZFBvbGljeSA9IChwb2xpY3kgfHwge30pLnJlYWQgPyBwb2xpY3kucmVhZCA6IG51bGxcbiAgICAgIGNvbnN0IHdyaXRlUG9saWN5ID0gKHBvbGljeSB8fCB7fSkud3JpdGUgPyBwb2xpY3kud3JpdGUgOiB0eXBlb2YgcG9saWN5ID09PSAnc3RyaW5nJyB8fCBBcnJheS5pc0FycmF5KHBvbGljeSkgfHwgcG9saWN5W1wiK1wiXSB8fCBwb2xpY3lbXCIjXCJdIHx8IHBvbGljeVtcIi5cIl0gfHwgcG9saWN5W1wiPVwiXSB8fCBwb2xpY3lbXCIqXCJdIHx8IHBvbGljeVtcIj5cIl0gfHwgcG9saWN5W1wiPFwiXSA/IHBvbGljeSA6IG51bGxcbiAgICAgIC8vIFRoZSBcImJsYWNrbGlzdFwiIGZlYXR1cmUgaXMgbm93IHJlbmFtZWQgdG8gXCJibG9ja1wiLiBXaHkgPyBCRUNBVVNFIEJMQUNLIExJVkVTIE1BVFRFUiFcbiAgICAgIC8vIFdlIGNhbiBub3cgdXNlIDMga2V5czogYmxvY2ssIGJsYWNrbGlzdCwgYmFuXG4gICAgICBjb25zdCBibG9jayA9IChvcHQgfHwge30pLmJsb2NrIHx8IChvcHQgfHwge30pLmJsYWNrbGlzdCB8fCAob3B0IHx8IHt9KS5iYW4gfHwge31cbiAgICAgIGNvbnN0IHJlYWRCbG9jayA9IGJsb2NrLnJlYWQgJiYgKHR5cGVvZiBibG9jay5yZWFkID09PSAnc3RyaW5nJyB8fCAoYmxvY2sucmVhZCB8fCB7fSlbJyMnXSkgPyBibG9jay5yZWFkIDogbnVsbFxuICAgICAgY29uc3Qgd3JpdGVCbG9jayA9IHR5cGVvZiBibG9jayA9PT0gJ3N0cmluZycgPyBibG9jayA6IGJsb2NrLndyaXRlICYmICh0eXBlb2YgYmxvY2sud3JpdGUgPT09ICdzdHJpbmcnIHx8IGJsb2NrLndyaXRlWycjJ10pID8gYmxvY2sud3JpdGUgOiBudWxsXG5cbiAgICAgIGlmICghcmVhZFBvbGljeSAmJiAhd3JpdGVQb2xpY3kpIHJldHVybiBjb25zb2xlLmxvZyhcIk5vIHBvbGljeSBmb3VuZC5cIilcblxuICAgICAgLy8gcmVzZXJ2ZWQga2V5czogYywgZSwgciwgdywgcmIsIHdiXG4gICAgICBjb25zdCBkYXRhID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjOiBjZXJ0aWZpY2FudHMsXG4gICAgICAgIC4uLihleHBpcnkgPyB7ZTogZXhwaXJ5fSA6IHt9KSwgLy8gaW5qZWN0IGV4cGlyeSBpZiBwb3NzaWJsZVxuICAgICAgICAuLi4ocmVhZFBvbGljeSA/IHtyOiByZWFkUG9saWN5IH0gIDoge30pLCAvLyBcInJcIiBzdGFuZHMgZm9yIHJlYWQsIHdoaWNoIG1lYW5zIHJlYWQgcGVybWlzc2lvbi5cbiAgICAgICAgLi4uKHdyaXRlUG9saWN5ID8ge3c6IHdyaXRlUG9saWN5fSA6IHt9KSwgLy8gXCJ3XCIgc3RhbmRzIGZvciB3cml0ZSwgd2hpY2ggbWVhbnMgd3JpdGUgcGVybWlzc2lvbi5cbiAgICAgICAgLi4uKHJlYWRCbG9jayA/IHtyYjogcmVhZEJsb2NrfSA6IHt9KSwgLy8gaW5qZWN0IFJFQUQgYmxvY2sgaWYgcG9zc2libGVcbiAgICAgICAgLi4uKHdyaXRlQmxvY2sgPyB7d2I6IHdyaXRlQmxvY2t9IDoge30pLCAvLyBpbmplY3QgV1JJVEUgYmxvY2sgaWYgcG9zc2libGVcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGNlcnRpZmljYXRlID0gYXdhaXQgU0VBLnNpZ24oZGF0YSwgYXV0aG9yaXR5LCBudWxsLCB7cmF3OjF9KVxuXG4gICAgICB2YXIgciA9IGNlcnRpZmljYXRlXG4gICAgICBpZighb3B0LnJhdyl7IHIgPSAnU0VBJytKU09OLnN0cmluZ2lmeShyKSB9XG4gICAgICBpZihjYil7IHRyeXsgY2IocikgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICByZXR1cm4gcjtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIFNFQS5lcnIgPSBlO1xuICAgICAgaWYoU0VBLnRocm93KXsgdGhyb3cgZSB9XG4gICAgICBpZihjYil7IGNiKCkgfVxuICAgICAgcmV0dXJuO1xuICAgIH19KTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gU0VBLmNlcnRpZnk7XG4gIH0pKFVTRSwgJy4vY2VydGlmeScpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgc2hpbSA9IFVTRSgnLi9zaGltJyk7XG4gICAgLy8gUHJhY3RpY2FsIGV4YW1wbGVzIGFib3V0IHVzYWdlIGZvdW5kIGluIHRlc3RzLlxuICAgIHZhciBTRUEgPSBVU0UoJy4vcm9vdCcpO1xuICAgIFNFQS53b3JrID0gVVNFKCcuL3dvcmsnKTtcbiAgICBTRUEuc2lnbiA9IFVTRSgnLi9zaWduJyk7XG4gICAgU0VBLnZlcmlmeSA9IFVTRSgnLi92ZXJpZnknKTtcbiAgICBTRUEuZW5jcnlwdCA9IFVTRSgnLi9lbmNyeXB0Jyk7XG4gICAgU0VBLmRlY3J5cHQgPSBVU0UoJy4vZGVjcnlwdCcpO1xuICAgIFNFQS5jZXJ0aWZ5ID0gVVNFKCcuL2NlcnRpZnknKTtcbiAgICAvL1NFQS5vcHQuYWVza2V5ID0gVVNFKCcuL2Flc2tleScpOyAvLyBub3Qgb2ZmaWNpYWwhIC8vIHRoaXMgY2F1c2VzIHByb2JsZW1zIGluIGxhdGVzdCBXZWJDcnlwdG8uXG5cbiAgICBTRUEucmFuZG9tID0gU0VBLnJhbmRvbSB8fCBzaGltLnJhbmRvbTtcblxuICAgIC8vIFRoaXMgaXMgQnVmZmVyIHVzZWQgaW4gU0VBIGFuZCB1c2FibGUgZnJvbSBHdW4vU0VBIGFwcGxpY2F0aW9uIGFsc28uXG4gICAgLy8gRm9yIGRvY3VtZW50YXRpb24gc2VlIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvYnVmZmVyLmh0bWxcbiAgICBTRUEuQnVmZmVyID0gU0VBLkJ1ZmZlciB8fCBVU0UoJy4vYnVmZmVyJyk7XG5cbiAgICAvLyBUaGVzZSBTRUEgZnVuY3Rpb25zIHN1cHBvcnQgbm93IG9ueSBQcm9taXNlcyBvclxuICAgIC8vIGFzeW5jL2F3YWl0IChjb21wYXRpYmxlKSBjb2RlLCB1c2UgdGhvc2UgbGlrZSBQcm9taXNlcy5cbiAgICAvL1xuICAgIC8vIENyZWF0ZXMgYSB3cmFwcGVyIGxpYnJhcnkgYXJvdW5kIFdlYiBDcnlwdG8gQVBJXG4gICAgLy8gZm9yIHZhcmlvdXMgQUVTLCBFQ0RTQSwgUEJLREYyIGZ1bmN0aW9ucyB3ZSBjYWxsZWQgYWJvdmUuXG4gICAgLy8gQ2FsY3VsYXRlIHB1YmxpYyBrZXkgS2V5SUQgYWthIFBHUHY0IChyZXN1bHQ6IDggYnl0ZXMgYXMgaGV4IHN0cmluZylcbiAgICBTRUEua2V5aWQgPSBTRUEua2V5aWQgfHwgKGFzeW5jIChwdWIpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGJhc2U2NCgnYmFzZTY0KHgpOmJhc2U2NCh5KScpID0+IHNoaW0uQnVmZmVyKHh5KVxuICAgICAgICBjb25zdCBwYiA9IHNoaW0uQnVmZmVyLmNvbmNhdChcbiAgICAgICAgICBwdWIucmVwbGFjZSgvLS9nLCAnKycpLnJlcGxhY2UoL18vZywgJy8nKS5zcGxpdCgnLicpXG4gICAgICAgICAgLm1hcCgodCkgPT4gc2hpbS5CdWZmZXIuZnJvbSh0LCAnYmFzZTY0JykpXG4gICAgICAgIClcbiAgICAgICAgLy8gaWQgaXMgUEdQdjQgY29tcGxpYW50IHJhdyBrZXlcbiAgICAgICAgY29uc3QgaWQgPSBzaGltLkJ1ZmZlci5jb25jYXQoW1xuICAgICAgICAgIHNoaW0uQnVmZmVyLmZyb20oWzB4OTksIHBiLmxlbmd0aCAvIDB4MTAwLCBwYi5sZW5ndGggJSAweDEwMF0pLCBwYlxuICAgICAgICBdKVxuICAgICAgICBjb25zdCBzaGExID0gYXdhaXQgc2hhMWhhc2goaWQpXG4gICAgICAgIGNvbnN0IGhhc2ggPSBzaGltLkJ1ZmZlci5mcm9tKHNoYTEsICdiaW5hcnknKVxuICAgICAgICByZXR1cm4gaGFzaC50b1N0cmluZygnaGV4JywgaGFzaC5sZW5ndGggLSA4KSAgLy8gMTYtYml0IElEIGFzIGhleFxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICB0aHJvdyBlXG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8gYWxsIGRvbmUhXG4gICAgLy8gT2J2aW91c2x5IGl0IGlzIG1pc3NpbmcgTUFOWSBuZWNlc3NhcnkgZmVhdHVyZXMuIFRoaXMgaXMgb25seSBhbiBhbHBoYSByZWxlYXNlLlxuICAgIC8vIFBsZWFzZSBleHBlcmltZW50IHdpdGggaXQsIGF1ZGl0IHdoYXQgSSd2ZSBkb25lIHNvIGZhciwgYW5kIGNvbXBsYWluIGFib3V0IHdoYXQgbmVlZHMgdG8gYmUgYWRkZWQuXG4gICAgLy8gU0VBIHNob3VsZCBiZSBhIGZ1bGwgc3VpdGUgdGhhdCBpcyBlYXN5IGFuZCBzZWFtbGVzcyB0byB1c2UuXG4gICAgLy8gQWdhaW4sIHNjcm9sbCBuYWVyIHRoZSB0b3AsIHdoZXJlIEkgcHJvdmlkZSBhbiBFWEFNUExFIG9mIGhvdyB0byBjcmVhdGUgYSB1c2VyIGFuZCBzaWduIGluLlxuICAgIC8vIE9uY2UgbG9nZ2VkIGluLCB0aGUgcmVzdCBvZiB0aGUgY29kZSB5b3UganVzdCByZWFkIGhhbmRsZWQgYXV0b21hdGljYWxseSBzaWduaW5nL3ZhbGlkYXRpbmcgZGF0YS5cbiAgICAvLyBCdXQgYWxsIG90aGVyIGJlaGF2aW9yIG5lZWRzIHRvIGJlIGVxdWFsbHkgZWFzeSwgbGlrZSBvcGluaW9uYXRlZCB3YXlzIG9mXG4gICAgLy8gQWRkaW5nIGZyaWVuZHMgKHRydXN0ZWQgcHVibGljIGtleXMpLCBzZW5kaW5nIHByaXZhdGUgbWVzc2FnZXMsIGV0Yy5cbiAgICAvLyBDaGVlcnMhIFRlbGwgbWUgd2hhdCB5b3UgdGhpbmsuXG4gICAgKChTRUEud2luZG93fHx7fSkuR1VOfHx7fSkuU0VBID0gU0VBO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUFcbiAgICAvLyAtLS0tLS0tLS0tLS0tLSBFTkQgU0VBIE1PRFVMRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAtLSBCRUdJTiBTRUErR1VOIE1PRFVMRVM6IEJVTkRMRUQgQlkgREVGQVVMVCBVTlRJTCBPVEhFUlMgVVNFIFNFQSBPTiBPV04gLS0tLS0tLVxuICB9KShVU0UsICcuL3NlYScpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3NlYScpLCBHdW4sIHU7XG4gICAgaWYoU0VBLndpbmRvdyl7XG4gICAgICBHdW4gPSBTRUEud2luZG93LkdVTiB8fCB7Y2hhaW46e319O1xuICAgIH0gZWxzZSB7XG4gICAgICBHdW4gPSBVU0UoKHUrJycgPT0gdHlwZW9mIE1PRFVMRT8nLic6JycpKycuL2d1bicsIDEpO1xuICAgIH1cbiAgICBTRUEuR1VOID0gR3VuO1xuXG4gICAgZnVuY3Rpb24gVXNlcihyb290KXsgXG4gICAgICB0aGlzLl8gPSB7JDogdGhpc307XG4gICAgfVxuICAgIFVzZXIucHJvdG90eXBlID0gKGZ1bmN0aW9uKCl7IGZ1bmN0aW9uIEYoKXt9OyBGLnByb3RvdHlwZSA9IEd1bi5jaGFpbjsgcmV0dXJuIG5ldyBGKCkgfSgpKSAvLyBPYmplY3QuY3JlYXRlIHBvbHlmaWxsXG4gICAgVXNlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBVc2VyO1xuXG4gICAgLy8gbGV0J3MgZXh0ZW5kIHRoZSBndW4gY2hhaW4gd2l0aCBhIGB1c2VyYCBmdW5jdGlvbi5cbiAgICAvLyBvbmx5IG9uZSB1c2VyIGNhbiBiZSBsb2dnZWQgaW4gYXQgYSB0aW1lLCBwZXIgZ3VuIGluc3RhbmNlLlxuICAgIEd1bi5jaGFpbi51c2VyID0gZnVuY3Rpb24ocHViKXtcbiAgICAgIHZhciBndW4gPSB0aGlzLCByb290ID0gZ3VuLmJhY2soLTEpLCB1c2VyO1xuICAgICAgaWYocHViKXtcbiAgICAgICAgcHViID0gU0VBLm9wdC5wdWIoKHB1Yi5ffHwnJylbJyMnXSkgfHwgcHViO1xuICAgICAgICByZXR1cm4gcm9vdC5nZXQoJ34nK3B1Yik7XG4gICAgICB9XG4gICAgICBpZih1c2VyID0gcm9vdC5iYWNrKCd1c2VyJykpeyByZXR1cm4gdXNlciB9XG4gICAgICB2YXIgcm9vdCA9IChyb290Ll8pLCBhdCA9IHJvb3QsIHV1aWQgPSBhdC5vcHQudXVpZCB8fCBsZXg7XG4gICAgICAoYXQgPSAodXNlciA9IGF0LnVzZXIgPSBndW4uY2hhaW4obmV3IFVzZXIpKS5fKS5vcHQgPSB7fTtcbiAgICAgIGF0Lm9wdC51dWlkID0gZnVuY3Rpb24oY2Ipe1xuICAgICAgICB2YXIgaWQgPSB1dWlkKCksIHB1YiA9IHJvb3QudXNlcjtcbiAgICAgICAgaWYoIXB1YiB8fCAhKHB1YiA9IHB1Yi5pcykgfHwgIShwdWIgPSBwdWIucHViKSl7IHJldHVybiBpZCB9XG4gICAgICAgIGlkID0gJ34nICsgcHViICsgJy8nICsgaWQ7XG4gICAgICAgIGlmKGNiICYmIGNiLmNhbGwpeyBjYihudWxsLCBpZCkgfVxuICAgICAgICByZXR1cm4gaWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdXNlcjtcbiAgICB9XG4gICAgZnVuY3Rpb24gbGV4KCl7IHJldHVybiBHdW4uc3RhdGUoKS50b1N0cmluZygzNikucmVwbGFjZSgnLicsJycpIH1cbiAgICBHdW4uVXNlciA9IFVzZXI7XG4gICAgVXNlci5HVU4gPSBHdW47XG4gICAgVXNlci5TRUEgPSBHdW4uU0VBID0gU0VBO1xuICAgIG1vZHVsZS5leHBvcnRzID0gVXNlcjtcbiAgfSkoVVNFLCAnLi91c2VyJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciB1LCBHdW4gPSAoJycrdSAhPSB0eXBlb2Ygd2luZG93KT8gKHdpbmRvdy5HdW58fHtjaGFpbjp7fX0pIDogVVNFKCgnJyt1ID09PSB0eXBlb2YgTU9EVUxFPycuJzonJykrJy4vZ3VuJywgMSk7XG4gICAgR3VuLmNoYWluLnRoZW4gPSBmdW5jdGlvbihjYiwgb3B0KXtcbiAgICAgIHZhciBndW4gPSB0aGlzLCBwID0gKG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgICAgZ3VuLm9uY2UocmVzLCBvcHQpO1xuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIGNiPyBwLnRoZW4oY2IpIDogcDtcbiAgICB9XG4gIH0pKFVTRSwgJy4vdGhlbicpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgVXNlciA9IFVTRSgnLi91c2VyJyksIFNFQSA9IFVzZXIuU0VBLCBHdW4gPSBVc2VyLkdVTiwgbm9vcCA9IGZ1bmN0aW9uKCl7fTtcblxuICAgIC8vIFdlbGwgZmlyc3Qgd2UgaGF2ZSB0byBhY3R1YWxseSBjcmVhdGUgYSB1c2VyLiBUaGF0IGlzIHdoYXQgdGhpcyBmdW5jdGlvbiBkb2VzLlxuICAgIFVzZXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKC4uLmFyZ3Mpe1xuICAgICAgdmFyIHBhaXIgPSB0eXBlb2YgYXJnc1swXSA9PT0gJ29iamVjdCcgJiYgKGFyZ3NbMF0ucHViIHx8IGFyZ3NbMF0uZXB1YikgPyBhcmdzWzBdIDogdHlwZW9mIGFyZ3NbMV0gPT09ICdvYmplY3QnICYmIChhcmdzWzFdLnB1YiB8fCBhcmdzWzFdLmVwdWIpID8gYXJnc1sxXSA6IG51bGw7XG4gICAgICB2YXIgYWxpYXMgPSBwYWlyICYmIChwYWlyLnB1YiB8fCBwYWlyLmVwdWIpID8gcGFpci5wdWIgOiB0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycgPyBhcmdzWzBdIDogbnVsbDtcbiAgICAgIHZhciBwYXNzID0gcGFpciAmJiAocGFpci5wdWIgfHwgcGFpci5lcHViKSA/IHBhaXIgOiBhbGlhcyAmJiB0eXBlb2YgYXJnc1sxXSA9PT0gJ3N0cmluZycgPyBhcmdzWzFdIDogbnVsbDtcbiAgICAgIHZhciBjYiA9IGFyZ3MuZmlsdGVyKGFyZyA9PiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nKVswXSB8fCBudWxsOyAvLyBjYiBub3cgY2FuIHN0YW5kIGFueXdoZXJlLCBhZnRlciBhbGlhcy9wYXNzIG9yIHBhaXJcbiAgICAgIHZhciBvcHQgPSBhcmdzICYmIGFyZ3MubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJnc1thcmdzLmxlbmd0aC0xXSA9PT0gJ29iamVjdCcgPyBhcmdzW2FyZ3MubGVuZ3RoLTFdIDoge307IC8vIG9wdCBpcyBhbHdheXMgdGhlIGxhc3QgcGFyYW1ldGVyIHdoaWNoIHR5cGVvZiA9PT0gJ29iamVjdCcgYW5kIHN0YW5kcyBhZnRlciBjYlxuICAgICAgXG4gICAgICB2YXIgZ3VuID0gdGhpcywgY2F0ID0gKGd1bi5fKSwgcm9vdCA9IGd1bi5iYWNrKC0xKTtcbiAgICAgIGNiID0gY2IgfHwgbm9vcDtcbiAgICAgIG9wdCA9IG9wdCB8fCB7fTtcbiAgICAgIGlmKGZhbHNlICE9PSBvcHQuY2hlY2spe1xuICAgICAgICB2YXIgZXJyO1xuICAgICAgICBpZighYWxpYXMpeyBlcnIgPSBcIk5vIHVzZXIuXCIgfVxuICAgICAgICBpZigocGFzc3x8JycpLmxlbmd0aCA8IDgpeyBlcnIgPSBcIlBhc3N3b3JkIHRvbyBzaG9ydCFcIiB9XG4gICAgICAgIGlmKGVycil7XG4gICAgICAgICAgY2Ioe2VycjogR3VuLmxvZyhlcnIpfSk7XG4gICAgICAgICAgcmV0dXJuIGd1bjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYoY2F0LmluZyl7XG4gICAgICAgIChjYiB8fCBub29wKSh7ZXJyOiBHdW4ubG9nKFwiVXNlciBpcyBhbHJlYWR5IGJlaW5nIGNyZWF0ZWQgb3IgYXV0aGVudGljYXRlZCFcIiksIHdhaXQ6IHRydWV9KTtcbiAgICAgICAgcmV0dXJuIGd1bjtcbiAgICAgIH1cbiAgICAgIGNhdC5pbmcgPSB0cnVlO1xuICAgICAgdmFyIGFjdCA9IHt9LCB1O1xuICAgICAgYWN0LmEgPSBmdW5jdGlvbihwdWJzKXtcbiAgICAgICAgYWN0LnB1YnMgPSBwdWJzO1xuICAgICAgICBpZihwdWJzICYmICFvcHQuYWxyZWFkeSl7XG4gICAgICAgICAgLy8gSWYgd2UgY2FuIGVuZm9yY2UgdGhhdCBhIHVzZXIgbmFtZSBpcyBhbHJlYWR5IHRha2VuLCBpdCBtaWdodCBiZSBuaWNlIHRvIHRyeSwgYnV0IHRoaXMgaXMgbm90IGd1YXJhbnRlZWQuXG4gICAgICAgICAgdmFyIGFjayA9IHtlcnI6IEd1bi5sb2coJ1VzZXIgYWxyZWFkeSBjcmVhdGVkIScpfTtcbiAgICAgICAgICBjYXQuaW5nID0gZmFsc2U7XG4gICAgICAgICAgKGNiIHx8IG5vb3ApKGFjayk7XG4gICAgICAgICAgZ3VuLmxlYXZlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFjdC5zYWx0ID0gU3RyaW5nLnJhbmRvbSg2NCk7IC8vIHBzZXVkby1yYW5kb21seSBjcmVhdGUgYSBzYWx0LCB0aGVuIHVzZSBQQktERjIgZnVuY3Rpb24gdG8gZXh0ZW5kIHRoZSBwYXNzd29yZCB3aXRoIGl0LlxuICAgICAgICBTRUEud29yayhwYXNzLCBhY3Quc2FsdCwgYWN0LmIpOyAvLyB0aGlzIHdpbGwgdGFrZSBzb21lIHNob3J0IGFtb3VudCBvZiB0aW1lIHRvIHByb2R1Y2UgYSBwcm9vZiwgd2hpY2ggc2xvd3MgYnJ1dGUgZm9yY2UgYXR0YWNrcy5cbiAgICAgIH1cbiAgICAgIGFjdC5iID0gZnVuY3Rpb24ocHJvb2Ype1xuICAgICAgICBhY3QucHJvb2YgPSBwcm9vZjtcbiAgICAgICAgcGFpciA/IGFjdC5jKHBhaXIpIDogU0VBLnBhaXIoYWN0LmMpIC8vIGdlbmVyYXRlIGEgYnJhbmQgbmV3IGtleSBwYWlyIG9yIHVzZSB0aGUgZXhpc3RpbmcuXG4gICAgICB9XG4gICAgICBhY3QuYyA9IGZ1bmN0aW9uKHBhaXIpe1xuICAgICAgICB2YXIgdG1wXG4gICAgICAgIGFjdC5wYWlyID0gcGFpciB8fCB7fTtcbiAgICAgICAgaWYodG1wID0gY2F0LnJvb3QudXNlcil7XG4gICAgICAgICAgdG1wLl8uc2VhID0gcGFpcjtcbiAgICAgICAgICB0bXAuaXMgPSB7cHViOiBwYWlyLnB1YiwgZXB1YjogcGFpci5lcHViLCBhbGlhczogYWxpYXN9O1xuICAgICAgICB9XG4gICAgICAgIC8vIHRoZSB1c2VyJ3MgcHVibGljIGtleSBkb2Vzbid0IG5lZWQgdG8gYmUgc2lnbmVkLiBCdXQgZXZlcnl0aGluZyBlbHNlIG5lZWRzIHRvIGJlIHNpZ25lZCB3aXRoIGl0ISAvLyB3ZSBoYXZlIG5vdyBhdXRvbWF0ZWQgaXQhIGNsZWFuIHVwIHRoZXNlIGV4dHJhIHN0ZXBzIG5vdyFcbiAgICAgICAgYWN0LmRhdGEgPSB7cHViOiBwYWlyLnB1Yn07XG4gICAgICAgIGFjdC5kKCk7XG4gICAgICB9XG4gICAgICBhY3QuZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGFjdC5kYXRhLmFsaWFzID0gYWxpYXM7XG4gICAgICAgIGFjdC5lKCk7XG4gICAgICB9XG4gICAgICBhY3QuZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGFjdC5kYXRhLmVwdWIgPSBhY3QucGFpci5lcHViOyBcbiAgICAgICAgU0VBLmVuY3J5cHQoe3ByaXY6IGFjdC5wYWlyLnByaXYsIGVwcml2OiBhY3QucGFpci5lcHJpdn0sIGFjdC5wcm9vZiwgYWN0LmYsIHtyYXc6MX0pOyAvLyB0byBrZWVwIHRoZSBwcml2YXRlIGtleSBzYWZlLCB3ZSBBRVMgZW5jcnlwdCBpdCB3aXRoIHRoZSBwcm9vZiBvZiB3b3JrIVxuICAgICAgfVxuICAgICAgYWN0LmYgPSBmdW5jdGlvbihhdXRoKXtcbiAgICAgICAgYWN0LmRhdGEuYXV0aCA9IEpTT04uc3RyaW5naWZ5KHtlazogYXV0aCwgczogYWN0LnNhbHR9KTsgXG4gICAgICAgIGFjdC5nKGFjdC5kYXRhLmF1dGgpO1xuICAgICAgfVxuICAgICAgYWN0LmcgPSBmdW5jdGlvbihhdXRoKXsgdmFyIHRtcDtcbiAgICAgICAgYWN0LmRhdGEuYXV0aCA9IGFjdC5kYXRhLmF1dGggfHwgYXV0aDtcbiAgICAgICAgcm9vdC5nZXQodG1wID0gJ34nK2FjdC5wYWlyLnB1YikucHV0KGFjdC5kYXRhKS5vbihhY3QuaCk7IC8vIGF3ZXNvbWUsIG5vdyB3ZSBjYW4gYWN0dWFsbHkgc2F2ZSB0aGUgdXNlciB3aXRoIHRoZWlyIHB1YmxpYyBrZXkgYXMgdGhlaXIgSUQuXG4gICAgICAgIHZhciBsaW5rID0ge307IGxpbmtbdG1wXSA9IHsnIyc6IHRtcH07IHJvb3QuZ2V0KCd+QCcrYWxpYXMpLnB1dChsaW5rKS5nZXQodG1wKS5vbihhY3QuaSk7IC8vIG5leHQgdXAsIHdlIHdhbnQgdG8gYXNzb2NpYXRlIHRoZSBhbGlhcyB3aXRoIHRoZSBwdWJsaWMga2V5LiBTbyB3ZSBhZGQgaXQgdG8gdGhlIGFsaWFzIGxpc3QuXG4gICAgICB9XG4gICAgICBhY3QuaCA9IGZ1bmN0aW9uKGRhdGEsIGtleSwgbXNnLCBldmUpe1xuICAgICAgICBldmUub2ZmKCk7IGFjdC5oLm9rID0gMTsgYWN0LmkoKTtcbiAgICAgIH1cbiAgICAgIGFjdC5pID0gZnVuY3Rpb24oZGF0YSwga2V5LCBtc2csIGV2ZSl7XG4gICAgICAgIGlmKGV2ZSl7IGFjdC5pLm9rID0gMTsgZXZlLm9mZigpIH1cbiAgICAgICAgaWYoIWFjdC5oLm9rIHx8ICFhY3QuaS5vayl7IHJldHVybiB9XG4gICAgICAgIGNhdC5pbmcgPSBmYWxzZTtcbiAgICAgICAgY2Ioe29rOiAwLCBwdWI6IGFjdC5wYWlyLnB1Yn0pOyAvLyBjYWxsYmFjayB0aGF0IHRoZSB1c2VyIGhhcyBiZWVuIGNyZWF0ZWQuIChOb3RlOiBvayA9IDAgYmVjYXVzZSB3ZSBkaWRuJ3Qgd2FpdCBmb3IgZGlzayB0byBhY2spXG4gICAgICAgIGlmKG5vb3AgPT09IGNiKXsgcGFpciA/IGd1bi5hdXRoKHBhaXIpIDogZ3VuLmF1dGgoYWxpYXMsIHBhc3MpIH0gLy8gaWYgbm8gY2FsbGJhY2sgaXMgcGFzc2VkLCBhdXRvLWxvZ2luIGFmdGVyIHNpZ25pbmcgdXAuXG4gICAgICB9XG4gICAgICByb290LmdldCgnfkAnK2FsaWFzKS5vbmNlKGFjdC5hKTtcbiAgICAgIHJldHVybiBndW47XG4gICAgfVxuICAgIFVzZXIucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24ob3B0LCBjYil7XG4gICAgICB2YXIgZ3VuID0gdGhpcywgdXNlciA9IChndW4uYmFjaygtMSkuXykudXNlcjtcbiAgICAgIGlmKHVzZXIpe1xuICAgICAgICBkZWxldGUgdXNlci5pcztcbiAgICAgICAgZGVsZXRlIHVzZXIuXy5pcztcbiAgICAgICAgZGVsZXRlIHVzZXIuXy5zZWE7XG4gICAgICB9XG4gICAgICBpZihTRUEud2luZG93KXtcbiAgICAgICAgdHJ5e3ZhciBzUyA9IHt9O1xuICAgICAgICBzUyA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZTtcbiAgICAgICAgZGVsZXRlIHNTLnJlY2FsbDtcbiAgICAgICAgZGVsZXRlIHNTLnBhaXI7XG4gICAgICAgIH1jYXRjaChlKXt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGd1bjtcbiAgICB9XG4gIH0pKFVTRSwgJy4vY3JlYXRlJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBVc2VyID0gVVNFKCcuL3VzZXInKSwgU0VBID0gVXNlci5TRUEsIEd1biA9IFVzZXIuR1VOLCBub29wID0gZnVuY3Rpb24oKXt9O1xuICAgIC8vIG5vdyB0aGF0IHdlIGhhdmUgY3JlYXRlZCBhIHVzZXIsIHdlIHdhbnQgdG8gYXV0aGVudGljYXRlIHRoZW0hXG4gICAgVXNlci5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKC4uLmFyZ3MpeyAvLyBUT0RPOiB0aGlzIFBSIHdpdGggYXJndW1lbnRzIG5lZWQgdG8gYmUgY2xlYW5lZCB1cCAvIHJlZmFjdG9yZWQuXG4gICAgICB2YXIgcGFpciA9IHR5cGVvZiBhcmdzWzBdID09PSAnb2JqZWN0JyAmJiAoYXJnc1swXS5wdWIgfHwgYXJnc1swXS5lcHViKSA/IGFyZ3NbMF0gOiB0eXBlb2YgYXJnc1sxXSA9PT0gJ29iamVjdCcgJiYgKGFyZ3NbMV0ucHViIHx8IGFyZ3NbMV0uZXB1YikgPyBhcmdzWzFdIDogbnVsbDtcbiAgICAgIHZhciBhbGlhcyA9ICFwYWlyICYmIHR5cGVvZiBhcmdzWzBdID09PSAnc3RyaW5nJyA/IGFyZ3NbMF0gOiBudWxsO1xuICAgICAgdmFyIHBhc3MgPSAoYWxpYXMgfHwgKHBhaXIgJiYgIShwYWlyLnByaXYgJiYgcGFpci5lcHJpdikpKSAmJiB0eXBlb2YgYXJnc1sxXSA9PT0gJ3N0cmluZycgPyBhcmdzWzFdIDogbnVsbDtcbiAgICAgIHZhciBjYiA9IGFyZ3MuZmlsdGVyKGFyZyA9PiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nKVswXSB8fCBudWxsOyAvLyBjYiBub3cgY2FuIHN0YW5kIGFueXdoZXJlLCBhZnRlciBhbGlhcy9wYXNzIG9yIHBhaXJcbiAgICAgIHZhciBvcHQgPSBhcmdzICYmIGFyZ3MubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJnc1thcmdzLmxlbmd0aC0xXSA9PT0gJ29iamVjdCcgPyBhcmdzW2FyZ3MubGVuZ3RoLTFdIDoge307IC8vIG9wdCBpcyBhbHdheXMgdGhlIGxhc3QgcGFyYW1ldGVyIHdoaWNoIHR5cGVvZiA9PT0gJ29iamVjdCcgYW5kIHN0YW5kcyBhZnRlciBjYlxuICAgICAgXG4gICAgICB2YXIgZ3VuID0gdGhpcywgY2F0ID0gKGd1bi5fKSwgcm9vdCA9IGd1bi5iYWNrKC0xKTtcbiAgICAgIFxuICAgICAgaWYoY2F0LmluZyl7XG4gICAgICAgIChjYiB8fCBub29wKSh7ZXJyOiBHdW4ubG9nKFwiVXNlciBpcyBhbHJlYWR5IGJlaW5nIGNyZWF0ZWQgb3IgYXV0aGVudGljYXRlZCFcIiksIHdhaXQ6IHRydWV9KTtcbiAgICAgICAgcmV0dXJuIGd1bjtcbiAgICAgIH1cbiAgICAgIGNhdC5pbmcgPSB0cnVlO1xuICAgICAgXG4gICAgICB2YXIgYWN0ID0ge30sIHU7XG4gICAgICBhY3QuYSA9IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBpZighZGF0YSl7IHJldHVybiBhY3QuYigpIH1cbiAgICAgICAgaWYoIWRhdGEucHViKXtcbiAgICAgICAgICB2YXIgdG1wID0gW107IE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goZnVuY3Rpb24oayl7IGlmKCdfJz09ayl7IHJldHVybiB9IHRtcC5wdXNoKGRhdGFba10pIH0pXG4gICAgICAgICAgcmV0dXJuIGFjdC5iKHRtcCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoYWN0Lm5hbWUpeyByZXR1cm4gYWN0LmYoZGF0YSkgfVxuICAgICAgICBhY3QuYygoYWN0LmRhdGEgPSBkYXRhKS5hdXRoKTtcbiAgICAgIH1cbiAgICAgIGFjdC5iID0gZnVuY3Rpb24obGlzdCl7XG4gICAgICAgIHZhciBnZXQgPSAoYWN0Lmxpc3QgPSAoYWN0Lmxpc3R8fFtdKS5jb25jYXQobGlzdHx8W10pKS5zaGlmdCgpO1xuICAgICAgICBpZih1ID09PSBnZXQpe1xuICAgICAgICAgIGlmKGFjdC5uYW1lKXsgcmV0dXJuIGFjdC5lcnIoJ1lvdXIgdXNlciBhY2NvdW50IGlzIG5vdCBwdWJsaXNoZWQgZm9yIGRBcHBzIHRvIGFjY2VzcywgcGxlYXNlIGNvbnNpZGVyIHN5bmNpbmcgaXQgb25saW5lLCBvciBhbGxvd2luZyBsb2NhbCBhY2Nlc3MgYnkgYWRkaW5nIHlvdXIgZGV2aWNlIGFzIGEgcGVlci4nKSB9XG4gICAgICAgICAgcmV0dXJuIGFjdC5lcnIoJ1dyb25nIHVzZXIgb3IgcGFzc3dvcmQuJykgXG4gICAgICAgIH1cbiAgICAgICAgcm9vdC5nZXQoZ2V0KS5vbmNlKGFjdC5hKTtcbiAgICAgIH1cbiAgICAgIGFjdC5jID0gZnVuY3Rpb24oYXV0aCl7XG4gICAgICAgIGlmKHUgPT09IGF1dGgpeyByZXR1cm4gYWN0LmIoKSB9XG4gICAgICAgIGlmKCdzdHJpbmcnID09IHR5cGVvZiBhdXRoKXsgcmV0dXJuIGFjdC5jKG9ial9pZnkoYXV0aCkpIH0gLy8gaW4gY2FzZSBvZiBsZWdhY3lcbiAgICAgICAgU0VBLndvcmsocGFzcywgKGFjdC5hdXRoID0gYXV0aCkucywgYWN0LmQsIGFjdC5lbmMpOyAvLyB0aGUgcHJvb2Ygb2Ygd29yayBpcyBldmlkZW5jZSB0aGF0IHdlJ3ZlIHNwZW50IHNvbWUgdGltZS9lZmZvcnQgdHJ5aW5nIHRvIGxvZyBpbiwgdGhpcyBzbG93cyBicnV0ZSBmb3JjZS5cbiAgICAgIH1cbiAgICAgIGFjdC5kID0gZnVuY3Rpb24ocHJvb2Ype1xuICAgICAgICBTRUEuZGVjcnlwdChhY3QuYXV0aC5laywgcHJvb2YsIGFjdC5lLCBhY3QuZW5jKTtcbiAgICAgIH1cbiAgICAgIGFjdC5lID0gZnVuY3Rpb24oaGFsZil7XG4gICAgICAgIGlmKHUgPT09IGhhbGYpe1xuICAgICAgICAgIGlmKCFhY3QuZW5jKXsgLy8gdHJ5IG9sZCBmb3JtYXRcbiAgICAgICAgICAgIGFjdC5lbmMgPSB7ZW5jb2RlOiAndXRmOCd9O1xuICAgICAgICAgICAgcmV0dXJuIGFjdC5jKGFjdC5hdXRoKTtcbiAgICAgICAgICB9IGFjdC5lbmMgPSBudWxsOyAvLyBlbmQgYmFja3dhcmRzXG4gICAgICAgICAgcmV0dXJuIGFjdC5iKCk7XG4gICAgICAgIH1cbiAgICAgICAgYWN0LmhhbGYgPSBoYWxmO1xuICAgICAgICBhY3QuZihhY3QuZGF0YSk7XG4gICAgICB9XG4gICAgICBhY3QuZiA9IGZ1bmN0aW9uKHBhaXIpe1xuICAgICAgICB2YXIgaGFsZiA9IGFjdC5oYWxmIHx8IHt9LCBkYXRhID0gYWN0LmRhdGEgfHwge307XG4gICAgICAgIGFjdC5nKGFjdC5sb2wgPSB7cHViOiBwYWlyLnB1YiB8fCBkYXRhLnB1YiwgZXB1YjogcGFpci5lcHViIHx8IGRhdGEuZXB1YiwgcHJpdjogcGFpci5wcml2IHx8IGhhbGYucHJpdiwgZXByaXY6IHBhaXIuZXByaXYgfHwgaGFsZi5lcHJpdn0pO1xuICAgICAgfVxuICAgICAgYWN0LmcgPSBmdW5jdGlvbihwYWlyKXtcbiAgICAgICAgaWYoIXBhaXIgfHwgIXBhaXIucHViIHx8ICFwYWlyLmVwdWIpeyByZXR1cm4gYWN0LmIoKSB9XG4gICAgICAgIGFjdC5wYWlyID0gcGFpcjtcbiAgICAgICAgdmFyIHVzZXIgPSAocm9vdC5fKS51c2VyLCBhdCA9ICh1c2VyLl8pO1xuICAgICAgICB2YXIgdG1wID0gYXQudGFnO1xuICAgICAgICB2YXIgdXB0ID0gYXQub3B0O1xuICAgICAgICBhdCA9IHVzZXIuXyA9IHJvb3QuZ2V0KCd+JytwYWlyLnB1YikuXztcbiAgICAgICAgYXQub3B0ID0gdXB0O1xuICAgICAgICAvLyBhZGQgb3VyIGNyZWRlbnRpYWxzIGluLW1lbW9yeSBvbmx5IHRvIG91ciByb290IHVzZXIgaW5zdGFuY2VcbiAgICAgICAgdXNlci5pcyA9IHtwdWI6IHBhaXIucHViLCBlcHViOiBwYWlyLmVwdWIsIGFsaWFzOiBhbGlhcyB8fCBwYWlyLnB1Yn07XG4gICAgICAgIGF0LnNlYSA9IGFjdC5wYWlyO1xuICAgICAgICBjYXQuaW5nID0gZmFsc2U7XG4gICAgICAgIHRyeXtpZihwYXNzICYmIHUgPT0gKG9ial9pZnkoY2F0LnJvb3QuZ3JhcGhbJ34nK3BhaXIucHViXS5hdXRoKXx8JycpWyc6J10peyBvcHQuc2h1ZmZsZSA9IG9wdC5jaGFuZ2UgPSBwYXNzOyB9IH1jYXRjaChlKXt9IC8vIG1pZ3JhdGUgVVRGOCAmIFNodWZmbGUhXG4gICAgICAgIG9wdC5jaGFuZ2U/IGFjdC56KCkgOiAoY2IgfHwgbm9vcCkoYXQpO1xuICAgICAgICBpZihTRUEud2luZG93ICYmICgoZ3VuLmJhY2soJ3VzZXInKS5fKS5vcHR8fG9wdCkucmVtZW1iZXIpe1xuICAgICAgICAgIC8vIFRPRE86IHRoaXMgbmVlZHMgdG8gYmUgbW9kdWxhci5cbiAgICAgICAgICB0cnl7dmFyIHNTID0ge307XG4gICAgICAgICAgc1MgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2U7IC8vIFRPRE86IEZJWCBCVUcgcHV0dGluZyBvbiBgLmlzYCFcbiAgICAgICAgICBzUy5yZWNhbGwgPSB0cnVlO1xuICAgICAgICAgIHNTLnBhaXIgPSBKU09OLnN0cmluZ2lmeShwYWlyKTsgLy8gYXV0aCB1c2luZyBwYWlyIGlzIG1vcmUgcmVsaWFibGUgdGhhbiBhbGlhcy9wYXNzXG4gICAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgICAgfVxuICAgICAgICB0cnl7XG4gICAgICAgICAgaWYocm9vdC5fLnRhZy5hdXRoKXsgLy8gYXV0aCBoYW5kbGUgbWlnaHQgbm90IGJlIHJlZ2lzdGVyZWQgeWV0XG4gICAgICAgICAgKHJvb3QuXykub24oJ2F1dGgnLCBhdCkgLy8gVE9ETzogRGVwcmVjYXRlIHRoaXMsIGVtaXQgb24gdXNlciBpbnN0ZWFkISBVcGRhdGUgZG9jcyB3aGVuIHlvdSBkby5cbiAgICAgICAgICB9IGVsc2UgeyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IChyb290Ll8pLm9uKCdhdXRoJywgYXQpIH0sMSkgfSAvLyBpZiBub3QsIGhhY2tpbHkgYWRkIGEgdGltZW91dC5cbiAgICAgICAgICAvL2F0Lm9uKCdhdXRoJywgYXQpIC8vIEFycmdoLCB0aGlzIGRvZXNuJ3Qgd29yayB3aXRob3V0IGV2ZW50IFwibWVyZ2VcIiBjb2RlLCBidXQgXCJtZXJnZVwiIGNvZGUgY2F1c2VzIHN0YWNrIG92ZXJmbG93IGFuZCBjcmFzaGVzIGFmdGVyIGxvZ2dpbmcgaW4gJiB0cnlpbmcgdG8gd3JpdGUgZGF0YS5cbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgIEd1bi5sb2coXCJZb3VyICdhdXRoJyBjYWxsYmFjayBjcmFzaGVkIHdpdGg6XCIsIGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhY3QuaCA9IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBpZighZGF0YSl7IHJldHVybiBhY3QuYigpIH1cbiAgICAgICAgYWxpYXMgPSBkYXRhLmFsaWFzXG4gICAgICAgIGlmKCFhbGlhcylcbiAgICAgICAgICBhbGlhcyA9IGRhdGEuYWxpYXMgPSBcIn5cIiArIHBhaXIucHViICAgICAgICBcbiAgICAgICAgaWYoIWRhdGEuYXV0aCl7XG4gICAgICAgICAgcmV0dXJuIGFjdC5nKHBhaXIpO1xuICAgICAgICB9XG4gICAgICAgIHBhaXIgPSBudWxsO1xuICAgICAgICBhY3QuYygoYWN0LmRhdGEgPSBkYXRhKS5hdXRoKTtcbiAgICAgIH1cbiAgICAgIGFjdC56ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gcGFzc3dvcmQgdXBkYXRlIHNvIGVuY3J5cHQgcHJpdmF0ZSBrZXkgdXNpbmcgbmV3IHB3ZCArIHNhbHRcbiAgICAgICAgYWN0LnNhbHQgPSBTdHJpbmcucmFuZG9tKDY0KTsgLy8gcHNldWRvLXJhbmRvbVxuICAgICAgICBTRUEud29yayhvcHQuY2hhbmdlLCBhY3Quc2FsdCwgYWN0LnkpO1xuICAgICAgfVxuICAgICAgYWN0LnkgPSBmdW5jdGlvbihwcm9vZil7XG4gICAgICAgIFNFQS5lbmNyeXB0KHtwcml2OiBhY3QucGFpci5wcml2LCBlcHJpdjogYWN0LnBhaXIuZXByaXZ9LCBwcm9vZiwgYWN0LngsIHtyYXc6MX0pO1xuICAgICAgfVxuICAgICAgYWN0LnggPSBmdW5jdGlvbihhdXRoKXtcbiAgICAgICAgYWN0LncoSlNPTi5zdHJpbmdpZnkoe2VrOiBhdXRoLCBzOiBhY3Quc2FsdH0pKTtcbiAgICAgIH1cbiAgICAgIGFjdC53ID0gZnVuY3Rpb24oYXV0aCl7XG4gICAgICAgIGlmKG9wdC5zaHVmZmxlKXsgLy8gZGVsZXRlIGluIGZ1dHVyZSFcbiAgICAgICAgICBjb25zb2xlLmxvZygnbWlncmF0ZSBjb3JlIGFjY291bnQgZnJvbSBVVEY4ICYgc2h1ZmZsZScpO1xuICAgICAgICAgIHZhciB0bXAgPSB7fTsgT2JqZWN0LmtleXMoYWN0LmRhdGEpLmZvckVhY2goZnVuY3Rpb24oayl7IHRtcFtrXSA9IGFjdC5kYXRhW2tdIH0pO1xuICAgICAgICAgIGRlbGV0ZSB0bXAuXztcbiAgICAgICAgICB0bXAuYXV0aCA9IGF1dGg7XG4gICAgICAgICAgcm9vdC5nZXQoJ34nK2FjdC5wYWlyLnB1YikucHV0KHRtcCk7XG4gICAgICAgIH0gLy8gZW5kIGRlbGV0ZVxuICAgICAgICByb290LmdldCgnficrYWN0LnBhaXIucHViKS5nZXQoJ2F1dGgnKS5wdXQoYXV0aCwgY2IgfHwgbm9vcCk7XG4gICAgICB9XG4gICAgICBhY3QuZXJyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciBhY2sgPSB7ZXJyOiBHdW4ubG9nKGUgfHwgJ1VzZXIgY2Fubm90IGJlIGZvdW5kIScpfTtcbiAgICAgICAgY2F0LmluZyA9IGZhbHNlO1xuICAgICAgICAoY2IgfHwgbm9vcCkoYWNrKTtcbiAgICAgIH1cbiAgICAgIGFjdC5wbHVnaW4gPSBmdW5jdGlvbihuYW1lKXtcbiAgICAgICAgaWYoIShhY3QubmFtZSA9IG5hbWUpKXsgcmV0dXJuIGFjdC5lcnIoKSB9XG4gICAgICAgIHZhciB0bXAgPSBbbmFtZV07XG4gICAgICAgIGlmKCd+JyAhPT0gbmFtZVswXSl7XG4gICAgICAgICAgdG1wWzFdID0gJ34nK25hbWU7XG4gICAgICAgICAgdG1wWzJdID0gJ35AJytuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGFjdC5iKHRtcCk7XG4gICAgICB9XG4gICAgICBpZihwYWlyKXtcbiAgICAgICAgaWYocGFpci5wcml2ICYmIHBhaXIuZXByaXYpXG4gICAgICAgICAgYWN0LmcocGFpcik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByb290LmdldCgnficrcGFpci5wdWIpLm9uY2UoYWN0LmgpO1xuICAgICAgfSBlbHNlXG4gICAgICBpZihhbGlhcyl7XG4gICAgICAgIHJvb3QuZ2V0KCd+QCcrYWxpYXMpLm9uY2UoYWN0LmEpO1xuICAgICAgfSBlbHNlXG4gICAgICBpZighYWxpYXMgJiYgIXBhc3Mpe1xuICAgICAgICBTRUEubmFtZShhY3QucGx1Z2luKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBndW47XG4gICAgfVxuICAgIGZ1bmN0aW9uIG9ial9pZnkobyl7XG4gICAgICBpZignc3RyaW5nJyAhPSB0eXBlb2Ygbyl7IHJldHVybiBvIH1cbiAgICAgIHRyeXtvID0gSlNPTi5wYXJzZShvKTtcbiAgICAgIH1jYXRjaChlKXtvPXt9fTtcbiAgICAgIHJldHVybiBvO1xuICAgIH1cbiAgfSkoVVNFLCAnLi9hdXRoJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBVc2VyID0gVVNFKCcuL3VzZXInKSwgU0VBID0gVXNlci5TRUEsIEd1biA9IFVzZXIuR1VOO1xuICAgIFVzZXIucHJvdG90eXBlLnJlY2FsbCA9IGZ1bmN0aW9uKG9wdCwgY2Ipe1xuICAgICAgdmFyIGd1biA9IHRoaXMsIHJvb3QgPSBndW4uYmFjaygtMSksIHRtcDtcbiAgICAgIG9wdCA9IG9wdCB8fCB7fTtcbiAgICAgIGlmKG9wdCAmJiBvcHQuc2Vzc2lvblN0b3JhZ2Upe1xuICAgICAgICBpZihTRUEud2luZG93KXtcbiAgICAgICAgICB0cnl7XG4gICAgICAgICAgICB2YXIgc1MgPSB7fTtcbiAgICAgICAgICAgIHNTID0gd2luZG93LnNlc3Npb25TdG9yYWdlOyAvLyBUT0RPOiBGSVggQlVHIHB1dHRpbmcgb24gYC5pc2AhXG4gICAgICAgICAgICBpZihzUyl7XG4gICAgICAgICAgICAgIChyb290Ll8pLm9wdC5yZW1lbWJlciA9IHRydWU7XG4gICAgICAgICAgICAgICgoZ3VuLmJhY2soJ3VzZXInKS5fKS5vcHR8fG9wdCkucmVtZW1iZXIgPSB0cnVlO1xuICAgICAgICAgICAgICBpZihzUy5yZWNhbGwgfHwgc1MucGFpcikgcm9vdC51c2VyKCkuYXV0aChKU09OLnBhcnNlKHNTLnBhaXIpLCBjYik7IC8vIHBhaXIgaXMgbW9yZSByZWxpYWJsZSB0aGFuIGFsaWFzL3Bhc3NcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBndW47XG4gICAgICB9XG4gICAgICAvKlxuICAgICAgICBUT0RPOiBjb3B5IG1oZWxhbmRlcidzIGV4cGlyeSBjb2RlIGJhY2sgaW4uXG4gICAgICAgIEFsdGhvdWdoLCB3ZSBzaG91bGQgY2hlY2sgd2l0aCBjb21tdW5pdHksXG4gICAgICAgIHNob3VsZCBleHBpcnkgYmUgY29yZSBvciBhIHBsdWdpbj9cbiAgICAgICovXG4gICAgICByZXR1cm4gZ3VuO1xuICAgIH1cbiAgfSkoVVNFLCAnLi9yZWNhbGwnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFVzZXIgPSBVU0UoJy4vdXNlcicpLCBTRUEgPSBVc2VyLlNFQSwgR3VuID0gVXNlci5HVU4sIG5vb3AgPSBmdW5jdGlvbigpe307XG4gICAgVXNlci5wcm90b3R5cGUucGFpciA9IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgdXNlciA9IHRoaXMsIHByb3h5OyAvLyB1bmRlcHJlY2F0ZWQsIGhpZGluZyB3aXRoIHByb3hpZXMuXG4gICAgICB0cnl7IHByb3h5ID0gbmV3IFByb3h5KHtEQU5HRVI6J1xcdTI2MjAnfSwge2dldDogZnVuY3Rpb24odCxwLHIpe1xuICAgICAgICBpZighdXNlci5pcyB8fCAhKHVzZXIuX3x8JycpLnNlYSl7IHJldHVybiB9XG4gICAgICAgIHJldHVybiB1c2VyLl8uc2VhW3BdO1xuICAgICAgfX0pfWNhdGNoKGUpe31cbiAgICAgIHJldHVybiBwcm94eTtcbiAgICB9XG4gICAgLy8gSWYgYXV0aGVudGljYXRlZCB1c2VyIHdhbnRzIHRvIGRlbGV0ZSBoaXMvaGVyIGFjY291bnQsIGxldCdzIHN1cHBvcnQgaXQhXG4gICAgVXNlci5wcm90b3R5cGUuZGVsZXRlID0gYXN5bmMgZnVuY3Rpb24oYWxpYXMsIHBhc3MsIGNiKXtcbiAgICAgIGNvbnNvbGUubG9nKFwidXNlci5kZWxldGUoKSBJUyBERVBSRUNBVEVEIEFORCBXSUxMIEJFIE1PVkVEIFRPIEEgTU9EVUxFISEhXCIpO1xuICAgICAgdmFyIGd1biA9IHRoaXMsIHJvb3QgPSBndW4uYmFjaygtMSksIHVzZXIgPSBndW4uYmFjaygndXNlcicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdXNlci5hdXRoKGFsaWFzLCBwYXNzLCBmdW5jdGlvbihhY2spe1xuICAgICAgICAgIHZhciBwdWIgPSAodXNlci5pc3x8e30pLnB1YjtcbiAgICAgICAgICAvLyBEZWxldGUgdXNlciBkYXRhXG4gICAgICAgICAgdXNlci5tYXAoKS5vbmNlKGZ1bmN0aW9uKCl7IHRoaXMucHV0KG51bGwpIH0pO1xuICAgICAgICAgIC8vIFdpcGUgdXNlciBkYXRhIGZyb20gbWVtb3J5XG4gICAgICAgICAgdXNlci5sZWF2ZSgpO1xuICAgICAgICAgIChjYiB8fCBub29wKSh7b2s6IDB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIEd1bi5sb2coJ1VzZXIuZGVsZXRlIGZhaWxlZCEgRXJyb3I6JywgZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZ3VuO1xuICAgIH1cbiAgICBVc2VyLnByb3RvdHlwZS5hbGl2ZSA9IGFzeW5jIGZ1bmN0aW9uKCl7XG4gICAgICBjb25zb2xlLmxvZyhcInVzZXIuYWxpdmUoKSBJUyBERVBSRUNBVEVEISEhXCIpO1xuICAgICAgY29uc3QgZ3VuUm9vdCA9IHRoaXMuYmFjaygtMSlcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEFsbCBpcyBnb29kLiBTaG91bGQgd2UgZG8gc29tZXRoaW5nIG1vcmUgd2l0aCBhY3R1YWwgcmVjYWxsZWQgZGF0YT9cbiAgICAgICAgYXdhaXQgYXV0aFJlY2FsbChndW5Sb290KVxuICAgICAgICByZXR1cm4gZ3VuUm9vdC5fLnVzZXIuX1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zdCBlcnIgPSAnTm8gc2Vzc2lvbiEnXG4gICAgICAgIEd1bi5sb2coZXJyKVxuICAgICAgICB0aHJvdyB7IGVyciB9XG4gICAgICB9XG4gICAgfVxuICAgIFVzZXIucHJvdG90eXBlLnRydXN0ID0gYXN5bmMgZnVuY3Rpb24odXNlcil7XG4gICAgICBjb25zb2xlLmxvZyhcImAudHJ1c3RgIEFQSSBNQVkgQkUgREVMRVRFRCBPUiBDSEFOR0VEIE9SIFJFTkFNRUQsIERPIE5PVCBVU0UhXCIpO1xuICAgICAgLy8gVE9ETzogQlVHISEhIFNFQSBgbm9kZWAgcmVhZCBsaXN0ZW5lciBuZWVkcyB0byBiZSBhc3luYywgd2hpY2ggbWVhbnMgY29yZSBuZWVkcyB0byBiZSBhc3luYyB0b28uXG4gICAgICAvL2d1bi5nZXQoJ2FsaWNlJykuZ2V0KCdhZ2UnKS50cnVzdChib2IpO1xuICAgICAgaWYgKEd1bi5pcyh1c2VyKSkge1xuICAgICAgICB1c2VyLmdldCgncHViJykuZ2V0KChjdHgsIGV2KSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coY3R4LCBldilcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHVzZXIuZ2V0KCd0cnVzdCcpLmdldChwYXRoKS5wdXQodGhlaXJQdWJrZXkpO1xuXG4gICAgICAvLyBkbyBhIGxvb2t1cCBvbiB0aGlzIGd1biBjaGFpbiBkaXJlY3RseSAodGhhdCBnZXRzIGJvYidzIGNvcHkgb2YgdGhlIGRhdGEpXG4gICAgICAvLyBkbyBhIGxvb2t1cCBvbiB0aGUgbWV0YWRhdGEgdHJ1c3QgdGFibGUgZm9yIHRoaXMgcGF0aCAodGhhdCBnZXRzIGFsbCB0aGUgcHVia2V5cyBhbGxvd2VkIHRvIHdyaXRlIG9uIHRoaXMgcGF0aClcbiAgICAgIC8vIGRvIGEgbG9va3VwIG9uIGVhY2ggb2YgdGhvc2UgcHViS2V5cyBPTiB0aGUgcGF0aCAodG8gZ2V0IHRoZSBjb2xsYWIgZGF0YSBcImxheWVyc1wiKVxuICAgICAgLy8gVEhFTiB5b3UgcGVyZm9ybSBKYWNoZW4ncyBtaXggb3BlcmF0aW9uXG4gICAgICAvLyBhbmQgcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhhdCB0by4uLlxuICAgIH1cbiAgICBVc2VyLnByb3RvdHlwZS5ncmFudCA9IGZ1bmN0aW9uKHRvLCBjYil7XG4gICAgICBjb25zb2xlLmxvZyhcImAuZ3JhbnRgIEFQSSBNQVkgQkUgREVMRVRFRCBPUiBDSEFOR0VEIE9SIFJFTkFNRUQsIERPIE5PVCBVU0UhXCIpO1xuICAgICAgdmFyIGd1biA9IHRoaXMsIHVzZXIgPSBndW4uYmFjaygtMSkudXNlcigpLCBwYWlyID0gdXNlci5fLnNlYSwgcGF0aCA9ICcnO1xuICAgICAgZ3VuLmJhY2soZnVuY3Rpb24oYXQpeyBpZihhdC5pcyl7IHJldHVybiB9IHBhdGggKz0gKGF0LmdldHx8JycpIH0pO1xuICAgICAgKGFzeW5jIGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgZW5jLCBzZWMgPSBhd2FpdCB1c2VyLmdldCgnZ3JhbnQnKS5nZXQocGFpci5wdWIpLmdldChwYXRoKS50aGVuKCk7XG4gICAgICBzZWMgPSBhd2FpdCBTRUEuZGVjcnlwdChzZWMsIHBhaXIpO1xuICAgICAgaWYoIXNlYyl7XG4gICAgICAgIHNlYyA9IFNFQS5yYW5kb20oMTYpLnRvU3RyaW5nKCk7XG4gICAgICAgIGVuYyA9IGF3YWl0IFNFQS5lbmNyeXB0KHNlYywgcGFpcik7XG4gICAgICAgIHVzZXIuZ2V0KCdncmFudCcpLmdldChwYWlyLnB1YikuZ2V0KHBhdGgpLnB1dChlbmMpO1xuICAgICAgfVxuICAgICAgdmFyIHB1YiA9IHRvLmdldCgncHViJykudGhlbigpO1xuICAgICAgdmFyIGVwdWIgPSB0by5nZXQoJ2VwdWInKS50aGVuKCk7XG4gICAgICBwdWIgPSBhd2FpdCBwdWI7IGVwdWIgPSBhd2FpdCBlcHViO1xuICAgICAgdmFyIGRoID0gYXdhaXQgU0VBLnNlY3JldChlcHViLCBwYWlyKTtcbiAgICAgIGVuYyA9IGF3YWl0IFNFQS5lbmNyeXB0KHNlYywgZGgpO1xuICAgICAgdXNlci5nZXQoJ2dyYW50JykuZ2V0KHB1YikuZ2V0KHBhdGgpLnB1dChlbmMsIGNiKTtcbiAgICAgIH0oKSk7XG4gICAgICByZXR1cm4gZ3VuO1xuICAgIH1cbiAgICBVc2VyLnByb3RvdHlwZS5zZWNyZXQgPSBmdW5jdGlvbihkYXRhLCBjYil7XG4gICAgICBjb25zb2xlLmxvZyhcImAuc2VjcmV0YCBBUEkgTUFZIEJFIERFTEVURUQgT1IgQ0hBTkdFRCBPUiBSRU5BTUVELCBETyBOT1QgVVNFIVwiKTtcbiAgICAgIHZhciBndW4gPSB0aGlzLCB1c2VyID0gZ3VuLmJhY2soLTEpLnVzZXIoKSwgcGFpciA9IHVzZXIucGFpcigpLCBwYXRoID0gJyc7XG4gICAgICBndW4uYmFjayhmdW5jdGlvbihhdCl7IGlmKGF0LmlzKXsgcmV0dXJuIH0gcGF0aCArPSAoYXQuZ2V0fHwnJykgfSk7XG4gICAgICAoYXN5bmMgZnVuY3Rpb24oKXtcbiAgICAgIHZhciBlbmMsIHNlYyA9IGF3YWl0IHVzZXIuZ2V0KCd0cnVzdCcpLmdldChwYWlyLnB1YikuZ2V0KHBhdGgpLnRoZW4oKTtcbiAgICAgIHNlYyA9IGF3YWl0IFNFQS5kZWNyeXB0KHNlYywgcGFpcik7XG4gICAgICBpZighc2VjKXtcbiAgICAgICAgc2VjID0gU0VBLnJhbmRvbSgxNikudG9TdHJpbmcoKTtcbiAgICAgICAgZW5jID0gYXdhaXQgU0VBLmVuY3J5cHQoc2VjLCBwYWlyKTtcbiAgICAgICAgdXNlci5nZXQoJ3RydXN0JykuZ2V0KHBhaXIucHViKS5nZXQocGF0aCkucHV0KGVuYyk7XG4gICAgICB9XG4gICAgICBlbmMgPSBhd2FpdCBTRUEuZW5jcnlwdChkYXRhLCBzZWMpO1xuICAgICAgZ3VuLnB1dChlbmMsIGNiKTtcbiAgICAgIH0oKSk7XG4gICAgICByZXR1cm4gZ3VuO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgdGhlIGRlY3J5cHRlZCB2YWx1ZSwgZW5jcnlwdGVkIGJ5IHNlY3JldFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAgIC8vIE1hcmsgbmVlZHMgdG8gcmV2aWV3IDFzdCBiZWZvcmUgb2ZmaWNpYWxseSBzdXBwb3J0ZWRcbiAgICBVc2VyLnByb3RvdHlwZS5kZWNyeXB0ID0gZnVuY3Rpb24oY2IpIHtcbiAgICAgIGxldCBndW4gPSB0aGlzLFxuICAgICAgICBwYXRoID0gJydcbiAgICAgIGd1bi5iYWNrKGZ1bmN0aW9uKGF0KSB7XG4gICAgICAgIGlmIChhdC5pcykge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHBhdGggKz0gYXQuZ2V0IHx8ICcnXG4gICAgICB9KVxuICAgICAgcmV0dXJuIGd1blxuICAgICAgICAudGhlbihhc3luYyBkYXRhID0+IHtcbiAgICAgICAgICBpZiAoZGF0YSA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdXNlciA9IGd1bi5iYWNrKC0xKS51c2VyKClcbiAgICAgICAgICBjb25zdCBwYWlyID0gdXNlci5wYWlyKClcbiAgICAgICAgICBsZXQgc2VjID0gYXdhaXQgdXNlclxuICAgICAgICAgICAgLmdldCgndHJ1c3QnKVxuICAgICAgICAgICAgLmdldChwYWlyLnB1YilcbiAgICAgICAgICAgIC5nZXQocGF0aClcbiAgICAgICAgICBzZWMgPSBhd2FpdCBTRUEuZGVjcnlwdChzZWMsIHBhaXIpXG4gICAgICAgICAgaWYgKCFzZWMpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhXG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBkZWNyeXB0ZWQgPSBhd2FpdCBTRUEuZGVjcnlwdChkYXRhLCBzZWMpXG4gICAgICAgICAgcmV0dXJuIGRlY3J5cHRlZFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIGNiICYmIGNiKHJlcylcbiAgICAgICAgICByZXR1cm4gcmVzXG4gICAgICAgIH0pXG4gICAgfVxuICAgICovXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBVc2VyXG4gIH0pKFVTRSwgJy4vc2hhcmUnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9zZWEnKSwgUyA9IFVTRSgnLi9zZXR0aW5ncycpLCBub29wID0gZnVuY3Rpb24oKSB7fSwgdTtcbiAgICB2YXIgR3VuID0gKCcnK3UgIT0gdHlwZW9mIHdpbmRvdyk/ICh3aW5kb3cuR3VufHx7b246bm9vcH0pIDogVVNFKCgnJyt1ID09PSB0eXBlb2YgTU9EVUxFPycuJzonJykrJy4vZ3VuJywgMSk7XG4gICAgLy8gQWZ0ZXIgd2UgaGF2ZSBhIEdVTiBleHRlbnNpb24gdG8gbWFrZSB1c2VyIHJlZ2lzdHJhdGlvbi9sb2dpbiBlYXN5LCB3ZSB0aGVuIG5lZWQgdG8gaGFuZGxlIGV2ZXJ5dGhpbmcgZWxzZS5cblxuICAgIC8vIFdlIGRvIHRoaXMgd2l0aCBhIEdVTiBhZGFwdGVyLCB3ZSBmaXJzdCBsaXN0ZW4gdG8gd2hlbiBhIGd1biBpbnN0YW5jZSBpcyBjcmVhdGVkIChhbmQgd2hlbiBpdHMgb3B0aW9ucyBjaGFuZ2UpXG4gICAgR3VuLm9uKCdvcHQnLCBmdW5jdGlvbihhdCl7XG4gICAgICBpZighYXQuc2VhKXsgLy8gb25seSBhZGQgU0VBIG9uY2UgcGVyIGluc3RhbmNlLCBvbiB0aGUgXCJhdFwiIGNvbnRleHQuXG4gICAgICAgIGF0LnNlYSA9IHtvd246IHt9fTtcbiAgICAgICAgYXQub24oJ3B1dCcsIGNoZWNrLCBhdCk7IC8vIFNFQSBub3cgcnVucyBpdHMgZmlyZXdhbGwgb24gSEFNIGRpZmZzLCBub3QgYWxsIGkvby5cbiAgICAgIH1cbiAgICAgIHRoaXMudG8ubmV4dChhdCk7IC8vIG1ha2Ugc3VyZSB0byBjYWxsIHRoZSBcIm5leHRcIiBtaWRkbGV3YXJlIGFkYXB0ZXIuXG4gICAgfSk7XG5cbiAgICAvLyBBbHJpZ2h0LCB0aGlzIG5leHQgYWRhcHRlciBnZXRzIHJ1biBhdCB0aGUgcGVyIG5vZGUgbGV2ZWwgaW4gdGhlIGdyYXBoIGRhdGFiYXNlLlxuICAgIC8vIGNvcnJlY3Rpb246IDIwMjAgaXQgZ2V0cyBydW4gb24gZWFjaCBrZXkvdmFsdWUgcGFpciBpbiBhIG5vZGUgdXBvbiBhIEhBTSBkaWZmLlxuICAgIC8vIFRoaXMgd2lsbCBsZXQgdXMgdmVyaWZ5IHRoYXQgZXZlcnkgcHJvcGVydHkgb24gYSBub2RlIGhhcyBhIHZhbHVlIHNpZ25lZCBieSBhIHB1YmxpYyBrZXkgd2UgdHJ1c3QuXG4gICAgLy8gSWYgdGhlIHNpZ25hdHVyZSBkb2VzIG5vdCBtYXRjaCwgdGhlIGRhdGEgaXMganVzdCBgdW5kZWZpbmVkYCBzbyBpdCBkb2Vzbid0IGdldCBwYXNzZWQgb24uXG4gICAgLy8gSWYgaXQgZG9lcyBtYXRjaCwgdGhlbiB3ZSB0cmFuc2Zvcm0gdGhlIGluLW1lbW9yeSBcInZpZXdcIiBvZiB0aGUgZGF0YSBpbnRvIGl0cyBwbGFpbiB2YWx1ZSAod2l0aG91dCB0aGUgc2lnbmF0dXJlKS5cbiAgICAvLyBOb3cgTk9URSEgU29tZSBkYXRhIGlzIFwic3lzdGVtXCIgZGF0YSwgbm90IHVzZXIgZGF0YS4gRXhhbXBsZTogTGlzdCBvZiBwdWJsaWMga2V5cywgYWxpYXNlcywgZXRjLlxuICAgIC8vIFRoaXMgZGF0YSBpcyBzZWxmLWVuZm9yY2VkICh0aGUgdmFsdWUgY2FuIG9ubHkgbWF0Y2ggaXRzIElEKSwgYnV0IHRoYXQgaXMgaGFuZGxlZCBpbiB0aGUgYHNlY3VyaXR5YCBmdW5jdGlvbi5cbiAgICAvLyBGcm9tIHRoZSBzZWxmLWVuZm9yY2VkIGRhdGEsIHdlIGNhbiBzZWUgYWxsIHRoZSBlZGdlcyBpbiB0aGUgZ3JhcGggdGhhdCBiZWxvbmcgdG8gYSBwdWJsaWMga2V5LlxuICAgIC8vIEV4YW1wbGU6IH5BU0RGIGlzIHRoZSBJRCBvZiBhIG5vZGUgd2l0aCBBU0RGIGFzIGl0cyBwdWJsaWMga2V5LCBzaWduZWQgYWxpYXMgYW5kIHNhbHQsIGFuZFxuICAgIC8vIGl0cyBlbmNyeXB0ZWQgcHJpdmF0ZSBrZXksIGJ1dCBpdCBtaWdodCBhbHNvIGhhdmUgb3RoZXIgc2lnbmVkIHZhbHVlcyBvbiBpdCBsaWtlIGBwcm9maWxlID0gPElEPmAgZWRnZS5cbiAgICAvLyBVc2luZyB0aGF0IGRpcmVjdGVkIGVkZ2UncyBJRCwgd2UgY2FuIHRoZW4gdHJhY2sgKGluIG1lbW9yeSkgd2hpY2ggSURzIGJlbG9uZyB0byB3aGljaCBrZXlzLlxuICAgIC8vIEhlcmUgaXMgYSBwcm9ibGVtOiBNdWx0aXBsZSBwdWJsaWMga2V5cyBjYW4gXCJjbGFpbVwiIGFueSBub2RlJ3MgSUQsIHNvIHRoaXMgaXMgZGFuZ2Vyb3VzIVxuICAgIC8vIFRoaXMgbWVhbnMgd2Ugc2hvdWxkIE9OTFkgdHJ1c3Qgb3VyIFwiZnJpZW5kc1wiIChvdXIga2V5IHJpbmcpIHB1YmxpYyBrZXlzLCBub3QgYW55IG9uZXMuXG4gICAgLy8gSSBoYXZlIG5vdCB5ZXQgYWRkZWQgdGhhdCB0byBTRUEgeWV0IGluIHRoaXMgYWxwaGEgcmVsZWFzZS4gVGhhdCBpcyBjb21pbmcgc29vbiwgYnV0IGJld2FyZSBpbiB0aGUgbWVhbndoaWxlIVxuXG4gICAgZnVuY3Rpb24gY2hlY2sobXNnKXsgLy8gUkVWSVNFIC8gSU1QUk9WRSwgTk8gTkVFRCBUTyBQQVNTIE1TRy9FVkUgRUFDSCBTVUI/XG4gICAgICB2YXIgZXZlID0gdGhpcywgYXQgPSBldmUuYXMsIHB1dCA9IG1zZy5wdXQsIHNvdWwgPSBwdXRbJyMnXSwga2V5ID0gcHV0WycuJ10sIHZhbCA9IHB1dFsnOiddLCBzdGF0ZSA9IHB1dFsnPiddLCBpZCA9IG1zZ1snIyddLCB0bXA7XG4gICAgICBpZighc291bCB8fCAha2V5KXsgcmV0dXJuIH1cbiAgICAgIGlmKChtc2cuX3x8JycpLmZhaXRoICYmIChhdC5vcHR8fCcnKS5mYWl0aCAmJiAnZnVuY3Rpb24nID09IHR5cGVvZiBtc2cuXyl7XG4gICAgICAgIFNFQS5vcHQucGFjayhwdXQsIGZ1bmN0aW9uKHJhdyl7XG4gICAgICAgIFNFQS52ZXJpZnkocmF3LCBmYWxzZSwgZnVuY3Rpb24oZGF0YSl7IC8vIHRoaXMgaXMgc3luY2hyb25vdXMgaWYgZmFsc2VcbiAgICAgICAgICBwdXRbJz0nXSA9IFNFQS5vcHQudW5wYWNrKGRhdGEpO1xuICAgICAgICAgIGV2ZS50by5uZXh0KG1zZyk7XG4gICAgICAgIH0pfSlcbiAgICAgICAgcmV0dXJuIFxuICAgICAgfVxuICAgICAgdmFyIG5vID0gZnVuY3Rpb24od2h5KXsgYXQub24oJ2luJywgeydAJzogaWQsIGVycjogbXNnLmVyciA9IHdoeX0pIH07IC8vIGV4cGxvaXQgaW50ZXJuYWwgcmVsYXkgc3R1biBmb3Igbm93LCBtYXliZSB2aW9sYXRlcyBzcGVjLCBidXQgdGVzdGluZyBmb3Igbm93LiAvLyBOb3RlOiB0aGlzIG1heSBiZSBvbmx5IHRoZSBzaGFyZGVkIG1lc3NhZ2UsIG5vdCBvcmlnaW5hbCBiYXRjaC5cbiAgICAgIC8vdmFyIG5vID0gZnVuY3Rpb24od2h5KXsgbXNnLmFjayh3aHkpIH07XG4gICAgICAobXNnLl98fCcnKS5EQkcgJiYgKChtc2cuX3x8JycpLkRCRy5jID0gK25ldyBEYXRlKTtcbiAgICAgIGlmKDAgPD0gc291bC5pbmRleE9mKCc8PycpKXsgLy8gc3BlY2lhbCBjYXNlIGZvciBcImRvIG5vdCBzeW5jIGRhdGEgWCBvbGRcIiBmb3JnZXRcbiAgICAgICAgLy8gJ2F+cHViLmtleS9iPD85J1xuICAgICAgICB0bXAgPSBwYXJzZUZsb2F0KHNvdWwuc3BsaXQoJzw/JylbMV18fCcnKTtcbiAgICAgICAgaWYodG1wICYmIChzdGF0ZSA8IChHdW4uc3RhdGUoKSAtICh0bXAgKiAxMDAwKSkpKXsgLy8gc2VjIHRvIG1zXG4gICAgICAgICAgKHRtcCA9IG1zZy5fKSAmJiAodG1wLnN0dW4pICYmICh0bXAuc3R1bi0tKTsgLy8gVEhJUyBJUyBCQUQgQ09ERSEgSXQgYXNzdW1lcyBHVU4gaW50ZXJuYWxzIGRvIHNvbWV0aGluZyB0aGF0IHdpbGwgcHJvYmFibHkgY2hhbmdlIGluIGZ1dHVyZSwgYnV0IGhhY2tpbmcgaW4gbm93LlxuICAgICAgICAgIHJldHVybjsgLy8gb21pdCFcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZignfkAnID09PSBzb3VsKXsgIC8vIHNwZWNpYWwgY2FzZSBmb3Igc2hhcmVkIHN5c3RlbSBkYXRhLCB0aGUgbGlzdCBvZiBhbGlhc2VzLlxuICAgICAgICBjaGVjay5hbGlhcyhldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubyk7IHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmKCd+QCcgPT09IHNvdWwuc2xpY2UoMCwyKSl7IC8vIHNwZWNpYWwgY2FzZSBmb3Igc2hhcmVkIHN5c3RlbSBkYXRhLCB0aGUgbGlzdCBvZiBwdWJsaWMga2V5cyBmb3IgYW4gYWxpYXMuXG4gICAgICAgIGNoZWNrLnB1YnMoZXZlLCBtc2csIHZhbCwga2V5LCBzb3VsLCBhdCwgbm8pOyByZXR1cm47XG4gICAgICB9XG4gICAgICAvL2lmKCd+JyA9PT0gc291bC5zbGljZSgwLDEpICYmIDIgPT09ICh0bXAgPSBzb3VsLnNsaWNlKDEpKS5zcGxpdCgnLicpLmxlbmd0aCl7IC8vIHNwZWNpYWwgY2FzZSwgYWNjb3VudCBkYXRhIGZvciBhIHB1YmxpYyBrZXkuXG4gICAgICBpZih0bXAgPSBTRUEub3B0LnB1Yihzb3VsKSl7IC8vIHNwZWNpYWwgY2FzZSwgYWNjb3VudCBkYXRhIGZvciBhIHB1YmxpYyBrZXkuXG4gICAgICAgIGNoZWNrLnB1YihldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubywgYXQudXNlcnx8JycsIHRtcCk7IHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmKDAgPD0gc291bC5pbmRleE9mKCcjJykpeyAvLyBzcGVjaWFsIGNhc2UgZm9yIGNvbnRlbnQgYWRkcmVzc2luZyBpbW11dGFibGUgaGFzaGVkIGRhdGEuXG4gICAgICAgIGNoZWNrLmhhc2goZXZlLCBtc2csIHZhbCwga2V5LCBzb3VsLCBhdCwgbm8pOyByZXR1cm47XG4gICAgICB9IFxuICAgICAgY2hlY2suYW55KGV2ZSwgbXNnLCB2YWwsIGtleSwgc291bCwgYXQsIG5vLCBhdC51c2VyfHwnJyk7IHJldHVybjtcbiAgICAgIGV2ZS50by5uZXh0KG1zZyk7IC8vIG5vdCBoYW5kbGVkXG4gICAgfVxuICAgIGNoZWNrLmhhc2ggPSBmdW5jdGlvbihldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubyl7XG4gICAgICBTRUEud29yayh2YWwsIG51bGwsIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBpZihkYXRhICYmIGRhdGEgPT09IGtleS5zcGxpdCgnIycpLnNsaWNlKC0xKVswXSl7IHJldHVybiBldmUudG8ubmV4dChtc2cpIH1cbiAgICAgICAgbm8oXCJEYXRhIGhhc2ggbm90IHNhbWUgYXMgaGFzaCFcIik7XG4gICAgICB9LCB7bmFtZTogJ1NIQS0yNTYnfSk7XG4gICAgfVxuICAgIGNoZWNrLmFsaWFzID0gZnVuY3Rpb24oZXZlLCBtc2csIHZhbCwga2V5LCBzb3VsLCBhdCwgbm8peyAvLyBFeGFtcGxlOiB7XzojfkAsIH5AYWxpY2U6IHsjfkBhbGljZX19XG4gICAgICBpZighdmFsKXsgcmV0dXJuIG5vKFwiRGF0YSBtdXN0IGV4aXN0IVwiKSB9IC8vIGRhdGEgTVVTVCBleGlzdFxuICAgICAgaWYoJ35AJytrZXkgPT09IGxpbmtfaXModmFsKSl7IHJldHVybiBldmUudG8ubmV4dChtc2cpIH0gLy8gaW4gZmFjdCwgaXQgbXVzdCBiZSBFWEFDVExZIGVxdWFsIHRvIGl0c2VsZlxuICAgICAgbm8oXCJBbGlhcyBub3Qgc2FtZSFcIik7IC8vIGlmIGl0IGlzbid0LCByZWplY3QuXG4gICAgfTtcbiAgICBjaGVjay5wdWJzID0gZnVuY3Rpb24oZXZlLCBtc2csIHZhbCwga2V5LCBzb3VsLCBhdCwgbm8peyAvLyBFeGFtcGxlOiB7XzojfkBhbGljZSwgfmFzZGY6IHsjfmFzZGZ9fVxuICAgICAgaWYoIXZhbCl7IHJldHVybiBubyhcIkFsaWFzIG11c3QgZXhpc3QhXCIpIH0gLy8gZGF0YSBNVVNUIGV4aXN0XG4gICAgICBpZihrZXkgPT09IGxpbmtfaXModmFsKSl7IHJldHVybiBldmUudG8ubmV4dChtc2cpIH0gLy8gYW5kIHRoZSBJRCBtdXN0IGJlIEVYQUNUTFkgZXF1YWwgdG8gaXRzIHByb3BlcnR5XG4gICAgICBubyhcIkFsaWFzIG5vdCBzYW1lIVwiKTsgLy8gdGhhdCB3YXkgbm9ib2R5IGNhbiB0YW1wZXIgd2l0aCB0aGUgbGlzdCBvZiBwdWJsaWMga2V5cy5cbiAgICB9O1xuICAgIGNoZWNrLnB1YiA9IGFzeW5jIGZ1bmN0aW9uKGV2ZSwgbXNnLCB2YWwsIGtleSwgc291bCwgYXQsIG5vLCB1c2VyLCBwdWIpeyB2YXIgdG1wIC8vIEV4YW1wbGU6IHtfOiN+YXNkZiwgaGVsbG86J3dvcmxkJ35mZHNhfX1cbiAgICAgIGNvbnN0IHJhdyA9IGF3YWl0IFMucGFyc2UodmFsKSB8fCB7fVxuICAgICAgY29uc3QgdmVyaWZ5ID0gKGNlcnRpZmljYXRlLCBjZXJ0aWZpY2FudCwgY2IpID0+IHtcbiAgICAgICAgaWYgKGNlcnRpZmljYXRlLm0gJiYgY2VydGlmaWNhdGUucyAmJiBjZXJ0aWZpY2FudCAmJiBwdWIpXG4gICAgICAgICAgLy8gbm93IHZlcmlmeSBjZXJ0aWZpY2F0ZVxuICAgICAgICAgIHJldHVybiBTRUEudmVyaWZ5KGNlcnRpZmljYXRlLCBwdWIsIGRhdGEgPT4geyAvLyBjaGVjayBpZiBcInB1YlwiIChvZiB0aGUgZ3JhcGggb3duZXIpIHJlYWxseSBpc3N1ZWQgdGhpcyBjZXJ0XG4gICAgICAgICAgICBpZiAodSAhPT0gZGF0YSAmJiB1ICE9PSBkYXRhLmUgJiYgbXNnLnB1dFsnPiddICYmIG1zZy5wdXRbJz4nXSA+IHBhcnNlRmxvYXQoZGF0YS5lKSkgcmV0dXJuIG5vKFwiQ2VydGlmaWNhdGUgZXhwaXJlZC5cIikgLy8gY2VydGlmaWNhdGUgZXhwaXJlZFxuICAgICAgICAgICAgLy8gXCJkYXRhLmNcIiA9IGEgbGlzdCBvZiBjZXJ0aWZpY2FudHMvY2VydGlmaWVkIHVzZXJzXG4gICAgICAgICAgICAvLyBcImRhdGEud1wiID0gbGV4IFdSSVRFIHBlcm1pc3Npb24sIGluIHRoZSBmdXR1cmUsIHRoZXJlIHdpbGwgYmUgXCJkYXRhLnJcIiB3aGljaCBtZWFucyBsZXggUkVBRCBwZXJtaXNzaW9uXG4gICAgICAgICAgICBpZiAodSAhPT0gZGF0YSAmJiBkYXRhLmMgJiYgZGF0YS53ICYmIChkYXRhLmMgPT09IGNlcnRpZmljYW50IHx8IGRhdGEuYy5pbmRleE9mKCcqJyB8fCBjZXJ0aWZpY2FudCkgPiAtMSkpIHtcbiAgICAgICAgICAgICAgLy8gb2ssIG5vdyBcImNlcnRpZmljYW50XCIgaXMgaW4gdGhlIFwiY2VydGlmaWNhbnRzXCIgbGlzdCwgYnV0IGlzIFwicGF0aFwiIGFsbG93ZWQ/IENoZWNrIHBhdGhcbiAgICAgICAgICAgICAgbGV0IHBhdGggPSBzb3VsLmluZGV4T2YoJy8nKSA+IC0xID8gc291bC5yZXBsYWNlKHNvdWwuc3Vic3RyaW5nKDAsIHNvdWwuaW5kZXhPZignLycpICsgMSksICcnKSA6ICcnXG4gICAgICAgICAgICAgIFN0cmluZy5tYXRjaCA9IFN0cmluZy5tYXRjaCB8fCBHdW4udGV4dC5tYXRjaFxuICAgICAgICAgICAgICBjb25zdCB3ID0gQXJyYXkuaXNBcnJheShkYXRhLncpID8gZGF0YS53IDogdHlwZW9mIGRhdGEudyA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIGRhdGEudyA9PT0gJ3N0cmluZycgPyBbZGF0YS53XSA6IFtdXG4gICAgICAgICAgICAgIGZvciAoY29uc3QgbGV4IG9mIHcpIHtcbiAgICAgICAgICAgICAgICBpZiAoKFN0cmluZy5tYXRjaChwYXRoLCBsZXhbJyMnXSkgJiYgU3RyaW5nLm1hdGNoKGtleSwgbGV4WycuJ10pKSB8fCAoIWxleFsnLiddICYmIFN0cmluZy5tYXRjaChwYXRoLCBsZXhbJyMnXSkpIHx8ICghbGV4WycjJ10gJiYgU3RyaW5nLm1hdGNoKGtleSwgbGV4WycuJ10pKSB8fCBTdHJpbmcubWF0Y2goKHBhdGggPyBwYXRoICsgJy8nICsga2V5IDoga2V5KSwgbGV4WycjJ10gfHwgbGV4KSkge1xuICAgICAgICAgICAgICAgICAgLy8gaXMgQ2VydGlmaWNhbnQgZm9yY2VkIHRvIHByZXNlbnQgaW4gUGF0aFxuICAgICAgICAgICAgICAgICAgaWYgKGxleFsnKyddICYmIGxleFsnKyddLmluZGV4T2YoJyonKSA+IC0xICYmIHBhdGggJiYgcGF0aC5pbmRleE9mKGNlcnRpZmljYW50KSA9PSAtMSAmJiBrZXkuaW5kZXhPZihjZXJ0aWZpY2FudCkgPT0gLTEpIHJldHVybiBubyhgUGF0aCBcIiR7cGF0aH1cIiBvciBrZXkgXCIke2tleX1cIiBtdXN0IGNvbnRhaW4gc3RyaW5nIFwiJHtjZXJ0aWZpY2FudH1cIi5gKVxuICAgICAgICAgICAgICAgICAgLy8gcGF0aCBpcyBhbGxvd2VkLCBidXQgaXMgdGhlcmUgYW55IFdSSVRFIGJsb2NrPyBDaGVjayBpdCBvdXRcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhLndiICYmICh0eXBlb2YgZGF0YS53YiA9PT0gJ3N0cmluZycgfHwgKChkYXRhLndiIHx8IHt9KVsnIyddKSkpIHsgLy8gXCJkYXRhLndiXCIgPSBwYXRoIHRvIHRoZSBXUklURSBibG9ja1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm9vdCA9IGV2ZS5hcy5yb290LiQuYmFjaygtMSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhLndiID09PSAnc3RyaW5nJyAmJiAnficgIT09IGRhdGEud2Iuc2xpY2UoMCwgMSkpIHJvb3QgPSByb290LmdldCgnficgKyBwdWIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByb290LmdldChkYXRhLndiKS5nZXQoY2VydGlmaWNhbnQpLm9uY2UodmFsdWUgPT4geyAvLyBUT0RPOiBJTlRFTlQgVE8gREVQUkVDQVRFLlxuICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAodmFsdWUgPT09IDEgfHwgdmFsdWUgPT09IHRydWUpKSByZXR1cm4gbm8oYENlcnRpZmljYW50ICR7Y2VydGlmaWNhbnR9IGJsb2NrZWQuYClcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IoZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiBjYihkYXRhKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbm8oXCJDZXJ0aWZpY2F0ZSB2ZXJpZmljYXRpb24gZmFpbC5cIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCdwdWInID09PSBrZXkgJiYgJ34nICsgcHViID09PSBzb3VsKSB7XG4gICAgICAgIGlmICh2YWwgPT09IHB1YikgcmV0dXJuIGV2ZS50by5uZXh0KG1zZykgLy8gdGhlIGFjY291bnQgTVVTVCBtYXRjaCBgcHViYCBwcm9wZXJ0eSB0aGF0IGVxdWFscyB0aGUgSUQgb2YgdGhlIHB1YmxpYyBrZXkuXG4gICAgICAgIHJldHVybiBubyhcIkFjY291bnQgbm90IHNhbWUhXCIpXG4gICAgICB9XG5cbiAgICAgIGlmICgodG1wID0gdXNlci5pcykgJiYgdG1wLnB1YiAmJiAhcmF3WycqJ10gJiYgIXJhd1snKyddICYmIChwdWIgPT09IHRtcC5wdWIgfHwgKHB1YiAhPT0gdG1wLnB1YiAmJiAoKG1zZy5fLm1zZyB8fCB7fSkub3B0IHx8IHt9KS5jZXJ0KSkpe1xuICAgICAgICBTRUEub3B0LnBhY2sobXNnLnB1dCwgcGFja2VkID0+IHtcbiAgICAgICAgICBTRUEuc2lnbihwYWNrZWQsICh1c2VyLl8pLnNlYSwgYXN5bmMgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKHUgPT09IGRhdGEpIHJldHVybiBubyhTRUEuZXJyIHx8ICdTaWduYXR1cmUgZmFpbC4nKVxuICAgICAgICAgICAgbXNnLnB1dFsnOiddID0geyc6JzogdG1wID0gU0VBLm9wdC51bnBhY2soZGF0YS5tKSwgJ34nOiBkYXRhLnN9XG4gICAgICAgICAgICBtc2cucHV0Wyc9J10gPSB0bXBcbiAgXG4gICAgICAgICAgICAvLyBpZiB3cml0aW5nIHRvIG93biBncmFwaCwganVzdCBhbGxvdyBpdFxuICAgICAgICAgICAgaWYgKHB1YiA9PT0gdXNlci5pcy5wdWIpIHtcbiAgICAgICAgICAgICAgaWYgKHRtcCA9IGxpbmtfaXModmFsKSkgKGF0LnNlYS5vd25bdG1wXSA9IGF0LnNlYS5vd25bdG1wXSB8fCB7fSlbcHViXSA9IDFcbiAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnlBc3luYyhtc2cucHV0Wyc6J10sIGZ1bmN0aW9uKGVycixzKXtcbiAgICAgICAgICAgICAgICBpZihlcnIpeyByZXR1cm4gbm8oZXJyIHx8IFwiU3RyaW5naWZ5IGVycm9yLlwiKSB9XG4gICAgICAgICAgICAgICAgbXNnLnB1dFsnOiddID0gcztcbiAgICAgICAgICAgICAgICByZXR1cm4gZXZlLnRvLm5leHQobXNnKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gIFxuICAgICAgICAgICAgLy8gaWYgd3JpdGluZyB0byBvdGhlcidzIGdyYXBoLCBjaGVjayBpZiBjZXJ0IGV4aXN0cyB0aGVuIHRyeSB0byBpbmplY3QgY2VydCBpbnRvIHB1dCwgYWxzbyBpbmplY3Qgc2VsZiBwdWIgc28gdGhhdCBldmVyeW9uZSBjYW4gdmVyaWZ5IHRoZSBwdXRcbiAgICAgICAgICAgIGlmIChwdWIgIT09IHVzZXIuaXMucHViICYmICgobXNnLl8ubXNnIHx8IHt9KS5vcHQgfHwge30pLmNlcnQpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2VydCA9IGF3YWl0IFMucGFyc2UobXNnLl8ubXNnLm9wdC5jZXJ0KVxuICAgICAgICAgICAgICAvLyBldmVuIGlmIGNlcnQgZXhpc3RzLCB3ZSBtdXN0IHZlcmlmeSBpdFxuICAgICAgICAgICAgICBpZiAoY2VydCAmJiBjZXJ0Lm0gJiYgY2VydC5zKVxuICAgICAgICAgICAgICAgIHZlcmlmeShjZXJ0LCB1c2VyLmlzLnB1YiwgXyA9PiB7XG4gICAgICAgICAgICAgICAgICBtc2cucHV0Wyc6J11bJysnXSA9IGNlcnQgLy8gJysnIGlzIGEgY2VydGlmaWNhdGVcbiAgICAgICAgICAgICAgICAgIG1zZy5wdXRbJzonXVsnKiddID0gdXNlci5pcy5wdWIgLy8gJyonIGlzIHB1YiBvZiB0aGUgdXNlciB3aG8gcHV0c1xuICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnlBc3luYyhtc2cucHV0Wyc6J10sIGZ1bmN0aW9uKGVycixzKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZXJyKXsgcmV0dXJuIG5vKGVyciB8fCBcIlN0cmluZ2lmeSBlcnJvci5cIikgfVxuICAgICAgICAgICAgICAgICAgICBtc2cucHV0Wyc6J10gPSBzO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXZlLnRvLm5leHQobXNnKTtcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIHtyYXc6IDF9KVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIFNFQS5vcHQucGFjayhtc2cucHV0LCBwYWNrZWQgPT4ge1xuICAgICAgICBTRUEudmVyaWZ5KHBhY2tlZCwgcmF3WycqJ10gfHwgcHViLCBmdW5jdGlvbihkYXRhKXsgdmFyIHRtcDtcbiAgICAgICAgICBkYXRhID0gU0VBLm9wdC51bnBhY2soZGF0YSk7XG4gICAgICAgICAgaWYgKHUgPT09IGRhdGEpIHJldHVybiBubyhcIlVudmVyaWZpZWQgZGF0YS5cIikgLy8gbWFrZSBzdXJlIHRoZSBzaWduYXR1cmUgbWF0Y2hlcyB0aGUgYWNjb3VudCBpdCBjbGFpbXMgdG8gYmUgb24uIC8vIHJlamVjdCBhbnkgdXBkYXRlcyB0aGF0IGFyZSBzaWduZWQgd2l0aCBhIG1pc21hdGNoZWQgYWNjb3VudC5cbiAgICAgICAgICBpZiAoKHRtcCA9IGxpbmtfaXMoZGF0YSkpICYmIHB1YiA9PT0gU0VBLm9wdC5wdWIodG1wKSkgKGF0LnNlYS5vd25bdG1wXSA9IGF0LnNlYS5vd25bdG1wXSB8fCB7fSlbcHViXSA9IDFcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBjaGVjayBpZiBjZXJ0ICgnKycpIGFuZCBwdXR0ZXIncyBwdWIgKCcqJykgZXhpc3RcbiAgICAgICAgICBpZiAocmF3WycrJ10gJiYgcmF3WycrJ11bJ20nXSAmJiByYXdbJysnXVsncyddICYmIHJhd1snKiddKVxuICAgICAgICAgICAgLy8gbm93IHZlcmlmeSBjZXJ0aWZpY2F0ZVxuICAgICAgICAgICAgdmVyaWZ5KHJhd1snKyddLCByYXdbJyonXSwgXyA9PiB7XG4gICAgICAgICAgICAgIG1zZy5wdXRbJz0nXSA9IGRhdGE7XG4gICAgICAgICAgICAgIHJldHVybiBldmUudG8ubmV4dChtc2cpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG1zZy5wdXRbJz0nXSA9IGRhdGE7XG4gICAgICAgICAgICByZXR1cm4gZXZlLnRvLm5leHQobXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH07XG4gICAgY2hlY2suYW55ID0gZnVuY3Rpb24oZXZlLCBtc2csIHZhbCwga2V5LCBzb3VsLCBhdCwgbm8sIHVzZXIpeyB2YXIgdG1wLCBwdWI7XG4gICAgICBpZihhdC5vcHQuc2VjdXJlKXsgcmV0dXJuIG5vKFwiU291bCBtaXNzaW5nIHB1YmxpYyBrZXkgYXQgJ1wiICsga2V5ICsgXCInLlwiKSB9XG4gICAgICAvLyBUT0RPOiBBc2sgY29tbXVuaXR5IGlmIHNob3VsZCBhdXRvLXNpZ24gbm9uIHVzZXItZ3JhcGggZGF0YS5cbiAgICAgIGF0Lm9uKCdzZWN1cmUnLCBmdW5jdGlvbihtc2cpeyB0aGlzLm9mZigpO1xuICAgICAgICBpZighYXQub3B0LnNlY3VyZSl7IHJldHVybiBldmUudG8ubmV4dChtc2cpIH1cbiAgICAgICAgbm8oXCJEYXRhIGNhbm5vdCBiZSBjaGFuZ2VkLlwiKTtcbiAgICAgIH0pLm9uLm9uKCdzZWN1cmUnLCBtc2cpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB2YWxpZCA9IEd1bi52YWxpZCwgbGlua19pcyA9IGZ1bmN0aW9uKGQsbCl7IHJldHVybiAnc3RyaW5nJyA9PSB0eXBlb2YgKGwgPSB2YWxpZChkKSkgJiYgbCB9LCBzdGF0ZV9pZnkgPSAoR3VuLnN0YXRlfHwnJykuaWZ5O1xuXG4gICAgdmFyIHB1YmN1dCA9IC9bXlxcd18tXS87IC8vIGFueXRoaW5nIG5vdCBhbHBoYW51bWVyaWMgb3IgXyAtXG4gICAgU0VBLm9wdC5wdWIgPSBmdW5jdGlvbihzKXtcbiAgICAgIGlmKCFzKXsgcmV0dXJuIH1cbiAgICAgIHMgPSBzLnNwbGl0KCd+Jyk7XG4gICAgICBpZighcyB8fCAhKHMgPSBzWzFdKSl7IHJldHVybiB9XG4gICAgICBzID0gcy5zcGxpdChwdWJjdXQpLnNsaWNlKDAsMik7XG4gICAgICBpZighcyB8fCAyICE9IHMubGVuZ3RoKXsgcmV0dXJuIH1cbiAgICAgIGlmKCdAJyA9PT0gKHNbMF18fCcnKVswXSl7IHJldHVybiB9XG4gICAgICBzID0gcy5zbGljZSgwLDIpLmpvaW4oJy4nKTtcbiAgICAgIHJldHVybiBzO1xuICAgIH1cbiAgICBTRUEub3B0LnN0cmluZ3kgPSBmdW5jdGlvbih0KXtcbiAgICAgIC8vIFRPRE86IGVuY3J5cHQgZXRjLiBuZWVkIHRvIGNoZWNrIHN0cmluZyBwcmltaXRpdmUuIE1ha2UgYXMgYnJlYWtpbmcgY2hhbmdlLlxuICAgIH1cbiAgICBTRUEub3B0LnBhY2sgPSBmdW5jdGlvbihkLGNiLGssIG4scyl7IHZhciB0bXAsIGY7IC8vIHBhY2sgZm9yIHZlcmlmeWluZ1xuICAgICAgaWYoU0VBLm9wdC5jaGVjayhkKSl7IHJldHVybiBjYihkKSB9XG4gICAgICBpZihkICYmIGRbJyMnXSAmJiBkWycuJ10gJiYgZFsnPiddKXsgdG1wID0gZFsnOiddOyBmID0gMSB9XG4gICAgICBKU09OLnBhcnNlQXN5bmMoZj8gdG1wIDogZCwgZnVuY3Rpb24oZXJyLCBtZXRhKXtcbiAgICAgICAgdmFyIHNpZyA9ICgodSAhPT0gKG1ldGF8fCcnKVsnOiddKSAmJiAobWV0YXx8JycpWyd+J10pOyAvLyBvciBqdXN0IH4gY2hlY2s/XG4gICAgICAgIGlmKCFzaWcpeyBjYihkKTsgcmV0dXJuIH1cbiAgICAgICAgY2Ioe206IHsnIyc6c3x8ZFsnIyddLCcuJzprfHxkWycuJ10sJzonOihtZXRhfHwnJylbJzonXSwnPic6ZFsnPiddfHxHdW4uc3RhdGUuaXMobiwgayl9LCBzOiBzaWd9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgTyA9IFNFQS5vcHQ7XG4gICAgU0VBLm9wdC51bnBhY2sgPSBmdW5jdGlvbihkLCBrLCBuKXsgdmFyIHRtcDtcbiAgICAgIGlmKHUgPT09IGQpeyByZXR1cm4gfVxuICAgICAgaWYoZCAmJiAodSAhPT0gKHRtcCA9IGRbJzonXSkpKXsgcmV0dXJuIHRtcCB9XG4gICAgICBrID0gayB8fCBPLmZhbGxfa2V5OyBpZighbiAmJiBPLmZhbGxfdmFsKXsgbiA9IHt9OyBuW2tdID0gTy5mYWxsX3ZhbCB9XG4gICAgICBpZighayB8fCAhbil7IHJldHVybiB9XG4gICAgICBpZihkID09PSBuW2tdKXsgcmV0dXJuIGQgfVxuICAgICAgaWYoIVNFQS5vcHQuY2hlY2sobltrXSkpeyByZXR1cm4gZCB9XG4gICAgICB2YXIgc291bCA9IChuICYmIG4uXyAmJiBuLl9bJyMnXSkgfHwgTy5mYWxsX3NvdWwsIHMgPSBHdW4uc3RhdGUuaXMobiwgaykgfHwgTy5mYWxsX3N0YXRlO1xuICAgICAgaWYoZCAmJiA0ID09PSBkLmxlbmd0aCAmJiBzb3VsID09PSBkWzBdICYmIGsgPT09IGRbMV0gJiYgZmwocykgPT09IGZsKGRbM10pKXtcbiAgICAgICAgcmV0dXJuIGRbMl07XG4gICAgICB9XG4gICAgICBpZihzIDwgU0VBLm9wdC5zaHVmZmxlX2F0dGFjayl7XG4gICAgICAgIHJldHVybiBkO1xuICAgICAgfVxuICAgIH1cbiAgICBTRUEub3B0LnNodWZmbGVfYXR0YWNrID0gMTU0NjMyOTYwMDAwMDsgLy8gSmFuIDEsIDIwMTlcbiAgICB2YXIgZmwgPSBNYXRoLmZsb29yOyAvLyBUT0RPOiBTdGlsbCBuZWVkIHRvIGZpeCBpbmNvbnNpc3RlbnQgc3RhdGUgaXNzdWUuXG4gICAgLy8gVE9ETzogUG90ZW50aWFsIGJ1Zz8gSWYgcHViL3ByaXYga2V5IHN0YXJ0cyB3aXRoIGAtYD8gSURLIGhvdyBwb3NzaWJsZS5cblxuICB9KShVU0UsICcuL2luZGV4Jyk7XG59KCkpO1xuIiwiXG4vLyByZXF1ZXN0IC8gcmVzcG9uc2UgbW9kdWxlLCBmb3IgYXNraW5nIGFuZCBhY2tpbmcgbWVzc2FnZXMuXG5yZXF1aXJlKCcuL29udG8nKTsgLy8gZGVwZW5kcyB1cG9uIG9udG8hXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFzayhjYiwgYXMpe1xuXHRpZighdGhpcy5vbil7IHJldHVybiB9XG5cdHZhciBsYWNrID0gKHRoaXMub3B0fHx7fSkubGFjayB8fCA5MDAwO1xuXHRpZighKCdmdW5jdGlvbicgPT0gdHlwZW9mIGNiKSl7XG5cdFx0aWYoIWNiKXsgcmV0dXJuIH1cblx0XHR2YXIgaWQgPSBjYlsnIyddIHx8IGNiLCB0bXAgPSAodGhpcy50YWd8fCcnKVtpZF07XG5cdFx0aWYoIXRtcCl7IHJldHVybiB9XG5cdFx0aWYoYXMpe1xuXHRcdFx0dG1wID0gdGhpcy5vbihpZCwgYXMpO1xuXHRcdFx0Y2xlYXJUaW1lb3V0KHRtcC5lcnIpO1xuXHRcdFx0dG1wLmVyciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgdG1wLm9mZigpIH0sIGxhY2spO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHR2YXIgaWQgPSAoYXMgJiYgYXNbJyMnXSkgfHwgcmFuZG9tKDkpO1xuXHRpZighY2IpeyByZXR1cm4gaWQgfVxuXHR2YXIgdG8gPSB0aGlzLm9uKGlkLCBjYiwgYXMpO1xuXHR0by5lcnIgPSB0by5lcnIgfHwgc2V0VGltZW91dChmdW5jdGlvbigpeyB0by5vZmYoKTtcblx0XHR0by5uZXh0KHtlcnI6IFwiRXJyb3I6IE5vIEFDSyB5ZXQuXCIsIGxhY2s6IHRydWV9KTtcblx0fSwgbGFjayk7XG5cdHJldHVybiBpZDtcbn1cbnZhciByYW5kb20gPSBTdHJpbmcucmFuZG9tIHx8IGZ1bmN0aW9uKCl7IHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKSB9XG5cdCIsIlxudmFyIEd1biA9IHJlcXVpcmUoJy4vcm9vdCcpO1xuR3VuLmNoYWluLmJhY2sgPSBmdW5jdGlvbihuLCBvcHQpeyB2YXIgdG1wO1xuXHRuID0gbiB8fCAxO1xuXHRpZigtMSA9PT0gbiB8fCBJbmZpbml0eSA9PT0gbil7XG5cdFx0cmV0dXJuIHRoaXMuXy5yb290LiQ7XG5cdH0gZWxzZVxuXHRpZigxID09PSBuKXtcblx0XHRyZXR1cm4gKHRoaXMuXy5iYWNrIHx8IHRoaXMuXykuJDtcblx0fVxuXHR2YXIgZ3VuID0gdGhpcywgYXQgPSBndW4uXztcblx0aWYodHlwZW9mIG4gPT09ICdzdHJpbmcnKXtcblx0XHRuID0gbi5zcGxpdCgnLicpO1xuXHR9XG5cdGlmKG4gaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0dmFyIGkgPSAwLCBsID0gbi5sZW5ndGgsIHRtcCA9IGF0O1xuXHRcdGZvcihpOyBpIDwgbDsgaSsrKXtcblx0XHRcdHRtcCA9ICh0bXB8fGVtcHR5KVtuW2ldXTtcblx0XHR9XG5cdFx0aWYodSAhPT0gdG1wKXtcblx0XHRcdHJldHVybiBvcHQ/IGd1biA6IHRtcDtcblx0XHR9IGVsc2Vcblx0XHRpZigodG1wID0gYXQuYmFjaykpe1xuXHRcdFx0cmV0dXJuIHRtcC4kLmJhY2sobiwgb3B0KTtcblx0XHR9XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIG4pe1xuXHRcdHZhciB5ZXMsIHRtcCA9IHtiYWNrOiBhdH07XG5cdFx0d2hpbGUoKHRtcCA9IHRtcC5iYWNrKVxuXHRcdCYmIHUgPT09ICh5ZXMgPSBuKHRtcCwgb3B0KSkpe31cblx0XHRyZXR1cm4geWVzO1xuXHR9XG5cdGlmKCdudW1iZXInID09IHR5cGVvZiBuKXtcblx0XHRyZXR1cm4gKGF0LmJhY2sgfHwgYXQpLiQuYmFjayhuIC0gMSk7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59XG52YXIgZW1wdHkgPSB7fSwgdTtcblx0IiwiXG4vLyBXQVJOSU5HOiBHVU4gaXMgdmVyeSBzaW1wbGUsIGJ1dCB0aGUgSmF2YVNjcmlwdCBjaGFpbmluZyBBUEkgYXJvdW5kIEdVTlxuLy8gaXMgY29tcGxpY2F0ZWQgYW5kIHdhcyBleHRyZW1lbHkgaGFyZCB0byBidWlsZC4gSWYgeW91IHBvcnQgR1VOIHRvIGFub3RoZXJcbi8vIGxhbmd1YWdlLCBjb25zaWRlciBpbXBsZW1lbnRpbmcgYW4gZWFzaWVyIEFQSSB0byBidWlsZC5cbnZhciBHdW4gPSByZXF1aXJlKCcuL3Jvb3QnKTtcbkd1bi5jaGFpbi5jaGFpbiA9IGZ1bmN0aW9uKHN1Yil7XG5cdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fLCBjaGFpbiA9IG5ldyAoc3ViIHx8IGd1bikuY29uc3RydWN0b3IoZ3VuKSwgY2F0ID0gY2hhaW4uXywgcm9vdDtcblx0Y2F0LnJvb3QgPSByb290ID0gYXQucm9vdDtcblx0Y2F0LmlkID0gKytyb290Lm9uY2U7XG5cdGNhdC5iYWNrID0gZ3VuLl87XG5cdGNhdC5vbiA9IEd1bi5vbjtcblx0Y2F0Lm9uKCdpbicsIEd1bi5vbi5pbiwgY2F0KTsgLy8gRm9yICdpbicgaWYgSSBhZGQgbXkgb3duIGxpc3RlbmVycyB0byBlYWNoIHRoZW4gSSBNVVNUIGRvIGl0IGJlZm9yZSBpbiBnZXRzIGNhbGxlZC4gSWYgSSBsaXN0ZW4gZ2xvYmFsbHkgZm9yIGFsbCBpbmNvbWluZyBkYXRhIGluc3RlYWQgdGhvdWdoLCByZWdhcmRsZXNzIG9mIGluZGl2aWR1YWwgbGlzdGVuZXJzLCBJIGNhbiB0cmFuc2Zvcm0gdGhlIGRhdGEgdGhlcmUgYW5kIHRoZW4gYXMgd2VsbC5cblx0Y2F0Lm9uKCdvdXQnLCBHdW4ub24ub3V0LCBjYXQpOyAvLyBIb3dldmVyIGZvciBvdXRwdXQsIHRoZXJlIGlzbid0IHJlYWxseSB0aGUgZ2xvYmFsIG9wdGlvbi4gSSBtdXN0IGxpc3RlbiBieSBhZGRpbmcgbXkgb3duIGxpc3RlbmVyIGluZGl2aWR1YWxseSBCRUZPUkUgdGhpcyBvbmUgaXMgZXZlciBjYWxsZWQuXG5cdHJldHVybiBjaGFpbjtcbn1cblxuZnVuY3Rpb24gb3V0cHV0KG1zZyl7XG5cdHZhciBwdXQsIGdldCwgYXQgPSB0aGlzLmFzLCBiYWNrID0gYXQuYmFjaywgcm9vdCA9IGF0LnJvb3QsIHRtcDtcblx0aWYoIW1zZy4kKXsgbXNnLiQgPSBhdC4kIH1cblx0dGhpcy50by5uZXh0KG1zZyk7XG5cdGlmKGF0LmVycil7IGF0Lm9uKCdpbicsIHtwdXQ6IGF0LnB1dCA9IHUsICQ6IGF0LiR9KTsgcmV0dXJuIH1cblx0aWYoZ2V0ID0gbXNnLmdldCl7XG5cdFx0LyppZih1ICE9PSBhdC5wdXQpe1xuXHRcdFx0YXQub24oJ2luJywgYXQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH0qL1xuXHRcdGlmKHJvb3QucGFzcyl7IHJvb3QucGFzc1thdC5pZF0gPSBhdDsgfSAvLyB3aWxsIHRoaXMgbWFrZSBmb3IgYnVnZ3kgYmVoYXZpb3IgZWxzZXdoZXJlP1xuXHRcdGlmKGF0LmxleCl7IE9iamVjdC5rZXlzKGF0LmxleCkuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gYXQubGV4W2tdIH0sIHRtcCA9IG1zZy5nZXQgPSBtc2cuZ2V0IHx8IHt9KSB9XG5cdFx0aWYoZ2V0WycjJ10gfHwgYXQuc291bCl7XG5cdFx0XHRnZXRbJyMnXSA9IGdldFsnIyddIHx8IGF0LnNvdWw7XG5cdFx0XHRtc2dbJyMnXSB8fCAobXNnWycjJ10gPSB0ZXh0X3JhbmQoOSkpOyAvLyBBMzEyMCA/XG5cdFx0XHRiYWNrID0gKHJvb3QuJC5nZXQoZ2V0WycjJ10pLl8pO1xuXHRcdFx0aWYoIShnZXQgPSBnZXRbJy4nXSkpeyAvLyBzb3VsXG5cdFx0XHRcdHRtcCA9IGJhY2suYXNrICYmIGJhY2suYXNrWycnXTsgLy8gY2hlY2sgaWYgd2UgaGF2ZSBhbHJlYWR5IGFza2VkIGZvciB0aGUgZnVsbCBub2RlXG5cdFx0XHRcdChiYWNrLmFzayB8fCAoYmFjay5hc2sgPSB7fSkpWycnXSA9IGJhY2s7IC8vIGFkZCBhIGZsYWcgdGhhdCB3ZSBhcmUgbm93LlxuXHRcdFx0XHRpZih1ICE9PSBiYWNrLnB1dCl7IC8vIGlmIHdlIGFscmVhZHkgaGF2ZSBkYXRhLFxuXHRcdFx0XHRcdGJhY2sub24oJ2luJywgYmFjayk7IC8vIHNlbmQgd2hhdCBpcyBjYWNoZWQgZG93biB0aGUgY2hhaW5cblx0XHRcdFx0XHRpZih0bXApeyByZXR1cm4gfSAvLyBhbmQgZG9uJ3QgYXNrIGZvciBpdCBhZ2Fpbi5cblx0XHRcdFx0fVxuXHRcdFx0XHRtc2cuJCA9IGJhY2suJDtcblx0XHRcdH0gZWxzZVxuXHRcdFx0aWYob2JqX2hhcyhiYWNrLnB1dCwgZ2V0KSl7IC8vIFRPRE86IHN1cHBvcnQgI0xFWCAhXG5cdFx0XHRcdHRtcCA9IGJhY2suYXNrICYmIGJhY2suYXNrW2dldF07XG5cdFx0XHRcdChiYWNrLmFzayB8fCAoYmFjay5hc2sgPSB7fSkpW2dldF0gPSBiYWNrLiQuZ2V0KGdldCkuXztcblx0XHRcdFx0YmFjay5vbignaW4nLCB7Z2V0OiBnZXQsIHB1dDogeycjJzogYmFjay5zb3VsLCAnLic6IGdldCwgJzonOiBiYWNrLnB1dFtnZXRdLCAnPic6IHN0YXRlX2lzKHJvb3QuZ3JhcGhbYmFjay5zb3VsXSwgZ2V0KX19KTtcblx0XHRcdFx0aWYodG1wKXsgcmV0dXJuIH1cblx0XHRcdH1cblx0XHRcdFx0LypwdXQgPSAoYmFjay4kLmdldChnZXQpLl8pO1xuXHRcdFx0XHRpZighKHRtcCA9IHB1dC5hY2spKXsgcHV0LmFjayA9IC0xIH1cblx0XHRcdFx0YmFjay5vbignaW4nLCB7XG5cdFx0XHRcdFx0JDogYmFjay4kLFxuXHRcdFx0XHRcdHB1dDogR3VuLnN0YXRlLmlmeSh7fSwgZ2V0LCBHdW4uc3RhdGUoYmFjay5wdXQsIGdldCksIGJhY2sucHV0W2dldF0pLFxuXHRcdFx0XHRcdGdldDogYmFjay5nZXRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmKHRtcCl7IHJldHVybiB9XG5cdFx0XHR9IGVsc2Vcblx0XHRcdGlmKCdzdHJpbmcnICE9IHR5cGVvZiBnZXQpe1xuXHRcdFx0XHR2YXIgcHV0ID0ge30sIG1ldGEgPSAoYmFjay5wdXR8fHt9KS5fO1xuXHRcdFx0XHRHdW4ub2JqLm1hcChiYWNrLnB1dCwgZnVuY3Rpb24odixrKXtcblx0XHRcdFx0XHRpZighR3VuLnRleHQubWF0Y2goaywgZ2V0KSl7IHJldHVybiB9XG5cdFx0XHRcdFx0cHV0W2tdID0gdjtcblx0XHRcdFx0fSlcblx0XHRcdFx0aWYoIUd1bi5vYmouZW1wdHkocHV0KSl7XG5cdFx0XHRcdFx0cHV0Ll8gPSBtZXRhO1xuXHRcdFx0XHRcdGJhY2sub24oJ2luJywgeyQ6IGJhY2suJCwgcHV0OiBwdXQsIGdldDogYmFjay5nZXR9KVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKHRtcCA9IGF0LmxleCl7XG5cdFx0XHRcdFx0dG1wID0gKHRtcC5fKSB8fCAodG1wLl8gPSBmdW5jdGlvbigpe30pO1xuXHRcdFx0XHRcdGlmKGJhY2suYWNrIDwgdG1wLmFzayl7IHRtcC5hc2sgPSBiYWNrLmFjayB9XG5cdFx0XHRcdFx0aWYodG1wLmFzayl7IHJldHVybiB9XG5cdFx0XHRcdFx0dG1wLmFzayA9IDE7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdCovXG5cdFx0XHRyb290LmFzayhhY2ssIG1zZyk7IC8vIEEzMTIwID9cblx0XHRcdHJldHVybiByb290Lm9uKCdpbicsIG1zZyk7XG5cdFx0fVxuXHRcdC8vaWYocm9vdC5ub3cpeyByb290Lm5vd1thdC5pZF0gPSByb290Lm5vd1thdC5pZF0gfHwgdHJ1ZTsgYXQucGFzcyA9IHt9IH1cblx0XHRpZihnZXRbJy4nXSl7XG5cdFx0XHRpZihhdC5nZXQpe1xuXHRcdFx0XHRtc2cgPSB7Z2V0OiB7Jy4nOiBhdC5nZXR9LCAkOiBhdC4kfTtcblx0XHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbYXQuZ2V0XSA9IG1zZy4kLl87IC8vIFRPRE86IFBFUkZPUk1BTkNFPyBNb3JlIGVsZWdhbnQgd2F5P1xuXHRcdFx0XHRyZXR1cm4gYmFjay5vbignb3V0JywgbXNnKTtcblx0XHRcdH1cblx0XHRcdG1zZyA9IHtnZXQ6IGF0LmxleD8gbXNnLmdldCA6IHt9LCAkOiBhdC4kfTtcblx0XHRcdHJldHVybiBiYWNrLm9uKCdvdXQnLCBtc2cpO1xuXHRcdH1cblx0XHQoYXQuYXNrIHx8IChhdC5hc2sgPSB7fSkpWycnXSA9IGF0O1x0IC8vYXQuYWNrID0gYXQuYWNrIHx8IC0xO1xuXHRcdGlmKGF0LmdldCl7XG5cdFx0XHRnZXRbJy4nXSA9IGF0LmdldDtcblx0XHRcdChiYWNrLmFzayB8fCAoYmFjay5hc2sgPSB7fSkpW2F0LmdldF0gPSBtc2cuJC5fOyAvLyBUT0RPOiBQRVJGT1JNQU5DRT8gTW9yZSBlbGVnYW50IHdheT9cblx0XHRcdHJldHVybiBiYWNrLm9uKCdvdXQnLCBtc2cpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gYmFjay5vbignb3V0JywgbXNnKTtcbn07IEd1bi5vbi5vdXQgPSBvdXRwdXQ7XG5cbmZ1bmN0aW9uIGlucHV0KG1zZywgY2F0KXsgY2F0ID0gY2F0IHx8IHRoaXMuYXM7IC8vIFRPRE86IFY4IG1heSBub3QgYmUgYWJsZSB0byBvcHRpbWl6ZSBmdW5jdGlvbnMgd2l0aCBkaWZmZXJlbnQgcGFyYW1ldGVyIGNhbGxzLCBzbyB0cnkgdG8gZG8gYmVuY2htYXJrIHRvIHNlZSBpZiB0aGVyZSBpcyBhbnkgYWN0dWFsIGRpZmZlcmVuY2UuXG5cdHZhciByb290ID0gY2F0LnJvb3QsIGd1biA9IG1zZy4kIHx8IChtc2cuJCA9IGNhdC4kKSwgYXQgPSAoZ3VufHwnJykuXyB8fCBlbXB0eSwgdG1wID0gbXNnLnB1dHx8JycsIHNvdWwgPSB0bXBbJyMnXSwga2V5ID0gdG1wWycuJ10sIGNoYW5nZSA9ICh1ICE9PSB0bXBbJz0nXSk/IHRtcFsnPSddIDogdG1wWyc6J10sIHN0YXRlID0gdG1wWyc+J10gfHwgLUluZmluaXR5LCBzYXQ7IC8vIGV2ZSA9IGV2ZW50LCBhdCA9IGRhdGEgYXQsIGNhdCA9IGNoYWluIGF0LCBzYXQgPSBzdWIgYXQgKGNoaWxkcmVuIGNoYWlucykuXG5cdGlmKHUgIT09IG1zZy5wdXQgJiYgKHUgPT09IHRtcFsnIyddIHx8IHUgPT09IHRtcFsnLiddIHx8ICh1ID09PSB0bXBbJzonXSAmJiB1ID09PSB0bXBbJz0nXSkgfHwgdSA9PT0gdG1wWyc+J10pKXsgLy8gY29udmVydCBmcm9tIG9sZCBmb3JtYXRcblx0XHRpZighdmFsaWQodG1wKSl7XG5cdFx0XHRpZighKHNvdWwgPSAoKHRtcHx8JycpLl98fCcnKVsnIyddKSl7IGNvbnNvbGUubG9nKFwiY2hhaW4gbm90IHlldCBzdXBwb3J0ZWQgZm9yXCIsIHRtcCwgJy4uLicsIG1zZywgY2F0KTsgcmV0dXJuOyB9XG5cdFx0XHRndW4gPSBjYXQucm9vdC4kLmdldChzb3VsKTtcblx0XHRcdHJldHVybiBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXModG1wKS5zb3J0KCksIGZ1bmN0aW9uKGspeyAvLyBUT0RPOiAua2V5cyggaXMgc2xvdyAvLyBCVUc/ID9Tb21lIHJlLWluIGxvZ2ljIG1heSBkZXBlbmQgb24gdGhpcyBiZWluZyBzeW5jP1xuXHRcdFx0XHRpZignXycgPT0gayB8fCB1ID09PSAoc3RhdGUgPSBzdGF0ZV9pcyh0bXAsIGspKSl7IHJldHVybiB9XG5cdFx0XHRcdGNhdC5vbignaW4nLCB7JDogZ3VuLCBwdXQ6IHsnIyc6IHNvdWwsICcuJzogaywgJz0nOiB0bXBba10sICc+Jzogc3RhdGV9LCBWSUE6IG1zZ30pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNhdC5vbignaW4nLCB7JDogYXQuYmFjay4kLCBwdXQ6IHsnIyc6IHNvdWwgPSBhdC5iYWNrLnNvdWwsICcuJzoga2V5ID0gYXQuaGFzIHx8IGF0LmdldCwgJz0nOiB0bXAsICc+Jzogc3RhdGVfaXMoYXQuYmFjay5wdXQsIGtleSl9LCB2aWE6IG1zZ30pOyAvLyBUT0RPOiBUaGlzIGNvdWxkIGJlIGJ1Z2d5ISBJdCBhc3N1bWVzL2FwcHJveGVzIGRhdGEsIG90aGVyIHN0dWZmIGNvdWxkIGhhdmUgY29ycnVwdGVkIGl0LlxuXHRcdHJldHVybjtcblx0fVxuXHRpZigobXNnLnNlZW58fCcnKVtjYXQuaWRdKXsgcmV0dXJuIH0gKG1zZy5zZWVuIHx8IChtc2cuc2VlbiA9IGZ1bmN0aW9uKCl7fSkpW2NhdC5pZF0gPSBjYXQ7IC8vIGhlbHAgc3RvcCBzb21lIGluZmluaXRlIGxvb3BzXG5cblx0aWYoY2F0ICE9PSBhdCl7IC8vIGRvbid0IHdvcnJ5IGFib3V0IHRoaXMgd2hlbiBmaXJzdCB1bmRlcnN0YW5kaW5nIHRoZSBjb2RlLCBpdCBoYW5kbGVzIGNoYW5naW5nIGNvbnRleHRzIG9uIGEgbWVzc2FnZS4gQSBzb3VsIGNoYWluIHdpbGwgbmV2ZXIgaGF2ZSBhIGRpZmZlcmVudCBjb250ZXh0LlxuXHRcdE9iamVjdC5rZXlzKG1zZykuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnW2tdIH0sIHRtcCA9IHt9KTsgLy8gbWFrZSBjb3B5IG9mIG1lc3NhZ2Vcblx0XHR0bXAuZ2V0ID0gY2F0LmdldCB8fCB0bXAuZ2V0O1xuXHRcdGlmKCFjYXQuc291bCAmJiAhY2F0Lmhhcyl7IC8vIGlmIHdlIGRvIG5vdCByZWNvZ25pemUgdGhlIGNoYWluIHR5cGVcblx0XHRcdHRtcC4kJCQgPSB0bXAuJCQkIHx8IGNhdC4kOyAvLyBtYWtlIGEgcmVmZXJlbmNlIHRvIHdoZXJldmVyIGl0IGNhbWUgZnJvbS5cblx0XHR9IGVsc2Vcblx0XHRpZihhdC5zb3VsKXsgLy8gYSBoYXMgKHByb3BlcnR5KSBjaGFpbiB3aWxsIGhhdmUgYSBkaWZmZXJlbnQgY29udGV4dCBzb21ldGltZXMgaWYgaXQgaXMgbGlua2VkICh0byBhIHNvdWwgY2hhaW4pLiBBbnl0aGluZyB0aGF0IGlzIG5vdCBhIHNvdWwgb3IgaGFzIGNoYWluLCB3aWxsIGFsd2F5cyBoYXZlIGRpZmZlcmVudCBjb250ZXh0cy5cblx0XHRcdHRtcC4kID0gY2F0LiQ7XG5cdFx0XHR0bXAuJCQgPSB0bXAuJCQgfHwgYXQuJDtcblx0XHR9XG5cdFx0bXNnID0gdG1wOyAvLyB1c2UgdGhlIG1lc3NhZ2Ugd2l0aCB0aGUgbmV3IGNvbnRleHQgaW5zdGVhZDtcblx0fVxuXHR1bmxpbmsobXNnLCBjYXQpO1xuXG5cdGlmKCgoY2F0LnNvdWwvKiAmJiAoY2F0LmFza3x8JycpWycnXSovKSB8fCBtc2cuJCQpICYmIHN0YXRlID49IHN0YXRlX2lzKHJvb3QuZ3JhcGhbc291bF0sIGtleSkpeyAvLyBUaGUgcm9vdCBoYXMgYW4gaW4tbWVtb3J5IGNhY2hlIG9mIHRoZSBncmFwaCwgYnV0IGlmIG91ciBwZWVyIGhhcyBhc2tlZCBmb3IgdGhlIGRhdGEgdGhlbiB3ZSB3YW50IGEgcGVyIGRlZHVwbGljYXRlZCBjaGFpbiBjb3B5IG9mIHRoZSBkYXRhIHRoYXQgbWlnaHQgaGF2ZSBsb2NhbCBlZGl0cyBvbiBpdC5cblx0XHQodG1wID0gcm9vdC4kLmdldChzb3VsKS5fKS5wdXQgPSBzdGF0ZV9pZnkodG1wLnB1dCwga2V5LCBzdGF0ZSwgY2hhbmdlLCBzb3VsKTtcblx0fVxuXHRpZighYXQuc291bCAvKiYmIChhdC5hc2t8fCcnKVsnJ10qLyAmJiBzdGF0ZSA+PSBzdGF0ZV9pcyhyb290LmdyYXBoW3NvdWxdLCBrZXkpICYmIChzYXQgPSAocm9vdC4kLmdldChzb3VsKS5fLm5leHR8fCcnKVtrZXldKSl7IC8vIFNhbWUgYXMgYWJvdmUgaGVyZSwgYnV0IGZvciBvdGhlciB0eXBlcyBvZiBjaGFpbnMuIC8vIFRPRE86IEltcHJvdmUgcGVyZiBieSBwcmV2ZW50aW5nIGVjaG9lcyByZWNhY2hpbmcuXG5cdFx0c2F0LnB1dCA9IGNoYW5nZTsgLy8gdXBkYXRlIGNhY2hlXG5cdFx0aWYoJ3N0cmluZycgPT0gdHlwZW9mICh0bXAgPSB2YWxpZChjaGFuZ2UpKSl7XG5cdFx0XHRzYXQucHV0ID0gcm9vdC4kLmdldCh0bXApLl8ucHV0IHx8IGNoYW5nZTsgLy8gc2hhcmUgc2FtZSBjYWNoZSBhcyB3aGF0IHdlJ3JlIGxpbmtlZCB0by5cblx0XHR9XG5cdH1cblxuXHR0aGlzLnRvICYmIHRoaXMudG8ubmV4dChtc2cpOyAvLyAxc3QgQVBJIGpvYiBpcyB0byBjYWxsIGFsbCBjaGFpbiBsaXN0ZW5lcnMuXG5cdC8vIFRPRE86IE1ha2UgaW5wdXQgbW9yZSByZXVzYWJsZSBieSBvbmx5IGRvaW5nIHRoZXNlIChzb21lPykgY2FsbHMgaWYgd2UgYXJlIGEgY2hhaW4gd2UgcmVjb2duaXplPyBUaGlzIG1lYW5zIGVhY2ggaW5wdXQgbGlzdGVuZXIgd291bGQgYmUgcmVzcG9uc2libGUgZm9yIHdoZW4gbGlzdGVuZXJzIG5lZWQgdG8gYmUgY2FsbGVkLCB3aGljaCBtYWtlcyBzZW5zZSwgYXMgdGhleSBtaWdodCB3YW50IHRvIGZpbHRlci5cblx0Y2F0LmFueSAmJiBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMoY2F0LmFueSksIGZ1bmN0aW9uKGFueSl7IChhbnkgPSBjYXQuYW55W2FueV0pICYmIGFueShtc2cpIH0sMCw5OSk7IC8vIDFzdCBBUEkgam9iIGlzIHRvIGNhbGwgYWxsIGNoYWluIGxpc3RlbmVycy4gLy8gVE9ETzogLmtleXMoIGlzIHNsb3cgLy8gQlVHOiBTb21lIHJlLWluIGxvZ2ljIG1heSBkZXBlbmQgb24gdGhpcyBiZWluZyBzeW5jLlxuXHRjYXQuZWNobyAmJiBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMoY2F0LmVjaG8pLCBmdW5jdGlvbihsYXQpeyAobGF0ID0gY2F0LmVjaG9bbGF0XSkgJiYgbGF0Lm9uKCdpbicsIG1zZykgfSwwLDk5KTsgLy8gJiBsaW5rZWQgYXQgY2hhaW5zIC8vIFRPRE86IC5rZXlzKCBpcyBzbG93IC8vIEJVRzogU29tZSByZS1pbiBsb2dpYyBtYXkgZGVwZW5kIG9uIHRoaXMgYmVpbmcgc3luYy5cblxuXHRpZigoKG1zZy4kJHx8JycpLl98fGF0KS5zb3VsKXsgLy8gY29tbWVudHMgYXJlIGxpbmVhciwgYnV0IHRoaXMgbGluZSBvZiBjb2RlIGlzIG5vbi1saW5lYXIsIHNvIGlmIEkgd2VyZSB0byBjb21tZW50IHdoYXQgaXQgZG9lcywgeW91J2QgaGF2ZSB0byByZWFkIDQyIG90aGVyIGNvbW1lbnRzIGZpcnN0Li4uIGJ1dCB5b3UgY2FuJ3QgcmVhZCBhbnkgb2YgdGhvc2UgY29tbWVudHMgdW50aWwgeW91IGZpcnN0IHJlYWQgdGhpcyBjb21tZW50LiBXaGF0IT8gLy8gc2hvdWxkbid0IHRoaXMgbWF0Y2ggbGluaydzIGNoZWNrP1xuXHRcdC8vIGlzIHRoZXJlIGNhc2VzIHdoZXJlIGl0IGlzIGEgJCQgdGhhdCB3ZSBkbyBOT1Qgd2FudCB0byBkbyB0aGUgZm9sbG93aW5nPyBcblx0XHRpZigoc2F0ID0gY2F0Lm5leHQpICYmIChzYXQgPSBzYXRba2V5XSkpeyAvLyBUT0RPOiBwb3NzaWJsZSB0cmljaz8gTWF5YmUgaGF2ZSBgaW9ubWFwYCBjb2RlIHNldCBhIHNhdD8gLy8gVE9ETzogTWF5YmUgd2Ugc2hvdWxkIGRvIGBjYXQuYXNrYCBpbnN0ZWFkPyBJIGd1ZXNzIGRvZXMgbm90IG1hdHRlci5cblx0XHRcdHRtcCA9IHt9OyBPYmplY3Qua2V5cyhtc2cpLmZvckVhY2goZnVuY3Rpb24oayl7IHRtcFtrXSA9IG1zZ1trXSB9KTtcblx0XHRcdHRtcC4kID0gKG1zZy4kJHx8bXNnLiQpLmdldCh0bXAuZ2V0ID0ga2V5KTsgZGVsZXRlIHRtcC4kJDsgZGVsZXRlIHRtcC4kJCQ7XG5cdFx0XHRzYXQub24oJ2luJywgdG1wKTtcblx0XHR9XG5cdH1cblxuXHRsaW5rKG1zZywgY2F0KTtcbn07IEd1bi5vbi5pbiA9IGlucHV0O1xuXG5mdW5jdGlvbiBsaW5rKG1zZywgY2F0KXsgY2F0ID0gY2F0IHx8IHRoaXMuYXMgfHwgbXNnLiQuXztcblx0aWYobXNnLiQkICYmIHRoaXMgIT09IEd1bi5vbil7IHJldHVybiB9IC8vICQkIG1lYW5zIHdlIGNhbWUgZnJvbSBhIGxpbmssIHNvIHdlIGFyZSBhdCB0aGUgd3JvbmcgbGV2ZWwsIHRodXMgaWdub3JlIGl0IHVubGVzcyBvdmVycnVsZWQgbWFudWFsbHkgYnkgYmVpbmcgY2FsbGVkIGRpcmVjdGx5LlxuXHRpZighbXNnLnB1dCB8fCBjYXQuc291bCl7IHJldHVybiB9IC8vIEJ1dCB5b3UgY2Fubm90IG92ZXJydWxlIGJlaW5nIGxpbmtlZCB0byBub3RoaW5nLCBvciB0cnlpbmcgdG8gbGluayBhIHNvdWwgY2hhaW4gLSB0aGF0IG11c3QgbmV2ZXIgaGFwcGVuLlxuXHR2YXIgcHV0ID0gbXNnLnB1dHx8JycsIGxpbmsgPSBwdXRbJz0nXXx8cHV0Wyc6J10sIHRtcDtcblx0dmFyIHJvb3QgPSBjYXQucm9vdCwgdGF0ID0gcm9vdC4kLmdldChwdXRbJyMnXSkuZ2V0KHB1dFsnLiddKS5fO1xuXHRpZignc3RyaW5nJyAhPSB0eXBlb2YgKGxpbmsgPSB2YWxpZChsaW5rKSkpe1xuXHRcdGlmKHRoaXMgPT09IEd1bi5vbil7ICh0YXQuZWNobyB8fCAodGF0LmVjaG8gPSB7fSkpW2NhdC5pZF0gPSBjYXQgfSAvLyBhbGxvdyBzb21lIGNoYWluIHRvIGV4cGxpY2l0bHkgZm9yY2UgbGlua2luZyB0byBzaW1wbGUgZGF0YS5cblx0XHRyZXR1cm47IC8vIGJ5IGRlZmF1bHQgZG8gbm90IGxpbmsgdG8gZGF0YSB0aGF0IGlzIG5vdCBhIGxpbmsuXG5cdH1cblx0aWYoKHRhdC5lY2hvIHx8ICh0YXQuZWNobyA9IHt9KSlbY2F0LmlkXSAvLyB3ZSd2ZSBhbHJlYWR5IGxpbmtlZCBvdXJzZWx2ZXMgc28gd2UgZG8gbm90IG5lZWQgdG8gZG8gaXQgYWdhaW4uIEV4Y2VwdC4uLiAoYW5ub3lpbmcgaW1wbGVtZW50YXRpb24gZGV0YWlscylcblx0XHQmJiAhKHJvb3QucGFzc3x8JycpW2NhdC5pZF0peyByZXR1cm4gfSAvLyBpZiBhIG5ldyBldmVudCBsaXN0ZW5lciB3YXMgYWRkZWQsIHdlIG5lZWQgdG8gbWFrZSBhIHBhc3MgdGhyb3VnaCBmb3IgaXQuIFRoZSBwYXNzIHdpbGwgYmUgb24gdGhlIGNoYWluLCBub3QgYWx3YXlzIHRoZSBjaGFpbiBwYXNzZWQgZG93bi4gXG5cdGlmKHRtcCA9IHJvb3QucGFzcyl7IGlmKHRtcFtsaW5rK2NhdC5pZF0peyByZXR1cm4gfSB0bXBbbGluaytjYXQuaWRdID0gMSB9IC8vIEJ1dCB0aGUgYWJvdmUgZWRnZSBjYXNlIG1heSBcInBhc3MgdGhyb3VnaFwiIG9uIGEgY2lyY3VsYXIgZ3JhcGggY2F1c2luZyBpbmZpbml0ZSBwYXNzZXMsIHNvIHdlIGhhY2tpbHkgYWRkIGEgdGVtcG9yYXJ5IGNoZWNrIGZvciB0aGF0LlxuXG5cdCh0YXQuZWNob3x8KHRhdC5lY2hvPXt9KSlbY2F0LmlkXSA9IGNhdDsgLy8gc2V0IG91cnNlbGYgdXAgZm9yIHRoZSBlY2hvISAvLyBUT0RPOiBCVUc/IEVjaG8gdG8gc2VsZiBubyBsb25nZXIgY2F1c2VzIHByb2JsZW1zPyBDb25maXJtLlxuXG5cdGlmKGNhdC5oYXMpeyBjYXQubGluayA9IGxpbmsgfVxuXHR2YXIgc2F0ID0gcm9vdC4kLmdldCh0YXQubGluayA9IGxpbmspLl87IC8vIGdyYWIgd2hhdCB3ZSdyZSBsaW5raW5nIHRvLlxuXHQoc2F0LmVjaG8gfHwgKHNhdC5lY2hvID0ge30pKVt0YXQuaWRdID0gdGF0OyAvLyBsaW5rIGl0LlxuXHR2YXIgdG1wID0gY2F0LmFza3x8Jyc7IC8vIGFzayB0aGUgY2hhaW4gZm9yIHdoYXQgbmVlZHMgdG8gYmUgbG9hZGVkIG5leHQhXG5cdGlmKHRtcFsnJ10gfHwgY2F0LmxleCl7IC8vIHdlIG1pZ2h0IG5lZWQgdG8gbG9hZCB0aGUgd2hvbGUgdGhpbmcgLy8gVE9ETzogY2F0LmxleCBwcm9iYWJseSBoYXMgZWRnZSBjYXNlIGJ1Z3MgdG8gaXQsIG5lZWQgbW9yZSB0ZXN0IGNvdmVyYWdlLlxuXHRcdHNhdC5vbignb3V0Jywge2dldDogeycjJzogbGlua319KTtcblx0fVxuXHRzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXModG1wKSwgZnVuY3Rpb24oZ2V0LCBzYXQpeyAvLyBpZiBzdWIgY2hhaW5zIGFyZSBhc2tpbmcgZm9yIGRhdGEuIC8vIFRPRE86IC5rZXlzKCBpcyBzbG93IC8vIEJVRz8gP1NvbWUgcmUtaW4gbG9naWMgbWF5IGRlcGVuZCBvbiB0aGlzIGJlaW5nIHN5bmM/XG5cdFx0aWYoIWdldCB8fCAhKHNhdCA9IHRtcFtnZXRdKSl7IHJldHVybiB9XG5cdFx0c2F0Lm9uKCdvdXQnLCB7Z2V0OiB7JyMnOiBsaW5rLCAnLic6IGdldH19KTsgLy8gZ28gZ2V0IGl0LlxuXHR9LDAsOTkpO1xufTsgR3VuLm9uLmxpbmsgPSBsaW5rO1xuXG5mdW5jdGlvbiB1bmxpbmsobXNnLCBjYXQpeyAvLyB1Z2gsIHNvIG11Y2ggY29kZSBmb3Igc2VlbWluZ2x5IGVkZ2UgY2FzZSBiZWhhdmlvci5cblx0dmFyIHB1dCA9IG1zZy5wdXR8fCcnLCBjaGFuZ2UgPSAodSAhPT0gcHV0Wyc9J10pPyBwdXRbJz0nXSA6IHB1dFsnOiddLCByb290ID0gY2F0LnJvb3QsIGxpbmssIHRtcDtcblx0aWYodSA9PT0gY2hhbmdlKXsgLy8gMXN0IGVkZ2UgY2FzZTogSWYgd2UgaGF2ZSBhIGJyYW5kIG5ldyBkYXRhYmFzZSwgbm8gZGF0YSB3aWxsIGJlIGZvdW5kLlxuXHRcdC8vIFRPRE86IEJVRyEgYmVjYXVzZSBlbXB0eWluZyBjYWNoZSBjb3VsZCBiZSBhc3luYyBmcm9tIGJlbG93LCBtYWtlIHN1cmUgd2UgYXJlIG5vdCBlbXB0eWluZyBhIG5ld2VyIGNhY2hlLiBTbyBtYXliZSBwYXNzIGFuIEFzeW5jIElEIHRvIGNoZWNrIGFnYWluc3Q/XG5cdFx0Ly8gVE9ETzogQlVHISBXaGF0IGlmIHRoaXMgaXMgYSBtYXA/IC8vIFdhcm5pbmchIENsZWFyaW5nIHRoaW5ncyBvdXQgbmVlZHMgdG8gYmUgcm9idXN0IGFnYWluc3Qgc3luYy9hc3luYyBvcHMsIG9yIGVsc2UgeW91J2xsIHNlZSBgbWFwIHZhbCBnZXQgcHV0YCB0ZXN0IGNhdGFzdHJvcGhpY2FsbHkgZmFpbCBiZWNhdXNlIG1hcCBhdHRlbXB0cyB0byBsaW5rIHdoZW4gcGFyZW50IGdyYXBoIGlzIHN0cmVhbWVkIGJlZm9yZSBjaGlsZCB2YWx1ZSBnZXRzIHNldC4gTmVlZCB0byBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbGFjayBhY2tzIGFuZCBmb3JjZSBjbGVhcmluZy5cblx0XHRpZihjYXQuc291bCAmJiB1ICE9PSBjYXQucHV0KXsgcmV0dXJuIH0gLy8gZGF0YSBtYXkgbm90IGJlIGZvdW5kIG9uIGEgc291bCwgYnV0IGlmIGEgc291bCBhbHJlYWR5IGhhcyBkYXRhLCB0aGVuIG5vdGhpbmcgY2FuIGNsZWFyIHRoZSBzb3VsIGFzIGEgd2hvbGUuXG5cdFx0Ly9pZighY2F0Lmhhcyl7IHJldHVybiB9XG5cdFx0dG1wID0gKG1zZy4kJHx8bXNnLiR8fCcnKS5ffHwnJztcblx0XHRpZihtc2dbJ0AnXSAmJiAodSAhPT0gdG1wLnB1dCB8fCB1ICE9PSBjYXQucHV0KSl7IHJldHVybiB9IC8vIGEgXCJub3QgZm91bmRcIiBmcm9tIG90aGVyIHBlZXJzIHNob3VsZCBub3QgY2xlYXIgb3V0IGRhdGEgaWYgd2UgaGF2ZSBhbHJlYWR5IGZvdW5kIGl0LlxuXHRcdC8vaWYoY2F0LmhhcyAmJiB1ID09PSBjYXQucHV0ICYmICEocm9vdC5wYXNzfHwnJylbY2F0LmlkXSl7IHJldHVybiB9IC8vIGlmIHdlIGFyZSBhbHJlYWR5IHVubGlua2VkLCBkbyBub3QgY2FsbCBhZ2FpbiwgdW5sZXNzIGVkZ2UgY2FzZS4gLy8gVE9ETzogQlVHISBUaGlzIGxpbmUgc2hvdWxkIGJlIGRlbGV0ZWQgZm9yIFwidW5saW5rIGRlZXBseSBuZXN0ZWRcIi5cblx0XHRpZihsaW5rID0gY2F0LmxpbmsgfHwgbXNnLmxpbmtlZCl7XG5cdFx0XHRkZWxldGUgKHJvb3QuJC5nZXQobGluaykuXy5lY2hvfHwnJylbY2F0LmlkXTtcblx0XHR9XG5cdFx0aWYoY2F0Lmhhcyl7IC8vIFRPRE86IEVtcHR5IG91dCBsaW5rcywgbWFwcywgZWNob3MsIGFja3MvYXNrcywgZXRjLj9cblx0XHRcdGNhdC5saW5rID0gbnVsbDtcblx0XHR9XG5cdFx0Y2F0LnB1dCA9IHU7IC8vIGVtcHR5IG91dCB0aGUgY2FjaGUgaWYsIGZvciBleGFtcGxlLCBhbGljZSdzIGNhcidzIGNvbG9yIG5vIGxvbmdlciBleGlzdHMgKHJlbGF0aXZlIHRvIGFsaWNlKSBpZiBhbGljZSBubyBsb25nZXIgaGFzIGEgY2FyLlxuXHRcdC8vIFRPRE86IEJVRyEgRm9yIG1hcHMsIHByb3h5IHRoaXMgc28gdGhlIGluZGl2aWR1YWwgc3ViIGlzIHRyaWdnZXJlZCwgbm90IGFsbCBzdWJzLlxuXHRcdHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhjYXQubmV4dHx8JycpLCBmdW5jdGlvbihnZXQsIHNhdCl7IC8vIGVtcHR5IG91dCBhbGwgc3ViIGNoYWlucy4gLy8gVE9ETzogLmtleXMoIGlzIHNsb3cgLy8gQlVHPyA/U29tZSByZS1pbiBsb2dpYyBtYXkgZGVwZW5kIG9uIHRoaXMgYmVpbmcgc3luYz8gLy8gVE9ETzogQlVHPyBUaGlzIHdpbGwgdHJpZ2dlciBkZWVwZXIgcHV0IGZpcnN0LCBkb2VzIHB1dCBsb2dpYyBkZXBlbmQgb24gbmVzdGVkIG9yZGVyPyAvLyBUT0RPOiBCVUchIEZvciBtYXAsIHRoaXMgbmVlZHMgdG8gYmUgdGhlIGlzb2xhdGVkIGNoaWxkLCBub3QgYWxsIG9mIHRoZW0uXG5cdFx0XHRpZighKHNhdCA9IGNhdC5uZXh0W2dldF0pKXsgcmV0dXJuIH1cblx0XHRcdC8vaWYoY2F0LmhhcyAmJiB1ID09PSBzYXQucHV0ICYmICEocm9vdC5wYXNzfHwnJylbc2F0LmlkXSl7IHJldHVybiB9IC8vIGlmIHdlIGFyZSBhbHJlYWR5IHVubGlua2VkLCBkbyBub3QgY2FsbCBhZ2FpbiwgdW5sZXNzIGVkZ2UgY2FzZS4gLy8gVE9ETzogQlVHISBUaGlzIGxpbmUgc2hvdWxkIGJlIGRlbGV0ZWQgZm9yIFwidW5saW5rIGRlZXBseSBuZXN0ZWRcIi5cblx0XHRcdGlmKGxpbmspeyBkZWxldGUgKHJvb3QuJC5nZXQobGluaykuZ2V0KGdldCkuXy5lY2hvfHwnJylbc2F0LmlkXSB9XG5cdFx0XHRzYXQub24oJ2luJywge2dldDogZ2V0LCBwdXQ6IHUsICQ6IHNhdC4kfSk7IC8vIFRPRE86IEJVRz8gQWRkIHJlY3Vyc2l2ZSBzZWVuIGNoZWNrP1xuXHRcdH0sMCw5OSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGlmKGNhdC5zb3VsKXsgcmV0dXJuIH0gLy8gYSBzb3VsIGNhbm5vdCB1bmxpbmsgaXRzZWxmLlxuXHRpZihtc2cuJCQpeyByZXR1cm4gfSAvLyBhIGxpbmtlZCBjaGFpbiBkb2VzIG5vdCBkbyB0aGUgdW5saW5raW5nLCB0aGUgc3ViIGNoYWluIGRvZXMuIC8vIFRPRE86IEJVRz8gV2lsbCB0aGlzIGNhbmNlbCBtYXBzP1xuXHRsaW5rID0gdmFsaWQoY2hhbmdlKTsgLy8gbmVlZCB0byB1bmxpbmsgYW55dGltZSB3ZSBhcmUgbm90IHRoZSBzYW1lIGxpbmssIHRob3VnaCBvbmx5IGRvIHRoaXMgb25jZSBwZXIgdW5saW5rIChhbmQgbm90IG9uIGluaXQpLlxuXHR0bXAgPSBtc2cuJC5ffHwnJztcblx0aWYobGluayA9PT0gdG1wLmxpbmsgfHwgKGNhdC5oYXMgJiYgIXRtcC5saW5rKSl7XG5cdFx0aWYoKHJvb3QucGFzc3x8JycpW2NhdC5pZF0gJiYgJ3N0cmluZycgIT09IHR5cGVvZiBsaW5rKXtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cdGRlbGV0ZSAodG1wLmVjaG98fCcnKVtjYXQuaWRdO1xuXHR1bmxpbmsoe2dldDogY2F0LmdldCwgcHV0OiB1LCAkOiBtc2cuJCwgbGlua2VkOiBtc2cubGlua2VkID0gbXNnLmxpbmtlZCB8fCB0bXAubGlua30sIGNhdCk7IC8vIHVubGluayBvdXIgc3ViIGNoYWlucy5cbn07IEd1bi5vbi51bmxpbmsgPSB1bmxpbms7XG5cbmZ1bmN0aW9uIGFjayhtc2csIGV2KXtcblx0Ly9pZighbXNnWyclJ10gJiYgKHRoaXN8fCcnKS5vZmYpeyB0aGlzLm9mZigpIH0gLy8gZG8gTk9UIG1lbW9yeSBsZWFrLCB0dXJuIG9mZiBsaXN0ZW5lcnMhIE5vdyBoYW5kbGVkIGJ5IC5hc2sgaXRzZWxmXG5cdC8vIG1hbmhhdHRhbjpcblx0dmFyIGFzID0gdGhpcy5hcywgYXQgPSBhcy4kLl8sIHJvb3QgPSBhdC5yb290LCBnZXQgPSBhcy5nZXR8fCcnLCB0bXAgPSAobXNnLnB1dHx8JycpW2dldFsnIyddXXx8Jyc7XG5cdGlmKCFtc2cucHV0IHx8ICgnc3RyaW5nJyA9PSB0eXBlb2YgZ2V0WycuJ10gJiYgdSA9PT0gdG1wW2dldFsnLiddXSkpe1xuXHRcdGlmKHUgIT09IGF0LnB1dCl7IHJldHVybiB9XG5cdFx0aWYoIWF0LnNvdWwgJiYgIWF0Lmhhcyl7IHJldHVybiB9IC8vIFRPRE86IEJVRz8gRm9yIG5vdywgb25seSBjb3JlLWNoYWlucyB3aWxsIGhhbmRsZSBub3QtZm91bmRzLCBiZWNhdXNlIGJ1Z3MgY3JlZXAgaW4gaWYgbm9uLWNvcmUgY2hhaW5zIGFyZSB1c2VkIGFzICQgYnV0IHdlIGNhbiByZXZpc2l0IHRoaXMgbGF0ZXIgZm9yIG1vcmUgcG93ZXJmdWwgZXh0ZW5zaW9ucy5cblx0XHRhdC5hY2sgPSAoYXQuYWNrIHx8IDApICsgMTtcblx0XHRhdC5vbignaW4nLCB7XG5cdFx0XHRnZXQ6IGF0LmdldCxcblx0XHRcdHB1dDogYXQucHV0ID0gdSxcblx0XHRcdCQ6IGF0LiQsXG5cdFx0XHQnQCc6IG1zZ1snQCddXG5cdFx0fSk7XG5cdFx0LyoodG1wID0gYXQuUSkgJiYgc2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKHRtcCksIGZ1bmN0aW9uKGlkKXsgLy8gVE9ETzogVGVtcG9yYXJ5IHRlc3RpbmcsIG5vdCBpbnRlZ3JhdGVkIG9yIGJlaW5nIHVzZWQsIHByb2JhYmx5IGRlbGV0ZS5cblx0XHRcdE9iamVjdC5rZXlzKG1zZykuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnW2tdIH0sIHRtcCA9IHt9KTsgdG1wWydAJ10gPSBpZDsgLy8gY29weSBtZXNzYWdlXG5cdFx0XHRyb290Lm9uKCdpbicsIHRtcCk7XG5cdFx0fSk7IGRlbGV0ZSBhdC5ROyovXG5cdFx0cmV0dXJuO1xuXHR9XG5cdChtc2cuX3x8e30pLm1pc3MgPSAxO1xuXHRHdW4ub24ucHV0KG1zZyk7XG5cdHJldHVybjsgLy8gZW9tXG59XG5cbnZhciBlbXB0eSA9IHt9LCB1LCB0ZXh0X3JhbmQgPSBTdHJpbmcucmFuZG9tLCB2YWxpZCA9IEd1bi52YWxpZCwgb2JqX2hhcyA9IGZ1bmN0aW9uKG8sIGspeyByZXR1cm4gbyAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgaykgfSwgc3RhdGUgPSBHdW4uc3RhdGUsIHN0YXRlX2lzID0gc3RhdGUuaXMsIHN0YXRlX2lmeSA9IHN0YXRlLmlmeTtcblx0IiwiXG5yZXF1aXJlKCcuL3NoaW0nKTtcbmZ1bmN0aW9uIER1cChvcHQpe1xuXHR2YXIgZHVwID0ge3M6e319LCBzID0gZHVwLnM7XG5cdG9wdCA9IG9wdCB8fCB7bWF4OiA5OTksIGFnZTogMTAwMCAqIDl9Oy8vKi8gMTAwMCAqIDkgKiAzfTtcblx0ZHVwLmNoZWNrID0gZnVuY3Rpb24oaWQpe1xuXHRcdGlmKCFzW2lkXSl7IHJldHVybiBmYWxzZSB9XG5cdFx0cmV0dXJuIGR0KGlkKTtcblx0fVxuXHR2YXIgZHQgPSBkdXAudHJhY2sgPSBmdW5jdGlvbihpZCl7XG5cdFx0dmFyIGl0ID0gc1tpZF0gfHwgKHNbaWRdID0ge30pO1xuXHRcdGl0LndhcyA9IGR1cC5ub3cgPSArbmV3IERhdGU7XG5cdFx0aWYoIWR1cC50byl7IGR1cC50byA9IHNldFRpbWVvdXQoZHVwLmRyb3AsIG9wdC5hZ2UgKyA5KSB9XG5cdFx0cmV0dXJuIGl0O1xuXHR9XG5cdGR1cC5kcm9wID0gZnVuY3Rpb24oYWdlKXtcblx0XHRkdXAudG8gPSBudWxsO1xuXHRcdGR1cC5ub3cgPSArbmV3IERhdGU7XG5cdFx0dmFyIGwgPSBPYmplY3Qua2V5cyhzKTtcblx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKGR1cC5ub3csICtuZXcgRGF0ZSAtIGR1cC5ub3csICdkdXAgZHJvcCBrZXlzJyk7IC8vIHByZXYgfjIwJSBDUFUgNyUgUkFNIDMwME1CIC8vIG5vdyB+MjUlIENQVSA3JSBSQU0gNTAwTUJcblx0XHRzZXRUaW1lb3V0LmVhY2gobCwgZnVuY3Rpb24oaWQpeyB2YXIgaXQgPSBzW2lkXTsgLy8gVE9ETzogLmtleXMoIGlzIHNsb3c/XG5cdFx0XHRpZihpdCAmJiAoYWdlIHx8IG9wdC5hZ2UpID4gKGR1cC5ub3cgLSBpdC53YXMpKXsgcmV0dXJuIH1cblx0XHRcdGRlbGV0ZSBzW2lkXTtcblx0XHR9LDAsOTkpO1xuXHR9XG5cdHJldHVybiBkdXA7XG59XG5tb2R1bGUuZXhwb3J0cyA9IER1cDtcblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9yb290Jyk7XG5HdW4uY2hhaW4uZ2V0ID0gZnVuY3Rpb24oa2V5LCBjYiwgYXMpe1xuXHR2YXIgZ3VuLCB0bXA7XG5cdGlmKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKXtcblx0XHRpZihrZXkubGVuZ3RoID09IDApIHtcdFxuXHRcdFx0KGd1biA9IHRoaXMuY2hhaW4oKSkuXy5lcnIgPSB7ZXJyOiBHdW4ubG9nKCcwIGxlbmd0aCBrZXkhJywga2V5KX07XG5cdFx0XHRpZihjYil7IGNiLmNhbGwoZ3VuLCBndW4uXy5lcnIpIH1cblx0XHRcdHJldHVybiBndW47XG5cdFx0fVxuXHRcdHZhciBiYWNrID0gdGhpcywgY2F0ID0gYmFjay5fO1xuXHRcdHZhciBuZXh0ID0gY2F0Lm5leHQgfHwgZW1wdHk7XG5cdFx0aWYoIShndW4gPSBuZXh0W2tleV0pKXtcblx0XHRcdGd1biA9IGtleSAmJiBjYWNoZShrZXksIGJhY2spO1xuXHRcdH1cblx0XHRndW4gPSBndW4gJiYgZ3VuLiQ7XG5cdH0gZWxzZVxuXHRpZignZnVuY3Rpb24nID09IHR5cGVvZiBrZXkpe1xuXHRcdGlmKHRydWUgPT09IGNiKXsgcmV0dXJuIHNvdWwodGhpcywga2V5LCBjYiwgYXMpLCB0aGlzIH1cblx0XHRndW4gPSB0aGlzO1xuXHRcdHZhciBjYXQgPSBndW4uXywgb3B0ID0gY2IgfHwge30sIHJvb3QgPSBjYXQucm9vdCwgaWQ7XG5cdFx0b3B0LmF0ID0gY2F0O1xuXHRcdG9wdC5vayA9IGtleTtcblx0XHR2YXIgd2FpdCA9IHt9OyAvLyBjYW4gd2UgYXNzaWduIHRoaXMgdG8gdGhlIGF0IGluc3RlYWQsIGxpa2UgaW4gb25jZT9cblx0XHQvL3ZhciBwYXRoID0gW107IGNhdC4kLmJhY2soYXQgPT4geyBhdC5nZXQgJiYgcGF0aC5wdXNoKGF0LmdldC5zbGljZSgwLDkpKX0pOyBwYXRoID0gcGF0aC5yZXZlcnNlKCkuam9pbignLicpO1xuXHRcdGZ1bmN0aW9uIGFueShtc2csIGV2ZSwgZil7XG5cdFx0XHRpZihhbnkuc3R1bil7IHJldHVybiB9XG5cdFx0XHRpZigodG1wID0gcm9vdC5wYXNzKSAmJiAhdG1wW2lkXSl7IHJldHVybiB9XG5cdFx0XHR2YXIgYXQgPSBtc2cuJC5fLCBzYXQgPSAobXNnLiQkfHwnJykuXywgZGF0YSA9IChzYXR8fGF0KS5wdXQsIG9kZCA9ICghYXQuaGFzICYmICFhdC5zb3VsKSwgdGVzdCA9IHt9LCBsaW5rLCB0bXA7XG5cdFx0XHRpZihvZGQgfHwgdSA9PT0gZGF0YSl7IC8vIGhhbmRsZXMgbm9uLWNvcmVcblx0XHRcdFx0ZGF0YSA9ICh1ID09PSAoKHRtcCA9IG1zZy5wdXQpfHwnJylbJz0nXSk/ICh1ID09PSAodG1wfHwnJylbJzonXSk/IHRtcCA6IHRtcFsnOiddIDogdG1wWyc9J107XG5cdFx0XHR9XG5cdFx0XHRpZihsaW5rID0gKCdzdHJpbmcnID09IHR5cGVvZiAodG1wID0gR3VuLnZhbGlkKGRhdGEpKSkpe1xuXHRcdFx0XHRkYXRhID0gKHUgPT09ICh0bXAgPSByb290LiQuZ2V0KHRtcCkuXy5wdXQpKT8gb3B0Lm5vdD8gdSA6IGRhdGEgOiB0bXA7XG5cdFx0XHR9XG5cdFx0XHRpZihvcHQubm90ICYmIHUgPT09IGRhdGEpeyByZXR1cm4gfVxuXHRcdFx0aWYodSA9PT0gb3B0LnN0dW4pe1xuXHRcdFx0XHRpZigodG1wID0gcm9vdC5zdHVuKSAmJiB0bXAub24pe1xuXHRcdFx0XHRcdGNhdC4kLmJhY2soZnVuY3Rpb24oYSl7IC8vIG91ciBjaGFpbiBzdHVubmVkP1xuXHRcdFx0XHRcdFx0dG1wLm9uKCcnK2EuaWQsIHRlc3QgPSB7fSk7XG5cdFx0XHRcdFx0XHRpZigodGVzdC5ydW4gfHwgMCkgPCBhbnkuaWQpeyByZXR1cm4gdGVzdCB9IC8vIGlmIHRoZXJlIGlzIGFuIGVhcmxpZXIgc3R1biBvbiBnYXBsZXNzIHBhcmVudHMvc2VsZi5cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQhdGVzdC5ydW4gJiYgdG1wLm9uKCcnK2F0LmlkLCB0ZXN0ID0ge30pOyAvLyB0aGlzIG5vZGUgc3R1bm5lZD9cblx0XHRcdFx0XHQhdGVzdC5ydW4gJiYgc2F0ICYmIHRtcC5vbignJytzYXQuaWQsIHRlc3QgPSB7fSk7IC8vIGxpbmtlZCBub2RlIHN0dW5uZWQ/XG5cdFx0XHRcdFx0aWYoYW55LmlkID4gdGVzdC5ydW4pe1xuXHRcdFx0XHRcdFx0aWYoIXRlc3Quc3R1biB8fCB0ZXN0LnN0dW4uZW5kKXtcblx0XHRcdFx0XHRcdFx0dGVzdC5zdHVuID0gdG1wLm9uKCdzdHVuJyk7XG5cdFx0XHRcdFx0XHRcdHRlc3Quc3R1biA9IHRlc3Quc3R1biAmJiB0ZXN0LnN0dW4ubGFzdDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmKHRlc3Quc3R1biAmJiAhdGVzdC5zdHVuLmVuZCl7XG5cdFx0XHRcdFx0XHRcdC8vaWYob2RkICYmIHUgPT09IGRhdGEpeyByZXR1cm4gfVxuXHRcdFx0XHRcdFx0XHQvL2lmKHUgPT09IG1zZy5wdXQpeyByZXR1cm4gfSAvLyBcIm5vdCBmb3VuZFwiIGFja3Mgd2lsbCBiZSBmb3VuZCBpZiB0aGVyZSBpcyBzdHVuLCBzbyBpZ25vcmUgdGhlc2UuXG5cdFx0XHRcdFx0XHRcdCh0ZXN0LnN0dW4uYWRkIHx8ICh0ZXN0LnN0dW4uYWRkID0ge30pKVtpZF0gPSBmdW5jdGlvbigpeyBhbnkobXNnLGV2ZSwxKSB9IC8vIGFkZCBvdXJzZWxmIHRvIHRoZSBzdHVuIGNhbGxiYWNrIGxpc3QgdGhhdCBpcyBjYWxsZWQgYXQgZW5kIG9mIHRoZSB3cml0ZS5cblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZigvKm9kZCAmJiovIHUgPT09IGRhdGEpeyBmID0gMCB9IC8vIGlmIGRhdGEgbm90IGZvdW5kLCBrZWVwIHdhaXRpbmcvdHJ5aW5nLlxuXHRcdFx0XHQvKmlmKGYgJiYgdSA9PT0gZGF0YSl7XG5cdFx0XHRcdFx0Y2F0Lm9uKCdvdXQnLCBvcHQub3V0KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH0qL1xuXHRcdFx0XHRpZigodG1wID0gcm9vdC5oYXRjaCkgJiYgIXRtcC5lbmQgJiYgdSA9PT0gb3B0LmhhdGNoICYmICFmKXsgLy8gcXVpY2sgaGFjayEgLy8gV2hhdCdzIGdvaW5nIG9uIGhlcmU/IEJlY2F1c2UgZGF0YSBpcyBzdHJlYW1lZCwgd2UgZ2V0IHRoaW5ncyBvbmUgYnkgb25lLCBidXQgYSBsb3Qgb2YgZGV2ZWxvcGVycyB3b3VsZCByYXRoZXIgZ2V0IGEgY2FsbGJhY2sgYWZ0ZXIgZWFjaCBiYXRjaCBpbnN0ZWFkLCBzbyB0aGlzIGRvZXMgdGhhdCBieSBjcmVhdGluZyBhIHdhaXQgbGlzdCBwZXIgY2hhaW4gaWQgdGhhdCBpcyB0aGVuIGNhbGxlZCBhdCB0aGUgZW5kIG9mIHRoZSBiYXRjaCBieSB0aGUgaGF0Y2ggY29kZSBpbiB0aGUgcm9vdCBwdXQgbGlzdGVuZXIuXG5cdFx0XHRcdFx0aWYod2FpdFthdC4kLl8uaWRdKXsgcmV0dXJuIH0gd2FpdFthdC4kLl8uaWRdID0gMTtcblx0XHRcdFx0XHR0bXAucHVzaChmdW5jdGlvbigpe2FueShtc2csZXZlLDEpfSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9OyB3YWl0ID0ge307IC8vIGVuZCBxdWljayBoYWNrLlxuXHRcdFx0fVxuXHRcdFx0Ly8gY2FsbDpcblx0XHRcdGlmKHJvb3QucGFzcyl7IGlmKHJvb3QucGFzc1tpZCthdC5pZF0peyByZXR1cm4gfSByb290LnBhc3NbaWQrYXQuaWRdID0gMSB9XG5cdFx0XHRpZihvcHQub24peyBvcHQub2suY2FsbChhdC4kLCBkYXRhLCBhdC5nZXQsIG1zZywgZXZlIHx8IGFueSk7IHJldHVybiB9IC8vIFRPRE86IEFsc28gY29uc2lkZXIgYnJlYWtpbmcgYHRoaXNgIHNpbmNlIGEgbG90IG9mIHBlb3BsZSBkbyBgPT5gIHRoZXNlIGRheXMgYW5kIGAuY2FsbChgIGhhcyBzbG93ZXIgcGVyZm9ybWFuY2UuXG5cdFx0XHRpZihvcHQudjIwMjApeyBvcHQub2sobXNnLCBldmUgfHwgYW55KTsgcmV0dXJuIH1cblx0XHRcdE9iamVjdC5rZXlzKG1zZykuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnW2tdIH0sIHRtcCA9IHt9KTsgbXNnID0gdG1wOyBtc2cucHV0ID0gZGF0YTsgLy8gMjAxOSBDT01QQVRJQklMSVRZISBUT0RPOiBHRVQgUklEIE9GIFRISVMhXG5cdFx0XHRvcHQub2suY2FsbChvcHQuYXMsIG1zZywgZXZlIHx8IGFueSk7IC8vIGlzIHRoaXMgdGhlIHJpZ2h0XG5cdFx0fTtcblx0XHRhbnkuYXQgPSBjYXQ7XG5cdFx0Ly8oY2F0LmFueXx8KGNhdC5hbnk9ZnVuY3Rpb24obXNnKXsgc2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKGNhdC5hbnl8fCcnKSwgZnVuY3Rpb24oYWN0KXsgKGFjdCA9IGNhdC5hbnlbYWN0XSkgJiYgYWN0KG1zZykgfSwwLDk5KSB9KSlbaWQgPSBTdHJpbmcucmFuZG9tKDcpXSA9IGFueTsgLy8gbWF5YmUgc3dpdGNoIHRvIHRoaXMgaW4gZnV0dXJlP1xuXHRcdChjYXQuYW55fHwoY2F0LmFueT17fSkpW2lkID0gU3RyaW5nLnJhbmRvbSg3KV0gPSBhbnk7XG5cdFx0YW55Lm9mZiA9IGZ1bmN0aW9uKCl7IGFueS5zdHVuID0gMTsgaWYoIWNhdC5hbnkpeyByZXR1cm4gfSBkZWxldGUgY2F0LmFueVtpZF0gfVxuXHRcdGFueS5yaWQgPSByaWQ7IC8vIGxvZ2ljIGZyb20gb2xkIHZlcnNpb24sIGNhbiB3ZSBjbGVhbiBpdCB1cCBub3c/XG5cdFx0YW55LmlkID0gb3B0LnJ1biB8fCArK3Jvb3Qub25jZTsgLy8gdXNlZCBpbiBjYWxsYmFjayB0byBjaGVjayBpZiB3ZSBhcmUgZWFybGllciB0aGFuIGEgd3JpdGUuIC8vIHdpbGwgdGhpcyBldmVyIGNhdXNlIGFuIGludGVnZXIgb3ZlcmZsb3c/XG5cdFx0dG1wID0gcm9vdC5wYXNzOyAocm9vdC5wYXNzID0ge30pW2lkXSA9IDE7IC8vIEV4cGxhbmF0aW9uOiB0ZXN0IHRyYWRlLW9mZnMgd2FudCB0byBwcmV2ZW50IHJlY3Vyc2lvbiBzbyB3ZSBhZGQvcmVtb3ZlIHBhc3MgZmxhZyBhcyBpdCBnZXRzIGZ1bGZpbGxlZCB0byBub3QgcmVwZWF0LCBob3dldmVyIG1hcCBtYXAgbmVlZHMgbWFueSBwYXNzIGZsYWdzIC0gaG93IGRvIHdlIHJlY29uY2lsZT9cblx0XHRvcHQub3V0ID0gb3B0Lm91dCB8fCB7Z2V0OiB7fX07XG5cdFx0Y2F0Lm9uKCdvdXQnLCBvcHQub3V0KTtcblx0XHRyb290LnBhc3MgPSB0bXA7XG5cdFx0cmV0dXJuIGd1bjtcblx0fSBlbHNlXG5cdGlmKCdudW1iZXInID09IHR5cGVvZiBrZXkpe1xuXHRcdHJldHVybiB0aGlzLmdldCgnJytrZXksIGNiLCBhcyk7XG5cdH0gZWxzZVxuXHRpZignc3RyaW5nJyA9PSB0eXBlb2YgKHRtcCA9IHZhbGlkKGtleSkpKXtcblx0XHRyZXR1cm4gdGhpcy5nZXQodG1wLCBjYiwgYXMpO1xuXHR9IGVsc2Vcblx0aWYodG1wID0gdGhpcy5nZXQubmV4dCl7XG5cdFx0Z3VuID0gdG1wKHRoaXMsIGtleSk7XG5cdH1cblx0aWYoIWd1bil7XG5cdFx0KGd1biA9IHRoaXMuY2hhaW4oKSkuXy5lcnIgPSB7ZXJyOiBHdW4ubG9nKCdJbnZhbGlkIGdldCByZXF1ZXN0IScsIGtleSl9OyAvLyBDTEVBTiBVUFxuXHRcdGlmKGNiKXsgY2IuY2FsbChndW4sIGd1bi5fLmVycikgfVxuXHRcdHJldHVybiBndW47XG5cdH1cblx0aWYoY2IgJiYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2Ipe1xuXHRcdGd1bi5nZXQoY2IsIGFzKTtcblx0fVxuXHRyZXR1cm4gZ3VuO1xufVxuZnVuY3Rpb24gY2FjaGUoa2V5LCBiYWNrKXtcblx0dmFyIGNhdCA9IGJhY2suXywgbmV4dCA9IGNhdC5uZXh0LCBndW4gPSBiYWNrLmNoYWluKCksIGF0ID0gZ3VuLl87XG5cdGlmKCFuZXh0KXsgbmV4dCA9IGNhdC5uZXh0ID0ge30gfVxuXHRuZXh0W2F0LmdldCA9IGtleV0gPSBhdDtcblx0aWYoYmFjayA9PT0gY2F0LnJvb3QuJCl7XG5cdFx0YXQuc291bCA9IGtleTtcblx0fSBlbHNlXG5cdGlmKGNhdC5zb3VsIHx8IGNhdC5oYXMpe1xuXHRcdGF0LmhhcyA9IGtleTtcblx0XHQvL2lmKG9ial9oYXMoY2F0LnB1dCwga2V5KSl7XG5cdFx0XHQvL2F0LnB1dCA9IGNhdC5wdXRba2V5XTtcblx0XHQvL31cblx0fVxuXHRyZXR1cm4gYXQ7XG59XG5mdW5jdGlvbiBzb3VsKGd1biwgY2IsIG9wdCwgYXMpe1xuXHR2YXIgY2F0ID0gZ3VuLl8sIGFja3MgPSAwLCB0bXA7XG5cdGlmKHRtcCA9IGNhdC5zb3VsIHx8IGNhdC5saW5rKXsgcmV0dXJuIGNiKHRtcCwgYXMsIGNhdCkgfVxuXHRpZihjYXQuamFtKXsgcmV0dXJuIGNhdC5qYW0ucHVzaChbY2IsIGFzXSkgfVxuXHRjYXQuamFtID0gW1tjYixhc11dO1xuXHRndW4uZ2V0KGZ1bmN0aW9uIGdvKG1zZywgZXZlKXtcblx0XHRpZih1ID09PSBtc2cucHV0ICYmICFjYXQucm9vdC5vcHQuc3VwZXIgJiYgKHRtcCA9IE9iamVjdC5rZXlzKGNhdC5yb290Lm9wdC5wZWVycykubGVuZ3RoKSAmJiArK2Fja3MgPD0gdG1wKXsgLy8gVE9ETzogc3VwZXIgc2hvdWxkIG5vdCBiZSBpbiBjb3JlIGNvZGUsIGJyaW5nIEFYRSB1cCBpbnRvIGNvcmUgaW5zdGVhZCB0byBmaXg/IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZS5yaWQobXNnKTtcblx0XHR2YXIgYXQgPSAoKGF0ID0gbXNnLiQpICYmIGF0Ll8pIHx8IHt9LCBpID0gMCwgYXM7XG5cdFx0dG1wID0gY2F0LmphbTsgZGVsZXRlIGNhdC5qYW07IC8vIHRtcCA9IGNhdC5qYW0uc3BsaWNlKDAsIDEwMCk7XG5cdFx0Ly9pZih0bXAubGVuZ3RoKXsgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpeyBnbyhtc2csIGV2ZSkgfSkgfVxuXHRcdHdoaWxlKGFzID0gdG1wW2krK10peyAvL0d1bi5vYmoubWFwKHRtcCwgZnVuY3Rpb24oYXMsIGNiKXtcblx0XHRcdHZhciBjYiA9IGFzWzBdLCBpZDsgYXMgPSBhc1sxXTtcblx0XHRcdGNiICYmIGNiKGlkID0gYXQubGluayB8fCBhdC5zb3VsIHx8IEd1bi52YWxpZChtc2cucHV0KSB8fCAoKG1zZy5wdXR8fHt9KS5ffHx7fSlbJyMnXSwgYXMsIG1zZywgZXZlKTtcblx0XHR9IC8vKTtcblx0fSwge291dDoge2dldDogeycuJzp0cnVlfX19KTtcblx0cmV0dXJuIGd1bjtcbn1cbmZ1bmN0aW9uIHJpZChhdCl7XG5cdHZhciBjYXQgPSB0aGlzLmF0IHx8IHRoaXMub247XG5cdGlmKCFhdCB8fCBjYXQuc291bCB8fCBjYXQuaGFzKXsgcmV0dXJuIHRoaXMub2ZmKCkgfVxuXHRpZighKGF0ID0gKGF0ID0gKGF0ID0gYXQuJCB8fCBhdCkuXyB8fCBhdCkuaWQpKXsgcmV0dXJuIH1cblx0dmFyIG1hcCA9IGNhdC5tYXAsIHRtcCwgc2Vlbjtcblx0Ly9pZighbWFwIHx8ICEodG1wID0gbWFwW2F0XSkgfHwgISh0bXAgPSB0bXAuYXQpKXsgcmV0dXJuIH1cblx0aWYodG1wID0gKHNlZW4gPSB0aGlzLnNlZW4gfHwgKHRoaXMuc2VlbiA9IHt9KSlbYXRdKXsgcmV0dXJuIHRydWUgfVxuXHRzZWVuW2F0XSA9IHRydWU7XG5cdHJldHVybjtcblx0Ly90bXAuZWNob1tjYXQuaWRdID0ge307IC8vIFRPRE86IFdhcm5pbmc6IFRoaXMgdW5zdWJzY3JpYmVzIEFMTCBvZiB0aGlzIGNoYWluJ3MgbGlzdGVuZXJzIGZyb20gdGhpcyBsaW5rLCBub3QganVzdCB0aGUgb25lIGNhbGxiYWNrIGV2ZW50LlxuXHQvL29iai5kZWwobWFwLCBhdCk7IC8vIFRPRE86IFdhcm5pbmc6IFRoaXMgdW5zdWJzY3JpYmVzIEFMTCBvZiB0aGlzIGNoYWluJ3MgbGlzdGVuZXJzIGZyb20gdGhpcyBsaW5rLCBub3QganVzdCB0aGUgb25lIGNhbGxiYWNrIGV2ZW50LlxuXHRyZXR1cm47XG59XG52YXIgZW1wdHkgPSB7fSwgdmFsaWQgPSBHdW4udmFsaWQsIHU7XG5cdCIsIlxudmFyIEd1biA9IHJlcXVpcmUoJy4vcm9vdCcpO1xucmVxdWlyZSgnLi9jaGFpbicpO1xucmVxdWlyZSgnLi9iYWNrJyk7XG5yZXF1aXJlKCcuL3B1dCcpO1xucmVxdWlyZSgnLi9nZXQnKTtcbm1vZHVsZS5leHBvcnRzID0gR3VuO1xuXHQiLCJcbmlmKHR5cGVvZiBHdW4gPT09ICd1bmRlZmluZWQnKXsgcmV0dXJuIH1cblxudmFyIG5vb3AgPSBmdW5jdGlvbigpe30sIHN0b3JlLCB1O1xudHJ5e3N0b3JlID0gKEd1bi53aW5kb3d8fG5vb3ApLmxvY2FsU3RvcmFnZX1jYXRjaChlKXt9XG5pZighc3RvcmUpe1xuXHRHdW4ubG9nKFwiV2FybmluZzogTm8gbG9jYWxTdG9yYWdlIGV4aXN0cyB0byBwZXJzaXN0IGRhdGEgdG8hXCIpO1xuXHRzdG9yZSA9IHtzZXRJdGVtOiBmdW5jdGlvbihrLHYpe3RoaXNba109dn0sIHJlbW92ZUl0ZW06IGZ1bmN0aW9uKGspe2RlbGV0ZSB0aGlzW2tdfSwgZ2V0SXRlbTogZnVuY3Rpb24oayl7cmV0dXJuIHRoaXNba119fTtcbn1cblxudmFyIHBhcnNlID0gSlNPTi5wYXJzZUFzeW5jIHx8IGZ1bmN0aW9uKHQsY2Iscil7IHZhciB1OyB0cnl7IGNiKHUsIEpTT04ucGFyc2UodCxyKSkgfWNhdGNoKGUpeyBjYihlKSB9IH1cbnZhciBqc29uID0gSlNPTi5zdHJpbmdpZnlBc3luYyB8fCBmdW5jdGlvbih2LGNiLHIscyl7IHZhciB1OyB0cnl7IGNiKHUsIEpTT04uc3RyaW5naWZ5KHYscixzKSkgfWNhdGNoKGUpeyBjYihlKSB9IH1cblxuR3VuLm9uKCdjcmVhdGUnLCBmdW5jdGlvbiBsZyhyb290KXtcblx0dGhpcy50by5uZXh0KHJvb3QpO1xuXHR2YXIgb3B0ID0gcm9vdC5vcHQsIGdyYXBoID0gcm9vdC5ncmFwaCwgYWNrcyA9IFtdLCBkaXNrLCB0bywgc2l6ZSwgc3RvcDtcblx0aWYoZmFsc2UgPT09IG9wdC5sb2NhbFN0b3JhZ2UpeyByZXR1cm4gfVxuXHRvcHQucHJlZml4ID0gb3B0LmZpbGUgfHwgJ2d1bi8nO1xuXHR0cnl7IGRpc2sgPSBsZ1tvcHQucHJlZml4XSA9IGxnW29wdC5wcmVmaXhdIHx8IEpTT04ucGFyc2Uoc2l6ZSA9IHN0b3JlLmdldEl0ZW0ob3B0LnByZWZpeCkpIHx8IHt9OyAvLyBUT0RPOiBQZXJmISBUaGlzIHdpbGwgYmxvY2ssIHNob3VsZCB3ZSBjYXJlLCBzaW5jZSBsaW1pdGVkIHRvIDVNQiBhbnl3YXlzP1xuXHR9Y2F0Y2goZSl7IGRpc2sgPSBsZ1tvcHQucHJlZml4XSA9IHt9OyB9XG5cdHNpemUgPSAoc2l6ZXx8JycpLmxlbmd0aDtcblxuXHRyb290Lm9uKCdnZXQnLCBmdW5jdGlvbihtc2cpe1xuXHRcdHRoaXMudG8ubmV4dChtc2cpO1xuXHRcdHZhciBsZXggPSBtc2cuZ2V0LCBzb3VsLCBkYXRhLCB0bXAsIHU7XG5cdFx0aWYoIWxleCB8fCAhKHNvdWwgPSBsZXhbJyMnXSkpeyByZXR1cm4gfVxuXHRcdGRhdGEgPSBkaXNrW3NvdWxdIHx8IHU7XG5cdFx0aWYoZGF0YSAmJiAodG1wID0gbGV4WycuJ10pICYmICFPYmplY3QucGxhaW4odG1wKSl7IC8vIHBsdWNrIVxuXHRcdFx0ZGF0YSA9IEd1bi5zdGF0ZS5pZnkoe30sIHRtcCwgR3VuLnN0YXRlLmlzKGRhdGEsIHRtcCksIGRhdGFbdG1wXSwgc291bCk7XG5cdFx0fVxuXHRcdC8vaWYoZGF0YSl7ICh0bXAgPSB7fSlbc291bF0gPSBkYXRhIH0gLy8gYmFjayBpbnRvIGEgZ3JhcGguXG5cdFx0Ly9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0R3VuLm9uLmdldC5hY2sobXNnLCBkYXRhKTsgLy9yb290Lm9uKCdpbicsIHsnQCc6IG1zZ1snIyddLCBwdXQ6IHRtcCwgbFM6MX0pOy8vIHx8IHJvb3QuJH0pO1xuXHRcdC8vfSwgTWF0aC5yYW5kb20oKSAqIDEwKTsgLy8gRk9SIFRFU1RJTkcgUFVSUE9TRVMhXG5cdH0pO1xuXG5cdHJvb3Qub24oJ3B1dCcsIGZ1bmN0aW9uKG1zZyl7XG5cdFx0dGhpcy50by5uZXh0KG1zZyk7IC8vIHJlbWVtYmVyIHRvIGNhbGwgbmV4dCBtaWRkbGV3YXJlIGFkYXB0ZXJcblx0XHR2YXIgcHV0ID0gbXNnLnB1dCwgc291bCA9IHB1dFsnIyddLCBrZXkgPSBwdXRbJy4nXSwgaWQgPSBtc2dbJyMnXSwgb2sgPSBtc2cub2t8fCcnLCB0bXA7IC8vIHB1bGwgZGF0YSBvZmYgd2lyZSBlbnZlbG9wZVxuXHRcdGRpc2tbc291bF0gPSBHdW4uc3RhdGUuaWZ5KGRpc2tbc291bF0sIGtleSwgcHV0Wyc+J10sIHB1dFsnOiddLCBzb3VsKTsgLy8gbWVyZ2UgaW50byBkaXNrIG9iamVjdFxuXHRcdGlmKHN0b3AgJiYgc2l6ZSA+ICg0OTk5ODgwKSl7IHJvb3Qub24oJ2luJywgeydAJzogaWQsIGVycjogXCJsb2NhbFN0b3JhZ2UgbWF4IVwifSk7IHJldHVybjsgfVxuXHRcdC8vaWYoIW1zZ1snQCddKXsgYWNrcy5wdXNoKGlkKSB9IC8vIHRoZW4gYWNrIGFueSBub24tYWNrIHdyaXRlLiAvLyBUT0RPOiB1c2UgYmF0Y2ggaWQuXG5cdFx0aWYoIW1zZ1snQCddICYmICghbXNnLl8udmlhIHx8IE1hdGgucmFuZG9tKCkgPCAob2tbJ0AnXSAvIG9rWycvJ10pKSl7IGFja3MucHVzaChpZCkgfSAvLyB0aGVuIGFjayBhbnkgbm9uLWFjayB3cml0ZS4gLy8gVE9ETzogdXNlIGJhdGNoIGlkLlxuXHRcdGlmKHRvKXsgcmV0dXJuIH1cblx0XHR0byA9IHNldFRpbWVvdXQoZmx1c2gsIDkrKHNpemUgLyAzMzMpKTsgLy8gMC4xTUIgPSAwLjNzLCA1TUIgPSAxNXMgXG5cdH0pO1xuXHRmdW5jdGlvbiBmbHVzaCgpe1xuXHRcdGlmKCFhY2tzLmxlbmd0aCAmJiAoKHNldFRpbWVvdXQudHVybnx8JycpLnN8fCcnKS5sZW5ndGgpeyBzZXRUaW1lb3V0KGZsdXNoLDk5KTsgcmV0dXJuOyB9IC8vIGRlZmVyIGlmIFwiYnVzeVwiICYmIG5vIHNhdmVzLlxuXHRcdHZhciBlcnIsIGFjayA9IGFja3M7IGNsZWFyVGltZW91dCh0byk7IHRvID0gZmFsc2U7IGFja3MgPSBbXTtcblx0XHRqc29uKGRpc2ssIGZ1bmN0aW9uKGVyciwgdG1wKXtcblx0XHRcdHRyeXshZXJyICYmIHN0b3JlLnNldEl0ZW0ob3B0LnByZWZpeCwgdG1wKTtcblx0XHRcdH1jYXRjaChlKXsgZXJyID0gc3RvcCA9IGUgfHwgXCJsb2NhbFN0b3JhZ2UgZmFpbHVyZVwiIH1cblx0XHRcdGlmKGVycil7XG5cdFx0XHRcdEd1bi5sb2coZXJyICsgXCIgQ29uc2lkZXIgdXNpbmcgR1VOJ3MgSW5kZXhlZERCIHBsdWdpbiBmb3IgUkFEIGZvciBtb3JlIHN0b3JhZ2Ugc3BhY2UsIGh0dHBzOi8vZ3VuLmVjby9kb2NzL1JBRCNpbnN0YWxsXCIpO1xuXHRcdFx0XHRyb290Lm9uKCdsb2NhbFN0b3JhZ2U6ZXJyb3InLCB7ZXJyOiBlcnIsIGdldDogb3B0LnByZWZpeCwgcHV0OiBkaXNrfSk7XG5cdFx0XHR9XG5cdFx0XHRzaXplID0gdG1wLmxlbmd0aDtcblxuXHRcdFx0Ly9pZighZXJyICYmICFPYmplY3QuZW1wdHkob3B0LnBlZXJzKSl7IHJldHVybiB9IC8vIG9ubHkgYWNrIGlmIHRoZXJlIGFyZSBubyBwZWVycy4gLy8gU3dpdGNoIHRoaXMgdG8gcHJvYmFiaWxpc3RpYyBtb2RlXG5cdFx0XHRzZXRUaW1lb3V0LmVhY2goYWNrLCBmdW5jdGlvbihpZCl7XG5cdFx0XHRcdHJvb3Qub24oJ2luJywgeydAJzogaWQsIGVycjogZXJyLCBvazogMH0pOyAvLyBsb2NhbFN0b3JhZ2UgaXNuJ3QgcmVsaWFibGUsIHNvIG1ha2UgaXRzIGBva2AgY29kZSBiZSBhIGxvdyBudW1iZXIuXG5cdFx0XHR9LDAsOTkpO1xuXHRcdH0pXG5cdH1cblxufSk7XG5cdCIsIlxudmFyIEd1biA9IHJlcXVpcmUoJy4vaW5kZXgnKSwgbmV4dCA9IEd1bi5jaGFpbi5nZXQubmV4dDtcbkd1bi5jaGFpbi5nZXQubmV4dCA9IGZ1bmN0aW9uKGd1biwgbGV4KXsgdmFyIHRtcDtcblx0aWYoIU9iamVjdC5wbGFpbihsZXgpKXsgcmV0dXJuIChuZXh0fHxub29wKShndW4sIGxleCkgfVxuXHRpZih0bXAgPSAoKHRtcCA9IGxleFsnIyddKXx8JycpWyc9J10gfHwgdG1wKXsgcmV0dXJuIGd1bi5nZXQodG1wKSB9XG5cdCh0bXAgPSBndW4uY2hhaW4oKS5fKS5sZXggPSBsZXg7IC8vIExFWCFcblx0Z3VuLm9uKCdpbicsIGZ1bmN0aW9uKGV2ZSl7XG5cdFx0aWYoU3RyaW5nLm1hdGNoKGV2ZS5nZXR8fCAoZXZlLnB1dHx8JycpWycuJ10sIGxleFsnLiddIHx8IGxleFsnIyddIHx8IGxleCkpe1xuXHRcdFx0dG1wLm9uKCdpbicsIGV2ZSk7XG5cdFx0fVxuXHRcdHRoaXMudG8ubmV4dChldmUpO1xuXHR9KTtcblx0cmV0dXJuIHRtcC4kO1xufVxuR3VuLmNoYWluLm1hcCA9IGZ1bmN0aW9uKGNiLCBvcHQsIHQpe1xuXHR2YXIgZ3VuID0gdGhpcywgY2F0ID0gZ3VuLl8sIGxleCwgY2hhaW47XG5cdGlmKE9iamVjdC5wbGFpbihjYikpeyBsZXggPSBjYlsnLiddPyBjYiA6IHsnLic6IGNifTsgY2IgPSB1IH1cblx0aWYoIWNiKXtcblx0XHRpZihjaGFpbiA9IGNhdC5lYWNoKXsgcmV0dXJuIGNoYWluIH1cblx0XHQoY2F0LmVhY2ggPSBjaGFpbiA9IGd1bi5jaGFpbigpKS5fLmxleCA9IGxleCB8fCBjaGFpbi5fLmxleCB8fCBjYXQubGV4O1xuXHRcdGNoYWluLl8ubml4ID0gZ3VuLmJhY2soJ25peCcpO1xuXHRcdGd1bi5vbignaW4nLCBtYXAsIGNoYWluLl8pO1xuXHRcdHJldHVybiBjaGFpbjtcblx0fVxuXHRHdW4ubG9nLm9uY2UoXCJtYXBmblwiLCBcIk1hcCBmdW5jdGlvbnMgYXJlIGV4cGVyaW1lbnRhbCwgdGhlaXIgYmVoYXZpb3IgYW5kIEFQSSBtYXkgY2hhbmdlIG1vdmluZyBmb3J3YXJkLiBQbGVhc2UgcGxheSB3aXRoIGl0IGFuZCByZXBvcnQgYnVncyBhbmQgaWRlYXMgb24gaG93IHRvIGltcHJvdmUgaXQuXCIpO1xuXHRjaGFpbiA9IGd1bi5jaGFpbigpO1xuXHRndW4ubWFwKCkub24oZnVuY3Rpb24oZGF0YSwga2V5LCBtc2csIGV2ZSl7XG5cdFx0dmFyIG5leHQgPSAoY2J8fG5vb3ApLmNhbGwodGhpcywgZGF0YSwga2V5LCBtc2csIGV2ZSk7XG5cdFx0aWYodSA9PT0gbmV4dCl7IHJldHVybiB9XG5cdFx0aWYoZGF0YSA9PT0gbmV4dCl7IHJldHVybiBjaGFpbi5fLm9uKCdpbicsIG1zZykgfVxuXHRcdGlmKEd1bi5pcyhuZXh0KSl7IHJldHVybiBjaGFpbi5fLm9uKCdpbicsIG5leHQuXykgfVxuXHRcdHZhciB0bXAgPSB7fTsgT2JqZWN0LmtleXMobXNnLnB1dCkuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnLnB1dFtrXSB9LCB0bXApOyB0bXBbJz0nXSA9IG5leHQ7IFxuXHRcdGNoYWluLl8ub24oJ2luJywge2dldDoga2V5LCBwdXQ6IHRtcH0pO1xuXHR9KTtcblx0cmV0dXJuIGNoYWluO1xufVxuZnVuY3Rpb24gbWFwKG1zZyl7IHRoaXMudG8ubmV4dChtc2cpO1xuXHR2YXIgY2F0ID0gdGhpcy5hcywgZ3VuID0gbXNnLiQsIGF0ID0gZ3VuLl8sIHB1dCA9IG1zZy5wdXQsIHRtcDtcblx0aWYoIWF0LnNvdWwgJiYgIW1zZy4kJCl7IHJldHVybiB9IC8vIHRoaXMgbGluZSB0b29rIGh1bmRyZWRzIG9mIHRyaWVzIHRvIGZpZ3VyZSBvdXQuIEl0IG9ubHkgd29ya3MgaWYgY29yZSBjaGVja3MgdG8gZmlsdGVyIG91dCBhYm92ZSBjaGFpbnMgZHVyaW5nIGxpbmsgdGhvLiBUaGlzIHNheXMgXCJvbmx5IGJvdGhlciB0byBtYXAgb24gYSBub2RlXCIgZm9yIHRoaXMgbGF5ZXIgb2YgdGhlIGNoYWluLiBJZiBzb21ldGhpbmcgaXMgbm90IGEgbm9kZSwgbWFwIHNob3VsZCBub3Qgd29yay5cblx0aWYoKHRtcCA9IGNhdC5sZXgpICYmICFTdHJpbmcubWF0Y2gobXNnLmdldHx8IChwdXR8fCcnKVsnLiddLCB0bXBbJy4nXSB8fCB0bXBbJyMnXSB8fCB0bXApKXsgcmV0dXJuIH1cblx0R3VuLm9uLmxpbmsobXNnLCBjYXQpO1xufVxudmFyIG5vb3AgPSBmdW5jdGlvbigpe30sIGV2ZW50ID0ge3N0dW46IG5vb3AsIG9mZjogbm9vcH0sIHU7XG5cdCIsIlxucmVxdWlyZSgnLi9zaGltJyk7XG5cbnZhciBub29wID0gZnVuY3Rpb24oKXt9XG52YXIgcGFyc2UgPSBKU09OLnBhcnNlQXN5bmMgfHwgZnVuY3Rpb24odCxjYixyKXsgdmFyIHUsIGQgPSArbmV3IERhdGU7IHRyeXsgY2IodSwgSlNPTi5wYXJzZSh0LHIpLCBqc29uLnN1Y2tzKCtuZXcgRGF0ZSAtIGQpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxudmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeUFzeW5jIHx8IGZ1bmN0aW9uKHYsY2IscixzKXsgdmFyIHUsIGQgPSArbmV3IERhdGU7IHRyeXsgY2IodSwgSlNPTi5zdHJpbmdpZnkodixyLHMpLCBqc29uLnN1Y2tzKCtuZXcgRGF0ZSAtIGQpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxuanNvbi5zdWNrcyA9IGZ1bmN0aW9uKGQpeyBpZihkID4gOTkpeyBjb25zb2xlLmxvZyhcIldhcm5pbmc6IEpTT04gYmxvY2tpbmcgQ1BVIGRldGVjdGVkLiBBZGQgYGd1bi9saWIveXNvbi5qc2AgdG8gZml4LlwiKTsganNvbi5zdWNrcyA9IG5vb3AgfSB9XG5cbmZ1bmN0aW9uIE1lc2gocm9vdCl7XG5cdHZhciBtZXNoID0gZnVuY3Rpb24oKXt9O1xuXHR2YXIgb3B0ID0gcm9vdC5vcHQgfHwge307XG5cdG9wdC5sb2cgPSBvcHQubG9nIHx8IGNvbnNvbGUubG9nO1xuXHRvcHQuZ2FwID0gb3B0LmdhcCB8fCBvcHQud2FpdCB8fCAwO1xuXHRvcHQubWF4ID0gb3B0Lm1heCB8fCAob3B0Lm1lbW9yeT8gKG9wdC5tZW1vcnkgKiA5OTkgKiA5OTkpIDogMzAwMDAwMDAwKSAqIDAuMztcblx0b3B0LnBhY2sgPSBvcHQucGFjayB8fCAob3B0Lm1heCAqIDAuMDEgKiAwLjAxKTtcblx0b3B0LnB1ZmYgPSBvcHQucHVmZiB8fCA5OyAvLyBJREVBOiBkbyBhIHN0YXJ0L2VuZCBiZW5jaG1hcmssIGRpdmlkZSBvcHMvcmVzdWx0LlxuXHR2YXIgcHVmZiA9IHNldFRpbWVvdXQudHVybiB8fCBzZXRUaW1lb3V0O1xuXG5cdHZhciBkdXAgPSByb290LmR1cCwgZHVwX2NoZWNrID0gZHVwLmNoZWNrLCBkdXBfdHJhY2sgPSBkdXAudHJhY2s7XG5cblx0dmFyIFNUID0gK25ldyBEYXRlLCBMVCA9IFNUO1xuXG5cdHZhciBoZWFyID0gbWVzaC5oZWFyID0gZnVuY3Rpb24ocmF3LCBwZWVyKXtcblx0XHRpZighcmF3KXsgcmV0dXJuIH1cblx0XHRpZihvcHQubWF4IDw9IHJhdy5sZW5ndGgpeyByZXR1cm4gbWVzaC5zYXkoe2RhbTogJyEnLCBlcnI6IFwiTWVzc2FnZSB0b28gYmlnIVwifSwgcGVlcikgfVxuXHRcdGlmKG1lc2ggPT09IHRoaXMpe1xuXHRcdFx0LyppZignc3RyaW5nJyA9PSB0eXBlb2YgcmF3KXsgdHJ5e1xuXHRcdFx0XHR2YXIgc3RhdCA9IGNvbnNvbGUuU1RBVCB8fCB7fTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZygnSEVBUjonLCBwZWVyLmlkLCAocmF3fHwnJykuc2xpY2UoMCwyNTApLCAoKHJhd3x8JycpLmxlbmd0aCAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDQpKTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vY29uc29sZS5sb2coc2V0VGltZW91dC50dXJuLnMubGVuZ3RoLCAnc3RhY2tzJywgcGFyc2VGbG9hdCgoLShMVCAtIChMVCA9ICtuZXcgRGF0ZSkpLzEwMDApLnRvRml4ZWQoMykpLCAnc2VjJywgcGFyc2VGbG9hdCgoKExULVNUKS8xMDAwIC8gNjApLnRvRml4ZWQoMSkpLCAndXAnLCBzdGF0LnBlZXJzfHwwLCAncGVlcnMnLCBzdGF0Lmhhc3x8MCwgJ2hhcycsIHN0YXQubWVtaHVzZWR8fDAsIHN0YXQubWVtdXNlZHx8MCwgc3RhdC5tZW1heHx8MCwgJ2hlYXAgbWVtIG1heCcpO1xuXHRcdFx0fWNhdGNoKGUpeyBjb25zb2xlLmxvZygnREJHIGVycicsIGUpIH19Ki9cblx0XHRcdGhlYXIuZCArPSByYXcubGVuZ3RofHwwIDsgKytoZWFyLmMgfSAvLyBTVEFUUyFcblx0XHR2YXIgUyA9IHBlZXIuU0ggPSArbmV3IERhdGU7XG5cdFx0dmFyIHRtcCA9IHJhd1swXSwgbXNnO1xuXHRcdC8vcmF3ICYmIHJhdy5zbGljZSAmJiBjb25zb2xlLmxvZyhcImhlYXI6XCIsICgocGVlci53aXJlfHwnJykuaGVhZGVyc3x8JycpLm9yaWdpbiwgcmF3Lmxlbmd0aCwgcmF3LnNsaWNlICYmIHJhdy5zbGljZSgwLDUwKSk7IC8vdGMtaWFtdW5pcXVlLXRjLXBhY2thZ2UtZHMxXG5cdFx0aWYoJ1snID09PSB0bXApe1xuXHRcdFx0cGFyc2UocmF3LCBmdW5jdGlvbihlcnIsIG1zZyl7XG5cdFx0XHRcdGlmKGVyciB8fCAhbXNnKXsgcmV0dXJuIG1lc2guc2F5KHtkYW06ICchJywgZXJyOiBcIkRBTSBKU09OIHBhcnNlIGVycm9yLlwifSwgcGVlcikgfVxuXHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKCtuZXcgRGF0ZSwgbXNnLmxlbmd0aCwgJyMgb24gaGVhciBiYXRjaCcpO1xuXHRcdFx0XHR2YXIgUCA9IG9wdC5wdWZmO1xuXHRcdFx0XHQoZnVuY3Rpb24gZ28oKXtcblx0XHRcdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0XHR2YXIgaSA9IDAsIG07IHdoaWxlKGkgPCBQICYmIChtID0gbXNnW2krK10pKXsgbWVzaC5oZWFyKG0sIHBlZXIpIH1cblx0XHRcdFx0XHRtc2cgPSBtc2cuc2xpY2UoaSk7IC8vIHNsaWNpbmcgYWZ0ZXIgaXMgZmFzdGVyIHRoYW4gc2hpZnRpbmcgZHVyaW5nLlxuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ2hlYXIgbG9vcCcpO1xuXHRcdFx0XHRcdGZsdXNoKHBlZXIpOyAvLyBmb3JjZSBzZW5kIGFsbCBzeW5jaHJvbm91c2x5IGJhdGNoZWQgYWNrcy5cblx0XHRcdFx0XHRpZighbXNnLmxlbmd0aCl7IHJldHVybiB9XG5cdFx0XHRcdFx0cHVmZihnbywgMCk7XG5cdFx0XHRcdH0oKSk7XG5cdFx0XHR9KTtcblx0XHRcdHJhdyA9ICcnOyAvLyBcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYoJ3snID09PSB0bXAgfHwgKChyYXdbJyMnXSB8fCBPYmplY3QucGxhaW4ocmF3KSkgJiYgKG1zZyA9IHJhdykpKXtcblx0XHRcdGlmKG1zZyl7IHJldHVybiBoZWFyLm9uZShtc2csIHBlZXIsIFMpIH1cblx0XHRcdHBhcnNlKHJhdywgZnVuY3Rpb24oZXJyLCBtc2cpe1xuXHRcdFx0XHRpZihlcnIgfHwgIW1zZyl7IHJldHVybiBtZXNoLnNheSh7ZGFtOiAnIScsIGVycjogXCJEQU0gSlNPTiBwYXJzZSBlcnJvci5cIn0sIHBlZXIpIH1cblx0XHRcdFx0aGVhci5vbmUobXNnLCBwZWVyLCBTKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXHRoZWFyLm9uZSA9IGZ1bmN0aW9uKG1zZywgcGVlciwgUyl7IC8vIFMgaGVyZSBpcyB0ZW1wb3JhcnkhIFVuZG8uXG5cdFx0dmFyIGlkLCBoYXNoLCB0bXAsIGFzaCwgREJHO1xuXHRcdGlmKG1zZy5EQkcpeyBtc2cuREJHID0gREJHID0ge0RCRzogbXNnLkRCR30gfVxuXHRcdERCRyAmJiAoREJHLmggPSBTKTtcblx0XHREQkcgJiYgKERCRy5ocCA9ICtuZXcgRGF0ZSk7XG5cdFx0aWYoIShpZCA9IG1zZ1snIyddKSl7IGlkID0gbXNnWycjJ10gPSBTdHJpbmcucmFuZG9tKDkpIH1cblx0XHRpZih0bXAgPSBkdXBfY2hlY2soaWQpKXsgcmV0dXJuIH1cblx0XHQvLyBEQU0gbG9naWM6XG5cdFx0aWYoIShoYXNoID0gbXNnWycjIyddKSAmJiBmYWxzZSAmJiB1ICE9PSBtc2cucHV0KXsgLypoYXNoID0gbXNnWycjIyddID0gVHlwZS5vYmouaGFzaChtc2cucHV0KSovIH0gLy8gZGlzYWJsZSBoYXNoaW5nIGZvciBub3cgLy8gVE9ETzogaW1wb3NlIHdhcm5pbmcvcGVuYWx0eSBpbnN0ZWFkICg/KVxuXHRcdGlmKGhhc2ggJiYgKHRtcCA9IG1zZ1snQCddIHx8IChtc2cuZ2V0ICYmIGlkKSkgJiYgZHVwLmNoZWNrKGFzaCA9IHRtcCtoYXNoKSl7IHJldHVybiB9IC8vIEltYWdpbmUgQSA8LT4gQiA8PT4gKEMgJiBEKSwgQyAmIEQgcmVwbHkgd2l0aCBzYW1lIEFDSyBidXQgaGF2ZSBkaWZmZXJlbnQgSURzLCBCIGNhbiB1c2UgaGFzaCB0byBkZWR1cC4gT3IgaWYgYSBHRVQgaGFzIGEgaGFzaCBhbHJlYWR5LCB3ZSBzaG91bGRuJ3QgQUNLIGlmIHNhbWUuXG5cdFx0KG1zZy5fID0gZnVuY3Rpb24oKXt9KS52aWEgPSBtZXNoLmxlYXAgPSBwZWVyO1xuXHRcdGlmKCh0bXAgPSBtc2dbJz48J10pICYmICdzdHJpbmcnID09IHR5cGVvZiB0bXApeyB0bXAuc2xpY2UoMCw5OSkuc3BsaXQoJywnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0aGlzW2tdID0gMSB9LCAobXNnLl8pLnlvID0ge30pIH0gLy8gUGVlcnMgYWxyZWFkeSBzZW50IHRvLCBkbyBub3QgcmVzZW5kLlxuXHRcdC8vIERBTSBeXG5cdFx0aWYodG1wID0gbXNnLmRhbSl7XG5cdFx0XHRpZih0bXAgPSBtZXNoLmhlYXJbdG1wXSl7XG5cdFx0XHRcdHRtcChtc2csIHBlZXIsIHJvb3QpO1xuXHRcdFx0fVxuXHRcdFx0ZHVwX3RyYWNrKGlkKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYodG1wID0gbXNnLm9rKXsgbXNnLl8ubmVhciA9IHRtcFsnLyddIH1cblx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHREQkcgJiYgKERCRy5pcyA9IFMpOyBwZWVyLlNJID0gaWQ7XG5cdFx0cm9vdC5vbignaW4nLCBtZXNoLmxhc3QgPSBtc2cpO1xuXHRcdC8vRUNITyA9IG1zZy5wdXQgfHwgRUNITzsgIShtc2cub2sgIT09IC0zNzQwKSAmJiBtZXNoLnNheSh7b2s6IC0zNzQwLCBwdXQ6IEVDSE8sICdAJzogbXNnWycjJ119LCBwZWVyKTtcblx0XHREQkcgJiYgKERCRy5oZCA9ICtuZXcgRGF0ZSk7XG5cdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCBtc2cuZ2V0PyAnbXNnIGdldCcgOiBtc2cucHV0PyAnbXNnIHB1dCcgOiAnbXNnJyk7XG5cdFx0KHRtcCA9IGR1cF90cmFjayhpZCkpLnZpYSA9IHBlZXI7IC8vIGRvbid0IGRlZHVwIG1lc3NhZ2UgSUQgdGlsbCBhZnRlciwgY2F1c2UgR1VOIGhhcyBpbnRlcm5hbCBkZWR1cCBjaGVjay5cblx0XHRpZihtc2cuZ2V0KXsgdG1wLml0ID0gbXNnIH1cblx0XHRpZihhc2gpeyBkdXBfdHJhY2soYXNoKSB9IC8vZHVwLnRyYWNrKHRtcCtoYXNoLCB0cnVlKS5pdCA9IGl0KG1zZyk7XG5cdFx0bWVzaC5sZWFwID0gbWVzaC5sYXN0ID0gbnVsbDsgLy8gd2FybmluZyEgbWVzaC5sZWFwIGNvdWxkIGJlIGJ1Z2d5LlxuXHR9XG5cdHZhciB0b21hcCA9IGZ1bmN0aW9uKGssaSxtKXttKGssdHJ1ZSl9O1xuXHRoZWFyLmMgPSBoZWFyLmQgPSAwO1xuXG5cdDsoZnVuY3Rpb24oKXtcblx0XHR2YXIgU01JQSA9IDA7XG5cdFx0dmFyIGxvb3A7XG5cdFx0bWVzaC5oYXNoID0gZnVuY3Rpb24obXNnLCBwZWVyKXsgdmFyIGgsIHMsIHQ7XG5cdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdGpzb24obXNnLnB1dCwgZnVuY3Rpb24gaGFzaChlcnIsIHRleHQpe1xuXHRcdFx0XHR2YXIgc3MgPSAocyB8fCAocyA9IHQgPSB0ZXh0fHwnJykpLnNsaWNlKDAsIDMyNzY4KTsgLy8gMTAyNCAqIDMyXG5cdFx0XHQgIGggPSBTdHJpbmcuaGFzaChzcywgaCk7IHMgPSBzLnNsaWNlKDMyNzY4KTtcblx0XHRcdCAgaWYocyl7IHB1ZmYoaGFzaCwgMCk7IHJldHVybiB9XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3NheSBqc29uK2hhc2gnKTtcblx0XHRcdCAgbXNnLl8uJHB1dCA9IHQ7XG5cdFx0XHQgIG1zZ1snIyMnXSA9IGg7XG5cdFx0XHQgIG1lc2guc2F5KG1zZywgcGVlcik7XG5cdFx0XHQgIGRlbGV0ZSBtc2cuXy4kcHV0O1xuXHRcdFx0fSwgc29ydCk7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIHNvcnQoaywgdil7IHZhciB0bXA7XG5cdFx0XHRpZighKHYgaW5zdGFuY2VvZiBPYmplY3QpKXsgcmV0dXJuIHYgfVxuXHRcdFx0T2JqZWN0LmtleXModikuc29ydCgpLmZvckVhY2goc29ydGEsIHt0bzogdG1wID0ge30sIG9uOiB2fSk7XG5cdFx0XHRyZXR1cm4gdG1wO1xuXHRcdH0gZnVuY3Rpb24gc29ydGEoayl7IHRoaXMudG9ba10gPSB0aGlzLm9uW2tdIH1cblxuXHRcdHZhciBzYXkgPSBtZXNoLnNheSA9IGZ1bmN0aW9uKG1zZywgcGVlcil7IHZhciB0bXA7XG5cdFx0XHRpZigodG1wID0gdGhpcykgJiYgKHRtcCA9IHRtcC50bykgJiYgdG1wLm5leHQpeyB0bXAubmV4dChtc2cpIH0gLy8gY29tcGF0aWJsZSB3aXRoIG1pZGRsZXdhcmUgYWRhcHRlcnMuXG5cdFx0XHRpZighbXNnKXsgcmV0dXJuIGZhbHNlIH1cblx0XHRcdHZhciBpZCwgaGFzaCwgcmF3LCBhY2sgPSBtc2dbJ0AnXTtcbi8vaWYob3B0LnN1cGVyICYmICghYWNrIHx8ICFtc2cucHV0KSl7IHJldHVybiB9IC8vIFRPRE86IE1BTkhBVFRBTiBTVFVCIC8vT0JWSU9VU0xZIEJVRyEgQnV0IHNxdWVsY2ggcmVsYXkuIC8vIDooIGdldCBvbmx5IGlzIDEwMCUrIENQVSB1c2FnZSA6KFxuXHRcdFx0dmFyIG1ldGEgPSBtc2cuX3x8KG1zZy5fPWZ1bmN0aW9uKCl7fSk7XG5cdFx0XHR2YXIgREJHID0gbXNnLkRCRywgUyA9ICtuZXcgRGF0ZTsgbWV0YS55ID0gbWV0YS55IHx8IFM7IGlmKCFwZWVyKXsgREJHICYmIChEQkcueSA9IFMpIH1cblx0XHRcdGlmKCEoaWQgPSBtc2dbJyMnXSkpeyBpZCA9IG1zZ1snIyddID0gU3RyaW5nLnJhbmRvbSg5KSB9XG5cdFx0XHQhbG9vcCAmJiBkdXBfdHJhY2soaWQpOy8vLml0ID0gaXQobXNnKTsgLy8gdHJhY2sgZm9yIDkgc2Vjb25kcywgZGVmYXVsdC4gRWFydGg8LT5NYXJzIHdvdWxkIG5lZWQgbW9yZSEgLy8gYWx3YXlzIHRyYWNrLCBtYXliZSBtb3ZlIHRoaXMgdG8gdGhlICdhZnRlcicgbG9naWMgaWYgd2Ugc3BsaXQgZnVuY3Rpb24uXG5cdFx0XHQvL2lmKG1zZy5wdXQgJiYgKG1zZy5lcnIgfHwgKGR1cC5zW2lkXXx8JycpLmVycikpeyByZXR1cm4gZmFsc2UgfSAvLyBUT0RPOiBpbiB0aGVvcnkgd2Ugc2hvdWxkIG5vdCBiZSBhYmxlIHRvIHN0dW4gYSBtZXNzYWdlLCBidXQgZm9yIG5vdyBnb2luZyB0byBjaGVjayBpZiBpdCBjYW4gaGVscCBuZXR3b3JrIHBlcmZvcm1hbmNlIHByZXZlbnRpbmcgaW52YWxpZCBkYXRhIHRvIHJlbGF5LlxuXHRcdFx0aWYoIShoYXNoID0gbXNnWycjIyddKSAmJiB1ICE9PSBtc2cucHV0ICYmICFtZXRhLnZpYSAmJiBhY2speyBtZXNoLmhhc2gobXNnLCBwZWVyKTsgcmV0dXJuIH0gLy8gVE9ETzogU2hvdWxkIGJyb2FkY2FzdHMgYmUgaGFzaGVkP1xuXHRcdFx0aWYoIXBlZXIgJiYgYWNrKXsgcGVlciA9ICgodG1wID0gZHVwLnNbYWNrXSkgJiYgKHRtcC52aWEgfHwgKCh0bXAgPSB0bXAuaXQpICYmICh0bXAgPSB0bXAuXykgJiYgdG1wLnZpYSkpKSB8fCAoKHRtcCA9IG1lc2gubGFzdCkgJiYgYWNrID09PSB0bXBbJyMnXSAmJiBtZXNoLmxlYXApIH0gLy8gd2FybmluZyEgbWVzaC5sZWFwIGNvdWxkIGJlIGJ1Z2d5ISBtZXNoIGxhc3QgY2hlY2sgcmVkdWNlcyB0aGlzLlxuXHRcdFx0aWYoIXBlZXIgJiYgYWNrKXsgLy8gc3RpbGwgbm8gcGVlciwgdGhlbiBhY2sgZGFpc3kgY2hhaW4gJ3R1bm5lbCcgZ290IGxvc3QuXG5cdFx0XHRcdGlmKGR1cC5zW2Fja10peyByZXR1cm4gfSAvLyBpbiBkdXBzIGJ1dCBubyBwZWVyIGhpbnRzIHRoYXQgdGhpcyB3YXMgYWNrIHRvIG91cnNlbGYsIGlnbm9yZS5cblx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVCgrbmV3IERhdGUsICsrU01JQSwgJ3RvdGFsIG5vIHBlZXIgdG8gYWNrIHRvJyk7IC8vIFRPRE86IERlbGV0ZSB0aGlzIG5vdy4gRHJvcHBpbmcgbG9zdCBBQ0tzIGlzIHByb3RvY29sIGZpbmUgbm93LlxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9IC8vIFRPRE86IFRlbXBvcmFyeT8gSWYgYWNrIHZpYSB0cmFjZSBoYXMgYmVlbiBsb3N0LCBhY2tzIHdpbGwgZ28gdG8gYWxsIHBlZXJzLCB3aGljaCB0cmFzaGVzIGJyb3dzZXIgYmFuZHdpZHRoLiBOb3QgcmVsYXlpbmcgdGhlIGFjayB3aWxsIGZvcmNlIHNlbmRlciB0byBhc2sgZm9yIGFjayBhZ2Fpbi4gTm90ZSwgdGhpcyBpcyB0ZWNobmljYWxseSB3cm9uZyBmb3IgbWVzaCBiZWhhdmlvci5cblx0XHRcdGlmKCFwZWVyICYmIG1lc2gud2F5KXsgcmV0dXJuIG1lc2gud2F5KG1zZykgfVxuXHRcdFx0REJHICYmIChEQkcueWggPSArbmV3IERhdGUpO1xuXHRcdFx0aWYoIShyYXcgPSBtZXRhLnJhdykpeyBtZXNoLnJhdyhtc2csIHBlZXIpOyByZXR1cm4gfVxuXHRcdFx0REJHICYmIChEQkcueXIgPSArbmV3IERhdGUpO1xuXHRcdFx0aWYoIXBlZXIgfHwgIXBlZXIuaWQpe1xuXHRcdFx0XHRpZighT2JqZWN0LnBsYWluKHBlZXIgfHwgb3B0LnBlZXJzKSl7IHJldHVybiBmYWxzZSB9XG5cdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHR2YXIgUCA9IG9wdC5wdWZmLCBwcyA9IG9wdC5wZWVycywgcGwgPSBPYmplY3Qua2V5cyhwZWVyIHx8IG9wdC5wZWVycyB8fCB7fSk7IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3BlZXIga2V5cycpO1xuXHRcdFx0XHQ7KGZ1bmN0aW9uIGdvKCl7XG5cdFx0XHRcdFx0dmFyIFMgPSArbmV3IERhdGU7XG5cdFx0XHRcdFx0Ly9UeXBlLm9iai5tYXAocGVlciB8fCBvcHQucGVlcnMsIGVhY2gpOyAvLyBpbiBjYXNlIHBlZXIgaXMgYSBwZWVyIGxpc3QuXG5cdFx0XHRcdFx0bG9vcCA9IDE7IHZhciB3ciA9IG1ldGEucmF3OyBtZXRhLnJhdyA9IHJhdzsgLy8gcXVpY2sgcGVyZiBoYWNrXG5cdFx0XHRcdFx0dmFyIGkgPSAwLCBwOyB3aGlsZShpIDwgOSAmJiAocCA9IChwbHx8JycpW2krK10pKXtcblx0XHRcdFx0XHRcdGlmKCEocCA9IHBzW3BdKSl7IGNvbnRpbnVlIH1cblx0XHRcdFx0XHRcdG1lc2guc2F5KG1zZywgcCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG1ldGEucmF3ID0gd3I7IGxvb3AgPSAwO1xuXHRcdFx0XHRcdHBsID0gcGwuc2xpY2UoaSk7IC8vIHNsaWNpbmcgYWZ0ZXIgaXMgZmFzdGVyIHRoYW4gc2hpZnRpbmcgZHVyaW5nLlxuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3NheSBsb29wJyk7XG5cdFx0XHRcdFx0aWYoIXBsLmxlbmd0aCl7IHJldHVybiB9XG5cdFx0XHRcdFx0cHVmZihnbywgMCk7XG5cdFx0XHRcdFx0YWNrICYmIGR1cF90cmFjayhhY2spOyAvLyBrZWVwIGZvciBsYXRlclxuXHRcdFx0XHR9KCkpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHQvLyBUT0RPOiBQRVJGOiBjb25zaWRlciBzcGxpdHRpbmcgZnVuY3Rpb24gaGVyZSwgc28gc2F5IGxvb3BzIGRvIGxlc3Mgd29yay5cblx0XHRcdGlmKCFwZWVyLndpcmUgJiYgbWVzaC53aXJlKXsgbWVzaC53aXJlKHBlZXIpIH1cblx0XHRcdGlmKGlkID09PSBwZWVyLmxhc3QpeyByZXR1cm4gfSBwZWVyLmxhc3QgPSBpZDsgIC8vIHdhcyBpdCBqdXN0IHNlbnQ/XG5cdFx0XHRpZihwZWVyID09PSBtZXRhLnZpYSl7IHJldHVybiBmYWxzZSB9IC8vIGRvbid0IHNlbmQgYmFjayB0byBzZWxmLlxuXHRcdFx0aWYoKHRtcCA9IG1ldGEueW8pICYmICh0bXBbcGVlci51cmxdIHx8IHRtcFtwZWVyLnBpZF0gfHwgdG1wW3BlZXIuaWRdKSAvKiYmICFvKi8peyByZXR1cm4gZmFsc2UgfVxuXHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8bWV0YSkueXAgPSArbmV3IERhdGUpIC0gKG1ldGEueSB8fCBTKSwgJ3NheSBwcmVwJyk7XG5cdFx0XHQhbG9vcCAmJiBhY2sgJiYgZHVwX3RyYWNrKGFjayk7IC8vIHN0cmVhbWluZyBsb25nIHJlc3BvbnNlcyBuZWVkcyB0byBrZWVwIGFsaXZlIHRoZSBhY2suXG5cdFx0XHRpZihwZWVyLmJhdGNoKXtcblx0XHRcdFx0cGVlci50YWlsID0gKHRtcCA9IHBlZXIudGFpbCB8fCAwKSArIHJhdy5sZW5ndGg7XG5cdFx0XHRcdGlmKHBlZXIudGFpbCA8PSBvcHQucGFjayl7XG5cdFx0XHRcdFx0cGVlci5iYXRjaCArPSAodG1wPycsJzonJykrcmF3O1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRmbHVzaChwZWVyKTtcblx0XHRcdH1cblx0XHRcdHBlZXIuYmF0Y2ggPSAnWyc7IC8vIFByZXZlbnRzIGRvdWJsZSBKU09OIVxuXHRcdFx0dmFyIFNUID0gK25ldyBEYXRlO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFNULCArbmV3IERhdGUgLSBTVCwgJzBtcyBUTycpO1xuXHRcdFx0XHRmbHVzaChwZWVyKTtcblx0XHRcdH0sIG9wdC5nYXApOyAvLyBUT0RPOiBxdWV1aW5nL2JhdGNoaW5nIG1pZ2h0IGJlIGJhZCBmb3IgbG93LWxhdGVuY3kgdmlkZW8gZ2FtZSBwZXJmb3JtYW5jZSEgQWxsb3cgb3B0IG91dD9cblx0XHRcdHNlbmQocmF3LCBwZWVyKTtcblx0XHRcdGNvbnNvbGUuU1RBVCAmJiAoYWNrID09PSBwZWVyLlNJKSAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gcGVlci5TSCwgJ3NheSBhY2snKTtcblx0XHR9XG5cdFx0bWVzaC5zYXkuYyA9IG1lc2guc2F5LmQgPSAwO1xuXHRcdC8vIFRPRE86IHRoaXMgY2F1c2VkIGEgb3V0LW9mLW1lbW9yeSBjcmFzaCFcblx0XHRtZXNoLnJhdyA9IGZ1bmN0aW9uKG1zZywgcGVlcil7IC8vIFRPRE86IENsZWFuIHRoaXMgdXAgLyBkZWxldGUgaXQgLyBtb3ZlIGxvZ2ljIG91dCFcblx0XHRcdGlmKCFtc2cpeyByZXR1cm4gJycgfVxuXHRcdFx0dmFyIG1ldGEgPSAobXNnLl8pIHx8IHt9LCBwdXQsIHRtcDtcblx0XHRcdGlmKHRtcCA9IG1ldGEucmF3KXsgcmV0dXJuIHRtcCB9XG5cdFx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgbXNnKXsgcmV0dXJuIG1zZyB9XG5cdFx0XHR2YXIgaGFzaCA9IG1zZ1snIyMnXSwgYWNrID0gbXNnWydAJ107XG5cdFx0XHRpZihoYXNoICYmIGFjayl7XG5cdFx0XHRcdGlmKCFtZXRhLnZpYSAmJiBkdXBfY2hlY2soYWNrK2hhc2gpKXsgcmV0dXJuIGZhbHNlIH0gLy8gZm9yIG91ciBvd24gb3V0IG1lc3NhZ2VzLCBtZW1vcnkgJiBzdG9yYWdlIG1heSBhY2sgdGhlIHNhbWUgdGhpbmcsIHNvIGRlZHVwIHRoYXQuIFRobyBpZiB2aWEgYW5vdGhlciBwZWVyLCB3ZSBhbHJlYWR5IHRyYWNrZWQgaXQgdXBvbiBoZWFyaW5nLCBzbyB0aGlzIHdpbGwgYWx3YXlzIHRyaWdnZXIgZmFsc2UgcG9zaXRpdmVzLCBzbyBkb24ndCBkbyB0aGF0IVxuXHRcdFx0XHRpZigodG1wID0gKGR1cC5zW2Fja118fCcnKS5pdCkgfHwgKCh0bXAgPSBtZXNoLmxhc3QpICYmIGFjayA9PT0gdG1wWycjJ10pKXtcblx0XHRcdFx0XHRpZihoYXNoID09PSB0bXBbJyMjJ10peyByZXR1cm4gZmFsc2UgfSAvLyBpZiBhc2sgaGFzIGEgbWF0Y2hpbmcgaGFzaCwgYWNraW5nIGlzIG9wdGlvbmFsLlxuXHRcdFx0XHRcdGlmKCF0bXBbJyMjJ10peyB0bXBbJyMjJ10gPSBoYXNoIH0gLy8gaWYgbm9uZSwgYWRkIG91ciBoYXNoIHRvIGFzayBzbyBhbnlvbmUgd2UgcmVsYXkgdG8gY2FuIGRlZHVwLiAvLyBOT1RFOiBNYXkgb25seSBjaGVjayBhZ2FpbnN0IDFzdCBhY2sgY2h1bmssIDJuZCsgd29uJ3Qga25vdyBhbmQgc3RpbGwgc3RyZWFtIGJhY2sgdG8gcmVsYXlpbmcgcGVlcnMgd2hpY2ggbWF5IHRoZW4gZGVkdXAuIEFueSB3YXkgdG8gZml4IHRoaXMgd2FzdGVkIGJhbmR3aWR0aD8gSSBndWVzcyBmb3JjZSByYXRlIGxpbWl0aW5nIGJyZWFraW5nIGNoYW5nZSwgdGhhdCBhc2tpbmcgcGVlciBoYXMgdG8gYXNrIGZvciBuZXh0IGxleGljYWwgY2h1bmsuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmKCFtc2cuZGFtICYmICFtc2dbJ0AnXSl7XG5cdFx0XHRcdHZhciBpID0gMCwgdG8gPSBbXTsgdG1wID0gb3B0LnBlZXJzO1xuXHRcdFx0XHRmb3IodmFyIGsgaW4gdG1wKXsgdmFyIHAgPSB0bXBba107IC8vIFRPRE86IE1ha2UgaXQgdXAgcGVlcnMgaW5zdGVhZCFcblx0XHRcdFx0XHR0by5wdXNoKHAudXJsIHx8IHAucGlkIHx8IHAuaWQpO1xuXHRcdFx0XHRcdGlmKCsraSA+IDYpeyBicmVhayB9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoaSA+IDEpeyBtc2dbJz48J10gPSB0by5qb2luKCkgfSAvLyBUT0RPOiBCVUchIFRoaXMgZ2V0cyBzZXQgcmVnYXJkbGVzcyBvZiBwZWVycyBzZW50IHRvISBEZXRlY3Q/XG5cdFx0XHR9XG5cdFx0XHRpZihtc2cucHV0ICYmICh0bXAgPSBtc2cub2spKXsgbXNnLm9rID0geydAJzoodG1wWydAJ118fDEpLTEsICcvJzogKHRtcFsnLyddPT1tc2cuXy5uZWFyKT8gbWVzaC5uZWFyIDogdG1wWycvJ119OyB9XG5cdFx0XHRpZihwdXQgPSBtZXRhLiRwdXQpe1xuXHRcdFx0XHR0bXAgPSB7fTsgT2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSk7XG5cdFx0XHRcdHRtcC5wdXQgPSAnOl0pKFs6Jztcblx0XHRcdFx0anNvbih0bXAsIGZ1bmN0aW9uKGVyciwgcmF3KXtcblx0XHRcdFx0XHRpZihlcnIpeyByZXR1cm4gfSAvLyBUT0RPOiBIYW5kbGUhIVxuXHRcdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHRcdHRtcCA9IHJhdy5pbmRleE9mKCdcInB1dFwiOlwiOl0pKFs6XCInKTtcblx0XHRcdFx0XHRyZXModSwgcmF3ID0gcmF3LnNsaWNlKDAsIHRtcCs2KSArIHB1dCArIHJhdy5zbGljZSh0bXAgKyAxNCkpO1xuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3NheSBzbGljZScpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0anNvbihtc2csIHJlcyk7XG5cdFx0XHRmdW5jdGlvbiByZXMoZXJyLCByYXcpe1xuXHRcdFx0XHRpZihlcnIpeyByZXR1cm4gfSAvLyBUT0RPOiBIYW5kbGUhIVxuXHRcdFx0XHRtZXRhLnJhdyA9IHJhdzsgLy9pZihtZXRhICYmIChyYXd8fCcnKS5sZW5ndGggPCAoOTk5ICogOTkpKXsgbWV0YS5yYXcgPSByYXcgfSAvLyBITlBFUkY6IElmIHN0cmluZyB0b28gYmlnLCBkb24ndCBrZWVwIGluIG1lbW9yeS5cblx0XHRcdFx0bWVzaC5zYXkobXNnLCBwZWVyKTtcblx0XHRcdH1cblx0XHR9XG5cdH0oKSk7XG5cblx0ZnVuY3Rpb24gZmx1c2gocGVlcil7XG5cdFx0dmFyIHRtcCA9IHBlZXIuYmF0Y2gsIHQgPSAnc3RyaW5nJyA9PSB0eXBlb2YgdG1wLCBsO1xuXHRcdGlmKHQpeyB0bXAgKz0gJ10nIH0vLyBUT0RPOiBQcmV2ZW50IGRvdWJsZSBKU09OIVxuXHRcdHBlZXIuYmF0Y2ggPSBwZWVyLnRhaWwgPSBudWxsO1xuXHRcdGlmKCF0bXApeyByZXR1cm4gfVxuXHRcdGlmKHQ/IDMgPiB0bXAubGVuZ3RoIDogIXRtcC5sZW5ndGgpeyByZXR1cm4gfSAvLyBUT0RPOiBeXG5cdFx0aWYoIXQpe3RyeXt0bXAgPSAoMSA9PT0gdG1wLmxlbmd0aD8gdG1wWzBdIDogSlNPTi5zdHJpbmdpZnkodG1wKSk7XG5cdFx0fWNhdGNoKGUpe3JldHVybiBvcHQubG9nKCdEQU0gSlNPTiBzdHJpbmdpZnkgZXJyb3InLCBlKX19XG5cdFx0aWYoIXRtcCl7IHJldHVybiB9XG5cdFx0c2VuZCh0bXAsIHBlZXIpO1xuXHR9XG5cdC8vIGZvciBub3cgLSBmaW5kIGJldHRlciBwbGFjZSBsYXRlci5cblx0ZnVuY3Rpb24gc2VuZChyYXcsIHBlZXIpeyB0cnl7XG5cdFx0dmFyIHdpcmUgPSBwZWVyLndpcmU7XG5cdFx0aWYocGVlci5zYXkpe1xuXHRcdFx0cGVlci5zYXkocmF3KTtcblx0XHR9IGVsc2Vcblx0XHRpZih3aXJlLnNlbmQpe1xuXHRcdFx0d2lyZS5zZW5kKHJhdyk7XG5cdFx0fVxuXHRcdG1lc2guc2F5LmQgKz0gcmF3Lmxlbmd0aHx8MDsgKyttZXNoLnNheS5jOyAvLyBTVEFUUyFcblx0fWNhdGNoKGUpe1xuXHRcdChwZWVyLnF1ZXVlID0gcGVlci5xdWV1ZSB8fCBbXSkucHVzaChyYXcpO1xuXHR9fVxuXG5cdG1lc2gubmVhciA9IDA7XG5cdG1lc2guaGkgPSBmdW5jdGlvbihwZWVyKXtcblx0XHR2YXIgd2lyZSA9IHBlZXIud2lyZSwgdG1wO1xuXHRcdGlmKCF3aXJlKXsgbWVzaC53aXJlKChwZWVyLmxlbmd0aCAmJiB7dXJsOiBwZWVyLCBpZDogcGVlcn0pIHx8IHBlZXIpOyByZXR1cm4gfVxuXHRcdGlmKHBlZXIuaWQpe1xuXHRcdFx0b3B0LnBlZXJzW3BlZXIudXJsIHx8IHBlZXIuaWRdID0gcGVlcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dG1wID0gcGVlci5pZCA9IHBlZXIuaWQgfHwgU3RyaW5nLnJhbmRvbSg5KTtcblx0XHRcdG1lc2guc2F5KHtkYW06ICc/JywgcGlkOiByb290Lm9wdC5waWR9LCBvcHQucGVlcnNbdG1wXSA9IHBlZXIpO1xuXHRcdFx0ZGVsZXRlIGR1cC5zW3BlZXIubGFzdF07IC8vIElNUE9SVEFOVDogc2VlIGh0dHBzOi8vZ3VuLmVjby9kb2NzL0RBTSNzZWxmXG5cdFx0fVxuXHRcdGlmKCFwZWVyLm1ldCl7XG5cdFx0XHRtZXNoLm5lYXIrKztcblx0XHRcdHBlZXIubWV0ID0gKyhuZXcgRGF0ZSk7XG5cdFx0XHRyb290Lm9uKCdoaScsIHBlZXIpXG5cdFx0fVxuXHRcdC8vIEByb2dvd3NraSBJIG5lZWQgdGhpcyBoZXJlIGJ5IGRlZmF1bHQgZm9yIG5vdyB0byBmaXggZ28xZGZpc2gncyBidWdcblx0XHR0bXAgPSBwZWVyLnF1ZXVlOyBwZWVyLnF1ZXVlID0gW107XG5cdFx0c2V0VGltZW91dC5lYWNoKHRtcHx8W10sZnVuY3Rpb24obXNnKXtcblx0XHRcdHNlbmQobXNnLCBwZWVyKTtcblx0XHR9LDAsOSk7XG5cdFx0Ly9UeXBlLm9iai5uYXRpdmUgJiYgVHlwZS5vYmoubmF0aXZlKCk7IC8vIGRpcnR5IHBsYWNlIHRvIGNoZWNrIGlmIG90aGVyIEpTIHBvbGx1dGVkLlxuXHR9XG5cdG1lc2guYnllID0gZnVuY3Rpb24ocGVlcil7XG5cdFx0cGVlci5tZXQgJiYgLS1tZXNoLm5lYXI7XG5cdFx0ZGVsZXRlIHBlZXIubWV0O1xuXHRcdHJvb3Qub24oJ2J5ZScsIHBlZXIpO1xuXHRcdHZhciB0bXAgPSArKG5ldyBEYXRlKTsgdG1wID0gKHRtcCAtIChwZWVyLm1ldHx8dG1wKSk7XG5cdFx0bWVzaC5ieWUudGltZSA9ICgobWVzaC5ieWUudGltZSB8fCB0bXApICsgdG1wKSAvIDI7XG5cdH1cblx0bWVzaC5oZWFyWychJ10gPSBmdW5jdGlvbihtc2csIHBlZXIpeyBvcHQubG9nKCdFcnJvcjonLCBtc2cuZXJyKSB9XG5cdG1lc2guaGVhclsnPyddID0gZnVuY3Rpb24obXNnLCBwZWVyKXtcblx0XHRpZihtc2cucGlkKXtcblx0XHRcdGlmKCFwZWVyLnBpZCl7IHBlZXIucGlkID0gbXNnLnBpZCB9XG5cdFx0XHRpZihtc2dbJ0AnXSl7IHJldHVybiB9XG5cdFx0fVxuXHRcdG1lc2guc2F5KHtkYW06ICc/JywgcGlkOiBvcHQucGlkLCAnQCc6IG1zZ1snIyddfSwgcGVlcik7XG5cdFx0ZGVsZXRlIGR1cC5zW3BlZXIubGFzdF07IC8vIElNUE9SVEFOVDogc2VlIGh0dHBzOi8vZ3VuLmVjby9kb2NzL0RBTSNzZWxmXG5cdH1cblx0bWVzaC5oZWFyWydtb2InXSA9IGZ1bmN0aW9uKG1zZywgcGVlcil7IC8vIE5PVEU6IEFYRSB3aWxsIG92ZXJsb2FkIHRoaXMgd2l0aCBiZXR0ZXIgbG9naWMuXG5cdFx0aWYoIW1zZy5wZWVycyl7IHJldHVybiB9XG5cdFx0dmFyIHBlZXJzID0gT2JqZWN0LmtleXMobXNnLnBlZXJzKSwgb25lID0gcGVlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnBlZXJzLmxlbmd0aCldO1xuXHRcdGlmKCFvbmUpeyByZXR1cm4gfVxuXHRcdG1lc2guYnllKHBlZXIpO1xuXHRcdG1lc2guaGkob25lKTtcblx0fVxuXG5cdHJvb3Qub24oJ2NyZWF0ZScsIGZ1bmN0aW9uKHJvb3Qpe1xuXHRcdHJvb3Qub3B0LnBpZCA9IHJvb3Qub3B0LnBpZCB8fCBTdHJpbmcucmFuZG9tKDkpO1xuXHRcdHRoaXMudG8ubmV4dChyb290KTtcblx0XHRyb290Lm9uKCdvdXQnLCBtZXNoLnNheSk7XG5cdH0pO1xuXG5cdHJvb3Qub24oJ2J5ZScsIGZ1bmN0aW9uKHBlZXIsIHRtcCl7XG5cdFx0cGVlciA9IG9wdC5wZWVyc1twZWVyLmlkIHx8IHBlZXJdIHx8IHBlZXI7XG5cdFx0dGhpcy50by5uZXh0KHBlZXIpO1xuXHRcdHBlZXIuYnllPyBwZWVyLmJ5ZSgpIDogKHRtcCA9IHBlZXIud2lyZSkgJiYgdG1wLmNsb3NlICYmIHRtcC5jbG9zZSgpO1xuXHRcdGRlbGV0ZSBvcHQucGVlcnNbcGVlci5pZF07XG5cdFx0cGVlci53aXJlID0gbnVsbDtcblx0fSk7XG5cblx0dmFyIGdldHMgPSB7fTtcblx0cm9vdC5vbignYnllJywgZnVuY3Rpb24ocGVlciwgdG1wKXsgdGhpcy50by5uZXh0KHBlZXIpO1xuXHRcdGlmKHRtcCA9IGNvbnNvbGUuU1RBVCl7IHRtcC5wZWVycyA9IG1lc2gubmVhcjsgfVxuXHRcdGlmKCEodG1wID0gcGVlci51cmwpKXsgcmV0dXJuIH0gZ2V0c1t0bXBdID0gdHJ1ZTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGRlbGV0ZSBnZXRzW3RtcF0gfSxvcHQubGFjayB8fCA5MDAwKTtcblx0fSk7XG5cdHJvb3Qub24oJ2hpJywgZnVuY3Rpb24ocGVlciwgdG1wKXsgdGhpcy50by5uZXh0KHBlZXIpO1xuXHRcdGlmKHRtcCA9IGNvbnNvbGUuU1RBVCl7IHRtcC5wZWVycyA9IG1lc2gubmVhciB9XG5cdFx0aWYoISh0bXAgPSBwZWVyLnVybCkgfHwgIWdldHNbdG1wXSl7IHJldHVybiB9IGRlbGV0ZSBnZXRzW3RtcF07XG5cdFx0aWYob3B0LnN1cGVyKXsgcmV0dXJuIH0gLy8gdGVtcG9yYXJ5ICg/KSB1bnRpbCB3ZSBoYXZlIGJldHRlciBmaXgvc29sdXRpb24/XG5cdFx0c2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKHJvb3QubmV4dCksIGZ1bmN0aW9uKHNvdWwpeyB2YXIgbm9kZSA9IHJvb3QubmV4dFtzb3VsXTsgLy8gVE9ETzogLmtleXMoIGlzIHNsb3dcblx0XHRcdHRtcCA9IHt9OyB0bXBbc291bF0gPSByb290LmdyYXBoW3NvdWxdOyB0bXAgPSBTdHJpbmcuaGFzaCh0bXApOyAvLyBUT0RPOiBCVUchIFRoaXMgaXMgYnJva2VuLlxuXHRcdFx0bWVzaC5zYXkoeycjIyc6IHRtcCwgZ2V0OiB7JyMnOiBzb3VsfX0sIHBlZXIpO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4gbWVzaDtcbn1cblx0ICB2YXIgZW1wdHkgPSB7fSwgb2sgPSB0cnVlLCB1O1xuXG5cdCAgdHJ5eyBtb2R1bGUuZXhwb3J0cyA9IE1lc2ggfWNhdGNoKGUpe31cblxuXHQiLCJcbnZhciBHdW4gPSByZXF1aXJlKCcuL2luZGV4Jyk7XG5HdW4uY2hhaW4ub24gPSBmdW5jdGlvbih0YWcsIGFyZywgZWFzLCBhcyl7IC8vIGRvbid0IHJld3JpdGUhXG5cdHZhciBndW4gPSB0aGlzLCBjYXQgPSBndW4uXywgcm9vdCA9IGNhdC5yb290LCBhY3QsIG9mZiwgaWQsIHRtcDtcblx0aWYodHlwZW9mIHRhZyA9PT0gJ3N0cmluZycpe1xuXHRcdGlmKCFhcmcpeyByZXR1cm4gY2F0Lm9uKHRhZykgfVxuXHRcdGFjdCA9IGNhdC5vbih0YWcsIGFyZywgZWFzIHx8IGNhdCwgYXMpO1xuXHRcdGlmKGVhcyAmJiBlYXMuJCl7XG5cdFx0XHQoZWFzLnN1YnMgfHwgKGVhcy5zdWJzID0gW10pKS5wdXNoKGFjdCk7XG5cdFx0fVxuXHRcdHJldHVybiBndW47XG5cdH1cblx0dmFyIG9wdCA9IGFyZztcblx0KG9wdCA9ICh0cnVlID09PSBvcHQpPyB7Y2hhbmdlOiB0cnVlfSA6IG9wdCB8fCB7fSkubm90ID0gMTsgb3B0Lm9uID0gMTtcblx0Ly9vcHQuYXQgPSBjYXQ7XG5cdC8vb3B0Lm9rID0gdGFnO1xuXHQvL29wdC5sYXN0ID0ge307XG5cdHZhciB3YWl0ID0ge307IC8vIGNhbiB3ZSBhc3NpZ24gdGhpcyB0byB0aGUgYXQgaW5zdGVhZCwgbGlrZSBpbiBvbmNlP1xuXHRndW4uZ2V0KHRhZywgb3B0KTtcblx0LypndW4uZ2V0KGZ1bmN0aW9uIG9uKGRhdGEsa2V5LG1zZyxldmUpeyB2YXIgJCA9IHRoaXM7XG5cdFx0aWYodG1wID0gcm9vdC5oYXRjaCl7IC8vIHF1aWNrIGhhY2shXG5cdFx0XHRpZih3YWl0WyQuXy5pZF0peyByZXR1cm4gfSB3YWl0WyQuXy5pZF0gPSAxO1xuXHRcdFx0dG1wLnB1c2goZnVuY3Rpb24oKXtvbi5jYWxsKCQsIGRhdGEsa2V5LG1zZyxldmUpfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fTsgd2FpdCA9IHt9OyAvLyBlbmQgcXVpY2sgaGFjay5cblx0XHR0YWcuY2FsbCgkLCBkYXRhLGtleSxtc2csZXZlKTtcblx0fSwgb3B0KTsgLy8gVE9ETzogUEVSRiEgRXZlbnQgbGlzdGVuZXIgbGVhayEhIT8qL1xuXHQvKlxuXHRmdW5jdGlvbiBvbmUobXNnLCBldmUpe1xuXHRcdGlmKG9uZS5zdHVuKXsgcmV0dXJuIH1cblx0XHR2YXIgYXQgPSBtc2cuJC5fLCBkYXRhID0gYXQucHV0LCB0bXA7XG5cdFx0aWYodG1wID0gYXQubGluayl7IGRhdGEgPSByb290LiQuZ2V0KHRtcCkuXy5wdXQgfVxuXHRcdGlmKG9wdC5ub3Q9PT11ICYmIHUgPT09IGRhdGEpeyByZXR1cm4gfVxuXHRcdGlmKG9wdC5zdHVuPT09dSAmJiAodG1wID0gcm9vdC5zdHVuKSAmJiAodG1wID0gdG1wW2F0LmlkXSB8fCB0bXBbYXQuYmFjay5pZF0pICYmICF0bXAuZW5kKXsgLy8gUmVtZW1iZXIhIElmIHlvdSBwb3J0IHRoaXMgaW50byBgLmdldChjYmAgbWFrZSBzdXJlIHlvdSBhbGxvdyBzdHVuOjAgc2tpcCBvcHRpb24gZm9yIGAucHV0KGAuXG5cdFx0XHR0bXBbaWRdID0gZnVuY3Rpb24oKXtvbmUobXNnLGV2ZSl9O1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvL3RtcCA9IG9uZS53YWl0IHx8IChvbmUud2FpdCA9IHt9KTsgY29uc29sZS5sb2codG1wW2F0LmlkXSA9PT0gJycpOyBpZih0bXBbYXQuaWRdICE9PSAnJyl7IHRtcFthdC5pZF0gPSB0bXBbYXQuaWRdIHx8IHNldFRpbWVvdXQoZnVuY3Rpb24oKXt0bXBbYXQuaWRdPScnO29uZShtc2csZXZlKX0sMSk7IHJldHVybiB9IGRlbGV0ZSB0bXBbYXQuaWRdO1xuXHRcdC8vIGNhbGw6XG5cdFx0aWYob3B0LmFzKXtcblx0XHRcdG9wdC5vay5jYWxsKG9wdC5hcywgbXNnLCBldmUgfHwgb25lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3B0Lm9rLmNhbGwoYXQuJCwgZGF0YSwgbXNnLmdldCB8fCBhdC5nZXQsIG1zZywgZXZlIHx8IG9uZSk7XG5cdFx0fVxuXHR9O1xuXHRvbmUuYXQgPSBjYXQ7XG5cdChjYXQuYWN0fHwoY2F0LmFjdD17fSkpW2lkID0gU3RyaW5nLnJhbmRvbSg3KV0gPSBvbmU7XG5cdG9uZS5vZmYgPSBmdW5jdGlvbigpeyBvbmUuc3R1biA9IDE7IGlmKCFjYXQuYWN0KXsgcmV0dXJuIH0gZGVsZXRlIGNhdC5hY3RbaWRdIH1cblx0Y2F0Lm9uKCdvdXQnLCB7Z2V0OiB7fX0pOyovXG5cdHJldHVybiBndW47XG59XG4vLyBSdWxlczpcbi8vIDEuIElmIGNhY2hlZCwgc2hvdWxkIGJlIGZhc3QsIGJ1dCBub3QgcmVhZCB3aGlsZSB3cml0ZS5cbi8vIDIuIFNob3VsZCBub3QgcmV0cmlnZ2VyIG90aGVyIGxpc3RlbmVycywgc2hvdWxkIGdldCB0cmlnZ2VyZWQgZXZlbiBpZiBub3RoaW5nIGZvdW5kLlxuLy8gMy4gSWYgdGhlIHNhbWUgY2FsbGJhY2sgcGFzc2VkIHRvIG1hbnkgZGlmZmVyZW50IG9uY2UgY2hhaW5zLCBlYWNoIHNob3VsZCByZXNvbHZlIC0gYW4gdW5zdWJzY3JpYmUgZnJvbSB0aGUgc2FtZSBjYWxsYmFjayBzaG91bGQgbm90IGVmZmVjdCB0aGUgc3RhdGUgb2YgdGhlIG90aGVyIHJlc29sdmluZyBjaGFpbnMsIGlmIHlvdSBkbyB3YW50IHRvIGNhbmNlbCB0aGVtIGFsbCBlYXJseSB5b3Ugc2hvdWxkIG11dGF0ZSB0aGUgY2FsbGJhY2sgaXRzZWxmIHdpdGggYSBmbGFnICYgY2hlY2sgZm9yIGl0IGF0IHRvcCBvZiBjYWxsYmFja1xuR3VuLmNoYWluLm9uY2UgPSBmdW5jdGlvbihjYiwgb3B0KXsgb3B0ID0gb3B0IHx8IHt9OyAvLyBhdm9pZCByZXdyaXRpbmdcblx0aWYoIWNiKXsgcmV0dXJuIG5vbmUodGhpcyxvcHQpIH1cblx0dmFyIGd1biA9IHRoaXMsIGNhdCA9IGd1bi5fLCByb290ID0gY2F0LnJvb3QsIGRhdGEgPSBjYXQucHV0LCBpZCA9IFN0cmluZy5yYW5kb20oNyksIG9uZSwgdG1wO1xuXHRndW4uZ2V0KGZ1bmN0aW9uKGRhdGEsa2V5LG1zZyxldmUpe1xuXHRcdHZhciAkID0gdGhpcywgYXQgPSAkLl8sIG9uZSA9IChhdC5vbmV8fChhdC5vbmU9e30pKTtcblx0XHRpZihldmUuc3R1bil7IHJldHVybiB9IGlmKCcnID09PSBvbmVbaWRdKXsgcmV0dXJuIH1cblx0XHRpZih0cnVlID09PSAodG1wID0gR3VuLnZhbGlkKGRhdGEpKSl7IG9uY2UoKTsgcmV0dXJuIH1cblx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgdG1wKXsgcmV0dXJuIH0gLy8gVE9ETzogQlVHPyBXaWxsIHRoaXMgYWx3YXlzIGxvYWQ/XG5cdFx0Y2xlYXJUaW1lb3V0KChjYXQub25lfHwnJylbaWRdKTsgLy8gY2xlYXIgXCJub3QgZm91bmRcIiBzaW5jZSB0aGV5IG9ubHkgZ2V0IHNldCBvbiBjYXQuXG5cdFx0Y2xlYXJUaW1lb3V0KG9uZVtpZF0pOyBvbmVbaWRdID0gc2V0VGltZW91dChvbmNlLCBvcHQud2FpdHx8OTkpOyAvLyBUT0RPOiBCdWc/IFRoaXMgZG9lc24ndCBoYW5kbGUgcGx1cmFsIGNoYWlucy5cblx0XHRmdW5jdGlvbiBvbmNlKGYpe1xuXHRcdFx0aWYoIWF0LmhhcyAmJiAhYXQuc291bCl7IGF0ID0ge3B1dDogZGF0YSwgZ2V0OiBrZXl9IH0gLy8gaGFuZGxlcyBub24tY29yZSBtZXNzYWdlcy5cblx0XHRcdGlmKHUgPT09ICh0bXAgPSBhdC5wdXQpKXsgdG1wID0gKChtc2cuJCR8fCcnKS5ffHwnJykucHV0IH1cblx0XHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiBHdW4udmFsaWQodG1wKSl7XG5cdFx0XHRcdHRtcCA9IHJvb3QuJC5nZXQodG1wKS5fLnB1dDtcblx0XHRcdFx0aWYodG1wID09PSB1ICYmICFmKXtcblx0XHRcdFx0XHRvbmVbaWRdID0gc2V0VGltZW91dChmdW5jdGlvbigpeyBvbmNlKDEpIH0sIG9wdC53YWl0fHw5OSk7IC8vIFRPRE86IFF1aWNrIGZpeC4gTWF5YmUgdXNlIGFjayBjb3VudCBmb3IgbW9yZSBwcmVkaWN0YWJsZSBjb250cm9sP1xuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiQU5EIFZBTklTSEVEXCIsIGRhdGEpO1xuXHRcdFx0aWYoZXZlLnN0dW4peyByZXR1cm4gfSBpZignJyA9PT0gb25lW2lkXSl7IHJldHVybiB9IG9uZVtpZF0gPSAnJztcblx0XHRcdGlmKGNhdC5zb3VsIHx8IGNhdC5oYXMpeyBldmUub2ZmKCkgfSAvLyBUT0RPOiBQbHVyYWwgY2hhaW5zPyAvLyBlbHNlIHsgPy5vZmYoKSB9IC8vIGJldHRlciB0aGFuIG9uZSBjaGVjaz9cblx0XHRcdGNiLmNhbGwoJCwgdG1wLCBhdC5nZXQpO1xuXHRcdFx0Y2xlYXJUaW1lb3V0KG9uZVtpZF0pOyAvLyBjbGVhciBcIm5vdCBmb3VuZFwiIHNpbmNlIHRoZXkgb25seSBnZXQgc2V0IG9uIGNhdC4gLy8gVE9ETzogVGhpcyB3YXMgaGFja2lseSBhZGRlZCwgaXMgaXQgbmVjZXNzYXJ5IG9yIGltcG9ydGFudD8gUHJvYmFibHkgbm90LCBpbiBmdXR1cmUgdHJ5IHJlbW92aW5nIHRoaXMuIFdhcyBhZGRlZCBqdXN0IGFzIGEgc2FmZXR5IGZvciB0aGUgYCYmICFmYCBjaGVjay5cblx0XHR9O1xuXHR9LCB7b246IDF9KTtcblx0cmV0dXJuIGd1bjtcbn1cbmZ1bmN0aW9uIG5vbmUoZ3VuLG9wdCxjaGFpbil7XG5cdEd1bi5sb2cub25jZShcInZhbG9uY2VcIiwgXCJDaGFpbmFibGUgdmFsIGlzIGV4cGVyaW1lbnRhbCwgaXRzIGJlaGF2aW9yIGFuZCBBUEkgbWF5IGNoYW5nZSBtb3ZpbmcgZm9yd2FyZC4gUGxlYXNlIHBsYXkgd2l0aCBpdCBhbmQgcmVwb3J0IGJ1Z3MgYW5kIGlkZWFzIG9uIGhvdyB0byBpbXByb3ZlIGl0LlwiKTtcblx0KGNoYWluID0gZ3VuLmNoYWluKCkpLl8ubml4ID0gZ3VuLm9uY2UoZnVuY3Rpb24oZGF0YSwga2V5KXsgY2hhaW4uXy5vbignaW4nLCB0aGlzLl8pIH0pO1xuXHRjaGFpbi5fLmxleCA9IGd1bi5fLmxleDsgLy8gVE9ETzogQmV0dGVyIGFwcHJvYWNoIGluIGZ1dHVyZT8gVGhpcyBpcyBxdWljayBmb3Igbm93LlxuXHRyZXR1cm4gY2hhaW47XG59XG5cbkd1bi5jaGFpbi5vZmYgPSBmdW5jdGlvbigpe1xuXHQvLyBtYWtlIG9mZiBtb3JlIGFnZ3Jlc3NpdmUuIFdhcm5pbmcsIGl0IG1pZ2h0IGJhY2tmaXJlIVxuXHR2YXIgZ3VuID0gdGhpcywgYXQgPSBndW4uXywgdG1wO1xuXHR2YXIgY2F0ID0gYXQuYmFjaztcblx0aWYoIWNhdCl7IHJldHVybiB9XG5cdGF0LmFjayA9IDA7IC8vIHNvIGNhbiByZXN1YnNjcmliZS5cblx0aWYodG1wID0gY2F0Lm5leHQpe1xuXHRcdGlmKHRtcFthdC5nZXRdKXtcblx0XHRcdGRlbGV0ZSB0bXBbYXQuZ2V0XTtcblx0XHR9IGVsc2Uge1xuXG5cdFx0fVxuXHR9XG5cdC8vIFRPRE86IGRlbGV0ZSBjYXQub25lW21hcC5pZF0/XG5cdGlmKHRtcCA9IGNhdC5hc2spe1xuXHRcdGRlbGV0ZSB0bXBbYXQuZ2V0XTtcblx0fVxuXHRpZih0bXAgPSBjYXQucHV0KXtcblx0XHRkZWxldGUgdG1wW2F0LmdldF07XG5cdH1cblx0aWYodG1wID0gYXQuc291bCl7XG5cdFx0ZGVsZXRlIGNhdC5yb290LmdyYXBoW3RtcF07XG5cdH1cblx0aWYodG1wID0gYXQubWFwKXtcblx0XHRPYmplY3Qua2V5cyh0bXApLmZvckVhY2goZnVuY3Rpb24oaSxhdCl7IGF0ID0gdG1wW2ldOyAvL29ial9tYXAodG1wLCBmdW5jdGlvbihhdCl7XG5cdFx0XHRpZihhdC5saW5rKXtcblx0XHRcdFx0Y2F0LnJvb3QuJC5nZXQoYXQubGluaykub2ZmKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0aWYodG1wID0gYXQubmV4dCl7XG5cdFx0T2JqZWN0LmtleXModG1wKS5mb3JFYWNoKGZ1bmN0aW9uKGksbmVhdCl7IG5lYXQgPSB0bXBbaV07IC8vb2JqX21hcCh0bXAsIGZ1bmN0aW9uKG5lYXQpe1xuXHRcdFx0bmVhdC4kLm9mZigpO1xuXHRcdH0pO1xuXHR9XG5cdGF0Lm9uKCdvZmYnLCB7fSk7XG5cdHJldHVybiBndW47XG59XG52YXIgZW1wdHkgPSB7fSwgbm9vcCA9IGZ1bmN0aW9uKCl7fSwgdTtcblx0IiwiXG4vLyBPbiBldmVudCBlbWl0dGVyIGdlbmVyaWMgamF2YXNjcmlwdCB1dGlsaXR5LlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvbnRvKHRhZywgYXJnLCBhcyl7XG5cdGlmKCF0YWcpeyByZXR1cm4ge3RvOiBvbnRvfSB9XG5cdHZhciB1LCBmID0gJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgYXJnLCB0YWcgPSAodGhpcy50YWcgfHwgKHRoaXMudGFnID0ge30pKVt0YWddIHx8IGYgJiYgKFxuXHRcdHRoaXMudGFnW3RhZ10gPSB7dGFnOiB0YWcsIHRvOiBvbnRvLl8gPSB7IG5leHQ6IGZ1bmN0aW9uKGFyZyl7IHZhciB0bXA7XG5cdFx0XHRpZih0bXAgPSB0aGlzLnRvKXsgdG1wLm5leHQoYXJnKSB9XG5cdH19fSk7XG5cdGlmKGYpe1xuXHRcdHZhciBiZSA9IHtcblx0XHRcdG9mZjogb250by5vZmYgfHxcblx0XHRcdChvbnRvLm9mZiA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmKHRoaXMubmV4dCA9PT0gb250by5fLm5leHQpeyByZXR1cm4gITAgfVxuXHRcdFx0XHRpZih0aGlzID09PSB0aGlzLnRoZS5sYXN0KXtcblx0XHRcdFx0XHR0aGlzLnRoZS5sYXN0ID0gdGhpcy5iYWNrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMudG8uYmFjayA9IHRoaXMuYmFjaztcblx0XHRcdFx0dGhpcy5uZXh0ID0gb250by5fLm5leHQ7XG5cdFx0XHRcdHRoaXMuYmFjay50byA9IHRoaXMudG87XG5cdFx0XHRcdGlmKHRoaXMudGhlLmxhc3QgPT09IHRoaXMudGhlKXtcblx0XHRcdFx0XHRkZWxldGUgdGhpcy5vbi50YWdbdGhpcy50aGUudGFnXTtcblx0XHRcdFx0fVxuXHRcdFx0fSksXG5cdFx0XHR0bzogb250by5fLFxuXHRcdFx0bmV4dDogYXJnLFxuXHRcdFx0dGhlOiB0YWcsXG5cdFx0XHRvbjogdGhpcyxcblx0XHRcdGFzOiBhcyxcblx0XHR9O1xuXHRcdChiZS5iYWNrID0gdGFnLmxhc3QgfHwgdGFnKS50byA9IGJlO1xuXHRcdHJldHVybiB0YWcubGFzdCA9IGJlO1xuXHR9XG5cdGlmKCh0YWcgPSB0YWcudG8pICYmIHUgIT09IGFyZyl7IHRhZy5uZXh0KGFyZykgfVxuXHRyZXR1cm4gdGFnO1xufTtcblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9yb290Jyk7XG5HdW4uY2hhaW4ucHV0ID0gZnVuY3Rpb24oZGF0YSwgY2IsIGFzKXsgLy8gSSByZXdyb3RlIGl0IDopXG5cdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fLCByb290ID0gYXQucm9vdDtcblx0YXMgPSBhcyB8fCB7fTtcblx0YXMucm9vdCA9IGF0LnJvb3Q7XG5cdGFzLnJ1biB8fCAoYXMucnVuID0gcm9vdC5vbmNlKTtcblx0c3R1bihhcywgYXQuaWQpOyAvLyBzZXQgYSBmbGFnIGZvciByZWFkcyB0byBjaGVjayBpZiB0aGlzIGNoYWluIGlzIHdyaXRpbmcuXG5cdGFzLmFjayA9IGFzLmFjayB8fCBjYjtcblx0YXMudmlhID0gYXMudmlhIHx8IGd1bjtcblx0YXMuZGF0YSA9IGFzLmRhdGEgfHwgZGF0YTtcblx0YXMuc291bCB8fCAoYXMuc291bCA9IGF0LnNvdWwgfHwgKCdzdHJpbmcnID09IHR5cGVvZiBjYiAmJiBjYikpO1xuXHR2YXIgcyA9IGFzLnN0YXRlID0gYXMuc3RhdGUgfHwgR3VuLnN0YXRlKCk7XG5cdGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpeyBkYXRhKGZ1bmN0aW9uKGQpeyBhcy5kYXRhID0gZDsgZ3VuLnB1dCh1LHUsYXMpIH0pOyByZXR1cm4gZ3VuIH1cblx0aWYoIWFzLnNvdWwpeyByZXR1cm4gZ2V0KGFzKSwgZ3VuIH1cblx0YXMuJCA9IHJvb3QuJC5nZXQoYXMuc291bCk7IC8vIFRPRE86IFRoaXMgbWF5IG5vdCBhbGxvdyB1c2VyIGNoYWluaW5nIGFuZCBzaW1pbGFyP1xuXHRhcy50b2RvID0gW3tpdDogYXMuZGF0YSwgcmVmOiBhcy4kfV07XG5cdGFzLnR1cm4gPSBhcy50dXJuIHx8IHR1cm47XG5cdGFzLnJhbiA9IGFzLnJhbiB8fCByYW47XG5cdC8vdmFyIHBhdGggPSBbXTsgYXMudmlhLmJhY2soYXQgPT4geyBhdC5nZXQgJiYgcGF0aC5wdXNoKGF0LmdldC5zbGljZSgwLDkpKSB9KTsgcGF0aCA9IHBhdGgucmV2ZXJzZSgpLmpvaW4oJy4nKTtcblx0Ly8gVE9ETzogUGVyZiEgV2Ugb25seSBuZWVkIHRvIHN0dW4gY2hhaW5zIHRoYXQgYXJlIGJlaW5nIG1vZGlmaWVkLCBub3QgbmVjZXNzYXJpbHkgd3JpdHRlbiB0by5cblx0KGZ1bmN0aW9uIHdhbGsoKXtcblx0XHR2YXIgdG8gPSBhcy50b2RvLCBhdCA9IHRvLnBvcCgpLCBkID0gYXQuaXQsIGNpZCA9IGF0LnJlZiAmJiBhdC5yZWYuXy5pZCwgdiwgaywgY2F0LCB0bXAsIGc7XG5cdFx0c3R1bihhcywgYXQucmVmKTtcblx0XHRpZih0bXAgPSBhdC50b2RvKXtcblx0XHRcdGsgPSB0bXAucG9wKCk7IGQgPSBkW2tdO1xuXHRcdFx0aWYodG1wLmxlbmd0aCl7IHRvLnB1c2goYXQpIH1cblx0XHR9XG5cdFx0ayAmJiAodG8ucGF0aCB8fCAodG8ucGF0aCA9IFtdKSkucHVzaChrKTtcblx0XHRpZighKHYgPSB2YWxpZChkKSkgJiYgIShnID0gR3VuLmlzKGQpKSl7XG5cdFx0XHRpZighT2JqZWN0LnBsYWluKGQpKXsgcmFuLmVycihhcywgXCJJbnZhbGlkIGRhdGE6IFwiKyBjaGVjayhkKSArXCIgYXQgXCIgKyAoYXMudmlhLmJhY2soZnVuY3Rpb24oYXQpe2F0LmdldCAmJiB0bXAucHVzaChhdC5nZXQpfSwgdG1wID0gW10pIHx8IHRtcC5qb2luKCcuJykpKycuJysodG8ucGF0aHx8W10pLmpvaW4oJy4nKSk7IHJldHVybiB9XG5cdFx0XHR2YXIgc2VlbiA9IGFzLnNlZW4gfHwgKGFzLnNlZW4gPSBbXSksIGkgPSBzZWVuLmxlbmd0aDtcblx0XHRcdHdoaWxlKGktLSl7IGlmKGQgPT09ICh0bXAgPSBzZWVuW2ldKS5pdCl7IHYgPSBkID0gdG1wLmxpbms7IGJyZWFrIH0gfVxuXHRcdH1cblx0XHRpZihrICYmIHYpeyBhdC5ub2RlID0gc3RhdGVfaWZ5KGF0Lm5vZGUsIGssIHMsIGQpIH0gLy8gaGFuZGxlIHNvdWwgbGF0ZXIuXG5cdFx0ZWxzZSB7XG5cdFx0XHRpZighYXMuc2Vlbil7IHJhbi5lcnIoYXMsIFwiRGF0YSBhdCByb290IG9mIGdyYXBoIG11c3QgYmUgYSBub2RlIChhbiBvYmplY3QpLlwiKTsgcmV0dXJuIH1cblx0XHRcdGFzLnNlZW4ucHVzaChjYXQgPSB7aXQ6IGQsIGxpbms6IHt9LCB0b2RvOiBnPyBbXSA6IE9iamVjdC5rZXlzKGQpLnNvcnQoKS5yZXZlcnNlKCksIHBhdGg6ICh0by5wYXRofHxbXSkuc2xpY2UoKSwgdXA6IGF0fSk7IC8vIEFueSBwZXJmIHJlYXNvbnMgdG8gQ1BVIHNjaGVkdWxlIHRoaXMgLmtleXMoID9cblx0XHRcdGF0Lm5vZGUgPSBzdGF0ZV9pZnkoYXQubm9kZSwgaywgcywgY2F0LmxpbmspO1xuXHRcdFx0IWcgJiYgY2F0LnRvZG8ubGVuZ3RoICYmIHRvLnB1c2goY2F0KTtcblx0XHRcdC8vIC0tLS0tLS0tLS0tLS0tLVxuXHRcdFx0dmFyIGlkID0gYXMuc2Vlbi5sZW5ndGg7XG5cdFx0XHQoYXMud2FpdCB8fCAoYXMud2FpdCA9IHt9KSlbaWRdID0gJyc7XG5cdFx0XHR0bXAgPSAoY2F0LnJlZiA9IChnPyBkIDogaz8gYXQucmVmLmdldChrKSA6IGF0LnJlZikpLl87XG5cdFx0XHQodG1wID0gKGQgJiYgKGQuX3x8JycpWycjJ10pIHx8IHRtcC5zb3VsIHx8IHRtcC5saW5rKT8gcmVzb2x2ZSh7c291bDogdG1wfSkgOiBjYXQucmVmLmdldChyZXNvbHZlLCB7cnVuOiBhcy5ydW4sIC8qaGF0Y2g6IDAsKi8gdjIwMjA6MSwgb3V0OntnZXQ6eycuJzonICd9fX0pOyAvLyBUT0RPOiBCVUchIFRoaXMgc2hvdWxkIGJlIHJlc29sdmUgT05MWSBzb3VsIHRvIHByZXZlbnQgZnVsbCBkYXRhIGZyb20gYmVpbmcgbG9hZGVkLiAvLyBGaXhlZCBub3c/XG5cdFx0XHQvL3NldFRpbWVvdXQoZnVuY3Rpb24oKXsgaWYoRil7IHJldHVybiB9IGNvbnNvbGUubG9nKFwiSSBIQVZFIE5PVCBCRUVOIENBTExFRCFcIiwgcGF0aCwgaWQsIGNhdC5yZWYuXy5pZCwgaykgfSwgOTAwMCk7IHZhciBGOyAvLyBNQUtFIFNVUkUgVE8gQUREIEYgPSAxIGJlbG93IVxuXHRcdFx0ZnVuY3Rpb24gcmVzb2x2ZShtc2csIGV2ZSl7XG5cdFx0XHRcdHZhciBlbmQgPSBjYXQubGlua1snIyddO1xuXHRcdFx0XHRpZihldmUpeyBldmUub2ZmKCk7IGV2ZS5yaWQobXNnKSB9IC8vIFRPRE86IFRvbyBlYXJseSEgQ2hlY2sgYWxsIHBlZXJzIGFjayBub3QgZm91bmQuXG5cdFx0XHRcdC8vIFRPRE86IEJVRyBtYXliZT8gTWFrZSBzdXJlIHRoaXMgZG9lcyBub3QgcGljayB1cCBhIGxpbmsgY2hhbmdlIHdpcGUsIHRoYXQgaXQgdXNlcyB0aGUgY2hhbmdpZ24gbGluayBpbnN0ZWFkLlxuXHRcdFx0XHR2YXIgc291bCA9IGVuZCB8fCBtc2cuc291bCB8fCAodG1wID0gKG1zZy4kJHx8bXNnLiQpLl98fCcnKS5zb3VsIHx8IHRtcC5saW5rIHx8ICgodG1wID0gdG1wLnB1dHx8JycpLl98fCcnKVsnIyddIHx8IHRtcFsnIyddIHx8ICgoKHRtcCA9IG1zZy5wdXR8fCcnKSAmJiBtc2cuJCQpPyB0bXBbJyMnXSA6ICh0bXBbJz0nXXx8dG1wWyc6J118fCcnKVsnIyddKTtcblx0XHRcdFx0IWVuZCAmJiBzdHVuKGFzLCBtc2cuJCk7XG5cdFx0XHRcdGlmKCFzb3VsICYmICFhdC5saW5rWycjJ10peyAvLyBjaGVjayBzb3VsIGxpbmsgYWJvdmUgdXNcblx0XHRcdFx0XHQoYXQud2FpdCB8fCAoYXQud2FpdCA9IFtdKSkucHVzaChmdW5jdGlvbigpeyByZXNvbHZlKG1zZywgZXZlKSB9KSAvLyB3YWl0XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFzb3VsKXtcblx0XHRcdFx0XHRzb3VsID0gW107XG5cdFx0XHRcdFx0KG1zZy4kJHx8bXNnLiQpLmJhY2soZnVuY3Rpb24oYXQpe1xuXHRcdFx0XHRcdFx0aWYodG1wID0gYXQuc291bCB8fCBhdC5saW5rKXsgcmV0dXJuIHNvdWwucHVzaCh0bXApIH1cblx0XHRcdFx0XHRcdHNvdWwucHVzaChhdC5nZXQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHNvdWwgPSBzb3VsLnJldmVyc2UoKS5qb2luKCcvJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0LmxpbmtbJyMnXSA9IHNvdWw7XG5cdFx0XHRcdCFnICYmICgoKGFzLmdyYXBoIHx8IChhcy5ncmFwaCA9IHt9KSlbc291bF0gPSAoY2F0Lm5vZGUgfHwgKGNhdC5ub2RlID0ge186e319KSkpLl9bJyMnXSA9IHNvdWwpO1xuXHRcdFx0XHRkZWxldGUgYXMud2FpdFtpZF07XG5cdFx0XHRcdGNhdC53YWl0ICYmIHNldFRpbWVvdXQuZWFjaChjYXQud2FpdCwgZnVuY3Rpb24oY2IpeyBjYiAmJiBjYigpIH0pO1xuXHRcdFx0XHRhcy5yYW4oYXMpO1xuXHRcdFx0fTtcblx0XHRcdC8vIC0tLS0tLS0tLS0tLS0tLVxuXHRcdH1cblx0XHRpZighdG8ubGVuZ3RoKXsgcmV0dXJuIGFzLnJhbihhcykgfVxuXHRcdGFzLnR1cm4od2Fsayk7XG5cdH0oKSk7XG5cdHJldHVybiBndW47XG59XG5cbmZ1bmN0aW9uIHN0dW4oYXMsIGlkKXtcblx0aWYoIWlkKXsgcmV0dXJuIH0gaWQgPSAoaWQuX3x8JycpLmlkfHxpZDtcblx0dmFyIHJ1biA9IGFzLnJvb3Quc3R1biB8fCAoYXMucm9vdC5zdHVuID0ge29uOiBHdW4ub259KSwgdGVzdCA9IHt9LCB0bXA7XG5cdGFzLnN0dW4gfHwgKGFzLnN0dW4gPSBydW4ub24oJ3N0dW4nLCBmdW5jdGlvbigpeyB9KSk7XG5cdGlmKHRtcCA9IHJ1bi5vbignJytpZCkpeyB0bXAudGhlLmxhc3QubmV4dCh0ZXN0KSB9XG5cdGlmKHRlc3QucnVuID49IGFzLnJ1bil7IHJldHVybiB9XG5cdHJ1bi5vbignJytpZCwgZnVuY3Rpb24odGVzdCl7XG5cdFx0aWYoYXMuc3R1bi5lbmQpe1xuXHRcdFx0dGhpcy5vZmYoKTtcblx0XHRcdHRoaXMudG8ubmV4dCh0ZXN0KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGVzdC5ydW4gPSB0ZXN0LnJ1biB8fCBhcy5ydW47XG5cdFx0dGVzdC5zdHVuID0gdGVzdC5zdHVuIHx8IGFzLnN0dW47IHJldHVybjtcblx0XHRpZih0aGlzLnRvLnRvKXtcblx0XHRcdHRoaXMudGhlLmxhc3QubmV4dCh0ZXN0KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGVzdC5zdHVuID0gYXMuc3R1bjtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIHJhbihhcyl7XG5cdGlmKGFzLmVycil7IHJhbi5lbmQoYXMuc3R1biwgYXMucm9vdCk7IHJldHVybiB9IC8vIG1vdmUgbG9nIGhhbmRsZSBoZXJlLlxuXHRpZihhcy50b2RvLmxlbmd0aCB8fCBhcy5lbmQgfHwgIU9iamVjdC5lbXB0eShhcy53YWl0KSl7IHJldHVybiB9IGFzLmVuZCA9IDE7XG5cdC8vKGFzLnJldHJ5ID0gZnVuY3Rpb24oKXsgYXMuYWNrcyA9IDA7XG5cdHZhciBjYXQgPSAoYXMuJC5iYWNrKC0xKS5fKSwgcm9vdCA9IGNhdC5yb290LCBhc2sgPSBjYXQuYXNrKGZ1bmN0aW9uKGFjayl7XG5cdFx0cm9vdC5vbignYWNrJywgYWNrKTtcblx0XHRpZihhY2suZXJyICYmICFhY2subGFjayl7IEd1bi5sb2coYWNrKSB9XG5cdFx0aWYoKythY2tzID4gKGFzLmFja3MgfHwgMCkpeyB0aGlzLm9mZigpIH0gLy8gQWRqdXN0YWJsZSBBQ0tzISBPbmx5IDEgYnkgZGVmYXVsdC5cblx0XHRpZighYXMuYWNrKXsgcmV0dXJuIH1cblx0XHRhcy5hY2soYWNrLCB0aGlzKTtcblx0fSwgYXMub3B0KSwgYWNrcyA9IDAsIHN0dW4gPSBhcy5zdHVuLCB0bXA7XG5cdCh0bXAgPSBmdW5jdGlvbigpeyAvLyB0aGlzIGlzIG5vdCBvZmZpY2lhbCB5ZXQsIGJ1dCBxdWljayBzb2x1dGlvbiB0byBoYWNrIGluIGZvciBub3cuXG5cdFx0aWYoIXN0dW4peyByZXR1cm4gfVxuXHRcdHJhbi5lbmQoc3R1biwgcm9vdCk7XG5cdFx0c2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKHN0dW4gPSBzdHVuLmFkZHx8JycpLCBmdW5jdGlvbihjYil7IGlmKGNiID0gc3R1bltjYl0pe2NiKCl9IH0pOyAvLyByZXN1bWUgdGhlIHN0dW5uZWQgcmVhZHMgLy8gQW55IHBlcmYgcmVhc29ucyB0byBDUFUgc2NoZWR1bGUgdGhpcyAua2V5cyggP1xuXHR9KS5oYXRjaCA9IHRtcDsgLy8gdGhpcyBpcyBub3Qgb2ZmaWNpYWwgeWV0IF5cblx0Ly9jb25zb2xlLmxvZygxLCBcIlBVVFwiLCBhcy5ydW4sIGFzLmdyYXBoKTtcblx0aWYoYXMuYWNrICYmICFhcy5vayl7IGFzLm9rID0gYXMuYWNrcyB8fCA5IH0gLy8gVE9ETzogSW4gZnV0dXJlISBSZW1vdmUgdGhpcyEgVGhpcyBpcyBqdXN0IG9sZCBBUEkgc3VwcG9ydC5cblx0KGFzLnZpYS5fKS5vbignb3V0Jywge3B1dDogYXMub3V0ID0gYXMuZ3JhcGgsIG9rOiBhcy5vayAmJiB7J0AnOiBhcy5vaysxfSwgb3B0OiBhcy5vcHQsICcjJzogYXNrLCBfOiB0bXB9KTtcblx0Ly99KSgpO1xufTsgcmFuLmVuZCA9IGZ1bmN0aW9uKHN0dW4scm9vdCl7XG5cdHN0dW4uZW5kID0gbm9vcDsgLy8gbGlrZSB3aXRoIHRoZSBlYXJsaWVyIGlkLCBjaGVhcGVyIHRvIG1ha2UgdGhpcyBmbGFnIGEgZnVuY3Rpb24gc28gYmVsb3cgY2FsbGJhY2tzIGRvIG5vdCBoYXZlIHRvIGRvIGFuIGV4dHJhIHR5cGUgY2hlY2suXG5cdGlmKHN0dW4udGhlLnRvID09PSBzdHVuICYmIHN0dW4gPT09IHN0dW4udGhlLmxhc3QpeyBkZWxldGUgcm9vdC5zdHVuIH1cblx0c3R1bi5vZmYoKTtcbn07IHJhbi5lcnIgPSBmdW5jdGlvbihhcywgZXJyKXtcblx0KGFzLmFja3x8bm9vcCkuY2FsbChhcywgYXMub3V0ID0geyBlcnI6IGFzLmVyciA9IEd1bi5sb2coZXJyKSB9KTtcblx0YXMucmFuKGFzKTtcbn1cblxuZnVuY3Rpb24gZ2V0KGFzKXtcblx0dmFyIGF0ID0gYXMudmlhLl8sIHRtcDtcblx0YXMudmlhID0gYXMudmlhLmJhY2soZnVuY3Rpb24oYXQpe1xuXHRcdGlmKGF0LnNvdWwgfHwgIWF0LmdldCl7IHJldHVybiBhdC4kIH1cblx0XHR0bXAgPSBhcy5kYXRhOyAoYXMuZGF0YSA9IHt9KVthdC5nZXRdID0gdG1wO1xuXHR9KTtcblx0aWYoIWFzLnZpYSB8fCAhYXMudmlhLl8uc291bCl7XG5cdFx0YXMudmlhID0gYXQucm9vdC4kLmdldCgoKGFzLmRhdGF8fCcnKS5ffHwnJylbJyMnXSB8fCBhdC4kLmJhY2soJ29wdC51dWlkJykoKSlcblx0fVxuXHRhcy52aWEucHV0KGFzLmRhdGEsIGFzLmFjaywgYXMpO1xuXHRcblxuXHRyZXR1cm47XG5cdGlmKGF0LmdldCAmJiBhdC5iYWNrLnNvdWwpe1xuXHRcdHRtcCA9IGFzLmRhdGE7XG5cdFx0YXMudmlhID0gYXQuYmFjay4kO1xuXHRcdChhcy5kYXRhID0ge30pW2F0LmdldF0gPSB0bXA7IFxuXHRcdGFzLnZpYS5wdXQoYXMuZGF0YSwgYXMuYWNrLCBhcyk7XG5cdFx0cmV0dXJuO1xuXHR9XG59XG5mdW5jdGlvbiBjaGVjayhkLCB0bXApeyByZXR1cm4gKChkICYmICh0bXAgPSBkLmNvbnN0cnVjdG9yKSAmJiB0bXAubmFtZSkgfHwgdHlwZW9mIGQpIH1cblxudmFyIHUsIGVtcHR5ID0ge30sIG5vb3AgPSBmdW5jdGlvbigpe30sIHR1cm4gPSBzZXRUaW1lb3V0LnR1cm4sIHZhbGlkID0gR3VuLnZhbGlkLCBzdGF0ZV9pZnkgPSBHdW4uc3RhdGUuaWZ5O1xudmFyIGlpZmUgPSBmdW5jdGlvbihmbixhcyl7Zm4uY2FsbChhc3x8ZW1wdHkpfVxuXHQiLCJcblxuZnVuY3Rpb24gR3VuKG8pe1xuXHRpZihvIGluc3RhbmNlb2YgR3VuKXsgcmV0dXJuICh0aGlzLl8gPSB7JDogdGhpc30pLiQgfVxuXHRpZighKHRoaXMgaW5zdGFuY2VvZiBHdW4pKXsgcmV0dXJuIG5ldyBHdW4obykgfVxuXHRyZXR1cm4gR3VuLmNyZWF0ZSh0aGlzLl8gPSB7JDogdGhpcywgb3B0OiBvfSk7XG59XG5cbkd1bi5pcyA9IGZ1bmN0aW9uKCQpeyByZXR1cm4gKCQgaW5zdGFuY2VvZiBHdW4pIHx8ICgkICYmICQuXyAmJiAoJCA9PT0gJC5fLiQpKSB8fCBmYWxzZSB9XG5cbkd1bi52ZXJzaW9uID0gMC4yMDIwO1xuXG5HdW4uY2hhaW4gPSBHdW4ucHJvdG90eXBlO1xuR3VuLmNoYWluLnRvSlNPTiA9IGZ1bmN0aW9uKCl7fTtcblxucmVxdWlyZSgnLi9zaGltJyk7XG5HdW4udmFsaWQgPSByZXF1aXJlKCcuL3ZhbGlkJyk7XG5HdW4uc3RhdGUgPSByZXF1aXJlKCcuL3N0YXRlJyk7XG5HdW4ub24gPSByZXF1aXJlKCcuL29udG8nKTtcbkd1bi5kdXAgPSByZXF1aXJlKCcuL2R1cCcpO1xuR3VuLmFzayA9IHJlcXVpcmUoJy4vYXNrJyk7XG5cbjsoZnVuY3Rpb24oKXtcblx0R3VuLmNyZWF0ZSA9IGZ1bmN0aW9uKGF0KXtcblx0XHRhdC5yb290ID0gYXQucm9vdCB8fCBhdDtcblx0XHRhdC5ncmFwaCA9IGF0LmdyYXBoIHx8IHt9O1xuXHRcdGF0Lm9uID0gYXQub24gfHwgR3VuLm9uO1xuXHRcdGF0LmFzayA9IGF0LmFzayB8fCBHdW4uYXNrO1xuXHRcdGF0LmR1cCA9IGF0LmR1cCB8fCBHdW4uZHVwKCk7XG5cdFx0dmFyIGd1biA9IGF0LiQub3B0KGF0Lm9wdCk7XG5cdFx0aWYoIWF0Lm9uY2Upe1xuXHRcdFx0YXQub24oJ2luJywgdW5pdmVyc2UsIGF0KTtcblx0XHRcdGF0Lm9uKCdvdXQnLCB1bml2ZXJzZSwgYXQpO1xuXHRcdFx0YXQub24oJ3B1dCcsIG1hcCwgYXQpO1xuXHRcdFx0R3VuLm9uKCdjcmVhdGUnLCBhdCk7XG5cdFx0XHRhdC5vbignY3JlYXRlJywgYXQpO1xuXHRcdH1cblx0XHRhdC5vbmNlID0gMTtcblx0XHRyZXR1cm4gZ3VuO1xuXHR9XG5cdGZ1bmN0aW9uIHVuaXZlcnNlKG1zZyl7XG5cdFx0Ly8gVE9ETzogQlVHISBtc2cub3V0ID0gbnVsbCBiZWluZyBzZXQhXG5cdFx0Ly9pZighRil7IHZhciBldmUgPSB0aGlzOyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHVuaXZlcnNlLmNhbGwoZXZlLCBtc2csMSkgfSxNYXRoLnJhbmRvbSgpICogMTAwKTtyZXR1cm47IH0gLy8gQUREIEYgVE8gUEFSQU1TIVxuXHRcdGlmKCFtc2cpeyByZXR1cm4gfVxuXHRcdGlmKG1zZy5vdXQgPT09IHVuaXZlcnNlKXsgdGhpcy50by5uZXh0KG1zZyk7IHJldHVybiB9XG5cdFx0dmFyIGV2ZSA9IHRoaXMsIGFzID0gZXZlLmFzLCBhdCA9IGFzLmF0IHx8IGFzLCBndW4gPSBhdC4kLCBkdXAgPSBhdC5kdXAsIHRtcCwgREJHID0gbXNnLkRCRztcblx0XHQodG1wID0gbXNnWycjJ10pIHx8ICh0bXAgPSBtc2dbJyMnXSA9IHRleHRfcmFuZCg5KSk7XG5cdFx0aWYoZHVwLmNoZWNrKHRtcCkpeyByZXR1cm4gfSBkdXAudHJhY2sodG1wKTtcblx0XHR0bXAgPSBtc2cuXzsgbXNnLl8gPSAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdG1wKT8gdG1wIDogZnVuY3Rpb24oKXt9O1xuXHRcdChtc2cuJCAmJiAobXNnLiQgPT09IChtc2cuJC5ffHwnJykuJCkpIHx8IChtc2cuJCA9IGd1bik7XG5cdFx0aWYobXNnWydAJ10gJiYgIW1zZy5wdXQpeyBhY2sobXNnKSB9XG5cdFx0aWYoIWF0LmFzayhtc2dbJ0AnXSwgbXNnKSl7IC8vIGlzIHRoaXMgbWFjaGluZSBsaXN0ZW5pbmcgZm9yIGFuIGFjaz9cblx0XHRcdERCRyAmJiAoREJHLnUgPSArbmV3IERhdGUpO1xuXHRcdFx0aWYobXNnLnB1dCl7IHB1dChtc2cpOyByZXR1cm4gfSBlbHNlXG5cdFx0XHRpZihtc2cuZ2V0KXsgR3VuLm9uLmdldChtc2csIGd1bikgfVxuXHRcdH1cblx0XHREQkcgJiYgKERCRy51YyA9ICtuZXcgRGF0ZSk7XG5cdFx0ZXZlLnRvLm5leHQobXNnKTtcblx0XHREQkcgJiYgKERCRy51YSA9ICtuZXcgRGF0ZSk7XG5cdFx0aWYobXNnLm50cyB8fCBtc2cuTlRTKXsgcmV0dXJuIH0gLy8gVE9ETzogVGhpcyBzaG91bGRuJ3QgYmUgaW4gY29yZSwgYnV0IGZhc3Qgd2F5IHRvIHByZXZlbnQgTlRTIHNwcmVhZC4gRGVsZXRlIHRoaXMgbGluZSBhZnRlciBhbGwgcGVlcnMgaGF2ZSB1cGdyYWRlZCB0byBuZXdlciB2ZXJzaW9ucy5cblx0XHRtc2cub3V0ID0gdW5pdmVyc2U7IGF0Lm9uKCdvdXQnLCBtc2cpO1xuXHRcdERCRyAmJiAoREJHLnVlID0gK25ldyBEYXRlKTtcblx0fVxuXHRmdW5jdGlvbiBwdXQobXNnKXtcblx0XHRpZighbXNnKXsgcmV0dXJuIH1cblx0XHR2YXIgY3R4ID0gbXNnLl98fCcnLCByb290ID0gY3R4LnJvb3QgPSAoKGN0eC4kID0gbXNnLiR8fCcnKS5ffHwnJykucm9vdDtcblx0XHRpZihtc2dbJ0AnXSAmJiBjdHguZmFpdGggJiYgIWN0eC5taXNzKXsgLy8gVE9ETzogQVhFIG1heSBzcGxpdC9yb3V0ZSBiYXNlZCBvbiAncHV0JyB3aGF0IHNob3VsZCB3ZSBkbyBoZXJlPyBEZXRlY3QgQCBpbiBBWEU/IEkgdGhpbmsgd2UgZG9uJ3QgaGF2ZSB0byB3b3JyeSwgYXMgREFNIHdpbGwgcm91dGUgaXQgb24gQC5cblx0XHRcdG1zZy5vdXQgPSB1bml2ZXJzZTtcblx0XHRcdHJvb3Qub24oJ291dCcsIG1zZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGN0eC5sYXRjaCA9IHJvb3QuaGF0Y2g7IGN0eC5tYXRjaCA9IHJvb3QuaGF0Y2ggPSBbXTtcblx0XHR2YXIgcHV0ID0gbXNnLnB1dDtcblx0XHR2YXIgREJHID0gY3R4LkRCRyA9IG1zZy5EQkcsIFMgPSArbmV3IERhdGU7IENUID0gQ1QgfHwgUztcblx0XHRpZihwdXRbJyMnXSAmJiBwdXRbJy4nXSl7IC8qcm9vdCAmJiByb290Lm9uKCdwdXQnLCBtc2cpOyovIHJldHVybiB9IC8vIFRPRE86IEJVRyEgVGhpcyBuZWVkcyB0byBjYWxsIEhBTSBpbnN0ZWFkLlxuXHRcdERCRyAmJiAoREJHLnAgPSBTKTtcblx0XHRjdHhbJyMnXSA9IG1zZ1snIyddO1xuXHRcdGN0eC5tc2cgPSBtc2c7XG5cdFx0Y3R4LmFsbCA9IDA7XG5cdFx0Y3R4LnN0dW4gPSAxO1xuXHRcdHZhciBubCA9IE9iamVjdC5rZXlzKHB1dCk7Ly8uc29ydCgpOyAvLyBUT0RPOiBUaGlzIGlzIHVuYm91bmRlZCBvcGVyYXRpb24sIGxhcmdlIGdyYXBocyB3aWxsIGJlIHNsb3dlci4gV3JpdGUgb3VyIG93biBDUFUgc2NoZWR1bGVkIHNvcnQ/IE9yIHNvbWVob3cgZG8gaXQgaW4gYmVsb3c/IEtleXMgaXRzZWxmIGlzIG5vdCBPKDEpIGVpdGhlciwgY3JlYXRlIEVTNSBzaGltIG92ZXIgP3dlYWsgbWFwPyBvciBjdXN0b20gd2hpY2ggaXMgY29uc3RhbnQuXG5cdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8Y3R4KS5wayA9ICtuZXcgRGF0ZSkgLSBTLCAncHV0IHNvcnQnKTtcblx0XHR2YXIgbmkgPSAwLCBuaiwga2wsIHNvdWwsIG5vZGUsIHN0YXRlcywgZXJyLCB0bXA7XG5cdFx0KGZ1bmN0aW9uIHBvcChvKXtcblx0XHRcdGlmKG5qICE9IG5pKXsgbmogPSBuaTtcblx0XHRcdFx0aWYoIShzb3VsID0gbmxbbmldKSl7XG5cdFx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8Y3R4KS5wZCA9ICtuZXcgRGF0ZSkgLSBTLCAncHV0Jyk7XG5cdFx0XHRcdFx0ZmlyZShjdHgpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZighKG5vZGUgPSBwdXRbc291bF0pKXsgZXJyID0gRVJSK2N1dChzb3VsKStcIm5vIG5vZGUuXCIgfSBlbHNlXG5cdFx0XHRcdGlmKCEodG1wID0gbm9kZS5fKSl7IGVyciA9IEVSUitjdXQoc291bCkrXCJubyBtZXRhLlwiIH0gZWxzZVxuXHRcdFx0XHRpZihzb3VsICE9PSB0bXBbJyMnXSl7IGVyciA9IEVSUitjdXQoc291bCkrXCJzb3VsIG5vdCBzYW1lLlwiIH0gZWxzZVxuXHRcdFx0XHRpZighKHN0YXRlcyA9IHRtcFsnPiddKSl7IGVyciA9IEVSUitjdXQoc291bCkrXCJubyBzdGF0ZS5cIiB9XG5cdFx0XHRcdGtsID0gT2JqZWN0LmtleXMobm9kZXx8e30pOyAvLyBUT0RPOiAua2V5cyggaXMgc2xvd1xuXHRcdFx0fVxuXHRcdFx0aWYoZXJyKXtcblx0XHRcdFx0bXNnLmVyciA9IGN0eC5lcnIgPSBlcnI7IC8vIGludmFsaWQgZGF0YSBzaG91bGQgZXJyb3IgYW5kIHN0dW4gdGhlIG1lc3NhZ2UuXG5cdFx0XHRcdGZpcmUoY3R4KTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImhhbmRsZSBlcnJvciFcIiwgZXJyKSAvLyBoYW5kbGUhXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBpID0gMCwga2V5OyBvID0gbyB8fCAwO1xuXHRcdFx0d2hpbGUobysrIDwgOSAmJiAoa2V5ID0ga2xbaSsrXSkpe1xuXHRcdFx0XHRpZignXycgPT09IGtleSl7IGNvbnRpbnVlIH1cblx0XHRcdFx0dmFyIHZhbCA9IG5vZGVba2V5XSwgc3RhdGUgPSBzdGF0ZXNba2V5XTtcblx0XHRcdFx0aWYodSA9PT0gc3RhdGUpeyBlcnIgPSBFUlIrY3V0KGtleSkrXCJvblwiK2N1dChzb3VsKStcIm5vIHN0YXRlLlwiOyBicmVhayB9XG5cdFx0XHRcdGlmKCF2YWxpZCh2YWwpKXsgZXJyID0gRVJSK2N1dChrZXkpK1wib25cIitjdXQoc291bCkrXCJiYWQgXCIrKHR5cGVvZiB2YWwpK2N1dCh2YWwpOyBicmVhayB9XG5cdFx0XHRcdC8vY3R4LmFsbCsrOyAvL2N0eC5hY2tbc291bCtrZXldID0gJyc7XG5cdFx0XHRcdGhhbSh2YWwsIGtleSwgc291bCwgc3RhdGUsIG1zZyk7XG5cdFx0XHRcdCsrQzsgLy8gY291cnRlc3kgY291bnQ7XG5cdFx0XHR9XG5cdFx0XHRpZigoa2wgPSBrbC5zbGljZShpKSkubGVuZ3RoKXsgdHVybihwb3ApOyByZXR1cm4gfVxuXHRcdFx0KytuaTsga2wgPSBudWxsOyBwb3Aobyk7XG5cdFx0fSgpKTtcblx0fSBHdW4ub24ucHV0ID0gcHV0O1xuXHQvLyBUT0RPOiBNQVJLISEhIGNsb2NrIGJlbG93LCByZWNvbm5lY3Qgc3luYywgU0VBIGNlcnRpZnkgd2lyZSBtZXJnZSwgVXNlci5hdXRoIHRha2luZyBtdWx0aXBsZSB0aW1lcywgLy8gbXNnIHB1dCwgcHV0LCBzYXkgYWNrLCBoZWFyIGxvb3AuLi5cblx0Ly8gV0FTSVMgQlVHISBsb2NhbCBwZWVyIG5vdCBhY2suIC5vZmYgb3RoZXIgcGVvcGxlOiAub3BlblxuXHRmdW5jdGlvbiBoYW0odmFsLCBrZXksIHNvdWwsIHN0YXRlLCBtc2cpe1xuXHRcdHZhciBjdHggPSBtc2cuX3x8JycsIHJvb3QgPSBjdHgucm9vdCwgZ3JhcGggPSByb290LmdyYXBoLCBsb3QsIHRtcDtcblx0XHR2YXIgdmVydGV4ID0gZ3JhcGhbc291bF0gfHwgZW1wdHksIHdhcyA9IHN0YXRlX2lzKHZlcnRleCwga2V5LCAxKSwga25vd24gPSB2ZXJ0ZXhba2V5XTtcblx0XHRcblx0XHR2YXIgREJHID0gY3R4LkRCRzsgaWYodG1wID0gY29uc29sZS5TVEFUKXsgaWYoIWdyYXBoW3NvdWxdIHx8ICFrbm93bil7IHRtcC5oYXMgPSAodG1wLmhhcyB8fCAwKSArIDEgfSB9XG5cblx0XHR2YXIgbm93ID0gU3RhdGUoKSwgdTtcblx0XHRpZihzdGF0ZSA+IG5vdyl7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGhhbSh2YWwsIGtleSwgc291bCwgc3RhdGUsIG1zZykgfSwgKHRtcCA9IHN0YXRlIC0gbm93KSA+IE1EPyBNRCA6IHRtcCk7IC8vIE1heCBEZWZlciAzMmJpdC4gOihcblx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoKChEQkd8fGN0eCkuSGYgPSArbmV3IERhdGUpLCB0bXAsICdmdXR1cmUnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYoc3RhdGUgPCB3YXMpeyAvKm9sZDsqLyBpZighY3R4Lm1pc3MpeyByZXR1cm4gfSB9IC8vIGJ1dCBzb21lIGNoYWlucyBoYXZlIGEgY2FjaGUgbWlzcyB0aGF0IG5lZWQgdG8gcmUtZmlyZS4gLy8gVE9ETzogSW1wcm92ZSBpbiBmdXR1cmUuIC8vIGZvciBBWEUgdGhpcyB3b3VsZCByZWR1Y2UgcmVicm9hZGNhc3QsIGJ1dCBHVU4gZG9lcyBpdCBvbiBtZXNzYWdlIGZvcndhcmRpbmcuXG5cdFx0aWYoIWN0eC5mYWl0aCl7IC8vIFRPRE86IEJVRz8gQ2FuIHRoaXMgYmUgdXNlZCBmb3IgY2FjaGUgbWlzcyBhcyB3ZWxsPyAvLyBZZXMgdGhpcyB3YXMgYSBidWcsIG5lZWQgdG8gY2hlY2sgY2FjaGUgbWlzcyBmb3IgUkFEIHRlc3RzLCBidXQgc2hvdWxkIHdlIGNhcmUgYWJvdXQgdGhlIGZhaXRoIGNoZWNrIG5vdz8gUHJvYmFibHkgbm90LlxuXHRcdFx0aWYoc3RhdGUgPT09IHdhcyAmJiAodmFsID09PSBrbm93biB8fCBMKHZhbCkgPD0gTChrbm93bikpKXsgLypjb25zb2xlLmxvZyhcInNhbWVcIik7Ki8gLypzYW1lOyovIGlmKCFjdHgubWlzcyl7IHJldHVybiB9IH0gLy8gc2FtZVxuXHRcdH1cblx0XHRjdHguc3R1bisrOyAvLyBUT0RPOiAnZm9yZ2V0JyBmZWF0dXJlIGluIFNFQSB0aWVkIHRvIHRoaXMsIGJhZCBhcHByb2FjaCwgYnV0IGhhY2tlZCBpbiBmb3Igbm93LiBBbnkgY2hhbmdlcyBoZXJlIG11c3QgdXBkYXRlIHRoZXJlLlxuXHRcdHZhciBhaWQgPSBtc2dbJyMnXStjdHguYWxsKyssIGlkID0ge3RvU3RyaW5nOiBmdW5jdGlvbigpeyByZXR1cm4gYWlkIH0sIF86IGN0eH07IGlkLnRvSlNPTiA9IGlkLnRvU3RyaW5nOyAvLyB0aGlzICp0cmljayogbWFrZXMgaXQgY29tcGF0aWJsZSBiZXR3ZWVuIG9sZCAmIG5ldyB2ZXJzaW9ucy5cblx0XHRyb290LmR1cC50cmFjayhpZClbJyMnXSA9IG1zZ1snIyddOyAvLyBmaXhlcyBuZXcgT0sgYWNrcyBmb3IgUlBDIGxpa2UgUlRDLlxuXHRcdERCRyAmJiAoREJHLnBoID0gREJHLnBoIHx8ICtuZXcgRGF0ZSk7XG5cdFx0cm9vdC5vbigncHV0JywgeycjJzogaWQsICdAJzogbXNnWydAJ10sIHB1dDogeycjJzogc291bCwgJy4nOiBrZXksICc6JzogdmFsLCAnPic6IHN0YXRlfSwgb2s6IG1zZy5vaywgXzogY3R4fSk7XG5cdH1cblx0ZnVuY3Rpb24gbWFwKG1zZyl7XG5cdFx0dmFyIERCRzsgaWYoREJHID0gKG1zZy5ffHwnJykuREJHKXsgREJHLnBhID0gK25ldyBEYXRlOyBEQkcucG0gPSBEQkcucG0gfHwgK25ldyBEYXRlfVxuICAgICAgXHR2YXIgZXZlID0gdGhpcywgcm9vdCA9IGV2ZS5hcywgZ3JhcGggPSByb290LmdyYXBoLCBjdHggPSBtc2cuXywgcHV0ID0gbXNnLnB1dCwgc291bCA9IHB1dFsnIyddLCBrZXkgPSBwdXRbJy4nXSwgdmFsID0gcHV0Wyc6J10sIHN0YXRlID0gcHV0Wyc+J10sIGlkID0gbXNnWycjJ10sIHRtcDtcbiAgICAgIFx0aWYoKHRtcCA9IGN0eC5tc2cpICYmICh0bXAgPSB0bXAucHV0KSAmJiAodG1wID0gdG1wW3NvdWxdKSl7IHN0YXRlX2lmeSh0bXAsIGtleSwgc3RhdGUsIHZhbCwgc291bCkgfSAvLyBuZWNlc3NhcnkhIG9yIGVsc2Ugb3V0IG1lc3NhZ2VzIGRvIG5vdCBnZXQgU0VBIHRyYW5zZm9ybXMuXG5cdFx0Z3JhcGhbc291bF0gPSBzdGF0ZV9pZnkoZ3JhcGhbc291bF0sIGtleSwgc3RhdGUsIHZhbCwgc291bCk7XG5cdFx0aWYodG1wID0gKHJvb3QubmV4dHx8JycpW3NvdWxdKXsgdG1wLm9uKCdpbicsIG1zZykgfVxuXHRcdGZpcmUoY3R4KTtcblx0XHRldmUudG8ubmV4dChtc2cpO1xuXHR9XG5cdGZ1bmN0aW9uIGZpcmUoY3R4LCBtc2cpeyB2YXIgcm9vdDtcblx0XHRpZihjdHguc3RvcCl7IHJldHVybiB9XG5cdFx0aWYoIWN0eC5lcnIgJiYgMCA8IC0tY3R4LnN0dW4peyByZXR1cm4gfSAvLyBUT0RPOiAnZm9yZ2V0JyBmZWF0dXJlIGluIFNFQSB0aWVkIHRvIHRoaXMsIGJhZCBhcHByb2FjaCwgYnV0IGhhY2tlZCBpbiBmb3Igbm93LiBBbnkgY2hhbmdlcyBoZXJlIG11c3QgdXBkYXRlIHRoZXJlLlxuXHRcdGN0eC5zdG9wID0gMTtcblx0XHRpZighKHJvb3QgPSBjdHgucm9vdCkpeyByZXR1cm4gfVxuXHRcdHZhciB0bXAgPSBjdHgubWF0Y2g7IHRtcC5lbmQgPSAxO1xuXHRcdGlmKHRtcCA9PT0gcm9vdC5oYXRjaCl7IGlmKCEodG1wID0gY3R4LmxhdGNoKSB8fCB0bXAuZW5kKXsgZGVsZXRlIHJvb3QuaGF0Y2ggfSBlbHNlIHsgcm9vdC5oYXRjaCA9IHRtcCB9IH1cblx0XHRjdHguaGF0Y2ggJiYgY3R4LmhhdGNoKCk7IC8vIFRPRE86IHJlbmFtZS9yZXdvcmsgaG93IHB1dCAmIHRoaXMgaW50ZXJhY3QuXG5cdFx0c2V0VGltZW91dC5lYWNoKGN0eC5tYXRjaCwgZnVuY3Rpb24oY2Ipe2NiICYmIGNiKCl9KTsgXG5cdFx0aWYoIShtc2cgPSBjdHgubXNnKSB8fCBjdHguZXJyIHx8IG1zZy5lcnIpeyByZXR1cm4gfVxuXHRcdG1zZy5vdXQgPSB1bml2ZXJzZTtcblx0XHRjdHgucm9vdC5vbignb3V0JywgbXNnKTtcblxuXHRcdENGKCk7IC8vIGNvdXJ0ZXN5IGNoZWNrO1xuXHR9XG5cdGZ1bmN0aW9uIGFjayhtc2cpeyAvLyBhZ2dyZWdhdGUgQUNLcy5cblx0XHR2YXIgaWQgPSBtc2dbJ0AnXSB8fCAnJywgY3R4LCBvaywgdG1wO1xuXHRcdGlmKCEoY3R4ID0gaWQuXykpe1xuXHRcdFx0dmFyIGR1cCA9IChkdXAgPSBtc2cuJCkgJiYgKGR1cCA9IGR1cC5fKSAmJiAoZHVwID0gZHVwLnJvb3QpICYmIChkdXAgPSBkdXAuZHVwKTtcblx0XHRcdGlmKCEoZHVwID0gZHVwLmNoZWNrKGlkKSkpeyByZXR1cm4gfVxuXHRcdFx0bXNnWydAJ10gPSBkdXBbJyMnXSB8fCBtc2dbJ0AnXTsgLy8gVGhpcyBkb2Vzbid0IGRvIGFueXRoaW5nIGFueW1vcmUsIGJhY2t0cmFjayBpdCB0byBzb21ldGhpbmcgZWxzZT9cblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y3R4LmFja3MgPSAoY3R4LmFja3N8fDApICsgMTtcblx0XHRpZihjdHguZXJyID0gbXNnLmVycil7XG5cdFx0XHRtc2dbJ0AnXSA9IGN0eFsnIyddO1xuXHRcdFx0ZmlyZShjdHgpOyAvLyBUT0RPOiBCVUc/IEhvdyBpdCBza2lwcy9zdG9wcyBwcm9wYWdhdGlvbiBvZiBtc2cgaWYgYW55IDEgaXRlbSBpcyBlcnJvciwgdGhpcyB3b3VsZCBhc3N1bWUgYSB3aG9sZSBiYXRjaC9yZXN5bmMgaGFzIHNhbWUgbWFsaWNpb3VzIGludGVudC5cblx0XHR9XG5cdFx0Y3R4Lm9rID0gbXNnLm9rIHx8IGN0eC5vaztcblx0XHRpZighY3R4LnN0b3AgJiYgIWN0eC5jcmFjayl7IGN0eC5jcmFjayA9IGN0eC5tYXRjaCAmJiBjdHgubWF0Y2gucHVzaChmdW5jdGlvbigpe2JhY2soY3R4KX0pIH0gLy8gaGFuZGxlIHN5bmNocm9ub3VzIGFja3MuIE5PVEU6IElmIGEgc3RvcmFnZSBwZWVyIEFDS3Mgc3luY2hyb25vdXNseSB0aGVuIHRoZSBQVVQgbG9vcCBoYXMgbm90IGV2ZW4gY291bnRlZCB1cCBob3cgbWFueSBpdGVtcyBuZWVkIHRvIGJlIHByb2Nlc3NlZCwgc28gY3R4LlNUT1AgZmxhZ3MgdGhpcyBhbmQgYWRkcyBvbmx5IDEgY2FsbGJhY2sgdG8gdGhlIGVuZCBvZiB0aGUgUFVUIGxvb3AuXG5cdFx0YmFjayhjdHgpO1xuXHR9XG5cdGZ1bmN0aW9uIGJhY2soY3R4KXtcblx0XHRpZighY3R4IHx8ICFjdHgucm9vdCl7IHJldHVybiB9XG5cdFx0aWYoY3R4LnN0dW4gfHwgY3R4LmFja3MgIT09IGN0eC5hbGwpeyByZXR1cm4gfVxuXHRcdGN0eC5yb290Lm9uKCdpbicsIHsnQCc6IGN0eFsnIyddLCBlcnI6IGN0eC5lcnIsIG9rOiBjdHguZXJyPyB1IDogY3R4Lm9rIHx8IHsnJzoxfX0pO1xuXHR9XG5cblx0dmFyIEVSUiA9IFwiRXJyb3I6IEludmFsaWQgZ3JhcGghXCI7XG5cdHZhciBjdXQgPSBmdW5jdGlvbihzKXsgcmV0dXJuIFwiICdcIisoJycrcykuc2xpY2UoMCw5KStcIi4uLicgXCIgfVxuXHR2YXIgTCA9IEpTT04uc3RyaW5naWZ5LCBNRCA9IDIxNDc0ODM2NDcsIFN0YXRlID0gR3VuLnN0YXRlO1xuXHR2YXIgQyA9IDAsIENULCBDRiA9IGZ1bmN0aW9uKCl7aWYoQz45OTkgJiYgKEMvLShDVCAtIChDVCA9ICtuZXcgRGF0ZSkpPjEpKXtHdW4ud2luZG93ICYmIGNvbnNvbGUubG9nKFwiV2FybmluZzogWW91J3JlIHN5bmNpbmcgMUsrIHJlY29yZHMgYSBzZWNvbmQsIGZhc3RlciB0aGFuIERPTSBjYW4gdXBkYXRlIC0gY29uc2lkZXIgbGltaXRpbmcgcXVlcnkuXCIpO0NGPWZ1bmN0aW9uKCl7Qz0wfX19O1xuXG59KCkpO1xuXG47KGZ1bmN0aW9uKCl7XG5cdEd1bi5vbi5nZXQgPSBmdW5jdGlvbihtc2csIGd1bil7XG5cdFx0dmFyIHJvb3QgPSBndW4uXywgZ2V0ID0gbXNnLmdldCwgc291bCA9IGdldFsnIyddLCBub2RlID0gcm9vdC5ncmFwaFtzb3VsXSwgaGFzID0gZ2V0WycuJ107XG5cdFx0dmFyIG5leHQgPSByb290Lm5leHQgfHwgKHJvb3QubmV4dCA9IHt9KSwgYXQgPSBuZXh0W3NvdWxdO1xuXHRcdC8vIHF1ZXVlIGNvbmN1cnJlbnQgR0VUcz9cblx0XHQvLyBUT0RPOiBjb25zaWRlciB0YWdnaW5nIG9yaWdpbmFsIG1lc3NhZ2UgaW50byBkdXAgZm9yIERBTS5cblx0XHQvLyBUT0RPOiBeIGFib3ZlPyBJbiBjaGF0IGFwcCwgMTIgbWVzc2FnZXMgcmVzdWx0ZWQgaW4gc2FtZSBwZWVyIGFza2luZyBmb3IgYCN1c2VyLnB1YmAgMTIgdGltZXMuIChzYW1lIHdpdGggI3VzZXIgR0VUIHRvbywgeWlwZXMhKSAvLyBEQU0gbm90ZTogVGhpcyBhbHNvIHJlc3VsdGVkIGluIDEyIHJlcGxpZXMgZnJvbSAxIHBlZXIgd2hpY2ggYWxsIGhhZCBzYW1lICMjaGFzaCBidXQgbm9uZSBvZiB0aGVtIGRlZHVwZWQgYmVjYXVzZSBlYWNoIGdldCB3YXMgZGlmZmVyZW50LlxuXHRcdC8vIFRPRE86IE1vdmluZyBxdWljayBoYWNrcyBmaXhpbmcgdGhlc2UgdGhpbmdzIHRvIGF4ZSBmb3Igbm93LlxuXHRcdC8vIFRPRE86IGEgbG90IG9mIEdFVCAjZm9vIHRoZW4gR0VUICNmb28uXCJcIiBoYXBwZW5pbmcsIHdoeT9cblx0XHQvLyBUT0RPOiBEQU0ncyAjIyBoYXNoIGNoZWNrLCBvbiBzYW1lIGdldCBBQ0ssIHByb2R1Y2luZyBtdWx0aXBsZSByZXBsaWVzIHN0aWxsLCBtYXliZSBKU09OIHZzIFlTT04/XG5cdFx0Ly8gVE1QIG5vdGUgZm9yIG5vdzogdmlNWnExc2xHIHdhcyBjaGF0IExFWCBxdWVyeSAjLlxuXHRcdC8qaWYoZ3VuICE9PSAodG1wID0gbXNnLiQpICYmICh0bXAgPSAodG1wfHwnJykuXykpe1xuXHRcdFx0aWYodG1wLlEpeyB0bXAuUVttc2dbJyMnXV0gPSAnJzsgcmV0dXJuIH0gLy8gY2hhaW4gZG9lcyBub3QgbmVlZCB0byBhc2sgZm9yIGl0IGFnYWluLlxuXHRcdFx0dG1wLlEgPSB7fTtcblx0XHR9Ki9cblx0XHQvKmlmKHUgPT09IGhhcyl7XG5cdFx0XHRpZihhdC5RKXtcblx0XHRcdFx0Ly9hdC5RW21zZ1snIyddXSA9ICcnO1xuXHRcdFx0XHQvL3JldHVybjtcblx0XHRcdH1cblx0XHRcdGF0LlEgPSB7fTtcblx0XHR9Ki9cblx0XHR2YXIgY3R4ID0gbXNnLl98fHt9LCBEQkcgPSBjdHguREJHID0gbXNnLkRCRztcblx0XHREQkcgJiYgKERCRy5nID0gK25ldyBEYXRlKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiR0VUOlwiLCBnZXQsIG5vZGUsIGhhcyk7XG5cdFx0aWYoIW5vZGUpeyByZXR1cm4gcm9vdC5vbignZ2V0JywgbXNnKSB9XG5cdFx0aWYoaGFzKXtcblx0XHRcdGlmKCdzdHJpbmcnICE9IHR5cGVvZiBoYXMgfHwgdSA9PT0gbm9kZVtoYXNdKXsgcmV0dXJuIHJvb3Qub24oJ2dldCcsIG1zZykgfVxuXHRcdFx0bm9kZSA9IHN0YXRlX2lmeSh7fSwgaGFzLCBzdGF0ZV9pcyhub2RlLCBoYXMpLCBub2RlW2hhc10sIHNvdWwpO1xuXHRcdFx0Ly8gSWYgd2UgaGF2ZSBhIGtleSBpbi1tZW1vcnksIGRvIHdlIHJlYWxseSBuZWVkIHRvIGZldGNoP1xuXHRcdFx0Ly8gTWF5YmUuLi4gaW4gY2FzZSB0aGUgaW4tbWVtb3J5IGtleSB3ZSBoYXZlIGlzIGEgbG9jYWwgd3JpdGVcblx0XHRcdC8vIHdlIHN0aWxsIG5lZWQgdG8gdHJpZ2dlciBhIHB1bGwvbWVyZ2UgZnJvbSBwZWVycy5cblx0XHR9XG5cdFx0Ly9HdW4ud2luZG93PyBHdW4ub2JqLmNvcHkobm9kZSkgOiBub2RlOyAvLyBITlBFUkY6IElmICFicm93c2VyIGJ1bXAgUGVyZm9ybWFuY2U/IElzIHRoaXMgdG9vIGRhbmdlcm91cyB0byByZWZlcmVuY2Ugcm9vdCBncmFwaD8gQ29weSAvIHNoYWxsb3cgY29weSB0b28gZXhwZW5zaXZlIGZvciBiaWcgbm9kZXMuIEd1bi5vYmoudG8obm9kZSk7IC8vIDEgbGF5ZXIgZGVlcCBjb3B5IC8vIEd1bi5vYmouY29weShub2RlKTsgLy8gdG9vIHNsb3cgb24gYmlnIG5vZGVzXG5cdFx0bm9kZSAmJiBhY2sobXNnLCBub2RlKTtcblx0XHRyb290Lm9uKCdnZXQnLCBtc2cpOyAvLyBzZW5kIEdFVCB0byBzdG9yYWdlIGFkYXB0ZXJzLlxuXHR9XG5cdGZ1bmN0aW9uIGFjayhtc2csIG5vZGUpe1xuXHRcdHZhciBTID0gK25ldyBEYXRlLCBjdHggPSBtc2cuX3x8e30sIERCRyA9IGN0eC5EQkcgPSBtc2cuREJHO1xuXHRcdHZhciB0byA9IG1zZ1snIyddLCBpZCA9IHRleHRfcmFuZCg5KSwga2V5cyA9IE9iamVjdC5rZXlzKG5vZGV8fCcnKS5zb3J0KCksIHNvdWwgPSAoKG5vZGV8fCcnKS5ffHwnJylbJyMnXSwga2wgPSBrZXlzLmxlbmd0aCwgaiA9IDAsIHJvb3QgPSBtc2cuJC5fLnJvb3QsIEYgPSAobm9kZSA9PT0gcm9vdC5ncmFwaFtzb3VsXSk7XG5cdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8Y3R4KS5nayA9ICtuZXcgRGF0ZSkgLSBTLCAnZ290IGtleXMnKTtcblx0XHQvLyBQRVJGOiBDb25zaWRlciBjb21tZW50aW5nIHRoaXMgb3V0IHRvIGZvcmNlIGRpc2stb25seSByZWFkcyBmb3IgcGVyZiB0ZXN0aW5nPyAvLyBUT0RPOiAua2V5cyggaXMgc2xvd1xuXHRcdG5vZGUgJiYgKGZ1bmN0aW9uIGdvKCl7XG5cdFx0XHRTID0gK25ldyBEYXRlO1xuXHRcdFx0dmFyIGkgPSAwLCBrLCBwdXQgPSB7fSwgdG1wO1xuXHRcdFx0d2hpbGUoaSA8IDkgJiYgKGsgPSBrZXlzW2krK10pKXtcblx0XHRcdFx0c3RhdGVfaWZ5KHB1dCwgaywgc3RhdGVfaXMobm9kZSwgayksIG5vZGVba10sIHNvdWwpO1xuXHRcdFx0fVxuXHRcdFx0a2V5cyA9IGtleXMuc2xpY2UoaSk7XG5cdFx0XHQodG1wID0ge30pW3NvdWxdID0gcHV0OyBwdXQgPSB0bXA7XG5cdFx0XHR2YXIgZmFpdGg7IGlmKEYpeyBmYWl0aCA9IGZ1bmN0aW9uKCl7fTsgZmFpdGgucmFtID0gZmFpdGguZmFpdGggPSB0cnVlOyB9IC8vIEhOUEVSRjogV2UncmUgdGVzdGluZyBwZXJmb3JtYW5jZSBpbXByb3ZlbWVudCBieSBza2lwcGluZyBnb2luZyB0aHJvdWdoIHNlY3VyaXR5IGFnYWluLCBidXQgdGhpcyBzaG91bGQgYmUgYXVkaXRlZC5cblx0XHRcdHRtcCA9IGtleXMubGVuZ3RoO1xuXHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAtKFMgLSAoUyA9ICtuZXcgRGF0ZSkpLCAnZ290IGNvcGllZCBzb21lJyk7XG5cdFx0XHREQkcgJiYgKERCRy5nYSA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRyb290Lm9uKCdpbicsIHsnQCc6IHRvLCAnIyc6IGlkLCBwdXQ6IHB1dCwgJyUnOiAodG1wPyAoaWQgPSB0ZXh0X3JhbmQoOSkpIDogdSksICQ6IHJvb3QuJCwgXzogZmFpdGgsIERCRzogREJHfSk7XG5cdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICtuZXcgRGF0ZSAtIFMsICdnb3QgaW4nKTtcblx0XHRcdGlmKCF0bXApeyByZXR1cm4gfVxuXHRcdFx0c2V0VGltZW91dC50dXJuKGdvKTtcblx0XHR9KCkpO1xuXHRcdGlmKCFub2RlKXsgcm9vdC5vbignaW4nLCB7J0AnOiBtc2dbJyMnXX0pIH0gLy8gVE9ETzogSSBkb24ndCB0aGluayBJIGxpa2UgdGhpcywgdGhlIGRlZmF1bHQgbFMgYWRhcHRlciB1c2VzIHRoaXMgYnV0IFwibm90IGZvdW5kXCIgaXMgYSBzZW5zaXRpdmUgaXNzdWUsIHNvIHNob3VsZCBwcm9iYWJseSBiZSBoYW5kbGVkIG1vcmUgY2FyZWZ1bGx5L2luZGl2aWR1YWxseS5cblx0fSBHdW4ub24uZ2V0LmFjayA9IGFjaztcbn0oKSk7XG5cbjsoZnVuY3Rpb24oKXtcblx0R3VuLmNoYWluLm9wdCA9IGZ1bmN0aW9uKG9wdCl7XG5cdFx0b3B0ID0gb3B0IHx8IHt9O1xuXHRcdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fLCB0bXAgPSBvcHQucGVlcnMgfHwgb3B0O1xuXHRcdGlmKCFPYmplY3QucGxhaW4ob3B0KSl7IG9wdCA9IHt9IH1cblx0XHRpZighT2JqZWN0LnBsYWluKGF0Lm9wdCkpeyBhdC5vcHQgPSBvcHQgfVxuXHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiB0bXApeyB0bXAgPSBbdG1wXSB9XG5cdFx0aWYoIU9iamVjdC5wbGFpbihhdC5vcHQucGVlcnMpKXsgYXQub3B0LnBlZXJzID0ge319XG5cdFx0aWYodG1wIGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdFx0b3B0LnBlZXJzID0ge307XG5cdFx0XHR0bXAuZm9yRWFjaChmdW5jdGlvbih1cmwpe1xuXHRcdFx0XHR2YXIgcCA9IHt9OyBwLmlkID0gcC51cmwgPSB1cmw7XG5cdFx0XHRcdG9wdC5wZWVyc1t1cmxdID0gYXQub3B0LnBlZXJzW3VybF0gPSBhdC5vcHQucGVlcnNbdXJsXSB8fCBwO1xuXHRcdFx0fSlcblx0XHR9XG5cdFx0b2JqX2VhY2gob3B0LCBmdW5jdGlvbiBlYWNoKGspeyB2YXIgdiA9IHRoaXNba107XG5cdFx0XHRpZigodGhpcyAmJiB0aGlzLmhhc093blByb3BlcnR5KGspKSB8fCAnc3RyaW5nJyA9PSB0eXBlb2YgdiB8fCBPYmplY3QuZW1wdHkodikpeyB0aGlzW2tdID0gdjsgcmV0dXJuIH1cblx0XHRcdGlmKHYgJiYgdi5jb25zdHJ1Y3RvciAhPT0gT2JqZWN0ICYmICEodiBpbnN0YW5jZW9mIEFycmF5KSl7IHJldHVybiB9XG5cdFx0XHRvYmpfZWFjaCh2LCBlYWNoKTtcblx0XHR9KTtcblx0XHRhdC5vcHQuZnJvbSA9IG9wdDtcblx0XHRHdW4ub24oJ29wdCcsIGF0KTtcblx0XHRhdC5vcHQudXVpZCA9IGF0Lm9wdC51dWlkIHx8IGZ1bmN0aW9uIHV1aWQobCl7IHJldHVybiBHdW4uc3RhdGUoKS50b1N0cmluZygzNikucmVwbGFjZSgnLicsJycpICsgU3RyaW5nLnJhbmRvbShsfHwxMikgfVxuXHRcdHJldHVybiBndW47XG5cdH1cbn0oKSk7XG5cbnZhciBvYmpfZWFjaCA9IGZ1bmN0aW9uKG8sZil7IE9iamVjdC5rZXlzKG8pLmZvckVhY2goZixvKSB9LCB0ZXh0X3JhbmQgPSBTdHJpbmcucmFuZG9tLCB0dXJuID0gc2V0VGltZW91dC50dXJuLCB2YWxpZCA9IEd1bi52YWxpZCwgc3RhdGVfaXMgPSBHdW4uc3RhdGUuaXMsIHN0YXRlX2lmeSA9IEd1bi5zdGF0ZS5pZnksIHUsIGVtcHR5ID0ge30sIEM7XG5cbkd1bi5sb2cgPSBmdW5jdGlvbigpeyByZXR1cm4gKCFHdW4ubG9nLm9mZiAmJiBDLmxvZy5hcHBseShDLCBhcmd1bWVudHMpKSwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oJyAnKSB9O1xuR3VuLmxvZy5vbmNlID0gZnVuY3Rpb24odyxzLG8peyByZXR1cm4gKG8gPSBHdW4ubG9nLm9uY2UpW3ddID0gb1t3XSB8fCAwLCBvW3ddKysgfHwgR3VuLmxvZyhzKSB9O1xuXG5pZih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKXsgKHdpbmRvdy5HVU4gPSB3aW5kb3cuR3VuID0gR3VuKS53aW5kb3cgPSB3aW5kb3cgfVxudHJ5eyBpZih0eXBlb2YgTU9EVUxFICE9PSBcInVuZGVmaW5lZFwiKXsgTU9EVUxFLmV4cG9ydHMgPSBHdW4gfSB9Y2F0Y2goZSl7fVxubW9kdWxlLmV4cG9ydHMgPSBHdW47XG5cbihHdW4ud2luZG93fHx7fSkuY29uc29sZSA9IChHdW4ud2luZG93fHx7fSkuY29uc29sZSB8fCB7bG9nOiBmdW5jdGlvbigpe319O1xuKEMgPSBjb25zb2xlKS5vbmx5ID0gZnVuY3Rpb24oaSwgcyl7IHJldHVybiAoQy5vbmx5LmkgJiYgaSA9PT0gQy5vbmx5LmkgJiYgQy5vbmx5LmkrKykgJiYgKEMubG9nLmFwcGx5KEMsIGFyZ3VtZW50cykgfHwgcykgfTtcblxuO1wiUGxlYXNlIGRvIG5vdCByZW1vdmUgd2VsY29tZSBsb2cgdW5sZXNzIHlvdSBhcmUgcGF5aW5nIGZvciBhIG1vbnRobHkgc3BvbnNvcnNoaXAsIHRoYW5rcyFcIjtcbkd1bi5sb2cub25jZShcIndlbGNvbWVcIiwgXCJIZWxsbyB3b25kZXJmdWwgcGVyc29uISA6KSBUaGFua3MgZm9yIHVzaW5nIEdVTiwgcGxlYXNlIGFzayBmb3IgaGVscCBvbiBodHRwOi8vY2hhdC5ndW4uZWNvIGlmIGFueXRoaW5nIHRha2VzIHlvdSBsb25nZXIgdGhhbiA1bWluIHRvIGZpZ3VyZSBvdXQhXCIpO1xuXHQiLCJcbnZhciBHdW4gPSByZXF1aXJlKCcuL2luZGV4Jyk7XG5HdW4uY2hhaW4uc2V0ID0gZnVuY3Rpb24oaXRlbSwgY2IsIG9wdCl7XG5cdHZhciBndW4gPSB0aGlzLCByb290ID0gZ3VuLmJhY2soLTEpLCBzb3VsLCB0bXA7XG5cdGNiID0gY2IgfHwgZnVuY3Rpb24oKXt9O1xuXHRvcHQgPSBvcHQgfHwge307IG9wdC5pdGVtID0gb3B0Lml0ZW0gfHwgaXRlbTtcblx0aWYoc291bCA9ICgoaXRlbXx8JycpLl98fCcnKVsnIyddKXsgKGl0ZW0gPSB7fSlbJyMnXSA9IHNvdWwgfSAvLyBjaGVjayBpZiBub2RlLCBtYWtlIGxpbmsuXG5cdGlmKCdzdHJpbmcnID09IHR5cGVvZiAodG1wID0gR3VuLnZhbGlkKGl0ZW0pKSl7IHJldHVybiBndW4uZ2V0KHNvdWwgPSB0bXApLnB1dChpdGVtLCBjYiwgb3B0KSB9IC8vIGNoZWNrIGlmIGxpbmtcblx0aWYoIUd1bi5pcyhpdGVtKSl7XG5cdFx0aWYoT2JqZWN0LnBsYWluKGl0ZW0pKXtcblx0XHRcdGl0ZW0gPSByb290LmdldChzb3VsID0gZ3VuLmJhY2soJ29wdC51dWlkJykoKSkucHV0KGl0ZW0pO1xuXHRcdH1cblx0XHRyZXR1cm4gZ3VuLmdldChzb3VsIHx8IHJvb3QuYmFjaygnb3B0LnV1aWQnKSg3KSkucHV0KGl0ZW0sIGNiLCBvcHQpO1xuXHR9XG5cdGd1bi5wdXQoZnVuY3Rpb24oZ28pe1xuXHRcdGl0ZW0uZ2V0KGZ1bmN0aW9uKHNvdWwsIG8sIG1zZyl7IC8vIFRPRE86IEJVRyEgV2Ugbm8gbG9uZ2VyIGhhdmUgdGhpcyBvcHRpb24/ICYgZ28gZXJyb3Igbm90IGhhbmRsZWQ/XG5cdFx0XHRpZighc291bCl7IHJldHVybiBjYi5jYWxsKGd1biwge2VycjogR3VuLmxvZygnT25seSBhIG5vZGUgY2FuIGJlIGxpbmtlZCEgTm90IFwiJyArIG1zZy5wdXQgKyAnXCIhJyl9KSB9XG5cdFx0XHQodG1wID0ge30pW3NvdWxdID0geycjJzogc291bH07IGdvKHRtcCk7XG5cdFx0fSx0cnVlKTtcblx0fSlcblx0cmV0dXJuIGl0ZW07XG59XG5cdCIsIlxuLy8gU2hpbSBmb3IgZ2VuZXJpYyBqYXZhc2NyaXB0IHV0aWxpdGllcy5cblN0cmluZy5yYW5kb20gPSBmdW5jdGlvbihsLCBjKXtcblx0dmFyIHMgPSAnJztcblx0bCA9IGwgfHwgMjQ7IC8vIHlvdSBhcmUgbm90IGdvaW5nIHRvIG1ha2UgYSAwIGxlbmd0aCByYW5kb20gbnVtYmVyLCBzbyBubyBuZWVkIHRvIGNoZWNrIHR5cGVcblx0YyA9IGMgfHwgJzAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1haYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonO1xuXHR3aGlsZShsLS0gPiAwKXsgcyArPSBjLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjLmxlbmd0aCkpIH1cblx0cmV0dXJuIHM7XG59XG5TdHJpbmcubWF0Y2ggPSBmdW5jdGlvbih0LCBvKXsgdmFyIHRtcCwgdTtcblx0aWYoJ3N0cmluZycgIT09IHR5cGVvZiB0KXsgcmV0dXJuIGZhbHNlIH1cblx0aWYoJ3N0cmluZycgPT0gdHlwZW9mIG8peyBvID0geyc9Jzogb30gfVxuXHRvID0gbyB8fCB7fTtcblx0dG1wID0gKG9bJz0nXSB8fCBvWycqJ10gfHwgb1snPiddIHx8IG9bJzwnXSk7XG5cdGlmKHQgPT09IHRtcCl7IHJldHVybiB0cnVlIH1cblx0aWYodSAhPT0gb1snPSddKXsgcmV0dXJuIGZhbHNlIH1cblx0dG1wID0gKG9bJyonXSB8fCBvWyc+J10pO1xuXHRpZih0LnNsaWNlKDAsICh0bXB8fCcnKS5sZW5ndGgpID09PSB0bXApeyByZXR1cm4gdHJ1ZSB9XG5cdGlmKHUgIT09IG9bJyonXSl7IHJldHVybiBmYWxzZSB9XG5cdGlmKHUgIT09IG9bJz4nXSAmJiB1ICE9PSBvWyc8J10pe1xuXHRcdHJldHVybiAodCA+PSBvWyc+J10gJiYgdCA8PSBvWyc8J10pPyB0cnVlIDogZmFsc2U7XG5cdH1cblx0aWYodSAhPT0gb1snPiddICYmIHQgPj0gb1snPiddKXsgcmV0dXJuIHRydWUgfVxuXHRpZih1ICE9PSBvWyc8J10gJiYgdCA8PSBvWyc8J10peyByZXR1cm4gdHJ1ZSB9XG5cdHJldHVybiBmYWxzZTtcbn1cblN0cmluZy5oYXNoID0gZnVuY3Rpb24ocywgYyl7IC8vIHZpYSBTT1xuXHRpZih0eXBlb2YgcyAhPT0gJ3N0cmluZycpeyByZXR1cm4gfVxuXHQgICAgYyA9IGMgfHwgMDsgLy8gQ1BVIHNjaGVkdWxlIGhhc2hpbmcgYnlcblx0ICAgIGlmKCFzLmxlbmd0aCl7IHJldHVybiBjIH1cblx0ICAgIGZvcih2YXIgaT0wLGw9cy5sZW5ndGgsbjsgaTxsOyArK2kpe1xuXHQgICAgICBuID0gcy5jaGFyQ29kZUF0KGkpO1xuXHQgICAgICBjID0gKChjPDw1KS1jKStuO1xuXHQgICAgICBjIHw9IDA7XG5cdCAgICB9XG5cdCAgICByZXR1cm4gYztcblx0ICB9XG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbk9iamVjdC5wbGFpbiA9IGZ1bmN0aW9uKG8peyByZXR1cm4gbz8gKG8gaW5zdGFuY2VvZiBPYmplY3QgJiYgby5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL15cXFtvYmplY3QgKFxcdyspXFxdJC8pWzFdID09PSAnT2JqZWN0JyA6IGZhbHNlIH1cbk9iamVjdC5lbXB0eSA9IGZ1bmN0aW9uKG8sIG4pe1xuXHRmb3IodmFyIGsgaW4gbyl7IGlmKGhhcy5jYWxsKG8sIGspICYmICghbiB8fCAtMT09bi5pbmRleE9mKGspKSl7IHJldHVybiBmYWxzZSB9IH1cblx0cmV0dXJuIHRydWU7XG59XG5PYmplY3Qua2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uKG8pe1xuXHR2YXIgbCA9IFtdO1xuXHRmb3IodmFyIGsgaW4gbyl7IGlmKGhhcy5jYWxsKG8sIGspKXsgbC5wdXNoKGspIH0gfVxuXHRyZXR1cm4gbDtcbn1cbjsoZnVuY3Rpb24oKXsgLy8gbWF4IH4xbXMgb3IgYmVmb3JlIHN0YWNrIG92ZXJmbG93IFxuXHR2YXIgdSwgc1QgPSBzZXRUaW1lb3V0LCBsID0gMCwgYyA9IDAsIHNJID0gKHR5cGVvZiBzZXRJbW1lZGlhdGUgIT09ICcnK3UgJiYgc2V0SW1tZWRpYXRlKSB8fCBzVDsgLy8gcXVldWVNaWNyb3Rhc2sgZmFzdGVyIGJ1dCBibG9ja3MgVUlcblx0c1QuaG9sZCA9IHNULmhvbGQgfHwgOTtcblx0c1QucG9sbCA9IHNULnBvbGwgfHwgZnVuY3Rpb24oZil7IC8vZigpOyByZXR1cm47IC8vIGZvciB0ZXN0aW5nXG5cdFx0aWYoKHNULmhvbGQgPj0gKCtuZXcgRGF0ZSAtIGwpKSAmJiBjKysgPCAzMzMzKXsgZigpOyByZXR1cm4gfVxuXHRcdHNJKGZ1bmN0aW9uKCl7IGwgPSArbmV3IERhdGU7IGYoKSB9LGM9MClcblx0fVxufSgpKTtcbjsoZnVuY3Rpb24oKXsgLy8gVG9vIG1hbnkgcG9sbHMgYmxvY2ssIHRoaXMgXCJ0aHJlYWRzXCIgdGhlbSBpbiB0dXJucyBvdmVyIGEgc2luZ2xlIHRocmVhZCBpbiB0aW1lLlxuXHR2YXIgc1QgPSBzZXRUaW1lb3V0LCB0ID0gc1QudHVybiA9IHNULnR1cm4gfHwgZnVuY3Rpb24oZil7IDEgPT0gcy5wdXNoKGYpICYmIHAoVCkgfVxuXHQsIHMgPSB0LnMgPSBbXSwgcCA9IHNULnBvbGwsIGkgPSAwLCBmLCBUID0gZnVuY3Rpb24oKXtcblx0XHRpZihmID0gc1tpKytdKXsgZigpIH1cblx0XHRpZihpID09IHMubGVuZ3RoIHx8IDk5ID09IGkpe1xuXHRcdFx0cyA9IHQucyA9IHMuc2xpY2UoaSk7XG5cdFx0XHRpID0gMDtcblx0XHR9XG5cdFx0aWYocy5sZW5ndGgpeyBwKFQpIH1cblx0fVxufSgpKTtcbjsoZnVuY3Rpb24oKXtcblx0dmFyIHUsIHNUID0gc2V0VGltZW91dCwgVCA9IHNULnR1cm47XG5cdChzVC5lYWNoID0gc1QuZWFjaCB8fCBmdW5jdGlvbihsLGYsZSxTKXsgUyA9IFMgfHwgOTsgKGZ1bmN0aW9uIHQocyxMLHIpe1xuXHQgIGlmKEwgPSAocyA9IChsfHxbXSkuc3BsaWNlKDAsUykpLmxlbmd0aCl7XG5cdCAgXHRmb3IodmFyIGkgPSAwOyBpIDwgTDsgaSsrKXtcblx0ICBcdFx0aWYodSAhPT0gKHIgPSBmKHNbaV0pKSl7IGJyZWFrIH1cblx0ICBcdH1cblx0ICBcdGlmKHUgPT09IHIpeyBUKHQpOyByZXR1cm4gfVxuXHQgIH0gZSAmJiBlKHIpO1xuXHR9KCkpfSkoKTtcbn0oKSk7XG5cdCIsIlxucmVxdWlyZSgnLi9zaGltJyk7XG5mdW5jdGlvbiBTdGF0ZSgpe1xuXHR2YXIgdCA9ICtuZXcgRGF0ZTtcblx0aWYobGFzdCA8IHQpe1xuXHRcdHJldHVybiBOID0gMCwgbGFzdCA9IHQgKyBTdGF0ZS5kcmlmdDtcblx0fVxuXHRyZXR1cm4gbGFzdCA9IHQgKyAoKE4gKz0gMSkgLyBEKSArIFN0YXRlLmRyaWZ0O1xufVxuU3RhdGUuZHJpZnQgPSAwO1xudmFyIE5JID0gLUluZmluaXR5LCBOID0gMCwgRCA9IDk5OSwgbGFzdCA9IE5JLCB1OyAvLyBXQVJOSU5HISBJbiB0aGUgZnV0dXJlLCBvbiBtYWNoaW5lcyB0aGF0IGFyZSBEIHRpbWVzIGZhc3RlciB0aGFuIDIwMTZBRCBtYWNoaW5lcywgeW91IHdpbGwgd2FudCB0byBpbmNyZWFzZSBEIGJ5IGFub3RoZXIgc2V2ZXJhbCBvcmRlcnMgb2YgbWFnbml0dWRlIHNvIHRoZSBwcm9jZXNzaW5nIHNwZWVkIG5ldmVyIG91dCBwYWNlcyB0aGUgZGVjaW1hbCByZXNvbHV0aW9uIChpbmNyZWFzaW5nIGFuIGludGVnZXIgZWZmZWN0cyB0aGUgc3RhdGUgYWNjdXJhY3kpLlxuU3RhdGUuaXMgPSBmdW5jdGlvbihuLCBrLCBvKXsgLy8gY29udmVuaWVuY2UgZnVuY3Rpb24gdG8gZ2V0IHRoZSBzdGF0ZSBvbiBhIGtleSBvbiBhIG5vZGUgYW5kIHJldHVybiBpdC5cblx0dmFyIHRtcCA9IChrICYmIG4gJiYgbi5fICYmIG4uX1snPiddKSB8fCBvO1xuXHRpZighdG1wKXsgcmV0dXJuIH1cblx0cmV0dXJuICgnbnVtYmVyJyA9PSB0eXBlb2YgKHRtcCA9IHRtcFtrXSkpPyB0bXAgOiBOSTtcbn1cblN0YXRlLmlmeSA9IGZ1bmN0aW9uKG4sIGssIHMsIHYsIHNvdWwpeyAvLyBwdXQgYSBrZXkncyBzdGF0ZSBvbiBhIG5vZGUuXG5cdChuID0gbiB8fCB7fSkuXyA9IG4uXyB8fCB7fTsgLy8gc2FmZXR5IGNoZWNrIG9yIGluaXQuXG5cdGlmKHNvdWwpeyBuLl9bJyMnXSA9IHNvdWwgfSAvLyBzZXQgYSBzb3VsIGlmIHNwZWNpZmllZC5cblx0dmFyIHRtcCA9IG4uX1snPiddIHx8IChuLl9bJz4nXSA9IHt9KTsgLy8gZ3JhYiB0aGUgc3RhdGVzIGRhdGEuXG5cdGlmKHUgIT09IGsgJiYgayAhPT0gJ18nKXtcblx0XHRpZignbnVtYmVyJyA9PSB0eXBlb2Ygcyl7IHRtcFtrXSA9IHMgfSAvLyBhZGQgdGhlIHZhbGlkIHN0YXRlLlxuXHRcdGlmKHUgIT09IHYpeyBuW2tdID0gdiB9IC8vIE5vdGU6IE5vdCBpdHMgam9iIHRvIGNoZWNrIGZvciB2YWxpZCB2YWx1ZXMhXG5cdH1cblx0cmV0dXJuIG47XG59XG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRlO1xuXHQiLCJcbi8vIFZhbGlkIHZhbHVlcyBhcmUgYSBzdWJzZXQgb2YgSlNPTjogbnVsbCwgYmluYXJ5LCBudW1iZXIgKCFJbmZpbml0eSksIHRleHQsXG4vLyBvciBhIHNvdWwgcmVsYXRpb24uIEFycmF5cyBuZWVkIHNwZWNpYWwgYWxnb3JpdGhtcyB0byBoYW5kbGUgY29uY3VycmVuY3ksXG4vLyBzbyB0aGV5IGFyZSBub3Qgc3VwcG9ydGVkIGRpcmVjdGx5LiBVc2UgYW4gZXh0ZW5zaW9uIHRoYXQgc3VwcG9ydHMgdGhlbSBpZlxuLy8gbmVlZGVkIGJ1dCByZXNlYXJjaCB0aGVpciBwcm9ibGVtcyBmaXJzdC5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHYpIHtcbiAgLy8gXCJkZWxldGVzXCIsIG51bGxpbmcgb3V0IGtleXMuXG4gIHJldHVybiB2ID09PSBudWxsIHx8XG5cdFwic3RyaW5nXCIgPT09IHR5cGVvZiB2IHx8XG5cdFwiYm9vbGVhblwiID09PSB0eXBlb2YgdiB8fFxuXHQvLyB3ZSB3YW50ICsvLSBJbmZpbml0eSB0byBiZSwgYnV0IEpTT04gZG9lcyBub3Qgc3VwcG9ydCBpdCwgc2FkIGZhY2UuXG5cdC8vIGNhbiB5b3UgZ3Vlc3Mgd2hhdCB2ID09PSB2IGNoZWNrcyBmb3I/IDspXG5cdChcIm51bWJlclwiID09PSB0eXBlb2YgdiAmJiB2ICE9IEluZmluaXR5ICYmIHYgIT0gLUluZmluaXR5ICYmIHYgPT09IHYpIHx8XG5cdCghIXYgJiYgXCJzdHJpbmdcIiA9PSB0eXBlb2YgdltcIiNcIl0gJiYgT2JqZWN0LmtleXModikubGVuZ3RoID09PSAxICYmIHZbXCIjXCJdKTtcbn1cblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9pbmRleCcpO1xuR3VuLk1lc2ggPSByZXF1aXJlKCcuL21lc2gnKTtcblxuLy8gVE9ETzogcmVzeW5jIHVwb24gcmVjb25uZWN0IG9ubGluZS9vZmZsaW5lXG4vL3dpbmRvdy5vbm9ubGluZSA9IHdpbmRvdy5vbm9mZmxpbmUgPSBmdW5jdGlvbigpeyBjb25zb2xlLmxvZygnb25saW5lPycsIG5hdmlnYXRvci5vbkxpbmUpIH1cblxuR3VuLm9uKCdvcHQnLCBmdW5jdGlvbihyb290KXtcblx0dGhpcy50by5uZXh0KHJvb3QpO1xuXHRpZihyb290Lm9uY2UpeyByZXR1cm4gfVxuXHR2YXIgb3B0ID0gcm9vdC5vcHQ7XG5cdGlmKGZhbHNlID09PSBvcHQuV2ViU29ja2V0KXsgcmV0dXJuIH1cblxuXHR2YXIgZW52ID0gR3VuLndpbmRvdyB8fCB7fTtcblx0dmFyIHdlYnNvY2tldCA9IG9wdC5XZWJTb2NrZXQgfHwgZW52LldlYlNvY2tldCB8fCBlbnYud2Via2l0V2ViU29ja2V0IHx8IGVudi5tb3pXZWJTb2NrZXQ7XG5cdGlmKCF3ZWJzb2NrZXQpeyByZXR1cm4gfVxuXHRvcHQuV2ViU29ja2V0ID0gd2Vic29ja2V0O1xuXG5cdHZhciBtZXNoID0gb3B0Lm1lc2ggPSBvcHQubWVzaCB8fCBHdW4uTWVzaChyb290KTtcblxuXHR2YXIgd2lyZSA9IG1lc2gud2lyZSB8fCBvcHQud2lyZTtcblx0bWVzaC53aXJlID0gb3B0LndpcmUgPSBvcGVuO1xuXHRmdW5jdGlvbiBvcGVuKHBlZXIpeyB0cnl7XG5cdFx0aWYoIXBlZXIgfHwgIXBlZXIudXJsKXsgcmV0dXJuIHdpcmUgJiYgd2lyZShwZWVyKSB9XG5cdFx0dmFyIHVybCA9IHBlZXIudXJsLnJlcGxhY2UoL15odHRwLywgJ3dzJyk7XG5cdFx0dmFyIHdpcmUgPSBwZWVyLndpcmUgPSBuZXcgb3B0LldlYlNvY2tldCh1cmwpO1xuXHRcdHdpcmUub25jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRvcHQubWVzaC5ieWUocGVlcik7XG5cdFx0XHRyZWNvbm5lY3QocGVlcik7XG5cdFx0fTtcblx0XHR3aXJlLm9uZXJyb3IgPSBmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRyZWNvbm5lY3QocGVlcik7XG5cdFx0fTtcblx0XHR3aXJlLm9ub3BlbiA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRvcHQubWVzaC5oaShwZWVyKTtcblx0XHR9XG5cdFx0d2lyZS5vbm1lc3NhZ2UgPSBmdW5jdGlvbihtc2cpe1xuXHRcdFx0aWYoIW1zZyl7IHJldHVybiB9XG5cdFx0XHRvcHQubWVzaC5oZWFyKG1zZy5kYXRhIHx8IG1zZywgcGVlcik7XG5cdFx0fTtcblx0XHRyZXR1cm4gd2lyZTtcblx0fWNhdGNoKGUpe319XG5cblx0c2V0VGltZW91dChmdW5jdGlvbigpeyAhb3B0LnN1cGVyICYmIHJvb3Qub24oJ291dCcsIHtkYW06J2hpJ30pIH0sMSk7IC8vIGl0IGNhbiB0YWtlIGEgd2hpbGUgdG8gb3BlbiBhIHNvY2tldCwgc28gbWF5YmUgbm8gbG9uZ2VyIGxhenkgbG9hZCBmb3IgcGVyZiByZWFzb25zP1xuXG5cdHZhciB3YWl0ID0gMiAqIDk5OTtcblx0ZnVuY3Rpb24gcmVjb25uZWN0KHBlZXIpe1xuXHRcdGNsZWFyVGltZW91dChwZWVyLmRlZmVyKTtcblx0XHRpZighb3B0LnBlZXJzW3BlZXIudXJsXSl7IHJldHVybiB9XG5cdFx0aWYoZG9jICYmIHBlZXIucmV0cnkgPD0gMCl7IHJldHVybiB9XG5cdFx0cGVlci5yZXRyeSA9IChwZWVyLnJldHJ5IHx8IG9wdC5yZXRyeSsxIHx8IDYwKSAtICgoLXBlZXIudHJpZWQgKyAocGVlci50cmllZCA9ICtuZXcgRGF0ZSkgPCB3YWl0KjQpPzE6MCk7XG5cdFx0cGVlci5kZWZlciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gdG8oKXtcblx0XHRcdGlmKGRvYyAmJiBkb2MuaGlkZGVuKXsgcmV0dXJuIHNldFRpbWVvdXQodG8sd2FpdCkgfVxuXHRcdFx0b3BlbihwZWVyKTtcblx0XHR9LCB3YWl0KTtcblx0fVxuXHR2YXIgZG9jID0gKCcnK3UgIT09IHR5cGVvZiBkb2N1bWVudCkgJiYgZG9jdW1lbnQ7XG59KTtcbnZhciBub29wID0gZnVuY3Rpb24oKXt9LCB1O1xuXHQiXX0=

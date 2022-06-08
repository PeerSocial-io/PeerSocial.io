(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GUN = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require('./src/root');

},{"./src/root":21}],2:[function(require,module,exports){
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
	
},{"./index":14,"./mesh":17}],27:[function(require,module,exports){
//default gun
var Gun =   require('./gun/src/root');
require('./gun/src/shim');
require('./gun/src/onto');
require('./gun/src/valid');
require('./gun/src/state');
require('./gun/src/dup');
require('./gun/src/ask');
require('./gun/src/chain');
require('./gun/src/back');
require('./gun/src/put');
require('./gun/src/get');
require('./gun/src/on');
require('./gun/src/map');
require('./gun/src/set');
require('./gun/src/mesh');
require('./gun/src/websocket');
require('./gun/src/localStorage');

//default extra gun lis to include
require('./gun/lib/lex');

require("./gun/nts");
require("./gun/lib/unset");
require("./gun/lib/not");
require("./gun/lib/open");
require("./gun/lib/load");

//include sea in the build
require('./gun/sea');

module.exports = Gun;
},{"./gun/lib/lex":2,"./gun/lib/load":3,"./gun/lib/not":4,"./gun/lib/open":5,"./gun/lib/unset":6,"./gun/nts":7,"./gun/sea":8,"./gun/src/ask":9,"./gun/src/back":10,"./gun/src/chain":11,"./gun/src/dup":12,"./gun/src/get":13,"./gun/src/localStorage":15,"./gun/src/map":16,"./gun/src/mesh":17,"./gun/src/on":18,"./gun/src/onto":19,"./gun/src/put":20,"./gun/src/root":21,"./gun/src/set":22,"./gun/src/shim":23,"./gun/src/state":24,"./gun/src/valid":25,"./gun/src/websocket":26}]},{},[27])(27)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ3VuL2d1bi9ndW4uanMiLCJzcmMvZ3VuL2d1bi9saWIvbGV4LmpzIiwic3JjL2d1bi9ndW4vbGliL2xvYWQuanMiLCJzcmMvZ3VuL2d1bi9saWIvbm90LmpzIiwic3JjL2d1bi9ndW4vbGliL29wZW4uanMiLCJzcmMvZ3VuL2d1bi9saWIvdW5zZXQuanMiLCJzcmMvZ3VuL2d1bi9udHMuanMiLCJzcmMvZ3VuL2d1bi9zZWEuanMiLCJzcmMvZ3VuL2d1bi9zcmMvYXNrLmpzIiwic3JjL2d1bi9ndW4vc3JjL2JhY2suanMiLCJzcmMvZ3VuL2d1bi9zcmMvY2hhaW4uanMiLCJzcmMvZ3VuL2d1bi9zcmMvZHVwLmpzIiwic3JjL2d1bi9ndW4vc3JjL2dldC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9pbmRleC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZ3VuL2d1bi9zcmMvbWFwLmpzIiwic3JjL2d1bi9ndW4vc3JjL21lc2guanMiLCJzcmMvZ3VuL2d1bi9zcmMvb24uanMiLCJzcmMvZ3VuL2d1bi9zcmMvb250by5qcyIsInNyYy9ndW4vZ3VuL3NyYy9wdXQuanMiLCJzcmMvZ3VuL2d1bi9zcmMvcm9vdC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9zZXQuanMiLCJzcmMvZ3VuL2d1bi9zcmMvc2hpbS5qcyIsInNyYy9ndW4vZ3VuL3NyYy9zdGF0ZS5qcyIsInNyYy9ndW4vZ3VuL3NyYy92YWxpZC5qcyIsInNyYy9ndW4vZ3VuL3NyYy93ZWJzb2NrZXQuanMiLCJzcmMvZ3VuL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjL3Jvb3QnKTtcbiIsIihmdW5jdGlvbiAoR3VuLCB1KSB7XG4gICAgLyoqXG4gICAgICogXG4gICAgICogIGNyZWRpdHM6IFxuICAgICAqICAgICAgZ2l0aHViOmJtYXR1c2lha1xuICAgICAqIFxuICAgICAqLyAgICBcbiAgICB2YXIgbGV4ID0gKGd1bikgPT4ge1xuICAgICAgICBmdW5jdGlvbiBMZXgoKSB7fVxuXG4gICAgICAgIExleC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IExleFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgTGV4LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBMZXgucHJvdG90eXBlLm1vcmUgPSBmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgdGhpc1tcIj5cIl0gPSBtO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5sZXNzID0gZnVuY3Rpb24gKGxlKSB7XG4gICAgICAgICAgICB0aGlzW1wiPFwiXSA9IGxlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5pbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBsID0gbmV3IExleCgpO1xuICAgICAgICAgICAgdGhpc1tcIi5cIl0gPSBsO1xuICAgICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5vZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBsID0gbmV3IExleCgpO1xuICAgICAgICAgICAgdGhpcy5oYXNoKGwpXG4gICAgICAgICAgICByZXR1cm4gbDtcbiAgICAgICAgfVxuICAgICAgICBMZXgucHJvdG90eXBlLmhhc2ggPSBmdW5jdGlvbiAoaCkge1xuICAgICAgICAgICAgdGhpc1tcIiNcIl0gPSBoO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5wcmVmaXggPSBmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgdGhpc1tcIipcIl0gPSBwO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5yZXR1cm4gPSBmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgdGhpc1tcIj1cIl0gPSByO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5saW1pdCA9IGZ1bmN0aW9uIChsKSB7XG4gICAgICAgICAgICB0aGlzW1wiJVwiXSA9IGw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBMZXgucHJvdG90eXBlLnJldmVyc2UgPSBmdW5jdGlvbiAocnYpIHtcbiAgICAgICAgICAgIHRoaXNbXCItXCJdID0gcnYgfHwgMTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgdGhpc1tcIitcIl0gPSBpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGd1bi5tYXAodGhpcywgLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5tYXRjaCA9IGxleC5tYXRjaDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgTGV4KCk7XG4gICAgfTtcblxuICAgIGxleC5tYXRjaCA9IGZ1bmN0aW9uKHQsbyl7IHZhciB0bXAsIHU7XG4gICAgICAgIG8gPSBvIHx8IHRoaXMgfHwge307ICAgICAgICAgICAgXG4gICAgICAgIGlmKCdzdHJpbmcnID09IHR5cGVvZiBvKXsgbyA9IHsnPSc6IG99IH1cbiAgICAgICAgaWYoJ3N0cmluZycgIT09IHR5cGVvZiB0KXsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgdG1wID0gKG9bJz0nXSB8fCBvWycqJ10gfHwgb1snPiddIHx8IG9bJzwnXSk7XG4gICAgICAgIGlmKHQgPT09IHRtcCl7IHJldHVybiB0cnVlIH1cbiAgICAgICAgaWYodSAhPT0gb1snPSddKXsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgdG1wID0gKG9bJyonXSB8fCBvWyc+J10pO1xuICAgICAgICBpZih0LnNsaWNlKDAsICh0bXB8fCcnKS5sZW5ndGgpID09PSB0bXApeyByZXR1cm4gdHJ1ZSB9XG4gICAgICAgIGlmKHUgIT09IG9bJyonXSl7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIGlmKHUgIT09IG9bJz4nXSAmJiB1ICE9PSBvWyc8J10pe1xuICAgICAgICAgICAgcmV0dXJuICh0ID49IG9bJz4nXSAmJiB0IDw9IG9bJzwnXSk/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZih1ICE9PSBvWyc+J10gJiYgdCA+PSBvWyc+J10peyByZXR1cm4gdHJ1ZSB9XG4gICAgICAgIGlmKHUgIT09IG9bJzwnXSAmJiB0IDw9IG9bJzwnXSl7IHJldHVybiB0cnVlIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIEd1bi5MZXggPSBsZXg7XG5cbiAgICBHdW4uY2hhaW4ubGV4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbGV4KHRoaXMpO1xuICAgIH1cblxufSkoKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpID8gd2luZG93Lkd1biA6IHJlcXVpcmUoJy4uL2d1bicpKSIsInZhciBHdW4gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIik/IHdpbmRvdy5HdW4gOiByZXF1aXJlKCcuLi9ndW4nKTtcbkd1bi5jaGFpbi5vcGVuIHx8IHJlcXVpcmUoJy4vb3BlbicpO1xuXG5HdW4uY2hhaW4ubG9hZCA9IGZ1bmN0aW9uKGNiLCBvcHQsIGF0KXtcblx0KG9wdCA9IG9wdCB8fCB7fSkub2ZmID0gITA7XG5cdHJldHVybiB0aGlzLm9wZW4oY2IsIG9wdCwgYXQpO1xufSIsImlmKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpe1xuICB2YXIgR3VuID0gd2luZG93Lkd1bjtcbn0gZWxzZSB7IFxuICB2YXIgR3VuID0gcmVxdWlyZSgnLi4vZ3VuJyk7XG59XG5cbnZhciB1O1xuXG5HdW4uY2hhaW4ubm90ID0gZnVuY3Rpb24oY2IsIG9wdCwgdCl7XG5cdHJldHVybiB0aGlzLmdldChvdWdodCwge25vdDogY2J9KTtcbn1cblxuZnVuY3Rpb24gb3VnaHQoYXQsIGV2KXsgZXYub2ZmKCk7XG5cdGlmKGF0LmVyciB8fCAodSAhPT0gYXQucHV0KSl7IHJldHVybiB9XG5cdGlmKCF0aGlzLm5vdCl7IHJldHVybiB9XG5cdHRoaXMubm90LmNhbGwoYXQuZ3VuLCBhdC5nZXQsIGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKFwiUGxlYXNlIHJlcG9ydCB0aGlzIGJ1ZyBvbiBodHRwczovL2dpdHRlci5pbS9hbWFyay9ndW4gYW5kIGluIHRoZSBpc3N1ZXMuXCIpOyBuZWVkLnRvLmltcGxlbWVudDsgfSk7XG59IiwidmFyIEd1biA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKT8gd2luZG93Lkd1biA6IHJlcXVpcmUoJy4uL2d1bicpO1xuXG5HdW4uY2hhaW4ub3BlbiA9IGZ1bmN0aW9uKGNiLCBvcHQsIGF0LCBkZXB0aCl7IC8vIHRoaXMgaXMgYSByZWN1cnNpdmUgZnVuY3Rpb24sIEJFV0FSRSFcblx0ZGVwdGggPSBkZXB0aCB8fCAxO1xuXHRvcHQgPSBvcHQgfHwge307IC8vIGluaXQgdG9wIGxldmVsIG9wdGlvbnMuXG5cdG9wdC5kb2MgPSBvcHQuZG9jIHx8IHt9O1xuXHRvcHQuaWRzID0gb3B0LmlkcyB8fCB7fTtcblx0b3B0LmFueSA9IG9wdC5hbnkgfHwgY2I7XG5cdG9wdC5tZXRhID0gb3B0Lm1ldGEgfHwgZmFsc2U7XG5cdG9wdC5ldmUgPSBvcHQuZXZlIHx8IHtvZmY6IGZ1bmN0aW9uKCl7IC8vIGNvbGxlY3QgYWxsIHJlY3Vyc2l2ZSBldmVudHMgdG8gdW5zdWJzY3JpYmUgdG8gaWYgbmVlZGVkLlxuXHRcdE9iamVjdC5rZXlzKG9wdC5ldmUucykuZm9yRWFjaChmdW5jdGlvbihpLGUpeyAvLyBzd2l0Y2ggdG8gQ1BVIHNjaGVkdWxlZCBzZXRUaW1lb3V0LmVhY2g/XG5cdFx0XHRpZihlID0gb3B0LmV2ZS5zW2ldKXsgZS5vZmYoKSB9XG5cdFx0fSk7XG5cdFx0b3B0LmV2ZS5zID0ge307XG5cdH0sIHM6e319XG5cdHJldHVybiB0aGlzLm9uKGZ1bmN0aW9uKGRhdGEsIGtleSwgY3R4LCBldmUpeyAvLyBzdWJzY3JpYmUgdG8gMSBkZWVwZXIgb2YgZGF0YSFcblx0XHRjbGVhclRpbWVvdXQob3B0LnRvKTsgLy8gZG8gbm90IHRyaWdnZXIgY2FsbGJhY2sgaWYgYnVuY2ggb2YgY2hhbmdlcy4uLlxuXHRcdG9wdC50byA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgLy8gYnV0IHNjaGVkdWxlIHRoZSBjYWxsYmFjayB0byBmaXJlIHNvb24hXG5cdFx0XHRpZighb3B0LmFueSl7IHJldHVybiB9XG5cdFx0XHRvcHQuYW55LmNhbGwob3B0LmF0LiQsIG9wdC5kb2MsIG9wdC5rZXksIG9wdCwgb3B0LmV2ZSk7IC8vIGNhbGwgaXQuXG5cdFx0XHRpZihvcHQub2ZmKXsgLy8gY2hlY2sgZm9yIHVuc3Vic2NyaWJpbmcuXG5cdFx0XHRcdG9wdC5ldmUub2ZmKCk7XG5cdFx0XHRcdG9wdC5hbnkgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0sIG9wdC53YWl0IHx8IDkpO1xuXHRcdG9wdC5hdCA9IG9wdC5hdCB8fCBjdHg7IC8vIG9wdC5hdCB3aWxsIGFsd2F5cyBiZSB0aGUgZmlyc3QgY29udGV4dCBpdCBmaW5kcy5cblx0XHRvcHQua2V5ID0gb3B0LmtleSB8fCBrZXk7XG5cdFx0b3B0LmV2ZS5zW3RoaXMuXy5pZF0gPSBldmU7IC8vIGNvbGxlY3QgYWxsIHRoZSBldmVudHMgdG9nZXRoZXIuXG5cdFx0aWYodHJ1ZSA9PT0gR3VuLnZhbGlkKGRhdGEpKXsgLy8gaWYgcHJpbWl0aXZlIHZhbHVlLi4uXG5cdFx0XHRpZighYXQpe1xuXHRcdFx0XHRvcHQuZG9jID0gZGF0YTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGF0W2tleV0gPSBkYXRhO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgdG1wID0gdGhpczsgLy8gZWxzZSBpZiBhIHN1Yi1vYmplY3QsIENQVSBzY2hlZHVsZSBsb29wIG92ZXIgcHJvcGVydGllcyB0byBkbyByZWN1cnNpb24uXG5cdFx0c2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKGRhdGEpLCBmdW5jdGlvbihrZXksIHZhbCl7XG5cdFx0XHRpZignXycgPT09IGtleSAmJiAhb3B0Lm1ldGEpeyByZXR1cm4gfVxuXHRcdFx0dmFsID0gZGF0YVtrZXldO1xuXHRcdFx0dmFyIGRvYyA9IGF0IHx8IG9wdC5kb2MsIGlkOyAvLyBmaXJzdCBwYXNzIHRoaXMgYmVjb21lcyB0aGUgcm9vdCBvZiBvcGVuLCB0aGVuIGF0IGlzIHBhc3NlZCBiZWxvdywgYW5kIHdpbGwgYmUgdGhlIHBhcmVudCBmb3IgZWFjaCBzdWItZG9jdW1lbnQvb2JqZWN0LlxuXHRcdFx0aWYoIWRvYyl7IHJldHVybiB9IC8vIGlmIG5vIFwicGFyZW50XCJcblx0XHRcdGlmKCdzdHJpbmcnICE9PSB0eXBlb2YgKGlkID0gR3VuLnZhbGlkKHZhbCkpKXsgLy8gaWYgcHJpbWl0aXZlLi4uXG5cdFx0XHRcdGRvY1trZXldID0gdmFsO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZihvcHQuaWRzW2lkXSl7IC8vIGlmIHdlJ3ZlIGFscmVhZHkgc2VlbiB0aGlzIHN1Yi1vYmplY3QvZG9jdW1lbnRcblx0XHRcdFx0ZG9jW2tleV0gPSBvcHQuaWRzW2lkXTsgLy8gbGluayB0byBpdHNlbGYsIG91ciBhbHJlYWR5IGluLW1lbW9yeSBvbmUsIG5vdCBhIG5ldyBjb3B5LlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZihvcHQuZGVwdGggPD0gZGVwdGgpeyAvLyBzdG9wIHJlY3Vyc2l2ZSBvcGVuIGF0IG1heCBkZXB0aC5cblx0XHRcdFx0ZG9jW2tleV0gPSBkb2Nba2V5XSB8fCB2YWw7IC8vIHNob3cgbGluayBzbyBhcHAgY2FuIGxvYWQgaXQgaWYgbmVlZC5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fSAvLyBub3cgb3BlbiB1cCB0aGUgcmVjdXJzaW9uIG9mIHN1Yi1kb2N1bWVudHMhXG5cdFx0XHR0bXAuZ2V0KGtleSkub3BlbihvcHQuYW55LCBvcHQsIG9wdC5pZHNbaWRdID0gZG9jW2tleV0gPSB7fSwgZGVwdGgrMSk7IC8vIDNyZCBwYXJhbSBpcyBub3cgd2hlcmUgd2UgYXJlIFwiYXRcIi5cblx0XHR9KTtcblx0fSlcbn0iLCJ2YXIgR3VuID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpPyB3aW5kb3cuR3VuIDogcmVxdWlyZSgnLi4vZ3VuJyk7XG5cbmNvbnN0IHJlbF8gPSAnIyc7ICAvLyAnIydcbmNvbnN0IG5vZGVfID0gJ18nOyAgLy8gJ18nXG5cbkd1bi5jaGFpbi51bnNldCA9IGZ1bmN0aW9uKG5vZGUpe1xuXHRpZiggdGhpcyAmJiBub2RlICYmIG5vZGVbbm9kZV9dICYmIG5vZGVbbm9kZV9dLnB1dCAmJiBub2RlW25vZGVfXS5wdXRbbm9kZV9dICYmIG5vZGVbbm9kZV9dLnB1dFtub2RlX11bcmVsX10gKXtcblx0XHR0aGlzLnB1dCggeyBbbm9kZVtub2RlX10ucHV0W25vZGVfXVtyZWxfXV06bnVsbH0gKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cbiIsIjsoZnVuY3Rpb24oKXtcbiAgdmFyIEd1biAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIik/IHdpbmRvdy5HdW4gOiByZXF1aXJlKCcuL2d1bicpO1xuICB2YXIgZGFtICA9ICdudHMnO1xuICB2YXIgc21vb3RoID0gMjtcblxuICBHdW4ub24oJ2NyZWF0ZScsIGZ1bmN0aW9uKHJvb3QpeyAvLyBzd2l0Y2ggdG8gREFNLCBkZXByZWNhdGVkIG9sZFxuICBcdHJldHVybiA7IC8vIHN0dWIgb3V0IGZvciBub3cuIFRPRE86IElNUE9SVEFOVCEgcmUtYWRkIGJhY2sgaW4gbGF0ZXIuXG4gICAgdmFyIG9wdCA9IHJvb3Qub3B0LCBtZXNoID0gb3B0Lm1lc2g7XG4gICAgaWYoIW1lc2gpIHJldHVybjtcblxuICAgIC8vIFRyYWNrIGNvbm5lY3Rpb25zXG4gICAgdmFyIGNvbm5lY3Rpb25zID0gW107XG4gICAgcm9vdC5vbignaGknLCBmdW5jdGlvbihwZWVyKSB7XG4gICAgICB0aGlzLnRvLm5leHQocGVlcik7XG4gICAgICBjb25uZWN0aW9ucy5wdXNoKHtwZWVyLCBsYXRlbmN5OiAwLCBvZmZzZXQ6IDAsIG5leHQ6IDB9KTtcbiAgICB9KTtcbiAgICByb290Lm9uKCdieWUnLCBmdW5jdGlvbihwZWVyKSB7XG4gICAgICB0aGlzLnRvLm5leHQocGVlcik7XG4gICAgICB2YXIgZm91bmQgPSBjb25uZWN0aW9ucy5maW5kKGNvbm5lY3Rpb24gPT4gY29ubmVjdGlvbi5wZWVyLmlkID09IHBlZXIuaWQpO1xuICAgICAgaWYgKCFmb3VuZCkgcmV0dXJuO1xuICAgICAgY29ubmVjdGlvbnMuc3BsaWNlKGNvbm5lY3Rpb25zLmluZGV4T2YoZm91bmQpLCAxKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHJlc3BvbnNlKG1zZywgY29ubmVjdGlvbikge1xuICAgICAgdmFyIG5vdyAgICAgICAgICAgID0gRGF0ZS5ub3coKTsgLy8gTGFjayBvZiBkcmlmdCBpbnRlbnRpb25hbCwgcHJvdmlkZXMgbW9yZSBhY2N1cmF0ZSBSVFRcbiAgICAgIGNvbm5lY3Rpb24ubGF0ZW5jeSA9IChub3cgLSBtc2cubnRzWzBdKSAvIDI7XG4gICAgICBjb25uZWN0aW9uLm9mZnNldCAgPSAobXNnLm50c1sxXSArIGNvbm5lY3Rpb24ubGF0ZW5jeSkgLSAobm93ICsgR3VuLnN0YXRlLmRyaWZ0KTtcbiAgICAgIGNvbnNvbGUubG9nKGNvbm5lY3Rpb24ub2Zmc2V0KTtcbiAgICAgIEd1bi5zdGF0ZS5kcmlmdCAgICs9IGNvbm5lY3Rpb24ub2Zmc2V0IC8gKGNvbm5lY3Rpb25zLmxlbmd0aCArIHNtb290aCk7XG4gICAgICBjb25zb2xlLmxvZyhgVXBkYXRlIHRpbWUgYnkgbG9jYWw6ICR7Y29ubmVjdGlvbi5vZmZzZXR9IC8gJHtjb25uZWN0aW9ucy5sZW5ndGggKyBzbW9vdGh9YCk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGVjaG8gJiBzZXR0aW5nIGJhc2VkIG9uIGtub3duIGNvbm5lY3Rpb24gbGF0ZW5jeSBhcyB3ZWxsXG4gICAgbWVzaC5oZWFyW2RhbV0gPSBmdW5jdGlvbihtc2csIHBlZXIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdNU0cnLCBtc2cpO1xuICAgICAgdmFyIG5vdyAgID0gRGF0ZS5ub3coKSArIEd1bi5zdGF0ZS5kcmlmdDtcbiAgICAgIHZhciBjb25uZWN0aW9uID0gY29ubmVjdGlvbnMuZmluZChjb25uZWN0aW9uID0+IGNvbm5lY3Rpb24ucGVlci5pZCA9PSBwZWVyLmlkKTtcbiAgICAgIGlmICghY29ubmVjdGlvbikgcmV0dXJuO1xuICAgICAgaWYgKG1zZy5udHMubGVuZ3RoID49IDIpIHJldHVybiByZXNwb25zZShtc2csIGNvbm5lY3Rpb24pO1xuICAgICAgbWVzaC5zYXkoe2RhbSwgJ0AnOiBtc2dbJyMnXSwgbnRzOiBtc2cubnRzLmNvbmNhdChub3cpfSwgcGVlcik7XG4gICAgICBjb25uZWN0aW9uLm9mZnNldCA9IG1zZy5udHNbMF0gKyBjb25uZWN0aW9uLmxhdGVuY3kgLSBub3c7XG4gICAgICBHdW4uc3RhdGUuZHJpZnQgICs9IGNvbm5lY3Rpb24ub2Zmc2V0IC8gKGNvbm5lY3Rpb25zLmxlbmd0aCArIHNtb290aCk7XG4gICAgICBjb25zb2xlLmxvZyhgVXBkYXRlIHRpbWUgYnkgcmVtb3RlOiAke2Nvbm5lY3Rpb24ub2Zmc2V0fSAvICR7Y29ubmVjdGlvbnMubGVuZ3RoICsgc21vb3RofWApO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgcGluZyB0cmFuc21pc3Npb25cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uIHRyaWdnZXIoKSB7XG4gICAgICBjb25zb2xlLmxvZygnVFJJR0dFUicpO1xuICAgICAgaWYgKCFjb25uZWN0aW9ucy5sZW5ndGgpIHJldHVybiBzZXRUaW1lb3V0KHRyaWdnZXIsIDEwMCk7XG4gICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTsgLy8gTGFjayBvZiBkcmlmdCBpbnRlbnRpb25hbCwgcHJvdmlkZXMgbW9yZSBhY2N1cmF0ZSBSVFQgJiBOVFAgcmVmZXJlbmNlXG5cbiAgICAgIC8vIFNlbmQgcGluZ3NcbiAgICAgIGNvbm5lY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oY29ubmVjdGlvbikge1xuICAgICAgICBpZiAoY29ubmVjdGlvbi5uZXh0ID4gbm93KSByZXR1cm47XG4gICAgICAgIG1lc2guc2F5KHtcbiAgICAgICAgICBkYW0sXG4gICAgICAgICAgJyMnOiBTdHJpbmcucmFuZG9tKDMpLFxuICAgICAgICAgIG50czogW25vd10sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFBsYW4gbmV4dCByb3VuZCBvZiBwaW5nc1xuICAgICAgY29ubmVjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihjb25uZWN0aW9uKSB7XG4gICAgICAgIGlmIChjb25uZWN0aW9uLm5leHQgPiBub3cpIHJldHVybjtcbiAgICAgICAgLy8gaHR0cHM6Ly9kaXNjb3JkLmNvbS9jaGFubmVscy82MTI2NDUzNTc4NTA5ODQ0NzAvNjEyNjQ1MzU3ODUwOTg0NDczLzc1NTMzNDM0OTY5OTgwOTMwMFxuICAgICAgICB2YXIgZGVsYXkgPSBNYXRoLm1pbigyZTQsIE1hdGgubWF4KDI1MCwgMTUwMDAwIC8gTWF0aC5hYnMoKGNvbm5lY3Rpb24ub2Zmc2V0KXx8MSkpKTtcbiAgICAgICAgY29ubmVjdGlvbi5uZXh0ID0gbm93ICsgZGVsYXk7XG4gICAgICB9KTtcblxuICAgICAgLy8gUGxhbiBuZXh0IHRyaWdnZXIgcm91bmRcbiAgICAgIC8vIE1heSBvdmVyc2hvb3QgYnkgcnVudGltZSBvZiB0aGlzIGZ1bmN0aW9uXG4gICAgICB2YXIgbmV4dFJvdW5kID0gSW5maW5pdHk7XG4gICAgICBjb25uZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgbmV4dFJvdW5kID0gTWF0aC5taW4obmV4dFJvdW5kLCBjb25uZWN0aW9uLm5leHQpO1xuICAgICAgfSk7XG4gICAgICBzZXRUaW1lb3V0KHRyaWdnZXIsIG5leHRSb3VuZCAtIG5vdyk7XG4gICAgICBjb25zb2xlLmxvZyhgTmV4dCBzeW5jIHJvdW5kIGluICR7KG5leHRSb3VuZCAtIG5vdykgLyAxMDAwfSBzZWNvbmRzYCk7XG4gICAgfSwgMSk7XG4gIH0pO1xuXG59KCkpO1xuIiwiOyhmdW5jdGlvbigpe1xuXG4gIC8qIFVOQlVJTEQgKi9cbiAgZnVuY3Rpb24gVVNFKGFyZywgcmVxKXtcbiAgICByZXR1cm4gcmVxPyByZXF1aXJlKGFyZykgOiBhcmcuc2xpY2U/IFVTRVtSKGFyZyldIDogZnVuY3Rpb24obW9kLCBwYXRoKXtcbiAgICAgIGFyZyhtb2QgPSB7ZXhwb3J0czoge319KTtcbiAgICAgIFVTRVtSKHBhdGgpXSA9IG1vZC5leHBvcnRzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBSKHApe1xuICAgICAgcmV0dXJuIHAuc3BsaXQoJy8nKS5zbGljZSgtMSkudG9TdHJpbmcoKS5yZXBsYWNlKCcuanMnLCcnKTtcbiAgICB9XG4gIH1cbiAgaWYodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIil7IHZhciBNT0RVTEUgPSBtb2R1bGUgfVxuICAvKiBVTkJVSUxEICovXG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIC8vIFNlY3VyaXR5LCBFbmNyeXB0aW9uLCBhbmQgQXV0aG9yaXphdGlvbjogU0VBLmpzXG4gICAgLy8gTUFOREFUT1JZIFJFQURJTkc6IGh0dHBzOi8vZ3VuLmVjby9leHBsYWluZXJzL2RhdGEvc2VjdXJpdHkuaHRtbFxuICAgIC8vIElUIElTIElNUExFTUVOVEVEIElOIEEgUE9MWUZJTEwvU0hJTSBBUFBST0FDSC5cbiAgICAvLyBUSElTIElTIEFOIEVBUkxZIEFMUEhBIVxuXG4gICAgaWYodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIil7IG1vZHVsZS53aW5kb3cgPSB3aW5kb3cgfVxuXG4gICAgdmFyIHRtcCA9IG1vZHVsZS53aW5kb3cgfHwgbW9kdWxlLCB1O1xuICAgIHZhciBTRUEgPSB0bXAuU0VBIHx8IHt9O1xuXG4gICAgaWYoU0VBLndpbmRvdyA9IG1vZHVsZS53aW5kb3cpeyBTRUEud2luZG93LlNFQSA9IFNFQSB9XG5cbiAgICB0cnl7IGlmKHUrJycgIT09IHR5cGVvZiBNT0RVTEUpeyBNT0RVTEUuZXhwb3J0cyA9IFNFQSB9IH1jYXRjaChlKXt9XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUE7XG4gIH0pKFVTRSwgJy4vcm9vdCcpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3Jvb3QnKTtcbiAgICB0cnl7IGlmKFNFQS53aW5kb3cpe1xuICAgICAgaWYobG9jYXRpb24ucHJvdG9jb2wuaW5kZXhPZigncycpIDwgMFxuICAgICAgJiYgbG9jYXRpb24uaG9zdC5pbmRleE9mKCdsb2NhbGhvc3QnKSA8IDBcbiAgICAgICYmICEgL14xMjdcXC5cXGQrXFwuXFxkK1xcLlxcZCskLy50ZXN0KGxvY2F0aW9uLmhvc3RuYW1lKVxuICAgICAgJiYgbG9jYXRpb24ucHJvdG9jb2wuaW5kZXhPZignZmlsZTonKSA8IDApe1xuICAgICAgICBjb25zb2xlLndhcm4oJ0hUVFBTIG5lZWRlZCBmb3IgV2ViQ3J5cHRvIGluIFNFQSwgcmVkaXJlY3RpbmcuLi4nKTtcbiAgICAgICAgbG9jYXRpb24ucHJvdG9jb2wgPSAnaHR0cHM6JzsgLy8gV2ViQ3J5cHRvIGRvZXMgTk9UIHdvcmsgd2l0aG91dCBIVFRQUyFcbiAgICAgIH1cbiAgICB9IH1jYXRjaChlKXt9XG4gIH0pKFVTRSwgJy4vaHR0cHMnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIHU7XG4gICAgaWYodSsnJz09IHR5cGVvZiBidG9hKXtcbiAgICAgIGlmKHUrJycgPT0gdHlwZW9mIEJ1ZmZlcil7XG4gICAgICAgIHRyeXsgZ2xvYmFsLkJ1ZmZlciA9IFVTRShcImJ1ZmZlclwiLCAxKS5CdWZmZXIgfWNhdGNoKGUpeyBjb25zb2xlLmxvZyhcIlBsZWFzZSBgbnBtIGluc3RhbGwgYnVmZmVyYCBvciBhZGQgaXQgdG8geW91ciBwYWNrYWdlLmpzb24gIVwiKSB9XG4gICAgICB9XG4gICAgICBnbG9iYWwuYnRvYSA9IGZ1bmN0aW9uKGRhdGEpeyByZXR1cm4gQnVmZmVyLmZyb20oZGF0YSwgXCJiaW5hcnlcIikudG9TdHJpbmcoXCJiYXNlNjRcIikgfTtcbiAgICAgIGdsb2JhbC5hdG9iID0gZnVuY3Rpb24oZGF0YSl7IHJldHVybiBCdWZmZXIuZnJvbShkYXRhLCBcImJhc2U2NFwiKS50b1N0cmluZyhcImJpbmFyeVwiKSB9O1xuICAgIH1cbiAgfSkoVVNFLCAnLi9iYXNlNjQnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgVVNFKCcuL2Jhc2U2NCcpO1xuICAgIC8vIFRoaXMgaXMgQXJyYXkgZXh0ZW5kZWQgdG8gaGF2ZSAudG9TdHJpbmcoWyd1dGY4J3wnaGV4J3wnYmFzZTY0J10pXG4gICAgZnVuY3Rpb24gU2VhQXJyYXkoKSB7fVxuICAgIE9iamVjdC5hc3NpZ24oU2VhQXJyYXksIHsgZnJvbTogQXJyYXkuZnJvbSB9KVxuICAgIFNlYUFycmF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQXJyYXkucHJvdG90eXBlKVxuICAgIFNlYUFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKGVuYywgc3RhcnQsIGVuZCkgeyBlbmMgPSBlbmMgfHwgJ3V0ZjgnOyBzdGFydCA9IHN0YXJ0IHx8IDA7XG4gICAgICBjb25zdCBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgICAgaWYgKGVuYyA9PT0gJ2hleCcpIHtcbiAgICAgICAgY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcylcbiAgICAgICAgcmV0dXJuIFsgLi4uQXJyYXkoKChlbmQgJiYgKGVuZCArIDEpKSB8fCBsZW5ndGgpIC0gc3RhcnQpLmtleXMoKV1cbiAgICAgICAgLm1hcCgoaSkgPT4gYnVmWyBpICsgc3RhcnQgXS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJylcbiAgICAgIH1cbiAgICAgIGlmIChlbmMgPT09ICd1dGY4Jykge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShcbiAgICAgICAgICB7IGxlbmd0aDogKGVuZCB8fCBsZW5ndGgpIC0gc3RhcnQgfSxcbiAgICAgICAgICAoXywgaSkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZSh0aGlzWyBpICsgc3RhcnRdKVxuICAgICAgICApLmpvaW4oJycpXG4gICAgICB9XG4gICAgICBpZiAoZW5jID09PSAnYmFzZTY0Jykge1xuICAgICAgICByZXR1cm4gYnRvYSh0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNlYUFycmF5O1xuICB9KShVU0UsICcuL2FycmF5Jyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIFVTRSgnLi9iYXNlNjQnKTtcbiAgICAvLyBUaGlzIGlzIEJ1ZmZlciBpbXBsZW1lbnRhdGlvbiB1c2VkIGluIFNFQS4gRnVuY3Rpb25hbGl0eSBpcyBtb3N0bHlcbiAgICAvLyBjb21wYXRpYmxlIHdpdGggTm9kZUpTICdzYWZlLWJ1ZmZlcicgYW5kIGlzIHVzZWQgZm9yIGVuY29kaW5nIGNvbnZlcnNpb25zXG4gICAgLy8gYmV0d2VlbiBiaW5hcnkgYW5kICdoZXgnIHwgJ3V0ZjgnIHwgJ2Jhc2U2NCdcbiAgICAvLyBTZWUgZG9jdW1lbnRhdGlvbiBhbmQgdmFsaWRhdGlvbiBmb3Igc2FmZSBpbXBsZW1lbnRhdGlvbiBpbjpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL3NhZmUtYnVmZmVyI3VwZGF0ZVxuICAgIHZhciBTZWFBcnJheSA9IFVTRSgnLi9hcnJheScpO1xuICAgIGZ1bmN0aW9uIFNhZmVCdWZmZXIoLi4ucHJvcHMpIHtcbiAgICAgIGNvbnNvbGUud2FybignbmV3IFNhZmVCdWZmZXIoKSBpcyBkZXByZWNpYXRlZCwgcGxlYXNlIHVzZSBTYWZlQnVmZmVyLmZyb20oKScpXG4gICAgICByZXR1cm4gU2FmZUJ1ZmZlci5mcm9tKC4uLnByb3BzKVxuICAgIH1cbiAgICBTYWZlQnVmZmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQXJyYXkucHJvdG90eXBlKVxuICAgIE9iamVjdC5hc3NpZ24oU2FmZUJ1ZmZlciwge1xuICAgICAgLy8gKGRhdGEsIGVuYykgd2hlcmUgdHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnIHRoZW4gZW5jID09PSAndXRmOCd8J2hleCd8J2Jhc2U2NCdcbiAgICAgIGZyb20oKSB7XG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoYXJndW1lbnRzKS5sZW5ndGggfHwgYXJndW1lbnRzWzBdPT1udWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksIG9yIGFycmF5LWxpa2Ugb2JqZWN0LicpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5wdXQgPSBhcmd1bWVudHNbMF1cbiAgICAgICAgbGV0IGJ1ZlxuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IGVuYyA9IGFyZ3VtZW50c1sxXSB8fCAndXRmOCdcbiAgICAgICAgICBpZiAoZW5jID09PSAnaGV4Jykge1xuICAgICAgICAgICAgY29uc3QgYnl0ZXMgPSBpbnB1dC5tYXRjaCgvKFtcXGRhLWZBLUZdezJ9KS9nKVxuICAgICAgICAgICAgLm1hcCgoYnl0ZSkgPT4gcGFyc2VJbnQoYnl0ZSwgMTYpKVxuICAgICAgICAgICAgaWYgKCFieXRlcyB8fCAhYnl0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgZmlyc3QgYXJndW1lbnQgZm9yIHR5cGUgXFwnaGV4XFwnLicpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBidWYgPSBTZWFBcnJheS5mcm9tKGJ5dGVzKVxuICAgICAgICAgIH0gZWxzZSBpZiAoZW5jID09PSAndXRmOCcgfHwgJ2JpbmFyeScgPT09IGVuYykgeyAvLyBFRElUIEJZIE1BUks6IEkgdGhpbmsgdGhpcyBpcyBzYWZlLCB0ZXN0ZWQgaXQgYWdhaW5zdCBhIGNvdXBsZSBcImJpbmFyeVwiIHN0cmluZ3MuIFRoaXMgbGV0cyBTYWZlQnVmZmVyIG1hdGNoIE5vZGVKUyBCdWZmZXIgYmVoYXZpb3IgbW9yZSB3aGVyZSBpdCBzYWZlbHkgYnRvYXMgcmVndWxhciBzdHJpbmdzLlxuICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gaW5wdXQubGVuZ3RoXG4gICAgICAgICAgICBjb25zdCB3b3JkcyA9IG5ldyBVaW50MTZBcnJheShsZW5ndGgpXG4gICAgICAgICAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBsZW5ndGggfSwgKF8sIGkpID0+IHdvcmRzW2ldID0gaW5wdXQuY2hhckNvZGVBdChpKSlcbiAgICAgICAgICAgIGJ1ZiA9IFNlYUFycmF5LmZyb20od29yZHMpXG4gICAgICAgICAgfSBlbHNlIGlmIChlbmMgPT09ICdiYXNlNjQnKSB7XG4gICAgICAgICAgICBjb25zdCBkZWMgPSBhdG9iKGlucHV0KVxuICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gZGVjLmxlbmd0aFxuICAgICAgICAgICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShsZW5ndGgpXG4gICAgICAgICAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBsZW5ndGggfSwgKF8sIGkpID0+IGJ5dGVzW2ldID0gZGVjLmNoYXJDb2RlQXQoaSkpXG4gICAgICAgICAgICBidWYgPSBTZWFBcnJheS5mcm9tKGJ5dGVzKVxuICAgICAgICAgIH0gZWxzZSBpZiAoZW5jID09PSAnYmluYXJ5JykgeyAvLyBkZXByZWNhdGVkIGJ5IGFib3ZlIGNvbW1lbnRcbiAgICAgICAgICAgIGJ1ZiA9IFNlYUFycmF5LmZyb20oaW5wdXQpIC8vIHNvbWUgYnRvYXMgd2VyZSBtaXNoYW5kbGVkLlxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ1NhZmVCdWZmZXIuZnJvbSB1bmtub3duIGVuY29kaW5nOiAnK2VuYylcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGJ1ZlxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJ5dGVMZW5ndGggPSBpbnB1dC5ieXRlTGVuZ3RoIC8vIHdoYXQgaXMgZ29pbmcgb24gaGVyZT8gRk9SIE1BUlRUSVxuICAgICAgICBjb25zdCBsZW5ndGggPSBpbnB1dC5ieXRlTGVuZ3RoID8gaW5wdXQuYnl0ZUxlbmd0aCA6IGlucHV0Lmxlbmd0aFxuICAgICAgICBpZiAobGVuZ3RoKSB7XG4gICAgICAgICAgbGV0IGJ1ZlxuICAgICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgICBidWYgPSBuZXcgVWludDhBcnJheShpbnB1dClcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFNlYUFycmF5LmZyb20oYnVmIHx8IGlucHV0KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gVGhpcyBpcyAnc2FmZS1idWZmZXIuYWxsb2MnIHNhbnMgZW5jb2Rpbmcgc3VwcG9ydFxuICAgICAgYWxsb2MobGVuZ3RoLCBmaWxsID0gMCAvKiwgZW5jKi8gKSB7XG4gICAgICAgIHJldHVybiBTZWFBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KEFycmF5LmZyb20oeyBsZW5ndGg6IGxlbmd0aCB9LCAoKSA9PiBmaWxsKSkpXG4gICAgICB9LFxuICAgICAgLy8gVGhpcyBpcyBub3JtYWwgVU5TQUZFICdidWZmZXIuYWxsb2MnIG9yICduZXcgQnVmZmVyKGxlbmd0aCknIC0gZG9uJ3QgdXNlIVxuICAgICAgYWxsb2NVbnNhZmUobGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBTZWFBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KEFycmF5LmZyb20oeyBsZW5ndGggOiBsZW5ndGggfSkpKVxuICAgICAgfSxcbiAgICAgIC8vIFRoaXMgcHV0cyB0b2dldGhlciBhcnJheSBvZiBhcnJheSBsaWtlIG1lbWJlcnNcbiAgICAgIGNvbmNhdChhcnIpIHsgLy8gb2N0ZXQgYXJyYXlcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIEFycmF5IGNvbnRhaW5pbmcgQXJyYXlCdWZmZXIgb3IgVWludDhBcnJheSBpbnN0YW5jZXMuJylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gU2VhQXJyYXkuZnJvbShhcnIucmVkdWNlKChyZXQsIGl0ZW0pID0+IHJldC5jb25jYXQoQXJyYXkuZnJvbShpdGVtKSksIFtdKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIFNhZmVCdWZmZXIucHJvdG90eXBlLmZyb20gPSBTYWZlQnVmZmVyLmZyb21cbiAgICBTYWZlQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IFNlYUFycmF5LnByb3RvdHlwZS50b1N0cmluZ1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTYWZlQnVmZmVyO1xuICB9KShVU0UsICcuL2J1ZmZlcicpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICBjb25zdCBTRUEgPSBVU0UoJy4vcm9vdCcpXG4gICAgY29uc3QgYXBpID0ge0J1ZmZlcjogVVNFKCcuL2J1ZmZlcicpfVxuICAgIHZhciBvID0ge30sIHU7XG5cbiAgICAvLyBpZGVhbGx5IHdlIGNhbiBtb3ZlIGF3YXkgZnJvbSBKU09OIGVudGlyZWx5PyB1bmxpa2VseSBkdWUgdG8gY29tcGF0aWJpbGl0eSBpc3N1ZXMuLi4gb2ggd2VsbC5cbiAgICBKU09OLnBhcnNlQXN5bmMgPSBKU09OLnBhcnNlQXN5bmMgfHwgZnVuY3Rpb24odCxjYixyKXsgdmFyIHU7IHRyeXsgY2IodSwgSlNPTi5wYXJzZSh0LHIpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxuICAgIEpTT04uc3RyaW5naWZ5QXN5bmMgPSBKU09OLnN0cmluZ2lmeUFzeW5jIHx8IGZ1bmN0aW9uKHYsY2IscixzKXsgdmFyIHU7IHRyeXsgY2IodSwgSlNPTi5zdHJpbmdpZnkodixyLHMpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxuXG4gICAgYXBpLnBhcnNlID0gZnVuY3Rpb24odCxyKXsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgIEpTT04ucGFyc2VBc3luYyh0LGZ1bmN0aW9uKGVyciwgcmF3KXsgZXJyPyByZWooZXJyKSA6IHJlcyhyYXcpIH0scik7XG4gICAgfSl9XG4gICAgYXBpLnN0cmluZ2lmeSA9IGZ1bmN0aW9uKHYscixzKXsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgIEpTT04uc3RyaW5naWZ5QXN5bmModixmdW5jdGlvbihlcnIsIHJhdyl7IGVycj8gcmVqKGVycikgOiByZXMocmF3KSB9LHIscyk7XG4gICAgfSl9XG5cbiAgICBpZihTRUEud2luZG93KXtcbiAgICAgIGFwaS5jcnlwdG8gPSB3aW5kb3cuY3J5cHRvIHx8IHdpbmRvdy5tc0NyeXB0b1xuICAgICAgYXBpLnN1YnRsZSA9IChhcGkuY3J5cHRvfHxvKS5zdWJ0bGUgfHwgKGFwaS5jcnlwdG98fG8pLndlYmtpdFN1YnRsZTtcbiAgICAgIGFwaS5UZXh0RW5jb2RlciA9IHdpbmRvdy5UZXh0RW5jb2RlcjtcbiAgICAgIGFwaS5UZXh0RGVjb2RlciA9IHdpbmRvdy5UZXh0RGVjb2RlcjtcbiAgICAgIGFwaS5yYW5kb20gPSAobGVuKSA9PiBhcGkuQnVmZmVyLmZyb20oYXBpLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoYXBpLkJ1ZmZlci5hbGxvYyhsZW4pKSkpO1xuICAgIH1cbiAgICBpZighYXBpLlRleHREZWNvZGVyKVxuICAgIHtcbiAgICAgIGNvbnN0IHsgVGV4dEVuY29kZXIsIFRleHREZWNvZGVyIH0gPSBVU0UoKHUrJycgPT0gdHlwZW9mIE1PRFVMRT8nLic6JycpKycuL2xpYi90ZXh0LWVuY29kaW5nJywgMSk7XG4gICAgICBhcGkuVGV4dERlY29kZXIgPSBUZXh0RGVjb2RlcjtcbiAgICAgIGFwaS5UZXh0RW5jb2RlciA9IFRleHRFbmNvZGVyO1xuICAgIH1cbiAgICBpZighYXBpLmNyeXB0bylcbiAgICB7XG4gICAgICB0cnlcbiAgICAgIHtcbiAgICAgIHZhciBjcnlwdG8gPSBVU0UoJ2NyeXB0bycsIDEpO1xuICAgICAgT2JqZWN0LmFzc2lnbihhcGksIHtcbiAgICAgICAgY3J5cHRvLFxuICAgICAgICByYW5kb206IChsZW4pID0+IGFwaS5CdWZmZXIuZnJvbShjcnlwdG8ucmFuZG9tQnl0ZXMobGVuKSlcbiAgICAgIH0pOyAgICAgIFxuICAgICAgY29uc3QgeyBDcnlwdG86IFdlYkNyeXB0byB9ID0gVVNFKCdAcGVjdWxpYXIvd2ViY3J5cHRvJywgMSk7XG4gICAgICBhcGkub3NzbCA9IGFwaS5zdWJ0bGUgPSBuZXcgV2ViQ3J5cHRvKHtkaXJlY3Rvcnk6ICdvc3NsJ30pLnN1YnRsZSAvLyBFQ0RIXG4gICAgfVxuICAgIGNhdGNoKGUpe1xuICAgICAgY29uc29sZS5sb2coXCJQbGVhc2UgYG5wbSBpbnN0YWxsIEBwZWN1bGlhci93ZWJjcnlwdG9gIG9yIGFkZCBpdCB0byB5b3VyIHBhY2thZ2UuanNvbiAhXCIpO1xuICAgIH19XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGFwaVxuICB9KShVU0UsICcuL3NoaW0nKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBzID0ge307XG4gICAgcy5wYmtkZjIgPSB7aGFzaDoge25hbWUgOiAnU0hBLTI1Nid9LCBpdGVyOiAxMDAwMDAsIGtzOiA2NH07XG4gICAgcy5lY2RzYSA9IHtcbiAgICAgIHBhaXI6IHtuYW1lOiAnRUNEU0EnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSxcbiAgICAgIHNpZ246IHtuYW1lOiAnRUNEU0EnLCBoYXNoOiB7bmFtZTogJ1NIQS0yNTYnfX1cbiAgICB9O1xuICAgIHMuZWNkaCA9IHtuYW1lOiAnRUNESCcsIG5hbWVkQ3VydmU6ICdQLTI1Nid9O1xuXG4gICAgLy8gVGhpcyBjcmVhdGVzIFdlYiBDcnlwdG9ncmFwaHkgQVBJIGNvbXBsaWFudCBKV0sgZm9yIHNpZ24vdmVyaWZ5IHB1cnBvc2VzXG4gICAgcy5qd2sgPSBmdW5jdGlvbihwdWIsIGQpeyAgLy8gZCA9PT0gcHJpdlxuICAgICAgcHViID0gcHViLnNwbGl0KCcuJyk7XG4gICAgICB2YXIgeCA9IHB1YlswXSwgeSA9IHB1YlsxXTtcbiAgICAgIHZhciBqd2sgPSB7a3R5OiBcIkVDXCIsIGNydjogXCJQLTI1NlwiLCB4OiB4LCB5OiB5LCBleHQ6IHRydWV9O1xuICAgICAgandrLmtleV9vcHMgPSBkID8gWydzaWduJ10gOiBbJ3ZlcmlmeSddO1xuICAgICAgaWYoZCl7IGp3ay5kID0gZCB9XG4gICAgICByZXR1cm4gandrO1xuICAgIH07XG4gICAgXG4gICAgcy5rZXlUb0p3ayA9IGZ1bmN0aW9uKGtleUJ5dGVzKSB7XG4gICAgICBjb25zdCBrZXlCNjQgPSBrZXlCeXRlcy50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICBjb25zdCBrID0ga2V5QjY0LnJlcGxhY2UoL1xcKy9nLCAnLScpLnJlcGxhY2UoL1xcLy9nLCAnXycpLnJlcGxhY2UoL1xcPS9nLCAnJyk7XG4gICAgICByZXR1cm4geyBrdHk6ICdvY3QnLCBrOiBrLCBleHQ6IGZhbHNlLCBhbGc6ICdBMjU2R0NNJyB9O1xuICAgIH1cblxuICAgIHMucmVjYWxsID0ge1xuICAgICAgdmFsaWRpdHk6IDEyICogNjAgKiA2MCwgLy8gaW50ZXJuYWxseSBpbiBzZWNvbmRzIDogMTIgaG91cnNcbiAgICAgIGhvb2s6IGZ1bmN0aW9uKHByb3BzKXsgcmV0dXJuIHByb3BzIH0gLy8geyBpYXQsIGV4cCwgYWxpYXMsIHJlbWVtYmVyIH0gLy8gb3IgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUocHJvcHMpXG4gICAgfTtcblxuICAgIHMuY2hlY2sgPSBmdW5jdGlvbih0KXsgcmV0dXJuICh0eXBlb2YgdCA9PSAnc3RyaW5nJykgJiYgKCdTRUF7JyA9PT0gdC5zbGljZSgwLDQpKSB9XG4gICAgcy5wYXJzZSA9IGFzeW5jIGZ1bmN0aW9uIHAodCl7IHRyeSB7XG4gICAgICB2YXIgeWVzID0gKHR5cGVvZiB0ID09ICdzdHJpbmcnKTtcbiAgICAgIGlmKHllcyAmJiAnU0VBeycgPT09IHQuc2xpY2UoMCw0KSl7IHQgPSB0LnNsaWNlKDMpIH1cbiAgICAgIHJldHVybiB5ZXMgPyBhd2FpdCBzaGltLnBhcnNlKHQpIDogdDtcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICByZXR1cm4gdDtcbiAgICB9XG5cbiAgICBTRUEub3B0ID0gcztcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHNcbiAgfSkoVVNFLCAnLi9zZXR0aW5ncycpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgc2hpbSA9IFVTRSgnLi9zaGltJyk7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbihkLCBvKXtcbiAgICAgIHZhciB0ID0gKHR5cGVvZiBkID09ICdzdHJpbmcnKT8gZCA6IGF3YWl0IHNoaW0uc3RyaW5naWZ5KGQpO1xuICAgICAgdmFyIGhhc2ggPSBhd2FpdCBzaGltLnN1YnRsZS5kaWdlc3Qoe25hbWU6IG98fCdTSEEtMjU2J30sIG5ldyBzaGltLlRleHRFbmNvZGVyKCkuZW5jb2RlKHQpKTtcbiAgICAgIHJldHVybiBzaGltLkJ1ZmZlci5mcm9tKGhhc2gpO1xuICAgIH1cbiAgfSkoVVNFLCAnLi9zaGEyNTYnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgLy8gVGhpcyBpbnRlcm5hbCBmdW5jIHJldHVybnMgU0hBLTEgaGFzaGVkIGRhdGEgZm9yIEtleUlEIGdlbmVyYXRpb25cbiAgICBjb25zdCBfX3NoaW0gPSBVU0UoJy4vc2hpbScpXG4gICAgY29uc3Qgc3VidGxlID0gX19zaGltLnN1YnRsZVxuICAgIGNvbnN0IG9zc2wgPSBfX3NoaW0ub3NzbCA/IF9fc2hpbS5vc3NsIDogc3VidGxlXG4gICAgY29uc3Qgc2hhMWhhc2ggPSAoYikgPT4gb3NzbC5kaWdlc3Qoe25hbWU6ICdTSEEtMSd9LCBuZXcgQXJyYXlCdWZmZXIoYikpXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzaGExaGFzaFxuICB9KShVU0UsICcuL3NoYTEnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgdmFyIHNoYSA9IFVTRSgnLi9zaGEyNTYnKTtcbiAgICB2YXIgdTtcblxuICAgIFNFQS53b3JrID0gU0VBLndvcmsgfHwgKGFzeW5jIChkYXRhLCBwYWlyLCBjYiwgb3B0KSA9PiB7IHRyeSB7IC8vIHVzZWQgdG8gYmUgbmFtZWQgYHByb29mYFxuICAgICAgdmFyIHNhbHQgPSAocGFpcnx8e30pLmVwdWIgfHwgcGFpcjsgLy8gZXB1YiBub3QgcmVjb21tZW5kZWQsIHNhbHQgc2hvdWxkIGJlIHJhbmRvbSFcbiAgICAgIG9wdCA9IG9wdCB8fCB7fTtcbiAgICAgIGlmKHNhbHQgaW5zdGFuY2VvZiBGdW5jdGlvbil7XG4gICAgICAgIGNiID0gc2FsdDtcbiAgICAgICAgc2FsdCA9IHU7XG4gICAgICB9XG4gICAgICBkYXRhID0gKHR5cGVvZiBkYXRhID09ICdzdHJpbmcnKT8gZGF0YSA6IGF3YWl0IHNoaW0uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgaWYoJ3NoYScgPT09IChvcHQubmFtZXx8JycpLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwzKSl7XG4gICAgICAgIHZhciByc2hhID0gc2hpbS5CdWZmZXIuZnJvbShhd2FpdCBzaGEoZGF0YSwgb3B0Lm5hbWUpLCAnYmluYXJ5JykudG9TdHJpbmcob3B0LmVuY29kZSB8fCAnYmFzZTY0JylcbiAgICAgICAgaWYoY2IpeyB0cnl7IGNiKHJzaGEpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgICByZXR1cm4gcnNoYTtcbiAgICAgIH1cbiAgICAgIHNhbHQgPSBzYWx0IHx8IHNoaW0ucmFuZG9tKDkpO1xuICAgICAgdmFyIGtleSA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLmltcG9ydEtleSgncmF3JywgbmV3IHNoaW0uVGV4dEVuY29kZXIoKS5lbmNvZGUoZGF0YSksIHtuYW1lOiBvcHQubmFtZSB8fCAnUEJLREYyJ30sIGZhbHNlLCBbJ2Rlcml2ZUJpdHMnXSk7XG4gICAgICB2YXIgd29yayA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLmRlcml2ZUJpdHMoe1xuICAgICAgICBuYW1lOiBvcHQubmFtZSB8fCAnUEJLREYyJyxcbiAgICAgICAgaXRlcmF0aW9uczogb3B0Lml0ZXJhdGlvbnMgfHwgUy5wYmtkZjIuaXRlcixcbiAgICAgICAgc2FsdDogbmV3IHNoaW0uVGV4dEVuY29kZXIoKS5lbmNvZGUob3B0LnNhbHQgfHwgc2FsdCksXG4gICAgICAgIGhhc2g6IG9wdC5oYXNoIHx8IFMucGJrZGYyLmhhc2gsXG4gICAgICB9LCBrZXksIG9wdC5sZW5ndGggfHwgKFMucGJrZGYyLmtzICogOCkpXG4gICAgICBkYXRhID0gc2hpbS5yYW5kb20oZGF0YS5sZW5ndGgpICAvLyBFcmFzZSBkYXRhIGluIGNhc2Ugb2YgcGFzc3BocmFzZVxuICAgICAgdmFyIHIgPSBzaGltLkJ1ZmZlci5mcm9tKHdvcmssICdiaW5hcnknKS50b1N0cmluZyhvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKVxuICAgICAgaWYoY2IpeyB0cnl7IGNiKHIpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSBjYXRjaChlKSB7IFxuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBTRUEuZXJyID0gZTtcbiAgICAgIGlmKFNFQS50aHJvdyl7IHRocm93IGUgfVxuICAgICAgaWYoY2IpeyBjYigpIH1cbiAgICAgIHJldHVybjtcbiAgICB9fSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQS53b3JrO1xuICB9KShVU0UsICcuL3dvcmsnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG5cbiAgICBTRUEubmFtZSA9IFNFQS5uYW1lIHx8IChhc3luYyAoY2IsIG9wdCkgPT4geyB0cnkge1xuICAgICAgaWYoY2IpeyB0cnl7IGNiKCkgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICByZXR1cm47XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgIFNFQS5lcnIgPSBlO1xuICAgICAgaWYoU0VBLnRocm93KXsgdGhyb3cgZSB9XG4gICAgICBpZihjYil7IGNiKCkgfVxuICAgICAgcmV0dXJuO1xuICAgIH19KTtcblxuICAgIC8vU0VBLnBhaXIgPSBhc3luYyAoZGF0YSwgcHJvb2YsIGNiKSA9PiB7IHRyeSB7XG4gICAgU0VBLnBhaXIgPSBTRUEucGFpciB8fCAoYXN5bmMgKGNiLCBvcHQpID0+IHsgdHJ5IHtcblxuICAgICAgdmFyIGVjZGhTdWJ0bGUgPSBzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGU7XG4gICAgICAvLyBGaXJzdDogRUNEU0Ega2V5cyBmb3Igc2lnbmluZy92ZXJpZnlpbmcuLi5cbiAgICAgIHZhciBzYSA9IGF3YWl0IHNoaW0uc3VidGxlLmdlbmVyYXRlS2V5KHtuYW1lOiAnRUNEU0EnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSwgdHJ1ZSwgWyAnc2lnbicsICd2ZXJpZnknIF0pXG4gICAgICAudGhlbihhc3luYyAoa2V5cykgPT4ge1xuICAgICAgICAvLyBwcml2YXRlS2V5IHNjb3BlIGRvZXNuJ3QgbGVhayBvdXQgZnJvbSBoZXJlIVxuICAgICAgICAvL2NvbnN0IHsgZDogcHJpdiB9ID0gYXdhaXQgc2hpbS5zdWJ0bGUuZXhwb3J0S2V5KCdqd2snLCBrZXlzLnByaXZhdGVLZXkpXG4gICAgICAgIHZhciBrZXkgPSB7fTtcbiAgICAgICAga2V5LnByaXYgPSAoYXdhaXQgc2hpbS5zdWJ0bGUuZXhwb3J0S2V5KCdqd2snLCBrZXlzLnByaXZhdGVLZXkpKS5kO1xuICAgICAgICB2YXIgcHViID0gYXdhaXQgc2hpbS5zdWJ0bGUuZXhwb3J0S2V5KCdqd2snLCBrZXlzLnB1YmxpY0tleSk7XG4gICAgICAgIC8vY29uc3QgcHViID0gQnVmZi5mcm9tKFsgeCwgeSBdLmpvaW4oJzonKSkudG9TdHJpbmcoJ2Jhc2U2NCcpIC8vIG9sZFxuICAgICAgICBrZXkucHViID0gcHViLngrJy4nK3B1Yi55OyAvLyBuZXdcbiAgICAgICAgLy8geCBhbmQgeSBhcmUgYWxyZWFkeSBiYXNlNjRcbiAgICAgICAgLy8gcHViIGlzIFVURjggYnV0IGZpbGVuYW1lL1VSTCBzYWZlIChodHRwczovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMzk4Ni50eHQpXG4gICAgICAgIC8vIGJ1dCBzcGxpdCBvbiBhIG5vbi1iYXNlNjQgbGV0dGVyLlxuICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgfSlcbiAgICAgIFxuICAgICAgLy8gVG8gaW5jbHVkZSBQR1B2NCBraW5kIG9mIGtleUlkOlxuICAgICAgLy8gY29uc3QgcHViSWQgPSBhd2FpdCBTRUEua2V5aWQoa2V5cy5wdWIpXG4gICAgICAvLyBOZXh0OiBFQ0RIIGtleXMgZm9yIGVuY3J5cHRpb24vZGVjcnlwdGlvbi4uLlxuXG4gICAgICB0cnl7XG4gICAgICB2YXIgZGggPSBhd2FpdCBlY2RoU3VidGxlLmdlbmVyYXRlS2V5KHtuYW1lOiAnRUNESCcsIG5hbWVkQ3VydmU6ICdQLTI1Nid9LCB0cnVlLCBbJ2Rlcml2ZUtleSddKVxuICAgICAgLnRoZW4oYXN5bmMgKGtleXMpID0+IHtcbiAgICAgICAgLy8gcHJpdmF0ZUtleSBzY29wZSBkb2Vzbid0IGxlYWsgb3V0IGZyb20gaGVyZSFcbiAgICAgICAgdmFyIGtleSA9IHt9O1xuICAgICAgICBrZXkuZXByaXYgPSAoYXdhaXQgZWNkaFN1YnRsZS5leHBvcnRLZXkoJ2p3aycsIGtleXMucHJpdmF0ZUtleSkpLmQ7XG4gICAgICAgIHZhciBwdWIgPSBhd2FpdCBlY2RoU3VidGxlLmV4cG9ydEtleSgnandrJywga2V5cy5wdWJsaWNLZXkpO1xuICAgICAgICAvL2NvbnN0IGVwdWIgPSBCdWZmLmZyb20oWyBleCwgZXkgXS5qb2luKCc6JykpLnRvU3RyaW5nKCdiYXNlNjQnKSAvLyBvbGRcbiAgICAgICAga2V5LmVwdWIgPSBwdWIueCsnLicrcHViLnk7IC8vIG5ld1xuICAgICAgICAvLyBleCBhbmQgZXkgYXJlIGFscmVhZHkgYmFzZTY0XG4gICAgICAgIC8vIGVwdWIgaXMgVVRGOCBidXQgZmlsZW5hbWUvVVJMIHNhZmUgKGh0dHBzOi8vd3d3LmlldGYub3JnL3JmYy9yZmMzOTg2LnR4dClcbiAgICAgICAgLy8gYnV0IHNwbGl0IG9uIGEgbm9uLWJhc2U2NCBsZXR0ZXIuXG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgICB9KVxuICAgICAgfWNhdGNoKGUpe1xuICAgICAgICBpZihTRUEud2luZG93KXsgdGhyb3cgZSB9XG4gICAgICAgIGlmKGUgPT0gJ0Vycm9yOiBFQ0RIIGlzIG5vdCBhIHN1cHBvcnRlZCBhbGdvcml0aG0nKXsgY29uc29sZS5sb2coJ0lnbm9yaW5nIEVDREguLi4nKSB9XG4gICAgICAgIGVsc2UgeyB0aHJvdyBlIH1cbiAgICAgIH0gZGggPSBkaCB8fCB7fTtcblxuICAgICAgdmFyIHIgPSB7IHB1Yjogc2EucHViLCBwcml2OiBzYS5wcml2LCAvKiBwdWJJZCwgKi8gZXB1YjogZGguZXB1YiwgZXByaXY6IGRoLmVwcml2IH1cbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBTRUEuZXJyID0gZTtcbiAgICAgIGlmKFNFQS50aHJvdyl7IHRocm93IGUgfVxuICAgICAgaWYoY2IpeyBjYigpIH1cbiAgICAgIHJldHVybjtcbiAgICB9fSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQS5wYWlyO1xuICB9KShVU0UsICcuL3BhaXInKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgdmFyIHNoYSA9IFVTRSgnLi9zaGEyNTYnKTtcbiAgICB2YXIgdTtcblxuICAgIFNFQS5zaWduID0gU0VBLnNpZ24gfHwgKGFzeW5jIChkYXRhLCBwYWlyLCBjYiwgb3B0KSA9PiB7IHRyeSB7XG4gICAgICBvcHQgPSBvcHQgfHwge307XG4gICAgICBpZighKHBhaXJ8fG9wdCkucHJpdil7XG4gICAgICAgIGlmKCFTRUEuSSl7IHRocm93ICdObyBzaWduaW5nIGtleS4nIH1cbiAgICAgICAgcGFpciA9IGF3YWl0IFNFQS5JKG51bGwsIHt3aGF0OiBkYXRhLCBob3c6ICdzaWduJywgd2h5OiBvcHQud2h5fSk7XG4gICAgICB9XG4gICAgICBpZih1ID09PSBkYXRhKXsgdGhyb3cgJ2B1bmRlZmluZWRgIG5vdCBhbGxvd2VkLicgfVxuICAgICAgdmFyIGpzb24gPSBhd2FpdCBTLnBhcnNlKGRhdGEpO1xuICAgICAgdmFyIGNoZWNrID0gb3B0LmNoZWNrID0gb3B0LmNoZWNrIHx8IGpzb247XG4gICAgICBpZihTRUEudmVyaWZ5ICYmIChTRUEub3B0LmNoZWNrKGNoZWNrKSB8fCAoY2hlY2sgJiYgY2hlY2sucyAmJiBjaGVjay5tKSlcbiAgICAgICYmIHUgIT09IGF3YWl0IFNFQS52ZXJpZnkoY2hlY2ssIHBhaXIpKXsgLy8gZG9uJ3Qgc2lnbiBpZiB3ZSBhbHJlYWR5IHNpZ25lZCBpdC5cbiAgICAgICAgdmFyIHIgPSBhd2FpdCBTLnBhcnNlKGNoZWNrKTtcbiAgICAgICAgaWYoIW9wdC5yYXcpeyByID0gJ1NFQScgKyBhd2FpdCBzaGltLnN0cmluZ2lmeShyKSB9XG4gICAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgICAgcmV0dXJuIHI7XG4gICAgICB9XG4gICAgICB2YXIgcHViID0gcGFpci5wdWI7XG4gICAgICB2YXIgcHJpdiA9IHBhaXIucHJpdjtcbiAgICAgIHZhciBqd2sgPSBTLmp3ayhwdWIsIHByaXYpO1xuICAgICAgdmFyIGhhc2ggPSBhd2FpdCBzaGEoanNvbik7XG4gICAgICB2YXIgc2lnID0gYXdhaXQgKHNoaW0ub3NzbCB8fCBzaGltLnN1YnRsZSkuaW1wb3J0S2V5KCdqd2snLCBqd2ssIHtuYW1lOiAnRUNEU0EnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSwgZmFsc2UsIFsnc2lnbiddKVxuICAgICAgLnRoZW4oKGtleSkgPT4gKHNoaW0ub3NzbCB8fCBzaGltLnN1YnRsZSkuc2lnbih7bmFtZTogJ0VDRFNBJywgaGFzaDoge25hbWU6ICdTSEEtMjU2J319LCBrZXksIG5ldyBVaW50OEFycmF5KGhhc2gpKSkgLy8gcHJpdmF0ZUtleSBzY29wZSBkb2Vzbid0IGxlYWsgb3V0IGZyb20gaGVyZSFcbiAgICAgIHZhciByID0ge206IGpzb24sIHM6IHNoaW0uQnVmZmVyLmZyb20oc2lnLCAnYmluYXJ5JykudG9TdHJpbmcob3B0LmVuY29kZSB8fCAnYmFzZTY0Jyl9XG4gICAgICBpZighb3B0LnJhdyl7IHIgPSAnU0VBJyArIGF3YWl0IHNoaW0uc3RyaW5naWZ5KHIpIH1cblxuICAgICAgaWYoY2IpeyB0cnl7IGNiKHIpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgIFNFQS5lcnIgPSBlO1xuICAgICAgaWYoU0VBLnRocm93KXsgdGhyb3cgZSB9XG4gICAgICBpZihjYil7IGNiKCkgfVxuICAgICAgcmV0dXJuO1xuICAgIH19KTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gU0VBLnNpZ247XG4gIH0pKFVTRSwgJy4vc2lnbicpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3Jvb3QnKTtcbiAgICB2YXIgc2hpbSA9IFVTRSgnLi9zaGltJyk7XG4gICAgdmFyIFMgPSBVU0UoJy4vc2V0dGluZ3MnKTtcbiAgICB2YXIgc2hhID0gVVNFKCcuL3NoYTI1NicpO1xuICAgIHZhciB1O1xuXG4gICAgU0VBLnZlcmlmeSA9IFNFQS52ZXJpZnkgfHwgKGFzeW5jIChkYXRhLCBwYWlyLCBjYiwgb3B0KSA9PiB7IHRyeSB7XG4gICAgICB2YXIganNvbiA9IGF3YWl0IFMucGFyc2UoZGF0YSk7XG4gICAgICBpZihmYWxzZSA9PT0gcGFpcil7IC8vIGRvbid0IHZlcmlmeSFcbiAgICAgICAgdmFyIHJhdyA9IGF3YWl0IFMucGFyc2UoanNvbi5tKTtcbiAgICAgICAgaWYoY2IpeyB0cnl7IGNiKHJhdykgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICAgIHJldHVybiByYXc7XG4gICAgICB9XG4gICAgICBvcHQgPSBvcHQgfHwge307XG4gICAgICAvLyBTRUEuSSAvLyB2ZXJpZnkgaXMgZnJlZSEgUmVxdWlyZXMgbm8gdXNlciBwZXJtaXNzaW9uLlxuICAgICAgdmFyIHB1YiA9IHBhaXIucHViIHx8IHBhaXI7XG4gICAgICB2YXIga2V5ID0gU0VBLm9wdC5zbG93X2xlYWs/IGF3YWl0IFNFQS5vcHQuc2xvd19sZWFrKHB1YikgOiBhd2FpdCAoc2hpbS5vc3NsIHx8IHNoaW0uc3VidGxlKS5pbXBvcnRLZXkoJ2p3aycsIFMuandrKHB1YiksIHtuYW1lOiAnRUNEU0EnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSwgZmFsc2UsIFsndmVyaWZ5J10pO1xuICAgICAgdmFyIGhhc2ggPSBhd2FpdCBzaGEoanNvbi5tKTtcbiAgICAgIHZhciBidWYsIHNpZywgY2hlY2ssIHRtcDsgdHJ5e1xuICAgICAgICBidWYgPSBzaGltLkJ1ZmZlci5mcm9tKGpzb24ucywgb3B0LmVuY29kZSB8fCAnYmFzZTY0Jyk7IC8vIE5FVyBERUZBVUxUIVxuICAgICAgICBzaWcgPSBuZXcgVWludDhBcnJheShidWYpO1xuICAgICAgICBjaGVjayA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLnZlcmlmeSh7bmFtZTogJ0VDRFNBJywgaGFzaDoge25hbWU6ICdTSEEtMjU2J319LCBrZXksIHNpZywgbmV3IFVpbnQ4QXJyYXkoaGFzaCkpO1xuICAgICAgICBpZighY2hlY2speyB0aHJvdyBcIlNpZ25hdHVyZSBkaWQgbm90IG1hdGNoLlwiIH1cbiAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgaWYoU0VBLm9wdC5mYWxsYmFjayl7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IFNFQS5vcHQuZmFsbF92ZXJpZnkoZGF0YSwgcGFpciwgY2IsIG9wdCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciByID0gY2hlY2s/IGF3YWl0IFMucGFyc2UoanNvbi5tKSA6IHU7XG5cbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgY29uc29sZS5sb2coZSk7IC8vIG1pc21hdGNoZWQgb3duZXIgRk9SIE1BUlRUSVxuICAgICAgU0VBLmVyciA9IGU7XG4gICAgICBpZihTRUEudGhyb3cpeyB0aHJvdyBlIH1cbiAgICAgIGlmKGNiKXsgY2IoKSB9XG4gICAgICByZXR1cm47XG4gICAgfX0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUEudmVyaWZ5O1xuICAgIC8vIGxlZ2FjeSAmIG9zc2wgbWVtb3J5IGxlYWsgbWl0aWdhdGlvbjpcblxuICAgIHZhciBrbm93bktleXMgPSB7fTtcbiAgICB2YXIga2V5Rm9yUGFpciA9IFNFQS5vcHQuc2xvd19sZWFrID0gcGFpciA9PiB7XG4gICAgICBpZiAoa25vd25LZXlzW3BhaXJdKSByZXR1cm4ga25vd25LZXlzW3BhaXJdO1xuICAgICAgdmFyIGp3ayA9IFMuandrKHBhaXIpO1xuICAgICAga25vd25LZXlzW3BhaXJdID0gKHNoaW0ub3NzbCB8fCBzaGltLnN1YnRsZSkuaW1wb3J0S2V5KFwiandrXCIsIGp3aywge25hbWU6ICdFQ0RTQScsIG5hbWVkQ3VydmU6ICdQLTI1Nid9LCBmYWxzZSwgW1widmVyaWZ5XCJdKTtcbiAgICAgIHJldHVybiBrbm93bktleXNbcGFpcl07XG4gICAgfTtcblxuICAgIHZhciBPID0gU0VBLm9wdDtcbiAgICBTRUEub3B0LmZhbGxfdmVyaWZ5ID0gYXN5bmMgZnVuY3Rpb24oZGF0YSwgcGFpciwgY2IsIG9wdCwgZil7XG4gICAgICBpZihmID09PSBTRUEub3B0LmZhbGxiYWNrKXsgdGhyb3cgXCJTaWduYXR1cmUgZGlkIG5vdCBtYXRjaFwiIH0gZiA9IGYgfHwgMTtcbiAgICAgIHZhciB0bXAgPSBkYXRhfHwnJztcbiAgICAgIGRhdGEgPSBTRUEub3B0LnVucGFjayhkYXRhKSB8fCBkYXRhO1xuICAgICAgdmFyIGpzb24gPSBhd2FpdCBTLnBhcnNlKGRhdGEpLCBwdWIgPSBwYWlyLnB1YiB8fCBwYWlyLCBrZXkgPSBhd2FpdCBTRUEub3B0LnNsb3dfbGVhayhwdWIpO1xuICAgICAgdmFyIGhhc2ggPSAoZiA8PSBTRUEub3B0LmZhbGxiYWNrKT8gc2hpbS5CdWZmZXIuZnJvbShhd2FpdCBzaGltLnN1YnRsZS5kaWdlc3Qoe25hbWU6ICdTSEEtMjU2J30sIG5ldyBzaGltLlRleHRFbmNvZGVyKCkuZW5jb2RlKGF3YWl0IFMucGFyc2UoanNvbi5tKSkpKSA6IGF3YWl0IHNoYShqc29uLm0pOyAvLyB0aGlzIGxpbmUgaXMgb2xkIGJhZCBidWdneSBjb2RlIGJ1dCBuZWNlc3NhcnkgZm9yIG9sZCBjb21wYXRpYmlsaXR5LlxuICAgICAgdmFyIGJ1ZjsgdmFyIHNpZzsgdmFyIGNoZWNrOyB0cnl7XG4gICAgICAgIGJ1ZiA9IHNoaW0uQnVmZmVyLmZyb20oanNvbi5zLCBvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKSAvLyBORVcgREVGQVVMVCFcbiAgICAgICAgc2lnID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgICAgICBjaGVjayA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLnZlcmlmeSh7bmFtZTogJ0VDRFNBJywgaGFzaDoge25hbWU6ICdTSEEtMjU2J319LCBrZXksIHNpZywgbmV3IFVpbnQ4QXJyYXkoaGFzaCkpXG4gICAgICAgIGlmKCFjaGVjayl7IHRocm93IFwiU2lnbmF0dXJlIGRpZCBub3QgbWF0Y2guXCIgfVxuICAgICAgfWNhdGNoKGUpeyB0cnl7XG4gICAgICAgIGJ1ZiA9IHNoaW0uQnVmZmVyLmZyb20oanNvbi5zLCAndXRmOCcpIC8vIEFVVE8gQkFDS1dBUkQgT0xEIFVURjggREFUQSFcbiAgICAgICAgc2lnID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgICAgICBjaGVjayA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLnZlcmlmeSh7bmFtZTogJ0VDRFNBJywgaGFzaDoge25hbWU6ICdTSEEtMjU2J319LCBrZXksIHNpZywgbmV3IFVpbnQ4QXJyYXkoaGFzaCkpXG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgaWYoIWNoZWNrKXsgdGhyb3cgXCJTaWduYXR1cmUgZGlkIG5vdCBtYXRjaC5cIiB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciByID0gY2hlY2s/IGF3YWl0IFMucGFyc2UoanNvbi5tKSA6IHU7XG4gICAgICBPLmZhbGxfc291bCA9IHRtcFsnIyddOyBPLmZhbGxfa2V5ID0gdG1wWycuJ107IE8uZmFsbF92YWwgPSBkYXRhOyBPLmZhbGxfc3RhdGUgPSB0bXBbJz4nXTtcbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICBTRUEub3B0LmZhbGxiYWNrID0gMjtcblxuICB9KShVU0UsICcuL3ZlcmlmeScpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgc2hpbSA9IFVTRSgnLi9zaGltJyk7XG4gICAgdmFyIFMgPSBVU0UoJy4vc2V0dGluZ3MnKTtcbiAgICB2YXIgc2hhMjU2aGFzaCA9IFVTRSgnLi9zaGEyNTYnKTtcblxuICAgIGNvbnN0IGltcG9ydEdlbiA9IGFzeW5jIChrZXksIHNhbHQsIG9wdCkgPT4ge1xuICAgICAgLy9jb25zdCBjb21ibyA9IHNoaW0uQnVmZmVyLmNvbmNhdChbc2hpbS5CdWZmZXIuZnJvbShrZXksICd1dGY4JyksIHNhbHQgfHwgc2hpbS5yYW5kb20oOCldKS50b1N0cmluZygndXRmOCcpIC8vIG9sZFxuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgY29uc3QgY29tYm8gPSBrZXkgKyAoc2FsdCB8fCBzaGltLnJhbmRvbSg4KSkudG9TdHJpbmcoJ3V0ZjgnKTsgLy8gbmV3XG4gICAgICBjb25zdCBoYXNoID0gc2hpbS5CdWZmZXIuZnJvbShhd2FpdCBzaGEyNTZoYXNoKGNvbWJvKSwgJ2JpbmFyeScpXG4gICAgICBcbiAgICAgIGNvbnN0IGp3a0tleSA9IFMua2V5VG9Kd2soaGFzaCkgICAgICBcbiAgICAgIHJldHVybiBhd2FpdCBzaGltLnN1YnRsZS5pbXBvcnRLZXkoJ2p3aycsIGp3a0tleSwge25hbWU6J0FFUy1HQ00nfSwgZmFsc2UsIFsnZW5jcnlwdCcsICdkZWNyeXB0J10pXG4gICAgfVxuICAgIG1vZHVsZS5leHBvcnRzID0gaW1wb3J0R2VuO1xuICB9KShVU0UsICcuL2Flc2tleScpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3Jvb3QnKTtcbiAgICB2YXIgc2hpbSA9IFVTRSgnLi9zaGltJyk7XG4gICAgdmFyIFMgPSBVU0UoJy4vc2V0dGluZ3MnKTtcbiAgICB2YXIgYWVza2V5ID0gVVNFKCcuL2Flc2tleScpO1xuICAgIHZhciB1O1xuXG4gICAgU0VBLmVuY3J5cHQgPSBTRUEuZW5jcnlwdCB8fCAoYXN5bmMgKGRhdGEsIHBhaXIsIGNiLCBvcHQpID0+IHsgdHJ5IHtcbiAgICAgIG9wdCA9IG9wdCB8fCB7fTtcbiAgICAgIHZhciBrZXkgPSAocGFpcnx8b3B0KS5lcHJpdiB8fCBwYWlyO1xuICAgICAgaWYodSA9PT0gZGF0YSl7IHRocm93ICdgdW5kZWZpbmVkYCBub3QgYWxsb3dlZC4nIH1cbiAgICAgIGlmKCFrZXkpe1xuICAgICAgICBpZighU0VBLkkpeyB0aHJvdyAnTm8gZW5jcnlwdGlvbiBrZXkuJyB9XG4gICAgICAgIHBhaXIgPSBhd2FpdCBTRUEuSShudWxsLCB7d2hhdDogZGF0YSwgaG93OiAnZW5jcnlwdCcsIHdoeTogb3B0LndoeX0pO1xuICAgICAgICBrZXkgPSBwYWlyLmVwcml2IHx8IHBhaXI7XG4gICAgICB9XG4gICAgICB2YXIgbXNnID0gKHR5cGVvZiBkYXRhID09ICdzdHJpbmcnKT8gZGF0YSA6IGF3YWl0IHNoaW0uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgdmFyIHJhbmQgPSB7czogc2hpbS5yYW5kb20oOSksIGl2OiBzaGltLnJhbmRvbSgxNSl9OyAvLyBjb25zaWRlciBtYWtpbmcgdGhpcyA5IGFuZCAxNSBvciAxOCBvciAxMiB0byByZWR1Y2UgPT0gcGFkZGluZy5cbiAgICAgIHZhciBjdCA9IGF3YWl0IGFlc2tleShrZXksIHJhbmQucywgb3B0KS50aGVuKChhZXMpID0+ICgvKnNoaW0ub3NzbCB8fCovIHNoaW0uc3VidGxlKS5lbmNyeXB0KHsgLy8gS2VlcGluZyB0aGUgQUVTIGtleSBzY29wZSBhcyBwcml2YXRlIGFzIHBvc3NpYmxlLi4uXG4gICAgICAgIG5hbWU6IG9wdC5uYW1lIHx8ICdBRVMtR0NNJywgaXY6IG5ldyBVaW50OEFycmF5KHJhbmQuaXYpXG4gICAgICB9LCBhZXMsIG5ldyBzaGltLlRleHRFbmNvZGVyKCkuZW5jb2RlKG1zZykpKTtcbiAgICAgIHZhciByID0ge1xuICAgICAgICBjdDogc2hpbS5CdWZmZXIuZnJvbShjdCwgJ2JpbmFyeScpLnRvU3RyaW5nKG9wdC5lbmNvZGUgfHwgJ2Jhc2U2NCcpLFxuICAgICAgICBpdjogcmFuZC5pdi50b1N0cmluZyhvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKSxcbiAgICAgICAgczogcmFuZC5zLnRvU3RyaW5nKG9wdC5lbmNvZGUgfHwgJ2Jhc2U2NCcpXG4gICAgICB9XG4gICAgICBpZighb3B0LnJhdyl7IHIgPSAnU0VBJyArIGF3YWl0IHNoaW0uc3RyaW5naWZ5KHIpIH1cblxuICAgICAgaWYoY2IpeyB0cnl7IGNiKHIpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSBjYXRjaChlKSB7IFxuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBTRUEuZXJyID0gZTtcbiAgICAgIGlmKFNFQS50aHJvdyl7IHRocm93IGUgfVxuICAgICAgaWYoY2IpeyBjYigpIH1cbiAgICAgIHJldHVybjtcbiAgICB9fSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQS5lbmNyeXB0O1xuICB9KShVU0UsICcuL2VuY3J5cHQnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgdmFyIGFlc2tleSA9IFVTRSgnLi9hZXNrZXknKTtcblxuICAgIFNFQS5kZWNyeXB0ID0gU0VBLmRlY3J5cHQgfHwgKGFzeW5jIChkYXRhLCBwYWlyLCBjYiwgb3B0KSA9PiB7IHRyeSB7XG4gICAgICBvcHQgPSBvcHQgfHwge307XG4gICAgICB2YXIga2V5ID0gKHBhaXJ8fG9wdCkuZXByaXYgfHwgcGFpcjtcbiAgICAgIGlmKCFrZXkpe1xuICAgICAgICBpZighU0VBLkkpeyB0aHJvdyAnTm8gZGVjcnlwdGlvbiBrZXkuJyB9XG4gICAgICAgIHBhaXIgPSBhd2FpdCBTRUEuSShudWxsLCB7d2hhdDogZGF0YSwgaG93OiAnZGVjcnlwdCcsIHdoeTogb3B0LndoeX0pO1xuICAgICAgICBrZXkgPSBwYWlyLmVwcml2IHx8IHBhaXI7XG4gICAgICB9XG4gICAgICB2YXIganNvbiA9IGF3YWl0IFMucGFyc2UoZGF0YSk7XG4gICAgICB2YXIgYnVmLCBidWZpdiwgYnVmY3Q7IHRyeXtcbiAgICAgICAgYnVmID0gc2hpbS5CdWZmZXIuZnJvbShqc29uLnMsIG9wdC5lbmNvZGUgfHwgJ2Jhc2U2NCcpO1xuICAgICAgICBidWZpdiA9IHNoaW0uQnVmZmVyLmZyb20oanNvbi5pdiwgb3B0LmVuY29kZSB8fCAnYmFzZTY0Jyk7XG4gICAgICAgIGJ1ZmN0ID0gc2hpbS5CdWZmZXIuZnJvbShqc29uLmN0LCBvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKTtcbiAgICAgICAgdmFyIGN0ID0gYXdhaXQgYWVza2V5KGtleSwgYnVmLCBvcHQpLnRoZW4oKGFlcykgPT4gKC8qc2hpbS5vc3NsIHx8Ki8gc2hpbS5zdWJ0bGUpLmRlY3J5cHQoeyAgLy8gS2VlcGluZyBhZXNLZXkgc2NvcGUgYXMgcHJpdmF0ZSBhcyBwb3NzaWJsZS4uLlxuICAgICAgICAgIG5hbWU6IG9wdC5uYW1lIHx8ICdBRVMtR0NNJywgaXY6IG5ldyBVaW50OEFycmF5KGJ1Zml2KSwgdGFnTGVuZ3RoOiAxMjhcbiAgICAgICAgfSwgYWVzLCBuZXcgVWludDhBcnJheShidWZjdCkpKTtcbiAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgaWYoJ3V0ZjgnID09PSBvcHQuZW5jb2RlKXsgdGhyb3cgXCJDb3VsZCBub3QgZGVjcnlwdFwiIH1cbiAgICAgICAgaWYoU0VBLm9wdC5mYWxsYmFjayl7XG4gICAgICAgICAgb3B0LmVuY29kZSA9ICd1dGY4JztcbiAgICAgICAgICByZXR1cm4gYXdhaXQgU0VBLmRlY3J5cHQoZGF0YSwgcGFpciwgY2IsIG9wdCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciByID0gYXdhaXQgUy5wYXJzZShuZXcgc2hpbS5UZXh0RGVjb2RlcigndXRmOCcpLmRlY29kZShjdCkpO1xuICAgICAgaWYoY2IpeyB0cnl7IGNiKHIpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSBjYXRjaChlKSB7IFxuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBTRUEuZXJyID0gZTtcbiAgICAgIGlmKFNFQS50aHJvdyl7IHRocm93IGUgfVxuICAgICAgaWYoY2IpeyBjYigpIH1cbiAgICAgIHJldHVybjtcbiAgICB9fSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQS5kZWNyeXB0O1xuICB9KShVU0UsICcuL2RlY3J5cHQnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgLy8gRGVyaXZlIHNoYXJlZCBzZWNyZXQgZnJvbSBvdGhlcidzIHB1YiBhbmQgbXkgZXB1Yi9lcHJpdiBcbiAgICBTRUEuc2VjcmV0ID0gU0VBLnNlY3JldCB8fCAoYXN5bmMgKGtleSwgcGFpciwgY2IsIG9wdCkgPT4geyB0cnkge1xuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgaWYoIXBhaXIgfHwgIXBhaXIuZXByaXYgfHwgIXBhaXIuZXB1Yil7XG4gICAgICAgIGlmKCFTRUEuSSl7IHRocm93ICdObyBzZWNyZXQgbWl4LicgfVxuICAgICAgICBwYWlyID0gYXdhaXQgU0VBLkkobnVsbCwge3doYXQ6IGtleSwgaG93OiAnc2VjcmV0Jywgd2h5OiBvcHQud2h5fSk7XG4gICAgICB9XG4gICAgICB2YXIgcHViID0ga2V5LmVwdWIgfHwga2V5O1xuICAgICAgdmFyIGVwdWIgPSBwYWlyLmVwdWI7XG4gICAgICB2YXIgZXByaXYgPSBwYWlyLmVwcml2O1xuICAgICAgdmFyIGVjZGhTdWJ0bGUgPSBzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGU7XG4gICAgICB2YXIgcHViS2V5RGF0YSA9IGtleXNUb0VjZGhKd2socHViKTtcbiAgICAgIHZhciBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBwdWJsaWM6IGF3YWl0IGVjZGhTdWJ0bGUuaW1wb3J0S2V5KC4uLnB1YktleURhdGEsIHRydWUsIFtdKSB9LHtuYW1lOiAnRUNESCcsIG5hbWVkQ3VydmU6ICdQLTI1Nid9KTsgLy8gVGhhbmtzIHRvIEBzaXJweSAhXG4gICAgICB2YXIgcHJpdktleURhdGEgPSBrZXlzVG9FY2RoSndrKGVwdWIsIGVwcml2KTtcbiAgICAgIHZhciBkZXJpdmVkID0gYXdhaXQgZWNkaFN1YnRsZS5pbXBvcnRLZXkoLi4ucHJpdktleURhdGEsIGZhbHNlLCBbJ2Rlcml2ZUJpdHMnXSkudGhlbihhc3luYyAocHJpdktleSkgPT4ge1xuICAgICAgICAvLyBwcml2YXRlS2V5IHNjb3BlIGRvZXNuJ3QgbGVhayBvdXQgZnJvbSBoZXJlIVxuICAgICAgICB2YXIgZGVyaXZlZEJpdHMgPSBhd2FpdCBlY2RoU3VidGxlLmRlcml2ZUJpdHMocHJvcHMsIHByaXZLZXksIDI1Nik7XG4gICAgICAgIHZhciByYXdCaXRzID0gbmV3IFVpbnQ4QXJyYXkoZGVyaXZlZEJpdHMpO1xuICAgICAgICB2YXIgZGVyaXZlZEtleSA9IGF3YWl0IGVjZGhTdWJ0bGUuaW1wb3J0S2V5KCdyYXcnLCByYXdCaXRzLHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LCB0cnVlLCBbICdlbmNyeXB0JywgJ2RlY3J5cHQnIF0pO1xuICAgICAgICByZXR1cm4gZWNkaFN1YnRsZS5leHBvcnRLZXkoJ2p3aycsIGRlcml2ZWRLZXkpLnRoZW4oKHsgayB9KSA9PiBrKTtcbiAgICAgIH0pXG4gICAgICB2YXIgciA9IGRlcml2ZWQ7XG4gICAgICBpZihjYil7IHRyeXsgY2IocikgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICByZXR1cm4gcjtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgU0VBLmVyciA9IGU7XG4gICAgICBpZihTRUEudGhyb3cpeyB0aHJvdyBlIH1cbiAgICAgIGlmKGNiKXsgY2IoKSB9XG4gICAgICByZXR1cm47XG4gICAgfX0pO1xuXG4gICAgLy8gY2FuIHRoaXMgYmUgcmVwbGFjZWQgd2l0aCBzZXR0aW5ncy5qd2s/XG4gICAgdmFyIGtleXNUb0VjZGhKd2sgPSAocHViLCBkKSA9PiB7IC8vIGQgPT09IHByaXZcbiAgICAgIC8vdmFyIFsgeCwgeSBdID0gc2hpbS5CdWZmZXIuZnJvbShwdWIsICdiYXNlNjQnKS50b1N0cmluZygndXRmOCcpLnNwbGl0KCc6JykgLy8gb2xkXG4gICAgICB2YXIgWyB4LCB5IF0gPSBwdWIuc3BsaXQoJy4nKSAvLyBuZXdcbiAgICAgIHZhciBqd2sgPSBkID8geyBkOiBkIH0gOiB7fVxuICAgICAgcmV0dXJuIFsgIC8vIFVzZSB3aXRoIHNwcmVhZCByZXR1cm5lZCB2YWx1ZS4uLlxuICAgICAgICAnandrJyxcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICBqd2ssXG4gICAgICAgICAgeyB4OiB4LCB5OiB5LCBrdHk6ICdFQycsIGNydjogJ1AtMjU2JywgZXh0OiB0cnVlIH1cbiAgICAgICAgKSwgLy8gPz8/IHJlZmFjdG9yXG4gICAgICAgIHtuYW1lOiAnRUNESCcsIG5hbWVkQ3VydmU6ICdQLTI1Nid9XG4gICAgICBdXG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUEuc2VjcmV0O1xuICB9KShVU0UsICcuL3NlY3JldCcpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3Jvb3QnKTtcbiAgICAvLyBUaGlzIGlzIHRvIGNlcnRpZnkgdGhhdCBhIGdyb3VwIG9mIFwiY2VydGlmaWNhbnRzXCIgY2FuIFwicHV0XCIgYW55dGhpbmcgYXQgYSBncm91cCBvZiBtYXRjaGVkIFwicGF0aHNcIiB0byB0aGUgY2VydGlmaWNhdGUgYXV0aG9yaXR5J3MgZ3JhcGhcbiAgICBTRUEuY2VydGlmeSA9IFNFQS5jZXJ0aWZ5IHx8IChhc3luYyAoY2VydGlmaWNhbnRzLCBwb2xpY3kgPSB7fSwgYXV0aG9yaXR5LCBjYiwgb3B0ID0ge30pID0+IHsgdHJ5IHtcbiAgICAgIC8qXG4gICAgICBUaGUgQ2VydGlmeSBQcm90b2NvbCB3YXMgbWFkZSBvdXQgb2YgbG92ZSBieSBhIFZpZXRuYW1lc2UgY29kZSBlbnRodXNpYXN0LiBWaWV0bmFtZXNlIHBlb3BsZSBhcm91bmQgdGhlIHdvcmxkIGRlc2VydmUgcmVzcGVjdCFcbiAgICAgIElNUE9SVEFOVDogQSBDZXJ0aWZpY2F0ZSBpcyBsaWtlIGEgU2lnbmF0dXJlLiBObyBvbmUga25vd3Mgd2hvIChhdXRob3JpdHkpIGNyZWF0ZWQvc2lnbmVkIGEgY2VydCB1bnRpbCB5b3UgcHV0IGl0IGludG8gdGhlaXIgZ3JhcGguXG4gICAgICBcImNlcnRpZmljYW50c1wiOiAnKicgb3IgYSBTdHJpbmcgKEJvYi5wdWIpIHx8IGFuIE9iamVjdCB0aGF0IGNvbnRhaW5zIFwicHViXCIgYXMgYSBrZXkgfHwgYW4gYXJyYXkgb2YgW29iamVjdCB8fCBzdHJpbmddLiBUaGVzZSBwZW9wbGUgd2lsbCBoYXZlIHRoZSByaWdodHMuXG4gICAgICBcInBvbGljeVwiOiBBIHN0cmluZyAoJ2luYm94JyksIG9yIGEgUkFEL0xFWCBvYmplY3QgeycqJzogJ2luYm94J30sIG9yIGFuIEFycmF5IG9mIFJBRC9MRVggb2JqZWN0cyBvciBzdHJpbmdzLiBSQUQvTEVYIG9iamVjdCBjYW4gY29udGFpbiBrZXkgXCI/XCIgd2l0aCBpbmRleE9mKFwiKlwiKSA+IC0xIHRvIGZvcmNlIGtleSBlcXVhbHMgY2VydGlmaWNhbnQgcHViLiBUaGlzIHJ1bGUgaXMgdXNlZCB0byBjaGVjayBhZ2FpbnN0IHNvdWwrJy8nK2tleSB1c2luZyBHdW4udGV4dC5tYXRjaCBvciBTdHJpbmcubWF0Y2guXG4gICAgICBcImF1dGhvcml0eVwiOiBLZXkgcGFpciBvciBwcml2IG9mIHRoZSBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuXG4gICAgICBcImNiXCI6IEEgY2FsbGJhY2sgZnVuY3Rpb24gYWZ0ZXIgYWxsIHRoaW5ncyBhcmUgZG9uZS5cbiAgICAgIFwib3B0XCI6IElmIG9wdC5leHBpcnkgKGEgdGltZXN0YW1wKSBpcyBzZXQsIFNFQSB3b24ndCBzeW5jIGRhdGEgYWZ0ZXIgb3B0LmV4cGlyeS4gSWYgb3B0LmJsb2NrIGlzIHNldCwgU0VBIHdpbGwgbG9vayBmb3IgYmxvY2sgYmVmb3JlIHN5bmNpbmcuXG4gICAgICAqL1xuICAgICAgY29uc29sZS5sb2coJ1NFQS5jZXJ0aWZ5KCkgaXMgYW4gZWFybHkgZXhwZXJpbWVudGFsIGNvbW11bml0eSBzdXBwb3J0ZWQgbWV0aG9kIHRoYXQgbWF5IGNoYW5nZSBBUEkgYmVoYXZpb3Igd2l0aG91dCB3YXJuaW5nIGluIGFueSBmdXR1cmUgdmVyc2lvbi4nKVxuXG4gICAgICBjZXJ0aWZpY2FudHMgPSAoKCkgPT4ge1xuICAgICAgICB2YXIgZGF0YSA9IFtdXG4gICAgICAgIGlmIChjZXJ0aWZpY2FudHMpIHtcbiAgICAgICAgICBpZiAoKHR5cGVvZiBjZXJ0aWZpY2FudHMgPT09ICdzdHJpbmcnIHx8IEFycmF5LmlzQXJyYXkoY2VydGlmaWNhbnRzKSkgJiYgY2VydGlmaWNhbnRzLmluZGV4T2YoJyonKSA+IC0xKSByZXR1cm4gJyonXG4gICAgICAgICAgaWYgKHR5cGVvZiBjZXJ0aWZpY2FudHMgPT09ICdzdHJpbmcnKSByZXR1cm4gY2VydGlmaWNhbnRzXG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2VydGlmaWNhbnRzKSkge1xuICAgICAgICAgICAgaWYgKGNlcnRpZmljYW50cy5sZW5ndGggPT09IDEgJiYgY2VydGlmaWNhbnRzWzBdKSByZXR1cm4gdHlwZW9mIGNlcnRpZmljYW50c1swXSA9PT0gJ29iamVjdCcgJiYgY2VydGlmaWNhbnRzWzBdLnB1YiA/IGNlcnRpZmljYW50c1swXS5wdWIgOiB0eXBlb2YgY2VydGlmaWNhbnRzWzBdID09PSAnc3RyaW5nJyA/IGNlcnRpZmljYW50c1swXSA6IG51bGxcbiAgICAgICAgICAgIGNlcnRpZmljYW50cy5tYXAoY2VydGlmaWNhbnQgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGNlcnRpZmljYW50ID09PSdzdHJpbmcnKSBkYXRhLnB1c2goY2VydGlmaWNhbnQpXG4gICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBjZXJ0aWZpY2FudCA9PT0gJ29iamVjdCcgJiYgY2VydGlmaWNhbnQucHViKSBkYXRhLnB1c2goY2VydGlmaWNhbnQucHViKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGNlcnRpZmljYW50cyA9PT0gJ29iamVjdCcgJiYgY2VydGlmaWNhbnRzLnB1YikgcmV0dXJuIGNlcnRpZmljYW50cy5wdWJcbiAgICAgICAgICByZXR1cm4gZGF0YS5sZW5ndGggPiAwID8gZGF0YSA6IG51bGxcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH0pKClcblxuICAgICAgaWYgKCFjZXJ0aWZpY2FudHMpIHJldHVybiBjb25zb2xlLmxvZyhcIk5vIGNlcnRpZmljYW50IGZvdW5kLlwiKVxuXG4gICAgICBjb25zdCBleHBpcnkgPSBvcHQuZXhwaXJ5ICYmICh0eXBlb2Ygb3B0LmV4cGlyeSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIG9wdC5leHBpcnkgPT09ICdzdHJpbmcnKSA/IHBhcnNlRmxvYXQob3B0LmV4cGlyeSkgOiBudWxsXG4gICAgICBjb25zdCByZWFkUG9saWN5ID0gKHBvbGljeSB8fCB7fSkucmVhZCA/IHBvbGljeS5yZWFkIDogbnVsbFxuICAgICAgY29uc3Qgd3JpdGVQb2xpY3kgPSAocG9saWN5IHx8IHt9KS53cml0ZSA/IHBvbGljeS53cml0ZSA6IHR5cGVvZiBwb2xpY3kgPT09ICdzdHJpbmcnIHx8IEFycmF5LmlzQXJyYXkocG9saWN5KSB8fCBwb2xpY3lbXCIrXCJdIHx8IHBvbGljeVtcIiNcIl0gfHwgcG9saWN5W1wiLlwiXSB8fCBwb2xpY3lbXCI9XCJdIHx8IHBvbGljeVtcIipcIl0gfHwgcG9saWN5W1wiPlwiXSB8fCBwb2xpY3lbXCI8XCJdID8gcG9saWN5IDogbnVsbFxuICAgICAgLy8gVGhlIFwiYmxhY2tsaXN0XCIgZmVhdHVyZSBpcyBub3cgcmVuYW1lZCB0byBcImJsb2NrXCIuIFdoeSA/IEJFQ0FVU0UgQkxBQ0sgTElWRVMgTUFUVEVSIVxuICAgICAgLy8gV2UgY2FuIG5vdyB1c2UgMyBrZXlzOiBibG9jaywgYmxhY2tsaXN0LCBiYW5cbiAgICAgIGNvbnN0IGJsb2NrID0gKG9wdCB8fCB7fSkuYmxvY2sgfHwgKG9wdCB8fCB7fSkuYmxhY2tsaXN0IHx8IChvcHQgfHwge30pLmJhbiB8fCB7fVxuICAgICAgY29uc3QgcmVhZEJsb2NrID0gYmxvY2sucmVhZCAmJiAodHlwZW9mIGJsb2NrLnJlYWQgPT09ICdzdHJpbmcnIHx8IChibG9jay5yZWFkIHx8IHt9KVsnIyddKSA/IGJsb2NrLnJlYWQgOiBudWxsXG4gICAgICBjb25zdCB3cml0ZUJsb2NrID0gdHlwZW9mIGJsb2NrID09PSAnc3RyaW5nJyA/IGJsb2NrIDogYmxvY2sud3JpdGUgJiYgKHR5cGVvZiBibG9jay53cml0ZSA9PT0gJ3N0cmluZycgfHwgYmxvY2sud3JpdGVbJyMnXSkgPyBibG9jay53cml0ZSA6IG51bGxcblxuICAgICAgaWYgKCFyZWFkUG9saWN5ICYmICF3cml0ZVBvbGljeSkgcmV0dXJuIGNvbnNvbGUubG9nKFwiTm8gcG9saWN5IGZvdW5kLlwiKVxuXG4gICAgICAvLyByZXNlcnZlZCBrZXlzOiBjLCBlLCByLCB3LCByYiwgd2JcbiAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGM6IGNlcnRpZmljYW50cyxcbiAgICAgICAgLi4uKGV4cGlyeSA/IHtlOiBleHBpcnl9IDoge30pLCAvLyBpbmplY3QgZXhwaXJ5IGlmIHBvc3NpYmxlXG4gICAgICAgIC4uLihyZWFkUG9saWN5ID8ge3I6IHJlYWRQb2xpY3kgfSAgOiB7fSksIC8vIFwiclwiIHN0YW5kcyBmb3IgcmVhZCwgd2hpY2ggbWVhbnMgcmVhZCBwZXJtaXNzaW9uLlxuICAgICAgICAuLi4od3JpdGVQb2xpY3kgPyB7dzogd3JpdGVQb2xpY3l9IDoge30pLCAvLyBcIndcIiBzdGFuZHMgZm9yIHdyaXRlLCB3aGljaCBtZWFucyB3cml0ZSBwZXJtaXNzaW9uLlxuICAgICAgICAuLi4ocmVhZEJsb2NrID8ge3JiOiByZWFkQmxvY2t9IDoge30pLCAvLyBpbmplY3QgUkVBRCBibG9jayBpZiBwb3NzaWJsZVxuICAgICAgICAuLi4od3JpdGVCbG9jayA/IHt3Yjogd3JpdGVCbG9ja30gOiB7fSksIC8vIGluamVjdCBXUklURSBibG9jayBpZiBwb3NzaWJsZVxuICAgICAgfSlcblxuICAgICAgY29uc3QgY2VydGlmaWNhdGUgPSBhd2FpdCBTRUEuc2lnbihkYXRhLCBhdXRob3JpdHksIG51bGwsIHtyYXc6MX0pXG5cbiAgICAgIHZhciByID0gY2VydGlmaWNhdGVcbiAgICAgIGlmKCFvcHQucmF3KXsgciA9ICdTRUEnK0pTT04uc3RyaW5naWZ5KHIpIH1cbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgU0VBLmVyciA9IGU7XG4gICAgICBpZihTRUEudGhyb3cpeyB0aHJvdyBlIH1cbiAgICAgIGlmKGNiKXsgY2IoKSB9XG4gICAgICByZXR1cm47XG4gICAgfX0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUEuY2VydGlmeTtcbiAgfSkoVVNFLCAnLi9jZXJ0aWZ5Jyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBzaGltID0gVVNFKCcuL3NoaW0nKTtcbiAgICAvLyBQcmFjdGljYWwgZXhhbXBsZXMgYWJvdXQgdXNhZ2UgZm91bmQgaW4gdGVzdHMuXG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgU0VBLndvcmsgPSBVU0UoJy4vd29yaycpO1xuICAgIFNFQS5zaWduID0gVVNFKCcuL3NpZ24nKTtcbiAgICBTRUEudmVyaWZ5ID0gVVNFKCcuL3ZlcmlmeScpO1xuICAgIFNFQS5lbmNyeXB0ID0gVVNFKCcuL2VuY3J5cHQnKTtcbiAgICBTRUEuZGVjcnlwdCA9IFVTRSgnLi9kZWNyeXB0Jyk7XG4gICAgU0VBLmNlcnRpZnkgPSBVU0UoJy4vY2VydGlmeScpO1xuICAgIC8vU0VBLm9wdC5hZXNrZXkgPSBVU0UoJy4vYWVza2V5Jyk7IC8vIG5vdCBvZmZpY2lhbCEgLy8gdGhpcyBjYXVzZXMgcHJvYmxlbXMgaW4gbGF0ZXN0IFdlYkNyeXB0by5cblxuICAgIFNFQS5yYW5kb20gPSBTRUEucmFuZG9tIHx8IHNoaW0ucmFuZG9tO1xuXG4gICAgLy8gVGhpcyBpcyBCdWZmZXIgdXNlZCBpbiBTRUEgYW5kIHVzYWJsZSBmcm9tIEd1bi9TRUEgYXBwbGljYXRpb24gYWxzby5cbiAgICAvLyBGb3IgZG9jdW1lbnRhdGlvbiBzZWUgaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9idWZmZXIuaHRtbFxuICAgIFNFQS5CdWZmZXIgPSBTRUEuQnVmZmVyIHx8IFVTRSgnLi9idWZmZXInKTtcblxuICAgIC8vIFRoZXNlIFNFQSBmdW5jdGlvbnMgc3VwcG9ydCBub3cgb255IFByb21pc2VzIG9yXG4gICAgLy8gYXN5bmMvYXdhaXQgKGNvbXBhdGlibGUpIGNvZGUsIHVzZSB0aG9zZSBsaWtlIFByb21pc2VzLlxuICAgIC8vXG4gICAgLy8gQ3JlYXRlcyBhIHdyYXBwZXIgbGlicmFyeSBhcm91bmQgV2ViIENyeXB0byBBUElcbiAgICAvLyBmb3IgdmFyaW91cyBBRVMsIEVDRFNBLCBQQktERjIgZnVuY3Rpb25zIHdlIGNhbGxlZCBhYm92ZS5cbiAgICAvLyBDYWxjdWxhdGUgcHVibGljIGtleSBLZXlJRCBha2EgUEdQdjQgKHJlc3VsdDogOCBieXRlcyBhcyBoZXggc3RyaW5nKVxuICAgIFNFQS5rZXlpZCA9IFNFQS5rZXlpZCB8fCAoYXN5bmMgKHB1YikgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gYmFzZTY0KCdiYXNlNjQoeCk6YmFzZTY0KHkpJykgPT4gc2hpbS5CdWZmZXIoeHkpXG4gICAgICAgIGNvbnN0IHBiID0gc2hpbS5CdWZmZXIuY29uY2F0KFxuICAgICAgICAgIHB1Yi5yZXBsYWNlKC8tL2csICcrJykucmVwbGFjZSgvXy9nLCAnLycpLnNwbGl0KCcuJylcbiAgICAgICAgICAubWFwKCh0KSA9PiBzaGltLkJ1ZmZlci5mcm9tKHQsICdiYXNlNjQnKSlcbiAgICAgICAgKVxuICAgICAgICAvLyBpZCBpcyBQR1B2NCBjb21wbGlhbnQgcmF3IGtleVxuICAgICAgICBjb25zdCBpZCA9IHNoaW0uQnVmZmVyLmNvbmNhdChbXG4gICAgICAgICAgc2hpbS5CdWZmZXIuZnJvbShbMHg5OSwgcGIubGVuZ3RoIC8gMHgxMDAsIHBiLmxlbmd0aCAlIDB4MTAwXSksIHBiXG4gICAgICAgIF0pXG4gICAgICAgIGNvbnN0IHNoYTEgPSBhd2FpdCBzaGExaGFzaChpZClcbiAgICAgICAgY29uc3QgaGFzaCA9IHNoaW0uQnVmZmVyLmZyb20oc2hhMSwgJ2JpbmFyeScpXG4gICAgICAgIHJldHVybiBoYXNoLnRvU3RyaW5nKCdoZXgnLCBoYXNoLmxlbmd0aCAtIDgpICAvLyAxNi1iaXQgSUQgYXMgaGV4XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBhbGwgZG9uZSFcbiAgICAvLyBPYnZpb3VzbHkgaXQgaXMgbWlzc2luZyBNQU5ZIG5lY2Vzc2FyeSBmZWF0dXJlcy4gVGhpcyBpcyBvbmx5IGFuIGFscGhhIHJlbGVhc2UuXG4gICAgLy8gUGxlYXNlIGV4cGVyaW1lbnQgd2l0aCBpdCwgYXVkaXQgd2hhdCBJJ3ZlIGRvbmUgc28gZmFyLCBhbmQgY29tcGxhaW4gYWJvdXQgd2hhdCBuZWVkcyB0byBiZSBhZGRlZC5cbiAgICAvLyBTRUEgc2hvdWxkIGJlIGEgZnVsbCBzdWl0ZSB0aGF0IGlzIGVhc3kgYW5kIHNlYW1sZXNzIHRvIHVzZS5cbiAgICAvLyBBZ2Fpbiwgc2Nyb2xsIG5hZXIgdGhlIHRvcCwgd2hlcmUgSSBwcm92aWRlIGFuIEVYQU1QTEUgb2YgaG93IHRvIGNyZWF0ZSBhIHVzZXIgYW5kIHNpZ24gaW4uXG4gICAgLy8gT25jZSBsb2dnZWQgaW4sIHRoZSByZXN0IG9mIHRoZSBjb2RlIHlvdSBqdXN0IHJlYWQgaGFuZGxlZCBhdXRvbWF0aWNhbGx5IHNpZ25pbmcvdmFsaWRhdGluZyBkYXRhLlxuICAgIC8vIEJ1dCBhbGwgb3RoZXIgYmVoYXZpb3IgbmVlZHMgdG8gYmUgZXF1YWxseSBlYXN5LCBsaWtlIG9waW5pb25hdGVkIHdheXMgb2ZcbiAgICAvLyBBZGRpbmcgZnJpZW5kcyAodHJ1c3RlZCBwdWJsaWMga2V5cyksIHNlbmRpbmcgcHJpdmF0ZSBtZXNzYWdlcywgZXRjLlxuICAgIC8vIENoZWVycyEgVGVsbCBtZSB3aGF0IHlvdSB0aGluay5cbiAgICAoKFNFQS53aW5kb3d8fHt9KS5HVU58fHt9KS5TRUEgPSBTRUE7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQVxuICAgIC8vIC0tLS0tLS0tLS0tLS0tIEVORCBTRUEgTU9EVUxFUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIC0tIEJFR0lOIFNFQStHVU4gTU9EVUxFUzogQlVORExFRCBCWSBERUZBVUxUIFVOVElMIE9USEVSUyBVU0UgU0VBIE9OIE9XTiAtLS0tLS0tXG4gIH0pKFVTRSwgJy4vc2VhJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBTRUEgPSBVU0UoJy4vc2VhJyksIEd1biwgdTtcbiAgICBpZihTRUEud2luZG93KXtcbiAgICAgIEd1biA9IFNFQS53aW5kb3cuR1VOIHx8IHtjaGFpbjp7fX07XG4gICAgfSBlbHNlIHtcbiAgICAgIEd1biA9IFVTRSgodSsnJyA9PSB0eXBlb2YgTU9EVUxFPycuJzonJykrJy4vZ3VuJywgMSk7XG4gICAgfVxuICAgIFNFQS5HVU4gPSBHdW47XG5cbiAgICBmdW5jdGlvbiBVc2VyKHJvb3QpeyBcbiAgICAgIHRoaXMuXyA9IHskOiB0aGlzfTtcbiAgICB9XG4gICAgVXNlci5wcm90b3R5cGUgPSAoZnVuY3Rpb24oKXsgZnVuY3Rpb24gRigpe307IEYucHJvdG90eXBlID0gR3VuLmNoYWluOyByZXR1cm4gbmV3IEYoKSB9KCkpIC8vIE9iamVjdC5jcmVhdGUgcG9seWZpbGxcbiAgICBVc2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFVzZXI7XG5cbiAgICAvLyBsZXQncyBleHRlbmQgdGhlIGd1biBjaGFpbiB3aXRoIGEgYHVzZXJgIGZ1bmN0aW9uLlxuICAgIC8vIG9ubHkgb25lIHVzZXIgY2FuIGJlIGxvZ2dlZCBpbiBhdCBhIHRpbWUsIHBlciBndW4gaW5zdGFuY2UuXG4gICAgR3VuLmNoYWluLnVzZXIgPSBmdW5jdGlvbihwdWIpe1xuICAgICAgdmFyIGd1biA9IHRoaXMsIHJvb3QgPSBndW4uYmFjaygtMSksIHVzZXI7XG4gICAgICBpZihwdWIpe1xuICAgICAgICBwdWIgPSBTRUEub3B0LnB1YigocHViLl98fCcnKVsnIyddKSB8fCBwdWI7XG4gICAgICAgIHJldHVybiByb290LmdldCgnficrcHViKTtcbiAgICAgIH1cbiAgICAgIGlmKHVzZXIgPSByb290LmJhY2soJ3VzZXInKSl7IHJldHVybiB1c2VyIH1cbiAgICAgIHZhciByb290ID0gKHJvb3QuXyksIGF0ID0gcm9vdCwgdXVpZCA9IGF0Lm9wdC51dWlkIHx8IGxleDtcbiAgICAgIChhdCA9ICh1c2VyID0gYXQudXNlciA9IGd1bi5jaGFpbihuZXcgVXNlcikpLl8pLm9wdCA9IHt9O1xuICAgICAgYXQub3B0LnV1aWQgPSBmdW5jdGlvbihjYil7XG4gICAgICAgIHZhciBpZCA9IHV1aWQoKSwgcHViID0gcm9vdC51c2VyO1xuICAgICAgICBpZighcHViIHx8ICEocHViID0gcHViLmlzKSB8fCAhKHB1YiA9IHB1Yi5wdWIpKXsgcmV0dXJuIGlkIH1cbiAgICAgICAgaWQgPSAnficgKyBwdWIgKyAnLycgKyBpZDtcbiAgICAgICAgaWYoY2IgJiYgY2IuY2FsbCl7IGNiKG51bGwsIGlkKSB9XG4gICAgICAgIHJldHVybiBpZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1c2VyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBsZXgoKXsgcmV0dXJuIEd1bi5zdGF0ZSgpLnRvU3RyaW5nKDM2KS5yZXBsYWNlKCcuJywnJykgfVxuICAgIEd1bi5Vc2VyID0gVXNlcjtcbiAgICBVc2VyLkdVTiA9IEd1bjtcbiAgICBVc2VyLlNFQSA9IEd1bi5TRUEgPSBTRUE7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBVc2VyO1xuICB9KShVU0UsICcuL3VzZXInKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIHUsIEd1biA9ICgnJyt1ICE9IHR5cGVvZiB3aW5kb3cpPyAod2luZG93Lkd1bnx8e2NoYWluOnt9fSkgOiBVU0UoKCcnK3UgPT09IHR5cGVvZiBNT0RVTEU/Jy4nOicnKSsnLi9ndW4nLCAxKTtcbiAgICBHdW4uY2hhaW4udGhlbiA9IGZ1bmN0aW9uKGNiLCBvcHQpe1xuICAgICAgdmFyIGd1biA9IHRoaXMsIHAgPSAobmV3IFByb21pc2UoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgICBndW4ub25jZShyZXMsIG9wdCk7XG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gY2I/IHAudGhlbihjYikgOiBwO1xuICAgIH1cbiAgfSkoVVNFLCAnLi90aGVuJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBVc2VyID0gVVNFKCcuL3VzZXInKSwgU0VBID0gVXNlci5TRUEsIEd1biA9IFVzZXIuR1VOLCBub29wID0gZnVuY3Rpb24oKXt9O1xuXG4gICAgLy8gV2VsbCBmaXJzdCB3ZSBoYXZlIHRvIGFjdHVhbGx5IGNyZWF0ZSBhIHVzZXIuIFRoYXQgaXMgd2hhdCB0aGlzIGZ1bmN0aW9uIGRvZXMuXG4gICAgVXNlci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oLi4uYXJncyl7XG4gICAgICB2YXIgcGFpciA9IHR5cGVvZiBhcmdzWzBdID09PSAnb2JqZWN0JyAmJiAoYXJnc1swXS5wdWIgfHwgYXJnc1swXS5lcHViKSA/IGFyZ3NbMF0gOiB0eXBlb2YgYXJnc1sxXSA9PT0gJ29iamVjdCcgJiYgKGFyZ3NbMV0ucHViIHx8IGFyZ3NbMV0uZXB1YikgPyBhcmdzWzFdIDogbnVsbDtcbiAgICAgIHZhciBhbGlhcyA9IHBhaXIgJiYgKHBhaXIucHViIHx8IHBhaXIuZXB1YikgPyBwYWlyLnB1YiA6IHR5cGVvZiBhcmdzWzBdID09PSAnc3RyaW5nJyA/IGFyZ3NbMF0gOiBudWxsO1xuICAgICAgdmFyIHBhc3MgPSBwYWlyICYmIChwYWlyLnB1YiB8fCBwYWlyLmVwdWIpID8gcGFpciA6IGFsaWFzICYmIHR5cGVvZiBhcmdzWzFdID09PSAnc3RyaW5nJyA/IGFyZ3NbMV0gOiBudWxsO1xuICAgICAgdmFyIGNiID0gYXJncy5maWx0ZXIoYXJnID0+IHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbicpWzBdIHx8IG51bGw7IC8vIGNiIG5vdyBjYW4gc3RhbmQgYW55d2hlcmUsIGFmdGVyIGFsaWFzL3Bhc3Mgb3IgcGFpclxuICAgICAgdmFyIG9wdCA9IGFyZ3MgJiYgYXJncy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoLTFdID09PSAnb2JqZWN0JyA/IGFyZ3NbYXJncy5sZW5ndGgtMV0gOiB7fTsgLy8gb3B0IGlzIGFsd2F5cyB0aGUgbGFzdCBwYXJhbWV0ZXIgd2hpY2ggdHlwZW9mID09PSAnb2JqZWN0JyBhbmQgc3RhbmRzIGFmdGVyIGNiXG4gICAgICBcbiAgICAgIHZhciBndW4gPSB0aGlzLCBjYXQgPSAoZ3VuLl8pLCByb290ID0gZ3VuLmJhY2soLTEpO1xuICAgICAgY2IgPSBjYiB8fCBub29wO1xuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgaWYoZmFsc2UgIT09IG9wdC5jaGVjayl7XG4gICAgICAgIHZhciBlcnI7XG4gICAgICAgIGlmKCFhbGlhcyl7IGVyciA9IFwiTm8gdXNlci5cIiB9XG4gICAgICAgIGlmKChwYXNzfHwnJykubGVuZ3RoIDwgOCl7IGVyciA9IFwiUGFzc3dvcmQgdG9vIHNob3J0IVwiIH1cbiAgICAgICAgaWYoZXJyKXtcbiAgICAgICAgICBjYih7ZXJyOiBHdW4ubG9nKGVycil9KTtcbiAgICAgICAgICByZXR1cm4gZ3VuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZihjYXQuaW5nKXtcbiAgICAgICAgKGNiIHx8IG5vb3ApKHtlcnI6IEd1bi5sb2coXCJVc2VyIGlzIGFscmVhZHkgYmVpbmcgY3JlYXRlZCBvciBhdXRoZW50aWNhdGVkIVwiKSwgd2FpdDogdHJ1ZX0pO1xuICAgICAgICByZXR1cm4gZ3VuO1xuICAgICAgfVxuICAgICAgY2F0LmluZyA9IHRydWU7XG4gICAgICB2YXIgYWN0ID0ge30sIHU7XG4gICAgICBhY3QuYSA9IGZ1bmN0aW9uKHB1YnMpe1xuICAgICAgICBhY3QucHVicyA9IHB1YnM7XG4gICAgICAgIGlmKHB1YnMgJiYgIW9wdC5hbHJlYWR5KXtcbiAgICAgICAgICAvLyBJZiB3ZSBjYW4gZW5mb3JjZSB0aGF0IGEgdXNlciBuYW1lIGlzIGFscmVhZHkgdGFrZW4sIGl0IG1pZ2h0IGJlIG5pY2UgdG8gdHJ5LCBidXQgdGhpcyBpcyBub3QgZ3VhcmFudGVlZC5cbiAgICAgICAgICB2YXIgYWNrID0ge2VycjogR3VuLmxvZygnVXNlciBhbHJlYWR5IGNyZWF0ZWQhJyl9O1xuICAgICAgICAgIGNhdC5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAoY2IgfHwgbm9vcCkoYWNrKTtcbiAgICAgICAgICBndW4ubGVhdmUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYWN0LnNhbHQgPSBTdHJpbmcucmFuZG9tKDY0KTsgLy8gcHNldWRvLXJhbmRvbWx5IGNyZWF0ZSBhIHNhbHQsIHRoZW4gdXNlIFBCS0RGMiBmdW5jdGlvbiB0byBleHRlbmQgdGhlIHBhc3N3b3JkIHdpdGggaXQuXG4gICAgICAgIFNFQS53b3JrKHBhc3MsIGFjdC5zYWx0LCBhY3QuYik7IC8vIHRoaXMgd2lsbCB0YWtlIHNvbWUgc2hvcnQgYW1vdW50IG9mIHRpbWUgdG8gcHJvZHVjZSBhIHByb29mLCB3aGljaCBzbG93cyBicnV0ZSBmb3JjZSBhdHRhY2tzLlxuICAgICAgfVxuICAgICAgYWN0LmIgPSBmdW5jdGlvbihwcm9vZil7XG4gICAgICAgIGFjdC5wcm9vZiA9IHByb29mO1xuICAgICAgICBwYWlyID8gYWN0LmMocGFpcikgOiBTRUEucGFpcihhY3QuYykgLy8gZ2VuZXJhdGUgYSBicmFuZCBuZXcga2V5IHBhaXIgb3IgdXNlIHRoZSBleGlzdGluZy5cbiAgICAgIH1cbiAgICAgIGFjdC5jID0gZnVuY3Rpb24ocGFpcil7XG4gICAgICAgIHZhciB0bXBcbiAgICAgICAgYWN0LnBhaXIgPSBwYWlyIHx8IHt9O1xuICAgICAgICBpZih0bXAgPSBjYXQucm9vdC51c2VyKXtcbiAgICAgICAgICB0bXAuXy5zZWEgPSBwYWlyO1xuICAgICAgICAgIHRtcC5pcyA9IHtwdWI6IHBhaXIucHViLCBlcHViOiBwYWlyLmVwdWIsIGFsaWFzOiBhbGlhc307XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhlIHVzZXIncyBwdWJsaWMga2V5IGRvZXNuJ3QgbmVlZCB0byBiZSBzaWduZWQuIEJ1dCBldmVyeXRoaW5nIGVsc2UgbmVlZHMgdG8gYmUgc2lnbmVkIHdpdGggaXQhIC8vIHdlIGhhdmUgbm93IGF1dG9tYXRlZCBpdCEgY2xlYW4gdXAgdGhlc2UgZXh0cmEgc3RlcHMgbm93IVxuICAgICAgICBhY3QuZGF0YSA9IHtwdWI6IHBhaXIucHVifTtcbiAgICAgICAgYWN0LmQoKTtcbiAgICAgIH1cbiAgICAgIGFjdC5kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWN0LmRhdGEuYWxpYXMgPSBhbGlhcztcbiAgICAgICAgYWN0LmUoKTtcbiAgICAgIH1cbiAgICAgIGFjdC5lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWN0LmRhdGEuZXB1YiA9IGFjdC5wYWlyLmVwdWI7IFxuICAgICAgICBTRUEuZW5jcnlwdCh7cHJpdjogYWN0LnBhaXIucHJpdiwgZXByaXY6IGFjdC5wYWlyLmVwcml2fSwgYWN0LnByb29mLCBhY3QuZiwge3JhdzoxfSk7IC8vIHRvIGtlZXAgdGhlIHByaXZhdGUga2V5IHNhZmUsIHdlIEFFUyBlbmNyeXB0IGl0IHdpdGggdGhlIHByb29mIG9mIHdvcmshXG4gICAgICB9XG4gICAgICBhY3QuZiA9IGZ1bmN0aW9uKGF1dGgpe1xuICAgICAgICBhY3QuZGF0YS5hdXRoID0gSlNPTi5zdHJpbmdpZnkoe2VrOiBhdXRoLCBzOiBhY3Quc2FsdH0pOyBcbiAgICAgICAgYWN0LmcoYWN0LmRhdGEuYXV0aCk7XG4gICAgICB9XG4gICAgICBhY3QuZyA9IGZ1bmN0aW9uKGF1dGgpeyB2YXIgdG1wO1xuICAgICAgICBhY3QuZGF0YS5hdXRoID0gYWN0LmRhdGEuYXV0aCB8fCBhdXRoO1xuICAgICAgICByb290LmdldCh0bXAgPSAnficrYWN0LnBhaXIucHViKS5wdXQoYWN0LmRhdGEpLm9uKGFjdC5oKTsgLy8gYXdlc29tZSwgbm93IHdlIGNhbiBhY3R1YWxseSBzYXZlIHRoZSB1c2VyIHdpdGggdGhlaXIgcHVibGljIGtleSBhcyB0aGVpciBJRC5cbiAgICAgICAgdmFyIGxpbmsgPSB7fTsgbGlua1t0bXBdID0geycjJzogdG1wfTsgcm9vdC5nZXQoJ35AJythbGlhcykucHV0KGxpbmspLmdldCh0bXApLm9uKGFjdC5pKTsgLy8gbmV4dCB1cCwgd2Ugd2FudCB0byBhc3NvY2lhdGUgdGhlIGFsaWFzIHdpdGggdGhlIHB1YmxpYyBrZXkuIFNvIHdlIGFkZCBpdCB0byB0aGUgYWxpYXMgbGlzdC5cbiAgICAgIH1cbiAgICAgIGFjdC5oID0gZnVuY3Rpb24oZGF0YSwga2V5LCBtc2csIGV2ZSl7XG4gICAgICAgIGV2ZS5vZmYoKTsgYWN0Lmgub2sgPSAxOyBhY3QuaSgpO1xuICAgICAgfVxuICAgICAgYWN0LmkgPSBmdW5jdGlvbihkYXRhLCBrZXksIG1zZywgZXZlKXtcbiAgICAgICAgaWYoZXZlKXsgYWN0Lmkub2sgPSAxOyBldmUub2ZmKCkgfVxuICAgICAgICBpZighYWN0Lmgub2sgfHwgIWFjdC5pLm9rKXsgcmV0dXJuIH1cbiAgICAgICAgY2F0LmluZyA9IGZhbHNlO1xuICAgICAgICBjYih7b2s6IDAsIHB1YjogYWN0LnBhaXIucHVifSk7IC8vIGNhbGxiYWNrIHRoYXQgdGhlIHVzZXIgaGFzIGJlZW4gY3JlYXRlZC4gKE5vdGU6IG9rID0gMCBiZWNhdXNlIHdlIGRpZG4ndCB3YWl0IGZvciBkaXNrIHRvIGFjaylcbiAgICAgICAgaWYobm9vcCA9PT0gY2IpeyBwYWlyID8gZ3VuLmF1dGgocGFpcikgOiBndW4uYXV0aChhbGlhcywgcGFzcykgfSAvLyBpZiBubyBjYWxsYmFjayBpcyBwYXNzZWQsIGF1dG8tbG9naW4gYWZ0ZXIgc2lnbmluZyB1cC5cbiAgICAgIH1cbiAgICAgIHJvb3QuZ2V0KCd+QCcrYWxpYXMpLm9uY2UoYWN0LmEpO1xuICAgICAgcmV0dXJuIGd1bjtcbiAgICB9XG4gICAgVXNlci5wcm90b3R5cGUubGVhdmUgPSBmdW5jdGlvbihvcHQsIGNiKXtcbiAgICAgIHZhciBndW4gPSB0aGlzLCB1c2VyID0gKGd1bi5iYWNrKC0xKS5fKS51c2VyO1xuICAgICAgaWYodXNlcil7XG4gICAgICAgIGRlbGV0ZSB1c2VyLmlzO1xuICAgICAgICBkZWxldGUgdXNlci5fLmlzO1xuICAgICAgICBkZWxldGUgdXNlci5fLnNlYTtcbiAgICAgIH1cbiAgICAgIGlmKFNFQS53aW5kb3cpe1xuICAgICAgICB0cnl7dmFyIHNTID0ge307XG4gICAgICAgIHNTID0gd2luZG93LnNlc3Npb25TdG9yYWdlO1xuICAgICAgICBkZWxldGUgc1MucmVjYWxsO1xuICAgICAgICBkZWxldGUgc1MucGFpcjtcbiAgICAgICAgfWNhdGNoKGUpe307XG4gICAgICB9XG4gICAgICByZXR1cm4gZ3VuO1xuICAgIH1cbiAgfSkoVVNFLCAnLi9jcmVhdGUnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFVzZXIgPSBVU0UoJy4vdXNlcicpLCBTRUEgPSBVc2VyLlNFQSwgR3VuID0gVXNlci5HVU4sIG5vb3AgPSBmdW5jdGlvbigpe307XG4gICAgLy8gbm93IHRoYXQgd2UgaGF2ZSBjcmVhdGVkIGEgdXNlciwgd2Ugd2FudCB0byBhdXRoZW50aWNhdGUgdGhlbSFcbiAgICBVc2VyLnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24oLi4uYXJncyl7IC8vIFRPRE86IHRoaXMgUFIgd2l0aCBhcmd1bWVudHMgbmVlZCB0byBiZSBjbGVhbmVkIHVwIC8gcmVmYWN0b3JlZC5cbiAgICAgIHZhciBwYWlyID0gdHlwZW9mIGFyZ3NbMF0gPT09ICdvYmplY3QnICYmIChhcmdzWzBdLnB1YiB8fCBhcmdzWzBdLmVwdWIpID8gYXJnc1swXSA6IHR5cGVvZiBhcmdzWzFdID09PSAnb2JqZWN0JyAmJiAoYXJnc1sxXS5wdWIgfHwgYXJnc1sxXS5lcHViKSA/IGFyZ3NbMV0gOiBudWxsO1xuICAgICAgdmFyIGFsaWFzID0gIXBhaXIgJiYgdHlwZW9mIGFyZ3NbMF0gPT09ICdzdHJpbmcnID8gYXJnc1swXSA6IG51bGw7XG4gICAgICB2YXIgcGFzcyA9IChhbGlhcyB8fCAocGFpciAmJiAhKHBhaXIucHJpdiAmJiBwYWlyLmVwcml2KSkpICYmIHR5cGVvZiBhcmdzWzFdID09PSAnc3RyaW5nJyA/IGFyZ3NbMV0gOiBudWxsO1xuICAgICAgdmFyIGNiID0gYXJncy5maWx0ZXIoYXJnID0+IHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbicpWzBdIHx8IG51bGw7IC8vIGNiIG5vdyBjYW4gc3RhbmQgYW55d2hlcmUsIGFmdGVyIGFsaWFzL3Bhc3Mgb3IgcGFpclxuICAgICAgdmFyIG9wdCA9IGFyZ3MgJiYgYXJncy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoLTFdID09PSAnb2JqZWN0JyA/IGFyZ3NbYXJncy5sZW5ndGgtMV0gOiB7fTsgLy8gb3B0IGlzIGFsd2F5cyB0aGUgbGFzdCBwYXJhbWV0ZXIgd2hpY2ggdHlwZW9mID09PSAnb2JqZWN0JyBhbmQgc3RhbmRzIGFmdGVyIGNiXG4gICAgICBcbiAgICAgIHZhciBndW4gPSB0aGlzLCBjYXQgPSAoZ3VuLl8pLCByb290ID0gZ3VuLmJhY2soLTEpO1xuICAgICAgXG4gICAgICBpZihjYXQuaW5nKXtcbiAgICAgICAgKGNiIHx8IG5vb3ApKHtlcnI6IEd1bi5sb2coXCJVc2VyIGlzIGFscmVhZHkgYmVpbmcgY3JlYXRlZCBvciBhdXRoZW50aWNhdGVkIVwiKSwgd2FpdDogdHJ1ZX0pO1xuICAgICAgICByZXR1cm4gZ3VuO1xuICAgICAgfVxuICAgICAgY2F0LmluZyA9IHRydWU7XG4gICAgICBcbiAgICAgIHZhciBhY3QgPSB7fSwgdTtcbiAgICAgIGFjdC5hID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGlmKCFkYXRhKXsgcmV0dXJuIGFjdC5iKCkgfVxuICAgICAgICBpZighZGF0YS5wdWIpe1xuICAgICAgICAgIHZhciB0bXAgPSBbXTsgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChmdW5jdGlvbihrKXsgaWYoJ18nPT1rKXsgcmV0dXJuIH0gdG1wLnB1c2goZGF0YVtrXSkgfSlcbiAgICAgICAgICByZXR1cm4gYWN0LmIodG1wKTtcbiAgICAgICAgfVxuICAgICAgICBpZihhY3QubmFtZSl7IHJldHVybiBhY3QuZihkYXRhKSB9XG4gICAgICAgIGFjdC5jKChhY3QuZGF0YSA9IGRhdGEpLmF1dGgpO1xuICAgICAgfVxuICAgICAgYWN0LmIgPSBmdW5jdGlvbihsaXN0KXtcbiAgICAgICAgdmFyIGdldCA9IChhY3QubGlzdCA9IChhY3QubGlzdHx8W10pLmNvbmNhdChsaXN0fHxbXSkpLnNoaWZ0KCk7XG4gICAgICAgIGlmKHUgPT09IGdldCl7XG4gICAgICAgICAgaWYoYWN0Lm5hbWUpeyByZXR1cm4gYWN0LmVycignWW91ciB1c2VyIGFjY291bnQgaXMgbm90IHB1Ymxpc2hlZCBmb3IgZEFwcHMgdG8gYWNjZXNzLCBwbGVhc2UgY29uc2lkZXIgc3luY2luZyBpdCBvbmxpbmUsIG9yIGFsbG93aW5nIGxvY2FsIGFjY2VzcyBieSBhZGRpbmcgeW91ciBkZXZpY2UgYXMgYSBwZWVyLicpIH1cbiAgICAgICAgICByZXR1cm4gYWN0LmVycignV3JvbmcgdXNlciBvciBwYXNzd29yZC4nKSBcbiAgICAgICAgfVxuICAgICAgICByb290LmdldChnZXQpLm9uY2UoYWN0LmEpO1xuICAgICAgfVxuICAgICAgYWN0LmMgPSBmdW5jdGlvbihhdXRoKXtcbiAgICAgICAgaWYodSA9PT0gYXV0aCl7IHJldHVybiBhY3QuYigpIH1cbiAgICAgICAgaWYoJ3N0cmluZycgPT0gdHlwZW9mIGF1dGgpeyByZXR1cm4gYWN0LmMob2JqX2lmeShhdXRoKSkgfSAvLyBpbiBjYXNlIG9mIGxlZ2FjeVxuICAgICAgICBTRUEud29yayhwYXNzLCAoYWN0LmF1dGggPSBhdXRoKS5zLCBhY3QuZCwgYWN0LmVuYyk7IC8vIHRoZSBwcm9vZiBvZiB3b3JrIGlzIGV2aWRlbmNlIHRoYXQgd2UndmUgc3BlbnQgc29tZSB0aW1lL2VmZm9ydCB0cnlpbmcgdG8gbG9nIGluLCB0aGlzIHNsb3dzIGJydXRlIGZvcmNlLlxuICAgICAgfVxuICAgICAgYWN0LmQgPSBmdW5jdGlvbihwcm9vZil7XG4gICAgICAgIFNFQS5kZWNyeXB0KGFjdC5hdXRoLmVrLCBwcm9vZiwgYWN0LmUsIGFjdC5lbmMpO1xuICAgICAgfVxuICAgICAgYWN0LmUgPSBmdW5jdGlvbihoYWxmKXtcbiAgICAgICAgaWYodSA9PT0gaGFsZil7XG4gICAgICAgICAgaWYoIWFjdC5lbmMpeyAvLyB0cnkgb2xkIGZvcm1hdFxuICAgICAgICAgICAgYWN0LmVuYyA9IHtlbmNvZGU6ICd1dGY4J307XG4gICAgICAgICAgICByZXR1cm4gYWN0LmMoYWN0LmF1dGgpO1xuICAgICAgICAgIH0gYWN0LmVuYyA9IG51bGw7IC8vIGVuZCBiYWNrd2FyZHNcbiAgICAgICAgICByZXR1cm4gYWN0LmIoKTtcbiAgICAgICAgfVxuICAgICAgICBhY3QuaGFsZiA9IGhhbGY7XG4gICAgICAgIGFjdC5mKGFjdC5kYXRhKTtcbiAgICAgIH1cbiAgICAgIGFjdC5mID0gZnVuY3Rpb24ocGFpcil7XG4gICAgICAgIHZhciBoYWxmID0gYWN0LmhhbGYgfHwge30sIGRhdGEgPSBhY3QuZGF0YSB8fCB7fTtcbiAgICAgICAgYWN0LmcoYWN0LmxvbCA9IHtwdWI6IHBhaXIucHViIHx8IGRhdGEucHViLCBlcHViOiBwYWlyLmVwdWIgfHwgZGF0YS5lcHViLCBwcml2OiBwYWlyLnByaXYgfHwgaGFsZi5wcml2LCBlcHJpdjogcGFpci5lcHJpdiB8fCBoYWxmLmVwcml2fSk7XG4gICAgICB9XG4gICAgICBhY3QuZyA9IGZ1bmN0aW9uKHBhaXIpe1xuICAgICAgICBpZighcGFpciB8fCAhcGFpci5wdWIgfHwgIXBhaXIuZXB1Yil7IHJldHVybiBhY3QuYigpIH1cbiAgICAgICAgYWN0LnBhaXIgPSBwYWlyO1xuICAgICAgICB2YXIgdXNlciA9IChyb290Ll8pLnVzZXIsIGF0ID0gKHVzZXIuXyk7XG4gICAgICAgIHZhciB0bXAgPSBhdC50YWc7XG4gICAgICAgIHZhciB1cHQgPSBhdC5vcHQ7XG4gICAgICAgIGF0ID0gdXNlci5fID0gcm9vdC5nZXQoJ34nK3BhaXIucHViKS5fO1xuICAgICAgICBhdC5vcHQgPSB1cHQ7XG4gICAgICAgIC8vIGFkZCBvdXIgY3JlZGVudGlhbHMgaW4tbWVtb3J5IG9ubHkgdG8gb3VyIHJvb3QgdXNlciBpbnN0YW5jZVxuICAgICAgICB1c2VyLmlzID0ge3B1YjogcGFpci5wdWIsIGVwdWI6IHBhaXIuZXB1YiwgYWxpYXM6IGFsaWFzIHx8IHBhaXIucHVifTtcbiAgICAgICAgYXQuc2VhID0gYWN0LnBhaXI7XG4gICAgICAgIGNhdC5pbmcgPSBmYWxzZTtcbiAgICAgICAgdHJ5e2lmKHBhc3MgJiYgdSA9PSAob2JqX2lmeShjYXQucm9vdC5ncmFwaFsnficrcGFpci5wdWJdLmF1dGgpfHwnJylbJzonXSl7IG9wdC5zaHVmZmxlID0gb3B0LmNoYW5nZSA9IHBhc3M7IH0gfWNhdGNoKGUpe30gLy8gbWlncmF0ZSBVVEY4ICYgU2h1ZmZsZSFcbiAgICAgICAgb3B0LmNoYW5nZT8gYWN0LnooKSA6IChjYiB8fCBub29wKShhdCk7XG4gICAgICAgIGlmKFNFQS53aW5kb3cgJiYgKChndW4uYmFjaygndXNlcicpLl8pLm9wdHx8b3B0KS5yZW1lbWJlcil7XG4gICAgICAgICAgLy8gVE9ETzogdGhpcyBuZWVkcyB0byBiZSBtb2R1bGFyLlxuICAgICAgICAgIHRyeXt2YXIgc1MgPSB7fTtcbiAgICAgICAgICBzUyA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZTsgLy8gVE9ETzogRklYIEJVRyBwdXR0aW5nIG9uIGAuaXNgIVxuICAgICAgICAgIHNTLnJlY2FsbCA9IHRydWU7XG4gICAgICAgICAgc1MucGFpciA9IEpTT04uc3RyaW5naWZ5KHBhaXIpOyAvLyBhdXRoIHVzaW5nIHBhaXIgaXMgbW9yZSByZWxpYWJsZSB0aGFuIGFsaWFzL3Bhc3NcbiAgICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgICB9XG4gICAgICAgIHRyeXtcbiAgICAgICAgICBpZihyb290Ll8udGFnLmF1dGgpeyAvLyBhdXRoIGhhbmRsZSBtaWdodCBub3QgYmUgcmVnaXN0ZXJlZCB5ZXRcbiAgICAgICAgICAocm9vdC5fKS5vbignYXV0aCcsIGF0KSAvLyBUT0RPOiBEZXByZWNhdGUgdGhpcywgZW1pdCBvbiB1c2VyIGluc3RlYWQhIFVwZGF0ZSBkb2NzIHdoZW4geW91IGRvLlxuICAgICAgICAgIH0gZWxzZSB7IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgKHJvb3QuXykub24oJ2F1dGgnLCBhdCkgfSwxKSB9IC8vIGlmIG5vdCwgaGFja2lseSBhZGQgYSB0aW1lb3V0LlxuICAgICAgICAgIC8vYXQub24oJ2F1dGgnLCBhdCkgLy8gQXJyZ2gsIHRoaXMgZG9lc24ndCB3b3JrIHdpdGhvdXQgZXZlbnQgXCJtZXJnZVwiIGNvZGUsIGJ1dCBcIm1lcmdlXCIgY29kZSBjYXVzZXMgc3RhY2sgb3ZlcmZsb3cgYW5kIGNyYXNoZXMgYWZ0ZXIgbG9nZ2luZyBpbiAmIHRyeWluZyB0byB3cml0ZSBkYXRhLlxuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgR3VuLmxvZyhcIllvdXIgJ2F1dGgnIGNhbGxiYWNrIGNyYXNoZWQgd2l0aDpcIiwgZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFjdC5oID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGlmKCFkYXRhKXsgcmV0dXJuIGFjdC5iKCkgfVxuICAgICAgICBhbGlhcyA9IGRhdGEuYWxpYXNcbiAgICAgICAgaWYoIWFsaWFzKVxuICAgICAgICAgIGFsaWFzID0gZGF0YS5hbGlhcyA9IFwiflwiICsgcGFpci5wdWIgICAgICAgIFxuICAgICAgICBpZighZGF0YS5hdXRoKXtcbiAgICAgICAgICByZXR1cm4gYWN0LmcocGFpcik7XG4gICAgICAgIH1cbiAgICAgICAgcGFpciA9IG51bGw7XG4gICAgICAgIGFjdC5jKChhY3QuZGF0YSA9IGRhdGEpLmF1dGgpO1xuICAgICAgfVxuICAgICAgYWN0LnogPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyBwYXNzd29yZCB1cGRhdGUgc28gZW5jcnlwdCBwcml2YXRlIGtleSB1c2luZyBuZXcgcHdkICsgc2FsdFxuICAgICAgICBhY3Quc2FsdCA9IFN0cmluZy5yYW5kb20oNjQpOyAvLyBwc2V1ZG8tcmFuZG9tXG4gICAgICAgIFNFQS53b3JrKG9wdC5jaGFuZ2UsIGFjdC5zYWx0LCBhY3QueSk7XG4gICAgICB9XG4gICAgICBhY3QueSA9IGZ1bmN0aW9uKHByb29mKXtcbiAgICAgICAgU0VBLmVuY3J5cHQoe3ByaXY6IGFjdC5wYWlyLnByaXYsIGVwcml2OiBhY3QucGFpci5lcHJpdn0sIHByb29mLCBhY3QueCwge3JhdzoxfSk7XG4gICAgICB9XG4gICAgICBhY3QueCA9IGZ1bmN0aW9uKGF1dGgpe1xuICAgICAgICBhY3QudyhKU09OLnN0cmluZ2lmeSh7ZWs6IGF1dGgsIHM6IGFjdC5zYWx0fSkpO1xuICAgICAgfVxuICAgICAgYWN0LncgPSBmdW5jdGlvbihhdXRoKXtcbiAgICAgICAgaWYob3B0LnNodWZmbGUpeyAvLyBkZWxldGUgaW4gZnV0dXJlIVxuICAgICAgICAgIGNvbnNvbGUubG9nKCdtaWdyYXRlIGNvcmUgYWNjb3VudCBmcm9tIFVURjggJiBzaHVmZmxlJyk7XG4gICAgICAgICAgdmFyIHRtcCA9IHt9OyBPYmplY3Qua2V5cyhhY3QuZGF0YSkuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gYWN0LmRhdGFba10gfSk7XG4gICAgICAgICAgZGVsZXRlIHRtcC5fO1xuICAgICAgICAgIHRtcC5hdXRoID0gYXV0aDtcbiAgICAgICAgICByb290LmdldCgnficrYWN0LnBhaXIucHViKS5wdXQodG1wKTtcbiAgICAgICAgfSAvLyBlbmQgZGVsZXRlXG4gICAgICAgIHJvb3QuZ2V0KCd+JythY3QucGFpci5wdWIpLmdldCgnYXV0aCcpLnB1dChhdXRoLCBjYiB8fCBub29wKTtcbiAgICAgIH1cbiAgICAgIGFjdC5lcnIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyIGFjayA9IHtlcnI6IEd1bi5sb2coZSB8fCAnVXNlciBjYW5ub3QgYmUgZm91bmQhJyl9O1xuICAgICAgICBjYXQuaW5nID0gZmFsc2U7XG4gICAgICAgIChjYiB8fCBub29wKShhY2spO1xuICAgICAgfVxuICAgICAgYWN0LnBsdWdpbiA9IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICBpZighKGFjdC5uYW1lID0gbmFtZSkpeyByZXR1cm4gYWN0LmVycigpIH1cbiAgICAgICAgdmFyIHRtcCA9IFtuYW1lXTtcbiAgICAgICAgaWYoJ34nICE9PSBuYW1lWzBdKXtcbiAgICAgICAgICB0bXBbMV0gPSAnficrbmFtZTtcbiAgICAgICAgICB0bXBbMl0gPSAnfkAnK25hbWU7XG4gICAgICAgIH1cbiAgICAgICAgYWN0LmIodG1wKTtcbiAgICAgIH1cbiAgICAgIGlmKHBhaXIpe1xuICAgICAgICBpZihwYWlyLnByaXYgJiYgcGFpci5lcHJpdilcbiAgICAgICAgICBhY3QuZyhwYWlyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJvb3QuZ2V0KCd+JytwYWlyLnB1Yikub25jZShhY3QuaCk7XG4gICAgICB9IGVsc2VcbiAgICAgIGlmKGFsaWFzKXtcbiAgICAgICAgcm9vdC5nZXQoJ35AJythbGlhcykub25jZShhY3QuYSk7XG4gICAgICB9IGVsc2VcbiAgICAgIGlmKCFhbGlhcyAmJiAhcGFzcyl7XG4gICAgICAgIFNFQS5uYW1lKGFjdC5wbHVnaW4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGd1bjtcbiAgICB9XG4gICAgZnVuY3Rpb24gb2JqX2lmeShvKXtcbiAgICAgIGlmKCdzdHJpbmcnICE9IHR5cGVvZiBvKXsgcmV0dXJuIG8gfVxuICAgICAgdHJ5e28gPSBKU09OLnBhcnNlKG8pO1xuICAgICAgfWNhdGNoKGUpe289e319O1xuICAgICAgcmV0dXJuIG87XG4gICAgfVxuICB9KShVU0UsICcuL2F1dGgnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFVzZXIgPSBVU0UoJy4vdXNlcicpLCBTRUEgPSBVc2VyLlNFQSwgR3VuID0gVXNlci5HVU47XG4gICAgVXNlci5wcm90b3R5cGUucmVjYWxsID0gZnVuY3Rpb24ob3B0LCBjYil7XG4gICAgICB2YXIgZ3VuID0gdGhpcywgcm9vdCA9IGd1bi5iYWNrKC0xKSwgdG1wO1xuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgaWYob3B0ICYmIG9wdC5zZXNzaW9uU3RvcmFnZSl7XG4gICAgICAgIGlmKFNFQS53aW5kb3cpe1xuICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgIHZhciBzUyA9IHt9O1xuICAgICAgICAgICAgc1MgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2U7IC8vIFRPRE86IEZJWCBCVUcgcHV0dGluZyBvbiBgLmlzYCFcbiAgICAgICAgICAgIGlmKHNTKXtcbiAgICAgICAgICAgICAgKHJvb3QuXykub3B0LnJlbWVtYmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgKChndW4uYmFjaygndXNlcicpLl8pLm9wdHx8b3B0KS5yZW1lbWJlciA9IHRydWU7XG4gICAgICAgICAgICAgIGlmKHNTLnJlY2FsbCB8fCBzUy5wYWlyKSByb290LnVzZXIoKS5hdXRoKEpTT04ucGFyc2Uoc1MucGFpciksIGNiKTsgLy8gcGFpciBpcyBtb3JlIHJlbGlhYmxlIHRoYW4gYWxpYXMvcGFzc1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1jYXRjaChlKXt9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGd1bjtcbiAgICAgIH1cbiAgICAgIC8qXG4gICAgICAgIFRPRE86IGNvcHkgbWhlbGFuZGVyJ3MgZXhwaXJ5IGNvZGUgYmFjayBpbi5cbiAgICAgICAgQWx0aG91Z2gsIHdlIHNob3VsZCBjaGVjayB3aXRoIGNvbW11bml0eSxcbiAgICAgICAgc2hvdWxkIGV4cGlyeSBiZSBjb3JlIG9yIGEgcGx1Z2luP1xuICAgICAgKi9cbiAgICAgIHJldHVybiBndW47XG4gICAgfVxuICB9KShVU0UsICcuL3JlY2FsbCcpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgVXNlciA9IFVTRSgnLi91c2VyJyksIFNFQSA9IFVzZXIuU0VBLCBHdW4gPSBVc2VyLkdVTiwgbm9vcCA9IGZ1bmN0aW9uKCl7fTtcbiAgICBVc2VyLnByb3RvdHlwZS5wYWlyID0gZnVuY3Rpb24oKXtcbiAgICAgIHZhciB1c2VyID0gdGhpcywgcHJveHk7IC8vIHVuZGVwcmVjYXRlZCwgaGlkaW5nIHdpdGggcHJveGllcy5cbiAgICAgIHRyeXsgcHJveHkgPSBuZXcgUHJveHkoe0RBTkdFUjonXFx1MjYyMCd9LCB7Z2V0OiBmdW5jdGlvbih0LHAscil7XG4gICAgICAgIGlmKCF1c2VyLmlzIHx8ICEodXNlci5ffHwnJykuc2VhKXsgcmV0dXJuIH1cbiAgICAgICAgcmV0dXJuIHVzZXIuXy5zZWFbcF07XG4gICAgICB9fSl9Y2F0Y2goZSl7fVxuICAgICAgcmV0dXJuIHByb3h5O1xuICAgIH1cbiAgICAvLyBJZiBhdXRoZW50aWNhdGVkIHVzZXIgd2FudHMgdG8gZGVsZXRlIGhpcy9oZXIgYWNjb3VudCwgbGV0J3Mgc3VwcG9ydCBpdCFcbiAgICBVc2VyLnByb3RvdHlwZS5kZWxldGUgPSBhc3luYyBmdW5jdGlvbihhbGlhcywgcGFzcywgY2Ipe1xuICAgICAgY29uc29sZS5sb2coXCJ1c2VyLmRlbGV0ZSgpIElTIERFUFJFQ0FURUQgQU5EIFdJTEwgQkUgTU9WRUQgVE8gQSBNT0RVTEUhISFcIik7XG4gICAgICB2YXIgZ3VuID0gdGhpcywgcm9vdCA9IGd1bi5iYWNrKC0xKSwgdXNlciA9IGd1bi5iYWNrKCd1c2VyJyk7XG4gICAgICB0cnkge1xuICAgICAgICB1c2VyLmF1dGgoYWxpYXMsIHBhc3MsIGZ1bmN0aW9uKGFjayl7XG4gICAgICAgICAgdmFyIHB1YiA9ICh1c2VyLmlzfHx7fSkucHViO1xuICAgICAgICAgIC8vIERlbGV0ZSB1c2VyIGRhdGFcbiAgICAgICAgICB1c2VyLm1hcCgpLm9uY2UoZnVuY3Rpb24oKXsgdGhpcy5wdXQobnVsbCkgfSk7XG4gICAgICAgICAgLy8gV2lwZSB1c2VyIGRhdGEgZnJvbSBtZW1vcnlcbiAgICAgICAgICB1c2VyLmxlYXZlKCk7XG4gICAgICAgICAgKGNiIHx8IG5vb3ApKHtvazogMH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgR3VuLmxvZygnVXNlci5kZWxldGUgZmFpbGVkISBFcnJvcjonLCBlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBndW47XG4gICAgfVxuICAgIFVzZXIucHJvdG90eXBlLmFsaXZlID0gYXN5bmMgZnVuY3Rpb24oKXtcbiAgICAgIGNvbnNvbGUubG9nKFwidXNlci5hbGl2ZSgpIElTIERFUFJFQ0FURUQhISFcIik7XG4gICAgICBjb25zdCBndW5Sb290ID0gdGhpcy5iYWNrKC0xKVxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQWxsIGlzIGdvb2QuIFNob3VsZCB3ZSBkbyBzb21ldGhpbmcgbW9yZSB3aXRoIGFjdHVhbCByZWNhbGxlZCBkYXRhP1xuICAgICAgICBhd2FpdCBhdXRoUmVjYWxsKGd1blJvb3QpXG4gICAgICAgIHJldHVybiBndW5Sb290Ll8udXNlci5fXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnN0IGVyciA9ICdObyBzZXNzaW9uISdcbiAgICAgICAgR3VuLmxvZyhlcnIpXG4gICAgICAgIHRocm93IHsgZXJyIH1cbiAgICAgIH1cbiAgICB9XG4gICAgVXNlci5wcm90b3R5cGUudHJ1c3QgPSBhc3luYyBmdW5jdGlvbih1c2VyKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiYC50cnVzdGAgQVBJIE1BWSBCRSBERUxFVEVEIE9SIENIQU5HRUQgT1IgUkVOQU1FRCwgRE8gTk9UIFVTRSFcIik7XG4gICAgICAvLyBUT0RPOiBCVUchISEgU0VBIGBub2RlYCByZWFkIGxpc3RlbmVyIG5lZWRzIHRvIGJlIGFzeW5jLCB3aGljaCBtZWFucyBjb3JlIG5lZWRzIHRvIGJlIGFzeW5jIHRvby5cbiAgICAgIC8vZ3VuLmdldCgnYWxpY2UnKS5nZXQoJ2FnZScpLnRydXN0KGJvYik7XG4gICAgICBpZiAoR3VuLmlzKHVzZXIpKSB7XG4gICAgICAgIHVzZXIuZ2V0KCdwdWInKS5nZXQoKGN0eCwgZXYpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhjdHgsIGV2KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgdXNlci5nZXQoJ3RydXN0JykuZ2V0KHBhdGgpLnB1dCh0aGVpclB1YmtleSk7XG5cbiAgICAgIC8vIGRvIGEgbG9va3VwIG9uIHRoaXMgZ3VuIGNoYWluIGRpcmVjdGx5ICh0aGF0IGdldHMgYm9iJ3MgY29weSBvZiB0aGUgZGF0YSlcbiAgICAgIC8vIGRvIGEgbG9va3VwIG9uIHRoZSBtZXRhZGF0YSB0cnVzdCB0YWJsZSBmb3IgdGhpcyBwYXRoICh0aGF0IGdldHMgYWxsIHRoZSBwdWJrZXlzIGFsbG93ZWQgdG8gd3JpdGUgb24gdGhpcyBwYXRoKVxuICAgICAgLy8gZG8gYSBsb29rdXAgb24gZWFjaCBvZiB0aG9zZSBwdWJLZXlzIE9OIHRoZSBwYXRoICh0byBnZXQgdGhlIGNvbGxhYiBkYXRhIFwibGF5ZXJzXCIpXG4gICAgICAvLyBUSEVOIHlvdSBwZXJmb3JtIEphY2hlbidzIG1peCBvcGVyYXRpb25cbiAgICAgIC8vIGFuZCByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGF0IHRvLi4uXG4gICAgfVxuICAgIFVzZXIucHJvdG90eXBlLmdyYW50ID0gZnVuY3Rpb24odG8sIGNiKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiYC5ncmFudGAgQVBJIE1BWSBCRSBERUxFVEVEIE9SIENIQU5HRUQgT1IgUkVOQU1FRCwgRE8gTk9UIFVTRSFcIik7XG4gICAgICB2YXIgZ3VuID0gdGhpcywgdXNlciA9IGd1bi5iYWNrKC0xKS51c2VyKCksIHBhaXIgPSB1c2VyLl8uc2VhLCBwYXRoID0gJyc7XG4gICAgICBndW4uYmFjayhmdW5jdGlvbihhdCl7IGlmKGF0LmlzKXsgcmV0dXJuIH0gcGF0aCArPSAoYXQuZ2V0fHwnJykgfSk7XG4gICAgICAoYXN5bmMgZnVuY3Rpb24oKXtcbiAgICAgIHZhciBlbmMsIHNlYyA9IGF3YWl0IHVzZXIuZ2V0KCdncmFudCcpLmdldChwYWlyLnB1YikuZ2V0KHBhdGgpLnRoZW4oKTtcbiAgICAgIHNlYyA9IGF3YWl0IFNFQS5kZWNyeXB0KHNlYywgcGFpcik7XG4gICAgICBpZighc2VjKXtcbiAgICAgICAgc2VjID0gU0VBLnJhbmRvbSgxNikudG9TdHJpbmcoKTtcbiAgICAgICAgZW5jID0gYXdhaXQgU0VBLmVuY3J5cHQoc2VjLCBwYWlyKTtcbiAgICAgICAgdXNlci5nZXQoJ2dyYW50JykuZ2V0KHBhaXIucHViKS5nZXQocGF0aCkucHV0KGVuYyk7XG4gICAgICB9XG4gICAgICB2YXIgcHViID0gdG8uZ2V0KCdwdWInKS50aGVuKCk7XG4gICAgICB2YXIgZXB1YiA9IHRvLmdldCgnZXB1YicpLnRoZW4oKTtcbiAgICAgIHB1YiA9IGF3YWl0IHB1YjsgZXB1YiA9IGF3YWl0IGVwdWI7XG4gICAgICB2YXIgZGggPSBhd2FpdCBTRUEuc2VjcmV0KGVwdWIsIHBhaXIpO1xuICAgICAgZW5jID0gYXdhaXQgU0VBLmVuY3J5cHQoc2VjLCBkaCk7XG4gICAgICB1c2VyLmdldCgnZ3JhbnQnKS5nZXQocHViKS5nZXQocGF0aCkucHV0KGVuYywgY2IpO1xuICAgICAgfSgpKTtcbiAgICAgIHJldHVybiBndW47XG4gICAgfVxuICAgIFVzZXIucHJvdG90eXBlLnNlY3JldCA9IGZ1bmN0aW9uKGRhdGEsIGNiKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiYC5zZWNyZXRgIEFQSSBNQVkgQkUgREVMRVRFRCBPUiBDSEFOR0VEIE9SIFJFTkFNRUQsIERPIE5PVCBVU0UhXCIpO1xuICAgICAgdmFyIGd1biA9IHRoaXMsIHVzZXIgPSBndW4uYmFjaygtMSkudXNlcigpLCBwYWlyID0gdXNlci5wYWlyKCksIHBhdGggPSAnJztcbiAgICAgIGd1bi5iYWNrKGZ1bmN0aW9uKGF0KXsgaWYoYXQuaXMpeyByZXR1cm4gfSBwYXRoICs9IChhdC5nZXR8fCcnKSB9KTtcbiAgICAgIChhc3luYyBmdW5jdGlvbigpe1xuICAgICAgdmFyIGVuYywgc2VjID0gYXdhaXQgdXNlci5nZXQoJ3RydXN0JykuZ2V0KHBhaXIucHViKS5nZXQocGF0aCkudGhlbigpO1xuICAgICAgc2VjID0gYXdhaXQgU0VBLmRlY3J5cHQoc2VjLCBwYWlyKTtcbiAgICAgIGlmKCFzZWMpe1xuICAgICAgICBzZWMgPSBTRUEucmFuZG9tKDE2KS50b1N0cmluZygpO1xuICAgICAgICBlbmMgPSBhd2FpdCBTRUEuZW5jcnlwdChzZWMsIHBhaXIpO1xuICAgICAgICB1c2VyLmdldCgndHJ1c3QnKS5nZXQocGFpci5wdWIpLmdldChwYXRoKS5wdXQoZW5jKTtcbiAgICAgIH1cbiAgICAgIGVuYyA9IGF3YWl0IFNFQS5lbmNyeXB0KGRhdGEsIHNlYyk7XG4gICAgICBndW4ucHV0KGVuYywgY2IpO1xuICAgICAgfSgpKTtcbiAgICAgIHJldHVybiBndW47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyB0aGUgZGVjcnlwdGVkIHZhbHVlLCBlbmNyeXB0ZWQgYnkgc2VjcmV0XG4gICAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICAgLy8gTWFyayBuZWVkcyB0byByZXZpZXcgMXN0IGJlZm9yZSBvZmZpY2lhbGx5IHN1cHBvcnRlZFxuICAgIFVzZXIucHJvdG90eXBlLmRlY3J5cHQgPSBmdW5jdGlvbihjYikge1xuICAgICAgbGV0IGd1biA9IHRoaXMsXG4gICAgICAgIHBhdGggPSAnJ1xuICAgICAgZ3VuLmJhY2soZnVuY3Rpb24oYXQpIHtcbiAgICAgICAgaWYgKGF0LmlzKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgcGF0aCArPSBhdC5nZXQgfHwgJydcbiAgICAgIH0pXG4gICAgICByZXR1cm4gZ3VuXG4gICAgICAgIC50aGVuKGFzeW5jIGRhdGEgPT4ge1xuICAgICAgICAgIGlmIChkYXRhID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB1c2VyID0gZ3VuLmJhY2soLTEpLnVzZXIoKVxuICAgICAgICAgIGNvbnN0IHBhaXIgPSB1c2VyLnBhaXIoKVxuICAgICAgICAgIGxldCBzZWMgPSBhd2FpdCB1c2VyXG4gICAgICAgICAgICAuZ2V0KCd0cnVzdCcpXG4gICAgICAgICAgICAuZ2V0KHBhaXIucHViKVxuICAgICAgICAgICAgLmdldChwYXRoKVxuICAgICAgICAgIHNlYyA9IGF3YWl0IFNFQS5kZWNyeXB0KHNlYywgcGFpcilcbiAgICAgICAgICBpZiAoIXNlYykge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGRlY3J5cHRlZCA9IGF3YWl0IFNFQS5kZWNyeXB0KGRhdGEsIHNlYylcbiAgICAgICAgICByZXR1cm4gZGVjcnlwdGVkXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgY2IgJiYgY2IocmVzKVxuICAgICAgICAgIHJldHVybiByZXNcbiAgICAgICAgfSlcbiAgICB9XG4gICAgKi9cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFVzZXJcbiAgfSkoVVNFLCAnLi9zaGFyZScpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3NlYScpLCBTID0gVVNFKCcuL3NldHRpbmdzJyksIG5vb3AgPSBmdW5jdGlvbigpIHt9LCB1O1xuICAgIHZhciBHdW4gPSAoJycrdSAhPSB0eXBlb2Ygd2luZG93KT8gKHdpbmRvdy5HdW58fHtvbjpub29wfSkgOiBVU0UoKCcnK3UgPT09IHR5cGVvZiBNT0RVTEU/Jy4nOicnKSsnLi9ndW4nLCAxKTtcbiAgICAvLyBBZnRlciB3ZSBoYXZlIGEgR1VOIGV4dGVuc2lvbiB0byBtYWtlIHVzZXIgcmVnaXN0cmF0aW9uL2xvZ2luIGVhc3ksIHdlIHRoZW4gbmVlZCB0byBoYW5kbGUgZXZlcnl0aGluZyBlbHNlLlxuXG4gICAgLy8gV2UgZG8gdGhpcyB3aXRoIGEgR1VOIGFkYXB0ZXIsIHdlIGZpcnN0IGxpc3RlbiB0byB3aGVuIGEgZ3VuIGluc3RhbmNlIGlzIGNyZWF0ZWQgKGFuZCB3aGVuIGl0cyBvcHRpb25zIGNoYW5nZSlcbiAgICBHdW4ub24oJ29wdCcsIGZ1bmN0aW9uKGF0KXtcbiAgICAgIGlmKCFhdC5zZWEpeyAvLyBvbmx5IGFkZCBTRUEgb25jZSBwZXIgaW5zdGFuY2UsIG9uIHRoZSBcImF0XCIgY29udGV4dC5cbiAgICAgICAgYXQuc2VhID0ge293bjoge319O1xuICAgICAgICBhdC5vbigncHV0JywgY2hlY2ssIGF0KTsgLy8gU0VBIG5vdyBydW5zIGl0cyBmaXJld2FsbCBvbiBIQU0gZGlmZnMsIG5vdCBhbGwgaS9vLlxuICAgICAgfVxuICAgICAgdGhpcy50by5uZXh0KGF0KTsgLy8gbWFrZSBzdXJlIHRvIGNhbGwgdGhlIFwibmV4dFwiIG1pZGRsZXdhcmUgYWRhcHRlci5cbiAgICB9KTtcblxuICAgIC8vIEFscmlnaHQsIHRoaXMgbmV4dCBhZGFwdGVyIGdldHMgcnVuIGF0IHRoZSBwZXIgbm9kZSBsZXZlbCBpbiB0aGUgZ3JhcGggZGF0YWJhc2UuXG4gICAgLy8gY29ycmVjdGlvbjogMjAyMCBpdCBnZXRzIHJ1biBvbiBlYWNoIGtleS92YWx1ZSBwYWlyIGluIGEgbm9kZSB1cG9uIGEgSEFNIGRpZmYuXG4gICAgLy8gVGhpcyB3aWxsIGxldCB1cyB2ZXJpZnkgdGhhdCBldmVyeSBwcm9wZXJ0eSBvbiBhIG5vZGUgaGFzIGEgdmFsdWUgc2lnbmVkIGJ5IGEgcHVibGljIGtleSB3ZSB0cnVzdC5cbiAgICAvLyBJZiB0aGUgc2lnbmF0dXJlIGRvZXMgbm90IG1hdGNoLCB0aGUgZGF0YSBpcyBqdXN0IGB1bmRlZmluZWRgIHNvIGl0IGRvZXNuJ3QgZ2V0IHBhc3NlZCBvbi5cbiAgICAvLyBJZiBpdCBkb2VzIG1hdGNoLCB0aGVuIHdlIHRyYW5zZm9ybSB0aGUgaW4tbWVtb3J5IFwidmlld1wiIG9mIHRoZSBkYXRhIGludG8gaXRzIHBsYWluIHZhbHVlICh3aXRob3V0IHRoZSBzaWduYXR1cmUpLlxuICAgIC8vIE5vdyBOT1RFISBTb21lIGRhdGEgaXMgXCJzeXN0ZW1cIiBkYXRhLCBub3QgdXNlciBkYXRhLiBFeGFtcGxlOiBMaXN0IG9mIHB1YmxpYyBrZXlzLCBhbGlhc2VzLCBldGMuXG4gICAgLy8gVGhpcyBkYXRhIGlzIHNlbGYtZW5mb3JjZWQgKHRoZSB2YWx1ZSBjYW4gb25seSBtYXRjaCBpdHMgSUQpLCBidXQgdGhhdCBpcyBoYW5kbGVkIGluIHRoZSBgc2VjdXJpdHlgIGZ1bmN0aW9uLlxuICAgIC8vIEZyb20gdGhlIHNlbGYtZW5mb3JjZWQgZGF0YSwgd2UgY2FuIHNlZSBhbGwgdGhlIGVkZ2VzIGluIHRoZSBncmFwaCB0aGF0IGJlbG9uZyB0byBhIHB1YmxpYyBrZXkuXG4gICAgLy8gRXhhbXBsZTogfkFTREYgaXMgdGhlIElEIG9mIGEgbm9kZSB3aXRoIEFTREYgYXMgaXRzIHB1YmxpYyBrZXksIHNpZ25lZCBhbGlhcyBhbmQgc2FsdCwgYW5kXG4gICAgLy8gaXRzIGVuY3J5cHRlZCBwcml2YXRlIGtleSwgYnV0IGl0IG1pZ2h0IGFsc28gaGF2ZSBvdGhlciBzaWduZWQgdmFsdWVzIG9uIGl0IGxpa2UgYHByb2ZpbGUgPSA8SUQ+YCBlZGdlLlxuICAgIC8vIFVzaW5nIHRoYXQgZGlyZWN0ZWQgZWRnZSdzIElELCB3ZSBjYW4gdGhlbiB0cmFjayAoaW4gbWVtb3J5KSB3aGljaCBJRHMgYmVsb25nIHRvIHdoaWNoIGtleXMuXG4gICAgLy8gSGVyZSBpcyBhIHByb2JsZW06IE11bHRpcGxlIHB1YmxpYyBrZXlzIGNhbiBcImNsYWltXCIgYW55IG5vZGUncyBJRCwgc28gdGhpcyBpcyBkYW5nZXJvdXMhXG4gICAgLy8gVGhpcyBtZWFucyB3ZSBzaG91bGQgT05MWSB0cnVzdCBvdXIgXCJmcmllbmRzXCIgKG91ciBrZXkgcmluZykgcHVibGljIGtleXMsIG5vdCBhbnkgb25lcy5cbiAgICAvLyBJIGhhdmUgbm90IHlldCBhZGRlZCB0aGF0IHRvIFNFQSB5ZXQgaW4gdGhpcyBhbHBoYSByZWxlYXNlLiBUaGF0IGlzIGNvbWluZyBzb29uLCBidXQgYmV3YXJlIGluIHRoZSBtZWFud2hpbGUhXG5cbiAgICBmdW5jdGlvbiBjaGVjayhtc2cpeyAvLyBSRVZJU0UgLyBJTVBST1ZFLCBOTyBORUVEIFRPIFBBU1MgTVNHL0VWRSBFQUNIIFNVQj9cbiAgICAgIHZhciBldmUgPSB0aGlzLCBhdCA9IGV2ZS5hcywgcHV0ID0gbXNnLnB1dCwgc291bCA9IHB1dFsnIyddLCBrZXkgPSBwdXRbJy4nXSwgdmFsID0gcHV0Wyc6J10sIHN0YXRlID0gcHV0Wyc+J10sIGlkID0gbXNnWycjJ10sIHRtcDtcbiAgICAgIGlmKCFzb3VsIHx8ICFrZXkpeyByZXR1cm4gfVxuICAgICAgaWYoKG1zZy5ffHwnJykuZmFpdGggJiYgKGF0Lm9wdHx8JycpLmZhaXRoICYmICdmdW5jdGlvbicgPT0gdHlwZW9mIG1zZy5fKXtcbiAgICAgICAgU0VBLm9wdC5wYWNrKHB1dCwgZnVuY3Rpb24ocmF3KXtcbiAgICAgICAgU0VBLnZlcmlmeShyYXcsIGZhbHNlLCBmdW5jdGlvbihkYXRhKXsgLy8gdGhpcyBpcyBzeW5jaHJvbm91cyBpZiBmYWxzZVxuICAgICAgICAgIHB1dFsnPSddID0gU0VBLm9wdC51bnBhY2soZGF0YSk7XG4gICAgICAgICAgZXZlLnRvLm5leHQobXNnKTtcbiAgICAgICAgfSl9KVxuICAgICAgICByZXR1cm4gXG4gICAgICB9XG4gICAgICB2YXIgbm8gPSBmdW5jdGlvbih3aHkpeyBhdC5vbignaW4nLCB7J0AnOiBpZCwgZXJyOiBtc2cuZXJyID0gd2h5fSkgfTsgLy8gZXhwbG9pdCBpbnRlcm5hbCByZWxheSBzdHVuIGZvciBub3csIG1heWJlIHZpb2xhdGVzIHNwZWMsIGJ1dCB0ZXN0aW5nIGZvciBub3cuIC8vIE5vdGU6IHRoaXMgbWF5IGJlIG9ubHkgdGhlIHNoYXJkZWQgbWVzc2FnZSwgbm90IG9yaWdpbmFsIGJhdGNoLlxuICAgICAgLy92YXIgbm8gPSBmdW5jdGlvbih3aHkpeyBtc2cuYWNrKHdoeSkgfTtcbiAgICAgIChtc2cuX3x8JycpLkRCRyAmJiAoKG1zZy5ffHwnJykuREJHLmMgPSArbmV3IERhdGUpO1xuICAgICAgaWYoMCA8PSBzb3VsLmluZGV4T2YoJzw/JykpeyAvLyBzcGVjaWFsIGNhc2UgZm9yIFwiZG8gbm90IHN5bmMgZGF0YSBYIG9sZFwiIGZvcmdldFxuICAgICAgICAvLyAnYX5wdWIua2V5L2I8PzknXG4gICAgICAgIHRtcCA9IHBhcnNlRmxvYXQoc291bC5zcGxpdCgnPD8nKVsxXXx8JycpO1xuICAgICAgICBpZih0bXAgJiYgKHN0YXRlIDwgKEd1bi5zdGF0ZSgpIC0gKHRtcCAqIDEwMDApKSkpeyAvLyBzZWMgdG8gbXNcbiAgICAgICAgICAodG1wID0gbXNnLl8pICYmICh0bXAuc3R1bikgJiYgKHRtcC5zdHVuLS0pOyAvLyBUSElTIElTIEJBRCBDT0RFISBJdCBhc3N1bWVzIEdVTiBpbnRlcm5hbHMgZG8gc29tZXRoaW5nIHRoYXQgd2lsbCBwcm9iYWJseSBjaGFuZ2UgaW4gZnV0dXJlLCBidXQgaGFja2luZyBpbiBub3cuXG4gICAgICAgICAgcmV0dXJuOyAvLyBvbWl0IVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKCd+QCcgPT09IHNvdWwpeyAgLy8gc3BlY2lhbCBjYXNlIGZvciBzaGFyZWQgc3lzdGVtIGRhdGEsIHRoZSBsaXN0IG9mIGFsaWFzZXMuXG4gICAgICAgIGNoZWNrLmFsaWFzKGV2ZSwgbXNnLCB2YWwsIGtleSwgc291bCwgYXQsIG5vKTsgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYoJ35AJyA9PT0gc291bC5zbGljZSgwLDIpKXsgLy8gc3BlY2lhbCBjYXNlIGZvciBzaGFyZWQgc3lzdGVtIGRhdGEsIHRoZSBsaXN0IG9mIHB1YmxpYyBrZXlzIGZvciBhbiBhbGlhcy5cbiAgICAgICAgY2hlY2sucHVicyhldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubyk7IHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vaWYoJ34nID09PSBzb3VsLnNsaWNlKDAsMSkgJiYgMiA9PT0gKHRtcCA9IHNvdWwuc2xpY2UoMSkpLnNwbGl0KCcuJykubGVuZ3RoKXsgLy8gc3BlY2lhbCBjYXNlLCBhY2NvdW50IGRhdGEgZm9yIGEgcHVibGljIGtleS5cbiAgICAgIGlmKHRtcCA9IFNFQS5vcHQucHViKHNvdWwpKXsgLy8gc3BlY2lhbCBjYXNlLCBhY2NvdW50IGRhdGEgZm9yIGEgcHVibGljIGtleS5cbiAgICAgICAgY2hlY2sucHViKGV2ZSwgbXNnLCB2YWwsIGtleSwgc291bCwgYXQsIG5vLCBhdC51c2VyfHwnJywgdG1wKTsgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYoMCA8PSBzb3VsLmluZGV4T2YoJyMnKSl7IC8vIHNwZWNpYWwgY2FzZSBmb3IgY29udGVudCBhZGRyZXNzaW5nIGltbXV0YWJsZSBoYXNoZWQgZGF0YS5cbiAgICAgICAgY2hlY2suaGFzaChldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubyk7IHJldHVybjtcbiAgICAgIH0gXG4gICAgICBjaGVjay5hbnkoZXZlLCBtc2csIHZhbCwga2V5LCBzb3VsLCBhdCwgbm8sIGF0LnVzZXJ8fCcnKTsgcmV0dXJuO1xuICAgICAgZXZlLnRvLm5leHQobXNnKTsgLy8gbm90IGhhbmRsZWRcbiAgICB9XG4gICAgY2hlY2suaGFzaCA9IGZ1bmN0aW9uKGV2ZSwgbXNnLCB2YWwsIGtleSwgc291bCwgYXQsIG5vKXtcbiAgICAgIFNFQS53b3JrKHZhbCwgbnVsbCwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGlmKGRhdGEgJiYgZGF0YSA9PT0ga2V5LnNwbGl0KCcjJykuc2xpY2UoLTEpWzBdKXsgcmV0dXJuIGV2ZS50by5uZXh0KG1zZykgfVxuICAgICAgICBubyhcIkRhdGEgaGFzaCBub3Qgc2FtZSBhcyBoYXNoIVwiKTtcbiAgICAgIH0sIHtuYW1lOiAnU0hBLTI1Nid9KTtcbiAgICB9XG4gICAgY2hlY2suYWxpYXMgPSBmdW5jdGlvbihldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubyl7IC8vIEV4YW1wbGU6IHtfOiN+QCwgfkBhbGljZTogeyN+QGFsaWNlfX1cbiAgICAgIGlmKCF2YWwpeyByZXR1cm4gbm8oXCJEYXRhIG11c3QgZXhpc3QhXCIpIH0gLy8gZGF0YSBNVVNUIGV4aXN0XG4gICAgICBpZignfkAnK2tleSA9PT0gbGlua19pcyh2YWwpKXsgcmV0dXJuIGV2ZS50by5uZXh0KG1zZykgfSAvLyBpbiBmYWN0LCBpdCBtdXN0IGJlIEVYQUNUTFkgZXF1YWwgdG8gaXRzZWxmXG4gICAgICBubyhcIkFsaWFzIG5vdCBzYW1lIVwiKTsgLy8gaWYgaXQgaXNuJ3QsIHJlamVjdC5cbiAgICB9O1xuICAgIGNoZWNrLnB1YnMgPSBmdW5jdGlvbihldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubyl7IC8vIEV4YW1wbGU6IHtfOiN+QGFsaWNlLCB+YXNkZjogeyN+YXNkZn19XG4gICAgICBpZighdmFsKXsgcmV0dXJuIG5vKFwiQWxpYXMgbXVzdCBleGlzdCFcIikgfSAvLyBkYXRhIE1VU1QgZXhpc3RcbiAgICAgIGlmKGtleSA9PT0gbGlua19pcyh2YWwpKXsgcmV0dXJuIGV2ZS50by5uZXh0KG1zZykgfSAvLyBhbmQgdGhlIElEIG11c3QgYmUgRVhBQ1RMWSBlcXVhbCB0byBpdHMgcHJvcGVydHlcbiAgICAgIG5vKFwiQWxpYXMgbm90IHNhbWUhXCIpOyAvLyB0aGF0IHdheSBub2JvZHkgY2FuIHRhbXBlciB3aXRoIHRoZSBsaXN0IG9mIHB1YmxpYyBrZXlzLlxuICAgIH07XG4gICAgY2hlY2sucHViID0gYXN5bmMgZnVuY3Rpb24oZXZlLCBtc2csIHZhbCwga2V5LCBzb3VsLCBhdCwgbm8sIHVzZXIsIHB1Yil7IHZhciB0bXAgLy8gRXhhbXBsZToge186I35hc2RmLCBoZWxsbzond29ybGQnfmZkc2F9fVxuICAgICAgY29uc3QgcmF3ID0gYXdhaXQgUy5wYXJzZSh2YWwpIHx8IHt9XG4gICAgICBjb25zdCB2ZXJpZnkgPSAoY2VydGlmaWNhdGUsIGNlcnRpZmljYW50LCBjYikgPT4ge1xuICAgICAgICBpZiAoY2VydGlmaWNhdGUubSAmJiBjZXJ0aWZpY2F0ZS5zICYmIGNlcnRpZmljYW50ICYmIHB1YilcbiAgICAgICAgICAvLyBub3cgdmVyaWZ5IGNlcnRpZmljYXRlXG4gICAgICAgICAgcmV0dXJuIFNFQS52ZXJpZnkoY2VydGlmaWNhdGUsIHB1YiwgZGF0YSA9PiB7IC8vIGNoZWNrIGlmIFwicHViXCIgKG9mIHRoZSBncmFwaCBvd25lcikgcmVhbGx5IGlzc3VlZCB0aGlzIGNlcnRcbiAgICAgICAgICAgIGlmICh1ICE9PSBkYXRhICYmIHUgIT09IGRhdGEuZSAmJiBtc2cucHV0Wyc+J10gJiYgbXNnLnB1dFsnPiddID4gcGFyc2VGbG9hdChkYXRhLmUpKSByZXR1cm4gbm8oXCJDZXJ0aWZpY2F0ZSBleHBpcmVkLlwiKSAvLyBjZXJ0aWZpY2F0ZSBleHBpcmVkXG4gICAgICAgICAgICAvLyBcImRhdGEuY1wiID0gYSBsaXN0IG9mIGNlcnRpZmljYW50cy9jZXJ0aWZpZWQgdXNlcnNcbiAgICAgICAgICAgIC8vIFwiZGF0YS53XCIgPSBsZXggV1JJVEUgcGVybWlzc2lvbiwgaW4gdGhlIGZ1dHVyZSwgdGhlcmUgd2lsbCBiZSBcImRhdGEuclwiIHdoaWNoIG1lYW5zIGxleCBSRUFEIHBlcm1pc3Npb25cbiAgICAgICAgICAgIGlmICh1ICE9PSBkYXRhICYmIGRhdGEuYyAmJiBkYXRhLncgJiYgKGRhdGEuYyA9PT0gY2VydGlmaWNhbnQgfHwgZGF0YS5jLmluZGV4T2YoJyonIHx8IGNlcnRpZmljYW50KSA+IC0xKSkge1xuICAgICAgICAgICAgICAvLyBvaywgbm93IFwiY2VydGlmaWNhbnRcIiBpcyBpbiB0aGUgXCJjZXJ0aWZpY2FudHNcIiBsaXN0LCBidXQgaXMgXCJwYXRoXCIgYWxsb3dlZD8gQ2hlY2sgcGF0aFxuICAgICAgICAgICAgICBsZXQgcGF0aCA9IHNvdWwuaW5kZXhPZignLycpID4gLTEgPyBzb3VsLnJlcGxhY2Uoc291bC5zdWJzdHJpbmcoMCwgc291bC5pbmRleE9mKCcvJykgKyAxKSwgJycpIDogJydcbiAgICAgICAgICAgICAgU3RyaW5nLm1hdGNoID0gU3RyaW5nLm1hdGNoIHx8IEd1bi50ZXh0Lm1hdGNoXG4gICAgICAgICAgICAgIGNvbnN0IHcgPSBBcnJheS5pc0FycmF5KGRhdGEudykgPyBkYXRhLncgOiB0eXBlb2YgZGF0YS53ID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgZGF0YS53ID09PSAnc3RyaW5nJyA/IFtkYXRhLnddIDogW11cbiAgICAgICAgICAgICAgZm9yIChjb25zdCBsZXggb2Ygdykge1xuICAgICAgICAgICAgICAgIGlmICgoU3RyaW5nLm1hdGNoKHBhdGgsIGxleFsnIyddKSAmJiBTdHJpbmcubWF0Y2goa2V5LCBsZXhbJy4nXSkpIHx8ICghbGV4WycuJ10gJiYgU3RyaW5nLm1hdGNoKHBhdGgsIGxleFsnIyddKSkgfHwgKCFsZXhbJyMnXSAmJiBTdHJpbmcubWF0Y2goa2V5LCBsZXhbJy4nXSkpIHx8IFN0cmluZy5tYXRjaCgocGF0aCA/IHBhdGggKyAnLycgKyBrZXkgOiBrZXkpLCBsZXhbJyMnXSB8fCBsZXgpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBpcyBDZXJ0aWZpY2FudCBmb3JjZWQgdG8gcHJlc2VudCBpbiBQYXRoXG4gICAgICAgICAgICAgICAgICBpZiAobGV4WycrJ10gJiYgbGV4WycrJ10uaW5kZXhPZignKicpID4gLTEgJiYgcGF0aCAmJiBwYXRoLmluZGV4T2YoY2VydGlmaWNhbnQpID09IC0xICYmIGtleS5pbmRleE9mKGNlcnRpZmljYW50KSA9PSAtMSkgcmV0dXJuIG5vKGBQYXRoIFwiJHtwYXRofVwiIG9yIGtleSBcIiR7a2V5fVwiIG11c3QgY29udGFpbiBzdHJpbmcgXCIke2NlcnRpZmljYW50fVwiLmApXG4gICAgICAgICAgICAgICAgICAvLyBwYXRoIGlzIGFsbG93ZWQsIGJ1dCBpcyB0aGVyZSBhbnkgV1JJVEUgYmxvY2s/IENoZWNrIGl0IG91dFxuICAgICAgICAgICAgICAgICAgaWYgKGRhdGEud2IgJiYgKHR5cGVvZiBkYXRhLndiID09PSAnc3RyaW5nJyB8fCAoKGRhdGEud2IgfHwge30pWycjJ10pKSkgeyAvLyBcImRhdGEud2JcIiA9IHBhdGggdG8gdGhlIFdSSVRFIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIHZhciByb290ID0gZXZlLmFzLnJvb3QuJC5iYWNrKC0xKVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEud2IgPT09ICdzdHJpbmcnICYmICd+JyAhPT0gZGF0YS53Yi5zbGljZSgwLCAxKSkgcm9vdCA9IHJvb3QuZ2V0KCd+JyArIHB1YilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb3QuZ2V0KGRhdGEud2IpLmdldChjZXJ0aWZpY2FudCkub25jZSh2YWx1ZSA9PiB7IC8vIFRPRE86IElOVEVOVCBUTyBERVBSRUNBVEUuXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmICh2YWx1ZSA9PT0gMSB8fCB2YWx1ZSA9PT0gdHJ1ZSkpIHJldHVybiBubyhgQ2VydGlmaWNhbnQgJHtjZXJ0aWZpY2FudH0gYmxvY2tlZC5gKVxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihkYXRhKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKGRhdGEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBubyhcIkNlcnRpZmljYXRlIHZlcmlmaWNhdGlvbiBmYWlsLlwiKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoJ3B1YicgPT09IGtleSAmJiAnficgKyBwdWIgPT09IHNvdWwpIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gcHViKSByZXR1cm4gZXZlLnRvLm5leHQobXNnKSAvLyB0aGUgYWNjb3VudCBNVVNUIG1hdGNoIGBwdWJgIHByb3BlcnR5IHRoYXQgZXF1YWxzIHRoZSBJRCBvZiB0aGUgcHVibGljIGtleS5cbiAgICAgICAgcmV0dXJuIG5vKFwiQWNjb3VudCBub3Qgc2FtZSFcIilcbiAgICAgIH1cblxuICAgICAgaWYgKCh0bXAgPSB1c2VyLmlzKSAmJiB0bXAucHViICYmICFyYXdbJyonXSAmJiAhcmF3WycrJ10gJiYgKHB1YiA9PT0gdG1wLnB1YiB8fCAocHViICE9PSB0bXAucHViICYmICgobXNnLl8ubXNnIHx8IHt9KS5vcHQgfHwge30pLmNlcnQpKSl7XG4gICAgICAgIFNFQS5vcHQucGFjayhtc2cucHV0LCBwYWNrZWQgPT4ge1xuICAgICAgICAgIFNFQS5zaWduKHBhY2tlZCwgKHVzZXIuXykuc2VhLCBhc3luYyBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBpZiAodSA9PT0gZGF0YSkgcmV0dXJuIG5vKFNFQS5lcnIgfHwgJ1NpZ25hdHVyZSBmYWlsLicpXG4gICAgICAgICAgICBtc2cucHV0Wyc6J10gPSB7JzonOiB0bXAgPSBTRUEub3B0LnVucGFjayhkYXRhLm0pLCAnfic6IGRhdGEuc31cbiAgICAgICAgICAgIG1zZy5wdXRbJz0nXSA9IHRtcFxuICBcbiAgICAgICAgICAgIC8vIGlmIHdyaXRpbmcgdG8gb3duIGdyYXBoLCBqdXN0IGFsbG93IGl0XG4gICAgICAgICAgICBpZiAocHViID09PSB1c2VyLmlzLnB1Yikge1xuICAgICAgICAgICAgICBpZiAodG1wID0gbGlua19pcyh2YWwpKSAoYXQuc2VhLm93blt0bXBdID0gYXQuc2VhLm93blt0bXBdIHx8IHt9KVtwdWJdID0gMVxuICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeUFzeW5jKG1zZy5wdXRbJzonXSwgZnVuY3Rpb24oZXJyLHMpe1xuICAgICAgICAgICAgICAgIGlmKGVycil7IHJldHVybiBubyhlcnIgfHwgXCJTdHJpbmdpZnkgZXJyb3IuXCIpIH1cbiAgICAgICAgICAgICAgICBtc2cucHV0Wyc6J10gPSBzO1xuICAgICAgICAgICAgICAgIHJldHVybiBldmUudG8ubmV4dChtc2cpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgXG4gICAgICAgICAgICAvLyBpZiB3cml0aW5nIHRvIG90aGVyJ3MgZ3JhcGgsIGNoZWNrIGlmIGNlcnQgZXhpc3RzIHRoZW4gdHJ5IHRvIGluamVjdCBjZXJ0IGludG8gcHV0LCBhbHNvIGluamVjdCBzZWxmIHB1YiBzbyB0aGF0IGV2ZXJ5b25lIGNhbiB2ZXJpZnkgdGhlIHB1dFxuICAgICAgICAgICAgaWYgKHB1YiAhPT0gdXNlci5pcy5wdWIgJiYgKChtc2cuXy5tc2cgfHwge30pLm9wdCB8fCB7fSkuY2VydCkge1xuICAgICAgICAgICAgICBjb25zdCBjZXJ0ID0gYXdhaXQgUy5wYXJzZShtc2cuXy5tc2cub3B0LmNlcnQpXG4gICAgICAgICAgICAgIC8vIGV2ZW4gaWYgY2VydCBleGlzdHMsIHdlIG11c3QgdmVyaWZ5IGl0XG4gICAgICAgICAgICAgIGlmIChjZXJ0ICYmIGNlcnQubSAmJiBjZXJ0LnMpXG4gICAgICAgICAgICAgICAgdmVyaWZ5KGNlcnQsIHVzZXIuaXMucHViLCBfID0+IHtcbiAgICAgICAgICAgICAgICAgIG1zZy5wdXRbJzonXVsnKyddID0gY2VydCAvLyAnKycgaXMgYSBjZXJ0aWZpY2F0ZVxuICAgICAgICAgICAgICAgICAgbXNnLnB1dFsnOiddWycqJ10gPSB1c2VyLmlzLnB1YiAvLyAnKicgaXMgcHViIG9mIHRoZSB1c2VyIHdobyBwdXRzXG4gICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeUFzeW5jKG1zZy5wdXRbJzonXSwgZnVuY3Rpb24oZXJyLHMpe1xuICAgICAgICAgICAgICAgICAgICBpZihlcnIpeyByZXR1cm4gbm8oZXJyIHx8IFwiU3RyaW5naWZ5IGVycm9yLlwiKSB9XG4gICAgICAgICAgICAgICAgICAgIG1zZy5wdXRbJzonXSA9IHM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldmUudG8ubmV4dChtc2cpO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwge3JhdzogMX0pXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgU0VBLm9wdC5wYWNrKG1zZy5wdXQsIHBhY2tlZCA9PiB7XG4gICAgICAgIFNFQS52ZXJpZnkocGFja2VkLCByYXdbJyonXSB8fCBwdWIsIGZ1bmN0aW9uKGRhdGEpeyB2YXIgdG1wO1xuICAgICAgICAgIGRhdGEgPSBTRUEub3B0LnVucGFjayhkYXRhKTtcbiAgICAgICAgICBpZiAodSA9PT0gZGF0YSkgcmV0dXJuIG5vKFwiVW52ZXJpZmllZCBkYXRhLlwiKSAvLyBtYWtlIHN1cmUgdGhlIHNpZ25hdHVyZSBtYXRjaGVzIHRoZSBhY2NvdW50IGl0IGNsYWltcyB0byBiZSBvbi4gLy8gcmVqZWN0IGFueSB1cGRhdGVzIHRoYXQgYXJlIHNpZ25lZCB3aXRoIGEgbWlzbWF0Y2hlZCBhY2NvdW50LlxuICAgICAgICAgIGlmICgodG1wID0gbGlua19pcyhkYXRhKSkgJiYgcHViID09PSBTRUEub3B0LnB1Yih0bXApKSAoYXQuc2VhLm93blt0bXBdID0gYXQuc2VhLm93blt0bXBdIHx8IHt9KVtwdWJdID0gMVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIGNoZWNrIGlmIGNlcnQgKCcrJykgYW5kIHB1dHRlcidzIHB1YiAoJyonKSBleGlzdFxuICAgICAgICAgIGlmIChyYXdbJysnXSAmJiByYXdbJysnXVsnbSddICYmIHJhd1snKyddWydzJ10gJiYgcmF3WycqJ10pXG4gICAgICAgICAgICAvLyBub3cgdmVyaWZ5IGNlcnRpZmljYXRlXG4gICAgICAgICAgICB2ZXJpZnkocmF3WycrJ10sIHJhd1snKiddLCBfID0+IHtcbiAgICAgICAgICAgICAgbXNnLnB1dFsnPSddID0gZGF0YTtcbiAgICAgICAgICAgICAgcmV0dXJuIGV2ZS50by5uZXh0KG1zZyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbXNnLnB1dFsnPSddID0gZGF0YTtcbiAgICAgICAgICAgIHJldHVybiBldmUudG8ubmV4dChtc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgcmV0dXJuXG4gICAgfTtcbiAgICBjaGVjay5hbnkgPSBmdW5jdGlvbihldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubywgdXNlcil7IHZhciB0bXAsIHB1YjtcbiAgICAgIGlmKGF0Lm9wdC5zZWN1cmUpeyByZXR1cm4gbm8oXCJTb3VsIG1pc3NpbmcgcHVibGljIGtleSBhdCAnXCIgKyBrZXkgKyBcIicuXCIpIH1cbiAgICAgIC8vIFRPRE86IEFzayBjb21tdW5pdHkgaWYgc2hvdWxkIGF1dG8tc2lnbiBub24gdXNlci1ncmFwaCBkYXRhLlxuICAgICAgYXQub24oJ3NlY3VyZScsIGZ1bmN0aW9uKG1zZyl7IHRoaXMub2ZmKCk7XG4gICAgICAgIGlmKCFhdC5vcHQuc2VjdXJlKXsgcmV0dXJuIGV2ZS50by5uZXh0KG1zZykgfVxuICAgICAgICBubyhcIkRhdGEgY2Fubm90IGJlIGNoYW5nZWQuXCIpO1xuICAgICAgfSkub24ub24oJ3NlY3VyZScsIG1zZyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHZhbGlkID0gR3VuLnZhbGlkLCBsaW5rX2lzID0gZnVuY3Rpb24oZCxsKXsgcmV0dXJuICdzdHJpbmcnID09IHR5cGVvZiAobCA9IHZhbGlkKGQpKSAmJiBsIH0sIHN0YXRlX2lmeSA9IChHdW4uc3RhdGV8fCcnKS5pZnk7XG5cbiAgICB2YXIgcHViY3V0ID0gL1teXFx3Xy1dLzsgLy8gYW55dGhpbmcgbm90IGFscGhhbnVtZXJpYyBvciBfIC1cbiAgICBTRUEub3B0LnB1YiA9IGZ1bmN0aW9uKHMpe1xuICAgICAgaWYoIXMpeyByZXR1cm4gfVxuICAgICAgcyA9IHMuc3BsaXQoJ34nKTtcbiAgICAgIGlmKCFzIHx8ICEocyA9IHNbMV0pKXsgcmV0dXJuIH1cbiAgICAgIHMgPSBzLnNwbGl0KHB1YmN1dCkuc2xpY2UoMCwyKTtcbiAgICAgIGlmKCFzIHx8IDIgIT0gcy5sZW5ndGgpeyByZXR1cm4gfVxuICAgICAgaWYoJ0AnID09PSAoc1swXXx8JycpWzBdKXsgcmV0dXJuIH1cbiAgICAgIHMgPSBzLnNsaWNlKDAsMikuam9pbignLicpO1xuICAgICAgcmV0dXJuIHM7XG4gICAgfVxuICAgIFNFQS5vcHQuc3RyaW5neSA9IGZ1bmN0aW9uKHQpe1xuICAgICAgLy8gVE9ETzogZW5jcnlwdCBldGMuIG5lZWQgdG8gY2hlY2sgc3RyaW5nIHByaW1pdGl2ZS4gTWFrZSBhcyBicmVha2luZyBjaGFuZ2UuXG4gICAgfVxuICAgIFNFQS5vcHQucGFjayA9IGZ1bmN0aW9uKGQsY2IsaywgbixzKXsgdmFyIHRtcCwgZjsgLy8gcGFjayBmb3IgdmVyaWZ5aW5nXG4gICAgICBpZihTRUEub3B0LmNoZWNrKGQpKXsgcmV0dXJuIGNiKGQpIH1cbiAgICAgIGlmKGQgJiYgZFsnIyddICYmIGRbJy4nXSAmJiBkWyc+J10peyB0bXAgPSBkWyc6J107IGYgPSAxIH1cbiAgICAgIEpTT04ucGFyc2VBc3luYyhmPyB0bXAgOiBkLCBmdW5jdGlvbihlcnIsIG1ldGEpe1xuICAgICAgICB2YXIgc2lnID0gKCh1ICE9PSAobWV0YXx8JycpWyc6J10pICYmIChtZXRhfHwnJylbJ34nXSk7IC8vIG9yIGp1c3QgfiBjaGVjaz9cbiAgICAgICAgaWYoIXNpZyl7IGNiKGQpOyByZXR1cm4gfVxuICAgICAgICBjYih7bTogeycjJzpzfHxkWycjJ10sJy4nOmt8fGRbJy4nXSwnOic6KG1ldGF8fCcnKVsnOiddLCc+JzpkWyc+J118fEd1bi5zdGF0ZS5pcyhuLCBrKX0sIHM6IHNpZ30pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBPID0gU0VBLm9wdDtcbiAgICBTRUEub3B0LnVucGFjayA9IGZ1bmN0aW9uKGQsIGssIG4peyB2YXIgdG1wO1xuICAgICAgaWYodSA9PT0gZCl7IHJldHVybiB9XG4gICAgICBpZihkICYmICh1ICE9PSAodG1wID0gZFsnOiddKSkpeyByZXR1cm4gdG1wIH1cbiAgICAgIGsgPSBrIHx8IE8uZmFsbF9rZXk7IGlmKCFuICYmIE8uZmFsbF92YWwpeyBuID0ge307IG5ba10gPSBPLmZhbGxfdmFsIH1cbiAgICAgIGlmKCFrIHx8ICFuKXsgcmV0dXJuIH1cbiAgICAgIGlmKGQgPT09IG5ba10peyByZXR1cm4gZCB9XG4gICAgICBpZighU0VBLm9wdC5jaGVjayhuW2tdKSl7IHJldHVybiBkIH1cbiAgICAgIHZhciBzb3VsID0gKG4gJiYgbi5fICYmIG4uX1snIyddKSB8fCBPLmZhbGxfc291bCwgcyA9IEd1bi5zdGF0ZS5pcyhuLCBrKSB8fCBPLmZhbGxfc3RhdGU7XG4gICAgICBpZihkICYmIDQgPT09IGQubGVuZ3RoICYmIHNvdWwgPT09IGRbMF0gJiYgayA9PT0gZFsxXSAmJiBmbChzKSA9PT0gZmwoZFszXSkpe1xuICAgICAgICByZXR1cm4gZFsyXTtcbiAgICAgIH1cbiAgICAgIGlmKHMgPCBTRUEub3B0LnNodWZmbGVfYXR0YWNrKXtcbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgICB9XG4gICAgfVxuICAgIFNFQS5vcHQuc2h1ZmZsZV9hdHRhY2sgPSAxNTQ2MzI5NjAwMDAwOyAvLyBKYW4gMSwgMjAxOVxuICAgIHZhciBmbCA9IE1hdGguZmxvb3I7IC8vIFRPRE86IFN0aWxsIG5lZWQgdG8gZml4IGluY29uc2lzdGVudCBzdGF0ZSBpc3N1ZS5cbiAgICAvLyBUT0RPOiBQb3RlbnRpYWwgYnVnPyBJZiBwdWIvcHJpdiBrZXkgc3RhcnRzIHdpdGggYC1gPyBJREsgaG93IHBvc3NpYmxlLlxuXG4gIH0pKFVTRSwgJy4vaW5kZXgnKTtcbn0oKSk7XG4iLCJcbi8vIHJlcXVlc3QgLyByZXNwb25zZSBtb2R1bGUsIGZvciBhc2tpbmcgYW5kIGFja2luZyBtZXNzYWdlcy5cbnJlcXVpcmUoJy4vb250bycpOyAvLyBkZXBlbmRzIHVwb24gb250byFcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXNrKGNiLCBhcyl7XG5cdGlmKCF0aGlzLm9uKXsgcmV0dXJuIH1cblx0dmFyIGxhY2sgPSAodGhpcy5vcHR8fHt9KS5sYWNrIHx8IDkwMDA7XG5cdGlmKCEoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2IpKXtcblx0XHRpZighY2IpeyByZXR1cm4gfVxuXHRcdHZhciBpZCA9IGNiWycjJ10gfHwgY2IsIHRtcCA9ICh0aGlzLnRhZ3x8JycpW2lkXTtcblx0XHRpZighdG1wKXsgcmV0dXJuIH1cblx0XHRpZihhcyl7XG5cdFx0XHR0bXAgPSB0aGlzLm9uKGlkLCBhcyk7XG5cdFx0XHRjbGVhclRpbWVvdXQodG1wLmVycik7XG5cdFx0XHR0bXAuZXJyID0gc2V0VGltZW91dChmdW5jdGlvbigpeyB0bXAub2ZmKCkgfSwgbGFjayk7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHZhciBpZCA9IChhcyAmJiBhc1snIyddKSB8fCByYW5kb20oOSk7XG5cdGlmKCFjYil7IHJldHVybiBpZCB9XG5cdHZhciB0byA9IHRoaXMub24oaWQsIGNiLCBhcyk7XG5cdHRvLmVyciA9IHRvLmVyciB8fCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHRvLm9mZigpO1xuXHRcdHRvLm5leHQoe2VycjogXCJFcnJvcjogTm8gQUNLIHlldC5cIiwgbGFjazogdHJ1ZX0pO1xuXHR9LCBsYWNrKTtcblx0cmV0dXJuIGlkO1xufVxudmFyIHJhbmRvbSA9IFN0cmluZy5yYW5kb20gfHwgZnVuY3Rpb24oKXsgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpIH1cblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9yb290Jyk7XG5HdW4uY2hhaW4uYmFjayA9IGZ1bmN0aW9uKG4sIG9wdCl7IHZhciB0bXA7XG5cdG4gPSBuIHx8IDE7XG5cdGlmKC0xID09PSBuIHx8IEluZmluaXR5ID09PSBuKXtcblx0XHRyZXR1cm4gdGhpcy5fLnJvb3QuJDtcblx0fSBlbHNlXG5cdGlmKDEgPT09IG4pe1xuXHRcdHJldHVybiAodGhpcy5fLmJhY2sgfHwgdGhpcy5fKS4kO1xuXHR9XG5cdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fO1xuXHRpZih0eXBlb2YgbiA9PT0gJ3N0cmluZycpe1xuXHRcdG4gPSBuLnNwbGl0KCcuJyk7XG5cdH1cblx0aWYobiBpbnN0YW5jZW9mIEFycmF5KXtcblx0XHR2YXIgaSA9IDAsIGwgPSBuLmxlbmd0aCwgdG1wID0gYXQ7XG5cdFx0Zm9yKGk7IGkgPCBsOyBpKyspe1xuXHRcdFx0dG1wID0gKHRtcHx8ZW1wdHkpW25baV1dO1xuXHRcdH1cblx0XHRpZih1ICE9PSB0bXApe1xuXHRcdFx0cmV0dXJuIG9wdD8gZ3VuIDogdG1wO1xuXHRcdH0gZWxzZVxuXHRcdGlmKCh0bXAgPSBhdC5iYWNrKSl7XG5cdFx0XHRyZXR1cm4gdG1wLiQuYmFjayhuLCBvcHQpO1xuXHRcdH1cblx0XHRyZXR1cm47XG5cdH1cblx0aWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygbil7XG5cdFx0dmFyIHllcywgdG1wID0ge2JhY2s6IGF0fTtcblx0XHR3aGlsZSgodG1wID0gdG1wLmJhY2spXG5cdFx0JiYgdSA9PT0gKHllcyA9IG4odG1wLCBvcHQpKSl7fVxuXHRcdHJldHVybiB5ZXM7XG5cdH1cblx0aWYoJ251bWJlcicgPT0gdHlwZW9mIG4pe1xuXHRcdHJldHVybiAoYXQuYmFjayB8fCBhdCkuJC5iYWNrKG4gLSAxKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cbnZhciBlbXB0eSA9IHt9LCB1O1xuXHQiLCJcbi8vIFdBUk5JTkc6IEdVTiBpcyB2ZXJ5IHNpbXBsZSwgYnV0IHRoZSBKYXZhU2NyaXB0IGNoYWluaW5nIEFQSSBhcm91bmQgR1VOXG4vLyBpcyBjb21wbGljYXRlZCBhbmQgd2FzIGV4dHJlbWVseSBoYXJkIHRvIGJ1aWxkLiBJZiB5b3UgcG9ydCBHVU4gdG8gYW5vdGhlclxuLy8gbGFuZ3VhZ2UsIGNvbnNpZGVyIGltcGxlbWVudGluZyBhbiBlYXNpZXIgQVBJIHRvIGJ1aWxkLlxudmFyIEd1biA9IHJlcXVpcmUoJy4vcm9vdCcpO1xuR3VuLmNoYWluLmNoYWluID0gZnVuY3Rpb24oc3ViKXtcblx0dmFyIGd1biA9IHRoaXMsIGF0ID0gZ3VuLl8sIGNoYWluID0gbmV3IChzdWIgfHwgZ3VuKS5jb25zdHJ1Y3RvcihndW4pLCBjYXQgPSBjaGFpbi5fLCByb290O1xuXHRjYXQucm9vdCA9IHJvb3QgPSBhdC5yb290O1xuXHRjYXQuaWQgPSArK3Jvb3Qub25jZTtcblx0Y2F0LmJhY2sgPSBndW4uXztcblx0Y2F0Lm9uID0gR3VuLm9uO1xuXHRjYXQub24oJ2luJywgR3VuLm9uLmluLCBjYXQpOyAvLyBGb3IgJ2luJyBpZiBJIGFkZCBteSBvd24gbGlzdGVuZXJzIHRvIGVhY2ggdGhlbiBJIE1VU1QgZG8gaXQgYmVmb3JlIGluIGdldHMgY2FsbGVkLiBJZiBJIGxpc3RlbiBnbG9iYWxseSBmb3IgYWxsIGluY29taW5nIGRhdGEgaW5zdGVhZCB0aG91Z2gsIHJlZ2FyZGxlc3Mgb2YgaW5kaXZpZHVhbCBsaXN0ZW5lcnMsIEkgY2FuIHRyYW5zZm9ybSB0aGUgZGF0YSB0aGVyZSBhbmQgdGhlbiBhcyB3ZWxsLlxuXHRjYXQub24oJ291dCcsIEd1bi5vbi5vdXQsIGNhdCk7IC8vIEhvd2V2ZXIgZm9yIG91dHB1dCwgdGhlcmUgaXNuJ3QgcmVhbGx5IHRoZSBnbG9iYWwgb3B0aW9uLiBJIG11c3QgbGlzdGVuIGJ5IGFkZGluZyBteSBvd24gbGlzdGVuZXIgaW5kaXZpZHVhbGx5IEJFRk9SRSB0aGlzIG9uZSBpcyBldmVyIGNhbGxlZC5cblx0cmV0dXJuIGNoYWluO1xufVxuXG5mdW5jdGlvbiBvdXRwdXQobXNnKXtcblx0dmFyIHB1dCwgZ2V0LCBhdCA9IHRoaXMuYXMsIGJhY2sgPSBhdC5iYWNrLCByb290ID0gYXQucm9vdCwgdG1wO1xuXHRpZighbXNnLiQpeyBtc2cuJCA9IGF0LiQgfVxuXHR0aGlzLnRvLm5leHQobXNnKTtcblx0aWYoYXQuZXJyKXsgYXQub24oJ2luJywge3B1dDogYXQucHV0ID0gdSwgJDogYXQuJH0pOyByZXR1cm4gfVxuXHRpZihnZXQgPSBtc2cuZ2V0KXtcblx0XHQvKmlmKHUgIT09IGF0LnB1dCl7XG5cdFx0XHRhdC5vbignaW4nLCBhdCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fSovXG5cdFx0aWYocm9vdC5wYXNzKXsgcm9vdC5wYXNzW2F0LmlkXSA9IGF0OyB9IC8vIHdpbGwgdGhpcyBtYWtlIGZvciBidWdneSBiZWhhdmlvciBlbHNld2hlcmU/XG5cdFx0aWYoYXQubGV4KXsgT2JqZWN0LmtleXMoYXQubGV4KS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBhdC5sZXhba10gfSwgdG1wID0gbXNnLmdldCA9IG1zZy5nZXQgfHwge30pIH1cblx0XHRpZihnZXRbJyMnXSB8fCBhdC5zb3VsKXtcblx0XHRcdGdldFsnIyddID0gZ2V0WycjJ10gfHwgYXQuc291bDtcblx0XHRcdG1zZ1snIyddIHx8IChtc2dbJyMnXSA9IHRleHRfcmFuZCg5KSk7IC8vIEEzMTIwID9cblx0XHRcdGJhY2sgPSAocm9vdC4kLmdldChnZXRbJyMnXSkuXyk7XG5cdFx0XHRpZighKGdldCA9IGdldFsnLiddKSl7IC8vIHNvdWxcblx0XHRcdFx0dG1wID0gYmFjay5hc2sgJiYgYmFjay5hc2tbJyddOyAvLyBjaGVjayBpZiB3ZSBoYXZlIGFscmVhZHkgYXNrZWQgZm9yIHRoZSBmdWxsIG5vZGVcblx0XHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbJyddID0gYmFjazsgLy8gYWRkIGEgZmxhZyB0aGF0IHdlIGFyZSBub3cuXG5cdFx0XHRcdGlmKHUgIT09IGJhY2sucHV0KXsgLy8gaWYgd2UgYWxyZWFkeSBoYXZlIGRhdGEsXG5cdFx0XHRcdFx0YmFjay5vbignaW4nLCBiYWNrKTsgLy8gc2VuZCB3aGF0IGlzIGNhY2hlZCBkb3duIHRoZSBjaGFpblxuXHRcdFx0XHRcdGlmKHRtcCl7IHJldHVybiB9IC8vIGFuZCBkb24ndCBhc2sgZm9yIGl0IGFnYWluLlxuXHRcdFx0XHR9XG5cdFx0XHRcdG1zZy4kID0gYmFjay4kO1xuXHRcdFx0fSBlbHNlXG5cdFx0XHRpZihvYmpfaGFzKGJhY2sucHV0LCBnZXQpKXsgLy8gVE9ETzogc3VwcG9ydCAjTEVYICFcblx0XHRcdFx0dG1wID0gYmFjay5hc2sgJiYgYmFjay5hc2tbZ2V0XTtcblx0XHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbZ2V0XSA9IGJhY2suJC5nZXQoZ2V0KS5fO1xuXHRcdFx0XHRiYWNrLm9uKCdpbicsIHtnZXQ6IGdldCwgcHV0OiB7JyMnOiBiYWNrLnNvdWwsICcuJzogZ2V0LCAnOic6IGJhY2sucHV0W2dldF0sICc+Jzogc3RhdGVfaXMocm9vdC5ncmFwaFtiYWNrLnNvdWxdLCBnZXQpfX0pO1xuXHRcdFx0XHRpZih0bXApeyByZXR1cm4gfVxuXHRcdFx0fVxuXHRcdFx0XHQvKnB1dCA9IChiYWNrLiQuZ2V0KGdldCkuXyk7XG5cdFx0XHRcdGlmKCEodG1wID0gcHV0LmFjaykpeyBwdXQuYWNrID0gLTEgfVxuXHRcdFx0XHRiYWNrLm9uKCdpbicsIHtcblx0XHRcdFx0XHQkOiBiYWNrLiQsXG5cdFx0XHRcdFx0cHV0OiBHdW4uc3RhdGUuaWZ5KHt9LCBnZXQsIEd1bi5zdGF0ZShiYWNrLnB1dCwgZ2V0KSwgYmFjay5wdXRbZ2V0XSksXG5cdFx0XHRcdFx0Z2V0OiBiYWNrLmdldFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYodG1wKXsgcmV0dXJuIH1cblx0XHRcdH0gZWxzZVxuXHRcdFx0aWYoJ3N0cmluZycgIT0gdHlwZW9mIGdldCl7XG5cdFx0XHRcdHZhciBwdXQgPSB7fSwgbWV0YSA9IChiYWNrLnB1dHx8e30pLl87XG5cdFx0XHRcdEd1bi5vYmoubWFwKGJhY2sucHV0LCBmdW5jdGlvbih2LGspe1xuXHRcdFx0XHRcdGlmKCFHdW4udGV4dC5tYXRjaChrLCBnZXQpKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRwdXRba10gPSB2O1xuXHRcdFx0XHR9KVxuXHRcdFx0XHRpZighR3VuLm9iai5lbXB0eShwdXQpKXtcblx0XHRcdFx0XHRwdXQuXyA9IG1ldGE7XG5cdFx0XHRcdFx0YmFjay5vbignaW4nLCB7JDogYmFjay4kLCBwdXQ6IHB1dCwgZ2V0OiBiYWNrLmdldH0pXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYodG1wID0gYXQubGV4KXtcblx0XHRcdFx0XHR0bXAgPSAodG1wLl8pIHx8ICh0bXAuXyA9IGZ1bmN0aW9uKCl7fSk7XG5cdFx0XHRcdFx0aWYoYmFjay5hY2sgPCB0bXAuYXNrKXsgdG1wLmFzayA9IGJhY2suYWNrIH1cblx0XHRcdFx0XHRpZih0bXAuYXNrKXsgcmV0dXJuIH1cblx0XHRcdFx0XHR0bXAuYXNrID0gMTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ki9cblx0XHRcdHJvb3QuYXNrKGFjaywgbXNnKTsgLy8gQTMxMjAgP1xuXHRcdFx0cmV0dXJuIHJvb3Qub24oJ2luJywgbXNnKTtcblx0XHR9XG5cdFx0Ly9pZihyb290Lm5vdyl7IHJvb3Qubm93W2F0LmlkXSA9IHJvb3Qubm93W2F0LmlkXSB8fCB0cnVlOyBhdC5wYXNzID0ge30gfVxuXHRcdGlmKGdldFsnLiddKXtcblx0XHRcdGlmKGF0LmdldCl7XG5cdFx0XHRcdG1zZyA9IHtnZXQ6IHsnLic6IGF0LmdldH0sICQ6IGF0LiR9O1xuXHRcdFx0XHQoYmFjay5hc2sgfHwgKGJhY2suYXNrID0ge30pKVthdC5nZXRdID0gbXNnLiQuXzsgLy8gVE9ETzogUEVSRk9STUFOQ0U/IE1vcmUgZWxlZ2FudCB3YXk/XG5cdFx0XHRcdHJldHVybiBiYWNrLm9uKCdvdXQnLCBtc2cpO1xuXHRcdFx0fVxuXHRcdFx0bXNnID0ge2dldDogYXQubGV4PyBtc2cuZ2V0IDoge30sICQ6IGF0LiR9O1xuXHRcdFx0cmV0dXJuIGJhY2sub24oJ291dCcsIG1zZyk7XG5cdFx0fVxuXHRcdChhdC5hc2sgfHwgKGF0LmFzayA9IHt9KSlbJyddID0gYXQ7XHQgLy9hdC5hY2sgPSBhdC5hY2sgfHwgLTE7XG5cdFx0aWYoYXQuZ2V0KXtcblx0XHRcdGdldFsnLiddID0gYXQuZ2V0O1xuXHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbYXQuZ2V0XSA9IG1zZy4kLl87IC8vIFRPRE86IFBFUkZPUk1BTkNFPyBNb3JlIGVsZWdhbnQgd2F5P1xuXHRcdFx0cmV0dXJuIGJhY2sub24oJ291dCcsIG1zZyk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBiYWNrLm9uKCdvdXQnLCBtc2cpO1xufTsgR3VuLm9uLm91dCA9IG91dHB1dDtcblxuZnVuY3Rpb24gaW5wdXQobXNnLCBjYXQpeyBjYXQgPSBjYXQgfHwgdGhpcy5hczsgLy8gVE9ETzogVjggbWF5IG5vdCBiZSBhYmxlIHRvIG9wdGltaXplIGZ1bmN0aW9ucyB3aXRoIGRpZmZlcmVudCBwYXJhbWV0ZXIgY2FsbHMsIHNvIHRyeSB0byBkbyBiZW5jaG1hcmsgdG8gc2VlIGlmIHRoZXJlIGlzIGFueSBhY3R1YWwgZGlmZmVyZW5jZS5cblx0dmFyIHJvb3QgPSBjYXQucm9vdCwgZ3VuID0gbXNnLiQgfHwgKG1zZy4kID0gY2F0LiQpLCBhdCA9IChndW58fCcnKS5fIHx8IGVtcHR5LCB0bXAgPSBtc2cucHV0fHwnJywgc291bCA9IHRtcFsnIyddLCBrZXkgPSB0bXBbJy4nXSwgY2hhbmdlID0gKHUgIT09IHRtcFsnPSddKT8gdG1wWyc9J10gOiB0bXBbJzonXSwgc3RhdGUgPSB0bXBbJz4nXSB8fCAtSW5maW5pdHksIHNhdDsgLy8gZXZlID0gZXZlbnQsIGF0ID0gZGF0YSBhdCwgY2F0ID0gY2hhaW4gYXQsIHNhdCA9IHN1YiBhdCAoY2hpbGRyZW4gY2hhaW5zKS5cblx0aWYodSAhPT0gbXNnLnB1dCAmJiAodSA9PT0gdG1wWycjJ10gfHwgdSA9PT0gdG1wWycuJ10gfHwgKHUgPT09IHRtcFsnOiddICYmIHUgPT09IHRtcFsnPSddKSB8fCB1ID09PSB0bXBbJz4nXSkpeyAvLyBjb252ZXJ0IGZyb20gb2xkIGZvcm1hdFxuXHRcdGlmKCF2YWxpZCh0bXApKXtcblx0XHRcdGlmKCEoc291bCA9ICgodG1wfHwnJykuX3x8JycpWycjJ10pKXsgY29uc29sZS5sb2coXCJjaGFpbiBub3QgeWV0IHN1cHBvcnRlZCBmb3JcIiwgdG1wLCAnLi4uJywgbXNnLCBjYXQpOyByZXR1cm47IH1cblx0XHRcdGd1biA9IGNhdC5yb290LiQuZ2V0KHNvdWwpO1xuXHRcdFx0cmV0dXJuIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyh0bXApLnNvcnQoKSwgZnVuY3Rpb24oayl7IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93IC8vIEJVRz8gP1NvbWUgcmUtaW4gbG9naWMgbWF5IGRlcGVuZCBvbiB0aGlzIGJlaW5nIHN5bmM/XG5cdFx0XHRcdGlmKCdfJyA9PSBrIHx8IHUgPT09IChzdGF0ZSA9IHN0YXRlX2lzKHRtcCwgaykpKXsgcmV0dXJuIH1cblx0XHRcdFx0Y2F0Lm9uKCdpbicsIHskOiBndW4sIHB1dDogeycjJzogc291bCwgJy4nOiBrLCAnPSc6IHRtcFtrXSwgJz4nOiBzdGF0ZX0sIFZJQTogbXNnfSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y2F0Lm9uKCdpbicsIHskOiBhdC5iYWNrLiQsIHB1dDogeycjJzogc291bCA9IGF0LmJhY2suc291bCwgJy4nOiBrZXkgPSBhdC5oYXMgfHwgYXQuZ2V0LCAnPSc6IHRtcCwgJz4nOiBzdGF0ZV9pcyhhdC5iYWNrLnB1dCwga2V5KX0sIHZpYTogbXNnfSk7IC8vIFRPRE86IFRoaXMgY291bGQgYmUgYnVnZ3khIEl0IGFzc3VtZXMvYXBwcm94ZXMgZGF0YSwgb3RoZXIgc3R1ZmYgY291bGQgaGF2ZSBjb3JydXB0ZWQgaXQuXG5cdFx0cmV0dXJuO1xuXHR9XG5cdGlmKChtc2cuc2Vlbnx8JycpW2NhdC5pZF0peyByZXR1cm4gfSAobXNnLnNlZW4gfHwgKG1zZy5zZWVuID0gZnVuY3Rpb24oKXt9KSlbY2F0LmlkXSA9IGNhdDsgLy8gaGVscCBzdG9wIHNvbWUgaW5maW5pdGUgbG9vcHNcblxuXHRpZihjYXQgIT09IGF0KXsgLy8gZG9uJ3Qgd29ycnkgYWJvdXQgdGhpcyB3aGVuIGZpcnN0IHVuZGVyc3RhbmRpbmcgdGhlIGNvZGUsIGl0IGhhbmRsZXMgY2hhbmdpbmcgY29udGV4dHMgb24gYSBtZXNzYWdlLiBBIHNvdWwgY2hhaW4gd2lsbCBuZXZlciBoYXZlIGEgZGlmZmVyZW50IGNvbnRleHQuXG5cdFx0T2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSwgdG1wID0ge30pOyAvLyBtYWtlIGNvcHkgb2YgbWVzc2FnZVxuXHRcdHRtcC5nZXQgPSBjYXQuZ2V0IHx8IHRtcC5nZXQ7XG5cdFx0aWYoIWNhdC5zb3VsICYmICFjYXQuaGFzKXsgLy8gaWYgd2UgZG8gbm90IHJlY29nbml6ZSB0aGUgY2hhaW4gdHlwZVxuXHRcdFx0dG1wLiQkJCA9IHRtcC4kJCQgfHwgY2F0LiQ7IC8vIG1ha2UgYSByZWZlcmVuY2UgdG8gd2hlcmV2ZXIgaXQgY2FtZSBmcm9tLlxuXHRcdH0gZWxzZVxuXHRcdGlmKGF0LnNvdWwpeyAvLyBhIGhhcyAocHJvcGVydHkpIGNoYWluIHdpbGwgaGF2ZSBhIGRpZmZlcmVudCBjb250ZXh0IHNvbWV0aW1lcyBpZiBpdCBpcyBsaW5rZWQgKHRvIGEgc291bCBjaGFpbikuIEFueXRoaW5nIHRoYXQgaXMgbm90IGEgc291bCBvciBoYXMgY2hhaW4sIHdpbGwgYWx3YXlzIGhhdmUgZGlmZmVyZW50IGNvbnRleHRzLlxuXHRcdFx0dG1wLiQgPSBjYXQuJDtcblx0XHRcdHRtcC4kJCA9IHRtcC4kJCB8fCBhdC4kO1xuXHRcdH1cblx0XHRtc2cgPSB0bXA7IC8vIHVzZSB0aGUgbWVzc2FnZSB3aXRoIHRoZSBuZXcgY29udGV4dCBpbnN0ZWFkO1xuXHR9XG5cdHVubGluayhtc2csIGNhdCk7XG5cblx0aWYoKChjYXQuc291bC8qICYmIChjYXQuYXNrfHwnJylbJyddKi8pIHx8IG1zZy4kJCkgJiYgc3RhdGUgPj0gc3RhdGVfaXMocm9vdC5ncmFwaFtzb3VsXSwga2V5KSl7IC8vIFRoZSByb290IGhhcyBhbiBpbi1tZW1vcnkgY2FjaGUgb2YgdGhlIGdyYXBoLCBidXQgaWYgb3VyIHBlZXIgaGFzIGFza2VkIGZvciB0aGUgZGF0YSB0aGVuIHdlIHdhbnQgYSBwZXIgZGVkdXBsaWNhdGVkIGNoYWluIGNvcHkgb2YgdGhlIGRhdGEgdGhhdCBtaWdodCBoYXZlIGxvY2FsIGVkaXRzIG9uIGl0LlxuXHRcdCh0bXAgPSByb290LiQuZ2V0KHNvdWwpLl8pLnB1dCA9IHN0YXRlX2lmeSh0bXAucHV0LCBrZXksIHN0YXRlLCBjaGFuZ2UsIHNvdWwpO1xuXHR9XG5cdGlmKCFhdC5zb3VsIC8qJiYgKGF0LmFza3x8JycpWycnXSovICYmIHN0YXRlID49IHN0YXRlX2lzKHJvb3QuZ3JhcGhbc291bF0sIGtleSkgJiYgKHNhdCA9IChyb290LiQuZ2V0KHNvdWwpLl8ubmV4dHx8JycpW2tleV0pKXsgLy8gU2FtZSBhcyBhYm92ZSBoZXJlLCBidXQgZm9yIG90aGVyIHR5cGVzIG9mIGNoYWlucy4gLy8gVE9ETzogSW1wcm92ZSBwZXJmIGJ5IHByZXZlbnRpbmcgZWNob2VzIHJlY2FjaGluZy5cblx0XHRzYXQucHV0ID0gY2hhbmdlOyAvLyB1cGRhdGUgY2FjaGVcblx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgKHRtcCA9IHZhbGlkKGNoYW5nZSkpKXtcblx0XHRcdHNhdC5wdXQgPSByb290LiQuZ2V0KHRtcCkuXy5wdXQgfHwgY2hhbmdlOyAvLyBzaGFyZSBzYW1lIGNhY2hlIGFzIHdoYXQgd2UncmUgbGlua2VkIHRvLlxuXHRcdH1cblx0fVxuXG5cdHRoaXMudG8gJiYgdGhpcy50by5uZXh0KG1zZyk7IC8vIDFzdCBBUEkgam9iIGlzIHRvIGNhbGwgYWxsIGNoYWluIGxpc3RlbmVycy5cblx0Ly8gVE9ETzogTWFrZSBpbnB1dCBtb3JlIHJldXNhYmxlIGJ5IG9ubHkgZG9pbmcgdGhlc2UgKHNvbWU/KSBjYWxscyBpZiB3ZSBhcmUgYSBjaGFpbiB3ZSByZWNvZ25pemU/IFRoaXMgbWVhbnMgZWFjaCBpbnB1dCBsaXN0ZW5lciB3b3VsZCBiZSByZXNwb25zaWJsZSBmb3Igd2hlbiBsaXN0ZW5lcnMgbmVlZCB0byBiZSBjYWxsZWQsIHdoaWNoIG1ha2VzIHNlbnNlLCBhcyB0aGV5IG1pZ2h0IHdhbnQgdG8gZmlsdGVyLlxuXHRjYXQuYW55ICYmIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhjYXQuYW55KSwgZnVuY3Rpb24oYW55KXsgKGFueSA9IGNhdC5hbnlbYW55XSkgJiYgYW55KG1zZykgfSwwLDk5KTsgLy8gMXN0IEFQSSBqb2IgaXMgdG8gY2FsbCBhbGwgY2hhaW4gbGlzdGVuZXJzLiAvLyBUT0RPOiAua2V5cyggaXMgc2xvdyAvLyBCVUc6IFNvbWUgcmUtaW4gbG9naWMgbWF5IGRlcGVuZCBvbiB0aGlzIGJlaW5nIHN5bmMuXG5cdGNhdC5lY2hvICYmIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhjYXQuZWNobyksIGZ1bmN0aW9uKGxhdCl7IChsYXQgPSBjYXQuZWNob1tsYXRdKSAmJiBsYXQub24oJ2luJywgbXNnKSB9LDAsOTkpOyAvLyAmIGxpbmtlZCBhdCBjaGFpbnMgLy8gVE9ETzogLmtleXMoIGlzIHNsb3cgLy8gQlVHOiBTb21lIHJlLWluIGxvZ2ljIG1heSBkZXBlbmQgb24gdGhpcyBiZWluZyBzeW5jLlxuXG5cdGlmKCgobXNnLiQkfHwnJykuX3x8YXQpLnNvdWwpeyAvLyBjb21tZW50cyBhcmUgbGluZWFyLCBidXQgdGhpcyBsaW5lIG9mIGNvZGUgaXMgbm9uLWxpbmVhciwgc28gaWYgSSB3ZXJlIHRvIGNvbW1lbnQgd2hhdCBpdCBkb2VzLCB5b3UnZCBoYXZlIHRvIHJlYWQgNDIgb3RoZXIgY29tbWVudHMgZmlyc3QuLi4gYnV0IHlvdSBjYW4ndCByZWFkIGFueSBvZiB0aG9zZSBjb21tZW50cyB1bnRpbCB5b3UgZmlyc3QgcmVhZCB0aGlzIGNvbW1lbnQuIFdoYXQhPyAvLyBzaG91bGRuJ3QgdGhpcyBtYXRjaCBsaW5rJ3MgY2hlY2s/XG5cdFx0Ly8gaXMgdGhlcmUgY2FzZXMgd2hlcmUgaXQgaXMgYSAkJCB0aGF0IHdlIGRvIE5PVCB3YW50IHRvIGRvIHRoZSBmb2xsb3dpbmc/IFxuXHRcdGlmKChzYXQgPSBjYXQubmV4dCkgJiYgKHNhdCA9IHNhdFtrZXldKSl7IC8vIFRPRE86IHBvc3NpYmxlIHRyaWNrPyBNYXliZSBoYXZlIGBpb25tYXBgIGNvZGUgc2V0IGEgc2F0PyAvLyBUT0RPOiBNYXliZSB3ZSBzaG91bGQgZG8gYGNhdC5hc2tgIGluc3RlYWQ/IEkgZ3Vlc3MgZG9lcyBub3QgbWF0dGVyLlxuXHRcdFx0dG1wID0ge307IE9iamVjdC5rZXlzKG1zZykuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnW2tdIH0pO1xuXHRcdFx0dG1wLiQgPSAobXNnLiQkfHxtc2cuJCkuZ2V0KHRtcC5nZXQgPSBrZXkpOyBkZWxldGUgdG1wLiQkOyBkZWxldGUgdG1wLiQkJDtcblx0XHRcdHNhdC5vbignaW4nLCB0bXApO1xuXHRcdH1cblx0fVxuXG5cdGxpbmsobXNnLCBjYXQpO1xufTsgR3VuLm9uLmluID0gaW5wdXQ7XG5cbmZ1bmN0aW9uIGxpbmsobXNnLCBjYXQpeyBjYXQgPSBjYXQgfHwgdGhpcy5hcyB8fCBtc2cuJC5fO1xuXHRpZihtc2cuJCQgJiYgdGhpcyAhPT0gR3VuLm9uKXsgcmV0dXJuIH0gLy8gJCQgbWVhbnMgd2UgY2FtZSBmcm9tIGEgbGluaywgc28gd2UgYXJlIGF0IHRoZSB3cm9uZyBsZXZlbCwgdGh1cyBpZ25vcmUgaXQgdW5sZXNzIG92ZXJydWxlZCBtYW51YWxseSBieSBiZWluZyBjYWxsZWQgZGlyZWN0bHkuXG5cdGlmKCFtc2cucHV0IHx8IGNhdC5zb3VsKXsgcmV0dXJuIH0gLy8gQnV0IHlvdSBjYW5ub3Qgb3ZlcnJ1bGUgYmVpbmcgbGlua2VkIHRvIG5vdGhpbmcsIG9yIHRyeWluZyB0byBsaW5rIGEgc291bCBjaGFpbiAtIHRoYXQgbXVzdCBuZXZlciBoYXBwZW4uXG5cdHZhciBwdXQgPSBtc2cucHV0fHwnJywgbGluayA9IHB1dFsnPSddfHxwdXRbJzonXSwgdG1wO1xuXHR2YXIgcm9vdCA9IGNhdC5yb290LCB0YXQgPSByb290LiQuZ2V0KHB1dFsnIyddKS5nZXQocHV0WycuJ10pLl87XG5cdGlmKCdzdHJpbmcnICE9IHR5cGVvZiAobGluayA9IHZhbGlkKGxpbmspKSl7XG5cdFx0aWYodGhpcyA9PT0gR3VuLm9uKXsgKHRhdC5lY2hvIHx8ICh0YXQuZWNobyA9IHt9KSlbY2F0LmlkXSA9IGNhdCB9IC8vIGFsbG93IHNvbWUgY2hhaW4gdG8gZXhwbGljaXRseSBmb3JjZSBsaW5raW5nIHRvIHNpbXBsZSBkYXRhLlxuXHRcdHJldHVybjsgLy8gYnkgZGVmYXVsdCBkbyBub3QgbGluayB0byBkYXRhIHRoYXQgaXMgbm90IGEgbGluay5cblx0fVxuXHRpZigodGF0LmVjaG8gfHwgKHRhdC5lY2hvID0ge30pKVtjYXQuaWRdIC8vIHdlJ3ZlIGFscmVhZHkgbGlua2VkIG91cnNlbHZlcyBzbyB3ZSBkbyBub3QgbmVlZCB0byBkbyBpdCBhZ2Fpbi4gRXhjZXB0Li4uIChhbm5veWluZyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzKVxuXHRcdCYmICEocm9vdC5wYXNzfHwnJylbY2F0LmlkXSl7IHJldHVybiB9IC8vIGlmIGEgbmV3IGV2ZW50IGxpc3RlbmVyIHdhcyBhZGRlZCwgd2UgbmVlZCB0byBtYWtlIGEgcGFzcyB0aHJvdWdoIGZvciBpdC4gVGhlIHBhc3Mgd2lsbCBiZSBvbiB0aGUgY2hhaW4sIG5vdCBhbHdheXMgdGhlIGNoYWluIHBhc3NlZCBkb3duLiBcblx0aWYodG1wID0gcm9vdC5wYXNzKXsgaWYodG1wW2xpbmsrY2F0LmlkXSl7IHJldHVybiB9IHRtcFtsaW5rK2NhdC5pZF0gPSAxIH0gLy8gQnV0IHRoZSBhYm92ZSBlZGdlIGNhc2UgbWF5IFwicGFzcyB0aHJvdWdoXCIgb24gYSBjaXJjdWxhciBncmFwaCBjYXVzaW5nIGluZmluaXRlIHBhc3Nlcywgc28gd2UgaGFja2lseSBhZGQgYSB0ZW1wb3JhcnkgY2hlY2sgZm9yIHRoYXQuXG5cblx0KHRhdC5lY2hvfHwodGF0LmVjaG89e30pKVtjYXQuaWRdID0gY2F0OyAvLyBzZXQgb3Vyc2VsZiB1cCBmb3IgdGhlIGVjaG8hIC8vIFRPRE86IEJVRz8gRWNobyB0byBzZWxmIG5vIGxvbmdlciBjYXVzZXMgcHJvYmxlbXM/IENvbmZpcm0uXG5cblx0aWYoY2F0Lmhhcyl7IGNhdC5saW5rID0gbGluayB9XG5cdHZhciBzYXQgPSByb290LiQuZ2V0KHRhdC5saW5rID0gbGluaykuXzsgLy8gZ3JhYiB3aGF0IHdlJ3JlIGxpbmtpbmcgdG8uXG5cdChzYXQuZWNobyB8fCAoc2F0LmVjaG8gPSB7fSkpW3RhdC5pZF0gPSB0YXQ7IC8vIGxpbmsgaXQuXG5cdHZhciB0bXAgPSBjYXQuYXNrfHwnJzsgLy8gYXNrIHRoZSBjaGFpbiBmb3Igd2hhdCBuZWVkcyB0byBiZSBsb2FkZWQgbmV4dCFcblx0aWYodG1wWycnXSB8fCBjYXQubGV4KXsgLy8gd2UgbWlnaHQgbmVlZCB0byBsb2FkIHRoZSB3aG9sZSB0aGluZyAvLyBUT0RPOiBjYXQubGV4IHByb2JhYmx5IGhhcyBlZGdlIGNhc2UgYnVncyB0byBpdCwgbmVlZCBtb3JlIHRlc3QgY292ZXJhZ2UuXG5cdFx0c2F0Lm9uKCdvdXQnLCB7Z2V0OiB7JyMnOiBsaW5rfX0pO1xuXHR9XG5cdHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyh0bXApLCBmdW5jdGlvbihnZXQsIHNhdCl7IC8vIGlmIHN1YiBjaGFpbnMgYXJlIGFza2luZyBmb3IgZGF0YS4gLy8gVE9ETzogLmtleXMoIGlzIHNsb3cgLy8gQlVHPyA/U29tZSByZS1pbiBsb2dpYyBtYXkgZGVwZW5kIG9uIHRoaXMgYmVpbmcgc3luYz9cblx0XHRpZighZ2V0IHx8ICEoc2F0ID0gdG1wW2dldF0pKXsgcmV0dXJuIH1cblx0XHRzYXQub24oJ291dCcsIHtnZXQ6IHsnIyc6IGxpbmssICcuJzogZ2V0fX0pOyAvLyBnbyBnZXQgaXQuXG5cdH0sMCw5OSk7XG59OyBHdW4ub24ubGluayA9IGxpbms7XG5cbmZ1bmN0aW9uIHVubGluayhtc2csIGNhdCl7IC8vIHVnaCwgc28gbXVjaCBjb2RlIGZvciBzZWVtaW5nbHkgZWRnZSBjYXNlIGJlaGF2aW9yLlxuXHR2YXIgcHV0ID0gbXNnLnB1dHx8JycsIGNoYW5nZSA9ICh1ICE9PSBwdXRbJz0nXSk/IHB1dFsnPSddIDogcHV0Wyc6J10sIHJvb3QgPSBjYXQucm9vdCwgbGluaywgdG1wO1xuXHRpZih1ID09PSBjaGFuZ2UpeyAvLyAxc3QgZWRnZSBjYXNlOiBJZiB3ZSBoYXZlIGEgYnJhbmQgbmV3IGRhdGFiYXNlLCBubyBkYXRhIHdpbGwgYmUgZm91bmQuXG5cdFx0Ly8gVE9ETzogQlVHISBiZWNhdXNlIGVtcHR5aW5nIGNhY2hlIGNvdWxkIGJlIGFzeW5jIGZyb20gYmVsb3csIG1ha2Ugc3VyZSB3ZSBhcmUgbm90IGVtcHR5aW5nIGEgbmV3ZXIgY2FjaGUuIFNvIG1heWJlIHBhc3MgYW4gQXN5bmMgSUQgdG8gY2hlY2sgYWdhaW5zdD9cblx0XHQvLyBUT0RPOiBCVUchIFdoYXQgaWYgdGhpcyBpcyBhIG1hcD8gLy8gV2FybmluZyEgQ2xlYXJpbmcgdGhpbmdzIG91dCBuZWVkcyB0byBiZSByb2J1c3QgYWdhaW5zdCBzeW5jL2FzeW5jIG9wcywgb3IgZWxzZSB5b3UnbGwgc2VlIGBtYXAgdmFsIGdldCBwdXRgIHRlc3QgY2F0YXN0cm9waGljYWxseSBmYWlsIGJlY2F1c2UgbWFwIGF0dGVtcHRzIHRvIGxpbmsgd2hlbiBwYXJlbnQgZ3JhcGggaXMgc3RyZWFtZWQgYmVmb3JlIGNoaWxkIHZhbHVlIGdldHMgc2V0LiBOZWVkIHRvIGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsYWNrIGFja3MgYW5kIGZvcmNlIGNsZWFyaW5nLlxuXHRcdGlmKGNhdC5zb3VsICYmIHUgIT09IGNhdC5wdXQpeyByZXR1cm4gfSAvLyBkYXRhIG1heSBub3QgYmUgZm91bmQgb24gYSBzb3VsLCBidXQgaWYgYSBzb3VsIGFscmVhZHkgaGFzIGRhdGEsIHRoZW4gbm90aGluZyBjYW4gY2xlYXIgdGhlIHNvdWwgYXMgYSB3aG9sZS5cblx0XHQvL2lmKCFjYXQuaGFzKXsgcmV0dXJuIH1cblx0XHR0bXAgPSAobXNnLiQkfHxtc2cuJHx8JycpLl98fCcnO1xuXHRcdGlmKG1zZ1snQCddICYmICh1ICE9PSB0bXAucHV0IHx8IHUgIT09IGNhdC5wdXQpKXsgcmV0dXJuIH0gLy8gYSBcIm5vdCBmb3VuZFwiIGZyb20gb3RoZXIgcGVlcnMgc2hvdWxkIG5vdCBjbGVhciBvdXQgZGF0YSBpZiB3ZSBoYXZlIGFscmVhZHkgZm91bmQgaXQuXG5cdFx0Ly9pZihjYXQuaGFzICYmIHUgPT09IGNhdC5wdXQgJiYgIShyb290LnBhc3N8fCcnKVtjYXQuaWRdKXsgcmV0dXJuIH0gLy8gaWYgd2UgYXJlIGFscmVhZHkgdW5saW5rZWQsIGRvIG5vdCBjYWxsIGFnYWluLCB1bmxlc3MgZWRnZSBjYXNlLiAvLyBUT0RPOiBCVUchIFRoaXMgbGluZSBzaG91bGQgYmUgZGVsZXRlZCBmb3IgXCJ1bmxpbmsgZGVlcGx5IG5lc3RlZFwiLlxuXHRcdGlmKGxpbmsgPSBjYXQubGluayB8fCBtc2cubGlua2VkKXtcblx0XHRcdGRlbGV0ZSAocm9vdC4kLmdldChsaW5rKS5fLmVjaG98fCcnKVtjYXQuaWRdO1xuXHRcdH1cblx0XHRpZihjYXQuaGFzKXsgLy8gVE9ETzogRW1wdHkgb3V0IGxpbmtzLCBtYXBzLCBlY2hvcywgYWNrcy9hc2tzLCBldGMuP1xuXHRcdFx0Y2F0LmxpbmsgPSBudWxsO1xuXHRcdH1cblx0XHRjYXQucHV0ID0gdTsgLy8gZW1wdHkgb3V0IHRoZSBjYWNoZSBpZiwgZm9yIGV4YW1wbGUsIGFsaWNlJ3MgY2FyJ3MgY29sb3Igbm8gbG9uZ2VyIGV4aXN0cyAocmVsYXRpdmUgdG8gYWxpY2UpIGlmIGFsaWNlIG5vIGxvbmdlciBoYXMgYSBjYXIuXG5cdFx0Ly8gVE9ETzogQlVHISBGb3IgbWFwcywgcHJveHkgdGhpcyBzbyB0aGUgaW5kaXZpZHVhbCBzdWIgaXMgdHJpZ2dlcmVkLCBub3QgYWxsIHN1YnMuXG5cdFx0c2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKGNhdC5uZXh0fHwnJyksIGZ1bmN0aW9uKGdldCwgc2F0KXsgLy8gZW1wdHkgb3V0IGFsbCBzdWIgY2hhaW5zLiAvLyBUT0RPOiAua2V5cyggaXMgc2xvdyAvLyBCVUc/ID9Tb21lIHJlLWluIGxvZ2ljIG1heSBkZXBlbmQgb24gdGhpcyBiZWluZyBzeW5jPyAvLyBUT0RPOiBCVUc/IFRoaXMgd2lsbCB0cmlnZ2VyIGRlZXBlciBwdXQgZmlyc3QsIGRvZXMgcHV0IGxvZ2ljIGRlcGVuZCBvbiBuZXN0ZWQgb3JkZXI/IC8vIFRPRE86IEJVRyEgRm9yIG1hcCwgdGhpcyBuZWVkcyB0byBiZSB0aGUgaXNvbGF0ZWQgY2hpbGQsIG5vdCBhbGwgb2YgdGhlbS5cblx0XHRcdGlmKCEoc2F0ID0gY2F0Lm5leHRbZ2V0XSkpeyByZXR1cm4gfVxuXHRcdFx0Ly9pZihjYXQuaGFzICYmIHUgPT09IHNhdC5wdXQgJiYgIShyb290LnBhc3N8fCcnKVtzYXQuaWRdKXsgcmV0dXJuIH0gLy8gaWYgd2UgYXJlIGFscmVhZHkgdW5saW5rZWQsIGRvIG5vdCBjYWxsIGFnYWluLCB1bmxlc3MgZWRnZSBjYXNlLiAvLyBUT0RPOiBCVUchIFRoaXMgbGluZSBzaG91bGQgYmUgZGVsZXRlZCBmb3IgXCJ1bmxpbmsgZGVlcGx5IG5lc3RlZFwiLlxuXHRcdFx0aWYobGluayl7IGRlbGV0ZSAocm9vdC4kLmdldChsaW5rKS5nZXQoZ2V0KS5fLmVjaG98fCcnKVtzYXQuaWRdIH1cblx0XHRcdHNhdC5vbignaW4nLCB7Z2V0OiBnZXQsIHB1dDogdSwgJDogc2F0LiR9KTsgLy8gVE9ETzogQlVHPyBBZGQgcmVjdXJzaXZlIHNlZW4gY2hlY2s/XG5cdFx0fSwwLDk5KTtcblx0XHRyZXR1cm47XG5cdH1cblx0aWYoY2F0LnNvdWwpeyByZXR1cm4gfSAvLyBhIHNvdWwgY2Fubm90IHVubGluayBpdHNlbGYuXG5cdGlmKG1zZy4kJCl7IHJldHVybiB9IC8vIGEgbGlua2VkIGNoYWluIGRvZXMgbm90IGRvIHRoZSB1bmxpbmtpbmcsIHRoZSBzdWIgY2hhaW4gZG9lcy4gLy8gVE9ETzogQlVHPyBXaWxsIHRoaXMgY2FuY2VsIG1hcHM/XG5cdGxpbmsgPSB2YWxpZChjaGFuZ2UpOyAvLyBuZWVkIHRvIHVubGluayBhbnl0aW1lIHdlIGFyZSBub3QgdGhlIHNhbWUgbGluaywgdGhvdWdoIG9ubHkgZG8gdGhpcyBvbmNlIHBlciB1bmxpbmsgKGFuZCBub3Qgb24gaW5pdCkuXG5cdHRtcCA9IG1zZy4kLl98fCcnO1xuXHRpZihsaW5rID09PSB0bXAubGluayB8fCAoY2F0LmhhcyAmJiAhdG1wLmxpbmspKXtcblx0XHRpZigocm9vdC5wYXNzfHwnJylbY2F0LmlkXSAmJiAnc3RyaW5nJyAhPT0gdHlwZW9mIGxpbmspe1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblx0ZGVsZXRlICh0bXAuZWNob3x8JycpW2NhdC5pZF07XG5cdHVubGluayh7Z2V0OiBjYXQuZ2V0LCBwdXQ6IHUsICQ6IG1zZy4kLCBsaW5rZWQ6IG1zZy5saW5rZWQgPSBtc2cubGlua2VkIHx8IHRtcC5saW5rfSwgY2F0KTsgLy8gdW5saW5rIG91ciBzdWIgY2hhaW5zLlxufTsgR3VuLm9uLnVubGluayA9IHVubGluaztcblxuZnVuY3Rpb24gYWNrKG1zZywgZXYpe1xuXHQvL2lmKCFtc2dbJyUnXSAmJiAodGhpc3x8JycpLm9mZil7IHRoaXMub2ZmKCkgfSAvLyBkbyBOT1QgbWVtb3J5IGxlYWssIHR1cm4gb2ZmIGxpc3RlbmVycyEgTm93IGhhbmRsZWQgYnkgLmFzayBpdHNlbGZcblx0Ly8gbWFuaGF0dGFuOlxuXHR2YXIgYXMgPSB0aGlzLmFzLCBhdCA9IGFzLiQuXywgcm9vdCA9IGF0LnJvb3QsIGdldCA9IGFzLmdldHx8JycsIHRtcCA9IChtc2cucHV0fHwnJylbZ2V0WycjJ11dfHwnJztcblx0aWYoIW1zZy5wdXQgfHwgKCdzdHJpbmcnID09IHR5cGVvZiBnZXRbJy4nXSAmJiB1ID09PSB0bXBbZ2V0WycuJ11dKSl7XG5cdFx0aWYodSAhPT0gYXQucHV0KXsgcmV0dXJuIH1cblx0XHRpZighYXQuc291bCAmJiAhYXQuaGFzKXsgcmV0dXJuIH0gLy8gVE9ETzogQlVHPyBGb3Igbm93LCBvbmx5IGNvcmUtY2hhaW5zIHdpbGwgaGFuZGxlIG5vdC1mb3VuZHMsIGJlY2F1c2UgYnVncyBjcmVlcCBpbiBpZiBub24tY29yZSBjaGFpbnMgYXJlIHVzZWQgYXMgJCBidXQgd2UgY2FuIHJldmlzaXQgdGhpcyBsYXRlciBmb3IgbW9yZSBwb3dlcmZ1bCBleHRlbnNpb25zLlxuXHRcdGF0LmFjayA9IChhdC5hY2sgfHwgMCkgKyAxO1xuXHRcdGF0Lm9uKCdpbicsIHtcblx0XHRcdGdldDogYXQuZ2V0LFxuXHRcdFx0cHV0OiBhdC5wdXQgPSB1LFxuXHRcdFx0JDogYXQuJCxcblx0XHRcdCdAJzogbXNnWydAJ11cblx0XHR9KTtcblx0XHQvKih0bXAgPSBhdC5RKSAmJiBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXModG1wKSwgZnVuY3Rpb24oaWQpeyAvLyBUT0RPOiBUZW1wb3JhcnkgdGVzdGluZywgbm90IGludGVncmF0ZWQgb3IgYmVpbmcgdXNlZCwgcHJvYmFibHkgZGVsZXRlLlxuXHRcdFx0T2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSwgdG1wID0ge30pOyB0bXBbJ0AnXSA9IGlkOyAvLyBjb3B5IG1lc3NhZ2Vcblx0XHRcdHJvb3Qub24oJ2luJywgdG1wKTtcblx0XHR9KTsgZGVsZXRlIGF0LlE7Ki9cblx0XHRyZXR1cm47XG5cdH1cblx0KG1zZy5ffHx7fSkubWlzcyA9IDE7XG5cdEd1bi5vbi5wdXQobXNnKTtcblx0cmV0dXJuOyAvLyBlb21cbn1cblxudmFyIGVtcHR5ID0ge30sIHUsIHRleHRfcmFuZCA9IFN0cmluZy5yYW5kb20sIHZhbGlkID0gR3VuLnZhbGlkLCBvYmpfaGFzID0gZnVuY3Rpb24obywgayl7IHJldHVybiBvICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSB9LCBzdGF0ZSA9IEd1bi5zdGF0ZSwgc3RhdGVfaXMgPSBzdGF0ZS5pcywgc3RhdGVfaWZ5ID0gc3RhdGUuaWZ5O1xuXHQiLCJcbnJlcXVpcmUoJy4vc2hpbScpO1xuZnVuY3Rpb24gRHVwKG9wdCl7XG5cdHZhciBkdXAgPSB7czp7fX0sIHMgPSBkdXAucztcblx0b3B0ID0gb3B0IHx8IHttYXg6IDk5OSwgYWdlOiAxMDAwICogOX07Ly8qLyAxMDAwICogOSAqIDN9O1xuXHRkdXAuY2hlY2sgPSBmdW5jdGlvbihpZCl7XG5cdFx0aWYoIXNbaWRdKXsgcmV0dXJuIGZhbHNlIH1cblx0XHRyZXR1cm4gZHQoaWQpO1xuXHR9XG5cdHZhciBkdCA9IGR1cC50cmFjayA9IGZ1bmN0aW9uKGlkKXtcblx0XHR2YXIgaXQgPSBzW2lkXSB8fCAoc1tpZF0gPSB7fSk7XG5cdFx0aXQud2FzID0gZHVwLm5vdyA9ICtuZXcgRGF0ZTtcblx0XHRpZighZHVwLnRvKXsgZHVwLnRvID0gc2V0VGltZW91dChkdXAuZHJvcCwgb3B0LmFnZSArIDkpIH1cblx0XHRyZXR1cm4gaXQ7XG5cdH1cblx0ZHVwLmRyb3AgPSBmdW5jdGlvbihhZ2Upe1xuXHRcdGR1cC50byA9IG51bGw7XG5cdFx0ZHVwLm5vdyA9ICtuZXcgRGF0ZTtcblx0XHR2YXIgbCA9IE9iamVjdC5rZXlzKHMpO1xuXHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoZHVwLm5vdywgK25ldyBEYXRlIC0gZHVwLm5vdywgJ2R1cCBkcm9wIGtleXMnKTsgLy8gcHJldiB+MjAlIENQVSA3JSBSQU0gMzAwTUIgLy8gbm93IH4yNSUgQ1BVIDclIFJBTSA1MDBNQlxuXHRcdHNldFRpbWVvdXQuZWFjaChsLCBmdW5jdGlvbihpZCl7IHZhciBpdCA9IHNbaWRdOyAvLyBUT0RPOiAua2V5cyggaXMgc2xvdz9cblx0XHRcdGlmKGl0ICYmIChhZ2UgfHwgb3B0LmFnZSkgPiAoZHVwLm5vdyAtIGl0LndhcykpeyByZXR1cm4gfVxuXHRcdFx0ZGVsZXRlIHNbaWRdO1xuXHRcdH0sMCw5OSk7XG5cdH1cblx0cmV0dXJuIGR1cDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRHVwO1xuXHQiLCJcbnZhciBHdW4gPSByZXF1aXJlKCcuL3Jvb3QnKTtcbkd1bi5jaGFpbi5nZXQgPSBmdW5jdGlvbihrZXksIGNiLCBhcyl7XG5cdHZhciBndW4sIHRtcDtcblx0aWYodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpe1xuXHRcdGlmKGtleS5sZW5ndGggPT0gMCkge1x0XG5cdFx0XHQoZ3VuID0gdGhpcy5jaGFpbigpKS5fLmVyciA9IHtlcnI6IEd1bi5sb2coJzAgbGVuZ3RoIGtleSEnLCBrZXkpfTtcblx0XHRcdGlmKGNiKXsgY2IuY2FsbChndW4sIGd1bi5fLmVycikgfVxuXHRcdFx0cmV0dXJuIGd1bjtcblx0XHR9XG5cdFx0dmFyIGJhY2sgPSB0aGlzLCBjYXQgPSBiYWNrLl87XG5cdFx0dmFyIG5leHQgPSBjYXQubmV4dCB8fCBlbXB0eTtcblx0XHRpZighKGd1biA9IG5leHRba2V5XSkpe1xuXHRcdFx0Z3VuID0ga2V5ICYmIGNhY2hlKGtleSwgYmFjayk7XG5cdFx0fVxuXHRcdGd1biA9IGd1biAmJiBndW4uJDtcblx0fSBlbHNlXG5cdGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIGtleSl7XG5cdFx0aWYodHJ1ZSA9PT0gY2IpeyByZXR1cm4gc291bCh0aGlzLCBrZXksIGNiLCBhcyksIHRoaXMgfVxuXHRcdGd1biA9IHRoaXM7XG5cdFx0dmFyIGNhdCA9IGd1bi5fLCBvcHQgPSBjYiB8fCB7fSwgcm9vdCA9IGNhdC5yb290LCBpZDtcblx0XHRvcHQuYXQgPSBjYXQ7XG5cdFx0b3B0Lm9rID0ga2V5O1xuXHRcdHZhciB3YWl0ID0ge307IC8vIGNhbiB3ZSBhc3NpZ24gdGhpcyB0byB0aGUgYXQgaW5zdGVhZCwgbGlrZSBpbiBvbmNlP1xuXHRcdC8vdmFyIHBhdGggPSBbXTsgY2F0LiQuYmFjayhhdCA9PiB7IGF0LmdldCAmJiBwYXRoLnB1c2goYXQuZ2V0LnNsaWNlKDAsOSkpfSk7IHBhdGggPSBwYXRoLnJldmVyc2UoKS5qb2luKCcuJyk7XG5cdFx0ZnVuY3Rpb24gYW55KG1zZywgZXZlLCBmKXtcblx0XHRcdGlmKGFueS5zdHVuKXsgcmV0dXJuIH1cblx0XHRcdGlmKCh0bXAgPSByb290LnBhc3MpICYmICF0bXBbaWRdKXsgcmV0dXJuIH1cblx0XHRcdHZhciBhdCA9IG1zZy4kLl8sIHNhdCA9IChtc2cuJCR8fCcnKS5fLCBkYXRhID0gKHNhdHx8YXQpLnB1dCwgb2RkID0gKCFhdC5oYXMgJiYgIWF0LnNvdWwpLCB0ZXN0ID0ge30sIGxpbmssIHRtcDtcblx0XHRcdGlmKG9kZCB8fCB1ID09PSBkYXRhKXsgLy8gaGFuZGxlcyBub24tY29yZVxuXHRcdFx0XHRkYXRhID0gKHUgPT09ICgodG1wID0gbXNnLnB1dCl8fCcnKVsnPSddKT8gKHUgPT09ICh0bXB8fCcnKVsnOiddKT8gdG1wIDogdG1wWyc6J10gOiB0bXBbJz0nXTtcblx0XHRcdH1cblx0XHRcdGlmKGxpbmsgPSAoJ3N0cmluZycgPT0gdHlwZW9mICh0bXAgPSBHdW4udmFsaWQoZGF0YSkpKSl7XG5cdFx0XHRcdGRhdGEgPSAodSA9PT0gKHRtcCA9IHJvb3QuJC5nZXQodG1wKS5fLnB1dCkpPyBvcHQubm90PyB1IDogZGF0YSA6IHRtcDtcblx0XHRcdH1cblx0XHRcdGlmKG9wdC5ub3QgJiYgdSA9PT0gZGF0YSl7IHJldHVybiB9XG5cdFx0XHRpZih1ID09PSBvcHQuc3R1bil7XG5cdFx0XHRcdGlmKCh0bXAgPSByb290LnN0dW4pICYmIHRtcC5vbil7XG5cdFx0XHRcdFx0Y2F0LiQuYmFjayhmdW5jdGlvbihhKXsgLy8gb3VyIGNoYWluIHN0dW5uZWQ/XG5cdFx0XHRcdFx0XHR0bXAub24oJycrYS5pZCwgdGVzdCA9IHt9KTtcblx0XHRcdFx0XHRcdGlmKCh0ZXN0LnJ1biB8fCAwKSA8IGFueS5pZCl7IHJldHVybiB0ZXN0IH0gLy8gaWYgdGhlcmUgaXMgYW4gZWFybGllciBzdHVuIG9uIGdhcGxlc3MgcGFyZW50cy9zZWxmLlxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCF0ZXN0LnJ1biAmJiB0bXAub24oJycrYXQuaWQsIHRlc3QgPSB7fSk7IC8vIHRoaXMgbm9kZSBzdHVubmVkP1xuXHRcdFx0XHRcdCF0ZXN0LnJ1biAmJiBzYXQgJiYgdG1wLm9uKCcnK3NhdC5pZCwgdGVzdCA9IHt9KTsgLy8gbGlua2VkIG5vZGUgc3R1bm5lZD9cblx0XHRcdFx0XHRpZihhbnkuaWQgPiB0ZXN0LnJ1bil7XG5cdFx0XHRcdFx0XHRpZighdGVzdC5zdHVuIHx8IHRlc3Quc3R1bi5lbmQpe1xuXHRcdFx0XHRcdFx0XHR0ZXN0LnN0dW4gPSB0bXAub24oJ3N0dW4nKTtcblx0XHRcdFx0XHRcdFx0dGVzdC5zdHVuID0gdGVzdC5zdHVuICYmIHRlc3Quc3R1bi5sYXN0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYodGVzdC5zdHVuICYmICF0ZXN0LnN0dW4uZW5kKXtcblx0XHRcdFx0XHRcdFx0Ly9pZihvZGQgJiYgdSA9PT0gZGF0YSl7IHJldHVybiB9XG5cdFx0XHRcdFx0XHRcdC8vaWYodSA9PT0gbXNnLnB1dCl7IHJldHVybiB9IC8vIFwibm90IGZvdW5kXCIgYWNrcyB3aWxsIGJlIGZvdW5kIGlmIHRoZXJlIGlzIHN0dW4sIHNvIGlnbm9yZSB0aGVzZS5cblx0XHRcdFx0XHRcdFx0KHRlc3Quc3R1bi5hZGQgfHwgKHRlc3Quc3R1bi5hZGQgPSB7fSkpW2lkXSA9IGZ1bmN0aW9uKCl7IGFueShtc2csZXZlLDEpIH0gLy8gYWRkIG91cnNlbGYgdG8gdGhlIHN0dW4gY2FsbGJhY2sgbGlzdCB0aGF0IGlzIGNhbGxlZCBhdCBlbmQgb2YgdGhlIHdyaXRlLlxuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKC8qb2RkICYmKi8gdSA9PT0gZGF0YSl7IGYgPSAwIH0gLy8gaWYgZGF0YSBub3QgZm91bmQsIGtlZXAgd2FpdGluZy90cnlpbmcuXG5cdFx0XHRcdC8qaWYoZiAmJiB1ID09PSBkYXRhKXtcblx0XHRcdFx0XHRjYXQub24oJ291dCcsIG9wdC5vdXQpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fSovXG5cdFx0XHRcdGlmKCh0bXAgPSByb290LmhhdGNoKSAmJiAhdG1wLmVuZCAmJiB1ID09PSBvcHQuaGF0Y2ggJiYgIWYpeyAvLyBxdWljayBoYWNrISAvLyBXaGF0J3MgZ29pbmcgb24gaGVyZT8gQmVjYXVzZSBkYXRhIGlzIHN0cmVhbWVkLCB3ZSBnZXQgdGhpbmdzIG9uZSBieSBvbmUsIGJ1dCBhIGxvdCBvZiBkZXZlbG9wZXJzIHdvdWxkIHJhdGhlciBnZXQgYSBjYWxsYmFjayBhZnRlciBlYWNoIGJhdGNoIGluc3RlYWQsIHNvIHRoaXMgZG9lcyB0aGF0IGJ5IGNyZWF0aW5nIGEgd2FpdCBsaXN0IHBlciBjaGFpbiBpZCB0aGF0IGlzIHRoZW4gY2FsbGVkIGF0IHRoZSBlbmQgb2YgdGhlIGJhdGNoIGJ5IHRoZSBoYXRjaCBjb2RlIGluIHRoZSByb290IHB1dCBsaXN0ZW5lci5cblx0XHRcdFx0XHRpZih3YWl0W2F0LiQuXy5pZF0peyByZXR1cm4gfSB3YWl0W2F0LiQuXy5pZF0gPSAxO1xuXHRcdFx0XHRcdHRtcC5wdXNoKGZ1bmN0aW9uKCl7YW55KG1zZyxldmUsMSl9KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH07IHdhaXQgPSB7fTsgLy8gZW5kIHF1aWNrIGhhY2suXG5cdFx0XHR9XG5cdFx0XHQvLyBjYWxsOlxuXHRcdFx0aWYocm9vdC5wYXNzKXsgaWYocm9vdC5wYXNzW2lkK2F0LmlkXSl7IHJldHVybiB9IHJvb3QucGFzc1tpZCthdC5pZF0gPSAxIH1cblx0XHRcdGlmKG9wdC5vbil7IG9wdC5vay5jYWxsKGF0LiQsIGRhdGEsIGF0LmdldCwgbXNnLCBldmUgfHwgYW55KTsgcmV0dXJuIH0gLy8gVE9ETzogQWxzbyBjb25zaWRlciBicmVha2luZyBgdGhpc2Agc2luY2UgYSBsb3Qgb2YgcGVvcGxlIGRvIGA9PmAgdGhlc2UgZGF5cyBhbmQgYC5jYWxsKGAgaGFzIHNsb3dlciBwZXJmb3JtYW5jZS5cblx0XHRcdGlmKG9wdC52MjAyMCl7IG9wdC5vayhtc2csIGV2ZSB8fCBhbnkpOyByZXR1cm4gfVxuXHRcdFx0T2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSwgdG1wID0ge30pOyBtc2cgPSB0bXA7IG1zZy5wdXQgPSBkYXRhOyAvLyAyMDE5IENPTVBBVElCSUxJVFkhIFRPRE86IEdFVCBSSUQgT0YgVEhJUyFcblx0XHRcdG9wdC5vay5jYWxsKG9wdC5hcywgbXNnLCBldmUgfHwgYW55KTsgLy8gaXMgdGhpcyB0aGUgcmlnaHRcblx0XHR9O1xuXHRcdGFueS5hdCA9IGNhdDtcblx0XHQvLyhjYXQuYW55fHwoY2F0LmFueT1mdW5jdGlvbihtc2cpeyBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMoY2F0LmFueXx8JycpLCBmdW5jdGlvbihhY3QpeyAoYWN0ID0gY2F0LmFueVthY3RdKSAmJiBhY3QobXNnKSB9LDAsOTkpIH0pKVtpZCA9IFN0cmluZy5yYW5kb20oNyldID0gYW55OyAvLyBtYXliZSBzd2l0Y2ggdG8gdGhpcyBpbiBmdXR1cmU/XG5cdFx0KGNhdC5hbnl8fChjYXQuYW55PXt9KSlbaWQgPSBTdHJpbmcucmFuZG9tKDcpXSA9IGFueTtcblx0XHRhbnkub2ZmID0gZnVuY3Rpb24oKXsgYW55LnN0dW4gPSAxOyBpZighY2F0LmFueSl7IHJldHVybiB9IGRlbGV0ZSBjYXQuYW55W2lkXSB9XG5cdFx0YW55LnJpZCA9IHJpZDsgLy8gbG9naWMgZnJvbSBvbGQgdmVyc2lvbiwgY2FuIHdlIGNsZWFuIGl0IHVwIG5vdz9cblx0XHRhbnkuaWQgPSBvcHQucnVuIHx8ICsrcm9vdC5vbmNlOyAvLyB1c2VkIGluIGNhbGxiYWNrIHRvIGNoZWNrIGlmIHdlIGFyZSBlYXJsaWVyIHRoYW4gYSB3cml0ZS4gLy8gd2lsbCB0aGlzIGV2ZXIgY2F1c2UgYW4gaW50ZWdlciBvdmVyZmxvdz9cblx0XHR0bXAgPSByb290LnBhc3M7IChyb290LnBhc3MgPSB7fSlbaWRdID0gMTsgLy8gRXhwbGFuYXRpb246IHRlc3QgdHJhZGUtb2ZmcyB3YW50IHRvIHByZXZlbnQgcmVjdXJzaW9uIHNvIHdlIGFkZC9yZW1vdmUgcGFzcyBmbGFnIGFzIGl0IGdldHMgZnVsZmlsbGVkIHRvIG5vdCByZXBlYXQsIGhvd2V2ZXIgbWFwIG1hcCBuZWVkcyBtYW55IHBhc3MgZmxhZ3MgLSBob3cgZG8gd2UgcmVjb25jaWxlP1xuXHRcdG9wdC5vdXQgPSBvcHQub3V0IHx8IHtnZXQ6IHt9fTtcblx0XHRjYXQub24oJ291dCcsIG9wdC5vdXQpO1xuXHRcdHJvb3QucGFzcyA9IHRtcDtcblx0XHRyZXR1cm4gZ3VuO1xuXHR9IGVsc2Vcblx0aWYoJ251bWJlcicgPT0gdHlwZW9mIGtleSl7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCcnK2tleSwgY2IsIGFzKTtcblx0fSBlbHNlXG5cdGlmKCdzdHJpbmcnID09IHR5cGVvZiAodG1wID0gdmFsaWQoa2V5KSkpe1xuXHRcdHJldHVybiB0aGlzLmdldCh0bXAsIGNiLCBhcyk7XG5cdH0gZWxzZVxuXHRpZih0bXAgPSB0aGlzLmdldC5uZXh0KXtcblx0XHRndW4gPSB0bXAodGhpcywga2V5KTtcblx0fVxuXHRpZighZ3VuKXtcblx0XHQoZ3VuID0gdGhpcy5jaGFpbigpKS5fLmVyciA9IHtlcnI6IEd1bi5sb2coJ0ludmFsaWQgZ2V0IHJlcXVlc3QhJywga2V5KX07IC8vIENMRUFOIFVQXG5cdFx0aWYoY2IpeyBjYi5jYWxsKGd1biwgZ3VuLl8uZXJyKSB9XG5cdFx0cmV0dXJuIGd1bjtcblx0fVxuXHRpZihjYiAmJiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYil7XG5cdFx0Z3VuLmdldChjYiwgYXMpO1xuXHR9XG5cdHJldHVybiBndW47XG59XG5mdW5jdGlvbiBjYWNoZShrZXksIGJhY2spe1xuXHR2YXIgY2F0ID0gYmFjay5fLCBuZXh0ID0gY2F0Lm5leHQsIGd1biA9IGJhY2suY2hhaW4oKSwgYXQgPSBndW4uXztcblx0aWYoIW5leHQpeyBuZXh0ID0gY2F0Lm5leHQgPSB7fSB9XG5cdG5leHRbYXQuZ2V0ID0ga2V5XSA9IGF0O1xuXHRpZihiYWNrID09PSBjYXQucm9vdC4kKXtcblx0XHRhdC5zb3VsID0ga2V5O1xuXHR9IGVsc2Vcblx0aWYoY2F0LnNvdWwgfHwgY2F0Lmhhcyl7XG5cdFx0YXQuaGFzID0ga2V5O1xuXHRcdC8vaWYob2JqX2hhcyhjYXQucHV0LCBrZXkpKXtcblx0XHRcdC8vYXQucHV0ID0gY2F0LnB1dFtrZXldO1xuXHRcdC8vfVxuXHR9XG5cdHJldHVybiBhdDtcbn1cbmZ1bmN0aW9uIHNvdWwoZ3VuLCBjYiwgb3B0LCBhcyl7XG5cdHZhciBjYXQgPSBndW4uXywgYWNrcyA9IDAsIHRtcDtcblx0aWYodG1wID0gY2F0LnNvdWwgfHwgY2F0LmxpbmspeyByZXR1cm4gY2IodG1wLCBhcywgY2F0KSB9XG5cdGlmKGNhdC5qYW0peyByZXR1cm4gY2F0LmphbS5wdXNoKFtjYiwgYXNdKSB9XG5cdGNhdC5qYW0gPSBbW2NiLGFzXV07XG5cdGd1bi5nZXQoZnVuY3Rpb24gZ28obXNnLCBldmUpe1xuXHRcdGlmKHUgPT09IG1zZy5wdXQgJiYgIWNhdC5yb290Lm9wdC5zdXBlciAmJiAodG1wID0gT2JqZWN0LmtleXMoY2F0LnJvb3Qub3B0LnBlZXJzKS5sZW5ndGgpICYmICsrYWNrcyA8PSB0bXApeyAvLyBUT0RPOiBzdXBlciBzaG91bGQgbm90IGJlIGluIGNvcmUgY29kZSwgYnJpbmcgQVhFIHVwIGludG8gY29yZSBpbnN0ZWFkIHRvIGZpeD8gLy8gVE9ETzogLmtleXMoIGlzIHNsb3dcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZXZlLnJpZChtc2cpO1xuXHRcdHZhciBhdCA9ICgoYXQgPSBtc2cuJCkgJiYgYXQuXykgfHwge30sIGkgPSAwLCBhcztcblx0XHR0bXAgPSBjYXQuamFtOyBkZWxldGUgY2F0LmphbTsgLy8gdG1wID0gY2F0LmphbS5zcGxpY2UoMCwgMTAwKTtcblx0XHQvL2lmKHRtcC5sZW5ndGgpeyBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCl7IGdvKG1zZywgZXZlKSB9KSB9XG5cdFx0d2hpbGUoYXMgPSB0bXBbaSsrXSl7IC8vR3VuLm9iai5tYXAodG1wLCBmdW5jdGlvbihhcywgY2Ipe1xuXHRcdFx0dmFyIGNiID0gYXNbMF0sIGlkOyBhcyA9IGFzWzFdO1xuXHRcdFx0Y2IgJiYgY2IoaWQgPSBhdC5saW5rIHx8IGF0LnNvdWwgfHwgR3VuLnZhbGlkKG1zZy5wdXQpIHx8ICgobXNnLnB1dHx8e30pLl98fHt9KVsnIyddLCBhcywgbXNnLCBldmUpO1xuXHRcdH0gLy8pO1xuXHR9LCB7b3V0OiB7Z2V0OiB7Jy4nOnRydWV9fX0pO1xuXHRyZXR1cm4gZ3VuO1xufVxuZnVuY3Rpb24gcmlkKGF0KXtcblx0dmFyIGNhdCA9IHRoaXMuYXQgfHwgdGhpcy5vbjtcblx0aWYoIWF0IHx8IGNhdC5zb3VsIHx8IGNhdC5oYXMpeyByZXR1cm4gdGhpcy5vZmYoKSB9XG5cdGlmKCEoYXQgPSAoYXQgPSAoYXQgPSBhdC4kIHx8IGF0KS5fIHx8IGF0KS5pZCkpeyByZXR1cm4gfVxuXHR2YXIgbWFwID0gY2F0Lm1hcCwgdG1wLCBzZWVuO1xuXHQvL2lmKCFtYXAgfHwgISh0bXAgPSBtYXBbYXRdKSB8fCAhKHRtcCA9IHRtcC5hdCkpeyByZXR1cm4gfVxuXHRpZih0bXAgPSAoc2VlbiA9IHRoaXMuc2VlbiB8fCAodGhpcy5zZWVuID0ge30pKVthdF0peyByZXR1cm4gdHJ1ZSB9XG5cdHNlZW5bYXRdID0gdHJ1ZTtcblx0cmV0dXJuO1xuXHQvL3RtcC5lY2hvW2NhdC5pZF0gPSB7fTsgLy8gVE9ETzogV2FybmluZzogVGhpcyB1bnN1YnNjcmliZXMgQUxMIG9mIHRoaXMgY2hhaW4ncyBsaXN0ZW5lcnMgZnJvbSB0aGlzIGxpbmssIG5vdCBqdXN0IHRoZSBvbmUgY2FsbGJhY2sgZXZlbnQuXG5cdC8vb2JqLmRlbChtYXAsIGF0KTsgLy8gVE9ETzogV2FybmluZzogVGhpcyB1bnN1YnNjcmliZXMgQUxMIG9mIHRoaXMgY2hhaW4ncyBsaXN0ZW5lcnMgZnJvbSB0aGlzIGxpbmssIG5vdCBqdXN0IHRoZSBvbmUgY2FsbGJhY2sgZXZlbnQuXG5cdHJldHVybjtcbn1cbnZhciBlbXB0eSA9IHt9LCB2YWxpZCA9IEd1bi52YWxpZCwgdTtcblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9yb290Jyk7XG5yZXF1aXJlKCcuL2NoYWluJyk7XG5yZXF1aXJlKCcuL2JhY2snKTtcbnJlcXVpcmUoJy4vcHV0Jyk7XG5yZXF1aXJlKCcuL2dldCcpO1xubW9kdWxlLmV4cG9ydHMgPSBHdW47XG5cdCIsIlxuaWYodHlwZW9mIEd1biA9PT0gJ3VuZGVmaW5lZCcpeyByZXR1cm4gfVxuXG52YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fSwgc3RvcmUsIHU7XG50cnl7c3RvcmUgPSAoR3VuLndpbmRvd3x8bm9vcCkubG9jYWxTdG9yYWdlfWNhdGNoKGUpe31cbmlmKCFzdG9yZSl7XG5cdEd1bi5sb2coXCJXYXJuaW5nOiBObyBsb2NhbFN0b3JhZ2UgZXhpc3RzIHRvIHBlcnNpc3QgZGF0YSB0byFcIik7XG5cdHN0b3JlID0ge3NldEl0ZW06IGZ1bmN0aW9uKGssdil7dGhpc1trXT12fSwgcmVtb3ZlSXRlbTogZnVuY3Rpb24oayl7ZGVsZXRlIHRoaXNba119LCBnZXRJdGVtOiBmdW5jdGlvbihrKXtyZXR1cm4gdGhpc1trXX19O1xufVxuXG52YXIgcGFyc2UgPSBKU09OLnBhcnNlQXN5bmMgfHwgZnVuY3Rpb24odCxjYixyKXsgdmFyIHU7IHRyeXsgY2IodSwgSlNPTi5wYXJzZSh0LHIpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxudmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeUFzeW5jIHx8IGZ1bmN0aW9uKHYsY2IscixzKXsgdmFyIHU7IHRyeXsgY2IodSwgSlNPTi5zdHJpbmdpZnkodixyLHMpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxuXG5HdW4ub24oJ2NyZWF0ZScsIGZ1bmN0aW9uIGxnKHJvb3Qpe1xuXHR0aGlzLnRvLm5leHQocm9vdCk7XG5cdHZhciBvcHQgPSByb290Lm9wdCwgZ3JhcGggPSByb290LmdyYXBoLCBhY2tzID0gW10sIGRpc2ssIHRvLCBzaXplLCBzdG9wO1xuXHRpZihmYWxzZSA9PT0gb3B0LmxvY2FsU3RvcmFnZSl7IHJldHVybiB9XG5cdG9wdC5wcmVmaXggPSBvcHQuZmlsZSB8fCAnZ3VuLyc7XG5cdHRyeXsgZGlzayA9IGxnW29wdC5wcmVmaXhdID0gbGdbb3B0LnByZWZpeF0gfHwgSlNPTi5wYXJzZShzaXplID0gc3RvcmUuZ2V0SXRlbShvcHQucHJlZml4KSkgfHwge307IC8vIFRPRE86IFBlcmYhIFRoaXMgd2lsbCBibG9jaywgc2hvdWxkIHdlIGNhcmUsIHNpbmNlIGxpbWl0ZWQgdG8gNU1CIGFueXdheXM/XG5cdH1jYXRjaChlKXsgZGlzayA9IGxnW29wdC5wcmVmaXhdID0ge307IH1cblx0c2l6ZSA9IChzaXplfHwnJykubGVuZ3RoO1xuXG5cdHJvb3Qub24oJ2dldCcsIGZ1bmN0aW9uKG1zZyl7XG5cdFx0dGhpcy50by5uZXh0KG1zZyk7XG5cdFx0dmFyIGxleCA9IG1zZy5nZXQsIHNvdWwsIGRhdGEsIHRtcCwgdTtcblx0XHRpZighbGV4IHx8ICEoc291bCA9IGxleFsnIyddKSl7IHJldHVybiB9XG5cdFx0ZGF0YSA9IGRpc2tbc291bF0gfHwgdTtcblx0XHRpZihkYXRhICYmICh0bXAgPSBsZXhbJy4nXSkgJiYgIU9iamVjdC5wbGFpbih0bXApKXsgLy8gcGx1Y2shXG5cdFx0XHRkYXRhID0gR3VuLnN0YXRlLmlmeSh7fSwgdG1wLCBHdW4uc3RhdGUuaXMoZGF0YSwgdG1wKSwgZGF0YVt0bXBdLCBzb3VsKTtcblx0XHR9XG5cdFx0Ly9pZihkYXRhKXsgKHRtcCA9IHt9KVtzb3VsXSA9IGRhdGEgfSAvLyBiYWNrIGludG8gYSBncmFwaC5cblx0XHQvL3NldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRHdW4ub24uZ2V0LmFjayhtc2csIGRhdGEpOyAvL3Jvb3Qub24oJ2luJywgeydAJzogbXNnWycjJ10sIHB1dDogdG1wLCBsUzoxfSk7Ly8gfHwgcm9vdC4kfSk7XG5cdFx0Ly99LCBNYXRoLnJhbmRvbSgpICogMTApOyAvLyBGT1IgVEVTVElORyBQVVJQT1NFUyFcblx0fSk7XG5cblx0cm9vdC5vbigncHV0JywgZnVuY3Rpb24obXNnKXtcblx0XHR0aGlzLnRvLm5leHQobXNnKTsgLy8gcmVtZW1iZXIgdG8gY2FsbCBuZXh0IG1pZGRsZXdhcmUgYWRhcHRlclxuXHRcdHZhciBwdXQgPSBtc2cucHV0LCBzb3VsID0gcHV0WycjJ10sIGtleSA9IHB1dFsnLiddLCBpZCA9IG1zZ1snIyddLCBvayA9IG1zZy5va3x8JycsIHRtcDsgLy8gcHVsbCBkYXRhIG9mZiB3aXJlIGVudmVsb3BlXG5cdFx0ZGlza1tzb3VsXSA9IEd1bi5zdGF0ZS5pZnkoZGlza1tzb3VsXSwga2V5LCBwdXRbJz4nXSwgcHV0Wyc6J10sIHNvdWwpOyAvLyBtZXJnZSBpbnRvIGRpc2sgb2JqZWN0XG5cdFx0aWYoc3RvcCAmJiBzaXplID4gKDQ5OTk4ODApKXsgcm9vdC5vbignaW4nLCB7J0AnOiBpZCwgZXJyOiBcImxvY2FsU3RvcmFnZSBtYXghXCJ9KTsgcmV0dXJuOyB9XG5cdFx0Ly9pZighbXNnWydAJ10peyBhY2tzLnB1c2goaWQpIH0gLy8gdGhlbiBhY2sgYW55IG5vbi1hY2sgd3JpdGUuIC8vIFRPRE86IHVzZSBiYXRjaCBpZC5cblx0XHRpZighbXNnWydAJ10gJiYgKCFtc2cuXy52aWEgfHwgTWF0aC5yYW5kb20oKSA8IChva1snQCddIC8gb2tbJy8nXSkpKXsgYWNrcy5wdXNoKGlkKSB9IC8vIHRoZW4gYWNrIGFueSBub24tYWNrIHdyaXRlLiAvLyBUT0RPOiB1c2UgYmF0Y2ggaWQuXG5cdFx0aWYodG8peyByZXR1cm4gfVxuXHRcdHRvID0gc2V0VGltZW91dChmbHVzaCwgOSsoc2l6ZSAvIDMzMykpOyAvLyAwLjFNQiA9IDAuM3MsIDVNQiA9IDE1cyBcblx0fSk7XG5cdGZ1bmN0aW9uIGZsdXNoKCl7XG5cdFx0aWYoIWFja3MubGVuZ3RoICYmICgoc2V0VGltZW91dC50dXJufHwnJykuc3x8JycpLmxlbmd0aCl7IHNldFRpbWVvdXQoZmx1c2gsOTkpOyByZXR1cm47IH0gLy8gZGVmZXIgaWYgXCJidXN5XCIgJiYgbm8gc2F2ZXMuXG5cdFx0dmFyIGVyciwgYWNrID0gYWNrczsgY2xlYXJUaW1lb3V0KHRvKTsgdG8gPSBmYWxzZTsgYWNrcyA9IFtdO1xuXHRcdGpzb24oZGlzaywgZnVuY3Rpb24oZXJyLCB0bXApe1xuXHRcdFx0dHJ5eyFlcnIgJiYgc3RvcmUuc2V0SXRlbShvcHQucHJlZml4LCB0bXApO1xuXHRcdFx0fWNhdGNoKGUpeyBlcnIgPSBzdG9wID0gZSB8fCBcImxvY2FsU3RvcmFnZSBmYWlsdXJlXCIgfVxuXHRcdFx0aWYoZXJyKXtcblx0XHRcdFx0R3VuLmxvZyhlcnIgKyBcIiBDb25zaWRlciB1c2luZyBHVU4ncyBJbmRleGVkREIgcGx1Z2luIGZvciBSQUQgZm9yIG1vcmUgc3RvcmFnZSBzcGFjZSwgaHR0cHM6Ly9ndW4uZWNvL2RvY3MvUkFEI2luc3RhbGxcIik7XG5cdFx0XHRcdHJvb3Qub24oJ2xvY2FsU3RvcmFnZTplcnJvcicsIHtlcnI6IGVyciwgZ2V0OiBvcHQucHJlZml4LCBwdXQ6IGRpc2t9KTtcblx0XHRcdH1cblx0XHRcdHNpemUgPSB0bXAubGVuZ3RoO1xuXG5cdFx0XHQvL2lmKCFlcnIgJiYgIU9iamVjdC5lbXB0eShvcHQucGVlcnMpKXsgcmV0dXJuIH0gLy8gb25seSBhY2sgaWYgdGhlcmUgYXJlIG5vIHBlZXJzLiAvLyBTd2l0Y2ggdGhpcyB0byBwcm9iYWJpbGlzdGljIG1vZGVcblx0XHRcdHNldFRpbWVvdXQuZWFjaChhY2ssIGZ1bmN0aW9uKGlkKXtcblx0XHRcdFx0cm9vdC5vbignaW4nLCB7J0AnOiBpZCwgZXJyOiBlcnIsIG9rOiAwfSk7IC8vIGxvY2FsU3RvcmFnZSBpc24ndCByZWxpYWJsZSwgc28gbWFrZSBpdHMgYG9rYCBjb2RlIGJlIGEgbG93IG51bWJlci5cblx0XHRcdH0sMCw5OSk7XG5cdFx0fSlcblx0fVxuXG59KTtcblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9pbmRleCcpLCBuZXh0ID0gR3VuLmNoYWluLmdldC5uZXh0O1xuR3VuLmNoYWluLmdldC5uZXh0ID0gZnVuY3Rpb24oZ3VuLCBsZXgpeyB2YXIgdG1wO1xuXHRpZighT2JqZWN0LnBsYWluKGxleCkpeyByZXR1cm4gKG5leHR8fG5vb3ApKGd1biwgbGV4KSB9XG5cdGlmKHRtcCA9ICgodG1wID0gbGV4WycjJ10pfHwnJylbJz0nXSB8fCB0bXApeyByZXR1cm4gZ3VuLmdldCh0bXApIH1cblx0KHRtcCA9IGd1bi5jaGFpbigpLl8pLmxleCA9IGxleDsgLy8gTEVYIVxuXHRndW4ub24oJ2luJywgZnVuY3Rpb24oZXZlKXtcblx0XHRpZihTdHJpbmcubWF0Y2goZXZlLmdldHx8IChldmUucHV0fHwnJylbJy4nXSwgbGV4WycuJ10gfHwgbGV4WycjJ10gfHwgbGV4KSl7XG5cdFx0XHR0bXAub24oJ2luJywgZXZlKTtcblx0XHR9XG5cdFx0dGhpcy50by5uZXh0KGV2ZSk7XG5cdH0pO1xuXHRyZXR1cm4gdG1wLiQ7XG59XG5HdW4uY2hhaW4ubWFwID0gZnVuY3Rpb24oY2IsIG9wdCwgdCl7XG5cdHZhciBndW4gPSB0aGlzLCBjYXQgPSBndW4uXywgbGV4LCBjaGFpbjtcblx0aWYoT2JqZWN0LnBsYWluKGNiKSl7IGxleCA9IGNiWycuJ10/IGNiIDogeycuJzogY2J9OyBjYiA9IHUgfVxuXHRpZighY2Ipe1xuXHRcdGlmKGNoYWluID0gY2F0LmVhY2gpeyByZXR1cm4gY2hhaW4gfVxuXHRcdChjYXQuZWFjaCA9IGNoYWluID0gZ3VuLmNoYWluKCkpLl8ubGV4ID0gbGV4IHx8IGNoYWluLl8ubGV4IHx8IGNhdC5sZXg7XG5cdFx0Y2hhaW4uXy5uaXggPSBndW4uYmFjaygnbml4Jyk7XG5cdFx0Z3VuLm9uKCdpbicsIG1hcCwgY2hhaW4uXyk7XG5cdFx0cmV0dXJuIGNoYWluO1xuXHR9XG5cdEd1bi5sb2cub25jZShcIm1hcGZuXCIsIFwiTWFwIGZ1bmN0aW9ucyBhcmUgZXhwZXJpbWVudGFsLCB0aGVpciBiZWhhdmlvciBhbmQgQVBJIG1heSBjaGFuZ2UgbW92aW5nIGZvcndhcmQuIFBsZWFzZSBwbGF5IHdpdGggaXQgYW5kIHJlcG9ydCBidWdzIGFuZCBpZGVhcyBvbiBob3cgdG8gaW1wcm92ZSBpdC5cIik7XG5cdGNoYWluID0gZ3VuLmNoYWluKCk7XG5cdGd1bi5tYXAoKS5vbihmdW5jdGlvbihkYXRhLCBrZXksIG1zZywgZXZlKXtcblx0XHR2YXIgbmV4dCA9IChjYnx8bm9vcCkuY2FsbCh0aGlzLCBkYXRhLCBrZXksIG1zZywgZXZlKTtcblx0XHRpZih1ID09PSBuZXh0KXsgcmV0dXJuIH1cblx0XHRpZihkYXRhID09PSBuZXh0KXsgcmV0dXJuIGNoYWluLl8ub24oJ2luJywgbXNnKSB9XG5cdFx0aWYoR3VuLmlzKG5leHQpKXsgcmV0dXJuIGNoYWluLl8ub24oJ2luJywgbmV4dC5fKSB9XG5cdFx0dmFyIHRtcCA9IHt9OyBPYmplY3Qua2V5cyhtc2cucHV0KS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2cucHV0W2tdIH0sIHRtcCk7IHRtcFsnPSddID0gbmV4dDsgXG5cdFx0Y2hhaW4uXy5vbignaW4nLCB7Z2V0OiBrZXksIHB1dDogdG1wfSk7XG5cdH0pO1xuXHRyZXR1cm4gY2hhaW47XG59XG5mdW5jdGlvbiBtYXAobXNnKXsgdGhpcy50by5uZXh0KG1zZyk7XG5cdHZhciBjYXQgPSB0aGlzLmFzLCBndW4gPSBtc2cuJCwgYXQgPSBndW4uXywgcHV0ID0gbXNnLnB1dCwgdG1wO1xuXHRpZighYXQuc291bCAmJiAhbXNnLiQkKXsgcmV0dXJuIH0gLy8gdGhpcyBsaW5lIHRvb2sgaHVuZHJlZHMgb2YgdHJpZXMgdG8gZmlndXJlIG91dC4gSXQgb25seSB3b3JrcyBpZiBjb3JlIGNoZWNrcyB0byBmaWx0ZXIgb3V0IGFib3ZlIGNoYWlucyBkdXJpbmcgbGluayB0aG8uIFRoaXMgc2F5cyBcIm9ubHkgYm90aGVyIHRvIG1hcCBvbiBhIG5vZGVcIiBmb3IgdGhpcyBsYXllciBvZiB0aGUgY2hhaW4uIElmIHNvbWV0aGluZyBpcyBub3QgYSBub2RlLCBtYXAgc2hvdWxkIG5vdCB3b3JrLlxuXHRpZigodG1wID0gY2F0LmxleCkgJiYgIVN0cmluZy5tYXRjaChtc2cuZ2V0fHwgKHB1dHx8JycpWycuJ10sIHRtcFsnLiddIHx8IHRtcFsnIyddIHx8IHRtcCkpeyByZXR1cm4gfVxuXHRHdW4ub24ubGluayhtc2csIGNhdCk7XG59XG52YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fSwgZXZlbnQgPSB7c3R1bjogbm9vcCwgb2ZmOiBub29wfSwgdTtcblx0IiwiXG5yZXF1aXJlKCcuL3NoaW0nKTtcblxudmFyIG5vb3AgPSBmdW5jdGlvbigpe31cbnZhciBwYXJzZSA9IEpTT04ucGFyc2VBc3luYyB8fCBmdW5jdGlvbih0LGNiLHIpeyB2YXIgdSwgZCA9ICtuZXcgRGF0ZTsgdHJ5eyBjYih1LCBKU09OLnBhcnNlKHQsciksIGpzb24uc3Vja3MoK25ldyBEYXRlIC0gZCkpIH1jYXRjaChlKXsgY2IoZSkgfSB9XG52YXIganNvbiA9IEpTT04uc3RyaW5naWZ5QXN5bmMgfHwgZnVuY3Rpb24odixjYixyLHMpeyB2YXIgdSwgZCA9ICtuZXcgRGF0ZTsgdHJ5eyBjYih1LCBKU09OLnN0cmluZ2lmeSh2LHIscyksIGpzb24uc3Vja3MoK25ldyBEYXRlIC0gZCkpIH1jYXRjaChlKXsgY2IoZSkgfSB9XG5qc29uLnN1Y2tzID0gZnVuY3Rpb24oZCl7IGlmKGQgPiA5OSl7IGNvbnNvbGUubG9nKFwiV2FybmluZzogSlNPTiBibG9ja2luZyBDUFUgZGV0ZWN0ZWQuIEFkZCBgZ3VuL2xpYi95c29uLmpzYCB0byBmaXguXCIpOyBqc29uLnN1Y2tzID0gbm9vcCB9IH1cblxuZnVuY3Rpb24gTWVzaChyb290KXtcblx0dmFyIG1lc2ggPSBmdW5jdGlvbigpe307XG5cdHZhciBvcHQgPSByb290Lm9wdCB8fCB7fTtcblx0b3B0LmxvZyA9IG9wdC5sb2cgfHwgY29uc29sZS5sb2c7XG5cdG9wdC5nYXAgPSBvcHQuZ2FwIHx8IG9wdC53YWl0IHx8IDA7XG5cdG9wdC5tYXggPSBvcHQubWF4IHx8IChvcHQubWVtb3J5PyAob3B0Lm1lbW9yeSAqIDk5OSAqIDk5OSkgOiAzMDAwMDAwMDApICogMC4zO1xuXHRvcHQucGFjayA9IG9wdC5wYWNrIHx8IChvcHQubWF4ICogMC4wMSAqIDAuMDEpO1xuXHRvcHQucHVmZiA9IG9wdC5wdWZmIHx8IDk7IC8vIElERUE6IGRvIGEgc3RhcnQvZW5kIGJlbmNobWFyaywgZGl2aWRlIG9wcy9yZXN1bHQuXG5cdHZhciBwdWZmID0gc2V0VGltZW91dC50dXJuIHx8IHNldFRpbWVvdXQ7XG5cblx0dmFyIGR1cCA9IHJvb3QuZHVwLCBkdXBfY2hlY2sgPSBkdXAuY2hlY2ssIGR1cF90cmFjayA9IGR1cC50cmFjaztcblxuXHR2YXIgU1QgPSArbmV3IERhdGUsIExUID0gU1Q7XG5cblx0dmFyIGhlYXIgPSBtZXNoLmhlYXIgPSBmdW5jdGlvbihyYXcsIHBlZXIpe1xuXHRcdGlmKCFyYXcpeyByZXR1cm4gfVxuXHRcdGlmKG9wdC5tYXggPD0gcmF3Lmxlbmd0aCl7IHJldHVybiBtZXNoLnNheSh7ZGFtOiAnIScsIGVycjogXCJNZXNzYWdlIHRvbyBiaWchXCJ9LCBwZWVyKSB9XG5cdFx0aWYobWVzaCA9PT0gdGhpcyl7XG5cdFx0XHQvKmlmKCdzdHJpbmcnID09IHR5cGVvZiByYXcpeyB0cnl7XG5cdFx0XHRcdHZhciBzdGF0ID0gY29uc29sZS5TVEFUIHx8IHt9O1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKCdIRUFSOicsIHBlZXIuaWQsIChyYXd8fCcnKS5zbGljZSgwLDI1MCksICgocmF3fHwnJykubGVuZ3RoIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoNCkpO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhzZXRUaW1lb3V0LnR1cm4ucy5sZW5ndGgsICdzdGFja3MnLCBwYXJzZUZsb2F0KCgtKExUIC0gKExUID0gK25ldyBEYXRlKSkvMTAwMCkudG9GaXhlZCgzKSksICdzZWMnLCBwYXJzZUZsb2F0KCgoTFQtU1QpLzEwMDAgLyA2MCkudG9GaXhlZCgxKSksICd1cCcsIHN0YXQucGVlcnN8fDAsICdwZWVycycsIHN0YXQuaGFzfHwwLCAnaGFzJywgc3RhdC5tZW1odXNlZHx8MCwgc3RhdC5tZW11c2VkfHwwLCBzdGF0Lm1lbWF4fHwwLCAnaGVhcCBtZW0gbWF4Jyk7XG5cdFx0XHR9Y2F0Y2goZSl7IGNvbnNvbGUubG9nKCdEQkcgZXJyJywgZSkgfX0qL1xuXHRcdFx0aGVhci5kICs9IHJhdy5sZW5ndGh8fDAgOyArK2hlYXIuYyB9IC8vIFNUQVRTIVxuXHRcdHZhciBTID0gcGVlci5TSCA9ICtuZXcgRGF0ZTtcblx0XHR2YXIgdG1wID0gcmF3WzBdLCBtc2c7XG5cdFx0Ly9yYXcgJiYgcmF3LnNsaWNlICYmIGNvbnNvbGUubG9nKFwiaGVhcjpcIiwgKChwZWVyLndpcmV8fCcnKS5oZWFkZXJzfHwnJykub3JpZ2luLCByYXcubGVuZ3RoLCByYXcuc2xpY2UgJiYgcmF3LnNsaWNlKDAsNTApKTsgLy90Yy1pYW11bmlxdWUtdGMtcGFja2FnZS1kczFcblx0XHRpZignWycgPT09IHRtcCl7XG5cdFx0XHRwYXJzZShyYXcsIGZ1bmN0aW9uKGVyciwgbXNnKXtcblx0XHRcdFx0aWYoZXJyIHx8ICFtc2cpeyByZXR1cm4gbWVzaC5zYXkoe2RhbTogJyEnLCBlcnI6IFwiREFNIEpTT04gcGFyc2UgZXJyb3IuXCJ9LCBwZWVyKSB9XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoK25ldyBEYXRlLCBtc2cubGVuZ3RoLCAnIyBvbiBoZWFyIGJhdGNoJyk7XG5cdFx0XHRcdHZhciBQID0gb3B0LnB1ZmY7XG5cdFx0XHRcdChmdW5jdGlvbiBnbygpe1xuXHRcdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHRcdHZhciBpID0gMCwgbTsgd2hpbGUoaSA8IFAgJiYgKG0gPSBtc2dbaSsrXSkpeyBtZXNoLmhlYXIobSwgcGVlcikgfVxuXHRcdFx0XHRcdG1zZyA9IG1zZy5zbGljZShpKTsgLy8gc2xpY2luZyBhZnRlciBpcyBmYXN0ZXIgdGhhbiBzaGlmdGluZyBkdXJpbmcuXG5cdFx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCAnaGVhciBsb29wJyk7XG5cdFx0XHRcdFx0Zmx1c2gocGVlcik7IC8vIGZvcmNlIHNlbmQgYWxsIHN5bmNocm9ub3VzbHkgYmF0Y2hlZCBhY2tzLlxuXHRcdFx0XHRcdGlmKCFtc2cubGVuZ3RoKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRwdWZmKGdvLCAwKTtcblx0XHRcdFx0fSgpKTtcblx0XHRcdH0pO1xuXHRcdFx0cmF3ID0gJyc7IC8vIFxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZigneycgPT09IHRtcCB8fCAoKHJhd1snIyddIHx8IE9iamVjdC5wbGFpbihyYXcpKSAmJiAobXNnID0gcmF3KSkpe1xuXHRcdFx0aWYobXNnKXsgcmV0dXJuIGhlYXIub25lKG1zZywgcGVlciwgUykgfVxuXHRcdFx0cGFyc2UocmF3LCBmdW5jdGlvbihlcnIsIG1zZyl7XG5cdFx0XHRcdGlmKGVyciB8fCAhbXNnKXsgcmV0dXJuIG1lc2guc2F5KHtkYW06ICchJywgZXJyOiBcIkRBTSBKU09OIHBhcnNlIGVycm9yLlwifSwgcGVlcikgfVxuXHRcdFx0XHRoZWFyLm9uZShtc2csIHBlZXIsIFMpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cdGhlYXIub25lID0gZnVuY3Rpb24obXNnLCBwZWVyLCBTKXsgLy8gUyBoZXJlIGlzIHRlbXBvcmFyeSEgVW5kby5cblx0XHR2YXIgaWQsIGhhc2gsIHRtcCwgYXNoLCBEQkc7XG5cdFx0aWYobXNnLkRCRyl7IG1zZy5EQkcgPSBEQkcgPSB7REJHOiBtc2cuREJHfSB9XG5cdFx0REJHICYmIChEQkcuaCA9IFMpO1xuXHRcdERCRyAmJiAoREJHLmhwID0gK25ldyBEYXRlKTtcblx0XHRpZighKGlkID0gbXNnWycjJ10pKXsgaWQgPSBtc2dbJyMnXSA9IFN0cmluZy5yYW5kb20oOSkgfVxuXHRcdGlmKHRtcCA9IGR1cF9jaGVjayhpZCkpeyByZXR1cm4gfVxuXHRcdC8vIERBTSBsb2dpYzpcblx0XHRpZighKGhhc2ggPSBtc2dbJyMjJ10pICYmIGZhbHNlICYmIHUgIT09IG1zZy5wdXQpeyAvKmhhc2ggPSBtc2dbJyMjJ10gPSBUeXBlLm9iai5oYXNoKG1zZy5wdXQpKi8gfSAvLyBkaXNhYmxlIGhhc2hpbmcgZm9yIG5vdyAvLyBUT0RPOiBpbXBvc2Ugd2FybmluZy9wZW5hbHR5IGluc3RlYWQgKD8pXG5cdFx0aWYoaGFzaCAmJiAodG1wID0gbXNnWydAJ10gfHwgKG1zZy5nZXQgJiYgaWQpKSAmJiBkdXAuY2hlY2soYXNoID0gdG1wK2hhc2gpKXsgcmV0dXJuIH0gLy8gSW1hZ2luZSBBIDwtPiBCIDw9PiAoQyAmIEQpLCBDICYgRCByZXBseSB3aXRoIHNhbWUgQUNLIGJ1dCBoYXZlIGRpZmZlcmVudCBJRHMsIEIgY2FuIHVzZSBoYXNoIHRvIGRlZHVwLiBPciBpZiBhIEdFVCBoYXMgYSBoYXNoIGFscmVhZHksIHdlIHNob3VsZG4ndCBBQ0sgaWYgc2FtZS5cblx0XHQobXNnLl8gPSBmdW5jdGlvbigpe30pLnZpYSA9IG1lc2gubGVhcCA9IHBlZXI7XG5cdFx0aWYoKHRtcCA9IG1zZ1snPjwnXSkgJiYgJ3N0cmluZycgPT0gdHlwZW9mIHRtcCl7IHRtcC5zbGljZSgwLDk5KS5zcGxpdCgnLCcpLmZvckVhY2goZnVuY3Rpb24oayl7IHRoaXNba10gPSAxIH0sIChtc2cuXykueW8gPSB7fSkgfSAvLyBQZWVycyBhbHJlYWR5IHNlbnQgdG8sIGRvIG5vdCByZXNlbmQuXG5cdFx0Ly8gREFNIF5cblx0XHRpZih0bXAgPSBtc2cuZGFtKXtcblx0XHRcdGlmKHRtcCA9IG1lc2guaGVhclt0bXBdKXtcblx0XHRcdFx0dG1wKG1zZywgcGVlciwgcm9vdCk7XG5cdFx0XHR9XG5cdFx0XHRkdXBfdHJhY2soaWQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZih0bXAgPSBtc2cub2speyBtc2cuXy5uZWFyID0gdG1wWycvJ10gfVxuXHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdERCRyAmJiAoREJHLmlzID0gUyk7IHBlZXIuU0kgPSBpZDtcblx0XHRyb290Lm9uKCdpbicsIG1lc2gubGFzdCA9IG1zZyk7XG5cdFx0Ly9FQ0hPID0gbXNnLnB1dCB8fCBFQ0hPOyAhKG1zZy5vayAhPT0gLTM3NDApICYmIG1lc2guc2F5KHtvazogLTM3NDAsIHB1dDogRUNITywgJ0AnOiBtc2dbJyMnXX0sIHBlZXIpO1xuXHRcdERCRyAmJiAoREJHLmhkID0gK25ldyBEYXRlKTtcblx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICtuZXcgRGF0ZSAtIFMsIG1zZy5nZXQ/ICdtc2cgZ2V0JyA6IG1zZy5wdXQ/ICdtc2cgcHV0JyA6ICdtc2cnKTtcblx0XHQodG1wID0gZHVwX3RyYWNrKGlkKSkudmlhID0gcGVlcjsgLy8gZG9uJ3QgZGVkdXAgbWVzc2FnZSBJRCB0aWxsIGFmdGVyLCBjYXVzZSBHVU4gaGFzIGludGVybmFsIGRlZHVwIGNoZWNrLlxuXHRcdGlmKG1zZy5nZXQpeyB0bXAuaXQgPSBtc2cgfVxuXHRcdGlmKGFzaCl7IGR1cF90cmFjayhhc2gpIH0gLy9kdXAudHJhY2sodG1wK2hhc2gsIHRydWUpLml0ID0gaXQobXNnKTtcblx0XHRtZXNoLmxlYXAgPSBtZXNoLmxhc3QgPSBudWxsOyAvLyB3YXJuaW5nISBtZXNoLmxlYXAgY291bGQgYmUgYnVnZ3kuXG5cdH1cblx0dmFyIHRvbWFwID0gZnVuY3Rpb24oayxpLG0pe20oayx0cnVlKX07XG5cdGhlYXIuYyA9IGhlYXIuZCA9IDA7XG5cblx0OyhmdW5jdGlvbigpe1xuXHRcdHZhciBTTUlBID0gMDtcblx0XHR2YXIgbG9vcDtcblx0XHRtZXNoLmhhc2ggPSBmdW5jdGlvbihtc2csIHBlZXIpeyB2YXIgaCwgcywgdDtcblx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0anNvbihtc2cucHV0LCBmdW5jdGlvbiBoYXNoKGVyciwgdGV4dCl7XG5cdFx0XHRcdHZhciBzcyA9IChzIHx8IChzID0gdCA9IHRleHR8fCcnKSkuc2xpY2UoMCwgMzI3NjgpOyAvLyAxMDI0ICogMzJcblx0XHRcdCAgaCA9IFN0cmluZy5oYXNoKHNzLCBoKTsgcyA9IHMuc2xpY2UoMzI3NjgpO1xuXHRcdFx0ICBpZihzKXsgcHVmZihoYXNoLCAwKTsgcmV0dXJuIH1cblx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCAnc2F5IGpzb24raGFzaCcpO1xuXHRcdFx0ICBtc2cuXy4kcHV0ID0gdDtcblx0XHRcdCAgbXNnWycjIyddID0gaDtcblx0XHRcdCAgbWVzaC5zYXkobXNnLCBwZWVyKTtcblx0XHRcdCAgZGVsZXRlIG1zZy5fLiRwdXQ7XG5cdFx0XHR9LCBzb3J0KTtcblx0XHR9XG5cdFx0ZnVuY3Rpb24gc29ydChrLCB2KXsgdmFyIHRtcDtcblx0XHRcdGlmKCEodiBpbnN0YW5jZW9mIE9iamVjdCkpeyByZXR1cm4gdiB9XG5cdFx0XHRPYmplY3Qua2V5cyh2KS5zb3J0KCkuZm9yRWFjaChzb3J0YSwge3RvOiB0bXAgPSB7fSwgb246IHZ9KTtcblx0XHRcdHJldHVybiB0bXA7XG5cdFx0fSBmdW5jdGlvbiBzb3J0YShrKXsgdGhpcy50b1trXSA9IHRoaXMub25ba10gfVxuXG5cdFx0dmFyIHNheSA9IG1lc2guc2F5ID0gZnVuY3Rpb24obXNnLCBwZWVyKXsgdmFyIHRtcDtcblx0XHRcdGlmKCh0bXAgPSB0aGlzKSAmJiAodG1wID0gdG1wLnRvKSAmJiB0bXAubmV4dCl7IHRtcC5uZXh0KG1zZykgfSAvLyBjb21wYXRpYmxlIHdpdGggbWlkZGxld2FyZSBhZGFwdGVycy5cblx0XHRcdGlmKCFtc2cpeyByZXR1cm4gZmFsc2UgfVxuXHRcdFx0dmFyIGlkLCBoYXNoLCByYXcsIGFjayA9IG1zZ1snQCddO1xuLy9pZihvcHQuc3VwZXIgJiYgKCFhY2sgfHwgIW1zZy5wdXQpKXsgcmV0dXJuIH0gLy8gVE9ETzogTUFOSEFUVEFOIFNUVUIgLy9PQlZJT1VTTFkgQlVHISBCdXQgc3F1ZWxjaCByZWxheS4gLy8gOiggZ2V0IG9ubHkgaXMgMTAwJSsgQ1BVIHVzYWdlIDooXG5cdFx0XHR2YXIgbWV0YSA9IG1zZy5ffHwobXNnLl89ZnVuY3Rpb24oKXt9KTtcblx0XHRcdHZhciBEQkcgPSBtc2cuREJHLCBTID0gK25ldyBEYXRlOyBtZXRhLnkgPSBtZXRhLnkgfHwgUzsgaWYoIXBlZXIpeyBEQkcgJiYgKERCRy55ID0gUykgfVxuXHRcdFx0aWYoIShpZCA9IG1zZ1snIyddKSl7IGlkID0gbXNnWycjJ10gPSBTdHJpbmcucmFuZG9tKDkpIH1cblx0XHRcdCFsb29wICYmIGR1cF90cmFjayhpZCk7Ly8uaXQgPSBpdChtc2cpOyAvLyB0cmFjayBmb3IgOSBzZWNvbmRzLCBkZWZhdWx0LiBFYXJ0aDwtPk1hcnMgd291bGQgbmVlZCBtb3JlISAvLyBhbHdheXMgdHJhY2ssIG1heWJlIG1vdmUgdGhpcyB0byB0aGUgJ2FmdGVyJyBsb2dpYyBpZiB3ZSBzcGxpdCBmdW5jdGlvbi5cblx0XHRcdC8vaWYobXNnLnB1dCAmJiAobXNnLmVyciB8fCAoZHVwLnNbaWRdfHwnJykuZXJyKSl7IHJldHVybiBmYWxzZSB9IC8vIFRPRE86IGluIHRoZW9yeSB3ZSBzaG91bGQgbm90IGJlIGFibGUgdG8gc3R1biBhIG1lc3NhZ2UsIGJ1dCBmb3Igbm93IGdvaW5nIHRvIGNoZWNrIGlmIGl0IGNhbiBoZWxwIG5ldHdvcmsgcGVyZm9ybWFuY2UgcHJldmVudGluZyBpbnZhbGlkIGRhdGEgdG8gcmVsYXkuXG5cdFx0XHRpZighKGhhc2ggPSBtc2dbJyMjJ10pICYmIHUgIT09IG1zZy5wdXQgJiYgIW1ldGEudmlhICYmIGFjayl7IG1lc2guaGFzaChtc2csIHBlZXIpOyByZXR1cm4gfSAvLyBUT0RPOiBTaG91bGQgYnJvYWRjYXN0cyBiZSBoYXNoZWQ/XG5cdFx0XHRpZighcGVlciAmJiBhY2speyBwZWVyID0gKCh0bXAgPSBkdXAuc1thY2tdKSAmJiAodG1wLnZpYSB8fCAoKHRtcCA9IHRtcC5pdCkgJiYgKHRtcCA9IHRtcC5fKSAmJiB0bXAudmlhKSkpIHx8ICgodG1wID0gbWVzaC5sYXN0KSAmJiBhY2sgPT09IHRtcFsnIyddICYmIG1lc2gubGVhcCkgfSAvLyB3YXJuaW5nISBtZXNoLmxlYXAgY291bGQgYmUgYnVnZ3khIG1lc2ggbGFzdCBjaGVjayByZWR1Y2VzIHRoaXMuXG5cdFx0XHRpZighcGVlciAmJiBhY2speyAvLyBzdGlsbCBubyBwZWVyLCB0aGVuIGFjayBkYWlzeSBjaGFpbiAndHVubmVsJyBnb3QgbG9zdC5cblx0XHRcdFx0aWYoZHVwLnNbYWNrXSl7IHJldHVybiB9IC8vIGluIGR1cHMgYnV0IG5vIHBlZXIgaGludHMgdGhhdCB0aGlzIHdhcyBhY2sgdG8gb3Vyc2VsZiwgaWdub3JlLlxuXHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKCtuZXcgRGF0ZSwgKytTTUlBLCAndG90YWwgbm8gcGVlciB0byBhY2sgdG8nKTsgLy8gVE9ETzogRGVsZXRlIHRoaXMgbm93LiBEcm9wcGluZyBsb3N0IEFDS3MgaXMgcHJvdG9jb2wgZmluZSBub3cuXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0gLy8gVE9ETzogVGVtcG9yYXJ5PyBJZiBhY2sgdmlhIHRyYWNlIGhhcyBiZWVuIGxvc3QsIGFja3Mgd2lsbCBnbyB0byBhbGwgcGVlcnMsIHdoaWNoIHRyYXNoZXMgYnJvd3NlciBiYW5kd2lkdGguIE5vdCByZWxheWluZyB0aGUgYWNrIHdpbGwgZm9yY2Ugc2VuZGVyIHRvIGFzayBmb3IgYWNrIGFnYWluLiBOb3RlLCB0aGlzIGlzIHRlY2huaWNhbGx5IHdyb25nIGZvciBtZXNoIGJlaGF2aW9yLlxuXHRcdFx0aWYoIXBlZXIgJiYgbWVzaC53YXkpeyByZXR1cm4gbWVzaC53YXkobXNnKSB9XG5cdFx0XHREQkcgJiYgKERCRy55aCA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRpZighKHJhdyA9IG1ldGEucmF3KSl7IG1lc2gucmF3KG1zZywgcGVlcik7IHJldHVybiB9XG5cdFx0XHREQkcgJiYgKERCRy55ciA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRpZighcGVlciB8fCAhcGVlci5pZCl7XG5cdFx0XHRcdGlmKCFPYmplY3QucGxhaW4ocGVlciB8fCBvcHQucGVlcnMpKXsgcmV0dXJuIGZhbHNlIH1cblx0XHRcdFx0dmFyIFMgPSArbmV3IERhdGU7XG5cdFx0XHRcdHZhciBQID0gb3B0LnB1ZmYsIHBzID0gb3B0LnBlZXJzLCBwbCA9IE9iamVjdC5rZXlzKHBlZXIgfHwgb3B0LnBlZXJzIHx8IHt9KTsgLy8gVE9ETzogLmtleXMoIGlzIHNsb3dcblx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCAncGVlciBrZXlzJyk7XG5cdFx0XHRcdDsoZnVuY3Rpb24gZ28oKXtcblx0XHRcdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0XHQvL1R5cGUub2JqLm1hcChwZWVyIHx8IG9wdC5wZWVycywgZWFjaCk7IC8vIGluIGNhc2UgcGVlciBpcyBhIHBlZXIgbGlzdC5cblx0XHRcdFx0XHRsb29wID0gMTsgdmFyIHdyID0gbWV0YS5yYXc7IG1ldGEucmF3ID0gcmF3OyAvLyBxdWljayBwZXJmIGhhY2tcblx0XHRcdFx0XHR2YXIgaSA9IDAsIHA7IHdoaWxlKGkgPCA5ICYmIChwID0gKHBsfHwnJylbaSsrXSkpe1xuXHRcdFx0XHRcdFx0aWYoIShwID0gcHNbcF0pKXsgY29udGludWUgfVxuXHRcdFx0XHRcdFx0bWVzaC5zYXkobXNnLCBwKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bWV0YS5yYXcgPSB3cjsgbG9vcCA9IDA7XG5cdFx0XHRcdFx0cGwgPSBwbC5zbGljZShpKTsgLy8gc2xpY2luZyBhZnRlciBpcyBmYXN0ZXIgdGhhbiBzaGlmdGluZyBkdXJpbmcuXG5cdFx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCAnc2F5IGxvb3AnKTtcblx0XHRcdFx0XHRpZighcGwubGVuZ3RoKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRwdWZmKGdvLCAwKTtcblx0XHRcdFx0XHRhY2sgJiYgZHVwX3RyYWNrKGFjayk7IC8vIGtlZXAgZm9yIGxhdGVyXG5cdFx0XHRcdH0oKSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdC8vIFRPRE86IFBFUkY6IGNvbnNpZGVyIHNwbGl0dGluZyBmdW5jdGlvbiBoZXJlLCBzbyBzYXkgbG9vcHMgZG8gbGVzcyB3b3JrLlxuXHRcdFx0aWYoIXBlZXIud2lyZSAmJiBtZXNoLndpcmUpeyBtZXNoLndpcmUocGVlcikgfVxuXHRcdFx0aWYoaWQgPT09IHBlZXIubGFzdCl7IHJldHVybiB9IHBlZXIubGFzdCA9IGlkOyAgLy8gd2FzIGl0IGp1c3Qgc2VudD9cblx0XHRcdGlmKHBlZXIgPT09IG1ldGEudmlhKXsgcmV0dXJuIGZhbHNlIH0gLy8gZG9uJ3Qgc2VuZCBiYWNrIHRvIHNlbGYuXG5cdFx0XHRpZigodG1wID0gbWV0YS55bykgJiYgKHRtcFtwZWVyLnVybF0gfHwgdG1wW3BlZXIucGlkXSB8fCB0bXBbcGVlci5pZF0pIC8qJiYgIW8qLyl7IHJldHVybiBmYWxzZSB9XG5cdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICgoREJHfHxtZXRhKS55cCA9ICtuZXcgRGF0ZSkgLSAobWV0YS55IHx8IFMpLCAnc2F5IHByZXAnKTtcblx0XHRcdCFsb29wICYmIGFjayAmJiBkdXBfdHJhY2soYWNrKTsgLy8gc3RyZWFtaW5nIGxvbmcgcmVzcG9uc2VzIG5lZWRzIHRvIGtlZXAgYWxpdmUgdGhlIGFjay5cblx0XHRcdGlmKHBlZXIuYmF0Y2gpe1xuXHRcdFx0XHRwZWVyLnRhaWwgPSAodG1wID0gcGVlci50YWlsIHx8IDApICsgcmF3Lmxlbmd0aDtcblx0XHRcdFx0aWYocGVlci50YWlsIDw9IG9wdC5wYWNrKXtcblx0XHRcdFx0XHRwZWVyLmJhdGNoICs9ICh0bXA/JywnOicnKStyYXc7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZsdXNoKHBlZXIpO1xuXHRcdFx0fVxuXHRcdFx0cGVlci5iYXRjaCA9ICdbJzsgLy8gUHJldmVudHMgZG91YmxlIEpTT04hXG5cdFx0XHR2YXIgU1QgPSArbmV3IERhdGU7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoU1QsICtuZXcgRGF0ZSAtIFNULCAnMG1zIFRPJyk7XG5cdFx0XHRcdGZsdXNoKHBlZXIpO1xuXHRcdFx0fSwgb3B0LmdhcCk7IC8vIFRPRE86IHF1ZXVpbmcvYmF0Y2hpbmcgbWlnaHQgYmUgYmFkIGZvciBsb3ctbGF0ZW5jeSB2aWRlbyBnYW1lIHBlcmZvcm1hbmNlISBBbGxvdyBvcHQgb3V0P1xuXHRcdFx0c2VuZChyYXcsIHBlZXIpO1xuXHRcdFx0Y29uc29sZS5TVEFUICYmIChhY2sgPT09IHBlZXIuU0kpICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBwZWVyLlNILCAnc2F5IGFjaycpO1xuXHRcdH1cblx0XHRtZXNoLnNheS5jID0gbWVzaC5zYXkuZCA9IDA7XG5cdFx0Ly8gVE9ETzogdGhpcyBjYXVzZWQgYSBvdXQtb2YtbWVtb3J5IGNyYXNoIVxuXHRcdG1lc2gucmF3ID0gZnVuY3Rpb24obXNnLCBwZWVyKXsgLy8gVE9ETzogQ2xlYW4gdGhpcyB1cCAvIGRlbGV0ZSBpdCAvIG1vdmUgbG9naWMgb3V0IVxuXHRcdFx0aWYoIW1zZyl7IHJldHVybiAnJyB9XG5cdFx0XHR2YXIgbWV0YSA9IChtc2cuXykgfHwge30sIHB1dCwgdG1wO1xuXHRcdFx0aWYodG1wID0gbWV0YS5yYXcpeyByZXR1cm4gdG1wIH1cblx0XHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiBtc2cpeyByZXR1cm4gbXNnIH1cblx0XHRcdHZhciBoYXNoID0gbXNnWycjIyddLCBhY2sgPSBtc2dbJ0AnXTtcblx0XHRcdGlmKGhhc2ggJiYgYWNrKXtcblx0XHRcdFx0aWYoIW1ldGEudmlhICYmIGR1cF9jaGVjayhhY2sraGFzaCkpeyByZXR1cm4gZmFsc2UgfSAvLyBmb3Igb3VyIG93biBvdXQgbWVzc2FnZXMsIG1lbW9yeSAmIHN0b3JhZ2UgbWF5IGFjayB0aGUgc2FtZSB0aGluZywgc28gZGVkdXAgdGhhdC4gVGhvIGlmIHZpYSBhbm90aGVyIHBlZXIsIHdlIGFscmVhZHkgdHJhY2tlZCBpdCB1cG9uIGhlYXJpbmcsIHNvIHRoaXMgd2lsbCBhbHdheXMgdHJpZ2dlciBmYWxzZSBwb3NpdGl2ZXMsIHNvIGRvbid0IGRvIHRoYXQhXG5cdFx0XHRcdGlmKCh0bXAgPSAoZHVwLnNbYWNrXXx8JycpLml0KSB8fCAoKHRtcCA9IG1lc2gubGFzdCkgJiYgYWNrID09PSB0bXBbJyMnXSkpe1xuXHRcdFx0XHRcdGlmKGhhc2ggPT09IHRtcFsnIyMnXSl7IHJldHVybiBmYWxzZSB9IC8vIGlmIGFzayBoYXMgYSBtYXRjaGluZyBoYXNoLCBhY2tpbmcgaXMgb3B0aW9uYWwuXG5cdFx0XHRcdFx0aWYoIXRtcFsnIyMnXSl7IHRtcFsnIyMnXSA9IGhhc2ggfSAvLyBpZiBub25lLCBhZGQgb3VyIGhhc2ggdG8gYXNrIHNvIGFueW9uZSB3ZSByZWxheSB0byBjYW4gZGVkdXAuIC8vIE5PVEU6IE1heSBvbmx5IGNoZWNrIGFnYWluc3QgMXN0IGFjayBjaHVuaywgMm5kKyB3b24ndCBrbm93IGFuZCBzdGlsbCBzdHJlYW0gYmFjayB0byByZWxheWluZyBwZWVycyB3aGljaCBtYXkgdGhlbiBkZWR1cC4gQW55IHdheSB0byBmaXggdGhpcyB3YXN0ZWQgYmFuZHdpZHRoPyBJIGd1ZXNzIGZvcmNlIHJhdGUgbGltaXRpbmcgYnJlYWtpbmcgY2hhbmdlLCB0aGF0IGFza2luZyBwZWVyIGhhcyB0byBhc2sgZm9yIG5leHQgbGV4aWNhbCBjaHVuay5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYoIW1zZy5kYW0gJiYgIW1zZ1snQCddKXtcblx0XHRcdFx0dmFyIGkgPSAwLCB0byA9IFtdOyB0bXAgPSBvcHQucGVlcnM7XG5cdFx0XHRcdGZvcih2YXIgayBpbiB0bXApeyB2YXIgcCA9IHRtcFtrXTsgLy8gVE9ETzogTWFrZSBpdCB1cCBwZWVycyBpbnN0ZWFkIVxuXHRcdFx0XHRcdHRvLnB1c2gocC51cmwgfHwgcC5waWQgfHwgcC5pZCk7XG5cdFx0XHRcdFx0aWYoKytpID4gNil7IGJyZWFrIH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZihpID4gMSl7IG1zZ1snPjwnXSA9IHRvLmpvaW4oKSB9IC8vIFRPRE86IEJVRyEgVGhpcyBnZXRzIHNldCByZWdhcmRsZXNzIG9mIHBlZXJzIHNlbnQgdG8hIERldGVjdD9cblx0XHRcdH1cblx0XHRcdGlmKG1zZy5wdXQgJiYgKHRtcCA9IG1zZy5vaykpeyBtc2cub2sgPSB7J0AnOih0bXBbJ0AnXXx8MSktMSwgJy8nOiAodG1wWycvJ109PW1zZy5fLm5lYXIpPyBtZXNoLm5lYXIgOiB0bXBbJy8nXX07IH1cblx0XHRcdGlmKHB1dCA9IG1ldGEuJHB1dCl7XG5cdFx0XHRcdHRtcCA9IHt9OyBPYmplY3Qua2V5cyhtc2cpLmZvckVhY2goZnVuY3Rpb24oayl7IHRtcFtrXSA9IG1zZ1trXSB9KTtcblx0XHRcdFx0dG1wLnB1dCA9ICc6XSkoWzonO1xuXHRcdFx0XHRqc29uKHRtcCwgZnVuY3Rpb24oZXJyLCByYXcpe1xuXHRcdFx0XHRcdGlmKGVycil7IHJldHVybiB9IC8vIFRPRE86IEhhbmRsZSEhXG5cdFx0XHRcdFx0dmFyIFMgPSArbmV3IERhdGU7XG5cdFx0XHRcdFx0dG1wID0gcmF3LmluZGV4T2YoJ1wicHV0XCI6XCI6XSkoWzpcIicpO1xuXHRcdFx0XHRcdHJlcyh1LCByYXcgPSByYXcuc2xpY2UoMCwgdG1wKzYpICsgcHV0ICsgcmF3LnNsaWNlKHRtcCArIDE0KSk7XG5cdFx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCAnc2F5IHNsaWNlJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRqc29uKG1zZywgcmVzKTtcblx0XHRcdGZ1bmN0aW9uIHJlcyhlcnIsIHJhdyl7XG5cdFx0XHRcdGlmKGVycil7IHJldHVybiB9IC8vIFRPRE86IEhhbmRsZSEhXG5cdFx0XHRcdG1ldGEucmF3ID0gcmF3OyAvL2lmKG1ldGEgJiYgKHJhd3x8JycpLmxlbmd0aCA8ICg5OTkgKiA5OSkpeyBtZXRhLnJhdyA9IHJhdyB9IC8vIEhOUEVSRjogSWYgc3RyaW5nIHRvbyBiaWcsIGRvbid0IGtlZXAgaW4gbWVtb3J5LlxuXHRcdFx0XHRtZXNoLnNheShtc2csIHBlZXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSgpKTtcblxuXHRmdW5jdGlvbiBmbHVzaChwZWVyKXtcblx0XHR2YXIgdG1wID0gcGVlci5iYXRjaCwgdCA9ICdzdHJpbmcnID09IHR5cGVvZiB0bXAsIGw7XG5cdFx0aWYodCl7IHRtcCArPSAnXScgfS8vIFRPRE86IFByZXZlbnQgZG91YmxlIEpTT04hXG5cdFx0cGVlci5iYXRjaCA9IHBlZXIudGFpbCA9IG51bGw7XG5cdFx0aWYoIXRtcCl7IHJldHVybiB9XG5cdFx0aWYodD8gMyA+IHRtcC5sZW5ndGggOiAhdG1wLmxlbmd0aCl7IHJldHVybiB9IC8vIFRPRE86IF5cblx0XHRpZighdCl7dHJ5e3RtcCA9ICgxID09PSB0bXAubGVuZ3RoPyB0bXBbMF0gOiBKU09OLnN0cmluZ2lmeSh0bXApKTtcblx0XHR9Y2F0Y2goZSl7cmV0dXJuIG9wdC5sb2coJ0RBTSBKU09OIHN0cmluZ2lmeSBlcnJvcicsIGUpfX1cblx0XHRpZighdG1wKXsgcmV0dXJuIH1cblx0XHRzZW5kKHRtcCwgcGVlcik7XG5cdH1cblx0Ly8gZm9yIG5vdyAtIGZpbmQgYmV0dGVyIHBsYWNlIGxhdGVyLlxuXHRmdW5jdGlvbiBzZW5kKHJhdywgcGVlcil7IHRyeXtcblx0XHR2YXIgd2lyZSA9IHBlZXIud2lyZTtcblx0XHRpZihwZWVyLnNheSl7XG5cdFx0XHRwZWVyLnNheShyYXcpO1xuXHRcdH0gZWxzZVxuXHRcdGlmKHdpcmUuc2VuZCl7XG5cdFx0XHR3aXJlLnNlbmQocmF3KTtcblx0XHR9XG5cdFx0bWVzaC5zYXkuZCArPSByYXcubGVuZ3RofHwwOyArK21lc2guc2F5LmM7IC8vIFNUQVRTIVxuXHR9Y2F0Y2goZSl7XG5cdFx0KHBlZXIucXVldWUgPSBwZWVyLnF1ZXVlIHx8IFtdKS5wdXNoKHJhdyk7XG5cdH19XG5cblx0bWVzaC5uZWFyID0gMDtcblx0bWVzaC5oaSA9IGZ1bmN0aW9uKHBlZXIpe1xuXHRcdHZhciB3aXJlID0gcGVlci53aXJlLCB0bXA7XG5cdFx0aWYoIXdpcmUpeyBtZXNoLndpcmUoKHBlZXIubGVuZ3RoICYmIHt1cmw6IHBlZXIsIGlkOiBwZWVyfSkgfHwgcGVlcik7IHJldHVybiB9XG5cdFx0aWYocGVlci5pZCl7XG5cdFx0XHRvcHQucGVlcnNbcGVlci51cmwgfHwgcGVlci5pZF0gPSBwZWVyO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0bXAgPSBwZWVyLmlkID0gcGVlci5pZCB8fCBTdHJpbmcucmFuZG9tKDkpO1xuXHRcdFx0bWVzaC5zYXkoe2RhbTogJz8nLCBwaWQ6IHJvb3Qub3B0LnBpZH0sIG9wdC5wZWVyc1t0bXBdID0gcGVlcik7XG5cdFx0XHRkZWxldGUgZHVwLnNbcGVlci5sYXN0XTsgLy8gSU1QT1JUQU5UOiBzZWUgaHR0cHM6Ly9ndW4uZWNvL2RvY3MvREFNI3NlbGZcblx0XHR9XG5cdFx0aWYoIXBlZXIubWV0KXtcblx0XHRcdG1lc2gubmVhcisrO1xuXHRcdFx0cGVlci5tZXQgPSArKG5ldyBEYXRlKTtcblx0XHRcdHJvb3Qub24oJ2hpJywgcGVlcilcblx0XHR9XG5cdFx0Ly8gQHJvZ293c2tpIEkgbmVlZCB0aGlzIGhlcmUgYnkgZGVmYXVsdCBmb3Igbm93IHRvIGZpeCBnbzFkZmlzaCdzIGJ1Z1xuXHRcdHRtcCA9IHBlZXIucXVldWU7IHBlZXIucXVldWUgPSBbXTtcblx0XHRzZXRUaW1lb3V0LmVhY2godG1wfHxbXSxmdW5jdGlvbihtc2cpe1xuXHRcdFx0c2VuZChtc2csIHBlZXIpO1xuXHRcdH0sMCw5KTtcblx0XHQvL1R5cGUub2JqLm5hdGl2ZSAmJiBUeXBlLm9iai5uYXRpdmUoKTsgLy8gZGlydHkgcGxhY2UgdG8gY2hlY2sgaWYgb3RoZXIgSlMgcG9sbHV0ZWQuXG5cdH1cblx0bWVzaC5ieWUgPSBmdW5jdGlvbihwZWVyKXtcblx0XHRwZWVyLm1ldCAmJiAtLW1lc2gubmVhcjtcblx0XHRkZWxldGUgcGVlci5tZXQ7XG5cdFx0cm9vdC5vbignYnllJywgcGVlcik7XG5cdFx0dmFyIHRtcCA9ICsobmV3IERhdGUpOyB0bXAgPSAodG1wIC0gKHBlZXIubWV0fHx0bXApKTtcblx0XHRtZXNoLmJ5ZS50aW1lID0gKChtZXNoLmJ5ZS50aW1lIHx8IHRtcCkgKyB0bXApIC8gMjtcblx0fVxuXHRtZXNoLmhlYXJbJyEnXSA9IGZ1bmN0aW9uKG1zZywgcGVlcil7IG9wdC5sb2coJ0Vycm9yOicsIG1zZy5lcnIpIH1cblx0bWVzaC5oZWFyWyc/J10gPSBmdW5jdGlvbihtc2csIHBlZXIpe1xuXHRcdGlmKG1zZy5waWQpe1xuXHRcdFx0aWYoIXBlZXIucGlkKXsgcGVlci5waWQgPSBtc2cucGlkIH1cblx0XHRcdGlmKG1zZ1snQCddKXsgcmV0dXJuIH1cblx0XHR9XG5cdFx0bWVzaC5zYXkoe2RhbTogJz8nLCBwaWQ6IG9wdC5waWQsICdAJzogbXNnWycjJ119LCBwZWVyKTtcblx0XHRkZWxldGUgZHVwLnNbcGVlci5sYXN0XTsgLy8gSU1QT1JUQU5UOiBzZWUgaHR0cHM6Ly9ndW4uZWNvL2RvY3MvREFNI3NlbGZcblx0fVxuXHRtZXNoLmhlYXJbJ21vYiddID0gZnVuY3Rpb24obXNnLCBwZWVyKXsgLy8gTk9URTogQVhFIHdpbGwgb3ZlcmxvYWQgdGhpcyB3aXRoIGJldHRlciBsb2dpYy5cblx0XHRpZighbXNnLnBlZXJzKXsgcmV0dXJuIH1cblx0XHR2YXIgcGVlcnMgPSBPYmplY3Qua2V5cyhtc2cucGVlcnMpLCBvbmUgPSBwZWVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqcGVlcnMubGVuZ3RoKV07XG5cdFx0aWYoIW9uZSl7IHJldHVybiB9XG5cdFx0bWVzaC5ieWUocGVlcik7XG5cdFx0bWVzaC5oaShvbmUpO1xuXHR9XG5cblx0cm9vdC5vbignY3JlYXRlJywgZnVuY3Rpb24ocm9vdCl7XG5cdFx0cm9vdC5vcHQucGlkID0gcm9vdC5vcHQucGlkIHx8IFN0cmluZy5yYW5kb20oOSk7XG5cdFx0dGhpcy50by5uZXh0KHJvb3QpO1xuXHRcdHJvb3Qub24oJ291dCcsIG1lc2guc2F5KTtcblx0fSk7XG5cblx0cm9vdC5vbignYnllJywgZnVuY3Rpb24ocGVlciwgdG1wKXtcblx0XHRwZWVyID0gb3B0LnBlZXJzW3BlZXIuaWQgfHwgcGVlcl0gfHwgcGVlcjtcblx0XHR0aGlzLnRvLm5leHQocGVlcik7XG5cdFx0cGVlci5ieWU/IHBlZXIuYnllKCkgOiAodG1wID0gcGVlci53aXJlKSAmJiB0bXAuY2xvc2UgJiYgdG1wLmNsb3NlKCk7XG5cdFx0ZGVsZXRlIG9wdC5wZWVyc1twZWVyLmlkXTtcblx0XHRwZWVyLndpcmUgPSBudWxsO1xuXHR9KTtcblxuXHR2YXIgZ2V0cyA9IHt9O1xuXHRyb290Lm9uKCdieWUnLCBmdW5jdGlvbihwZWVyLCB0bXApeyB0aGlzLnRvLm5leHQocGVlcik7XG5cdFx0aWYodG1wID0gY29uc29sZS5TVEFUKXsgdG1wLnBlZXJzID0gbWVzaC5uZWFyOyB9XG5cdFx0aWYoISh0bXAgPSBwZWVyLnVybCkpeyByZXR1cm4gfSBnZXRzW3RtcF0gPSB0cnVlO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgZGVsZXRlIGdldHNbdG1wXSB9LG9wdC5sYWNrIHx8IDkwMDApO1xuXHR9KTtcblx0cm9vdC5vbignaGknLCBmdW5jdGlvbihwZWVyLCB0bXApeyB0aGlzLnRvLm5leHQocGVlcik7XG5cdFx0aWYodG1wID0gY29uc29sZS5TVEFUKXsgdG1wLnBlZXJzID0gbWVzaC5uZWFyIH1cblx0XHRpZighKHRtcCA9IHBlZXIudXJsKSB8fCAhZ2V0c1t0bXBdKXsgcmV0dXJuIH0gZGVsZXRlIGdldHNbdG1wXTtcblx0XHRpZihvcHQuc3VwZXIpeyByZXR1cm4gfSAvLyB0ZW1wb3JhcnkgKD8pIHVudGlsIHdlIGhhdmUgYmV0dGVyIGZpeC9zb2x1dGlvbj9cblx0XHRzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMocm9vdC5uZXh0KSwgZnVuY3Rpb24oc291bCl7IHZhciBub2RlID0gcm9vdC5uZXh0W3NvdWxdOyAvLyBUT0RPOiAua2V5cyggaXMgc2xvd1xuXHRcdFx0dG1wID0ge307IHRtcFtzb3VsXSA9IHJvb3QuZ3JhcGhbc291bF07IHRtcCA9IFN0cmluZy5oYXNoKHRtcCk7IC8vIFRPRE86IEJVRyEgVGhpcyBpcyBicm9rZW4uXG5cdFx0XHRtZXNoLnNheSh7JyMjJzogdG1wLCBnZXQ6IHsnIyc6IHNvdWx9fSwgcGVlcik7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiBtZXNoO1xufVxuXHQgIHZhciBlbXB0eSA9IHt9LCBvayA9IHRydWUsIHU7XG5cblx0ICB0cnl7IG1vZHVsZS5leHBvcnRzID0gTWVzaCB9Y2F0Y2goZSl7fVxuXG5cdCIsIlxudmFyIEd1biA9IHJlcXVpcmUoJy4vaW5kZXgnKTtcbkd1bi5jaGFpbi5vbiA9IGZ1bmN0aW9uKHRhZywgYXJnLCBlYXMsIGFzKXsgLy8gZG9uJ3QgcmV3cml0ZSFcblx0dmFyIGd1biA9IHRoaXMsIGNhdCA9IGd1bi5fLCByb290ID0gY2F0LnJvb3QsIGFjdCwgb2ZmLCBpZCwgdG1wO1xuXHRpZih0eXBlb2YgdGFnID09PSAnc3RyaW5nJyl7XG5cdFx0aWYoIWFyZyl7IHJldHVybiBjYXQub24odGFnKSB9XG5cdFx0YWN0ID0gY2F0Lm9uKHRhZywgYXJnLCBlYXMgfHwgY2F0LCBhcyk7XG5cdFx0aWYoZWFzICYmIGVhcy4kKXtcblx0XHRcdChlYXMuc3VicyB8fCAoZWFzLnN1YnMgPSBbXSkpLnB1c2goYWN0KTtcblx0XHR9XG5cdFx0cmV0dXJuIGd1bjtcblx0fVxuXHR2YXIgb3B0ID0gYXJnO1xuXHQob3B0ID0gKHRydWUgPT09IG9wdCk/IHtjaGFuZ2U6IHRydWV9IDogb3B0IHx8IHt9KS5ub3QgPSAxOyBvcHQub24gPSAxO1xuXHQvL29wdC5hdCA9IGNhdDtcblx0Ly9vcHQub2sgPSB0YWc7XG5cdC8vb3B0Lmxhc3QgPSB7fTtcblx0dmFyIHdhaXQgPSB7fTsgLy8gY2FuIHdlIGFzc2lnbiB0aGlzIHRvIHRoZSBhdCBpbnN0ZWFkLCBsaWtlIGluIG9uY2U/XG5cdGd1bi5nZXQodGFnLCBvcHQpO1xuXHQvKmd1bi5nZXQoZnVuY3Rpb24gb24oZGF0YSxrZXksbXNnLGV2ZSl7IHZhciAkID0gdGhpcztcblx0XHRpZih0bXAgPSByb290LmhhdGNoKXsgLy8gcXVpY2sgaGFjayFcblx0XHRcdGlmKHdhaXRbJC5fLmlkXSl7IHJldHVybiB9IHdhaXRbJC5fLmlkXSA9IDE7XG5cdFx0XHR0bXAucHVzaChmdW5jdGlvbigpe29uLmNhbGwoJCwgZGF0YSxrZXksbXNnLGV2ZSl9KTtcblx0XHRcdHJldHVybjtcblx0XHR9OyB3YWl0ID0ge307IC8vIGVuZCBxdWljayBoYWNrLlxuXHRcdHRhZy5jYWxsKCQsIGRhdGEsa2V5LG1zZyxldmUpO1xuXHR9LCBvcHQpOyAvLyBUT0RPOiBQRVJGISBFdmVudCBsaXN0ZW5lciBsZWFrISEhPyovXG5cdC8qXG5cdGZ1bmN0aW9uIG9uZShtc2csIGV2ZSl7XG5cdFx0aWYob25lLnN0dW4peyByZXR1cm4gfVxuXHRcdHZhciBhdCA9IG1zZy4kLl8sIGRhdGEgPSBhdC5wdXQsIHRtcDtcblx0XHRpZih0bXAgPSBhdC5saW5rKXsgZGF0YSA9IHJvb3QuJC5nZXQodG1wKS5fLnB1dCB9XG5cdFx0aWYob3B0Lm5vdD09PXUgJiYgdSA9PT0gZGF0YSl7IHJldHVybiB9XG5cdFx0aWYob3B0LnN0dW49PT11ICYmICh0bXAgPSByb290LnN0dW4pICYmICh0bXAgPSB0bXBbYXQuaWRdIHx8IHRtcFthdC5iYWNrLmlkXSkgJiYgIXRtcC5lbmQpeyAvLyBSZW1lbWJlciEgSWYgeW91IHBvcnQgdGhpcyBpbnRvIGAuZ2V0KGNiYCBtYWtlIHN1cmUgeW91IGFsbG93IHN0dW46MCBza2lwIG9wdGlvbiBmb3IgYC5wdXQoYC5cblx0XHRcdHRtcFtpZF0gPSBmdW5jdGlvbigpe29uZShtc2csZXZlKX07XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vdG1wID0gb25lLndhaXQgfHwgKG9uZS53YWl0ID0ge30pOyBjb25zb2xlLmxvZyh0bXBbYXQuaWRdID09PSAnJyk7IGlmKHRtcFthdC5pZF0gIT09ICcnKXsgdG1wW2F0LmlkXSA9IHRtcFthdC5pZF0gfHwgc2V0VGltZW91dChmdW5jdGlvbigpe3RtcFthdC5pZF09Jyc7b25lKG1zZyxldmUpfSwxKTsgcmV0dXJuIH0gZGVsZXRlIHRtcFthdC5pZF07XG5cdFx0Ly8gY2FsbDpcblx0XHRpZihvcHQuYXMpe1xuXHRcdFx0b3B0Lm9rLmNhbGwob3B0LmFzLCBtc2csIGV2ZSB8fCBvbmUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvcHQub2suY2FsbChhdC4kLCBkYXRhLCBtc2cuZ2V0IHx8IGF0LmdldCwgbXNnLCBldmUgfHwgb25lKTtcblx0XHR9XG5cdH07XG5cdG9uZS5hdCA9IGNhdDtcblx0KGNhdC5hY3R8fChjYXQuYWN0PXt9KSlbaWQgPSBTdHJpbmcucmFuZG9tKDcpXSA9IG9uZTtcblx0b25lLm9mZiA9IGZ1bmN0aW9uKCl7IG9uZS5zdHVuID0gMTsgaWYoIWNhdC5hY3QpeyByZXR1cm4gfSBkZWxldGUgY2F0LmFjdFtpZF0gfVxuXHRjYXQub24oJ291dCcsIHtnZXQ6IHt9fSk7Ki9cblx0cmV0dXJuIGd1bjtcbn1cbi8vIFJ1bGVzOlxuLy8gMS4gSWYgY2FjaGVkLCBzaG91bGQgYmUgZmFzdCwgYnV0IG5vdCByZWFkIHdoaWxlIHdyaXRlLlxuLy8gMi4gU2hvdWxkIG5vdCByZXRyaWdnZXIgb3RoZXIgbGlzdGVuZXJzLCBzaG91bGQgZ2V0IHRyaWdnZXJlZCBldmVuIGlmIG5vdGhpbmcgZm91bmQuXG4vLyAzLiBJZiB0aGUgc2FtZSBjYWxsYmFjayBwYXNzZWQgdG8gbWFueSBkaWZmZXJlbnQgb25jZSBjaGFpbnMsIGVhY2ggc2hvdWxkIHJlc29sdmUgLSBhbiB1bnN1YnNjcmliZSBmcm9tIHRoZSBzYW1lIGNhbGxiYWNrIHNob3VsZCBub3QgZWZmZWN0IHRoZSBzdGF0ZSBvZiB0aGUgb3RoZXIgcmVzb2x2aW5nIGNoYWlucywgaWYgeW91IGRvIHdhbnQgdG8gY2FuY2VsIHRoZW0gYWxsIGVhcmx5IHlvdSBzaG91bGQgbXV0YXRlIHRoZSBjYWxsYmFjayBpdHNlbGYgd2l0aCBhIGZsYWcgJiBjaGVjayBmb3IgaXQgYXQgdG9wIG9mIGNhbGxiYWNrXG5HdW4uY2hhaW4ub25jZSA9IGZ1bmN0aW9uKGNiLCBvcHQpeyBvcHQgPSBvcHQgfHwge307IC8vIGF2b2lkIHJld3JpdGluZ1xuXHRpZighY2IpeyByZXR1cm4gbm9uZSh0aGlzLG9wdCkgfVxuXHR2YXIgZ3VuID0gdGhpcywgY2F0ID0gZ3VuLl8sIHJvb3QgPSBjYXQucm9vdCwgZGF0YSA9IGNhdC5wdXQsIGlkID0gU3RyaW5nLnJhbmRvbSg3KSwgb25lLCB0bXA7XG5cdGd1bi5nZXQoZnVuY3Rpb24oZGF0YSxrZXksbXNnLGV2ZSl7XG5cdFx0dmFyICQgPSB0aGlzLCBhdCA9ICQuXywgb25lID0gKGF0Lm9uZXx8KGF0Lm9uZT17fSkpO1xuXHRcdGlmKGV2ZS5zdHVuKXsgcmV0dXJuIH0gaWYoJycgPT09IG9uZVtpZF0peyByZXR1cm4gfVxuXHRcdGlmKHRydWUgPT09ICh0bXAgPSBHdW4udmFsaWQoZGF0YSkpKXsgb25jZSgpOyByZXR1cm4gfVxuXHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiB0bXApeyByZXR1cm4gfSAvLyBUT0RPOiBCVUc/IFdpbGwgdGhpcyBhbHdheXMgbG9hZD9cblx0XHRjbGVhclRpbWVvdXQoKGNhdC5vbmV8fCcnKVtpZF0pOyAvLyBjbGVhciBcIm5vdCBmb3VuZFwiIHNpbmNlIHRoZXkgb25seSBnZXQgc2V0IG9uIGNhdC5cblx0XHRjbGVhclRpbWVvdXQob25lW2lkXSk7IG9uZVtpZF0gPSBzZXRUaW1lb3V0KG9uY2UsIG9wdC53YWl0fHw5OSk7IC8vIFRPRE86IEJ1Zz8gVGhpcyBkb2Vzbid0IGhhbmRsZSBwbHVyYWwgY2hhaW5zLlxuXHRcdGZ1bmN0aW9uIG9uY2UoZil7XG5cdFx0XHRpZighYXQuaGFzICYmICFhdC5zb3VsKXsgYXQgPSB7cHV0OiBkYXRhLCBnZXQ6IGtleX0gfSAvLyBoYW5kbGVzIG5vbi1jb3JlIG1lc3NhZ2VzLlxuXHRcdFx0aWYodSA9PT0gKHRtcCA9IGF0LnB1dCkpeyB0bXAgPSAoKG1zZy4kJHx8JycpLl98fCcnKS5wdXQgfVxuXHRcdFx0aWYoJ3N0cmluZycgPT0gdHlwZW9mIEd1bi52YWxpZCh0bXApKXtcblx0XHRcdFx0dG1wID0gcm9vdC4kLmdldCh0bXApLl8ucHV0O1xuXHRcdFx0XHRpZih0bXAgPT09IHUgJiYgIWYpe1xuXHRcdFx0XHRcdG9uZVtpZF0gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IG9uY2UoMSkgfSwgb3B0LndhaXR8fDk5KTsgLy8gVE9ETzogUXVpY2sgZml4LiBNYXliZSB1c2UgYWNrIGNvdW50IGZvciBtb3JlIHByZWRpY3RhYmxlIGNvbnRyb2w/XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vY29uc29sZS5sb2coXCJBTkQgVkFOSVNIRURcIiwgZGF0YSk7XG5cdFx0XHRpZihldmUuc3R1bil7IHJldHVybiB9IGlmKCcnID09PSBvbmVbaWRdKXsgcmV0dXJuIH0gb25lW2lkXSA9ICcnO1xuXHRcdFx0aWYoY2F0LnNvdWwgfHwgY2F0Lmhhcyl7IGV2ZS5vZmYoKSB9IC8vIFRPRE86IFBsdXJhbCBjaGFpbnM/IC8vIGVsc2UgeyA/Lm9mZigpIH0gLy8gYmV0dGVyIHRoYW4gb25lIGNoZWNrP1xuXHRcdFx0Y2IuY2FsbCgkLCB0bXAsIGF0LmdldCk7XG5cdFx0XHRjbGVhclRpbWVvdXQob25lW2lkXSk7IC8vIGNsZWFyIFwibm90IGZvdW5kXCIgc2luY2UgdGhleSBvbmx5IGdldCBzZXQgb24gY2F0LiAvLyBUT0RPOiBUaGlzIHdhcyBoYWNraWx5IGFkZGVkLCBpcyBpdCBuZWNlc3Nhcnkgb3IgaW1wb3J0YW50PyBQcm9iYWJseSBub3QsIGluIGZ1dHVyZSB0cnkgcmVtb3ZpbmcgdGhpcy4gV2FzIGFkZGVkIGp1c3QgYXMgYSBzYWZldHkgZm9yIHRoZSBgJiYgIWZgIGNoZWNrLlxuXHRcdH07XG5cdH0sIHtvbjogMX0pO1xuXHRyZXR1cm4gZ3VuO1xufVxuZnVuY3Rpb24gbm9uZShndW4sb3B0LGNoYWluKXtcblx0R3VuLmxvZy5vbmNlKFwidmFsb25jZVwiLCBcIkNoYWluYWJsZSB2YWwgaXMgZXhwZXJpbWVudGFsLCBpdHMgYmVoYXZpb3IgYW5kIEFQSSBtYXkgY2hhbmdlIG1vdmluZyBmb3J3YXJkLiBQbGVhc2UgcGxheSB3aXRoIGl0IGFuZCByZXBvcnQgYnVncyBhbmQgaWRlYXMgb24gaG93IHRvIGltcHJvdmUgaXQuXCIpO1xuXHQoY2hhaW4gPSBndW4uY2hhaW4oKSkuXy5uaXggPSBndW4ub25jZShmdW5jdGlvbihkYXRhLCBrZXkpeyBjaGFpbi5fLm9uKCdpbicsIHRoaXMuXykgfSk7XG5cdGNoYWluLl8ubGV4ID0gZ3VuLl8ubGV4OyAvLyBUT0RPOiBCZXR0ZXIgYXBwcm9hY2ggaW4gZnV0dXJlPyBUaGlzIGlzIHF1aWNrIGZvciBub3cuXG5cdHJldHVybiBjaGFpbjtcbn1cblxuR3VuLmNoYWluLm9mZiA9IGZ1bmN0aW9uKCl7XG5cdC8vIG1ha2Ugb2ZmIG1vcmUgYWdncmVzc2l2ZS4gV2FybmluZywgaXQgbWlnaHQgYmFja2ZpcmUhXG5cdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fLCB0bXA7XG5cdHZhciBjYXQgPSBhdC5iYWNrO1xuXHRpZighY2F0KXsgcmV0dXJuIH1cblx0YXQuYWNrID0gMDsgLy8gc28gY2FuIHJlc3Vic2NyaWJlLlxuXHRpZih0bXAgPSBjYXQubmV4dCl7XG5cdFx0aWYodG1wW2F0LmdldF0pe1xuXHRcdFx0ZGVsZXRlIHRtcFthdC5nZXRdO1xuXHRcdH0gZWxzZSB7XG5cblx0XHR9XG5cdH1cblx0Ly8gVE9ETzogZGVsZXRlIGNhdC5vbmVbbWFwLmlkXT9cblx0aWYodG1wID0gY2F0LmFzayl7XG5cdFx0ZGVsZXRlIHRtcFthdC5nZXRdO1xuXHR9XG5cdGlmKHRtcCA9IGNhdC5wdXQpe1xuXHRcdGRlbGV0ZSB0bXBbYXQuZ2V0XTtcblx0fVxuXHRpZih0bXAgPSBhdC5zb3VsKXtcblx0XHRkZWxldGUgY2F0LnJvb3QuZ3JhcGhbdG1wXTtcblx0fVxuXHRpZih0bXAgPSBhdC5tYXApe1xuXHRcdE9iamVjdC5rZXlzKHRtcCkuZm9yRWFjaChmdW5jdGlvbihpLGF0KXsgYXQgPSB0bXBbaV07IC8vb2JqX21hcCh0bXAsIGZ1bmN0aW9uKGF0KXtcblx0XHRcdGlmKGF0Lmxpbmspe1xuXHRcdFx0XHRjYXQucm9vdC4kLmdldChhdC5saW5rKS5vZmYoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRpZih0bXAgPSBhdC5uZXh0KXtcblx0XHRPYmplY3Qua2V5cyh0bXApLmZvckVhY2goZnVuY3Rpb24oaSxuZWF0KXsgbmVhdCA9IHRtcFtpXTsgLy9vYmpfbWFwKHRtcCwgZnVuY3Rpb24obmVhdCl7XG5cdFx0XHRuZWF0LiQub2ZmKCk7XG5cdFx0fSk7XG5cdH1cblx0YXQub24oJ29mZicsIHt9KTtcblx0cmV0dXJuIGd1bjtcbn1cbnZhciBlbXB0eSA9IHt9LCBub29wID0gZnVuY3Rpb24oKXt9LCB1O1xuXHQiLCJcbi8vIE9uIGV2ZW50IGVtaXR0ZXIgZ2VuZXJpYyBqYXZhc2NyaXB0IHV0aWxpdHkuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG9udG8odGFnLCBhcmcsIGFzKXtcblx0aWYoIXRhZyl7IHJldHVybiB7dG86IG9udG99IH1cblx0dmFyIHUsIGYgPSAnZnVuY3Rpb24nID09IHR5cGVvZiBhcmcsIHRhZyA9ICh0aGlzLnRhZyB8fCAodGhpcy50YWcgPSB7fSkpW3RhZ10gfHwgZiAmJiAoXG5cdFx0dGhpcy50YWdbdGFnXSA9IHt0YWc6IHRhZywgdG86IG9udG8uXyA9IHsgbmV4dDogZnVuY3Rpb24oYXJnKXsgdmFyIHRtcDtcblx0XHRcdGlmKHRtcCA9IHRoaXMudG8peyB0bXAubmV4dChhcmcpIH1cblx0fX19KTtcblx0aWYoZil7XG5cdFx0dmFyIGJlID0ge1xuXHRcdFx0b2ZmOiBvbnRvLm9mZiB8fFxuXHRcdFx0KG9udG8ub2ZmID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0aWYodGhpcy5uZXh0ID09PSBvbnRvLl8ubmV4dCl7IHJldHVybiAhMCB9XG5cdFx0XHRcdGlmKHRoaXMgPT09IHRoaXMudGhlLmxhc3Qpe1xuXHRcdFx0XHRcdHRoaXMudGhlLmxhc3QgPSB0aGlzLmJhY2s7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy50by5iYWNrID0gdGhpcy5iYWNrO1xuXHRcdFx0XHR0aGlzLm5leHQgPSBvbnRvLl8ubmV4dDtcblx0XHRcdFx0dGhpcy5iYWNrLnRvID0gdGhpcy50bztcblx0XHRcdFx0aWYodGhpcy50aGUubGFzdCA9PT0gdGhpcy50aGUpe1xuXHRcdFx0XHRcdGRlbGV0ZSB0aGlzLm9uLnRhZ1t0aGlzLnRoZS50YWddO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSxcblx0XHRcdHRvOiBvbnRvLl8sXG5cdFx0XHRuZXh0OiBhcmcsXG5cdFx0XHR0aGU6IHRhZyxcblx0XHRcdG9uOiB0aGlzLFxuXHRcdFx0YXM6IGFzLFxuXHRcdH07XG5cdFx0KGJlLmJhY2sgPSB0YWcubGFzdCB8fCB0YWcpLnRvID0gYmU7XG5cdFx0cmV0dXJuIHRhZy5sYXN0ID0gYmU7XG5cdH1cblx0aWYoKHRhZyA9IHRhZy50bykgJiYgdSAhPT0gYXJnKXsgdGFnLm5leHQoYXJnKSB9XG5cdHJldHVybiB0YWc7XG59O1xuXHQiLCJcbnZhciBHdW4gPSByZXF1aXJlKCcuL3Jvb3QnKTtcbkd1bi5jaGFpbi5wdXQgPSBmdW5jdGlvbihkYXRhLCBjYiwgYXMpeyAvLyBJIHJld3JvdGUgaXQgOilcblx0dmFyIGd1biA9IHRoaXMsIGF0ID0gZ3VuLl8sIHJvb3QgPSBhdC5yb290O1xuXHRhcyA9IGFzIHx8IHt9O1xuXHRhcy5yb290ID0gYXQucm9vdDtcblx0YXMucnVuIHx8IChhcy5ydW4gPSByb290Lm9uY2UpO1xuXHRzdHVuKGFzLCBhdC5pZCk7IC8vIHNldCBhIGZsYWcgZm9yIHJlYWRzIHRvIGNoZWNrIGlmIHRoaXMgY2hhaW4gaXMgd3JpdGluZy5cblx0YXMuYWNrID0gYXMuYWNrIHx8IGNiO1xuXHRhcy52aWEgPSBhcy52aWEgfHwgZ3VuO1xuXHRhcy5kYXRhID0gYXMuZGF0YSB8fCBkYXRhO1xuXHRhcy5zb3VsIHx8IChhcy5zb3VsID0gYXQuc291bCB8fCAoJ3N0cmluZycgPT0gdHlwZW9mIGNiICYmIGNiKSk7XG5cdHZhciBzID0gYXMuc3RhdGUgPSBhcy5zdGF0ZSB8fCBHdW4uc3RhdGUoKTtcblx0aWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSl7IGRhdGEoZnVuY3Rpb24oZCl7IGFzLmRhdGEgPSBkOyBndW4ucHV0KHUsdSxhcykgfSk7IHJldHVybiBndW4gfVxuXHRpZighYXMuc291bCl7IHJldHVybiBnZXQoYXMpLCBndW4gfVxuXHRhcy4kID0gcm9vdC4kLmdldChhcy5zb3VsKTsgLy8gVE9ETzogVGhpcyBtYXkgbm90IGFsbG93IHVzZXIgY2hhaW5pbmcgYW5kIHNpbWlsYXI/XG5cdGFzLnRvZG8gPSBbe2l0OiBhcy5kYXRhLCByZWY6IGFzLiR9XTtcblx0YXMudHVybiA9IGFzLnR1cm4gfHwgdHVybjtcblx0YXMucmFuID0gYXMucmFuIHx8IHJhbjtcblx0Ly92YXIgcGF0aCA9IFtdOyBhcy52aWEuYmFjayhhdCA9PiB7IGF0LmdldCAmJiBwYXRoLnB1c2goYXQuZ2V0LnNsaWNlKDAsOSkpIH0pOyBwYXRoID0gcGF0aC5yZXZlcnNlKCkuam9pbignLicpO1xuXHQvLyBUT0RPOiBQZXJmISBXZSBvbmx5IG5lZWQgdG8gc3R1biBjaGFpbnMgdGhhdCBhcmUgYmVpbmcgbW9kaWZpZWQsIG5vdCBuZWNlc3NhcmlseSB3cml0dGVuIHRvLlxuXHQoZnVuY3Rpb24gd2Fsaygpe1xuXHRcdHZhciB0byA9IGFzLnRvZG8sIGF0ID0gdG8ucG9wKCksIGQgPSBhdC5pdCwgY2lkID0gYXQucmVmICYmIGF0LnJlZi5fLmlkLCB2LCBrLCBjYXQsIHRtcCwgZztcblx0XHRzdHVuKGFzLCBhdC5yZWYpO1xuXHRcdGlmKHRtcCA9IGF0LnRvZG8pe1xuXHRcdFx0ayA9IHRtcC5wb3AoKTsgZCA9IGRba107XG5cdFx0XHRpZih0bXAubGVuZ3RoKXsgdG8ucHVzaChhdCkgfVxuXHRcdH1cblx0XHRrICYmICh0by5wYXRoIHx8ICh0by5wYXRoID0gW10pKS5wdXNoKGspO1xuXHRcdGlmKCEodiA9IHZhbGlkKGQpKSAmJiAhKGcgPSBHdW4uaXMoZCkpKXtcblx0XHRcdGlmKCFPYmplY3QucGxhaW4oZCkpeyByYW4uZXJyKGFzLCBcIkludmFsaWQgZGF0YTogXCIrIGNoZWNrKGQpICtcIiBhdCBcIiArIChhcy52aWEuYmFjayhmdW5jdGlvbihhdCl7YXQuZ2V0ICYmIHRtcC5wdXNoKGF0LmdldCl9LCB0bXAgPSBbXSkgfHwgdG1wLmpvaW4oJy4nKSkrJy4nKyh0by5wYXRofHxbXSkuam9pbignLicpKTsgcmV0dXJuIH1cblx0XHRcdHZhciBzZWVuID0gYXMuc2VlbiB8fCAoYXMuc2VlbiA9IFtdKSwgaSA9IHNlZW4ubGVuZ3RoO1xuXHRcdFx0d2hpbGUoaS0tKXsgaWYoZCA9PT0gKHRtcCA9IHNlZW5baV0pLml0KXsgdiA9IGQgPSB0bXAubGluazsgYnJlYWsgfSB9XG5cdFx0fVxuXHRcdGlmKGsgJiYgdil7IGF0Lm5vZGUgPSBzdGF0ZV9pZnkoYXQubm9kZSwgaywgcywgZCkgfSAvLyBoYW5kbGUgc291bCBsYXRlci5cblx0XHRlbHNlIHtcblx0XHRcdGlmKCFhcy5zZWVuKXsgcmFuLmVycihhcywgXCJEYXRhIGF0IHJvb3Qgb2YgZ3JhcGggbXVzdCBiZSBhIG5vZGUgKGFuIG9iamVjdCkuXCIpOyByZXR1cm4gfVxuXHRcdFx0YXMuc2Vlbi5wdXNoKGNhdCA9IHtpdDogZCwgbGluazoge30sIHRvZG86IGc/IFtdIDogT2JqZWN0LmtleXMoZCkuc29ydCgpLnJldmVyc2UoKSwgcGF0aDogKHRvLnBhdGh8fFtdKS5zbGljZSgpLCB1cDogYXR9KTsgLy8gQW55IHBlcmYgcmVhc29ucyB0byBDUFUgc2NoZWR1bGUgdGhpcyAua2V5cyggP1xuXHRcdFx0YXQubm9kZSA9IHN0YXRlX2lmeShhdC5ub2RlLCBrLCBzLCBjYXQubGluayk7XG5cdFx0XHQhZyAmJiBjYXQudG9kby5sZW5ndGggJiYgdG8ucHVzaChjYXQpO1xuXHRcdFx0Ly8gLS0tLS0tLS0tLS0tLS0tXG5cdFx0XHR2YXIgaWQgPSBhcy5zZWVuLmxlbmd0aDtcblx0XHRcdChhcy53YWl0IHx8IChhcy53YWl0ID0ge30pKVtpZF0gPSAnJztcblx0XHRcdHRtcCA9IChjYXQucmVmID0gKGc/IGQgOiBrPyBhdC5yZWYuZ2V0KGspIDogYXQucmVmKSkuXztcblx0XHRcdCh0bXAgPSAoZCAmJiAoZC5ffHwnJylbJyMnXSkgfHwgdG1wLnNvdWwgfHwgdG1wLmxpbmspPyByZXNvbHZlKHtzb3VsOiB0bXB9KSA6IGNhdC5yZWYuZ2V0KHJlc29sdmUsIHtydW46IGFzLnJ1biwgLypoYXRjaDogMCwqLyB2MjAyMDoxLCBvdXQ6e2dldDp7Jy4nOicgJ319fSk7IC8vIFRPRE86IEJVRyEgVGhpcyBzaG91bGQgYmUgcmVzb2x2ZSBPTkxZIHNvdWwgdG8gcHJldmVudCBmdWxsIGRhdGEgZnJvbSBiZWluZyBsb2FkZWQuIC8vIEZpeGVkIG5vdz9cblx0XHRcdC8vc2V0VGltZW91dChmdW5jdGlvbigpeyBpZihGKXsgcmV0dXJuIH0gY29uc29sZS5sb2coXCJJIEhBVkUgTk9UIEJFRU4gQ0FMTEVEIVwiLCBwYXRoLCBpZCwgY2F0LnJlZi5fLmlkLCBrKSB9LCA5MDAwKTsgdmFyIEY7IC8vIE1BS0UgU1VSRSBUTyBBREQgRiA9IDEgYmVsb3chXG5cdFx0XHRmdW5jdGlvbiByZXNvbHZlKG1zZywgZXZlKXtcblx0XHRcdFx0dmFyIGVuZCA9IGNhdC5saW5rWycjJ107XG5cdFx0XHRcdGlmKGV2ZSl7IGV2ZS5vZmYoKTsgZXZlLnJpZChtc2cpIH0gLy8gVE9ETzogVG9vIGVhcmx5ISBDaGVjayBhbGwgcGVlcnMgYWNrIG5vdCBmb3VuZC5cblx0XHRcdFx0Ly8gVE9ETzogQlVHIG1heWJlPyBNYWtlIHN1cmUgdGhpcyBkb2VzIG5vdCBwaWNrIHVwIGEgbGluayBjaGFuZ2Ugd2lwZSwgdGhhdCBpdCB1c2VzIHRoZSBjaGFuZ2lnbiBsaW5rIGluc3RlYWQuXG5cdFx0XHRcdHZhciBzb3VsID0gZW5kIHx8IG1zZy5zb3VsIHx8ICh0bXAgPSAobXNnLiQkfHxtc2cuJCkuX3x8JycpLnNvdWwgfHwgdG1wLmxpbmsgfHwgKCh0bXAgPSB0bXAucHV0fHwnJykuX3x8JycpWycjJ10gfHwgdG1wWycjJ10gfHwgKCgodG1wID0gbXNnLnB1dHx8JycpICYmIG1zZy4kJCk/IHRtcFsnIyddIDogKHRtcFsnPSddfHx0bXBbJzonXXx8JycpWycjJ10pO1xuXHRcdFx0XHQhZW5kICYmIHN0dW4oYXMsIG1zZy4kKTtcblx0XHRcdFx0aWYoIXNvdWwgJiYgIWF0LmxpbmtbJyMnXSl7IC8vIGNoZWNrIHNvdWwgbGluayBhYm92ZSB1c1xuXHRcdFx0XHRcdChhdC53YWl0IHx8IChhdC53YWl0ID0gW10pKS5wdXNoKGZ1bmN0aW9uKCl7IHJlc29sdmUobXNnLCBldmUpIH0pIC8vIHdhaXRcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoIXNvdWwpe1xuXHRcdFx0XHRcdHNvdWwgPSBbXTtcblx0XHRcdFx0XHQobXNnLiQkfHxtc2cuJCkuYmFjayhmdW5jdGlvbihhdCl7XG5cdFx0XHRcdFx0XHRpZih0bXAgPSBhdC5zb3VsIHx8IGF0LmxpbmspeyByZXR1cm4gc291bC5wdXNoKHRtcCkgfVxuXHRcdFx0XHRcdFx0c291bC5wdXNoKGF0LmdldCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0c291bCA9IHNvdWwucmV2ZXJzZSgpLmpvaW4oJy8nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXQubGlua1snIyddID0gc291bDtcblx0XHRcdFx0IWcgJiYgKCgoYXMuZ3JhcGggfHwgKGFzLmdyYXBoID0ge30pKVtzb3VsXSA9IChjYXQubm9kZSB8fCAoY2F0Lm5vZGUgPSB7Xzp7fX0pKSkuX1snIyddID0gc291bCk7XG5cdFx0XHRcdGRlbGV0ZSBhcy53YWl0W2lkXTtcblx0XHRcdFx0Y2F0LndhaXQgJiYgc2V0VGltZW91dC5lYWNoKGNhdC53YWl0LCBmdW5jdGlvbihjYil7IGNiICYmIGNiKCkgfSk7XG5cdFx0XHRcdGFzLnJhbihhcyk7XG5cdFx0XHR9O1xuXHRcdFx0Ly8gLS0tLS0tLS0tLS0tLS0tXG5cdFx0fVxuXHRcdGlmKCF0by5sZW5ndGgpeyByZXR1cm4gYXMucmFuKGFzKSB9XG5cdFx0YXMudHVybih3YWxrKTtcblx0fSgpKTtcblx0cmV0dXJuIGd1bjtcbn1cblxuZnVuY3Rpb24gc3R1bihhcywgaWQpe1xuXHRpZighaWQpeyByZXR1cm4gfSBpZCA9IChpZC5ffHwnJykuaWR8fGlkO1xuXHR2YXIgcnVuID0gYXMucm9vdC5zdHVuIHx8IChhcy5yb290LnN0dW4gPSB7b246IEd1bi5vbn0pLCB0ZXN0ID0ge30sIHRtcDtcblx0YXMuc3R1biB8fCAoYXMuc3R1biA9IHJ1bi5vbignc3R1bicsIGZ1bmN0aW9uKCl7IH0pKTtcblx0aWYodG1wID0gcnVuLm9uKCcnK2lkKSl7IHRtcC50aGUubGFzdC5uZXh0KHRlc3QpIH1cblx0aWYodGVzdC5ydW4gPj0gYXMucnVuKXsgcmV0dXJuIH1cblx0cnVuLm9uKCcnK2lkLCBmdW5jdGlvbih0ZXN0KXtcblx0XHRpZihhcy5zdHVuLmVuZCl7XG5cdFx0XHR0aGlzLm9mZigpO1xuXHRcdFx0dGhpcy50by5uZXh0KHRlc3QpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0ZXN0LnJ1biA9IHRlc3QucnVuIHx8IGFzLnJ1bjtcblx0XHR0ZXN0LnN0dW4gPSB0ZXN0LnN0dW4gfHwgYXMuc3R1bjsgcmV0dXJuO1xuXHRcdGlmKHRoaXMudG8udG8pe1xuXHRcdFx0dGhpcy50aGUubGFzdC5uZXh0KHRlc3QpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0ZXN0LnN0dW4gPSBhcy5zdHVuO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gcmFuKGFzKXtcblx0aWYoYXMuZXJyKXsgcmFuLmVuZChhcy5zdHVuLCBhcy5yb290KTsgcmV0dXJuIH0gLy8gbW92ZSBsb2cgaGFuZGxlIGhlcmUuXG5cdGlmKGFzLnRvZG8ubGVuZ3RoIHx8IGFzLmVuZCB8fCAhT2JqZWN0LmVtcHR5KGFzLndhaXQpKXsgcmV0dXJuIH0gYXMuZW5kID0gMTtcblx0Ly8oYXMucmV0cnkgPSBmdW5jdGlvbigpeyBhcy5hY2tzID0gMDtcblx0dmFyIGNhdCA9IChhcy4kLmJhY2soLTEpLl8pLCByb290ID0gY2F0LnJvb3QsIGFzayA9IGNhdC5hc2soZnVuY3Rpb24oYWNrKXtcblx0XHRyb290Lm9uKCdhY2snLCBhY2spO1xuXHRcdGlmKGFjay5lcnIgJiYgIWFjay5sYWNrKXsgR3VuLmxvZyhhY2spIH1cblx0XHRpZigrK2Fja3MgPiAoYXMuYWNrcyB8fCAwKSl7IHRoaXMub2ZmKCkgfSAvLyBBZGp1c3RhYmxlIEFDS3MhIE9ubHkgMSBieSBkZWZhdWx0LlxuXHRcdGlmKCFhcy5hY2speyByZXR1cm4gfVxuXHRcdGFzLmFjayhhY2ssIHRoaXMpO1xuXHR9LCBhcy5vcHQpLCBhY2tzID0gMCwgc3R1biA9IGFzLnN0dW4sIHRtcDtcblx0KHRtcCA9IGZ1bmN0aW9uKCl7IC8vIHRoaXMgaXMgbm90IG9mZmljaWFsIHlldCwgYnV0IHF1aWNrIHNvbHV0aW9uIHRvIGhhY2sgaW4gZm9yIG5vdy5cblx0XHRpZighc3R1bil7IHJldHVybiB9XG5cdFx0cmFuLmVuZChzdHVuLCByb290KTtcblx0XHRzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMoc3R1biA9IHN0dW4uYWRkfHwnJyksIGZ1bmN0aW9uKGNiKXsgaWYoY2IgPSBzdHVuW2NiXSl7Y2IoKX0gfSk7IC8vIHJlc3VtZSB0aGUgc3R1bm5lZCByZWFkcyAvLyBBbnkgcGVyZiByZWFzb25zIHRvIENQVSBzY2hlZHVsZSB0aGlzIC5rZXlzKCA/XG5cdH0pLmhhdGNoID0gdG1wOyAvLyB0aGlzIGlzIG5vdCBvZmZpY2lhbCB5ZXQgXlxuXHQvL2NvbnNvbGUubG9nKDEsIFwiUFVUXCIsIGFzLnJ1biwgYXMuZ3JhcGgpO1xuXHRpZihhcy5hY2sgJiYgIWFzLm9rKXsgYXMub2sgPSBhcy5hY2tzIHx8IDkgfSAvLyBUT0RPOiBJbiBmdXR1cmUhIFJlbW92ZSB0aGlzISBUaGlzIGlzIGp1c3Qgb2xkIEFQSSBzdXBwb3J0LlxuXHQoYXMudmlhLl8pLm9uKCdvdXQnLCB7cHV0OiBhcy5vdXQgPSBhcy5ncmFwaCwgb2s6IGFzLm9rICYmIHsnQCc6IGFzLm9rKzF9LCBvcHQ6IGFzLm9wdCwgJyMnOiBhc2ssIF86IHRtcH0pO1xuXHQvL30pKCk7XG59OyByYW4uZW5kID0gZnVuY3Rpb24oc3R1bixyb290KXtcblx0c3R1bi5lbmQgPSBub29wOyAvLyBsaWtlIHdpdGggdGhlIGVhcmxpZXIgaWQsIGNoZWFwZXIgdG8gbWFrZSB0aGlzIGZsYWcgYSBmdW5jdGlvbiBzbyBiZWxvdyBjYWxsYmFja3MgZG8gbm90IGhhdmUgdG8gZG8gYW4gZXh0cmEgdHlwZSBjaGVjay5cblx0aWYoc3R1bi50aGUudG8gPT09IHN0dW4gJiYgc3R1biA9PT0gc3R1bi50aGUubGFzdCl7IGRlbGV0ZSByb290LnN0dW4gfVxuXHRzdHVuLm9mZigpO1xufTsgcmFuLmVyciA9IGZ1bmN0aW9uKGFzLCBlcnIpe1xuXHQoYXMuYWNrfHxub29wKS5jYWxsKGFzLCBhcy5vdXQgPSB7IGVycjogYXMuZXJyID0gR3VuLmxvZyhlcnIpIH0pO1xuXHRhcy5yYW4oYXMpO1xufVxuXG5mdW5jdGlvbiBnZXQoYXMpe1xuXHR2YXIgYXQgPSBhcy52aWEuXywgdG1wO1xuXHRhcy52aWEgPSBhcy52aWEuYmFjayhmdW5jdGlvbihhdCl7XG5cdFx0aWYoYXQuc291bCB8fCAhYXQuZ2V0KXsgcmV0dXJuIGF0LiQgfVxuXHRcdHRtcCA9IGFzLmRhdGE7IChhcy5kYXRhID0ge30pW2F0LmdldF0gPSB0bXA7XG5cdH0pO1xuXHRpZighYXMudmlhIHx8ICFhcy52aWEuXy5zb3VsKXtcblx0XHRhcy52aWEgPSBhdC5yb290LiQuZ2V0KCgoYXMuZGF0YXx8JycpLl98fCcnKVsnIyddIHx8IGF0LiQuYmFjaygnb3B0LnV1aWQnKSgpKVxuXHR9XG5cdGFzLnZpYS5wdXQoYXMuZGF0YSwgYXMuYWNrLCBhcyk7XG5cdFxuXG5cdHJldHVybjtcblx0aWYoYXQuZ2V0ICYmIGF0LmJhY2suc291bCl7XG5cdFx0dG1wID0gYXMuZGF0YTtcblx0XHRhcy52aWEgPSBhdC5iYWNrLiQ7XG5cdFx0KGFzLmRhdGEgPSB7fSlbYXQuZ2V0XSA9IHRtcDsgXG5cdFx0YXMudmlhLnB1dChhcy5kYXRhLCBhcy5hY2ssIGFzKTtcblx0XHRyZXR1cm47XG5cdH1cbn1cbmZ1bmN0aW9uIGNoZWNrKGQsIHRtcCl7IHJldHVybiAoKGQgJiYgKHRtcCA9IGQuY29uc3RydWN0b3IpICYmIHRtcC5uYW1lKSB8fCB0eXBlb2YgZCkgfVxuXG52YXIgdSwgZW1wdHkgPSB7fSwgbm9vcCA9IGZ1bmN0aW9uKCl7fSwgdHVybiA9IHNldFRpbWVvdXQudHVybiwgdmFsaWQgPSBHdW4udmFsaWQsIHN0YXRlX2lmeSA9IEd1bi5zdGF0ZS5pZnk7XG52YXIgaWlmZSA9IGZ1bmN0aW9uKGZuLGFzKXtmbi5jYWxsKGFzfHxlbXB0eSl9XG5cdCIsIlxuXG5mdW5jdGlvbiBHdW4obyl7XG5cdGlmKG8gaW5zdGFuY2VvZiBHdW4peyByZXR1cm4gKHRoaXMuXyA9IHskOiB0aGlzfSkuJCB9XG5cdGlmKCEodGhpcyBpbnN0YW5jZW9mIEd1bikpeyByZXR1cm4gbmV3IEd1bihvKSB9XG5cdHJldHVybiBHdW4uY3JlYXRlKHRoaXMuXyA9IHskOiB0aGlzLCBvcHQ6IG99KTtcbn1cblxuR3VuLmlzID0gZnVuY3Rpb24oJCl7IHJldHVybiAoJCBpbnN0YW5jZW9mIEd1bikgfHwgKCQgJiYgJC5fICYmICgkID09PSAkLl8uJCkpIHx8IGZhbHNlIH1cblxuR3VuLnZlcnNpb24gPSAwLjIwMjA7XG5cbkd1bi5jaGFpbiA9IEd1bi5wcm90b3R5cGU7XG5HdW4uY2hhaW4udG9KU09OID0gZnVuY3Rpb24oKXt9O1xuXG5yZXF1aXJlKCcuL3NoaW0nKTtcbkd1bi52YWxpZCA9IHJlcXVpcmUoJy4vdmFsaWQnKTtcbkd1bi5zdGF0ZSA9IHJlcXVpcmUoJy4vc3RhdGUnKTtcbkd1bi5vbiA9IHJlcXVpcmUoJy4vb250bycpO1xuR3VuLmR1cCA9IHJlcXVpcmUoJy4vZHVwJyk7XG5HdW4uYXNrID0gcmVxdWlyZSgnLi9hc2snKTtcblxuOyhmdW5jdGlvbigpe1xuXHRHdW4uY3JlYXRlID0gZnVuY3Rpb24oYXQpe1xuXHRcdGF0LnJvb3QgPSBhdC5yb290IHx8IGF0O1xuXHRcdGF0LmdyYXBoID0gYXQuZ3JhcGggfHwge307XG5cdFx0YXQub24gPSBhdC5vbiB8fCBHdW4ub247XG5cdFx0YXQuYXNrID0gYXQuYXNrIHx8IEd1bi5hc2s7XG5cdFx0YXQuZHVwID0gYXQuZHVwIHx8IEd1bi5kdXAoKTtcblx0XHR2YXIgZ3VuID0gYXQuJC5vcHQoYXQub3B0KTtcblx0XHRpZighYXQub25jZSl7XG5cdFx0XHRhdC5vbignaW4nLCB1bml2ZXJzZSwgYXQpO1xuXHRcdFx0YXQub24oJ291dCcsIHVuaXZlcnNlLCBhdCk7XG5cdFx0XHRhdC5vbigncHV0JywgbWFwLCBhdCk7XG5cdFx0XHRHdW4ub24oJ2NyZWF0ZScsIGF0KTtcblx0XHRcdGF0Lm9uKCdjcmVhdGUnLCBhdCk7XG5cdFx0fVxuXHRcdGF0Lm9uY2UgPSAxO1xuXHRcdHJldHVybiBndW47XG5cdH1cblx0ZnVuY3Rpb24gdW5pdmVyc2UobXNnKXtcblx0XHQvLyBUT0RPOiBCVUchIG1zZy5vdXQgPSBudWxsIGJlaW5nIHNldCFcblx0XHQvL2lmKCFGKXsgdmFyIGV2ZSA9IHRoaXM7IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgdW5pdmVyc2UuY2FsbChldmUsIG1zZywxKSB9LE1hdGgucmFuZG9tKCkgKiAxMDApO3JldHVybjsgfSAvLyBBREQgRiBUTyBQQVJBTVMhXG5cdFx0aWYoIW1zZyl7IHJldHVybiB9XG5cdFx0aWYobXNnLm91dCA9PT0gdW5pdmVyc2UpeyB0aGlzLnRvLm5leHQobXNnKTsgcmV0dXJuIH1cblx0XHR2YXIgZXZlID0gdGhpcywgYXMgPSBldmUuYXMsIGF0ID0gYXMuYXQgfHwgYXMsIGd1biA9IGF0LiQsIGR1cCA9IGF0LmR1cCwgdG1wLCBEQkcgPSBtc2cuREJHO1xuXHRcdCh0bXAgPSBtc2dbJyMnXSkgfHwgKHRtcCA9IG1zZ1snIyddID0gdGV4dF9yYW5kKDkpKTtcblx0XHRpZihkdXAuY2hlY2sodG1wKSl7IHJldHVybiB9IGR1cC50cmFjayh0bXApO1xuXHRcdHRtcCA9IG1zZy5fOyBtc2cuXyA9ICgnZnVuY3Rpb24nID09IHR5cGVvZiB0bXApPyB0bXAgOiBmdW5jdGlvbigpe307XG5cdFx0KG1zZy4kICYmIChtc2cuJCA9PT0gKG1zZy4kLl98fCcnKS4kKSkgfHwgKG1zZy4kID0gZ3VuKTtcblx0XHRpZihtc2dbJ0AnXSAmJiAhbXNnLnB1dCl7IGFjayhtc2cpIH1cblx0XHRpZighYXQuYXNrKG1zZ1snQCddLCBtc2cpKXsgLy8gaXMgdGhpcyBtYWNoaW5lIGxpc3RlbmluZyBmb3IgYW4gYWNrP1xuXHRcdFx0REJHICYmIChEQkcudSA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRpZihtc2cucHV0KXsgcHV0KG1zZyk7IHJldHVybiB9IGVsc2Vcblx0XHRcdGlmKG1zZy5nZXQpeyBHdW4ub24uZ2V0KG1zZywgZ3VuKSB9XG5cdFx0fVxuXHRcdERCRyAmJiAoREJHLnVjID0gK25ldyBEYXRlKTtcblx0XHRldmUudG8ubmV4dChtc2cpO1xuXHRcdERCRyAmJiAoREJHLnVhID0gK25ldyBEYXRlKTtcblx0XHRpZihtc2cubnRzIHx8IG1zZy5OVFMpeyByZXR1cm4gfSAvLyBUT0RPOiBUaGlzIHNob3VsZG4ndCBiZSBpbiBjb3JlLCBidXQgZmFzdCB3YXkgdG8gcHJldmVudCBOVFMgc3ByZWFkLiBEZWxldGUgdGhpcyBsaW5lIGFmdGVyIGFsbCBwZWVycyBoYXZlIHVwZ3JhZGVkIHRvIG5ld2VyIHZlcnNpb25zLlxuXHRcdG1zZy5vdXQgPSB1bml2ZXJzZTsgYXQub24oJ291dCcsIG1zZyk7XG5cdFx0REJHICYmIChEQkcudWUgPSArbmV3IERhdGUpO1xuXHR9XG5cdGZ1bmN0aW9uIHB1dChtc2cpe1xuXHRcdGlmKCFtc2cpeyByZXR1cm4gfVxuXHRcdHZhciBjdHggPSBtc2cuX3x8JycsIHJvb3QgPSBjdHgucm9vdCA9ICgoY3R4LiQgPSBtc2cuJHx8JycpLl98fCcnKS5yb290O1xuXHRcdGlmKG1zZ1snQCddICYmIGN0eC5mYWl0aCAmJiAhY3R4Lm1pc3MpeyAvLyBUT0RPOiBBWEUgbWF5IHNwbGl0L3JvdXRlIGJhc2VkIG9uICdwdXQnIHdoYXQgc2hvdWxkIHdlIGRvIGhlcmU/IERldGVjdCBAIGluIEFYRT8gSSB0aGluayB3ZSBkb24ndCBoYXZlIHRvIHdvcnJ5LCBhcyBEQU0gd2lsbCByb3V0ZSBpdCBvbiBALlxuXHRcdFx0bXNnLm91dCA9IHVuaXZlcnNlO1xuXHRcdFx0cm9vdC5vbignb3V0JywgbXNnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y3R4LmxhdGNoID0gcm9vdC5oYXRjaDsgY3R4Lm1hdGNoID0gcm9vdC5oYXRjaCA9IFtdO1xuXHRcdHZhciBwdXQgPSBtc2cucHV0O1xuXHRcdHZhciBEQkcgPSBjdHguREJHID0gbXNnLkRCRywgUyA9ICtuZXcgRGF0ZTsgQ1QgPSBDVCB8fCBTO1xuXHRcdGlmKHB1dFsnIyddICYmIHB1dFsnLiddKXsgLypyb290ICYmIHJvb3Qub24oJ3B1dCcsIG1zZyk7Ki8gcmV0dXJuIH0gLy8gVE9ETzogQlVHISBUaGlzIG5lZWRzIHRvIGNhbGwgSEFNIGluc3RlYWQuXG5cdFx0REJHICYmIChEQkcucCA9IFMpO1xuXHRcdGN0eFsnIyddID0gbXNnWycjJ107XG5cdFx0Y3R4Lm1zZyA9IG1zZztcblx0XHRjdHguYWxsID0gMDtcblx0XHRjdHguc3R1biA9IDE7XG5cdFx0dmFyIG5sID0gT2JqZWN0LmtleXMocHV0KTsvLy5zb3J0KCk7IC8vIFRPRE86IFRoaXMgaXMgdW5ib3VuZGVkIG9wZXJhdGlvbiwgbGFyZ2UgZ3JhcGhzIHdpbGwgYmUgc2xvd2VyLiBXcml0ZSBvdXIgb3duIENQVSBzY2hlZHVsZWQgc29ydD8gT3Igc29tZWhvdyBkbyBpdCBpbiBiZWxvdz8gS2V5cyBpdHNlbGYgaXMgbm90IE8oMSkgZWl0aGVyLCBjcmVhdGUgRVM1IHNoaW0gb3ZlciA/d2VhayBtYXA/IG9yIGN1c3RvbSB3aGljaCBpcyBjb25zdGFudC5cblx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICgoREJHfHxjdHgpLnBrID0gK25ldyBEYXRlKSAtIFMsICdwdXQgc29ydCcpO1xuXHRcdHZhciBuaSA9IDAsIG5qLCBrbCwgc291bCwgbm9kZSwgc3RhdGVzLCBlcnIsIHRtcDtcblx0XHQoZnVuY3Rpb24gcG9wKG8pe1xuXHRcdFx0aWYobmogIT0gbmkpeyBuaiA9IG5pO1xuXHRcdFx0XHRpZighKHNvdWwgPSBubFtuaV0pKXtcblx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICgoREJHfHxjdHgpLnBkID0gK25ldyBEYXRlKSAtIFMsICdwdXQnKTtcblx0XHRcdFx0XHRmaXJlKGN0eCk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCEobm9kZSA9IHB1dFtzb3VsXSkpeyBlcnIgPSBFUlIrY3V0KHNvdWwpK1wibm8gbm9kZS5cIiB9IGVsc2Vcblx0XHRcdFx0aWYoISh0bXAgPSBub2RlLl8pKXsgZXJyID0gRVJSK2N1dChzb3VsKStcIm5vIG1ldGEuXCIgfSBlbHNlXG5cdFx0XHRcdGlmKHNvdWwgIT09IHRtcFsnIyddKXsgZXJyID0gRVJSK2N1dChzb3VsKStcInNvdWwgbm90IHNhbWUuXCIgfSBlbHNlXG5cdFx0XHRcdGlmKCEoc3RhdGVzID0gdG1wWyc+J10pKXsgZXJyID0gRVJSK2N1dChzb3VsKStcIm5vIHN0YXRlLlwiIH1cblx0XHRcdFx0a2wgPSBPYmplY3Qua2V5cyhub2RlfHx7fSk7IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93XG5cdFx0XHR9XG5cdFx0XHRpZihlcnIpe1xuXHRcdFx0XHRtc2cuZXJyID0gY3R4LmVyciA9IGVycjsgLy8gaW52YWxpZCBkYXRhIHNob3VsZCBlcnJvciBhbmQgc3R1biB0aGUgbWVzc2FnZS5cblx0XHRcdFx0ZmlyZShjdHgpO1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiaGFuZGxlIGVycm9yIVwiLCBlcnIpIC8vIGhhbmRsZSFcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGkgPSAwLCBrZXk7IG8gPSBvIHx8IDA7XG5cdFx0XHR3aGlsZShvKysgPCA5ICYmIChrZXkgPSBrbFtpKytdKSl7XG5cdFx0XHRcdGlmKCdfJyA9PT0ga2V5KXsgY29udGludWUgfVxuXHRcdFx0XHR2YXIgdmFsID0gbm9kZVtrZXldLCBzdGF0ZSA9IHN0YXRlc1trZXldO1xuXHRcdFx0XHRpZih1ID09PSBzdGF0ZSl7IGVyciA9IEVSUitjdXQoa2V5KStcIm9uXCIrY3V0KHNvdWwpK1wibm8gc3RhdGUuXCI7IGJyZWFrIH1cblx0XHRcdFx0aWYoIXZhbGlkKHZhbCkpeyBlcnIgPSBFUlIrY3V0KGtleSkrXCJvblwiK2N1dChzb3VsKStcImJhZCBcIisodHlwZW9mIHZhbCkrY3V0KHZhbCk7IGJyZWFrIH1cblx0XHRcdFx0Ly9jdHguYWxsKys7IC8vY3R4LmFja1tzb3VsK2tleV0gPSAnJztcblx0XHRcdFx0aGFtKHZhbCwga2V5LCBzb3VsLCBzdGF0ZSwgbXNnKTtcblx0XHRcdFx0KytDOyAvLyBjb3VydGVzeSBjb3VudDtcblx0XHRcdH1cblx0XHRcdGlmKChrbCA9IGtsLnNsaWNlKGkpKS5sZW5ndGgpeyB0dXJuKHBvcCk7IHJldHVybiB9XG5cdFx0XHQrK25pOyBrbCA9IG51bGw7IHBvcChvKTtcblx0XHR9KCkpO1xuXHR9IEd1bi5vbi5wdXQgPSBwdXQ7XG5cdC8vIFRPRE86IE1BUkshISEgY2xvY2sgYmVsb3csIHJlY29ubmVjdCBzeW5jLCBTRUEgY2VydGlmeSB3aXJlIG1lcmdlLCBVc2VyLmF1dGggdGFraW5nIG11bHRpcGxlIHRpbWVzLCAvLyBtc2cgcHV0LCBwdXQsIHNheSBhY2ssIGhlYXIgbG9vcC4uLlxuXHQvLyBXQVNJUyBCVUchIGxvY2FsIHBlZXIgbm90IGFjay4gLm9mZiBvdGhlciBwZW9wbGU6IC5vcGVuXG5cdGZ1bmN0aW9uIGhhbSh2YWwsIGtleSwgc291bCwgc3RhdGUsIG1zZyl7XG5cdFx0dmFyIGN0eCA9IG1zZy5ffHwnJywgcm9vdCA9IGN0eC5yb290LCBncmFwaCA9IHJvb3QuZ3JhcGgsIGxvdCwgdG1wO1xuXHRcdHZhciB2ZXJ0ZXggPSBncmFwaFtzb3VsXSB8fCBlbXB0eSwgd2FzID0gc3RhdGVfaXModmVydGV4LCBrZXksIDEpLCBrbm93biA9IHZlcnRleFtrZXldO1xuXHRcdFxuXHRcdHZhciBEQkcgPSBjdHguREJHOyBpZih0bXAgPSBjb25zb2xlLlNUQVQpeyBpZighZ3JhcGhbc291bF0gfHwgIWtub3duKXsgdG1wLmhhcyA9ICh0bXAuaGFzIHx8IDApICsgMSB9IH1cblxuXHRcdHZhciBub3cgPSBTdGF0ZSgpLCB1O1xuXHRcdGlmKHN0YXRlID4gbm93KXtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgaGFtKHZhbCwga2V5LCBzb3VsLCBzdGF0ZSwgbXNnKSB9LCAodG1wID0gc3RhdGUgLSBub3cpID4gTUQ/IE1EIDogdG1wKTsgLy8gTWF4IERlZmVyIDMyYml0LiA6KFxuXHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVCgoKERCR3x8Y3R4KS5IZiA9ICtuZXcgRGF0ZSksIHRtcCwgJ2Z1dHVyZScpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihzdGF0ZSA8IHdhcyl7IC8qb2xkOyovIGlmKCFjdHgubWlzcyl7IHJldHVybiB9IH0gLy8gYnV0IHNvbWUgY2hhaW5zIGhhdmUgYSBjYWNoZSBtaXNzIHRoYXQgbmVlZCB0byByZS1maXJlLiAvLyBUT0RPOiBJbXByb3ZlIGluIGZ1dHVyZS4gLy8gZm9yIEFYRSB0aGlzIHdvdWxkIHJlZHVjZSByZWJyb2FkY2FzdCwgYnV0IEdVTiBkb2VzIGl0IG9uIG1lc3NhZ2UgZm9yd2FyZGluZy5cblx0XHRpZighY3R4LmZhaXRoKXsgLy8gVE9ETzogQlVHPyBDYW4gdGhpcyBiZSB1c2VkIGZvciBjYWNoZSBtaXNzIGFzIHdlbGw/IC8vIFllcyB0aGlzIHdhcyBhIGJ1ZywgbmVlZCB0byBjaGVjayBjYWNoZSBtaXNzIGZvciBSQUQgdGVzdHMsIGJ1dCBzaG91bGQgd2UgY2FyZSBhYm91dCB0aGUgZmFpdGggY2hlY2sgbm93PyBQcm9iYWJseSBub3QuXG5cdFx0XHRpZihzdGF0ZSA9PT0gd2FzICYmICh2YWwgPT09IGtub3duIHx8IEwodmFsKSA8PSBMKGtub3duKSkpeyAvKmNvbnNvbGUubG9nKFwic2FtZVwiKTsqLyAvKnNhbWU7Ki8gaWYoIWN0eC5taXNzKXsgcmV0dXJuIH0gfSAvLyBzYW1lXG5cdFx0fVxuXHRcdGN0eC5zdHVuKys7IC8vIFRPRE86ICdmb3JnZXQnIGZlYXR1cmUgaW4gU0VBIHRpZWQgdG8gdGhpcywgYmFkIGFwcHJvYWNoLCBidXQgaGFja2VkIGluIGZvciBub3cuIEFueSBjaGFuZ2VzIGhlcmUgbXVzdCB1cGRhdGUgdGhlcmUuXG5cdFx0dmFyIGFpZCA9IG1zZ1snIyddK2N0eC5hbGwrKywgaWQgPSB7dG9TdHJpbmc6IGZ1bmN0aW9uKCl7IHJldHVybiBhaWQgfSwgXzogY3R4fTsgaWQudG9KU09OID0gaWQudG9TdHJpbmc7IC8vIHRoaXMgKnRyaWNrKiBtYWtlcyBpdCBjb21wYXRpYmxlIGJldHdlZW4gb2xkICYgbmV3IHZlcnNpb25zLlxuXHRcdHJvb3QuZHVwLnRyYWNrKGlkKVsnIyddID0gbXNnWycjJ107IC8vIGZpeGVzIG5ldyBPSyBhY2tzIGZvciBSUEMgbGlrZSBSVEMuXG5cdFx0REJHICYmIChEQkcucGggPSBEQkcucGggfHwgK25ldyBEYXRlKTtcblx0XHRyb290Lm9uKCdwdXQnLCB7JyMnOiBpZCwgJ0AnOiBtc2dbJ0AnXSwgcHV0OiB7JyMnOiBzb3VsLCAnLic6IGtleSwgJzonOiB2YWwsICc+Jzogc3RhdGV9LCBvazogbXNnLm9rLCBfOiBjdHh9KTtcblx0fVxuXHRmdW5jdGlvbiBtYXAobXNnKXtcblx0XHR2YXIgREJHOyBpZihEQkcgPSAobXNnLl98fCcnKS5EQkcpeyBEQkcucGEgPSArbmV3IERhdGU7IERCRy5wbSA9IERCRy5wbSB8fCArbmV3IERhdGV9XG4gICAgICBcdHZhciBldmUgPSB0aGlzLCByb290ID0gZXZlLmFzLCBncmFwaCA9IHJvb3QuZ3JhcGgsIGN0eCA9IG1zZy5fLCBwdXQgPSBtc2cucHV0LCBzb3VsID0gcHV0WycjJ10sIGtleSA9IHB1dFsnLiddLCB2YWwgPSBwdXRbJzonXSwgc3RhdGUgPSBwdXRbJz4nXSwgaWQgPSBtc2dbJyMnXSwgdG1wO1xuICAgICAgXHRpZigodG1wID0gY3R4Lm1zZykgJiYgKHRtcCA9IHRtcC5wdXQpICYmICh0bXAgPSB0bXBbc291bF0pKXsgc3RhdGVfaWZ5KHRtcCwga2V5LCBzdGF0ZSwgdmFsLCBzb3VsKSB9IC8vIG5lY2Vzc2FyeSEgb3IgZWxzZSBvdXQgbWVzc2FnZXMgZG8gbm90IGdldCBTRUEgdHJhbnNmb3Jtcy5cblx0XHRncmFwaFtzb3VsXSA9IHN0YXRlX2lmeShncmFwaFtzb3VsXSwga2V5LCBzdGF0ZSwgdmFsLCBzb3VsKTtcblx0XHRpZih0bXAgPSAocm9vdC5uZXh0fHwnJylbc291bF0peyB0bXAub24oJ2luJywgbXNnKSB9XG5cdFx0ZmlyZShjdHgpO1xuXHRcdGV2ZS50by5uZXh0KG1zZyk7XG5cdH1cblx0ZnVuY3Rpb24gZmlyZShjdHgsIG1zZyl7IHZhciByb290O1xuXHRcdGlmKGN0eC5zdG9wKXsgcmV0dXJuIH1cblx0XHRpZighY3R4LmVyciAmJiAwIDwgLS1jdHguc3R1bil7IHJldHVybiB9IC8vIFRPRE86ICdmb3JnZXQnIGZlYXR1cmUgaW4gU0VBIHRpZWQgdG8gdGhpcywgYmFkIGFwcHJvYWNoLCBidXQgaGFja2VkIGluIGZvciBub3cuIEFueSBjaGFuZ2VzIGhlcmUgbXVzdCB1cGRhdGUgdGhlcmUuXG5cdFx0Y3R4LnN0b3AgPSAxO1xuXHRcdGlmKCEocm9vdCA9IGN0eC5yb290KSl7IHJldHVybiB9XG5cdFx0dmFyIHRtcCA9IGN0eC5tYXRjaDsgdG1wLmVuZCA9IDE7XG5cdFx0aWYodG1wID09PSByb290LmhhdGNoKXsgaWYoISh0bXAgPSBjdHgubGF0Y2gpIHx8IHRtcC5lbmQpeyBkZWxldGUgcm9vdC5oYXRjaCB9IGVsc2UgeyByb290LmhhdGNoID0gdG1wIH0gfVxuXHRcdGN0eC5oYXRjaCAmJiBjdHguaGF0Y2goKTsgLy8gVE9ETzogcmVuYW1lL3Jld29yayBob3cgcHV0ICYgdGhpcyBpbnRlcmFjdC5cblx0XHRzZXRUaW1lb3V0LmVhY2goY3R4Lm1hdGNoLCBmdW5jdGlvbihjYil7Y2IgJiYgY2IoKX0pOyBcblx0XHRpZighKG1zZyA9IGN0eC5tc2cpIHx8IGN0eC5lcnIgfHwgbXNnLmVycil7IHJldHVybiB9XG5cdFx0bXNnLm91dCA9IHVuaXZlcnNlO1xuXHRcdGN0eC5yb290Lm9uKCdvdXQnLCBtc2cpO1xuXG5cdFx0Q0YoKTsgLy8gY291cnRlc3kgY2hlY2s7XG5cdH1cblx0ZnVuY3Rpb24gYWNrKG1zZyl7IC8vIGFnZ3JlZ2F0ZSBBQ0tzLlxuXHRcdHZhciBpZCA9IG1zZ1snQCddIHx8ICcnLCBjdHgsIG9rLCB0bXA7XG5cdFx0aWYoIShjdHggPSBpZC5fKSl7XG5cdFx0XHR2YXIgZHVwID0gKGR1cCA9IG1zZy4kKSAmJiAoZHVwID0gZHVwLl8pICYmIChkdXAgPSBkdXAucm9vdCkgJiYgKGR1cCA9IGR1cC5kdXApO1xuXHRcdFx0aWYoIShkdXAgPSBkdXAuY2hlY2soaWQpKSl7IHJldHVybiB9XG5cdFx0XHRtc2dbJ0AnXSA9IGR1cFsnIyddIHx8IG1zZ1snQCddOyAvLyBUaGlzIGRvZXNuJ3QgZG8gYW55dGhpbmcgYW55bW9yZSwgYmFja3RyYWNrIGl0IHRvIHNvbWV0aGluZyBlbHNlP1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjdHguYWNrcyA9IChjdHguYWNrc3x8MCkgKyAxO1xuXHRcdGlmKGN0eC5lcnIgPSBtc2cuZXJyKXtcblx0XHRcdG1zZ1snQCddID0gY3R4WycjJ107XG5cdFx0XHRmaXJlKGN0eCk7IC8vIFRPRE86IEJVRz8gSG93IGl0IHNraXBzL3N0b3BzIHByb3BhZ2F0aW9uIG9mIG1zZyBpZiBhbnkgMSBpdGVtIGlzIGVycm9yLCB0aGlzIHdvdWxkIGFzc3VtZSBhIHdob2xlIGJhdGNoL3Jlc3luYyBoYXMgc2FtZSBtYWxpY2lvdXMgaW50ZW50LlxuXHRcdH1cblx0XHRjdHgub2sgPSBtc2cub2sgfHwgY3R4Lm9rO1xuXHRcdGlmKCFjdHguc3RvcCAmJiAhY3R4LmNyYWNrKXsgY3R4LmNyYWNrID0gY3R4Lm1hdGNoICYmIGN0eC5tYXRjaC5wdXNoKGZ1bmN0aW9uKCl7YmFjayhjdHgpfSkgfSAvLyBoYW5kbGUgc3luY2hyb25vdXMgYWNrcy4gTk9URTogSWYgYSBzdG9yYWdlIHBlZXIgQUNLcyBzeW5jaHJvbm91c2x5IHRoZW4gdGhlIFBVVCBsb29wIGhhcyBub3QgZXZlbiBjb3VudGVkIHVwIGhvdyBtYW55IGl0ZW1zIG5lZWQgdG8gYmUgcHJvY2Vzc2VkLCBzbyBjdHguU1RPUCBmbGFncyB0aGlzIGFuZCBhZGRzIG9ubHkgMSBjYWxsYmFjayB0byB0aGUgZW5kIG9mIHRoZSBQVVQgbG9vcC5cblx0XHRiYWNrKGN0eCk7XG5cdH1cblx0ZnVuY3Rpb24gYmFjayhjdHgpe1xuXHRcdGlmKCFjdHggfHwgIWN0eC5yb290KXsgcmV0dXJuIH1cblx0XHRpZihjdHguc3R1biB8fCBjdHguYWNrcyAhPT0gY3R4LmFsbCl7IHJldHVybiB9XG5cdFx0Y3R4LnJvb3Qub24oJ2luJywgeydAJzogY3R4WycjJ10sIGVycjogY3R4LmVyciwgb2s6IGN0eC5lcnI/IHUgOiBjdHgub2sgfHwgeycnOjF9fSk7XG5cdH1cblxuXHR2YXIgRVJSID0gXCJFcnJvcjogSW52YWxpZCBncmFwaCFcIjtcblx0dmFyIGN1dCA9IGZ1bmN0aW9uKHMpeyByZXR1cm4gXCIgJ1wiKygnJytzKS5zbGljZSgwLDkpK1wiLi4uJyBcIiB9XG5cdHZhciBMID0gSlNPTi5zdHJpbmdpZnksIE1EID0gMjE0NzQ4MzY0NywgU3RhdGUgPSBHdW4uc3RhdGU7XG5cdHZhciBDID0gMCwgQ1QsIENGID0gZnVuY3Rpb24oKXtpZihDPjk5OSAmJiAoQy8tKENUIC0gKENUID0gK25ldyBEYXRlKSk+MSkpe0d1bi53aW5kb3cgJiYgY29uc29sZS5sb2coXCJXYXJuaW5nOiBZb3UncmUgc3luY2luZyAxSysgcmVjb3JkcyBhIHNlY29uZCwgZmFzdGVyIHRoYW4gRE9NIGNhbiB1cGRhdGUgLSBjb25zaWRlciBsaW1pdGluZyBxdWVyeS5cIik7Q0Y9ZnVuY3Rpb24oKXtDPTB9fX07XG5cbn0oKSk7XG5cbjsoZnVuY3Rpb24oKXtcblx0R3VuLm9uLmdldCA9IGZ1bmN0aW9uKG1zZywgZ3VuKXtcblx0XHR2YXIgcm9vdCA9IGd1bi5fLCBnZXQgPSBtc2cuZ2V0LCBzb3VsID0gZ2V0WycjJ10sIG5vZGUgPSByb290LmdyYXBoW3NvdWxdLCBoYXMgPSBnZXRbJy4nXTtcblx0XHR2YXIgbmV4dCA9IHJvb3QubmV4dCB8fCAocm9vdC5uZXh0ID0ge30pLCBhdCA9IG5leHRbc291bF07XG5cdFx0Ly8gcXVldWUgY29uY3VycmVudCBHRVRzP1xuXHRcdC8vIFRPRE86IGNvbnNpZGVyIHRhZ2dpbmcgb3JpZ2luYWwgbWVzc2FnZSBpbnRvIGR1cCBmb3IgREFNLlxuXHRcdC8vIFRPRE86IF4gYWJvdmU/IEluIGNoYXQgYXBwLCAxMiBtZXNzYWdlcyByZXN1bHRlZCBpbiBzYW1lIHBlZXIgYXNraW5nIGZvciBgI3VzZXIucHViYCAxMiB0aW1lcy4gKHNhbWUgd2l0aCAjdXNlciBHRVQgdG9vLCB5aXBlcyEpIC8vIERBTSBub3RlOiBUaGlzIGFsc28gcmVzdWx0ZWQgaW4gMTIgcmVwbGllcyBmcm9tIDEgcGVlciB3aGljaCBhbGwgaGFkIHNhbWUgIyNoYXNoIGJ1dCBub25lIG9mIHRoZW0gZGVkdXBlZCBiZWNhdXNlIGVhY2ggZ2V0IHdhcyBkaWZmZXJlbnQuXG5cdFx0Ly8gVE9ETzogTW92aW5nIHF1aWNrIGhhY2tzIGZpeGluZyB0aGVzZSB0aGluZ3MgdG8gYXhlIGZvciBub3cuXG5cdFx0Ly8gVE9ETzogYSBsb3Qgb2YgR0VUICNmb28gdGhlbiBHRVQgI2Zvby5cIlwiIGhhcHBlbmluZywgd2h5P1xuXHRcdC8vIFRPRE86IERBTSdzICMjIGhhc2ggY2hlY2ssIG9uIHNhbWUgZ2V0IEFDSywgcHJvZHVjaW5nIG11bHRpcGxlIHJlcGxpZXMgc3RpbGwsIG1heWJlIEpTT04gdnMgWVNPTj9cblx0XHQvLyBUTVAgbm90ZSBmb3Igbm93OiB2aU1acTFzbEcgd2FzIGNoYXQgTEVYIHF1ZXJ5ICMuXG5cdFx0LyppZihndW4gIT09ICh0bXAgPSBtc2cuJCkgJiYgKHRtcCA9ICh0bXB8fCcnKS5fKSl7XG5cdFx0XHRpZih0bXAuUSl7IHRtcC5RW21zZ1snIyddXSA9ICcnOyByZXR1cm4gfSAvLyBjaGFpbiBkb2VzIG5vdCBuZWVkIHRvIGFzayBmb3IgaXQgYWdhaW4uXG5cdFx0XHR0bXAuUSA9IHt9O1xuXHRcdH0qL1xuXHRcdC8qaWYodSA9PT0gaGFzKXtcblx0XHRcdGlmKGF0LlEpe1xuXHRcdFx0XHQvL2F0LlFbbXNnWycjJ11dID0gJyc7XG5cdFx0XHRcdC8vcmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0YXQuUSA9IHt9O1xuXHRcdH0qL1xuXHRcdHZhciBjdHggPSBtc2cuX3x8e30sIERCRyA9IGN0eC5EQkcgPSBtc2cuREJHO1xuXHRcdERCRyAmJiAoREJHLmcgPSArbmV3IERhdGUpO1xuXHRcdC8vY29uc29sZS5sb2coXCJHRVQ6XCIsIGdldCwgbm9kZSwgaGFzKTtcblx0XHRpZighbm9kZSl7IHJldHVybiByb290Lm9uKCdnZXQnLCBtc2cpIH1cblx0XHRpZihoYXMpe1xuXHRcdFx0aWYoJ3N0cmluZycgIT0gdHlwZW9mIGhhcyB8fCB1ID09PSBub2RlW2hhc10peyByZXR1cm4gcm9vdC5vbignZ2V0JywgbXNnKSB9XG5cdFx0XHRub2RlID0gc3RhdGVfaWZ5KHt9LCBoYXMsIHN0YXRlX2lzKG5vZGUsIGhhcyksIG5vZGVbaGFzXSwgc291bCk7XG5cdFx0XHQvLyBJZiB3ZSBoYXZlIGEga2V5IGluLW1lbW9yeSwgZG8gd2UgcmVhbGx5IG5lZWQgdG8gZmV0Y2g/XG5cdFx0XHQvLyBNYXliZS4uLiBpbiBjYXNlIHRoZSBpbi1tZW1vcnkga2V5IHdlIGhhdmUgaXMgYSBsb2NhbCB3cml0ZVxuXHRcdFx0Ly8gd2Ugc3RpbGwgbmVlZCB0byB0cmlnZ2VyIGEgcHVsbC9tZXJnZSBmcm9tIHBlZXJzLlxuXHRcdH1cblx0XHQvL0d1bi53aW5kb3c/IEd1bi5vYmouY29weShub2RlKSA6IG5vZGU7IC8vIEhOUEVSRjogSWYgIWJyb3dzZXIgYnVtcCBQZXJmb3JtYW5jZT8gSXMgdGhpcyB0b28gZGFuZ2Vyb3VzIHRvIHJlZmVyZW5jZSByb290IGdyYXBoPyBDb3B5IC8gc2hhbGxvdyBjb3B5IHRvbyBleHBlbnNpdmUgZm9yIGJpZyBub2Rlcy4gR3VuLm9iai50byhub2RlKTsgLy8gMSBsYXllciBkZWVwIGNvcHkgLy8gR3VuLm9iai5jb3B5KG5vZGUpOyAvLyB0b28gc2xvdyBvbiBiaWcgbm9kZXNcblx0XHRub2RlICYmIGFjayhtc2csIG5vZGUpO1xuXHRcdHJvb3Qub24oJ2dldCcsIG1zZyk7IC8vIHNlbmQgR0VUIHRvIHN0b3JhZ2UgYWRhcHRlcnMuXG5cdH1cblx0ZnVuY3Rpb24gYWNrKG1zZywgbm9kZSl7XG5cdFx0dmFyIFMgPSArbmV3IERhdGUsIGN0eCA9IG1zZy5ffHx7fSwgREJHID0gY3R4LkRCRyA9IG1zZy5EQkc7XG5cdFx0dmFyIHRvID0gbXNnWycjJ10sIGlkID0gdGV4dF9yYW5kKDkpLCBrZXlzID0gT2JqZWN0LmtleXMobm9kZXx8JycpLnNvcnQoKSwgc291bCA9ICgobm9kZXx8JycpLl98fCcnKVsnIyddLCBrbCA9IGtleXMubGVuZ3RoLCBqID0gMCwgcm9vdCA9IG1zZy4kLl8ucm9vdCwgRiA9IChub2RlID09PSByb290LmdyYXBoW3NvdWxdKTtcblx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICgoREJHfHxjdHgpLmdrID0gK25ldyBEYXRlKSAtIFMsICdnb3Qga2V5cycpO1xuXHRcdC8vIFBFUkY6IENvbnNpZGVyIGNvbW1lbnRpbmcgdGhpcyBvdXQgdG8gZm9yY2UgZGlzay1vbmx5IHJlYWRzIGZvciBwZXJmIHRlc3Rpbmc/IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93XG5cdFx0bm9kZSAmJiAoZnVuY3Rpb24gZ28oKXtcblx0XHRcdFMgPSArbmV3IERhdGU7XG5cdFx0XHR2YXIgaSA9IDAsIGssIHB1dCA9IHt9LCB0bXA7XG5cdFx0XHR3aGlsZShpIDwgOSAmJiAoayA9IGtleXNbaSsrXSkpe1xuXHRcdFx0XHRzdGF0ZV9pZnkocHV0LCBrLCBzdGF0ZV9pcyhub2RlLCBrKSwgbm9kZVtrXSwgc291bCk7XG5cdFx0XHR9XG5cdFx0XHRrZXlzID0ga2V5cy5zbGljZShpKTtcblx0XHRcdCh0bXAgPSB7fSlbc291bF0gPSBwdXQ7IHB1dCA9IHRtcDtcblx0XHRcdHZhciBmYWl0aDsgaWYoRil7IGZhaXRoID0gZnVuY3Rpb24oKXt9OyBmYWl0aC5yYW0gPSBmYWl0aC5mYWl0aCA9IHRydWU7IH0gLy8gSE5QRVJGOiBXZSdyZSB0ZXN0aW5nIHBlcmZvcm1hbmNlIGltcHJvdmVtZW50IGJ5IHNraXBwaW5nIGdvaW5nIHRocm91Z2ggc2VjdXJpdHkgYWdhaW4sIGJ1dCB0aGlzIHNob3VsZCBiZSBhdWRpdGVkLlxuXHRcdFx0dG1wID0ga2V5cy5sZW5ndGg7XG5cdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsIC0oUyAtIChTID0gK25ldyBEYXRlKSksICdnb3QgY29waWVkIHNvbWUnKTtcblx0XHRcdERCRyAmJiAoREJHLmdhID0gK25ldyBEYXRlKTtcblx0XHRcdHJvb3Qub24oJ2luJywgeydAJzogdG8sICcjJzogaWQsIHB1dDogcHV0LCAnJSc6ICh0bXA/IChpZCA9IHRleHRfcmFuZCg5KSkgOiB1KSwgJDogcm9vdC4kLCBfOiBmYWl0aCwgREJHOiBEQkd9KTtcblx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ2dvdCBpbicpO1xuXHRcdFx0aWYoIXRtcCl7IHJldHVybiB9XG5cdFx0XHRzZXRUaW1lb3V0LnR1cm4oZ28pO1xuXHRcdH0oKSk7XG5cdFx0aWYoIW5vZGUpeyByb290Lm9uKCdpbicsIHsnQCc6IG1zZ1snIyddfSkgfSAvLyBUT0RPOiBJIGRvbid0IHRoaW5rIEkgbGlrZSB0aGlzLCB0aGUgZGVmYXVsdCBsUyBhZGFwdGVyIHVzZXMgdGhpcyBidXQgXCJub3QgZm91bmRcIiBpcyBhIHNlbnNpdGl2ZSBpc3N1ZSwgc28gc2hvdWxkIHByb2JhYmx5IGJlIGhhbmRsZWQgbW9yZSBjYXJlZnVsbHkvaW5kaXZpZHVhbGx5LlxuXHR9IEd1bi5vbi5nZXQuYWNrID0gYWNrO1xufSgpKTtcblxuOyhmdW5jdGlvbigpe1xuXHRHdW4uY2hhaW4ub3B0ID0gZnVuY3Rpb24ob3B0KXtcblx0XHRvcHQgPSBvcHQgfHwge307XG5cdFx0dmFyIGd1biA9IHRoaXMsIGF0ID0gZ3VuLl8sIHRtcCA9IG9wdC5wZWVycyB8fCBvcHQ7XG5cdFx0aWYoIU9iamVjdC5wbGFpbihvcHQpKXsgb3B0ID0ge30gfVxuXHRcdGlmKCFPYmplY3QucGxhaW4oYXQub3B0KSl7IGF0Lm9wdCA9IG9wdCB9XG5cdFx0aWYoJ3N0cmluZycgPT0gdHlwZW9mIHRtcCl7IHRtcCA9IFt0bXBdIH1cblx0XHRpZighT2JqZWN0LnBsYWluKGF0Lm9wdC5wZWVycykpeyBhdC5vcHQucGVlcnMgPSB7fX1cblx0XHRpZih0bXAgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0XHRvcHQucGVlcnMgPSB7fTtcblx0XHRcdHRtcC5mb3JFYWNoKGZ1bmN0aW9uKHVybCl7XG5cdFx0XHRcdHZhciBwID0ge307IHAuaWQgPSBwLnVybCA9IHVybDtcblx0XHRcdFx0b3B0LnBlZXJzW3VybF0gPSBhdC5vcHQucGVlcnNbdXJsXSA9IGF0Lm9wdC5wZWVyc1t1cmxdIHx8IHA7XG5cdFx0XHR9KVxuXHRcdH1cblx0XHRvYmpfZWFjaChvcHQsIGZ1bmN0aW9uIGVhY2goayl7IHZhciB2ID0gdGhpc1trXTtcblx0XHRcdGlmKCh0aGlzICYmIHRoaXMuaGFzT3duUHJvcGVydHkoaykpIHx8ICdzdHJpbmcnID09IHR5cGVvZiB2IHx8IE9iamVjdC5lbXB0eSh2KSl7IHRoaXNba10gPSB2OyByZXR1cm4gfVxuXHRcdFx0aWYodiAmJiB2LmNvbnN0cnVjdG9yICE9PSBPYmplY3QgJiYgISh2IGluc3RhbmNlb2YgQXJyYXkpKXsgcmV0dXJuIH1cblx0XHRcdG9ial9lYWNoKHYsIGVhY2gpO1xuXHRcdH0pO1xuXHRcdGF0Lm9wdC5mcm9tID0gb3B0O1xuXHRcdEd1bi5vbignb3B0JywgYXQpO1xuXHRcdGF0Lm9wdC51dWlkID0gYXQub3B0LnV1aWQgfHwgZnVuY3Rpb24gdXVpZChsKXsgcmV0dXJuIEd1bi5zdGF0ZSgpLnRvU3RyaW5nKDM2KS5yZXBsYWNlKCcuJywnJykgKyBTdHJpbmcucmFuZG9tKGx8fDEyKSB9XG5cdFx0cmV0dXJuIGd1bjtcblx0fVxufSgpKTtcblxudmFyIG9ial9lYWNoID0gZnVuY3Rpb24obyxmKXsgT2JqZWN0LmtleXMobykuZm9yRWFjaChmLG8pIH0sIHRleHRfcmFuZCA9IFN0cmluZy5yYW5kb20sIHR1cm4gPSBzZXRUaW1lb3V0LnR1cm4sIHZhbGlkID0gR3VuLnZhbGlkLCBzdGF0ZV9pcyA9IEd1bi5zdGF0ZS5pcywgc3RhdGVfaWZ5ID0gR3VuLnN0YXRlLmlmeSwgdSwgZW1wdHkgPSB7fSwgQztcblxuR3VuLmxvZyA9IGZ1bmN0aW9uKCl7IHJldHVybiAoIUd1bi5sb2cub2ZmICYmIEMubG9nLmFwcGx5KEMsIGFyZ3VtZW50cykpLCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbignICcpIH07XG5HdW4ubG9nLm9uY2UgPSBmdW5jdGlvbih3LHMsbyl7IHJldHVybiAobyA9IEd1bi5sb2cub25jZSlbd10gPSBvW3ddIHx8IDAsIG9bd10rKyB8fCBHdW4ubG9nKHMpIH07XG5cbmlmKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpeyAod2luZG93LkdVTiA9IHdpbmRvdy5HdW4gPSBHdW4pLndpbmRvdyA9IHdpbmRvdyB9XG50cnl7IGlmKHR5cGVvZiBNT0RVTEUgIT09IFwidW5kZWZpbmVkXCIpeyBNT0RVTEUuZXhwb3J0cyA9IEd1biB9IH1jYXRjaChlKXt9XG5tb2R1bGUuZXhwb3J0cyA9IEd1bjtcblxuKEd1bi53aW5kb3d8fHt9KS5jb25zb2xlID0gKEd1bi53aW5kb3d8fHt9KS5jb25zb2xlIHx8IHtsb2c6IGZ1bmN0aW9uKCl7fX07XG4oQyA9IGNvbnNvbGUpLm9ubHkgPSBmdW5jdGlvbihpLCBzKXsgcmV0dXJuIChDLm9ubHkuaSAmJiBpID09PSBDLm9ubHkuaSAmJiBDLm9ubHkuaSsrKSAmJiAoQy5sb2cuYXBwbHkoQywgYXJndW1lbnRzKSB8fCBzKSB9O1xuXG47XCJQbGVhc2UgZG8gbm90IHJlbW92ZSB3ZWxjb21lIGxvZyB1bmxlc3MgeW91IGFyZSBwYXlpbmcgZm9yIGEgbW9udGhseSBzcG9uc29yc2hpcCwgdGhhbmtzIVwiO1xuR3VuLmxvZy5vbmNlKFwid2VsY29tZVwiLCBcIkhlbGxvIHdvbmRlcmZ1bCBwZXJzb24hIDopIFRoYW5rcyBmb3IgdXNpbmcgR1VOLCBwbGVhc2UgYXNrIGZvciBoZWxwIG9uIGh0dHA6Ly9jaGF0Lmd1bi5lY28gaWYgYW55dGhpbmcgdGFrZXMgeW91IGxvbmdlciB0aGFuIDVtaW4gdG8gZmlndXJlIG91dCFcIik7XG5cdCIsIlxudmFyIEd1biA9IHJlcXVpcmUoJy4vaW5kZXgnKTtcbkd1bi5jaGFpbi5zZXQgPSBmdW5jdGlvbihpdGVtLCBjYiwgb3B0KXtcblx0dmFyIGd1biA9IHRoaXMsIHJvb3QgPSBndW4uYmFjaygtMSksIHNvdWwsIHRtcDtcblx0Y2IgPSBjYiB8fCBmdW5jdGlvbigpe307XG5cdG9wdCA9IG9wdCB8fCB7fTsgb3B0Lml0ZW0gPSBvcHQuaXRlbSB8fCBpdGVtO1xuXHRpZihzb3VsID0gKChpdGVtfHwnJykuX3x8JycpWycjJ10peyAoaXRlbSA9IHt9KVsnIyddID0gc291bCB9IC8vIGNoZWNrIGlmIG5vZGUsIG1ha2UgbGluay5cblx0aWYoJ3N0cmluZycgPT0gdHlwZW9mICh0bXAgPSBHdW4udmFsaWQoaXRlbSkpKXsgcmV0dXJuIGd1bi5nZXQoc291bCA9IHRtcCkucHV0KGl0ZW0sIGNiLCBvcHQpIH0gLy8gY2hlY2sgaWYgbGlua1xuXHRpZighR3VuLmlzKGl0ZW0pKXtcblx0XHRpZihPYmplY3QucGxhaW4oaXRlbSkpe1xuXHRcdFx0aXRlbSA9IHJvb3QuZ2V0KHNvdWwgPSBndW4uYmFjaygnb3B0LnV1aWQnKSgpKS5wdXQoaXRlbSk7XG5cdFx0fVxuXHRcdHJldHVybiBndW4uZ2V0KHNvdWwgfHwgcm9vdC5iYWNrKCdvcHQudXVpZCcpKDcpKS5wdXQoaXRlbSwgY2IsIG9wdCk7XG5cdH1cblx0Z3VuLnB1dChmdW5jdGlvbihnbyl7XG5cdFx0aXRlbS5nZXQoZnVuY3Rpb24oc291bCwgbywgbXNnKXsgLy8gVE9ETzogQlVHISBXZSBubyBsb25nZXIgaGF2ZSB0aGlzIG9wdGlvbj8gJiBnbyBlcnJvciBub3QgaGFuZGxlZD9cblx0XHRcdGlmKCFzb3VsKXsgcmV0dXJuIGNiLmNhbGwoZ3VuLCB7ZXJyOiBHdW4ubG9nKCdPbmx5IGEgbm9kZSBjYW4gYmUgbGlua2VkISBOb3QgXCInICsgbXNnLnB1dCArICdcIiEnKX0pIH1cblx0XHRcdCh0bXAgPSB7fSlbc291bF0gPSB7JyMnOiBzb3VsfTsgZ28odG1wKTtcblx0XHR9LHRydWUpO1xuXHR9KVxuXHRyZXR1cm4gaXRlbTtcbn1cblx0IiwiXG4vLyBTaGltIGZvciBnZW5lcmljIGphdmFzY3JpcHQgdXRpbGl0aWVzLlxuU3RyaW5nLnJhbmRvbSA9IGZ1bmN0aW9uKGwsIGMpe1xuXHR2YXIgcyA9ICcnO1xuXHRsID0gbCB8fCAyNDsgLy8geW91IGFyZSBub3QgZ29pbmcgdG8gbWFrZSBhIDAgbGVuZ3RoIHJhbmRvbSBudW1iZXIsIHNvIG5vIG5lZWQgdG8gY2hlY2sgdHlwZVxuXHRjID0gYyB8fCAnMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eic7XG5cdHdoaWxlKGwtLSA+IDApeyBzICs9IGMuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGMubGVuZ3RoKSkgfVxuXHRyZXR1cm4gcztcbn1cblN0cmluZy5tYXRjaCA9IGZ1bmN0aW9uKHQsIG8peyB2YXIgdG1wLCB1O1xuXHRpZignc3RyaW5nJyAhPT0gdHlwZW9mIHQpeyByZXR1cm4gZmFsc2UgfVxuXHRpZignc3RyaW5nJyA9PSB0eXBlb2Ygbyl7IG8gPSB7Jz0nOiBvfSB9XG5cdG8gPSBvIHx8IHt9O1xuXHR0bXAgPSAob1snPSddIHx8IG9bJyonXSB8fCBvWyc+J10gfHwgb1snPCddKTtcblx0aWYodCA9PT0gdG1wKXsgcmV0dXJuIHRydWUgfVxuXHRpZih1ICE9PSBvWyc9J10peyByZXR1cm4gZmFsc2UgfVxuXHR0bXAgPSAob1snKiddIHx8IG9bJz4nXSk7XG5cdGlmKHQuc2xpY2UoMCwgKHRtcHx8JycpLmxlbmd0aCkgPT09IHRtcCl7IHJldHVybiB0cnVlIH1cblx0aWYodSAhPT0gb1snKiddKXsgcmV0dXJuIGZhbHNlIH1cblx0aWYodSAhPT0gb1snPiddICYmIHUgIT09IG9bJzwnXSl7XG5cdFx0cmV0dXJuICh0ID49IG9bJz4nXSAmJiB0IDw9IG9bJzwnXSk/IHRydWUgOiBmYWxzZTtcblx0fVxuXHRpZih1ICE9PSBvWyc+J10gJiYgdCA+PSBvWyc+J10peyByZXR1cm4gdHJ1ZSB9XG5cdGlmKHUgIT09IG9bJzwnXSAmJiB0IDw9IG9bJzwnXSl7IHJldHVybiB0cnVlIH1cblx0cmV0dXJuIGZhbHNlO1xufVxuU3RyaW5nLmhhc2ggPSBmdW5jdGlvbihzLCBjKXsgLy8gdmlhIFNPXG5cdGlmKHR5cGVvZiBzICE9PSAnc3RyaW5nJyl7IHJldHVybiB9XG5cdCAgICBjID0gYyB8fCAwOyAvLyBDUFUgc2NoZWR1bGUgaGFzaGluZyBieVxuXHQgICAgaWYoIXMubGVuZ3RoKXsgcmV0dXJuIGMgfVxuXHQgICAgZm9yKHZhciBpPTAsbD1zLmxlbmd0aCxuOyBpPGw7ICsraSl7XG5cdCAgICAgIG4gPSBzLmNoYXJDb2RlQXQoaSk7XG5cdCAgICAgIGMgPSAoKGM8PDUpLWMpK247XG5cdCAgICAgIGMgfD0gMDtcblx0ICAgIH1cblx0ICAgIHJldHVybiBjO1xuXHQgIH1cbnZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuT2JqZWN0LnBsYWluID0gZnVuY3Rpb24obyl7IHJldHVybiBvPyAobyBpbnN0YW5jZW9mIE9iamVjdCAmJiBvLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5tYXRjaCgvXlxcW29iamVjdCAoXFx3KylcXF0kLylbMV0gPT09ICdPYmplY3QnIDogZmFsc2UgfVxuT2JqZWN0LmVtcHR5ID0gZnVuY3Rpb24obywgbil7XG5cdGZvcih2YXIgayBpbiBvKXsgaWYoaGFzLmNhbGwobywgaykgJiYgKCFuIHx8IC0xPT1uLmluZGV4T2YoaykpKXsgcmV0dXJuIGZhbHNlIH0gfVxuXHRyZXR1cm4gdHJ1ZTtcbn1cbk9iamVjdC5rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24obyl7XG5cdHZhciBsID0gW107XG5cdGZvcih2YXIgayBpbiBvKXsgaWYoaGFzLmNhbGwobywgaykpeyBsLnB1c2goaykgfSB9XG5cdHJldHVybiBsO1xufVxuOyhmdW5jdGlvbigpeyAvLyBtYXggfjFtcyBvciBiZWZvcmUgc3RhY2sgb3ZlcmZsb3cgXG5cdHZhciB1LCBzVCA9IHNldFRpbWVvdXQsIGwgPSAwLCBjID0gMCwgc0kgPSAodHlwZW9mIHNldEltbWVkaWF0ZSAhPT0gJycrdSAmJiBzZXRJbW1lZGlhdGUpIHx8IHNUOyAvLyBxdWV1ZU1pY3JvdGFzayBmYXN0ZXIgYnV0IGJsb2NrcyBVSVxuXHRzVC5ob2xkID0gc1QuaG9sZCB8fCA5O1xuXHRzVC5wb2xsID0gc1QucG9sbCB8fCBmdW5jdGlvbihmKXsgLy9mKCk7IHJldHVybjsgLy8gZm9yIHRlc3Rpbmdcblx0XHRpZigoc1QuaG9sZCA+PSAoK25ldyBEYXRlIC0gbCkpICYmIGMrKyA8IDMzMzMpeyBmKCk7IHJldHVybiB9XG5cdFx0c0koZnVuY3Rpb24oKXsgbCA9ICtuZXcgRGF0ZTsgZigpIH0sYz0wKVxuXHR9XG59KCkpO1xuOyhmdW5jdGlvbigpeyAvLyBUb28gbWFueSBwb2xscyBibG9jaywgdGhpcyBcInRocmVhZHNcIiB0aGVtIGluIHR1cm5zIG92ZXIgYSBzaW5nbGUgdGhyZWFkIGluIHRpbWUuXG5cdHZhciBzVCA9IHNldFRpbWVvdXQsIHQgPSBzVC50dXJuID0gc1QudHVybiB8fCBmdW5jdGlvbihmKXsgMSA9PSBzLnB1c2goZikgJiYgcChUKSB9XG5cdCwgcyA9IHQucyA9IFtdLCBwID0gc1QucG9sbCwgaSA9IDAsIGYsIFQgPSBmdW5jdGlvbigpe1xuXHRcdGlmKGYgPSBzW2krK10peyBmKCkgfVxuXHRcdGlmKGkgPT0gcy5sZW5ndGggfHwgOTkgPT0gaSl7XG5cdFx0XHRzID0gdC5zID0gcy5zbGljZShpKTtcblx0XHRcdGkgPSAwO1xuXHRcdH1cblx0XHRpZihzLmxlbmd0aCl7IHAoVCkgfVxuXHR9XG59KCkpO1xuOyhmdW5jdGlvbigpe1xuXHR2YXIgdSwgc1QgPSBzZXRUaW1lb3V0LCBUID0gc1QudHVybjtcblx0KHNULmVhY2ggPSBzVC5lYWNoIHx8IGZ1bmN0aW9uKGwsZixlLFMpeyBTID0gUyB8fCA5OyAoZnVuY3Rpb24gdChzLEwscil7XG5cdCAgaWYoTCA9IChzID0gKGx8fFtdKS5zcGxpY2UoMCxTKSkubGVuZ3RoKXtcblx0ICBcdGZvcih2YXIgaSA9IDA7IGkgPCBMOyBpKyspe1xuXHQgIFx0XHRpZih1ICE9PSAociA9IGYoc1tpXSkpKXsgYnJlYWsgfVxuXHQgIFx0fVxuXHQgIFx0aWYodSA9PT0gcil7IFQodCk7IHJldHVybiB9XG5cdCAgfSBlICYmIGUocik7XG5cdH0oKSl9KSgpO1xufSgpKTtcblx0IiwiXG5yZXF1aXJlKCcuL3NoaW0nKTtcbmZ1bmN0aW9uIFN0YXRlKCl7XG5cdHZhciB0ID0gK25ldyBEYXRlO1xuXHRpZihsYXN0IDwgdCl7XG5cdFx0cmV0dXJuIE4gPSAwLCBsYXN0ID0gdCArIFN0YXRlLmRyaWZ0O1xuXHR9XG5cdHJldHVybiBsYXN0ID0gdCArICgoTiArPSAxKSAvIEQpICsgU3RhdGUuZHJpZnQ7XG59XG5TdGF0ZS5kcmlmdCA9IDA7XG52YXIgTkkgPSAtSW5maW5pdHksIE4gPSAwLCBEID0gOTk5LCBsYXN0ID0gTkksIHU7IC8vIFdBUk5JTkchIEluIHRoZSBmdXR1cmUsIG9uIG1hY2hpbmVzIHRoYXQgYXJlIEQgdGltZXMgZmFzdGVyIHRoYW4gMjAxNkFEIG1hY2hpbmVzLCB5b3Ugd2lsbCB3YW50IHRvIGluY3JlYXNlIEQgYnkgYW5vdGhlciBzZXZlcmFsIG9yZGVycyBvZiBtYWduaXR1ZGUgc28gdGhlIHByb2Nlc3Npbmcgc3BlZWQgbmV2ZXIgb3V0IHBhY2VzIHRoZSBkZWNpbWFsIHJlc29sdXRpb24gKGluY3JlYXNpbmcgYW4gaW50ZWdlciBlZmZlY3RzIHRoZSBzdGF0ZSBhY2N1cmFjeSkuXG5TdGF0ZS5pcyA9IGZ1bmN0aW9uKG4sIGssIG8peyAvLyBjb252ZW5pZW5jZSBmdW5jdGlvbiB0byBnZXQgdGhlIHN0YXRlIG9uIGEga2V5IG9uIGEgbm9kZSBhbmQgcmV0dXJuIGl0LlxuXHR2YXIgdG1wID0gKGsgJiYgbiAmJiBuLl8gJiYgbi5fWyc+J10pIHx8IG87XG5cdGlmKCF0bXApeyByZXR1cm4gfVxuXHRyZXR1cm4gKCdudW1iZXInID09IHR5cGVvZiAodG1wID0gdG1wW2tdKSk/IHRtcCA6IE5JO1xufVxuU3RhdGUuaWZ5ID0gZnVuY3Rpb24obiwgaywgcywgdiwgc291bCl7IC8vIHB1dCBhIGtleSdzIHN0YXRlIG9uIGEgbm9kZS5cblx0KG4gPSBuIHx8IHt9KS5fID0gbi5fIHx8IHt9OyAvLyBzYWZldHkgY2hlY2sgb3IgaW5pdC5cblx0aWYoc291bCl7IG4uX1snIyddID0gc291bCB9IC8vIHNldCBhIHNvdWwgaWYgc3BlY2lmaWVkLlxuXHR2YXIgdG1wID0gbi5fWyc+J10gfHwgKG4uX1snPiddID0ge30pOyAvLyBncmFiIHRoZSBzdGF0ZXMgZGF0YS5cblx0aWYodSAhPT0gayAmJiBrICE9PSAnXycpe1xuXHRcdGlmKCdudW1iZXInID09IHR5cGVvZiBzKXsgdG1wW2tdID0gcyB9IC8vIGFkZCB0aGUgdmFsaWQgc3RhdGUuXG5cdFx0aWYodSAhPT0gdil7IG5ba10gPSB2IH0gLy8gTm90ZTogTm90IGl0cyBqb2IgdG8gY2hlY2sgZm9yIHZhbGlkIHZhbHVlcyFcblx0fVxuXHRyZXR1cm4gbjtcbn1cbm1vZHVsZS5leHBvcnRzID0gU3RhdGU7XG5cdCIsIlxuLy8gVmFsaWQgdmFsdWVzIGFyZSBhIHN1YnNldCBvZiBKU09OOiBudWxsLCBiaW5hcnksIG51bWJlciAoIUluZmluaXR5KSwgdGV4dCxcbi8vIG9yIGEgc291bCByZWxhdGlvbi4gQXJyYXlzIG5lZWQgc3BlY2lhbCBhbGdvcml0aG1zIHRvIGhhbmRsZSBjb25jdXJyZW5jeSxcbi8vIHNvIHRoZXkgYXJlIG5vdCBzdXBwb3J0ZWQgZGlyZWN0bHkuIFVzZSBhbiBleHRlbnNpb24gdGhhdCBzdXBwb3J0cyB0aGVtIGlmXG4vLyBuZWVkZWQgYnV0IHJlc2VhcmNoIHRoZWlyIHByb2JsZW1zIGZpcnN0LlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodikge1xuICAvLyBcImRlbGV0ZXNcIiwgbnVsbGluZyBvdXQga2V5cy5cbiAgcmV0dXJuIHYgPT09IG51bGwgfHxcblx0XCJzdHJpbmdcIiA9PT0gdHlwZW9mIHYgfHxcblx0XCJib29sZWFuXCIgPT09IHR5cGVvZiB2IHx8XG5cdC8vIHdlIHdhbnQgKy8tIEluZmluaXR5IHRvIGJlLCBidXQgSlNPTiBkb2VzIG5vdCBzdXBwb3J0IGl0LCBzYWQgZmFjZS5cblx0Ly8gY2FuIHlvdSBndWVzcyB3aGF0IHYgPT09IHYgY2hlY2tzIGZvcj8gOylcblx0KFwibnVtYmVyXCIgPT09IHR5cGVvZiB2ICYmIHYgIT0gSW5maW5pdHkgJiYgdiAhPSAtSW5maW5pdHkgJiYgdiA9PT0gdikgfHxcblx0KCEhdiAmJiBcInN0cmluZ1wiID09IHR5cGVvZiB2W1wiI1wiXSAmJiBPYmplY3Qua2V5cyh2KS5sZW5ndGggPT09IDEgJiYgdltcIiNcIl0pO1xufVxuXHQiLCJcbnZhciBHdW4gPSByZXF1aXJlKCcuL2luZGV4Jyk7XG5HdW4uTWVzaCA9IHJlcXVpcmUoJy4vbWVzaCcpO1xuXG4vLyBUT0RPOiByZXN5bmMgdXBvbiByZWNvbm5lY3Qgb25saW5lL29mZmxpbmVcbi8vd2luZG93Lm9ub25saW5lID0gd2luZG93Lm9ub2ZmbGluZSA9IGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKCdvbmxpbmU/JywgbmF2aWdhdG9yLm9uTGluZSkgfVxuXG5HdW4ub24oJ29wdCcsIGZ1bmN0aW9uKHJvb3Qpe1xuXHR0aGlzLnRvLm5leHQocm9vdCk7XG5cdGlmKHJvb3Qub25jZSl7IHJldHVybiB9XG5cdHZhciBvcHQgPSByb290Lm9wdDtcblx0aWYoZmFsc2UgPT09IG9wdC5XZWJTb2NrZXQpeyByZXR1cm4gfVxuXG5cdHZhciBlbnYgPSBHdW4ud2luZG93IHx8IHt9O1xuXHR2YXIgd2Vic29ja2V0ID0gb3B0LldlYlNvY2tldCB8fCBlbnYuV2ViU29ja2V0IHx8IGVudi53ZWJraXRXZWJTb2NrZXQgfHwgZW52Lm1veldlYlNvY2tldDtcblx0aWYoIXdlYnNvY2tldCl7IHJldHVybiB9XG5cdG9wdC5XZWJTb2NrZXQgPSB3ZWJzb2NrZXQ7XG5cblx0dmFyIG1lc2ggPSBvcHQubWVzaCA9IG9wdC5tZXNoIHx8IEd1bi5NZXNoKHJvb3QpO1xuXG5cdHZhciB3aXJlID0gbWVzaC53aXJlIHx8IG9wdC53aXJlO1xuXHRtZXNoLndpcmUgPSBvcHQud2lyZSA9IG9wZW47XG5cdGZ1bmN0aW9uIG9wZW4ocGVlcil7IHRyeXtcblx0XHRpZighcGVlciB8fCAhcGVlci51cmwpeyByZXR1cm4gd2lyZSAmJiB3aXJlKHBlZXIpIH1cblx0XHR2YXIgdXJsID0gcGVlci51cmwucmVwbGFjZSgvXmh0dHAvLCAnd3MnKTtcblx0XHR2YXIgd2lyZSA9IHBlZXIud2lyZSA9IG5ldyBvcHQuV2ViU29ja2V0KHVybCk7XG5cdFx0d2lyZS5vbmNsb3NlID0gZnVuY3Rpb24oKXtcblx0XHRcdG9wdC5tZXNoLmJ5ZShwZWVyKTtcblx0XHRcdHJlY29ubmVjdChwZWVyKTtcblx0XHR9O1xuXHRcdHdpcmUub25lcnJvciA9IGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHJlY29ubmVjdChwZWVyKTtcblx0XHR9O1xuXHRcdHdpcmUub25vcGVuID0gZnVuY3Rpb24oKXtcblx0XHRcdG9wdC5tZXNoLmhpKHBlZXIpO1xuXHRcdH1cblx0XHR3aXJlLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKG1zZyl7XG5cdFx0XHRpZighbXNnKXsgcmV0dXJuIH1cblx0XHRcdG9wdC5tZXNoLmhlYXIobXNnLmRhdGEgfHwgbXNnLCBwZWVyKTtcblx0XHR9O1xuXHRcdHJldHVybiB3aXJlO1xuXHR9Y2F0Y2goZSl7fX1cblxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ICFvcHQuc3VwZXIgJiYgcm9vdC5vbignb3V0Jywge2RhbTonaGknfSkgfSwxKTsgLy8gaXQgY2FuIHRha2UgYSB3aGlsZSB0byBvcGVuIGEgc29ja2V0LCBzbyBtYXliZSBubyBsb25nZXIgbGF6eSBsb2FkIGZvciBwZXJmIHJlYXNvbnM/XG5cblx0dmFyIHdhaXQgPSAyICogOTk5O1xuXHRmdW5jdGlvbiByZWNvbm5lY3QocGVlcil7XG5cdFx0Y2xlYXJUaW1lb3V0KHBlZXIuZGVmZXIpO1xuXHRcdGlmKCFvcHQucGVlcnNbcGVlci51cmxdKXsgcmV0dXJuIH1cblx0XHRpZihkb2MgJiYgcGVlci5yZXRyeSA8PSAwKXsgcmV0dXJuIH1cblx0XHRwZWVyLnJldHJ5ID0gKHBlZXIucmV0cnkgfHwgb3B0LnJldHJ5KzEgfHwgNjApIC0gKCgtcGVlci50cmllZCArIChwZWVyLnRyaWVkID0gK25ldyBEYXRlKSA8IHdhaXQqNCk/MTowKTtcblx0XHRwZWVyLmRlZmVyID0gc2V0VGltZW91dChmdW5jdGlvbiB0bygpe1xuXHRcdFx0aWYoZG9jICYmIGRvYy5oaWRkZW4peyByZXR1cm4gc2V0VGltZW91dCh0byx3YWl0KSB9XG5cdFx0XHRvcGVuKHBlZXIpO1xuXHRcdH0sIHdhaXQpO1xuXHR9XG5cdHZhciBkb2MgPSAoJycrdSAhPT0gdHlwZW9mIGRvY3VtZW50KSAmJiBkb2N1bWVudDtcbn0pO1xudmFyIG5vb3AgPSBmdW5jdGlvbigpe30sIHU7XG5cdCIsIi8vZGVmYXVsdCBndW5cbnZhciBHdW4gPSAgIHJlcXVpcmUoJy4vZ3VuL3NyYy9yb290Jyk7XG5yZXF1aXJlKCcuL2d1bi9zcmMvc2hpbScpO1xucmVxdWlyZSgnLi9ndW4vc3JjL29udG8nKTtcbnJlcXVpcmUoJy4vZ3VuL3NyYy92YWxpZCcpO1xucmVxdWlyZSgnLi9ndW4vc3JjL3N0YXRlJyk7XG5yZXF1aXJlKCcuL2d1bi9zcmMvZHVwJyk7XG5yZXF1aXJlKCcuL2d1bi9zcmMvYXNrJyk7XG5yZXF1aXJlKCcuL2d1bi9zcmMvY2hhaW4nKTtcbnJlcXVpcmUoJy4vZ3VuL3NyYy9iYWNrJyk7XG5yZXF1aXJlKCcuL2d1bi9zcmMvcHV0Jyk7XG5yZXF1aXJlKCcuL2d1bi9zcmMvZ2V0Jyk7XG5yZXF1aXJlKCcuL2d1bi9zcmMvb24nKTtcbnJlcXVpcmUoJy4vZ3VuL3NyYy9tYXAnKTtcbnJlcXVpcmUoJy4vZ3VuL3NyYy9zZXQnKTtcbnJlcXVpcmUoJy4vZ3VuL3NyYy9tZXNoJyk7XG5yZXF1aXJlKCcuL2d1bi9zcmMvd2Vic29ja2V0Jyk7XG5yZXF1aXJlKCcuL2d1bi9zcmMvbG9jYWxTdG9yYWdlJyk7XG5cbi8vZGVmYXVsdCBleHRyYSBndW4gbGlzIHRvIGluY2x1ZGVcbnJlcXVpcmUoJy4vZ3VuL2xpYi9sZXgnKTtcblxucmVxdWlyZShcIi4vZ3VuL250c1wiKTtcbnJlcXVpcmUoXCIuL2d1bi9saWIvdW5zZXRcIik7XG5yZXF1aXJlKFwiLi9ndW4vbGliL25vdFwiKTtcbnJlcXVpcmUoXCIuL2d1bi9saWIvb3BlblwiKTtcbnJlcXVpcmUoXCIuL2d1bi9saWIvbG9hZFwiKTtcblxuLy9pbmNsdWRlIHNlYSBpbiB0aGUgYnVpbGRcbnJlcXVpcmUoJy4vZ3VuL3NlYScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEd1bjsiXX0=

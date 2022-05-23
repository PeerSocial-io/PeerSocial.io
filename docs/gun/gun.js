(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GUN = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
module.exports = require('./gun.js')
},{"./gun.js":4}],4:[function(require,module,exports){
(function (setImmediate){(function (){
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
	})(USE, './shim');

	;USE(function(module){
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
	})(USE, './onto');

	;USE(function(module){
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
	})(USE, './valid');

	;USE(function(module){
		USE('./shim');
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
	})(USE, './state');

	;USE(function(module){
		USE('./shim');
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
	})(USE, './dup');

	;USE(function(module){
		// request / response module, for asking and acking messages.
		USE('./onto'); // depends upon onto!
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
	})(USE, './ask');

	;USE(function(module){

		function Gun(o){
			if(o instanceof Gun){ return (this._ = {$: this}).$ }
			if(!(this instanceof Gun)){ return new Gun(o) }
			return Gun.create(this._ = {$: this, opt: o});
		}

		Gun.is = function($){ return ($ instanceof Gun) || ($ && $._ && ($ === $._.$)) || false }

		Gun.version = 0.2020;

		Gun.chain = Gun.prototype;
		Gun.chain.toJSON = function(){};

		USE('./shim');
		Gun.valid = USE('./valid');
		Gun.state = USE('./state');
		Gun.on = USE('./onto');
		Gun.dup = USE('./dup');
		Gun.ask = USE('./ask');

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
				DBG && (DBG.ph = DBG.ph || +new Date);
				root.on('put', {'#': id, '@': msg['@'], put: {'#': soul, '.': key, ':': val, '>': state}, _: ctx});
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
				var id = msg['@'] || '', ctx;
				if(!(ctx = id._)){ return }
				ctx.acks = (ctx.acks||0) + 1;
				if(ctx.err = msg.err){
					msg['@'] = ctx['#'];
					fire(ctx); // TODO: BUG? How it skips/stops propagation of msg if any 1 item is error, this would assume a whole batch/resync has same malicious intent.
				}
				if(!ctx.stop && !ctx.crack){ ctx.crack = ctx.match && ctx.match.push(function(){back(ctx)}) } // handle synchronous acks
				back(ctx);
			}
			function back(ctx){
				if(!ctx || !ctx.root){ return }
				if(ctx.stun || ctx.acks !== ctx.all){ return }
				ctx.root.on('in', {'@': ctx['#'], err: ctx.err, ok: ctx.err? u : {'':1}});
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
	})(USE, './root');

	;USE(function(module){
		var Gun = USE('./root');
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
	})(USE, './back');

	;USE(function(module){
		// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
		// is complicated and was extremely hard to build. If you port GUN to another
		// language, consider implementing an easier API to build.
		var Gun = USE('./root');
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
	})(USE, './chain');

	;USE(function(module){
		var Gun = USE('./root');
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
	})(USE, './get');

	;USE(function(module){
		var Gun = USE('./root');
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
			var cat = (as.$.back(-1)._), root = cat.root, ask = cat.ask(function(ack){
				root.on('ack', ack);
				if(ack.err){ Gun.log(ack) }
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
			(as.via._).on('out', {put: as.out = as.graph, opt: as.opt, '#': ask, _: tmp});
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
	})(USE, './put');

	;USE(function(module){
		var Gun = USE('./root');
		USE('./chain');
		USE('./back');
		USE('./put');
		USE('./get');
		module.exports = Gun;
	})(USE, './index');

	;USE(function(module){
		var Gun = USE('./index');
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
	})(USE, './on');

	;USE(function(module){
		var Gun = USE('./index'), next = Gun.chain.get.next;
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
	})(USE, './map');

	;USE(function(module){
		var Gun = USE('./index');
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
	})(USE, './set');

	;USE(function(module){
		USE('./shim');

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
					if(msg.put && (msg.err || (dup.s[id]||'').err)){ return false } // TODO: in theory we should not be able to stun a message, but for now going to check if it can help network performance preventing invalid data to relay.
					if(!(hash = msg['##']) && u !== msg.put && !meta.via && ack){ mesh.hash(msg, peer); return } // TODO: Should broadcasts be hashed?
					if(!peer && ack){ peer = ((tmp = dup.s[ack]) && (tmp.via || ((tmp = tmp.it) && (tmp = tmp._) && tmp.via))) || ((tmp = mesh.last) && ack === tmp['#'] && mesh.leap) } // warning! mesh.leap could be buggy! mesh last check reduces this.
					if(!peer && ack){ // still no peer, then ack daisy chain lost.
						if(dup.s[ack]){ return } // in dups but no peer hints that this was ack to self, ignore.
						console.STAT && console.STAT(+new Date, ++SMIA, 'total no peer to ack to');
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
					if(!msg.dam){
						var i = 0, to = []; tmp = opt.peers;
						for(var k in tmp){ var p = tmp[k]; // TODO: Make it up peers instead!
							to.push(p.url || p.pid || p.id);
							if(++i > 6){ break }
						}
						if(i > 1){ msg['><'] = to.join() } // TODO: BUG! This gets set regardless of peers sent to! Detect?
					}
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

			mesh.hi = function(peer){
				var wire = peer.wire, tmp;
				if(!wire){ mesh.wire((peer.length && {url: peer}) || peer); return }
				if(peer.id){
					opt.peers[peer.url || peer.id] = peer;
				} else {
					tmp = peer.id = peer.id || String.random(9);
					mesh.say({dam: '?', pid: root.opt.pid}, opt.peers[tmp] = peer);
					delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
				}
				peer.met = peer.met || +(new Date);
				if(!wire.hied){ root.on(wire.hied = 'hi', peer) }
				// @rogowski I need this here by default for now to fix go1dfish's bug
				tmp = peer.queue; peer.queue = [];
				setTimeout.each(tmp||[],function(msg){
					send(msg, peer);
				},0,9);
				//Type.obj.native && Type.obj.native(); // dirty place to check if other JS polluted.
			}
			mesh.bye = function(peer){
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
				if(tmp = console.STAT){ tmp.peers = (tmp.peers || 0) - 1; }
				if(!(tmp = peer.url)){ return } gets[tmp] = true;
				setTimeout(function(){ delete gets[tmp] },opt.lack || 9000);
			});
			root.on('hi', function(peer, tmp){ this.to.next(peer);
				if(tmp = console.STAT){ tmp.peers = (tmp.peers || 0) + 1 }
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

	})(USE, './mesh');

	;USE(function(module){
		var Gun = USE('../index');
		Gun.Mesh = USE('./mesh');

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
	})(USE, './websocket');

	;USE(function(module){
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
				var put = msg.put, soul = put['#'], key = put['.'], id = msg['#'], tmp; // pull data off wire envelope
				disk[soul] = Gun.state.ify(disk[soul], key, put['>'], put[':'], soul); // merge into disk object
				if(stop && size > (4999880)){ root.on('in', {'@': id, err: "localStorage max!"}); return; }
				if(!msg['@']){ acks.push(id) } // then ack any non-ack write. // TODO: use batch id.
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

					if(!err && !Object.empty(opt.peers)){ return } // only ack if there are no peers. // Switch this to probabilistic mode
					setTimeout.each(ack, function(id){
						root.on('in', {'@': id, err: err, ok: 0}); // localStorage isn't reliable, so make its `ok` code be a low number.
					},0,99);
				})
			}
		
		});
	})(USE, './localStorage');

}());

/* BELOW IS TEMPORARY FOR OLD INTERNAL COMPATIBILITY, THEY ARE IMMEDIATELY DEPRECATED AND WILL BE REMOVED IN NEXT VERSION */
;(function(){
	var u;
	if(''+u == typeof Gun){ return }
	var DEP = function(n){ console.warn("Warning! Deprecated internal utility will break in next version:", n) }
	// Generic javascript utilities.
	var Type = Gun;
	//Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
	Type.fn = Type.fn || {is: function(fn){ DEP('fn'); return (!!fn && 'function' == typeof fn) }}
	Type.bi = Type.bi || {is: function(b){ DEP('bi');return (b instanceof Boolean || typeof b == 'boolean') }}
	Type.num = Type.num || {is: function(n){ DEP('num'); return !list_is(n) && ((n - parseFloat(n) + 1) >= 0 || Infinity === n || -Infinity === n) }}
	Type.text = Type.text || {is: function(t){ DEP('text'); return (typeof t == 'string') }}
	Type.text.ify = Type.text.ify || function(t){ DEP('text.ify');
		if(Type.text.is(t)){ return t }
		if(typeof JSON !== "undefined"){ return JSON.stringify(t) }
		return (t && t.toString)? t.toString() : t;
	}
	Type.text.random = Type.text.random || function(l, c){ DEP('text.random');
		var s = '';
		l = l || 24; // you are not going to make a 0 length random number, so no need to check type
		c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
		while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
		return s;
	}
	Type.text.match = Type.text.match || function(t, o){ var tmp, u; DEP('text.match');
		if('string' !== typeof t){ return false }
		if('string' == typeof o){ o = {'=': o} }
		o = o || {};
		tmp = (o['='] || o['*'] || o['>'] || o['<']);
		if(t === tmp){ return true }
		if(u !== o['=']){ return false }
		tmp = (o['*'] || o['>'] || o['<']);
		if(t.slice(0, (tmp||'').length) === tmp){ return true }
		if(u !== o['*']){ return false }
		if(u !== o['>'] && u !== o['<']){
			return (t >= o['>'] && t <= o['<'])? true : false;
		}
		if(u !== o['>'] && t >= o['>']){ return true }
		if(u !== o['<'] && t <= o['<']){ return true }
		return false;
	}
	Type.text.hash = Type.text.hash || function(s, c){ // via SO
		DEP('text.hash');
		if(typeof s !== 'string'){ return }
	  c = c || 0;
	  if(!s.length){ return c }
	  for(var i=0,l=s.length,n; i<l; ++i){
	    n = s.charCodeAt(i);
	    c = ((c<<5)-c)+n;
	    c |= 0;
	  }
	  return c;
	}
	Type.list = Type.list || {is: function(l){ DEP('list'); return (l instanceof Array) }}
	Type.list.slit = Type.list.slit || Array.prototype.slice;
	Type.list.sort = Type.list.sort || function(k){ // creates a new sort function based off some key
		DEP('list.sort');
		return function(A,B){
			if(!A || !B){ return 0 } A = A[k]; B = B[k];
			if(A < B){ return -1 }else if(A > B){ return 1 }
			else { return 0 }
		}
	}
	Type.list.map = Type.list.map || function(l, c, _){ DEP('list.map'); return obj_map(l, c, _) }
	Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
	Type.obj = Type.boj || {is: function(o){ DEP('obj'); return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }}
	Type.obj.put = Type.obj.put || function(o, k, v){ DEP('obj.put'); return (o||{})[k] = v, o }
	Type.obj.has = Type.obj.has || function(o, k){ DEP('obj.has'); return o && Object.prototype.hasOwnProperty.call(o, k) }
	Type.obj.del = Type.obj.del || function(o, k){ DEP('obj.del'); 
		if(!o){ return }
		o[k] = null;
		delete o[k];
		return o;
	}
	Type.obj.as = Type.obj.as || function(o, k, v, u){ DEP('obj.as'); return o[k] = o[k] || (u === v? {} : v) }
	Type.obj.ify = Type.obj.ify || function(o){ DEP('obj.ify'); 
		if(obj_is(o)){ return o }
		try{o = JSON.parse(o);
		}catch(e){o={}};
		return o;
	}
	;(function(){ var u;
		function map(v,k){
			if(obj_has(this,k) && u !== this[k]){ return }
			this[k] = v;
		}
		Type.obj.to = Type.obj.to || function(from, to){ DEP('obj.to'); 
			to = to || {};
			obj_map(from, map, to);
			return to;
		}
	}());
	Type.obj.copy = Type.obj.copy || function(o){ DEP('obj.copy'); // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
		return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
	}
	;(function(){
		function empty(v,i){ var n = this.n, u;
			if(n && (i === n || (obj_is(n) && obj_has(n, i)))){ return }
			if(u !== i){ return true }
		}
		Type.obj.empty = Type.obj.empty || function(o, n){ DEP('obj.empty'); 
			if(!o){ return true }
			return obj_map(o,empty,{n:n})? false : true;
		}
	}());
	;(function(){
		function t(k,v){
			if(2 === arguments.length){
				t.r = t.r || {};
				t.r[k] = v;
				return;
			} t.r = t.r || [];
			t.r.push(k);
		};
		var keys = Object.keys, map, u;
		Object.keys = Object.keys || function(o){ return map(o, function(v,k,t){t(k)}) }
		Type.obj.map = map = Type.obj.map || function(l, c, _){ DEP('obj.map'); 
			var u, i = 0, x, r, ll, lle, f = 'function' == typeof c;
			t.r = u;
			if(keys && obj_is(l)){
				ll = keys(l); lle = true;
			}
			_ = _ || {};
			if(list_is(l) || ll){
				x = (ll || l).length;
				for(;i < x; i++){
					var ii = (i + Type.list.index);
					if(f){
						r = lle? c.call(_, l[ll[i]], ll[i], t) : c.call(_, l[i], ii, t);
						if(r !== u){ return r }
					} else {
						//if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
						if(c === l[lle? ll[i] : i]){ return ll? ll[i] : ii } // use this for now
					}
				}
			} else {
				for(i in l){
					if(f){
						if(obj_has(l,i)){
							r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
							if(r !== u){ return r }
						}
					} else {
						//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
						if(c === l[i]){ return i } // use this for now
					}
				}
			}
			return f? t.r : Type.list.index? 0 : -1;
		}
	}());
	Type.time = Type.time || {};
	Type.time.is = Type.time.is || function(t){ DEP('time'); return t? t instanceof Date : (+new Date().getTime()) }

	var fn_is = Type.fn.is;
	var list_is = Type.list.is;
	var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_map = obj.map;

	var Val = {};
	Val.is = function(v){ DEP('val.is'); // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
		if(v === u){ return false }
		if(v === null){ return true } // "deletes", nulling out keys.
		if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
		if(text_is(v) // by "text" we mean strings.
		|| bi_is(v) // by "binary" we mean boolean.
		|| num_is(v)){ // by "number" we mean integers or decimals.
			return true; // simple values are valid.
		}
		return Val.link.is(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
	}
	Val.link = Val.rel = {_: '#'};
	;(function(){
		Val.link.is = function(v){ DEP('val.link.is'); // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
			if(v && v[rel_] && !v._ && obj_is(v)){ // must be an object.
				var o = {};
				obj_map(v, map, o);
				if(o.id){ // a valid id was found.
					return o.id; // yay! Return it.
				}
			}
			return false; // the value was not a valid soul relation.
		}
		function map(s, k){ var o = this; // map over the object...
			if(o.id){ return o.id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
			if(k == rel_ && text_is(s)){ // the key should be '#' and have a text value.
				o.id = s; // we found the soul!
			} else {
				return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
			}
		}
	}());
	Val.link.ify = function(t){ DEP('val.link.ify'); return obj_put({}, rel_, t) } // convert a soul into a relation and return it.
	Type.obj.has._ = '.';
	var rel_ = Val.link._, u;
	var bi_is = Type.bi.is;
	var num_is = Type.num.is;
	var text_is = Type.text.is;
	var obj = Type.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;

	Type.val = Type.val || Val;

	var Node = {_: '_'};
	Node.soul = function(n, o){ DEP('node.soul'); return (n && n._ && n._[o || soul_]) } // convenience function to check to see if there is a soul on a node and return it.
	Node.soul.ify = function(n, o){ DEP('node.soul.ify'); // put a soul on an object.
		o = (typeof o === 'string')? {soul: o} : o || {};
		n = n || {}; // make sure it exists.
		n._ = n._ || {}; // make sure meta exists.
		n._[soul_] = o.soul || n._[soul_] || text_random(); // put the soul on it.
		return n;
	}
	Node.soul._ = Val.link._;
	;(function(){
		Node.is = function(n, cb, as){ DEP('node.is'); var s; // checks to see if an object is a valid node.
			if(!obj_is(n)){ return false } // must be an object.
			if(s = Node.soul(n)){ // must have a soul on it.
				return !obj_map(n, map, {as:as,cb:cb,s:s,n:n});
			}
			return false; // nope! This was not a valid node.
		}
		function map(v, k){ // we invert this because the way we check for this is via a negation.
			if(k === Node._){ return } // skip over the metadata.
			if(!Val.is(v)){ return true } // it is true that this is an invalid node.
			if(this.cb){ this.cb.call(this.as, v, k, this.n, this.s) } // optionally callback each key/value.
		}
	}());
	;(function(){
		Node.ify = function(obj, o, as){ DEP('node.ify'); // returns a node from a shallow object.
			if(!o){ o = {} }
			else if(typeof o === 'string'){ o = {soul: o} }
			else if('function' == typeof o){ o = {map: o} }
			if(o.map){ o.node = o.map.call(as, obj, u, o.node || {}) }
			if(o.node = Node.soul.ify(o.node || {}, o)){
				obj_map(obj, map, {o:o,as:as});
			}
			return o.node; // This will only be a valid node if the object wasn't already deep!
		}
		function map(v, k){ var o = this.o, tmp, u; // iterate over each key/value.
			if(o.map){
				tmp = o.map.call(this.as, v, ''+k, o.node);
				if(u === tmp){
					obj_del(o.node, k);
				} else
				if(o.node){ o.node[k] = tmp }
				return;
			}
			if(Val.is(v)){
				o.node[k] = v;
			}
		}
	}());
	var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_map = obj.map;
	var text = Type.text, text_random = text.random;
	var soul_ = Node.soul._;
	var u;
	Type.node = Type.node || Node;

	var State = Type.state;
	State.lex = function(){ DEP('state.lex'); return State().toString(36).replace('.','') }
	State.to = function(from, k, to){ DEP('state.to'); 
		var val = (from||{})[k];
		if(obj_is(val)){
			val = obj_copy(val);
		}
		return State.ify(to, k, State.is(from, k), val, Node.soul(from));
	}
	;(function(){
		State.map = function(cb, s, as){ DEP('state.map'); var u; // for use with Node.ify
			var o = obj_is(o = cb || s)? o : null;
			cb = fn_is(cb = cb || s)? cb : null;
			if(o && !cb){
				s = num_is(s)? s : State();
				o[N_] = o[N_] || {};
				obj_map(o, map, {o:o,s:s});
				return o;
			}
			as = as || obj_is(s)? s : u;
			s = num_is(s)? s : State();
			return function(v, k, o, opt){
				if(!cb){
					map.call({o: o, s: s}, v,k);
					return v;
				}
				cb.call(as || this || {}, v, k, o, opt);
				if(obj_has(o,k) && u === o[k]){ return }
				map.call({o: o, s: s}, v,k);
			}
		}
		function map(v,k){
			if(N_ === k){ return }
			State.ify(this.o, k, this.s) ;
		}
	}());
	var obj = Type.obj, obj_as = obj.as, obj_has = obj.has, obj_is = obj.is, obj_map = obj.map, obj_copy = obj.copy;
	var num = Type.num, num_is = num.is;
	var fn = Type.fn, fn_is = fn.is;
	var N_ = Node._, u;

	var Graph = {};
	;(function(){
		Graph.is = function(g, cb, fn, as){ DEP('graph.is'); // checks to see if an object is a valid graph.
			if(!g || !obj_is(g) || obj_empty(g)){ return false } // must be an object.
			return !obj_map(g, map, {cb:cb,fn:fn,as:as}); // makes sure it wasn't an empty object.
		}
		function map(n, s){ // we invert this because the way'? we check for this is via a negation.
			if(!n || s !== Node.soul(n) || !Node.is(n, this.fn, this.as)){ return true } // it is true that this is an invalid graph.
			if(!this.cb){ return }
			nf.n = n; nf.as = this.as; // sequential race conditions aren't races.
			this.cb.call(nf.as, n, s, nf);
		}
		function nf(fn){ // optional callback for each node.
			if(fn){ Node.is(nf.n, fn, nf.as) } // where we then have an optional callback for each key/value.
		}
	}());
	;(function(){
		Graph.ify = function(obj, env, as){ DEP('graph.ify'); 
			var at = {path: [], obj: obj};
			if(!env){
				env = {};
			} else
			if(typeof env === 'string'){
				env = {soul: env};
			} else
			if('function' == typeof env){
				env.map = env;
			}
			if(typeof as === 'string'){
				env.soul = env.soul || as;
				as = u;
			}
			if(env.soul){
				at.link = Val.link.ify(env.soul);
			}
			env.shell = (as||{}).shell;
			env.graph = env.graph || {};
			env.seen = env.seen || [];
			env.as = env.as || as;
			node(env, at);
			env.root = at.node;
			return env.graph;
		}
		function node(env, at){ var tmp;
			if(tmp = seen(env, at)){ return tmp }
			at.env = env;
			at.soul = soul;
			if(Node.ify(at.obj, map, at)){
				at.link = at.link || Val.link.ify(Node.soul(at.node));
				if(at.obj !== env.shell){
					env.graph[Val.link.is(at.link)] = at.node;
				}
			}
			return at;
		}
		function map(v,k,n){
			var at = this, env = at.env, is, tmp;
			if(Node._ === k && obj_has(v,Val.link._)){
				return n._; // TODO: Bug?
			}
			if(!(is = valid(v,k,n, at,env))){ return }
			if(!k){
				at.node = at.node || n || {};
				if(obj_has(v, Node._) && Node.soul(v)){ // ? for safety ?
					at.node._ = obj_copy(v._);
				}
				at.node = Node.soul.ify(at.node, Val.link.is(at.link));
				at.link = at.link || Val.link.ify(Node.soul(at.node));
			}
			if(tmp = env.map){
				tmp.call(env.as || {}, v,k,n, at);
				if(obj_has(n,k)){
					v = n[k];
					if(u === v){
						obj_del(n, k);
						return;
					}
					if(!(is = valid(v,k,n, at,env))){ return }
				}
			}
			if(!k){ return at.node }
			if(true === is){
				return v;
			}
			tmp = node(env, {obj: v, path: at.path.concat(k)});
			if(!tmp.node){ return }
			return tmp.link; //{'#': Node.soul(tmp.node)};
		}
		function soul(id){ var at = this;
			var prev = Val.link.is(at.link), graph = at.env.graph;
			at.link = at.link || Val.link.ify(id);
			at.link[Val.link._] = id;
			if(at.node && at.node[Node._]){
				at.node[Node._][Val.link._] = id;
			}
			if(obj_has(graph, prev)){
				graph[id] = graph[prev];
				obj_del(graph, prev);
			}
		}
		function valid(v,k,n, at,env){ var tmp;
			if(Val.is(v)){ return true }
			if(obj_is(v)){ return 1 }
			if(tmp = env.invalid){
				v = tmp.call(env.as || {}, v,k,n);
				return valid(v,k,n, at,env);
			}
			env.err = "Invalid value at '" + at.path.concat(k).join('.') + "'!";
			if(Type.list.is(v)){ env.err += " Use `.set(item)` instead of an Array." }
		}
		function seen(env, at){
			var arr = env.seen, i = arr.length, has;
			while(i--){ has = arr[i];
				if(at.obj === has.obj){ return has }
			}
			arr.push(at);
		}
	}());
	Graph.node = function(node){ DEP('graph.node'); 
		var soul = Node.soul(node);
		if(!soul){ return }
		return obj_put({}, soul, node);
	}
	;(function(){
		Graph.to = function(graph, root, opt){ DEP('graph.to'); 
			if(!graph){ return }
			var obj = {};
			opt = opt || {seen: {}};
			obj_map(graph[root], map, {obj:obj, graph: graph, opt: opt});
			return obj;
		}
		function map(v,k){ var tmp, obj;
			if(Node._ === k){
				if(obj_empty(v, Val.link._)){
					return;
				}
				this.obj[k] = obj_copy(v);
				return;
			}
			if(!(tmp = Val.link.is(v))){
				this.obj[k] = v;
				return;
			}
			if(obj = this.opt.seen[tmp]){
				this.obj[k] = obj;
				return;
			}
			this.obj[k] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt);
		}
	}());
	var fn_is = Type.fn.is;
	var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_has = obj.has, obj_empty = obj.empty, obj_put = obj.put, obj_map = obj.map, obj_copy = obj.copy;
	var u;
	Type.graph = Type.graph || Graph;
}());
}).call(this)}).call(this,require("timers").setImmediate)

},{"timers":2}],5:[function(require,module,exports){

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
	
},{"./onto":15}],6:[function(require,module,exports){

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
	
},{"./root":17}],7:[function(require,module,exports){

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
	
},{"./root":17}],8:[function(require,module,exports){

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
	
},{"./shim":19}],9:[function(require,module,exports){

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
	
},{"./root":17}],10:[function(require,module,exports){

var Gun = require('./root');
require('./chain');
require('./back');
require('./put');
require('./get');
module.exports = Gun;
	
},{"./back":6,"./chain":7,"./get":9,"./put":16,"./root":17}],11:[function(require,module,exports){

if(typeof Gun === 'undefined'){ return }

var noop = function(){}, store, u;
try{store = (Gun.window||noop).localStorage}catch(e){}
if(!store){
	Gun.log("Warning: No localStorage exists to persist data to!");
	store = {setItem: function(k,v){this[k]=v}, removeItem: function(k){delete this[k]}, getItem: function(k){return this[k]}};
}
Gun.on('create', function lg(root){
	this.to.next(root);
	var opt = root.opt, graph = root.graph, acks = [], disk, to;
	if(false === opt.localStorage){ return }
	opt.prefix = opt.file || 'gun/';
	try{ disk = lg[opt.prefix] = lg[opt.prefix] || JSON.parse(store.getItem(opt.prefix)) || {}; // TODO: Perf! This will block, should we care, since limited to 5MB anyways?
	}catch(e){ disk = lg[opt.prefix] = {}; }

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
		var put = msg.put, soul = put['#'], key = put['.'], tmp; // pull data off wire envelope
		disk[soul] = Gun.state.ify(disk[soul], key, put['>'], put[':'], soul); // merge into disk object
		if(!msg['@']){ acks.push(msg['#']) } // then ack any non-ack write. // TODO: use batch id.
		if(to){ return }
		//flush();return;
		to = setTimeout(flush, opt.wait || 1); // that gets saved as a whole to disk every 1ms
	});
	function flush(){
		var err, ack = acks; clearTimeout(to); to = false; acks = [];
		try{store.setItem(opt.prefix, JSON.stringify(disk));
		}catch(e){
			Gun.log((err = (e || "localStorage failure")) + " Consider using GUN's IndexedDB plugin for RAD for more storage space, https://gun.eco/docs/RAD#install");
			root.on('localStorage:error', {err: err, get: opt.prefix, put: disk});
		}
		if(!err && !Object.empty(opt.peers)){ return } // only ack if there are no peers. // Switch this to probabilistic mode
		setTimeout.each(ack, function(id){
			root.on('in', {'@': id, err: err, ok: 0}); // localStorage isn't reliable, so make its `ok` code be a low number.
		});
	}

});
	
},{}],12:[function(require,module,exports){

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
	
},{"./index":10}],13:[function(require,module,exports){

require('./shim');

function Mesh(root){
	var mesh = function(){};
	var opt = root.opt || {};
	opt.log = opt.log || console.log;
	opt.gap = opt.gap || opt.wait || 0;
	opt.max = opt.max || (opt.memory? (opt.memory * 999 * 999) : 300000000) * 0.3;
	opt.pack = opt.pack || (opt.max * 0.01 * 0.01);
	opt.puff = opt.puff || 9; // IDEA: do a start/end benchmark, divide ops/result.
	var puff = setTimeout.turn || setTimeout;
	var parse = JSON.parseAsync || function(t,cb,r){ var u; try{ cb(u, JSON.parse(t,r)) }catch(e){ cb(e) } }
	var json = JSON.stringifyAsync || function(v,cb,r,s){ var u; try{ cb(u, JSON.stringify(v,r,s)) }catch(e){ cb(e) } }

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
					var i = 0, m; while(i < P && (m = msg[i++])){ hear(m, peer) }
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
	var noop = function(){};
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
			  say(msg, peer);
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
			if(msg.put && (msg.err || (dup.s[id]||'').err)){ return false } // TODO: in theory we should not be able to stun a message, but for now going to check if it can help network performance preventing invalid data to relay.
			if(!(hash = msg['##']) && u !== msg.put && !meta.via && ack){ mesh.hash(msg, peer); return } // TODO: Should broadcasts be hashed?
			if(!peer && ack){ peer = ((tmp = dup.s[ack]) && (tmp.via || ((tmp = tmp.it) && (tmp = tmp._) && tmp.via))) || ((tmp = mesh.last) && ack === tmp['#'] && mesh.leap) } // warning! mesh.leap could be buggy! mesh last check reduces this.
			if(!peer && ack){ // still no peer, then ack daisy chain lost.
				if(dup.s[ack]){ return } // in dups but no peer hints that this was ack to self, ignore.
				console.STAT && console.STAT(+new Date, ++SMIA, 'total no peer to ack to');
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
						say(msg, p);
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
			if(!msg.dam){
				var i = 0, to = []; tmp = opt.peers;
				for(var k in tmp){ var p = tmp[k]; // TODO: Make it up peers instead!
					to.push(p.url || p.pid || p.id);
					if(++i > 6){ break }
				}
				if(i > 1){ msg['><'] = to.join() } // TODO: BUG! This gets set regardless of peers sent to! Detect?
			}
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
				say(msg, peer);
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
		//console.log('SAY:', peer.id, (raw||'').slice(0,250), ((raw||'').length / 1024 / 1024).toFixed(4));
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

	mesh.hi = function(peer){
		var tmp = peer.wire || {};
		if(peer.id){
			opt.peers[peer.url || peer.id] = peer;
		} else {
			tmp = peer.id = peer.id || String.random(9);
			mesh.say({dam: '?', pid: root.opt.pid}, opt.peers[tmp] = peer);
			delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
		}
		peer.met = peer.met || +(new Date);
		if(!tmp.hied){ root.on(tmp.hied = 'hi', peer) }
		// @rogowski I need this here by default for now to fix go1dfish's bug
		tmp = peer.queue; peer.queue = [];
		setTimeout.each(tmp||[],function(msg){
			send(msg, peer);
		},0,9);
		//Type.obj.native && Type.obj.native(); // dirty place to check if other JS polluted.
	}
	mesh.bye = function(peer){
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
		if(tmp = console.STAT){ tmp.peers = (tmp.peers || 0) - 1; }
		if(!(tmp = peer.url)){ return } gets[tmp] = true;
		setTimeout(function(){ delete gets[tmp] },opt.lack || 9000);
	});
	root.on('hi', function(peer, tmp){ this.to.next(peer);
		if(tmp = console.STAT){ tmp.peers = (tmp.peers || 0) + 1 }
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

	
},{"./shim":19}],14:[function(require,module,exports){

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
		function once(){
			if(!at.has && !at.soul){ at = {put: data, get: key} } // handles non-core messages.
			if(u === (tmp = at.put)){ tmp = ((msg.$$||'')._||'').put }
			if('string' == typeof Gun.valid(tmp)){ tmp = root.$.get(tmp)._.put; if(tmp === u){return} }
			if(eve.stun){ return } if('' === one[id]){ return } one[id] = '';
			if(cat.soul || cat.has){ eve.off() } // TODO: Plural chains? // else { ?.off() } // better than one check?
			cb.call($, tmp, at.get);
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
	
},{"./index":10}],15:[function(require,module,exports){

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
	
},{}],16:[function(require,module,exports){

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
			if(!Object.plain(d)){ (as.ack||noop).call(as, as.out = {err: as.err = Gun.log("Invalid data: " + ((d && (tmp = d.constructor) && tmp.name) || typeof d) + " at " + (as.via.back(function(at){at.get && tmp.push(at.get)}, tmp = []) || tmp.join('.'))+'.'+(to.path||[]).join('.'))}); as.ran(as); return }
			var seen = as.seen || (as.seen = []), i = seen.length;
			while(i--){ if(d === (tmp = seen[i]).it){ v = d = tmp.link; break } }
		}
		if(k && v){ at.node = state_ify(at.node, k, s, d) } // handle soul later.
		else {
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
	var cat = (as.$.back(-1)._), root = cat.root, ask = cat.ask(function(ack){
		root.on('ack', ack);
		if(ack.err){ Gun.log(ack) }
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
	(as.via._).on('out', {put: as.out = as.graph, opt: as.opt, '#': ask, _: tmp});
}; ran.end = function(stun,root){
	stun.end = noop; // like with the earlier id, cheaper to make this flag a function so below callbacks do not have to do an extra type check.
	if(stun.the.to === stun && stun === stun.the.last){ delete root.stun }
	stun.off();
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

var u, empty = {}, noop = function(){}, turn = setTimeout.turn, valid = Gun.valid, state_ify = Gun.state.ify;
var iife = function(fn,as){fn.call(as||empty)}
	
},{"./root":17}],17:[function(require,module,exports){


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
		var DBG = ctx.DBG = msg.DBG, S = +new Date;
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
			}
			if((kl = kl.slice(i)).length){ turn(pop); return }
			++ni; kl = null; pop(o);
		}());
	} Gun.on.put = put;
	// TODO: MARK!!! clock below, reconnect sync, SEA certify wire merge, User.auth taking multiple times, // msg put, put, say ack, hear loop...
	// WASIS BUG! first .once( undef 2nd good. .off othe rpeople: .open
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
		DBG && (DBG.ph = DBG.ph || +new Date);
		root.on('put', {'#': id, '@': msg['@'], put: {'#': soul, '.': key, ':': val, '>': state}, _: ctx});
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
	}
	function ack(msg){ // aggregate ACKs.
		var id = msg['@'] || '', ctx;
		if(!(ctx = id._)){ return }
		ctx.acks = (ctx.acks||0) + 1;
		if(ctx.err = msg.err){
			msg['@'] = ctx['#'];
			fire(ctx); // TODO: BUG? How it skips/stops propagation of msg if any 1 item is error, this would assume a whole batch/resync has same malicious intent.
		}
		if(!ctx.stop && !ctx.crack){ ctx.crack = ctx.match && ctx.match.push(function(){back(ctx)}) } // handle synchronous acks
		back(ctx);
	}
	function back(ctx){
		if(!ctx || !ctx.root){ return }
		if(ctx.stun || ctx.acks !== ctx.all){ return }
		ctx.root.on('in', {'@': ctx['#'], err: ctx.err, ok: ctx.err? u : {'':1}});
	}

	var ERR = "Error: Invalid graph!";
	var cut = function(s){ return " '"+(''+s).slice(0,9)+"...' " }
	var L = JSON.stringify, MD = 2147483647, State = Gun.state;

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
		if(tmp instanceof Array){
			if(!Object.plain(at.opt.peers)){ at.opt.peers = {}}
			tmp.forEach(function(url){
				var p = {}; p.id = p.url = url;
				at.opt.peers[url] = at.opt.peers[url] || p;
			})
		}
		at.opt.peers = at.opt.peers || {};
		obj_each(opt, function each(k){ var v = this[k];
			if((this && this.hasOwnProperty(k)) || 'string' == typeof v || Object.empty(v)){ this[k] = v; return }
			if(v && v.constructor !== Object && !(v instanceof Array)){ return }
			obj_each(v, each);
		});
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
	
},{"./ask":5,"./dup":8,"./onto":15,"./shim":19,"./state":20,"./valid":21}],18:[function(require,module,exports){

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
	
},{"./index":10}],19:[function(require,module,exports){
(function (setImmediate){(function (){

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
	sT.poll = sT.poll || function(f){ //f(); return; // for testing
		if((1 >= (+new Date - l)) && c++ < 3333){ f(); return }
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
	
}).call(this)}).call(this,require("timers").setImmediate)

},{"timers":2}],20:[function(require,module,exports){

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
	
},{"./shim":19}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){

var Gun = require('../index');
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
	
},{"../index":3,"./mesh":13}],23:[function(require,module,exports){


var Gun =   require('gun/src/root');
require('gun/src/shim');
require('gun/src/onto');
require('gun/src/valid');
require('gun/src/state');
require('gun/src/dup');
require('gun/src/ask');
require('gun/src/chain');
require('gun/src/back');
require('gun/src/put');
require('gun/src/get');
require('gun/src/on');
require('gun/src/map');
require('gun/src/set');
require('gun/src/mesh');
require('gun/src/websocket');
require('gun/src/localStorage');

module.exports = Gun;
},{"gun/src/ask":5,"gun/src/back":6,"gun/src/chain":7,"gun/src/dup":8,"gun/src/get":9,"gun/src/localStorage":11,"gun/src/map":12,"gun/src/mesh":13,"gun/src/on":14,"gun/src/onto":15,"gun/src/put":16,"gun/src/root":17,"gun/src/set":18,"gun/src/shim":19,"gun/src/state":20,"gun/src/valid":21,"gun/src/websocket":22}]},{},[23])(23)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTIuMjIuOC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTIuMjIuOC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi4uLy4uLy4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTIuMjIuOC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZ3VuL2Jyb3dzZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZ3VuL2d1bi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9ndW4vc3JjL2Fzay5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9ndW4vc3JjL2JhY2suanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZ3VuL3NyYy9jaGFpbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9ndW4vc3JjL2R1cC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9ndW4vc3JjL2dldC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9ndW4vc3JjL2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2d1bi9zcmMvbG9jYWxTdG9yYWdlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2d1bi9zcmMvbWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2d1bi9zcmMvbWVzaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9ndW4vc3JjL29uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2d1bi9zcmMvb250by5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9ndW4vc3JjL3B1dC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9ndW4vc3JjL3Jvb3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZ3VuL3NyYy9zZXQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZ3VuL3NyYy9zaGltLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2d1bi9zcmMvc3RhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZ3VuL3NyYy92YWxpZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9ndW4vc3JjL3dlYnNvY2tldC5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzRUE7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJ2YXIgbmV4dFRpY2sgPSByZXF1aXJlKCdwcm9jZXNzL2Jyb3dzZXIuanMnKS5uZXh0VGljaztcbnZhciBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBpbW1lZGlhdGVJZHMgPSB7fTtcbnZhciBuZXh0SW1tZWRpYXRlSWQgPSAwO1xuXG4vLyBET00gQVBJcywgZm9yIGNvbXBsZXRlbmVzc1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0VGltZW91dCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkgeyB0aW1lb3V0LmNsb3NlKCk7IH07XG5cbmZ1bmN0aW9uIFRpbWVvdXQoaWQsIGNsZWFyRm4pIHtcbiAgdGhpcy5faWQgPSBpZDtcbiAgdGhpcy5fY2xlYXJGbiA9IGNsZWFyRm47XG59XG5UaW1lb3V0LnByb3RvdHlwZS51bnJlZiA9IFRpbWVvdXQucHJvdG90eXBlLnJlZiA9IGZ1bmN0aW9uKCkge307XG5UaW1lb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9jbGVhckZuLmNhbGwod2luZG93LCB0aGlzLl9pZCk7XG59O1xuXG4vLyBEb2VzIG5vdCBzdGFydCB0aGUgdGltZSwganVzdCBzZXRzIHVwIHRoZSBtZW1iZXJzIG5lZWRlZC5cbmV4cG9ydHMuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSwgbXNlY3MpIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IG1zZWNzO1xufTtcblxuZXhwb3J0cy51bmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IC0xO1xufTtcblxuZXhwb3J0cy5fdW5yZWZBY3RpdmUgPSBleHBvcnRzLmFjdGl2ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuXG4gIHZhciBtc2VjcyA9IGl0ZW0uX2lkbGVUaW1lb3V0O1xuICBpZiAobXNlY3MgPj0gMCkge1xuICAgIGl0ZW0uX2lkbGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uIG9uVGltZW91dCgpIHtcbiAgICAgIGlmIChpdGVtLl9vblRpbWVvdXQpXG4gICAgICAgIGl0ZW0uX29uVGltZW91dCgpO1xuICAgIH0sIG1zZWNzKTtcbiAgfVxufTtcblxuLy8gVGhhdCdzIG5vdCBob3cgbm9kZS5qcyBpbXBsZW1lbnRzIGl0IGJ1dCB0aGUgZXhwb3NlZCBhcGkgaXMgdGhlIHNhbWUuXG5leHBvcnRzLnNldEltbWVkaWF0ZSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEltbWVkaWF0ZSA6IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBpZCA9IG5leHRJbW1lZGlhdGVJZCsrO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gZmFsc2UgOiBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgaW1tZWRpYXRlSWRzW2lkXSA9IHRydWU7XG5cbiAgbmV4dFRpY2soZnVuY3Rpb24gb25OZXh0VGljaygpIHtcbiAgICBpZiAoaW1tZWRpYXRlSWRzW2lkXSkge1xuICAgICAgLy8gZm4uY2FsbCgpIGlzIGZhc3RlciBzbyB3ZSBvcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiB1c2UtY2FzZVxuICAgICAgLy8gQHNlZSBodHRwOi8vanNwZXJmLmNvbS9jYWxsLWFwcGx5LXNlZ3VcbiAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4uY2FsbChudWxsKTtcbiAgICAgIH1cbiAgICAgIC8vIFByZXZlbnQgaWRzIGZyb20gbGVha2luZ1xuICAgICAgZXhwb3J0cy5jbGVhckltbWVkaWF0ZShpZCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gaWQ7XG59O1xuXG5leHBvcnRzLmNsZWFySW1tZWRpYXRlID0gdHlwZW9mIGNsZWFySW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBjbGVhckltbWVkaWF0ZSA6IGZ1bmN0aW9uKGlkKSB7XG4gIGRlbGV0ZSBpbW1lZGlhdGVJZHNbaWRdO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZ3VuLmpzJykiLCI7KGZ1bmN0aW9uKCl7XG5cbiAgLyogVU5CVUlMRCAqL1xuICBmdW5jdGlvbiBVU0UoYXJnLCByZXEpe1xuICAgIHJldHVybiByZXE/IHJlcXVpcmUoYXJnKSA6IGFyZy5zbGljZT8gVVNFW1IoYXJnKV0gOiBmdW5jdGlvbihtb2QsIHBhdGgpe1xuICAgICAgYXJnKG1vZCA9IHtleHBvcnRzOiB7fX0pO1xuICAgICAgVVNFW1IocGF0aCldID0gbW9kLmV4cG9ydHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFIocCl7XG4gICAgICByZXR1cm4gcC5zcGxpdCgnLycpLnNsaWNlKC0xKS50b1N0cmluZygpLnJlcGxhY2UoJy5qcycsJycpO1xuICAgIH1cbiAgfVxuICBpZih0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiKXsgdmFyIE1PRFVMRSA9IG1vZHVsZSB9XG4gIC8qIFVOQlVJTEQgKi9cblxuXHQ7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG5cdFx0Ly8gU2hpbSBmb3IgZ2VuZXJpYyBqYXZhc2NyaXB0IHV0aWxpdGllcy5cblx0XHRTdHJpbmcucmFuZG9tID0gZnVuY3Rpb24obCwgYyl7XG5cdFx0XHR2YXIgcyA9ICcnO1xuXHRcdFx0bCA9IGwgfHwgMjQ7IC8vIHlvdSBhcmUgbm90IGdvaW5nIHRvIG1ha2UgYSAwIGxlbmd0aCByYW5kb20gbnVtYmVyLCBzbyBubyBuZWVkIHRvIGNoZWNrIHR5cGVcblx0XHRcdGMgPSBjIHx8ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Jztcblx0XHRcdHdoaWxlKGwtLSA+IDApeyBzICs9IGMuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGMubGVuZ3RoKSkgfVxuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fVxuXHRcdFN0cmluZy5tYXRjaCA9IGZ1bmN0aW9uKHQsIG8peyB2YXIgdG1wLCB1O1xuXHRcdFx0aWYoJ3N0cmluZycgIT09IHR5cGVvZiB0KXsgcmV0dXJuIGZhbHNlIH1cblx0XHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiBvKXsgbyA9IHsnPSc6IG99IH1cblx0XHRcdG8gPSBvIHx8IHt9O1xuXHRcdFx0dG1wID0gKG9bJz0nXSB8fCBvWycqJ10gfHwgb1snPiddIHx8IG9bJzwnXSk7XG5cdFx0XHRpZih0ID09PSB0bXApeyByZXR1cm4gdHJ1ZSB9XG5cdFx0XHRpZih1ICE9PSBvWyc9J10peyByZXR1cm4gZmFsc2UgfVxuXHRcdFx0dG1wID0gKG9bJyonXSB8fCBvWyc+J10pO1xuXHRcdFx0aWYodC5zbGljZSgwLCAodG1wfHwnJykubGVuZ3RoKSA9PT0gdG1wKXsgcmV0dXJuIHRydWUgfVxuXHRcdFx0aWYodSAhPT0gb1snKiddKXsgcmV0dXJuIGZhbHNlIH1cblx0XHRcdGlmKHUgIT09IG9bJz4nXSAmJiB1ICE9PSBvWyc8J10pe1xuXHRcdFx0XHRyZXR1cm4gKHQgPj0gb1snPiddICYmIHQgPD0gb1snPCddKT8gdHJ1ZSA6IGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0aWYodSAhPT0gb1snPiddICYmIHQgPj0gb1snPiddKXsgcmV0dXJuIHRydWUgfVxuXHRcdFx0aWYodSAhPT0gb1snPCddICYmIHQgPD0gb1snPCddKXsgcmV0dXJuIHRydWUgfVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRTdHJpbmcuaGFzaCA9IGZ1bmN0aW9uKHMsIGMpeyAvLyB2aWEgU09cblx0XHRcdGlmKHR5cGVvZiBzICE9PSAnc3RyaW5nJyl7IHJldHVybiB9XG5cdCAgICBjID0gYyB8fCAwOyAvLyBDUFUgc2NoZWR1bGUgaGFzaGluZyBieVxuXHQgICAgaWYoIXMubGVuZ3RoKXsgcmV0dXJuIGMgfVxuXHQgICAgZm9yKHZhciBpPTAsbD1zLmxlbmd0aCxuOyBpPGw7ICsraSl7XG5cdCAgICAgIG4gPSBzLmNoYXJDb2RlQXQoaSk7XG5cdCAgICAgIGMgPSAoKGM8PDUpLWMpK247XG5cdCAgICAgIGMgfD0gMDtcblx0ICAgIH1cblx0ICAgIHJldHVybiBjO1xuXHQgIH1cblx0XHR2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblx0XHRPYmplY3QucGxhaW4gPSBmdW5jdGlvbihvKXsgcmV0dXJuIG8/IChvIGluc3RhbmNlb2YgT2JqZWN0ICYmIG8uY29uc3RydWN0b3IgPT09IE9iamVjdCkgfHwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9eXFxbb2JqZWN0IChcXHcrKVxcXSQvKVsxXSA9PT0gJ09iamVjdCcgOiBmYWxzZSB9XG5cdFx0T2JqZWN0LmVtcHR5ID0gZnVuY3Rpb24obywgbil7XG5cdFx0XHRmb3IodmFyIGsgaW4gbyl7IGlmKGhhcy5jYWxsKG8sIGspICYmICghbiB8fCAtMT09bi5pbmRleE9mKGspKSl7IHJldHVybiBmYWxzZSB9IH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRPYmplY3Qua2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uKG8pe1xuXHRcdFx0dmFyIGwgPSBbXTtcblx0XHRcdGZvcih2YXIgayBpbiBvKXsgaWYoaGFzLmNhbGwobywgaykpeyBsLnB1c2goaykgfSB9XG5cdFx0XHRyZXR1cm4gbDtcblx0XHR9XG5cdFx0OyhmdW5jdGlvbigpeyAvLyBtYXggfjFtcyBvciBiZWZvcmUgc3RhY2sgb3ZlcmZsb3cgXG5cdFx0XHR2YXIgdSwgc1QgPSBzZXRUaW1lb3V0LCBsID0gMCwgYyA9IDAsIHNJID0gKHR5cGVvZiBzZXRJbW1lZGlhdGUgIT09ICcnK3UgJiYgc2V0SW1tZWRpYXRlKSB8fCBzVDsgLy8gcXVldWVNaWNyb3Rhc2sgZmFzdGVyIGJ1dCBibG9ja3MgVUlcblx0XHRcdHNULmhvbGQgPSBzVC5ob2xkIHx8IDk7XG5cdFx0XHRzVC5wb2xsID0gc1QucG9sbCB8fCBmdW5jdGlvbihmKXsgLy9mKCk7IHJldHVybjsgLy8gZm9yIHRlc3Rpbmdcblx0XHRcdFx0aWYoKHNULmhvbGQgPj0gKCtuZXcgRGF0ZSAtIGwpKSAmJiBjKysgPCAzMzMzKXsgZigpOyByZXR1cm4gfVxuXHRcdFx0XHRzSShmdW5jdGlvbigpeyBsID0gK25ldyBEYXRlOyBmKCkgfSxjPTApXG5cdFx0XHR9XG5cdFx0fSgpKTtcblx0XHQ7KGZ1bmN0aW9uKCl7IC8vIFRvbyBtYW55IHBvbGxzIGJsb2NrLCB0aGlzIFwidGhyZWFkc1wiIHRoZW0gaW4gdHVybnMgb3ZlciBhIHNpbmdsZSB0aHJlYWQgaW4gdGltZS5cblx0XHRcdHZhciBzVCA9IHNldFRpbWVvdXQsIHQgPSBzVC50dXJuID0gc1QudHVybiB8fCBmdW5jdGlvbihmKXsgMSA9PSBzLnB1c2goZikgJiYgcChUKSB9XG5cdFx0XHQsIHMgPSB0LnMgPSBbXSwgcCA9IHNULnBvbGwsIGkgPSAwLCBmLCBUID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0aWYoZiA9IHNbaSsrXSl7IGYoKSB9XG5cdFx0XHRcdGlmKGkgPT0gcy5sZW5ndGggfHwgOTkgPT0gaSl7XG5cdFx0XHRcdFx0cyA9IHQucyA9IHMuc2xpY2UoaSk7XG5cdFx0XHRcdFx0aSA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYocy5sZW5ndGgpeyBwKFQpIH1cblx0XHRcdH1cblx0XHR9KCkpO1xuXHRcdDsoZnVuY3Rpb24oKXtcblx0XHRcdHZhciB1LCBzVCA9IHNldFRpbWVvdXQsIFQgPSBzVC50dXJuO1xuXHRcdFx0KHNULmVhY2ggPSBzVC5lYWNoIHx8IGZ1bmN0aW9uKGwsZixlLFMpeyBTID0gUyB8fCA5OyAoZnVuY3Rpb24gdChzLEwscil7XG5cdFx0XHQgIGlmKEwgPSAocyA9IChsfHxbXSkuc3BsaWNlKDAsUykpLmxlbmd0aCl7XG5cdFx0XHQgIFx0Zm9yKHZhciBpID0gMDsgaSA8IEw7IGkrKyl7XG5cdFx0XHQgIFx0XHRpZih1ICE9PSAociA9IGYoc1tpXSkpKXsgYnJlYWsgfVxuXHRcdFx0ICBcdH1cblx0XHRcdCAgXHRpZih1ID09PSByKXsgVCh0KTsgcmV0dXJuIH1cblx0XHRcdCAgfSBlICYmIGUocik7XG5cdFx0XHR9KCkpfSkoKTtcblx0XHR9KCkpO1xuXHR9KShVU0UsICcuL3NoaW0nKTtcblxuXHQ7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG5cdFx0Ly8gT24gZXZlbnQgZW1pdHRlciBnZW5lcmljIGphdmFzY3JpcHQgdXRpbGl0eS5cblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG9udG8odGFnLCBhcmcsIGFzKXtcblx0XHRcdGlmKCF0YWcpeyByZXR1cm4ge3RvOiBvbnRvfSB9XG5cdFx0XHR2YXIgdSwgZiA9ICdmdW5jdGlvbicgPT0gdHlwZW9mIGFyZywgdGFnID0gKHRoaXMudGFnIHx8ICh0aGlzLnRhZyA9IHt9KSlbdGFnXSB8fCBmICYmIChcblx0XHRcdFx0dGhpcy50YWdbdGFnXSA9IHt0YWc6IHRhZywgdG86IG9udG8uXyA9IHsgbmV4dDogZnVuY3Rpb24oYXJnKXsgdmFyIHRtcDtcblx0XHRcdFx0XHRpZih0bXAgPSB0aGlzLnRvKXsgdG1wLm5leHQoYXJnKSB9XG5cdFx0XHR9fX0pO1xuXHRcdFx0aWYoZil7XG5cdFx0XHRcdHZhciBiZSA9IHtcblx0XHRcdFx0XHRvZmY6IG9udG8ub2ZmIHx8XG5cdFx0XHRcdFx0KG9udG8ub2ZmID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdGlmKHRoaXMubmV4dCA9PT0gb250by5fLm5leHQpeyByZXR1cm4gITAgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhpcy50aGUubGFzdCl7XG5cdFx0XHRcdFx0XHRcdHRoaXMudGhlLmxhc3QgPSB0aGlzLmJhY2s7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0aGlzLnRvLmJhY2sgPSB0aGlzLmJhY2s7XG5cdFx0XHRcdFx0XHR0aGlzLm5leHQgPSBvbnRvLl8ubmV4dDtcblx0XHRcdFx0XHRcdHRoaXMuYmFjay50byA9IHRoaXMudG87XG5cdFx0XHRcdFx0XHRpZih0aGlzLnRoZS5sYXN0ID09PSB0aGlzLnRoZSl7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLm9uLnRhZ1t0aGlzLnRoZS50YWddO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHRvOiBvbnRvLl8sXG5cdFx0XHRcdFx0bmV4dDogYXJnLFxuXHRcdFx0XHRcdHRoZTogdGFnLFxuXHRcdFx0XHRcdG9uOiB0aGlzLFxuXHRcdFx0XHRcdGFzOiBhcyxcblx0XHRcdFx0fTtcblx0XHRcdFx0KGJlLmJhY2sgPSB0YWcubGFzdCB8fCB0YWcpLnRvID0gYmU7XG5cdFx0XHRcdHJldHVybiB0YWcubGFzdCA9IGJlO1xuXHRcdFx0fVxuXHRcdFx0aWYoKHRhZyA9IHRhZy50bykgJiYgdSAhPT0gYXJnKXsgdGFnLm5leHQoYXJnKSB9XG5cdFx0XHRyZXR1cm4gdGFnO1xuXHRcdH07XG5cdH0pKFVTRSwgJy4vb250bycpO1xuXG5cdDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcblx0XHQvLyBWYWxpZCB2YWx1ZXMgYXJlIGEgc3Vic2V0IG9mIEpTT046IG51bGwsIGJpbmFyeSwgbnVtYmVyICghSW5maW5pdHkpLCB0ZXh0LFxuXHRcdC8vIG9yIGEgc291bCByZWxhdGlvbi4gQXJyYXlzIG5lZWQgc3BlY2lhbCBhbGdvcml0aG1zIHRvIGhhbmRsZSBjb25jdXJyZW5jeSxcblx0XHQvLyBzbyB0aGV5IGFyZSBub3Qgc3VwcG9ydGVkIGRpcmVjdGx5LiBVc2UgYW4gZXh0ZW5zaW9uIHRoYXQgc3VwcG9ydHMgdGhlbSBpZlxuXHRcdC8vIG5lZWRlZCBidXQgcmVzZWFyY2ggdGhlaXIgcHJvYmxlbXMgZmlyc3QuXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodikge1xuXHRcdCAgLy8gXCJkZWxldGVzXCIsIG51bGxpbmcgb3V0IGtleXMuXG5cdFx0ICByZXR1cm4gdiA9PT0gbnVsbCB8fFxuXHRcdFx0XCJzdHJpbmdcIiA9PT0gdHlwZW9mIHYgfHxcblx0XHRcdFwiYm9vbGVhblwiID09PSB0eXBlb2YgdiB8fFxuXHRcdFx0Ly8gd2Ugd2FudCArLy0gSW5maW5pdHkgdG8gYmUsIGJ1dCBKU09OIGRvZXMgbm90IHN1cHBvcnQgaXQsIHNhZCBmYWNlLlxuXHRcdFx0Ly8gY2FuIHlvdSBndWVzcyB3aGF0IHYgPT09IHYgY2hlY2tzIGZvcj8gOylcblx0XHRcdChcIm51bWJlclwiID09PSB0eXBlb2YgdiAmJiB2ICE9IEluZmluaXR5ICYmIHYgIT0gLUluZmluaXR5ICYmIHYgPT09IHYpIHx8XG5cdFx0XHQoISF2ICYmIFwic3RyaW5nXCIgPT0gdHlwZW9mIHZbXCIjXCJdICYmIE9iamVjdC5rZXlzKHYpLmxlbmd0aCA9PT0gMSAmJiB2W1wiI1wiXSk7XG5cdFx0fVxuXHR9KShVU0UsICcuL3ZhbGlkJyk7XG5cblx0O1VTRShmdW5jdGlvbihtb2R1bGUpe1xuXHRcdFVTRSgnLi9zaGltJyk7XG5cdFx0ZnVuY3Rpb24gU3RhdGUoKXtcblx0XHRcdHZhciB0ID0gK25ldyBEYXRlO1xuXHRcdFx0aWYobGFzdCA8IHQpe1xuXHRcdFx0XHRyZXR1cm4gTiA9IDAsIGxhc3QgPSB0ICsgU3RhdGUuZHJpZnQ7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbGFzdCA9IHQgKyAoKE4gKz0gMSkgLyBEKSArIFN0YXRlLmRyaWZ0O1xuXHRcdH1cblx0XHRTdGF0ZS5kcmlmdCA9IDA7XG5cdFx0dmFyIE5JID0gLUluZmluaXR5LCBOID0gMCwgRCA9IDk5OSwgbGFzdCA9IE5JLCB1OyAvLyBXQVJOSU5HISBJbiB0aGUgZnV0dXJlLCBvbiBtYWNoaW5lcyB0aGF0IGFyZSBEIHRpbWVzIGZhc3RlciB0aGFuIDIwMTZBRCBtYWNoaW5lcywgeW91IHdpbGwgd2FudCB0byBpbmNyZWFzZSBEIGJ5IGFub3RoZXIgc2V2ZXJhbCBvcmRlcnMgb2YgbWFnbml0dWRlIHNvIHRoZSBwcm9jZXNzaW5nIHNwZWVkIG5ldmVyIG91dCBwYWNlcyB0aGUgZGVjaW1hbCByZXNvbHV0aW9uIChpbmNyZWFzaW5nIGFuIGludGVnZXIgZWZmZWN0cyB0aGUgc3RhdGUgYWNjdXJhY3kpLlxuXHRcdFN0YXRlLmlzID0gZnVuY3Rpb24obiwgaywgbyl7IC8vIGNvbnZlbmllbmNlIGZ1bmN0aW9uIHRvIGdldCB0aGUgc3RhdGUgb24gYSBrZXkgb24gYSBub2RlIGFuZCByZXR1cm4gaXQuXG5cdFx0XHR2YXIgdG1wID0gKGsgJiYgbiAmJiBuLl8gJiYgbi5fWyc+J10pIHx8IG87XG5cdFx0XHRpZighdG1wKXsgcmV0dXJuIH1cblx0XHRcdHJldHVybiAoJ251bWJlcicgPT0gdHlwZW9mICh0bXAgPSB0bXBba10pKT8gdG1wIDogTkk7XG5cdFx0fVxuXHRcdFN0YXRlLmlmeSA9IGZ1bmN0aW9uKG4sIGssIHMsIHYsIHNvdWwpeyAvLyBwdXQgYSBrZXkncyBzdGF0ZSBvbiBhIG5vZGUuXG5cdFx0XHQobiA9IG4gfHwge30pLl8gPSBuLl8gfHwge307IC8vIHNhZmV0eSBjaGVjayBvciBpbml0LlxuXHRcdFx0aWYoc291bCl7IG4uX1snIyddID0gc291bCB9IC8vIHNldCBhIHNvdWwgaWYgc3BlY2lmaWVkLlxuXHRcdFx0dmFyIHRtcCA9IG4uX1snPiddIHx8IChuLl9bJz4nXSA9IHt9KTsgLy8gZ3JhYiB0aGUgc3RhdGVzIGRhdGEuXG5cdFx0XHRpZih1ICE9PSBrICYmIGsgIT09ICdfJyl7XG5cdFx0XHRcdGlmKCdudW1iZXInID09IHR5cGVvZiBzKXsgdG1wW2tdID0gcyB9IC8vIGFkZCB0aGUgdmFsaWQgc3RhdGUuXG5cdFx0XHRcdGlmKHUgIT09IHYpeyBuW2tdID0gdiB9IC8vIE5vdGU6IE5vdCBpdHMgam9iIHRvIGNoZWNrIGZvciB2YWxpZCB2YWx1ZXMhXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbjtcblx0XHR9XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBTdGF0ZTtcblx0fSkoVVNFLCAnLi9zdGF0ZScpO1xuXG5cdDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcblx0XHRVU0UoJy4vc2hpbScpO1xuXHRcdGZ1bmN0aW9uIER1cChvcHQpe1xuXHRcdFx0dmFyIGR1cCA9IHtzOnt9fSwgcyA9IGR1cC5zO1xuXHRcdFx0b3B0ID0gb3B0IHx8IHttYXg6IDk5OSwgYWdlOiAxMDAwICogOX07Ly8qLyAxMDAwICogOSAqIDN9O1xuXHRcdFx0ZHVwLmNoZWNrID0gZnVuY3Rpb24oaWQpe1xuXHRcdFx0XHRpZighc1tpZF0peyByZXR1cm4gZmFsc2UgfVxuXHRcdFx0XHRyZXR1cm4gZHQoaWQpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGR0ID0gZHVwLnRyYWNrID0gZnVuY3Rpb24oaWQpe1xuXHRcdFx0XHR2YXIgaXQgPSBzW2lkXSB8fCAoc1tpZF0gPSB7fSk7XG5cdFx0XHRcdGl0LndhcyA9IGR1cC5ub3cgPSArbmV3IERhdGU7XG5cdFx0XHRcdGlmKCFkdXAudG8peyBkdXAudG8gPSBzZXRUaW1lb3V0KGR1cC5kcm9wLCBvcHQuYWdlICsgOSkgfVxuXHRcdFx0XHRyZXR1cm4gaXQ7XG5cdFx0XHR9XG5cdFx0XHRkdXAuZHJvcCA9IGZ1bmN0aW9uKGFnZSl7XG5cdFx0XHRcdGR1cC50byA9IG51bGw7XG5cdFx0XHRcdGR1cC5ub3cgPSArbmV3IERhdGU7XG5cdFx0XHRcdHZhciBsID0gT2JqZWN0LmtleXMocyk7XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoZHVwLm5vdywgK25ldyBEYXRlIC0gZHVwLm5vdywgJ2R1cCBkcm9wIGtleXMnKTsgLy8gcHJldiB+MjAlIENQVSA3JSBSQU0gMzAwTUIgLy8gbm93IH4yNSUgQ1BVIDclIFJBTSA1MDBNQlxuXHRcdFx0XHRzZXRUaW1lb3V0LmVhY2gobCwgZnVuY3Rpb24oaWQpeyB2YXIgaXQgPSBzW2lkXTsgLy8gVE9ETzogLmtleXMoIGlzIHNsb3c/XG5cdFx0XHRcdFx0aWYoaXQgJiYgKGFnZSB8fCBvcHQuYWdlKSA+IChkdXAubm93IC0gaXQud2FzKSl7IHJldHVybiB9XG5cdFx0XHRcdFx0ZGVsZXRlIHNbaWRdO1xuXHRcdFx0XHR9LDAsOTkpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGR1cDtcblx0XHR9XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBEdXA7XG5cdH0pKFVTRSwgJy4vZHVwJyk7XG5cblx0O1VTRShmdW5jdGlvbihtb2R1bGUpe1xuXHRcdC8vIHJlcXVlc3QgLyByZXNwb25zZSBtb2R1bGUsIGZvciBhc2tpbmcgYW5kIGFja2luZyBtZXNzYWdlcy5cblx0XHRVU0UoJy4vb250bycpOyAvLyBkZXBlbmRzIHVwb24gb250byFcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFzayhjYiwgYXMpe1xuXHRcdFx0aWYoIXRoaXMub24peyByZXR1cm4gfVxuXHRcdFx0dmFyIGxhY2sgPSAodGhpcy5vcHR8fHt9KS5sYWNrIHx8IDkwMDA7XG5cdFx0XHRpZighKCdmdW5jdGlvbicgPT0gdHlwZW9mIGNiKSl7XG5cdFx0XHRcdGlmKCFjYil7IHJldHVybiB9XG5cdFx0XHRcdHZhciBpZCA9IGNiWycjJ10gfHwgY2IsIHRtcCA9ICh0aGlzLnRhZ3x8JycpW2lkXTtcblx0XHRcdFx0aWYoIXRtcCl7IHJldHVybiB9XG5cdFx0XHRcdGlmKGFzKXtcblx0XHRcdFx0XHR0bXAgPSB0aGlzLm9uKGlkLCBhcyk7XG5cdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRtcC5lcnIpO1xuXHRcdFx0XHRcdHRtcC5lcnIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHRtcC5vZmYoKSB9LCBsYWNrKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHZhciBpZCA9IChhcyAmJiBhc1snIyddKSB8fCByYW5kb20oOSk7XG5cdFx0XHRpZighY2IpeyByZXR1cm4gaWQgfVxuXHRcdFx0dmFyIHRvID0gdGhpcy5vbihpZCwgY2IsIGFzKTtcblx0XHRcdHRvLmVyciA9IHRvLmVyciB8fCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHRvLm9mZigpO1xuXHRcdFx0XHR0by5uZXh0KHtlcnI6IFwiRXJyb3I6IE5vIEFDSyB5ZXQuXCIsIGxhY2s6IHRydWV9KTtcblx0XHRcdH0sIGxhY2spO1xuXHRcdFx0cmV0dXJuIGlkO1xuXHRcdH1cblx0XHR2YXIgcmFuZG9tID0gU3RyaW5nLnJhbmRvbSB8fCBmdW5jdGlvbigpeyByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMikgfVxuXHR9KShVU0UsICcuL2FzaycpO1xuXG5cdDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcblxuXHRcdGZ1bmN0aW9uIEd1bihvKXtcblx0XHRcdGlmKG8gaW5zdGFuY2VvZiBHdW4peyByZXR1cm4gKHRoaXMuXyA9IHskOiB0aGlzfSkuJCB9XG5cdFx0XHRpZighKHRoaXMgaW5zdGFuY2VvZiBHdW4pKXsgcmV0dXJuIG5ldyBHdW4obykgfVxuXHRcdFx0cmV0dXJuIEd1bi5jcmVhdGUodGhpcy5fID0geyQ6IHRoaXMsIG9wdDogb30pO1xuXHRcdH1cblxuXHRcdEd1bi5pcyA9IGZ1bmN0aW9uKCQpeyByZXR1cm4gKCQgaW5zdGFuY2VvZiBHdW4pIHx8ICgkICYmICQuXyAmJiAoJCA9PT0gJC5fLiQpKSB8fCBmYWxzZSB9XG5cblx0XHRHdW4udmVyc2lvbiA9IDAuMjAyMDtcblxuXHRcdEd1bi5jaGFpbiA9IEd1bi5wcm90b3R5cGU7XG5cdFx0R3VuLmNoYWluLnRvSlNPTiA9IGZ1bmN0aW9uKCl7fTtcblxuXHRcdFVTRSgnLi9zaGltJyk7XG5cdFx0R3VuLnZhbGlkID0gVVNFKCcuL3ZhbGlkJyk7XG5cdFx0R3VuLnN0YXRlID0gVVNFKCcuL3N0YXRlJyk7XG5cdFx0R3VuLm9uID0gVVNFKCcuL29udG8nKTtcblx0XHRHdW4uZHVwID0gVVNFKCcuL2R1cCcpO1xuXHRcdEd1bi5hc2sgPSBVU0UoJy4vYXNrJyk7XG5cblx0XHQ7KGZ1bmN0aW9uKCl7XG5cdFx0XHRHdW4uY3JlYXRlID0gZnVuY3Rpb24oYXQpe1xuXHRcdFx0XHRhdC5yb290ID0gYXQucm9vdCB8fCBhdDtcblx0XHRcdFx0YXQuZ3JhcGggPSBhdC5ncmFwaCB8fCB7fTtcblx0XHRcdFx0YXQub24gPSBhdC5vbiB8fCBHdW4ub247XG5cdFx0XHRcdGF0LmFzayA9IGF0LmFzayB8fCBHdW4uYXNrO1xuXHRcdFx0XHRhdC5kdXAgPSBhdC5kdXAgfHwgR3VuLmR1cCgpO1xuXHRcdFx0XHR2YXIgZ3VuID0gYXQuJC5vcHQoYXQub3B0KTtcblx0XHRcdFx0aWYoIWF0Lm9uY2Upe1xuXHRcdFx0XHRcdGF0Lm9uKCdpbicsIHVuaXZlcnNlLCBhdCk7XG5cdFx0XHRcdFx0YXQub24oJ291dCcsIHVuaXZlcnNlLCBhdCk7XG5cdFx0XHRcdFx0YXQub24oJ3B1dCcsIG1hcCwgYXQpO1xuXHRcdFx0XHRcdEd1bi5vbignY3JlYXRlJywgYXQpO1xuXHRcdFx0XHRcdGF0Lm9uKCdjcmVhdGUnLCBhdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YXQub25jZSA9IDE7XG5cdFx0XHRcdHJldHVybiBndW47XG5cdFx0XHR9XG5cdFx0XHRmdW5jdGlvbiB1bml2ZXJzZShtc2cpe1xuXHRcdFx0XHQvLyBUT0RPOiBCVUchIG1zZy5vdXQgPSBudWxsIGJlaW5nIHNldCFcblx0XHRcdFx0Ly9pZighRil7IHZhciBldmUgPSB0aGlzOyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHVuaXZlcnNlLmNhbGwoZXZlLCBtc2csMSkgfSxNYXRoLnJhbmRvbSgpICogMTAwKTtyZXR1cm47IH0gLy8gQUREIEYgVE8gUEFSQU1TIVxuXHRcdFx0XHRpZighbXNnKXsgcmV0dXJuIH1cblx0XHRcdFx0aWYobXNnLm91dCA9PT0gdW5pdmVyc2UpeyB0aGlzLnRvLm5leHQobXNnKTsgcmV0dXJuIH1cblx0XHRcdFx0dmFyIGV2ZSA9IHRoaXMsIGFzID0gZXZlLmFzLCBhdCA9IGFzLmF0IHx8IGFzLCBndW4gPSBhdC4kLCBkdXAgPSBhdC5kdXAsIHRtcCwgREJHID0gbXNnLkRCRztcblx0XHRcdFx0KHRtcCA9IG1zZ1snIyddKSB8fCAodG1wID0gbXNnWycjJ10gPSB0ZXh0X3JhbmQoOSkpO1xuXHRcdFx0XHRpZihkdXAuY2hlY2sodG1wKSl7IHJldHVybiB9IGR1cC50cmFjayh0bXApO1xuXHRcdFx0XHR0bXAgPSBtc2cuXzsgbXNnLl8gPSAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdG1wKT8gdG1wIDogZnVuY3Rpb24oKXt9O1xuXHRcdFx0XHQobXNnLiQgJiYgKG1zZy4kID09PSAobXNnLiQuX3x8JycpLiQpKSB8fCAobXNnLiQgPSBndW4pO1xuXHRcdFx0XHRpZihtc2dbJ0AnXSAmJiAhbXNnLnB1dCl7IGFjayhtc2cpIH1cblx0XHRcdFx0aWYoIWF0LmFzayhtc2dbJ0AnXSwgbXNnKSl7IC8vIGlzIHRoaXMgbWFjaGluZSBsaXN0ZW5pbmcgZm9yIGFuIGFjaz9cblx0XHRcdFx0XHREQkcgJiYgKERCRy51ID0gK25ldyBEYXRlKTtcblx0XHRcdFx0XHRpZihtc2cucHV0KXsgcHV0KG1zZyk7IHJldHVybiB9IGVsc2Vcblx0XHRcdFx0XHRpZihtc2cuZ2V0KXsgR3VuLm9uLmdldChtc2csIGd1bikgfVxuXHRcdFx0XHR9XG5cdFx0XHRcdERCRyAmJiAoREJHLnVjID0gK25ldyBEYXRlKTtcblx0XHRcdFx0ZXZlLnRvLm5leHQobXNnKTtcblx0XHRcdFx0REJHICYmIChEQkcudWEgPSArbmV3IERhdGUpO1xuXHRcdFx0XHRpZihtc2cubnRzIHx8IG1zZy5OVFMpeyByZXR1cm4gfSAvLyBUT0RPOiBUaGlzIHNob3VsZG4ndCBiZSBpbiBjb3JlLCBidXQgZmFzdCB3YXkgdG8gcHJldmVudCBOVFMgc3ByZWFkLiBEZWxldGUgdGhpcyBsaW5lIGFmdGVyIGFsbCBwZWVycyBoYXZlIHVwZ3JhZGVkIHRvIG5ld2VyIHZlcnNpb25zLlxuXHRcdFx0XHRtc2cub3V0ID0gdW5pdmVyc2U7IGF0Lm9uKCdvdXQnLCBtc2cpO1xuXHRcdFx0XHREQkcgJiYgKERCRy51ZSA9ICtuZXcgRGF0ZSk7XG5cdFx0XHR9XG5cdFx0XHRmdW5jdGlvbiBwdXQobXNnKXtcblx0XHRcdFx0aWYoIW1zZyl7IHJldHVybiB9XG5cdFx0XHRcdHZhciBjdHggPSBtc2cuX3x8JycsIHJvb3QgPSBjdHgucm9vdCA9ICgoY3R4LiQgPSBtc2cuJHx8JycpLl98fCcnKS5yb290O1xuXHRcdFx0XHRpZihtc2dbJ0AnXSAmJiBjdHguZmFpdGggJiYgIWN0eC5taXNzKXsgLy8gVE9ETzogQVhFIG1heSBzcGxpdC9yb3V0ZSBiYXNlZCBvbiAncHV0JyB3aGF0IHNob3VsZCB3ZSBkbyBoZXJlPyBEZXRlY3QgQCBpbiBBWEU/IEkgdGhpbmsgd2UgZG9uJ3QgaGF2ZSB0byB3b3JyeSwgYXMgREFNIHdpbGwgcm91dGUgaXQgb24gQC5cblx0XHRcdFx0XHRtc2cub3V0ID0gdW5pdmVyc2U7XG5cdFx0XHRcdFx0cm9vdC5vbignb3V0JywgbXNnKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0Y3R4LmxhdGNoID0gcm9vdC5oYXRjaDsgY3R4Lm1hdGNoID0gcm9vdC5oYXRjaCA9IFtdO1xuXHRcdFx0XHR2YXIgcHV0ID0gbXNnLnB1dDtcblx0XHRcdFx0dmFyIERCRyA9IGN0eC5EQkcgPSBtc2cuREJHLCBTID0gK25ldyBEYXRlOyBDVCA9IENUIHx8IFM7XG5cdFx0XHRcdGlmKHB1dFsnIyddICYmIHB1dFsnLiddKXsgLypyb290ICYmIHJvb3Qub24oJ3B1dCcsIG1zZyk7Ki8gcmV0dXJuIH0gLy8gVE9ETzogQlVHISBUaGlzIG5lZWRzIHRvIGNhbGwgSEFNIGluc3RlYWQuXG5cdFx0XHRcdERCRyAmJiAoREJHLnAgPSBTKTtcblx0XHRcdFx0Y3R4WycjJ10gPSBtc2dbJyMnXTtcblx0XHRcdFx0Y3R4Lm1zZyA9IG1zZztcblx0XHRcdFx0Y3R4LmFsbCA9IDA7XG5cdFx0XHRcdGN0eC5zdHVuID0gMTtcblx0XHRcdFx0dmFyIG5sID0gT2JqZWN0LmtleXMocHV0KTsvLy5zb3J0KCk7IC8vIFRPRE86IFRoaXMgaXMgdW5ib3VuZGVkIG9wZXJhdGlvbiwgbGFyZ2UgZ3JhcGhzIHdpbGwgYmUgc2xvd2VyLiBXcml0ZSBvdXIgb3duIENQVSBzY2hlZHVsZWQgc29ydD8gT3Igc29tZWhvdyBkbyBpdCBpbiBiZWxvdz8gS2V5cyBpdHNlbGYgaXMgbm90IE8oMSkgZWl0aGVyLCBjcmVhdGUgRVM1IHNoaW0gb3ZlciA/d2VhayBtYXA/IG9yIGN1c3RvbSB3aGljaCBpcyBjb25zdGFudC5cblx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8Y3R4KS5wayA9ICtuZXcgRGF0ZSkgLSBTLCAncHV0IHNvcnQnKTtcblx0XHRcdFx0dmFyIG5pID0gMCwgbmosIGtsLCBzb3VsLCBub2RlLCBzdGF0ZXMsIGVyciwgdG1wO1xuXHRcdFx0XHQoZnVuY3Rpb24gcG9wKG8pe1xuXHRcdFx0XHRcdGlmKG5qICE9IG5pKXsgbmogPSBuaTtcblx0XHRcdFx0XHRcdGlmKCEoc291bCA9IG5sW25pXSkpe1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICgoREJHfHxjdHgpLnBkID0gK25ldyBEYXRlKSAtIFMsICdwdXQnKTtcblx0XHRcdFx0XHRcdFx0ZmlyZShjdHgpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZighKG5vZGUgPSBwdXRbc291bF0pKXsgZXJyID0gRVJSK2N1dChzb3VsKStcIm5vIG5vZGUuXCIgfSBlbHNlXG5cdFx0XHRcdFx0XHRpZighKHRtcCA9IG5vZGUuXykpeyBlcnIgPSBFUlIrY3V0KHNvdWwpK1wibm8gbWV0YS5cIiB9IGVsc2Vcblx0XHRcdFx0XHRcdGlmKHNvdWwgIT09IHRtcFsnIyddKXsgZXJyID0gRVJSK2N1dChzb3VsKStcInNvdWwgbm90IHNhbWUuXCIgfSBlbHNlXG5cdFx0XHRcdFx0XHRpZighKHN0YXRlcyA9IHRtcFsnPiddKSl7IGVyciA9IEVSUitjdXQoc291bCkrXCJubyBzdGF0ZS5cIiB9XG5cdFx0XHRcdFx0XHRrbCA9IE9iamVjdC5rZXlzKG5vZGV8fHt9KTsgLy8gVE9ETzogLmtleXMoIGlzIHNsb3dcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoZXJyKXtcblx0XHRcdFx0XHRcdG1zZy5lcnIgPSBjdHguZXJyID0gZXJyOyAvLyBpbnZhbGlkIGRhdGEgc2hvdWxkIGVycm9yIGFuZCBzdHVuIHRoZSBtZXNzYWdlLlxuXHRcdFx0XHRcdFx0ZmlyZShjdHgpO1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImhhbmRsZSBlcnJvciFcIiwgZXJyKSAvLyBoYW5kbGUhXG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHZhciBpID0gMCwga2V5OyBvID0gbyB8fCAwO1xuXHRcdFx0XHRcdHdoaWxlKG8rKyA8IDkgJiYgKGtleSA9IGtsW2krK10pKXtcblx0XHRcdFx0XHRcdGlmKCdfJyA9PT0ga2V5KXsgY29udGludWUgfVxuXHRcdFx0XHRcdFx0dmFyIHZhbCA9IG5vZGVba2V5XSwgc3RhdGUgPSBzdGF0ZXNba2V5XTtcblx0XHRcdFx0XHRcdGlmKHUgPT09IHN0YXRlKXsgZXJyID0gRVJSK2N1dChrZXkpK1wib25cIitjdXQoc291bCkrXCJubyBzdGF0ZS5cIjsgYnJlYWsgfVxuXHRcdFx0XHRcdFx0aWYoIXZhbGlkKHZhbCkpeyBlcnIgPSBFUlIrY3V0KGtleSkrXCJvblwiK2N1dChzb3VsKStcImJhZCBcIisodHlwZW9mIHZhbCkrY3V0KHZhbCk7IGJyZWFrIH1cblx0XHRcdFx0XHRcdC8vY3R4LmFsbCsrOyAvL2N0eC5hY2tbc291bCtrZXldID0gJyc7XG5cdFx0XHRcdFx0XHRoYW0odmFsLCBrZXksIHNvdWwsIHN0YXRlLCBtc2cpO1xuXHRcdFx0XHRcdFx0KytDOyAvLyBjb3VydGVzeSBjb3VudDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoKGtsID0ga2wuc2xpY2UoaSkpLmxlbmd0aCl7IHR1cm4ocG9wKTsgcmV0dXJuIH1cblx0XHRcdFx0XHQrK25pOyBrbCA9IG51bGw7IHBvcChvKTtcblx0XHRcdFx0fSgpKTtcblx0XHRcdH0gR3VuLm9uLnB1dCA9IHB1dDtcblx0XHRcdC8vIFRPRE86IE1BUkshISEgY2xvY2sgYmVsb3csIHJlY29ubmVjdCBzeW5jLCBTRUEgY2VydGlmeSB3aXJlIG1lcmdlLCBVc2VyLmF1dGggdGFraW5nIG11bHRpcGxlIHRpbWVzLCAvLyBtc2cgcHV0LCBwdXQsIHNheSBhY2ssIGhlYXIgbG9vcC4uLlxuXHRcdFx0Ly8gV0FTSVMgQlVHISBsb2NhbCBwZWVyIG5vdCBhY2suIC5vZmYgb3RoZXIgcGVvcGxlOiAub3BlblxuXHRcdFx0ZnVuY3Rpb24gaGFtKHZhbCwga2V5LCBzb3VsLCBzdGF0ZSwgbXNnKXtcblx0XHRcdFx0dmFyIGN0eCA9IG1zZy5ffHwnJywgcm9vdCA9IGN0eC5yb290LCBncmFwaCA9IHJvb3QuZ3JhcGgsIGxvdCwgdG1wO1xuXHRcdFx0XHR2YXIgdmVydGV4ID0gZ3JhcGhbc291bF0gfHwgZW1wdHksIHdhcyA9IHN0YXRlX2lzKHZlcnRleCwga2V5LCAxKSwga25vd24gPSB2ZXJ0ZXhba2V5XTtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBEQkcgPSBjdHguREJHOyBpZih0bXAgPSBjb25zb2xlLlNUQVQpeyBpZighZ3JhcGhbc291bF0gfHwgIWtub3duKXsgdG1wLmhhcyA9ICh0bXAuaGFzIHx8IDApICsgMSB9IH1cblxuXHRcdFx0XHR2YXIgbm93ID0gU3RhdGUoKSwgdTtcblx0XHRcdFx0aWYoc3RhdGUgPiBub3cpe1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgaGFtKHZhbCwga2V5LCBzb3VsLCBzdGF0ZSwgbXNnKSB9LCAodG1wID0gc3RhdGUgLSBub3cpID4gTUQ/IE1EIDogdG1wKTsgLy8gTWF4IERlZmVyIDMyYml0LiA6KFxuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoKChEQkd8fGN0eCkuSGYgPSArbmV3IERhdGUpLCB0bXAsICdmdXR1cmUnKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoc3RhdGUgPCB3YXMpeyAvKm9sZDsqLyBpZighY3R4Lm1pc3MpeyByZXR1cm4gfSB9IC8vIGJ1dCBzb21lIGNoYWlucyBoYXZlIGEgY2FjaGUgbWlzcyB0aGF0IG5lZWQgdG8gcmUtZmlyZS4gLy8gVE9ETzogSW1wcm92ZSBpbiBmdXR1cmUuIC8vIGZvciBBWEUgdGhpcyB3b3VsZCByZWR1Y2UgcmVicm9hZGNhc3QsIGJ1dCBHVU4gZG9lcyBpdCBvbiBtZXNzYWdlIGZvcndhcmRpbmcuXG5cdFx0XHRcdGlmKCFjdHguZmFpdGgpeyAvLyBUT0RPOiBCVUc/IENhbiB0aGlzIGJlIHVzZWQgZm9yIGNhY2hlIG1pc3MgYXMgd2VsbD8gLy8gWWVzIHRoaXMgd2FzIGEgYnVnLCBuZWVkIHRvIGNoZWNrIGNhY2hlIG1pc3MgZm9yIFJBRCB0ZXN0cywgYnV0IHNob3VsZCB3ZSBjYXJlIGFib3V0IHRoZSBmYWl0aCBjaGVjayBub3c/IFByb2JhYmx5IG5vdC5cblx0XHRcdFx0XHRpZihzdGF0ZSA9PT0gd2FzICYmICh2YWwgPT09IGtub3duIHx8IEwodmFsKSA8PSBMKGtub3duKSkpeyAvKmNvbnNvbGUubG9nKFwic2FtZVwiKTsqLyAvKnNhbWU7Ki8gaWYoIWN0eC5taXNzKXsgcmV0dXJuIH0gfSAvLyBzYW1lXG5cdFx0XHRcdH1cblx0XHRcdFx0Y3R4LnN0dW4rKzsgLy8gVE9ETzogJ2ZvcmdldCcgZmVhdHVyZSBpbiBTRUEgdGllZCB0byB0aGlzLCBiYWQgYXBwcm9hY2gsIGJ1dCBoYWNrZWQgaW4gZm9yIG5vdy4gQW55IGNoYW5nZXMgaGVyZSBtdXN0IHVwZGF0ZSB0aGVyZS5cblx0XHRcdFx0dmFyIGFpZCA9IG1zZ1snIyddK2N0eC5hbGwrKywgaWQgPSB7dG9TdHJpbmc6IGZ1bmN0aW9uKCl7IHJldHVybiBhaWQgfSwgXzogY3R4fTsgaWQudG9KU09OID0gaWQudG9TdHJpbmc7IC8vIHRoaXMgKnRyaWNrKiBtYWtlcyBpdCBjb21wYXRpYmxlIGJldHdlZW4gb2xkICYgbmV3IHZlcnNpb25zLlxuXHRcdFx0XHREQkcgJiYgKERCRy5waCA9IERCRy5waCB8fCArbmV3IERhdGUpO1xuXHRcdFx0XHRyb290Lm9uKCdwdXQnLCB7JyMnOiBpZCwgJ0AnOiBtc2dbJ0AnXSwgcHV0OiB7JyMnOiBzb3VsLCAnLic6IGtleSwgJzonOiB2YWwsICc+Jzogc3RhdGV9LCBfOiBjdHh9KTtcblx0XHRcdH1cblx0XHRcdGZ1bmN0aW9uIG1hcChtc2cpe1xuXHRcdFx0XHR2YXIgREJHOyBpZihEQkcgPSAobXNnLl98fCcnKS5EQkcpeyBEQkcucGEgPSArbmV3IERhdGU7IERCRy5wbSA9IERCRy5wbSB8fCArbmV3IERhdGV9XG4gICAgICBcdHZhciBldmUgPSB0aGlzLCByb290ID0gZXZlLmFzLCBncmFwaCA9IHJvb3QuZ3JhcGgsIGN0eCA9IG1zZy5fLCBwdXQgPSBtc2cucHV0LCBzb3VsID0gcHV0WycjJ10sIGtleSA9IHB1dFsnLiddLCB2YWwgPSBwdXRbJzonXSwgc3RhdGUgPSBwdXRbJz4nXSwgaWQgPSBtc2dbJyMnXSwgdG1wO1xuICAgICAgXHRpZigodG1wID0gY3R4Lm1zZykgJiYgKHRtcCA9IHRtcC5wdXQpICYmICh0bXAgPSB0bXBbc291bF0pKXsgc3RhdGVfaWZ5KHRtcCwga2V5LCBzdGF0ZSwgdmFsLCBzb3VsKSB9IC8vIG5lY2Vzc2FyeSEgb3IgZWxzZSBvdXQgbWVzc2FnZXMgZG8gbm90IGdldCBTRUEgdHJhbnNmb3Jtcy5cblx0XHRcdFx0Z3JhcGhbc291bF0gPSBzdGF0ZV9pZnkoZ3JhcGhbc291bF0sIGtleSwgc3RhdGUsIHZhbCwgc291bCk7XG5cdFx0XHRcdGlmKHRtcCA9IChyb290Lm5leHR8fCcnKVtzb3VsXSl7IHRtcC5vbignaW4nLCBtc2cpIH1cblx0XHRcdFx0ZmlyZShjdHgpO1xuXHRcdFx0XHRldmUudG8ubmV4dChtc2cpO1xuXHRcdFx0fVxuXHRcdFx0ZnVuY3Rpb24gZmlyZShjdHgsIG1zZyl7IHZhciByb290O1xuXHRcdFx0XHRpZihjdHguc3RvcCl7IHJldHVybiB9XG5cdFx0XHRcdGlmKCFjdHguZXJyICYmIDAgPCAtLWN0eC5zdHVuKXsgcmV0dXJuIH0gLy8gVE9ETzogJ2ZvcmdldCcgZmVhdHVyZSBpbiBTRUEgdGllZCB0byB0aGlzLCBiYWQgYXBwcm9hY2gsIGJ1dCBoYWNrZWQgaW4gZm9yIG5vdy4gQW55IGNoYW5nZXMgaGVyZSBtdXN0IHVwZGF0ZSB0aGVyZS5cblx0XHRcdFx0Y3R4LnN0b3AgPSAxO1xuXHRcdFx0XHRpZighKHJvb3QgPSBjdHgucm9vdCkpeyByZXR1cm4gfVxuXHRcdFx0XHR2YXIgdG1wID0gY3R4Lm1hdGNoOyB0bXAuZW5kID0gMTtcblx0XHRcdFx0aWYodG1wID09PSByb290LmhhdGNoKXsgaWYoISh0bXAgPSBjdHgubGF0Y2gpIHx8IHRtcC5lbmQpeyBkZWxldGUgcm9vdC5oYXRjaCB9IGVsc2UgeyByb290LmhhdGNoID0gdG1wIH0gfVxuXHRcdFx0XHRjdHguaGF0Y2ggJiYgY3R4LmhhdGNoKCk7IC8vIFRPRE86IHJlbmFtZS9yZXdvcmsgaG93IHB1dCAmIHRoaXMgaW50ZXJhY3QuXG5cdFx0XHRcdHNldFRpbWVvdXQuZWFjaChjdHgubWF0Y2gsIGZ1bmN0aW9uKGNiKXtjYiAmJiBjYigpfSk7IFxuXHRcdFx0XHRpZighKG1zZyA9IGN0eC5tc2cpIHx8IGN0eC5lcnIgfHwgbXNnLmVycil7IHJldHVybiB9XG5cdFx0XHRcdG1zZy5vdXQgPSB1bml2ZXJzZTtcblx0XHRcdFx0Y3R4LnJvb3Qub24oJ291dCcsIG1zZyk7XG5cblx0XHRcdFx0Q0YoKTsgLy8gY291cnRlc3kgY2hlY2s7XG5cdFx0XHR9XG5cdFx0XHRmdW5jdGlvbiBhY2sobXNnKXsgLy8gYWdncmVnYXRlIEFDS3MuXG5cdFx0XHRcdHZhciBpZCA9IG1zZ1snQCddIHx8ICcnLCBjdHg7XG5cdFx0XHRcdGlmKCEoY3R4ID0gaWQuXykpeyByZXR1cm4gfVxuXHRcdFx0XHRjdHguYWNrcyA9IChjdHguYWNrc3x8MCkgKyAxO1xuXHRcdFx0XHRpZihjdHguZXJyID0gbXNnLmVycil7XG5cdFx0XHRcdFx0bXNnWydAJ10gPSBjdHhbJyMnXTtcblx0XHRcdFx0XHRmaXJlKGN0eCk7IC8vIFRPRE86IEJVRz8gSG93IGl0IHNraXBzL3N0b3BzIHByb3BhZ2F0aW9uIG9mIG1zZyBpZiBhbnkgMSBpdGVtIGlzIGVycm9yLCB0aGlzIHdvdWxkIGFzc3VtZSBhIHdob2xlIGJhdGNoL3Jlc3luYyBoYXMgc2FtZSBtYWxpY2lvdXMgaW50ZW50LlxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFjdHguc3RvcCAmJiAhY3R4LmNyYWNrKXsgY3R4LmNyYWNrID0gY3R4Lm1hdGNoICYmIGN0eC5tYXRjaC5wdXNoKGZ1bmN0aW9uKCl7YmFjayhjdHgpfSkgfSAvLyBoYW5kbGUgc3luY2hyb25vdXMgYWNrc1xuXHRcdFx0XHRiYWNrKGN0eCk7XG5cdFx0XHR9XG5cdFx0XHRmdW5jdGlvbiBiYWNrKGN0eCl7XG5cdFx0XHRcdGlmKCFjdHggfHwgIWN0eC5yb290KXsgcmV0dXJuIH1cblx0XHRcdFx0aWYoY3R4LnN0dW4gfHwgY3R4LmFja3MgIT09IGN0eC5hbGwpeyByZXR1cm4gfVxuXHRcdFx0XHRjdHgucm9vdC5vbignaW4nLCB7J0AnOiBjdHhbJyMnXSwgZXJyOiBjdHguZXJyLCBvazogY3R4LmVycj8gdSA6IHsnJzoxfX0pO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgRVJSID0gXCJFcnJvcjogSW52YWxpZCBncmFwaCFcIjtcblx0XHRcdHZhciBjdXQgPSBmdW5jdGlvbihzKXsgcmV0dXJuIFwiICdcIisoJycrcykuc2xpY2UoMCw5KStcIi4uLicgXCIgfVxuXHRcdFx0dmFyIEwgPSBKU09OLnN0cmluZ2lmeSwgTUQgPSAyMTQ3NDgzNjQ3LCBTdGF0ZSA9IEd1bi5zdGF0ZTtcblx0XHRcdHZhciBDID0gMCwgQ1QsIENGID0gZnVuY3Rpb24oKXtpZihDPjk5OSAmJiAoQy8tKENUIC0gKENUID0gK25ldyBEYXRlKSk+MSkpe0d1bi53aW5kb3cgJiYgY29uc29sZS5sb2coXCJXYXJuaW5nOiBZb3UncmUgc3luY2luZyAxSysgcmVjb3JkcyBhIHNlY29uZCwgZmFzdGVyIHRoYW4gRE9NIGNhbiB1cGRhdGUgLSBjb25zaWRlciBsaW1pdGluZyBxdWVyeS5cIik7Q0Y9ZnVuY3Rpb24oKXtDPTB9fX07XG5cblx0XHR9KCkpO1xuXG5cdFx0OyhmdW5jdGlvbigpe1xuXHRcdFx0R3VuLm9uLmdldCA9IGZ1bmN0aW9uKG1zZywgZ3VuKXtcblx0XHRcdFx0dmFyIHJvb3QgPSBndW4uXywgZ2V0ID0gbXNnLmdldCwgc291bCA9IGdldFsnIyddLCBub2RlID0gcm9vdC5ncmFwaFtzb3VsXSwgaGFzID0gZ2V0WycuJ107XG5cdFx0XHRcdHZhciBuZXh0ID0gcm9vdC5uZXh0IHx8IChyb290Lm5leHQgPSB7fSksIGF0ID0gbmV4dFtzb3VsXTtcblx0XHRcdFx0Ly8gcXVldWUgY29uY3VycmVudCBHRVRzP1xuXHRcdFx0XHQvLyBUT0RPOiBjb25zaWRlciB0YWdnaW5nIG9yaWdpbmFsIG1lc3NhZ2UgaW50byBkdXAgZm9yIERBTS5cblx0XHRcdFx0Ly8gVE9ETzogXiBhYm92ZT8gSW4gY2hhdCBhcHAsIDEyIG1lc3NhZ2VzIHJlc3VsdGVkIGluIHNhbWUgcGVlciBhc2tpbmcgZm9yIGAjdXNlci5wdWJgIDEyIHRpbWVzLiAoc2FtZSB3aXRoICN1c2VyIEdFVCB0b28sIHlpcGVzISkgLy8gREFNIG5vdGU6IFRoaXMgYWxzbyByZXN1bHRlZCBpbiAxMiByZXBsaWVzIGZyb20gMSBwZWVyIHdoaWNoIGFsbCBoYWQgc2FtZSAjI2hhc2ggYnV0IG5vbmUgb2YgdGhlbSBkZWR1cGVkIGJlY2F1c2UgZWFjaCBnZXQgd2FzIGRpZmZlcmVudC5cblx0XHRcdFx0Ly8gVE9ETzogTW92aW5nIHF1aWNrIGhhY2tzIGZpeGluZyB0aGVzZSB0aGluZ3MgdG8gYXhlIGZvciBub3cuXG5cdFx0XHRcdC8vIFRPRE86IGEgbG90IG9mIEdFVCAjZm9vIHRoZW4gR0VUICNmb28uXCJcIiBoYXBwZW5pbmcsIHdoeT9cblx0XHRcdFx0Ly8gVE9ETzogREFNJ3MgIyMgaGFzaCBjaGVjaywgb24gc2FtZSBnZXQgQUNLLCBwcm9kdWNpbmcgbXVsdGlwbGUgcmVwbGllcyBzdGlsbCwgbWF5YmUgSlNPTiB2cyBZU09OP1xuXHRcdFx0XHQvLyBUTVAgbm90ZSBmb3Igbm93OiB2aU1acTFzbEcgd2FzIGNoYXQgTEVYIHF1ZXJ5ICMuXG5cdFx0XHRcdC8qaWYoZ3VuICE9PSAodG1wID0gbXNnLiQpICYmICh0bXAgPSAodG1wfHwnJykuXykpe1xuXHRcdFx0XHRcdGlmKHRtcC5RKXsgdG1wLlFbbXNnWycjJ11dID0gJyc7IHJldHVybiB9IC8vIGNoYWluIGRvZXMgbm90IG5lZWQgdG8gYXNrIGZvciBpdCBhZ2Fpbi5cblx0XHRcdFx0XHR0bXAuUSA9IHt9O1xuXHRcdFx0XHR9Ki9cblx0XHRcdFx0LyppZih1ID09PSBoYXMpe1xuXHRcdFx0XHRcdGlmKGF0LlEpe1xuXHRcdFx0XHRcdFx0Ly9hdC5RW21zZ1snIyddXSA9ICcnO1xuXHRcdFx0XHRcdFx0Ly9yZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGF0LlEgPSB7fTtcblx0XHRcdFx0fSovXG5cdFx0XHRcdHZhciBjdHggPSBtc2cuX3x8e30sIERCRyA9IGN0eC5EQkcgPSBtc2cuREJHO1xuXHRcdFx0XHREQkcgJiYgKERCRy5nID0gK25ldyBEYXRlKTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIkdFVDpcIiwgZ2V0LCBub2RlLCBoYXMpO1xuXHRcdFx0XHRpZighbm9kZSl7IHJldHVybiByb290Lm9uKCdnZXQnLCBtc2cpIH1cblx0XHRcdFx0aWYoaGFzKXtcblx0XHRcdFx0XHRpZignc3RyaW5nJyAhPSB0eXBlb2YgaGFzIHx8IHUgPT09IG5vZGVbaGFzXSl7IHJldHVybiByb290Lm9uKCdnZXQnLCBtc2cpIH1cblx0XHRcdFx0XHRub2RlID0gc3RhdGVfaWZ5KHt9LCBoYXMsIHN0YXRlX2lzKG5vZGUsIGhhcyksIG5vZGVbaGFzXSwgc291bCk7XG5cdFx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBhIGtleSBpbi1tZW1vcnksIGRvIHdlIHJlYWxseSBuZWVkIHRvIGZldGNoP1xuXHRcdFx0XHRcdC8vIE1heWJlLi4uIGluIGNhc2UgdGhlIGluLW1lbW9yeSBrZXkgd2UgaGF2ZSBpcyBhIGxvY2FsIHdyaXRlXG5cdFx0XHRcdFx0Ly8gd2Ugc3RpbGwgbmVlZCB0byB0cmlnZ2VyIGEgcHVsbC9tZXJnZSBmcm9tIHBlZXJzLlxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vR3VuLndpbmRvdz8gR3VuLm9iai5jb3B5KG5vZGUpIDogbm9kZTsgLy8gSE5QRVJGOiBJZiAhYnJvd3NlciBidW1wIFBlcmZvcm1hbmNlPyBJcyB0aGlzIHRvbyBkYW5nZXJvdXMgdG8gcmVmZXJlbmNlIHJvb3QgZ3JhcGg/IENvcHkgLyBzaGFsbG93IGNvcHkgdG9vIGV4cGVuc2l2ZSBmb3IgYmlnIG5vZGVzLiBHdW4ub2JqLnRvKG5vZGUpOyAvLyAxIGxheWVyIGRlZXAgY29weSAvLyBHdW4ub2JqLmNvcHkobm9kZSk7IC8vIHRvbyBzbG93IG9uIGJpZyBub2Rlc1xuXHRcdFx0XHRub2RlICYmIGFjayhtc2csIG5vZGUpO1xuXHRcdFx0XHRyb290Lm9uKCdnZXQnLCBtc2cpOyAvLyBzZW5kIEdFVCB0byBzdG9yYWdlIGFkYXB0ZXJzLlxuXHRcdFx0fVxuXHRcdFx0ZnVuY3Rpb24gYWNrKG1zZywgbm9kZSl7XG5cdFx0XHRcdHZhciBTID0gK25ldyBEYXRlLCBjdHggPSBtc2cuX3x8e30sIERCRyA9IGN0eC5EQkcgPSBtc2cuREJHO1xuXHRcdFx0XHR2YXIgdG8gPSBtc2dbJyMnXSwgaWQgPSB0ZXh0X3JhbmQoOSksIGtleXMgPSBPYmplY3Qua2V5cyhub2RlfHwnJykuc29ydCgpLCBzb3VsID0gKChub2RlfHwnJykuX3x8JycpWycjJ10sIGtsID0ga2V5cy5sZW5ndGgsIGogPSAwLCByb290ID0gbXNnLiQuXy5yb290LCBGID0gKG5vZGUgPT09IHJvb3QuZ3JhcGhbc291bF0pO1xuXHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICgoREJHfHxjdHgpLmdrID0gK25ldyBEYXRlKSAtIFMsICdnb3Qga2V5cycpO1xuXHRcdFx0XHQvLyBQRVJGOiBDb25zaWRlciBjb21tZW50aW5nIHRoaXMgb3V0IHRvIGZvcmNlIGRpc2stb25seSByZWFkcyBmb3IgcGVyZiB0ZXN0aW5nPyAvLyBUT0RPOiAua2V5cyggaXMgc2xvd1xuXHRcdFx0XHRub2RlICYmIChmdW5jdGlvbiBnbygpe1xuXHRcdFx0XHRcdFMgPSArbmV3IERhdGU7XG5cdFx0XHRcdFx0dmFyIGkgPSAwLCBrLCBwdXQgPSB7fSwgdG1wO1xuXHRcdFx0XHRcdHdoaWxlKGkgPCA5ICYmIChrID0ga2V5c1tpKytdKSl7XG5cdFx0XHRcdFx0XHRzdGF0ZV9pZnkocHV0LCBrLCBzdGF0ZV9pcyhub2RlLCBrKSwgbm9kZVtrXSwgc291bCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGtleXMgPSBrZXlzLnNsaWNlKGkpO1xuXHRcdFx0XHRcdCh0bXAgPSB7fSlbc291bF0gPSBwdXQ7IHB1dCA9IHRtcDtcblx0XHRcdFx0XHR2YXIgZmFpdGg7IGlmKEYpeyBmYWl0aCA9IGZ1bmN0aW9uKCl7fTsgZmFpdGgucmFtID0gZmFpdGguZmFpdGggPSB0cnVlOyB9IC8vIEhOUEVSRjogV2UncmUgdGVzdGluZyBwZXJmb3JtYW5jZSBpbXByb3ZlbWVudCBieSBza2lwcGluZyBnb2luZyB0aHJvdWdoIHNlY3VyaXR5IGFnYWluLCBidXQgdGhpcyBzaG91bGQgYmUgYXVkaXRlZC5cblx0XHRcdFx0XHR0bXAgPSBrZXlzLmxlbmd0aDtcblx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsIC0oUyAtIChTID0gK25ldyBEYXRlKSksICdnb3QgY29waWVkIHNvbWUnKTtcblx0XHRcdFx0XHREQkcgJiYgKERCRy5nYSA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRcdFx0cm9vdC5vbignaW4nLCB7J0AnOiB0bywgJyMnOiBpZCwgcHV0OiBwdXQsICclJzogKHRtcD8gKGlkID0gdGV4dF9yYW5kKDkpKSA6IHUpLCAkOiByb290LiQsIF86IGZhaXRoLCBEQkc6IERCR30pO1xuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ2dvdCBpbicpO1xuXHRcdFx0XHRcdGlmKCF0bXApeyByZXR1cm4gfVxuXHRcdFx0XHRcdHNldFRpbWVvdXQudHVybihnbyk7XG5cdFx0XHRcdH0oKSk7XG5cdFx0XHRcdGlmKCFub2RlKXsgcm9vdC5vbignaW4nLCB7J0AnOiBtc2dbJyMnXX0pIH0gLy8gVE9ETzogSSBkb24ndCB0aGluayBJIGxpa2UgdGhpcywgdGhlIGRlZmF1bHQgbFMgYWRhcHRlciB1c2VzIHRoaXMgYnV0IFwibm90IGZvdW5kXCIgaXMgYSBzZW5zaXRpdmUgaXNzdWUsIHNvIHNob3VsZCBwcm9iYWJseSBiZSBoYW5kbGVkIG1vcmUgY2FyZWZ1bGx5L2luZGl2aWR1YWxseS5cblx0XHRcdH0gR3VuLm9uLmdldC5hY2sgPSBhY2s7XG5cdFx0fSgpKTtcblxuXHRcdDsoZnVuY3Rpb24oKXtcblx0XHRcdEd1bi5jaGFpbi5vcHQgPSBmdW5jdGlvbihvcHQpe1xuXHRcdFx0XHRvcHQgPSBvcHQgfHwge307XG5cdFx0XHRcdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fLCB0bXAgPSBvcHQucGVlcnMgfHwgb3B0O1xuXHRcdFx0XHRpZighT2JqZWN0LnBsYWluKG9wdCkpeyBvcHQgPSB7fSB9XG5cdFx0XHRcdGlmKCFPYmplY3QucGxhaW4oYXQub3B0KSl7IGF0Lm9wdCA9IG9wdCB9XG5cdFx0XHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiB0bXApeyB0bXAgPSBbdG1wXSB9XG5cdFx0XHRcdGlmKCFPYmplY3QucGxhaW4oYXQub3B0LnBlZXJzKSl7IGF0Lm9wdC5wZWVycyA9IHt9fVxuXHRcdFx0XHRpZih0bXAgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0XHRcdFx0b3B0LnBlZXJzID0ge307XG5cdFx0XHRcdFx0dG1wLmZvckVhY2goZnVuY3Rpb24odXJsKXtcblx0XHRcdFx0XHRcdHZhciBwID0ge307IHAuaWQgPSBwLnVybCA9IHVybDtcblx0XHRcdFx0XHRcdG9wdC5wZWVyc1t1cmxdID0gYXQub3B0LnBlZXJzW3VybF0gPSBhdC5vcHQucGVlcnNbdXJsXSB8fCBwO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdFx0b2JqX2VhY2gob3B0LCBmdW5jdGlvbiBlYWNoKGspeyB2YXIgdiA9IHRoaXNba107XG5cdFx0XHRcdFx0aWYoKHRoaXMgJiYgdGhpcy5oYXNPd25Qcm9wZXJ0eShrKSkgfHwgJ3N0cmluZycgPT0gdHlwZW9mIHYgfHwgT2JqZWN0LmVtcHR5KHYpKXsgdGhpc1trXSA9IHY7IHJldHVybiB9XG5cdFx0XHRcdFx0aWYodiAmJiB2LmNvbnN0cnVjdG9yICE9PSBPYmplY3QgJiYgISh2IGluc3RhbmNlb2YgQXJyYXkpKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRvYmpfZWFjaCh2LCBlYWNoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGF0Lm9wdC5mcm9tID0gb3B0O1xuXHRcdFx0XHRHdW4ub24oJ29wdCcsIGF0KTtcblx0XHRcdFx0YXQub3B0LnV1aWQgPSBhdC5vcHQudXVpZCB8fCBmdW5jdGlvbiB1dWlkKGwpeyByZXR1cm4gR3VuLnN0YXRlKCkudG9TdHJpbmcoMzYpLnJlcGxhY2UoJy4nLCcnKSArIFN0cmluZy5yYW5kb20obHx8MTIpIH1cblx0XHRcdFx0cmV0dXJuIGd1bjtcblx0XHRcdH1cblx0XHR9KCkpO1xuXG5cdFx0dmFyIG9ial9lYWNoID0gZnVuY3Rpb24obyxmKXsgT2JqZWN0LmtleXMobykuZm9yRWFjaChmLG8pIH0sIHRleHRfcmFuZCA9IFN0cmluZy5yYW5kb20sIHR1cm4gPSBzZXRUaW1lb3V0LnR1cm4sIHZhbGlkID0gR3VuLnZhbGlkLCBzdGF0ZV9pcyA9IEd1bi5zdGF0ZS5pcywgc3RhdGVfaWZ5ID0gR3VuLnN0YXRlLmlmeSwgdSwgZW1wdHkgPSB7fSwgQztcblxuXHRcdEd1bi5sb2cgPSBmdW5jdGlvbigpeyByZXR1cm4gKCFHdW4ubG9nLm9mZiAmJiBDLmxvZy5hcHBseShDLCBhcmd1bWVudHMpKSwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oJyAnKSB9O1xuXHRcdEd1bi5sb2cub25jZSA9IGZ1bmN0aW9uKHcscyxvKXsgcmV0dXJuIChvID0gR3VuLmxvZy5vbmNlKVt3XSA9IG9bd10gfHwgMCwgb1t3XSsrIHx8IEd1bi5sb2cocykgfTtcblxuXHRcdGlmKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpeyAod2luZG93LkdVTiA9IHdpbmRvdy5HdW4gPSBHdW4pLndpbmRvdyA9IHdpbmRvdyB9XG5cdFx0dHJ5eyBpZih0eXBlb2YgTU9EVUxFICE9PSBcInVuZGVmaW5lZFwiKXsgTU9EVUxFLmV4cG9ydHMgPSBHdW4gfSB9Y2F0Y2goZSl7fVxuXHRcdG1vZHVsZS5leHBvcnRzID0gR3VuO1xuXHRcdFxuXHRcdChHdW4ud2luZG93fHx7fSkuY29uc29sZSA9IChHdW4ud2luZG93fHx7fSkuY29uc29sZSB8fCB7bG9nOiBmdW5jdGlvbigpe319O1xuXHRcdChDID0gY29uc29sZSkub25seSA9IGZ1bmN0aW9uKGksIHMpeyByZXR1cm4gKEMub25seS5pICYmIGkgPT09IEMub25seS5pICYmIEMub25seS5pKyspICYmIChDLmxvZy5hcHBseShDLCBhcmd1bWVudHMpIHx8IHMpIH07XG5cblx0XHQ7XCJQbGVhc2UgZG8gbm90IHJlbW92ZSB3ZWxjb21lIGxvZyB1bmxlc3MgeW91IGFyZSBwYXlpbmcgZm9yIGEgbW9udGhseSBzcG9uc29yc2hpcCwgdGhhbmtzIVwiO1xuXHRcdEd1bi5sb2cub25jZShcIndlbGNvbWVcIiwgXCJIZWxsbyB3b25kZXJmdWwgcGVyc29uISA6KSBUaGFua3MgZm9yIHVzaW5nIEdVTiwgcGxlYXNlIGFzayBmb3IgaGVscCBvbiBodHRwOi8vY2hhdC5ndW4uZWNvIGlmIGFueXRoaW5nIHRha2VzIHlvdSBsb25nZXIgdGhhbiA1bWluIHRvIGZpZ3VyZSBvdXQhXCIpO1xuXHR9KShVU0UsICcuL3Jvb3QnKTtcblxuXHQ7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG5cdFx0dmFyIEd1biA9IFVTRSgnLi9yb290Jyk7XG5cdFx0R3VuLmNoYWluLmJhY2sgPSBmdW5jdGlvbihuLCBvcHQpeyB2YXIgdG1wO1xuXHRcdFx0biA9IG4gfHwgMTtcblx0XHRcdGlmKC0xID09PSBuIHx8IEluZmluaXR5ID09PSBuKXtcblx0XHRcdFx0cmV0dXJuIHRoaXMuXy5yb290LiQ7XG5cdFx0XHR9IGVsc2Vcblx0XHRcdGlmKDEgPT09IG4pe1xuXHRcdFx0XHRyZXR1cm4gKHRoaXMuXy5iYWNrIHx8IHRoaXMuXykuJDtcblx0XHRcdH1cblx0XHRcdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fO1xuXHRcdFx0aWYodHlwZW9mIG4gPT09ICdzdHJpbmcnKXtcblx0XHRcdFx0biA9IG4uc3BsaXQoJy4nKTtcblx0XHRcdH1cblx0XHRcdGlmKG4gaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0XHRcdHZhciBpID0gMCwgbCA9IG4ubGVuZ3RoLCB0bXAgPSBhdDtcblx0XHRcdFx0Zm9yKGk7IGkgPCBsOyBpKyspe1xuXHRcdFx0XHRcdHRtcCA9ICh0bXB8fGVtcHR5KVtuW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZih1ICE9PSB0bXApe1xuXHRcdFx0XHRcdHJldHVybiBvcHQ/IGd1biA6IHRtcDtcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdGlmKCh0bXAgPSBhdC5iYWNrKSl7XG5cdFx0XHRcdFx0cmV0dXJuIHRtcC4kLmJhY2sobiwgb3B0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZignZnVuY3Rpb24nID09IHR5cGVvZiBuKXtcblx0XHRcdFx0dmFyIHllcywgdG1wID0ge2JhY2s6IGF0fTtcblx0XHRcdFx0d2hpbGUoKHRtcCA9IHRtcC5iYWNrKVxuXHRcdFx0XHQmJiB1ID09PSAoeWVzID0gbih0bXAsIG9wdCkpKXt9XG5cdFx0XHRcdHJldHVybiB5ZXM7XG5cdFx0XHR9XG5cdFx0XHRpZignbnVtYmVyJyA9PSB0eXBlb2Ygbil7XG5cdFx0XHRcdHJldHVybiAoYXQuYmFjayB8fCBhdCkuJC5iYWNrKG4gLSAxKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0XHR2YXIgZW1wdHkgPSB7fSwgdTtcblx0fSkoVVNFLCAnLi9iYWNrJyk7XG5cblx0O1VTRShmdW5jdGlvbihtb2R1bGUpe1xuXHRcdC8vIFdBUk5JTkc6IEdVTiBpcyB2ZXJ5IHNpbXBsZSwgYnV0IHRoZSBKYXZhU2NyaXB0IGNoYWluaW5nIEFQSSBhcm91bmQgR1VOXG5cdFx0Ly8gaXMgY29tcGxpY2F0ZWQgYW5kIHdhcyBleHRyZW1lbHkgaGFyZCB0byBidWlsZC4gSWYgeW91IHBvcnQgR1VOIHRvIGFub3RoZXJcblx0XHQvLyBsYW5ndWFnZSwgY29uc2lkZXIgaW1wbGVtZW50aW5nIGFuIGVhc2llciBBUEkgdG8gYnVpbGQuXG5cdFx0dmFyIEd1biA9IFVTRSgnLi9yb290Jyk7XG5cdFx0R3VuLmNoYWluLmNoYWluID0gZnVuY3Rpb24oc3ViKXtcblx0XHRcdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fLCBjaGFpbiA9IG5ldyAoc3ViIHx8IGd1bikuY29uc3RydWN0b3IoZ3VuKSwgY2F0ID0gY2hhaW4uXywgcm9vdDtcblx0XHRcdGNhdC5yb290ID0gcm9vdCA9IGF0LnJvb3Q7XG5cdFx0XHRjYXQuaWQgPSArK3Jvb3Qub25jZTtcblx0XHRcdGNhdC5iYWNrID0gZ3VuLl87XG5cdFx0XHRjYXQub24gPSBHdW4ub247XG5cdFx0XHRjYXQub24oJ2luJywgR3VuLm9uLmluLCBjYXQpOyAvLyBGb3IgJ2luJyBpZiBJIGFkZCBteSBvd24gbGlzdGVuZXJzIHRvIGVhY2ggdGhlbiBJIE1VU1QgZG8gaXQgYmVmb3JlIGluIGdldHMgY2FsbGVkLiBJZiBJIGxpc3RlbiBnbG9iYWxseSBmb3IgYWxsIGluY29taW5nIGRhdGEgaW5zdGVhZCB0aG91Z2gsIHJlZ2FyZGxlc3Mgb2YgaW5kaXZpZHVhbCBsaXN0ZW5lcnMsIEkgY2FuIHRyYW5zZm9ybSB0aGUgZGF0YSB0aGVyZSBhbmQgdGhlbiBhcyB3ZWxsLlxuXHRcdFx0Y2F0Lm9uKCdvdXQnLCBHdW4ub24ub3V0LCBjYXQpOyAvLyBIb3dldmVyIGZvciBvdXRwdXQsIHRoZXJlIGlzbid0IHJlYWxseSB0aGUgZ2xvYmFsIG9wdGlvbi4gSSBtdXN0IGxpc3RlbiBieSBhZGRpbmcgbXkgb3duIGxpc3RlbmVyIGluZGl2aWR1YWxseSBCRUZPUkUgdGhpcyBvbmUgaXMgZXZlciBjYWxsZWQuXG5cdFx0XHRyZXR1cm4gY2hhaW47XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gb3V0cHV0KG1zZyl7XG5cdFx0XHR2YXIgcHV0LCBnZXQsIGF0ID0gdGhpcy5hcywgYmFjayA9IGF0LmJhY2ssIHJvb3QgPSBhdC5yb290LCB0bXA7XG5cdFx0XHRpZighbXNnLiQpeyBtc2cuJCA9IGF0LiQgfVxuXHRcdFx0dGhpcy50by5uZXh0KG1zZyk7XG5cdFx0XHRpZihhdC5lcnIpeyBhdC5vbignaW4nLCB7cHV0OiBhdC5wdXQgPSB1LCAkOiBhdC4kfSk7IHJldHVybiB9XG5cdFx0XHRpZihnZXQgPSBtc2cuZ2V0KXtcblx0XHRcdFx0LyppZih1ICE9PSBhdC5wdXQpe1xuXHRcdFx0XHRcdGF0Lm9uKCdpbicsIGF0KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH0qL1xuXHRcdFx0XHRpZihyb290LnBhc3MpeyByb290LnBhc3NbYXQuaWRdID0gYXQ7IH0gLy8gd2lsbCB0aGlzIG1ha2UgZm9yIGJ1Z2d5IGJlaGF2aW9yIGVsc2V3aGVyZT9cblx0XHRcdFx0aWYoYXQubGV4KXsgT2JqZWN0LmtleXMoYXQubGV4KS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBhdC5sZXhba10gfSwgdG1wID0gbXNnLmdldCA9IG1zZy5nZXQgfHwge30pIH1cblx0XHRcdFx0aWYoZ2V0WycjJ10gfHwgYXQuc291bCl7XG5cdFx0XHRcdFx0Z2V0WycjJ10gPSBnZXRbJyMnXSB8fCBhdC5zb3VsO1xuXHRcdFx0XHRcdG1zZ1snIyddIHx8IChtc2dbJyMnXSA9IHRleHRfcmFuZCg5KSk7IC8vIEEzMTIwID9cblx0XHRcdFx0XHRiYWNrID0gKHJvb3QuJC5nZXQoZ2V0WycjJ10pLl8pO1xuXHRcdFx0XHRcdGlmKCEoZ2V0ID0gZ2V0WycuJ10pKXsgLy8gc291bFxuXHRcdFx0XHRcdFx0dG1wID0gYmFjay5hc2sgJiYgYmFjay5hc2tbJyddOyAvLyBjaGVjayBpZiB3ZSBoYXZlIGFscmVhZHkgYXNrZWQgZm9yIHRoZSBmdWxsIG5vZGVcblx0XHRcdFx0XHRcdChiYWNrLmFzayB8fCAoYmFjay5hc2sgPSB7fSkpWycnXSA9IGJhY2s7IC8vIGFkZCBhIGZsYWcgdGhhdCB3ZSBhcmUgbm93LlxuXHRcdFx0XHRcdFx0aWYodSAhPT0gYmFjay5wdXQpeyAvLyBpZiB3ZSBhbHJlYWR5IGhhdmUgZGF0YSxcblx0XHRcdFx0XHRcdFx0YmFjay5vbignaW4nLCBiYWNrKTsgLy8gc2VuZCB3aGF0IGlzIGNhY2hlZCBkb3duIHRoZSBjaGFpblxuXHRcdFx0XHRcdFx0XHRpZih0bXApeyByZXR1cm4gfSAvLyBhbmQgZG9uJ3QgYXNrIGZvciBpdCBhZ2Fpbi5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG1zZy4kID0gYmFjay4kO1xuXHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdGlmKG9ial9oYXMoYmFjay5wdXQsIGdldCkpeyAvLyBUT0RPOiBzdXBwb3J0ICNMRVggIVxuXHRcdFx0XHRcdFx0dG1wID0gYmFjay5hc2sgJiYgYmFjay5hc2tbZ2V0XTtcblx0XHRcdFx0XHRcdChiYWNrLmFzayB8fCAoYmFjay5hc2sgPSB7fSkpW2dldF0gPSBiYWNrLiQuZ2V0KGdldCkuXztcblx0XHRcdFx0XHRcdGJhY2sub24oJ2luJywge2dldDogZ2V0LCBwdXQ6IHsnIyc6IGJhY2suc291bCwgJy4nOiBnZXQsICc6JzogYmFjay5wdXRbZ2V0XSwgJz4nOiBzdGF0ZV9pcyhyb290LmdyYXBoW2JhY2suc291bF0sIGdldCl9fSk7XG5cdFx0XHRcdFx0XHRpZih0bXApeyByZXR1cm4gfVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8qcHV0ID0gKGJhY2suJC5nZXQoZ2V0KS5fKTtcblx0XHRcdFx0XHRcdGlmKCEodG1wID0gcHV0LmFjaykpeyBwdXQuYWNrID0gLTEgfVxuXHRcdFx0XHRcdFx0YmFjay5vbignaW4nLCB7XG5cdFx0XHRcdFx0XHRcdCQ6IGJhY2suJCxcblx0XHRcdFx0XHRcdFx0cHV0OiBHdW4uc3RhdGUuaWZ5KHt9LCBnZXQsIEd1bi5zdGF0ZShiYWNrLnB1dCwgZ2V0KSwgYmFjay5wdXRbZ2V0XSksXG5cdFx0XHRcdFx0XHRcdGdldDogYmFjay5nZXRcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0aWYodG1wKXsgcmV0dXJuIH1cblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRpZignc3RyaW5nJyAhPSB0eXBlb2YgZ2V0KXtcblx0XHRcdFx0XHRcdHZhciBwdXQgPSB7fSwgbWV0YSA9IChiYWNrLnB1dHx8e30pLl87XG5cdFx0XHRcdFx0XHRHdW4ub2JqLm1hcChiYWNrLnB1dCwgZnVuY3Rpb24odixrKXtcblx0XHRcdFx0XHRcdFx0aWYoIUd1bi50ZXh0Lm1hdGNoKGssIGdldCkpeyByZXR1cm4gfVxuXHRcdFx0XHRcdFx0XHRwdXRba10gPSB2O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdGlmKCFHdW4ub2JqLmVtcHR5KHB1dCkpe1xuXHRcdFx0XHRcdFx0XHRwdXQuXyA9IG1ldGE7XG5cdFx0XHRcdFx0XHRcdGJhY2sub24oJ2luJywgeyQ6IGJhY2suJCwgcHV0OiBwdXQsIGdldDogYmFjay5nZXR9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYodG1wID0gYXQubGV4KXtcblx0XHRcdFx0XHRcdFx0dG1wID0gKHRtcC5fKSB8fCAodG1wLl8gPSBmdW5jdGlvbigpe30pO1xuXHRcdFx0XHRcdFx0XHRpZihiYWNrLmFjayA8IHRtcC5hc2speyB0bXAuYXNrID0gYmFjay5hY2sgfVxuXHRcdFx0XHRcdFx0XHRpZih0bXAuYXNrKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRcdFx0dG1wLmFzayA9IDE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCovXG5cdFx0XHRcdFx0cm9vdC5hc2soYWNrLCBtc2cpOyAvLyBBMzEyMCA/XG5cdFx0XHRcdFx0cmV0dXJuIHJvb3Qub24oJ2luJywgbXNnKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvL2lmKHJvb3Qubm93KXsgcm9vdC5ub3dbYXQuaWRdID0gcm9vdC5ub3dbYXQuaWRdIHx8IHRydWU7IGF0LnBhc3MgPSB7fSB9XG5cdFx0XHRcdGlmKGdldFsnLiddKXtcblx0XHRcdFx0XHRpZihhdC5nZXQpe1xuXHRcdFx0XHRcdFx0bXNnID0ge2dldDogeycuJzogYXQuZ2V0fSwgJDogYXQuJH07XG5cdFx0XHRcdFx0XHQoYmFjay5hc2sgfHwgKGJhY2suYXNrID0ge30pKVthdC5nZXRdID0gbXNnLiQuXzsgLy8gVE9ETzogUEVSRk9STUFOQ0U/IE1vcmUgZWxlZ2FudCB3YXk/XG5cdFx0XHRcdFx0XHRyZXR1cm4gYmFjay5vbignb3V0JywgbXNnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bXNnID0ge2dldDogYXQubGV4PyBtc2cuZ2V0IDoge30sICQ6IGF0LiR9O1xuXHRcdFx0XHRcdHJldHVybiBiYWNrLm9uKCdvdXQnLCBtc2cpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdChhdC5hc2sgfHwgKGF0LmFzayA9IHt9KSlbJyddID0gYXQ7XHQgLy9hdC5hY2sgPSBhdC5hY2sgfHwgLTE7XG5cdFx0XHRcdGlmKGF0LmdldCl7XG5cdFx0XHRcdFx0Z2V0WycuJ10gPSBhdC5nZXQ7XG5cdFx0XHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbYXQuZ2V0XSA9IG1zZy4kLl87IC8vIFRPRE86IFBFUkZPUk1BTkNFPyBNb3JlIGVsZWdhbnQgd2F5P1xuXHRcdFx0XHRcdHJldHVybiBiYWNrLm9uKCdvdXQnLCBtc2cpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYmFjay5vbignb3V0JywgbXNnKTtcblx0XHR9OyBHdW4ub24ub3V0ID0gb3V0cHV0O1xuXG5cdFx0ZnVuY3Rpb24gaW5wdXQobXNnLCBjYXQpeyBjYXQgPSBjYXQgfHwgdGhpcy5hczsgLy8gVE9ETzogVjggbWF5IG5vdCBiZSBhYmxlIHRvIG9wdGltaXplIGZ1bmN0aW9ucyB3aXRoIGRpZmZlcmVudCBwYXJhbWV0ZXIgY2FsbHMsIHNvIHRyeSB0byBkbyBiZW5jaG1hcmsgdG8gc2VlIGlmIHRoZXJlIGlzIGFueSBhY3R1YWwgZGlmZmVyZW5jZS5cblx0XHRcdHZhciByb290ID0gY2F0LnJvb3QsIGd1biA9IG1zZy4kIHx8IChtc2cuJCA9IGNhdC4kKSwgYXQgPSAoZ3VufHwnJykuXyB8fCBlbXB0eSwgdG1wID0gbXNnLnB1dHx8JycsIHNvdWwgPSB0bXBbJyMnXSwga2V5ID0gdG1wWycuJ10sIGNoYW5nZSA9ICh1ICE9PSB0bXBbJz0nXSk/IHRtcFsnPSddIDogdG1wWyc6J10sIHN0YXRlID0gdG1wWyc+J10gfHwgLUluZmluaXR5LCBzYXQ7IC8vIGV2ZSA9IGV2ZW50LCBhdCA9IGRhdGEgYXQsIGNhdCA9IGNoYWluIGF0LCBzYXQgPSBzdWIgYXQgKGNoaWxkcmVuIGNoYWlucykuXG5cdFx0XHRpZih1ICE9PSBtc2cucHV0ICYmICh1ID09PSB0bXBbJyMnXSB8fCB1ID09PSB0bXBbJy4nXSB8fCAodSA9PT0gdG1wWyc6J10gJiYgdSA9PT0gdG1wWyc9J10pIHx8IHUgPT09IHRtcFsnPiddKSl7IC8vIGNvbnZlcnQgZnJvbSBvbGQgZm9ybWF0XG5cdFx0XHRcdGlmKCF2YWxpZCh0bXApKXtcblx0XHRcdFx0XHRpZighKHNvdWwgPSAoKHRtcHx8JycpLl98fCcnKVsnIyddKSl7IGNvbnNvbGUubG9nKFwiY2hhaW4gbm90IHlldCBzdXBwb3J0ZWQgZm9yXCIsIHRtcCwgJy4uLicsIG1zZywgY2F0KTsgcmV0dXJuOyB9XG5cdFx0XHRcdFx0Z3VuID0gY2F0LnJvb3QuJC5nZXQoc291bCk7XG5cdFx0XHRcdFx0cmV0dXJuIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyh0bXApLnNvcnQoKSwgZnVuY3Rpb24oayl7IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93IC8vIEJVRz8gP1NvbWUgcmUtaW4gbG9naWMgbWF5IGRlcGVuZCBvbiB0aGlzIGJlaW5nIHN5bmM/XG5cdFx0XHRcdFx0XHRpZignXycgPT0gayB8fCB1ID09PSAoc3RhdGUgPSBzdGF0ZV9pcyh0bXAsIGspKSl7IHJldHVybiB9XG5cdFx0XHRcdFx0XHRjYXQub24oJ2luJywgeyQ6IGd1biwgcHV0OiB7JyMnOiBzb3VsLCAnLic6IGssICc9JzogdG1wW2tdLCAnPic6IHN0YXRlfSwgVklBOiBtc2d9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXQub24oJ2luJywgeyQ6IGF0LmJhY2suJCwgcHV0OiB7JyMnOiBzb3VsID0gYXQuYmFjay5zb3VsLCAnLic6IGtleSA9IGF0LmhhcyB8fCBhdC5nZXQsICc9JzogdG1wLCAnPic6IHN0YXRlX2lzKGF0LmJhY2sucHV0LCBrZXkpfSwgdmlhOiBtc2d9KTsgLy8gVE9ETzogVGhpcyBjb3VsZCBiZSBidWdneSEgSXQgYXNzdW1lcy9hcHByb3hlcyBkYXRhLCBvdGhlciBzdHVmZiBjb3VsZCBoYXZlIGNvcnJ1cHRlZCBpdC5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYoKG1zZy5zZWVufHwnJylbY2F0LmlkXSl7IHJldHVybiB9IChtc2cuc2VlbiB8fCAobXNnLnNlZW4gPSBmdW5jdGlvbigpe30pKVtjYXQuaWRdID0gY2F0OyAvLyBoZWxwIHN0b3Agc29tZSBpbmZpbml0ZSBsb29wc1xuXG5cdFx0XHRpZihjYXQgIT09IGF0KXsgLy8gZG9uJ3Qgd29ycnkgYWJvdXQgdGhpcyB3aGVuIGZpcnN0IHVuZGVyc3RhbmRpbmcgdGhlIGNvZGUsIGl0IGhhbmRsZXMgY2hhbmdpbmcgY29udGV4dHMgb24gYSBtZXNzYWdlLiBBIHNvdWwgY2hhaW4gd2lsbCBuZXZlciBoYXZlIGEgZGlmZmVyZW50IGNvbnRleHQuXG5cdFx0XHRcdE9iamVjdC5rZXlzKG1zZykuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnW2tdIH0sIHRtcCA9IHt9KTsgLy8gbWFrZSBjb3B5IG9mIG1lc3NhZ2Vcblx0XHRcdFx0dG1wLmdldCA9IGNhdC5nZXQgfHwgdG1wLmdldDtcblx0XHRcdFx0aWYoIWNhdC5zb3VsICYmICFjYXQuaGFzKXsgLy8gaWYgd2UgZG8gbm90IHJlY29nbml6ZSB0aGUgY2hhaW4gdHlwZVxuXHRcdFx0XHRcdHRtcC4kJCQgPSB0bXAuJCQkIHx8IGNhdC4kOyAvLyBtYWtlIGEgcmVmZXJlbmNlIHRvIHdoZXJldmVyIGl0IGNhbWUgZnJvbS5cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdGlmKGF0LnNvdWwpeyAvLyBhIGhhcyAocHJvcGVydHkpIGNoYWluIHdpbGwgaGF2ZSBhIGRpZmZlcmVudCBjb250ZXh0IHNvbWV0aW1lcyBpZiBpdCBpcyBsaW5rZWQgKHRvIGEgc291bCBjaGFpbikuIEFueXRoaW5nIHRoYXQgaXMgbm90IGEgc291bCBvciBoYXMgY2hhaW4sIHdpbGwgYWx3YXlzIGhhdmUgZGlmZmVyZW50IGNvbnRleHRzLlxuXHRcdFx0XHRcdHRtcC4kID0gY2F0LiQ7XG5cdFx0XHRcdFx0dG1wLiQkID0gdG1wLiQkIHx8IGF0LiQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0bXNnID0gdG1wOyAvLyB1c2UgdGhlIG1lc3NhZ2Ugd2l0aCB0aGUgbmV3IGNvbnRleHQgaW5zdGVhZDtcblx0XHRcdH1cblx0XHRcdHVubGluayhtc2csIGNhdCk7XG5cblx0XHRcdGlmKCgoY2F0LnNvdWwvKiAmJiAoY2F0LmFza3x8JycpWycnXSovKSB8fCBtc2cuJCQpICYmIHN0YXRlID49IHN0YXRlX2lzKHJvb3QuZ3JhcGhbc291bF0sIGtleSkpeyAvLyBUaGUgcm9vdCBoYXMgYW4gaW4tbWVtb3J5IGNhY2hlIG9mIHRoZSBncmFwaCwgYnV0IGlmIG91ciBwZWVyIGhhcyBhc2tlZCBmb3IgdGhlIGRhdGEgdGhlbiB3ZSB3YW50IGEgcGVyIGRlZHVwbGljYXRlZCBjaGFpbiBjb3B5IG9mIHRoZSBkYXRhIHRoYXQgbWlnaHQgaGF2ZSBsb2NhbCBlZGl0cyBvbiBpdC5cblx0XHRcdFx0KHRtcCA9IHJvb3QuJC5nZXQoc291bCkuXykucHV0ID0gc3RhdGVfaWZ5KHRtcC5wdXQsIGtleSwgc3RhdGUsIGNoYW5nZSwgc291bCk7XG5cdFx0XHR9XG5cdFx0XHRpZighYXQuc291bCAvKiYmIChhdC5hc2t8fCcnKVsnJ10qLyAmJiBzdGF0ZSA+PSBzdGF0ZV9pcyhyb290LmdyYXBoW3NvdWxdLCBrZXkpICYmIChzYXQgPSAocm9vdC4kLmdldChzb3VsKS5fLm5leHR8fCcnKVtrZXldKSl7IC8vIFNhbWUgYXMgYWJvdmUgaGVyZSwgYnV0IGZvciBvdGhlciB0eXBlcyBvZiBjaGFpbnMuIC8vIFRPRE86IEltcHJvdmUgcGVyZiBieSBwcmV2ZW50aW5nIGVjaG9lcyByZWNhY2hpbmcuXG5cdFx0XHRcdHNhdC5wdXQgPSBjaGFuZ2U7IC8vIHVwZGF0ZSBjYWNoZVxuXHRcdFx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgKHRtcCA9IHZhbGlkKGNoYW5nZSkpKXtcblx0XHRcdFx0XHRzYXQucHV0ID0gcm9vdC4kLmdldCh0bXApLl8ucHV0IHx8IGNoYW5nZTsgLy8gc2hhcmUgc2FtZSBjYWNoZSBhcyB3aGF0IHdlJ3JlIGxpbmtlZCB0by5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnRvICYmIHRoaXMudG8ubmV4dChtc2cpOyAvLyAxc3QgQVBJIGpvYiBpcyB0byBjYWxsIGFsbCBjaGFpbiBsaXN0ZW5lcnMuXG5cdFx0XHQvLyBUT0RPOiBNYWtlIGlucHV0IG1vcmUgcmV1c2FibGUgYnkgb25seSBkb2luZyB0aGVzZSAoc29tZT8pIGNhbGxzIGlmIHdlIGFyZSBhIGNoYWluIHdlIHJlY29nbml6ZT8gVGhpcyBtZWFucyBlYWNoIGlucHV0IGxpc3RlbmVyIHdvdWxkIGJlIHJlc3BvbnNpYmxlIGZvciB3aGVuIGxpc3RlbmVycyBuZWVkIHRvIGJlIGNhbGxlZCwgd2hpY2ggbWFrZXMgc2Vuc2UsIGFzIHRoZXkgbWlnaHQgd2FudCB0byBmaWx0ZXIuXG5cdFx0XHRjYXQuYW55ICYmIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhjYXQuYW55KSwgZnVuY3Rpb24oYW55KXsgKGFueSA9IGNhdC5hbnlbYW55XSkgJiYgYW55KG1zZykgfSwwLDk5KTsgLy8gMXN0IEFQSSBqb2IgaXMgdG8gY2FsbCBhbGwgY2hhaW4gbGlzdGVuZXJzLiAvLyBUT0RPOiAua2V5cyggaXMgc2xvdyAvLyBCVUc6IFNvbWUgcmUtaW4gbG9naWMgbWF5IGRlcGVuZCBvbiB0aGlzIGJlaW5nIHN5bmMuXG5cdFx0XHRjYXQuZWNobyAmJiBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMoY2F0LmVjaG8pLCBmdW5jdGlvbihsYXQpeyAobGF0ID0gY2F0LmVjaG9bbGF0XSkgJiYgbGF0Lm9uKCdpbicsIG1zZykgfSwwLDk5KTsgLy8gJiBsaW5rZWQgYXQgY2hhaW5zIC8vIFRPRE86IC5rZXlzKCBpcyBzbG93IC8vIEJVRzogU29tZSByZS1pbiBsb2dpYyBtYXkgZGVwZW5kIG9uIHRoaXMgYmVpbmcgc3luYy5cblxuXHRcdFx0aWYoKChtc2cuJCR8fCcnKS5ffHxhdCkuc291bCl7IC8vIGNvbW1lbnRzIGFyZSBsaW5lYXIsIGJ1dCB0aGlzIGxpbmUgb2YgY29kZSBpcyBub24tbGluZWFyLCBzbyBpZiBJIHdlcmUgdG8gY29tbWVudCB3aGF0IGl0IGRvZXMsIHlvdSdkIGhhdmUgdG8gcmVhZCA0MiBvdGhlciBjb21tZW50cyBmaXJzdC4uLiBidXQgeW91IGNhbid0IHJlYWQgYW55IG9mIHRob3NlIGNvbW1lbnRzIHVudGlsIHlvdSBmaXJzdCByZWFkIHRoaXMgY29tbWVudC4gV2hhdCE/IC8vIHNob3VsZG4ndCB0aGlzIG1hdGNoIGxpbmsncyBjaGVjaz9cblx0XHRcdFx0Ly8gaXMgdGhlcmUgY2FzZXMgd2hlcmUgaXQgaXMgYSAkJCB0aGF0IHdlIGRvIE5PVCB3YW50IHRvIGRvIHRoZSBmb2xsb3dpbmc/IFxuXHRcdFx0XHRpZigoc2F0ID0gY2F0Lm5leHQpICYmIChzYXQgPSBzYXRba2V5XSkpeyAvLyBUT0RPOiBwb3NzaWJsZSB0cmljaz8gTWF5YmUgaGF2ZSBgaW9ubWFwYCBjb2RlIHNldCBhIHNhdD8gLy8gVE9ETzogTWF5YmUgd2Ugc2hvdWxkIGRvIGBjYXQuYXNrYCBpbnN0ZWFkPyBJIGd1ZXNzIGRvZXMgbm90IG1hdHRlci5cblx0XHRcdFx0XHR0bXAgPSB7fTsgT2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSk7XG5cdFx0XHRcdFx0dG1wLiQgPSAobXNnLiQkfHxtc2cuJCkuZ2V0KHRtcC5nZXQgPSBrZXkpOyBkZWxldGUgdG1wLiQkOyBkZWxldGUgdG1wLiQkJDtcblx0XHRcdFx0XHRzYXQub24oJ2luJywgdG1wKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRsaW5rKG1zZywgY2F0KTtcblx0XHR9OyBHdW4ub24uaW4gPSBpbnB1dDtcblxuXHRcdGZ1bmN0aW9uIGxpbmsobXNnLCBjYXQpeyBjYXQgPSBjYXQgfHwgdGhpcy5hcyB8fCBtc2cuJC5fO1xuXHRcdFx0aWYobXNnLiQkICYmIHRoaXMgIT09IEd1bi5vbil7IHJldHVybiB9IC8vICQkIG1lYW5zIHdlIGNhbWUgZnJvbSBhIGxpbmssIHNvIHdlIGFyZSBhdCB0aGUgd3JvbmcgbGV2ZWwsIHRodXMgaWdub3JlIGl0IHVubGVzcyBvdmVycnVsZWQgbWFudWFsbHkgYnkgYmVpbmcgY2FsbGVkIGRpcmVjdGx5LlxuXHRcdFx0aWYoIW1zZy5wdXQgfHwgY2F0LnNvdWwpeyByZXR1cm4gfSAvLyBCdXQgeW91IGNhbm5vdCBvdmVycnVsZSBiZWluZyBsaW5rZWQgdG8gbm90aGluZywgb3IgdHJ5aW5nIHRvIGxpbmsgYSBzb3VsIGNoYWluIC0gdGhhdCBtdXN0IG5ldmVyIGhhcHBlbi5cblx0XHRcdHZhciBwdXQgPSBtc2cucHV0fHwnJywgbGluayA9IHB1dFsnPSddfHxwdXRbJzonXSwgdG1wO1xuXHRcdFx0dmFyIHJvb3QgPSBjYXQucm9vdCwgdGF0ID0gcm9vdC4kLmdldChwdXRbJyMnXSkuZ2V0KHB1dFsnLiddKS5fO1xuXHRcdFx0aWYoJ3N0cmluZycgIT0gdHlwZW9mIChsaW5rID0gdmFsaWQobGluaykpKXtcblx0XHRcdFx0aWYodGhpcyA9PT0gR3VuLm9uKXsgKHRhdC5lY2hvIHx8ICh0YXQuZWNobyA9IHt9KSlbY2F0LmlkXSA9IGNhdCB9IC8vIGFsbG93IHNvbWUgY2hhaW4gdG8gZXhwbGljaXRseSBmb3JjZSBsaW5raW5nIHRvIHNpbXBsZSBkYXRhLlxuXHRcdFx0XHRyZXR1cm47IC8vIGJ5IGRlZmF1bHQgZG8gbm90IGxpbmsgdG8gZGF0YSB0aGF0IGlzIG5vdCBhIGxpbmsuXG5cdFx0XHR9XG5cdFx0XHRpZigodGF0LmVjaG8gfHwgKHRhdC5lY2hvID0ge30pKVtjYXQuaWRdIC8vIHdlJ3ZlIGFscmVhZHkgbGlua2VkIG91cnNlbHZlcyBzbyB3ZSBkbyBub3QgbmVlZCB0byBkbyBpdCBhZ2Fpbi4gRXhjZXB0Li4uIChhbm5veWluZyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzKVxuXHRcdFx0XHQmJiAhKHJvb3QucGFzc3x8JycpW2NhdC5pZF0peyByZXR1cm4gfSAvLyBpZiBhIG5ldyBldmVudCBsaXN0ZW5lciB3YXMgYWRkZWQsIHdlIG5lZWQgdG8gbWFrZSBhIHBhc3MgdGhyb3VnaCBmb3IgaXQuIFRoZSBwYXNzIHdpbGwgYmUgb24gdGhlIGNoYWluLCBub3QgYWx3YXlzIHRoZSBjaGFpbiBwYXNzZWQgZG93bi4gXG5cdFx0XHRpZih0bXAgPSByb290LnBhc3MpeyBpZih0bXBbbGluaytjYXQuaWRdKXsgcmV0dXJuIH0gdG1wW2xpbmsrY2F0LmlkXSA9IDEgfSAvLyBCdXQgdGhlIGFib3ZlIGVkZ2UgY2FzZSBtYXkgXCJwYXNzIHRocm91Z2hcIiBvbiBhIGNpcmN1bGFyIGdyYXBoIGNhdXNpbmcgaW5maW5pdGUgcGFzc2VzLCBzbyB3ZSBoYWNraWx5IGFkZCBhIHRlbXBvcmFyeSBjaGVjayBmb3IgdGhhdC5cblxuXHRcdFx0KHRhdC5lY2hvfHwodGF0LmVjaG89e30pKVtjYXQuaWRdID0gY2F0OyAvLyBzZXQgb3Vyc2VsZiB1cCBmb3IgdGhlIGVjaG8hIC8vIFRPRE86IEJVRz8gRWNobyB0byBzZWxmIG5vIGxvbmdlciBjYXVzZXMgcHJvYmxlbXM/IENvbmZpcm0uXG5cblx0XHRcdGlmKGNhdC5oYXMpeyBjYXQubGluayA9IGxpbmsgfVxuXHRcdFx0dmFyIHNhdCA9IHJvb3QuJC5nZXQodGF0LmxpbmsgPSBsaW5rKS5fOyAvLyBncmFiIHdoYXQgd2UncmUgbGlua2luZyB0by5cblx0XHRcdChzYXQuZWNobyB8fCAoc2F0LmVjaG8gPSB7fSkpW3RhdC5pZF0gPSB0YXQ7IC8vIGxpbmsgaXQuXG5cdFx0XHR2YXIgdG1wID0gY2F0LmFza3x8Jyc7IC8vIGFzayB0aGUgY2hhaW4gZm9yIHdoYXQgbmVlZHMgdG8gYmUgbG9hZGVkIG5leHQhXG5cdFx0XHRpZih0bXBbJyddIHx8IGNhdC5sZXgpeyAvLyB3ZSBtaWdodCBuZWVkIHRvIGxvYWQgdGhlIHdob2xlIHRoaW5nIC8vIFRPRE86IGNhdC5sZXggcHJvYmFibHkgaGFzIGVkZ2UgY2FzZSBidWdzIHRvIGl0LCBuZWVkIG1vcmUgdGVzdCBjb3ZlcmFnZS5cblx0XHRcdFx0c2F0Lm9uKCdvdXQnLCB7Z2V0OiB7JyMnOiBsaW5rfX0pO1xuXHRcdFx0fVxuXHRcdFx0c2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKHRtcCksIGZ1bmN0aW9uKGdldCwgc2F0KXsgLy8gaWYgc3ViIGNoYWlucyBhcmUgYXNraW5nIGZvciBkYXRhLiAvLyBUT0RPOiAua2V5cyggaXMgc2xvdyAvLyBCVUc/ID9Tb21lIHJlLWluIGxvZ2ljIG1heSBkZXBlbmQgb24gdGhpcyBiZWluZyBzeW5jP1xuXHRcdFx0XHRpZighZ2V0IHx8ICEoc2F0ID0gdG1wW2dldF0pKXsgcmV0dXJuIH1cblx0XHRcdFx0c2F0Lm9uKCdvdXQnLCB7Z2V0OiB7JyMnOiBsaW5rLCAnLic6IGdldH19KTsgLy8gZ28gZ2V0IGl0LlxuXHRcdFx0fSwwLDk5KTtcblx0XHR9OyBHdW4ub24ubGluayA9IGxpbms7XG5cblx0XHRmdW5jdGlvbiB1bmxpbmsobXNnLCBjYXQpeyAvLyB1Z2gsIHNvIG11Y2ggY29kZSBmb3Igc2VlbWluZ2x5IGVkZ2UgY2FzZSBiZWhhdmlvci5cblx0XHRcdHZhciBwdXQgPSBtc2cucHV0fHwnJywgY2hhbmdlID0gKHUgIT09IHB1dFsnPSddKT8gcHV0Wyc9J10gOiBwdXRbJzonXSwgcm9vdCA9IGNhdC5yb290LCBsaW5rLCB0bXA7XG5cdFx0XHRpZih1ID09PSBjaGFuZ2UpeyAvLyAxc3QgZWRnZSBjYXNlOiBJZiB3ZSBoYXZlIGEgYnJhbmQgbmV3IGRhdGFiYXNlLCBubyBkYXRhIHdpbGwgYmUgZm91bmQuXG5cdFx0XHRcdC8vIFRPRE86IEJVRyEgYmVjYXVzZSBlbXB0eWluZyBjYWNoZSBjb3VsZCBiZSBhc3luYyBmcm9tIGJlbG93LCBtYWtlIHN1cmUgd2UgYXJlIG5vdCBlbXB0eWluZyBhIG5ld2VyIGNhY2hlLiBTbyBtYXliZSBwYXNzIGFuIEFzeW5jIElEIHRvIGNoZWNrIGFnYWluc3Q/XG5cdFx0XHRcdC8vIFRPRE86IEJVRyEgV2hhdCBpZiB0aGlzIGlzIGEgbWFwPyAvLyBXYXJuaW5nISBDbGVhcmluZyB0aGluZ3Mgb3V0IG5lZWRzIHRvIGJlIHJvYnVzdCBhZ2FpbnN0IHN5bmMvYXN5bmMgb3BzLCBvciBlbHNlIHlvdSdsbCBzZWUgYG1hcCB2YWwgZ2V0IHB1dGAgdGVzdCBjYXRhc3Ryb3BoaWNhbGx5IGZhaWwgYmVjYXVzZSBtYXAgYXR0ZW1wdHMgdG8gbGluayB3aGVuIHBhcmVudCBncmFwaCBpcyBzdHJlYW1lZCBiZWZvcmUgY2hpbGQgdmFsdWUgZ2V0cyBzZXQuIE5lZWQgdG8gZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGxhY2sgYWNrcyBhbmQgZm9yY2UgY2xlYXJpbmcuXG5cdFx0XHRcdGlmKGNhdC5zb3VsICYmIHUgIT09IGNhdC5wdXQpeyByZXR1cm4gfSAvLyBkYXRhIG1heSBub3QgYmUgZm91bmQgb24gYSBzb3VsLCBidXQgaWYgYSBzb3VsIGFscmVhZHkgaGFzIGRhdGEsIHRoZW4gbm90aGluZyBjYW4gY2xlYXIgdGhlIHNvdWwgYXMgYSB3aG9sZS5cblx0XHRcdFx0Ly9pZighY2F0Lmhhcyl7IHJldHVybiB9XG5cdFx0XHRcdHRtcCA9IChtc2cuJCR8fG1zZy4kfHwnJykuX3x8Jyc7XG5cdFx0XHRcdGlmKG1zZ1snQCddICYmICh1ICE9PSB0bXAucHV0IHx8IHUgIT09IGNhdC5wdXQpKXsgcmV0dXJuIH0gLy8gYSBcIm5vdCBmb3VuZFwiIGZyb20gb3RoZXIgcGVlcnMgc2hvdWxkIG5vdCBjbGVhciBvdXQgZGF0YSBpZiB3ZSBoYXZlIGFscmVhZHkgZm91bmQgaXQuXG5cdFx0XHRcdC8vaWYoY2F0LmhhcyAmJiB1ID09PSBjYXQucHV0ICYmICEocm9vdC5wYXNzfHwnJylbY2F0LmlkXSl7IHJldHVybiB9IC8vIGlmIHdlIGFyZSBhbHJlYWR5IHVubGlua2VkLCBkbyBub3QgY2FsbCBhZ2FpbiwgdW5sZXNzIGVkZ2UgY2FzZS4gLy8gVE9ETzogQlVHISBUaGlzIGxpbmUgc2hvdWxkIGJlIGRlbGV0ZWQgZm9yIFwidW5saW5rIGRlZXBseSBuZXN0ZWRcIi5cblx0XHRcdFx0aWYobGluayA9IGNhdC5saW5rIHx8IG1zZy5saW5rZWQpe1xuXHRcdFx0XHRcdGRlbGV0ZSAocm9vdC4kLmdldChsaW5rKS5fLmVjaG98fCcnKVtjYXQuaWRdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKGNhdC5oYXMpeyAvLyBUT0RPOiBFbXB0eSBvdXQgbGlua3MsIG1hcHMsIGVjaG9zLCBhY2tzL2Fza3MsIGV0Yy4/XG5cdFx0XHRcdFx0Y2F0LmxpbmsgPSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdC5wdXQgPSB1OyAvLyBlbXB0eSBvdXQgdGhlIGNhY2hlIGlmLCBmb3IgZXhhbXBsZSwgYWxpY2UncyBjYXIncyBjb2xvciBubyBsb25nZXIgZXhpc3RzIChyZWxhdGl2ZSB0byBhbGljZSkgaWYgYWxpY2Ugbm8gbG9uZ2VyIGhhcyBhIGNhci5cblx0XHRcdFx0Ly8gVE9ETzogQlVHISBGb3IgbWFwcywgcHJveHkgdGhpcyBzbyB0aGUgaW5kaXZpZHVhbCBzdWIgaXMgdHJpZ2dlcmVkLCBub3QgYWxsIHN1YnMuXG5cdFx0XHRcdHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhjYXQubmV4dHx8JycpLCBmdW5jdGlvbihnZXQsIHNhdCl7IC8vIGVtcHR5IG91dCBhbGwgc3ViIGNoYWlucy4gLy8gVE9ETzogLmtleXMoIGlzIHNsb3cgLy8gQlVHPyA/U29tZSByZS1pbiBsb2dpYyBtYXkgZGVwZW5kIG9uIHRoaXMgYmVpbmcgc3luYz8gLy8gVE9ETzogQlVHPyBUaGlzIHdpbGwgdHJpZ2dlciBkZWVwZXIgcHV0IGZpcnN0LCBkb2VzIHB1dCBsb2dpYyBkZXBlbmQgb24gbmVzdGVkIG9yZGVyPyAvLyBUT0RPOiBCVUchIEZvciBtYXAsIHRoaXMgbmVlZHMgdG8gYmUgdGhlIGlzb2xhdGVkIGNoaWxkLCBub3QgYWxsIG9mIHRoZW0uXG5cdFx0XHRcdFx0aWYoIShzYXQgPSBjYXQubmV4dFtnZXRdKSl7IHJldHVybiB9XG5cdFx0XHRcdFx0Ly9pZihjYXQuaGFzICYmIHUgPT09IHNhdC5wdXQgJiYgIShyb290LnBhc3N8fCcnKVtzYXQuaWRdKXsgcmV0dXJuIH0gLy8gaWYgd2UgYXJlIGFscmVhZHkgdW5saW5rZWQsIGRvIG5vdCBjYWxsIGFnYWluLCB1bmxlc3MgZWRnZSBjYXNlLiAvLyBUT0RPOiBCVUchIFRoaXMgbGluZSBzaG91bGQgYmUgZGVsZXRlZCBmb3IgXCJ1bmxpbmsgZGVlcGx5IG5lc3RlZFwiLlxuXHRcdFx0XHRcdGlmKGxpbmspeyBkZWxldGUgKHJvb3QuJC5nZXQobGluaykuZ2V0KGdldCkuXy5lY2hvfHwnJylbc2F0LmlkXSB9XG5cdFx0XHRcdFx0c2F0Lm9uKCdpbicsIHtnZXQ6IGdldCwgcHV0OiB1LCAkOiBzYXQuJH0pOyAvLyBUT0RPOiBCVUc/IEFkZCByZWN1cnNpdmUgc2VlbiBjaGVjaz9cblx0XHRcdFx0fSwwLDk5KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYoY2F0LnNvdWwpeyByZXR1cm4gfSAvLyBhIHNvdWwgY2Fubm90IHVubGluayBpdHNlbGYuXG5cdFx0XHRpZihtc2cuJCQpeyByZXR1cm4gfSAvLyBhIGxpbmtlZCBjaGFpbiBkb2VzIG5vdCBkbyB0aGUgdW5saW5raW5nLCB0aGUgc3ViIGNoYWluIGRvZXMuIC8vIFRPRE86IEJVRz8gV2lsbCB0aGlzIGNhbmNlbCBtYXBzP1xuXHRcdFx0bGluayA9IHZhbGlkKGNoYW5nZSk7IC8vIG5lZWQgdG8gdW5saW5rIGFueXRpbWUgd2UgYXJlIG5vdCB0aGUgc2FtZSBsaW5rLCB0aG91Z2ggb25seSBkbyB0aGlzIG9uY2UgcGVyIHVubGluayAoYW5kIG5vdCBvbiBpbml0KS5cblx0XHRcdHRtcCA9IG1zZy4kLl98fCcnO1xuXHRcdFx0aWYobGluayA9PT0gdG1wLmxpbmsgfHwgKGNhdC5oYXMgJiYgIXRtcC5saW5rKSl7XG5cdFx0XHRcdGlmKChyb290LnBhc3N8fCcnKVtjYXQuaWRdICYmICdzdHJpbmcnICE9PSB0eXBlb2YgbGluayl7XG5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGRlbGV0ZSAodG1wLmVjaG98fCcnKVtjYXQuaWRdO1xuXHRcdFx0dW5saW5rKHtnZXQ6IGNhdC5nZXQsIHB1dDogdSwgJDogbXNnLiQsIGxpbmtlZDogbXNnLmxpbmtlZCA9IG1zZy5saW5rZWQgfHwgdG1wLmxpbmt9LCBjYXQpOyAvLyB1bmxpbmsgb3VyIHN1YiBjaGFpbnMuXG5cdFx0fTsgR3VuLm9uLnVubGluayA9IHVubGluaztcblxuXHRcdGZ1bmN0aW9uIGFjayhtc2csIGV2KXtcblx0XHRcdC8vaWYoIW1zZ1snJSddICYmICh0aGlzfHwnJykub2ZmKXsgdGhpcy5vZmYoKSB9IC8vIGRvIE5PVCBtZW1vcnkgbGVhaywgdHVybiBvZmYgbGlzdGVuZXJzISBOb3cgaGFuZGxlZCBieSAuYXNrIGl0c2VsZlxuXHRcdFx0Ly8gbWFuaGF0dGFuOlxuXHRcdFx0dmFyIGFzID0gdGhpcy5hcywgYXQgPSBhcy4kLl8sIHJvb3QgPSBhdC5yb290LCBnZXQgPSBhcy5nZXR8fCcnLCB0bXAgPSAobXNnLnB1dHx8JycpW2dldFsnIyddXXx8Jyc7XG5cdFx0XHRpZighbXNnLnB1dCB8fCAoJ3N0cmluZycgPT0gdHlwZW9mIGdldFsnLiddICYmIHUgPT09IHRtcFtnZXRbJy4nXV0pKXtcblx0XHRcdFx0aWYodSAhPT0gYXQucHV0KXsgcmV0dXJuIH1cblx0XHRcdFx0aWYoIWF0LnNvdWwgJiYgIWF0Lmhhcyl7IHJldHVybiB9IC8vIFRPRE86IEJVRz8gRm9yIG5vdywgb25seSBjb3JlLWNoYWlucyB3aWxsIGhhbmRsZSBub3QtZm91bmRzLCBiZWNhdXNlIGJ1Z3MgY3JlZXAgaW4gaWYgbm9uLWNvcmUgY2hhaW5zIGFyZSB1c2VkIGFzICQgYnV0IHdlIGNhbiByZXZpc2l0IHRoaXMgbGF0ZXIgZm9yIG1vcmUgcG93ZXJmdWwgZXh0ZW5zaW9ucy5cblx0XHRcdFx0YXQuYWNrID0gKGF0LmFjayB8fCAwKSArIDE7XG5cdFx0XHRcdGF0Lm9uKCdpbicsIHtcblx0XHRcdFx0XHRnZXQ6IGF0LmdldCxcblx0XHRcdFx0XHRwdXQ6IGF0LnB1dCA9IHUsXG5cdFx0XHRcdFx0JDogYXQuJCxcblx0XHRcdFx0XHQnQCc6IG1zZ1snQCddXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQvKih0bXAgPSBhdC5RKSAmJiBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXModG1wKSwgZnVuY3Rpb24oaWQpeyAvLyBUT0RPOiBUZW1wb3JhcnkgdGVzdGluZywgbm90IGludGVncmF0ZWQgb3IgYmVpbmcgdXNlZCwgcHJvYmFibHkgZGVsZXRlLlxuXHRcdFx0XHRcdE9iamVjdC5rZXlzKG1zZykuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnW2tdIH0sIHRtcCA9IHt9KTsgdG1wWydAJ10gPSBpZDsgLy8gY29weSBtZXNzYWdlXG5cdFx0XHRcdFx0cm9vdC5vbignaW4nLCB0bXApO1xuXHRcdFx0XHR9KTsgZGVsZXRlIGF0LlE7Ki9cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0KG1zZy5ffHx7fSkubWlzcyA9IDE7XG5cdFx0XHRHdW4ub24ucHV0KG1zZyk7XG5cdFx0XHRyZXR1cm47IC8vIGVvbVxuXHRcdH1cblxuXHRcdHZhciBlbXB0eSA9IHt9LCB1LCB0ZXh0X3JhbmQgPSBTdHJpbmcucmFuZG9tLCB2YWxpZCA9IEd1bi52YWxpZCwgb2JqX2hhcyA9IGZ1bmN0aW9uKG8sIGspeyByZXR1cm4gbyAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgaykgfSwgc3RhdGUgPSBHdW4uc3RhdGUsIHN0YXRlX2lzID0gc3RhdGUuaXMsIHN0YXRlX2lmeSA9IHN0YXRlLmlmeTtcblx0fSkoVVNFLCAnLi9jaGFpbicpO1xuXG5cdDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcblx0XHR2YXIgR3VuID0gVVNFKCcuL3Jvb3QnKTtcblx0XHRHdW4uY2hhaW4uZ2V0ID0gZnVuY3Rpb24oa2V5LCBjYiwgYXMpe1xuXHRcdFx0dmFyIGd1biwgdG1wO1xuXHRcdFx0aWYodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpe1xuXHRcdFx0XHRpZihrZXkubGVuZ3RoID09IDApIHtcdFxuXHRcdFx0XHRcdChndW4gPSB0aGlzLmNoYWluKCkpLl8uZXJyID0ge2VycjogR3VuLmxvZygnMCBsZW5ndGgga2V5IScsIGtleSl9O1xuXHRcdFx0XHRcdGlmKGNiKXsgY2IuY2FsbChndW4sIGd1bi5fLmVycikgfVxuXHRcdFx0XHRcdHJldHVybiBndW47XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGJhY2sgPSB0aGlzLCBjYXQgPSBiYWNrLl87XG5cdFx0XHRcdHZhciBuZXh0ID0gY2F0Lm5leHQgfHwgZW1wdHk7XG5cdFx0XHRcdGlmKCEoZ3VuID0gbmV4dFtrZXldKSl7XG5cdFx0XHRcdFx0Z3VuID0ga2V5ICYmIGNhY2hlKGtleSwgYmFjayk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Z3VuID0gZ3VuICYmIGd1bi4kO1xuXHRcdFx0fSBlbHNlXG5cdFx0XHRpZignZnVuY3Rpb24nID09IHR5cGVvZiBrZXkpe1xuXHRcdFx0XHRpZih0cnVlID09PSBjYil7IHJldHVybiBzb3VsKHRoaXMsIGtleSwgY2IsIGFzKSwgdGhpcyB9XG5cdFx0XHRcdGd1biA9IHRoaXM7XG5cdFx0XHRcdHZhciBjYXQgPSBndW4uXywgb3B0ID0gY2IgfHwge30sIHJvb3QgPSBjYXQucm9vdCwgaWQ7XG5cdFx0XHRcdG9wdC5hdCA9IGNhdDtcblx0XHRcdFx0b3B0Lm9rID0ga2V5O1xuXHRcdFx0XHR2YXIgd2FpdCA9IHt9OyAvLyBjYW4gd2UgYXNzaWduIHRoaXMgdG8gdGhlIGF0IGluc3RlYWQsIGxpa2UgaW4gb25jZT9cblx0XHRcdFx0Ly92YXIgcGF0aCA9IFtdOyBjYXQuJC5iYWNrKGF0ID0+IHsgYXQuZ2V0ICYmIHBhdGgucHVzaChhdC5nZXQuc2xpY2UoMCw5KSl9KTsgcGF0aCA9IHBhdGgucmV2ZXJzZSgpLmpvaW4oJy4nKTtcblx0XHRcdFx0ZnVuY3Rpb24gYW55KG1zZywgZXZlLCBmKXtcblx0XHRcdFx0XHRpZihhbnkuc3R1bil7IHJldHVybiB9XG5cdFx0XHRcdFx0aWYoKHRtcCA9IHJvb3QucGFzcykgJiYgIXRtcFtpZF0peyByZXR1cm4gfVxuXHRcdFx0XHRcdHZhciBhdCA9IG1zZy4kLl8sIHNhdCA9IChtc2cuJCR8fCcnKS5fLCBkYXRhID0gKHNhdHx8YXQpLnB1dCwgb2RkID0gKCFhdC5oYXMgJiYgIWF0LnNvdWwpLCB0ZXN0ID0ge30sIGxpbmssIHRtcDtcblx0XHRcdFx0XHRpZihvZGQgfHwgdSA9PT0gZGF0YSl7IC8vIGhhbmRsZXMgbm9uLWNvcmVcblx0XHRcdFx0XHRcdGRhdGEgPSAodSA9PT0gKCh0bXAgPSBtc2cucHV0KXx8JycpWyc9J10pPyAodSA9PT0gKHRtcHx8JycpWyc6J10pPyB0bXAgOiB0bXBbJzonXSA6IHRtcFsnPSddO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZihsaW5rID0gKCdzdHJpbmcnID09IHR5cGVvZiAodG1wID0gR3VuLnZhbGlkKGRhdGEpKSkpe1xuXHRcdFx0XHRcdFx0ZGF0YSA9ICh1ID09PSAodG1wID0gcm9vdC4kLmdldCh0bXApLl8ucHV0KSk/IG9wdC5ub3Q/IHUgOiBkYXRhIDogdG1wO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZihvcHQubm90ICYmIHUgPT09IGRhdGEpeyByZXR1cm4gfVxuXHRcdFx0XHRcdGlmKHUgPT09IG9wdC5zdHVuKXtcblx0XHRcdFx0XHRcdGlmKCh0bXAgPSByb290LnN0dW4pICYmIHRtcC5vbil7XG5cdFx0XHRcdFx0XHRcdGNhdC4kLmJhY2soZnVuY3Rpb24oYSl7IC8vIG91ciBjaGFpbiBzdHVubmVkP1xuXHRcdFx0XHRcdFx0XHRcdHRtcC5vbignJythLmlkLCB0ZXN0ID0ge30pO1xuXHRcdFx0XHRcdFx0XHRcdGlmKCh0ZXN0LnJ1biB8fCAwKSA8IGFueS5pZCl7IHJldHVybiB0ZXN0IH0gLy8gaWYgdGhlcmUgaXMgYW4gZWFybGllciBzdHVuIG9uIGdhcGxlc3MgcGFyZW50cy9zZWxmLlxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0IXRlc3QucnVuICYmIHRtcC5vbignJythdC5pZCwgdGVzdCA9IHt9KTsgLy8gdGhpcyBub2RlIHN0dW5uZWQ/XG5cdFx0XHRcdFx0XHRcdCF0ZXN0LnJ1biAmJiBzYXQgJiYgdG1wLm9uKCcnK3NhdC5pZCwgdGVzdCA9IHt9KTsgLy8gbGlua2VkIG5vZGUgc3R1bm5lZD9cblx0XHRcdFx0XHRcdFx0aWYoYW55LmlkID4gdGVzdC5ydW4pe1xuXHRcdFx0XHRcdFx0XHRcdGlmKCF0ZXN0LnN0dW4gfHwgdGVzdC5zdHVuLmVuZCl7XG5cdFx0XHRcdFx0XHRcdFx0XHR0ZXN0LnN0dW4gPSB0bXAub24oJ3N0dW4nKTtcblx0XHRcdFx0XHRcdFx0XHRcdHRlc3Quc3R1biA9IHRlc3Quc3R1biAmJiB0ZXN0LnN0dW4ubGFzdDtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0aWYodGVzdC5zdHVuICYmICF0ZXN0LnN0dW4uZW5kKXtcblx0XHRcdFx0XHRcdFx0XHRcdC8vaWYob2RkICYmIHUgPT09IGRhdGEpeyByZXR1cm4gfVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly9pZih1ID09PSBtc2cucHV0KXsgcmV0dXJuIH0gLy8gXCJub3QgZm91bmRcIiBhY2tzIHdpbGwgYmUgZm91bmQgaWYgdGhlcmUgaXMgc3R1biwgc28gaWdub3JlIHRoZXNlLlxuXHRcdFx0XHRcdFx0XHRcdFx0KHRlc3Quc3R1bi5hZGQgfHwgKHRlc3Quc3R1bi5hZGQgPSB7fSkpW2lkXSA9IGZ1bmN0aW9uKCl7IGFueShtc2csZXZlLDEpIH0gLy8gYWRkIG91cnNlbGYgdG8gdGhlIHN0dW4gY2FsbGJhY2sgbGlzdCB0aGF0IGlzIGNhbGxlZCBhdCBlbmQgb2YgdGhlIHdyaXRlLlxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYoLypvZGQgJiYqLyB1ID09PSBkYXRhKXsgZiA9IDAgfSAvLyBpZiBkYXRhIG5vdCBmb3VuZCwga2VlcCB3YWl0aW5nL3RyeWluZy5cblx0XHRcdFx0XHRcdC8qaWYoZiAmJiB1ID09PSBkYXRhKXtcblx0XHRcdFx0XHRcdFx0Y2F0Lm9uKCdvdXQnLCBvcHQub3V0KTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fSovXG5cdFx0XHRcdFx0XHRpZigodG1wID0gcm9vdC5oYXRjaCkgJiYgIXRtcC5lbmQgJiYgdSA9PT0gb3B0LmhhdGNoICYmICFmKXsgLy8gcXVpY2sgaGFjayEgLy8gV2hhdCdzIGdvaW5nIG9uIGhlcmU/IEJlY2F1c2UgZGF0YSBpcyBzdHJlYW1lZCwgd2UgZ2V0IHRoaW5ncyBvbmUgYnkgb25lLCBidXQgYSBsb3Qgb2YgZGV2ZWxvcGVycyB3b3VsZCByYXRoZXIgZ2V0IGEgY2FsbGJhY2sgYWZ0ZXIgZWFjaCBiYXRjaCBpbnN0ZWFkLCBzbyB0aGlzIGRvZXMgdGhhdCBieSBjcmVhdGluZyBhIHdhaXQgbGlzdCBwZXIgY2hhaW4gaWQgdGhhdCBpcyB0aGVuIGNhbGxlZCBhdCB0aGUgZW5kIG9mIHRoZSBiYXRjaCBieSB0aGUgaGF0Y2ggY29kZSBpbiB0aGUgcm9vdCBwdXQgbGlzdGVuZXIuXG5cdFx0XHRcdFx0XHRcdGlmKHdhaXRbYXQuJC5fLmlkXSl7IHJldHVybiB9IHdhaXRbYXQuJC5fLmlkXSA9IDE7XG5cdFx0XHRcdFx0XHRcdHRtcC5wdXNoKGZ1bmN0aW9uKCl7YW55KG1zZyxldmUsMSl9KTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fTsgd2FpdCA9IHt9OyAvLyBlbmQgcXVpY2sgaGFjay5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gY2FsbDpcblx0XHRcdFx0XHRpZihyb290LnBhc3MpeyBpZihyb290LnBhc3NbaWQrYXQuaWRdKXsgcmV0dXJuIH0gcm9vdC5wYXNzW2lkK2F0LmlkXSA9IDEgfVxuXHRcdFx0XHRcdGlmKG9wdC5vbil7IG9wdC5vay5jYWxsKGF0LiQsIGRhdGEsIGF0LmdldCwgbXNnLCBldmUgfHwgYW55KTsgcmV0dXJuIH0gLy8gVE9ETzogQWxzbyBjb25zaWRlciBicmVha2luZyBgdGhpc2Agc2luY2UgYSBsb3Qgb2YgcGVvcGxlIGRvIGA9PmAgdGhlc2UgZGF5cyBhbmQgYC5jYWxsKGAgaGFzIHNsb3dlciBwZXJmb3JtYW5jZS5cblx0XHRcdFx0XHRpZihvcHQudjIwMjApeyBvcHQub2sobXNnLCBldmUgfHwgYW55KTsgcmV0dXJuIH1cblx0XHRcdFx0XHRPYmplY3Qua2V5cyhtc2cpLmZvckVhY2goZnVuY3Rpb24oayl7IHRtcFtrXSA9IG1zZ1trXSB9LCB0bXAgPSB7fSk7IG1zZyA9IHRtcDsgbXNnLnB1dCA9IGRhdGE7IC8vIDIwMTkgQ09NUEFUSUJJTElUWSEgVE9ETzogR0VUIFJJRCBPRiBUSElTIVxuXHRcdFx0XHRcdG9wdC5vay5jYWxsKG9wdC5hcywgbXNnLCBldmUgfHwgYW55KTsgLy8gaXMgdGhpcyB0aGUgcmlnaHRcblx0XHRcdFx0fTtcblx0XHRcdFx0YW55LmF0ID0gY2F0O1xuXHRcdFx0XHQvLyhjYXQuYW55fHwoY2F0LmFueT1mdW5jdGlvbihtc2cpeyBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMoY2F0LmFueXx8JycpLCBmdW5jdGlvbihhY3QpeyAoYWN0ID0gY2F0LmFueVthY3RdKSAmJiBhY3QobXNnKSB9LDAsOTkpIH0pKVtpZCA9IFN0cmluZy5yYW5kb20oNyldID0gYW55OyAvLyBtYXliZSBzd2l0Y2ggdG8gdGhpcyBpbiBmdXR1cmU/XG5cdFx0XHRcdChjYXQuYW55fHwoY2F0LmFueT17fSkpW2lkID0gU3RyaW5nLnJhbmRvbSg3KV0gPSBhbnk7XG5cdFx0XHRcdGFueS5vZmYgPSBmdW5jdGlvbigpeyBhbnkuc3R1biA9IDE7IGlmKCFjYXQuYW55KXsgcmV0dXJuIH0gZGVsZXRlIGNhdC5hbnlbaWRdIH1cblx0XHRcdFx0YW55LnJpZCA9IHJpZDsgLy8gbG9naWMgZnJvbSBvbGQgdmVyc2lvbiwgY2FuIHdlIGNsZWFuIGl0IHVwIG5vdz9cblx0XHRcdFx0YW55LmlkID0gb3B0LnJ1biB8fCArK3Jvb3Qub25jZTsgLy8gdXNlZCBpbiBjYWxsYmFjayB0byBjaGVjayBpZiB3ZSBhcmUgZWFybGllciB0aGFuIGEgd3JpdGUuIC8vIHdpbGwgdGhpcyBldmVyIGNhdXNlIGFuIGludGVnZXIgb3ZlcmZsb3c/XG5cdFx0XHRcdHRtcCA9IHJvb3QucGFzczsgKHJvb3QucGFzcyA9IHt9KVtpZF0gPSAxOyAvLyBFeHBsYW5hdGlvbjogdGVzdCB0cmFkZS1vZmZzIHdhbnQgdG8gcHJldmVudCByZWN1cnNpb24gc28gd2UgYWRkL3JlbW92ZSBwYXNzIGZsYWcgYXMgaXQgZ2V0cyBmdWxmaWxsZWQgdG8gbm90IHJlcGVhdCwgaG93ZXZlciBtYXAgbWFwIG5lZWRzIG1hbnkgcGFzcyBmbGFncyAtIGhvdyBkbyB3ZSByZWNvbmNpbGU/XG5cdFx0XHRcdG9wdC5vdXQgPSBvcHQub3V0IHx8IHtnZXQ6IHt9fTtcblx0XHRcdFx0Y2F0Lm9uKCdvdXQnLCBvcHQub3V0KTtcblx0XHRcdFx0cm9vdC5wYXNzID0gdG1wO1xuXHRcdFx0XHRyZXR1cm4gZ3VuO1xuXHRcdFx0fSBlbHNlXG5cdFx0XHRpZignbnVtYmVyJyA9PSB0eXBlb2Yga2V5KXtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0KCcnK2tleSwgY2IsIGFzKTtcblx0XHRcdH0gZWxzZVxuXHRcdFx0aWYoJ3N0cmluZycgPT0gdHlwZW9mICh0bXAgPSB2YWxpZChrZXkpKSl7XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldCh0bXAsIGNiLCBhcyk7XG5cdFx0XHR9IGVsc2Vcblx0XHRcdGlmKHRtcCA9IHRoaXMuZ2V0Lm5leHQpe1xuXHRcdFx0XHRndW4gPSB0bXAodGhpcywga2V5KTtcblx0XHRcdH1cblx0XHRcdGlmKCFndW4pe1xuXHRcdFx0XHQoZ3VuID0gdGhpcy5jaGFpbigpKS5fLmVyciA9IHtlcnI6IEd1bi5sb2coJ0ludmFsaWQgZ2V0IHJlcXVlc3QhJywga2V5KX07IC8vIENMRUFOIFVQXG5cdFx0XHRcdGlmKGNiKXsgY2IuY2FsbChndW4sIGd1bi5fLmVycikgfVxuXHRcdFx0XHRyZXR1cm4gZ3VuO1xuXHRcdFx0fVxuXHRcdFx0aWYoY2IgJiYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2Ipe1xuXHRcdFx0XHRndW4uZ2V0KGNiLCBhcyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZ3VuO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBjYWNoZShrZXksIGJhY2spe1xuXHRcdFx0dmFyIGNhdCA9IGJhY2suXywgbmV4dCA9IGNhdC5uZXh0LCBndW4gPSBiYWNrLmNoYWluKCksIGF0ID0gZ3VuLl87XG5cdFx0XHRpZighbmV4dCl7IG5leHQgPSBjYXQubmV4dCA9IHt9IH1cblx0XHRcdG5leHRbYXQuZ2V0ID0ga2V5XSA9IGF0O1xuXHRcdFx0aWYoYmFjayA9PT0gY2F0LnJvb3QuJCl7XG5cdFx0XHRcdGF0LnNvdWwgPSBrZXk7XG5cdFx0XHR9IGVsc2Vcblx0XHRcdGlmKGNhdC5zb3VsIHx8IGNhdC5oYXMpe1xuXHRcdFx0XHRhdC5oYXMgPSBrZXk7XG5cdFx0XHRcdC8vaWYob2JqX2hhcyhjYXQucHV0LCBrZXkpKXtcblx0XHRcdFx0XHQvL2F0LnB1dCA9IGNhdC5wdXRba2V5XTtcblx0XHRcdFx0Ly99XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYXQ7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIHNvdWwoZ3VuLCBjYiwgb3B0LCBhcyl7XG5cdFx0XHR2YXIgY2F0ID0gZ3VuLl8sIGFja3MgPSAwLCB0bXA7XG5cdFx0XHRpZih0bXAgPSBjYXQuc291bCB8fCBjYXQubGluayl7IHJldHVybiBjYih0bXAsIGFzLCBjYXQpIH1cblx0XHRcdGlmKGNhdC5qYW0peyByZXR1cm4gY2F0LmphbS5wdXNoKFtjYiwgYXNdKSB9XG5cdFx0XHRjYXQuamFtID0gW1tjYixhc11dO1xuXHRcdFx0Z3VuLmdldChmdW5jdGlvbiBnbyhtc2csIGV2ZSl7XG5cdFx0XHRcdGlmKHUgPT09IG1zZy5wdXQgJiYgIWNhdC5yb290Lm9wdC5zdXBlciAmJiAodG1wID0gT2JqZWN0LmtleXMoY2F0LnJvb3Qub3B0LnBlZXJzKS5sZW5ndGgpICYmICsrYWNrcyA8PSB0bXApeyAvLyBUT0RPOiBzdXBlciBzaG91bGQgbm90IGJlIGluIGNvcmUgY29kZSwgYnJpbmcgQVhFIHVwIGludG8gY29yZSBpbnN0ZWFkIHRvIGZpeD8gLy8gVE9ETzogLmtleXMoIGlzIHNsb3dcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0ZXZlLnJpZChtc2cpO1xuXHRcdFx0XHR2YXIgYXQgPSAoKGF0ID0gbXNnLiQpICYmIGF0Ll8pIHx8IHt9LCBpID0gMCwgYXM7XG5cdFx0XHRcdHRtcCA9IGNhdC5qYW07IGRlbGV0ZSBjYXQuamFtOyAvLyB0bXAgPSBjYXQuamFtLnNwbGljZSgwLCAxMDApO1xuXHRcdFx0XHQvL2lmKHRtcC5sZW5ndGgpeyBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCl7IGdvKG1zZywgZXZlKSB9KSB9XG5cdFx0XHRcdHdoaWxlKGFzID0gdG1wW2krK10peyAvL0d1bi5vYmoubWFwKHRtcCwgZnVuY3Rpb24oYXMsIGNiKXtcblx0XHRcdFx0XHR2YXIgY2IgPSBhc1swXSwgaWQ7IGFzID0gYXNbMV07XG5cdFx0XHRcdFx0Y2IgJiYgY2IoaWQgPSBhdC5saW5rIHx8IGF0LnNvdWwgfHwgR3VuLnZhbGlkKG1zZy5wdXQpIHx8ICgobXNnLnB1dHx8e30pLl98fHt9KVsnIyddLCBhcywgbXNnLCBldmUpO1xuXHRcdFx0XHR9IC8vKTtcblx0XHRcdH0sIHtvdXQ6IHtnZXQ6IHsnLic6dHJ1ZX19fSk7XG5cdFx0XHRyZXR1cm4gZ3VuO1xuXHRcdH1cblx0XHRmdW5jdGlvbiByaWQoYXQpe1xuXHRcdFx0dmFyIGNhdCA9IHRoaXMuYXQgfHwgdGhpcy5vbjtcblx0XHRcdGlmKCFhdCB8fCBjYXQuc291bCB8fCBjYXQuaGFzKXsgcmV0dXJuIHRoaXMub2ZmKCkgfVxuXHRcdFx0aWYoIShhdCA9IChhdCA9IChhdCA9IGF0LiQgfHwgYXQpLl8gfHwgYXQpLmlkKSl7IHJldHVybiB9XG5cdFx0XHR2YXIgbWFwID0gY2F0Lm1hcCwgdG1wLCBzZWVuO1xuXHRcdFx0Ly9pZighbWFwIHx8ICEodG1wID0gbWFwW2F0XSkgfHwgISh0bXAgPSB0bXAuYXQpKXsgcmV0dXJuIH1cblx0XHRcdGlmKHRtcCA9IChzZWVuID0gdGhpcy5zZWVuIHx8ICh0aGlzLnNlZW4gPSB7fSkpW2F0XSl7IHJldHVybiB0cnVlIH1cblx0XHRcdHNlZW5bYXRdID0gdHJ1ZTtcblx0XHRcdHJldHVybjtcblx0XHRcdC8vdG1wLmVjaG9bY2F0LmlkXSA9IHt9OyAvLyBUT0RPOiBXYXJuaW5nOiBUaGlzIHVuc3Vic2NyaWJlcyBBTEwgb2YgdGhpcyBjaGFpbidzIGxpc3RlbmVycyBmcm9tIHRoaXMgbGluaywgbm90IGp1c3QgdGhlIG9uZSBjYWxsYmFjayBldmVudC5cblx0XHRcdC8vb2JqLmRlbChtYXAsIGF0KTsgLy8gVE9ETzogV2FybmluZzogVGhpcyB1bnN1YnNjcmliZXMgQUxMIG9mIHRoaXMgY2hhaW4ncyBsaXN0ZW5lcnMgZnJvbSB0aGlzIGxpbmssIG5vdCBqdXN0IHRoZSBvbmUgY2FsbGJhY2sgZXZlbnQuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHZhciBlbXB0eSA9IHt9LCB2YWxpZCA9IEd1bi52YWxpZCwgdTtcblx0fSkoVVNFLCAnLi9nZXQnKTtcblxuXHQ7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG5cdFx0dmFyIEd1biA9IFVTRSgnLi9yb290Jyk7XG5cdFx0R3VuLmNoYWluLnB1dCA9IGZ1bmN0aW9uKGRhdGEsIGNiLCBhcyl7IC8vIEkgcmV3cm90ZSBpdCA6KVxuXHRcdFx0dmFyIGd1biA9IHRoaXMsIGF0ID0gZ3VuLl8sIHJvb3QgPSBhdC5yb290O1xuXHRcdFx0YXMgPSBhcyB8fCB7fTtcblx0XHRcdGFzLnJvb3QgPSBhdC5yb290O1xuXHRcdFx0YXMucnVuIHx8IChhcy5ydW4gPSByb290Lm9uY2UpO1xuXHRcdFx0c3R1bihhcywgYXQuaWQpOyAvLyBzZXQgYSBmbGFnIGZvciByZWFkcyB0byBjaGVjayBpZiB0aGlzIGNoYWluIGlzIHdyaXRpbmcuXG5cdFx0XHRhcy5hY2sgPSBhcy5hY2sgfHwgY2I7XG5cdFx0XHRhcy52aWEgPSBhcy52aWEgfHwgZ3VuO1xuXHRcdFx0YXMuZGF0YSA9IGFzLmRhdGEgfHwgZGF0YTtcblx0XHRcdGFzLnNvdWwgfHwgKGFzLnNvdWwgPSBhdC5zb3VsIHx8ICgnc3RyaW5nJyA9PSB0eXBlb2YgY2IgJiYgY2IpKTtcblx0XHRcdHZhciBzID0gYXMuc3RhdGUgPSBhcy5zdGF0ZSB8fCBHdW4uc3RhdGUoKTtcblx0XHRcdGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpeyBkYXRhKGZ1bmN0aW9uKGQpeyBhcy5kYXRhID0gZDsgZ3VuLnB1dCh1LHUsYXMpIH0pOyByZXR1cm4gZ3VuIH1cblx0XHRcdGlmKCFhcy5zb3VsKXsgcmV0dXJuIGdldChhcyksIGd1biB9XG5cdFx0XHRhcy4kID0gcm9vdC4kLmdldChhcy5zb3VsKTsgLy8gVE9ETzogVGhpcyBtYXkgbm90IGFsbG93IHVzZXIgY2hhaW5pbmcgYW5kIHNpbWlsYXI/XG5cdFx0XHRhcy50b2RvID0gW3tpdDogYXMuZGF0YSwgcmVmOiBhcy4kfV07XG5cdFx0XHRhcy50dXJuID0gYXMudHVybiB8fCB0dXJuO1xuXHRcdFx0YXMucmFuID0gYXMucmFuIHx8IHJhbjtcblx0XHRcdC8vdmFyIHBhdGggPSBbXTsgYXMudmlhLmJhY2soYXQgPT4geyBhdC5nZXQgJiYgcGF0aC5wdXNoKGF0LmdldC5zbGljZSgwLDkpKSB9KTsgcGF0aCA9IHBhdGgucmV2ZXJzZSgpLmpvaW4oJy4nKTtcblx0XHRcdC8vIFRPRE86IFBlcmYhIFdlIG9ubHkgbmVlZCB0byBzdHVuIGNoYWlucyB0aGF0IGFyZSBiZWluZyBtb2RpZmllZCwgbm90IG5lY2Vzc2FyaWx5IHdyaXR0ZW4gdG8uXG5cdFx0XHQoZnVuY3Rpb24gd2Fsaygpe1xuXHRcdFx0XHR2YXIgdG8gPSBhcy50b2RvLCBhdCA9IHRvLnBvcCgpLCBkID0gYXQuaXQsIGNpZCA9IGF0LnJlZiAmJiBhdC5yZWYuXy5pZCwgdiwgaywgY2F0LCB0bXAsIGc7XG5cdFx0XHRcdHN0dW4oYXMsIGF0LnJlZik7XG5cdFx0XHRcdGlmKHRtcCA9IGF0LnRvZG8pe1xuXHRcdFx0XHRcdGsgPSB0bXAucG9wKCk7IGQgPSBkW2tdO1xuXHRcdFx0XHRcdGlmKHRtcC5sZW5ndGgpeyB0by5wdXNoKGF0KSB9XG5cdFx0XHRcdH1cblx0XHRcdFx0ayAmJiAodG8ucGF0aCB8fCAodG8ucGF0aCA9IFtdKSkucHVzaChrKTtcblx0XHRcdFx0aWYoISh2ID0gdmFsaWQoZCkpICYmICEoZyA9IEd1bi5pcyhkKSkpe1xuXHRcdFx0XHRcdGlmKCFPYmplY3QucGxhaW4oZCkpeyByYW4uZXJyKGFzLCBcIkludmFsaWQgZGF0YTogXCIrIGNoZWNrKGQpICtcIiBhdCBcIiArIChhcy52aWEuYmFjayhmdW5jdGlvbihhdCl7YXQuZ2V0ICYmIHRtcC5wdXNoKGF0LmdldCl9LCB0bXAgPSBbXSkgfHwgdG1wLmpvaW4oJy4nKSkrJy4nKyh0by5wYXRofHxbXSkuam9pbignLicpKTsgcmV0dXJuIH1cblx0XHRcdFx0XHR2YXIgc2VlbiA9IGFzLnNlZW4gfHwgKGFzLnNlZW4gPSBbXSksIGkgPSBzZWVuLmxlbmd0aDtcblx0XHRcdFx0XHR3aGlsZShpLS0peyBpZihkID09PSAodG1wID0gc2VlbltpXSkuaXQpeyB2ID0gZCA9IHRtcC5saW5rOyBicmVhayB9IH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZihrICYmIHYpeyBhdC5ub2RlID0gc3RhdGVfaWZ5KGF0Lm5vZGUsIGssIHMsIGQpIH0gLy8gaGFuZGxlIHNvdWwgbGF0ZXIuXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGlmKCFhcy5zZWVuKXsgcmFuLmVycihhcywgXCJEYXRhIGF0IHJvb3Qgb2YgZ3JhcGggbXVzdCBiZSBhIG5vZGUgKGFuIG9iamVjdCkuXCIpOyByZXR1cm4gfVxuXHRcdFx0XHRcdGFzLnNlZW4ucHVzaChjYXQgPSB7aXQ6IGQsIGxpbms6IHt9LCB0b2RvOiBnPyBbXSA6IE9iamVjdC5rZXlzKGQpLnNvcnQoKS5yZXZlcnNlKCksIHBhdGg6ICh0by5wYXRofHxbXSkuc2xpY2UoKSwgdXA6IGF0fSk7IC8vIEFueSBwZXJmIHJlYXNvbnMgdG8gQ1BVIHNjaGVkdWxlIHRoaXMgLmtleXMoID9cblx0XHRcdFx0XHRhdC5ub2RlID0gc3RhdGVfaWZ5KGF0Lm5vZGUsIGssIHMsIGNhdC5saW5rKTtcblx0XHRcdFx0XHQhZyAmJiBjYXQudG9kby5sZW5ndGggJiYgdG8ucHVzaChjYXQpO1xuXHRcdFx0XHRcdC8vIC0tLS0tLS0tLS0tLS0tLVxuXHRcdFx0XHRcdHZhciBpZCA9IGFzLnNlZW4ubGVuZ3RoO1xuXHRcdFx0XHRcdChhcy53YWl0IHx8IChhcy53YWl0ID0ge30pKVtpZF0gPSAnJztcblx0XHRcdFx0XHR0bXAgPSAoY2F0LnJlZiA9IChnPyBkIDogaz8gYXQucmVmLmdldChrKSA6IGF0LnJlZikpLl87XG5cdFx0XHRcdFx0KHRtcCA9IChkICYmIChkLl98fCcnKVsnIyddKSB8fCB0bXAuc291bCB8fCB0bXAubGluayk/IHJlc29sdmUoe3NvdWw6IHRtcH0pIDogY2F0LnJlZi5nZXQocmVzb2x2ZSwge3J1bjogYXMucnVuLCAvKmhhdGNoOiAwLCovIHYyMDIwOjEsIG91dDp7Z2V0OnsnLic6JyAnfX19KTsgLy8gVE9ETzogQlVHISBUaGlzIHNob3VsZCBiZSByZXNvbHZlIE9OTFkgc291bCB0byBwcmV2ZW50IGZ1bGwgZGF0YSBmcm9tIGJlaW5nIGxvYWRlZC4gLy8gRml4ZWQgbm93P1xuXHRcdFx0XHRcdC8vc2V0VGltZW91dChmdW5jdGlvbigpeyBpZihGKXsgcmV0dXJuIH0gY29uc29sZS5sb2coXCJJIEhBVkUgTk9UIEJFRU4gQ0FMTEVEIVwiLCBwYXRoLCBpZCwgY2F0LnJlZi5fLmlkLCBrKSB9LCA5MDAwKTsgdmFyIEY7IC8vIE1BS0UgU1VSRSBUTyBBREQgRiA9IDEgYmVsb3chXG5cdFx0XHRcdFx0ZnVuY3Rpb24gcmVzb2x2ZShtc2csIGV2ZSl7XG5cdFx0XHRcdFx0XHR2YXIgZW5kID0gY2F0LmxpbmtbJyMnXTtcblx0XHRcdFx0XHRcdGlmKGV2ZSl7IGV2ZS5vZmYoKTsgZXZlLnJpZChtc2cpIH0gLy8gVE9ETzogVG9vIGVhcmx5ISBDaGVjayBhbGwgcGVlcnMgYWNrIG5vdCBmb3VuZC5cblx0XHRcdFx0XHRcdC8vIFRPRE86IEJVRyBtYXliZT8gTWFrZSBzdXJlIHRoaXMgZG9lcyBub3QgcGljayB1cCBhIGxpbmsgY2hhbmdlIHdpcGUsIHRoYXQgaXQgdXNlcyB0aGUgY2hhbmdpZ24gbGluayBpbnN0ZWFkLlxuXHRcdFx0XHRcdFx0dmFyIHNvdWwgPSBlbmQgfHwgbXNnLnNvdWwgfHwgKHRtcCA9IChtc2cuJCR8fG1zZy4kKS5ffHwnJykuc291bCB8fCB0bXAubGluayB8fCAoKHRtcCA9IHRtcC5wdXR8fCcnKS5ffHwnJylbJyMnXSB8fCB0bXBbJyMnXSB8fCAoKCh0bXAgPSBtc2cucHV0fHwnJykgJiYgbXNnLiQkKT8gdG1wWycjJ10gOiAodG1wWyc9J118fHRtcFsnOiddfHwnJylbJyMnXSk7XG5cdFx0XHRcdFx0XHQhZW5kICYmIHN0dW4oYXMsIG1zZy4kKTtcblx0XHRcdFx0XHRcdGlmKCFzb3VsICYmICFhdC5saW5rWycjJ10peyAvLyBjaGVjayBzb3VsIGxpbmsgYWJvdmUgdXNcblx0XHRcdFx0XHRcdFx0KGF0LndhaXQgfHwgKGF0LndhaXQgPSBbXSkpLnB1c2goZnVuY3Rpb24oKXsgcmVzb2x2ZShtc2csIGV2ZSkgfSkgLy8gd2FpdFxuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZighc291bCl7XG5cdFx0XHRcdFx0XHRcdHNvdWwgPSBbXTtcblx0XHRcdFx0XHRcdFx0KG1zZy4kJHx8bXNnLiQpLmJhY2soZnVuY3Rpb24oYXQpe1xuXHRcdFx0XHRcdFx0XHRcdGlmKHRtcCA9IGF0LnNvdWwgfHwgYXQubGluayl7IHJldHVybiBzb3VsLnB1c2godG1wKSB9XG5cdFx0XHRcdFx0XHRcdFx0c291bC5wdXNoKGF0LmdldCk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRzb3VsID0gc291bC5yZXZlcnNlKCkuam9pbignLycpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2F0LmxpbmtbJyMnXSA9IHNvdWw7XG5cdFx0XHRcdFx0XHQhZyAmJiAoKChhcy5ncmFwaCB8fCAoYXMuZ3JhcGggPSB7fSkpW3NvdWxdID0gKGNhdC5ub2RlIHx8IChjYXQubm9kZSA9IHtfOnt9fSkpKS5fWycjJ10gPSBzb3VsKTtcblx0XHRcdFx0XHRcdGRlbGV0ZSBhcy53YWl0W2lkXTtcblx0XHRcdFx0XHRcdGNhdC53YWl0ICYmIHNldFRpbWVvdXQuZWFjaChjYXQud2FpdCwgZnVuY3Rpb24oY2IpeyBjYiAmJiBjYigpIH0pO1xuXHRcdFx0XHRcdFx0YXMucmFuKGFzKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdC8vIC0tLS0tLS0tLS0tLS0tLVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCF0by5sZW5ndGgpeyByZXR1cm4gYXMucmFuKGFzKSB9XG5cdFx0XHRcdGFzLnR1cm4od2Fsayk7XG5cdFx0XHR9KCkpO1xuXHRcdFx0cmV0dXJuIGd1bjtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBzdHVuKGFzLCBpZCl7XG5cdFx0XHRpZighaWQpeyByZXR1cm4gfSBpZCA9IChpZC5ffHwnJykuaWR8fGlkO1xuXHRcdFx0dmFyIHJ1biA9IGFzLnJvb3Quc3R1biB8fCAoYXMucm9vdC5zdHVuID0ge29uOiBHdW4ub259KSwgdGVzdCA9IHt9LCB0bXA7XG5cdFx0XHRhcy5zdHVuIHx8IChhcy5zdHVuID0gcnVuLm9uKCdzdHVuJywgZnVuY3Rpb24oKXsgfSkpO1xuXHRcdFx0aWYodG1wID0gcnVuLm9uKCcnK2lkKSl7IHRtcC50aGUubGFzdC5uZXh0KHRlc3QpIH1cblx0XHRcdGlmKHRlc3QucnVuID49IGFzLnJ1bil7IHJldHVybiB9XG5cdFx0XHRydW4ub24oJycraWQsIGZ1bmN0aW9uKHRlc3Qpe1xuXHRcdFx0XHRpZihhcy5zdHVuLmVuZCl7XG5cdFx0XHRcdFx0dGhpcy5vZmYoKTtcblx0XHRcdFx0XHR0aGlzLnRvLm5leHQodGVzdCk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRlc3QucnVuID0gdGVzdC5ydW4gfHwgYXMucnVuO1xuXHRcdFx0XHR0ZXN0LnN0dW4gPSB0ZXN0LnN0dW4gfHwgYXMuc3R1bjsgcmV0dXJuO1xuXHRcdFx0XHRpZih0aGlzLnRvLnRvKXtcblx0XHRcdFx0XHR0aGlzLnRoZS5sYXN0Lm5leHQodGVzdCk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRlc3Quc3R1biA9IGFzLnN0dW47XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiByYW4oYXMpe1xuXHRcdFx0aWYoYXMuZXJyKXsgcmFuLmVuZChhcy5zdHVuLCBhcy5yb290KTsgcmV0dXJuIH0gLy8gbW92ZSBsb2cgaGFuZGxlIGhlcmUuXG5cdFx0XHRpZihhcy50b2RvLmxlbmd0aCB8fCBhcy5lbmQgfHwgIU9iamVjdC5lbXB0eShhcy53YWl0KSl7IHJldHVybiB9IGFzLmVuZCA9IDE7XG5cdFx0XHR2YXIgY2F0ID0gKGFzLiQuYmFjaygtMSkuXyksIHJvb3QgPSBjYXQucm9vdCwgYXNrID0gY2F0LmFzayhmdW5jdGlvbihhY2spe1xuXHRcdFx0XHRyb290Lm9uKCdhY2snLCBhY2spO1xuXHRcdFx0XHRpZihhY2suZXJyKXsgR3VuLmxvZyhhY2spIH1cblx0XHRcdFx0aWYoKythY2tzID4gKGFzLmFja3MgfHwgMCkpeyB0aGlzLm9mZigpIH0gLy8gQWRqdXN0YWJsZSBBQ0tzISBPbmx5IDEgYnkgZGVmYXVsdC5cblx0XHRcdFx0aWYoIWFzLmFjayl7IHJldHVybiB9XG5cdFx0XHRcdGFzLmFjayhhY2ssIHRoaXMpO1xuXHRcdFx0fSwgYXMub3B0KSwgYWNrcyA9IDAsIHN0dW4gPSBhcy5zdHVuLCB0bXA7XG5cdFx0XHQodG1wID0gZnVuY3Rpb24oKXsgLy8gdGhpcyBpcyBub3Qgb2ZmaWNpYWwgeWV0LCBidXQgcXVpY2sgc29sdXRpb24gdG8gaGFjayBpbiBmb3Igbm93LlxuXHRcdFx0XHRpZighc3R1bil7IHJldHVybiB9XG5cdFx0XHRcdHJhbi5lbmQoc3R1biwgcm9vdCk7XG5cdFx0XHRcdHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhzdHVuID0gc3R1bi5hZGR8fCcnKSwgZnVuY3Rpb24oY2IpeyBpZihjYiA9IHN0dW5bY2JdKXtjYigpfSB9KTsgLy8gcmVzdW1lIHRoZSBzdHVubmVkIHJlYWRzIC8vIEFueSBwZXJmIHJlYXNvbnMgdG8gQ1BVIHNjaGVkdWxlIHRoaXMgLmtleXMoID9cblx0XHRcdH0pLmhhdGNoID0gdG1wOyAvLyB0aGlzIGlzIG5vdCBvZmZpY2lhbCB5ZXQgXlxuXHRcdFx0Ly9jb25zb2xlLmxvZygxLCBcIlBVVFwiLCBhcy5ydW4sIGFzLmdyYXBoKTtcblx0XHRcdChhcy52aWEuXykub24oJ291dCcsIHtwdXQ6IGFzLm91dCA9IGFzLmdyYXBoLCBvcHQ6IGFzLm9wdCwgJyMnOiBhc2ssIF86IHRtcH0pO1xuXHRcdH07IHJhbi5lbmQgPSBmdW5jdGlvbihzdHVuLHJvb3Qpe1xuXHRcdFx0c3R1bi5lbmQgPSBub29wOyAvLyBsaWtlIHdpdGggdGhlIGVhcmxpZXIgaWQsIGNoZWFwZXIgdG8gbWFrZSB0aGlzIGZsYWcgYSBmdW5jdGlvbiBzbyBiZWxvdyBjYWxsYmFja3MgZG8gbm90IGhhdmUgdG8gZG8gYW4gZXh0cmEgdHlwZSBjaGVjay5cblx0XHRcdGlmKHN0dW4udGhlLnRvID09PSBzdHVuICYmIHN0dW4gPT09IHN0dW4udGhlLmxhc3QpeyBkZWxldGUgcm9vdC5zdHVuIH1cblx0XHRcdHN0dW4ub2ZmKCk7XG5cdFx0fTsgcmFuLmVyciA9IGZ1bmN0aW9uKGFzLCBlcnIpe1xuXHRcdFx0KGFzLmFja3x8bm9vcCkuY2FsbChhcywgYXMub3V0ID0geyBlcnI6IGFzLmVyciA9IEd1bi5sb2coZXJyKSB9KTtcblx0XHRcdGFzLnJhbihhcyk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZ2V0KGFzKXtcblx0XHRcdHZhciBhdCA9IGFzLnZpYS5fLCB0bXA7XG5cdFx0XHRhcy52aWEgPSBhcy52aWEuYmFjayhmdW5jdGlvbihhdCl7XG5cdFx0XHRcdGlmKGF0LnNvdWwgfHwgIWF0LmdldCl7IHJldHVybiBhdC4kIH1cblx0XHRcdFx0dG1wID0gYXMuZGF0YTsgKGFzLmRhdGEgPSB7fSlbYXQuZ2V0XSA9IHRtcDtcblx0XHRcdH0pO1xuXHRcdFx0aWYoIWFzLnZpYSB8fCAhYXMudmlhLl8uc291bCl7XG5cdFx0XHRcdGFzLnZpYSA9IGF0LnJvb3QuJC5nZXQoKChhcy5kYXRhfHwnJykuX3x8JycpWycjJ10gfHwgYXQuJC5iYWNrKCdvcHQudXVpZCcpKCkpXG5cdFx0XHR9XG5cdFx0XHRhcy52aWEucHV0KGFzLmRhdGEsIGFzLmFjaywgYXMpO1xuXHRcdFx0XG5cblx0XHRcdHJldHVybjtcblx0XHRcdGlmKGF0LmdldCAmJiBhdC5iYWNrLnNvdWwpe1xuXHRcdFx0XHR0bXAgPSBhcy5kYXRhO1xuXHRcdFx0XHRhcy52aWEgPSBhdC5iYWNrLiQ7XG5cdFx0XHRcdChhcy5kYXRhID0ge30pW2F0LmdldF0gPSB0bXA7IFxuXHRcdFx0XHRhcy52aWEucHV0KGFzLmRhdGEsIGFzLmFjaywgYXMpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGNoZWNrKGQsIHRtcCl7IHJldHVybiAoKGQgJiYgKHRtcCA9IGQuY29uc3RydWN0b3IpICYmIHRtcC5uYW1lKSB8fCB0eXBlb2YgZCkgfVxuXG5cdFx0dmFyIHUsIGVtcHR5ID0ge30sIG5vb3AgPSBmdW5jdGlvbigpe30sIHR1cm4gPSBzZXRUaW1lb3V0LnR1cm4sIHZhbGlkID0gR3VuLnZhbGlkLCBzdGF0ZV9pZnkgPSBHdW4uc3RhdGUuaWZ5O1xuXHRcdHZhciBpaWZlID0gZnVuY3Rpb24oZm4sYXMpe2ZuLmNhbGwoYXN8fGVtcHR5KX1cblx0fSkoVVNFLCAnLi9wdXQnKTtcblxuXHQ7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG5cdFx0dmFyIEd1biA9IFVTRSgnLi9yb290Jyk7XG5cdFx0VVNFKCcuL2NoYWluJyk7XG5cdFx0VVNFKCcuL2JhY2snKTtcblx0XHRVU0UoJy4vcHV0Jyk7XG5cdFx0VVNFKCcuL2dldCcpO1xuXHRcdG1vZHVsZS5leHBvcnRzID0gR3VuO1xuXHR9KShVU0UsICcuL2luZGV4Jyk7XG5cblx0O1VTRShmdW5jdGlvbihtb2R1bGUpe1xuXHRcdHZhciBHdW4gPSBVU0UoJy4vaW5kZXgnKTtcblx0XHRHdW4uY2hhaW4ub24gPSBmdW5jdGlvbih0YWcsIGFyZywgZWFzLCBhcyl7IC8vIGRvbid0IHJld3JpdGUhXG5cdFx0XHR2YXIgZ3VuID0gdGhpcywgY2F0ID0gZ3VuLl8sIHJvb3QgPSBjYXQucm9vdCwgYWN0LCBvZmYsIGlkLCB0bXA7XG5cdFx0XHRpZih0eXBlb2YgdGFnID09PSAnc3RyaW5nJyl7XG5cdFx0XHRcdGlmKCFhcmcpeyByZXR1cm4gY2F0Lm9uKHRhZykgfVxuXHRcdFx0XHRhY3QgPSBjYXQub24odGFnLCBhcmcsIGVhcyB8fCBjYXQsIGFzKTtcblx0XHRcdFx0aWYoZWFzICYmIGVhcy4kKXtcblx0XHRcdFx0XHQoZWFzLnN1YnMgfHwgKGVhcy5zdWJzID0gW10pKS5wdXNoKGFjdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGd1bjtcblx0XHRcdH1cblx0XHRcdHZhciBvcHQgPSBhcmc7XG5cdFx0XHQob3B0ID0gKHRydWUgPT09IG9wdCk/IHtjaGFuZ2U6IHRydWV9IDogb3B0IHx8IHt9KS5ub3QgPSAxOyBvcHQub24gPSAxO1xuXHRcdFx0Ly9vcHQuYXQgPSBjYXQ7XG5cdFx0XHQvL29wdC5vayA9IHRhZztcblx0XHRcdC8vb3B0Lmxhc3QgPSB7fTtcblx0XHRcdHZhciB3YWl0ID0ge307IC8vIGNhbiB3ZSBhc3NpZ24gdGhpcyB0byB0aGUgYXQgaW5zdGVhZCwgbGlrZSBpbiBvbmNlP1xuXHRcdFx0Z3VuLmdldCh0YWcsIG9wdCk7XG5cdFx0XHQvKmd1bi5nZXQoZnVuY3Rpb24gb24oZGF0YSxrZXksbXNnLGV2ZSl7IHZhciAkID0gdGhpcztcblx0XHRcdFx0aWYodG1wID0gcm9vdC5oYXRjaCl7IC8vIHF1aWNrIGhhY2shXG5cdFx0XHRcdFx0aWYod2FpdFskLl8uaWRdKXsgcmV0dXJuIH0gd2FpdFskLl8uaWRdID0gMTtcblx0XHRcdFx0XHR0bXAucHVzaChmdW5jdGlvbigpe29uLmNhbGwoJCwgZGF0YSxrZXksbXNnLGV2ZSl9KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH07IHdhaXQgPSB7fTsgLy8gZW5kIHF1aWNrIGhhY2suXG5cdFx0XHRcdHRhZy5jYWxsKCQsIGRhdGEsa2V5LG1zZyxldmUpO1xuXHRcdFx0fSwgb3B0KTsgLy8gVE9ETzogUEVSRiEgRXZlbnQgbGlzdGVuZXIgbGVhayEhIT8qL1xuXHRcdFx0Lypcblx0XHRcdGZ1bmN0aW9uIG9uZShtc2csIGV2ZSl7XG5cdFx0XHRcdGlmKG9uZS5zdHVuKXsgcmV0dXJuIH1cblx0XHRcdFx0dmFyIGF0ID0gbXNnLiQuXywgZGF0YSA9IGF0LnB1dCwgdG1wO1xuXHRcdFx0XHRpZih0bXAgPSBhdC5saW5rKXsgZGF0YSA9IHJvb3QuJC5nZXQodG1wKS5fLnB1dCB9XG5cdFx0XHRcdGlmKG9wdC5ub3Q9PT11ICYmIHUgPT09IGRhdGEpeyByZXR1cm4gfVxuXHRcdFx0XHRpZihvcHQuc3R1bj09PXUgJiYgKHRtcCA9IHJvb3Quc3R1bikgJiYgKHRtcCA9IHRtcFthdC5pZF0gfHwgdG1wW2F0LmJhY2suaWRdKSAmJiAhdG1wLmVuZCl7IC8vIFJlbWVtYmVyISBJZiB5b3UgcG9ydCB0aGlzIGludG8gYC5nZXQoY2JgIG1ha2Ugc3VyZSB5b3UgYWxsb3cgc3R1bjowIHNraXAgb3B0aW9uIGZvciBgLnB1dChgLlxuXHRcdFx0XHRcdHRtcFtpZF0gPSBmdW5jdGlvbigpe29uZShtc2csZXZlKX07XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vdG1wID0gb25lLndhaXQgfHwgKG9uZS53YWl0ID0ge30pOyBjb25zb2xlLmxvZyh0bXBbYXQuaWRdID09PSAnJyk7IGlmKHRtcFthdC5pZF0gIT09ICcnKXsgdG1wW2F0LmlkXSA9IHRtcFthdC5pZF0gfHwgc2V0VGltZW91dChmdW5jdGlvbigpe3RtcFthdC5pZF09Jyc7b25lKG1zZyxldmUpfSwxKTsgcmV0dXJuIH0gZGVsZXRlIHRtcFthdC5pZF07XG5cdFx0XHRcdC8vIGNhbGw6XG5cdFx0XHRcdGlmKG9wdC5hcyl7XG5cdFx0XHRcdFx0b3B0Lm9rLmNhbGwob3B0LmFzLCBtc2csIGV2ZSB8fCBvbmUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9wdC5vay5jYWxsKGF0LiQsIGRhdGEsIG1zZy5nZXQgfHwgYXQuZ2V0LCBtc2csIGV2ZSB8fCBvbmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0b25lLmF0ID0gY2F0O1xuXHRcdFx0KGNhdC5hY3R8fChjYXQuYWN0PXt9KSlbaWQgPSBTdHJpbmcucmFuZG9tKDcpXSA9IG9uZTtcblx0XHRcdG9uZS5vZmYgPSBmdW5jdGlvbigpeyBvbmUuc3R1biA9IDE7IGlmKCFjYXQuYWN0KXsgcmV0dXJuIH0gZGVsZXRlIGNhdC5hY3RbaWRdIH1cblx0XHRcdGNhdC5vbignb3V0Jywge2dldDoge319KTsqL1xuXHRcdFx0cmV0dXJuIGd1bjtcblx0XHR9XG5cdFx0Ly8gUnVsZXM6XG5cdFx0Ly8gMS4gSWYgY2FjaGVkLCBzaG91bGQgYmUgZmFzdCwgYnV0IG5vdCByZWFkIHdoaWxlIHdyaXRlLlxuXHRcdC8vIDIuIFNob3VsZCBub3QgcmV0cmlnZ2VyIG90aGVyIGxpc3RlbmVycywgc2hvdWxkIGdldCB0cmlnZ2VyZWQgZXZlbiBpZiBub3RoaW5nIGZvdW5kLlxuXHRcdC8vIDMuIElmIHRoZSBzYW1lIGNhbGxiYWNrIHBhc3NlZCB0byBtYW55IGRpZmZlcmVudCBvbmNlIGNoYWlucywgZWFjaCBzaG91bGQgcmVzb2x2ZSAtIGFuIHVuc3Vic2NyaWJlIGZyb20gdGhlIHNhbWUgY2FsbGJhY2sgc2hvdWxkIG5vdCBlZmZlY3QgdGhlIHN0YXRlIG9mIHRoZSBvdGhlciByZXNvbHZpbmcgY2hhaW5zLCBpZiB5b3UgZG8gd2FudCB0byBjYW5jZWwgdGhlbSBhbGwgZWFybHkgeW91IHNob3VsZCBtdXRhdGUgdGhlIGNhbGxiYWNrIGl0c2VsZiB3aXRoIGEgZmxhZyAmIGNoZWNrIGZvciBpdCBhdCB0b3Agb2YgY2FsbGJhY2tcblx0XHRHdW4uY2hhaW4ub25jZSA9IGZ1bmN0aW9uKGNiLCBvcHQpeyBvcHQgPSBvcHQgfHwge307IC8vIGF2b2lkIHJld3JpdGluZ1xuXHRcdFx0aWYoIWNiKXsgcmV0dXJuIG5vbmUodGhpcyxvcHQpIH1cblx0XHRcdHZhciBndW4gPSB0aGlzLCBjYXQgPSBndW4uXywgcm9vdCA9IGNhdC5yb290LCBkYXRhID0gY2F0LnB1dCwgaWQgPSBTdHJpbmcucmFuZG9tKDcpLCBvbmUsIHRtcDtcblx0XHRcdGd1bi5nZXQoZnVuY3Rpb24oZGF0YSxrZXksbXNnLGV2ZSl7XG5cdFx0XHRcdHZhciAkID0gdGhpcywgYXQgPSAkLl8sIG9uZSA9IChhdC5vbmV8fChhdC5vbmU9e30pKTtcblx0XHRcdFx0aWYoZXZlLnN0dW4peyByZXR1cm4gfSBpZignJyA9PT0gb25lW2lkXSl7IHJldHVybiB9XG5cdFx0XHRcdGlmKHRydWUgPT09ICh0bXAgPSBHdW4udmFsaWQoZGF0YSkpKXsgb25jZSgpOyByZXR1cm4gfVxuXHRcdFx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgdG1wKXsgcmV0dXJuIH0gLy8gVE9ETzogQlVHPyBXaWxsIHRoaXMgYWx3YXlzIGxvYWQ/XG5cdFx0XHRcdGNsZWFyVGltZW91dCgoY2F0Lm9uZXx8JycpW2lkXSk7IC8vIGNsZWFyIFwibm90IGZvdW5kXCIgc2luY2UgdGhleSBvbmx5IGdldCBzZXQgb24gY2F0LlxuXHRcdFx0XHRjbGVhclRpbWVvdXQob25lW2lkXSk7IG9uZVtpZF0gPSBzZXRUaW1lb3V0KG9uY2UsIG9wdC53YWl0fHw5OSk7IC8vIFRPRE86IEJ1Zz8gVGhpcyBkb2Vzbid0IGhhbmRsZSBwbHVyYWwgY2hhaW5zLlxuXHRcdFx0XHRmdW5jdGlvbiBvbmNlKGYpe1xuXHRcdFx0XHRcdGlmKCFhdC5oYXMgJiYgIWF0LnNvdWwpeyBhdCA9IHtwdXQ6IGRhdGEsIGdldDoga2V5fSB9IC8vIGhhbmRsZXMgbm9uLWNvcmUgbWVzc2FnZXMuXG5cdFx0XHRcdFx0aWYodSA9PT0gKHRtcCA9IGF0LnB1dCkpeyB0bXAgPSAoKG1zZy4kJHx8JycpLl98fCcnKS5wdXQgfVxuXHRcdFx0XHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiBHdW4udmFsaWQodG1wKSl7XG5cdFx0XHRcdFx0XHR0bXAgPSByb290LiQuZ2V0KHRtcCkuXy5wdXQ7XG5cdFx0XHRcdFx0XHRpZih0bXAgPT09IHUgJiYgIWYpe1xuXHRcdFx0XHRcdFx0XHRvbmVbaWRdID0gc2V0VGltZW91dChmdW5jdGlvbigpeyBvbmNlKDEpIH0sIG9wdC53YWl0fHw5OSk7IC8vIFRPRE86IFF1aWNrIGZpeC4gTWF5YmUgdXNlIGFjayBjb3VudCBmb3IgbW9yZSBwcmVkaWN0YWJsZSBjb250cm9sP1xuXHRcdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIkFORCBWQU5JU0hFRFwiLCBkYXRhKTtcblx0XHRcdFx0XHRpZihldmUuc3R1bil7IHJldHVybiB9IGlmKCcnID09PSBvbmVbaWRdKXsgcmV0dXJuIH0gb25lW2lkXSA9ICcnO1xuXHRcdFx0XHRcdGlmKGNhdC5zb3VsIHx8IGNhdC5oYXMpeyBldmUub2ZmKCkgfSAvLyBUT0RPOiBQbHVyYWwgY2hhaW5zPyAvLyBlbHNlIHsgPy5vZmYoKSB9IC8vIGJldHRlciB0aGFuIG9uZSBjaGVjaz9cblx0XHRcdFx0XHRjYi5jYWxsKCQsIHRtcCwgYXQuZ2V0KTtcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQob25lW2lkXSk7IC8vIGNsZWFyIFwibm90IGZvdW5kXCIgc2luY2UgdGhleSBvbmx5IGdldCBzZXQgb24gY2F0LiAvLyBUT0RPOiBUaGlzIHdhcyBoYWNraWx5IGFkZGVkLCBpcyBpdCBuZWNlc3Nhcnkgb3IgaW1wb3J0YW50PyBQcm9iYWJseSBub3QsIGluIGZ1dHVyZSB0cnkgcmVtb3ZpbmcgdGhpcy4gV2FzIGFkZGVkIGp1c3QgYXMgYSBzYWZldHkgZm9yIHRoZSBgJiYgIWZgIGNoZWNrLlxuXHRcdFx0XHR9O1xuXHRcdFx0fSwge29uOiAxfSk7XG5cdFx0XHRyZXR1cm4gZ3VuO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBub25lKGd1bixvcHQsY2hhaW4pe1xuXHRcdFx0R3VuLmxvZy5vbmNlKFwidmFsb25jZVwiLCBcIkNoYWluYWJsZSB2YWwgaXMgZXhwZXJpbWVudGFsLCBpdHMgYmVoYXZpb3IgYW5kIEFQSSBtYXkgY2hhbmdlIG1vdmluZyBmb3J3YXJkLiBQbGVhc2UgcGxheSB3aXRoIGl0IGFuZCByZXBvcnQgYnVncyBhbmQgaWRlYXMgb24gaG93IHRvIGltcHJvdmUgaXQuXCIpO1xuXHRcdFx0KGNoYWluID0gZ3VuLmNoYWluKCkpLl8ubml4ID0gZ3VuLm9uY2UoZnVuY3Rpb24oZGF0YSwga2V5KXsgY2hhaW4uXy5vbignaW4nLCB0aGlzLl8pIH0pO1xuXHRcdFx0Y2hhaW4uXy5sZXggPSBndW4uXy5sZXg7IC8vIFRPRE86IEJldHRlciBhcHByb2FjaCBpbiBmdXR1cmU/IFRoaXMgaXMgcXVpY2sgZm9yIG5vdy5cblx0XHRcdHJldHVybiBjaGFpbjtcblx0XHR9XG5cblx0XHRHdW4uY2hhaW4ub2ZmID0gZnVuY3Rpb24oKXtcblx0XHRcdC8vIG1ha2Ugb2ZmIG1vcmUgYWdncmVzc2l2ZS4gV2FybmluZywgaXQgbWlnaHQgYmFja2ZpcmUhXG5cdFx0XHR2YXIgZ3VuID0gdGhpcywgYXQgPSBndW4uXywgdG1wO1xuXHRcdFx0dmFyIGNhdCA9IGF0LmJhY2s7XG5cdFx0XHRpZighY2F0KXsgcmV0dXJuIH1cblx0XHRcdGF0LmFjayA9IDA7IC8vIHNvIGNhbiByZXN1YnNjcmliZS5cblx0XHRcdGlmKHRtcCA9IGNhdC5uZXh0KXtcblx0XHRcdFx0aWYodG1wW2F0LmdldF0pe1xuXHRcdFx0XHRcdGRlbGV0ZSB0bXBbYXQuZ2V0XTtcblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBUT0RPOiBkZWxldGUgY2F0Lm9uZVttYXAuaWRdP1xuXHRcdFx0aWYodG1wID0gY2F0LmFzayl7XG5cdFx0XHRcdGRlbGV0ZSB0bXBbYXQuZ2V0XTtcblx0XHRcdH1cblx0XHRcdGlmKHRtcCA9IGNhdC5wdXQpe1xuXHRcdFx0XHRkZWxldGUgdG1wW2F0LmdldF07XG5cdFx0XHR9XG5cdFx0XHRpZih0bXAgPSBhdC5zb3VsKXtcblx0XHRcdFx0ZGVsZXRlIGNhdC5yb290LmdyYXBoW3RtcF07XG5cdFx0XHR9XG5cdFx0XHRpZih0bXAgPSBhdC5tYXApe1xuXHRcdFx0XHRPYmplY3Qua2V5cyh0bXApLmZvckVhY2goZnVuY3Rpb24oaSxhdCl7IGF0ID0gdG1wW2ldOyAvL29ial9tYXAodG1wLCBmdW5jdGlvbihhdCl7XG5cdFx0XHRcdFx0aWYoYXQubGluayl7XG5cdFx0XHRcdFx0XHRjYXQucm9vdC4kLmdldChhdC5saW5rKS5vZmYoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0aWYodG1wID0gYXQubmV4dCl7XG5cdFx0XHRcdE9iamVjdC5rZXlzKHRtcCkuZm9yRWFjaChmdW5jdGlvbihpLG5lYXQpeyBuZWF0ID0gdG1wW2ldOyAvL29ial9tYXAodG1wLCBmdW5jdGlvbihuZWF0KXtcblx0XHRcdFx0XHRuZWF0LiQub2ZmKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0YXQub24oJ29mZicsIHt9KTtcblx0XHRcdHJldHVybiBndW47XG5cdFx0fVxuXHRcdHZhciBlbXB0eSA9IHt9LCBub29wID0gZnVuY3Rpb24oKXt9LCB1O1xuXHR9KShVU0UsICcuL29uJyk7XG5cblx0O1VTRShmdW5jdGlvbihtb2R1bGUpe1xuXHRcdHZhciBHdW4gPSBVU0UoJy4vaW5kZXgnKSwgbmV4dCA9IEd1bi5jaGFpbi5nZXQubmV4dDtcblx0XHRHdW4uY2hhaW4uZ2V0Lm5leHQgPSBmdW5jdGlvbihndW4sIGxleCl7IHZhciB0bXA7XG5cdFx0XHRpZighT2JqZWN0LnBsYWluKGxleCkpeyByZXR1cm4gKG5leHR8fG5vb3ApKGd1biwgbGV4KSB9XG5cdFx0XHRpZih0bXAgPSAoKHRtcCA9IGxleFsnIyddKXx8JycpWyc9J10gfHwgdG1wKXsgcmV0dXJuIGd1bi5nZXQodG1wKSB9XG5cdFx0XHQodG1wID0gZ3VuLmNoYWluKCkuXykubGV4ID0gbGV4OyAvLyBMRVghXG5cdFx0XHRndW4ub24oJ2luJywgZnVuY3Rpb24oZXZlKXtcblx0XHRcdFx0aWYoU3RyaW5nLm1hdGNoKGV2ZS5nZXR8fCAoZXZlLnB1dHx8JycpWycuJ10sIGxleFsnLiddIHx8IGxleFsnIyddIHx8IGxleCkpe1xuXHRcdFx0XHRcdHRtcC5vbignaW4nLCBldmUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMudG8ubmV4dChldmUpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gdG1wLiQ7XG5cdFx0fVxuXHRcdEd1bi5jaGFpbi5tYXAgPSBmdW5jdGlvbihjYiwgb3B0LCB0KXtcblx0XHRcdHZhciBndW4gPSB0aGlzLCBjYXQgPSBndW4uXywgbGV4LCBjaGFpbjtcblx0XHRcdGlmKE9iamVjdC5wbGFpbihjYikpeyBsZXggPSBjYlsnLiddPyBjYiA6IHsnLic6IGNifTsgY2IgPSB1IH1cblx0XHRcdGlmKCFjYil7XG5cdFx0XHRcdGlmKGNoYWluID0gY2F0LmVhY2gpeyByZXR1cm4gY2hhaW4gfVxuXHRcdFx0XHQoY2F0LmVhY2ggPSBjaGFpbiA9IGd1bi5jaGFpbigpKS5fLmxleCA9IGxleCB8fCBjaGFpbi5fLmxleCB8fCBjYXQubGV4O1xuXHRcdFx0XHRjaGFpbi5fLm5peCA9IGd1bi5iYWNrKCduaXgnKTtcblx0XHRcdFx0Z3VuLm9uKCdpbicsIG1hcCwgY2hhaW4uXyk7XG5cdFx0XHRcdHJldHVybiBjaGFpbjtcblx0XHRcdH1cblx0XHRcdEd1bi5sb2cub25jZShcIm1hcGZuXCIsIFwiTWFwIGZ1bmN0aW9ucyBhcmUgZXhwZXJpbWVudGFsLCB0aGVpciBiZWhhdmlvciBhbmQgQVBJIG1heSBjaGFuZ2UgbW92aW5nIGZvcndhcmQuIFBsZWFzZSBwbGF5IHdpdGggaXQgYW5kIHJlcG9ydCBidWdzIGFuZCBpZGVhcyBvbiBob3cgdG8gaW1wcm92ZSBpdC5cIik7XG5cdFx0XHRjaGFpbiA9IGd1bi5jaGFpbigpO1xuXHRcdFx0Z3VuLm1hcCgpLm9uKGZ1bmN0aW9uKGRhdGEsIGtleSwgbXNnLCBldmUpe1xuXHRcdFx0XHR2YXIgbmV4dCA9IChjYnx8bm9vcCkuY2FsbCh0aGlzLCBkYXRhLCBrZXksIG1zZywgZXZlKTtcblx0XHRcdFx0aWYodSA9PT0gbmV4dCl7IHJldHVybiB9XG5cdFx0XHRcdGlmKGRhdGEgPT09IG5leHQpeyByZXR1cm4gY2hhaW4uXy5vbignaW4nLCBtc2cpIH1cblx0XHRcdFx0aWYoR3VuLmlzKG5leHQpKXsgcmV0dXJuIGNoYWluLl8ub24oJ2luJywgbmV4dC5fKSB9XG5cdFx0XHRcdHZhciB0bXAgPSB7fTsgT2JqZWN0LmtleXMobXNnLnB1dCkuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnLnB1dFtrXSB9LCB0bXApOyB0bXBbJz0nXSA9IG5leHQ7IFxuXHRcdFx0XHRjaGFpbi5fLm9uKCdpbicsIHtnZXQ6IGtleSwgcHV0OiB0bXB9KTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGNoYWluO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBtYXAobXNnKXsgdGhpcy50by5uZXh0KG1zZyk7XG5cdFx0XHR2YXIgY2F0ID0gdGhpcy5hcywgZ3VuID0gbXNnLiQsIGF0ID0gZ3VuLl8sIHB1dCA9IG1zZy5wdXQsIHRtcDtcblx0XHRcdGlmKCFhdC5zb3VsICYmICFtc2cuJCQpeyByZXR1cm4gfSAvLyB0aGlzIGxpbmUgdG9vayBodW5kcmVkcyBvZiB0cmllcyB0byBmaWd1cmUgb3V0LiBJdCBvbmx5IHdvcmtzIGlmIGNvcmUgY2hlY2tzIHRvIGZpbHRlciBvdXQgYWJvdmUgY2hhaW5zIGR1cmluZyBsaW5rIHRoby4gVGhpcyBzYXlzIFwib25seSBib3RoZXIgdG8gbWFwIG9uIGEgbm9kZVwiIGZvciB0aGlzIGxheWVyIG9mIHRoZSBjaGFpbi4gSWYgc29tZXRoaW5nIGlzIG5vdCBhIG5vZGUsIG1hcCBzaG91bGQgbm90IHdvcmsuXG5cdFx0XHRpZigodG1wID0gY2F0LmxleCkgJiYgIVN0cmluZy5tYXRjaChtc2cuZ2V0fHwgKHB1dHx8JycpWycuJ10sIHRtcFsnLiddIHx8IHRtcFsnIyddIHx8IHRtcCkpeyByZXR1cm4gfVxuXHRcdFx0R3VuLm9uLmxpbmsobXNnLCBjYXQpO1xuXHRcdH1cblx0XHR2YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fSwgZXZlbnQgPSB7c3R1bjogbm9vcCwgb2ZmOiBub29wfSwgdTtcblx0fSkoVVNFLCAnLi9tYXAnKTtcblxuXHQ7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG5cdFx0dmFyIEd1biA9IFVTRSgnLi9pbmRleCcpO1xuXHRcdEd1bi5jaGFpbi5zZXQgPSBmdW5jdGlvbihpdGVtLCBjYiwgb3B0KXtcblx0XHRcdHZhciBndW4gPSB0aGlzLCByb290ID0gZ3VuLmJhY2soLTEpLCBzb3VsLCB0bXA7XG5cdFx0XHRjYiA9IGNiIHx8IGZ1bmN0aW9uKCl7fTtcblx0XHRcdG9wdCA9IG9wdCB8fCB7fTsgb3B0Lml0ZW0gPSBvcHQuaXRlbSB8fCBpdGVtO1xuXHRcdFx0aWYoc291bCA9ICgoaXRlbXx8JycpLl98fCcnKVsnIyddKXsgKGl0ZW0gPSB7fSlbJyMnXSA9IHNvdWwgfSAvLyBjaGVjayBpZiBub2RlLCBtYWtlIGxpbmsuXG5cdFx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgKHRtcCA9IEd1bi52YWxpZChpdGVtKSkpeyByZXR1cm4gZ3VuLmdldChzb3VsID0gdG1wKS5wdXQoaXRlbSwgY2IsIG9wdCkgfSAvLyBjaGVjayBpZiBsaW5rXG5cdFx0XHRpZighR3VuLmlzKGl0ZW0pKXtcblx0XHRcdFx0aWYoT2JqZWN0LnBsYWluKGl0ZW0pKXtcblx0XHRcdFx0XHRpdGVtID0gcm9vdC5nZXQoc291bCA9IGd1bi5iYWNrKCdvcHQudXVpZCcpKCkpLnB1dChpdGVtKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZ3VuLmdldChzb3VsIHx8IHJvb3QuYmFjaygnb3B0LnV1aWQnKSg3KSkucHV0KGl0ZW0sIGNiLCBvcHQpO1xuXHRcdFx0fVxuXHRcdFx0Z3VuLnB1dChmdW5jdGlvbihnbyl7XG5cdFx0XHRcdGl0ZW0uZ2V0KGZ1bmN0aW9uKHNvdWwsIG8sIG1zZyl7IC8vIFRPRE86IEJVRyEgV2Ugbm8gbG9uZ2VyIGhhdmUgdGhpcyBvcHRpb24/ICYgZ28gZXJyb3Igbm90IGhhbmRsZWQ/XG5cdFx0XHRcdFx0aWYoIXNvdWwpeyByZXR1cm4gY2IuY2FsbChndW4sIHtlcnI6IEd1bi5sb2coJ09ubHkgYSBub2RlIGNhbiBiZSBsaW5rZWQhIE5vdCBcIicgKyBtc2cucHV0ICsgJ1wiIScpfSkgfVxuXHRcdFx0XHRcdCh0bXAgPSB7fSlbc291bF0gPSB7JyMnOiBzb3VsfTsgZ28odG1wKTtcblx0XHRcdFx0fSx0cnVlKTtcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gaXRlbTtcblx0XHR9XG5cdH0pKFVTRSwgJy4vc2V0Jyk7XG5cblx0O1VTRShmdW5jdGlvbihtb2R1bGUpe1xuXHRcdFVTRSgnLi9zaGltJyk7XG5cblx0XHR2YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fVxuXHRcdHZhciBwYXJzZSA9IEpTT04ucGFyc2VBc3luYyB8fCBmdW5jdGlvbih0LGNiLHIpeyB2YXIgdSwgZCA9ICtuZXcgRGF0ZTsgdHJ5eyBjYih1LCBKU09OLnBhcnNlKHQsciksIGpzb24uc3Vja3MoK25ldyBEYXRlIC0gZCkpIH1jYXRjaChlKXsgY2IoZSkgfSB9XG5cdFx0dmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeUFzeW5jIHx8IGZ1bmN0aW9uKHYsY2IscixzKXsgdmFyIHUsIGQgPSArbmV3IERhdGU7IHRyeXsgY2IodSwgSlNPTi5zdHJpbmdpZnkodixyLHMpLCBqc29uLnN1Y2tzKCtuZXcgRGF0ZSAtIGQpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxuXHRcdGpzb24uc3Vja3MgPSBmdW5jdGlvbihkKXsgaWYoZCA+IDk5KXsgY29uc29sZS5sb2coXCJXYXJuaW5nOiBKU09OIGJsb2NraW5nIENQVSBkZXRlY3RlZC4gQWRkIGBndW4vbGliL3lzb24uanNgIHRvIGZpeC5cIik7IGpzb24uc3Vja3MgPSBub29wIH0gfVxuXG5cdFx0ZnVuY3Rpb24gTWVzaChyb290KXtcblx0XHRcdHZhciBtZXNoID0gZnVuY3Rpb24oKXt9O1xuXHRcdFx0dmFyIG9wdCA9IHJvb3Qub3B0IHx8IHt9O1xuXHRcdFx0b3B0LmxvZyA9IG9wdC5sb2cgfHwgY29uc29sZS5sb2c7XG5cdFx0XHRvcHQuZ2FwID0gb3B0LmdhcCB8fCBvcHQud2FpdCB8fCAwO1xuXHRcdFx0b3B0Lm1heCA9IG9wdC5tYXggfHwgKG9wdC5tZW1vcnk/IChvcHQubWVtb3J5ICogOTk5ICogOTk5KSA6IDMwMDAwMDAwMCkgKiAwLjM7XG5cdFx0XHRvcHQucGFjayA9IG9wdC5wYWNrIHx8IChvcHQubWF4ICogMC4wMSAqIDAuMDEpO1xuXHRcdFx0b3B0LnB1ZmYgPSBvcHQucHVmZiB8fCA5OyAvLyBJREVBOiBkbyBhIHN0YXJ0L2VuZCBiZW5jaG1hcmssIGRpdmlkZSBvcHMvcmVzdWx0LlxuXHRcdFx0dmFyIHB1ZmYgPSBzZXRUaW1lb3V0LnR1cm4gfHwgc2V0VGltZW91dDtcblxuXHRcdFx0dmFyIGR1cCA9IHJvb3QuZHVwLCBkdXBfY2hlY2sgPSBkdXAuY2hlY2ssIGR1cF90cmFjayA9IGR1cC50cmFjaztcblxuXHRcdFx0dmFyIFNUID0gK25ldyBEYXRlLCBMVCA9IFNUO1xuXG5cdFx0XHR2YXIgaGVhciA9IG1lc2guaGVhciA9IGZ1bmN0aW9uKHJhdywgcGVlcil7XG5cdFx0XHRcdGlmKCFyYXcpeyByZXR1cm4gfVxuXHRcdFx0XHRpZihvcHQubWF4IDw9IHJhdy5sZW5ndGgpeyByZXR1cm4gbWVzaC5zYXkoe2RhbTogJyEnLCBlcnI6IFwiTWVzc2FnZSB0b28gYmlnIVwifSwgcGVlcikgfVxuXHRcdFx0XHRpZihtZXNoID09PSB0aGlzKXtcblx0XHRcdFx0XHQvKmlmKCdzdHJpbmcnID09IHR5cGVvZiByYXcpeyB0cnl7XG5cdFx0XHRcdFx0XHR2YXIgc3RhdCA9IGNvbnNvbGUuU1RBVCB8fCB7fTtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coJ0hFQVI6JywgcGVlci5pZCwgKHJhd3x8JycpLnNsaWNlKDAsMjUwKSwgKChyYXd8fCcnKS5sZW5ndGggLyAxMDI0IC8gMTAyNCkudG9GaXhlZCg0KSk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coc2V0VGltZW91dC50dXJuLnMubGVuZ3RoLCAnc3RhY2tzJywgcGFyc2VGbG9hdCgoLShMVCAtIChMVCA9ICtuZXcgRGF0ZSkpLzEwMDApLnRvRml4ZWQoMykpLCAnc2VjJywgcGFyc2VGbG9hdCgoKExULVNUKS8xMDAwIC8gNjApLnRvRml4ZWQoMSkpLCAndXAnLCBzdGF0LnBlZXJzfHwwLCAncGVlcnMnLCBzdGF0Lmhhc3x8MCwgJ2hhcycsIHN0YXQubWVtaHVzZWR8fDAsIHN0YXQubWVtdXNlZHx8MCwgc3RhdC5tZW1heHx8MCwgJ2hlYXAgbWVtIG1heCcpO1xuXHRcdFx0XHRcdH1jYXRjaChlKXsgY29uc29sZS5sb2coJ0RCRyBlcnInLCBlKSB9fSovXG5cdFx0XHRcdFx0aGVhci5kICs9IHJhdy5sZW5ndGh8fDAgOyArK2hlYXIuYyB9IC8vIFNUQVRTIVxuXHRcdFx0XHR2YXIgUyA9IHBlZXIuU0ggPSArbmV3IERhdGU7XG5cdFx0XHRcdHZhciB0bXAgPSByYXdbMF0sIG1zZztcblx0XHRcdFx0Ly9yYXcgJiYgcmF3LnNsaWNlICYmIGNvbnNvbGUubG9nKFwiaGVhcjpcIiwgKChwZWVyLndpcmV8fCcnKS5oZWFkZXJzfHwnJykub3JpZ2luLCByYXcubGVuZ3RoLCByYXcuc2xpY2UgJiYgcmF3LnNsaWNlKDAsNTApKTsgLy90Yy1pYW11bmlxdWUtdGMtcGFja2FnZS1kczFcblx0XHRcdFx0aWYoJ1snID09PSB0bXApe1xuXHRcdFx0XHRcdHBhcnNlKHJhdywgZnVuY3Rpb24oZXJyLCBtc2cpe1xuXHRcdFx0XHRcdFx0aWYoZXJyIHx8ICFtc2cpeyByZXR1cm4gbWVzaC5zYXkoe2RhbTogJyEnLCBlcnI6IFwiREFNIEpTT04gcGFyc2UgZXJyb3IuXCJ9LCBwZWVyKSB9XG5cdFx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKCtuZXcgRGF0ZSwgbXNnLmxlbmd0aCwgJyMgb24gaGVhciBiYXRjaCcpO1xuXHRcdFx0XHRcdFx0dmFyIFAgPSBvcHQucHVmZjtcblx0XHRcdFx0XHRcdChmdW5jdGlvbiBnbygpe1xuXHRcdFx0XHRcdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0XHRcdFx0dmFyIGkgPSAwLCBtOyB3aGlsZShpIDwgUCAmJiAobSA9IG1zZ1tpKytdKSl7IG1lc2guaGVhcihtLCBwZWVyKSB9XG5cdFx0XHRcdFx0XHRcdG1zZyA9IG1zZy5zbGljZShpKTsgLy8gc2xpY2luZyBhZnRlciBpcyBmYXN0ZXIgdGhhbiBzaGlmdGluZyBkdXJpbmcuXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ2hlYXIgbG9vcCcpO1xuXHRcdFx0XHRcdFx0XHRmbHVzaChwZWVyKTsgLy8gZm9yY2Ugc2VuZCBhbGwgc3luY2hyb25vdXNseSBiYXRjaGVkIGFja3MuXG5cdFx0XHRcdFx0XHRcdGlmKCFtc2cubGVuZ3RoKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRcdFx0cHVmZihnbywgMCk7XG5cdFx0XHRcdFx0XHR9KCkpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHJhdyA9ICcnOyAvLyBcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoJ3snID09PSB0bXAgfHwgKChyYXdbJyMnXSB8fCBPYmplY3QucGxhaW4ocmF3KSkgJiYgKG1zZyA9IHJhdykpKXtcblx0XHRcdFx0XHRpZihtc2cpeyByZXR1cm4gaGVhci5vbmUobXNnLCBwZWVyLCBTKSB9XG5cdFx0XHRcdFx0cGFyc2UocmF3LCBmdW5jdGlvbihlcnIsIG1zZyl7XG5cdFx0XHRcdFx0XHRpZihlcnIgfHwgIW1zZyl7IHJldHVybiBtZXNoLnNheSh7ZGFtOiAnIScsIGVycjogXCJEQU0gSlNPTiBwYXJzZSBlcnJvci5cIn0sIHBlZXIpIH1cblx0XHRcdFx0XHRcdGhlYXIub25lKG1zZywgcGVlciwgUyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRoZWFyLm9uZSA9IGZ1bmN0aW9uKG1zZywgcGVlciwgUyl7IC8vIFMgaGVyZSBpcyB0ZW1wb3JhcnkhIFVuZG8uXG5cdFx0XHRcdHZhciBpZCwgaGFzaCwgdG1wLCBhc2gsIERCRztcblx0XHRcdFx0aWYobXNnLkRCRyl7IG1zZy5EQkcgPSBEQkcgPSB7REJHOiBtc2cuREJHfSB9XG5cdFx0XHRcdERCRyAmJiAoREJHLmggPSBTKTtcblx0XHRcdFx0REJHICYmIChEQkcuaHAgPSArbmV3IERhdGUpO1xuXHRcdFx0XHRpZighKGlkID0gbXNnWycjJ10pKXsgaWQgPSBtc2dbJyMnXSA9IFN0cmluZy5yYW5kb20oOSkgfVxuXHRcdFx0XHRpZih0bXAgPSBkdXBfY2hlY2soaWQpKXsgcmV0dXJuIH1cblx0XHRcdFx0Ly8gREFNIGxvZ2ljOlxuXHRcdFx0XHRpZighKGhhc2ggPSBtc2dbJyMjJ10pICYmIGZhbHNlICYmIHUgIT09IG1zZy5wdXQpeyAvKmhhc2ggPSBtc2dbJyMjJ10gPSBUeXBlLm9iai5oYXNoKG1zZy5wdXQpKi8gfSAvLyBkaXNhYmxlIGhhc2hpbmcgZm9yIG5vdyAvLyBUT0RPOiBpbXBvc2Ugd2FybmluZy9wZW5hbHR5IGluc3RlYWQgKD8pXG5cdFx0XHRcdGlmKGhhc2ggJiYgKHRtcCA9IG1zZ1snQCddIHx8IChtc2cuZ2V0ICYmIGlkKSkgJiYgZHVwLmNoZWNrKGFzaCA9IHRtcCtoYXNoKSl7IHJldHVybiB9IC8vIEltYWdpbmUgQSA8LT4gQiA8PT4gKEMgJiBEKSwgQyAmIEQgcmVwbHkgd2l0aCBzYW1lIEFDSyBidXQgaGF2ZSBkaWZmZXJlbnQgSURzLCBCIGNhbiB1c2UgaGFzaCB0byBkZWR1cC4gT3IgaWYgYSBHRVQgaGFzIGEgaGFzaCBhbHJlYWR5LCB3ZSBzaG91bGRuJ3QgQUNLIGlmIHNhbWUuXG5cdFx0XHRcdChtc2cuXyA9IGZ1bmN0aW9uKCl7fSkudmlhID0gbWVzaC5sZWFwID0gcGVlcjtcblx0XHRcdFx0aWYoKHRtcCA9IG1zZ1snPjwnXSkgJiYgJ3N0cmluZycgPT0gdHlwZW9mIHRtcCl7IHRtcC5zbGljZSgwLDk5KS5zcGxpdCgnLCcpLmZvckVhY2goZnVuY3Rpb24oayl7IHRoaXNba10gPSAxIH0sIChtc2cuXykueW8gPSB7fSkgfSAvLyBQZWVycyBhbHJlYWR5IHNlbnQgdG8sIGRvIG5vdCByZXNlbmQuXG5cdFx0XHRcdC8vIERBTSBeXG5cdFx0XHRcdGlmKHRtcCA9IG1zZy5kYW0pe1xuXHRcdFx0XHRcdGlmKHRtcCA9IG1lc2guaGVhclt0bXBdKXtcblx0XHRcdFx0XHRcdHRtcChtc2csIHBlZXIsIHJvb3QpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkdXBfdHJhY2soaWQpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0REJHICYmIChEQkcuaXMgPSBTKTsgcGVlci5TSSA9IGlkO1xuXHRcdFx0XHRyb290Lm9uKCdpbicsIG1lc2gubGFzdCA9IG1zZyk7XG5cdFx0XHRcdC8vRUNITyA9IG1zZy5wdXQgfHwgRUNITzsgIShtc2cub2sgIT09IC0zNzQwKSAmJiBtZXNoLnNheSh7b2s6IC0zNzQwLCBwdXQ6IEVDSE8sICdAJzogbXNnWycjJ119LCBwZWVyKTtcblx0XHRcdFx0REJHICYmIChEQkcuaGQgPSArbmV3IERhdGUpO1xuXHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICtuZXcgRGF0ZSAtIFMsIG1zZy5nZXQ/ICdtc2cgZ2V0JyA6IG1zZy5wdXQ/ICdtc2cgcHV0JyA6ICdtc2cnKTtcblx0XHRcdFx0KHRtcCA9IGR1cF90cmFjayhpZCkpLnZpYSA9IHBlZXI7IC8vIGRvbid0IGRlZHVwIG1lc3NhZ2UgSUQgdGlsbCBhZnRlciwgY2F1c2UgR1VOIGhhcyBpbnRlcm5hbCBkZWR1cCBjaGVjay5cblx0XHRcdFx0aWYobXNnLmdldCl7IHRtcC5pdCA9IG1zZyB9XG5cdFx0XHRcdGlmKGFzaCl7IGR1cF90cmFjayhhc2gpIH0gLy9kdXAudHJhY2sodG1wK2hhc2gsIHRydWUpLml0ID0gaXQobXNnKTtcblx0XHRcdFx0bWVzaC5sZWFwID0gbWVzaC5sYXN0ID0gbnVsbDsgLy8gd2FybmluZyEgbWVzaC5sZWFwIGNvdWxkIGJlIGJ1Z2d5LlxuXHRcdFx0fVxuXHRcdFx0dmFyIHRvbWFwID0gZnVuY3Rpb24oayxpLG0pe20oayx0cnVlKX07XG5cdFx0XHRoZWFyLmMgPSBoZWFyLmQgPSAwO1xuXG5cdFx0XHQ7KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciBTTUlBID0gMDtcblx0XHRcdFx0dmFyIGxvb3A7XG5cdFx0XHRcdG1lc2guaGFzaCA9IGZ1bmN0aW9uKG1zZywgcGVlcil7IHZhciBoLCBzLCB0O1xuXHRcdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHRcdGpzb24obXNnLnB1dCwgZnVuY3Rpb24gaGFzaChlcnIsIHRleHQpe1xuXHRcdFx0XHRcdFx0dmFyIHNzID0gKHMgfHwgKHMgPSB0ID0gdGV4dHx8JycpKS5zbGljZSgwLCAzMjc2OCk7IC8vIDEwMjQgKiAzMlxuXHRcdFx0XHRcdCAgaCA9IFN0cmluZy5oYXNoKHNzLCBoKTsgcyA9IHMuc2xpY2UoMzI3NjgpO1xuXHRcdFx0XHRcdCAgaWYocyl7IHB1ZmYoaGFzaCwgMCk7IHJldHVybiB9XG5cdFx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICtuZXcgRGF0ZSAtIFMsICdzYXkganNvbitoYXNoJyk7XG5cdFx0XHRcdFx0ICBtc2cuXy4kcHV0ID0gdDtcblx0XHRcdFx0XHQgIG1zZ1snIyMnXSA9IGg7XG5cdFx0XHRcdFx0ICBtZXNoLnNheShtc2csIHBlZXIpO1xuXHRcdFx0XHRcdCAgZGVsZXRlIG1zZy5fLiRwdXQ7XG5cdFx0XHRcdFx0fSwgc29ydCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZnVuY3Rpb24gc29ydChrLCB2KXsgdmFyIHRtcDtcblx0XHRcdFx0XHRpZighKHYgaW5zdGFuY2VvZiBPYmplY3QpKXsgcmV0dXJuIHYgfVxuXHRcdFx0XHRcdE9iamVjdC5rZXlzKHYpLnNvcnQoKS5mb3JFYWNoKHNvcnRhLCB7dG86IHRtcCA9IHt9LCBvbjogdn0pO1xuXHRcdFx0XHRcdHJldHVybiB0bXA7XG5cdFx0XHRcdH0gZnVuY3Rpb24gc29ydGEoayl7IHRoaXMudG9ba10gPSB0aGlzLm9uW2tdIH1cblxuXHRcdFx0XHR2YXIgc2F5ID0gbWVzaC5zYXkgPSBmdW5jdGlvbihtc2csIHBlZXIpeyB2YXIgdG1wO1xuXHRcdFx0XHRcdGlmKCh0bXAgPSB0aGlzKSAmJiAodG1wID0gdG1wLnRvKSAmJiB0bXAubmV4dCl7IHRtcC5uZXh0KG1zZykgfSAvLyBjb21wYXRpYmxlIHdpdGggbWlkZGxld2FyZSBhZGFwdGVycy5cblx0XHRcdFx0XHRpZighbXNnKXsgcmV0dXJuIGZhbHNlIH1cblx0XHRcdFx0XHR2YXIgaWQsIGhhc2gsIHJhdywgYWNrID0gbXNnWydAJ107XG4vL2lmKG9wdC5zdXBlciAmJiAoIWFjayB8fCAhbXNnLnB1dCkpeyByZXR1cm4gfSAvLyBUT0RPOiBNQU5IQVRUQU4gU1RVQiAvL09CVklPVVNMWSBCVUchIEJ1dCBzcXVlbGNoIHJlbGF5LiAvLyA6KCBnZXQgb25seSBpcyAxMDAlKyBDUFUgdXNhZ2UgOihcblx0XHRcdFx0XHR2YXIgbWV0YSA9IG1zZy5ffHwobXNnLl89ZnVuY3Rpb24oKXt9KTtcblx0XHRcdFx0XHR2YXIgREJHID0gbXNnLkRCRywgUyA9ICtuZXcgRGF0ZTsgbWV0YS55ID0gbWV0YS55IHx8IFM7IGlmKCFwZWVyKXsgREJHICYmIChEQkcueSA9IFMpIH1cblx0XHRcdFx0XHRpZighKGlkID0gbXNnWycjJ10pKXsgaWQgPSBtc2dbJyMnXSA9IFN0cmluZy5yYW5kb20oOSkgfVxuXHRcdFx0XHRcdCFsb29wICYmIGR1cF90cmFjayhpZCk7Ly8uaXQgPSBpdChtc2cpOyAvLyB0cmFjayBmb3IgOSBzZWNvbmRzLCBkZWZhdWx0LiBFYXJ0aDwtPk1hcnMgd291bGQgbmVlZCBtb3JlISAvLyBhbHdheXMgdHJhY2ssIG1heWJlIG1vdmUgdGhpcyB0byB0aGUgJ2FmdGVyJyBsb2dpYyBpZiB3ZSBzcGxpdCBmdW5jdGlvbi5cblx0XHRcdFx0XHRpZihtc2cucHV0ICYmIChtc2cuZXJyIHx8IChkdXAuc1tpZF18fCcnKS5lcnIpKXsgcmV0dXJuIGZhbHNlIH0gLy8gVE9ETzogaW4gdGhlb3J5IHdlIHNob3VsZCBub3QgYmUgYWJsZSB0byBzdHVuIGEgbWVzc2FnZSwgYnV0IGZvciBub3cgZ29pbmcgdG8gY2hlY2sgaWYgaXQgY2FuIGhlbHAgbmV0d29yayBwZXJmb3JtYW5jZSBwcmV2ZW50aW5nIGludmFsaWQgZGF0YSB0byByZWxheS5cblx0XHRcdFx0XHRpZighKGhhc2ggPSBtc2dbJyMjJ10pICYmIHUgIT09IG1zZy5wdXQgJiYgIW1ldGEudmlhICYmIGFjayl7IG1lc2guaGFzaChtc2csIHBlZXIpOyByZXR1cm4gfSAvLyBUT0RPOiBTaG91bGQgYnJvYWRjYXN0cyBiZSBoYXNoZWQ/XG5cdFx0XHRcdFx0aWYoIXBlZXIgJiYgYWNrKXsgcGVlciA9ICgodG1wID0gZHVwLnNbYWNrXSkgJiYgKHRtcC52aWEgfHwgKCh0bXAgPSB0bXAuaXQpICYmICh0bXAgPSB0bXAuXykgJiYgdG1wLnZpYSkpKSB8fCAoKHRtcCA9IG1lc2gubGFzdCkgJiYgYWNrID09PSB0bXBbJyMnXSAmJiBtZXNoLmxlYXApIH0gLy8gd2FybmluZyEgbWVzaC5sZWFwIGNvdWxkIGJlIGJ1Z2d5ISBtZXNoIGxhc3QgY2hlY2sgcmVkdWNlcyB0aGlzLlxuXHRcdFx0XHRcdGlmKCFwZWVyICYmIGFjayl7IC8vIHN0aWxsIG5vIHBlZXIsIHRoZW4gYWNrIGRhaXN5IGNoYWluIGxvc3QuXG5cdFx0XHRcdFx0XHRpZihkdXAuc1thY2tdKXsgcmV0dXJuIH0gLy8gaW4gZHVwcyBidXQgbm8gcGVlciBoaW50cyB0aGF0IHRoaXMgd2FzIGFjayB0byBzZWxmLCBpZ25vcmUuXG5cdFx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKCtuZXcgRGF0ZSwgKytTTUlBLCAndG90YWwgbm8gcGVlciB0byBhY2sgdG8nKTtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9IC8vIFRPRE86IFRlbXBvcmFyeT8gSWYgYWNrIHZpYSB0cmFjZSBoYXMgYmVlbiBsb3N0LCBhY2tzIHdpbGwgZ28gdG8gYWxsIHBlZXJzLCB3aGljaCB0cmFzaGVzIGJyb3dzZXIgYmFuZHdpZHRoLiBOb3QgcmVsYXlpbmcgdGhlIGFjayB3aWxsIGZvcmNlIHNlbmRlciB0byBhc2sgZm9yIGFjayBhZ2Fpbi4gTm90ZSwgdGhpcyBpcyB0ZWNobmljYWxseSB3cm9uZyBmb3IgbWVzaCBiZWhhdmlvci5cblx0XHRcdFx0XHRpZighcGVlciAmJiBtZXNoLndheSl7IHJldHVybiBtZXNoLndheShtc2cpIH1cblx0XHRcdFx0XHREQkcgJiYgKERCRy55aCA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRcdFx0aWYoIShyYXcgPSBtZXRhLnJhdykpeyBtZXNoLnJhdyhtc2csIHBlZXIpOyByZXR1cm4gfVxuXHRcdFx0XHRcdERCRyAmJiAoREJHLnlyID0gK25ldyBEYXRlKTtcblx0XHRcdFx0XHRpZighcGVlciB8fCAhcGVlci5pZCl7XG5cdFx0XHRcdFx0XHRpZighT2JqZWN0LnBsYWluKHBlZXIgfHwgb3B0LnBlZXJzKSl7IHJldHVybiBmYWxzZSB9XG5cdFx0XHRcdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0XHRcdHZhciBQID0gb3B0LnB1ZmYsIHBzID0gb3B0LnBlZXJzLCBwbCA9IE9iamVjdC5rZXlzKHBlZXIgfHwgb3B0LnBlZXJzIHx8IHt9KTsgLy8gVE9ETzogLmtleXMoIGlzIHNsb3dcblx0XHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3BlZXIga2V5cycpO1xuXHRcdFx0XHRcdFx0OyhmdW5jdGlvbiBnbygpe1xuXHRcdFx0XHRcdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0XHRcdFx0Ly9UeXBlLm9iai5tYXAocGVlciB8fCBvcHQucGVlcnMsIGVhY2gpOyAvLyBpbiBjYXNlIHBlZXIgaXMgYSBwZWVyIGxpc3QuXG5cdFx0XHRcdFx0XHRcdGxvb3AgPSAxOyB2YXIgd3IgPSBtZXRhLnJhdzsgbWV0YS5yYXcgPSByYXc7IC8vIHF1aWNrIHBlcmYgaGFja1xuXHRcdFx0XHRcdFx0XHR2YXIgaSA9IDAsIHA7IHdoaWxlKGkgPCA5ICYmIChwID0gKHBsfHwnJylbaSsrXSkpe1xuXHRcdFx0XHRcdFx0XHRcdGlmKCEocCA9IHBzW3BdKSl7IGNvbnRpbnVlIH1cblx0XHRcdFx0XHRcdFx0XHRtZXNoLnNheShtc2csIHApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG1ldGEucmF3ID0gd3I7IGxvb3AgPSAwO1xuXHRcdFx0XHRcdFx0XHRwbCA9IHBsLnNsaWNlKGkpOyAvLyBzbGljaW5nIGFmdGVyIGlzIGZhc3RlciB0aGFuIHNoaWZ0aW5nIGR1cmluZy5cblx0XHRcdFx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCAnc2F5IGxvb3AnKTtcblx0XHRcdFx0XHRcdFx0aWYoIXBsLmxlbmd0aCl7IHJldHVybiB9XG5cdFx0XHRcdFx0XHRcdHB1ZmYoZ28sIDApO1xuXHRcdFx0XHRcdFx0XHRhY2sgJiYgZHVwX3RyYWNrKGFjayk7IC8vIGtlZXAgZm9yIGxhdGVyXG5cdFx0XHRcdFx0XHR9KCkpO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBUT0RPOiBQRVJGOiBjb25zaWRlciBzcGxpdHRpbmcgZnVuY3Rpb24gaGVyZSwgc28gc2F5IGxvb3BzIGRvIGxlc3Mgd29yay5cblx0XHRcdFx0XHRpZighcGVlci53aXJlICYmIG1lc2gud2lyZSl7IG1lc2gud2lyZShwZWVyKSB9XG5cdFx0XHRcdFx0aWYoaWQgPT09IHBlZXIubGFzdCl7IHJldHVybiB9IHBlZXIubGFzdCA9IGlkOyAgLy8gd2FzIGl0IGp1c3Qgc2VudD9cblx0XHRcdFx0XHRpZihwZWVyID09PSBtZXRhLnZpYSl7IHJldHVybiBmYWxzZSB9IC8vIGRvbid0IHNlbmQgYmFjayB0byBzZWxmLlxuXHRcdFx0XHRcdGlmKCh0bXAgPSBtZXRhLnlvKSAmJiAodG1wW3BlZXIudXJsXSB8fCB0bXBbcGVlci5waWRdIHx8IHRtcFtwZWVyLmlkXSkgLyomJiAhbyovKXsgcmV0dXJuIGZhbHNlIH1cblx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICgoREJHfHxtZXRhKS55cCA9ICtuZXcgRGF0ZSkgLSAobWV0YS55IHx8IFMpLCAnc2F5IHByZXAnKTtcblx0XHRcdFx0XHQhbG9vcCAmJiBhY2sgJiYgZHVwX3RyYWNrKGFjayk7IC8vIHN0cmVhbWluZyBsb25nIHJlc3BvbnNlcyBuZWVkcyB0byBrZWVwIGFsaXZlIHRoZSBhY2suXG5cdFx0XHRcdFx0aWYocGVlci5iYXRjaCl7XG5cdFx0XHRcdFx0XHRwZWVyLnRhaWwgPSAodG1wID0gcGVlci50YWlsIHx8IDApICsgcmF3Lmxlbmd0aDtcblx0XHRcdFx0XHRcdGlmKHBlZXIudGFpbCA8PSBvcHQucGFjayl7XG5cdFx0XHRcdFx0XHRcdHBlZXIuYmF0Y2ggKz0gKHRtcD8nLCc6JycpK3Jhdztcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Zmx1c2gocGVlcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHBlZXIuYmF0Y2ggPSAnWyc7IC8vIFByZXZlbnRzIGRvdWJsZSBKU09OIVxuXHRcdFx0XHRcdHZhciBTVCA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFNULCArbmV3IERhdGUgLSBTVCwgJzBtcyBUTycpO1xuXHRcdFx0XHRcdFx0Zmx1c2gocGVlcik7XG5cdFx0XHRcdFx0fSwgb3B0LmdhcCk7IC8vIFRPRE86IHF1ZXVpbmcvYmF0Y2hpbmcgbWlnaHQgYmUgYmFkIGZvciBsb3ctbGF0ZW5jeSB2aWRlbyBnYW1lIHBlcmZvcm1hbmNlISBBbGxvdyBvcHQgb3V0P1xuXHRcdFx0XHRcdHNlbmQocmF3LCBwZWVyKTtcblx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgKGFjayA9PT0gcGVlci5TSSkgJiYgY29uc29sZS5TVEFUKFMsICtuZXcgRGF0ZSAtIHBlZXIuU0gsICdzYXkgYWNrJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bWVzaC5zYXkuYyA9IG1lc2guc2F5LmQgPSAwO1xuXHRcdFx0XHQvLyBUT0RPOiB0aGlzIGNhdXNlZCBhIG91dC1vZi1tZW1vcnkgY3Jhc2ghXG5cdFx0XHRcdG1lc2gucmF3ID0gZnVuY3Rpb24obXNnLCBwZWVyKXsgLy8gVE9ETzogQ2xlYW4gdGhpcyB1cCAvIGRlbGV0ZSBpdCAvIG1vdmUgbG9naWMgb3V0IVxuXHRcdFx0XHRcdGlmKCFtc2cpeyByZXR1cm4gJycgfVxuXHRcdFx0XHRcdHZhciBtZXRhID0gKG1zZy5fKSB8fCB7fSwgcHV0LCB0bXA7XG5cdFx0XHRcdFx0aWYodG1wID0gbWV0YS5yYXcpeyByZXR1cm4gdG1wIH1cblx0XHRcdFx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgbXNnKXsgcmV0dXJuIG1zZyB9XG5cdFx0XHRcdFx0dmFyIGhhc2ggPSBtc2dbJyMjJ10sIGFjayA9IG1zZ1snQCddO1xuXHRcdFx0XHRcdGlmKGhhc2ggJiYgYWNrKXtcblx0XHRcdFx0XHRcdGlmKCFtZXRhLnZpYSAmJiBkdXBfY2hlY2soYWNrK2hhc2gpKXsgcmV0dXJuIGZhbHNlIH0gLy8gZm9yIG91ciBvd24gb3V0IG1lc3NhZ2VzLCBtZW1vcnkgJiBzdG9yYWdlIG1heSBhY2sgdGhlIHNhbWUgdGhpbmcsIHNvIGRlZHVwIHRoYXQuIFRobyBpZiB2aWEgYW5vdGhlciBwZWVyLCB3ZSBhbHJlYWR5IHRyYWNrZWQgaXQgdXBvbiBoZWFyaW5nLCBzbyB0aGlzIHdpbGwgYWx3YXlzIHRyaWdnZXIgZmFsc2UgcG9zaXRpdmVzLCBzbyBkb24ndCBkbyB0aGF0IVxuXHRcdFx0XHRcdFx0aWYoKHRtcCA9IChkdXAuc1thY2tdfHwnJykuaXQpIHx8ICgodG1wID0gbWVzaC5sYXN0KSAmJiBhY2sgPT09IHRtcFsnIyddKSl7XG5cdFx0XHRcdFx0XHRcdGlmKGhhc2ggPT09IHRtcFsnIyMnXSl7IHJldHVybiBmYWxzZSB9IC8vIGlmIGFzayBoYXMgYSBtYXRjaGluZyBoYXNoLCBhY2tpbmcgaXMgb3B0aW9uYWwuXG5cdFx0XHRcdFx0XHRcdGlmKCF0bXBbJyMjJ10peyB0bXBbJyMjJ10gPSBoYXNoIH0gLy8gaWYgbm9uZSwgYWRkIG91ciBoYXNoIHRvIGFzayBzbyBhbnlvbmUgd2UgcmVsYXkgdG8gY2FuIGRlZHVwLiAvLyBOT1RFOiBNYXkgb25seSBjaGVjayBhZ2FpbnN0IDFzdCBhY2sgY2h1bmssIDJuZCsgd29uJ3Qga25vdyBhbmQgc3RpbGwgc3RyZWFtIGJhY2sgdG8gcmVsYXlpbmcgcGVlcnMgd2hpY2ggbWF5IHRoZW4gZGVkdXAuIEFueSB3YXkgdG8gZml4IHRoaXMgd2FzdGVkIGJhbmR3aWR0aD8gSSBndWVzcyBmb3JjZSByYXRlIGxpbWl0aW5nIGJyZWFraW5nIGNoYW5nZSwgdGhhdCBhc2tpbmcgcGVlciBoYXMgdG8gYXNrIGZvciBuZXh0IGxleGljYWwgY2h1bmsuXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKCFtc2cuZGFtKXtcblx0XHRcdFx0XHRcdHZhciBpID0gMCwgdG8gPSBbXTsgdG1wID0gb3B0LnBlZXJzO1xuXHRcdFx0XHRcdFx0Zm9yKHZhciBrIGluIHRtcCl7IHZhciBwID0gdG1wW2tdOyAvLyBUT0RPOiBNYWtlIGl0IHVwIHBlZXJzIGluc3RlYWQhXG5cdFx0XHRcdFx0XHRcdHRvLnB1c2gocC51cmwgfHwgcC5waWQgfHwgcC5pZCk7XG5cdFx0XHRcdFx0XHRcdGlmKCsraSA+IDYpeyBicmVhayB9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZihpID4gMSl7IG1zZ1snPjwnXSA9IHRvLmpvaW4oKSB9IC8vIFRPRE86IEJVRyEgVGhpcyBnZXRzIHNldCByZWdhcmRsZXNzIG9mIHBlZXJzIHNlbnQgdG8hIERldGVjdD9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYocHV0ID0gbWV0YS4kcHV0KXtcblx0XHRcdFx0XHRcdHRtcCA9IHt9OyBPYmplY3Qua2V5cyhtc2cpLmZvckVhY2goZnVuY3Rpb24oayl7IHRtcFtrXSA9IG1zZ1trXSB9KTtcblx0XHRcdFx0XHRcdHRtcC5wdXQgPSAnOl0pKFs6Jztcblx0XHRcdFx0XHRcdGpzb24odG1wLCBmdW5jdGlvbihlcnIsIHJhdyl7XG5cdFx0XHRcdFx0XHRcdGlmKGVycil7IHJldHVybiB9IC8vIFRPRE86IEhhbmRsZSEhXG5cdFx0XHRcdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHRcdFx0XHR0bXAgPSByYXcuaW5kZXhPZignXCJwdXRcIjpcIjpdKShbOlwiJyk7XG5cdFx0XHRcdFx0XHRcdHJlcyh1LCByYXcgPSByYXcuc2xpY2UoMCwgdG1wKzYpICsgcHV0ICsgcmF3LnNsaWNlKHRtcCArIDE0KSk7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3NheSBzbGljZScpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGpzb24obXNnLCByZXMpO1xuXHRcdFx0XHRcdGZ1bmN0aW9uIHJlcyhlcnIsIHJhdyl7XG5cdFx0XHRcdFx0XHRpZihlcnIpeyByZXR1cm4gfSAvLyBUT0RPOiBIYW5kbGUhIVxuXHRcdFx0XHRcdFx0bWV0YS5yYXcgPSByYXc7IC8vaWYobWV0YSAmJiAocmF3fHwnJykubGVuZ3RoIDwgKDk5OSAqIDk5KSl7IG1ldGEucmF3ID0gcmF3IH0gLy8gSE5QRVJGOiBJZiBzdHJpbmcgdG9vIGJpZywgZG9uJ3Qga2VlcCBpbiBtZW1vcnkuXG5cdFx0XHRcdFx0XHRtZXNoLnNheShtc2csIHBlZXIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSgpKTtcblxuXHRcdFx0ZnVuY3Rpb24gZmx1c2gocGVlcil7XG5cdFx0XHRcdHZhciB0bXAgPSBwZWVyLmJhdGNoLCB0ID0gJ3N0cmluZycgPT0gdHlwZW9mIHRtcCwgbDtcblx0XHRcdFx0aWYodCl7IHRtcCArPSAnXScgfS8vIFRPRE86IFByZXZlbnQgZG91YmxlIEpTT04hXG5cdFx0XHRcdHBlZXIuYmF0Y2ggPSBwZWVyLnRhaWwgPSBudWxsO1xuXHRcdFx0XHRpZighdG1wKXsgcmV0dXJuIH1cblx0XHRcdFx0aWYodD8gMyA+IHRtcC5sZW5ndGggOiAhdG1wLmxlbmd0aCl7IHJldHVybiB9IC8vIFRPRE86IF5cblx0XHRcdFx0aWYoIXQpe3RyeXt0bXAgPSAoMSA9PT0gdG1wLmxlbmd0aD8gdG1wWzBdIDogSlNPTi5zdHJpbmdpZnkodG1wKSk7XG5cdFx0XHRcdH1jYXRjaChlKXtyZXR1cm4gb3B0LmxvZygnREFNIEpTT04gc3RyaW5naWZ5IGVycm9yJywgZSl9fVxuXHRcdFx0XHRpZighdG1wKXsgcmV0dXJuIH1cblx0XHRcdFx0c2VuZCh0bXAsIHBlZXIpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gZm9yIG5vdyAtIGZpbmQgYmV0dGVyIHBsYWNlIGxhdGVyLlxuXHRcdFx0ZnVuY3Rpb24gc2VuZChyYXcsIHBlZXIpeyB0cnl7XG5cdFx0XHRcdHZhciB3aXJlID0gcGVlci53aXJlO1xuXHRcdFx0XHRpZihwZWVyLnNheSl7XG5cdFx0XHRcdFx0cGVlci5zYXkocmF3KTtcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdGlmKHdpcmUuc2VuZCl7XG5cdFx0XHRcdFx0d2lyZS5zZW5kKHJhdyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bWVzaC5zYXkuZCArPSByYXcubGVuZ3RofHwwOyArK21lc2guc2F5LmM7IC8vIFNUQVRTIVxuXHRcdFx0fWNhdGNoKGUpe1xuXHRcdFx0XHQocGVlci5xdWV1ZSA9IHBlZXIucXVldWUgfHwgW10pLnB1c2gocmF3KTtcblx0XHRcdH19XG5cblx0XHRcdG1lc2guaGkgPSBmdW5jdGlvbihwZWVyKXtcblx0XHRcdFx0dmFyIHdpcmUgPSBwZWVyLndpcmUsIHRtcDtcblx0XHRcdFx0aWYoIXdpcmUpeyBtZXNoLndpcmUoKHBlZXIubGVuZ3RoICYmIHt1cmw6IHBlZXJ9KSB8fCBwZWVyKTsgcmV0dXJuIH1cblx0XHRcdFx0aWYocGVlci5pZCl7XG5cdFx0XHRcdFx0b3B0LnBlZXJzW3BlZXIudXJsIHx8IHBlZXIuaWRdID0gcGVlcjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0bXAgPSBwZWVyLmlkID0gcGVlci5pZCB8fCBTdHJpbmcucmFuZG9tKDkpO1xuXHRcdFx0XHRcdG1lc2guc2F5KHtkYW06ICc/JywgcGlkOiByb290Lm9wdC5waWR9LCBvcHQucGVlcnNbdG1wXSA9IHBlZXIpO1xuXHRcdFx0XHRcdGRlbGV0ZSBkdXAuc1twZWVyLmxhc3RdOyAvLyBJTVBPUlRBTlQ6IHNlZSBodHRwczovL2d1bi5lY28vZG9jcy9EQU0jc2VsZlxuXHRcdFx0XHR9XG5cdFx0XHRcdHBlZXIubWV0ID0gcGVlci5tZXQgfHwgKyhuZXcgRGF0ZSk7XG5cdFx0XHRcdGlmKCF3aXJlLmhpZWQpeyByb290Lm9uKHdpcmUuaGllZCA9ICdoaScsIHBlZXIpIH1cblx0XHRcdFx0Ly8gQHJvZ293c2tpIEkgbmVlZCB0aGlzIGhlcmUgYnkgZGVmYXVsdCBmb3Igbm93IHRvIGZpeCBnbzFkZmlzaCdzIGJ1Z1xuXHRcdFx0XHR0bXAgPSBwZWVyLnF1ZXVlOyBwZWVyLnF1ZXVlID0gW107XG5cdFx0XHRcdHNldFRpbWVvdXQuZWFjaCh0bXB8fFtdLGZ1bmN0aW9uKG1zZyl7XG5cdFx0XHRcdFx0c2VuZChtc2csIHBlZXIpO1xuXHRcdFx0XHR9LDAsOSk7XG5cdFx0XHRcdC8vVHlwZS5vYmoubmF0aXZlICYmIFR5cGUub2JqLm5hdGl2ZSgpOyAvLyBkaXJ0eSBwbGFjZSB0byBjaGVjayBpZiBvdGhlciBKUyBwb2xsdXRlZC5cblx0XHRcdH1cblx0XHRcdG1lc2guYnllID0gZnVuY3Rpb24ocGVlcil7XG5cdFx0XHRcdHJvb3Qub24oJ2J5ZScsIHBlZXIpO1xuXHRcdFx0XHR2YXIgdG1wID0gKyhuZXcgRGF0ZSk7IHRtcCA9ICh0bXAgLSAocGVlci5tZXR8fHRtcCkpO1xuXHRcdFx0XHRtZXNoLmJ5ZS50aW1lID0gKChtZXNoLmJ5ZS50aW1lIHx8IHRtcCkgKyB0bXApIC8gMjtcblx0XHRcdH1cblx0XHRcdG1lc2guaGVhclsnISddID0gZnVuY3Rpb24obXNnLCBwZWVyKXsgb3B0LmxvZygnRXJyb3I6JywgbXNnLmVycikgfVxuXHRcdFx0bWVzaC5oZWFyWyc/J10gPSBmdW5jdGlvbihtc2csIHBlZXIpe1xuXHRcdFx0XHRpZihtc2cucGlkKXtcblx0XHRcdFx0XHRpZighcGVlci5waWQpeyBwZWVyLnBpZCA9IG1zZy5waWQgfVxuXHRcdFx0XHRcdGlmKG1zZ1snQCddKXsgcmV0dXJuIH1cblx0XHRcdFx0fVxuXHRcdFx0XHRtZXNoLnNheSh7ZGFtOiAnPycsIHBpZDogb3B0LnBpZCwgJ0AnOiBtc2dbJyMnXX0sIHBlZXIpO1xuXHRcdFx0XHRkZWxldGUgZHVwLnNbcGVlci5sYXN0XTsgLy8gSU1QT1JUQU5UOiBzZWUgaHR0cHM6Ly9ndW4uZWNvL2RvY3MvREFNI3NlbGZcblx0XHRcdH1cblxuXHRcdFx0cm9vdC5vbignY3JlYXRlJywgZnVuY3Rpb24ocm9vdCl7XG5cdFx0XHRcdHJvb3Qub3B0LnBpZCA9IHJvb3Qub3B0LnBpZCB8fCBTdHJpbmcucmFuZG9tKDkpO1xuXHRcdFx0XHR0aGlzLnRvLm5leHQocm9vdCk7XG5cdFx0XHRcdHJvb3Qub24oJ291dCcsIG1lc2guc2F5KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyb290Lm9uKCdieWUnLCBmdW5jdGlvbihwZWVyLCB0bXApe1xuXHRcdFx0XHRwZWVyID0gb3B0LnBlZXJzW3BlZXIuaWQgfHwgcGVlcl0gfHwgcGVlcjtcblx0XHRcdFx0dGhpcy50by5uZXh0KHBlZXIpO1xuXHRcdFx0XHRwZWVyLmJ5ZT8gcGVlci5ieWUoKSA6ICh0bXAgPSBwZWVyLndpcmUpICYmIHRtcC5jbG9zZSAmJiB0bXAuY2xvc2UoKTtcblx0XHRcdFx0ZGVsZXRlIG9wdC5wZWVyc1twZWVyLmlkXTtcblx0XHRcdFx0cGVlci53aXJlID0gbnVsbDtcblx0XHRcdH0pO1xuXG5cdFx0XHR2YXIgZ2V0cyA9IHt9O1xuXHRcdFx0cm9vdC5vbignYnllJywgZnVuY3Rpb24ocGVlciwgdG1wKXsgdGhpcy50by5uZXh0KHBlZXIpO1xuXHRcdFx0XHRpZih0bXAgPSBjb25zb2xlLlNUQVQpeyB0bXAucGVlcnMgPSAodG1wLnBlZXJzIHx8IDApIC0gMTsgfVxuXHRcdFx0XHRpZighKHRtcCA9IHBlZXIudXJsKSl7IHJldHVybiB9IGdldHNbdG1wXSA9IHRydWU7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgZGVsZXRlIGdldHNbdG1wXSB9LG9wdC5sYWNrIHx8IDkwMDApO1xuXHRcdFx0fSk7XG5cdFx0XHRyb290Lm9uKCdoaScsIGZ1bmN0aW9uKHBlZXIsIHRtcCl7IHRoaXMudG8ubmV4dChwZWVyKTtcblx0XHRcdFx0aWYodG1wID0gY29uc29sZS5TVEFUKXsgdG1wLnBlZXJzID0gKHRtcC5wZWVycyB8fCAwKSArIDEgfVxuXHRcdFx0XHRpZighKHRtcCA9IHBlZXIudXJsKSB8fCAhZ2V0c1t0bXBdKXsgcmV0dXJuIH0gZGVsZXRlIGdldHNbdG1wXTtcblx0XHRcdFx0aWYob3B0LnN1cGVyKXsgcmV0dXJuIH0gLy8gdGVtcG9yYXJ5ICg/KSB1bnRpbCB3ZSBoYXZlIGJldHRlciBmaXgvc29sdXRpb24/XG5cdFx0XHRcdHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhyb290Lm5leHQpLCBmdW5jdGlvbihzb3VsKXsgdmFyIG5vZGUgPSByb290Lm5leHRbc291bF07IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93XG5cdFx0XHRcdFx0dG1wID0ge307IHRtcFtzb3VsXSA9IHJvb3QuZ3JhcGhbc291bF07IHRtcCA9IFN0cmluZy5oYXNoKHRtcCk7IC8vIFRPRE86IEJVRyEgVGhpcyBpcyBicm9rZW4uXG5cdFx0XHRcdFx0bWVzaC5zYXkoeycjIyc6IHRtcCwgZ2V0OiB7JyMnOiBzb3VsfX0sIHBlZXIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gbWVzaDtcblx0XHR9XG5cdCAgdmFyIGVtcHR5ID0ge30sIG9rID0gdHJ1ZSwgdTtcblxuXHQgIHRyeXsgbW9kdWxlLmV4cG9ydHMgPSBNZXNoIH1jYXRjaChlKXt9XG5cblx0fSkoVVNFLCAnLi9tZXNoJyk7XG5cblx0O1VTRShmdW5jdGlvbihtb2R1bGUpe1xuXHRcdHZhciBHdW4gPSBVU0UoJy4uL2luZGV4Jyk7XG5cdFx0R3VuLk1lc2ggPSBVU0UoJy4vbWVzaCcpO1xuXG5cdFx0Ly8gVE9ETzogcmVzeW5jIHVwb24gcmVjb25uZWN0IG9ubGluZS9vZmZsaW5lXG5cdFx0Ly93aW5kb3cub25vbmxpbmUgPSB3aW5kb3cub25vZmZsaW5lID0gZnVuY3Rpb24oKXsgY29uc29sZS5sb2coJ29ubGluZT8nLCBuYXZpZ2F0b3Iub25MaW5lKSB9XG5cblx0XHRHdW4ub24oJ29wdCcsIGZ1bmN0aW9uKHJvb3Qpe1xuXHRcdFx0dGhpcy50by5uZXh0KHJvb3QpO1xuXHRcdFx0aWYocm9vdC5vbmNlKXsgcmV0dXJuIH1cblx0XHRcdHZhciBvcHQgPSByb290Lm9wdDtcblx0XHRcdGlmKGZhbHNlID09PSBvcHQuV2ViU29ja2V0KXsgcmV0dXJuIH1cblxuXHRcdFx0dmFyIGVudiA9IEd1bi53aW5kb3cgfHwge307XG5cdFx0XHR2YXIgd2Vic29ja2V0ID0gb3B0LldlYlNvY2tldCB8fCBlbnYuV2ViU29ja2V0IHx8IGVudi53ZWJraXRXZWJTb2NrZXQgfHwgZW52Lm1veldlYlNvY2tldDtcblx0XHRcdGlmKCF3ZWJzb2NrZXQpeyByZXR1cm4gfVxuXHRcdFx0b3B0LldlYlNvY2tldCA9IHdlYnNvY2tldDtcblxuXHRcdFx0dmFyIG1lc2ggPSBvcHQubWVzaCA9IG9wdC5tZXNoIHx8IEd1bi5NZXNoKHJvb3QpO1xuXG5cdFx0XHR2YXIgd2lyZSA9IG1lc2gud2lyZSB8fCBvcHQud2lyZTtcblx0XHRcdG1lc2gud2lyZSA9IG9wdC53aXJlID0gb3Blbjtcblx0XHRcdGZ1bmN0aW9uIG9wZW4ocGVlcil7IHRyeXtcblx0XHRcdFx0aWYoIXBlZXIgfHwgIXBlZXIudXJsKXsgcmV0dXJuIHdpcmUgJiYgd2lyZShwZWVyKSB9XG5cdFx0XHRcdHZhciB1cmwgPSBwZWVyLnVybC5yZXBsYWNlKC9eaHR0cC8sICd3cycpO1xuXHRcdFx0XHR2YXIgd2lyZSA9IHBlZXIud2lyZSA9IG5ldyBvcHQuV2ViU29ja2V0KHVybCk7XG5cdFx0XHRcdHdpcmUub25jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0b3B0Lm1lc2guYnllKHBlZXIpO1xuXHRcdFx0XHRcdHJlY29ubmVjdChwZWVyKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0d2lyZS5vbmVycm9yID0gZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRcdHJlY29ubmVjdChwZWVyKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0d2lyZS5vbm9wZW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRcdG9wdC5tZXNoLmhpKHBlZXIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHdpcmUub25tZXNzYWdlID0gZnVuY3Rpb24obXNnKXtcblx0XHRcdFx0XHRpZighbXNnKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRvcHQubWVzaC5oZWFyKG1zZy5kYXRhIHx8IG1zZywgcGVlcik7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiB3aXJlO1xuXHRcdFx0fWNhdGNoKGUpe319XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgIW9wdC5zdXBlciAmJiByb290Lm9uKCdvdXQnLCB7ZGFtOidoaSd9KSB9LDEpOyAvLyBpdCBjYW4gdGFrZSBhIHdoaWxlIHRvIG9wZW4gYSBzb2NrZXQsIHNvIG1heWJlIG5vIGxvbmdlciBsYXp5IGxvYWQgZm9yIHBlcmYgcmVhc29ucz9cblxuXHRcdFx0dmFyIHdhaXQgPSAyICogOTk5O1xuXHRcdFx0ZnVuY3Rpb24gcmVjb25uZWN0KHBlZXIpe1xuXHRcdFx0XHRjbGVhclRpbWVvdXQocGVlci5kZWZlcik7XG5cdFx0XHRcdGlmKCFvcHQucGVlcnNbcGVlci51cmxdKXsgcmV0dXJuIH1cblx0XHRcdFx0aWYoZG9jICYmIHBlZXIucmV0cnkgPD0gMCl7IHJldHVybiB9XG5cdFx0XHRcdHBlZXIucmV0cnkgPSAocGVlci5yZXRyeSB8fCBvcHQucmV0cnkrMSB8fCA2MCkgLSAoKC1wZWVyLnRyaWVkICsgKHBlZXIudHJpZWQgPSArbmV3IERhdGUpIDwgd2FpdCo0KT8xOjApO1xuXHRcdFx0XHRwZWVyLmRlZmVyID0gc2V0VGltZW91dChmdW5jdGlvbiB0bygpe1xuXHRcdFx0XHRcdGlmKGRvYyAmJiBkb2MuaGlkZGVuKXsgcmV0dXJuIHNldFRpbWVvdXQodG8sd2FpdCkgfVxuXHRcdFx0XHRcdG9wZW4ocGVlcik7XG5cdFx0XHRcdH0sIHdhaXQpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGRvYyA9ICgnJyt1ICE9PSB0eXBlb2YgZG9jdW1lbnQpICYmIGRvY3VtZW50O1xuXHRcdH0pO1xuXHRcdHZhciBub29wID0gZnVuY3Rpb24oKXt9LCB1O1xuXHR9KShVU0UsICcuL3dlYnNvY2tldCcpO1xuXG5cdDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcblx0XHRpZih0eXBlb2YgR3VuID09PSAndW5kZWZpbmVkJyl7IHJldHVybiB9XG5cblx0XHR2YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fSwgc3RvcmUsIHU7XG5cdFx0dHJ5e3N0b3JlID0gKEd1bi53aW5kb3d8fG5vb3ApLmxvY2FsU3RvcmFnZX1jYXRjaChlKXt9XG5cdFx0aWYoIXN0b3JlKXtcblx0XHRcdEd1bi5sb2coXCJXYXJuaW5nOiBObyBsb2NhbFN0b3JhZ2UgZXhpc3RzIHRvIHBlcnNpc3QgZGF0YSB0byFcIik7XG5cdFx0XHRzdG9yZSA9IHtzZXRJdGVtOiBmdW5jdGlvbihrLHYpe3RoaXNba109dn0sIHJlbW92ZUl0ZW06IGZ1bmN0aW9uKGspe2RlbGV0ZSB0aGlzW2tdfSwgZ2V0SXRlbTogZnVuY3Rpb24oayl7cmV0dXJuIHRoaXNba119fTtcblx0XHR9XG5cblx0XHR2YXIgcGFyc2UgPSBKU09OLnBhcnNlQXN5bmMgfHwgZnVuY3Rpb24odCxjYixyKXsgdmFyIHU7IHRyeXsgY2IodSwgSlNPTi5wYXJzZSh0LHIpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxuXHRcdHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnlBc3luYyB8fCBmdW5jdGlvbih2LGNiLHIscyl7IHZhciB1OyB0cnl7IGNiKHUsIEpTT04uc3RyaW5naWZ5KHYscixzKSkgfWNhdGNoKGUpeyBjYihlKSB9IH1cblxuXHRcdEd1bi5vbignY3JlYXRlJywgZnVuY3Rpb24gbGcocm9vdCl7XG5cdFx0XHR0aGlzLnRvLm5leHQocm9vdCk7XG5cdFx0XHR2YXIgb3B0ID0gcm9vdC5vcHQsIGdyYXBoID0gcm9vdC5ncmFwaCwgYWNrcyA9IFtdLCBkaXNrLCB0bywgc2l6ZSwgc3RvcDtcblx0XHRcdGlmKGZhbHNlID09PSBvcHQubG9jYWxTdG9yYWdlKXsgcmV0dXJuIH1cblx0XHRcdG9wdC5wcmVmaXggPSBvcHQuZmlsZSB8fCAnZ3VuLyc7XG5cdFx0XHR0cnl7IGRpc2sgPSBsZ1tvcHQucHJlZml4XSA9IGxnW29wdC5wcmVmaXhdIHx8IEpTT04ucGFyc2Uoc2l6ZSA9IHN0b3JlLmdldEl0ZW0ob3B0LnByZWZpeCkpIHx8IHt9OyAvLyBUT0RPOiBQZXJmISBUaGlzIHdpbGwgYmxvY2ssIHNob3VsZCB3ZSBjYXJlLCBzaW5jZSBsaW1pdGVkIHRvIDVNQiBhbnl3YXlzP1xuXHRcdFx0fWNhdGNoKGUpeyBkaXNrID0gbGdbb3B0LnByZWZpeF0gPSB7fTsgfVxuXHRcdFx0c2l6ZSA9IChzaXplfHwnJykubGVuZ3RoO1xuXG5cdFx0XHRyb290Lm9uKCdnZXQnLCBmdW5jdGlvbihtc2cpe1xuXHRcdFx0XHR0aGlzLnRvLm5leHQobXNnKTtcblx0XHRcdFx0dmFyIGxleCA9IG1zZy5nZXQsIHNvdWwsIGRhdGEsIHRtcCwgdTtcblx0XHRcdFx0aWYoIWxleCB8fCAhKHNvdWwgPSBsZXhbJyMnXSkpeyByZXR1cm4gfVxuXHRcdFx0XHRkYXRhID0gZGlza1tzb3VsXSB8fCB1O1xuXHRcdFx0XHRpZihkYXRhICYmICh0bXAgPSBsZXhbJy4nXSkgJiYgIU9iamVjdC5wbGFpbih0bXApKXsgLy8gcGx1Y2shXG5cdFx0XHRcdFx0ZGF0YSA9IEd1bi5zdGF0ZS5pZnkoe30sIHRtcCwgR3VuLnN0YXRlLmlzKGRhdGEsIHRtcCksIGRhdGFbdG1wXSwgc291bCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly9pZihkYXRhKXsgKHRtcCA9IHt9KVtzb3VsXSA9IGRhdGEgfSAvLyBiYWNrIGludG8gYSBncmFwaC5cblx0XHRcdFx0Ly9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdEd1bi5vbi5nZXQuYWNrKG1zZywgZGF0YSk7IC8vcm9vdC5vbignaW4nLCB7J0AnOiBtc2dbJyMnXSwgcHV0OiB0bXAsIGxTOjF9KTsvLyB8fCByb290LiR9KTtcblx0XHRcdFx0Ly99LCBNYXRoLnJhbmRvbSgpICogMTApOyAvLyBGT1IgVEVTVElORyBQVVJQT1NFUyFcblx0XHRcdH0pO1xuXG5cdFx0XHRyb290Lm9uKCdwdXQnLCBmdW5jdGlvbihtc2cpe1xuXHRcdFx0XHR0aGlzLnRvLm5leHQobXNnKTsgLy8gcmVtZW1iZXIgdG8gY2FsbCBuZXh0IG1pZGRsZXdhcmUgYWRhcHRlclxuXHRcdFx0XHR2YXIgcHV0ID0gbXNnLnB1dCwgc291bCA9IHB1dFsnIyddLCBrZXkgPSBwdXRbJy4nXSwgaWQgPSBtc2dbJyMnXSwgdG1wOyAvLyBwdWxsIGRhdGEgb2ZmIHdpcmUgZW52ZWxvcGVcblx0XHRcdFx0ZGlza1tzb3VsXSA9IEd1bi5zdGF0ZS5pZnkoZGlza1tzb3VsXSwga2V5LCBwdXRbJz4nXSwgcHV0Wyc6J10sIHNvdWwpOyAvLyBtZXJnZSBpbnRvIGRpc2sgb2JqZWN0XG5cdFx0XHRcdGlmKHN0b3AgJiYgc2l6ZSA+ICg0OTk5ODgwKSl7IHJvb3Qub24oJ2luJywgeydAJzogaWQsIGVycjogXCJsb2NhbFN0b3JhZ2UgbWF4IVwifSk7IHJldHVybjsgfVxuXHRcdFx0XHRpZighbXNnWydAJ10peyBhY2tzLnB1c2goaWQpIH0gLy8gdGhlbiBhY2sgYW55IG5vbi1hY2sgd3JpdGUuIC8vIFRPRE86IHVzZSBiYXRjaCBpZC5cblx0XHRcdFx0aWYodG8peyByZXR1cm4gfVxuXHRcdFx0XHR0byA9IHNldFRpbWVvdXQoZmx1c2gsIDkrKHNpemUgLyAzMzMpKTsgLy8gMC4xTUIgPSAwLjNzLCA1TUIgPSAxNXMgXG5cdFx0XHR9KTtcblx0XHRcdGZ1bmN0aW9uIGZsdXNoKCl7XG5cdFx0XHRcdGlmKCFhY2tzLmxlbmd0aCAmJiAoKHNldFRpbWVvdXQudHVybnx8JycpLnN8fCcnKS5sZW5ndGgpeyBzZXRUaW1lb3V0KGZsdXNoLDk5KTsgcmV0dXJuOyB9IC8vIGRlZmVyIGlmIFwiYnVzeVwiICYmIG5vIHNhdmVzLlxuXHRcdFx0XHR2YXIgZXJyLCBhY2sgPSBhY2tzOyBjbGVhclRpbWVvdXQodG8pOyB0byA9IGZhbHNlOyBhY2tzID0gW107XG5cdFx0XHRcdGpzb24oZGlzaywgZnVuY3Rpb24oZXJyLCB0bXApe1xuXHRcdFx0XHRcdHRyeXshZXJyICYmIHN0b3JlLnNldEl0ZW0ob3B0LnByZWZpeCwgdG1wKTtcblx0XHRcdFx0XHR9Y2F0Y2goZSl7IGVyciA9IHN0b3AgPSBlIHx8IFwibG9jYWxTdG9yYWdlIGZhaWx1cmVcIiB9XG5cdFx0XHRcdFx0aWYoZXJyKXtcblx0XHRcdFx0XHRcdEd1bi5sb2coZXJyICsgXCIgQ29uc2lkZXIgdXNpbmcgR1VOJ3MgSW5kZXhlZERCIHBsdWdpbiBmb3IgUkFEIGZvciBtb3JlIHN0b3JhZ2Ugc3BhY2UsIGh0dHBzOi8vZ3VuLmVjby9kb2NzL1JBRCNpbnN0YWxsXCIpO1xuXHRcdFx0XHRcdFx0cm9vdC5vbignbG9jYWxTdG9yYWdlOmVycm9yJywge2VycjogZXJyLCBnZXQ6IG9wdC5wcmVmaXgsIHB1dDogZGlza30pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzaXplID0gdG1wLmxlbmd0aDtcblxuXHRcdFx0XHRcdGlmKCFlcnIgJiYgIU9iamVjdC5lbXB0eShvcHQucGVlcnMpKXsgcmV0dXJuIH0gLy8gb25seSBhY2sgaWYgdGhlcmUgYXJlIG5vIHBlZXJzLiAvLyBTd2l0Y2ggdGhpcyB0byBwcm9iYWJpbGlzdGljIG1vZGVcblx0XHRcdFx0XHRzZXRUaW1lb3V0LmVhY2goYWNrLCBmdW5jdGlvbihpZCl7XG5cdFx0XHRcdFx0XHRyb290Lm9uKCdpbicsIHsnQCc6IGlkLCBlcnI6IGVyciwgb2s6IDB9KTsgLy8gbG9jYWxTdG9yYWdlIGlzbid0IHJlbGlhYmxlLCBzbyBtYWtlIGl0cyBgb2tgIGNvZGUgYmUgYSBsb3cgbnVtYmVyLlxuXHRcdFx0XHRcdH0sMCw5OSk7XG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0XG5cdFx0fSk7XG5cdH0pKFVTRSwgJy4vbG9jYWxTdG9yYWdlJyk7XG5cbn0oKSk7XG5cbi8qIEJFTE9XIElTIFRFTVBPUkFSWSBGT1IgT0xEIElOVEVSTkFMIENPTVBBVElCSUxJVFksIFRIRVkgQVJFIElNTUVESUFURUxZIERFUFJFQ0FURUQgQU5EIFdJTEwgQkUgUkVNT1ZFRCBJTiBORVhUIFZFUlNJT04gKi9cbjsoZnVuY3Rpb24oKXtcblx0dmFyIHU7XG5cdGlmKCcnK3UgPT0gdHlwZW9mIEd1bil7IHJldHVybiB9XG5cdHZhciBERVAgPSBmdW5jdGlvbihuKXsgY29uc29sZS53YXJuKFwiV2FybmluZyEgRGVwcmVjYXRlZCBpbnRlcm5hbCB1dGlsaXR5IHdpbGwgYnJlYWsgaW4gbmV4dCB2ZXJzaW9uOlwiLCBuKSB9XG5cdC8vIEdlbmVyaWMgamF2YXNjcmlwdCB1dGlsaXRpZXMuXG5cdHZhciBUeXBlID0gR3VuO1xuXHQvL1R5cGUuZm5zID0gVHlwZS5mbiA9IHtpczogZnVuY3Rpb24oZm4peyByZXR1cm4gKCEhZm4gJiYgZm4gaW5zdGFuY2VvZiBGdW5jdGlvbikgfX1cblx0VHlwZS5mbiA9IFR5cGUuZm4gfHwge2lzOiBmdW5jdGlvbihmbil7IERFUCgnZm4nKTsgcmV0dXJuICghIWZuICYmICdmdW5jdGlvbicgPT0gdHlwZW9mIGZuKSB9fVxuXHRUeXBlLmJpID0gVHlwZS5iaSB8fCB7aXM6IGZ1bmN0aW9uKGIpeyBERVAoJ2JpJyk7cmV0dXJuIChiIGluc3RhbmNlb2YgQm9vbGVhbiB8fCB0eXBlb2YgYiA9PSAnYm9vbGVhbicpIH19XG5cdFR5cGUubnVtID0gVHlwZS5udW0gfHwge2lzOiBmdW5jdGlvbihuKXsgREVQKCdudW0nKTsgcmV0dXJuICFsaXN0X2lzKG4pICYmICgobiAtIHBhcnNlRmxvYXQobikgKyAxKSA+PSAwIHx8IEluZmluaXR5ID09PSBuIHx8IC1JbmZpbml0eSA9PT0gbikgfX1cblx0VHlwZS50ZXh0ID0gVHlwZS50ZXh0IHx8IHtpczogZnVuY3Rpb24odCl7IERFUCgndGV4dCcpOyByZXR1cm4gKHR5cGVvZiB0ID09ICdzdHJpbmcnKSB9fVxuXHRUeXBlLnRleHQuaWZ5ID0gVHlwZS50ZXh0LmlmeSB8fCBmdW5jdGlvbih0KXsgREVQKCd0ZXh0LmlmeScpO1xuXHRcdGlmKFR5cGUudGV4dC5pcyh0KSl7IHJldHVybiB0IH1cblx0XHRpZih0eXBlb2YgSlNPTiAhPT0gXCJ1bmRlZmluZWRcIil7IHJldHVybiBKU09OLnN0cmluZ2lmeSh0KSB9XG5cdFx0cmV0dXJuICh0ICYmIHQudG9TdHJpbmcpPyB0LnRvU3RyaW5nKCkgOiB0O1xuXHR9XG5cdFR5cGUudGV4dC5yYW5kb20gPSBUeXBlLnRleHQucmFuZG9tIHx8IGZ1bmN0aW9uKGwsIGMpeyBERVAoJ3RleHQucmFuZG9tJyk7XG5cdFx0dmFyIHMgPSAnJztcblx0XHRsID0gbCB8fCAyNDsgLy8geW91IGFyZSBub3QgZ29pbmcgdG8gbWFrZSBhIDAgbGVuZ3RoIHJhbmRvbSBudW1iZXIsIHNvIG5vIG5lZWQgdG8gY2hlY2sgdHlwZVxuXHRcdGMgPSBjIHx8ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Jztcblx0XHR3aGlsZShsID4gMCl7IHMgKz0gYy5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYy5sZW5ndGgpKTsgbC0tIH1cblx0XHRyZXR1cm4gcztcblx0fVxuXHRUeXBlLnRleHQubWF0Y2ggPSBUeXBlLnRleHQubWF0Y2ggfHwgZnVuY3Rpb24odCwgbyl7IHZhciB0bXAsIHU7IERFUCgndGV4dC5tYXRjaCcpO1xuXHRcdGlmKCdzdHJpbmcnICE9PSB0eXBlb2YgdCl7IHJldHVybiBmYWxzZSB9XG5cdFx0aWYoJ3N0cmluZycgPT0gdHlwZW9mIG8peyBvID0geyc9Jzogb30gfVxuXHRcdG8gPSBvIHx8IHt9O1xuXHRcdHRtcCA9IChvWyc9J10gfHwgb1snKiddIHx8IG9bJz4nXSB8fCBvWyc8J10pO1xuXHRcdGlmKHQgPT09IHRtcCl7IHJldHVybiB0cnVlIH1cblx0XHRpZih1ICE9PSBvWyc9J10peyByZXR1cm4gZmFsc2UgfVxuXHRcdHRtcCA9IChvWycqJ10gfHwgb1snPiddIHx8IG9bJzwnXSk7XG5cdFx0aWYodC5zbGljZSgwLCAodG1wfHwnJykubGVuZ3RoKSA9PT0gdG1wKXsgcmV0dXJuIHRydWUgfVxuXHRcdGlmKHUgIT09IG9bJyonXSl7IHJldHVybiBmYWxzZSB9XG5cdFx0aWYodSAhPT0gb1snPiddICYmIHUgIT09IG9bJzwnXSl7XG5cdFx0XHRyZXR1cm4gKHQgPj0gb1snPiddICYmIHQgPD0gb1snPCddKT8gdHJ1ZSA6IGZhbHNlO1xuXHRcdH1cblx0XHRpZih1ICE9PSBvWyc+J10gJiYgdCA+PSBvWyc+J10peyByZXR1cm4gdHJ1ZSB9XG5cdFx0aWYodSAhPT0gb1snPCddICYmIHQgPD0gb1snPCddKXsgcmV0dXJuIHRydWUgfVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRUeXBlLnRleHQuaGFzaCA9IFR5cGUudGV4dC5oYXNoIHx8IGZ1bmN0aW9uKHMsIGMpeyAvLyB2aWEgU09cblx0XHRERVAoJ3RleHQuaGFzaCcpO1xuXHRcdGlmKHR5cGVvZiBzICE9PSAnc3RyaW5nJyl7IHJldHVybiB9XG5cdCAgYyA9IGMgfHwgMDtcblx0ICBpZighcy5sZW5ndGgpeyByZXR1cm4gYyB9XG5cdCAgZm9yKHZhciBpPTAsbD1zLmxlbmd0aCxuOyBpPGw7ICsraSl7XG5cdCAgICBuID0gcy5jaGFyQ29kZUF0KGkpO1xuXHQgICAgYyA9ICgoYzw8NSktYykrbjtcblx0ICAgIGMgfD0gMDtcblx0ICB9XG5cdCAgcmV0dXJuIGM7XG5cdH1cblx0VHlwZS5saXN0ID0gVHlwZS5saXN0IHx8IHtpczogZnVuY3Rpb24obCl7IERFUCgnbGlzdCcpOyByZXR1cm4gKGwgaW5zdGFuY2VvZiBBcnJheSkgfX1cblx0VHlwZS5saXN0LnNsaXQgPSBUeXBlLmxpc3Quc2xpdCB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cdFR5cGUubGlzdC5zb3J0ID0gVHlwZS5saXN0LnNvcnQgfHwgZnVuY3Rpb24oayl7IC8vIGNyZWF0ZXMgYSBuZXcgc29ydCBmdW5jdGlvbiBiYXNlZCBvZmYgc29tZSBrZXlcblx0XHRERVAoJ2xpc3Quc29ydCcpO1xuXHRcdHJldHVybiBmdW5jdGlvbihBLEIpe1xuXHRcdFx0aWYoIUEgfHwgIUIpeyByZXR1cm4gMCB9IEEgPSBBW2tdOyBCID0gQltrXTtcblx0XHRcdGlmKEEgPCBCKXsgcmV0dXJuIC0xIH1lbHNlIGlmKEEgPiBCKXsgcmV0dXJuIDEgfVxuXHRcdFx0ZWxzZSB7IHJldHVybiAwIH1cblx0XHR9XG5cdH1cblx0VHlwZS5saXN0Lm1hcCA9IFR5cGUubGlzdC5tYXAgfHwgZnVuY3Rpb24obCwgYywgXyl7IERFUCgnbGlzdC5tYXAnKTsgcmV0dXJuIG9ial9tYXAobCwgYywgXykgfVxuXHRUeXBlLmxpc3QuaW5kZXggPSAxOyAvLyBjaGFuZ2UgdGhpcyB0byAwIGlmIHlvdSB3YW50IG5vbi1sb2dpY2FsLCBub24tbWF0aGVtYXRpY2FsLCBub24tbWF0cml4LCBub24tY29udmVuaWVudCBhcnJheSBub3RhdGlvblxuXHRUeXBlLm9iaiA9IFR5cGUuYm9qIHx8IHtpczogZnVuY3Rpb24obyl7IERFUCgnb2JqJyk7IHJldHVybiBvPyAobyBpbnN0YW5jZW9mIE9iamVjdCAmJiBvLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5tYXRjaCgvXlxcW29iamVjdCAoXFx3KylcXF0kLylbMV0gPT09ICdPYmplY3QnIDogZmFsc2UgfX1cblx0VHlwZS5vYmoucHV0ID0gVHlwZS5vYmoucHV0IHx8IGZ1bmN0aW9uKG8sIGssIHYpeyBERVAoJ29iai5wdXQnKTsgcmV0dXJuIChvfHx7fSlba10gPSB2LCBvIH1cblx0VHlwZS5vYmouaGFzID0gVHlwZS5vYmouaGFzIHx8IGZ1bmN0aW9uKG8sIGspeyBERVAoJ29iai5oYXMnKTsgcmV0dXJuIG8gJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspIH1cblx0VHlwZS5vYmouZGVsID0gVHlwZS5vYmouZGVsIHx8IGZ1bmN0aW9uKG8sIGspeyBERVAoJ29iai5kZWwnKTsgXG5cdFx0aWYoIW8peyByZXR1cm4gfVxuXHRcdG9ba10gPSBudWxsO1xuXHRcdGRlbGV0ZSBvW2tdO1xuXHRcdHJldHVybiBvO1xuXHR9XG5cdFR5cGUub2JqLmFzID0gVHlwZS5vYmouYXMgfHwgZnVuY3Rpb24obywgaywgdiwgdSl7IERFUCgnb2JqLmFzJyk7IHJldHVybiBvW2tdID0gb1trXSB8fCAodSA9PT0gdj8ge30gOiB2KSB9XG5cdFR5cGUub2JqLmlmeSA9IFR5cGUub2JqLmlmeSB8fCBmdW5jdGlvbihvKXsgREVQKCdvYmouaWZ5Jyk7IFxuXHRcdGlmKG9ial9pcyhvKSl7IHJldHVybiBvIH1cblx0XHR0cnl7byA9IEpTT04ucGFyc2Uobyk7XG5cdFx0fWNhdGNoKGUpe289e319O1xuXHRcdHJldHVybiBvO1xuXHR9XG5cdDsoZnVuY3Rpb24oKXsgdmFyIHU7XG5cdFx0ZnVuY3Rpb24gbWFwKHYsayl7XG5cdFx0XHRpZihvYmpfaGFzKHRoaXMsaykgJiYgdSAhPT0gdGhpc1trXSl7IHJldHVybiB9XG5cdFx0XHR0aGlzW2tdID0gdjtcblx0XHR9XG5cdFx0VHlwZS5vYmoudG8gPSBUeXBlLm9iai50byB8fCBmdW5jdGlvbihmcm9tLCB0byl7IERFUCgnb2JqLnRvJyk7IFxuXHRcdFx0dG8gPSB0byB8fCB7fTtcblx0XHRcdG9ial9tYXAoZnJvbSwgbWFwLCB0byk7XG5cdFx0XHRyZXR1cm4gdG87XG5cdFx0fVxuXHR9KCkpO1xuXHRUeXBlLm9iai5jb3B5ID0gVHlwZS5vYmouY29weSB8fCBmdW5jdGlvbihvKXsgREVQKCdvYmouY29weScpOyAvLyBiZWNhdXNlIGh0dHA6Ly93ZWIuYXJjaGl2ZS5vcmcvd2ViLzIwMTQwMzI4MjI0MDI1L2h0dHA6Ly9qc3BlcmYuY29tL2Nsb25pbmctYW4tb2JqZWN0LzJcblx0XHRyZXR1cm4gIW8/IG8gOiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG8pKTsgLy8gaXMgc2hvY2tpbmdseSBmYXN0ZXIgdGhhbiBhbnl0aGluZyBlbHNlLCBhbmQgb3VyIGRhdGEgaGFzIHRvIGJlIGEgc3Vic2V0IG9mIEpTT04gYW55d2F5cyFcblx0fVxuXHQ7KGZ1bmN0aW9uKCl7XG5cdFx0ZnVuY3Rpb24gZW1wdHkodixpKXsgdmFyIG4gPSB0aGlzLm4sIHU7XG5cdFx0XHRpZihuICYmIChpID09PSBuIHx8IChvYmpfaXMobikgJiYgb2JqX2hhcyhuLCBpKSkpKXsgcmV0dXJuIH1cblx0XHRcdGlmKHUgIT09IGkpeyByZXR1cm4gdHJ1ZSB9XG5cdFx0fVxuXHRcdFR5cGUub2JqLmVtcHR5ID0gVHlwZS5vYmouZW1wdHkgfHwgZnVuY3Rpb24obywgbil7IERFUCgnb2JqLmVtcHR5Jyk7IFxuXHRcdFx0aWYoIW8peyByZXR1cm4gdHJ1ZSB9XG5cdFx0XHRyZXR1cm4gb2JqX21hcChvLGVtcHR5LHtuOm59KT8gZmFsc2UgOiB0cnVlO1xuXHRcdH1cblx0fSgpKTtcblx0OyhmdW5jdGlvbigpe1xuXHRcdGZ1bmN0aW9uIHQoayx2KXtcblx0XHRcdGlmKDIgPT09IGFyZ3VtZW50cy5sZW5ndGgpe1xuXHRcdFx0XHR0LnIgPSB0LnIgfHwge307XG5cdFx0XHRcdHQucltrXSA9IHY7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH0gdC5yID0gdC5yIHx8IFtdO1xuXHRcdFx0dC5yLnB1c2goayk7XG5cdFx0fTtcblx0XHR2YXIga2V5cyA9IE9iamVjdC5rZXlzLCBtYXAsIHU7XG5cdFx0T2JqZWN0LmtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbihvKXsgcmV0dXJuIG1hcChvLCBmdW5jdGlvbih2LGssdCl7dChrKX0pIH1cblx0XHRUeXBlLm9iai5tYXAgPSBtYXAgPSBUeXBlLm9iai5tYXAgfHwgZnVuY3Rpb24obCwgYywgXyl7IERFUCgnb2JqLm1hcCcpOyBcblx0XHRcdHZhciB1LCBpID0gMCwgeCwgciwgbGwsIGxsZSwgZiA9ICdmdW5jdGlvbicgPT0gdHlwZW9mIGM7XG5cdFx0XHR0LnIgPSB1O1xuXHRcdFx0aWYoa2V5cyAmJiBvYmpfaXMobCkpe1xuXHRcdFx0XHRsbCA9IGtleXMobCk7IGxsZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRfID0gXyB8fCB7fTtcblx0XHRcdGlmKGxpc3RfaXMobCkgfHwgbGwpe1xuXHRcdFx0XHR4ID0gKGxsIHx8IGwpLmxlbmd0aDtcblx0XHRcdFx0Zm9yKDtpIDwgeDsgaSsrKXtcblx0XHRcdFx0XHR2YXIgaWkgPSAoaSArIFR5cGUubGlzdC5pbmRleCk7XG5cdFx0XHRcdFx0aWYoZil7XG5cdFx0XHRcdFx0XHRyID0gbGxlPyBjLmNhbGwoXywgbFtsbFtpXV0sIGxsW2ldLCB0KSA6IGMuY2FsbChfLCBsW2ldLCBpaSwgdCk7XG5cdFx0XHRcdFx0XHRpZihyICE9PSB1KXsgcmV0dXJuIHIgfVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvL2lmKFR5cGUudGVzdC5pcyhjLGxbaV0pKXsgcmV0dXJuIGlpIH0gLy8gc2hvdWxkIGltcGxlbWVudCBkZWVwIGVxdWFsaXR5IHRlc3RpbmchXG5cdFx0XHRcdFx0XHRpZihjID09PSBsW2xsZT8gbGxbaV0gOiBpXSl7IHJldHVybiBsbD8gbGxbaV0gOiBpaSB9IC8vIHVzZSB0aGlzIGZvciBub3dcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvcihpIGluIGwpe1xuXHRcdFx0XHRcdGlmKGYpe1xuXHRcdFx0XHRcdFx0aWYob2JqX2hhcyhsLGkpKXtcblx0XHRcdFx0XHRcdFx0ciA9IF8/IGMuY2FsbChfLCBsW2ldLCBpLCB0KSA6IGMobFtpXSwgaSwgdCk7XG5cdFx0XHRcdFx0XHRcdGlmKHIgIT09IHUpeyByZXR1cm4gciB9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vaWYoYS50ZXN0LmlzKGMsbFtpXSkpeyByZXR1cm4gaSB9IC8vIHNob3VsZCBpbXBsZW1lbnQgZGVlcCBlcXVhbGl0eSB0ZXN0aW5nIVxuXHRcdFx0XHRcdFx0aWYoYyA9PT0gbFtpXSl7IHJldHVybiBpIH0gLy8gdXNlIHRoaXMgZm9yIG5vd1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGY/IHQuciA6IFR5cGUubGlzdC5pbmRleD8gMCA6IC0xO1xuXHRcdH1cblx0fSgpKTtcblx0VHlwZS50aW1lID0gVHlwZS50aW1lIHx8IHt9O1xuXHRUeXBlLnRpbWUuaXMgPSBUeXBlLnRpbWUuaXMgfHwgZnVuY3Rpb24odCl7IERFUCgndGltZScpOyByZXR1cm4gdD8gdCBpbnN0YW5jZW9mIERhdGUgOiAoK25ldyBEYXRlKCkuZ2V0VGltZSgpKSB9XG5cblx0dmFyIGZuX2lzID0gVHlwZS5mbi5pcztcblx0dmFyIGxpc3RfaXMgPSBUeXBlLmxpc3QuaXM7XG5cdHZhciBvYmogPSBUeXBlLm9iaiwgb2JqX2lzID0gb2JqLmlzLCBvYmpfaGFzID0gb2JqLmhhcywgb2JqX21hcCA9IG9iai5tYXA7XG5cblx0dmFyIFZhbCA9IHt9O1xuXHRWYWwuaXMgPSBmdW5jdGlvbih2KXsgREVQKCd2YWwuaXMnKTsgLy8gVmFsaWQgdmFsdWVzIGFyZSBhIHN1YnNldCBvZiBKU09OOiBudWxsLCBiaW5hcnksIG51bWJlciAoIUluZmluaXR5KSwgdGV4dCwgb3IgYSBzb3VsIHJlbGF0aW9uLiBBcnJheXMgbmVlZCBzcGVjaWFsIGFsZ29yaXRobXMgdG8gaGFuZGxlIGNvbmN1cnJlbmN5LCBzbyB0aGV5IGFyZSBub3Qgc3VwcG9ydGVkIGRpcmVjdGx5LiBVc2UgYW4gZXh0ZW5zaW9uIHRoYXQgc3VwcG9ydHMgdGhlbSBpZiBuZWVkZWQgYnV0IHJlc2VhcmNoIHRoZWlyIHByb2JsZW1zIGZpcnN0LlxuXHRcdGlmKHYgPT09IHUpeyByZXR1cm4gZmFsc2UgfVxuXHRcdGlmKHYgPT09IG51bGwpeyByZXR1cm4gdHJ1ZSB9IC8vIFwiZGVsZXRlc1wiLCBudWxsaW5nIG91dCBrZXlzLlxuXHRcdGlmKHYgPT09IEluZmluaXR5KXsgcmV0dXJuIGZhbHNlIH0gLy8gd2Ugd2FudCB0aGlzIHRvIGJlLCBidXQgSlNPTiBkb2VzIG5vdCBzdXBwb3J0IGl0LCBzYWQgZmFjZS5cblx0XHRpZih0ZXh0X2lzKHYpIC8vIGJ5IFwidGV4dFwiIHdlIG1lYW4gc3RyaW5ncy5cblx0XHR8fCBiaV9pcyh2KSAvLyBieSBcImJpbmFyeVwiIHdlIG1lYW4gYm9vbGVhbi5cblx0XHR8fCBudW1faXModikpeyAvLyBieSBcIm51bWJlclwiIHdlIG1lYW4gaW50ZWdlcnMgb3IgZGVjaW1hbHMuXG5cdFx0XHRyZXR1cm4gdHJ1ZTsgLy8gc2ltcGxlIHZhbHVlcyBhcmUgdmFsaWQuXG5cdFx0fVxuXHRcdHJldHVybiBWYWwubGluay5pcyh2KSB8fCBmYWxzZTsgLy8gaXMgdGhlIHZhbHVlIGEgc291bCByZWxhdGlvbj8gVGhlbiBpdCBpcyB2YWxpZCBhbmQgcmV0dXJuIGl0LiBJZiBub3QsIGV2ZXJ5dGhpbmcgZWxzZSByZW1haW5pbmcgaXMgYW4gaW52YWxpZCBkYXRhIHR5cGUuIEN1c3RvbSBleHRlbnNpb25zIGNhbiBiZSBidWlsdCBvbiB0b3Agb2YgdGhlc2UgcHJpbWl0aXZlcyB0byBzdXBwb3J0IG90aGVyIHR5cGVzLlxuXHR9XG5cdFZhbC5saW5rID0gVmFsLnJlbCA9IHtfOiAnIyd9O1xuXHQ7KGZ1bmN0aW9uKCl7XG5cdFx0VmFsLmxpbmsuaXMgPSBmdW5jdGlvbih2KXsgREVQKCd2YWwubGluay5pcycpOyAvLyB0aGlzIGRlZmluZXMgd2hldGhlciBhbiBvYmplY3QgaXMgYSBzb3VsIHJlbGF0aW9uIG9yIG5vdCwgdGhleSBsb29rIGxpa2UgdGhpczogeycjJzogJ1VVSUQnfVxuXHRcdFx0aWYodiAmJiB2W3JlbF9dICYmICF2Ll8gJiYgb2JqX2lzKHYpKXsgLy8gbXVzdCBiZSBhbiBvYmplY3QuXG5cdFx0XHRcdHZhciBvID0ge307XG5cdFx0XHRcdG9ial9tYXAodiwgbWFwLCBvKTtcblx0XHRcdFx0aWYoby5pZCl7IC8vIGEgdmFsaWQgaWQgd2FzIGZvdW5kLlxuXHRcdFx0XHRcdHJldHVybiBvLmlkOyAvLyB5YXkhIFJldHVybiBpdC5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlOyAvLyB0aGUgdmFsdWUgd2FzIG5vdCBhIHZhbGlkIHNvdWwgcmVsYXRpb24uXG5cdFx0fVxuXHRcdGZ1bmN0aW9uIG1hcChzLCBrKXsgdmFyIG8gPSB0aGlzOyAvLyBtYXAgb3ZlciB0aGUgb2JqZWN0Li4uXG5cdFx0XHRpZihvLmlkKXsgcmV0dXJuIG8uaWQgPSBmYWxzZSB9IC8vIGlmIElEIGlzIGFscmVhZHkgZGVmaW5lZCBBTkQgd2UncmUgc3RpbGwgbG9vcGluZyB0aHJvdWdoIHRoZSBvYmplY3QsIGl0IGlzIGNvbnNpZGVyZWQgaW52YWxpZC5cblx0XHRcdGlmKGsgPT0gcmVsXyAmJiB0ZXh0X2lzKHMpKXsgLy8gdGhlIGtleSBzaG91bGQgYmUgJyMnIGFuZCBoYXZlIGEgdGV4dCB2YWx1ZS5cblx0XHRcdFx0by5pZCA9IHM7IC8vIHdlIGZvdW5kIHRoZSBzb3VsIVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG8uaWQgPSBmYWxzZTsgLy8gaWYgdGhlcmUgZXhpc3RzIGFueXRoaW5nIGVsc2Ugb24gdGhlIG9iamVjdCB0aGF0IGlzbid0IHRoZSBzb3VsLCB0aGVuIGl0IGlzIGNvbnNpZGVyZWQgaW52YWxpZC5cblx0XHRcdH1cblx0XHR9XG5cdH0oKSk7XG5cdFZhbC5saW5rLmlmeSA9IGZ1bmN0aW9uKHQpeyBERVAoJ3ZhbC5saW5rLmlmeScpOyByZXR1cm4gb2JqX3B1dCh7fSwgcmVsXywgdCkgfSAvLyBjb252ZXJ0IGEgc291bCBpbnRvIGEgcmVsYXRpb24gYW5kIHJldHVybiBpdC5cblx0VHlwZS5vYmouaGFzLl8gPSAnLic7XG5cdHZhciByZWxfID0gVmFsLmxpbmsuXywgdTtcblx0dmFyIGJpX2lzID0gVHlwZS5iaS5pcztcblx0dmFyIG51bV9pcyA9IFR5cGUubnVtLmlzO1xuXHR2YXIgdGV4dF9pcyA9IFR5cGUudGV4dC5pcztcblx0dmFyIG9iaiA9IFR5cGUub2JqLCBvYmpfaXMgPSBvYmouaXMsIG9ial9wdXQgPSBvYmoucHV0LCBvYmpfbWFwID0gb2JqLm1hcDtcblxuXHRUeXBlLnZhbCA9IFR5cGUudmFsIHx8IFZhbDtcblxuXHR2YXIgTm9kZSA9IHtfOiAnXyd9O1xuXHROb2RlLnNvdWwgPSBmdW5jdGlvbihuLCBvKXsgREVQKCdub2RlLnNvdWwnKTsgcmV0dXJuIChuICYmIG4uXyAmJiBuLl9bbyB8fCBzb3VsX10pIH0gLy8gY29udmVuaWVuY2UgZnVuY3Rpb24gdG8gY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGlzIGEgc291bCBvbiBhIG5vZGUgYW5kIHJldHVybiBpdC5cblx0Tm9kZS5zb3VsLmlmeSA9IGZ1bmN0aW9uKG4sIG8peyBERVAoJ25vZGUuc291bC5pZnknKTsgLy8gcHV0IGEgc291bCBvbiBhbiBvYmplY3QuXG5cdFx0byA9ICh0eXBlb2YgbyA9PT0gJ3N0cmluZycpPyB7c291bDogb30gOiBvIHx8IHt9O1xuXHRcdG4gPSBuIHx8IHt9OyAvLyBtYWtlIHN1cmUgaXQgZXhpc3RzLlxuXHRcdG4uXyA9IG4uXyB8fCB7fTsgLy8gbWFrZSBzdXJlIG1ldGEgZXhpc3RzLlxuXHRcdG4uX1tzb3VsX10gPSBvLnNvdWwgfHwgbi5fW3NvdWxfXSB8fCB0ZXh0X3JhbmRvbSgpOyAvLyBwdXQgdGhlIHNvdWwgb24gaXQuXG5cdFx0cmV0dXJuIG47XG5cdH1cblx0Tm9kZS5zb3VsLl8gPSBWYWwubGluay5fO1xuXHQ7KGZ1bmN0aW9uKCl7XG5cdFx0Tm9kZS5pcyA9IGZ1bmN0aW9uKG4sIGNiLCBhcyl7IERFUCgnbm9kZS5pcycpOyB2YXIgczsgLy8gY2hlY2tzIHRvIHNlZSBpZiBhbiBvYmplY3QgaXMgYSB2YWxpZCBub2RlLlxuXHRcdFx0aWYoIW9ial9pcyhuKSl7IHJldHVybiBmYWxzZSB9IC8vIG11c3QgYmUgYW4gb2JqZWN0LlxuXHRcdFx0aWYocyA9IE5vZGUuc291bChuKSl7IC8vIG11c3QgaGF2ZSBhIHNvdWwgb24gaXQuXG5cdFx0XHRcdHJldHVybiAhb2JqX21hcChuLCBtYXAsIHthczphcyxjYjpjYixzOnMsbjpufSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7IC8vIG5vcGUhIFRoaXMgd2FzIG5vdCBhIHZhbGlkIG5vZGUuXG5cdFx0fVxuXHRcdGZ1bmN0aW9uIG1hcCh2LCBrKXsgLy8gd2UgaW52ZXJ0IHRoaXMgYmVjYXVzZSB0aGUgd2F5IHdlIGNoZWNrIGZvciB0aGlzIGlzIHZpYSBhIG5lZ2F0aW9uLlxuXHRcdFx0aWYoayA9PT0gTm9kZS5fKXsgcmV0dXJuIH0gLy8gc2tpcCBvdmVyIHRoZSBtZXRhZGF0YS5cblx0XHRcdGlmKCFWYWwuaXModikpeyByZXR1cm4gdHJ1ZSB9IC8vIGl0IGlzIHRydWUgdGhhdCB0aGlzIGlzIGFuIGludmFsaWQgbm9kZS5cblx0XHRcdGlmKHRoaXMuY2IpeyB0aGlzLmNiLmNhbGwodGhpcy5hcywgdiwgaywgdGhpcy5uLCB0aGlzLnMpIH0gLy8gb3B0aW9uYWxseSBjYWxsYmFjayBlYWNoIGtleS92YWx1ZS5cblx0XHR9XG5cdH0oKSk7XG5cdDsoZnVuY3Rpb24oKXtcblx0XHROb2RlLmlmeSA9IGZ1bmN0aW9uKG9iaiwgbywgYXMpeyBERVAoJ25vZGUuaWZ5Jyk7IC8vIHJldHVybnMgYSBub2RlIGZyb20gYSBzaGFsbG93IG9iamVjdC5cblx0XHRcdGlmKCFvKXsgbyA9IHt9IH1cblx0XHRcdGVsc2UgaWYodHlwZW9mIG8gPT09ICdzdHJpbmcnKXsgbyA9IHtzb3VsOiBvfSB9XG5cdFx0XHRlbHNlIGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIG8peyBvID0ge21hcDogb30gfVxuXHRcdFx0aWYoby5tYXApeyBvLm5vZGUgPSBvLm1hcC5jYWxsKGFzLCBvYmosIHUsIG8ubm9kZSB8fCB7fSkgfVxuXHRcdFx0aWYoby5ub2RlID0gTm9kZS5zb3VsLmlmeShvLm5vZGUgfHwge30sIG8pKXtcblx0XHRcdFx0b2JqX21hcChvYmosIG1hcCwge286byxhczphc30pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG8ubm9kZTsgLy8gVGhpcyB3aWxsIG9ubHkgYmUgYSB2YWxpZCBub2RlIGlmIHRoZSBvYmplY3Qgd2Fzbid0IGFscmVhZHkgZGVlcCFcblx0XHR9XG5cdFx0ZnVuY3Rpb24gbWFwKHYsIGspeyB2YXIgbyA9IHRoaXMubywgdG1wLCB1OyAvLyBpdGVyYXRlIG92ZXIgZWFjaCBrZXkvdmFsdWUuXG5cdFx0XHRpZihvLm1hcCl7XG5cdFx0XHRcdHRtcCA9IG8ubWFwLmNhbGwodGhpcy5hcywgdiwgJycraywgby5ub2RlKTtcblx0XHRcdFx0aWYodSA9PT0gdG1wKXtcblx0XHRcdFx0XHRvYmpfZGVsKG8ubm9kZSwgayk7XG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRpZihvLm5vZGUpeyBvLm5vZGVba10gPSB0bXAgfVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZihWYWwuaXModikpe1xuXHRcdFx0XHRvLm5vZGVba10gPSB2O1xuXHRcdFx0fVxuXHRcdH1cblx0fSgpKTtcblx0dmFyIG9iaiA9IFR5cGUub2JqLCBvYmpfaXMgPSBvYmouaXMsIG9ial9kZWwgPSBvYmouZGVsLCBvYmpfbWFwID0gb2JqLm1hcDtcblx0dmFyIHRleHQgPSBUeXBlLnRleHQsIHRleHRfcmFuZG9tID0gdGV4dC5yYW5kb207XG5cdHZhciBzb3VsXyA9IE5vZGUuc291bC5fO1xuXHR2YXIgdTtcblx0VHlwZS5ub2RlID0gVHlwZS5ub2RlIHx8IE5vZGU7XG5cblx0dmFyIFN0YXRlID0gVHlwZS5zdGF0ZTtcblx0U3RhdGUubGV4ID0gZnVuY3Rpb24oKXsgREVQKCdzdGF0ZS5sZXgnKTsgcmV0dXJuIFN0YXRlKCkudG9TdHJpbmcoMzYpLnJlcGxhY2UoJy4nLCcnKSB9XG5cdFN0YXRlLnRvID0gZnVuY3Rpb24oZnJvbSwgaywgdG8peyBERVAoJ3N0YXRlLnRvJyk7IFxuXHRcdHZhciB2YWwgPSAoZnJvbXx8e30pW2tdO1xuXHRcdGlmKG9ial9pcyh2YWwpKXtcblx0XHRcdHZhbCA9IG9ial9jb3B5KHZhbCk7XG5cdFx0fVxuXHRcdHJldHVybiBTdGF0ZS5pZnkodG8sIGssIFN0YXRlLmlzKGZyb20sIGspLCB2YWwsIE5vZGUuc291bChmcm9tKSk7XG5cdH1cblx0OyhmdW5jdGlvbigpe1xuXHRcdFN0YXRlLm1hcCA9IGZ1bmN0aW9uKGNiLCBzLCBhcyl7IERFUCgnc3RhdGUubWFwJyk7IHZhciB1OyAvLyBmb3IgdXNlIHdpdGggTm9kZS5pZnlcblx0XHRcdHZhciBvID0gb2JqX2lzKG8gPSBjYiB8fCBzKT8gbyA6IG51bGw7XG5cdFx0XHRjYiA9IGZuX2lzKGNiID0gY2IgfHwgcyk/IGNiIDogbnVsbDtcblx0XHRcdGlmKG8gJiYgIWNiKXtcblx0XHRcdFx0cyA9IG51bV9pcyhzKT8gcyA6IFN0YXRlKCk7XG5cdFx0XHRcdG9bTl9dID0gb1tOX10gfHwge307XG5cdFx0XHRcdG9ial9tYXAobywgbWFwLCB7bzpvLHM6c30pO1xuXHRcdFx0XHRyZXR1cm4gbztcblx0XHRcdH1cblx0XHRcdGFzID0gYXMgfHwgb2JqX2lzKHMpPyBzIDogdTtcblx0XHRcdHMgPSBudW1faXMocyk/IHMgOiBTdGF0ZSgpO1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHYsIGssIG8sIG9wdCl7XG5cdFx0XHRcdGlmKCFjYil7XG5cdFx0XHRcdFx0bWFwLmNhbGwoe286IG8sIHM6IHN9LCB2LGspO1xuXHRcdFx0XHRcdHJldHVybiB2O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNiLmNhbGwoYXMgfHwgdGhpcyB8fCB7fSwgdiwgaywgbywgb3B0KTtcblx0XHRcdFx0aWYob2JqX2hhcyhvLGspICYmIHUgPT09IG9ba10peyByZXR1cm4gfVxuXHRcdFx0XHRtYXAuY2FsbCh7bzogbywgczogc30sIHYsayk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIG1hcCh2LGspe1xuXHRcdFx0aWYoTl8gPT09IGspeyByZXR1cm4gfVxuXHRcdFx0U3RhdGUuaWZ5KHRoaXMubywgaywgdGhpcy5zKSA7XG5cdFx0fVxuXHR9KCkpO1xuXHR2YXIgb2JqID0gVHlwZS5vYmosIG9ial9hcyA9IG9iai5hcywgb2JqX2hhcyA9IG9iai5oYXMsIG9ial9pcyA9IG9iai5pcywgb2JqX21hcCA9IG9iai5tYXAsIG9ial9jb3B5ID0gb2JqLmNvcHk7XG5cdHZhciBudW0gPSBUeXBlLm51bSwgbnVtX2lzID0gbnVtLmlzO1xuXHR2YXIgZm4gPSBUeXBlLmZuLCBmbl9pcyA9IGZuLmlzO1xuXHR2YXIgTl8gPSBOb2RlLl8sIHU7XG5cblx0dmFyIEdyYXBoID0ge307XG5cdDsoZnVuY3Rpb24oKXtcblx0XHRHcmFwaC5pcyA9IGZ1bmN0aW9uKGcsIGNiLCBmbiwgYXMpeyBERVAoJ2dyYXBoLmlzJyk7IC8vIGNoZWNrcyB0byBzZWUgaWYgYW4gb2JqZWN0IGlzIGEgdmFsaWQgZ3JhcGguXG5cdFx0XHRpZighZyB8fCAhb2JqX2lzKGcpIHx8IG9ial9lbXB0eShnKSl7IHJldHVybiBmYWxzZSB9IC8vIG11c3QgYmUgYW4gb2JqZWN0LlxuXHRcdFx0cmV0dXJuICFvYmpfbWFwKGcsIG1hcCwge2NiOmNiLGZuOmZuLGFzOmFzfSk7IC8vIG1ha2VzIHN1cmUgaXQgd2Fzbid0IGFuIGVtcHR5IG9iamVjdC5cblx0XHR9XG5cdFx0ZnVuY3Rpb24gbWFwKG4sIHMpeyAvLyB3ZSBpbnZlcnQgdGhpcyBiZWNhdXNlIHRoZSB3YXknPyB3ZSBjaGVjayBmb3IgdGhpcyBpcyB2aWEgYSBuZWdhdGlvbi5cblx0XHRcdGlmKCFuIHx8IHMgIT09IE5vZGUuc291bChuKSB8fCAhTm9kZS5pcyhuLCB0aGlzLmZuLCB0aGlzLmFzKSl7IHJldHVybiB0cnVlIH0gLy8gaXQgaXMgdHJ1ZSB0aGF0IHRoaXMgaXMgYW4gaW52YWxpZCBncmFwaC5cblx0XHRcdGlmKCF0aGlzLmNiKXsgcmV0dXJuIH1cblx0XHRcdG5mLm4gPSBuOyBuZi5hcyA9IHRoaXMuYXM7IC8vIHNlcXVlbnRpYWwgcmFjZSBjb25kaXRpb25zIGFyZW4ndCByYWNlcy5cblx0XHRcdHRoaXMuY2IuY2FsbChuZi5hcywgbiwgcywgbmYpO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBuZihmbil7IC8vIG9wdGlvbmFsIGNhbGxiYWNrIGZvciBlYWNoIG5vZGUuXG5cdFx0XHRpZihmbil7IE5vZGUuaXMobmYubiwgZm4sIG5mLmFzKSB9IC8vIHdoZXJlIHdlIHRoZW4gaGF2ZSBhbiBvcHRpb25hbCBjYWxsYmFjayBmb3IgZWFjaCBrZXkvdmFsdWUuXG5cdFx0fVxuXHR9KCkpO1xuXHQ7KGZ1bmN0aW9uKCl7XG5cdFx0R3JhcGguaWZ5ID0gZnVuY3Rpb24ob2JqLCBlbnYsIGFzKXsgREVQKCdncmFwaC5pZnknKTsgXG5cdFx0XHR2YXIgYXQgPSB7cGF0aDogW10sIG9iajogb2JqfTtcblx0XHRcdGlmKCFlbnYpe1xuXHRcdFx0XHRlbnYgPSB7fTtcblx0XHRcdH0gZWxzZVxuXHRcdFx0aWYodHlwZW9mIGVudiA9PT0gJ3N0cmluZycpe1xuXHRcdFx0XHRlbnYgPSB7c291bDogZW52fTtcblx0XHRcdH0gZWxzZVxuXHRcdFx0aWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZW52KXtcblx0XHRcdFx0ZW52Lm1hcCA9IGVudjtcblx0XHRcdH1cblx0XHRcdGlmKHR5cGVvZiBhcyA9PT0gJ3N0cmluZycpe1xuXHRcdFx0XHRlbnYuc291bCA9IGVudi5zb3VsIHx8IGFzO1xuXHRcdFx0XHRhcyA9IHU7XG5cdFx0XHR9XG5cdFx0XHRpZihlbnYuc291bCl7XG5cdFx0XHRcdGF0LmxpbmsgPSBWYWwubGluay5pZnkoZW52LnNvdWwpO1xuXHRcdFx0fVxuXHRcdFx0ZW52LnNoZWxsID0gKGFzfHx7fSkuc2hlbGw7XG5cdFx0XHRlbnYuZ3JhcGggPSBlbnYuZ3JhcGggfHwge307XG5cdFx0XHRlbnYuc2VlbiA9IGVudi5zZWVuIHx8IFtdO1xuXHRcdFx0ZW52LmFzID0gZW52LmFzIHx8IGFzO1xuXHRcdFx0bm9kZShlbnYsIGF0KTtcblx0XHRcdGVudi5yb290ID0gYXQubm9kZTtcblx0XHRcdHJldHVybiBlbnYuZ3JhcGg7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIG5vZGUoZW52LCBhdCl7IHZhciB0bXA7XG5cdFx0XHRpZih0bXAgPSBzZWVuKGVudiwgYXQpKXsgcmV0dXJuIHRtcCB9XG5cdFx0XHRhdC5lbnYgPSBlbnY7XG5cdFx0XHRhdC5zb3VsID0gc291bDtcblx0XHRcdGlmKE5vZGUuaWZ5KGF0Lm9iaiwgbWFwLCBhdCkpe1xuXHRcdFx0XHRhdC5saW5rID0gYXQubGluayB8fCBWYWwubGluay5pZnkoTm9kZS5zb3VsKGF0Lm5vZGUpKTtcblx0XHRcdFx0aWYoYXQub2JqICE9PSBlbnYuc2hlbGwpe1xuXHRcdFx0XHRcdGVudi5ncmFwaFtWYWwubGluay5pcyhhdC5saW5rKV0gPSBhdC5ub2RlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYXQ7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIG1hcCh2LGssbil7XG5cdFx0XHR2YXIgYXQgPSB0aGlzLCBlbnYgPSBhdC5lbnYsIGlzLCB0bXA7XG5cdFx0XHRpZihOb2RlLl8gPT09IGsgJiYgb2JqX2hhcyh2LFZhbC5saW5rLl8pKXtcblx0XHRcdFx0cmV0dXJuIG4uXzsgLy8gVE9ETzogQnVnP1xuXHRcdFx0fVxuXHRcdFx0aWYoIShpcyA9IHZhbGlkKHYsayxuLCBhdCxlbnYpKSl7IHJldHVybiB9XG5cdFx0XHRpZighayl7XG5cdFx0XHRcdGF0Lm5vZGUgPSBhdC5ub2RlIHx8IG4gfHwge307XG5cdFx0XHRcdGlmKG9ial9oYXModiwgTm9kZS5fKSAmJiBOb2RlLnNvdWwodikpeyAvLyA/IGZvciBzYWZldHkgP1xuXHRcdFx0XHRcdGF0Lm5vZGUuXyA9IG9ial9jb3B5KHYuXyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YXQubm9kZSA9IE5vZGUuc291bC5pZnkoYXQubm9kZSwgVmFsLmxpbmsuaXMoYXQubGluaykpO1xuXHRcdFx0XHRhdC5saW5rID0gYXQubGluayB8fCBWYWwubGluay5pZnkoTm9kZS5zb3VsKGF0Lm5vZGUpKTtcblx0XHRcdH1cblx0XHRcdGlmKHRtcCA9IGVudi5tYXApe1xuXHRcdFx0XHR0bXAuY2FsbChlbnYuYXMgfHwge30sIHYsayxuLCBhdCk7XG5cdFx0XHRcdGlmKG9ial9oYXMobixrKSl7XG5cdFx0XHRcdFx0diA9IG5ba107XG5cdFx0XHRcdFx0aWYodSA9PT0gdil7XG5cdFx0XHRcdFx0XHRvYmpfZGVsKG4sIGspO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZighKGlzID0gdmFsaWQodixrLG4sIGF0LGVudikpKXsgcmV0dXJuIH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYoIWspeyByZXR1cm4gYXQubm9kZSB9XG5cdFx0XHRpZih0cnVlID09PSBpcyl7XG5cdFx0XHRcdHJldHVybiB2O1xuXHRcdFx0fVxuXHRcdFx0dG1wID0gbm9kZShlbnYsIHtvYmo6IHYsIHBhdGg6IGF0LnBhdGguY29uY2F0KGspfSk7XG5cdFx0XHRpZighdG1wLm5vZGUpeyByZXR1cm4gfVxuXHRcdFx0cmV0dXJuIHRtcC5saW5rOyAvL3snIyc6IE5vZGUuc291bCh0bXAubm9kZSl9O1xuXHRcdH1cblx0XHRmdW5jdGlvbiBzb3VsKGlkKXsgdmFyIGF0ID0gdGhpcztcblx0XHRcdHZhciBwcmV2ID0gVmFsLmxpbmsuaXMoYXQubGluayksIGdyYXBoID0gYXQuZW52LmdyYXBoO1xuXHRcdFx0YXQubGluayA9IGF0LmxpbmsgfHwgVmFsLmxpbmsuaWZ5KGlkKTtcblx0XHRcdGF0LmxpbmtbVmFsLmxpbmsuX10gPSBpZDtcblx0XHRcdGlmKGF0Lm5vZGUgJiYgYXQubm9kZVtOb2RlLl9dKXtcblx0XHRcdFx0YXQubm9kZVtOb2RlLl9dW1ZhbC5saW5rLl9dID0gaWQ7XG5cdFx0XHR9XG5cdFx0XHRpZihvYmpfaGFzKGdyYXBoLCBwcmV2KSl7XG5cdFx0XHRcdGdyYXBoW2lkXSA9IGdyYXBoW3ByZXZdO1xuXHRcdFx0XHRvYmpfZGVsKGdyYXBoLCBwcmV2KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZnVuY3Rpb24gdmFsaWQodixrLG4sIGF0LGVudil7IHZhciB0bXA7XG5cdFx0XHRpZihWYWwuaXModikpeyByZXR1cm4gdHJ1ZSB9XG5cdFx0XHRpZihvYmpfaXModikpeyByZXR1cm4gMSB9XG5cdFx0XHRpZih0bXAgPSBlbnYuaW52YWxpZCl7XG5cdFx0XHRcdHYgPSB0bXAuY2FsbChlbnYuYXMgfHwge30sIHYsayxuKTtcblx0XHRcdFx0cmV0dXJuIHZhbGlkKHYsayxuLCBhdCxlbnYpO1xuXHRcdFx0fVxuXHRcdFx0ZW52LmVyciA9IFwiSW52YWxpZCB2YWx1ZSBhdCAnXCIgKyBhdC5wYXRoLmNvbmNhdChrKS5qb2luKCcuJykgKyBcIichXCI7XG5cdFx0XHRpZihUeXBlLmxpc3QuaXModikpeyBlbnYuZXJyICs9IFwiIFVzZSBgLnNldChpdGVtKWAgaW5zdGVhZCBvZiBhbiBBcnJheS5cIiB9XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIHNlZW4oZW52LCBhdCl7XG5cdFx0XHR2YXIgYXJyID0gZW52LnNlZW4sIGkgPSBhcnIubGVuZ3RoLCBoYXM7XG5cdFx0XHR3aGlsZShpLS0peyBoYXMgPSBhcnJbaV07XG5cdFx0XHRcdGlmKGF0Lm9iaiA9PT0gaGFzLm9iail7IHJldHVybiBoYXMgfVxuXHRcdFx0fVxuXHRcdFx0YXJyLnB1c2goYXQpO1xuXHRcdH1cblx0fSgpKTtcblx0R3JhcGgubm9kZSA9IGZ1bmN0aW9uKG5vZGUpeyBERVAoJ2dyYXBoLm5vZGUnKTsgXG5cdFx0dmFyIHNvdWwgPSBOb2RlLnNvdWwobm9kZSk7XG5cdFx0aWYoIXNvdWwpeyByZXR1cm4gfVxuXHRcdHJldHVybiBvYmpfcHV0KHt9LCBzb3VsLCBub2RlKTtcblx0fVxuXHQ7KGZ1bmN0aW9uKCl7XG5cdFx0R3JhcGgudG8gPSBmdW5jdGlvbihncmFwaCwgcm9vdCwgb3B0KXsgREVQKCdncmFwaC50bycpOyBcblx0XHRcdGlmKCFncmFwaCl7IHJldHVybiB9XG5cdFx0XHR2YXIgb2JqID0ge307XG5cdFx0XHRvcHQgPSBvcHQgfHwge3NlZW46IHt9fTtcblx0XHRcdG9ial9tYXAoZ3JhcGhbcm9vdF0sIG1hcCwge29iajpvYmosIGdyYXBoOiBncmFwaCwgb3B0OiBvcHR9KTtcblx0XHRcdHJldHVybiBvYmo7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIG1hcCh2LGspeyB2YXIgdG1wLCBvYmo7XG5cdFx0XHRpZihOb2RlLl8gPT09IGspe1xuXHRcdFx0XHRpZihvYmpfZW1wdHkodiwgVmFsLmxpbmsuXykpe1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLm9ialtrXSA9IG9ial9jb3B5KHYpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZighKHRtcCA9IFZhbC5saW5rLmlzKHYpKSl7XG5cdFx0XHRcdHRoaXMub2JqW2tdID0gdjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYob2JqID0gdGhpcy5vcHQuc2Vlblt0bXBdKXtcblx0XHRcdFx0dGhpcy5vYmpba10gPSBvYmo7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRoaXMub2JqW2tdID0gdGhpcy5vcHQuc2Vlblt0bXBdID0gR3JhcGgudG8odGhpcy5ncmFwaCwgdG1wLCB0aGlzLm9wdCk7XG5cdFx0fVxuXHR9KCkpO1xuXHR2YXIgZm5faXMgPSBUeXBlLmZuLmlzO1xuXHR2YXIgb2JqID0gVHlwZS5vYmosIG9ial9pcyA9IG9iai5pcywgb2JqX2RlbCA9IG9iai5kZWwsIG9ial9oYXMgPSBvYmouaGFzLCBvYmpfZW1wdHkgPSBvYmouZW1wdHksIG9ial9wdXQgPSBvYmoucHV0LCBvYmpfbWFwID0gb2JqLm1hcCwgb2JqX2NvcHkgPSBvYmouY29weTtcblx0dmFyIHU7XG5cdFR5cGUuZ3JhcGggPSBUeXBlLmdyYXBoIHx8IEdyYXBoO1xufSgpKTsiLCJcbi8vIHJlcXVlc3QgLyByZXNwb25zZSBtb2R1bGUsIGZvciBhc2tpbmcgYW5kIGFja2luZyBtZXNzYWdlcy5cbnJlcXVpcmUoJy4vb250bycpOyAvLyBkZXBlbmRzIHVwb24gb250byFcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXNrKGNiLCBhcyl7XG5cdGlmKCF0aGlzLm9uKXsgcmV0dXJuIH1cblx0dmFyIGxhY2sgPSAodGhpcy5vcHR8fHt9KS5sYWNrIHx8IDkwMDA7XG5cdGlmKCEoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2IpKXtcblx0XHRpZighY2IpeyByZXR1cm4gfVxuXHRcdHZhciBpZCA9IGNiWycjJ10gfHwgY2IsIHRtcCA9ICh0aGlzLnRhZ3x8JycpW2lkXTtcblx0XHRpZighdG1wKXsgcmV0dXJuIH1cblx0XHRpZihhcyl7XG5cdFx0XHR0bXAgPSB0aGlzLm9uKGlkLCBhcyk7XG5cdFx0XHRjbGVhclRpbWVvdXQodG1wLmVycik7XG5cdFx0XHR0bXAuZXJyID0gc2V0VGltZW91dChmdW5jdGlvbigpeyB0bXAub2ZmKCkgfSwgbGFjayk7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHZhciBpZCA9IChhcyAmJiBhc1snIyddKSB8fCByYW5kb20oOSk7XG5cdGlmKCFjYil7IHJldHVybiBpZCB9XG5cdHZhciB0byA9IHRoaXMub24oaWQsIGNiLCBhcyk7XG5cdHRvLmVyciA9IHRvLmVyciB8fCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHRvLm9mZigpO1xuXHRcdHRvLm5leHQoe2VycjogXCJFcnJvcjogTm8gQUNLIHlldC5cIiwgbGFjazogdHJ1ZX0pO1xuXHR9LCBsYWNrKTtcblx0cmV0dXJuIGlkO1xufVxudmFyIHJhbmRvbSA9IFN0cmluZy5yYW5kb20gfHwgZnVuY3Rpb24oKXsgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpIH1cblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9yb290Jyk7XG5HdW4uY2hhaW4uYmFjayA9IGZ1bmN0aW9uKG4sIG9wdCl7IHZhciB0bXA7XG5cdG4gPSBuIHx8IDE7XG5cdGlmKC0xID09PSBuIHx8IEluZmluaXR5ID09PSBuKXtcblx0XHRyZXR1cm4gdGhpcy5fLnJvb3QuJDtcblx0fSBlbHNlXG5cdGlmKDEgPT09IG4pe1xuXHRcdHJldHVybiAodGhpcy5fLmJhY2sgfHwgdGhpcy5fKS4kO1xuXHR9XG5cdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fO1xuXHRpZih0eXBlb2YgbiA9PT0gJ3N0cmluZycpe1xuXHRcdG4gPSBuLnNwbGl0KCcuJyk7XG5cdH1cblx0aWYobiBpbnN0YW5jZW9mIEFycmF5KXtcblx0XHR2YXIgaSA9IDAsIGwgPSBuLmxlbmd0aCwgdG1wID0gYXQ7XG5cdFx0Zm9yKGk7IGkgPCBsOyBpKyspe1xuXHRcdFx0dG1wID0gKHRtcHx8ZW1wdHkpW25baV1dO1xuXHRcdH1cblx0XHRpZih1ICE9PSB0bXApe1xuXHRcdFx0cmV0dXJuIG9wdD8gZ3VuIDogdG1wO1xuXHRcdH0gZWxzZVxuXHRcdGlmKCh0bXAgPSBhdC5iYWNrKSl7XG5cdFx0XHRyZXR1cm4gdG1wLiQuYmFjayhuLCBvcHQpO1xuXHRcdH1cblx0XHRyZXR1cm47XG5cdH1cblx0aWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygbil7XG5cdFx0dmFyIHllcywgdG1wID0ge2JhY2s6IGF0fTtcblx0XHR3aGlsZSgodG1wID0gdG1wLmJhY2spXG5cdFx0JiYgdSA9PT0gKHllcyA9IG4odG1wLCBvcHQpKSl7fVxuXHRcdHJldHVybiB5ZXM7XG5cdH1cblx0aWYoJ251bWJlcicgPT0gdHlwZW9mIG4pe1xuXHRcdHJldHVybiAoYXQuYmFjayB8fCBhdCkuJC5iYWNrKG4gLSAxKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cbnZhciBlbXB0eSA9IHt9LCB1O1xuXHQiLCJcbi8vIFdBUk5JTkc6IEdVTiBpcyB2ZXJ5IHNpbXBsZSwgYnV0IHRoZSBKYXZhU2NyaXB0IGNoYWluaW5nIEFQSSBhcm91bmQgR1VOXG4vLyBpcyBjb21wbGljYXRlZCBhbmQgd2FzIGV4dHJlbWVseSBoYXJkIHRvIGJ1aWxkLiBJZiB5b3UgcG9ydCBHVU4gdG8gYW5vdGhlclxuLy8gbGFuZ3VhZ2UsIGNvbnNpZGVyIGltcGxlbWVudGluZyBhbiBlYXNpZXIgQVBJIHRvIGJ1aWxkLlxudmFyIEd1biA9IHJlcXVpcmUoJy4vcm9vdCcpO1xuR3VuLmNoYWluLmNoYWluID0gZnVuY3Rpb24oc3ViKXtcblx0dmFyIGd1biA9IHRoaXMsIGF0ID0gZ3VuLl8sIGNoYWluID0gbmV3IChzdWIgfHwgZ3VuKS5jb25zdHJ1Y3RvcihndW4pLCBjYXQgPSBjaGFpbi5fLCByb290O1xuXHRjYXQucm9vdCA9IHJvb3QgPSBhdC5yb290O1xuXHRjYXQuaWQgPSArK3Jvb3Qub25jZTtcblx0Y2F0LmJhY2sgPSBndW4uXztcblx0Y2F0Lm9uID0gR3VuLm9uO1xuXHRjYXQub24oJ2luJywgR3VuLm9uLmluLCBjYXQpOyAvLyBGb3IgJ2luJyBpZiBJIGFkZCBteSBvd24gbGlzdGVuZXJzIHRvIGVhY2ggdGhlbiBJIE1VU1QgZG8gaXQgYmVmb3JlIGluIGdldHMgY2FsbGVkLiBJZiBJIGxpc3RlbiBnbG9iYWxseSBmb3IgYWxsIGluY29taW5nIGRhdGEgaW5zdGVhZCB0aG91Z2gsIHJlZ2FyZGxlc3Mgb2YgaW5kaXZpZHVhbCBsaXN0ZW5lcnMsIEkgY2FuIHRyYW5zZm9ybSB0aGUgZGF0YSB0aGVyZSBhbmQgdGhlbiBhcyB3ZWxsLlxuXHRjYXQub24oJ291dCcsIEd1bi5vbi5vdXQsIGNhdCk7IC8vIEhvd2V2ZXIgZm9yIG91dHB1dCwgdGhlcmUgaXNuJ3QgcmVhbGx5IHRoZSBnbG9iYWwgb3B0aW9uLiBJIG11c3QgbGlzdGVuIGJ5IGFkZGluZyBteSBvd24gbGlzdGVuZXIgaW5kaXZpZHVhbGx5IEJFRk9SRSB0aGlzIG9uZSBpcyBldmVyIGNhbGxlZC5cblx0cmV0dXJuIGNoYWluO1xufVxuXG5mdW5jdGlvbiBvdXRwdXQobXNnKXtcblx0dmFyIHB1dCwgZ2V0LCBhdCA9IHRoaXMuYXMsIGJhY2sgPSBhdC5iYWNrLCByb290ID0gYXQucm9vdCwgdG1wO1xuXHRpZighbXNnLiQpeyBtc2cuJCA9IGF0LiQgfVxuXHR0aGlzLnRvLm5leHQobXNnKTtcblx0aWYoYXQuZXJyKXsgYXQub24oJ2luJywge3B1dDogYXQucHV0ID0gdSwgJDogYXQuJH0pOyByZXR1cm4gfVxuXHRpZihnZXQgPSBtc2cuZ2V0KXtcblx0XHQvKmlmKHUgIT09IGF0LnB1dCl7XG5cdFx0XHRhdC5vbignaW4nLCBhdCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fSovXG5cdFx0aWYocm9vdC5wYXNzKXsgcm9vdC5wYXNzW2F0LmlkXSA9IGF0OyB9IC8vIHdpbGwgdGhpcyBtYWtlIGZvciBidWdneSBiZWhhdmlvciBlbHNld2hlcmU/XG5cdFx0aWYoYXQubGV4KXsgT2JqZWN0LmtleXMoYXQubGV4KS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBhdC5sZXhba10gfSwgdG1wID0gbXNnLmdldCA9IG1zZy5nZXQgfHwge30pIH1cblx0XHRpZihnZXRbJyMnXSB8fCBhdC5zb3VsKXtcblx0XHRcdGdldFsnIyddID0gZ2V0WycjJ10gfHwgYXQuc291bDtcblx0XHRcdG1zZ1snIyddIHx8IChtc2dbJyMnXSA9IHRleHRfcmFuZCg5KSk7IC8vIEEzMTIwID9cblx0XHRcdGJhY2sgPSAocm9vdC4kLmdldChnZXRbJyMnXSkuXyk7XG5cdFx0XHRpZighKGdldCA9IGdldFsnLiddKSl7IC8vIHNvdWxcblx0XHRcdFx0dG1wID0gYmFjay5hc2sgJiYgYmFjay5hc2tbJyddOyAvLyBjaGVjayBpZiB3ZSBoYXZlIGFscmVhZHkgYXNrZWQgZm9yIHRoZSBmdWxsIG5vZGVcblx0XHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbJyddID0gYmFjazsgLy8gYWRkIGEgZmxhZyB0aGF0IHdlIGFyZSBub3cuXG5cdFx0XHRcdGlmKHUgIT09IGJhY2sucHV0KXsgLy8gaWYgd2UgYWxyZWFkeSBoYXZlIGRhdGEsXG5cdFx0XHRcdFx0YmFjay5vbignaW4nLCBiYWNrKTsgLy8gc2VuZCB3aGF0IGlzIGNhY2hlZCBkb3duIHRoZSBjaGFpblxuXHRcdFx0XHRcdGlmKHRtcCl7IHJldHVybiB9IC8vIGFuZCBkb24ndCBhc2sgZm9yIGl0IGFnYWluLlxuXHRcdFx0XHR9XG5cdFx0XHRcdG1zZy4kID0gYmFjay4kO1xuXHRcdFx0fSBlbHNlXG5cdFx0XHRpZihvYmpfaGFzKGJhY2sucHV0LCBnZXQpKXsgLy8gVE9ETzogc3VwcG9ydCAjTEVYICFcblx0XHRcdFx0dG1wID0gYmFjay5hc2sgJiYgYmFjay5hc2tbZ2V0XTtcblx0XHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbZ2V0XSA9IGJhY2suJC5nZXQoZ2V0KS5fO1xuXHRcdFx0XHRiYWNrLm9uKCdpbicsIHtnZXQ6IGdldCwgcHV0OiB7JyMnOiBiYWNrLnNvdWwsICcuJzogZ2V0LCAnOic6IGJhY2sucHV0W2dldF0sICc+Jzogc3RhdGVfaXMocm9vdC5ncmFwaFtiYWNrLnNvdWxdLCBnZXQpfX0pO1xuXHRcdFx0XHRpZih0bXApeyByZXR1cm4gfVxuXHRcdFx0fVxuXHRcdFx0XHQvKnB1dCA9IChiYWNrLiQuZ2V0KGdldCkuXyk7XG5cdFx0XHRcdGlmKCEodG1wID0gcHV0LmFjaykpeyBwdXQuYWNrID0gLTEgfVxuXHRcdFx0XHRiYWNrLm9uKCdpbicsIHtcblx0XHRcdFx0XHQkOiBiYWNrLiQsXG5cdFx0XHRcdFx0cHV0OiBHdW4uc3RhdGUuaWZ5KHt9LCBnZXQsIEd1bi5zdGF0ZShiYWNrLnB1dCwgZ2V0KSwgYmFjay5wdXRbZ2V0XSksXG5cdFx0XHRcdFx0Z2V0OiBiYWNrLmdldFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYodG1wKXsgcmV0dXJuIH1cblx0XHRcdH0gZWxzZVxuXHRcdFx0aWYoJ3N0cmluZycgIT0gdHlwZW9mIGdldCl7XG5cdFx0XHRcdHZhciBwdXQgPSB7fSwgbWV0YSA9IChiYWNrLnB1dHx8e30pLl87XG5cdFx0XHRcdEd1bi5vYmoubWFwKGJhY2sucHV0LCBmdW5jdGlvbih2LGspe1xuXHRcdFx0XHRcdGlmKCFHdW4udGV4dC5tYXRjaChrLCBnZXQpKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRwdXRba10gPSB2O1xuXHRcdFx0XHR9KVxuXHRcdFx0XHRpZighR3VuLm9iai5lbXB0eShwdXQpKXtcblx0XHRcdFx0XHRwdXQuXyA9IG1ldGE7XG5cdFx0XHRcdFx0YmFjay5vbignaW4nLCB7JDogYmFjay4kLCBwdXQ6IHB1dCwgZ2V0OiBiYWNrLmdldH0pXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYodG1wID0gYXQubGV4KXtcblx0XHRcdFx0XHR0bXAgPSAodG1wLl8pIHx8ICh0bXAuXyA9IGZ1bmN0aW9uKCl7fSk7XG5cdFx0XHRcdFx0aWYoYmFjay5hY2sgPCB0bXAuYXNrKXsgdG1wLmFzayA9IGJhY2suYWNrIH1cblx0XHRcdFx0XHRpZih0bXAuYXNrKXsgcmV0dXJuIH1cblx0XHRcdFx0XHR0bXAuYXNrID0gMTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ki9cblx0XHRcdHJvb3QuYXNrKGFjaywgbXNnKTsgLy8gQTMxMjAgP1xuXHRcdFx0cmV0dXJuIHJvb3Qub24oJ2luJywgbXNnKTtcblx0XHR9XG5cdFx0Ly9pZihyb290Lm5vdyl7IHJvb3Qubm93W2F0LmlkXSA9IHJvb3Qubm93W2F0LmlkXSB8fCB0cnVlOyBhdC5wYXNzID0ge30gfVxuXHRcdGlmKGdldFsnLiddKXtcblx0XHRcdGlmKGF0LmdldCl7XG5cdFx0XHRcdG1zZyA9IHtnZXQ6IHsnLic6IGF0LmdldH0sICQ6IGF0LiR9O1xuXHRcdFx0XHQoYmFjay5hc2sgfHwgKGJhY2suYXNrID0ge30pKVthdC5nZXRdID0gbXNnLiQuXzsgLy8gVE9ETzogUEVSRk9STUFOQ0U/IE1vcmUgZWxlZ2FudCB3YXk/XG5cdFx0XHRcdHJldHVybiBiYWNrLm9uKCdvdXQnLCBtc2cpO1xuXHRcdFx0fVxuXHRcdFx0bXNnID0ge2dldDogYXQubGV4PyBtc2cuZ2V0IDoge30sICQ6IGF0LiR9O1xuXHRcdFx0cmV0dXJuIGJhY2sub24oJ291dCcsIG1zZyk7XG5cdFx0fVxuXHRcdChhdC5hc2sgfHwgKGF0LmFzayA9IHt9KSlbJyddID0gYXQ7XHQgLy9hdC5hY2sgPSBhdC5hY2sgfHwgLTE7XG5cdFx0aWYoYXQuZ2V0KXtcblx0XHRcdGdldFsnLiddID0gYXQuZ2V0O1xuXHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbYXQuZ2V0XSA9IG1zZy4kLl87IC8vIFRPRE86IFBFUkZPUk1BTkNFPyBNb3JlIGVsZWdhbnQgd2F5P1xuXHRcdFx0cmV0dXJuIGJhY2sub24oJ291dCcsIG1zZyk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBiYWNrLm9uKCdvdXQnLCBtc2cpO1xufTsgR3VuLm9uLm91dCA9IG91dHB1dDtcblxuZnVuY3Rpb24gaW5wdXQobXNnLCBjYXQpeyBjYXQgPSBjYXQgfHwgdGhpcy5hczsgLy8gVE9ETzogVjggbWF5IG5vdCBiZSBhYmxlIHRvIG9wdGltaXplIGZ1bmN0aW9ucyB3aXRoIGRpZmZlcmVudCBwYXJhbWV0ZXIgY2FsbHMsIHNvIHRyeSB0byBkbyBiZW5jaG1hcmsgdG8gc2VlIGlmIHRoZXJlIGlzIGFueSBhY3R1YWwgZGlmZmVyZW5jZS5cblx0dmFyIHJvb3QgPSBjYXQucm9vdCwgZ3VuID0gbXNnLiQgfHwgKG1zZy4kID0gY2F0LiQpLCBhdCA9IChndW58fCcnKS5fIHx8IGVtcHR5LCB0bXAgPSBtc2cucHV0fHwnJywgc291bCA9IHRtcFsnIyddLCBrZXkgPSB0bXBbJy4nXSwgY2hhbmdlID0gKHUgIT09IHRtcFsnPSddKT8gdG1wWyc9J10gOiB0bXBbJzonXSwgc3RhdGUgPSB0bXBbJz4nXSB8fCAtSW5maW5pdHksIHNhdDsgLy8gZXZlID0gZXZlbnQsIGF0ID0gZGF0YSBhdCwgY2F0ID0gY2hhaW4gYXQsIHNhdCA9IHN1YiBhdCAoY2hpbGRyZW4gY2hhaW5zKS5cblx0aWYodSAhPT0gbXNnLnB1dCAmJiAodSA9PT0gdG1wWycjJ10gfHwgdSA9PT0gdG1wWycuJ10gfHwgKHUgPT09IHRtcFsnOiddICYmIHUgPT09IHRtcFsnPSddKSB8fCB1ID09PSB0bXBbJz4nXSkpeyAvLyBjb252ZXJ0IGZyb20gb2xkIGZvcm1hdFxuXHRcdGlmKCF2YWxpZCh0bXApKXtcblx0XHRcdGlmKCEoc291bCA9ICgodG1wfHwnJykuX3x8JycpWycjJ10pKXsgY29uc29sZS5sb2coXCJjaGFpbiBub3QgeWV0IHN1cHBvcnRlZCBmb3JcIiwgdG1wLCAnLi4uJywgbXNnLCBjYXQpOyByZXR1cm47IH1cblx0XHRcdGd1biA9IGNhdC5yb290LiQuZ2V0KHNvdWwpO1xuXHRcdFx0cmV0dXJuIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyh0bXApLnNvcnQoKSwgZnVuY3Rpb24oayl7IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93IC8vIEJVRz8gP1NvbWUgcmUtaW4gbG9naWMgbWF5IGRlcGVuZCBvbiB0aGlzIGJlaW5nIHN5bmM/XG5cdFx0XHRcdGlmKCdfJyA9PSBrIHx8IHUgPT09IChzdGF0ZSA9IHN0YXRlX2lzKHRtcCwgaykpKXsgcmV0dXJuIH1cblx0XHRcdFx0Y2F0Lm9uKCdpbicsIHskOiBndW4sIHB1dDogeycjJzogc291bCwgJy4nOiBrLCAnPSc6IHRtcFtrXSwgJz4nOiBzdGF0ZX0sIFZJQTogbXNnfSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y2F0Lm9uKCdpbicsIHskOiBhdC5iYWNrLiQsIHB1dDogeycjJzogc291bCA9IGF0LmJhY2suc291bCwgJy4nOiBrZXkgPSBhdC5oYXMgfHwgYXQuZ2V0LCAnPSc6IHRtcCwgJz4nOiBzdGF0ZV9pcyhhdC5iYWNrLnB1dCwga2V5KX0sIHZpYTogbXNnfSk7IC8vIFRPRE86IFRoaXMgY291bGQgYmUgYnVnZ3khIEl0IGFzc3VtZXMvYXBwcm94ZXMgZGF0YSwgb3RoZXIgc3R1ZmYgY291bGQgaGF2ZSBjb3JydXB0ZWQgaXQuXG5cdFx0cmV0dXJuO1xuXHR9XG5cdGlmKChtc2cuc2Vlbnx8JycpW2NhdC5pZF0peyByZXR1cm4gfSAobXNnLnNlZW4gfHwgKG1zZy5zZWVuID0gZnVuY3Rpb24oKXt9KSlbY2F0LmlkXSA9IGNhdDsgLy8gaGVscCBzdG9wIHNvbWUgaW5maW5pdGUgbG9vcHNcblxuXHRpZihjYXQgIT09IGF0KXsgLy8gZG9uJ3Qgd29ycnkgYWJvdXQgdGhpcyB3aGVuIGZpcnN0IHVuZGVyc3RhbmRpbmcgdGhlIGNvZGUsIGl0IGhhbmRsZXMgY2hhbmdpbmcgY29udGV4dHMgb24gYSBtZXNzYWdlLiBBIHNvdWwgY2hhaW4gd2lsbCBuZXZlciBoYXZlIGEgZGlmZmVyZW50IGNvbnRleHQuXG5cdFx0T2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSwgdG1wID0ge30pOyAvLyBtYWtlIGNvcHkgb2YgbWVzc2FnZVxuXHRcdHRtcC5nZXQgPSBjYXQuZ2V0IHx8IHRtcC5nZXQ7XG5cdFx0aWYoIWNhdC5zb3VsICYmICFjYXQuaGFzKXsgLy8gaWYgd2UgZG8gbm90IHJlY29nbml6ZSB0aGUgY2hhaW4gdHlwZVxuXHRcdFx0dG1wLiQkJCA9IHRtcC4kJCQgfHwgY2F0LiQ7IC8vIG1ha2UgYSByZWZlcmVuY2UgdG8gd2hlcmV2ZXIgaXQgY2FtZSBmcm9tLlxuXHRcdH0gZWxzZVxuXHRcdGlmKGF0LnNvdWwpeyAvLyBhIGhhcyAocHJvcGVydHkpIGNoYWluIHdpbGwgaGF2ZSBhIGRpZmZlcmVudCBjb250ZXh0IHNvbWV0aW1lcyBpZiBpdCBpcyBsaW5rZWQgKHRvIGEgc291bCBjaGFpbikuIEFueXRoaW5nIHRoYXQgaXMgbm90IGEgc291bCBvciBoYXMgY2hhaW4sIHdpbGwgYWx3YXlzIGhhdmUgZGlmZmVyZW50IGNvbnRleHRzLlxuXHRcdFx0dG1wLiQgPSBjYXQuJDtcblx0XHRcdHRtcC4kJCA9IHRtcC4kJCB8fCBhdC4kO1xuXHRcdH1cblx0XHRtc2cgPSB0bXA7IC8vIHVzZSB0aGUgbWVzc2FnZSB3aXRoIHRoZSBuZXcgY29udGV4dCBpbnN0ZWFkO1xuXHR9XG5cdHVubGluayhtc2csIGNhdCk7XG5cblx0aWYoKChjYXQuc291bC8qICYmIChjYXQuYXNrfHwnJylbJyddKi8pIHx8IG1zZy4kJCkgJiYgc3RhdGUgPj0gc3RhdGVfaXMocm9vdC5ncmFwaFtzb3VsXSwga2V5KSl7IC8vIFRoZSByb290IGhhcyBhbiBpbi1tZW1vcnkgY2FjaGUgb2YgdGhlIGdyYXBoLCBidXQgaWYgb3VyIHBlZXIgaGFzIGFza2VkIGZvciB0aGUgZGF0YSB0aGVuIHdlIHdhbnQgYSBwZXIgZGVkdXBsaWNhdGVkIGNoYWluIGNvcHkgb2YgdGhlIGRhdGEgdGhhdCBtaWdodCBoYXZlIGxvY2FsIGVkaXRzIG9uIGl0LlxuXHRcdCh0bXAgPSByb290LiQuZ2V0KHNvdWwpLl8pLnB1dCA9IHN0YXRlX2lmeSh0bXAucHV0LCBrZXksIHN0YXRlLCBjaGFuZ2UsIHNvdWwpO1xuXHR9XG5cdGlmKCFhdC5zb3VsIC8qJiYgKGF0LmFza3x8JycpWycnXSovICYmIHN0YXRlID49IHN0YXRlX2lzKHJvb3QuZ3JhcGhbc291bF0sIGtleSkgJiYgKHNhdCA9IChyb290LiQuZ2V0KHNvdWwpLl8ubmV4dHx8JycpW2tleV0pKXsgLy8gU2FtZSBhcyBhYm92ZSBoZXJlLCBidXQgZm9yIG90aGVyIHR5cGVzIG9mIGNoYWlucy4gLy8gVE9ETzogSW1wcm92ZSBwZXJmIGJ5IHByZXZlbnRpbmcgZWNob2VzIHJlY2FjaGluZy5cblx0XHRzYXQucHV0ID0gY2hhbmdlOyAvLyB1cGRhdGUgY2FjaGVcblx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgKHRtcCA9IHZhbGlkKGNoYW5nZSkpKXtcblx0XHRcdHNhdC5wdXQgPSByb290LiQuZ2V0KHRtcCkuXy5wdXQgfHwgY2hhbmdlOyAvLyBzaGFyZSBzYW1lIGNhY2hlIGFzIHdoYXQgd2UncmUgbGlua2VkIHRvLlxuXHRcdH1cblx0fVxuXG5cdHRoaXMudG8gJiYgdGhpcy50by5uZXh0KG1zZyk7IC8vIDFzdCBBUEkgam9iIGlzIHRvIGNhbGwgYWxsIGNoYWluIGxpc3RlbmVycy5cblx0Ly8gVE9ETzogTWFrZSBpbnB1dCBtb3JlIHJldXNhYmxlIGJ5IG9ubHkgZG9pbmcgdGhlc2UgKHNvbWU/KSBjYWxscyBpZiB3ZSBhcmUgYSBjaGFpbiB3ZSByZWNvZ25pemU/IFRoaXMgbWVhbnMgZWFjaCBpbnB1dCBsaXN0ZW5lciB3b3VsZCBiZSByZXNwb25zaWJsZSBmb3Igd2hlbiBsaXN0ZW5lcnMgbmVlZCB0byBiZSBjYWxsZWQsIHdoaWNoIG1ha2VzIHNlbnNlLCBhcyB0aGV5IG1pZ2h0IHdhbnQgdG8gZmlsdGVyLlxuXHRjYXQuYW55ICYmIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhjYXQuYW55KSwgZnVuY3Rpb24oYW55KXsgKGFueSA9IGNhdC5hbnlbYW55XSkgJiYgYW55KG1zZykgfSwwLDk5KTsgLy8gMXN0IEFQSSBqb2IgaXMgdG8gY2FsbCBhbGwgY2hhaW4gbGlzdGVuZXJzLiAvLyBUT0RPOiAua2V5cyggaXMgc2xvdyAvLyBCVUc6IFNvbWUgcmUtaW4gbG9naWMgbWF5IGRlcGVuZCBvbiB0aGlzIGJlaW5nIHN5bmMuXG5cdGNhdC5lY2hvICYmIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhjYXQuZWNobyksIGZ1bmN0aW9uKGxhdCl7IChsYXQgPSBjYXQuZWNob1tsYXRdKSAmJiBsYXQub24oJ2luJywgbXNnKSB9LDAsOTkpOyAvLyAmIGxpbmtlZCBhdCBjaGFpbnMgLy8gVE9ETzogLmtleXMoIGlzIHNsb3cgLy8gQlVHOiBTb21lIHJlLWluIGxvZ2ljIG1heSBkZXBlbmQgb24gdGhpcyBiZWluZyBzeW5jLlxuXG5cdGlmKCgobXNnLiQkfHwnJykuX3x8YXQpLnNvdWwpeyAvLyBjb21tZW50cyBhcmUgbGluZWFyLCBidXQgdGhpcyBsaW5lIG9mIGNvZGUgaXMgbm9uLWxpbmVhciwgc28gaWYgSSB3ZXJlIHRvIGNvbW1lbnQgd2hhdCBpdCBkb2VzLCB5b3UnZCBoYXZlIHRvIHJlYWQgNDIgb3RoZXIgY29tbWVudHMgZmlyc3QuLi4gYnV0IHlvdSBjYW4ndCByZWFkIGFueSBvZiB0aG9zZSBjb21tZW50cyB1bnRpbCB5b3UgZmlyc3QgcmVhZCB0aGlzIGNvbW1lbnQuIFdoYXQhPyAvLyBzaG91bGRuJ3QgdGhpcyBtYXRjaCBsaW5rJ3MgY2hlY2s/XG5cdFx0Ly8gaXMgdGhlcmUgY2FzZXMgd2hlcmUgaXQgaXMgYSAkJCB0aGF0IHdlIGRvIE5PVCB3YW50IHRvIGRvIHRoZSBmb2xsb3dpbmc/IFxuXHRcdGlmKChzYXQgPSBjYXQubmV4dCkgJiYgKHNhdCA9IHNhdFtrZXldKSl7IC8vIFRPRE86IHBvc3NpYmxlIHRyaWNrPyBNYXliZSBoYXZlIGBpb25tYXBgIGNvZGUgc2V0IGEgc2F0PyAvLyBUT0RPOiBNYXliZSB3ZSBzaG91bGQgZG8gYGNhdC5hc2tgIGluc3RlYWQ/IEkgZ3Vlc3MgZG9lcyBub3QgbWF0dGVyLlxuXHRcdFx0dG1wID0ge307IE9iamVjdC5rZXlzKG1zZykuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnW2tdIH0pO1xuXHRcdFx0dG1wLiQgPSAobXNnLiQkfHxtc2cuJCkuZ2V0KHRtcC5nZXQgPSBrZXkpOyBkZWxldGUgdG1wLiQkOyBkZWxldGUgdG1wLiQkJDtcblx0XHRcdHNhdC5vbignaW4nLCB0bXApO1xuXHRcdH1cblx0fVxuXG5cdGxpbmsobXNnLCBjYXQpO1xufTsgR3VuLm9uLmluID0gaW5wdXQ7XG5cbmZ1bmN0aW9uIGxpbmsobXNnLCBjYXQpeyBjYXQgPSBjYXQgfHwgdGhpcy5hcyB8fCBtc2cuJC5fO1xuXHRpZihtc2cuJCQgJiYgdGhpcyAhPT0gR3VuLm9uKXsgcmV0dXJuIH0gLy8gJCQgbWVhbnMgd2UgY2FtZSBmcm9tIGEgbGluaywgc28gd2UgYXJlIGF0IHRoZSB3cm9uZyBsZXZlbCwgdGh1cyBpZ25vcmUgaXQgdW5sZXNzIG92ZXJydWxlZCBtYW51YWxseSBieSBiZWluZyBjYWxsZWQgZGlyZWN0bHkuXG5cdGlmKCFtc2cucHV0IHx8IGNhdC5zb3VsKXsgcmV0dXJuIH0gLy8gQnV0IHlvdSBjYW5ub3Qgb3ZlcnJ1bGUgYmVpbmcgbGlua2VkIHRvIG5vdGhpbmcsIG9yIHRyeWluZyB0byBsaW5rIGEgc291bCBjaGFpbiAtIHRoYXQgbXVzdCBuZXZlciBoYXBwZW4uXG5cdHZhciBwdXQgPSBtc2cucHV0fHwnJywgbGluayA9IHB1dFsnPSddfHxwdXRbJzonXSwgdG1wO1xuXHR2YXIgcm9vdCA9IGNhdC5yb290LCB0YXQgPSByb290LiQuZ2V0KHB1dFsnIyddKS5nZXQocHV0WycuJ10pLl87XG5cdGlmKCdzdHJpbmcnICE9IHR5cGVvZiAobGluayA9IHZhbGlkKGxpbmspKSl7XG5cdFx0aWYodGhpcyA9PT0gR3VuLm9uKXsgKHRhdC5lY2hvIHx8ICh0YXQuZWNobyA9IHt9KSlbY2F0LmlkXSA9IGNhdCB9IC8vIGFsbG93IHNvbWUgY2hhaW4gdG8gZXhwbGljaXRseSBmb3JjZSBsaW5raW5nIHRvIHNpbXBsZSBkYXRhLlxuXHRcdHJldHVybjsgLy8gYnkgZGVmYXVsdCBkbyBub3QgbGluayB0byBkYXRhIHRoYXQgaXMgbm90IGEgbGluay5cblx0fVxuXHRpZigodGF0LmVjaG8gfHwgKHRhdC5lY2hvID0ge30pKVtjYXQuaWRdIC8vIHdlJ3ZlIGFscmVhZHkgbGlua2VkIG91cnNlbHZlcyBzbyB3ZSBkbyBub3QgbmVlZCB0byBkbyBpdCBhZ2Fpbi4gRXhjZXB0Li4uIChhbm5veWluZyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzKVxuXHRcdCYmICEocm9vdC5wYXNzfHwnJylbY2F0LmlkXSl7IHJldHVybiB9IC8vIGlmIGEgbmV3IGV2ZW50IGxpc3RlbmVyIHdhcyBhZGRlZCwgd2UgbmVlZCB0byBtYWtlIGEgcGFzcyB0aHJvdWdoIGZvciBpdC4gVGhlIHBhc3Mgd2lsbCBiZSBvbiB0aGUgY2hhaW4sIG5vdCBhbHdheXMgdGhlIGNoYWluIHBhc3NlZCBkb3duLiBcblx0aWYodG1wID0gcm9vdC5wYXNzKXsgaWYodG1wW2xpbmsrY2F0LmlkXSl7IHJldHVybiB9IHRtcFtsaW5rK2NhdC5pZF0gPSAxIH0gLy8gQnV0IHRoZSBhYm92ZSBlZGdlIGNhc2UgbWF5IFwicGFzcyB0aHJvdWdoXCIgb24gYSBjaXJjdWxhciBncmFwaCBjYXVzaW5nIGluZmluaXRlIHBhc3Nlcywgc28gd2UgaGFja2lseSBhZGQgYSB0ZW1wb3JhcnkgY2hlY2sgZm9yIHRoYXQuXG5cblx0KHRhdC5lY2hvfHwodGF0LmVjaG89e30pKVtjYXQuaWRdID0gY2F0OyAvLyBzZXQgb3Vyc2VsZiB1cCBmb3IgdGhlIGVjaG8hIC8vIFRPRE86IEJVRz8gRWNobyB0byBzZWxmIG5vIGxvbmdlciBjYXVzZXMgcHJvYmxlbXM/IENvbmZpcm0uXG5cblx0aWYoY2F0Lmhhcyl7IGNhdC5saW5rID0gbGluayB9XG5cdHZhciBzYXQgPSByb290LiQuZ2V0KHRhdC5saW5rID0gbGluaykuXzsgLy8gZ3JhYiB3aGF0IHdlJ3JlIGxpbmtpbmcgdG8uXG5cdChzYXQuZWNobyB8fCAoc2F0LmVjaG8gPSB7fSkpW3RhdC5pZF0gPSB0YXQ7IC8vIGxpbmsgaXQuXG5cdHZhciB0bXAgPSBjYXQuYXNrfHwnJzsgLy8gYXNrIHRoZSBjaGFpbiBmb3Igd2hhdCBuZWVkcyB0byBiZSBsb2FkZWQgbmV4dCFcblx0aWYodG1wWycnXSB8fCBjYXQubGV4KXsgLy8gd2UgbWlnaHQgbmVlZCB0byBsb2FkIHRoZSB3aG9sZSB0aGluZyAvLyBUT0RPOiBjYXQubGV4IHByb2JhYmx5IGhhcyBlZGdlIGNhc2UgYnVncyB0byBpdCwgbmVlZCBtb3JlIHRlc3QgY292ZXJhZ2UuXG5cdFx0c2F0Lm9uKCdvdXQnLCB7Z2V0OiB7JyMnOiBsaW5rfX0pO1xuXHR9XG5cdHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyh0bXApLCBmdW5jdGlvbihnZXQsIHNhdCl7IC8vIGlmIHN1YiBjaGFpbnMgYXJlIGFza2luZyBmb3IgZGF0YS4gLy8gVE9ETzogLmtleXMoIGlzIHNsb3cgLy8gQlVHPyA/U29tZSByZS1pbiBsb2dpYyBtYXkgZGVwZW5kIG9uIHRoaXMgYmVpbmcgc3luYz9cblx0XHRpZighZ2V0IHx8ICEoc2F0ID0gdG1wW2dldF0pKXsgcmV0dXJuIH1cblx0XHRzYXQub24oJ291dCcsIHtnZXQ6IHsnIyc6IGxpbmssICcuJzogZ2V0fX0pOyAvLyBnbyBnZXQgaXQuXG5cdH0sMCw5OSk7XG59OyBHdW4ub24ubGluayA9IGxpbms7XG5cbmZ1bmN0aW9uIHVubGluayhtc2csIGNhdCl7IC8vIHVnaCwgc28gbXVjaCBjb2RlIGZvciBzZWVtaW5nbHkgZWRnZSBjYXNlIGJlaGF2aW9yLlxuXHR2YXIgcHV0ID0gbXNnLnB1dHx8JycsIGNoYW5nZSA9ICh1ICE9PSBwdXRbJz0nXSk/IHB1dFsnPSddIDogcHV0Wyc6J10sIHJvb3QgPSBjYXQucm9vdCwgbGluaywgdG1wO1xuXHRpZih1ID09PSBjaGFuZ2UpeyAvLyAxc3QgZWRnZSBjYXNlOiBJZiB3ZSBoYXZlIGEgYnJhbmQgbmV3IGRhdGFiYXNlLCBubyBkYXRhIHdpbGwgYmUgZm91bmQuXG5cdFx0Ly8gVE9ETzogQlVHISBiZWNhdXNlIGVtcHR5aW5nIGNhY2hlIGNvdWxkIGJlIGFzeW5jIGZyb20gYmVsb3csIG1ha2Ugc3VyZSB3ZSBhcmUgbm90IGVtcHR5aW5nIGEgbmV3ZXIgY2FjaGUuIFNvIG1heWJlIHBhc3MgYW4gQXN5bmMgSUQgdG8gY2hlY2sgYWdhaW5zdD9cblx0XHQvLyBUT0RPOiBCVUchIFdoYXQgaWYgdGhpcyBpcyBhIG1hcD8gLy8gV2FybmluZyEgQ2xlYXJpbmcgdGhpbmdzIG91dCBuZWVkcyB0byBiZSByb2J1c3QgYWdhaW5zdCBzeW5jL2FzeW5jIG9wcywgb3IgZWxzZSB5b3UnbGwgc2VlIGBtYXAgdmFsIGdldCBwdXRgIHRlc3QgY2F0YXN0cm9waGljYWxseSBmYWlsIGJlY2F1c2UgbWFwIGF0dGVtcHRzIHRvIGxpbmsgd2hlbiBwYXJlbnQgZ3JhcGggaXMgc3RyZWFtZWQgYmVmb3JlIGNoaWxkIHZhbHVlIGdldHMgc2V0LiBOZWVkIHRvIGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsYWNrIGFja3MgYW5kIGZvcmNlIGNsZWFyaW5nLlxuXHRcdGlmKGNhdC5zb3VsICYmIHUgIT09IGNhdC5wdXQpeyByZXR1cm4gfSAvLyBkYXRhIG1heSBub3QgYmUgZm91bmQgb24gYSBzb3VsLCBidXQgaWYgYSBzb3VsIGFscmVhZHkgaGFzIGRhdGEsIHRoZW4gbm90aGluZyBjYW4gY2xlYXIgdGhlIHNvdWwgYXMgYSB3aG9sZS5cblx0XHQvL2lmKCFjYXQuaGFzKXsgcmV0dXJuIH1cblx0XHR0bXAgPSAobXNnLiQkfHxtc2cuJHx8JycpLl98fCcnO1xuXHRcdGlmKG1zZ1snQCddICYmICh1ICE9PSB0bXAucHV0IHx8IHUgIT09IGNhdC5wdXQpKXsgcmV0dXJuIH0gLy8gYSBcIm5vdCBmb3VuZFwiIGZyb20gb3RoZXIgcGVlcnMgc2hvdWxkIG5vdCBjbGVhciBvdXQgZGF0YSBpZiB3ZSBoYXZlIGFscmVhZHkgZm91bmQgaXQuXG5cdFx0Ly9pZihjYXQuaGFzICYmIHUgPT09IGNhdC5wdXQgJiYgIShyb290LnBhc3N8fCcnKVtjYXQuaWRdKXsgcmV0dXJuIH0gLy8gaWYgd2UgYXJlIGFscmVhZHkgdW5saW5rZWQsIGRvIG5vdCBjYWxsIGFnYWluLCB1bmxlc3MgZWRnZSBjYXNlLiAvLyBUT0RPOiBCVUchIFRoaXMgbGluZSBzaG91bGQgYmUgZGVsZXRlZCBmb3IgXCJ1bmxpbmsgZGVlcGx5IG5lc3RlZFwiLlxuXHRcdGlmKGxpbmsgPSBjYXQubGluayB8fCBtc2cubGlua2VkKXtcblx0XHRcdGRlbGV0ZSAocm9vdC4kLmdldChsaW5rKS5fLmVjaG98fCcnKVtjYXQuaWRdO1xuXHRcdH1cblx0XHRpZihjYXQuaGFzKXsgLy8gVE9ETzogRW1wdHkgb3V0IGxpbmtzLCBtYXBzLCBlY2hvcywgYWNrcy9hc2tzLCBldGMuP1xuXHRcdFx0Y2F0LmxpbmsgPSBudWxsO1xuXHRcdH1cblx0XHRjYXQucHV0ID0gdTsgLy8gZW1wdHkgb3V0IHRoZSBjYWNoZSBpZiwgZm9yIGV4YW1wbGUsIGFsaWNlJ3MgY2FyJ3MgY29sb3Igbm8gbG9uZ2VyIGV4aXN0cyAocmVsYXRpdmUgdG8gYWxpY2UpIGlmIGFsaWNlIG5vIGxvbmdlciBoYXMgYSBjYXIuXG5cdFx0Ly8gVE9ETzogQlVHISBGb3IgbWFwcywgcHJveHkgdGhpcyBzbyB0aGUgaW5kaXZpZHVhbCBzdWIgaXMgdHJpZ2dlcmVkLCBub3QgYWxsIHN1YnMuXG5cdFx0c2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKGNhdC5uZXh0fHwnJyksIGZ1bmN0aW9uKGdldCwgc2F0KXsgLy8gZW1wdHkgb3V0IGFsbCBzdWIgY2hhaW5zLiAvLyBUT0RPOiAua2V5cyggaXMgc2xvdyAvLyBCVUc/ID9Tb21lIHJlLWluIGxvZ2ljIG1heSBkZXBlbmQgb24gdGhpcyBiZWluZyBzeW5jPyAvLyBUT0RPOiBCVUc/IFRoaXMgd2lsbCB0cmlnZ2VyIGRlZXBlciBwdXQgZmlyc3QsIGRvZXMgcHV0IGxvZ2ljIGRlcGVuZCBvbiBuZXN0ZWQgb3JkZXI/IC8vIFRPRE86IEJVRyEgRm9yIG1hcCwgdGhpcyBuZWVkcyB0byBiZSB0aGUgaXNvbGF0ZWQgY2hpbGQsIG5vdCBhbGwgb2YgdGhlbS5cblx0XHRcdGlmKCEoc2F0ID0gY2F0Lm5leHRbZ2V0XSkpeyByZXR1cm4gfVxuXHRcdFx0Ly9pZihjYXQuaGFzICYmIHUgPT09IHNhdC5wdXQgJiYgIShyb290LnBhc3N8fCcnKVtzYXQuaWRdKXsgcmV0dXJuIH0gLy8gaWYgd2UgYXJlIGFscmVhZHkgdW5saW5rZWQsIGRvIG5vdCBjYWxsIGFnYWluLCB1bmxlc3MgZWRnZSBjYXNlLiAvLyBUT0RPOiBCVUchIFRoaXMgbGluZSBzaG91bGQgYmUgZGVsZXRlZCBmb3IgXCJ1bmxpbmsgZGVlcGx5IG5lc3RlZFwiLlxuXHRcdFx0aWYobGluayl7IGRlbGV0ZSAocm9vdC4kLmdldChsaW5rKS5nZXQoZ2V0KS5fLmVjaG98fCcnKVtzYXQuaWRdIH1cblx0XHRcdHNhdC5vbignaW4nLCB7Z2V0OiBnZXQsIHB1dDogdSwgJDogc2F0LiR9KTsgLy8gVE9ETzogQlVHPyBBZGQgcmVjdXJzaXZlIHNlZW4gY2hlY2s/XG5cdFx0fSwwLDk5KTtcblx0XHRyZXR1cm47XG5cdH1cblx0aWYoY2F0LnNvdWwpeyByZXR1cm4gfSAvLyBhIHNvdWwgY2Fubm90IHVubGluayBpdHNlbGYuXG5cdGlmKG1zZy4kJCl7IHJldHVybiB9IC8vIGEgbGlua2VkIGNoYWluIGRvZXMgbm90IGRvIHRoZSB1bmxpbmtpbmcsIHRoZSBzdWIgY2hhaW4gZG9lcy4gLy8gVE9ETzogQlVHPyBXaWxsIHRoaXMgY2FuY2VsIG1hcHM/XG5cdGxpbmsgPSB2YWxpZChjaGFuZ2UpOyAvLyBuZWVkIHRvIHVubGluayBhbnl0aW1lIHdlIGFyZSBub3QgdGhlIHNhbWUgbGluaywgdGhvdWdoIG9ubHkgZG8gdGhpcyBvbmNlIHBlciB1bmxpbmsgKGFuZCBub3Qgb24gaW5pdCkuXG5cdHRtcCA9IG1zZy4kLl98fCcnO1xuXHRpZihsaW5rID09PSB0bXAubGluayB8fCAoY2F0LmhhcyAmJiAhdG1wLmxpbmspKXtcblx0XHRpZigocm9vdC5wYXNzfHwnJylbY2F0LmlkXSAmJiAnc3RyaW5nJyAhPT0gdHlwZW9mIGxpbmspe1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblx0ZGVsZXRlICh0bXAuZWNob3x8JycpW2NhdC5pZF07XG5cdHVubGluayh7Z2V0OiBjYXQuZ2V0LCBwdXQ6IHUsICQ6IG1zZy4kLCBsaW5rZWQ6IG1zZy5saW5rZWQgPSBtc2cubGlua2VkIHx8IHRtcC5saW5rfSwgY2F0KTsgLy8gdW5saW5rIG91ciBzdWIgY2hhaW5zLlxufTsgR3VuLm9uLnVubGluayA9IHVubGluaztcblxuZnVuY3Rpb24gYWNrKG1zZywgZXYpe1xuXHQvL2lmKCFtc2dbJyUnXSAmJiAodGhpc3x8JycpLm9mZil7IHRoaXMub2ZmKCkgfSAvLyBkbyBOT1QgbWVtb3J5IGxlYWssIHR1cm4gb2ZmIGxpc3RlbmVycyEgTm93IGhhbmRsZWQgYnkgLmFzayBpdHNlbGZcblx0Ly8gbWFuaGF0dGFuOlxuXHR2YXIgYXMgPSB0aGlzLmFzLCBhdCA9IGFzLiQuXywgcm9vdCA9IGF0LnJvb3QsIGdldCA9IGFzLmdldHx8JycsIHRtcCA9IChtc2cucHV0fHwnJylbZ2V0WycjJ11dfHwnJztcblx0aWYoIW1zZy5wdXQgfHwgKCdzdHJpbmcnID09IHR5cGVvZiBnZXRbJy4nXSAmJiB1ID09PSB0bXBbZ2V0WycuJ11dKSl7XG5cdFx0aWYodSAhPT0gYXQucHV0KXsgcmV0dXJuIH1cblx0XHRpZighYXQuc291bCAmJiAhYXQuaGFzKXsgcmV0dXJuIH0gLy8gVE9ETzogQlVHPyBGb3Igbm93LCBvbmx5IGNvcmUtY2hhaW5zIHdpbGwgaGFuZGxlIG5vdC1mb3VuZHMsIGJlY2F1c2UgYnVncyBjcmVlcCBpbiBpZiBub24tY29yZSBjaGFpbnMgYXJlIHVzZWQgYXMgJCBidXQgd2UgY2FuIHJldmlzaXQgdGhpcyBsYXRlciBmb3IgbW9yZSBwb3dlcmZ1bCBleHRlbnNpb25zLlxuXHRcdGF0LmFjayA9IChhdC5hY2sgfHwgMCkgKyAxO1xuXHRcdGF0Lm9uKCdpbicsIHtcblx0XHRcdGdldDogYXQuZ2V0LFxuXHRcdFx0cHV0OiBhdC5wdXQgPSB1LFxuXHRcdFx0JDogYXQuJCxcblx0XHRcdCdAJzogbXNnWydAJ11cblx0XHR9KTtcblx0XHQvKih0bXAgPSBhdC5RKSAmJiBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXModG1wKSwgZnVuY3Rpb24oaWQpeyAvLyBUT0RPOiBUZW1wb3JhcnkgdGVzdGluZywgbm90IGludGVncmF0ZWQgb3IgYmVpbmcgdXNlZCwgcHJvYmFibHkgZGVsZXRlLlxuXHRcdFx0T2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSwgdG1wID0ge30pOyB0bXBbJ0AnXSA9IGlkOyAvLyBjb3B5IG1lc3NhZ2Vcblx0XHRcdHJvb3Qub24oJ2luJywgdG1wKTtcblx0XHR9KTsgZGVsZXRlIGF0LlE7Ki9cblx0XHRyZXR1cm47XG5cdH1cblx0KG1zZy5ffHx7fSkubWlzcyA9IDE7XG5cdEd1bi5vbi5wdXQobXNnKTtcblx0cmV0dXJuOyAvLyBlb21cbn1cblxudmFyIGVtcHR5ID0ge30sIHUsIHRleHRfcmFuZCA9IFN0cmluZy5yYW5kb20sIHZhbGlkID0gR3VuLnZhbGlkLCBvYmpfaGFzID0gZnVuY3Rpb24obywgayl7IHJldHVybiBvICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSB9LCBzdGF0ZSA9IEd1bi5zdGF0ZSwgc3RhdGVfaXMgPSBzdGF0ZS5pcywgc3RhdGVfaWZ5ID0gc3RhdGUuaWZ5O1xuXHQiLCJcbnJlcXVpcmUoJy4vc2hpbScpO1xuZnVuY3Rpb24gRHVwKG9wdCl7XG5cdHZhciBkdXAgPSB7czp7fX0sIHMgPSBkdXAucztcblx0b3B0ID0gb3B0IHx8IHttYXg6IDk5OSwgYWdlOiAxMDAwICogOX07Ly8qLyAxMDAwICogOSAqIDN9O1xuXHRkdXAuY2hlY2sgPSBmdW5jdGlvbihpZCl7XG5cdFx0aWYoIXNbaWRdKXsgcmV0dXJuIGZhbHNlIH1cblx0XHRyZXR1cm4gZHQoaWQpO1xuXHR9XG5cdHZhciBkdCA9IGR1cC50cmFjayA9IGZ1bmN0aW9uKGlkKXtcblx0XHR2YXIgaXQgPSBzW2lkXSB8fCAoc1tpZF0gPSB7fSk7XG5cdFx0aXQud2FzID0gZHVwLm5vdyA9ICtuZXcgRGF0ZTtcblx0XHRpZighZHVwLnRvKXsgZHVwLnRvID0gc2V0VGltZW91dChkdXAuZHJvcCwgb3B0LmFnZSArIDkpIH1cblx0XHRyZXR1cm4gaXQ7XG5cdH1cblx0ZHVwLmRyb3AgPSBmdW5jdGlvbihhZ2Upe1xuXHRcdGR1cC50byA9IG51bGw7XG5cdFx0ZHVwLm5vdyA9ICtuZXcgRGF0ZTtcblx0XHR2YXIgbCA9IE9iamVjdC5rZXlzKHMpO1xuXHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoZHVwLm5vdywgK25ldyBEYXRlIC0gZHVwLm5vdywgJ2R1cCBkcm9wIGtleXMnKTsgLy8gcHJldiB+MjAlIENQVSA3JSBSQU0gMzAwTUIgLy8gbm93IH4yNSUgQ1BVIDclIFJBTSA1MDBNQlxuXHRcdHNldFRpbWVvdXQuZWFjaChsLCBmdW5jdGlvbihpZCl7IHZhciBpdCA9IHNbaWRdOyAvLyBUT0RPOiAua2V5cyggaXMgc2xvdz9cblx0XHRcdGlmKGl0ICYmIChhZ2UgfHwgb3B0LmFnZSkgPiAoZHVwLm5vdyAtIGl0LndhcykpeyByZXR1cm4gfVxuXHRcdFx0ZGVsZXRlIHNbaWRdO1xuXHRcdH0sMCw5OSk7XG5cdH1cblx0cmV0dXJuIGR1cDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRHVwO1xuXHQiLCJcbnZhciBHdW4gPSByZXF1aXJlKCcuL3Jvb3QnKTtcbkd1bi5jaGFpbi5nZXQgPSBmdW5jdGlvbihrZXksIGNiLCBhcyl7XG5cdHZhciBndW4sIHRtcDtcblx0aWYodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpe1xuXHRcdGlmKGtleS5sZW5ndGggPT0gMCkge1x0XG5cdFx0XHQoZ3VuID0gdGhpcy5jaGFpbigpKS5fLmVyciA9IHtlcnI6IEd1bi5sb2coJzAgbGVuZ3RoIGtleSEnLCBrZXkpfTtcblx0XHRcdGlmKGNiKXsgY2IuY2FsbChndW4sIGd1bi5fLmVycikgfVxuXHRcdFx0cmV0dXJuIGd1bjtcblx0XHR9XG5cdFx0dmFyIGJhY2sgPSB0aGlzLCBjYXQgPSBiYWNrLl87XG5cdFx0dmFyIG5leHQgPSBjYXQubmV4dCB8fCBlbXB0eTtcblx0XHRpZighKGd1biA9IG5leHRba2V5XSkpe1xuXHRcdFx0Z3VuID0ga2V5ICYmIGNhY2hlKGtleSwgYmFjayk7XG5cdFx0fVxuXHRcdGd1biA9IGd1biAmJiBndW4uJDtcblx0fSBlbHNlXG5cdGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIGtleSl7XG5cdFx0aWYodHJ1ZSA9PT0gY2IpeyByZXR1cm4gc291bCh0aGlzLCBrZXksIGNiLCBhcyksIHRoaXMgfVxuXHRcdGd1biA9IHRoaXM7XG5cdFx0dmFyIGNhdCA9IGd1bi5fLCBvcHQgPSBjYiB8fCB7fSwgcm9vdCA9IGNhdC5yb290LCBpZDtcblx0XHRvcHQuYXQgPSBjYXQ7XG5cdFx0b3B0Lm9rID0ga2V5O1xuXHRcdHZhciB3YWl0ID0ge307IC8vIGNhbiB3ZSBhc3NpZ24gdGhpcyB0byB0aGUgYXQgaW5zdGVhZCwgbGlrZSBpbiBvbmNlP1xuXHRcdC8vdmFyIHBhdGggPSBbXTsgY2F0LiQuYmFjayhhdCA9PiB7IGF0LmdldCAmJiBwYXRoLnB1c2goYXQuZ2V0LnNsaWNlKDAsOSkpfSk7IHBhdGggPSBwYXRoLnJldmVyc2UoKS5qb2luKCcuJyk7XG5cdFx0ZnVuY3Rpb24gYW55KG1zZywgZXZlLCBmKXtcblx0XHRcdGlmKGFueS5zdHVuKXsgcmV0dXJuIH1cblx0XHRcdGlmKCh0bXAgPSByb290LnBhc3MpICYmICF0bXBbaWRdKXsgcmV0dXJuIH1cblx0XHRcdHZhciBhdCA9IG1zZy4kLl8sIHNhdCA9IChtc2cuJCR8fCcnKS5fLCBkYXRhID0gKHNhdHx8YXQpLnB1dCwgb2RkID0gKCFhdC5oYXMgJiYgIWF0LnNvdWwpLCB0ZXN0ID0ge30sIGxpbmssIHRtcDtcblx0XHRcdGlmKG9kZCB8fCB1ID09PSBkYXRhKXsgLy8gaGFuZGxlcyBub24tY29yZVxuXHRcdFx0XHRkYXRhID0gKHUgPT09ICgodG1wID0gbXNnLnB1dCl8fCcnKVsnPSddKT8gKHUgPT09ICh0bXB8fCcnKVsnOiddKT8gdG1wIDogdG1wWyc6J10gOiB0bXBbJz0nXTtcblx0XHRcdH1cblx0XHRcdGlmKGxpbmsgPSAoJ3N0cmluZycgPT0gdHlwZW9mICh0bXAgPSBHdW4udmFsaWQoZGF0YSkpKSl7XG5cdFx0XHRcdGRhdGEgPSAodSA9PT0gKHRtcCA9IHJvb3QuJC5nZXQodG1wKS5fLnB1dCkpPyBvcHQubm90PyB1IDogZGF0YSA6IHRtcDtcblx0XHRcdH1cblx0XHRcdGlmKG9wdC5ub3QgJiYgdSA9PT0gZGF0YSl7IHJldHVybiB9XG5cdFx0XHRpZih1ID09PSBvcHQuc3R1bil7XG5cdFx0XHRcdGlmKCh0bXAgPSByb290LnN0dW4pICYmIHRtcC5vbil7XG5cdFx0XHRcdFx0Y2F0LiQuYmFjayhmdW5jdGlvbihhKXsgLy8gb3VyIGNoYWluIHN0dW5uZWQ/XG5cdFx0XHRcdFx0XHR0bXAub24oJycrYS5pZCwgdGVzdCA9IHt9KTtcblx0XHRcdFx0XHRcdGlmKCh0ZXN0LnJ1biB8fCAwKSA8IGFueS5pZCl7IHJldHVybiB0ZXN0IH0gLy8gaWYgdGhlcmUgaXMgYW4gZWFybGllciBzdHVuIG9uIGdhcGxlc3MgcGFyZW50cy9zZWxmLlxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCF0ZXN0LnJ1biAmJiB0bXAub24oJycrYXQuaWQsIHRlc3QgPSB7fSk7IC8vIHRoaXMgbm9kZSBzdHVubmVkP1xuXHRcdFx0XHRcdCF0ZXN0LnJ1biAmJiBzYXQgJiYgdG1wLm9uKCcnK3NhdC5pZCwgdGVzdCA9IHt9KTsgLy8gbGlua2VkIG5vZGUgc3R1bm5lZD9cblx0XHRcdFx0XHRpZihhbnkuaWQgPiB0ZXN0LnJ1bil7XG5cdFx0XHRcdFx0XHRpZighdGVzdC5zdHVuIHx8IHRlc3Quc3R1bi5lbmQpe1xuXHRcdFx0XHRcdFx0XHR0ZXN0LnN0dW4gPSB0bXAub24oJ3N0dW4nKTtcblx0XHRcdFx0XHRcdFx0dGVzdC5zdHVuID0gdGVzdC5zdHVuICYmIHRlc3Quc3R1bi5sYXN0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYodGVzdC5zdHVuICYmICF0ZXN0LnN0dW4uZW5kKXtcblx0XHRcdFx0XHRcdFx0Ly9pZihvZGQgJiYgdSA9PT0gZGF0YSl7IHJldHVybiB9XG5cdFx0XHRcdFx0XHRcdC8vaWYodSA9PT0gbXNnLnB1dCl7IHJldHVybiB9IC8vIFwibm90IGZvdW5kXCIgYWNrcyB3aWxsIGJlIGZvdW5kIGlmIHRoZXJlIGlzIHN0dW4sIHNvIGlnbm9yZSB0aGVzZS5cblx0XHRcdFx0XHRcdFx0KHRlc3Quc3R1bi5hZGQgfHwgKHRlc3Quc3R1bi5hZGQgPSB7fSkpW2lkXSA9IGZ1bmN0aW9uKCl7IGFueShtc2csZXZlLDEpIH0gLy8gYWRkIG91cnNlbGYgdG8gdGhlIHN0dW4gY2FsbGJhY2sgbGlzdCB0aGF0IGlzIGNhbGxlZCBhdCBlbmQgb2YgdGhlIHdyaXRlLlxuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKC8qb2RkICYmKi8gdSA9PT0gZGF0YSl7IGYgPSAwIH0gLy8gaWYgZGF0YSBub3QgZm91bmQsIGtlZXAgd2FpdGluZy90cnlpbmcuXG5cdFx0XHRcdC8qaWYoZiAmJiB1ID09PSBkYXRhKXtcblx0XHRcdFx0XHRjYXQub24oJ291dCcsIG9wdC5vdXQpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fSovXG5cdFx0XHRcdGlmKCh0bXAgPSByb290LmhhdGNoKSAmJiAhdG1wLmVuZCAmJiB1ID09PSBvcHQuaGF0Y2ggJiYgIWYpeyAvLyBxdWljayBoYWNrISAvLyBXaGF0J3MgZ29pbmcgb24gaGVyZT8gQmVjYXVzZSBkYXRhIGlzIHN0cmVhbWVkLCB3ZSBnZXQgdGhpbmdzIG9uZSBieSBvbmUsIGJ1dCBhIGxvdCBvZiBkZXZlbG9wZXJzIHdvdWxkIHJhdGhlciBnZXQgYSBjYWxsYmFjayBhZnRlciBlYWNoIGJhdGNoIGluc3RlYWQsIHNvIHRoaXMgZG9lcyB0aGF0IGJ5IGNyZWF0aW5nIGEgd2FpdCBsaXN0IHBlciBjaGFpbiBpZCB0aGF0IGlzIHRoZW4gY2FsbGVkIGF0IHRoZSBlbmQgb2YgdGhlIGJhdGNoIGJ5IHRoZSBoYXRjaCBjb2RlIGluIHRoZSByb290IHB1dCBsaXN0ZW5lci5cblx0XHRcdFx0XHRpZih3YWl0W2F0LiQuXy5pZF0peyByZXR1cm4gfSB3YWl0W2F0LiQuXy5pZF0gPSAxO1xuXHRcdFx0XHRcdHRtcC5wdXNoKGZ1bmN0aW9uKCl7YW55KG1zZyxldmUsMSl9KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH07IHdhaXQgPSB7fTsgLy8gZW5kIHF1aWNrIGhhY2suXG5cdFx0XHR9XG5cdFx0XHQvLyBjYWxsOlxuXHRcdFx0aWYocm9vdC5wYXNzKXsgaWYocm9vdC5wYXNzW2lkK2F0LmlkXSl7IHJldHVybiB9IHJvb3QucGFzc1tpZCthdC5pZF0gPSAxIH1cblx0XHRcdGlmKG9wdC5vbil7IG9wdC5vay5jYWxsKGF0LiQsIGRhdGEsIGF0LmdldCwgbXNnLCBldmUgfHwgYW55KTsgcmV0dXJuIH0gLy8gVE9ETzogQWxzbyBjb25zaWRlciBicmVha2luZyBgdGhpc2Agc2luY2UgYSBsb3Qgb2YgcGVvcGxlIGRvIGA9PmAgdGhlc2UgZGF5cyBhbmQgYC5jYWxsKGAgaGFzIHNsb3dlciBwZXJmb3JtYW5jZS5cblx0XHRcdGlmKG9wdC52MjAyMCl7IG9wdC5vayhtc2csIGV2ZSB8fCBhbnkpOyByZXR1cm4gfVxuXHRcdFx0T2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSwgdG1wID0ge30pOyBtc2cgPSB0bXA7IG1zZy5wdXQgPSBkYXRhOyAvLyAyMDE5IENPTVBBVElCSUxJVFkhIFRPRE86IEdFVCBSSUQgT0YgVEhJUyFcblx0XHRcdG9wdC5vay5jYWxsKG9wdC5hcywgbXNnLCBldmUgfHwgYW55KTsgLy8gaXMgdGhpcyB0aGUgcmlnaHRcblx0XHR9O1xuXHRcdGFueS5hdCA9IGNhdDtcblx0XHQvLyhjYXQuYW55fHwoY2F0LmFueT1mdW5jdGlvbihtc2cpeyBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMoY2F0LmFueXx8JycpLCBmdW5jdGlvbihhY3QpeyAoYWN0ID0gY2F0LmFueVthY3RdKSAmJiBhY3QobXNnKSB9LDAsOTkpIH0pKVtpZCA9IFN0cmluZy5yYW5kb20oNyldID0gYW55OyAvLyBtYXliZSBzd2l0Y2ggdG8gdGhpcyBpbiBmdXR1cmU/XG5cdFx0KGNhdC5hbnl8fChjYXQuYW55PXt9KSlbaWQgPSBTdHJpbmcucmFuZG9tKDcpXSA9IGFueTtcblx0XHRhbnkub2ZmID0gZnVuY3Rpb24oKXsgYW55LnN0dW4gPSAxOyBpZighY2F0LmFueSl7IHJldHVybiB9IGRlbGV0ZSBjYXQuYW55W2lkXSB9XG5cdFx0YW55LnJpZCA9IHJpZDsgLy8gbG9naWMgZnJvbSBvbGQgdmVyc2lvbiwgY2FuIHdlIGNsZWFuIGl0IHVwIG5vdz9cblx0XHRhbnkuaWQgPSBvcHQucnVuIHx8ICsrcm9vdC5vbmNlOyAvLyB1c2VkIGluIGNhbGxiYWNrIHRvIGNoZWNrIGlmIHdlIGFyZSBlYXJsaWVyIHRoYW4gYSB3cml0ZS4gLy8gd2lsbCB0aGlzIGV2ZXIgY2F1c2UgYW4gaW50ZWdlciBvdmVyZmxvdz9cblx0XHR0bXAgPSByb290LnBhc3M7IChyb290LnBhc3MgPSB7fSlbaWRdID0gMTsgLy8gRXhwbGFuYXRpb246IHRlc3QgdHJhZGUtb2ZmcyB3YW50IHRvIHByZXZlbnQgcmVjdXJzaW9uIHNvIHdlIGFkZC9yZW1vdmUgcGFzcyBmbGFnIGFzIGl0IGdldHMgZnVsZmlsbGVkIHRvIG5vdCByZXBlYXQsIGhvd2V2ZXIgbWFwIG1hcCBuZWVkcyBtYW55IHBhc3MgZmxhZ3MgLSBob3cgZG8gd2UgcmVjb25jaWxlP1xuXHRcdG9wdC5vdXQgPSBvcHQub3V0IHx8IHtnZXQ6IHt9fTtcblx0XHRjYXQub24oJ291dCcsIG9wdC5vdXQpO1xuXHRcdHJvb3QucGFzcyA9IHRtcDtcblx0XHRyZXR1cm4gZ3VuO1xuXHR9IGVsc2Vcblx0aWYoJ251bWJlcicgPT0gdHlwZW9mIGtleSl7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCcnK2tleSwgY2IsIGFzKTtcblx0fSBlbHNlXG5cdGlmKCdzdHJpbmcnID09IHR5cGVvZiAodG1wID0gdmFsaWQoa2V5KSkpe1xuXHRcdHJldHVybiB0aGlzLmdldCh0bXAsIGNiLCBhcyk7XG5cdH0gZWxzZVxuXHRpZih0bXAgPSB0aGlzLmdldC5uZXh0KXtcblx0XHRndW4gPSB0bXAodGhpcywga2V5KTtcblx0fVxuXHRpZighZ3VuKXtcblx0XHQoZ3VuID0gdGhpcy5jaGFpbigpKS5fLmVyciA9IHtlcnI6IEd1bi5sb2coJ0ludmFsaWQgZ2V0IHJlcXVlc3QhJywga2V5KX07IC8vIENMRUFOIFVQXG5cdFx0aWYoY2IpeyBjYi5jYWxsKGd1biwgZ3VuLl8uZXJyKSB9XG5cdFx0cmV0dXJuIGd1bjtcblx0fVxuXHRpZihjYiAmJiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYil7XG5cdFx0Z3VuLmdldChjYiwgYXMpO1xuXHR9XG5cdHJldHVybiBndW47XG59XG5mdW5jdGlvbiBjYWNoZShrZXksIGJhY2spe1xuXHR2YXIgY2F0ID0gYmFjay5fLCBuZXh0ID0gY2F0Lm5leHQsIGd1biA9IGJhY2suY2hhaW4oKSwgYXQgPSBndW4uXztcblx0aWYoIW5leHQpeyBuZXh0ID0gY2F0Lm5leHQgPSB7fSB9XG5cdG5leHRbYXQuZ2V0ID0ga2V5XSA9IGF0O1xuXHRpZihiYWNrID09PSBjYXQucm9vdC4kKXtcblx0XHRhdC5zb3VsID0ga2V5O1xuXHR9IGVsc2Vcblx0aWYoY2F0LnNvdWwgfHwgY2F0Lmhhcyl7XG5cdFx0YXQuaGFzID0ga2V5O1xuXHRcdC8vaWYob2JqX2hhcyhjYXQucHV0LCBrZXkpKXtcblx0XHRcdC8vYXQucHV0ID0gY2F0LnB1dFtrZXldO1xuXHRcdC8vfVxuXHR9XG5cdHJldHVybiBhdDtcbn1cbmZ1bmN0aW9uIHNvdWwoZ3VuLCBjYiwgb3B0LCBhcyl7XG5cdHZhciBjYXQgPSBndW4uXywgYWNrcyA9IDAsIHRtcDtcblx0aWYodG1wID0gY2F0LnNvdWwgfHwgY2F0LmxpbmspeyByZXR1cm4gY2IodG1wLCBhcywgY2F0KSB9XG5cdGlmKGNhdC5qYW0peyByZXR1cm4gY2F0LmphbS5wdXNoKFtjYiwgYXNdKSB9XG5cdGNhdC5qYW0gPSBbW2NiLGFzXV07XG5cdGd1bi5nZXQoZnVuY3Rpb24gZ28obXNnLCBldmUpe1xuXHRcdGlmKHUgPT09IG1zZy5wdXQgJiYgIWNhdC5yb290Lm9wdC5zdXBlciAmJiAodG1wID0gT2JqZWN0LmtleXMoY2F0LnJvb3Qub3B0LnBlZXJzKS5sZW5ndGgpICYmICsrYWNrcyA8PSB0bXApeyAvLyBUT0RPOiBzdXBlciBzaG91bGQgbm90IGJlIGluIGNvcmUgY29kZSwgYnJpbmcgQVhFIHVwIGludG8gY29yZSBpbnN0ZWFkIHRvIGZpeD8gLy8gVE9ETzogLmtleXMoIGlzIHNsb3dcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZXZlLnJpZChtc2cpO1xuXHRcdHZhciBhdCA9ICgoYXQgPSBtc2cuJCkgJiYgYXQuXykgfHwge30sIGkgPSAwLCBhcztcblx0XHR0bXAgPSBjYXQuamFtOyBkZWxldGUgY2F0LmphbTsgLy8gdG1wID0gY2F0LmphbS5zcGxpY2UoMCwgMTAwKTtcblx0XHQvL2lmKHRtcC5sZW5ndGgpeyBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCl7IGdvKG1zZywgZXZlKSB9KSB9XG5cdFx0d2hpbGUoYXMgPSB0bXBbaSsrXSl7IC8vR3VuLm9iai5tYXAodG1wLCBmdW5jdGlvbihhcywgY2Ipe1xuXHRcdFx0dmFyIGNiID0gYXNbMF0sIGlkOyBhcyA9IGFzWzFdO1xuXHRcdFx0Y2IgJiYgY2IoaWQgPSBhdC5saW5rIHx8IGF0LnNvdWwgfHwgR3VuLnZhbGlkKG1zZy5wdXQpIHx8ICgobXNnLnB1dHx8e30pLl98fHt9KVsnIyddLCBhcywgbXNnLCBldmUpO1xuXHRcdH0gLy8pO1xuXHR9LCB7b3V0OiB7Z2V0OiB7Jy4nOnRydWV9fX0pO1xuXHRyZXR1cm4gZ3VuO1xufVxuZnVuY3Rpb24gcmlkKGF0KXtcblx0dmFyIGNhdCA9IHRoaXMuYXQgfHwgdGhpcy5vbjtcblx0aWYoIWF0IHx8IGNhdC5zb3VsIHx8IGNhdC5oYXMpeyByZXR1cm4gdGhpcy5vZmYoKSB9XG5cdGlmKCEoYXQgPSAoYXQgPSAoYXQgPSBhdC4kIHx8IGF0KS5fIHx8IGF0KS5pZCkpeyByZXR1cm4gfVxuXHR2YXIgbWFwID0gY2F0Lm1hcCwgdG1wLCBzZWVuO1xuXHQvL2lmKCFtYXAgfHwgISh0bXAgPSBtYXBbYXRdKSB8fCAhKHRtcCA9IHRtcC5hdCkpeyByZXR1cm4gfVxuXHRpZih0bXAgPSAoc2VlbiA9IHRoaXMuc2VlbiB8fCAodGhpcy5zZWVuID0ge30pKVthdF0peyByZXR1cm4gdHJ1ZSB9XG5cdHNlZW5bYXRdID0gdHJ1ZTtcblx0cmV0dXJuO1xuXHQvL3RtcC5lY2hvW2NhdC5pZF0gPSB7fTsgLy8gVE9ETzogV2FybmluZzogVGhpcyB1bnN1YnNjcmliZXMgQUxMIG9mIHRoaXMgY2hhaW4ncyBsaXN0ZW5lcnMgZnJvbSB0aGlzIGxpbmssIG5vdCBqdXN0IHRoZSBvbmUgY2FsbGJhY2sgZXZlbnQuXG5cdC8vb2JqLmRlbChtYXAsIGF0KTsgLy8gVE9ETzogV2FybmluZzogVGhpcyB1bnN1YnNjcmliZXMgQUxMIG9mIHRoaXMgY2hhaW4ncyBsaXN0ZW5lcnMgZnJvbSB0aGlzIGxpbmssIG5vdCBqdXN0IHRoZSBvbmUgY2FsbGJhY2sgZXZlbnQuXG5cdHJldHVybjtcbn1cbnZhciBlbXB0eSA9IHt9LCB2YWxpZCA9IEd1bi52YWxpZCwgdTtcblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9yb290Jyk7XG5yZXF1aXJlKCcuL2NoYWluJyk7XG5yZXF1aXJlKCcuL2JhY2snKTtcbnJlcXVpcmUoJy4vcHV0Jyk7XG5yZXF1aXJlKCcuL2dldCcpO1xubW9kdWxlLmV4cG9ydHMgPSBHdW47XG5cdCIsIlxuaWYodHlwZW9mIEd1biA9PT0gJ3VuZGVmaW5lZCcpeyByZXR1cm4gfVxuXG52YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fSwgc3RvcmUsIHU7XG50cnl7c3RvcmUgPSAoR3VuLndpbmRvd3x8bm9vcCkubG9jYWxTdG9yYWdlfWNhdGNoKGUpe31cbmlmKCFzdG9yZSl7XG5cdEd1bi5sb2coXCJXYXJuaW5nOiBObyBsb2NhbFN0b3JhZ2UgZXhpc3RzIHRvIHBlcnNpc3QgZGF0YSB0byFcIik7XG5cdHN0b3JlID0ge3NldEl0ZW06IGZ1bmN0aW9uKGssdil7dGhpc1trXT12fSwgcmVtb3ZlSXRlbTogZnVuY3Rpb24oayl7ZGVsZXRlIHRoaXNba119LCBnZXRJdGVtOiBmdW5jdGlvbihrKXtyZXR1cm4gdGhpc1trXX19O1xufVxuR3VuLm9uKCdjcmVhdGUnLCBmdW5jdGlvbiBsZyhyb290KXtcblx0dGhpcy50by5uZXh0KHJvb3QpO1xuXHR2YXIgb3B0ID0gcm9vdC5vcHQsIGdyYXBoID0gcm9vdC5ncmFwaCwgYWNrcyA9IFtdLCBkaXNrLCB0bztcblx0aWYoZmFsc2UgPT09IG9wdC5sb2NhbFN0b3JhZ2UpeyByZXR1cm4gfVxuXHRvcHQucHJlZml4ID0gb3B0LmZpbGUgfHwgJ2d1bi8nO1xuXHR0cnl7IGRpc2sgPSBsZ1tvcHQucHJlZml4XSA9IGxnW29wdC5wcmVmaXhdIHx8IEpTT04ucGFyc2Uoc3RvcmUuZ2V0SXRlbShvcHQucHJlZml4KSkgfHwge307IC8vIFRPRE86IFBlcmYhIFRoaXMgd2lsbCBibG9jaywgc2hvdWxkIHdlIGNhcmUsIHNpbmNlIGxpbWl0ZWQgdG8gNU1CIGFueXdheXM/XG5cdH1jYXRjaChlKXsgZGlzayA9IGxnW29wdC5wcmVmaXhdID0ge307IH1cblxuXHRyb290Lm9uKCdnZXQnLCBmdW5jdGlvbihtc2cpe1xuXHRcdHRoaXMudG8ubmV4dChtc2cpO1xuXHRcdHZhciBsZXggPSBtc2cuZ2V0LCBzb3VsLCBkYXRhLCB0bXAsIHU7XG5cdFx0aWYoIWxleCB8fCAhKHNvdWwgPSBsZXhbJyMnXSkpeyByZXR1cm4gfVxuXHRcdGRhdGEgPSBkaXNrW3NvdWxdIHx8IHU7XG5cdFx0aWYoZGF0YSAmJiAodG1wID0gbGV4WycuJ10pICYmICFPYmplY3QucGxhaW4odG1wKSl7IC8vIHBsdWNrIVxuXHRcdFx0ZGF0YSA9IEd1bi5zdGF0ZS5pZnkoe30sIHRtcCwgR3VuLnN0YXRlLmlzKGRhdGEsIHRtcCksIGRhdGFbdG1wXSwgc291bCk7XG5cdFx0fVxuXHRcdC8vaWYoZGF0YSl7ICh0bXAgPSB7fSlbc291bF0gPSBkYXRhIH0gLy8gYmFjayBpbnRvIGEgZ3JhcGguXG5cdFx0Ly9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0R3VuLm9uLmdldC5hY2sobXNnLCBkYXRhKTsgLy9yb290Lm9uKCdpbicsIHsnQCc6IG1zZ1snIyddLCBwdXQ6IHRtcCwgbFM6MX0pOy8vIHx8IHJvb3QuJH0pO1xuXHRcdC8vfSwgTWF0aC5yYW5kb20oKSAqIDEwKTsgLy8gRk9SIFRFU1RJTkcgUFVSUE9TRVMhXG5cdH0pO1xuXG5cdHJvb3Qub24oJ3B1dCcsIGZ1bmN0aW9uKG1zZyl7XG5cdFx0dGhpcy50by5uZXh0KG1zZyk7IC8vIHJlbWVtYmVyIHRvIGNhbGwgbmV4dCBtaWRkbGV3YXJlIGFkYXB0ZXJcblx0XHR2YXIgcHV0ID0gbXNnLnB1dCwgc291bCA9IHB1dFsnIyddLCBrZXkgPSBwdXRbJy4nXSwgdG1wOyAvLyBwdWxsIGRhdGEgb2ZmIHdpcmUgZW52ZWxvcGVcblx0XHRkaXNrW3NvdWxdID0gR3VuLnN0YXRlLmlmeShkaXNrW3NvdWxdLCBrZXksIHB1dFsnPiddLCBwdXRbJzonXSwgc291bCk7IC8vIG1lcmdlIGludG8gZGlzayBvYmplY3Rcblx0XHRpZighbXNnWydAJ10peyBhY2tzLnB1c2gobXNnWycjJ10pIH0gLy8gdGhlbiBhY2sgYW55IG5vbi1hY2sgd3JpdGUuIC8vIFRPRE86IHVzZSBiYXRjaCBpZC5cblx0XHRpZih0byl7IHJldHVybiB9XG5cdFx0Ly9mbHVzaCgpO3JldHVybjtcblx0XHR0byA9IHNldFRpbWVvdXQoZmx1c2gsIG9wdC53YWl0IHx8IDEpOyAvLyB0aGF0IGdldHMgc2F2ZWQgYXMgYSB3aG9sZSB0byBkaXNrIGV2ZXJ5IDFtc1xuXHR9KTtcblx0ZnVuY3Rpb24gZmx1c2goKXtcblx0XHR2YXIgZXJyLCBhY2sgPSBhY2tzOyBjbGVhclRpbWVvdXQodG8pOyB0byA9IGZhbHNlOyBhY2tzID0gW107XG5cdFx0dHJ5e3N0b3JlLnNldEl0ZW0ob3B0LnByZWZpeCwgSlNPTi5zdHJpbmdpZnkoZGlzaykpO1xuXHRcdH1jYXRjaChlKXtcblx0XHRcdEd1bi5sb2coKGVyciA9IChlIHx8IFwibG9jYWxTdG9yYWdlIGZhaWx1cmVcIikpICsgXCIgQ29uc2lkZXIgdXNpbmcgR1VOJ3MgSW5kZXhlZERCIHBsdWdpbiBmb3IgUkFEIGZvciBtb3JlIHN0b3JhZ2Ugc3BhY2UsIGh0dHBzOi8vZ3VuLmVjby9kb2NzL1JBRCNpbnN0YWxsXCIpO1xuXHRcdFx0cm9vdC5vbignbG9jYWxTdG9yYWdlOmVycm9yJywge2VycjogZXJyLCBnZXQ6IG9wdC5wcmVmaXgsIHB1dDogZGlza30pO1xuXHRcdH1cblx0XHRpZighZXJyICYmICFPYmplY3QuZW1wdHkob3B0LnBlZXJzKSl7IHJldHVybiB9IC8vIG9ubHkgYWNrIGlmIHRoZXJlIGFyZSBubyBwZWVycy4gLy8gU3dpdGNoIHRoaXMgdG8gcHJvYmFiaWxpc3RpYyBtb2RlXG5cdFx0c2V0VGltZW91dC5lYWNoKGFjaywgZnVuY3Rpb24oaWQpe1xuXHRcdFx0cm9vdC5vbignaW4nLCB7J0AnOiBpZCwgZXJyOiBlcnIsIG9rOiAwfSk7IC8vIGxvY2FsU3RvcmFnZSBpc24ndCByZWxpYWJsZSwgc28gbWFrZSBpdHMgYG9rYCBjb2RlIGJlIGEgbG93IG51bWJlci5cblx0XHR9KTtcblx0fVxuXG59KTtcblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9pbmRleCcpLCBuZXh0ID0gR3VuLmNoYWluLmdldC5uZXh0O1xuR3VuLmNoYWluLmdldC5uZXh0ID0gZnVuY3Rpb24oZ3VuLCBsZXgpeyB2YXIgdG1wO1xuXHRpZighT2JqZWN0LnBsYWluKGxleCkpeyByZXR1cm4gKG5leHR8fG5vb3ApKGd1biwgbGV4KSB9XG5cdGlmKHRtcCA9ICgodG1wID0gbGV4WycjJ10pfHwnJylbJz0nXSB8fCB0bXApeyByZXR1cm4gZ3VuLmdldCh0bXApIH1cblx0KHRtcCA9IGd1bi5jaGFpbigpLl8pLmxleCA9IGxleDsgLy8gTEVYIVxuXHRndW4ub24oJ2luJywgZnVuY3Rpb24oZXZlKXtcblx0XHRpZihTdHJpbmcubWF0Y2goZXZlLmdldHx8IChldmUucHV0fHwnJylbJy4nXSwgbGV4WycuJ10gfHwgbGV4WycjJ10gfHwgbGV4KSl7XG5cdFx0XHR0bXAub24oJ2luJywgZXZlKTtcblx0XHR9XG5cdFx0dGhpcy50by5uZXh0KGV2ZSk7XG5cdH0pO1xuXHRyZXR1cm4gdG1wLiQ7XG59XG5HdW4uY2hhaW4ubWFwID0gZnVuY3Rpb24oY2IsIG9wdCwgdCl7XG5cdHZhciBndW4gPSB0aGlzLCBjYXQgPSBndW4uXywgbGV4LCBjaGFpbjtcblx0aWYoT2JqZWN0LnBsYWluKGNiKSl7IGxleCA9IGNiWycuJ10/IGNiIDogeycuJzogY2J9OyBjYiA9IHUgfVxuXHRpZighY2Ipe1xuXHRcdGlmKGNoYWluID0gY2F0LmVhY2gpeyByZXR1cm4gY2hhaW4gfVxuXHRcdChjYXQuZWFjaCA9IGNoYWluID0gZ3VuLmNoYWluKCkpLl8ubGV4ID0gbGV4IHx8IGNoYWluLl8ubGV4IHx8IGNhdC5sZXg7XG5cdFx0Y2hhaW4uXy5uaXggPSBndW4uYmFjaygnbml4Jyk7XG5cdFx0Z3VuLm9uKCdpbicsIG1hcCwgY2hhaW4uXyk7XG5cdFx0cmV0dXJuIGNoYWluO1xuXHR9XG5cdEd1bi5sb2cub25jZShcIm1hcGZuXCIsIFwiTWFwIGZ1bmN0aW9ucyBhcmUgZXhwZXJpbWVudGFsLCB0aGVpciBiZWhhdmlvciBhbmQgQVBJIG1heSBjaGFuZ2UgbW92aW5nIGZvcndhcmQuIFBsZWFzZSBwbGF5IHdpdGggaXQgYW5kIHJlcG9ydCBidWdzIGFuZCBpZGVhcyBvbiBob3cgdG8gaW1wcm92ZSBpdC5cIik7XG5cdGNoYWluID0gZ3VuLmNoYWluKCk7XG5cdGd1bi5tYXAoKS5vbihmdW5jdGlvbihkYXRhLCBrZXksIG1zZywgZXZlKXtcblx0XHR2YXIgbmV4dCA9IChjYnx8bm9vcCkuY2FsbCh0aGlzLCBkYXRhLCBrZXksIG1zZywgZXZlKTtcblx0XHRpZih1ID09PSBuZXh0KXsgcmV0dXJuIH1cblx0XHRpZihkYXRhID09PSBuZXh0KXsgcmV0dXJuIGNoYWluLl8ub24oJ2luJywgbXNnKSB9XG5cdFx0aWYoR3VuLmlzKG5leHQpKXsgcmV0dXJuIGNoYWluLl8ub24oJ2luJywgbmV4dC5fKSB9XG5cdFx0dmFyIHRtcCA9IHt9OyBPYmplY3Qua2V5cyhtc2cucHV0KS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2cucHV0W2tdIH0sIHRtcCk7IHRtcFsnPSddID0gbmV4dDsgXG5cdFx0Y2hhaW4uXy5vbignaW4nLCB7Z2V0OiBrZXksIHB1dDogdG1wfSk7XG5cdH0pO1xuXHRyZXR1cm4gY2hhaW47XG59XG5mdW5jdGlvbiBtYXAobXNnKXsgdGhpcy50by5uZXh0KG1zZyk7XG5cdHZhciBjYXQgPSB0aGlzLmFzLCBndW4gPSBtc2cuJCwgYXQgPSBndW4uXywgcHV0ID0gbXNnLnB1dCwgdG1wO1xuXHRpZighYXQuc291bCAmJiAhbXNnLiQkKXsgcmV0dXJuIH0gLy8gdGhpcyBsaW5lIHRvb2sgaHVuZHJlZHMgb2YgdHJpZXMgdG8gZmlndXJlIG91dC4gSXQgb25seSB3b3JrcyBpZiBjb3JlIGNoZWNrcyB0byBmaWx0ZXIgb3V0IGFib3ZlIGNoYWlucyBkdXJpbmcgbGluayB0aG8uIFRoaXMgc2F5cyBcIm9ubHkgYm90aGVyIHRvIG1hcCBvbiBhIG5vZGVcIiBmb3IgdGhpcyBsYXllciBvZiB0aGUgY2hhaW4uIElmIHNvbWV0aGluZyBpcyBub3QgYSBub2RlLCBtYXAgc2hvdWxkIG5vdCB3b3JrLlxuXHRpZigodG1wID0gY2F0LmxleCkgJiYgIVN0cmluZy5tYXRjaChtc2cuZ2V0fHwgKHB1dHx8JycpWycuJ10sIHRtcFsnLiddIHx8IHRtcFsnIyddIHx8IHRtcCkpeyByZXR1cm4gfVxuXHRHdW4ub24ubGluayhtc2csIGNhdCk7XG59XG52YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fSwgZXZlbnQgPSB7c3R1bjogbm9vcCwgb2ZmOiBub29wfSwgdTtcblx0IiwiXG5yZXF1aXJlKCcuL3NoaW0nKTtcblxuZnVuY3Rpb24gTWVzaChyb290KXtcblx0dmFyIG1lc2ggPSBmdW5jdGlvbigpe307XG5cdHZhciBvcHQgPSByb290Lm9wdCB8fCB7fTtcblx0b3B0LmxvZyA9IG9wdC5sb2cgfHwgY29uc29sZS5sb2c7XG5cdG9wdC5nYXAgPSBvcHQuZ2FwIHx8IG9wdC53YWl0IHx8IDA7XG5cdG9wdC5tYXggPSBvcHQubWF4IHx8IChvcHQubWVtb3J5PyAob3B0Lm1lbW9yeSAqIDk5OSAqIDk5OSkgOiAzMDAwMDAwMDApICogMC4zO1xuXHRvcHQucGFjayA9IG9wdC5wYWNrIHx8IChvcHQubWF4ICogMC4wMSAqIDAuMDEpO1xuXHRvcHQucHVmZiA9IG9wdC5wdWZmIHx8IDk7IC8vIElERUE6IGRvIGEgc3RhcnQvZW5kIGJlbmNobWFyaywgZGl2aWRlIG9wcy9yZXN1bHQuXG5cdHZhciBwdWZmID0gc2V0VGltZW91dC50dXJuIHx8IHNldFRpbWVvdXQ7XG5cdHZhciBwYXJzZSA9IEpTT04ucGFyc2VBc3luYyB8fCBmdW5jdGlvbih0LGNiLHIpeyB2YXIgdTsgdHJ5eyBjYih1LCBKU09OLnBhcnNlKHQscikpIH1jYXRjaChlKXsgY2IoZSkgfSB9XG5cdHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnlBc3luYyB8fCBmdW5jdGlvbih2LGNiLHIscyl7IHZhciB1OyB0cnl7IGNiKHUsIEpTT04uc3RyaW5naWZ5KHYscixzKSkgfWNhdGNoKGUpeyBjYihlKSB9IH1cblxuXHR2YXIgZHVwID0gcm9vdC5kdXAsIGR1cF9jaGVjayA9IGR1cC5jaGVjaywgZHVwX3RyYWNrID0gZHVwLnRyYWNrO1xuXG5cdHZhciBTVCA9ICtuZXcgRGF0ZSwgTFQgPSBTVDtcblxuXHR2YXIgaGVhciA9IG1lc2guaGVhciA9IGZ1bmN0aW9uKHJhdywgcGVlcil7XG5cdFx0aWYoIXJhdyl7IHJldHVybiB9XG5cdFx0aWYob3B0Lm1heCA8PSByYXcubGVuZ3RoKXsgcmV0dXJuIG1lc2guc2F5KHtkYW06ICchJywgZXJyOiBcIk1lc3NhZ2UgdG9vIGJpZyFcIn0sIHBlZXIpIH1cblx0XHRpZihtZXNoID09PSB0aGlzKXtcblx0XHRcdC8qaWYoJ3N0cmluZycgPT0gdHlwZW9mIHJhdyl7IHRyeXtcblx0XHRcdFx0dmFyIHN0YXQgPSBjb25zb2xlLlNUQVQgfHwge307XG5cdFx0XHRcdC8vY29uc29sZS5sb2coJ0hFQVI6JywgcGVlci5pZCwgKHJhd3x8JycpLnNsaWNlKDAsMjUwKSwgKChyYXd8fCcnKS5sZW5ndGggLyAxMDI0IC8gMTAyNCkudG9GaXhlZCg0KSk7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKHNldFRpbWVvdXQudHVybi5zLmxlbmd0aCwgJ3N0YWNrcycsIHBhcnNlRmxvYXQoKC0oTFQgLSAoTFQgPSArbmV3IERhdGUpKS8xMDAwKS50b0ZpeGVkKDMpKSwgJ3NlYycsIHBhcnNlRmxvYXQoKChMVC1TVCkvMTAwMCAvIDYwKS50b0ZpeGVkKDEpKSwgJ3VwJywgc3RhdC5wZWVyc3x8MCwgJ3BlZXJzJywgc3RhdC5oYXN8fDAsICdoYXMnLCBzdGF0Lm1lbWh1c2VkfHwwLCBzdGF0Lm1lbXVzZWR8fDAsIHN0YXQubWVtYXh8fDAsICdoZWFwIG1lbSBtYXgnKTtcblx0XHRcdH1jYXRjaChlKXsgY29uc29sZS5sb2coJ0RCRyBlcnInLCBlKSB9fSovXG5cdFx0XHRoZWFyLmQgKz0gcmF3Lmxlbmd0aHx8MCA7ICsraGVhci5jIH0gLy8gU1RBVFMhXG5cdFx0dmFyIFMgPSBwZWVyLlNIID0gK25ldyBEYXRlO1xuXHRcdHZhciB0bXAgPSByYXdbMF0sIG1zZztcblx0XHQvL3JhdyAmJiByYXcuc2xpY2UgJiYgY29uc29sZS5sb2coXCJoZWFyOlwiLCAoKHBlZXIud2lyZXx8JycpLmhlYWRlcnN8fCcnKS5vcmlnaW4sIHJhdy5sZW5ndGgsIHJhdy5zbGljZSAmJiByYXcuc2xpY2UoMCw1MCkpOyAvL3RjLWlhbXVuaXF1ZS10Yy1wYWNrYWdlLWRzMVxuXHRcdGlmKCdbJyA9PT0gdG1wKXtcblx0XHRcdHBhcnNlKHJhdywgZnVuY3Rpb24oZXJyLCBtc2cpe1xuXHRcdFx0XHRpZihlcnIgfHwgIW1zZyl7IHJldHVybiBtZXNoLnNheSh7ZGFtOiAnIScsIGVycjogXCJEQU0gSlNPTiBwYXJzZSBlcnJvci5cIn0sIHBlZXIpIH1cblx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVCgrbmV3IERhdGUsIG1zZy5sZW5ndGgsICcjIG9uIGhlYXIgYmF0Y2gnKTtcblx0XHRcdFx0dmFyIFAgPSBvcHQucHVmZjtcblx0XHRcdFx0KGZ1bmN0aW9uIGdvKCl7XG5cdFx0XHRcdFx0dmFyIFMgPSArbmV3IERhdGU7XG5cdFx0XHRcdFx0dmFyIGkgPSAwLCBtOyB3aGlsZShpIDwgUCAmJiAobSA9IG1zZ1tpKytdKSl7IGhlYXIobSwgcGVlcikgfVxuXHRcdFx0XHRcdG1zZyA9IG1zZy5zbGljZShpKTsgLy8gc2xpY2luZyBhZnRlciBpcyBmYXN0ZXIgdGhhbiBzaGlmdGluZyBkdXJpbmcuXG5cdFx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCAnaGVhciBsb29wJyk7XG5cdFx0XHRcdFx0Zmx1c2gocGVlcik7IC8vIGZvcmNlIHNlbmQgYWxsIHN5bmNocm9ub3VzbHkgYmF0Y2hlZCBhY2tzLlxuXHRcdFx0XHRcdGlmKCFtc2cubGVuZ3RoKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRwdWZmKGdvLCAwKTtcblx0XHRcdFx0fSgpKTtcblx0XHRcdH0pO1xuXHRcdFx0cmF3ID0gJyc7IC8vIFxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZigneycgPT09IHRtcCB8fCAoKHJhd1snIyddIHx8IE9iamVjdC5wbGFpbihyYXcpKSAmJiAobXNnID0gcmF3KSkpe1xuXHRcdFx0aWYobXNnKXsgcmV0dXJuIGhlYXIub25lKG1zZywgcGVlciwgUykgfVxuXHRcdFx0cGFyc2UocmF3LCBmdW5jdGlvbihlcnIsIG1zZyl7XG5cdFx0XHRcdGlmKGVyciB8fCAhbXNnKXsgcmV0dXJuIG1lc2guc2F5KHtkYW06ICchJywgZXJyOiBcIkRBTSBKU09OIHBhcnNlIGVycm9yLlwifSwgcGVlcikgfVxuXHRcdFx0XHRoZWFyLm9uZShtc2csIHBlZXIsIFMpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cdGhlYXIub25lID0gZnVuY3Rpb24obXNnLCBwZWVyLCBTKXsgLy8gUyBoZXJlIGlzIHRlbXBvcmFyeSEgVW5kby5cblx0XHR2YXIgaWQsIGhhc2gsIHRtcCwgYXNoLCBEQkc7XG5cdFx0aWYobXNnLkRCRyl7IG1zZy5EQkcgPSBEQkcgPSB7REJHOiBtc2cuREJHfSB9XG5cdFx0REJHICYmIChEQkcuaCA9IFMpO1xuXHRcdERCRyAmJiAoREJHLmhwID0gK25ldyBEYXRlKTtcblx0XHRpZighKGlkID0gbXNnWycjJ10pKXsgaWQgPSBtc2dbJyMnXSA9IFN0cmluZy5yYW5kb20oOSkgfVxuXHRcdGlmKHRtcCA9IGR1cF9jaGVjayhpZCkpeyByZXR1cm4gfVxuXHRcdC8vIERBTSBsb2dpYzpcblx0XHRpZighKGhhc2ggPSBtc2dbJyMjJ10pICYmIGZhbHNlICYmIHUgIT09IG1zZy5wdXQpeyAvKmhhc2ggPSBtc2dbJyMjJ10gPSBUeXBlLm9iai5oYXNoKG1zZy5wdXQpKi8gfSAvLyBkaXNhYmxlIGhhc2hpbmcgZm9yIG5vdyAvLyBUT0RPOiBpbXBvc2Ugd2FybmluZy9wZW5hbHR5IGluc3RlYWQgKD8pXG5cdFx0aWYoaGFzaCAmJiAodG1wID0gbXNnWydAJ10gfHwgKG1zZy5nZXQgJiYgaWQpKSAmJiBkdXAuY2hlY2soYXNoID0gdG1wK2hhc2gpKXsgcmV0dXJuIH0gLy8gSW1hZ2luZSBBIDwtPiBCIDw9PiAoQyAmIEQpLCBDICYgRCByZXBseSB3aXRoIHNhbWUgQUNLIGJ1dCBoYXZlIGRpZmZlcmVudCBJRHMsIEIgY2FuIHVzZSBoYXNoIHRvIGRlZHVwLiBPciBpZiBhIEdFVCBoYXMgYSBoYXNoIGFscmVhZHksIHdlIHNob3VsZG4ndCBBQ0sgaWYgc2FtZS5cblx0XHQobXNnLl8gPSBmdW5jdGlvbigpe30pLnZpYSA9IG1lc2gubGVhcCA9IHBlZXI7XG5cdFx0aWYoKHRtcCA9IG1zZ1snPjwnXSkgJiYgJ3N0cmluZycgPT0gdHlwZW9mIHRtcCl7IHRtcC5zbGljZSgwLDk5KS5zcGxpdCgnLCcpLmZvckVhY2goZnVuY3Rpb24oayl7IHRoaXNba10gPSAxIH0sIChtc2cuXykueW8gPSB7fSkgfSAvLyBQZWVycyBhbHJlYWR5IHNlbnQgdG8sIGRvIG5vdCByZXNlbmQuXG5cdFx0Ly8gREFNIF5cblx0XHRpZih0bXAgPSBtc2cuZGFtKXtcblx0XHRcdGlmKHRtcCA9IG1lc2guaGVhclt0bXBdKXtcblx0XHRcdFx0dG1wKG1zZywgcGVlciwgcm9vdCk7XG5cdFx0XHR9XG5cdFx0XHRkdXBfdHJhY2soaWQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHREQkcgJiYgKERCRy5pcyA9IFMpOyBwZWVyLlNJID0gaWQ7XG5cdFx0cm9vdC5vbignaW4nLCBtZXNoLmxhc3QgPSBtc2cpO1xuXHRcdC8vRUNITyA9IG1zZy5wdXQgfHwgRUNITzsgIShtc2cub2sgIT09IC0zNzQwKSAmJiBtZXNoLnNheSh7b2s6IC0zNzQwLCBwdXQ6IEVDSE8sICdAJzogbXNnWycjJ119LCBwZWVyKTtcblx0XHREQkcgJiYgKERCRy5oZCA9ICtuZXcgRGF0ZSk7XG5cdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCBtc2cuZ2V0PyAnbXNnIGdldCcgOiBtc2cucHV0PyAnbXNnIHB1dCcgOiAnbXNnJyk7XG5cdFx0KHRtcCA9IGR1cF90cmFjayhpZCkpLnZpYSA9IHBlZXI7IC8vIGRvbid0IGRlZHVwIG1lc3NhZ2UgSUQgdGlsbCBhZnRlciwgY2F1c2UgR1VOIGhhcyBpbnRlcm5hbCBkZWR1cCBjaGVjay5cblx0XHRpZihtc2cuZ2V0KXsgdG1wLml0ID0gbXNnIH1cblx0XHRpZihhc2gpeyBkdXBfdHJhY2soYXNoKSB9IC8vZHVwLnRyYWNrKHRtcCtoYXNoLCB0cnVlKS5pdCA9IGl0KG1zZyk7XG5cdFx0bWVzaC5sZWFwID0gbWVzaC5sYXN0ID0gbnVsbDsgLy8gd2FybmluZyEgbWVzaC5sZWFwIGNvdWxkIGJlIGJ1Z2d5LlxuXHR9XG5cdHZhciB0b21hcCA9IGZ1bmN0aW9uKGssaSxtKXttKGssdHJ1ZSl9O1xuXHR2YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fTtcblx0aGVhci5jID0gaGVhci5kID0gMDtcblxuXHQ7KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIFNNSUEgPSAwO1xuXHRcdHZhciBsb29wO1xuXHRcdG1lc2guaGFzaCA9IGZ1bmN0aW9uKG1zZywgcGVlcil7IHZhciBoLCBzLCB0O1xuXHRcdFx0dmFyIFMgPSArbmV3IERhdGU7XG5cdFx0XHRqc29uKG1zZy5wdXQsIGZ1bmN0aW9uIGhhc2goZXJyLCB0ZXh0KXtcblx0XHRcdFx0dmFyIHNzID0gKHMgfHwgKHMgPSB0ID0gdGV4dHx8JycpKS5zbGljZSgwLCAzMjc2OCk7IC8vIDEwMjQgKiAzMlxuXHRcdFx0ICBoID0gU3RyaW5nLmhhc2goc3MsIGgpOyBzID0gcy5zbGljZSgzMjc2OCk7XG5cdFx0XHQgIGlmKHMpeyBwdWZmKGhhc2gsIDApOyByZXR1cm4gfVxuXHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICtuZXcgRGF0ZSAtIFMsICdzYXkganNvbitoYXNoJyk7XG5cdFx0XHQgIG1zZy5fLiRwdXQgPSB0O1xuXHRcdFx0ICBtc2dbJyMjJ10gPSBoO1xuXHRcdFx0ICBzYXkobXNnLCBwZWVyKTtcblx0XHRcdCAgZGVsZXRlIG1zZy5fLiRwdXQ7XG5cdFx0XHR9LCBzb3J0KTtcblx0XHR9XG5cdFx0ZnVuY3Rpb24gc29ydChrLCB2KXsgdmFyIHRtcDtcblx0XHRcdGlmKCEodiBpbnN0YW5jZW9mIE9iamVjdCkpeyByZXR1cm4gdiB9XG5cdFx0XHRPYmplY3Qua2V5cyh2KS5zb3J0KCkuZm9yRWFjaChzb3J0YSwge3RvOiB0bXAgPSB7fSwgb246IHZ9KTtcblx0XHRcdHJldHVybiB0bXA7XG5cdFx0fSBmdW5jdGlvbiBzb3J0YShrKXsgdGhpcy50b1trXSA9IHRoaXMub25ba10gfVxuXG5cdFx0dmFyIHNheSA9IG1lc2guc2F5ID0gZnVuY3Rpb24obXNnLCBwZWVyKXsgdmFyIHRtcDtcblx0XHRcdGlmKCh0bXAgPSB0aGlzKSAmJiAodG1wID0gdG1wLnRvKSAmJiB0bXAubmV4dCl7IHRtcC5uZXh0KG1zZykgfSAvLyBjb21wYXRpYmxlIHdpdGggbWlkZGxld2FyZSBhZGFwdGVycy5cblx0XHRcdGlmKCFtc2cpeyByZXR1cm4gZmFsc2UgfVxuXHRcdFx0dmFyIGlkLCBoYXNoLCByYXcsIGFjayA9IG1zZ1snQCddO1xuLy9pZihvcHQuc3VwZXIgJiYgKCFhY2sgfHwgIW1zZy5wdXQpKXsgcmV0dXJuIH0gLy8gVE9ETzogTUFOSEFUVEFOIFNUVUIgLy9PQlZJT1VTTFkgQlVHISBCdXQgc3F1ZWxjaCByZWxheS4gLy8gOiggZ2V0IG9ubHkgaXMgMTAwJSsgQ1BVIHVzYWdlIDooXG5cdFx0XHR2YXIgbWV0YSA9IG1zZy5ffHwobXNnLl89ZnVuY3Rpb24oKXt9KTtcblx0XHRcdHZhciBEQkcgPSBtc2cuREJHLCBTID0gK25ldyBEYXRlOyBtZXRhLnkgPSBtZXRhLnkgfHwgUzsgaWYoIXBlZXIpeyBEQkcgJiYgKERCRy55ID0gUykgfVxuXHRcdFx0aWYoIShpZCA9IG1zZ1snIyddKSl7IGlkID0gbXNnWycjJ10gPSBTdHJpbmcucmFuZG9tKDkpIH1cblx0XHRcdCFsb29wICYmIGR1cF90cmFjayhpZCk7Ly8uaXQgPSBpdChtc2cpOyAvLyB0cmFjayBmb3IgOSBzZWNvbmRzLCBkZWZhdWx0LiBFYXJ0aDwtPk1hcnMgd291bGQgbmVlZCBtb3JlISAvLyBhbHdheXMgdHJhY2ssIG1heWJlIG1vdmUgdGhpcyB0byB0aGUgJ2FmdGVyJyBsb2dpYyBpZiB3ZSBzcGxpdCBmdW5jdGlvbi5cblx0XHRcdGlmKG1zZy5wdXQgJiYgKG1zZy5lcnIgfHwgKGR1cC5zW2lkXXx8JycpLmVycikpeyByZXR1cm4gZmFsc2UgfSAvLyBUT0RPOiBpbiB0aGVvcnkgd2Ugc2hvdWxkIG5vdCBiZSBhYmxlIHRvIHN0dW4gYSBtZXNzYWdlLCBidXQgZm9yIG5vdyBnb2luZyB0byBjaGVjayBpZiBpdCBjYW4gaGVscCBuZXR3b3JrIHBlcmZvcm1hbmNlIHByZXZlbnRpbmcgaW52YWxpZCBkYXRhIHRvIHJlbGF5LlxuXHRcdFx0aWYoIShoYXNoID0gbXNnWycjIyddKSAmJiB1ICE9PSBtc2cucHV0ICYmICFtZXRhLnZpYSAmJiBhY2speyBtZXNoLmhhc2gobXNnLCBwZWVyKTsgcmV0dXJuIH0gLy8gVE9ETzogU2hvdWxkIGJyb2FkY2FzdHMgYmUgaGFzaGVkP1xuXHRcdFx0aWYoIXBlZXIgJiYgYWNrKXsgcGVlciA9ICgodG1wID0gZHVwLnNbYWNrXSkgJiYgKHRtcC52aWEgfHwgKCh0bXAgPSB0bXAuaXQpICYmICh0bXAgPSB0bXAuXykgJiYgdG1wLnZpYSkpKSB8fCAoKHRtcCA9IG1lc2gubGFzdCkgJiYgYWNrID09PSB0bXBbJyMnXSAmJiBtZXNoLmxlYXApIH0gLy8gd2FybmluZyEgbWVzaC5sZWFwIGNvdWxkIGJlIGJ1Z2d5ISBtZXNoIGxhc3QgY2hlY2sgcmVkdWNlcyB0aGlzLlxuXHRcdFx0aWYoIXBlZXIgJiYgYWNrKXsgLy8gc3RpbGwgbm8gcGVlciwgdGhlbiBhY2sgZGFpc3kgY2hhaW4gbG9zdC5cblx0XHRcdFx0aWYoZHVwLnNbYWNrXSl7IHJldHVybiB9IC8vIGluIGR1cHMgYnV0IG5vIHBlZXIgaGludHMgdGhhdCB0aGlzIHdhcyBhY2sgdG8gc2VsZiwgaWdub3JlLlxuXHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKCtuZXcgRGF0ZSwgKytTTUlBLCAndG90YWwgbm8gcGVlciB0byBhY2sgdG8nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSAvLyBUT0RPOiBUZW1wb3Jhcnk/IElmIGFjayB2aWEgdHJhY2UgaGFzIGJlZW4gbG9zdCwgYWNrcyB3aWxsIGdvIHRvIGFsbCBwZWVycywgd2hpY2ggdHJhc2hlcyBicm93c2VyIGJhbmR3aWR0aC4gTm90IHJlbGF5aW5nIHRoZSBhY2sgd2lsbCBmb3JjZSBzZW5kZXIgdG8gYXNrIGZvciBhY2sgYWdhaW4uIE5vdGUsIHRoaXMgaXMgdGVjaG5pY2FsbHkgd3JvbmcgZm9yIG1lc2ggYmVoYXZpb3IuXG5cdFx0XHRpZighcGVlciAmJiBtZXNoLndheSl7IHJldHVybiBtZXNoLndheShtc2cpIH1cblx0XHRcdERCRyAmJiAoREJHLnloID0gK25ldyBEYXRlKTtcblx0XHRcdGlmKCEocmF3ID0gbWV0YS5yYXcpKXsgbWVzaC5yYXcobXNnLCBwZWVyKTsgcmV0dXJuIH1cblx0XHRcdERCRyAmJiAoREJHLnlyID0gK25ldyBEYXRlKTtcblx0XHRcdGlmKCFwZWVyIHx8ICFwZWVyLmlkKXtcblx0XHRcdFx0aWYoIU9iamVjdC5wbGFpbihwZWVyIHx8IG9wdC5wZWVycykpeyByZXR1cm4gZmFsc2UgfVxuXHRcdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0dmFyIFAgPSBvcHQucHVmZiwgcHMgPSBvcHQucGVlcnMsIHBsID0gT2JqZWN0LmtleXMocGVlciB8fCBvcHQucGVlcnMgfHwge30pOyAvLyBUT0RPOiAua2V5cyggaXMgc2xvd1xuXHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICtuZXcgRGF0ZSAtIFMsICdwZWVyIGtleXMnKTtcblx0XHRcdFx0OyhmdW5jdGlvbiBnbygpe1xuXHRcdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHRcdC8vVHlwZS5vYmoubWFwKHBlZXIgfHwgb3B0LnBlZXJzLCBlYWNoKTsgLy8gaW4gY2FzZSBwZWVyIGlzIGEgcGVlciBsaXN0LlxuXHRcdFx0XHRcdGxvb3AgPSAxOyB2YXIgd3IgPSBtZXRhLnJhdzsgbWV0YS5yYXcgPSByYXc7IC8vIHF1aWNrIHBlcmYgaGFja1xuXHRcdFx0XHRcdHZhciBpID0gMCwgcDsgd2hpbGUoaSA8IDkgJiYgKHAgPSAocGx8fCcnKVtpKytdKSl7XG5cdFx0XHRcdFx0XHRpZighKHAgPSBwc1twXSkpeyBjb250aW51ZSB9XG5cdFx0XHRcdFx0XHRzYXkobXNnLCBwKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bWV0YS5yYXcgPSB3cjsgbG9vcCA9IDA7XG5cdFx0XHRcdFx0cGwgPSBwbC5zbGljZShpKTsgLy8gc2xpY2luZyBhZnRlciBpcyBmYXN0ZXIgdGhhbiBzaGlmdGluZyBkdXJpbmcuXG5cdFx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCAnc2F5IGxvb3AnKTtcblx0XHRcdFx0XHRpZighcGwubGVuZ3RoKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRwdWZmKGdvLCAwKTtcblx0XHRcdFx0XHRhY2sgJiYgZHVwX3RyYWNrKGFjayk7IC8vIGtlZXAgZm9yIGxhdGVyXG5cdFx0XHRcdH0oKSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdC8vIFRPRE86IFBFUkY6IGNvbnNpZGVyIHNwbGl0dGluZyBmdW5jdGlvbiBoZXJlLCBzbyBzYXkgbG9vcHMgZG8gbGVzcyB3b3JrLlxuXHRcdFx0aWYoIXBlZXIud2lyZSAmJiBtZXNoLndpcmUpeyBtZXNoLndpcmUocGVlcikgfVxuXHRcdFx0aWYoaWQgPT09IHBlZXIubGFzdCl7IHJldHVybiB9IHBlZXIubGFzdCA9IGlkOyAgLy8gd2FzIGl0IGp1c3Qgc2VudD9cblx0XHRcdGlmKHBlZXIgPT09IG1ldGEudmlhKXsgcmV0dXJuIGZhbHNlIH0gLy8gZG9uJ3Qgc2VuZCBiYWNrIHRvIHNlbGYuXG5cdFx0XHRpZigodG1wID0gbWV0YS55bykgJiYgKHRtcFtwZWVyLnVybF0gfHwgdG1wW3BlZXIucGlkXSB8fCB0bXBbcGVlci5pZF0pIC8qJiYgIW8qLyl7IHJldHVybiBmYWxzZSB9XG5cdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICgoREJHfHxtZXRhKS55cCA9ICtuZXcgRGF0ZSkgLSAobWV0YS55IHx8IFMpLCAnc2F5IHByZXAnKTtcblx0XHRcdCFsb29wICYmIGFjayAmJiBkdXBfdHJhY2soYWNrKTsgLy8gc3RyZWFtaW5nIGxvbmcgcmVzcG9uc2VzIG5lZWRzIHRvIGtlZXAgYWxpdmUgdGhlIGFjay5cblx0XHRcdGlmKHBlZXIuYmF0Y2gpe1xuXHRcdFx0XHRwZWVyLnRhaWwgPSAodG1wID0gcGVlci50YWlsIHx8IDApICsgcmF3Lmxlbmd0aDtcblx0XHRcdFx0aWYocGVlci50YWlsIDw9IG9wdC5wYWNrKXtcblx0XHRcdFx0XHRwZWVyLmJhdGNoICs9ICh0bXA/JywnOicnKStyYXc7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZsdXNoKHBlZXIpO1xuXHRcdFx0fVxuXHRcdFx0cGVlci5iYXRjaCA9ICdbJzsgLy8gUHJldmVudHMgZG91YmxlIEpTT04hXG5cdFx0XHR2YXIgU1QgPSArbmV3IERhdGU7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoU1QsICtuZXcgRGF0ZSAtIFNULCAnMG1zIFRPJyk7XG5cdFx0XHRcdGZsdXNoKHBlZXIpO1xuXHRcdFx0fSwgb3B0LmdhcCk7IC8vIFRPRE86IHF1ZXVpbmcvYmF0Y2hpbmcgbWlnaHQgYmUgYmFkIGZvciBsb3ctbGF0ZW5jeSB2aWRlbyBnYW1lIHBlcmZvcm1hbmNlISBBbGxvdyBvcHQgb3V0P1xuXHRcdFx0c2VuZChyYXcsIHBlZXIpO1xuXHRcdFx0Y29uc29sZS5TVEFUICYmIChhY2sgPT09IHBlZXIuU0kpICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBwZWVyLlNILCAnc2F5IGFjaycpO1xuXHRcdH1cblx0XHRtZXNoLnNheS5jID0gbWVzaC5zYXkuZCA9IDA7XG5cdFx0Ly8gVE9ETzogdGhpcyBjYXVzZWQgYSBvdXQtb2YtbWVtb3J5IGNyYXNoIVxuXHRcdG1lc2gucmF3ID0gZnVuY3Rpb24obXNnLCBwZWVyKXsgLy8gVE9ETzogQ2xlYW4gdGhpcyB1cCAvIGRlbGV0ZSBpdCAvIG1vdmUgbG9naWMgb3V0IVxuXHRcdFx0aWYoIW1zZyl7IHJldHVybiAnJyB9XG5cdFx0XHR2YXIgbWV0YSA9IChtc2cuXykgfHwge30sIHB1dCwgdG1wO1xuXHRcdFx0aWYodG1wID0gbWV0YS5yYXcpeyByZXR1cm4gdG1wIH1cblx0XHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiBtc2cpeyByZXR1cm4gbXNnIH1cblx0XHRcdHZhciBoYXNoID0gbXNnWycjIyddLCBhY2sgPSBtc2dbJ0AnXTtcblx0XHRcdGlmKGhhc2ggJiYgYWNrKXtcblx0XHRcdFx0aWYoIW1ldGEudmlhICYmIGR1cF9jaGVjayhhY2sraGFzaCkpeyByZXR1cm4gZmFsc2UgfSAvLyBmb3Igb3VyIG93biBvdXQgbWVzc2FnZXMsIG1lbW9yeSAmIHN0b3JhZ2UgbWF5IGFjayB0aGUgc2FtZSB0aGluZywgc28gZGVkdXAgdGhhdC4gVGhvIGlmIHZpYSBhbm90aGVyIHBlZXIsIHdlIGFscmVhZHkgdHJhY2tlZCBpdCB1cG9uIGhlYXJpbmcsIHNvIHRoaXMgd2lsbCBhbHdheXMgdHJpZ2dlciBmYWxzZSBwb3NpdGl2ZXMsIHNvIGRvbid0IGRvIHRoYXQhXG5cdFx0XHRcdGlmKCh0bXAgPSAoZHVwLnNbYWNrXXx8JycpLml0KSB8fCAoKHRtcCA9IG1lc2gubGFzdCkgJiYgYWNrID09PSB0bXBbJyMnXSkpe1xuXHRcdFx0XHRcdGlmKGhhc2ggPT09IHRtcFsnIyMnXSl7IHJldHVybiBmYWxzZSB9IC8vIGlmIGFzayBoYXMgYSBtYXRjaGluZyBoYXNoLCBhY2tpbmcgaXMgb3B0aW9uYWwuXG5cdFx0XHRcdFx0aWYoIXRtcFsnIyMnXSl7IHRtcFsnIyMnXSA9IGhhc2ggfSAvLyBpZiBub25lLCBhZGQgb3VyIGhhc2ggdG8gYXNrIHNvIGFueW9uZSB3ZSByZWxheSB0byBjYW4gZGVkdXAuIC8vIE5PVEU6IE1heSBvbmx5IGNoZWNrIGFnYWluc3QgMXN0IGFjayBjaHVuaywgMm5kKyB3b24ndCBrbm93IGFuZCBzdGlsbCBzdHJlYW0gYmFjayB0byByZWxheWluZyBwZWVycyB3aGljaCBtYXkgdGhlbiBkZWR1cC4gQW55IHdheSB0byBmaXggdGhpcyB3YXN0ZWQgYmFuZHdpZHRoPyBJIGd1ZXNzIGZvcmNlIHJhdGUgbGltaXRpbmcgYnJlYWtpbmcgY2hhbmdlLCB0aGF0IGFza2luZyBwZWVyIGhhcyB0byBhc2sgZm9yIG5leHQgbGV4aWNhbCBjaHVuay5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYoIW1zZy5kYW0pe1xuXHRcdFx0XHR2YXIgaSA9IDAsIHRvID0gW107IHRtcCA9IG9wdC5wZWVycztcblx0XHRcdFx0Zm9yKHZhciBrIGluIHRtcCl7IHZhciBwID0gdG1wW2tdOyAvLyBUT0RPOiBNYWtlIGl0IHVwIHBlZXJzIGluc3RlYWQhXG5cdFx0XHRcdFx0dG8ucHVzaChwLnVybCB8fCBwLnBpZCB8fCBwLmlkKTtcblx0XHRcdFx0XHRpZigrK2kgPiA2KXsgYnJlYWsgfVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKGkgPiAxKXsgbXNnWyc+PCddID0gdG8uam9pbigpIH0gLy8gVE9ETzogQlVHISBUaGlzIGdldHMgc2V0IHJlZ2FyZGxlc3Mgb2YgcGVlcnMgc2VudCB0byEgRGV0ZWN0P1xuXHRcdFx0fVxuXHRcdFx0aWYocHV0ID0gbWV0YS4kcHV0KXtcblx0XHRcdFx0dG1wID0ge307IE9iamVjdC5rZXlzKG1zZykuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnW2tdIH0pO1xuXHRcdFx0XHR0bXAucHV0ID0gJzpdKShbOic7XG5cdFx0XHRcdGpzb24odG1wLCBmdW5jdGlvbihlcnIsIHJhdyl7XG5cdFx0XHRcdFx0aWYoZXJyKXsgcmV0dXJuIH0gLy8gVE9ETzogSGFuZGxlISFcblx0XHRcdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0XHR0bXAgPSByYXcuaW5kZXhPZignXCJwdXRcIjpcIjpdKShbOlwiJyk7XG5cdFx0XHRcdFx0cmVzKHUsIHJhdyA9IHJhdy5zbGljZSgwLCB0bXArNikgKyBwdXQgKyByYXcuc2xpY2UodG1wICsgMTQpKTtcblx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICtuZXcgRGF0ZSAtIFMsICdzYXkgc2xpY2UnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGpzb24obXNnLCByZXMpO1xuXHRcdFx0ZnVuY3Rpb24gcmVzKGVyciwgcmF3KXtcblx0XHRcdFx0aWYoZXJyKXsgcmV0dXJuIH0gLy8gVE9ETzogSGFuZGxlISFcblx0XHRcdFx0bWV0YS5yYXcgPSByYXc7IC8vaWYobWV0YSAmJiAocmF3fHwnJykubGVuZ3RoIDwgKDk5OSAqIDk5KSl7IG1ldGEucmF3ID0gcmF3IH0gLy8gSE5QRVJGOiBJZiBzdHJpbmcgdG9vIGJpZywgZG9uJ3Qga2VlcCBpbiBtZW1vcnkuXG5cdFx0XHRcdHNheShtc2csIHBlZXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSgpKTtcblxuXHRmdW5jdGlvbiBmbHVzaChwZWVyKXtcblx0XHR2YXIgdG1wID0gcGVlci5iYXRjaCwgdCA9ICdzdHJpbmcnID09IHR5cGVvZiB0bXAsIGw7XG5cdFx0aWYodCl7IHRtcCArPSAnXScgfS8vIFRPRE86IFByZXZlbnQgZG91YmxlIEpTT04hXG5cdFx0cGVlci5iYXRjaCA9IHBlZXIudGFpbCA9IG51bGw7XG5cdFx0aWYoIXRtcCl7IHJldHVybiB9XG5cdFx0aWYodD8gMyA+IHRtcC5sZW5ndGggOiAhdG1wLmxlbmd0aCl7IHJldHVybiB9IC8vIFRPRE86IF5cblx0XHRpZighdCl7dHJ5e3RtcCA9ICgxID09PSB0bXAubGVuZ3RoPyB0bXBbMF0gOiBKU09OLnN0cmluZ2lmeSh0bXApKTtcblx0XHR9Y2F0Y2goZSl7cmV0dXJuIG9wdC5sb2coJ0RBTSBKU09OIHN0cmluZ2lmeSBlcnJvcicsIGUpfX1cblx0XHRpZighdG1wKXsgcmV0dXJuIH1cblx0XHRzZW5kKHRtcCwgcGVlcik7XG5cdH1cblx0Ly8gZm9yIG5vdyAtIGZpbmQgYmV0dGVyIHBsYWNlIGxhdGVyLlxuXHRmdW5jdGlvbiBzZW5kKHJhdywgcGVlcil7IHRyeXtcblx0XHQvL2NvbnNvbGUubG9nKCdTQVk6JywgcGVlci5pZCwgKHJhd3x8JycpLnNsaWNlKDAsMjUwKSwgKChyYXd8fCcnKS5sZW5ndGggLyAxMDI0IC8gMTAyNCkudG9GaXhlZCg0KSk7XG5cdFx0dmFyIHdpcmUgPSBwZWVyLndpcmU7XG5cdFx0aWYocGVlci5zYXkpe1xuXHRcdFx0cGVlci5zYXkocmF3KTtcblx0XHR9IGVsc2Vcblx0XHRpZih3aXJlLnNlbmQpe1xuXHRcdFx0d2lyZS5zZW5kKHJhdyk7XG5cdFx0fVxuXHRcdG1lc2guc2F5LmQgKz0gcmF3Lmxlbmd0aHx8MDsgKyttZXNoLnNheS5jOyAvLyBTVEFUUyFcblx0fWNhdGNoKGUpe1xuXHRcdChwZWVyLnF1ZXVlID0gcGVlci5xdWV1ZSB8fCBbXSkucHVzaChyYXcpO1xuXHR9fVxuXG5cdG1lc2guaGkgPSBmdW5jdGlvbihwZWVyKXtcblx0XHR2YXIgdG1wID0gcGVlci53aXJlIHx8IHt9O1xuXHRcdGlmKHBlZXIuaWQpe1xuXHRcdFx0b3B0LnBlZXJzW3BlZXIudXJsIHx8IHBlZXIuaWRdID0gcGVlcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dG1wID0gcGVlci5pZCA9IHBlZXIuaWQgfHwgU3RyaW5nLnJhbmRvbSg5KTtcblx0XHRcdG1lc2guc2F5KHtkYW06ICc/JywgcGlkOiByb290Lm9wdC5waWR9LCBvcHQucGVlcnNbdG1wXSA9IHBlZXIpO1xuXHRcdFx0ZGVsZXRlIGR1cC5zW3BlZXIubGFzdF07IC8vIElNUE9SVEFOVDogc2VlIGh0dHBzOi8vZ3VuLmVjby9kb2NzL0RBTSNzZWxmXG5cdFx0fVxuXHRcdHBlZXIubWV0ID0gcGVlci5tZXQgfHwgKyhuZXcgRGF0ZSk7XG5cdFx0aWYoIXRtcC5oaWVkKXsgcm9vdC5vbih0bXAuaGllZCA9ICdoaScsIHBlZXIpIH1cblx0XHQvLyBAcm9nb3dza2kgSSBuZWVkIHRoaXMgaGVyZSBieSBkZWZhdWx0IGZvciBub3cgdG8gZml4IGdvMWRmaXNoJ3MgYnVnXG5cdFx0dG1wID0gcGVlci5xdWV1ZTsgcGVlci5xdWV1ZSA9IFtdO1xuXHRcdHNldFRpbWVvdXQuZWFjaCh0bXB8fFtdLGZ1bmN0aW9uKG1zZyl7XG5cdFx0XHRzZW5kKG1zZywgcGVlcik7XG5cdFx0fSwwLDkpO1xuXHRcdC8vVHlwZS5vYmoubmF0aXZlICYmIFR5cGUub2JqLm5hdGl2ZSgpOyAvLyBkaXJ0eSBwbGFjZSB0byBjaGVjayBpZiBvdGhlciBKUyBwb2xsdXRlZC5cblx0fVxuXHRtZXNoLmJ5ZSA9IGZ1bmN0aW9uKHBlZXIpe1xuXHRcdHJvb3Qub24oJ2J5ZScsIHBlZXIpO1xuXHRcdHZhciB0bXAgPSArKG5ldyBEYXRlKTsgdG1wID0gKHRtcCAtIChwZWVyLm1ldHx8dG1wKSk7XG5cdFx0bWVzaC5ieWUudGltZSA9ICgobWVzaC5ieWUudGltZSB8fCB0bXApICsgdG1wKSAvIDI7XG5cdH1cblx0bWVzaC5oZWFyWychJ10gPSBmdW5jdGlvbihtc2csIHBlZXIpeyBvcHQubG9nKCdFcnJvcjonLCBtc2cuZXJyKSB9XG5cdG1lc2guaGVhclsnPyddID0gZnVuY3Rpb24obXNnLCBwZWVyKXtcblx0XHRpZihtc2cucGlkKXtcblx0XHRcdGlmKCFwZWVyLnBpZCl7IHBlZXIucGlkID0gbXNnLnBpZCB9XG5cdFx0XHRpZihtc2dbJ0AnXSl7IHJldHVybiB9XG5cdFx0fVxuXHRcdG1lc2guc2F5KHtkYW06ICc/JywgcGlkOiBvcHQucGlkLCAnQCc6IG1zZ1snIyddfSwgcGVlcik7XG5cdFx0ZGVsZXRlIGR1cC5zW3BlZXIubGFzdF07IC8vIElNUE9SVEFOVDogc2VlIGh0dHBzOi8vZ3VuLmVjby9kb2NzL0RBTSNzZWxmXG5cdH1cblxuXHRyb290Lm9uKCdjcmVhdGUnLCBmdW5jdGlvbihyb290KXtcblx0XHRyb290Lm9wdC5waWQgPSByb290Lm9wdC5waWQgfHwgU3RyaW5nLnJhbmRvbSg5KTtcblx0XHR0aGlzLnRvLm5leHQocm9vdCk7XG5cdFx0cm9vdC5vbignb3V0JywgbWVzaC5zYXkpO1xuXHR9KTtcblxuXHRyb290Lm9uKCdieWUnLCBmdW5jdGlvbihwZWVyLCB0bXApe1xuXHRcdHBlZXIgPSBvcHQucGVlcnNbcGVlci5pZCB8fCBwZWVyXSB8fCBwZWVyO1xuXHRcdHRoaXMudG8ubmV4dChwZWVyKTtcblx0XHRwZWVyLmJ5ZT8gcGVlci5ieWUoKSA6ICh0bXAgPSBwZWVyLndpcmUpICYmIHRtcC5jbG9zZSAmJiB0bXAuY2xvc2UoKTtcblx0XHRkZWxldGUgb3B0LnBlZXJzW3BlZXIuaWRdO1xuXHRcdHBlZXIud2lyZSA9IG51bGw7XG5cdH0pO1xuXG5cdHZhciBnZXRzID0ge307XG5cdHJvb3Qub24oJ2J5ZScsIGZ1bmN0aW9uKHBlZXIsIHRtcCl7IHRoaXMudG8ubmV4dChwZWVyKTtcblx0XHRpZih0bXAgPSBjb25zb2xlLlNUQVQpeyB0bXAucGVlcnMgPSAodG1wLnBlZXJzIHx8IDApIC0gMTsgfVxuXHRcdGlmKCEodG1wID0gcGVlci51cmwpKXsgcmV0dXJuIH0gZ2V0c1t0bXBdID0gdHJ1ZTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGRlbGV0ZSBnZXRzW3RtcF0gfSxvcHQubGFjayB8fCA5MDAwKTtcblx0fSk7XG5cdHJvb3Qub24oJ2hpJywgZnVuY3Rpb24ocGVlciwgdG1wKXsgdGhpcy50by5uZXh0KHBlZXIpO1xuXHRcdGlmKHRtcCA9IGNvbnNvbGUuU1RBVCl7IHRtcC5wZWVycyA9ICh0bXAucGVlcnMgfHwgMCkgKyAxIH1cblx0XHRpZighKHRtcCA9IHBlZXIudXJsKSB8fCAhZ2V0c1t0bXBdKXsgcmV0dXJuIH0gZGVsZXRlIGdldHNbdG1wXTtcblx0XHRpZihvcHQuc3VwZXIpeyByZXR1cm4gfSAvLyB0ZW1wb3JhcnkgKD8pIHVudGlsIHdlIGhhdmUgYmV0dGVyIGZpeC9zb2x1dGlvbj9cblx0XHRzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMocm9vdC5uZXh0KSwgZnVuY3Rpb24oc291bCl7IHZhciBub2RlID0gcm9vdC5uZXh0W3NvdWxdOyAvLyBUT0RPOiAua2V5cyggaXMgc2xvd1xuXHRcdFx0dG1wID0ge307IHRtcFtzb3VsXSA9IHJvb3QuZ3JhcGhbc291bF07IHRtcCA9IFN0cmluZy5oYXNoKHRtcCk7IC8vIFRPRE86IEJVRyEgVGhpcyBpcyBicm9rZW4uXG5cdFx0XHRtZXNoLnNheSh7JyMjJzogdG1wLCBnZXQ6IHsnIyc6IHNvdWx9fSwgcGVlcik7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiBtZXNoO1xufVxuXHQgIHZhciBlbXB0eSA9IHt9LCBvayA9IHRydWUsIHU7XG5cblx0ICB0cnl7IG1vZHVsZS5leHBvcnRzID0gTWVzaCB9Y2F0Y2goZSl7fVxuXG5cdCIsIlxudmFyIEd1biA9IHJlcXVpcmUoJy4vaW5kZXgnKTtcbkd1bi5jaGFpbi5vbiA9IGZ1bmN0aW9uKHRhZywgYXJnLCBlYXMsIGFzKXsgLy8gZG9uJ3QgcmV3cml0ZSFcblx0dmFyIGd1biA9IHRoaXMsIGNhdCA9IGd1bi5fLCByb290ID0gY2F0LnJvb3QsIGFjdCwgb2ZmLCBpZCwgdG1wO1xuXHRpZih0eXBlb2YgdGFnID09PSAnc3RyaW5nJyl7XG5cdFx0aWYoIWFyZyl7IHJldHVybiBjYXQub24odGFnKSB9XG5cdFx0YWN0ID0gY2F0Lm9uKHRhZywgYXJnLCBlYXMgfHwgY2F0LCBhcyk7XG5cdFx0aWYoZWFzICYmIGVhcy4kKXtcblx0XHRcdChlYXMuc3VicyB8fCAoZWFzLnN1YnMgPSBbXSkpLnB1c2goYWN0KTtcblx0XHR9XG5cdFx0cmV0dXJuIGd1bjtcblx0fVxuXHR2YXIgb3B0ID0gYXJnO1xuXHQob3B0ID0gKHRydWUgPT09IG9wdCk/IHtjaGFuZ2U6IHRydWV9IDogb3B0IHx8IHt9KS5ub3QgPSAxOyBvcHQub24gPSAxO1xuXHQvL29wdC5hdCA9IGNhdDtcblx0Ly9vcHQub2sgPSB0YWc7XG5cdC8vb3B0Lmxhc3QgPSB7fTtcblx0dmFyIHdhaXQgPSB7fTsgLy8gY2FuIHdlIGFzc2lnbiB0aGlzIHRvIHRoZSBhdCBpbnN0ZWFkLCBsaWtlIGluIG9uY2U/XG5cdGd1bi5nZXQodGFnLCBvcHQpO1xuXHQvKmd1bi5nZXQoZnVuY3Rpb24gb24oZGF0YSxrZXksbXNnLGV2ZSl7IHZhciAkID0gdGhpcztcblx0XHRpZih0bXAgPSByb290LmhhdGNoKXsgLy8gcXVpY2sgaGFjayFcblx0XHRcdGlmKHdhaXRbJC5fLmlkXSl7IHJldHVybiB9IHdhaXRbJC5fLmlkXSA9IDE7XG5cdFx0XHR0bXAucHVzaChmdW5jdGlvbigpe29uLmNhbGwoJCwgZGF0YSxrZXksbXNnLGV2ZSl9KTtcblx0XHRcdHJldHVybjtcblx0XHR9OyB3YWl0ID0ge307IC8vIGVuZCBxdWljayBoYWNrLlxuXHRcdHRhZy5jYWxsKCQsIGRhdGEsa2V5LG1zZyxldmUpO1xuXHR9LCBvcHQpOyAvLyBUT0RPOiBQRVJGISBFdmVudCBsaXN0ZW5lciBsZWFrISEhPyovXG5cdC8qXG5cdGZ1bmN0aW9uIG9uZShtc2csIGV2ZSl7XG5cdFx0aWYob25lLnN0dW4peyByZXR1cm4gfVxuXHRcdHZhciBhdCA9IG1zZy4kLl8sIGRhdGEgPSBhdC5wdXQsIHRtcDtcblx0XHRpZih0bXAgPSBhdC5saW5rKXsgZGF0YSA9IHJvb3QuJC5nZXQodG1wKS5fLnB1dCB9XG5cdFx0aWYob3B0Lm5vdD09PXUgJiYgdSA9PT0gZGF0YSl7IHJldHVybiB9XG5cdFx0aWYob3B0LnN0dW49PT11ICYmICh0bXAgPSByb290LnN0dW4pICYmICh0bXAgPSB0bXBbYXQuaWRdIHx8IHRtcFthdC5iYWNrLmlkXSkgJiYgIXRtcC5lbmQpeyAvLyBSZW1lbWJlciEgSWYgeW91IHBvcnQgdGhpcyBpbnRvIGAuZ2V0KGNiYCBtYWtlIHN1cmUgeW91IGFsbG93IHN0dW46MCBza2lwIG9wdGlvbiBmb3IgYC5wdXQoYC5cblx0XHRcdHRtcFtpZF0gPSBmdW5jdGlvbigpe29uZShtc2csZXZlKX07XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vdG1wID0gb25lLndhaXQgfHwgKG9uZS53YWl0ID0ge30pOyBjb25zb2xlLmxvZyh0bXBbYXQuaWRdID09PSAnJyk7IGlmKHRtcFthdC5pZF0gIT09ICcnKXsgdG1wW2F0LmlkXSA9IHRtcFthdC5pZF0gfHwgc2V0VGltZW91dChmdW5jdGlvbigpe3RtcFthdC5pZF09Jyc7b25lKG1zZyxldmUpfSwxKTsgcmV0dXJuIH0gZGVsZXRlIHRtcFthdC5pZF07XG5cdFx0Ly8gY2FsbDpcblx0XHRpZihvcHQuYXMpe1xuXHRcdFx0b3B0Lm9rLmNhbGwob3B0LmFzLCBtc2csIGV2ZSB8fCBvbmUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvcHQub2suY2FsbChhdC4kLCBkYXRhLCBtc2cuZ2V0IHx8IGF0LmdldCwgbXNnLCBldmUgfHwgb25lKTtcblx0XHR9XG5cdH07XG5cdG9uZS5hdCA9IGNhdDtcblx0KGNhdC5hY3R8fChjYXQuYWN0PXt9KSlbaWQgPSBTdHJpbmcucmFuZG9tKDcpXSA9IG9uZTtcblx0b25lLm9mZiA9IGZ1bmN0aW9uKCl7IG9uZS5zdHVuID0gMTsgaWYoIWNhdC5hY3QpeyByZXR1cm4gfSBkZWxldGUgY2F0LmFjdFtpZF0gfVxuXHRjYXQub24oJ291dCcsIHtnZXQ6IHt9fSk7Ki9cblx0cmV0dXJuIGd1bjtcbn1cbi8vIFJ1bGVzOlxuLy8gMS4gSWYgY2FjaGVkLCBzaG91bGQgYmUgZmFzdCwgYnV0IG5vdCByZWFkIHdoaWxlIHdyaXRlLlxuLy8gMi4gU2hvdWxkIG5vdCByZXRyaWdnZXIgb3RoZXIgbGlzdGVuZXJzLCBzaG91bGQgZ2V0IHRyaWdnZXJlZCBldmVuIGlmIG5vdGhpbmcgZm91bmQuXG4vLyAzLiBJZiB0aGUgc2FtZSBjYWxsYmFjayBwYXNzZWQgdG8gbWFueSBkaWZmZXJlbnQgb25jZSBjaGFpbnMsIGVhY2ggc2hvdWxkIHJlc29sdmUgLSBhbiB1bnN1YnNjcmliZSBmcm9tIHRoZSBzYW1lIGNhbGxiYWNrIHNob3VsZCBub3QgZWZmZWN0IHRoZSBzdGF0ZSBvZiB0aGUgb3RoZXIgcmVzb2x2aW5nIGNoYWlucywgaWYgeW91IGRvIHdhbnQgdG8gY2FuY2VsIHRoZW0gYWxsIGVhcmx5IHlvdSBzaG91bGQgbXV0YXRlIHRoZSBjYWxsYmFjayBpdHNlbGYgd2l0aCBhIGZsYWcgJiBjaGVjayBmb3IgaXQgYXQgdG9wIG9mIGNhbGxiYWNrXG5HdW4uY2hhaW4ub25jZSA9IGZ1bmN0aW9uKGNiLCBvcHQpeyBvcHQgPSBvcHQgfHwge307IC8vIGF2b2lkIHJld3JpdGluZ1xuXHRpZighY2IpeyByZXR1cm4gbm9uZSh0aGlzLG9wdCkgfVxuXHR2YXIgZ3VuID0gdGhpcywgY2F0ID0gZ3VuLl8sIHJvb3QgPSBjYXQucm9vdCwgZGF0YSA9IGNhdC5wdXQsIGlkID0gU3RyaW5nLnJhbmRvbSg3KSwgb25lLCB0bXA7XG5cdGd1bi5nZXQoZnVuY3Rpb24oZGF0YSxrZXksbXNnLGV2ZSl7XG5cdFx0dmFyICQgPSB0aGlzLCBhdCA9ICQuXywgb25lID0gKGF0Lm9uZXx8KGF0Lm9uZT17fSkpO1xuXHRcdGlmKGV2ZS5zdHVuKXsgcmV0dXJuIH0gaWYoJycgPT09IG9uZVtpZF0peyByZXR1cm4gfVxuXHRcdGlmKHRydWUgPT09ICh0bXAgPSBHdW4udmFsaWQoZGF0YSkpKXsgb25jZSgpOyByZXR1cm4gfVxuXHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiB0bXApeyByZXR1cm4gfSAvLyBUT0RPOiBCVUc/IFdpbGwgdGhpcyBhbHdheXMgbG9hZD9cblx0XHRjbGVhclRpbWVvdXQoKGNhdC5vbmV8fCcnKVtpZF0pOyAvLyBjbGVhciBcIm5vdCBmb3VuZFwiIHNpbmNlIHRoZXkgb25seSBnZXQgc2V0IG9uIGNhdC5cblx0XHRjbGVhclRpbWVvdXQob25lW2lkXSk7IG9uZVtpZF0gPSBzZXRUaW1lb3V0KG9uY2UsIG9wdC53YWl0fHw5OSk7IC8vIFRPRE86IEJ1Zz8gVGhpcyBkb2Vzbid0IGhhbmRsZSBwbHVyYWwgY2hhaW5zLlxuXHRcdGZ1bmN0aW9uIG9uY2UoKXtcblx0XHRcdGlmKCFhdC5oYXMgJiYgIWF0LnNvdWwpeyBhdCA9IHtwdXQ6IGRhdGEsIGdldDoga2V5fSB9IC8vIGhhbmRsZXMgbm9uLWNvcmUgbWVzc2FnZXMuXG5cdFx0XHRpZih1ID09PSAodG1wID0gYXQucHV0KSl7IHRtcCA9ICgobXNnLiQkfHwnJykuX3x8JycpLnB1dCB9XG5cdFx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgR3VuLnZhbGlkKHRtcCkpeyB0bXAgPSByb290LiQuZ2V0KHRtcCkuXy5wdXQ7IGlmKHRtcCA9PT0gdSl7cmV0dXJufSB9XG5cdFx0XHRpZihldmUuc3R1bil7IHJldHVybiB9IGlmKCcnID09PSBvbmVbaWRdKXsgcmV0dXJuIH0gb25lW2lkXSA9ICcnO1xuXHRcdFx0aWYoY2F0LnNvdWwgfHwgY2F0Lmhhcyl7IGV2ZS5vZmYoKSB9IC8vIFRPRE86IFBsdXJhbCBjaGFpbnM/IC8vIGVsc2UgeyA/Lm9mZigpIH0gLy8gYmV0dGVyIHRoYW4gb25lIGNoZWNrP1xuXHRcdFx0Y2IuY2FsbCgkLCB0bXAsIGF0LmdldCk7XG5cdFx0fTtcblx0fSwge29uOiAxfSk7XG5cdHJldHVybiBndW47XG59XG5mdW5jdGlvbiBub25lKGd1bixvcHQsY2hhaW4pe1xuXHRHdW4ubG9nLm9uY2UoXCJ2YWxvbmNlXCIsIFwiQ2hhaW5hYmxlIHZhbCBpcyBleHBlcmltZW50YWwsIGl0cyBiZWhhdmlvciBhbmQgQVBJIG1heSBjaGFuZ2UgbW92aW5nIGZvcndhcmQuIFBsZWFzZSBwbGF5IHdpdGggaXQgYW5kIHJlcG9ydCBidWdzIGFuZCBpZGVhcyBvbiBob3cgdG8gaW1wcm92ZSBpdC5cIik7XG5cdChjaGFpbiA9IGd1bi5jaGFpbigpKS5fLm5peCA9IGd1bi5vbmNlKGZ1bmN0aW9uKGRhdGEsIGtleSl7IGNoYWluLl8ub24oJ2luJywgdGhpcy5fKSB9KTtcblx0Y2hhaW4uXy5sZXggPSBndW4uXy5sZXg7IC8vIFRPRE86IEJldHRlciBhcHByb2FjaCBpbiBmdXR1cmU/IFRoaXMgaXMgcXVpY2sgZm9yIG5vdy5cblx0cmV0dXJuIGNoYWluO1xufVxuXG5HdW4uY2hhaW4ub2ZmID0gZnVuY3Rpb24oKXtcblx0Ly8gbWFrZSBvZmYgbW9yZSBhZ2dyZXNzaXZlLiBXYXJuaW5nLCBpdCBtaWdodCBiYWNrZmlyZSFcblx0dmFyIGd1biA9IHRoaXMsIGF0ID0gZ3VuLl8sIHRtcDtcblx0dmFyIGNhdCA9IGF0LmJhY2s7XG5cdGlmKCFjYXQpeyByZXR1cm4gfVxuXHRhdC5hY2sgPSAwOyAvLyBzbyBjYW4gcmVzdWJzY3JpYmUuXG5cdGlmKHRtcCA9IGNhdC5uZXh0KXtcblx0XHRpZih0bXBbYXQuZ2V0XSl7XG5cdFx0XHRkZWxldGUgdG1wW2F0LmdldF07XG5cdFx0fSBlbHNlIHtcblxuXHRcdH1cblx0fVxuXHQvLyBUT0RPOiBkZWxldGUgY2F0Lm9uZVttYXAuaWRdP1xuXHRpZih0bXAgPSBjYXQuYXNrKXtcblx0XHRkZWxldGUgdG1wW2F0LmdldF07XG5cdH1cblx0aWYodG1wID0gY2F0LnB1dCl7XG5cdFx0ZGVsZXRlIHRtcFthdC5nZXRdO1xuXHR9XG5cdGlmKHRtcCA9IGF0LnNvdWwpe1xuXHRcdGRlbGV0ZSBjYXQucm9vdC5ncmFwaFt0bXBdO1xuXHR9XG5cdGlmKHRtcCA9IGF0Lm1hcCl7XG5cdFx0T2JqZWN0LmtleXModG1wKS5mb3JFYWNoKGZ1bmN0aW9uKGksYXQpeyBhdCA9IHRtcFtpXTsgLy9vYmpfbWFwKHRtcCwgZnVuY3Rpb24oYXQpe1xuXHRcdFx0aWYoYXQubGluayl7XG5cdFx0XHRcdGNhdC5yb290LiQuZ2V0KGF0LmxpbmspLm9mZigpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdGlmKHRtcCA9IGF0Lm5leHQpe1xuXHRcdE9iamVjdC5rZXlzKHRtcCkuZm9yRWFjaChmdW5jdGlvbihpLG5lYXQpeyBuZWF0ID0gdG1wW2ldOyAvL29ial9tYXAodG1wLCBmdW5jdGlvbihuZWF0KXtcblx0XHRcdG5lYXQuJC5vZmYoKTtcblx0XHR9KTtcblx0fVxuXHRhdC5vbignb2ZmJywge30pO1xuXHRyZXR1cm4gZ3VuO1xufVxudmFyIGVtcHR5ID0ge30sIG5vb3AgPSBmdW5jdGlvbigpe30sIHU7XG5cdCIsIlxuLy8gT24gZXZlbnQgZW1pdHRlciBnZW5lcmljIGphdmFzY3JpcHQgdXRpbGl0eS5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb250byh0YWcsIGFyZywgYXMpe1xuXHRpZighdGFnKXsgcmV0dXJuIHt0bzogb250b30gfVxuXHR2YXIgdSwgZiA9ICdmdW5jdGlvbicgPT0gdHlwZW9mIGFyZywgdGFnID0gKHRoaXMudGFnIHx8ICh0aGlzLnRhZyA9IHt9KSlbdGFnXSB8fCBmICYmIChcblx0XHR0aGlzLnRhZ1t0YWddID0ge3RhZzogdGFnLCB0bzogb250by5fID0geyBuZXh0OiBmdW5jdGlvbihhcmcpeyB2YXIgdG1wO1xuXHRcdFx0aWYodG1wID0gdGhpcy50byl7IHRtcC5uZXh0KGFyZykgfVxuXHR9fX0pO1xuXHRpZihmKXtcblx0XHR2YXIgYmUgPSB7XG5cdFx0XHRvZmY6IG9udG8ub2ZmIHx8XG5cdFx0XHQob250by5vZmYgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRpZih0aGlzLm5leHQgPT09IG9udG8uXy5uZXh0KXsgcmV0dXJuICEwIH1cblx0XHRcdFx0aWYodGhpcyA9PT0gdGhpcy50aGUubGFzdCl7XG5cdFx0XHRcdFx0dGhpcy50aGUubGFzdCA9IHRoaXMuYmFjaztcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnRvLmJhY2sgPSB0aGlzLmJhY2s7XG5cdFx0XHRcdHRoaXMubmV4dCA9IG9udG8uXy5uZXh0O1xuXHRcdFx0XHR0aGlzLmJhY2sudG8gPSB0aGlzLnRvO1xuXHRcdFx0XHRpZih0aGlzLnRoZS5sYXN0ID09PSB0aGlzLnRoZSl7XG5cdFx0XHRcdFx0ZGVsZXRlIHRoaXMub24udGFnW3RoaXMudGhlLnRhZ107XG5cdFx0XHRcdH1cblx0XHRcdH0pLFxuXHRcdFx0dG86IG9udG8uXyxcblx0XHRcdG5leHQ6IGFyZyxcblx0XHRcdHRoZTogdGFnLFxuXHRcdFx0b246IHRoaXMsXG5cdFx0XHRhczogYXMsXG5cdFx0fTtcblx0XHQoYmUuYmFjayA9IHRhZy5sYXN0IHx8IHRhZykudG8gPSBiZTtcblx0XHRyZXR1cm4gdGFnLmxhc3QgPSBiZTtcblx0fVxuXHRpZigodGFnID0gdGFnLnRvKSAmJiB1ICE9PSBhcmcpeyB0YWcubmV4dChhcmcpIH1cblx0cmV0dXJuIHRhZztcbn07XG5cdCIsIlxudmFyIEd1biA9IHJlcXVpcmUoJy4vcm9vdCcpO1xuR3VuLmNoYWluLnB1dCA9IGZ1bmN0aW9uKGRhdGEsIGNiLCBhcyl7IC8vIEkgcmV3cm90ZSBpdCA6KVxuXHR2YXIgZ3VuID0gdGhpcywgYXQgPSBndW4uXywgcm9vdCA9IGF0LnJvb3Q7XG5cdGFzID0gYXMgfHwge307XG5cdGFzLnJvb3QgPSBhdC5yb290O1xuXHRhcy5ydW4gfHwgKGFzLnJ1biA9IHJvb3Qub25jZSk7XG5cdHN0dW4oYXMsIGF0LmlkKTsgLy8gc2V0IGEgZmxhZyBmb3IgcmVhZHMgdG8gY2hlY2sgaWYgdGhpcyBjaGFpbiBpcyB3cml0aW5nLlxuXHRhcy5hY2sgPSBhcy5hY2sgfHwgY2I7XG5cdGFzLnZpYSA9IGFzLnZpYSB8fCBndW47XG5cdGFzLmRhdGEgPSBhcy5kYXRhIHx8IGRhdGE7XG5cdGFzLnNvdWwgfHwgKGFzLnNvdWwgPSBhdC5zb3VsIHx8ICgnc3RyaW5nJyA9PSB0eXBlb2YgY2IgJiYgY2IpKTtcblx0dmFyIHMgPSBhcy5zdGF0ZSA9IGFzLnN0YXRlIHx8IEd1bi5zdGF0ZSgpO1xuXHRpZignZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKXsgZGF0YShmdW5jdGlvbihkKXsgYXMuZGF0YSA9IGQ7IGd1bi5wdXQodSx1LGFzKSB9KTsgcmV0dXJuIGd1biB9XG5cdGlmKCFhcy5zb3VsKXsgcmV0dXJuIGdldChhcyksIGd1biB9XG5cdGFzLiQgPSByb290LiQuZ2V0KGFzLnNvdWwpOyAvLyBUT0RPOiBUaGlzIG1heSBub3QgYWxsb3cgdXNlciBjaGFpbmluZyBhbmQgc2ltaWxhcj9cblx0YXMudG9kbyA9IFt7aXQ6IGFzLmRhdGEsIHJlZjogYXMuJH1dO1xuXHRhcy50dXJuID0gYXMudHVybiB8fCB0dXJuO1xuXHRhcy5yYW4gPSBhcy5yYW4gfHwgcmFuO1xuXHQvL3ZhciBwYXRoID0gW107IGFzLnZpYS5iYWNrKGF0ID0+IHsgYXQuZ2V0ICYmIHBhdGgucHVzaChhdC5nZXQuc2xpY2UoMCw5KSkgfSk7IHBhdGggPSBwYXRoLnJldmVyc2UoKS5qb2luKCcuJyk7XG5cdC8vIFRPRE86IFBlcmYhIFdlIG9ubHkgbmVlZCB0byBzdHVuIGNoYWlucyB0aGF0IGFyZSBiZWluZyBtb2RpZmllZCwgbm90IG5lY2Vzc2FyaWx5IHdyaXR0ZW4gdG8uXG5cdChmdW5jdGlvbiB3YWxrKCl7XG5cdFx0dmFyIHRvID0gYXMudG9kbywgYXQgPSB0by5wb3AoKSwgZCA9IGF0Lml0LCBjaWQgPSBhdC5yZWYgJiYgYXQucmVmLl8uaWQsIHYsIGssIGNhdCwgdG1wLCBnO1xuXHRcdHN0dW4oYXMsIGF0LnJlZik7XG5cdFx0aWYodG1wID0gYXQudG9kbyl7XG5cdFx0XHRrID0gdG1wLnBvcCgpOyBkID0gZFtrXTtcblx0XHRcdGlmKHRtcC5sZW5ndGgpeyB0by5wdXNoKGF0KSB9XG5cdFx0fVxuXHRcdGsgJiYgKHRvLnBhdGggfHwgKHRvLnBhdGggPSBbXSkpLnB1c2goayk7XG5cdFx0aWYoISh2ID0gdmFsaWQoZCkpICYmICEoZyA9IEd1bi5pcyhkKSkpe1xuXHRcdFx0aWYoIU9iamVjdC5wbGFpbihkKSl7IChhcy5hY2t8fG5vb3ApLmNhbGwoYXMsIGFzLm91dCA9IHtlcnI6IGFzLmVyciA9IEd1bi5sb2coXCJJbnZhbGlkIGRhdGE6IFwiICsgKChkICYmICh0bXAgPSBkLmNvbnN0cnVjdG9yKSAmJiB0bXAubmFtZSkgfHwgdHlwZW9mIGQpICsgXCIgYXQgXCIgKyAoYXMudmlhLmJhY2soZnVuY3Rpb24oYXQpe2F0LmdldCAmJiB0bXAucHVzaChhdC5nZXQpfSwgdG1wID0gW10pIHx8IHRtcC5qb2luKCcuJykpKycuJysodG8ucGF0aHx8W10pLmpvaW4oJy4nKSl9KTsgYXMucmFuKGFzKTsgcmV0dXJuIH1cblx0XHRcdHZhciBzZWVuID0gYXMuc2VlbiB8fCAoYXMuc2VlbiA9IFtdKSwgaSA9IHNlZW4ubGVuZ3RoO1xuXHRcdFx0d2hpbGUoaS0tKXsgaWYoZCA9PT0gKHRtcCA9IHNlZW5baV0pLml0KXsgdiA9IGQgPSB0bXAubGluazsgYnJlYWsgfSB9XG5cdFx0fVxuXHRcdGlmKGsgJiYgdil7IGF0Lm5vZGUgPSBzdGF0ZV9pZnkoYXQubm9kZSwgaywgcywgZCkgfSAvLyBoYW5kbGUgc291bCBsYXRlci5cblx0XHRlbHNlIHtcblx0XHRcdGFzLnNlZW4ucHVzaChjYXQgPSB7aXQ6IGQsIGxpbms6IHt9LCB0b2RvOiBnPyBbXSA6IE9iamVjdC5rZXlzKGQpLnNvcnQoKS5yZXZlcnNlKCksIHBhdGg6ICh0by5wYXRofHxbXSkuc2xpY2UoKSwgdXA6IGF0fSk7IC8vIEFueSBwZXJmIHJlYXNvbnMgdG8gQ1BVIHNjaGVkdWxlIHRoaXMgLmtleXMoID9cblx0XHRcdGF0Lm5vZGUgPSBzdGF0ZV9pZnkoYXQubm9kZSwgaywgcywgY2F0LmxpbmspO1xuXHRcdFx0IWcgJiYgY2F0LnRvZG8ubGVuZ3RoICYmIHRvLnB1c2goY2F0KTtcblx0XHRcdC8vIC0tLS0tLS0tLS0tLS0tLVxuXHRcdFx0dmFyIGlkID0gYXMuc2Vlbi5sZW5ndGg7XG5cdFx0XHQoYXMud2FpdCB8fCAoYXMud2FpdCA9IHt9KSlbaWRdID0gJyc7XG5cdFx0XHR0bXAgPSAoY2F0LnJlZiA9IChnPyBkIDogaz8gYXQucmVmLmdldChrKSA6IGF0LnJlZikpLl87XG5cdFx0XHQodG1wID0gKGQgJiYgKGQuX3x8JycpWycjJ10pIHx8IHRtcC5zb3VsIHx8IHRtcC5saW5rKT8gcmVzb2x2ZSh7c291bDogdG1wfSkgOiBjYXQucmVmLmdldChyZXNvbHZlLCB7cnVuOiBhcy5ydW4sIC8qaGF0Y2g6IDAsKi8gdjIwMjA6MSwgb3V0OntnZXQ6eycuJzonICd9fX0pOyAvLyBUT0RPOiBCVUchIFRoaXMgc2hvdWxkIGJlIHJlc29sdmUgT05MWSBzb3VsIHRvIHByZXZlbnQgZnVsbCBkYXRhIGZyb20gYmVpbmcgbG9hZGVkLiAvLyBGaXhlZCBub3c/XG5cdFx0XHQvL3NldFRpbWVvdXQoZnVuY3Rpb24oKXsgaWYoRil7IHJldHVybiB9IGNvbnNvbGUubG9nKFwiSSBIQVZFIE5PVCBCRUVOIENBTExFRCFcIiwgcGF0aCwgaWQsIGNhdC5yZWYuXy5pZCwgaykgfSwgOTAwMCk7IHZhciBGOyAvLyBNQUtFIFNVUkUgVE8gQUREIEYgPSAxIGJlbG93IVxuXHRcdFx0ZnVuY3Rpb24gcmVzb2x2ZShtc2csIGV2ZSl7XG5cdFx0XHRcdHZhciBlbmQgPSBjYXQubGlua1snIyddO1xuXHRcdFx0XHRpZihldmUpeyBldmUub2ZmKCk7IGV2ZS5yaWQobXNnKSB9IC8vIFRPRE86IFRvbyBlYXJseSEgQ2hlY2sgYWxsIHBlZXJzIGFjayBub3QgZm91bmQuXG5cdFx0XHRcdC8vIFRPRE86IEJVRyBtYXliZT8gTWFrZSBzdXJlIHRoaXMgZG9lcyBub3QgcGljayB1cCBhIGxpbmsgY2hhbmdlIHdpcGUsIHRoYXQgaXQgdXNlcyB0aGUgY2hhbmdpZ24gbGluayBpbnN0ZWFkLlxuXHRcdFx0XHR2YXIgc291bCA9IGVuZCB8fCBtc2cuc291bCB8fCAodG1wID0gKG1zZy4kJHx8bXNnLiQpLl98fCcnKS5zb3VsIHx8IHRtcC5saW5rIHx8ICgodG1wID0gdG1wLnB1dHx8JycpLl98fCcnKVsnIyddIHx8IHRtcFsnIyddIHx8ICgoKHRtcCA9IG1zZy5wdXR8fCcnKSAmJiBtc2cuJCQpPyB0bXBbJyMnXSA6ICh0bXBbJz0nXXx8dG1wWyc6J118fCcnKVsnIyddKTtcblx0XHRcdFx0IWVuZCAmJiBzdHVuKGFzLCBtc2cuJCk7XG5cdFx0XHRcdGlmKCFzb3VsICYmICFhdC5saW5rWycjJ10peyAvLyBjaGVjayBzb3VsIGxpbmsgYWJvdmUgdXNcblx0XHRcdFx0XHQoYXQud2FpdCB8fCAoYXQud2FpdCA9IFtdKSkucHVzaChmdW5jdGlvbigpeyByZXNvbHZlKG1zZywgZXZlKSB9KSAvLyB3YWl0XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFzb3VsKXtcblx0XHRcdFx0XHRzb3VsID0gW107XG5cdFx0XHRcdFx0KG1zZy4kJHx8bXNnLiQpLmJhY2soZnVuY3Rpb24oYXQpe1xuXHRcdFx0XHRcdFx0aWYodG1wID0gYXQuc291bCB8fCBhdC5saW5rKXsgcmV0dXJuIHNvdWwucHVzaCh0bXApIH1cblx0XHRcdFx0XHRcdHNvdWwucHVzaChhdC5nZXQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHNvdWwgPSBzb3VsLnJldmVyc2UoKS5qb2luKCcvJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0LmxpbmtbJyMnXSA9IHNvdWw7XG5cdFx0XHRcdCFnICYmICgoKGFzLmdyYXBoIHx8IChhcy5ncmFwaCA9IHt9KSlbc291bF0gPSAoY2F0Lm5vZGUgfHwgKGNhdC5ub2RlID0ge186e319KSkpLl9bJyMnXSA9IHNvdWwpO1xuXHRcdFx0XHRkZWxldGUgYXMud2FpdFtpZF07XG5cdFx0XHRcdGNhdC53YWl0ICYmIHNldFRpbWVvdXQuZWFjaChjYXQud2FpdCwgZnVuY3Rpb24oY2IpeyBjYiAmJiBjYigpIH0pO1xuXHRcdFx0XHRhcy5yYW4oYXMpO1xuXHRcdFx0fTtcblx0XHRcdC8vIC0tLS0tLS0tLS0tLS0tLVxuXHRcdH1cblx0XHRpZighdG8ubGVuZ3RoKXsgcmV0dXJuIGFzLnJhbihhcykgfVxuXHRcdGFzLnR1cm4od2Fsayk7XG5cdH0oKSk7XG5cdHJldHVybiBndW47XG59XG5cbmZ1bmN0aW9uIHN0dW4oYXMsIGlkKXtcblx0aWYoIWlkKXsgcmV0dXJuIH0gaWQgPSAoaWQuX3x8JycpLmlkfHxpZDtcblx0dmFyIHJ1biA9IGFzLnJvb3Quc3R1biB8fCAoYXMucm9vdC5zdHVuID0ge29uOiBHdW4ub259KSwgdGVzdCA9IHt9LCB0bXA7XG5cdGFzLnN0dW4gfHwgKGFzLnN0dW4gPSBydW4ub24oJ3N0dW4nLCBmdW5jdGlvbigpeyB9KSk7XG5cdGlmKHRtcCA9IHJ1bi5vbignJytpZCkpeyB0bXAudGhlLmxhc3QubmV4dCh0ZXN0KSB9XG5cdGlmKHRlc3QucnVuID49IGFzLnJ1bil7IHJldHVybiB9XG5cdHJ1bi5vbignJytpZCwgZnVuY3Rpb24odGVzdCl7XG5cdFx0aWYoYXMuc3R1bi5lbmQpe1xuXHRcdFx0dGhpcy5vZmYoKTtcblx0XHRcdHRoaXMudG8ubmV4dCh0ZXN0KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGVzdC5ydW4gPSB0ZXN0LnJ1biB8fCBhcy5ydW47XG5cdFx0dGVzdC5zdHVuID0gdGVzdC5zdHVuIHx8IGFzLnN0dW47IHJldHVybjtcblx0XHRpZih0aGlzLnRvLnRvKXtcblx0XHRcdHRoaXMudGhlLmxhc3QubmV4dCh0ZXN0KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGVzdC5zdHVuID0gYXMuc3R1bjtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIHJhbihhcyl7XG5cdGlmKGFzLmVycil7IHJhbi5lbmQoYXMuc3R1biwgYXMucm9vdCk7IHJldHVybiB9IC8vIG1vdmUgbG9nIGhhbmRsZSBoZXJlLlxuXHRpZihhcy50b2RvLmxlbmd0aCB8fCBhcy5lbmQgfHwgIU9iamVjdC5lbXB0eShhcy53YWl0KSl7IHJldHVybiB9IGFzLmVuZCA9IDE7XG5cdHZhciBjYXQgPSAoYXMuJC5iYWNrKC0xKS5fKSwgcm9vdCA9IGNhdC5yb290LCBhc2sgPSBjYXQuYXNrKGZ1bmN0aW9uKGFjayl7XG5cdFx0cm9vdC5vbignYWNrJywgYWNrKTtcblx0XHRpZihhY2suZXJyKXsgR3VuLmxvZyhhY2spIH1cblx0XHRpZigrK2Fja3MgPiAoYXMuYWNrcyB8fCAwKSl7IHRoaXMub2ZmKCkgfSAvLyBBZGp1c3RhYmxlIEFDS3MhIE9ubHkgMSBieSBkZWZhdWx0LlxuXHRcdGlmKCFhcy5hY2speyByZXR1cm4gfVxuXHRcdGFzLmFjayhhY2ssIHRoaXMpO1xuXHR9LCBhcy5vcHQpLCBhY2tzID0gMCwgc3R1biA9IGFzLnN0dW4sIHRtcDtcblx0KHRtcCA9IGZ1bmN0aW9uKCl7IC8vIHRoaXMgaXMgbm90IG9mZmljaWFsIHlldCwgYnV0IHF1aWNrIHNvbHV0aW9uIHRvIGhhY2sgaW4gZm9yIG5vdy5cblx0XHRpZighc3R1bil7IHJldHVybiB9XG5cdFx0cmFuLmVuZChzdHVuLCByb290KTtcblx0XHRzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMoc3R1biA9IHN0dW4uYWRkfHwnJyksIGZ1bmN0aW9uKGNiKXsgaWYoY2IgPSBzdHVuW2NiXSl7Y2IoKX0gfSk7IC8vIHJlc3VtZSB0aGUgc3R1bm5lZCByZWFkcyAvLyBBbnkgcGVyZiByZWFzb25zIHRvIENQVSBzY2hlZHVsZSB0aGlzIC5rZXlzKCA/XG5cdH0pLmhhdGNoID0gdG1wOyAvLyB0aGlzIGlzIG5vdCBvZmZpY2lhbCB5ZXQgXlxuXHQvL2NvbnNvbGUubG9nKDEsIFwiUFVUXCIsIGFzLnJ1biwgYXMuZ3JhcGgpO1xuXHQoYXMudmlhLl8pLm9uKCdvdXQnLCB7cHV0OiBhcy5vdXQgPSBhcy5ncmFwaCwgb3B0OiBhcy5vcHQsICcjJzogYXNrLCBfOiB0bXB9KTtcbn07IHJhbi5lbmQgPSBmdW5jdGlvbihzdHVuLHJvb3Qpe1xuXHRzdHVuLmVuZCA9IG5vb3A7IC8vIGxpa2Ugd2l0aCB0aGUgZWFybGllciBpZCwgY2hlYXBlciB0byBtYWtlIHRoaXMgZmxhZyBhIGZ1bmN0aW9uIHNvIGJlbG93IGNhbGxiYWNrcyBkbyBub3QgaGF2ZSB0byBkbyBhbiBleHRyYSB0eXBlIGNoZWNrLlxuXHRpZihzdHVuLnRoZS50byA9PT0gc3R1biAmJiBzdHVuID09PSBzdHVuLnRoZS5sYXN0KXsgZGVsZXRlIHJvb3Quc3R1biB9XG5cdHN0dW4ub2ZmKCk7XG59XG5cbmZ1bmN0aW9uIGdldChhcyl7XG5cdHZhciBhdCA9IGFzLnZpYS5fLCB0bXA7XG5cdGFzLnZpYSA9IGFzLnZpYS5iYWNrKGZ1bmN0aW9uKGF0KXtcblx0XHRpZihhdC5zb3VsIHx8ICFhdC5nZXQpeyByZXR1cm4gYXQuJCB9XG5cdFx0dG1wID0gYXMuZGF0YTsgKGFzLmRhdGEgPSB7fSlbYXQuZ2V0XSA9IHRtcDtcblx0fSk7XG5cdGlmKCFhcy52aWEgfHwgIWFzLnZpYS5fLnNvdWwpe1xuXHRcdGFzLnZpYSA9IGF0LnJvb3QuJC5nZXQoKChhcy5kYXRhfHwnJykuX3x8JycpWycjJ10gfHwgYXQuJC5iYWNrKCdvcHQudXVpZCcpKCkpXG5cdH1cblx0YXMudmlhLnB1dChhcy5kYXRhLCBhcy5hY2ssIGFzKTtcblx0XG5cblx0cmV0dXJuO1xuXHRpZihhdC5nZXQgJiYgYXQuYmFjay5zb3VsKXtcblx0XHR0bXAgPSBhcy5kYXRhO1xuXHRcdGFzLnZpYSA9IGF0LmJhY2suJDtcblx0XHQoYXMuZGF0YSA9IHt9KVthdC5nZXRdID0gdG1wOyBcblx0XHRhcy52aWEucHV0KGFzLmRhdGEsIGFzLmFjaywgYXMpO1xuXHRcdHJldHVybjtcblx0fVxufVxuXG52YXIgdSwgZW1wdHkgPSB7fSwgbm9vcCA9IGZ1bmN0aW9uKCl7fSwgdHVybiA9IHNldFRpbWVvdXQudHVybiwgdmFsaWQgPSBHdW4udmFsaWQsIHN0YXRlX2lmeSA9IEd1bi5zdGF0ZS5pZnk7XG52YXIgaWlmZSA9IGZ1bmN0aW9uKGZuLGFzKXtmbi5jYWxsKGFzfHxlbXB0eSl9XG5cdCIsIlxuXG5mdW5jdGlvbiBHdW4obyl7XG5cdGlmKG8gaW5zdGFuY2VvZiBHdW4peyByZXR1cm4gKHRoaXMuXyA9IHskOiB0aGlzfSkuJCB9XG5cdGlmKCEodGhpcyBpbnN0YW5jZW9mIEd1bikpeyByZXR1cm4gbmV3IEd1bihvKSB9XG5cdHJldHVybiBHdW4uY3JlYXRlKHRoaXMuXyA9IHskOiB0aGlzLCBvcHQ6IG99KTtcbn1cblxuR3VuLmlzID0gZnVuY3Rpb24oJCl7IHJldHVybiAoJCBpbnN0YW5jZW9mIEd1bikgfHwgKCQgJiYgJC5fICYmICgkID09PSAkLl8uJCkpIHx8IGZhbHNlIH1cblxuR3VuLnZlcnNpb24gPSAwLjIwMjA7XG5cbkd1bi5jaGFpbiA9IEd1bi5wcm90b3R5cGU7XG5HdW4uY2hhaW4udG9KU09OID0gZnVuY3Rpb24oKXt9O1xuXG5yZXF1aXJlKCcuL3NoaW0nKTtcbkd1bi52YWxpZCA9IHJlcXVpcmUoJy4vdmFsaWQnKTtcbkd1bi5zdGF0ZSA9IHJlcXVpcmUoJy4vc3RhdGUnKTtcbkd1bi5vbiA9IHJlcXVpcmUoJy4vb250bycpO1xuR3VuLmR1cCA9IHJlcXVpcmUoJy4vZHVwJyk7XG5HdW4uYXNrID0gcmVxdWlyZSgnLi9hc2snKTtcblxuOyhmdW5jdGlvbigpe1xuXHRHdW4uY3JlYXRlID0gZnVuY3Rpb24oYXQpe1xuXHRcdGF0LnJvb3QgPSBhdC5yb290IHx8IGF0O1xuXHRcdGF0LmdyYXBoID0gYXQuZ3JhcGggfHwge307XG5cdFx0YXQub24gPSBhdC5vbiB8fCBHdW4ub247XG5cdFx0YXQuYXNrID0gYXQuYXNrIHx8IEd1bi5hc2s7XG5cdFx0YXQuZHVwID0gYXQuZHVwIHx8IEd1bi5kdXAoKTtcblx0XHR2YXIgZ3VuID0gYXQuJC5vcHQoYXQub3B0KTtcblx0XHRpZighYXQub25jZSl7XG5cdFx0XHRhdC5vbignaW4nLCB1bml2ZXJzZSwgYXQpO1xuXHRcdFx0YXQub24oJ291dCcsIHVuaXZlcnNlLCBhdCk7XG5cdFx0XHRhdC5vbigncHV0JywgbWFwLCBhdCk7XG5cdFx0XHRHdW4ub24oJ2NyZWF0ZScsIGF0KTtcblx0XHRcdGF0Lm9uKCdjcmVhdGUnLCBhdCk7XG5cdFx0fVxuXHRcdGF0Lm9uY2UgPSAxO1xuXHRcdHJldHVybiBndW47XG5cdH1cblx0ZnVuY3Rpb24gdW5pdmVyc2UobXNnKXtcblx0XHQvL2lmKCFGKXsgdmFyIGV2ZSA9IHRoaXM7IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgdW5pdmVyc2UuY2FsbChldmUsIG1zZywxKSB9LE1hdGgucmFuZG9tKCkgKiAxMDApO3JldHVybjsgfSAvLyBBREQgRiBUTyBQQVJBTVMhXG5cdFx0aWYoIW1zZyl7IHJldHVybiB9XG5cdFx0aWYobXNnLm91dCA9PT0gdW5pdmVyc2UpeyB0aGlzLnRvLm5leHQobXNnKTsgcmV0dXJuIH1cblx0XHR2YXIgZXZlID0gdGhpcywgYXMgPSBldmUuYXMsIGF0ID0gYXMuYXQgfHwgYXMsIGd1biA9IGF0LiQsIGR1cCA9IGF0LmR1cCwgdG1wLCBEQkcgPSBtc2cuREJHO1xuXHRcdCh0bXAgPSBtc2dbJyMnXSkgfHwgKHRtcCA9IG1zZ1snIyddID0gdGV4dF9yYW5kKDkpKTtcblx0XHRpZihkdXAuY2hlY2sodG1wKSl7IHJldHVybiB9IGR1cC50cmFjayh0bXApO1xuXHRcdHRtcCA9IG1zZy5fOyBtc2cuXyA9ICgnZnVuY3Rpb24nID09IHR5cGVvZiB0bXApPyB0bXAgOiBmdW5jdGlvbigpe307XG5cdFx0KG1zZy4kICYmIChtc2cuJCA9PT0gKG1zZy4kLl98fCcnKS4kKSkgfHwgKG1zZy4kID0gZ3VuKTtcblx0XHRpZihtc2dbJ0AnXSAmJiAhbXNnLnB1dCl7IGFjayhtc2cpIH1cblx0XHRpZighYXQuYXNrKG1zZ1snQCddLCBtc2cpKXsgLy8gaXMgdGhpcyBtYWNoaW5lIGxpc3RlbmluZyBmb3IgYW4gYWNrP1xuXHRcdFx0REJHICYmIChEQkcudSA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRpZihtc2cucHV0KXsgcHV0KG1zZyk7IHJldHVybiB9IGVsc2Vcblx0XHRcdGlmKG1zZy5nZXQpeyBHdW4ub24uZ2V0KG1zZywgZ3VuKSB9XG5cdFx0fVxuXHRcdERCRyAmJiAoREJHLnVjID0gK25ldyBEYXRlKTtcblx0XHRldmUudG8ubmV4dChtc2cpO1xuXHRcdERCRyAmJiAoREJHLnVhID0gK25ldyBEYXRlKTtcblx0XHRpZihtc2cubnRzIHx8IG1zZy5OVFMpeyByZXR1cm4gfSAvLyBUT0RPOiBUaGlzIHNob3VsZG4ndCBiZSBpbiBjb3JlLCBidXQgZmFzdCB3YXkgdG8gcHJldmVudCBOVFMgc3ByZWFkLiBEZWxldGUgdGhpcyBsaW5lIGFmdGVyIGFsbCBwZWVycyBoYXZlIHVwZ3JhZGVkIHRvIG5ld2VyIHZlcnNpb25zLlxuXHRcdG1zZy5vdXQgPSB1bml2ZXJzZTsgYXQub24oJ291dCcsIG1zZyk7XG5cdFx0REJHICYmIChEQkcudWUgPSArbmV3IERhdGUpO1xuXHR9XG5cdGZ1bmN0aW9uIHB1dChtc2cpe1xuXHRcdGlmKCFtc2cpeyByZXR1cm4gfVxuXHRcdHZhciBjdHggPSBtc2cuX3x8JycsIHJvb3QgPSBjdHgucm9vdCA9ICgoY3R4LiQgPSBtc2cuJHx8JycpLl98fCcnKS5yb290O1xuXHRcdGlmKG1zZ1snQCddICYmIGN0eC5mYWl0aCAmJiAhY3R4Lm1pc3MpeyAvLyBUT0RPOiBBWEUgbWF5IHNwbGl0L3JvdXRlIGJhc2VkIG9uICdwdXQnIHdoYXQgc2hvdWxkIHdlIGRvIGhlcmU/IERldGVjdCBAIGluIEFYRT8gSSB0aGluayB3ZSBkb24ndCBoYXZlIHRvIHdvcnJ5LCBhcyBEQU0gd2lsbCByb3V0ZSBpdCBvbiBALlxuXHRcdFx0bXNnLm91dCA9IHVuaXZlcnNlO1xuXHRcdFx0cm9vdC5vbignb3V0JywgbXNnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y3R4LmxhdGNoID0gcm9vdC5oYXRjaDsgY3R4Lm1hdGNoID0gcm9vdC5oYXRjaCA9IFtdO1xuXHRcdHZhciBwdXQgPSBtc2cucHV0O1xuXHRcdHZhciBEQkcgPSBjdHguREJHID0gbXNnLkRCRywgUyA9ICtuZXcgRGF0ZTtcblx0XHRpZihwdXRbJyMnXSAmJiBwdXRbJy4nXSl7IC8qcm9vdCAmJiByb290Lm9uKCdwdXQnLCBtc2cpOyovIHJldHVybiB9IC8vIFRPRE86IEJVRyEgVGhpcyBuZWVkcyB0byBjYWxsIEhBTSBpbnN0ZWFkLlxuXHRcdERCRyAmJiAoREJHLnAgPSBTKTtcblx0XHRjdHhbJyMnXSA9IG1zZ1snIyddO1xuXHRcdGN0eC5tc2cgPSBtc2c7XG5cdFx0Y3R4LmFsbCA9IDA7XG5cdFx0Y3R4LnN0dW4gPSAxO1xuXHRcdHZhciBubCA9IE9iamVjdC5rZXlzKHB1dCk7Ly8uc29ydCgpOyAvLyBUT0RPOiBUaGlzIGlzIHVuYm91bmRlZCBvcGVyYXRpb24sIGxhcmdlIGdyYXBocyB3aWxsIGJlIHNsb3dlci4gV3JpdGUgb3VyIG93biBDUFUgc2NoZWR1bGVkIHNvcnQ/IE9yIHNvbWVob3cgZG8gaXQgaW4gYmVsb3c/IEtleXMgaXRzZWxmIGlzIG5vdCBPKDEpIGVpdGhlciwgY3JlYXRlIEVTNSBzaGltIG92ZXIgP3dlYWsgbWFwPyBvciBjdXN0b20gd2hpY2ggaXMgY29uc3RhbnQuXG5cdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8Y3R4KS5wayA9ICtuZXcgRGF0ZSkgLSBTLCAncHV0IHNvcnQnKTtcblx0XHR2YXIgbmkgPSAwLCBuaiwga2wsIHNvdWwsIG5vZGUsIHN0YXRlcywgZXJyLCB0bXA7XG5cdFx0KGZ1bmN0aW9uIHBvcChvKXtcblx0XHRcdGlmKG5qICE9IG5pKXsgbmogPSBuaTtcblx0XHRcdFx0aWYoIShzb3VsID0gbmxbbmldKSl7XG5cdFx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8Y3R4KS5wZCA9ICtuZXcgRGF0ZSkgLSBTLCAncHV0Jyk7XG5cdFx0XHRcdFx0ZmlyZShjdHgpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZighKG5vZGUgPSBwdXRbc291bF0pKXsgZXJyID0gRVJSK2N1dChzb3VsKStcIm5vIG5vZGUuXCIgfSBlbHNlXG5cdFx0XHRcdGlmKCEodG1wID0gbm9kZS5fKSl7IGVyciA9IEVSUitjdXQoc291bCkrXCJubyBtZXRhLlwiIH0gZWxzZVxuXHRcdFx0XHRpZihzb3VsICE9PSB0bXBbJyMnXSl7IGVyciA9IEVSUitjdXQoc291bCkrXCJzb3VsIG5vdCBzYW1lLlwiIH0gZWxzZVxuXHRcdFx0XHRpZighKHN0YXRlcyA9IHRtcFsnPiddKSl7IGVyciA9IEVSUitjdXQoc291bCkrXCJubyBzdGF0ZS5cIiB9XG5cdFx0XHRcdGtsID0gT2JqZWN0LmtleXMobm9kZXx8e30pOyAvLyBUT0RPOiAua2V5cyggaXMgc2xvd1xuXHRcdFx0fVxuXHRcdFx0aWYoZXJyKXtcblx0XHRcdFx0bXNnLmVyciA9IGN0eC5lcnIgPSBlcnI7IC8vIGludmFsaWQgZGF0YSBzaG91bGQgZXJyb3IgYW5kIHN0dW4gdGhlIG1lc3NhZ2UuXG5cdFx0XHRcdGZpcmUoY3R4KTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImhhbmRsZSBlcnJvciFcIiwgZXJyKSAvLyBoYW5kbGUhXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBpID0gMCwga2V5OyBvID0gbyB8fCAwO1xuXHRcdFx0d2hpbGUobysrIDwgOSAmJiAoa2V5ID0ga2xbaSsrXSkpe1xuXHRcdFx0XHRpZignXycgPT09IGtleSl7IGNvbnRpbnVlIH1cblx0XHRcdFx0dmFyIHZhbCA9IG5vZGVba2V5XSwgc3RhdGUgPSBzdGF0ZXNba2V5XTtcblx0XHRcdFx0aWYodSA9PT0gc3RhdGUpeyBlcnIgPSBFUlIrY3V0KGtleSkrXCJvblwiK2N1dChzb3VsKStcIm5vIHN0YXRlLlwiOyBicmVhayB9XG5cdFx0XHRcdGlmKCF2YWxpZCh2YWwpKXsgZXJyID0gRVJSK2N1dChrZXkpK1wib25cIitjdXQoc291bCkrXCJiYWQgXCIrKHR5cGVvZiB2YWwpK2N1dCh2YWwpOyBicmVhayB9XG5cdFx0XHRcdC8vY3R4LmFsbCsrOyAvL2N0eC5hY2tbc291bCtrZXldID0gJyc7XG5cdFx0XHRcdGhhbSh2YWwsIGtleSwgc291bCwgc3RhdGUsIG1zZyk7XG5cdFx0XHR9XG5cdFx0XHRpZigoa2wgPSBrbC5zbGljZShpKSkubGVuZ3RoKXsgdHVybihwb3ApOyByZXR1cm4gfVxuXHRcdFx0KytuaTsga2wgPSBudWxsOyBwb3Aobyk7XG5cdFx0fSgpKTtcblx0fSBHdW4ub24ucHV0ID0gcHV0O1xuXHQvLyBUT0RPOiBNQVJLISEhIGNsb2NrIGJlbG93LCByZWNvbm5lY3Qgc3luYywgU0VBIGNlcnRpZnkgd2lyZSBtZXJnZSwgVXNlci5hdXRoIHRha2luZyBtdWx0aXBsZSB0aW1lcywgLy8gbXNnIHB1dCwgcHV0LCBzYXkgYWNrLCBoZWFyIGxvb3AuLi5cblx0Ly8gV0FTSVMgQlVHISBmaXJzdCAub25jZSggdW5kZWYgMm5kIGdvb2QuIC5vZmYgb3RoZSBycGVvcGxlOiAub3BlblxuXHRmdW5jdGlvbiBoYW0odmFsLCBrZXksIHNvdWwsIHN0YXRlLCBtc2cpe1xuXHRcdHZhciBjdHggPSBtc2cuX3x8JycsIHJvb3QgPSBjdHgucm9vdCwgZ3JhcGggPSByb290LmdyYXBoLCBsb3QsIHRtcDtcblx0XHR2YXIgdmVydGV4ID0gZ3JhcGhbc291bF0gfHwgZW1wdHksIHdhcyA9IHN0YXRlX2lzKHZlcnRleCwga2V5LCAxKSwga25vd24gPSB2ZXJ0ZXhba2V5XTtcblx0XHRcblx0XHR2YXIgREJHID0gY3R4LkRCRzsgaWYodG1wID0gY29uc29sZS5TVEFUKXsgaWYoIWdyYXBoW3NvdWxdIHx8ICFrbm93bil7IHRtcC5oYXMgPSAodG1wLmhhcyB8fCAwKSArIDEgfSB9XG5cblx0XHR2YXIgbm93ID0gU3RhdGUoKSwgdTtcblx0XHRpZihzdGF0ZSA+IG5vdyl7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGhhbSh2YWwsIGtleSwgc291bCwgc3RhdGUsIG1zZykgfSwgKHRtcCA9IHN0YXRlIC0gbm93KSA+IE1EPyBNRCA6IHRtcCk7IC8vIE1heCBEZWZlciAzMmJpdC4gOihcblx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoKChEQkd8fGN0eCkuSGYgPSArbmV3IERhdGUpLCB0bXAsICdmdXR1cmUnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYoc3RhdGUgPCB3YXMpeyAvKm9sZDsqLyBpZighY3R4Lm1pc3MpeyByZXR1cm4gfSB9IC8vIGJ1dCBzb21lIGNoYWlucyBoYXZlIGEgY2FjaGUgbWlzcyB0aGF0IG5lZWQgdG8gcmUtZmlyZS4gLy8gVE9ETzogSW1wcm92ZSBpbiBmdXR1cmUuIC8vIGZvciBBWEUgdGhpcyB3b3VsZCByZWR1Y2UgcmVicm9hZGNhc3QsIGJ1dCBHVU4gZG9lcyBpdCBvbiBtZXNzYWdlIGZvcndhcmRpbmcuXG5cdFx0aWYoIWN0eC5mYWl0aCl7IC8vIFRPRE86IEJVRz8gQ2FuIHRoaXMgYmUgdXNlZCBmb3IgY2FjaGUgbWlzcyBhcyB3ZWxsPyAvLyBZZXMgdGhpcyB3YXMgYSBidWcsIG5lZWQgdG8gY2hlY2sgY2FjaGUgbWlzcyBmb3IgUkFEIHRlc3RzLCBidXQgc2hvdWxkIHdlIGNhcmUgYWJvdXQgdGhlIGZhaXRoIGNoZWNrIG5vdz8gUHJvYmFibHkgbm90LlxuXHRcdFx0aWYoc3RhdGUgPT09IHdhcyAmJiAodmFsID09PSBrbm93biB8fCBMKHZhbCkgPD0gTChrbm93bikpKXsgLypjb25zb2xlLmxvZyhcInNhbWVcIik7Ki8gLypzYW1lOyovIGlmKCFjdHgubWlzcyl7IHJldHVybiB9IH0gLy8gc2FtZVxuXHRcdH1cblx0XHRjdHguc3R1bisrOyAvLyBUT0RPOiAnZm9yZ2V0JyBmZWF0dXJlIGluIFNFQSB0aWVkIHRvIHRoaXMsIGJhZCBhcHByb2FjaCwgYnV0IGhhY2tlZCBpbiBmb3Igbm93LiBBbnkgY2hhbmdlcyBoZXJlIG11c3QgdXBkYXRlIHRoZXJlLlxuXHRcdHZhciBhaWQgPSBtc2dbJyMnXStjdHguYWxsKyssIGlkID0ge3RvU3RyaW5nOiBmdW5jdGlvbigpeyByZXR1cm4gYWlkIH0sIF86IGN0eH07IGlkLnRvSlNPTiA9IGlkLnRvU3RyaW5nOyAvLyB0aGlzICp0cmljayogbWFrZXMgaXQgY29tcGF0aWJsZSBiZXR3ZWVuIG9sZCAmIG5ldyB2ZXJzaW9ucy5cblx0XHREQkcgJiYgKERCRy5waCA9IERCRy5waCB8fCArbmV3IERhdGUpO1xuXHRcdHJvb3Qub24oJ3B1dCcsIHsnIyc6IGlkLCAnQCc6IG1zZ1snQCddLCBwdXQ6IHsnIyc6IHNvdWwsICcuJzoga2V5LCAnOic6IHZhbCwgJz4nOiBzdGF0ZX0sIF86IGN0eH0pO1xuXHR9XG5cdGZ1bmN0aW9uIG1hcChtc2cpe1xuXHRcdHZhciBEQkc7IGlmKERCRyA9IChtc2cuX3x8JycpLkRCRyl7IERCRy5wYSA9ICtuZXcgRGF0ZTsgREJHLnBtID0gREJHLnBtIHx8ICtuZXcgRGF0ZX1cbiAgICAgIFx0dmFyIGV2ZSA9IHRoaXMsIHJvb3QgPSBldmUuYXMsIGdyYXBoID0gcm9vdC5ncmFwaCwgY3R4ID0gbXNnLl8sIHB1dCA9IG1zZy5wdXQsIHNvdWwgPSBwdXRbJyMnXSwga2V5ID0gcHV0WycuJ10sIHZhbCA9IHB1dFsnOiddLCBzdGF0ZSA9IHB1dFsnPiddLCBpZCA9IG1zZ1snIyddLCB0bXA7XG4gICAgICBcdGlmKCh0bXAgPSBjdHgubXNnKSAmJiAodG1wID0gdG1wLnB1dCkgJiYgKHRtcCA9IHRtcFtzb3VsXSkpeyBzdGF0ZV9pZnkodG1wLCBrZXksIHN0YXRlLCB2YWwsIHNvdWwpIH0gLy8gbmVjZXNzYXJ5ISBvciBlbHNlIG91dCBtZXNzYWdlcyBkbyBub3QgZ2V0IFNFQSB0cmFuc2Zvcm1zLlxuXHRcdGdyYXBoW3NvdWxdID0gc3RhdGVfaWZ5KGdyYXBoW3NvdWxdLCBrZXksIHN0YXRlLCB2YWwsIHNvdWwpO1xuXHRcdGlmKHRtcCA9IChyb290Lm5leHR8fCcnKVtzb3VsXSl7IHRtcC5vbignaW4nLCBtc2cpIH1cblx0XHRmaXJlKGN0eCk7XG5cdFx0ZXZlLnRvLm5leHQobXNnKTtcblx0fVxuXHRmdW5jdGlvbiBmaXJlKGN0eCwgbXNnKXsgdmFyIHJvb3Q7XG5cdFx0aWYoY3R4LnN0b3ApeyByZXR1cm4gfVxuXHRcdGlmKCFjdHguZXJyICYmIDAgPCAtLWN0eC5zdHVuKXsgcmV0dXJuIH0gLy8gVE9ETzogJ2ZvcmdldCcgZmVhdHVyZSBpbiBTRUEgdGllZCB0byB0aGlzLCBiYWQgYXBwcm9hY2gsIGJ1dCBoYWNrZWQgaW4gZm9yIG5vdy4gQW55IGNoYW5nZXMgaGVyZSBtdXN0IHVwZGF0ZSB0aGVyZS5cblx0XHRjdHguc3RvcCA9IDE7XG5cdFx0aWYoIShyb290ID0gY3R4LnJvb3QpKXsgcmV0dXJuIH1cblx0XHR2YXIgdG1wID0gY3R4Lm1hdGNoOyB0bXAuZW5kID0gMTtcblx0XHRpZih0bXAgPT09IHJvb3QuaGF0Y2gpeyBpZighKHRtcCA9IGN0eC5sYXRjaCkgfHwgdG1wLmVuZCl7IGRlbGV0ZSByb290LmhhdGNoIH0gZWxzZSB7IHJvb3QuaGF0Y2ggPSB0bXAgfSB9XG5cdFx0Y3R4LmhhdGNoICYmIGN0eC5oYXRjaCgpOyAvLyBUT0RPOiByZW5hbWUvcmV3b3JrIGhvdyBwdXQgJiB0aGlzIGludGVyYWN0LlxuXHRcdHNldFRpbWVvdXQuZWFjaChjdHgubWF0Y2gsIGZ1bmN0aW9uKGNiKXtjYiAmJiBjYigpfSk7IFxuXHRcdGlmKCEobXNnID0gY3R4Lm1zZykgfHwgY3R4LmVyciB8fCBtc2cuZXJyKXsgcmV0dXJuIH1cblx0XHRtc2cub3V0ID0gdW5pdmVyc2U7XG5cdFx0Y3R4LnJvb3Qub24oJ291dCcsIG1zZyk7XG5cdH1cblx0ZnVuY3Rpb24gYWNrKG1zZyl7IC8vIGFnZ3JlZ2F0ZSBBQ0tzLlxuXHRcdHZhciBpZCA9IG1zZ1snQCddIHx8ICcnLCBjdHg7XG5cdFx0aWYoIShjdHggPSBpZC5fKSl7IHJldHVybiB9XG5cdFx0Y3R4LmFja3MgPSAoY3R4LmFja3N8fDApICsgMTtcblx0XHRpZihjdHguZXJyID0gbXNnLmVycil7XG5cdFx0XHRtc2dbJ0AnXSA9IGN0eFsnIyddO1xuXHRcdFx0ZmlyZShjdHgpOyAvLyBUT0RPOiBCVUc/IEhvdyBpdCBza2lwcy9zdG9wcyBwcm9wYWdhdGlvbiBvZiBtc2cgaWYgYW55IDEgaXRlbSBpcyBlcnJvciwgdGhpcyB3b3VsZCBhc3N1bWUgYSB3aG9sZSBiYXRjaC9yZXN5bmMgaGFzIHNhbWUgbWFsaWNpb3VzIGludGVudC5cblx0XHR9XG5cdFx0aWYoIWN0eC5zdG9wICYmICFjdHguY3JhY2speyBjdHguY3JhY2sgPSBjdHgubWF0Y2ggJiYgY3R4Lm1hdGNoLnB1c2goZnVuY3Rpb24oKXtiYWNrKGN0eCl9KSB9IC8vIGhhbmRsZSBzeW5jaHJvbm91cyBhY2tzXG5cdFx0YmFjayhjdHgpO1xuXHR9XG5cdGZ1bmN0aW9uIGJhY2soY3R4KXtcblx0XHRpZighY3R4IHx8ICFjdHgucm9vdCl7IHJldHVybiB9XG5cdFx0aWYoY3R4LnN0dW4gfHwgY3R4LmFja3MgIT09IGN0eC5hbGwpeyByZXR1cm4gfVxuXHRcdGN0eC5yb290Lm9uKCdpbicsIHsnQCc6IGN0eFsnIyddLCBlcnI6IGN0eC5lcnIsIG9rOiBjdHguZXJyPyB1IDogeycnOjF9fSk7XG5cdH1cblxuXHR2YXIgRVJSID0gXCJFcnJvcjogSW52YWxpZCBncmFwaCFcIjtcblx0dmFyIGN1dCA9IGZ1bmN0aW9uKHMpeyByZXR1cm4gXCIgJ1wiKygnJytzKS5zbGljZSgwLDkpK1wiLi4uJyBcIiB9XG5cdHZhciBMID0gSlNPTi5zdHJpbmdpZnksIE1EID0gMjE0NzQ4MzY0NywgU3RhdGUgPSBHdW4uc3RhdGU7XG5cbn0oKSk7XG5cbjsoZnVuY3Rpb24oKXtcblx0R3VuLm9uLmdldCA9IGZ1bmN0aW9uKG1zZywgZ3VuKXtcblx0XHR2YXIgcm9vdCA9IGd1bi5fLCBnZXQgPSBtc2cuZ2V0LCBzb3VsID0gZ2V0WycjJ10sIG5vZGUgPSByb290LmdyYXBoW3NvdWxdLCBoYXMgPSBnZXRbJy4nXTtcblx0XHR2YXIgbmV4dCA9IHJvb3QubmV4dCB8fCAocm9vdC5uZXh0ID0ge30pLCBhdCA9IG5leHRbc291bF07XG5cdFx0Ly8gcXVldWUgY29uY3VycmVudCBHRVRzP1xuXHRcdC8vIFRPRE86IGNvbnNpZGVyIHRhZ2dpbmcgb3JpZ2luYWwgbWVzc2FnZSBpbnRvIGR1cCBmb3IgREFNLlxuXHRcdC8vIFRPRE86IF4gYWJvdmU/IEluIGNoYXQgYXBwLCAxMiBtZXNzYWdlcyByZXN1bHRlZCBpbiBzYW1lIHBlZXIgYXNraW5nIGZvciBgI3VzZXIucHViYCAxMiB0aW1lcy4gKHNhbWUgd2l0aCAjdXNlciBHRVQgdG9vLCB5aXBlcyEpIC8vIERBTSBub3RlOiBUaGlzIGFsc28gcmVzdWx0ZWQgaW4gMTIgcmVwbGllcyBmcm9tIDEgcGVlciB3aGljaCBhbGwgaGFkIHNhbWUgIyNoYXNoIGJ1dCBub25lIG9mIHRoZW0gZGVkdXBlZCBiZWNhdXNlIGVhY2ggZ2V0IHdhcyBkaWZmZXJlbnQuXG5cdFx0Ly8gVE9ETzogTW92aW5nIHF1aWNrIGhhY2tzIGZpeGluZyB0aGVzZSB0aGluZ3MgdG8gYXhlIGZvciBub3cuXG5cdFx0Ly8gVE9ETzogYSBsb3Qgb2YgR0VUICNmb28gdGhlbiBHRVQgI2Zvby5cIlwiIGhhcHBlbmluZywgd2h5P1xuXHRcdC8vIFRPRE86IERBTSdzICMjIGhhc2ggY2hlY2ssIG9uIHNhbWUgZ2V0IEFDSywgcHJvZHVjaW5nIG11bHRpcGxlIHJlcGxpZXMgc3RpbGwsIG1heWJlIEpTT04gdnMgWVNPTj9cblx0XHQvLyBUTVAgbm90ZSBmb3Igbm93OiB2aU1acTFzbEcgd2FzIGNoYXQgTEVYIHF1ZXJ5ICMuXG5cdFx0LyppZihndW4gIT09ICh0bXAgPSBtc2cuJCkgJiYgKHRtcCA9ICh0bXB8fCcnKS5fKSl7XG5cdFx0XHRpZih0bXAuUSl7IHRtcC5RW21zZ1snIyddXSA9ICcnOyByZXR1cm4gfSAvLyBjaGFpbiBkb2VzIG5vdCBuZWVkIHRvIGFzayBmb3IgaXQgYWdhaW4uXG5cdFx0XHR0bXAuUSA9IHt9O1xuXHRcdH0qL1xuXHRcdC8qaWYodSA9PT0gaGFzKXtcblx0XHRcdGlmKGF0LlEpe1xuXHRcdFx0XHQvL2F0LlFbbXNnWycjJ11dID0gJyc7XG5cdFx0XHRcdC8vcmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0YXQuUSA9IHt9O1xuXHRcdH0qL1xuXHRcdHZhciBjdHggPSBtc2cuX3x8e30sIERCRyA9IGN0eC5EQkcgPSBtc2cuREJHO1xuXHRcdERCRyAmJiAoREJHLmcgPSArbmV3IERhdGUpO1xuXHRcdC8vY29uc29sZS5sb2coXCJHRVQ6XCIsIGdldCwgbm9kZSwgaGFzKTtcblx0XHRpZighbm9kZSl7IHJldHVybiByb290Lm9uKCdnZXQnLCBtc2cpIH1cblx0XHRpZihoYXMpe1xuXHRcdFx0aWYoJ3N0cmluZycgIT0gdHlwZW9mIGhhcyB8fCB1ID09PSBub2RlW2hhc10peyByZXR1cm4gcm9vdC5vbignZ2V0JywgbXNnKSB9XG5cdFx0XHRub2RlID0gc3RhdGVfaWZ5KHt9LCBoYXMsIHN0YXRlX2lzKG5vZGUsIGhhcyksIG5vZGVbaGFzXSwgc291bCk7XG5cdFx0XHQvLyBJZiB3ZSBoYXZlIGEga2V5IGluLW1lbW9yeSwgZG8gd2UgcmVhbGx5IG5lZWQgdG8gZmV0Y2g/XG5cdFx0XHQvLyBNYXliZS4uLiBpbiBjYXNlIHRoZSBpbi1tZW1vcnkga2V5IHdlIGhhdmUgaXMgYSBsb2NhbCB3cml0ZVxuXHRcdFx0Ly8gd2Ugc3RpbGwgbmVlZCB0byB0cmlnZ2VyIGEgcHVsbC9tZXJnZSBmcm9tIHBlZXJzLlxuXHRcdH1cblx0XHQvL0d1bi53aW5kb3c/IEd1bi5vYmouY29weShub2RlKSA6IG5vZGU7IC8vIEhOUEVSRjogSWYgIWJyb3dzZXIgYnVtcCBQZXJmb3JtYW5jZT8gSXMgdGhpcyB0b28gZGFuZ2Vyb3VzIHRvIHJlZmVyZW5jZSByb290IGdyYXBoPyBDb3B5IC8gc2hhbGxvdyBjb3B5IHRvbyBleHBlbnNpdmUgZm9yIGJpZyBub2Rlcy4gR3VuLm9iai50byhub2RlKTsgLy8gMSBsYXllciBkZWVwIGNvcHkgLy8gR3VuLm9iai5jb3B5KG5vZGUpOyAvLyB0b28gc2xvdyBvbiBiaWcgbm9kZXNcblx0XHRub2RlICYmIGFjayhtc2csIG5vZGUpO1xuXHRcdHJvb3Qub24oJ2dldCcsIG1zZyk7IC8vIHNlbmQgR0VUIHRvIHN0b3JhZ2UgYWRhcHRlcnMuXG5cdH1cblx0ZnVuY3Rpb24gYWNrKG1zZywgbm9kZSl7XG5cdFx0dmFyIFMgPSArbmV3IERhdGUsIGN0eCA9IG1zZy5ffHx7fSwgREJHID0gY3R4LkRCRyA9IG1zZy5EQkc7XG5cdFx0dmFyIHRvID0gbXNnWycjJ10sIGlkID0gdGV4dF9yYW5kKDkpLCBrZXlzID0gT2JqZWN0LmtleXMobm9kZXx8JycpLnNvcnQoKSwgc291bCA9ICgobm9kZXx8JycpLl98fCcnKVsnIyddLCBrbCA9IGtleXMubGVuZ3RoLCBqID0gMCwgcm9vdCA9IG1zZy4kLl8ucm9vdCwgRiA9IChub2RlID09PSByb290LmdyYXBoW3NvdWxdKTtcblx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICgoREJHfHxjdHgpLmdrID0gK25ldyBEYXRlKSAtIFMsICdnb3Qga2V5cycpO1xuXHRcdC8vIFBFUkY6IENvbnNpZGVyIGNvbW1lbnRpbmcgdGhpcyBvdXQgdG8gZm9yY2UgZGlzay1vbmx5IHJlYWRzIGZvciBwZXJmIHRlc3Rpbmc/IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93XG5cdFx0bm9kZSAmJiAoZnVuY3Rpb24gZ28oKXtcblx0XHRcdFMgPSArbmV3IERhdGU7XG5cdFx0XHR2YXIgaSA9IDAsIGssIHB1dCA9IHt9LCB0bXA7XG5cdFx0XHR3aGlsZShpIDwgOSAmJiAoayA9IGtleXNbaSsrXSkpe1xuXHRcdFx0XHRzdGF0ZV9pZnkocHV0LCBrLCBzdGF0ZV9pcyhub2RlLCBrKSwgbm9kZVtrXSwgc291bCk7XG5cdFx0XHR9XG5cdFx0XHRrZXlzID0ga2V5cy5zbGljZShpKTtcblx0XHRcdCh0bXAgPSB7fSlbc291bF0gPSBwdXQ7IHB1dCA9IHRtcDtcblx0XHRcdHZhciBmYWl0aDsgaWYoRil7IGZhaXRoID0gZnVuY3Rpb24oKXt9OyBmYWl0aC5yYW0gPSBmYWl0aC5mYWl0aCA9IHRydWU7IH0gLy8gSE5QRVJGOiBXZSdyZSB0ZXN0aW5nIHBlcmZvcm1hbmNlIGltcHJvdmVtZW50IGJ5IHNraXBwaW5nIGdvaW5nIHRocm91Z2ggc2VjdXJpdHkgYWdhaW4sIGJ1dCB0aGlzIHNob3VsZCBiZSBhdWRpdGVkLlxuXHRcdFx0dG1wID0ga2V5cy5sZW5ndGg7XG5cdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsIC0oUyAtIChTID0gK25ldyBEYXRlKSksICdnb3QgY29waWVkIHNvbWUnKTtcblx0XHRcdERCRyAmJiAoREJHLmdhID0gK25ldyBEYXRlKTtcblx0XHRcdHJvb3Qub24oJ2luJywgeydAJzogdG8sICcjJzogaWQsIHB1dDogcHV0LCAnJSc6ICh0bXA/IChpZCA9IHRleHRfcmFuZCg5KSkgOiB1KSwgJDogcm9vdC4kLCBfOiBmYWl0aCwgREJHOiBEQkd9KTtcblx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ2dvdCBpbicpO1xuXHRcdFx0aWYoIXRtcCl7IHJldHVybiB9XG5cdFx0XHRzZXRUaW1lb3V0LnR1cm4oZ28pO1xuXHRcdH0oKSk7XG5cdFx0aWYoIW5vZGUpeyByb290Lm9uKCdpbicsIHsnQCc6IG1zZ1snIyddfSkgfSAvLyBUT0RPOiBJIGRvbid0IHRoaW5rIEkgbGlrZSB0aGlzLCB0aGUgZGVmYXVsdCBsUyBhZGFwdGVyIHVzZXMgdGhpcyBidXQgXCJub3QgZm91bmRcIiBpcyBhIHNlbnNpdGl2ZSBpc3N1ZSwgc28gc2hvdWxkIHByb2JhYmx5IGJlIGhhbmRsZWQgbW9yZSBjYXJlZnVsbHkvaW5kaXZpZHVhbGx5LlxuXHR9IEd1bi5vbi5nZXQuYWNrID0gYWNrO1xufSgpKTtcblxuOyhmdW5jdGlvbigpe1xuXHRHdW4uY2hhaW4ub3B0ID0gZnVuY3Rpb24ob3B0KXtcblx0XHRvcHQgPSBvcHQgfHwge307XG5cdFx0dmFyIGd1biA9IHRoaXMsIGF0ID0gZ3VuLl8sIHRtcCA9IG9wdC5wZWVycyB8fCBvcHQ7XG5cdFx0aWYoIU9iamVjdC5wbGFpbihvcHQpKXsgb3B0ID0ge30gfVxuXHRcdGlmKCFPYmplY3QucGxhaW4oYXQub3B0KSl7IGF0Lm9wdCA9IG9wdCB9XG5cdFx0aWYoJ3N0cmluZycgPT0gdHlwZW9mIHRtcCl7IHRtcCA9IFt0bXBdIH1cblx0XHRpZih0bXAgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0XHRpZighT2JqZWN0LnBsYWluKGF0Lm9wdC5wZWVycykpeyBhdC5vcHQucGVlcnMgPSB7fX1cblx0XHRcdHRtcC5mb3JFYWNoKGZ1bmN0aW9uKHVybCl7XG5cdFx0XHRcdHZhciBwID0ge307IHAuaWQgPSBwLnVybCA9IHVybDtcblx0XHRcdFx0YXQub3B0LnBlZXJzW3VybF0gPSBhdC5vcHQucGVlcnNbdXJsXSB8fCBwO1xuXHRcdFx0fSlcblx0XHR9XG5cdFx0YXQub3B0LnBlZXJzID0gYXQub3B0LnBlZXJzIHx8IHt9O1xuXHRcdG9ial9lYWNoKG9wdCwgZnVuY3Rpb24gZWFjaChrKXsgdmFyIHYgPSB0aGlzW2tdO1xuXHRcdFx0aWYoKHRoaXMgJiYgdGhpcy5oYXNPd25Qcm9wZXJ0eShrKSkgfHwgJ3N0cmluZycgPT0gdHlwZW9mIHYgfHwgT2JqZWN0LmVtcHR5KHYpKXsgdGhpc1trXSA9IHY7IHJldHVybiB9XG5cdFx0XHRpZih2ICYmIHYuY29uc3RydWN0b3IgIT09IE9iamVjdCAmJiAhKHYgaW5zdGFuY2VvZiBBcnJheSkpeyByZXR1cm4gfVxuXHRcdFx0b2JqX2VhY2godiwgZWFjaCk7XG5cdFx0fSk7XG5cdFx0R3VuLm9uKCdvcHQnLCBhdCk7XG5cdFx0YXQub3B0LnV1aWQgPSBhdC5vcHQudXVpZCB8fCBmdW5jdGlvbiB1dWlkKGwpeyByZXR1cm4gR3VuLnN0YXRlKCkudG9TdHJpbmcoMzYpLnJlcGxhY2UoJy4nLCcnKSArIFN0cmluZy5yYW5kb20obHx8MTIpIH1cblx0XHRyZXR1cm4gZ3VuO1xuXHR9XG59KCkpO1xuXG52YXIgb2JqX2VhY2ggPSBmdW5jdGlvbihvLGYpeyBPYmplY3Qua2V5cyhvKS5mb3JFYWNoKGYsbykgfSwgdGV4dF9yYW5kID0gU3RyaW5nLnJhbmRvbSwgdHVybiA9IHNldFRpbWVvdXQudHVybiwgdmFsaWQgPSBHdW4udmFsaWQsIHN0YXRlX2lzID0gR3VuLnN0YXRlLmlzLCBzdGF0ZV9pZnkgPSBHdW4uc3RhdGUuaWZ5LCB1LCBlbXB0eSA9IHt9LCBDO1xuXG5HdW4ubG9nID0gZnVuY3Rpb24oKXsgcmV0dXJuICghR3VuLmxvZy5vZmYgJiYgQy5sb2cuYXBwbHkoQywgYXJndW1lbnRzKSksIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKCcgJykgfTtcbkd1bi5sb2cub25jZSA9IGZ1bmN0aW9uKHcscyxvKXsgcmV0dXJuIChvID0gR3VuLmxvZy5vbmNlKVt3XSA9IG9bd10gfHwgMCwgb1t3XSsrIHx8IEd1bi5sb2cocykgfTtcblxuaWYodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIil7ICh3aW5kb3cuR1VOID0gd2luZG93Lkd1biA9IEd1bikud2luZG93ID0gd2luZG93IH1cbnRyeXsgaWYodHlwZW9mIE1PRFVMRSAhPT0gXCJ1bmRlZmluZWRcIil7IE1PRFVMRS5leHBvcnRzID0gR3VuIH0gfWNhdGNoKGUpe31cbm1vZHVsZS5leHBvcnRzID0gR3VuO1xuXG4oR3VuLndpbmRvd3x8e30pLmNvbnNvbGUgPSAoR3VuLndpbmRvd3x8e30pLmNvbnNvbGUgfHwge2xvZzogZnVuY3Rpb24oKXt9fTtcbihDID0gY29uc29sZSkub25seSA9IGZ1bmN0aW9uKGksIHMpeyByZXR1cm4gKEMub25seS5pICYmIGkgPT09IEMub25seS5pICYmIEMub25seS5pKyspICYmIChDLmxvZy5hcHBseShDLCBhcmd1bWVudHMpIHx8IHMpIH07XG5cbjtcIlBsZWFzZSBkbyBub3QgcmVtb3ZlIHdlbGNvbWUgbG9nIHVubGVzcyB5b3UgYXJlIHBheWluZyBmb3IgYSBtb250aGx5IHNwb25zb3JzaGlwLCB0aGFua3MhXCI7XG5HdW4ubG9nLm9uY2UoXCJ3ZWxjb21lXCIsIFwiSGVsbG8gd29uZGVyZnVsIHBlcnNvbiEgOikgVGhhbmtzIGZvciB1c2luZyBHVU4sIHBsZWFzZSBhc2sgZm9yIGhlbHAgb24gaHR0cDovL2NoYXQuZ3VuLmVjbyBpZiBhbnl0aGluZyB0YWtlcyB5b3UgbG9uZ2VyIHRoYW4gNW1pbiB0byBmaWd1cmUgb3V0IVwiKTtcblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9pbmRleCcpO1xuR3VuLmNoYWluLnNldCA9IGZ1bmN0aW9uKGl0ZW0sIGNiLCBvcHQpe1xuXHR2YXIgZ3VuID0gdGhpcywgcm9vdCA9IGd1bi5iYWNrKC0xKSwgc291bCwgdG1wO1xuXHRjYiA9IGNiIHx8IGZ1bmN0aW9uKCl7fTtcblx0b3B0ID0gb3B0IHx8IHt9OyBvcHQuaXRlbSA9IG9wdC5pdGVtIHx8IGl0ZW07XG5cdGlmKHNvdWwgPSAoKGl0ZW18fCcnKS5ffHwnJylbJyMnXSl7IChpdGVtID0ge30pWycjJ10gPSBzb3VsIH0gLy8gY2hlY2sgaWYgbm9kZSwgbWFrZSBsaW5rLlxuXHRpZignc3RyaW5nJyA9PSB0eXBlb2YgKHRtcCA9IEd1bi52YWxpZChpdGVtKSkpeyByZXR1cm4gZ3VuLmdldChzb3VsID0gdG1wKS5wdXQoaXRlbSwgY2IsIG9wdCkgfSAvLyBjaGVjayBpZiBsaW5rXG5cdGlmKCFHdW4uaXMoaXRlbSkpe1xuXHRcdGlmKE9iamVjdC5wbGFpbihpdGVtKSl7XG5cdFx0XHRpdGVtID0gcm9vdC5nZXQoc291bCA9IGd1bi5iYWNrKCdvcHQudXVpZCcpKCkpLnB1dChpdGVtKTtcblx0XHR9XG5cdFx0cmV0dXJuIGd1bi5nZXQoc291bCB8fCByb290LmJhY2soJ29wdC51dWlkJykoNykpLnB1dChpdGVtLCBjYiwgb3B0KTtcblx0fVxuXHRndW4ucHV0KGZ1bmN0aW9uKGdvKXtcblx0XHRpdGVtLmdldChmdW5jdGlvbihzb3VsLCBvLCBtc2cpeyAvLyBUT0RPOiBCVUchIFdlIG5vIGxvbmdlciBoYXZlIHRoaXMgb3B0aW9uPyAmIGdvIGVycm9yIG5vdCBoYW5kbGVkP1xuXHRcdFx0aWYoIXNvdWwpeyByZXR1cm4gY2IuY2FsbChndW4sIHtlcnI6IEd1bi5sb2coJ09ubHkgYSBub2RlIGNhbiBiZSBsaW5rZWQhIE5vdCBcIicgKyBtc2cucHV0ICsgJ1wiIScpfSkgfVxuXHRcdFx0KHRtcCA9IHt9KVtzb3VsXSA9IHsnIyc6IHNvdWx9OyBnbyh0bXApO1xuXHRcdH0sdHJ1ZSk7XG5cdH0pXG5cdHJldHVybiBpdGVtO1xufVxuXHQiLCJcbi8vIFNoaW0gZm9yIGdlbmVyaWMgamF2YXNjcmlwdCB1dGlsaXRpZXMuXG5TdHJpbmcucmFuZG9tID0gZnVuY3Rpb24obCwgYyl7XG5cdHZhciBzID0gJyc7XG5cdGwgPSBsIHx8IDI0OyAvLyB5b3UgYXJlIG5vdCBnb2luZyB0byBtYWtlIGEgMCBsZW5ndGggcmFuZG9tIG51bWJlciwgc28gbm8gbmVlZCB0byBjaGVjayB0eXBlXG5cdGMgPSBjIHx8ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Jztcblx0d2hpbGUobC0tID4gMCl7IHMgKz0gYy5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYy5sZW5ndGgpKSB9XG5cdHJldHVybiBzO1xufVxuU3RyaW5nLm1hdGNoID0gZnVuY3Rpb24odCwgbyl7IHZhciB0bXAsIHU7XG5cdGlmKCdzdHJpbmcnICE9PSB0eXBlb2YgdCl7IHJldHVybiBmYWxzZSB9XG5cdGlmKCdzdHJpbmcnID09IHR5cGVvZiBvKXsgbyA9IHsnPSc6IG99IH1cblx0byA9IG8gfHwge307XG5cdHRtcCA9IChvWyc9J10gfHwgb1snKiddIHx8IG9bJz4nXSB8fCBvWyc8J10pO1xuXHRpZih0ID09PSB0bXApeyByZXR1cm4gdHJ1ZSB9XG5cdGlmKHUgIT09IG9bJz0nXSl7IHJldHVybiBmYWxzZSB9XG5cdHRtcCA9IChvWycqJ10gfHwgb1snPiddKTtcblx0aWYodC5zbGljZSgwLCAodG1wfHwnJykubGVuZ3RoKSA9PT0gdG1wKXsgcmV0dXJuIHRydWUgfVxuXHRpZih1ICE9PSBvWycqJ10peyByZXR1cm4gZmFsc2UgfVxuXHRpZih1ICE9PSBvWyc+J10gJiYgdSAhPT0gb1snPCddKXtcblx0XHRyZXR1cm4gKHQgPj0gb1snPiddICYmIHQgPD0gb1snPCddKT8gdHJ1ZSA6IGZhbHNlO1xuXHR9XG5cdGlmKHUgIT09IG9bJz4nXSAmJiB0ID49IG9bJz4nXSl7IHJldHVybiB0cnVlIH1cblx0aWYodSAhPT0gb1snPCddICYmIHQgPD0gb1snPCddKXsgcmV0dXJuIHRydWUgfVxuXHRyZXR1cm4gZmFsc2U7XG59XG5TdHJpbmcuaGFzaCA9IGZ1bmN0aW9uKHMsIGMpeyAvLyB2aWEgU09cblx0aWYodHlwZW9mIHMgIT09ICdzdHJpbmcnKXsgcmV0dXJuIH1cblx0ICAgIGMgPSBjIHx8IDA7IC8vIENQVSBzY2hlZHVsZSBoYXNoaW5nIGJ5XG5cdCAgICBpZighcy5sZW5ndGgpeyByZXR1cm4gYyB9XG5cdCAgICBmb3IodmFyIGk9MCxsPXMubGVuZ3RoLG47IGk8bDsgKytpKXtcblx0ICAgICAgbiA9IHMuY2hhckNvZGVBdChpKTtcblx0ICAgICAgYyA9ICgoYzw8NSktYykrbjtcblx0ICAgICAgYyB8PSAwO1xuXHQgICAgfVxuXHQgICAgcmV0dXJuIGM7XG5cdCAgfVxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5PYmplY3QucGxhaW4gPSBmdW5jdGlvbihvKXsgcmV0dXJuIG8/IChvIGluc3RhbmNlb2YgT2JqZWN0ICYmIG8uY29uc3RydWN0b3IgPT09IE9iamVjdCkgfHwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9eXFxbb2JqZWN0IChcXHcrKVxcXSQvKVsxXSA9PT0gJ09iamVjdCcgOiBmYWxzZSB9XG5PYmplY3QuZW1wdHkgPSBmdW5jdGlvbihvLCBuKXtcblx0Zm9yKHZhciBrIGluIG8peyBpZihoYXMuY2FsbChvLCBrKSAmJiAoIW4gfHwgLTE9PW4uaW5kZXhPZihrKSkpeyByZXR1cm4gZmFsc2UgfSB9XG5cdHJldHVybiB0cnVlO1xufVxuT2JqZWN0LmtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbihvKXtcblx0dmFyIGwgPSBbXTtcblx0Zm9yKHZhciBrIGluIG8peyBpZihoYXMuY2FsbChvLCBrKSl7IGwucHVzaChrKSB9IH1cblx0cmV0dXJuIGw7XG59XG47KGZ1bmN0aW9uKCl7IC8vIG1heCB+MW1zIG9yIGJlZm9yZSBzdGFjayBvdmVyZmxvdyBcblx0dmFyIHUsIHNUID0gc2V0VGltZW91dCwgbCA9IDAsIGMgPSAwLCBzSSA9ICh0eXBlb2Ygc2V0SW1tZWRpYXRlICE9PSAnJyt1ICYmIHNldEltbWVkaWF0ZSkgfHwgc1Q7IC8vIHF1ZXVlTWljcm90YXNrIGZhc3RlciBidXQgYmxvY2tzIFVJXG5cdHNULnBvbGwgPSBzVC5wb2xsIHx8IGZ1bmN0aW9uKGYpeyAvL2YoKTsgcmV0dXJuOyAvLyBmb3IgdGVzdGluZ1xuXHRcdGlmKCgxID49ICgrbmV3IERhdGUgLSBsKSkgJiYgYysrIDwgMzMzMyl7IGYoKTsgcmV0dXJuIH1cblx0XHRzSShmdW5jdGlvbigpeyBsID0gK25ldyBEYXRlOyBmKCkgfSxjPTApXG5cdH1cbn0oKSk7XG47KGZ1bmN0aW9uKCl7IC8vIFRvbyBtYW55IHBvbGxzIGJsb2NrLCB0aGlzIFwidGhyZWFkc1wiIHRoZW0gaW4gdHVybnMgb3ZlciBhIHNpbmdsZSB0aHJlYWQgaW4gdGltZS5cblx0dmFyIHNUID0gc2V0VGltZW91dCwgdCA9IHNULnR1cm4gPSBzVC50dXJuIHx8IGZ1bmN0aW9uKGYpeyAxID09IHMucHVzaChmKSAmJiBwKFQpIH1cblx0LCBzID0gdC5zID0gW10sIHAgPSBzVC5wb2xsLCBpID0gMCwgZiwgVCA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYoZiA9IHNbaSsrXSl7IGYoKSB9XG5cdFx0aWYoaSA9PSBzLmxlbmd0aCB8fCA5OSA9PSBpKXtcblx0XHRcdHMgPSB0LnMgPSBzLnNsaWNlKGkpO1xuXHRcdFx0aSA9IDA7XG5cdFx0fVxuXHRcdGlmKHMubGVuZ3RoKXsgcChUKSB9XG5cdH1cbn0oKSk7XG47KGZ1bmN0aW9uKCl7XG5cdHZhciB1LCBzVCA9IHNldFRpbWVvdXQsIFQgPSBzVC50dXJuO1xuXHQoc1QuZWFjaCA9IHNULmVhY2ggfHwgZnVuY3Rpb24obCxmLGUsUyl7IFMgPSBTIHx8IDk7IChmdW5jdGlvbiB0KHMsTCxyKXtcblx0ICBpZihMID0gKHMgPSAobHx8W10pLnNwbGljZSgwLFMpKS5sZW5ndGgpe1xuXHQgIFx0Zm9yKHZhciBpID0gMDsgaSA8IEw7IGkrKyl7XG5cdCAgXHRcdGlmKHUgIT09IChyID0gZihzW2ldKSkpeyBicmVhayB9XG5cdCAgXHR9XG5cdCAgXHRpZih1ID09PSByKXsgVCh0KTsgcmV0dXJuIH1cblx0ICB9IGUgJiYgZShyKTtcblx0fSgpKX0pKCk7XG59KCkpO1xuXHQiLCJcbnJlcXVpcmUoJy4vc2hpbScpO1xuZnVuY3Rpb24gU3RhdGUoKXtcblx0dmFyIHQgPSArbmV3IERhdGU7XG5cdGlmKGxhc3QgPCB0KXtcblx0XHRyZXR1cm4gTiA9IDAsIGxhc3QgPSB0ICsgU3RhdGUuZHJpZnQ7XG5cdH1cblx0cmV0dXJuIGxhc3QgPSB0ICsgKChOICs9IDEpIC8gRCkgKyBTdGF0ZS5kcmlmdDtcbn1cblN0YXRlLmRyaWZ0ID0gMDtcbnZhciBOSSA9IC1JbmZpbml0eSwgTiA9IDAsIEQgPSA5OTksIGxhc3QgPSBOSSwgdTsgLy8gV0FSTklORyEgSW4gdGhlIGZ1dHVyZSwgb24gbWFjaGluZXMgdGhhdCBhcmUgRCB0aW1lcyBmYXN0ZXIgdGhhbiAyMDE2QUQgbWFjaGluZXMsIHlvdSB3aWxsIHdhbnQgdG8gaW5jcmVhc2UgRCBieSBhbm90aGVyIHNldmVyYWwgb3JkZXJzIG9mIG1hZ25pdHVkZSBzbyB0aGUgcHJvY2Vzc2luZyBzcGVlZCBuZXZlciBvdXQgcGFjZXMgdGhlIGRlY2ltYWwgcmVzb2x1dGlvbiAoaW5jcmVhc2luZyBhbiBpbnRlZ2VyIGVmZmVjdHMgdGhlIHN0YXRlIGFjY3VyYWN5KS5cblN0YXRlLmlzID0gZnVuY3Rpb24obiwgaywgbyl7IC8vIGNvbnZlbmllbmNlIGZ1bmN0aW9uIHRvIGdldCB0aGUgc3RhdGUgb24gYSBrZXkgb24gYSBub2RlIGFuZCByZXR1cm4gaXQuXG5cdHZhciB0bXAgPSAoayAmJiBuICYmIG4uXyAmJiBuLl9bJz4nXSkgfHwgbztcblx0aWYoIXRtcCl7IHJldHVybiB9XG5cdHJldHVybiAoJ251bWJlcicgPT0gdHlwZW9mICh0bXAgPSB0bXBba10pKT8gdG1wIDogTkk7XG59XG5TdGF0ZS5pZnkgPSBmdW5jdGlvbihuLCBrLCBzLCB2LCBzb3VsKXsgLy8gcHV0IGEga2V5J3Mgc3RhdGUgb24gYSBub2RlLlxuXHQobiA9IG4gfHwge30pLl8gPSBuLl8gfHwge307IC8vIHNhZmV0eSBjaGVjayBvciBpbml0LlxuXHRpZihzb3VsKXsgbi5fWycjJ10gPSBzb3VsIH0gLy8gc2V0IGEgc291bCBpZiBzcGVjaWZpZWQuXG5cdHZhciB0bXAgPSBuLl9bJz4nXSB8fCAobi5fWyc+J10gPSB7fSk7IC8vIGdyYWIgdGhlIHN0YXRlcyBkYXRhLlxuXHRpZih1ICE9PSBrICYmIGsgIT09ICdfJyl7XG5cdFx0aWYoJ251bWJlcicgPT0gdHlwZW9mIHMpeyB0bXBba10gPSBzIH0gLy8gYWRkIHRoZSB2YWxpZCBzdGF0ZS5cblx0XHRpZih1ICE9PSB2KXsgbltrXSA9IHYgfSAvLyBOb3RlOiBOb3QgaXRzIGpvYiB0byBjaGVjayBmb3IgdmFsaWQgdmFsdWVzIVxuXHR9XG5cdHJldHVybiBuO1xufVxubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZTtcblx0IiwiLy8gVmFsaWQgdmFsdWVzIGFyZSBhIHN1YnNldCBvZiBKU09OOiBudWxsLCBiaW5hcnksIG51bWJlciAoIUluZmluaXR5KSwgdGV4dCxcbi8vIG9yIGEgc291bCByZWxhdGlvbi4gQXJyYXlzIG5lZWQgc3BlY2lhbCBhbGdvcml0aG1zIHRvIGhhbmRsZSBjb25jdXJyZW5jeSxcbi8vIHNvIHRoZXkgYXJlIG5vdCBzdXBwb3J0ZWQgZGlyZWN0bHkuIFVzZSBhbiBleHRlbnNpb24gdGhhdCBzdXBwb3J0cyB0aGVtIGlmXG4vLyBuZWVkZWQgYnV0IHJlc2VhcmNoIHRoZWlyIHByb2JsZW1zIGZpcnN0LlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodikge1xuICAvLyBcImRlbGV0ZXNcIiwgbnVsbGluZyBvdXQga2V5cy5cbiAgcmV0dXJuIHYgPT09IG51bGwgfHxcbiAgICBcInN0cmluZ1wiID09PSB0eXBlb2YgdiB8fFxuICAgIFwiYm9vbGVhblwiID09PSB0eXBlb2YgdiB8fFxuICAgIC8vIHdlIHdhbnQgKy8tIEluZmluaXR5IHRvIGJlLCBidXQgSlNPTiBkb2VzIG5vdCBzdXBwb3J0IGl0LCBzYWQgZmFjZS5cbiAgICAvLyBjYW4geW91IGd1ZXNzIHdoYXQgdiA9PT0gdiBjaGVja3MgZm9yPyA7KVxuICAgIChcIm51bWJlclwiID09PSB0eXBlb2YgdiAmJiB2ICE9IEluZmluaXR5ICYmIHYgIT0gLUluZmluaXR5ICYmIHYgPT09IHYpIHx8XG4gICAgKCEhdiAmJiBcInN0cmluZ1wiID09IHR5cGVvZiB2W1wiI1wiXSAmJiBPYmplY3Qua2V5cyh2KS5sZW5ndGggPT09IDEgJiYgdltcIiNcIl0pO1xufVxuIiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi4vaW5kZXgnKTtcbkd1bi5NZXNoID0gcmVxdWlyZSgnLi9tZXNoJyk7XG5cbi8vIFRPRE86IHJlc3luYyB1cG9uIHJlY29ubmVjdCBvbmxpbmUvb2ZmbGluZVxuLy93aW5kb3cub25vbmxpbmUgPSB3aW5kb3cub25vZmZsaW5lID0gZnVuY3Rpb24oKXsgY29uc29sZS5sb2coJ29ubGluZT8nLCBuYXZpZ2F0b3Iub25MaW5lKSB9XG5cbkd1bi5vbignb3B0JywgZnVuY3Rpb24ocm9vdCl7XG5cdHRoaXMudG8ubmV4dChyb290KTtcblx0aWYocm9vdC5vbmNlKXsgcmV0dXJuIH1cblx0dmFyIG9wdCA9IHJvb3Qub3B0O1xuXHRpZihmYWxzZSA9PT0gb3B0LldlYlNvY2tldCl7IHJldHVybiB9XG5cblx0dmFyIGVudiA9IEd1bi53aW5kb3cgfHwge307XG5cdHZhciB3ZWJzb2NrZXQgPSBvcHQuV2ViU29ja2V0IHx8IGVudi5XZWJTb2NrZXQgfHwgZW52LndlYmtpdFdlYlNvY2tldCB8fCBlbnYubW96V2ViU29ja2V0O1xuXHRpZighd2Vic29ja2V0KXsgcmV0dXJuIH1cblx0b3B0LldlYlNvY2tldCA9IHdlYnNvY2tldDtcblxuXHR2YXIgbWVzaCA9IG9wdC5tZXNoID0gb3B0Lm1lc2ggfHwgR3VuLk1lc2gocm9vdCk7XG5cblx0dmFyIHdpcmUgPSBtZXNoLndpcmUgfHwgb3B0LndpcmU7XG5cdG1lc2gud2lyZSA9IG9wdC53aXJlID0gb3Blbjtcblx0ZnVuY3Rpb24gb3BlbihwZWVyKXsgdHJ5e1xuXHRcdGlmKCFwZWVyIHx8ICFwZWVyLnVybCl7IHJldHVybiB3aXJlICYmIHdpcmUocGVlcikgfVxuXHRcdHZhciB1cmwgPSBwZWVyLnVybC5yZXBsYWNlKC9eaHR0cC8sICd3cycpO1xuXHRcdHZhciB3aXJlID0gcGVlci53aXJlID0gbmV3IG9wdC5XZWJTb2NrZXQodXJsKTtcblx0XHR3aXJlLm9uY2xvc2UgPSBmdW5jdGlvbigpe1xuXHRcdFx0b3B0Lm1lc2guYnllKHBlZXIpO1xuXHRcdFx0cmVjb25uZWN0KHBlZXIpO1xuXHRcdH07XG5cdFx0d2lyZS5vbmVycm9yID0gZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0cmVjb25uZWN0KHBlZXIpO1xuXHRcdH07XG5cdFx0d2lyZS5vbm9wZW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0b3B0Lm1lc2guaGkocGVlcik7XG5cdFx0fVxuXHRcdHdpcmUub25tZXNzYWdlID0gZnVuY3Rpb24obXNnKXtcblx0XHRcdGlmKCFtc2cpeyByZXR1cm4gfVxuXHRcdFx0b3B0Lm1lc2guaGVhcihtc2cuZGF0YSB8fCBtc2csIHBlZXIpO1xuXHRcdH07XG5cdFx0cmV0dXJuIHdpcmU7XG5cdH1jYXRjaChlKXt9fVxuXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgIW9wdC5zdXBlciAmJiByb290Lm9uKCdvdXQnLCB7ZGFtOidoaSd9KSB9LDEpOyAvLyBpdCBjYW4gdGFrZSBhIHdoaWxlIHRvIG9wZW4gYSBzb2NrZXQsIHNvIG1heWJlIG5vIGxvbmdlciBsYXp5IGxvYWQgZm9yIHBlcmYgcmVhc29ucz9cblxuXHR2YXIgd2FpdCA9IDIgKiA5OTk7XG5cdGZ1bmN0aW9uIHJlY29ubmVjdChwZWVyKXtcblx0XHRjbGVhclRpbWVvdXQocGVlci5kZWZlcik7XG5cdFx0aWYoZG9jICYmIHBlZXIucmV0cnkgPD0gMCl7IHJldHVybiB9XG5cdFx0cGVlci5yZXRyeSA9IChwZWVyLnJldHJ5IHx8IG9wdC5yZXRyeSsxIHx8IDYwKSAtICgoLXBlZXIudHJpZWQgKyAocGVlci50cmllZCA9ICtuZXcgRGF0ZSkgPCB3YWl0KjQpPzE6MCk7XG5cdFx0cGVlci5kZWZlciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gdG8oKXtcblx0XHRcdGlmKGRvYyAmJiBkb2MuaGlkZGVuKXsgcmV0dXJuIHNldFRpbWVvdXQodG8sd2FpdCkgfVxuXHRcdFx0b3BlbihwZWVyKTtcblx0XHR9LCB3YWl0KTtcblx0fVxuXHR2YXIgZG9jID0gKCcnK3UgIT09IHR5cGVvZiBkb2N1bWVudCkgJiYgZG9jdW1lbnQ7XG59KTtcbnZhciBub29wID0gZnVuY3Rpb24oKXt9LCB1O1xuXHQiLCJcblxudmFyIEd1biA9ICAgcmVxdWlyZSgnZ3VuL3NyYy9yb290Jyk7XG5yZXF1aXJlKCdndW4vc3JjL3NoaW0nKTtcbnJlcXVpcmUoJ2d1bi9zcmMvb250bycpO1xucmVxdWlyZSgnZ3VuL3NyYy92YWxpZCcpO1xucmVxdWlyZSgnZ3VuL3NyYy9zdGF0ZScpO1xucmVxdWlyZSgnZ3VuL3NyYy9kdXAnKTtcbnJlcXVpcmUoJ2d1bi9zcmMvYXNrJyk7XG5yZXF1aXJlKCdndW4vc3JjL2NoYWluJyk7XG5yZXF1aXJlKCdndW4vc3JjL2JhY2snKTtcbnJlcXVpcmUoJ2d1bi9zcmMvcHV0Jyk7XG5yZXF1aXJlKCdndW4vc3JjL2dldCcpO1xucmVxdWlyZSgnZ3VuL3NyYy9vbicpO1xucmVxdWlyZSgnZ3VuL3NyYy9tYXAnKTtcbnJlcXVpcmUoJ2d1bi9zcmMvc2V0Jyk7XG5yZXF1aXJlKCdndW4vc3JjL21lc2gnKTtcbnJlcXVpcmUoJ2d1bi9zcmMvd2Vic29ja2V0Jyk7XG5yZXF1aXJlKCdndW4vc3JjL2xvY2FsU3RvcmFnZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEd1bjsiXX0=

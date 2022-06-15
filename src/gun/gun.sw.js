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
// require('./src/localStorage');

require('./lib/store');
require('./lib/rfs');
require("./lib/radix");
require("./lib/radisk");

require('./lib/axe');

//default extra gun lis to include
require('./lib/lex');

// require("./nts");
require("./lib/unset");
require("./lib/not");
require("./lib/open");
require("./lib/load");


require("./lib/rindexed");





//include sea in the build
require('./sea');


module.exports = Gun;

},{"./lib/axe":2,"./lib/lex":3,"./lib/load":4,"./lib/not":5,"./lib/open":6,"./lib/radisk":7,"./lib/radix":8,"./lib/rfs":10,"./lib/rindexed":11,"./lib/store":12,"./lib/unset":13,"./sea":15,"./src/ask":16,"./src/back":17,"./src/chain":18,"./src/dup":19,"./src/get":20,"./src/map":22,"./src/mesh":23,"./src/on":24,"./src/onto":25,"./src/put":26,"./src/root":27,"./src/set":28,"./src/shim":29,"./src/state":30,"./src/valid":31,"./src/websocket":32}],2:[function(require,module,exports){
// I don't quite know where this should go yet, so putting it here
// what will probably wind up happening is that minimal AXE logic added to end of gun.js
// and then rest of AXE logic (here) will be moved back to gun/axe.js
// but for now... I gotta rush this out!
var Gun = (typeof window !== "undefined")? window.Gun : require('../gun'), u;
Gun.on('opt', function(at){ start(at); this.to.next(at) }); // make sure to call the "next" middleware adapter.
// TODO: BUG: panic test/panic/1 & test/panic/3 fail when AXE is on.
function start(root){
	if(root.axe){ return }
	var opt = root.opt, peers = opt.peers;
	if(false === opt.axe){ return }
	if((typeof process !== "undefined") && 'false' === ''+(process.env||'').AXE){ return }
	Gun.log.once("AXE relay enabled!");
	var axe = root.axe = {}, tmp, id;
	var mesh = opt.mesh = opt.mesh || Gun.Mesh(root); // DAM!
	var dup = root.dup;

	mesh.way = function(msg){
		if(!msg){ return }
		if(msg.get){ return GET(msg) }
		if(msg.put){ return }
		fall(msg);
	}

	function GET(msg){
		if(!msg){ return }
		var via = (msg._||'').via, soul, has, tmp, ref;
		if(!via || !via.id){ return fall(msg) }
		var sub = (via.sub || (via.sub = new Object.Map));
		if('string' == typeof (soul = msg.get['#'])){ ref = root.$.get(soul) }
		if('string' == typeof (tmp = msg.get['.'])){ has = tmp } else { has = '' }
		ref && (sub.get(soul) || (sub.set(soul, tmp = new Object.Map) && tmp)).set(has, 1); // {soul: {'':1, has: 1}}
		if(!(ref = (ref||'')._)){ return fall(msg) }
		ref.asked = +new Date;
		(ref.route || (ref.route = new Object.Map)).set(via.id, via); // this approach is not gonna scale how I want it to, but try for now.
		GET.turn(msg, ref.route, 0);
	}
	GET.turn = function(msg, route, turn){
		var tmp = msg['#'], tag = dup.s[tmp], next; 
		if(!tmp || !tag){ return } // message timed out, GUN may require us to relay, tho AXE does not like that. Rethink?
		// TOOD: BUG! Handle edge case where live updates occur while these turn hashes are being checked (they'll never be consistent), but we don't want to degrade to O(N), if we know the via asking peer got an update, then we should do something like cancel these turns asking for data.
		// Ideas: Save a random seed that sorts the route, store it and the index. // Or indexing on lowest latency is probably better.
		clearTimeout(tag.lack);
		if(tag.ack && (tmp = tag['##']) && msg['##'] === tmp){ return } // hashes match, stop asking other peers!
		next = (Object.maps(route||opt.peers)).slice(turn = turn || 0);
		if(!next.length){
			if(!route){ return } // asked all peers, stop asking!
			GET.turn(msg, u, 0); // asked all subs, now now ask any peers. (not always the best idea, but stays )
			return;
		}
		setTimeout.each(next, function(id){
			var peer = opt.peers[id]; turn++;
			if(!peer || !peer.wire){ route && route.delete(id); return } // bye!
			if(mesh.say(msg, peer) === false){ return } // was self
			if(0 == (turn % 3)){ return 1 }
		}, function(){
			tag['##'] = msg['##']; // should probably set this in a more clever manner, do live `in` checks ++ --, etc. but being lazy for now. // TODO: Yes, see `in` TODO, currently this might match against only in-mem cause no other peers reply, which is "fine", but could cause a false positive.
			tag.lack = setTimeout(function(){ GET.turn(msg, route, turn) }, 25);
		}, 3);
	}
	function fall(msg){ mesh.say(msg, opt.peers) }
	
	root.on('in', function(msg){ var to = this.to, tmp;
		if((tmp = msg['@']) && (tmp = dup.s[tmp])){
			tmp.ack = (tmp.ack || 0) + 1; // count remote ACKs to GET. // TODO: If mismatch, should trigger next asks.
			if((tmp = tmp.back)){ // backtrack OKs since AXE splits PUTs up.
				setTimeout.each(Object.keys(tmp), function(id){
					to.next({'#': msg['#'], '@': id, ok: msg.ok});
				});
				return;
			}
		} 
		to.next(msg);
	});

	root.on('create', function(){
		var Q = {};
		root.on('put', function(msg){
			var eve = this, at = eve.as, put = msg.put, soul = put['#'], has = put['.'], val = put[':'], state = put['>'], q, tmp;
			eve.to.next(msg);
			if(msg['@']){ return } // acks send existing data, not updates, so no need to resend to others.
			if(!soul || !has){ return }
			var ref = root.$.get(soul)._, route = (ref||'').route;
			//'test' === soul && console.log(Object.port, ''+msg['#'], has, val, route && route.keys());
			if(!route){ return }
			if(ref.skip){ ref.skip.now = msg['#']; return }
			(ref.skip = {now: msg['#']}).to = setTimeout(function(){
			setTimeout.each(Object.maps(route), function(pid){ var peer, tmp;
				if(!(peer = route.get(pid))){ return }
				if(!peer.wire){ route.delete(pid); return } // bye!
				var sub = (peer.sub || (peer.sub = new Object.Map)).get(soul);
				if(!sub){ return }
				if(!sub.get(has) && !sub.get('')){ return }
				var put = peer.put || (peer.put = {});
				var node = root.graph[soul], tmp;
				if(node && u !== (tmp = node[has])){
					state = state_is(node, has);
					val = tmp;
				}
				put[soul] = state_ify(put[soul], has, state, val, soul);
				tmp = dup.track(peer.next = peer.next || String.random(9));
				(tmp.back || (tmp.back = {}))[''+ref.skip.now] = 1;
				if(peer.to){ return }
				peer.to = setTimeout(function(){ flush(peer) }, opt.gap);
			}) }, 9);
		});
	});

	function flush(peer){
		var msg = {'#': peer.next, put: peer.put, ok: {'@': 3, '/': mesh.near}}; // BUG: TODO: sub count!
		// TODO: what about DAM's >< dedup? Current thinking is, don't use it, however, you could store first msg# & latest msg#, and if here... latest === first then likely it is the same >< thing, so if(firstMsg['><'][peer.id]){ return } don't send.
		peer.next = peer.put = peer.to = null;
		mesh.say(msg, peer);
	}
	var state_ify = Gun.state.ify, state_is = Gun.state.is;

	;(function(){ // THIS IS THE UP MODULE;
		axe.up = {};
		var hi = mesh.hear['?']; // lower-level integration with DAM! This is abnormal but helps performance.
		mesh.hear['?'] = function(msg, peer){ var p; // deduplicate unnecessary connections:
			hi(msg, peer);
			if(!peer.pid){ return }
			if(peer.pid === opt.pid){ mesh.bye(peer); return } // if I connected to myself, drop.
			if(p = axe.up[peer.pid]){ // if we both connected to each other...
				if(p === peer){ return } // do nothing if no conflict,
				if(opt.pid > peer.pid){ // else deterministically sort
					p = peer; // so we will wind up choosing the same to keep
					peer = axe.up[p.pid]; // and the same to drop.
				}
				p.url = p.url || peer.url; // copy if not
				mesh.bye(peer); // drop
				axe.up[p.pid] = p; // update same to be same.
				return;
			}
			if(!peer.url){ return }
			axe.up[peer.pid] = peer;
		};
	}());

	;(function(){ // THIS IS THE MOB MODULE;
		//return; // WORK IN PROGRESS, TEST FINALIZED, NEED TO MAKE STABLE.
		/*
			AXE should have a couple of threshold items...
			let's pretend there is a variable max peers connected
			mob = 10000
			if we get more peers than that...
			we should start sending those peers a remote command
			that they should connect to this or that other peer
			and then once they (or before they do?) drop them from us.
			sake of the test... gonna set that peer number to 1.
			The mob threshold might be determined by other factors,
			like how much RAM or CPU stress we have.
		*/
		opt.mob = opt.mob || 9900; // should be based on ulimit, some clouds as low as 10K.

		// handle rebalancing a mob of peers:
		root.on('hi', function(peer){
			this.to.next(peer);
			if(peer.url){ return } // I am assuming that if we are wanting to make an outbound connection to them, that we don't ever want to drop them unless our actual config settings change.
			var count = /*Object.keys(opt.peers).length ||*/ mesh.near; // TODO: BUG! This is slow, use .near, but near is buggy right now, fix in DAM.
			//console.log("are we mobbed?", opt.mob, Object.keys(opt.peers).length, mesh.near);
			if(opt.mob >= count){ return }  // TODO: Make dynamic based on RAM/CPU also. Or possibly even weird stuff like opt.mob / axe.up length?
			var peers = {};Object.keys(axe.up).forEach(function(p){ p = axe.up[p]; p.url && (peers[p.url]={}) });
			// TODO: BUG!!! Infinite reconnection loop happens if not enough relays, or if some are missing. For instance, :8766 says to connect to :8767 which then says to connect to :8766. To not DDoS when system overload, figure clever way to tell peers to retry later, that network does not have enough capacity?
			mesh.say({dam: 'mob', mob: count, peers: peers}, peer);
			setTimeout(function(){ mesh.bye(peer) }, 9); // something with better perf?
		});
		root.on('bye', function(peer){
			this.to.next(peer);
		});

	}());
}

;(function(){
	var from = Array.from;
	Object.maps = function(o){
		if(from && o instanceof Map){ return from(o.keys()) }
		if(o instanceof Object.Map){ o = o.s }
		return Object.keys(o);
	}
	if(from){ return Object.Map = Map }
	(Object.Map = function(){ this.s = {} }).prototype = {set:function(k,v){this.s[k]=v;return this},get:function(k){return this.s[k]},delete:function(k){delete this.s[k]}};
}());

},{"../gun":1}],3:[function(require,module,exports){
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
},{"../gun":1}],4:[function(require,module,exports){
var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
Gun.chain.open || require('./open');

Gun.chain.load = function(cb, opt, at){
	(opt = opt || {}).off = !0;
	return this.open(cb, opt, at);
}
},{"../gun":1,"./open":6}],5:[function(require,module,exports){
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
},{"../gun":1}],6:[function(require,module,exports){
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
},{"../gun":1}],7:[function(require,module,exports){
;(function(){

	function Radisk(opt){

		opt = opt || {};
		opt.log = opt.log || console.log;
		opt.file = String(opt.file || 'radata');
		var has = (Radisk.has || (Radisk.has = {}))[opt.file];
		if(has){ return has }

		opt.max = opt.max || (opt.memory? (opt.memory * 999 * 999) : 300000000) * 0.3;
		opt.until = opt.until || opt.wait || 250;
		opt.batch = opt.batch || (10 * 1000);
		opt.chunk = opt.chunk || (1024 * 1024 * 1); // 1MB
		opt.code = opt.code || {};
		opt.code.from = opt.code.from || '!';
		opt.jsonify = true;


		function ename(t){ return encodeURIComponent(t).replace(/\*/g, '%2A') } // TODO: Hash this also, but allow migration!
		function atomic(v){ return u !== v && (!v || 'object' != typeof v) }
		var timediate = (''+u === typeof setImmediate)? setTimeout : setImmediate;
		var puff = setTimeout.turn || timediate, u;
		var map = Radix.object;
		var ST = 0;

		if(!opt.store){
			return opt.log("ERROR: Radisk needs `opt.store` interface with `{get: fn, put: fn (, list: fn)}`!");
		}
		if(!opt.store.put){
			return opt.log("ERROR: Radisk needs `store.put` interface with `(file, data, cb)`!");
		}
		if(!opt.store.get){
			return opt.log("ERROR: Radisk needs `store.get` interface with `(file, cb)`!");
		}
		if(!opt.store.list){
			//opt.log("WARNING: `store.list` interface might be needed!");
		}

		if(''+u != typeof require){ require('./yson') }
		var parse = JSON.parseAsync || function(t,cb,r){ var u; try{ cb(u, JSON.parse(t,r)) }catch(e){ cb(e) } }
		var json = JSON.stringifyAsync || function(v,cb,r,s){ var u; try{ cb(u, JSON.stringify(v,r,s)) }catch(e){ cb(e) } }
		/*
			Any and all storage adapters should...
			1. Because writing to disk takes time, we should batch data to disk. This improves performance, and reduces potential disk corruption.
			2. If a batch exceeds a certain number of writes, we should immediately write to disk when physically possible. This caps total performance, but reduces potential loss.
		*/
		var r = function(key, data, cb, tag, DBG){
			if('function' === typeof data){
				var o = cb || {};
				cb = data;
				r.read(key, cb, o, DBG || tag);
				return;
			}
			//var tmp = (tmp = r.batch = r.batch || {})[key] = tmp[key] || {};
			//var tmp = (tmp = r.batch = r.batch || {})[key] = data;
			r.save(key, data, cb, tag, DBG);
		}
		r.save = function(key, data, cb, tag, DBG){
			var s = {key: key}, tags, f, d, q;
			s.find = function(file){ var tmp;
				s.file = file || (file = opt.code.from);
				DBG && (DBG = DBG[file] = DBG[file] || {});
				DBG && (DBG.sf = DBG.sf || +new Date);
				//console.only.i && console.log('found', file);
				if(tmp = r.disk[file]){ s.mix(u, tmp); return }
				r.parse(file, s.mix, u, DBG);
			}
			s.mix = function(err, disk){
				DBG && (DBG.sml = +new Date);
				DBG && (DBG.sm = DBG.sm || +new Date);
				if(s.err = err || s.err){ cb(err); return } // TODO: HANDLE BATCH EMIT
				var file = s.file = (disk||'').file || s.file, tmp;
				if(!disk && file !== opt.code.from){ // corrupt file?
					r.find.bad(file); // remove from dir list
					r.save(key, data, cb, tag); // try again
					return;
				}
				(disk = r.disk[file] || (r.disk[file] = disk || Radix())).file || (disk.file = file);
				if(opt.compare){
					data = opt.compare(disk(key), data, key, file);
					if(u === data){ cb(err, -1); return } // TODO: HANDLE BATCH EMIT
				}
				(s.disk = disk)(key, data);
				if(tag){
					(tmp = (tmp = disk.tags || (disk.tags = {}))[tag] || (tmp[tag] = r.tags[tag] || (r.tags[tag] = {})))[file] || (tmp[file] = r.one[tag] || (r.one[tag] = cb));
					cb = null;
				}
				DBG && (DBG.st = DBG.st || +new Date);
				//console.only.i && console.log('mix', disk.Q);
				if(disk.Q){ cb && disk.Q.push(cb); return } disk.Q = (cb? [cb] : []);
				disk.to = setTimeout(s.write, opt.until);
			}
			s.write = function(){
				DBG && (DBG.sto = DBG.sto || +new Date);
				var file = f = s.file, disk = d = s.disk;
				q = s.q = disk.Q;
				tags = s.tags = disk.tags;
				delete disk.Q;
				delete r.disk[file];
				delete disk.tags;
				//console.only.i && console.log('write', file, disk, 'was saving:', key, data);
				r.write(file, disk, s.ack, u, DBG);
			}
			s.ack = function(err, ok){
				DBG && (DBG.sa = DBG.sa || +new Date);
				DBG && (DBG.sal = q.length);
				var ack, tmp;
				// TODO!!!! CHANGE THIS INTO PUFF!!!!!!!!!!!!!!!!
				for(var id in r.tags){
					if(!r.tags.hasOwnProperty(id)){ continue } var tag = r.tags[id];
					if((tmp = r.disk[f]) && (tmp = tmp.tags) && tmp[tag]){ continue }
					ack = tag[f];
					delete tag[f];
					var ne; for(var k in tag){ if(tag.hasOwnProperty(k)){ ne = true; break } } // is not empty?
					if(ne){ continue } //if(!obj_empty(tag)){ continue }
					delete r.tags[tag];
					ack && ack(err, ok);
				}
				!q && (q = '');
				var l = q.length, i = 0;
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				var S = +new Date;
				for(;i < l; i++){ (ack = q[i]) && ack(err, ok) }
				console.STAT && console.STAT(S, +new Date - S, 'rad acks', ename(s.file));
				console.STAT && console.STAT(S, q.length, 'rad acks #', ename(s.file));
			}
			cb || (cb = function(err, ok){ // test delete!
				if(!err){ return }
			});
			//console.only.i && console.log('save', key);
			r.find(key, s.find);
    }
    r.disk = {};
    r.one = {};
    r.tags = {};

		/*
			Any storage engine at some point will have to do a read in order to write.
			This is true of even systems that use an append only log, if they support updates.
			Therefore it is unavoidable that a read will have to happen,
			the question is just how long you delay it.
		*/
		var RWC = 0;
		r.write = function(file, rad, cb, o, DBG){
			if(!rad){ cb('No radix!'); return }
			o = ('object' == typeof o)? o : {force: o};
			var f = function Fractal(){}, a, b;
			f.text = '';
			f.file = file = rad.file || (rad.file = file);
			if(!file){ cb('What file?'); return }
			f.write = function(){
				var text = rad.raw = f.text;
				r.disk[file = rad.file || f.file || file] = rad;
				var S = +new Date;
				DBG && (DBG.wd = S);
				//console.only.i && console.log('add', file);
				r.find.add(file, function add(err){
					DBG && (DBG.wa = +new Date);
					if(err){ cb(err); return }
					//console.only.i && console.log('disk', file, text);
					opt.store.put(ename(file), text, function safe(err, ok){
						DBG && (DBG.wp = +new Date);
						console.STAT && console.STAT(S, ST = +new Date - S, "wrote disk", JSON.stringify(file), ++RWC, 'total all writes.');
						//console.only.i && console.log('done', err, ok || 1, cb);
						cb(err, ok || 1);
						if(!rad.Q){ delete r.disk[file] } // VERY IMPORTANT! Clean up memory, but not if there is already queued writes on it!
					});
				});
			}
			f.split = function(){
				var S = +new Date;
				DBG && (DBG.wf = S);
				f.text = '';
				if(!f.count){ f.count = 0;
					Radix.map(rad, function count(){ f.count++ }); // TODO: Perf? Any faster way to get total length?
				}
				DBG && (DBG.wfc = f.count);
				f.limit = Math.ceil(f.count/2);
				var SC = f.count;
				f.count = 0;
				DBG && (DBG.wf1 = +new Date);
				f.sub = Radix();
				Radix.map(rad, f.slice, {reverse: 1}); // IMPORTANT: DO THIS IN REVERSE, SO LAST HALF OF DATA MOVED TO NEW FILE BEFORE DROPPING FROM CURRENT FILE.
				DBG && (DBG.wf2 = +new Date);
				r.write(f.end, f.sub, f.both, o);
				DBG && (DBG.wf3 = +new Date);
				f.hub = Radix();
				Radix.map(rad, f.stop);
				DBG && (DBG.wf4 = +new Date);
				r.write(rad.file, f.hub, f.both, o);
				DBG && (DBG.wf5 = +new Date);
				console.STAT && console.STAT(S, +new Date - S, "rad split", ename(rad.file), SC);
				return true;
			}
			f.slice = function(val, key){
				f.sub(f.end = key, val);
				if(f.limit <= (++f.count)){ return true }
			}
			f.stop = function(val, key){
				if(key >= f.end){ return true }
				f.hub(key, val);
			}
			f.both = function(err, ok){
				DBG && (DBG.wfd = +new Date);
				if(b){ cb(err || b); return }
				if(a){ cb(err, ok); return }
				a = true;
				b = err;
			}
			f.each = function(val, key, k, pre){
				if(u !== val){ f.count++ }
				if(opt.max <= (val||'').length){ return cb("Data too big!"), true }
				var enc = Radisk.encode(pre.length) +'#'+ Radisk.encode(k) + (u === val? '' : ':'+ Radisk.encode(val)) +'\n';
				if((opt.chunk < f.text.length + enc.length) && (1 < f.count) && !o.force){
					return f.split();
				}
				f.text += enc;
			}
			//console.only.i && console.log('writing');
			if(opt.jsonify){ r.write.jsonify(f, rad, cb, o, DBG); return } // temporary testing idea
			if(!Radix.map(rad, f.each, true)){ f.write() }
		}

		r.write.jsonify = function(f, rad, cb, o, DBG){
			var raw;
			var S = +new Date;
			DBG && (DBG.w = S);
			try{raw = JSON.stringify(rad.$);
			}catch(e){ cb("Cannot radisk!"); return }
			DBG && (DBG.ws = +new Date);
			console.STAT && console.STAT(S, +new Date - S, "rad stringified JSON");
			if(opt.chunk < raw.length && !o.force){
				var c = 0;
				Radix.map(rad, function(){
					if(c++){ return true } // more than 1 item
				});
				if(c > 1){
					return f.split();
				}
			}
			f.text = raw;
			f.write();
		}

		r.range = function(tree, o){
			if(!tree || !o){ return }
			if(u === o.start && u === o.end){ return tree }
			if(atomic(tree)){ return tree }
			var sub = Radix();
			Radix.map(tree, function(v,k){ sub(k,v) }, o); // ONLY PLACE THAT TAKES TREE, maybe reduce API for better perf?
			return sub('');
		}

		;(function(){
			r.read = function(key, cb, o, DBG){
				o = o || {};
				var g = {key: key};
				g.find = function(file){ var tmp;
					g.file = file || (file = opt.code.from);
					DBG && (DBG = DBG[file] = DBG[file] || {});
					DBG && (DBG.rf = DBG.rf || +new Date);
					if(tmp = r.disk[g.file = file]){ g.check(u, tmp); return }
					r.parse(file, g.check, u, DBG);
				}
				g.get = function(err, disk, info){
					DBG && (DBG.rgl = +new Date);
					DBG && (DBG.rg = DBG.rg || +new Date);
					if(g.err = err || g.err){ cb(err); return }
					var file = g.file = (disk||'').file || g.file;
					if(!disk && file !== opt.code.from){ // corrupt file?
						r.find.bad(file); // remove from dir list
						r.read(key, cb, o); // try again
						return;
					}
					disk = r.disk[file] || (r.disk[file] = disk);
					if(!disk){ cb(file === opt.code.from? u : "No file!"); return }
					disk.file || (disk.file = file);
					var data = r.range(disk(key), o);
					DBG && (DBG.rr = +new Date);
					o.unit = disk.unit;
					o.chunks = (o.chunks || 0) + 1;
					o.parsed = (o.parsed || 0) + ((info||'').parsed||(o.chunks*opt.chunk));
					o.more = 1;
					o.next = u;
					Radix.map(r.list, function next(v,f){
						if(!v || file === f){ return }
						o.next = f;
						return 1;
					}, o.reverse? {reverse: 1, end: file} : {start: file});
					DBG && (DBG.rl = +new Date);
					if(!o.next){ o.more = 0 }
					if(o.next){
						if(!o.reverse && ((key < o.next && 0 != o.next.indexOf(key)) || (u !== o.end && (o.end || '\uffff') < o.next))){ o.more = 0 }
						if(o.reverse && ((key > o.next && 0 != key.indexOf(o.next)) || ((u !== o.start && (o.start || '') > o.next && file <= o.start)))){ o.more = 0 }
					}
					//console.log(5, process.memoryUsage().heapUsed);
					if(!o.more){ cb(g.err, data, o); return }
					if(data){ cb(g.err, data, o) }
					if(o.parsed >= o.limit){ return }
					var S = +new Date;
					DBG && (DBG.rm = S);
					var next = o.next;
					timediate(function(){
						console.STAT && console.STAT(S, +new Date - S, 'rad more');
						r.parse(next, g.check);
					},0);
				}
				g.check = function(err, disk, info){
					//console.log(4, process.memoryUsage().heapUsed);
					g.get(err, disk, info);
					if(!disk || disk.check){ return } disk.check = 1;
					var S = +new Date;
					(info || (info = {})).file || (info.file = g.file);
					Radix.map(disk, function(val, key){
						// assume in memory for now, since both write/read already call r.find which will init it.
						r.find(key, function(file){
							if((file || (file = opt.code.from)) === info.file){ return }
							var id = (''+Math.random()).slice(-3);
							puff(function(){
							r.save(key, val, function ack(err, ok){
								if(err){ r.save(key, val, ack); return } // ad infinitum???
								// TODO: NOTE!!! Mislocated data could be because of a synchronous `put` from the `g.get(` other than perf shouldn't we do the check first before acking?
								console.STAT && console.STAT("MISLOCATED DATA CORRECTED", id, ename(key), ename(info.file), ename(file));
							});
							},0);
						})
					});
					console.STAT && console.STAT(S, +new Date - S, "rad check");
				}
				r.find(key || (o.reverse? (o.end||'') : (o.start||'')), g.find); 
			}
			function rev(a,b){ return b }
			var revo = {reverse: true};
		}());

		;(function(){
			/*
				Let us start by assuming we are the only process that is
				changing the directory or bucket. Not because we do not want
				to be multi-process/machine, but because we want to experiment
				with how much performance and scale we can get out of only one.
				Then we can work on the harder problem of being multi-process.
			*/
			var RPC = 0;
			var Q = {}, s = String.fromCharCode(31);
			r.parse = function(file, cb, raw, DBG){ var q;
				if(!file){ return cb(); }
				if(q = Q[file]){ q.push(cb); return } q = Q[file] = [cb];
				var p = function Parse(){}, info = {file: file};
				(p.disk = Radix()).file = file;
				p.read = function(err, data){ var tmp;
					DBG && (DBG.rpg = +new Date);
					console.STAT && console.STAT(S, +new Date - S, 'read disk', JSON.stringify(file), ++RPC, 'total all parses.');
					//console.log(2, process.memoryUsage().heapUsed);
					if((p.err = err) || (p.not = !data)){
						delete Q[file];
						p.map(q, p.ack);
						return;
					}
					if('string' !== typeof data){
						try{
							if(opt.max <= data.length){
								p.err = "Chunk too big!";
							} else {
								data = data.toString(); // If it crashes, it crashes here. How!?? We check size first!
							}
						}catch(e){ p.err = e }
						if(p.err){
							delete Q[file];
							p.map(q, p.ack);
							return;
						}
					}
					info.parsed = data.length;
					DBG && (DBG.rpl = info.parsed);
					DBG && (DBG.rpa = q.length);
					S = +new Date;
					if(!(opt.jsonify || '{' === data[0])){
						p.radec(err, data);
						return;
					}
					parse(data, function(err, tree){
						//console.log(3, process.memoryUsage().heapUsed);
						if(!err){
							delete Q[file];
							p.disk.$ = tree;
							console.STAT && (ST = +new Date - S) > 9 && console.STAT(S, ST, 'rad parsed JSON');
							DBG && (DBG.rpd = +new Date);
							p.map(q, p.ack); // hmmm, v8 profiler can't see into this cause of try/catch?
							return;
						}
						if('{' === data[0]){
							delete Q[file];
							p.err = tmp || "JSON error!";
							p.map(q, p.ack);
							return;
						}
						p.radec(err, data);
					});
				}
				p.map = function(){ // switch to setTimeout.each now?
					if(!q || !q.length){ return }
					//var i = 0, l = q.length, ack;
					var S = +new Date;
					var err = p.err, data = p.not? u : p.disk;
					var i = 0, ack; while(i < 9 && (ack = q[i++])){ ack(err, data, info) } // too much?
					console.STAT && console.STAT(S, +new Date - S, 'rad packs', ename(file));
					console.STAT && console.STAT(S, i, 'rad packs #', ename(file)); 
					if(!(q = q.slice(i)).length){ return }
					puff(p.map, 0);
				}
				p.ack = function(cb){
					if(!cb){ return }
					if(p.err || p.not){
						cb(p.err, u, info);
						return;
					}
					cb(u, p.disk, info);
				}
				p.radec = function(err, data){
					delete Q[file];
					S = +new Date;
					var tmp = p.split(data), pre = [], i, k, v;
					if(!tmp || 0 !== tmp[1]){
						p.err = "File '"+file+"' does not have root radix! ";
						p.map(q, p.ack);
						return; 
					}
					while(tmp){
						k = v = u;
						i = tmp[1];
						tmp = p.split(tmp[2])||'';
						if('#' == tmp[0]){
							k = tmp[1];
							pre = pre.slice(0,i);
							if(i <= pre.length){
								pre.push(k);
							}
						}
						tmp = p.split(tmp[2])||'';
						if('\n' == tmp[0]){ continue }
						if('=' == tmp[0] || ':' == tmp[0]){ v = tmp[1] }
						if(u !== k && u !== v){ p.disk(pre.join(''), v) }
						tmp = p.split(tmp[2]);
					}
					console.STAT && console.STAT(S, +new Date - S, 'parsed RAD');
					p.map(q, p.ack);
				};
				p.split = function(t){
					if(!t){ return }
					var l = [], o = {}, i = -1, a = '', b, c;
					i = t.indexOf(s);
					if(!t[i]){ return }
					a = t.slice(0, i);
					l[0] = a;
					l[1] = b = Radisk.decode(t.slice(i), o);
					l[2] = t.slice(i + o.i);
					return l;
				}
				if(r.disk){ raw || (raw = (r.disk[file]||'').raw) }
				var S = +new Date, SM, SL;
				DBG && (DBG.rp = S);
				if(raw){ return puff(function(){ p.read(u, raw) }, 0) }
				opt.store.get(ename(file), p.read);
				// TODO: What if memory disk gets filled with updates, and we get an old one back?
			}
		}());

		;(function(){
			var dir, f = String.fromCharCode(28), Q;
			r.find = function(key, cb){
				if(!dir){
					if(Q){ Q.push([key, cb]); return } Q = [[key, cb]];
					r.parse(f, init);
					return;
				}
				Radix.map(r.list = dir, function(val, key){
					if(!val){ return }
					return cb(key) || true;
				}, {reverse: 1, end: key}) || cb(opt.code.from);
			}
			r.find.add = function(file, cb){
				var has = dir(file);
				if(has || file === f){ cb(u, 1); return }
				dir(file, 1);
				cb.found = (cb.found || 0) + 1;
				r.write(f, dir, function(err, ok){
					if(err){ cb(err); return }
					cb.found = (cb.found || 0) - 1;
					if(0 !== cb.found){ return }
					cb(u, 1);
				}, true);
			}
			r.find.bad = function(file, cb){
				dir(file, 0);
				r.write(f, dir, cb||noop);
			}
			function init(err, disk){
				if(err){
					opt.log('list', err);
					setTimeout(function(){ r.parse(f, init) }, 1000);
					return;
				}
				if(disk){ drain(disk); return }
				dir = dir || disk || Radix();
				if(!opt.store.list){ drain(dir); return }
				// import directory.
				opt.store.list(function(file){
					if(!file){ drain(dir); return }
					r.find.add(file, noop);
				});
			}
			function drain(rad, tmp){
				dir = dir || rad;
				dir.file = f;
				tmp = Q; Q = null;
				map(tmp, function(arg){
					r.find(arg[0], arg[1]);
				});
			}
		}());

		try{ !Gun.window && require('./radmigtmp')(r) }catch(e){}

		var noop = function(){}, RAD, u;
		Radisk.has[opt.file] = r;
		return r;
	}

	;(function(){
		var _ = String.fromCharCode(31), u;
		Radisk.encode = function(d, o, s){ s = s || _;
			var t = s, tmp;
			if(typeof d == 'string'){
				var i = d.indexOf(s);
				while(i != -1){ t += s; i = d.indexOf(s, i+1) }
				return t + '"' + d + s;
			} else
			if(d && d['#'] && 1 == Object.keys(d).length){
				return t + '#' + tmp + t;
			} else
			if('number' == typeof d){
				return t + '+' + (d||0) + t;
			} else
			if(null === d){
				return t + ' ' + t;
			} else
			if(true === d){
				return t + '+' + t;
			} else
			if(false === d){
				return t + '-' + t;
			}// else
			//if(binary){}
		}
		Radisk.decode = function(t, o, s){ s = s || _;
			var d = '', i = -1, n = 0, c, p;
			if(s !== t[0]){ return }
			while(s === t[++i]){ ++n }
			p = t[c = n] || true;
			while(--n >= 0){ i = t.indexOf(s, i+1) }
			if(i == -1){ i = t.length }
			d = t.slice(c+1, i);
			if(o){ o.i = i+1 }
			if('"' === p){
				return d;
			} else
			if('#' === p){
				return {'#':d};
			} else
			if('+' === p){
				if(0 === d.length){
					return true;
				}
				return parseFloat(d);
			} else
			if(' ' === p){
				return null;
			} else
			if('-' === p){
				return false;
			}
		}
	}());

	if(typeof window !== "undefined"){
	  var Gun = window.Gun;
	  var Radix = window.Radix;
	  window.Radisk = Radisk;
	} else { 
	  var Gun = require('../gun');
		var Radix = require('./radix');
		//var Radix = require('./radix2'); Radisk = require('./radisk2');
		try{ module.exports = Radisk }catch(e){}
	}

	Radisk.Radix = Radix;

}());
},{"../gun":1,"./radix":8,"./radmigtmp":9,"./yson":14}],8:[function(require,module,exports){
;(function(){

	function Radix(){
		var radix = function(key, val, t){
			radix.unit = 0;
			if(!t && u !== val){ 
				radix.last = (''+key < radix.last)? radix.last : ''+key;
				delete (radix.$||{})[_];
			}
			t = t || radix.$ || (radix.$ = {});
			if(!key && Object.keys(t).length){ return t }
			key = ''+key;
			var i = 0, l = key.length-1, k = key[i], at, tmp;
			while(!(at = t[k]) && i < l){
				k += key[++i];
			}
			if(!at){
				if(!each(t, function(r, s){
					var ii = 0, kk = '';
					if((s||'').length){ while(s[ii] == key[ii]){
						kk += s[ii++];
					} }
					if(kk){
						if(u === val){
							if(ii <= l){ return }
							(tmp || (tmp = {}))[s.slice(ii)] = r;
							//(tmp[_] = function $(){ $.sort = Object.keys(tmp).sort(); return $ }()); // get rid of this one, cause it is on read?
							return r;
						}
						var __ = {};
						__[s.slice(ii)] = r;
						ii = key.slice(ii);
						('' === ii)? (__[''] = val) : ((__[ii] = {})[''] = val);
						//(__[_] = function $(){ $.sort = Object.keys(__).sort(); return $ }());
						t[kk] = __;
						if(Radix.debug && 'undefined' === ''+kk){ console.log(0, kk); debugger }
						delete t[s];
						//(t[_] = function $(){ $.sort = Object.keys(t).sort(); return $ }());
						return true;
					}
				})){
					if(u === val){ return; }
					(t[k] || (t[k] = {}))[''] = val;
					if(Radix.debug && 'undefined' === ''+k){ console.log(1, k); debugger }
					//(t[_] = function $(){ $.sort = Object.keys(t).sort(); return $ }());
				}
				if(u === val){
					return tmp;
				}
			} else 
			if(i == l){
				//if(u === val){ return (u === (tmp = at['']))? at : tmp } // THIS CODE IS CORRECT, below is
				if(u === val){ return (u === (tmp = at['']))? at : ((radix.unit = 1) && tmp) } // temporary help??
				at[''] = val;
				//(at[_] = function $(){ $.sort = Object.keys(at).sort(); return $ }());
			} else {
				if(u !== val){ delete at[_] }
				//at && (at[_] = function $(){ $.sort = Object.keys(at).sort(); return $ }());
				return radix(key.slice(++i), val, at || (at = {}));
			}
		}
		return radix;
	};

	Radix.map = function rap(radix, cb, opt, pre){ pre = pre || []; // TODO: BUG: most out-of-memory crashes come from here.
		var t = ('function' == typeof radix)? radix.$ || {} : radix;
		//!opt && console.log("WHAT IS T?", JSON.stringify(t).length);
		if(!t){ return }
		if('string' == typeof t){ if(Radix.debug){ throw ['BUG:', radix, cb, opt, pre] } return; }
		var keys = (t[_]||no).sort || (t[_] = function $(){ $.sort = Object.keys(t).sort(); return $ }()).sort, rev; // ONLY 17% of ops are pre-sorted!
		//var keys = Object.keys(t).sort();
		opt = (true === opt)? {branch: true} : (opt || {});
		if(rev = opt.reverse){ keys = keys.slice(0).reverse() }
		var start = opt.start, end = opt.end, END = '\uffff';
		var i = 0, l = keys.length;
		for(;i < l; i++){ var key = keys[i], tree = t[key], tmp, p, pt;
			if(!tree || '' === key || _ === key || 'undefined' === key){ continue }
			p = pre.slice(0); p.push(key);
			pt = p.join('');
			if(u !== start && pt < (start||'').slice(0,pt.length)){ continue }
			if(u !== end && (end || END) < pt){ continue }
			if(rev){ // children must be checked first when going in reverse.
				tmp = rap(tree, cb, opt, p);
				if(u !== tmp){ return tmp }
			}
			if(u !== (tmp = tree[''])){
				var yes = 1;
				if(u !== start && pt < (start||'')){ yes = 0 }
				if(u !== end && pt > (end || END)){ yes = 0 }
				if(yes){
					tmp = cb(tmp, pt, key, pre);
					if(u !== tmp){ return tmp }
				}
			} else
			if(opt.branch){
				tmp = cb(u, pt, key, pre);
				if(u !== tmp){ return tmp }
			}
			pre = p;
			if(!rev){
				tmp = rap(tree, cb, opt, pre);
				if(u !== tmp){ return tmp }
			}
			pre.pop();
		}
	};

	if(typeof window !== "undefined"){
	  window.Radix = Radix;
	} else { 
		try{ module.exports = Radix }catch(e){}
	}
	var each = Radix.object = function(o, f, r){
		for(var k in o){
			if(!o.hasOwnProperty(k)){ continue }
			if((r = f(o[k], k)) !== u){ return r }
		}
	}, no = {}, u;
	var _ = String.fromCharCode(24);
	
}());

},{}],9:[function(require,module,exports){
module.exports = function(r){
	var Radix = require('./radix');
	r.find('a', function(){
		var l = [];
		Radix.map(r.list, function(v,f){
			if(!(f.indexOf('%1B') + 1)){ return }
			if(!v){ return }
			l.push([f,v]);
		});
		if(l.length){
			console.log("\n! ! ! WARNING ! ! !\nRAD v0.2020.x has detected OLD v0.2019.x data & automatically migrating. Automatic migration will be turned OFF in future versions! If you are just developing/testing, we recommend you reset your data. Please contact us if you have any concerns.\nThis message should only log once.")
		}
		var f, v;
		l.forEach(function(a){
			f = a[0]; v = a[1];
			r.list(decodeURIComponent(f), v);
			r.list(f, 0);
		});
		if(!f){ return }
		r.find.bad(f);
	})
};
},{"./radix":8}],10:[function(require,module,exports){
function Store(opt){
	opt = opt || {};
	opt.log = opt.log || console.log;
	opt.file = String(opt.file || 'radata');
	var fs = require('fs'), u;

	var store = function Store(){};
	if(Store[opt.file]){
		console.log("Warning: reusing same fs store and options as 1st.");
		return Store[opt.file];
	}
	Store[opt.file] = store;
	var puts = {};

	// TODO!!! ADD ZLIB INFLATE / DEFLATE COMPRESSION!
	store.put = function(file, data, cb){
		var random = Math.random().toString(36).slice(-3);
		puts[file] = {id: random, data: data};
		var tmp = opt.file+'-'+file+'-'+random+'.tmp';
		fs.writeFile(tmp, data, function(err, ok){
			if(err){
				if(random === (puts[file]||'').id){ delete puts[file] }
				return cb(err);
			}
			move(tmp, opt.file+'/'+file, function(err, ok){
				if(random === (puts[file]||'').id){ delete puts[file] }
				cb(err, ok || !err);
			});
		});
	};
	store.get = function(file, cb){ var tmp; // this took 3s+?
		if(tmp = puts[file]){ cb(u, tmp.data); return }
		fs.readFile(opt.file+'/'+file, function(err, data){
			if(err){
				if('ENOENT' === (err.code||'').toUpperCase()){
					return cb();
				}
				opt.log("ERROR:", err);
			}
			cb(err, data);
		});
	};

	if(!fs.existsSync(opt.file)){ fs.mkdirSync(opt.file) }

	function move(oldPath, newPath, cb) {
		fs.rename(oldPath, newPath, function (err) {
			if (err) {
				if (err.code === 'EXDEV') {
					var readStream = fs.createReadStream(oldPath);
					var writeStream = fs.createWriteStream(newPath);

					readStream.on('error', cb);
					writeStream.on('error', cb);

					readStream.on('close', function () {
						fs.unlink(oldPath, cb);
					});

					readStream.pipe(writeStream);
				} else {
					cb(err);
				}
			} else {
				cb();
			}
		});
	};

	store.list = function(cb, match, params, cbs){
		var dir = fs.readdirSync(opt.file);
		dir.forEach(function(file){
			cb(file);
		})
		cb();
	};
	
	return store;
}

var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
Gun.on('create', function(root){
	this.to.next(root);
	var opt = root.opt;
	if(opt.rfs === false){ return }
	opt.store = opt.store || (!Gun.window && Store(opt));
});

module.exports = Store;
},{"../gun":1,"fs":undefined}],11:[function(require,module,exports){
;(function(){
/* // from @jabis
if (navigator.storage && navigator.storage.estimate) {
  const quota = await navigator.storage.estimate();
  // quota.usage -> Number of bytes used.
  // quota.quota -> Maximum number of bytes available.
  const percentageUsed = (quota.usage / quota.quota) * 100;
  console.log(`You've used ${percentageUsed}% of the available storage.`);
  const remaining = quota.quota - quota.usage;
  console.log(`You can write up to ${remaining} more bytes.`);
}
*/
  function Store(opt){
    opt = opt || {};
    opt.file = String(opt.file || 'radata');
    var store = Store[opt.file], db = null, u;

    if(store){
      console.log("Warning: reusing same IndexedDB store and options as 1st.");
      return Store[opt.file];
    }
    store = Store[opt.file] = function(){};

    try{opt.indexedDB = opt.indexedDB || Store.indexedDB || indexedDB}catch(e){}
    try{if(!opt.indexedDB || 'file:' == location.protocol){
      var s = store.d || (store.d = {});
      store.put = function(f, d, cb){ s[f] = d; setTimeout(function(){ cb(null, 1) },250) };
      store.get = function(f, cb){ setTimeout(function(){ cb(null, s[f] || u) },5) };
      console.log('Warning: No indexedDB exists to persist data to!');
      return store;
    }}catch(e){}
    

    store.start = function(){
      var o = indexedDB.open(opt.file, 1);
      o.onupgradeneeded = function(eve){ (eve.target.result).createObjectStore(opt.file) }
      o.onsuccess = function(){ db = o.result }
      o.onerror = function(eve){ console.log(eve||1); }
    }; store.start();

    store.put = function(key, data, cb){
      if(!db){ setTimeout(function(){ store.put(key, data, cb) },1); return }
      var tx = db.transaction([opt.file], 'readwrite');
      var obj = tx.objectStore(opt.file);
      var req = obj.put(data, ''+key);
      req.onsuccess = obj.onsuccess = tx.onsuccess = function(){ cb(null, 1) }
      req.onabort = obj.onabort = tx.onabort = function(eve){ cb(eve||'put.tx.abort') }
      req.onerror = obj.onerror = tx.onerror = function(eve){ cb(eve||'put.tx.error') }
    }

    store.get = function(key, cb){
      if(!db){ setTimeout(function(){ store.get(key, cb) },9); return }
      var tx = db.transaction([opt.file], 'readonly');
      var obj = tx.objectStore(opt.file);
      var req = obj.get(''+key);
      req.onsuccess = function(){ cb(null, req.result) }
      req.onabort = function(eve){ cb(eve||4) }
      req.onerror = function(eve){ cb(eve||5) }
    }
    setInterval(function(){ db && db.close(); db = null; store.start() }, 1000 * 15); // reset webkit bug?
    return store;
  }

  if(typeof window !== "undefined"){
    (Store.window = window).RindexedDB = Store;
    Store.indexedDB = window.indexedDB; // safari bug
  } else {
    try{ module.exports = Store }catch(e){}
  }

  try{
    var Gun = Store.window.Gun || require('../gun');
    Gun.on('create', function(root){
      this.to.next(root);
      root.opt.store = root.opt.store || Store(root.opt);
    });
  }catch(e){}

}());
},{"../gun":1}],12:[function(require,module,exports){
var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('create', function(root){
    if(Gun.TESTING){ root.opt.file = 'radatatest' }
    this.to.next(root);
    var opt = root.opt, empty = {}, u;
    if(false === opt.rad || false === opt.radisk){ return }
    if((u+'' != typeof process) && 'false' === ''+(process.env||'').RAD){ return }
    var Radisk = (Gun.window && Gun.window.Radisk) || require('./radisk');
    var Radix = Radisk.Radix;
    var dare = Radisk(opt), esc = String.fromCharCode(27);
    var ST = 0;
 
    root.on('put', function(msg){
        this.to.next(msg);
        if((msg._||'').rad){ return } // don't save what just came from a read.
        //if(msg['@']){ return } // WHY DID I NOT ADD THIS?
        var id = msg['#'], put = msg.put, soul = put['#'], key = put['.'], val = put[':'], state = put['>'], tmp;
        var DBG = (msg._||'').DBG; DBG && (DBG.sp = DBG.sp || +new Date);
        //var lot = (msg._||'').lot||''; count[id] = (count[id] || 0) + 1; 
        var S = (msg._||'').RPS || ((msg._||'').RPS = +new Date);
        //console.log("PUT ------->>>", soul,key, val, state);
        //dare(soul+esc+key, {':': val, '>': state}, dare.one[id] || function(err, ok){
        dare(soul+esc+key, {':': val, '>': state}, function(err, ok){
            //console.log("<<<------- PAT", soul,key, val, state, 'in', +new Date - S);
            DBG && (DBG.spd = DBG.spd || +new Date);
            console.STAT && console.STAT(S, +new Date - S, 'put');
            //if(!err && count[id] !== lot.s){ console.log(err = "Disk count not same as ram count."); console.STAT && console.STAT(+new Date, lot.s - count[id], 'put ack != count') } delete count[id];
            if(err){ root.on('in', {'@': id, err: err, DBG: DBG}); return }
            root.on('in', {'@': id, ok: ok, DBG: DBG});
        //}, id, DBG && (DBG.r = DBG.r || {}));
        }, false && id, DBG && (DBG.r = DBG.r || {}));
        DBG && (DBG.sps = DBG.sps || +new Date);
    });
    var count = {}, obj_empty = Object.empty;
 
    root.on('get', function(msg){
        this.to.next(msg);
        var ctx = msg._||'', DBG = ctx.DBG = msg.DBG; DBG && (DBG.sg = +new Date);
        var id = msg['#'], get = msg.get, soul = msg.get['#'], has = msg.get['.']||'', o = {}, graph, lex, key, tmp, force;
        if('string' == typeof soul){
            key = soul;
        } else 
        if(soul){
            if(u !== (tmp = soul['*'])){ o.limit = force = 1 }
            if(u !== soul['>']){ o.start = soul['>'] }
            if(u !== soul['<']){ o.end = soul['<'] }
            key = force? (''+tmp) : tmp || soul['='];
            force = null;
        }
        if(key && !o.limit){ // a soul.has must be on a soul, and not during soul*
            if('string' == typeof has){
                key = key+esc+(o.atom = has);
            } else 
            if(has){
                if(u !== has['>']){ o.start = has['>']; o.limit = 1 }
                if(u !== has['<']){ o.end = has['<']; o.limit = 1 }
                if(u !== (tmp = has['*'])){ o.limit = force = 1 }
                if(key){ key = key+esc + (force? (''+(tmp||'')) : tmp || (o.atom = has['='] || '')) }
            }
        }
        if((tmp = get['%']) || o.limit){
            o.limit = (tmp <= (o.pack || (1000 * 100)))? tmp : 1;
        }
        if(has['-'] || (soul||{})['-'] || get['-']){ o.reverse = true }
        if((tmp = (root.next||'')[soul]) && tmp.put){
            if(o.atom){
                tmp = (tmp.next||'')[o.atom] ;
                if(tmp && tmp.rad){ return }
            } else
            if(tmp && tmp.rad){ return }
        }
        var now = Gun.state();
        var S = (+new Date), C = 0, SPT = 0; // STATS!
        DBG && (DBG.sgm = S);
        //var GID = String.random(3); console.log("GET ------->>>", GID, key, o, '?', get);
        dare(key||'', function(err, data, info){
            //console.log("<<<------- GOT", GID, +new Date - S, err, data);
            DBG && (DBG.sgr = +new Date);
            DBG && (DBG.sgi = info);
            try{opt.store.stats.get.time[statg % 50] = (+new Date) - S; ++statg;
                opt.store.stats.get.count++;
                if(err){ opt.store.stats.get.err = err }
            }catch(e){} // STATS!
            //if(u === data && info.chunks > 1){ return } // if we already sent a chunk, ignore ending empty responses. // this causes tests to fail.
            console.STAT && console.STAT(S, +new Date - S, 'got', JSON.stringify(key)); S = +new Date;
            info = info || '';
            var va, ve;
            if(info.unit && data && u !== (va = data[':']) && u !== (ve = data['>'])){ // new format
                var tmp = key.split(esc), so = tmp[0], ha = tmp[1];
                (graph = graph || {})[so] = Gun.state.ify(graph[so], ha, ve, va, so);
                root.$.get(so).get(ha)._.rad = now;
                // REMEMBER TO ADD _rad TO NODE/SOUL QUERY!
            } else
            if(data){ // old code path
                if(typeof data !== 'string'){
                    if(o.atom){
                        data = u;
                    } else {
                        Radix.map(data, each, o); // IS A RADIX TREE, NOT FUNCTION!
                    }
                }
                if(!graph && data){ each(data, '') }
                // TODO: !has what about soul lookups?
                if(!o.atom && !has & 'string' == typeof soul && !o.limit && !o.more){
                    root.$.get(soul)._.rad = now;
                }
            }
            DBG && (DBG.sgp = +new Date);
            // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
            // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
            // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
            // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
            // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
            // Or benchmark by reusing first start date.
            if(console.STAT && (ST = +new Date - S) > 9){ console.STAT(S, ST, 'got prep time'); console.STAT(S, C, 'got prep #') } SPT += ST; C = 0; S = +new Date;
            var faith = function(){}; faith.faith = true; faith.rad = get; // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
            root.on('in', {'@': id, put: graph, '%': info.more? 1 : u, err: err? err : u, _: faith, DBG: DBG});
            console.STAT && (ST = +new Date - S) > 9 && console.STAT(S, ST, 'got emit', Object.keys(graph||{}).length);
            graph = u; // each is outside our scope, we have to reset graph to nothing!
        }, o, DBG && (DBG.r = DBG.r || {}));
        DBG && (DBG.sgd = +new Date);
        console.STAT && (ST = +new Date - S) > 9 && console.STAT(S, ST, 'get call'); // TODO: Perf: this was half a second??????
        function each(val, has, a,b){ // TODO: THIS CODE NEEDS TO BE FASTER!!!!
            C++;
            if(!val){ return }
            has = (key+has).split(esc);
            var soul = has.slice(0,1)[0];
            has = has.slice(-1)[0];
            if(o.limit && o.limit <= o.count){ return true }
            var va, ve, so = soul, ha = has;
            //if(u !== (va = val[':']) && u !== (ve = val['>'])){ // THIS HANDLES NEW CODE!
            if('string' != typeof val){ // THIS HANDLES NEW CODE!
                va = val[':']; ve = val['>'];
                (graph = graph || {})[so] = Gun.state.ify(graph[so], ha, ve, va, so);
                //root.$.get(so).get(ha)._.rad = now;
                o.count = (o.count || 0) + ((va||'').length || 9);
                return;
            }
            o.count = (o.count || 0) + val.length;
            var tmp = val.lastIndexOf('>');
            var state = Radisk.decode(val.slice(tmp+1), null, esc);
            val = Radisk.decode(val.slice(0,tmp), null, esc);
            (graph = graph || {})[soul] = Gun.state.ify(graph[soul], has, state, val, soul);
        }
    });
    var val_is = Gun.valid;
    (opt.store||{}).stats = {get:{time:{}, count:0}, put: {time:{}, count:0}}; // STATS!
    var statg = 0, statp = 0; // STATS!
});
},{"../gun":1,"./radisk":7}],13:[function(require,module,exports){
var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

const rel_ = '#';  // '#'
const node_ = '_';  // '_'

Gun.chain.unset = function(node){
	if( this && node && node[node_] && node[node_].put && node[node_].put[node_] && node[node_].put[node_][rel_] ){
		this.put( { [node[node_].put[node_][rel_]]:null} );
	}
	return this;
}

},{"../gun":1}],14:[function(require,module,exports){
;(function(){
// JSON: JavaScript Object Notation
// YSON: Yielding javaScript Object Notation
var yson = {}, u, sI = setTimeout.turn || (typeof setImmediate != ''+u && setImmediate) || setTimeout;

yson.parseAsync = function(text, done, revive, M){
	if('string' != typeof text){ try{ done(u,JSON.parse(text)) }catch(e){ done(e) } return }
	var ctx = {i: 0, text: text, done: done, l: text.length, up: []};
	//M = 1024 * 1024 * 100;
	//M = M || 1024 * 64;
	M = M || 1024 * 32;
	parse();
	function parse(){
		//var S = +new Date;
		var s = ctx.text;
		var i = ctx.i, l = ctx.l, j = 0;
		var w = ctx.w, b, tmp;
		while(j++ < M){
			var c = s[i++];
			if(i > l){
				ctx.end = true;
				break;
			}
			if(w){
				i = s.indexOf('"', i-1); c = s[i];
				tmp = 0; while('\\' == s[i-(++tmp)]){}; tmp = !(tmp % 2);//tmp = ('\\' == s[i-1]); // json is stupid
				b = b || tmp;
				if('"' == c && !tmp){
					w = u;
					tmp = ctx.s;
					if(ctx.a){
						tmp = s.slice(ctx.sl, i);
						if(b || (1+tmp.indexOf('\\'))){ tmp = JSON.parse('"'+tmp+'"') } // escape + unicode :( handling
						if(ctx.at instanceof Array){
							ctx.at.push(ctx.s = tmp);
						} else {
							if(!ctx.at){ ctx.end = j = M; tmp = u }
							(ctx.at||{})[ctx.s] = ctx.s = tmp;
						}
						ctx.s = u;
					} else {
						ctx.s = s.slice(ctx.sl, i);
						if(b || (1+ctx.s.indexOf('\\'))){ ctx.s = JSON.parse('"'+ctx.s+'"'); } // escape + unicode :( handling
					}
					ctx.a = b = u;
				}
				++i;
			} else {
				switch(c){
				case '"':
					ctx.sl = i;
					w = true;
					break;
				case ':':
					ctx.ai = i;
					ctx.a = true;
					break;
				case ',':
					if(ctx.a || ctx.at instanceof Array){
						if(tmp = s.slice(ctx.ai, i-1)){
							if(u !== (tmp = value(tmp))){
								if(ctx.at instanceof Array){
									ctx.at.push(tmp);
								} else {
									ctx.at[ctx.s] = tmp;
								}
							}
						}
					}
					ctx.a = u;
					if(ctx.at instanceof Array){
						ctx.a = true;
						ctx.ai = i;
					}
					break;
				case '{':
					ctx.up.push(ctx.at||(ctx.at = {}));
					if(ctx.at instanceof Array){
						ctx.at.push(ctx.at = {});
					} else
					if(u !== (tmp = ctx.s)){
						ctx.at[tmp] = ctx.at = {};
					}
					ctx.a = u;
					break;
				case '}':
					if(ctx.a){
						if(tmp = s.slice(ctx.ai, i-1)){
							if(u !== (tmp = value(tmp))){
								if(ctx.at instanceof Array){
									ctx.at.push(tmp);
								} else {
									if(!ctx.at){ ctx.end = j = M; tmp = u }
									(ctx.at||{})[ctx.s] = tmp;
								}
							}
						}
					}
					ctx.a = u;
					ctx.at = ctx.up.pop();
					break;
				case '[':
					if(u !== (tmp = ctx.s)){
						ctx.up.push(ctx.at);
						ctx.at[tmp] = ctx.at = [];
					} else
					if(!ctx.at){
						ctx.up.push(ctx.at = []);
					}
					ctx.a = true;
					ctx.ai = i;
					break;
				case ']':
					if(ctx.a){
						if(tmp = s.slice(ctx.ai, i-1)){
							if(u !== (tmp = value(tmp))){
								if(ctx.at instanceof Array){
									ctx.at.push(tmp);
								} else {
									ctx.at[ctx.s] = tmp;
								}
							}
						}
					}
					ctx.a = u;
					ctx.at = ctx.up.pop();
					break;
				}
			}
		}
		ctx.s = u;
		ctx.i = i;
		ctx.w = w;
		if(ctx.end){
			tmp = ctx.at;
			if(u === tmp){
				try{ tmp = JSON.parse(text)
				}catch(e){ return ctx.done(e) }
			}
			ctx.done(u, tmp);
		} else {
			sI(parse);
		}
	}
}
function value(s){
	var n = parseFloat(s);
	if(!isNaN(n)){
		return n;
	}
	s = s.trim();
	if('true' == s){
		return true;
	}
	if('false' == s){
		return false;
	}
	if('null' == s){
		return null;
	}
}

yson.stringifyAsync = function(data, done, replacer, space, ctx){
	//try{done(u, JSON.stringify(data, replacer, space))}catch(e){done(e)}return;
	ctx = ctx || {};
	ctx.text = ctx.text || "";
	ctx.up = [ctx.at = {d: data}];
	ctx.done = done;
	ctx.i = 0;
	var j = 0;
	ify();
	function ify(){
		var at = ctx.at, data = at.d, add = '', tmp;
		if(at.i && (at.i - at.j) > 0){ add += ',' }
		if(u !== (tmp = at.k)){ add += JSON.stringify(tmp) + ':' } //'"'+tmp+'":' } // only if backslash
		switch(typeof data){
		case 'boolean':
			add += ''+data;
			break;
		case 'string':
			add += JSON.stringify(data); //ctx.text += '"'+data+'"';//JSON.stringify(data); // only if backslash
			break;
		case 'number':
			add += data;
			break;
		case 'object':
			if(!data){
				add += 'null';
				break;
			}
			if(data instanceof Array){	
				add += '[';
				at = {i: -1, as: data, up: at, j: 0};
				at.l = data.length;
				ctx.up.push(ctx.at = at);
				break;
			}
			if('function' != typeof (data||'').toJSON){
				add += '{';
				at = {i: -1, ok: Object.keys(data).sort(), as: data, up: at, j: 0};
				at.l = at.ok.length;
				ctx.up.push(ctx.at = at);
				break;
			}
			if(tmp = data.toJSON()){
				add += tmp;
				break;
			}
			// let this & below pass into default case...
		case 'function':
			if(at.as instanceof Array){
				add += 'null';
				break;
			}
		default: // handle wrongly added leading `,` if previous item not JSON-able.
			add = '';
			at.j++;
		}
		ctx.text += add;
		while(1+at.i >= at.l){
			ctx.text += (at.ok? '}' : ']');
			at = ctx.at = at.up;
		}
		if(++at.i < at.l){
			if(tmp = at.ok){
				at.d = at.as[at.k = tmp[at.i]];
			} else {
				at.d = at.as[at.i];
			}
			if(++j < 9){ return ify() } else { j = 0 }
			sI(ify);
			return;
		}
		ctx.done(u, ctx.text);
	}
}
if(typeof window != ''+u){ window.YSON = yson }
try{ if(typeof module != ''+u){ module.exports = yson } }catch(e){}
if(typeof JSON != ''+u){
	JSON.parseAsync = yson.parseAsync;
	JSON.stringifyAsync = yson.stringifyAsync;
}

}());
},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){

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
	
},{"./onto":25}],17:[function(require,module,exports){

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
	
},{"./root":27}],18:[function(require,module,exports){

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
	
},{"./root":27}],19:[function(require,module,exports){

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
	
},{"./shim":29}],20:[function(require,module,exports){

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
	
},{"./root":27}],21:[function(require,module,exports){

var Gun = require('./root');
require('./chain');
require('./back');
require('./put');
require('./get');
module.exports = Gun;
	
},{"./back":17,"./chain":18,"./get":20,"./put":26,"./root":27}],22:[function(require,module,exports){

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
	
},{"./index":21}],23:[function(require,module,exports){

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

	
},{"./shim":29}],24:[function(require,module,exports){

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
	
},{"./index":21}],25:[function(require,module,exports){

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
	
},{}],26:[function(require,module,exports){

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
	
},{"./root":27}],27:[function(require,module,exports){


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
	
},{"./ask":16,"./dup":19,"./onto":25,"./shim":29,"./state":30,"./valid":31}],28:[function(require,module,exports){

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
	
},{"./index":21}],29:[function(require,module,exports){

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
	
},{}],30:[function(require,module,exports){

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
	
},{"./shim":29}],31:[function(require,module,exports){

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
	
},{}],32:[function(require,module,exports){

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
	
},{"./index":21,"./mesh":23}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ3VuL2d1bi9ndW4uanMiLCJzcmMvZ3VuL2d1bi9saWIvYXhlLmpzIiwic3JjL2d1bi9ndW4vbGliL2xleC5qcyIsInNyYy9ndW4vZ3VuL2xpYi9sb2FkLmpzIiwic3JjL2d1bi9ndW4vbGliL25vdC5qcyIsInNyYy9ndW4vZ3VuL2xpYi9vcGVuLmpzIiwic3JjL2d1bi9ndW4vbGliL3JhZGlzay5qcyIsInNyYy9ndW4vZ3VuL2xpYi9yYWRpeC5qcyIsInNyYy9ndW4vZ3VuL2xpYi9yYWRtaWd0bXAuanMiLCJzcmMvZ3VuL2d1bi9saWIvcmZzLmpzIiwic3JjL2d1bi9ndW4vbGliL3JpbmRleGVkLmpzIiwic3JjL2d1bi9ndW4vbGliL3N0b3JlLmpzIiwic3JjL2d1bi9ndW4vbGliL3Vuc2V0LmpzIiwic3JjL2d1bi9ndW4vbGliL3lzb24uanMiLCJzcmMvZ3VuL2d1bi9zZWEuanMiLCJzcmMvZ3VuL2d1bi9zcmMvYXNrLmpzIiwic3JjL2d1bi9ndW4vc3JjL2JhY2suanMiLCJzcmMvZ3VuL2d1bi9zcmMvY2hhaW4uanMiLCJzcmMvZ3VuL2d1bi9zcmMvZHVwLmpzIiwic3JjL2d1bi9ndW4vc3JjL2dldC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9pbmRleC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9tYXAuanMiLCJzcmMvZ3VuL2d1bi9zcmMvbWVzaC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9vbi5qcyIsInNyYy9ndW4vZ3VuL3NyYy9vbnRvLmpzIiwic3JjL2d1bi9ndW4vc3JjL3B1dC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9yb290LmpzIiwic3JjL2d1bi9ndW4vc3JjL3NldC5qcyIsInNyYy9ndW4vZ3VuL3NyYy9zaGltLmpzIiwic3JjL2d1bi9ndW4vc3JjL3N0YXRlLmpzIiwic3JjL2d1bi9ndW4vc3JjL3ZhbGlkLmpzIiwic3JjL2d1bi9ndW4vc3JjL3dlYnNvY2tldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDci9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvL2RlZmF1bHQgZ3VuXG52YXIgR3VuID0gICByZXF1aXJlKCcuL3NyYy9yb290Jyk7XG5cblxucmVxdWlyZSgnLi9zcmMvc2hpbScpO1xucmVxdWlyZSgnLi9zcmMvb250bycpO1xucmVxdWlyZSgnLi9zcmMvdmFsaWQnKTtcbnJlcXVpcmUoJy4vc3JjL3N0YXRlJyk7XG5yZXF1aXJlKCcuL3NyYy9kdXAnKTtcbnJlcXVpcmUoJy4vc3JjL2FzaycpO1xucmVxdWlyZSgnLi9zcmMvY2hhaW4nKTtcbnJlcXVpcmUoJy4vc3JjL2JhY2snKTtcbnJlcXVpcmUoJy4vc3JjL3B1dCcpO1xucmVxdWlyZSgnLi9zcmMvZ2V0Jyk7XG5yZXF1aXJlKCcuL3NyYy9vbicpO1xucmVxdWlyZSgnLi9zcmMvbWFwJyk7XG5yZXF1aXJlKCcuL3NyYy9zZXQnKTtcbnJlcXVpcmUoJy4vc3JjL21lc2gnKTtcbnJlcXVpcmUoJy4vc3JjL3dlYnNvY2tldCcpO1xuLy8gcmVxdWlyZSgnLi9zcmMvbG9jYWxTdG9yYWdlJyk7XG5cbnJlcXVpcmUoJy4vbGliL3N0b3JlJyk7XG5yZXF1aXJlKCcuL2xpYi9yZnMnKTtcbnJlcXVpcmUoXCIuL2xpYi9yYWRpeFwiKTtcbnJlcXVpcmUoXCIuL2xpYi9yYWRpc2tcIik7XG5cbnJlcXVpcmUoJy4vbGliL2F4ZScpO1xuXG4vL2RlZmF1bHQgZXh0cmEgZ3VuIGxpcyB0byBpbmNsdWRlXG5yZXF1aXJlKCcuL2xpYi9sZXgnKTtcblxuLy8gcmVxdWlyZShcIi4vbnRzXCIpO1xucmVxdWlyZShcIi4vbGliL3Vuc2V0XCIpO1xucmVxdWlyZShcIi4vbGliL25vdFwiKTtcbnJlcXVpcmUoXCIuL2xpYi9vcGVuXCIpO1xucmVxdWlyZShcIi4vbGliL2xvYWRcIik7XG5cblxucmVxdWlyZShcIi4vbGliL3JpbmRleGVkXCIpO1xuXG5cblxuXG5cbi8vaW5jbHVkZSBzZWEgaW4gdGhlIGJ1aWxkXG5yZXF1aXJlKCcuL3NlYScpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gR3VuO1xuIiwiLy8gSSBkb24ndCBxdWl0ZSBrbm93IHdoZXJlIHRoaXMgc2hvdWxkIGdvIHlldCwgc28gcHV0dGluZyBpdCBoZXJlXG4vLyB3aGF0IHdpbGwgcHJvYmFibHkgd2luZCB1cCBoYXBwZW5pbmcgaXMgdGhhdCBtaW5pbWFsIEFYRSBsb2dpYyBhZGRlZCB0byBlbmQgb2YgZ3VuLmpzXG4vLyBhbmQgdGhlbiByZXN0IG9mIEFYRSBsb2dpYyAoaGVyZSkgd2lsbCBiZSBtb3ZlZCBiYWNrIHRvIGd1bi9heGUuanNcbi8vIGJ1dCBmb3Igbm93Li4uIEkgZ290dGEgcnVzaCB0aGlzIG91dCFcbnZhciBHdW4gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIik/IHdpbmRvdy5HdW4gOiByZXF1aXJlKCcuLi9ndW4nKSwgdTtcbkd1bi5vbignb3B0JywgZnVuY3Rpb24oYXQpeyBzdGFydChhdCk7IHRoaXMudG8ubmV4dChhdCkgfSk7IC8vIG1ha2Ugc3VyZSB0byBjYWxsIHRoZSBcIm5leHRcIiBtaWRkbGV3YXJlIGFkYXB0ZXIuXG4vLyBUT0RPOiBCVUc6IHBhbmljIHRlc3QvcGFuaWMvMSAmIHRlc3QvcGFuaWMvMyBmYWlsIHdoZW4gQVhFIGlzIG9uLlxuZnVuY3Rpb24gc3RhcnQocm9vdCl7XG5cdGlmKHJvb3QuYXhlKXsgcmV0dXJuIH1cblx0dmFyIG9wdCA9IHJvb3Qub3B0LCBwZWVycyA9IG9wdC5wZWVycztcblx0aWYoZmFsc2UgPT09IG9wdC5heGUpeyByZXR1cm4gfVxuXHRpZigodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIpICYmICdmYWxzZScgPT09ICcnKyhwcm9jZXNzLmVudnx8JycpLkFYRSl7IHJldHVybiB9XG5cdEd1bi5sb2cub25jZShcIkFYRSByZWxheSBlbmFibGVkIVwiKTtcblx0dmFyIGF4ZSA9IHJvb3QuYXhlID0ge30sIHRtcCwgaWQ7XG5cdHZhciBtZXNoID0gb3B0Lm1lc2ggPSBvcHQubWVzaCB8fCBHdW4uTWVzaChyb290KTsgLy8gREFNIVxuXHR2YXIgZHVwID0gcm9vdC5kdXA7XG5cblx0bWVzaC53YXkgPSBmdW5jdGlvbihtc2cpe1xuXHRcdGlmKCFtc2cpeyByZXR1cm4gfVxuXHRcdGlmKG1zZy5nZXQpeyByZXR1cm4gR0VUKG1zZykgfVxuXHRcdGlmKG1zZy5wdXQpeyByZXR1cm4gfVxuXHRcdGZhbGwobXNnKTtcblx0fVxuXG5cdGZ1bmN0aW9uIEdFVChtc2cpe1xuXHRcdGlmKCFtc2cpeyByZXR1cm4gfVxuXHRcdHZhciB2aWEgPSAobXNnLl98fCcnKS52aWEsIHNvdWwsIGhhcywgdG1wLCByZWY7XG5cdFx0aWYoIXZpYSB8fCAhdmlhLmlkKXsgcmV0dXJuIGZhbGwobXNnKSB9XG5cdFx0dmFyIHN1YiA9ICh2aWEuc3ViIHx8ICh2aWEuc3ViID0gbmV3IE9iamVjdC5NYXApKTtcblx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgKHNvdWwgPSBtc2cuZ2V0WycjJ10pKXsgcmVmID0gcm9vdC4kLmdldChzb3VsKSB9XG5cdFx0aWYoJ3N0cmluZycgPT0gdHlwZW9mICh0bXAgPSBtc2cuZ2V0WycuJ10pKXsgaGFzID0gdG1wIH0gZWxzZSB7IGhhcyA9ICcnIH1cblx0XHRyZWYgJiYgKHN1Yi5nZXQoc291bCkgfHwgKHN1Yi5zZXQoc291bCwgdG1wID0gbmV3IE9iamVjdC5NYXApICYmIHRtcCkpLnNldChoYXMsIDEpOyAvLyB7c291bDogeycnOjEsIGhhczogMX19XG5cdFx0aWYoIShyZWYgPSAocmVmfHwnJykuXykpeyByZXR1cm4gZmFsbChtc2cpIH1cblx0XHRyZWYuYXNrZWQgPSArbmV3IERhdGU7XG5cdFx0KHJlZi5yb3V0ZSB8fCAocmVmLnJvdXRlID0gbmV3IE9iamVjdC5NYXApKS5zZXQodmlhLmlkLCB2aWEpOyAvLyB0aGlzIGFwcHJvYWNoIGlzIG5vdCBnb25uYSBzY2FsZSBob3cgSSB3YW50IGl0IHRvLCBidXQgdHJ5IGZvciBub3cuXG5cdFx0R0VULnR1cm4obXNnLCByZWYucm91dGUsIDApO1xuXHR9XG5cdEdFVC50dXJuID0gZnVuY3Rpb24obXNnLCByb3V0ZSwgdHVybil7XG5cdFx0dmFyIHRtcCA9IG1zZ1snIyddLCB0YWcgPSBkdXAuc1t0bXBdLCBuZXh0OyBcblx0XHRpZighdG1wIHx8ICF0YWcpeyByZXR1cm4gfSAvLyBtZXNzYWdlIHRpbWVkIG91dCwgR1VOIG1heSByZXF1aXJlIHVzIHRvIHJlbGF5LCB0aG8gQVhFIGRvZXMgbm90IGxpa2UgdGhhdC4gUmV0aGluaz9cblx0XHQvLyBUT09EOiBCVUchIEhhbmRsZSBlZGdlIGNhc2Ugd2hlcmUgbGl2ZSB1cGRhdGVzIG9jY3VyIHdoaWxlIHRoZXNlIHR1cm4gaGFzaGVzIGFyZSBiZWluZyBjaGVja2VkICh0aGV5J2xsIG5ldmVyIGJlIGNvbnNpc3RlbnQpLCBidXQgd2UgZG9uJ3Qgd2FudCB0byBkZWdyYWRlIHRvIE8oTiksIGlmIHdlIGtub3cgdGhlIHZpYSBhc2tpbmcgcGVlciBnb3QgYW4gdXBkYXRlLCB0aGVuIHdlIHNob3VsZCBkbyBzb21ldGhpbmcgbGlrZSBjYW5jZWwgdGhlc2UgdHVybnMgYXNraW5nIGZvciBkYXRhLlxuXHRcdC8vIElkZWFzOiBTYXZlIGEgcmFuZG9tIHNlZWQgdGhhdCBzb3J0cyB0aGUgcm91dGUsIHN0b3JlIGl0IGFuZCB0aGUgaW5kZXguIC8vIE9yIGluZGV4aW5nIG9uIGxvd2VzdCBsYXRlbmN5IGlzIHByb2JhYmx5IGJldHRlci5cblx0XHRjbGVhclRpbWVvdXQodGFnLmxhY2spO1xuXHRcdGlmKHRhZy5hY2sgJiYgKHRtcCA9IHRhZ1snIyMnXSkgJiYgbXNnWycjIyddID09PSB0bXApeyByZXR1cm4gfSAvLyBoYXNoZXMgbWF0Y2gsIHN0b3AgYXNraW5nIG90aGVyIHBlZXJzIVxuXHRcdG5leHQgPSAoT2JqZWN0Lm1hcHMocm91dGV8fG9wdC5wZWVycykpLnNsaWNlKHR1cm4gPSB0dXJuIHx8IDApO1xuXHRcdGlmKCFuZXh0Lmxlbmd0aCl7XG5cdFx0XHRpZighcm91dGUpeyByZXR1cm4gfSAvLyBhc2tlZCBhbGwgcGVlcnMsIHN0b3AgYXNraW5nIVxuXHRcdFx0R0VULnR1cm4obXNnLCB1LCAwKTsgLy8gYXNrZWQgYWxsIHN1YnMsIG5vdyBub3cgYXNrIGFueSBwZWVycy4gKG5vdCBhbHdheXMgdGhlIGJlc3QgaWRlYSwgYnV0IHN0YXlzIClcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0c2V0VGltZW91dC5lYWNoKG5leHQsIGZ1bmN0aW9uKGlkKXtcblx0XHRcdHZhciBwZWVyID0gb3B0LnBlZXJzW2lkXTsgdHVybisrO1xuXHRcdFx0aWYoIXBlZXIgfHwgIXBlZXIud2lyZSl7IHJvdXRlICYmIHJvdXRlLmRlbGV0ZShpZCk7IHJldHVybiB9IC8vIGJ5ZSFcblx0XHRcdGlmKG1lc2guc2F5KG1zZywgcGVlcikgPT09IGZhbHNlKXsgcmV0dXJuIH0gLy8gd2FzIHNlbGZcblx0XHRcdGlmKDAgPT0gKHR1cm4gJSAzKSl7IHJldHVybiAxIH1cblx0XHR9LCBmdW5jdGlvbigpe1xuXHRcdFx0dGFnWycjIyddID0gbXNnWycjIyddOyAvLyBzaG91bGQgcHJvYmFibHkgc2V0IHRoaXMgaW4gYSBtb3JlIGNsZXZlciBtYW5uZXIsIGRvIGxpdmUgYGluYCBjaGVja3MgKysgLS0sIGV0Yy4gYnV0IGJlaW5nIGxhenkgZm9yIG5vdy4gLy8gVE9ETzogWWVzLCBzZWUgYGluYCBUT0RPLCBjdXJyZW50bHkgdGhpcyBtaWdodCBtYXRjaCBhZ2FpbnN0IG9ubHkgaW4tbWVtIGNhdXNlIG5vIG90aGVyIHBlZXJzIHJlcGx5LCB3aGljaCBpcyBcImZpbmVcIiwgYnV0IGNvdWxkIGNhdXNlIGEgZmFsc2UgcG9zaXRpdmUuXG5cdFx0XHR0YWcubGFjayA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgR0VULnR1cm4obXNnLCByb3V0ZSwgdHVybikgfSwgMjUpO1xuXHRcdH0sIDMpO1xuXHR9XG5cdGZ1bmN0aW9uIGZhbGwobXNnKXsgbWVzaC5zYXkobXNnLCBvcHQucGVlcnMpIH1cblx0XG5cdHJvb3Qub24oJ2luJywgZnVuY3Rpb24obXNnKXsgdmFyIHRvID0gdGhpcy50bywgdG1wO1xuXHRcdGlmKCh0bXAgPSBtc2dbJ0AnXSkgJiYgKHRtcCA9IGR1cC5zW3RtcF0pKXtcblx0XHRcdHRtcC5hY2sgPSAodG1wLmFjayB8fCAwKSArIDE7IC8vIGNvdW50IHJlbW90ZSBBQ0tzIHRvIEdFVC4gLy8gVE9ETzogSWYgbWlzbWF0Y2gsIHNob3VsZCB0cmlnZ2VyIG5leHQgYXNrcy5cblx0XHRcdGlmKCh0bXAgPSB0bXAuYmFjaykpeyAvLyBiYWNrdHJhY2sgT0tzIHNpbmNlIEFYRSBzcGxpdHMgUFVUcyB1cC5cblx0XHRcdFx0c2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKHRtcCksIGZ1bmN0aW9uKGlkKXtcblx0XHRcdFx0XHR0by5uZXh0KHsnIyc6IG1zZ1snIyddLCAnQCc6IGlkLCBvazogbXNnLm9rfSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fSBcblx0XHR0by5uZXh0KG1zZyk7XG5cdH0pO1xuXG5cdHJvb3Qub24oJ2NyZWF0ZScsIGZ1bmN0aW9uKCl7XG5cdFx0dmFyIFEgPSB7fTtcblx0XHRyb290Lm9uKCdwdXQnLCBmdW5jdGlvbihtc2cpe1xuXHRcdFx0dmFyIGV2ZSA9IHRoaXMsIGF0ID0gZXZlLmFzLCBwdXQgPSBtc2cucHV0LCBzb3VsID0gcHV0WycjJ10sIGhhcyA9IHB1dFsnLiddLCB2YWwgPSBwdXRbJzonXSwgc3RhdGUgPSBwdXRbJz4nXSwgcSwgdG1wO1xuXHRcdFx0ZXZlLnRvLm5leHQobXNnKTtcblx0XHRcdGlmKG1zZ1snQCddKXsgcmV0dXJuIH0gLy8gYWNrcyBzZW5kIGV4aXN0aW5nIGRhdGEsIG5vdCB1cGRhdGVzLCBzbyBubyBuZWVkIHRvIHJlc2VuZCB0byBvdGhlcnMuXG5cdFx0XHRpZighc291bCB8fCAhaGFzKXsgcmV0dXJuIH1cblx0XHRcdHZhciByZWYgPSByb290LiQuZ2V0KHNvdWwpLl8sIHJvdXRlID0gKHJlZnx8JycpLnJvdXRlO1xuXHRcdFx0Ly8ndGVzdCcgPT09IHNvdWwgJiYgY29uc29sZS5sb2coT2JqZWN0LnBvcnQsICcnK21zZ1snIyddLCBoYXMsIHZhbCwgcm91dGUgJiYgcm91dGUua2V5cygpKTtcblx0XHRcdGlmKCFyb3V0ZSl7IHJldHVybiB9XG5cdFx0XHRpZihyZWYuc2tpcCl7IHJlZi5za2lwLm5vdyA9IG1zZ1snIyddOyByZXR1cm4gfVxuXHRcdFx0KHJlZi5za2lwID0ge25vdzogbXNnWycjJ119KS50byA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdHNldFRpbWVvdXQuZWFjaChPYmplY3QubWFwcyhyb3V0ZSksIGZ1bmN0aW9uKHBpZCl7IHZhciBwZWVyLCB0bXA7XG5cdFx0XHRcdGlmKCEocGVlciA9IHJvdXRlLmdldChwaWQpKSl7IHJldHVybiB9XG5cdFx0XHRcdGlmKCFwZWVyLndpcmUpeyByb3V0ZS5kZWxldGUocGlkKTsgcmV0dXJuIH0gLy8gYnllIVxuXHRcdFx0XHR2YXIgc3ViID0gKHBlZXIuc3ViIHx8IChwZWVyLnN1YiA9IG5ldyBPYmplY3QuTWFwKSkuZ2V0KHNvdWwpO1xuXHRcdFx0XHRpZighc3ViKXsgcmV0dXJuIH1cblx0XHRcdFx0aWYoIXN1Yi5nZXQoaGFzKSAmJiAhc3ViLmdldCgnJykpeyByZXR1cm4gfVxuXHRcdFx0XHR2YXIgcHV0ID0gcGVlci5wdXQgfHwgKHBlZXIucHV0ID0ge30pO1xuXHRcdFx0XHR2YXIgbm9kZSA9IHJvb3QuZ3JhcGhbc291bF0sIHRtcDtcblx0XHRcdFx0aWYobm9kZSAmJiB1ICE9PSAodG1wID0gbm9kZVtoYXNdKSl7XG5cdFx0XHRcdFx0c3RhdGUgPSBzdGF0ZV9pcyhub2RlLCBoYXMpO1xuXHRcdFx0XHRcdHZhbCA9IHRtcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRwdXRbc291bF0gPSBzdGF0ZV9pZnkocHV0W3NvdWxdLCBoYXMsIHN0YXRlLCB2YWwsIHNvdWwpO1xuXHRcdFx0XHR0bXAgPSBkdXAudHJhY2socGVlci5uZXh0ID0gcGVlci5uZXh0IHx8IFN0cmluZy5yYW5kb20oOSkpO1xuXHRcdFx0XHQodG1wLmJhY2sgfHwgKHRtcC5iYWNrID0ge30pKVsnJytyZWYuc2tpcC5ub3ddID0gMTtcblx0XHRcdFx0aWYocGVlci50byl7IHJldHVybiB9XG5cdFx0XHRcdHBlZXIudG8gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGZsdXNoKHBlZXIpIH0sIG9wdC5nYXApO1xuXHRcdFx0fSkgfSwgOSk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIGZsdXNoKHBlZXIpe1xuXHRcdHZhciBtc2cgPSB7JyMnOiBwZWVyLm5leHQsIHB1dDogcGVlci5wdXQsIG9rOiB7J0AnOiAzLCAnLyc6IG1lc2gubmVhcn19OyAvLyBCVUc6IFRPRE86IHN1YiBjb3VudCFcblx0XHQvLyBUT0RPOiB3aGF0IGFib3V0IERBTSdzID48IGRlZHVwPyBDdXJyZW50IHRoaW5raW5nIGlzLCBkb24ndCB1c2UgaXQsIGhvd2V2ZXIsIHlvdSBjb3VsZCBzdG9yZSBmaXJzdCBtc2cjICYgbGF0ZXN0IG1zZyMsIGFuZCBpZiBoZXJlLi4uIGxhdGVzdCA9PT0gZmlyc3QgdGhlbiBsaWtlbHkgaXQgaXMgdGhlIHNhbWUgPjwgdGhpbmcsIHNvIGlmKGZpcnN0TXNnWyc+PCddW3BlZXIuaWRdKXsgcmV0dXJuIH0gZG9uJ3Qgc2VuZC5cblx0XHRwZWVyLm5leHQgPSBwZWVyLnB1dCA9IHBlZXIudG8gPSBudWxsO1xuXHRcdG1lc2guc2F5KG1zZywgcGVlcik7XG5cdH1cblx0dmFyIHN0YXRlX2lmeSA9IEd1bi5zdGF0ZS5pZnksIHN0YXRlX2lzID0gR3VuLnN0YXRlLmlzO1xuXG5cdDsoZnVuY3Rpb24oKXsgLy8gVEhJUyBJUyBUSEUgVVAgTU9EVUxFO1xuXHRcdGF4ZS51cCA9IHt9O1xuXHRcdHZhciBoaSA9IG1lc2guaGVhclsnPyddOyAvLyBsb3dlci1sZXZlbCBpbnRlZ3JhdGlvbiB3aXRoIERBTSEgVGhpcyBpcyBhYm5vcm1hbCBidXQgaGVscHMgcGVyZm9ybWFuY2UuXG5cdFx0bWVzaC5oZWFyWyc/J10gPSBmdW5jdGlvbihtc2csIHBlZXIpeyB2YXIgcDsgLy8gZGVkdXBsaWNhdGUgdW5uZWNlc3NhcnkgY29ubmVjdGlvbnM6XG5cdFx0XHRoaShtc2csIHBlZXIpO1xuXHRcdFx0aWYoIXBlZXIucGlkKXsgcmV0dXJuIH1cblx0XHRcdGlmKHBlZXIucGlkID09PSBvcHQucGlkKXsgbWVzaC5ieWUocGVlcik7IHJldHVybiB9IC8vIGlmIEkgY29ubmVjdGVkIHRvIG15c2VsZiwgZHJvcC5cblx0XHRcdGlmKHAgPSBheGUudXBbcGVlci5waWRdKXsgLy8gaWYgd2UgYm90aCBjb25uZWN0ZWQgdG8gZWFjaCBvdGhlci4uLlxuXHRcdFx0XHRpZihwID09PSBwZWVyKXsgcmV0dXJuIH0gLy8gZG8gbm90aGluZyBpZiBubyBjb25mbGljdCxcblx0XHRcdFx0aWYob3B0LnBpZCA+IHBlZXIucGlkKXsgLy8gZWxzZSBkZXRlcm1pbmlzdGljYWxseSBzb3J0XG5cdFx0XHRcdFx0cCA9IHBlZXI7IC8vIHNvIHdlIHdpbGwgd2luZCB1cCBjaG9vc2luZyB0aGUgc2FtZSB0byBrZWVwXG5cdFx0XHRcdFx0cGVlciA9IGF4ZS51cFtwLnBpZF07IC8vIGFuZCB0aGUgc2FtZSB0byBkcm9wLlxuXHRcdFx0XHR9XG5cdFx0XHRcdHAudXJsID0gcC51cmwgfHwgcGVlci51cmw7IC8vIGNvcHkgaWYgbm90XG5cdFx0XHRcdG1lc2guYnllKHBlZXIpOyAvLyBkcm9wXG5cdFx0XHRcdGF4ZS51cFtwLnBpZF0gPSBwOyAvLyB1cGRhdGUgc2FtZSB0byBiZSBzYW1lLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZighcGVlci51cmwpeyByZXR1cm4gfVxuXHRcdFx0YXhlLnVwW3BlZXIucGlkXSA9IHBlZXI7XG5cdFx0fTtcblx0fSgpKTtcblxuXHQ7KGZ1bmN0aW9uKCl7IC8vIFRISVMgSVMgVEhFIE1PQiBNT0RVTEU7XG5cdFx0Ly9yZXR1cm47IC8vIFdPUksgSU4gUFJPR1JFU1MsIFRFU1QgRklOQUxJWkVELCBORUVEIFRPIE1BS0UgU1RBQkxFLlxuXHRcdC8qXG5cdFx0XHRBWEUgc2hvdWxkIGhhdmUgYSBjb3VwbGUgb2YgdGhyZXNob2xkIGl0ZW1zLi4uXG5cdFx0XHRsZXQncyBwcmV0ZW5kIHRoZXJlIGlzIGEgdmFyaWFibGUgbWF4IHBlZXJzIGNvbm5lY3RlZFxuXHRcdFx0bW9iID0gMTAwMDBcblx0XHRcdGlmIHdlIGdldCBtb3JlIHBlZXJzIHRoYW4gdGhhdC4uLlxuXHRcdFx0d2Ugc2hvdWxkIHN0YXJ0IHNlbmRpbmcgdGhvc2UgcGVlcnMgYSByZW1vdGUgY29tbWFuZFxuXHRcdFx0dGhhdCB0aGV5IHNob3VsZCBjb25uZWN0IHRvIHRoaXMgb3IgdGhhdCBvdGhlciBwZWVyXG5cdFx0XHRhbmQgdGhlbiBvbmNlIHRoZXkgKG9yIGJlZm9yZSB0aGV5IGRvPykgZHJvcCB0aGVtIGZyb20gdXMuXG5cdFx0XHRzYWtlIG9mIHRoZSB0ZXN0Li4uIGdvbm5hIHNldCB0aGF0IHBlZXIgbnVtYmVyIHRvIDEuXG5cdFx0XHRUaGUgbW9iIHRocmVzaG9sZCBtaWdodCBiZSBkZXRlcm1pbmVkIGJ5IG90aGVyIGZhY3RvcnMsXG5cdFx0XHRsaWtlIGhvdyBtdWNoIFJBTSBvciBDUFUgc3RyZXNzIHdlIGhhdmUuXG5cdFx0Ki9cblx0XHRvcHQubW9iID0gb3B0Lm1vYiB8fCA5OTAwOyAvLyBzaG91bGQgYmUgYmFzZWQgb24gdWxpbWl0LCBzb21lIGNsb3VkcyBhcyBsb3cgYXMgMTBLLlxuXG5cdFx0Ly8gaGFuZGxlIHJlYmFsYW5jaW5nIGEgbW9iIG9mIHBlZXJzOlxuXHRcdHJvb3Qub24oJ2hpJywgZnVuY3Rpb24ocGVlcil7XG5cdFx0XHR0aGlzLnRvLm5leHQocGVlcik7XG5cdFx0XHRpZihwZWVyLnVybCl7IHJldHVybiB9IC8vIEkgYW0gYXNzdW1pbmcgdGhhdCBpZiB3ZSBhcmUgd2FudGluZyB0byBtYWtlIGFuIG91dGJvdW5kIGNvbm5lY3Rpb24gdG8gdGhlbSwgdGhhdCB3ZSBkb24ndCBldmVyIHdhbnQgdG8gZHJvcCB0aGVtIHVubGVzcyBvdXIgYWN0dWFsIGNvbmZpZyBzZXR0aW5ncyBjaGFuZ2UuXG5cdFx0XHR2YXIgY291bnQgPSAvKk9iamVjdC5rZXlzKG9wdC5wZWVycykubGVuZ3RoIHx8Ki8gbWVzaC5uZWFyOyAvLyBUT0RPOiBCVUchIFRoaXMgaXMgc2xvdywgdXNlIC5uZWFyLCBidXQgbmVhciBpcyBidWdneSByaWdodCBub3csIGZpeCBpbiBEQU0uXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiYXJlIHdlIG1vYmJlZD9cIiwgb3B0Lm1vYiwgT2JqZWN0LmtleXMob3B0LnBlZXJzKS5sZW5ndGgsIG1lc2gubmVhcik7XG5cdFx0XHRpZihvcHQubW9iID49IGNvdW50KXsgcmV0dXJuIH0gIC8vIFRPRE86IE1ha2UgZHluYW1pYyBiYXNlZCBvbiBSQU0vQ1BVIGFsc28uIE9yIHBvc3NpYmx5IGV2ZW4gd2VpcmQgc3R1ZmYgbGlrZSBvcHQubW9iIC8gYXhlLnVwIGxlbmd0aD9cblx0XHRcdHZhciBwZWVycyA9IHt9O09iamVjdC5rZXlzKGF4ZS51cCkuZm9yRWFjaChmdW5jdGlvbihwKXsgcCA9IGF4ZS51cFtwXTsgcC51cmwgJiYgKHBlZXJzW3AudXJsXT17fSkgfSk7XG5cdFx0XHQvLyBUT0RPOiBCVUchISEgSW5maW5pdGUgcmVjb25uZWN0aW9uIGxvb3AgaGFwcGVucyBpZiBub3QgZW5vdWdoIHJlbGF5cywgb3IgaWYgc29tZSBhcmUgbWlzc2luZy4gRm9yIGluc3RhbmNlLCA6ODc2NiBzYXlzIHRvIGNvbm5lY3QgdG8gOjg3Njcgd2hpY2ggdGhlbiBzYXlzIHRvIGNvbm5lY3QgdG8gOjg3NjYuIFRvIG5vdCBERG9TIHdoZW4gc3lzdGVtIG92ZXJsb2FkLCBmaWd1cmUgY2xldmVyIHdheSB0byB0ZWxsIHBlZXJzIHRvIHJldHJ5IGxhdGVyLCB0aGF0IG5ldHdvcmsgZG9lcyBub3QgaGF2ZSBlbm91Z2ggY2FwYWNpdHk/XG5cdFx0XHRtZXNoLnNheSh7ZGFtOiAnbW9iJywgbW9iOiBjb3VudCwgcGVlcnM6IHBlZXJzfSwgcGVlcik7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IG1lc2guYnllKHBlZXIpIH0sIDkpOyAvLyBzb21ldGhpbmcgd2l0aCBiZXR0ZXIgcGVyZj9cblx0XHR9KTtcblx0XHRyb290Lm9uKCdieWUnLCBmdW5jdGlvbihwZWVyKXtcblx0XHRcdHRoaXMudG8ubmV4dChwZWVyKTtcblx0XHR9KTtcblxuXHR9KCkpO1xufVxuXG47KGZ1bmN0aW9uKCl7XG5cdHZhciBmcm9tID0gQXJyYXkuZnJvbTtcblx0T2JqZWN0Lm1hcHMgPSBmdW5jdGlvbihvKXtcblx0XHRpZihmcm9tICYmIG8gaW5zdGFuY2VvZiBNYXApeyByZXR1cm4gZnJvbShvLmtleXMoKSkgfVxuXHRcdGlmKG8gaW5zdGFuY2VvZiBPYmplY3QuTWFwKXsgbyA9IG8ucyB9XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKG8pO1xuXHR9XG5cdGlmKGZyb20peyByZXR1cm4gT2JqZWN0Lk1hcCA9IE1hcCB9XG5cdChPYmplY3QuTWFwID0gZnVuY3Rpb24oKXsgdGhpcy5zID0ge30gfSkucHJvdG90eXBlID0ge3NldDpmdW5jdGlvbihrLHYpe3RoaXMuc1trXT12O3JldHVybiB0aGlzfSxnZXQ6ZnVuY3Rpb24oayl7cmV0dXJuIHRoaXMuc1trXX0sZGVsZXRlOmZ1bmN0aW9uKGspe2RlbGV0ZSB0aGlzLnNba119fTtcbn0oKSk7XG4iLCIoZnVuY3Rpb24gKEd1biwgdSkge1xuICAgIC8qKlxuICAgICAqIFxuICAgICAqICBjcmVkaXRzOiBcbiAgICAgKiAgICAgIGdpdGh1YjpibWF0dXNpYWtcbiAgICAgKiBcbiAgICAgKi8gICAgXG4gICAgdmFyIGxleCA9IChndW4pID0+IHtcbiAgICAgICAgZnVuY3Rpb24gTGV4KCkge31cblxuICAgICAgICBMZXgucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShPYmplY3QucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBMZXhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIExleC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5tb3JlID0gZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIHRoaXNbXCI+XCJdID0gbTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUubGVzcyA9IGZ1bmN0aW9uIChsZSkge1xuICAgICAgICAgICAgdGhpc1tcIjxcIl0gPSBsZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUuaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbCA9IG5ldyBMZXgoKTtcbiAgICAgICAgICAgIHRoaXNbXCIuXCJdID0gbDtcbiAgICAgICAgICAgIHJldHVybiBsO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUub2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbCA9IG5ldyBMZXgoKTtcbiAgICAgICAgICAgIHRoaXMuaGFzaChsKVxuICAgICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5oYXNoID0gZnVuY3Rpb24gKGgpIHtcbiAgICAgICAgICAgIHRoaXNbXCIjXCJdID0gaDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUucHJlZml4ID0gZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHRoaXNbXCIqXCJdID0gcDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUucmV0dXJuID0gZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgIHRoaXNbXCI9XCJdID0gcjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUubGltaXQgPSBmdW5jdGlvbiAobCkge1xuICAgICAgICAgICAgdGhpc1tcIiVcIl0gPSBsO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgTGV4LnByb3RvdHlwZS5yZXZlcnNlID0gZnVuY3Rpb24gKHJ2KSB7XG4gICAgICAgICAgICB0aGlzW1wiLVwiXSA9IHJ2IHx8IDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBMZXgucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHRoaXNbXCIrXCJdID0gaTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBndW4ubWFwKHRoaXMsIC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIExleC5wcm90b3R5cGUubWF0Y2ggPSBsZXgubWF0Y2g7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbmV3IExleCgpO1xuICAgIH07XG5cbiAgICBsZXgubWF0Y2ggPSBmdW5jdGlvbih0LG8peyB2YXIgdG1wLCB1O1xuICAgICAgICBvID0gbyB8fCB0aGlzIHx8IHt9OyAgICAgICAgICAgIFxuICAgICAgICBpZignc3RyaW5nJyA9PSB0eXBlb2Ygbyl7IG8gPSB7Jz0nOiBvfSB9XG4gICAgICAgIGlmKCdzdHJpbmcnICE9PSB0eXBlb2YgdCl7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIHRtcCA9IChvWyc9J10gfHwgb1snKiddIHx8IG9bJz4nXSB8fCBvWyc8J10pO1xuICAgICAgICBpZih0ID09PSB0bXApeyByZXR1cm4gdHJ1ZSB9XG4gICAgICAgIGlmKHUgIT09IG9bJz0nXSl7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIHRtcCA9IChvWycqJ10gfHwgb1snPiddKTtcbiAgICAgICAgaWYodC5zbGljZSgwLCAodG1wfHwnJykubGVuZ3RoKSA9PT0gdG1wKXsgcmV0dXJuIHRydWUgfVxuICAgICAgICBpZih1ICE9PSBvWycqJ10peyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBpZih1ICE9PSBvWyc+J10gJiYgdSAhPT0gb1snPCddKXtcbiAgICAgICAgICAgIHJldHVybiAodCA+PSBvWyc+J10gJiYgdCA8PSBvWyc8J10pPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYodSAhPT0gb1snPiddICYmIHQgPj0gb1snPiddKXsgcmV0dXJuIHRydWUgfVxuICAgICAgICBpZih1ICE9PSBvWyc8J10gJiYgdCA8PSBvWyc8J10peyByZXR1cm4gdHJ1ZSB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBHdW4uTGV4ID0gbGV4O1xuXG4gICAgR3VuLmNoYWluLmxleCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGxleCh0aGlzKTtcbiAgICB9XG5cbn0pKCh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSA/IHdpbmRvdy5HdW4gOiByZXF1aXJlKCcuLi9ndW4nKSkiLCJ2YXIgR3VuID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpPyB3aW5kb3cuR3VuIDogcmVxdWlyZSgnLi4vZ3VuJyk7XG5HdW4uY2hhaW4ub3BlbiB8fCByZXF1aXJlKCcuL29wZW4nKTtcblxuR3VuLmNoYWluLmxvYWQgPSBmdW5jdGlvbihjYiwgb3B0LCBhdCl7XG5cdChvcHQgPSBvcHQgfHwge30pLm9mZiA9ICEwO1xuXHRyZXR1cm4gdGhpcy5vcGVuKGNiLCBvcHQsIGF0KTtcbn0iLCJpZih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgdmFyIEd1biA9IHdpbmRvdy5HdW47XG59IGVsc2UgeyBcbiAgdmFyIEd1biA9IHJlcXVpcmUoJy4uL2d1bicpO1xufVxuXG52YXIgdTtcblxuR3VuLmNoYWluLm5vdCA9IGZ1bmN0aW9uKGNiLCBvcHQsIHQpe1xuXHRyZXR1cm4gdGhpcy5nZXQob3VnaHQsIHtub3Q6IGNifSk7XG59XG5cbmZ1bmN0aW9uIG91Z2h0KGF0LCBldil7IGV2Lm9mZigpO1xuXHRpZihhdC5lcnIgfHwgKHUgIT09IGF0LnB1dCkpeyByZXR1cm4gfVxuXHRpZighdGhpcy5ub3QpeyByZXR1cm4gfVxuXHR0aGlzLm5vdC5jYWxsKGF0Lmd1biwgYXQuZ2V0LCBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyhcIlBsZWFzZSByZXBvcnQgdGhpcyBidWcgb24gaHR0cHM6Ly9naXR0ZXIuaW0vYW1hcmsvZ3VuIGFuZCBpbiB0aGUgaXNzdWVzLlwiKTsgbmVlZC50by5pbXBsZW1lbnQ7IH0pO1xufSIsInZhciBHdW4gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIik/IHdpbmRvdy5HdW4gOiByZXF1aXJlKCcuLi9ndW4nKTtcblxuR3VuLmNoYWluLm9wZW4gPSBmdW5jdGlvbihjYiwgb3B0LCBhdCwgZGVwdGgpeyAvLyB0aGlzIGlzIGEgcmVjdXJzaXZlIGZ1bmN0aW9uLCBCRVdBUkUhXG5cdGRlcHRoID0gZGVwdGggfHwgMTtcblx0b3B0ID0gb3B0IHx8IHt9OyAvLyBpbml0IHRvcCBsZXZlbCBvcHRpb25zLlxuXHRvcHQuZG9jID0gb3B0LmRvYyB8fCB7fTtcblx0b3B0LmlkcyA9IG9wdC5pZHMgfHwge307XG5cdG9wdC5hbnkgPSBvcHQuYW55IHx8IGNiO1xuXHRvcHQubWV0YSA9IG9wdC5tZXRhIHx8IGZhbHNlO1xuXHRvcHQuZXZlID0gb3B0LmV2ZSB8fCB7b2ZmOiBmdW5jdGlvbigpeyAvLyBjb2xsZWN0IGFsbCByZWN1cnNpdmUgZXZlbnRzIHRvIHVuc3Vic2NyaWJlIHRvIGlmIG5lZWRlZC5cblx0XHRPYmplY3Qua2V5cyhvcHQuZXZlLnMpLmZvckVhY2goZnVuY3Rpb24oaSxlKXsgLy8gc3dpdGNoIHRvIENQVSBzY2hlZHVsZWQgc2V0VGltZW91dC5lYWNoP1xuXHRcdFx0aWYoZSA9IG9wdC5ldmUuc1tpXSl7IGUub2ZmKCkgfVxuXHRcdH0pO1xuXHRcdG9wdC5ldmUucyA9IHt9O1xuXHR9LCBzOnt9fVxuXHRyZXR1cm4gdGhpcy5vbihmdW5jdGlvbihkYXRhLCBrZXksIGN0eCwgZXZlKXsgLy8gc3Vic2NyaWJlIHRvIDEgZGVlcGVyIG9mIGRhdGEhXG5cdFx0Y2xlYXJUaW1lb3V0KG9wdC50byk7IC8vIGRvIG5vdCB0cmlnZ2VyIGNhbGxiYWNrIGlmIGJ1bmNoIG9mIGNoYW5nZXMuLi5cblx0XHRvcHQudG8gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IC8vIGJ1dCBzY2hlZHVsZSB0aGUgY2FsbGJhY2sgdG8gZmlyZSBzb29uIVxuXHRcdFx0aWYoIW9wdC5hbnkpeyByZXR1cm4gfVxuXHRcdFx0b3B0LmFueS5jYWxsKG9wdC5hdC4kLCBvcHQuZG9jLCBvcHQua2V5LCBvcHQsIG9wdC5ldmUpOyAvLyBjYWxsIGl0LlxuXHRcdFx0aWYob3B0Lm9mZil7IC8vIGNoZWNrIGZvciB1bnN1YnNjcmliaW5nLlxuXHRcdFx0XHRvcHQuZXZlLm9mZigpO1xuXHRcdFx0XHRvcHQuYW55ID0gbnVsbDtcblx0XHRcdH1cblx0XHR9LCBvcHQud2FpdCB8fCA5KTtcblx0XHRvcHQuYXQgPSBvcHQuYXQgfHwgY3R4OyAvLyBvcHQuYXQgd2lsbCBhbHdheXMgYmUgdGhlIGZpcnN0IGNvbnRleHQgaXQgZmluZHMuXG5cdFx0b3B0LmtleSA9IG9wdC5rZXkgfHwga2V5O1xuXHRcdG9wdC5ldmUuc1t0aGlzLl8uaWRdID0gZXZlOyAvLyBjb2xsZWN0IGFsbCB0aGUgZXZlbnRzIHRvZ2V0aGVyLlxuXHRcdGlmKHRydWUgPT09IEd1bi52YWxpZChkYXRhKSl7IC8vIGlmIHByaW1pdGl2ZSB2YWx1ZS4uLlxuXHRcdFx0aWYoIWF0KXtcblx0XHRcdFx0b3B0LmRvYyA9IGRhdGE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhdFtrZXldID0gZGF0YTtcblx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIHRtcCA9IHRoaXM7IC8vIGVsc2UgaWYgYSBzdWItb2JqZWN0LCBDUFUgc2NoZWR1bGUgbG9vcCBvdmVyIHByb3BlcnRpZXMgdG8gZG8gcmVjdXJzaW9uLlxuXHRcdHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhkYXRhKSwgZnVuY3Rpb24oa2V5LCB2YWwpe1xuXHRcdFx0aWYoJ18nID09PSBrZXkgJiYgIW9wdC5tZXRhKXsgcmV0dXJuIH1cblx0XHRcdHZhbCA9IGRhdGFba2V5XTtcblx0XHRcdHZhciBkb2MgPSBhdCB8fCBvcHQuZG9jLCBpZDsgLy8gZmlyc3QgcGFzcyB0aGlzIGJlY29tZXMgdGhlIHJvb3Qgb2Ygb3BlbiwgdGhlbiBhdCBpcyBwYXNzZWQgYmVsb3csIGFuZCB3aWxsIGJlIHRoZSBwYXJlbnQgZm9yIGVhY2ggc3ViLWRvY3VtZW50L29iamVjdC5cblx0XHRcdGlmKCFkb2MpeyByZXR1cm4gfSAvLyBpZiBubyBcInBhcmVudFwiXG5cdFx0XHRpZignc3RyaW5nJyAhPT0gdHlwZW9mIChpZCA9IEd1bi52YWxpZCh2YWwpKSl7IC8vIGlmIHByaW1pdGl2ZS4uLlxuXHRcdFx0XHRkb2Nba2V5XSA9IHZhbDtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYob3B0Lmlkc1tpZF0peyAvLyBpZiB3ZSd2ZSBhbHJlYWR5IHNlZW4gdGhpcyBzdWItb2JqZWN0L2RvY3VtZW50XG5cdFx0XHRcdGRvY1trZXldID0gb3B0Lmlkc1tpZF07IC8vIGxpbmsgdG8gaXRzZWxmLCBvdXIgYWxyZWFkeSBpbi1tZW1vcnkgb25lLCBub3QgYSBuZXcgY29weS5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYob3B0LmRlcHRoIDw9IGRlcHRoKXsgLy8gc3RvcCByZWN1cnNpdmUgb3BlbiBhdCBtYXggZGVwdGguXG5cdFx0XHRcdGRvY1trZXldID0gZG9jW2tleV0gfHwgdmFsOyAvLyBzaG93IGxpbmsgc28gYXBwIGNhbiBsb2FkIGl0IGlmIG5lZWQuXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH0gLy8gbm93IG9wZW4gdXAgdGhlIHJlY3Vyc2lvbiBvZiBzdWItZG9jdW1lbnRzIVxuXHRcdFx0dG1wLmdldChrZXkpLm9wZW4ob3B0LmFueSwgb3B0LCBvcHQuaWRzW2lkXSA9IGRvY1trZXldID0ge30sIGRlcHRoKzEpOyAvLyAzcmQgcGFyYW0gaXMgbm93IHdoZXJlIHdlIGFyZSBcImF0XCIuXG5cdFx0fSk7XG5cdH0pXG59IiwiOyhmdW5jdGlvbigpe1xuXG5cdGZ1bmN0aW9uIFJhZGlzayhvcHQpe1xuXG5cdFx0b3B0ID0gb3B0IHx8IHt9O1xuXHRcdG9wdC5sb2cgPSBvcHQubG9nIHx8IGNvbnNvbGUubG9nO1xuXHRcdG9wdC5maWxlID0gU3RyaW5nKG9wdC5maWxlIHx8ICdyYWRhdGEnKTtcblx0XHR2YXIgaGFzID0gKFJhZGlzay5oYXMgfHwgKFJhZGlzay5oYXMgPSB7fSkpW29wdC5maWxlXTtcblx0XHRpZihoYXMpeyByZXR1cm4gaGFzIH1cblxuXHRcdG9wdC5tYXggPSBvcHQubWF4IHx8IChvcHQubWVtb3J5PyAob3B0Lm1lbW9yeSAqIDk5OSAqIDk5OSkgOiAzMDAwMDAwMDApICogMC4zO1xuXHRcdG9wdC51bnRpbCA9IG9wdC51bnRpbCB8fCBvcHQud2FpdCB8fCAyNTA7XG5cdFx0b3B0LmJhdGNoID0gb3B0LmJhdGNoIHx8ICgxMCAqIDEwMDApO1xuXHRcdG9wdC5jaHVuayA9IG9wdC5jaHVuayB8fCAoMTAyNCAqIDEwMjQgKiAxKTsgLy8gMU1CXG5cdFx0b3B0LmNvZGUgPSBvcHQuY29kZSB8fCB7fTtcblx0XHRvcHQuY29kZS5mcm9tID0gb3B0LmNvZGUuZnJvbSB8fCAnISc7XG5cdFx0b3B0Lmpzb25pZnkgPSB0cnVlO1xuXG5cblx0XHRmdW5jdGlvbiBlbmFtZSh0KXsgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh0KS5yZXBsYWNlKC9cXCovZywgJyUyQScpIH0gLy8gVE9ETzogSGFzaCB0aGlzIGFsc28sIGJ1dCBhbGxvdyBtaWdyYXRpb24hXG5cdFx0ZnVuY3Rpb24gYXRvbWljKHYpeyByZXR1cm4gdSAhPT0gdiAmJiAoIXYgfHwgJ29iamVjdCcgIT0gdHlwZW9mIHYpIH1cblx0XHR2YXIgdGltZWRpYXRlID0gKCcnK3UgPT09IHR5cGVvZiBzZXRJbW1lZGlhdGUpPyBzZXRUaW1lb3V0IDogc2V0SW1tZWRpYXRlO1xuXHRcdHZhciBwdWZmID0gc2V0VGltZW91dC50dXJuIHx8IHRpbWVkaWF0ZSwgdTtcblx0XHR2YXIgbWFwID0gUmFkaXgub2JqZWN0O1xuXHRcdHZhciBTVCA9IDA7XG5cblx0XHRpZighb3B0LnN0b3JlKXtcblx0XHRcdHJldHVybiBvcHQubG9nKFwiRVJST1I6IFJhZGlzayBuZWVkcyBgb3B0LnN0b3JlYCBpbnRlcmZhY2Ugd2l0aCBge2dldDogZm4sIHB1dDogZm4gKCwgbGlzdDogZm4pfWAhXCIpO1xuXHRcdH1cblx0XHRpZighb3B0LnN0b3JlLnB1dCl7XG5cdFx0XHRyZXR1cm4gb3B0LmxvZyhcIkVSUk9SOiBSYWRpc2sgbmVlZHMgYHN0b3JlLnB1dGAgaW50ZXJmYWNlIHdpdGggYChmaWxlLCBkYXRhLCBjYilgIVwiKTtcblx0XHR9XG5cdFx0aWYoIW9wdC5zdG9yZS5nZXQpe1xuXHRcdFx0cmV0dXJuIG9wdC5sb2coXCJFUlJPUjogUmFkaXNrIG5lZWRzIGBzdG9yZS5nZXRgIGludGVyZmFjZSB3aXRoIGAoZmlsZSwgY2IpYCFcIik7XG5cdFx0fVxuXHRcdGlmKCFvcHQuc3RvcmUubGlzdCl7XG5cdFx0XHQvL29wdC5sb2coXCJXQVJOSU5HOiBgc3RvcmUubGlzdGAgaW50ZXJmYWNlIG1pZ2h0IGJlIG5lZWRlZCFcIik7XG5cdFx0fVxuXG5cdFx0aWYoJycrdSAhPSB0eXBlb2YgcmVxdWlyZSl7IHJlcXVpcmUoJy4veXNvbicpIH1cblx0XHR2YXIgcGFyc2UgPSBKU09OLnBhcnNlQXN5bmMgfHwgZnVuY3Rpb24odCxjYixyKXsgdmFyIHU7IHRyeXsgY2IodSwgSlNPTi5wYXJzZSh0LHIpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxuXHRcdHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnlBc3luYyB8fCBmdW5jdGlvbih2LGNiLHIscyl7IHZhciB1OyB0cnl7IGNiKHUsIEpTT04uc3RyaW5naWZ5KHYscixzKSkgfWNhdGNoKGUpeyBjYihlKSB9IH1cblx0XHQvKlxuXHRcdFx0QW55IGFuZCBhbGwgc3RvcmFnZSBhZGFwdGVycyBzaG91bGQuLi5cblx0XHRcdDEuIEJlY2F1c2Ugd3JpdGluZyB0byBkaXNrIHRha2VzIHRpbWUsIHdlIHNob3VsZCBiYXRjaCBkYXRhIHRvIGRpc2suIFRoaXMgaW1wcm92ZXMgcGVyZm9ybWFuY2UsIGFuZCByZWR1Y2VzIHBvdGVudGlhbCBkaXNrIGNvcnJ1cHRpb24uXG5cdFx0XHQyLiBJZiBhIGJhdGNoIGV4Y2VlZHMgYSBjZXJ0YWluIG51bWJlciBvZiB3cml0ZXMsIHdlIHNob3VsZCBpbW1lZGlhdGVseSB3cml0ZSB0byBkaXNrIHdoZW4gcGh5c2ljYWxseSBwb3NzaWJsZS4gVGhpcyBjYXBzIHRvdGFsIHBlcmZvcm1hbmNlLCBidXQgcmVkdWNlcyBwb3RlbnRpYWwgbG9zcy5cblx0XHQqL1xuXHRcdHZhciByID0gZnVuY3Rpb24oa2V5LCBkYXRhLCBjYiwgdGFnLCBEQkcpe1xuXHRcdFx0aWYoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGRhdGEpe1xuXHRcdFx0XHR2YXIgbyA9IGNiIHx8IHt9O1xuXHRcdFx0XHRjYiA9IGRhdGE7XG5cdFx0XHRcdHIucmVhZChrZXksIGNiLCBvLCBEQkcgfHwgdGFnKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Ly92YXIgdG1wID0gKHRtcCA9IHIuYmF0Y2ggPSByLmJhdGNoIHx8IHt9KVtrZXldID0gdG1wW2tleV0gfHwge307XG5cdFx0XHQvL3ZhciB0bXAgPSAodG1wID0gci5iYXRjaCA9IHIuYmF0Y2ggfHwge30pW2tleV0gPSBkYXRhO1xuXHRcdFx0ci5zYXZlKGtleSwgZGF0YSwgY2IsIHRhZywgREJHKTtcblx0XHR9XG5cdFx0ci5zYXZlID0gZnVuY3Rpb24oa2V5LCBkYXRhLCBjYiwgdGFnLCBEQkcpe1xuXHRcdFx0dmFyIHMgPSB7a2V5OiBrZXl9LCB0YWdzLCBmLCBkLCBxO1xuXHRcdFx0cy5maW5kID0gZnVuY3Rpb24oZmlsZSl7IHZhciB0bXA7XG5cdFx0XHRcdHMuZmlsZSA9IGZpbGUgfHwgKGZpbGUgPSBvcHQuY29kZS5mcm9tKTtcblx0XHRcdFx0REJHICYmIChEQkcgPSBEQkdbZmlsZV0gPSBEQkdbZmlsZV0gfHwge30pO1xuXHRcdFx0XHREQkcgJiYgKERCRy5zZiA9IERCRy5zZiB8fCArbmV3IERhdGUpO1xuXHRcdFx0XHQvL2NvbnNvbGUub25seS5pICYmIGNvbnNvbGUubG9nKCdmb3VuZCcsIGZpbGUpO1xuXHRcdFx0XHRpZih0bXAgPSByLmRpc2tbZmlsZV0peyBzLm1peCh1LCB0bXApOyByZXR1cm4gfVxuXHRcdFx0XHRyLnBhcnNlKGZpbGUsIHMubWl4LCB1LCBEQkcpO1xuXHRcdFx0fVxuXHRcdFx0cy5taXggPSBmdW5jdGlvbihlcnIsIGRpc2spe1xuXHRcdFx0XHREQkcgJiYgKERCRy5zbWwgPSArbmV3IERhdGUpO1xuXHRcdFx0XHREQkcgJiYgKERCRy5zbSA9IERCRy5zbSB8fCArbmV3IERhdGUpO1xuXHRcdFx0XHRpZihzLmVyciA9IGVyciB8fCBzLmVycil7IGNiKGVycik7IHJldHVybiB9IC8vIFRPRE86IEhBTkRMRSBCQVRDSCBFTUlUXG5cdFx0XHRcdHZhciBmaWxlID0gcy5maWxlID0gKGRpc2t8fCcnKS5maWxlIHx8IHMuZmlsZSwgdG1wO1xuXHRcdFx0XHRpZighZGlzayAmJiBmaWxlICE9PSBvcHQuY29kZS5mcm9tKXsgLy8gY29ycnVwdCBmaWxlP1xuXHRcdFx0XHRcdHIuZmluZC5iYWQoZmlsZSk7IC8vIHJlbW92ZSBmcm9tIGRpciBsaXN0XG5cdFx0XHRcdFx0ci5zYXZlKGtleSwgZGF0YSwgY2IsIHRhZyk7IC8vIHRyeSBhZ2FpblxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHQoZGlzayA9IHIuZGlza1tmaWxlXSB8fCAoci5kaXNrW2ZpbGVdID0gZGlzayB8fCBSYWRpeCgpKSkuZmlsZSB8fCAoZGlzay5maWxlID0gZmlsZSk7XG5cdFx0XHRcdGlmKG9wdC5jb21wYXJlKXtcblx0XHRcdFx0XHRkYXRhID0gb3B0LmNvbXBhcmUoZGlzayhrZXkpLCBkYXRhLCBrZXksIGZpbGUpO1xuXHRcdFx0XHRcdGlmKHUgPT09IGRhdGEpeyBjYihlcnIsIC0xKTsgcmV0dXJuIH0gLy8gVE9ETzogSEFORExFIEJBVENIIEVNSVRcblx0XHRcdFx0fVxuXHRcdFx0XHQocy5kaXNrID0gZGlzaykoa2V5LCBkYXRhKTtcblx0XHRcdFx0aWYodGFnKXtcblx0XHRcdFx0XHQodG1wID0gKHRtcCA9IGRpc2sudGFncyB8fCAoZGlzay50YWdzID0ge30pKVt0YWddIHx8ICh0bXBbdGFnXSA9IHIudGFnc1t0YWddIHx8IChyLnRhZ3NbdGFnXSA9IHt9KSkpW2ZpbGVdIHx8ICh0bXBbZmlsZV0gPSByLm9uZVt0YWddIHx8IChyLm9uZVt0YWddID0gY2IpKTtcblx0XHRcdFx0XHRjYiA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdFx0REJHICYmIChEQkcuc3QgPSBEQkcuc3QgfHwgK25ldyBEYXRlKTtcblx0XHRcdFx0Ly9jb25zb2xlLm9ubHkuaSAmJiBjb25zb2xlLmxvZygnbWl4JywgZGlzay5RKTtcblx0XHRcdFx0aWYoZGlzay5RKXsgY2IgJiYgZGlzay5RLnB1c2goY2IpOyByZXR1cm4gfSBkaXNrLlEgPSAoY2I/IFtjYl0gOiBbXSk7XG5cdFx0XHRcdGRpc2sudG8gPSBzZXRUaW1lb3V0KHMud3JpdGUsIG9wdC51bnRpbCk7XG5cdFx0XHR9XG5cdFx0XHRzLndyaXRlID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0REJHICYmIChEQkcuc3RvID0gREJHLnN0byB8fCArbmV3IERhdGUpO1xuXHRcdFx0XHR2YXIgZmlsZSA9IGYgPSBzLmZpbGUsIGRpc2sgPSBkID0gcy5kaXNrO1xuXHRcdFx0XHRxID0gcy5xID0gZGlzay5RO1xuXHRcdFx0XHR0YWdzID0gcy50YWdzID0gZGlzay50YWdzO1xuXHRcdFx0XHRkZWxldGUgZGlzay5RO1xuXHRcdFx0XHRkZWxldGUgci5kaXNrW2ZpbGVdO1xuXHRcdFx0XHRkZWxldGUgZGlzay50YWdzO1xuXHRcdFx0XHQvL2NvbnNvbGUub25seS5pICYmIGNvbnNvbGUubG9nKCd3cml0ZScsIGZpbGUsIGRpc2ssICd3YXMgc2F2aW5nOicsIGtleSwgZGF0YSk7XG5cdFx0XHRcdHIud3JpdGUoZmlsZSwgZGlzaywgcy5hY2ssIHUsIERCRyk7XG5cdFx0XHR9XG5cdFx0XHRzLmFjayA9IGZ1bmN0aW9uKGVyciwgb2spe1xuXHRcdFx0XHREQkcgJiYgKERCRy5zYSA9IERCRy5zYSB8fCArbmV3IERhdGUpO1xuXHRcdFx0XHREQkcgJiYgKERCRy5zYWwgPSBxLmxlbmd0aCk7XG5cdFx0XHRcdHZhciBhY2ssIHRtcDtcblx0XHRcdFx0Ly8gVE9ETyEhISEgQ0hBTkdFIFRISVMgSU5UTyBQVUZGISEhISEhISEhISEhISEhIVxuXHRcdFx0XHRmb3IodmFyIGlkIGluIHIudGFncyl7XG5cdFx0XHRcdFx0aWYoIXIudGFncy5oYXNPd25Qcm9wZXJ0eShpZCkpeyBjb250aW51ZSB9IHZhciB0YWcgPSByLnRhZ3NbaWRdO1xuXHRcdFx0XHRcdGlmKCh0bXAgPSByLmRpc2tbZl0pICYmICh0bXAgPSB0bXAudGFncykgJiYgdG1wW3RhZ10peyBjb250aW51ZSB9XG5cdFx0XHRcdFx0YWNrID0gdGFnW2ZdO1xuXHRcdFx0XHRcdGRlbGV0ZSB0YWdbZl07XG5cdFx0XHRcdFx0dmFyIG5lOyBmb3IodmFyIGsgaW4gdGFnKXsgaWYodGFnLmhhc093blByb3BlcnR5KGspKXsgbmUgPSB0cnVlOyBicmVhayB9IH0gLy8gaXMgbm90IGVtcHR5P1xuXHRcdFx0XHRcdGlmKG5lKXsgY29udGludWUgfSAvL2lmKCFvYmpfZW1wdHkodGFnKSl7IGNvbnRpbnVlIH1cblx0XHRcdFx0XHRkZWxldGUgci50YWdzW3RhZ107XG5cdFx0XHRcdFx0YWNrICYmIGFjayhlcnIsIG9rKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQhcSAmJiAocSA9ICcnKTtcblx0XHRcdFx0dmFyIGwgPSBxLmxlbmd0aCwgaSA9IDA7XG5cdFx0XHRcdC8vIFRPRE86IFBFUkY6IFdoeSBpcyBhY2tzIHNvIHNsb3csIHdoYXQgd29yayBkbyB0aGV5IGRvPz8/IENIRUNLIFRISVMhIVxuXHRcdFx0XHQvLyBUT0RPOiBQRVJGOiBXaHkgaXMgYWNrcyBzbyBzbG93LCB3aGF0IHdvcmsgZG8gdGhleSBkbz8/PyBDSEVDSyBUSElTISFcblx0XHRcdFx0Ly8gVE9ETzogUEVSRjogV2h5IGlzIGFja3Mgc28gc2xvdywgd2hhdCB3b3JrIGRvIHRoZXkgZG8/Pz8gQ0hFQ0sgVEhJUyEhXG5cdFx0XHRcdC8vIFRPRE86IFBFUkY6IFdoeSBpcyBhY2tzIHNvIHNsb3csIHdoYXQgd29yayBkbyB0aGV5IGRvPz8/IENIRUNLIFRISVMhIVxuXHRcdFx0XHQvLyBUT0RPOiBQRVJGOiBXaHkgaXMgYWNrcyBzbyBzbG93LCB3aGF0IHdvcmsgZG8gdGhleSBkbz8/PyBDSEVDSyBUSElTISFcblx0XHRcdFx0Ly8gVE9ETzogUEVSRjogV2h5IGlzIGFja3Mgc28gc2xvdywgd2hhdCB3b3JrIGRvIHRoZXkgZG8/Pz8gQ0hFQ0sgVEhJUyEhXG5cdFx0XHRcdC8vIFRPRE86IFBFUkY6IFdoeSBpcyBhY2tzIHNvIHNsb3csIHdoYXQgd29yayBkbyB0aGV5IGRvPz8/IENIRUNLIFRISVMhIVxuXHRcdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0Zm9yKDtpIDwgbDsgaSsrKXsgKGFjayA9IHFbaV0pICYmIGFjayhlcnIsIG9rKSB9XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3JhZCBhY2tzJywgZW5hbWUocy5maWxlKSk7XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgcS5sZW5ndGgsICdyYWQgYWNrcyAjJywgZW5hbWUocy5maWxlKSk7XG5cdFx0XHR9XG5cdFx0XHRjYiB8fCAoY2IgPSBmdW5jdGlvbihlcnIsIG9rKXsgLy8gdGVzdCBkZWxldGUhXG5cdFx0XHRcdGlmKCFlcnIpeyByZXR1cm4gfVxuXHRcdFx0fSk7XG5cdFx0XHQvL2NvbnNvbGUub25seS5pICYmIGNvbnNvbGUubG9nKCdzYXZlJywga2V5KTtcblx0XHRcdHIuZmluZChrZXksIHMuZmluZCk7XG4gICAgfVxuICAgIHIuZGlzayA9IHt9O1xuICAgIHIub25lID0ge307XG4gICAgci50YWdzID0ge307XG5cblx0XHQvKlxuXHRcdFx0QW55IHN0b3JhZ2UgZW5naW5lIGF0IHNvbWUgcG9pbnQgd2lsbCBoYXZlIHRvIGRvIGEgcmVhZCBpbiBvcmRlciB0byB3cml0ZS5cblx0XHRcdFRoaXMgaXMgdHJ1ZSBvZiBldmVuIHN5c3RlbXMgdGhhdCB1c2UgYW4gYXBwZW5kIG9ubHkgbG9nLCBpZiB0aGV5IHN1cHBvcnQgdXBkYXRlcy5cblx0XHRcdFRoZXJlZm9yZSBpdCBpcyB1bmF2b2lkYWJsZSB0aGF0IGEgcmVhZCB3aWxsIGhhdmUgdG8gaGFwcGVuLFxuXHRcdFx0dGhlIHF1ZXN0aW9uIGlzIGp1c3QgaG93IGxvbmcgeW91IGRlbGF5IGl0LlxuXHRcdCovXG5cdFx0dmFyIFJXQyA9IDA7XG5cdFx0ci53cml0ZSA9IGZ1bmN0aW9uKGZpbGUsIHJhZCwgY2IsIG8sIERCRyl7XG5cdFx0XHRpZighcmFkKXsgY2IoJ05vIHJhZGl4IScpOyByZXR1cm4gfVxuXHRcdFx0byA9ICgnb2JqZWN0JyA9PSB0eXBlb2Ygbyk/IG8gOiB7Zm9yY2U6IG99O1xuXHRcdFx0dmFyIGYgPSBmdW5jdGlvbiBGcmFjdGFsKCl7fSwgYSwgYjtcblx0XHRcdGYudGV4dCA9ICcnO1xuXHRcdFx0Zi5maWxlID0gZmlsZSA9IHJhZC5maWxlIHx8IChyYWQuZmlsZSA9IGZpbGUpO1xuXHRcdFx0aWYoIWZpbGUpeyBjYignV2hhdCBmaWxlPycpOyByZXR1cm4gfVxuXHRcdFx0Zi53cml0ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciB0ZXh0ID0gcmFkLnJhdyA9IGYudGV4dDtcblx0XHRcdFx0ci5kaXNrW2ZpbGUgPSByYWQuZmlsZSB8fCBmLmZpbGUgfHwgZmlsZV0gPSByYWQ7XG5cdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHREQkcgJiYgKERCRy53ZCA9IFMpO1xuXHRcdFx0XHQvL2NvbnNvbGUub25seS5pICYmIGNvbnNvbGUubG9nKCdhZGQnLCBmaWxlKTtcblx0XHRcdFx0ci5maW5kLmFkZChmaWxlLCBmdW5jdGlvbiBhZGQoZXJyKXtcblx0XHRcdFx0XHREQkcgJiYgKERCRy53YSA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRcdFx0aWYoZXJyKXsgY2IoZXJyKTsgcmV0dXJuIH1cblx0XHRcdFx0XHQvL2NvbnNvbGUub25seS5pICYmIGNvbnNvbGUubG9nKCdkaXNrJywgZmlsZSwgdGV4dCk7XG5cdFx0XHRcdFx0b3B0LnN0b3JlLnB1dChlbmFtZShmaWxlKSwgdGV4dCwgZnVuY3Rpb24gc2FmZShlcnIsIG9rKXtcblx0XHRcdFx0XHRcdERCRyAmJiAoREJHLndwID0gK25ldyBEYXRlKTtcblx0XHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgU1QgPSArbmV3IERhdGUgLSBTLCBcIndyb3RlIGRpc2tcIiwgSlNPTi5zdHJpbmdpZnkoZmlsZSksICsrUldDLCAndG90YWwgYWxsIHdyaXRlcy4nKTtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5vbmx5LmkgJiYgY29uc29sZS5sb2coJ2RvbmUnLCBlcnIsIG9rIHx8IDEsIGNiKTtcblx0XHRcdFx0XHRcdGNiKGVyciwgb2sgfHwgMSk7XG5cdFx0XHRcdFx0XHRpZighcmFkLlEpeyBkZWxldGUgci5kaXNrW2ZpbGVdIH0gLy8gVkVSWSBJTVBPUlRBTlQhIENsZWFuIHVwIG1lbW9yeSwgYnV0IG5vdCBpZiB0aGVyZSBpcyBhbHJlYWR5IHF1ZXVlZCB3cml0ZXMgb24gaXQhXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Zi5zcGxpdCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHREQkcgJiYgKERCRy53ZiA9IFMpO1xuXHRcdFx0XHRmLnRleHQgPSAnJztcblx0XHRcdFx0aWYoIWYuY291bnQpeyBmLmNvdW50ID0gMDtcblx0XHRcdFx0XHRSYWRpeC5tYXAocmFkLCBmdW5jdGlvbiBjb3VudCgpeyBmLmNvdW50KysgfSk7IC8vIFRPRE86IFBlcmY/IEFueSBmYXN0ZXIgd2F5IHRvIGdldCB0b3RhbCBsZW5ndGg/XG5cdFx0XHRcdH1cblx0XHRcdFx0REJHICYmIChEQkcud2ZjID0gZi5jb3VudCk7XG5cdFx0XHRcdGYubGltaXQgPSBNYXRoLmNlaWwoZi5jb3VudC8yKTtcblx0XHRcdFx0dmFyIFNDID0gZi5jb3VudDtcblx0XHRcdFx0Zi5jb3VudCA9IDA7XG5cdFx0XHRcdERCRyAmJiAoREJHLndmMSA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRcdGYuc3ViID0gUmFkaXgoKTtcblx0XHRcdFx0UmFkaXgubWFwKHJhZCwgZi5zbGljZSwge3JldmVyc2U6IDF9KTsgLy8gSU1QT1JUQU5UOiBETyBUSElTIElOIFJFVkVSU0UsIFNPIExBU1QgSEFMRiBPRiBEQVRBIE1PVkVEIFRPIE5FVyBGSUxFIEJFRk9SRSBEUk9QUElORyBGUk9NIENVUlJFTlQgRklMRS5cblx0XHRcdFx0REJHICYmIChEQkcud2YyID0gK25ldyBEYXRlKTtcblx0XHRcdFx0ci53cml0ZShmLmVuZCwgZi5zdWIsIGYuYm90aCwgbyk7XG5cdFx0XHRcdERCRyAmJiAoREJHLndmMyA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRcdGYuaHViID0gUmFkaXgoKTtcblx0XHRcdFx0UmFkaXgubWFwKHJhZCwgZi5zdG9wKTtcblx0XHRcdFx0REJHICYmIChEQkcud2Y0ID0gK25ldyBEYXRlKTtcblx0XHRcdFx0ci53cml0ZShyYWQuZmlsZSwgZi5odWIsIGYuYm90aCwgbyk7XG5cdFx0XHRcdERCRyAmJiAoREJHLndmNSA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgXCJyYWQgc3BsaXRcIiwgZW5hbWUocmFkLmZpbGUpLCBTQyk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0Zi5zbGljZSA9IGZ1bmN0aW9uKHZhbCwga2V5KXtcblx0XHRcdFx0Zi5zdWIoZi5lbmQgPSBrZXksIHZhbCk7XG5cdFx0XHRcdGlmKGYubGltaXQgPD0gKCsrZi5jb3VudCkpeyByZXR1cm4gdHJ1ZSB9XG5cdFx0XHR9XG5cdFx0XHRmLnN0b3AgPSBmdW5jdGlvbih2YWwsIGtleSl7XG5cdFx0XHRcdGlmKGtleSA+PSBmLmVuZCl7IHJldHVybiB0cnVlIH1cblx0XHRcdFx0Zi5odWIoa2V5LCB2YWwpO1xuXHRcdFx0fVxuXHRcdFx0Zi5ib3RoID0gZnVuY3Rpb24oZXJyLCBvayl7XG5cdFx0XHRcdERCRyAmJiAoREJHLndmZCA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRcdGlmKGIpeyBjYihlcnIgfHwgYik7IHJldHVybiB9XG5cdFx0XHRcdGlmKGEpeyBjYihlcnIsIG9rKTsgcmV0dXJuIH1cblx0XHRcdFx0YSA9IHRydWU7XG5cdFx0XHRcdGIgPSBlcnI7XG5cdFx0XHR9XG5cdFx0XHRmLmVhY2ggPSBmdW5jdGlvbih2YWwsIGtleSwgaywgcHJlKXtcblx0XHRcdFx0aWYodSAhPT0gdmFsKXsgZi5jb3VudCsrIH1cblx0XHRcdFx0aWYob3B0Lm1heCA8PSAodmFsfHwnJykubGVuZ3RoKXsgcmV0dXJuIGNiKFwiRGF0YSB0b28gYmlnIVwiKSwgdHJ1ZSB9XG5cdFx0XHRcdHZhciBlbmMgPSBSYWRpc2suZW5jb2RlKHByZS5sZW5ndGgpICsnIycrIFJhZGlzay5lbmNvZGUoaykgKyAodSA9PT0gdmFsPyAnJyA6ICc6JysgUmFkaXNrLmVuY29kZSh2YWwpKSArJ1xcbic7XG5cdFx0XHRcdGlmKChvcHQuY2h1bmsgPCBmLnRleHQubGVuZ3RoICsgZW5jLmxlbmd0aCkgJiYgKDEgPCBmLmNvdW50KSAmJiAhby5mb3JjZSl7XG5cdFx0XHRcdFx0cmV0dXJuIGYuc3BsaXQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmLnRleHQgKz0gZW5jO1xuXHRcdFx0fVxuXHRcdFx0Ly9jb25zb2xlLm9ubHkuaSAmJiBjb25zb2xlLmxvZygnd3JpdGluZycpO1xuXHRcdFx0aWYob3B0Lmpzb25pZnkpeyByLndyaXRlLmpzb25pZnkoZiwgcmFkLCBjYiwgbywgREJHKTsgcmV0dXJuIH0gLy8gdGVtcG9yYXJ5IHRlc3RpbmcgaWRlYVxuXHRcdFx0aWYoIVJhZGl4Lm1hcChyYWQsIGYuZWFjaCwgdHJ1ZSkpeyBmLndyaXRlKCkgfVxuXHRcdH1cblxuXHRcdHIud3JpdGUuanNvbmlmeSA9IGZ1bmN0aW9uKGYsIHJhZCwgY2IsIG8sIERCRyl7XG5cdFx0XHR2YXIgcmF3O1xuXHRcdFx0dmFyIFMgPSArbmV3IERhdGU7XG5cdFx0XHREQkcgJiYgKERCRy53ID0gUyk7XG5cdFx0XHR0cnl7cmF3ID0gSlNPTi5zdHJpbmdpZnkocmFkLiQpO1xuXHRcdFx0fWNhdGNoKGUpeyBjYihcIkNhbm5vdCByYWRpc2shXCIpOyByZXR1cm4gfVxuXHRcdFx0REJHICYmIChEQkcud3MgPSArbmV3IERhdGUpO1xuXHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCBcInJhZCBzdHJpbmdpZmllZCBKU09OXCIpO1xuXHRcdFx0aWYob3B0LmNodW5rIDwgcmF3Lmxlbmd0aCAmJiAhby5mb3JjZSl7XG5cdFx0XHRcdHZhciBjID0gMDtcblx0XHRcdFx0UmFkaXgubWFwKHJhZCwgZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRpZihjKyspeyByZXR1cm4gdHJ1ZSB9IC8vIG1vcmUgdGhhbiAxIGl0ZW1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmKGMgPiAxKXtcblx0XHRcdFx0XHRyZXR1cm4gZi5zcGxpdCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmLnRleHQgPSByYXc7XG5cdFx0XHRmLndyaXRlKCk7XG5cdFx0fVxuXG5cdFx0ci5yYW5nZSA9IGZ1bmN0aW9uKHRyZWUsIG8pe1xuXHRcdFx0aWYoIXRyZWUgfHwgIW8peyByZXR1cm4gfVxuXHRcdFx0aWYodSA9PT0gby5zdGFydCAmJiB1ID09PSBvLmVuZCl7IHJldHVybiB0cmVlIH1cblx0XHRcdGlmKGF0b21pYyh0cmVlKSl7IHJldHVybiB0cmVlIH1cblx0XHRcdHZhciBzdWIgPSBSYWRpeCgpO1xuXHRcdFx0UmFkaXgubWFwKHRyZWUsIGZ1bmN0aW9uKHYsayl7IHN1YihrLHYpIH0sIG8pOyAvLyBPTkxZIFBMQUNFIFRIQVQgVEFLRVMgVFJFRSwgbWF5YmUgcmVkdWNlIEFQSSBmb3IgYmV0dGVyIHBlcmY/XG5cdFx0XHRyZXR1cm4gc3ViKCcnKTtcblx0XHR9XG5cblx0XHQ7KGZ1bmN0aW9uKCl7XG5cdFx0XHRyLnJlYWQgPSBmdW5jdGlvbihrZXksIGNiLCBvLCBEQkcpe1xuXHRcdFx0XHRvID0gbyB8fCB7fTtcblx0XHRcdFx0dmFyIGcgPSB7a2V5OiBrZXl9O1xuXHRcdFx0XHRnLmZpbmQgPSBmdW5jdGlvbihmaWxlKXsgdmFyIHRtcDtcblx0XHRcdFx0XHRnLmZpbGUgPSBmaWxlIHx8IChmaWxlID0gb3B0LmNvZGUuZnJvbSk7XG5cdFx0XHRcdFx0REJHICYmIChEQkcgPSBEQkdbZmlsZV0gPSBEQkdbZmlsZV0gfHwge30pO1xuXHRcdFx0XHRcdERCRyAmJiAoREJHLnJmID0gREJHLnJmIHx8ICtuZXcgRGF0ZSk7XG5cdFx0XHRcdFx0aWYodG1wID0gci5kaXNrW2cuZmlsZSA9IGZpbGVdKXsgZy5jaGVjayh1LCB0bXApOyByZXR1cm4gfVxuXHRcdFx0XHRcdHIucGFyc2UoZmlsZSwgZy5jaGVjaywgdSwgREJHKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRnLmdldCA9IGZ1bmN0aW9uKGVyciwgZGlzaywgaW5mbyl7XG5cdFx0XHRcdFx0REJHICYmIChEQkcucmdsID0gK25ldyBEYXRlKTtcblx0XHRcdFx0XHREQkcgJiYgKERCRy5yZyA9IERCRy5yZyB8fCArbmV3IERhdGUpO1xuXHRcdFx0XHRcdGlmKGcuZXJyID0gZXJyIHx8IGcuZXJyKXsgY2IoZXJyKTsgcmV0dXJuIH1cblx0XHRcdFx0XHR2YXIgZmlsZSA9IGcuZmlsZSA9IChkaXNrfHwnJykuZmlsZSB8fCBnLmZpbGU7XG5cdFx0XHRcdFx0aWYoIWRpc2sgJiYgZmlsZSAhPT0gb3B0LmNvZGUuZnJvbSl7IC8vIGNvcnJ1cHQgZmlsZT9cblx0XHRcdFx0XHRcdHIuZmluZC5iYWQoZmlsZSk7IC8vIHJlbW92ZSBmcm9tIGRpciBsaXN0XG5cdFx0XHRcdFx0XHRyLnJlYWQoa2V5LCBjYiwgbyk7IC8vIHRyeSBhZ2FpblxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkaXNrID0gci5kaXNrW2ZpbGVdIHx8IChyLmRpc2tbZmlsZV0gPSBkaXNrKTtcblx0XHRcdFx0XHRpZighZGlzayl7IGNiKGZpbGUgPT09IG9wdC5jb2RlLmZyb20/IHUgOiBcIk5vIGZpbGUhXCIpOyByZXR1cm4gfVxuXHRcdFx0XHRcdGRpc2suZmlsZSB8fCAoZGlzay5maWxlID0gZmlsZSk7XG5cdFx0XHRcdFx0dmFyIGRhdGEgPSByLnJhbmdlKGRpc2soa2V5KSwgbyk7XG5cdFx0XHRcdFx0REJHICYmIChEQkcucnIgPSArbmV3IERhdGUpO1xuXHRcdFx0XHRcdG8udW5pdCA9IGRpc2sudW5pdDtcblx0XHRcdFx0XHRvLmNodW5rcyA9IChvLmNodW5rcyB8fCAwKSArIDE7XG5cdFx0XHRcdFx0by5wYXJzZWQgPSAoby5wYXJzZWQgfHwgMCkgKyAoKGluZm98fCcnKS5wYXJzZWR8fChvLmNodW5rcypvcHQuY2h1bmspKTtcblx0XHRcdFx0XHRvLm1vcmUgPSAxO1xuXHRcdFx0XHRcdG8ubmV4dCA9IHU7XG5cdFx0XHRcdFx0UmFkaXgubWFwKHIubGlzdCwgZnVuY3Rpb24gbmV4dCh2LGYpe1xuXHRcdFx0XHRcdFx0aWYoIXYgfHwgZmlsZSA9PT0gZil7IHJldHVybiB9XG5cdFx0XHRcdFx0XHRvLm5leHQgPSBmO1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0fSwgby5yZXZlcnNlPyB7cmV2ZXJzZTogMSwgZW5kOiBmaWxlfSA6IHtzdGFydDogZmlsZX0pO1xuXHRcdFx0XHRcdERCRyAmJiAoREJHLnJsID0gK25ldyBEYXRlKTtcblx0XHRcdFx0XHRpZighby5uZXh0KXsgby5tb3JlID0gMCB9XG5cdFx0XHRcdFx0aWYoby5uZXh0KXtcblx0XHRcdFx0XHRcdGlmKCFvLnJldmVyc2UgJiYgKChrZXkgPCBvLm5leHQgJiYgMCAhPSBvLm5leHQuaW5kZXhPZihrZXkpKSB8fCAodSAhPT0gby5lbmQgJiYgKG8uZW5kIHx8ICdcXHVmZmZmJykgPCBvLm5leHQpKSl7IG8ubW9yZSA9IDAgfVxuXHRcdFx0XHRcdFx0aWYoby5yZXZlcnNlICYmICgoa2V5ID4gby5uZXh0ICYmIDAgIT0ga2V5LmluZGV4T2Yoby5uZXh0KSkgfHwgKCh1ICE9PSBvLnN0YXJ0ICYmIChvLnN0YXJ0IHx8ICcnKSA+IG8ubmV4dCAmJiBmaWxlIDw9IG8uc3RhcnQpKSkpeyBvLm1vcmUgPSAwIH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyg1LCBwcm9jZXNzLm1lbW9yeVVzYWdlKCkuaGVhcFVzZWQpO1xuXHRcdFx0XHRcdGlmKCFvLm1vcmUpeyBjYihnLmVyciwgZGF0YSwgbyk7IHJldHVybiB9XG5cdFx0XHRcdFx0aWYoZGF0YSl7IGNiKGcuZXJyLCBkYXRhLCBvKSB9XG5cdFx0XHRcdFx0aWYoby5wYXJzZWQgPj0gby5saW1pdCl7IHJldHVybiB9XG5cdFx0XHRcdFx0dmFyIFMgPSArbmV3IERhdGU7XG5cdFx0XHRcdFx0REJHICYmIChEQkcucm0gPSBTKTtcblx0XHRcdFx0XHR2YXIgbmV4dCA9IG8ubmV4dDtcblx0XHRcdFx0XHR0aW1lZGlhdGUoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3JhZCBtb3JlJyk7XG5cdFx0XHRcdFx0XHRyLnBhcnNlKG5leHQsIGcuY2hlY2spO1xuXHRcdFx0XHRcdH0sMCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zy5jaGVjayA9IGZ1bmN0aW9uKGVyciwgZGlzaywgaW5mbyl7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyg0LCBwcm9jZXNzLm1lbW9yeVVzYWdlKCkuaGVhcFVzZWQpO1xuXHRcdFx0XHRcdGcuZ2V0KGVyciwgZGlzaywgaW5mbyk7XG5cdFx0XHRcdFx0aWYoIWRpc2sgfHwgZGlzay5jaGVjayl7IHJldHVybiB9IGRpc2suY2hlY2sgPSAxO1xuXHRcdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHRcdChpbmZvIHx8IChpbmZvID0ge30pKS5maWxlIHx8IChpbmZvLmZpbGUgPSBnLmZpbGUpO1xuXHRcdFx0XHRcdFJhZGl4Lm1hcChkaXNrLCBmdW5jdGlvbih2YWwsIGtleSl7XG5cdFx0XHRcdFx0XHQvLyBhc3N1bWUgaW4gbWVtb3J5IGZvciBub3csIHNpbmNlIGJvdGggd3JpdGUvcmVhZCBhbHJlYWR5IGNhbGwgci5maW5kIHdoaWNoIHdpbGwgaW5pdCBpdC5cblx0XHRcdFx0XHRcdHIuZmluZChrZXksIGZ1bmN0aW9uKGZpbGUpe1xuXHRcdFx0XHRcdFx0XHRpZigoZmlsZSB8fCAoZmlsZSA9IG9wdC5jb2RlLmZyb20pKSA9PT0gaW5mby5maWxlKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRcdFx0dmFyIGlkID0gKCcnK01hdGgucmFuZG9tKCkpLnNsaWNlKC0zKTtcblx0XHRcdFx0XHRcdFx0cHVmZihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0XHRyLnNhdmUoa2V5LCB2YWwsIGZ1bmN0aW9uIGFjayhlcnIsIG9rKXtcblx0XHRcdFx0XHRcdFx0XHRpZihlcnIpeyByLnNhdmUoa2V5LCB2YWwsIGFjayk7IHJldHVybiB9IC8vIGFkIGluZmluaXR1bT8/P1xuXHRcdFx0XHRcdFx0XHRcdC8vIFRPRE86IE5PVEUhISEgTWlzbG9jYXRlZCBkYXRhIGNvdWxkIGJlIGJlY2F1c2Ugb2YgYSBzeW5jaHJvbm91cyBgcHV0YCBmcm9tIHRoZSBgZy5nZXQoYCBvdGhlciB0aGFuIHBlcmYgc2hvdWxkbid0IHdlIGRvIHRoZSBjaGVjayBmaXJzdCBiZWZvcmUgYWNraW5nP1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoXCJNSVNMT0NBVEVEIERBVEEgQ09SUkVDVEVEXCIsIGlkLCBlbmFtZShrZXkpLCBlbmFtZShpbmZvLmZpbGUpLCBlbmFtZShmaWxlKSk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9LDApO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICtuZXcgRGF0ZSAtIFMsIFwicmFkIGNoZWNrXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHIuZmluZChrZXkgfHwgKG8ucmV2ZXJzZT8gKG8uZW5kfHwnJykgOiAoby5zdGFydHx8JycpKSwgZy5maW5kKTsgXG5cdFx0XHR9XG5cdFx0XHRmdW5jdGlvbiByZXYoYSxiKXsgcmV0dXJuIGIgfVxuXHRcdFx0dmFyIHJldm8gPSB7cmV2ZXJzZTogdHJ1ZX07XG5cdFx0fSgpKTtcblxuXHRcdDsoZnVuY3Rpb24oKXtcblx0XHRcdC8qXG5cdFx0XHRcdExldCB1cyBzdGFydCBieSBhc3N1bWluZyB3ZSBhcmUgdGhlIG9ubHkgcHJvY2VzcyB0aGF0IGlzXG5cdFx0XHRcdGNoYW5naW5nIHRoZSBkaXJlY3Rvcnkgb3IgYnVja2V0LiBOb3QgYmVjYXVzZSB3ZSBkbyBub3Qgd2FudFxuXHRcdFx0XHR0byBiZSBtdWx0aS1wcm9jZXNzL21hY2hpbmUsIGJ1dCBiZWNhdXNlIHdlIHdhbnQgdG8gZXhwZXJpbWVudFxuXHRcdFx0XHR3aXRoIGhvdyBtdWNoIHBlcmZvcm1hbmNlIGFuZCBzY2FsZSB3ZSBjYW4gZ2V0IG91dCBvZiBvbmx5IG9uZS5cblx0XHRcdFx0VGhlbiB3ZSBjYW4gd29yayBvbiB0aGUgaGFyZGVyIHByb2JsZW0gb2YgYmVpbmcgbXVsdGktcHJvY2Vzcy5cblx0XHRcdCovXG5cdFx0XHR2YXIgUlBDID0gMDtcblx0XHRcdHZhciBRID0ge30sIHMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDMxKTtcblx0XHRcdHIucGFyc2UgPSBmdW5jdGlvbihmaWxlLCBjYiwgcmF3LCBEQkcpeyB2YXIgcTtcblx0XHRcdFx0aWYoIWZpbGUpeyByZXR1cm4gY2IoKTsgfVxuXHRcdFx0XHRpZihxID0gUVtmaWxlXSl7IHEucHVzaChjYik7IHJldHVybiB9IHEgPSBRW2ZpbGVdID0gW2NiXTtcblx0XHRcdFx0dmFyIHAgPSBmdW5jdGlvbiBQYXJzZSgpe30sIGluZm8gPSB7ZmlsZTogZmlsZX07XG5cdFx0XHRcdChwLmRpc2sgPSBSYWRpeCgpKS5maWxlID0gZmlsZTtcblx0XHRcdFx0cC5yZWFkID0gZnVuY3Rpb24oZXJyLCBkYXRhKXsgdmFyIHRtcDtcblx0XHRcdFx0XHREQkcgJiYgKERCRy5ycGcgPSArbmV3IERhdGUpO1xuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3JlYWQgZGlzaycsIEpTT04uc3RyaW5naWZ5KGZpbGUpLCArK1JQQywgJ3RvdGFsIGFsbCBwYXJzZXMuJyk7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygyLCBwcm9jZXNzLm1lbW9yeVVzYWdlKCkuaGVhcFVzZWQpO1xuXHRcdFx0XHRcdGlmKChwLmVyciA9IGVycikgfHwgKHAubm90ID0gIWRhdGEpKXtcblx0XHRcdFx0XHRcdGRlbGV0ZSBRW2ZpbGVdO1xuXHRcdFx0XHRcdFx0cC5tYXAocSwgcC5hY2spO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZignc3RyaW5nJyAhPT0gdHlwZW9mIGRhdGEpe1xuXHRcdFx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdFx0XHRpZihvcHQubWF4IDw9IGRhdGEubGVuZ3RoKXtcblx0XHRcdFx0XHRcdFx0XHRwLmVyciA9IFwiQ2h1bmsgdG9vIGJpZyFcIjtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhID0gZGF0YS50b1N0cmluZygpOyAvLyBJZiBpdCBjcmFzaGVzLCBpdCBjcmFzaGVzIGhlcmUuIEhvdyE/PyBXZSBjaGVjayBzaXplIGZpcnN0IVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9Y2F0Y2goZSl7IHAuZXJyID0gZSB9XG5cdFx0XHRcdFx0XHRpZihwLmVycil7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBRW2ZpbGVdO1xuXHRcdFx0XHRcdFx0XHRwLm1hcChxLCBwLmFjayk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aW5mby5wYXJzZWQgPSBkYXRhLmxlbmd0aDtcblx0XHRcdFx0XHREQkcgJiYgKERCRy5ycGwgPSBpbmZvLnBhcnNlZCk7XG5cdFx0XHRcdFx0REJHICYmIChEQkcucnBhID0gcS5sZW5ndGgpO1xuXHRcdFx0XHRcdFMgPSArbmV3IERhdGU7XG5cdFx0XHRcdFx0aWYoIShvcHQuanNvbmlmeSB8fCAneycgPT09IGRhdGFbMF0pKXtcblx0XHRcdFx0XHRcdHAucmFkZWMoZXJyLCBkYXRhKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cGFyc2UoZGF0YSwgZnVuY3Rpb24oZXJyLCB0cmVlKXtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coMywgcHJvY2Vzcy5tZW1vcnlVc2FnZSgpLmhlYXBVc2VkKTtcblx0XHRcdFx0XHRcdGlmKCFlcnIpe1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgUVtmaWxlXTtcblx0XHRcdFx0XHRcdFx0cC5kaXNrLiQgPSB0cmVlO1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgKFNUID0gK25ldyBEYXRlIC0gUykgPiA5ICYmIGNvbnNvbGUuU1RBVChTLCBTVCwgJ3JhZCBwYXJzZWQgSlNPTicpO1xuXHRcdFx0XHRcdFx0XHREQkcgJiYgKERCRy5ycGQgPSArbmV3IERhdGUpO1xuXHRcdFx0XHRcdFx0XHRwLm1hcChxLCBwLmFjayk7IC8vIGhtbW0sIHY4IHByb2ZpbGVyIGNhbid0IHNlZSBpbnRvIHRoaXMgY2F1c2Ugb2YgdHJ5L2NhdGNoP1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZigneycgPT09IGRhdGFbMF0pe1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgUVtmaWxlXTtcblx0XHRcdFx0XHRcdFx0cC5lcnIgPSB0bXAgfHwgXCJKU09OIGVycm9yIVwiO1xuXHRcdFx0XHRcdFx0XHRwLm1hcChxLCBwLmFjayk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHAucmFkZWMoZXJyLCBkYXRhKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRwLm1hcCA9IGZ1bmN0aW9uKCl7IC8vIHN3aXRjaCB0byBzZXRUaW1lb3V0LmVhY2ggbm93P1xuXHRcdFx0XHRcdGlmKCFxIHx8ICFxLmxlbmd0aCl7IHJldHVybiB9XG5cdFx0XHRcdFx0Ly92YXIgaSA9IDAsIGwgPSBxLmxlbmd0aCwgYWNrO1xuXHRcdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHRcdHZhciBlcnIgPSBwLmVyciwgZGF0YSA9IHAubm90PyB1IDogcC5kaXNrO1xuXHRcdFx0XHRcdHZhciBpID0gMCwgYWNrOyB3aGlsZShpIDwgOSAmJiAoYWNrID0gcVtpKytdKSl7IGFjayhlcnIsIGRhdGEsIGluZm8pIH0gLy8gdG9vIG11Y2g/XG5cdFx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCAncmFkIHBhY2tzJywgZW5hbWUoZmlsZSkpO1xuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgaSwgJ3JhZCBwYWNrcyAjJywgZW5hbWUoZmlsZSkpOyBcblx0XHRcdFx0XHRpZighKHEgPSBxLnNsaWNlKGkpKS5sZW5ndGgpeyByZXR1cm4gfVxuXHRcdFx0XHRcdHB1ZmYocC5tYXAsIDApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHAuYWNrID0gZnVuY3Rpb24oY2Ipe1xuXHRcdFx0XHRcdGlmKCFjYil7IHJldHVybiB9XG5cdFx0XHRcdFx0aWYocC5lcnIgfHwgcC5ub3Qpe1xuXHRcdFx0XHRcdFx0Y2IocC5lcnIsIHUsIGluZm8pO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYih1LCBwLmRpc2ssIGluZm8pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHAucmFkZWMgPSBmdW5jdGlvbihlcnIsIGRhdGEpe1xuXHRcdFx0XHRcdGRlbGV0ZSBRW2ZpbGVdO1xuXHRcdFx0XHRcdFMgPSArbmV3IERhdGU7XG5cdFx0XHRcdFx0dmFyIHRtcCA9IHAuc3BsaXQoZGF0YSksIHByZSA9IFtdLCBpLCBrLCB2O1xuXHRcdFx0XHRcdGlmKCF0bXAgfHwgMCAhPT0gdG1wWzFdKXtcblx0XHRcdFx0XHRcdHAuZXJyID0gXCJGaWxlICdcIitmaWxlK1wiJyBkb2VzIG5vdCBoYXZlIHJvb3QgcmFkaXghIFwiO1xuXHRcdFx0XHRcdFx0cC5tYXAocSwgcC5hY2spO1xuXHRcdFx0XHRcdFx0cmV0dXJuOyBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0d2hpbGUodG1wKXtcblx0XHRcdFx0XHRcdGsgPSB2ID0gdTtcblx0XHRcdFx0XHRcdGkgPSB0bXBbMV07XG5cdFx0XHRcdFx0XHR0bXAgPSBwLnNwbGl0KHRtcFsyXSl8fCcnO1xuXHRcdFx0XHRcdFx0aWYoJyMnID09IHRtcFswXSl7XG5cdFx0XHRcdFx0XHRcdGsgPSB0bXBbMV07XG5cdFx0XHRcdFx0XHRcdHByZSA9IHByZS5zbGljZSgwLGkpO1xuXHRcdFx0XHRcdFx0XHRpZihpIDw9IHByZS5sZW5ndGgpe1xuXHRcdFx0XHRcdFx0XHRcdHByZS5wdXNoKGspO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0bXAgPSBwLnNwbGl0KHRtcFsyXSl8fCcnO1xuXHRcdFx0XHRcdFx0aWYoJ1xcbicgPT0gdG1wWzBdKXsgY29udGludWUgfVxuXHRcdFx0XHRcdFx0aWYoJz0nID09IHRtcFswXSB8fCAnOicgPT0gdG1wWzBdKXsgdiA9IHRtcFsxXSB9XG5cdFx0XHRcdFx0XHRpZih1ICE9PSBrICYmIHUgIT09IHYpeyBwLmRpc2socHJlLmpvaW4oJycpLCB2KSB9XG5cdFx0XHRcdFx0XHR0bXAgPSBwLnNwbGl0KHRtcFsyXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3BhcnNlZCBSQUQnKTtcblx0XHRcdFx0XHRwLm1hcChxLCBwLmFjayk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHAuc3BsaXQgPSBmdW5jdGlvbih0KXtcblx0XHRcdFx0XHRpZighdCl7IHJldHVybiB9XG5cdFx0XHRcdFx0dmFyIGwgPSBbXSwgbyA9IHt9LCBpID0gLTEsIGEgPSAnJywgYiwgYztcblx0XHRcdFx0XHRpID0gdC5pbmRleE9mKHMpO1xuXHRcdFx0XHRcdGlmKCF0W2ldKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRhID0gdC5zbGljZSgwLCBpKTtcblx0XHRcdFx0XHRsWzBdID0gYTtcblx0XHRcdFx0XHRsWzFdID0gYiA9IFJhZGlzay5kZWNvZGUodC5zbGljZShpKSwgbyk7XG5cdFx0XHRcdFx0bFsyXSA9IHQuc2xpY2UoaSArIG8uaSk7XG5cdFx0XHRcdFx0cmV0dXJuIGw7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoci5kaXNrKXsgcmF3IHx8IChyYXcgPSAoci5kaXNrW2ZpbGVdfHwnJykucmF3KSB9XG5cdFx0XHRcdHZhciBTID0gK25ldyBEYXRlLCBTTSwgU0w7XG5cdFx0XHRcdERCRyAmJiAoREJHLnJwID0gUyk7XG5cdFx0XHRcdGlmKHJhdyl7IHJldHVybiBwdWZmKGZ1bmN0aW9uKCl7IHAucmVhZCh1LCByYXcpIH0sIDApIH1cblx0XHRcdFx0b3B0LnN0b3JlLmdldChlbmFtZShmaWxlKSwgcC5yZWFkKTtcblx0XHRcdFx0Ly8gVE9ETzogV2hhdCBpZiBtZW1vcnkgZGlzayBnZXRzIGZpbGxlZCB3aXRoIHVwZGF0ZXMsIGFuZCB3ZSBnZXQgYW4gb2xkIG9uZSBiYWNrP1xuXHRcdFx0fVxuXHRcdH0oKSk7XG5cblx0XHQ7KGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgZGlyLCBmID0gU3RyaW5nLmZyb21DaGFyQ29kZSgyOCksIFE7XG5cdFx0XHRyLmZpbmQgPSBmdW5jdGlvbihrZXksIGNiKXtcblx0XHRcdFx0aWYoIWRpcil7XG5cdFx0XHRcdFx0aWYoUSl7IFEucHVzaChba2V5LCBjYl0pOyByZXR1cm4gfSBRID0gW1trZXksIGNiXV07XG5cdFx0XHRcdFx0ci5wYXJzZShmLCBpbml0KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0UmFkaXgubWFwKHIubGlzdCA9IGRpciwgZnVuY3Rpb24odmFsLCBrZXkpe1xuXHRcdFx0XHRcdGlmKCF2YWwpeyByZXR1cm4gfVxuXHRcdFx0XHRcdHJldHVybiBjYihrZXkpIHx8IHRydWU7XG5cdFx0XHRcdH0sIHtyZXZlcnNlOiAxLCBlbmQ6IGtleX0pIHx8IGNiKG9wdC5jb2RlLmZyb20pO1xuXHRcdFx0fVxuXHRcdFx0ci5maW5kLmFkZCA9IGZ1bmN0aW9uKGZpbGUsIGNiKXtcblx0XHRcdFx0dmFyIGhhcyA9IGRpcihmaWxlKTtcblx0XHRcdFx0aWYoaGFzIHx8IGZpbGUgPT09IGYpeyBjYih1LCAxKTsgcmV0dXJuIH1cblx0XHRcdFx0ZGlyKGZpbGUsIDEpO1xuXHRcdFx0XHRjYi5mb3VuZCA9IChjYi5mb3VuZCB8fCAwKSArIDE7XG5cdFx0XHRcdHIud3JpdGUoZiwgZGlyLCBmdW5jdGlvbihlcnIsIG9rKXtcblx0XHRcdFx0XHRpZihlcnIpeyBjYihlcnIpOyByZXR1cm4gfVxuXHRcdFx0XHRcdGNiLmZvdW5kID0gKGNiLmZvdW5kIHx8IDApIC0gMTtcblx0XHRcdFx0XHRpZigwICE9PSBjYi5mb3VuZCl7IHJldHVybiB9XG5cdFx0XHRcdFx0Y2IodSwgMSk7XG5cdFx0XHRcdH0sIHRydWUpO1xuXHRcdFx0fVxuXHRcdFx0ci5maW5kLmJhZCA9IGZ1bmN0aW9uKGZpbGUsIGNiKXtcblx0XHRcdFx0ZGlyKGZpbGUsIDApO1xuXHRcdFx0XHRyLndyaXRlKGYsIGRpciwgY2J8fG5vb3ApO1xuXHRcdFx0fVxuXHRcdFx0ZnVuY3Rpb24gaW5pdChlcnIsIGRpc2spe1xuXHRcdFx0XHRpZihlcnIpe1xuXHRcdFx0XHRcdG9wdC5sb2coJ2xpc3QnLCBlcnIpO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgci5wYXJzZShmLCBpbml0KSB9LCAxMDAwKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoZGlzayl7IGRyYWluKGRpc2spOyByZXR1cm4gfVxuXHRcdFx0XHRkaXIgPSBkaXIgfHwgZGlzayB8fCBSYWRpeCgpO1xuXHRcdFx0XHRpZighb3B0LnN0b3JlLmxpc3QpeyBkcmFpbihkaXIpOyByZXR1cm4gfVxuXHRcdFx0XHQvLyBpbXBvcnQgZGlyZWN0b3J5LlxuXHRcdFx0XHRvcHQuc3RvcmUubGlzdChmdW5jdGlvbihmaWxlKXtcblx0XHRcdFx0XHRpZighZmlsZSl7IGRyYWluKGRpcik7IHJldHVybiB9XG5cdFx0XHRcdFx0ci5maW5kLmFkZChmaWxlLCBub29wKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRmdW5jdGlvbiBkcmFpbihyYWQsIHRtcCl7XG5cdFx0XHRcdGRpciA9IGRpciB8fCByYWQ7XG5cdFx0XHRcdGRpci5maWxlID0gZjtcblx0XHRcdFx0dG1wID0gUTsgUSA9IG51bGw7XG5cdFx0XHRcdG1hcCh0bXAsIGZ1bmN0aW9uKGFyZyl7XG5cdFx0XHRcdFx0ci5maW5kKGFyZ1swXSwgYXJnWzFdKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSgpKTtcblxuXHRcdHRyeXsgIUd1bi53aW5kb3cgJiYgcmVxdWlyZSgnLi9yYWRtaWd0bXAnKShyKSB9Y2F0Y2goZSl7fVxuXG5cdFx0dmFyIG5vb3AgPSBmdW5jdGlvbigpe30sIFJBRCwgdTtcblx0XHRSYWRpc2suaGFzW29wdC5maWxlXSA9IHI7XG5cdFx0cmV0dXJuIHI7XG5cdH1cblxuXHQ7KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIF8gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDMxKSwgdTtcblx0XHRSYWRpc2suZW5jb2RlID0gZnVuY3Rpb24oZCwgbywgcyl7IHMgPSBzIHx8IF87XG5cdFx0XHR2YXIgdCA9IHMsIHRtcDtcblx0XHRcdGlmKHR5cGVvZiBkID09ICdzdHJpbmcnKXtcblx0XHRcdFx0dmFyIGkgPSBkLmluZGV4T2Yocyk7XG5cdFx0XHRcdHdoaWxlKGkgIT0gLTEpeyB0ICs9IHM7IGkgPSBkLmluZGV4T2YocywgaSsxKSB9XG5cdFx0XHRcdHJldHVybiB0ICsgJ1wiJyArIGQgKyBzO1xuXHRcdFx0fSBlbHNlXG5cdFx0XHRpZihkICYmIGRbJyMnXSAmJiAxID09IE9iamVjdC5rZXlzKGQpLmxlbmd0aCl7XG5cdFx0XHRcdHJldHVybiB0ICsgJyMnICsgdG1wICsgdDtcblx0XHRcdH0gZWxzZVxuXHRcdFx0aWYoJ251bWJlcicgPT0gdHlwZW9mIGQpe1xuXHRcdFx0XHRyZXR1cm4gdCArICcrJyArIChkfHwwKSArIHQ7XG5cdFx0XHR9IGVsc2Vcblx0XHRcdGlmKG51bGwgPT09IGQpe1xuXHRcdFx0XHRyZXR1cm4gdCArICcgJyArIHQ7XG5cdFx0XHR9IGVsc2Vcblx0XHRcdGlmKHRydWUgPT09IGQpe1xuXHRcdFx0XHRyZXR1cm4gdCArICcrJyArIHQ7XG5cdFx0XHR9IGVsc2Vcblx0XHRcdGlmKGZhbHNlID09PSBkKXtcblx0XHRcdFx0cmV0dXJuIHQgKyAnLScgKyB0O1xuXHRcdFx0fS8vIGVsc2Vcblx0XHRcdC8vaWYoYmluYXJ5KXt9XG5cdFx0fVxuXHRcdFJhZGlzay5kZWNvZGUgPSBmdW5jdGlvbih0LCBvLCBzKXsgcyA9IHMgfHwgXztcblx0XHRcdHZhciBkID0gJycsIGkgPSAtMSwgbiA9IDAsIGMsIHA7XG5cdFx0XHRpZihzICE9PSB0WzBdKXsgcmV0dXJuIH1cblx0XHRcdHdoaWxlKHMgPT09IHRbKytpXSl7ICsrbiB9XG5cdFx0XHRwID0gdFtjID0gbl0gfHwgdHJ1ZTtcblx0XHRcdHdoaWxlKC0tbiA+PSAwKXsgaSA9IHQuaW5kZXhPZihzLCBpKzEpIH1cblx0XHRcdGlmKGkgPT0gLTEpeyBpID0gdC5sZW5ndGggfVxuXHRcdFx0ZCA9IHQuc2xpY2UoYysxLCBpKTtcblx0XHRcdGlmKG8peyBvLmkgPSBpKzEgfVxuXHRcdFx0aWYoJ1wiJyA9PT0gcCl7XG5cdFx0XHRcdHJldHVybiBkO1xuXHRcdFx0fSBlbHNlXG5cdFx0XHRpZignIycgPT09IHApe1xuXHRcdFx0XHRyZXR1cm4geycjJzpkfTtcblx0XHRcdH0gZWxzZVxuXHRcdFx0aWYoJysnID09PSBwKXtcblx0XHRcdFx0aWYoMCA9PT0gZC5sZW5ndGgpe1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBwYXJzZUZsb2F0KGQpO1xuXHRcdFx0fSBlbHNlXG5cdFx0XHRpZignICcgPT09IHApe1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH0gZWxzZVxuXHRcdFx0aWYoJy0nID09PSBwKXtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fSgpKTtcblxuXHRpZih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKXtcblx0ICB2YXIgR3VuID0gd2luZG93Lkd1bjtcblx0ICB2YXIgUmFkaXggPSB3aW5kb3cuUmFkaXg7XG5cdCAgd2luZG93LlJhZGlzayA9IFJhZGlzaztcblx0fSBlbHNlIHsgXG5cdCAgdmFyIEd1biA9IHJlcXVpcmUoJy4uL2d1bicpO1xuXHRcdHZhciBSYWRpeCA9IHJlcXVpcmUoJy4vcmFkaXgnKTtcblx0XHQvL3ZhciBSYWRpeCA9IHJlcXVpcmUoJy4vcmFkaXgyJyk7IFJhZGlzayA9IHJlcXVpcmUoJy4vcmFkaXNrMicpO1xuXHRcdHRyeXsgbW9kdWxlLmV4cG9ydHMgPSBSYWRpc2sgfWNhdGNoKGUpe31cblx0fVxuXG5cdFJhZGlzay5SYWRpeCA9IFJhZGl4O1xuXG59KCkpOyIsIjsoZnVuY3Rpb24oKXtcblxuXHRmdW5jdGlvbiBSYWRpeCgpe1xuXHRcdHZhciByYWRpeCA9IGZ1bmN0aW9uKGtleSwgdmFsLCB0KXtcblx0XHRcdHJhZGl4LnVuaXQgPSAwO1xuXHRcdFx0aWYoIXQgJiYgdSAhPT0gdmFsKXsgXG5cdFx0XHRcdHJhZGl4Lmxhc3QgPSAoJycra2V5IDwgcmFkaXgubGFzdCk/IHJhZGl4Lmxhc3QgOiAnJytrZXk7XG5cdFx0XHRcdGRlbGV0ZSAocmFkaXguJHx8e30pW19dO1xuXHRcdFx0fVxuXHRcdFx0dCA9IHQgfHwgcmFkaXguJCB8fCAocmFkaXguJCA9IHt9KTtcblx0XHRcdGlmKCFrZXkgJiYgT2JqZWN0LmtleXModCkubGVuZ3RoKXsgcmV0dXJuIHQgfVxuXHRcdFx0a2V5ID0gJycra2V5O1xuXHRcdFx0dmFyIGkgPSAwLCBsID0ga2V5Lmxlbmd0aC0xLCBrID0ga2V5W2ldLCBhdCwgdG1wO1xuXHRcdFx0d2hpbGUoIShhdCA9IHRba10pICYmIGkgPCBsKXtcblx0XHRcdFx0ayArPSBrZXlbKytpXTtcblx0XHRcdH1cblx0XHRcdGlmKCFhdCl7XG5cdFx0XHRcdGlmKCFlYWNoKHQsIGZ1bmN0aW9uKHIsIHMpe1xuXHRcdFx0XHRcdHZhciBpaSA9IDAsIGtrID0gJyc7XG5cdFx0XHRcdFx0aWYoKHN8fCcnKS5sZW5ndGgpeyB3aGlsZShzW2lpXSA9PSBrZXlbaWldKXtcblx0XHRcdFx0XHRcdGtrICs9IHNbaWkrK107XG5cdFx0XHRcdFx0fSB9XG5cdFx0XHRcdFx0aWYoa2spe1xuXHRcdFx0XHRcdFx0aWYodSA9PT0gdmFsKXtcblx0XHRcdFx0XHRcdFx0aWYoaWkgPD0gbCl7IHJldHVybiB9XG5cdFx0XHRcdFx0XHRcdCh0bXAgfHwgKHRtcCA9IHt9KSlbcy5zbGljZShpaSldID0gcjtcblx0XHRcdFx0XHRcdFx0Ly8odG1wW19dID0gZnVuY3Rpb24gJCgpeyAkLnNvcnQgPSBPYmplY3Qua2V5cyh0bXApLnNvcnQoKTsgcmV0dXJuICQgfSgpKTsgLy8gZ2V0IHJpZCBvZiB0aGlzIG9uZSwgY2F1c2UgaXQgaXMgb24gcmVhZD9cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR2YXIgX18gPSB7fTtcblx0XHRcdFx0XHRcdF9fW3Muc2xpY2UoaWkpXSA9IHI7XG5cdFx0XHRcdFx0XHRpaSA9IGtleS5zbGljZShpaSk7XG5cdFx0XHRcdFx0XHQoJycgPT09IGlpKT8gKF9fWycnXSA9IHZhbCkgOiAoKF9fW2lpXSA9IHt9KVsnJ10gPSB2YWwpO1xuXHRcdFx0XHRcdFx0Ly8oX19bX10gPSBmdW5jdGlvbiAkKCl7ICQuc29ydCA9IE9iamVjdC5rZXlzKF9fKS5zb3J0KCk7IHJldHVybiAkIH0oKSk7XG5cdFx0XHRcdFx0XHR0W2trXSA9IF9fO1xuXHRcdFx0XHRcdFx0aWYoUmFkaXguZGVidWcgJiYgJ3VuZGVmaW5lZCcgPT09ICcnK2trKXsgY29uc29sZS5sb2coMCwga2spOyBkZWJ1Z2dlciB9XG5cdFx0XHRcdFx0XHRkZWxldGUgdFtzXTtcblx0XHRcdFx0XHRcdC8vKHRbX10gPSBmdW5jdGlvbiAkKCl7ICQuc29ydCA9IE9iamVjdC5rZXlzKHQpLnNvcnQoKTsgcmV0dXJuICQgfSgpKTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkpe1xuXHRcdFx0XHRcdGlmKHUgPT09IHZhbCl7IHJldHVybjsgfVxuXHRcdFx0XHRcdCh0W2tdIHx8ICh0W2tdID0ge30pKVsnJ10gPSB2YWw7XG5cdFx0XHRcdFx0aWYoUmFkaXguZGVidWcgJiYgJ3VuZGVmaW5lZCcgPT09ICcnK2speyBjb25zb2xlLmxvZygxLCBrKTsgZGVidWdnZXIgfVxuXHRcdFx0XHRcdC8vKHRbX10gPSBmdW5jdGlvbiAkKCl7ICQuc29ydCA9IE9iamVjdC5rZXlzKHQpLnNvcnQoKTsgcmV0dXJuICQgfSgpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZih1ID09PSB2YWwpe1xuXHRcdFx0XHRcdHJldHVybiB0bXA7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBcblx0XHRcdGlmKGkgPT0gbCl7XG5cdFx0XHRcdC8vaWYodSA9PT0gdmFsKXsgcmV0dXJuICh1ID09PSAodG1wID0gYXRbJyddKSk/IGF0IDogdG1wIH0gLy8gVEhJUyBDT0RFIElTIENPUlJFQ1QsIGJlbG93IGlzXG5cdFx0XHRcdGlmKHUgPT09IHZhbCl7IHJldHVybiAodSA9PT0gKHRtcCA9IGF0WycnXSkpPyBhdCA6ICgocmFkaXgudW5pdCA9IDEpICYmIHRtcCkgfSAvLyB0ZW1wb3JhcnkgaGVscD8/XG5cdFx0XHRcdGF0WycnXSA9IHZhbDtcblx0XHRcdFx0Ly8oYXRbX10gPSBmdW5jdGlvbiAkKCl7ICQuc29ydCA9IE9iamVjdC5rZXlzKGF0KS5zb3J0KCk7IHJldHVybiAkIH0oKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZih1ICE9PSB2YWwpeyBkZWxldGUgYXRbX10gfVxuXHRcdFx0XHQvL2F0ICYmIChhdFtfXSA9IGZ1bmN0aW9uICQoKXsgJC5zb3J0ID0gT2JqZWN0LmtleXMoYXQpLnNvcnQoKTsgcmV0dXJuICQgfSgpKTtcblx0XHRcdFx0cmV0dXJuIHJhZGl4KGtleS5zbGljZSgrK2kpLCB2YWwsIGF0IHx8IChhdCA9IHt9KSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByYWRpeDtcblx0fTtcblxuXHRSYWRpeC5tYXAgPSBmdW5jdGlvbiByYXAocmFkaXgsIGNiLCBvcHQsIHByZSl7IHByZSA9IHByZSB8fCBbXTsgLy8gVE9ETzogQlVHOiBtb3N0IG91dC1vZi1tZW1vcnkgY3Jhc2hlcyBjb21lIGZyb20gaGVyZS5cblx0XHR2YXIgdCA9ICgnZnVuY3Rpb24nID09IHR5cGVvZiByYWRpeCk/IHJhZGl4LiQgfHwge30gOiByYWRpeDtcblx0XHQvLyFvcHQgJiYgY29uc29sZS5sb2coXCJXSEFUIElTIFQ/XCIsIEpTT04uc3RyaW5naWZ5KHQpLmxlbmd0aCk7XG5cdFx0aWYoIXQpeyByZXR1cm4gfVxuXHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiB0KXsgaWYoUmFkaXguZGVidWcpeyB0aHJvdyBbJ0JVRzonLCByYWRpeCwgY2IsIG9wdCwgcHJlXSB9IHJldHVybjsgfVxuXHRcdHZhciBrZXlzID0gKHRbX118fG5vKS5zb3J0IHx8ICh0W19dID0gZnVuY3Rpb24gJCgpeyAkLnNvcnQgPSBPYmplY3Qua2V5cyh0KS5zb3J0KCk7IHJldHVybiAkIH0oKSkuc29ydCwgcmV2OyAvLyBPTkxZIDE3JSBvZiBvcHMgYXJlIHByZS1zb3J0ZWQhXG5cdFx0Ly92YXIga2V5cyA9IE9iamVjdC5rZXlzKHQpLnNvcnQoKTtcblx0XHRvcHQgPSAodHJ1ZSA9PT0gb3B0KT8ge2JyYW5jaDogdHJ1ZX0gOiAob3B0IHx8IHt9KTtcblx0XHRpZihyZXYgPSBvcHQucmV2ZXJzZSl7IGtleXMgPSBrZXlzLnNsaWNlKDApLnJldmVyc2UoKSB9XG5cdFx0dmFyIHN0YXJ0ID0gb3B0LnN0YXJ0LCBlbmQgPSBvcHQuZW5kLCBFTkQgPSAnXFx1ZmZmZic7XG5cdFx0dmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7XG5cdFx0Zm9yKDtpIDwgbDsgaSsrKXsgdmFyIGtleSA9IGtleXNbaV0sIHRyZWUgPSB0W2tleV0sIHRtcCwgcCwgcHQ7XG5cdFx0XHRpZighdHJlZSB8fCAnJyA9PT0ga2V5IHx8IF8gPT09IGtleSB8fCAndW5kZWZpbmVkJyA9PT0ga2V5KXsgY29udGludWUgfVxuXHRcdFx0cCA9IHByZS5zbGljZSgwKTsgcC5wdXNoKGtleSk7XG5cdFx0XHRwdCA9IHAuam9pbignJyk7XG5cdFx0XHRpZih1ICE9PSBzdGFydCAmJiBwdCA8IChzdGFydHx8JycpLnNsaWNlKDAscHQubGVuZ3RoKSl7IGNvbnRpbnVlIH1cblx0XHRcdGlmKHUgIT09IGVuZCAmJiAoZW5kIHx8IEVORCkgPCBwdCl7IGNvbnRpbnVlIH1cblx0XHRcdGlmKHJldil7IC8vIGNoaWxkcmVuIG11c3QgYmUgY2hlY2tlZCBmaXJzdCB3aGVuIGdvaW5nIGluIHJldmVyc2UuXG5cdFx0XHRcdHRtcCA9IHJhcCh0cmVlLCBjYiwgb3B0LCBwKTtcblx0XHRcdFx0aWYodSAhPT0gdG1wKXsgcmV0dXJuIHRtcCB9XG5cdFx0XHR9XG5cdFx0XHRpZih1ICE9PSAodG1wID0gdHJlZVsnJ10pKXtcblx0XHRcdFx0dmFyIHllcyA9IDE7XG5cdFx0XHRcdGlmKHUgIT09IHN0YXJ0ICYmIHB0IDwgKHN0YXJ0fHwnJykpeyB5ZXMgPSAwIH1cblx0XHRcdFx0aWYodSAhPT0gZW5kICYmIHB0ID4gKGVuZCB8fCBFTkQpKXsgeWVzID0gMCB9XG5cdFx0XHRcdGlmKHllcyl7XG5cdFx0XHRcdFx0dG1wID0gY2IodG1wLCBwdCwga2V5LCBwcmUpO1xuXHRcdFx0XHRcdGlmKHUgIT09IHRtcCl7IHJldHVybiB0bXAgfVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Vcblx0XHRcdGlmKG9wdC5icmFuY2gpe1xuXHRcdFx0XHR0bXAgPSBjYih1LCBwdCwga2V5LCBwcmUpO1xuXHRcdFx0XHRpZih1ICE9PSB0bXApeyByZXR1cm4gdG1wIH1cblx0XHRcdH1cblx0XHRcdHByZSA9IHA7XG5cdFx0XHRpZighcmV2KXtcblx0XHRcdFx0dG1wID0gcmFwKHRyZWUsIGNiLCBvcHQsIHByZSk7XG5cdFx0XHRcdGlmKHUgIT09IHRtcCl7IHJldHVybiB0bXAgfVxuXHRcdFx0fVxuXHRcdFx0cHJlLnBvcCgpO1xuXHRcdH1cblx0fTtcblxuXHRpZih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKXtcblx0ICB3aW5kb3cuUmFkaXggPSBSYWRpeDtcblx0fSBlbHNlIHsgXG5cdFx0dHJ5eyBtb2R1bGUuZXhwb3J0cyA9IFJhZGl4IH1jYXRjaChlKXt9XG5cdH1cblx0dmFyIGVhY2ggPSBSYWRpeC5vYmplY3QgPSBmdW5jdGlvbihvLCBmLCByKXtcblx0XHRmb3IodmFyIGsgaW4gbyl7XG5cdFx0XHRpZighby5oYXNPd25Qcm9wZXJ0eShrKSl7IGNvbnRpbnVlIH1cblx0XHRcdGlmKChyID0gZihvW2tdLCBrKSkgIT09IHUpeyByZXR1cm4gciB9XG5cdFx0fVxuXHR9LCBubyA9IHt9LCB1O1xuXHR2YXIgXyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMjQpO1xuXHRcbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHIpe1xuXHR2YXIgUmFkaXggPSByZXF1aXJlKCcuL3JhZGl4Jyk7XG5cdHIuZmluZCgnYScsIGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGwgPSBbXTtcblx0XHRSYWRpeC5tYXAoci5saXN0LCBmdW5jdGlvbih2LGYpe1xuXHRcdFx0aWYoIShmLmluZGV4T2YoJyUxQicpICsgMSkpeyByZXR1cm4gfVxuXHRcdFx0aWYoIXYpeyByZXR1cm4gfVxuXHRcdFx0bC5wdXNoKFtmLHZdKTtcblx0XHR9KTtcblx0XHRpZihsLmxlbmd0aCl7XG5cdFx0XHRjb25zb2xlLmxvZyhcIlxcbiEgISAhIFdBUk5JTkcgISAhICFcXG5SQUQgdjAuMjAyMC54IGhhcyBkZXRlY3RlZCBPTEQgdjAuMjAxOS54IGRhdGEgJiBhdXRvbWF0aWNhbGx5IG1pZ3JhdGluZy4gQXV0b21hdGljIG1pZ3JhdGlvbiB3aWxsIGJlIHR1cm5lZCBPRkYgaW4gZnV0dXJlIHZlcnNpb25zISBJZiB5b3UgYXJlIGp1c3QgZGV2ZWxvcGluZy90ZXN0aW5nLCB3ZSByZWNvbW1lbmQgeW91IHJlc2V0IHlvdXIgZGF0YS4gUGxlYXNlIGNvbnRhY3QgdXMgaWYgeW91IGhhdmUgYW55IGNvbmNlcm5zLlxcblRoaXMgbWVzc2FnZSBzaG91bGQgb25seSBsb2cgb25jZS5cIilcblx0XHR9XG5cdFx0dmFyIGYsIHY7XG5cdFx0bC5mb3JFYWNoKGZ1bmN0aW9uKGEpe1xuXHRcdFx0ZiA9IGFbMF07IHYgPSBhWzFdO1xuXHRcdFx0ci5saXN0KGRlY29kZVVSSUNvbXBvbmVudChmKSwgdik7XG5cdFx0XHRyLmxpc3QoZiwgMCk7XG5cdFx0fSk7XG5cdFx0aWYoIWYpeyByZXR1cm4gfVxuXHRcdHIuZmluZC5iYWQoZik7XG5cdH0pXG59OyIsImZ1bmN0aW9uIFN0b3JlKG9wdCl7XG5cdG9wdCA9IG9wdCB8fCB7fTtcblx0b3B0LmxvZyA9IG9wdC5sb2cgfHwgY29uc29sZS5sb2c7XG5cdG9wdC5maWxlID0gU3RyaW5nKG9wdC5maWxlIHx8ICdyYWRhdGEnKTtcblx0dmFyIGZzID0gcmVxdWlyZSgnZnMnKSwgdTtcblxuXHR2YXIgc3RvcmUgPSBmdW5jdGlvbiBTdG9yZSgpe307XG5cdGlmKFN0b3JlW29wdC5maWxlXSl7XG5cdFx0Y29uc29sZS5sb2coXCJXYXJuaW5nOiByZXVzaW5nIHNhbWUgZnMgc3RvcmUgYW5kIG9wdGlvbnMgYXMgMXN0LlwiKTtcblx0XHRyZXR1cm4gU3RvcmVbb3B0LmZpbGVdO1xuXHR9XG5cdFN0b3JlW29wdC5maWxlXSA9IHN0b3JlO1xuXHR2YXIgcHV0cyA9IHt9O1xuXG5cdC8vIFRPRE8hISEgQUREIFpMSUIgSU5GTEFURSAvIERFRkxBVEUgQ09NUFJFU1NJT04hXG5cdHN0b3JlLnB1dCA9IGZ1bmN0aW9uKGZpbGUsIGRhdGEsIGNiKXtcblx0XHR2YXIgcmFuZG9tID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoLTMpO1xuXHRcdHB1dHNbZmlsZV0gPSB7aWQ6IHJhbmRvbSwgZGF0YTogZGF0YX07XG5cdFx0dmFyIHRtcCA9IG9wdC5maWxlKyctJytmaWxlKyctJytyYW5kb20rJy50bXAnO1xuXHRcdGZzLndyaXRlRmlsZSh0bXAsIGRhdGEsIGZ1bmN0aW9uKGVyciwgb2spe1xuXHRcdFx0aWYoZXJyKXtcblx0XHRcdFx0aWYocmFuZG9tID09PSAocHV0c1tmaWxlXXx8JycpLmlkKXsgZGVsZXRlIHB1dHNbZmlsZV0gfVxuXHRcdFx0XHRyZXR1cm4gY2IoZXJyKTtcblx0XHRcdH1cblx0XHRcdG1vdmUodG1wLCBvcHQuZmlsZSsnLycrZmlsZSwgZnVuY3Rpb24oZXJyLCBvayl7XG5cdFx0XHRcdGlmKHJhbmRvbSA9PT0gKHB1dHNbZmlsZV18fCcnKS5pZCl7IGRlbGV0ZSBwdXRzW2ZpbGVdIH1cblx0XHRcdFx0Y2IoZXJyLCBvayB8fCAhZXJyKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXHRzdG9yZS5nZXQgPSBmdW5jdGlvbihmaWxlLCBjYil7IHZhciB0bXA7IC8vIHRoaXMgdG9vayAzcys/XG5cdFx0aWYodG1wID0gcHV0c1tmaWxlXSl7IGNiKHUsIHRtcC5kYXRhKTsgcmV0dXJuIH1cblx0XHRmcy5yZWFkRmlsZShvcHQuZmlsZSsnLycrZmlsZSwgZnVuY3Rpb24oZXJyLCBkYXRhKXtcblx0XHRcdGlmKGVycil7XG5cdFx0XHRcdGlmKCdFTk9FTlQnID09PSAoZXJyLmNvZGV8fCcnKS50b1VwcGVyQ2FzZSgpKXtcblx0XHRcdFx0XHRyZXR1cm4gY2IoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvcHQubG9nKFwiRVJST1I6XCIsIGVycik7XG5cdFx0XHR9XG5cdFx0XHRjYihlcnIsIGRhdGEpO1xuXHRcdH0pO1xuXHR9O1xuXG5cdGlmKCFmcy5leGlzdHNTeW5jKG9wdC5maWxlKSl7IGZzLm1rZGlyU3luYyhvcHQuZmlsZSkgfVxuXG5cdGZ1bmN0aW9uIG1vdmUob2xkUGF0aCwgbmV3UGF0aCwgY2IpIHtcblx0XHRmcy5yZW5hbWUob2xkUGF0aCwgbmV3UGF0aCwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRpZiAoZXJyLmNvZGUgPT09ICdFWERFVicpIHtcblx0XHRcdFx0XHR2YXIgcmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0ob2xkUGF0aCk7XG5cdFx0XHRcdFx0dmFyIHdyaXRlU3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0obmV3UGF0aCk7XG5cblx0XHRcdFx0XHRyZWFkU3RyZWFtLm9uKCdlcnJvcicsIGNiKTtcblx0XHRcdFx0XHR3cml0ZVN0cmVhbS5vbignZXJyb3InLCBjYik7XG5cblx0XHRcdFx0XHRyZWFkU3RyZWFtLm9uKCdjbG9zZScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGZzLnVubGluayhvbGRQYXRoLCBjYik7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRyZWFkU3RyZWFtLnBpcGUod3JpdGVTdHJlYW0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNiKGVycik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNiKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0c3RvcmUubGlzdCA9IGZ1bmN0aW9uKGNiLCBtYXRjaCwgcGFyYW1zLCBjYnMpe1xuXHRcdHZhciBkaXIgPSBmcy5yZWFkZGlyU3luYyhvcHQuZmlsZSk7XG5cdFx0ZGlyLmZvckVhY2goZnVuY3Rpb24oZmlsZSl7XG5cdFx0XHRjYihmaWxlKTtcblx0XHR9KVxuXHRcdGNiKCk7XG5cdH07XG5cdFxuXHRyZXR1cm4gc3RvcmU7XG59XG5cbnZhciBHdW4gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIik/IHdpbmRvdy5HdW4gOiByZXF1aXJlKCcuLi9ndW4nKTtcbkd1bi5vbignY3JlYXRlJywgZnVuY3Rpb24ocm9vdCl7XG5cdHRoaXMudG8ubmV4dChyb290KTtcblx0dmFyIG9wdCA9IHJvb3Qub3B0O1xuXHRpZihvcHQucmZzID09PSBmYWxzZSl7IHJldHVybiB9XG5cdG9wdC5zdG9yZSA9IG9wdC5zdG9yZSB8fCAoIUd1bi53aW5kb3cgJiYgU3RvcmUob3B0KSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yZTsiLCI7KGZ1bmN0aW9uKCl7XG4vKiAvLyBmcm9tIEBqYWJpc1xuaWYgKG5hdmlnYXRvci5zdG9yYWdlICYmIG5hdmlnYXRvci5zdG9yYWdlLmVzdGltYXRlKSB7XG4gIGNvbnN0IHF1b3RhID0gYXdhaXQgbmF2aWdhdG9yLnN0b3JhZ2UuZXN0aW1hdGUoKTtcbiAgLy8gcXVvdGEudXNhZ2UgLT4gTnVtYmVyIG9mIGJ5dGVzIHVzZWQuXG4gIC8vIHF1b3RhLnF1b3RhIC0+IE1heGltdW0gbnVtYmVyIG9mIGJ5dGVzIGF2YWlsYWJsZS5cbiAgY29uc3QgcGVyY2VudGFnZVVzZWQgPSAocXVvdGEudXNhZ2UgLyBxdW90YS5xdW90YSkgKiAxMDA7XG4gIGNvbnNvbGUubG9nKGBZb3UndmUgdXNlZCAke3BlcmNlbnRhZ2VVc2VkfSUgb2YgdGhlIGF2YWlsYWJsZSBzdG9yYWdlLmApO1xuICBjb25zdCByZW1haW5pbmcgPSBxdW90YS5xdW90YSAtIHF1b3RhLnVzYWdlO1xuICBjb25zb2xlLmxvZyhgWW91IGNhbiB3cml0ZSB1cCB0byAke3JlbWFpbmluZ30gbW9yZSBieXRlcy5gKTtcbn1cbiovXG4gIGZ1bmN0aW9uIFN0b3JlKG9wdCl7XG4gICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgIG9wdC5maWxlID0gU3RyaW5nKG9wdC5maWxlIHx8ICdyYWRhdGEnKTtcbiAgICB2YXIgc3RvcmUgPSBTdG9yZVtvcHQuZmlsZV0sIGRiID0gbnVsbCwgdTtcblxuICAgIGlmKHN0b3JlKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiV2FybmluZzogcmV1c2luZyBzYW1lIEluZGV4ZWREQiBzdG9yZSBhbmQgb3B0aW9ucyBhcyAxc3QuXCIpO1xuICAgICAgcmV0dXJuIFN0b3JlW29wdC5maWxlXTtcbiAgICB9XG4gICAgc3RvcmUgPSBTdG9yZVtvcHQuZmlsZV0gPSBmdW5jdGlvbigpe307XG5cbiAgICB0cnl7b3B0LmluZGV4ZWREQiA9IG9wdC5pbmRleGVkREIgfHwgU3RvcmUuaW5kZXhlZERCIHx8IGluZGV4ZWREQn1jYXRjaChlKXt9XG4gICAgdHJ5e2lmKCFvcHQuaW5kZXhlZERCIHx8ICdmaWxlOicgPT0gbG9jYXRpb24ucHJvdG9jb2wpe1xuICAgICAgdmFyIHMgPSBzdG9yZS5kIHx8IChzdG9yZS5kID0ge30pO1xuICAgICAgc3RvcmUucHV0ID0gZnVuY3Rpb24oZiwgZCwgY2IpeyBzW2ZdID0gZDsgc2V0VGltZW91dChmdW5jdGlvbigpeyBjYihudWxsLCAxKSB9LDI1MCkgfTtcbiAgICAgIHN0b3JlLmdldCA9IGZ1bmN0aW9uKGYsIGNiKXsgc2V0VGltZW91dChmdW5jdGlvbigpeyBjYihudWxsLCBzW2ZdIHx8IHUpIH0sNSkgfTtcbiAgICAgIGNvbnNvbGUubG9nKCdXYXJuaW5nOiBObyBpbmRleGVkREIgZXhpc3RzIHRvIHBlcnNpc3QgZGF0YSB0byEnKTtcbiAgICAgIHJldHVybiBzdG9yZTtcbiAgICB9fWNhdGNoKGUpe31cbiAgICBcblxuICAgIHN0b3JlLnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBvID0gaW5kZXhlZERCLm9wZW4ob3B0LmZpbGUsIDEpO1xuICAgICAgby5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbihldmUpeyAoZXZlLnRhcmdldC5yZXN1bHQpLmNyZWF0ZU9iamVjdFN0b3JlKG9wdC5maWxlKSB9XG4gICAgICBvLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCl7IGRiID0gby5yZXN1bHQgfVxuICAgICAgby5vbmVycm9yID0gZnVuY3Rpb24oZXZlKXsgY29uc29sZS5sb2coZXZlfHwxKTsgfVxuICAgIH07IHN0b3JlLnN0YXJ0KCk7XG5cbiAgICBzdG9yZS5wdXQgPSBmdW5jdGlvbihrZXksIGRhdGEsIGNiKXtcbiAgICAgIGlmKCFkYil7IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgc3RvcmUucHV0KGtleSwgZGF0YSwgY2IpIH0sMSk7IHJldHVybiB9XG4gICAgICB2YXIgdHggPSBkYi50cmFuc2FjdGlvbihbb3B0LmZpbGVdLCAncmVhZHdyaXRlJyk7XG4gICAgICB2YXIgb2JqID0gdHgub2JqZWN0U3RvcmUob3B0LmZpbGUpO1xuICAgICAgdmFyIHJlcSA9IG9iai5wdXQoZGF0YSwgJycra2V5KTtcbiAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBvYmoub25zdWNjZXNzID0gdHgub25zdWNjZXNzID0gZnVuY3Rpb24oKXsgY2IobnVsbCwgMSkgfVxuICAgICAgcmVxLm9uYWJvcnQgPSBvYmoub25hYm9ydCA9IHR4Lm9uYWJvcnQgPSBmdW5jdGlvbihldmUpeyBjYihldmV8fCdwdXQudHguYWJvcnQnKSB9XG4gICAgICByZXEub25lcnJvciA9IG9iai5vbmVycm9yID0gdHgub25lcnJvciA9IGZ1bmN0aW9uKGV2ZSl7IGNiKGV2ZXx8J3B1dC50eC5lcnJvcicpIH1cbiAgICB9XG5cbiAgICBzdG9yZS5nZXQgPSBmdW5jdGlvbihrZXksIGNiKXtcbiAgICAgIGlmKCFkYil7IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgc3RvcmUuZ2V0KGtleSwgY2IpIH0sOSk7IHJldHVybiB9XG4gICAgICB2YXIgdHggPSBkYi50cmFuc2FjdGlvbihbb3B0LmZpbGVdLCAncmVhZG9ubHknKTtcbiAgICAgIHZhciBvYmogPSB0eC5vYmplY3RTdG9yZShvcHQuZmlsZSk7XG4gICAgICB2YXIgcmVxID0gb2JqLmdldCgnJytrZXkpO1xuICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCl7IGNiKG51bGwsIHJlcS5yZXN1bHQpIH1cbiAgICAgIHJlcS5vbmFib3J0ID0gZnVuY3Rpb24oZXZlKXsgY2IoZXZlfHw0KSB9XG4gICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uKGV2ZSl7IGNiKGV2ZXx8NSkgfVxuICAgIH1cbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpeyBkYiAmJiBkYi5jbG9zZSgpOyBkYiA9IG51bGw7IHN0b3JlLnN0YXJ0KCkgfSwgMTAwMCAqIDE1KTsgLy8gcmVzZXQgd2Via2l0IGJ1Zz9cbiAgICByZXR1cm4gc3RvcmU7XG4gIH1cblxuICBpZih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAoU3RvcmUud2luZG93ID0gd2luZG93KS5SaW5kZXhlZERCID0gU3RvcmU7XG4gICAgU3RvcmUuaW5kZXhlZERCID0gd2luZG93LmluZGV4ZWREQjsgLy8gc2FmYXJpIGJ1Z1xuICB9IGVsc2Uge1xuICAgIHRyeXsgbW9kdWxlLmV4cG9ydHMgPSBTdG9yZSB9Y2F0Y2goZSl7fVxuICB9XG5cbiAgdHJ5e1xuICAgIHZhciBHdW4gPSBTdG9yZS53aW5kb3cuR3VuIHx8IHJlcXVpcmUoJy4uL2d1bicpO1xuICAgIEd1bi5vbignY3JlYXRlJywgZnVuY3Rpb24ocm9vdCl7XG4gICAgICB0aGlzLnRvLm5leHQocm9vdCk7XG4gICAgICByb290Lm9wdC5zdG9yZSA9IHJvb3Qub3B0LnN0b3JlIHx8IFN0b3JlKHJvb3Qub3B0KTtcbiAgICB9KTtcbiAgfWNhdGNoKGUpe31cblxufSgpKTsiLCJ2YXIgR3VuID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpPyB3aW5kb3cuR3VuIDogcmVxdWlyZSgnLi4vZ3VuJyk7XG5cbkd1bi5vbignY3JlYXRlJywgZnVuY3Rpb24ocm9vdCl7XG4gICAgaWYoR3VuLlRFU1RJTkcpeyByb290Lm9wdC5maWxlID0gJ3JhZGF0YXRlc3QnIH1cbiAgICB0aGlzLnRvLm5leHQocm9vdCk7XG4gICAgdmFyIG9wdCA9IHJvb3Qub3B0LCBlbXB0eSA9IHt9LCB1O1xuICAgIGlmKGZhbHNlID09PSBvcHQucmFkIHx8IGZhbHNlID09PSBvcHQucmFkaXNrKXsgcmV0dXJuIH1cbiAgICBpZigodSsnJyAhPSB0eXBlb2YgcHJvY2VzcykgJiYgJ2ZhbHNlJyA9PT0gJycrKHByb2Nlc3MuZW52fHwnJykuUkFEKXsgcmV0dXJuIH1cbiAgICB2YXIgUmFkaXNrID0gKEd1bi53aW5kb3cgJiYgR3VuLndpbmRvdy5SYWRpc2spIHx8IHJlcXVpcmUoJy4vcmFkaXNrJyk7XG4gICAgdmFyIFJhZGl4ID0gUmFkaXNrLlJhZGl4O1xuICAgIHZhciBkYXJlID0gUmFkaXNrKG9wdCksIGVzYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMjcpO1xuICAgIHZhciBTVCA9IDA7XG4gXG4gICAgcm9vdC5vbigncHV0JywgZnVuY3Rpb24obXNnKXtcbiAgICAgICAgdGhpcy50by5uZXh0KG1zZyk7XG4gICAgICAgIGlmKChtc2cuX3x8JycpLnJhZCl7IHJldHVybiB9IC8vIGRvbid0IHNhdmUgd2hhdCBqdXN0IGNhbWUgZnJvbSBhIHJlYWQuXG4gICAgICAgIC8vaWYobXNnWydAJ10peyByZXR1cm4gfSAvLyBXSFkgRElEIEkgTk9UIEFERCBUSElTP1xuICAgICAgICB2YXIgaWQgPSBtc2dbJyMnXSwgcHV0ID0gbXNnLnB1dCwgc291bCA9IHB1dFsnIyddLCBrZXkgPSBwdXRbJy4nXSwgdmFsID0gcHV0Wyc6J10sIHN0YXRlID0gcHV0Wyc+J10sIHRtcDtcbiAgICAgICAgdmFyIERCRyA9IChtc2cuX3x8JycpLkRCRzsgREJHICYmIChEQkcuc3AgPSBEQkcuc3AgfHwgK25ldyBEYXRlKTtcbiAgICAgICAgLy92YXIgbG90ID0gKG1zZy5ffHwnJykubG90fHwnJzsgY291bnRbaWRdID0gKGNvdW50W2lkXSB8fCAwKSArIDE7IFxuICAgICAgICB2YXIgUyA9IChtc2cuX3x8JycpLlJQUyB8fCAoKG1zZy5ffHwnJykuUlBTID0gK25ldyBEYXRlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlBVVCAtLS0tLS0tPj4+XCIsIHNvdWwsa2V5LCB2YWwsIHN0YXRlKTtcbiAgICAgICAgLy9kYXJlKHNvdWwrZXNjK2tleSwgeyc6JzogdmFsLCAnPic6IHN0YXRlfSwgZGFyZS5vbmVbaWRdIHx8IGZ1bmN0aW9uKGVyciwgb2spe1xuICAgICAgICBkYXJlKHNvdWwrZXNjK2tleSwgeyc6JzogdmFsLCAnPic6IHN0YXRlfSwgZnVuY3Rpb24oZXJyLCBvayl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiPDw8LS0tLS0tLSBQQVRcIiwgc291bCxrZXksIHZhbCwgc3RhdGUsICdpbicsICtuZXcgRGF0ZSAtIFMpO1xuICAgICAgICAgICAgREJHICYmIChEQkcuc3BkID0gREJHLnNwZCB8fCArbmV3IERhdGUpO1xuICAgICAgICAgICAgY29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCAncHV0Jyk7XG4gICAgICAgICAgICAvL2lmKCFlcnIgJiYgY291bnRbaWRdICE9PSBsb3Qucyl7IGNvbnNvbGUubG9nKGVyciA9IFwiRGlzayBjb3VudCBub3Qgc2FtZSBhcyByYW0gY291bnQuXCIpOyBjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKCtuZXcgRGF0ZSwgbG90LnMgLSBjb3VudFtpZF0sICdwdXQgYWNrICE9IGNvdW50JykgfSBkZWxldGUgY291bnRbaWRdO1xuICAgICAgICAgICAgaWYoZXJyKXsgcm9vdC5vbignaW4nLCB7J0AnOiBpZCwgZXJyOiBlcnIsIERCRzogREJHfSk7IHJldHVybiB9XG4gICAgICAgICAgICByb290Lm9uKCdpbicsIHsnQCc6IGlkLCBvazogb2ssIERCRzogREJHfSk7XG4gICAgICAgIC8vfSwgaWQsIERCRyAmJiAoREJHLnIgPSBEQkcuciB8fCB7fSkpO1xuICAgICAgICB9LCBmYWxzZSAmJiBpZCwgREJHICYmIChEQkcuciA9IERCRy5yIHx8IHt9KSk7XG4gICAgICAgIERCRyAmJiAoREJHLnNwcyA9IERCRy5zcHMgfHwgK25ldyBEYXRlKTtcbiAgICB9KTtcbiAgICB2YXIgY291bnQgPSB7fSwgb2JqX2VtcHR5ID0gT2JqZWN0LmVtcHR5O1xuIFxuICAgIHJvb3Qub24oJ2dldCcsIGZ1bmN0aW9uKG1zZyl7XG4gICAgICAgIHRoaXMudG8ubmV4dChtc2cpO1xuICAgICAgICB2YXIgY3R4ID0gbXNnLl98fCcnLCBEQkcgPSBjdHguREJHID0gbXNnLkRCRzsgREJHICYmIChEQkcuc2cgPSArbmV3IERhdGUpO1xuICAgICAgICB2YXIgaWQgPSBtc2dbJyMnXSwgZ2V0ID0gbXNnLmdldCwgc291bCA9IG1zZy5nZXRbJyMnXSwgaGFzID0gbXNnLmdldFsnLiddfHwnJywgbyA9IHt9LCBncmFwaCwgbGV4LCBrZXksIHRtcCwgZm9yY2U7XG4gICAgICAgIGlmKCdzdHJpbmcnID09IHR5cGVvZiBzb3VsKXtcbiAgICAgICAgICAgIGtleSA9IHNvdWw7XG4gICAgICAgIH0gZWxzZSBcbiAgICAgICAgaWYoc291bCl7XG4gICAgICAgICAgICBpZih1ICE9PSAodG1wID0gc291bFsnKiddKSl7IG8ubGltaXQgPSBmb3JjZSA9IDEgfVxuICAgICAgICAgICAgaWYodSAhPT0gc291bFsnPiddKXsgby5zdGFydCA9IHNvdWxbJz4nXSB9XG4gICAgICAgICAgICBpZih1ICE9PSBzb3VsWyc8J10peyBvLmVuZCA9IHNvdWxbJzwnXSB9XG4gICAgICAgICAgICBrZXkgPSBmb3JjZT8gKCcnK3RtcCkgOiB0bXAgfHwgc291bFsnPSddO1xuICAgICAgICAgICAgZm9yY2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmKGtleSAmJiAhby5saW1pdCl7IC8vIGEgc291bC5oYXMgbXVzdCBiZSBvbiBhIHNvdWwsIGFuZCBub3QgZHVyaW5nIHNvdWwqXG4gICAgICAgICAgICBpZignc3RyaW5nJyA9PSB0eXBlb2YgaGFzKXtcbiAgICAgICAgICAgICAgICBrZXkgPSBrZXkrZXNjKyhvLmF0b20gPSBoYXMpO1xuICAgICAgICAgICAgfSBlbHNlIFxuICAgICAgICAgICAgaWYoaGFzKXtcbiAgICAgICAgICAgICAgICBpZih1ICE9PSBoYXNbJz4nXSl7IG8uc3RhcnQgPSBoYXNbJz4nXTsgby5saW1pdCA9IDEgfVxuICAgICAgICAgICAgICAgIGlmKHUgIT09IGhhc1snPCddKXsgby5lbmQgPSBoYXNbJzwnXTsgby5saW1pdCA9IDEgfVxuICAgICAgICAgICAgICAgIGlmKHUgIT09ICh0bXAgPSBoYXNbJyonXSkpeyBvLmxpbWl0ID0gZm9yY2UgPSAxIH1cbiAgICAgICAgICAgICAgICBpZihrZXkpeyBrZXkgPSBrZXkrZXNjICsgKGZvcmNlPyAoJycrKHRtcHx8JycpKSA6IHRtcCB8fCAoby5hdG9tID0gaGFzWyc9J10gfHwgJycpKSB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoKHRtcCA9IGdldFsnJSddKSB8fCBvLmxpbWl0KXtcbiAgICAgICAgICAgIG8ubGltaXQgPSAodG1wIDw9IChvLnBhY2sgfHwgKDEwMDAgKiAxMDApKSk/IHRtcCA6IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYoaGFzWyctJ10gfHwgKHNvdWx8fHt9KVsnLSddIHx8IGdldFsnLSddKXsgby5yZXZlcnNlID0gdHJ1ZSB9XG4gICAgICAgIGlmKCh0bXAgPSAocm9vdC5uZXh0fHwnJylbc291bF0pICYmIHRtcC5wdXQpe1xuICAgICAgICAgICAgaWYoby5hdG9tKXtcbiAgICAgICAgICAgICAgICB0bXAgPSAodG1wLm5leHR8fCcnKVtvLmF0b21dIDtcbiAgICAgICAgICAgICAgICBpZih0bXAgJiYgdG1wLnJhZCl7IHJldHVybiB9XG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgIGlmKHRtcCAmJiB0bXAucmFkKXsgcmV0dXJuIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgbm93ID0gR3VuLnN0YXRlKCk7XG4gICAgICAgIHZhciBTID0gKCtuZXcgRGF0ZSksIEMgPSAwLCBTUFQgPSAwOyAvLyBTVEFUUyFcbiAgICAgICAgREJHICYmIChEQkcuc2dtID0gUyk7XG4gICAgICAgIC8vdmFyIEdJRCA9IFN0cmluZy5yYW5kb20oMyk7IGNvbnNvbGUubG9nKFwiR0VUIC0tLS0tLS0+Pj5cIiwgR0lELCBrZXksIG8sICc/JywgZ2V0KTtcbiAgICAgICAgZGFyZShrZXl8fCcnLCBmdW5jdGlvbihlcnIsIGRhdGEsIGluZm8pe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIjw8PC0tLS0tLS0gR09UXCIsIEdJRCwgK25ldyBEYXRlIC0gUywgZXJyLCBkYXRhKTtcbiAgICAgICAgICAgIERCRyAmJiAoREJHLnNnciA9ICtuZXcgRGF0ZSk7XG4gICAgICAgICAgICBEQkcgJiYgKERCRy5zZ2kgPSBpbmZvKTtcbiAgICAgICAgICAgIHRyeXtvcHQuc3RvcmUuc3RhdHMuZ2V0LnRpbWVbc3RhdGcgJSA1MF0gPSAoK25ldyBEYXRlKSAtIFM7ICsrc3RhdGc7XG4gICAgICAgICAgICAgICAgb3B0LnN0b3JlLnN0YXRzLmdldC5jb3VudCsrO1xuICAgICAgICAgICAgICAgIGlmKGVycil7IG9wdC5zdG9yZS5zdGF0cy5nZXQuZXJyID0gZXJyIH1cbiAgICAgICAgICAgIH1jYXRjaChlKXt9IC8vIFNUQVRTIVxuICAgICAgICAgICAgLy9pZih1ID09PSBkYXRhICYmIGluZm8uY2h1bmtzID4gMSl7IHJldHVybiB9IC8vIGlmIHdlIGFscmVhZHkgc2VudCBhIGNodW5rLCBpZ25vcmUgZW5kaW5nIGVtcHR5IHJlc3BvbnNlcy4gLy8gdGhpcyBjYXVzZXMgdGVzdHMgdG8gZmFpbC5cbiAgICAgICAgICAgIGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ2dvdCcsIEpTT04uc3RyaW5naWZ5KGtleSkpOyBTID0gK25ldyBEYXRlO1xuICAgICAgICAgICAgaW5mbyA9IGluZm8gfHwgJyc7XG4gICAgICAgICAgICB2YXIgdmEsIHZlO1xuICAgICAgICAgICAgaWYoaW5mby51bml0ICYmIGRhdGEgJiYgdSAhPT0gKHZhID0gZGF0YVsnOiddKSAmJiB1ICE9PSAodmUgPSBkYXRhWyc+J10pKXsgLy8gbmV3IGZvcm1hdFxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSBrZXkuc3BsaXQoZXNjKSwgc28gPSB0bXBbMF0sIGhhID0gdG1wWzFdO1xuICAgICAgICAgICAgICAgIChncmFwaCA9IGdyYXBoIHx8IHt9KVtzb10gPSBHdW4uc3RhdGUuaWZ5KGdyYXBoW3NvXSwgaGEsIHZlLCB2YSwgc28pO1xuICAgICAgICAgICAgICAgIHJvb3QuJC5nZXQoc28pLmdldChoYSkuXy5yYWQgPSBub3c7XG4gICAgICAgICAgICAgICAgLy8gUkVNRU1CRVIgVE8gQUREIF9yYWQgVE8gTk9ERS9TT1VMIFFVRVJZIVxuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICBpZihkYXRhKXsgLy8gb2xkIGNvZGUgcGF0aFxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBkYXRhICE9PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICAgICAgICAgIGlmKG8uYXRvbSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gdTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJhZGl4Lm1hcChkYXRhLCBlYWNoLCBvKTsgLy8gSVMgQSBSQURJWCBUUkVFLCBOT1QgRlVOQ1RJT04hXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoIWdyYXBoICYmIGRhdGEpeyBlYWNoKGRhdGEsICcnKSB9XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogIWhhcyB3aGF0IGFib3V0IHNvdWwgbG9va3Vwcz9cbiAgICAgICAgICAgICAgICBpZighby5hdG9tICYmICFoYXMgJiAnc3RyaW5nJyA9PSB0eXBlb2Ygc291bCAmJiAhby5saW1pdCAmJiAhby5tb3JlKXtcbiAgICAgICAgICAgICAgICAgICAgcm9vdC4kLmdldChzb3VsKS5fLnJhZCA9IG5vdztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBEQkcgJiYgKERCRy5zZ3AgPSArbmV3IERhdGUpO1xuICAgICAgICAgICAgLy8gVE9ETzogUEVSRiBOT1RFUyEgVGhpcyBpcyBsaWtlIDAuMnMsIGJ1dCBmb3IgZWFjaCBhY2ssIG9yIGFsbD8gQ2FuIHlvdSBjYWNoZSB0aGVzZSBwcmVwcz9cbiAgICAgICAgICAgIC8vIFRPRE86IFBFUkYgTk9URVMhIFRoaXMgaXMgbGlrZSAwLjJzLCBidXQgZm9yIGVhY2ggYWNrLCBvciBhbGw/IENhbiB5b3UgY2FjaGUgdGhlc2UgcHJlcHM/XG4gICAgICAgICAgICAvLyBUT0RPOiBQRVJGIE5PVEVTISBUaGlzIGlzIGxpa2UgMC4ycywgYnV0IGZvciBlYWNoIGFjaywgb3IgYWxsPyBDYW4geW91IGNhY2hlIHRoZXNlIHByZXBzP1xuICAgICAgICAgICAgLy8gVE9ETzogUEVSRiBOT1RFUyEgVGhpcyBpcyBsaWtlIDAuMnMsIGJ1dCBmb3IgZWFjaCBhY2ssIG9yIGFsbD8gQ2FuIHlvdSBjYWNoZSB0aGVzZSBwcmVwcz9cbiAgICAgICAgICAgIC8vIFRPRE86IFBFUkYgTk9URVMhIFRoaXMgaXMgbGlrZSAwLjJzLCBidXQgZm9yIGVhY2ggYWNrLCBvciBhbGw/IENhbiB5b3UgY2FjaGUgdGhlc2UgcHJlcHM/XG4gICAgICAgICAgICAvLyBPciBiZW5jaG1hcmsgYnkgcmV1c2luZyBmaXJzdCBzdGFydCBkYXRlLlxuICAgICAgICAgICAgaWYoY29uc29sZS5TVEFUICYmIChTVCA9ICtuZXcgRGF0ZSAtIFMpID4gOSl7IGNvbnNvbGUuU1RBVChTLCBTVCwgJ2dvdCBwcmVwIHRpbWUnKTsgY29uc29sZS5TVEFUKFMsIEMsICdnb3QgcHJlcCAjJykgfSBTUFQgKz0gU1Q7IEMgPSAwOyBTID0gK25ldyBEYXRlO1xuICAgICAgICAgICAgdmFyIGZhaXRoID0gZnVuY3Rpb24oKXt9OyBmYWl0aC5mYWl0aCA9IHRydWU7IGZhaXRoLnJhZCA9IGdldDsgLy8gSE5QRVJGOiBXZSdyZSB0ZXN0aW5nIHBlcmZvcm1hbmNlIGltcHJvdmVtZW50IGJ5IHNraXBwaW5nIGdvaW5nIHRocm91Z2ggc2VjdXJpdHkgYWdhaW4sIGJ1dCB0aGlzIHNob3VsZCBiZSBhdWRpdGVkLlxuICAgICAgICAgICAgcm9vdC5vbignaW4nLCB7J0AnOiBpZCwgcHV0OiBncmFwaCwgJyUnOiBpbmZvLm1vcmU/IDEgOiB1LCBlcnI6IGVycj8gZXJyIDogdSwgXzogZmFpdGgsIERCRzogREJHfSk7XG4gICAgICAgICAgICBjb25zb2xlLlNUQVQgJiYgKFNUID0gK25ldyBEYXRlIC0gUykgPiA5ICYmIGNvbnNvbGUuU1RBVChTLCBTVCwgJ2dvdCBlbWl0JywgT2JqZWN0LmtleXMoZ3JhcGh8fHt9KS5sZW5ndGgpO1xuICAgICAgICAgICAgZ3JhcGggPSB1OyAvLyBlYWNoIGlzIG91dHNpZGUgb3VyIHNjb3BlLCB3ZSBoYXZlIHRvIHJlc2V0IGdyYXBoIHRvIG5vdGhpbmchXG4gICAgICAgIH0sIG8sIERCRyAmJiAoREJHLnIgPSBEQkcuciB8fCB7fSkpO1xuICAgICAgICBEQkcgJiYgKERCRy5zZ2QgPSArbmV3IERhdGUpO1xuICAgICAgICBjb25zb2xlLlNUQVQgJiYgKFNUID0gK25ldyBEYXRlIC0gUykgPiA5ICYmIGNvbnNvbGUuU1RBVChTLCBTVCwgJ2dldCBjYWxsJyk7IC8vIFRPRE86IFBlcmY6IHRoaXMgd2FzIGhhbGYgYSBzZWNvbmQ/Pz8/Pz9cbiAgICAgICAgZnVuY3Rpb24gZWFjaCh2YWwsIGhhcywgYSxiKXsgLy8gVE9ETzogVEhJUyBDT0RFIE5FRURTIFRPIEJFIEZBU1RFUiEhISFcbiAgICAgICAgICAgIEMrKztcbiAgICAgICAgICAgIGlmKCF2YWwpeyByZXR1cm4gfVxuICAgICAgICAgICAgaGFzID0gKGtleStoYXMpLnNwbGl0KGVzYyk7XG4gICAgICAgICAgICB2YXIgc291bCA9IGhhcy5zbGljZSgwLDEpWzBdO1xuICAgICAgICAgICAgaGFzID0gaGFzLnNsaWNlKC0xKVswXTtcbiAgICAgICAgICAgIGlmKG8ubGltaXQgJiYgby5saW1pdCA8PSBvLmNvdW50KXsgcmV0dXJuIHRydWUgfVxuICAgICAgICAgICAgdmFyIHZhLCB2ZSwgc28gPSBzb3VsLCBoYSA9IGhhcztcbiAgICAgICAgICAgIC8vaWYodSAhPT0gKHZhID0gdmFsWyc6J10pICYmIHUgIT09ICh2ZSA9IHZhbFsnPiddKSl7IC8vIFRISVMgSEFORExFUyBORVcgQ09ERSFcbiAgICAgICAgICAgIGlmKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpeyAvLyBUSElTIEhBTkRMRVMgTkVXIENPREUhXG4gICAgICAgICAgICAgICAgdmEgPSB2YWxbJzonXTsgdmUgPSB2YWxbJz4nXTtcbiAgICAgICAgICAgICAgICAoZ3JhcGggPSBncmFwaCB8fCB7fSlbc29dID0gR3VuLnN0YXRlLmlmeShncmFwaFtzb10sIGhhLCB2ZSwgdmEsIHNvKTtcbiAgICAgICAgICAgICAgICAvL3Jvb3QuJC5nZXQoc28pLmdldChoYSkuXy5yYWQgPSBub3c7XG4gICAgICAgICAgICAgICAgby5jb3VudCA9IChvLmNvdW50IHx8IDApICsgKCh2YXx8JycpLmxlbmd0aCB8fCA5KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvLmNvdW50ID0gKG8uY291bnQgfHwgMCkgKyB2YWwubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIHRtcCA9IHZhbC5sYXN0SW5kZXhPZignPicpO1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gUmFkaXNrLmRlY29kZSh2YWwuc2xpY2UodG1wKzEpLCBudWxsLCBlc2MpO1xuICAgICAgICAgICAgdmFsID0gUmFkaXNrLmRlY29kZSh2YWwuc2xpY2UoMCx0bXApLCBudWxsLCBlc2MpO1xuICAgICAgICAgICAgKGdyYXBoID0gZ3JhcGggfHwge30pW3NvdWxdID0gR3VuLnN0YXRlLmlmeShncmFwaFtzb3VsXSwgaGFzLCBzdGF0ZSwgdmFsLCBzb3VsKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHZhciB2YWxfaXMgPSBHdW4udmFsaWQ7XG4gICAgKG9wdC5zdG9yZXx8e30pLnN0YXRzID0ge2dldDp7dGltZTp7fSwgY291bnQ6MH0sIHB1dDoge3RpbWU6e30sIGNvdW50OjB9fTsgLy8gU1RBVFMhXG4gICAgdmFyIHN0YXRnID0gMCwgc3RhdHAgPSAwOyAvLyBTVEFUUyFcbn0pOyIsInZhciBHdW4gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIik/IHdpbmRvdy5HdW4gOiByZXF1aXJlKCcuLi9ndW4nKTtcblxuY29uc3QgcmVsXyA9ICcjJzsgIC8vICcjJ1xuY29uc3Qgbm9kZV8gPSAnXyc7ICAvLyAnXydcblxuR3VuLmNoYWluLnVuc2V0ID0gZnVuY3Rpb24obm9kZSl7XG5cdGlmKCB0aGlzICYmIG5vZGUgJiYgbm9kZVtub2RlX10gJiYgbm9kZVtub2RlX10ucHV0ICYmIG5vZGVbbm9kZV9dLnB1dFtub2RlX10gJiYgbm9kZVtub2RlX10ucHV0W25vZGVfXVtyZWxfXSApe1xuXHRcdHRoaXMucHV0KCB7IFtub2RlW25vZGVfXS5wdXRbbm9kZV9dW3JlbF9dXTpudWxsfSApO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuIiwiOyhmdW5jdGlvbigpe1xuLy8gSlNPTjogSmF2YVNjcmlwdCBPYmplY3QgTm90YXRpb25cbi8vIFlTT046IFlpZWxkaW5nIGphdmFTY3JpcHQgT2JqZWN0IE5vdGF0aW9uXG52YXIgeXNvbiA9IHt9LCB1LCBzSSA9IHNldFRpbWVvdXQudHVybiB8fCAodHlwZW9mIHNldEltbWVkaWF0ZSAhPSAnJyt1ICYmIHNldEltbWVkaWF0ZSkgfHwgc2V0VGltZW91dDtcblxueXNvbi5wYXJzZUFzeW5jID0gZnVuY3Rpb24odGV4dCwgZG9uZSwgcmV2aXZlLCBNKXtcblx0aWYoJ3N0cmluZycgIT0gdHlwZW9mIHRleHQpeyB0cnl7IGRvbmUodSxKU09OLnBhcnNlKHRleHQpKSB9Y2F0Y2goZSl7IGRvbmUoZSkgfSByZXR1cm4gfVxuXHR2YXIgY3R4ID0ge2k6IDAsIHRleHQ6IHRleHQsIGRvbmU6IGRvbmUsIGw6IHRleHQubGVuZ3RoLCB1cDogW119O1xuXHQvL00gPSAxMDI0ICogMTAyNCAqIDEwMDtcblx0Ly9NID0gTSB8fCAxMDI0ICogNjQ7XG5cdE0gPSBNIHx8IDEwMjQgKiAzMjtcblx0cGFyc2UoKTtcblx0ZnVuY3Rpb24gcGFyc2UoKXtcblx0XHQvL3ZhciBTID0gK25ldyBEYXRlO1xuXHRcdHZhciBzID0gY3R4LnRleHQ7XG5cdFx0dmFyIGkgPSBjdHguaSwgbCA9IGN0eC5sLCBqID0gMDtcblx0XHR2YXIgdyA9IGN0eC53LCBiLCB0bXA7XG5cdFx0d2hpbGUoaisrIDwgTSl7XG5cdFx0XHR2YXIgYyA9IHNbaSsrXTtcblx0XHRcdGlmKGkgPiBsKXtcblx0XHRcdFx0Y3R4LmVuZCA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0aWYodyl7XG5cdFx0XHRcdGkgPSBzLmluZGV4T2YoJ1wiJywgaS0xKTsgYyA9IHNbaV07XG5cdFx0XHRcdHRtcCA9IDA7IHdoaWxlKCdcXFxcJyA9PSBzW2ktKCsrdG1wKV0pe307IHRtcCA9ICEodG1wICUgMik7Ly90bXAgPSAoJ1xcXFwnID09IHNbaS0xXSk7IC8vIGpzb24gaXMgc3R1cGlkXG5cdFx0XHRcdGIgPSBiIHx8IHRtcDtcblx0XHRcdFx0aWYoJ1wiJyA9PSBjICYmICF0bXApe1xuXHRcdFx0XHRcdHcgPSB1O1xuXHRcdFx0XHRcdHRtcCA9IGN0eC5zO1xuXHRcdFx0XHRcdGlmKGN0eC5hKXtcblx0XHRcdFx0XHRcdHRtcCA9IHMuc2xpY2UoY3R4LnNsLCBpKTtcblx0XHRcdFx0XHRcdGlmKGIgfHwgKDErdG1wLmluZGV4T2YoJ1xcXFwnKSkpeyB0bXAgPSBKU09OLnBhcnNlKCdcIicrdG1wKydcIicpIH0gLy8gZXNjYXBlICsgdW5pY29kZSA6KCBoYW5kbGluZ1xuXHRcdFx0XHRcdFx0aWYoY3R4LmF0IGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdFx0XHRcdFx0XHRjdHguYXQucHVzaChjdHgucyA9IHRtcCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRpZighY3R4LmF0KXsgY3R4LmVuZCA9IGogPSBNOyB0bXAgPSB1IH1cblx0XHRcdFx0XHRcdFx0KGN0eC5hdHx8e30pW2N0eC5zXSA9IGN0eC5zID0gdG1wO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y3R4LnMgPSB1O1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjdHgucyA9IHMuc2xpY2UoY3R4LnNsLCBpKTtcblx0XHRcdFx0XHRcdGlmKGIgfHwgKDErY3R4LnMuaW5kZXhPZignXFxcXCcpKSl7IGN0eC5zID0gSlNPTi5wYXJzZSgnXCInK2N0eC5zKydcIicpOyB9IC8vIGVzY2FwZSArIHVuaWNvZGUgOiggaGFuZGxpbmdcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y3R4LmEgPSBiID0gdTtcblx0XHRcdFx0fVxuXHRcdFx0XHQrK2k7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzd2l0Y2goYyl7XG5cdFx0XHRcdGNhc2UgJ1wiJzpcblx0XHRcdFx0XHRjdHguc2wgPSBpO1xuXHRcdFx0XHRcdHcgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICc6Jzpcblx0XHRcdFx0XHRjdHguYWkgPSBpO1xuXHRcdFx0XHRcdGN0eC5hID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnLCc6XG5cdFx0XHRcdFx0aWYoY3R4LmEgfHwgY3R4LmF0IGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdFx0XHRcdFx0aWYodG1wID0gcy5zbGljZShjdHguYWksIGktMSkpe1xuXHRcdFx0XHRcdFx0XHRpZih1ICE9PSAodG1wID0gdmFsdWUodG1wKSkpe1xuXHRcdFx0XHRcdFx0XHRcdGlmKGN0eC5hdCBpbnN0YW5jZW9mIEFycmF5KXtcblx0XHRcdFx0XHRcdFx0XHRcdGN0eC5hdC5wdXNoKHRtcCk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN0eC5hdFtjdHguc10gPSB0bXA7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGN0eC5hID0gdTtcblx0XHRcdFx0XHRpZihjdHguYXQgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0XHRcdFx0XHRjdHguYSA9IHRydWU7XG5cdFx0XHRcdFx0XHRjdHguYWkgPSBpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAneyc6XG5cdFx0XHRcdFx0Y3R4LnVwLnB1c2goY3R4LmF0fHwoY3R4LmF0ID0ge30pKTtcblx0XHRcdFx0XHRpZihjdHguYXQgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0XHRcdFx0XHRjdHguYXQucHVzaChjdHguYXQgPSB7fSk7XG5cdFx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0aWYodSAhPT0gKHRtcCA9IGN0eC5zKSl7XG5cdFx0XHRcdFx0XHRjdHguYXRbdG1wXSA9IGN0eC5hdCA9IHt9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjdHguYSA9IHU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ30nOlxuXHRcdFx0XHRcdGlmKGN0eC5hKXtcblx0XHRcdFx0XHRcdGlmKHRtcCA9IHMuc2xpY2UoY3R4LmFpLCBpLTEpKXtcblx0XHRcdFx0XHRcdFx0aWYodSAhPT0gKHRtcCA9IHZhbHVlKHRtcCkpKXtcblx0XHRcdFx0XHRcdFx0XHRpZihjdHguYXQgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdHguYXQucHVzaCh0bXApO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZighY3R4LmF0KXsgY3R4LmVuZCA9IGogPSBNOyB0bXAgPSB1IH1cblx0XHRcdFx0XHRcdFx0XHRcdChjdHguYXR8fHt9KVtjdHguc10gPSB0bXA7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGN0eC5hID0gdTtcblx0XHRcdFx0XHRjdHguYXQgPSBjdHgudXAucG9wKCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ1snOlxuXHRcdFx0XHRcdGlmKHUgIT09ICh0bXAgPSBjdHgucykpe1xuXHRcdFx0XHRcdFx0Y3R4LnVwLnB1c2goY3R4LmF0KTtcblx0XHRcdFx0XHRcdGN0eC5hdFt0bXBdID0gY3R4LmF0ID0gW107XG5cdFx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0aWYoIWN0eC5hdCl7XG5cdFx0XHRcdFx0XHRjdHgudXAucHVzaChjdHguYXQgPSBbXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGN0eC5hID0gdHJ1ZTtcblx0XHRcdFx0XHRjdHguYWkgPSBpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICddJzpcblx0XHRcdFx0XHRpZihjdHguYSl7XG5cdFx0XHRcdFx0XHRpZih0bXAgPSBzLnNsaWNlKGN0eC5haSwgaS0xKSl7XG5cdFx0XHRcdFx0XHRcdGlmKHUgIT09ICh0bXAgPSB2YWx1ZSh0bXApKSl7XG5cdFx0XHRcdFx0XHRcdFx0aWYoY3R4LmF0IGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3R4LmF0LnB1c2godG1wKTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3R4LmF0W2N0eC5zXSA9IHRtcDtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y3R4LmEgPSB1O1xuXHRcdFx0XHRcdGN0eC5hdCA9IGN0eC51cC5wb3AoKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjdHgucyA9IHU7XG5cdFx0Y3R4LmkgPSBpO1xuXHRcdGN0eC53ID0gdztcblx0XHRpZihjdHguZW5kKXtcblx0XHRcdHRtcCA9IGN0eC5hdDtcblx0XHRcdGlmKHUgPT09IHRtcCl7XG5cdFx0XHRcdHRyeXsgdG1wID0gSlNPTi5wYXJzZSh0ZXh0KVxuXHRcdFx0XHR9Y2F0Y2goZSl7IHJldHVybiBjdHguZG9uZShlKSB9XG5cdFx0XHR9XG5cdFx0XHRjdHguZG9uZSh1LCB0bXApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzSShwYXJzZSk7XG5cdFx0fVxuXHR9XG59XG5mdW5jdGlvbiB2YWx1ZShzKXtcblx0dmFyIG4gPSBwYXJzZUZsb2F0KHMpO1xuXHRpZighaXNOYU4obikpe1xuXHRcdHJldHVybiBuO1xuXHR9XG5cdHMgPSBzLnRyaW0oKTtcblx0aWYoJ3RydWUnID09IHMpe1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGlmKCdmYWxzZScgPT0gcyl7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGlmKCdudWxsJyA9PSBzKXtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufVxuXG55c29uLnN0cmluZ2lmeUFzeW5jID0gZnVuY3Rpb24oZGF0YSwgZG9uZSwgcmVwbGFjZXIsIHNwYWNlLCBjdHgpe1xuXHQvL3RyeXtkb25lKHUsIEpTT04uc3RyaW5naWZ5KGRhdGEsIHJlcGxhY2VyLCBzcGFjZSkpfWNhdGNoKGUpe2RvbmUoZSl9cmV0dXJuO1xuXHRjdHggPSBjdHggfHwge307XG5cdGN0eC50ZXh0ID0gY3R4LnRleHQgfHwgXCJcIjtcblx0Y3R4LnVwID0gW2N0eC5hdCA9IHtkOiBkYXRhfV07XG5cdGN0eC5kb25lID0gZG9uZTtcblx0Y3R4LmkgPSAwO1xuXHR2YXIgaiA9IDA7XG5cdGlmeSgpO1xuXHRmdW5jdGlvbiBpZnkoKXtcblx0XHR2YXIgYXQgPSBjdHguYXQsIGRhdGEgPSBhdC5kLCBhZGQgPSAnJywgdG1wO1xuXHRcdGlmKGF0LmkgJiYgKGF0LmkgLSBhdC5qKSA+IDApeyBhZGQgKz0gJywnIH1cblx0XHRpZih1ICE9PSAodG1wID0gYXQuaykpeyBhZGQgKz0gSlNPTi5zdHJpbmdpZnkodG1wKSArICc6JyB9IC8vJ1wiJyt0bXArJ1wiOicgfSAvLyBvbmx5IGlmIGJhY2tzbGFzaFxuXHRcdHN3aXRjaCh0eXBlb2YgZGF0YSl7XG5cdFx0Y2FzZSAnYm9vbGVhbic6XG5cdFx0XHRhZGQgKz0gJycrZGF0YTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRhZGQgKz0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7IC8vY3R4LnRleHQgKz0gJ1wiJytkYXRhKydcIic7Ly9KU09OLnN0cmluZ2lmeShkYXRhKTsgLy8gb25seSBpZiBiYWNrc2xhc2hcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRhZGQgKz0gZGF0YTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ29iamVjdCc6XG5cdFx0XHRpZighZGF0YSl7XG5cdFx0XHRcdGFkZCArPSAnbnVsbCc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0aWYoZGF0YSBpbnN0YW5jZW9mIEFycmF5KXtcdFxuXHRcdFx0XHRhZGQgKz0gJ1snO1xuXHRcdFx0XHRhdCA9IHtpOiAtMSwgYXM6IGRhdGEsIHVwOiBhdCwgajogMH07XG5cdFx0XHRcdGF0LmwgPSBkYXRhLmxlbmd0aDtcblx0XHRcdFx0Y3R4LnVwLnB1c2goY3R4LmF0ID0gYXQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGlmKCdmdW5jdGlvbicgIT0gdHlwZW9mIChkYXRhfHwnJykudG9KU09OKXtcblx0XHRcdFx0YWRkICs9ICd7Jztcblx0XHRcdFx0YXQgPSB7aTogLTEsIG9rOiBPYmplY3Qua2V5cyhkYXRhKS5zb3J0KCksIGFzOiBkYXRhLCB1cDogYXQsIGo6IDB9O1xuXHRcdFx0XHRhdC5sID0gYXQub2subGVuZ3RoO1xuXHRcdFx0XHRjdHgudXAucHVzaChjdHguYXQgPSBhdCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0aWYodG1wID0gZGF0YS50b0pTT04oKSl7XG5cdFx0XHRcdGFkZCArPSB0bXA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0Ly8gbGV0IHRoaXMgJiBiZWxvdyBwYXNzIGludG8gZGVmYXVsdCBjYXNlLi4uXG5cdFx0Y2FzZSAnZnVuY3Rpb24nOlxuXHRcdFx0aWYoYXQuYXMgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0XHRcdGFkZCArPSAnbnVsbCc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdGRlZmF1bHQ6IC8vIGhhbmRsZSB3cm9uZ2x5IGFkZGVkIGxlYWRpbmcgYCxgIGlmIHByZXZpb3VzIGl0ZW0gbm90IEpTT04tYWJsZS5cblx0XHRcdGFkZCA9ICcnO1xuXHRcdFx0YXQuaisrO1xuXHRcdH1cblx0XHRjdHgudGV4dCArPSBhZGQ7XG5cdFx0d2hpbGUoMSthdC5pID49IGF0Lmwpe1xuXHRcdFx0Y3R4LnRleHQgKz0gKGF0Lm9rPyAnfScgOiAnXScpO1xuXHRcdFx0YXQgPSBjdHguYXQgPSBhdC51cDtcblx0XHR9XG5cdFx0aWYoKythdC5pIDwgYXQubCl7XG5cdFx0XHRpZih0bXAgPSBhdC5vayl7XG5cdFx0XHRcdGF0LmQgPSBhdC5hc1thdC5rID0gdG1wW2F0LmldXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGF0LmQgPSBhdC5hc1thdC5pXTtcblx0XHRcdH1cblx0XHRcdGlmKCsraiA8IDkpeyByZXR1cm4gaWZ5KCkgfSBlbHNlIHsgaiA9IDAgfVxuXHRcdFx0c0koaWZ5KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y3R4LmRvbmUodSwgY3R4LnRleHQpO1xuXHR9XG59XG5pZih0eXBlb2Ygd2luZG93ICE9ICcnK3UpeyB3aW5kb3cuWVNPTiA9IHlzb24gfVxudHJ5eyBpZih0eXBlb2YgbW9kdWxlICE9ICcnK3UpeyBtb2R1bGUuZXhwb3J0cyA9IHlzb24gfSB9Y2F0Y2goZSl7fVxuaWYodHlwZW9mIEpTT04gIT0gJycrdSl7XG5cdEpTT04ucGFyc2VBc3luYyA9IHlzb24ucGFyc2VBc3luYztcblx0SlNPTi5zdHJpbmdpZnlBc3luYyA9IHlzb24uc3RyaW5naWZ5QXN5bmM7XG59XG5cbn0oKSk7IiwiOyhmdW5jdGlvbigpe1xuXG4gIC8qIFVOQlVJTEQgKi9cbiAgZnVuY3Rpb24gVVNFKGFyZywgcmVxKXtcbiAgICByZXR1cm4gcmVxPyByZXF1aXJlKGFyZykgOiBhcmcuc2xpY2U/IFVTRVtSKGFyZyldIDogZnVuY3Rpb24obW9kLCBwYXRoKXtcbiAgICAgIGFyZyhtb2QgPSB7ZXhwb3J0czoge319KTtcbiAgICAgIFVTRVtSKHBhdGgpXSA9IG1vZC5leHBvcnRzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBSKHApe1xuICAgICAgcmV0dXJuIHAuc3BsaXQoJy8nKS5zbGljZSgtMSkudG9TdHJpbmcoKS5yZXBsYWNlKCcuanMnLCcnKTtcbiAgICB9XG4gIH1cbiAgaWYodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIil7IHZhciBNT0RVTEUgPSBtb2R1bGUgfVxuICAvKiBVTkJVSUxEICovXG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIC8vIFNlY3VyaXR5LCBFbmNyeXB0aW9uLCBhbmQgQXV0aG9yaXphdGlvbjogU0VBLmpzXG4gICAgLy8gTUFOREFUT1JZIFJFQURJTkc6IGh0dHBzOi8vZ3VuLmVjby9leHBsYWluZXJzL2RhdGEvc2VjdXJpdHkuaHRtbFxuICAgIC8vIElUIElTIElNUExFTUVOVEVEIElOIEEgUE9MWUZJTEwvU0hJTSBBUFBST0FDSC5cbiAgICAvLyBUSElTIElTIEFOIEVBUkxZIEFMUEhBIVxuXG4gICAgaWYodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIil7IG1vZHVsZS53aW5kb3cgPSB3aW5kb3cgfVxuXG4gICAgdmFyIHRtcCA9IG1vZHVsZS53aW5kb3cgfHwgbW9kdWxlLCB1O1xuICAgIHZhciBTRUEgPSB0bXAuU0VBIHx8IHt9O1xuXG4gICAgaWYoU0VBLndpbmRvdyA9IG1vZHVsZS53aW5kb3cpeyBTRUEud2luZG93LlNFQSA9IFNFQSB9XG5cbiAgICB0cnl7IGlmKHUrJycgIT09IHR5cGVvZiBNT0RVTEUpeyBNT0RVTEUuZXhwb3J0cyA9IFNFQSB9IH1jYXRjaChlKXt9XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUE7XG4gIH0pKFVTRSwgJy4vcm9vdCcpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3Jvb3QnKTtcbiAgICB0cnl7IGlmKFNFQS53aW5kb3cpe1xuICAgICAgaWYobG9jYXRpb24ucHJvdG9jb2wuaW5kZXhPZigncycpIDwgMFxuICAgICAgJiYgbG9jYXRpb24uaG9zdC5pbmRleE9mKCdsb2NhbGhvc3QnKSA8IDBcbiAgICAgICYmICEgL14xMjdcXC5cXGQrXFwuXFxkK1xcLlxcZCskLy50ZXN0KGxvY2F0aW9uLmhvc3RuYW1lKVxuICAgICAgJiYgbG9jYXRpb24ucHJvdG9jb2wuaW5kZXhPZignZmlsZTonKSA8IDApe1xuICAgICAgICBjb25zb2xlLndhcm4oJ0hUVFBTIG5lZWRlZCBmb3IgV2ViQ3J5cHRvIGluIFNFQSwgcmVkaXJlY3RpbmcuLi4nKTtcbiAgICAgICAgbG9jYXRpb24ucHJvdG9jb2wgPSAnaHR0cHM6JzsgLy8gV2ViQ3J5cHRvIGRvZXMgTk9UIHdvcmsgd2l0aG91dCBIVFRQUyFcbiAgICAgIH1cbiAgICB9IH1jYXRjaChlKXt9XG4gIH0pKFVTRSwgJy4vaHR0cHMnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIHU7XG4gICAgaWYodSsnJz09IHR5cGVvZiBidG9hKXtcbiAgICAgIGlmKHUrJycgPT0gdHlwZW9mIEJ1ZmZlcil7XG4gICAgICAgIHRyeXsgZ2xvYmFsLkJ1ZmZlciA9IFVTRShcImJ1ZmZlclwiLCAxKS5CdWZmZXIgfWNhdGNoKGUpeyBjb25zb2xlLmxvZyhcIlBsZWFzZSBgbnBtIGluc3RhbGwgYnVmZmVyYCBvciBhZGQgaXQgdG8geW91ciBwYWNrYWdlLmpzb24gIVwiKSB9XG4gICAgICB9XG4gICAgICBnbG9iYWwuYnRvYSA9IGZ1bmN0aW9uKGRhdGEpeyByZXR1cm4gQnVmZmVyLmZyb20oZGF0YSwgXCJiaW5hcnlcIikudG9TdHJpbmcoXCJiYXNlNjRcIikgfTtcbiAgICAgIGdsb2JhbC5hdG9iID0gZnVuY3Rpb24oZGF0YSl7IHJldHVybiBCdWZmZXIuZnJvbShkYXRhLCBcImJhc2U2NFwiKS50b1N0cmluZyhcImJpbmFyeVwiKSB9O1xuICAgIH1cbiAgfSkoVVNFLCAnLi9iYXNlNjQnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgVVNFKCcuL2Jhc2U2NCcpO1xuICAgIC8vIFRoaXMgaXMgQXJyYXkgZXh0ZW5kZWQgdG8gaGF2ZSAudG9TdHJpbmcoWyd1dGY4J3wnaGV4J3wnYmFzZTY0J10pXG4gICAgZnVuY3Rpb24gU2VhQXJyYXkoKSB7fVxuICAgIE9iamVjdC5hc3NpZ24oU2VhQXJyYXksIHsgZnJvbTogQXJyYXkuZnJvbSB9KVxuICAgIFNlYUFycmF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQXJyYXkucHJvdG90eXBlKVxuICAgIFNlYUFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKGVuYywgc3RhcnQsIGVuZCkgeyBlbmMgPSBlbmMgfHwgJ3V0ZjgnOyBzdGFydCA9IHN0YXJ0IHx8IDA7XG4gICAgICBjb25zdCBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgICAgaWYgKGVuYyA9PT0gJ2hleCcpIHtcbiAgICAgICAgY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcylcbiAgICAgICAgcmV0dXJuIFsgLi4uQXJyYXkoKChlbmQgJiYgKGVuZCArIDEpKSB8fCBsZW5ndGgpIC0gc3RhcnQpLmtleXMoKV1cbiAgICAgICAgLm1hcCgoaSkgPT4gYnVmWyBpICsgc3RhcnQgXS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJylcbiAgICAgIH1cbiAgICAgIGlmIChlbmMgPT09ICd1dGY4Jykge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShcbiAgICAgICAgICB7IGxlbmd0aDogKGVuZCB8fCBsZW5ndGgpIC0gc3RhcnQgfSxcbiAgICAgICAgICAoXywgaSkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZSh0aGlzWyBpICsgc3RhcnRdKVxuICAgICAgICApLmpvaW4oJycpXG4gICAgICB9XG4gICAgICBpZiAoZW5jID09PSAnYmFzZTY0Jykge1xuICAgICAgICByZXR1cm4gYnRvYSh0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNlYUFycmF5O1xuICB9KShVU0UsICcuL2FycmF5Jyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIFVTRSgnLi9iYXNlNjQnKTtcbiAgICAvLyBUaGlzIGlzIEJ1ZmZlciBpbXBsZW1lbnRhdGlvbiB1c2VkIGluIFNFQS4gRnVuY3Rpb25hbGl0eSBpcyBtb3N0bHlcbiAgICAvLyBjb21wYXRpYmxlIHdpdGggTm9kZUpTICdzYWZlLWJ1ZmZlcicgYW5kIGlzIHVzZWQgZm9yIGVuY29kaW5nIGNvbnZlcnNpb25zXG4gICAgLy8gYmV0d2VlbiBiaW5hcnkgYW5kICdoZXgnIHwgJ3V0ZjgnIHwgJ2Jhc2U2NCdcbiAgICAvLyBTZWUgZG9jdW1lbnRhdGlvbiBhbmQgdmFsaWRhdGlvbiBmb3Igc2FmZSBpbXBsZW1lbnRhdGlvbiBpbjpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL3NhZmUtYnVmZmVyI3VwZGF0ZVxuICAgIHZhciBTZWFBcnJheSA9IFVTRSgnLi9hcnJheScpO1xuICAgIGZ1bmN0aW9uIFNhZmVCdWZmZXIoLi4ucHJvcHMpIHtcbiAgICAgIGNvbnNvbGUud2FybignbmV3IFNhZmVCdWZmZXIoKSBpcyBkZXByZWNpYXRlZCwgcGxlYXNlIHVzZSBTYWZlQnVmZmVyLmZyb20oKScpXG4gICAgICByZXR1cm4gU2FmZUJ1ZmZlci5mcm9tKC4uLnByb3BzKVxuICAgIH1cbiAgICBTYWZlQnVmZmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQXJyYXkucHJvdG90eXBlKVxuICAgIE9iamVjdC5hc3NpZ24oU2FmZUJ1ZmZlciwge1xuICAgICAgLy8gKGRhdGEsIGVuYykgd2hlcmUgdHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnIHRoZW4gZW5jID09PSAndXRmOCd8J2hleCd8J2Jhc2U2NCdcbiAgICAgIGZyb20oKSB7XG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoYXJndW1lbnRzKS5sZW5ndGggfHwgYXJndW1lbnRzWzBdPT1udWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksIG9yIGFycmF5LWxpa2Ugb2JqZWN0LicpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5wdXQgPSBhcmd1bWVudHNbMF1cbiAgICAgICAgbGV0IGJ1ZlxuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IGVuYyA9IGFyZ3VtZW50c1sxXSB8fCAndXRmOCdcbiAgICAgICAgICBpZiAoZW5jID09PSAnaGV4Jykge1xuICAgICAgICAgICAgY29uc3QgYnl0ZXMgPSBpbnB1dC5tYXRjaCgvKFtcXGRhLWZBLUZdezJ9KS9nKVxuICAgICAgICAgICAgLm1hcCgoYnl0ZSkgPT4gcGFyc2VJbnQoYnl0ZSwgMTYpKVxuICAgICAgICAgICAgaWYgKCFieXRlcyB8fCAhYnl0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgZmlyc3QgYXJndW1lbnQgZm9yIHR5cGUgXFwnaGV4XFwnLicpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBidWYgPSBTZWFBcnJheS5mcm9tKGJ5dGVzKVxuICAgICAgICAgIH0gZWxzZSBpZiAoZW5jID09PSAndXRmOCcgfHwgJ2JpbmFyeScgPT09IGVuYykgeyAvLyBFRElUIEJZIE1BUks6IEkgdGhpbmsgdGhpcyBpcyBzYWZlLCB0ZXN0ZWQgaXQgYWdhaW5zdCBhIGNvdXBsZSBcImJpbmFyeVwiIHN0cmluZ3MuIFRoaXMgbGV0cyBTYWZlQnVmZmVyIG1hdGNoIE5vZGVKUyBCdWZmZXIgYmVoYXZpb3IgbW9yZSB3aGVyZSBpdCBzYWZlbHkgYnRvYXMgcmVndWxhciBzdHJpbmdzLlxuICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gaW5wdXQubGVuZ3RoXG4gICAgICAgICAgICBjb25zdCB3b3JkcyA9IG5ldyBVaW50MTZBcnJheShsZW5ndGgpXG4gICAgICAgICAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBsZW5ndGggfSwgKF8sIGkpID0+IHdvcmRzW2ldID0gaW5wdXQuY2hhckNvZGVBdChpKSlcbiAgICAgICAgICAgIGJ1ZiA9IFNlYUFycmF5LmZyb20od29yZHMpXG4gICAgICAgICAgfSBlbHNlIGlmIChlbmMgPT09ICdiYXNlNjQnKSB7XG4gICAgICAgICAgICBjb25zdCBkZWMgPSBhdG9iKGlucHV0KVxuICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gZGVjLmxlbmd0aFxuICAgICAgICAgICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShsZW5ndGgpXG4gICAgICAgICAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBsZW5ndGggfSwgKF8sIGkpID0+IGJ5dGVzW2ldID0gZGVjLmNoYXJDb2RlQXQoaSkpXG4gICAgICAgICAgICBidWYgPSBTZWFBcnJheS5mcm9tKGJ5dGVzKVxuICAgICAgICAgIH0gZWxzZSBpZiAoZW5jID09PSAnYmluYXJ5JykgeyAvLyBkZXByZWNhdGVkIGJ5IGFib3ZlIGNvbW1lbnRcbiAgICAgICAgICAgIGJ1ZiA9IFNlYUFycmF5LmZyb20oaW5wdXQpIC8vIHNvbWUgYnRvYXMgd2VyZSBtaXNoYW5kbGVkLlxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ1NhZmVCdWZmZXIuZnJvbSB1bmtub3duIGVuY29kaW5nOiAnK2VuYylcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGJ1ZlxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJ5dGVMZW5ndGggPSBpbnB1dC5ieXRlTGVuZ3RoIC8vIHdoYXQgaXMgZ29pbmcgb24gaGVyZT8gRk9SIE1BUlRUSVxuICAgICAgICBjb25zdCBsZW5ndGggPSBpbnB1dC5ieXRlTGVuZ3RoID8gaW5wdXQuYnl0ZUxlbmd0aCA6IGlucHV0Lmxlbmd0aFxuICAgICAgICBpZiAobGVuZ3RoKSB7XG4gICAgICAgICAgbGV0IGJ1ZlxuICAgICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgICBidWYgPSBuZXcgVWludDhBcnJheShpbnB1dClcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFNlYUFycmF5LmZyb20oYnVmIHx8IGlucHV0KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gVGhpcyBpcyAnc2FmZS1idWZmZXIuYWxsb2MnIHNhbnMgZW5jb2Rpbmcgc3VwcG9ydFxuICAgICAgYWxsb2MobGVuZ3RoLCBmaWxsID0gMCAvKiwgZW5jKi8gKSB7XG4gICAgICAgIHJldHVybiBTZWFBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KEFycmF5LmZyb20oeyBsZW5ndGg6IGxlbmd0aCB9LCAoKSA9PiBmaWxsKSkpXG4gICAgICB9LFxuICAgICAgLy8gVGhpcyBpcyBub3JtYWwgVU5TQUZFICdidWZmZXIuYWxsb2MnIG9yICduZXcgQnVmZmVyKGxlbmd0aCknIC0gZG9uJ3QgdXNlIVxuICAgICAgYWxsb2NVbnNhZmUobGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBTZWFBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KEFycmF5LmZyb20oeyBsZW5ndGggOiBsZW5ndGggfSkpKVxuICAgICAgfSxcbiAgICAgIC8vIFRoaXMgcHV0cyB0b2dldGhlciBhcnJheSBvZiBhcnJheSBsaWtlIG1lbWJlcnNcbiAgICAgIGNvbmNhdChhcnIpIHsgLy8gb2N0ZXQgYXJyYXlcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIEFycmF5IGNvbnRhaW5pbmcgQXJyYXlCdWZmZXIgb3IgVWludDhBcnJheSBpbnN0YW5jZXMuJylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gU2VhQXJyYXkuZnJvbShhcnIucmVkdWNlKChyZXQsIGl0ZW0pID0+IHJldC5jb25jYXQoQXJyYXkuZnJvbShpdGVtKSksIFtdKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIFNhZmVCdWZmZXIucHJvdG90eXBlLmZyb20gPSBTYWZlQnVmZmVyLmZyb21cbiAgICBTYWZlQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IFNlYUFycmF5LnByb3RvdHlwZS50b1N0cmluZ1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTYWZlQnVmZmVyO1xuICB9KShVU0UsICcuL2J1ZmZlcicpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICBjb25zdCBTRUEgPSBVU0UoJy4vcm9vdCcpXG4gICAgY29uc3QgYXBpID0ge0J1ZmZlcjogVVNFKCcuL2J1ZmZlcicpfVxuICAgIHZhciBvID0ge30sIHU7XG5cbiAgICAvLyBpZGVhbGx5IHdlIGNhbiBtb3ZlIGF3YXkgZnJvbSBKU09OIGVudGlyZWx5PyB1bmxpa2VseSBkdWUgdG8gY29tcGF0aWJpbGl0eSBpc3N1ZXMuLi4gb2ggd2VsbC5cbiAgICBKU09OLnBhcnNlQXN5bmMgPSBKU09OLnBhcnNlQXN5bmMgfHwgZnVuY3Rpb24odCxjYixyKXsgdmFyIHU7IHRyeXsgY2IodSwgSlNPTi5wYXJzZSh0LHIpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxuICAgIEpTT04uc3RyaW5naWZ5QXN5bmMgPSBKU09OLnN0cmluZ2lmeUFzeW5jIHx8IGZ1bmN0aW9uKHYsY2IscixzKXsgdmFyIHU7IHRyeXsgY2IodSwgSlNPTi5zdHJpbmdpZnkodixyLHMpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxuXG4gICAgYXBpLnBhcnNlID0gZnVuY3Rpb24odCxyKXsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgIEpTT04ucGFyc2VBc3luYyh0LGZ1bmN0aW9uKGVyciwgcmF3KXsgZXJyPyByZWooZXJyKSA6IHJlcyhyYXcpIH0scik7XG4gICAgfSl9XG4gICAgYXBpLnN0cmluZ2lmeSA9IGZ1bmN0aW9uKHYscixzKXsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgIEpTT04uc3RyaW5naWZ5QXN5bmModixmdW5jdGlvbihlcnIsIHJhdyl7IGVycj8gcmVqKGVycikgOiByZXMocmF3KSB9LHIscyk7XG4gICAgfSl9XG5cbiAgICBpZihTRUEud2luZG93KXtcbiAgICAgIGFwaS5jcnlwdG8gPSB3aW5kb3cuY3J5cHRvIHx8IHdpbmRvdy5tc0NyeXB0b1xuICAgICAgYXBpLnN1YnRsZSA9IChhcGkuY3J5cHRvfHxvKS5zdWJ0bGUgfHwgKGFwaS5jcnlwdG98fG8pLndlYmtpdFN1YnRsZTtcbiAgICAgIGFwaS5UZXh0RW5jb2RlciA9IHdpbmRvdy5UZXh0RW5jb2RlcjtcbiAgICAgIGFwaS5UZXh0RGVjb2RlciA9IHdpbmRvdy5UZXh0RGVjb2RlcjtcbiAgICAgIGFwaS5yYW5kb20gPSAobGVuKSA9PiBhcGkuQnVmZmVyLmZyb20oYXBpLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoYXBpLkJ1ZmZlci5hbGxvYyhsZW4pKSkpO1xuICAgIH1cbiAgICBpZighYXBpLlRleHREZWNvZGVyKVxuICAgIHtcbiAgICAgIGNvbnN0IHsgVGV4dEVuY29kZXIsIFRleHREZWNvZGVyIH0gPSBVU0UoKHUrJycgPT0gdHlwZW9mIE1PRFVMRT8nLic6JycpKycuL2xpYi90ZXh0LWVuY29kaW5nJywgMSk7XG4gICAgICBhcGkuVGV4dERlY29kZXIgPSBUZXh0RGVjb2RlcjtcbiAgICAgIGFwaS5UZXh0RW5jb2RlciA9IFRleHRFbmNvZGVyO1xuICAgIH1cbiAgICBpZighYXBpLmNyeXB0bylcbiAgICB7XG4gICAgICB0cnlcbiAgICAgIHtcbiAgICAgIHZhciBjcnlwdG8gPSBVU0UoJ2NyeXB0bycsIDEpO1xuICAgICAgT2JqZWN0LmFzc2lnbihhcGksIHtcbiAgICAgICAgY3J5cHRvLFxuICAgICAgICByYW5kb206IChsZW4pID0+IGFwaS5CdWZmZXIuZnJvbShjcnlwdG8ucmFuZG9tQnl0ZXMobGVuKSlcbiAgICAgIH0pOyAgICAgIFxuICAgICAgY29uc3QgeyBDcnlwdG86IFdlYkNyeXB0byB9ID0gVVNFKCdAcGVjdWxpYXIvd2ViY3J5cHRvJywgMSk7XG4gICAgICBhcGkub3NzbCA9IGFwaS5zdWJ0bGUgPSBuZXcgV2ViQ3J5cHRvKHtkaXJlY3Rvcnk6ICdvc3NsJ30pLnN1YnRsZSAvLyBFQ0RIXG4gICAgfVxuICAgIGNhdGNoKGUpe1xuICAgICAgY29uc29sZS5sb2coXCJQbGVhc2UgYG5wbSBpbnN0YWxsIEBwZWN1bGlhci93ZWJjcnlwdG9gIG9yIGFkZCBpdCB0byB5b3VyIHBhY2thZ2UuanNvbiAhXCIpO1xuICAgIH19XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGFwaVxuICB9KShVU0UsICcuL3NoaW0nKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBzID0ge307XG4gICAgcy5wYmtkZjIgPSB7aGFzaDoge25hbWUgOiAnU0hBLTI1Nid9LCBpdGVyOiAxMDAwMDAsIGtzOiA2NH07XG4gICAgcy5lY2RzYSA9IHtcbiAgICAgIHBhaXI6IHtuYW1lOiAnRUNEU0EnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSxcbiAgICAgIHNpZ246IHtuYW1lOiAnRUNEU0EnLCBoYXNoOiB7bmFtZTogJ1NIQS0yNTYnfX1cbiAgICB9O1xuICAgIHMuZWNkaCA9IHtuYW1lOiAnRUNESCcsIG5hbWVkQ3VydmU6ICdQLTI1Nid9O1xuXG4gICAgLy8gVGhpcyBjcmVhdGVzIFdlYiBDcnlwdG9ncmFwaHkgQVBJIGNvbXBsaWFudCBKV0sgZm9yIHNpZ24vdmVyaWZ5IHB1cnBvc2VzXG4gICAgcy5qd2sgPSBmdW5jdGlvbihwdWIsIGQpeyAgLy8gZCA9PT0gcHJpdlxuICAgICAgcHViID0gcHViLnNwbGl0KCcuJyk7XG4gICAgICB2YXIgeCA9IHB1YlswXSwgeSA9IHB1YlsxXTtcbiAgICAgIHZhciBqd2sgPSB7a3R5OiBcIkVDXCIsIGNydjogXCJQLTI1NlwiLCB4OiB4LCB5OiB5LCBleHQ6IHRydWV9O1xuICAgICAgandrLmtleV9vcHMgPSBkID8gWydzaWduJ10gOiBbJ3ZlcmlmeSddO1xuICAgICAgaWYoZCl7IGp3ay5kID0gZCB9XG4gICAgICByZXR1cm4gandrO1xuICAgIH07XG4gICAgXG4gICAgcy5rZXlUb0p3ayA9IGZ1bmN0aW9uKGtleUJ5dGVzKSB7XG4gICAgICBjb25zdCBrZXlCNjQgPSBrZXlCeXRlcy50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICBjb25zdCBrID0ga2V5QjY0LnJlcGxhY2UoL1xcKy9nLCAnLScpLnJlcGxhY2UoL1xcLy9nLCAnXycpLnJlcGxhY2UoL1xcPS9nLCAnJyk7XG4gICAgICByZXR1cm4geyBrdHk6ICdvY3QnLCBrOiBrLCBleHQ6IGZhbHNlLCBhbGc6ICdBMjU2R0NNJyB9O1xuICAgIH1cblxuICAgIHMucmVjYWxsID0ge1xuICAgICAgdmFsaWRpdHk6IDEyICogNjAgKiA2MCwgLy8gaW50ZXJuYWxseSBpbiBzZWNvbmRzIDogMTIgaG91cnNcbiAgICAgIGhvb2s6IGZ1bmN0aW9uKHByb3BzKXsgcmV0dXJuIHByb3BzIH0gLy8geyBpYXQsIGV4cCwgYWxpYXMsIHJlbWVtYmVyIH0gLy8gb3IgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUocHJvcHMpXG4gICAgfTtcblxuICAgIHMuY2hlY2sgPSBmdW5jdGlvbih0KXsgcmV0dXJuICh0eXBlb2YgdCA9PSAnc3RyaW5nJykgJiYgKCdTRUF7JyA9PT0gdC5zbGljZSgwLDQpKSB9XG4gICAgcy5wYXJzZSA9IGFzeW5jIGZ1bmN0aW9uIHAodCl7IHRyeSB7XG4gICAgICB2YXIgeWVzID0gKHR5cGVvZiB0ID09ICdzdHJpbmcnKTtcbiAgICAgIGlmKHllcyAmJiAnU0VBeycgPT09IHQuc2xpY2UoMCw0KSl7IHQgPSB0LnNsaWNlKDMpIH1cbiAgICAgIHJldHVybiB5ZXMgPyBhd2FpdCBzaGltLnBhcnNlKHQpIDogdDtcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICByZXR1cm4gdDtcbiAgICB9XG5cbiAgICBTRUEub3B0ID0gcztcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHNcbiAgfSkoVVNFLCAnLi9zZXR0aW5ncycpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgc2hpbSA9IFVTRSgnLi9zaGltJyk7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbihkLCBvKXtcbiAgICAgIHZhciB0ID0gKHR5cGVvZiBkID09ICdzdHJpbmcnKT8gZCA6IGF3YWl0IHNoaW0uc3RyaW5naWZ5KGQpO1xuICAgICAgdmFyIGhhc2ggPSBhd2FpdCBzaGltLnN1YnRsZS5kaWdlc3Qoe25hbWU6IG98fCdTSEEtMjU2J30sIG5ldyBzaGltLlRleHRFbmNvZGVyKCkuZW5jb2RlKHQpKTtcbiAgICAgIHJldHVybiBzaGltLkJ1ZmZlci5mcm9tKGhhc2gpO1xuICAgIH1cbiAgfSkoVVNFLCAnLi9zaGEyNTYnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgLy8gVGhpcyBpbnRlcm5hbCBmdW5jIHJldHVybnMgU0hBLTEgaGFzaGVkIGRhdGEgZm9yIEtleUlEIGdlbmVyYXRpb25cbiAgICBjb25zdCBfX3NoaW0gPSBVU0UoJy4vc2hpbScpXG4gICAgY29uc3Qgc3VidGxlID0gX19zaGltLnN1YnRsZVxuICAgIGNvbnN0IG9zc2wgPSBfX3NoaW0ub3NzbCA/IF9fc2hpbS5vc3NsIDogc3VidGxlXG4gICAgY29uc3Qgc2hhMWhhc2ggPSAoYikgPT4gb3NzbC5kaWdlc3Qoe25hbWU6ICdTSEEtMSd9LCBuZXcgQXJyYXlCdWZmZXIoYikpXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzaGExaGFzaFxuICB9KShVU0UsICcuL3NoYTEnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgdmFyIHNoYSA9IFVTRSgnLi9zaGEyNTYnKTtcbiAgICB2YXIgdTtcblxuICAgIFNFQS53b3JrID0gU0VBLndvcmsgfHwgKGFzeW5jIChkYXRhLCBwYWlyLCBjYiwgb3B0KSA9PiB7IHRyeSB7IC8vIHVzZWQgdG8gYmUgbmFtZWQgYHByb29mYFxuICAgICAgdmFyIHNhbHQgPSAocGFpcnx8e30pLmVwdWIgfHwgcGFpcjsgLy8gZXB1YiBub3QgcmVjb21tZW5kZWQsIHNhbHQgc2hvdWxkIGJlIHJhbmRvbSFcbiAgICAgIG9wdCA9IG9wdCB8fCB7fTtcbiAgICAgIGlmKHNhbHQgaW5zdGFuY2VvZiBGdW5jdGlvbil7XG4gICAgICAgIGNiID0gc2FsdDtcbiAgICAgICAgc2FsdCA9IHU7XG4gICAgICB9XG4gICAgICBkYXRhID0gKHR5cGVvZiBkYXRhID09ICdzdHJpbmcnKT8gZGF0YSA6IGF3YWl0IHNoaW0uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgaWYoJ3NoYScgPT09IChvcHQubmFtZXx8JycpLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwzKSl7XG4gICAgICAgIHZhciByc2hhID0gc2hpbS5CdWZmZXIuZnJvbShhd2FpdCBzaGEoZGF0YSwgb3B0Lm5hbWUpLCAnYmluYXJ5JykudG9TdHJpbmcob3B0LmVuY29kZSB8fCAnYmFzZTY0JylcbiAgICAgICAgaWYoY2IpeyB0cnl7IGNiKHJzaGEpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgICByZXR1cm4gcnNoYTtcbiAgICAgIH1cbiAgICAgIHNhbHQgPSBzYWx0IHx8IHNoaW0ucmFuZG9tKDkpO1xuICAgICAgdmFyIGtleSA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLmltcG9ydEtleSgncmF3JywgbmV3IHNoaW0uVGV4dEVuY29kZXIoKS5lbmNvZGUoZGF0YSksIHtuYW1lOiBvcHQubmFtZSB8fCAnUEJLREYyJ30sIGZhbHNlLCBbJ2Rlcml2ZUJpdHMnXSk7XG4gICAgICB2YXIgd29yayA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLmRlcml2ZUJpdHMoe1xuICAgICAgICBuYW1lOiBvcHQubmFtZSB8fCAnUEJLREYyJyxcbiAgICAgICAgaXRlcmF0aW9uczogb3B0Lml0ZXJhdGlvbnMgfHwgUy5wYmtkZjIuaXRlcixcbiAgICAgICAgc2FsdDogbmV3IHNoaW0uVGV4dEVuY29kZXIoKS5lbmNvZGUob3B0LnNhbHQgfHwgc2FsdCksXG4gICAgICAgIGhhc2g6IG9wdC5oYXNoIHx8IFMucGJrZGYyLmhhc2gsXG4gICAgICB9LCBrZXksIG9wdC5sZW5ndGggfHwgKFMucGJrZGYyLmtzICogOCkpXG4gICAgICBkYXRhID0gc2hpbS5yYW5kb20oZGF0YS5sZW5ndGgpICAvLyBFcmFzZSBkYXRhIGluIGNhc2Ugb2YgcGFzc3BocmFzZVxuICAgICAgdmFyIHIgPSBzaGltLkJ1ZmZlci5mcm9tKHdvcmssICdiaW5hcnknKS50b1N0cmluZyhvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKVxuICAgICAgaWYoY2IpeyB0cnl7IGNiKHIpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSBjYXRjaChlKSB7IFxuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBTRUEuZXJyID0gZTtcbiAgICAgIGlmKFNFQS50aHJvdyl7IHRocm93IGUgfVxuICAgICAgaWYoY2IpeyBjYigpIH1cbiAgICAgIHJldHVybjtcbiAgICB9fSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQS53b3JrO1xuICB9KShVU0UsICcuL3dvcmsnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG5cbiAgICBTRUEubmFtZSA9IFNFQS5uYW1lIHx8IChhc3luYyAoY2IsIG9wdCkgPT4geyB0cnkge1xuICAgICAgaWYoY2IpeyB0cnl7IGNiKCkgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICByZXR1cm47XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgIFNFQS5lcnIgPSBlO1xuICAgICAgaWYoU0VBLnRocm93KXsgdGhyb3cgZSB9XG4gICAgICBpZihjYil7IGNiKCkgfVxuICAgICAgcmV0dXJuO1xuICAgIH19KTtcblxuICAgIC8vU0VBLnBhaXIgPSBhc3luYyAoZGF0YSwgcHJvb2YsIGNiKSA9PiB7IHRyeSB7XG4gICAgU0VBLnBhaXIgPSBTRUEucGFpciB8fCAoYXN5bmMgKGNiLCBvcHQpID0+IHsgdHJ5IHtcblxuICAgICAgdmFyIGVjZGhTdWJ0bGUgPSBzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGU7XG4gICAgICAvLyBGaXJzdDogRUNEU0Ega2V5cyBmb3Igc2lnbmluZy92ZXJpZnlpbmcuLi5cbiAgICAgIHZhciBzYSA9IGF3YWl0IHNoaW0uc3VidGxlLmdlbmVyYXRlS2V5KHtuYW1lOiAnRUNEU0EnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSwgdHJ1ZSwgWyAnc2lnbicsICd2ZXJpZnknIF0pXG4gICAgICAudGhlbihhc3luYyAoa2V5cykgPT4ge1xuICAgICAgICAvLyBwcml2YXRlS2V5IHNjb3BlIGRvZXNuJ3QgbGVhayBvdXQgZnJvbSBoZXJlIVxuICAgICAgICAvL2NvbnN0IHsgZDogcHJpdiB9ID0gYXdhaXQgc2hpbS5zdWJ0bGUuZXhwb3J0S2V5KCdqd2snLCBrZXlzLnByaXZhdGVLZXkpXG4gICAgICAgIHZhciBrZXkgPSB7fTtcbiAgICAgICAga2V5LnByaXYgPSAoYXdhaXQgc2hpbS5zdWJ0bGUuZXhwb3J0S2V5KCdqd2snLCBrZXlzLnByaXZhdGVLZXkpKS5kO1xuICAgICAgICB2YXIgcHViID0gYXdhaXQgc2hpbS5zdWJ0bGUuZXhwb3J0S2V5KCdqd2snLCBrZXlzLnB1YmxpY0tleSk7XG4gICAgICAgIC8vY29uc3QgcHViID0gQnVmZi5mcm9tKFsgeCwgeSBdLmpvaW4oJzonKSkudG9TdHJpbmcoJ2Jhc2U2NCcpIC8vIG9sZFxuICAgICAgICBrZXkucHViID0gcHViLngrJy4nK3B1Yi55OyAvLyBuZXdcbiAgICAgICAgLy8geCBhbmQgeSBhcmUgYWxyZWFkeSBiYXNlNjRcbiAgICAgICAgLy8gcHViIGlzIFVURjggYnV0IGZpbGVuYW1lL1VSTCBzYWZlIChodHRwczovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMzk4Ni50eHQpXG4gICAgICAgIC8vIGJ1dCBzcGxpdCBvbiBhIG5vbi1iYXNlNjQgbGV0dGVyLlxuICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgfSlcbiAgICAgIFxuICAgICAgLy8gVG8gaW5jbHVkZSBQR1B2NCBraW5kIG9mIGtleUlkOlxuICAgICAgLy8gY29uc3QgcHViSWQgPSBhd2FpdCBTRUEua2V5aWQoa2V5cy5wdWIpXG4gICAgICAvLyBOZXh0OiBFQ0RIIGtleXMgZm9yIGVuY3J5cHRpb24vZGVjcnlwdGlvbi4uLlxuXG4gICAgICB0cnl7XG4gICAgICB2YXIgZGggPSBhd2FpdCBlY2RoU3VidGxlLmdlbmVyYXRlS2V5KHtuYW1lOiAnRUNESCcsIG5hbWVkQ3VydmU6ICdQLTI1Nid9LCB0cnVlLCBbJ2Rlcml2ZUtleSddKVxuICAgICAgLnRoZW4oYXN5bmMgKGtleXMpID0+IHtcbiAgICAgICAgLy8gcHJpdmF0ZUtleSBzY29wZSBkb2Vzbid0IGxlYWsgb3V0IGZyb20gaGVyZSFcbiAgICAgICAgdmFyIGtleSA9IHt9O1xuICAgICAgICBrZXkuZXByaXYgPSAoYXdhaXQgZWNkaFN1YnRsZS5leHBvcnRLZXkoJ2p3aycsIGtleXMucHJpdmF0ZUtleSkpLmQ7XG4gICAgICAgIHZhciBwdWIgPSBhd2FpdCBlY2RoU3VidGxlLmV4cG9ydEtleSgnandrJywga2V5cy5wdWJsaWNLZXkpO1xuICAgICAgICAvL2NvbnN0IGVwdWIgPSBCdWZmLmZyb20oWyBleCwgZXkgXS5qb2luKCc6JykpLnRvU3RyaW5nKCdiYXNlNjQnKSAvLyBvbGRcbiAgICAgICAga2V5LmVwdWIgPSBwdWIueCsnLicrcHViLnk7IC8vIG5ld1xuICAgICAgICAvLyBleCBhbmQgZXkgYXJlIGFscmVhZHkgYmFzZTY0XG4gICAgICAgIC8vIGVwdWIgaXMgVVRGOCBidXQgZmlsZW5hbWUvVVJMIHNhZmUgKGh0dHBzOi8vd3d3LmlldGYub3JnL3JmYy9yZmMzOTg2LnR4dClcbiAgICAgICAgLy8gYnV0IHNwbGl0IG9uIGEgbm9uLWJhc2U2NCBsZXR0ZXIuXG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgICB9KVxuICAgICAgfWNhdGNoKGUpe1xuICAgICAgICBpZihTRUEud2luZG93KXsgdGhyb3cgZSB9XG4gICAgICAgIGlmKGUgPT0gJ0Vycm9yOiBFQ0RIIGlzIG5vdCBhIHN1cHBvcnRlZCBhbGdvcml0aG0nKXsgY29uc29sZS5sb2coJ0lnbm9yaW5nIEVDREguLi4nKSB9XG4gICAgICAgIGVsc2UgeyB0aHJvdyBlIH1cbiAgICAgIH0gZGggPSBkaCB8fCB7fTtcblxuICAgICAgdmFyIHIgPSB7IHB1Yjogc2EucHViLCBwcml2OiBzYS5wcml2LCAvKiBwdWJJZCwgKi8gZXB1YjogZGguZXB1YiwgZXByaXY6IGRoLmVwcml2IH1cbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBTRUEuZXJyID0gZTtcbiAgICAgIGlmKFNFQS50aHJvdyl7IHRocm93IGUgfVxuICAgICAgaWYoY2IpeyBjYigpIH1cbiAgICAgIHJldHVybjtcbiAgICB9fSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQS5wYWlyO1xuICB9KShVU0UsICcuL3BhaXInKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgdmFyIHNoYSA9IFVTRSgnLi9zaGEyNTYnKTtcbiAgICB2YXIgdTtcblxuICAgIFNFQS5zaWduID0gU0VBLnNpZ24gfHwgKGFzeW5jIChkYXRhLCBwYWlyLCBjYiwgb3B0KSA9PiB7IHRyeSB7XG4gICAgICBvcHQgPSBvcHQgfHwge307XG4gICAgICBpZighKHBhaXJ8fG9wdCkucHJpdil7XG4gICAgICAgIGlmKCFTRUEuSSl7IHRocm93ICdObyBzaWduaW5nIGtleS4nIH1cbiAgICAgICAgcGFpciA9IGF3YWl0IFNFQS5JKG51bGwsIHt3aGF0OiBkYXRhLCBob3c6ICdzaWduJywgd2h5OiBvcHQud2h5fSk7XG4gICAgICB9XG4gICAgICBpZih1ID09PSBkYXRhKXsgdGhyb3cgJ2B1bmRlZmluZWRgIG5vdCBhbGxvd2VkLicgfVxuICAgICAgdmFyIGpzb24gPSBhd2FpdCBTLnBhcnNlKGRhdGEpO1xuICAgICAgdmFyIGNoZWNrID0gb3B0LmNoZWNrID0gb3B0LmNoZWNrIHx8IGpzb247XG4gICAgICBpZihTRUEudmVyaWZ5ICYmIChTRUEub3B0LmNoZWNrKGNoZWNrKSB8fCAoY2hlY2sgJiYgY2hlY2sucyAmJiBjaGVjay5tKSlcbiAgICAgICYmIHUgIT09IGF3YWl0IFNFQS52ZXJpZnkoY2hlY2ssIHBhaXIpKXsgLy8gZG9uJ3Qgc2lnbiBpZiB3ZSBhbHJlYWR5IHNpZ25lZCBpdC5cbiAgICAgICAgdmFyIHIgPSBhd2FpdCBTLnBhcnNlKGNoZWNrKTtcbiAgICAgICAgaWYoIW9wdC5yYXcpeyByID0gJ1NFQScgKyBhd2FpdCBzaGltLnN0cmluZ2lmeShyKSB9XG4gICAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgICAgcmV0dXJuIHI7XG4gICAgICB9XG4gICAgICB2YXIgcHViID0gcGFpci5wdWI7XG4gICAgICB2YXIgcHJpdiA9IHBhaXIucHJpdjtcbiAgICAgIHZhciBqd2sgPSBTLmp3ayhwdWIsIHByaXYpO1xuICAgICAgdmFyIGhhc2ggPSBhd2FpdCBzaGEoanNvbik7XG4gICAgICB2YXIgc2lnID0gYXdhaXQgKHNoaW0ub3NzbCB8fCBzaGltLnN1YnRsZSkuaW1wb3J0S2V5KCdqd2snLCBqd2ssIHtuYW1lOiAnRUNEU0EnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSwgZmFsc2UsIFsnc2lnbiddKVxuICAgICAgLnRoZW4oKGtleSkgPT4gKHNoaW0ub3NzbCB8fCBzaGltLnN1YnRsZSkuc2lnbih7bmFtZTogJ0VDRFNBJywgaGFzaDoge25hbWU6ICdTSEEtMjU2J319LCBrZXksIG5ldyBVaW50OEFycmF5KGhhc2gpKSkgLy8gcHJpdmF0ZUtleSBzY29wZSBkb2Vzbid0IGxlYWsgb3V0IGZyb20gaGVyZSFcbiAgICAgIHZhciByID0ge206IGpzb24sIHM6IHNoaW0uQnVmZmVyLmZyb20oc2lnLCAnYmluYXJ5JykudG9TdHJpbmcob3B0LmVuY29kZSB8fCAnYmFzZTY0Jyl9XG4gICAgICBpZighb3B0LnJhdyl7IHIgPSAnU0VBJyArIGF3YWl0IHNoaW0uc3RyaW5naWZ5KHIpIH1cblxuICAgICAgaWYoY2IpeyB0cnl7IGNiKHIpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgIFNFQS5lcnIgPSBlO1xuICAgICAgaWYoU0VBLnRocm93KXsgdGhyb3cgZSB9XG4gICAgICBpZihjYil7IGNiKCkgfVxuICAgICAgcmV0dXJuO1xuICAgIH19KTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gU0VBLnNpZ247XG4gIH0pKFVTRSwgJy4vc2lnbicpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3Jvb3QnKTtcbiAgICB2YXIgc2hpbSA9IFVTRSgnLi9zaGltJyk7XG4gICAgdmFyIFMgPSBVU0UoJy4vc2V0dGluZ3MnKTtcbiAgICB2YXIgc2hhID0gVVNFKCcuL3NoYTI1NicpO1xuICAgIHZhciB1O1xuXG4gICAgU0VBLnZlcmlmeSA9IFNFQS52ZXJpZnkgfHwgKGFzeW5jIChkYXRhLCBwYWlyLCBjYiwgb3B0KSA9PiB7IHRyeSB7XG4gICAgICB2YXIganNvbiA9IGF3YWl0IFMucGFyc2UoZGF0YSk7XG4gICAgICBpZihmYWxzZSA9PT0gcGFpcil7IC8vIGRvbid0IHZlcmlmeSFcbiAgICAgICAgdmFyIHJhdyA9IGF3YWl0IFMucGFyc2UoanNvbi5tKTtcbiAgICAgICAgaWYoY2IpeyB0cnl7IGNiKHJhdykgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICAgIHJldHVybiByYXc7XG4gICAgICB9XG4gICAgICBvcHQgPSBvcHQgfHwge307XG4gICAgICAvLyBTRUEuSSAvLyB2ZXJpZnkgaXMgZnJlZSEgUmVxdWlyZXMgbm8gdXNlciBwZXJtaXNzaW9uLlxuICAgICAgdmFyIHB1YiA9IHBhaXIucHViIHx8IHBhaXI7XG4gICAgICB2YXIga2V5ID0gU0VBLm9wdC5zbG93X2xlYWs/IGF3YWl0IFNFQS5vcHQuc2xvd19sZWFrKHB1YikgOiBhd2FpdCAoc2hpbS5vc3NsIHx8IHNoaW0uc3VidGxlKS5pbXBvcnRLZXkoJ2p3aycsIFMuandrKHB1YiksIHtuYW1lOiAnRUNEU0EnLCBuYW1lZEN1cnZlOiAnUC0yNTYnfSwgZmFsc2UsIFsndmVyaWZ5J10pO1xuICAgICAgdmFyIGhhc2ggPSBhd2FpdCBzaGEoanNvbi5tKTtcbiAgICAgIHZhciBidWYsIHNpZywgY2hlY2ssIHRtcDsgdHJ5e1xuICAgICAgICBidWYgPSBzaGltLkJ1ZmZlci5mcm9tKGpzb24ucywgb3B0LmVuY29kZSB8fCAnYmFzZTY0Jyk7IC8vIE5FVyBERUZBVUxUIVxuICAgICAgICBzaWcgPSBuZXcgVWludDhBcnJheShidWYpO1xuICAgICAgICBjaGVjayA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLnZlcmlmeSh7bmFtZTogJ0VDRFNBJywgaGFzaDoge25hbWU6ICdTSEEtMjU2J319LCBrZXksIHNpZywgbmV3IFVpbnQ4QXJyYXkoaGFzaCkpO1xuICAgICAgICBpZighY2hlY2speyB0aHJvdyBcIlNpZ25hdHVyZSBkaWQgbm90IG1hdGNoLlwiIH1cbiAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgaWYoU0VBLm9wdC5mYWxsYmFjayl7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IFNFQS5vcHQuZmFsbF92ZXJpZnkoZGF0YSwgcGFpciwgY2IsIG9wdCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciByID0gY2hlY2s/IGF3YWl0IFMucGFyc2UoanNvbi5tKSA6IHU7XG5cbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgY29uc29sZS5sb2coZSk7IC8vIG1pc21hdGNoZWQgb3duZXIgRk9SIE1BUlRUSVxuICAgICAgU0VBLmVyciA9IGU7XG4gICAgICBpZihTRUEudGhyb3cpeyB0aHJvdyBlIH1cbiAgICAgIGlmKGNiKXsgY2IoKSB9XG4gICAgICByZXR1cm47XG4gICAgfX0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUEudmVyaWZ5O1xuICAgIC8vIGxlZ2FjeSAmIG9zc2wgbWVtb3J5IGxlYWsgbWl0aWdhdGlvbjpcblxuICAgIHZhciBrbm93bktleXMgPSB7fTtcbiAgICB2YXIga2V5Rm9yUGFpciA9IFNFQS5vcHQuc2xvd19sZWFrID0gcGFpciA9PiB7XG4gICAgICBpZiAoa25vd25LZXlzW3BhaXJdKSByZXR1cm4ga25vd25LZXlzW3BhaXJdO1xuICAgICAgdmFyIGp3ayA9IFMuandrKHBhaXIpO1xuICAgICAga25vd25LZXlzW3BhaXJdID0gKHNoaW0ub3NzbCB8fCBzaGltLnN1YnRsZSkuaW1wb3J0S2V5KFwiandrXCIsIGp3aywge25hbWU6ICdFQ0RTQScsIG5hbWVkQ3VydmU6ICdQLTI1Nid9LCBmYWxzZSwgW1widmVyaWZ5XCJdKTtcbiAgICAgIHJldHVybiBrbm93bktleXNbcGFpcl07XG4gICAgfTtcblxuICAgIHZhciBPID0gU0VBLm9wdDtcbiAgICBTRUEub3B0LmZhbGxfdmVyaWZ5ID0gYXN5bmMgZnVuY3Rpb24oZGF0YSwgcGFpciwgY2IsIG9wdCwgZil7XG4gICAgICBpZihmID09PSBTRUEub3B0LmZhbGxiYWNrKXsgdGhyb3cgXCJTaWduYXR1cmUgZGlkIG5vdCBtYXRjaFwiIH0gZiA9IGYgfHwgMTtcbiAgICAgIHZhciB0bXAgPSBkYXRhfHwnJztcbiAgICAgIGRhdGEgPSBTRUEub3B0LnVucGFjayhkYXRhKSB8fCBkYXRhO1xuICAgICAgdmFyIGpzb24gPSBhd2FpdCBTLnBhcnNlKGRhdGEpLCBwdWIgPSBwYWlyLnB1YiB8fCBwYWlyLCBrZXkgPSBhd2FpdCBTRUEub3B0LnNsb3dfbGVhayhwdWIpO1xuICAgICAgdmFyIGhhc2ggPSAoZiA8PSBTRUEub3B0LmZhbGxiYWNrKT8gc2hpbS5CdWZmZXIuZnJvbShhd2FpdCBzaGltLnN1YnRsZS5kaWdlc3Qoe25hbWU6ICdTSEEtMjU2J30sIG5ldyBzaGltLlRleHRFbmNvZGVyKCkuZW5jb2RlKGF3YWl0IFMucGFyc2UoanNvbi5tKSkpKSA6IGF3YWl0IHNoYShqc29uLm0pOyAvLyB0aGlzIGxpbmUgaXMgb2xkIGJhZCBidWdneSBjb2RlIGJ1dCBuZWNlc3NhcnkgZm9yIG9sZCBjb21wYXRpYmlsaXR5LlxuICAgICAgdmFyIGJ1ZjsgdmFyIHNpZzsgdmFyIGNoZWNrOyB0cnl7XG4gICAgICAgIGJ1ZiA9IHNoaW0uQnVmZmVyLmZyb20oanNvbi5zLCBvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKSAvLyBORVcgREVGQVVMVCFcbiAgICAgICAgc2lnID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgICAgICBjaGVjayA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLnZlcmlmeSh7bmFtZTogJ0VDRFNBJywgaGFzaDoge25hbWU6ICdTSEEtMjU2J319LCBrZXksIHNpZywgbmV3IFVpbnQ4QXJyYXkoaGFzaCkpXG4gICAgICAgIGlmKCFjaGVjayl7IHRocm93IFwiU2lnbmF0dXJlIGRpZCBub3QgbWF0Y2guXCIgfVxuICAgICAgfWNhdGNoKGUpeyB0cnl7XG4gICAgICAgIGJ1ZiA9IHNoaW0uQnVmZmVyLmZyb20oanNvbi5zLCAndXRmOCcpIC8vIEFVVE8gQkFDS1dBUkQgT0xEIFVURjggREFUQSFcbiAgICAgICAgc2lnID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgICAgICBjaGVjayA9IGF3YWl0IChzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGUpLnZlcmlmeSh7bmFtZTogJ0VDRFNBJywgaGFzaDoge25hbWU6ICdTSEEtMjU2J319LCBrZXksIHNpZywgbmV3IFVpbnQ4QXJyYXkoaGFzaCkpXG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgaWYoIWNoZWNrKXsgdGhyb3cgXCJTaWduYXR1cmUgZGlkIG5vdCBtYXRjaC5cIiB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciByID0gY2hlY2s/IGF3YWl0IFMucGFyc2UoanNvbi5tKSA6IHU7XG4gICAgICBPLmZhbGxfc291bCA9IHRtcFsnIyddOyBPLmZhbGxfa2V5ID0gdG1wWycuJ107IE8uZmFsbF92YWwgPSBkYXRhOyBPLmZhbGxfc3RhdGUgPSB0bXBbJz4nXTtcbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICBTRUEub3B0LmZhbGxiYWNrID0gMjtcblxuICB9KShVU0UsICcuL3ZlcmlmeScpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgc2hpbSA9IFVTRSgnLi9zaGltJyk7XG4gICAgdmFyIFMgPSBVU0UoJy4vc2V0dGluZ3MnKTtcbiAgICB2YXIgc2hhMjU2aGFzaCA9IFVTRSgnLi9zaGEyNTYnKTtcblxuICAgIGNvbnN0IGltcG9ydEdlbiA9IGFzeW5jIChrZXksIHNhbHQsIG9wdCkgPT4ge1xuICAgICAgLy9jb25zdCBjb21ibyA9IHNoaW0uQnVmZmVyLmNvbmNhdChbc2hpbS5CdWZmZXIuZnJvbShrZXksICd1dGY4JyksIHNhbHQgfHwgc2hpbS5yYW5kb20oOCldKS50b1N0cmluZygndXRmOCcpIC8vIG9sZFxuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgY29uc3QgY29tYm8gPSBrZXkgKyAoc2FsdCB8fCBzaGltLnJhbmRvbSg4KSkudG9TdHJpbmcoJ3V0ZjgnKTsgLy8gbmV3XG4gICAgICBjb25zdCBoYXNoID0gc2hpbS5CdWZmZXIuZnJvbShhd2FpdCBzaGEyNTZoYXNoKGNvbWJvKSwgJ2JpbmFyeScpXG4gICAgICBcbiAgICAgIGNvbnN0IGp3a0tleSA9IFMua2V5VG9Kd2soaGFzaCkgICAgICBcbiAgICAgIHJldHVybiBhd2FpdCBzaGltLnN1YnRsZS5pbXBvcnRLZXkoJ2p3aycsIGp3a0tleSwge25hbWU6J0FFUy1HQ00nfSwgZmFsc2UsIFsnZW5jcnlwdCcsICdkZWNyeXB0J10pXG4gICAgfVxuICAgIG1vZHVsZS5leHBvcnRzID0gaW1wb3J0R2VuO1xuICB9KShVU0UsICcuL2Flc2tleScpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3Jvb3QnKTtcbiAgICB2YXIgc2hpbSA9IFVTRSgnLi9zaGltJyk7XG4gICAgdmFyIFMgPSBVU0UoJy4vc2V0dGluZ3MnKTtcbiAgICB2YXIgYWVza2V5ID0gVVNFKCcuL2Flc2tleScpO1xuICAgIHZhciB1O1xuXG4gICAgU0VBLmVuY3J5cHQgPSBTRUEuZW5jcnlwdCB8fCAoYXN5bmMgKGRhdGEsIHBhaXIsIGNiLCBvcHQpID0+IHsgdHJ5IHtcbiAgICAgIG9wdCA9IG9wdCB8fCB7fTtcbiAgICAgIHZhciBrZXkgPSAocGFpcnx8b3B0KS5lcHJpdiB8fCBwYWlyO1xuICAgICAgaWYodSA9PT0gZGF0YSl7IHRocm93ICdgdW5kZWZpbmVkYCBub3QgYWxsb3dlZC4nIH1cbiAgICAgIGlmKCFrZXkpe1xuICAgICAgICBpZighU0VBLkkpeyB0aHJvdyAnTm8gZW5jcnlwdGlvbiBrZXkuJyB9XG4gICAgICAgIHBhaXIgPSBhd2FpdCBTRUEuSShudWxsLCB7d2hhdDogZGF0YSwgaG93OiAnZW5jcnlwdCcsIHdoeTogb3B0LndoeX0pO1xuICAgICAgICBrZXkgPSBwYWlyLmVwcml2IHx8IHBhaXI7XG4gICAgICB9XG4gICAgICB2YXIgbXNnID0gKHR5cGVvZiBkYXRhID09ICdzdHJpbmcnKT8gZGF0YSA6IGF3YWl0IHNoaW0uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgdmFyIHJhbmQgPSB7czogc2hpbS5yYW5kb20oOSksIGl2OiBzaGltLnJhbmRvbSgxNSl9OyAvLyBjb25zaWRlciBtYWtpbmcgdGhpcyA5IGFuZCAxNSBvciAxOCBvciAxMiB0byByZWR1Y2UgPT0gcGFkZGluZy5cbiAgICAgIHZhciBjdCA9IGF3YWl0IGFlc2tleShrZXksIHJhbmQucywgb3B0KS50aGVuKChhZXMpID0+ICgvKnNoaW0ub3NzbCB8fCovIHNoaW0uc3VidGxlKS5lbmNyeXB0KHsgLy8gS2VlcGluZyB0aGUgQUVTIGtleSBzY29wZSBhcyBwcml2YXRlIGFzIHBvc3NpYmxlLi4uXG4gICAgICAgIG5hbWU6IG9wdC5uYW1lIHx8ICdBRVMtR0NNJywgaXY6IG5ldyBVaW50OEFycmF5KHJhbmQuaXYpXG4gICAgICB9LCBhZXMsIG5ldyBzaGltLlRleHRFbmNvZGVyKCkuZW5jb2RlKG1zZykpKTtcbiAgICAgIHZhciByID0ge1xuICAgICAgICBjdDogc2hpbS5CdWZmZXIuZnJvbShjdCwgJ2JpbmFyeScpLnRvU3RyaW5nKG9wdC5lbmNvZGUgfHwgJ2Jhc2U2NCcpLFxuICAgICAgICBpdjogcmFuZC5pdi50b1N0cmluZyhvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKSxcbiAgICAgICAgczogcmFuZC5zLnRvU3RyaW5nKG9wdC5lbmNvZGUgfHwgJ2Jhc2U2NCcpXG4gICAgICB9XG4gICAgICBpZighb3B0LnJhdyl7IHIgPSAnU0VBJyArIGF3YWl0IHNoaW0uc3RyaW5naWZ5KHIpIH1cblxuICAgICAgaWYoY2IpeyB0cnl7IGNiKHIpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSBjYXRjaChlKSB7IFxuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBTRUEuZXJyID0gZTtcbiAgICAgIGlmKFNFQS50aHJvdyl7IHRocm93IGUgfVxuICAgICAgaWYoY2IpeyBjYigpIH1cbiAgICAgIHJldHVybjtcbiAgICB9fSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQS5lbmNyeXB0O1xuICB9KShVU0UsICcuL2VuY3J5cHQnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgdmFyIGFlc2tleSA9IFVTRSgnLi9hZXNrZXknKTtcblxuICAgIFNFQS5kZWNyeXB0ID0gU0VBLmRlY3J5cHQgfHwgKGFzeW5jIChkYXRhLCBwYWlyLCBjYiwgb3B0KSA9PiB7IHRyeSB7XG4gICAgICBvcHQgPSBvcHQgfHwge307XG4gICAgICB2YXIga2V5ID0gKHBhaXJ8fG9wdCkuZXByaXYgfHwgcGFpcjtcbiAgICAgIGlmKCFrZXkpe1xuICAgICAgICBpZighU0VBLkkpeyB0aHJvdyAnTm8gZGVjcnlwdGlvbiBrZXkuJyB9XG4gICAgICAgIHBhaXIgPSBhd2FpdCBTRUEuSShudWxsLCB7d2hhdDogZGF0YSwgaG93OiAnZGVjcnlwdCcsIHdoeTogb3B0LndoeX0pO1xuICAgICAgICBrZXkgPSBwYWlyLmVwcml2IHx8IHBhaXI7XG4gICAgICB9XG4gICAgICB2YXIganNvbiA9IGF3YWl0IFMucGFyc2UoZGF0YSk7XG4gICAgICB2YXIgYnVmLCBidWZpdiwgYnVmY3Q7IHRyeXtcbiAgICAgICAgYnVmID0gc2hpbS5CdWZmZXIuZnJvbShqc29uLnMsIG9wdC5lbmNvZGUgfHwgJ2Jhc2U2NCcpO1xuICAgICAgICBidWZpdiA9IHNoaW0uQnVmZmVyLmZyb20oanNvbi5pdiwgb3B0LmVuY29kZSB8fCAnYmFzZTY0Jyk7XG4gICAgICAgIGJ1ZmN0ID0gc2hpbS5CdWZmZXIuZnJvbShqc29uLmN0LCBvcHQuZW5jb2RlIHx8ICdiYXNlNjQnKTtcbiAgICAgICAgdmFyIGN0ID0gYXdhaXQgYWVza2V5KGtleSwgYnVmLCBvcHQpLnRoZW4oKGFlcykgPT4gKC8qc2hpbS5vc3NsIHx8Ki8gc2hpbS5zdWJ0bGUpLmRlY3J5cHQoeyAgLy8gS2VlcGluZyBhZXNLZXkgc2NvcGUgYXMgcHJpdmF0ZSBhcyBwb3NzaWJsZS4uLlxuICAgICAgICAgIG5hbWU6IG9wdC5uYW1lIHx8ICdBRVMtR0NNJywgaXY6IG5ldyBVaW50OEFycmF5KGJ1Zml2KSwgdGFnTGVuZ3RoOiAxMjhcbiAgICAgICAgfSwgYWVzLCBuZXcgVWludDhBcnJheShidWZjdCkpKTtcbiAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgaWYoJ3V0ZjgnID09PSBvcHQuZW5jb2RlKXsgdGhyb3cgXCJDb3VsZCBub3QgZGVjcnlwdFwiIH1cbiAgICAgICAgaWYoU0VBLm9wdC5mYWxsYmFjayl7XG4gICAgICAgICAgb3B0LmVuY29kZSA9ICd1dGY4JztcbiAgICAgICAgICByZXR1cm4gYXdhaXQgU0VBLmRlY3J5cHQoZGF0YSwgcGFpciwgY2IsIG9wdCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciByID0gYXdhaXQgUy5wYXJzZShuZXcgc2hpbS5UZXh0RGVjb2RlcigndXRmOCcpLmRlY29kZShjdCkpO1xuICAgICAgaWYoY2IpeyB0cnl7IGNiKHIpIH1jYXRjaChlKXtjb25zb2xlLmxvZyhlKX0gfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSBjYXRjaChlKSB7IFxuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBTRUEuZXJyID0gZTtcbiAgICAgIGlmKFNFQS50aHJvdyl7IHRocm93IGUgfVxuICAgICAgaWYoY2IpeyBjYigpIH1cbiAgICAgIHJldHVybjtcbiAgICB9fSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQS5kZWNyeXB0O1xuICB9KShVU0UsICcuL2RlY3J5cHQnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgdmFyIHNoaW0gPSBVU0UoJy4vc2hpbScpO1xuICAgIHZhciBTID0gVVNFKCcuL3NldHRpbmdzJyk7XG4gICAgLy8gRGVyaXZlIHNoYXJlZCBzZWNyZXQgZnJvbSBvdGhlcidzIHB1YiBhbmQgbXkgZXB1Yi9lcHJpdiBcbiAgICBTRUEuc2VjcmV0ID0gU0VBLnNlY3JldCB8fCAoYXN5bmMgKGtleSwgcGFpciwgY2IsIG9wdCkgPT4geyB0cnkge1xuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgaWYoIXBhaXIgfHwgIXBhaXIuZXByaXYgfHwgIXBhaXIuZXB1Yil7XG4gICAgICAgIGlmKCFTRUEuSSl7IHRocm93ICdObyBzZWNyZXQgbWl4LicgfVxuICAgICAgICBwYWlyID0gYXdhaXQgU0VBLkkobnVsbCwge3doYXQ6IGtleSwgaG93OiAnc2VjcmV0Jywgd2h5OiBvcHQud2h5fSk7XG4gICAgICB9XG4gICAgICB2YXIgcHViID0ga2V5LmVwdWIgfHwga2V5O1xuICAgICAgdmFyIGVwdWIgPSBwYWlyLmVwdWI7XG4gICAgICB2YXIgZXByaXYgPSBwYWlyLmVwcml2O1xuICAgICAgdmFyIGVjZGhTdWJ0bGUgPSBzaGltLm9zc2wgfHwgc2hpbS5zdWJ0bGU7XG4gICAgICB2YXIgcHViS2V5RGF0YSA9IGtleXNUb0VjZGhKd2socHViKTtcbiAgICAgIHZhciBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBwdWJsaWM6IGF3YWl0IGVjZGhTdWJ0bGUuaW1wb3J0S2V5KC4uLnB1YktleURhdGEsIHRydWUsIFtdKSB9LHtuYW1lOiAnRUNESCcsIG5hbWVkQ3VydmU6ICdQLTI1Nid9KTsgLy8gVGhhbmtzIHRvIEBzaXJweSAhXG4gICAgICB2YXIgcHJpdktleURhdGEgPSBrZXlzVG9FY2RoSndrKGVwdWIsIGVwcml2KTtcbiAgICAgIHZhciBkZXJpdmVkID0gYXdhaXQgZWNkaFN1YnRsZS5pbXBvcnRLZXkoLi4ucHJpdktleURhdGEsIGZhbHNlLCBbJ2Rlcml2ZUJpdHMnXSkudGhlbihhc3luYyAocHJpdktleSkgPT4ge1xuICAgICAgICAvLyBwcml2YXRlS2V5IHNjb3BlIGRvZXNuJ3QgbGVhayBvdXQgZnJvbSBoZXJlIVxuICAgICAgICB2YXIgZGVyaXZlZEJpdHMgPSBhd2FpdCBlY2RoU3VidGxlLmRlcml2ZUJpdHMocHJvcHMsIHByaXZLZXksIDI1Nik7XG4gICAgICAgIHZhciByYXdCaXRzID0gbmV3IFVpbnQ4QXJyYXkoZGVyaXZlZEJpdHMpO1xuICAgICAgICB2YXIgZGVyaXZlZEtleSA9IGF3YWl0IGVjZGhTdWJ0bGUuaW1wb3J0S2V5KCdyYXcnLCByYXdCaXRzLHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LCB0cnVlLCBbICdlbmNyeXB0JywgJ2RlY3J5cHQnIF0pO1xuICAgICAgICByZXR1cm4gZWNkaFN1YnRsZS5leHBvcnRLZXkoJ2p3aycsIGRlcml2ZWRLZXkpLnRoZW4oKHsgayB9KSA9PiBrKTtcbiAgICAgIH0pXG4gICAgICB2YXIgciA9IGRlcml2ZWQ7XG4gICAgICBpZihjYil7IHRyeXsgY2IocikgfWNhdGNoKGUpe2NvbnNvbGUubG9nKGUpfSB9XG4gICAgICByZXR1cm4gcjtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgU0VBLmVyciA9IGU7XG4gICAgICBpZihTRUEudGhyb3cpeyB0aHJvdyBlIH1cbiAgICAgIGlmKGNiKXsgY2IoKSB9XG4gICAgICByZXR1cm47XG4gICAgfX0pO1xuXG4gICAgLy8gY2FuIHRoaXMgYmUgcmVwbGFjZWQgd2l0aCBzZXR0aW5ncy5qd2s/XG4gICAgdmFyIGtleXNUb0VjZGhKd2sgPSAocHViLCBkKSA9PiB7IC8vIGQgPT09IHByaXZcbiAgICAgIC8vdmFyIFsgeCwgeSBdID0gc2hpbS5CdWZmZXIuZnJvbShwdWIsICdiYXNlNjQnKS50b1N0cmluZygndXRmOCcpLnNwbGl0KCc6JykgLy8gb2xkXG4gICAgICB2YXIgWyB4LCB5IF0gPSBwdWIuc3BsaXQoJy4nKSAvLyBuZXdcbiAgICAgIHZhciBqd2sgPSBkID8geyBkOiBkIH0gOiB7fVxuICAgICAgcmV0dXJuIFsgIC8vIFVzZSB3aXRoIHNwcmVhZCByZXR1cm5lZCB2YWx1ZS4uLlxuICAgICAgICAnandrJyxcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICBqd2ssXG4gICAgICAgICAgeyB4OiB4LCB5OiB5LCBrdHk6ICdFQycsIGNydjogJ1AtMjU2JywgZXh0OiB0cnVlIH1cbiAgICAgICAgKSwgLy8gPz8/IHJlZmFjdG9yXG4gICAgICAgIHtuYW1lOiAnRUNESCcsIG5hbWVkQ3VydmU6ICdQLTI1Nid9XG4gICAgICBdXG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUEuc2VjcmV0O1xuICB9KShVU0UsICcuL3NlY3JldCcpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3Jvb3QnKTtcbiAgICAvLyBUaGlzIGlzIHRvIGNlcnRpZnkgdGhhdCBhIGdyb3VwIG9mIFwiY2VydGlmaWNhbnRzXCIgY2FuIFwicHV0XCIgYW55dGhpbmcgYXQgYSBncm91cCBvZiBtYXRjaGVkIFwicGF0aHNcIiB0byB0aGUgY2VydGlmaWNhdGUgYXV0aG9yaXR5J3MgZ3JhcGhcbiAgICBTRUEuY2VydGlmeSA9IFNFQS5jZXJ0aWZ5IHx8IChhc3luYyAoY2VydGlmaWNhbnRzLCBwb2xpY3kgPSB7fSwgYXV0aG9yaXR5LCBjYiwgb3B0ID0ge30pID0+IHsgdHJ5IHtcbiAgICAgIC8qXG4gICAgICBUaGUgQ2VydGlmeSBQcm90b2NvbCB3YXMgbWFkZSBvdXQgb2YgbG92ZSBieSBhIFZpZXRuYW1lc2UgY29kZSBlbnRodXNpYXN0LiBWaWV0bmFtZXNlIHBlb3BsZSBhcm91bmQgdGhlIHdvcmxkIGRlc2VydmUgcmVzcGVjdCFcbiAgICAgIElNUE9SVEFOVDogQSBDZXJ0aWZpY2F0ZSBpcyBsaWtlIGEgU2lnbmF0dXJlLiBObyBvbmUga25vd3Mgd2hvIChhdXRob3JpdHkpIGNyZWF0ZWQvc2lnbmVkIGEgY2VydCB1bnRpbCB5b3UgcHV0IGl0IGludG8gdGhlaXIgZ3JhcGguXG4gICAgICBcImNlcnRpZmljYW50c1wiOiAnKicgb3IgYSBTdHJpbmcgKEJvYi5wdWIpIHx8IGFuIE9iamVjdCB0aGF0IGNvbnRhaW5zIFwicHViXCIgYXMgYSBrZXkgfHwgYW4gYXJyYXkgb2YgW29iamVjdCB8fCBzdHJpbmddLiBUaGVzZSBwZW9wbGUgd2lsbCBoYXZlIHRoZSByaWdodHMuXG4gICAgICBcInBvbGljeVwiOiBBIHN0cmluZyAoJ2luYm94JyksIG9yIGEgUkFEL0xFWCBvYmplY3QgeycqJzogJ2luYm94J30sIG9yIGFuIEFycmF5IG9mIFJBRC9MRVggb2JqZWN0cyBvciBzdHJpbmdzLiBSQUQvTEVYIG9iamVjdCBjYW4gY29udGFpbiBrZXkgXCI/XCIgd2l0aCBpbmRleE9mKFwiKlwiKSA+IC0xIHRvIGZvcmNlIGtleSBlcXVhbHMgY2VydGlmaWNhbnQgcHViLiBUaGlzIHJ1bGUgaXMgdXNlZCB0byBjaGVjayBhZ2FpbnN0IHNvdWwrJy8nK2tleSB1c2luZyBHdW4udGV4dC5tYXRjaCBvciBTdHJpbmcubWF0Y2guXG4gICAgICBcImF1dGhvcml0eVwiOiBLZXkgcGFpciBvciBwcml2IG9mIHRoZSBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuXG4gICAgICBcImNiXCI6IEEgY2FsbGJhY2sgZnVuY3Rpb24gYWZ0ZXIgYWxsIHRoaW5ncyBhcmUgZG9uZS5cbiAgICAgIFwib3B0XCI6IElmIG9wdC5leHBpcnkgKGEgdGltZXN0YW1wKSBpcyBzZXQsIFNFQSB3b24ndCBzeW5jIGRhdGEgYWZ0ZXIgb3B0LmV4cGlyeS4gSWYgb3B0LmJsb2NrIGlzIHNldCwgU0VBIHdpbGwgbG9vayBmb3IgYmxvY2sgYmVmb3JlIHN5bmNpbmcuXG4gICAgICAqL1xuICAgICAgY29uc29sZS5sb2coJ1NFQS5jZXJ0aWZ5KCkgaXMgYW4gZWFybHkgZXhwZXJpbWVudGFsIGNvbW11bml0eSBzdXBwb3J0ZWQgbWV0aG9kIHRoYXQgbWF5IGNoYW5nZSBBUEkgYmVoYXZpb3Igd2l0aG91dCB3YXJuaW5nIGluIGFueSBmdXR1cmUgdmVyc2lvbi4nKVxuXG4gICAgICBjZXJ0aWZpY2FudHMgPSAoKCkgPT4ge1xuICAgICAgICB2YXIgZGF0YSA9IFtdXG4gICAgICAgIGlmIChjZXJ0aWZpY2FudHMpIHtcbiAgICAgICAgICBpZiAoKHR5cGVvZiBjZXJ0aWZpY2FudHMgPT09ICdzdHJpbmcnIHx8IEFycmF5LmlzQXJyYXkoY2VydGlmaWNhbnRzKSkgJiYgY2VydGlmaWNhbnRzLmluZGV4T2YoJyonKSA+IC0xKSByZXR1cm4gJyonXG4gICAgICAgICAgaWYgKHR5cGVvZiBjZXJ0aWZpY2FudHMgPT09ICdzdHJpbmcnKSByZXR1cm4gY2VydGlmaWNhbnRzXG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2VydGlmaWNhbnRzKSkge1xuICAgICAgICAgICAgaWYgKGNlcnRpZmljYW50cy5sZW5ndGggPT09IDEgJiYgY2VydGlmaWNhbnRzWzBdKSByZXR1cm4gdHlwZW9mIGNlcnRpZmljYW50c1swXSA9PT0gJ29iamVjdCcgJiYgY2VydGlmaWNhbnRzWzBdLnB1YiA/IGNlcnRpZmljYW50c1swXS5wdWIgOiB0eXBlb2YgY2VydGlmaWNhbnRzWzBdID09PSAnc3RyaW5nJyA/IGNlcnRpZmljYW50c1swXSA6IG51bGxcbiAgICAgICAgICAgIGNlcnRpZmljYW50cy5tYXAoY2VydGlmaWNhbnQgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGNlcnRpZmljYW50ID09PSdzdHJpbmcnKSBkYXRhLnB1c2goY2VydGlmaWNhbnQpXG4gICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBjZXJ0aWZpY2FudCA9PT0gJ29iamVjdCcgJiYgY2VydGlmaWNhbnQucHViKSBkYXRhLnB1c2goY2VydGlmaWNhbnQucHViKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGNlcnRpZmljYW50cyA9PT0gJ29iamVjdCcgJiYgY2VydGlmaWNhbnRzLnB1YikgcmV0dXJuIGNlcnRpZmljYW50cy5wdWJcbiAgICAgICAgICByZXR1cm4gZGF0YS5sZW5ndGggPiAwID8gZGF0YSA6IG51bGxcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH0pKClcblxuICAgICAgaWYgKCFjZXJ0aWZpY2FudHMpIHJldHVybiBjb25zb2xlLmxvZyhcIk5vIGNlcnRpZmljYW50IGZvdW5kLlwiKVxuXG4gICAgICBjb25zdCBleHBpcnkgPSBvcHQuZXhwaXJ5ICYmICh0eXBlb2Ygb3B0LmV4cGlyeSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIG9wdC5leHBpcnkgPT09ICdzdHJpbmcnKSA/IHBhcnNlRmxvYXQob3B0LmV4cGlyeSkgOiBudWxsXG4gICAgICBjb25zdCByZWFkUG9saWN5ID0gKHBvbGljeSB8fCB7fSkucmVhZCA/IHBvbGljeS5yZWFkIDogbnVsbFxuICAgICAgY29uc3Qgd3JpdGVQb2xpY3kgPSAocG9saWN5IHx8IHt9KS53cml0ZSA/IHBvbGljeS53cml0ZSA6IHR5cGVvZiBwb2xpY3kgPT09ICdzdHJpbmcnIHx8IEFycmF5LmlzQXJyYXkocG9saWN5KSB8fCBwb2xpY3lbXCIrXCJdIHx8IHBvbGljeVtcIiNcIl0gfHwgcG9saWN5W1wiLlwiXSB8fCBwb2xpY3lbXCI9XCJdIHx8IHBvbGljeVtcIipcIl0gfHwgcG9saWN5W1wiPlwiXSB8fCBwb2xpY3lbXCI8XCJdID8gcG9saWN5IDogbnVsbFxuICAgICAgLy8gVGhlIFwiYmxhY2tsaXN0XCIgZmVhdHVyZSBpcyBub3cgcmVuYW1lZCB0byBcImJsb2NrXCIuIFdoeSA/IEJFQ0FVU0UgQkxBQ0sgTElWRVMgTUFUVEVSIVxuICAgICAgLy8gV2UgY2FuIG5vdyB1c2UgMyBrZXlzOiBibG9jaywgYmxhY2tsaXN0LCBiYW5cbiAgICAgIGNvbnN0IGJsb2NrID0gKG9wdCB8fCB7fSkuYmxvY2sgfHwgKG9wdCB8fCB7fSkuYmxhY2tsaXN0IHx8IChvcHQgfHwge30pLmJhbiB8fCB7fVxuICAgICAgY29uc3QgcmVhZEJsb2NrID0gYmxvY2sucmVhZCAmJiAodHlwZW9mIGJsb2NrLnJlYWQgPT09ICdzdHJpbmcnIHx8IChibG9jay5yZWFkIHx8IHt9KVsnIyddKSA/IGJsb2NrLnJlYWQgOiBudWxsXG4gICAgICBjb25zdCB3cml0ZUJsb2NrID0gdHlwZW9mIGJsb2NrID09PSAnc3RyaW5nJyA/IGJsb2NrIDogYmxvY2sud3JpdGUgJiYgKHR5cGVvZiBibG9jay53cml0ZSA9PT0gJ3N0cmluZycgfHwgYmxvY2sud3JpdGVbJyMnXSkgPyBibG9jay53cml0ZSA6IG51bGxcblxuICAgICAgaWYgKCFyZWFkUG9saWN5ICYmICF3cml0ZVBvbGljeSkgcmV0dXJuIGNvbnNvbGUubG9nKFwiTm8gcG9saWN5IGZvdW5kLlwiKVxuXG4gICAgICAvLyByZXNlcnZlZCBrZXlzOiBjLCBlLCByLCB3LCByYiwgd2JcbiAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGM6IGNlcnRpZmljYW50cyxcbiAgICAgICAgLi4uKGV4cGlyeSA/IHtlOiBleHBpcnl9IDoge30pLCAvLyBpbmplY3QgZXhwaXJ5IGlmIHBvc3NpYmxlXG4gICAgICAgIC4uLihyZWFkUG9saWN5ID8ge3I6IHJlYWRQb2xpY3kgfSAgOiB7fSksIC8vIFwiclwiIHN0YW5kcyBmb3IgcmVhZCwgd2hpY2ggbWVhbnMgcmVhZCBwZXJtaXNzaW9uLlxuICAgICAgICAuLi4od3JpdGVQb2xpY3kgPyB7dzogd3JpdGVQb2xpY3l9IDoge30pLCAvLyBcIndcIiBzdGFuZHMgZm9yIHdyaXRlLCB3aGljaCBtZWFucyB3cml0ZSBwZXJtaXNzaW9uLlxuICAgICAgICAuLi4ocmVhZEJsb2NrID8ge3JiOiByZWFkQmxvY2t9IDoge30pLCAvLyBpbmplY3QgUkVBRCBibG9jayBpZiBwb3NzaWJsZVxuICAgICAgICAuLi4od3JpdGVCbG9jayA/IHt3Yjogd3JpdGVCbG9ja30gOiB7fSksIC8vIGluamVjdCBXUklURSBibG9jayBpZiBwb3NzaWJsZVxuICAgICAgfSlcblxuICAgICAgY29uc3QgY2VydGlmaWNhdGUgPSBhd2FpdCBTRUEuc2lnbihkYXRhLCBhdXRob3JpdHksIG51bGwsIHtyYXc6MX0pXG5cbiAgICAgIHZhciByID0gY2VydGlmaWNhdGVcbiAgICAgIGlmKCFvcHQucmF3KXsgciA9ICdTRUEnK0pTT04uc3RyaW5naWZ5KHIpIH1cbiAgICAgIGlmKGNiKXsgdHJ5eyBjYihyKSB9Y2F0Y2goZSl7Y29uc29sZS5sb2coZSl9IH1cbiAgICAgIHJldHVybiByO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgU0VBLmVyciA9IGU7XG4gICAgICBpZihTRUEudGhyb3cpeyB0aHJvdyBlIH1cbiAgICAgIGlmKGNiKXsgY2IoKSB9XG4gICAgICByZXR1cm47XG4gICAgfX0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTRUEuY2VydGlmeTtcbiAgfSkoVVNFLCAnLi9jZXJ0aWZ5Jyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBzaGltID0gVVNFKCcuL3NoaW0nKTtcbiAgICAvLyBQcmFjdGljYWwgZXhhbXBsZXMgYWJvdXQgdXNhZ2UgZm91bmQgaW4gdGVzdHMuXG4gICAgdmFyIFNFQSA9IFVTRSgnLi9yb290Jyk7XG4gICAgU0VBLndvcmsgPSBVU0UoJy4vd29yaycpO1xuICAgIFNFQS5zaWduID0gVVNFKCcuL3NpZ24nKTtcbiAgICBTRUEudmVyaWZ5ID0gVVNFKCcuL3ZlcmlmeScpO1xuICAgIFNFQS5lbmNyeXB0ID0gVVNFKCcuL2VuY3J5cHQnKTtcbiAgICBTRUEuZGVjcnlwdCA9IFVTRSgnLi9kZWNyeXB0Jyk7XG4gICAgU0VBLmNlcnRpZnkgPSBVU0UoJy4vY2VydGlmeScpO1xuICAgIC8vU0VBLm9wdC5hZXNrZXkgPSBVU0UoJy4vYWVza2V5Jyk7IC8vIG5vdCBvZmZpY2lhbCEgLy8gdGhpcyBjYXVzZXMgcHJvYmxlbXMgaW4gbGF0ZXN0IFdlYkNyeXB0by5cblxuICAgIFNFQS5yYW5kb20gPSBTRUEucmFuZG9tIHx8IHNoaW0ucmFuZG9tO1xuXG4gICAgLy8gVGhpcyBpcyBCdWZmZXIgdXNlZCBpbiBTRUEgYW5kIHVzYWJsZSBmcm9tIEd1bi9TRUEgYXBwbGljYXRpb24gYWxzby5cbiAgICAvLyBGb3IgZG9jdW1lbnRhdGlvbiBzZWUgaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9idWZmZXIuaHRtbFxuICAgIFNFQS5CdWZmZXIgPSBTRUEuQnVmZmVyIHx8IFVTRSgnLi9idWZmZXInKTtcblxuICAgIC8vIFRoZXNlIFNFQSBmdW5jdGlvbnMgc3VwcG9ydCBub3cgb255IFByb21pc2VzIG9yXG4gICAgLy8gYXN5bmMvYXdhaXQgKGNvbXBhdGlibGUpIGNvZGUsIHVzZSB0aG9zZSBsaWtlIFByb21pc2VzLlxuICAgIC8vXG4gICAgLy8gQ3JlYXRlcyBhIHdyYXBwZXIgbGlicmFyeSBhcm91bmQgV2ViIENyeXB0byBBUElcbiAgICAvLyBmb3IgdmFyaW91cyBBRVMsIEVDRFNBLCBQQktERjIgZnVuY3Rpb25zIHdlIGNhbGxlZCBhYm92ZS5cbiAgICAvLyBDYWxjdWxhdGUgcHVibGljIGtleSBLZXlJRCBha2EgUEdQdjQgKHJlc3VsdDogOCBieXRlcyBhcyBoZXggc3RyaW5nKVxuICAgIFNFQS5rZXlpZCA9IFNFQS5rZXlpZCB8fCAoYXN5bmMgKHB1YikgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gYmFzZTY0KCdiYXNlNjQoeCk6YmFzZTY0KHkpJykgPT4gc2hpbS5CdWZmZXIoeHkpXG4gICAgICAgIGNvbnN0IHBiID0gc2hpbS5CdWZmZXIuY29uY2F0KFxuICAgICAgICAgIHB1Yi5yZXBsYWNlKC8tL2csICcrJykucmVwbGFjZSgvXy9nLCAnLycpLnNwbGl0KCcuJylcbiAgICAgICAgICAubWFwKCh0KSA9PiBzaGltLkJ1ZmZlci5mcm9tKHQsICdiYXNlNjQnKSlcbiAgICAgICAgKVxuICAgICAgICAvLyBpZCBpcyBQR1B2NCBjb21wbGlhbnQgcmF3IGtleVxuICAgICAgICBjb25zdCBpZCA9IHNoaW0uQnVmZmVyLmNvbmNhdChbXG4gICAgICAgICAgc2hpbS5CdWZmZXIuZnJvbShbMHg5OSwgcGIubGVuZ3RoIC8gMHgxMDAsIHBiLmxlbmd0aCAlIDB4MTAwXSksIHBiXG4gICAgICAgIF0pXG4gICAgICAgIGNvbnN0IHNoYTEgPSBhd2FpdCBzaGExaGFzaChpZClcbiAgICAgICAgY29uc3QgaGFzaCA9IHNoaW0uQnVmZmVyLmZyb20oc2hhMSwgJ2JpbmFyeScpXG4gICAgICAgIHJldHVybiBoYXNoLnRvU3RyaW5nKCdoZXgnLCBoYXNoLmxlbmd0aCAtIDgpICAvLyAxNi1iaXQgSUQgYXMgaGV4XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBhbGwgZG9uZSFcbiAgICAvLyBPYnZpb3VzbHkgaXQgaXMgbWlzc2luZyBNQU5ZIG5lY2Vzc2FyeSBmZWF0dXJlcy4gVGhpcyBpcyBvbmx5IGFuIGFscGhhIHJlbGVhc2UuXG4gICAgLy8gUGxlYXNlIGV4cGVyaW1lbnQgd2l0aCBpdCwgYXVkaXQgd2hhdCBJJ3ZlIGRvbmUgc28gZmFyLCBhbmQgY29tcGxhaW4gYWJvdXQgd2hhdCBuZWVkcyB0byBiZSBhZGRlZC5cbiAgICAvLyBTRUEgc2hvdWxkIGJlIGEgZnVsbCBzdWl0ZSB0aGF0IGlzIGVhc3kgYW5kIHNlYW1sZXNzIHRvIHVzZS5cbiAgICAvLyBBZ2Fpbiwgc2Nyb2xsIG5hZXIgdGhlIHRvcCwgd2hlcmUgSSBwcm92aWRlIGFuIEVYQU1QTEUgb2YgaG93IHRvIGNyZWF0ZSBhIHVzZXIgYW5kIHNpZ24gaW4uXG4gICAgLy8gT25jZSBsb2dnZWQgaW4sIHRoZSByZXN0IG9mIHRoZSBjb2RlIHlvdSBqdXN0IHJlYWQgaGFuZGxlZCBhdXRvbWF0aWNhbGx5IHNpZ25pbmcvdmFsaWRhdGluZyBkYXRhLlxuICAgIC8vIEJ1dCBhbGwgb3RoZXIgYmVoYXZpb3IgbmVlZHMgdG8gYmUgZXF1YWxseSBlYXN5LCBsaWtlIG9waW5pb25hdGVkIHdheXMgb2ZcbiAgICAvLyBBZGRpbmcgZnJpZW5kcyAodHJ1c3RlZCBwdWJsaWMga2V5cyksIHNlbmRpbmcgcHJpdmF0ZSBtZXNzYWdlcywgZXRjLlxuICAgIC8vIENoZWVycyEgVGVsbCBtZSB3aGF0IHlvdSB0aGluay5cbiAgICAoKFNFQS53aW5kb3d8fHt9KS5HVU58fHt9KS5TRUEgPSBTRUE7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNFQVxuICAgIC8vIC0tLS0tLS0tLS0tLS0tIEVORCBTRUEgTU9EVUxFUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIC0tIEJFR0lOIFNFQStHVU4gTU9EVUxFUzogQlVORExFRCBCWSBERUZBVUxUIFVOVElMIE9USEVSUyBVU0UgU0VBIE9OIE9XTiAtLS0tLS0tXG4gIH0pKFVTRSwgJy4vc2VhJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBTRUEgPSBVU0UoJy4vc2VhJyksIEd1biwgdTtcbiAgICBpZihTRUEud2luZG93KXtcbiAgICAgIEd1biA9IFNFQS53aW5kb3cuR1VOIHx8IHtjaGFpbjp7fX07XG4gICAgfSBlbHNlIHtcbiAgICAgIEd1biA9IFVTRSgodSsnJyA9PSB0eXBlb2YgTU9EVUxFPycuJzonJykrJy4vZ3VuJywgMSk7XG4gICAgfVxuICAgIFNFQS5HVU4gPSBHdW47XG5cbiAgICBmdW5jdGlvbiBVc2VyKHJvb3QpeyBcbiAgICAgIHRoaXMuXyA9IHskOiB0aGlzfTtcbiAgICB9XG4gICAgVXNlci5wcm90b3R5cGUgPSAoZnVuY3Rpb24oKXsgZnVuY3Rpb24gRigpe307IEYucHJvdG90eXBlID0gR3VuLmNoYWluOyByZXR1cm4gbmV3IEYoKSB9KCkpIC8vIE9iamVjdC5jcmVhdGUgcG9seWZpbGxcbiAgICBVc2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFVzZXI7XG5cbiAgICAvLyBsZXQncyBleHRlbmQgdGhlIGd1biBjaGFpbiB3aXRoIGEgYHVzZXJgIGZ1bmN0aW9uLlxuICAgIC8vIG9ubHkgb25lIHVzZXIgY2FuIGJlIGxvZ2dlZCBpbiBhdCBhIHRpbWUsIHBlciBndW4gaW5zdGFuY2UuXG4gICAgR3VuLmNoYWluLnVzZXIgPSBmdW5jdGlvbihwdWIpe1xuICAgICAgdmFyIGd1biA9IHRoaXMsIHJvb3QgPSBndW4uYmFjaygtMSksIHVzZXI7XG4gICAgICBpZihwdWIpe1xuICAgICAgICBwdWIgPSBTRUEub3B0LnB1YigocHViLl98fCcnKVsnIyddKSB8fCBwdWI7XG4gICAgICAgIHJldHVybiByb290LmdldCgnficrcHViKTtcbiAgICAgIH1cbiAgICAgIGlmKHVzZXIgPSByb290LmJhY2soJ3VzZXInKSl7IHJldHVybiB1c2VyIH1cbiAgICAgIHZhciByb290ID0gKHJvb3QuXyksIGF0ID0gcm9vdCwgdXVpZCA9IGF0Lm9wdC51dWlkIHx8IGxleDtcbiAgICAgIChhdCA9ICh1c2VyID0gYXQudXNlciA9IGd1bi5jaGFpbihuZXcgVXNlcikpLl8pLm9wdCA9IHt9O1xuICAgICAgYXQub3B0LnV1aWQgPSBmdW5jdGlvbihjYil7XG4gICAgICAgIHZhciBpZCA9IHV1aWQoKSwgcHViID0gcm9vdC51c2VyO1xuICAgICAgICBpZighcHViIHx8ICEocHViID0gcHViLmlzKSB8fCAhKHB1YiA9IHB1Yi5wdWIpKXsgcmV0dXJuIGlkIH1cbiAgICAgICAgaWQgPSAnficgKyBwdWIgKyAnLycgKyBpZDtcbiAgICAgICAgaWYoY2IgJiYgY2IuY2FsbCl7IGNiKG51bGwsIGlkKSB9XG4gICAgICAgIHJldHVybiBpZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1c2VyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBsZXgoKXsgcmV0dXJuIEd1bi5zdGF0ZSgpLnRvU3RyaW5nKDM2KS5yZXBsYWNlKCcuJywnJykgfVxuICAgIEd1bi5Vc2VyID0gVXNlcjtcbiAgICBVc2VyLkdVTiA9IEd1bjtcbiAgICBVc2VyLlNFQSA9IEd1bi5TRUEgPSBTRUE7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBVc2VyO1xuICB9KShVU0UsICcuL3VzZXInKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIHUsIEd1biA9ICgnJyt1ICE9IHR5cGVvZiB3aW5kb3cpPyAod2luZG93Lkd1bnx8e2NoYWluOnt9fSkgOiBVU0UoKCcnK3UgPT09IHR5cGVvZiBNT0RVTEU/Jy4nOicnKSsnLi9ndW4nLCAxKTtcbiAgICBHdW4uY2hhaW4udGhlbiA9IGZ1bmN0aW9uKGNiLCBvcHQpe1xuICAgICAgdmFyIGd1biA9IHRoaXMsIHAgPSAobmV3IFByb21pc2UoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgICBndW4ub25jZShyZXMsIG9wdCk7XG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gY2I/IHAudGhlbihjYikgOiBwO1xuICAgIH1cbiAgfSkoVVNFLCAnLi90aGVuJyk7XG5cbiAgO1VTRShmdW5jdGlvbihtb2R1bGUpe1xuICAgIHZhciBVc2VyID0gVVNFKCcuL3VzZXInKSwgU0VBID0gVXNlci5TRUEsIEd1biA9IFVzZXIuR1VOLCBub29wID0gZnVuY3Rpb24oKXt9O1xuXG4gICAgLy8gV2VsbCBmaXJzdCB3ZSBoYXZlIHRvIGFjdHVhbGx5IGNyZWF0ZSBhIHVzZXIuIFRoYXQgaXMgd2hhdCB0aGlzIGZ1bmN0aW9uIGRvZXMuXG4gICAgVXNlci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oLi4uYXJncyl7XG4gICAgICB2YXIgcGFpciA9IHR5cGVvZiBhcmdzWzBdID09PSAnb2JqZWN0JyAmJiAoYXJnc1swXS5wdWIgfHwgYXJnc1swXS5lcHViKSA/IGFyZ3NbMF0gOiB0eXBlb2YgYXJnc1sxXSA9PT0gJ29iamVjdCcgJiYgKGFyZ3NbMV0ucHViIHx8IGFyZ3NbMV0uZXB1YikgPyBhcmdzWzFdIDogbnVsbDtcbiAgICAgIHZhciBhbGlhcyA9IHBhaXIgJiYgKHBhaXIucHViIHx8IHBhaXIuZXB1YikgPyBwYWlyLnB1YiA6IHR5cGVvZiBhcmdzWzBdID09PSAnc3RyaW5nJyA/IGFyZ3NbMF0gOiBudWxsO1xuICAgICAgdmFyIHBhc3MgPSBwYWlyICYmIChwYWlyLnB1YiB8fCBwYWlyLmVwdWIpID8gcGFpciA6IGFsaWFzICYmIHR5cGVvZiBhcmdzWzFdID09PSAnc3RyaW5nJyA/IGFyZ3NbMV0gOiBudWxsO1xuICAgICAgdmFyIGNiID0gYXJncy5maWx0ZXIoYXJnID0+IHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbicpWzBdIHx8IG51bGw7IC8vIGNiIG5vdyBjYW4gc3RhbmQgYW55d2hlcmUsIGFmdGVyIGFsaWFzL3Bhc3Mgb3IgcGFpclxuICAgICAgdmFyIG9wdCA9IGFyZ3MgJiYgYXJncy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoLTFdID09PSAnb2JqZWN0JyA/IGFyZ3NbYXJncy5sZW5ndGgtMV0gOiB7fTsgLy8gb3B0IGlzIGFsd2F5cyB0aGUgbGFzdCBwYXJhbWV0ZXIgd2hpY2ggdHlwZW9mID09PSAnb2JqZWN0JyBhbmQgc3RhbmRzIGFmdGVyIGNiXG4gICAgICBcbiAgICAgIHZhciBndW4gPSB0aGlzLCBjYXQgPSAoZ3VuLl8pLCByb290ID0gZ3VuLmJhY2soLTEpO1xuICAgICAgY2IgPSBjYiB8fCBub29wO1xuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgaWYoZmFsc2UgIT09IG9wdC5jaGVjayl7XG4gICAgICAgIHZhciBlcnI7XG4gICAgICAgIGlmKCFhbGlhcyl7IGVyciA9IFwiTm8gdXNlci5cIiB9XG4gICAgICAgIGlmKChwYXNzfHwnJykubGVuZ3RoIDwgOCl7IGVyciA9IFwiUGFzc3dvcmQgdG9vIHNob3J0IVwiIH1cbiAgICAgICAgaWYoZXJyKXtcbiAgICAgICAgICBjYih7ZXJyOiBHdW4ubG9nKGVycil9KTtcbiAgICAgICAgICByZXR1cm4gZ3VuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZihjYXQuaW5nKXtcbiAgICAgICAgKGNiIHx8IG5vb3ApKHtlcnI6IEd1bi5sb2coXCJVc2VyIGlzIGFscmVhZHkgYmVpbmcgY3JlYXRlZCBvciBhdXRoZW50aWNhdGVkIVwiKSwgd2FpdDogdHJ1ZX0pO1xuICAgICAgICByZXR1cm4gZ3VuO1xuICAgICAgfVxuICAgICAgY2F0LmluZyA9IHRydWU7XG4gICAgICB2YXIgYWN0ID0ge30sIHU7XG4gICAgICBhY3QuYSA9IGZ1bmN0aW9uKHB1YnMpe1xuICAgICAgICBhY3QucHVicyA9IHB1YnM7XG4gICAgICAgIGlmKHB1YnMgJiYgIW9wdC5hbHJlYWR5KXtcbiAgICAgICAgICAvLyBJZiB3ZSBjYW4gZW5mb3JjZSB0aGF0IGEgdXNlciBuYW1lIGlzIGFscmVhZHkgdGFrZW4sIGl0IG1pZ2h0IGJlIG5pY2UgdG8gdHJ5LCBidXQgdGhpcyBpcyBub3QgZ3VhcmFudGVlZC5cbiAgICAgICAgICB2YXIgYWNrID0ge2VycjogR3VuLmxvZygnVXNlciBhbHJlYWR5IGNyZWF0ZWQhJyl9O1xuICAgICAgICAgIGNhdC5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAoY2IgfHwgbm9vcCkoYWNrKTtcbiAgICAgICAgICBndW4ubGVhdmUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYWN0LnNhbHQgPSBTdHJpbmcucmFuZG9tKDY0KTsgLy8gcHNldWRvLXJhbmRvbWx5IGNyZWF0ZSBhIHNhbHQsIHRoZW4gdXNlIFBCS0RGMiBmdW5jdGlvbiB0byBleHRlbmQgdGhlIHBhc3N3b3JkIHdpdGggaXQuXG4gICAgICAgIFNFQS53b3JrKHBhc3MsIGFjdC5zYWx0LCBhY3QuYik7IC8vIHRoaXMgd2lsbCB0YWtlIHNvbWUgc2hvcnQgYW1vdW50IG9mIHRpbWUgdG8gcHJvZHVjZSBhIHByb29mLCB3aGljaCBzbG93cyBicnV0ZSBmb3JjZSBhdHRhY2tzLlxuICAgICAgfVxuICAgICAgYWN0LmIgPSBmdW5jdGlvbihwcm9vZil7XG4gICAgICAgIGFjdC5wcm9vZiA9IHByb29mO1xuICAgICAgICBwYWlyID8gYWN0LmMocGFpcikgOiBTRUEucGFpcihhY3QuYykgLy8gZ2VuZXJhdGUgYSBicmFuZCBuZXcga2V5IHBhaXIgb3IgdXNlIHRoZSBleGlzdGluZy5cbiAgICAgIH1cbiAgICAgIGFjdC5jID0gZnVuY3Rpb24ocGFpcil7XG4gICAgICAgIHZhciB0bXBcbiAgICAgICAgYWN0LnBhaXIgPSBwYWlyIHx8IHt9O1xuICAgICAgICBpZih0bXAgPSBjYXQucm9vdC51c2VyKXtcbiAgICAgICAgICB0bXAuXy5zZWEgPSBwYWlyO1xuICAgICAgICAgIHRtcC5pcyA9IHtwdWI6IHBhaXIucHViLCBlcHViOiBwYWlyLmVwdWIsIGFsaWFzOiBhbGlhc307XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhlIHVzZXIncyBwdWJsaWMga2V5IGRvZXNuJ3QgbmVlZCB0byBiZSBzaWduZWQuIEJ1dCBldmVyeXRoaW5nIGVsc2UgbmVlZHMgdG8gYmUgc2lnbmVkIHdpdGggaXQhIC8vIHdlIGhhdmUgbm93IGF1dG9tYXRlZCBpdCEgY2xlYW4gdXAgdGhlc2UgZXh0cmEgc3RlcHMgbm93IVxuICAgICAgICBhY3QuZGF0YSA9IHtwdWI6IHBhaXIucHVifTtcbiAgICAgICAgYWN0LmQoKTtcbiAgICAgIH1cbiAgICAgIGFjdC5kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWN0LmRhdGEuYWxpYXMgPSBhbGlhcztcbiAgICAgICAgYWN0LmUoKTtcbiAgICAgIH1cbiAgICAgIGFjdC5lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWN0LmRhdGEuZXB1YiA9IGFjdC5wYWlyLmVwdWI7IFxuICAgICAgICBTRUEuZW5jcnlwdCh7cHJpdjogYWN0LnBhaXIucHJpdiwgZXByaXY6IGFjdC5wYWlyLmVwcml2fSwgYWN0LnByb29mLCBhY3QuZiwge3JhdzoxfSk7IC8vIHRvIGtlZXAgdGhlIHByaXZhdGUga2V5IHNhZmUsIHdlIEFFUyBlbmNyeXB0IGl0IHdpdGggdGhlIHByb29mIG9mIHdvcmshXG4gICAgICB9XG4gICAgICBhY3QuZiA9IGZ1bmN0aW9uKGF1dGgpe1xuICAgICAgICBhY3QuZGF0YS5hdXRoID0gSlNPTi5zdHJpbmdpZnkoe2VrOiBhdXRoLCBzOiBhY3Quc2FsdH0pOyBcbiAgICAgICAgYWN0LmcoYWN0LmRhdGEuYXV0aCk7XG4gICAgICB9XG4gICAgICBhY3QuZyA9IGZ1bmN0aW9uKGF1dGgpeyB2YXIgdG1wO1xuICAgICAgICBhY3QuZGF0YS5hdXRoID0gYWN0LmRhdGEuYXV0aCB8fCBhdXRoO1xuICAgICAgICByb290LmdldCh0bXAgPSAnficrYWN0LnBhaXIucHViKS5wdXQoYWN0LmRhdGEpLm9uKGFjdC5oKTsgLy8gYXdlc29tZSwgbm93IHdlIGNhbiBhY3R1YWxseSBzYXZlIHRoZSB1c2VyIHdpdGggdGhlaXIgcHVibGljIGtleSBhcyB0aGVpciBJRC5cbiAgICAgICAgdmFyIGxpbmsgPSB7fTsgbGlua1t0bXBdID0geycjJzogdG1wfTsgcm9vdC5nZXQoJ35AJythbGlhcykucHV0KGxpbmspLmdldCh0bXApLm9uKGFjdC5pKTsgLy8gbmV4dCB1cCwgd2Ugd2FudCB0byBhc3NvY2lhdGUgdGhlIGFsaWFzIHdpdGggdGhlIHB1YmxpYyBrZXkuIFNvIHdlIGFkZCBpdCB0byB0aGUgYWxpYXMgbGlzdC5cbiAgICAgIH1cbiAgICAgIGFjdC5oID0gZnVuY3Rpb24oZGF0YSwga2V5LCBtc2csIGV2ZSl7XG4gICAgICAgIGV2ZS5vZmYoKTsgYWN0Lmgub2sgPSAxOyBhY3QuaSgpO1xuICAgICAgfVxuICAgICAgYWN0LmkgPSBmdW5jdGlvbihkYXRhLCBrZXksIG1zZywgZXZlKXtcbiAgICAgICAgaWYoZXZlKXsgYWN0Lmkub2sgPSAxOyBldmUub2ZmKCkgfVxuICAgICAgICBpZighYWN0Lmgub2sgfHwgIWFjdC5pLm9rKXsgcmV0dXJuIH1cbiAgICAgICAgY2F0LmluZyA9IGZhbHNlO1xuICAgICAgICBjYih7b2s6IDAsIHB1YjogYWN0LnBhaXIucHVifSk7IC8vIGNhbGxiYWNrIHRoYXQgdGhlIHVzZXIgaGFzIGJlZW4gY3JlYXRlZC4gKE5vdGU6IG9rID0gMCBiZWNhdXNlIHdlIGRpZG4ndCB3YWl0IGZvciBkaXNrIHRvIGFjaylcbiAgICAgICAgaWYobm9vcCA9PT0gY2IpeyBwYWlyID8gZ3VuLmF1dGgocGFpcikgOiBndW4uYXV0aChhbGlhcywgcGFzcykgfSAvLyBpZiBubyBjYWxsYmFjayBpcyBwYXNzZWQsIGF1dG8tbG9naW4gYWZ0ZXIgc2lnbmluZyB1cC5cbiAgICAgIH1cbiAgICAgIHJvb3QuZ2V0KCd+QCcrYWxpYXMpLm9uY2UoYWN0LmEpO1xuICAgICAgcmV0dXJuIGd1bjtcbiAgICB9XG4gICAgVXNlci5wcm90b3R5cGUubGVhdmUgPSBmdW5jdGlvbihvcHQsIGNiKXtcbiAgICAgIHZhciBndW4gPSB0aGlzLCB1c2VyID0gKGd1bi5iYWNrKC0xKS5fKS51c2VyO1xuICAgICAgaWYodXNlcil7XG4gICAgICAgIGRlbGV0ZSB1c2VyLmlzO1xuICAgICAgICBkZWxldGUgdXNlci5fLmlzO1xuICAgICAgICBkZWxldGUgdXNlci5fLnNlYTtcbiAgICAgIH1cbiAgICAgIGlmKFNFQS53aW5kb3cpe1xuICAgICAgICB0cnl7dmFyIHNTID0ge307XG4gICAgICAgIHNTID0gd2luZG93LnNlc3Npb25TdG9yYWdlO1xuICAgICAgICBkZWxldGUgc1MucmVjYWxsO1xuICAgICAgICBkZWxldGUgc1MucGFpcjtcbiAgICAgICAgfWNhdGNoKGUpe307XG4gICAgICB9XG4gICAgICByZXR1cm4gZ3VuO1xuICAgIH1cbiAgfSkoVVNFLCAnLi9jcmVhdGUnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFVzZXIgPSBVU0UoJy4vdXNlcicpLCBTRUEgPSBVc2VyLlNFQSwgR3VuID0gVXNlci5HVU4sIG5vb3AgPSBmdW5jdGlvbigpe307XG4gICAgLy8gbm93IHRoYXQgd2UgaGF2ZSBjcmVhdGVkIGEgdXNlciwgd2Ugd2FudCB0byBhdXRoZW50aWNhdGUgdGhlbSFcbiAgICBVc2VyLnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24oLi4uYXJncyl7IC8vIFRPRE86IHRoaXMgUFIgd2l0aCBhcmd1bWVudHMgbmVlZCB0byBiZSBjbGVhbmVkIHVwIC8gcmVmYWN0b3JlZC5cbiAgICAgIHZhciBwYWlyID0gdHlwZW9mIGFyZ3NbMF0gPT09ICdvYmplY3QnICYmIChhcmdzWzBdLnB1YiB8fCBhcmdzWzBdLmVwdWIpID8gYXJnc1swXSA6IHR5cGVvZiBhcmdzWzFdID09PSAnb2JqZWN0JyAmJiAoYXJnc1sxXS5wdWIgfHwgYXJnc1sxXS5lcHViKSA/IGFyZ3NbMV0gOiBudWxsO1xuICAgICAgdmFyIGFsaWFzID0gIXBhaXIgJiYgdHlwZW9mIGFyZ3NbMF0gPT09ICdzdHJpbmcnID8gYXJnc1swXSA6IG51bGw7XG4gICAgICB2YXIgcGFzcyA9IChhbGlhcyB8fCAocGFpciAmJiAhKHBhaXIucHJpdiAmJiBwYWlyLmVwcml2KSkpICYmIHR5cGVvZiBhcmdzWzFdID09PSAnc3RyaW5nJyA/IGFyZ3NbMV0gOiBudWxsO1xuICAgICAgdmFyIGNiID0gYXJncy5maWx0ZXIoYXJnID0+IHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbicpWzBdIHx8IG51bGw7IC8vIGNiIG5vdyBjYW4gc3RhbmQgYW55d2hlcmUsIGFmdGVyIGFsaWFzL3Bhc3Mgb3IgcGFpclxuICAgICAgdmFyIG9wdCA9IGFyZ3MgJiYgYXJncy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoLTFdID09PSAnb2JqZWN0JyA/IGFyZ3NbYXJncy5sZW5ndGgtMV0gOiB7fTsgLy8gb3B0IGlzIGFsd2F5cyB0aGUgbGFzdCBwYXJhbWV0ZXIgd2hpY2ggdHlwZW9mID09PSAnb2JqZWN0JyBhbmQgc3RhbmRzIGFmdGVyIGNiXG4gICAgICBcbiAgICAgIHZhciBndW4gPSB0aGlzLCBjYXQgPSAoZ3VuLl8pLCByb290ID0gZ3VuLmJhY2soLTEpO1xuICAgICAgXG4gICAgICBpZihjYXQuaW5nKXtcbiAgICAgICAgKGNiIHx8IG5vb3ApKHtlcnI6IEd1bi5sb2coXCJVc2VyIGlzIGFscmVhZHkgYmVpbmcgY3JlYXRlZCBvciBhdXRoZW50aWNhdGVkIVwiKSwgd2FpdDogdHJ1ZX0pO1xuICAgICAgICByZXR1cm4gZ3VuO1xuICAgICAgfVxuICAgICAgY2F0LmluZyA9IHRydWU7XG4gICAgICBcbiAgICAgIHZhciBhY3QgPSB7fSwgdTtcbiAgICAgIGFjdC5hID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGlmKCFkYXRhKXsgcmV0dXJuIGFjdC5iKCkgfVxuICAgICAgICBpZighZGF0YS5wdWIpe1xuICAgICAgICAgIHZhciB0bXAgPSBbXTsgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChmdW5jdGlvbihrKXsgaWYoJ18nPT1rKXsgcmV0dXJuIH0gdG1wLnB1c2goZGF0YVtrXSkgfSlcbiAgICAgICAgICByZXR1cm4gYWN0LmIodG1wKTtcbiAgICAgICAgfVxuICAgICAgICBpZihhY3QubmFtZSl7IHJldHVybiBhY3QuZihkYXRhKSB9XG4gICAgICAgIGFjdC5jKChhY3QuZGF0YSA9IGRhdGEpLmF1dGgpO1xuICAgICAgfVxuICAgICAgYWN0LmIgPSBmdW5jdGlvbihsaXN0KXtcbiAgICAgICAgdmFyIGdldCA9IChhY3QubGlzdCA9IChhY3QubGlzdHx8W10pLmNvbmNhdChsaXN0fHxbXSkpLnNoaWZ0KCk7XG4gICAgICAgIGlmKHUgPT09IGdldCl7XG4gICAgICAgICAgaWYoYWN0Lm5hbWUpeyByZXR1cm4gYWN0LmVycignWW91ciB1c2VyIGFjY291bnQgaXMgbm90IHB1Ymxpc2hlZCBmb3IgZEFwcHMgdG8gYWNjZXNzLCBwbGVhc2UgY29uc2lkZXIgc3luY2luZyBpdCBvbmxpbmUsIG9yIGFsbG93aW5nIGxvY2FsIGFjY2VzcyBieSBhZGRpbmcgeW91ciBkZXZpY2UgYXMgYSBwZWVyLicpIH1cbiAgICAgICAgICByZXR1cm4gYWN0LmVycignV3JvbmcgdXNlciBvciBwYXNzd29yZC4nKSBcbiAgICAgICAgfVxuICAgICAgICByb290LmdldChnZXQpLm9uY2UoYWN0LmEpO1xuICAgICAgfVxuICAgICAgYWN0LmMgPSBmdW5jdGlvbihhdXRoKXtcbiAgICAgICAgaWYodSA9PT0gYXV0aCl7IHJldHVybiBhY3QuYigpIH1cbiAgICAgICAgaWYoJ3N0cmluZycgPT0gdHlwZW9mIGF1dGgpeyByZXR1cm4gYWN0LmMob2JqX2lmeShhdXRoKSkgfSAvLyBpbiBjYXNlIG9mIGxlZ2FjeVxuICAgICAgICBTRUEud29yayhwYXNzLCAoYWN0LmF1dGggPSBhdXRoKS5zLCBhY3QuZCwgYWN0LmVuYyk7IC8vIHRoZSBwcm9vZiBvZiB3b3JrIGlzIGV2aWRlbmNlIHRoYXQgd2UndmUgc3BlbnQgc29tZSB0aW1lL2VmZm9ydCB0cnlpbmcgdG8gbG9nIGluLCB0aGlzIHNsb3dzIGJydXRlIGZvcmNlLlxuICAgICAgfVxuICAgICAgYWN0LmQgPSBmdW5jdGlvbihwcm9vZil7XG4gICAgICAgIFNFQS5kZWNyeXB0KGFjdC5hdXRoLmVrLCBwcm9vZiwgYWN0LmUsIGFjdC5lbmMpO1xuICAgICAgfVxuICAgICAgYWN0LmUgPSBmdW5jdGlvbihoYWxmKXtcbiAgICAgICAgaWYodSA9PT0gaGFsZil7XG4gICAgICAgICAgaWYoIWFjdC5lbmMpeyAvLyB0cnkgb2xkIGZvcm1hdFxuICAgICAgICAgICAgYWN0LmVuYyA9IHtlbmNvZGU6ICd1dGY4J307XG4gICAgICAgICAgICByZXR1cm4gYWN0LmMoYWN0LmF1dGgpO1xuICAgICAgICAgIH0gYWN0LmVuYyA9IG51bGw7IC8vIGVuZCBiYWNrd2FyZHNcbiAgICAgICAgICByZXR1cm4gYWN0LmIoKTtcbiAgICAgICAgfVxuICAgICAgICBhY3QuaGFsZiA9IGhhbGY7XG4gICAgICAgIGFjdC5mKGFjdC5kYXRhKTtcbiAgICAgIH1cbiAgICAgIGFjdC5mID0gZnVuY3Rpb24ocGFpcil7XG4gICAgICAgIHZhciBoYWxmID0gYWN0LmhhbGYgfHwge30sIGRhdGEgPSBhY3QuZGF0YSB8fCB7fTtcbiAgICAgICAgYWN0LmcoYWN0LmxvbCA9IHtwdWI6IHBhaXIucHViIHx8IGRhdGEucHViLCBlcHViOiBwYWlyLmVwdWIgfHwgZGF0YS5lcHViLCBwcml2OiBwYWlyLnByaXYgfHwgaGFsZi5wcml2LCBlcHJpdjogcGFpci5lcHJpdiB8fCBoYWxmLmVwcml2fSk7XG4gICAgICB9XG4gICAgICBhY3QuZyA9IGZ1bmN0aW9uKHBhaXIpe1xuICAgICAgICBpZighcGFpciB8fCAhcGFpci5wdWIgfHwgIXBhaXIuZXB1Yil7IHJldHVybiBhY3QuYigpIH1cbiAgICAgICAgYWN0LnBhaXIgPSBwYWlyO1xuICAgICAgICB2YXIgdXNlciA9IChyb290Ll8pLnVzZXIsIGF0ID0gKHVzZXIuXyk7XG4gICAgICAgIHZhciB0bXAgPSBhdC50YWc7XG4gICAgICAgIHZhciB1cHQgPSBhdC5vcHQ7XG4gICAgICAgIGF0ID0gdXNlci5fID0gcm9vdC5nZXQoJ34nK3BhaXIucHViKS5fO1xuICAgICAgICBhdC5vcHQgPSB1cHQ7XG4gICAgICAgIC8vIGFkZCBvdXIgY3JlZGVudGlhbHMgaW4tbWVtb3J5IG9ubHkgdG8gb3VyIHJvb3QgdXNlciBpbnN0YW5jZVxuICAgICAgICB1c2VyLmlzID0ge3B1YjogcGFpci5wdWIsIGVwdWI6IHBhaXIuZXB1YiwgYWxpYXM6IGFsaWFzIHx8IHBhaXIucHVifTtcbiAgICAgICAgYXQuc2VhID0gYWN0LnBhaXI7XG4gICAgICAgIGNhdC5pbmcgPSBmYWxzZTtcbiAgICAgICAgdHJ5e2lmKHBhc3MgJiYgdSA9PSAob2JqX2lmeShjYXQucm9vdC5ncmFwaFsnficrcGFpci5wdWJdLmF1dGgpfHwnJylbJzonXSl7IG9wdC5zaHVmZmxlID0gb3B0LmNoYW5nZSA9IHBhc3M7IH0gfWNhdGNoKGUpe30gLy8gbWlncmF0ZSBVVEY4ICYgU2h1ZmZsZSFcbiAgICAgICAgb3B0LmNoYW5nZT8gYWN0LnooKSA6IChjYiB8fCBub29wKShhdCk7XG4gICAgICAgIGlmKFNFQS53aW5kb3cgJiYgKChndW4uYmFjaygndXNlcicpLl8pLm9wdHx8b3B0KS5yZW1lbWJlcil7XG4gICAgICAgICAgLy8gVE9ETzogdGhpcyBuZWVkcyB0byBiZSBtb2R1bGFyLlxuICAgICAgICAgIHRyeXt2YXIgc1MgPSB7fTtcbiAgICAgICAgICBzUyA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZTsgLy8gVE9ETzogRklYIEJVRyBwdXR0aW5nIG9uIGAuaXNgIVxuICAgICAgICAgIHNTLnJlY2FsbCA9IHRydWU7XG4gICAgICAgICAgc1MucGFpciA9IEpTT04uc3RyaW5naWZ5KHBhaXIpOyAvLyBhdXRoIHVzaW5nIHBhaXIgaXMgbW9yZSByZWxpYWJsZSB0aGFuIGFsaWFzL3Bhc3NcbiAgICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgICB9XG4gICAgICAgIHRyeXtcbiAgICAgICAgICBpZihyb290Ll8udGFnLmF1dGgpeyAvLyBhdXRoIGhhbmRsZSBtaWdodCBub3QgYmUgcmVnaXN0ZXJlZCB5ZXRcbiAgICAgICAgICAocm9vdC5fKS5vbignYXV0aCcsIGF0KSAvLyBUT0RPOiBEZXByZWNhdGUgdGhpcywgZW1pdCBvbiB1c2VyIGluc3RlYWQhIFVwZGF0ZSBkb2NzIHdoZW4geW91IGRvLlxuICAgICAgICAgIH0gZWxzZSB7IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgKHJvb3QuXykub24oJ2F1dGgnLCBhdCkgfSwxKSB9IC8vIGlmIG5vdCwgaGFja2lseSBhZGQgYSB0aW1lb3V0LlxuICAgICAgICAgIC8vYXQub24oJ2F1dGgnLCBhdCkgLy8gQXJyZ2gsIHRoaXMgZG9lc24ndCB3b3JrIHdpdGhvdXQgZXZlbnQgXCJtZXJnZVwiIGNvZGUsIGJ1dCBcIm1lcmdlXCIgY29kZSBjYXVzZXMgc3RhY2sgb3ZlcmZsb3cgYW5kIGNyYXNoZXMgYWZ0ZXIgbG9nZ2luZyBpbiAmIHRyeWluZyB0byB3cml0ZSBkYXRhLlxuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgR3VuLmxvZyhcIllvdXIgJ2F1dGgnIGNhbGxiYWNrIGNyYXNoZWQgd2l0aDpcIiwgZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFjdC5oID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGlmKCFkYXRhKXsgcmV0dXJuIGFjdC5iKCkgfVxuICAgICAgICBhbGlhcyA9IGRhdGEuYWxpYXNcbiAgICAgICAgaWYoIWFsaWFzKVxuICAgICAgICAgIGFsaWFzID0gZGF0YS5hbGlhcyA9IFwiflwiICsgcGFpci5wdWIgICAgICAgIFxuICAgICAgICBpZighZGF0YS5hdXRoKXtcbiAgICAgICAgICByZXR1cm4gYWN0LmcocGFpcik7XG4gICAgICAgIH1cbiAgICAgICAgcGFpciA9IG51bGw7XG4gICAgICAgIGFjdC5jKChhY3QuZGF0YSA9IGRhdGEpLmF1dGgpO1xuICAgICAgfVxuICAgICAgYWN0LnogPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyBwYXNzd29yZCB1cGRhdGUgc28gZW5jcnlwdCBwcml2YXRlIGtleSB1c2luZyBuZXcgcHdkICsgc2FsdFxuICAgICAgICBhY3Quc2FsdCA9IFN0cmluZy5yYW5kb20oNjQpOyAvLyBwc2V1ZG8tcmFuZG9tXG4gICAgICAgIFNFQS53b3JrKG9wdC5jaGFuZ2UsIGFjdC5zYWx0LCBhY3QueSk7XG4gICAgICB9XG4gICAgICBhY3QueSA9IGZ1bmN0aW9uKHByb29mKXtcbiAgICAgICAgU0VBLmVuY3J5cHQoe3ByaXY6IGFjdC5wYWlyLnByaXYsIGVwcml2OiBhY3QucGFpci5lcHJpdn0sIHByb29mLCBhY3QueCwge3JhdzoxfSk7XG4gICAgICB9XG4gICAgICBhY3QueCA9IGZ1bmN0aW9uKGF1dGgpe1xuICAgICAgICBhY3QudyhKU09OLnN0cmluZ2lmeSh7ZWs6IGF1dGgsIHM6IGFjdC5zYWx0fSkpO1xuICAgICAgfVxuICAgICAgYWN0LncgPSBmdW5jdGlvbihhdXRoKXtcbiAgICAgICAgaWYob3B0LnNodWZmbGUpeyAvLyBkZWxldGUgaW4gZnV0dXJlIVxuICAgICAgICAgIGNvbnNvbGUubG9nKCdtaWdyYXRlIGNvcmUgYWNjb3VudCBmcm9tIFVURjggJiBzaHVmZmxlJyk7XG4gICAgICAgICAgdmFyIHRtcCA9IHt9OyBPYmplY3Qua2V5cyhhY3QuZGF0YSkuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gYWN0LmRhdGFba10gfSk7XG4gICAgICAgICAgZGVsZXRlIHRtcC5fO1xuICAgICAgICAgIHRtcC5hdXRoID0gYXV0aDtcbiAgICAgICAgICByb290LmdldCgnficrYWN0LnBhaXIucHViKS5wdXQodG1wKTtcbiAgICAgICAgfSAvLyBlbmQgZGVsZXRlXG4gICAgICAgIHJvb3QuZ2V0KCd+JythY3QucGFpci5wdWIpLmdldCgnYXV0aCcpLnB1dChhdXRoLCBjYiB8fCBub29wKTtcbiAgICAgIH1cbiAgICAgIGFjdC5lcnIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyIGFjayA9IHtlcnI6IEd1bi5sb2coZSB8fCAnVXNlciBjYW5ub3QgYmUgZm91bmQhJyl9O1xuICAgICAgICBjYXQuaW5nID0gZmFsc2U7XG4gICAgICAgIChjYiB8fCBub29wKShhY2spO1xuICAgICAgfVxuICAgICAgYWN0LnBsdWdpbiA9IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICBpZighKGFjdC5uYW1lID0gbmFtZSkpeyByZXR1cm4gYWN0LmVycigpIH1cbiAgICAgICAgdmFyIHRtcCA9IFtuYW1lXTtcbiAgICAgICAgaWYoJ34nICE9PSBuYW1lWzBdKXtcbiAgICAgICAgICB0bXBbMV0gPSAnficrbmFtZTtcbiAgICAgICAgICB0bXBbMl0gPSAnfkAnK25hbWU7XG4gICAgICAgIH1cbiAgICAgICAgYWN0LmIodG1wKTtcbiAgICAgIH1cbiAgICAgIGlmKHBhaXIpe1xuICAgICAgICBpZihwYWlyLnByaXYgJiYgcGFpci5lcHJpdilcbiAgICAgICAgICBhY3QuZyhwYWlyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJvb3QuZ2V0KCd+JytwYWlyLnB1Yikub25jZShhY3QuaCk7XG4gICAgICB9IGVsc2VcbiAgICAgIGlmKGFsaWFzKXtcbiAgICAgICAgcm9vdC5nZXQoJ35AJythbGlhcykub25jZShhY3QuYSk7XG4gICAgICB9IGVsc2VcbiAgICAgIGlmKCFhbGlhcyAmJiAhcGFzcyl7XG4gICAgICAgIFNFQS5uYW1lKGFjdC5wbHVnaW4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGd1bjtcbiAgICB9XG4gICAgZnVuY3Rpb24gb2JqX2lmeShvKXtcbiAgICAgIGlmKCdzdHJpbmcnICE9IHR5cGVvZiBvKXsgcmV0dXJuIG8gfVxuICAgICAgdHJ5e28gPSBKU09OLnBhcnNlKG8pO1xuICAgICAgfWNhdGNoKGUpe289e319O1xuICAgICAgcmV0dXJuIG87XG4gICAgfVxuICB9KShVU0UsICcuL2F1dGgnKTtcblxuICA7VVNFKGZ1bmN0aW9uKG1vZHVsZSl7XG4gICAgdmFyIFVzZXIgPSBVU0UoJy4vdXNlcicpLCBTRUEgPSBVc2VyLlNFQSwgR3VuID0gVXNlci5HVU47XG4gICAgVXNlci5wcm90b3R5cGUucmVjYWxsID0gZnVuY3Rpb24ob3B0LCBjYil7XG4gICAgICB2YXIgZ3VuID0gdGhpcywgcm9vdCA9IGd1bi5iYWNrKC0xKSwgdG1wO1xuICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgaWYob3B0ICYmIG9wdC5zZXNzaW9uU3RvcmFnZSl7XG4gICAgICAgIGlmKFNFQS53aW5kb3cpe1xuICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgIHZhciBzUyA9IHt9O1xuICAgICAgICAgICAgc1MgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2U7IC8vIFRPRE86IEZJWCBCVUcgcHV0dGluZyBvbiBgLmlzYCFcbiAgICAgICAgICAgIGlmKHNTKXtcbiAgICAgICAgICAgICAgKHJvb3QuXykub3B0LnJlbWVtYmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgKChndW4uYmFjaygndXNlcicpLl8pLm9wdHx8b3B0KS5yZW1lbWJlciA9IHRydWU7XG4gICAgICAgICAgICAgIGlmKHNTLnJlY2FsbCB8fCBzUy5wYWlyKSByb290LnVzZXIoKS5hdXRoKEpTT04ucGFyc2Uoc1MucGFpciksIGNiKTsgLy8gcGFpciBpcyBtb3JlIHJlbGlhYmxlIHRoYW4gYWxpYXMvcGFzc1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1jYXRjaChlKXt9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGd1bjtcbiAgICAgIH1cbiAgICAgIC8qXG4gICAgICAgIFRPRE86IGNvcHkgbWhlbGFuZGVyJ3MgZXhwaXJ5IGNvZGUgYmFjayBpbi5cbiAgICAgICAgQWx0aG91Z2gsIHdlIHNob3VsZCBjaGVjayB3aXRoIGNvbW11bml0eSxcbiAgICAgICAgc2hvdWxkIGV4cGlyeSBiZSBjb3JlIG9yIGEgcGx1Z2luP1xuICAgICAgKi9cbiAgICAgIHJldHVybiBndW47XG4gICAgfVxuICB9KShVU0UsICcuL3JlY2FsbCcpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgVXNlciA9IFVTRSgnLi91c2VyJyksIFNFQSA9IFVzZXIuU0VBLCBHdW4gPSBVc2VyLkdVTiwgbm9vcCA9IGZ1bmN0aW9uKCl7fTtcbiAgICBVc2VyLnByb3RvdHlwZS5wYWlyID0gZnVuY3Rpb24oKXtcbiAgICAgIHZhciB1c2VyID0gdGhpcywgcHJveHk7IC8vIHVuZGVwcmVjYXRlZCwgaGlkaW5nIHdpdGggcHJveGllcy5cbiAgICAgIHRyeXsgcHJveHkgPSBuZXcgUHJveHkoe0RBTkdFUjonXFx1MjYyMCd9LCB7Z2V0OiBmdW5jdGlvbih0LHAscil7XG4gICAgICAgIGlmKCF1c2VyLmlzIHx8ICEodXNlci5ffHwnJykuc2VhKXsgcmV0dXJuIH1cbiAgICAgICAgcmV0dXJuIHVzZXIuXy5zZWFbcF07XG4gICAgICB9fSl9Y2F0Y2goZSl7fVxuICAgICAgcmV0dXJuIHByb3h5O1xuICAgIH1cbiAgICAvLyBJZiBhdXRoZW50aWNhdGVkIHVzZXIgd2FudHMgdG8gZGVsZXRlIGhpcy9oZXIgYWNjb3VudCwgbGV0J3Mgc3VwcG9ydCBpdCFcbiAgICBVc2VyLnByb3RvdHlwZS5kZWxldGUgPSBhc3luYyBmdW5jdGlvbihhbGlhcywgcGFzcywgY2Ipe1xuICAgICAgY29uc29sZS5sb2coXCJ1c2VyLmRlbGV0ZSgpIElTIERFUFJFQ0FURUQgQU5EIFdJTEwgQkUgTU9WRUQgVE8gQSBNT0RVTEUhISFcIik7XG4gICAgICB2YXIgZ3VuID0gdGhpcywgcm9vdCA9IGd1bi5iYWNrKC0xKSwgdXNlciA9IGd1bi5iYWNrKCd1c2VyJyk7XG4gICAgICB0cnkge1xuICAgICAgICB1c2VyLmF1dGgoYWxpYXMsIHBhc3MsIGZ1bmN0aW9uKGFjayl7XG4gICAgICAgICAgdmFyIHB1YiA9ICh1c2VyLmlzfHx7fSkucHViO1xuICAgICAgICAgIC8vIERlbGV0ZSB1c2VyIGRhdGFcbiAgICAgICAgICB1c2VyLm1hcCgpLm9uY2UoZnVuY3Rpb24oKXsgdGhpcy5wdXQobnVsbCkgfSk7XG4gICAgICAgICAgLy8gV2lwZSB1c2VyIGRhdGEgZnJvbSBtZW1vcnlcbiAgICAgICAgICB1c2VyLmxlYXZlKCk7XG4gICAgICAgICAgKGNiIHx8IG5vb3ApKHtvazogMH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgR3VuLmxvZygnVXNlci5kZWxldGUgZmFpbGVkISBFcnJvcjonLCBlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBndW47XG4gICAgfVxuICAgIFVzZXIucHJvdG90eXBlLmFsaXZlID0gYXN5bmMgZnVuY3Rpb24oKXtcbiAgICAgIGNvbnNvbGUubG9nKFwidXNlci5hbGl2ZSgpIElTIERFUFJFQ0FURUQhISFcIik7XG4gICAgICBjb25zdCBndW5Sb290ID0gdGhpcy5iYWNrKC0xKVxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQWxsIGlzIGdvb2QuIFNob3VsZCB3ZSBkbyBzb21ldGhpbmcgbW9yZSB3aXRoIGFjdHVhbCByZWNhbGxlZCBkYXRhP1xuICAgICAgICBhd2FpdCBhdXRoUmVjYWxsKGd1blJvb3QpXG4gICAgICAgIHJldHVybiBndW5Sb290Ll8udXNlci5fXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnN0IGVyciA9ICdObyBzZXNzaW9uISdcbiAgICAgICAgR3VuLmxvZyhlcnIpXG4gICAgICAgIHRocm93IHsgZXJyIH1cbiAgICAgIH1cbiAgICB9XG4gICAgVXNlci5wcm90b3R5cGUudHJ1c3QgPSBhc3luYyBmdW5jdGlvbih1c2VyKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiYC50cnVzdGAgQVBJIE1BWSBCRSBERUxFVEVEIE9SIENIQU5HRUQgT1IgUkVOQU1FRCwgRE8gTk9UIFVTRSFcIik7XG4gICAgICAvLyBUT0RPOiBCVUchISEgU0VBIGBub2RlYCByZWFkIGxpc3RlbmVyIG5lZWRzIHRvIGJlIGFzeW5jLCB3aGljaCBtZWFucyBjb3JlIG5lZWRzIHRvIGJlIGFzeW5jIHRvby5cbiAgICAgIC8vZ3VuLmdldCgnYWxpY2UnKS5nZXQoJ2FnZScpLnRydXN0KGJvYik7XG4gICAgICBpZiAoR3VuLmlzKHVzZXIpKSB7XG4gICAgICAgIHVzZXIuZ2V0KCdwdWInKS5nZXQoKGN0eCwgZXYpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhjdHgsIGV2KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgdXNlci5nZXQoJ3RydXN0JykuZ2V0KHBhdGgpLnB1dCh0aGVpclB1YmtleSk7XG5cbiAgICAgIC8vIGRvIGEgbG9va3VwIG9uIHRoaXMgZ3VuIGNoYWluIGRpcmVjdGx5ICh0aGF0IGdldHMgYm9iJ3MgY29weSBvZiB0aGUgZGF0YSlcbiAgICAgIC8vIGRvIGEgbG9va3VwIG9uIHRoZSBtZXRhZGF0YSB0cnVzdCB0YWJsZSBmb3IgdGhpcyBwYXRoICh0aGF0IGdldHMgYWxsIHRoZSBwdWJrZXlzIGFsbG93ZWQgdG8gd3JpdGUgb24gdGhpcyBwYXRoKVxuICAgICAgLy8gZG8gYSBsb29rdXAgb24gZWFjaCBvZiB0aG9zZSBwdWJLZXlzIE9OIHRoZSBwYXRoICh0byBnZXQgdGhlIGNvbGxhYiBkYXRhIFwibGF5ZXJzXCIpXG4gICAgICAvLyBUSEVOIHlvdSBwZXJmb3JtIEphY2hlbidzIG1peCBvcGVyYXRpb25cbiAgICAgIC8vIGFuZCByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGF0IHRvLi4uXG4gICAgfVxuICAgIFVzZXIucHJvdG90eXBlLmdyYW50ID0gZnVuY3Rpb24odG8sIGNiKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiYC5ncmFudGAgQVBJIE1BWSBCRSBERUxFVEVEIE9SIENIQU5HRUQgT1IgUkVOQU1FRCwgRE8gTk9UIFVTRSFcIik7XG4gICAgICB2YXIgZ3VuID0gdGhpcywgdXNlciA9IGd1bi5iYWNrKC0xKS51c2VyKCksIHBhaXIgPSB1c2VyLl8uc2VhLCBwYXRoID0gJyc7XG4gICAgICBndW4uYmFjayhmdW5jdGlvbihhdCl7IGlmKGF0LmlzKXsgcmV0dXJuIH0gcGF0aCArPSAoYXQuZ2V0fHwnJykgfSk7XG4gICAgICAoYXN5bmMgZnVuY3Rpb24oKXtcbiAgICAgIHZhciBlbmMsIHNlYyA9IGF3YWl0IHVzZXIuZ2V0KCdncmFudCcpLmdldChwYWlyLnB1YikuZ2V0KHBhdGgpLnRoZW4oKTtcbiAgICAgIHNlYyA9IGF3YWl0IFNFQS5kZWNyeXB0KHNlYywgcGFpcik7XG4gICAgICBpZighc2VjKXtcbiAgICAgICAgc2VjID0gU0VBLnJhbmRvbSgxNikudG9TdHJpbmcoKTtcbiAgICAgICAgZW5jID0gYXdhaXQgU0VBLmVuY3J5cHQoc2VjLCBwYWlyKTtcbiAgICAgICAgdXNlci5nZXQoJ2dyYW50JykuZ2V0KHBhaXIucHViKS5nZXQocGF0aCkucHV0KGVuYyk7XG4gICAgICB9XG4gICAgICB2YXIgcHViID0gdG8uZ2V0KCdwdWInKS50aGVuKCk7XG4gICAgICB2YXIgZXB1YiA9IHRvLmdldCgnZXB1YicpLnRoZW4oKTtcbiAgICAgIHB1YiA9IGF3YWl0IHB1YjsgZXB1YiA9IGF3YWl0IGVwdWI7XG4gICAgICB2YXIgZGggPSBhd2FpdCBTRUEuc2VjcmV0KGVwdWIsIHBhaXIpO1xuICAgICAgZW5jID0gYXdhaXQgU0VBLmVuY3J5cHQoc2VjLCBkaCk7XG4gICAgICB1c2VyLmdldCgnZ3JhbnQnKS5nZXQocHViKS5nZXQocGF0aCkucHV0KGVuYywgY2IpO1xuICAgICAgfSgpKTtcbiAgICAgIHJldHVybiBndW47XG4gICAgfVxuICAgIFVzZXIucHJvdG90eXBlLnNlY3JldCA9IGZ1bmN0aW9uKGRhdGEsIGNiKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiYC5zZWNyZXRgIEFQSSBNQVkgQkUgREVMRVRFRCBPUiBDSEFOR0VEIE9SIFJFTkFNRUQsIERPIE5PVCBVU0UhXCIpO1xuICAgICAgdmFyIGd1biA9IHRoaXMsIHVzZXIgPSBndW4uYmFjaygtMSkudXNlcigpLCBwYWlyID0gdXNlci5wYWlyKCksIHBhdGggPSAnJztcbiAgICAgIGd1bi5iYWNrKGZ1bmN0aW9uKGF0KXsgaWYoYXQuaXMpeyByZXR1cm4gfSBwYXRoICs9IChhdC5nZXR8fCcnKSB9KTtcbiAgICAgIChhc3luYyBmdW5jdGlvbigpe1xuICAgICAgdmFyIGVuYywgc2VjID0gYXdhaXQgdXNlci5nZXQoJ3RydXN0JykuZ2V0KHBhaXIucHViKS5nZXQocGF0aCkudGhlbigpO1xuICAgICAgc2VjID0gYXdhaXQgU0VBLmRlY3J5cHQoc2VjLCBwYWlyKTtcbiAgICAgIGlmKCFzZWMpe1xuICAgICAgICBzZWMgPSBTRUEucmFuZG9tKDE2KS50b1N0cmluZygpO1xuICAgICAgICBlbmMgPSBhd2FpdCBTRUEuZW5jcnlwdChzZWMsIHBhaXIpO1xuICAgICAgICB1c2VyLmdldCgndHJ1c3QnKS5nZXQocGFpci5wdWIpLmdldChwYXRoKS5wdXQoZW5jKTtcbiAgICAgIH1cbiAgICAgIGVuYyA9IGF3YWl0IFNFQS5lbmNyeXB0KGRhdGEsIHNlYyk7XG4gICAgICBndW4ucHV0KGVuYywgY2IpO1xuICAgICAgfSgpKTtcbiAgICAgIHJldHVybiBndW47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyB0aGUgZGVjcnlwdGVkIHZhbHVlLCBlbmNyeXB0ZWQgYnkgc2VjcmV0XG4gICAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICAgLy8gTWFyayBuZWVkcyB0byByZXZpZXcgMXN0IGJlZm9yZSBvZmZpY2lhbGx5IHN1cHBvcnRlZFxuICAgIFVzZXIucHJvdG90eXBlLmRlY3J5cHQgPSBmdW5jdGlvbihjYikge1xuICAgICAgbGV0IGd1biA9IHRoaXMsXG4gICAgICAgIHBhdGggPSAnJ1xuICAgICAgZ3VuLmJhY2soZnVuY3Rpb24oYXQpIHtcbiAgICAgICAgaWYgKGF0LmlzKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgcGF0aCArPSBhdC5nZXQgfHwgJydcbiAgICAgIH0pXG4gICAgICByZXR1cm4gZ3VuXG4gICAgICAgIC50aGVuKGFzeW5jIGRhdGEgPT4ge1xuICAgICAgICAgIGlmIChkYXRhID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB1c2VyID0gZ3VuLmJhY2soLTEpLnVzZXIoKVxuICAgICAgICAgIGNvbnN0IHBhaXIgPSB1c2VyLnBhaXIoKVxuICAgICAgICAgIGxldCBzZWMgPSBhd2FpdCB1c2VyXG4gICAgICAgICAgICAuZ2V0KCd0cnVzdCcpXG4gICAgICAgICAgICAuZ2V0KHBhaXIucHViKVxuICAgICAgICAgICAgLmdldChwYXRoKVxuICAgICAgICAgIHNlYyA9IGF3YWl0IFNFQS5kZWNyeXB0KHNlYywgcGFpcilcbiAgICAgICAgICBpZiAoIXNlYykge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGRlY3J5cHRlZCA9IGF3YWl0IFNFQS5kZWNyeXB0KGRhdGEsIHNlYylcbiAgICAgICAgICByZXR1cm4gZGVjcnlwdGVkXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgY2IgJiYgY2IocmVzKVxuICAgICAgICAgIHJldHVybiByZXNcbiAgICAgICAgfSlcbiAgICB9XG4gICAgKi9cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFVzZXJcbiAgfSkoVVNFLCAnLi9zaGFyZScpO1xuXG4gIDtVU0UoZnVuY3Rpb24obW9kdWxlKXtcbiAgICB2YXIgU0VBID0gVVNFKCcuL3NlYScpLCBTID0gVVNFKCcuL3NldHRpbmdzJyksIG5vb3AgPSBmdW5jdGlvbigpIHt9LCB1O1xuICAgIHZhciBHdW4gPSAoJycrdSAhPSB0eXBlb2Ygd2luZG93KT8gKHdpbmRvdy5HdW58fHtvbjpub29wfSkgOiBVU0UoKCcnK3UgPT09IHR5cGVvZiBNT0RVTEU/Jy4nOicnKSsnLi9ndW4nLCAxKTtcbiAgICAvLyBBZnRlciB3ZSBoYXZlIGEgR1VOIGV4dGVuc2lvbiB0byBtYWtlIHVzZXIgcmVnaXN0cmF0aW9uL2xvZ2luIGVhc3ksIHdlIHRoZW4gbmVlZCB0byBoYW5kbGUgZXZlcnl0aGluZyBlbHNlLlxuXG4gICAgLy8gV2UgZG8gdGhpcyB3aXRoIGEgR1VOIGFkYXB0ZXIsIHdlIGZpcnN0IGxpc3RlbiB0byB3aGVuIGEgZ3VuIGluc3RhbmNlIGlzIGNyZWF0ZWQgKGFuZCB3aGVuIGl0cyBvcHRpb25zIGNoYW5nZSlcbiAgICBHdW4ub24oJ29wdCcsIGZ1bmN0aW9uKGF0KXtcbiAgICAgIGlmKCFhdC5zZWEpeyAvLyBvbmx5IGFkZCBTRUEgb25jZSBwZXIgaW5zdGFuY2UsIG9uIHRoZSBcImF0XCIgY29udGV4dC5cbiAgICAgICAgYXQuc2VhID0ge293bjoge319O1xuICAgICAgICBhdC5vbigncHV0JywgY2hlY2ssIGF0KTsgLy8gU0VBIG5vdyBydW5zIGl0cyBmaXJld2FsbCBvbiBIQU0gZGlmZnMsIG5vdCBhbGwgaS9vLlxuICAgICAgfVxuICAgICAgdGhpcy50by5uZXh0KGF0KTsgLy8gbWFrZSBzdXJlIHRvIGNhbGwgdGhlIFwibmV4dFwiIG1pZGRsZXdhcmUgYWRhcHRlci5cbiAgICB9KTtcblxuICAgIC8vIEFscmlnaHQsIHRoaXMgbmV4dCBhZGFwdGVyIGdldHMgcnVuIGF0IHRoZSBwZXIgbm9kZSBsZXZlbCBpbiB0aGUgZ3JhcGggZGF0YWJhc2UuXG4gICAgLy8gY29ycmVjdGlvbjogMjAyMCBpdCBnZXRzIHJ1biBvbiBlYWNoIGtleS92YWx1ZSBwYWlyIGluIGEgbm9kZSB1cG9uIGEgSEFNIGRpZmYuXG4gICAgLy8gVGhpcyB3aWxsIGxldCB1cyB2ZXJpZnkgdGhhdCBldmVyeSBwcm9wZXJ0eSBvbiBhIG5vZGUgaGFzIGEgdmFsdWUgc2lnbmVkIGJ5IGEgcHVibGljIGtleSB3ZSB0cnVzdC5cbiAgICAvLyBJZiB0aGUgc2lnbmF0dXJlIGRvZXMgbm90IG1hdGNoLCB0aGUgZGF0YSBpcyBqdXN0IGB1bmRlZmluZWRgIHNvIGl0IGRvZXNuJ3QgZ2V0IHBhc3NlZCBvbi5cbiAgICAvLyBJZiBpdCBkb2VzIG1hdGNoLCB0aGVuIHdlIHRyYW5zZm9ybSB0aGUgaW4tbWVtb3J5IFwidmlld1wiIG9mIHRoZSBkYXRhIGludG8gaXRzIHBsYWluIHZhbHVlICh3aXRob3V0IHRoZSBzaWduYXR1cmUpLlxuICAgIC8vIE5vdyBOT1RFISBTb21lIGRhdGEgaXMgXCJzeXN0ZW1cIiBkYXRhLCBub3QgdXNlciBkYXRhLiBFeGFtcGxlOiBMaXN0IG9mIHB1YmxpYyBrZXlzLCBhbGlhc2VzLCBldGMuXG4gICAgLy8gVGhpcyBkYXRhIGlzIHNlbGYtZW5mb3JjZWQgKHRoZSB2YWx1ZSBjYW4gb25seSBtYXRjaCBpdHMgSUQpLCBidXQgdGhhdCBpcyBoYW5kbGVkIGluIHRoZSBgc2VjdXJpdHlgIGZ1bmN0aW9uLlxuICAgIC8vIEZyb20gdGhlIHNlbGYtZW5mb3JjZWQgZGF0YSwgd2UgY2FuIHNlZSBhbGwgdGhlIGVkZ2VzIGluIHRoZSBncmFwaCB0aGF0IGJlbG9uZyB0byBhIHB1YmxpYyBrZXkuXG4gICAgLy8gRXhhbXBsZTogfkFTREYgaXMgdGhlIElEIG9mIGEgbm9kZSB3aXRoIEFTREYgYXMgaXRzIHB1YmxpYyBrZXksIHNpZ25lZCBhbGlhcyBhbmQgc2FsdCwgYW5kXG4gICAgLy8gaXRzIGVuY3J5cHRlZCBwcml2YXRlIGtleSwgYnV0IGl0IG1pZ2h0IGFsc28gaGF2ZSBvdGhlciBzaWduZWQgdmFsdWVzIG9uIGl0IGxpa2UgYHByb2ZpbGUgPSA8SUQ+YCBlZGdlLlxuICAgIC8vIFVzaW5nIHRoYXQgZGlyZWN0ZWQgZWRnZSdzIElELCB3ZSBjYW4gdGhlbiB0cmFjayAoaW4gbWVtb3J5KSB3aGljaCBJRHMgYmVsb25nIHRvIHdoaWNoIGtleXMuXG4gICAgLy8gSGVyZSBpcyBhIHByb2JsZW06IE11bHRpcGxlIHB1YmxpYyBrZXlzIGNhbiBcImNsYWltXCIgYW55IG5vZGUncyBJRCwgc28gdGhpcyBpcyBkYW5nZXJvdXMhXG4gICAgLy8gVGhpcyBtZWFucyB3ZSBzaG91bGQgT05MWSB0cnVzdCBvdXIgXCJmcmllbmRzXCIgKG91ciBrZXkgcmluZykgcHVibGljIGtleXMsIG5vdCBhbnkgb25lcy5cbiAgICAvLyBJIGhhdmUgbm90IHlldCBhZGRlZCB0aGF0IHRvIFNFQSB5ZXQgaW4gdGhpcyBhbHBoYSByZWxlYXNlLiBUaGF0IGlzIGNvbWluZyBzb29uLCBidXQgYmV3YXJlIGluIHRoZSBtZWFud2hpbGUhXG5cbiAgICBmdW5jdGlvbiBjaGVjayhtc2cpeyAvLyBSRVZJU0UgLyBJTVBST1ZFLCBOTyBORUVEIFRPIFBBU1MgTVNHL0VWRSBFQUNIIFNVQj9cbiAgICAgIHZhciBldmUgPSB0aGlzLCBhdCA9IGV2ZS5hcywgcHV0ID0gbXNnLnB1dCwgc291bCA9IHB1dFsnIyddLCBrZXkgPSBwdXRbJy4nXSwgdmFsID0gcHV0Wyc6J10sIHN0YXRlID0gcHV0Wyc+J10sIGlkID0gbXNnWycjJ10sIHRtcDtcbiAgICAgIGlmKCFzb3VsIHx8ICFrZXkpeyByZXR1cm4gfVxuICAgICAgaWYoKG1zZy5ffHwnJykuZmFpdGggJiYgKGF0Lm9wdHx8JycpLmZhaXRoICYmICdmdW5jdGlvbicgPT0gdHlwZW9mIG1zZy5fKXtcbiAgICAgICAgU0VBLm9wdC5wYWNrKHB1dCwgZnVuY3Rpb24ocmF3KXtcbiAgICAgICAgU0VBLnZlcmlmeShyYXcsIGZhbHNlLCBmdW5jdGlvbihkYXRhKXsgLy8gdGhpcyBpcyBzeW5jaHJvbm91cyBpZiBmYWxzZVxuICAgICAgICAgIHB1dFsnPSddID0gU0VBLm9wdC51bnBhY2soZGF0YSk7XG4gICAgICAgICAgZXZlLnRvLm5leHQobXNnKTtcbiAgICAgICAgfSl9KVxuICAgICAgICByZXR1cm4gXG4gICAgICB9XG4gICAgICB2YXIgbm8gPSBmdW5jdGlvbih3aHkpeyBhdC5vbignaW4nLCB7J0AnOiBpZCwgZXJyOiBtc2cuZXJyID0gd2h5fSkgfTsgLy8gZXhwbG9pdCBpbnRlcm5hbCByZWxheSBzdHVuIGZvciBub3csIG1heWJlIHZpb2xhdGVzIHNwZWMsIGJ1dCB0ZXN0aW5nIGZvciBub3cuIC8vIE5vdGU6IHRoaXMgbWF5IGJlIG9ubHkgdGhlIHNoYXJkZWQgbWVzc2FnZSwgbm90IG9yaWdpbmFsIGJhdGNoLlxuICAgICAgLy92YXIgbm8gPSBmdW5jdGlvbih3aHkpeyBtc2cuYWNrKHdoeSkgfTtcbiAgICAgIChtc2cuX3x8JycpLkRCRyAmJiAoKG1zZy5ffHwnJykuREJHLmMgPSArbmV3IERhdGUpO1xuICAgICAgaWYoMCA8PSBzb3VsLmluZGV4T2YoJzw/JykpeyAvLyBzcGVjaWFsIGNhc2UgZm9yIFwiZG8gbm90IHN5bmMgZGF0YSBYIG9sZFwiIGZvcmdldFxuICAgICAgICAvLyAnYX5wdWIua2V5L2I8PzknXG4gICAgICAgIHRtcCA9IHBhcnNlRmxvYXQoc291bC5zcGxpdCgnPD8nKVsxXXx8JycpO1xuICAgICAgICBpZih0bXAgJiYgKHN0YXRlIDwgKEd1bi5zdGF0ZSgpIC0gKHRtcCAqIDEwMDApKSkpeyAvLyBzZWMgdG8gbXNcbiAgICAgICAgICAodG1wID0gbXNnLl8pICYmICh0bXAuc3R1bikgJiYgKHRtcC5zdHVuLS0pOyAvLyBUSElTIElTIEJBRCBDT0RFISBJdCBhc3N1bWVzIEdVTiBpbnRlcm5hbHMgZG8gc29tZXRoaW5nIHRoYXQgd2lsbCBwcm9iYWJseSBjaGFuZ2UgaW4gZnV0dXJlLCBidXQgaGFja2luZyBpbiBub3cuXG4gICAgICAgICAgcmV0dXJuOyAvLyBvbWl0IVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKCd+QCcgPT09IHNvdWwpeyAgLy8gc3BlY2lhbCBjYXNlIGZvciBzaGFyZWQgc3lzdGVtIGRhdGEsIHRoZSBsaXN0IG9mIGFsaWFzZXMuXG4gICAgICAgIGNoZWNrLmFsaWFzKGV2ZSwgbXNnLCB2YWwsIGtleSwgc291bCwgYXQsIG5vKTsgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYoJ35AJyA9PT0gc291bC5zbGljZSgwLDIpKXsgLy8gc3BlY2lhbCBjYXNlIGZvciBzaGFyZWQgc3lzdGVtIGRhdGEsIHRoZSBsaXN0IG9mIHB1YmxpYyBrZXlzIGZvciBhbiBhbGlhcy5cbiAgICAgICAgY2hlY2sucHVicyhldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubyk7IHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vaWYoJ34nID09PSBzb3VsLnNsaWNlKDAsMSkgJiYgMiA9PT0gKHRtcCA9IHNvdWwuc2xpY2UoMSkpLnNwbGl0KCcuJykubGVuZ3RoKXsgLy8gc3BlY2lhbCBjYXNlLCBhY2NvdW50IGRhdGEgZm9yIGEgcHVibGljIGtleS5cbiAgICAgIGlmKHRtcCA9IFNFQS5vcHQucHViKHNvdWwpKXsgLy8gc3BlY2lhbCBjYXNlLCBhY2NvdW50IGRhdGEgZm9yIGEgcHVibGljIGtleS5cbiAgICAgICAgY2hlY2sucHViKGV2ZSwgbXNnLCB2YWwsIGtleSwgc291bCwgYXQsIG5vLCBhdC51c2VyfHwnJywgdG1wKTsgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYoMCA8PSBzb3VsLmluZGV4T2YoJyMnKSl7IC8vIHNwZWNpYWwgY2FzZSBmb3IgY29udGVudCBhZGRyZXNzaW5nIGltbXV0YWJsZSBoYXNoZWQgZGF0YS5cbiAgICAgICAgY2hlY2suaGFzaChldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubyk7IHJldHVybjtcbiAgICAgIH0gXG4gICAgICBjaGVjay5hbnkoZXZlLCBtc2csIHZhbCwga2V5LCBzb3VsLCBhdCwgbm8sIGF0LnVzZXJ8fCcnKTsgcmV0dXJuO1xuICAgICAgZXZlLnRvLm5leHQobXNnKTsgLy8gbm90IGhhbmRsZWRcbiAgICB9XG4gICAgY2hlY2suaGFzaCA9IGZ1bmN0aW9uKGV2ZSwgbXNnLCB2YWwsIGtleSwgc291bCwgYXQsIG5vKXtcbiAgICAgIFNFQS53b3JrKHZhbCwgbnVsbCwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGlmKGRhdGEgJiYgZGF0YSA9PT0ga2V5LnNwbGl0KCcjJykuc2xpY2UoLTEpWzBdKXsgcmV0dXJuIGV2ZS50by5uZXh0KG1zZykgfVxuICAgICAgICBubyhcIkRhdGEgaGFzaCBub3Qgc2FtZSBhcyBoYXNoIVwiKTtcbiAgICAgIH0sIHtuYW1lOiAnU0hBLTI1Nid9KTtcbiAgICB9XG4gICAgY2hlY2suYWxpYXMgPSBmdW5jdGlvbihldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubyl7IC8vIEV4YW1wbGU6IHtfOiN+QCwgfkBhbGljZTogeyN+QGFsaWNlfX1cbiAgICAgIGlmKCF2YWwpeyByZXR1cm4gbm8oXCJEYXRhIG11c3QgZXhpc3QhXCIpIH0gLy8gZGF0YSBNVVNUIGV4aXN0XG4gICAgICBpZignfkAnK2tleSA9PT0gbGlua19pcyh2YWwpKXsgcmV0dXJuIGV2ZS50by5uZXh0KG1zZykgfSAvLyBpbiBmYWN0LCBpdCBtdXN0IGJlIEVYQUNUTFkgZXF1YWwgdG8gaXRzZWxmXG4gICAgICBubyhcIkFsaWFzIG5vdCBzYW1lIVwiKTsgLy8gaWYgaXQgaXNuJ3QsIHJlamVjdC5cbiAgICB9O1xuICAgIGNoZWNrLnB1YnMgPSBmdW5jdGlvbihldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubyl7IC8vIEV4YW1wbGU6IHtfOiN+QGFsaWNlLCB+YXNkZjogeyN+YXNkZn19XG4gICAgICBpZighdmFsKXsgcmV0dXJuIG5vKFwiQWxpYXMgbXVzdCBleGlzdCFcIikgfSAvLyBkYXRhIE1VU1QgZXhpc3RcbiAgICAgIGlmKGtleSA9PT0gbGlua19pcyh2YWwpKXsgcmV0dXJuIGV2ZS50by5uZXh0KG1zZykgfSAvLyBhbmQgdGhlIElEIG11c3QgYmUgRVhBQ1RMWSBlcXVhbCB0byBpdHMgcHJvcGVydHlcbiAgICAgIG5vKFwiQWxpYXMgbm90IHNhbWUhXCIpOyAvLyB0aGF0IHdheSBub2JvZHkgY2FuIHRhbXBlciB3aXRoIHRoZSBsaXN0IG9mIHB1YmxpYyBrZXlzLlxuICAgIH07XG4gICAgY2hlY2sucHViID0gYXN5bmMgZnVuY3Rpb24oZXZlLCBtc2csIHZhbCwga2V5LCBzb3VsLCBhdCwgbm8sIHVzZXIsIHB1Yil7IHZhciB0bXAgLy8gRXhhbXBsZToge186I35hc2RmLCBoZWxsbzond29ybGQnfmZkc2F9fVxuICAgICAgY29uc3QgcmF3ID0gYXdhaXQgUy5wYXJzZSh2YWwpIHx8IHt9XG4gICAgICBjb25zdCB2ZXJpZnkgPSAoY2VydGlmaWNhdGUsIGNlcnRpZmljYW50LCBjYikgPT4ge1xuICAgICAgICBpZiAoY2VydGlmaWNhdGUubSAmJiBjZXJ0aWZpY2F0ZS5zICYmIGNlcnRpZmljYW50ICYmIHB1YilcbiAgICAgICAgICAvLyBub3cgdmVyaWZ5IGNlcnRpZmljYXRlXG4gICAgICAgICAgcmV0dXJuIFNFQS52ZXJpZnkoY2VydGlmaWNhdGUsIHB1YiwgZGF0YSA9PiB7IC8vIGNoZWNrIGlmIFwicHViXCIgKG9mIHRoZSBncmFwaCBvd25lcikgcmVhbGx5IGlzc3VlZCB0aGlzIGNlcnRcbiAgICAgICAgICAgIGlmICh1ICE9PSBkYXRhICYmIHUgIT09IGRhdGEuZSAmJiBtc2cucHV0Wyc+J10gJiYgbXNnLnB1dFsnPiddID4gcGFyc2VGbG9hdChkYXRhLmUpKSByZXR1cm4gbm8oXCJDZXJ0aWZpY2F0ZSBleHBpcmVkLlwiKSAvLyBjZXJ0aWZpY2F0ZSBleHBpcmVkXG4gICAgICAgICAgICAvLyBcImRhdGEuY1wiID0gYSBsaXN0IG9mIGNlcnRpZmljYW50cy9jZXJ0aWZpZWQgdXNlcnNcbiAgICAgICAgICAgIC8vIFwiZGF0YS53XCIgPSBsZXggV1JJVEUgcGVybWlzc2lvbiwgaW4gdGhlIGZ1dHVyZSwgdGhlcmUgd2lsbCBiZSBcImRhdGEuclwiIHdoaWNoIG1lYW5zIGxleCBSRUFEIHBlcm1pc3Npb25cbiAgICAgICAgICAgIGlmICh1ICE9PSBkYXRhICYmIGRhdGEuYyAmJiBkYXRhLncgJiYgKGRhdGEuYyA9PT0gY2VydGlmaWNhbnQgfHwgZGF0YS5jLmluZGV4T2YoJyonIHx8IGNlcnRpZmljYW50KSA+IC0xKSkge1xuICAgICAgICAgICAgICAvLyBvaywgbm93IFwiY2VydGlmaWNhbnRcIiBpcyBpbiB0aGUgXCJjZXJ0aWZpY2FudHNcIiBsaXN0LCBidXQgaXMgXCJwYXRoXCIgYWxsb3dlZD8gQ2hlY2sgcGF0aFxuICAgICAgICAgICAgICBsZXQgcGF0aCA9IHNvdWwuaW5kZXhPZignLycpID4gLTEgPyBzb3VsLnJlcGxhY2Uoc291bC5zdWJzdHJpbmcoMCwgc291bC5pbmRleE9mKCcvJykgKyAxKSwgJycpIDogJydcbiAgICAgICAgICAgICAgU3RyaW5nLm1hdGNoID0gU3RyaW5nLm1hdGNoIHx8IEd1bi50ZXh0Lm1hdGNoXG4gICAgICAgICAgICAgIGNvbnN0IHcgPSBBcnJheS5pc0FycmF5KGRhdGEudykgPyBkYXRhLncgOiB0eXBlb2YgZGF0YS53ID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgZGF0YS53ID09PSAnc3RyaW5nJyA/IFtkYXRhLnddIDogW11cbiAgICAgICAgICAgICAgZm9yIChjb25zdCBsZXggb2Ygdykge1xuICAgICAgICAgICAgICAgIGlmICgoU3RyaW5nLm1hdGNoKHBhdGgsIGxleFsnIyddKSAmJiBTdHJpbmcubWF0Y2goa2V5LCBsZXhbJy4nXSkpIHx8ICghbGV4WycuJ10gJiYgU3RyaW5nLm1hdGNoKHBhdGgsIGxleFsnIyddKSkgfHwgKCFsZXhbJyMnXSAmJiBTdHJpbmcubWF0Y2goa2V5LCBsZXhbJy4nXSkpIHx8IFN0cmluZy5tYXRjaCgocGF0aCA/IHBhdGggKyAnLycgKyBrZXkgOiBrZXkpLCBsZXhbJyMnXSB8fCBsZXgpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBpcyBDZXJ0aWZpY2FudCBmb3JjZWQgdG8gcHJlc2VudCBpbiBQYXRoXG4gICAgICAgICAgICAgICAgICBpZiAobGV4WycrJ10gJiYgbGV4WycrJ10uaW5kZXhPZignKicpID4gLTEgJiYgcGF0aCAmJiBwYXRoLmluZGV4T2YoY2VydGlmaWNhbnQpID09IC0xICYmIGtleS5pbmRleE9mKGNlcnRpZmljYW50KSA9PSAtMSkgcmV0dXJuIG5vKGBQYXRoIFwiJHtwYXRofVwiIG9yIGtleSBcIiR7a2V5fVwiIG11c3QgY29udGFpbiBzdHJpbmcgXCIke2NlcnRpZmljYW50fVwiLmApXG4gICAgICAgICAgICAgICAgICAvLyBwYXRoIGlzIGFsbG93ZWQsIGJ1dCBpcyB0aGVyZSBhbnkgV1JJVEUgYmxvY2s/IENoZWNrIGl0IG91dFxuICAgICAgICAgICAgICAgICAgaWYgKGRhdGEud2IgJiYgKHR5cGVvZiBkYXRhLndiID09PSAnc3RyaW5nJyB8fCAoKGRhdGEud2IgfHwge30pWycjJ10pKSkgeyAvLyBcImRhdGEud2JcIiA9IHBhdGggdG8gdGhlIFdSSVRFIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIHZhciByb290ID0gZXZlLmFzLnJvb3QuJC5iYWNrKC0xKVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEud2IgPT09ICdzdHJpbmcnICYmICd+JyAhPT0gZGF0YS53Yi5zbGljZSgwLCAxKSkgcm9vdCA9IHJvb3QuZ2V0KCd+JyArIHB1YilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb3QuZ2V0KGRhdGEud2IpLmdldChjZXJ0aWZpY2FudCkub25jZSh2YWx1ZSA9PiB7IC8vIFRPRE86IElOVEVOVCBUTyBERVBSRUNBVEUuXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmICh2YWx1ZSA9PT0gMSB8fCB2YWx1ZSA9PT0gdHJ1ZSkpIHJldHVybiBubyhgQ2VydGlmaWNhbnQgJHtjZXJ0aWZpY2FudH0gYmxvY2tlZC5gKVxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihkYXRhKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKGRhdGEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBubyhcIkNlcnRpZmljYXRlIHZlcmlmaWNhdGlvbiBmYWlsLlwiKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoJ3B1YicgPT09IGtleSAmJiAnficgKyBwdWIgPT09IHNvdWwpIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gcHViKSByZXR1cm4gZXZlLnRvLm5leHQobXNnKSAvLyB0aGUgYWNjb3VudCBNVVNUIG1hdGNoIGBwdWJgIHByb3BlcnR5IHRoYXQgZXF1YWxzIHRoZSBJRCBvZiB0aGUgcHVibGljIGtleS5cbiAgICAgICAgcmV0dXJuIG5vKFwiQWNjb3VudCBub3Qgc2FtZSFcIilcbiAgICAgIH1cblxuICAgICAgaWYgKCh0bXAgPSB1c2VyLmlzKSAmJiB0bXAucHViICYmICFyYXdbJyonXSAmJiAhcmF3WycrJ10gJiYgKHB1YiA9PT0gdG1wLnB1YiB8fCAocHViICE9PSB0bXAucHViICYmICgobXNnLl8ubXNnIHx8IHt9KS5vcHQgfHwge30pLmNlcnQpKSl7XG4gICAgICAgIFNFQS5vcHQucGFjayhtc2cucHV0LCBwYWNrZWQgPT4ge1xuICAgICAgICAgIFNFQS5zaWduKHBhY2tlZCwgKHVzZXIuXykuc2VhLCBhc3luYyBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBpZiAodSA9PT0gZGF0YSkgcmV0dXJuIG5vKFNFQS5lcnIgfHwgJ1NpZ25hdHVyZSBmYWlsLicpXG4gICAgICAgICAgICBtc2cucHV0Wyc6J10gPSB7JzonOiB0bXAgPSBTRUEub3B0LnVucGFjayhkYXRhLm0pLCAnfic6IGRhdGEuc31cbiAgICAgICAgICAgIG1zZy5wdXRbJz0nXSA9IHRtcFxuICBcbiAgICAgICAgICAgIC8vIGlmIHdyaXRpbmcgdG8gb3duIGdyYXBoLCBqdXN0IGFsbG93IGl0XG4gICAgICAgICAgICBpZiAocHViID09PSB1c2VyLmlzLnB1Yikge1xuICAgICAgICAgICAgICBpZiAodG1wID0gbGlua19pcyh2YWwpKSAoYXQuc2VhLm93blt0bXBdID0gYXQuc2VhLm93blt0bXBdIHx8IHt9KVtwdWJdID0gMVxuICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeUFzeW5jKG1zZy5wdXRbJzonXSwgZnVuY3Rpb24oZXJyLHMpe1xuICAgICAgICAgICAgICAgIGlmKGVycil7IHJldHVybiBubyhlcnIgfHwgXCJTdHJpbmdpZnkgZXJyb3IuXCIpIH1cbiAgICAgICAgICAgICAgICBtc2cucHV0Wyc6J10gPSBzO1xuICAgICAgICAgICAgICAgIHJldHVybiBldmUudG8ubmV4dChtc2cpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgXG4gICAgICAgICAgICAvLyBpZiB3cml0aW5nIHRvIG90aGVyJ3MgZ3JhcGgsIGNoZWNrIGlmIGNlcnQgZXhpc3RzIHRoZW4gdHJ5IHRvIGluamVjdCBjZXJ0IGludG8gcHV0LCBhbHNvIGluamVjdCBzZWxmIHB1YiBzbyB0aGF0IGV2ZXJ5b25lIGNhbiB2ZXJpZnkgdGhlIHB1dFxuICAgICAgICAgICAgaWYgKHB1YiAhPT0gdXNlci5pcy5wdWIgJiYgKChtc2cuXy5tc2cgfHwge30pLm9wdCB8fCB7fSkuY2VydCkge1xuICAgICAgICAgICAgICBjb25zdCBjZXJ0ID0gYXdhaXQgUy5wYXJzZShtc2cuXy5tc2cub3B0LmNlcnQpXG4gICAgICAgICAgICAgIC8vIGV2ZW4gaWYgY2VydCBleGlzdHMsIHdlIG11c3QgdmVyaWZ5IGl0XG4gICAgICAgICAgICAgIGlmIChjZXJ0ICYmIGNlcnQubSAmJiBjZXJ0LnMpXG4gICAgICAgICAgICAgICAgdmVyaWZ5KGNlcnQsIHVzZXIuaXMucHViLCBfID0+IHtcbiAgICAgICAgICAgICAgICAgIG1zZy5wdXRbJzonXVsnKyddID0gY2VydCAvLyAnKycgaXMgYSBjZXJ0aWZpY2F0ZVxuICAgICAgICAgICAgICAgICAgbXNnLnB1dFsnOiddWycqJ10gPSB1c2VyLmlzLnB1YiAvLyAnKicgaXMgcHViIG9mIHRoZSB1c2VyIHdobyBwdXRzXG4gICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeUFzeW5jKG1zZy5wdXRbJzonXSwgZnVuY3Rpb24oZXJyLHMpe1xuICAgICAgICAgICAgICAgICAgICBpZihlcnIpeyByZXR1cm4gbm8oZXJyIHx8IFwiU3RyaW5naWZ5IGVycm9yLlwiKSB9XG4gICAgICAgICAgICAgICAgICAgIG1zZy5wdXRbJzonXSA9IHM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldmUudG8ubmV4dChtc2cpO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwge3JhdzogMX0pXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgU0VBLm9wdC5wYWNrKG1zZy5wdXQsIHBhY2tlZCA9PiB7XG4gICAgICAgIFNFQS52ZXJpZnkocGFja2VkLCByYXdbJyonXSB8fCBwdWIsIGZ1bmN0aW9uKGRhdGEpeyB2YXIgdG1wO1xuICAgICAgICAgIGRhdGEgPSBTRUEub3B0LnVucGFjayhkYXRhKTtcbiAgICAgICAgICBpZiAodSA9PT0gZGF0YSkgcmV0dXJuIG5vKFwiVW52ZXJpZmllZCBkYXRhLlwiKSAvLyBtYWtlIHN1cmUgdGhlIHNpZ25hdHVyZSBtYXRjaGVzIHRoZSBhY2NvdW50IGl0IGNsYWltcyB0byBiZSBvbi4gLy8gcmVqZWN0IGFueSB1cGRhdGVzIHRoYXQgYXJlIHNpZ25lZCB3aXRoIGEgbWlzbWF0Y2hlZCBhY2NvdW50LlxuICAgICAgICAgIGlmICgodG1wID0gbGlua19pcyhkYXRhKSkgJiYgcHViID09PSBTRUEub3B0LnB1Yih0bXApKSAoYXQuc2VhLm93blt0bXBdID0gYXQuc2VhLm93blt0bXBdIHx8IHt9KVtwdWJdID0gMVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIGNoZWNrIGlmIGNlcnQgKCcrJykgYW5kIHB1dHRlcidzIHB1YiAoJyonKSBleGlzdFxuICAgICAgICAgIGlmIChyYXdbJysnXSAmJiByYXdbJysnXVsnbSddICYmIHJhd1snKyddWydzJ10gJiYgcmF3WycqJ10pXG4gICAgICAgICAgICAvLyBub3cgdmVyaWZ5IGNlcnRpZmljYXRlXG4gICAgICAgICAgICB2ZXJpZnkocmF3WycrJ10sIHJhd1snKiddLCBfID0+IHtcbiAgICAgICAgICAgICAgbXNnLnB1dFsnPSddID0gZGF0YTtcbiAgICAgICAgICAgICAgcmV0dXJuIGV2ZS50by5uZXh0KG1zZyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbXNnLnB1dFsnPSddID0gZGF0YTtcbiAgICAgICAgICAgIHJldHVybiBldmUudG8ubmV4dChtc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgcmV0dXJuXG4gICAgfTtcbiAgICBjaGVjay5hbnkgPSBmdW5jdGlvbihldmUsIG1zZywgdmFsLCBrZXksIHNvdWwsIGF0LCBubywgdXNlcil7IHZhciB0bXAsIHB1YjtcbiAgICAgIGlmKGF0Lm9wdC5zZWN1cmUpeyByZXR1cm4gbm8oXCJTb3VsIG1pc3NpbmcgcHVibGljIGtleSBhdCAnXCIgKyBrZXkgKyBcIicuXCIpIH1cbiAgICAgIC8vIFRPRE86IEFzayBjb21tdW5pdHkgaWYgc2hvdWxkIGF1dG8tc2lnbiBub24gdXNlci1ncmFwaCBkYXRhLlxuICAgICAgYXQub24oJ3NlY3VyZScsIGZ1bmN0aW9uKG1zZyl7IHRoaXMub2ZmKCk7XG4gICAgICAgIGlmKCFhdC5vcHQuc2VjdXJlKXsgcmV0dXJuIGV2ZS50by5uZXh0KG1zZykgfVxuICAgICAgICBubyhcIkRhdGEgY2Fubm90IGJlIGNoYW5nZWQuXCIpO1xuICAgICAgfSkub24ub24oJ3NlY3VyZScsIG1zZyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHZhbGlkID0gR3VuLnZhbGlkLCBsaW5rX2lzID0gZnVuY3Rpb24oZCxsKXsgcmV0dXJuICdzdHJpbmcnID09IHR5cGVvZiAobCA9IHZhbGlkKGQpKSAmJiBsIH0sIHN0YXRlX2lmeSA9IChHdW4uc3RhdGV8fCcnKS5pZnk7XG5cbiAgICB2YXIgcHViY3V0ID0gL1teXFx3Xy1dLzsgLy8gYW55dGhpbmcgbm90IGFscGhhbnVtZXJpYyBvciBfIC1cbiAgICBTRUEub3B0LnB1YiA9IGZ1bmN0aW9uKHMpe1xuICAgICAgaWYoIXMpeyByZXR1cm4gfVxuICAgICAgcyA9IHMuc3BsaXQoJ34nKTtcbiAgICAgIGlmKCFzIHx8ICEocyA9IHNbMV0pKXsgcmV0dXJuIH1cbiAgICAgIHMgPSBzLnNwbGl0KHB1YmN1dCkuc2xpY2UoMCwyKTtcbiAgICAgIGlmKCFzIHx8IDIgIT0gcy5sZW5ndGgpeyByZXR1cm4gfVxuICAgICAgaWYoJ0AnID09PSAoc1swXXx8JycpWzBdKXsgcmV0dXJuIH1cbiAgICAgIHMgPSBzLnNsaWNlKDAsMikuam9pbignLicpO1xuICAgICAgcmV0dXJuIHM7XG4gICAgfVxuICAgIFNFQS5vcHQuc3RyaW5neSA9IGZ1bmN0aW9uKHQpe1xuICAgICAgLy8gVE9ETzogZW5jcnlwdCBldGMuIG5lZWQgdG8gY2hlY2sgc3RyaW5nIHByaW1pdGl2ZS4gTWFrZSBhcyBicmVha2luZyBjaGFuZ2UuXG4gICAgfVxuICAgIFNFQS5vcHQucGFjayA9IGZ1bmN0aW9uKGQsY2IsaywgbixzKXsgdmFyIHRtcCwgZjsgLy8gcGFjayBmb3IgdmVyaWZ5aW5nXG4gICAgICBpZihTRUEub3B0LmNoZWNrKGQpKXsgcmV0dXJuIGNiKGQpIH1cbiAgICAgIGlmKGQgJiYgZFsnIyddICYmIGRbJy4nXSAmJiBkWyc+J10peyB0bXAgPSBkWyc6J107IGYgPSAxIH1cbiAgICAgIEpTT04ucGFyc2VBc3luYyhmPyB0bXAgOiBkLCBmdW5jdGlvbihlcnIsIG1ldGEpe1xuICAgICAgICB2YXIgc2lnID0gKCh1ICE9PSAobWV0YXx8JycpWyc6J10pICYmIChtZXRhfHwnJylbJ34nXSk7IC8vIG9yIGp1c3QgfiBjaGVjaz9cbiAgICAgICAgaWYoIXNpZyl7IGNiKGQpOyByZXR1cm4gfVxuICAgICAgICBjYih7bTogeycjJzpzfHxkWycjJ10sJy4nOmt8fGRbJy4nXSwnOic6KG1ldGF8fCcnKVsnOiddLCc+JzpkWyc+J118fEd1bi5zdGF0ZS5pcyhuLCBrKX0sIHM6IHNpZ30pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBPID0gU0VBLm9wdDtcbiAgICBTRUEub3B0LnVucGFjayA9IGZ1bmN0aW9uKGQsIGssIG4peyB2YXIgdG1wO1xuICAgICAgaWYodSA9PT0gZCl7IHJldHVybiB9XG4gICAgICBpZihkICYmICh1ICE9PSAodG1wID0gZFsnOiddKSkpeyByZXR1cm4gdG1wIH1cbiAgICAgIGsgPSBrIHx8IE8uZmFsbF9rZXk7IGlmKCFuICYmIE8uZmFsbF92YWwpeyBuID0ge307IG5ba10gPSBPLmZhbGxfdmFsIH1cbiAgICAgIGlmKCFrIHx8ICFuKXsgcmV0dXJuIH1cbiAgICAgIGlmKGQgPT09IG5ba10peyByZXR1cm4gZCB9XG4gICAgICBpZighU0VBLm9wdC5jaGVjayhuW2tdKSl7IHJldHVybiBkIH1cbiAgICAgIHZhciBzb3VsID0gKG4gJiYgbi5fICYmIG4uX1snIyddKSB8fCBPLmZhbGxfc291bCwgcyA9IEd1bi5zdGF0ZS5pcyhuLCBrKSB8fCBPLmZhbGxfc3RhdGU7XG4gICAgICBpZihkICYmIDQgPT09IGQubGVuZ3RoICYmIHNvdWwgPT09IGRbMF0gJiYgayA9PT0gZFsxXSAmJiBmbChzKSA9PT0gZmwoZFszXSkpe1xuICAgICAgICByZXR1cm4gZFsyXTtcbiAgICAgIH1cbiAgICAgIGlmKHMgPCBTRUEub3B0LnNodWZmbGVfYXR0YWNrKXtcbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgICB9XG4gICAgfVxuICAgIFNFQS5vcHQuc2h1ZmZsZV9hdHRhY2sgPSAxNTQ2MzI5NjAwMDAwOyAvLyBKYW4gMSwgMjAxOVxuICAgIHZhciBmbCA9IE1hdGguZmxvb3I7IC8vIFRPRE86IFN0aWxsIG5lZWQgdG8gZml4IGluY29uc2lzdGVudCBzdGF0ZSBpc3N1ZS5cbiAgICAvLyBUT0RPOiBQb3RlbnRpYWwgYnVnPyBJZiBwdWIvcHJpdiBrZXkgc3RhcnRzIHdpdGggYC1gPyBJREsgaG93IHBvc3NpYmxlLlxuXG4gIH0pKFVTRSwgJy4vaW5kZXgnKTtcbn0oKSk7XG4iLCJcbi8vIHJlcXVlc3QgLyByZXNwb25zZSBtb2R1bGUsIGZvciBhc2tpbmcgYW5kIGFja2luZyBtZXNzYWdlcy5cbnJlcXVpcmUoJy4vb250bycpOyAvLyBkZXBlbmRzIHVwb24gb250byFcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXNrKGNiLCBhcyl7XG5cdGlmKCF0aGlzLm9uKXsgcmV0dXJuIH1cblx0dmFyIGxhY2sgPSAodGhpcy5vcHR8fHt9KS5sYWNrIHx8IDkwMDA7XG5cdGlmKCEoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2IpKXtcblx0XHRpZighY2IpeyByZXR1cm4gfVxuXHRcdHZhciBpZCA9IGNiWycjJ10gfHwgY2IsIHRtcCA9ICh0aGlzLnRhZ3x8JycpW2lkXTtcblx0XHRpZighdG1wKXsgcmV0dXJuIH1cblx0XHRpZihhcyl7XG5cdFx0XHR0bXAgPSB0aGlzLm9uKGlkLCBhcyk7XG5cdFx0XHRjbGVhclRpbWVvdXQodG1wLmVycik7XG5cdFx0XHR0bXAuZXJyID0gc2V0VGltZW91dChmdW5jdGlvbigpeyB0bXAub2ZmKCkgfSwgbGFjayk7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHZhciBpZCA9IChhcyAmJiBhc1snIyddKSB8fCByYW5kb20oOSk7XG5cdGlmKCFjYil7IHJldHVybiBpZCB9XG5cdHZhciB0byA9IHRoaXMub24oaWQsIGNiLCBhcyk7XG5cdHRvLmVyciA9IHRvLmVyciB8fCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHRvLm9mZigpO1xuXHRcdHRvLm5leHQoe2VycjogXCJFcnJvcjogTm8gQUNLIHlldC5cIiwgbGFjazogdHJ1ZX0pO1xuXHR9LCBsYWNrKTtcblx0cmV0dXJuIGlkO1xufVxudmFyIHJhbmRvbSA9IFN0cmluZy5yYW5kb20gfHwgZnVuY3Rpb24oKXsgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpIH1cblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9yb290Jyk7XG5HdW4uY2hhaW4uYmFjayA9IGZ1bmN0aW9uKG4sIG9wdCl7IHZhciB0bXA7XG5cdG4gPSBuIHx8IDE7XG5cdGlmKC0xID09PSBuIHx8IEluZmluaXR5ID09PSBuKXtcblx0XHRyZXR1cm4gdGhpcy5fLnJvb3QuJDtcblx0fSBlbHNlXG5cdGlmKDEgPT09IG4pe1xuXHRcdHJldHVybiAodGhpcy5fLmJhY2sgfHwgdGhpcy5fKS4kO1xuXHR9XG5cdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fO1xuXHRpZih0eXBlb2YgbiA9PT0gJ3N0cmluZycpe1xuXHRcdG4gPSBuLnNwbGl0KCcuJyk7XG5cdH1cblx0aWYobiBpbnN0YW5jZW9mIEFycmF5KXtcblx0XHR2YXIgaSA9IDAsIGwgPSBuLmxlbmd0aCwgdG1wID0gYXQ7XG5cdFx0Zm9yKGk7IGkgPCBsOyBpKyspe1xuXHRcdFx0dG1wID0gKHRtcHx8ZW1wdHkpW25baV1dO1xuXHRcdH1cblx0XHRpZih1ICE9PSB0bXApe1xuXHRcdFx0cmV0dXJuIG9wdD8gZ3VuIDogdG1wO1xuXHRcdH0gZWxzZVxuXHRcdGlmKCh0bXAgPSBhdC5iYWNrKSl7XG5cdFx0XHRyZXR1cm4gdG1wLiQuYmFjayhuLCBvcHQpO1xuXHRcdH1cblx0XHRyZXR1cm47XG5cdH1cblx0aWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygbil7XG5cdFx0dmFyIHllcywgdG1wID0ge2JhY2s6IGF0fTtcblx0XHR3aGlsZSgodG1wID0gdG1wLmJhY2spXG5cdFx0JiYgdSA9PT0gKHllcyA9IG4odG1wLCBvcHQpKSl7fVxuXHRcdHJldHVybiB5ZXM7XG5cdH1cblx0aWYoJ251bWJlcicgPT0gdHlwZW9mIG4pe1xuXHRcdHJldHVybiAoYXQuYmFjayB8fCBhdCkuJC5iYWNrKG4gLSAxKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cbnZhciBlbXB0eSA9IHt9LCB1O1xuXHQiLCJcbi8vIFdBUk5JTkc6IEdVTiBpcyB2ZXJ5IHNpbXBsZSwgYnV0IHRoZSBKYXZhU2NyaXB0IGNoYWluaW5nIEFQSSBhcm91bmQgR1VOXG4vLyBpcyBjb21wbGljYXRlZCBhbmQgd2FzIGV4dHJlbWVseSBoYXJkIHRvIGJ1aWxkLiBJZiB5b3UgcG9ydCBHVU4gdG8gYW5vdGhlclxuLy8gbGFuZ3VhZ2UsIGNvbnNpZGVyIGltcGxlbWVudGluZyBhbiBlYXNpZXIgQVBJIHRvIGJ1aWxkLlxudmFyIEd1biA9IHJlcXVpcmUoJy4vcm9vdCcpO1xuR3VuLmNoYWluLmNoYWluID0gZnVuY3Rpb24oc3ViKXtcblx0dmFyIGd1biA9IHRoaXMsIGF0ID0gZ3VuLl8sIGNoYWluID0gbmV3IChzdWIgfHwgZ3VuKS5jb25zdHJ1Y3RvcihndW4pLCBjYXQgPSBjaGFpbi5fLCByb290O1xuXHRjYXQucm9vdCA9IHJvb3QgPSBhdC5yb290O1xuXHRjYXQuaWQgPSArK3Jvb3Qub25jZTtcblx0Y2F0LmJhY2sgPSBndW4uXztcblx0Y2F0Lm9uID0gR3VuLm9uO1xuXHRjYXQub24oJ2luJywgR3VuLm9uLmluLCBjYXQpOyAvLyBGb3IgJ2luJyBpZiBJIGFkZCBteSBvd24gbGlzdGVuZXJzIHRvIGVhY2ggdGhlbiBJIE1VU1QgZG8gaXQgYmVmb3JlIGluIGdldHMgY2FsbGVkLiBJZiBJIGxpc3RlbiBnbG9iYWxseSBmb3IgYWxsIGluY29taW5nIGRhdGEgaW5zdGVhZCB0aG91Z2gsIHJlZ2FyZGxlc3Mgb2YgaW5kaXZpZHVhbCBsaXN0ZW5lcnMsIEkgY2FuIHRyYW5zZm9ybSB0aGUgZGF0YSB0aGVyZSBhbmQgdGhlbiBhcyB3ZWxsLlxuXHRjYXQub24oJ291dCcsIEd1bi5vbi5vdXQsIGNhdCk7IC8vIEhvd2V2ZXIgZm9yIG91dHB1dCwgdGhlcmUgaXNuJ3QgcmVhbGx5IHRoZSBnbG9iYWwgb3B0aW9uLiBJIG11c3QgbGlzdGVuIGJ5IGFkZGluZyBteSBvd24gbGlzdGVuZXIgaW5kaXZpZHVhbGx5IEJFRk9SRSB0aGlzIG9uZSBpcyBldmVyIGNhbGxlZC5cblx0cmV0dXJuIGNoYWluO1xufVxuXG5mdW5jdGlvbiBvdXRwdXQobXNnKXtcblx0dmFyIHB1dCwgZ2V0LCBhdCA9IHRoaXMuYXMsIGJhY2sgPSBhdC5iYWNrLCByb290ID0gYXQucm9vdCwgdG1wO1xuXHRpZighbXNnLiQpeyBtc2cuJCA9IGF0LiQgfVxuXHR0aGlzLnRvLm5leHQobXNnKTtcblx0aWYoYXQuZXJyKXsgYXQub24oJ2luJywge3B1dDogYXQucHV0ID0gdSwgJDogYXQuJH0pOyByZXR1cm4gfVxuXHRpZihnZXQgPSBtc2cuZ2V0KXtcblx0XHQvKmlmKHUgIT09IGF0LnB1dCl7XG5cdFx0XHRhdC5vbignaW4nLCBhdCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fSovXG5cdFx0aWYocm9vdC5wYXNzKXsgcm9vdC5wYXNzW2F0LmlkXSA9IGF0OyB9IC8vIHdpbGwgdGhpcyBtYWtlIGZvciBidWdneSBiZWhhdmlvciBlbHNld2hlcmU/XG5cdFx0aWYoYXQubGV4KXsgT2JqZWN0LmtleXMoYXQubGV4KS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBhdC5sZXhba10gfSwgdG1wID0gbXNnLmdldCA9IG1zZy5nZXQgfHwge30pIH1cblx0XHRpZihnZXRbJyMnXSB8fCBhdC5zb3VsKXtcblx0XHRcdGdldFsnIyddID0gZ2V0WycjJ10gfHwgYXQuc291bDtcblx0XHRcdG1zZ1snIyddIHx8IChtc2dbJyMnXSA9IHRleHRfcmFuZCg5KSk7IC8vIEEzMTIwID9cblx0XHRcdGJhY2sgPSAocm9vdC4kLmdldChnZXRbJyMnXSkuXyk7XG5cdFx0XHRpZighKGdldCA9IGdldFsnLiddKSl7IC8vIHNvdWxcblx0XHRcdFx0dG1wID0gYmFjay5hc2sgJiYgYmFjay5hc2tbJyddOyAvLyBjaGVjayBpZiB3ZSBoYXZlIGFscmVhZHkgYXNrZWQgZm9yIHRoZSBmdWxsIG5vZGVcblx0XHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbJyddID0gYmFjazsgLy8gYWRkIGEgZmxhZyB0aGF0IHdlIGFyZSBub3cuXG5cdFx0XHRcdGlmKHUgIT09IGJhY2sucHV0KXsgLy8gaWYgd2UgYWxyZWFkeSBoYXZlIGRhdGEsXG5cdFx0XHRcdFx0YmFjay5vbignaW4nLCBiYWNrKTsgLy8gc2VuZCB3aGF0IGlzIGNhY2hlZCBkb3duIHRoZSBjaGFpblxuXHRcdFx0XHRcdGlmKHRtcCl7IHJldHVybiB9IC8vIGFuZCBkb24ndCBhc2sgZm9yIGl0IGFnYWluLlxuXHRcdFx0XHR9XG5cdFx0XHRcdG1zZy4kID0gYmFjay4kO1xuXHRcdFx0fSBlbHNlXG5cdFx0XHRpZihvYmpfaGFzKGJhY2sucHV0LCBnZXQpKXsgLy8gVE9ETzogc3VwcG9ydCAjTEVYICFcblx0XHRcdFx0dG1wID0gYmFjay5hc2sgJiYgYmFjay5hc2tbZ2V0XTtcblx0XHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbZ2V0XSA9IGJhY2suJC5nZXQoZ2V0KS5fO1xuXHRcdFx0XHRiYWNrLm9uKCdpbicsIHtnZXQ6IGdldCwgcHV0OiB7JyMnOiBiYWNrLnNvdWwsICcuJzogZ2V0LCAnOic6IGJhY2sucHV0W2dldF0sICc+Jzogc3RhdGVfaXMocm9vdC5ncmFwaFtiYWNrLnNvdWxdLCBnZXQpfX0pO1xuXHRcdFx0XHRpZih0bXApeyByZXR1cm4gfVxuXHRcdFx0fVxuXHRcdFx0XHQvKnB1dCA9IChiYWNrLiQuZ2V0KGdldCkuXyk7XG5cdFx0XHRcdGlmKCEodG1wID0gcHV0LmFjaykpeyBwdXQuYWNrID0gLTEgfVxuXHRcdFx0XHRiYWNrLm9uKCdpbicsIHtcblx0XHRcdFx0XHQkOiBiYWNrLiQsXG5cdFx0XHRcdFx0cHV0OiBHdW4uc3RhdGUuaWZ5KHt9LCBnZXQsIEd1bi5zdGF0ZShiYWNrLnB1dCwgZ2V0KSwgYmFjay5wdXRbZ2V0XSksXG5cdFx0XHRcdFx0Z2V0OiBiYWNrLmdldFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYodG1wKXsgcmV0dXJuIH1cblx0XHRcdH0gZWxzZVxuXHRcdFx0aWYoJ3N0cmluZycgIT0gdHlwZW9mIGdldCl7XG5cdFx0XHRcdHZhciBwdXQgPSB7fSwgbWV0YSA9IChiYWNrLnB1dHx8e30pLl87XG5cdFx0XHRcdEd1bi5vYmoubWFwKGJhY2sucHV0LCBmdW5jdGlvbih2LGspe1xuXHRcdFx0XHRcdGlmKCFHdW4udGV4dC5tYXRjaChrLCBnZXQpKXsgcmV0dXJuIH1cblx0XHRcdFx0XHRwdXRba10gPSB2O1xuXHRcdFx0XHR9KVxuXHRcdFx0XHRpZighR3VuLm9iai5lbXB0eShwdXQpKXtcblx0XHRcdFx0XHRwdXQuXyA9IG1ldGE7XG5cdFx0XHRcdFx0YmFjay5vbignaW4nLCB7JDogYmFjay4kLCBwdXQ6IHB1dCwgZ2V0OiBiYWNrLmdldH0pXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYodG1wID0gYXQubGV4KXtcblx0XHRcdFx0XHR0bXAgPSAodG1wLl8pIHx8ICh0bXAuXyA9IGZ1bmN0aW9uKCl7fSk7XG5cdFx0XHRcdFx0aWYoYmFjay5hY2sgPCB0bXAuYXNrKXsgdG1wLmFzayA9IGJhY2suYWNrIH1cblx0XHRcdFx0XHRpZih0bXAuYXNrKXsgcmV0dXJuIH1cblx0XHRcdFx0XHR0bXAuYXNrID0gMTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ki9cblx0XHRcdHJvb3QuYXNrKGFjaywgbXNnKTsgLy8gQTMxMjAgP1xuXHRcdFx0cmV0dXJuIHJvb3Qub24oJ2luJywgbXNnKTtcblx0XHR9XG5cdFx0Ly9pZihyb290Lm5vdyl7IHJvb3Qubm93W2F0LmlkXSA9IHJvb3Qubm93W2F0LmlkXSB8fCB0cnVlOyBhdC5wYXNzID0ge30gfVxuXHRcdGlmKGdldFsnLiddKXtcblx0XHRcdGlmKGF0LmdldCl7XG5cdFx0XHRcdG1zZyA9IHtnZXQ6IHsnLic6IGF0LmdldH0sICQ6IGF0LiR9O1xuXHRcdFx0XHQoYmFjay5hc2sgfHwgKGJhY2suYXNrID0ge30pKVthdC5nZXRdID0gbXNnLiQuXzsgLy8gVE9ETzogUEVSRk9STUFOQ0U/IE1vcmUgZWxlZ2FudCB3YXk/XG5cdFx0XHRcdHJldHVybiBiYWNrLm9uKCdvdXQnLCBtc2cpO1xuXHRcdFx0fVxuXHRcdFx0bXNnID0ge2dldDogYXQubGV4PyBtc2cuZ2V0IDoge30sICQ6IGF0LiR9O1xuXHRcdFx0cmV0dXJuIGJhY2sub24oJ291dCcsIG1zZyk7XG5cdFx0fVxuXHRcdChhdC5hc2sgfHwgKGF0LmFzayA9IHt9KSlbJyddID0gYXQ7XHQgLy9hdC5hY2sgPSBhdC5hY2sgfHwgLTE7XG5cdFx0aWYoYXQuZ2V0KXtcblx0XHRcdGdldFsnLiddID0gYXQuZ2V0O1xuXHRcdFx0KGJhY2suYXNrIHx8IChiYWNrLmFzayA9IHt9KSlbYXQuZ2V0XSA9IG1zZy4kLl87IC8vIFRPRE86IFBFUkZPUk1BTkNFPyBNb3JlIGVsZWdhbnQgd2F5P1xuXHRcdFx0cmV0dXJuIGJhY2sub24oJ291dCcsIG1zZyk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBiYWNrLm9uKCdvdXQnLCBtc2cpO1xufTsgR3VuLm9uLm91dCA9IG91dHB1dDtcblxuZnVuY3Rpb24gaW5wdXQobXNnLCBjYXQpeyBjYXQgPSBjYXQgfHwgdGhpcy5hczsgLy8gVE9ETzogVjggbWF5IG5vdCBiZSBhYmxlIHRvIG9wdGltaXplIGZ1bmN0aW9ucyB3aXRoIGRpZmZlcmVudCBwYXJhbWV0ZXIgY2FsbHMsIHNvIHRyeSB0byBkbyBiZW5jaG1hcmsgdG8gc2VlIGlmIHRoZXJlIGlzIGFueSBhY3R1YWwgZGlmZmVyZW5jZS5cblx0dmFyIHJvb3QgPSBjYXQucm9vdCwgZ3VuID0gbXNnLiQgfHwgKG1zZy4kID0gY2F0LiQpLCBhdCA9IChndW58fCcnKS5fIHx8IGVtcHR5LCB0bXAgPSBtc2cucHV0fHwnJywgc291bCA9IHRtcFsnIyddLCBrZXkgPSB0bXBbJy4nXSwgY2hhbmdlID0gKHUgIT09IHRtcFsnPSddKT8gdG1wWyc9J10gOiB0bXBbJzonXSwgc3RhdGUgPSB0bXBbJz4nXSB8fCAtSW5maW5pdHksIHNhdDsgLy8gZXZlID0gZXZlbnQsIGF0ID0gZGF0YSBhdCwgY2F0ID0gY2hhaW4gYXQsIHNhdCA9IHN1YiBhdCAoY2hpbGRyZW4gY2hhaW5zKS5cblx0aWYodSAhPT0gbXNnLnB1dCAmJiAodSA9PT0gdG1wWycjJ10gfHwgdSA9PT0gdG1wWycuJ10gfHwgKHUgPT09IHRtcFsnOiddICYmIHUgPT09IHRtcFsnPSddKSB8fCB1ID09PSB0bXBbJz4nXSkpeyAvLyBjb252ZXJ0IGZyb20gb2xkIGZvcm1hdFxuXHRcdGlmKCF2YWxpZCh0bXApKXtcblx0XHRcdGlmKCEoc291bCA9ICgodG1wfHwnJykuX3x8JycpWycjJ10pKXsgY29uc29sZS5sb2coXCJjaGFpbiBub3QgeWV0IHN1cHBvcnRlZCBmb3JcIiwgdG1wLCAnLi4uJywgbXNnLCBjYXQpOyByZXR1cm47IH1cblx0XHRcdGd1biA9IGNhdC5yb290LiQuZ2V0KHNvdWwpO1xuXHRcdFx0cmV0dXJuIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyh0bXApLnNvcnQoKSwgZnVuY3Rpb24oayl7IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93IC8vIEJVRz8gP1NvbWUgcmUtaW4gbG9naWMgbWF5IGRlcGVuZCBvbiB0aGlzIGJlaW5nIHN5bmM/XG5cdFx0XHRcdGlmKCdfJyA9PSBrIHx8IHUgPT09IChzdGF0ZSA9IHN0YXRlX2lzKHRtcCwgaykpKXsgcmV0dXJuIH1cblx0XHRcdFx0Y2F0Lm9uKCdpbicsIHskOiBndW4sIHB1dDogeycjJzogc291bCwgJy4nOiBrLCAnPSc6IHRtcFtrXSwgJz4nOiBzdGF0ZX0sIFZJQTogbXNnfSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y2F0Lm9uKCdpbicsIHskOiBhdC5iYWNrLiQsIHB1dDogeycjJzogc291bCA9IGF0LmJhY2suc291bCwgJy4nOiBrZXkgPSBhdC5oYXMgfHwgYXQuZ2V0LCAnPSc6IHRtcCwgJz4nOiBzdGF0ZV9pcyhhdC5iYWNrLnB1dCwga2V5KX0sIHZpYTogbXNnfSk7IC8vIFRPRE86IFRoaXMgY291bGQgYmUgYnVnZ3khIEl0IGFzc3VtZXMvYXBwcm94ZXMgZGF0YSwgb3RoZXIgc3R1ZmYgY291bGQgaGF2ZSBjb3JydXB0ZWQgaXQuXG5cdFx0cmV0dXJuO1xuXHR9XG5cdGlmKChtc2cuc2Vlbnx8JycpW2NhdC5pZF0peyByZXR1cm4gfSAobXNnLnNlZW4gfHwgKG1zZy5zZWVuID0gZnVuY3Rpb24oKXt9KSlbY2F0LmlkXSA9IGNhdDsgLy8gaGVscCBzdG9wIHNvbWUgaW5maW5pdGUgbG9vcHNcblxuXHRpZihjYXQgIT09IGF0KXsgLy8gZG9uJ3Qgd29ycnkgYWJvdXQgdGhpcyB3aGVuIGZpcnN0IHVuZGVyc3RhbmRpbmcgdGhlIGNvZGUsIGl0IGhhbmRsZXMgY2hhbmdpbmcgY29udGV4dHMgb24gYSBtZXNzYWdlLiBBIHNvdWwgY2hhaW4gd2lsbCBuZXZlciBoYXZlIGEgZGlmZmVyZW50IGNvbnRleHQuXG5cdFx0T2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSwgdG1wID0ge30pOyAvLyBtYWtlIGNvcHkgb2YgbWVzc2FnZVxuXHRcdHRtcC5nZXQgPSBjYXQuZ2V0IHx8IHRtcC5nZXQ7XG5cdFx0aWYoIWNhdC5zb3VsICYmICFjYXQuaGFzKXsgLy8gaWYgd2UgZG8gbm90IHJlY29nbml6ZSB0aGUgY2hhaW4gdHlwZVxuXHRcdFx0dG1wLiQkJCA9IHRtcC4kJCQgfHwgY2F0LiQ7IC8vIG1ha2UgYSByZWZlcmVuY2UgdG8gd2hlcmV2ZXIgaXQgY2FtZSBmcm9tLlxuXHRcdH0gZWxzZVxuXHRcdGlmKGF0LnNvdWwpeyAvLyBhIGhhcyAocHJvcGVydHkpIGNoYWluIHdpbGwgaGF2ZSBhIGRpZmZlcmVudCBjb250ZXh0IHNvbWV0aW1lcyBpZiBpdCBpcyBsaW5rZWQgKHRvIGEgc291bCBjaGFpbikuIEFueXRoaW5nIHRoYXQgaXMgbm90IGEgc291bCBvciBoYXMgY2hhaW4sIHdpbGwgYWx3YXlzIGhhdmUgZGlmZmVyZW50IGNvbnRleHRzLlxuXHRcdFx0dG1wLiQgPSBjYXQuJDtcblx0XHRcdHRtcC4kJCA9IHRtcC4kJCB8fCBhdC4kO1xuXHRcdH1cblx0XHRtc2cgPSB0bXA7IC8vIHVzZSB0aGUgbWVzc2FnZSB3aXRoIHRoZSBuZXcgY29udGV4dCBpbnN0ZWFkO1xuXHR9XG5cdHVubGluayhtc2csIGNhdCk7XG5cblx0aWYoKChjYXQuc291bC8qICYmIChjYXQuYXNrfHwnJylbJyddKi8pIHx8IG1zZy4kJCkgJiYgc3RhdGUgPj0gc3RhdGVfaXMocm9vdC5ncmFwaFtzb3VsXSwga2V5KSl7IC8vIFRoZSByb290IGhhcyBhbiBpbi1tZW1vcnkgY2FjaGUgb2YgdGhlIGdyYXBoLCBidXQgaWYgb3VyIHBlZXIgaGFzIGFza2VkIGZvciB0aGUgZGF0YSB0aGVuIHdlIHdhbnQgYSBwZXIgZGVkdXBsaWNhdGVkIGNoYWluIGNvcHkgb2YgdGhlIGRhdGEgdGhhdCBtaWdodCBoYXZlIGxvY2FsIGVkaXRzIG9uIGl0LlxuXHRcdCh0bXAgPSByb290LiQuZ2V0KHNvdWwpLl8pLnB1dCA9IHN0YXRlX2lmeSh0bXAucHV0LCBrZXksIHN0YXRlLCBjaGFuZ2UsIHNvdWwpO1xuXHR9XG5cdGlmKCFhdC5zb3VsIC8qJiYgKGF0LmFza3x8JycpWycnXSovICYmIHN0YXRlID49IHN0YXRlX2lzKHJvb3QuZ3JhcGhbc291bF0sIGtleSkgJiYgKHNhdCA9IChyb290LiQuZ2V0KHNvdWwpLl8ubmV4dHx8JycpW2tleV0pKXsgLy8gU2FtZSBhcyBhYm92ZSBoZXJlLCBidXQgZm9yIG90aGVyIHR5cGVzIG9mIGNoYWlucy4gLy8gVE9ETzogSW1wcm92ZSBwZXJmIGJ5IHByZXZlbnRpbmcgZWNob2VzIHJlY2FjaGluZy5cblx0XHRzYXQucHV0ID0gY2hhbmdlOyAvLyB1cGRhdGUgY2FjaGVcblx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgKHRtcCA9IHZhbGlkKGNoYW5nZSkpKXtcblx0XHRcdHNhdC5wdXQgPSByb290LiQuZ2V0KHRtcCkuXy5wdXQgfHwgY2hhbmdlOyAvLyBzaGFyZSBzYW1lIGNhY2hlIGFzIHdoYXQgd2UncmUgbGlua2VkIHRvLlxuXHRcdH1cblx0fVxuXG5cdHRoaXMudG8gJiYgdGhpcy50by5uZXh0KG1zZyk7IC8vIDFzdCBBUEkgam9iIGlzIHRvIGNhbGwgYWxsIGNoYWluIGxpc3RlbmVycy5cblx0Ly8gVE9ETzogTWFrZSBpbnB1dCBtb3JlIHJldXNhYmxlIGJ5IG9ubHkgZG9pbmcgdGhlc2UgKHNvbWU/KSBjYWxscyBpZiB3ZSBhcmUgYSBjaGFpbiB3ZSByZWNvZ25pemU/IFRoaXMgbWVhbnMgZWFjaCBpbnB1dCBsaXN0ZW5lciB3b3VsZCBiZSByZXNwb25zaWJsZSBmb3Igd2hlbiBsaXN0ZW5lcnMgbmVlZCB0byBiZSBjYWxsZWQsIHdoaWNoIG1ha2VzIHNlbnNlLCBhcyB0aGV5IG1pZ2h0IHdhbnQgdG8gZmlsdGVyLlxuXHRjYXQuYW55ICYmIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhjYXQuYW55KSwgZnVuY3Rpb24oYW55KXsgKGFueSA9IGNhdC5hbnlbYW55XSkgJiYgYW55KG1zZykgfSwwLDk5KTsgLy8gMXN0IEFQSSBqb2IgaXMgdG8gY2FsbCBhbGwgY2hhaW4gbGlzdGVuZXJzLiAvLyBUT0RPOiAua2V5cyggaXMgc2xvdyAvLyBCVUc6IFNvbWUgcmUtaW4gbG9naWMgbWF5IGRlcGVuZCBvbiB0aGlzIGJlaW5nIHN5bmMuXG5cdGNhdC5lY2hvICYmIHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyhjYXQuZWNobyksIGZ1bmN0aW9uKGxhdCl7IChsYXQgPSBjYXQuZWNob1tsYXRdKSAmJiBsYXQub24oJ2luJywgbXNnKSB9LDAsOTkpOyAvLyAmIGxpbmtlZCBhdCBjaGFpbnMgLy8gVE9ETzogLmtleXMoIGlzIHNsb3cgLy8gQlVHOiBTb21lIHJlLWluIGxvZ2ljIG1heSBkZXBlbmQgb24gdGhpcyBiZWluZyBzeW5jLlxuXG5cdGlmKCgobXNnLiQkfHwnJykuX3x8YXQpLnNvdWwpeyAvLyBjb21tZW50cyBhcmUgbGluZWFyLCBidXQgdGhpcyBsaW5lIG9mIGNvZGUgaXMgbm9uLWxpbmVhciwgc28gaWYgSSB3ZXJlIHRvIGNvbW1lbnQgd2hhdCBpdCBkb2VzLCB5b3UnZCBoYXZlIHRvIHJlYWQgNDIgb3RoZXIgY29tbWVudHMgZmlyc3QuLi4gYnV0IHlvdSBjYW4ndCByZWFkIGFueSBvZiB0aG9zZSBjb21tZW50cyB1bnRpbCB5b3UgZmlyc3QgcmVhZCB0aGlzIGNvbW1lbnQuIFdoYXQhPyAvLyBzaG91bGRuJ3QgdGhpcyBtYXRjaCBsaW5rJ3MgY2hlY2s/XG5cdFx0Ly8gaXMgdGhlcmUgY2FzZXMgd2hlcmUgaXQgaXMgYSAkJCB0aGF0IHdlIGRvIE5PVCB3YW50IHRvIGRvIHRoZSBmb2xsb3dpbmc/IFxuXHRcdGlmKChzYXQgPSBjYXQubmV4dCkgJiYgKHNhdCA9IHNhdFtrZXldKSl7IC8vIFRPRE86IHBvc3NpYmxlIHRyaWNrPyBNYXliZSBoYXZlIGBpb25tYXBgIGNvZGUgc2V0IGEgc2F0PyAvLyBUT0RPOiBNYXliZSB3ZSBzaG91bGQgZG8gYGNhdC5hc2tgIGluc3RlYWQ/IEkgZ3Vlc3MgZG9lcyBub3QgbWF0dGVyLlxuXHRcdFx0dG1wID0ge307IE9iamVjdC5rZXlzKG1zZykuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnW2tdIH0pO1xuXHRcdFx0dG1wLiQgPSAobXNnLiQkfHxtc2cuJCkuZ2V0KHRtcC5nZXQgPSBrZXkpOyBkZWxldGUgdG1wLiQkOyBkZWxldGUgdG1wLiQkJDtcblx0XHRcdHNhdC5vbignaW4nLCB0bXApO1xuXHRcdH1cblx0fVxuXG5cdGxpbmsobXNnLCBjYXQpO1xufTsgR3VuLm9uLmluID0gaW5wdXQ7XG5cbmZ1bmN0aW9uIGxpbmsobXNnLCBjYXQpeyBjYXQgPSBjYXQgfHwgdGhpcy5hcyB8fCBtc2cuJC5fO1xuXHRpZihtc2cuJCQgJiYgdGhpcyAhPT0gR3VuLm9uKXsgcmV0dXJuIH0gLy8gJCQgbWVhbnMgd2UgY2FtZSBmcm9tIGEgbGluaywgc28gd2UgYXJlIGF0IHRoZSB3cm9uZyBsZXZlbCwgdGh1cyBpZ25vcmUgaXQgdW5sZXNzIG92ZXJydWxlZCBtYW51YWxseSBieSBiZWluZyBjYWxsZWQgZGlyZWN0bHkuXG5cdGlmKCFtc2cucHV0IHx8IGNhdC5zb3VsKXsgcmV0dXJuIH0gLy8gQnV0IHlvdSBjYW5ub3Qgb3ZlcnJ1bGUgYmVpbmcgbGlua2VkIHRvIG5vdGhpbmcsIG9yIHRyeWluZyB0byBsaW5rIGEgc291bCBjaGFpbiAtIHRoYXQgbXVzdCBuZXZlciBoYXBwZW4uXG5cdHZhciBwdXQgPSBtc2cucHV0fHwnJywgbGluayA9IHB1dFsnPSddfHxwdXRbJzonXSwgdG1wO1xuXHR2YXIgcm9vdCA9IGNhdC5yb290LCB0YXQgPSByb290LiQuZ2V0KHB1dFsnIyddKS5nZXQocHV0WycuJ10pLl87XG5cdGlmKCdzdHJpbmcnICE9IHR5cGVvZiAobGluayA9IHZhbGlkKGxpbmspKSl7XG5cdFx0aWYodGhpcyA9PT0gR3VuLm9uKXsgKHRhdC5lY2hvIHx8ICh0YXQuZWNobyA9IHt9KSlbY2F0LmlkXSA9IGNhdCB9IC8vIGFsbG93IHNvbWUgY2hhaW4gdG8gZXhwbGljaXRseSBmb3JjZSBsaW5raW5nIHRvIHNpbXBsZSBkYXRhLlxuXHRcdHJldHVybjsgLy8gYnkgZGVmYXVsdCBkbyBub3QgbGluayB0byBkYXRhIHRoYXQgaXMgbm90IGEgbGluay5cblx0fVxuXHRpZigodGF0LmVjaG8gfHwgKHRhdC5lY2hvID0ge30pKVtjYXQuaWRdIC8vIHdlJ3ZlIGFscmVhZHkgbGlua2VkIG91cnNlbHZlcyBzbyB3ZSBkbyBub3QgbmVlZCB0byBkbyBpdCBhZ2Fpbi4gRXhjZXB0Li4uIChhbm5veWluZyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzKVxuXHRcdCYmICEocm9vdC5wYXNzfHwnJylbY2F0LmlkXSl7IHJldHVybiB9IC8vIGlmIGEgbmV3IGV2ZW50IGxpc3RlbmVyIHdhcyBhZGRlZCwgd2UgbmVlZCB0byBtYWtlIGEgcGFzcyB0aHJvdWdoIGZvciBpdC4gVGhlIHBhc3Mgd2lsbCBiZSBvbiB0aGUgY2hhaW4sIG5vdCBhbHdheXMgdGhlIGNoYWluIHBhc3NlZCBkb3duLiBcblx0aWYodG1wID0gcm9vdC5wYXNzKXsgaWYodG1wW2xpbmsrY2F0LmlkXSl7IHJldHVybiB9IHRtcFtsaW5rK2NhdC5pZF0gPSAxIH0gLy8gQnV0IHRoZSBhYm92ZSBlZGdlIGNhc2UgbWF5IFwicGFzcyB0aHJvdWdoXCIgb24gYSBjaXJjdWxhciBncmFwaCBjYXVzaW5nIGluZmluaXRlIHBhc3Nlcywgc28gd2UgaGFja2lseSBhZGQgYSB0ZW1wb3JhcnkgY2hlY2sgZm9yIHRoYXQuXG5cblx0KHRhdC5lY2hvfHwodGF0LmVjaG89e30pKVtjYXQuaWRdID0gY2F0OyAvLyBzZXQgb3Vyc2VsZiB1cCBmb3IgdGhlIGVjaG8hIC8vIFRPRE86IEJVRz8gRWNobyB0byBzZWxmIG5vIGxvbmdlciBjYXVzZXMgcHJvYmxlbXM/IENvbmZpcm0uXG5cblx0aWYoY2F0Lmhhcyl7IGNhdC5saW5rID0gbGluayB9XG5cdHZhciBzYXQgPSByb290LiQuZ2V0KHRhdC5saW5rID0gbGluaykuXzsgLy8gZ3JhYiB3aGF0IHdlJ3JlIGxpbmtpbmcgdG8uXG5cdChzYXQuZWNobyB8fCAoc2F0LmVjaG8gPSB7fSkpW3RhdC5pZF0gPSB0YXQ7IC8vIGxpbmsgaXQuXG5cdHZhciB0bXAgPSBjYXQuYXNrfHwnJzsgLy8gYXNrIHRoZSBjaGFpbiBmb3Igd2hhdCBuZWVkcyB0byBiZSBsb2FkZWQgbmV4dCFcblx0aWYodG1wWycnXSB8fCBjYXQubGV4KXsgLy8gd2UgbWlnaHQgbmVlZCB0byBsb2FkIHRoZSB3aG9sZSB0aGluZyAvLyBUT0RPOiBjYXQubGV4IHByb2JhYmx5IGhhcyBlZGdlIGNhc2UgYnVncyB0byBpdCwgbmVlZCBtb3JlIHRlc3QgY292ZXJhZ2UuXG5cdFx0c2F0Lm9uKCdvdXQnLCB7Z2V0OiB7JyMnOiBsaW5rfX0pO1xuXHR9XG5cdHNldFRpbWVvdXQuZWFjaChPYmplY3Qua2V5cyh0bXApLCBmdW5jdGlvbihnZXQsIHNhdCl7IC8vIGlmIHN1YiBjaGFpbnMgYXJlIGFza2luZyBmb3IgZGF0YS4gLy8gVE9ETzogLmtleXMoIGlzIHNsb3cgLy8gQlVHPyA/U29tZSByZS1pbiBsb2dpYyBtYXkgZGVwZW5kIG9uIHRoaXMgYmVpbmcgc3luYz9cblx0XHRpZighZ2V0IHx8ICEoc2F0ID0gdG1wW2dldF0pKXsgcmV0dXJuIH1cblx0XHRzYXQub24oJ291dCcsIHtnZXQ6IHsnIyc6IGxpbmssICcuJzogZ2V0fX0pOyAvLyBnbyBnZXQgaXQuXG5cdH0sMCw5OSk7XG59OyBHdW4ub24ubGluayA9IGxpbms7XG5cbmZ1bmN0aW9uIHVubGluayhtc2csIGNhdCl7IC8vIHVnaCwgc28gbXVjaCBjb2RlIGZvciBzZWVtaW5nbHkgZWRnZSBjYXNlIGJlaGF2aW9yLlxuXHR2YXIgcHV0ID0gbXNnLnB1dHx8JycsIGNoYW5nZSA9ICh1ICE9PSBwdXRbJz0nXSk/IHB1dFsnPSddIDogcHV0Wyc6J10sIHJvb3QgPSBjYXQucm9vdCwgbGluaywgdG1wO1xuXHRpZih1ID09PSBjaGFuZ2UpeyAvLyAxc3QgZWRnZSBjYXNlOiBJZiB3ZSBoYXZlIGEgYnJhbmQgbmV3IGRhdGFiYXNlLCBubyBkYXRhIHdpbGwgYmUgZm91bmQuXG5cdFx0Ly8gVE9ETzogQlVHISBiZWNhdXNlIGVtcHR5aW5nIGNhY2hlIGNvdWxkIGJlIGFzeW5jIGZyb20gYmVsb3csIG1ha2Ugc3VyZSB3ZSBhcmUgbm90IGVtcHR5aW5nIGEgbmV3ZXIgY2FjaGUuIFNvIG1heWJlIHBhc3MgYW4gQXN5bmMgSUQgdG8gY2hlY2sgYWdhaW5zdD9cblx0XHQvLyBUT0RPOiBCVUchIFdoYXQgaWYgdGhpcyBpcyBhIG1hcD8gLy8gV2FybmluZyEgQ2xlYXJpbmcgdGhpbmdzIG91dCBuZWVkcyB0byBiZSByb2J1c3QgYWdhaW5zdCBzeW5jL2FzeW5jIG9wcywgb3IgZWxzZSB5b3UnbGwgc2VlIGBtYXAgdmFsIGdldCBwdXRgIHRlc3QgY2F0YXN0cm9waGljYWxseSBmYWlsIGJlY2F1c2UgbWFwIGF0dGVtcHRzIHRvIGxpbmsgd2hlbiBwYXJlbnQgZ3JhcGggaXMgc3RyZWFtZWQgYmVmb3JlIGNoaWxkIHZhbHVlIGdldHMgc2V0LiBOZWVkIHRvIGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsYWNrIGFja3MgYW5kIGZvcmNlIGNsZWFyaW5nLlxuXHRcdGlmKGNhdC5zb3VsICYmIHUgIT09IGNhdC5wdXQpeyByZXR1cm4gfSAvLyBkYXRhIG1heSBub3QgYmUgZm91bmQgb24gYSBzb3VsLCBidXQgaWYgYSBzb3VsIGFscmVhZHkgaGFzIGRhdGEsIHRoZW4gbm90aGluZyBjYW4gY2xlYXIgdGhlIHNvdWwgYXMgYSB3aG9sZS5cblx0XHQvL2lmKCFjYXQuaGFzKXsgcmV0dXJuIH1cblx0XHR0bXAgPSAobXNnLiQkfHxtc2cuJHx8JycpLl98fCcnO1xuXHRcdGlmKG1zZ1snQCddICYmICh1ICE9PSB0bXAucHV0IHx8IHUgIT09IGNhdC5wdXQpKXsgcmV0dXJuIH0gLy8gYSBcIm5vdCBmb3VuZFwiIGZyb20gb3RoZXIgcGVlcnMgc2hvdWxkIG5vdCBjbGVhciBvdXQgZGF0YSBpZiB3ZSBoYXZlIGFscmVhZHkgZm91bmQgaXQuXG5cdFx0Ly9pZihjYXQuaGFzICYmIHUgPT09IGNhdC5wdXQgJiYgIShyb290LnBhc3N8fCcnKVtjYXQuaWRdKXsgcmV0dXJuIH0gLy8gaWYgd2UgYXJlIGFscmVhZHkgdW5saW5rZWQsIGRvIG5vdCBjYWxsIGFnYWluLCB1bmxlc3MgZWRnZSBjYXNlLiAvLyBUT0RPOiBCVUchIFRoaXMgbGluZSBzaG91bGQgYmUgZGVsZXRlZCBmb3IgXCJ1bmxpbmsgZGVlcGx5IG5lc3RlZFwiLlxuXHRcdGlmKGxpbmsgPSBjYXQubGluayB8fCBtc2cubGlua2VkKXtcblx0XHRcdGRlbGV0ZSAocm9vdC4kLmdldChsaW5rKS5fLmVjaG98fCcnKVtjYXQuaWRdO1xuXHRcdH1cblx0XHRpZihjYXQuaGFzKXsgLy8gVE9ETzogRW1wdHkgb3V0IGxpbmtzLCBtYXBzLCBlY2hvcywgYWNrcy9hc2tzLCBldGMuP1xuXHRcdFx0Y2F0LmxpbmsgPSBudWxsO1xuXHRcdH1cblx0XHRjYXQucHV0ID0gdTsgLy8gZW1wdHkgb3V0IHRoZSBjYWNoZSBpZiwgZm9yIGV4YW1wbGUsIGFsaWNlJ3MgY2FyJ3MgY29sb3Igbm8gbG9uZ2VyIGV4aXN0cyAocmVsYXRpdmUgdG8gYWxpY2UpIGlmIGFsaWNlIG5vIGxvbmdlciBoYXMgYSBjYXIuXG5cdFx0Ly8gVE9ETzogQlVHISBGb3IgbWFwcywgcHJveHkgdGhpcyBzbyB0aGUgaW5kaXZpZHVhbCBzdWIgaXMgdHJpZ2dlcmVkLCBub3QgYWxsIHN1YnMuXG5cdFx0c2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKGNhdC5uZXh0fHwnJyksIGZ1bmN0aW9uKGdldCwgc2F0KXsgLy8gZW1wdHkgb3V0IGFsbCBzdWIgY2hhaW5zLiAvLyBUT0RPOiAua2V5cyggaXMgc2xvdyAvLyBCVUc/ID9Tb21lIHJlLWluIGxvZ2ljIG1heSBkZXBlbmQgb24gdGhpcyBiZWluZyBzeW5jPyAvLyBUT0RPOiBCVUc/IFRoaXMgd2lsbCB0cmlnZ2VyIGRlZXBlciBwdXQgZmlyc3QsIGRvZXMgcHV0IGxvZ2ljIGRlcGVuZCBvbiBuZXN0ZWQgb3JkZXI/IC8vIFRPRE86IEJVRyEgRm9yIG1hcCwgdGhpcyBuZWVkcyB0byBiZSB0aGUgaXNvbGF0ZWQgY2hpbGQsIG5vdCBhbGwgb2YgdGhlbS5cblx0XHRcdGlmKCEoc2F0ID0gY2F0Lm5leHRbZ2V0XSkpeyByZXR1cm4gfVxuXHRcdFx0Ly9pZihjYXQuaGFzICYmIHUgPT09IHNhdC5wdXQgJiYgIShyb290LnBhc3N8fCcnKVtzYXQuaWRdKXsgcmV0dXJuIH0gLy8gaWYgd2UgYXJlIGFscmVhZHkgdW5saW5rZWQsIGRvIG5vdCBjYWxsIGFnYWluLCB1bmxlc3MgZWRnZSBjYXNlLiAvLyBUT0RPOiBCVUchIFRoaXMgbGluZSBzaG91bGQgYmUgZGVsZXRlZCBmb3IgXCJ1bmxpbmsgZGVlcGx5IG5lc3RlZFwiLlxuXHRcdFx0aWYobGluayl7IGRlbGV0ZSAocm9vdC4kLmdldChsaW5rKS5nZXQoZ2V0KS5fLmVjaG98fCcnKVtzYXQuaWRdIH1cblx0XHRcdHNhdC5vbignaW4nLCB7Z2V0OiBnZXQsIHB1dDogdSwgJDogc2F0LiR9KTsgLy8gVE9ETzogQlVHPyBBZGQgcmVjdXJzaXZlIHNlZW4gY2hlY2s/XG5cdFx0fSwwLDk5KTtcblx0XHRyZXR1cm47XG5cdH1cblx0aWYoY2F0LnNvdWwpeyByZXR1cm4gfSAvLyBhIHNvdWwgY2Fubm90IHVubGluayBpdHNlbGYuXG5cdGlmKG1zZy4kJCl7IHJldHVybiB9IC8vIGEgbGlua2VkIGNoYWluIGRvZXMgbm90IGRvIHRoZSB1bmxpbmtpbmcsIHRoZSBzdWIgY2hhaW4gZG9lcy4gLy8gVE9ETzogQlVHPyBXaWxsIHRoaXMgY2FuY2VsIG1hcHM/XG5cdGxpbmsgPSB2YWxpZChjaGFuZ2UpOyAvLyBuZWVkIHRvIHVubGluayBhbnl0aW1lIHdlIGFyZSBub3QgdGhlIHNhbWUgbGluaywgdGhvdWdoIG9ubHkgZG8gdGhpcyBvbmNlIHBlciB1bmxpbmsgKGFuZCBub3Qgb24gaW5pdCkuXG5cdHRtcCA9IG1zZy4kLl98fCcnO1xuXHRpZihsaW5rID09PSB0bXAubGluayB8fCAoY2F0LmhhcyAmJiAhdG1wLmxpbmspKXtcblx0XHRpZigocm9vdC5wYXNzfHwnJylbY2F0LmlkXSAmJiAnc3RyaW5nJyAhPT0gdHlwZW9mIGxpbmspe1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblx0ZGVsZXRlICh0bXAuZWNob3x8JycpW2NhdC5pZF07XG5cdHVubGluayh7Z2V0OiBjYXQuZ2V0LCBwdXQ6IHUsICQ6IG1zZy4kLCBsaW5rZWQ6IG1zZy5saW5rZWQgPSBtc2cubGlua2VkIHx8IHRtcC5saW5rfSwgY2F0KTsgLy8gdW5saW5rIG91ciBzdWIgY2hhaW5zLlxufTsgR3VuLm9uLnVubGluayA9IHVubGluaztcblxuZnVuY3Rpb24gYWNrKG1zZywgZXYpe1xuXHQvL2lmKCFtc2dbJyUnXSAmJiAodGhpc3x8JycpLm9mZil7IHRoaXMub2ZmKCkgfSAvLyBkbyBOT1QgbWVtb3J5IGxlYWssIHR1cm4gb2ZmIGxpc3RlbmVycyEgTm93IGhhbmRsZWQgYnkgLmFzayBpdHNlbGZcblx0Ly8gbWFuaGF0dGFuOlxuXHR2YXIgYXMgPSB0aGlzLmFzLCBhdCA9IGFzLiQuXywgcm9vdCA9IGF0LnJvb3QsIGdldCA9IGFzLmdldHx8JycsIHRtcCA9IChtc2cucHV0fHwnJylbZ2V0WycjJ11dfHwnJztcblx0aWYoIW1zZy5wdXQgfHwgKCdzdHJpbmcnID09IHR5cGVvZiBnZXRbJy4nXSAmJiB1ID09PSB0bXBbZ2V0WycuJ11dKSl7XG5cdFx0aWYodSAhPT0gYXQucHV0KXsgcmV0dXJuIH1cblx0XHRpZighYXQuc291bCAmJiAhYXQuaGFzKXsgcmV0dXJuIH0gLy8gVE9ETzogQlVHPyBGb3Igbm93LCBvbmx5IGNvcmUtY2hhaW5zIHdpbGwgaGFuZGxlIG5vdC1mb3VuZHMsIGJlY2F1c2UgYnVncyBjcmVlcCBpbiBpZiBub24tY29yZSBjaGFpbnMgYXJlIHVzZWQgYXMgJCBidXQgd2UgY2FuIHJldmlzaXQgdGhpcyBsYXRlciBmb3IgbW9yZSBwb3dlcmZ1bCBleHRlbnNpb25zLlxuXHRcdGF0LmFjayA9IChhdC5hY2sgfHwgMCkgKyAxO1xuXHRcdGF0Lm9uKCdpbicsIHtcblx0XHRcdGdldDogYXQuZ2V0LFxuXHRcdFx0cHV0OiBhdC5wdXQgPSB1LFxuXHRcdFx0JDogYXQuJCxcblx0XHRcdCdAJzogbXNnWydAJ11cblx0XHR9KTtcblx0XHQvKih0bXAgPSBhdC5RKSAmJiBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXModG1wKSwgZnVuY3Rpb24oaWQpeyAvLyBUT0RPOiBUZW1wb3JhcnkgdGVzdGluZywgbm90IGludGVncmF0ZWQgb3IgYmVpbmcgdXNlZCwgcHJvYmFibHkgZGVsZXRlLlxuXHRcdFx0T2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSwgdG1wID0ge30pOyB0bXBbJ0AnXSA9IGlkOyAvLyBjb3B5IG1lc3NhZ2Vcblx0XHRcdHJvb3Qub24oJ2luJywgdG1wKTtcblx0XHR9KTsgZGVsZXRlIGF0LlE7Ki9cblx0XHRyZXR1cm47XG5cdH1cblx0KG1zZy5ffHx7fSkubWlzcyA9IDE7XG5cdEd1bi5vbi5wdXQobXNnKTtcblx0cmV0dXJuOyAvLyBlb21cbn1cblxudmFyIGVtcHR5ID0ge30sIHUsIHRleHRfcmFuZCA9IFN0cmluZy5yYW5kb20sIHZhbGlkID0gR3VuLnZhbGlkLCBvYmpfaGFzID0gZnVuY3Rpb24obywgayl7IHJldHVybiBvICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSB9LCBzdGF0ZSA9IEd1bi5zdGF0ZSwgc3RhdGVfaXMgPSBzdGF0ZS5pcywgc3RhdGVfaWZ5ID0gc3RhdGUuaWZ5O1xuXHQiLCJcbnJlcXVpcmUoJy4vc2hpbScpO1xuZnVuY3Rpb24gRHVwKG9wdCl7XG5cdHZhciBkdXAgPSB7czp7fX0sIHMgPSBkdXAucztcblx0b3B0ID0gb3B0IHx8IHttYXg6IDk5OSwgYWdlOiAxMDAwICogOX07Ly8qLyAxMDAwICogOSAqIDN9O1xuXHRkdXAuY2hlY2sgPSBmdW5jdGlvbihpZCl7XG5cdFx0aWYoIXNbaWRdKXsgcmV0dXJuIGZhbHNlIH1cblx0XHRyZXR1cm4gZHQoaWQpO1xuXHR9XG5cdHZhciBkdCA9IGR1cC50cmFjayA9IGZ1bmN0aW9uKGlkKXtcblx0XHR2YXIgaXQgPSBzW2lkXSB8fCAoc1tpZF0gPSB7fSk7XG5cdFx0aXQud2FzID0gZHVwLm5vdyA9ICtuZXcgRGF0ZTtcblx0XHRpZighZHVwLnRvKXsgZHVwLnRvID0gc2V0VGltZW91dChkdXAuZHJvcCwgb3B0LmFnZSArIDkpIH1cblx0XHRyZXR1cm4gaXQ7XG5cdH1cblx0ZHVwLmRyb3AgPSBmdW5jdGlvbihhZ2Upe1xuXHRcdGR1cC50byA9IG51bGw7XG5cdFx0ZHVwLm5vdyA9ICtuZXcgRGF0ZTtcblx0XHR2YXIgbCA9IE9iamVjdC5rZXlzKHMpO1xuXHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoZHVwLm5vdywgK25ldyBEYXRlIC0gZHVwLm5vdywgJ2R1cCBkcm9wIGtleXMnKTsgLy8gcHJldiB+MjAlIENQVSA3JSBSQU0gMzAwTUIgLy8gbm93IH4yNSUgQ1BVIDclIFJBTSA1MDBNQlxuXHRcdHNldFRpbWVvdXQuZWFjaChsLCBmdW5jdGlvbihpZCl7IHZhciBpdCA9IHNbaWRdOyAvLyBUT0RPOiAua2V5cyggaXMgc2xvdz9cblx0XHRcdGlmKGl0ICYmIChhZ2UgfHwgb3B0LmFnZSkgPiAoZHVwLm5vdyAtIGl0LndhcykpeyByZXR1cm4gfVxuXHRcdFx0ZGVsZXRlIHNbaWRdO1xuXHRcdH0sMCw5OSk7XG5cdH1cblx0cmV0dXJuIGR1cDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRHVwO1xuXHQiLCJcbnZhciBHdW4gPSByZXF1aXJlKCcuL3Jvb3QnKTtcbkd1bi5jaGFpbi5nZXQgPSBmdW5jdGlvbihrZXksIGNiLCBhcyl7XG5cdHZhciBndW4sIHRtcDtcblx0aWYodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpe1xuXHRcdGlmKGtleS5sZW5ndGggPT0gMCkge1x0XG5cdFx0XHQoZ3VuID0gdGhpcy5jaGFpbigpKS5fLmVyciA9IHtlcnI6IEd1bi5sb2coJzAgbGVuZ3RoIGtleSEnLCBrZXkpfTtcblx0XHRcdGlmKGNiKXsgY2IuY2FsbChndW4sIGd1bi5fLmVycikgfVxuXHRcdFx0cmV0dXJuIGd1bjtcblx0XHR9XG5cdFx0dmFyIGJhY2sgPSB0aGlzLCBjYXQgPSBiYWNrLl87XG5cdFx0dmFyIG5leHQgPSBjYXQubmV4dCB8fCBlbXB0eTtcblx0XHRpZighKGd1biA9IG5leHRba2V5XSkpe1xuXHRcdFx0Z3VuID0ga2V5ICYmIGNhY2hlKGtleSwgYmFjayk7XG5cdFx0fVxuXHRcdGd1biA9IGd1biAmJiBndW4uJDtcblx0fSBlbHNlXG5cdGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIGtleSl7XG5cdFx0aWYodHJ1ZSA9PT0gY2IpeyByZXR1cm4gc291bCh0aGlzLCBrZXksIGNiLCBhcyksIHRoaXMgfVxuXHRcdGd1biA9IHRoaXM7XG5cdFx0dmFyIGNhdCA9IGd1bi5fLCBvcHQgPSBjYiB8fCB7fSwgcm9vdCA9IGNhdC5yb290LCBpZDtcblx0XHRvcHQuYXQgPSBjYXQ7XG5cdFx0b3B0Lm9rID0ga2V5O1xuXHRcdHZhciB3YWl0ID0ge307IC8vIGNhbiB3ZSBhc3NpZ24gdGhpcyB0byB0aGUgYXQgaW5zdGVhZCwgbGlrZSBpbiBvbmNlP1xuXHRcdC8vdmFyIHBhdGggPSBbXTsgY2F0LiQuYmFjayhhdCA9PiB7IGF0LmdldCAmJiBwYXRoLnB1c2goYXQuZ2V0LnNsaWNlKDAsOSkpfSk7IHBhdGggPSBwYXRoLnJldmVyc2UoKS5qb2luKCcuJyk7XG5cdFx0ZnVuY3Rpb24gYW55KG1zZywgZXZlLCBmKXtcblx0XHRcdGlmKGFueS5zdHVuKXsgcmV0dXJuIH1cblx0XHRcdGlmKCh0bXAgPSByb290LnBhc3MpICYmICF0bXBbaWRdKXsgcmV0dXJuIH1cblx0XHRcdHZhciBhdCA9IG1zZy4kLl8sIHNhdCA9IChtc2cuJCR8fCcnKS5fLCBkYXRhID0gKHNhdHx8YXQpLnB1dCwgb2RkID0gKCFhdC5oYXMgJiYgIWF0LnNvdWwpLCB0ZXN0ID0ge30sIGxpbmssIHRtcDtcblx0XHRcdGlmKG9kZCB8fCB1ID09PSBkYXRhKXsgLy8gaGFuZGxlcyBub24tY29yZVxuXHRcdFx0XHRkYXRhID0gKHUgPT09ICgodG1wID0gbXNnLnB1dCl8fCcnKVsnPSddKT8gKHUgPT09ICh0bXB8fCcnKVsnOiddKT8gdG1wIDogdG1wWyc6J10gOiB0bXBbJz0nXTtcblx0XHRcdH1cblx0XHRcdGlmKGxpbmsgPSAoJ3N0cmluZycgPT0gdHlwZW9mICh0bXAgPSBHdW4udmFsaWQoZGF0YSkpKSl7XG5cdFx0XHRcdGRhdGEgPSAodSA9PT0gKHRtcCA9IHJvb3QuJC5nZXQodG1wKS5fLnB1dCkpPyBvcHQubm90PyB1IDogZGF0YSA6IHRtcDtcblx0XHRcdH1cblx0XHRcdGlmKG9wdC5ub3QgJiYgdSA9PT0gZGF0YSl7IHJldHVybiB9XG5cdFx0XHRpZih1ID09PSBvcHQuc3R1bil7XG5cdFx0XHRcdGlmKCh0bXAgPSByb290LnN0dW4pICYmIHRtcC5vbil7XG5cdFx0XHRcdFx0Y2F0LiQuYmFjayhmdW5jdGlvbihhKXsgLy8gb3VyIGNoYWluIHN0dW5uZWQ/XG5cdFx0XHRcdFx0XHR0bXAub24oJycrYS5pZCwgdGVzdCA9IHt9KTtcblx0XHRcdFx0XHRcdGlmKCh0ZXN0LnJ1biB8fCAwKSA8IGFueS5pZCl7IHJldHVybiB0ZXN0IH0gLy8gaWYgdGhlcmUgaXMgYW4gZWFybGllciBzdHVuIG9uIGdhcGxlc3MgcGFyZW50cy9zZWxmLlxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCF0ZXN0LnJ1biAmJiB0bXAub24oJycrYXQuaWQsIHRlc3QgPSB7fSk7IC8vIHRoaXMgbm9kZSBzdHVubmVkP1xuXHRcdFx0XHRcdCF0ZXN0LnJ1biAmJiBzYXQgJiYgdG1wLm9uKCcnK3NhdC5pZCwgdGVzdCA9IHt9KTsgLy8gbGlua2VkIG5vZGUgc3R1bm5lZD9cblx0XHRcdFx0XHRpZihhbnkuaWQgPiB0ZXN0LnJ1bil7XG5cdFx0XHRcdFx0XHRpZighdGVzdC5zdHVuIHx8IHRlc3Quc3R1bi5lbmQpe1xuXHRcdFx0XHRcdFx0XHR0ZXN0LnN0dW4gPSB0bXAub24oJ3N0dW4nKTtcblx0XHRcdFx0XHRcdFx0dGVzdC5zdHVuID0gdGVzdC5zdHVuICYmIHRlc3Quc3R1bi5sYXN0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYodGVzdC5zdHVuICYmICF0ZXN0LnN0dW4uZW5kKXtcblx0XHRcdFx0XHRcdFx0Ly9pZihvZGQgJiYgdSA9PT0gZGF0YSl7IHJldHVybiB9XG5cdFx0XHRcdFx0XHRcdC8vaWYodSA9PT0gbXNnLnB1dCl7IHJldHVybiB9IC8vIFwibm90IGZvdW5kXCIgYWNrcyB3aWxsIGJlIGZvdW5kIGlmIHRoZXJlIGlzIHN0dW4sIHNvIGlnbm9yZSB0aGVzZS5cblx0XHRcdFx0XHRcdFx0KHRlc3Quc3R1bi5hZGQgfHwgKHRlc3Quc3R1bi5hZGQgPSB7fSkpW2lkXSA9IGZ1bmN0aW9uKCl7IGFueShtc2csZXZlLDEpIH0gLy8gYWRkIG91cnNlbGYgdG8gdGhlIHN0dW4gY2FsbGJhY2sgbGlzdCB0aGF0IGlzIGNhbGxlZCBhdCBlbmQgb2YgdGhlIHdyaXRlLlxuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKC8qb2RkICYmKi8gdSA9PT0gZGF0YSl7IGYgPSAwIH0gLy8gaWYgZGF0YSBub3QgZm91bmQsIGtlZXAgd2FpdGluZy90cnlpbmcuXG5cdFx0XHRcdC8qaWYoZiAmJiB1ID09PSBkYXRhKXtcblx0XHRcdFx0XHRjYXQub24oJ291dCcsIG9wdC5vdXQpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fSovXG5cdFx0XHRcdGlmKCh0bXAgPSByb290LmhhdGNoKSAmJiAhdG1wLmVuZCAmJiB1ID09PSBvcHQuaGF0Y2ggJiYgIWYpeyAvLyBxdWljayBoYWNrISAvLyBXaGF0J3MgZ29pbmcgb24gaGVyZT8gQmVjYXVzZSBkYXRhIGlzIHN0cmVhbWVkLCB3ZSBnZXQgdGhpbmdzIG9uZSBieSBvbmUsIGJ1dCBhIGxvdCBvZiBkZXZlbG9wZXJzIHdvdWxkIHJhdGhlciBnZXQgYSBjYWxsYmFjayBhZnRlciBlYWNoIGJhdGNoIGluc3RlYWQsIHNvIHRoaXMgZG9lcyB0aGF0IGJ5IGNyZWF0aW5nIGEgd2FpdCBsaXN0IHBlciBjaGFpbiBpZCB0aGF0IGlzIHRoZW4gY2FsbGVkIGF0IHRoZSBlbmQgb2YgdGhlIGJhdGNoIGJ5IHRoZSBoYXRjaCBjb2RlIGluIHRoZSByb290IHB1dCBsaXN0ZW5lci5cblx0XHRcdFx0XHRpZih3YWl0W2F0LiQuXy5pZF0peyByZXR1cm4gfSB3YWl0W2F0LiQuXy5pZF0gPSAxO1xuXHRcdFx0XHRcdHRtcC5wdXNoKGZ1bmN0aW9uKCl7YW55KG1zZyxldmUsMSl9KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH07IHdhaXQgPSB7fTsgLy8gZW5kIHF1aWNrIGhhY2suXG5cdFx0XHR9XG5cdFx0XHQvLyBjYWxsOlxuXHRcdFx0aWYocm9vdC5wYXNzKXsgaWYocm9vdC5wYXNzW2lkK2F0LmlkXSl7IHJldHVybiB9IHJvb3QucGFzc1tpZCthdC5pZF0gPSAxIH1cblx0XHRcdGlmKG9wdC5vbil7IG9wdC5vay5jYWxsKGF0LiQsIGRhdGEsIGF0LmdldCwgbXNnLCBldmUgfHwgYW55KTsgcmV0dXJuIH0gLy8gVE9ETzogQWxzbyBjb25zaWRlciBicmVha2luZyBgdGhpc2Agc2luY2UgYSBsb3Qgb2YgcGVvcGxlIGRvIGA9PmAgdGhlc2UgZGF5cyBhbmQgYC5jYWxsKGAgaGFzIHNsb3dlciBwZXJmb3JtYW5jZS5cblx0XHRcdGlmKG9wdC52MjAyMCl7IG9wdC5vayhtc2csIGV2ZSB8fCBhbnkpOyByZXR1cm4gfVxuXHRcdFx0T2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSwgdG1wID0ge30pOyBtc2cgPSB0bXA7IG1zZy5wdXQgPSBkYXRhOyAvLyAyMDE5IENPTVBBVElCSUxJVFkhIFRPRE86IEdFVCBSSUQgT0YgVEhJUyFcblx0XHRcdG9wdC5vay5jYWxsKG9wdC5hcywgbXNnLCBldmUgfHwgYW55KTsgLy8gaXMgdGhpcyB0aGUgcmlnaHRcblx0XHR9O1xuXHRcdGFueS5hdCA9IGNhdDtcblx0XHQvLyhjYXQuYW55fHwoY2F0LmFueT1mdW5jdGlvbihtc2cpeyBzZXRUaW1lb3V0LmVhY2goT2JqZWN0LmtleXMoY2F0LmFueXx8JycpLCBmdW5jdGlvbihhY3QpeyAoYWN0ID0gY2F0LmFueVthY3RdKSAmJiBhY3QobXNnKSB9LDAsOTkpIH0pKVtpZCA9IFN0cmluZy5yYW5kb20oNyldID0gYW55OyAvLyBtYXliZSBzd2l0Y2ggdG8gdGhpcyBpbiBmdXR1cmU/XG5cdFx0KGNhdC5hbnl8fChjYXQuYW55PXt9KSlbaWQgPSBTdHJpbmcucmFuZG9tKDcpXSA9IGFueTtcblx0XHRhbnkub2ZmID0gZnVuY3Rpb24oKXsgYW55LnN0dW4gPSAxOyBpZighY2F0LmFueSl7IHJldHVybiB9IGRlbGV0ZSBjYXQuYW55W2lkXSB9XG5cdFx0YW55LnJpZCA9IHJpZDsgLy8gbG9naWMgZnJvbSBvbGQgdmVyc2lvbiwgY2FuIHdlIGNsZWFuIGl0IHVwIG5vdz9cblx0XHRhbnkuaWQgPSBvcHQucnVuIHx8ICsrcm9vdC5vbmNlOyAvLyB1c2VkIGluIGNhbGxiYWNrIHRvIGNoZWNrIGlmIHdlIGFyZSBlYXJsaWVyIHRoYW4gYSB3cml0ZS4gLy8gd2lsbCB0aGlzIGV2ZXIgY2F1c2UgYW4gaW50ZWdlciBvdmVyZmxvdz9cblx0XHR0bXAgPSByb290LnBhc3M7IChyb290LnBhc3MgPSB7fSlbaWRdID0gMTsgLy8gRXhwbGFuYXRpb246IHRlc3QgdHJhZGUtb2ZmcyB3YW50IHRvIHByZXZlbnQgcmVjdXJzaW9uIHNvIHdlIGFkZC9yZW1vdmUgcGFzcyBmbGFnIGFzIGl0IGdldHMgZnVsZmlsbGVkIHRvIG5vdCByZXBlYXQsIGhvd2V2ZXIgbWFwIG1hcCBuZWVkcyBtYW55IHBhc3MgZmxhZ3MgLSBob3cgZG8gd2UgcmVjb25jaWxlP1xuXHRcdG9wdC5vdXQgPSBvcHQub3V0IHx8IHtnZXQ6IHt9fTtcblx0XHRjYXQub24oJ291dCcsIG9wdC5vdXQpO1xuXHRcdHJvb3QucGFzcyA9IHRtcDtcblx0XHRyZXR1cm4gZ3VuO1xuXHR9IGVsc2Vcblx0aWYoJ251bWJlcicgPT0gdHlwZW9mIGtleSl7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCcnK2tleSwgY2IsIGFzKTtcblx0fSBlbHNlXG5cdGlmKCdzdHJpbmcnID09IHR5cGVvZiAodG1wID0gdmFsaWQoa2V5KSkpe1xuXHRcdHJldHVybiB0aGlzLmdldCh0bXAsIGNiLCBhcyk7XG5cdH0gZWxzZVxuXHRpZih0bXAgPSB0aGlzLmdldC5uZXh0KXtcblx0XHRndW4gPSB0bXAodGhpcywga2V5KTtcblx0fVxuXHRpZighZ3VuKXtcblx0XHQoZ3VuID0gdGhpcy5jaGFpbigpKS5fLmVyciA9IHtlcnI6IEd1bi5sb2coJ0ludmFsaWQgZ2V0IHJlcXVlc3QhJywga2V5KX07IC8vIENMRUFOIFVQXG5cdFx0aWYoY2IpeyBjYi5jYWxsKGd1biwgZ3VuLl8uZXJyKSB9XG5cdFx0cmV0dXJuIGd1bjtcblx0fVxuXHRpZihjYiAmJiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYil7XG5cdFx0Z3VuLmdldChjYiwgYXMpO1xuXHR9XG5cdHJldHVybiBndW47XG59XG5mdW5jdGlvbiBjYWNoZShrZXksIGJhY2spe1xuXHR2YXIgY2F0ID0gYmFjay5fLCBuZXh0ID0gY2F0Lm5leHQsIGd1biA9IGJhY2suY2hhaW4oKSwgYXQgPSBndW4uXztcblx0aWYoIW5leHQpeyBuZXh0ID0gY2F0Lm5leHQgPSB7fSB9XG5cdG5leHRbYXQuZ2V0ID0ga2V5XSA9IGF0O1xuXHRpZihiYWNrID09PSBjYXQucm9vdC4kKXtcblx0XHRhdC5zb3VsID0ga2V5O1xuXHR9IGVsc2Vcblx0aWYoY2F0LnNvdWwgfHwgY2F0Lmhhcyl7XG5cdFx0YXQuaGFzID0ga2V5O1xuXHRcdC8vaWYob2JqX2hhcyhjYXQucHV0LCBrZXkpKXtcblx0XHRcdC8vYXQucHV0ID0gY2F0LnB1dFtrZXldO1xuXHRcdC8vfVxuXHR9XG5cdHJldHVybiBhdDtcbn1cbmZ1bmN0aW9uIHNvdWwoZ3VuLCBjYiwgb3B0LCBhcyl7XG5cdHZhciBjYXQgPSBndW4uXywgYWNrcyA9IDAsIHRtcDtcblx0aWYodG1wID0gY2F0LnNvdWwgfHwgY2F0LmxpbmspeyByZXR1cm4gY2IodG1wLCBhcywgY2F0KSB9XG5cdGlmKGNhdC5qYW0peyByZXR1cm4gY2F0LmphbS5wdXNoKFtjYiwgYXNdKSB9XG5cdGNhdC5qYW0gPSBbW2NiLGFzXV07XG5cdGd1bi5nZXQoZnVuY3Rpb24gZ28obXNnLCBldmUpe1xuXHRcdGlmKHUgPT09IG1zZy5wdXQgJiYgIWNhdC5yb290Lm9wdC5zdXBlciAmJiAodG1wID0gT2JqZWN0LmtleXMoY2F0LnJvb3Qub3B0LnBlZXJzKS5sZW5ndGgpICYmICsrYWNrcyA8PSB0bXApeyAvLyBUT0RPOiBzdXBlciBzaG91bGQgbm90IGJlIGluIGNvcmUgY29kZSwgYnJpbmcgQVhFIHVwIGludG8gY29yZSBpbnN0ZWFkIHRvIGZpeD8gLy8gVE9ETzogLmtleXMoIGlzIHNsb3dcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZXZlLnJpZChtc2cpO1xuXHRcdHZhciBhdCA9ICgoYXQgPSBtc2cuJCkgJiYgYXQuXykgfHwge30sIGkgPSAwLCBhcztcblx0XHR0bXAgPSBjYXQuamFtOyBkZWxldGUgY2F0LmphbTsgLy8gdG1wID0gY2F0LmphbS5zcGxpY2UoMCwgMTAwKTtcblx0XHQvL2lmKHRtcC5sZW5ndGgpeyBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCl7IGdvKG1zZywgZXZlKSB9KSB9XG5cdFx0d2hpbGUoYXMgPSB0bXBbaSsrXSl7IC8vR3VuLm9iai5tYXAodG1wLCBmdW5jdGlvbihhcywgY2Ipe1xuXHRcdFx0dmFyIGNiID0gYXNbMF0sIGlkOyBhcyA9IGFzWzFdO1xuXHRcdFx0Y2IgJiYgY2IoaWQgPSBhdC5saW5rIHx8IGF0LnNvdWwgfHwgR3VuLnZhbGlkKG1zZy5wdXQpIHx8ICgobXNnLnB1dHx8e30pLl98fHt9KVsnIyddLCBhcywgbXNnLCBldmUpO1xuXHRcdH0gLy8pO1xuXHR9LCB7b3V0OiB7Z2V0OiB7Jy4nOnRydWV9fX0pO1xuXHRyZXR1cm4gZ3VuO1xufVxuZnVuY3Rpb24gcmlkKGF0KXtcblx0dmFyIGNhdCA9IHRoaXMuYXQgfHwgdGhpcy5vbjtcblx0aWYoIWF0IHx8IGNhdC5zb3VsIHx8IGNhdC5oYXMpeyByZXR1cm4gdGhpcy5vZmYoKSB9XG5cdGlmKCEoYXQgPSAoYXQgPSAoYXQgPSBhdC4kIHx8IGF0KS5fIHx8IGF0KS5pZCkpeyByZXR1cm4gfVxuXHR2YXIgbWFwID0gY2F0Lm1hcCwgdG1wLCBzZWVuO1xuXHQvL2lmKCFtYXAgfHwgISh0bXAgPSBtYXBbYXRdKSB8fCAhKHRtcCA9IHRtcC5hdCkpeyByZXR1cm4gfVxuXHRpZih0bXAgPSAoc2VlbiA9IHRoaXMuc2VlbiB8fCAodGhpcy5zZWVuID0ge30pKVthdF0peyByZXR1cm4gdHJ1ZSB9XG5cdHNlZW5bYXRdID0gdHJ1ZTtcblx0cmV0dXJuO1xuXHQvL3RtcC5lY2hvW2NhdC5pZF0gPSB7fTsgLy8gVE9ETzogV2FybmluZzogVGhpcyB1bnN1YnNjcmliZXMgQUxMIG9mIHRoaXMgY2hhaW4ncyBsaXN0ZW5lcnMgZnJvbSB0aGlzIGxpbmssIG5vdCBqdXN0IHRoZSBvbmUgY2FsbGJhY2sgZXZlbnQuXG5cdC8vb2JqLmRlbChtYXAsIGF0KTsgLy8gVE9ETzogV2FybmluZzogVGhpcyB1bnN1YnNjcmliZXMgQUxMIG9mIHRoaXMgY2hhaW4ncyBsaXN0ZW5lcnMgZnJvbSB0aGlzIGxpbmssIG5vdCBqdXN0IHRoZSBvbmUgY2FsbGJhY2sgZXZlbnQuXG5cdHJldHVybjtcbn1cbnZhciBlbXB0eSA9IHt9LCB2YWxpZCA9IEd1bi52YWxpZCwgdTtcblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9yb290Jyk7XG5yZXF1aXJlKCcuL2NoYWluJyk7XG5yZXF1aXJlKCcuL2JhY2snKTtcbnJlcXVpcmUoJy4vcHV0Jyk7XG5yZXF1aXJlKCcuL2dldCcpO1xubW9kdWxlLmV4cG9ydHMgPSBHdW47XG5cdCIsIlxudmFyIEd1biA9IHJlcXVpcmUoJy4vaW5kZXgnKSwgbmV4dCA9IEd1bi5jaGFpbi5nZXQubmV4dDtcbkd1bi5jaGFpbi5nZXQubmV4dCA9IGZ1bmN0aW9uKGd1biwgbGV4KXsgdmFyIHRtcDtcblx0aWYoIU9iamVjdC5wbGFpbihsZXgpKXsgcmV0dXJuIChuZXh0fHxub29wKShndW4sIGxleCkgfVxuXHRpZih0bXAgPSAoKHRtcCA9IGxleFsnIyddKXx8JycpWyc9J10gfHwgdG1wKXsgcmV0dXJuIGd1bi5nZXQodG1wKSB9XG5cdCh0bXAgPSBndW4uY2hhaW4oKS5fKS5sZXggPSBsZXg7IC8vIExFWCFcblx0Z3VuLm9uKCdpbicsIGZ1bmN0aW9uKGV2ZSl7XG5cdFx0aWYoU3RyaW5nLm1hdGNoKGV2ZS5nZXR8fCAoZXZlLnB1dHx8JycpWycuJ10sIGxleFsnLiddIHx8IGxleFsnIyddIHx8IGxleCkpe1xuXHRcdFx0dG1wLm9uKCdpbicsIGV2ZSk7XG5cdFx0fVxuXHRcdHRoaXMudG8ubmV4dChldmUpO1xuXHR9KTtcblx0cmV0dXJuIHRtcC4kO1xufVxuR3VuLmNoYWluLm1hcCA9IGZ1bmN0aW9uKGNiLCBvcHQsIHQpe1xuXHR2YXIgZ3VuID0gdGhpcywgY2F0ID0gZ3VuLl8sIGxleCwgY2hhaW47XG5cdGlmKE9iamVjdC5wbGFpbihjYikpeyBsZXggPSBjYlsnLiddPyBjYiA6IHsnLic6IGNifTsgY2IgPSB1IH1cblx0aWYoIWNiKXtcblx0XHRpZihjaGFpbiA9IGNhdC5lYWNoKXsgcmV0dXJuIGNoYWluIH1cblx0XHQoY2F0LmVhY2ggPSBjaGFpbiA9IGd1bi5jaGFpbigpKS5fLmxleCA9IGxleCB8fCBjaGFpbi5fLmxleCB8fCBjYXQubGV4O1xuXHRcdGNoYWluLl8ubml4ID0gZ3VuLmJhY2soJ25peCcpO1xuXHRcdGd1bi5vbignaW4nLCBtYXAsIGNoYWluLl8pO1xuXHRcdHJldHVybiBjaGFpbjtcblx0fVxuXHRHdW4ubG9nLm9uY2UoXCJtYXBmblwiLCBcIk1hcCBmdW5jdGlvbnMgYXJlIGV4cGVyaW1lbnRhbCwgdGhlaXIgYmVoYXZpb3IgYW5kIEFQSSBtYXkgY2hhbmdlIG1vdmluZyBmb3J3YXJkLiBQbGVhc2UgcGxheSB3aXRoIGl0IGFuZCByZXBvcnQgYnVncyBhbmQgaWRlYXMgb24gaG93IHRvIGltcHJvdmUgaXQuXCIpO1xuXHRjaGFpbiA9IGd1bi5jaGFpbigpO1xuXHRndW4ubWFwKCkub24oZnVuY3Rpb24oZGF0YSwga2V5LCBtc2csIGV2ZSl7XG5cdFx0dmFyIG5leHQgPSAoY2J8fG5vb3ApLmNhbGwodGhpcywgZGF0YSwga2V5LCBtc2csIGV2ZSk7XG5cdFx0aWYodSA9PT0gbmV4dCl7IHJldHVybiB9XG5cdFx0aWYoZGF0YSA9PT0gbmV4dCl7IHJldHVybiBjaGFpbi5fLm9uKCdpbicsIG1zZykgfVxuXHRcdGlmKEd1bi5pcyhuZXh0KSl7IHJldHVybiBjaGFpbi5fLm9uKCdpbicsIG5leHQuXykgfVxuXHRcdHZhciB0bXAgPSB7fTsgT2JqZWN0LmtleXMobXNnLnB1dCkuZm9yRWFjaChmdW5jdGlvbihrKXsgdG1wW2tdID0gbXNnLnB1dFtrXSB9LCB0bXApOyB0bXBbJz0nXSA9IG5leHQ7IFxuXHRcdGNoYWluLl8ub24oJ2luJywge2dldDoga2V5LCBwdXQ6IHRtcH0pO1xuXHR9KTtcblx0cmV0dXJuIGNoYWluO1xufVxuZnVuY3Rpb24gbWFwKG1zZyl7IHRoaXMudG8ubmV4dChtc2cpO1xuXHR2YXIgY2F0ID0gdGhpcy5hcywgZ3VuID0gbXNnLiQsIGF0ID0gZ3VuLl8sIHB1dCA9IG1zZy5wdXQsIHRtcDtcblx0aWYoIWF0LnNvdWwgJiYgIW1zZy4kJCl7IHJldHVybiB9IC8vIHRoaXMgbGluZSB0b29rIGh1bmRyZWRzIG9mIHRyaWVzIHRvIGZpZ3VyZSBvdXQuIEl0IG9ubHkgd29ya3MgaWYgY29yZSBjaGVja3MgdG8gZmlsdGVyIG91dCBhYm92ZSBjaGFpbnMgZHVyaW5nIGxpbmsgdGhvLiBUaGlzIHNheXMgXCJvbmx5IGJvdGhlciB0byBtYXAgb24gYSBub2RlXCIgZm9yIHRoaXMgbGF5ZXIgb2YgdGhlIGNoYWluLiBJZiBzb21ldGhpbmcgaXMgbm90IGEgbm9kZSwgbWFwIHNob3VsZCBub3Qgd29yay5cblx0aWYoKHRtcCA9IGNhdC5sZXgpICYmICFTdHJpbmcubWF0Y2gobXNnLmdldHx8IChwdXR8fCcnKVsnLiddLCB0bXBbJy4nXSB8fCB0bXBbJyMnXSB8fCB0bXApKXsgcmV0dXJuIH1cblx0R3VuLm9uLmxpbmsobXNnLCBjYXQpO1xufVxudmFyIG5vb3AgPSBmdW5jdGlvbigpe30sIGV2ZW50ID0ge3N0dW46IG5vb3AsIG9mZjogbm9vcH0sIHU7XG5cdCIsIlxucmVxdWlyZSgnLi9zaGltJyk7XG5cbnZhciBub29wID0gZnVuY3Rpb24oKXt9XG52YXIgcGFyc2UgPSBKU09OLnBhcnNlQXN5bmMgfHwgZnVuY3Rpb24odCxjYixyKXsgdmFyIHUsIGQgPSArbmV3IERhdGU7IHRyeXsgY2IodSwgSlNPTi5wYXJzZSh0LHIpLCBqc29uLnN1Y2tzKCtuZXcgRGF0ZSAtIGQpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxudmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeUFzeW5jIHx8IGZ1bmN0aW9uKHYsY2IscixzKXsgdmFyIHUsIGQgPSArbmV3IERhdGU7IHRyeXsgY2IodSwgSlNPTi5zdHJpbmdpZnkodixyLHMpLCBqc29uLnN1Y2tzKCtuZXcgRGF0ZSAtIGQpKSB9Y2F0Y2goZSl7IGNiKGUpIH0gfVxuanNvbi5zdWNrcyA9IGZ1bmN0aW9uKGQpeyBpZihkID4gOTkpeyBjb25zb2xlLmxvZyhcIldhcm5pbmc6IEpTT04gYmxvY2tpbmcgQ1BVIGRldGVjdGVkLiBBZGQgYGd1bi9saWIveXNvbi5qc2AgdG8gZml4LlwiKTsganNvbi5zdWNrcyA9IG5vb3AgfSB9XG5cbmZ1bmN0aW9uIE1lc2gocm9vdCl7XG5cdHZhciBtZXNoID0gZnVuY3Rpb24oKXt9O1xuXHR2YXIgb3B0ID0gcm9vdC5vcHQgfHwge307XG5cdG9wdC5sb2cgPSBvcHQubG9nIHx8IGNvbnNvbGUubG9nO1xuXHRvcHQuZ2FwID0gb3B0LmdhcCB8fCBvcHQud2FpdCB8fCAwO1xuXHRvcHQubWF4ID0gb3B0Lm1heCB8fCAob3B0Lm1lbW9yeT8gKG9wdC5tZW1vcnkgKiA5OTkgKiA5OTkpIDogMzAwMDAwMDAwKSAqIDAuMztcblx0b3B0LnBhY2sgPSBvcHQucGFjayB8fCAob3B0Lm1heCAqIDAuMDEgKiAwLjAxKTtcblx0b3B0LnB1ZmYgPSBvcHQucHVmZiB8fCA5OyAvLyBJREVBOiBkbyBhIHN0YXJ0L2VuZCBiZW5jaG1hcmssIGRpdmlkZSBvcHMvcmVzdWx0LlxuXHR2YXIgcHVmZiA9IHNldFRpbWVvdXQudHVybiB8fCBzZXRUaW1lb3V0O1xuXG5cdHZhciBkdXAgPSByb290LmR1cCwgZHVwX2NoZWNrID0gZHVwLmNoZWNrLCBkdXBfdHJhY2sgPSBkdXAudHJhY2s7XG5cblx0dmFyIFNUID0gK25ldyBEYXRlLCBMVCA9IFNUO1xuXG5cdHZhciBoZWFyID0gbWVzaC5oZWFyID0gZnVuY3Rpb24ocmF3LCBwZWVyKXtcblx0XHRpZighcmF3KXsgcmV0dXJuIH1cblx0XHRpZihvcHQubWF4IDw9IHJhdy5sZW5ndGgpeyByZXR1cm4gbWVzaC5zYXkoe2RhbTogJyEnLCBlcnI6IFwiTWVzc2FnZSB0b28gYmlnIVwifSwgcGVlcikgfVxuXHRcdGlmKG1lc2ggPT09IHRoaXMpe1xuXHRcdFx0LyppZignc3RyaW5nJyA9PSB0eXBlb2YgcmF3KXsgdHJ5e1xuXHRcdFx0XHR2YXIgc3RhdCA9IGNvbnNvbGUuU1RBVCB8fCB7fTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZygnSEVBUjonLCBwZWVyLmlkLCAocmF3fHwnJykuc2xpY2UoMCwyNTApLCAoKHJhd3x8JycpLmxlbmd0aCAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDQpKTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vY29uc29sZS5sb2coc2V0VGltZW91dC50dXJuLnMubGVuZ3RoLCAnc3RhY2tzJywgcGFyc2VGbG9hdCgoLShMVCAtIChMVCA9ICtuZXcgRGF0ZSkpLzEwMDApLnRvRml4ZWQoMykpLCAnc2VjJywgcGFyc2VGbG9hdCgoKExULVNUKS8xMDAwIC8gNjApLnRvRml4ZWQoMSkpLCAndXAnLCBzdGF0LnBlZXJzfHwwLCAncGVlcnMnLCBzdGF0Lmhhc3x8MCwgJ2hhcycsIHN0YXQubWVtaHVzZWR8fDAsIHN0YXQubWVtdXNlZHx8MCwgc3RhdC5tZW1heHx8MCwgJ2hlYXAgbWVtIG1heCcpO1xuXHRcdFx0fWNhdGNoKGUpeyBjb25zb2xlLmxvZygnREJHIGVycicsIGUpIH19Ki9cblx0XHRcdGhlYXIuZCArPSByYXcubGVuZ3RofHwwIDsgKytoZWFyLmMgfSAvLyBTVEFUUyFcblx0XHR2YXIgUyA9IHBlZXIuU0ggPSArbmV3IERhdGU7XG5cdFx0dmFyIHRtcCA9IHJhd1swXSwgbXNnO1xuXHRcdC8vcmF3ICYmIHJhdy5zbGljZSAmJiBjb25zb2xlLmxvZyhcImhlYXI6XCIsICgocGVlci53aXJlfHwnJykuaGVhZGVyc3x8JycpLm9yaWdpbiwgcmF3Lmxlbmd0aCwgcmF3LnNsaWNlICYmIHJhdy5zbGljZSgwLDUwKSk7IC8vdGMtaWFtdW5pcXVlLXRjLXBhY2thZ2UtZHMxXG5cdFx0aWYoJ1snID09PSB0bXApe1xuXHRcdFx0cGFyc2UocmF3LCBmdW5jdGlvbihlcnIsIG1zZyl7XG5cdFx0XHRcdGlmKGVyciB8fCAhbXNnKXsgcmV0dXJuIG1lc2guc2F5KHtkYW06ICchJywgZXJyOiBcIkRBTSBKU09OIHBhcnNlIGVycm9yLlwifSwgcGVlcikgfVxuXHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKCtuZXcgRGF0ZSwgbXNnLmxlbmd0aCwgJyMgb24gaGVhciBiYXRjaCcpO1xuXHRcdFx0XHR2YXIgUCA9IG9wdC5wdWZmO1xuXHRcdFx0XHQoZnVuY3Rpb24gZ28oKXtcblx0XHRcdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdFx0XHR2YXIgaSA9IDAsIG07IHdoaWxlKGkgPCBQICYmIChtID0gbXNnW2krK10pKXsgbWVzaC5oZWFyKG0sIHBlZXIpIH1cblx0XHRcdFx0XHRtc2cgPSBtc2cuc2xpY2UoaSk7IC8vIHNsaWNpbmcgYWZ0ZXIgaXMgZmFzdGVyIHRoYW4gc2hpZnRpbmcgZHVyaW5nLlxuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ2hlYXIgbG9vcCcpO1xuXHRcdFx0XHRcdGZsdXNoKHBlZXIpOyAvLyBmb3JjZSBzZW5kIGFsbCBzeW5jaHJvbm91c2x5IGJhdGNoZWQgYWNrcy5cblx0XHRcdFx0XHRpZighbXNnLmxlbmd0aCl7IHJldHVybiB9XG5cdFx0XHRcdFx0cHVmZihnbywgMCk7XG5cdFx0XHRcdH0oKSk7XG5cdFx0XHR9KTtcblx0XHRcdHJhdyA9ICcnOyAvLyBcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYoJ3snID09PSB0bXAgfHwgKChyYXdbJyMnXSB8fCBPYmplY3QucGxhaW4ocmF3KSkgJiYgKG1zZyA9IHJhdykpKXtcblx0XHRcdGlmKG1zZyl7IHJldHVybiBoZWFyLm9uZShtc2csIHBlZXIsIFMpIH1cblx0XHRcdHBhcnNlKHJhdywgZnVuY3Rpb24oZXJyLCBtc2cpe1xuXHRcdFx0XHRpZihlcnIgfHwgIW1zZyl7IHJldHVybiBtZXNoLnNheSh7ZGFtOiAnIScsIGVycjogXCJEQU0gSlNPTiBwYXJzZSBlcnJvci5cIn0sIHBlZXIpIH1cblx0XHRcdFx0aGVhci5vbmUobXNnLCBwZWVyLCBTKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXHRoZWFyLm9uZSA9IGZ1bmN0aW9uKG1zZywgcGVlciwgUyl7IC8vIFMgaGVyZSBpcyB0ZW1wb3JhcnkhIFVuZG8uXG5cdFx0dmFyIGlkLCBoYXNoLCB0bXAsIGFzaCwgREJHO1xuXHRcdGlmKG1zZy5EQkcpeyBtc2cuREJHID0gREJHID0ge0RCRzogbXNnLkRCR30gfVxuXHRcdERCRyAmJiAoREJHLmggPSBTKTtcblx0XHREQkcgJiYgKERCRy5ocCA9ICtuZXcgRGF0ZSk7XG5cdFx0aWYoIShpZCA9IG1zZ1snIyddKSl7IGlkID0gbXNnWycjJ10gPSBTdHJpbmcucmFuZG9tKDkpIH1cblx0XHRpZih0bXAgPSBkdXBfY2hlY2soaWQpKXsgcmV0dXJuIH1cblx0XHQvLyBEQU0gbG9naWM6XG5cdFx0aWYoIShoYXNoID0gbXNnWycjIyddKSAmJiBmYWxzZSAmJiB1ICE9PSBtc2cucHV0KXsgLypoYXNoID0gbXNnWycjIyddID0gVHlwZS5vYmouaGFzaChtc2cucHV0KSovIH0gLy8gZGlzYWJsZSBoYXNoaW5nIGZvciBub3cgLy8gVE9ETzogaW1wb3NlIHdhcm5pbmcvcGVuYWx0eSBpbnN0ZWFkICg/KVxuXHRcdGlmKGhhc2ggJiYgKHRtcCA9IG1zZ1snQCddIHx8IChtc2cuZ2V0ICYmIGlkKSkgJiYgZHVwLmNoZWNrKGFzaCA9IHRtcCtoYXNoKSl7IHJldHVybiB9IC8vIEltYWdpbmUgQSA8LT4gQiA8PT4gKEMgJiBEKSwgQyAmIEQgcmVwbHkgd2l0aCBzYW1lIEFDSyBidXQgaGF2ZSBkaWZmZXJlbnQgSURzLCBCIGNhbiB1c2UgaGFzaCB0byBkZWR1cC4gT3IgaWYgYSBHRVQgaGFzIGEgaGFzaCBhbHJlYWR5LCB3ZSBzaG91bGRuJ3QgQUNLIGlmIHNhbWUuXG5cdFx0KG1zZy5fID0gZnVuY3Rpb24oKXt9KS52aWEgPSBtZXNoLmxlYXAgPSBwZWVyO1xuXHRcdGlmKCh0bXAgPSBtc2dbJz48J10pICYmICdzdHJpbmcnID09IHR5cGVvZiB0bXApeyB0bXAuc2xpY2UoMCw5OSkuc3BsaXQoJywnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0aGlzW2tdID0gMSB9LCAobXNnLl8pLnlvID0ge30pIH0gLy8gUGVlcnMgYWxyZWFkeSBzZW50IHRvLCBkbyBub3QgcmVzZW5kLlxuXHRcdC8vIERBTSBeXG5cdFx0aWYodG1wID0gbXNnLmRhbSl7XG5cdFx0XHRpZih0bXAgPSBtZXNoLmhlYXJbdG1wXSl7XG5cdFx0XHRcdHRtcChtc2csIHBlZXIsIHJvb3QpO1xuXHRcdFx0fVxuXHRcdFx0ZHVwX3RyYWNrKGlkKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYodG1wID0gbXNnLm9rKXsgbXNnLl8ubmVhciA9IHRtcFsnLyddIH1cblx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHREQkcgJiYgKERCRy5pcyA9IFMpOyBwZWVyLlNJID0gaWQ7XG5cdFx0cm9vdC5vbignaW4nLCBtZXNoLmxhc3QgPSBtc2cpO1xuXHRcdC8vRUNITyA9IG1zZy5wdXQgfHwgRUNITzsgIShtc2cub2sgIT09IC0zNzQwKSAmJiBtZXNoLnNheSh7b2s6IC0zNzQwLCBwdXQ6IEVDSE8sICdAJzogbXNnWycjJ119LCBwZWVyKTtcblx0XHREQkcgJiYgKERCRy5oZCA9ICtuZXcgRGF0ZSk7XG5cdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCArbmV3IERhdGUgLSBTLCBtc2cuZ2V0PyAnbXNnIGdldCcgOiBtc2cucHV0PyAnbXNnIHB1dCcgOiAnbXNnJyk7XG5cdFx0KHRtcCA9IGR1cF90cmFjayhpZCkpLnZpYSA9IHBlZXI7IC8vIGRvbid0IGRlZHVwIG1lc3NhZ2UgSUQgdGlsbCBhZnRlciwgY2F1c2UgR1VOIGhhcyBpbnRlcm5hbCBkZWR1cCBjaGVjay5cblx0XHRpZihtc2cuZ2V0KXsgdG1wLml0ID0gbXNnIH1cblx0XHRpZihhc2gpeyBkdXBfdHJhY2soYXNoKSB9IC8vZHVwLnRyYWNrKHRtcCtoYXNoLCB0cnVlKS5pdCA9IGl0KG1zZyk7XG5cdFx0bWVzaC5sZWFwID0gbWVzaC5sYXN0ID0gbnVsbDsgLy8gd2FybmluZyEgbWVzaC5sZWFwIGNvdWxkIGJlIGJ1Z2d5LlxuXHR9XG5cdHZhciB0b21hcCA9IGZ1bmN0aW9uKGssaSxtKXttKGssdHJ1ZSl9O1xuXHRoZWFyLmMgPSBoZWFyLmQgPSAwO1xuXG5cdDsoZnVuY3Rpb24oKXtcblx0XHR2YXIgU01JQSA9IDA7XG5cdFx0dmFyIGxvb3A7XG5cdFx0bWVzaC5oYXNoID0gZnVuY3Rpb24obXNnLCBwZWVyKXsgdmFyIGgsIHMsIHQ7XG5cdFx0XHR2YXIgUyA9ICtuZXcgRGF0ZTtcblx0XHRcdGpzb24obXNnLnB1dCwgZnVuY3Rpb24gaGFzaChlcnIsIHRleHQpe1xuXHRcdFx0XHR2YXIgc3MgPSAocyB8fCAocyA9IHQgPSB0ZXh0fHwnJykpLnNsaWNlKDAsIDMyNzY4KTsgLy8gMTAyNCAqIDMyXG5cdFx0XHQgIGggPSBTdHJpbmcuaGFzaChzcywgaCk7IHMgPSBzLnNsaWNlKDMyNzY4KTtcblx0XHRcdCAgaWYocyl7IHB1ZmYoaGFzaCwgMCk7IHJldHVybiB9XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3NheSBqc29uK2hhc2gnKTtcblx0XHRcdCAgbXNnLl8uJHB1dCA9IHQ7XG5cdFx0XHQgIG1zZ1snIyMnXSA9IGg7XG5cdFx0XHQgIG1lc2guc2F5KG1zZywgcGVlcik7XG5cdFx0XHQgIGRlbGV0ZSBtc2cuXy4kcHV0O1xuXHRcdFx0fSwgc29ydCk7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIHNvcnQoaywgdil7IHZhciB0bXA7XG5cdFx0XHRpZighKHYgaW5zdGFuY2VvZiBPYmplY3QpKXsgcmV0dXJuIHYgfVxuXHRcdFx0T2JqZWN0LmtleXModikuc29ydCgpLmZvckVhY2goc29ydGEsIHt0bzogdG1wID0ge30sIG9uOiB2fSk7XG5cdFx0XHRyZXR1cm4gdG1wO1xuXHRcdH0gZnVuY3Rpb24gc29ydGEoayl7IHRoaXMudG9ba10gPSB0aGlzLm9uW2tdIH1cblxuXHRcdHZhciBzYXkgPSBtZXNoLnNheSA9IGZ1bmN0aW9uKG1zZywgcGVlcil7IHZhciB0bXA7XG5cdFx0XHRpZigodG1wID0gdGhpcykgJiYgKHRtcCA9IHRtcC50bykgJiYgdG1wLm5leHQpeyB0bXAubmV4dChtc2cpIH0gLy8gY29tcGF0aWJsZSB3aXRoIG1pZGRsZXdhcmUgYWRhcHRlcnMuXG5cdFx0XHRpZighbXNnKXsgcmV0dXJuIGZhbHNlIH1cblx0XHRcdHZhciBpZCwgaGFzaCwgcmF3LCBhY2sgPSBtc2dbJ0AnXTtcbi8vaWYob3B0LnN1cGVyICYmICghYWNrIHx8ICFtc2cucHV0KSl7IHJldHVybiB9IC8vIFRPRE86IE1BTkhBVFRBTiBTVFVCIC8vT0JWSU9VU0xZIEJVRyEgQnV0IHNxdWVsY2ggcmVsYXkuIC8vIDooIGdldCBvbmx5IGlzIDEwMCUrIENQVSB1c2FnZSA6KFxuXHRcdFx0dmFyIG1ldGEgPSBtc2cuX3x8KG1zZy5fPWZ1bmN0aW9uKCl7fSk7XG5cdFx0XHR2YXIgREJHID0gbXNnLkRCRywgUyA9ICtuZXcgRGF0ZTsgbWV0YS55ID0gbWV0YS55IHx8IFM7IGlmKCFwZWVyKXsgREJHICYmIChEQkcueSA9IFMpIH1cblx0XHRcdGlmKCEoaWQgPSBtc2dbJyMnXSkpeyBpZCA9IG1zZ1snIyddID0gU3RyaW5nLnJhbmRvbSg5KSB9XG5cdFx0XHQhbG9vcCAmJiBkdXBfdHJhY2soaWQpOy8vLml0ID0gaXQobXNnKTsgLy8gdHJhY2sgZm9yIDkgc2Vjb25kcywgZGVmYXVsdC4gRWFydGg8LT5NYXJzIHdvdWxkIG5lZWQgbW9yZSEgLy8gYWx3YXlzIHRyYWNrLCBtYXliZSBtb3ZlIHRoaXMgdG8gdGhlICdhZnRlcicgbG9naWMgaWYgd2Ugc3BsaXQgZnVuY3Rpb24uXG5cdFx0XHQvL2lmKG1zZy5wdXQgJiYgKG1zZy5lcnIgfHwgKGR1cC5zW2lkXXx8JycpLmVycikpeyByZXR1cm4gZmFsc2UgfSAvLyBUT0RPOiBpbiB0aGVvcnkgd2Ugc2hvdWxkIG5vdCBiZSBhYmxlIHRvIHN0dW4gYSBtZXNzYWdlLCBidXQgZm9yIG5vdyBnb2luZyB0byBjaGVjayBpZiBpdCBjYW4gaGVscCBuZXR3b3JrIHBlcmZvcm1hbmNlIHByZXZlbnRpbmcgaW52YWxpZCBkYXRhIHRvIHJlbGF5LlxuXHRcdFx0aWYoIShoYXNoID0gbXNnWycjIyddKSAmJiB1ICE9PSBtc2cucHV0ICYmICFtZXRhLnZpYSAmJiBhY2speyBtZXNoLmhhc2gobXNnLCBwZWVyKTsgcmV0dXJuIH0gLy8gVE9ETzogU2hvdWxkIGJyb2FkY2FzdHMgYmUgaGFzaGVkP1xuXHRcdFx0aWYoIXBlZXIgJiYgYWNrKXsgcGVlciA9ICgodG1wID0gZHVwLnNbYWNrXSkgJiYgKHRtcC52aWEgfHwgKCh0bXAgPSB0bXAuaXQpICYmICh0bXAgPSB0bXAuXykgJiYgdG1wLnZpYSkpKSB8fCAoKHRtcCA9IG1lc2gubGFzdCkgJiYgYWNrID09PSB0bXBbJyMnXSAmJiBtZXNoLmxlYXApIH0gLy8gd2FybmluZyEgbWVzaC5sZWFwIGNvdWxkIGJlIGJ1Z2d5ISBtZXNoIGxhc3QgY2hlY2sgcmVkdWNlcyB0aGlzLlxuXHRcdFx0aWYoIXBlZXIgJiYgYWNrKXsgLy8gc3RpbGwgbm8gcGVlciwgdGhlbiBhY2sgZGFpc3kgY2hhaW4gJ3R1bm5lbCcgZ290IGxvc3QuXG5cdFx0XHRcdGlmKGR1cC5zW2Fja10peyByZXR1cm4gfSAvLyBpbiBkdXBzIGJ1dCBubyBwZWVyIGhpbnRzIHRoYXQgdGhpcyB3YXMgYWNrIHRvIG91cnNlbGYsIGlnbm9yZS5cblx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVCgrbmV3IERhdGUsICsrU01JQSwgJ3RvdGFsIG5vIHBlZXIgdG8gYWNrIHRvJyk7IC8vIFRPRE86IERlbGV0ZSB0aGlzIG5vdy4gRHJvcHBpbmcgbG9zdCBBQ0tzIGlzIHByb3RvY29sIGZpbmUgbm93LlxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9IC8vIFRPRE86IFRlbXBvcmFyeT8gSWYgYWNrIHZpYSB0cmFjZSBoYXMgYmVlbiBsb3N0LCBhY2tzIHdpbGwgZ28gdG8gYWxsIHBlZXJzLCB3aGljaCB0cmFzaGVzIGJyb3dzZXIgYmFuZHdpZHRoLiBOb3QgcmVsYXlpbmcgdGhlIGFjayB3aWxsIGZvcmNlIHNlbmRlciB0byBhc2sgZm9yIGFjayBhZ2Fpbi4gTm90ZSwgdGhpcyBpcyB0ZWNobmljYWxseSB3cm9uZyBmb3IgbWVzaCBiZWhhdmlvci5cblx0XHRcdGlmKCFwZWVyICYmIG1lc2gud2F5KXsgcmV0dXJuIG1lc2gud2F5KG1zZykgfVxuXHRcdFx0REJHICYmIChEQkcueWggPSArbmV3IERhdGUpO1xuXHRcdFx0aWYoIShyYXcgPSBtZXRhLnJhdykpeyBtZXNoLnJhdyhtc2csIHBlZXIpOyByZXR1cm4gfVxuXHRcdFx0REJHICYmIChEQkcueXIgPSArbmV3IERhdGUpO1xuXHRcdFx0aWYoIXBlZXIgfHwgIXBlZXIuaWQpe1xuXHRcdFx0XHRpZighT2JqZWN0LnBsYWluKHBlZXIgfHwgb3B0LnBlZXJzKSl7IHJldHVybiBmYWxzZSB9XG5cdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHR2YXIgUCA9IG9wdC5wdWZmLCBwcyA9IG9wdC5wZWVycywgcGwgPSBPYmplY3Qua2V5cyhwZWVyIHx8IG9wdC5wZWVycyB8fCB7fSk7IC8vIFRPRE86IC5rZXlzKCBpcyBzbG93XG5cdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3BlZXIga2V5cycpO1xuXHRcdFx0XHQ7KGZ1bmN0aW9uIGdvKCl7XG5cdFx0XHRcdFx0dmFyIFMgPSArbmV3IERhdGU7XG5cdFx0XHRcdFx0Ly9UeXBlLm9iai5tYXAocGVlciB8fCBvcHQucGVlcnMsIGVhY2gpOyAvLyBpbiBjYXNlIHBlZXIgaXMgYSBwZWVyIGxpc3QuXG5cdFx0XHRcdFx0bG9vcCA9IDE7IHZhciB3ciA9IG1ldGEucmF3OyBtZXRhLnJhdyA9IHJhdzsgLy8gcXVpY2sgcGVyZiBoYWNrXG5cdFx0XHRcdFx0dmFyIGkgPSAwLCBwOyB3aGlsZShpIDwgOSAmJiAocCA9IChwbHx8JycpW2krK10pKXtcblx0XHRcdFx0XHRcdGlmKCEocCA9IHBzW3BdKSl7IGNvbnRpbnVlIH1cblx0XHRcdFx0XHRcdG1lc2guc2F5KG1zZywgcCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG1ldGEucmF3ID0gd3I7IGxvb3AgPSAwO1xuXHRcdFx0XHRcdHBsID0gcGwuc2xpY2UoaSk7IC8vIHNsaWNpbmcgYWZ0ZXIgaXMgZmFzdGVyIHRoYW4gc2hpZnRpbmcgZHVyaW5nLlxuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3NheSBsb29wJyk7XG5cdFx0XHRcdFx0aWYoIXBsLmxlbmd0aCl7IHJldHVybiB9XG5cdFx0XHRcdFx0cHVmZihnbywgMCk7XG5cdFx0XHRcdFx0YWNrICYmIGR1cF90cmFjayhhY2spOyAvLyBrZWVwIGZvciBsYXRlclxuXHRcdFx0XHR9KCkpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHQvLyBUT0RPOiBQRVJGOiBjb25zaWRlciBzcGxpdHRpbmcgZnVuY3Rpb24gaGVyZSwgc28gc2F5IGxvb3BzIGRvIGxlc3Mgd29yay5cblx0XHRcdGlmKCFwZWVyLndpcmUgJiYgbWVzaC53aXJlKXsgbWVzaC53aXJlKHBlZXIpIH1cblx0XHRcdGlmKGlkID09PSBwZWVyLmxhc3QpeyByZXR1cm4gfSBwZWVyLmxhc3QgPSBpZDsgIC8vIHdhcyBpdCBqdXN0IHNlbnQ/XG5cdFx0XHRpZihwZWVyID09PSBtZXRhLnZpYSl7IHJldHVybiBmYWxzZSB9IC8vIGRvbid0IHNlbmQgYmFjayB0byBzZWxmLlxuXHRcdFx0aWYoKHRtcCA9IG1ldGEueW8pICYmICh0bXBbcGVlci51cmxdIHx8IHRtcFtwZWVyLnBpZF0gfHwgdG1wW3BlZXIuaWRdKSAvKiYmICFvKi8peyByZXR1cm4gZmFsc2UgfVxuXHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8bWV0YSkueXAgPSArbmV3IERhdGUpIC0gKG1ldGEueSB8fCBTKSwgJ3NheSBwcmVwJyk7XG5cdFx0XHQhbG9vcCAmJiBhY2sgJiYgZHVwX3RyYWNrKGFjayk7IC8vIHN0cmVhbWluZyBsb25nIHJlc3BvbnNlcyBuZWVkcyB0byBrZWVwIGFsaXZlIHRoZSBhY2suXG5cdFx0XHRpZihwZWVyLmJhdGNoKXtcblx0XHRcdFx0cGVlci50YWlsID0gKHRtcCA9IHBlZXIudGFpbCB8fCAwKSArIHJhdy5sZW5ndGg7XG5cdFx0XHRcdGlmKHBlZXIudGFpbCA8PSBvcHQucGFjayl7XG5cdFx0XHRcdFx0cGVlci5iYXRjaCArPSAodG1wPycsJzonJykrcmF3O1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRmbHVzaChwZWVyKTtcblx0XHRcdH1cblx0XHRcdHBlZXIuYmF0Y2ggPSAnWyc7IC8vIFByZXZlbnRzIGRvdWJsZSBKU09OIVxuXHRcdFx0dmFyIFNUID0gK25ldyBEYXRlO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFNULCArbmV3IERhdGUgLSBTVCwgJzBtcyBUTycpO1xuXHRcdFx0XHRmbHVzaChwZWVyKTtcblx0XHRcdH0sIG9wdC5nYXApOyAvLyBUT0RPOiBxdWV1aW5nL2JhdGNoaW5nIG1pZ2h0IGJlIGJhZCBmb3IgbG93LWxhdGVuY3kgdmlkZW8gZ2FtZSBwZXJmb3JtYW5jZSEgQWxsb3cgb3B0IG91dD9cblx0XHRcdHNlbmQocmF3LCBwZWVyKTtcblx0XHRcdGNvbnNvbGUuU1RBVCAmJiAoYWNrID09PSBwZWVyLlNJKSAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gcGVlci5TSCwgJ3NheSBhY2snKTtcblx0XHR9XG5cdFx0bWVzaC5zYXkuYyA9IG1lc2guc2F5LmQgPSAwO1xuXHRcdC8vIFRPRE86IHRoaXMgY2F1c2VkIGEgb3V0LW9mLW1lbW9yeSBjcmFzaCFcblx0XHRtZXNoLnJhdyA9IGZ1bmN0aW9uKG1zZywgcGVlcil7IC8vIFRPRE86IENsZWFuIHRoaXMgdXAgLyBkZWxldGUgaXQgLyBtb3ZlIGxvZ2ljIG91dCFcblx0XHRcdGlmKCFtc2cpeyByZXR1cm4gJycgfVxuXHRcdFx0dmFyIG1ldGEgPSAobXNnLl8pIHx8IHt9LCBwdXQsIHRtcDtcblx0XHRcdGlmKHRtcCA9IG1ldGEucmF3KXsgcmV0dXJuIHRtcCB9XG5cdFx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgbXNnKXsgcmV0dXJuIG1zZyB9XG5cdFx0XHR2YXIgaGFzaCA9IG1zZ1snIyMnXSwgYWNrID0gbXNnWydAJ107XG5cdFx0XHRpZihoYXNoICYmIGFjayl7XG5cdFx0XHRcdGlmKCFtZXRhLnZpYSAmJiBkdXBfY2hlY2soYWNrK2hhc2gpKXsgcmV0dXJuIGZhbHNlIH0gLy8gZm9yIG91ciBvd24gb3V0IG1lc3NhZ2VzLCBtZW1vcnkgJiBzdG9yYWdlIG1heSBhY2sgdGhlIHNhbWUgdGhpbmcsIHNvIGRlZHVwIHRoYXQuIFRobyBpZiB2aWEgYW5vdGhlciBwZWVyLCB3ZSBhbHJlYWR5IHRyYWNrZWQgaXQgdXBvbiBoZWFyaW5nLCBzbyB0aGlzIHdpbGwgYWx3YXlzIHRyaWdnZXIgZmFsc2UgcG9zaXRpdmVzLCBzbyBkb24ndCBkbyB0aGF0IVxuXHRcdFx0XHRpZigodG1wID0gKGR1cC5zW2Fja118fCcnKS5pdCkgfHwgKCh0bXAgPSBtZXNoLmxhc3QpICYmIGFjayA9PT0gdG1wWycjJ10pKXtcblx0XHRcdFx0XHRpZihoYXNoID09PSB0bXBbJyMjJ10peyByZXR1cm4gZmFsc2UgfSAvLyBpZiBhc2sgaGFzIGEgbWF0Y2hpbmcgaGFzaCwgYWNraW5nIGlzIG9wdGlvbmFsLlxuXHRcdFx0XHRcdGlmKCF0bXBbJyMjJ10peyB0bXBbJyMjJ10gPSBoYXNoIH0gLy8gaWYgbm9uZSwgYWRkIG91ciBoYXNoIHRvIGFzayBzbyBhbnlvbmUgd2UgcmVsYXkgdG8gY2FuIGRlZHVwLiAvLyBOT1RFOiBNYXkgb25seSBjaGVjayBhZ2FpbnN0IDFzdCBhY2sgY2h1bmssIDJuZCsgd29uJ3Qga25vdyBhbmQgc3RpbGwgc3RyZWFtIGJhY2sgdG8gcmVsYXlpbmcgcGVlcnMgd2hpY2ggbWF5IHRoZW4gZGVkdXAuIEFueSB3YXkgdG8gZml4IHRoaXMgd2FzdGVkIGJhbmR3aWR0aD8gSSBndWVzcyBmb3JjZSByYXRlIGxpbWl0aW5nIGJyZWFraW5nIGNoYW5nZSwgdGhhdCBhc2tpbmcgcGVlciBoYXMgdG8gYXNrIGZvciBuZXh0IGxleGljYWwgY2h1bmsuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmKCFtc2cuZGFtICYmICFtc2dbJ0AnXSl7XG5cdFx0XHRcdHZhciBpID0gMCwgdG8gPSBbXTsgdG1wID0gb3B0LnBlZXJzO1xuXHRcdFx0XHRmb3IodmFyIGsgaW4gdG1wKXsgdmFyIHAgPSB0bXBba107IC8vIFRPRE86IE1ha2UgaXQgdXAgcGVlcnMgaW5zdGVhZCFcblx0XHRcdFx0XHR0by5wdXNoKHAudXJsIHx8IHAucGlkIHx8IHAuaWQpO1xuXHRcdFx0XHRcdGlmKCsraSA+IDYpeyBicmVhayB9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoaSA+IDEpeyBtc2dbJz48J10gPSB0by5qb2luKCkgfSAvLyBUT0RPOiBCVUchIFRoaXMgZ2V0cyBzZXQgcmVnYXJkbGVzcyBvZiBwZWVycyBzZW50IHRvISBEZXRlY3Q/XG5cdFx0XHR9XG5cdFx0XHRpZihtc2cucHV0ICYmICh0bXAgPSBtc2cub2spKXsgbXNnLm9rID0geydAJzoodG1wWydAJ118fDEpLTEsICcvJzogKHRtcFsnLyddPT1tc2cuXy5uZWFyKT8gbWVzaC5uZWFyIDogdG1wWycvJ119OyB9XG5cdFx0XHRpZihwdXQgPSBtZXRhLiRwdXQpe1xuXHRcdFx0XHR0bXAgPSB7fTsgT2JqZWN0LmtleXMobXNnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyB0bXBba10gPSBtc2dba10gfSk7XG5cdFx0XHRcdHRtcC5wdXQgPSAnOl0pKFs6Jztcblx0XHRcdFx0anNvbih0bXAsIGZ1bmN0aW9uKGVyciwgcmF3KXtcblx0XHRcdFx0XHRpZihlcnIpeyByZXR1cm4gfSAvLyBUT0RPOiBIYW5kbGUhIVxuXHRcdFx0XHRcdHZhciBTID0gK25ldyBEYXRlO1xuXHRcdFx0XHRcdHRtcCA9IHJhdy5pbmRleE9mKCdcInB1dFwiOlwiOl0pKFs6XCInKTtcblx0XHRcdFx0XHRyZXModSwgcmF3ID0gcmF3LnNsaWNlKDAsIHRtcCs2KSArIHB1dCArIHJhdy5zbGljZSh0bXAgKyAxNCkpO1xuXHRcdFx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoUywgK25ldyBEYXRlIC0gUywgJ3NheSBzbGljZScpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0anNvbihtc2csIHJlcyk7XG5cdFx0XHRmdW5jdGlvbiByZXMoZXJyLCByYXcpe1xuXHRcdFx0XHRpZihlcnIpeyByZXR1cm4gfSAvLyBUT0RPOiBIYW5kbGUhIVxuXHRcdFx0XHRtZXRhLnJhdyA9IHJhdzsgLy9pZihtZXRhICYmIChyYXd8fCcnKS5sZW5ndGggPCAoOTk5ICogOTkpKXsgbWV0YS5yYXcgPSByYXcgfSAvLyBITlBFUkY6IElmIHN0cmluZyB0b28gYmlnLCBkb24ndCBrZWVwIGluIG1lbW9yeS5cblx0XHRcdFx0bWVzaC5zYXkobXNnLCBwZWVyKTtcblx0XHRcdH1cblx0XHR9XG5cdH0oKSk7XG5cblx0ZnVuY3Rpb24gZmx1c2gocGVlcil7XG5cdFx0dmFyIHRtcCA9IHBlZXIuYmF0Y2gsIHQgPSAnc3RyaW5nJyA9PSB0eXBlb2YgdG1wLCBsO1xuXHRcdGlmKHQpeyB0bXAgKz0gJ10nIH0vLyBUT0RPOiBQcmV2ZW50IGRvdWJsZSBKU09OIVxuXHRcdHBlZXIuYmF0Y2ggPSBwZWVyLnRhaWwgPSBudWxsO1xuXHRcdGlmKCF0bXApeyByZXR1cm4gfVxuXHRcdGlmKHQ/IDMgPiB0bXAubGVuZ3RoIDogIXRtcC5sZW5ndGgpeyByZXR1cm4gfSAvLyBUT0RPOiBeXG5cdFx0aWYoIXQpe3RyeXt0bXAgPSAoMSA9PT0gdG1wLmxlbmd0aD8gdG1wWzBdIDogSlNPTi5zdHJpbmdpZnkodG1wKSk7XG5cdFx0fWNhdGNoKGUpe3JldHVybiBvcHQubG9nKCdEQU0gSlNPTiBzdHJpbmdpZnkgZXJyb3InLCBlKX19XG5cdFx0aWYoIXRtcCl7IHJldHVybiB9XG5cdFx0c2VuZCh0bXAsIHBlZXIpO1xuXHR9XG5cdC8vIGZvciBub3cgLSBmaW5kIGJldHRlciBwbGFjZSBsYXRlci5cblx0ZnVuY3Rpb24gc2VuZChyYXcsIHBlZXIpeyB0cnl7XG5cdFx0dmFyIHdpcmUgPSBwZWVyLndpcmU7XG5cdFx0aWYocGVlci5zYXkpe1xuXHRcdFx0cGVlci5zYXkocmF3KTtcblx0XHR9IGVsc2Vcblx0XHRpZih3aXJlLnNlbmQpe1xuXHRcdFx0d2lyZS5zZW5kKHJhdyk7XG5cdFx0fVxuXHRcdG1lc2guc2F5LmQgKz0gcmF3Lmxlbmd0aHx8MDsgKyttZXNoLnNheS5jOyAvLyBTVEFUUyFcblx0fWNhdGNoKGUpe1xuXHRcdChwZWVyLnF1ZXVlID0gcGVlci5xdWV1ZSB8fCBbXSkucHVzaChyYXcpO1xuXHR9fVxuXG5cdG1lc2gubmVhciA9IDA7XG5cdG1lc2guaGkgPSBmdW5jdGlvbihwZWVyKXtcblx0XHR2YXIgd2lyZSA9IHBlZXIud2lyZSwgdG1wO1xuXHRcdGlmKCF3aXJlKXsgbWVzaC53aXJlKChwZWVyLmxlbmd0aCAmJiB7dXJsOiBwZWVyLCBpZDogcGVlcn0pIHx8IHBlZXIpOyByZXR1cm4gfVxuXHRcdGlmKHBlZXIuaWQpe1xuXHRcdFx0b3B0LnBlZXJzW3BlZXIudXJsIHx8IHBlZXIuaWRdID0gcGVlcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dG1wID0gcGVlci5pZCA9IHBlZXIuaWQgfHwgU3RyaW5nLnJhbmRvbSg5KTtcblx0XHRcdG1lc2guc2F5KHtkYW06ICc/JywgcGlkOiByb290Lm9wdC5waWR9LCBvcHQucGVlcnNbdG1wXSA9IHBlZXIpO1xuXHRcdFx0ZGVsZXRlIGR1cC5zW3BlZXIubGFzdF07IC8vIElNUE9SVEFOVDogc2VlIGh0dHBzOi8vZ3VuLmVjby9kb2NzL0RBTSNzZWxmXG5cdFx0fVxuXHRcdGlmKCFwZWVyLm1ldCl7XG5cdFx0XHRtZXNoLm5lYXIrKztcblx0XHRcdHBlZXIubWV0ID0gKyhuZXcgRGF0ZSk7XG5cdFx0XHRyb290Lm9uKCdoaScsIHBlZXIpXG5cdFx0fVxuXHRcdC8vIEByb2dvd3NraSBJIG5lZWQgdGhpcyBoZXJlIGJ5IGRlZmF1bHQgZm9yIG5vdyB0byBmaXggZ28xZGZpc2gncyBidWdcblx0XHR0bXAgPSBwZWVyLnF1ZXVlOyBwZWVyLnF1ZXVlID0gW107XG5cdFx0c2V0VGltZW91dC5lYWNoKHRtcHx8W10sZnVuY3Rpb24obXNnKXtcblx0XHRcdHNlbmQobXNnLCBwZWVyKTtcblx0XHR9LDAsOSk7XG5cdFx0Ly9UeXBlLm9iai5uYXRpdmUgJiYgVHlwZS5vYmoubmF0aXZlKCk7IC8vIGRpcnR5IHBsYWNlIHRvIGNoZWNrIGlmIG90aGVyIEpTIHBvbGx1dGVkLlxuXHR9XG5cdG1lc2guYnllID0gZnVuY3Rpb24ocGVlcil7XG5cdFx0cGVlci5tZXQgJiYgLS1tZXNoLm5lYXI7XG5cdFx0ZGVsZXRlIHBlZXIubWV0O1xuXHRcdHJvb3Qub24oJ2J5ZScsIHBlZXIpO1xuXHRcdHZhciB0bXAgPSArKG5ldyBEYXRlKTsgdG1wID0gKHRtcCAtIChwZWVyLm1ldHx8dG1wKSk7XG5cdFx0bWVzaC5ieWUudGltZSA9ICgobWVzaC5ieWUudGltZSB8fCB0bXApICsgdG1wKSAvIDI7XG5cdH1cblx0bWVzaC5oZWFyWychJ10gPSBmdW5jdGlvbihtc2csIHBlZXIpeyBvcHQubG9nKCdFcnJvcjonLCBtc2cuZXJyKSB9XG5cdG1lc2guaGVhclsnPyddID0gZnVuY3Rpb24obXNnLCBwZWVyKXtcblx0XHRpZihtc2cucGlkKXtcblx0XHRcdGlmKCFwZWVyLnBpZCl7IHBlZXIucGlkID0gbXNnLnBpZCB9XG5cdFx0XHRpZihtc2dbJ0AnXSl7IHJldHVybiB9XG5cdFx0fVxuXHRcdG1lc2guc2F5KHtkYW06ICc/JywgcGlkOiBvcHQucGlkLCAnQCc6IG1zZ1snIyddfSwgcGVlcik7XG5cdFx0ZGVsZXRlIGR1cC5zW3BlZXIubGFzdF07IC8vIElNUE9SVEFOVDogc2VlIGh0dHBzOi8vZ3VuLmVjby9kb2NzL0RBTSNzZWxmXG5cdH1cblx0bWVzaC5oZWFyWydtb2InXSA9IGZ1bmN0aW9uKG1zZywgcGVlcil7IC8vIE5PVEU6IEFYRSB3aWxsIG92ZXJsb2FkIHRoaXMgd2l0aCBiZXR0ZXIgbG9naWMuXG5cdFx0aWYoIW1zZy5wZWVycyl7IHJldHVybiB9XG5cdFx0dmFyIHBlZXJzID0gT2JqZWN0LmtleXMobXNnLnBlZXJzKSwgb25lID0gcGVlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnBlZXJzLmxlbmd0aCldO1xuXHRcdGlmKCFvbmUpeyByZXR1cm4gfVxuXHRcdG1lc2guYnllKHBlZXIpO1xuXHRcdG1lc2guaGkob25lKTtcblx0fVxuXG5cdHJvb3Qub24oJ2NyZWF0ZScsIGZ1bmN0aW9uKHJvb3Qpe1xuXHRcdHJvb3Qub3B0LnBpZCA9IHJvb3Qub3B0LnBpZCB8fCBTdHJpbmcucmFuZG9tKDkpO1xuXHRcdHRoaXMudG8ubmV4dChyb290KTtcblx0XHRyb290Lm9uKCdvdXQnLCBtZXNoLnNheSk7XG5cdH0pO1xuXG5cdHJvb3Qub24oJ2J5ZScsIGZ1bmN0aW9uKHBlZXIsIHRtcCl7XG5cdFx0cGVlciA9IG9wdC5wZWVyc1twZWVyLmlkIHx8IHBlZXJdIHx8IHBlZXI7XG5cdFx0dGhpcy50by5uZXh0KHBlZXIpO1xuXHRcdHBlZXIuYnllPyBwZWVyLmJ5ZSgpIDogKHRtcCA9IHBlZXIud2lyZSkgJiYgdG1wLmNsb3NlICYmIHRtcC5jbG9zZSgpO1xuXHRcdGRlbGV0ZSBvcHQucGVlcnNbcGVlci5pZF07XG5cdFx0cGVlci53aXJlID0gbnVsbDtcblx0fSk7XG5cblx0dmFyIGdldHMgPSB7fTtcblx0cm9vdC5vbignYnllJywgZnVuY3Rpb24ocGVlciwgdG1wKXsgdGhpcy50by5uZXh0KHBlZXIpO1xuXHRcdGlmKHRtcCA9IGNvbnNvbGUuU1RBVCl7IHRtcC5wZWVycyA9IG1lc2gubmVhcjsgfVxuXHRcdGlmKCEodG1wID0gcGVlci51cmwpKXsgcmV0dXJuIH0gZ2V0c1t0bXBdID0gdHJ1ZTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGRlbGV0ZSBnZXRzW3RtcF0gfSxvcHQubGFjayB8fCA5MDAwKTtcblx0fSk7XG5cdHJvb3Qub24oJ2hpJywgZnVuY3Rpb24ocGVlciwgdG1wKXsgdGhpcy50by5uZXh0KHBlZXIpO1xuXHRcdGlmKHRtcCA9IGNvbnNvbGUuU1RBVCl7IHRtcC5wZWVycyA9IG1lc2gubmVhciB9XG5cdFx0aWYoISh0bXAgPSBwZWVyLnVybCkgfHwgIWdldHNbdG1wXSl7IHJldHVybiB9IGRlbGV0ZSBnZXRzW3RtcF07XG5cdFx0aWYob3B0LnN1cGVyKXsgcmV0dXJuIH0gLy8gdGVtcG9yYXJ5ICg/KSB1bnRpbCB3ZSBoYXZlIGJldHRlciBmaXgvc29sdXRpb24/XG5cdFx0c2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKHJvb3QubmV4dCksIGZ1bmN0aW9uKHNvdWwpeyB2YXIgbm9kZSA9IHJvb3QubmV4dFtzb3VsXTsgLy8gVE9ETzogLmtleXMoIGlzIHNsb3dcblx0XHRcdHRtcCA9IHt9OyB0bXBbc291bF0gPSByb290LmdyYXBoW3NvdWxdOyB0bXAgPSBTdHJpbmcuaGFzaCh0bXApOyAvLyBUT0RPOiBCVUchIFRoaXMgaXMgYnJva2VuLlxuXHRcdFx0bWVzaC5zYXkoeycjIyc6IHRtcCwgZ2V0OiB7JyMnOiBzb3VsfX0sIHBlZXIpO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4gbWVzaDtcbn1cblx0ICB2YXIgZW1wdHkgPSB7fSwgb2sgPSB0cnVlLCB1O1xuXG5cdCAgdHJ5eyBtb2R1bGUuZXhwb3J0cyA9IE1lc2ggfWNhdGNoKGUpe31cblxuXHQiLCJcbnZhciBHdW4gPSByZXF1aXJlKCcuL2luZGV4Jyk7XG5HdW4uY2hhaW4ub24gPSBmdW5jdGlvbih0YWcsIGFyZywgZWFzLCBhcyl7IC8vIGRvbid0IHJld3JpdGUhXG5cdHZhciBndW4gPSB0aGlzLCBjYXQgPSBndW4uXywgcm9vdCA9IGNhdC5yb290LCBhY3QsIG9mZiwgaWQsIHRtcDtcblx0aWYodHlwZW9mIHRhZyA9PT0gJ3N0cmluZycpe1xuXHRcdGlmKCFhcmcpeyByZXR1cm4gY2F0Lm9uKHRhZykgfVxuXHRcdGFjdCA9IGNhdC5vbih0YWcsIGFyZywgZWFzIHx8IGNhdCwgYXMpO1xuXHRcdGlmKGVhcyAmJiBlYXMuJCl7XG5cdFx0XHQoZWFzLnN1YnMgfHwgKGVhcy5zdWJzID0gW10pKS5wdXNoKGFjdCk7XG5cdFx0fVxuXHRcdHJldHVybiBndW47XG5cdH1cblx0dmFyIG9wdCA9IGFyZztcblx0KG9wdCA9ICh0cnVlID09PSBvcHQpPyB7Y2hhbmdlOiB0cnVlfSA6IG9wdCB8fCB7fSkubm90ID0gMTsgb3B0Lm9uID0gMTtcblx0Ly9vcHQuYXQgPSBjYXQ7XG5cdC8vb3B0Lm9rID0gdGFnO1xuXHQvL29wdC5sYXN0ID0ge307XG5cdHZhciB3YWl0ID0ge307IC8vIGNhbiB3ZSBhc3NpZ24gdGhpcyB0byB0aGUgYXQgaW5zdGVhZCwgbGlrZSBpbiBvbmNlP1xuXHRndW4uZ2V0KHRhZywgb3B0KTtcblx0LypndW4uZ2V0KGZ1bmN0aW9uIG9uKGRhdGEsa2V5LG1zZyxldmUpeyB2YXIgJCA9IHRoaXM7XG5cdFx0aWYodG1wID0gcm9vdC5oYXRjaCl7IC8vIHF1aWNrIGhhY2shXG5cdFx0XHRpZih3YWl0WyQuXy5pZF0peyByZXR1cm4gfSB3YWl0WyQuXy5pZF0gPSAxO1xuXHRcdFx0dG1wLnB1c2goZnVuY3Rpb24oKXtvbi5jYWxsKCQsIGRhdGEsa2V5LG1zZyxldmUpfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fTsgd2FpdCA9IHt9OyAvLyBlbmQgcXVpY2sgaGFjay5cblx0XHR0YWcuY2FsbCgkLCBkYXRhLGtleSxtc2csZXZlKTtcblx0fSwgb3B0KTsgLy8gVE9ETzogUEVSRiEgRXZlbnQgbGlzdGVuZXIgbGVhayEhIT8qL1xuXHQvKlxuXHRmdW5jdGlvbiBvbmUobXNnLCBldmUpe1xuXHRcdGlmKG9uZS5zdHVuKXsgcmV0dXJuIH1cblx0XHR2YXIgYXQgPSBtc2cuJC5fLCBkYXRhID0gYXQucHV0LCB0bXA7XG5cdFx0aWYodG1wID0gYXQubGluayl7IGRhdGEgPSByb290LiQuZ2V0KHRtcCkuXy5wdXQgfVxuXHRcdGlmKG9wdC5ub3Q9PT11ICYmIHUgPT09IGRhdGEpeyByZXR1cm4gfVxuXHRcdGlmKG9wdC5zdHVuPT09dSAmJiAodG1wID0gcm9vdC5zdHVuKSAmJiAodG1wID0gdG1wW2F0LmlkXSB8fCB0bXBbYXQuYmFjay5pZF0pICYmICF0bXAuZW5kKXsgLy8gUmVtZW1iZXIhIElmIHlvdSBwb3J0IHRoaXMgaW50byBgLmdldChjYmAgbWFrZSBzdXJlIHlvdSBhbGxvdyBzdHVuOjAgc2tpcCBvcHRpb24gZm9yIGAucHV0KGAuXG5cdFx0XHR0bXBbaWRdID0gZnVuY3Rpb24oKXtvbmUobXNnLGV2ZSl9O1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvL3RtcCA9IG9uZS53YWl0IHx8IChvbmUud2FpdCA9IHt9KTsgY29uc29sZS5sb2codG1wW2F0LmlkXSA9PT0gJycpOyBpZih0bXBbYXQuaWRdICE9PSAnJyl7IHRtcFthdC5pZF0gPSB0bXBbYXQuaWRdIHx8IHNldFRpbWVvdXQoZnVuY3Rpb24oKXt0bXBbYXQuaWRdPScnO29uZShtc2csZXZlKX0sMSk7IHJldHVybiB9IGRlbGV0ZSB0bXBbYXQuaWRdO1xuXHRcdC8vIGNhbGw6XG5cdFx0aWYob3B0LmFzKXtcblx0XHRcdG9wdC5vay5jYWxsKG9wdC5hcywgbXNnLCBldmUgfHwgb25lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3B0Lm9rLmNhbGwoYXQuJCwgZGF0YSwgbXNnLmdldCB8fCBhdC5nZXQsIG1zZywgZXZlIHx8IG9uZSk7XG5cdFx0fVxuXHR9O1xuXHRvbmUuYXQgPSBjYXQ7XG5cdChjYXQuYWN0fHwoY2F0LmFjdD17fSkpW2lkID0gU3RyaW5nLnJhbmRvbSg3KV0gPSBvbmU7XG5cdG9uZS5vZmYgPSBmdW5jdGlvbigpeyBvbmUuc3R1biA9IDE7IGlmKCFjYXQuYWN0KXsgcmV0dXJuIH0gZGVsZXRlIGNhdC5hY3RbaWRdIH1cblx0Y2F0Lm9uKCdvdXQnLCB7Z2V0OiB7fX0pOyovXG5cdHJldHVybiBndW47XG59XG4vLyBSdWxlczpcbi8vIDEuIElmIGNhY2hlZCwgc2hvdWxkIGJlIGZhc3QsIGJ1dCBub3QgcmVhZCB3aGlsZSB3cml0ZS5cbi8vIDIuIFNob3VsZCBub3QgcmV0cmlnZ2VyIG90aGVyIGxpc3RlbmVycywgc2hvdWxkIGdldCB0cmlnZ2VyZWQgZXZlbiBpZiBub3RoaW5nIGZvdW5kLlxuLy8gMy4gSWYgdGhlIHNhbWUgY2FsbGJhY2sgcGFzc2VkIHRvIG1hbnkgZGlmZmVyZW50IG9uY2UgY2hhaW5zLCBlYWNoIHNob3VsZCByZXNvbHZlIC0gYW4gdW5zdWJzY3JpYmUgZnJvbSB0aGUgc2FtZSBjYWxsYmFjayBzaG91bGQgbm90IGVmZmVjdCB0aGUgc3RhdGUgb2YgdGhlIG90aGVyIHJlc29sdmluZyBjaGFpbnMsIGlmIHlvdSBkbyB3YW50IHRvIGNhbmNlbCB0aGVtIGFsbCBlYXJseSB5b3Ugc2hvdWxkIG11dGF0ZSB0aGUgY2FsbGJhY2sgaXRzZWxmIHdpdGggYSBmbGFnICYgY2hlY2sgZm9yIGl0IGF0IHRvcCBvZiBjYWxsYmFja1xuR3VuLmNoYWluLm9uY2UgPSBmdW5jdGlvbihjYiwgb3B0KXsgb3B0ID0gb3B0IHx8IHt9OyAvLyBhdm9pZCByZXdyaXRpbmdcblx0aWYoIWNiKXsgcmV0dXJuIG5vbmUodGhpcyxvcHQpIH1cblx0dmFyIGd1biA9IHRoaXMsIGNhdCA9IGd1bi5fLCByb290ID0gY2F0LnJvb3QsIGRhdGEgPSBjYXQucHV0LCBpZCA9IFN0cmluZy5yYW5kb20oNyksIG9uZSwgdG1wO1xuXHRndW4uZ2V0KGZ1bmN0aW9uKGRhdGEsa2V5LG1zZyxldmUpe1xuXHRcdHZhciAkID0gdGhpcywgYXQgPSAkLl8sIG9uZSA9IChhdC5vbmV8fChhdC5vbmU9e30pKTtcblx0XHRpZihldmUuc3R1bil7IHJldHVybiB9IGlmKCcnID09PSBvbmVbaWRdKXsgcmV0dXJuIH1cblx0XHRpZih0cnVlID09PSAodG1wID0gR3VuLnZhbGlkKGRhdGEpKSl7IG9uY2UoKTsgcmV0dXJuIH1cblx0XHRpZignc3RyaW5nJyA9PSB0eXBlb2YgdG1wKXsgcmV0dXJuIH0gLy8gVE9ETzogQlVHPyBXaWxsIHRoaXMgYWx3YXlzIGxvYWQ/XG5cdFx0Y2xlYXJUaW1lb3V0KChjYXQub25lfHwnJylbaWRdKTsgLy8gY2xlYXIgXCJub3QgZm91bmRcIiBzaW5jZSB0aGV5IG9ubHkgZ2V0IHNldCBvbiBjYXQuXG5cdFx0Y2xlYXJUaW1lb3V0KG9uZVtpZF0pOyBvbmVbaWRdID0gc2V0VGltZW91dChvbmNlLCBvcHQud2FpdHx8OTkpOyAvLyBUT0RPOiBCdWc/IFRoaXMgZG9lc24ndCBoYW5kbGUgcGx1cmFsIGNoYWlucy5cblx0XHRmdW5jdGlvbiBvbmNlKGYpe1xuXHRcdFx0aWYoIWF0LmhhcyAmJiAhYXQuc291bCl7IGF0ID0ge3B1dDogZGF0YSwgZ2V0OiBrZXl9IH0gLy8gaGFuZGxlcyBub24tY29yZSBtZXNzYWdlcy5cblx0XHRcdGlmKHUgPT09ICh0bXAgPSBhdC5wdXQpKXsgdG1wID0gKChtc2cuJCR8fCcnKS5ffHwnJykucHV0IH1cblx0XHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiBHdW4udmFsaWQodG1wKSl7XG5cdFx0XHRcdHRtcCA9IHJvb3QuJC5nZXQodG1wKS5fLnB1dDtcblx0XHRcdFx0aWYodG1wID09PSB1ICYmICFmKXtcblx0XHRcdFx0XHRvbmVbaWRdID0gc2V0VGltZW91dChmdW5jdGlvbigpeyBvbmNlKDEpIH0sIG9wdC53YWl0fHw5OSk7IC8vIFRPRE86IFF1aWNrIGZpeC4gTWF5YmUgdXNlIGFjayBjb3VudCBmb3IgbW9yZSBwcmVkaWN0YWJsZSBjb250cm9sP1xuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiQU5EIFZBTklTSEVEXCIsIGRhdGEpO1xuXHRcdFx0aWYoZXZlLnN0dW4peyByZXR1cm4gfSBpZignJyA9PT0gb25lW2lkXSl7IHJldHVybiB9IG9uZVtpZF0gPSAnJztcblx0XHRcdGlmKGNhdC5zb3VsIHx8IGNhdC5oYXMpeyBldmUub2ZmKCkgfSAvLyBUT0RPOiBQbHVyYWwgY2hhaW5zPyAvLyBlbHNlIHsgPy5vZmYoKSB9IC8vIGJldHRlciB0aGFuIG9uZSBjaGVjaz9cblx0XHRcdGNiLmNhbGwoJCwgdG1wLCBhdC5nZXQpO1xuXHRcdFx0Y2xlYXJUaW1lb3V0KG9uZVtpZF0pOyAvLyBjbGVhciBcIm5vdCBmb3VuZFwiIHNpbmNlIHRoZXkgb25seSBnZXQgc2V0IG9uIGNhdC4gLy8gVE9ETzogVGhpcyB3YXMgaGFja2lseSBhZGRlZCwgaXMgaXQgbmVjZXNzYXJ5IG9yIGltcG9ydGFudD8gUHJvYmFibHkgbm90LCBpbiBmdXR1cmUgdHJ5IHJlbW92aW5nIHRoaXMuIFdhcyBhZGRlZCBqdXN0IGFzIGEgc2FmZXR5IGZvciB0aGUgYCYmICFmYCBjaGVjay5cblx0XHR9O1xuXHR9LCB7b246IDF9KTtcblx0cmV0dXJuIGd1bjtcbn1cbmZ1bmN0aW9uIG5vbmUoZ3VuLG9wdCxjaGFpbil7XG5cdEd1bi5sb2cub25jZShcInZhbG9uY2VcIiwgXCJDaGFpbmFibGUgdmFsIGlzIGV4cGVyaW1lbnRhbCwgaXRzIGJlaGF2aW9yIGFuZCBBUEkgbWF5IGNoYW5nZSBtb3ZpbmcgZm9yd2FyZC4gUGxlYXNlIHBsYXkgd2l0aCBpdCBhbmQgcmVwb3J0IGJ1Z3MgYW5kIGlkZWFzIG9uIGhvdyB0byBpbXByb3ZlIGl0LlwiKTtcblx0KGNoYWluID0gZ3VuLmNoYWluKCkpLl8ubml4ID0gZ3VuLm9uY2UoZnVuY3Rpb24oZGF0YSwga2V5KXsgY2hhaW4uXy5vbignaW4nLCB0aGlzLl8pIH0pO1xuXHRjaGFpbi5fLmxleCA9IGd1bi5fLmxleDsgLy8gVE9ETzogQmV0dGVyIGFwcHJvYWNoIGluIGZ1dHVyZT8gVGhpcyBpcyBxdWljayBmb3Igbm93LlxuXHRyZXR1cm4gY2hhaW47XG59XG5cbkd1bi5jaGFpbi5vZmYgPSBmdW5jdGlvbigpe1xuXHQvLyBtYWtlIG9mZiBtb3JlIGFnZ3Jlc3NpdmUuIFdhcm5pbmcsIGl0IG1pZ2h0IGJhY2tmaXJlIVxuXHR2YXIgZ3VuID0gdGhpcywgYXQgPSBndW4uXywgdG1wO1xuXHR2YXIgY2F0ID0gYXQuYmFjaztcblx0aWYoIWNhdCl7IHJldHVybiB9XG5cdGF0LmFjayA9IDA7IC8vIHNvIGNhbiByZXN1YnNjcmliZS5cblx0aWYodG1wID0gY2F0Lm5leHQpe1xuXHRcdGlmKHRtcFthdC5nZXRdKXtcblx0XHRcdGRlbGV0ZSB0bXBbYXQuZ2V0XTtcblx0XHR9IGVsc2Uge1xuXG5cdFx0fVxuXHR9XG5cdC8vIFRPRE86IGRlbGV0ZSBjYXQub25lW21hcC5pZF0/XG5cdGlmKHRtcCA9IGNhdC5hc2spe1xuXHRcdGRlbGV0ZSB0bXBbYXQuZ2V0XTtcblx0fVxuXHRpZih0bXAgPSBjYXQucHV0KXtcblx0XHRkZWxldGUgdG1wW2F0LmdldF07XG5cdH1cblx0aWYodG1wID0gYXQuc291bCl7XG5cdFx0ZGVsZXRlIGNhdC5yb290LmdyYXBoW3RtcF07XG5cdH1cblx0aWYodG1wID0gYXQubWFwKXtcblx0XHRPYmplY3Qua2V5cyh0bXApLmZvckVhY2goZnVuY3Rpb24oaSxhdCl7IGF0ID0gdG1wW2ldOyAvL29ial9tYXAodG1wLCBmdW5jdGlvbihhdCl7XG5cdFx0XHRpZihhdC5saW5rKXtcblx0XHRcdFx0Y2F0LnJvb3QuJC5nZXQoYXQubGluaykub2ZmKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0aWYodG1wID0gYXQubmV4dCl7XG5cdFx0T2JqZWN0LmtleXModG1wKS5mb3JFYWNoKGZ1bmN0aW9uKGksbmVhdCl7IG5lYXQgPSB0bXBbaV07IC8vb2JqX21hcCh0bXAsIGZ1bmN0aW9uKG5lYXQpe1xuXHRcdFx0bmVhdC4kLm9mZigpO1xuXHRcdH0pO1xuXHR9XG5cdGF0Lm9uKCdvZmYnLCB7fSk7XG5cdHJldHVybiBndW47XG59XG52YXIgZW1wdHkgPSB7fSwgbm9vcCA9IGZ1bmN0aW9uKCl7fSwgdTtcblx0IiwiXG4vLyBPbiBldmVudCBlbWl0dGVyIGdlbmVyaWMgamF2YXNjcmlwdCB1dGlsaXR5LlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvbnRvKHRhZywgYXJnLCBhcyl7XG5cdGlmKCF0YWcpeyByZXR1cm4ge3RvOiBvbnRvfSB9XG5cdHZhciB1LCBmID0gJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgYXJnLCB0YWcgPSAodGhpcy50YWcgfHwgKHRoaXMudGFnID0ge30pKVt0YWddIHx8IGYgJiYgKFxuXHRcdHRoaXMudGFnW3RhZ10gPSB7dGFnOiB0YWcsIHRvOiBvbnRvLl8gPSB7IG5leHQ6IGZ1bmN0aW9uKGFyZyl7IHZhciB0bXA7XG5cdFx0XHRpZih0bXAgPSB0aGlzLnRvKXsgdG1wLm5leHQoYXJnKSB9XG5cdH19fSk7XG5cdGlmKGYpe1xuXHRcdHZhciBiZSA9IHtcblx0XHRcdG9mZjogb250by5vZmYgfHxcblx0XHRcdChvbnRvLm9mZiA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmKHRoaXMubmV4dCA9PT0gb250by5fLm5leHQpeyByZXR1cm4gITAgfVxuXHRcdFx0XHRpZih0aGlzID09PSB0aGlzLnRoZS5sYXN0KXtcblx0XHRcdFx0XHR0aGlzLnRoZS5sYXN0ID0gdGhpcy5iYWNrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMudG8uYmFjayA9IHRoaXMuYmFjaztcblx0XHRcdFx0dGhpcy5uZXh0ID0gb250by5fLm5leHQ7XG5cdFx0XHRcdHRoaXMuYmFjay50byA9IHRoaXMudG87XG5cdFx0XHRcdGlmKHRoaXMudGhlLmxhc3QgPT09IHRoaXMudGhlKXtcblx0XHRcdFx0XHRkZWxldGUgdGhpcy5vbi50YWdbdGhpcy50aGUudGFnXTtcblx0XHRcdFx0fVxuXHRcdFx0fSksXG5cdFx0XHR0bzogb250by5fLFxuXHRcdFx0bmV4dDogYXJnLFxuXHRcdFx0dGhlOiB0YWcsXG5cdFx0XHRvbjogdGhpcyxcblx0XHRcdGFzOiBhcyxcblx0XHR9O1xuXHRcdChiZS5iYWNrID0gdGFnLmxhc3QgfHwgdGFnKS50byA9IGJlO1xuXHRcdHJldHVybiB0YWcubGFzdCA9IGJlO1xuXHR9XG5cdGlmKCh0YWcgPSB0YWcudG8pICYmIHUgIT09IGFyZyl7IHRhZy5uZXh0KGFyZykgfVxuXHRyZXR1cm4gdGFnO1xufTtcblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9yb290Jyk7XG5HdW4uY2hhaW4ucHV0ID0gZnVuY3Rpb24oZGF0YSwgY2IsIGFzKXsgLy8gSSByZXdyb3RlIGl0IDopXG5cdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fLCByb290ID0gYXQucm9vdDtcblx0YXMgPSBhcyB8fCB7fTtcblx0YXMucm9vdCA9IGF0LnJvb3Q7XG5cdGFzLnJ1biB8fCAoYXMucnVuID0gcm9vdC5vbmNlKTtcblx0c3R1bihhcywgYXQuaWQpOyAvLyBzZXQgYSBmbGFnIGZvciByZWFkcyB0byBjaGVjayBpZiB0aGlzIGNoYWluIGlzIHdyaXRpbmcuXG5cdGFzLmFjayA9IGFzLmFjayB8fCBjYjtcblx0YXMudmlhID0gYXMudmlhIHx8IGd1bjtcblx0YXMuZGF0YSA9IGFzLmRhdGEgfHwgZGF0YTtcblx0YXMuc291bCB8fCAoYXMuc291bCA9IGF0LnNvdWwgfHwgKCdzdHJpbmcnID09IHR5cGVvZiBjYiAmJiBjYikpO1xuXHR2YXIgcyA9IGFzLnN0YXRlID0gYXMuc3RhdGUgfHwgR3VuLnN0YXRlKCk7XG5cdGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpeyBkYXRhKGZ1bmN0aW9uKGQpeyBhcy5kYXRhID0gZDsgZ3VuLnB1dCh1LHUsYXMpIH0pOyByZXR1cm4gZ3VuIH1cblx0aWYoIWFzLnNvdWwpeyByZXR1cm4gZ2V0KGFzKSwgZ3VuIH1cblx0YXMuJCA9IHJvb3QuJC5nZXQoYXMuc291bCk7IC8vIFRPRE86IFRoaXMgbWF5IG5vdCBhbGxvdyB1c2VyIGNoYWluaW5nIGFuZCBzaW1pbGFyP1xuXHRhcy50b2RvID0gW3tpdDogYXMuZGF0YSwgcmVmOiBhcy4kfV07XG5cdGFzLnR1cm4gPSBhcy50dXJuIHx8IHR1cm47XG5cdGFzLnJhbiA9IGFzLnJhbiB8fCByYW47XG5cdC8vdmFyIHBhdGggPSBbXTsgYXMudmlhLmJhY2soYXQgPT4geyBhdC5nZXQgJiYgcGF0aC5wdXNoKGF0LmdldC5zbGljZSgwLDkpKSB9KTsgcGF0aCA9IHBhdGgucmV2ZXJzZSgpLmpvaW4oJy4nKTtcblx0Ly8gVE9ETzogUGVyZiEgV2Ugb25seSBuZWVkIHRvIHN0dW4gY2hhaW5zIHRoYXQgYXJlIGJlaW5nIG1vZGlmaWVkLCBub3QgbmVjZXNzYXJpbHkgd3JpdHRlbiB0by5cblx0KGZ1bmN0aW9uIHdhbGsoKXtcblx0XHR2YXIgdG8gPSBhcy50b2RvLCBhdCA9IHRvLnBvcCgpLCBkID0gYXQuaXQsIGNpZCA9IGF0LnJlZiAmJiBhdC5yZWYuXy5pZCwgdiwgaywgY2F0LCB0bXAsIGc7XG5cdFx0c3R1bihhcywgYXQucmVmKTtcblx0XHRpZih0bXAgPSBhdC50b2RvKXtcblx0XHRcdGsgPSB0bXAucG9wKCk7IGQgPSBkW2tdO1xuXHRcdFx0aWYodG1wLmxlbmd0aCl7IHRvLnB1c2goYXQpIH1cblx0XHR9XG5cdFx0ayAmJiAodG8ucGF0aCB8fCAodG8ucGF0aCA9IFtdKSkucHVzaChrKTtcblx0XHRpZighKHYgPSB2YWxpZChkKSkgJiYgIShnID0gR3VuLmlzKGQpKSl7XG5cdFx0XHRpZighT2JqZWN0LnBsYWluKGQpKXsgcmFuLmVycihhcywgXCJJbnZhbGlkIGRhdGE6IFwiKyBjaGVjayhkKSArXCIgYXQgXCIgKyAoYXMudmlhLmJhY2soZnVuY3Rpb24oYXQpe2F0LmdldCAmJiB0bXAucHVzaChhdC5nZXQpfSwgdG1wID0gW10pIHx8IHRtcC5qb2luKCcuJykpKycuJysodG8ucGF0aHx8W10pLmpvaW4oJy4nKSk7IHJldHVybiB9XG5cdFx0XHR2YXIgc2VlbiA9IGFzLnNlZW4gfHwgKGFzLnNlZW4gPSBbXSksIGkgPSBzZWVuLmxlbmd0aDtcblx0XHRcdHdoaWxlKGktLSl7IGlmKGQgPT09ICh0bXAgPSBzZWVuW2ldKS5pdCl7IHYgPSBkID0gdG1wLmxpbms7IGJyZWFrIH0gfVxuXHRcdH1cblx0XHRpZihrICYmIHYpeyBhdC5ub2RlID0gc3RhdGVfaWZ5KGF0Lm5vZGUsIGssIHMsIGQpIH0gLy8gaGFuZGxlIHNvdWwgbGF0ZXIuXG5cdFx0ZWxzZSB7XG5cdFx0XHRpZighYXMuc2Vlbil7IHJhbi5lcnIoYXMsIFwiRGF0YSBhdCByb290IG9mIGdyYXBoIG11c3QgYmUgYSBub2RlIChhbiBvYmplY3QpLlwiKTsgcmV0dXJuIH1cblx0XHRcdGFzLnNlZW4ucHVzaChjYXQgPSB7aXQ6IGQsIGxpbms6IHt9LCB0b2RvOiBnPyBbXSA6IE9iamVjdC5rZXlzKGQpLnNvcnQoKS5yZXZlcnNlKCksIHBhdGg6ICh0by5wYXRofHxbXSkuc2xpY2UoKSwgdXA6IGF0fSk7IC8vIEFueSBwZXJmIHJlYXNvbnMgdG8gQ1BVIHNjaGVkdWxlIHRoaXMgLmtleXMoID9cblx0XHRcdGF0Lm5vZGUgPSBzdGF0ZV9pZnkoYXQubm9kZSwgaywgcywgY2F0LmxpbmspO1xuXHRcdFx0IWcgJiYgY2F0LnRvZG8ubGVuZ3RoICYmIHRvLnB1c2goY2F0KTtcblx0XHRcdC8vIC0tLS0tLS0tLS0tLS0tLVxuXHRcdFx0dmFyIGlkID0gYXMuc2Vlbi5sZW5ndGg7XG5cdFx0XHQoYXMud2FpdCB8fCAoYXMud2FpdCA9IHt9KSlbaWRdID0gJyc7XG5cdFx0XHR0bXAgPSAoY2F0LnJlZiA9IChnPyBkIDogaz8gYXQucmVmLmdldChrKSA6IGF0LnJlZikpLl87XG5cdFx0XHQodG1wID0gKGQgJiYgKGQuX3x8JycpWycjJ10pIHx8IHRtcC5zb3VsIHx8IHRtcC5saW5rKT8gcmVzb2x2ZSh7c291bDogdG1wfSkgOiBjYXQucmVmLmdldChyZXNvbHZlLCB7cnVuOiBhcy5ydW4sIC8qaGF0Y2g6IDAsKi8gdjIwMjA6MSwgb3V0OntnZXQ6eycuJzonICd9fX0pOyAvLyBUT0RPOiBCVUchIFRoaXMgc2hvdWxkIGJlIHJlc29sdmUgT05MWSBzb3VsIHRvIHByZXZlbnQgZnVsbCBkYXRhIGZyb20gYmVpbmcgbG9hZGVkLiAvLyBGaXhlZCBub3c/XG5cdFx0XHQvL3NldFRpbWVvdXQoZnVuY3Rpb24oKXsgaWYoRil7IHJldHVybiB9IGNvbnNvbGUubG9nKFwiSSBIQVZFIE5PVCBCRUVOIENBTExFRCFcIiwgcGF0aCwgaWQsIGNhdC5yZWYuXy5pZCwgaykgfSwgOTAwMCk7IHZhciBGOyAvLyBNQUtFIFNVUkUgVE8gQUREIEYgPSAxIGJlbG93IVxuXHRcdFx0ZnVuY3Rpb24gcmVzb2x2ZShtc2csIGV2ZSl7XG5cdFx0XHRcdHZhciBlbmQgPSBjYXQubGlua1snIyddO1xuXHRcdFx0XHRpZihldmUpeyBldmUub2ZmKCk7IGV2ZS5yaWQobXNnKSB9IC8vIFRPRE86IFRvbyBlYXJseSEgQ2hlY2sgYWxsIHBlZXJzIGFjayBub3QgZm91bmQuXG5cdFx0XHRcdC8vIFRPRE86IEJVRyBtYXliZT8gTWFrZSBzdXJlIHRoaXMgZG9lcyBub3QgcGljayB1cCBhIGxpbmsgY2hhbmdlIHdpcGUsIHRoYXQgaXQgdXNlcyB0aGUgY2hhbmdpZ24gbGluayBpbnN0ZWFkLlxuXHRcdFx0XHR2YXIgc291bCA9IGVuZCB8fCBtc2cuc291bCB8fCAodG1wID0gKG1zZy4kJHx8bXNnLiQpLl98fCcnKS5zb3VsIHx8IHRtcC5saW5rIHx8ICgodG1wID0gdG1wLnB1dHx8JycpLl98fCcnKVsnIyddIHx8IHRtcFsnIyddIHx8ICgoKHRtcCA9IG1zZy5wdXR8fCcnKSAmJiBtc2cuJCQpPyB0bXBbJyMnXSA6ICh0bXBbJz0nXXx8dG1wWyc6J118fCcnKVsnIyddKTtcblx0XHRcdFx0IWVuZCAmJiBzdHVuKGFzLCBtc2cuJCk7XG5cdFx0XHRcdGlmKCFzb3VsICYmICFhdC5saW5rWycjJ10peyAvLyBjaGVjayBzb3VsIGxpbmsgYWJvdmUgdXNcblx0XHRcdFx0XHQoYXQud2FpdCB8fCAoYXQud2FpdCA9IFtdKSkucHVzaChmdW5jdGlvbigpeyByZXNvbHZlKG1zZywgZXZlKSB9KSAvLyB3YWl0XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFzb3VsKXtcblx0XHRcdFx0XHRzb3VsID0gW107XG5cdFx0XHRcdFx0KG1zZy4kJHx8bXNnLiQpLmJhY2soZnVuY3Rpb24oYXQpe1xuXHRcdFx0XHRcdFx0aWYodG1wID0gYXQuc291bCB8fCBhdC5saW5rKXsgcmV0dXJuIHNvdWwucHVzaCh0bXApIH1cblx0XHRcdFx0XHRcdHNvdWwucHVzaChhdC5nZXQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHNvdWwgPSBzb3VsLnJldmVyc2UoKS5qb2luKCcvJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0LmxpbmtbJyMnXSA9IHNvdWw7XG5cdFx0XHRcdCFnICYmICgoKGFzLmdyYXBoIHx8IChhcy5ncmFwaCA9IHt9KSlbc291bF0gPSAoY2F0Lm5vZGUgfHwgKGNhdC5ub2RlID0ge186e319KSkpLl9bJyMnXSA9IHNvdWwpO1xuXHRcdFx0XHRkZWxldGUgYXMud2FpdFtpZF07XG5cdFx0XHRcdGNhdC53YWl0ICYmIHNldFRpbWVvdXQuZWFjaChjYXQud2FpdCwgZnVuY3Rpb24oY2IpeyBjYiAmJiBjYigpIH0pO1xuXHRcdFx0XHRhcy5yYW4oYXMpO1xuXHRcdFx0fTtcblx0XHRcdC8vIC0tLS0tLS0tLS0tLS0tLVxuXHRcdH1cblx0XHRpZighdG8ubGVuZ3RoKXsgcmV0dXJuIGFzLnJhbihhcykgfVxuXHRcdGFzLnR1cm4od2Fsayk7XG5cdH0oKSk7XG5cdHJldHVybiBndW47XG59XG5cbmZ1bmN0aW9uIHN0dW4oYXMsIGlkKXtcblx0aWYoIWlkKXsgcmV0dXJuIH0gaWQgPSAoaWQuX3x8JycpLmlkfHxpZDtcblx0dmFyIHJ1biA9IGFzLnJvb3Quc3R1biB8fCAoYXMucm9vdC5zdHVuID0ge29uOiBHdW4ub259KSwgdGVzdCA9IHt9LCB0bXA7XG5cdGFzLnN0dW4gfHwgKGFzLnN0dW4gPSBydW4ub24oJ3N0dW4nLCBmdW5jdGlvbigpeyB9KSk7XG5cdGlmKHRtcCA9IHJ1bi5vbignJytpZCkpeyB0bXAudGhlLmxhc3QubmV4dCh0ZXN0KSB9XG5cdGlmKHRlc3QucnVuID49IGFzLnJ1bil7IHJldHVybiB9XG5cdHJ1bi5vbignJytpZCwgZnVuY3Rpb24odGVzdCl7XG5cdFx0aWYoYXMuc3R1bi5lbmQpe1xuXHRcdFx0dGhpcy5vZmYoKTtcblx0XHRcdHRoaXMudG8ubmV4dCh0ZXN0KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGVzdC5ydW4gPSB0ZXN0LnJ1biB8fCBhcy5ydW47XG5cdFx0dGVzdC5zdHVuID0gdGVzdC5zdHVuIHx8IGFzLnN0dW47IHJldHVybjtcblx0XHRpZih0aGlzLnRvLnRvKXtcblx0XHRcdHRoaXMudGhlLmxhc3QubmV4dCh0ZXN0KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGVzdC5zdHVuID0gYXMuc3R1bjtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIHJhbihhcyl7XG5cdGlmKGFzLmVycil7IHJhbi5lbmQoYXMuc3R1biwgYXMucm9vdCk7IHJldHVybiB9IC8vIG1vdmUgbG9nIGhhbmRsZSBoZXJlLlxuXHRpZihhcy50b2RvLmxlbmd0aCB8fCBhcy5lbmQgfHwgIU9iamVjdC5lbXB0eShhcy53YWl0KSl7IHJldHVybiB9IGFzLmVuZCA9IDE7XG5cdC8vKGFzLnJldHJ5ID0gZnVuY3Rpb24oKXsgYXMuYWNrcyA9IDA7XG5cdHZhciBjYXQgPSAoYXMuJC5iYWNrKC0xKS5fKSwgcm9vdCA9IGNhdC5yb290LCBhc2sgPSBjYXQuYXNrKGZ1bmN0aW9uKGFjayl7XG5cdFx0cm9vdC5vbignYWNrJywgYWNrKTtcblx0XHRpZihhY2suZXJyICYmICFhY2subGFjayl7IEd1bi5sb2coYWNrKSB9XG5cdFx0aWYoKythY2tzID4gKGFzLmFja3MgfHwgMCkpeyB0aGlzLm9mZigpIH0gLy8gQWRqdXN0YWJsZSBBQ0tzISBPbmx5IDEgYnkgZGVmYXVsdC5cblx0XHRpZighYXMuYWNrKXsgcmV0dXJuIH1cblx0XHRhcy5hY2soYWNrLCB0aGlzKTtcblx0fSwgYXMub3B0KSwgYWNrcyA9IDAsIHN0dW4gPSBhcy5zdHVuLCB0bXA7XG5cdCh0bXAgPSBmdW5jdGlvbigpeyAvLyB0aGlzIGlzIG5vdCBvZmZpY2lhbCB5ZXQsIGJ1dCBxdWljayBzb2x1dGlvbiB0byBoYWNrIGluIGZvciBub3cuXG5cdFx0aWYoIXN0dW4peyByZXR1cm4gfVxuXHRcdHJhbi5lbmQoc3R1biwgcm9vdCk7XG5cdFx0c2V0VGltZW91dC5lYWNoKE9iamVjdC5rZXlzKHN0dW4gPSBzdHVuLmFkZHx8JycpLCBmdW5jdGlvbihjYil7IGlmKGNiID0gc3R1bltjYl0pe2NiKCl9IH0pOyAvLyByZXN1bWUgdGhlIHN0dW5uZWQgcmVhZHMgLy8gQW55IHBlcmYgcmVhc29ucyB0byBDUFUgc2NoZWR1bGUgdGhpcyAua2V5cyggP1xuXHR9KS5oYXRjaCA9IHRtcDsgLy8gdGhpcyBpcyBub3Qgb2ZmaWNpYWwgeWV0IF5cblx0Ly9jb25zb2xlLmxvZygxLCBcIlBVVFwiLCBhcy5ydW4sIGFzLmdyYXBoKTtcblx0aWYoYXMuYWNrICYmICFhcy5vayl7IGFzLm9rID0gYXMuYWNrcyB8fCA5IH0gLy8gVE9ETzogSW4gZnV0dXJlISBSZW1vdmUgdGhpcyEgVGhpcyBpcyBqdXN0IG9sZCBBUEkgc3VwcG9ydC5cblx0KGFzLnZpYS5fKS5vbignb3V0Jywge3B1dDogYXMub3V0ID0gYXMuZ3JhcGgsIG9rOiBhcy5vayAmJiB7J0AnOiBhcy5vaysxfSwgb3B0OiBhcy5vcHQsICcjJzogYXNrLCBfOiB0bXB9KTtcblx0Ly99KSgpO1xufTsgcmFuLmVuZCA9IGZ1bmN0aW9uKHN0dW4scm9vdCl7XG5cdHN0dW4uZW5kID0gbm9vcDsgLy8gbGlrZSB3aXRoIHRoZSBlYXJsaWVyIGlkLCBjaGVhcGVyIHRvIG1ha2UgdGhpcyBmbGFnIGEgZnVuY3Rpb24gc28gYmVsb3cgY2FsbGJhY2tzIGRvIG5vdCBoYXZlIHRvIGRvIGFuIGV4dHJhIHR5cGUgY2hlY2suXG5cdGlmKHN0dW4udGhlLnRvID09PSBzdHVuICYmIHN0dW4gPT09IHN0dW4udGhlLmxhc3QpeyBkZWxldGUgcm9vdC5zdHVuIH1cblx0c3R1bi5vZmYoKTtcbn07IHJhbi5lcnIgPSBmdW5jdGlvbihhcywgZXJyKXtcblx0KGFzLmFja3x8bm9vcCkuY2FsbChhcywgYXMub3V0ID0geyBlcnI6IGFzLmVyciA9IEd1bi5sb2coZXJyKSB9KTtcblx0YXMucmFuKGFzKTtcbn1cblxuZnVuY3Rpb24gZ2V0KGFzKXtcblx0dmFyIGF0ID0gYXMudmlhLl8sIHRtcDtcblx0YXMudmlhID0gYXMudmlhLmJhY2soZnVuY3Rpb24oYXQpe1xuXHRcdGlmKGF0LnNvdWwgfHwgIWF0LmdldCl7IHJldHVybiBhdC4kIH1cblx0XHR0bXAgPSBhcy5kYXRhOyAoYXMuZGF0YSA9IHt9KVthdC5nZXRdID0gdG1wO1xuXHR9KTtcblx0aWYoIWFzLnZpYSB8fCAhYXMudmlhLl8uc291bCl7XG5cdFx0YXMudmlhID0gYXQucm9vdC4kLmdldCgoKGFzLmRhdGF8fCcnKS5ffHwnJylbJyMnXSB8fCBhdC4kLmJhY2soJ29wdC51dWlkJykoKSlcblx0fVxuXHRhcy52aWEucHV0KGFzLmRhdGEsIGFzLmFjaywgYXMpO1xuXHRcblxuXHRyZXR1cm47XG5cdGlmKGF0LmdldCAmJiBhdC5iYWNrLnNvdWwpe1xuXHRcdHRtcCA9IGFzLmRhdGE7XG5cdFx0YXMudmlhID0gYXQuYmFjay4kO1xuXHRcdChhcy5kYXRhID0ge30pW2F0LmdldF0gPSB0bXA7IFxuXHRcdGFzLnZpYS5wdXQoYXMuZGF0YSwgYXMuYWNrLCBhcyk7XG5cdFx0cmV0dXJuO1xuXHR9XG59XG5mdW5jdGlvbiBjaGVjayhkLCB0bXApeyByZXR1cm4gKChkICYmICh0bXAgPSBkLmNvbnN0cnVjdG9yKSAmJiB0bXAubmFtZSkgfHwgdHlwZW9mIGQpIH1cblxudmFyIHUsIGVtcHR5ID0ge30sIG5vb3AgPSBmdW5jdGlvbigpe30sIHR1cm4gPSBzZXRUaW1lb3V0LnR1cm4sIHZhbGlkID0gR3VuLnZhbGlkLCBzdGF0ZV9pZnkgPSBHdW4uc3RhdGUuaWZ5O1xudmFyIGlpZmUgPSBmdW5jdGlvbihmbixhcyl7Zm4uY2FsbChhc3x8ZW1wdHkpfVxuXHQiLCJcblxuZnVuY3Rpb24gR3VuKG8pe1xuXHRpZihvIGluc3RhbmNlb2YgR3VuKXsgcmV0dXJuICh0aGlzLl8gPSB7JDogdGhpc30pLiQgfVxuXHRpZighKHRoaXMgaW5zdGFuY2VvZiBHdW4pKXsgcmV0dXJuIG5ldyBHdW4obykgfVxuXHRyZXR1cm4gR3VuLmNyZWF0ZSh0aGlzLl8gPSB7JDogdGhpcywgb3B0OiBvfSk7XG59XG5cbkd1bi5pcyA9IGZ1bmN0aW9uKCQpeyByZXR1cm4gKCQgaW5zdGFuY2VvZiBHdW4pIHx8ICgkICYmICQuXyAmJiAoJCA9PT0gJC5fLiQpKSB8fCBmYWxzZSB9XG5cbkd1bi52ZXJzaW9uID0gMC4yMDIwO1xuXG5HdW4uY2hhaW4gPSBHdW4ucHJvdG90eXBlO1xuR3VuLmNoYWluLnRvSlNPTiA9IGZ1bmN0aW9uKCl7fTtcblxucmVxdWlyZSgnLi9zaGltJyk7XG5HdW4udmFsaWQgPSByZXF1aXJlKCcuL3ZhbGlkJyk7XG5HdW4uc3RhdGUgPSByZXF1aXJlKCcuL3N0YXRlJyk7XG5HdW4ub24gPSByZXF1aXJlKCcuL29udG8nKTtcbkd1bi5kdXAgPSByZXF1aXJlKCcuL2R1cCcpO1xuR3VuLmFzayA9IHJlcXVpcmUoJy4vYXNrJyk7XG5cbjsoZnVuY3Rpb24oKXtcblx0R3VuLmNyZWF0ZSA9IGZ1bmN0aW9uKGF0KXtcblx0XHRhdC5yb290ID0gYXQucm9vdCB8fCBhdDtcblx0XHRhdC5ncmFwaCA9IGF0LmdyYXBoIHx8IHt9O1xuXHRcdGF0Lm9uID0gYXQub24gfHwgR3VuLm9uO1xuXHRcdGF0LmFzayA9IGF0LmFzayB8fCBHdW4uYXNrO1xuXHRcdGF0LmR1cCA9IGF0LmR1cCB8fCBHdW4uZHVwKCk7XG5cdFx0dmFyIGd1biA9IGF0LiQub3B0KGF0Lm9wdCk7XG5cdFx0aWYoIWF0Lm9uY2Upe1xuXHRcdFx0YXQub24oJ2luJywgdW5pdmVyc2UsIGF0KTtcblx0XHRcdGF0Lm9uKCdvdXQnLCB1bml2ZXJzZSwgYXQpO1xuXHRcdFx0YXQub24oJ3B1dCcsIG1hcCwgYXQpO1xuXHRcdFx0R3VuLm9uKCdjcmVhdGUnLCBhdCk7XG5cdFx0XHRhdC5vbignY3JlYXRlJywgYXQpO1xuXHRcdH1cblx0XHRhdC5vbmNlID0gMTtcblx0XHRyZXR1cm4gZ3VuO1xuXHR9XG5cdGZ1bmN0aW9uIHVuaXZlcnNlKG1zZyl7XG5cdFx0Ly8gVE9ETzogQlVHISBtc2cub3V0ID0gbnVsbCBiZWluZyBzZXQhXG5cdFx0Ly9pZighRil7IHZhciBldmUgPSB0aGlzOyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHVuaXZlcnNlLmNhbGwoZXZlLCBtc2csMSkgfSxNYXRoLnJhbmRvbSgpICogMTAwKTtyZXR1cm47IH0gLy8gQUREIEYgVE8gUEFSQU1TIVxuXHRcdGlmKCFtc2cpeyByZXR1cm4gfVxuXHRcdGlmKG1zZy5vdXQgPT09IHVuaXZlcnNlKXsgdGhpcy50by5uZXh0KG1zZyk7IHJldHVybiB9XG5cdFx0dmFyIGV2ZSA9IHRoaXMsIGFzID0gZXZlLmFzLCBhdCA9IGFzLmF0IHx8IGFzLCBndW4gPSBhdC4kLCBkdXAgPSBhdC5kdXAsIHRtcCwgREJHID0gbXNnLkRCRztcblx0XHQodG1wID0gbXNnWycjJ10pIHx8ICh0bXAgPSBtc2dbJyMnXSA9IHRleHRfcmFuZCg5KSk7XG5cdFx0aWYoZHVwLmNoZWNrKHRtcCkpeyByZXR1cm4gfSBkdXAudHJhY2sodG1wKTtcblx0XHR0bXAgPSBtc2cuXzsgbXNnLl8gPSAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdG1wKT8gdG1wIDogZnVuY3Rpb24oKXt9O1xuXHRcdChtc2cuJCAmJiAobXNnLiQgPT09IChtc2cuJC5ffHwnJykuJCkpIHx8IChtc2cuJCA9IGd1bik7XG5cdFx0aWYobXNnWydAJ10gJiYgIW1zZy5wdXQpeyBhY2sobXNnKSB9XG5cdFx0aWYoIWF0LmFzayhtc2dbJ0AnXSwgbXNnKSl7IC8vIGlzIHRoaXMgbWFjaGluZSBsaXN0ZW5pbmcgZm9yIGFuIGFjaz9cblx0XHRcdERCRyAmJiAoREJHLnUgPSArbmV3IERhdGUpO1xuXHRcdFx0aWYobXNnLnB1dCl7IHB1dChtc2cpOyByZXR1cm4gfSBlbHNlXG5cdFx0XHRpZihtc2cuZ2V0KXsgR3VuLm9uLmdldChtc2csIGd1bikgfVxuXHRcdH1cblx0XHREQkcgJiYgKERCRy51YyA9ICtuZXcgRGF0ZSk7XG5cdFx0ZXZlLnRvLm5leHQobXNnKTtcblx0XHREQkcgJiYgKERCRy51YSA9ICtuZXcgRGF0ZSk7XG5cdFx0aWYobXNnLm50cyB8fCBtc2cuTlRTKXsgcmV0dXJuIH0gLy8gVE9ETzogVGhpcyBzaG91bGRuJ3QgYmUgaW4gY29yZSwgYnV0IGZhc3Qgd2F5IHRvIHByZXZlbnQgTlRTIHNwcmVhZC4gRGVsZXRlIHRoaXMgbGluZSBhZnRlciBhbGwgcGVlcnMgaGF2ZSB1cGdyYWRlZCB0byBuZXdlciB2ZXJzaW9ucy5cblx0XHRtc2cub3V0ID0gdW5pdmVyc2U7IGF0Lm9uKCdvdXQnLCBtc2cpO1xuXHRcdERCRyAmJiAoREJHLnVlID0gK25ldyBEYXRlKTtcblx0fVxuXHRmdW5jdGlvbiBwdXQobXNnKXtcblx0XHRpZighbXNnKXsgcmV0dXJuIH1cblx0XHR2YXIgY3R4ID0gbXNnLl98fCcnLCByb290ID0gY3R4LnJvb3QgPSAoKGN0eC4kID0gbXNnLiR8fCcnKS5ffHwnJykucm9vdDtcblx0XHRpZihtc2dbJ0AnXSAmJiBjdHguZmFpdGggJiYgIWN0eC5taXNzKXsgLy8gVE9ETzogQVhFIG1heSBzcGxpdC9yb3V0ZSBiYXNlZCBvbiAncHV0JyB3aGF0IHNob3VsZCB3ZSBkbyBoZXJlPyBEZXRlY3QgQCBpbiBBWEU/IEkgdGhpbmsgd2UgZG9uJ3QgaGF2ZSB0byB3b3JyeSwgYXMgREFNIHdpbGwgcm91dGUgaXQgb24gQC5cblx0XHRcdG1zZy5vdXQgPSB1bml2ZXJzZTtcblx0XHRcdHJvb3Qub24oJ291dCcsIG1zZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGN0eC5sYXRjaCA9IHJvb3QuaGF0Y2g7IGN0eC5tYXRjaCA9IHJvb3QuaGF0Y2ggPSBbXTtcblx0XHR2YXIgcHV0ID0gbXNnLnB1dDtcblx0XHR2YXIgREJHID0gY3R4LkRCRyA9IG1zZy5EQkcsIFMgPSArbmV3IERhdGU7IENUID0gQ1QgfHwgUztcblx0XHRpZihwdXRbJyMnXSAmJiBwdXRbJy4nXSl7IC8qcm9vdCAmJiByb290Lm9uKCdwdXQnLCBtc2cpOyovIHJldHVybiB9IC8vIFRPRE86IEJVRyEgVGhpcyBuZWVkcyB0byBjYWxsIEhBTSBpbnN0ZWFkLlxuXHRcdERCRyAmJiAoREJHLnAgPSBTKTtcblx0XHRjdHhbJyMnXSA9IG1zZ1snIyddO1xuXHRcdGN0eC5tc2cgPSBtc2c7XG5cdFx0Y3R4LmFsbCA9IDA7XG5cdFx0Y3R4LnN0dW4gPSAxO1xuXHRcdHZhciBubCA9IE9iamVjdC5rZXlzKHB1dCk7Ly8uc29ydCgpOyAvLyBUT0RPOiBUaGlzIGlzIHVuYm91bmRlZCBvcGVyYXRpb24sIGxhcmdlIGdyYXBocyB3aWxsIGJlIHNsb3dlci4gV3JpdGUgb3VyIG93biBDUFUgc2NoZWR1bGVkIHNvcnQ/IE9yIHNvbWVob3cgZG8gaXQgaW4gYmVsb3c/IEtleXMgaXRzZWxmIGlzIG5vdCBPKDEpIGVpdGhlciwgY3JlYXRlIEVTNSBzaGltIG92ZXIgP3dlYWsgbWFwPyBvciBjdXN0b20gd2hpY2ggaXMgY29uc3RhbnQuXG5cdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8Y3R4KS5wayA9ICtuZXcgRGF0ZSkgLSBTLCAncHV0IHNvcnQnKTtcblx0XHR2YXIgbmkgPSAwLCBuaiwga2wsIHNvdWwsIG5vZGUsIHN0YXRlcywgZXJyLCB0bXA7XG5cdFx0KGZ1bmN0aW9uIHBvcChvKXtcblx0XHRcdGlmKG5qICE9IG5pKXsgbmogPSBuaTtcblx0XHRcdFx0aWYoIShzb3VsID0gbmxbbmldKSl7XG5cdFx0XHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8Y3R4KS5wZCA9ICtuZXcgRGF0ZSkgLSBTLCAncHV0Jyk7XG5cdFx0XHRcdFx0ZmlyZShjdHgpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZighKG5vZGUgPSBwdXRbc291bF0pKXsgZXJyID0gRVJSK2N1dChzb3VsKStcIm5vIG5vZGUuXCIgfSBlbHNlXG5cdFx0XHRcdGlmKCEodG1wID0gbm9kZS5fKSl7IGVyciA9IEVSUitjdXQoc291bCkrXCJubyBtZXRhLlwiIH0gZWxzZVxuXHRcdFx0XHRpZihzb3VsICE9PSB0bXBbJyMnXSl7IGVyciA9IEVSUitjdXQoc291bCkrXCJzb3VsIG5vdCBzYW1lLlwiIH0gZWxzZVxuXHRcdFx0XHRpZighKHN0YXRlcyA9IHRtcFsnPiddKSl7IGVyciA9IEVSUitjdXQoc291bCkrXCJubyBzdGF0ZS5cIiB9XG5cdFx0XHRcdGtsID0gT2JqZWN0LmtleXMobm9kZXx8e30pOyAvLyBUT0RPOiAua2V5cyggaXMgc2xvd1xuXHRcdFx0fVxuXHRcdFx0aWYoZXJyKXtcblx0XHRcdFx0bXNnLmVyciA9IGN0eC5lcnIgPSBlcnI7IC8vIGludmFsaWQgZGF0YSBzaG91bGQgZXJyb3IgYW5kIHN0dW4gdGhlIG1lc3NhZ2UuXG5cdFx0XHRcdGZpcmUoY3R4KTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImhhbmRsZSBlcnJvciFcIiwgZXJyKSAvLyBoYW5kbGUhXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBpID0gMCwga2V5OyBvID0gbyB8fCAwO1xuXHRcdFx0d2hpbGUobysrIDwgOSAmJiAoa2V5ID0ga2xbaSsrXSkpe1xuXHRcdFx0XHRpZignXycgPT09IGtleSl7IGNvbnRpbnVlIH1cblx0XHRcdFx0dmFyIHZhbCA9IG5vZGVba2V5XSwgc3RhdGUgPSBzdGF0ZXNba2V5XTtcblx0XHRcdFx0aWYodSA9PT0gc3RhdGUpeyBlcnIgPSBFUlIrY3V0KGtleSkrXCJvblwiK2N1dChzb3VsKStcIm5vIHN0YXRlLlwiOyBicmVhayB9XG5cdFx0XHRcdGlmKCF2YWxpZCh2YWwpKXsgZXJyID0gRVJSK2N1dChrZXkpK1wib25cIitjdXQoc291bCkrXCJiYWQgXCIrKHR5cGVvZiB2YWwpK2N1dCh2YWwpOyBicmVhayB9XG5cdFx0XHRcdC8vY3R4LmFsbCsrOyAvL2N0eC5hY2tbc291bCtrZXldID0gJyc7XG5cdFx0XHRcdGhhbSh2YWwsIGtleSwgc291bCwgc3RhdGUsIG1zZyk7XG5cdFx0XHRcdCsrQzsgLy8gY291cnRlc3kgY291bnQ7XG5cdFx0XHR9XG5cdFx0XHRpZigoa2wgPSBrbC5zbGljZShpKSkubGVuZ3RoKXsgdHVybihwb3ApOyByZXR1cm4gfVxuXHRcdFx0KytuaTsga2wgPSBudWxsOyBwb3Aobyk7XG5cdFx0fSgpKTtcblx0fSBHdW4ub24ucHV0ID0gcHV0O1xuXHQvLyBUT0RPOiBNQVJLISEhIGNsb2NrIGJlbG93LCByZWNvbm5lY3Qgc3luYywgU0VBIGNlcnRpZnkgd2lyZSBtZXJnZSwgVXNlci5hdXRoIHRha2luZyBtdWx0aXBsZSB0aW1lcywgLy8gbXNnIHB1dCwgcHV0LCBzYXkgYWNrLCBoZWFyIGxvb3AuLi5cblx0Ly8gV0FTSVMgQlVHISBsb2NhbCBwZWVyIG5vdCBhY2suIC5vZmYgb3RoZXIgcGVvcGxlOiAub3BlblxuXHRmdW5jdGlvbiBoYW0odmFsLCBrZXksIHNvdWwsIHN0YXRlLCBtc2cpe1xuXHRcdHZhciBjdHggPSBtc2cuX3x8JycsIHJvb3QgPSBjdHgucm9vdCwgZ3JhcGggPSByb290LmdyYXBoLCBsb3QsIHRtcDtcblx0XHR2YXIgdmVydGV4ID0gZ3JhcGhbc291bF0gfHwgZW1wdHksIHdhcyA9IHN0YXRlX2lzKHZlcnRleCwga2V5LCAxKSwga25vd24gPSB2ZXJ0ZXhba2V5XTtcblx0XHRcblx0XHR2YXIgREJHID0gY3R4LkRCRzsgaWYodG1wID0gY29uc29sZS5TVEFUKXsgaWYoIWdyYXBoW3NvdWxdIHx8ICFrbm93bil7IHRtcC5oYXMgPSAodG1wLmhhcyB8fCAwKSArIDEgfSB9XG5cblx0XHR2YXIgbm93ID0gU3RhdGUoKSwgdTtcblx0XHRpZihzdGF0ZSA+IG5vdyl7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGhhbSh2YWwsIGtleSwgc291bCwgc3RhdGUsIG1zZykgfSwgKHRtcCA9IHN0YXRlIC0gbm93KSA+IE1EPyBNRCA6IHRtcCk7IC8vIE1heCBEZWZlciAzMmJpdC4gOihcblx0XHRcdGNvbnNvbGUuU1RBVCAmJiBjb25zb2xlLlNUQVQoKChEQkd8fGN0eCkuSGYgPSArbmV3IERhdGUpLCB0bXAsICdmdXR1cmUnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYoc3RhdGUgPCB3YXMpeyAvKm9sZDsqLyBpZighY3R4Lm1pc3MpeyByZXR1cm4gfSB9IC8vIGJ1dCBzb21lIGNoYWlucyBoYXZlIGEgY2FjaGUgbWlzcyB0aGF0IG5lZWQgdG8gcmUtZmlyZS4gLy8gVE9ETzogSW1wcm92ZSBpbiBmdXR1cmUuIC8vIGZvciBBWEUgdGhpcyB3b3VsZCByZWR1Y2UgcmVicm9hZGNhc3QsIGJ1dCBHVU4gZG9lcyBpdCBvbiBtZXNzYWdlIGZvcndhcmRpbmcuXG5cdFx0aWYoIWN0eC5mYWl0aCl7IC8vIFRPRE86IEJVRz8gQ2FuIHRoaXMgYmUgdXNlZCBmb3IgY2FjaGUgbWlzcyBhcyB3ZWxsPyAvLyBZZXMgdGhpcyB3YXMgYSBidWcsIG5lZWQgdG8gY2hlY2sgY2FjaGUgbWlzcyBmb3IgUkFEIHRlc3RzLCBidXQgc2hvdWxkIHdlIGNhcmUgYWJvdXQgdGhlIGZhaXRoIGNoZWNrIG5vdz8gUHJvYmFibHkgbm90LlxuXHRcdFx0aWYoc3RhdGUgPT09IHdhcyAmJiAodmFsID09PSBrbm93biB8fCBMKHZhbCkgPD0gTChrbm93bikpKXsgLypjb25zb2xlLmxvZyhcInNhbWVcIik7Ki8gLypzYW1lOyovIGlmKCFjdHgubWlzcyl7IHJldHVybiB9IH0gLy8gc2FtZVxuXHRcdH1cblx0XHRjdHguc3R1bisrOyAvLyBUT0RPOiAnZm9yZ2V0JyBmZWF0dXJlIGluIFNFQSB0aWVkIHRvIHRoaXMsIGJhZCBhcHByb2FjaCwgYnV0IGhhY2tlZCBpbiBmb3Igbm93LiBBbnkgY2hhbmdlcyBoZXJlIG11c3QgdXBkYXRlIHRoZXJlLlxuXHRcdHZhciBhaWQgPSBtc2dbJyMnXStjdHguYWxsKyssIGlkID0ge3RvU3RyaW5nOiBmdW5jdGlvbigpeyByZXR1cm4gYWlkIH0sIF86IGN0eH07IGlkLnRvSlNPTiA9IGlkLnRvU3RyaW5nOyAvLyB0aGlzICp0cmljayogbWFrZXMgaXQgY29tcGF0aWJsZSBiZXR3ZWVuIG9sZCAmIG5ldyB2ZXJzaW9ucy5cblx0XHRyb290LmR1cC50cmFjayhpZClbJyMnXSA9IG1zZ1snIyddOyAvLyBmaXhlcyBuZXcgT0sgYWNrcyBmb3IgUlBDIGxpa2UgUlRDLlxuXHRcdERCRyAmJiAoREJHLnBoID0gREJHLnBoIHx8ICtuZXcgRGF0ZSk7XG5cdFx0cm9vdC5vbigncHV0JywgeycjJzogaWQsICdAJzogbXNnWydAJ10sIHB1dDogeycjJzogc291bCwgJy4nOiBrZXksICc6JzogdmFsLCAnPic6IHN0YXRlfSwgb2s6IG1zZy5vaywgXzogY3R4fSk7XG5cdH1cblx0ZnVuY3Rpb24gbWFwKG1zZyl7XG5cdFx0dmFyIERCRzsgaWYoREJHID0gKG1zZy5ffHwnJykuREJHKXsgREJHLnBhID0gK25ldyBEYXRlOyBEQkcucG0gPSBEQkcucG0gfHwgK25ldyBEYXRlfVxuICAgICAgXHR2YXIgZXZlID0gdGhpcywgcm9vdCA9IGV2ZS5hcywgZ3JhcGggPSByb290LmdyYXBoLCBjdHggPSBtc2cuXywgcHV0ID0gbXNnLnB1dCwgc291bCA9IHB1dFsnIyddLCBrZXkgPSBwdXRbJy4nXSwgdmFsID0gcHV0Wyc6J10sIHN0YXRlID0gcHV0Wyc+J10sIGlkID0gbXNnWycjJ10sIHRtcDtcbiAgICAgIFx0aWYoKHRtcCA9IGN0eC5tc2cpICYmICh0bXAgPSB0bXAucHV0KSAmJiAodG1wID0gdG1wW3NvdWxdKSl7IHN0YXRlX2lmeSh0bXAsIGtleSwgc3RhdGUsIHZhbCwgc291bCkgfSAvLyBuZWNlc3NhcnkhIG9yIGVsc2Ugb3V0IG1lc3NhZ2VzIGRvIG5vdCBnZXQgU0VBIHRyYW5zZm9ybXMuXG5cdFx0Z3JhcGhbc291bF0gPSBzdGF0ZV9pZnkoZ3JhcGhbc291bF0sIGtleSwgc3RhdGUsIHZhbCwgc291bCk7XG5cdFx0aWYodG1wID0gKHJvb3QubmV4dHx8JycpW3NvdWxdKXsgdG1wLm9uKCdpbicsIG1zZykgfVxuXHRcdGZpcmUoY3R4KTtcblx0XHRldmUudG8ubmV4dChtc2cpO1xuXHR9XG5cdGZ1bmN0aW9uIGZpcmUoY3R4LCBtc2cpeyB2YXIgcm9vdDtcblx0XHRpZihjdHguc3RvcCl7IHJldHVybiB9XG5cdFx0aWYoIWN0eC5lcnIgJiYgMCA8IC0tY3R4LnN0dW4peyByZXR1cm4gfSAvLyBUT0RPOiAnZm9yZ2V0JyBmZWF0dXJlIGluIFNFQSB0aWVkIHRvIHRoaXMsIGJhZCBhcHByb2FjaCwgYnV0IGhhY2tlZCBpbiBmb3Igbm93LiBBbnkgY2hhbmdlcyBoZXJlIG11c3QgdXBkYXRlIHRoZXJlLlxuXHRcdGN0eC5zdG9wID0gMTtcblx0XHRpZighKHJvb3QgPSBjdHgucm9vdCkpeyByZXR1cm4gfVxuXHRcdHZhciB0bXAgPSBjdHgubWF0Y2g7IHRtcC5lbmQgPSAxO1xuXHRcdGlmKHRtcCA9PT0gcm9vdC5oYXRjaCl7IGlmKCEodG1wID0gY3R4LmxhdGNoKSB8fCB0bXAuZW5kKXsgZGVsZXRlIHJvb3QuaGF0Y2ggfSBlbHNlIHsgcm9vdC5oYXRjaCA9IHRtcCB9IH1cblx0XHRjdHguaGF0Y2ggJiYgY3R4LmhhdGNoKCk7IC8vIFRPRE86IHJlbmFtZS9yZXdvcmsgaG93IHB1dCAmIHRoaXMgaW50ZXJhY3QuXG5cdFx0c2V0VGltZW91dC5lYWNoKGN0eC5tYXRjaCwgZnVuY3Rpb24oY2Ipe2NiICYmIGNiKCl9KTsgXG5cdFx0aWYoIShtc2cgPSBjdHgubXNnKSB8fCBjdHguZXJyIHx8IG1zZy5lcnIpeyByZXR1cm4gfVxuXHRcdG1zZy5vdXQgPSB1bml2ZXJzZTtcblx0XHRjdHgucm9vdC5vbignb3V0JywgbXNnKTtcblxuXHRcdENGKCk7IC8vIGNvdXJ0ZXN5IGNoZWNrO1xuXHR9XG5cdGZ1bmN0aW9uIGFjayhtc2cpeyAvLyBhZ2dyZWdhdGUgQUNLcy5cblx0XHR2YXIgaWQgPSBtc2dbJ0AnXSB8fCAnJywgY3R4LCBvaywgdG1wO1xuXHRcdGlmKCEoY3R4ID0gaWQuXykpe1xuXHRcdFx0dmFyIGR1cCA9IChkdXAgPSBtc2cuJCkgJiYgKGR1cCA9IGR1cC5fKSAmJiAoZHVwID0gZHVwLnJvb3QpICYmIChkdXAgPSBkdXAuZHVwKTtcblx0XHRcdGlmKCEoZHVwID0gZHVwLmNoZWNrKGlkKSkpeyByZXR1cm4gfVxuXHRcdFx0bXNnWydAJ10gPSBkdXBbJyMnXSB8fCBtc2dbJ0AnXTsgLy8gVGhpcyBkb2Vzbid0IGRvIGFueXRoaW5nIGFueW1vcmUsIGJhY2t0cmFjayBpdCB0byBzb21ldGhpbmcgZWxzZT9cblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y3R4LmFja3MgPSAoY3R4LmFja3N8fDApICsgMTtcblx0XHRpZihjdHguZXJyID0gbXNnLmVycil7XG5cdFx0XHRtc2dbJ0AnXSA9IGN0eFsnIyddO1xuXHRcdFx0ZmlyZShjdHgpOyAvLyBUT0RPOiBCVUc/IEhvdyBpdCBza2lwcy9zdG9wcyBwcm9wYWdhdGlvbiBvZiBtc2cgaWYgYW55IDEgaXRlbSBpcyBlcnJvciwgdGhpcyB3b3VsZCBhc3N1bWUgYSB3aG9sZSBiYXRjaC9yZXN5bmMgaGFzIHNhbWUgbWFsaWNpb3VzIGludGVudC5cblx0XHR9XG5cdFx0Y3R4Lm9rID0gbXNnLm9rIHx8IGN0eC5vaztcblx0XHRpZighY3R4LnN0b3AgJiYgIWN0eC5jcmFjayl7IGN0eC5jcmFjayA9IGN0eC5tYXRjaCAmJiBjdHgubWF0Y2gucHVzaChmdW5jdGlvbigpe2JhY2soY3R4KX0pIH0gLy8gaGFuZGxlIHN5bmNocm9ub3VzIGFja3MuIE5PVEU6IElmIGEgc3RvcmFnZSBwZWVyIEFDS3Mgc3luY2hyb25vdXNseSB0aGVuIHRoZSBQVVQgbG9vcCBoYXMgbm90IGV2ZW4gY291bnRlZCB1cCBob3cgbWFueSBpdGVtcyBuZWVkIHRvIGJlIHByb2Nlc3NlZCwgc28gY3R4LlNUT1AgZmxhZ3MgdGhpcyBhbmQgYWRkcyBvbmx5IDEgY2FsbGJhY2sgdG8gdGhlIGVuZCBvZiB0aGUgUFVUIGxvb3AuXG5cdFx0YmFjayhjdHgpO1xuXHR9XG5cdGZ1bmN0aW9uIGJhY2soY3R4KXtcblx0XHRpZighY3R4IHx8ICFjdHgucm9vdCl7IHJldHVybiB9XG5cdFx0aWYoY3R4LnN0dW4gfHwgY3R4LmFja3MgIT09IGN0eC5hbGwpeyByZXR1cm4gfVxuXHRcdGN0eC5yb290Lm9uKCdpbicsIHsnQCc6IGN0eFsnIyddLCBlcnI6IGN0eC5lcnIsIG9rOiBjdHguZXJyPyB1IDogY3R4Lm9rIHx8IHsnJzoxfX0pO1xuXHR9XG5cblx0dmFyIEVSUiA9IFwiRXJyb3I6IEludmFsaWQgZ3JhcGghXCI7XG5cdHZhciBjdXQgPSBmdW5jdGlvbihzKXsgcmV0dXJuIFwiICdcIisoJycrcykuc2xpY2UoMCw5KStcIi4uLicgXCIgfVxuXHR2YXIgTCA9IEpTT04uc3RyaW5naWZ5LCBNRCA9IDIxNDc0ODM2NDcsIFN0YXRlID0gR3VuLnN0YXRlO1xuXHR2YXIgQyA9IDAsIENULCBDRiA9IGZ1bmN0aW9uKCl7aWYoQz45OTkgJiYgKEMvLShDVCAtIChDVCA9ICtuZXcgRGF0ZSkpPjEpKXtHdW4ud2luZG93ICYmIGNvbnNvbGUubG9nKFwiV2FybmluZzogWW91J3JlIHN5bmNpbmcgMUsrIHJlY29yZHMgYSBzZWNvbmQsIGZhc3RlciB0aGFuIERPTSBjYW4gdXBkYXRlIC0gY29uc2lkZXIgbGltaXRpbmcgcXVlcnkuXCIpO0NGPWZ1bmN0aW9uKCl7Qz0wfX19O1xuXG59KCkpO1xuXG47KGZ1bmN0aW9uKCl7XG5cdEd1bi5vbi5nZXQgPSBmdW5jdGlvbihtc2csIGd1bil7XG5cdFx0dmFyIHJvb3QgPSBndW4uXywgZ2V0ID0gbXNnLmdldCwgc291bCA9IGdldFsnIyddLCBub2RlID0gcm9vdC5ncmFwaFtzb3VsXSwgaGFzID0gZ2V0WycuJ107XG5cdFx0dmFyIG5leHQgPSByb290Lm5leHQgfHwgKHJvb3QubmV4dCA9IHt9KSwgYXQgPSBuZXh0W3NvdWxdO1xuXHRcdC8vIHF1ZXVlIGNvbmN1cnJlbnQgR0VUcz9cblx0XHQvLyBUT0RPOiBjb25zaWRlciB0YWdnaW5nIG9yaWdpbmFsIG1lc3NhZ2UgaW50byBkdXAgZm9yIERBTS5cblx0XHQvLyBUT0RPOiBeIGFib3ZlPyBJbiBjaGF0IGFwcCwgMTIgbWVzc2FnZXMgcmVzdWx0ZWQgaW4gc2FtZSBwZWVyIGFza2luZyBmb3IgYCN1c2VyLnB1YmAgMTIgdGltZXMuIChzYW1lIHdpdGggI3VzZXIgR0VUIHRvbywgeWlwZXMhKSAvLyBEQU0gbm90ZTogVGhpcyBhbHNvIHJlc3VsdGVkIGluIDEyIHJlcGxpZXMgZnJvbSAxIHBlZXIgd2hpY2ggYWxsIGhhZCBzYW1lICMjaGFzaCBidXQgbm9uZSBvZiB0aGVtIGRlZHVwZWQgYmVjYXVzZSBlYWNoIGdldCB3YXMgZGlmZmVyZW50LlxuXHRcdC8vIFRPRE86IE1vdmluZyBxdWljayBoYWNrcyBmaXhpbmcgdGhlc2UgdGhpbmdzIHRvIGF4ZSBmb3Igbm93LlxuXHRcdC8vIFRPRE86IGEgbG90IG9mIEdFVCAjZm9vIHRoZW4gR0VUICNmb28uXCJcIiBoYXBwZW5pbmcsIHdoeT9cblx0XHQvLyBUT0RPOiBEQU0ncyAjIyBoYXNoIGNoZWNrLCBvbiBzYW1lIGdldCBBQ0ssIHByb2R1Y2luZyBtdWx0aXBsZSByZXBsaWVzIHN0aWxsLCBtYXliZSBKU09OIHZzIFlTT04/XG5cdFx0Ly8gVE1QIG5vdGUgZm9yIG5vdzogdmlNWnExc2xHIHdhcyBjaGF0IExFWCBxdWVyeSAjLlxuXHRcdC8qaWYoZ3VuICE9PSAodG1wID0gbXNnLiQpICYmICh0bXAgPSAodG1wfHwnJykuXykpe1xuXHRcdFx0aWYodG1wLlEpeyB0bXAuUVttc2dbJyMnXV0gPSAnJzsgcmV0dXJuIH0gLy8gY2hhaW4gZG9lcyBub3QgbmVlZCB0byBhc2sgZm9yIGl0IGFnYWluLlxuXHRcdFx0dG1wLlEgPSB7fTtcblx0XHR9Ki9cblx0XHQvKmlmKHUgPT09IGhhcyl7XG5cdFx0XHRpZihhdC5RKXtcblx0XHRcdFx0Ly9hdC5RW21zZ1snIyddXSA9ICcnO1xuXHRcdFx0XHQvL3JldHVybjtcblx0XHRcdH1cblx0XHRcdGF0LlEgPSB7fTtcblx0XHR9Ki9cblx0XHR2YXIgY3R4ID0gbXNnLl98fHt9LCBEQkcgPSBjdHguREJHID0gbXNnLkRCRztcblx0XHREQkcgJiYgKERCRy5nID0gK25ldyBEYXRlKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiR0VUOlwiLCBnZXQsIG5vZGUsIGhhcyk7XG5cdFx0aWYoIW5vZGUpeyByZXR1cm4gcm9vdC5vbignZ2V0JywgbXNnKSB9XG5cdFx0aWYoaGFzKXtcblx0XHRcdGlmKCdzdHJpbmcnICE9IHR5cGVvZiBoYXMgfHwgdSA9PT0gbm9kZVtoYXNdKXsgcmV0dXJuIHJvb3Qub24oJ2dldCcsIG1zZykgfVxuXHRcdFx0bm9kZSA9IHN0YXRlX2lmeSh7fSwgaGFzLCBzdGF0ZV9pcyhub2RlLCBoYXMpLCBub2RlW2hhc10sIHNvdWwpO1xuXHRcdFx0Ly8gSWYgd2UgaGF2ZSBhIGtleSBpbi1tZW1vcnksIGRvIHdlIHJlYWxseSBuZWVkIHRvIGZldGNoP1xuXHRcdFx0Ly8gTWF5YmUuLi4gaW4gY2FzZSB0aGUgaW4tbWVtb3J5IGtleSB3ZSBoYXZlIGlzIGEgbG9jYWwgd3JpdGVcblx0XHRcdC8vIHdlIHN0aWxsIG5lZWQgdG8gdHJpZ2dlciBhIHB1bGwvbWVyZ2UgZnJvbSBwZWVycy5cblx0XHR9XG5cdFx0Ly9HdW4ud2luZG93PyBHdW4ub2JqLmNvcHkobm9kZSkgOiBub2RlOyAvLyBITlBFUkY6IElmICFicm93c2VyIGJ1bXAgUGVyZm9ybWFuY2U/IElzIHRoaXMgdG9vIGRhbmdlcm91cyB0byByZWZlcmVuY2Ugcm9vdCBncmFwaD8gQ29weSAvIHNoYWxsb3cgY29weSB0b28gZXhwZW5zaXZlIGZvciBiaWcgbm9kZXMuIEd1bi5vYmoudG8obm9kZSk7IC8vIDEgbGF5ZXIgZGVlcCBjb3B5IC8vIEd1bi5vYmouY29weShub2RlKTsgLy8gdG9vIHNsb3cgb24gYmlnIG5vZGVzXG5cdFx0bm9kZSAmJiBhY2sobXNnLCBub2RlKTtcblx0XHRyb290Lm9uKCdnZXQnLCBtc2cpOyAvLyBzZW5kIEdFVCB0byBzdG9yYWdlIGFkYXB0ZXJzLlxuXHR9XG5cdGZ1bmN0aW9uIGFjayhtc2csIG5vZGUpe1xuXHRcdHZhciBTID0gK25ldyBEYXRlLCBjdHggPSBtc2cuX3x8e30sIERCRyA9IGN0eC5EQkcgPSBtc2cuREJHO1xuXHRcdHZhciB0byA9IG1zZ1snIyddLCBpZCA9IHRleHRfcmFuZCg5KSwga2V5cyA9IE9iamVjdC5rZXlzKG5vZGV8fCcnKS5zb3J0KCksIHNvdWwgPSAoKG5vZGV8fCcnKS5ffHwnJylbJyMnXSwga2wgPSBrZXlzLmxlbmd0aCwgaiA9IDAsIHJvb3QgPSBtc2cuJC5fLnJvb3QsIEYgPSAobm9kZSA9PT0gcm9vdC5ncmFwaFtzb3VsXSk7XG5cdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAoKERCR3x8Y3R4KS5nayA9ICtuZXcgRGF0ZSkgLSBTLCAnZ290IGtleXMnKTtcblx0XHQvLyBQRVJGOiBDb25zaWRlciBjb21tZW50aW5nIHRoaXMgb3V0IHRvIGZvcmNlIGRpc2stb25seSByZWFkcyBmb3IgcGVyZiB0ZXN0aW5nPyAvLyBUT0RPOiAua2V5cyggaXMgc2xvd1xuXHRcdG5vZGUgJiYgKGZ1bmN0aW9uIGdvKCl7XG5cdFx0XHRTID0gK25ldyBEYXRlO1xuXHRcdFx0dmFyIGkgPSAwLCBrLCBwdXQgPSB7fSwgdG1wO1xuXHRcdFx0d2hpbGUoaSA8IDkgJiYgKGsgPSBrZXlzW2krK10pKXtcblx0XHRcdFx0c3RhdGVfaWZ5KHB1dCwgaywgc3RhdGVfaXMobm9kZSwgayksIG5vZGVba10sIHNvdWwpO1xuXHRcdFx0fVxuXHRcdFx0a2V5cyA9IGtleXMuc2xpY2UoaSk7XG5cdFx0XHQodG1wID0ge30pW3NvdWxdID0gcHV0OyBwdXQgPSB0bXA7XG5cdFx0XHR2YXIgZmFpdGg7IGlmKEYpeyBmYWl0aCA9IGZ1bmN0aW9uKCl7fTsgZmFpdGgucmFtID0gZmFpdGguZmFpdGggPSB0cnVlOyB9IC8vIEhOUEVSRjogV2UncmUgdGVzdGluZyBwZXJmb3JtYW5jZSBpbXByb3ZlbWVudCBieSBza2lwcGluZyBnb2luZyB0aHJvdWdoIHNlY3VyaXR5IGFnYWluLCBidXQgdGhpcyBzaG91bGQgYmUgYXVkaXRlZC5cblx0XHRcdHRtcCA9IGtleXMubGVuZ3RoO1xuXHRcdFx0Y29uc29sZS5TVEFUICYmIGNvbnNvbGUuU1RBVChTLCAtKFMgLSAoUyA9ICtuZXcgRGF0ZSkpLCAnZ290IGNvcGllZCBzb21lJyk7XG5cdFx0XHREQkcgJiYgKERCRy5nYSA9ICtuZXcgRGF0ZSk7XG5cdFx0XHRyb290Lm9uKCdpbicsIHsnQCc6IHRvLCAnIyc6IGlkLCBwdXQ6IHB1dCwgJyUnOiAodG1wPyAoaWQgPSB0ZXh0X3JhbmQoOSkpIDogdSksICQ6IHJvb3QuJCwgXzogZmFpdGgsIERCRzogREJHfSk7XG5cdFx0XHRjb25zb2xlLlNUQVQgJiYgY29uc29sZS5TVEFUKFMsICtuZXcgRGF0ZSAtIFMsICdnb3QgaW4nKTtcblx0XHRcdGlmKCF0bXApeyByZXR1cm4gfVxuXHRcdFx0c2V0VGltZW91dC50dXJuKGdvKTtcblx0XHR9KCkpO1xuXHRcdGlmKCFub2RlKXsgcm9vdC5vbignaW4nLCB7J0AnOiBtc2dbJyMnXX0pIH0gLy8gVE9ETzogSSBkb24ndCB0aGluayBJIGxpa2UgdGhpcywgdGhlIGRlZmF1bHQgbFMgYWRhcHRlciB1c2VzIHRoaXMgYnV0IFwibm90IGZvdW5kXCIgaXMgYSBzZW5zaXRpdmUgaXNzdWUsIHNvIHNob3VsZCBwcm9iYWJseSBiZSBoYW5kbGVkIG1vcmUgY2FyZWZ1bGx5L2luZGl2aWR1YWxseS5cblx0fSBHdW4ub24uZ2V0LmFjayA9IGFjaztcbn0oKSk7XG5cbjsoZnVuY3Rpb24oKXtcblx0R3VuLmNoYWluLm9wdCA9IGZ1bmN0aW9uKG9wdCl7XG5cdFx0b3B0ID0gb3B0IHx8IHt9O1xuXHRcdHZhciBndW4gPSB0aGlzLCBhdCA9IGd1bi5fLCB0bXAgPSBvcHQucGVlcnMgfHwgb3B0O1xuXHRcdGlmKCFPYmplY3QucGxhaW4ob3B0KSl7IG9wdCA9IHt9IH1cblx0XHRpZighT2JqZWN0LnBsYWluKGF0Lm9wdCkpeyBhdC5vcHQgPSBvcHQgfVxuXHRcdGlmKCdzdHJpbmcnID09IHR5cGVvZiB0bXApeyB0bXAgPSBbdG1wXSB9XG5cdFx0aWYoIU9iamVjdC5wbGFpbihhdC5vcHQucGVlcnMpKXsgYXQub3B0LnBlZXJzID0ge319XG5cdFx0aWYodG1wIGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdFx0b3B0LnBlZXJzID0ge307XG5cdFx0XHR0bXAuZm9yRWFjaChmdW5jdGlvbih1cmwpe1xuXHRcdFx0XHR2YXIgcCA9IHt9OyBwLmlkID0gcC51cmwgPSB1cmw7XG5cdFx0XHRcdG9wdC5wZWVyc1t1cmxdID0gYXQub3B0LnBlZXJzW3VybF0gPSBhdC5vcHQucGVlcnNbdXJsXSB8fCBwO1xuXHRcdFx0fSlcblx0XHR9XG5cdFx0b2JqX2VhY2gob3B0LCBmdW5jdGlvbiBlYWNoKGspeyB2YXIgdiA9IHRoaXNba107XG5cdFx0XHRpZigodGhpcyAmJiB0aGlzLmhhc093blByb3BlcnR5KGspKSB8fCAnc3RyaW5nJyA9PSB0eXBlb2YgdiB8fCBPYmplY3QuZW1wdHkodikpeyB0aGlzW2tdID0gdjsgcmV0dXJuIH1cblx0XHRcdGlmKHYgJiYgdi5jb25zdHJ1Y3RvciAhPT0gT2JqZWN0ICYmICEodiBpbnN0YW5jZW9mIEFycmF5KSl7IHJldHVybiB9XG5cdFx0XHRvYmpfZWFjaCh2LCBlYWNoKTtcblx0XHR9KTtcblx0XHRhdC5vcHQuZnJvbSA9IG9wdDtcblx0XHRHdW4ub24oJ29wdCcsIGF0KTtcblx0XHRhdC5vcHQudXVpZCA9IGF0Lm9wdC51dWlkIHx8IGZ1bmN0aW9uIHV1aWQobCl7IHJldHVybiBHdW4uc3RhdGUoKS50b1N0cmluZygzNikucmVwbGFjZSgnLicsJycpICsgU3RyaW5nLnJhbmRvbShsfHwxMikgfVxuXHRcdHJldHVybiBndW47XG5cdH1cbn0oKSk7XG5cbnZhciBvYmpfZWFjaCA9IGZ1bmN0aW9uKG8sZil7IE9iamVjdC5rZXlzKG8pLmZvckVhY2goZixvKSB9LCB0ZXh0X3JhbmQgPSBTdHJpbmcucmFuZG9tLCB0dXJuID0gc2V0VGltZW91dC50dXJuLCB2YWxpZCA9IEd1bi52YWxpZCwgc3RhdGVfaXMgPSBHdW4uc3RhdGUuaXMsIHN0YXRlX2lmeSA9IEd1bi5zdGF0ZS5pZnksIHUsIGVtcHR5ID0ge30sIEM7XG5cbkd1bi5sb2cgPSBmdW5jdGlvbigpeyByZXR1cm4gKCFHdW4ubG9nLm9mZiAmJiBDLmxvZy5hcHBseShDLCBhcmd1bWVudHMpKSwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oJyAnKSB9O1xuR3VuLmxvZy5vbmNlID0gZnVuY3Rpb24odyxzLG8peyByZXR1cm4gKG8gPSBHdW4ubG9nLm9uY2UpW3ddID0gb1t3XSB8fCAwLCBvW3ddKysgfHwgR3VuLmxvZyhzKSB9O1xuXG5pZih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKXsgKHdpbmRvdy5HVU4gPSB3aW5kb3cuR3VuID0gR3VuKS53aW5kb3cgPSB3aW5kb3cgfVxudHJ5eyBpZih0eXBlb2YgTU9EVUxFICE9PSBcInVuZGVmaW5lZFwiKXsgTU9EVUxFLmV4cG9ydHMgPSBHdW4gfSB9Y2F0Y2goZSl7fVxubW9kdWxlLmV4cG9ydHMgPSBHdW47XG5cbihHdW4ud2luZG93fHx7fSkuY29uc29sZSA9IChHdW4ud2luZG93fHx7fSkuY29uc29sZSB8fCB7bG9nOiBmdW5jdGlvbigpe319O1xuKEMgPSBjb25zb2xlKS5vbmx5ID0gZnVuY3Rpb24oaSwgcyl7IHJldHVybiAoQy5vbmx5LmkgJiYgaSA9PT0gQy5vbmx5LmkgJiYgQy5vbmx5LmkrKykgJiYgKEMubG9nLmFwcGx5KEMsIGFyZ3VtZW50cykgfHwgcykgfTtcblxuO1wiUGxlYXNlIGRvIG5vdCByZW1vdmUgd2VsY29tZSBsb2cgdW5sZXNzIHlvdSBhcmUgcGF5aW5nIGZvciBhIG1vbnRobHkgc3BvbnNvcnNoaXAsIHRoYW5rcyFcIjtcbkd1bi5sb2cub25jZShcIndlbGNvbWVcIiwgXCJIZWxsbyB3b25kZXJmdWwgcGVyc29uISA6KSBUaGFua3MgZm9yIHVzaW5nIEdVTiwgcGxlYXNlIGFzayBmb3IgaGVscCBvbiBodHRwOi8vY2hhdC5ndW4uZWNvIGlmIGFueXRoaW5nIHRha2VzIHlvdSBsb25nZXIgdGhhbiA1bWluIHRvIGZpZ3VyZSBvdXQhXCIpO1xuXHQiLCJcbnZhciBHdW4gPSByZXF1aXJlKCcuL2luZGV4Jyk7XG5HdW4uY2hhaW4uc2V0ID0gZnVuY3Rpb24oaXRlbSwgY2IsIG9wdCl7XG5cdHZhciBndW4gPSB0aGlzLCByb290ID0gZ3VuLmJhY2soLTEpLCBzb3VsLCB0bXA7XG5cdGNiID0gY2IgfHwgZnVuY3Rpb24oKXt9O1xuXHRvcHQgPSBvcHQgfHwge307IG9wdC5pdGVtID0gb3B0Lml0ZW0gfHwgaXRlbTtcblx0aWYoc291bCA9ICgoaXRlbXx8JycpLl98fCcnKVsnIyddKXsgKGl0ZW0gPSB7fSlbJyMnXSA9IHNvdWwgfSAvLyBjaGVjayBpZiBub2RlLCBtYWtlIGxpbmsuXG5cdGlmKCdzdHJpbmcnID09IHR5cGVvZiAodG1wID0gR3VuLnZhbGlkKGl0ZW0pKSl7IHJldHVybiBndW4uZ2V0KHNvdWwgPSB0bXApLnB1dChpdGVtLCBjYiwgb3B0KSB9IC8vIGNoZWNrIGlmIGxpbmtcblx0aWYoIUd1bi5pcyhpdGVtKSl7XG5cdFx0aWYoT2JqZWN0LnBsYWluKGl0ZW0pKXtcblx0XHRcdGl0ZW0gPSByb290LmdldChzb3VsID0gZ3VuLmJhY2soJ29wdC51dWlkJykoKSkucHV0KGl0ZW0pO1xuXHRcdH1cblx0XHRyZXR1cm4gZ3VuLmdldChzb3VsIHx8IHJvb3QuYmFjaygnb3B0LnV1aWQnKSg3KSkucHV0KGl0ZW0sIGNiLCBvcHQpO1xuXHR9XG5cdGd1bi5wdXQoZnVuY3Rpb24oZ28pe1xuXHRcdGl0ZW0uZ2V0KGZ1bmN0aW9uKHNvdWwsIG8sIG1zZyl7IC8vIFRPRE86IEJVRyEgV2Ugbm8gbG9uZ2VyIGhhdmUgdGhpcyBvcHRpb24/ICYgZ28gZXJyb3Igbm90IGhhbmRsZWQ/XG5cdFx0XHRpZighc291bCl7IHJldHVybiBjYi5jYWxsKGd1biwge2VycjogR3VuLmxvZygnT25seSBhIG5vZGUgY2FuIGJlIGxpbmtlZCEgTm90IFwiJyArIG1zZy5wdXQgKyAnXCIhJyl9KSB9XG5cdFx0XHQodG1wID0ge30pW3NvdWxdID0geycjJzogc291bH07IGdvKHRtcCk7XG5cdFx0fSx0cnVlKTtcblx0fSlcblx0cmV0dXJuIGl0ZW07XG59XG5cdCIsIlxuLy8gU2hpbSBmb3IgZ2VuZXJpYyBqYXZhc2NyaXB0IHV0aWxpdGllcy5cblN0cmluZy5yYW5kb20gPSBmdW5jdGlvbihsLCBjKXtcblx0dmFyIHMgPSAnJztcblx0bCA9IGwgfHwgMjQ7IC8vIHlvdSBhcmUgbm90IGdvaW5nIHRvIG1ha2UgYSAwIGxlbmd0aCByYW5kb20gbnVtYmVyLCBzbyBubyBuZWVkIHRvIGNoZWNrIHR5cGVcblx0YyA9IGMgfHwgJzAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1haYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonO1xuXHR3aGlsZShsLS0gPiAwKXsgcyArPSBjLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjLmxlbmd0aCkpIH1cblx0cmV0dXJuIHM7XG59XG5TdHJpbmcubWF0Y2ggPSBmdW5jdGlvbih0LCBvKXsgdmFyIHRtcCwgdTtcblx0aWYoJ3N0cmluZycgIT09IHR5cGVvZiB0KXsgcmV0dXJuIGZhbHNlIH1cblx0aWYoJ3N0cmluZycgPT0gdHlwZW9mIG8peyBvID0geyc9Jzogb30gfVxuXHRvID0gbyB8fCB7fTtcblx0dG1wID0gKG9bJz0nXSB8fCBvWycqJ10gfHwgb1snPiddIHx8IG9bJzwnXSk7XG5cdGlmKHQgPT09IHRtcCl7IHJldHVybiB0cnVlIH1cblx0aWYodSAhPT0gb1snPSddKXsgcmV0dXJuIGZhbHNlIH1cblx0dG1wID0gKG9bJyonXSB8fCBvWyc+J10pO1xuXHRpZih0LnNsaWNlKDAsICh0bXB8fCcnKS5sZW5ndGgpID09PSB0bXApeyByZXR1cm4gdHJ1ZSB9XG5cdGlmKHUgIT09IG9bJyonXSl7IHJldHVybiBmYWxzZSB9XG5cdGlmKHUgIT09IG9bJz4nXSAmJiB1ICE9PSBvWyc8J10pe1xuXHRcdHJldHVybiAodCA+PSBvWyc+J10gJiYgdCA8PSBvWyc8J10pPyB0cnVlIDogZmFsc2U7XG5cdH1cblx0aWYodSAhPT0gb1snPiddICYmIHQgPj0gb1snPiddKXsgcmV0dXJuIHRydWUgfVxuXHRpZih1ICE9PSBvWyc8J10gJiYgdCA8PSBvWyc8J10peyByZXR1cm4gdHJ1ZSB9XG5cdHJldHVybiBmYWxzZTtcbn1cblN0cmluZy5oYXNoID0gZnVuY3Rpb24ocywgYyl7IC8vIHZpYSBTT1xuXHRpZih0eXBlb2YgcyAhPT0gJ3N0cmluZycpeyByZXR1cm4gfVxuXHQgICAgYyA9IGMgfHwgMDsgLy8gQ1BVIHNjaGVkdWxlIGhhc2hpbmcgYnlcblx0ICAgIGlmKCFzLmxlbmd0aCl7IHJldHVybiBjIH1cblx0ICAgIGZvcih2YXIgaT0wLGw9cy5sZW5ndGgsbjsgaTxsOyArK2kpe1xuXHQgICAgICBuID0gcy5jaGFyQ29kZUF0KGkpO1xuXHQgICAgICBjID0gKChjPDw1KS1jKStuO1xuXHQgICAgICBjIHw9IDA7XG5cdCAgICB9XG5cdCAgICByZXR1cm4gYztcblx0ICB9XG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbk9iamVjdC5wbGFpbiA9IGZ1bmN0aW9uKG8peyByZXR1cm4gbz8gKG8gaW5zdGFuY2VvZiBPYmplY3QgJiYgby5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL15cXFtvYmplY3QgKFxcdyspXFxdJC8pWzFdID09PSAnT2JqZWN0JyA6IGZhbHNlIH1cbk9iamVjdC5lbXB0eSA9IGZ1bmN0aW9uKG8sIG4pe1xuXHRmb3IodmFyIGsgaW4gbyl7IGlmKGhhcy5jYWxsKG8sIGspICYmICghbiB8fCAtMT09bi5pbmRleE9mKGspKSl7IHJldHVybiBmYWxzZSB9IH1cblx0cmV0dXJuIHRydWU7XG59XG5PYmplY3Qua2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uKG8pe1xuXHR2YXIgbCA9IFtdO1xuXHRmb3IodmFyIGsgaW4gbyl7IGlmKGhhcy5jYWxsKG8sIGspKXsgbC5wdXNoKGspIH0gfVxuXHRyZXR1cm4gbDtcbn1cbjsoZnVuY3Rpb24oKXsgLy8gbWF4IH4xbXMgb3IgYmVmb3JlIHN0YWNrIG92ZXJmbG93IFxuXHR2YXIgdSwgc1QgPSBzZXRUaW1lb3V0LCBsID0gMCwgYyA9IDAsIHNJID0gKHR5cGVvZiBzZXRJbW1lZGlhdGUgIT09ICcnK3UgJiYgc2V0SW1tZWRpYXRlKSB8fCBzVDsgLy8gcXVldWVNaWNyb3Rhc2sgZmFzdGVyIGJ1dCBibG9ja3MgVUlcblx0c1QuaG9sZCA9IHNULmhvbGQgfHwgOTtcblx0c1QucG9sbCA9IHNULnBvbGwgfHwgZnVuY3Rpb24oZil7IC8vZigpOyByZXR1cm47IC8vIGZvciB0ZXN0aW5nXG5cdFx0aWYoKHNULmhvbGQgPj0gKCtuZXcgRGF0ZSAtIGwpKSAmJiBjKysgPCAzMzMzKXsgZigpOyByZXR1cm4gfVxuXHRcdHNJKGZ1bmN0aW9uKCl7IGwgPSArbmV3IERhdGU7IGYoKSB9LGM9MClcblx0fVxufSgpKTtcbjsoZnVuY3Rpb24oKXsgLy8gVG9vIG1hbnkgcG9sbHMgYmxvY2ssIHRoaXMgXCJ0aHJlYWRzXCIgdGhlbSBpbiB0dXJucyBvdmVyIGEgc2luZ2xlIHRocmVhZCBpbiB0aW1lLlxuXHR2YXIgc1QgPSBzZXRUaW1lb3V0LCB0ID0gc1QudHVybiA9IHNULnR1cm4gfHwgZnVuY3Rpb24oZil7IDEgPT0gcy5wdXNoKGYpICYmIHAoVCkgfVxuXHQsIHMgPSB0LnMgPSBbXSwgcCA9IHNULnBvbGwsIGkgPSAwLCBmLCBUID0gZnVuY3Rpb24oKXtcblx0XHRpZihmID0gc1tpKytdKXsgZigpIH1cblx0XHRpZihpID09IHMubGVuZ3RoIHx8IDk5ID09IGkpe1xuXHRcdFx0cyA9IHQucyA9IHMuc2xpY2UoaSk7XG5cdFx0XHRpID0gMDtcblx0XHR9XG5cdFx0aWYocy5sZW5ndGgpeyBwKFQpIH1cblx0fVxufSgpKTtcbjsoZnVuY3Rpb24oKXtcblx0dmFyIHUsIHNUID0gc2V0VGltZW91dCwgVCA9IHNULnR1cm47XG5cdChzVC5lYWNoID0gc1QuZWFjaCB8fCBmdW5jdGlvbihsLGYsZSxTKXsgUyA9IFMgfHwgOTsgKGZ1bmN0aW9uIHQocyxMLHIpe1xuXHQgIGlmKEwgPSAocyA9IChsfHxbXSkuc3BsaWNlKDAsUykpLmxlbmd0aCl7XG5cdCAgXHRmb3IodmFyIGkgPSAwOyBpIDwgTDsgaSsrKXtcblx0ICBcdFx0aWYodSAhPT0gKHIgPSBmKHNbaV0pKSl7IGJyZWFrIH1cblx0ICBcdH1cblx0ICBcdGlmKHUgPT09IHIpeyBUKHQpOyByZXR1cm4gfVxuXHQgIH0gZSAmJiBlKHIpO1xuXHR9KCkpfSkoKTtcbn0oKSk7XG5cdCIsIlxucmVxdWlyZSgnLi9zaGltJyk7XG5mdW5jdGlvbiBTdGF0ZSgpe1xuXHR2YXIgdCA9ICtuZXcgRGF0ZTtcblx0aWYobGFzdCA8IHQpe1xuXHRcdHJldHVybiBOID0gMCwgbGFzdCA9IHQgKyBTdGF0ZS5kcmlmdDtcblx0fVxuXHRyZXR1cm4gbGFzdCA9IHQgKyAoKE4gKz0gMSkgLyBEKSArIFN0YXRlLmRyaWZ0O1xufVxuU3RhdGUuZHJpZnQgPSAwO1xudmFyIE5JID0gLUluZmluaXR5LCBOID0gMCwgRCA9IDk5OSwgbGFzdCA9IE5JLCB1OyAvLyBXQVJOSU5HISBJbiB0aGUgZnV0dXJlLCBvbiBtYWNoaW5lcyB0aGF0IGFyZSBEIHRpbWVzIGZhc3RlciB0aGFuIDIwMTZBRCBtYWNoaW5lcywgeW91IHdpbGwgd2FudCB0byBpbmNyZWFzZSBEIGJ5IGFub3RoZXIgc2V2ZXJhbCBvcmRlcnMgb2YgbWFnbml0dWRlIHNvIHRoZSBwcm9jZXNzaW5nIHNwZWVkIG5ldmVyIG91dCBwYWNlcyB0aGUgZGVjaW1hbCByZXNvbHV0aW9uIChpbmNyZWFzaW5nIGFuIGludGVnZXIgZWZmZWN0cyB0aGUgc3RhdGUgYWNjdXJhY3kpLlxuU3RhdGUuaXMgPSBmdW5jdGlvbihuLCBrLCBvKXsgLy8gY29udmVuaWVuY2UgZnVuY3Rpb24gdG8gZ2V0IHRoZSBzdGF0ZSBvbiBhIGtleSBvbiBhIG5vZGUgYW5kIHJldHVybiBpdC5cblx0dmFyIHRtcCA9IChrICYmIG4gJiYgbi5fICYmIG4uX1snPiddKSB8fCBvO1xuXHRpZighdG1wKXsgcmV0dXJuIH1cblx0cmV0dXJuICgnbnVtYmVyJyA9PSB0eXBlb2YgKHRtcCA9IHRtcFtrXSkpPyB0bXAgOiBOSTtcbn1cblN0YXRlLmlmeSA9IGZ1bmN0aW9uKG4sIGssIHMsIHYsIHNvdWwpeyAvLyBwdXQgYSBrZXkncyBzdGF0ZSBvbiBhIG5vZGUuXG5cdChuID0gbiB8fCB7fSkuXyA9IG4uXyB8fCB7fTsgLy8gc2FmZXR5IGNoZWNrIG9yIGluaXQuXG5cdGlmKHNvdWwpeyBuLl9bJyMnXSA9IHNvdWwgfSAvLyBzZXQgYSBzb3VsIGlmIHNwZWNpZmllZC5cblx0dmFyIHRtcCA9IG4uX1snPiddIHx8IChuLl9bJz4nXSA9IHt9KTsgLy8gZ3JhYiB0aGUgc3RhdGVzIGRhdGEuXG5cdGlmKHUgIT09IGsgJiYgayAhPT0gJ18nKXtcblx0XHRpZignbnVtYmVyJyA9PSB0eXBlb2Ygcyl7IHRtcFtrXSA9IHMgfSAvLyBhZGQgdGhlIHZhbGlkIHN0YXRlLlxuXHRcdGlmKHUgIT09IHYpeyBuW2tdID0gdiB9IC8vIE5vdGU6IE5vdCBpdHMgam9iIHRvIGNoZWNrIGZvciB2YWxpZCB2YWx1ZXMhXG5cdH1cblx0cmV0dXJuIG47XG59XG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRlO1xuXHQiLCJcbi8vIFZhbGlkIHZhbHVlcyBhcmUgYSBzdWJzZXQgb2YgSlNPTjogbnVsbCwgYmluYXJ5LCBudW1iZXIgKCFJbmZpbml0eSksIHRleHQsXG4vLyBvciBhIHNvdWwgcmVsYXRpb24uIEFycmF5cyBuZWVkIHNwZWNpYWwgYWxnb3JpdGhtcyB0byBoYW5kbGUgY29uY3VycmVuY3ksXG4vLyBzbyB0aGV5IGFyZSBub3Qgc3VwcG9ydGVkIGRpcmVjdGx5LiBVc2UgYW4gZXh0ZW5zaW9uIHRoYXQgc3VwcG9ydHMgdGhlbSBpZlxuLy8gbmVlZGVkIGJ1dCByZXNlYXJjaCB0aGVpciBwcm9ibGVtcyBmaXJzdC5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHYpIHtcbiAgLy8gXCJkZWxldGVzXCIsIG51bGxpbmcgb3V0IGtleXMuXG4gIHJldHVybiB2ID09PSBudWxsIHx8XG5cdFwic3RyaW5nXCIgPT09IHR5cGVvZiB2IHx8XG5cdFwiYm9vbGVhblwiID09PSB0eXBlb2YgdiB8fFxuXHQvLyB3ZSB3YW50ICsvLSBJbmZpbml0eSB0byBiZSwgYnV0IEpTT04gZG9lcyBub3Qgc3VwcG9ydCBpdCwgc2FkIGZhY2UuXG5cdC8vIGNhbiB5b3UgZ3Vlc3Mgd2hhdCB2ID09PSB2IGNoZWNrcyBmb3I/IDspXG5cdChcIm51bWJlclwiID09PSB0eXBlb2YgdiAmJiB2ICE9IEluZmluaXR5ICYmIHYgIT0gLUluZmluaXR5ICYmIHYgPT09IHYpIHx8XG5cdCghIXYgJiYgXCJzdHJpbmdcIiA9PSB0eXBlb2YgdltcIiNcIl0gJiYgT2JqZWN0LmtleXModikubGVuZ3RoID09PSAxICYmIHZbXCIjXCJdKTtcbn1cblx0IiwiXG52YXIgR3VuID0gcmVxdWlyZSgnLi9pbmRleCcpO1xuR3VuLk1lc2ggPSByZXF1aXJlKCcuL21lc2gnKTtcblxuLy8gVE9ETzogcmVzeW5jIHVwb24gcmVjb25uZWN0IG9ubGluZS9vZmZsaW5lXG4vL3dpbmRvdy5vbm9ubGluZSA9IHdpbmRvdy5vbm9mZmxpbmUgPSBmdW5jdGlvbigpeyBjb25zb2xlLmxvZygnb25saW5lPycsIG5hdmlnYXRvci5vbkxpbmUpIH1cblxuR3VuLm9uKCdvcHQnLCBmdW5jdGlvbihyb290KXtcblx0dGhpcy50by5uZXh0KHJvb3QpO1xuXHRpZihyb290Lm9uY2UpeyByZXR1cm4gfVxuXHR2YXIgb3B0ID0gcm9vdC5vcHQ7XG5cdGlmKGZhbHNlID09PSBvcHQuV2ViU29ja2V0KXsgcmV0dXJuIH1cblxuXHR2YXIgZW52ID0gR3VuLndpbmRvdyB8fCB7fTtcblx0dmFyIHdlYnNvY2tldCA9IG9wdC5XZWJTb2NrZXQgfHwgZW52LldlYlNvY2tldCB8fCBlbnYud2Via2l0V2ViU29ja2V0IHx8IGVudi5tb3pXZWJTb2NrZXQ7XG5cdGlmKCF3ZWJzb2NrZXQpeyByZXR1cm4gfVxuXHRvcHQuV2ViU29ja2V0ID0gd2Vic29ja2V0O1xuXG5cdHZhciBtZXNoID0gb3B0Lm1lc2ggPSBvcHQubWVzaCB8fCBHdW4uTWVzaChyb290KTtcblxuXHR2YXIgd2lyZSA9IG1lc2gud2lyZSB8fCBvcHQud2lyZTtcblx0bWVzaC53aXJlID0gb3B0LndpcmUgPSBvcGVuO1xuXHRmdW5jdGlvbiBvcGVuKHBlZXIpeyB0cnl7XG5cdFx0aWYoIXBlZXIgfHwgIXBlZXIudXJsKXsgcmV0dXJuIHdpcmUgJiYgd2lyZShwZWVyKSB9XG5cdFx0dmFyIHVybCA9IHBlZXIudXJsLnJlcGxhY2UoL15odHRwLywgJ3dzJyk7XG5cdFx0dmFyIHdpcmUgPSBwZWVyLndpcmUgPSBuZXcgb3B0LldlYlNvY2tldCh1cmwpO1xuXHRcdHdpcmUub25jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRvcHQubWVzaC5ieWUocGVlcik7XG5cdFx0XHRyZWNvbm5lY3QocGVlcik7XG5cdFx0fTtcblx0XHR3aXJlLm9uZXJyb3IgPSBmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRyZWNvbm5lY3QocGVlcik7XG5cdFx0fTtcblx0XHR3aXJlLm9ub3BlbiA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRvcHQubWVzaC5oaShwZWVyKTtcblx0XHR9XG5cdFx0d2lyZS5vbm1lc3NhZ2UgPSBmdW5jdGlvbihtc2cpe1xuXHRcdFx0aWYoIW1zZyl7IHJldHVybiB9XG5cdFx0XHRvcHQubWVzaC5oZWFyKG1zZy5kYXRhIHx8IG1zZywgcGVlcik7XG5cdFx0fTtcblx0XHRyZXR1cm4gd2lyZTtcblx0fWNhdGNoKGUpe319XG5cblx0c2V0VGltZW91dChmdW5jdGlvbigpeyAhb3B0LnN1cGVyICYmIHJvb3Qub24oJ291dCcsIHtkYW06J2hpJ30pIH0sMSk7IC8vIGl0IGNhbiB0YWtlIGEgd2hpbGUgdG8gb3BlbiBhIHNvY2tldCwgc28gbWF5YmUgbm8gbG9uZ2VyIGxhenkgbG9hZCBmb3IgcGVyZiByZWFzb25zP1xuXG5cdHZhciB3YWl0ID0gMiAqIDk5OTtcblx0ZnVuY3Rpb24gcmVjb25uZWN0KHBlZXIpe1xuXHRcdGNsZWFyVGltZW91dChwZWVyLmRlZmVyKTtcblx0XHRpZighb3B0LnBlZXJzW3BlZXIudXJsXSl7IHJldHVybiB9XG5cdFx0aWYoZG9jICYmIHBlZXIucmV0cnkgPD0gMCl7IHJldHVybiB9XG5cdFx0cGVlci5yZXRyeSA9IChwZWVyLnJldHJ5IHx8IG9wdC5yZXRyeSsxIHx8IDYwKSAtICgoLXBlZXIudHJpZWQgKyAocGVlci50cmllZCA9ICtuZXcgRGF0ZSkgPCB3YWl0KjQpPzE6MCk7XG5cdFx0cGVlci5kZWZlciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gdG8oKXtcblx0XHRcdGlmKGRvYyAmJiBkb2MuaGlkZGVuKXsgcmV0dXJuIHNldFRpbWVvdXQodG8sd2FpdCkgfVxuXHRcdFx0b3BlbihwZWVyKTtcblx0XHR9LCB3YWl0KTtcblx0fVxuXHR2YXIgZG9jID0gKCcnK3UgIT09IHR5cGVvZiBkb2N1bWVudCkgJiYgZG9jdW1lbnQ7XG59KTtcbnZhciBub29wID0gZnVuY3Rpb24oKXt9LCB1O1xuXHQiXX0=

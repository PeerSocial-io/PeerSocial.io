window.SecureRender = function SecureRender(){};
;(function(sr, SecureRender, u) {
  var DEBUG = false;
  sr = {};
  SecureRender = window.SecureRender;
  sr.up = function(msg) { window.parent.postMessage(msg, '*'); } // TODO: AUDIT! THIS LOOKS SCARY, BUT '/' NOT WORK FOR SANDBOX 'null' ORIGIN. IS THERE ANYTHING BETTER?

  function fail() { 
    fail.yes = 1;
    var text = (newLine)=> {return `SecureRender has detected an external threat trying to tamper with the security of your application.${newLine}Please reload to restore security. If you still have problems, search for a more trusted source to load the application from.` }; 
    document.body.innerHTML = `<center>${text("<br/>")}</center>`;       
    // console.log(text("\n"));
    sr.up({how:"fail",who:"Sandbox"});
  }

  // setTimeout(fail,3000)//test sandbox fail

  ;
  (function() {
    sr.fail = "Blocked a script from leaking secure data (sandbox).";
    sr.ban = new Map;
    var tmp = window;
    while (tmp !== tmp.parent && (tmp = tmp.parent)) {
      sr.ban.set(tmp, 1);
      sr.ban.set(tmp.postMessage, 1);
    }
  }());

  
  window.onmessage = function(eve) { // hear from app, enclave, and workers.
    
    var msg = eve.data;
    if (!msg) { return }//always have data

    
    if(eve.source === window.parent){ // from myself
      eve.preventDefault();
      eve.stopImmediatePropagation();
      var tmp = sr.worker[msg.how];
      if (tmp) {
        tmp(msg, eve);// or do task
      }
      return;
    }
    
    if(eve.currentTarget === sr.workers.get(eve.currentTarget.id)){//from child
      eve.preventDefault();
      eve.stopImmediatePropagation();
      if(window.parent !== window){//i am NOT top window
        var tmp = eve.currentTarget.sr.events[msg.how];
        if (tmp) {
          tmp(msg.data);
        }else
          window.parent.postMessage(msg, "*");
      }
      return;
    }
    
    if(eve.source === eve.currentTarget === window){//from parent
      eve.preventDefault();
      eve.stopImmediatePropagation();
      sr.send(msg);
      return;
    }
    
  };

  var worker_sr = function(eve) { // hear from app, enclave, and workers.
    var msg = eve.data;
    if (!msg) { return }//always have data

    
    if(eve.currentTarget === worker){ // from myself
      eve.preventDefault();
      eve.stopImmediatePropagation();
      var tmp = sr.events[msg.how];
      if (tmp) {
        tmp(msg.data, eve);// or do task
      }
      return;
    }
    if(eve.source === eve.currentTarget === worker){//from parent
      eve.preventDefault();
      eve.stopImmediatePropagation();
      sr.send(msg);
      return;
    }
    
  };

  var worker_emit = function(how, data) { // hear from app, enclave, and workers.
    worker.postMessage({how:how, data:data});    
  };

  /*
  window.onmessage = function(eve) { // hear from app, enclave, and workers.
    
    var msg = eve.data;
    if (!msg) { return }//always have data

    if(eve.currentTarget === window){ 

      var tmp = sr.worker[msg.how];
      if (tmp) {
        tmp(msg, eve);// or do task
      }else{
        sr.workers.forEach(function(value, id){
          if(msg.from && msg.from != id)
            value.postMessage(msg);//send it to children
        });
      }
    }else{


      if(eve.currentTarget instanceof Worker){
        if(sr.workers.get(eve.currentTarget.id)) //message from the worker
          return window.parent.postMessage({from: eve.currentTarget.id, data: msg}, '*');//send it to parent
      }
    }
  };
*/

  var load_hashed_content = function (type, $url,done) {
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
        if($hash)

          crypto.subtle.digest('SHA-256', response).then((hash)=>{
            hash = btoa(String.fromCharCode.apply(null, new Uint8Array(hash)));
            if(hash == $hash)
              sr.worker.content_script(type, url, done)
            else {
              console.log("SecureRender hash Policy invalid for url", $url.split("#")[0], "sha256-"+hash)
              fail();
            }
          });
        else
        sr.worker.content_script(type, url, done)
      }
    }
    
  }

  sr.workers = new Map;
  var workeridc = 0;
  sr.run = function(msg, eve) {
    if (sr.workers.get(msg.get)) { return }
    // if(typeof theApp != typeof u && !the){
    //   the = theApp(sr);
    // }
    var worker, $sr = { events: {}, workers: sr.workers },emit=function(how, data){ worker.postMessage({how:how, data:data}); };
    var _sr = window.SecureRender? window.SecureRender : SecureRender ? SecureRender : function SecureRender(){};
    var $r = _sr;
     $r = $r($sr,emit);
     if(!$r) $r =_sr; 
    console.log("spawn untrusted script in worker:", msg);

    var url = window.URL.createObjectURL(new Blob([`if(${DEBUG}){debugger;}
    var worker = globalThis;
var sr = {events: worker.onmessage = ${worker_sr} }, emit = ${worker_emit};
(${$r})(async function(){${msg.put}})`]));
    worker = new Worker(url, {name : "SecureRender"/*+ ++workeridc*/});
    $sr.worker = worker;
    worker.sr = $sr
    sr.workers.set(worker.id = msg.get, worker);
    worker.last = worker.rate = msg.rate || 16; // 1000/60
    worker.addEventListener('message', window.onmessage);    

  }

  var view;
  sr.worker = {}; // RPC
  sr.worker.html = function(msg) {
    if (view) { return fail() } // only run once.
    view = document.getElementById('SecureRender');
    var div = document.createElement('div');
    div.innerHTML = msg.put;
    var all = div.getElementsByTagName('script'),
      i = 0,
      s, t;
    while (s = all[i++]) {
      if (!s.matches('secured')) {
        s.className = 'secured';
        if (!s.id) { s.id = 's' + Math.random().toString(32).slice(2) }
        if (!s.rate) { s.rate = (parseFloat(s.getAttribute('rate')) || 0.016) * 1000 }
        if (t = s.innerText) {     
          ((s)=>{
            var n = ()=>{ sr.run({ how: 'script', put: t, get: s.id, rate: s.rate }); };
            var n2 = ()=>{ if(n2 = s.getAttribute("src-js")){               
              load_hashed_content("js",n2,n); 
            } else n();  };
            if(s.getAttribute("src-css"))  load_hashed_content("css",s.getAttribute("src-css"),n2); else n2();
          })(s)   
        }
      }
    }
  }

  sr.content_scripts = new Map;
  sr.worker.content_script = function(type, src,next){
    if (sr.content_scripts.get(src)) { return next() }
    var r;
    if(type == "js"){
      r = document.createElement('script');
      r.setAttribute("type","text/javascript");
      r.setAttribute("src", src);
      r.onload = ()=>next();
    }
    if(type == "css"){
      r=document.createElement("link")
      r.setAttribute("rel", "stylesheet")
      r.setAttribute("type", "text/css")
      r.setAttribute("href", src)
      r.onload = ()=>next();
    }
    if(r){
      sr.content_scripts.set(src, r);
      document.getElementsByTagName("head")[0].appendChild(r);
    }else next()
  }

  sr.worker.localStore = function(msg, eve) {
    var tmp;
    if (tmp = msg.to) {
      (tmp = sr.workers.get(tmp)) && tmp.postMessage(msg);
      return;
    }
    msg.via = eve.target.id;
    sr.up(msg);
  }
  window.addEventListener('storage', function(a, b, c, d, e, f) {
    //console.log("store", a,b,c,d,e,f); // TODO: Implement update.
  });
  sr.worker.say = function(msg) {
    sr.worker
  }


}());
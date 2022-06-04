window.SecureRender = "()=>{}"
;(function(sr, SecureRender, u) {
  sr = {};
  SecureRender = window.SecureRender;
  sr.up = function(msg) { window.parent.postMessage(msg, '*'); } // TODO: AUDIT! THIS LOOKS SCARY, BUT '/' NOT WORK FOR SANDBOX 'null' ORIGIN. IS THERE ANYTHING BETTER?

  function fail() { fail.yes = 1;
    document.body.innerHTML = "<center>SecureRender has detected an external threat trying to tamper with the security of your application.<br/>Please reload to restore security. If you still have problems, search for a more trusted source to load the application from.</center>" }

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
        var tmp = sr.worker[msg.how];
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
  sr.workers = new Map;
  sr.run = function(msg, eve) {
    if (sr.workers.get(msg.get)) { return }
    // if(typeof theApp != typeof u && !the){
    //   the = theApp(sr);
    // }
    var $r = window.SecureRender || SecureRender || "()=>{}";
    console.log("spawn untrusted script in worker:", msg);

    var url = window.URL.createObjectURL(new Blob([`var worker = globalThis;(${$r(sr)})(async function(){${msg.put}})`]));
    var worker = new Worker(url);
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
            var n2 = ()=>{ if(s.getAttribute("src-js")) sr.worker.content_script("js",s.getAttribute("src-js"),n); else n();  };
            if(s.getAttribute("src-css")) sr.worker.content_script("css",s.getAttribute("src-css"),n2); else n2();
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
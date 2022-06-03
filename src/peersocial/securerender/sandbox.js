;(function(sr) {
  sr = {};
  var u;
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
    if (!msg) { return }
    if (u !== msg.length) { return sr.how.view(msg) }
    //if(msg.length){ return sr.how.run(msg) }
    var tmp = sr.how[msg.how];
    if (!tmp) { return }
    tmp(msg, eve);
  };

  sr.workers = new Map;
  sr.run = function(msg, eve) {
    if (sr.workers.get(msg.get)) { return }
    console.log("spawn untrusted script in worker:", msg);

    var url = window.URL.createObjectURL(new Blob(["(" + the + ")()||(breath = async function(){" + msg.put + "})"]));
    var worker = new Worker(url),
      u;
    sr.workers.set(worker.id = msg.get, worker);
    worker.last = worker.rate = msg.rate || 16; // 1000/60

    worker.addEventListener('message', window.onmessage);
  }

  var view;
  sr.how = {}; // RPC
  sr.how.html = function(msg) {
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
          sr.run({ how: 'script', put: t, get: s.id, rate: s.rate });
        }
      }
    }
  }

  sr.how.localStore = function(msg, eve) {
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
  sr.how.say = function(msg) {
    (beep = new SpeechSynthesisUtterance()).text = msg.text;
    beep.rate = msg.rate || 1, beep.pitch = msg.pitch || 1, speechSynthesis.speak(beep);
  }

  var the = theApp(sr);

}());
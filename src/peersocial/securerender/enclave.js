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
  
  var fail_who = "Enclave";
  function fail() { 
    var text = (newLine)=> {return (`SecureRender ${fail_who} has detected an external threat trying to tamper with the security of your application.\nPlease reload to restore security. If you still have problems, search for a more trusted source to load the application from.`).replaceAll("\n", newLine) }; 
    if(sr.watch) sr.watch.disconnect();
    document.body.innerHTML = `<center>${text("<br/>")}</center>`; 
    if(sr.i){
      sr.i.remove();//kill the context
      sr.i = false;
      console.log(text("\n"));
    }
    if(sr.watch) sr.watch.observe(document, sr.scan);
  }
  
  
  // var db;
  // var request = indexedDB.open("SecureRender");
  // request.onerror = event => {
  //     console.log("Why didn't you allow my web app to use IndexedDB?!");
  // };
  // request.onsuccess = event => {
  //     db = event.target.result;
  //     console.log("indexedDB",db);
  // };
  
  (function start(i) {
    // TODO: talk to cloudflare about enforcing integrity meanwhile?
    i = sr.i = document.createElement('iframe');
    i.className = 'SecureRender';
    i.name = 'SecureRender-Sandbox';
    i.style = "position: fixed;top: 0;width: 100%;height: 100%;inset: 0px;padding: 0;margin: 0;";
    i.sandbox = 'allow-scripts allow-popups allow-downloads allow-pointer-lock';
    i.csp = "script-src 'unsafe-eval' 'self' blob:; connect-src 'self'; default-src data: blob: mediastream: filesystem:; style-src 'self' 'unsafe-inline' blob:; child-src 'self' blob:; worker-src blob: 'self';";
    sr.send = function(msg) { if(i.contentWindow) i.contentWindow.postMessage(msg, '*') } // TODO: AUDIT! THIS LOOKS SCARY, BUT '/' NOT WORK FOR SANDBOX 'null' ORIGIN. IS THERE ANYTHING BETTER?
    i.src = "./sandbox.html";
    document.body.appendChild(i);
    (sr.watch = new MutationObserver(function(list, o) { // detect tampered changes, prevent clickjacking, etc.
      // sr.watch.disconnect();
      fail(); // immediately stop Secure Render!
      // sr.watch.observe(document, sr.scan);
    })).observe(document, sr.scan = { subtree: true, childList: true, attributes: true, characterData: true });
  }());

  
  window.onmessage = function(eve) { // hear from app, and sandbox.
    
    var msg = eve.data;
    if (!msg) { return }//always have data

    
    if(eve.source === eve.currentTarget === window){ // from myself
      eve.preventDefault();
      eve.stopImmediatePropagation();
      return;
    }
    
    if(eve.source === sr.i.contentWindow){//from sandox
      eve.preventDefault();
      eve.stopImmediatePropagation();
      
      if(msg.how == 'fail'){ 
        if(msg.who)
          fail_who = msg.who
        return fail();
      }
      if(window.parent !== window)
        window.parent.postMessage(msg, "*");

      return;
    }
    
    if(eve.source === window.parent){//from app
      eve.preventDefault();
      eve.stopImmediatePropagation();
      sr.send(msg);
      return;
    }
    
  };

  /*
  window.onmessage = function(eve) {
    console.log(eve.data)
    eve.preventDefault();
    eve.stopImmediatePropagation();
    var msg = eve.data,
      tmp, u;
    //console.log("ENCLAVE ONMESSAGE", msg);
    if (!msg) { return }
    //if(eve.origin !== location.origin){ console.log('meow?',eve); return }
    if (eve.source !== sr.i.contentWindow) { 
      return sr.send(msg) 
    }
    tmp = sr.how[msg.how];
    if (!tmp) { return }
    tmp(msg, eve);
  };
*/
  sr.how = {
    // localStorage is not async, so here is a quick async version for testing.
    localStore: function(msg, eve) {
      var u;
      if (u !== msg.put) {
        localStorage.setItem(msg.get, msg.put);
      }
      else
      if (msg.get) {
        sr.send({ to: msg.via, ack: msg.ack, ask: [localStorage.getItem(msg.get)], how: 'localStore' });
      }
    }
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

  var enclave_id = makeid(32);
  Object.defineProperty(Window.prototype, 'id', { get: function() { return enclave_id; } });// a random non-changeable ID
  // Window.prototype.sr_id = "enclave"

}());
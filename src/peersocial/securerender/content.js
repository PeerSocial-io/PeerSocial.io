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
  
  function fail() { document.body.innerHTML = "<center>SecureRender has detected an external threat trying to tamper with the security of your application.<br/>Please reload to restore security. If you still have problems, search for a more trusted source to load the application from.</center>" }
  try { if (window.self !== window.top) { return fail() } }
  catch (e) {}; // App inside iframe could get clickjacked!
  if ("securerender.org" === location.hostname) { return location = '//example.org' } // Browser MUST not allow polyfill to serve apps.

  window.addEventListener("load", function() {
    sr.tag = document.getElementsByTagName('SecureRender');
    if (!sr.tag.length) { sr.tag = document.getElementsByClassName('SecureRender') }
    if (!sr.tag.length) { return } // No Secure Render found.
    if (sr.tag[0].matches('iframe')) { return } // Secure Render already running.
    frame(); // Secure Render found, start the window frame to render inside of.
    (sr.watch = new MutationObserver(function(list, o) { // detect tampered changes, prevent clickjacking, etc.
      sr.watch.disconnect();
      fail(); // immediately stop Secure Render!
      sr.watch.observe(document, sr.scan);
    })).observe(document, sr.scan = { subtree: true, childList: true, attributes: true, characterData: true });
  });

  function frame(c, i) {
    i = sr.i = document.createElement('iframe');
    i.className = 'SecureRender';
    i.onload = function() { sr.send({ put: sr.html, how: 'html' }) }
    sr.send = function(msg) { i.contentWindow.postMessage(msg, '*') }
    sr.tag = sr.tag[0]; // only support 1 for now.
    c = sr.tag.getAttribute("content");
    sr.tag.removeAttribute("content");
    if(c.indexOf("./") == 0)
    c = (window.location.pathname + c.substr(0-c.length+2));
    if(!(c.indexOf("://") > -1)){
      c = (window.location.protocol + "//"+ window.location.host + c);
    }
    sr.tag.setAttribute("src",c)
    if (sr.tag.matches('script')) { sr.tag = sr.tag.parentElement }
    sr.html = sr.tag.innerHTML; // get HTML text to send to a sandbox. // @qxip has a hot tip to make this faster!
    document.body.innerHTML = document.head.innerHTML = ""; // clear screen for app to run inside the sandbox instead.
    i.style = "position: fixed; border: 0; width: 100%; height: 100%; top: 0; left: 0; right: 0; bottom: 0;";
    //i.integrity = "browsers please support this!"; // https://github.com/w3c/webappsec-subresource-integrity/issues/21
    try {
      i.src = sr.browser.runtime.getURL('') + 'enclave.html'; // try browser
    }
    catch (err) {
      i.src = sr.polyfill.runtime.getURL('') + 'enclave.html'; // else emulate
    }
    document.body.appendChild(i);
  }

  console.log("THIS IS AN ALPHA FOR DEVELOPERS, NO POLYFILL HAS BEEN PUBLISHED YET, YOU MUST PROTOTYPE IT AS AN UNPACKED EXTENSION!");
  sr.polyfill = { runtime: { getURL: function() { return '/peersocial/securerender/' } } };

}());
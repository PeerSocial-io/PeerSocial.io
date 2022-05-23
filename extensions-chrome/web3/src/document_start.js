(function(chrome) { //content script isolated

  //proxy post messages from context script to internal dom

  var s = document.createElement('script');
  s.src = chrome.runtime.getURL('app/document_load.js');
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);


  var startCode = `if(window.web3 && typeof window.web3.start == "function" )
                    window.web3.start();
                   document.documentElement.removeAttribute('onload');`;

  var onload = document.documentElement.getAttribute('onload');
  if (!onload) {
    document.documentElement.setAttribute('onload', startCode);
  }


  window.addEventListener("load", async(event) => {
    document.documentElement.dispatchEvent(new CustomEvent('load'));/* globals CustomEvent */
  });

  var port = chrome.runtime.connect({ name: "main" });

  port.onMessage.addListener(messageListen);

  window.addEventListener("message", async(event) => {
    // We only accept messages from ourselves
    if (event.source != window) {
      return;
    }

    if (event.data) {
      if (!event.data.type || !(event.data.type == "FROM_BACKGROUND")) {
        console.log("Content script received:", event.data);
        port.postMessage({ type: "FROM_PAGE", data: event.data });
      }

    }
  }, false);

  async function messageListen(msg) {
    window.postMessage(msg, "*");
  }

}(window.chrome));

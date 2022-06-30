define(function (require, exports, module) {

  appPlugin.consumes = ["hub", "app"];
  appPlugin.provides = ["service"];

  /* global $ */
  return appPlugin;

  function appPlugin(options, imports, register) {
    var EventEmitter = require("events").EventEmitter;

    // document.addEventListener("click", () => {
    //   if ('Notification' in window) {
    //     if (Notification.permission == "granted") {
    //       // If it's okay let's create a notification
    //       var notification = new Notification("Hi there!");
    //       notification;
    //     }

    //     // Otherwise, we need to ask the user for permission
    //     else {
    //       Notification.requestPermission().then(function (permission) {
    //         // If the user accepts, let's create a notification
    //         if (permission === "granted") {
    //           // var notification = new Notification("Hi there!");
    //         }
    //       });
    //     }
    //   }
    // })
    var service = new EventEmitter();
    var serviceWorker;
    Object.defineProperty(service, 'worker', {
      get: function () {
        return serviceWorker;
      }
    });
    service._emit = service.emit;
    service.emit = function (...msg) {
      service.worker.postMessage(msg)
    };

    var worker = '/service.worker.js';

    register(null, {
      service: service
    });
    var pongTimeout;

    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', event => {
          // console.log("+?navigator.serviceWorker-message",event);
          if (event.data != "pong")
            event.source.dispatchEvent(new CustomEvent('message', {
              detail: event
            }))
          else {
            // console.log("got pong")
            if (pongTimeout)
              clearTimeout(pongTimeout)
            pongTimeout = setTimeout(function () {
              pongTimeout = false;
              // console.log("sending ping")
              serviceWorker.postMessage("ping");
            }, 1000 * 10)

          }
        });
        navigator.serviceWorker.getRegistration(worker).then(async function (registration) {
          var installed = false
          if (!registration) {
            registration = await navigator.serviceWorker.register(worker);
            installed = true;
          }
          navigator.serviceWorker.ready.then((registration) => {
            serviceWorker = activeWorker(registration);  
            serviceWorker.id = makeid(32);          
            // console.log("+?serviceWorker.ready");
            registration.update().then(function (registration) {
              // console.log("+?registration.update",registration)
              var updated = false
              serviceWorker = activeWorker(registration);
              if (!serviceWorker.id) {
                serviceWorker.id = makeid(32);
                updated = true;
              }
              serviceWorker.id = makeid(32);              
              serviceWorker.registration = registration;
              serviceWorker.postMessage("ping");
              setupServiceWorker(serviceWorker)
              registration.addEventListener('updatefound', (event) => {
                // console.log("-?updatefound", event.target == registration, event)
                serviceWorker = activeWorker(registration);
                if (!serviceWorker.id) {
                  serviceWorker.registration = registration;
                  serviceWorker.id = makeid(32);
                  serviceWorker.postMessage("ping");
                  setupServiceWorker(serviceWorker);
                  console.log("ServiceWorker Updated!")
                }
              });
              console.log("ServiceWorker", updated ? "Updated!" : installed ? "Installed!" : "Running!")
              service._emit("ready");
            });
          });
        });
      }
    };

    function setupServiceWorker(serviceWorker) {
      if (serviceWorker) {
        // console.log("WorkerState:", serviceWorker.state);
        // serviceWorker.addEventListener('statechange', function (e) {
        //   console.log("WorkerState-change:", e.target.state);
        // });

        serviceWorker.addEventListener('message', function (e) {
          e = e.detail;
          // console.log("worker-message:", e);
          service._emit("message", e.data)
        });

      }
    }

    function activeWorker(registration) {
      var serviceWorker;
      if (registration.installing) {
        // console.log("-?installing")
        serviceWorker = registration.installing;
      } else if (registration.waiting) {
        // console.log("-?waiting")
        serviceWorker = registration.waiting;
      } else if (registration.active) {
        // console.log("-?active")
        serviceWorker = registration.active;
      }
      return serviceWorker;
    }

    fetch(worker).then((response)=>{
      if(response.status == 200)
        registerServiceWorker()
    }).catch((e)=>{})

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

  }

});
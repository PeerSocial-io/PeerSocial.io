define(function (require, exports, module) {

  appPlugin.consumes = ["hub", "app"];
  appPlugin.provides = ["service"];

  /* global $ */
  return appPlugin;

  function appPlugin(options, imports, register) {

    var worker = '/service.worker.js';

    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration(worker).then(async function (registration) {
          if (!registration) {
            registration = await navigator.serviceWorker.register(worker);
          }

          var serviceWorker = activeWorker(registration);

          registration.addEventListener('updatefound', (event) => {                
              console.log("-?updatefound", event)
          });
          
          setupServiceWorker(serviceWorker)

          navigator.serviceWorker.ready.then((registration) => {
            registration.update();
          });

        });

      }
    };
    function setupServiceWorker(serviceWorker, updated){
      if (serviceWorker) {
        console.log("WorkerState:", serviceWorker.state);
        serviceWorker.addEventListener('statechange', function (e) {
          console.log("WorkerState-change:", e.target.state);
        });

      }
    }

    function activeWorker(registration) {
      var serviceWorker;
      if (registration.installing) {
        console.log("-?installing")
        serviceWorker = registration.installing;
      } else if (registration.waiting) {
        console.log("-?waiting")
        serviceWorker = registration.waiting;
      } else if (registration.active) {
        console.log("-?active")
        serviceWorker = registration.active;
      }
      return serviceWorker;
    }

    
    imports.app.on("start",async ()=> {
      var workerExist = (await fetch(worker)).status == 200;
      if(workerExist)
        registerServiceWorker()
    });
    

    register(null, {
      service: {}
    });

  }

});
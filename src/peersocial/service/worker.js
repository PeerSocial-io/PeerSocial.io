(function () {
  globalThis.window = globalThis;
  // window.localStorage = store = {setItem: function(k,v){this[k]=v}, removeItem: function(k){delete this[k]}, getItem: function(k){return this[k]}};
  importScripts("/gun/gun.sw.js");

  var stash = "gun-store";
  var stashPath = "/gun/store/";
  

  self.addEventListener("install", (event) => {
    // console.log("?install")
    caches.keys().then(function (names) {
      for (let name of names){
        if(stash == name) return;
        caches.delete(name);
      }
    });

    self.skipWaiting(); 
  });

  var ignoreList = [
    new Request("/service.worker.js").url,
    // new Request("/package.json").url
  ];

  var ignoreListURLPrefix = [
    // new Request("/peersocial/additional_plugins").url,
    new Request("/peersocial/service").url,
  ];

  var cacheListSuffix = [
    ".js",
    ".css", 
    ".woff2",
    ".json"
  ];

  var cacheList = [
    new Request("/favicon.ico").url,
    new Request("/app/app.js").url
  ];

  var cacheResposeCodes = [
    200,
    302
  ]

  self.addEventListener("fetch", async (event) => {
    if (event.request.url.indexOf(new Request("/").url) == 0) { //stick to our domain

      if (event.request.url.indexOf(new Request(stashPath).url) == 0) { //stick to our domain
        event.respondWith(gunWire(event))
        return;
      }

      var dontCache = true; //dont cahce by default
      for (var i in cacheListSuffix) {
        if (event.request.url.substr(0 - cacheListSuffix[i].length) == cacheListSuffix[i])
          dontCache = false; //false to cache cacheListSuffix files
      }
      if (cacheList.indexOf(event.request.url) > -1)
        dontCache = false; //false if exist in cacheList
      for (var i in ignoreListURLPrefix) {
        if (event.request.url.indexOf(ignoreListURLPrefix[i]) == 0)
          dontCache = true; //true if exist in ignoreListURLPrefix
      }
      if (ignoreList.indexOf(event.request.url) > -1)
        dontCache = true; //true if exist in ignoreList


      event.respondWith(check2Cache(event, dontCache))

    }
  });

  async function gunWire(event) {
    return new Promise(async (resolve) => {
      var request = event.request;
      var cache = await caches.open(stash)
      var put;

      if (request.method == "PUT") {
        put = await request.text();
        await cache.put(new Request(request.url), new Response(put));
        return resolve(new Response("ok"));
      } else {
        var cached = await cache.match(new Request(request.url));
        if(cached)
          return resolve(cached)
        else return resolve(new Response(""))


        resolve(new Response(new ReadableStream({
          start(controller) {
            var encoder = new TextEncoder(); // always utf-8
            controller.enqueue(encoder.encode("1"));
            controller.close();
          }
        }), {
          headers: {
            "Content-Type": "text/html"
          }
        }));
      }
    });
  }

  async function putInCache(request, response) {
    var cache = await openCacheVersion();
    await cache.put(request, response);
  };

  async function removeFromCache(request) {
    var cache = await openCacheVersion();
    await cache.delete(request);
  };

  var versionMemory, versionMemoryClear, lastVersionDetected;
  async function openCacheVersion() {
    return new Promise(async (resolve) => {
      if (!versionMemory) {
        try {
          var $package = await fetch("/package.json");
          $package = JSON.parse(await ($package).text())
          lastVersionDetected = versionMemory = $package.version + "-" + $package.source_version;
        } catch (e) {
          return resolve(await caches.open(lastVersionDetected))
        }
      }

      if (versionMemoryClear) clearTimeout(versionMemoryClear)
      versionMemoryClear = setTimeout(function () {
        versionMemory = false;
      }, 5000);

      var dbs = await caches.keys();
      for (var i in dbs) {
        if(dbs[i] == stash) continue;
        if (dbs[i] != versionMemory)
          await caches.delete(dbs[i])
      }
      resolve(await caches.open(versionMemory))

    })
  }

  async function check2Cache(event, dontCache) {
    return new Promise(async (resolve) => {
      try {
        var request = event.request,
          cache = await openCacheVersion();
        var errorPage;

        if (cache) {
          errorPage = await (cache).match(new Request("/"));
          cache = await (cache).match(request);
        }
        if (!errorPage) {
          errorPage = new Request("/");
          putInCache(errorPage, await fetch(errorPage))
          errorPage = await fetch(errorPage)
        }
        if (cache && !dontCache) {
          // console.log("CACHED", request.url) 
          return resolve(cache);
        }
        var webResponse = await fetch(request);
        if (webResponse.status == 200) {

          if (!dontCache)
            putInCache(request, webResponse.clone());
          // console.log("webResponse", request.url) 
          resolve(webResponse);

        } else if (errorPage && (webResponse.status == 302 || webResponse.status == 404 || webResponse.status == 0)) {
          if (new Request("/service.worker.js").url == request.url)
            resolve(new Response('File Not Found', {
              status: 404,
              headers: {
                'Content-Type': 'text/plain'
              },
            }))
          else {
            resolve(new Response(await errorPage.text(), {
              status: 302,
              headers: {
                'Content-Type': 'text/html'
              },
            }))
          }
        } else {
          console.log(webResponse.status, request.url)
          throw "e";
        }
      } catch (error) {
        resolve(new Response(error.toString(), {
          status: 408,
          headers: {
            'Content-Type': 'text/plain'
          },
        }))
      }
    });
  };

  var counterPing;

  self.addEventListener("message", (event) => {

    var msg = event.data;
    if (!msg) return;
    var client = event.source;

    switch (msg) {
      case "ping":
        if (!counterPing) counterPing = 0;
        ++counterPing;
        // console.log("got ping", "sending pong", counterPing)
        initGUN();

        client.postMessage("pong");
        break;
      default:
        console.log(msg);
    }

  });

  var gun;

  //WorkerGlobalScope
  self.addEventListener("error", function (event) {
    // console.log("?error", event) 
  });

  self.addEventListener('offline', function (event) {
    console.log("?offline", event)
  })
  self.addEventListener('online', function (event) {
    console.log("?online", event)
  })

  //ServiceWorkerGlobalScope

  self.addEventListener("activate", function (event) {
    console.log("?activated", event)
    initGUN();
  });

  self.addEventListener('contentdelete', function (event) {
    console.log('?contentdelete', event);
  });

  //fetch
  //install
  //message

  self.addEventListener('notificationclick', function (event) {
    console.log('?notificationclick', event);
  });

  self.addEventListener('notificationclose', function (event) {
    console.log('?notificationclose', event);
  });

  self.addEventListener('sync', function (event) {
    console.log('?sync', event);
  });

  self.addEventListener('periodicsync', function (event) {
    console.log('?periodicsync', event);
  });

  self.addEventListener('push', function (event) {
    if (Notification.permission == "granted") {
      console.log('?push', event);
      event.waitUntil(
        // Show a notification with title 'ServiceWorker Cookbook' and body 'Alea iacta est'.
        self.registration.showNotification('SomeNotification', {
          body: 'Alea iacta est',
        })
      );
    }
  });

  self.addEventListener('pushsubscriptionchange', function (event) {
    console.log('?pushsubscriptionchange', event);
  });


  function initGUN() {
    if (self.serviceWorker !== self.registration.active) return;

    if (!gun) {
      gun = true;


      GUN.on('create', function (root) {
        console.log("gun created?", root.opt)
        this.to.next(root);
      });
      var peers = [];
      peers.push(new Request("/").url + "gun");
      peers.push("https://www.peersocial.io/gun");
      peers.push("https://dev.peersocial.io/gun");
      peers.push("https://peersocial-notify.herokuapp.com/gun");
      peers.push("https://gun-manhattan.herokuapp.com/gun");

      console.log(peers);

      gun = GUN({
        peers: peers,
        localStorage: false,
        file: "gun-sw"
        // super:true 
      })

      gun.get("init").get("!").put(+new Date)

    }

  }
})()
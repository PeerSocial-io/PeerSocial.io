self.addEventListener("install", (event) => {
  // console.log("?install")
  caches.keys().then(function (names) {
    for (let name of names)
      caches.delete(name);
  });

  self.skipWaiting();
});

var ignoreList = [
  new Request("/service.worker.js").url,
  new Request("/package.json").url
];

var ignoreListURLPrefix = [
  new Request("/peersocial/additional_plugins").url,
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

self.addEventListener("fetch", async (event) => {
  if (event.request.url.indexOf(new Request("/").url) == 0) { //stick to our domain
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
    if (!dontCache) {
      event.respondWith(check2Cache(event))
    }
  }
});

async function putInCache(request, response) {
  var cache = await openCacheVersion();
  await cache.put(request, response);
};

async function removeFromCache(request) {
  var cache = await openCacheVersion();
  await cache.delete(request);
};

var versionMemory, versionMemoryClear;
async function openCacheVersion() {
  return new Promise(async (resolve) => {
    if (!versionMemory) {
      var $package = JSON.parse(await (await fetch("/package.json")).text())
      versionMemory = $package.version+"-"+$package.source_version;
    }

    if (versionMemoryClear) clearTimeout(versionMemoryClear)
    versionMemoryClear = setTimeout(function () {
      versionMemory = false;
    }, 5000);

    var dbs = await caches.keys();
    for(var i in dbs){
      if(dbs[i] != versionMemory)
        await caches.delete(dbs[i])
    }
    resolve(await caches.open(versionMemory))

  })
}

async function check2Cache(event) {
  return new Promise(async (resolve) => {
    try {
      var request = event.request,
        cache = await (await openCacheVersion()).match(request);
      if (cache) {
        // console.log("CACHED", request.url)
        return resolve(cache);
      }
      var webResponse = await fetch(request);
      putInCache(request, webResponse.clone());
      // console.log("webResponse", request.url)
      resolve(webResponse);
    } catch (error) {
      resolve(new Response('Network error happened', {
        status: 408,
        headers: {
          'Content-Type': 'text/plain'
        },
      }))
    }
  });
};



/*

self.addEventListener("message", (event) => {
  console.log("?message")
});

self.addEventListener("statechange", (event) => {
  console.log("?statechange")
});

self.addEventListener('offline', function () {
  console.log("?offline")
})
self.addEventListener('online', function () {
  console.log("?online")
})

self.addEventListener('periodicsync', event => {
  console.log('?periodicsync');
});

self.addEventListener("activate", (event) => {
  console.log("?activated")
});

self.addEventListener('notificationclick', function (event) {
  console.log('?notificationclick');
});

*/

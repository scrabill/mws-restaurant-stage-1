// Start a cache

var cacheName = 'mws-restaurant-v4';
var urlsToCache = [
      '/',
      '/restaurant.html',
      '/index.html',
      '/manifest.json',
      '/certificates.js',
      '/css',
      '/css/styles.css',
      "/js/dbhelper.js",
      "/js/main.js",
      "/js/restaurant_info.js",
      "/img/undefined.jpg"
     ];

// Open the cache & add urls

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      // console.log('Opened Cache');

      // Print all cached urls to the console - double check that its working!
      // console.log('urlsToCache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Intercept and return cached version of assets

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            if(response){
                return response
            }
            // not in cache, return from network
            return fetch(event.request, {credentials: 'include'});
        })
    );
});

// Source: https://itnext.io/service-workers-your-first-step-towards-progressive-web-apps-pwa-e4e11d1a2e85

//self.addEventListener('fetch', function(event) {
  //var requestUrl = new URL(event.request.url);
 // console.log(event.request.url); // Prints all cached URLs

 // Look at incoming request, serve the cached verison (if it exists)

 //event.respondWith(
   //caches.match(event.request).then(function(response) {
     //return response || fetch(event.request);
     /*
     TODO: Uncaught (in promise) TypeError: Failed to execute 'fetch' on 'ServiceWorkerGlobalScope': 'only-if-cached' can be set only with 'same-origin' mode
    at sw.js:42
     */
   //})
 //);
//});

// Source: https://developers.google.com/web/fundamentals/codelabs/offline/ >> VERY HELPFUL

//
//self.addEventListener('fetch', function(event) {
  // TODO: respond with an entry from the cache if there is one.
  // If there isn't, fetch from the network.
//    event.respondWith(
//    caches.match(event.request).then(function(response){
//      if (response) return response;
//      return fetch(event.request);
//      }
//  ));
//});

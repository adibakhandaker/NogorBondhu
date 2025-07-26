const CACHE_NAME = 'nogorbondhu-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/bike-ride.html',
  '/bike-ride map.html',
  '/caregiver-nanny.html',
  '/food-delivery.html',
  '/grocery.html',
  '/inter-city.html',
  '/others.html',
  '/school-pickup.html',
  '/style.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing and caching files');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // ক্যাশে ফাইল থাকলে তা রিটার্ন করবে
        if (response) {
          return response;
        }
        // না থাকলে নেটওয়ার্ক থেকে ফেচ করবে
        return fetch(event.request);
      })
  );
});

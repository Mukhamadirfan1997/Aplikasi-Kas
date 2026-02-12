const CACHE_VERSION = 'kas-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './login.html',
  './rekap.html',
  './sudah-bayar.html',
  './belum-bayar.html',
  './offline.html',
  './style.css',
  './icon-192.svg',
  './icon-512.svg',
  './opsrejoso.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install — pre-cache semua aset statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — hapus cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — strategi berbeda untuk API vs aset statis
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls (Google Apps Script) → Network First, fallback to cache
  if (url.hostname === 'script.google.com') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Aset statis → Cache First, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Update cache di background (stale-while-revalidate)
        fetch(event.request)
          .then((response) => {
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request, response);
            });
          })
          .catch(() => {});
        return cached;
      }

      // Tidak ada cache → fetch dari network
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          // Jika HTML request gagal → tampilkan offline page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./offline.html');
          }
        });
    })
  );
});

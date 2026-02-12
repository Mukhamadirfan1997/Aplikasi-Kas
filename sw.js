self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
  // Biarkan aplikasi mengambil data dari internet seperti biasa
  e.respondWith(fetch(e.request));
});
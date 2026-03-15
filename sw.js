// HMS Tracker — Service Worker v1.0
// Cache-first strategy, offline-first PWA

const CACHE_NAME = 'hms-tracker-v1.0.0';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/prompts.json',
  '/css/main.css',
  '/css/base/reset.css',
  '/css/base/variables.css',
  '/css/base/typography.css',
  '/css/components/navbar.css',
  '/css/components/fab.css',
  '/css/components/modal.css',
  '/css/components/cards.css',
  '/css/components/buttons.css',
  '/css/components/forms.css',
  '/css/components/toast.css',
  '/css/components/pin.css',
  '/css/components/progress.css',
  '/css/pages/dashboard.css',
  '/css/pages/assets.css',
  '/css/pages/expenses.css',
  '/css/pages/goals.css',
  '/css/pages/zakat.css',
  '/js/main.js',
  '/js/state.js',
  '/js/data.js',
  '/js/render.js',
  '/js/utils.js',
  '/js/router.js',
  '/js/stores/assetsStore.js',
  '/js/stores/transactionsStore.js',
  '/js/stores/goalsStore.js',
  '/js/stores/zakatStore.js',
  '/js/stores/settingsStore.js',
  '/js/pages/dashboard.js',
  '/js/pages/assets.js',
  '/js/pages/expenses.js',
  '/js/pages/goals.js',
  '/js/pages/zakat.js',
  '/assets/sprites.svg',
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first, network fallback
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

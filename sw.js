// Network-first: online prende sempre l'ultima versione, offline usa la copia in cache.
// Le richieste verso altri domini (Firebase, Google Fonts) non passano di qui.
const CACHE = 'dh-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.json'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  // no-cache: chiede sempre al server se il file è cambiato. Senza, la cache HTTP di
  // GitHub Pages (max-age=600) serviva la versione vecchia per 10 minuti dopo un push.
  // Si passa l'URL e non la Request: una richiesta di navigazione con opzioni darebbe errore.
  e.respondWith(
    fetch(e.request.url, { cache: 'no-cache' })
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

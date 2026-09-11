// Appli Tournee : s'ouvre sans reseau une fois installee, et prend toujours la derniere version
// des qu'il y a du reseau (la page est redemandee a chaque ouverture, la memoire ne sert qu'en secours).
const CACHE = 'tournee-v1';
const COQUILLE = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];
// Bibliotheques et polices a version fixe : gardees en memoire des la premiere fois.
const FIXES = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(COQUILLE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function garder(requete, reponse) {
  if (reponse && (reponse.ok || reponse.type === 'opaque')) {
    const copie = reponse.clone();
    caches.open(CACHE).then(c => c.put(requete, copie));
  }
  return reponse;
}

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  // Tuiles de carte et itineraires : toujours le reseau (trop nombreux pour etre gardes).
  if (url.origin === self.location.origin) {
    // « no-cache » : le telephone redemande la page au lieu de garder l'ancienne 10 minutes.
    e.respondWith(fetch(new Request(r, { cache: 'no-cache' }))
      .then(rep => garder(r, rep))
      .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./index.html'))));
    return;
  }
  if (FIXES.includes(url.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(rep => garder(r, rep))));
  }
});

// Service worker : rend l'appli installable et utilisable hors connexion.
// Changer le numéro de version à chaque mise en ligne d'une nouvelle version de l'appli.
const VERSION = "cave-jaby-v3-2";
const FICHIERS = ["./", "index.html", "manifest.json", "logo.jpg", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Les données (script Google) et les polices passent toujours par le réseau
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Réseau d'abord (pour avoir la dernière version), cache si hors connexion
  e.respondWith(
    fetch(e.request).then(r => {
      const copie = r.clone();
      caches.open(VERSION).then(c => c.put(e.request, copie));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});

// Service worker básico: guarda a "casca" do app (HTML, ícones, manifest)
// no dispositivo, pra abrir rápido e continuar funcionando visualmente
// mesmo sem internet. Isso NÃO guarda agendamentos offline — os
// agendamentos continuam precisando do banco de dados, com internet.
var CACHE_NAME = 'mrjhon-app-v1';
var APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Estratégia "network first, cache fallback": sempre tenta buscar a
// versão mais nova na internet; se não conseguir (sem sinal), usa a
// cópia guardada. Assim o app nunca fica com tela em branco.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});

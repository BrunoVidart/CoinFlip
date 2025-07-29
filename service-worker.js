const CACHE_NAME = 'coinflip-rpg-cache-v1';
const urlsToCache = [
  '/', // A própria raiz do site
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/coin-icon.png', // Lembre-se: este arquivo de imagem precisa estar na mesma pasta quando você hospedar!
  'https://placehold.co/1200x800/E0C9A6/4B3621?text=Pergaminho+Antigo' // Adicionado o URL da imagem de placeholder ao cache
];

// Evento de instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch (quando o navegador tenta buscar um recurso)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o recurso do cache se ele existir
        if (response) {
          return response;
        }
        // Se não estiver no cache, busca na rede
        return fetch(event.request);
      })
  );
});

// Evento de ativação do Service Worker (para limpar caches antigos)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Exclui caches que não estão na lista branca
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

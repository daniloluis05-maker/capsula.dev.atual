// ─────────────────────────────────────────────────────────────
// capsula.dev · sw.js — Service Worker mínimo
//
// Estratégia: stale-while-revalidate apenas para assets estáticos
// próprios (mesma origem) — css/, js/, png, svg, woff2, ico.
// Tudo mais (HTML, Supabase API, GA, Sentry, fonts.googleapis.com,
// edge functions) passa direto pela rede.
//
// Por que assim:
//  - HTML cacheado quebra deploys (user vê versão velha por dias)
//  - Cachear Supabase quebra auth + dados em tempo real
//  - Fontes do Google Fonts já têm cache de 1 ano via headers
//
// Versionar CACHE_NAME a cada deploy que mude shape dos assets
// (raramente preciso — stale-while-revalidate cuida do refresh).
// ─────────────────────────────────────────────────────────────

const CACHE_NAME = 'gnosis-static-v1';
const STATIC_EXT = /\.(css|js|png|svg|woff2|woff|ico|jpg|jpeg|webp)$/i;

self.addEventListener('install', (event) => {
  // Ativa imediatamente em vez de esperar abas antigas fecharem
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Limpa caches antigos de versões anteriores
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Só intercepta same-origin
  if (url.origin !== self.location.origin) return;
  // Só intercepta extensões estáticas conhecidas
  if (!STATIC_EXT.test(url.pathname)) return;

  // Stale-while-revalidate: serve do cache imediato, atualiza em background
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((resp) => {
          // Só guarda respostas 200 OK (não cacheia erro/redirect)
          if (resp && resp.status === 200 && resp.type === 'basic') {
            cache.put(req, resp.clone());
          }
          return resp;
        }).catch(() => cached); // offline: usa o cache mesmo se velho
        return cached || fetchPromise;
      })
    )
  );
});

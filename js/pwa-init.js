// ─────────────────────────────────────────────────────────────
// capsula.dev · js/pwa-init.js
// Registra o Service Worker em produção. No-op em localhost/dev
// pra não confundir cache durante desenvolvimento.
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  // Pula em desenvolvimento local — evita cache atrapalhar refresh
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return;

  // Registra após load pra não competir com recursos críticos
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .catch((err) => console.warn('[pwa] SW register failed:', err));
  });
})();

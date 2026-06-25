// ─────────────────────────────────────────────────────────────
// capsula.dev · js/sync-tabs.js
// Sincronização leve entre abas via BroadcastChannel (fallback
// transparente pro storage event, que já funciona nativo).
//
// API global em window.gnosisSyncTabs:
//   broadcast(type, payload)   — manda mensagem pras outras abas
//   on(type, handler)          — escuta um tipo
//
// Tipos usados pelo sistema:
//   - 'user-changed'  — capsula_user mudou (login/save/sync)
//   - 'user-logout'   — admin/user fez logout em outra aba
//   - 'quiz-done'     — matriz concluída noutra aba (payload: { matriz })
//
// O storage event nativo (window.addEventListener('storage', ...))
// continua funcionando em paralelo pra captar escritas diretas no
// localStorage. O BroadcastChannel é pra eventos *explícitos* que
// não corresponderiam a uma mudança de chave (ex: logout).
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const CHANNEL = 'capsula_sync';
  const handlers = {};
  let bc = null;

  // BroadcastChannel: Chrome 54+, Firefox 38+, Safari 15.4+. Cobre 95%+
  // dos browsers atuais. Fallback silencioso em browsers antigos —
  // storage event ainda cobre 80% dos casos.
  if ('BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.addEventListener('message', function (ev) {
        const msg = ev.data;
        if (!msg || !msg.type) return;
        const list = handlers[msg.type] || [];
        for (const fn of list) {
          try { fn(msg.payload || {}, msg); }
          catch (e) { console.warn('[sync-tabs] handler error', msg.type, e); }
        }
      });
    } catch (_) { bc = null; }
  }

  function broadcast(type, payload) {
    if (!bc || !type) return;
    try { bc.postMessage({ type: type, payload: payload || {}, ts: Date.now() }); }
    catch (_) {}
  }

  function on(type, fn) {
    if (!type || typeof fn !== 'function') return;
    (handlers[type] = handlers[type] || []).push(fn);
  }

  window.gnosisSyncTabs = { broadcast: broadcast, on: on };
})();

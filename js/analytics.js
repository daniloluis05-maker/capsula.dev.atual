// ─────────────────────────────────────────────────────────────
// capsula.dev · js/analytics.js
//
// Google Analytics 4 + banner LGPD de consentimento.
//
// Comportamento:
//  1. Se CAPSULA_CONFIG.gaMeasurementId estiver vazio → no-op total.
//     Não carrega gtag, não mostra banner. Privacidade por padrão.
//  2. Se ID configurado e usuário ainda não decidiu → mostra banner.
//  3. Se aceitou → carrega gtag e envia eventos.
//  4. Se recusou → não carrega gtag. Choice persiste em localStorage.
//
// Inclua em todas páginas APÓS js/config.js:
//   <script src="js/analytics.js" defer></script>
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const CFG = window.CAPSULA_CONFIG || {};
  const GA_ID = CFG.gaMeasurementId;
  const STORAGE_KEY = 'capsula_cookie_consent';
  // Valores: 'accepted' | 'rejected' | undefined (ainda não decidiu)

  // Sem ID configurado → no-op total
  if (!GA_ID) return;

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch (_) { return ''; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {}
  }

  function loadGtag() {
    // Evita carregar duas vezes
    if (window.gtag) return;

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=Strict;Secure',
    });
  }

  function showBanner() {
    if (document.getElementById('_cookie-banner')) return;

    const banner = document.createElement('div');
    banner.id = '_cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Consentimento de cookies');
    banner.style.cssText = [
      'position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:9999;',
      'background:rgba(13,14,20,0.97);',
      'border:1px solid rgba(124,106,247,0.3);',
      'border-radius:12px;',
      'padding:1.1rem 1.25rem;',
      'box-shadow:0 8px 32px rgba(0,0,0,0.45);',
      'max-width:640px;margin:0 auto;',
      'font-family:system-ui,-apple-system,sans-serif;',
      'color:#e8e8f0;font-size:0.88rem;line-height:1.55;',
      'display:flex;flex-direction:column;gap:0.85rem;',
    ].join('');

    banner.innerHTML = [
      '<div>',
      'Usamos cookies de análise (Google Analytics) para entender como você usa a plataforma e melhorá-la. ',
      'Nenhum dado é compartilhado com terceiros para publicidade. ',
      '<a href="privacidade.html" style="color:#7c6af7;text-decoration:underline;">Política de Privacidade</a>.',
      '</div>',
      '<div style="display:flex;gap:0.65rem;flex-wrap:wrap;justify-content:flex-end;">',
      '<button id="_cookie-reject" type="button" style="',
        'padding:0.55rem 1rem;background:transparent;',
        'border:1px solid rgba(255,255,255,0.18);border-radius:8px;',
        'color:rgba(232,232,240,0.7);font-size:0.85rem;cursor:pointer;',
      '">Recusar</button>',
      '<button id="_cookie-accept" type="button" style="',
        'padding:0.55rem 1.1rem;background:#7c6af7;',
        'border:none;border-radius:8px;',
        'color:#fff;font-weight:600;font-size:0.85rem;cursor:pointer;',
      '">Aceitar cookies</button>',
      '</div>',
    ].join('');

    document.body.appendChild(banner);

    document.getElementById('_cookie-accept').addEventListener('click', function () {
      setConsent('accepted');
      banner.remove();
      loadGtag();
    });

    document.getElementById('_cookie-reject').addEventListener('click', function () {
      setConsent('rejected');
      banner.remove();
    });
  }

  // Bootstrap
  function init() {
    const consent = getConsent();
    if (consent === 'accepted') {
      loadGtag();
    } else if (consent === 'rejected') {
      // user already opted out — silêncio
    } else {
      // ainda não decidiu — mostra banner depois do DOM pronto
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

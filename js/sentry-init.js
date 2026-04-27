// ─────────────────────────────────────────────────────────────
// capsula.dev · js/sentry-init.js
// Bootstrap do Sentry (error tracking).
// Carrega só se window.CAPSULA_CONFIG.sentryDsn estiver definido.
//
// Uso: inclua APÓS config.js em todas as páginas:
//   <script src="js/config.js"></script>
//   <script src="js/sentry-init.js"></script>
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';
  var cfg = window.CAPSULA_CONFIG || {};
  var dsn = cfg.sentryDsn;
  if (!dsn || typeof dsn !== 'string' || dsn.trim() === '') return;  // no-op sem DSN

  // Carrega bundle do Sentry só quando há DSN
  var s = document.createElement('script');
  s.src = 'https://browser.sentry-cdn.com/7.119.0/bundle.tracing.min.js';
  s.integrity = 'sha384-rZu69pPOmCbAWY6noj9hSNHZJHE4KW80YWowiNKTJWLsUT8dhyTjlqKGruotLZGH';
  s.crossOrigin = 'anonymous';
  s.async = true;
  s.onload = function () {
    if (!window.Sentry) return;
    var env = (location.hostname.indexOf('vercel.app') >= 0
      || location.hostname === 'localhost'
      || location.hostname === '127.0.0.1')
      ? 'staging' : 'production';

    try {
      Sentry.init({
        dsn: dsn.trim(),
        environment: env,
        release: 'capsula@' + (cfg.releaseTag || 'main'),
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0.5,
        // Filtra ruído de extensões de browser
        ignoreErrors: [
          /Non-Error promise rejection captured/i,
          /ResizeObserver loop/i,
          /chrome-extension:\/\//,
        ],
        beforeSend: function (event) {
          // Não envia eventos do localhost (dev)
          if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return null;
          return event;
        },
      });

      // Adiciona contexto do usuário se disponível
      try {
        var raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user');
        if (raw) {
          var u = JSON.parse(raw);
          Sentry.setUser({ id: u.uid || null, email: u.email || null });
        }
      } catch (_) { /* ignore */ }
    } catch (e) {
      console.warn('[sentry] init failed:', e);
    }
  };
  s.onerror = function () { console.warn('[sentry] CDN load failed'); };
  document.head.appendChild(s);

  // Adiciona o CDN ao CSP via header (não funciona em meta tag depois do parse,
  // mas o navegador permite img-src/script-src dinâmicos via document.head.appendChild
  // se a página já permite cdn de scripts. CSP atual permite cdn.jsdelivr.net + supabase.co,
  // então precisamos adicionar browser.sentry-cdn.com no CSP — feito por página.)
})();

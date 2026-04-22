// ─────────────────────────────────────────────────────────────
// capsula.dev · js/ui.js
// Utilitários de UI compartilhados: toast, loader, feedback.
// Inclua após capsula.css e antes dos scripts de cada página.
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── Toast ────────────────────────────────────────────────────
  // Uso: window.capsulaUI.toast('Salvo!', 'success' | 'error' | 'info')
  function toast(msg, type = 'info') {
    const existing = document.getElementById('_capsula_toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = '_capsula_toast';
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');
    const colors = {
      success: '#4caf87',
      error:   '#e8603a',
      info:    '#7c6af7',
    };
    const color = colors[type] || colors.info;
    el.style.cssText = [
      'position:fixed', 'bottom:1.5rem', 'right:1.5rem',
      'z-index:9999', 'padding:0.75rem 1.25rem',
      'border-radius:10px', 'font-family:Outfit,sans-serif',
      'font-size:0.875rem', 'font-weight:500', 'color:#fff',
      `background:${color}`, 'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
      'opacity:0', 'transform:translateY(12px)',
      'transition:all 0.3s ease', 'max-width:320px',
      'pointer-events:none',
    ].join(';');
    el.textContent = msg;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }

  // ── Loader inline ────────────────────────────────────────────
  // Uso: const stop = window.capsulaUI.loader(buttonEl)
  // Desabilita o botão e mostra spinner; chame stop() para restaurar.
  function loader(btn) {
    if (!btn) return () => {};
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:_spin 0.7s linear infinite;vertical-align:middle;margin-right:6px"></span>Salvando…';

    if (!document.getElementById('_capsula_spin_css')) {
      const s = document.createElement('style');
      s.id = '_capsula_spin_css';
      s.textContent = '@keyframes _spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }

    return function stop(successMsg) {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.innerHTML = original;
      if (successMsg) toast(successMsg, 'success');
    };
  }

  // ── Exporta ──────────────────────────────────────────────────
  window.capsulaUI = { toast, loader };
})();

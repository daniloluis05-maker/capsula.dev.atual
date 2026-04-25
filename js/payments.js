// ─────────────────────────────────────────────────────────────
// capsula.dev · js/payments.js
// Sistema de créditos e checkout via Stripe Payment Links.
// Inclua APÓS config.js e db.js.
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const MATRIX_KEYS = ['disc','soar','ikigai','ancoras','johari','bigfive','pearson','tci'];

  // ── Helpers internos ─────────────────────────────────────────

  function cfg() { return window.CAPSULA_CONFIG || {}; }

  function getUser() {
    try {
      const raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user');
      return raw ? JSON.parse(raw) : null;
    } catch(_) { return null; }
  }

  function saveUser(u) {
    try { localStorage.setItem('capsula_user', JSON.stringify(u)); } catch(_) {}
    try { sessionStorage.setItem('capsula_user', JSON.stringify(u)); } catch(_) {}
  }

  // ── Plano ────────────────────────────────────────────────────

  function isPro() {
    const u = getUser();
    if (!u) return false;
    if (u.plano !== 'profissional') return false;
    if (!u.plano_expira_em) return true; // sem data = ativo
    return new Date(u.plano_expira_em) > new Date();
  }

  // ── Créditos ─────────────────────────────────────────────────

  function getCredits() {
    const u = getUser();
    return (u && u.creditos) ? u.creditos : {};
  }

  // Verifica se usuário pode gerar PDF de uma matriz
  // Pro → sempre pode. Crédito específico ou avulso → pode.
  function hasAccess(matrixKey) {
    if (isPro()) return true;
    const c = getCredits();
    if ((c[matrixKey] || 0) > 0) return true;
    if ((c.avulsos || 0) > 0) return true;
    return false;
  }

  // Debita 1 crédito para a matriz (preferência: crédito específico > avulso)
  // Retorna true se debitado, false se sem crédito
  function deductCredit(matrixKey) {
    if (isPro()) return true; // Pro não debita
    const u = getUser();
    if (!u) return false;
    const c = u.creditos || {};

    if ((c[matrixKey] || 0) > 0) {
      c[matrixKey]--;
      u.creditos = c;
      saveUser(u);
      // Sincroniza com Supabase em background
      if (window.capsulaDB) capsulaDB.syncCreditos(u).catch(() => {});
      return true;
    }
    if ((c.avulsos || 0) > 0) {
      c.avulsos--;
      u.creditos = c;
      saveUser(u);
      if (window.capsulaDB) capsulaDB.syncCreditos(u).catch(() => {});
      return true;
    }
    return false;
  }

  // ── Checkout ─────────────────────────────────────────────────

  function buildCheckoutUrl(linkKey) {
    const c   = cfg();
    const url = c['STRIPE_LINK_' + linkKey.toUpperCase()];
    if (!url) {
      console.warn('[payments] Link não configurado:', linkKey);
      return null;
    }
    const u = getUser();
    const params = new URLSearchParams();
    if (u && u.uid)   params.set('client_reference_id', u.uid);
    if (u && u.email) params.set('prefilled_email', u.email);
    return url + '?' + params.toString();
  }

  function openCheckout(linkKey) {
    // Se não logado → abre modal de cadastro primeiro
    const u = getUser();
    if (!u || !u.uid) {
      const btn = document.querySelector('[data-modal-open]');
      if (btn) btn.click();
      return;
    }
    const url = buildCheckoutUrl(linkKey);
    if (url) window.location.href = url;
  }

  // ── Modal de paywall (exibido quando PDF está bloqueado) ─────

  function showPaywall(matrixKey) {
    // Remove modal existente se houver
    const existing = document.getElementById('_paywall-modal');
    if (existing) existing.remove();

    const names = {
      disc:'DISC', soar:'SOAR', ikigai:'Ikigai', ancoras:'Âncoras de Carreira',
      johari:'Johari', bigfive:'Big Five', pearson:'Pearson-Marr', tci:'TCI', dna:'DNA Estratégico',
    };
    const label = names[matrixKey] || matrixKey;
    const price = matrixKey === 'dna' ? 'R$ 39,90' : 'R$ 25,99';
    const linkKey = matrixKey === 'dna' ? 'DNA' : 'AVALIACAO';
    const credits = getCredits();
    const hasAvulso = (credits.avulsos || 0) > 0;

    const modal = document.createElement('div');
    modal.id = '_paywall-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9500;display:flex;align-items:center;justify-content:center;padding:1rem;';
    modal.innerHTML = `
      <div style="background:#13131a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:2rem;max-width:400px;width:100%;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,0.5);position:relative;">
        <button onclick="document.getElementById('_paywall-modal').remove()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.4rem;cursor:pointer;">×</button>
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(124,106,247,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3 style="margin:0 0 0.4rem;font-size:1.2rem;">PDF bloqueado</h3>
        <p style="font-size:0.88rem;color:rgba(232,232,240,0.6);margin-bottom:1.5rem;">
          Para gerar o PDF de <strong style="color:#e8e8f0">${label}</strong>, você precisa de um crédito para esta matriz.
        </p>
        ${hasAvulso ? `
        <button onclick="window._payments.useAvulsoAndContinue('${matrixKey}')" style="width:100%;padding:0.8rem;background:rgba(124,106,247,0.15);border:1px solid rgba(124,106,247,0.3);border-radius:8px;color:#7c6af7;font-weight:600;font-size:0.9rem;cursor:pointer;margin-bottom:0.75rem;">
          Usar 1 crédito avulso (${credits.avulsos} disponível${credits.avulsos > 1 ? 'is' : ''})
        </button>` : ''}
        <button onclick="window._payments.openCheckout('${linkKey}')" style="width:100%;padding:0.8rem;background:#7c6af7;border:none;border-radius:8px;color:#fff;font-weight:600;font-size:0.9rem;cursor:pointer;margin-bottom:0.75rem;">
          Comprar acesso — ${price}
        </button>
        <button onclick="window._payments.openCheckout('PRO')" style="width:100%;padding:0.8rem;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:rgba(232,232,240,0.6);font-size:0.85rem;cursor:pointer;">
          Plano Profissional — R$ 129,90/mês (ilimitado)
        </button>
      </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  }

  // Usa crédito avulso e continua (chama callback registrado)
  function useAvulsoAndContinue(matrixKey) {
    const modal = document.getElementById('_paywall-modal');
    if (modal) modal.remove();
    const u = getUser();
    if (!u) return;
    const c = u.creditos || {};
    if ((c.avulsos || 0) > 0) {
      c.avulsos--;
      u.creditos = c;
      saveUser(u);
      if (window.capsulaDB) capsulaDB.syncCreditos(u).catch(() => {});
    }
    // Dispara evento para a página saber que pode continuar
    document.dispatchEvent(new CustomEvent('payments:creditUsed', { detail: { matrixKey } }));
  }

  // ── Aplicar créditos recebidos via webhook (chamado pela success page) ──

  function applyCreditsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const produto = params.get('produto');
    if (!produto) return;

    // O webhook já salvou no Supabase — apenas recarrega do servidor
    if (window.capsulaDB) {
      capsulaDB.ensureUserData().then(u => {
        if (u) saveUser(u);
      });
    }
  }

  // ── Badge de plano no dashboard ──────────────────────────────

  function renderPlanBadge(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (isPro()) {
      el.innerHTML = '<span style="display:inline-flex;align-items:center;gap:0.4rem;background:rgba(124,106,247,0.12);border:1px solid rgba(124,106,247,0.25);border-radius:6px;padding:0.25rem 0.7rem;font-size:0.75rem;color:#7c6af7;font-weight:600;">⭐ Profissional</span>';
    } else {
      const c = getCredits();
      const total = (c.avulsos || 0) + Object.values(c).filter((v,k) => k !== 'avulsos' && typeof v === 'number').reduce((a,b) => a+b, 0);
      el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.4rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:0.25rem 0.7rem;font-size:0.75rem;color:rgba(232,232,240,0.5);">Gratuito · ${total} crédito${total !== 1 ? 's' : ''}</span>`;
    }
  }

  // ── Exporta ──────────────────────────────────────────────────

  window._payments = {
    isPro,
    getCredits,
    hasAccess,
    deductCredit,
    openCheckout,
    showPaywall,
    useAvulsoAndContinue,
    applyCreditsFromUrl,
    renderPlanBadge,
    MATRIX_KEYS,
  };

})();

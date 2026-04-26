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

  function isAdmin() {
    return !!(getUser()?.is_admin);
  }

  function isGerencial() {
    const u = getUser();
    if (!u) return false;
    if (u.is_admin) return true;
    if (u.plano !== 'gerencial') return false;
    if (!u.plano_expira_em) return true;
    return new Date(u.plano_expira_em) > new Date();
  }

  // isPro retorna true também para Gerencial (Gerencial inclui tudo do Pro)
  function isPro() {
    const u = getUser();
    if (!u) return false;
    if (u.is_admin) return true;
    if (u.plano !== 'profissional' && u.plano !== 'gerencial') return false;
    if (!u.plano_expira_em) return true;
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

  // Converte 1 avulso em crédito específico da matriz (earmark ao acessar)
  // Retorna true se convertido com sucesso
  async function unlockMatrix(matrixKey) {
    if (isPro()) return true;
    const u = getUser();
    if (!u) return false;
    const c = u.creditos || {};
    if ((c[matrixKey] || 0) > 0) return true; // já earmarked
    if ((c.avulsos || 0) <= 0) return false;   // sem crédito
    c.avulsos--;
    c[matrixKey] = (c[matrixKey] || 0) + 1;
    u.creditos = c;
    saveUser(u);
    if (window.capsulaDB) await capsulaDB.syncCreditos(u).catch(() => {});
    return true;
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

  // ── Checkout (Mercado Pago Checkout Pro) ─────────────────────

  // productKey: 'avaliacao' | 'pacote3' | 'dna' | 'completo' | 'pro'
  // Também aceita chaves em maiúsculas (AVALIACAO, PRO, etc.) para compatibilidade
  async function openCheckout(productKey) {
    const u = getUser();
    if (!u || !u.uid) {
      // Usuário não logado → abre modal de cadastro
      const btn = document.querySelector('[data-modal-open]');
      if (btn) btn.click();
      return;
    }

    const key = productKey.toLowerCase();
    const supabaseUrl = (cfg().supabaseUrl || '').replace(/\/$/, '');
    if (!supabaseUrl) {
      console.error('[payments] supabaseUrl não configurado');
      return;
    }

    // Mostra spinner temporário
    const overlay = document.createElement('div');
    overlay.id = '_mp-loading';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = '<div style="color:#fff;font-size:1rem;font-family:monospace;text-align:center;"><div style="font-size:2rem;margin-bottom:0.75rem;">⏳</div>Abrindo checkout seguro...</div>';
    document.body.appendChild(overlay);

    try {
      const email = (u.email || '').toLowerCase().trim();
      if (!email) throw new Error('Usuário sem email — faça login novamente.');

      const res = await fetch(`${supabaseUrl}/functions/v1/create-mp-preference`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ product_key: key, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      // Em teste usa sandbox_init_point; em produção usa init_point
      const IS_TEST = (cfg().MP_PUBLIC_KEY || '').startsWith('TEST-');
      const url = IS_TEST ? (data.sandbox_init_point || data.init_point) : data.init_point;
      if (!url) throw new Error('URL de checkout não retornada');

      window.location.href = url;
    } catch (err) {
      console.error('[payments] Erro ao criar preferência MP:', err);
      overlay.remove();
      alert('Não foi possível abrir o checkout. Tente novamente em instantes.');
    }
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
          Usar 1 crédito (${credits.avulsos} disponível${credits.avulsos > 1 ? 'is' : ''})
        </button>` : ''}
        <div style="display:grid;gap:0.5rem;margin-bottom:0.75rem;">
          <button onclick="window._payments.openCheckout('credito1')" style="width:100%;padding:0.75rem;background:#7c6af7;border:none;border-radius:8px;color:#fff;font-weight:600;font-size:0.88rem;cursor:pointer;">
            1 Crédito — R$ 29,90
          </button>
          <button onclick="window._payments.openCheckout('credito3')" style="width:100%;padding:0.75rem;background:rgba(124,106,247,0.15);border:1px solid rgba(124,106,247,0.3);border-radius:8px;color:#7c6af7;font-weight:600;font-size:0.88rem;cursor:pointer;">
            3 Créditos — R$ 69,90 <span style="font-size:0.72rem;opacity:0.7">(economize R$19,80)</span>
          </button>
          <button onclick="window._payments.openCheckout('credito8')" style="width:100%;padding:0.75rem;background:rgba(124,106,247,0.15);border:1px solid rgba(124,106,247,0.3);border-radius:8px;color:#7c6af7;font-weight:600;font-size:0.88rem;cursor:pointer;">
            8 Créditos — R$ 129,90 <span style="font-size:0.72rem;opacity:0.7">(economize R$109,30)</span>
          </button>
        </div>
        <button onclick="window._payments.openCheckout('pro')" style="width:100%;padding:0.75rem;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:rgba(232,232,240,0.6);font-size:0.82rem;cursor:pointer;margin-bottom:0.4rem;">
          Plano Profissional — R$149,90/mês · avaliações remotas ilimitadas
        </button>
        <button onclick="window._payments.openCheckout('gerencial')" style="width:100%;padding:0.75rem;background:rgba(46,196,160,0.08);border:1px solid rgba(46,196,160,0.25);border-radius:8px;color:#2EC4A0;font-size:0.82rem;font-weight:600;cursor:pointer;">
          Plano Gerencial — R$179,90/mês · links ilimitados + equipes
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
    if (isGerencial()) {
      el.innerHTML = '<span style="display:inline-flex;align-items:center;gap:0.4rem;background:rgba(46,196,160,0.1);border:1px solid rgba(46,196,160,0.25);border-radius:6px;padding:0.25rem 0.7rem;font-size:0.75rem;color:#2EC4A0;font-weight:600;">◈ Gerencial</span>';
    } else if (isPro()) {
      el.innerHTML = '<span style="display:inline-flex;align-items:center;gap:0.4rem;background:rgba(124,106,247,0.12);border:1px solid rgba(124,106,247,0.25);border-radius:6px;padding:0.25rem 0.7rem;font-size:0.75rem;color:#7c6af7;font-weight:600;">⭐ Profissional</span>';
    } else {
      const c = getCredits();
      const total = (c.avulsos || 0) + Object.entries(c).filter(([k]) => k !== 'avulsos').reduce((s,[,v]) => s + (typeof v === 'number' ? v : 0), 0);
      el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.4rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:0.25rem 0.7rem;font-size:0.75rem;color:rgba(232,232,240,0.5);">Gratuito · ${total} crédito${total !== 1 ? 's' : ''}</span>`;
    }
  }

  // ── Exporta ──────────────────────────────────────────────────

  window._payments = {
    isAdmin,
    isPro,
    isGerencial,
    getCredits,
    hasAccess,
    deductCredit,
    unlockMatrix,
    openCheckout,
    showPaywall,
    useAvulsoAndContinue,
    applyCreditsFromUrl,
    renderPlanBadge,
    MATRIX_KEYS,
  };

})();

// ─────────────────────────────────────────────────────────────
// capsula.dev · js/remote-link.js
// Modo de avaliação remota: detecta ?token=, valida, exibe
// formulário de identificação e envia resultado ao avaliador Pro.
// Inclua APÓS payments.js nas páginas de matriz.
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const PARAMS = new URLSearchParams(window.location.search);
  const TOKEN  = PARAMS.get('token');
  if (!TOKEN) return; // sessão normal, sem token

  const MATRIX_NAMES = {
    disc: 'DISC', soar: 'SOAR', ikigai: 'Ikigai',
    ancoras: 'Âncoras de Carreira', johari: 'Janela de Johari',
    bigfive: 'Big Five', pearson: 'Pearson-Marr', tci: 'TCI',
  };

  let _linkData    = null;
  let _respondente = null;

  // ── 1. Patches síncronos — rodam ANTES do DOMContentLoaded ───
  // Necessário para que o init() das páginas não redirecione por
  // falta de usuário autenticado ou de créditos.

  if (window._payments) {
    // Respondente em modo remoto: usamos um "Pro virtual" (isPro=true) só para
    // bypassar a proteção de rota que ancoras/bigfive/ikigai/johari/pearson/soar
    // checam no DOMContentLoaded — caso contrário, o respondente cai num paywall
    // antes mesmo de ver o teste. Os PDFs continuam bloqueados pelos overrides
    // de window.generatePDF / _generatePDF / _generatePDFDisc (em onStart abaixo)
    // que mostram a CTA de criação de conta em vez de gerar.
    window._payments.isPro      = () => true;
    window._payments.isAdmin    = () => false;
    window._payments.hasAccess  = () => true;
  }
  if (window.capsulaDB) {
    window.capsulaDB.ensureUserData = async () => ({
      email: 'remote@respondent.local', nome: 'Respondente',
      creditos: {}, plano: 'free',
    });
  }

  // ── 2. Overlay de carregamento — exibido imediatamente ────────

  const _overlay = document.createElement('div');
  _overlay.id = '_rl-overlay';
  _overlay.style.cssText = [
    'position:fixed;inset:0;z-index:99999;',
    'background:rgba(7,8,12,0.97);',
    'display:flex;align-items:center;justify-content:center;padding:1rem;',
    'font-family:system-ui,sans-serif;',
  ].join('');
  _overlay.innerHTML = '<div style="color:rgba(232,232,240,0.4);font-size:0.9rem;text-align:center;">'
    + '<div style="font-size:2rem;margin-bottom:1rem;animation:spin 1.2s linear infinite;">⏳</div>'
    + 'Verificando link de avaliação...</div>';
  document.body.appendChild(_overlay);

  // ── 3. Tela de erro ───────────────────────────────────────────

  function showError(msg) {
    _overlay.innerHTML = [
      '<div style="text-align:center;color:#e8e8f0;max-width:380px;">',
      '<div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>',
      `<h2 style="margin:0 0 0.5rem;font-size:1.1rem;">${msg}</h2>`,
      '<p style="color:rgba(232,232,240,0.4);font-size:0.85rem;margin-top:0.5rem;">',
      'Solicite um novo link ao avaliador.</p></div>',
    ].join('');
  }

  // ── 4. Formulário de identificação ───────────────────────────

  function showIdentificationForm(linkData) {
    _linkData = linkData;
    const nome = MATRIX_NAMES[linkData.matriz] || linkData.matriz;
    const slots = linkData.max_completions - linkData.completion_count;

    _overlay.innerHTML = [
      '<div style="background:#13131a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;',
      'padding:2rem;max-width:420px;width:100%;text-align:center;">',

      // ícone
      '<div style="width:52px;height:52px;border-radius:50%;background:rgba(124,106,247,0.12);',
      'display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">',
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">',
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>',
      '<polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>',
      '<line x1="16" y1="17" x2="8" y2="17"/></svg></div>',

      `<h2 style="margin:0 0 0.4rem;font-size:1.2rem;color:#e8e8f0;">Avaliação: ${nome}</h2>`,
      linkData.etiqueta
        ? `<p style="font-size:0.75rem;color:rgba(232,232,240,0.3);margin:0 0 0.6rem;font-family:monospace;">${linkData.etiqueta}</p>`
        : '',
      '<p style="color:rgba(232,232,240,0.5);font-size:0.85rem;margin-bottom:1.75rem;line-height:1.55;">',
      'Preencha seus dados para iniciar. Ao concluir,<br>seus resultados serão enviados ao avaliador.</p>',

      // inputs
      '<div style="text-align:left;display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.25rem;">',
      '<div>',
      '<label style="display:block;font-size:0.72rem;color:rgba(232,232,240,0.4);margin-bottom:0.3rem;',
      'text-transform:uppercase;letter-spacing:0.06em;">Nome completo *</label>',
      '<input id="_rl-nome" type="text" autocomplete="name" placeholder="Seu nome completo"',
      ' style="width:100%;padding:0.7rem 1rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);',
      'border-radius:8px;color:#e8e8f0;font-size:0.9rem;box-sizing:border-box;outline:none;"',
      ' onfocus="this.style.borderColor=\'rgba(124,106,247,0.55)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.1)\'">',
      '</div><div>',
      '<label style="display:block;font-size:0.72rem;color:rgba(232,232,240,0.4);margin-bottom:0.3rem;',
      'text-transform:uppercase;letter-spacing:0.06em;">E-mail *</label>',
      '<input id="_rl-email" type="email" autocomplete="email" placeholder="seu@email.com"',
      ' style="width:100%;padding:0.7rem 1rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);',
      'border-radius:8px;color:#e8e8f0;font-size:0.9rem;box-sizing:border-box;outline:none;"',
      ' onfocus="this.style.borderColor=\'rgba(124,106,247,0.55)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.1)\'">',
      '</div></div>',

      '<p id="_rl-err" style="color:#ff6b6b;font-size:0.82rem;min-height:1.1em;margin-bottom:0.75rem;text-align:left;"></p>',

      '<button id="_rl-start"',
      ' style="width:100%;padding:0.9rem;background:#7c6af7;border:none;border-radius:10px;',
      'color:#fff;font-weight:700;font-size:0.95rem;cursor:pointer;transition:opacity 0.2s;"',
      ' onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\'">',
      'Iniciar Avaliação →</button>',

      `<p style="font-size:0.7rem;color:rgba(232,232,240,0.2);margin-top:0.9rem;">${slots} vaga${slots!==1?'s':''} restante${slots!==1?'s':''} neste link</p>`,
      '</div>',
    ].join('');

    document.getElementById('_rl-start').addEventListener('click', onStart);

    // Enter para confirmar
    _overlay.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') document.getElementById('_rl-start')?.click();
    });

    setTimeout(() => document.getElementById('_rl-nome')?.focus(), 100);
  }

  function onStart() {
    const nome  = (document.getElementById('_rl-nome')?.value  || '').trim();
    const email = (document.getElementById('_rl-email')?.value || '').trim();
    const err   = document.getElementById('_rl-err');

    if (!nome) { if (err) err.textContent = 'Informe seu nome.'; return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (err) err.textContent = 'Informe um e-mail válido.'; return;
    }

    _respondente = { nome, email };

    // Atualiza mock com dados reais do respondente
    if (window.capsulaDB) {
      window.capsulaDB.ensureUserData = async () => ({
        email: _respondente.email, nome: _respondente.nome,
        creditos: {}, plano: 'free',
      });
    }

    // Intercepta geração de PDF — respondente remoto não paga, mas pode criar conta
    window.generatePDF     = showPdfCta;
    window._generatePDF    = showPdfCta; // nome usado pela maioria das matrizes
    window._generatePDFDisc = showPdfCta; // nome específico do DISC

    _overlay.remove();
    watchForResult();
  }

  // ── CTA para criação de conta ao tentar gerar PDF ─────────────

  function showPdfCta() {
    const existing = document.getElementById('_rl-pdf-cta');
    if (existing) { existing.style.display = 'flex'; return; }

    const modal = document.createElement('div');
    modal.id = '_rl-pdf-cta';
    modal.style.cssText = [
      'position:fixed;inset:0;z-index:99998;',
      'background:rgba(0,0,0,0.75);',
      'display:flex;align-items:center;justify-content:center;padding:1rem;',
    ].join('');
    modal.innerHTML = [
      '<div style="background:#13131a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;',
      'padding:2rem;max-width:400px;width:100%;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,0.5);position:relative;">',
      '<button onclick="document.getElementById(\'_rl-pdf-cta\').style.display=\'none\'" ',
      'style="position:absolute;top:1rem;right:1rem;background:none;border:none;',
      'color:rgba(255,255,255,0.4);font-size:1.4rem;cursor:pointer;line-height:1;">×</button>',

      '<div style="width:52px;height:52px;border-radius:50%;background:rgba(124,106,247,0.12);',
      'display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">',
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" stroke-width="1.75" ',
      'stroke-linecap="round" stroke-linejoin="round">',
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>',
      '<polyline points="14 2 14 8 20 8"/>',
      '<line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      '</svg></div>',

      '<h3 style="margin:0 0 0.5rem;font-size:1.15rem;color:#e8e8f0;">Quer seu PDF completo?</h3>',
      '<p style="font-size:0.88rem;color:rgba(232,232,240,0.55);line-height:1.6;margin-bottom:1.75rem;">',
      'Crie uma conta gratuita no Sistema Gnosis e adquira acesso ao relatório completo em PDF.',
      '</p>',

      '<a href="convite.html" ',
      'style="display:block;width:100%;padding:0.85rem;background:#7c6af7;border:none;border-radius:8px;',
      'color:#fff;font-weight:700;font-size:0.95rem;cursor:pointer;text-decoration:none;',
      'box-sizing:border-box;transition:opacity 0.2s;"',
      ' onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\'">',
      'Criar conta gratuita →</a>',

      '<p style="font-size:0.75rem;color:rgba(232,232,240,0.25);margin-top:1rem;">',
      'Não é necessário cartão de crédito para criar a conta.</p>',
      '</div>',
    ].join('');

    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.style.display = 'none';
    });
    document.body.appendChild(modal);
  }

  // ── 5. Observa a página de resultado ─────────────────────────
  // As matrizes usam showPage('page-result') que adiciona a classe
  // 'active' ao div#page-result.

  function watchForResult() {
    const resultPage = document.getElementById('page-result');
    if (resultPage) {
      // Já está ativo?
      if (resultPage.classList.contains('active')) {
        injectSubmitButton(resultPage); return;
      }
      new MutationObserver(function(_, obs) {
        if (resultPage.classList.contains('active') && !document.getElementById('_rl-submit-btn')) {
          injectSubmitButton(resultPage);
          obs.disconnect();
        }
      }).observe(resultPage, { attributes: true, attributeFilter: ['class'] });
    } else {
      // Fallback para matrizes com estrutura diferente
      new MutationObserver(function() {
        const el = document.querySelector('.result-page, [id*="result"].active, [id*="result"][style*="flex"]');
        if (el && !document.getElementById('_rl-submit-btn')) injectSubmitButton(el);
      }).observe(document.body, { childList: true, subtree: true, attributes: true });
    }
  }

  function injectSubmitButton(container) {
    // Esconde todos os botões de PDF — respondente remoto não pode gerar PDF
    document.querySelectorAll(
      'button[onclick*="generatePDF"], button[onclick*="_generatePDF"]'
    ).forEach(b => { b.style.display = 'none'; });

    // Substitui qualquer botão/link que vai pro dashboard por CTA "Criar conta".
    // .btn-dashboard cobre 7 matrizes (anchor) + DISC (button onclick). swot.html
    // usa class="btn-green" com onclick — pegamos via [onclick*="dashboard"].
    // Anchors com href dashboard fora do .btn-dashboard já são escondidos no
    // init() (top-nav, intro back-link, logo).
    document.querySelectorAll(
      '.btn-dashboard, button[onclick*="dashboard"], a[href*="dashboard.html"]'
    ).forEach(function(btn) {
      // Pula se está em área de result-actions ou intro? Não — substituir tudo
      // que aponta pra dashboard com texto de "Criar conta" mantém UX consistente.
      if (btn.tagName === 'A') {
        btn.setAttribute('href', 'convite.html');
        // Força exibir caso o init() tenha escondido (queremos o CTA visível na result page)
        if (btn.closest('.result-actions, [class*="actions"]')) {
          btn.style.display = '';
        }
      } else {
        btn.setAttribute('onclick', "window.location.href='convite.html'");
      }
      btn.textContent = '✨ Criar conta gratuita';
    });

    const btn = document.createElement('button');
    btn.id = '_rl-submit-btn';
    btn.textContent = '✓ Enviar Resultado ao Avaliador';
    btn.style.cssText = [
      'padding:0.75rem 1.5rem;background:#7c6af7;border:none;border-radius:8px;',
      'color:#fff;font-weight:700;font-size:0.88rem;cursor:pointer;',
      'transition:opacity 0.2s;min-width:220px;',
    ].join('');
    btn.onmouseover = () => { btn.style.opacity = '0.85'; };
    btn.onmouseout  = () => { btn.style.opacity = '1'; };
    btn.addEventListener('click', submitResult);

    const actions = container.querySelector('.result-actions, [class*="actions"]');
    if (actions) {
      actions.insertBefore(btn, actions.firstChild);
    } else {
      const pdfBtn = container.querySelector('button[onclick*="generatePDF"], button[onclick*="_generatePDF"]');
      if (pdfBtn) pdfBtn.parentNode.insertBefore(btn, pdfBtn);
      else container.appendChild(btn);
    }

    // CTA sutil para criar conta
    const cta = document.createElement('p');
    cta.style.cssText = 'font-size:0.72rem;color:rgba(232,232,240,0.3);margin-top:0.75rem;text-align:center;';
    cta.innerHTML = '<a href="convite.html" style="color:rgba(124,106,247,0.6);text-decoration:none;" onmouseover="this.style.color=\'#7c6af7\'" onmouseout="this.style.color=\'rgba(124,106,247,0.6)\'">Crie uma conta gratuita</a> para acessar o PDF completo.';
    btn.parentNode.insertBefore(cta, btn.nextSibling);
  }

  // ── 6. Envio do resultado ─────────────────────────────────────

  async function submitResult() {
    const btn = document.getElementById('_rl-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; btn.style.opacity = '0.6'; }

    const resultPage = document.getElementById('page-result') || document.body;
    const inner = resultPage.querySelector('.result-page') || resultPage;
    const resultado = {
      matriz:    _linkData?.matriz,
      texto:     (inner.innerText  || '').substring(0, 4000),
      html:      (inner.innerHTML  || '').substring(0, 8000),
      timestamp: new Date().toISOString(),
    };

    if (!window.capsulaDB?.saveRemoteResult) {
      alert('Erro ao enviar. Recarregue e tente novamente.');
      if (btn) { btn.disabled = false; btn.textContent = '✓ Enviar Resultado ao Avaliador'; btn.style.opacity = '1'; }
      return;
    }

    const { error } = await capsulaDB.saveRemoteResult({
      token:    TOKEN,
      nome:     _respondente.nome,
      email:    _respondente.email,
      resultado,
    });

    if (error) {
      console.error('[remote-link] saveRemoteResult:', error);
      alert('Não foi possível enviar. Verifique sua conexão e tente novamente.');
      if (btn) { btn.disabled = false; btn.textContent = '✓ Enviar Resultado ao Avaliador'; btn.style.opacity = '1'; }
      return;
    }

    if (btn) btn.remove();

    const ok = document.createElement('div');
    ok.style.cssText = [
      'margin-top:0.75rem;padding:0.9rem 1.25rem;',
      'background:rgba(46,196,160,0.1);border:1px solid rgba(46,196,160,0.25);',
      'border-radius:8px;color:#2EC4A0;text-align:center;',
      'font-weight:600;font-size:0.9rem;',
    ].join('');
    ok.textContent = '✓ Resultado enviado com sucesso!';

    const actions = document.querySelector('#page-result .result-actions, .result-actions');
    if (actions) actions.insertBefore(ok, actions.firstChild);
    else document.getElementById('page-result')?.appendChild(ok);
  }

  // ── 7. Bootstrap ──────────────────────────────────────────────

  async function init() {
    try {
      // Esconde links que mandariam o respondente pro dashboard pessoal
      // (top-nav, intro back-link, side nav) — respondente remoto não tem
      // conta, então clicar geraria UX morto. .btn-dashboard da result-page
      // é tratado em injectSubmitButton (substitui por "Criar conta").
      document.querySelectorAll('a[href*="dashboard"]:not(.btn-dashboard)').forEach(function(a) {
        a.style.display = 'none';
      });

      if (!window.capsulaDB) { showError('Erro ao conectar ao servidor.'); return; }

      const linkData = await capsulaDB.getRemoteLinkByToken(TOKEN);
      if (!linkData) { showError('Link inválido ou não encontrado.'); return; }
      if (linkData.completion_count >= linkData.max_completions) {
        showError('Este link atingiu o limite de avaliações.'); return;
      }
      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        showError('Este link expirou.'); return;
      }

      // Redireciona se estiver na página errada
      const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
      if (linkData.matriz && linkData.matriz !== currentPage) {
        window.location.href = `${linkData.matriz}.html?token=${TOKEN}`;
        return;
      }

      showIdentificationForm(linkData);
    } catch (e) {
      console.error('[remote-link] init:', e);
      showError('Erro inesperado. Tente novamente.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

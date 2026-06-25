// ══════════════════════════════════════
// AVALIAÇÃO PRESENCIAL (Plano Pro / Gerencial)
// ──────────────────────────────────────
// Permite ao admin abrir uma sessão presencial onde o respondente faz
// a avaliação no próprio computador do admin (modo quiosque). Reusa
// remote_links e remote_results sob o capô — não precisa de migration.
// A sessão é identificada pela etiqueta começando com "Presencial · ".
// ══════════════════════════════════════
const _PR_NOMES = {
  disc:'DISC', soar:'SOAR', ikigai:'Ikigai', ancoras:'Âncoras de Carreira',
  johari:'Janela de Johari', bigfive:'Big Five', pearson:'Pearson-Marr',
  tci:'TCI', eneagrama:'Eneagrama',
};
const _PR_TAG = 'Presencial · ';
let _prAdminEmail = '';
let _prSessoes = [];

function presencialInit(email) {
  _prAdminEmail = email || '';
  const sec = document.getElementById('presencial-section');
  if (!sec) return;
  sec.style.display = 'block';
  presencialCarregarLista();
}

async function presencialCarregarLista(force) {
  if (!_prAdminEmail) return;
  const lista = document.getElementById('pr-lista');
  if (!lista) return;

  if (force) lista.innerHTML = '<div class="pr-empty">Carregando...</div>';

  try {
    // Reusa o endpoint existente — filtramos no cliente pra não criar RPC nova
    const links = await capsulaDB.getMyRemoteLinks(_prAdminEmail);
    _prSessoes = (links || []).filter(l => (l.etiqueta || '').startsWith(_PR_TAG));
  } catch (e) {
    console.warn('[presencial] carregar:', e);
    _prSessoes = [];
  }

  if (!_prSessoes.length) {
    lista.innerHTML = '<div class="pr-empty">Nenhuma sessão presencial realizada ainda.<br><span class="pr-empty-hint">Clique em <strong>Iniciar sessão presencial</strong> para começar.</span></div>';
    return;
  }

  const fmt = (iso) => {
    if (!iso) return '—';
    try { const d = new Date(iso); return d.toLocaleString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }); }
    catch (_) { return iso; }
  };

  // Ordena: pendentes primeiro, depois mais recente
  _prSessoes.sort((a, b) => {
    const aD = (a.completion_count || 0) > 0 ? 1 : 0;
    const bD = (b.completion_count || 0) > 0 ? 1 : 0;
    if (aD !== bD) return aD - bD;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  lista.innerHTML = _prSessoes.map(s => {
    const nome = (s.etiqueta || '').replace(_PR_TAG, '') || '(sem nome)';
    const matriz = _PR_NOMES[s.matriz] || s.matriz;
    const respondeu = (s.completion_count || 0) > 0;
    return [
      '<div class="pr-card ' + (respondeu ? 'pr-done' : 'pr-pending') + '">',
      '<div class="pr-card-main">',
      '<div class="pr-card-nome">' + _escape(nome) + '</div>',
      '<div class="pr-card-meta">',
      '<span class="pr-card-matriz">' + matriz + '</span>',
      '<span class="pr-card-dot">•</span>',
      '<span class="pr-card-data">Iniciada ' + fmt(s.created_at) + '</span>',
      '</div></div>',
      '<div class="pr-card-status">',
      respondeu
        ? '<span class="pr-pill pr-pill-done">✓ Concluída</span>'
        : '<span class="pr-pill pr-pill-pend">Aguardando</span>',
      '</div></div>',
    ].join('');
  }).join('');
}

function _escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function presencialAbrirModal() {
  const m = document.getElementById('pr-modal');
  if (!m) return;
  // Gera PIN sugerido (4 dígitos)
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  document.getElementById('pr-f-pin').value = pin;
  document.getElementById('pr-f-nome').value = '';
  document.getElementById('pr-f-email').value = '';
  document.getElementById('pr-f-matriz').value = 'disc';
  document.getElementById('pr-f-err').textContent = '';
  m.style.display = 'flex';
  setTimeout(() => document.getElementById('pr-f-nome').focus(), 50);
}

function presencialFecharModal() {
  const m = document.getElementById('pr-modal');
  if (m) m.style.display = 'none';
}

async function presencialConfirmar() {
  const nome   = (document.getElementById('pr-f-nome').value || '').trim();
  const email  = (document.getElementById('pr-f-email').value || '').trim();
  const matriz = document.getElementById('pr-f-matriz').value;
  const pin    = (document.getElementById('pr-f-pin').value || '').replace(/\D/g,'').slice(0,4);
  const err    = document.getElementById('pr-f-err');
  err.textContent = '';

  if (!nome) { err.textContent = 'Informe o nome do respondente.'; return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    err.textContent = 'Email inválido (deixe em branco se não tiver).'; return;
  }
  if (!pin || pin.length !== 4) {
    err.textContent = 'PIN precisa ter 4 dígitos numéricos.'; return;
  }

  const btn = document.getElementById('pr-f-ok');
  btn.disabled = true; btn.textContent = 'Criando sessão...';

  try {
    const { error, token } = await capsulaDB.createRemoteLink({
      pro_email: _prAdminEmail,
      matriz,
      etiqueta: _PR_TAG + nome,
      max_completions: 1, // sessão presencial = 1 respondente
    });
    if (error || !token) {
      err.textContent = 'Não foi possível criar a sessão. Tente novamente.';
      console.warn('[presencial] createRemoteLink error:', error);
      return;
    }
    const url = matriz + '.html'
      + '?token=' + encodeURIComponent(token)
      + '&presencial=1'
      + '&pin=' + pin
      + '&nome=' + encodeURIComponent(nome)
      + (email ? '&email=' + encodeURIComponent(email) : '');

    presencialFecharModal();
    // Abre em nova aba pro admin não perder o dashboard
    window.open(url, '_blank');
    // Atualiza lista assim que a sessão aparece no banco
    setTimeout(() => presencialCarregarLista(true), 600);
  } catch (e) {
    err.textContent = 'Erro inesperado: ' + (e.message || e);
    console.warn('[presencial] confirmar:', e);
  } finally {
    btn.disabled = false; btn.textContent = 'Iniciar avaliação →';
  }
}

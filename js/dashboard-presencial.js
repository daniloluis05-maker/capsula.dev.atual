// ══════════════════════════════════════
// AVALIAÇÃO PRESENCIAL (Plano Pro / Gerencial)
// ──────────────────────────────────────
// Permite ao admin abrir uma sessão presencial onde o respondente faz
// a avaliação no próprio computador do admin (modo quiosque). Reusa
// remote_links e remote_results sob o capô — não precisa de migration.
// A sessão é identificada pela etiqueta começando com "Presencial · ".
//
// Features:
//   - Busca por nome (filtro local)
//   - Repetir sessão (pré-preenche modal com mesmo nome/email/matriz)
//   - Vincular à equipe (cria entrada em equipe_membros ao concluir)
//   - Fullscreen opt-in (mais imersivo, harder to exit)
// ══════════════════════════════════════
const _PR_NOMES = {
  disc:'DISC', soar:'SOAR', ikigai:'Ikigai', ancoras:'Âncoras de Carreira',
  johari:'Janela de Johari', bigfive:'Big Five', pearson:'Pearson-Marr',
  tci:'TCI', eneagrama:'Eneagrama',
};
const _PR_TAG = 'Presencial · ';
const _PR_PENDING_LINKS_KEY = 'gnosis_pres_pending_links'; // mapa token -> equipe_id
let _prAdminEmail = '';
let _prSessoes = [];
let _prEquipes = [];
let _prFilter = '';

function presencialInit(email) {
  _prAdminEmail = email || '';
  const sec = document.getElementById('presencial-section');
  if (!sec) return;
  sec.style.display = 'block';
  // Wire busca uma única vez
  const search = document.getElementById('pr-search');
  if (search && !search.dataset.wired) {
    search.dataset.wired = '1';
    search.addEventListener('input', () => {
      _prFilter = (search.value || '').trim().toLowerCase();
      _prRenderLista();
    });
  }
  presencialCarregarLista();
}

async function presencialCarregarLista(force) {
  if (!_prAdminEmail) return;
  const lista = document.getElementById('pr-lista');
  if (!lista) return;

  if (force) lista.innerHTML = '<div class="pr-empty">Carregando...</div>';

  try {
    // Carrega em paralelo: sessões + equipes ativas
    const [links, equipes] = await Promise.all([
      capsulaDB.getMyRemoteLinks(_prAdminEmail),
      typeof capsulaDB.getEquipes === 'function'
        ? capsulaDB.getEquipes(_prAdminEmail).catch(() => [])
        : Promise.resolve([]),
    ]);
    _prSessoes = (links || []).filter(l => (l.etiqueta || '').startsWith(_PR_TAG));
    _prEquipes = equipes || [];
  } catch (e) {
    console.warn('[presencial] carregar:', e);
    _prSessoes = []; _prEquipes = [];
  }

  // Vincula automaticamente sessões recém-concluídas às equipes pendentes
  try { await _prProcessPendingLinks(); } catch (e) { console.warn('[presencial] vincular:', e); }

  _prPopulateEquipesSelect();
  _prRenderLista();
}

function _prRenderLista() {
  const lista = document.getElementById('pr-lista');
  if (!lista) return;

  if (!_prSessoes.length) {
    lista.innerHTML = '<div class="pr-empty">Nenhuma sessão presencial realizada ainda.<br><span class="pr-empty-hint">Clique em <strong>Iniciar sessão presencial</strong> para começar.</span></div>';
    return;
  }

  // Filtra por busca
  const filtered = _prFilter
    ? _prSessoes.filter(s => {
        const nome = (s.etiqueta || '').replace(_PR_TAG, '').toLowerCase();
        const mat  = (s.matriz || '').toLowerCase();
        return nome.includes(_prFilter) || mat.includes(_prFilter);
      })
    : _prSessoes;

  if (!filtered.length) {
    lista.innerHTML = '<div class="pr-empty">Nenhuma sessão corresponde a "' + _escape(_prFilter) + '".</div>';
    return;
  }

  const fmt = (iso) => {
    if (!iso) return '—';
    try { const d = new Date(iso); return d.toLocaleString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }); }
    catch (_) { return iso; }
  };

  // Ordena: pendentes primeiro, depois mais recente
  filtered.sort((a, b) => {
    const aD = (a.completion_count || 0) > 0 ? 1 : 0;
    const bD = (b.completion_count || 0) > 0 ? 1 : 0;
    if (aD !== bD) return aD - bD;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  lista.innerHTML = filtered.map(s => {
    const nome = (s.etiqueta || '').replace(_PR_TAG, '') || '(sem nome)';
    const matriz = _PR_NOMES[s.matriz] || s.matriz;
    const respondeu = (s.completion_count || 0) > 0;
    const safeNome = _escape(nome);
    return [
      '<div class="pr-card ' + (respondeu ? 'pr-done' : 'pr-pending') + '">',
      '<div class="pr-card-main">',
      '<div class="pr-card-nome">' + safeNome + '</div>',
      '<div class="pr-card-meta">',
      '<span class="pr-card-matriz">' + matriz + '</span>',
      '<span class="pr-card-dot">•</span>',
      '<span class="pr-card-data">Iniciada ' + fmt(s.created_at) + '</span>',
      '</div></div>',
      '<div class="pr-card-actions">',
      respondeu
        ? '<span class="pr-pill pr-pill-done">✓ Concluída</span>'
        : '<span class="pr-pill pr-pill-pend">Aguardando</span>',
      '<button class="pr-icon-btn" title="Repetir avaliação" onclick="presencialRepetir(\'' + s.token + '\')">↺</button>',
      '</div></div>',
    ].join('');
  }).join('');
}

function _prPopulateEquipesSelect() {
  const sel = document.getElementById('pr-f-equipe');
  if (!sel) return;
  // Preserva seleção atual
  const cur = sel.value;
  if (!_prEquipes.length) {
    sel.innerHTML = '<option value="">— Sem equipes ativas —</option>';
    sel.disabled = true;
    return;
  }
  sel.disabled = false;
  const opts = ['<option value="">— Não vincular —</option>']
    .concat(_prEquipes.map(e => '<option value="' + e.id + '">' + _escape(e.nome) + '</option>'));
  sel.innerHTML = opts.join('');
  if (cur && _prEquipes.some(e => e.id === cur)) sel.value = cur;
}

function _escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── Modal de criação ─────────────────────────────────────────

function presencialAbrirModal(prefill) {
  const m = document.getElementById('pr-modal');
  if (!m) return;
  prefill = prefill || {};
  document.getElementById('pr-f-pin').value    = String(Math.floor(1000 + Math.random() * 9000));
  document.getElementById('pr-f-nome').value   = prefill.nome   || '';
  document.getElementById('pr-f-email').value  = prefill.email  || '';
  document.getElementById('pr-f-matriz').value = prefill.matriz || 'disc';
  const fsEl = document.getElementById('pr-f-fs');
  if (fsEl) fsEl.checked = false;
  const eqEl = document.getElementById('pr-f-equipe');
  if (eqEl) eqEl.value = '';
  document.getElementById('pr-f-err').textContent = '';
  m.style.display = 'flex';
  setTimeout(() => document.getElementById('pr-f-nome').focus(), 50);
}

function presencialFecharModal() {
  const m = document.getElementById('pr-modal');
  if (m) m.style.display = 'none';
}

function presencialRepetir(token) {
  const s = _prSessoes.find(x => x.token === token);
  if (!s) return;
  const nome = (s.etiqueta || '').replace(_PR_TAG, '');
  // Email do respondente original não está em remote_links; abre só com o nome
  // e a matriz pré-selecionados. Admin preenche email se quiser vincular.
  presencialAbrirModal({ nome, matriz: s.matriz });
}

async function presencialConfirmar() {
  const nome      = (document.getElementById('pr-f-nome').value || '').trim();
  const email     = (document.getElementById('pr-f-email').value || '').trim();
  const matriz    = document.getElementById('pr-f-matriz').value;
  const pin       = (document.getElementById('pr-f-pin').value || '').replace(/\D/g,'').slice(0,4);
  const fs        = !!document.getElementById('pr-f-fs')?.checked;
  const equipeId  = document.getElementById('pr-f-equipe')?.value || '';
  const err       = document.getElementById('pr-f-err');
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
      max_completions: 1,
    });
    if (error || !token) {
      err.textContent = 'Não foi possível criar a sessão. Tente novamente.';
      console.warn('[presencial] createRemoteLink error:', error);
      return;
    }

    // Se admin escolheu vincular a equipe, guarda o pareamento localmente.
    // Quando a sessão concluir e o admin voltar pro dashboard, a próxima
    // carga da lista detecta e cria a entrada em equipe_membros.
    if (equipeId) _prStorePendingLink(token, { equipeId, nome, email, matriz });

    const url = matriz + '.html'
      + '?token=' + encodeURIComponent(token)
      + '&presencial=1'
      + '&pin=' + pin
      + (fs ? '&fs=1' : '')
      + '&nome=' + encodeURIComponent(nome)
      + (email ? '&email=' + encodeURIComponent(email) : '');

    presencialFecharModal();
    window.open(url, '_blank');
    setTimeout(() => presencialCarregarLista(true), 600);
  } catch (e) {
    err.textContent = 'Erro inesperado: ' + (e.message || e);
    console.warn('[presencial] confirmar:', e);
  } finally {
    btn.disabled = false; btn.textContent = 'Iniciar avaliação →';
  }
}

// ── Vínculo automático com equipe ────────────────────────────
// Estratégia: ao iniciar sessão com equipe escolhida, guarda
// { equipeId, nome, email, matriz } em localStorage com key=token.
// Quando lista carrega e detecta completion_count>0 pra um token
// pendente, busca o resultado, cria membro, remove da pendência.

function _prGetPendingLinks() {
  try { return JSON.parse(localStorage.getItem(_PR_PENDING_LINKS_KEY) || '{}'); }
  catch (_) { return {}; }
}

function _prSetPendingLinks(obj) {
  try { localStorage.setItem(_PR_PENDING_LINKS_KEY, JSON.stringify(obj)); } catch (_) {}
}

function _prStorePendingLink(token, payload) {
  const all = _prGetPendingLinks();
  all[token] = payload;
  _prSetPendingLinks(all);
}

async function _prProcessPendingLinks() {
  const pending = _prGetPendingLinks();
  const tokens = Object.keys(pending);
  if (!tokens.length) return;

  // Sessões concluídas que têm vínculo pendente
  const done = _prSessoes.filter(s => (s.completion_count || 0) > 0 && pending[s.token]);
  if (!done.length) return;

  for (const s of done) {
    const link = pending[s.token];
    // Verifica se a equipe ainda existe e está ativa
    const eq = _prEquipes.find(e => e.id === link.equipeId);
    if (!eq) { delete pending[s.token]; continue; }

    try {
      // Busca o resultado completo pra salvar como snapshot no membro
      const results = await capsulaDB.getRemoteResults(s.token);
      const result = (results && results[0]) || null;
      if (!result) continue; // ainda não chegou, tenta na próxima carga

      const { error } = await capsulaDB.addMembroEquipe({
        equipe_id: link.equipeId,
        remote_result_id: result.id,
        nome: link.nome,
        email: link.email || null,
        resultado: result.resultado || null,
        matriz: link.matriz,
      });
      // 23505 = unique violation (já adicionado) → trata como sucesso
      if (!error || (error.code === '23505')) {
        delete pending[s.token];
      } else {
        console.warn('[presencial] addMembroEquipe:', error);
      }
    } catch (e) {
      console.warn('[presencial] vincular sessão', s.token, e);
    }
  }
  _prSetPendingLinks(pending);
}

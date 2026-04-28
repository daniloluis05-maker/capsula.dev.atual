'use strict';

let _user = null;
let _equipeId = '';
let _equipe = null;
let _itens5w2h = [];
let _objetivos = [];
let _raci = { atividades: [], atribuicoes: [] };
let _swot = [];
let _dna = null;
let _cicloAtual = '';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function cicloAtualPadrao() {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${q}`;
}

function gerarCiclos() {
  const now = new Date();
  const ciclos = [];
  for (let i = -2; i <= 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i * 3, 1);
    const q = Math.floor(d.getMonth() / 3) + 1;
    ciclos.push(`${d.getFullYear()}-Q${q}`);
  }
  return [...new Set(ciclos)];
}

async function init() {
  _user = await capsulaDB.ensureUserData();
  if (!_user) { window.location.href = 'index.html'; return; }
  if (!(_payments.isGerencial() || _payments.isAdmin())) {
    document.getElementById('loading').innerHTML =
      '<h2 style="margin-bottom:0.75rem;">Acesso restrito</h2><p style="color:var(--muted);">Disponível apenas no Plano Gerencial.</p><p style="margin-top:1rem;"><a href="dashboard.html" style="color:var(--accent);">← Voltar ao dashboard</a></p>';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  _equipeId = params.get('id') || '';
  if (!_equipeId) { window.location.href = 'dashboard.html'; return; }

  const equipes = await capsulaDB.getEquipes(_user.email);
  _equipe = equipes.find(e => e.id === _equipeId);
  if (!_equipe) { window.location.href = 'dashboard.html'; return; }

  document.title = _equipe.nome + ' — Sistema Gnosis';

  // Ciclos
  const cicloSel = document.getElementById('sel-ciclo');
  _cicloAtual = cicloAtualPadrao();
  cicloSel.innerHTML = gerarCiclos().map(c =>
    `<option value="${esc(c)}" ${c === _cicloAtual ? 'selected' : ''}>${esc(c)}</option>`
  ).join('');

  // Carrega tudo em paralelo
  const [itens, objetivos, raci, swot, dna] = await Promise.all([
    capsulaDB.getPlanoAcao(_equipeId),
    capsulaDB.getObjetivos(_user.email),
    capsulaDB.getRACI(_equipeId),
    capsulaDB.getSwotEquipe(_equipeId),
    capsulaDB.getEquipeDNA(_equipeId).catch(() => null),
  ]);
  _itens5w2h = itens;
  _objetivos = objetivos.filter(o => o.equipe_id === _equipeId);
  _raci = raci;
  _swot = swot;
  _dna = dna;

  renderPage();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('page').style.display = 'block';
}

function renderPage() {
  const membros = _equipe.equipe_membros || [];

  // Header
  document.getElementById('team-nome').textContent = _equipe.nome;
  document.getElementById('team-desc').textContent = _equipe.descricao || '';

  // Links
  document.getElementById('link-okrs').href = `okrs.html?equipe=${_equipeId}`;
  document.getElementById('link-5w2h').href = `5w2h.html?equipe=${_equipeId}`;
  document.getElementById('link-swot').href = `swot-equipe.html?equipe=${_equipeId}`;
  document.getElementById('link-raci').href = `raci.html?equipe=${_equipeId}`;

  // Stats
  renderStats(membros);

  // Membros
  renderMembros(membros);

  // OKRs
  renderOKRs();

  // 5W2H
  renderAcoes();

  // SWOT
  renderSWOT();

  // RACI
  renderRACI();

  // DNA
  renderDNA();

  // Tool grid
  renderToolGrid();
}

function renderStats(membros) {
  const concluidos = _itens5w2h.filter(i => i.status === 'concluido').length;
  const atrasados = _itens5w2h.filter(i => {
    if (i.status === 'concluido' || i.status === 'cancelado' || !i.when_data) return false;
    return new Date(i.when_data) < new Date();
  }).length;

  const totalKRs = _objetivos.reduce((s, o) => s + (o.key_results || []).length, 0);
  const pctMedia = _objetivos.length
    ? Math.round(_objetivos.reduce((s, o) => s + krProgressObj(o), 0) / _objetivos.length)
    : 0;

  const stats = [
    { val: membros.length, lbl: 'Membros', color: '#2EC4A0' },
    { val: _objetivos.length, lbl: `OKRs (${totalKRs} KRs)`, color: '#7c6af7' },
    { val: _itens5w2h.length, lbl: `Ações 5W2H (${concluidos} concluídas)`, color: '#1BA8D4' },
    { val: _swot.length, lbl: 'Itens SWOT', color: '#C9A84C' },
    { val: _raci.atividades.length, lbl: 'Atividades RACI', color: '#E8603A' },
    atrasados > 0 ? { val: atrasados, lbl: 'Ações em atraso', color: '#E8603A' }
                  : { val: pctMedia + '%', lbl: 'Progresso OKR médio', color: '#7c6af7' },
  ];

  document.getElementById('stats-grid').innerHTML = stats.map(s =>
    `<div class="stat-card" style="--stat-color:${s.color}">
       <div class="stat-val">${esc(String(s.val))}</div>
       <div class="stat-lbl">${esc(s.lbl)}</div>
     </div>`
  ).join('');
}

function renderMembros(membros) {
  if (!membros.length) {
    document.getElementById('member-list').innerHTML = '<span class="empty-sec">Nenhum membro na equipe ainda.</span>';
    return;
  }
  document.getElementById('member-list').innerHTML = membros.map(m => {
    const inicial = (m.nome || '?').charAt(0).toUpperCase();
    return `<div class="member-chip">
      <div class="member-avatar">${inicial}</div>
      <span>${esc(m.nome.split(' ')[0])}</span>
      ${m.papel ? `<span class="member-papel">· ${esc(m.papel)}</span>` : ''}
    </div>`;
  }).join('');
}

function krProgressObj(obj) {
  const krs = obj.key_results || [];
  if (!krs.length) return 0;
  const sum = krs.reduce((s, kr) => {
    const ini = Number(kr.valor_inicial || 0);
    const meta = Number(kr.meta || 100);
    const atual = Number(kr.valor_atual == null ? ini : kr.valor_atual);
    if (meta === ini) return s + 100;
    return s + Math.min(100, Math.max(0, Math.round(((atual - ini) / (meta - ini)) * 100)));
  }, 0);
  return Math.round(sum / krs.length);
}

function renderOKRs() {
  _cicloAtual = document.getElementById('sel-ciclo').value;
  const filtrados = _objetivos.filter(o => !o.ciclo || o.ciclo === _cicloAtual);
  const area = document.getElementById('okrs-area');
  if (!filtrados.length) {
    area.innerHTML = `<div class="empty-sec">Sem OKRs para ${esc(_cicloAtual)}.</div>`;
    return;
  }
  area.innerHTML = filtrados.slice(0, 6).map(obj => {
    const pct = krProgressObj(obj);
    const krs = (obj.key_results || []).slice(0, 3);
    const cor = pct >= 70 ? '#2EC4A0' : pct >= 40 ? '#7c6af7' : '#E8A03A';
    return `<div class="okr-item">
      <div class="okr-row">
        <span class="okr-nome">${esc(obj.titulo)}</span>
        <span class="okr-pct" style="color:${cor};">${pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,${cor},${cor}99);"></div></div>
      ${krs.length ? `<div class="okr-krs">${krs.map(kr => `<span class="kr-chip">${esc(kr.titulo || kr.key_result || '')}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('');
}

function renderAcoes() {
  const area = document.getElementById('acoes-area');
  if (!_itens5w2h.length) {
    area.innerHTML = '<div class="empty-sec">Nenhuma ação cadastrada ainda.</div>';
    return;
  }

  const pendentes = _itens5w2h.filter(i => i.status === 'pendente').length;
  const andamento = _itens5w2h.filter(i => i.status === 'em_andamento').length;
  const concluidos = _itens5w2h.filter(i => i.status === 'concluido').length;
  const now = new Date();
  const atrasadas = _itens5w2h.filter(i => {
    if (i.status === 'concluido' || i.status === 'cancelado' || !i.when_data) return false;
    return new Date(i.when_data) < now;
  });

  const statusBar = `<div class="status-row">
    ${pendentes ? `<span class="status-pill pill-pendente">${pendentes} pendente${pendentes !== 1 ? 's' : ''}</span>` : ''}
    ${andamento ? `<span class="status-pill pill-andamento">${andamento} em andamento</span>` : ''}
    ${concluidos ? `<span class="status-pill pill-concluido">${concluidos} concluída${concluidos !== 1 ? 's' : ''}</span>` : ''}
    ${atrasadas.length ? `<span class="status-pill pill-atrasado">⚠ ${atrasadas.length} em atraso</span>` : ''}
  </div>`;

  // Prioridade: atrasadas primeiro, depois em andamento, depois pendentes
  const ordenadas = [
    ..._itens5w2h.filter(i => i.status !== 'concluido' && i.status !== 'cancelado' && i.when_data && new Date(i.when_data) < now),
    ..._itens5w2h.filter(i => i.status === 'em_andamento' && (!i.when_data || new Date(i.when_data) >= now)),
    ..._itens5w2h.filter(i => i.status === 'pendente' && (!i.when_data || new Date(i.when_data) >= now)),
    ..._itens5w2h.filter(i => i.status === 'concluido'),
  ].slice(0, 8);

  const statusMap = { pendente: 'pill-pendente', em_andamento: 'pill-andamento', concluido: 'pill-concluido', cancelado: '' };
  const statusLabel = { pendente: 'Pendente', em_andamento: 'Andamento', concluido: 'Concluído', cancelado: 'Cancelado' };
  const listHtml = ordenadas.map(i => {
    const atrasado = i.status !== 'concluido' && i.status !== 'cancelado' && i.when_data && new Date(i.when_data) < now;
    const dateFmt = i.when_data ? new Date(i.when_data + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    return `<div class="acao-row">
      <span class="${atrasado ? 'status-pill pill-atrasado' : 'status-pill ' + (statusMap[i.status] || '')} " style="font-size:0.62rem;padding:0.12rem 0.45rem;flex-shrink:0;">${atrasado ? '⚠' : (statusLabel[i.status] || i.status)}</span>
      <span class="acao-what">${esc(i.what || '')}</span>
      ${i.who ? `<span class="acao-meta">${esc(i.who)}</span>` : ''}
      ${dateFmt ? `<span class="acao-meta">${dateFmt}</span>` : ''}
    </div>`;
  }).join('');

  area.innerHTML = statusBar + listHtml;
}

function renderSWOT() {
  const area = document.getElementById('swot-area');
  if (!_swot.length) {
    area.innerHTML = '<div class="empty-sec">Nenhum item SWOT cadastrado ainda.</div>';
    return;
  }
  const quads = { forcas: { cls: 'sq-f', lbl: 'Forças' }, fraquezas: { cls: 'sq-fr', lbl: 'Fraquezas' }, oportunidades: { cls: 'sq-o', lbl: 'Oportunidades' }, ameacas: { cls: 'sq-a', lbl: 'Ameaças' } };
  area.innerHTML = `<div class="swot-mini">` +
    Object.entries(quads).map(([key, q]) => {
      const itens = _swot.filter(i => i.quadrante === key);
      return `<div class="swot-q ${q.cls}">
        <div class="swot-q-title">${q.lbl}</div>
        <div class="swot-q-count">${itens.length}</div>
        <div class="swot-q-items">${itens.slice(0, 3).map(i => `<div class="swot-q-item">· ${esc(i.texto)}</div>`).join('')}</div>
      </div>`;
    }).join('') + `</div>`;
}

function renderRACI() {
  const area = document.getElementById('raci-area');
  const { atividades, atribuicoes } = _raci;
  if (!atividades.length) {
    area.innerHTML = '<div class="empty-sec">Nenhuma atividade RACI cadastrada ainda.</div>';
    return;
  }
  const membros = _equipe.equipe_membros || [];
  area.innerHTML = atividades.slice(0, 8).map(at => {
    const pills = membros.map(m => {
      const a = atribuicoes.find(x => x.atividade_id === at.id && x.membro_id === m.id);
      return a ? `<div class="rp rp-${a.papel}" title="${esc(m.nome)}: ${a.papel}">${a.papel}</div>` : '';
    }).join('');
    return `<div class="raci-stat">
      <span class="raci-atividade">${esc(at.atividade)}</span>
      <div class="raci-pills">${pills}</div>
    </div>`;
  }).join('');
}

function renderDNA() {
  if (!_dna) return;
  const sec = document.getElementById('sec-dna');
  const area = document.getElementById('dna-area');
  sec.style.display = 'block';
  try {
    const c = typeof _dna.conteudo === 'string' ? JSON.parse(_dna.conteudo) : _dna.conteudo;
    const texto = c.resumo || c.summary || (typeof c === 'string' ? c : '');
    if (texto) area.innerHTML = `<div class="dna-box">${esc(texto)}</div>`;
  } catch (_) {
    sec.style.display = 'none';
  }
}

function renderToolGrid() {
  const id = _equipeId;
  const tools = [
    { href: `okrs.html?equipe=${id}`, icon: '⊙', lbl: 'OKRs', color: '#7c6af7', bg: 'rgba(124,106,247,0.08)', border: 'rgba(124,106,247,0.25)' },
    { href: `5w2h.html?equipe=${id}`, icon: '📋', lbl: '5W2H', color: '#1BA8D4', bg: 'rgba(27,168,212,0.08)', border: 'rgba(27,168,212,0.25)' },
    { href: `raci.html?equipe=${id}`, icon: '👥', lbl: 'RACI', color: '#E8603A', bg: 'rgba(232,96,58,0.08)', border: 'rgba(232,96,58,0.25)' },
    { href: `swot-equipe.html?equipe=${id}`, icon: '🎯', lbl: 'SWOT', color: '#2EC4A0', bg: 'rgba(46,196,160,0.08)', border: 'rgba(46,196,160,0.25)' },
    { href: `wizard.html?equipe=${id}`, icon: '✦', lbl: 'Gerar com IA', color: '#7c6af7', bg: 'rgba(124,106,247,0.08)', border: 'rgba(124,106,247,0.25)' },
    { href: `dashboard.html`, icon: '←', lbl: 'Dashboard', color: 'var(--muted)', bg: 'rgba(255,255,255,0.02)', border: 'var(--border)' },
  ];
  document.getElementById('tool-grid').innerHTML = tools.map(t =>
    `<a href="${t.href}" class="tool-card" style="color:${t.color};background:${t.bg};border-color:${t.border};">
       <span style="font-size:1.4rem;">${t.icon}</span>${esc(t.lbl)}
     </a>`
  ).join('');
}

document.addEventListener('DOMContentLoaded', init);

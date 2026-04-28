// ══════════════════════════════════════
// ESTADO
// ══════════════════════════════════════
const SWOT = { f: [], fk: [], o: [], a: [] };
let showSug = true;
let userData = {};
let aiGenerated = false;

// ══════════════════════════════════════
// BOOT
// ══════════════════════════════════════
window.addEventListener('DOMContentLoaded', function() {
  const raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user');
  if (!raw) { window.location.href = 'index.html'; return; }
  if (!localStorage.getItem('capsula_user') && sessionStorage.getItem('capsula_user')) {
    try { capsulaDB.lsSetRaw('capsula_user', raw); } catch(_) {}
  }
  userData = JSON.parse(raw);
  // Auto-heal: garante uid
  if (!userData.uid) {
    userData.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    try { capsulaDB.lsSetUser(userData); } catch(_) {}
  }

  // Nome
  const nome = userData.apelido || (userData.nome||'').split(' ')[0] || 'Usuário';
  document.getElementById('user-greeting').textContent = '// ' + (userData.nome || nome);

  // Badge de testes realizados
  renderTestsBadges();

  // Auto-skip intro se já tem SWOT salva
  const s = userData.swot && userData.swot.items;
  if (s && (s.f?.length || s.fk?.length || s.o?.length || s.a?.length)) {
    startSWOT();
  }
});

function renderTestsBadges() {
  const ctx = document.getElementById('tests-context');
  const tests = [
    { key:'disc',    label:'DISC',       check: d => d&&d.dominant },
    { key:'bigfive', label:'OCEAN',      check: d => d&&d.scores },
    { key:'soar',    label:'SOAR',       check: d => d&&d.completionPct >= 80 },
    { key:'ikigai',  label:'Ikigai',     check: d => d&&d.completedAt },
    { key:'ancoras', label:'Âncoras',    check: d => d&&d.completedAt },
  ];
  ctx.innerHTML = tests.map(t => {
    const done = t.check(userData[t.key]);
    return `<div class="test-badge ${done?'done':'pending'}">${done?'✓':'○'} ${t.label}</div>`;
  }).join('');
}

// ══════════════════════════════════════
// PÁGINA
// ══════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

function startSWOT() {
  // Carrega SWOT salva anteriormente se houver
  if (userData.swot && userData.swot.items) {
    const s = userData.swot.items;
    SWOT.f  = s.f  || [];
    SWOT.fk = s.fk || [];
    SWOT.o  = s.o  || [];
    SWOT.a  = s.a  || [];
  }
  renderAll();
  renderSuggestions();
  showPage('page-matrix');
  // Inicializa tabs mobile
  switchMobileQ('f');

  // Event delegation para sug-chips — evita onclick inline com dados do usuário
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button.sug-chip');
    if (!btn) return;
    const type = btn.dataset.sugType;
    const text = btn.dataset.sugText;
    if (type && text !== undefined) addSuggestion(type, text);
  });
}

// ══════════════════════════════════════
// TABS
// ══════════════════════════════════════
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b,i) => {
    b.classList.toggle('active', ['matriz','confronto','analise'][i] === tab);
  });
  document.querySelectorAll('.tab-content').forEach((c,i) => {
    c.classList.toggle('active', ['tab-matriz','tab-confronto','tab-analise'][i] === 'tab-'+tab);
  });
  if (tab === 'confronto') renderConfronto();
}

// ══════════════════════════════════════
// MOBILE QUADRANT TABS
// ══════════════════════════════════════
const MOBILE_Q_ORDER = ['f','o','fk','a'];
let currentMobileQ = 'f';

function switchMobileQ(q) {
  currentMobileQ = q;

  // Atualiza tabs ativas
  document.querySelectorAll('.mqn-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.q === q);
  });

  // Mostra só o quadrante selecionado no mobile
  document.querySelectorAll('.swot-grid .quadrant').forEach(el => {
    el.classList.toggle('mobile-active', el.dataset.q === q);
  });

  // Scroll suave para a tab ativa
  const activeTab = document.querySelector('.mqn-tab[data-q="' + q + '"]');
  if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
}

function updateMobileBadges() {
  MOBILE_Q_ORDER.forEach(function(q) {
    const badge = document.getElementById('mbadge-' + q);
    if (!badge) return;
    const count = (SWOT[q] || []).length;
    badge.textContent = count;
    badge.classList.toggle('has-items', count > 0);
  });
}

// ══════════════════════════════════════
// ITENS
// ══════════════════════════════════════
function handleKey(e, type) {
  if (e.key === 'Enter') addItem(type);
}

function addItem(type) {
  const input = document.getElementById('input-'+type);
  const val = (input.value || '').trim();
  if (!val) return;
  if (SWOT[type].includes(val)) return;
  SWOT[type].push(val);
  input.value = '';
  renderItems(type);
  updateProgress();
  renderSuggestionsFor(type);
  updateMobileBadges();
}

function addSuggestion(type, text) {
  if (SWOT[type].includes(text)) return;
  SWOT[type].push(text);
  renderItems(type);
  updateProgress();
  renderSuggestionsFor(type);
  updateMobileBadges();
}

function removeItem(type, idx) {
  const removed = SWOT[type].splice(idx, 1)[0];
  renderItems(type);
  updateProgress();
  renderSuggestionsFor(type);
  updateMobileBadges();

  // Undo rápido: 4 segundos para desfazer
  const t = document.getElementById('toast');
  const prevTitle = document.getElementById('toast-title').textContent;
  const prevSub   = document.getElementById('toast-sub').textContent;
  clearTimeout(window._removeTimer);

  document.getElementById('toast-title').textContent = 'Item removido';
  document.getElementById('toast-sub').innerHTML =
    `<span style="cursor:pointer;text-decoration:underline;color:var(--S)" onclick="undoRemove('${type}',${idx},'${removed.replace(/'/g,"\\'")}')" id="undo-link">↩ Desfazer</span>`;
  t.classList.add('show');
  window._removeTimer = setTimeout(() => t.classList.remove('show'), 4000);
}

function undoRemove(type, idx, text) {
  SWOT[type].splice(idx, 0, text);
  renderItems(type);
  updateProgress();
  renderSuggestionsFor(type);
  updateMobileBadges();
  clearTimeout(window._removeTimer);
  document.getElementById('toast').classList.remove('show');
}

function renderItems(type) {
  const el = document.getElementById('items-'+type);
  const count = document.getElementById('count-'+type);
  el.innerHTML = SWOT[type].map((txt, i) =>
    `<div class="q-item">
      <span class="q-item-text">${escHtml(txt)}</span>
      <button class="q-item-del" onclick="removeItem('${type}',${i})" title="Remover">×</button>
    </div>`
  ).join('');
  count.textContent = SWOT[type].length;
}

function renderAll() {
  ['f','fk','o','a'].forEach(t => renderItems(t));
  updateProgress();
  updateMobileBadges();
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#x27;');
}

// ══════════════════════════════════════
// PROGRESSO
// ══════════════════════════════════════
function updateProgress() {
  const total = SWOT.f.length + SWOT.fk.length + SWOT.o.length + SWOT.a.length;
  const pct = Math.min(100, Math.round(total / 12 * 100));
  document.getElementById('pb-fill').style.width = pct + '%';
  document.getElementById('pb-count').textContent = total + ' ' + (total === 1 ? 'item' : 'itens');

  const ai = document.getElementById('btn-ai');
  if (total >= 4) {
    ai.disabled = false;
    document.getElementById('pb-hint').textContent = '✓ Pronto para gerar análise IA';
    document.getElementById('pb-hint').style.color = 'var(--S)';
  } else {
    ai.disabled = true;
    document.getElementById('pb-hint').textContent = 'Adicione ao menos 4 itens para habilitar a análise IA';
    document.getElementById('pb-hint').style.color = '';
  }

  renderConfrontoPreview();
}

// ══════════════════════════════════════
// PREVIEW DE CONFRONTO
// ══════════════════════════════════════
function renderConfrontoPreview() {
  const locked    = document.getElementById('cp-locked');
  const lockedBar = document.getElementById('cp-locked-bar');
  const lockedFill= document.getElementById('cp-locked-fill');
  const cards     = document.getElementById('cp-cards');
  const fullBtn   = document.getElementById('cp-full-btn');
  const ctaBtn    = document.getElementById('cp-cta-btn');
  const hint      = document.getElementById('cp-hint-text');
  if (!cards) return;

  const filled = [SWOT.f, SWOT.fk, SWOT.o, SWOT.a].filter(q => q.length > 0).length;
  const pct    = Math.round(filled / 4 * 100);

  if (filled < 2) {
    // ── Estado locked: mostra progresso animado ──
    locked.style.display    = 'flex';
    lockedBar.style.display = 'block';
    lockedFill.style.width  = pct + '%';
    cards.style.display     = 'none';
    fullBtn.style.display   = 'none';
    ctaBtn.style.display    = 'none';
    hint.textContent        = filled === 0
      ? 'Preencha 2 quadrantes para desbloquear'
      : `${4 - filled} quadrante${4 - filled > 1 ? 's' : ''} restante${4 - filled > 1 ? 's' : ''} para desbloquear`;
    return;
  }

  // ── Estado ativo: gera cards de preview ──
  locked.style.display    = 'none';
  lockedBar.style.display = 'none';
  cards.style.display     = 'grid';
  fullBtn.style.display   = 'flex';
  ctaBtn.style.display    = 'inline-block';
  hint.textContent        = `${filled} de 4 quadrantes preenchidos`;

  const previews = [];
  if (SWOT.f.length && SWOT.o.length)
    previews.push({ type:'Estratégia Ofensiva', icon:'🎯', color:'var(--sw-F)',
      text:`Use <strong>${escHtml(SWOT.f[0])}</strong> para aproveitar <strong>${escHtml(SWOT.o[0])}</strong>` });
  if (SWOT.f.length && SWOT.a.length)
    previews.push({ type:'Estratégia Defensiva', icon:'🛡️', color:'var(--sw-A)',
      text:`Aplique <strong>${escHtml(SWOT.f[0])}</strong> para neutralizar <strong>${escHtml(SWOT.a[0])}</strong>` });
  if (SWOT.fk.length && SWOT.o.length)
    previews.push({ type:'Área de Crescimento', icon:'📈', color:'var(--sw-O)',
      text:`Supere <strong>${escHtml(SWOT.fk[0])}</strong> para capturar <strong>${escHtml(SWOT.o[0])}</strong>` });
  if (SWOT.fk.length && SWOT.a.length && previews.length < 3)
    previews.push({ type:'Risco Crítico', icon:'⚠️', color:'var(--sw-Fk)',
      text:`<strong>${escHtml(SWOT.fk[0])}</strong> somada a <strong>${escHtml(SWOT.a[0])}</strong> exige atenção imediata` });

  const totalPreviews = previews.length;
  const shown = previews.slice(0, 3);
  const hidden = totalPreviews > 3 ? totalPreviews - 3 : 0;

  cards.innerHTML = shown.map(s => `
    <div class="confronto-card" style="--cc-color:${s.color};cursor:pointer" onclick="switchTab('confronto')" title="Ver análise completa">
      <div class="cc-type">${s.icon} ${s.type}</div>
      <div class="cc-text">${s.text}</div>
    </div>
  `).join('') + (hidden > 0 ? `
    <div class="confronto-card" style="--cc-color:var(--border2);cursor:pointer;opacity:0.6" onclick="switchTab('confronto')" title="Ver todos os cruzamentos">
      <div class="cc-type">＋${hidden} cruzamento${hidden > 1 ? 's' : ''}</div>
      <div class="cc-text" style="color:var(--muted)">Clique para ver a análise completa</div>
    </div>` : '');
}

// ══════════════════════════════════════
// SUGESTÕES INTELIGENTES
// ══════════════════════════════════════
function buildSuggestions() {
  const disc   = userData.disc   || {};
  const ocean  = userData.bigfive ? userData.bigfive.scores : {};
  const soar   = userData.soar   || {};
  const anc    = userData.ancoras|| {};
  const sug = { f: [], fk: [], o: [], a: [] };

  // DISC → Forças
  const dom = disc.dominant;
  if (dom === 'D') { sug.f.push('Tomada de decisão rápida'); sug.f.push('Liderança em situações de pressão'); sug.fk.push('Impaciência com processos lentos'); }
  if (dom === 'I') { sug.f.push('Comunicação e influência interpessoal'); sug.f.push('Capacidade de inspirar e engajar'); sug.fk.push('Dificuldade de foco em tarefas analíticas'); }
  if (dom === 'S') { sug.f.push('Consistência e confiabilidade'); sug.f.push('Capacidade de manter harmonia em equipes'); sug.fk.push('Resistência a mudanças rápidas'); }
  if (dom === 'C') { sug.f.push('Atenção a detalhes e precisão'); sug.f.push('Pensamento analítico e metódico'); sug.fk.push('Paralisia por análise excessiva'); }

  // OCEAN → camadas profundas
  if (ocean.O >= 65) sug.f.push('Criatividade e abertura a novas ideias');
  if (ocean.C >= 65) sug.f.push('Disciplina e organização para entregar resultados');
  if (ocean.E >= 65) sug.f.push('Energia e proatividade em ambientes dinâmicos');
  if (ocean.A >= 65) sug.f.push('Empatia e habilidade de construir relações de confiança');
  if (ocean.N >= 60) sug.fk.push('Sensibilidade emocional em ambientes de alta pressão');
  if (ocean.E < 35)  sug.fk.push('Dificuldade em redes de relacionamento intensas');

  // SOAR → Oportunidades (dados do usuário — sanitizar para uso como texto puro)
  if (soar.aspiracoes && soar.aspiracoes.length) {
    soar.aspiracoes.slice(0,2).forEach(a => {
      const safe = String(a).trim().slice(0, 200);
      if (safe) sug.o.push(safe);
    });
  }
  if (ocean.A >= 65) sug.o.push('Papéis de liderança de pessoas (RH, gestão)');
  if (dom === 'I')   sug.o.push('Mercado de vendas consultivas e marketing');
  if (ocean.O >= 65) sug.o.push('Empreendedorismo e inovação de produtos');

  // Oportunidades de mercado genéricas
  sug.o.push('Crescimento do mercado de dados e IA');
  sug.o.push('Trabalho remoto expandindo acesso global a vagas');

  // Ameaças
  sug.a.push('Automação de tarefas operacionais do setor');
  sug.a.push('Mercado competitivo exigindo atualização constante');
  if (ocean.N >= 60) sug.a.push('Burnout em ambientes de alta demanda');

  return sug;
}

function renderSuggestions() {
  ['f','fk','o','a'].forEach(t => renderSuggestionsFor(t));
}

function renderSuggestionsFor(type) {
  const el = document.getElementById('sug-'+type);
  if (!showSug) { el.innerHTML=''; return; }
  const all = buildSuggestions()[type];
  const available = all.filter(s => !SWOT[type].includes(s)).slice(0, 3);
  if (!available.length) { el.innerHTML=''; return; }
  el.innerHTML = `<div class="sug-label">💡 sugestões dos seus testes</div>` +
    available.map(s => `<button class="sug-chip" data-sug-type="${escHtml(type)}" data-sug-text="${escHtml(s)}" title="Adicionar">${escHtml(s)}</button>`).join('');
}

function toggleSuggestions() {
  showSug = !showSug;
  document.getElementById('sug-toggle-label').textContent = showSug ? 'Ocultar sugestões' : 'Mostrar sugestões';
  renderSuggestions();
}

// ══════════════════════════════════════
// CONFRONTO
// ══════════════════════════════════════
function renderConfronto() {
  const el = document.getElementById('confronto-content');
  const strategies = [];

  // F×O — Estratégia Ofensiva: todas as forças × todas as oportunidades
  SWOT.f.forEach(f => {
    SWOT.o.forEach(o => {
      strategies.push({ type:'Estratégia Ofensiva', icon:'🎯', color:'var(--sw-F)', text:`Use <strong>${escHtml(f)}</strong> para aproveitar <strong>${escHtml(o)}</strong>` });
    });
  });

  // F×A — Estratégia Defensiva: todas as forças × todas as ameaças
  SWOT.f.forEach(f => {
    SWOT.a.forEach(a => {
      strategies.push({ type:'Estratégia Defensiva', icon:'🛡️', color:'var(--sw-A)', text:`Aplique <strong>${escHtml(f)}</strong> para neutralizar <strong>${escHtml(a)}</strong>` });
    });
  });

  // Fk×O — Área de Crescimento: todas as fraquezas × todas as oportunidades
  SWOT.fk.forEach(fk => {
    SWOT.o.forEach(o => {
      strategies.push({ type:'Área de Crescimento', icon:'📈', color:'var(--sw-O)', text:`Supere <strong>${escHtml(fk)}</strong> para capturar <strong>${escHtml(o)}</strong>` });
    });
  });

  // Fk×A — Risco Crítico: todas as fraquezas × todas as ameaças
  SWOT.fk.forEach(fk => {
    SWOT.a.forEach(a => {
      strategies.push({ type:'Risco Crítico', icon:'⚠️', color:'var(--sw-Fk)', text:`<strong>${escHtml(fk)}</strong> somada a <strong>${escHtml(a)}</strong> exige atenção imediata` });
    });
  });

  if (!strategies.length) {
    el.innerHTML = `<div class="confronto-empty"><span class="ei">⚙️</span><p>Preencha ao menos 2 quadrantes para gerar os cruzamentos estratégicos.</p></div>`;
    return;
  }

  // Agrupar por tipo para facilitar leitura quando há muitos cruzamentos
  const grupos = [
    { key:'Estratégia Ofensiva',  icon:'🎯', color:'var(--sw-F)'  },
    { key:'Estratégia Defensiva', icon:'🛡️', color:'var(--sw-A)'  },
    { key:'Área de Crescimento',  icon:'📈', color:'var(--sw-O)'  },
    { key:'Risco Crítico',        icon:'⚠️', color:'var(--sw-Fk)' },
  ];

  el.innerHTML = grupos.map(g => {
    const items = strategies.filter(s => s.type === g.key);
    if (!items.length) return '';
    return `
      <div style="margin-bottom:1.25rem;">
        <div style="font-family:var(--mono);font-size:0.58rem;letter-spacing:0.1em;text-transform:uppercase;color:${g.color};margin-bottom:0.6rem;display:flex;align-items:center;gap:0.4rem;">
          ${g.icon} ${g.key} <span style="color:var(--muted);font-size:0.55rem;">(${items.length})</span>
        </div>
        <div class="confronto-grid">
          ${items.map(s => `
            <div class="confronto-card" style="--cc-color:${s.color}">
              <div class="cc-text">${s.text}</div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }).join('');
}

// ══════════════════════════════════════
// ANÁLISE IA
// ══════════════════════════════════════
async function generateAI() {
  const panel = document.getElementById('ai-panel');
  switchTab('analise');

  panel.innerHTML = `<div class="ai-loading"><div class="ai-spinner"></div><p>Analisando seu perfil completo...</p></div>`;

  const disc  = userData.disc  || {};
  const ocean = (userData.bigfive||{}).scores || {};
  const nome  = userData.apelido || (userData.nome||'').split(' ')[0] || 'Usuário';

  // Contexto enriquecido: SOAR, Ikigai, Âncoras
  const soar   = userData.soar   || {};
  const ikigai = userData.ikigai || {};
  const anc    = userData.ancoras|| {};

  const soarCtx = soar.completionPct >= 50 ? [
    soar.forcas  ? `• Forças (SOAR): ${Array.isArray(soar.forcas)  ? soar.forcas.join(', ')  : soar.forcas}`  : '',
    soar.aspiracoes ? `• Aspirações (SOAR): ${Array.isArray(soar.aspiracoes) ? soar.aspiracoes.join(', ') : soar.aspiracoes}` : '',
    soar.resultados ? `• Resultados desejados (SOAR): ${Array.isArray(soar.resultados) ? soar.resultados.join(', ') : soar.resultados}` : '',
  ].filter(Boolean).join('\n') : '';

  const ikigaiCtx = ikigai.completedAt ? [
    ikigai.amaBem   ? `• Ama & faz bem: ${ikigai.amaBem}`   : '',
    ikigai.mundoPaga ? `• Mundo paga por: ${ikigai.mundoPaga}` : '',
    ikigai.missao   ? `• Missão percebida: ${ikigai.missao}` : '',
  ].filter(Boolean).join('\n') : '';

  const ancCtx = anc.completedAt && anc.top ? `• Âncoras de carreira dominantes: ${Array.isArray(anc.top) ? anc.top.join(', ') : anc.top}` : '';

  const extraCtx = [soarCtx, ikigaiCtx, ancCtx].filter(Boolean).join('\n');

  const prompt = `Você é um especialista em desenvolvimento de carreira e psicologia organizacional.
Analise a SWOT pessoal de ${nome} e produza uma análise profissional estruturada em português brasileiro.

SWOT:
• Forças: ${SWOT.f.join(', ') || 'não informado'}
• Fraquezas: ${SWOT.fk.join(', ') || 'não informado'}
• Oportunidades: ${SWOT.o.join(', ') || 'não informado'}
• Ameaças: ${SWOT.a.join(', ') || 'não informado'}

Perfil DISC: Dominância ${disc.D||'—'}% | Influência ${disc.I||'—'}% | Estabilidade ${disc.S||'—'}% | Conformidade ${disc.C||'—'}%
Perfil OCEAN: Abertura ${ocean.O||'—'} | Conscienciosidade ${ocean.C||'—'} | Extroversão ${ocean.E||'—'} | Amabilidade ${ocean.A||'—'} | Neuroticismo ${ocean.N||'—'}
${extraCtx ? '\nContexto adicional dos demais instrumentos:\n' + extraCtx : ''}

Estruture a resposta em 4 seções:
1. 🔎 DIAGNÓSTICO DO PERFIL — 2 parágrafos sobre quem é esse profissional, integrando todos os instrumentos disponíveis
2. 🚀 3 CAMINHOS DE CARREIRA — caminhos específicos baseados na SWOT + perfis comportamentais + aspirações
3. 📋 PLANO DE AÇÃO 90 DIAS — 5 a 7 passos práticos e concretos
4. ⚠️ ALERTAS IMPORTANTES — riscos que precisam de atenção imediata

Tom: direto, motivador, sem floreios. Use emojis como marcadores de tópico. Foque no concreto.`;

  try {
    const cfg = window.CAPSULA_CONFIG || {};
    const u = (window.capsulaDB && capsulaDB.lsGetUser && capsulaDB.lsGetUser()) || {};
    const proxyUrl = (cfg.supabaseUrl || '') + '/functions/v1/groq-proxy';
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (cfg.supabaseKey || '') },
      body: JSON.stringify({
        email: u.email || 'anon@swot.local',
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (res.status === 429) {
      const errData = await res.json().catch(() => ({}));
      panel.innerHTML = `<div class="ai-empty"><span class="ei">⏳</span><h3>Limite atingido</h3><p>${errData.error || 'Tente novamente em alguns minutos.'}</p></div>`;
      return;
    }
    const data = await res.json();
    const text = (data.choices?.[0]?.message?.content || '').trim() || 'Não foi possível gerar análise.';
    aiGenerated = true;

    panel.innerHTML = `
      <div class="ai-result" id="ai-result">${formatAIText(text)}</div>
      <div class="ai-actions">
        <button class="btn-ghost" onclick="generateAI()">↺ Regenerar</button>
        <button class="btn-green" onclick="saveSWOT()">✓ Salvar análise</button>
      </div>`;

    // Salva análise junto com a SWOT
    saveToLS(text);
    toast('Análise gerada!', 'Salva automaticamente no seu perfil.');
  } catch(e) {
    panel.innerHTML = `<div class="ai-empty"><span class="ei">⚠️</span><h3>Erro ao gerar análise</h3><p>Verifique sua conexão com a API e tente novamente.</p></div>`;
  }
}

function formatAIText(text) {
  // Converte markdown básico para HTML legível
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>');
}

// ══════════════════════════════════════
// SALVAR
// ══════════════════════════════════════
function saveToLS(aiText) {
  if (!userData.uid) {
    userData.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  userData.swot = {
    items: { f: [...SWOT.f], fk: [...SWOT.fk], o: [...SWOT.o], a: [...SWOT.a] },
    aiAnalysis: aiText || null,
    completedAt: new Date().toISOString()
  };
  capsulaDB.lsSetUser(userData);
  try { sessionStorage.setItem('capsula_user', JSON.stringify(userData)); } catch(_) {}
  try {
    const perfis = capsulaDB.lsGetUsers();
    const idx = perfis.findIndex(p => p.uid === userData.uid);
    if (idx >= 0) { perfis[idx].swot = userData.swot; capsulaDB.lsSetUsers(perfis); }
  } catch(e) {}
  // Sync Supabase
  if(window.capsulaDB && userData.email){ capsulaDB.saveUser(userData).catch(e => console.warn('[swot] sync:', e)); }
}

function saveSWOT() {
  saveToLS(userData.swot?.aiAnalysis || null);
  toast('SWOT salva!', 'Você pode editar a qualquer momento.');
  showPage('page-result');
}

// ══════════════════════════════════════
// TOAST
// ══════════════════════════════════════
function toast(title, sub) {
  const t = document.getElementById('toast');
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-sub').textContent = sub;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

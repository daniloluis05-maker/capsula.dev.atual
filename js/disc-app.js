// ══════════════════════════════════════
// BANCO DE QUESTÕES
// 6 por dimensão (D, I, S, C) = 24 total
// score: dimensão que a pergunta mede
// reverse: se true, 5 pontos = baixa pontuação nessa dim
// ══════════════════════════════════════
const QUESTIONS = [
  // ── DOMINÂNCIA (D) ──
  {
    dim: 'D', section: 'D',
    text: 'Em situações de pressão, prefiro ser quem toma as decisões finais.',
    color: 'var(--D)', colorHex: '#E8603A', label: 'Dominância',
  },
  {
    dim: 'D', section: 'D',
    text: 'Obstáculos me energizam — quanto maior o desafio, mais motivado(a) fico.',
    color: 'var(--D)', colorHex: '#E8603A', label: 'Dominância',
  },
  {
    dim: 'D', section: 'D',
    text: 'Prefiro agir rápido e corrigir depois a ficar esperando todas as informações.',
    color: 'var(--D)', colorHex: '#E8603A', label: 'Dominância',
  },
  {
    dim: 'D', section: 'D',
    text: 'Não tenho dificuldade em confrontar pessoas quando discordo de algo.',
    color: 'var(--D)', colorHex: '#E8603A', label: 'Dominância',
  },
  {
    dim: 'D', section: 'D',
    text: 'Resultados e metas concretas importam mais para mim do que o processo.',
    color: 'var(--D)', colorHex: '#E8603A', label: 'Dominância',
  },
  {
    dim: 'D', section: 'D',
    text: 'Prefiro liderar projetos do que participar como membro de uma equipe.',
    color: 'var(--D)', colorHex: '#E8603A', label: 'Dominância',
  },

  // ── INFLUÊNCIA (I) ──
  {
    dim: 'I', section: 'I',
    text: 'Ambientes sociais me energizam — quanto mais gente, melhor me sinto.',
    color: 'var(--I)', colorHex: '#6C5FE6', label: 'Influência',
  },
  {
    dim: 'I', section: 'I',
    text: 'Tenho facilidade para convencer e entusiasmar as pessoas com minhas ideias.',
    color: 'var(--I)', colorHex: '#6C5FE6', label: 'Influência',
  },
  {
    dim: 'I', section: 'I',
    text: 'Costumo ser o ponto de conexão do meu grupo — as pessoas me procuram para conversar.',
    color: 'var(--I)', colorHex: '#6C5FE6', label: 'Influência',
  },
  {
    dim: 'I', section: 'I',
    text: 'Sinto-me confortável em falar em público ou apresentar ideias para grupos.',
    color: 'var(--I)', colorHex: '#6C5FE6', label: 'Influência',
  },
  {
    dim: 'I', section: 'I',
    text: 'Prefiro criar o clima positivo do time a ficar focado(a) apenas nas tarefas.',
    color: 'var(--I)', colorHex: '#6C5FE6', label: 'Influência',
  },
  {
    dim: 'I', section: 'I',
    text: 'Fico desconfortável quando o ambiente é tenso ou silencioso por muito tempo.',
    color: 'var(--I)', colorHex: '#6C5FE6', label: 'Influência',
  },

  // ── ESTABILIDADE (S) ──
  {
    dim: 'S', section: 'S',
    text: 'Prefiro rotinas e processos claros a ambientes de constante mudança.',
    color: 'var(--S)', colorHex: '#2EC4A0', label: 'Estabilidade',
  },
  {
    dim: 'S', section: 'S',
    text: 'Para mim, a harmonia e o bem-estar do grupo valem mais do que vencer um debate.',
    color: 'var(--S)', colorHex: '#2EC4A0', label: 'Estabilidade',
  },
  {
    dim: 'S', section: 'S',
    text: 'As pessoas ao meu redor me descrevem como alguém calmo(a) e confiável.',
    color: 'var(--S)', colorHex: '#2EC4A0', label: 'Estabilidade',
  },
  {
    dim: 'S', section: 'S',
    text: 'Quando começo algo, tenho forte tendência a levar até o fim, mesmo que demore.',
    color: 'var(--S)', colorHex: '#2EC4A0', label: 'Estabilidade',
  },
  {
    dim: 'S', section: 'S',
    text: 'Mudanças inesperadas me tiram do eixo — prefiro planejar com antecedência.',
    color: 'var(--S)', colorHex: '#2EC4A0', label: 'Estabilidade',
  },
  {
    dim: 'S', section: 'S',
    text: 'Sou o tipo de pessoa que escuta os outros com atenção antes de dar minha opinião.',
    color: 'var(--S)', colorHex: '#2EC4A0', label: 'Estabilidade',
  },

  // ── CONFORMIDADE (C) ──
  {
    dim: 'C', section: 'C',
    text: 'Antes de agir, prefiro reunir o máximo de informações e analisar os dados disponíveis.',
    color: 'var(--C)', colorHex: '#1BA8D4', label: 'Conformidade',
  },
  {
    dim: 'C', section: 'C',
    text: 'Erros e imprecisões me incomodam — gosto de entregar trabalhos impecáveis.',
    color: 'var(--C)', colorHex: '#1BA8D4', label: 'Conformidade',
  },
  {
    dim: 'C', section: 'C',
    text: 'Sigo regras e procedimentos com rigor, mesmo quando poderiam ser ignorados.',
    color: 'var(--C)', colorHex: '#1BA8D4', label: 'Conformidade',
  },
  {
    dim: 'C', section: 'C',
    text: 'Tenho dificuldade em tomar decisões importantes sem dados suficientes.',
    color: 'var(--C)', colorHex: '#1BA8D4', label: 'Conformidade',
  },
  {
    dim: 'C', section: 'C',
    text: 'Costumo questionar ideias e propostas antes de aceitar — preciso entender o porquê.',
    color: 'var(--C)', colorHex: '#1BA8D4', label: 'Conformidade',
  },
  {
    dim: 'C', section: 'C',
    text: 'Prefiro qualidade a velocidade — faço menos, mas faço direito.',
    color: 'var(--C)', colorHex: '#1BA8D4', label: 'Conformidade',
  },
];

const SECTION_TRANSITIONS = {
  I: { icon: '🌟', label: 'Dimensão: Influência', sub: 'Como você se conecta e energiza as pessoas' },
  S: { icon: '🌊', label: 'Dimensão: Estabilidade', sub: 'Como você mantém harmonia e constância' },
  C: { icon: '🔬', label: 'Dimensão: Conformidade', sub: 'Como você processa informação e mantém padrões' },
};

const SCALE_HINTS = [
  'Não me descreve de jeito nenhum',
  'Me descreve muito pouco',
  'Neutro — tanto faz',
  'Me descreve bem',
  'Me descreve perfeitamente',
];

// ══════════════════════════════════════
// PERFIS DISC — descrições e traits
// ══════════════════════════════════════
const PROFILES = {
  D: {
    title: 'O Executor',
    code: 'Dominância',
    color: '#E8603A',
    gradient: 'linear-gradient(90deg, #E8603A, #6C5FE6)',
    archetype: 'Perfil <strong>Dominante</strong> — orientado a resultados e liderança direta',
    traits: ['Decidido', 'Competitivo', 'Direto', 'Corajoso', 'Independente', 'Orientado a metas'],
    strengths: 'Toma decisões rápidas, não tem medo de conflito, é natural em posições de liderança. Enfrenta desafios de frente e persiste até alcançar resultados.',
    challenges: 'Pode parecer impaciente ou insensível. Tende a atropelar processos e pessoas em prol da velocidade. Precisa desenvolver escuta ativa.',
    environment: 'Ambientes dinâmicos, com autonomia e metas claras. Detesta burocracia e reuniões improdutivas.',
    communication: 'Direto ao ponto. Vá sem rodeios, seja objetivo e mostre resultados concretos.',
  },
  I: {
    title: 'O Catalisador',
    code: 'Influência',
    color: '#6C5FE6',
    gradient: 'linear-gradient(90deg, #6C5FE6, #1BA8D4)',
    archetype: 'Perfil <strong>Influente</strong> — conectado, entusiasmado e persuasivo',
    traits: ['Comunicativo', 'Entusiasmado', 'Persuasivo', 'Criativo', 'Otimista', 'Social'],
    strengths: 'Inspira e motiva os outros naturalmente. Cria conexões rapidamente, tem facilidade para vender ideias e construir relacionamentos.',
    challenges: 'Pode ser desorganizado, impulsivo e prometer mais do que entrega. Tende a evitar conversas difíceis e conflitos.',
    environment: 'Ambientes colaborativos, criativos e com liberdade de expressão. Precisa de reconhecimento e interação constante.',
    communication: 'Use entusiasmo, conte histórias. Fale sobre impacto nas pessoas, não apenas nos números.',
  },
  S: {
    title: 'O Guardião',
    code: 'Estabilidade',
    color: '#2EC4A0',
    gradient: 'linear-gradient(90deg, #2EC4A0, #1BA8D4)',
    archetype: 'Perfil <strong>Estável</strong> — confiável, paciente e orientado ao grupo',
    traits: ['Leal', 'Paciente', 'Confiável', 'Empático', 'Consistente', 'Colaborativo'],
    strengths: 'É o pilar da equipe. Mantém a calma sob pressão, é leal e cumpre o que promete. Excelente mediador e ouvinte.',
    challenges: 'Tem dificuldade com mudanças rápidas e pode ser excessivamente resistente a inovações. Tende a evitar conflitos ao custo de seu próprio bem-estar.',
    environment: 'Ambientes estáveis, com clareza de expectativas, bom relacionamento e sentido de pertencimento.',
    communication: 'Seja gentil e paciente. Explique o impacto nas pessoas, não apenas na tarefa. Dê tempo para processar.',
  },
  C: {
    title: 'O Analista',
    code: 'Conformidade',
    color: '#1BA8D4',
    gradient: 'linear-gradient(90deg, #1BA8D4, #6C5FE6)',
    archetype: 'Perfil <strong>Conformista</strong> — analítico, preciso e orientado à qualidade',
    traits: ['Analítico', 'Preciso', 'Lógico', 'Organizado', 'Criterioso', 'Detalhista'],
    strengths: 'Entrega trabalhos de alta qualidade, identifica erros que outros ignoram, fundamenta decisões em dados. Excelente em planejamento e processos.',
    challenges: 'Pode travar por excesso de análise (paralisia por análise). Tende a ser perfeccionista ao ponto de perder prazos e pode parecer frio ou distante.',
    environment: 'Ambientes com processos claros, autonomia para aprofundar e padrões de qualidade bem definidos.',
    communication: 'Use dados, lógica e evidências. Seja preciso e estruturado. Evite generalizações.',
  },
};

// ══════════════════════════════════════
// STATE
// ══════════════════════════════════════
let currentQ   = 0;
let answers    = new Array(QUESTIONS.length).fill(null);
let scores     = { D: 0, I: 0, S: 0, C: 0 };
let _isLoadingExisting = false; // true quando carregando resultado já salvo

// ══════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function startQuiz() {
  currentQ = 0;
  answers  = new Array(QUESTIONS.length).fill(null);
  showPage('page-quiz');
  renderQuestion(0);
}

function goBack() {
  if (currentQ === 0) {
    showPage('page-intro');
  } else {
    currentQ--;
    renderQuestion(currentQ);
  }
}

// ══════════════════════════════════════
// RENDER QUESTION
// ══════════════════════════════════════
function renderQuestion(idx) {
  const q   = QUESTIONS[idx];
  const pct = Math.round((idx / QUESTIONS.length) * 100);

  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('q-counter').textContent = `${idx + 1} de ${QUESTIONS.length}`;

  const card = document.getElementById('question-card');
  card.style.animation = 'none';
  card.offsetHeight; // reflow
  card.style.animation = '';

  const selected = answers[idx];

  card.innerHTML = `
    <div class="q-category" style="--q-color:${q.color}; background:${q.colorHex}18; border-color:${q.colorHex}40;">
      <span class="q-dot" style="background:${q.color};box-shadow:0 0 6px ${q.color}"></span>
      ${q.label}
    </div>
    <div class="question-text">${q.text}</div>
    <div class="scale-wrap">
      <div class="scale-labels">
        <span>Não me descreve</span>
        <span>Me descreve muito</span>
      </div>
      <div class="scale-buttons" style="--q-color:${q.color}">
        ${[1,2,3,4,5].map(v => `
          <button
            class="scale-btn ${selected === v ? 'selected' : ''}"
            data-val="${v}"
            style="--q-color:${q.color}"
            onclick="selectAnswer(${idx}, ${v})"
            title="${SCALE_HINTS[v-1]}"
          ></button>
        `).join('')}
      </div>
      <div class="scale-hint" id="scale-hint">
        ${selected ? SCALE_HINTS[selected - 1] : 'Selecione uma opção para continuar'}
      </div>
    </div>
    <div class="quiz-actions">
      <button
        class="btn-next ${selected !== null ? 'ready' : ''}"
        style="background:${q.color}; box-shadow:0 0 20px ${q.colorHex}40"
        id="btn-next"
        onclick="nextQuestion()"
      >
        ${idx === QUESTIONS.length - 1 ? 'Ver meu resultado →' : 'Próxima →'}
      </button>
    </div>
  `;
}

// ══════════════════════════════════════
// SELECT ANSWER
// ══════════════════════════════════════
function selectAnswer(idx, val) {
  answers[idx] = val;

  // Update visual
  document.querySelectorAll('.scale-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.scale-btn[data-val="${val}"]`).classList.add('selected');
  document.getElementById('scale-hint').textContent = SCALE_HINTS[val - 1];

  // Enable next
  const btn = document.getElementById('btn-next');
  if (btn) btn.classList.add('ready');

  // Auto-advance after 600ms
  clearTimeout(window._autoAdvance);
  window._autoAdvance = setTimeout(() => nextQuestion(), 650);
}

// ══════════════════════════════════════
// NEXT QUESTION
// ══════════════════════════════════════
function nextQuestion() {
  if (answers[currentQ] === null) return;

  // Check se muda de seção — mostrar transição
  const currSection = QUESTIONS[currentQ].section;
  const nextSection = currentQ + 1 < QUESTIONS.length ? QUESTIONS[currentQ + 1].section : null;

  currentQ++;

  if (currentQ >= QUESTIONS.length) {
    calculateResults();
    return;
  }

  if (nextSection && nextSection !== currSection && SECTION_TRANSITIONS[nextSection]) {
    showSectionTransition(nextSection, () => renderQuestion(currentQ));
  } else {
    renderQuestion(currentQ);
  }
}

// ══════════════════════════════════════
// SECTION TRANSITION
// ══════════════════════════════════════
function showSectionTransition(section, callback) {
  const t = SECTION_TRANSITIONS[section];
  const el = document.getElementById('section-transition');
  document.getElementById('t-icon').textContent  = t.icon;
  document.getElementById('t-label').textContent = t.label;
  document.getElementById('t-sub').textContent   = t.sub;
  el.classList.add('show');
  setTimeout(() => {
    el.classList.remove('show');
    callback();
  }, 1800);
}

// ══════════════════════════════════════
// CALCULATE RESULTS
// ══════════════════════════════════════
function calculateResults() {
  scores = { D: 0, I: 0, S: 0, C: 0 };

  QUESTIONS.forEach((q, i) => {
    const val = answers[i] || 3;
    scores[q.dim] += val;
  });

  // Normaliza para 0-100
  const maxPossible = 6 * 5; // 6 perguntas * 5 pontos max
  Object.keys(scores).forEach(k => {
    scores[k] = Math.round((scores[k] / maxPossible) * 100);
  });

  showResult();
}

// ══════════════════════════════════════
// SHOW RESULT
// ══════════════════════════════════════
async function showResult() {
  showPage('page-result');

  // Dominant dim
  const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const profile  = PROFILES[dominant];

  // Title
  document.getElementById('result-title').textContent    = profile.title;
  document.getElementById('result-archetype').innerHTML  = profile.archetype;

  // Card gradient
  document.getElementById('dna-card').style.setProperty('--result-gradient', profile.gradient);

  // BARS
  const barsEl = document.getElementById('disc-bars');
  const order  = Object.entries(scores).sort((a,b) => b[1]-a[1]);
  barsEl.innerHTML = order.map(([dim, pct]) => `
    <div class="bar-row">
      <span class="bar-letter" style="color:${PROFILES[dim].color}">${dim}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:0%; background:${PROFILES[dim].color}; box-shadow:0 0 8px ${PROFILES[dim].color};" data-pct="${pct}"></div>
      </div>
      <span class="bar-pct">${pct}%</span>
    </div>
  `).join('');

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.bar-fill').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  }, 100);

  // TRAITS
  const traitsEl = document.getElementById('traits-wrap');
  traitsEl.innerHTML = profile.traits.map(t => `
    <span class="trait-tag" style="--tag-color:${profile.color}">${t}</span>
  `).join('');

  // PROFILE BLOCKS
  document.getElementById('profile-grid').innerHTML = `
    <div class="profile-block">
      <h4>💪 Pontos Fortes</h4>
      <p>${profile.strengths}</p>
    </div>
    <div class="profile-block">
      <h4>⚡ Pontos de Atenção</h4>
      <p>${profile.challenges}</p>
    </div>
    <div class="profile-block">
      <h4>🏗️ Ambiente Ideal</h4>
      <p>${profile.environment}</p>
    </div>
    <div class="profile-block">
      <h4>💬 Como se Comunicar</h4>
      <p>${profile.communication}</p>
    </div>
  `;

  // Salva no localStorage ANTES de sincronizar com Supabase
  // Fallback para sessionStorage caso o usuário venha direto do cadastro
  const _rawUser = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user') || '{}';
  const userData = JSON.parse(_rawUser);
  if (!userData.uid) {
    userData.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  if (!_isLoadingExisting) {
  const nowISO = new Date().toISOString();
  const prevHistory = (userData.disc && Array.isArray(userData.disc.history)) ? userData.disc.history : [];
  // append current result to history (keep last 10 entries)
  const historyEntry = { dominant, scores: Object.assign({}, scores), completedAt: nowISO };
  const newHistory = [...prevHistory, historyEntry].slice(-10);
  userData.disc = { dominant, scores, completedAt: nowISO, history: newHistory };
  capsulaDB.lsSetUser(userData);
  try { sessionStorage.setItem('capsula_user', JSON.stringify(userData)); } catch(_) {}

  // ── PERSISTÊNCIA: salva no Supabase com userData já atualizado ──
  await saveResultToSupabase(userData);

  // ── FIX CRÍTICO 1: Sincroniza resultado no array capsula_users[] ──
  // Garante que trocar de perfil não apague o resultado
  try {
    const perfis = capsulaDB.lsGetUsers();
    const idx = perfis.findIndex(function(p) { return p.uid === userData.uid; });
    if (idx >= 0) {
      perfis[idx].disc = userData.disc;
      capsulaDB.lsSetUsers(perfis);
    }
  } catch(e) { /* silencioso */ }
  } // end !_isLoadingExisting
}

// ══════════════════════════════════════
// SUPABASE AUTH + PERSISTÊNCIA
// ══════════════════════════════════════
// #6: Cliente Supabase e helpers de auth centralizados em js/db.js → window.capsulaDB
// getDB(), getSession(), loginWithMagicLink(), loginWithOAuth() disponíveis via window.capsulaDB

// ── UTILITÁRIO: nome de exibição ──────────────────────────────
function getNomeExibido(userData) {
  if (!userData) return 'Usuário';
  if (userData.apelido && userData.apelido.trim()) return userData.apelido.trim();
  if (userData.nome && userData.nome.trim()) return userData.nome.trim();
  return 'Usuário';
}

// Sincroniza resultado DISC no Supabase via capsulaDB.syncMatrizes
async function saveResultToSupabase(userData) {
  try {
    if (!userData || !userData.email) {
      console.warn('[Gnosis] Usuário sem e-mail — resultado salvo apenas localmente.');
      setSyncStatus('Salvo localmente ✓');
      return;
    }

    const { error } = await capsulaDB.saveUser(userData);

    if (error && error !== 'offline') {
      console.error('[Gnosis] Erro ao salvar resultado:', error.message || error);
      setSyncStatus('Erro ao sincronizar resultado.', true);
    } else {
      setSyncStatus('Resultado sincronizado ✓');
    }

  } catch (err) {
    if(window.capsulaUI) window.capsulaUI.toast('Erro ao salvar. Tente novamente.','error');
    console.error('[Gnosis] saveResultToSupabase falhou:', err);
    setSyncStatus('Erro ao sincronizar resultado.', true);
  }
}

function setSyncStatus(msg, isError) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  el.textContent = msg;
  el.style.color   = isError ? 'var(--danger, #e24b4a)' : 'var(--muted, #666)';
  el.style.opacity = '1';
  if (!isError) {
    setTimeout(() => { el.style.opacity = '0'; }, 3000);
  }
}

// Auth listener removido — onAuthStateChange disparava SIGNED_OUT imediatamente
// para usuários sem sessão Supabase, apagando o localStorage antes de initPage rodar.

// ══════════════════════════════════════
// ONBOARDING WIZARD
// ══════════════════════════════════════
const OB_KEY = 'capsula_onboarding_done';

function obInit() {
  const _raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user');
  const _uid = _raw ? (JSON.parse(_raw).uid || '') : '';
  const _key = OB_KEY + (_uid ? '_' + _uid : '');
  const done = localStorage.getItem(_key);
  if (!done) {
    document.getElementById('onboarding-overlay').classList.add('show');
  }
}

function obNext(step) {
  document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`ob-step-${step}`).classList.add('active');
}

function obFinish() {
  const _raw2 = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user');
  const _uid2 = _raw2 ? (JSON.parse(_raw2).uid || '') : '';
  const _key2 = OB_KEY + (_uid2 ? '_' + _uid2 : '');
  localStorage.setItem(_key2, '1');
  document.getElementById('onboarding-overlay').classList.remove('show');
}

// Inicia onboarding ao carregar a página

// ══════════════════════════════════════
// INICIALIZAÇÃO DA PÁGINA
// ══════════════════════════════════════
async function initPage() {
  // Carrega dados do usuário autenticado antes de qualquer coisa
  let userData = null;
  try { userData = await capsulaDB.ensureUserData(); } catch(_) {}

  // Só usa dados DISC se pertencerem ao usuário atual (verificado pelo email)
  function _findDisc() {
    try {
      const u = capsulaDB.lsGetUser() || {};
      const sessionEmail = userData && userData.email ? userData.email.toLowerCase() : null;
      if (!sessionEmail) return null;
      if (u.email && u.email.toLowerCase() !== sessionEmail) return null;
      if (u.disc && u.disc.completedAt && u.disc.scores) return u.disc;
    } catch(_) {}
    return null;
  }

  const _saved = _findDisc();
  if (_saved) {
    scores = _saved.scores;
    _isLoadingExisting = true;
    showPage('page-result');
    showResult();
    return;
  }

  // Guard: sem usuário cadastrado → redireciona para cadastro
  if (!userData) {
    window.location.href = 'index.html';
    return;
  }

  // Auto-heal: garante que uid sempre existe
  if (!userData.uid) {
    userData.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    try { capsulaDB.lsSetUser(userData); } catch(_) {}
  }

  // Sincroniza localStorage caso só exista em sessionStorage
  if (!localStorage.getItem('capsula_user') && sessionStorage.getItem('capsula_user')) {
    capsulaDB.lsSetRaw('capsula_user', sessionStorage.getItem('capsula_user'));
  }

  // Exibe nome na intro
  const nome = getNomeExibido(userData);
  const greeting = document.getElementById('disc-greeting');
  if (greeting) {
    greeting.style.display = 'block';
    const span = greeting.querySelector('.js-user-name');
    if (span) span.textContent = nome;
  }

  // Inicia onboarding se necessário
  obInit();
}

document.addEventListener('DOMContentLoaded', initPage);

// ══════════════════════════════════════
// GENERATE PDF — DISC Blueprint v3
// ══════════════════════════════════════
function generatePDF() {
  if (window._payments) {
    _payments.serverDebitCredit('disc').then(function(ok) {
      if (!ok) { _payments.showPaywall('disc'); return; }
      _generatePDFDisc();
    });
    return;
  }
  _generatePDFDisc();
}
function _generatePDFDisc() {
  const dominant    = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const profile     = PROFILES[dominant];
  const ACCENT      = profile.color;
  const user        = (capsulaDB.lsGetUser() || {});
  const nome        = getNomeExibido(user);
  const data        = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const dimNames    = {D:'Dominância',I:'Influência',S:'Estabilidade',C:'Conformidade'};
  const dimColors   = {D:'#E8603A',I:'#6C5FE6',S:'#2EC4A0',C:'#1BA8D4'};
  const motivMap    = {D:'Desafio e Autonomia',I:'Reconhecimento Social',S:'Segurança e Lealdade',C:'Precisão e Qualidade'};
  const focoMap     = {D:'Resultados e Velocidade',I:'Pessoas e Entusiasmo',S:'Ritmo e Harmonia',C:'Dados e Processos'};
  const dimOrder    = ['D','I','S','C'];
  const sortedDims  = [...dimOrder].sort((a,b)=>(scores[b]||0)-(scores[a]||0));
  const weakest     = sortedDims[sortedDims.length-1];

  // Radar 4-axis: D=top, I=right, S=bottom, C=left
  const AXIS4 = {D:[130,42],I:[218,130],S:[130,218],C:[42,130]};
  const radarPts = dimOrder.map(d=>{const s=(scores[d]||0)/100;const[ox,oy]=AXIS4[d];return`${(130+(ox-130)*s).toFixed(1)},${(130+(oy-130)*s).toFixed(1)}`;}).join(' ');
  const radarDots = dimOrder.map(d=>{const s=(scores[d]||0)/100;const[ox,oy]=AXIS4[d];const cx=(130+(ox-130)*s).toFixed(1),cy=(130+(oy-130)*s).toFixed(1);return`<circle cx="${cx}" cy="${cy}" r="3.5" fill="${dimColors[d]}" stroke="#f8fafc" stroke-width="1.5"/>`;}).join('');

  const _gnCss = `*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Inter',sans-serif;background:#f8fafc;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.page{width:794px;height:1123px;overflow:hidden;margin:0 auto;padding:24px 34px;background:#f8fafc;display:flex;flex-direction:column;}
.hd{display:flex;justify-content:space-between;align-items:center;padding-bottom:11px;border-bottom:2px solid #000;margin-bottom:13px;flex-shrink:0;}
.brand{display:flex;align-items:center;gap:7px;}.brand-name{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;}.brand-name em{color:ACC;font-style:italic;font-weight:300;}
.hd-meta{font-family:'Space Mono',monospace;font-size:7px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;text-align:right;line-height:1.85;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;flex:1;min-height:0;}.col{display:flex;flex-direction:column;gap:9px;min-height:0;overflow:hidden;}
.pn{background:#fafafa;border:1px solid #000;padding:13px 15px;position:relative;flex-shrink:0;}
.pn-grow{background:#fff;border:1px solid #000;padding:13px 15px;position:relative;flex:1;min-height:0;display:flex;flex-direction:column;}
.lbl{position:absolute;top:-8px;left:12px;background:#000;color:#fff;font-family:'Space Mono',monospace;font-size:6.5px;padding:1px 7px;text-transform:uppercase;letter-spacing:0.15em;}
.dom-hero{display:flex;align-items:center;gap:11px;margin-bottom:9px;}
.dom-letter{width:48px;height:48px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Space Mono',monospace;font-size:24px;font-weight:900;}
.dom-ew{font-family:'Space Mono',monospace;font-size:7px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:ACC;margin-bottom:2px;}
.dom-name{font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:1;}
.arch-badge{display:inline-flex;align-items:center;gap:4px;font-family:'Space Mono',monospace;font-size:6.5px;padding:2px 7px;border:1px solid;text-transform:uppercase;letter-spacing:0.07em;margin-top:7px;}
.ins-lbl{font-family:'Space Mono',monospace;font-size:6.5px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:ACC;margin-bottom:7px;display:flex;align-items:center;gap:5px;flex-shrink:0;}
.ins-lbl::before{content:'';width:14px;height:2px;background:ACC;border-radius:2px;display:inline-block;}
.ins-txt{font-size:8.5px;color:#444;line-height:1.75;flex-shrink:0;}
.chips-row{display:flex;flex-wrap:wrap;gap:4px;margin-top:9px;flex-shrink:0;}
.chip{font-family:'Space Mono',monospace;font-size:6.5px;padding:2px 7px;border:1px solid;text-transform:uppercase;letter-spacing:0.07em;}
.tension-box{margin-top:10px;padding-top:9px;border-top:1px solid #e4e4e7;flex:1;display:flex;flex-direction:column;justify-content:center;}
.tension-lbl{font-family:'Space Mono',monospace;font-size:6.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;margin-bottom:7px;text-align:center;}
.tension-row{display:flex;align-items:center;gap:8px;}.t-arch{display:flex;align-items:center;gap:6px;flex:1;padding:6px 8px;border:1px solid;border-radius:2px;}
.t-letter{width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Space Mono',monospace;font-size:10px;font-weight:900;}
.t-name{font-size:8.5px;font-weight:700;}.t-pct{font-family:'Space Mono',monospace;font-size:7.5px;}
.t-arrow{font-family:'Space Mono',monospace;font-size:9px;color:#a1a1aa;flex-shrink:0;}
.tension-note{font-size:7.5px;color:#71717a;line-height:1.65;margin-top:6px;text-align:center;}
.sr{display:flex;align-items:center;gap:7px;padding:4px 0;border-bottom:1px solid #f1f5f9;}
.sr-rank{font-family:'Space Mono',monospace;font-size:7px;color:#a1a1aa;min-width:14px;}
.sr-ico{width:22px;height:22px;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Space Mono',monospace;font-size:9px;font-weight:900;}
.sr-name{font-size:9px;font-weight:700;flex:1;}
.sr-track{flex:1;height:5px;background:#f1f5f9;border-radius:3px;overflow:hidden;max-width:110px;}
.sr-fill{height:100%;border-radius:3px;}.sr-pct{font-family:'Space Mono',monospace;font-size:7.5px;min-width:28px;text-align:right;}
.guide-item{flex-shrink:0;padding-top:7px;border-top:1px solid #f1f5f9;}
.guide-item:first-child{padding-top:0;border-top:none;}
.guide-tag{font-family:'Space Mono',monospace;font-size:6px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:ACC;margin-bottom:3px;}
.guide-txt{font-size:7.5px;line-height:1.65;color:#333;}
.ft{padding-top:9px;border-top:2px solid #000;display:flex;justify-content:space-between;align-items:center;margin-top:9px;flex-shrink:0;}
.ft-l{font-family:'Space Mono',monospace;font-size:6px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;}
.ft-r{font-family:'Space Mono',monospace;font-size:7.5px;font-weight:700;color:#000;}
@media print{@page{margin:0;size:A4;}body{background:#f8fafc!important;}.page{width:100%;}}`.split('ACC').join(ACCENT);

  const barsHTML = dimOrder.map(d=>{
    const c=dimColors[d],pct=scores[d]||0,isDom=d===dominant;
    return `<div style="border:1px solid ${isDom?c+'50':'#e4e4e7'};padding:8px 10px;background:${isDom?c+'08':'#fff'};${isDom?'':'opacity:0.5;'}">
      <div style="font-family:'Space Mono',monospace;font-size:7px;font-weight:700;color:${c};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">${d}</div>
      <div style="font-size:18px;font-weight:900;color:${c};">${pct}%</div>
      <div style="height:3px;background:#f1f5f9;border-radius:2px;margin-top:4px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:${c};border-radius:2px;"></div></div>
    </div>`;
  }).join('');

  const rankingHTML = sortedDims.map((d,i)=>{
    const c=dimColors[d],pct=scores[d]||0,last=i===3?'border-bottom:none;':'';
    return `<div class="sr" style="${last}"><span class="sr-rank">${String(i+1).padStart(2,'0')}</span><div class="sr-ico" style="background:${c}15;border:1px solid ${c}30;color:${c};">${d}</div><span class="sr-name">${dimNames[d]}</span><div class="sr-track"><div class="sr-fill" style="width:${pct}%;background:${c};"></div></div><span class="sr-pct" style="color:${c};">${pct}%</span></div>`;
  }).join('');

  const chipsHTML = profile.traits.map(t=>`<span class="chip" style="color:${ACCENT};border-color:${ACCENT}40;background:${ACCENT}08;">${t}</span>`).join('');

  _imprimirPDF(`<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8"><title>Perfil DISC — ${nome} · Sistema Gnosis</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>${_gnCss}</style></head><body><div class="page">
  <div class="hd">
    <div class="brand"><svg viewBox="0 0 100 100" fill="none" width="26" height="26"><path d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C59.66 15 68.38 18.91 74.72 25.22" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><path d="M85 50H55" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><circle cx="85" cy="50" r="4" fill="${ACCENT}"/></svg><span class="brand-name">SISTEMA <em>Gnosis</em></span></div>
    <div class="hd-meta">Módulo: Perfil DISC · Comportamento<br>${data.toUpperCase()}<br>${nome.toUpperCase()}</div>
  </div>
  <div class="grid">
    <div class="col">
      <div class="pn">
        <div class="lbl">Perfil_Dominante</div>
        <div class="dom-hero">
          <div class="dom-letter" style="background:${ACCENT}12;border:1px solid ${ACCENT}35;color:${ACCENT};">${dominant}</div>
          <div>
            <div class="dom-ew">Resultado · Perfil DISC</div>
            <div class="dom-name" style="color:${ACCENT};">${profile.title}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">${barsHTML}</div>
        <div class="arch-badge" style="color:${ACCENT};border-color:${ACCENT}40;background:${ACCENT}08;">${focoMap[dominant]} · ${motivMap[dominant]}</div>
      </div>
      <div class="pn-grow">
        <div class="lbl">Análise_do_Perfil</div>
        <div class="ins-lbl">Arquitetura Comportamental</div>
        <p class="ins-txt">${profile.strengths}</p>
        <div class="chips-row">${chipsHTML}</div>
        <div class="tension-box">
          <div class="tension-lbl">// Zona de Tensão · Polaridade Comportamental</div>
          <div class="tension-row">
            <div class="t-arch" style="border-color:${ACCENT}35;background:${ACCENT}08;">
              <div class="t-letter" style="background:${ACCENT}15;border:1px solid ${ACCENT}30;color:${ACCENT};">${dominant}</div>
              <div><div class="t-name" style="color:${ACCENT};">${dimNames[dominant]}</div><div class="t-pct" style="color:${ACCENT};">${scores[dominant]||0}% · dominante</div></div>
            </div>
            <div class="t-arrow">⟷</div>
            <div class="t-arch" style="border-color:${dimColors[weakest]}35;background:${dimColors[weakest]}06;">
              <div class="t-letter" style="background:${dimColors[weakest]}15;border:1px solid ${dimColors[weakest]}30;color:${dimColors[weakest]};">${weakest}</div>
              <div><div class="t-name" style="color:${dimColors[weakest]};">${dimNames[weakest]}</div><div class="t-pct" style="color:${dimColors[weakest]};">${scores[weakest]||0}% · moderado</div></div>
            </div>
          </div>
          <p class="tension-note">A alta ${dimNames[dominant].toLowerCase()} contrasta com a menor expressão de ${dimNames[weakest].toLowerCase()}. Essa polaridade define como você prioriza e reage sob pressão.</p>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="pn" style="flex-shrink:0;">
        <div class="lbl">Ranking_DISC</div>
        <div style="padding-top:5px;">${rankingHTML}</div>
      </div>
      <div class="pn-grow">
        <div class="lbl">Guia_de_Interação</div>
        <div style="display:flex;flex-direction:column;gap:0;padding-top:4px;flex:1;justify-content:space-between;">
          <div class="guide-item" style="border-top:none;padding-top:0;"><div class="guide-tag">Pontos_de_Atenção</div><p class="guide-txt">${profile.challenges}</p></div>
          <div class="guide-item"><div class="guide-tag">Ambiente_Ideal</div><p class="guide-txt">${profile.environment}</p></div>
          <div class="guide-item" style="flex:1;"><div class="guide-tag">Como_se_Comunicar</div><p class="guide-txt">${profile.communication}</p></div>
          <div class="guide-item">
            <div class="guide-tag" style="margin-bottom:5px;">Mapa_Visual_DISC</div>
            <div style="display:flex;justify-content:center;">
              <svg viewBox="0 0 260 260" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
                <defs><radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.18"/><stop offset="100%" stop-color="${ACCENT}" stop-opacity="0.04"/></radialGradient></defs>
                <polygon points="130,74 186,130 130,186 74,130" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
                <polygon points="130,96 164,130 130,164 96,130" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
                <line x1="130" y1="130" x2="130" y2="42" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
                <line x1="130" y1="130" x2="218" y2="130" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
                <line x1="130" y1="130" x2="130" y2="218" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
                <line x1="130" y1="130" x2="42" y2="130" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
                <polygon points="${radarPts}" fill="url(#rg)" stroke="${ACCENT}" stroke-width="1.5" stroke-opacity="0.7"/>
                ${radarDots}
                <text x="130" y="36" text-anchor="middle" font-family="Space Mono,monospace" font-size="7" fill="${dimColors.D}" font-weight="700">D ${scores.D||0}%</text>
                <text x="224" y="133" text-anchor="start" font-family="Space Mono,monospace" font-size="7" fill="${dimColors.I}">I ${scores.I||0}%</text>
                <text x="130" y="230" text-anchor="middle" font-family="Space Mono,monospace" font-size="7" fill="${dimColors.S}">S ${scores.S||0}%</text>
                <text x="36" y="133" text-anchor="end" font-family="Space Mono,monospace" font-size="7" fill="${dimColors.C}">C ${scores.C||0}%</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="ft"><span class="ft-l">Sistema Gnosis // Perfil DISC // Comportamento // Confidencial</span><span class="ft-r">capsula-dev-atualizado.vercel.app</span></div>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>
  </body></html>`);
}


function _imprimirPDF(html){
  var old=document.getElementById('_pdf_frame');if(old)old.remove();
  var iframe=document.createElement('iframe');iframe.id='_pdf_frame';
  iframe.setAttribute('style','position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;border:none;');
  document.body.appendChild(iframe);
  var doc=iframe.contentDocument||iframe.contentWindow.document;
  doc.open();doc.write(html);doc.close();
  iframe.onload=function(){setTimeout(function(){try{iframe.contentWindow.focus();iframe.contentWindow.print();}catch(e){var blob=new Blob([html],{type:'text/html'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='disc-resultado.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}},700);};
}
// ══════════════════════════════════════
// SHARE
// ══════════════════════════════════════
function shareResult() {
  const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const profile  = PROFILES[dominant];

  // Build shareable URL with encoded result
  try {
    const userData = JSON.parse(localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user') || '{}');
    const payload  = JSON.stringify({
      dominant,
      scores: Object.assign({}, scores),
      completedAt: (userData.disc && userData.disc.completedAt) || new Date().toISOString(),
      name: userData.nome || userData.apelido || null,
    });
    const encoded  = btoa(payload).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const baseUrl  = window.location.origin + (window.location.pathname.replace(/\/[^/]*$/, '/'));
    const shareUrl = baseUrl + 'disc-share.html?d=' + encoded;
    const text     = `Meu perfil DISC no Sistema Gnosis: ${profile.title} (${profile.code} ${scores[dominant]}%)`;

    if (navigator.share) {
      navigator.share({ title: 'Meu Perfil DISC', text, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => showCopyToast('Link copiado! Compartilhe onde quiser.'));
    }
  } catch(e) {
    // fallback
    const text = `Meu perfil DISC no Sistema Gnosis: ${profile.title} (${profile.code} ${scores[dominant]}%) — capsula-dev-atualizado.vercel.app`;
    navigator.clipboard && navigator.clipboard.writeText(text).then(() => showCopyToast('Resultado copiado!'));
  }
}

function showCopyToast(msg) {
  let t = document.getElementById('_copy-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_copy-toast';
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:var(--surface2,#1e1e1e);border:1px solid var(--border2,#333);border-radius:8px;padding:0.75rem 1.1rem;font-size:0.82rem;color:var(--text,#fff);z-index:9999;opacity:0;transform:translateY(12px);transition:opacity 0.25s,transform 0.25s;pointer-events:none;';
    document.body.appendChild(t);
  }
  t.textContent = '✓  ' + msg;
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(12px)'; }, 2800);
}

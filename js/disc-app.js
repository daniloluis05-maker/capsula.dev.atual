// ══════════════════════════════════════
// BANCO DE QUESTÕES
// 6 por dimensão (D, I, S, C) = 24 total
// score: dimensão que a pergunta mede
// reverse: se true, 5 pontos = baixa pontuação nessa dim
// ══════════════════════════════════════

// Etapa 2 — eram window.* globais; convertidos pra let no escopo do script.
let _autoAdvance;

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
  if (window.gnosisTrack) gnosisTrack('quiz_started', { matriz: 'disc' });
  // Tenta restaurar progresso salvo (gnosisQuizSave). Se houver pelo menos
  // 1 resposta e o quiz não está completo, oferece retomar de onde parou.
  if (window.gnosisQuizSave) {
    const saved = gnosisQuizSave.restore('disc');
    if (saved && saved.state && Array.isArray(saved.state.answers)) {
      const answered = saved.state.answers.filter(a => a !== null).length;
      if (answered > 0 && answered < QUESTIONS.length) {
        gnosisQuizSave.promptResume({
          matriz: 'disc', label: 'DISC',
          summary: answered + ' de ' + QUESTIONS.length + ' perguntas respondidas',
          onResume: function () {
            answers = saved.state.answers.slice();
            currentQ = typeof saved.state.currentQ === 'number' ? saved.state.currentQ : answered;
            if (currentQ >= QUESTIONS.length) currentQ = QUESTIONS.length - 1;
            showPage('page-quiz');
            renderQuestion(currentQ);
          },
          onRestart: function () {
            currentQ = 0;
            answers = new Array(QUESTIONS.length).fill(null);
            showPage('page-quiz');
            renderQuestion(0);
          },
        });
        return;
      }
    }
  }
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
      <div class="scale-buttons" style="--q-color:${q.color}" role="radiogroup" aria-label="Avalie de 1 (não me descreve) a 5 (me descreve muito)">
        ${[1,2,3,4,5].map(v => `
          <button
            class="scale-btn ${selected === v ? 'selected' : ''}"
            data-val="${v}"
            style="--q-color:${q.color}"
            onclick="selectAnswer(${idx}, ${v})"
            title="${SCALE_HINTS[v-1]}"
            role="radio"
            aria-checked="${selected === v ? 'true' : 'false'}"
            aria-label="Nota ${v} de 5 — ${SCALE_HINTS[v-1]}"
          ></button>
        `).join('')}
      </div>
      <div class="scale-hint" id="scale-hint" aria-live="polite">
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

  // Autosave progresso a cada resposta (key: 'disc')
  if (window.gnosisQuizSave) gnosisQuizSave.save('disc', { answers: answers, currentQ: idx });

  // Update visual
  document.querySelectorAll('.scale-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.scale-btn[data-val="${val}"]`).classList.add('selected');
  document.getElementById('scale-hint').textContent = SCALE_HINTS[val - 1];

  // Enable next
  const btn = document.getElementById('btn-next');
  if (btn) btn.classList.add('ready');

  // Auto-advance after 600ms
  clearTimeout(_autoAdvance);
  _autoAdvance = setTimeout(() => nextQuestion(), 650);
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
  // Limpa autosave — quiz finalizado, não precisa mais perguntar "continuar?"
  if (window.gnosisQuizSave) gnosisQuizSave.clear('disc');
  if (window.gnosisTrack) gnosisTrack('quiz_completed', { matriz: 'disc' });

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

  // Bloco "E agora?" — compartilhar + próximo teste recomendado
  if (window.gnosisPostResult) {
    window.gnosisPostResult.render({
      fromKey: 'disc',
      resultLabel: profile.title,
      resultDetail: profile.code + ' · ' + (scores[dominant] || 0) + '%',
      containerId: 'page-result',
    });
  }
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

    // Verifica se há sessão ativa antes de tentar gravar
    let hasSession = false;
    try {
      const { session } = await capsulaDB.authGetSession();
      hasSession = !!(session && session.user && session.user.email);
      if (hasSession && session.user.email.toLowerCase() !== userData.email.toLowerCase()) {
        console.warn('[Gnosis] Email da sessão (' + session.user.email + ') diverge do localStorage (' + userData.email + '). Salvando localmente.');
        setSyncStatus('Salvo localmente ✓');
        return;
      }
    } catch (e) {
      console.warn('[Gnosis] Falha ao checar sessão:', e);
    }

    if (!hasSession) {
      console.info('[Gnosis] Sem sessão ativa — resultado salvo apenas localmente. Faça login pra sincronizar com a nuvem.');
      setSyncStatus('Salvo localmente ✓ (faça login pra sincronizar)');
      return;
    }

    const { error } = await capsulaDB.saveUser(userData);

    if (error && error !== 'offline') {
      const msg = error.message || JSON.stringify(error);
      console.error('[Gnosis] Erro ao salvar resultado:', msg);
      // Mensagem mais útil pro user dependendo do tipo de erro
      if (msg.includes('permission') || error.code === '42501' || error.code === 'PGRST301') {
        setSyncStatus('Salvo localmente ✓ (sessão expirada — faça login)', true);
      } else {
        setSyncStatus('Erro ao sincronizar (resultado salvo localmente)', true);
      }
    } else {
      setSyncStatus('Resultado sincronizado ✓');
    }

  } catch (err) {
    if(window.capsulaUI) window.capsulaUI.toast('Erro ao salvar. Tente novamente.','error');
    console.error('[Gnosis] saveResultToSupabase falhou:', err);
    setSyncStatus('Salvo localmente ✓ (erro de conexão)', true);
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
  const user        = (capsulaDB.lsGetUser() || {});
  const nome        = getNomeExibido(user);
  const data        = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
  const dimNames    = {D:'Dominância',I:'Influência',S:'Estabilidade',C:'Conformidade'};
  const dimColors   = {D:'#E8603A',I:'#6C5FE6',S:'#2EC4A0',C:'#1BA8D4'};
  const dimOrder    = ['D','I','S','C'];
  const sortedDims  = [...dimOrder].sort((a,b)=>(scores[b]||0)-(scores[a]||0));
  const weakest     = sortedDims[sortedDims.length-1];

  // Radar 4-axis: D=top, I=right, S=bottom, C=left
  const ACCENT = '#7C6FF7'; // Paleta unificada do template (proposta B)
  const AXIS4 = {D:[110,38],I:[182,110],S:[110,182],C:[38,110]};
  const radarPts = dimOrder.map(d=>{const s=(scores[d]||0)/100;const[ox,oy]=AXIS4[d];return`${(110+(ox-110)*s).toFixed(1)},${(110+(oy-110)*s).toFixed(1)}`;}).join(' ');
  const radarSvg = `
    <svg viewBox="0 0 220 220" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <polygon points="110,38 182,110 110,182 38,110" fill="none" stroke="#e4e4e7" stroke-width="1"/>
      <polygon points="110,62 158,110 110,158 62,110" fill="none" stroke="#e4e4e7" stroke-width="1"/>
      <line x1="110" y1="110" x2="110" y2="38" stroke="#e4e4e7" stroke-width="1"/>
      <line x1="110" y1="110" x2="182" y2="110" stroke="#e4e4e7" stroke-width="1"/>
      <line x1="110" y1="110" x2="110" y2="182" stroke="#e4e4e7" stroke-width="1"/>
      <line x1="110" y1="110" x2="38" y2="110" stroke="#e4e4e7" stroke-width="1"/>
      <polygon points="${radarPts}" fill="${ACCENT}26" stroke="${ACCENT}" stroke-width="1.5"/>
      ${dimOrder.map(d=>{const s=(scores[d]||0)/100;const[ox,oy]=AXIS4[d];const cx=(110+(ox-110)*s).toFixed(1),cy=(110+(oy-110)*s).toFixed(1);const isDom=d===dominant;return `<circle cx="${cx}" cy="${cy}" r="${isDom?4:3}" fill="${isDom?ACCENT:'#a1a1aa'}" stroke="#fff" stroke-width="1.5"/>`;}).join('')}
      <text x="110" y="30" text-anchor="middle" font-family="IBM Plex Mono" font-size="9" font-weight="600" fill="${dominant==='D'?ACCENT:'#71717a'}">D · ${scores.D||0}%</text>
      <text x="195" y="113" text-anchor="start" font-family="IBM Plex Mono" font-size="9" font-weight="${dominant==='I'?'600':'400'}" fill="${dominant==='I'?ACCENT:'#71717a'}">I · ${scores.I||0}%</text>
      <text x="110" y="200" text-anchor="middle" font-family="IBM Plex Mono" font-size="9" font-weight="${dominant==='S'?'600':'400'}" fill="${dominant==='S'?ACCENT:'#71717a'}">S · ${scores.S||0}%</text>
      <text x="25" y="113" text-anchor="end" font-family="IBM Plex Mono" font-size="9" font-weight="${dominant==='C'?'600':'400'}" fill="${dominant==='C'?ACCENT:'#71717a'}">C · ${scores.C||0}%</text>
    </svg>`;

  const subtitle = `A alta ${dimNames[dominant].toLowerCase()} contrasta com a menor expressão de ${dimNames[weakest].toLowerCase()}. Essa polaridade define como você prioriza e reage sob pressão.`;

  Gnosis.pdf.render({
    matrizName: 'Perfil DISC',
    matrizSubname: 'Comportamento',
    userName: nome,
    date: data,
    accent: ACCENT,
    hero: {
      letter: dominant,
      eyebrow: 'Resultado · Perfil Dominante',
      title: profile.title,
      subtitle: profile.strengths,
    },
    dimensionsLabel: 'Distribuição DISC',
    dimensions: dimOrder.map(d => ({
      letter: d,
      name: dimNames[d],
      pct: scores[d] || 0,
      isDominant: d === dominant,
    })),
    analysisLabel: 'Análise comportamental',
    analysisBlocks: [
      { eyebrow: 'Fortalezas',        title: 'O que te coloca em vantagem', text: profile.strengths },
      { eyebrow: 'Pontos de atenção', title: 'O que pode atrapalhar',       text: profile.challenges },
      { eyebrow: 'Ambiente ideal',    title: 'Onde você floresce',          text: profile.environment },
      { eyebrow: 'Comunicação',       title: 'Como falar com você',         text: profile.communication },
    ],
    customSection: `
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:24px;align-items:center;">
        <div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.12em;color:${ACCENT};text-transform:uppercase;font-weight:500;margin-bottom:8px;">Polaridade comportamental</div>
          <h4 style="font-size:18px;font-weight:700;color:#18181b;letter-spacing:-0.015em;margin-bottom:10px;">${dominant} × ${weakest} — tensão estrutural</h4>
          <p style="font-size:12.5px;line-height:1.65;color:#52525b;">${subtitle}</p>
        </div>
        <div style="display:flex;justify-content:center;">${radarSvg}</div>
      </div>`,
    citation: 'Marston, W. M. (1928). <em>Emotions of Normal People.</em>',
    filename: 'disc-resultado.html',
  });
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
    const text = `Meu perfil DISC no Sistema Gnosis: ${profile.title} (${profile.code} ${scores[dominant]}%) — www.sistema-gnosis.com.br`;
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

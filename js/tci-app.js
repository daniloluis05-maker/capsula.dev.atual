
// Etapa 2 — era window.* global; convertido pra let no escopo do script.
let _autoNext;

﻿const DIMS = {
  BN: { name:'Busca de Novidade', color:'var(--BN)', hex:'#E8603A', neurochem:'Dopamina',
    low:'Reflexivo, consistente, econômico, metódico. Prefere profundidade a diversidade e resistência à impulsividade.',
    high:'Exploratório, impulsivo, excitável. Necessidade intrínseca de novidade e variedade para manter engajamento.' },
  ED: { name:'Esquiva de Danos', color:'var(--ED)', hex:'#1BA8D4', neurochem:'Serotonina',
    low:'Otimista, desinibido, energético. Baixo limiar de preocupação antecipatória. Tende à confiança mesmo sem dados.',
    high:'Cauteloso, antecipatório, sensível a ameaças. Alto processamento de risco. Recuperação mais lenta de estresse.' },
  DR: { name:'Dependência de Recompensa', color:'var(--DR)', hex:'#6C5FE6', neurochem:'Noradrenalina',
    low:'Pragmático, independente, não sentimental. Confortável com ambientes frios e feedbacks escassos.',
    high:'Empático, dependente de aprovação, sentimental. Conexão emocional como combustível primário de motivação.' },
  PE: { name:'Persistência', color:'var(--PE)', hex:'#2EC4A0', neurochem:'Glutamato',
    low:'Pragmático com esforço, adapta prioridades com facilidade. Confortável com projetos incompletos.',
    high:'Perseverante sem reforço externo, perfeccionista. Dificuldade de "soltar" — completa mesmo sem recompensa.' }
};

const QUESTIONS = [
  {id:"bn01",dim:"BN",rev:false,text:"Frequentemente experimento coisas novas só pela emoção de descobrir algo diferente."},
  {id:"bn02",dim:"BN",rev:false,text:"Quando encontro um problema, prefiro partir logo para a ação em vez de analisar tudo primeiro."},
  {id:"bn03",dim:"BN",rev:true, text:"Prefiro rotinas previsíveis a situações onde não sei o que vai acontecer."},
  {id:"bn04",dim:"BN",rev:false,text:"Fico entediado rapidamente quando preciso fazer a mesma coisa por muito tempo."},
  {id:"bn05",dim:"BN",rev:false,text:"Tomar decisões rápidas e impulsivas me parece natural, mesmo sem ter todas as informações."},
  {id:"bn06",dim:"BN",rev:true, text:"Sinto-me mais confortável seguindo planos estabelecidos do que improvisando."},
  {id:"bn07",dim:"BN",rev:false,text:"Ambientes novos e desconhecidos me energizam em vez de me deixar ansioso."},
  {id:"bn08",dim:"BN",rev:false,text:"Tenho tendência a gastar dinheiro por impulso em coisas que me parecem interessantes no momento."},
  {id:"bn09",dim:"BN",rev:true, text:"Prefiro ir fundo em um único assunto do que explorar muitas áreas diferentes ao mesmo tempo."},
  {id:"bn10",dim:"BN",rev:false,text:"A ideia de mudar de carreira ou cidade me parece estimulante, não assustadora."},
  {id:"bn11",dim:"BN",rev:false,text:"Costumo me envolver em várias atividades ao mesmo tempo, mesmo que isso gere caos."},
  {id:"bn12",dim:"BN",rev:true, text:"Tenho facilidade em resistir a tentações quando sei que preciso manter o foco."},
  {id:"bn13",dim:"BN",rev:false,text:"Mudo de ideia com frequência porque novas perspectivas me parecem mais interessantes."},
  {id:"bn14",dim:"BN",rev:false,text:"Sinto um prazer especial em ser o primeiro a experimentar algo que ninguém ao meu redor conhece."},
  {id:"ed01",dim:"ED",rev:false,text:"Antes de agir, costumo imaginar os piores cenários possíveis para estar preparado."},
  {id:"ed02",dim:"ED",rev:false,text:"Situações sociais novas me deixam mais tenso do que a maioria das pessoas ao meu redor."},
  {id:"ed03",dim:"ED",rev:true, text:"Enfrento situações de risco com bastante tranquilidade, sem me preocupar muito com o que pode dar errado."},
  {id:"ed04",dim:"ED",rev:false,text:"Fico preocupado com detalhes que outras pessoas parecem ignorar sem dificuldade."},
  {id:"ed05",dim:"ED",rev:false,text:"Me canso com facilidade em situações de pressão ou incerteza prolongada."},
  {id:"ed06",dim:"ED",rev:true, text:"Tenho muita energia mesmo em situações estressantes e raramente me sinto esgotado."},
  {id:"ed07",dim:"ED",rev:false,text:"Quando preciso falar com pessoas que não conheço, sinto um desconforto que vai além da timidez comum."},
  {id:"ed08",dim:"ED",rev:false,text:"Antecipo problemas com mais frequência do que as pessoas ao meu redor parecem fazer."},
  {id:"ed09",dim:"ED",rev:true, text:"Me sinto seguro tomando decisões importantes mesmo sem ter certeza do resultado."},
  {id:"ed10",dim:"ED",rev:false,text:"Prefiro evitar conflitos mesmo quando sei que enfrentá-los seria mais produtivo."},
  {id:"ed11",dim:"ED",rev:false,text:"Pequenas incertezas no futuro me causam um nível de ansiedade que reconheço como excessivo."},
  {id:"ed12",dim:"ED",rev:true, text:"Consigo relaxar facilmente mesmo quando há coisas pendentes ou incertas na minha vida."},
  {id:"ed13",dim:"ED",rev:false,text:"Demoro mais para me recuperar de situações estressantes do que a maioria das pessoas que conheço."},
  {id:"ed14",dim:"ED",rev:false,text:"Tendo a interpretar situações ambíguas de forma negativa antes de considerar interpretações positivas."},
  {id:"dr01",dim:"DR",rev:false,text:"A opinião das pessoas próximas sobre mim tem grande peso nas minhas decisões."},
  {id:"dr02",dim:"DR",rev:false,text:"Sinto-me profundamente afetado quando alguém que respeito expressa desaprovação ou decepção comigo."},
  {id:"dr03",dim:"DR",rev:true, text:"Consigo manter meu rumo mesmo sem reconhecimento ou feedback positivo das pessoas ao meu redor."},
  {id:"dr04",dim:"DR",rev:false,text:"Histórias com laços humanos fortes — amizade, lealdade, sacrifício — me tocam profundamente."},
  {id:"dr05",dim:"DR",rev:false,text:"Tenho dificuldade em dizer não quando alguém de quem gosto precisa de mim, mesmo que seja inconveniente."},
  {id:"dr06",dim:"DR",rev:true, text:"Prefiro trabalhar de forma independente e não me incomoda muito a falta de contato social no dia a dia."},
  {id:"dr07",dim:"DR",rev:false,text:"Me importo muito em manter harmonia nos meus relacionamentos, às vezes mais do que seria necessário."},
  {id:"dr08",dim:"DR",rev:false,text:"Sinto necessidade de compartilhar conquistas com pessoas próximas — celebrar sozinho não tem o mesmo sabor."},
  {id:"dr09",dim:"DR",rev:true, text:"Consigo encerrar relacionamentos ou afastamentos sem sentir culpa ou tristeza prolongada."},
  {id:"dr10",dim:"DR",rev:false,text:"Demonstrações de afeto e calor humano são fundamentais para eu me sentir motivado no trabalho."},
  {id:"dr11",dim:"DR",rev:false,text:"Lembro de detalhes emocionais de conversas e experiências muito tempo depois que aconteceram."},
  {id:"dr12",dim:"DR",rev:true, text:"Adapto-me bem a ambientes frios e formais onde o relacionamento pessoal não é valorizado."},
  {id:"dr13",dim:"DR",rev:false,text:"Quando alguém está triste ao meu redor, sinto isso fisicamente — uma espécie de peso no peito."},
  {id:"dr14",dim:"DR",rev:false,text:"Críticas — mesmo construtivas — me afetam emocionalmente mais do que racionalmente reconheço como necessário."},
  {id:"pe01",dim:"PE",rev:false,text:"Continuo trabalhando num projeto mesmo quando os resultados demoram a aparecer."},
  {id:"pe02",dim:"PE",rev:false,text:"Tenho dificuldade em abandonar uma tarefa antes de concluí-la, mesmo quando seria mais inteligente parar."},
  {id:"pe03",dim:"PE",rev:true, text:"Quando o ambiente para de me recompensar por algo, perco o interesse rapidamente."},
  {id:"pe04",dim:"PE",rev:false,text:"Me considero mais resistente à frustração do que a maioria quando os planos não saem como esperado."},
  {id:"pe05",dim:"PE",rev:false,text:"Costumo trabalhar além do necessário porque sinto que posso sempre melhorar um pouco mais."},
  {id:"pe06",dim:"PE",rev:true, text:"Desisto de objetivos com relativa facilidade quando percebo que o progresso está muito lento."},
  {id:"pe07",dim:"PE",rev:false,text:"Uma vez que decido fazer algo, raramente mudo de ideia por pressão externa ou obstáculos iniciais."},
  {id:"pe08",dim:"PE",rev:false,text:"Tenho uma tendência ao perfeccionismo que às vezes atrasa a entrega de resultados."},
  {id:"pe09",dim:"PE",rev:true, text:"Me conformo rapidamente com resultados parciais quando o esforço para ir além parece desproporcional."},
  {id:"pe10",dim:"PE",rev:false,text:"Quando acredito que algo é correto, mantenho minha posição mesmo sob pressão social intensa."},
  {id:"pe11",dim:"PE",rev:false,text:"Sinto um incômodo genuíno quando deixo tarefas incompletas, mesmo tarefas pequenas."},
  {id:"pe12",dim:"PE",rev:true, text:"Tenho facilidade em 'soltar' projetos e ideias quando surgem prioridades mais urgentes."},
  {id:"pe13",dim:"PE",rev:false,text:"Obstáculos no meio de um projeto me motivam mais do que me desanimam."},
  {id:"pe14",dim:"PE",rev:false,text:"Prefiro fazer algo com excelência e levar mais tempo do que entregar algo bom no prazo."}
];

const HINTS = ['Definitivamente não sou assim','Geralmente não sou assim','Às vezes sim, às vezes não','Geralmente sou assim','Definitivamente sou assim'];
const DIM_LABELS = {BN:'Busca de Novidade',ED:'Esquiva de Danos',DR:'Dep. de Recompensa',PE:'Persistência'};

// Embaralha questões mantendo balanceamento por dimensão
function shuffleQuestions() {
  const byDim = {BN:[],ED:[],DR:[],PE:[]};
  QUESTIONS.forEach(q => byDim[q.dim].push({...q}));
  const result = [];
  for (let i = 0; i < 14; i++) {
    ['BN','ED','DR','PE'].forEach(d => result.push(byDim[d][i]));
  }
  return result;
}

let questions = [];
let current = 0;
let answers = {};

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function startQuiz() {
  if (window.gnosisTrack) gnosisTrack('quiz_started', { matriz: 'tci' });
  // Autosave: tenta restaurar progresso. TCI embaralha QUESTIONS no início,
  // então salvamos também a ordem (questionIds) pra reconstruir o quiz na
  // mesma sequência que o user já estava respondendo.
  if (window.gnosisQuizSave) {
    const saved = gnosisQuizSave.restore('tci');
    if (saved && saved.state && Array.isArray(saved.state.questionIds) && saved.state.answers) {
      const answered = Object.keys(saved.state.answers).length;
      const total = saved.state.questionIds.length;
      if (answered > 0 && answered < total) {
        // Reconstrói questions na ordem salva (lookup por id em QUESTIONS source)
        const byId = {};
        QUESTIONS.forEach(q => { byId[q.id] = q; });
        const restored = saved.state.questionIds.map(id => byId[id]).filter(Boolean);
        if (restored.length === total) {
          gnosisQuizSave.promptResume({
            matriz: 'tci', label: 'TCI',
            summary: answered + ' de ' + total + ' perguntas respondidas',
            onResume: function () {
              questions = restored;
              answers = Object.assign({}, saved.state.answers);
              current = typeof saved.state.current === 'number' ? saved.state.current : answered;
              if (current >= total) current = total - 1;
              showPage('page-quiz'); renderQuestion(current);
            },
            onRestart: function () {
              questions = shuffleQuestions();
              current = 0; answers = {};
              showPage('page-quiz'); renderQuestion(0);
            },
          });
          return;
        }
      }
    }
  }
  questions = shuffleQuestions();
  current = 0;
  answers = {};
  showPage('page-quiz');
  renderQuestion(0);
}

function goBack() {
  if (current === 0) showPage('page-intro');
  else { current--; renderQuestion(current); }
}

function renderQuestion(idx) {
  const q = questions[idx];
  const pct = Math.round((idx / questions.length) * 100);
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-label').textContent = `${idx + 1} de ${questions.length}`;
  const d = DIMS[q.dim];
  const sel = answers[q.id] || null;
  const card = document.getElementById('q-card');
  card.style.animation = 'none'; card.offsetHeight; card.style.animation = '';
  card.innerHTML = `
    <div class="q-dim-tag" style="color:${d.color};border-color:${d.color}44;background:${d.hex}11;">
      <span style="width:5px;height:5px;border-radius:50%;background:${d.color};display:inline-block;flex-shrink:0;"></span>
      ${DIM_LABELS[q.dim]}
    </div>
    <div class="q-text">${q.text}</div>
    <div class="scale-row">
      <div class="scale-pole">Não me<br>representa</div>
      <div class="scale-btns" role="radiogroup" aria-label="Avalie de 1 (não me representa) a 5 (me representa)">
        ${[1,2,3,4,5].map(v => `
          <button class="scale-btn ${sel===v?'selected':''}" data-val="${v}"
            style="color:${d.color}"
            onclick="selectAnswer('${q.id}',${v},${idx})"
            title="${HINTS[v-1]}"
            role="radio"
            aria-checked="${sel===v?'true':'false'}"
            aria-label="Nota ${v} de 5"></button>
        `).join('')}
      </div>
      <div class="scale-pole">Me<br>representa</div>
    </div>
    <div class="scale-hint" id="scale-hint" aria-live="polite">${sel ? HINTS[sel-1] : '// toque para avaliar'}</div>
    <div class="quiz-actions">
      <button class="btn-next ${sel?'ready':''}" id="btn-next" onclick="nextQuestion()">
        ${idx === questions.length - 1 ? 'Ver meu perfil →' : 'Próxima →'}
      </button>
    </div>
  `;
}

function selectAnswer(id, val, idx) {
  answers[id] = val;
  // Salva ordem das questions junto pra reconstruir na mesma sequência
  if (window.gnosisQuizSave) {
    gnosisQuizSave.save('tci', {
      answers: answers, current: idx,
      questionIds: questions.map(q => q.id),
    });
  }
  document.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.scale-btn[data-val="${val}"]`).classList.add('selected');
  document.getElementById('scale-hint').textContent = HINTS[val - 1];
  document.getElementById('btn-next').classList.add('ready');
  clearTimeout(_autoNext);
  _autoNext = setTimeout(() => nextQuestion(), 750);
}

function nextQuestion() {
  if (!answers[questions[current].id]) return;
  current++;
  if (current >= questions.length) calcResult();
  else renderQuestion(current);
}

function calcResult() {
  if (window.gnosisQuizSave) gnosisQuizSave.clear('tci');
  if (window.gnosisTrack) gnosisTrack('quiz_completed', { matriz: 'tci' });
  showPage('page-loading');
  // Score: 1-5, reversed items invert the scale (score = 6 - raw)
  const raw = {BN:0,ED:0,DR:0,PE:0};
  const counts = {BN:0,ED:0,DR:0,PE:0};
  QUESTIONS.forEach(q => {
    const val = answers[q.id];
    if (!val) return;
    raw[q.dim] += q.rev ? (6 - val) : val;
    counts[q.dim]++;
  });
  // Normalize to 0-100
  const scores = {};
  ['BN','ED','DR','PE'].forEach(d => {
    scores[d] = counts[d] ? Math.round((raw[d] / (counts[d] * 5)) * 100) : 0;
  });
  setTimeout(() => showResult(scores), 800);
}

function scoreLabel(s) {
  if (s >= 75) return 'Muito alto';
  if (s >= 60) return 'Alto';
  if (s >= 40) return 'Moderado';
  if (s >= 25) return 'Baixo';
  return 'Muito baixo';
}

function showResult(scores) {
  const u = capsulaDB.lsGetUser() || {};
  const nome = u.apelido || u.nome || 'Usuário';
  document.getElementById('res-nome').textContent = nome;
  showPage('page-result');

  // Render dim cards
  const grid = document.getElementById('dims-grid');
  grid.innerHTML = ['BN','ED','DR','PE'].map(d => {
    const s = scores[d];
    const dim = DIMS[d];
    const isHigh = s >= 50;
    return `
      <div class="dim-card dc-${d}">
        <div class="dim-label" style="color:${dim.color};">${dim.name} · ${dim.neurochem}</div>
        <div class="dim-score-row">
          <span class="dim-score-num" style="color:${dim.color};">${s}%</span>
          <span class="dim-score-label">${scoreLabel(s)}</span>
        </div>
        <div class="dim-bar-track">
          <div class="dim-bar-fill" style="width:0%;background:${dim.color};" data-target="${s}"></div>
        </div>
        <div class="dim-desc">${isHigh ? dim.high : dim.low}</div>
      </div>`;
  }).join('');

  // Animate bars
  setTimeout(() => {
    grid.querySelectorAll('.dim-bar-fill').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }, 100);

  // Save
  u.tci = { scores, completedAt: new Date().toISOString() };
  if (!u.uid) u.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  capsulaDB.lsSetUser(u);
  try { sessionStorage.setItem('capsula_user', JSON.stringify(u)); } catch(_) {}
  try {
    const perfis = capsulaDB.lsGetUsers();
    const idx = perfis.findIndex(p => p.uid === u.uid);
    if (idx >= 0) { perfis[idx].tci = u.tci; capsulaDB.lsSetUsers(perfis); }
  } catch(e) {}
  if (window.capsulaDB && u.email) capsulaDB.syncMatrizes(u).catch(e => console.warn('[tci] sync:', e));

  // AI interpretation
  generateAI(scores, u);

  // Bloco "E agora?"
  if (window.gnosisPostResult) {
    const topDim = ['BN','ED','DR','PE'].reduce((a,b)=> (scores[a]||0) > (scores[b]||0) ? a : b);
    window.gnosisPostResult.render({
      fromKey: 'tci',
      resultLabel: DIMS[topDim].name + ' ' + (scores[topDim] || 0) + '%',
      containerId: 'page-result',
    });
  }
}

async function generateAI(scores, u) {
  const block = document.getElementById('ai-content');

  // Cruzamento com outros testes (DISC, Big Five, Âncoras) REMOVIDO do
  // prompt. O TCI deve ser analisado isoladamente — integração entre
  // matrizes acontece somente no DNA Estratégico.
  const prompt = `Você é um especialista em psicologia do temperamento. Analise o perfil TCI abaixo e gere uma interpretação em português do Brasil.

PERFIL TCI:
- Busca de Novidade (dopamina): ${scores.BN}% — ${scoreLabel(scores.BN)}
- Esquiva de Danos (serotonina): ${scores.ED}% — ${scoreLabel(scores.ED)}
- Dep. de Recompensa (noradrenalina): ${scores.DR}% — ${scoreLabel(scores.DR)}
- Persistência (glutamato): ${scores.PE}% — ${scoreLabel(scores.PE)}

INSTRUÇÕES:
1. Explique o que a combinação específica dessas 4 dimensões revela sobre o funcionamento neurobiológico desta pessoa
2. Identifique o padrão mais marcante (ex: BN alto + ED alto = explorador ansioso)
3. Aponte: (a) Fortalezas naturais desse perfil, (b) Pontos de atenção / vieses do temperamento, (c) Caminhos práticos de desenvolvimento
4. Termine com uma frase de impacto de 1 linha que define a assinatura temperamental

Tom: científico mas acessível. Sem listas ou tópicos — use parágrafos corridos. Máximo 240 palavras. Use <strong> para destacar termos-chave. Importante: NÃO mencione outros testes (DISC, Big Five, Eneagrama, SOAR, etc) — analise APENAS o TCI.`;

  try {
    const cfg = window.CAPSULA_CONFIG || {};
    const res = await fetch((cfg.supabaseUrl || '') + '/functions/v1/groq-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (cfg.supabaseKey || '') },
      body: JSON.stringify({
        email: (u && u.email) || 'remote@respondent.local',
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (res.status === 429) { block.innerHTML = interpretacaoLocal(scores); return; }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (text) {
      block.innerHTML = `<div class="ai-content">${text}</div>`;
    } else {
      block.innerHTML = interpretacaoLocal(scores);
    }
  } catch(e) {
    console.error('[tci] generateAI:', e);
    block.innerHTML = interpretacaoLocal(scores);
  }
}

function interpretacaoLocal(scores) {
  const top = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0];
  const low = Object.entries(scores).sort((a,b)=>a[1]-b[1])[0];
  const d = DIMS[top[0]];
  return `<div class="ai-content">Sua dimensão dominante é <strong>${d.name}</strong> (${top[1]}%), com base ${d.neurochem.toLowerCase()}. ${d.high} A dimensão mais moderada é <strong>${DIMS[low[0]].name}</strong> (${low[1]}%), indicando ${DIMS[low[0]].low.toLowerCase()}</div>`;
}

function generatePDF() {
  if (window._payments) {
    _payments.serverDebitCredit('tci').then(function(ok) {
      if (!ok) { _payments.showPaywall('tci'); return; }
      _generatePDF();
    });
    return;
  }
  _generatePDF();
}
function _generatePDF() {
  const u = capsulaDB.lsGetUser() || {};
  const nome = u.apelido || u.nome || 'Usuário';
  const tciScores = u.tci?.scores || {};
  const data = new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'short',year:'numeric'});
  const dimKeys = ['BN','ED','DR','PE'];
  const dominant2 = dimKeys.reduce((a,b)=>(tciScores[a]||0)>(tciScores[b]||0)?a:b);
  const weakest2  = dimKeys.reduce((a,b)=>(tciScores[a]||0)<(tciScores[b]||0)?a:b);
  const domDim = DIMS[dominant2], weakDim = DIMS[weakest2];
  const insightText2 = interpretacaoLocal(tciScores).replace(/<[^>]+>/g,'').slice(0,420);
  const isDomHigh = (tciScores[dominant2]||0) >= 50;
  const isWeakHigh = (tciScores[weakest2]||0) >= 50;

  Gnosis.pdf.render({
    matrizName: 'Temperamento TCI',
    matrizSubname: 'Cloninger · Neurociência',
    userName: nome,
    date: data,
    hero: {
      letter: dominant2,
      eyebrow: 'Dimensão Dominante · Temperamento',
      title: domDim.name,
      subtitle: isDomHigh ? domDim.hi : domDim.lo,
    },
    dimensionsLabel: 'Perfil de temperamento',
    dimensions: dimKeys.map(d => ({
      letter: d,
      name: DIMS[d].name,
      pct: tciScores[d] || 0,
      isDominant: d === dominant2,
    })),
    analysisLabel: 'Análise neuroquímica',
    analysisBlocks: [
      { eyebrow: 'Síntese',          title: 'Sua assinatura inata',                            text: insightText2 },
      { eyebrow: 'Base biológica',   title: domDim.name + ' · ' + (domDim.bio || ''),         text: 'Esta dimensão tem base neuroquímica — não é apenas comportamento aprendido, mas tendência inata que opera desde o nascimento.' },
      { eyebrow: 'Dimensão oposta',  title: weakDim.name + ' (' + (tciScores[weakest2]||0) + '%)', text: isWeakHigh ? weakDim.hi : weakDim.lo },
      { eyebrow: 'Aplicação',        title: 'Use isto pra entender você',                      text: 'Diferente de comportamento (que muda conforme o contexto), seu temperamento é estável ao longo da vida. Conhecê-lo ajuda a escolher ambientes e papéis que fluem em vez de exigir esforço constante.' },
    ],
    citation: 'Cloninger, C. R. (1994). <em>Temperament and Character Inventory (TCI).</em>',
    filename: 'tci-resultado.html',
  });
}

// Proteção de rota + restaura resultado anterior
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const u = (await capsulaDB.ensureUserData()) || {};
    if (!u.nome && !u.apelido && !u.email && !(u.tci && u.tci.completedAt)) {
      window.location.href = 'index.html'; return;
    }

    if (window._payments && !_payments.isPro() && !_payments.isAdmin()) {
      const _c = _payments.getCredits();
      const _hasSpec = (_c['tci'] || 0) > 0, _hasAvul = (_c.avulsos || 0) > 0;
      if (!_hasSpec && !_hasAvul) {
        _payments.showPaywall('tci');
        const _gate = new MutationObserver(function() {
          if (!document.getElementById('_paywall-modal')) {
            _gate.disconnect();
            if (!_payments.hasAccess('tci')) window.location.href = 'dashboard.html';
          }
        });
        _gate.observe(document.body, { childList: true, subtree: true });
        return;
      }
      if (!_hasSpec && _hasAvul) await _payments.unlockMatrix('tci');
    }
    if (!u.uid) {
      u.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
      try { capsulaDB.lsSetUser(u); } catch(_) {}
    }
    if (u.tci && u.tci.completedAt && u.tci.scores) {
      answers = {};
      QUESTIONS.forEach(q => { answers[q.id] = 3; });
      showResult(u.tci.scores);
    }
  } catch(e) {}
});

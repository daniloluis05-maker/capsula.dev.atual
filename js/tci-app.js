const DIMS = {
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
      <div class="scale-btns">
        ${[1,2,3,4,5].map(v => `
          <button class="scale-btn ${sel===v?'selected':''}" data-val="${v}"
            style="color:${d.color}"
            onclick="selectAnswer('${q.id}',${v},${idx})"
            title="${HINTS[v-1]}"></button>
        `).join('')}
      </div>
      <div class="scale-pole">Me<br>representa</div>
    </div>
    <div class="scale-hint" id="scale-hint">${sel ? HINTS[sel-1] : '// toque para avaliar'}</div>
    <div class="quiz-actions">
      <button class="btn-next ${sel?'ready':''}" id="btn-next" onclick="nextQuestion()">
        ${idx === questions.length - 1 ? 'Ver meu perfil →' : 'Próxima →'}
      </button>
    </div>
  `;
}

function selectAnswer(id, val, idx) {
  answers[id] = val;
  document.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.scale-btn[data-val="${val}"]`).classList.add('selected');
  document.getElementById('scale-hint').textContent = HINTS[val - 1];
  document.getElementById('btn-next').classList.add('ready');
  clearTimeout(window._autoNext);
  window._autoNext = setTimeout(() => nextQuestion(), 750);
}

function nextQuestion() {
  if (!answers[questions[current].id]) return;
  current++;
  if (current >= questions.length) calcResult();
  else renderQuestion(current);
}

function calcResult() {
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
}

async function generateAI(scores, u) {
  const block = document.getElementById('ai-content');
  const disc = (u.disc?.scores) || {};
  const bf = (u.bigfive?.scores) || {};
  const anc = u.ancoras || {};

  const prompt = `Você é um especialista em psicologia do temperamento. Analise o perfil TCI abaixo e gere uma interpretação integrada em português do Brasil.

PERFIL TCI:
- Busca de Novidade (dopamina): ${scores.BN}% — ${scoreLabel(scores.BN)}
- Esquiva de Danos (serotonina): ${scores.ED}% — ${scoreLabel(scores.ED)}
- Dep. de Recompensa (noradrenalina): ${scores.DR}% — ${scoreLabel(scores.DR)}
- Persistência (glutamato): ${scores.PE}% — ${scoreLabel(scores.PE)}

${Object.keys(disc).length ? `DISC disponível: D=${disc.D||0}% I=${disc.I||0}% S=${disc.S||0}% C=${disc.C||0}%` : ''}
${Object.keys(bf).length ? `Big Five: O=${bf.O||0}% C=${bf.C||0}% E=${bf.E||0}% A=${bf.A||0}% N=${bf.N||0}%` : ''}
${anc.topAnchor ? `Âncora principal: ${anc.topAnchor}` : ''}

INSTRUÇÕES:
1. Explique o que a combinação específica dessas 4 dimensões revela sobre o funcionamento neurobiológico desta pessoa
2. Identifique o padrão mais marcante (ex: BN alto + ED alto = explorador ansioso)
3. Se houver dados de DISC ou Big Five, mostre 1-2 cruzamentos relevantes
4. Termine com uma frase de impacto de 1 linha que define a assinatura temperamental

Tom: científico mas acessível. Sem listas ou tópicos — use parágrafos corridos. Máximo 200 palavras. Use <strong> para destacar termos-chave.`;

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
  const data = new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'long',year:'numeric'});
  const ACCENT = '#7000FF';
  // NEW PDF v2 — 2-col layout uniform with other matrices
  const dimKeys = ['BN','ED','DR','PE'];
  const dominant2 = dimKeys.reduce((a,b)=>(tciScores[a]||0)>(tciScores[b]||0)?a:b);
  const weakest2  = dimKeys.reduce((a,b)=>(tciScores[a]||0)<(tciScores[b]||0)?a:b);
  const sorted2 = [...dimKeys].sort((a,b)=>(tciScores[b]||0)-(tciScores[a]||0));
  const domDim = DIMS[dominant2], weakDim = DIMS[weakest2];
  const insightText2 = interpretacaoLocal(tciScores).replace(/<[^>]+>/g,'').slice(0,420);

  // Radar 4-axis: BN=top, ED=right, DR=bottom, PE=left
  const AXIS4t = {BN:[130,42],ED:[218,130],DR:[130,218],PE:[42,130]};
  const radarPts4=dimKeys.map(d=>{const s=(tciScores[d]||0)/100;const[ox,oy]=AXIS4t[d];return`${(130+(ox-130)*s).toFixed(1)},${(130+(oy-130)*s).toFixed(1)}`;}).join(' ');
  const radarDots4=dimKeys.map(d=>{const s=(tciScores[d]||0)/100;const[ox,oy]=AXIS4t[d];const cx=(130+(ox-130)*s).toFixed(1),cy=(130+(oy-130)*s).toFixed(1);return`<circle cx="${cx}" cy="${cy}" r="3.5" fill="${DIMS[d].hex}" stroke="#f8fafc" stroke-width="1.5"/>`;}).join('');

  const _gnCss2 = `*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Inter',sans-serif;background:#f8fafc;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.page{width:794px;height:1123px;overflow:hidden;margin:0 auto;padding:24px 34px;background:#f8fafc;display:flex;flex-direction:column;}
.hd{display:flex;justify-content:space-between;align-items:center;padding-bottom:11px;border-bottom:2px solid #000;margin-bottom:13px;flex-shrink:0;}
.brand{display:flex;align-items:center;gap:7px;}.brand-name{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;}.brand-name em{color:ACC;font-style:italic;font-weight:300;}
.hd-meta{font-family:'Space Mono',monospace;font-size:7px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;text-align:right;line-height:1.85;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;flex:1;min-height:0;}.col{display:flex;flex-direction:column;gap:9px;min-height:0;overflow:hidden;}
.pn{background:#fafafa;border:1px solid #000;padding:13px 15px;position:relative;flex-shrink:0;}
.pn-grow{background:#fff;border:1px solid #000;padding:13px 15px;position:relative;flex:1;min-height:0;display:flex;flex-direction:column;}
.lbl{position:absolute;top:-8px;left:12px;background:#000;color:#fff;font-family:'Space Mono',monospace;font-size:6.5px;padding:1px 7px;text-transform:uppercase;letter-spacing:0.15em;}
.dom-hero{display:flex;align-items:center;gap:11px;margin-bottom:9px;}
.dom-letter{width:48px;height:48px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Space Mono',monospace;font-size:13px;font-weight:900;text-align:center;line-height:1.2;}
.dom-ew{font-family:'Space Mono',monospace;font-size:7px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:ACC;margin-bottom:2px;}
.dom-name{font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:1.1;}
.arch-badge{display:inline-flex;align-items:center;gap:4px;font-family:'Space Mono',monospace;font-size:6.5px;padding:2px 7px;border:1px solid;text-transform:uppercase;letter-spacing:0.07em;margin-top:7px;}
.arch-desc{font-size:8.5px;line-height:1.7;color:#333;margin-top:9px;}
.ins-lbl{font-family:'Space Mono',monospace;font-size:6.5px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:ACC;margin-bottom:7px;display:flex;align-items:center;gap:5px;flex-shrink:0;}
.ins-lbl::before{content:'';width:14px;height:2px;background:ACC;border-radius:2px;display:inline-block;}
.ins-txt{font-size:8.5px;color:#444;line-height:1.75;flex-shrink:0;}
.chips-row{display:flex;flex-wrap:wrap;gap:4px;margin-top:9px;flex-shrink:0;}
.chip{font-family:'Space Mono',monospace;font-size:6.5px;padding:2px 7px;border:1px solid;text-transform:uppercase;letter-spacing:0.07em;}
.tension-box{margin-top:10px;padding-top:9px;border-top:1px solid #e4e4e7;flex:1;display:flex;flex-direction:column;justify-content:center;}
.tension-lbl{font-family:'Space Mono',monospace;font-size:6.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;margin-bottom:7px;text-align:center;}
.tension-row{display:flex;align-items:center;gap:8px;}.t-arch{display:flex;align-items:center;gap:6px;flex:1;padding:6px 8px;border:1px solid;border-radius:2px;}
.t-letter{width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Space Mono',monospace;font-size:7px;font-weight:900;text-align:center;line-height:1.1;}
.t-name{font-size:8.5px;font-weight:700;}.t-pct{font-family:'Space Mono',monospace;font-size:7.5px;}
.t-arrow{font-family:'Space Mono',monospace;font-size:9px;color:#a1a1aa;flex-shrink:0;}
.tension-note{font-size:7.5px;color:#71717a;line-height:1.65;margin-top:6px;text-align:center;}
.sr{display:flex;align-items:center;gap:7px;padding:4px 0;border-bottom:1px solid #f1f5f9;}
.sr-rank{font-family:'Space Mono',monospace;font-size:7px;color:#a1a1aa;min-width:14px;}
.sr-ico{width:22px;height:22px;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Space Mono',monospace;font-size:7px;font-weight:900;text-align:center;line-height:1.1;}
.sr-name{font-size:9px;font-weight:700;flex:1;}.sr-track{flex:1;height:5px;background:#f1f5f9;border-radius:3px;overflow:hidden;max-width:110px;}
.sr-fill{height:100%;border-radius:3px;}.sr-pct{font-family:'Space Mono',monospace;font-size:7.5px;min-width:28px;text-align:right;}
.bp-item{flex-shrink:0;padding-top:7px;border-top:1px solid #f1f5f9;}
.bp-item:first-child{padding-top:0;border-top:none;}
.bp-tag{font-family:'Space Mono',monospace;font-size:6px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;}
.bp-txt{font-size:7.5px;line-height:1.65;color:#333;}
.ft{padding-top:9px;border-top:2px solid #000;display:flex;justify-content:space-between;align-items:center;margin-top:9px;flex-shrink:0;}
.ft-l{font-family:'Space Mono',monospace;font-size:6px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;}
.ft-r{font-family:'Space Mono',monospace;font-size:7.5px;font-weight:700;color:#000;}
@media print{@page{margin:0;size:A4;}body{background:#f8fafc!important;}.page{width:100%;}}`.split('ACC').join(ACCENT);

  const barsHTML2 = dimKeys.map(d=>{
    const dim=DIMS[d],pct=tciScores[d]||0,isDom=d===dominant2;
    return `<div style="border:1px solid ${isDom?dim.hex+'50':'#e4e4e7'};padding:7px 9px;background:${isDom?dim.hex+'08':'#fff'};${isDom?'':'opacity:0.5;'}">
      <div style="font-family:'Space Mono',monospace;font-size:6px;font-weight:700;color:${dim.hex};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;">${d}</div>
      <div style="font-size:16px;font-weight:900;color:${dim.hex};">${pct}%</div>
      <div style="height:3px;background:#f1f5f9;border-radius:2px;margin-top:3px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:${dim.hex};border-radius:2px;"></div></div>
    </div>`;
  }).join('');

  const rankingHTML2 = sorted2.map((d,i)=>{
    const dim=DIMS[d],pct=tciScores[d]||0,last=i===3?'border-bottom:none;':'';
    return `<div class="sr" style="${last}"><span class="sr-rank">${String(i+1).padStart(2,'0')}</span><div class="sr-ico" style="background:${dim.hex}15;border:1px solid ${dim.hex}30;color:${dim.hex};">${d}</div><span class="sr-name">${dim.name}</span><div class="sr-track" style="max-width:110px;"><div class="sr-fill" style="width:${pct}%;background:${dim.hex};"></div></div><span class="sr-pct" style="color:${dim.hex};">${pct}%</span></div>`;
  }).join('');

  const chipsHTML2 = sorted2.slice(0,2).map(d=>`<span class="chip" style="color:${DIMS[d].hex};border-color:${DIMS[d].hex}40;background:${DIMS[d].hex}08;">${DIMS[d].name}</span>`).join('');

  _imprimirPDF(`<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8"><title>Temperamento TCI — ${nome} · Sistema Gnosis</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>${_gnCss2}</style></head><body><div class="page">
  <div class="hd">
    <div class="brand"><svg viewBox="0 0 100 100" fill="none" width="26" height="26"><path d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C59.66 15 68.38 18.91 74.72 25.22" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><path d="M85 50H55" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><circle cx="85" cy="50" r="4" fill="${ACCENT}"/></svg><span class="brand-name">SISTEMA <em>Gnosis</em></span></div>
    <div class="hd-meta">Módulo: Temperamento TCI · Cloninger<br>${data.toUpperCase()}<br>${nome.toUpperCase()}</div>
  </div>
  <div class="grid">
    <div class="col">
      <div class="pn">
        <div class="lbl">Temperamento_Dominante</div>
        <div class="dom-hero">
          <div class="dom-letter" style="background:${domDim.hex}12;border:1px solid ${domDim.hex}35;color:${domDim.hex};">${dominant2}</div>
          <div>
            <div class="dom-ew">Resultado · Temperamento TCI</div>
            <div class="dom-name" style="color:${domDim.hex};">${domDim.name}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">${barsHTML2}</div>
        <div class="arch-badge" style="color:${domDim.hex};border-color:${domDim.hex}40;background:${domDim.hex}08;">${domDim.neurochem}</div>
        <p class="arch-desc">${domDim.high.split('.')[0]}.</p>
      </div>
      <div class="pn-grow">
        <div class="lbl">Análise_do_Perfil</div>
        <div class="ins-lbl">Síntese Temperamental</div>
        <p class="ins-txt">${insightText2}</p>
        <div class="chips-row">${chipsHTML2}</div>
        <div class="tension-box">
          <div class="tension-lbl">// Zona de Tensão · Polaridade Temperamental</div>
          <div class="tension-row">
            <div class="t-arch" style="border-color:${domDim.hex}35;background:${domDim.hex}08;">
              <div class="t-letter" style="background:${domDim.hex}15;border:1px solid ${domDim.hex}30;color:${domDim.hex};">${dominant2}</div>
              <div><div class="t-name" style="color:${domDim.hex};">${domDim.name}</div><div class="t-pct" style="color:${domDim.hex};">${tciScores[dominant2]||0}% · dominante</div></div>
            </div>
            <div class="t-arrow">⟷</div>
            <div class="t-arch" style="border-color:${weakDim.hex}35;background:${weakDim.hex}06;">
              <div class="t-letter" style="background:${weakDim.hex}15;border:1px solid ${weakDim.hex}30;color:${weakDim.hex};">${weakest2}</div>
              <div><div class="t-name" style="color:${weakDim.hex};">${weakDim.name}</div><div class="t-pct" style="color:${weakDim.hex};">${tciScores[weakest2]||0}% · moderado</div></div>
            </div>
          </div>
          <p class="tension-note">A predominância de ${domDim.name.toLowerCase()} (${tciScores[dominant2]||0}%) contrasta com ${weakDim.name.toLowerCase()} (${tciScores[weakest2]||0}%) — base neuroquímica: ${domDim.neurochem.toLowerCase()}.</p>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="pn" style="flex-shrink:0;">
        <div class="lbl">Ranking_TCI</div>
        <div style="padding-top:5px;">${rankingHTML2}</div>
      </div>
      <div class="pn-grow">
        <div class="lbl">Mapa_Visual_TCI</div>
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding-top:4px;">
          <svg viewBox="0 0 260 260" width="190" height="190" xmlns="http://www.w3.org/2000/svg">
            <defs><radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.18"/><stop offset="100%" stop-color="${ACCENT}" stop-opacity="0.04"/></radialGradient></defs>
            <polygon points="130,74 186,130 130,186 74,130" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
            <polygon points="130,96 164,130 130,164 96,130" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
            <line x1="130" y1="130" x2="130" y2="42" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
            <line x1="130" y1="130" x2="218" y2="130" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
            <line x1="130" y1="130" x2="130" y2="218" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
            <line x1="130" y1="130" x2="42" y2="130" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
            <polygon points="${radarPts4}" fill="url(#rg)" stroke="${ACCENT}" stroke-width="1.5" stroke-opacity="0.7"/>
            ${radarDots4}
            <text x="130" y="36" text-anchor="middle" font-family="Space Mono,monospace" font-size="7" fill="${DIMS.BN.hex}" font-weight="700">BN ${tciScores.BN||0}%</text>
            <text x="224" y="133" text-anchor="start" font-family="Space Mono,monospace" font-size="7" fill="${DIMS.ED.hex}">ED ${tciScores.ED||0}%</text>
            <text x="130" y="230" text-anchor="middle" font-family="Space Mono,monospace" font-size="7" fill="${DIMS.DR.hex}">DR ${tciScores.DR||0}%</text>
            <text x="36" y="133" text-anchor="end" font-family="Space Mono,monospace" font-size="7" fill="${DIMS.PE.hex}">PE ${tciScores.PE||0}%</text>
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div class="ft"><span class="ft-l">Sistema Gnosis // Temperamento TCI // Cloninger // Confidencial</span><span class="ft-r">www.sistema-gnosis.com.br</span></div>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>
  </body></html>`);
  return;
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

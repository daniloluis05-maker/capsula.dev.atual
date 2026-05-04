// ══════════════════════════════════════
// DADOS: BFI — 44 itens validados
// Fonte: John, O. P., & Srivastava, S. (1999)
// ══════════════════════════════════════

// Dimensões
const DIMS = {
  O: { key:'O', name:'Abertura',           short:'Abertura à Experiência', icon:'🔭', color:'#E8603A',
       hi:'Criativo, curioso, aberto a novas ideias e experiências. Aprecia arte, imaginação e variedade.',
       lo:'Prático, convencional e focado no concreto. Prefere rotinas e o que já conhece.' },
  C: { key:'C', name:'Conscienciosidade',  short:'Conscienciosidade',       icon:'📋', color:'#6C5FE6',
       hi:'Organizado, disciplinado e orientado a metas. Cumpre prazos e planeja com antecedência.',
       lo:'Flexível, espontâneo e menos orientado a regras. Pode ter dificuldade com organização.' },
  E: { key:'E', name:'Extroversão',        short:'Extroversão',             icon:'⚡', color:'#1BA8D4',
       hi:'Energético, sociável e assertivo. Se revigora no contato com pessoas e ambientes estimulantes.',
       lo:'Reservado, introspectivo e reflexivo. Prefere ambientes calmos e interações mais profundas.' },
  A: { key:'A', name:'Amabilidade',        short:'Amabilidade',             icon:'🤝', color:'#2EC4A0',
       hi:'Cooperativo, empático e confiante nas pessoas. Evita conflitos e valoriza harmonia.',
       lo:'Direto, competitivo e cético. Prioriza objetivos sobre harmonia social.' },
  N: { key:'N', name:'Neuroticismo',       short:'Neuroticismo',            icon:'🌊', color:'#9B59B6',
       hi:'Sensível ao estresse e propenso a emoções negativas como ansiedade ou irritação.',
       lo:'Emocionalmente estável e resiliente. Lida bem com pressão e raramente se abala.' },
};

// 44 questões do BFI (John & Srivastava, 1999) — traduzidas e adaptadas
// reverse:true = item reverso (score = 6 - resposta)
const QUESTIONS = [
  // Extroversão (E)
  {dim:'E', text:'Me considero alguém que é conversador e sociável.',          reverse:false},
  {dim:'E', text:'Me considero alguém que é reservado.',                        reverse:true },
  {dim:'E', text:'Me considero alguém que é cheio(a) de energia.',             reverse:false},
  {dim:'E', text:'Me considero alguém que gera muito entusiasmo.',             reverse:false},
  {dim:'E', text:'Me considero alguém que tende a ser quieto(a).',             reverse:true },
  {dim:'E', text:'Me considero alguém que é assertivo(a) e não tem medo de se posicionar.', reverse:false},
  {dim:'E', text:'Me considero alguém que é às vezes tímido(a) e inibido(a).', reverse:true },
  {dim:'E', text:'Me considero alguém que prefere deixar os outros tomarem a liderança.', reverse:true},

  // Amabilidade (A)
  {dim:'A', text:'Me considero alguém que tende a encontrar defeitos nos outros.', reverse:true },
  {dim:'A', text:'Me considero alguém que é prestativo(a) e não egoísta com os outros.', reverse:false},
  {dim:'A', text:'Me considero alguém que começa brigas com os outros.',        reverse:true },
  {dim:'A', text:'Me considero alguém que tem um coração gentil e bondoso.',   reverse:false},
  {dim:'A', text:'Me considero alguém que às vezes é rude com os outros.',     reverse:true },
  {dim:'A', text:'Me considero alguém que é cooperativo(a) e trabalha bem com os outros.', reverse:false},
  {dim:'A', text:'Me considero alguém que pode ser frio(a) e distante.',       reverse:true },
  {dim:'A', text:'Me considero alguém que considera os sentimentos dos outros.', reverse:false},
  {dim:'A', text:'Me considero alguém que às vezes é desrespeitoso(a).',       reverse:true },

  // Conscienciosidade (C)
  {dim:'C', text:'Me considero alguém que faz um trabalho cuidadoso.',         reverse:false},
  {dim:'C', text:'Me considero alguém que pode ser descuidado(a).',            reverse:true },
  {dim:'C', text:'Me considero alguém que é um(a) trabalhador(a) confiável.', reverse:false},
  {dim:'C', text:'Me considero alguém que tende a ser desorganizado(a).',      reverse:true },
  {dim:'C', text:'Me considero alguém que tende a ser preguiçoso(a).',         reverse:true },
  {dim:'C', text:'Me considero alguém que persevera até a tarefa estar concluída.', reverse:false},
  {dim:'C', text:'Me considero alguém que faz planos e os segue.',             reverse:false},
  {dim:'C', text:'Me considero alguém que se distrai facilmente.',             reverse:true },
  {dim:'C', text:'Me considero alguém que é eficiente e busca o que precisa ser feito.', reverse:false},

  // Neuroticismo (N)
  {dim:'N', text:'Me considero alguém que fica deprimido(a) e melancólico(a) com facilidade.', reverse:false},
  {dim:'N', text:'Me considero alguém que é relaxado(a) e lida bem com o estresse.', reverse:true },
  {dim:'N', text:'Me considero alguém que pode ser tenso(a).',                 reverse:false},
  {dim:'N', text:'Me considero alguém que se preocupa muito.',                 reverse:false},
  {dim:'N', text:'Me considero alguém que é emocionalmente estável e não se abala com facilidade.', reverse:true},
  {dim:'N', text:'Me considero alguém que pode ficar temperamental.',          reverse:false},
  {dim:'N', text:'Me considero alguém que permanece calmo(a) em situações tensas.', reverse:true},
  {dim:'N', text:'Me considero alguém que fica nervoso(a) com facilidade.',   reverse:false},

  // Abertura (O)
  {dim:'O', text:'Me considero alguém que é original e gera novas ideias.',   reverse:false},
  {dim:'O', text:'Me considero alguém que é curioso(a) sobre muitas coisas.', reverse:false},
  {dim:'O', text:'Me considero alguém que é inventivo(a).',                   reverse:false},
  {dim:'O', text:'Me considero alguém que valoriza experiências artísticas e estéticas.', reverse:false},
  {dim:'O', text:'Me considero alguém que tem imaginação ativa e vívida.',    reverse:false},
  {dim:'O', text:'Me considero alguém que é sofisticado(a) em arte, música ou literatura.', reverse:false},
  {dim:'O', text:'Me considero alguém que prefere trabalhar com rotinas em vez de variações.', reverse:true},
  {dim:'O', text:'Me considero alguém que gosta de refletir e brincar com ideias.', reverse:false},
  {dim:'O', text:'Me considero alguém que tem poucos interesses artísticos.',  reverse:true},
  {dim:'O', text:'Me considero alguém que é engenhoso(a) e pensa profundamente nas coisas.', reverse:false},
];

const HINTS = ['Discordo totalmente','Discordo','Neutro','Concordo','Concordo totalmente'];

let currentQ = 0;
let answers = []; // array de 44 posições, valores 1-5
let _isLoadingExisting = false;

// ── Navegação de páginas
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

// ── Iniciar quiz
function startQuiz(){
  currentQ = 0;
  answers = new Array(44).fill(null);
  showPage('page-quiz');
  renderQuestion(0);
}

function goBack(){
  if(currentQ === 0) showPage('page-intro');
  else { currentQ--; renderQuestion(currentQ); }
}

// ── Renderiza pergunta
function renderQuestion(idx){
  const q = QUESTIONS[idx];
  const dim = DIMS[q.dim];
  const pct = Math.round((idx / QUESTIONS.length) * 100);
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-label').textContent = `${idx + 1} de ${QUESTIONS.length}`;

  const sel = answers[idx];
  const card = document.getElementById('question-card');
  card.style.animation = 'none'; card.offsetHeight; card.style.animation = '';

  card.innerHTML = `
    <div class="dim-tag" style="color:${dim.color};border-color:${dim.color}44;background:${dim.color}11;">
      <span style="background:${dim.color};width:6px;height:6px;border-radius:50%;display:inline-block;"></span>
      ${dim.short}${q.reverse ? '<span class="reverse-badge">↺ reversa</span>' : ''}
    </div>
    <span class="question-num">// pergunta ${idx + 1} de ${QUESTIONS.length}</span>
    <div class="question-text">${q.text}</div>
    <div class="scale-label-row"><span>Discordo totalmente</span><span>Concordo totalmente</span></div>
    <div class="scale-btns">
      ${[1,2,3,4,5].map(v=>`
        <button class="scale-btn ${sel===v?'selected':''}" data-val="${v}"
          style="--q-color:${dim.color};${sel===v?`border-color:${dim.color};background:${dim.color}15;`:''}"
          onclick="selectAnswer(${idx},${v})"
          title="${HINTS[v-1]}"></button>
      `).join('')}
    </div>
    <div class="scale-hint" id="scale-hint">${sel ? HINTS[sel-1] : '// toque para avaliar'}</div>
    <div class="quiz-actions">
      <button class="btn-next ${sel!==null?'ready':''}" id="btn-next"
        style="background:${dim.color}"
        onclick="nextQuestion()">
        ${idx === QUESTIONS.length - 1 ? 'Ver meu resultado →' : 'Próxima →'}
      </button>
    </div>
  `;
}

function selectAnswer(idx, val){
  answers[idx] = val;
  document.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
  const selBtn = document.querySelector(`.scale-btn[data-val="${val}"]`);
  const dim = DIMS[QUESTIONS[idx].dim];
  selBtn.classList.add('selected');
  selBtn.style.borderColor = dim.color;
  selBtn.style.background = dim.color + '15';
  document.getElementById('scale-hint').textContent = HINTS[val - 1];
  document.getElementById('btn-next').classList.add('ready');
  clearTimeout(window._autoNext);
  window._autoNext = setTimeout(() => nextQuestion(), 700);
}

function nextQuestion(){
  if(answers[currentQ] === null) return;
  currentQ++;
  if(currentQ >= QUESTIONS.length) showResult();
  else renderQuestion(currentQ);
}

// ══════════════════════════════════════
// CÁLCULO DOS SCORES
// ══════════════════════════════════════
function calcScores(){
  const raw = {O:[], C:[], E:[], A:[], N:[]};
  QUESTIONS.forEach((q, i) => {
    let val = answers[i] || 3;
    if(q.reverse) val = 6 - val; // inversão dos itens reversos
    raw[q.dim].push(val);
  });
  // Média por dimensão → percentual (1–5 vira 0–100)
  const scores = {};
  Object.keys(raw).forEach(dim => {
    const mean = raw[dim].reduce((a,b)=>a+b,0) / raw[dim].length;
    scores[dim] = Math.round(((mean - 1) / 4) * 100);
  });
  return scores;
}

// ══════════════════════════════════════
// RADAR SVG
// ══════════════════════════════════════
function buildRadar(scores){
  const cx = 200, cy = 200, r = 150;
  const dims = ['O','C','E','A','N'];
  const labels = ['Abertura','Conscienciosidade','Extroversão','Amabilidade','Neuroticismo'];
  const colors = dims.map(d => DIMS[d].color);
  const n = dims.length;

  function pt(i, pct, radius){
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    const dist = (pct / 100) * radius;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  }

  // Grades
  let gridSvg = '';
  [20,40,60,80,100].forEach(pct => {
    const pts = dims.map((_,i) => pt(i, pct, r));
    gridSvg += `<polygon points="${pts.map(p=>`${p.x},${p.y}`).join(' ')}"
      fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>`;
  });

  // Eixos
  let axesSvg = dims.map((_,i) => {
    const p = pt(i, 100, r);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>`;
  }).join('');

  // Polígono de dados
  const dataPts = dims.map((d,i) => pt(i, scores[d], r));
  const polyPoints = dataPts.map(p=>`${p.x},${p.y}`).join(' ');

  // Gradiente fill
  let gradSvg = `<defs>
    <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6C5FE6" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#1BA8D4" stop-opacity="0.15"/>
    </linearGradient>
  </defs>`;

  // Pontos coloridos
  let dotsSvg = dataPts.map((p, i) => `
    <circle cx="${p.x}" cy="${p.y}" r="4" fill="#07080C" stroke="${colors[i]}" stroke-width="1.5"/>
  `).join('');

  // Labels
  let labelsSvg = dims.map((d, i) => {
    const p = pt(i, 118, r);
    const score = scores[d];
    const anchor = p.x < cx - 5 ? 'end' : p.x > cx + 5 ? 'start' : 'middle';
    return `
      <text x="${p.x}" y="${p.y - 6}" text-anchor="${anchor}" font-family="Space Mono,monospace"
        font-size="9" fill="${colors[i]}" font-weight="700" letter-spacing="0.05em">${labels[i].toUpperCase()}</text>
      <text x="${p.x}" y="${p.y + 8}" text-anchor="${anchor}" font-family="Space Mono,monospace"
        font-size="11" fill="${colors[i]}" font-weight="700">${score}%</text>
    `;
  }).join('');

  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    ${gradSvg}
    ${gridSvg}
    ${axesSvg}
    <polygon points="${polyPoints}" fill="url(#radarGrad)" stroke="#6C5FE6" stroke-width="1.5" stroke-opacity="0.8"/>
    ${dotsSvg}
    ${labelsSvg}
  </svg>`;
}

// ══════════════════════════════════════
// INSIGHTS
// ══════════════════════════════════════
function getInsight(scores){
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const highest = sorted[0];
  const lowest = sorted[sorted.length-1];
  const dimH = DIMS[highest[0]];
  const dimL = DIMS[lowest[0]];

  let text = `<strong>Seu traço dominante é ${dimH.name} (${highest[1]}%)</strong>. ${dimH.hi}`;
  text += `<br><br>`;
  text += `Seu traço menos prevalente é <strong>${dimL.name} (${lowest[1]}%)</strong>. ${dimL.lo}`;
  text += `<br><br>`;

  // Combos notáveis
  if(scores.C >= 65 && scores.O >= 65)
    text += '✦ <em>Alta Conscienciosidade + Alta Abertura</em>: você combina execução disciplinada com pensamento criativo — perfil raro e muito valorizado em funções de liderança e inovação.';
  else if(scores.E >= 65 && scores.A >= 65)
    text += '✦ <em>Alta Extroversão + Alta Amabilidade</em>: você tem um perfil naturalmente voltado para pessoas. Ambientes colaborativos e funções de relacionamento tendem a energizar você.';
  else if(scores.N >= 65 && scores.C >= 65)
    text += '✦ <em>Alta Conscienciosidade + Alto Neuroticismo</em>: você é perfeccionista e detalhista. Use a organização como ferramenta para gerenciar a ansiedade — listas, rotinas e metas claras são seus aliados.';
  else if(scores.N <= 35)
    text += '✦ <em>Baixo Neuroticismo</em>: você tem estabilidade emocional acima da média. É um ativo valioso em ambientes de alta pressão e na gestão de crises.';
  else if(scores.O >= 70)
    text += '✦ <em>Abertura muito alta</em>: você pensa fora do convencional com naturalidade. Ambientes que valorizam inovação e diversidade de perspectivas tendem a ser os mais satisfatórios.';
  else
    text += '✦ Seu perfil é equilibrado entre as dimensões. Isso indica adaptabilidade — você transita bem entre diferentes contextos e estilos de trabalho.';

  return text;
}

// Cruzamento com DISC (se o usuário já fez)
function getDiscCombo(scores){
  const u = (capsulaDB.lsGetUser() || {});
  if(!u.disc || !u.disc.dominant) return null;
  const disc = u.disc.dominant; // D, I, S ou C

  const combos = {
    D: {
      label: 'DISC Dominância + Big Five',
      text: `Seu perfil DISC de <strong>Dominância (D)</strong> combinado com Big Five sugere uma personalidade orientada a resultados. ${
        scores.C >= 60 ? 'Sua alta Conscienciosidade reforça a orientação a metas — você não só lidera, como executa.' :
        scores.O >= 60 ? 'Sua abertura à experiência adiciona criatividade à liderança direta — você tem perfil de líder inovador.' :
        'Atenção ao equilíbrio: dominância alta com amabilidade mais baixa pode gerar fricção em contextos colaborativos.'
      }`
    },
    I: {
      label: 'DISC Influência + Big Five',
      text: `Seu perfil DISC de <strong>Influência (I)</strong> combinado com Big Five confirma uma orientação natural para pessoas. ${
        scores.E >= 60 ? 'Alta Extroversão + Influência = presença marcante e capacidade real de inspirar grupos.' :
        scores.A >= 60 ? 'Sua Amabilidade reforça o charme interpessoal e gera relações de confiança duradouras.' :
        'O Big Five revela camadas adicionais além da aparência social — use esse autoconhecimento para liderar com autenticidade.'
      }`
    },
    S: {
      label: 'DISC Estabilidade + Big Five',
      text: `Seu perfil DISC de <strong>Estabilidade (S)</strong> combinado com Big Five evidencia consistência e confiabilidade. ${
        scores.A >= 60 ? 'Alta Amabilidade confirma que você é o "cimento" de equipes — mantém harmonia e coesão.' :
        scores.C >= 60 ? 'Conscienciosidade + Estabilidade = execução confiável e qualidade acima da média.' :
        'O Big Five mostra que sua estabilidade tem fundamento em traços de personalidade sólidos, não apenas comportamentais.'
      }`
    },
    C: {
      label: 'DISC Conformidade + Big Five',
      text: `Seu perfil DISC de <strong>Conformidade (C)</strong> combinado com Big Five reforça o perfil analítico. ${
        scores.C >= 60 ? 'Alta Conscienciosidade + Conformidade = rigor técnico e atenção ao detalhe acima da média. Ideal para funções que exigem precisão.' :
        scores.O >= 60 ? 'Abertura + Conformidade é uma combinação curiosa — você é detalhista, mas também criativo. Perfil forte para P&D e design de sistemas.' :
        'Atenção para não cair em paralisia por análise: use o perfeccionismo como qualidade, não como bloqueio.'
      }`
    }
  };
  return combos[disc] || null;
}

// ══════════════════════════════════════
// EXIBIÇÃO DO RESULTADO
// ══════════════════════════════════════
function showResult(){
  showPage('page-result');
  const scores = calcScores();

  // Radar
  document.getElementById('radar-wrap').innerHTML = buildRadar(scores);

  // Anima as barras após render
  setTimeout(() => {
    document.querySelectorAll('.score-bar-fill[data-pct]').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  }, 150);

  // Ordenar por score desc
  const sorted = Object.keys(DIMS).map(k => ({...DIMS[k], score: scores[k]})).sort((a,b)=>b.score-a.score);

  // Cards de dimensão
  document.getElementById('dims-result').innerHTML = sorted.map((d, i) => `
    <div class="dim-result-card ${i === 0 ? 'highlight' : ''}" style="${i===0?`border-color:${d.color}44;background:${d.color}08;`:''}">
      <div class="dim-icon-wrap" style="background:${d.color}15;border:1px solid ${d.color}33;">${d.icon}</div>
      <div>
        <div class="dim-result-name">${d.name}</div>
        <div class="dim-result-label" style="color:${d.color}">${d.score >= 60 ? 'Alto' : d.score >= 40 ? 'Médio' : 'Baixo'} · ${d.score}%</div>
        <div class="score-bar-row">
          <div class="score-bar-track">
            <div class="score-bar-fill" data-pct="${d.score}" style="width:0%;background:${d.color};"></div>
          </div>
          <span class="score-pct">${d.score}%</span>
        </div>
        <div class="dim-result-desc">${d.score >= 50 ? d.hi : d.lo}</div>
      </div>
      <div class="dim-score-col">
        <span class="dim-score-val" style="color:${d.color}">${d.score}</span>
        <span class="dim-score-max">/ 100</span>
      </div>
    </div>
  `).join('');

  // Anima barras
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.score-bar-fill[data-pct]').forEach(el => {
        el.style.width = el.dataset.pct + '%';
      });
    }, 100);
  });

  // Insight
  document.getElementById('insight-box').innerHTML = `
    <span class="insight-label">✦ ANÁLISE DO SEU PERFIL OCEAN</span>
    <p>${getInsight(scores)}</p>
  `;

  // Combo com DISC
  const combo = getDiscCombo(scores);
  if(combo){
    const comboBox = document.getElementById('combo-box');
    comboBox.style.display = 'block';
    comboBox.innerHTML = `
      <span class="combo-label">✦ CRUZAMENTO COM SEU PERFIL DISC</span>
      <div class="combo-content">${combo.text}</div>
    `;
  }

  // Salva no localStorage
  if (!_isLoadingExisting) {
  const u = (capsulaDB.lsGetUser() || {});
  if (!u.uid) { u.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }
  u.bigfive = { scores, completedAt: new Date().toISOString() };
  capsulaDB.lsSetUser(u);
  try { sessionStorage.setItem('capsula_user', JSON.stringify(u)); } catch(_) {}
  try {
    const perfis = capsulaDB.lsGetUsers();
    const idx = perfis.findIndex(p => p.uid === u.uid);
    if(idx >= 0){ perfis[idx].bigfive = u.bigfive; capsulaDB.lsSetUsers(perfis); }
  } catch(e) {}
  // Sync Supabase
  if(window.capsulaDB && u.email){ capsulaDB.saveUser(u).catch(e => console.warn('[bigfive] sync:', e)); }
  } // end !_isLoadingExisting
}

// ══════════════════════════════════════
// PDF
// ══════════════════════════════════════
function generatePDF(){
  if (window._payments) {
    _payments.serverDebitCredit('bigfive').then(function(ok) {
      if (!ok) { _payments.showPaywall('bigfive'); return; }
      _generatePDF();
    });
    return;
  }
  _generatePDF();
}
function _generatePDF(){
  const u = (capsulaDB.lsGetUser() || {});
  if(!u.bigfive) return;
  const nome = u.apelido || u.nome || 'Usuário';
  const data = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  const scores = u.bigfive.scores;
  const ACCENT = '#6C5FE6';
  const sorted = Object.keys(DIMS).map(k=>({...DIMS[k],score:scores[k]||0,key:k})).sort((a,b)=>b.score-a.score);
  const dominant = sorted[0];
  const weakest = sorted[sorted.length-1];

  // Radar 5-axis (pentagon): O=top, C=top-right, E=bottom-right, A=bottom-left, N=top-left
  const AXIS5 = {O:[130,42],C:[214,103],E:[182,201],A:[78,201],N:[46,103]};
  const radarPts5 = ['O','C','E','A','N'].map(k=>{const s=(scores[k]||0)/100;const[ox,oy]=AXIS5[k];return`${(130+(ox-130)*s).toFixed(1)},${(130+(oy-130)*s).toFixed(1)}`;}).join(' ');
  const radarDots5 = ['O','C','E','A','N'].map(k=>{const s=(scores[k]||0)/100;const[ox,oy]=AXIS5[k];const cx=(130+(ox-130)*s).toFixed(1),cy=(130+(oy-130)*s).toFixed(1);return`<circle cx="${cx}" cy="${cy}" r="3" fill="${DIMS[k].color}" stroke="#f8fafc" stroke-width="1.5"/>`;}).join('');

  const insightText = getInsight(scores).replace(/<[^>]+>/g,'').slice(0,400);
  const chipLabels = {O:'Abertura',C:'Conscienciosidade',E:'Extroversão',A:'Amabilidade',N:'Neuroticismo'};

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
.dom-letter{width:48px;height:48px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Space Mono',monospace;font-size:20px;font-weight:900;}
.dom-ew{font-family:'Space Mono',monospace;font-size:7px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:ACC;margin-bottom:2px;}
.dom-name{font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:1;}
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
.t-letter{width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Space Mono',monospace;font-size:9px;font-weight:900;}
.t-name{font-size:8.5px;font-weight:700;}.t-pct{font-family:'Space Mono',monospace;font-size:7.5px;}
.t-arrow{font-family:'Space Mono',monospace;font-size:9px;color:#a1a1aa;flex-shrink:0;}
.tension-note{font-size:7.5px;color:#71717a;line-height:1.65;margin-top:6px;text-align:center;}
.sr{display:flex;align-items:center;gap:7px;padding:4px 0;border-bottom:1px solid #f1f5f9;}
.sr-rank{font-family:'Space Mono',monospace;font-size:7px;color:#a1a1aa;min-width:14px;}
.sr-ico{width:22px;height:22px;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Space Mono',monospace;font-size:9px;font-weight:900;}
.sr-name{font-size:9px;font-weight:700;flex:1;}.sr-track{flex:1;height:5px;background:#f1f5f9;border-radius:3px;overflow:hidden;max-width:110px;}
.sr-fill{height:100%;border-radius:3px;}.sr-pct{font-family:'Space Mono',monospace;font-size:7.5px;min-width:28px;text-align:right;}
.ft{padding-top:9px;border-top:2px solid #000;display:flex;justify-content:space-between;align-items:center;margin-top:9px;flex-shrink:0;}
.ft-l{font-family:'Space Mono',monospace;font-size:6px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;}
.ft-r{font-family:'Space Mono',monospace;font-size:7.5px;font-weight:700;color:#000;}
@media print{@page{margin:0;size:A4;}body{background:#f8fafc!important;}.page{width:100%;}}`.split('ACC').join(ACCENT);

  const barsHTML = ['O','C','E','A','N'].map(k=>{
    const d=DIMS[k],pct=scores[k]||0,isDom=k===dominant.key;
    return `<div style="border:1px solid ${isDom?d.color+'50':'#e4e4e7'};padding:7px 9px;background:${isDom?d.color+'08':'#fff'};${isDom?'':'opacity:0.5;'}">
      <div style="font-family:'Space Mono',monospace;font-size:6.5px;font-weight:700;color:${d.color};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;">${k}</div>
      <div style="font-size:17px;font-weight:900;color:${d.color};">${pct}%</div>
      <div style="height:3px;background:#f1f5f9;border-radius:2px;margin-top:3px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:${d.color};border-radius:2px;"></div></div>
    </div>`;
  }).join('');

  const rankingHTML = sorted.map((d,i)=>{
    const last=i===4?'border-bottom:none;':'';
    return `<div class="sr" style="${last}"><span class="sr-rank">${String(i+1).padStart(2,'0')}</span><div class="sr-ico" style="background:${d.color}15;border:1px solid ${d.color}30;color:${d.color};">${d.key}</div><span class="sr-name">${d.name}</span><div class="sr-track"><div class="sr-fill" style="width:${d.score}%;background:${d.color};"></div></div><span class="sr-pct" style="color:${d.color};">${d.score}%</span></div>`;
  }).join('');

  const chipsHTML = sorted.slice(0,3).map(d=>`<span class="chip" style="color:${d.color};border-color:${d.color}40;background:${d.color}08;">${chipLabels[d.key]}</span>`).join('');

  _imprimirPDF(`<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8"><title>Big Five OCEAN — ${nome} · Sistema Gnosis</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>${_gnCss}</style></head><body><div class="page">
  <div class="hd">
    <div class="brand"><svg viewBox="0 0 100 100" fill="none" width="26" height="26"><path d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C59.66 15 68.38 18.91 74.72 25.22" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><path d="M85 50H55" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><circle cx="85" cy="50" r="4" fill="${ACCENT}"/></svg><span class="brand-name">SISTEMA <em>Gnosis</em></span></div>
    <div class="hd-meta">Módulo: Big Five OCEAN · Personalidade<br>${data.toUpperCase()}<br>${nome.toUpperCase()}</div>
  </div>
  <div class="grid">
    <div class="col">
      <div class="pn">
        <div class="lbl">Dimensão_Dominante</div>
        <div class="dom-hero">
          <div class="dom-letter" style="background:${dominant.color}12;border:1px solid ${dominant.color}35;color:${dominant.color};">${dominant.key}</div>
          <div>
            <div class="dom-ew">Resultado · Big Five OCEAN</div>
            <div class="dom-name" style="color:${dominant.color};">${dominant.name}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;">${barsHTML}</div>
        <p class="arch-desc">${(dominant.score>=50?dominant.hi:dominant.lo).split('.')[0]}.</p>
      </div>
      <div class="pn-grow">
        <div class="lbl">Análise_do_Perfil</div>
        <div class="ins-lbl">Síntese OCEAN</div>
        <p class="ins-txt">${insightText}</p>
        <div class="chips-row">${chipsHTML}</div>
        <div class="tension-box">
          <div class="tension-lbl">// Zona de Tensão · Polaridade de Personalidade</div>
          <div class="tension-row">
            <div class="t-arch" style="border-color:${dominant.color}35;background:${dominant.color}08;">
              <div class="t-letter" style="background:${dominant.color}15;border:1px solid ${dominant.color}30;color:${dominant.color};">${dominant.key}</div>
              <div><div class="t-name" style="color:${dominant.color};">${dominant.name}</div><div class="t-pct" style="color:${dominant.color};">${dominant.score}% · dominante</div></div>
            </div>
            <div class="t-arrow">⟷</div>
            <div class="t-arch" style="border-color:${weakest.color}35;background:${weakest.color}06;">
              <div class="t-letter" style="background:${weakest.color}15;border:1px solid ${weakest.color}30;color:${weakest.color};">${weakest.key}</div>
              <div><div class="t-name" style="color:${weakest.color};">${weakest.name}</div><div class="t-pct" style="color:${weakest.color};">${weakest.score}% · moderado</div></div>
            </div>
          </div>
          <p class="tension-note">Alta ${dominant.name.toLowerCase()} (${dominant.score}%) e baixa ${weakest.name.toLowerCase()} (${weakest.score}%) definem um perfil com tendências opostas nessas dimensões — eixo central de autoconhecimento.</p>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="pn" style="flex-shrink:0;">
        <div class="lbl">Ranking_OCEAN</div>
        <div style="padding-top:5px;">${rankingHTML}</div>
      </div>
      <div class="pn-grow">
        <div class="lbl">Mapa_Visual_OCEAN</div>
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding-top:4px;">
          <svg viewBox="0 0 260 260" width="210" height="210" xmlns="http://www.w3.org/2000/svg">
            <defs><radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.18"/><stop offset="100%" stop-color="${ACCENT}" stop-opacity="0.04"/></radialGradient></defs>
            <polygon points="130,66 186,103 165,177 95,177 74,103" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
            <polygon points="130,88 173,114 157,169 103,169 87,114" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
            <line x1="130" y1="130" x2="130" y2="42" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
            <line x1="130" y1="130" x2="214" y2="103" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
            <line x1="130" y1="130" x2="182" y2="201" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
            <line x1="130" y1="130" x2="78" y2="201" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
            <line x1="130" y1="130" x2="46" y2="103" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
            <polygon points="${radarPts5}" fill="url(#rg)" stroke="${ACCENT}" stroke-width="1.5" stroke-opacity="0.7"/>
            ${radarDots5}
            <text x="130" y="36" text-anchor="middle" font-family="Space Mono,monospace" font-size="7" fill="${DIMS.O.color}" font-weight="700">O ${scores.O||0}%</text>
            <text x="220" y="101" text-anchor="start" font-family="Space Mono,monospace" font-size="7" fill="${DIMS.C.color}">C ${scores.C||0}%</text>
            <text x="186" y="214" text-anchor="start" font-family="Space Mono,monospace" font-size="7" fill="${DIMS.E.color}">E ${scores.E||0}%</text>
            <text x="74" y="214" text-anchor="end" font-family="Space Mono,monospace" font-size="7" fill="${DIMS.A.color}">A ${scores.A||0}%</text>
            <text x="40" y="101" text-anchor="end" font-family="Space Mono,monospace" font-size="7" fill="${DIMS.N.color}">N ${scores.N||0}%</text>
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div class="ft"><span class="ft-l">Sistema Gnosis // Big Five OCEAN // Personalidade // Confidencial</span><span class="ft-r">www.sistema-gnosis.com.br</span></div>
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
  iframe.onload=function(){setTimeout(function(){try{iframe.contentWindow.focus();iframe.contentWindow.print();}catch(e){var blob=new Blob([html],{type:'text/html'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='bigfive-ocean.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}},700);};
}

// ── Proteção de rota
document.addEventListener('DOMContentLoaded', async function(){
  let _u = null;
  try { _u = await capsulaDB.ensureUserData(); } catch(_e) {}

  if (window._payments && !_payments.isPro() && !_payments.isAdmin()) {
    const _c = _payments.getCredits();
    const _hasSpec = (_c['bigfive'] || 0) > 0, _hasAvul = (_c.avulsos || 0) > 0;
    if (!_hasSpec && !_hasAvul) {
      _payments.showPaywall('bigfive');
      const _gate = new MutationObserver(function() {
        if (!document.getElementById('_paywall-modal')) {
          _gate.disconnect();
          if (!_payments.hasAccess('bigfive')) window.location.href = 'dashboard.html';
        }
      });
      _gate.observe(document.body, { childList: true, subtree: true });
      return;
    }
    if (!_hasSpec && _hasAvul) await _payments.unlockMatrix('bigfive');
  }

  if (_u && _u.bigfive && _u.bigfive.completedAt && _u.bigfive.scores) {
    window.calcScores = function() { return _u.bigfive.scores; };
    _isLoadingExisting = true;
    showResult();
    return;
  }

  if (!_u || (!_u.nome && !_u.apelido && !_u.email)) {
    window.location.href = 'index.html';
    return;
  }
  if (!_u.uid) { _u.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2); try{capsulaDB.lsSetUser(_u);}catch(_){} }
  if (_u.bigfive_draft) answers = _u.bigfive_draft;
});

// ══════════════════════════════════════
// DADOS: BFI — 44 itens validados
// Fonte: John, O. P., & Srivastava, S. (1999)
// ══════════════════════════════════════

// Dimensões

// Etapa 2 — eram window.* globais; convertidos pra let no escopo do script.
let _autoNext;

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
  if (window.gnosisTrack) gnosisTrack('quiz_started', { matriz: 'bigfive' });
  if (window.gnosisQuizSave) {
    const saved = gnosisQuizSave.restore('bigfive');
    if (saved && saved.state && Array.isArray(saved.state.answers)) {
      const answered = saved.state.answers.filter(a => a !== null).length;
      if (answered > 0 && answered < QUESTIONS.length) {
        gnosisQuizSave.promptResume({
          matriz: 'bigfive', label: 'Big Five',
          summary: answered + ' de ' + QUESTIONS.length + ' perguntas respondidas',
          onResume: function () {
            answers = saved.state.answers.slice();
            currentQ = typeof saved.state.currentQ === 'number' ? saved.state.currentQ : answered;
            if (currentQ >= QUESTIONS.length) currentQ = QUESTIONS.length - 1;
            showPage('page-quiz'); renderQuestion(currentQ);
          },
          onRestart: function () {
            currentQ = 0; answers = new Array(QUESTIONS.length).fill(null);
            showPage('page-quiz'); renderQuestion(0);
          },
        });
        return;
      }
    }
  }
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
    <div class="scale-btns" role="radiogroup" aria-label="Avalie de 1 (discordo totalmente) a 5 (concordo totalmente)">
      ${[1,2,3,4,5].map(v=>`
        <button class="scale-btn ${sel===v?'selected':''}" data-val="${v}"
          style="--q-color:${dim.color};${sel===v?`border-color:${dim.color};background:${dim.color}15;`:''}"
          onclick="selectAnswer(${idx},${v})"
          title="${HINTS[v-1]}"
          role="radio"
          aria-checked="${sel===v?'true':'false'}"
          aria-label="Nota ${v} de 5"></button>
      `).join('')}
    </div>
    <div class="scale-hint" id="scale-hint" aria-live="polite">${sel ? HINTS[sel-1] : '// toque para avaliar'}</div>
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
  if (window.gnosisQuizSave) gnosisQuizSave.save('bigfive', { answers: answers, currentQ: idx });
  document.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
  const selBtn = document.querySelector(`.scale-btn[data-val="${val}"]`);
  const dim = DIMS[QUESTIONS[idx].dim];
  selBtn.classList.add('selected');
  selBtn.style.borderColor = dim.color;
  selBtn.style.background = dim.color + '15';
  document.getElementById('scale-hint').textContent = HINTS[val - 1];
  document.getElementById('btn-next').classList.add('ready');
  clearTimeout(_autoNext);
  _autoNext = setTimeout(() => nextQuestion(), 700);
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
  if (window.gnosisQuizSave) gnosisQuizSave.clear('bigfive');
  if (window.gnosisTrack) gnosisTrack('quiz_completed', { matriz: 'bigfive' });
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

// Cruzamento com outros testes removido — o Big Five (OCEAN) deve ser
// analisado isoladamente. O cruzamento entre matrizes só acontece no
// DNA Estratégico, que é o único módulo dedicado a integrar resultados.

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

  // Cruzamento removido — resultado mostra apenas o perfil OCEAN isolado.
  // Integração entre matrizes acontece no DNA Estratégico.

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

  // Bloco "E agora?" — compartilhar + próximo teste
  if (window.gnosisPostResult) {
    const top = sorted[0] || { name: 'OCEAN', score: 0 };
    window.gnosisPostResult.render({
      fromKey: 'bigfive',
      resultLabel: top.name + ' ' + top.score + '%',
      containerId: 'page-result',
    });
  }
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
  const data = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  const scores = u.bigfive.scores;
  const ACCENT = '#7C6FF7';
  const sorted = Object.keys(DIMS).map(k=>({...DIMS[k],score:scores[k]||0,key:k})).sort((a,b)=>b.score-a.score);
  const dominant = sorted[0];
  const weakest = sorted[sorted.length-1];

  // Radar 5-axis (pentagon): O=top, C=top-right, E=bottom-right, A=bottom-left, N=top-left
  const AXIS5 = {O:[110,38],C:[182,87],E:[155,172],A:[65,172],N:[38,87]};
  const radarPts5 = ['O','C','E','A','N'].map(k=>{const s=(scores[k]||0)/100;const[ox,oy]=AXIS5[k];return`${(110+(ox-110)*s).toFixed(1)},${(110+(oy-110)*s).toFixed(1)}`;}).join(' ');
  const insightText = getInsight(scores).replace(/<[^>]+>/g,'').slice(0,400);

  const radarSvg = `
    <svg viewBox="0 0 220 220" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <polygon points="110,38 182,87 155,172 65,172 38,87" fill="none" stroke="#e4e4e7" stroke-width="1"/>
      <polygon points="110,62 158,99 138,156 82,156 62,99" fill="none" stroke="#e4e4e7" stroke-width="1"/>
      ${['O','C','E','A','N'].map(k=>{const[ox,oy]=AXIS5[k];return `<line x1="110" y1="110" x2="${ox}" y2="${oy}" stroke="#e4e4e7" stroke-width="1"/>`;}).join('')}
      <polygon points="${radarPts5}" fill="${ACCENT}26" stroke="${ACCENT}" stroke-width="1.5"/>
      ${['O','C','E','A','N'].map(k=>{const s=(scores[k]||0)/100;const[ox,oy]=AXIS5[k];const cx=(110+(ox-110)*s).toFixed(1),cy=(110+(oy-110)*s).toFixed(1);const isDom=k===dominant.key;return `<circle cx="${cx}" cy="${cy}" r="${isDom?4:3}" fill="${isDom?ACCENT:'#a1a1aa'}" stroke="#fff" stroke-width="1.5"/>`;}).join('')}
      <text x="110" y="30" text-anchor="middle" font-family="IBM Plex Mono" font-size="9" font-weight="${dominant.key==='O'?'600':'400'}" fill="${dominant.key==='O'?ACCENT:'#71717a'}">O · ${scores.O||0}%</text>
      <text x="190" y="86" text-anchor="start" font-family="IBM Plex Mono" font-size="9" font-weight="${dominant.key==='C'?'600':'400'}" fill="${dominant.key==='C'?ACCENT:'#71717a'}">C · ${scores.C||0}%</text>
      <text x="160" y="185" text-anchor="start" font-family="IBM Plex Mono" font-size="9" font-weight="${dominant.key==='E'?'600':'400'}" fill="${dominant.key==='E'?ACCENT:'#71717a'}">E · ${scores.E||0}%</text>
      <text x="60" y="185" text-anchor="end" font-family="IBM Plex Mono" font-size="9" font-weight="${dominant.key==='A'?'600':'400'}" fill="${dominant.key==='A'?ACCENT:'#71717a'}">A · ${scores.A||0}%</text>
      <text x="30" y="86" text-anchor="end" font-family="IBM Plex Mono" font-size="9" font-weight="${dominant.key==='N'?'600':'400'}" fill="${dominant.key==='N'?ACCENT:'#71717a'}">N · ${scores.N||0}%</text>
    </svg>`;

  const dominantBlurb = (dominant.score >= 50 ? dominant.hi : dominant.lo).split('.')[0] + '.';
  const weakestBlurb  = (weakest.score >= 50 ? weakest.hi : weakest.lo).split('.')[0] + '.';

  Gnosis.pdf.render({
    matrizName: 'Big Five OCEAN',
    matrizSubname: 'Personalidade científica',
    userName: nome,
    date: data,
    hero: {
      letter: dominant.key,
      eyebrow: 'Dimensão Dominante',
      title: dominant.name,
      subtitle: dominantBlurb,
    },
    dimensionsLabel: 'Distribuição OCEAN',
    dimensions: ['O','C','E','A','N'].map(k => ({
      letter: k,
      name: DIMS[k].name,
      pct: scores[k] || 0,
      isDominant: k === dominant.key,
    })),
    analysisLabel: 'Análise integrada',
    analysisBlocks: [
      { eyebrow: 'Síntese OCEAN',     title: 'Visão geral',     text: insightText },
      { eyebrow: 'Dimensão de tensão', title: weakest.name + ' (' + weakest.score + '%)', text: weakestBlurb + ' Esta polaridade com sua dimensão dominante define seu eixo central de autoconhecimento.' },
    ],
    customSection: `
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:24px;align-items:center;">
        <div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.12em;color:${ACCENT};text-transform:uppercase;font-weight:500;margin-bottom:8px;">Mapa visual OCEAN</div>
          <h4 style="font-size:16px;font-weight:700;color:#18181b;letter-spacing:-0.015em;margin-bottom:10px;">5 traços, 1 perfil</h4>
          <p style="font-size:12.5px;line-height:1.65;color:#52525b;">Quanto mais próximo da borda do pentágono, mais expressivo o traço. Os 5 eixos do Big Five formam sua assinatura de personalidade.</p>
        </div>
        <div style="display:flex;justify-content:center;">${radarSvg}</div>
      </div>`,
    citation: 'John, O. P., &amp; Srivastava, S. (1999). <em>Big Five Inventory (BFI-44).</em>',
    filename: 'bigfive-ocean.html',
  });
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

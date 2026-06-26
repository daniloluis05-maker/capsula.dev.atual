// ══════════════════════════════════════
// ARQUÉTIPOS — definições completas
// ══════════════════════════════════════

// Etapa 2 — eram window.* globais; convertidos pra let no escopo do script.
let _autoNext;

const ARCHETYPES = {
  innocente: { name:'Inocente',      icon:'☀', group:'ego',  groupName:'Ego',      color:'#F0C96B', theme:'Otimismo e fé no bem',
    hi:'Você mantém uma crença genuína de que as coisas tendem a se resolver e que as pessoas, no fundo, têm boas intenções. Sua presença transmite esperança e leveza — você enxerga possibilidades onde outros veem obstáculos.',
    career:'Ambientes de cuidado, educação, impacto social e criação de cultura organizacional positiva são onde você mais floresce.' },
  orfao:      { name:'Órfão',         icon:'🌱', group:'soul', groupName:'Alma',     color:'#2EC4A0', theme:'Empatia e solidariedade',
    hi:'Você tem radar apurado para injustiça e uma conexão profunda com quem está em desvantagem. Sua lealdade e empatia geram vínculos reais e duradouros — você não abandona quem está no chão.',
    career:'Liderança de causas, gestão de pessoas em contextos de vulnerabilidade, diversidade e inclusão são terrenos naturais.' },
  guerreiro:  { name:'Guerreiro',     icon:'⚔', group:'ego',  groupName:'Ego',      color:'#E8603A', theme:'Coragem e disciplina',
    hi:'Você enfrenta obstáculos sem recuar e encontra satisfação no esforço sistemático. Quando decide algo, vai até o fim — a persistência é uma de suas maiores qualidades e também uma fonte de respeito dos outros.',
    career:'Execução de projetos complexos, liderança em crises, esportes de performance e qualquer contexto que recompense disciplina.' },
  prestativo: { name:'Prestativo',    icon:'🤲', group:'soul', groupName:'Alma',     color:'#1BA8D4', theme:'Altruísmo e cuidado',
    hi:'Sua satisfação mais genuína vem de saber que fez diferença na vida de outra pessoa. Você antecipa necessidades, ouve com atenção real e tem dificuldade em dizer não — o que é tanto uma força quanto um risco.',
    career:'Saúde, educação, coaching, RH, atendimento ao cliente — qualquer função onde cuidar de pessoas seja o produto central.' },
  buscador:   { name:'Buscador',      icon:'🧭', group:'drive',groupName:'Liberdade',color:'#6C5FE6', theme:'Autonomia e autenticidade',
    hi:'Você sente desconforto genuíno quando é forçado a se encaixar em moldes que não são seus. A jornada de autodescoberta é algo que você leva a sério — você prefere uma vida autêntica a uma vida confortável mas falsa.',
    career:'Empreendedorismo, trabalho independente, pesquisa, profissões criativas e qualquer papel que ofereça autonomia real.' },
  destruidor: { name:'Destruidor',    icon:'🔥', group:'self', groupName:'Self',     color:'#E74C3C', theme:'Metamorfose e ruptura',
    hi:'Você tem facilidade singular em identificar o que já não serve e disposição para largá-lo — mesmo com custo alto. Suas transformações radicais assustam quem está ao redor, mas frequentemente provam ser a decisão certa.',
    career:'Inovação disruptiva, turnaround de empresas, jornalismo investigativo, transformação cultural e consultoria de mudança.' },
  amante:     { name:'Amante',        icon:'❤', group:'soul', groupName:'Alma',     color:'#E91E8C', theme:'Paixão e conexão profunda',
    hi:'Você se entrega com intensidade ao que ama — pessoas, causas, projetos. A beleza e o prazer são necessidades reais para você, não luxos. Relações superficiais são insatisfatórias; você precisa de profundidade.',
    career:'Arte, moda, gastronomia, relações públicas, gestão de comunidades, branding e qualquer campo que combine estética e conexão.' },
  criador:    { name:'Criador',       icon:'🎨', group:'self', groupName:'Self',     color:'#9B59B6', theme:'Imaginação e expressão',
    hi:'Você sente quase uma compulsão de criar — se ficou muito tempo sem produzir algo novo, fica inquieto. Sua visão interna é clara e você prefere começar do zero a aprimorar o que já existe.',
    career:'Design, arquitetura, desenvolvimento de produto, escrita, direção criativa e qualquer papel que recompense originalidade.' },
  governante: { name:'Governante',    icon:'👑', group:'ego',  groupName:'Ego',      color:'#C9A84C', theme:'Liderança e ordem',
    hi:'Você sente responsabilidade natural de organizar pessoas e recursos para um objetivo maior. O caos o incomoda e você tem facilidade em enxergar o panorama geral e tomar decisões que funcionam no longo prazo.',
    career:'Gestão executiva, política, empreendedorismo em escala, estratégia corporativa e qualquer papel de liderança com poder real.' },
  mago:       { name:'Mago',          icon:'✨', group:'self', groupName:'Self',     color:'#8E44AD', theme:'Transformação e visão sistêmica',
    hi:'Você enxerga padrões que outros não percebem e tem a habilidade de reunir elementos díspares para criar soluções que parecem impossíveis. Seu papel natural é catalisar transformações que outros não ousam iniciar.',
    career:'Estratégia, ciência, filosofia, inovação sistêmica, consultoria de alto nível e qualquer papel que exija síntese de complexidade.' },
  sabio:      { name:'Sábio',         icon:'🔭', group:'drive',groupName:'Liberdade',color:'#3498DB', theme:'Conhecimento e verdade',
    hi:'A verdade importa mais para você do que a conveniência — mesmo quando gera atrito. Você precisa entender em profundidade antes de se comprometer com qualquer coisa, e tem satisfação genuína em aprender por aprender.',
    career:'Pesquisa, academia, análise de dados, filosofia, medicina, direito e qualquer campo onde rigor intelectual seja valorizado.' },
  bobo:       { name:'Bobo da Corte', icon:'🃏', group:'drive',groupName:'Liberdade',color:'#27AE60', theme:'Leveza e disrupção lúdica',
    hi:'Você usa o humor para dizer verdades difíceis e transita entre papéis sem se prender a identidades fixas. Ambientes excessivamente sérios ou hierárquicos o sufocam — você floresce na espontaneidade e na imprevisibilidade.',
    career:'Comunicação, humor, entretenimento, cultura organizacional, marketing criativo e qualquer papel que valorize autenticidade e improviso.' },
};

const GROUP_COLORS = { ego:'#E8603A', soul:'#2EC4A0', self:'#9B59B6', drive:'#1BA8D4' };

const ARCH_ICONS = {
  innocente: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  orfao:     '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  guerreiro: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  prestativo:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  buscador:  '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  destruidor:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  amante:    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  criador:   '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  governante:'<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><line x1="2" y1="20" x2="22" y2="20"/>',
  mago:      '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/>',
  sabio:     '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  bobo:      '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>',
};

function archSvg(key, color, size) {
  size = size || 20;
  return '<svg viewBox="0 0 24 24" style="width:'+size+'px;height:'+size+'px;stroke:'+color+';stroke-width:1.75;fill:none;stroke-linecap:round;stroke-linejoin:round;">'+(ARCH_ICONS[key]||'')+'</svg>';
}

// ══════════════════════════════════════
// QUESTÕES — 60 itens (5 por arquétipo)
// ══════════════════════════════════════
const QUESTIONS = [
  // Inocente
  {arch:'innocente', text:'Mesmo após decepções, mantenho a crença de que as coisas se acertarão.'},
  {arch:'innocente', text:'Prefiro focar no que pode dar certo antes de pensar no que pode falhar.'},
  {arch:'innocente', text:'Tenho dificuldade em aceitar que algumas pessoas agem de má-fé.'},
  {arch:'innocente', text:'Sinto que o mundo, em essência, é um lugar seguro.'},
  {arch:'innocente', text:'Quando algo dá errado, minha primeira reação é encontrar o aprendizado, não o culpado.'},
  // Órfão
  {arch:'orfao', text:'Me identifico com pessoas que estão em posição de desvantagem ou que foram deixadas para trás.'},
  {arch:'orfao', text:'Prefiro liderar grupos que precisam de voz a liderar grupos que já têm poder.'},
  {arch:'orfao', text:'Sinto raiva genuína diante de situações de injustiça, mesmo quando não me afetam diretamente.'},
  {arch:'orfao', text:'Já me senti "o de fora" em grupos e aprendi a encontrar força nisso.'},
  {arch:'orfao', text:'A lealdade a quem me apoiou nos momentos difíceis é um valor central para mim.'},
  // Guerreiro
  {arch:'guerreiro', text:'Diante de obstáculos, minha primeira resposta é traçar um plano e agir, não recuar.'},
  {arch:'guerreiro', text:'Sinto satisfação genuína quando persisto em algo que outros desistiram.'},
  {arch:'guerreiro', text:'Tenho dificuldade em aceitar derrota — prefiro tentar de novo com outra estratégia.'},
  {arch:'guerreiro', text:'Defendo minhas posições mesmo quando gero desconforto nos outros.'},
  {arch:'guerreiro', text:'A disciplina e o esforço sistemático são centrais na forma como alcanço metas.'},
  // Prestativo
  {arch:'prestativo', text:'Sinto realização genuína quando minha ação melhora a vida de outra pessoa.'},
  {arch:'prestativo', text:'Tenho dificuldade em dizer não a pedidos de ajuda, mesmo quando estou sobrecarregado.'},
  {arch:'prestativo', text:'Minha satisfação no trabalho depende fortemente de sentir que fiz diferença para alguém.'},
  {arch:'prestativo', text:'Prefiro funções que envolvam suporte, cuidado ou desenvolvimento de pessoas.'},
  {arch:'prestativo', text:'Frequentemente percebo as necessidades dos outros antes que eles mesmos as verbalizem.'},
  // Buscador
  {arch:'buscador', text:'Sinto desconforto em ambientes que me pedem para me encaixar num molde que não é meu.'},
  {arch:'buscador', text:'Prefiro uma vida com menos certezas, mas que seja genuinamente minha.'},
  {arch:'buscador', text:'A busca por quem eu realmente sou é um processo que ainda está em aberto.'},
  {arch:'buscador', text:'Valorizo experiências novas mesmo que não tenham utilidade imediata — pelo que revelam sobre mim.'},
  {arch:'buscador', text:'Quando sinto que estou traindo meus valores para agradar outros, fico profundamente incomodado.'},
  // Destruidor
  {arch:'destruidor', text:'Tenho facilidade em abandonar projetos, relações ou crenças que percebo que não me servem mais.'},
  {arch:'destruidor', text:'Prefiro a ruptura honesta ao conforto de uma situação que sinto estar apodrecendo.'},
  {arch:'destruidor', text:'Já passei por mudanças tão radicais que quem me conheceu antes teria dificuldade em me reconhecer.'},
  {arch:'destruidor', text:'Sinto um impulso de desconstruir sistemas, rotinas ou estruturas que parecem obsoletos.'},
  {arch:'destruidor', text:'A possibilidade de começar do zero, mesmo com custo alto, não me assusta — muitas vezes me atrai.'},
  // Amante
  {arch:'amante', text:'Me entrego com intensidade àquilo que me apaixona — raramente faço as coisas pela metade.'},
  {arch:'amante', text:'A beleza, a estética e o prazer sensorial importam genuinamente para mim.'},
  {arch:'amante', text:'Preciso sentir paixão pelo que faço para dar o meu melhor.'},
  {arch:'amante', text:'Relações superficiais me satisfazem pouco — busco conexões reais, mesmo que sejam poucas.'},
  {arch:'amante', text:'Sou movido por emoções intensas, tanto no amor quanto em causas que defendo.'},
  // Criador
  {arch:'criador', text:'Sinto quase uma compulsão de criar — se fico muito tempo sem produzir algo novo, fico inquieto.'},
  {arch:'criador', text:'Prefiro criar do zero a aperfeiçoar o que já existe.'},
  {arch:'criador', text:'Tenho uma visão interna clara de como as coisas poderiam ser e isso me motiva a agir.'},
  {arch:'criador', text:'A originalidade importa muito para mim — copiar sem dar minha marca me parece insuficiente.'},
  {arch:'criador', text:'Encontro significado na expressão criativa, seja em arte, negócios, escrita ou qualquer outro domínio.'},
  // Governante
  {arch:'governante', text:'Sinto responsabilidade natural de organizar pessoas e recursos para alcançar um objetivo comum.'},
  {arch:'governante', text:'Prefiro estar no comando a depender de decisões de outros — mesmo que isso gere mais carga.'},
  {arch:'governante', text:'A ideia de deixar um legado duradouro guia muitas das minhas escolhas.'},
  {arch:'governante', text:'Me incomoda quando há caos onde poderia haver estrutura e responsabilidade clara.'},
  {arch:'governante', text:'Tenho facilidade em enxergar o panorama geral e alocar o que é necessário para que funcione.'},
  // Mago
  {arch:'mago', text:'Tenho facilidade em perceber padrões invisíveis — conexões que outros ainda não viram.'},
  {arch:'mago', text:'Acredito que com o conhecimento e a intenção certos é possível transformar qualquer situação.'},
  {arch:'mago', text:'Me sinto atraído por catalisar mudanças profundas nas pessoas ou nos sistemas ao meu redor.'},
  {arch:'mago', text:'Tenho habilidade de reunir elementos díspares e criar soluções que parecem improváveis para quem está de fora.'},
  {arch:'mago', text:'Sinto que meu papel muitas vezes é fazer o impossível parecer inevitável.'},
  // Sábio
  {arch:'sabio', text:'Preciso entender em profundidade antes de me comprometer com uma posição ou decisão.'},
  {arch:'sabio', text:'A verdade importa mais para mim do que a conveniência — mesmo quando ela gera atrito.'},
  {arch:'sabio', text:'Tenho satisfação genuína em aprender por aprender, sem necessidade de aplicação imediata.'},
  {arch:'sabio', text:'Me incomoda profundamente quando percebo que uma crença amplamente aceita é equivocada.'},
  {arch:'sabio', text:'Prefiro questionar premissas a seguir consensos sem análise própria.'},
  // Bobo da Corte
  {arch:'bobo', text:'Uso o humor para dizer verdades que seriam difíceis de ouvir de outra forma.'},
  {arch:'bobo', text:'Me sinto sufocado em ambientes excessivamente sérios ou hierárquicos.'},
  {arch:'bobo', text:'Tenho facilidade em transitar entre papéis — raramente me prendo a uma identidade fixa.'},
  {arch:'bobo', text:'A brincadeira e a leveza são, para mim, formas genuínas de gerar conexão e insight.'},
  {arch:'bobo', text:'Me sinto mais vivo quando posso ser espontâneo, imprevisível e quebrar expectativas.'},
];

const HINTS = ['Não me identifico','Raramente','Às vezes','Frequentemente','Muito a ver comigo'];

let currentQ = 0;
let answers = [];

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

function startQuiz(){
  if (window.gnosisTrack) gnosisTrack('quiz_started', { matriz: 'pearson' });
  if (window.gnosisQuizSave) {
    const saved = gnosisQuizSave.restore('pearson');
    if (saved && saved.state && Array.isArray(saved.state.answers)) {
      const answered = saved.state.answers.filter(a => a !== null).length;
      if (answered > 0 && answered < QUESTIONS.length) {
        gnosisQuizSave.promptResume({
          matriz: 'pearson', label: 'Pearson-Marr',
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
  answers = new Array(QUESTIONS.length).fill(null);
  showPage('page-quiz');
  renderQuestion(0);
}

function goBack(){
  if(currentQ === 0) showPage('page-intro');
  else { currentQ--; renderQuestion(currentQ); }
}

function renderQuestion(idx){
  const q = QUESTIONS[idx];
  const arch = ARCHETYPES[q.arch];
  const pct = Math.round((idx / QUESTIONS.length) * 100);
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-label').textContent = `${idx + 1} de ${QUESTIONS.length}`;

  const sel = answers[idx];
  const card = document.getElementById('question-card');
  card.style.animation = 'none'; card.offsetHeight; card.style.animation = '';

  card.innerHTML = `
    <div class="arch-tag" style="color:${arch.color};border-color:${arch.color}44;background:${arch.color}11;">
      <span style="background:${arch.color};width:6px;height:6px;border-radius:50%;display:inline-block;"></span>
      ${arch.name} · ${arch.groupName}
    </div>
    <span class="question-num">// afirmação ${idx + 1} de ${QUESTIONS.length}</span>
    <div class="question-text">${q.text}</div>
    <div class="scale-label-row"><span>Não me identifico</span><span>Muito a ver comigo</span></div>
    <div class="scale-btns" role="radiogroup" aria-label="Avalie de 1 (não me identifico) a 5 (muito a ver comigo)">
      ${[1,2,3,4,5].map(v=>`
        <button class="scale-btn ${sel===v?'selected':''}" data-val="${v}"
          style="--q-color:${arch.color};${sel===v?`border-color:${arch.color};background:${arch.color}15;`:''}"
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
        style="background:${arch.color};color:${arch.group==='ego'||arch.group==='drive'?'#fff':'#fff'}"
        onclick="nextQuestion()">
        ${idx === QUESTIONS.length - 1 ? 'Ver meu resultado →' : 'Próxima →'}
      </button>
    </div>
  `;
}

function selectAnswer(idx, val){
  answers[idx] = val;
  if (window.gnosisQuizSave) gnosisQuizSave.save('pearson', { answers: answers, currentQ: idx });
  document.querySelectorAll('.scale-btn').forEach(b=>b.classList.remove('selected'));
  const selBtn = document.querySelector(`.scale-btn[data-val="${val}"]`);
  const arch = ARCHETYPES[QUESTIONS[idx].arch];
  selBtn.classList.add('selected');
  selBtn.style.borderColor = arch.color;
  selBtn.style.background = arch.color + '15';
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
  if (window.gnosisQuizSave) gnosisQuizSave.clear('pearson');
  if (window.gnosisTrack) gnosisTrack('quiz_completed', { matriz: 'pearson' });
  const raw = {};
  Object.keys(ARCHETYPES).forEach(k => raw[k] = []);
  QUESTIONS.forEach((q, i) => {
    raw[q.arch].push(answers[i] || 3);
  });
  const scores = {};
  Object.keys(raw).forEach(arch => {
    const mean = raw[arch].reduce((a,b)=>a+b,0) / raw[arch].length;
    scores[arch] = Math.round(((mean - 1) / 4) * 100);
  });
  return scores;
}

// ══════════════════════════════════════
// RADAR SVG — 12 eixos
// ══════════════════════════════════════
function buildRadar(scores){
  const cx = 220, cy = 220, r = 160;
  const keys = Object.keys(ARCHETYPES);
  const n = keys.length;

  function pt(i, pct, radius){
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    const dist = (pct / 100) * radius;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  }

  let gridSvg = '';
  [20,40,60,80,100].forEach(pct => {
    const pts = keys.map((_,i) => pt(i, pct, r));
    gridSvg += `<polygon points="${pts.map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>`;
  });

  const axesSvg = keys.map((_,i) => {
    const p = pt(i, 100, r);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
  }).join('');

  const dataPts = keys.map((k,i) => pt(i, scores[k], r));
  const polyPoints = dataPts.map(p=>`${p.x},${p.y}`).join(' ');

  const dotsSvg = dataPts.map((p,i) => {
    const arch = ARCHETYPES[keys[i]];
    return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${arch.color}" stroke="#07080C" stroke-width="2"/>`;
  }).join('');

  const labelsSvg = keys.map((k,i) => {
    const p = pt(i, 128, r);
    const arch = ARCHETYPES[k];
    const anchor = p.x < cx - 8 ? 'end' : p.x > cx + 8 ? 'start' : 'middle';
    return `
      <text x="${p.x}" y="${p.y - 5}" text-anchor="${anchor}" font-family="Space Mono,monospace"
        font-size="7.5" fill="${arch.color}" font-weight="700" letter-spacing="0.04em">${arch.name.toUpperCase()}</text>
      <text x="${p.x}" y="${p.y + 8}" text-anchor="${anchor}" font-family="Space Mono,monospace"
        font-size="9" fill="${arch.color}" font-weight="700">${scores[k]}%</text>
    `;
  }).join('');

  return `<svg viewBox="0 0 440 440" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#C9A84C" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#9B59B6" stop-opacity="0.12"/>
      </linearGradient>
    </defs>
    ${gridSvg}${axesSvg}
    <polygon points="${polyPoints}" fill="url(#radarGrad)" stroke="#C9A84C" stroke-width="1.5" stroke-opacity="0.5"/>
    ${dotsSvg}${labelsSvg}
  </svg>`;
}

// ══════════════════════════════════════
// INSIGHT TEXTO
// ══════════════════════════════════════
function getInsight(scores, topArch){
  const arch = ARCHETYPES[topArch];
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const second = ARCHETYPES[sorted[1][0]];

  let text = `<strong>Seu arquétipo dominante é ${arch.name} (${scores[topArch]}%)</strong>. ${arch.hi}`;
  text += `<br><br>`;
  text += `Seu segundo arquétipo mais forte é <strong>${second.name}</strong> — ${second.theme.toLowerCase()}. `;

  // Combos notáveis
  const top2 = [sorted[0][0], sorted[1][0]].sort().join('+');
  const combos = {
    'governante+mago': 'A combinação Governante + Mago é rara e poderosa: você organiza sistemas <em>e</em> os transforma. Perfil de fundador ou líder visionário que executa.',
    'criador+mago': 'Criador + Mago indica alguém que não apenas imagina soluções originais — você as manifesta no mundo real com uma habilidade quase inexplicável para outros.',
    'guerreiro+governante': 'Guerreiro + Governante: você tem a disciplina para executar e a visão para liderar. Alta capacidade de construir e manter estruturas de alta performance.',
    'buscador+destruidor': 'Buscador + Destruidor é o perfil do eterno reinventor — você não tem medo de deixar para trás o que foi, em busca de algo mais autêntico.',
    'prestativo+amante': 'Prestativo + Amante: você se dedica com paixão genuína ao bem-estar dos outros. Risco de se perder nas necessidades alheias — cuide de você com a mesma intensidade.',
    'sabio+mago': 'Sábio + Mago é o perfil do estrategista de elite: você entende sistemas em profundidade e tem a habilidade de transformá-los usando esse conhecimento.',
    'bobo+criador': 'Bobo da Corte + Criador: sua criatividade tem leveza e humor — você inova sem solenidade. Isso o torna singularmente eficaz em ambientes que precisam de renovação sem trauma.',
  };

  const comboKey = Object.keys(combos).find(k => {
    const parts = k.split('+');
    return parts.every(p => [sorted[0][0], sorted[1][0]].includes(p));
  });

  if(comboKey) text += `<br><br>✦ <em>${combos[comboKey]}</em>`;
  else text += `<br><br>✦ Observe como esses dois arquétipos se amplificam — a ${arch.theme.toLowerCase()} do ${arch.name} combinada com a ${second.theme.toLowerCase()} do ${second.name} define uma assinatura comportamental única.`;

  return text;
}

// Cruzamento com outros testes removido — Pearson-Marr é analisado de
// forma isolada. Integração entre matrizes só acontece no DNA Estratégico.

// ══════════════════════════════════════
// EXIBIÇÃO DO RESULTADO
// ══════════════════════════════════════
function showResult(){
  showPage('page-result');
  const scores = calcScores();
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const topKey = sorted[0][0];
  const topArch = ARCHETYPES[topKey];

  // Card dominante
  const card = document.getElementById('dominant-card');
  card.setAttribute('data-icon', '');
  const iconEl = document.getElementById('dominant-icon');
  if(iconEl) iconEl.innerHTML = archSvg(topKey, topArch.color, 40);
  card.style.borderColor = topArch.color + '40';
  card.style.background = `linear-gradient(135deg,${topArch.color}0A,rgba(155,89,182,0.04))`;
  document.getElementById('dominant-name').textContent = topArch.name;
  document.getElementById('dominant-name').style.color = topArch.color;
  document.getElementById('dominant-theme').textContent = `// ${topArch.theme.toUpperCase()}`;
  document.getElementById('dominant-desc').textContent = topArch.hi;
  const badge = document.getElementById('dominant-badge');
  badge.textContent = `⬡ ${topArch.groupName}`;
  badge.style.color = GROUP_COLORS[topArch.group];
  badge.style.borderColor = GROUP_COLORS[topArch.group] + '50';
  badge.style.background = GROUP_COLORS[topArch.group] + '12';

  document.getElementById('result-sub').textContent =
    `${topArch.name} dominante · ${scores[topKey]}% · grupo ${topArch.groupName}`;

  // Radar
  document.getElementById('radar-wrap').innerHTML = buildRadar(scores);

  // Cards ordenados
  document.getElementById('archs-result').innerHTML = sorted.map(([k, score], i) => {
    const a = ARCHETYPES[k];
    return `
      <div class="arch-result-card ${i===0?'highlight':''}" style="${i===0?`border-color:${a.color}44;background:${a.color}08;`:''}">
        <div class="arch-icon-wrap" style="background:${a.color}18;border:1px solid ${a.color}30;">${archSvg(k, a.color, 18)}</div>
        <div>
          <div class="arch-result-name">${a.name}</div>
          <div class="arch-result-group" style="color:${GROUP_COLORS[a.group]}">${a.groupName} · ${score >= 60 ? 'Forte' : score >= 40 ? 'Moderado' : 'Latente'}</div>
          <div class="score-bar-row">
            <div class="score-bar-track">
              <div class="score-bar-fill" data-pct="${score}" style="width:0%;background:${a.color};"></div>
            </div>
            <span class="score-pct">${score}%</span>
          </div>
        </div>
        <div class="arch-score-col">
          <span class="arch-score-val" style="color:${a.color}">${score}</span>
          <span class="arch-score-max">/ 100</span>
        </div>
      </div>
    `;
  }).join('');

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
    <span class="insight-label">✦ ANÁLISE DO SEU PERFIL ARQUETÍPICO</span>
    <p>${getInsight(scores, topKey)}</p>
    <p style="margin-top:1rem;font-size:0.82rem;color:var(--muted);border-top:1px solid var(--border);padding-top:1rem;">${topArch.career}</p>
  `;

  // Cruzamento removido — resultado mostra apenas o arquétipo isolado.
  // Integração entre matrizes acontece no DNA Estratégico.

  // ── SALVAR ───────────────────────────────────────────────────
  const u = (capsulaDB.lsGetUser() || {});
  if(!u.uid){ u.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }
  u.pearson = {
    scores,
    topArchetype: topKey,
    topArchetypeName: topArch.name,
    completedAt: new Date().toISOString()
  };
  capsulaDB.lsSetUser(u);
  try { sessionStorage.setItem('capsula_user', JSON.stringify(u)); } catch(_) {}
  try {
    const perfis = capsulaDB.lsGetUsers();
    const idx = perfis.findIndex(p => p.uid === u.uid);
    if(idx >= 0){ perfis[idx].pearson = u.pearson; capsulaDB.lsSetUsers(perfis); }
  } catch(e) {}
  if(window.capsulaDB && u.email){ capsulaDB.saveUser(u).catch(e => console.warn('[pearson] sync:', e)); }

  // Bloco "E agora?"
  if (window.gnosisPostResult) {
    window.gnosisPostResult.render({
      fromKey: 'pearson',
      resultLabel: 'Arquétipo: ' + topArch.name,
      containerId: 'page-result',
    });
  }
}

// ══════════════════════════════════════
// PDF
// ══════════════════════════════════════
function generatePDF(){
  if (window._payments) {
    _payments.serverDebitCredit('pearson').then(function(ok) {
      if (!ok) { _payments.showPaywall('pearson'); return; }
      _generatePDF();
    });
    return;
  }
  _generatePDF();
}
function _generatePDF(){
  const u = capsulaDB.lsGetUser() || {};
  const nome = u.nome || u.apelido || 'Usuário';
  const scores = calcScores();
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const topKey = sorted[0][0];
  const topArch = ARCHETYPES[topKey];
  const bottomKey = sorted[sorted.length-1][0];
  const bottomArch = ARCHETYPES[bottomKey];
  const data = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  const ACCENT = '#7C6FF7';

  // Group averages
  const groupScores = {ego:[],soul:[],self:[],drive:[]};
  sorted.forEach(([k,s])=>{ const g=ARCHETYPES[k].group; if(groupScores[g])groupScores[g].push(s); });
  const groupAvg = k => Math.round(groupScores[k].reduce((a,b)=>a+b,0)/groupScores[k].length);
  const GROUP_NAMES = {ego:'Ego',soul:'Alma',self:'Self',drive:'Liberdade'};

  // (chips e radar do PDF antigo removidos — substituídos pelo custom section abaixo)

  // Radar SVG — 12 axes, center 130,130, rMax 88
  const AXIS_OUTER = [
    [130,42],[172,54],[200,86],[208,130],[200,174],[172,206],
    [130,218],[88,206],[60,174],[52,130],[60,86],[88,54]
  ];
  const ARCH_ORDER = ['governante','guerreiro','destruidor','prestativo','sabio','criador','mago','orfao','bobo','buscador','amante','innocente'];
  const radarPoints = ARCH_ORDER.map((k,i)=>{
    const s=(scores[k]||0)/100;
    const [ox,oy]=AXIS_OUTER[i];
    return `${(130+(ox-130)*s).toFixed(1)},${(130+(oy-130)*s).toFixed(1)}`;
  }).join(' ');
  const radarDots = ARCH_ORDER.map((k,i)=>{
    const s=(scores[k]||0)/100;
    const [ox,oy]=AXIS_OUTER[i];
    const cx=(130+(ox-130)*s).toFixed(1), cy=(130+(oy-130)*s).toFixed(1);
    return `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${ARCHETYPES[k].color}" stroke="#f8fafc" stroke-width="1.5"/>`;
  }).join('');
  const RADAR_LABELS = ['GOVERNANTE','GUERREIRO','DESTRUIDOR','PRESTATIVO','SÁBIO','CRIADOR','MAGO','ÓRFÃO','BOBO','BUSCADOR','AMANTE','INOCENTE'];
  const LABEL_POS = [[130,36,'middle'],[178,52,'start'],[204,84,'start'],[214,133,'start'],[202,176,'start'],[170,210,'start'],[130,228,'middle'],[88,210,'end'],[56,176,'end'],[46,133,'end'],[54,84,'end'],[84,52,'end']];
  const radarLabels = ARCH_ORDER.map((k,i)=>{
    const [lx,ly,ta]=LABEL_POS[i];
    return `<text x="${lx}" y="${ly}" text-anchor="${ta}" font-family="Space Mono,monospace" font-size="6" fill="${ARCHETYPES[k].color}">${RADAR_LABELS[i]}</text>`;
  }).join('');

  const topS = sorted[0][1], botS = sorted[sorted.length-1][1];
  const insightRaw = getInsight(scores, topKey).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const insightShort = insightRaw.length > 420 ? insightRaw.slice(0, 420).replace(/\s\S+$/, '') + '…' : insightRaw;

  // Top 6 arquétipos como "dimensões" no template (12 não cabe esteticamente).
  // Restante vai pra ranking no customSection.
  const top6 = sorted.slice(0, 6).map(([k, score]) => ({
    letter: ARCHETYPES[k].icon || k.charAt(0).toUpperCase(),
    name: ARCHETYPES[k].name,
    pct: score,
    isDominant: k === topKey,
  }));

  // Médias por grupo + ranking 7-12 no custom section
  const groupGridHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;">'
    + Object.keys(groupScores).map(g => {
        const avg = groupAvg(g);
        return '<div style="background:#fff;border:1px solid #e4e4e7;border-radius:8px;padding:14px;text-align:center;">'
          + '<div style="font-family:IBM Plex Mono,monospace;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:#71717a;margin-bottom:6px;">'+GROUP_NAMES[g]+'</div>'
          + '<div style="font-size:22px;font-weight:300;color:#18181b;">'+avg+'<sub style="font-size:11px;color:#a1a1aa;vertical-align:baseline;">%</sub></div>'
          + '</div>';
      }).join('') + '</div>';

  const restRankingHTML = sorted.slice(6).length ? (
    '<div style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:0.12em;color:#7C6FF7;text-transform:uppercase;font-weight:500;margin-bottom:10px;">Demais arquétipos</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;">'
    + sorted.slice(6).map(([k,score],i) => {
        const a = ARCHETYPES[k];
        return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">'
          + '<span style="font-family:IBM Plex Mono,monospace;font-size:10px;color:#a1a1aa;min-width:18px;">'+(i+7).toString().padStart(2,'0')+'</span>'
          + '<span style="flex:1;font-size:12px;font-weight:600;color:#18181b;">'+a.name+'</span>'
          + '<span style="font-family:IBM Plex Mono,monospace;font-size:11px;color:#52525b;">'+score+'%</span>'
          + '</div>';
      }).join('') + '</div>'
  ) : '';

  Gnosis.pdf.render({
    matrizName: 'Pearson-Marr',
    matrizSubname: 'Arquétipos junguianos',
    userName: nome,
    date: data,
    hero: {
      letter: topArch.icon || topKey.charAt(0).toUpperCase(),
      eyebrow: 'Arquétipo Dominante · ' + topArch.groupName,
      title: topArch.name,
      subtitle: topArch.hi,
    },
    dimensionsLabel: 'Top 6 arquétipos',
    dimensions: top6,
    analysisLabel: 'Análise arquetípica',
    analysisBlocks: [
      { eyebrow: 'Síntese',           title: 'Sua composição',          text: insightShort },
      { eyebrow: 'Vocação',           title: 'Onde se manifesta',       text: topArch.career },
      { eyebrow: 'Tensão estrutural', title: topArch.name + ' × ' + bottomArch.name, text: 'A dominância do ' + topArch.name + ' (' + topS + '%) contrasta com a baixa expressão do ' + bottomArch.name + ' (' + botS + '%). Esta polaridade revela a tensão entre ' + topArch.theme.toLowerCase() + ' e ' + bottomArch.theme.toLowerCase() + ' — eixo de crescimento.' },
      { eyebrow: 'Grupos junguianos', title: 'Médias por grupo',        text: 'Ego, Alma, Self e Liberdade — os 4 grandes blocos de arquétipos que compõem sua identidade junguiana.' },
    ],
    customSection: groupGridHTML + restRankingHTML,
    citation: 'Pearson, C. S. (1991). <em>Awakening the Heroes Within.</em>',
    filename: 'pearson-resultado.html',
  });
}

document.addEventListener('DOMContentLoaded', async function(){
  let u = null;
  try { u = await capsulaDB.ensureUserData(); } catch(e) {}
  u = u || {};

  if (window._payments && !_payments.isPro() && !_payments.isAdmin()) {
    const _c = _payments.getCredits();
    const _hasSpec = (_c['pearson'] || 0) > 0, _hasAvul = (_c.avulsos || 0) > 0;
    if (!_hasSpec && !_hasAvul) {
      _payments.showPaywall('pearson');
      const _gate = new MutationObserver(function() {
        if (!document.getElementById('_paywall-modal')) {
          _gate.disconnect();
          if (!_payments.hasAccess('pearson')) window.location.href = 'dashboard.html';
        }
      });
      _gate.observe(document.body, { childList: true, subtree: true });
      return;
    }
    if (!_hasSpec && _hasAvul) await _payments.unlockMatrix('pearson');
  }

  if (u.pearson && u.pearson.completedAt && u.pearson.scores) {
    var saved = u.pearson.scores;
    window.calcScores = function() { return saved; };
    showResult();
    return;
  }

  if (!u.nome && !u.apelido && !u.email) { window.location.href = 'index.html'; return; }
  if (!u.uid) { u.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); try{ capsulaDB.lsSetUser(u); }catch(_){} }
});

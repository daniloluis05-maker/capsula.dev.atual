// ── PROFILE CONFIGS ───────────────────────────────────────────────────────────
const PROFILE_CONFIGS = {
  lider_catalisador:     { label:'Líder Catalisador',      color:'#E8603A' },
  especialista_sistemico:{ label:'Especialista Sistêmico', color:'#5048C8' },
  empreendedor_autonomo: { label:'Empreendedor Autônomo',  color:'#B8922A' },
  construtor_relacional: { label:'Construtor Relacional',  color:'#1FA888' },
  guardiao_qualidade:    { label:'Guardião de Qualidade',  color:'#1BA8D4' },
  visionario_estrategico:{ label:'Visionário Estratégico', color:'#7000FF' },
};

// ── LOADING MESSAGES ─────────────────────────────────────────────────────────
const LOG_MESSAGES = [
  'Carregando matrizes comportamentais...',
  'Detectando arquétipo comportamental dominante...',
  'Cruzando DISC × Big Five × TCI...',
  'Analisando Âncoras × Ikigai × Pearson-Marr...',
  'Mapeando Pilar de Poder e Zona de Risco...',
  'Construindo direcionamento profissional...',
  'Analisando padrões relacionais e emocionais...',
  'Identificando tensão estrutural e ciclo de sabotagem...',
  'Calibrando plano de ação 90 dias...',
  'Destilando Código de Convergência e Ação de Ouro...',
  'Finalizando Dossiê Comportamental...',
];

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user');
  if (!raw) { window.location.href = 'index.html'; return; }
  const u = JSON.parse(raw);
  if (!u.nome && !u.apelido && !u.email) { window.location.href = 'index.html'; return; }

  const name = u.apelido || u.nome || 'Usuário';
  document.getElementById('sb-name').textContent = name;
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('sb-avatar').textContent = initials;

  renderRequirements(u);

  // Restaura dossiê anterior se existir
  if (u.dna && u.dna.generated && u.dna.generatedAt) {
    try {
      const palette = determinePalette(u);
      applyPalette(palette);
      renderDNA(u.dna.generated, buildPayload(u), palette, true);
    } catch(e) { console.warn('[dna] restore failed', e); }
  }
});

function getUser() {
  const raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user') || '{}';
  return JSON.parse(raw);
}

// ── REQUIREMENTS ──────────────────────────────────────────────────────────────
function renderRequirements(u) {
  const matrices = [
    { key:'disc',    icon:'🎯', label:'DISC',         done: !!(u.disc && u.disc.completedAt) },
    { key:'soar',    icon:'🧭', label:'SOAR',         done: !!(u.soar && u.soar.completedAt) },
    { key:'ikigai',  icon:'🌸', label:'Ikigai',       done: !!(u.ikigai && u.ikigai.completedAt) },
    { key:'ancoras', icon:'⚓', label:'Âncoras',      done: !!(u.ancoras && u.ancoras.completedAt) },
    { key:'johari',  icon:'🪟', label:'Johari',       done: !!(u.johari && u.johari.completedAt) },
    { key:'bigfive', icon:'🧠', label:'Big Five',     done: !!(u.bigfive && u.bigfive.completedAt) },
    { key:'pearson', icon:'🏛️', label:'Pearson-Marr', done: !!(u.pearson && u.pearson.completedAt) },
    { key:'tci',    icon:'🧬', label:'Temperamento TCI', done: !!(u.tci && u.tci.completedAt) },
  ];
  const completedCount = matrices.filter(m => m.done).length;
  const grid = document.getElementById('req-grid');
  grid.innerHTML = matrices.map(m => `
    <div class="req-item ${m.done ? 'done' : 'pending'}">
      <div class="req-dot"></div>
      <div>
        <div class="req-label">${m.icon} ${m.label}</div>
        <div class="req-status">${m.done ? 'concluído' : 'pendente'}</div>
      </div>
    </div>
  `).join('');

  const gate = document.getElementById('req-gate');
  gate.classList.add('visible');
  const btn = document.getElementById('btn-gen');

  if (completedCount < 3) {
    btn.disabled = true;
    document.getElementById('insuff-data').classList.add('visible');
    gate.querySelector('h2').textContent = `Apenas ${completedCount}/7 matrizes completas`;
  } else {
    gate.querySelector('h2').textContent = `${completedCount}/7 matrizes completas — pronto para sequenciar`;
  }
}

// ── GENERATE DNA ──────────────────────────────────────────────────────────────
async function generateDNA() {
  const u = getUser();
  const payload = buildPayload(u);
  const palette = determinePalette(u);
  applyPalette(palette);

  ['req-gate','dna-document','insuff-data'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('visible'); el.style.display = ''; }
  });
  ['autogestao-panel','emocional-block','acao-ouro','convergence-block',
   'direcao-pro-block','direcao-pes-block','tensao-block','plano-block'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.getElementById('dna-document').classList.remove('visible');
  document.getElementById('btn-gen').disabled = true;

  const loadBlock = document.getElementById('loading-block');
  loadBlock.classList.add('visible');
  startLoadingAnimation();

  try {
    const cfg = window.CAPSULA_CONFIG || {};
    const proxyUrl = (cfg.supabaseUrl || '') + '/functions/v1/groq-proxy';
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (cfg.supabaseKey || ''),
      },
      body: JSON.stringify({
        email: u.email,                         // necessário para rate limit
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4000,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user',   content: buildUserPrompt(payload) }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(err.error || 'Você atingiu o limite de gerações por hora. Tente novamente mais tarde.');
      }
      throw new Error(err.error?.message || err.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    stopLoadingAnimation();
    loadBlock.classList.remove('visible');
    renderDNA(text, payload, palette, false);

  } catch (err) {
    stopLoadingAnimation();
    loadBlock.classList.remove('visible');
    document.getElementById('btn-gen').disabled = false;
    document.getElementById('req-gate').classList.add('visible');
    showError('Falha ao gerar Dossiê: ' + err.message);
    console.error('[DNA v2] Erro:', err);
  }
}

// ── BUILD PAYLOAD ─────────────────────────────────────────────────────────────
function buildPayload(u) {
  const disc    = u.disc?.scores    || {};
  const bf      = u.bigfive?.scores || {};
  const anc     = u.ancoras         || {};
  const johari  = u.johari          || {};
  const soar    = u.soar?.answers   || {};
  const ikigai  = u.ikigai?.answers || {};
  const pearson = u.pearson         || {};
  const tci     = u.tci             || {};

  const ikigaiTexto = Object.values(ikigai)
    .flatMap(v => typeof v === 'object' ? Object.values(v) : [v])
    .filter(Boolean).join(' | ');

  const soarForcas = Object.values(soar.S || {}).filter(Boolean);
  const soarAspiracoes = [
    ...Object.values(soar.O || {}),
    ...Object.values(soar.A || {}),
    ...Object.values(soar.R || {})
  ].filter(Boolean);

  return {
    usuario: {
      nome: u.apelido || u.nome || 'Usuário',
      objetivo_profissional: u.objetivo || '',
    },
    testes: {
      disc: disc,
      big_five: bf,
      ancoras: {
        principal: anc.topAnchor || '',
        pontuacao: Object.entries(anc.scores || {}).map(([k,v]) => ({ ancora: k, score: v })),
      },
      johari: {
        area_aberta: johari.aberto || [],
        area_cega:   johari.cego   || [],
        area_oculta: johari.oculto || [],
      },
      ikigai: { texto_bruto: ikigaiTexto },
      soar: { forcas: soarForcas, aspiracoes: soarAspiracoes },
      tci: {
        busca_novidade: tci.scores?.BN || null,
        esquiva_danos:  tci.scores?.ED || null,
        dep_recompensa: tci.scores?.DR || null,
        persistencia:   tci.scores?.PE || null,
      },
      pearson_marr: {
        arquetipo_dominante:      pearson.topArchetype     || '',
        arquetipo_dominante_nome: pearson.topArchetypeName || '',
        scores: pearson.scores || {},
      },
    },
    _completedCount: [u.disc, u.soar, u.ikigai, u.ancoras, u.johari, u.bigfive, u.pearson, u.tci]
      .filter(m => m && m.completedAt).length,
  };
}

// ── PALETTE ───────────────────────────────────────────────────────────────────
function determinePalette(u) {
  const disc = u.disc?.scores || {};
  const D = disc.D||0, I = disc.I||0, S = disc.S||0, C = disc.C||0;
  if ((D > 60 || I > 60) && (D + I > S + C)) {
    return { type:'gold-graphite', primary:'#C9A84C', secondary:'#7000FF', desc:'Perfil Dominante/Influente detectado' };
  }
  return { type:'teal-slate', primary:'#1BA8D4', secondary:'#2EC4A0', desc:'Perfil Analítico/Estável detectado' };
}

function applyPalette(palette) {
  document.documentElement.style.setProperty('--dna-primary',   palette.primary);
  document.documentElement.style.setProperty('--dna-secondary', palette.secondary);
  document.querySelector('.orb-1').style.background = palette.primary;
  document.querySelector('.orb-2').style.background = palette.secondary;
}

// ── SYSTEM PROMPT v3.0 ────────────────────────────────────────────────────────
function buildSystemPrompt() {
  return `Você é o Analista Comportamental Sênior da plataforma Sistema Gnosis. Sua missão é gerar um Dossiê de Análise Comportamental profundo — não um resumo de resultados, mas uma análise que revela o que o cruzamento das matrizes indica e o que o usuário ainda não conscientizou, com direcionamento concreto profissional e pessoal.

PASSO 1 — DETECTE O PROFILE_TYPE (analise primeiro, antes de qualquer outro campo):

lider_catalisador: DISC D>55 ou I>55 dominante · Âncora = gestão/serviço/desafio · Arquétipo = Herói/Governante/Guerreiro/Prestativo com foco relacional
especialista_sistemico: DISC C>55 dominante · Âncora = técnica/segurança · Arquétipo = Sábio/Mago/Criador com foco em profundidade
empreendedor_autonomo: DISC D>55 dominante · Âncora = autonomia/empreendedor · Arquétipo = Buscador/Guerreiro/Herói com foco em independência
construtor_relacional: DISC S>55 ou I>55 dominante · Âncora = serviço/estilo_vida/desafio · Arquétipo = Prestativo/Amante/Inocente com foco em conexão
guardiao_qualidade: DISC C>60 ou S>60 dominante · Âncora = segurança/técnica · Arquétipo = Governante/Órfão/Cuidador com foco em estabilidade
visionario_estrategico: DISC D+C equilibrados (ambos >45) · Âncora = empreendedor/autonomia · Arquétipo = Mago/Criador/Sábio com foco em síntese sistêmica

Desempate: Âncora principal > DISC dominante > Arquétipo.

PASSO 2 — GERE O DOSSIÊ adaptado ao profile_type detectado.

REGRAS DE ANÁLISE:
- PROIBIDO: resumir o que os testes mostram individualmente. OBRIGATÓRIO: revelar o que a INTERSEÇÃO indica.
- PROIBIDO: "Baseado nos seus resultados...", "Você é uma pessoa que...", linguagem motivacional genérica.
- USE: "A convergência indica...", "O cruzamento DISC × Johari revela...", "Sua arquitetura psicológica demonstra...", "A intersecção de Âncora × Ikigai aponta..."
- Cada campo deve trazer um insight que o usuário NÃO obteria lendo os relatórios individualmente.
- Escreva em português do Brasil. Frases densas, precisas, sem floreio.
- NUNCA use IDs brutos: 'tecnica'→'Competência Técnica', 'C'→'Cautela/Conformidade', 'D'→'Dominância', 'I'→'Influência', 'S'→'Estabilidade', 'governante'→'Arquétipo do Governante', 'guerreiro'→'Arquétipo do Guerreiro', 'buscador'→'Arquétipo do Buscador', 'mago'→'Arquétipo do Mago', 'prestativo'→'Arquétipo do Prestativo', 'innocente'→'Arquétipo do Inocente', aplique para todos os arquétipos e âncoras.

ÊNFASE POR TIPO (adapte tom e profundidade ao profile_type):
- lider_catalisador: dinâmica de influência vs controle, sombra de microgestão, sustentabilidade de energia, liderança situacional
- especialista_sistemico: risco de invisibilidade estratégica, gap comunicação↔profundidade, monetização da expertise
- empreendedor_autonomo: tensão autonomia↔estrutura, timing de execução vs planejamento, resiliência ao caos
- construtor_relacional: sustentabilidade emocional, fronteira serviço↔autoanulação, monetização do propósito relacional
- guardiao_qualidade: perfeccionismo estrutural vs velocidade, paralisia decisória, posicionamento por especialização
- visionario_estrategico: síntese vs execução, risco de dispersão estratégica, alavanca de impacto sistêmico

RESPOSTA OBRIGATÓRIA — JSON puro, sem markdown, sem backticks:
{
  "profile_type": "um dos 6 tipos exatos acima",
  "profile_label": "Nome legível em português (ex: Líder Catalisador)",
  "profile_tagline": "Frase de 8-10 palavras que define a essência única deste perfil específico — não genérica",

  "pilar_poder_titulo": "3-5 palavras: competência nuclear validada por ≥3 matrizes cruzadas",
  "pilar_poder_texto": "2-3 frases revelando a força que emerge da intersecção — não de um único teste",
  "zona_risco_titulo": "3-5 palavras: padrão autossabotador específico identificado no cruzamento",
  "zona_risco_texto": "2-3 frases sobre onde este perfil se autossabota — preciso, baseado em Johari.cego + DISC sob pressão + sombra arquetípica",
  "florescimento_titulo": "3-5 palavras: ecossistema ideal concreto",
  "florescimento_texto": "2-3 frases com tipo de organização, cultura, papel e dinâmica específicos — não abstratos",

  "helice1": "HTML inline (use <strong> e <em>). Arquitetura comportamental instintiva: DISC × BigFive × TCI. Como este perfil processa informação e age naturalmente. Inclua base neuroquímica se TCI disponível. Mín 3 frases densas.",
  "helice2": "HTML inline. Motor motivacional: Âncoras × Ikigai × grupo Pearson. O que impulsiona profundamente e o que não abre mão — valide âncora com palavras do Ikigai. Mín 3 frases.",
  "helice3": "HTML inline. Projeção de Performance: SOAR × Johari.cego × sombra arquetípica. Gap crítico e vantagem competitiva real. NÃO suavize o ponto cego — seja preciso. Mín 3 frases.",
  "helice4": "HTML inline. Código de Convergência: síntese de 4-5 linhas que só este perfil receberia. Use uma metáfora ou imagem mental memorável. A linha de ouro que conecta DISC + Âncora + Arquétipo + SOAR.",

  "papeis_ideais": ["Papel profissional concreto 1", "Papel 2", "Papel 3"],
  "cultura_fit": "Tipo de organização, cultura e dinâmica que potencializa este perfil — seja específico e acionável",
  "cultura_anti": "O que drena, paralisa ou corrói este perfil — seja direto, sem eufemismos",
  "gap_critico_pro": "O gap de carreira mais urgente deste perfil com instrução específica de como endereçar nos próximos 90 dias",
  "alavanca_carreira": "A alavanca que este perfil subestima ou ainda não ativou — o que desbloquearia o próximo nível profissional",

  "padrao_relacional": "Como este perfil se relaciona, que dinâmica cria e o que isso gera de positivo e de atrito — baseado em DISC + BigFive.Agradabilidade + Johari",
  "necessidade_emocional": "O que este perfil precisa emocionalmente mas raramente verbaliza, pede ou sequer reconhece como necessidade",
  "ciclo_sabotagem": "O loop específico: descreva a situação gatilho → reação automática → consequência → como o padrão se reforça",
  "caminho_integracao": "O que este perfil precisa integrar para operar com mais inteireza — o que não pode mais ignorar em si mesmo",

  "tensao_titulo": "4-5 palavras: nome da tensão central que define este perfil",
  "tensao_desc": "2-3 frases descrevendo a tensão entre dois impulsos opostos que coexistem neste perfil — cite as matrizes que revelam cada polo",
  "tensao_resolucao": "1-2 frases sobre como usar esta tensão como motor de alta performance em vez de obstáculo",

  "plano_90dias": [
    {"titulo": "Dias 1-30: [nome da fase]", "acao": "Ação concreta e específica para este profile_type — não genérica. O que exatamente fazer, com que frequência e por quê este específico."},
    {"titulo": "Dias 31-60: [nome da fase]", "acao": "Ação da fase 2 que constrói sobre a fase 1."},
    {"titulo": "Dias 61-90: [nome da fase]", "acao": "Ação da fase 3 que consolida o novo padrão."}
  ],

  "gatilhos": ["Situação concreta 1 que retira do estado de convergência — baseada em DISC pressão + Johari.cego", "Situação 2", "Situação 3"],
  "protocolo_steps": ["Passo prático 1 específico para este perfil, máx 2 min", "Passo 2", "Passo 3"],
  "acao_ouro": "Micro-hábito atômico (máx 5 min) com maior impacto sistêmico para este profile_type. Descreva: O QUÊ exatamente, QUANDO no dia, POR QUÊ este específico gera impacto sistêmico para este perfil.",
  "assinatura": "1-2 linhas que definem a essência comportamental deste perfil específico. Começa com 🧬 ou ⬡.",
  "keywords": ["palavra1","palavra2","palavra3","palavra4","palavra5"]
}

TCI (quando disponível): BN alto + DISC.D → iniciativa vs impulsividade. ED alto + BigFive.N alto → risco de paralisia por antecipação. DR alto → valida Âncoras de Serviço/Gestão. PE alto + DISC.C → perfeccionismo estrutural. Inclua a base neuroquímica na Hélice 1 e Zona de Risco.

CRUZAMENTOS OBRIGATÓRIOS:
- PILAR DE PODER: validado por ≥3 fontes cruzadas (DISC + Âncora + Pearson + BigFive)
- ZONA DE RISCO: BigFive.Neuroticismo + DISC sob pressão + Johari.cego + sombra arquetípica
- CICLO DE SABOTAGEM: situação específica → reação automática documentada nas matrizes → consequência → reforço
- TENSÃO ESTRUTURAL: cite os dois polos com as matrizes de origem de cada um
- PLANO 90 DIAS: cada fase deve ser diferente para cada profile_type — não use ações genéricas`;
}

function buildUserPrompt(payload) {
  return `Gere o Dossiê de Autogestão Comportamental (DNA Estratégico v2.0) para:

${JSON.stringify(payload, null, 2)}

INSTRUÇÕES:
1. Analise a INTERSEÇÃO entre os testes — não explique cada um individualmente
2. Cruzamento de Sombra: BigFive + DISC dominante + Johari.cego → Zona de Risco
3. Cruzamento de Êxito: Ikigai + Âncoras → Ação de Ouro (propósito + sustentabilidade)
4. Ambiente: Pearson-Marr + SOAR → Florescimento
5. O resultado deve parecer que você conhece esta pessoa há anos`;
}

// ── LOADING ───────────────────────────────────────────────────────────────────
let _logInterval = null, _pctInterval = null;

function startLoadingAnimation() {
  const logsEl = document.getElementById('loading-logs');
  const pctEl  = document.getElementById('loading-pct');
  logsEl.innerHTML = LOG_MESSAGES.map((msg, i) =>
    `<div class="log-line" id="log-${i}"><div class="log-dot"></div><span>${msg}</span></div>`
  ).join('');
  let currentLog = 0, pct = 0;
  _pctInterval = setInterval(() => {
    if (pct < 92) { pct += Math.random() * 2; pctEl.textContent = Math.min(92, Math.round(pct)) + '%'; }
  }, 250);
  _logInterval = setInterval(() => {
    if (currentLog > 0) {
      document.getElementById(`log-${currentLog-1}`)?.classList.remove('active');
      document.getElementById(`log-${currentLog-1}`)?.classList.add('done');
    }
    if (currentLog < LOG_MESSAGES.length) {
      document.getElementById(`log-${currentLog}`)?.classList.add('active');
      currentLog++;
    } else { clearInterval(_logInterval); }
  }, 1000);
}

function stopLoadingAnimation() {
  clearInterval(_logInterval);
  clearInterval(_pctInterval);
  document.getElementById('loading-pct').textContent = '100%';
}

// ── RENDER DNA v2.0 ───────────────────────────────────────────────────────────
function renderDNA(rawText, payload, palette, isRestore) {
  let parsed;
  if (typeof rawText === 'object') {
    parsed = rawText;
  } else {
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch(e) {
      showError('Falha ao interpretar resposta da IA. Tente novamente.');
      document.getElementById('btn-gen').disabled = false;
      document.getElementById('req-gate').classList.add('visible');
      return;
    }
  }

  const u = getUser();
  const name = u.apelido || u.nome || 'Usuário';

  // Header
  setText('doc-name', name);
  setText('doc-meta', `Gerado em ${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})} · ${payload._completedCount} matrizes integradas`);
  setText('doc-badge', `⬡ ${payload._completedCount}/7 MATRIZES · DOSSIÊ DE AUTOGESTÃO v2.0`);

  // A. Painel Autogestão
  if (parsed.pilar_poder_titulo) {
    setText('ag-poder-title', parsed.pilar_poder_titulo);
    setText('ag-poder-text',  parsed.pilar_poder_texto);
    setText('ag-risco-title', parsed.zona_risco_titulo);
    setText('ag-risco-text',  parsed.zona_risco_texto);
    setText('ag-flor-title',  parsed.florescimento_titulo);
    setText('ag-flor-text',   parsed.florescimento_texto);
    document.getElementById('autogestao-panel').style.display = 'block';
  }

  // Hélices
  setHTML('hc-1-content', parsed.helice1);
  setHTML('hc-2-content', parsed.helice2);
  setHTML('hc-3-content', parsed.helice3);
  setHTML('hc-4-content', parsed.helice4);
  if (parsed.keywords?.length) {
    const kw = parsed.keywords.map(k => `<span class="helix-keyword">${k}</span>`).join(' ');
    const el4 = document.getElementById('hc-4-content');
    if (el4) el4.innerHTML = (window.DOMPurify ? DOMPurify.sanitize(el4.innerHTML + '<br><br>' + kw) : el4.innerHTML + '<br><br>' + kw);
  }

  // B. Inteligência Emocional
  if (parsed.gatilhos?.length || parsed.protocolo_steps?.length) {
    if (parsed.gatilhos?.length) {
      const raw1 = parsed.gatilhos.map(g => `<span class="em-trigger-tag">${g}</span>`).join(' ');
      document.getElementById('em-gatilhos-content').innerHTML = window.DOMPurify ? DOMPurify.sanitize(raw1) : raw1;
    }
    if (parsed.protocolo_steps?.length) {
      const raw2 = parsed.protocolo_steps.map((s,i) =>
        `<div class="em-step"><div class="em-step-num">${i+1}</div><div class="em-step-text">${s}</div></div>`
      ).join('');
      document.getElementById('em-protocolo-content').innerHTML = window.DOMPurify ? DOMPurify.sanitize(raw2) : raw2;
    }
    document.getElementById('emocional-block').style.display = 'grid';
  }

  // C. Ação de Ouro
  if (parsed.acao_ouro) {
    setHTML('ao-content', parsed.acao_ouro);
    document.getElementById('acao-ouro').style.display = 'block';
  }

  // D. Direcionamento Profissional
  if (parsed.papeis_ideais || parsed.cultura_fit) {
    if (parsed.papeis_ideais?.length) {
      const raw3 = parsed.papeis_ideais.map(p => `<span class="db-papel-tag">${p}</span>`).join('');
      document.getElementById('db-papeis').innerHTML = window.DOMPurify ? DOMPurify.sanitize(raw3) : raw3;
    }
    setText('db-cultura-fit', parsed.cultura_fit);
    setText('db-gap', parsed.gap_critico_pro);
    setText('db-alavanca', parsed.alavanca_carreira);
    document.getElementById('direcao-pro-block').style.display = 'block';
  }

  // E. Direcionamento Pessoal
  if (parsed.padrao_relacional) {
    setText('db-padrao', parsed.padrao_relacional);
    setText('db-necessidade', parsed.necessidade_emocional);
    setText('db-sabotagem', parsed.ciclo_sabotagem);
    setText('db-integracao', parsed.caminho_integracao);
    document.getElementById('direcao-pes-block').style.display = 'block';
  }

  // F. Tensão Estrutural
  if (parsed.tensao_titulo) {
    setText('tensao-titulo', parsed.tensao_titulo);
    setText('tensao-desc', parsed.tensao_desc);
    setText('tensao-resolucao', parsed.tensao_resolucao);
    document.getElementById('tensao-block').style.display = 'block';
  }

  // G. Plano 90 Dias
  if (parsed.plano_90dias?.length) {
    const raw4 = parsed.plano_90dias.map((f,i) => `
      <div class="plano-fase">
        <div class="plano-fase-titulo">${f.titulo}</div>
        <div class="plano-fase-acao">${f.acao}</div>
      </div>`).join('');
    document.getElementById('plano-fases').innerHTML = window.DOMPurify ? DOMPurify.sanitize(raw4) : raw4;
    document.getElementById('plano-block').style.display = 'block';
  }

  // Assinatura
  if (parsed.assinatura) {
    setHTML('conv-content', parsed.assinatura);
    document.getElementById('convergence-block').style.display = 'block';
  }

  // Show document
  const doc = document.getElementById('dna-document');
  doc.classList.add('visible', 'streaming');
  setTimeout(() => doc.classList.remove('streaming'), 1200);
  document.getElementById('req-gate').classList.remove('visible');
  document.getElementById('btn-gen').disabled = false;

  // Save
  if (!isRestore) {
    try {
      const raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user') || '{}';
      const userData = JSON.parse(raw);
      userData.dna = { generated: parsed, palette: palette.type, generatedAt: new Date().toISOString() };
      capsulaDB.lsSetUser(userData);
      if (window.capsulaDB && userData.email) capsulaDB.syncMatrizes(userData).catch(() => {});
    } catch(_) {}
  }
}

function setText(id, val) { const el = document.getElementById(id); if (el && val != null) el.textContent = val; }
function setHTML(id, html) { const el = document.getElementById(id); if (el && html) el.innerHTML = (window.DOMPurify ? DOMPurify.sanitize(html) : html); }

// ── ERROR ─────────────────────────────────────────────────────────────────────
function showError(msg) {
  const t = document.getElementById('error-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 5000);
}

// ── PRINT PDF PREMIUM v4.0 ────────────────────────────────────────────────────
function printDNA() {
  if (window._payments) {
    _payments.serverDebitCredit('dna').then(function(ok) {
      if (!ok) { _payments.showPaywall('dna'); return; }
      _printDNACore();
    });
    return;
  }
  _printDNACore();
}
function _printDNACore() {
  const GOLD   = '#B8922A';
  const GOLD2  = '#C9A84C';
  const PURPLE = '#5B00D4';
  const TEAL   = '#1FA888';
  const ORANGE = '#E8603A';
  const BLUE   = '#5048C8';
  const nome = document.getElementById('doc-name')?.textContent || 'Usuário';
  const meta  = document.getElementById('doc-meta')?.textContent || '';
  const badge = document.getElementById('doc-badge')?.textContent || '';
  const data  = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});

  // SVG icons — replacing emojis
  const icoLightning = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" stroke="${GOLD}" stroke-width="1.8" stroke-linejoin="round" fill="${GOLD}22"/></svg>`;
  const icoWarning   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="${ORANGE}" stroke-width="1.8" stroke-linejoin="round" fill="${ORANGE}15"/><line x1="12" y1="9" x2="12" y2="13" stroke="${ORANGE}" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="${ORANGE}"/></svg>`;
  const icoSprout    = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 20s4-6 8-8" stroke="${TEAL}" stroke-width="1.8" stroke-linecap="round"/><path d="M12 12C12 12 12 6 18 4c0 0 2 8-6 8z" stroke="${TEAL}" stroke-width="1.8" stroke-linejoin="round" fill="${TEAL}15"/><path d="M12 12C12 12 10 7 4 6c0 0 0 7 8 6z" stroke="${TEAL}" stroke-width="1.8" stroke-linejoin="round" fill="${TEAL}15"/></svg>`;
  const icoTrend     = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="23 6 13 16 8 11 1 18" stroke="${TEAL}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 6 23 6 23 12" stroke="${TEAL}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const icoStar      = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="${GOLD2}" stroke-width="1.8" stroke-linejoin="round" fill="${GOLD2}20"/></svg>`;
  const icoBolt      = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" stroke="${ORANGE}" stroke-width="2" stroke-linejoin="round" fill="${ORANGE}20"/></svg>`;

  // Profile type config
  const convEl = document.getElementById('conv-content');
  const rawProfileType = convEl ? (convEl.getAttribute('data-profile-type') || '') : '';
  const u = (function(){ try { return JSON.parse(localStorage.getItem('capsula_user')||'{}'); } catch(_){ return {}; } })();
  const savedProfileType = u.dna?.generated?.profile_type || '';
  const profileType = savedProfileType;
  const pCfg = PROFILE_CONFIGS[profileType] || { label: 'DNA Estratégico', color: GOLD };
  const PCOLOR = pCfg.color;
  const profileLabel = document.getElementById('doc-badge')?.textContent?.split('·')[0]?.replace('⬡','').trim() || pCfg.label;
  const profileTagline = u.dna?.generated?.profile_tagline || '';

  // Matrix sources badges
  const matrixSources = [
    {key:'disc',    label:'DISC',         color:ORANGE},
    {key:'bigfive', label:'Big Five',     color:BLUE},
    {key:'ancoras', label:'Âncoras',      color:TEAL},
    {key:'johari',  label:'Johari',       color:'#1BA8D4'},
    {key:'ikigai',  label:'Ikigai',       color:ORANGE},
    {key:'soar',    label:'SOAR',         color:BLUE},
    {key:'pearson', label:'Pearson-Marr', color:GOLD},
    {key:'tci',     label:'TCI',          color:PURPLE},
  ].filter(m => u[m.key]?.completedAt);
  const sourcesHTML = matrixSources.map(m =>
    `<span style="font-family:'Space Mono',monospace;font-size:6px;padding:2px 6px;border:1px solid ${m.color}40;background:${m.color}12;color:${m.color};border-radius:2px;text-transform:uppercase;letter-spacing:0.06em;">${m.label}</span>`
  ).join('');

  // Painel Autogestão
  const agVisible = document.getElementById('autogestao-panel')?.style.display !== 'none';
  const agHTML = agVisible ? `
    <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:10px;padding:16px 18px;margin-bottom:12px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${PURPLE},${GOLD},transparent);"></div>
      <div style="font-family:'Space Mono',monospace;font-size:7px;letter-spacing:0.14em;text-transform:uppercase;color:${PURPLE};margin-bottom:11px;">◆ PAINEL DE AUTOGESTÃO PSICOLÓGICA</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
        <div style="background:#fff;border:1px solid ${GOLD}30;border-radius:7px;padding:11px 12px;">
          <div style="margin-bottom:6px;">${icoLightning}</div>
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;letter-spacing:0.1em;color:${GOLD};margin-bottom:4px;text-transform:uppercase;">Pilar de Poder</div>
          <div style="font-size:9.5px;font-weight:700;color:#111;margin-bottom:5px;line-height:1.3;">${document.getElementById('ag-poder-title')?.textContent||''}</div>
          <div style="font-size:8px;color:#555;line-height:1.65;">${document.getElementById('ag-poder-text')?.textContent||''}</div>
        </div>
        <div style="background:#fff;border:1px solid ${ORANGE}30;border-radius:7px;padding:11px 12px;">
          <div style="margin-bottom:6px;">${icoWarning}</div>
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;letter-spacing:0.1em;color:${ORANGE};margin-bottom:4px;text-transform:uppercase;">Zona de Risco</div>
          <div style="font-size:9.5px;font-weight:700;color:#111;margin-bottom:5px;line-height:1.3;">${document.getElementById('ag-risco-title')?.textContent||''}</div>
          <div style="font-size:8px;color:#555;line-height:1.65;">${document.getElementById('ag-risco-text')?.textContent||''}</div>
        </div>
        <div style="background:#fff;border:1px solid ${TEAL}30;border-radius:7px;padding:11px 12px;">
          <div style="margin-bottom:6px;">${icoSprout}</div>
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;letter-spacing:0.1em;color:${TEAL};margin-bottom:4px;text-transform:uppercase;">Florescimento</div>
          <div style="font-size:9.5px;font-weight:700;color:#111;margin-bottom:5px;line-height:1.3;">${document.getElementById('ag-flor-title')?.textContent||''}</div>
          <div style="font-size:8px;color:#555;line-height:1.65;">${document.getElementById('ag-flor-text')?.textContent||''}</div>
        </div>
      </div>
    </div>` : '';

  // Hélices — renderização modular
  const heliceDefs = [
    { num:'01', title:'Arquitetura do Ser · Instinto',          id:'hc-1-content', color:BLUE,   featured:false },
    { num:'02', title:'Reator de Impulso · Motivação',          id:'hc-2-content', color:TEAL,   featured:false },
    { num:'03', title:'Projeção de Performance · Mercado',      id:'hc-3-content', color:ORANGE, featured:false },
    { num:'04', title:'Código de Convergência · Linha de Ouro', id:'hc-4-content', color:GOLD,   featured:true  },
  ];
  const renderHelix = (h) => {
    const content = document.getElementById(h.id)?.innerHTML || '—';
    const bg     = h.featured ? `#fffdf5` : `#fafafa`;
    const border = h.featured ? `1px solid ${GOLD}40` : `1px solid #e4e4e7`;
    const featuredMark = h.featured
      ? `<span style="font-family:'Space Mono',monospace;font-size:6px;padding:1px 5px;border:1px solid ${GOLD}55;color:${GOLD};border-radius:2px;text-transform:uppercase;letter-spacing:0.08em;">linha de ouro</span>`
      : '';
    return `
      <div style="background:${bg};border:${border};border-radius:10px;padding:14px 17px;margin-bottom:9px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${h.color},${h.color}00);"></div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:7px;border-bottom:1px solid #f1f5f9;">
          <div style="width:21px;height:21px;border-radius:4px;background:${h.color}15;border:1px solid ${h.color}40;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:7.5px;font-weight:700;color:${h.color};">${h.num}</div>
          <div style="font-size:9.5px;font-weight:700;color:${h.color};flex:1;">${h.title}</div>
          ${featuredMark}
        </div>
        <div style="font-size:9px;color:#333;line-height:1.85;">${content}</div>
      </div>`;
  };

  const helicesP1 = heliceDefs.slice(0,2).map(renderHelix).join('');
  const helicesP2 = heliceDefs.slice(2).map(renderHelix).join('');

  // Inteligência Emocional
  const emVisible = document.getElementById('emocional-block')?.style.display !== 'none';
  const emHTML = emVisible ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:11px;">
      <div style="background:#fff8f6;border:1px solid ${ORANGE}30;border-radius:9px;padding:13px 15px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${ORANGE},transparent);"></div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:9px;">${icoBolt}<span style="font-size:9px;font-weight:700;color:${ORANGE};">Gatilhos de Estresse</span></div>
        <div style="font-size:8px;color:#444;line-height:1.75;">${document.getElementById('em-gatilhos-content')?.innerHTML||''}</div>
      </div>
      <div style="background:#f6fffc;border:1px solid ${TEAL}30;border-radius:9px;padding:13px 15px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${TEAL},transparent);"></div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:9px;">${icoTrend}<span style="font-size:9px;font-weight:700;color:${TEAL};">Protocolo de Autorregulação</span></div>
        <div style="font-size:8px;color:#444;line-height:1.75;">${document.getElementById('em-protocolo-content')?.innerHTML||''}</div>
      </div>
    </div>` : '';

  // Direcionamento Profissional
  const dirProVisible = document.getElementById('direcao-pro-block')?.style.display !== 'none';
  const papeis = dirProVisible ? [...document.querySelectorAll('#db-papeis .db-papel-tag')].map(el=>el.textContent).filter(Boolean) : [];
  const dirProHTML = dirProVisible ? `
    <div style="background:#fafafa;border:1px solid ${PCOLOR}25;border-radius:9px;padding:13px 16px;margin-bottom:11px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${PCOLOR},transparent);"></div>
      <div style="font-family:'Space Mono',monospace;font-size:7px;letter-spacing:0.12em;text-transform:uppercase;color:${PCOLOR};margin-bottom:10px;">◆ Direcionamento Profissional</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">
        <div style="background:#fff;border:1px solid #e4e4e7;border-radius:7px;padding:10px 12px;">
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Papéis Ideais</div>
          <div>${papeis.map(p=>`<span style="display:inline-block;font-family:'Space Mono',monospace;font-size:6.5px;padding:2px 6px;border:1px solid ${PCOLOR}40;background:${PCOLOR}10;color:${PCOLOR};border-radius:2px;margin:1px 2px 2px 0;">${p}</span>`).join('')}</div>
        </div>
        <div style="background:#fff;border:1px solid #e4e4e7;border-radius:7px;padding:10px 12px;">
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Cultura de Fit</div>
          <div style="font-size:8px;color:#333;line-height:1.7;">${document.getElementById('db-cultura-fit')?.textContent||''}</div>
        </div>
        <div style="background:#fff;border:1px solid #e4e4e7;border-radius:7px;padding:10px 12px;">
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Gap Crítico</div>
          <div style="font-size:8px;color:#333;line-height:1.7;">${document.getElementById('db-gap')?.textContent||''}</div>
        </div>
        <div style="background:#fff;border:1px solid #e4e4e7;border-radius:7px;padding:10px 12px;">
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Alavanca Subestimada</div>
          <div style="font-size:8px;color:#333;line-height:1.7;">${document.getElementById('db-alavanca')?.textContent||''}</div>
        </div>
      </div>
    </div>` : '';

  // Direcionamento Pessoal
  const dirPesVisible = document.getElementById('direcao-pes-block')?.style.display !== 'none';
  const dirPesHTML = dirPesVisible ? `
    <div style="background:#fafafa;border:1px solid ${TEAL}25;border-radius:9px;padding:13px 16px;margin-bottom:11px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${TEAL},transparent);"></div>
      <div style="font-family:'Space Mono',monospace;font-size:7px;letter-spacing:0.12em;text-transform:uppercase;color:${TEAL};margin-bottom:10px;">◆ Direcionamento Pessoal</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">
        <div style="background:#fff;border:1px solid #e4e4e7;border-radius:7px;padding:10px 12px;">
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Padrão Relacional</div>
          <div style="font-size:8px;color:#333;line-height:1.7;">${document.getElementById('db-padrao')?.textContent||''}</div>
        </div>
        <div style="background:#fff;border:1px solid #e4e4e7;border-radius:7px;padding:10px 12px;">
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Necessidade Emocional</div>
          <div style="font-size:8px;color:#333;line-height:1.7;">${document.getElementById('db-necessidade')?.textContent||''}</div>
        </div>
        <div style="background:#fff;border:1px solid #e4e4e7;border-radius:7px;padding:10px 12px;">
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Ciclo de Autossabotagem</div>
          <div style="font-size:8px;color:#333;line-height:1.7;">${document.getElementById('db-sabotagem')?.textContent||''}</div>
        </div>
        <div style="background:#fff;border:1px solid #e4e4e7;border-radius:7px;padding:10px 12px;">
          <div style="font-family:'Space Mono',monospace;font-size:6.5px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Caminho de Integração</div>
          <div style="font-size:8px;color:#333;line-height:1.7;">${document.getElementById('db-integracao')?.textContent||''}</div>
        </div>
      </div>
    </div>` : '';

  // Tensão Estrutural
  const tensaoVisible = document.getElementById('tensao-block')?.style.display !== 'none';
  const tensaoHTML = tensaoVisible ? `
    <div style="background:linear-gradient(135deg,${ORANGE}08,${GOLD}05);border:1px solid ${ORANGE}25;border-radius:9px;padding:13px 16px;margin-bottom:11px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${ORANGE},${GOLD},transparent);"></div>
      <div style="font-family:'Space Mono',monospace;font-size:7px;letter-spacing:0.12em;text-transform:uppercase;color:${ORANGE};margin-bottom:7px;">◆ Tensão Estrutural</div>
      <div style="font-size:10px;font-weight:700;color:#111;margin-bottom:6px;">${document.getElementById('tensao-titulo')?.textContent||''}</div>
      <div style="font-size:8.5px;color:#333;line-height:1.8;margin-bottom:7px;">${document.getElementById('tensao-desc')?.textContent||''}</div>
      <div style="font-size:8px;color:${TEAL};line-height:1.7;border-left:2px solid ${TEAL};padding-left:8px;">${document.getElementById('tensao-resolucao')?.textContent||''}</div>
    </div>` : '';

  // Plano 90 Dias
  const planoVisible = document.getElementById('plano-block')?.style.display !== 'none';
  const planoFases = planoVisible ? [...document.querySelectorAll('#plano-fases .plano-fase')] : [];
  const planoHTML = planoVisible && planoFases.length ? `
    <div style="background:#fafafa;border:1px solid ${GOLD}30;border-radius:9px;padding:13px 16px;margin-bottom:11px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${GOLD2},${GOLD},transparent);"></div>
      <div style="font-family:'Space Mono',monospace;font-size:7px;letter-spacing:0.12em;text-transform:uppercase;color:${GOLD};margin-bottom:10px;">◆ Plano de Ação · 90 Dias</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
        ${planoFases.map(f=>{
          const titulo = f.querySelector('.plano-fase-titulo')?.textContent||'';
          const acao = f.querySelector('.plano-fase-acao')?.textContent||'';
          return `<div style="background:#fff;border:1px solid ${GOLD}30;border-radius:6px;padding:10px 11px;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${GOLD},transparent);"></div>
            <div style="font-family:'Space Mono',monospace;font-size:6.5px;color:${GOLD};margin-bottom:5px;padding-top:2px;">${titulo}</div>
            <div style="font-size:7.5px;color:#333;line-height:1.7;">${acao}</div>
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  // Ação de Ouro
  const aoVisible = document.getElementById('acao-ouro')?.style.display !== 'none';
  const aoHTML = aoVisible ? `
    <div style="background:#fffdf0;border:1px solid ${GOLD}40;border-radius:9px;padding:13px 16px;margin-bottom:11px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${GOLD2},${GOLD},transparent);"></div>
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;">
        ${icoStar}
        <span style="font-family:'Space Mono',monospace;font-size:7px;letter-spacing:0.12em;text-transform:uppercase;color:${GOLD};">Ação de Ouro · Micro-Hábito</span>
        <span style="font-family:'Space Mono',monospace;font-size:6.5px;color:${TEAL};">// máx 5 min · impacto sistêmico</span>
      </div>
      <div style="font-size:9px;color:#333;line-height:1.85;">${document.getElementById('ao-content')?.innerHTML||''}</div>
    </div>` : '';

  // Assinatura + Keywords
  const convVisible = document.getElementById('convergence-block')?.style.display !== 'none';
  const keywords = u.dna?.generated?.keywords || [];
  const convHTML = convVisible ? `
    <div style="background:#fafafa;border:1px solid ${PCOLOR}30;border-radius:9px;padding:14px 17px;margin-bottom:12px;position:relative;overflow:hidden;">
      <div style="position:absolute;left:0;top:10%;bottom:10%;width:2px;background:linear-gradient(to bottom,transparent,${PCOLOR},transparent);border-radius:100px;"></div>
      <div style="font-family:'Space Mono',monospace;font-size:7px;letter-spacing:0.14em;text-transform:uppercase;color:${PCOLOR};margin-bottom:8px;padding-left:4px;">◆ Assinatura Comportamental</div>
      <div style="font-size:11px;color:#222;line-height:1.9;font-weight:500;padding-left:4px;margin-bottom:${keywords.length?'10px':'0'};">${document.getElementById('conv-content')?.innerHTML||''}</div>
      ${keywords.length ? `<div style="padding-left:4px;border-top:1px solid #e4e4e7;padding-top:8px;margin-top:2px;">${keywords.map(k=>`<span style="display:inline-block;font-family:'Space Mono',monospace;font-size:6.5px;padding:2px 7px;border:1px solid ${PCOLOR}35;background:${PCOLOR}08;color:${PCOLOR};border-radius:2px;margin:1px 3px 2px 0;">${k}</span>`).join('')}</div>` : ''}
    </div>` : '';

  const footerHTML = `
    <div style="padding-top:11px;border-top:2px solid #000;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-family:'Space Mono',monospace;font-size:6px;color:#71717a;letter-spacing:0.05em;text-transform:uppercase;">Cápsula de Desenvolvimento · Dossiê de Autogestão Comportamental · Confidencial</span>
      <span style="font-family:'Space Mono',monospace;font-size:7px;font-weight:700;color:#000;">www.sistema-gnosis.com.br</span>
    </div>`;

  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html lang="pt-BR" style="color-scheme:light;"><head><meta charset="UTF-8"><meta name="color-scheme" content="light">
<title>DNA Estratégico v4.0 — ${nome} · Sistema Gnosis</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:#f8fafc;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .pg{width:794px;min-height:1123px;margin:0 auto;padding:28px 36px;background:#f8fafc;position:relative;}
  .pg2{page-break-before:always;padding-top:24px;}
  strong{color:#000;font-weight:700;} em{font-style:normal;color:${PCOLOR};}
  .em-trigger-tag{display:inline-block;background:${ORANGE}10;border:0.5px solid ${ORANGE}40;padding:2px 7px;border-radius:3px;font-size:7px;color:${ORANGE};margin:2px 2px 3px;font-family:'Space Mono',monospace;}
  .em-step{display:flex;gap:8px;margin-bottom:7px;align-items:flex-start;}
  .em-step-num{width:16px;height:16px;border-radius:50%;background:${TEAL}15;border:0.5px solid ${TEAL}40;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:7px;color:${TEAL};flex-shrink:0;margin-top:1px;}
  .em-step-text{font-size:8px;line-height:1.65;color:#333;}
  .helix-keyword{display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;padding:1px 6px;border-radius:2px;font-family:'Space Mono',monospace;font-size:6.5px;color:#64748b;margin:1px;}
  @media print{@page{margin:0;size:A4;}body{background:#f8fafc!important;}.pg{width:100%;padding:20px 26px;min-height:unset;}.pg2{padding-top:20px;}}
</style>
</head><body style="background:#f8fafc!important;">

<!-- ═══ PAGE 1 ═══ -->
<div class="pg">
  <div style="height:3px;background:linear-gradient(90deg,${PCOLOR},${GOLD},transparent);border-radius:2px;margin-bottom:18px;"></div>

  <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:2px solid #000;margin-bottom:14px;">
    <div style="display:flex;align-items:center;gap:9px;">
      <svg viewBox="0 0 100 100" fill="none" width="24" height="24"><path d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C59.66 15 68.38 18.91 74.72 25.22" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/><path d="M85 50H55" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/><circle cx="85" cy="50" r="4" fill="${GOLD}"/></svg>
      <span style="font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;">SISTEMA <span style="color:${GOLD};font-style:italic;font-weight:300;">Gnosis</span></span>
    </div>
    <div style="font-family:'Space Mono',monospace;font-size:6.5px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;text-align:right;line-height:1.85;">
      DNA Estratégico · Dossiê Comportamental v4.0<br>${data.toUpperCase()}<br>${nome.toUpperCase()}
    </div>
  </div>

  <div style="background:#fafafa;border:1px solid #000;border-left:3px solid ${PCOLOR};padding:14px 18px;margin-bottom:12px;position:relative;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px;">
      <div>
        <div style="font-family:'Space Mono',monospace;font-size:6px;letter-spacing:0.14em;text-transform:uppercase;color:#71717a;margin-bottom:4px;">// análise comportamental · ${nome.toUpperCase()}</div>
        <div style="font-size:24px;font-weight:900;letter-spacing:-0.04em;line-height:1;color:${PCOLOR};margin-bottom:4px;">DNA Estratégico</div>
        <div style="font-size:8px;color:#555;line-height:1.5;">${profileTagline}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-family:'Space Mono',monospace;font-size:7.5px;font-weight:700;padding:4px 10px;border:1.5px solid ${PCOLOR};color:${PCOLOR};border-radius:3px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px;">${pCfg.label}</div>
        <div style="font-size:7px;color:#71717a;">${meta}</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding-top:8px;border-top:1px solid #e4e4e7;">
      <span style="font-family:'Space Mono',monospace;font-size:6px;letter-spacing:0.08em;text-transform:uppercase;padding:2px 6px;border:1px solid ${GOLD}45;color:${GOLD};border-radius:2px;">${badge}</span>
      ${sourcesHTML}
    </div>
  </div>

  ${agHTML}
  ${helicesP1}
  ${dirProHTML}

  <div style="margin-top:12px;padding-top:9px;border-top:2px solid #000;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-family:'Space Mono',monospace;font-size:6px;color:#71717a;letter-spacing:0.05em;text-transform:uppercase;">Sistema Gnosis // DNA Estratégico // Dossiê Comportamental // Confidencial</span>
    <span style="font-family:'Space Mono',monospace;font-size:6px;color:#71717a;">pág. 01/02</span>
  </div>
</div>

<!-- ═══ PAGE 2 ═══ -->
<div class="pg pg2">
  <div style="height:2px;background:linear-gradient(90deg,${PCOLOR},${GOLD},transparent);margin-bottom:14px;"></div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span style="font-family:'Space Mono',monospace;font-size:6.5px;letter-spacing:0.1em;text-transform:uppercase;color:#a1a1aa;">// DNA Estratégico v4.0 · ${nome.toUpperCase()} · ${pCfg.label.toUpperCase()}</span>
    <span style="font-family:'Space Mono',monospace;font-size:6.5px;color:#a1a1aa;">${data.toUpperCase()}</span>
  </div>

  ${helicesP2}
  ${dirPesHTML}
  ${tensaoHTML}
  ${planoHTML}
  ${emHTML}
  ${aoHTML}
  ${convHTML}
  ${footerHTML}
</div>

<script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>
</body></html>`);
  w.document.close();
}

function logout() {
  localStorage.removeItem('capsula_user');
  sessionStorage.removeItem('capsula_user');
  window.location.href = 'index.html';
}

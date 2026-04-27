// ══════════════════════════════════════
// DEFINIÇÃO DOS QUADRANTES SOAR
// ══════════════════════════════════════
const QUADRANTS = [
  {
    key: 'S',
    label: 'Strengths',
    name: 'Forças',
    subtitle: 'O que você faz excepcionalmente bem',
    color: '#6C5FE6',
    colorVar: 'var(--soar-S)',
    icon: 'S',
    questions: [
      { id: 'S1', prompt: 'Quais habilidades ou talentos as pessoas ao seu redor mais reconhecem em você?', placeholder: 'Ex: comunicação clara, capacidade analítica, liderança em momentos de crise...' },
      { id: 'S2', prompt: 'Em que tipo de tarefa ou projeto você se sente naturalmente mais competente e confiante?', placeholder: 'Ex: resolução de problemas complexos, criação de conexões entre pessoas...' },
      { id: 'S3', prompt: 'Quais conquistas do seu passado você considera que mostram seu maior potencial?', placeholder: 'Ex: um projeto que liderou com sucesso, uma meta difícil que atingiu...' },
      { id: 'S4', prompt: 'Que recursos únicos (conhecimento, rede, experiências) você possui que poucos têm?', placeholder: 'Ex: experiência em dois mercados diferentes, fluência em idiomas, rede internacional...' },
    ]
  },
  {
    key: 'O',
    label: 'Opportunities',
    name: 'Oportunidades',
    subtitle: 'O que o ambiente oferece para você explorar',
    color: '#2EC4A0',
    colorVar: 'var(--soar-O)',
    icon: 'O',
    questions: [
      { id: 'O1', prompt: 'Quais tendências no seu setor ou mercado você poderia aproveitar nos próximos 2-3 anos?', placeholder: 'Ex: crescimento de IA, demanda por profissionais de produto, expansão de mercados...' },
      { id: 'O2', prompt: 'Existe alguma lacuna ou necessidade não atendida no seu campo que você poderia preencher?', placeholder: 'Ex: falta de profissionais com combinação de habilidades técnicas e comportamentais...' },
      { id: 'O3', prompt: 'Que conexões ou relacionamentos profissionais poderiam abrir novas portas para você?', placeholder: 'Ex: mentores em potencial, comunidades específicas, eventos do setor...' },
      { id: 'O4', prompt: 'Quais recursos ou ferramentas disponíveis você ainda não está aproveitando ao máximo?', placeholder: 'Ex: plataformas de aprendizado, programas de certificação, redes profissionais...' },
    ]
  },
  {
    key: 'A',
    label: 'Aspirations',
    name: 'Aspirações',
    subtitle: 'O que você deseja alcançar e quem quer ser',
    color: '#E8603A',
    colorVar: 'var(--soar-A)',
    icon: 'A',
    questions: [
      { id: 'A1', prompt: 'Qual é a sua visão de vida ideal daqui a 5 anos? Descreva com o máximo de detalhe.', placeholder: 'Ex: liderando minha própria empresa, vivendo em outra cidade, com equilíbrio profissional e pessoal...' },
      { id: 'A2', prompt: 'Qual impacto você quer causar no mundo ou na vida das pessoas ao seu redor?', placeholder: 'Ex: ajudar profissionais a encontrarem seu propósito, construir soluções que facilitem a vida de quem empreende...' },
      { id: 'A3', prompt: 'Que tipo de profissional ou líder você aspira se tornar? Quais valores guiam essa visão?', placeholder: 'Ex: um líder que inspira pelo exemplo, que equilibra performance com cuidado genuíno pelas pessoas...' },
      { id: 'A4', prompt: 'Se o dinheiro e o tempo não fossem obstáculos, em que você passaria seus dias?', placeholder: 'Ex: criando, ensinando, construindo projetos com impacto social, explorando novas culturas...' },
    ]
  },
  {
    key: 'R',
    label: 'Results',
    name: 'Resultados',
    subtitle: 'As metas concretas que você quer alcançar',
    color: '#1BA8D4',
    colorVar: 'var(--soar-R)',
    icon: 'R',
    questions: [
      { id: 'R1', prompt: 'Qual é o resultado mais importante que você quer alcançar nos próximos 12 meses?', placeholder: 'Ex: conseguir uma promoção, lançar um produto, completar uma certificação, mudar de área...' },
      { id: 'R2', prompt: 'Como você vai medir que teve sucesso no que se propôs? Quais são os indicadores concretos?', placeholder: 'Ex: receita mensal acima de X, equipe de Y pessoas, feedback positivo de Z clientes...' },
      { id: 'R3', prompt: 'Que hábito ou comportamento você precisa desenvolver para alcançar seus objetivos?', placeholder: 'Ex: consistência em estudar 1h por dia, fazer networking ativo toda semana...' },
      { id: 'R4', prompt: 'Quais obstáculos você já prevê e como pretende superá-los?', placeholder: 'Ex: falta de tempo → vou delegar X; insegurança → vou buscar mentoria em Y...' },
    ]
  }
];

// ══════════════════════════════════════
// STATE
// ══════════════════════════════════════
let currentQ = 0; // quadrant index 0-3
let answers  = { S: {}, O: {}, A: {}, R: {} };
let _isLoadingExisting = false;


// ══════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function startForm() {
  currentQ = 0;
  answers  = { S: {}, O: {}, A: {}, R: {} };
  showPage('page-form');
  renderQuadrant(0);
}

function goBack() {
  if (currentQ === 0) {
    showPage('page-intro');
  } else {
    saveCurrentAnswers();
    currentQ--;
    renderQuadrant(currentQ);
  }
}

function resetForm() {
  answers = { S: {}, O: {}, A: {}, R: {} };
  startForm();
}

// ══════════════════════════════════════
// RENDER QUADRANT
// ══════════════════════════════════════
function renderQuadrant(idx) {
  const q   = QUADRANTS[idx];
  const pct = Math.round((idx / QUADRANTS.length) * 100);

  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('form-counter').textContent  = `Quadrante ${idx + 1} de ${QUADRANTS.length}`;

  const saved = answers[q.key] || {};

  const questionsHTML = q.questions.map((question, qi) => `
    <div class="question-item">
      <div class="question-prompt" style="--q-color:${q.color}">
        <span class="q-num">${String(qi + 1).padStart(2,'0')}</span>
        ${question.prompt}
      </div>
      <textarea
        class="question-input"
        id="q-${question.id}"
        placeholder="${question.placeholder}"
        maxlength="400"
        aria-label="${question.prompt}"
        oninput="onInputChange()"
        style="--q-color:${q.color}"
      >${saved[question.id] || ''}</textarea>
      <div class="char-count" id="cc-${question.id}">${(saved[question.id] || '').length}/400</div>
    </div>
  `).join('');

  const isLast   = idx === QUADRANTS.length - 1;
  const hasAny   = Object.values(saved).some(v => v && v.trim().length > 0);

  document.getElementById('form-container').innerHTML = `
    <div class="quadrant-header">
      <div class="quadrant-badge" style="background:${q.color}">${q.icon}</div>
      <div class="quadrant-info">
        <span class="quadrant-label">${q.label}</span>
        <div class="quadrant-title">${q.name}</div>
        <div class="quadrant-subtitle">${q.subtitle}</div>
      </div>
    </div>
    <div class="questions-list">
      ${questionsHTML}
    </div>
    <div class="form-actions">
      <span class="form-hint">Preencha ao menos uma resposta para continuar</span>
      <button class="btn-next ${hasAny ? 'ready' : ''}" id="btn-next" onclick="nextQuadrant()" style="background:${q.color}">
        ${isLast ? 'Ver meu resultado →' : 'Próximo quadrante →'}
      </button>
    </div>
  `;

  // Attach char-count listeners
  q.questions.forEach(question => {
    const el = document.getElementById(`q-${question.id}`);
    if (el) {
      el.addEventListener('input', () => {
        const cc = document.getElementById(`cc-${question.id}`);
        if (cc) cc.textContent = `${el.value.length}/400`;
        onInputChange();
      });
    }
  });
}

// ══════════════════════════════════════
// INPUT CHANGE — habilita botão
// ══════════════════════════════════════
function onInputChange() {
  const q    = QUADRANTS[currentQ];
  const hasAny = q.questions.some(question => {
    const el = document.getElementById(`q-${question.id}`);
    return el && el.value.trim().length > 0;
  });
  const btn = document.getElementById('btn-next');
  if (btn) {
    btn.classList.toggle('ready', hasAny);
  }
}

// ══════════════════════════════════════
// SAVE + NEXT
// ══════════════════════════════════════
function saveCurrentAnswers() {
  const q = QUADRANTS[currentQ];
  q.questions.forEach(question => {
    const el = document.getElementById(`q-${question.id}`);
    if (el) answers[q.key][question.id] = el.value.trim();
  });
  autosaveDraft();
}

function nextQuadrant() {
  saveCurrentAnswers();
  currentQ++;
  if (currentQ >= QUADRANTS.length) {
    showResult();
  } else {
    renderQuadrant(currentQ);
    window.scrollTo(0, 0);
  }
}

// ══════════════════════════════════════
// SHOW RESULT
// ══════════════════════════════════════
function showResult() {
  showPage('page-result');

  // Build soar grid
  const gridHTML = QUADRANTS.map(q => {
    const qAnswers = answers[q.key] || {};
    const filled   = Object.values(qAnswers).filter(v => v && v.length > 0);
    const answersHTML = filled.length > 0
      ? filled.map(v => `
          <div class="soar-answer-item">
            <div class="soar-answer-bullet" style="background:${q.color}"></div>
            <span>${v}</span>
          </div>
        `).join('')
      : `<div class="soar-answer-empty">Não respondido</div>`;

    return `
      <div class="soar-quadrant">
        <div class="soar-q-head">
          <div class="soar-q-icon" style="background:${q.color}">${q.icon}</div>
          <div>
            <span class="soar-q-label">${q.label}</span>
            <div class="soar-q-name">${q.name}</div>
          </div>
        </div>
        <div class="soar-answers">${answersHTML}</div>
      </div>
    `;
  }).join('');

  document.getElementById('soar-result-grid').innerHTML = gridHTML;

  // Build insights
  const totalFilled = QUADRANTS.reduce((acc, q) => {
    return acc + Object.values(answers[q.key] || {}).filter(v => v && v.length > 0).length;
  }, 0);
  const completionPct = Math.round((totalFilled / 16) * 100);

  const insights = generateInsights();

  document.getElementById('insights-card').innerHTML = `
    <span class="insights-label">Síntese Estratégica</span>
    <div class="insights-grid">
      ${insights.map(ins => `
        <div class="insight-item">
          <span class="insight-tag">${ins.label}</span>
          <div class="insight-text">${ins.text}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Save to localStorage
  const userData = (capsulaDB.lsGetUser() || {});
  if (!userData.uid) {
    userData.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  userData.soar  = { answers, completionPct, completedAt: new Date().toISOString() };
  capsulaDB.lsSetUser(userData);
  try {
    const _ud = (capsulaDB.lsGetUser() || {});
    delete _ud.soar_draft;
    capsulaDB.lsSetUser(_ud);
  } catch(e) {}

  // ── FIX CRÍTICO 1: Sincroniza resultado no array capsula_users[] ──
  try {
    const perfis = capsulaDB.lsGetUsers();
    const idx = perfis.findIndex(function(p) { return p.uid === userData.uid; });
    if (idx >= 0) {
      perfis[idx].soar = userData.soar;
      capsulaDB.lsSetUsers(perfis);
    }
  } catch(e) { /* silencioso */ }
  // Sync Supabase
  if(window.capsulaDB && userData.email){ capsulaDB.saveUser(userData).catch(e => console.warn('[soar] sync:', e)); }
}

// ══════════════════════════════════════
// GENERATE INSIGHTS
// ══════════════════════════════════════
function generateInsights() {
  const sArr = Object.values(answers.S || {}).filter(v => v && v.trim());
  const oArr = Object.values(answers.O || {}).filter(v => v && v.trim());
  const aArr = Object.values(answers.A || {}).filter(v => v && v.trim());
  const rArr = Object.values(answers.R || {}).filter(v => v && v.trim());
  const s1 = sArr[0] || '', o1 = oArr[0] || '', a1 = aArr[0] || '', r1 = rArr[0] || '';

  const insights = [];

  if (sArr.length && aArr.length) {
    insights.push({
      label: 'Alavancagem (S + A)',
      text: s1 && a1
        ? `"${s1}" é uma força que pode impulsionar diretamente a aspiração "${a1}". Use suas competências já consolidadas como ponto de partida para o que deseja conquistar.`
        : 'Suas forças são o combustível para suas aspirações. Use o que você já sabe fazer bem como ponto de partida para o que deseja conquistar.'
    });
  }
  if (oArr.length && rArr.length) {
    insights.push({
      label: 'Plano de Ação (O + R)',
      text: o1 && r1
        ? `A oportunidade "${o1}" se conecta diretamente ao resultado esperado "${r1}". Priorize as ações com maior alinhamento entre essas duas dimensões.`
        : 'As oportunidades identificadas se conectam diretamente aos resultados que você quer. Priorize as que têm maior alinhamento com suas metas de curto prazo.'
    });
  }
  if (sArr.length && oArr.length) {
    insights.push({
      label: 'Vantagem Competitiva (S + O)',
      text: s1 && o1
        ? `A força "${s1}" combinada com a oportunidade "${o1}" define um eixo de diferenciação único. É aqui que seu potencial competitivo é mais alto.`
        : 'A combinação das suas forças únicas com as oportunidades do mercado define onde você tem maior potencial de diferenciação.'
    });
  }
  if (aArr.length && rArr.length) {
    insights.push({
      label: 'Visão de Futuro (A + R)',
      text: a1 && r1
        ? `A aspiração "${a1}" e o resultado esperado "${r1}" estão mapeados. O próximo passo é definir os marcos concretos que ligam onde você está a onde quer chegar.`
        : 'Suas aspirações de longo prazo e seus resultados esperados estão mapeados. Defina marcos que conectem o presente ao futuro desejado.'
    });
  }

  if (insights.length < 2) {
    insights.push({
      label: 'Próximo Passo',
      text: 'Com sua análise SOAR concluída, revise seus quadrantes regularmente. O autoconhecimento estratégico é mais valioso quando revisitado e atualizado.'
    });
  }

  return insights.slice(0, 4);
}

// ══════════════════════════════════════
// GENERATE PDF — SOAR Blueprint
// ══════════════════════════════════════
// ── UTILITÁRIO: nome de exibição ──────────────────────────────
function getNomeExibido(userData) {
  if (!userData) return 'Usuário';
  if (userData.apelido && userData.apelido.trim()) return userData.apelido.trim();
  if (userData.nome && userData.nome.trim()) return userData.nome.trim();
  return 'Usuário';
}

function generatePDF() {
  if (window._payments) {
    _payments.serverDebitCredit('soar').then(function(ok) {
      if (!ok) { _payments.showPaywall('soar'); return; }
      _generatePDF();
    });
    return;
  }
  _generatePDF();
}
function _generatePDF() {
  const user = (capsulaDB.lsGetUser() || {});
  const nome = getNomeExibido(user);
  const data = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const ACCENT = '#6C5FE6';
  // ── PDF v2: 2-col uniform layout ──
  const insights2 = generateInsights();
  const totalItems2 = QUADRANTS.reduce((sum,q)=>sum+Object.values(answers[q.key]||{}).filter(v=>v&&v.trim()).length,0);

  const _gnCss_so = `*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Inter',sans-serif;background:#f8fafc;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.page{width:794px;height:1123px;overflow:hidden;margin:0 auto;padding:24px 34px;background:#f8fafc;display:flex;flex-direction:column;}
.hd{display:flex;justify-content:space-between;align-items:center;padding-bottom:11px;border-bottom:2px solid #000;margin-bottom:13px;flex-shrink:0;}
.brand{display:flex;align-items:center;gap:7px;}.brand-name{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;}.brand-name em{color:ACC;font-style:italic;font-weight:300;}
.hd-meta{font-family:'Space Mono',monospace;font-size:7px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;text-align:right;line-height:1.85;}
.grid{display:grid;grid-template-columns:1fr 1.3fr;gap:11px;flex:1;min-height:0;}.col{display:flex;flex-direction:column;gap:9px;min-height:0;overflow:hidden;}
.pn{background:#fafafa;border:1px solid #000;padding:13px 15px;position:relative;flex-shrink:0;}
.pn-grow{background:#fff;border:1px solid #000;padding:13px 15px;position:relative;flex:1;min-height:0;display:flex;flex-direction:column;}
.lbl{position:absolute;top:-8px;left:12px;background:#000;color:#fff;font-family:'Space Mono',monospace;font-size:6.5px;padding:1px 7px;text-transform:uppercase;letter-spacing:0.15em;}
.dom-ew{font-family:'Space Mono',monospace;font-size:7px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:ACC;margin-bottom:2px;}
.dom-name{font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:1;}
.arch-badge{display:inline-flex;align-items:center;gap:4px;font-family:'Space Mono',monospace;font-size:6.5px;padding:2px 7px;border:1px solid;text-transform:uppercase;letter-spacing:0.07em;margin-top:7px;}
.ins-lbl{font-family:'Space Mono',monospace;font-size:6.5px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:ACC;margin-bottom:7px;display:flex;align-items:center;gap:5px;flex-shrink:0;}
.ins-lbl::before{content:'';width:14px;height:2px;background:ACC;border-radius:2px;display:inline-block;}
.ins-txt{font-size:8.5px;color:#444;line-height:1.75;flex-shrink:0;}
.bp-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px;flex-shrink:0;}
.bp{border:1px solid #e4e4e7;padding:7px 9px;background:#fff;}
.bp-tag{font-family:'Space Mono',monospace;font-size:6px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:3px;color:ACC;}
.bp-txt{font-size:7.5px;line-height:1.6;color:#333;}
.quad-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;min-height:0;}
.quad{background:#fafafa;border:1px solid #e4e4e7;padding:10px 12px;display:flex;flex-direction:column;overflow:hidden;}
.quad-hd{display:flex;align-items:center;gap:7px;margin-bottom:7px;padding-bottom:6px;border-bottom:1px solid #f1f5f9;flex-shrink:0;}
.quad-ico{width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;}
.quad-title{font-size:8.5px;font-weight:700;}
.quad-sub{font-family:'Space Mono',monospace;font-size:6px;color:#71717a;text-transform:uppercase;letter-spacing:0.07em;}
.q-item{display:flex;gap:6px;align-items:flex-start;margin-bottom:5px;}
.q-dot{width:4px;height:4px;border-radius:50%;margin-top:5px;flex-shrink:0;}
.q-txt{font-size:7.5px;line-height:1.55;color:#333;}
.ft{padding-top:9px;border-top:2px solid #000;display:flex;justify-content:space-between;align-items:center;margin-top:9px;flex-shrink:0;}
.ft-l{font-family:'Space Mono',monospace;font-size:6px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;}
.ft-r{font-family:'Space Mono',monospace;font-size:7.5px;font-weight:700;color:#000;}
@media print{@page{margin:0;size:A4;}body{background:#f8fafc!important;}.page{width:100%;}}`.split('ACC').join(ACCENT);

  const insightsHTML2 = insights2.map(ins=>`<div class="bp"><span class="bp-tag">${ins.label}</span><p class="bp-txt">${ins.text}</p></div>`).join('');

  const _qCounts = {S:0,O:0,A:0,R:0};
  QUADRANTS.forEach(q=>{ _qCounts[q.key]=Object.values(answers[q.key]||{}).filter(v=>v&&v.trim()).length; });
  const completionPct2 = Math.round((totalItems2/16)*100);

  const quadHTML2 = QUADRANTS.map(q=>{
    const filled=Object.values(answers[q.key]||{}).filter(v=>v&&v.trim().length>0);
    const items=filled.length>0
      ? filled.slice(0,4).map(v=>`<div class="q-item"><span class="q-dot" style="background:${q.color};"></span><span class="q-txt">${v}</span></div>`).join('')
      : '<span style="font-family:monospace;font-size:9px;color:#a1a1aa;">// não respondido</span>';
    return `<div class="quad" style="border-top:2px solid ${q.color};">
      <div class="quad-hd">
        <div class="quad-ico" style="background:${q.color}15;border:1px solid ${q.color}35;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;color:${q.color};">${q.icon}</div>
        <div style="flex:1;"><div class="quad-title" style="color:${q.color};">${q.name}</div><div class="quad-sub">${q.label||''}</div></div>
        <span style="font-family:'Space Mono',monospace;font-size:6.5px;color:${q.color};background:${q.color}10;border:1px solid ${q.color}30;padding:1px 5px;border-radius:2px;">${filled.length}/4</span>
      </div>
      ${items}
    </div>`;
  }).join('');

  const _sArr2=Object.values(answers.S||{}).filter(v=>v&&v.trim());
  const _oArr2=Object.values(answers.O||{}).filter(v=>v&&v.trim());
  const _aArr2=Object.values(answers.A||{}).filter(v=>v&&v.trim());
  const _rArr2=Object.values(answers.R||{}).filter(v=>v&&v.trim());
  const _synthDesc = totalItems2>0
    ? `${nome} mapeou ${totalItems2} elemento${totalItems2!==1?'s':''} estratégicos: ${_sArr2.length} força${_sArr2.length!==1?'s':''}, ${_oArr2.length} oportunidade${_oArr2.length!==1?'s':''}, ${_aArr2.length} aspiração/aspirações e ${_rArr2.length} resultado${_rArr2.length!==1?'s':''} esperados. A análise SOAR foca no positivo para construir uma visão estratégica acionável.`
    : 'A análise SOAR mapeia seu posicionamento estratégico a partir de quatro dimensões positivas: forças, oportunidades, aspirações e resultados concretos.';

  _imprimirPDF(`<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8"><title>Análise SOAR — ${nome} · Sistema Gnosis</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>${_gnCss_so}</style></head><body><div class="page">
  <div class="hd">
    <div class="brand"><svg viewBox="0 0 100 100" fill="none" width="26" height="26"><path d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C59.66 15 68.38 18.91 74.72 25.22" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><path d="M85 50H55" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><circle cx="85" cy="50" r="4" fill="${ACCENT}"/></svg><span class="brand-name">SISTEMA <em>Gnosis</em></span></div>
    <div class="hd-meta">Módulo: Análise SOAR · Planejamento Estratégico<br>${data.toUpperCase()}<br>${nome.toUpperCase()}</div>
  </div>
  <div class="grid">
    <div class="col">
      <div class="pn">
        <div class="lbl">Resultado_SOAR</div>
        <div class="dom-ew">Resultado · Análise SOAR</div>
        <div class="dom-name" style="color:${ACCENT};">ANÁLISE SOAR</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
          <div class="arch-badge" style="color:${ACCENT};border-color:${ACCENT}40;background:${ACCENT}08;">${totalItems2} de 16 elementos · ${completionPct2}% completo</div>
        </div>
        <div style="display:flex;gap:5px;margin-top:8px;">
          ${QUADRANTS.map(q=>`<div style="flex:1;background:${q.color}10;border:1px solid ${q.color}30;border-radius:3px;padding:4px 6px;text-align:center;"><div style="font-family:'Space Mono',monospace;font-size:8px;font-weight:700;color:${q.color};">${q.icon}</div><div style="font-family:'Space Mono',monospace;font-size:6px;color:${q.color};margin-top:1px;">${_qCounts[q.key]}/4</div></div>`).join('')}
        </div>
      </div>
      <div class="pn-grow">
        <div class="lbl">Síntese_Estratégica</div>
        <div class="ins-lbl">Análise Integrada</div>
        <p class="ins-txt">${_synthDesc}</p>
        <div class="bp-grid">${insightsHTML2}</div>
      </div>
    </div>
    <div class="col">
      <div class="pn-grow" style="flex:1;">
        <div class="lbl">Mapa_SOAR</div>
        <div class="quad-grid" style="margin-top:8px;">${quadHTML2}</div>
      </div>
    </div>
  </div>
  <div class="ft"><span class="ft-l">Sistema Gnosis // Análise SOAR // Planejamento Estratégico // Confidencial</span><span class="ft-r">sistemagnosis.com.br</span></div>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>
  </body></html>`);
  return;
}

// ══════════════════════════════════════
// SHARE
// ══════════════════════════════════════
function shareResult() {
  const totalFilled = QUADRANTS.reduce((acc, q) => {
    return acc + Object.values(answers[q.key] || {}).filter(v => v && v.length > 0).length;
  }, 0);
  const text = `Concluí minha Análise SOAR no Sistema Gnosis — ${totalFilled} respostas estratégicas mapeadas. Descubra o seu em sistemagnosis.com.br`;
  if (navigator.share) {
    navigator.share({ title: 'Minha Análise SOAR', text });
  } else {
    navigator.clipboard.writeText(text).then(() => showCopyToast('Link copiado! Cole onde quiser.'));
  }
}

// ══════════════════════════════════════
// INICIALIZAÇÃO DA PÁGINA
// ══════════════════════════════════════
async function initPage() {
  // Tenta localStorage; se vazio, busca sessão Supabase
  let userData = null;
  try { userData = await capsulaDB.ensureUserData(); } catch(_e) {}

  if (window._payments && !_payments.isPro() && !_payments.isAdmin()) {
    const _c = _payments.getCredits();
    const _hasSpec = (_c['soar'] || 0) > 0, _hasAvul = (_c.avulsos || 0) > 0;
    if (!_hasSpec && !_hasAvul) {
      _payments.showPaywall('soar');
      const _gate = new MutationObserver(function() {
        if (!document.getElementById('_paywall-modal')) {
          _gate.disconnect();
          if (!_payments.hasAccess('soar')) window.location.href = 'dashboard.html';
        }
      });
      _gate.observe(document.body, { childList: true, subtree: true });
      return;
    }
    if (!_hasSpec && _hasAvul) await _payments.unlockMatrix('soar');
  }

  // Redirect: se já tem resultado salvo, mostra direto
  if (userData && userData.soar && userData.soar.completedAt && userData.soar.answers) {
    answers = userData.soar.answers;
    _isLoadingExisting = true;
    showResult();
    return;
  }

  // Guard: sem usuário cadastrado → volta para index
  if (!userData || (!userData.nome && !userData.apelido && !userData.email)) {
    window.location.href = 'index.html';
    return;
  }

  // Auto-heal: garante que uid sempre existe
  if (!userData.uid) {
    userData.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    try { capsulaDB.lsSetUser(userData); } catch(_) {}
  }

  // Exibe nome do usuário na intro
  const nome = getNomeExibido(userData);
  const greeting = document.getElementById('soar-greeting');
  if (greeting) {
    greeting.style.display = 'block';
    greeting.querySelector('.js-user-name').textContent = nome;
  }

  // Restaura rascunho salvo, se houver
  const _u = (capsulaDB.lsGetUser() || {});
  const draft = _u.soar_draft || null;
  if (draft) {
    try {
      const saved = draft;
      answers = saved;
    } catch(e) {}
  }
}

// Auto-save rascunho a cada mudança + feedback visual
function autosaveDraft() {
  try {
    const u = (capsulaDB.lsGetUser() || {});
    u.soar_draft = answers;
    capsulaDB.lsSetUser(u);
    // Feedback visual sutil no contador
    const counter = document.getElementById('form-counter');
    if (counter) {
      const original = counter.textContent;
      counter.textContent = '✓ salvo automaticamente';
      counter.style.color = 'var(--S)';
      clearTimeout(window._draftFeedbackTimer);
      window._draftFeedbackTimer = setTimeout(function() {
        counter.textContent = original;
        counter.style.color = '';
      }, 1800);
    }
  } catch(e) {}
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

function _imprimirPDF(html){
  var old=document.getElementById('_pdf_frame');if(old)old.remove();
  var iframe=document.createElement('iframe');iframe.id='_pdf_frame';
  iframe.setAttribute('style','position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;border:none;');
  document.body.appendChild(iframe);
  var doc=iframe.contentDocument||iframe.contentWindow.document;
  doc.open();doc.write(html);doc.close();
  iframe.onload=function(){setTimeout(function(){try{iframe.contentWindow.focus();iframe.contentWindow.print();}catch(e){var blob=new Blob([html],{type:'text/html'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='soar-resultado.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}},700);};
}
document.addEventListener('DOMContentLoaded', initPage);

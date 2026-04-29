const QUADRANTS = [
  {
    key:'ama', label:'Quadrante I', name:'O que você Ama', subtitle:'Paixões, valores e o que te traz alegria genuína',
    color:'#E8603A', bg:'rgba(232,96,58,0.12)', icon:'🔥',
    questions:[
      {id:'ama1', prompt:'Quais atividades fazem você perder a noção do tempo por puro prazer?', placeholder:'Ex: criar conteúdo, resolver problemas complexos, ensinar outras pessoas...'},
      {id:'ama2', prompt:'Se dinheiro não fosse obstáculo, o que você passaria seus dias fazendo?', placeholder:'Ex: viajar e documentar experiências, construir produtos digitais...'},
      {id:'ama3', prompt:'Sobre quais assuntos você consegue falar por horas sem cansar?', placeholder:'Ex: psicologia, tecnologia, desenvolvimento humano, design...'},
      {id:'ama4', prompt:'Que tipo de ambiente ou situação faz você se sentir completamente vivo(a)?', placeholder:'Ex: ambientes criativos, situações de liderança, trabalho solo com foco profundo...'},
    ]
  },
  {
    key:'bom', label:'Quadrante II', name:'O que você Faz Bem', subtitle:'Habilidades naturais, talentos e competências desenvolvidas',
    color:'#6C5FE6', bg:'rgba(108,95,230,0.12)', icon:'⭐',
    questions:[
      {id:'bom1', prompt:'Quais habilidades as pessoas ao seu redor sempre reconhecem e elogiam em você?', placeholder:'Ex: capacidade analítica, comunicação clara, empatia, organização...'},
      {id:'bom2', prompt:'Em que tipo de tarefa você se sente naturalmente mais competente e confiante?', placeholder:'Ex: estruturar processos, vender ideias, criar soluções criativas...'},
      {id:'bom3', prompt:'Quais conquistas do seu passado demonstram seu maior potencial?', placeholder:'Ex: projeto que liderou com sucesso, meta difícil que atingiu...'},
      {id:'bom4', prompt:'Que recursos únicos você possui que poucas pessoas têm?', placeholder:'Ex: combinação de conhecimentos técnicos e comportamentais, rede de contatos...'},
    ]
  },
  {
    key:'precisa', label:'Quadrante III', name:'O que o Mundo Precisa', subtitle:'Necessidades reais que você pode endereçar',
    color:'#2EC4A0', bg:'rgba(46,196,160,0.12)', icon:'🌍',
    questions:[
      {id:'prec1', prompt:'Que problema recorrente no mundo ou na sua área te incomoda profundamente?', placeholder:'Ex: falta de líderes emocionalmente inteligentes, excesso de burocracia...'},
      {id:'prec2', prompt:'Que mudança você gostaria de ver na sociedade ou no mercado de trabalho?', placeholder:'Ex: empresas mais humanas, educação mais prática, saúde mental valorizada...'},
      {id:'prec3', prompt:'Que necessidade específica de pessoas ao seu redor você poderia resolver?', placeholder:'Ex: pessoas que precisam de clareza de propósito, equipes que precisam de estrutura...'},
      {id:'prec4', prompt:'Que impacto você quer causar na vida das pessoas ou no mercado nos próximos 10 anos?', placeholder:'Ex: ajudar 10.000 pessoas a encontrarem seu propósito, criar emprego de qualidade...'},
    ]
  },
  {
    key:'paga', label:'Quadrante IV', name:'O que te Remunera', subtitle:'O que o mercado paga e valorizaria em você',
    color:'#1BA8D4', bg:'rgba(27,168,212,0.12)', icon:'💎',
    questions:[
      {id:'paga1', prompt:'Por que as pessoas ou empresas já pagaram ou pagariam por seu trabalho?', placeholder:'Ex: consultoria estratégica, criação de conteúdo, liderança de projetos...'},
      {id:'paga2', prompt:'Que habilidades suas têm alta demanda no mercado atual ou futuro?', placeholder:'Ex: inteligência emocional, análise de dados, gestão de times remotos...'},
      {id:'paga3', prompt:'Que tipo de solução você entrega que gera resultado financeiro real para outros?', placeholder:'Ex: aumento de conversão, redução de turnover, agilidade de entrega...'},
      {id:'paga4', prompt:'Qual seria o modelo de trabalho ou negócio onde seu valor seria mais reconhecido?', placeholder:'Ex: consultoria, mentoria, produto digital, carreira corporativa como especialista...'},
    ]
  }
];

let currentQ = 0;
let answers = {ama:{}, bom:{}, precisa:{}, paga:{}};
let _isLoadingExisting = false;

const _IK_SVGS={
  ama:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21C12 21 3 9.5 3 7a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 2.5-9 14-9 14z" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 10c0-1.5 1-3 3-3" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  bom:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  precisa:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="${c}" stroke-width="1.8"/><ellipse cx="12" cy="12" rx="4" ry="9" stroke="${c}" stroke-width="1.5"/><line x1="3" y1="12" x2="21" y2="12" stroke="${c}" stroke-width="1.5"/></svg>`,
  paga:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="13" rx="2" stroke="${c}" stroke-width="1.8"/><path d="M3 10h18" stroke="${c}" stroke-width="1.5"/><circle cx="8" cy="15" r="1.5" fill="${c}"/><line x1="12" y1="13" x2="17" y2="13" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="16" x2="15" y2="16" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};
const _ikIco=(q,size)=>(_IK_SVGS[q.key]?_IK_SVGS[q.key](q.color,size):'');

function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0);}

function startForm(){currentQ=0;answers={ama:{},bom:{},precisa:{},paga:{}};showPage('page-form');renderQuadrant(0);}

function goBack(){if(currentQ===0)showPage('page-intro');else{saveAnswers();currentQ--;renderQuadrant(currentQ);}}

function resetForm(){answers={ama:{},bom:{},precisa:{},paga:{}};startForm();}

function renderQuadrant(idx){
  const q = QUADRANTS[idx];
  const pct = Math.round((idx/QUADRANTS.length)*100);
  document.getElementById('prog-fill').style.cssText = `width:${pct}%;background:${q.color};`;
  document.getElementById('prog-counter').textContent = `Quadrante ${idx+1} de ${QUADRANTS.length}`;
  const saved = answers[q.key]||{};
  const hasAny = Object.values(saved).some(v=>v&&v.trim().length>0);
  document.getElementById('form-container').innerHTML = `
    <div class="quadrant-header">
      <div class="quadrant-badge" style="background:${q.bg};border:1px solid ${q.color}44;">${q.icon}</div>
      <div>
        <span class="quadrant-label" style="color:${q.color}">${q.label}</span>
        <div class="quadrant-title">${q.name}</div>
        <div class="quadrant-subtitle">${q.subtitle}</div>
      </div>
    </div>
    <div class="questions-list">
      ${q.questions.map((quest,qi)=>`
        <div>
          <div class="question-prompt" style="--q-color:${q.color}">
            <span class="q-num" style="color:${q.color}">${String(qi+1).padStart(2,'0')}</span>
            ${quest.prompt}
          </div>
          <textarea class="question-input" id="q-${quest.id}" placeholder="${quest.placeholder}" maxlength="400" aria-label="${quest.prompt}" oninput="onInput()" style="border-color:${q.color}22;"
            onfocus="this.style.borderColor='${q.color}'" onblur="this.style.borderColor='${q.color}22'"
          >${saved[quest.id]||''}</textarea>
          <div class="char-count" id="cc-${quest.id}">${(saved[quest.id]||'').length}/400</div>
        </div>
      `).join('')}
    </div>
    <div class="form-actions">
      <span class="form-hint">// preencha ao menos uma resposta</span>
      <button class="btn-next ${hasAny?'ready':''}" id="btn-next" style="background:${q.color}" onclick="nextQuadrant()">
        ${idx===QUADRANTS.length-1?'Ver meu Ikigai →':'Próximo →'}
      </button>
    </div>
  `;
  q.questions.forEach(quest=>{
    const el=document.getElementById(`q-${quest.id}`);
    if(el)el.addEventListener('input',()=>{
      const cc=document.getElementById(`cc-${quest.id}`);
      if(cc)cc.textContent=`${el.value.length}/400`;
      onInput();
      autosave();
    });
  });
}

function onInput(){
  const q=QUADRANTS[currentQ];
  const hasAny=q.questions.some(quest=>{const el=document.getElementById(`q-${quest.id}`);return el&&el.value.trim().length>0;});
  const btn=document.getElementById('btn-next');
  if(btn)btn.classList.toggle('ready',hasAny);
}

function saveAnswers(){
  const q=QUADRANTS[currentQ];
  q.questions.forEach(quest=>{const el=document.getElementById(`q-${quest.id}`);if(el)answers[q.key][quest.id]=el.value.trim();});
}

function autosave(){
  saveAnswers();
  try{
    const u=(capsulaDB.lsGetUser() || {});
    u.ikigai_draft=answers;
    capsulaDB.lsSetUser(u);
  }catch(e){}
}

function nextQuadrant(){
  saveAnswers();currentQ++;
  if(currentQ>=QUADRANTS.length)showResult();
  else{renderQuadrant(currentQ);window.scrollTo(0,0);}
}

function showResult(){
  showPage('page-result');
  // Grid
  document.getElementById('ikigai-grid').innerHTML = QUADRANTS.map(q=>{
    const filled=Object.values(answers[q.key]||{}).filter(v=>v&&v.length>0);
    return `
      <div class="ik-quadrant">
        <div class="ik-q-head">
          <div class="ik-q-icon" style="background:${q.bg};border:1px solid ${q.color}33;">${q.icon}</div>
          <div>
            <span class="ik-q-label" style="color:${q.color}">${q.label}</span>
            <div class="ik-q-name">${q.name}</div>
          </div>
        </div>
        <div class="ik-answers">
          ${filled.length>0?filled.map(v=>`<div class="ik-answer-item"><span class="ik-bullet" style="background:${q.color}"></span><span>${v}</span></div>`).join(''):'<span class="ik-empty">// não respondido</span>'}
        </div>
      </div>`;
  }).join('');

  // Síntese central
  const ama = Object.values(answers.ama).filter(v=>v).slice(0,1)[0]||'';
  const bom = Object.values(answers.bom).filter(v=>v).slice(0,1)[0]||'';
  const prec = Object.values(answers.precisa).filter(v=>v).slice(0,1)[0]||'';
  const paga = Object.values(answers.paga).filter(v=>v).slice(0,1)[0]||'';
  const filled = [ama,bom,prec,paga].filter(Boolean).length;
  document.getElementById('ikigai-center').innerHTML = `
    <span class="ikigai-center-label">✦ O SEU IKIGAI</span>
    <h3>A intersecção dos seus quatro pilares</h3>
    <p>${filled>=3?
      'Seu Ikigai emerge na confluência do que você ama e faz bem, com o que o mundo precisa e o que te remunera. Revisite cada quadrante e identifique onde há maior sobreposição — essa é sua zona de máximo propósito e impacto.'
      :'Complete mais quadrantes para obter uma síntese mais precisa do seu Ikigai. Quanto mais honesto e específico, mais poderoso o resultado.'
    }</p>
  `;

  // Salva
  const u=(capsulaDB.lsGetUser() || {});
  if(!u.uid){u.uid=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);}
  u.ikigai={answers,completedAt:new Date().toISOString()};
  delete u.ikigai_draft;
  capsulaDB.lsSetUser(u);
  try{sessionStorage.setItem('capsula_user',JSON.stringify(u));}catch(_){}
  // Sync capsula_users[]
  try{
    const perfis=capsulaDB.lsGetUsers();
    const idx=perfis.findIndex(p=>p.uid===u.uid);
    if(idx>=0){perfis[idx].ikigai=u.ikigai;capsulaDB.lsSetUsers(perfis);}
  }catch(e){}
  // Sync Supabase
  if(window.capsulaDB && u.email){ capsulaDB.saveUser(u).catch(function(e){ console.warn('[ikigai] sync:', e); }); }
}

// Restaura rascunho e proteção de rota
document.addEventListener('DOMContentLoaded', async function(){
  // Tenta localStorage; se vazio, busca sessão Supabase
  let _u = null;
  try { _u = await capsulaDB.ensureUserData(); } catch(_e) {}

  if (window._payments && !_payments.isPro() && !_payments.isAdmin()) {
    const _c = _payments.getCredits();
    const _hasSpec = (_c['ikigai'] || 0) > 0, _hasAvul = (_c.avulsos || 0) > 0;
    if (!_hasSpec && !_hasAvul) {
      _payments.showPaywall('ikigai');
      const _gate = new MutationObserver(function() {
        if (!document.getElementById('_paywall-modal')) {
          _gate.disconnect();
          if (!_payments.hasAccess('ikigai')) window.location.href = 'dashboard.html';
        }
      });
      _gate.observe(document.body, { childList: true, subtree: true });
      return;
    }
    if (!_hasSpec && _hasAvul) await _payments.unlockMatrix('ikigai');
  }

  // Redirect: se já tem resultado salvo, mostra direto
  if (_u && _u.ikigai && _u.ikigai.completedAt && _u.ikigai.answers) {
    answers = _u.ikigai.answers;
    _isLoadingExisting = true;
    showResult();
    return;
  }

  // Proteção de rota
  if (!_u || (!_u.nome && !_u.apelido && !_u.email)) {
    window.location.href = 'index.html';
    return;
  }
  if (_u.ikigai_draft) answers = _u.ikigai_draft;
  if (!_u.uid) { _u.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); try { capsulaDB.lsSetUser(_u); } catch(_) {} }
});

function generatePDF(){
  if (window._payments) {
    _payments.serverDebitCredit('ikigai').then(function(ok) {
      if (!ok) { _payments.showPaywall('ikigai'); return; }
      _generatePDF();
    });
    return;
  }
  _generatePDF();
}
function _generatePDF(){
  const u=(capsulaDB.lsGetUser() || {});
  const nome=u.apelido||u.nome||'Usuário';
  const data=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  const ACCENT='#E8603A';
  // ── PDF v2: 2-col uniform layout ──
  const totalItems = QUADRANTS.reduce((sum,q)=>sum+Object.values(answers[q.key]||{}).filter(v=>v&&v.trim()).length,0);

  const _gnCss_ik = `*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Inter',sans-serif;background:#f8fafc;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.page{width:794px;height:1123px;overflow:hidden;margin:0 auto;padding:24px 34px;background:#f8fafc;display:flex;flex-direction:column;}
.hd{display:flex;justify-content:space-between;align-items:center;padding-bottom:11px;border-bottom:2px solid #000;margin-bottom:13px;flex-shrink:0;}
.brand{display:flex;align-items:center;gap:7px;}.brand-name{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;}.brand-name em{color:ACC;font-style:italic;font-weight:300;}
.hd-meta{font-family:'Space Mono',monospace;font-size:7px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;text-align:right;line-height:1.85;}
.grid{display:grid;grid-template-columns:1fr 1.3fr;gap:11px;flex:1;min-height:0;}.col{display:flex;flex-direction:column;gap:9px;min-height:0;overflow:hidden;}
.pn{background:#fafafa;border:1px solid #000;padding:13px 15px;position:relative;flex-shrink:0;}
.pn-grow{background:#fff;border:1px solid #000;padding:13px 15px;position:relative;flex:1;min-height:0;display:flex;flex-direction:column;}
.lbl{position:absolute;top:-8px;left:12px;background:#000;color:#fff;font-family:'Space Mono',monospace;font-size:6.5px;padding:1px 7px;text-transform:uppercase;letter-spacing:0.15em;}
.dom-ew{font-family:'Space Mono',monospace;font-size:7px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:ACC;margin-bottom:2px;}
.dom-name{font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:1;}
.arch-badge{display:inline-flex;align-items:center;gap:4px;font-family:'Space Mono',monospace;font-size:6.5px;padding:2px 7px;border:1px solid;text-transform:uppercase;letter-spacing:0.07em;margin-top:7px;}
.ins-lbl{font-family:'Space Mono',monospace;font-size:6.5px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:ACC;margin-bottom:7px;display:flex;align-items:center;gap:5px;flex-shrink:0;}
.ins-lbl::before{content:'';width:14px;height:2px;background:ACC;border-radius:2px;display:inline-block;}
.ins-txt{font-size:8.5px;color:#444;line-height:1.75;flex-shrink:0;}
.int-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px;flex-shrink:0;}
.int-item{border:1px solid #e4e4e7;padding:7px 9px;}
.int-tag{font-family:'Space Mono',monospace;font-size:6px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:3px;}
.int-txt{font-size:7.5px;line-height:1.6;color:#333;}
.gap-box{flex:1;display:flex;flex-direction:column;justify-content:center;margin-top:9px;padding-top:9px;border-top:1px solid #e4e4e7;}
.gap-lbl{font-family:'Space Mono',monospace;font-size:6.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;margin-bottom:6px;}
.gap-txt{font-size:8px;color:#71717a;line-height:1.65;text-align:center;}
.quad-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;min-height:0;}
.quad{background:#fafafa;border:1px solid #e4e4e7;padding:10px 12px;display:flex;flex-direction:column;overflow:hidden;}
.quad-hd{display:flex;align-items:center;gap:7px;margin-bottom:7px;padding-bottom:6px;border-bottom:1px solid #f1f5f9;flex-shrink:0;}
.quad-ico{width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;}
.quad-title{font-size:8.5px;font-weight:700;}
.quad-sub{font-family:'Space Mono',monospace;font-size:6px;color:#71717a;text-transform:uppercase;letter-spacing:0.07em;}
.quad-items{flex:1;overflow:hidden;}
.q-item{display:flex;gap:6px;align-items:flex-start;margin-bottom:5px;}
.q-dot{width:4px;height:4px;border-radius:50%;margin-top:5px;flex-shrink:0;}
.q-txt{font-size:7.5px;line-height:1.55;color:#333;}
.ft{padding-top:9px;border-top:2px solid #000;display:flex;justify-content:space-between;align-items:center;margin-top:9px;flex-shrink:0;}
.ft-l{font-family:'Space Mono',monospace;font-size:6px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;}
.ft-r{font-family:'Space Mono',monospace;font-size:7.5px;font-weight:700;color:#000;}
@media print{@page{margin:0;size:A4;}body{background:#f8fafc!important;}.page{width:100%;}}`.split('ACC').join(ACCENT);

  const intersections = [
    {tag:'Paixão',txt:'A interseção entre o que você ama e no que é bom define sua paixão — a energia que sustenta esforços de longo prazo.',color:'#E8603A'},
    {tag:'Missão',txt:'Onde o que você ama encontra o que o mundo precisa. É o chamado que transcende o interesse pessoal.',color:'#9B59B6'},
    {tag:'Vocação',txt:'No que você é bom e pelo que pode ser pago. É sua proposta de valor — a entrega que o mercado reconhece.',color:'#2EC4A0'},
    {tag:'Profissão',txt:'O que o mundo precisa e pelo que pode ser pago. É a sustentabilidade — a viabilidade prática do propósito.',color:'#1BA8D4'},
  ];
  const intHTML = intersections.map(i=>`<div class="int-item" style="border-color:${i.color}30;background:${i.color}04;"><span class="int-tag" style="color:${i.color};">${i.tag}</span><p class="int-txt">${i.txt}</p></div>`).join('');

  const quadHTML = QUADRANTS.map(q=>{
    const filled=Object.values(answers[q.key]||{}).filter(v=>v&&v.trim().length>0);
    const items=filled.length>0
      ? filled.slice(0,4).map(v=>`<div class="q-item"><span class="q-dot" style="background:${q.color};"></span><span class="q-txt">${v}</span></div>`).join('')
      : '<span style="font-family:monospace;font-size:9px;color:#a1a1aa;">// não respondido</span>';
    return `<div class="quad" style="border-top:2px solid ${q.color};">
      <div class="quad-hd">
        <div class="quad-ico" style="background:${q.color}15;border:1px solid ${q.color}35;">${_ikIco(q,16)}</div>
        <div><div class="quad-title" style="color:${q.color};">${q.name}</div><div class="quad-sub">${q.label||''}</div></div>
      </div>
      <div class="quad-items">${items}</div>
    </div>`;
  }).join('');

  _imprimirPDF(`<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8"><title>Ikigai — ${nome} · Sistema Gnosis</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>${_gnCss_ik}</style></head><body><div class="page">
  <div class="hd">
    <div class="brand"><svg viewBox="0 0 100 100" fill="none" width="26" height="26"><path d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C59.66 15 68.38 18.91 74.72 25.22" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><path d="M85 50H55" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><circle cx="85" cy="50" r="4" fill="${ACCENT}"/></svg><span class="brand-name">SISTEMA <em>Gnosis</em></span></div>
    <div class="hd-meta">Módulo: Ikigai · Razão de Ser<br>${data.toUpperCase()}<br>${nome.toUpperCase()}</div>
  </div>
  <div class="grid">
    <div class="col">
      <div class="pn">
        <div class="lbl">Resultado_Ikigai</div>
        <div class="dom-ew">Resultado · Ikigai</div>
        <div class="dom-name" style="color:${ACCENT};">IKIGAI</div>
        <div class="arch-badge" style="color:${ACCENT};border-color:${ACCENT}40;background:${ACCENT}08;">${totalItems} elementos mapeados · ${QUADRANTS.length} quadrantes</div>
      </div>
      <div class="pn-grow">
        <div class="lbl">Análise_do_Perfil</div>
        <div class="ins-lbl">Síntese dos Quatro Pilares</div>
        <p class="ins-txt">O Ikigai é a confluência entre quatro dimensões: o que você ama, no que é bom, o que o mundo precisa e pelo que pode ser remunerado. Seu propósito de vida emerge no ponto onde esses quatro círculos se sobrepõem.</p>
        <div class="int-grid">${intHTML}</div>
        <div class="gap-box">
          <div class="gap-lbl">// Próximo Passo</div>
          <p class="gap-txt">Identifique nos seus quadrantes os elementos que aparecem em mais de uma área. Essa sobreposição é o sinal mais claro do seu Ikigai em formação.</p>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="pn-grow" style="flex:1;">
        <div class="lbl">Mapa_dos_Quatro_Quadrantes</div>
        <div class="quad-grid" style="margin-top:8px;">${quadHTML}</div>
      </div>
    </div>
  </div>
  <div class="ft"><span class="ft-l">Sistema Gnosis // Ikigai // Razão de Ser // Confidencial</span><span class="ft-r">capsula-dev-atualizado.vercel.app</span></div>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>
  </body></html>`);
  return;
}

function _imprimirPDF(html){
  var old=document.getElementById('_pdf_frame');if(old)old.remove();
  var iframe=document.createElement('iframe');iframe.id='_pdf_frame';
  iframe.setAttribute('style','position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;border:none;');
  document.body.appendChild(iframe);
  var doc=iframe.contentDocument||iframe.contentWindow.document;
  doc.open();doc.write(html);doc.close();
  iframe.onload=function(){setTimeout(function(){try{iframe.contentWindow.focus();iframe.contentWindow.print();}catch(e){var blob=new Blob([html],{type:'text/html'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='ikigai.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}},700);};
}

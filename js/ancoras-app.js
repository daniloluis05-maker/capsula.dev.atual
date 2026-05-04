const ANCHORS = [
  {id:'tecnica', icon:'🔬', name:'Competência Técnica', color:'#1BA8D4',
    desc:'Ser especialista e reconhecido pela excelência no que faz. Prefere profundidade a amplitude.',
    example:'Ex: engenheiro sênior, médico especialista, designer expert, programador de nicho.',
    insight:'Você se realiza sendo o melhor na sua área. Evite cargos generalistas que tirem você do seu domínio.'},
  {id:'gestao', icon:'👥', name:'Competência em Gestão', color:'#E8603A',
    desc:'Liderar pessoas, integrar esforços e ser responsável por resultados organizacionais.',
    example:'Ex: diretor, gerente geral, CEO, líder de equipe multidisciplinar.',
    insight:'Você precisa de autoridade e influência. Busque posições de liderança com visibilidade e impacto.'},
  {id:'autonomia', icon:'🦅', name:'Autonomia e Independência', color:'#6C5FE6',
    desc:'Fazer as coisas do seu jeito, no seu tempo, com o mínimo de restrições externas.',
    example:'Ex: freelancer, consultor independente, empreendedor solo, especialista autônomo.',
    insight:'Ambientes corporativos rígidos vão te frustrar. Priorize flexibilidade e controle sobre sua agenda.'},
  {id:'seguranca', icon:'🛡️', name:'Segurança e Estabilidade', color:'#2EC4A0',
    desc:'Ter emprego seguro, benefícios, previsibilidade e lealdade de longo prazo.',
    example:'Ex: funcionário público, empresa grande com plano de carreira, multinacional estável.',
    insight:'Estabilidade é seu combustível. Evite startups de alto risco e ambientes voláteis sem estrutura.'},
  {id:'empreendedor', icon:'🚀', name:'Criatividade Empreendedora', color:'#E8603A',
    desc:'Criar algo do zero — produto, empresa, processo — que seja reconhecidamente seu.',
    example:'Ex: fundador de startup, intraempreendedor, criador de produto, inovador corporativo.',
    insight:'Você precisa construir. Funções de execução pura sem espaço para criar vão te entediar rapidamente.'},
  {id:'servico', icon:'🤝', name:'Serviço e Dedicação', color:'#2EC4A0',
    desc:'Trabalhar por uma causa que vale a pena — impacto social, ambiental ou humano.',
    example:'Ex: ONGs, saúde, educação, empresas com propósito claro de impacto positivo.',
    insight:'Seu trabalho precisa ter significado além do financeiro. Salário alto sem propósito te esvaziará.'},
  {id:'desafio', icon:'⚡', name:'Desafio Puro', color:'#E8603A',
    desc:'Superar obstáculos impossíveis, competir e vencer problemas extremamente difíceis.',
    example:'Ex: vendas complexas, turnaround de empresas, consultor de crise, atleta de alta performance.',
    insight:'Você precisa de problemas difíceis. Rotinas previsíveis drenam sua energia e motivação.'},
  {id:'estilo', icon:'⚖️', name:'Estilo de Vida Integrado', color:'#1BA8D4',
    desc:'Integrar carreira, família e interesses pessoais sem sacrificar nenhum pelo outro.',
    example:'Ex: trabalho remoto, horário flexível, empresa com cultura de bem-estar e life balance.',
    insight:'Equilíbrio é inegociável para você. Culturas de "sempre disponível" vão comprometer sua saúde.'},
];

const HINTS = ['Não me representa','Me representa pouco','Neutro','Me representa bem','Me representa muito'];

const _ANCHOR_SVGS={
  tecnica:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="2" width="6" height="10" rx="1" stroke="${c}" stroke-width="1.8"/><path d="M7 12h10l2 8H5l2-8z" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="17" r="1.5" fill="${c}"/><line x1="12" y1="2" x2="12" y2="6" stroke="${c}" stroke-width="1.5"/></svg>`,
  gestao:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="5" r="2.5" stroke="${c}" stroke-width="1.8"/><circle cx="5" cy="17" r="2.5" stroke="${c}" stroke-width="1.8"/><circle cx="19" cy="17" r="2.5" stroke="${c}" stroke-width="1.8"/><line x1="12" y1="7.5" x2="12" y2="12" stroke="${c}" stroke-width="1.5"/><line x1="12" y1="12" x2="5" y2="14.5" stroke="${c}" stroke-width="1.5"/><line x1="12" y1="12" x2="19" y2="14.5" stroke="${c}" stroke-width="1.5"/></svg>`,
  autonomia:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="${c}" stroke-width="1.8"/><circle cx="12" cy="12" r="2" fill="${c}"/><line x1="12" y1="3" x2="12" y2="6" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><line x1="12" y1="18" x2="12" y2="21" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><line x1="3" y1="12" x2="6" y2="12" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><line x1="18" y1="12" x2="21" y2="12" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  seguranca:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L4 6v5c0 5 4 9 8 10 4-1 8-5 8-10V6L12 3z" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><polyline points="9,12 11,14 15,10" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  empreendedor:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 6 8 6 14a6 6 0 0 0 12 0c0-6-6-12-6-12z" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><line x1="12" y1="14" x2="12" y2="20" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="20" x2="15" y2="20" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="14" r="2" fill="${c}"/></svg>`,
  servico:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21C12 21 3 15 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12z" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  desafio:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="12,3 22,21 2,21" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><line x1="12" y1="10" x2="12" y2="15" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="18" r="1" fill="${c}"/></svg>`,
  estilo:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="3" x2="12" y2="21" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><line x1="5" y1="8" x2="19" y2="8" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><line x1="7" y1="16" x2="17" y2="16" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><circle cx="5" cy="8" r="2" fill="${c}"/><circle cx="19" cy="8" r="2" fill="${c}"/><circle cx="7" cy="16" r="2" fill="${c}"/><circle cx="17" cy="16" r="2" fill="${c}"/></svg>`,
};
const _ancIco=(a,size)=>(_ANCHOR_SVGS[a.id]?_ANCHOR_SVGS[a.id](a.color,size):'');
let currentA = 0;
let scores = {};
let _isLoadingExisting = false;

function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0);}

function startQuiz(){currentA=0;scores={};showPage('page-quiz');renderAnchor(0);}

function goBack(){if(currentA===0)showPage('page-intro');else{currentA--;renderAnchor(currentA);}}

function renderAnchor(idx){
  const a=ANCHORS[idx];
  const pct=Math.round((idx/ANCHORS.length)*100);
  document.getElementById('prog-fill').style.width=pct+'%';
  document.getElementById('prog-label').textContent=`${idx+1} de ${ANCHORS.length}`;
  const sel=scores[a.id]||null;
  const card=document.getElementById('anchor-card');
  card.style.animation='none';card.offsetHeight;card.style.animation='';
  card.innerHTML=`
    <div class="anchor-tag"><span style="background:${a.color};width:6px;height:6px;border-radius:50%;display:inline-block;"></span>${a.name}</div>
    <span class="anchor-icon">${_ancIco(a,36)}</span>
    <div class="anchor-name" style="color:${a.color}">${a.name}</div>
    <div class="anchor-desc">${a.desc}</div>
    <div class="anchor-example" style="color:${a.color}88">${a.example}</div>
    <div class="scale-label-row"><span>Não me representa</span><span>Me representa muito</span></div>
    <div class="scale-btns">
      ${[1,2,3,4,5].map(v=>`
        <button class="scale-btn ${sel===v?'selected':''}" data-val="${v}"
          style="--ac:${a.color}" onclick="selectScore('${a.id}',${v},${idx})"
          title="${HINTS[v-1]}"></button>
      `).join('')}
    </div>
    <div class="scale-hint" id="scale-hint">${sel?HINTS[sel-1]:'// toque para avaliar'}</div>
    <div class="quiz-actions">
      <button class="btn-next ${sel?'ready':''}" id="btn-next" style="background:${a.color}" onclick="nextAnchor()">
        ${idx===ANCHORS.length-1?'Ver meu resultado →':'Próxima âncora →'}
      </button>
    </div>
  `;
}

function selectScore(id,val,idx){
  scores[id]=val;
  document.querySelectorAll('.scale-btn').forEach(b=>b.classList.remove('selected'));
  document.querySelector(`.scale-btn[data-val="${val}"]`).classList.add('selected');
  document.getElementById('scale-hint').textContent=HINTS[val-1];
  document.getElementById('btn-next').classList.add('ready');
  clearTimeout(window._autoNext);
  window._autoNext=setTimeout(()=>nextAnchor(),700);
}

function nextAnchor(){
  if(!scores[ANCHORS[currentA].id])return;
  currentA++;
  if(currentA>=ANCHORS.length)showResult();
  else renderAnchor(currentA);
}

function showResult(){
  showPage('page-result');
  // Ordena âncoras por score
  const ranked=[...ANCHORS].map(a=>({...a,score:scores[a.id]||0})).sort((a,b)=>b.score-a.score);
  const top=ranked[0];

  // Renderiza lista
  document.getElementById('anchors-result').innerHTML=ranked.map((a,i)=>{
    const cls=i===0?'top-1':i===1?'top-2':i===2?'top-3':'';
    const dots=Array.from({length:5},(_,d)=>d<a.score?`<span class="dot-filled" style="background:${a.color}"></span>`:`<span class="dot-empty"></span>`).join('');
    const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`;
    return `
      <div class="anchor-result-row ${cls}">
        <span class="anchor-rank ${i===0?'gold':''}">${medal}</span>
        <span class="anchor-result-icon">${_ancIco(a,20)}</span>
        <div style="flex:1;">
          <div class="anchor-result-name">${a.name}</div>
          <div class="anchor-result-desc">${a.desc.split('.')[0]}.</div>
        </div>
        <div class="anchor-score-bar"><div class="bar-dots">${dots}</div><span class="score-num">${a.score}/5</span></div>
      </div>`;
  }).join('');

  // Insight da âncora principal
  document.getElementById('insight-box').innerHTML=`
    <span class="insight-label">✦ SUA ÂNCORA PRINCIPAL · ${_ancIco(top,16)} ${top.name.toUpperCase()}</span>
    <p>${top.insight} <br><br>Âncoras secundárias que também importam para você: <strong>${ranked[1].name}</strong> e <strong>${ranked[2].name}</strong>. Busque ambientes que honrem pelo menos suas 3 âncoras mais altas.</p>
  `;

  // Salva
  const u=(capsulaDB.lsGetUser() || {});
  if(!u.uid){u.uid=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);try{capsulaDB.lsSetUser(u);}catch(_){}}
  u.ancoras={scores,topAnchor:top.id,completedAt:new Date().toISOString()};
  capsulaDB.lsSetUser(u);
  try{sessionStorage.setItem('capsula_user',JSON.stringify(u));}catch(_){}
  try{const perfis=capsulaDB.lsGetUsers();const idx=perfis.findIndex(p=>p.uid===u.uid);if(idx>=0){perfis[idx].ancoras=u.ancoras;capsulaDB.lsSetUsers(perfis);}}catch(e){}
  // Sync Supabase
  if(window.capsulaDB && u.email){ capsulaDB.saveUser(u).catch(function(e){ console.warn('[ancoras] sync:', e); }); }
}

// Proteção de rota
document.addEventListener('DOMContentLoaded', async function(){
  let _u = null;
  try { _u = await capsulaDB.ensureUserData(); } catch(_e) {}

  if (window._payments && !_payments.isPro() && !_payments.isAdmin()) {
    const _c = _payments.getCredits();
    const _hasSpec = (_c['ancoras'] || 0) > 0, _hasAvul = (_c.avulsos || 0) > 0;
    if (!_hasSpec && !_hasAvul) {
      _payments.showPaywall('ancoras');
      const _gate = new MutationObserver(function() {
        if (!document.getElementById('_paywall-modal')) {
          _gate.disconnect();
          if (!_payments.hasAccess('ancoras')) window.location.href = 'dashboard.html';
        }
      });
      _gate.observe(document.body, { childList: true, subtree: true });
      return;
    }
    if (!_hasSpec && _hasAvul) await _payments.unlockMatrix('ancoras');
  }

  if (_u && _u.ancoras && _u.ancoras.completedAt && _u.ancoras.scores) {
    scores = _u.ancoras.scores;
    _isLoadingExisting = true;
    showResult();
    return;
  }

  if (!_u || (!_u.nome && !_u.apelido && !_u.email)) {
    window.location.href = 'index.html';
    return;
  }
  if (!_u.uid) { _u.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); try { capsulaDB.lsSetUser(_u); } catch(_) {} }
});

function generatePDF(){
  if (window._payments) {
    _payments.serverDebitCredit('ancoras').then(function(ok) {
      if (!ok) { _payments.showPaywall('ancoras'); return; }
      _generatePDF();
    });
    return;
  }
  _generatePDF();
}
function _generatePDF(){
  const u=(capsulaDB.lsGetUser()||{});
  const nome=u.apelido||u.nome||'Usuário';
  const data=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  const ACCENT='#2EC4A0';
  const ranked=[...ANCHORS].map(a=>({...a,score:scores[a.id]||0})).sort((a,b)=>b.score-a.score);
  const top=ranked[0], bot=ranked[ranked.length-1];

  // Radar 5-axis (pentagon) with scores normalized 0-5 → 0-100
  const AXIS5=[{k:0,ox:130,oy:42},{k:1,ox:214,oy:103},{k:2,ox:182,oy:201},{k:3,ox:78,oy:201},{k:4,ox:46,oy:103}];
  const radarPts5=AXIS5.map(({k,ox,oy})=>{const s=(ranked[k]?.score||0)/5;return`${(130+(ox-130)*s).toFixed(1)},${(130+(oy-130)*s).toFixed(1)}`;}).join(' ');
  const radarDots5=AXIS5.map(({k,ox,oy})=>{const s=(ranked[k]?.score||0)/5;const cx=(130+(ox-130)*s).toFixed(1),cy=(130+(oy-130)*s).toFixed(1);return`<circle cx="${cx}" cy="${cy}" r="3" fill="${ranked[k]?.color||ACCENT}" stroke="#f8fafc" stroke-width="1.5"/>`;}).join('');
  const radarLabels5=[
    `<text x="130" y="36" text-anchor="middle" font-family="Space Mono,monospace" font-size="6.5" fill="${ranked[0]?.color||ACCENT}" font-weight="700">${ranked[0]?.name?.toUpperCase().slice(0,10)||''}</text>`,
    `<text x="220" y="101" text-anchor="start" font-family="Space Mono,monospace" font-size="6" fill="${ranked[1]?.color||ACCENT}">${ranked[1]?.name?.toUpperCase().slice(0,10)||''}</text>`,
    `<text x="186" y="214" text-anchor="start" font-family="Space Mono,monospace" font-size="6" fill="${ranked[2]?.color||ACCENT}">${ranked[2]?.name?.toUpperCase().slice(0,10)||''}</text>`,
    `<text x="74" y="214" text-anchor="end" font-family="Space Mono,monospace" font-size="6" fill="${ranked[3]?.color||ACCENT}">${ranked[3]?.name?.toUpperCase().slice(0,10)||''}</text>`,
    `<text x="40" y="101" text-anchor="end" font-family="Space Mono,monospace" font-size="6" fill="${ranked[4]?.color||ACCENT}">${ranked[4]?.name?.toUpperCase().slice(0,10)||''}</text>`,
  ].join('');

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
.dom-icon-box{width:48px;height:48px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;}
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
.t-ico{font-size:14px;flex-shrink:0;}.t-name{font-size:8.5px;font-weight:700;}.t-pct{font-family:'Space Mono',monospace;font-size:7.5px;}
.t-arrow{font-family:'Space Mono',monospace;font-size:9px;color:#a1a1aa;flex-shrink:0;}
.tension-note{font-size:7.5px;color:#71717a;line-height:1.65;margin-top:6px;text-align:center;}
.sr{display:flex;align-items:center;gap:7px;padding:4px 0;border-bottom:1px solid #f1f5f9;}
.sr-rank{font-family:'Space Mono',monospace;font-size:7px;color:#a1a1aa;min-width:14px;}
.sr-ico{font-size:13px;width:20px;text-align:center;flex-shrink:0;}
.sr-name{font-size:9px;font-weight:700;flex:1;}.sr-dots{display:flex;gap:3px;align-items:center;}
.sr-score{font-family:'Space Mono',monospace;font-size:7.5px;min-width:28px;text-align:right;}
.ft{padding-top:9px;border-top:2px solid #000;display:flex;justify-content:space-between;align-items:center;margin-top:9px;flex-shrink:0;}
.ft-l{font-family:'Space Mono',monospace;font-size:6px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;}
.ft-r{font-family:'Space Mono',monospace;font-size:7.5px;font-weight:700;color:#000;}
@media print{@page{margin:0;size:A4;}body{background:#f8fafc!important;}.page{width:100%;}}`.split('ACC').join(ACCENT);

  const rankingHTML = ranked.map((a,i)=>{
    const last=i===ranked.length-1?'border-bottom:none;':'';
    const dots=Array.from({length:5},(_,d)=>`<span style="width:7px;height:7px;border-radius:50%;background:${d<a.score?a.color:'#e4e4e7'};display:inline-block;"></span>`).join('');
    return `<div class="sr" style="${last}"><span class="sr-rank">${String(i+1).padStart(2,'0')}</span><span class="sr-ico">${_ancIco(a,14)}</span><span class="sr-name" style="color:${i===0?a.color:'#000'};">${a.name}</span><div class="sr-dots">${dots}</div><span class="sr-score" style="color:${a.color};">${a.score}/5</span></div>`;
  }).join('');

  const chipsHTML = ranked.slice(0,3).map(a=>`<span class="chip" style="color:${a.color};border-color:${a.color}40;background:${a.color}08;">${a.name}</span>`).join('');

  _imprimirPDF(`<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8"><title>Âncoras de Carreira — ${nome} · Sistema Gnosis</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>${_gnCss}</style></head><body><div class="page">
  <div class="hd">
    <div class="brand"><svg viewBox="0 0 100 100" fill="none" width="26" height="26"><path d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C59.66 15 68.38 18.91 74.72 25.22" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><path d="M85 50H55" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><circle cx="85" cy="50" r="4" fill="${ACCENT}"/></svg><span class="brand-name">SISTEMA <em>Gnosis</em></span></div>
    <div class="hd-meta">Módulo: Âncoras de Carreira · Edgar Schein<br>${data.toUpperCase()}<br>${nome.toUpperCase()}</div>
  </div>
  <div class="grid">
    <div class="col">
      <div class="pn">
        <div class="lbl">Âncora_Dominante</div>
        <div class="dom-hero">
          <div class="dom-icon-box" style="background:${top.color}12;border:1px solid ${top.color}35;">${_ancIco(top,28)}</div>
          <div>
            <div class="dom-ew">Resultado · Âncoras de Carreira</div>
            <div class="dom-name" style="color:${top.color};">${top.name}</div>
          </div>
        </div>
        <div class="arch-badge" style="color:${top.color};border-color:${top.color}40;background:${top.color}08;">${top.score}/5 pontos · âncora principal</div>
        <p class="arch-desc">${top.desc}</p>
      </div>
      <div class="pn-grow">
        <div class="lbl">Análise_do_Perfil</div>
        <div class="ins-lbl">Síntese Vocacional</div>
        <p class="ins-txt">${top.insight}</p>
        <div class="chips-row">${chipsHTML}</div>
        <div class="tension-box">
          <div class="tension-lbl">// Zona de Tensão · Âncoras Opostas</div>
          <div class="tension-row">
            <div class="t-arch" style="border-color:${top.color}35;background:${top.color}08;">
              <span class="t-ico">${_ancIco(top,16)}</span>
              <div><div class="t-name" style="color:${top.color};">${top.name}</div><div class="t-pct" style="color:${top.color};">${top.score}/5 · dominante</div></div>
            </div>
            <div class="t-arrow">⟷</div>
            <div class="t-arch" style="border-color:${bot.color}35;background:${bot.color}06;">
              <span class="t-ico">${_ancIco(bot,16)}</span>
              <div><div class="t-name" style="color:${bot.color};">${bot.name}</div><div class="t-pct" style="color:${bot.color};">${bot.score}/5 · menor ênfase</div></div>
            </div>
          </div>
          <p class="tension-note">A forte orientação para ${top.name.toLowerCase()} (${top.score}/5) contrasta com a menor prioridade dada a ${bot.name.toLowerCase()} (${bot.score}/5). Esse eixo revela o que você não abriria mão em sua carreira.</p>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="pn" style="flex-shrink:0;">
        <div class="lbl">Ranking_Âncoras</div>
        <div style="padding-top:5px;">${rankingHTML}</div>
      </div>
      <div class="pn-grow">
        <div class="lbl">Mapa_Visual_Âncoras</div>
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
            ${radarLabels5}
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div class="ft"><span class="ft-l">Sistema Gnosis // Âncoras de Carreira // Edgar Schein // Confidencial</span><span class="ft-r">www.sistema-gnosis.com.br</span></div>
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
  iframe.onload=function(){setTimeout(function(){try{iframe.contentWindow.focus();iframe.contentWindow.print();}catch(e){var blob=new Blob([html],{type:'text/html'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='ancoras-carreira.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}},700);};
}

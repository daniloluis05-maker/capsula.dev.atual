// 56 adjetivos clássicos de Johari
const ALL_ADJECTIVES = [
  'Adaptável','Alegre','Amigável','Analítico','Assertivo','Atencioso',
  'Audacioso','Calmo','Capaz','Cuidadoso','Comunicativo','Confiante',
  'Criativo','Criterioso','Dedicado','Determinado','Diplomático','Disciplinado',
  'Empático','Energético','Entusiasmado','Estratégico','Extrovertido','Flexível',
  'Focado','Generoso','Honesto','Humilde','Independente','Influente',
  'Intuitivo','Justo','Líder','Leal','Lógico','Metódico',
  'Motivador','Objetivo','Observador','Organizado','Paciente','Persistente',
  'Positivo','Preciso','Proativo','Reflexivo','Resiliente','Responsável',
  'Sensível','Sincero','Sociável','Sistemático','Tolerante','Tranquilo',
  'Versátil','Visionário'
];

let step = 1; // 1 = eu mesmo, 2 = como os outros me veem
let selfSelected = new Set();
let _isLoadingExisting = false;
let othersSelected = new Set();

function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0);}

function startForm(){step=1;selfSelected=new Set();othersSelected=new Set();showPage('page-form');renderStep();}

function goBack(){if(step===1)showPage('page-intro');else{step=1;renderStep();}}

function renderStep(){
  const isStep1 = step === 1;
  const currentSet = isStep1 ? selfSelected : othersSelected;

  document.getElementById('step-indicator').textContent = `ETAPA ${step} DE 2`;

  document.getElementById('step-header').innerHTML = isStep1 ? `
    <span class="step-tag" style="color:var(--accent)">// etapa 1 — autopercepção</span>
    <div class="step-title">Como você se vê?</div>
    <div class="step-desc">Selecione os adjetivos que melhor descrevem sua personalidade e comportamento habitual. Seja honesto — não há resposta certa.</div>
    <div class="step-count" id="step-count">${currentSet.size} selecionados</div>
  ` : `
    <span class="step-tag" style="color:var(--cego)">// etapa 2 — percepção externa</span>
    <div class="step-title">Como os outros te veem?</div>
    <div class="step-desc">Agora selecione os adjetivos que pessoas próximas (colegas, amigos, família) usariam para te descrever. Pense em feedbacks que já recebeu.</div>
    <div class="step-count" id="step-count">${currentSet.size} selecionados</div>
  `;

  document.getElementById('chips-wrap').innerHTML = ALL_ADJECTIVES.map(adj => `
    <span class="chip ${currentSet.has(adj)?'selected':''}" onclick="toggleChip('${adj}')">${adj}</span>
  `).join('');

  updateCount();
}

function toggleChip(adj){
  const currentSet = step===1 ? selfSelected : othersSelected;
  if(currentSet.has(adj))currentSet.delete(adj);
  else currentSet.add(adj);
  document.querySelectorAll('.chip').forEach(c=>{
    c.classList.toggle('selected', currentSet.has(c.textContent));
  });
  updateCount();
}

function updateCount(){
  const currentSet = step===1 ? selfSelected : othersSelected;
  const n = currentSet.size;
  const countEl = document.getElementById('count-num');
  if(countEl)countEl.textContent = n;
  const stepCount = document.getElementById('step-count');
  if(stepCount)stepCount.textContent = `${n} selecionados`;
  const btn = document.getElementById('btn-next');
  const hint = document.getElementById('form-hint');
  if(n>=5){
    btn.classList.add('ready');
    if(hint)hint.textContent = '// bom! pode avançar quando quiser';
    if(btn)btn.textContent = step===1?'Próxima etapa →':'Ver resultado →';
  } else {
    btn.classList.remove('ready');
    if(hint)hint.textContent = `// selecione pelo menos ${5-n} ${5-n===1?'mais':''}`;
  }
}

function nextStep(){
  if(step===1){step=2;renderStep();}
  else showResult();
}

function showResult(){
  showPage('page-result');

  // Calcula quadrantes
  const self = selfSelected;
  const others = othersSelected;
  const allAdj = new Set([...ALL_ADJECTIVES]);

  const aberto    = [...self].filter(a=>others.has(a));          // ambos sabem
  const cego      = [...others].filter(a=>!self.has(a));         // outros sabem, eu não
  const oculto    = [...self].filter(a=>!others.has(a));         // eu sei, outros não
  const desconhecido = [...allAdj].filter(a=>!self.has(a)&&!others.has(a)).slice(0,6); // ninguém sabe — amostra

  function renderPane(items, color, emptyMsg){
    if(items.length===0)return`<span class="pane-empty">${emptyMsg}</span>`;
    return items.map(a=>`<span class="result-chip" style="border-color:${color}44;color:${color};background:${color}10;">${a}</span>`).join('');
  }

  document.getElementById('johari-window').innerHTML = `
    <div class="johari-pane pane-aberto">
      <div class="pane-head">
        <span class="pane-dot" style="background:var(--aberto);box-shadow:0 0 8px var(--aberto)"></span>
        <div><div class="pane-name" style="color:var(--aberto)">Área Aberta</div><div class="pane-desc">você sabe · outros sabem</div></div>
      </div>
      <div class="pane-chips">${renderPane(aberto,'#1BA8D4','// nenhum adjetivo em comum — amplie a área aberta compartilhando mais sobre você.')}</div>
    </div>
    <div class="johari-pane">
      <div class="pane-head">
        <span class="pane-dot" style="background:var(--cego)"></span>
        <div><div class="pane-name" style="color:var(--cego)">Área Cega</div><div class="pane-desc">você não vê · outros veem</div></div>
      </div>
      <div class="pane-chips">${renderPane(cego,'#E8603A','// sem pontos cegos aparentes — você e os outros têm percepção similar.')}</div>
    </div>
    <div class="johari-pane">
      <div class="pane-head">
        <span class="pane-dot" style="background:var(--oculto)"></span>
        <div><div class="pane-name" style="color:var(--oculto)">Área Oculta</div><div class="pane-desc">você sabe · outros não veem</div></div>
      </div>
      <div class="pane-chips">${renderPane(oculto,'#6C5FE6','// você parece muito transparente — os outros já enxergam o que você sente.')}</div>
    </div>
    <div class="johari-pane">
      <div class="pane-head">
        <span class="pane-dot" style="background:var(--desconhecido)"></span>
        <div><div class="pane-name" style="color:var(--muted)">Área Desconhecida</div><div class="pane-desc">potencial inexplorado</div></div>
      </div>
      <div class="pane-chips">${renderPane(desconhecido,'#6B6980','// toda a lista foi explorada — incrível nível de autoconhecimento!')}</div>
    </div>
  `;

  // Insight personalizado
  const areaGrande = aberto.length>oculto.length&&aberto.length>cego.length?'Aberta':
    cego.length>oculto.length&&cego.length>aberto.length?'Cega':
    oculto.length>cego.length&&oculto.length>aberto.length?'Oculta':'Aberta';
  const insights = {
    'Aberta': `Sua Área Aberta é grande (${aberto.length} traços) — você é transparente e fácil de conhecer. Isso gera confiança e conexão rápida. Para crescer, foque em reduzir a Área Cega pedindo feedback regular.`,
    'Cega': `Você tem ${cego.length} traços que os outros veem mas você não percebe em si mesmo. Isso é uma oportunidade de ouro — peça feedback específico sobre como você aparece para as pessoas. Muitas dessas são forças que você subestima.`,
    'Oculta': `Você tem ${oculto.length} traços que conhece mas não compartilha. Isso pode criar distância nas relações. Experimente ser mais aberto — vulnerabilidade estratégica aumenta a influência e a confiança.`,
  };

  document.getElementById('insight-box').innerHTML = `
    <span class="insight-label">✦ ÁREA PREDOMINANTE · ${areaGrande.toUpperCase()}</span>
    <p>${insights[areaGrande]}</p>
  `;

  // Salva
  const u=(capsulaDB.lsGetUser() || {});
  if(!u.uid){u.uid=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);try{capsulaDB.lsSetUser(u);}catch(_){}}
  u.johari={self:[...self],others:[...others],aberto,cego,oculto,completedAt:new Date().toISOString()};
  capsulaDB.lsSetUser(u);
  try{sessionStorage.setItem('capsula_user',JSON.stringify(u));}catch(_){}
  try{const perfis=capsulaDB.lsGetUsers();const idx=perfis.findIndex(p=>p.uid===u.uid);if(idx>=0){perfis[idx].johari=u.johari;capsulaDB.lsSetUsers(perfis);}}catch(e){}
  // Sync Supabase
  if(window.capsulaDB && u.email){ capsulaDB.saveUser(u).catch(function(e){ console.warn('[johari] sync:', e); }); }
}

// Proteção de rota
document.addEventListener('DOMContentLoaded', async function(){
  // Carrega sessão antes de qualquer verificação de dados
  let _u = null;
  try { _u = await capsulaDB.ensureUserData(); } catch(_e) {}

  if (window._payments && !_payments.isPro() && !_payments.isAdmin()) {
    const _c = _payments.getCredits();
    const _hasSpec = (_c['johari'] || 0) > 0, _hasAvul = (_c.avulsos || 0) > 0;
    if (!_hasSpec && !_hasAvul) {
      _payments.showPaywall('johari');
      const _gate = new MutationObserver(function() {
        if (!document.getElementById('_paywall-modal')) {
          _gate.disconnect();
          if (!_payments.hasAccess('johari')) window.location.href = 'dashboard.html';
        }
      });
      _gate.observe(document.body, { childList: true, subtree: true });
      return;
    }
    if (!_hasSpec && _hasAvul) await _payments.unlockMatrix('johari');
  }

  function _findJohari() {
    try {
      const u = capsulaDB.lsGetUser() || {};
      const sessionEmail = _u && _u.email ? _u.email.toLowerCase() : null;
      if (!sessionEmail) return null;
      if (u.email && u.email.toLowerCase() !== sessionEmail) return null;
      if (u.johari && u.johari.completedAt && u.johari.self) return u.johari;
    } catch(_) {}
    return null;
  }

  const _saved = _findJohari();
  if (_saved) {
    selfSelected = new Set(_saved.self || []);
    othersSelected = new Set(_saved.others || []);
    _isLoadingExisting = true;
    showPage('page-result');
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
    _payments.serverDebitCredit('johari').then(function(ok) {
      if (!ok) { _payments.showPaywall('johari'); return; }
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
  const ACCENT='#1BA8D4';
  const aberto=[...selfSelected].filter(a=>othersSelected.has(a));
  const cego=[...othersSelected].filter(a=>!selfSelected.has(a));
  const oculto=[...selfSelected].filter(a=>!othersSelected.has(a));
  // ── PDF v2: 2-col uniform layout ──
  const mainRec = cego.length>oculto.length
    ? `Sua Área Cega (${cego.length} traços) é maior que a Oculta (${oculto.length}), sugerindo que os outros percebem qualidades ou padrões que você ainda não reconhece em si. Peça feedback regular e esteja aberto a perspectivas externas.`
    : `Sua Área Oculta (${oculto.length} traços) é maior que a Cega (${cego.length}), indicando que você guarda mais do que compartilha. Ampliar a Área Aberta através de mais vulnerabilidade seletiva fortalece seus vínculos profissionais e pessoais.`;

  const panes=[
    {title:'Área Aberta',desc:'você sabe · outros sabem',color:'#1BA8D4',items:aberto},
    {title:'Área Cega',desc:'você não vê · outros veem',color:'#E8603A',items:cego},
    {title:'Área Oculta',desc:'você sabe · outros não veem',color:'#6C5FE6',items:oculto},
    {title:'Área Desconhecida',desc:'potencial a explorar',color:'#71717a',items:[],empty:'Traços a descobrir com o tempo.'},
  ];

  const _gnCss_jh = `*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Inter',sans-serif;background:#f8fafc;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.page{width:794px;height:1123px;overflow:hidden;margin:0 auto;padding:24px 34px;background:#f8fafc;display:flex;flex-direction:column;}
.hd{display:flex;justify-content:space-between;align-items:center;padding-bottom:11px;border-bottom:2px solid #000;margin-bottom:13px;flex-shrink:0;}
.brand{display:flex;align-items:center;gap:7px;}.brand-name{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;}.brand-name em{color:ACC;font-style:italic;font-weight:300;}
.hd-meta{font-family:'Space Mono',monospace;font-size:7px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;text-align:right;line-height:1.85;}
.grid{display:grid;grid-template-columns:1fr 1.2fr;gap:11px;flex:1;min-height:0;}.col{display:flex;flex-direction:column;gap:9px;min-height:0;overflow:hidden;}
.pn{background:#fafafa;border:1px solid #000;padding:13px 15px;position:relative;flex-shrink:0;}
.pn-grow{background:#fff;border:1px solid #000;padding:13px 15px;position:relative;flex:1;min-height:0;display:flex;flex-direction:column;}
.lbl{position:absolute;top:-8px;left:12px;background:#000;color:#fff;font-family:'Space Mono',monospace;font-size:6.5px;padding:1px 7px;text-transform:uppercase;letter-spacing:0.15em;}
.dom-hero{display:flex;align-items:center;gap:11px;margin-bottom:9px;}
.dom-ew{font-family:'Space Mono',monospace;font-size:7px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:ACC;margin-bottom:2px;}
.dom-name{font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:1.1;}
.ins-lbl{font-family:'Space Mono',monospace;font-size:6.5px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:ACC;margin-bottom:7px;display:flex;align-items:center;gap:5px;flex-shrink:0;}
.ins-lbl::before{content:'';width:14px;height:2px;background:ACC;border-radius:2px;display:inline-block;}
.ins-txt{font-size:8.5px;color:#444;line-height:1.75;flex-shrink:0;}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px;flex-shrink:0;}
.stat{border:1px solid;padding:8px 10px;border-radius:2px;}
.stat-n{font-size:22px;font-weight:900;line-height:1;}.stat-lbl{font-family:'Space Mono',monospace;font-size:6px;text-transform:uppercase;letter-spacing:0.1em;margin-top:3px;}
.rec-box{margin-top:9px;padding-top:9px;border-top:1px solid #e4e4e7;flex:1;display:flex;flex-direction:column;justify-content:center;}
.rec-lbl{font-family:'Space Mono',monospace;font-size:6.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;margin-bottom:7px;}
.rec-txt{font-size:8px;color:#444;line-height:1.7;}
.pane-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;min-height:0;}
.pane{background:#fafafa;border:1px solid #e4e4e7;padding:10px 12px;display:flex;flex-direction:column;overflow:hidden;}
.pane-title{font-size:9px;font-weight:700;margin-bottom:2px;}
.pane-desc{font-family:'Space Mono',monospace;font-size:6px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #f1f5f9;}
.chips-wrap{display:flex;flex-wrap:wrap;gap:3px;overflow:hidden;}
.chip{font-family:'Space Mono',monospace;font-size:6px;padding:2px 5px;border:1px solid;text-transform:uppercase;letter-spacing:0.06em;}
.ft{padding-top:9px;border-top:2px solid #000;display:flex;justify-content:space-between;align-items:center;margin-top:9px;flex-shrink:0;}
.ft-l{font-family:'Space Mono',monospace;font-size:6px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;}
.ft-r{font-family:'Space Mono',monospace;font-size:7.5px;font-weight:700;color:#000;}
@media print{@page{margin:0;size:A4;}body{background:#f8fafc!important;}.page{width:100%;}}`.split('ACC').join(ACCENT);

  const panesHTML = panes.map(p=>{
    const chips = p.items.length>0
      ? `<div class="chips-wrap">${p.items.map(a=>`<span class="chip" style="border-color:${p.color}40;color:${p.color};background:${p.color}07;">${a}</span>`).join('')}</div>`
      : `<span style="font-family:'Space Mono',monospace;font-size:8px;color:#a1a1aa;">${p.empty||'// nenhum traço'}</span>`;
    return `<div class="pane" style="border-left:3px solid ${p.color};">
      <div class="pane-title" style="color:${p.color};">${p.title}</div>
      <div class="pane-desc">${p.desc}</div>
      ${chips}
    </div>`;
  }).join('');

  _imprimirPDF(`<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8"><title>Janela de Johari — ${nome} · Sistema Gnosis</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>${_gnCss_jh}</style></head><body><div class="page">
  <div class="hd">
    <div class="brand"><svg viewBox="0 0 100 100" fill="none" width="26" height="26"><path d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C59.66 15 68.38 18.91 74.72 25.22" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><path d="M85 50H55" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/><circle cx="85" cy="50" r="4" fill="${ACCENT}"/></svg><span class="brand-name">SISTEMA <em>Gnosis</em></span></div>
    <div class="hd-meta">Módulo: Janela de Johari · Autopercepção<br>${data.toUpperCase()}<br>${nome.toUpperCase()}</div>
  </div>
  <div class="grid">
    <div class="col">
      <div class="pn">
        <div class="lbl">Resultado_Johari</div>
        <div>
          <div class="dom-ew">Resultado · Janela de Johari</div>
          <div class="dom-name" style="color:${ACCENT};">Janela de Johari</div>
        </div>
        <div class="stat-grid">
          <div class="stat" style="border-color:#1BA8D430;background:#1BA8D407;"><div class="stat-n" style="color:#1BA8D4;">${aberto.length}</div><div class="stat-lbl" style="color:#1BA8D4;">Área Aberta</div></div>
          <div class="stat" style="border-color:#E8603A30;background:#E8603A07;"><div class="stat-n" style="color:#E8603A;">${cego.length}</div><div class="stat-lbl" style="color:#E8603A;">Área Cega</div></div>
          <div class="stat" style="border-color:#6C5FE630;background:#6C5FE607;"><div class="stat-n" style="color:#6C5FE6;">${oculto.length}</div><div class="stat-lbl" style="color:#6C5FE6;">Área Oculta</div></div>
        </div>
      </div>
      <div class="pn-grow">
        <div class="lbl">Análise_do_Perfil</div>
        <div class="ins-lbl">Síntese Johari</div>
        <p class="ins-txt">A Janela de Johari mapeia quatro quadrantes de autopercepção em relação a como os outros te enxergam. A área aberta (${aberto.length} traços) reflete alinhamento entre sua autopercepção e a percepção externa. É o terreno de maior confiança e efetividade relacional.</p>
        <div class="rec-box">
          <div class="rec-lbl">// Recomendação Principal</div>
          <p class="rec-txt">${mainRec}</p>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="pn-grow" style="flex:1;">
        <div class="lbl">Mapa_das_Quatro_Áreas</div>
        <div class="pane-grid" style="margin-top:8px;">${panesHTML}</div>
      </div>
    </div>
  </div>
  <div class="ft"><span class="ft-l">Sistema Gnosis // Janela de Johari // Autopercepção // Confidencial</span><span class="ft-r">capsula-dev-atualizado.vercel.app</span></div>
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
  iframe.onload=function(){setTimeout(function(){try{iframe.contentWindow.focus();iframe.contentWindow.print();}catch(e){var blob=new Blob([html],{type:'text/html'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='johari.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}},700);};
}

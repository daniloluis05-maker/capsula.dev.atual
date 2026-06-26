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
  if (window.gnosisTrack) gnosisTrack('quiz_completed', { matriz: 'johari' });
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

  // Bloco "E agora?"
  if (window.gnosisPostResult) {
    window.gnosisPostResult.render({
      fromKey: 'johari',
      resultLabel: 'Área predominante: ' + areaGrande,
      containerId: 'page-result',
    });
  }
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
  const data=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  const aberto=[...selfSelected].filter(a=>othersSelected.has(a));
  const cego=[...othersSelected].filter(a=>!selfSelected.has(a));
  const oculto=[...selfSelected].filter(a=>!othersSelected.has(a));

  const mainRec = cego.length > oculto.length
    ? 'Sua Área Cega (' + cego.length + ' traços) é maior que a Oculta (' + oculto.length + '), sugerindo que os outros percebem qualidades ou padrões que você ainda não reconhece em si. Peça feedback regular e esteja aberto a perspectivas externas.'
    : 'Sua Área Oculta (' + oculto.length + ' traços) é maior que a Cega (' + cego.length + '), indicando que você guarda mais do que compartilha. Ampliar a Área Aberta através de mais vulnerabilidade seletiva fortalece seus vínculos profissionais e pessoais.';

  // Tabela 2x2 das áreas no customSection
  const renderArea = (title, desc, traits, emptyMsg) => {
    const chips = traits.length > 0
      ? '<div style="display:flex;flex-wrap:wrap;gap:5px;">' + traits.map(t => '<span style="font-family:IBM Plex Mono,monospace;font-size:9px;padding:3px 8px;border:1px solid #7C6FF740;color:#7C6FF7;background:#7C6FF708;border-radius:3px;text-transform:uppercase;letter-spacing:0.04em;">'+t+'</span>').join('') + '</div>'
      : '<span style="font-size:11px;color:#a1a1aa;font-style:italic;">'+(emptyMsg||'— nenhum traço aqui')+'</span>';
    return '<div style="background:#fff;border:1px solid #e4e4e7;border-radius:8px;padding:14px 16px;border-top:3px solid #7C6FF7;">'
      + '<div style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#7C6FF7;font-weight:500;margin-bottom:2px;">'+title+'</div>'
      + '<div style="font-family:IBM Plex Mono,monospace;font-size:9px;color:#71717a;margin-bottom:10px;">'+desc+'</div>'
      + chips + '</div>';
  };
  const areasGrid = '<div style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:0.12em;color:#7C6FF7;text-transform:uppercase;font-weight:500;margin-bottom:12px;">Suas 4 áreas</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
    + renderArea('Área Aberta', 'você sabe · outros sabem', aberto)
    + renderArea('Área Cega', 'você não vê · outros veem', cego)
    + renderArea('Área Oculta', 'você sabe · outros não veem', oculto)
    + renderArea('Área Desconhecida', 'potencial a explorar', [], 'Traços a descobrir com o tempo.')
    + '</div>';

  Gnosis.pdf.render({
    matrizName: 'Janela de Johari',
    matrizSubname: 'Autopercepção relacional',
    userName: nome,
    date: data,
    hero: {
      letter: '▦',
      eyebrow: 'Mapa de Autopercepção',
      title: 'Quatro Áreas',
      subtitle: 'A Janela de Johari mapeia o que você sabe sobre si × o que os outros enxergam. A área aberta reflete confiança e efetividade relacional; as outras três indicam onde há espaço de crescimento.',
    },
    dimensionsLabel: 'Distribuição dos traços',
    dimensions: [
      { letter: aberto.length.toString(), name: 'Área Aberta',  pct: Math.min(100, aberto.length * 10), isDominant: aberto.length >= cego.length && aberto.length >= oculto.length },
      { letter: cego.length.toString(),   name: 'Área Cega',    pct: Math.min(100, cego.length * 10),   isDominant: false },
      { letter: oculto.length.toString(), name: 'Área Oculta',  pct: Math.min(100, oculto.length * 10), isDominant: false },
    ],
    analysisLabel: 'Análise relacional',
    analysisBlocks: [
      { eyebrow: 'Síntese',         title: 'Sua janela',                text: 'A área aberta (' + aberto.length + ' traços) reflete alinhamento entre sua autopercepção e como os outros te veem. É o terreno de maior confiança e produtividade nas suas relações.' },
      { eyebrow: 'Recomendação',    title: 'Próximo passo',             text: mainRec },
    ],
    customSection: areasGrid,
    citation: 'Luft, J., &amp; Ingham, H. (1955). <em>The Johari Window.</em>',
    filename: 'johari.html',
  });
}

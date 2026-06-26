// #6: Cliente Supabase centralizado em js/db.js
var db = (typeof capsulaDB !== "undefined") ? capsulaDB.getDB() : null;

function initDate(){
  const now=new Date(),h=now.getHours();
  const s=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
  const dias=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const meses=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  document.getElementById('greeting-date').textContent=`${s} · ${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]}`;
}

async function loadUser(){
  const lsRaw = localStorage.getItem('capsula_user');
  const ssRaw = sessionStorage.getItem('capsula_user');
  const isNew = sessionStorage.getItem('capsula_is_new_user') === '1';

  // Caminho rápido: dados locais existem → carrega sem aguardar Auth
  if (!lsRaw && !ssRaw) {
    // Sem dados locais — pode ser:
    //   (a) user veio de Google OAuth e o supabase-js ainda está
    //       persistindo o token (race com auth-callback) → retry resolve
    //   (b) user nunca logou → redireciona pra index
    // Por isso fazemos retry com backoff antes de desistir.
    let authUser = null;
    const MAX_ATTEMPTS = 5;
    for (let attempt = 0; attempt < MAX_ATTEMPTS && !authUser; attempt++) {
      try {
        const { session } = await capsulaDB.authGetSession();
        if (session) { authUser = session.user; break; }
      } catch(e) { console.warn('[dashboard] authGetSession:', e); }
      // Backoff: 0ms, 300ms, 600ms, 1000ms, 1500ms (total ~3.4s)
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise(r => setTimeout(r, 300 + attempt * 200));
      }
    }

    if (!authUser) {
      window.location.href = 'index.html';
      return;
    }
    // Sessão Auth existe mas sem localStorage → cria perfil local
    try {
      const profile = await capsulaDB.authLoadUserProfile(authUser);
      capsulaDB.lsSetUser(profile);
    } catch(e) { console.warn('[dashboard] loadProfile:', e); }
  }

  // Sincroniza sessionStorage → localStorage se necessário
  if (ssRaw && !lsRaw) capsulaDB.lsSetRaw('capsula_user', ssRaw);

  if (isNew) sessionStorage.removeItem('capsula_is_new_user');

  const finalRaw = localStorage.getItem('capsula_user') || ssRaw;
  if (!finalRaw) { window.location.href = 'index.html'; return; }

  const u = JSON.parse(finalRaw);
  applyUser(u.nome, u.apelido);

  if (isNew) {
    showToast(u.apelido || (u.nome ? u.nome.split(' ')[0] : 'Usuário'));
    const eqNome = localStorage.getItem('capsula_invitedEquipeNome');
    if (eqNome) {
      localStorage.removeItem('capsula_invitedEquipe');
      localStorage.removeItem('capsula_invitedEquipeNome');
      setTimeout(() => eqToast('Convidado para: ' + eqNome, 'Complete o DISC e peça ao gestor para te adicionar.'), 4500);
    }
  }

  loadMatrixState((capsulaDB.lsGetUser() || {}));
  renderProgressChart((capsulaDB.lsGetUser() || {}));

  // stat-dias removido do HTML mas mantém o cálculo defensivo
  if (u.criado_em) {
    const criado = new Date(u.criado_em);
    const dias = Math.max(1, Math.ceil((Date.now() - criado.getTime()) / (1000*60*60*24)));
    const dEl = document.getElementById('stat-dias');
    if (dEl) dEl.textContent = dias;
    const dSubEl = document.getElementById('stat-dias-sub');
    if (dSubEl) dSubEl.textContent = dias === 1 ? 'membro desde hoje' : 'dias na plataforma';
  }

  // ── Créditos & plano ────────────────────────────────────────
  // Durante BYPASS_PAYWALL, esconde o card de créditos inteiro — não faz
  // sentido mostrar "ilimitado / plano X" quando ninguém está pagando.
  if (window._payments) {
    const elCred  = document.getElementById('stat-creditos');
    const elLabel = document.getElementById('stat-creditos-label');
    const elSub   = document.getElementById('stat-plano-sub');
    const elCard  = document.getElementById('card-creditos');
    if (_payments.isPro()) {
      // BYPASS ou plano real ativo — mensagem neutra
      if (elCred)  elCred.textContent = '∞';
      if (elLabel) elLabel.textContent = 'acesso';
      if (elSub)   { elSub.textContent = 'Acesso liberado'; elSub.style.color = '#2EC4A0'; }
      if (elCard)  {
        elCard.style.setProperty('--stat-color', '#2EC4A0');
        elCard.style.cursor = 'default';
        elCard.onclick = null;
      }
    } else {
      const c = _payments.getCredits();
      const total = (c.avulsos || 0) + Object.entries(c).filter(([k]) => k !== 'avulsos').reduce((s,[,v]) => s + (typeof v === 'number' ? v : 0), 0);
      if (elCred)  elCred.textContent = total;
      if (elLabel) elLabel.textContent = total === 1 ? 'crédito' : 'créditos';
      if (elSub)   elSub.textContent = total > 0 ? '+ Comprar mais →' : '+ Comprar créditos →';
      if (elCard && total === 0) elCard.style.setProperty('--stat-color', 'var(--D)');
    }
  }

  // ── Seção Pro (Avaliações Remotas) ──────────────────────────
  if (window._payments && (_payments.isPro() || _payments.isAdmin())) {
    rlInitSection(u.email);
    // Modo presencial — kiosk pra avaliação no local. Mesma audiência
    // do remote-link (Pro/Gerencial/Admin), pois reusa remote_links.
    if (typeof presencialInit === 'function') presencialInit(u.email);
  }
  // ── Seção Gerencial (Acompanhamento Semanal + Equipes) ───────
  if (window._payments && (_payments.isGerencial() || _payments.isAdmin())) {
    acompInit(u.email);
    eqInit(u.email);
  }

  // ── Sincroniza com Supabase em background ──────────────────
  if (u.email) {
    capsulaDB.migrateLocalToSupabase(u.email).then(merged => {
      if (merged) {
        loadMatrixState(merged);
        renderProgressChart(merged); // ← BUG FIX: donut tava desatualizado após sync
      }
    }).catch(e => console.warn('[dashboard] sync Supabase:', e));
  }
}

// ─── PROGRESSO DAS AVALIAÇÕES — donut SVG dinâmico ───────────
function renderProgressChart(userData) {
  const matrizes = [
    { key: 'disc',    name: 'DISC',         color: '#6C5FE6', href: 'disc.html' },
    { key: 'bigfive', name: 'Big Five',     color: '#1BA8D4', href: 'bigfive.html' },
    { key: 'ikigai',  name: 'Ikigai',       color: '#F4845F', href: 'ikigai.html' },
    { key: 'johari',  name: 'Johari',       color: '#2EC4A0', href: 'johari.html' },
    { key: 'pearson', name: 'Pearson-Marr', color: '#C9A84C', href: 'pearson.html' },
    { key: 'soar',    name: 'SOAR',         color: '#7C6FF7', href: 'soar.html' },
    { key: 'tci',     name: 'TCI',          color: '#E8603A', href: 'tci.html' },
    { key: 'ancoras', name: 'Âncoras',      color: '#1BA8D4', href: 'ancoras.html' },
    { key: 'swot',    name: 'SWOT',         color: '#2EC4A0', href: 'swot.html' },
  ];

  const isDone = (m) => !!(userData[m.key] && userData[m.key].completedAt);
  const doneCount = matrizes.filter(isDone).length;
  const total = matrizes.length;

  // Donut SVG — 9 arcos
  const svg = document.getElementById('progress-donut');
  if (!svg) return;
  const cx = 100, cy = 100, r = 78, strokeWidth = 14;
  const angleEach = 360 / total;
  const gapDeg = 3;
  const ns = 'http://www.w3.org/2000/svg';

  // limpa
  svg.innerHTML = '';

  // background track (anel completo)
  const bg = document.createElementNS(ns, 'circle');
  bg.setAttribute('cx', cx); bg.setAttribute('cy', cy);
  bg.setAttribute('r', r);
  bg.setAttribute('class', 'progress-donut-bg');
  bg.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(bg);

  matrizes.forEach((m, i) => {
    const startDeg = i * angleEach + gapDeg / 2 - 90;
    const endDeg = (i + 1) * angleEach - gapDeg / 2 - 90;
    const startRad = startDeg * Math.PI / 180;
    const endRad = endDeg * Math.PI / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = (endDeg - startDeg) > 180 ? 1 : 0;
    const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', isDone(m) ? m.color : 'transparent');
    path.setAttribute('stroke-width', strokeWidth);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('fill', 'none');
    path.setAttribute('data-matriz', m.key);
    svg.appendChild(path);
  });

  // Contador central + subtitle
  const countEl = document.getElementById('progress-count');
  if (countEl) countEl.textContent = doneCount + '/' + total;

  const subtitleEl = document.getElementById('progress-subtitle');
  if (subtitleEl) {
    if (doneCount === 0) {
      subtitleEl.textContent = 'Comece sua primeira matriz pra desbloquear o DNA Estratégico.';
    } else if (doneCount < 3) {
      subtitleEl.textContent = 'Faça mais ' + (3 - doneCount) + ' matriz' + (3 - doneCount === 1 ? '' : 'es') + ' pra desbloquear o DNA Estratégico.';
    } else if (doneCount < total) {
      subtitleEl.textContent = 'Você já pode gerar o DNA Estratégico. Continue pra ter um mapeamento mais completo.';
    } else {
      subtitleEl.textContent = 'Mapeamento completo. Gere ou atualize seu DNA Estratégico.';
    }
  }

  // Lista de matrizes
  const list = document.getElementById('progress-list');
  if (list) {
    list.innerHTML = matrizes.map(m => {
      const done = isDone(m);
      return '<a href="' + m.href + '" class="progress-item' + (done ? ' done' : '') + '" data-matriz="' + m.key + '">' +
             '<span class="progress-dot" style="' + (done ? 'background:' + m.color : '') + '"></span>' +
             '<span class="progress-name">' + m.name + '</span>' +
             (done ? '<span class="progress-check">✓</span>' : '') +
             '</a>';
    }).join('');
  }
}

function loadMatrixState(userData){
  const discDone=!!(userData.disc&&userData.disc.completedAt);
  const soarData=userData.soar;
  const soarPct=soarData?Math.round(soarData.completionPct||0):0;
  const soarDone=soarPct>=80;
  const ikigaiDone=!!(userData.ikigai&&userData.ikigai.completedAt);
  const ancorasDone=!!(userData.ancoras&&userData.ancoras.completedAt);
  const johariDone=!!(userData.johari&&userData.johari.completedAt);
  const bigfiveDone=!!(userData.bigfive&&userData.bigfive.completedAt);
  const pearsonDone=!!(userData.pearson&&userData.pearson.completedAt);
  const tciDone=!!(userData.tci&&userData.tci.completedAt);
  const eneagramaDone=!!(userData.eneagrama&&userData.eneagrama.completedAt);

  const total=[discDone,soarDone,ikigaiDone,ancorasDone,johariDone,bigfiveDone,pearsonDone,tciDone,eneagramaDone].filter(Boolean).length;
  const matrizesEl = document.getElementById('stat-matrizes');
  if (matrizesEl) matrizesEl.textContent = total;
  // stat-insights e stat-insights-sub removidos do HTML — guards defensivos:
  const insightsEl = document.getElementById('stat-insights');
  if (insightsEl) insightsEl.textContent = total;
  if (total > 0) {
    const sub = total === 1 ? '1 relatório disponível' : `${total} relatórios disponíveis`;
    const insightsSubEl = document.getElementById('stat-insights-sub');
    if (insightsSubEl) insightsSubEl.textContent = sub;
  }
  // Badge "Comece aqui" no DISC para usuários sem nenhuma matriz
  const startBadge = document.getElementById('disc-start-badge');
  if (startBadge) startBadge.style.display = total === 0 ? 'inline-block' : 'none';

  function setStatus(id,done,inProgress){
    const el=document.getElementById(id);
    if(!el)return;
    if(done){el.textContent='Concluído ✓';el.classList.add('done');}
    else if(inProgress){el.textContent=inProgress;}
  }
  setStatus('disc-status',discDone);
  setStatus('soar-status',soarDone,soarPct>0?`Em andamento · ${soarPct}%`:null);
  setStatus('ikigai-status',ikigaiDone);
  setStatus('ancoras-status',ancorasDone);
  setStatus('johari-status',johariDone);
  setStatus('bigfive-status',bigfiveDone);
  setStatus('pearson-status',pearsonDone);
  setStatus('tci-status',tciDone);
  setStatus('eneagrama-status',eneagramaDone);

  // Progresso
  const discP=discDone?100:0;
  const totalP=Math.min(Math.round(10+(total/9)*90),100);
  setProgress('disc-pct','disc-fill',discP);
  setProgress('soar-pct','soar-fill',soarPct);
  setProgress('total-pct','total-fill',totalP);

  // Atividades
  const activities=[];
  const _svg={
    disc:'<rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>',
    soar:'<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    ikigai:'<circle cx="9" cy="9" r="6"/><circle cx="15" cy="9" r="6"/><circle cx="12" cy="15" r="6"/>',
    ancoras:'<circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
    johari:'<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
    bigfive:'<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    pearson:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    tci:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    eneagrama:'<polygon points="12 2 22 8 18 20 6 20 2 8"/><line x1="12" y1="2" x2="12" y2="20"/><line x1="2" y1="8" x2="22" y2="8"/>',
    dna:'<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  };
  function _actIcon(key,color){return '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:'+color+';stroke-width:1.75;fill:none;stroke-linecap:round;stroke-linejoin:round;">'+(_svg[key]||'')+'</svg>';}

  if(discDone)activities.push({icon:'disc',label:'Perfil DISC concluído',date:userData.disc.completedAt,color:'var(--D)'});
  if(soarDone)activities.push({icon:'soar',label:'Análise SOAR concluída',date:userData.soar.completedAt,color:'var(--I)'});
  else if(soarPct>0)activities.push({icon:'soar',label:`SOAR em andamento (${soarPct}%)`,date:userData.soar.completedAt||new Date().toISOString(),color:'var(--I)'});
  if(ikigaiDone)activities.push({icon:'ikigai',label:'Ikigai concluído',date:userData.ikigai.completedAt,color:'var(--D)'});
  if(ancorasDone)activities.push({icon:'ancoras',label:'Âncoras de Carreira concluídas',date:userData.ancoras.completedAt,color:'var(--S)'});
  if(johariDone)activities.push({icon:'johari',label:'Janela de Johari concluída',date:userData.johari.completedAt,color:'var(--C)'});
  if(bigfiveDone)activities.push({icon:'bigfive',label:'Big Five — OCEAN concluído',date:userData.bigfive.completedAt,color:'var(--I)'});
  if(pearsonDone)activities.push({icon:'pearson',label:'Arquétipos Pearson-Marr concluídos',date:userData.pearson.completedAt,color:'#C9A84C'});
  if(tciDone)activities.push({icon:'tci',label:'Temperamento TCI mapeado',date:userData.tci.completedAt,color:'#7000FF'});
  if(eneagramaDone)activities.push({icon:'eneagrama',label:'Eneagrama identificado',date:userData.eneagrama.completedAt,color:'#9D7FE8'});
  if(userData.dna&&userData.dna.generatedAt){const dnaEl=document.getElementById('dna-status');if(dnaEl){dnaEl.textContent='DNA gerado · '+new Date(userData.dna.generatedAt).toLocaleDateString('pt-BR');}activities.push({icon:'dna',label:'DNA Estratégico gerado',date:userData.dna.generatedAt,color:'#C9A84C'});}

  if(activities.length>0){
    const list=document.getElementById('activity-list');
    list.innerHTML=activities.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(a=>{
      const d=new Date(a.date);
      const lbl=d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
      return '<div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0;border-bottom:1px solid var(--border);">'+
        '<span style="width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;background:'+a.color.replace('var(--D)','rgba(232,96,58,0.12)').replace('var(--I)','rgba(108,95,230,0.12)').replace('var(--S)','rgba(46,196,160,0.12)').replace('var(--C)','rgba(27,168,212,0.12)')+'15;flex-shrink:0;">'+_actIcon(a.icon,a.color)+'</span>'+
        '<div style="flex:1;"><div style="font-size:0.8rem;font-weight:600;">'+a.label+'</div>'+
        '<div style="font-size:0.65rem;color:var(--muted);font-family:var(--mono);margin-top:0.1rem;">'+lbl+'</div></div>'+
        '<span style="width:6px;height:6px;border-radius:50%;background:'+a.color+';flex-shrink:0;"></span></div>';
    }).join('');
  }

  // P7 — render DISC history chart
  if (typeof renderDiscHistoryChart === 'function') renderDiscHistoryChart(userData);
}

function setProgress(pctId,fillId,value){
  const p=document.getElementById(pctId);
  const f=document.getElementById(fillId);
  if(p)p.textContent=value+'%';
  if(f)setTimeout(()=>f.style.width=value+'%',100);
}

// ── UTILITÁRIO: nome de exibição ──────────────────────────────
function getNomeExibido(userData) {
  if (!userData) return 'Usuário';
  if (userData.apelido && userData.apelido.trim()) return userData.apelido.trim();
  if (userData.nome && userData.nome.trim()) return userData.nome.trim();
  return 'Usuário';
}

function applyUser(nome,apelido){
  // Remove o skeleton shimmer assim que houver nome — sinal de que loadUser
  // resolveu (auth+localStorage) e os placeholders 0/— vão ser substituídos
  // nas próximas linhas.
  document.body.removeAttribute('data-loading');
  const ex=getNomeExibido({nome,apelido});
  document.getElementById('greeting-nome').textContent=ex;
  document.getElementById('sb-nome').textContent=nome||ex;
  document.getElementById('sb-avatar').textContent=ex.charAt(0).toUpperCase();const mob=document.getElementById('mob-avatar');if(mob)mob.textContent=ex.charAt(0).toUpperCase();
  // Atualiza badge de plano no sidebar
  const planoEl = document.getElementById('sb-plano');
  if (planoEl && window._payments) {
    if (_payments.isAdmin())          { planoEl.textContent = 'Admin · Acesso total'; planoEl.style.color = '#C9A84C'; }
    else if (_payments.isGerencial()) { planoEl.textContent = 'Plano Gerencial';      planoEl.style.color = '#2EC4A0'; }
    else if (_payments.isPro())       { planoEl.textContent = 'Plano Profissional';   planoEl.style.color = 'var(--accent)'; }
    else                              { planoEl.textContent = 'Plano Gratuito';       planoEl.style.color = ''; }
  }

  // Destrava as matrizes de equipe para admin/Gerencial
  if (window._payments && (_payments.isGerencial() || _payments.isAdmin())) {
    const note = document.getElementById('eqx-note');
    if (note) { note.textContent = 'Liberado · Plano Gerencial'; note.style.color = '#2EC4A0'; }
    document.querySelectorAll('.eqx-badge').forEach(el => {
      el.textContent = 'GERENCIAL'; el.style.background = 'rgba(46,196,160,0.12)'; el.style.color = '#2EC4A0'; el.style.borderColor = 'rgba(46,196,160,0.3)';
    });
    document.querySelectorAll('.eqx-status').forEach(el => {
      el.textContent = 'Acessar matriz'; el.style.color = '#2EC4A0';
    });
    document.querySelectorAll('.eqx-arrow').forEach(el => { el.textContent = '→'; });
    // Torna os cards clicáveis
    const links = { 'card-5w2h': '5w2h.html', 'card-raci': 'raci.html', 'card-swot-eq': 'swot-equipe.html', 'card-okrs': 'okrs.html' };
    Object.entries(links).forEach(([id, href]) => {
      const card = document.getElementById(id);
      if (card) {
        card.classList.remove('locked');
        card.style.cursor = 'pointer';
        card.onclick = () => { window.location.href = href; };
      }
    });
  }
}

function showToast(nome){
  eqToast('Bem-vindo(a), ' + nome + '!', 'Escolha uma matriz para começar.', false, 600);
}

let _toastTimer = null;
function eqToast(titulo, sub, isError, delay) {
  if (_toastTimer) clearTimeout(_toastTimer);
  const t = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  document.getElementById('toast-title').textContent = titulo;
  document.getElementById('toast-sub').textContent = sub || '';
  if (icon) icon.textContent = isError ? '!' : '✓';
  t.classList.toggle('error', !!isError);
  t.classList.remove('show');
  _toastTimer = setTimeout(() => {
    t.classList.add('show');
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
  }, delay || 50);
}

// Trocar de usuário: encerra sessão Supabase + limpa ls/ss, mas preserva
// `capsula_users[]` (lista de perfis no localStorage). Útil em computador
// compartilhado (família, kiosk parcial) — outro user pode logar sem que
// perfis antigos sumam. Logout normal limpa só o user atual também, mas
// sinaliza intenção diferente (admin saindo vs. switch user).
async function trocarUsuario(){
  if (window.gnosisTrack) gnosisTrack('user_switch', {});
  try { await capsulaDB.authSignOut(); } catch(_) {}
  sessionStorage.removeItem('capsula_user');
  localStorage.removeItem('capsula_user');
  if (window.gnosisSyncTabs) gnosisSyncTabs.broadcast('user-logout', {});
  // Vai pra index com hash que sinaliza pro modal abrir em login
  window.location.href = 'index.html#login';
}

async function logout(){
  try {
    const raw = localStorage.getItem('capsula_user');
    if (raw) {
      const u = JSON.parse(raw);
      delete u.soar_draft;
      delete u.ikigai_draft;
      const perfis = capsulaDB.lsGetUsers();
      const idx = perfis.findIndex(p => (u.uid && p.uid === u.uid) || p.email === u.email);
      if (idx >= 0) { perfis[idx] = u; capsulaDB.lsSetUsers(perfis); }
    }
  } catch(e) {}
  // Encerra sessão Supabase Auth
  try { await capsulaDB.authSignOut(); } catch(e) { console.warn('[logout] signOut:', e); }
  sessionStorage.removeItem('capsula_user');
  localStorage.removeItem('capsula_user');
  // Notifica outras abas pra também redirecionarem (caso user tenha 2+ abas abertas)
  if (window.gnosisSyncTabs) gnosisSyncTabs.broadcast('user-logout', {});
  window.location.href = 'index.html';
}

document.addEventListener("DOMContentLoaded", function() {
  if(typeof capsulaDB !== "undefined") { db = capsulaDB.getDB(); }
  initDate(); loadUser();
  // Safety net: se loadUser travar ou jogar exceção antes de applyUser, o
  // shimmer fica eterno. 6s cobre o pior caso do retry de auth (3.4s) com
  // folga. Não conflita com applyUser que remove logo no caminho feliz.
  setTimeout(() => document.body.removeAttribute('data-loading'), 6000);
});

// ── FIX CRÍTICO 2: Recarrega estado ao voltar do DISC/SOAR ────
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    const raw = localStorage.getItem('capsula_user');
    if (raw) {
      const u = JSON.parse(raw);
      loadMatrixState(u);
      renderProgressChart(u); // ← BUG FIX: donut também atualiza ao voltar de uma matriz
      // Sincroniza progresso atualizado com o Supabase
      if (u.email) {
        capsulaDB.syncMatrizes(u).catch(e => console.warn('[sync] visibilitychange:', e));
      }
    }
  }
});

// Sync entre abas: storage event (nativo) + BroadcastChannel (sync-tabs.js).
// Quando o user faz um teste em outra aba, esta aba (dashboard aberto)
// re-renderiza progresso/donut/avatar sem precisar refresh.
function _gnRerenderFrom(userData) {
  if (!userData) return;
  loadMatrixState(userData);
  renderProgressChart(userData);
  // Avatar/nome no greeting (se mudou apelido em outra aba)
  if (userData.nome || userData.apelido) {
    const ex = getNomeExibido(userData);
    const g = document.getElementById('greeting-nome'); if (g) g.textContent = ex;
    const a = document.getElementById('sb-avatar'); if (a) a.textContent = ex.charAt(0).toUpperCase();
    const m = document.getElementById('mob-avatar'); if (m) m.textContent = ex.charAt(0).toUpperCase();
  }
}

window.addEventListener('storage', function(e) {
  if (e.key === 'capsula_user' && e.newValue) {
    try { _gnRerenderFrom(JSON.parse(e.newValue)); } catch (_) {}
  }
});

// BroadcastChannel: capta eventos explícitos (logout, conclusão) que não
// disparam storage event ou que requerem tratamento especial.
if (window.gnosisSyncTabs) {
  window.gnosisSyncTabs.on('user-logout', function () {
    // Outra aba fez logout — limpa esta também e volta pra landing
    try { localStorage.removeItem('capsula_user'); } catch (_) {}
    window.location.href = 'index.html';
  });
  window.gnosisSyncTabs.on('quiz-done', function () {
    // Outra aba terminou um teste — re-lê localStorage e re-renderiza
    try {
      const raw = localStorage.getItem('capsula_user');
      if (raw) _gnRerenderFrom(JSON.parse(raw));
    } catch (_) {}
  });
}

// ── FIX CRÍTICO 3: Botão Nova Matriz ─────────────────────────
function novaMatriz() {
  // Scrolla para a seção de matrizes disponíveis
  const grid = document.querySelector('.matrices-grid');
  if (grid) {
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Pisca levemente para indicar ao usuário
    grid.style.transition = 'outline 0.3s';
    grid.style.outline = '1px solid var(--accent)';
    setTimeout(function() { grid.style.outline = 'none'; }, 1200);
  }
}

// ── FIX CRÍTICO 3: Botão Exportar ────────────────────────────
function exportarDados() {
  const raw = localStorage.getItem('capsula_user');
  if (!raw) return;
  const u = JSON.parse(raw);
  const exp = {
    exportado_em: new Date().toISOString(),
    perfil: { nome: u.nome, apelido: u.apelido, objetivo: u.objetivo, criado_em: u.criado_em },
    disc: u.disc || null,
    soar: u.soar || null,
    ikigai: u.ikigai || null,
    ancoras: u.ancoras || null,
    johari: u.johari || null,
    bigfive: u.bigfive || null,
    swot: u.swot || null,
  };
  const blob = new Blob([JSON.stringify(exp, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'capsula-' + (u.apelido || u.nome || 'perfil').replace(/\s+/g,'-').toLowerCase() + '.json';
  a.click();
  setTimeout(function() { URL.revokeObjectURL(url); }, 3000);
}

// ── Helper: scroll para seção ─────────────────────────────────
function scrollToSection(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}


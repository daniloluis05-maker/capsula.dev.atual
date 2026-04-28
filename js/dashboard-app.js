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
    // Sem dados locais → verifica se há sessão Supabase Auth ativa
    let authUser = null;
    try {
      const { session } = await capsulaDB.authGetSession();
      if (session) authUser = session.user;
    } catch(e) { console.warn('[dashboard] authGetSession:', e); }

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

  if (u.criado_em) {
    const criado = new Date(u.criado_em);
    const dias = Math.max(1, Math.ceil((Date.now() - criado.getTime()) / (1000*60*60*24)));
    document.getElementById('stat-dias').textContent = dias;
    document.getElementById('stat-dias-sub').textContent = dias === 1 ? 'membro desde hoje' : 'dias na plataforma';
  }

  // ── Créditos & plano ────────────────────────────────────────
  if (window._payments) {
    const elCred  = document.getElementById('stat-creditos');
    const elLabel = document.getElementById('stat-creditos-label');
    const elSub   = document.getElementById('stat-plano-sub');
    const elCard  = document.getElementById('card-creditos');
    if (_payments.isAdmin() || _payments.isPro()) {
      if (elCred)  elCred.textContent = '∞';
      if (elLabel) elLabel.textContent = _payments.isAdmin() ? 'admin' : 'ilimitado';
      const _sub = _payments.isAdmin() ? 'Acesso total' : (_payments.isGerencial() ? 'Plano Gerencial ativo' : 'Plano Profissional ativo');
      if (elSub)   { elSub.textContent = _sub; elSub.style.color = _payments.isGerencial() ? '#2EC4A0' : 'var(--S)'; }
      if (elCard)  elCard.style.setProperty('--stat-color', _payments.isGerencial() ? '#2EC4A0' : 'var(--S)');
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
  }
  // ── Seção Gerencial (Acompanhamento Semanal + Equipes) ───────
  if (window._payments && (_payments.isGerencial() || _payments.isAdmin())) {
    acompInit(u.email);
    eqInit(u.email);
  }

  // ── Sincroniza com Supabase em background ──────────────────
  if (u.email) {
    capsulaDB.migrateLocalToSupabase(u.email).then(merged => {
      if (merged) loadMatrixState(merged);
    }).catch(e => console.warn('[dashboard] sync Supabase:', e));
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

  const total=[discDone,soarDone,ikigaiDone,ancorasDone,johariDone,bigfiveDone,pearsonDone,tciDone].filter(Boolean).length;
  document.getElementById('stat-matrizes').textContent=total;
  document.getElementById('stat-insights').textContent=total;
  if(total>0){
    const sub=total===1?'1 relatório disponível':`${total} relatórios disponíveis`;
    document.getElementById('stat-insights-sub').textContent=sub;
  }

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

  // Progresso
  const discP=discDone?100:0;
  const totalP=Math.min(Math.round(10+(total/8)*90),100);
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
  window.location.href = 'index.html';
}

document.addEventListener("DOMContentLoaded", function() { if(typeof capsulaDB !== "undefined") { db = capsulaDB.getDB(); } initDate(); loadUser(); });

// ── FIX CRÍTICO 2: Recarrega estado ao voltar do DISC/SOAR ────
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    const raw = localStorage.getItem('capsula_user');
    if (raw) {
      const u = JSON.parse(raw);
      loadMatrixState(u);
      // Sincroniza progresso atualizado com o Supabase
      if (u.email) {
        capsulaDB.syncMatrizes(u).catch(e => console.warn('[sync] visibilitychange:', e));
      }
    }
  }
});

// Também ouve mudanças no localStorage (caso abra em outra aba)
window.addEventListener('storage', function(e) {
  if (e.key === 'capsula_user' && e.newValue) {
    loadMatrixState(JSON.parse(e.newValue));
  }
});

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

// ══════════════════════════════════════
// AVALIAÇÕES REMOTAS (Plano Pro)
// ══════════════════════════════════════
const _RL_NOMES = {
  disc:'DISC', soar:'SOAR', ikigai:'Ikigai', ancoras:'Âncoras de Carreira',
  johari:'Janela de Johari', bigfive:'Big Five', pearson:'Pearson-Marr', tci:'TCI',
};
let _rlProEmail = '';

function rlInitSection(proEmail) {
  _rlProEmail = proEmail || '';
  const sec = document.getElementById('pro-remote-section');
  if (sec) sec.style.display = 'block';
  rlCarregarLinks();
}

async function rlCriarLink() {
  if (!_rlProEmail) return;
  const matriz        = document.getElementById('rl-select-matriz').value;
  const etiqueta      = (document.getElementById('rl-input-etiqueta').value || '').trim();
  const btn           = document.getElementById('rl-btn-criar');
  const maxCompletions = (window._payments && (_payments.isGerencial() || _payments.isAdmin())) ? 9999 : 20;
  btn.disabled = true; btn.textContent = 'Gerando...';
  const { error } = await capsulaDB.createRemoteLink({ pro_email: _rlProEmail, matriz, etiqueta, max_completions: maxCompletions });
  btn.disabled = false; btn.textContent = '+ Gerar link';
  if (error) { alert('Erro ao criar link. Tente novamente.'); return; }
  document.getElementById('rl-input-etiqueta').value = '';
  rlCarregarLinks();
}

async function rlCarregarLinks() {
  if (!_rlProEmail) return;
  const links = await capsulaDB.getMyRemoteLinks(_rlProEmail);
  rlRenderLinks(links);
}

function rlRenderLinks(links) {
  const el = document.getElementById('rl-links-list');
  if (!links || !links.length) {
    el.innerHTML = '<div style="text-align:center;padding:2rem 1rem;color:var(--muted);font-size:0.85rem;">Nenhum link gerado ainda. Crie o primeiro acima.</div>';
    return;
  }
  const origin = window.location.origin;
  el.innerHTML = links.map(function(lk) {
    const url  = origin + '/' + lk.matriz + '.html?token=' + lk.token;
    const full = lk.completion_count >= lk.max_completions;
    const pct  = Math.round((lk.completion_count / lk.max_completions) * 100);
    const etiq = lk.etiqueta ? '<span style="font-size:0.8rem;color:var(--text);font-weight:500;">' + eqEsc(lk.etiqueta) + '</span>' : '';
    return [
      '<div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;',
      'padding:1rem 1.25rem;margin-bottom:0.55rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">',

      '<div style="flex:1;min-width:200px;">',
      '<div style="display:flex;align-items:center;gap:0.45rem;margin-bottom:0.3rem;flex-wrap:wrap;">',
      '<span style="font-size:0.68rem;font-family:var(--mono);background:rgba(124,106,247,0.1);',
      'color:var(--accent);padding:0.1rem 0.5rem;border-radius:4px;text-transform:uppercase;">',
      (_RL_NOMES[lk.matriz] || lk.matriz), '</span>',
      etiq,
      full ? '<span style="font-size:0.65rem;color:#ff6b6b;font-family:var(--mono);">LOTADO</span>' : '',
      '</div>',
      '<div style="font-size:0.7rem;color:var(--muted);font-family:monospace;overflow:hidden;',
      'text-overflow:ellipsis;white-space:nowrap;max-width:300px;">', url, '</div>',
      '</div>',

      '<div style="display:flex;align-items:center;gap:0.5rem;">',
      '<div style="text-align:center;min-width:44px;">',
      '<div style="font-size:1.05rem;font-weight:700;color:', (full ? '#ff6b6b' : 'var(--S)'), ';">', lk.completion_count, '</div>',
      '<div style="font-size:0.6rem;color:var(--muted);font-family:var(--mono);">', (lk.max_completions >= 9999 ? '/∞' : '/' + lk.max_completions), '</div>',
      '</div></div>',

      '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">',
      '<button onclick="rlCopiarLink(\'' + url.replace(/'/g,"\\'") + '\',this)"',
      ' style="padding:0.42rem 0.8rem;background:rgba(124,106,247,0.1);border:1px solid rgba(124,106,247,0.2);',
      'border-radius:6px;color:var(--accent);font-size:0.78rem;font-weight:600;cursor:pointer;"',
      ' onmouseover="this.style.background=\'rgba(124,106,247,0.2)\'" onmouseout="this.style.background=\'rgba(124,106,247,0.1)\'">',
      'Copiar</button>',
      '<button onclick="rlVerResultados(\'' + lk.token + '\',\'' + (_RL_NOMES[lk.matriz]||lk.matriz).replace(/'/g,"\\'") + (lk.etiqueta?' — '+lk.etiqueta.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;'): '') + '\')"',
      ' style="padding:0.42rem 0.8rem;background:rgba(255,255,255,0.04);border:1px solid var(--border);',
      'border-radius:6px;color:var(--muted);font-size:0.78rem;cursor:pointer;"',
      ' onmouseover="this.style.color=\'var(--text)\'" onmouseout="this.style.color=\'var(--muted)\'">',
      'Ver resultados (', lk.completion_count, ')</button>',
      '</div>',

      '</div>',
    ].join('');
  }).join('');
}

async function rlCopiarLink(url, btnEl) {
  try {
    await navigator.clipboard.writeText(url);
    const orig = btnEl.textContent;
    btnEl.textContent = '✓ Copiado!';
    btnEl.style.color = 'var(--S)';
    setTimeout(function() { btnEl.textContent = orig; btnEl.style.color = ''; }, 2200);
  } catch(e) {
    prompt('Copie o link abaixo:', url);
  }
}

async function rlVerResultados(token, titulo) {
  const modal  = document.getElementById('rl-results-modal');
  const bodyEl = document.getElementById('rl-modal-results');
  document.getElementById('rl-modal-title').textContent = titulo;
  bodyEl.innerHTML = '<div style="text-align:center;color:var(--muted);padding:1.5rem;">Carregando...</div>';
  modal.style.display = 'flex';

  const results = await capsulaDB.getRemoteResults(token);
  if (!results || !results.length) {
    bodyEl.innerHTML = '<div style="text-align:center;color:var(--muted);padding:1.5rem;font-size:0.85rem;">Nenhum resultado ainda.</div>';
    return;
  }
  bodyEl.innerHTML = results.map(function(r) {
    const dt = new Date(r.completed_at).toLocaleString('pt-BR');
    const preview = (r.resultado && r.resultado.texto)
      ? r.resultado.texto.substring(0, 500) + (r.resultado.texto.length > 500 ? '…' : '')
      : '';
    return [
      '<div style="border:1px solid var(--border);border-radius:8px;padding:1rem 1.1rem;margin-bottom:0.65rem;">',
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:', preview?'0.6rem':'0', ';">',
      '<div><span style="font-weight:600;font-size:0.9rem;color:var(--text);">', eqEsc(r.respondente_nome), '</span>',
      r.respondente_email ? '<span style="font-size:0.76rem;color:var(--muted);margin-left:0.5rem;">' + eqEsc(r.respondente_email) + '</span>' : '',
      '</div>',
      '<span style="font-size:0.68rem;color:var(--muted);font-family:monospace;white-space:nowrap;margin-left:0.5rem;">', dt, '</span>',
      '</div>',
      preview ? '<div style="font-size:0.78rem;color:rgba(232,232,240,0.55);white-space:pre-wrap;max-height:110px;overflow-y:auto;background:rgba(0,0,0,0.25);padding:0.6rem 0.75rem;border-radius:6px;font-family:monospace;line-height:1.5;">' + preview.replace(/</g,'&lt;') + '</div>' : '',
      '</div>',
    ].join('');
  }).join('');
}

function rlFecharResultados() {
  document.getElementById('rl-results-modal').style.display = 'none';
}

// ══════════════════════════════════════
// ACOMPANHAMENTO SEMANAL (Plano Gerencial)
// ══════════════════════════════════════
const _ACOMP_COLORS = ['#7c6af7','#2EC4A0','#E8603A','#1BA8D4','#C9A84C','#ff6b6b','#a89ef8','#25D366'];
let _acompEmail = '';
let _acompIndicadores = [];
let _acompSelectedCor = _ACOMP_COLORS[0];
let _acompRegIndicadorId = '';
let _acompRegUnidade = '%';

function acompInit(email) {
  _acompEmail = email || '';
  const sec = document.getElementById('gerencial-section');
  if (sec) sec.style.display = 'block';
  acompCarregar();
}

async function acompCarregar() {
  if (!_acompEmail) return;
  _acompIndicadores = await capsulaDB.getIndicadores(_acompEmail);
  acompRenderGrid();
}

function acompRenderGrid() {
  const grid  = document.getElementById('acomp-grid');
  const empty = document.getElementById('acomp-empty');
  if (!_acompIndicadores.length) {
    if (empty) empty.style.display = 'block';
    // remove old cards
    grid.querySelectorAll('.acomp-card').forEach(c => c.remove());
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.querySelectorAll('.acomp-card').forEach(c => c.remove());
  _acompIndicadores.forEach(function(ind) {
    const card = acompBuildCard(ind);
    grid.appendChild(card);
  });
}

function acompBuildCard(ind) {
  const registros = (ind.registros_semanais || []).sort((a,b) => new Date(a.semana) - new Date(b.semana));
  const last = registros[registros.length - 1];
  const prev = registros[registros.length - 2];
  const valorAtual = last ? last.valor : null;
  const delta = (last && prev) ? (last.valor - prev.valor) : null;
  const deltaStr = delta !== null
    ? (delta >= 0 ? '↑ +' : '↓ ') + Math.abs(delta).toFixed(1) + ' ' + ind.unidade
    : '';
  const deltaColor = delta === null ? 'var(--muted)' : (delta >= 0 ? '#2EC4A0' : '#ff6b6b');
  const metaPct = (ind.meta && valorAtual !== null) ? Math.min(100, Math.round((valorAtual / ind.meta) * 100)) : null;

  const card = document.createElement('div');
  card.className = 'acomp-card';
  card.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.25rem;position:relative;overflow:hidden;';
  card.innerHTML = [
    `<div style="position:absolute;top:0;left:0;right:0;height:2px;background:${ind.cor};"></div>`,
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;">',
    `<div style="font-size:0.88rem;font-weight:600;color:var(--text);line-height:1.3;max-width:70%;">${ind.nome}</div>`,
    `<button onclick="acompDeletar('${ind.id}')" title="Remover" style="background:none;border:none;color:var(--muted);font-size:0.9rem;cursor:pointer;padding:0;line-height:1;opacity:0.5;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">×</button>`,
    '</div>',

    // valor atual + delta
    '<div style="display:flex;align-items:baseline;gap:0.6rem;margin-bottom:0.5rem;">',
    valorAtual !== null
      ? `<span style="font-size:1.8rem;font-weight:800;letter-spacing:-0.03em;color:var(--text);">${valorAtual}<span style="font-size:0.75rem;font-weight:400;color:var(--muted);margin-left:2px;">${ind.unidade}</span></span>`
      : `<span style="font-size:1rem;color:var(--muted);">Sem dados ainda</span>`,
    delta !== null ? `<span style="font-size:0.78rem;font-weight:600;color:${deltaColor};">${deltaStr}</span>` : '',
    '</div>',

    // mini chart
    '<div style="margin:0.5rem 0;">',
    acompDrawChart(registros, ind.meta, ind.cor, ind.unidade),
    '</div>',

    // meta bar
    metaPct !== null ? [
      '<div style="margin-bottom:0.6rem;">',
      `<div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--muted);font-family:var(--mono);margin-bottom:0.3rem;">`,
      `<span>Meta: ${ind.meta}${ind.unidade}</span><span>${metaPct}%</span></div>`,
      '<div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;">',
      `<div style="height:100%;width:${metaPct}%;background:${ind.cor};border-radius:2px;transition:width 0.6s;"></div>`,
      '</div></div>',
    ].join('') : '',

    // semanas registradas
    `<div style="font-size:0.65rem;color:var(--muted);font-family:var(--mono);margin-bottom:0.75rem;">${registros.length} semana${registros.length!==1?'s':''} registrada${registros.length!==1?'s':''}</div>`,

    // botão registrar
    `<button onclick="acompAbrirReg('${ind.id}','${ind.nome.replace(/'/g,"\\'")}','${ind.unidade}','${ind.cor}')"`,
    ` style="width:100%;padding:0.55rem;background:rgba(255,255,255,0.04);border:1px solid var(--border);`,
    `border-radius:7px;color:var(--muted);font-size:0.78rem;cursor:pointer;transition:all 0.2s;"`,
    ` onmouseover="this.style.borderColor='${ind.cor}';this.style.color='${ind.cor}'"`,
    ` onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">`,
    '+ Registrar semana</button>',
  ].join('');
  return card;
}

function acompDrawChart(registros, meta, cor, unidade) {
  const W = 260, H = 64, PAD = 6;
  const last = registros.slice(-10);
  if (last.length < 2) {
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<text x="${W/2}" y="${H/2+4}" text-anchor="middle" fill="rgba(232,232,240,0.15)" font-size="11" font-family="monospace">sem dados suficientes</text>` +
      '</svg>';
  }
  const vals  = last.map(r => r.valor);
  const allV  = meta != null ? [...vals, meta] : vals;
  const vMin  = Math.min(...allV);
  const vMax  = Math.max(...allV);
  const range = vMax - vMin || 1;

  const toX = i => PAD + (i / (last.length - 1)) * (W - PAD * 2);
  const toY = v => H - PAD - ((v - vMin) / range) * (H - PAD * 2);

  const pts = last.map((r, i) => `${toX(i).toFixed(1)},${toY(r.valor).toFixed(1)}`).join(' ');
  const gradId = 'g_' + Math.random().toString(36).slice(2);
  const metaY  = meta != null ? toY(meta).toFixed(1) : null;

  return [
    `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible;">`,
    `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="${cor}" stop-opacity="0.2"/>`,
    `<stop offset="1" stop-color="${cor}" stop-opacity="0"/></linearGradient></defs>`,
    // meta dashed line
    metaY ? `<line x1="${PAD}" y1="${metaY}" x2="${W-PAD}" y2="${metaY}" stroke="${cor}" stroke-width="1" stroke-dasharray="3,4" opacity="0.35"/>` : '',
    // area fill
    `<polygon points="${pts} ${toX(last.length-1).toFixed(1)},${H} ${PAD},${H}" fill="url(#${gradId})"/>`,
    // line
    `<polyline points="${pts}" fill="none" stroke="${cor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    // dots
    last.map((r, i) => `<circle cx="${toX(i).toFixed(1)}" cy="${toY(r.valor).toFixed(1)}" r="${i===last.length-1?3.5:2.5}" fill="${i===last.length-1?cor:'rgba(255,255,255,0.3)'}" stroke="${cor}" stroke-width="${i===last.length-1?'0':'1'}"/>`).join(''),
    // x labels (just first and last)
    `<text x="${PAD}" y="${H+14}" fill="rgba(232,232,240,0.25)" font-size="9" font-family="monospace">${acompFmtSemana(last[0].semana)}</text>`,
    `<text x="${W-PAD}" y="${H+14}" fill="rgba(232,232,240,0.25)" font-size="9" font-family="monospace" text-anchor="end">${acompFmtSemana(last[last.length-1].semana)}</text>`,
    '</svg>',
  ].join('');
}

function acompFmtSemana(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
}

// ── Novo Indicador modal ──────────────────────────────────────

function acompNovoIndicador() {
  _acompSelectedCor = _ACOMP_COLORS[0];
  document.getElementById('acomp-f-nome').value  = '';
  document.getElementById('acomp-f-meta').value  = '';
  document.getElementById('acomp-novo-err').textContent = '';
  // Render color palette
  const pal = document.getElementById('acomp-color-palette');
  pal.innerHTML = _ACOMP_COLORS.map(function(c) {
    return `<div onclick="acompSelectCor('${c}',this)" data-cor="${c}"` +
      ` style="width:24px;height:24px;border-radius:50%;background:${c};cursor:pointer;` +
      `border:2px solid ${c === _acompSelectedCor ? '#fff' : 'transparent'};transition:border 0.15s;"></div>`;
  }).join('');
  document.getElementById('acomp-novo-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('acomp-f-nome')?.focus(), 100);
}

function acompSelectCor(cor, el) {
  _acompSelectedCor = cor;
  document.querySelectorAll('#acomp-color-palette div').forEach(d => d.style.borderColor = 'transparent');
  el.style.borderColor = '#fff';
}

async function acompSalvarIndicador() {
  const nome = (document.getElementById('acomp-f-nome').value || '').trim();
  const err  = document.getElementById('acomp-novo-err');
  if (!nome) { err.textContent = 'Informe o nome do indicador.'; return; }
  const unidade = document.getElementById('acomp-f-unidade').value;
  const metaRaw = document.getElementById('acomp-f-meta').value.trim();
  const meta    = metaRaw !== '' ? parseFloat(metaRaw) : null;

  const btn = document.querySelector('#acomp-novo-modal button:last-child');
  if (btn) { btn.disabled = true; btn.textContent = 'Criando...'; }

  const { error } = await capsulaDB.createIndicador({
    gerencial_email: _acompEmail, nome, unidade, meta, cor: _acompSelectedCor,
  });

  if (btn) { btn.disabled = false; btn.textContent = 'Criar Indicador'; }
  if (error) { err.textContent = 'Erro ao criar. Tente novamente.'; return; }
  acompFecharNovo();
  await acompCarregar();
}

function acompFecharNovo() {
  document.getElementById('acomp-novo-modal').style.display = 'none';
}

// ── Registrar semana modal ────────────────────────────────────

function acompAbrirReg(id, nome, unidade, cor) {
  _acompRegIndicadorId = id;
  _acompRegUnidade = unidade;
  document.getElementById('acomp-reg-nome-label').textContent = nome;
  document.getElementById('acomp-reg-valor-label').textContent = `Valor desta semana (${unidade}) *`;
  document.getElementById('acomp-reg-valor').value = '';
  document.getElementById('acomp-reg-nota').value  = '';
  document.getElementById('acomp-reg-err').textContent = '';
  // Preenche com a segunda-feira da semana atual
  const hoje = new Date();
  const dow   = hoje.getDay(); // 0=dom, 1=seg...
  const diff  = dow === 0 ? -6 : 1 - dow;
  const seg   = new Date(hoje.getTime() + diff * 86400000);
  document.getElementById('acomp-reg-semana').value = seg.toISOString().split('T')[0];
  document.getElementById('acomp-reg-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('acomp-reg-valor')?.focus(), 100);
}

async function acompSalvarReg() {
  const valorRaw = document.getElementById('acomp-reg-valor').value.trim();
  const err      = document.getElementById('acomp-reg-err');
  if (valorRaw === '') { err.textContent = 'Informe o valor.'; return; }
  const valor  = parseFloat(valorRaw);
  const semana = document.getElementById('acomp-reg-semana').value;
  const nota   = (document.getElementById('acomp-reg-nota').value || '').trim();
  if (!semana) { err.textContent = 'Informe a semana.'; return; }

  const btn = document.querySelector('#acomp-reg-modal button:last-child');
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

  const { error } = await capsulaDB.addRegistroSemanal({
    indicador_id: _acompRegIndicadorId, semana, valor, nota,
  });

  if (btn) { btn.disabled = false; btn.textContent = 'Salvar Registro'; }
  if (error) { err.textContent = 'Erro ao salvar. Tente novamente.'; return; }
  acompFecharReg();
  await acompCarregar();
}

function acompFecharReg() {
  document.getElementById('acomp-reg-modal').style.display = 'none';
}

async function acompDeletar(id) {
  if (!confirm('Remover este indicador e todos os seus registros?')) return;
  await capsulaDB.deleteIndicador(id);
  await acompCarregar();
}

// ══════════════════════════════════════
// GESTÃO DE EQUIPES (Plano Gerencial)
// ══════════════════════════════════════
let _eqEmail = '';
let _eqEquipes = [];
let _eqDetailId = '';

function eqInit(email) {
  _eqEmail = email || '';
  const sec = document.getElementById('equipes-section');
  if (sec) sec.style.display = 'block';
  eqCarregar();
}

async function eqCarregar() {
  if (!_eqEmail) return;
  _eqEquipes = await capsulaDB.getEquipes(_eqEmail);
  eqRenderGrid();
  eqCheckOverdue();
}

async function eqCheckOverdue() {
  const alertEl = document.getElementById('eq-overdue-alert');
  if (!alertEl || !_eqEquipes.length) return;
  try {
    const now = new Date();
    const planos = await Promise.all(_eqEquipes.map(eq => capsulaDB.getPlanoAcao(eq.id).catch(() => [])));
    let totalAtrasadas = 0;
    let equipeComMaisAtrasos = null;
    let maxAtrasos = 0;
    planos.forEach((itens, i) => {
      const atrasadas = itens.filter(it =>
        it.status !== 'concluido' && it.status !== 'cancelado' && it.quando && new Date(it.quando) < now
      ).length;
      totalAtrasadas += atrasadas;
      if (atrasadas > maxAtrasos) { maxAtrasos = atrasadas; equipeComMaisAtrasos = _eqEquipes[i]; }
    });
    if (totalAtrasadas === 0) { alertEl.style.display = 'none'; return; }
    const textEl = document.getElementById('eq-overdue-text');
    const linkEl = document.getElementById('eq-overdue-link');
    if (textEl) textEl.textContent = `${totalAtrasadas} ação${totalAtrasadas !== 1 ? 'ões' : ''} em atraso em ${_eqEquipes.length === 1 ? 'sua equipe' : _eqEquipes.length + ' equipes'}.`;
    if (linkEl && equipeComMaisAtrasos) linkEl.href = `5w2h.html?equipe=${equipeComMaisAtrasos.id}`;
    alertEl.style.display = 'flex';
  } catch (_) {}
}

function eqRenderGrid() {
  const grid = document.getElementById('eq-grid');
  const empty = document.getElementById('eq-empty');
  if (!grid) return;
  grid.querySelectorAll('.eq-card').forEach(c => c.remove());
  if (!_eqEquipes.length) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  _eqEquipes.forEach(eq => grid.appendChild(eqBuildCard(eq)));
}

function eqBuildCard(eq) {
  const membros = eq.equipe_membros || [];
  const card = document.createElement('div');
  card.className = 'eq-card';
  card.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.25rem;position:relative;overflow:hidden;cursor:pointer;transition:border-color 0.2s;';
  card.onmouseover = () => card.style.borderColor = 'rgba(46,196,160,0.4)';
  card.onmouseout = () => card.style.borderColor = 'var(--border)';
  card.onclick = () => eqVerDetalhes(eq.id);
  card.innerHTML = [
    `<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#2EC4A0,#1BA8D4);"></div>`,
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">',
    `<div style="font-size:0.95rem;font-weight:700;color:var(--text);line-height:1.3;flex:1;">${eqEsc(eq.nome)}</div>`,
    `<button onclick="event.stopPropagation();eqDeletar('${eq.id}')" title="Remover" style="background:none;border:none;color:var(--muted);font-size:1.1rem;cursor:pointer;padding:0;line-height:1;opacity:0.4;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.4'">×</button>`,
    '</div>',
    eq.descricao ? `<p style="font-size:0.78rem;color:var(--muted);margin:0 0 0.85rem;line-height:1.4;">${eqEsc(eq.descricao)}</p>` : '',
    '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">',
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2EC4A0" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    `<span style="font-size:0.8rem;color:rgba(232,232,240,0.75);font-weight:600;">${membros.length} membro${membros.length!==1?'s':''}</span>`,
    '</div>',
    membros.length
      ? `<div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-top:0.5rem;">${membros.slice(0,5).map(m=>`<span style="font-size:0.65rem;padding:0.2rem 0.55rem;background:rgba(46,196,160,0.08);border:1px solid rgba(46,196,160,0.2);border-radius:20px;color:#2EC4A0;">${eqEsc(m.nome.split(' ')[0])}</span>`).join('')}${membros.length>5?`<span style="font-size:0.65rem;padding:0.2rem 0.55rem;color:var(--muted);">+${membros.length-5}</span>`:''}</div>`
      : `<div style="font-size:0.72rem;color:var(--muted);font-style:italic;margin-top:0.4rem;">Clique para adicionar membros</div>`,
    `<div style="margin-top:0.85rem;padding-top:0.65rem;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">`,
    `<a href="equipe.html?id=${eq.id}" onclick="event.stopPropagation();" style="font-size:0.72rem;color:var(--accent);text-decoration:none;font-weight:600;opacity:0.8;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Ver Resumo →</a>`,
    `</div>`,
  ].join('');
  return card;
}

function eqEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function eqNovaEquipe() {
  document.getElementById('eq-f-nome').value = '';
  document.getElementById('eq-f-desc').value = '';
  document.getElementById('eq-novo-err').textContent = '';
  document.getElementById('eq-novo-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('eq-f-nome')?.focus(), 100);
}

function eqFecharNovo() {
  document.getElementById('eq-novo-modal').style.display = 'none';
}

async function eqSalvarEquipe() {
  const nome = (document.getElementById('eq-f-nome').value || '').trim();
  const desc = (document.getElementById('eq-f-desc').value || '').trim();
  const err  = document.getElementById('eq-novo-err');
  if (!nome) { err.textContent = 'Informe o nome da equipe.'; return; }
  const { error } = await capsulaDB.createEquipe({ gerencial_email: _eqEmail, nome, descricao: desc });
  if (error) { err.textContent = 'Erro ao criar equipe. Tente novamente.'; return; }
  eqFecharNovo();
  await eqCarregar();
  eqToast('Equipe criada!', nome);
}

async function eqDeletar(id) {
  const eq = _eqEquipes.find(e => e.id === id);
  const nome = eq ? eq.nome : 'esta equipe';
  if (!confirm(`Remover "${nome}"? Os membros adicionados também serão removidos (os resultados originais continuam disponíveis).`)) return;
  await capsulaDB.deleteEquipe(id);
  await eqCarregar();
  eqToast('Equipe removida', nome);
}

async function eqVerDetalhes(id) {
  _eqDetailId = id;
  const eq = _eqEquipes.find(e => e.id === id);
  if (!eq) return;
  const cont = document.getElementById('eq-det-conteudo');
  const membros = eq.equipe_membros || [];
  const dnaCache = await capsulaDB.getEquipeDNA(id).catch(() => null);

  // Aba Membros
  const tabMembros = [
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding:0.85rem 1rem;background:rgba(46,196,160,0.06);border:1px solid rgba(46,196,160,0.18);border-radius:10px;">',
    `<div><span style="font-size:1.2rem;font-weight:700;color:#2EC4A0;">${membros.length}</span> <span style="font-size:0.82rem;color:var(--muted);">membro${membros.length!==1?'s':''} na equipe</span></div>`,
    `<div style="display:flex;gap:0.5rem;">`,
    `<button onclick="openInviteModal('${id}','${eqEsc(eq.nome)}')" style="padding:0.5rem 0.9rem;background:rgba(124,106,247,0.1);border:1px solid rgba(124,106,247,0.3);border-radius:7px;color:#7c6af7;font-size:0.75rem;font-weight:600;cursor:pointer;">✉ Convidar</button>`,
    `<button onclick="eqAbrirAdd('${id}')" style="padding:0.5rem 1rem;background:#2EC4A0;border:none;border-radius:7px;color:#fff;font-size:0.75rem;font-weight:600;cursor:pointer;">+ Adicionar</button>`,
    `</div>`,
    '</div>',
    eqRenderDISCEquipe(membros),
    membros.length
      ? `<div style="display:flex;flex-direction:column;gap:0.5rem;">${membros.map(m => eqRenderMembroRow(m, id)).join('')}</div>`
      : '<p style="color:var(--muted);font-size:0.85rem;font-style:italic;text-align:center;padding:1.5rem 0;">Nenhum membro adicionado ainda.<br><span style="font-size:0.78rem;">Clique em "+ Adicionar" para começar.</span></p>',
  ].join('');

  // Aba Matrizes
  const tabMatrizes = [
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;">`,
    `<a href="okrs.html?equipe=${id}" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:1.25rem 1rem;background:rgba(124,106,247,0.06);border:1px solid rgba(124,106,247,0.2);border-radius:10px;color:#7c6af7;font-size:0.85rem;font-weight:600;text-align:center;text-decoration:none;">`,
    `<span style="font-size:1.4rem;">⊙</span>OKRs Trimestrais</a>`,
    `<a href="5w2h.html?equipe=${id}" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:1.25rem 1rem;background:rgba(27,168,212,0.06);border:1px solid rgba(27,168,212,0.2);border-radius:10px;color:#1BA8D4;font-size:0.85rem;font-weight:600;text-align:center;text-decoration:none;">`,
    `<span style="font-size:1.4rem;">📋</span>5W2H · Plano</a>`,
    `<a href="raci.html?equipe=${id}" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:1.25rem 1rem;background:rgba(232,96,58,0.06);border:1px solid rgba(232,96,58,0.2);border-radius:10px;color:#E8603A;font-size:0.85rem;font-weight:600;text-align:center;text-decoration:none;">`,
    `<span style="font-size:1.4rem;">👥</span>Matriz RACI</a>`,
    `<a href="swot-equipe.html?equipe=${id}" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:1.25rem 1rem;background:rgba(46,196,160,0.06);border:1px solid rgba(46,196,160,0.2);border-radius:10px;color:#2EC4A0;font-size:0.85rem;font-weight:600;text-align:center;text-decoration:none;">`,
    `<span style="font-size:1.4rem;">🎯</span>SWOT de Equipe</a>`,
    `<a href="wizard.html?equipe=${id}" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:1.25rem 1rem;background:rgba(124,106,247,0.06);border:1px solid rgba(124,106,247,0.2);border-radius:10px;color:#7c6af7;font-size:0.85rem;font-weight:600;text-align:center;text-decoration:none;">`,
    `<span style="font-size:1.4rem;">✦</span>Gerar com IA</a>`,
    `</div>`,
  ].join('');

  // Aba DNA
  const tabDNA = membros.length >= 2
    ? `<div id="eq-dna-area">${dnaCache ? eqRenderDNA(dnaCache.conteudo, dnaCache.created_at) : eqDNAVazio()}</div>`
    : '<p style="color:var(--muted);font-size:0.85rem;font-style:italic;text-align:center;padding:2rem 0;">Adicione pelo menos 2 membros para gerar o DNA Estratégico de Equipe.</p>';

  cont.innerHTML = [
    `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;margin-bottom:0.2rem;padding-right:2rem;">`,
    `<h3 style="margin:0;font-size:1.15rem;color:var(--text);flex:1;">${eqEsc(eq.nome)}</h3>`,
    `<a href="equipe.html?id=${id}" style="flex-shrink:0;font-size:0.72rem;color:var(--accent);text-decoration:none;font-weight:600;padding:0.3rem 0.7rem;border:1px solid rgba(46,196,160,0.3);border-radius:6px;background:rgba(46,196,160,0.06);white-space:nowrap;margin-top:0.15rem;">Ver Resumo →</a>`,
    `</div>`,
    eq.descricao ? `<p style="margin:0 0 1rem;color:var(--muted);font-size:0.82rem;">${eqEsc(eq.descricao)}</p>` : '<div style="height:0.85rem;"></div>',
    `<div class="eq-tabs">`,
    `<button class="eq-tab active" onclick="eqSwitchTab('membros',this)">Membros <span style="font-size:0.68rem;opacity:0.7;">(${membros.length})</span></button>`,
    `<button class="eq-tab" onclick="eqSwitchTab('matrizes',this)">Matrizes</button>`,
    `<button class="eq-tab" onclick="eqSwitchTab('dna',this)">DNA Estratégico</button>`,
    `</div>`,
    `<div id="eq-tab-membros">${tabMembros}</div>`,
    `<div id="eq-tab-matrizes" style="display:none;">${tabMatrizes}</div>`,
    `<div id="eq-tab-dna" style="display:none;">${tabDNA}</div>`,
  ].join('');

  document.getElementById('eq-det-modal').style.display = 'flex';
}

function eqSwitchTab(tab, btn) {
  ['membros','matrizes','dna'].forEach(t => {
    const el = document.getElementById('eq-tab-' + t);
    if (el) el.style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('.eq-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function eqFecharDet() {
  document.getElementById('eq-det-modal').style.display = 'none';
  _eqDetailId = '';
}

function eqRenderMembroRow(m, equipeId) {
  const inicial = (m.nome || '?').charAt(0).toUpperCase();
  const matrizLabel = m.matriz ? m.matriz.toUpperCase() : '—';
  return [
    '<div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.85rem;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px;">',
    `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#2EC4A0,#1BA8D4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.88rem;font-weight:700;flex-shrink:0;">${inicial}</div>`,
    '<div style="flex:1;min-width:0;">',
    `<div style="font-size:0.85rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${eqEsc(m.nome)}</div>`,
    `<div style="font-size:0.7rem;color:var(--muted);font-family:monospace;">${eqEsc(m.email || '')}${m.papel ? ' · <span style="color:rgba(232,232,240,0.55);">' + eqEsc(m.papel) + '</span>' : ''}</div>`,
    '</div>',
    m.matriz ? `<span style="font-size:0.62rem;padding:0.18rem 0.55rem;background:rgba(124,106,247,0.1);border:1px solid rgba(124,106,247,0.25);border-radius:20px;color:#7c6af7;font-family:monospace;flex-shrink:0;">${matrizLabel}</span>` : '',
    `<button onclick="eqRemoverMembro('${m.id}')" title="Remover membro" style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:6px;color:var(--muted);font-size:1rem;cursor:pointer;padding:0;min-width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;" onmouseover="this.style.color='#E8603A';this.style.borderColor='rgba(232,96,58,0.4)'" onmouseout="this.style.color='var(--muted)';this.style.borderColor='var(--border)'">×</button>`,
    '</div>',
  ].join('');
}

async function eqRemoverMembro(id) {
  if (!confirm('Remover este membro da equipe?')) return;
  const eq = _eqEquipes.find(e => e.id === _eqDetailId);
  const m = eq && eq.equipe_membros ? eq.equipe_membros.find(x => x.id === id) : null;
  await capsulaDB.removeMembroEquipe(id);
  await eqCarregar();
  if (_eqDetailId) eqVerDetalhes(_eqDetailId);
  eqToast(m ? eqEsc(m.nome) + ' removido' : 'Membro removido', 'da equipe');
}

// ── DISC de Equipe (radar chart com médias) ─────────────────
function eqRenderDISCEquipe(membros) {
  const discs = membros
    .filter(m => m.matriz === 'disc' && m.resultado)
    .map(m => {
      // Tenta extrair scores do resultado
      const r = m.resultado || {};
      // Heurística: procura propriedades D/I/S/C
      const scores = r.scores || (r.disc && r.disc.scores) || null;
      if (scores && typeof scores.D === 'number') return { nome: m.nome, scores };
      // Fallback: tenta extrair do texto
      const txt = (r.texto || '').toString();
      const m2 = {
        D: parseInt((txt.match(/Domin[âa]nci[ao][^0-9]{0,12}(\d{1,3})/i) || [])[1] || '0'),
        I: parseInt((txt.match(/Influ[êe]nci[ao]?[^0-9]{0,12}(\d{1,3})/i) || [])[1] || '0'),
        S: parseInt((txt.match(/Estabilidade[^0-9]{0,12}(\d{1,3})/i) || [])[1] || '0'),
        C: parseInt((txt.match(/Cautela[^0-9]{0,12}(\d{1,3})/i) || [])[1] || '0'),
      };
      if (m2.D || m2.I || m2.S || m2.C) return { nome: m.nome, scores: m2 };
      return null;
    })
    .filter(Boolean);

  if (discs.length === 0) {
    return '<div style="margin:1rem 0;padding:1rem;background:rgba(255,255,255,0.02);border:1px dashed var(--border);border-radius:10px;color:var(--muted);font-size:0.82rem;text-align:center;">Adicione membros que tenham completado a matriz DISC para visualizar o perfil coletivo.</div>';
  }

  // Médias DISC
  const avg = { D: 0, I: 0, S: 0, C: 0 };
  discs.forEach(d => { avg.D += d.scores.D; avg.I += d.scores.I; avg.S += d.scores.S; avg.C += d.scores.C; });
  ['D','I','S','C'].forEach(k => avg[k] = Math.round(avg[k] / discs.length));

  const COLS = { D:'#E8603A', I:'#6C5FE6', S:'#2EC4A0', C:'#1BA8D4' };
  const LBLS = { D:'Dominância', I:'Influência', S:'Estabilidade', C:'Conformidade' };

  // Radar 4 axes
  const W = 280, H = 220, cx = W/2, cy = H/2 + 10, R = 75;
  const angles = { D: -Math.PI/2, I: 0, S: Math.PI/2, C: Math.PI };
  const axisPts = ['D','I','S','C'].map(k => ({ k, x: cx + R*Math.cos(angles[k]), y: cy + R*Math.sin(angles[k]) }));
  const dataPts = ['D','I','S','C'].map(k => {
    const r = (avg[k]/100) * R;
    return `${cx + r*Math.cos(angles[k])},${cy + r*Math.sin(angles[k])}`;
  }).join(' ');

  const grid = [25,50,75,100].map(pct => {
    const r = (pct/100) * R;
    const pts = ['D','I','S','C'].map(k => `${cx + r*Math.cos(angles[k])},${cy + r*Math.sin(angles[k])}`).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
  }).join('');

  const axisLines = axisPts.map(p => `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`).join('');

  const labels = axisPts.map(p => {
    const lx = cx + (R+18)*Math.cos(angles[p.k]);
    const ly = cy + (R+18)*Math.sin(angles[p.k]) + 4;
    return `<text x="${lx}" y="${ly}" text-anchor="middle" fill="${COLS[p.k]}" font-size="11" font-weight="700" font-family="monospace">${p.k}</text>` +
           `<text x="${lx}" y="${ly+12}" text-anchor="middle" fill="rgba(232,232,240,0.4)" font-size="9" font-family="monospace">${avg[p.k]}%</text>`;
  }).join('');

  // Cor dominante
  const dom = ['D','I','S','C'].reduce((a,b) => avg[a] > avg[b] ? a : b);

  return [
    '<div style="margin:1rem 0;padding:1.25rem;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;">',
    `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;">`,
    `<div><div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted);">DISC Coletivo</div>`,
    `<div style="font-size:0.72rem;color:var(--muted);margin-top:0.15rem;">Média de ${discs.length} membro${discs.length!==1?'s':''} · Tendência <strong style="color:${COLS[dom]}">${LBLS[dom]}</strong></div></div>`,
    '</div>',
    `<svg width="100%" viewBox="0 0 ${W} ${H}" style="display:block;max-width:${W}px;margin:0 auto;">`,
    grid, axisLines,
    `<polygon points="${dataPts}" fill="${COLS[dom]}" fill-opacity="0.18" stroke="${COLS[dom]}" stroke-width="2" stroke-linejoin="round"/>`,
    ['D','I','S','C'].map(k => {
      const r = (avg[k]/100) * R;
      const x = cx + r*Math.cos(angles[k]); const y = cy + r*Math.sin(angles[k]);
      return `<circle cx="${x}" cy="${y}" r="3.5" fill="${COLS[k]}" stroke="#13131a" stroke-width="2"/>`;
    }).join(''),
    labels,
    '</svg>',
    '</div>',
  ].join('');
}

// ── DNA de Equipe ───────────────────────────────────────────
function eqDNAVazio() {
  return [
    '<div style="padding:1.25rem;background:linear-gradient(135deg,rgba(46,196,160,0.05),rgba(27,168,212,0.03));border:1px solid rgba(46,196,160,0.18);border-radius:12px;text-align:center;">',
    '<p style="font-size:0.85rem;color:rgba(232,232,240,0.7);margin:0 0 1rem;line-height:1.55;">A IA analisa os perfis dos membros e gera uma síntese estratégica: forças coletivas, riscos e recomendações de gestão.</p>',
    `<button onclick="eqGerarDNA('${_eqDetailId}')" style="padding:0.7rem 1.5rem;background:linear-gradient(135deg,#2EC4A0,#1BA8D4);border:none;border-radius:8px;color:#fff;font-weight:700;font-size:0.85rem;cursor:pointer;box-shadow:0 4px 16px rgba(46,196,160,0.3);">⚡ Gerar DNA com IA</button>`,
    '</div>',
  ].join('');
}

function eqRenderDNA(c, geradoEm) {
  if (!c) return eqDNAVazio();
  const data = geradoEm ? new Date(geradoEm).toLocaleDateString('pt-BR') : '';
  function lista(arr) {
    if (!Array.isArray(arr) || !arr.length) return '<li style="color:var(--muted);font-style:italic;">—</li>';
    return arr.map(x => `<li style="margin-bottom:0.4rem;line-height:1.5;">${eqEsc(x)}</li>`).join('');
  }
  return [
    '<div style="padding:1.25rem;background:linear-gradient(135deg,rgba(46,196,160,0.04),rgba(27,168,212,0.02));border:1px solid rgba(46,196,160,0.18);border-radius:12px;">',
    c.resumo ? `<p style="font-size:0.88rem;line-height:1.6;color:var(--text);margin:0 0 1rem;">${eqEsc(c.resumo)}</p>` : '',
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:0.75rem;">',
    `<div><div style="font-size:0.7rem;font-weight:700;color:#2EC4A0;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">Forças coletivas</div><ul style="margin:0;padding-left:1.1rem;font-size:0.82rem;color:rgba(232,232,240,0.85);">${lista(c.forcas)}</ul></div>`,
    `<div><div style="font-size:0.7rem;font-weight:700;color:#E8603A;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">Riscos / pontos de atenção</div><ul style="margin:0;padding-left:1.1rem;font-size:0.82rem;color:rgba(232,232,240,0.85);">${lista(c.riscos)}</ul></div>`,
    '</div>',
    `<div style="margin-top:1rem;"><div style="font-size:0.7rem;font-weight:700;color:#1BA8D4;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">Recomendações de gestão</div><ul style="margin:0;padding-left:1.1rem;font-size:0.82rem;color:rgba(232,232,240,0.85);">${lista(c.recomendacoes)}</ul></div>`,
    `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;padding-top:0.75rem;border-top:1px solid var(--border);">`,
    data ? `<span style="font-size:0.65rem;color:var(--muted);font-family:monospace;">Gerado em ${data}</span>` : '<span></span>',
    `<button onclick="eqGerarDNA('${_eqDetailId}')" style="padding:0.5rem 1rem;background:transparent;border:1px solid rgba(46,196,160,0.4);border-radius:7px;color:#2EC4A0;font-size:0.75rem;font-weight:600;cursor:pointer;">↻ Regenerar</button>`,
    '</div></div>',
  ].join('');
}

async function eqGerarDNA(equipeId) {
  if (!equipeId) return;
  const eq = _eqEquipes.find(e => e.id === equipeId);
  if (!eq) return;
  const membros = eq.equipe_membros || [];
  if (membros.length < 2) { alert('Adicione pelo menos 2 membros para gerar o DNA.'); return; }

  const area = document.getElementById('eq-dna-area');
  if (area) area.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--muted);font-size:0.88rem;"><div style="font-size:1.5rem;margin-bottom:0.5rem;">⚡</div>Analisando perfis e gerando síntese...<br><span style="font-size:0.7rem;font-family:monospace;">isso pode levar 10-20 segundos</span></div>';

  // Monta o prompt com os perfis
  const perfis = membros.map(m => {
    const r = m.resultado || {};
    const resumo = (r.texto || JSON.stringify(r.scores || {}).replace(/[{}"]/g, ' ')).slice(0, 800);
    return `- ${m.nome}${m.papel ? ' (' + m.papel + ')' : ''} [${m.matriz || 'perfil'}]: ${resumo}`;
  }).join('\n');

  const prompt = [
    `Você é um consultor sênior em gestão de equipes e desenvolvimento organizacional.`,
    ``,
    `EQUIPE: ${eq.nome}${eq.descricao ? ' — ' + eq.descricao : ''}`,
    `MEMBROS (${membros.length}):`,
    perfis,
    ``,
    `Gere uma análise estratégica desta equipe em JSON com a seguinte estrutura EXATA (sem texto fora do JSON):`,
    `{`,
    `  "resumo": "Parágrafo de 2-3 frases sintetizando o caráter e a tendência geral da equipe.",`,
    `  "forcas": ["força 1 (frase curta)", "força 2", "força 3", "força 4"],`,
    `  "riscos": ["risco 1", "risco 2", "risco 3"],`,
    `  "recomendacoes": ["recomendação prática 1", "recomendação 2", "recomendação 3", "recomendação 4"]`,
    `}`,
    ``,
    `Seja específico aos perfis fornecidos. Escreva em português do Brasil.`,
  ].join('\n');

  let conteudo = null;
  try {
    const cfg = window.CAPSULA_CONFIG || {};
    const url = (cfg.supabaseUrl || '') + '/functions/v1/anthropic-proxy';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (cfg.supabaseKey || ''),
      },
      body: JSON.stringify({
        email: _eqEmail,                       // necessário para rate limit
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    if (res.status === 429) {
      if (area) {
        const errMsg = document.createElement('div');
        errMsg.style.cssText = 'padding:1rem;background:rgba(232,160,58,0.1);border:1px solid rgba(232,160,58,0.3);border-radius:8px;color:#E8A03A;font-size:0.85rem;text-align:center;';
        errMsg.textContent = data.error || 'Limite de gerações por hora atingido.';
        area.innerHTML = eqDNAVazio();
        area.insertBefore(errMsg, area.firstChild);
      }
      return;
    }
    const txt = (data.content && data.content[0] && data.content[0].text) || data.text || '';
    const match = txt.match(/\{[\s\S]*\}/);
    if (match) conteudo = JSON.parse(match[0]);
  } catch (e) {
    console.error('[eqGerarDNA]', e);
  }

  if (!conteudo) {
    if (area) area.innerHTML = '<div style="padding:1rem;background:rgba(224,82,82,0.08);border:1px solid rgba(224,82,82,0.25);border-radius:8px;color:#e05252;font-size:0.85rem;text-align:center;">Não foi possível gerar o DNA. Verifique a conexão e tente novamente.</div>' + eqDNAVazio();
    return;
  }

  await capsulaDB.saveEquipeDNA(equipeId, conteudo);
  if (area) area.innerHTML = eqRenderDNA(conteudo, new Date().toISOString());
}

// ── Adicionar membro ────────────────────────────────────────
async function eqAbrirAdd(equipeId) {
  _eqDetailId = equipeId;
  const lista = document.getElementById('eq-add-lista');
  lista.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--muted);font-size:0.85rem;">Carregando respondentes...</div>';
  document.getElementById('eq-add-modal').style.display = 'flex';

  // Busca todos os links e seus resultados
  const links = await capsulaDB.getMyRemoteLinks(_eqEmail);
  const promessas = links.map(l => capsulaDB.getRemoteResults(l.token).then(rs => rs.map(r => ({ ...r, matriz: l.matriz, etiqueta: l.etiqueta }))));
  const todasArrays = await Promise.all(promessas);
  const todos = todasArrays.flat();

  // Filtra os já adicionados
  const eq = _eqEquipes.find(e => e.id === equipeId);
  const jaAdicionados = new Set((eq?.equipe_membros || []).map(m => `${(m.nome||'').toLowerCase()}|${m.matriz}`));
  const disponiveis = todos.filter(r => !jaAdicionados.has(`${(r.respondente_nome||'').toLowerCase()}|${r.matriz}`));

  if (!disponiveis.length) {
    lista.innerHTML = [
      '<div style="text-align:center;padding:1.5rem;color:var(--muted);font-size:0.85rem;">',
      todos.length ? 'Todos os respondentes já foram adicionados a esta equipe.' : 'Nenhum respondente disponível ainda. Compartilhe seus links remotos primeiro.',
      '</div>',
      '<div style="text-align:center;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">',
      `<button onclick="eqAbrirManual('${equipeId}')" style="padding:0.6rem 1.25rem;background:transparent;border:1px solid rgba(46,196,160,0.4);border-radius:8px;color:#2EC4A0;font-size:0.82rem;font-weight:600;cursor:pointer;">+ Adicionar membro manualmente</button>`,
      '</div>',
    ].join('');
    return;
  }

  lista.innerHTML = [
    '<div style="display:flex;flex-direction:column;gap:0.5rem;max-height:50vh;overflow-y:auto;margin:0 -0.25rem;padding:0 0.25rem;">',
    disponiveis.map((r, i) => {
      const inicial = (r.respondente_nome || '?').charAt(0).toUpperCase();
      const data = r.completed_at ? new Date(r.completed_at).toLocaleDateString('pt-BR') : '';
      const resJson = JSON.stringify({
        respondente_nome: r.respondente_nome, respondente_email: r.respondente_email,
        resultado: r.resultado, matriz: r.matriz, id: r.id,
      }).replace(/'/g, "&#39;").replace(/"/g, '&quot;');
      return [
        `<div style="padding:0.75rem 0.85rem;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px;">`,
        `<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.55rem;">`,
        `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c6af7,#1BA8D4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.88rem;font-weight:700;flex-shrink:0;">${inicial}</div>`,
        '<div style="flex:1;min-width:0;">',
        `<div style="font-size:0.85rem;font-weight:600;color:var(--text);">${eqEsc(r.respondente_nome)}</div>`,
        `<div style="font-size:0.7rem;color:var(--muted);font-family:monospace;">${eqEsc(r.respondente_email||'')} · <strong style="color:#7c6af7;">${(r.matriz||'').toUpperCase()}</strong> · ${data}</div>`,
        '</div>',
        `</div>`,
        `<div style="display:flex;gap:0.5rem;align-items:center;">`,
        `<input id="papel-resp-${i}" type="text" placeholder="Papel (ex: Dev, RH, Líder...)" style="flex:1;padding:0.45rem 0.7rem;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:0.78rem;outline:none;font-family:inherit;">`,
        `<button onclick='eqAdicionarRespondente(${resJson},"papel-resp-${i}")' style="padding:0.45rem 1rem;background:#2EC4A0;border:none;border-radius:6px;color:#fff;font-size:0.78rem;font-weight:600;cursor:pointer;white-space:nowrap;">+ Adicionar</button>`,
        `</div>`,
        '</div>',
      ].join('');
    }).join(''),
    '</div>',
    '<div style="text-align:center;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">',
    `<button onclick="eqAbrirManual('${equipeId}')" style="padding:0.55rem 1.1rem;background:transparent;border:1px solid rgba(46,196,160,0.35);border-radius:7px;color:#2EC4A0;font-size:0.82rem;font-weight:600;cursor:pointer;">+ Adicionar membro manualmente</button>`,
    '</div>',
  ].join('');
}

function eqFecharAdd() {
  document.getElementById('eq-add-modal').style.display = 'none';
}

async function eqAdicionarRespondente(r, papelInputId) {
  const papel = papelInputId ? (document.getElementById(papelInputId)?.value || '').trim() : '';
  const { error } = await capsulaDB.addMembroEquipe({
    equipe_id: _eqDetailId,
    remote_result_id: r.id,
    nome: r.respondente_nome,
    email: r.respondente_email,
    papel,
    resultado: r.resultado,
    matriz: r.matriz,
  });
  if (error) { eqToast('Erro ao adicionar membro', '', true); return; }
  eqFecharAdd();
  await eqCarregar();
  if (_eqDetailId) eqVerDetalhes(_eqDetailId);
  eqToast(eqEsc(r.respondente_nome) + ' adicionado!', papel || '');
}

// Abre o modal de adição manual (substitui os 3 prompts)
let _eqManualEquipeId = '';
function eqAbrirManual(equipeId) {
  _eqManualEquipeId = equipeId;
  document.getElementById('eq-m-nome').value = '';
  document.getElementById('eq-m-email').value = '';
  document.getElementById('eq-m-papel-sel').value = '';
  document.getElementById('eq-m-papel-txt').value = '';
  document.getElementById('eq-m-papel-txt').style.display = 'none';
  document.getElementById('eq-m-err').textContent = '';
  document.getElementById('eq-manual-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('eq-m-nome')?.focus(), 80);
}

function eqFecharManual() {
  document.getElementById('eq-manual-modal').style.display = 'none';
}

function eqPapelSelChange() {
  const sel = document.getElementById('eq-m-papel-sel');
  const txt = document.getElementById('eq-m-papel-txt');
  txt.style.display = sel.value === 'outro' ? 'block' : 'none';
  if (sel.value === 'outro') setTimeout(() => txt.focus(), 50);
}

async function eqSalvarManual() {
  const nome = (document.getElementById('eq-m-nome').value || '').trim();
  const email = (document.getElementById('eq-m-email').value || '').trim();
  const papelSel = document.getElementById('eq-m-papel-sel').value;
  const papel = papelSel === 'outro'
    ? (document.getElementById('eq-m-papel-txt').value || '').trim()
    : papelSel;
  const errEl = document.getElementById('eq-m-err');
  if (!nome) { errEl.textContent = 'Informe o nome do membro.'; return; }
  errEl.textContent = '';
  const { error } = await capsulaDB.addMembroEquipe({
    equipe_id: _eqManualEquipeId, nome, email, papel,
    resultado: null, matriz: null,
  });
  if (error) { errEl.textContent = 'Erro ao adicionar. Tente novamente.'; return; }
  eqFecharManual();
  eqFecharAdd();
  await eqCarregar();
  if (_eqDetailId) eqVerDetalhes(_eqDetailId);
  eqToast(nome + ' adicionado!', papel || '');
}

// ══════════════════════════════════════
// P7 — DISC HISTORY CHART
// ══════════════════════════════════════
function renderDiscHistoryChart(userData) {
  const disc = userData && userData.disc;
  if (!disc) return;

  const history = Array.isArray(disc.history) ? disc.history : [];
  // Include current result if history array is empty (backwards compat)
  const entries = history.length > 0 ? history : (disc.completedAt ? [{ dominant: disc.dominant, scores: disc.scores, completedAt: disc.completedAt }] : []);
  if (entries.length < 2) return; // need at least 2 points to draw a line

  const block = document.getElementById('disc-history-block');
  const svg   = document.getElementById('disc-history-chart');
  const count = document.getElementById('disc-history-count');
  const legend= document.getElementById('disc-history-legend');
  if (!block || !svg) return;

  block.style.display = 'block';
  count.textContent   = entries.length + (entries.length === 1 ? ' avaliação' : ' avaliações');

  const COLS = { D:'#E8603A', I:'#6C5FE6', S:'#2EC4A0', C:'#1BA8D4' };
  const LBLS = { D:'Dom', I:'Inf', S:'Est', C:'Con' };
  const W = 240, H = 64, pad = 12;
  const xStep = entries.length > 1 ? (W - pad*2) / (entries.length - 1) : 0;

  let lines = '';
  ['D','I','S','C'].forEach(dim => {
    const pts = entries.map((e, i) => {
      const v = (e.scores && e.scores[dim]) || 0;
      const x = pad + i * xStep;
      const y = H - pad - ((v / 100) * (H - pad*2));
      return `${x},${y}`;
    });
    lines += `<polyline points="${pts.join(' ')}" fill="none" stroke="${COLS[dim]}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>`;
    // dot at last point
    const last = entries[entries.length - 1];
    const lv = (last.scores && last.scores[dim]) || 0;
    const lx = pad + (entries.length - 1) * xStep;
    const ly = H - pad - ((lv / 100) * (H - pad*2));
    lines += `<circle cx="${lx}" cy="${ly}" r="3" fill="${COLS[dim]}"/>`;
  });
  svg.innerHTML = lines;

  // Legend
  legend.innerHTML = Object.entries(COLS).map(([k,c]) => {
    const last = entries[entries.length-1];
    const v = (last.scores && last.scores[k]) || 0;
    return `<span style="display:flex;align-items:center;gap:0.3rem;font-size:0.68rem;color:${c};font-family:monospace;">
      <span style="width:8px;height:8px;border-radius:50%;background:${c};flex-shrink:0;"></span>${LBLS[k]} ${v}%
    </span>`;
  }).join('');
}

// ══════════════════════════════════════
// P8 — INVITE MODAL
// ══════════════════════════════════════
function getInviteLink(equipeId, equipeName) {
  const raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user') || '{}';
  const userData = JSON.parse(raw);
  const uid = userData.uid || 'guest';
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  let url = base + 'convite.html?ref=' + uid;
  if (equipeId) url += '&equipe=' + encodeURIComponent(equipeId);
  if (equipeName) url += '&equipe_nome=' + encodeURIComponent(equipeName);
  return url;
}

function openInviteModal(equipeId, equipeName) {
  const modal = document.getElementById('invite-modal');
  const input = document.getElementById('invite-link-input');
  const badge = document.getElementById('invite-equipe-badge');
  const nomeEl = document.getElementById('invite-equipe-nome');
  if (equipeId && equipeName) {
    if (badge) badge.style.display = 'block';
    if (nomeEl) nomeEl.textContent = equipeName;
  } else {
    if (badge) badge.style.display = 'none';
  }
  if (input) input.value = getInviteLink(equipeId, equipeName);
  if (modal) modal.style.display = 'flex';
}

function closeInviteModal() {
  const modal = document.getElementById('invite-modal');
  if (modal) modal.style.display = 'none';
}

function _currentInviteLink() {
  return (document.getElementById('invite-link-input') || {}).value || getInviteLink();
}

function copyInviteLink() {
  const link = _currentInviteLink();
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.getElementById('copy-invite-btn');
    const msg = document.getElementById('invite-copied-msg');
    if (btn) { const orig = btn.textContent; btn.textContent = 'Copiado!'; setTimeout(() => { btn.textContent = orig; }, 2000); }
    if (msg) { msg.style.display = 'block'; msg.textContent = 'Link copiado ✓'; setTimeout(() => { msg.style.display = 'none'; }, 3000); }
  });
}

function shareInviteWhatsApp() {
  const link = encodeURIComponent(_currentInviteLink());
  window.open('https://wa.me/?text=Acesse%20o%20Sistema%20Gnosis%20e%20mapeie%20seu%20perfil%20comportamental%20gratuitamente%3A%20' + link, '_blank');
}

function shareInviteNative() {
  const link = _currentInviteLink();
  if (navigator.share) {
    navigator.share({ title: 'Sistema Gnosis', text: 'Mapeie seu perfil comportamental gratuitamente!', url: link });
  } else {
    copyInviteLink();
  }
}

// ══════════════════════════════════════
// MODAL PLANOS
// ══════════════════════════════════════
function abrirModalPlanos() {
  document.getElementById('modal-planos').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function fecharModalPlanos() {
  document.getElementById('modal-planos').style.display = 'none';
  document.body.style.overflow = '';
}
function abrirCheckout(key) {
  fecharModalPlanos();
  if (window._payments) { window._payments.openCheckout(key); return; }
}
document.addEventListener('DOMContentLoaded', () => {
  const m = document.getElementById('modal-planos');
  if (m) m.addEventListener('click', e => { if (e.target === m) fecharModalPlanos(); });
});

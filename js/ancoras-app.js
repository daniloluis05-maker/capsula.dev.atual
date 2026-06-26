
// Etapa 2 — eram window.* globais; convertidos pra let no escopo do script.
let _autoNext;

﻿const ANCHORS = [
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

function startQuiz(){
  if (window.gnosisTrack) gnosisTrack('quiz_started', { matriz: 'ancoras' });
  if (window.gnosisQuizSave) {
    const saved = gnosisQuizSave.restore('ancoras');
    if (saved && saved.state && saved.state.scores && typeof saved.state.scores === 'object') {
      const answered = Object.keys(saved.state.scores).length;
      if (answered > 0 && answered < ANCHORS.length) {
        gnosisQuizSave.promptResume({
          matriz: 'ancoras', label: 'Âncoras de Carreira',
          summary: answered + ' de ' + ANCHORS.length + ' âncoras avaliadas',
          onResume: function () {
            scores = Object.assign({}, saved.state.scores);
            currentA = typeof saved.state.currentA === 'number' ? saved.state.currentA : answered;
            if (currentA >= ANCHORS.length) currentA = ANCHORS.length - 1;
            showPage('page-quiz'); renderAnchor(currentA);
          },
          onRestart: function () {
            currentA = 0; scores = {};
            showPage('page-quiz'); renderAnchor(0);
          },
        });
        return;
      }
    }
  }
  currentA = 0; scores = {};
  showPage('page-quiz');
  renderAnchor(0);
}

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
    <div class="scale-btns" role="radiogroup" aria-label="Avalie de 1 (não me representa) a 5 (me representa muito)">
      ${[1,2,3,4,5].map(v=>`
        <button class="scale-btn ${sel===v?'selected':''}" data-val="${v}"
          style="--ac:${a.color}" onclick="selectScore('${a.id}',${v},${idx})"
          title="${HINTS[v-1]}"
          role="radio"
          aria-checked="${sel===v?'true':'false'}"
          aria-label="Nota ${v} de 5"></button>
      `).join('')}
    </div>
    <div class="scale-hint" id="scale-hint" aria-live="polite">${sel?HINTS[sel-1]:'// toque para avaliar'}</div>
    <div class="quiz-actions">
      <button class="btn-next ${sel?'ready':''}" id="btn-next" style="background:${a.color}" onclick="nextAnchor()">
        ${idx===ANCHORS.length-1?'Ver meu resultado →':'Próxima âncora →'}
      </button>
    </div>
  `;
}

function selectScore(id,val,idx){
  scores[id]=val;
  if (window.gnosisQuizSave) gnosisQuizSave.save('ancoras', { scores: scores, currentA: idx });
  document.querySelectorAll('.scale-btn').forEach(b=>b.classList.remove('selected'));
  document.querySelector(`.scale-btn[data-val="${val}"]`).classList.add('selected');
  document.getElementById('scale-hint').textContent=HINTS[val-1];
  document.getElementById('btn-next').classList.add('ready');
  clearTimeout(_autoNext);
  _autoNext=setTimeout(()=>nextAnchor(),700);
}

function nextAnchor(){
  if(!scores[ANCHORS[currentA].id])return;
  currentA++;
  if(currentA>=ANCHORS.length)showResult();
  else renderAnchor(currentA);
}

function showResult(){
  if (window.gnosisQuizSave) gnosisQuizSave.clear('ancoras');
  if (window.gnosisTrack) gnosisTrack('quiz_completed', { matriz: 'ancoras' });
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

  // Bloco "E agora?"
  if (window.gnosisPostResult) {
    window.gnosisPostResult.render({
      fromKey: 'ancoras',
      resultLabel: 'Âncora principal: ' + top.name,
      containerId: 'page-result',
    });
  }
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
  const data=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  const ranked=[...ANCHORS].map(a=>({...a,score:scores[a.id]||0})).sort((a,b)=>b.score-a.score);
  const top=ranked[0], bot=ranked[ranked.length-1];

  // Ranking completo no customSection
  const rankingHTML = '<div style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:0.12em;color:#7C6FF7;text-transform:uppercase;font-weight:500;margin-bottom:12px;">Ranking das 8 âncoras</div>'
    + '<div style="display:grid;gap:6px;">'
    + ranked.map((a,i) => {
        const dots = Array.from({length:5}, (_,d) => `<span style="width:8px;height:8px;border-radius:50%;background:${d<a.score?'#7C6FF7':'#e4e4e7'};display:inline-block;margin-right:2px;"></span>`).join('');
        return '<div style="display:grid;grid-template-columns:24px 1fr auto auto;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid #f4f4f5;">'
          + '<span style="font-family:IBM Plex Mono,monospace;font-size:10px;color:#a1a1aa;">'+String(i+1).padStart(2,'0')+'</span>'
          + '<span style="font-size:12px;font-weight:'+(i===0?'700':'500')+';color:#18181b;">'+a.name+'</span>'
          + '<div>'+dots+'</div>'
          + '<span style="font-family:IBM Plex Mono,monospace;font-size:11px;color:#52525b;min-width:24px;text-align:right;">'+a.score+'/5</span>'
          + '</div>';
      }).join('') + '</div>';

  Gnosis.pdf.render({
    matrizName: 'Âncoras de Carreira',
    matrizSubname: 'Edgar Schein · MIT',
    userName: nome,
    date: data,
    hero: {
      letter: '⚓',
      eyebrow: 'Âncora Dominante',
      title: top.name,
      subtitle: top.desc,
    },
    analysisLabel: 'Análise vocacional',
    analysisBlocks: [
      { eyebrow: 'Síntese',          title: 'O que te move',                  text: top.insight },
      { eyebrow: 'Pontuação',        title: top.score + ' / 5 pontos',         text: 'Você marcou ' + top.score + ' de 5 pontos nesta âncora, indicando alta prioridade. Essa é a âncora que você não abriria mão em decisões de carreira.' },
      { eyebrow: 'Âncora oposta',    title: bot.name + ' (' + bot.score + '/5)', text: 'Sua menor pontuação foi em ' + bot.name + ' (' + bot.score + '/5). Não significa que você não a valoriza — apenas que ela não é decisiva nas suas escolhas profissionais.' },
      { eyebrow: 'Aplicação prática', title: 'Use isto pra decidir',           text: 'Quando avaliar uma nova oportunidade, pergunte: ela respeita minha âncora principal (' + top.name + ')? Se sim, vale considerar. Se não, provavelmente vai gerar atrito ao longo do tempo.' },
    ],
    customSection: rankingHTML,
    citation: 'Schein, E. H. (1990). <em>Career Anchors: Discovering Your Real Values.</em>',
    filename: 'ancoras-carreira.html',
  });
}


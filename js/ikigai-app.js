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
  if (window.gnosisTrack) gnosisTrack('quiz_completed', { matriz: 'ikigai' });
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

  // Bloco "E agora?"
  if (window.gnosisPostResult) {
    window.gnosisPostResult.render({
      fromKey: 'ikigai',
      resultLabel: 'Seu Ikigai mapeado',
      containerId: 'page-result',
    });
  }
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
  const data=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  const totalItems = QUADRANTS.reduce((sum,q)=>sum+Object.values(answers[q.key]||{}).filter(v=>v&&v.trim()).length,0);

  // Conteúdo dos 4 quadrantes no customSection
  const quadHTMLnew = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
    + QUADRANTS.map(q => {
        const filled = Object.values(answers[q.key]||{}).filter(v => v && v.trim().length > 0);
        const items = filled.length > 0
          ? filled.slice(0,5).map(v => '<li style="font-size:11.5px;line-height:1.55;color:#3f3f46;margin-bottom:4px;">'+v+'</li>').join('')
          : '<li style="font-size:11px;color:#a1a1aa;font-style:italic;list-style:none;">— não respondido</li>';
        return '<div style="background:#fff;border:1px solid #e4e4e7;border-radius:8px;padding:14px 16px;border-top:3px solid #7C6FF7;">'
          + '<div style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#7C6FF7;font-weight:500;margin-bottom:8px;">'+q.name+'</div>'
          + '<ul style="padding-left:18px;margin:0;">'+items+'</ul>'
          + '</div>';
      }).join('') + '</div>';

  Gnosis.pdf.render({
    matrizName: 'Ikigai',
    matrizSubname: 'Razão de Ser',
    userName: nome,
    date: data,
    hero: {
      letter: '◐',
      eyebrow: 'Mapeamento de Propósito',
      title: 'Seu Ikigai em formação',
      subtitle: 'Você mapeou ' + totalItems + ' elementos nos 4 quadrantes. O Ikigai emerge nas sobreposições — onde o que você ama, no que é bom, o que o mundo precisa e pelo que pode ser remunerado se encontram.',
    },
    analysisLabel: 'As 4 interseções',
    analysisBlocks: [
      { eyebrow: 'Paixão',    title: 'O que ama × no que é bom',       text: 'A interseção entre o que você ama e no que é bom. É a energia que sustenta esforços de longo prazo — fluxo natural.' },
      { eyebrow: 'Missão',    title: 'O que ama × o que o mundo precisa', text: 'Onde o que você ama encontra a necessidade do mundo. É o chamado que transcende o interesse pessoal.' },
      { eyebrow: 'Vocação',   title: 'No que é bom × pelo que pode ser pago', text: 'No que você é bom e pelo que pode ser pago. É sua proposta de valor — a entrega que o mercado reconhece.' },
      { eyebrow: 'Profissão', title: 'O que o mundo precisa × pelo que pode ser pago', text: 'O que o mundo precisa e pelo que pode ser pago. É a sustentabilidade — a viabilidade prática do propósito.' },
    ],
    customSection: '<div style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:0.12em;color:#7C6FF7;text-transform:uppercase;font-weight:500;margin-bottom:12px;">Seus 4 quadrantes</div>' + quadHTMLnew,
    citation: 'Conceito tradicional japonês · sistematizado por Mieko Kamiya (1966).',
    filename: 'ikigai.html',
  });
}


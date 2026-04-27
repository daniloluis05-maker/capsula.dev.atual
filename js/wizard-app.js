// ─────────────────────────────────────────────────────────────
// capsula.dev · js/wizard-app.js
// Wizard de geração assistida por IA para matrizes gerenciais.
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── Estado ──────────────────────────────────────────────────
  let _user      = null;
  let _equipes   = [];
  let _tipo      = '';   // '5w2h' | 'okrs' | 'swot'
  let _modo      = 'guided'; // 'guided' | 'report'
  let _equipeId  = '';
  let _equipeName = '';
  let _ciclo     = '';
  let _draft     = null; // dados gerados pela IA
  let _currentStep = 0;

  // ── Configurações por tipo ───────────────────────────────────

  const TIPOS = {
    '5w2h': {
      label: '5W2H — Plano de Ação',
      color: '#1BA8D4',
      href: '5w2h.html',
      questions: [
        { id: 'q1', label: 'Qual é o objetivo central desta iniciativa?', required: true, type: 'textarea', hint: 'Ex: Reduzir o tempo de onboarding de novos clientes em 30%' },
        { id: 'q2', label: 'Qual o contexto ou problema que motivou este plano?', required: false, type: 'textarea', hint: 'Descreva a situação atual e o que precisa melhorar' },
        { id: 'q3', label: 'Quais são os principais entregáveis ou ações esperadas?', required: false, type: 'textarea', hint: 'Liste os grandes blocos de trabalho, um por linha' },
        { id: 'q4', label: 'Qual o prazo geral? Há datas críticas?', required: false, type: 'input', hint: 'Ex: Concluir até 30 de setembro; marco em 15 de agosto' },
        { id: 'q5', label: 'Quem são os principais responsáveis?', required: false, type: 'input', hint: 'Ex: Maria (produto), João (tech), equipe de CS' },
        { id: 'q6', label: 'Há restrições de orçamento ou recursos?', required: false, type: 'input', hint: 'Ex: R$ 50.000, 2 desenvolvedores, sem contratações' },
      ],
      reportPrompt: (txt) => `Analise o relatório/texto abaixo e extraia as informações para criar um Plano de Ação 5W2H.\n\nTexto:\n${txt}`,
    },
    'okrs': {
      label: 'OKRs — Objetivos & Key Results',
      color: '#7c6af7',
      href: 'okrs.html',
      questions: [
        { id: 'q1', label: 'Qual é o tema estratégico principal deste ciclo?', required: true, type: 'input', hint: 'Ex: Crescimento de receita, Excelência operacional, Expansão de produto' },
        { id: 'q2', label: 'Quais são os 2-4 grandes resultados que precisam acontecer para o sucesso?', required: true, type: 'textarea', hint: 'Descreva cada resultado em uma linha. Ex: Dobrar a base de clientes ativos' },
        { id: 'q3', label: 'Quais métricas vocês acompanham hoje? Quais são os valores atuais?', required: false, type: 'textarea', hint: 'Ex: NPS atual = 42, Churn = 4%/mês, MRR = R$ 120k' },
        { id: 'q4', label: 'Quais obstáculos ou riscos precisam ser superados?', required: false, type: 'textarea', hint: 'Ex: Time técnico reduzido, dependência de aprovação jurídica' },
      ],
      reportPrompt: (txt) => `Analise o relatório/texto abaixo e extraia as informações para criar OKRs para o próximo ciclo trimestral.\n\nTexto:\n${txt}`,
    },
    'swot': {
      label: 'SWOT de Equipe',
      color: '#2EC4A0',
      href: 'swot-equipe.html',
      questions: [
        { id: 'q1', label: 'O que está sendo analisado? (equipe, produto, departamento)', required: true, type: 'input', hint: 'Ex: Equipe de engenharia, Produto X, Departamento de vendas' },
        { id: 'q2', label: 'Quais são os principais pontos fortes?', required: false, type: 'textarea', hint: 'Competências, diferenciais, recursos exclusivos, cultura positiva...' },
        { id: 'q3', label: 'Quais são as maiores dificuldades internas?', required: false, type: 'textarea', hint: 'Gargalos, carências de habilidade, processos lentos...' },
        { id: 'q4', label: 'Que oportunidades de mercado ou contexto existem?', required: false, type: 'textarea', hint: 'Tendências favoráveis, demandas não atendidas, mudanças regulatórias...' },
        { id: 'q5', label: 'Que ameaças externas preocupam?', required: false, type: 'textarea', hint: 'Concorrência, riscos macroeconômicos, mudanças tecnológicas...' },
      ],
      reportPrompt: (txt) => `Analise o relatório/texto abaixo e extraia as informações para criar uma análise SWOT de equipe.\n\nTexto:\n${txt}`,
    },
  };

  // ── Prompts por tipo ─────────────────────────────────────────

  function buildPrompt(tipo, respostas) {
    const cfg = TIPOS[tipo];
    if (_modo === 'report') {
      const txt = respostas['report'] || '';
      return basePrompt(tipo) + '\n\n' + cfg.reportPrompt(txt.substring(0, 4000));
    }
    const ctx = cfg.questions.map(q => `${q.label}\nResposta: ${respostas[q.id] || '(não informado)'}`).join('\n\n');
    return basePrompt(tipo) + '\n\nContexto fornecido:\n' + ctx;
  }

  function basePrompt(tipo) {
    if (tipo === '5w2h') return [
      'Você é um consultor de gestão experiente. Com base nas informações abaixo, gere um Plano de Ação 5W2H detalhado e prático.',
      '',
      'Retorne APENAS um JSON válido, sem texto antes ou depois, neste formato exato:',
      '{"items":[{"what":"verbo + objeto da ação","why":"justificativa","where_loc":"local ou contexto","when_data":"YYYY-MM-DD ou null","who":"responsável","how":"método ou procedimento","how_much":null,"status":"pendente","prioridade":"media"}]}',
      '',
      'Regras:',
      '- Gere entre 6 e 10 ações concretas e acionáveis',
      '- "what" deve começar com verbo no infinitivo (ex: "Mapear", "Implementar", "Revisar")',
      '- "prioridade": baixa | media | alta | critica',
      '- "when_data": formato YYYY-MM-DD ou null',
      '- "how_much": número float em reais ou null',
      '- Escreva em português do Brasil',
    ].join('\n');

    if (tipo === 'okrs') return [
      'Você é um especialista em OKRs (Objectives and Key Results). Com base nas informações abaixo, gere Objetivos e Key Results para o ciclo trimestral.',
      '',
      'Retorne APENAS um JSON válido, sem texto antes ou depois, neste formato exato:',
      '{"objetivos":[{"titulo":"Título inspirador do objetivo","descricao":"Uma frase explicando o porquê","cor":"#7c6af7","key_results":[{"titulo":"Medir/Aumentar/Reduzir algo específico","valor_inicial":0,"valor_atual":0,"valor_meta":100,"unidade":"%","peso":1,"responsavel":null}]}]}',
      '',
      'Regras:',
      '- Gere 2-4 objetivos ambiciosos mas alcançáveis',
      '- Cada objetivo deve ter 3-5 Key Results mensuráveis',
      '- "unidade" pode ser: %, N, R$, h, leads, clientes, pts, NPS, etc.',
      '- "valor_meta" deve ser um número realista',
      '- "peso" de 1 a 3 (KRs mais críticos têm peso maior)',
      '- Cores: alterne entre #7c6af7, #2EC4A0, #E8603A, #1BA8D4, #C9A84C',
      '- Escreva em português do Brasil',
    ].join('\n');

    if (tipo === 'swot') return [
      'Você é um consultor estratégico. Com base nas informações abaixo, gere uma análise SWOT completa.',
      '',
      'Retorne APENAS um JSON válido, sem texto antes ou depois, neste formato exato:',
      '{"forcas":["item 1","item 2"],"fraquezas":["item 1","item 2"],"oportunidades":["item 1","item 2"],"ameacas":["item 1","item 2"]}',
      '',
      'Regras:',
      '- Gere 4-6 itens por quadrante',
      '- Cada item deve ser uma frase curta e direta (máx 90 caracteres)',
      '- Seja específico ao contexto fornecido, não genérico',
      '- Escreva em português do Brasil',
    ].join('\n');

    return '';
  }

  // ── Chamada ao proxy de IA ───────────────────────────────────

  async function callIA(prompt) {
    const cfg = window.CAPSULA_CONFIG || {};
    const url = (cfg.supabaseUrl || '').replace(/\/$/, '') + '/functions/v1/groq-proxy';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + (cfg.supabaseKey || ''),
      },
      body: JSON.stringify({
        model:      'llama-3.3-70b-versatile',
        max_tokens: 4000,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro na IA (' + res.status + ')');
    const txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    const match = txt.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('A IA não retornou JSON válido. Tente novamente.');
    return JSON.parse(match[0]);
  }

  // ── Navegação entre steps ────────────────────────────────────

  function goStep(n) {
    document.getElementById('step-' + _currentStep).classList.remove('active');
    _currentStep = n;
    document.getElementById('step-' + n).classList.add('active');
    updateProgress(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgress(n) {
    for (let i = 0; i < 5; i++) {
      const dot = document.getElementById('dot-' + i);
      dot.className = 'progress-dot' + (i < n ? ' done' : i === n ? ' active' : '');
    }
  }

  function selectType(el) {
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    _tipo = el.dataset.type;
    document.getElementById('ciclo-block').style.display = _tipo === 'okrs' ? 'block' : 'none';
  }

  function selectMode(m) {
    _modo = m;
    document.getElementById('mode-guided').classList.toggle('selected', m === 'guided');
    document.getElementById('mode-report').classList.toggle('selected', m === 'report');
  }

  window.selectType = selectType;
  window.selectMode = selectMode;

  // ── Step 0 → 1 ───────────────────────────────────────────────

  window.goStep1 = function () {
    const err = document.getElementById('err-step0');
    _equipeId = document.getElementById('sel-equipe-wiz').value;
    const eq = _equipes.find(e => e.id === _equipeId);
    _equipeName = eq ? eq.nome : '';
    if (!_tipo || !_equipeId) { err.style.display = 'block'; return; }
    err.style.display = 'none';
    if (_tipo === 'okrs') _ciclo = document.getElementById('sel-ciclo-wiz').value;
    goStep(1);
  };

  // ── Step 1 → 2 ───────────────────────────────────────────────

  window.goStep2 = function () {
    renderQuestions();
    goStep(2);
  };

  function renderQuestions() {
    const cfg = TIPOS[_tipo];
    const container = document.getElementById('questions-container');

    if (_modo === 'report') {
      container.innerHTML = `
        <div class="section-title">Cole o texto do relatório</div>
        <div class="info-box">A IA irá ler o texto, identificar informações relevantes e gerar um rascunho de <strong>${cfg.label}</strong> a partir delas. Quanto mais detalhado o texto, melhor o resultado.</div>
        <div class="question-block">
          <label>Texto do relatório <span class="required">*</span></label>
          <textarea id="inp-report" style="min-height:220px;" placeholder="Cole aqui o conteúdo do relatório, ata de reunião, análise ou qualquer texto com informações relevantes..."></textarea>
        </div>`;
      return;
    }

    const html = `
      <div class="section-title">Informações para o ${cfg.label}</div>
      <div class="info-box">Responda as perguntas abaixo. Os campos marcados com <span style="color:#E8603A">*</span> são obrigatórios — os demais enriquecem o resultado mas podem ser deixados em branco.</div>
      ${cfg.questions.map(q => `
        <div class="question-block">
          <label>${q.label}${q.required ? '<span class="required">*</span>' : ''}</label>
          ${q.hint ? `<div class="q-hint">${q.hint}</div>` : ''}
          ${q.type === 'textarea'
            ? `<textarea id="inp-${q.id}" placeholder="${q.hint || ''}"></textarea>`
            : `<input type="text" id="inp-${q.id}" placeholder="${q.hint || ''}">`}
        </div>`).join('')}`;
    container.innerHTML = html;
  }

  // ── Gerar ────────────────────────────────────────────────────

  window.gerar = async function () {
    const cfg = TIPOS[_tipo];
    const err = document.getElementById('err-step2');
    err.style.display = 'none';

    // Valida obrigatórios
    const respostas = {};
    if (_modo === 'report') {
      const txt = (document.getElementById('inp-report')?.value || '').trim();
      if (!txt) { err.textContent = 'Cole o texto do relatório para continuar.'; err.style.display = 'block'; return; }
      respostas['report'] = txt;
    } else {
      for (const q of cfg.questions) {
        const val = (document.getElementById('inp-' + q.id)?.value || '').trim();
        if (q.required && !val) { err.textContent = 'Preencha o campo "' + q.label + '".'; err.style.display = 'block'; return; }
        respostas[q.id] = val;
      }
    }

    goStep(3);
    const log = document.getElementById('loading-log');
    const logs = ['Conectando ao modelo IA...', 'Analisando o contexto...', 'Estruturando o plano...', 'Finalizando rascunho...'];
    let logIdx = 0;
    const logInterval = setInterval(() => { if (logIdx < logs.length) { log.textContent = logs[logIdx++]; } }, 1800);

    try {
      const prompt = buildPrompt(_tipo, respostas);
      _draft = await callIA(prompt);
      clearInterval(logInterval);
      log.textContent = 'Rascunho gerado!';
      renderReview();
      goStep(4);
    } catch (e) {
      clearInterval(logInterval);
      console.error('[wizard] IA error:', e);
      goStep(2);
      err.textContent = e.message || 'Erro ao gerar. Tente novamente.';
      err.style.display = 'block';
    }
  };

  // ── Review ───────────────────────────────────────────────────

  function renderReview() {
    const cfg = TIPOS[_tipo];
    const info = document.getElementById('review-info');
    info.innerHTML = `Rascunho de <strong>${cfg.label}</strong> gerado para a equipe <strong>${esc(_equipeName)}</strong>. Revise e edite antes de salvar — você pode alterar textos, remover itens ou adicionar novos.`;

    const container = document.getElementById('review-container');

    if (_tipo === '5w2h') renderReview5W2H(container);
    else if (_tipo === 'okrs') renderReviewOKRs(container);
    else if (_tipo === 'swot') renderReviewSWOT(container);
  }

  function renderReview5W2H(container) {
    const items = _draft.items || [];
    const STATUS_OPTS = ['pendente','em_andamento','concluido','cancelado'];
    const PRIO_OPTS   = ['baixa','media','alta','critica'];
    const STATUS_LBL  = { pendente:'Pendente', em_andamento:'Em andamento', concluido:'Concluído', cancelado:'Cancelado' };
    const PRIO_LBL    = { baixa:'Baixa', media:'Média', alta:'Alta', critica:'Crítica' };

    function renderItem(it, idx) {
      const div = document.createElement('div');
      div.className = 'review-item';
      div.dataset.idx = idx;
      div.innerHTML = `
        <button class="ri-del" onclick="del5w2hItem(${idx})" title="Remover">×</button>
        <div class="ri-label">Ação ${idx + 1}</div>
        <div class="question-block" style="margin-bottom:0.5rem;">
          <label style="font-size:0.7rem;">O Quê <span class="required">*</span></label>
          <input type="text" data-field="what" value="${esc(it.what||'')}">
        </div>
        <div class="ri-grid">
          <div class="question-block" style="margin-bottom:0.5rem;">
            <label style="font-size:0.7rem;">Por Quê</label>
            <input type="text" data-field="why" value="${esc(it.why||'')}">
          </div>
          <div class="question-block" style="margin-bottom:0.5rem;">
            <label style="font-size:0.7rem;">Onde</label>
            <input type="text" data-field="where_loc" value="${esc(it.where_loc||'')}">
          </div>
          <div class="question-block" style="margin-bottom:0.5rem;">
            <label style="font-size:0.7rem;">Quando (AAAA-MM-DD)</label>
            <input type="text" data-field="when_data" value="${esc(it.when_data||'')}">
          </div>
          <div class="question-block" style="margin-bottom:0.5rem;">
            <label style="font-size:0.7rem;">Quem</label>
            <input type="text" data-field="who" value="${esc(it.who||'')}">
          </div>
          <div class="question-block" style="margin-bottom:0.5rem;">
            <label style="font-size:0.7rem;">Como</label>
            <input type="text" data-field="how" value="${esc(it.how||'')}">
          </div>
          <div class="question-block" style="margin-bottom:0.5rem;">
            <label style="font-size:0.7rem;">R$ (valor numérico)</label>
            <input type="number" step="0.01" data-field="how_much" value="${it.how_much != null ? it.how_much : ''}">
          </div>
          <div class="question-block" style="margin-bottom:0;">
            <label style="font-size:0.7rem;">Status</label>
            <select data-field="status">${STATUS_OPTS.map(s => `<option value="${s}" ${it.status===s?'selected':''}>${STATUS_LBL[s]}</option>`).join('')}</select>
          </div>
          <div class="question-block" style="margin-bottom:0;">
            <label style="font-size:0.7rem;">Prioridade</label>
            <select data-field="prioridade">${PRIO_OPTS.map(p => `<option value="${p}" ${it.prioridade===p?'selected':''}>${PRIO_LBL[p]}</option>`).join('')}</select>
          </div>
        </div>`;
      return div;
    }

    container.innerHTML = '';
    items.forEach((it, idx) => container.appendChild(renderItem(it, idx)));

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add-item';
    addBtn.textContent = '+ Adicionar ação';
    addBtn.onclick = () => {
      _draft.items.push({ what:'', why:'', where_loc:'', when_data:null, who:'', how:'', how_much:null, status:'pendente', prioridade:'media' });
      renderReview5W2H(container);
    };
    container.appendChild(addBtn);

    window.del5w2hItem = function (idx) {
      _draft.items.splice(idx, 1);
      renderReview5W2H(container);
    };
  }

  function renderReviewOKRs(container) {
    const objs = _draft.objetivos || [];

    function renderObj(obj, oi) {
      const div = document.createElement('div');
      div.className = 'okr-obj';
      div.dataset.oi = oi;

      const krsHtml = (obj.key_results || []).map((kr, ki) => `
        <div class="okr-kr-item" data-ki="${ki}">
          <input type="text" data-field="titulo" value="${esc(kr.titulo||'')}" placeholder="Título do Key Result">
          <span class="kr-meta">${kr.valor_inicial}→${kr.valor_meta} ${esc(kr.unidade||'%')}</span>
          <span class="kr-meta" style="color:rgba(232,232,240,0.3);">×${kr.peso||1}</span>
          <button class="kr-del" onclick="delKR(${oi},${ki})" title="Remover">×</button>
        </div>`).join('');

      div.innerHTML = `
        <div class="okr-obj-head">
          <button class="obj-del" onclick="delObj(${oi})" title="Remover objetivo">×</button>
          <div style="font-size:0.65rem;color:var(--muted);font-family:var(--mono);margin-bottom:4px;">OBJETIVO ${oi+1}</div>
          <input type="text" data-field="titulo" value="${esc(obj.titulo||'')}" placeholder="Título do objetivo">
        </div>
        <div class="okr-kr-list">
          ${krsHtml}
          <button class="okr-add-kr" onclick="addKR(${oi})">+ Adicionar Key Result</button>
        </div>`;
      return div;
    }

    container.innerHTML = '';
    objs.forEach((obj, oi) => container.appendChild(renderObj(obj, oi)));

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add-item';
    addBtn.textContent = '+ Adicionar objetivo';
    addBtn.onclick = () => {
      _draft.objetivos.push({ titulo: '', descricao: '', cor: '#7c6af7', key_results: [{ titulo: '', valor_inicial: 0, valor_atual: 0, valor_meta: 100, unidade: '%', peso: 1, responsavel: null }] });
      renderReviewOKRs(container);
    };
    container.appendChild(addBtn);

    window.delObj = function (oi) {
      _draft.objetivos.splice(oi, 1);
      renderReviewOKRs(container);
    };
    window.addKR = function (oi) {
      _draft.objetivos[oi].key_results.push({ titulo: '', valor_inicial: 0, valor_atual: 0, valor_meta: 100, unidade: '%', peso: 1, responsavel: null });
      renderReviewOKRs(container);
    };
    window.delKR = function (oi, ki) {
      _draft.objetivos[oi].key_results.splice(ki, 1);
      renderReviewOKRs(container);
    };
  }

  function renderReviewSWOT(container) {
    const QUADS = [
      { key: 'forcas',        label: 'Forças',        color: '#2EC4A0' },
      { key: 'fraquezas',     label: 'Fraquezas',     color: '#E8603A' },
      { key: 'oportunidades', label: 'Oportunidades', color: '#1BA8D4' },
      { key: 'ameacas',       label: 'Ameaças',       color: '#C9A84C' },
    ];

    function renderQuad(q) {
      const items = _draft[q.key] || [];
      const itemsHtml = items.map((txt, i) => `
        <div class="sq-item">
          <input type="text" data-quad="${q.key}" data-idx="${i}" value="${esc(txt)}">
          <button class="sq-del" onclick="delSwotItem('${q.key}',${i})">×</button>
        </div>`).join('');
      return `
        <div class="swot-review-quad">
          <div class="sq-title" style="color:${q.color};">${q.label}</div>
          ${itemsHtml}
          <button class="sq-add" onclick="addSwotItem('${q.key}')">+ Adicionar</button>
        </div>`;
    }

    container.innerHTML = `<div class="swot-review">${QUADS.map(renderQuad).join('')}</div>`;

    window.delSwotItem = function (quad, idx) {
      _draft[quad].splice(idx, 1);
      renderReviewSWOT(container);
    };
    window.addSwotItem = function (quad) {
      if (!_draft[quad]) _draft[quad] = [];
      _draft[quad].push('');
      renderReviewSWOT(container);
    };
  }

  // ── Lê dados do DOM antes de salvar ──────────────────────────

  function collectDraft() {
    if (_tipo === '5w2h') {
      _draft.items = Array.from(document.querySelectorAll('.review-item[data-idx]')).map(div => ({
        what:       div.querySelector('[data-field="what"]')?.value || '',
        why:        div.querySelector('[data-field="why"]')?.value || null,
        where_loc:  div.querySelector('[data-field="where_loc"]')?.value || null,
        when_data:  div.querySelector('[data-field="when_data"]')?.value || null,
        who:        div.querySelector('[data-field="who"]')?.value || null,
        how:        div.querySelector('[data-field="how"]')?.value || null,
        how_much:   parseFloat(div.querySelector('[data-field="how_much"]')?.value) || null,
        status:     div.querySelector('[data-field="status"]')?.value || 'pendente',
        prioridade: div.querySelector('[data-field="prioridade"]')?.value || 'media',
      })).filter(it => it.what.trim());
    }
    if (_tipo === 'okrs') {
      _draft.objetivos = Array.from(document.querySelectorAll('.okr-obj[data-oi]')).map(div => {
        const oi = parseInt(div.dataset.oi, 10);
        const titulo = div.querySelector('[data-field="titulo"]')?.value || '';
        const krs = Array.from(div.querySelectorAll('.okr-kr-item[data-ki]')).map(kDiv => {
          const ki = parseInt(kDiv.dataset.ki, 10);
          const orig = (_draft.objetivos[oi]?.key_results || [])[ki] || {};
          return { ...orig, titulo: kDiv.querySelector('[data-field="titulo"]')?.value || '' };
        }).filter(k => k.titulo.trim());
        const orig = _draft.objetivos[oi] || {};
        return { ...orig, titulo, key_results: krs };
      }).filter(o => o.titulo.trim());
    }
    if (_tipo === 'swot') {
      ['forcas','fraquezas','oportunidades','ameacas'].forEach(quad => {
        _draft[quad] = Array.from(document.querySelectorAll(`[data-quad="${quad}"]`))
          .map(inp => inp.value.trim()).filter(Boolean);
      });
    }
  }

  // ── Salvar ───────────────────────────────────────────────────

  window.salvar = async function () {
    collectDraft();
    const btn = document.getElementById('btn-salvar');
    const err = document.getElementById('err-step4');
    err.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      if (_tipo === '5w2h')  await save5W2H();
      if (_tipo === 'okrs')  await saveOKRs();
      if (_tipo === 'swot')  await saveSWOT();
      showSuccess();
    } catch (e) {
      console.error('[wizard] save error:', e);
      err.textContent = 'Erro ao salvar: ' + (e.message || 'Tente novamente.');
      err.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = '✓ Salvar na equipe';
    }
  };

  async function save5W2H() {
    for (const item of (_draft.items || [])) {
      const { error } = await capsulaDB.savePlanoAcaoItem({ equipe_id: _equipeId, ...item });
      if (error) throw new Error(error.message || 'Erro ao salvar item 5W2H.');
    }
  }

  async function saveOKRs() {
    for (const obj of (_draft.objetivos || [])) {
      const { data, error } = await capsulaDB.saveObjetivo({
        gerencial_email: _user.email,
        titulo:   obj.titulo,
        descricao: obj.descricao || null,
        ciclo:    _ciclo,
        equipe_id: _equipeId || null,
        cor:      obj.cor || '#7c6af7',
        status:   'ativo',
      });
      if (error) throw new Error(error.message || 'Erro ao salvar objetivo.');
      const objId = data.id;
      for (const kr of (obj.key_results || [])) {
        const { error: kErr } = await capsulaDB.saveKeyResult({
          objetivo_id:   objId,
          titulo:        kr.titulo,
          valor_inicial: Number(kr.valor_inicial || 0),
          valor_atual:   Number(kr.valor_atual || 0),
          valor_meta:    Number(kr.valor_meta || 100),
          unidade:       kr.unidade || '%',
          peso:          Number(kr.peso || 1),
          responsavel:   kr.responsavel || null,
        });
        if (kErr) throw new Error(kErr.message || 'Erro ao salvar Key Result.');
      }
    }
  }

  async function saveSWOT() {
    const quads = { forcas: 'forcas', fraquezas: 'fraquezas', oportunidades: 'oportunidades', ameacas: 'ameacas' };
    for (const [quad, items] of Object.entries(_draft)) {
      if (!quads[quad] || !Array.isArray(items)) continue;
      for (const texto of items) {
        if (!texto) continue;
        const { error } = await capsulaDB.addSwotEquipeItem(_equipeId, quad, texto);
        if (error) throw new Error(error.message || 'Erro ao salvar item SWOT.');
      }
    }
  }

  // ── Sucesso ──────────────────────────────────────────────────

  function showSuccess() {
    const cfg = TIPOS[_tipo];
    const counts = {
      '5w2h': (_draft.items || []).length + ' ações salvas',
      'okrs': (_draft.objetivos || []).length + ' objetivos salvos',
      'swot': Object.values(_draft).flat().filter(Boolean).length + ' itens salvos',
    };
    document.getElementById('success-msg').textContent =
      counts[_tipo] + ' para a equipe "' + _equipeName + '".';

    const links = document.getElementById('success-links');
    links.innerHTML = `
      <a href="${cfg.href}?equipe=${_equipeId}" class="success-link" style="background:rgba(46,196,160,0.1);border:1px solid rgba(46,196,160,0.25);color:#2EC4A0;">Ver ${cfg.label}</a>
      <a href="dashboard.html" class="success-link" style="background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--muted);">Dashboard</a>`;

    goStep(5);
  }

  window.resetWizard = function () {
    _tipo = ''; _modo = 'guided'; _equipeId = ''; _equipeName = ''; _ciclo = ''; _draft = null;
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
    selectMode('guided');
    goStep(0);
  };

  // ── Helpers ──────────────────────────────────────────────────

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function getCiclos() {
    const ciclos = [];
    const now = new Date();
    for (let i = -1; i <= 4; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i * 3, 1);
      const q = Math.floor(d.getMonth() / 3) + 1;
      ciclos.push(`${d.getFullYear()}-Q${q}`);
    }
    return [...new Set(ciclos)];
  }

  // ── Init ──────────────────────────────────────────────────────

  async function init() {
    _user = await capsulaDB.ensureUserData();
    if (!_user) { window.location.href = 'index.html'; return; }
    if (!(_payments.isGerencial() || _payments.isAdmin())) {
      document.body.innerHTML = '<div style="padding:4rem 2rem;text-align:center;"><h2>Acesso restrito</h2><p style="color:var(--muted);margin-top:0.75rem;">O Wizard de IA está disponível apenas no plano Gerencial.</p><p style="margin-top:1.5rem;"><a href="dashboard.html" style="color:var(--accent);">← Voltar ao dashboard</a></p></div>';
      return;
    }

    _equipes = await capsulaDB.getEquipes(_user.email);
    const sel = document.getElementById('sel-equipe-wiz');
    if (!_equipes.length) {
      sel.innerHTML = '<option value="">Nenhuma equipe — crie uma no dashboard</option>';
    } else {
      sel.innerHTML = '<option value="">Selecione...</option>' +
        _equipes.map(e => `<option value="${e.id}">${esc(e.nome)}</option>`).join('');
    }

    const ciclos = getCiclos();
    const now = new Date();
    const cicloAtual = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
    _ciclo = cicloAtual;
    const selC = document.getElementById('sel-ciclo-wiz');
    selC.innerHTML = ciclos.map(c => `<option value="${c}" ${c === cicloAtual ? 'selected' : ''}>${c}</option>`).join('');

    // Pré-seleciona via query string
    const params = new URLSearchParams(window.location.search);
    const preEq = params.get('equipe');
    if (preEq && _equipes.find(e => e.id === preEq)) sel.value = preEq;
    const preTipo = params.get('tipo');
    if (preTipo && TIPOS[preTipo]) {
      const card = document.querySelector(`.type-card[data-type="${preTipo}"]`);
      if (card) selectType(card);
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();

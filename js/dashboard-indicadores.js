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


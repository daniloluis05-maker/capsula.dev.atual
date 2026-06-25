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
        it.status !== 'concluido' && it.status !== 'cancelado' && it.when_data && new Date(it.when_data) < now
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
function getInviteLink(equipeId, equipeName, paraName) {
  const raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user') || '{}';
  const userData = JSON.parse(raw);
  const uid = userData.uid || 'guest';
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  let url = base + 'convite.html?ref=' + uid;
  if (equipeId) url += '&equipe=' + encodeURIComponent(equipeId);
  if (equipeName) url += '&equipe_nome=' + encodeURIComponent(equipeName);
  if (paraName) url += '&para=' + encodeURIComponent(paraName);
  return url;
}

function openInviteModal(equipeId, equipeName) {
  const modal = document.getElementById('invite-modal');
  const input = document.getElementById('invite-link-input');
  const badge = document.getElementById('invite-equipe-badge');
  const nomeEl = document.getElementById('invite-equipe-nome');
  const paraInput = document.getElementById('invite-para-input');
  if (equipeId && equipeName) {
    if (badge) badge.style.display = 'block';
    if (nomeEl) nomeEl.textContent = equipeName;
  } else {
    if (badge) badge.style.display = 'none';
  }
  if (paraInput) paraInput.value = '';
  if (input) {
    input.dataset.equipeId = equipeId || '';
    input.dataset.equipeName = equipeName || '';
    input.value = getInviteLink(equipeId, equipeName);
  }
  if (modal) modal.style.display = 'flex';
}

function atualizarLinkConvite() {
  const input = document.getElementById('invite-link-input');
  const paraInput = document.getElementById('invite-para-input');
  if (!input) return;
  const equipeId = input.dataset.equipeId || undefined;
  const equipeName = input.dataset.equipeName || undefined;
  const paraName = (paraInput && paraInput.value.trim()) || undefined;
  input.value = getInviteLink(equipeId, equipeName, paraName);
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
  const link = _currentInviteLink();
  const paraInput = document.getElementById('invite-para-input');
  const nome = paraInput && paraInput.value.trim();
  const texto = nome
    ? `Olá ${nome}! Acesse o Sistema Gnosis e mapeie seu perfil comportamental gratuitamente: ${link}`
    : `Acesse o Sistema Gnosis e mapeie seu perfil comportamental gratuitamente: ${link}`;
  window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
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

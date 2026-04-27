let _user = null;
let _equipes = [];
let _objetivos = [];
let _ciclo = '';
let _editObjId = '';
let _editKrId = '';
let _editKrObjId = '';
let _updKrId = '';

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function getCiclos() {
  // Gera 6 ciclos: anterior, atual, próximos 4
  const ciclos = [];
  const now = new Date();
  for (let i = -1; i <= 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i*3, 1);
    const q = Math.floor(d.getMonth() / 3) + 1;
    ciclos.push(`${d.getFullYear()}-Q${q}`);
  }
  return [...new Set(ciclos)];
}

function cicloAtual() {
  const now = new Date();
  return `${now.getFullYear()}-Q${Math.floor(now.getMonth()/3) + 1}`;
}

async function init() {
  _user = await capsulaDB.ensureUserData();
  if (!_user) { window.location.href = 'index.html'; return; }
  if (!(_payments.isGerencial() || _payments.isAdmin())) {
    document.body.innerHTML = '<div style="padding:4rem 2rem;text-align:center;"><h2>Acesso restrito</h2><p style="color:var(--muted);margin-top:0.75rem;">OKRs estão disponíveis no plano Gerencial.</p><p style="margin-top:1.5rem;"><a href="dashboard.html" style="color:var(--accent);">← Voltar ao dashboard</a></p></div>';
    return;
  }

  // Popula seletores de ciclo
  const ciclos = getCiclos();
  _ciclo = cicloAtual();
  const selC = document.getElementById('sel-ciclo');
  const selOC = document.getElementById('o-ciclo');
  ciclos.forEach(c => {
    selC.innerHTML += `<option value="${c}" ${c === _ciclo ? 'selected' : ''}>${c}</option>`;
    selOC.innerHTML += `<option value="${c}" ${c === _ciclo ? 'selected' : ''}>${c}</option>`;
  });

  // Carrega equipes para filtro e modal
  _equipes = await capsulaDB.getEquipes(_user.email);
  const selE = document.getElementById('sel-equipe');
  const selOE = document.getElementById('o-equipe');
  _equipes.forEach(e => {
    selE.innerHTML += `<option value="${e.id}">${esc(e.nome)}</option>`;
    selOE.innerHTML += `<option value="${e.id}">${esc(e.nome)}</option>`;
  });

  // Pré-seleciona equipe via ?equipe=
  const params = new URLSearchParams(window.location.search);
  const preEq = params.get('equipe');
  if (preEq && _equipes.find(e => e.id === preEq)) selE.value = preEq;

  await loadObjetivos();
}

async function onCicloChange() {
  _ciclo = document.getElementById('sel-ciclo').value;
  await loadObjetivos();
}

async function loadObjetivos() {
  _objetivos = await capsulaDB.getObjetivos(_user.email, _ciclo);
  const equipeFilter = document.getElementById('sel-equipe').value;
  if (equipeFilter) _objetivos = _objetivos.filter(o => o.equipe_id === equipeFilter);
  renderSummary();
  render();
}

function krProgress(kr) {
  const ini = Number(kr.valor_inicial || 0);
  const meta = Number(kr.valor_meta || 0);
  const atual = Number(kr.valor_atual || 0);
  if (meta === ini) return atual >= meta ? 100 : 0;
  const pct = ((atual - ini) / (meta - ini)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

function objProgress(obj) {
  const krs = obj.key_results || [];
  if (!krs.length) return 0;
  let totalW = 0, sumW = 0;
  krs.forEach(kr => {
    const w = Number(kr.peso || 1);
    sumW += krProgress(kr) * w;
    totalW += w;
  });
  return totalW ? Math.round(sumW / totalW) : 0;
}

function pctColor(pct) {
  if (pct >= 70) return '#2EC4A0';
  if (pct >= 40) return '#7c6af7';
  if (pct >= 15) return '#E8A03A';
  return '#E8603A';
}

function renderSummary() {
  if (!_objetivos.length) { document.getElementById('summary').style.display = 'none'; return; }
  document.getElementById('summary').style.display = 'grid';
  const totalObj = _objetivos.length;
  const totalKR = _objetivos.reduce((s, o) => s + (o.key_results?.length || 0), 0);
  const avgPct = totalObj ? Math.round(_objetivos.reduce((s, o) => s + objProgress(o), 0) / totalObj) : 0;
  const noTrack = _objetivos.reduce((s, o) => {
    return s + (o.key_results || []).filter(kr => Number(kr.valor_atual || 0) === Number(kr.valor_inicial || 0)).length;
  }, 0);
  document.getElementById('sum-obj').textContent = totalObj;
  document.getElementById('sum-kr').textContent = totalKR;
  const elPct = document.getElementById('sum-pct');
  elPct.textContent = avgPct + '%';
  elPct.style.color = pctColor(avgPct);
  document.getElementById('sum-no-track').textContent = noTrack;
}

function render() {
  const area = document.getElementById('content-area');
  if (!_objetivos.length) {
    area.innerHTML = `<div class="empty">Nenhum objetivo no ciclo <strong style="color:#7c6af7;">${esc(_ciclo)}</strong>.<br>Clique em <strong style="color:#7c6af7;">+ Novo Objetivo</strong> para começar.</div>`;
    return;
  }
  area.innerHTML = _objetivos.map(o => {
    const pct = objProgress(o);
    const cor = pctColor(pct);
    const krs = (o.key_results || []).slice().sort((a,b) => (a.ordem||0) - (b.ordem||0));
    const equipe = _equipes.find(e => e.id === o.equipe_id);
    return `
      <div class="obj-card">
        <div class="obj-bar" style="background:linear-gradient(90deg,${o.cor||'#7c6af7'},${cor});"></div>
        <div class="obj-head">
          <div style="flex:1;">
            <div class="obj-title">${esc(o.titulo)}</div>
            ${o.descricao ? `<p style="margin:0.4rem 0 0;font-size:0.82rem;color:var(--muted);line-height:1.45;">${esc(o.descricao)}</p>` : ''}
            <div class="obj-meta">
              <span class="obj-tag" style="color:#7c6af7;border-color:rgba(124,106,247,0.3);background:rgba(124,106,247,0.06);">${esc(o.ciclo)}</span>
              ${equipe ? `<span class="obj-tag" style="color:#2EC4A0;border-color:rgba(46,196,160,0.3);background:rgba(46,196,160,0.06);">${esc(equipe.nome)}</span>` : ''}
              ${o.prazo ? `<span class="obj-tag">📅 ${formatDate(o.prazo)}</span>` : ''}
              ${o.status !== 'ativo' ? `<span class="obj-tag" style="color:${o.status==='concluido'?'#2EC4A0':'#E8603A'};">${o.status === 'concluido' ? '✓ Concluído' : '× Cancelado'}</span>` : ''}
            </div>
          </div>
          <div class="obj-actions">
            <button onclick="editarObjetivo('${o.id}')" title="Editar">✎</button>
            <button class="del" onclick="excluirObjetivo('${o.id}')" title="Remover">×</button>
          </div>
        </div>

        <div class="obj-prog-wrap">
          <div style="display:flex;align-items:flex-end;gap:0.6rem;">
            <div class="obj-prog-num" style="color:${cor};">${pct}%</div>
            <div class="obj-prog-lbl">progresso · ${krs.length} KR${krs.length!==1?'s':''}</div>
          </div>
          <div class="obj-prog-bar"><div class="obj-prog-fill" style="width:${pct}%;background:${cor};"></div></div>
        </div>

        <div class="kr-list">
          ${krs.map(kr => {
            const krPct = krProgress(kr);
            const krCor = pctColor(krPct);
            return `
              <div class="kr-item">
                <div class="kr-pct-circle" style="background:${krCor}1A;color:${krCor};border:2px solid ${krCor}66;">${krPct}%</div>
                <div class="kr-info">
                  <div class="kr-titulo">${esc(kr.titulo)}</div>
                  <div class="kr-track">
                    <span>${kr.valor_atual} / ${kr.valor_meta} ${esc(kr.unidade || '%')}</span>
                    ${kr.peso > 1 ? `<span>· peso ${kr.peso}</span>` : ''}
                    ${kr.responsavel ? `<span class="resp">${esc(kr.responsavel)}</span>` : ''}
                  </div>
                </div>
                <div class="kr-actions">
                  <button class="upd" onclick="abrirUpd('${kr.id}','${esc(kr.titulo).replace(/'/g,"\\'")}', ${kr.valor_atual})">+ Atualizar</button>
                  <button onclick="editarKR('${o.id}','${kr.id}')" title="Editar">✎</button>
                  <button onclick="excluirKR('${kr.id}')" title="Remover">×</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="kr-add">
          <input id="kr-quick-${o.id}" placeholder="Adicionar Key Result rápido..." onkeydown="if(event.key==='Enter')abrirKRComTitulo('${o.id}', this.value)">
          <button onclick="abrirKR('${o.id}')">+ Novo KR</button>
        </div>
      </div>
    `;
  }).join('');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('pt-BR');
}

// ── Modal Objetivo ──
function abrirObjetivo(id) {
  _editObjId = id || '';
  document.getElementById('obj-title-modal').textContent = id ? 'Editar Objetivo' : 'Novo Objetivo';
  document.getElementById('o-err').textContent = '';
  if (id) {
    const o = _objetivos.find(x => x.id === id);
    if (!o) return;
    document.getElementById('o-titulo').value = o.titulo || '';
    document.getElementById('o-descricao').value = o.descricao || '';
    document.getElementById('o-ciclo').value = o.ciclo || _ciclo;
    document.getElementById('o-equipe').value = o.equipe_id || '';
    document.getElementById('o-prazo').value = o.prazo || '';
    document.getElementById('o-status').value = o.status || 'ativo';
  } else {
    document.getElementById('o-titulo').value = '';
    document.getElementById('o-descricao').value = '';
    document.getElementById('o-ciclo').value = _ciclo;
    document.getElementById('o-equipe').value = document.getElementById('sel-equipe').value || '';
    document.getElementById('o-prazo').value = '';
    document.getElementById('o-status').value = 'ativo';
  }
  document.getElementById('modal-obj-bg').classList.add('show');
  setTimeout(() => document.getElementById('o-titulo').focus(), 100);
}

function fecharObjetivo() {
  document.getElementById('modal-obj-bg').classList.remove('show');
  _editObjId = '';
}

function editarObjetivo(id) { abrirObjetivo(id); }

async function excluirObjetivo(id) {
  if (!confirm('Remover este objetivo e todos os seus Key Results?')) return;
  await capsulaDB.deleteObjetivo(id);
  await loadObjetivos();
}

async function salvarObjetivo() {
  const titulo = document.getElementById('o-titulo').value.trim();
  const err = document.getElementById('o-err');
  if (!titulo) { err.textContent = 'Título é obrigatório.'; return; }
  const obj = {
    gerencial_email: _user.email,
    titulo,
    descricao: document.getElementById('o-descricao').value.trim() || null,
    ciclo:     document.getElementById('o-ciclo').value,
    equipe_id: document.getElementById('o-equipe').value || null,
    prazo:     document.getElementById('o-prazo').value || null,
    status:    document.getElementById('o-status').value,
  };
  if (_editObjId) obj.id = _editObjId;
  const { error } = await capsulaDB.saveObjetivo(obj);
  if (error) { err.textContent = 'Erro ao salvar.'; console.error(error); return; }
  fecharObjetivo();
  await loadObjetivos();
}

// ── Modal KR ──
function abrirKR(objetivoId) {
  _editKrId = '';
  _editKrObjId = objetivoId;
  document.getElementById('kr-title-modal').textContent = 'Novo Key Result';
  document.getElementById('kr-err').textContent = '';
  document.getElementById('kr-titulo').value = '';
  document.getElementById('kr-inicial').value = '0';
  document.getElementById('kr-meta').value = '';
  document.getElementById('kr-atual').value = '0';
  document.getElementById('kr-unidade').value = '%';
  document.getElementById('kr-peso').value = '1';
  document.getElementById('kr-resp').value = '';
  document.getElementById('modal-kr-bg').classList.add('show');
  setTimeout(() => document.getElementById('kr-titulo').focus(), 100);
}

function abrirKRComTitulo(objetivoId, titulo) {
  if (!titulo || !titulo.trim()) return;
  abrirKR(objetivoId);
  document.getElementById('kr-titulo').value = titulo.trim();
  document.getElementById('kr-meta').focus();
}

function editarKR(objetivoId, krId) {
  const obj = _objetivos.find(o => o.id === objetivoId);
  if (!obj) return;
  const kr = (obj.key_results || []).find(k => k.id === krId);
  if (!kr) return;
  _editKrId = krId;
  _editKrObjId = objetivoId;
  document.getElementById('kr-title-modal').textContent = 'Editar Key Result';
  document.getElementById('kr-err').textContent = '';
  document.getElementById('kr-titulo').value = kr.titulo;
  document.getElementById('kr-inicial').value = kr.valor_inicial;
  document.getElementById('kr-meta').value = kr.valor_meta;
  document.getElementById('kr-atual').value = kr.valor_atual;
  document.getElementById('kr-unidade').value = kr.unidade || '%';
  document.getElementById('kr-peso').value = kr.peso || 1;
  document.getElementById('kr-resp').value = kr.responsavel || '';
  document.getElementById('modal-kr-bg').classList.add('show');
}

function fecharKR() {
  document.getElementById('modal-kr-bg').classList.remove('show');
  _editKrId = ''; _editKrObjId = '';
}

async function excluirKR(id) {
  if (!confirm('Remover este Key Result?')) return;
  await capsulaDB.deleteKeyResult(id);
  await loadObjetivos();
}

async function salvarKR() {
  const titulo = document.getElementById('kr-titulo').value.trim();
  const meta   = document.getElementById('kr-meta').value;
  const err = document.getElementById('kr-err');
  if (!titulo) { err.textContent = 'Título é obrigatório.'; return; }
  if (meta === '' || isNaN(Number(meta))) { err.textContent = 'Valor meta é obrigatório.'; return; }
  const kr = {
    objetivo_id:   _editKrObjId,
    titulo,
    valor_inicial: parseFloat(document.getElementById('kr-inicial').value || 0),
    valor_atual:   parseFloat(document.getElementById('kr-atual').value || 0),
    valor_meta:    parseFloat(meta),
    unidade:       document.getElementById('kr-unidade').value,
    peso:          parseInt(document.getElementById('kr-peso').value || 1, 10),
    responsavel:   document.getElementById('kr-resp').value.trim() || null,
  };
  if (_editKrId) kr.id = _editKrId;
  const { error } = await capsulaDB.saveKeyResult(kr);
  if (error) { err.textContent = 'Erro ao salvar.'; console.error(error); return; }
  fecharKR();
  await loadObjetivos();
}

// ── Modal Atualizar KR ──
function abrirUpd(krId, titulo, atualLimpo) {
  _updKrId = krId;
  document.getElementById('upd-titulo').textContent = titulo;
  document.getElementById('upd-valor').value = atualLimpo;
  document.getElementById('upd-comentario').value = '';
  document.getElementById('upd-err').textContent = '';
  document.getElementById('modal-upd-bg').classList.add('show');
  setTimeout(() => document.getElementById('upd-valor').focus(), 100);
}

function fecharUpd() {
  document.getElementById('modal-upd-bg').classList.remove('show');
  _updKrId = '';
}

async function salvarUpd() {
  const valor = document.getElementById('upd-valor').value;
  const err = document.getElementById('upd-err');
  if (valor === '' || isNaN(Number(valor))) { err.textContent = 'Informe um valor numérico.'; return; }
  const com = document.getElementById('upd-comentario').value.trim();
  const { error } = await capsulaDB.addKrUpdate(_updKrId, parseFloat(valor), com);
  if (error) { err.textContent = 'Erro ao registrar.'; return; }
  fecharUpd();
  await loadObjetivos();
}

document.addEventListener('DOMContentLoaded', init);
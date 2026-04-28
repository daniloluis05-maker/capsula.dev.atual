let _user = null;
let _equipes = [];
let _equipeId = '';
let _atividades = [];
let _atribuicoes = [];
let _membros = [];

async function init() {
  _user = await capsulaDB.ensureUserData();
  if (!_user) { window.location.href = 'index.html'; return; }
  if (!(_payments.isGerencial() || _payments.isAdmin())) {
    document.body.innerHTML = '<div style="padding:4rem 2rem;text-align:center;"><h2>Acesso restrito</h2><p style="color:var(--muted);margin-top:0.75rem;">Esta ferramenta está disponível apenas para usuários do plano Gerencial.</p><p style="margin-top:1.5rem;"><a href="dashboard.html" style="color:var(--accent);">← Voltar ao dashboard</a></p></div>';
    return;
  }
  _equipes = await capsulaDB.getEquipes(_user.email);
  const sel = document.getElementById('sel-equipe');
  if (!_equipes.length) {
    sel.innerHTML = '<option value="">Nenhuma equipe — crie uma no dashboard</option>';
    sel.disabled = true;
    return;
  }
  sel.innerHTML = '<option value="">Selecione...</option>' + _equipes.map(e => `<option value="${e.id}">${esc(e.nome)}</option>`).join('');

  const params = new URLSearchParams(window.location.search);
  const preEq = params.get('equipe');
  if (preEq && _equipes.find(e => e.id === preEq)) {
    sel.value = preEq;
    onEquipeChange();
  }
}

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function onEquipeChange() {
  _equipeId = document.getElementById('sel-equipe').value;
  if (!_equipeId) {
    document.getElementById('content-area').innerHTML = '<div class="empty">Selecione uma equipe acima para ver a matriz RACI.</div>';
    return;
  }
  const eq = _equipes.find(e => e.id === _equipeId);
  _membros = (eq && eq.equipe_membros) ? eq.equipe_membros : [];
  if (!_membros.length) {
    document.getElementById('content-area').innerHTML = `<div class="empty">Esta equipe ainda não tem membros.<br><a href="dashboard.html" style="color:var(--accent);font-weight:600;">← Adicionar membros no Dashboard</a></div>`;
    return;
  }
  await loadRaci();
}

async function loadRaci() {
  const { atividades, atribuicoes } = await capsulaDB.getRACI(_equipeId);
  _atividades = atividades;
  _atribuicoes = atribuicoes;
  renderMatrix();
  validateRules();
  const pdfBtn = document.getElementById('btn-pdf');
  if (pdfBtn) pdfBtn.style.display = _atividades.length && _membros.length ? 'inline-block' : 'none';
}

function getPapel(atividadeId, membroId) {
  const a = _atribuicoes.find(x => x.atividade_id === atividadeId && x.membro_id === membroId);
  return a ? a.papel : null;
}

function renderMatrix() {
  const area = document.getElementById('content-area');
  const headerCols = _membros.map(m => `<th title="${esc(m.email||'')}">${esc(firstName(m.nome))}</th>`).join('');
  const rows = _atividades.length
    ? _atividades.map(at => `
        <tr data-ativ="${at.id}">
          <td><div class="ativ-cell">${esc(at.atividade)}</div></td>
          ${_membros.map(m => `
            <td>
              <div class="raci-pick">
                ${['R','A','C','I'].map(p => {
                  const cur = getPapel(at.id, m.id);
                  return `<button class="raci-btn ${cur===p?'active papel-'+p:''}" onclick="setPapel('${at.id}','${m.id}','${p}')">${p}</button>`;
                }).join('')}
              </div>
            </td>
          `).join('')}
          <td><div class="ativ-actions"><button onclick="delAtividade('${at.id}')" title="Remover">×</button></div></td>
        </tr>`).join('')
    : '';

  area.innerHTML = `
    <div class="matrix-wrap">
      <table class="raci">
        <thead>
          <tr>
            <th>Atividade</th>
            ${headerCols}
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="${_membros.length+2}" class="empty" style="padding:2rem;">Nenhuma atividade. Adicione abaixo.</td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="add-bar">
      <input id="f-atividade" type="text" placeholder="Ex: Aprovar release semanal" onkeydown="if(event.key==='Enter')addAtividade()">
      <button class="btn-add" onclick="addAtividade()">+ Adicionar Atividade</button>
    </div>
  `;
}

function firstName(n) {
  return (n || '').split(' ')[0] || '?';
}

async function addAtividade() {
  const inp = document.getElementById('f-atividade');
  const v = (inp.value || '').trim();
  if (!v) { inp.focus(); return; }
  const { error } = await capsulaDB.addRaciAtividade(_equipeId, v);
  if (error) { alert('Erro ao adicionar atividade.'); return; }
  inp.value = '';
  await loadRaci();
}

async function delAtividade(id) {
  if (!confirm('Remover esta atividade e suas atribuições?')) return;
  await capsulaDB.deleteRaciAtividade(id);
  await loadRaci();
}

async function setPapel(atividadeId, membroId, papel) {
  const cur = getPapel(atividadeId, membroId);
  const novo = (cur === papel) ? null : papel;  // toggle
  // Atualização otimista
  _atribuicoes = _atribuicoes.filter(a => !(a.atividade_id === atividadeId && a.membro_id === membroId));
  if (novo) _atribuicoes.push({ atividade_id: atividadeId, membro_id: membroId, papel: novo });
  renderMatrix();
  validateRules();
  await capsulaDB.setRaciAtribuicao(atividadeId, membroId, novo);
}

function validateRules() {
  const warn = document.getElementById('warn-rule');
  const issues = [];
  _atividades.forEach(at => {
    const aCount = _atribuicoes.filter(a => a.atividade_id === at.id && a.papel === 'A').length;
    const rCount = _atribuicoes.filter(a => a.atividade_id === at.id && a.papel === 'R').length;
    if (aCount === 0 && (rCount > 0 || _atribuicoes.some(a => a.atividade_id === at.id))) {
      issues.push(`"${at.atividade}" não tem Accountable (A)`);
    } else if (aCount > 1) {
      issues.push(`"${at.atividade}" tem ${aCount} Accountables (deveria ter apenas 1)`);
    }
  });
  if (issues.length) {
    warn.style.display = 'block';
    warn.innerHTML = '⚠ ' + issues.slice(0, 3).map(esc).join(' · ') + (issues.length > 3 ? ` (+${issues.length-3})` : '');
  } else {
    warn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', init);
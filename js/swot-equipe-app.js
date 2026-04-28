let _user = null;
let _equipes = [];
let _equipeId = '';
let _items = [];

const QUADRANTES = [
  { key: 'forcas',         label: 'Forças',         icon: '↑', desc: 'Internas — o que a equipe faz bem' },
  { key: 'fraquezas',      label: 'Fraquezas',      icon: '↓', desc: 'Internas — pontos a melhorar' },
  { key: 'oportunidades',  label: 'Oportunidades',  icon: '↗', desc: 'Externas — tendências favoráveis' },
  { key: 'ameacas',        label: 'Ameaças',        icon: '↘', desc: 'Externas — riscos do contexto' },
];

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

function updateBackLink(equipeId) {
  const lnk = document.getElementById('back-link');
  if (!lnk) return;
  const eq = _equipes.find(e => e.id === equipeId);
  if (eq) { lnk.href = 'equipe.html?id=' + equipeId; lnk.textContent = '← ' + eq.nome; }
  else { lnk.href = 'dashboard.html'; lnk.textContent = '← Dashboard'; }
}

async function onEquipeChange() {
  _equipeId = document.getElementById('sel-equipe').value;
  updateBackLink(_equipeId);
  const wizBtn = document.getElementById('btn-wizard');
  if (wizBtn) wizBtn.href = 'wizard.html?tipo=swot' + (_equipeId ? '&equipe=' + _equipeId : '');
  if (!_equipeId) {
    document.getElementById('content-area').innerHTML = '<div class="empty">Selecione uma equipe acima para ver a análise SWOT.</div>';
    return;
  }
  await loadItems();
}

async function loadItems() {
  _items = await capsulaDB.getSwotEquipe(_equipeId);
  renderQuadrantes();
}

function renderQuadrantes() {
  const area = document.getElementById('content-area');
  const counts = {};
  QUADRANTES.forEach(q => counts[q.key] = _items.filter(i => i.quadrante === q.key).length);

  area.innerHTML = `
    <div class="swot-grid">
      ${QUADRANTES.map(q => {
        const items = _items.filter(i => i.quadrante === q.key);
        return `
          <div class="swot-card ${q.key}">
            <div class="swot-head">
              <div class="swot-title"><span class="swot-icon">${q.icon}</span> ${q.label}</div>
              <span class="swot-count">${items.length} item${items.length!==1?'s':''}</span>
            </div>
            <div style="font-size:0.72rem;color:var(--muted);margin:-0.5rem 0 0.85rem;font-style:italic;">${q.desc}</div>
            <div class="swot-list">
              ${items.length
                ? items.map(it => `<div class="swot-item"><span class="txt">${esc(it.texto)}</span><button class="del" onclick="delItem('${it.id}')" title="Remover">×</button></div>`).join('')
                : '<div class="empty-quad">Adicione itens abaixo</div>'}
            </div>
            <div class="swot-add">
              <input id="inp-${q.key}" type="text" placeholder="Adicionar ${q.label.toLowerCase()}..." onkeydown="if(event.key==='Enter')addItem('${q.key}')">
              <button onclick="addItem('${q.key}')">+ Adicionar</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="summary-bar">
      ${QUADRANTES.map(q => `
        <div class="summary-item">
          <div class="summary-num" style="color:${q.key==='forcas'?'#2EC4A0':q.key==='fraquezas'?'#E8603A':q.key==='oportunidades'?'#1BA8D4':'#C9A84C'};">${counts[q.key]}</div>
          <div class="summary-lbl">${q.label}</div>
        </div>
      `).join('')}
    </div>
  `;
}

async function addItem(quad) {
  const inp = document.getElementById('inp-' + quad);
  const v = (inp.value || '').trim();
  if (!v) { inp.focus(); return; }
  const { error } = await capsulaDB.addSwotEquipeItem(_equipeId, quad, v);
  if (error) { alert('Erro ao adicionar.'); return; }
  inp.value = '';
  await loadItems();
  document.getElementById('inp-' + quad)?.focus();
}

async function delItem(id) {
  if (!confirm('Remover este item?')) return;
  await capsulaDB.deleteSwotEquipeItem(id);
  await loadItems();
}

document.addEventListener('DOMContentLoaded', init);
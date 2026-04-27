let _user = null;
let _equipes = [];
let _equipeId = '';
let _items = [];
let _editId = '';

const PRIORIDADE_LABEL = { baixa:'Baixa', media:'Média', alta:'Alta', critica:'Crítica' };
const STATUS_LABEL = { pendente:'Pendente', em_andamento:'Em andamento', concluido:'Concluído', cancelado:'Cancelado' };

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

  // Pré-seleciona via ?equipe=ID
  const params = new URLSearchParams(window.location.search);
  const preEq = params.get('equipe');
  if (preEq && _equipes.find(e => e.id === preEq)) {
    sel.value = preEq;
    onEquipeChange();
  }
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function onEquipeChange() {
  _equipeId = document.getElementById('sel-equipe').value;
  document.getElementById('btn-add').disabled = !_equipeId;
  if (!_equipeId) {
    document.getElementById('content-area').innerHTML = '<div class="empty">Selecione uma equipe.</div>';
    document.getElementById('stats').style.display = 'none';
    return;
  }
  await loadItems();
}

async function loadItems() {
  _items = await capsulaDB.getPlanoAcao(_equipeId);
  renderStats();
  renderTable();
}

function renderStats() {
  document.getElementById('stats').style.display = 'grid';
  const total = _items.length;
  const pend  = _items.filter(i => i.status === 'pendente').length;
  const and   = _items.filter(i => i.status === 'em_andamento').length;
  const con   = _items.filter(i => i.status === 'concluido').length;
  const pct   = total ? Math.round((con / total) * 100) : 0;
  document.getElementById('st-total').textContent = total;
  document.getElementById('st-pendente').textContent = pend;
  document.getElementById('st-andamento').textContent = and;
  document.getElementById('st-concluido').textContent = con;
  document.getElementById('st-pct').textContent = pct + '%';
}

function renderTable() {
  const area = document.getElementById('content-area');
  if (!_items.length) {
    area.innerHTML = '<div class="empty">Nenhuma ação cadastrada para esta equipe.<br>Clique em <strong style="color:#1BA8D4;">+ Nova Ação</strong> para começar.</div>';
    return;
  }
  area.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>O Quê</th><th>Por Quê</th><th>Onde</th><th>Quando</th><th>Quem</th><th>Como</th><th>R$</th><th>Status</th><th>Prio.</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${_items.map(it => `
            <tr>
              <td class="what-cell">${esc(it.what)}</td>
              <td class="text-cell">${esc(it.why || '—')}</td>
              <td class="text-cell">${esc(it.where_loc || '—')}</td>
              <td>${it.when_data ? formatDate(it.when_data) : '—'}</td>
              <td>${esc(it.who || '—')}</td>
              <td class="text-cell">${esc(it.how || '—')}</td>
              <td>${it.how_much != null ? 'R$ ' + Number(it.how_much).toFixed(2).replace('.',',') : '—'}</td>
              <td><span class="st-tag st-${it.status}">${STATUS_LABEL[it.status] || it.status}</span></td>
              <td><span class="pri-tag pri-${it.prioridade}">${PRIORIDADE_LABEL[it.prioridade] || it.prioridade}</span></td>
              <td><div class="row-actions"><button onclick="editItem('${it.id}')">✎</button><button class="del" onclick="delItem('${it.id}')">×</button></div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('pt-BR');
}

function openModal(id) {
  _editId = id || '';
  document.getElementById('modal-title').textContent = id ? 'Editar Ação' : 'Nova Ação';
  document.getElementById('f-err').textContent = '';
  if (id) {
    const it = _items.find(i => i.id === id);
    if (!it) return;
    document.getElementById('f-what').value = it.what || '';
    document.getElementById('f-why').value = it.why || '';
    document.getElementById('f-where').value = it.where_loc || '';
    document.getElementById('f-when').value = it.when_data || '';
    document.getElementById('f-who').value = it.who || '';
    document.getElementById('f-how').value = it.how || '';
    document.getElementById('f-howmuch').value = it.how_much != null ? it.how_much : '';
    document.getElementById('f-status').value = it.status || 'pendente';
    document.getElementById('f-prioridade').value = it.prioridade || 'media';
  } else {
    ['f-what','f-why','f-where','f-when','f-who','f-how','f-howmuch'].forEach(k => document.getElementById(k).value = '');
    document.getElementById('f-status').value = 'pendente';
    document.getElementById('f-prioridade').value = 'media';
  }
  document.getElementById('modal-bg').classList.add('show');
  setTimeout(() => document.getElementById('f-what').focus(), 100);
}

function closeModal() {
  document.getElementById('modal-bg').classList.remove('show');
  _editId = '';
}

function editItem(id) { openModal(id); }

async function delItem(id) {
  if (!confirm('Remover esta ação?')) return;
  await capsulaDB.deletePlanoAcaoItem(id);
  await loadItems();
}

async function saveItem() {
  const what = document.getElementById('f-what').value.trim();
  const err = document.getElementById('f-err');
  if (!what) { err.textContent = 'O campo "O quê" é obrigatório.'; return; }
  const item = {
    equipe_id:  _equipeId,
    what,
    why:        document.getElementById('f-why').value.trim() || null,
    where_loc:  document.getElementById('f-where').value.trim() || null,
    when_data:  document.getElementById('f-when').value || null,
    who:        document.getElementById('f-who').value.trim() || null,
    how:        document.getElementById('f-how').value.trim() || null,
    how_much:   document.getElementById('f-howmuch').value ? parseFloat(document.getElementById('f-howmuch').value) : null,
    status:     document.getElementById('f-status').value,
    prioridade: document.getElementById('f-prioridade').value,
  };
  if (_editId) item.id = _editId;
  const { error } = await capsulaDB.savePlanoAcaoItem(item);
  if (error) { err.textContent = 'Erro ao salvar. Tente novamente.'; return; }
  closeModal();
  await loadItems();
}

document.addEventListener('DOMContentLoaded', init);
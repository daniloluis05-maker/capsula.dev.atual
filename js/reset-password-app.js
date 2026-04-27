(async function () {
  const loadingCard = document.getElementById('loading-card');
  const formCard    = document.getElementById('form-card');
  const errorCard   = document.getElementById('error-card');
  const errorMsg    = document.getElementById('error-msg');
  const successMsg  = document.getElementById('success-msg');
  const salvarBtn   = document.getElementById('salvar-btn');
  const novaSenha   = document.getElementById('nova-senha');
  const confirmarSenha = document.getElementById('confirmar-senha');

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    successMsg.style.display = 'none';
  }

  function showSuccess(msg) {
    successMsg.textContent = msg;
    successMsg.style.display = 'block';
    errorMsg.style.display = 'none';
  }

  // Aguarda sessão de recovery
  let session = null;
  let attempts = 0;
  while (!session && attempts < 5) {
    const result = await capsulaDB.authGetSession();
    session = result.session;
    if (!session) await new Promise(r => setTimeout(r, 600));
    attempts++;
  }

  if (!session) {
    loadingCard.style.display = 'none';
    errorCard.style.display = 'block';
    return;
  }

  loadingCard.style.display = 'none';
  formCard.style.display = 'block';

  salvarBtn.addEventListener('click', async () => {
    const senha = novaSenha.value.trim();
    const confirmar = confirmarSenha.value.trim();

    if (!senha || senha.length < 6) {
      showError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      showError('As senhas não coincidem.');
      return;
    }

    salvarBtn.disabled = true;
    salvarBtn.textContent = 'Salvando…';
    errorMsg.style.display = 'none';

    try {
      const db = capsulaDB.getDB();
      const { error } = await db.auth.updateUser({ password: senha });

      if (error) {
        showError(error.message || 'Erro ao atualizar senha.');
        salvarBtn.disabled = false;
        salvarBtn.textContent = 'Salvar nova senha';
        return;
      }

      showSuccess('Senha atualizada com sucesso! Redirecionando…');
      salvarBtn.disabled = true;
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
    } catch (e) {
      showError(e.message || 'Erro inesperado.');
      salvarBtn.disabled = false;
      salvarBtn.textContent = 'Salvar nova senha';
    }
  });

  // Enter para submeter
  [novaSenha, confirmarSenha].forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') salvarBtn.click(); });
  });
})();
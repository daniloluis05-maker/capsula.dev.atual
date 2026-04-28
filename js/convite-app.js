(function() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  const equipeId = params.get('equipe');
  const equipeNome = params.get('equipe_nome');
  const para = params.get('para');
  if (ref) {
    document.getElementById('invited-by-badge').style.display = 'inline-block';
  }
  if (equipeNome) {
    const badge = document.getElementById('equipe-badge');
    const nomeEl = document.getElementById('equipe-nome-badge');
    if (badge) badge.style.display = 'block';
    if (nomeEl) nomeEl.textContent = decodeURIComponent(equipeNome);
  }
  if (para) {
    const nome = decodeURIComponent(para);
    const title = document.getElementById('invite-title');
    const sub = document.getElementById('invite-sub');
    const nomeInput = document.getElementById('nome');
    if (title) title.textContent = `Olá, ${nome}!`;
    if (sub) sub.textContent = 'Este convite é especialmente para você. Crie sua conta e comece seu mapeamento de perfil.';
    if (nomeInput) nomeInput.value = nome;
  }

  const pwBtn = document.getElementById('btn-pw-toggle');
  if (pwBtn) {
    pwBtn.addEventListener('click', function() {
      const inp = document.getElementById('senha');
      if (!inp) return;
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      pwBtn.style.opacity = show ? '1' : '0.45';
    });
  }

  document.getElementById('btn-submit').addEventListener('click', async function() {
    const nome  = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const errEl = document.getElementById('error-msg');
    errEl.style.display = 'none';

    if (!nome)            return showErr('Informe seu nome.');
    if (!email)           return showErr('Informe seu e-mail.');
    if (senha.length < 6) return showErr('A senha precisa ter no mínimo 6 caracteres.');

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = 'Criando conta...';

    try {
      const { data, error, confirmEmail } = await capsulaDB.authSignUp(email, senha, nome, 'individual');
      if (error) { showErr(error.message || 'Erro ao criar conta.'); return; }
      if (confirmEmail) { showErr('Confirme seu e-mail para continuar.'); return; }

      if (data) {
        if (ref) {
          try { localStorage.setItem('capsula_invitedBy', ref); } catch(_) {}
        }
        if (equipeId) {
          try { localStorage.setItem('capsula_invitedEquipe', equipeId); } catch(_) {}
          try { localStorage.setItem('capsula_invitedEquipeNome', decodeURIComponent(equipeNome || '')); } catch(_) {}
        }
        document.getElementById('form-state').style.display = 'none';
        document.getElementById('success-state').style.display = 'block';
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1400);
      }
    } catch(e) {
      showErr('Erro inesperado. Tente novamente.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Criar conta grátis →';
    }

    function showErr(msg) {
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }
  });
})();
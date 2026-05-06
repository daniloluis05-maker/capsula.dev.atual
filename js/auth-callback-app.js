(async function () {
  const titleEl   = document.getElementById('title');
  const msgEl     = document.getElementById('msg');
  const spinnerEl = document.getElementById('spinner');

  function showError(msg) {
    spinnerEl.style.display = 'none';
    spinnerEl.insertAdjacentHTML('afterend', '<div class="error-icon">✗</div>');
    titleEl.textContent = 'Erro na autenticação';
    msgEl.innerHTML = (msg || 'Algo deu errado.') + '<br><br><a href="index.html">← Voltar para a página inicial</a>';
  }

  try {
    // Detecta tipo de callback (OAuth ou recuperação de senha)
    const params = new URLSearchParams(window.location.search);
    const isRecovery = params.get('type') === 'recovery'
      || window.location.hash.includes('type=recovery');

    if (isRecovery) {
      // Redireciona para uma página de redefinição de senha (futura melhoria)
      // Por ora, redireciona ao dashboard que detectará a sessão
      titleEl.textContent = 'Redefinindo senha…';
      msgEl.textContent   = 'Aguarde enquanto preparamos a troca de senha.';
    }

    // O SDK Supabase v2 troca automaticamente o code/hash por sessão
    // quando detectSessionInUrl = true (padrão). Aguardamos a sessão.
    // Backoff progressivo cobre até ~12s para conexões lentas (3G, OAuth do Google).
    let session = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (!session && attempts < MAX_ATTEMPTS) {
      const result = await capsulaDB.authGetSession();
      session = result.session;
      if (!session) {
        await new Promise(r => setTimeout(r, 400 + attempts * 200));
      }
      attempts++;
    }

    if (!session) {
      showError('Sessão não encontrada. O link pode ter expirado.');
      return;
    }

    const user = session.user;

    if (isRecovery) {
      titleEl.textContent = 'Link verificado!';
      msgEl.textContent   = 'Redirecionando para redefinição de senha…';
      setTimeout(() => { window.location.href = 'reset-password.html'; }, 800);
      return;
    }

    titleEl.textContent = 'Bem-vindo(a)!';
    msgEl.textContent   = 'Carregando seu perfil…';

    // Carrega ou cria o perfil na tabela usuarios
    const profile = await capsulaDB.authLoadUserProfile(user);

    // Persiste no localStorage para compatibilidade com o restante da app
    try {
      const profileStr = JSON.stringify(profile);
      localStorage.setItem('capsula_user', profileStr);
      let users = [];
      try {
        const raw = localStorage.getItem('capsula_users');
        if (raw) users = JSON.parse(raw);
      } catch(_) {}
      const idx = users.findIndex(u => u.email === profile.email);
      if (idx >= 0) users[idx] = profile; else users.push(profile);
      localStorage.setItem('capsula_users', JSON.stringify(users));
    } catch(e) { console.warn('[callback] localStorage:', e); }

    // Se um fluxo anterior (ex: convite.html?next=disc.html?token=…) salvou
    // um destino, vai pra ele em vez do dashboard. Validamos pra evitar
    // open-redirect — só caminhos relativos do mesmo site.
    let nextHref = '';
    try {
      const raw = localStorage.getItem('gnosis_post_login_next') || '';
      if (raw && !/^[a-z][a-z0-9+.-]*:/i.test(raw) && !raw.startsWith('//')) {
        nextHref = raw;
      }
      localStorage.removeItem('gnosis_post_login_next');
    } catch(_) {}

    const target = nextHref || 'dashboard.html';
    msgEl.textContent = nextHref ? 'Redirecionando…' : 'Redirecionando para o dashboard…';
    setTimeout(() => { window.location.href = target; }, 800);

  } catch (e) {
    console.error('[auth-callback]', e);
    showError(e.message || 'Erro inesperado.');
  }
})();
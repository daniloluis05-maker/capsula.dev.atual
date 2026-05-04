  // ── Modal ─────────────────────────────────────────────────────
  const modal            = document.getElementById('modal');
  const formContent      = document.getElementById('form-content');
  const loginContent     = document.getElementById('login-content');
  const forgotContent    = document.getElementById('forgot-content');
  const successMsg       = document.getElementById('success-msg');
  const confirmEmailMsg  = document.getElementById('confirm-email-msg');
  const loginSuccessMsg  = document.getElementById('login-success-msg');
  const forgotSuccessMsg = document.getElementById('forgot-success-msg');
  const loginError       = document.getElementById('login-error');

  const ALL_PANELS = [formContent, loginContent, forgotContent, successMsg, confirmEmailMsg, loginSuccessMsg, forgotSuccessMsg];

  function showPanel(name) {
    ALL_PANELS.forEach(p => { if (p) p.style.display = 'none'; });
    loginError.style.display = 'none';
    const map = {
      signup:        formContent,
      login:         loginContent,
      forgot:        forgotContent,
      success:       successMsg,
      confirmEmail:  confirmEmailMsg,
      loginSuccess:  loginSuccessMsg,
      forgotSuccess: forgotSuccessMsg,
    };
    if (map[name]) map[name].style.display = 'block';
  }

  function showError(msg) {
    loginError.textContent = msg;
    loginError.style.display = 'block';
  }

  function openModal(tab) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    switchModalTab(tab || 'signup');
    document.getElementById('modal-close-btn').focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      switchModalTab('signup');
      clearFieldErrors();
    }, 300);
  }

  function switchModalTab(tab) {
    document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    showPanel(tab);
  }

  // Modal-tab buttons
  document.getElementById('tab-signup').addEventListener('click', () => switchModalTab('signup'));
  document.getElementById('tab-login').addEventListener('click', () => switchModalTab('login'));

  // Delegação: qualquer botão com [data-modal-open] abre o modal
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-open]')) openModal('signup');
  });

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // ── Tabs da página (Eixo Individual / Equipe) ─────────────────
  document.querySelector('.tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  });

  // ── Helpers ───────────────────────────────────────────────────
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function showFieldError(id, msg) {
    const input = document.getElementById(id);
    if (!input) return;
    input.classList.add('input--error');
    let err = input.parentElement.querySelector('.field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error';
      input.parentElement.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(e => e.remove());
    ['nome', 'email', 'senha', 'objetivo', 'login-email', 'login-senha', 'forgot-email'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('input--error');
    });
  }

  // ── E-mail de boas-vindas (P6) ───────────────────────────────
  // Requer configuração de EmailJS: adicione suas credenciais em js/config.js
  // EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_WELCOME, EMAILJS_PUBLIC_KEY
  function sendWelcomeEmail(nome, email) {
    try {
      if (typeof window.EMAILJS_PUBLIC_KEY === 'undefined') return; // não configurado
      emailjs.init(window.EMAILJS_PUBLIC_KEY);
      emailjs.send(window.EMAILJS_SERVICE_ID, window.EMAILJS_TEMPLATE_WELCOME, {
        to_name: nome,
        to_email: email,
        from_name: 'Sistema Gnosis',
        reply_to: 'suporte@www.sistema-gnosis.com.br',
      });
    } catch(_) { /* silencioso — não bloqueia o fluxo */ }
  }

  // Persiste dados do usuário no localStorage após auth bem-sucedida
  function persistUserLocally(userData) {
    try {
      const userDataStr = JSON.stringify(userData);
      capsulaDB.lsSetRaw('capsula_user', userDataStr);
      let users = [];
      try { users = capsulaDB.lsGetUsers(); } catch(_) {}
      const idx = users.findIndex(u => u.email === userData.email);
      if (idx >= 0) users[idx] = userData; else users.push(userData);
      capsulaDB.lsSetUsers(users);
    } catch(e) { console.warn('[auth] localStorage indisponível:', e); }
  }

  // ── Cadastro ──────────────────────────────────────────────────
  let isSubmitting = false;

  document.getElementById('form-submit-btn').addEventListener('click', async () => {
    if (isSubmitting) return;
    clearFieldErrors();
    loginError.style.display = 'none';

    const nome     = document.getElementById('nome').value.trim();
    const email    = document.getElementById('email').value.trim();
    const senha    = document.getElementById('senha').value;
    const objetivo = document.getElementById('objetivo').value;
    let valid = true;

    if (!nome)                     { showFieldError('nome',    'Informe seu nome.');                       valid = false; }
    else if (nome.length < 2)      { showFieldError('nome',    'Nome muito curto.');                       valid = false; }
    if (!email)                    { showFieldError('email',   'Informe seu e-mail.');                     valid = false; }
    else if (!validateEmail(email)){ showFieldError('email',   'E-mail inválido. Ex: voce@dominio.com');   valid = false; }
    if (!senha)                    { showFieldError('senha',   'Crie uma senha.');                         valid = false; }
    else if (senha.length < 6)     { showFieldError('senha',   'A senha precisa ter no mínimo 6 caracteres.'); valid = false; }
    if (!objetivo)                 { showFieldError('objetivo','Selecione um objetivo.');                  valid = false; }
    if (!valid) return;

    isSubmitting = true;
    const btn = document.getElementById('form-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Criando conta...';

    try {
      const { data, session, confirmEmail, error } = await capsulaDB.authSignUp(email, senha, nome, objetivo);

      if (error) {
        const msgs = {
          'User already registered': 'Este e-mail já está cadastrado. Faça login.',
          'Password should be at least 6 characters': 'A senha precisa ter no mínimo 6 caracteres.',
        };
        showError(msgs[error.message] || (error.message || 'Erro ao criar conta. Tente novamente.'));
        return;
      }

      if (confirmEmail) {
        // Supabase exige confirmação de e-mail
        showPanel('confirmEmail');
        return;
      }

      // Cadastro e login imediatos
      if (data) {
        sessionStorage.setItem('capsula_is_new_user', '1');
        persistUserLocally(data);
        sendWelcomeEmail(nome || email, email);
        showPanel('success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
      }
    } catch(e) {
      console.error('[cadastro]', e);
      showError('Erro inesperado. Tente novamente.');
    } finally {
      isSubmitting = false;
      btn.disabled = false;
      btn.textContent = 'Criar conta grátis →';
    }
  });

  // ── Login ─────────────────────────────────────────────────────
  let isLoggingIn = false;

  document.getElementById('login-submit-btn').addEventListener('click', async () => {
    if (isLoggingIn) return;
    clearFieldErrors();
    loginError.style.display = 'none';

    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    if (!email)                    { showFieldError('login-email', 'Informe seu e-mail.'); return; }
    if (!validateEmail(email))     { showFieldError('login-email', 'E-mail inválido.');    return; }
    if (!senha)                    { showFieldError('login-senha', 'Informe sua senha.');  return; }

    isLoggingIn = true;
    const btn = document.getElementById('login-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
      const { data, error } = await capsulaDB.authSignIn(email, senha);

      if (error) {
        const msgs = {
          'Invalid login credentials': 'E-mail ou senha incorretos.',
          'Email not confirmed': 'Confirme seu e-mail antes de fazer login.',
        };
        showError(msgs[error.message] || (error.message || 'Erro ao entrar. Verifique suas credenciais.'));
        return;
      }

      if (data) {
        persistUserLocally(data);
        showPanel('loginSuccess');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
      }
    } catch(e) {
      console.error('[login]', e);
      showError('Erro inesperado. Tente novamente.');
    } finally {
      isLoggingIn = false;
      btn.disabled = false;
      btn.textContent = 'Entrar →';
    }
  });

  // ── Enter submete os formulários ──────────────────────────────
  document.getElementById('login-senha').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('login-submit-btn').click();
  });
  document.getElementById('senha').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('form-submit-btn').click();
  });

  // ── Google OAuth ──────────────────────────────────────────────
  async function handleGoogleAuth(btnId) {
    const btn = document.getElementById(btnId);
    btn.disabled = true;
    btn.textContent = 'Redirecionando...';
    try {
      const { error } = await capsulaDB.authSignInWithGoogle();
      if (error) {
        showError(error.message || 'Erro ao iniciar login com Google.');
        btn.disabled = false;
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg> Continuar com Google';
      }
      // Se sem erro, o browser já redirecionou — não há mais nada a fazer aqui
    } catch(e) {
      console.error('[google-auth]', e);
      showError('Erro ao conectar com Google.');
      btn.disabled = false;
    }
  }

  document.getElementById('signup-google-btn').addEventListener('click', () => handleGoogleAuth('signup-google-btn'));
  document.getElementById('login-google-btn').addEventListener('click',  () => handleGoogleAuth('login-google-btn'));

  // ── Recuperar senha ───────────────────────────────────────────
  document.getElementById('forgot-password-btn').addEventListener('click', () => {
    const email = document.getElementById('login-email').value.trim();
    showPanel('forgot');
    if (email) document.getElementById('forgot-email').value = email;
  });

  document.getElementById('back-to-login-btn').addEventListener('click', () => showPanel('login'));

  document.getElementById('forgot-submit-btn').addEventListener('click', async () => {
    clearFieldErrors();
    const email = document.getElementById('forgot-email').value.trim();
    if (!email)                { showFieldError('forgot-email', 'Informe seu e-mail.'); return; }
    if (!validateEmail(email)) { showFieldError('forgot-email', 'E-mail inválido.');    return; }

    const btn = document.getElementById('forgot-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const { error } = await capsulaDB.authResetPassword(email);
      if (error) {
        showError(error.message || 'Erro ao enviar e-mail. Tente novamente.');
      } else {
        showPanel('forgotSuccess');
      }
    } catch(e) {
      showError('Erro inesperado. Tente novamente.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar link →';
    }
  });

  // ── Animações de entrada via IntersectionObserver ─────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

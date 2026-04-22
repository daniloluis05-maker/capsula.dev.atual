// ─────────────────────────────────────────────────────────────
// capsula.dev · js/db.js
// Cliente Supabase singleton + helpers de persistência.
//
// COMO USAR: inclua APÓS config.js e o SDK do Supabase.
//
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.103.1/dist/umd/supabase.js"></script>
//   <script src="js/config.js"></script>
//   <script src="js/db.js"></script>
//
// Tabela necessária no Supabase (ver capsula_setup.sql):
//   usuarios (email PK, nome, objetivo, criado_em, matrizes jsonb)
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  let _client = null;

  function getDB() {
    if (_client) return _client;
    if (typeof supabase === 'undefined') {
      console.warn('[db] SDK do Supabase não carregado.');
      return null;
    }
    const cfg = window.CAPSULA_CONFIG;
    if (!cfg || !cfg.supabaseUrl || !cfg.supabaseKey) {
      console.warn('[db] CAPSULA_CONFIG ausente.');
      return null;
    }
    _client = supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
    return _client;
  }

  // ── Usuários ────────────────────────────────────────────────

  /**
   * Cria ou atualiza um usuário no Supabase.
   * @param {object} userData - { nome, email, objetivo, criado_em, ...matrizes }
   * @returns {{ data, error }}
   */
  async function saveUser(userData) {
    const db = getDB();
    if (!db) return { error: 'offline' };

    // Separa campos de perfil dos dados de matrizes
    // uid, soar_draft e ikigai_draft são campos internos e não devem ir para a coluna matrizes
    const { nome, email, objetivo, criado_em, apelido, uid, soar_draft, ikigai_draft, ...matrizes } = userData;

    const row = {
      email:     email.toLowerCase().trim(),
      nome:      nome,
      apelido:   apelido || null,
      objetivo:  objetivo,
      criado_em: criado_em || new Date().toISOString(),
      matrizes:  Object.keys(matrizes).length ? matrizes : {},
    };

    const { data, error } = await db
      .from('usuarios')
      .upsert(row, { onConflict: 'email' })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Busca usuário por e-mail.
   * @param {string} email
   * @returns {{ data: object|null, error }}
   */
  async function findUserByEmail(email) {
    const db = getDB();
    if (!db) return { data: null, error: 'offline' };

    const { data, error } = await db
      .from('usuarios')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) return { data: null, error };

    // Remonta objeto plano (perfil + matrizes juntos) para compatibilidade
    if (data) {
      const flat = {
        nome:      data.nome,
        apelido:   data.apelido,
        email:     data.email,
        objetivo:  data.objetivo,
        criado_em: data.criado_em,
        ...( data.matrizes || {} ),
      };
      return { data: flat, error: null };
    }

    return { data: null, error: null };
  }

  /**
   * Salva estado atualizado das matrizes para o usuário ativo.
   * Chame após cada matriz concluída.
   * @param {object} userData - objeto completo do localStorage
   */
  async function syncMatrizes(userData) {
    if (!userData || !userData.email) return;
    await saveUser(userData);
  }

  /**
   * Migra dados do localStorage para o Supabase (chamado uma vez no login/dashboard).
   * @param {string} email
   */
  async function migrateLocalToSupabase(email) {
    const db = getDB();
    if (!db || !email) return;

    const raw = localStorage.getItem('capsula_user');
    if (!raw) return;

    let local;
    try { local = JSON.parse(raw); } catch(_) { return; }
    if (local.email !== email) return; // segurança: não migra dados de outro usuário

    // Verifica se já existe no Supabase
    const { data: existing } = await findUserByEmail(email);

    if (!existing) {
      // Não existe no banco → sobe tudo
      await saveUser(local);
      console.log('[db] Migração localStorage → Supabase concluída para', email);
    } else {
      // Já existe → mescla: Supabase ganha nos campos de perfil; para matrizes, ganha a versão mais recente (por completedAt)
      function pickNewest(a, b) {
        if (!a) return b;
        if (!b) return a;
        const tA = a.completedAt || a.criado_em || '';
        const tB = b.completedAt || b.criado_em || '';
        return tA >= tB ? a : b;
      }
      const merged = {
        ...existing,
        nome:      existing.nome      || local.nome,
        objetivo:  existing.objetivo  || local.objetivo,
        criado_em: existing.criado_em || local.criado_em,
        uid:       existing.uid       || local.uid,
        // Matrizes: vence a versão com completedAt mais recente
        disc:    pickNewest(local.disc,    existing.disc),
        soar:    pickNewest(local.soar,    existing.soar),
        ikigai:  pickNewest(local.ikigai,  existing.ikigai),
        ancoras: pickNewest(local.ancoras, existing.ancoras),
        johari:  pickNewest(local.johari,  existing.johari),
        bigfive: pickNewest(local.bigfive, existing.bigfive),
        swot:    pickNewest(local.swot,    existing.swot),
      };
      // Remove chaves undefined
      Object.keys(merged).forEach(k => merged[k] === undefined && delete merged[k]);

      await saveUser(merged);
      // Atualiza localStorage com dado mesclado
      localStorage.setItem('capsula_user', JSON.stringify(merged));
      console.log('[db] Mesclagem localStorage ↔ Supabase concluída para', email);
      return merged;
    }
  }

  // ── Helpers de localStorage seguro ─────────────────────────

  function lsGetRaw(key) {
    try {
      return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
    } catch(_) { return null; }
  }

  function lsGet(key) {
    const raw = lsGetRaw(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(_) { return null; }
  }

  function lsSetRaw(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch(_) {
      try { sessionStorage.setItem(key, value); return true; } catch(__) { return false; }
    }
  }

  function lsSet(key, value) {
    try {
      return lsSetRaw(key, JSON.stringify(value));
    } catch(_) { return false; }
  }

  // Atalhos específicos para as chaves usadas no projeto
  function lsGetUser()       { return lsGet('capsula_user'); }
  function lsSetUser(u)      { return lsSet('capsula_user', u); }
  function lsGetUsers()      { return lsGet('capsula_users') || []; }
  function lsSetUsers(arr)   { return lsSet('capsula_users', arr); }

  // ── Supabase Auth ───────────────────────────────────────────

  async function authSignUp(email, password, nome, objetivo) {
    const db = getDB();
    if (!db) return { data: null, error: 'offline' };

    const { data, error } = await db.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: { data: { nome, objetivo } },
    });

    if (error) return { data: null, error };

    if (data.user) {
      const userData = {
        uid: data.user.id,
        nome,
        email: email.toLowerCase().trim(),
        objetivo,
        criado_em: new Date().toISOString(),
      };
      await saveUser(userData);
      // session=null quando confirmação de e-mail está ativa
      return { data: userData, session: data.session, confirmEmail: !data.session, error: null };
    }

    return { data: null, error: 'user_not_created' };
  }

  async function authSignIn(email, password) {
    const db = getDB();
    if (!db) return { data: null, error: 'offline' };

    const { data, error } = await db.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) return { data: null, error };

    const { data: profile } = await findUserByEmail(email);

    if (profile) {
      profile.uid = data.user.id;
      return { data: profile, session: data.session, error: null };
    }

    // Perfil não existe ainda — cria com dados do Auth
    const basicProfile = {
      uid: data.user.id,
      nome: data.user.user_metadata?.nome || email.split('@')[0],
      email: email.toLowerCase().trim(),
      objetivo: data.user.user_metadata?.objetivo || '',
      criado_em: data.user.created_at || new Date().toISOString(),
    };
    await saveUser(basicProfile);
    return { data: basicProfile, session: data.session, error: null };
  }

  async function authSignInWithGoogle() {
    const db = getDB();
    if (!db) return { error: 'offline' };

    const callbackUrl = window.location.origin + '/auth-callback.html';
    const { data, error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    });

    return { data, error };
  }

  async function authGetSession() {
    const db = getDB();
    if (!db) return { session: null };
    const { data: { session } } = await db.auth.getSession();
    return { session };
  }

  async function authSignOut() {
    const db = getDB();
    if (!db) return;
    await db.auth.signOut();
  }

  async function authLoadUserProfile(user) {
    const { data: profile } = await findUserByEmail(user.email);

    if (profile) {
      profile.uid = user.id;
      return profile;
    }

    // Cria perfil a partir dos metadados do Auth (usado no fluxo Google)
    const nome = user.user_metadata?.full_name
      || user.user_metadata?.nome
      || user.email.split('@')[0];

    const basicProfile = {
      uid: user.id,
      nome,
      email: user.email.toLowerCase(),
      objetivo: user.user_metadata?.objetivo || '',
      criado_em: user.created_at || new Date().toISOString(),
    };
    await saveUser(basicProfile);
    return basicProfile;
  }

  async function authResetPassword(email) {
    const db = getDB();
    if (!db) return { error: 'offline' };

    const redirectTo = window.location.origin + '/auth-callback.html?type=recovery';
    const { error } = await db.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      { redirectTo }
    );
    return { error };
  }

  // ── Exporta para escopo global ──────────────────────────────
  window.capsulaDB = {
    getDB,
    saveUser,
    findUserByEmail,
    syncMatrizes,
    migrateLocalToSupabase,
    // Supabase Auth
    authSignUp,
    authSignIn,
    authSignInWithGoogle,
    authGetSession,
    authSignOut,
    authLoadUserProfile,
    authResetPassword,
    // localStorage seguro
    lsGet,
    lsGetRaw,
    lsSet,
    lsSetRaw,
    lsGetUser,
    lsSetUser,
    lsGetUsers,
    lsSetUsers,
  };
})();

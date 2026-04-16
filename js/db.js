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
    const { nome, email, objetivo, criado_em, apelido, ...matrizes } = userData;

    const row = {
      email:     email.toLowerCase().trim(),
      nome:      nome,
      apelido:   apelido || null,
      objetivo:  objetivo,
      criado_em: criado_em || new Date().toISOString(),
      matrizes:  Object.keys(matrizes).length ? matrizes : {},
      atualizado_em: new Date().toISOString(),
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
      // Já existe → mescla: Supabase ganha nos campos de perfil, local ganha nas matrizes
      const merged = {
        ...existing,
        nome:      existing.nome      || local.nome,
        objetivo:  existing.objetivo  || local.objetivo,
        criado_em: existing.criado_em || local.criado_em,
        // Matrizes: preserva a versão mais completa
        disc:    local.disc    || existing.disc    || undefined,
        soar:    local.soar    || existing.soar    || undefined,
        ikigai:  local.ikigai  || existing.ikigai  || undefined,
        ancoras: local.ancoras || existing.ancoras || undefined,
        johari:  local.johari  || existing.johari  || undefined,
        bigfive: local.bigfive || existing.bigfive || undefined,
        swot:    local.swot    || existing.swot    || undefined,
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

  // ── Exporta para escopo global ──────────────────────────────
  window.capsulaDB = {
    getDB,
    saveUser,
    findUserByEmail,
    syncMatrizes,
    migrateLocalToSupabase,
  };
})();

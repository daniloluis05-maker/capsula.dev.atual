// ─────────────────────────────────────────────────────────────
// capsula.dev · js/db.js
// Cliente Supabase singleton — ÚNICA instância em toda a app.
//
// COMO USAR: inclua APÓS config.js e o SDK do Supabase.
// Use window.capsulaDB para acessar o cliente em qualquer página.
//
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.103.1/dist/umd/supabase.js"></script>
//   <script src="js/config.js"></script>
//   <script src="js/db.js"></script>
//
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  let _client = null;

  /**
   * Retorna o cliente Supabase singleton.
   * Lança exceção se o SDK ou as credenciais não estiverem disponíveis.
   * @returns {import('@supabase/supabase-js').SupabaseClient}
   */
  function getDB() {
    if (_client) return _client;

    if (typeof supabase === 'undefined') {
      throw new Error('[db] SDK do Supabase não carregado. Inclua o script do CDN antes de db.js.');
    }

    const cfg = window.CAPSULA_CONFIG;
    if (!cfg || !cfg.supabaseUrl || !cfg.supabaseKey) {
      throw new Error('[db] window.CAPSULA_CONFIG ausente. Inclua config.js antes de db.js.');
    }

    _client = supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
    return _client;
  }

  // ── Helpers de autenticação ─────────────────────────────────

  /** Retorna a sessão atual ou null se não autenticado. */
  async function getSession() {
    const db = getDB();
    if (!db) return null;
    const { data: { session } } = await db.auth.getSession();
    return session;
  }

  /** Login via magic link. */
  async function loginWithMagicLink(email) {
    const db = getDB();
    if (!db) return { error: 'Supabase não configurado' };
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    });
    return { error };
  }

  /** Login via OAuth (Google, GitHub, etc). */
  async function loginWithOAuth(provider = 'google') {
    const db = getDB();
    if (!db) return;
    await db.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.href },
    });
  }

  // ── Exporta para escopo global ──────────────────────────────
  window.capsulaDB = { getDB, getSession, loginWithMagicLink, loginWithOAuth };
})();

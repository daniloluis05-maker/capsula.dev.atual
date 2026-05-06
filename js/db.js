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
    // uid, is_admin, creditos, plano, plano_expira_em, soar_draft e ikigai_draft são campos internos
    const { nome, email, objetivo, criado_em, apelido, uid, is_admin, creditos, plano, plano_expira_em, soar_draft, ikigai_draft, ...matrizes } = userData;

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
        nome:            data.nome,
        apelido:         data.apelido,
        email:           data.email,
        objetivo:        data.objetivo,
        criado_em:       data.criado_em,
        is_admin:        data.is_admin        || false,
        creditos:        data.creditos        || {},
        plano:           data.plano           || 'free',
        plano_expira_em: data.plano_expira_em || null,
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
    // Limpa dados do usuário do storage para não vazar entre contas
    try { localStorage.removeItem('capsula_user'); } catch(_) {}
    try { sessionStorage.removeItem('capsula_user'); } catch(_) {}
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

  // ── Garante dados do usuário: localStorage → Supabase Auth ─
  /**
   * Retorna dados do usuário do localStorage.
   * Se não houver dados locais, busca sessão ativa do Supabase e
   * popula o localStorage antes de retornar.
   * @returns {object|null} userData
   */
  async function ensureUserData() {
    const db = getDB();
    if (db) {
      try {
        const { data: { session } } = await db.auth.getSession();
        if (session && session.user) {
          const profile = await authLoadUserProfile(session.user);
          if (profile) {
            // Mescla dados de matrizes locais apenas se pertencerem ao mesmo usuário
            const _local = lsGetUser() || {};
            const _matrixKeys = ['disc','johari','bigfive','ancoras','soar','ikigai','tci','pearson'];
            const _merged = { ...profile };
            const _sameUser = _local.email && profile.email &&
              _local.email.toLowerCase() === profile.email.toLowerCase();
            if (_sameUser) {
              for (const _k of _matrixKeys) {
                if (!_merged[_k] && _local[_k]) _merged[_k] = _local[_k];
              }
            }
            lsSetUser(_merged);
            return _merged;
          }
        }
      } catch(e) { console.warn('[db] ensureUserData:', e); }
    }
    return lsGetUser() || null;
  }

  // ── Créditos e plano ────────────────────────────────────────

  async function syncCreditos(userData) {
    if (!userData || !userData.email) return;
    const db = getDB();
    if (!db) return;
    const { error } = await db
      .from('usuarios')
      .update({
        creditos:        userData.creditos        || {},
        plano:           userData.plano           || 'free',
        plano_expira_em: userData.plano_expira_em || null,
      })
      .eq('email', userData.email.toLowerCase().trim());
    if (error) console.warn('[db] syncCreditos:', error);
  }

  async function getCreditos(email) {
    const db = getDB();
    if (!db || !email) return {};
    const { data } = await db
      .from('usuarios')
      .select('creditos, plano, plano_expira_em')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    return data || {};
  }

  // ── Avaliações remotas (Plano Profissional) ─────────────────

  async function createAvaliacaoRemota({ profissional_uid, respondente_nome, etiqueta, matriz, expires_days = 7 }) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const token      = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    const expires_at = new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await db
      .from('avaliacoes_remotas')
      .insert({ profissional_uid, respondente_nome, etiqueta: etiqueta || null, matriz, token, expires_at, status: 'pendente' })
      .select()
      .single();
    return { data, error, token };
  }

  async function getAvaliacoesDoProf(profissional_uid) {
    const db = getDB();
    if (!db) return [];
    const { data } = await db
      .from('avaliacoes_remotas')
      .select('*')
      .eq('profissional_uid', profissional_uid)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async function getAvaliacaoByToken(token) {
    const db = getDB();
    if (!db) return null;
    const { data } = await db
      .from('avaliacoes_remotas')
      .select('*')
      .eq('token', token)
      .maybeSingle();
    return data;
  }

  async function saveResultadoRemoto(token, resultado) {
    const db = getDB();
    if (!db) return false;
    const { error } = await db
      .from('avaliacoes_remotas')
      .update({ resultado, status: 'concluido', completado_at: new Date().toISOString() })
      .eq('token', token);
    return !error;
  }

  // ── Links Remotos (Plano Profissional) ─────────────────────

  async function createRemoteLink({ pro_email, matriz, etiqueta, max_completions = 20 }) {
    const db = getDB();
    if (!db) return { error: 'offline' };

    // RLS exige role=authenticated; verifica sessão antes de tentar
    try {
      const { data: { session } } = await db.auth.getSession();
      if (!session) {
        console.warn('[db] createRemoteLink: sem sessão ativa — RLS bloquearia o insert');
        return { error: { message: 'session_expired', code: 'auth' } };
      }
    } catch (e) {
      console.warn('[db] createRemoteLink: erro ao checar sessão', e);
    }

    const token = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    const { error } = await db
      .from('remote_links')
      .insert({ token, pro_email: pro_email.toLowerCase().trim(), matriz, etiqueta: etiqueta || null, max_completions });
    if (error) console.warn('[db] createRemoteLink error:', error);
    return { error, token };
  }

  async function getMyRemoteLinks(pro_email) {
    const db = getDB();
    if (!db) return [];
    const { data, error } = await db
      .from('remote_links')
      .select('*')
      .eq('pro_email', pro_email.toLowerCase().trim());
    if (error) console.warn('[db] getMyRemoteLinks error:', error);
    const rows = data || [];
    // Ordena no cliente (evita quebrar se created_at ainda não existe no banco)
    rows.sort(function(a, b) {
      return (b.created_at || b.id || '') > (a.created_at || a.id || '') ? 1 : -1;
    });
    console.log('[db] getMyRemoteLinks →', rows.length, 'registros para', pro_email);
    return rows;
  }

  async function getRemoteLinkByToken(token) {
    const db = getDB();
    if (!db) return null;
    // Via RPC (em vez de SELECT direto) para evitar que anon enumere
    // toda a tabela. RPC retorna apenas a row do token exato.
    const { data, error } = await db.rpc('get_remote_link_by_token', { p_token: token });
    if (error) { console.warn('[db] getRemoteLinkByToken:', error); return null; }
    return Array.isArray(data) && data.length ? data[0] : null;
  }

  async function saveRemoteResult({ token, nome, email, resultado }) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db
      .from('remote_results')
      .insert({
        token,
        respondente_nome:  nome,
        respondente_email: email ? email.toLowerCase().trim() : null,
        resultado,
      });
    if (!error) {
      // .catch direto no PostgrestBuilder do supabase-js v2 lança "is not a function"
      // — o builder só expõe .then(). Try/catch envolvendo o await é a forma correta.
      try { await db.rpc('increment_remote_completion', { link_token: token }); } catch (_) {}
    }
    return { error };
  }

  async function getRemoteResults(token) {
    const db = getDB();
    if (!db) return [];
    const { data } = await db
      .from('remote_results')
      .select('*')
      .eq('token', token)
      .order('completed_at', { ascending: false });
    return data || [];
  }

  async function deleteRemoteLink(token) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db
      .from('remote_links')
      .delete()
      .eq('token', token);
    if (error) console.warn('[db] deleteRemoteLink:', error);
    return { error };
  }

  // ── Acompanhamento Semanal (Plano Gerencial) ────────────────

  async function createIndicador({ gerencial_email, nome, unidade = '%', meta = null, cor = '#7c6af7', descricao = '' }) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { data, error } = await db
      .from('indicadores')
      .insert({ gerencial_email: gerencial_email.toLowerCase().trim(), nome, unidade, meta, cor, descricao: descricao || null })
      .select()
      .single();
    return { data, error };
  }

  async function getIndicadores(gerencial_email) {
    const db = getDB();
    if (!db) return [];
    const { data } = await db
      .from('indicadores')
      .select('*, registros_semanais(*)')
      .eq('gerencial_email', gerencial_email.toLowerCase().trim())
      .eq('ativo', true)
      .order('created_at', { ascending: true });
    return data || [];
  }

  async function addRegistroSemanal({ indicador_id, semana, valor, nota }) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { data, error } = await db
      .from('registros_semanais')
      .upsert({ indicador_id, semana, valor, nota: nota || null }, { onConflict: 'indicador_id,semana' })
      .select()
      .single();
    return { data, error };
  }

  async function deleteIndicador(id) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db
      .from('indicadores')
      .update({ ativo: false })
      .eq('id', id);
    return { error };
  }

  // ── Equipes (Plano Gerencial) ───────────────────────────────

  async function createEquipe({ gerencial_email, nome, descricao }) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { data, error } = await db
      .from('equipes')
      .insert({ gerencial_email: gerencial_email.toLowerCase().trim(), nome, descricao: descricao || null })
      .select()
      .single();
    return { data, error };
  }

  async function getEquipes(gerencial_email) {
    const db = getDB();
    if (!db) return [];
    const { data } = await db
      .from('equipes')
      .select('*, equipe_membros(*)')
      .eq('gerencial_email', gerencial_email.toLowerCase().trim())
      .eq('ativo', true)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async function deleteEquipe(id) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db
      .from('equipes')
      .update({ ativo: false })
      .eq('id', id);
    return { error };
  }

  async function addMembroEquipe({ equipe_id, remote_result_id = null, nome, email, papel, resultado, matriz }) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { data, error } = await db
      .from('equipe_membros')
      .insert({
        equipe_id, remote_result_id,
        nome, email: email ? email.toLowerCase().trim() : null,
        papel: papel || null, resultado, matriz: matriz || null,
      })
      .select()
      .single();
    return { data, error };
  }

  async function removeMembroEquipe(id) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db.from('equipe_membros').delete().eq('id', id);
    return { error };
  }

  async function getEquipeDNA(equipe_id) {
    const db = getDB();
    if (!db) return null;
    const { data } = await db
      .from('equipe_dna')
      .select('*')
      .eq('equipe_id', equipe_id)
      .maybeSingle();
    return data;
  }

  async function saveEquipeDNA(equipe_id, conteudo) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { data, error } = await db
      .from('equipe_dna')
      .upsert({ equipe_id, conteudo, created_at: new Date().toISOString() }, { onConflict: 'equipe_id' })
      .select()
      .single();
    return { data, error };
  }

  // ── 5W2H — Plano de Ação ────────────────────────────────────
  async function getPlanoAcao(equipe_id) {
    const db = getDB();
    if (!db) return [];
    const { data } = await db.from('plano_acao_items')
      .select('*').eq('equipe_id', equipe_id)
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: true });
    return data || [];
  }

  async function savePlanoAcaoItem(item) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const payload = { ...item, updated_at: new Date().toISOString() };
    if (item.id) {
      const { id, ...rest } = payload;
      const { data, error } = await db.from('plano_acao_items')
        .update(rest).eq('id', id).select().single();
      return { data, error };
    } else {
      const { data, error } = await db.from('plano_acao_items')
        .insert(payload).select().single();
      return { data, error };
    }
  }

  async function deletePlanoAcaoItem(id) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db.from('plano_acao_items').delete().eq('id', id);
    return { error };
  }

  // ── RACI ─────────────────────────────────────────────────────
  async function getRACI(equipe_id) {
    const db = getDB();
    if (!db) return { atividades: [], atribuicoes: [] };
    const [{ data: atividades }, { data: atribuicoes }] = await Promise.all([
      db.from('raci_atividades').select('*').eq('equipe_id', equipe_id)
        .order('ordem', { ascending: true }).order('created_at', { ascending: true }),
      db.from('raci_atribuicoes').select('*, raci_atividades!inner(equipe_id)')
        .eq('raci_atividades.equipe_id', equipe_id),
    ]);
    return { atividades: atividades || [], atribuicoes: atribuicoes || [] };
  }

  async function addRaciAtividade(equipe_id, atividade) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { data, error } = await db.from('raci_atividades')
      .insert({ equipe_id, atividade }).select().single();
    return { data, error };
  }

  async function deleteRaciAtividade(id) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db.from('raci_atividades').delete().eq('id', id);
    return { error };
  }

  async function setRaciAtribuicao(atividade_id, membro_id, papel) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    if (!papel) {
      const { error } = await db.from('raci_atribuicoes')
        .delete().eq('atividade_id', atividade_id).eq('membro_id', membro_id);
      return { error };
    }
    const { data, error } = await db.from('raci_atribuicoes')
      .upsert({ atividade_id, membro_id, papel }, { onConflict: 'atividade_id,membro_id' })
      .select().single();
    return { data, error };
  }

  // ── SWOT de Equipe ──────────────────────────────────────────
  async function getSwotEquipe(equipe_id) {
    const db = getDB();
    if (!db) return [];
    const { data } = await db.from('swot_equipe_items')
      .select('*').eq('equipe_id', equipe_id)
      .order('ordem', { ascending: true }).order('created_at', { ascending: true });
    return data || [];
  }

  async function addSwotEquipeItem(equipe_id, quadrante, texto) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { data, error } = await db.from('swot_equipe_items')
      .insert({ equipe_id, quadrante, texto }).select().single();
    return { data, error };
  }

  async function deleteSwotEquipeItem(id) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db.from('swot_equipe_items').delete().eq('id', id);
    return { error };
  }

  // ── OKRs (Objetivos + Key Results) ──────────────────────────
  async function getObjetivos(gerencial_email, ciclo) {
    const db = getDB();
    if (!db) return [];
    let q = db.from('objetivos')
      .select('*, key_results(*)')
      .eq('gerencial_email', gerencial_email.toLowerCase().trim())
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: false });
    if (ciclo) q = q.eq('ciclo', ciclo);
    const { data } = await q;
    return data || [];
  }

  async function saveObjetivo(obj) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    if (obj.id) {
      const { id, ...rest } = obj;
      const { data, error } = await db.from('objetivos').update(rest).eq('id', id).select().single();
      return { data, error };
    } else {
      if (obj.gerencial_email) obj.gerencial_email = obj.gerencial_email.toLowerCase().trim();
      const { data, error } = await db.from('objetivos').insert(obj).select().single();
      return { data, error };
    }
  }

  async function deleteObjetivo(id) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db.from('objetivos').delete().eq('id', id);
    return { error };
  }

  async function saveKeyResult(kr) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    if (kr.id) {
      const { id, ...rest } = kr;
      rest.updated_at = new Date().toISOString();
      const { data, error } = await db.from('key_results').update(rest).eq('id', id).select().single();
      return { data, error };
    } else {
      const { data, error } = await db.from('key_results').insert(kr).select().single();
      return { data, error };
    }
  }

  async function deleteKeyResult(id) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db.from('key_results').delete().eq('id', id);
    return { error };
  }

  async function addKrUpdate(kr_id, valor, comentario) {
    const db = getDB();
    if (!db) return { error: 'offline' };
    const { error } = await db.from('kr_updates')
      .insert({ kr_id, valor, comentario: comentario || null });
    if (!error) {
      await db.from('key_results')
        .update({ valor_atual: valor, updated_at: new Date().toISOString() })
        .eq('id', kr_id);
    }
    return { error };
  }

  async function getKrUpdates(kr_id) {
    const db = getDB();
    if (!db) return [];
    const { data } = await db.from('kr_updates')
      .select('*').eq('kr_id', kr_id)
      .order('registrado_em', { ascending: true });
    return data || [];
  }

  // ── Débito atômico de crédito (server-side, anti-bypass localStorage) ──
  async function debitCredit(email, matrixKey) {
    const db = getDB();
    if (!db || !email) return { ok: false, reason: 'no_db' };
    const { data, error } = await db.rpc('debit_credit', {
      p_email:  email.toLowerCase().trim(),
      p_matrix: matrixKey,
    });
    if (error) { console.warn('[db] debitCredit:', error); return { ok: false, reason: 'rpc_error' }; }
    return data || { ok: false, reason: 'no_data' };
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
    ensureUserData,
    // Créditos e plano
    syncCreditos,
    getCreditos,
    debitCredit,
    // Avaliações remotas (legacy)
    createAvaliacaoRemota,
    getAvaliacoesDoProf,
    getAvaliacaoByToken,
    saveResultadoRemoto,
    // Links remotos (Pro)
    createRemoteLink,
    getMyRemoteLinks,
    getRemoteLinkByToken,
    saveRemoteResult,
    getRemoteResults,
    deleteRemoteLink,
    // Acompanhamento semanal (Gerencial)
    createIndicador,
    getIndicadores,
    addRegistroSemanal,
    deleteIndicador,
    // Equipes (Gerencial)
    createEquipe,
    getEquipes,
    deleteEquipe,
    addMembroEquipe,
    removeMembroEquipe,
    getEquipeDNA,
    saveEquipeDNA,
    // 5W2H
    getPlanoAcao,
    savePlanoAcaoItem,
    deletePlanoAcaoItem,
    // RACI
    getRACI,
    addRaciAtividade,
    deleteRaciAtividade,
    setRaciAtribuicao,
    // SWOT de Equipe
    getSwotEquipe,
    addSwotEquipeItem,
    deleteSwotEquipeItem,
    // OKRs
    getObjetivos,
    saveObjetivo,
    deleteObjetivo,
    saveKeyResult,
    deleteKeyResult,
    addKrUpdate,
    getKrUpdates,
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

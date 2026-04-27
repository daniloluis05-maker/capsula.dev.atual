-- ═══════════════════════════════════════════════════════════════
-- 005_security_hardening.sql
-- Endurece as RLS policies (cada usuário vê apenas seus dados)
-- e cria tabela + RPC para rate limit das chamadas de IA.
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- Idempotente.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. usuarios — cada um vê apenas o próprio registro ──────
DO $$ BEGIN
  EXECUTE 'ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DROP POLICY IF EXISTS "u_select_own"   ON usuarios;
DROP POLICY IF EXISTS "u_insert_self"  ON usuarios;
DROP POLICY IF EXISTS "u_update_own"   ON usuarios;
-- Remove possíveis policies antigas permissivas
DROP POLICY IF EXISTS "Public read"            ON usuarios;
DROP POLICY IF EXISTS "Allow all"              ON usuarios;
DROP POLICY IF EXISTS "Enable read access"     ON usuarios;
DROP POLICY IF EXISTS "Enable insert"          ON usuarios;
DROP POLICY IF EXISTS "Enable update"          ON usuarios;
DROP POLICY IF EXISTS "usuarios_all"           ON usuarios;

CREATE POLICY "u_select_own" ON usuarios
  FOR SELECT TO authenticated USING (lower(email) = lower(auth.email()));
CREATE POLICY "u_insert_self" ON usuarios
  FOR INSERT TO authenticated WITH CHECK (lower(email) = lower(auth.email()));
CREATE POLICY "u_update_own" ON usuarios
  FOR UPDATE TO authenticated USING (lower(email) = lower(auth.email()));
-- DELETE não permitido via RLS — só via service_role


-- ── 2. remote_links ─────────────────────────────────────────
DROP POLICY IF EXISTS "rl_select_anon"   ON remote_links;
DROP POLICY IF EXISTS "rl_select_by_token" ON remote_links;
DROP POLICY IF EXISTS "rl_select_auth"   ON remote_links;
DROP POLICY IF EXISTS "rl_select_owner"  ON remote_links;
DROP POLICY IF EXISTS "rl_insert_own"    ON remote_links;
DROP POLICY IF EXISTS "rl_insert_owner"  ON remote_links;
DROP POLICY IF EXISTS "rl_update_owner"  ON remote_links;
DROP POLICY IF EXISTS "rl_delete_own"    ON remote_links;
DROP POLICY IF EXISTS "rl_delete_owner"  ON remote_links;

-- Anon pode ver links (precisa para validar por token)
CREATE POLICY "rl_select_anon" ON remote_links
  FOR SELECT TO anon USING (true);
-- Authenticated: só os seus
CREATE POLICY "rl_select_owner" ON remote_links
  FOR SELECT TO authenticated USING (lower(pro_email) = lower(auth.email()));
CREATE POLICY "rl_insert_owner" ON remote_links
  FOR INSERT TO authenticated WITH CHECK (lower(pro_email) = lower(auth.email()));
CREATE POLICY "rl_update_owner" ON remote_links
  FOR UPDATE TO authenticated USING (lower(pro_email) = lower(auth.email()));
CREATE POLICY "rl_delete_owner" ON remote_links
  FOR DELETE TO authenticated USING (lower(pro_email) = lower(auth.email()));


-- ── 3. remote_results ───────────────────────────────────────
DROP POLICY IF EXISTS "rr_select_all"    ON remote_results;
DROP POLICY IF EXISTS "rr_select_owner"  ON remote_results;
DROP POLICY IF EXISTS "rr_insert_anon"   ON remote_results;
DROP POLICY IF EXISTS "rr_insert_auth"   ON remote_results;

-- Respondente anônimo pode INSERIR (validação de token via FK)
CREATE POLICY "rr_insert_anon" ON remote_results
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "rr_insert_auth" ON remote_results
  FOR INSERT TO authenticated WITH CHECK (true);
-- Apenas dono do link (Pro/Gerencial) lê os resultados
CREATE POLICY "rr_select_owner" ON remote_results
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM remote_links rl
      WHERE rl.token = remote_results.token
        AND lower(rl.pro_email) = lower(auth.email())
    )
  );
-- DELETE só pelo dono
DROP POLICY IF EXISTS "rr_delete_owner" ON remote_results;
CREATE POLICY "rr_delete_owner" ON remote_results
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM remote_links rl
      WHERE rl.token = remote_results.token
        AND lower(rl.pro_email) = lower(auth.email())
    )
  );


-- ── 4. indicadores + registros_semanais ─────────────────────
DROP POLICY IF EXISTS "ind_all_own"  ON indicadores;
DROP POLICY IF EXISTS "ind_owner"    ON indicadores;
DROP POLICY IF EXISTS "rs_all_own"   ON registros_semanais;
DROP POLICY IF EXISTS "rs_owner"     ON registros_semanais;

CREATE POLICY "ind_owner" ON indicadores
  FOR ALL TO authenticated
  USING (lower(gerencial_email) = lower(auth.email()))
  WITH CHECK (lower(gerencial_email) = lower(auth.email()));

CREATE POLICY "rs_owner" ON registros_semanais
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM indicadores i
      WHERE i.id = registros_semanais.indicador_id
        AND lower(i.gerencial_email) = lower(auth.email())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM indicadores i
      WHERE i.id = registros_semanais.indicador_id
        AND lower(i.gerencial_email) = lower(auth.email())
    )
  );


-- ── 5. equipes + membros + dna ──────────────────────────────
DROP POLICY IF EXISTS "eq_all_own"    ON equipes;
DROP POLICY IF EXISTS "eq_owner"      ON equipes;
DROP POLICY IF EXISTS "em_all_own"    ON equipe_membros;
DROP POLICY IF EXISTS "em_owner"      ON equipe_membros;
DROP POLICY IF EXISTS "ed_all_own"    ON equipe_dna;
DROP POLICY IF EXISTS "ed_owner"      ON equipe_dna;

CREATE POLICY "eq_owner" ON equipes
  FOR ALL TO authenticated
  USING (lower(gerencial_email) = lower(auth.email()))
  WITH CHECK (lower(gerencial_email) = lower(auth.email()));

CREATE POLICY "em_owner" ON equipe_membros
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipes e
      WHERE e.id = equipe_membros.equipe_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipes e
      WHERE e.id = equipe_membros.equipe_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  );

CREATE POLICY "ed_owner" ON equipe_dna
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipes e
      WHERE e.id = equipe_dna.equipe_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipes e
      WHERE e.id = equipe_dna.equipe_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  );


-- ── 6. matrizes de equipe (5W2H, RACI, SWOT) ────────────────
DROP POLICY IF EXISTS "pa_all_own"     ON plano_acao_items;
DROP POLICY IF EXISTS "pa_owner"       ON plano_acao_items;
DROP POLICY IF EXISTS "raci_all"       ON raci_atividades;
DROP POLICY IF EXISTS "raci_at_owner"  ON raci_atividades;
DROP POLICY IF EXISTS "raci_atr_all"   ON raci_atribuicoes;
DROP POLICY IF EXISTS "raci_atr_owner" ON raci_atribuicoes;
DROP POLICY IF EXISTS "swot_eq_all"    ON swot_equipe_items;
DROP POLICY IF EXISTS "swot_eq_owner"  ON swot_equipe_items;

CREATE POLICY "pa_owner" ON plano_acao_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipes e
      WHERE e.id = plano_acao_items.equipe_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipes e
      WHERE e.id = plano_acao_items.equipe_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  );

CREATE POLICY "raci_at_owner" ON raci_atividades
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipes e
      WHERE e.id = raci_atividades.equipe_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipes e
      WHERE e.id = raci_atividades.equipe_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  );

CREATE POLICY "raci_atr_owner" ON raci_atribuicoes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM raci_atividades ra
      JOIN equipes e ON e.id = ra.equipe_id
      WHERE ra.id = raci_atribuicoes.atividade_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM raci_atividades ra
      JOIN equipes e ON e.id = ra.equipe_id
      WHERE ra.id = raci_atribuicoes.atividade_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  );

CREATE POLICY "swot_eq_owner" ON swot_equipe_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipes e
      WHERE e.id = swot_equipe_items.equipe_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipes e
      WHERE e.id = swot_equipe_items.equipe_id
        AND lower(e.gerencial_email) = lower(auth.email())
    )
  );


-- ── 7. avaliacoes_remotas (legacy) — restringir ──────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'avaliacoes_remotas') THEN
    EXECUTE 'DROP POLICY IF EXISTS "prof_select_own" ON avaliacoes_remotas';
    EXECUTE 'DROP POLICY IF EXISTS "prof_insert_own" ON avaliacoes_remotas';
    EXECUTE 'DROP POLICY IF EXISTS "ar_select_own" ON avaliacoes_remotas';
    EXECUTE 'DROP POLICY IF EXISTS "ar_insert_own" ON avaliacoes_remotas';
    EXECUTE 'CREATE POLICY "ar_select_own" ON avaliacoes_remotas FOR SELECT TO authenticated USING (profissional_uid = (auth.uid())::text)';
    EXECUTE 'CREATE POLICY "ar_insert_own" ON avaliacoes_remotas FOR INSERT TO authenticated WITH CHECK (profissional_uid = (auth.uid())::text)';
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════
-- 8. RATE LIMIT — chamadas de IA (Anthropic + Groq)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_rate_limits (
  email        text        NOT NULL,
  provider     text        NOT NULL,                 -- 'anthropic' | 'groq'
  hour_bucket  timestamptz NOT NULL,                 -- date_trunc('hour', now())
  count        int         NOT NULL DEFAULT 1,
  PRIMARY KEY (email, provider, hour_bucket)
);

CREATE INDEX IF NOT EXISTS idx_arl_bucket ON ai_rate_limits (hour_bucket);

-- RPC para checar e incrementar atomicamente
CREATE OR REPLACE FUNCTION check_ai_rate_limit(
  p_email    text,
  p_provider text,
  p_max_per_hour int DEFAULT 10
) RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
DECLARE
  bucket    timestamptz := date_trunc('hour', now());
  cur_count int;
  norm_email text := lower(trim(coalesce(p_email, '')));
BEGIN
  IF norm_email = '' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_email');
  END IF;

  INSERT INTO ai_rate_limits (email, provider, hour_bucket, count)
  VALUES (norm_email, p_provider, bucket, 1)
  ON CONFLICT (email, provider, hour_bucket)
  DO UPDATE SET count = ai_rate_limits.count + 1
  RETURNING count INTO cur_count;

  IF cur_count > p_max_per_hour THEN
    RETURN jsonb_build_object(
      'ok', false, 'reason', 'rate_limit',
      'count', cur_count, 'limit', p_max_per_hour,
      'reset_at', bucket + interval '1 hour'
    );
  END IF;

  RETURN jsonb_build_object('ok', true, 'count', cur_count, 'limit', p_max_per_hour);
END;
$$;

-- Apenas service_role (edge functions) chamam — bloqueia clientes
REVOKE ALL ON FUNCTION check_ai_rate_limit(text, text, int) FROM public, anon, authenticated;

-- Limpeza opcional de buckets antigos (rode periodicamente ou via cron)
-- DELETE FROM ai_rate_limits WHERE hour_bucket < now() - interval '7 days';


-- ═══════════════════════════════════════════════════════════════
-- FIM. Verifique se as policies estão ativas:
--   SELECT tablename, policyname FROM pg_policies
--   WHERE schemaname = 'public' ORDER BY tablename, policyname;
-- ═══════════════════════════════════════════════════════════════

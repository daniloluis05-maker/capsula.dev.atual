-- ─────────────────────────────────────────────────────────────
-- 013_remote_results_validation.sql
-- Fecha vulnerabilidade C3: rr_insert_anon aceitava qualquer
-- inserção. Agora valida token existe + slot disponível + não
-- expirado, no próprio CHECK da policy.
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- Idempotente.
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "rr_insert_anon"           ON remote_results;
DROP POLICY IF EXISTS "rr_insert_anon_validated" ON remote_results;
DROP POLICY IF EXISTS "rr_insert_auth"           ON remote_results;
DROP POLICY IF EXISTS "rr_insert_auth_validated" ON remote_results;

CREATE POLICY "rr_insert_anon_validated" ON remote_results
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM remote_links rl
      WHERE rl.token = remote_results.token
        AND rl.completion_count < rl.max_completions
        AND (rl.expires_at IS NULL OR rl.expires_at > now())
    )
  );

CREATE POLICY "rr_insert_auth_validated" ON remote_results
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM remote_links rl
      WHERE rl.token = remote_results.token
        AND rl.completion_count < rl.max_completions
        AND (rl.expires_at IS NULL OR rl.expires_at > now())
    )
  );

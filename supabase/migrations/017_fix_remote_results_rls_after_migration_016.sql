-- ─────────────────────────────────────────────────────────────
-- 017_fix_remote_results_rls_after_migration_016.sql
--
-- 🚨 Regressão crítica: migration 016 removeu o SELECT anon de
-- remote_links (pra fechar leak PII), mas a policy rr_insert_anon
-- de migration 013 usa EXISTS (SELECT ... FROM remote_links ...) na
-- WITH CHECK clause. Como o subquery roda com privilégios do caller
-- (anon), agora retorna vazio sempre, e TODOS os inserts em
-- remote_results são rejeitados silenciosamente.
--
-- Sintoma reportado pelo usuário: respondente termina o teste,
-- clica "Enviar Resultado ao Avaliador", mas o Pro nunca vê o
-- resultado no dashboard.
--
-- Fix: encapsular a validação numa função SECURITY DEFINER que
-- bypassa RLS — anon pode chamar a função, mas a função roda com
-- privilégios elevados pra ler remote_links.
--
-- Idempotente.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION can_insert_remote_result(p_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM remote_links rl
    WHERE rl.token = p_token
      AND rl.completion_count < rl.max_completions
      AND (rl.expires_at IS NULL OR rl.expires_at > now())
  );
$$;

REVOKE ALL ON FUNCTION can_insert_remote_result(text) FROM public;
GRANT EXECUTE ON FUNCTION can_insert_remote_result(text) TO anon, authenticated;

-- Recria policies usando a função (em vez do EXISTS direto que
-- agora falha por causa do RLS de remote_links).
DROP POLICY IF EXISTS "rr_insert_anon_validated" ON remote_results;
DROP POLICY IF EXISTS "rr_insert_auth_validated" ON remote_results;

CREATE POLICY "rr_insert_anon_validated" ON remote_results
  FOR INSERT TO anon
  WITH CHECK (can_insert_remote_result(token));

CREATE POLICY "rr_insert_auth_validated" ON remote_results
  FOR INSERT TO authenticated
  WITH CHECK (can_insert_remote_result(token));

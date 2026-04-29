-- ─────────────────────────────────────────────────────────────
-- 016_remote_links_rpc_only_lookup.sql
--
-- 🚨 Fecha B4: anon podia LISTAR toda a tabela remote_links via
-- GET /rest/v1/remote_links, expondo todos os pro_emails e
-- etiquetas (nomes de respondentes) — PII leak.
--
-- Causa: policy "rl_select_anon" tinha USING (true), permitindo
-- enumeração total. O design original era apenas validar token
-- por respondente, mas o "true" deixou a porta totalmente aberta.
--
-- Correção:
--   1. Remove rl_select_anon (anon perde SELECT direto)
--   2. Cria RPC get_remote_link_by_token(p_token) que retorna
--      somente a row exata, com SECURITY DEFINER
--   3. db.js (frontend) deve chamar a RPC em vez de SELECT direto
--
-- Idempotente.
-- ─────────────────────────────────────────────────────────────

-- 1. Remove policy aberta para anon
DROP POLICY IF EXISTS "rl_select_anon"     ON remote_links;
DROP POLICY IF EXISTS "rl_select_by_token" ON remote_links;

-- 2. RPC: lookup por token (apenas a row daquele token)
CREATE OR REPLACE FUNCTION get_remote_link_by_token(p_token text)
RETURNS TABLE (
  id               uuid,
  token            text,
  pro_email        text,
  matriz           text,
  etiqueta         text,
  max_completions  int,
  completion_count int,
  expires_at       timestamptz,
  created_at       timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, token, pro_email, matriz, etiqueta,
         max_completions, completion_count, expires_at, created_at
  FROM remote_links
  WHERE token = p_token
  LIMIT 1;
$$;

-- Apenas anon e authenticated podem chamar (não public/service_role)
REVOKE ALL ON FUNCTION get_remote_link_by_token(text) FROM public;
GRANT EXECUTE ON FUNCTION get_remote_link_by_token(text) TO anon, authenticated;

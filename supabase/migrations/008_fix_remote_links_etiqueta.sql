-- ─────────────────────────────────────────────────────────────
-- 008_fix_remote_links_etiqueta.sql
-- Corrige remote_links que foi criada de uma versão antiga sem
-- as colunas: matriz, etiqueta, max_completions, completion_count,
-- expires_at.
-- Idempotente: ADD COLUMN IF NOT EXISTS é seguro para rodar novamente.
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

ALTER TABLE remote_links
  ADD COLUMN IF NOT EXISTS matriz           text,
  ADD COLUMN IF NOT EXISTS etiqueta         text,
  ADD COLUMN IF NOT EXISTS max_completions  int NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS completion_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expires_at       timestamptz;

-- Garante a função RPC de incremento atômico
CREATE OR REPLACE FUNCTION increment_remote_completion(link_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE remote_links
  SET completion_count = completion_count + 1
  WHERE token = link_token;
END;
$$;

-- Confirma o estado atual da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'remote_links'
ORDER BY ordinal_position;

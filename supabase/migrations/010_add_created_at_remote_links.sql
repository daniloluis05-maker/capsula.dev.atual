-- ─────────────────────────────────────────────────────────────
-- 010_add_created_at_remote_links.sql
-- A tabela remote_links foi criada sem a coluna created_at.
-- Idempotente: ADD COLUMN IF NOT EXISTS é seguro para rodar de novo.
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

ALTER TABLE remote_links
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Confirma estado final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'remote_links'
ORDER BY ordinal_position;

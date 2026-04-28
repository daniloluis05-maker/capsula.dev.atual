-- ─────────────────────────────────────────────────────────────
-- 008_fix_remote_links_etiqueta.sql
-- Adiciona a coluna 'etiqueta' à tabela remote_links caso ela
-- não exista (a tabela foi criada antes dessa coluna ser adicionada).
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

ALTER TABLE remote_links
  ADD COLUMN IF NOT EXISTS etiqueta text;

-- Confirma o estado atual da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'remote_links'
ORDER BY ordinal_position;

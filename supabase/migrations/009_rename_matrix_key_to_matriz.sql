-- ─────────────────────────────────────────────────────────────
-- 009_rename_matrix_key_to_matriz.sql
-- A tabela remote_links foi criada com a coluna 'matrix_key'
-- mas o código usa 'matriz' em todo lugar.
-- Esta migration alinha o banco com o código.
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

-- Remove a coluna 'matriz' nullable adicionada em 008
-- (era duplicata incorreta; a coluna real é 'matrix_key')
ALTER TABLE remote_links DROP COLUMN IF EXISTS matriz;

-- Renomeia 'matrix_key' para 'matriz' para coincidir com o código
ALTER TABLE remote_links RENAME COLUMN matrix_key TO matriz;

-- Confirma estado final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'remote_links'
ORDER BY ordinal_position;

-- ─────────────────────────────────────────────────────────────
-- DIAGNÓSTICO: remote_links
-- Cole no Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

-- 1. Quantos links existem por usuário?
SELECT pro_email, count(*) AS total_links
FROM remote_links
GROUP BY pro_email
ORDER BY total_links DESC;

-- 2. Todos os links em ordem cronológica (confirma múltiplos registros)
SELECT id, token, pro_email, matriz, etiqueta, max_completions, completion_count, created_at
FROM remote_links
ORDER BY created_at DESC;

-- 3. Constraints da tabela (verifica se há UNIQUE em (pro_email, matriz))
SELECT conname, contype, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'remote_links'::regclass;

-- 4. Policies ativas em remote_links
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'remote_links'
ORDER BY policyname;

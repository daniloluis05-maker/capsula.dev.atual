-- ─────────────────────────────────────────────────────────────
-- 015_fix_usuarios_rls_leak.sql
--
-- 🚨 EMERGÊNCIA: vazamento de PII detectado. Role 'anon' consegue
-- listar toda a tabela usuarios (emails, plano, creditos, is_admin)
-- via REST API simples GET /rest/v1/usuarios.
--
-- Causa provável: migration 005 envolveu o ENABLE RLS num
-- DO ... EXCEPTION WHEN OTHERS THEN NULL (silenciou erro, RLS pode
-- nunca ter sido ligado), OU alguma policy permissiva legada
-- (Public read, Allow all) sobreviveu ao DROP.
--
-- Esta migration:
--   1. Força ENABLE RLS sem suppression
--   2. Lista e remove TODAS as policies de usuarios (clean slate)
--   3. Recria apenas as policies seguras (authenticated, próprio row)
--   4. Garante que não há GRANT permissivo a anon
--
-- Idempotente.
-- ─────────────────────────────────────────────────────────────

-- 1. RLS ON (sem swallow de exception)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios FORCE ROW LEVEL SECURITY;  -- aplica até para owner do schema

-- 2. Remove todas as policies pré-existentes (clean slate)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'usuarios'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON usuarios', pol.policyname);
  END LOOP;
END $$;

-- 3. Revoga GRANTs permissivos a anon (se algum)
REVOKE ALL ON TABLE usuarios FROM anon;
REVOKE ALL ON TABLE usuarios FROM PUBLIC;
GRANT  SELECT, INSERT, UPDATE ON TABLE usuarios TO authenticated;
-- service_role já bypassa RLS por padrão

-- 4. Recria policies estritas
CREATE POLICY "u_select_own" ON usuarios
  FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.email()));

CREATE POLICY "u_insert_self" ON usuarios
  FOR INSERT TO authenticated
  WITH CHECK (lower(email) = lower(auth.email()));

CREATE POLICY "u_update_own" ON usuarios
  FOR UPDATE TO authenticated
  USING (lower(email) = lower(auth.email()))
  WITH CHECK (lower(email) = lower(auth.email()));

-- DELETE não permitido via RLS — apenas service_role

-- 5. Sanity check: verifica que RLS está ativo e há exatamente 3 policies
DO $$
DECLARE
  v_rls_on  boolean;
  v_count   int;
BEGIN
  SELECT relrowsecurity INTO v_rls_on
    FROM pg_class WHERE relname = 'usuarios' AND relnamespace = 'public'::regnamespace;

  IF NOT v_rls_on THEN
    RAISE EXCEPTION 'usuarios ainda sem RLS após migration!';
  END IF;

  SELECT count(*) INTO v_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'usuarios';

  IF v_count <> 3 THEN
    RAISE WARNING 'usuarios tem % policies, esperado 3', v_count;
  END IF;
END $$;

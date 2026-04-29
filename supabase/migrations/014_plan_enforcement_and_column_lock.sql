-- ─────────────────────────────────────────────────────────────
-- 014_plan_enforcement_and_column_lock.sql
--
-- Fecha 2 vetores críticos descobertos na auditoria pós-hardening:
--
-- B2 (CRÍTICO): trigger bloqueia mudança de creditos/plano/
--   plano_expira_em/is_admin/criado_em/uid por authenticated.
--   Antes: usuário podia se auto-promover a admin/gerencial via
--   direct UPDATE na tabela usuarios. Agora só service_role
--   (webhooks) ou postgres podem mexer nesses campos.
--
-- B1 (ALTO): RLS INSERT em remote_links / equipes / indicadores /
--   objetivos passa a exigir o plano correto, fechando bypass via
--   console (free user criando recursos Pro/Gerencial).
--
-- Idempotente.
-- ─────────────────────────────────────────────────────────────

-- ── Helpers de checagem de plano (usados nas policies) ──────

CREATE OR REPLACE FUNCTION is_pro_or_higher(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios u
    WHERE lower(u.email) = lower(p_email)
      AND (
        u.is_admin = true
        OR (u.plano IN ('profissional', 'gerencial')
            AND (u.plano_expira_em IS NULL OR u.plano_expira_em > now()))
      )
  );
$$;

CREATE OR REPLACE FUNCTION is_gerencial_or_admin(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios u
    WHERE lower(u.email) = lower(p_email)
      AND (
        u.is_admin = true
        OR (u.plano = 'gerencial'
            AND (u.plano_expira_em IS NULL OR u.plano_expira_em > now()))
      )
  );
$$;

REVOKE ALL ON FUNCTION is_pro_or_higher(text)     FROM public;
REVOKE ALL ON FUNCTION is_gerencial_or_admin(text) FROM public;
GRANT EXECUTE ON FUNCTION is_pro_or_higher(text)     TO authenticated;
GRANT EXECUTE ON FUNCTION is_gerencial_or_admin(text) TO authenticated;


-- ═══════════════════════════════════════════════════════════
-- B2: Trigger anti auto-promoção em usuarios
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION block_sensitive_user_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := coalesce(auth.role()::text, current_user::text, '');
BEGIN
  -- service_role (webhooks) e postgres (admin) podem tudo
  IF v_role IN ('service_role', 'postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  -- Para qualquer outro caller (authenticated, anon), reverte mudanças
  -- a campos sensíveis silenciosamente. Mantém OLD value.
  IF NEW.creditos        IS DISTINCT FROM OLD.creditos        THEN NEW.creditos        := OLD.creditos;        END IF;
  IF NEW.plano           IS DISTINCT FROM OLD.plano           THEN NEW.plano           := OLD.plano;           END IF;
  IF NEW.plano_expira_em IS DISTINCT FROM OLD.plano_expira_em THEN NEW.plano_expira_em := OLD.plano_expira_em; END IF;
  IF NEW.is_admin        IS DISTINCT FROM OLD.is_admin        THEN NEW.is_admin        := OLD.is_admin;        END IF;
  IF NEW.uid             IS DISTINCT FROM OLD.uid             THEN NEW.uid             := OLD.uid;             END IF;
  IF NEW.criado_em       IS DISTINCT FROM OLD.criado_em       THEN NEW.criado_em       := OLD.criado_em;       END IF;
  IF NEW.email           IS DISTINCT FROM OLD.email           THEN NEW.email           := OLD.email;           END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_sensitive_user_updates ON usuarios;
CREATE TRIGGER trg_block_sensitive_user_updates
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION block_sensitive_user_updates();


-- ═══════════════════════════════════════════════════════════
-- B1: Plan enforcement nas tabelas-raiz
-- (tabelas filhas herdam por FK + RLS existente)
-- ═══════════════════════════════════════════════════════════

-- ── remote_links: exige Pro+ ────────────────────────────────
DROP POLICY IF EXISTS "rl_insert_owner"       ON remote_links;
DROP POLICY IF EXISTS "rl_insert_owner_pro"   ON remote_links;
CREATE POLICY "rl_insert_owner_pro" ON remote_links
  FOR INSERT TO authenticated
  WITH CHECK (
    lower(pro_email) = lower(auth.email())
    AND is_pro_or_higher(auth.email())
  );


-- ── equipes: exige Gerencial+ ──────────────────────────────
-- A policy existente "eq_owner" é FOR ALL com USING+CHECK.
-- Substituímos por policies separadas para tightening de INSERT.
DROP POLICY IF EXISTS "eq_owner"             ON equipes;
DROP POLICY IF EXISTS "eq_select_own"        ON equipes;
DROP POLICY IF EXISTS "eq_update_own"        ON equipes;
DROP POLICY IF EXISTS "eq_delete_own"        ON equipes;
DROP POLICY IF EXISTS "eq_insert_gerencial"  ON equipes;

CREATE POLICY "eq_select_own" ON equipes
  FOR SELECT TO authenticated
  USING (lower(gerencial_email) = lower(auth.email()));

CREATE POLICY "eq_update_own" ON equipes
  FOR UPDATE TO authenticated
  USING (lower(gerencial_email) = lower(auth.email()))
  WITH CHECK (lower(gerencial_email) = lower(auth.email()));

CREATE POLICY "eq_delete_own" ON equipes
  FOR DELETE TO authenticated
  USING (lower(gerencial_email) = lower(auth.email()));

CREATE POLICY "eq_insert_gerencial" ON equipes
  FOR INSERT TO authenticated
  WITH CHECK (
    lower(gerencial_email) = lower(auth.email())
    AND is_gerencial_or_admin(auth.email())
  );


-- ── indicadores: exige Gerencial+ ───────────────────────────
DROP POLICY IF EXISTS "ind_owner"             ON indicadores;
DROP POLICY IF EXISTS "ind_select_own"        ON indicadores;
DROP POLICY IF EXISTS "ind_update_own"        ON indicadores;
DROP POLICY IF EXISTS "ind_delete_own"        ON indicadores;
DROP POLICY IF EXISTS "ind_insert_gerencial"  ON indicadores;

CREATE POLICY "ind_select_own" ON indicadores
  FOR SELECT TO authenticated
  USING (lower(gerencial_email) = lower(auth.email()));

CREATE POLICY "ind_update_own" ON indicadores
  FOR UPDATE TO authenticated
  USING (lower(gerencial_email) = lower(auth.email()))
  WITH CHECK (lower(gerencial_email) = lower(auth.email()));

CREATE POLICY "ind_delete_own" ON indicadores
  FOR DELETE TO authenticated
  USING (lower(gerencial_email) = lower(auth.email()));

CREATE POLICY "ind_insert_gerencial" ON indicadores
  FOR INSERT TO authenticated
  WITH CHECK (
    lower(gerencial_email) = lower(auth.email())
    AND is_gerencial_or_admin(auth.email())
  );


-- ── objetivos (OKRs): exige Gerencial+ ──────────────────────
-- Tabela criada em 006_okrs.sql; assumimos coluna gerencial_email
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'objetivos') THEN
    EXECUTE 'DROP POLICY IF EXISTS "obj_owner"            ON objetivos';
    EXECUTE 'DROP POLICY IF EXISTS "obj_all_own"          ON objetivos';
    EXECUTE 'DROP POLICY IF EXISTS "obj_select_own"       ON objetivos';
    EXECUTE 'DROP POLICY IF EXISTS "obj_update_own"       ON objetivos';
    EXECUTE 'DROP POLICY IF EXISTS "obj_delete_own"       ON objetivos';
    EXECUTE 'DROP POLICY IF EXISTS "obj_insert_gerencial" ON objetivos';

    EXECUTE 'CREATE POLICY "obj_select_own" ON objetivos
      FOR SELECT TO authenticated
      USING (lower(gerencial_email) = lower(auth.email()))';

    EXECUTE 'CREATE POLICY "obj_update_own" ON objetivos
      FOR UPDATE TO authenticated
      USING (lower(gerencial_email) = lower(auth.email()))
      WITH CHECK (lower(gerencial_email) = lower(auth.email()))';

    EXECUTE 'CREATE POLICY "obj_delete_own" ON objetivos
      FOR DELETE TO authenticated
      USING (lower(gerencial_email) = lower(auth.email()))';

    EXECUTE 'CREATE POLICY "obj_insert_gerencial" ON objetivos
      FOR INSERT TO authenticated
      WITH CHECK (
        lower(gerencial_email) = lower(auth.email())
        AND is_gerencial_or_admin(auth.email())
      )';
  END IF;
END $$;

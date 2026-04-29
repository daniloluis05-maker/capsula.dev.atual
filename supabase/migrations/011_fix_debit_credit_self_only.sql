-- ─────────────────────────────────────────────────────────────
-- 011_fix_debit_credit_self_only.sql
-- Fecha vulnerabilidade C1: debit_credit aceitava p_email arbitrário
-- e qualquer usuário autenticado podia debitar créditos de outras
-- contas. Agora a função exige que auth.email() == p_email.
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- Idempotente.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION debit_credit(p_email text, p_matrix text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_email text := lower(coalesce(auth.email(), ''));
  v_target_email text := lower(trim(coalesce(p_email, '')));
  v_plano        text;
  v_plano_expira timestamptz;
  v_creditos     jsonb;
  v_specific     int;
  v_avulsos      int;
BEGIN
  -- Bloqueia uso cross-account: chamador SÓ debita créditos do próprio email
  IF v_caller_email = '' OR v_caller_email <> v_target_email THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'forbidden');
  END IF;

  SELECT plano, plano_expira_em, creditos
    INTO v_plano, v_plano_expira, v_creditos
    FROM usuarios
   WHERE lower(email) = v_target_email
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'user_not_found');
  END IF;

  -- Plano Pro ou Gerencial ativo: não debita, apenas autoriza
  IF v_plano IN ('profissional', 'gerencial') AND
     (v_plano_expira IS NULL OR v_plano_expira > now()) THEN
    RETURN jsonb_build_object('ok', true, 'is_pro', true);
  END IF;

  -- Admin
  IF EXISTS (SELECT 1 FROM usuarios WHERE lower(email) = v_target_email AND is_admin = true) THEN
    RETURN jsonb_build_object('ok', true, 'is_pro', true);
  END IF;

  v_creditos := coalesce(v_creditos, '{}'::jsonb);
  v_specific := coalesce((v_creditos ->> p_matrix)::int, 0);
  v_avulsos  := coalesce((v_creditos ->> 'avulsos')::int, 0);

  IF v_specific > 0 THEN
    v_creditos := jsonb_set(v_creditos, ARRAY[p_matrix], to_jsonb(v_specific - 1));
  ELSIF v_avulsos > 0 THEN
    v_creditos := jsonb_set(v_creditos, '{avulsos}', to_jsonb(v_avulsos - 1));
  ELSE
    RETURN jsonb_build_object('ok', false, 'reason', 'no_credits');
  END IF;

  UPDATE usuarios
     SET creditos = v_creditos
   WHERE lower(email) = v_target_email;

  RETURN jsonb_build_object('ok', true, 'creditos', v_creditos);
END;
$$;

GRANT EXECUTE ON FUNCTION debit_credit(text, text) TO authenticated;

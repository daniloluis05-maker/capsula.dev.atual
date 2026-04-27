-- ─────────────────────────────────────────────────────────────
-- 007_debit_credit.sql
-- RPC atômica para débito de crédito server-side.
-- Resolve bypass via edição de localStorage (Vuln-2).
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION debit_credit(p_email text, p_matrix text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plano          text;
  v_plano_expira   timestamptz;
  v_creditos       jsonb;
  v_specific       int;
  v_avulsos        int;
BEGIN
  SELECT plano, plano_expira_em, creditos
    INTO v_plano, v_plano_expira, v_creditos
    FROM usuarios
   WHERE lower(email) = lower(p_email)
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
  IF EXISTS (SELECT 1 FROM usuarios WHERE lower(email) = lower(p_email) AND is_admin = true) THEN
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
   WHERE lower(email) = lower(p_email);

  RETURN jsonb_build_object('ok', true, 'creditos', v_creditos);
END;
$$;

GRANT EXECUTE ON FUNCTION debit_credit(text, text) TO authenticated;

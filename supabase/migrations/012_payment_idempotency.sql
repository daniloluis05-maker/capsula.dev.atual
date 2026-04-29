-- ─────────────────────────────────────────────────────────────
-- 012_payment_idempotency.sql
-- Fecha vulnerabilidade C2: webhooks MP/Stripe podiam creditar
-- duplicado se o gateway retentasse após sucesso parcial.
-- Cria tabela processed_payments com (provider, external_id) PK.
-- As edge functions inserem ANTES de creditar; PK violation = skip.
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- Idempotente.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS processed_payments (
  provider     text        NOT NULL,    -- 'mp' | 'stripe'
  external_id  text        NOT NULL,    -- payment.id (MP) ou event.id (Stripe)
  email        text,
  product_key  text,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, external_id)
);

CREATE INDEX IF NOT EXISTS idx_pp_processed_at ON processed_payments (processed_at);

-- RLS: apenas service_role acessa (edge functions). Bloqueia anon/authenticated.
ALTER TABLE processed_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pp_no_access" ON processed_payments;
-- Sem policies = nenhum acesso para anon/authenticated; service_role bypassa RLS.

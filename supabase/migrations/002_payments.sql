-- ─────────────────────────────────────────────────────────────
-- 002_payments.sql
-- Adiciona suporte a créditos, planos e avaliações remotas.
-- Execute em: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

-- 1. Colunas de pagamento na tabela usuarios
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS creditos        jsonb        DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS plano           text         DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plano_expira_em timestamptz  DEFAULT NULL;

-- 2. Índice para busca por uid (usado pelo webhook)
CREATE INDEX IF NOT EXISTS idx_usuarios_uid ON usuarios (uid);

-- 3. Tabela de avaliações remotas (Plano Profissional)
CREATE TABLE IF NOT EXISTS avaliacoes_remotas (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_uid  text         NOT NULL,
  respondente_nome  text         NOT NULL,
  etiqueta          text,
  matriz            text         NOT NULL,
  token             text         NOT NULL UNIQUE,
  status            text         NOT NULL DEFAULT 'pendente',  -- pendente | concluido | expirado
  resultado         jsonb,
  expires_at        timestamptz  NOT NULL,
  created_at        timestamptz  NOT NULL DEFAULT now(),
  completado_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_aval_prof   ON avaliacoes_remotas (profissional_uid);
CREATE INDEX IF NOT EXISTS idx_aval_token  ON avaliacoes_remotas (token);
CREATE INDEX IF NOT EXISTS idx_aval_status ON avaliacoes_remotas (status);

-- 4. RLS: profissional só vê suas próprias avaliações
ALTER TABLE avaliacoes_remotas ENABLE ROW LEVEL SECURITY;

-- Leitura: profissional vê as suas
CREATE POLICY "prof_select_own" ON avaliacoes_remotas
  FOR SELECT USING (profissional_uid = auth.uid()::text);

-- Inserção: profissional insere as suas
CREATE POLICY "prof_insert_own" ON avaliacoes_remotas
  FOR INSERT WITH CHECK (profissional_uid = auth.uid()::text);

-- Update resultado: edge function usa service_role (bypassa RLS)
-- Respondente anônimo escreve via token — uso exclusivo da Edge Function

-- 5. Expirar avaliações automaticamente (opcional: via cron no Supabase)
-- UPDATE avaliacoes_remotas SET status='expirado'
-- WHERE expires_at < now() AND status='pendente';

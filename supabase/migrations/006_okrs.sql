-- ═══════════════════════════════════════════════════════════════
-- 006_okrs.sql
-- OKRs (Objectives & Key Results) para o Plano Gerencial.
-- Cada objetivo tem N key_results, cada um com valor_atual e valor_meta.
-- O progresso do objetivo é a média ponderada dos KRs.
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- Idempotente.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. objetivos ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS objetivos (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gerencial_email text        NOT NULL,
  equipe_id       uuid        REFERENCES equipes(id) ON DELETE SET NULL,
  ciclo           text        NOT NULL,                          -- ex: "2026-Q2"
  titulo          text        NOT NULL,
  descricao       text,
  prazo           date,
  status          text        NOT NULL DEFAULT 'ativo',          -- ativo | concluido | cancelado
  cor             text        NOT NULL DEFAULT '#7c6af7',
  ordem           int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_obj_email   ON objetivos (gerencial_email);
CREATE INDEX IF NOT EXISTS idx_obj_ciclo   ON objetivos (ciclo);
CREATE INDEX IF NOT EXISTS idx_obj_equipe  ON objetivos (equipe_id);

ALTER TABLE objetivos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "obj_owner" ON objetivos;
CREATE POLICY "obj_owner" ON objetivos
  FOR ALL TO authenticated
  USING (lower(gerencial_email) = lower(auth.email()))
  WITH CHECK (lower(gerencial_email) = lower(auth.email()));


-- ── 2. key_results ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS key_results (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  objetivo_id    uuid        NOT NULL REFERENCES objetivos(id) ON DELETE CASCADE,
  titulo         text        NOT NULL,
  valor_inicial  numeric     NOT NULL DEFAULT 0,
  valor_atual    numeric     NOT NULL DEFAULT 0,
  valor_meta     numeric     NOT NULL,
  unidade        text        NOT NULL DEFAULT '%',
  peso           int         NOT NULL DEFAULT 1,
  ordem          int         NOT NULL DEFAULT 0,
  responsavel    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kr_obj ON key_results (objetivo_id);

ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kr_owner" ON key_results;
CREATE POLICY "kr_owner" ON key_results
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM objetivos o
      WHERE o.id = key_results.objetivo_id
        AND lower(o.gerencial_email) = lower(auth.email())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM objetivos o
      WHERE o.id = key_results.objetivo_id
        AND lower(o.gerencial_email) = lower(auth.email())
    )
  );


-- ── 3. histórico de updates do KR (opcional, para gráfico) ──
CREATE TABLE IF NOT EXISTS kr_updates (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  kr_id        uuid        NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  valor        numeric     NOT NULL,
  comentario   text,
  registrado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kru_kr ON kr_updates (kr_id);

ALTER TABLE kr_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kru_owner" ON kr_updates;
CREATE POLICY "kru_owner" ON kr_updates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM key_results kr
      JOIN objetivos o ON o.id = kr.objetivo_id
      WHERE kr.id = kr_updates.kr_id
        AND lower(o.gerencial_email) = lower(auth.email())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM key_results kr
      JOIN objetivos o ON o.id = kr.objetivo_id
      WHERE kr.id = kr_updates.kr_id
        AND lower(o.gerencial_email) = lower(auth.email())
    )
  );


-- ═══════════════════════════════════════════════════════════════
-- FIM. 3 tabelas: objetivos, key_results, kr_updates
-- ═══════════════════════════════════════════════════════════════

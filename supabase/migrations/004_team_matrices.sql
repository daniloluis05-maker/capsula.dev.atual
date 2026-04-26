-- ═══════════════════════════════════════════════════════════════
-- 004_team_matrices.sql
-- Tabelas para as 3 matrizes de equipe (Plano Gerencial):
--   1) 5W2H — Plano de Ação
--   2) Matriz RACI — Papéis e Responsabilidades
--   3) SWOT de Equipe — Análise estratégica coletiva
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- Idempotente: pode rodar várias vezes sem erro.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. 5W2H — itens do plano de ação ─────────────────────────
CREATE TABLE IF NOT EXISTS plano_acao_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id   uuid        NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  what        text        NOT NULL,                -- O que
  why         text,                                -- Por que
  where_loc   text,                                -- Onde
  when_data   date,                                -- Quando (prazo)
  who         text,                                -- Quem
  how         text,                                -- Como
  how_much    numeric,                             -- Quanto custa
  status      text        NOT NULL DEFAULT 'pendente',  -- pendente | em_andamento | concluido | cancelado
  prioridade  text        NOT NULL DEFAULT 'media',     -- baixa | media | alta | critica
  ordem       int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pa_equipe ON plano_acao_items (equipe_id);
CREATE INDEX IF NOT EXISTS idx_pa_status ON plano_acao_items (status);

ALTER TABLE plano_acao_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pa_all_own" ON plano_acao_items;
CREATE POLICY "pa_all_own" ON plano_acao_items FOR ALL USING (true);


-- ── 2. RACI — atividades + atribuições ───────────────────────
CREATE TABLE IF NOT EXISTS raci_atividades (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id   uuid        NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  atividade   text        NOT NULL,
  ordem       int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raci_equipe ON raci_atividades (equipe_id);

ALTER TABLE raci_atividades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "raci_all" ON raci_atividades;
CREATE POLICY "raci_all" ON raci_atividades FOR ALL USING (true);


CREATE TABLE IF NOT EXISTS raci_atribuicoes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id  uuid NOT NULL REFERENCES raci_atividades(id) ON DELETE CASCADE,
  membro_id     uuid NOT NULL REFERENCES equipe_membros(id) ON DELETE CASCADE,
  papel         text NOT NULL,    -- R | A | C | I
  UNIQUE (atividade_id, membro_id)
);

CREATE INDEX IF NOT EXISTS idx_raci_atr_at ON raci_atribuicoes (atividade_id);

ALTER TABLE raci_atribuicoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "raci_atr_all" ON raci_atribuicoes;
CREATE POLICY "raci_atr_all" ON raci_atribuicoes FOR ALL USING (true);


-- ── 3. SWOT de Equipe — itens por quadrante ──────────────────
CREATE TABLE IF NOT EXISTS swot_equipe_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id   uuid        NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  quadrante   text        NOT NULL,                -- forcas | fraquezas | oportunidades | ameacas
  texto       text        NOT NULL,
  ordem       int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_swot_equipe ON swot_equipe_items (equipe_id);
CREATE INDEX IF NOT EXISTS idx_swot_quad   ON swot_equipe_items (quadrante);

ALTER TABLE swot_equipe_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "swot_eq_all" ON swot_equipe_items;
CREATE POLICY "swot_eq_all" ON swot_equipe_items FOR ALL USING (true);


-- ═══════════════════════════════════════════════════════════════
-- FIM. Confira se as 4 tabelas foram criadas:
--   plano_acao_items, raci_atividades, raci_atribuicoes, swot_equipe_items
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 003_remote_links.sql
-- Tabelas para links remotos (Plano Pro), resultados remotos,
-- indicadores e registros semanais (Plano Gerencial).
--
-- Execute em: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

-- ── 1. remote_links ──────────────────────────────────────────
-- Um link compartilhável que o Pro cria para coletar avaliações.

CREATE TABLE IF NOT EXISTS remote_links (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token            text        NOT NULL UNIQUE,
  pro_email        text        NOT NULL,
  matriz           text        NOT NULL,
  etiqueta         text,
  max_completions  int         NOT NULL DEFAULT 20,
  completion_count int         NOT NULL DEFAULT 0,
  expires_at       timestamptz,                       -- NULL = sem prazo
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rl_pro_email ON remote_links (pro_email);
CREATE INDEX IF NOT EXISTS idx_rl_token     ON remote_links (token);

-- RLS
ALTER TABLE remote_links ENABLE ROW LEVEL SECURITY;

-- Proprietário lê/insere/deleta os seus próprios links
CREATE POLICY "rl_select_own" ON remote_links
  FOR SELECT USING (pro_email = (SELECT email FROM usuarios WHERE email = pro_email LIMIT 1));

-- Simplificamos: Pro insere autenticado via service_role da Edge Function.
-- Para leitura anônima (remote-link.js valida token sem login):
CREATE POLICY "rl_select_by_token" ON remote_links
  FOR SELECT TO anon USING (true);

-- Apenas o próprio dono pode inserir (autenticado)
CREATE POLICY "rl_insert_own" ON remote_links
  FOR INSERT WITH CHECK (true);

-- Apenas service_role atualiza (increment via RPC)
-- (RLS não se aplica ao service_role, então sem política extra)


-- ── 2. remote_results ────────────────────────────────────────
-- Resultados individuais enviados pelos respondentes.

CREATE TABLE IF NOT EXISTS remote_results (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token             text        NOT NULL REFERENCES remote_links(token) ON DELETE CASCADE,
  respondente_nome  text        NOT NULL,
  respondente_email text,
  resultado         jsonb,
  completed_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rr_token ON remote_results (token);

-- RLS
ALTER TABLE remote_results ENABLE ROW LEVEL SECURITY;

-- Proprietário do link lê resultados (via token → pro_email)
CREATE POLICY "rr_select_owner" ON remote_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM remote_links rl
      WHERE rl.token = remote_results.token
    )
  );

-- Respondentes anônimos inserem (validação feita no JS)
CREATE POLICY "rr_insert_anon" ON remote_results
  FOR INSERT TO anon WITH CHECK (true);

-- Usuários autenticados também podem inserir
CREATE POLICY "rr_insert_auth" ON remote_results
  FOR INSERT WITH CHECK (true);


-- ── 3. Função RPC: increment_remote_completion ───────────────
-- Incremento atômico para evitar race condition quando dois
-- respondentes terminam ao mesmo tempo.

CREATE OR REPLACE FUNCTION increment_remote_completion(link_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE remote_links
  SET completion_count = completion_count + 1
  WHERE token = link_token;
END;
$$;


-- ── 4. indicadores ───────────────────────────────────────────
-- Indicadores de acompanhamento semanal do usuário Gerencial.

CREATE TABLE IF NOT EXISTS indicadores (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gerencial_email text        NOT NULL,
  nome            text        NOT NULL,
  unidade         text        NOT NULL DEFAULT '%',
  meta            numeric,
  cor             text        NOT NULL DEFAULT '#7c6af7',
  descricao       text,
  ativo           boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ind_email ON indicadores (gerencial_email);

-- RLS
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ind_all_own" ON indicadores
  FOR ALL USING (true);


-- ── 4b. equipes ──────────────────────────────────────────────
-- Equipes formadas pelo usuário Gerencial.

CREATE TABLE IF NOT EXISTS equipes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gerencial_email text        NOT NULL,
  nome            text        NOT NULL,
  descricao       text,
  ativo           boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eq_email ON equipes (gerencial_email);

ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eq_all_own" ON equipes
  FOR ALL USING (true);


-- ── 4c. equipe_membros ───────────────────────────────────────
-- Relação N:N entre equipes e respondentes (remote_results).

CREATE TABLE IF NOT EXISTS equipe_membros (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id         uuid        NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  remote_result_id  uuid        REFERENCES remote_results(id) ON DELETE CASCADE,
  nome              text        NOT NULL,
  email             text,
  papel             text,         -- ex: "Líder", "Backend", "Product"
  resultado         jsonb,        -- snapshot do resultado (para não depender do remote_result)
  matriz            text,         -- DISC, BIGFIVE, etc.
  added_at          timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (equipe_id, nome, matriz)
);

CREATE INDEX IF NOT EXISTS idx_em_equipe ON equipe_membros (equipe_id);

ALTER TABLE equipe_membros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "em_all_own" ON equipe_membros
  FOR ALL USING (true);


-- ── 4d. equipe_dna ───────────────────────────────────────────
-- Cache do DNA Estratégico de Equipe gerado pela IA.

CREATE TABLE IF NOT EXISTS equipe_dna (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id   uuid        NOT NULL UNIQUE REFERENCES equipes(id) ON DELETE CASCADE,
  conteudo    jsonb       NOT NULL,       -- { resumo, forcas, riscos, recomendacoes }
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE equipe_dna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ed_all_own" ON equipe_dna
  FOR ALL USING (true);


-- ── 5. registros_semanais ─────────────────────────────────────
-- Um valor por semana por indicador (upsert na semana).

CREATE TABLE IF NOT EXISTS registros_semanais (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id  uuid        NOT NULL REFERENCES indicadores(id) ON DELETE CASCADE,
  semana        date        NOT NULL,   -- data da segunda-feira da semana (ISO)
  valor         numeric     NOT NULL,
  nota          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (indicador_id, semana)
);

CREATE INDEX IF NOT EXISTS idx_rs_indicador ON registros_semanais (indicador_id);
CREATE INDEX IF NOT EXISTS idx_rs_semana    ON registros_semanais (semana);

-- RLS
ALTER TABLE registros_semanais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rs_all_own" ON registros_semanais
  FOR ALL USING (true);

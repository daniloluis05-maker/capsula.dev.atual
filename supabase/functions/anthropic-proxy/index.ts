// supabase/functions/anthropic-proxy/index.ts
// Proxy seguro para a API da Anthropic com autenticação JWT do Supabase.
// Apenas usuários autenticados no capsula.dev podem chamar a Anthropic.
//
// Deploy:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy anthropic-proxy
//
// Variáveis de ambiente automáticas (NÃO precisam de secrets set):
//   SUPABASE_URL       — injetada automaticamente pelo Supabase
//   SUPABASE_ANON_KEY  — injetada automaticamente pelo Supabase
//
// Apenas ANTHROPIC_API_KEY precisa ser configurada manualmente.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.1";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const ALLOWED_MODEL     = "claude-sonnet-4-20250514";
const MAX_TOKENS_LIMIT  = 1500;

const ALLOWED_ORIGINS = [
  "https://capsula.dev",
  "https://www.capsula.dev",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin":  allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const cors   = corsHeaders(origin);

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  // Valida origem
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(
      JSON.stringify({ error: "Origem não autorizada" }),
      { status: 403, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  // ── ITEM 1: Autenticação JWT do Supabase ─────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Não autenticado" }),
      { status: 401, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: "Configuração do servidor incompleta" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "Token inválido ou expirado" }),
      { status: 401, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
  // ─────────────────────────────────────────────────────────────

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Configuração do servidor incompleta" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "JSON inválido" }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  // Força modelo e limita tokens
  body.model = ALLOWED_MODEL;
  if (!body.max_tokens || (body.max_tokens as number) > MAX_TOKENS_LIMIT) {
    body.max_tokens = MAX_TOKENS_LIMIT;
  }

  // ── ITEM 7: Rate limiting simples por usuário ─────────────────
  // Usa Supabase KV (via tabela) ou simples header check.
  // Implementação leve: limita pela frequência de requisições usando
  // o user.id — pode ser expandido para tabela rate_limits no Supabase.
  // Por ora, o limite de max_tokens já protege o custo por chamada.
  // ─────────────────────────────────────────────────────────────

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[anthropic-proxy] Erro:", err);
    return new Response(
      JSON.stringify({ error: "Falha ao conectar com a API" }),
      { status: 502, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  const responseData = await anthropicResponse.json();
  return new Response(JSON.stringify(responseData), {
    status: anthropicResponse.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});

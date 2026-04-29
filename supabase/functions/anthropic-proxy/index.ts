// ─────────────────────────────────────────────────────────────
// supabase/functions/anthropic-proxy/index.ts
// Proxy seguro para a API da Anthropic com:
//   - autenticação Supabase (sessão JWT ou anon key + email no body)
//   - rate limiting (10 req/hora por email)
//
// Deploy:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy anthropic-proxy
// ─────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.1";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const ALLOWED_MODEL     = "claude-sonnet-4-20250514";
const MAX_TOKENS_LIMIT  = 1500;
const RATE_LIMIT_PER_HOUR = 10;

const ALLOWED_ORIGINS = [
  "https://capsula-dev-atualizado.vercel.app",
  "https://www.capsula-dev-atualizado.vercel.app",
  "https://capsula.dev",
  "https://www.capsula.dev",
  "https://capsula-dev-atualizado.vercel.app",
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

function jsonRes(data: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const cors   = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST")    return jsonRes({ error: "Método não permitido" }, 405, cors);

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return jsonRes({ error: "Origem não autorizada" }, 403, cors);
  }

  // ── Auth: aceita JWT de usuário OU anon key ──────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return jsonRes({ error: "Não autenticado" }, 401, cors);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return jsonRes({ error: "Configuração do servidor incompleta" }, 500, cors);
  }

  const token = authHeader.replace("Bearer ", "");
  const isAnonKey = token === supabaseAnonKey;

  // Lê body uma vez
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonRes({ error: "JSON inválido" }, 400, cors);
  }

  // Identifica o email do usuário para rate limit
  let userEmail = "";
  if (!isAnonKey) {
    // JWT user — extrai email da sessão
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return jsonRes({ error: "Token inválido ou expirado" }, 401, cors);
    }
    userEmail = user.email || "";
  } else {
    // Anon key: usa IP como chave de rate limit — impede spoofing de email
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") || "unknown");
    userEmail = `anon:${ip}`;
  }

  // ── Rate limit (service_role bypassa RLS e chama a RPC) ──────
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  const { data: rl, error: rlError } = await adminClient.rpc("check_ai_rate_limit", {
    p_email:        userEmail,
    p_provider:     "anthropic",
    p_max_per_hour: RATE_LIMIT_PER_HOUR,
  });
  if (rlError) {
    console.error("[anthropic-proxy] rate-limit RPC erro:", rlError);
    // Não bloqueia em caso de falha da RPC (degradação suave)
  } else if (rl && (rl as Record<string, unknown>).ok === false) {
    const reason = (rl as Record<string, unknown>).reason;
    if (reason === "rate_limit") {
      return jsonRes({
        error: `Limite de ${RATE_LIMIT_PER_HOUR} chamadas por hora atingido. Tente novamente em alguns minutos.`,
        rate_limit: rl,
      }, 429, cors);
    }
  }

  // ── Forward para Anthropic ───────────────────────────────────
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return jsonRes({ error: "Configuração do servidor incompleta" }, 500, cors);

  // Remove campos internos antes de enviar
  delete body.email;

  body.model = ALLOWED_MODEL;
  if (!body.max_tokens || (body.max_tokens as number) > MAX_TOKENS_LIMIT) {
    body.max_tokens = MAX_TOKENS_LIMIT;
  }

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
    console.error("[anthropic-proxy] Erro fetch:", err);
    return jsonRes({ error: "Falha ao conectar com a API" }, 502, cors);
  }

  const responseData = await anthropicResponse.json();
  return new Response(JSON.stringify(responseData), {
    status: anthropicResponse.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});

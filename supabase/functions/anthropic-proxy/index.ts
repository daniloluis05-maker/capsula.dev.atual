import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

const ALLOWED_ORIGINS = [
  "https://capsula.dev",
  "https://www.capsula.dev",
];

function corsHeaders(origin) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: "Origem não autorizada" }), {
      status: 403, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Configuração incompleta" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const ALLOWED_MODEL = "claude-sonnet-4-20250514";
  if (body.model && body.model !== ALLOWED_MODEL) {
    body.model = ALLOWED_MODEL;
  }
  if (!body.max_tokens || body.max_tokens > 1500) {
    body.max_tokens = 1500;
  }

  const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });

  const data = await anthropicResponse.json();
  return new Response(JSON.stringify(data), {
    status: anthropicResponse.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
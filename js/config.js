// ─────────────────────────────────────────────────────────────
// capsula.dev · config.js
// Fonte única das credenciais Supabase.
// Para rotacionar a chave: edite APENAS este arquivo.
//
// ATENÇÃO: esta é a chave pública (anon key). Certifique-se de
// que as políticas RLS (Row Level Security) estejam ativas no
// painel do Supabase para proteger seus dados.
// ─────────────────────────────────────────────────────────────

window.CAPSULA_CONFIG = {
  supabaseUrl: 'https://dfnmofzbpdmnvlyowtmp.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbm1vZnpicGRtbnZseW93dG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjQ4MzIsImV4cCI6MjA5MTE0MDgzMn0.KXcRmhpPFwpQGXkYIVjXPJvMh5w1KpIlZiwyIEUBrvU',
  // groqKey removido: agora as chamadas vão por /functions/v1/groq-proxy
  // (a chave da Groq fica como secret no Supabase, nunca no client)

  // ── Mercado Pago ─────────────────────────────────────────────
  // Gerado por scripts/mercadopago-setup.js — não edite manualmente
  // ⚠️  NUNCA adicione MP_ACCESS_TOKEN aqui (só na Edge Function)
  MP_PUBLIC_KEY: 'APP_USR-2d867aca-2710-4594-af67-4e1f9e1184ff',

  // ── Sentry (error tracking) ─────────────────────────────────
  // Cole aqui o DSN do projeto Sentry (browser) e a integração ativa sozinha.
  // Free tier: https://sentry.io  → New Project → Browser JavaScript
  // Sem DSN, sentry-init.js apenas não faz nada (no-op).
  sentryDsn: '',

  // ── Google Analytics 4 ──────────────────────────────────────
  // Cole o Measurement ID (formato G-XXXXXXXXXX) gerado em
  // https://analytics.google.com → Admin → Property → Data Streams.
  // Sem ID, js/analytics.js não carrega o gtag e o cookie banner
  // não aparece — privacidade por padrão.
  gaMeasurementId: '',
};

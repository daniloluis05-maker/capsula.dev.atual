// ─────────────────────────────────────────────────────────────
// supabase/functions/create-mp-preference/index.ts
// Edge Function: cria uma preferência de pagamento no Mercado Pago
// e retorna a URL de checkout (init_point).
//
// Variáveis de ambiente necessárias (Supabase → Edge Functions → Secrets):
//   MP_ACCESS_TOKEN   ACCESS TOKEN do app (TEST-... ou APP_USR-...)
//   SITE_URL          https://sistemagnosis.com.br (produção) ou http://localhost:3000
// ─────────────────────────────────────────────────────────────

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN') ?? '';
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL') ?? '';
const SITE_URL        = Deno.env.get('SITE_URL') ?? 'https://sistemagnosis.com.br';
const WEBHOOK_URL     = `${SUPABASE_URL}/functions/v1/mp-webhook`;

const PRODUCTS: Record<string, { title: string; amount: number }> = {
  avaliacao: { title: 'Avaliação Individual — 1 crédito',            amount: 29.90 },
  pacote3:   { title: 'Pacote Essencial — DISC + SOAR + Ikigai',     amount: 79.90 },
  dna:       { title: 'DNA Estratégico — análise IA',                amount: 67.90 },
  completo:  { title: 'Pacote Completo + DNA Estratégico',           amount: 219.90 },
  pro:       { title: 'Plano Profissional — 30 dias ilimitado',      amount: 129.90 },
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let body: { product_key: string; uid: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const { product_key, uid, email } = body;
  const product = PRODUCTS[product_key];

  if (!product) return json({ error: `Produto inválido: ${product_key}` }, 400);
  if (!uid)     return json({ error: 'uid obrigatório' }, 400);

  const preference = {
    items: [{
      id:         product_key,
      title:      product.title,
      quantity:   1,
      unit_price: product.amount,
      currency_id:'BRL',
    }],
    payer:              email ? { email } : undefined,
    external_reference: uid,
    metadata:           { product_key },
    back_urls: {
      success: `${SITE_URL}/pagamento-sucesso.html?produto=${product_key}`,
      failure: `${SITE_URL}/index.html#planos`,
      pending: `${SITE_URL}/pagamento-sucesso.html?produto=${product_key}&status=pendente`,
    },
    auto_return:      'approved',
    notification_url: WEBHOOK_URL,
    // Expira em 30 minutos para evitar links stale
    expires:          true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to:   new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method:  'POST',
    headers: {
      'Authorization':     `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type':      'application/json',
      'X-Idempotency-Key': `${uid}-${product_key}-${Date.now()}`,
    },
    body: JSON.stringify(preference),
  });

  const data = await mpRes.json();

  if (!mpRes.ok) {
    console.error('[create-mp-preference] Erro MP:', data);
    return json({ error: data.message || 'Erro ao criar preferência MP' }, 500);
  }

  console.log(`[create-mp-preference] Preferência criada: ${data.id} para uid=${uid} produto=${product_key}`);

  return json({
    preference_id:       data.id,
    init_point:          data.init_point,          // produção
    sandbox_init_point:  data.sandbox_init_point,  // teste
  });
});

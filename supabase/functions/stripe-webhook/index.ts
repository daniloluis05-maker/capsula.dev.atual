// ─────────────────────────────────────────────────────────────
// supabase/functions/stripe-webhook/index.ts
// Edge Function: recebe eventos do Stripe e atualiza créditos/plano
// no Supabase de forma segura.
//
// Variáveis de ambiente necessárias (Supabase → Edge Functions → Secrets):
//   STRIPE_SECRET_KEY      sk_live_... ou sk_test_...
//   STRIPE_WEBHOOK_SECRET  whsec_...
//   SUPABASE_URL           (automático no Supabase)
//   SUPABASE_SERVICE_ROLE_KEY (automático no Supabase)
// ─────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY     = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL          = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_KEY          = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Créditos concedidos por Price ID (mapeamento igual ao stripe-setup.js)
const PRICE_CREDITS: Record<string, Record<string, number | string>> = {
  [Deno.env.get('STRIPE_PRICE_AVALIACAO') ?? '']: { avulsos: 1 },
  [Deno.env.get('STRIPE_PRICE_PACOTE3')   ?? '']: { disc: 1, soar: 1, ikigai: 1 },
  [Deno.env.get('STRIPE_PRICE_DNA')       ?? '']: { dna: 1 },
  [Deno.env.get('STRIPE_PRICE_COMPLETO')  ?? '']: { disc: 1, soar: 1, ikigai: 1, ancoras: 1, johari: 1, bigfive: 1, pearson: 1, tci: 1, dna: 1 },
  [Deno.env.get('STRIPE_PRICE_PRO')       ?? '']: { plano: 'profissional' },
};

// ── Verificação da assinatura do webhook (segurança) ──────────
async function verifyStripeSignature(body: string, header: string, secret: string): Promise<boolean> {
  try {
    const parts     = Object.fromEntries(header.split(',').map(p => p.split('=')));
    const timestamp = parts['t'];
    const sig       = parts['v1'];
    if (!timestamp || !sig) return false;

    // Verifica tolerância de 5 minutos para evitar replay attacks
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

    const payload   = `${timestamp}.${body}`;
    const key       = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const computed  = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const hex       = Array.from(new Uint8Array(computed)).map(b => b.toString(16).padStart(2, '0')).join('');

    return hex === sig;
  } catch {
    return false;
  }
}

// ── Helpers Stripe ─────────────────────────────────────────────
async function stripeGet(endpoint: string) {
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    headers: { 'Authorization': `Basic ${btoa(STRIPE_SECRET_KEY + ':')}` },
  });
  return res.json();
}

// ── Adiciona créditos ao usuário no Supabase ──────────────────
async function addCredits(uid: string, credits: Record<string, number | string>) {
  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Busca usuário pelo uid
  const { data: row, error: findErr } = await db
    .from('usuarios')
    .select('creditos, plano, plano_expira_em, matrizes')
    .eq('uid', uid)
    .maybeSingle();

  if (findErr || !row) {
    console.error('[webhook] Usuário não encontrado:', uid, findErr);
    return false;
  }

  const current: Record<string, number> = row.creditos || {};
  let plano         = row.plano || 'free';
  let planoExpiraEm = row.plano_expira_em || null;

  if (credits.plano === 'profissional') {
    // Ativa plano Pro por 31 dias a partir de agora
    plano         = 'profissional';
    planoExpiraEm = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
  } else {
    // Incrementa créditos de matrizes
    for (const [key, val] of Object.entries(credits)) {
      if (typeof val === 'number') {
        current[key] = (current[key] || 0) + val;
      }
    }
  }

  const { error: updateErr } = await db
    .from('usuarios')
    .update({ creditos: current, plano, plano_expira_em: planoExpiraEm })
    .eq('uid', uid);

  if (updateErr) {
    console.error('[webhook] Erro ao atualizar créditos:', updateErr);
    return false;
  }

  console.log(`[webhook] Créditos adicionados para ${uid}:`, credits);
  return true;
}

// ── Cancela plano Pro (subscription deletada) ─────────────────
async function cancelPro(uid: string) {
  const db = createClient(SUPABASE_URL, SUPABASE_KEY);
  await db.from('usuarios').update({ plano: 'free', plano_expira_em: null }).eq('uid', uid);
  console.log(`[webhook] Plano Pro cancelado para ${uid}`);
}

// ── Handler principal ─────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body      = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  // Verificação de segurança — rejeita qualquer requisição não assinada pelo Stripe
  const valid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    console.error('[webhook] Assinatura inválida');
    return new Response('Invalid signature', { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const type = event.type as string;
  const obj  = (event.data as Record<string, unknown>)?.object as Record<string, unknown>;

  console.log(`[webhook] Evento recebido: ${type}`);

  try {
    // ── Pagamento único via Payment Link ───────────────────────
    if (type === 'checkout.session.completed') {
      const uid      = obj.client_reference_id as string;
      const priceId  = ((obj.line_items as Record<string, unknown>)?.data as Array<Record<string, unknown>>)?.[0]?.price?.id as string;

      // Se não veio line_items no objeto, busca da API
      let resolvedPriceId = priceId;
      if (!resolvedPriceId) {
        const sessionId = obj.id as string;
        const session   = await stripeGet(`/checkout/sessions/${sessionId}/line_items`);
        resolvedPriceId = session?.data?.[0]?.price?.id;
      }

      if (uid && resolvedPriceId && PRICE_CREDITS[resolvedPriceId]) {
        await addCredits(uid, PRICE_CREDITS[resolvedPriceId]);
      }
    }

    // ── Assinatura criada/renovada ─────────────────────────────
    if (type === 'invoice.payment_succeeded') {
      const subId     = obj.subscription as string;
      const customerId= obj.customer as string;

      if (subId) {
        const sub      = await stripeGet(`/subscriptions/${subId}`);
        const priceId  = sub?.items?.data?.[0]?.price?.id as string;
        const uid      = sub?.metadata?.uid as string || obj.client_reference_id as string;

        // Se não tiver uid no metadata, busca pelo customer email
        let resolvedUid = uid;
        if (!resolvedUid && customerId) {
          const customer = await stripeGet(`/customers/${customerId}`);
          const email    = customer?.email as string;
          if (email) {
            const db = createClient(SUPABASE_URL, SUPABASE_KEY);
            const { data } = await db.from('usuarios').select('uid').eq('email', email).maybeSingle();
            resolvedUid = data?.uid;
          }
        }

        if (resolvedUid && priceId && PRICE_CREDITS[priceId]) {
          await addCredits(resolvedUid, PRICE_CREDITS[priceId]);
        }
      }
    }

    // ── Assinatura cancelada ───────────────────────────────────
    if (type === 'customer.subscription.deleted') {
      const customerId = obj.customer as string;
      if (customerId) {
        const customer = await stripeGet(`/customers/${customerId}`);
        const email    = customer?.email as string;
        if (email) {
          const db = createClient(SUPABASE_URL, SUPABASE_KEY);
          const { data } = await db.from('usuarios').select('uid').eq('email', email).maybeSingle();
          if (data?.uid) await cancelPro(data.uid);
        }
      }
    }

    // ── Pagamento de assinatura falhou ─────────────────────────
    if (type === 'invoice.payment_failed') {
      console.warn('[webhook] Pagamento falhou para subscription:', obj.subscription);
      // Plano continua ativo até plano_expira_em — sem ação imediata
    }

  } catch (err) {
    console.error('[webhook] Erro ao processar evento:', err);
    // Retorna 200 para Stripe não retentar (erro é no processamento, não na validação)
  }

  return new Response('ok', { status: 200 });
});

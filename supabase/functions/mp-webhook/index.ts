// ─────────────────────────────────────────────────────────────
// supabase/functions/mp-webhook/index.ts
// Edge Function: recebe notificações IPN do Mercado Pago,
// valida o pagamento via API e adiciona créditos ao usuário.
//
// Variáveis de ambiente:
//   MP_ACCESS_TOKEN      Access Token do app MP
//   MP_WEBHOOK_SECRET    Secret configurado no painel MP → Webhooks (opcional)
//   SUPABASE_URL         (automático)
//   SUPABASE_SERVICE_ROLE_KEY (automático)
// ─────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MP_ACCESS_TOKEN   = Deno.env.get('MP_ACCESS_TOKEN') ?? '';
const MP_WEBHOOK_SECRET = Deno.env.get('MP_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Créditos concedidos por produto — deve refletir o PRODUCTS em create-mp-preference
const CREDITS_MAP: Record<string, Record<string, number | string>> = {
  avaliacao: { avulsos: 1 },
  pacote3:   { disc: 1, soar: 1, ikigai: 1 },
  dna:       { dna: 1 },
  completo:  { disc: 1, soar: 1, ikigai: 1, ancoras: 1, johari: 1, bigfive: 1, pearson: 1, tci: 1, dna: 1 },
  pro:       { plano: 'profissional' },
};

// ── Verificação de assinatura MP (webhook v2) ─────────────────
// Documentação: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
async function verifySignature(xSignature: string, xRequestId: string, dataId: string): Promise<boolean> {
  if (!MP_WEBHOOK_SECRET || !xSignature) return true; // sem secret → aceita (dev)

  const ts = xSignature.split(',').find(p => p.startsWith('ts='))?.slice(3) ?? '';
  const v1 = xSignature.split(',').find(p => p.startsWith('v1='))?.slice(3) ?? '';
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(MP_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const computed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest));
  const hex = Array.from(new Uint8Array(computed)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === v1;
}

// ── Busca dados do pagamento na API MP ────────────────────────
async function fetchPayment(paymentId: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MP API erro ${res.status}: ${err}`);
  }
  return res.json();
}

// ── Adiciona créditos no Supabase ─────────────────────────────
// email = external_reference enviado na criação da preferência MP
async function addCredits(email: string, credits: Record<string, number | string>): Promise<boolean> {
  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: row, error: findErr } = await db
    .from('usuarios')
    .select('creditos, plano, plano_expira_em')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (findErr || !row) {
    console.error('[mp-webhook] Usuário não encontrado pelo email:', email, findErr);
    return false;
  }

  const current: Record<string, number> = { ...(row.creditos || {}) };
  let plano         = row.plano || 'free';
  let planoExpiraEm = row.plano_expira_em as string | null;

  if (credits.plano === 'profissional') {
    // Plano Pro: 31 dias a partir de agora (1 dia extra de folga)
    plano         = 'profissional';
    planoExpiraEm = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
  } else {
    for (const [key, val] of Object.entries(credits)) {
      if (typeof val === 'number') {
        current[key] = (current[key] || 0) + val;
      }
    }
  }

  const { error: updateErr } = await db
    .from('usuarios')
    .update({ creditos: current, plano, plano_expira_em: planoExpiraEm })
    .eq('email', email.toLowerCase().trim());

  if (updateErr) {
    console.error('[mp-webhook] Erro ao salvar créditos:', updateErr);
    return false;
  }

  console.log(`[mp-webhook] ✓ Créditos adicionados email=${email}:`, credits);
  return true;
}

// ── Handler ───────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // MP às vezes faz GET para verificar a URL
  if (req.method === 'GET') return new Response('ok', { status: 200 });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const body = await req.text();
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  console.log('[mp-webhook] Evento recebido:', JSON.stringify(event).slice(0, 300));

  // Extrai tipo e ID — suporta IPN legacy e webhook v2
  const type   = (event.type as string)  || (event.topic as string) || '';
  const dataId = ((event.data as Record<string, unknown>)?.id as string)
              || (event.data_id as string)
              || (event.resource as string)?.split('/').pop()
              || '';

  if (type !== 'payment' || !dataId) {
    // Outros tipos (merchant_order, etc.) — apenas confirma
    return new Response('ok', { status: 200 });
  }

  // Verifica assinatura se secret estiver configurado
  const xSig = req.headers.get('x-signature') ?? '';
  const xReq = req.headers.get('x-request-id') ?? '';
  if (MP_WEBHOOK_SECRET && xSig) {
    const valid = await verifySignature(xSig, xReq, dataId);
    if (!valid) {
      console.error('[mp-webhook] Assinatura inválida');
      return new Response('Invalid signature', { status: 400 });
    }
  }

  try {
    const payment = await fetchPayment(dataId);
    console.log(`[mp-webhook] payment.id=${payment.id} status=${payment.status} ref=${payment.external_reference}`);

    if (payment.status !== 'approved') {
      // Pagamento pendente ou rejeitado — não faz nada, MP vai renotificar se aprovado
      return new Response('ok', { status: 200 });
    }

    const email      = payment.external_reference as string; // email do usuário
    const productKey = (payment.metadata?.product_key as string)
                    || (payment.additional_info?.items?.[0]?.id as string)
                    || '';

    if (!email) {
      console.error('[mp-webhook] external_reference vazio — pagamento sem email');
      return new Response('ok', { status: 200 });
    }

    if (!productKey || !CREDITS_MAP[productKey]) {
      console.error(`[mp-webhook] product_key inválido: "${productKey}"`);
      return new Response('ok', { status: 200 });
    }

    await addCredits(email, CREDITS_MAP[productKey]);

  } catch (err) {
    console.error('[mp-webhook] Erro:', (err as Error).message);
    // Retorna 200 para MP não ficar retentando em loop por erro de código
  }

  return new Response('ok', { status: 200 });
});

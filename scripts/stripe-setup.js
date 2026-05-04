#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// scripts/stripe-setup.js
// Cria produtos, preços, payment links e webhook no Stripe.
// Atualiza js/config.js com todos os IDs e URLs gerados.
//
// Uso:
//   node scripts/stripe-setup.js sk_test_SUA_CHAVE
//   node scripts/stripe-setup.js sk_live_SUA_CHAVE
// ─────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const SECRET_KEY = process.argv[2];
if (!SECRET_KEY || (!SECRET_KEY.startsWith('sk_test_') && !SECRET_KEY.startsWith('sk_live_'))) {
  console.error('\n❌  Chave inválida.');
  console.error('    Precisa da Secret Key (sk_test_... ou sk_live_...)');
  console.error('    Stripe → Developers → API Keys → Secret key → Reveal\n');
  process.exit(1);
}

const IS_LIVE      = SECRET_KEY.startsWith('sk_live_');
const CONFIG_PATH  = path.join(__dirname, '..', 'js', 'config.js');
const SUPABASE_URL = 'https://dfnmofzbpdmnvlyowtmp.supabase.co';
const SITE_URL     = IS_LIVE ? 'https://www.sistema-gnosis.com.br' : 'http://localhost:3000';
const WEBHOOK_URL  = `${SUPABASE_URL}/functions/v1/stripe-webhook`;

const PRODUCTS = [
  {
    key:         'avaliacao',
    name:        'Avaliação Individual',
    description: '1 crédito para qualquer matriz + PDF gerado',
    amount:      2990,
    type:        'one_time',
  },
  {
    key:         'pacote3',
    name:        'Pacote Essencial — DISC + SOAR + Ikigai',
    description: '3 matrizes com PDF incluído',
    amount:      7990,
    type:        'one_time',
  },
  {
    key:         'dna',
    name:        'DNA Estratégico',
    description: 'Análise IA — requer 8 matrizes concluídas',
    amount:      6790,
    type:        'one_time',
  },
  {
    key:         'completo',
    name:        'Pacote Completo + DNA',
    description: 'Todas as 8 matrizes + DNA Estratégico',
    amount:      21990,
    type:        'one_time',
  },
  {
    key:         'pro',
    name:        'Plano Profissional — 30 dias',
    description: 'PDFs e testes ilimitados + envio para terceiros por 30 dias',
    amount:      12990,
    type:        'one_time',
  },
];

// Créditos concedidos por produto
const CREDITS_MAP = {
  avaliacao: { avulsos: 1 },
  pacote3:   { disc: 1, soar: 1, ikigai: 1 },
  dna:       { dna: 1 },
  completo:  { disc: 1, soar: 1, ikigai: 1, ancoras: 1, johari: 1, bigfive: 1, pearson: 1, tci: 1, dna: 1 },
  pro:       { plano: 'profissional' },
};

async function stripe(method, endpoint, body = null) {
  const auth    = Buffer.from(`${SECRET_KEY}:`).toString('base64');
  const headers = { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' };
  const options = { method, headers };
  if (body) options.body = flattenParams(body);
  const res  = await fetch(`https://api.stripe.com/v1${endpoint}`, options);
  const json = await res.json();
  if (!res.ok) {
    const msg = json.error?.message || res.status;
    if (json.error?.code === 'api_key_expired' || msg.includes('Invalid API Key')) {
      throw new Error('Chave Stripe inválida ou revogada.\n    → Stripe → Developers → API Keys → Secret key → Reveal (ou Roll key para gerar uma nova)');
    }
    throw new Error(`Stripe ${method} ${endpoint} → ${msg}`);
  }
  return json;
}

// Flatten nested params for Stripe's form-encoded API
function flattenParams(obj, prefix = '') {
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      parts.push(flattenParams(v, key));
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === 'object') parts.push(flattenParams(item, `${key}[${i}]`));
        else parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(item)}`);
      });
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
    }
  }
  return parts.join('&');
}

let step = 0;
const TOTAL = PRODUCTS.length * 3 + 1; // produto + preço + payment link + webhook
function tick(label) {
  step++;
  const pct = Math.round((step / TOTAL) * 100);
  const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
  process.stdout.write(`\r  [${bar}] ${pct}%  ${label.padEnd(52)}`);
}

async function main() {
  console.log('\n');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │   Sistema Gnosis — Stripe Setup              │');
  console.log(`  │   Modo: ${IS_LIVE ? '🔴 PRODUÇÃO               ' : '🟡 TESTE                   '}       │`);
  console.log('  └──────────────────────────────────────────────┘\n');

  const priceIds = {};
  const linkUrls = {};

  for (const p of PRODUCTS) {
    tick(`Produto: ${p.name}`);
    const product = await stripe('POST', '/products', { name: p.name, description: p.description });

    tick(`Preço: R$ ${(p.amount / 100).toFixed(2).replace('.', ',')}`);
    const priceBody = { product: product.id, unit_amount: String(p.amount), currency: 'brl' };
    if (p.type === 'recurring') priceBody['recurring[interval]'] = p.interval;
    const price = await stripe('POST', '/prices', priceBody);
    priceIds[p.key] = price.id;

    tick(`Payment Link: ${p.name}`);
    const linkBody = {
      'line_items[0][price]':    price.id,
      'line_items[0][quantity]': '1',
      'after_completion[type]':  'redirect',
      'after_completion[redirect][url]': `${SITE_URL}/pagamento-sucesso.html?produto=${p.key}`,
    };
    const link = await stripe('POST', '/payment_links', linkBody);
    linkUrls[p.key] = link.url;
  }

  tick('Webhook endpoint...');
  const webhookBody = {
    url: WEBHOOK_URL,
    'enabled_events[0]':  'checkout.session.completed',
    'enabled_events[1]':  'customer.subscription.created',
    'enabled_events[2]':  'customer.subscription.updated',
    'enabled_events[3]':  'customer.subscription.deleted',
    'enabled_events[4]':  'invoice.payment_succeeded',
    'enabled_events[5]':  'invoice.payment_failed',
    'enabled_events[6]':  'payment_link.completed',
    description: 'Sistema Gnosis — Edge Function',
  };
  const webhook = await stripe('POST', '/webhook_endpoints', webhookBody);

  process.stdout.write('\n\n');

  // Atualizar js/config.js
  let configRaw = fs.readFileSync(CONFIG_PATH, 'utf8');
  configRaw = configRaw.replace(/\n\s*\/\/ ── Stripe[\s\S]*?(?=\n};)/, '');

  const stripeBlock = `
  // ── Stripe ───────────────────────────────────────────────────
  // Gerado por scripts/stripe-setup.js — não edite manualmente
  // ⚠️  NUNCA adicione STRIPE_SECRET_KEY aqui (só na Edge Function)
  STRIPE_PUBLIC_KEY:   '${IS_LIVE ? 'COLE_pk_live_AQUI' : 'COLE_pk_test_AQUI'}',
  // Payment Links — URLs de checkout
  STRIPE_LINK_AVALIACAO: '${linkUrls.avaliacao}',
  STRIPE_LINK_PACOTE3:   '${linkUrls.pacote3}',
  STRIPE_LINK_DNA:       '${linkUrls.dna}',
  STRIPE_LINK_COMPLETO:  '${linkUrls.completo}',
  STRIPE_LINK_PRO:       '${linkUrls.pro}',
  // Price IDs (referência interna)
  STRIPE_PRICE_AVALIACAO: '${priceIds.avaliacao}',
  STRIPE_PRICE_PACOTE3:   '${priceIds.pacote3}',
  STRIPE_PRICE_DNA:       '${priceIds.dna}',
  STRIPE_PRICE_COMPLETO:  '${priceIds.completo}',
  STRIPE_PRICE_PRO:       '${priceIds.pro}',`;

  const updated = configRaw.replace(/\n};/, stripeBlock + '\n};');
  fs.writeFileSync(CONFIG_PATH, updated, 'utf8');

  // Salvar secrets (nunca vai pro frontend nem pro git)
  const secretsPath = path.join(__dirname, '.stripe-secrets.txt');
  const creditsJson = JSON.stringify(CREDITS_MAP, null, 2);
  fs.writeFileSync(secretsPath, [
    '# ⚠️  SEGREDO — nunca commite este arquivo',
    '# Cole essas variáveis em: Supabase → Edge Functions → Secrets',
    '#',
    `STRIPE_SECRET_KEY=${SECRET_KEY}`,
    `STRIPE_WEBHOOK_SECRET=${webhook.secret}`,
    '',
    '# Price IDs por produto (para referência)',
    ...Object.entries(priceIds).map(([k, v]) => `STRIPE_PRICE_${k.toUpperCase()}=${v}`),
    '',
    '# Mapa de créditos (copie para a Edge Function se necessário):',
    '# ' + creditsJson.replace(/\n/g, '\n# '),
  ].join('\n'), 'utf8');

  // Garantir .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  const gi = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  if (!gi.includes('.stripe-secrets.txt')) {
    fs.appendFileSync(gitignorePath, '\nscripts/.stripe-secrets.txt\n');
  }

  // Resumo
  console.log('  ✅  Configuração concluída!\n');
  console.log('  Payment Links criados:');
  for (const [k, url] of Object.entries(linkUrls)) {
    console.log(`    ${k.padEnd(12)} ${url}`);
  }
  console.log('\n  Price IDs:');
  for (const [k, id] of Object.entries(priceIds)) {
    console.log(`    ${k.padEnd(12)} ${id}`);
  }
  console.log('\n  ┌─ Próximos passos ──────────────────────────────┐');
  console.log('  │  1. Abra js/config.js e cole sua Public Key    │');
  console.log('  │  2. Cole os secrets da Edge Function:          │');
  console.log('  │     Supabase → Edge Functions → Secrets        │');
  console.log('  │     (veja scripts/.stripe-secrets.txt)         │');
  console.log('  │  3. node scripts/deploy-edge.js                │');
  console.log('  └────────────────────────────────────────────────┘\n');
  console.log('  ⚠️  scripts/.stripe-secrets.txt → já no .gitignore\n');
}

main().catch(err => {
  process.stdout.write('\n');
  console.error(`\n  ❌  ${err.message}\n`);
  process.exit(1);
});

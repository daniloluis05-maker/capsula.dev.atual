#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// scripts/stripe-setup.js
// Cria automaticamente todos os produtos, preços e webhook no
// Stripe e atualiza js/config.js com os IDs gerados.
//
// Uso:
//   node scripts/stripe-setup.js sk_test_SUA_CHAVE_AQUI
//   node scripts/stripe-setup.js sk_live_SUA_CHAVE_AQUI
// ─────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

// ── Validação do argumento ────────────────────────────────────
const SECRET_KEY = process.argv[2];
if (!SECRET_KEY || (!SECRET_KEY.startsWith('sk_test_') && !SECRET_KEY.startsWith('sk_live_'))) {
  console.error('\n❌  Chave inválida. Use:');
  console.error('    node scripts/stripe-setup.js sk_test_SUA_CHAVE\n');
  process.exit(1);
}

const IS_LIVE      = SECRET_KEY.startsWith('sk_live_');
const CONFIG_PATH  = path.join(__dirname, '..', 'js', 'config.js');
const SUPABASE_URL = 'https://dfnmofzbpdmnvlyowtmp.supabase.co';
const WEBHOOK_URL  = `${SUPABASE_URL}/functions/v1/stripe-webhook`;

// ── Produtos a criar ──────────────────────────────────────────
const PRODUCTS = [
  {
    key:         'STRIPE_PRICE_AVALIACAO',
    name:        'Avaliação Individual',
    description: '1 matriz à sua escolha + geração de PDF',
    amount:      2599,   // centavos → R$ 25,99
    type:        'one_time',
  },
  {
    key:         'STRIPE_PRICE_PACOTE3',
    name:        'Pacote Essencial — DISC + SOAR + Ikigai',
    description: '3 matrizes com PDF incluído',
    amount:      6990,   // R$ 69,90
    type:        'one_time',
  },
  {
    key:         'STRIPE_PRICE_DNA',
    name:        'DNA Estratégico',
    description: 'Análise com IA — requer 8 matrizes concluídas',
    amount:      3990,   // R$ 39,90
    type:        'one_time',
  },
  {
    key:         'STRIPE_PRICE_COMPLETO',
    name:        'Pacote Completo + DNA',
    description: 'Todas as 8 matrizes + DNA Estratégico',
    amount:      17990,  // R$ 179,90
    type:        'one_time',
  },
  {
    key:         'STRIPE_PRICE_PRO',
    name:        'Plano Profissional',
    description: 'PDFs e testes ilimitados + envio para terceiros',
    amount:      12990,  // R$ 129,90
    type:        'recurring',
    interval:    'month',
  },
];

// ── Helper: chamada à API do Stripe ──────────────────────────
async function stripe(method, endpoint, body = null) {
  const auth    = Buffer.from(`${SECRET_KEY}:`).toString('base64');
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type':  'application/x-www-form-urlencoded',
  };

  const options = { method, headers };
  if (body) options.body = new URLSearchParams(body).toString();

  const res  = await fetch(`https://api.stripe.com/v1${endpoint}`, options);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Stripe ${method} ${endpoint} → ${json.error?.message || res.status}`);
  }
  return json;
}

// ── Helper: barra de progresso simples ───────────────────────
let step = 0;
const total = PRODUCTS.length * 2 + 1; // produto + preço + webhook
function tick(label) {
  step++;
  const pct  = Math.round((step / total) * 100);
  const bar  = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
  process.stdout.write(`\r  [${bar}] ${pct}%  ${label.padEnd(50)}`);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n');
  console.log('  ┌──────────────────────────────────────────┐');
  console.log('  │   Sistema Gnosis — Stripe Setup          │');
  console.log(`  │   Modo: ${IS_LIVE ? '🔴 PRODUÇÃO           ' : '🟡 TESTE                 '}       │`);
  console.log('  └──────────────────────────────────────────┘\n');

  const results = {};

  // 1. Criar produtos e preços
  for (const p of PRODUCTS) {
    // Criar produto
    tick(`Criando produto: ${p.name}`);
    const product = await stripe('POST', '/products', {
      name:        p.name,
      description: p.description,
    });

    // Criar preço
    tick(`Criando preço: R$ ${(p.amount / 100).toFixed(2).replace('.', ',')}`);
    const priceBody = {
      product:    product.id,
      unit_amount: String(p.amount),
      currency:   'brl',
    };
    if (p.type === 'recurring') {
      priceBody['recurring[interval]'] = p.interval;
    }
    const price = await stripe('POST', '/prices', priceBody);

    results[p.key] = price.id;
  }

  // 2. Criar webhook endpoint
  tick('Configurando webhook...');
  const webhook = await stripe('POST', '/webhook_endpoints', {
    url: WEBHOOK_URL,
    'enabled_events[]': [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ],
    description: 'Sistema Gnosis — Edge Function',
  });

  results['STRIPE_WEBHOOK_SECRET'] = webhook.secret;

  process.stdout.write('\n\n');

  // 3. Ler config.js atual e injetar as novas chaves
  const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8');

  // Remove bloco stripe anterior se existir
  const cleaned = configRaw.replace(/\n\s*\/\/ ── Stripe[\s\S]*?(?=\n};)/, '');

  const stripeBlock = `
  // ── Stripe ───────────────────────────────────────────────
  // ⚠️  Chaves geradas automaticamente por scripts/stripe-setup.js
  // ⚠️  NUNCA exponha STRIPE_SECRET_KEY nem STRIPE_WEBHOOK_SECRET aqui
  //     Essas chaves ficam APENAS na Edge Function do Supabase
  STRIPE_PUBLIC_KEY:        '${IS_LIVE ? 'SUBSTITUA_PELA_pk_live_' : 'SUBSTITUA_PELA_pk_test_'}',
  STRIPE_PRICE_AVALIACAO:   '${results['STRIPE_PRICE_AVALIACAO']}',
  STRIPE_PRICE_PACOTE3:     '${results['STRIPE_PRICE_PACOTE3']}',
  STRIPE_PRICE_DNA:         '${results['STRIPE_PRICE_DNA']}',
  STRIPE_PRICE_COMPLETO:    '${results['STRIPE_PRICE_COMPLETO']}',
  STRIPE_PRICE_PRO:         '${results['STRIPE_PRICE_PRO']}',`;

  const updated = cleaned.replace(/\n};/, stripeBlock + '\n};');
  fs.writeFileSync(CONFIG_PATH, updated, 'utf8');

  // 4. Salvar chaves secretas separadamente (nunca vão para o frontend)
  const secretsPath = path.join(__dirname, '..', 'scripts', '.stripe-secrets.txt');
  const secretsContent = [
    '# ⚠️  SEGREDO — nunca commite este arquivo',
    '# Configure estas variáveis na Edge Function do Supabase',
    '#',
    `STRIPE_SECRET_KEY=${SECRET_KEY}`,
    `STRIPE_WEBHOOK_SECRET=${results['STRIPE_WEBHOOK_SECRET']}`,
    '',
    '# Price IDs (referência)',
    ...Object.entries(results).filter(([k]) => k.startsWith('STRIPE_PRICE')).map(([k, v]) => `${k}=${v}`),
  ].join('\n');
  fs.writeFileSync(secretsPath, secretsContent, 'utf8');

  // Garantir que .stripe-secrets.txt está no .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  if (!gitignoreContent.includes('.stripe-secrets.txt')) {
    fs.appendFileSync(gitignorePath, '\n# Stripe secrets\nscripts/.stripe-secrets.txt\n');
  }

  // 5. Resumo final
  console.log('  ✅  Tudo configurado!\n');
  console.log('  ┌─ Price IDs criados ──────────────────────┐');
  console.log(`  │  Avaliação Individual   ${results['STRIPE_PRICE_AVALIACAO']}`);
  console.log(`  │  Pacote 3 Matrizes      ${results['STRIPE_PRICE_PACOTE3']}`);
  console.log(`  │  DNA Estratégico        ${results['STRIPE_PRICE_DNA']}`);
  console.log(`  │  Pacote Completo        ${results['STRIPE_PRICE_COMPLETO']}`);
  console.log(`  │  Plano Profissional     ${results['STRIPE_PRICE_PRO']}`);
  console.log('  └──────────────────────────────────────────┘\n');

  console.log('  ┌─ Próximos passos ────────────────────────┐');
  console.log('  │                                          │');
  console.log('  │  1. Abra js/config.js e substitua       │');
  console.log(`  │     STRIPE_PUBLIC_KEY pela sua           │`);
  console.log(`  │     ${IS_LIVE ? 'pk_live_...' : 'pk_test_...'}                         │`);
  console.log('  │                                          │');
  console.log('  │  2. Configure as variáveis secretas na  │');
  console.log('  │     Edge Function do Supabase:           │');
  console.log('  │     (veja scripts/.stripe-secrets.txt)  │');
  console.log('  │                                          │');
  console.log('  │  3. Rode: node scripts/deploy-edge.js   │');
  console.log('  │     para deployar a Edge Function       │');
  console.log('  │                                          │');
  console.log('  └──────────────────────────────────────────┘\n');

  console.log('  ⚠️   scripts/.stripe-secrets.txt contém chaves secretas');
  console.log('       Já foi adicionado ao .gitignore automaticamente.\n');
}

main().catch(err => {
  process.stdout.write('\n');
  console.error(`\n  ❌  Erro: ${err.message}\n`);
  process.exit(1);
});

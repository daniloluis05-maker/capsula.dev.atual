#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// scripts/deploy-edge.js
// Deploya a Edge Function stripe-webhook no Supabase e configura
// as variáveis de ambiente secretas automaticamente.
//
// Pré-requisito: Supabase CLI instalado
//   npm install -g supabase
//
// Uso:
//   node scripts/deploy-edge.js
// ─────────────────────────────────────────────────────────────

const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const SECRETS_FILE  = path.join(__dirname, '.stripe-secrets.txt');
const PROJECT_REF   = 'dfnmofzbpdmnvlyowtmp'; // ID do projeto Supabase
const FUNCTION_NAME = 'stripe-webhook';

// ── Verifica pré-requisitos ───────────────────────────────────
function checkCLI() {
  const r = spawnSync('supabase', ['--version'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    console.error('\n❌  Supabase CLI não encontrado.');
    console.error('    Instale com: npm install -g supabase');
    console.error('    Depois: supabase login\n');
    process.exit(1);
  }
  console.log('  ✓ Supabase CLI:', r.stdout.trim());
}

function readSecrets() {
  if (!fs.existsSync(SECRETS_FILE)) {
    console.error('\n❌  Arquivo de secrets não encontrado.');
    console.error('    Execute primeiro: node scripts/stripe-setup.js sk_test_...\n');
    process.exit(1);
  }
  const lines   = fs.readFileSync(SECRETS_FILE, 'utf8').split('\n');
  const secrets = {};
  for (const line of lines) {
    if (line.startsWith('#') || !line.includes('=')) continue;
    const [k, ...rest] = line.split('=');
    secrets[k.trim()] = rest.join('=').trim();
  }
  return secrets;
}

function run(cmd, opts = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', ...opts });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('\n');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │   Sistema Gnosis — Deploy Edge Function      │');
  console.log('  └──────────────────────────────────────────────┘\n');

  checkCLI();

  const secrets = readSecrets();
  console.log('  ✓ Secrets carregados\n');

  // 1. Setar secrets no Supabase
  console.log('  Configurando secrets na Edge Function...');
  const secretPairs = [
    `STRIPE_SECRET_KEY=${secrets.STRIPE_SECRET_KEY}`,
    `STRIPE_WEBHOOK_SECRET=${secrets.STRIPE_WEBHOOK_SECRET}`,
    ...Object.entries(secrets)
      .filter(([k]) => k.startsWith('STRIPE_PRICE_'))
      .map(([k, v]) => `${k}=${v}`),
  ];

  const secretArgs = secretPairs.map(s => `--secret ${s}`).join(' ');
  const setCmd = `supabase secrets set ${secretArgs} --project-ref ${PROJECT_REF}`;
  console.log('  Aplicando secrets...');
  if (!run(setCmd)) {
    console.error('\n  ❌  Falha ao setar secrets. Verifique se está logado:');
    console.error('      supabase login\n');
    process.exit(1);
  }
  console.log('  ✓ Secrets configurados\n');

  // 2. Deploy da Edge Function
  console.log('  Deployando Edge Function...');
  const deployCmd = `supabase functions deploy ${FUNCTION_NAME} --project-ref ${PROJECT_REF} --no-verify-jwt`;
  if (!run(deployCmd)) {
    console.error('\n  ❌  Falha no deploy. Verifique os logs acima.\n');
    process.exit(1);
  }

  console.log('\n  ✅  Deploy concluído!\n');
  console.log(`  URL da função: https://${PROJECT_REF}.supabase.co/functions/v1/${FUNCTION_NAME}`);
  console.log('\n  ⚠️  Confirme que o webhook no Stripe aponta para esta URL:');
  console.log(`  Stripe → Developers → Webhooks → ${PROJECT_REF}...\n`);
}

main().catch(err => {
  console.error('\n  ❌ ', err.message, '\n');
  process.exit(1);
});

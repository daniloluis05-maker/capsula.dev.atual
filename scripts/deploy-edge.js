#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// scripts/deploy-edge.js
// Deploya as Edge Functions do Mercado Pago no Supabase e
// configura os secrets automaticamente.
//
// Pré-requisito: Supabase CLI instalado
//   npm install -g supabase
//   supabase login
//
// Uso:
//   node scripts/deploy-edge.js
// ─────────────────────────────────────────────────────────────

const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const SECRETS_FILE  = path.join(__dirname, '.mp-secrets.txt');
const PROJECT_REF   = 'dfnmofzbpdmnvlyowtmp';
const FUNCTIONS     = ['create-mp-preference', 'mp-webhook'];

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
    console.error('\n❌  scripts/.mp-secrets.txt não encontrado.');
    console.error('    Execute primeiro: node scripts/mercadopago-setup.js PUBLIC_KEY ACCESS_TOKEN\n');
    process.exit(1);
  }
  const lines   = fs.readFileSync(SECRETS_FILE, 'utf8').split('\n');
  const secrets = {};
  for (const line of lines) {
    if (line.startsWith('#') || !line.includes('=')) continue;
    const [k, ...rest] = line.split('=');
    const v = rest.join('=').trim();
    if (v) secrets[k.trim()] = v;
  }
  return secrets;
}

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('\n');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │   Sistema Gnosis — Deploy Edge Functions     │');
  console.log('  └──────────────────────────────────────────────┘\n');

  checkCLI();

  const secrets = readSecrets();

  if (!secrets.MP_ACCESS_TOKEN) {
    console.error('\n❌  MP_ACCESS_TOKEN não encontrado em .mp-secrets.txt');
    process.exit(1);
  }

  console.log('\n  Configurando secrets no Supabase...');
  const pairs = [
    `MP_ACCESS_TOKEN=${secrets.MP_ACCESS_TOKEN}`,
    `MP_PUBLIC_KEY=${secrets.MP_PUBLIC_KEY || ''}`,
    `SITE_URL=${secrets.SITE_URL || 'https://sistemagnosis.com.br'}`,
  ];
  if (secrets.MP_WEBHOOK_SECRET) {
    pairs.push(`MP_WEBHOOK_SECRET=${secrets.MP_WEBHOOK_SECRET}`);
  }

  const setCmd = `supabase secrets set ${pairs.map(p => `"${p}"`).join(' ')} --project-ref ${PROJECT_REF}`;
  if (!run(setCmd)) {
    console.error('\n  ❌  Falha ao setar secrets. Verifique:\n      supabase login\n');
    process.exit(1);
  }
  console.log('  ✓ Secrets configurados\n');

  // Deploya cada função
  for (const fn of FUNCTIONS) {
    const fnPath = path.join(__dirname, '..', 'supabase', 'functions', fn);
    if (!fs.existsSync(fnPath)) {
      console.warn(`  ⚠️  Função não encontrada: ${fn} — pulando`);
      continue;
    }
    console.log(`  Deployando ${fn}...`);
    const cmd = `supabase functions deploy ${fn} --project-ref ${PROJECT_REF} --no-verify-jwt`;
    if (!run(cmd)) {
      console.error(`  ❌  Falha no deploy de ${fn}\n`);
      process.exit(1);
    }
    console.log(`  ✓ ${fn} deployado`);
  }

  const BASE_URL = `https://${PROJECT_REF}.supabase.co/functions/v1`;
  console.log('\n  ✅  Deploy concluído!\n');
  console.log('  URLs das funções:');
  for (const fn of FUNCTIONS) {
    console.log(`    ${fn.padEnd(25)} ${BASE_URL}/${fn}`);
  }

  console.log('\n  ┌─ Configure o Webhook no MP ────────────────────┐');
  console.log('  │  MP → Developers → Webhooks → Adicionar        │');
  console.log(`  │  URL: ${BASE_URL}/mp-webhook`.padEnd(52) + '│');
  console.log('  │  Eventos: Pagamentos                           │');
  console.log('  │  Copie o "Webhook Secret" gerado e adicione    │');
  console.log('  │  como MP_WEBHOOK_SECRET= em .mp-secrets.txt    │');
  console.log('  │  depois rode este script novamente.            │');
  console.log('  └────────────────────────────────────────────────┘\n');
}

main().catch(err => {
  console.error('\n  ❌ ', err.message, '\n');
  process.exit(1);
});

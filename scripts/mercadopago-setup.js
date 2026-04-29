#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// scripts/mercadopago-setup.js
// Valida as credenciais do Mercado Pago e atualiza js/config.js.
// O Access Token fica APENAS em scripts/.mp-secrets.txt (gitignore).
//
// Uso:
//   node scripts/mercadopago-setup.js PUBLIC_KEY ACCESS_TOKEN
//   Exemplo:
//   node scripts/mercadopago-setup.js APP_USR-0c9... APP_USR-76316...
// ─────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const [,, PUBLIC_KEY, ACCESS_TOKEN] = process.argv;

if (!PUBLIC_KEY || !ACCESS_TOKEN) {
  console.error('\n❌  Uso: node scripts/mercadopago-setup.js PUBLIC_KEY ACCESS_TOKEN');
  console.error('    MP → Developers → Credenciais → Ver dados da credencial\n');
  process.exit(1);
}

if (!PUBLIC_KEY.startsWith('APP_USR-') && !PUBLIC_KEY.startsWith('TEST-')) {
  console.error('\n❌  Public Key inválida (deve começar com APP_USR- ou TEST-).\n');
  process.exit(1);
}

if (!ACCESS_TOKEN.startsWith('APP_USR-') && !ACCESS_TOKEN.startsWith('TEST-')) {
  console.error('\n❌  Access Token inválido (deve começar com APP_USR- ou TEST-).\n');
  process.exit(1);
}

const IS_PROD = PUBLIC_KEY.startsWith('APP_USR-');

async function validateToken() {
  const res  = await fetch('https://api.mercadopago.com/users/me', {
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status} — Access Token inválido?`);
  }
  return data; // { id, nickname, email, site_id, ... }
}

async function main() {
  console.log('\n');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │   Sistema Gnosis — Mercado Pago Setup        │');
  console.log(`  │   Modo: ${IS_PROD ? '🔴 PRODUÇÃO               ' : '🟡 TESTE                   '}       │`);
  console.log('  └──────────────────────────────────────────────┘\n');

  process.stdout.write('  Validando credenciais...');
  let user;
  try {
    user = await validateToken();
  } catch (e) {
    process.stdout.write(' ❌\n');
    throw e;
  }
  process.stdout.write(` ✓ (${user.email || user.nickname})\n`);

  // Atualiza js/config.js
  const configPath = path.join(__dirname, '..', 'js', 'config.js');
  let config = fs.readFileSync(configPath, 'utf8');

  // Substitui a linha MP_PUBLIC_KEY se já existir
  if (config.includes('MP_PUBLIC_KEY')) {
    config = config.replace(/MP_PUBLIC_KEY:\s*'[^']*'/, `MP_PUBLIC_KEY: '${PUBLIC_KEY}'`);
  } else {
    // Insere antes do fechamento do objeto
    config = config.replace(/\n};/, `\n  // ── Mercado Pago ─────────────────────────────────────────────\n  MP_PUBLIC_KEY: '${PUBLIC_KEY}',\n};`);
  }

  fs.writeFileSync(configPath, config, 'utf8');
  console.log('  ✓ js/config.js atualizado com MP_PUBLIC_KEY\n');

  // Salva secrets
  const secretsPath = path.join(__dirname, '.mp-secrets.txt');
  fs.writeFileSync(secretsPath, [
    '# ⚠️  SEGREDO — nunca commite este arquivo',
    '# Cole essas variáveis em: Supabase → Edge Functions → Secrets',
    '#',
    `MP_ACCESS_TOKEN=${ACCESS_TOKEN}`,
    `MP_PUBLIC_KEY=${PUBLIC_KEY}`,
    'MP_WEBHOOK_SECRET=',
    '#',
    '# SITE_URL (use a URL de produção quando for ao ar):',
    IS_PROD
      ? 'SITE_URL=https://capsula-dev-atualizado.vercel.app'
      : 'SITE_URL=http://localhost:3000',
    '#',
    '# Como aplicar (depois de instalar a Supabase CLI):',
    '#   node scripts/deploy-edge.js',
  ].join('\n'), 'utf8');
  console.log('  ✓ scripts/.mp-secrets.txt salvo\n');

  // Garante .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  const gi = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  if (!gi.includes('.mp-secrets.txt')) {
    fs.appendFileSync(gitignorePath, '\nscripts/.mp-secrets.txt\n');
    console.log('  ✓ .mp-secrets.txt adicionado ao .gitignore\n');
  }

  console.log('  ✅  Setup concluído!\n');
  console.log('  ┌─ Próximos passos ──────────────────────────────┐');
  console.log('  │  1. node scripts/deploy-edge.js               │');
  console.log('  │     → deploya create-mp-preference e          │');
  console.log('  │       mp-webhook no Supabase                   │');
  console.log('  │  2. MP → Developers → Webhooks → adicione:     │');
  console.log(`  │     https://dfnmofzbpdmnvlyowtmp.supabase.co  │`);
  console.log(`  │     /functions/v1/mp-webhook                   │`);
  console.log('  │  3. Copie o Webhook Secret e adicione ao       │');
  console.log('  │     .mp-secrets.txt como MP_WEBHOOK_SECRET=... │');
  console.log('  │  4. node scripts/deploy-edge.js (novamente)    │');
  console.log('  └────────────────────────────────────────────────┘\n');
}

main().catch(err => {
  console.error(`\n  ❌  ${err.message}\n`);
  process.exit(1);
});

#!/usr/bin/env node
'use strict';
/*
 * scripts/build-includes.js
 * ---------------------------------------------------------------------------
 * Fonte única de verdade para blocos repetidos do <head> das páginas estáticas.
 * Lê partials/<name>.html e injeta o conteúdo entre marcadores de comentário:
 *
 *     <!-- @include name -->  ...conteúdo gerado a partir do partial...  <!-- @endinclude name -->
 *
 * Idempotente: rodar de novo produz output idêntico.
 * Na primeira passada (página ainda sem marcadores) o detector localiza o bloco
 * antigo e o envolve automaticamente — mas SÓ se casar exatamente 1 vez (senão
 * avisa e pula, pra nunca mutilar uma página).
 *
 *   node scripts/build-includes.js           escreve as páginas
 *   node scripts/build-includes.js --check    não escreve; sai !=0 se algo mudaria
 * ---------------------------------------------------------------------------
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PARTIALS = path.join(ROOT, 'partials');

// Qual bloco vai em quais páginas + detector p/ migração inicial (sem marcadores).
// Listas derivadas da auditoria real (composição idêntica byte-a-byte por grupo).
const MANIFEST = [
  {
    name: 'theme-init',
    files: ['404', '5w2h', 'ancoras', 'auth-callback', 'bigfive', 'convite', 'dashboard',
      'disc', 'disc-share', 'dna', 'eneagrama', 'equipe', 'gnosis-identity', 'ikigai',
      'johari', 'okrs', 'pagamento-sucesso', 'pearson', 'privacidade', 'raci',
      'reset-password', 'soar', 'sobre', 'swot', 'swot-equipe', 'tci', 'termos',
      'tutorial', 'wizard'],
    detect: /<script>\s*(?:\/\/[^\n]*\s*)?\(function \(\) \{\s*try \{\s*var saved = localStorage\.getItem\('gnosis_theme'\)[\s\S]*?<\/script>/,
  },
  {
    name: 'csp-app',
    files: ['5w2h', 'ancoras', 'bigfive', 'dashboard', 'disc', 'dna', 'eneagrama', 'equipe',
      'ikigai', 'johari', 'okrs', 'pearson', 'raci', 'soar', 'swot-equipe', 'tci',
      'tutorial', 'wizard'],
    detect: /<meta http-equiv="Content-Security-Policy"[^>]*>/,
  },
  {
    name: 'head-scripts',
    files: ['ancoras', 'bigfive', 'disc', 'eneagrama', 'ikigai', 'johari', 'pearson', 'soar', 'tci'],
    detect: /(?:<!-- Supabase[^\n]*\n\s*)?<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[\s\S]*?<script src="js\/ui\.js"[^>]*><\/script>/,
  },
];

function loadPartial(name, eol) {
  const raw = fs.readFileSync(path.join(PARTIALS, name + '.html'), 'utf8');
  return raw.replace(/\r?\n/g, eol).replace(/\s+$/, '');
}

function applyBlock(content, name, detect) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const partial = loadPartial(name, eol);
  const block = `<!-- @include ${name} -->${eol}${partial}${eol}<!-- @endinclude ${name} -->`;
  const markerRe = new RegExp(`<!-- @include ${name} -->[\\s\\S]*?<!-- @endinclude ${name} -->`);

  if (markerRe.test(content)) {
    return { content: content.replace(markerRe, () => block), status: 'maintained' };
  }
  // Migração inicial: exige exatamente 1 ocorrência do bloco antigo.
  const all = content.match(new RegExp(detect.source, 'g'));
  if (!all) return { content, status: 'no-match' };
  if (all.length > 1) return { content, status: 'ambiguous' };
  return { content: content.replace(detect, () => block), status: 'migrated' };
}

const check = process.argv.includes('--check');
let changed = 0;
let problems = 0;

for (const blk of MANIFEST) {
  for (const f of blk.files) {
    const file = path.join(ROOT, f + '.html');
    if (!fs.existsSync(file)) { console.error('FALTA  ', f + '.html'); problems++; continue; }
    const before = fs.readFileSync(file, 'utf8');
    const { content, status } = applyBlock(before, blk.name, blk.detect);
    if (status === 'no-match' || status === 'ambiguous') {
      console.error(`AVISO [${blk.name}] ${f}.html: ${status} (pulado)`);
      problems++;
      continue;
    }
    if (content !== before) {
      changed++;
      if (check) console.error(`MUDARIA [${blk.name}] ${f}.html`);
      else { fs.writeFileSync(file, content); console.log(`ok [${blk.name}] ${f}.html (${status})`); }
    }
  }
}

if (problems) { console.error(`\n${problems} problema(s) — verifique os AVISOS acima.`); process.exit(2); }
if (check && changed) { console.error(`\n${changed} arquivo(s) fora de sincronia com partials/. Rode: npm run build:includes`); process.exit(1); }
console.log(check ? '\ntudo em sincronia com partials/' : `\nconcluído: ${changed} mudança(s) aplicada(s)`);

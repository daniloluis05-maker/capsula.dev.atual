const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const matrizes = [
  { key: 'disc',    nome: 'DISC',                sub: 'Perfil Comportamental',       cor: '#7c6af7' },
  { key: 'soar',   nome: 'SOAR',                sub: 'Análise Estratégica Pessoal',  cor: '#2EC4A0' },
  { key: 'ikigai', nome: 'Ikigai',              sub: 'Propósito de Vida e Carreira', cor: '#f5a623' },
  { key: 'ancoras',nome: 'Âncoras de Carreira', sub: 'Motivadores Profissionais',    cor: '#4a9eff' },
  { key: 'johari', nome: 'Janela de Johari',    sub: 'Autoconhecimento e Feedback',  cor: '#e879a0' },
  { key: 'bigfive',nome: 'Big Five',            sub: 'Os Cinco Grandes Traços',      cor: '#5b9bf7' },
  { key: 'pearson',nome: 'Pearson-Marr',        sub: 'Estilos de Pensamento',        cor: '#00bcd4' },
  { key: 'tci',    nome: 'TCI',                 sub: 'Temperamento e Caráter',       cor: '#c9a800' },
];

const OUTPUT_DIR = path.join(__dirname, '..');

function buildHtml(m) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1200px; height:630px; overflow:hidden; }
.card {
  width:1200px; height:630px;
  background:#0b0b14;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  position:relative; overflow:hidden;
  font-family:'Outfit',sans-serif;
}
.dots {
  position:absolute; inset:0;
  background-image:radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px);
  background-size:30px 30px;
}
.glow {
  position:absolute; top:50%; left:50%;
  transform:translate(-50%,-50%);
  width:640px; height:640px; border-radius:50%;
  background:${m.cor};
  opacity:0.16; filter:blur(90px);
}
.line {
  position:absolute; left:0; right:0; height:1px;
  background:rgba(255,255,255,0.045);
}
.brand {
  position:absolute; top:2.2rem; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:0.45rem;
  font-size:0.82rem; color:rgba(255,255,255,0.35);
  z-index:10; white-space:nowrap; letter-spacing:0.02em;
}
.brand-dot {
  width:7px; height:7px; border-radius:50%;
  border:1.5px solid rgba(255,255,255,0.3); flex-shrink:0;
}
.content {
  position:relative; z-index:10;
  text-align:center; display:flex;
  flex-direction:column; align-items:center;
}
.nome {
  font-size:6rem; font-weight:800;
  line-height:1; letter-spacing:-0.03em;
  color:${m.cor}; margin-bottom:1.1rem;
}
.divider {
  width:48px; height:2px; border-radius:2px;
  background:${m.cor}; opacity:0.5; margin-bottom:1.1rem;
}
.sub {
  font-size:1.65rem; font-weight:400;
  color:rgba(255,255,255,0.75); letter-spacing:0.01em;
}
.domain {
  position:absolute; bottom:1.6rem; left:50%; transform:translateX(-50%);
  font-size:0.72rem; color:rgba(255,255,255,0.18);
  letter-spacing:0.1em; font-family:monospace; z-index:10; white-space:nowrap;
}
</style>
</head>
<body>
<div class="card">
  <div class="dots"></div>
  <div class="glow"></div>
  <div class="line" style="top:28%;"></div>
  <div class="line" style="top:72%;"></div>
  <div class="brand"><div class="brand-dot"></div>Sistema Gnosis</div>
  <div class="content">
    <div class="nome">${m.nome}</div>
    <div class="divider"></div>
    <div class="sub">${m.sub}</div>
  </div>
  <div class="domain">capsula-dev-atualizado.vercel.app</div>
</div>
</body>
</html>`;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  // carrega fonte uma vez
  await page.setContent(buildHtml(matrizes[0]), { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);

  for (const m of matrizes) {
    process.stdout.write(`Gerando og-${m.key}.png... `);
    await page.setContent(buildHtml(m), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    const outPath = path.join(OUTPUT_DIR, `og-${m.key}.png`);
    await page.screenshot({ path: outPath, type: 'png', clip: { x:0, y:0, width:1200, height:630 } });
    console.log('OK');
  }

  await browser.close();
  console.log('\nTodas as imagens geradas com sucesso.');
})();

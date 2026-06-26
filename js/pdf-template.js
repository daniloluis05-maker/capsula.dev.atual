// ─────────────────────────────────────────────────────────────
// capsula.dev · js/pdf-template.js
//
// Helper único que monta o HTML dos PDFs de todas as matrizes.
// Substitui ~550 linhas de CSS+HTML duplicado em cada *-app.js.
//
// Visual: "Tech Refinado" (Proposta B aprovada 2026-06-26):
//   - Inter (corpo) + IBM Plex Mono (acentos)
//   - Sem bordas pretas; cards com border-left accent
//   - Hero com letra/ícone grande
//   - Distribuição em cards iguais (dominante destacado)
//   - Blocos de análise em grid 2×N
//   - Footer com citação acadêmica
//
// Uso:
//   Gnosis.pdf.render({
//     matrizName, matrizSubname, userName, date, accent,
//     hero: { letter, eyebrow, title, subtitle },
//     dimensions: [{ letter, name, pct, isDominant? }],
//     dimensionsLabel,
//     analysisBlocks: [{ eyebrow, title, text }],
//     analysisLabel,
//     customSection,  // HTML cru opcional (radar, tensão, etc)
//     citation,
//     filename,
//   });
//
// Cada matriz só passa dados — sem CSS, sem HTML cru de layout.
// ─────────────────────────────────────────────────────────────

window.Gnosis = window.Gnosis || {};

(function () {
  'use strict';

  const DEFAULT_ACCENT = '#7C6FF7';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function brandSvg(accent) {
    return '<svg viewBox="0 0 100 100" fill="none" width="28" height="28">'
      + '<path d="M 50 22 A 28 28 0 1 0 78 50" stroke="' + accent + '" stroke-width="9" stroke-linecap="round"/>'
      + '<rect x="58" y="46" width="20" height="8" rx="1" fill="' + accent + '"/></svg>';
  }

  function renderCss(accent) {
    return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',sans-serif;background:#fff;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.page{width:794px;min-height:1123px;background:#fafafa;margin:0 auto;padding:48px 56px;display:flex;flex-direction:column;}

/* Header */
.pdf-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:18px;border-bottom:1px solid #d4d4d8;margin-bottom:32px;}
.brand{display:flex;align-items:center;gap:9px;}
.brand-name{font-size:15px;font-weight:800;letter-spacing:-0.02em;color:#18181b;}
.brand-name em{color:${accent};font-style:italic;font-weight:500;}
.hd-meta{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#71717a;text-align:right;line-height:1.7;letter-spacing:0.02em;}
.hd-meta strong{color:#18181b;font-weight:600;}

/* Hero */
.hero{display:flex;align-items:flex-start;gap:24px;padding:24px 0 28px;}
.hero-letter{
  width:88px;height:88px;
  border:2px solid ${accent};border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
  font-size:48px;font-weight:900;color:${accent};letter-spacing:-0.04em;
  background:linear-gradient(135deg, ${accent}14 0%, ${accent}05 100%);
}
.hero-info{flex:1;padding-top:6px;min-width:0;}
.hero-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;color:${accent};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;}
.hero-title{font-size:32px;font-weight:800;color:#18181b;letter-spacing:-0.025em;line-height:1.1;margin-bottom:6px;}
.hero-subtitle{font-size:14px;color:#52525b;line-height:1.5;max-width:520px;}

/* Section divider */
.divider{display:flex;align-items:center;gap:14px;margin:32px 0 18px;}
.divider-line{flex:1;height:1px;background:#d4d4d8;}
.divider-label{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;font-weight:500;}

/* Dimension cards */
.dims-grid{display:grid;gap:12px;}
.dim-card{
  background:#fff;border:1px solid #e4e4e7;border-radius:8px;
  padding:18px 16px;text-align:center;
}
.dim-card.is-dom{
  border-color:${accent};
  box-shadow:0 0 0 1px ${accent}, 0 4px 16px ${accent}14;
}
.dim-card .dim-letter{
  font-size:24px;font-weight:900;color:#71717a;
  letter-spacing:-0.04em;margin-bottom:4px;
}
.dim-card.is-dom .dim-letter{color:${accent};}
.dim-card .dim-name{
  font-family:'IBM Plex Mono',monospace;
  font-size:9px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;
  color:#71717a;margin-bottom:14px;
  min-height:11px;
}
.dim-card .dim-pct{
  font-size:28px;font-weight:300;color:#18181b;
  margin-bottom:10px;
}
.dim-card.is-dom .dim-pct{color:${accent};font-weight:600;}
.dim-card .dim-pct sub{font-size:14px;color:#a1a1aa;font-weight:400;vertical-align:baseline;margin-left:1px;}
.dim-card .dim-bar{height:4px;background:#f4f4f5;border-radius:2px;overflow:hidden;}
.dim-card .dim-bar-fill{height:100%;background:#a1a1aa;border-radius:2px;}
.dim-card.is-dom .dim-bar-fill{background:${accent};}

/* Analysis blocks */
.analysis-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:6px;}
.analysis-card{
  background:#fff;border:1px solid #e4e4e7;border-radius:8px;
  padding:20px 22px;
  border-left:3px solid ${accent};
}
.analysis-card .card-eyebrow{
  font-family:'IBM Plex Mono',monospace;
  font-size:10px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;
  color:${accent};margin-bottom:8px;
}
.analysis-card .card-title{
  font-size:16px;font-weight:700;letter-spacing:-0.015em;color:#18181b;
  margin-bottom:10px;
}
.analysis-card .card-text{
  font-size:13px;line-height:1.65;color:#3f3f46;
}

/* Custom section wrapper (radar, tensão, etc) */
.custom-section{margin-top:18px;background:#fff;border:1px solid #e4e4e7;border-radius:8px;padding:24px;}

/* Footer */
.pdf-footer{
  margin-top:auto;padding-top:18px;border-top:1px solid #d4d4d8;
  display:flex;justify-content:space-between;align-items:center;gap:16px;
  font-family:'IBM Plex Mono',monospace;font-size:9px;color:#71717a;
}
.pdf-footer .ft-cite{color:#52525b;font-weight:500;font-style:normal;}

@media print{
  @page{margin:0;size:A4;}
  body{background:#fff;}
  .page{margin:0;background:#fff;}
}
`;
  }

  function renderHero(hero, accent) {
    if (!hero) return '';
    const letter = hero.letter || '';
    const eyebrow = esc(hero.eyebrow || '');
    const title = esc(hero.title || '');
    const subtitle = esc(hero.subtitle || '');
    return [
      '<div class="hero">',
      '<div class="hero-letter">' + esc(letter) + '</div>',
      '<div class="hero-info">',
      eyebrow ? '<div class="hero-eyebrow">// ' + eyebrow + '</div>' : '',
      title ? '<h1 class="hero-title">' + title + '</h1>' : '',
      subtitle ? '<p class="hero-subtitle">' + subtitle + '</p>' : '',
      '</div></div>',
    ].join('');
  }

  function renderDimensions(dimensions, label) {
    if (!dimensions || !dimensions.length) return '';
    const cols = dimensions.length <= 4 ? dimensions.length : (dimensions.length <= 6 ? 3 : 4);
    const cards = dimensions.map(d => {
      const cls = d.isDominant ? 'dim-card is-dom' : 'dim-card';
      return [
        '<div class="' + cls + '">',
        '<div class="dim-letter">' + esc(d.letter || '') + '</div>',
        '<div class="dim-name">' + esc(d.name || '') + '</div>',
        '<div class="dim-pct">' + (d.pct || 0) + '<sub>%</sub></div>',
        '<div class="dim-bar"><div class="dim-bar-fill" style="width:' + (d.pct || 0) + '%"></div></div>',
        '</div>',
      ].join('');
    }).join('');
    return [
      label ? '<div class="divider"><span class="divider-label">' + esc(label) + '</span><div class="divider-line"></div></div>' : '',
      '<div class="dims-grid" style="grid-template-columns:repeat(' + cols + ',1fr);">' + cards + '</div>',
    ].join('');
  }

  function renderAnalysisBlocks(blocks, label) {
    if (!blocks || !blocks.length) return '';
    const cards = blocks.map(b => [
      '<div class="analysis-card">',
      b.eyebrow ? '<div class="card-eyebrow">' + esc(b.eyebrow) + '</div>' : '',
      b.title ? '<div class="card-title">' + esc(b.title) + '</div>' : '',
      b.text ? '<p class="card-text">' + esc(b.text) + '</p>' : '',
      '</div>',
    ].join('')).join('');
    return [
      label ? '<div class="divider"><span class="divider-label">' + esc(label) + '</span><div class="divider-line"></div></div>' : '',
      '<div class="analysis-grid">' + cards + '</div>',
    ].join('');
  }

  Gnosis.pdf = Gnosis.pdf || {};

  Gnosis.pdf.render = function (opts) {
    opts = opts || {};
    const accent = opts.accent || DEFAULT_ACCENT;
    const css = renderCss(accent);
    const fonts = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">';

    const html = [
      '<!DOCTYPE html><html lang="pt-BR"><head>',
      '<meta charset="UTF-8">',
      '<title>' + esc(opts.matrizName || 'Relatório') + ' — ' + esc(opts.userName || '') + ' · Sistema Gnosis</title>',
      fonts,
      '<style>' + css + '</style>',
      '</head><body><div class="page">',
      // Header
      '<div class="pdf-header">',
      '<div class="brand">' + brandSvg(accent) + '<span class="brand-name">SISTEMA <em>Gnosis</em></span></div>',
      '<div class="hd-meta">',
      '<strong>' + esc(opts.matrizName || '') + (opts.matrizSubname ? ' · ' + esc(opts.matrizSubname) : '') + '</strong><br>',
      esc(opts.userName || '') + '<br>',
      esc(opts.date || ''),
      '</div></div>',
      // Hero
      renderHero(opts.hero, accent),
      // Dimensions
      renderDimensions(opts.dimensions, opts.dimensionsLabel),
      // Analysis
      renderAnalysisBlocks(opts.analysisBlocks, opts.analysisLabel),
      // Custom section (HTML cru — escapamento é responsabilidade de quem chama)
      opts.customSection ? '<div class="custom-section">' + opts.customSection + '</div>' : '',
      // Footer
      '<div class="pdf-footer">',
      '<span class="ft-cite">' + (opts.citation || '') + '</span>',
      '<span>Sistema Gnosis · sistema-gnosis.com.br · Confidencial</span>',
      '</div>',
      '</div>',
      '<script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>',
      '</body></html>',
    ].join('');

    Gnosis.pdf.printOrDownload(html, opts.filename || 'relatorio.html');
  };
})();

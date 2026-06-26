// ─────────────────────────────────────────────────────────────
// js/pdf-helper.js — Sistema Gnosis · helper compartilhado
// Imprime um HTML via iframe (window.print), com fallback de
// download .html caso o browser bloqueie o print programático
// (comum em iOS Safari e em alguns Android).
//
// Uso: Gnosis.pdf.printOrDownload(htmlString, 'arquivo.html')
//
// Carregue ANTES dos *-app.js de cada matriz:
//   <script src="js/pdf-helper.js"></script>
//   <script src="js/disc-app.js"></script>
// ─────────────────────────────────────────────────────────────

window.Gnosis = window.Gnosis || {};

// Detecta device de baixa memória (Android entry-level típico = 2-3 GB).
// PDFs grandes com gráficos podem crashar a aba silenciosamente — perda de
// receita pra quem está prestes a pagar pelo relatório.
function _gnIsLowMemDevice() {
  try {
    // navigator.deviceMemory: Chrome/Edge (>= 64), Samsung Internet, Opera
    // Não disponível em Safari/Firefox — nesses, prossegue sem avisar
    if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4) {
      // E é mobile? (PDF em desktop com pouca RAM ainda funciona melhor)
      return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');
    }
  } catch (_) {}
  return false;
}

function _gnConfirmLowMemPdf() {
  return new Promise(function (resolve) {
    var dlg = document.createElement('div');
    dlg.id = '_gn-pdf-warn';
    dlg.innerHTML = [
      '<div class="_gn-pdf-card">',
      '<div class="_gn-pdf-icon">⚠️</div>',
      '<h3>Seu celular pode ter dificuldade</h3>',
      '<p>Detectamos que este dispositivo tem pouca memória disponível. ',
      'Relatórios grandes podem travar o navegador.</p>',
      '<p style="margin-top:0.5rem;"><strong>Recomendamos baixar no computador</strong> ',
      'para ter o PDF completo sem perda.</p>',
      '<div class="_gn-pdf-actions">',
      '<button type="button" id="_gn-pdf-cancel">Cancelar</button>',
      '<button type="button" id="_gn-pdf-go">Tentar mesmo assim</button>',
      '</div></div>',
    ].join('');
    document.body.appendChild(dlg);
    dlg.querySelector('#_gn-pdf-go').addEventListener('click', function () {
      dlg.remove(); resolve(true);
    });
    dlg.querySelector('#_gn-pdf-cancel').addEventListener('click', function () {
      dlg.remove(); resolve(false);
    });
  });
}

window.Gnosis.pdf = {
  printOrDownload: async function (html, filename) {
    // Em mobile com pouca RAM, pergunta antes de gerar (PDF gigante pode
    // crashar a aba sem aviso). Track no GA pra medir frequência.
    if (_gnIsLowMemDevice()) {
      if (window.gnosisTrack) gnosisTrack('pdf_lowmem_warning', { ua: (navigator.userAgent || '').slice(0, 100) });
      var ok = await _gnConfirmLowMemPdf();
      if (!ok) {
        if (window.gnosisTrack) gnosisTrack('pdf_lowmem_cancelled', {});
        return;
      }
    }
    var old = document.getElementById('_pdf_frame');
    if (old) old.remove();

    var iframe = document.createElement('iframe');
    iframe.id = '_pdf_frame';
    iframe.setAttribute(
      'style',
      'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;border:none;'
    );
    document.body.appendChild(iframe);

    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = function () {
      setTimeout(function () {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          var blob = new Blob([html], { type: 'text/html' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
        }
      }, 700);
    };
  }
};

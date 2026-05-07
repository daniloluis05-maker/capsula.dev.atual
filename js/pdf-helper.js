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
window.Gnosis.pdf = {
  printOrDownload: function (html, filename) {
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

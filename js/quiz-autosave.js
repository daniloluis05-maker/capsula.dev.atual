// ─────────────────────────────────────────────────────────────
// capsula.dev · js/quiz-autosave.js
// Persiste progresso de quiz por pergunta no localStorage pra que
// fechar a aba no meio (ou refresh acidental) não force recomeço.
//
// API global em window.gnosisQuizSave:
//   save(matriz, state)        — chama em cada selectAnswer / nextQuestion
//   restore(matriz)            — retorna {state, ageMin} ou null
//   clear(matriz)              — chama no fim do quiz (sucesso)
//   promptResume(opts)         — overlay "Continuar de onde parou?" com 2 botões
//
// Cada chave persistida é gnosis_quiz_<matriz>_v1. Saves com mais
// de 7 dias são descartados silenciosamente (provavelmente esquecido).
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const VERSION = 1;
  const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
  const PREFIX = 'gnosis_quiz_';

  function key(matriz) { return PREFIX + String(matriz).toLowerCase() + '_v' + VERSION; }

  function save(matriz, state) {
    if (!matriz || state == null) return;
    try {
      localStorage.setItem(key(matriz), JSON.stringify({
        savedAt: Date.now(),
        state: state,
      }));
    } catch (_) { /* quota cheia / privado — segue sem autosave */ }
  }

  function restore(matriz) {
    try {
      const raw = localStorage.getItem(key(matriz));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.savedAt) return null;
      const age = Date.now() - obj.savedAt;
      if (age > TTL_MS) { clear(matriz); return null; }
      return { state: obj.state, ageMin: Math.floor(age / 60000) };
    } catch (_) { return null; }
  }

  function clear(matriz) {
    try { localStorage.removeItem(key(matriz)); } catch (_) {}
  }

  // Mostra overlay "Continuar de onde parou?" + 2 botões.
  // opts: { matriz, label, summary, onResume, onRestart }
  //   label   — nome amigável da matriz ("DISC", "Big Five")
  //   summary — string curta tipo "5 de 24 perguntas respondidas"
  //   onResume — callback se user escolher continuar
  //   onRestart — callback se user escolher recomeçar (também chama clear)
  function promptResume(opts) {
    if (!opts) return;
    const matriz   = opts.matriz;
    const label    = opts.label   || matriz;
    const summary  = opts.summary || '';
    const onResume = opts.onResume || function () {};
    const onRestart = opts.onRestart || function () {};

    // Idempotente
    const old = document.getElementById('_gn-resume');
    if (old) old.remove();

    const dlg = document.createElement('div');
    dlg.id = '_gn-resume';
    dlg.innerHTML = [
      '<div class="_gn-resume-card">',
      '<div class="_gn-resume-icon">↺</div>',
      '<h3>Continuar de onde parou?</h3>',
      '<p>Você começou o ' + _esc(label) + ' há pouco e ainda não terminou. ',
      summary ? '<strong>' + _esc(summary) + '</strong>' : '',
      '</p>',
      '<div class="_gn-resume-actions">',
      '<button type="button" id="_gn-resume-restart">Recomeçar</button>',
      '<button type="button" id="_gn-resume-go">Continuar →</button>',
      '</div></div>',
    ].join('');
    document.body.appendChild(dlg);

    function close() { dlg.remove(); }
    dlg.querySelector('#_gn-resume-go').addEventListener('click', function () {
      close();
      onResume();
    });
    dlg.querySelector('#_gn-resume-restart').addEventListener('click', function () {
      close();
      clear(matriz);
      onRestart();
    });
  }

  function _esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  window.gnosisQuizSave = { save, restore, clear, promptResume };
})();

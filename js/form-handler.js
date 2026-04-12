// ─────────────────────────────────────────────────────────────
// capsula.dev · js/form-handler.js
// Handler de formulário de leads.
//
// COMO USAR: inclua APÓS config.js e o SDK do Supabase:
//
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="js/config.js"></script>
//   <script src="js/form-handler.js"></script>
//
// Em seguida, vincule ao seu formulário:
//
//   document.getElementById('meu-form').addEventListener('submit', handleSubmit);
//
// Credenciais são lidas de window.CAPSULA_CONFIG (config.js).
// Não duplique chaves aqui.
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── Cliente Supabase ─────────────────────────────────────────
  let _db = null;

  function getDB() {
    if (_db) return _db;
    if (typeof supabase === 'undefined') {
      throw new Error('[form-handler] SDK do Supabase não carregado. Inclua o script do CDN antes deste arquivo.');
    }
    const cfg = window.CAPSULA_CONFIG;
    if (!cfg || !cfg.supabaseUrl || !cfg.supabaseKey) {
      throw new Error('[form-handler] window.CAPSULA_CONFIG não encontrado. Inclua config.js antes deste arquivo.');
    }
    _db = supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
    return _db;
  }

  // ── Validação ────────────────────────────────────────────────
  function validateForm(fields) {
    const { nome, whatsapp, objetivo } = fields;
    const errors = {};

    if (!nome || nome.trim().length < 3) {
      errors.nome = 'Nome deve ter pelo menos 3 caracteres.';
    }

    const cleanWhatsapp = (whatsapp || '').replace(/\D/g, '');
    if (cleanWhatsapp.length < 10) {
      errors.whatsapp = 'WhatsApp deve conter pelo menos 10 dígitos.';
    }

    if (!objetivo) {
      errors.objetivo = 'Objetivo é obrigatório.';
    }

    return { errors, cleanWhatsapp };
  }

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(event) {
    event.preventDefault();

    const form = Object.fromEntries(new FormData(event.target));
    const { errors, cleanWhatsapp } = validateForm(form);

    if (Object.keys(errors).length) {
      const msgs = Object.values(errors).join('\n');
      alert(msgs);
      return;
    }

    const btn = event.target.querySelector('[type="submit"]');
    const originalText = btn ? btn.textContent : null;
    if (btn) { btn.disabled = true; btn.textContent = 'Cadastrando...'; }

    try {
      const db = getDB();
      const { error } = await db.from('leads').insert([{
        nome:      form.nome.trim(),
        whatsapp:  cleanWhatsapp,
        apelido:   form.apelido ? form.apelido.trim() : null,
        objetivo:  form.objetivo,
        criado_em: new Date().toISOString(),
      }]);

      if (error) throw error;
      alert('Dados salvos com sucesso!');
      event.target.reset();
    } catch (err) {
      console.error('[form-handler] Erro ao salvar lead:', err);
      alert('Erro ao salvar os dados. Tente novamente.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
  }

  // ── Exporta para uso global ──────────────────────────────────
  window.handleSubmit = handleSubmit;
})();

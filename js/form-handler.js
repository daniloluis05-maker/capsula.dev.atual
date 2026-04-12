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
// Feedback de erro: adicione ao HTML um elemento com id="form-error"
// Feedback de sucesso: adicione ao HTML um elemento com id="form-success"
// Se esses elementos não existirem, o feedback aparece como toast.
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

  // ── Feedback inline ou toast ──────────────────────────────────
  function showInline(id, msg, isError) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.style.display = msg ? 'block' : 'none';
      if (isError !== undefined) {
        el.style.color = isError ? 'var(--danger, #e24b4a)' : 'var(--success, #2ec4a0)';
      }
      return true;
    }
    return false;
  }

  function showToast(msg, isError) {
    let t = document.getElementById('_fh-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = '_fh-toast';
      t.style.cssText = [
        'position:fixed;bottom:2rem;right:2rem',
        'border-radius:8px;padding:0.75rem 1.1rem',
        'font-size:0.82rem;z-index:9999',
        'opacity:0;transform:translateY(12px)',
        'transition:opacity 0.25s,transform 0.25s',
        'pointer-events:none;max-width:320px',
      ].join(';');
      document.body.appendChild(t);
    }
    const bg  = isError ? 'var(--danger-bg,#3a1a1a)'  : 'var(--surface2,#1e1e1e)';
    const bdr = isError ? 'var(--danger,#e24b4a)'      : 'var(--border2,#333)';
    const col = isError ? 'var(--danger,#e24b4a)'      : 'var(--text,#fff)';
    t.style.background = bg;
    t.style.border     = `1px solid ${bdr}`;
    t.style.color      = col;
    t.textContent = (isError ? '✕  ' : '✓  ') + msg;
    t.style.opacity   = '1';
    t.style.transform = 'translateY(0)';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.opacity   = '0';
      t.style.transform = 'translateY(12px)';
    }, isError ? 4000 : 2800);
  }

  function notifyError(form, msg) {
    if (!showInline('form-error', msg, true)) showToast(msg, true);
    // Limpa mensagem de sucesso se existir
    showInline('form-success', '', false);
  }

  function notifySuccess(form, msg) {
    if (!showInline('form-success', msg, false)) showToast(msg, false);
    // Limpa mensagem de erro se existir
    showInline('form-error', '', true);
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

    const formEl = event.target;
    const form   = Object.fromEntries(new FormData(formEl));
    const { errors, cleanWhatsapp } = validateForm(form);

    if (Object.keys(errors).length) {
      notifyError(formEl, Object.values(errors).join(' · '));
      return;
    }

    const btn = formEl.querySelector('[type="submit"]');
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
      notifySuccess(formEl, 'Dados salvos com sucesso!');
      formEl.reset();
    } catch (err) {
      console.error('[form-handler] Erro ao salvar lead:', err);
      notifyError(formEl, 'Erro ao salvar os dados. Tente novamente.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
  }

  // ── Exporta para uso global ──────────────────────────────────
  window.handleSubmit = handleSubmit;
})();

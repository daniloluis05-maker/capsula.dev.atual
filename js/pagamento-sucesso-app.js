const PRODUTO_LABELS = {
  credito1:  '1 Crédito (R$29,90) — acesso a qualquer matriz',
  credito3:  '3 Créditos (R$69,90) — pacote essencial',
  credito8:  '8 Créditos (R$129,90) — pacote completo',
  pro:       'Plano Profissional (R$149,90) — 30 dias ilimitado',
  gerencial: 'Plano Gerencial (R$179,90) — 30 dias ilimitado + equipes',
};

(async function() {
  const params  = new URLSearchParams(window.location.search);
  const produto = params.get('produto') || '';

  // Atualiza badge
  const badge = document.getElementById('produto-badge');
  badge.textContent = PRODUTO_LABELS[produto] || 'Compra confirmada';

  if (produto === 'pro') {
    document.getElementById('subtitle').textContent =
      'Seu Plano Profissional está ativo! PDFs e testes ilimitados liberados.';
  } else if (produto === 'gerencial') {
    document.getElementById('subtitle').textContent =
      'Seu Plano Gerencial está ativo! Links remotos ilimitados e acompanhamento semanal desbloqueados.';
  }

  // Aguarda webhook processar (máx 8s) depois recarrega dados do usuário
  const loadingEl = document.getElementById('loading-msg');
  let attempts = 0;
  const maxAttempts = 8;

  async function trySync() {
    attempts++;
    try {
      if (window.capsulaDB) {
        const u = await capsulaDB.ensureUserData();
        if (u) {
          try { localStorage.setItem('capsula_user', JSON.stringify(u)); } catch(_) {}
          const c = u.creditos || {};
          const hasCredits = Object.values(c).some(v => v > 0)
            || u.plano === 'profissional' || u.plano === 'gerencial';
          if (hasCredits || attempts >= maxAttempts) {
            loadingEl.textContent = hasCredits ? '✓ Créditos sincronizados!' : 'Sincronização concluída.';
            loadingEl.style.color = hasCredits ? '#4caf87' : 'rgba(232,232,240,0.4)';
            return;
          }
        }
      }
    } catch(_) {}

    if (attempts < maxAttempts) {
      loadingEl.textContent = `Sincronizando... (${attempts}/${maxAttempts})`;
      setTimeout(trySync, 1000);
    } else {
      loadingEl.textContent = 'Seus créditos aparecerão no dashboard em instantes.';
    }
  }

  // Aguarda 2s para o webhook processar antes da primeira tentativa
  setTimeout(trySync, 2000);
})();
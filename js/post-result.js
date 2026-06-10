// ─────────────────────────────────────────────────────────────
// capsula.dev · js/post-result.js
// Bloco "E agora?" injetado ao final da página de resultado de
// cada teste. Mostra:
//   1. WhatsApp pré-preenchido (compartilhar)
//   2. Próximo teste recomendado (sugestão de progressão)
//
// Como usar: inclua o script no <head> da página do teste e chame
//   window.gnosisPostResult.render({
//     fromKey: 'disc',                 // chave da matriz atual
//     resultLabel: 'O Executor',       // título do resultado (ex: arquétipo dominante)
//     resultDetail: 'Perfil Dominante · 78%',   // sub-rótulo opcional
//     containerId: 'page-result',      // onde anexar o bloco
//   });
//
// O bloco é idempotente — chamar render() de novo só substitui o
// HTML existente.
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // Sequência sugerida de testes — ordem de progressão recomendada.
  // Se o usuário acabou de fazer "disc", o próximo sugerido é "eneagrama";
  // se acabou "eneagrama", próximo é "bigfive"; e assim por diante.
  // Quando termina tudo, o próximo passo é o DNA Estratégico.
  const SEQUENCE = [
    { key: 'disc',      title: 'DISC',                href: 'disc.html',      time: '8 min',  desc: 'Perfil comportamental em 4 dimensões' },
    { key: 'eneagrama', title: 'Eneagrama',           href: 'eneagrama.html', time: '10 min', desc: 'Os 9 tipos e suas motivações inconscientes' },
    { key: 'bigfive',   title: 'Big Five · OCEAN',    href: 'bigfive.html',   time: '10 min', desc: '5 grandes traços validados cientificamente' },
    { key: 'soar',      title: 'SOAR',                href: 'soar.html',      time: '10 min', desc: 'Forças, Oportunidades, Aspirações e Resultados' },
    { key: 'ikigai',    title: 'Ikigai',              href: 'ikigai.html',    time: '12 min', desc: 'A intersecção do seu propósito de vida' },
    { key: 'johari',    title: 'Janela de Johari',    href: 'johari.html',    time: '8 min',  desc: 'Autopercepção × percepção dos outros' },
    { key: 'ancoras',   title: 'Âncoras de Carreira', href: 'ancoras.html',   time: '7 min',  desc: 'O que você não abre mão profissionalmente' },
    { key: 'pearson',   title: 'Pearson-Marr',        href: 'pearson.html',   time: '10 min', desc: 'Seu arquétipo junguiano dominante' },
    { key: 'tci',       title: 'Temperamento TCI',    href: 'tci.html',       time: '10 min', desc: 'Sua assinatura neuroquímica inata' },
  ];

  // Retorna a chave do próximo teste depois de `fromKey` que o usuário
  // ainda não fez. Se já fez todos, retorna o DNA Estratégico.
  function pickNext(fromKey) {
    let user = {};
    try {
      const raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user');
      user = raw ? JSON.parse(raw) : {};
    } catch (_) {}

    const idx = SEQUENCE.findIndex(s => s.key === fromKey);
    // Começa após o atual e dá a volta na lista
    for (let i = 1; i <= SEQUENCE.length; i++) {
      const candidate = SEQUENCE[(idx + i) % SEQUENCE.length];
      const done = !!(user[candidate.key] && user[candidate.key].completedAt);
      if (!done) return candidate;
    }
    // Todos feitos → DNA Estratégico
    return { key: 'dna', title: 'DNA Estratégico', href: 'dna.html', time: '3 min', desc: 'Síntese das suas matrizes em uma análise integrada por IA' };
  }

  // Conta quantos testes o usuário já fez (para a barra de progresso)
  function countCompleted() {
    let user = {};
    try {
      const raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user');
      user = raw ? JSON.parse(raw) : {};
    } catch (_) {}
    return SEQUENCE.filter(s => user[s.key] && user[s.key].completedAt).length;
  }

  // Monta a mensagem do WhatsApp pré-preenchida.
  function whatsappUrl(opts) {
    const label  = opts.resultLabel || 'Meu resultado';
    const matrix = opts.fromKey ? opts.fromKey.toUpperCase() : '';
    const text = `Acabei de fazer o ${matrix} no Sistema Gnosis. ` +
                 `Resultado: ${label}. ` +
                 `Você também pode fazer (grátis, 8 min): https://www.sistema-gnosis.com.br/${opts.fromKey}.html`;
    return 'https://wa.me/?text=' + encodeURIComponent(text);
  }

  function render(opts) {
    if (!opts || !opts.fromKey) return;
    const container = document.getElementById(opts.containerId || 'page-result');
    if (!container) return;

    // Remove versão anterior se houver (idempotente)
    const existing = document.getElementById('gnosis-post-result');
    if (existing) existing.remove();

    const next = pickNext(opts.fromKey);
    const completed = countCompleted();
    const total = SEQUENCE.length;
    const progressPct = Math.round((completed / total) * 100);

    const isDna = next.key === 'dna';
    const accentColor = isDna ? '#C9A84C' : 'var(--accent, #6C5FE6)';
    const accentBg    = isDna ? 'rgba(201,168,76,0.10)' : 'rgba(108,95,230,0.12)';
    const accentBdr   = isDna ? 'rgba(201,168,76,0.30)' : 'rgba(108,95,230,0.30)';

    const block = document.createElement('div');
    block.id = 'gnosis-post-result';
    block.style.cssText = 'width:100%;max-width:680px;margin:2.5rem auto 0;padding:0 1rem;font-family:var(--sans,sans-serif);';

    block.innerHTML = `
      <div style="text-align:center;margin-bottom:1.25rem;">
        <span style="font-family:var(--mono,monospace);font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted,#888);">// e agora?</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0.85rem;">

        <!-- Compartilhar via WhatsApp -->
        <a href="${whatsappUrl(opts)}" target="_blank" rel="noopener" style="display:flex;flex-direction:column;gap:0.5rem;padding:1.25rem 1.25rem 1.1rem;background:rgba(37,211,102,0.06);border:1px solid rgba(37,211,102,0.25);border-radius:12px;text-decoration:none;color:inherit;transition:transform 0.15s,border-color 0.15s;" onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='rgba(37,211,102,0.5)'" onmouseout="this.style.transform='';this.style.borderColor='rgba(37,211,102,0.25)'">
          <span style="font-family:var(--mono,monospace);font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:#25D366;">Compartilhe</span>
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <span style="font-size:1.4rem;line-height:1;">💬</span>
            <strong style="font-size:0.95rem;color:var(--text,#fff);">Mande pra alguém pelo WhatsApp</strong>
          </div>
          <p style="font-size:0.78rem;line-height:1.55;color:var(--muted,#888);margin:0;">Discuta o resultado com quem te conhece — ou desafie um amigo a fazer também.</p>
        </a>

        <!-- Próximo teste recomendado -->
        <a href="${next.href}" style="display:flex;flex-direction:column;gap:0.5rem;padding:1.25rem 1.25rem 1.1rem;background:${accentBg};border:1px solid ${accentBdr};border-radius:12px;text-decoration:none;color:inherit;transition:transform 0.15s,border-color 0.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
          <span style="font-family:var(--mono,monospace);font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:${accentColor};">${isDna ? 'Síntese' : 'Próximo passo'}</span>
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <span style="font-size:1.4rem;line-height:1;">${isDna ? '🧬' : '→'}</span>
            <strong style="font-size:0.95rem;color:var(--text,#fff);">${isDna ? 'Gere seu DNA Estratégico' : next.title}</strong>
            <span style="margin-left:auto;font-family:var(--mono,monospace);font-size:0.62rem;color:var(--muted,#888);">⏱ ${next.time}</span>
          </div>
          <p style="font-size:0.78rem;line-height:1.55;color:var(--muted,#888);margin:0;">${next.desc}</p>
        </a>

      </div>

      <!-- Barra de progresso -->
      <div style="margin-top:1.5rem;padding:1rem 1.25rem;background:rgba(255,255,255,0.02);border:1px solid var(--border,rgba(255,255,255,0.06));border-radius:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <span style="font-family:var(--mono,monospace);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted,#888);">Sua jornada</span>
          <span style="font-family:var(--mono,monospace);font-size:0.72rem;color:var(--text,#fff);">${completed} / ${total} matrizes</span>
        </div>
        <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:100px;overflow:hidden;">
          <div style="height:100%;width:${progressPct}%;background:linear-gradient(90deg,var(--accent,#6C5FE6),#C9A84C);border-radius:100px;transition:width 0.6s ease;"></div>
        </div>
        ${completed >= 3 ? `<p style="margin:0.6rem 0 0;font-size:0.72rem;color:#C9A84C;line-height:1.5;">✨ Você já tem dados suficientes para o DNA Estratégico — uma síntese integrada por IA.</p>` : `<p style="margin:0.6rem 0 0;font-size:0.72rem;color:var(--muted,#888);line-height:1.5;">Faça ${3 - completed} matriz${3 - completed > 1 ? 'es' : ''} a mais pra desbloquear o DNA Estratégico (síntese integrada por IA).</p>`}
      </div>
    `;

    container.appendChild(block);
  }

  window.gnosisPostResult = { render: render, pickNext: pickNext, SEQUENCE: SEQUENCE };
})();

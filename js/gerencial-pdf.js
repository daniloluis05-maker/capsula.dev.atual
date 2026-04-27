// ─────────────────────────────────────────────────────────────
// capsula.dev · js/gerencial-pdf.js
// Exportação PDF para ferramentas do Plano Gerencial:
//   pdf5W2H()  · pdfRACI()  · pdfOKRs()
// Depende dos globals de cada *-app.js (mesma janela).
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── Helpers ─────────────────────────────────────────────────

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    return d.toLocaleDateString('pt-BR');
  }

  function fmtMoney(v) {
    if (v == null || v === '') return '—';
    return 'R$ ' + Number(v).toFixed(2).replace('.', ',');
  }

  function fmtNow() {
    return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function _imprimirPDF(html, filename) {
    var old = document.getElementById('_gpdf_frame');
    if (old) old.remove();
    var iframe = document.createElement('iframe');
    iframe.id = '_gpdf_frame';
    iframe.setAttribute('style', 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;border:none;');
    document.body.appendChild(iframe);
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
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
          a.download = filename || 'relatorio.html';
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 3000);
        }
      }, 700);
    };
  }

  function _headerHtml(titulo, subtitulo, cor) {
    return `
      <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid ${cor};">
        <div>
          <div style="font-size:9px;color:#888;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Sistema Gnosis · Plano Gerencial</div>
          <h1 style="font-size:20px;font-weight:800;color:#111;margin:0 0 3px;">${titulo}</h1>
          <div style="font-size:11px;color:#666;">${subtitulo}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:9px;color:#aaa;font-family:monospace;">Gerado em</div>
          <div style="font-size:10px;color:#888;font-family:monospace;">${fmtNow()}</div>
        </div>
      </div>`;
  }

  function _footerScript() {
    return `<script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>`;
  }

  function _baseCss(landscape) {
    return `
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#111;font-size:11px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      @media print{@page{margin:14mm;size:A4 ${landscape ? 'landscape' : 'portrait'};}body{background:#fff!important;}}
      .page{width:100%;max-width:${landscape ? '257mm' : '180mm'};margin:0 auto;padding:16px;}
      table{width:100%;border-collapse:collapse;}
      th{background:#f5f5f7;text-align:left;padding:6px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:#555;border-bottom:2px solid #e0e0e8;}
      td{padding:7px 8px;border-bottom:1px solid #eee;vertical-align:top;font-size:10px;color:#222;}
      tr:last-child td{border-bottom:none;}
      tr:nth-child(even) td{background:#fafafe;}
      .pill{display:inline-block;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;}
    `;
  }

  // ── 5W2H ────────────────────────────────────────────────────

  window.pdf5W2H = function () {
    var items   = window._items   || [];
    var equipes = window._equipes || [];
    var eqId    = window._equipeId || '';
    var eq      = equipes.find(function (e) { return e.id === eqId; });
    var eqNome  = eq ? eq.nome : '—';

    if (!items.length) { alert('Nenhuma ação para exportar. Selecione uma equipe com ações cadastradas.'); return; }

    var STATUS_COLOR = { pendente: '#E8A03A', em_andamento: '#1BA8D4', concluido: '#2EC4A0', cancelado: '#999' };
    var STATUS_LABEL = { pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído', cancelado: 'Cancelado' };
    var PRIO_COLOR   = { baixa: '#2EC4A0', media: '#E8A03A', alta: '#E8603A', critica: '#c0392b' };
    var PRIO_LABEL   = { baixa: 'Baixa', media: 'Média', alta: 'Alta', critica: 'Crítica' };

    var total  = items.length;
    var pend   = items.filter(function (i) { return i.status === 'pendente'; }).length;
    var and    = items.filter(function (i) { return i.status === 'em_andamento'; }).length;
    var conc   = items.filter(function (i) { return i.status === 'concluido'; }).length;
    var canc   = items.filter(function (i) { return i.status === 'cancelado'; }).length;
    var pct    = total ? Math.round((conc / total) * 100) : 0;

    var statsHtml = `
      <div style="display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap;">
        ${[
          ['Total', total, '#555'],
          ['Pendentes', pend, '#E8A03A'],
          ['Em andamento', and, '#1BA8D4'],
          ['Concluídos', conc, '#2EC4A0'],
          ['Cancelados', canc, '#999'],
          ['Conclusão', pct + '%', '#7c6af7'],
        ].map(function (s) {
          return `<div style="background:#f5f5f7;border-radius:8px;padding:8px 14px;text-align:center;min-width:70px;">
            <div style="font-size:18px;font-weight:800;color:${s[2]};">${s[1]}</div>
            <div style="font-size:8px;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">${s[0]}</div>
          </div>`;
        }).join('')}
      </div>`;

    var rows = items.map(function (it) {
      var sc = STATUS_COLOR[it.status] || '#999';
      var pc = PRIO_COLOR[it.prioridade] || '#999';
      return `<tr>
        <td style="max-width:120px;">${esc(it.what)}</td>
        <td style="max-width:100px;color:#555;">${esc(it.why || '—')}</td>
        <td>${esc(it.where_loc || '—')}</td>
        <td style="white-space:nowrap;">${it.when_data ? fmtDate(it.when_data) : '—'}</td>
        <td>${esc(it.who || '—')}</td>
        <td style="max-width:100px;color:#555;">${esc(it.how || '—')}</td>
        <td style="white-space:nowrap;">${fmtMoney(it.how_much)}</td>
        <td><span class="pill" style="background:${sc}22;color:${sc};border:1px solid ${sc}66;">${STATUS_LABEL[it.status] || it.status}</span></td>
        <td><span class="pill" style="background:${pc}22;color:${pc};border:1px solid ${pc}66;">${PRIO_LABEL[it.prioridade] || it.prioridade}</span></td>
      </tr>`;
    }).join('');

    var html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>
      ${_baseCss(true)}
      th,td{font-size:9.5px;}
    </style>${_footerScript()}</head><body><div class="page">
      ${_headerHtml('5W2H — Plano de Ação', 'Equipe: ' + esc(eqNome), '#1BA8D4')}
      ${statsHtml}
      <table>
        <thead><tr>
          <th>O Quê</th><th>Por Quê</th><th>Onde</th>
          <th>Quando</th><th>Quem</th><th>Como</th>
          <th>R$</th><th>Status</th><th>Prioridade</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:16px;font-size:8px;color:#bbb;text-align:center;">capsula.dev · Sistema Gnosis · Plano Gerencial</div>
    </div></body></html>`;

    _imprimirPDF(html, '5w2h-' + eqNome.replace(/\s+/g, '-').toLowerCase() + '.html');
  };

  // ── RACI ─────────────────────────────────────────────────────

  window.pdfRACI = function () {
    var atividades  = window._atividades  || [];
    var atribuicoes = window._atribuicoes || [];
    var membros     = window._membros     || [];
    var equipes     = window._equipes     || [];
    var eqId        = window._equipeId    || '';
    var eq          = equipes.find(function (e) { return e.id === eqId; });
    var eqNome      = eq ? eq.nome : '—';

    if (!atividades.length) { alert('Nenhuma atividade para exportar.'); return; }
    if (!membros.length)    { alert('Nenhum membro na equipe.'); return; }

    var PAPEL_COLOR = { R: '#E8603A', A: '#7c6af7', C: '#1BA8D4', I: '#2EC4A0' };
    var PAPEL_DESC  = { R: 'Responsible — Executa', A: 'Accountable — Responde', C: 'Consulted — É consultado', I: 'Informed — É informado' };

    function getPapel(atId, mId) {
      var a = atribuicoes.find(function (x) { return x.atividade_id === atId && x.membro_id === mId; });
      return a ? a.papel : null;
    }

    var headerCols = membros.map(function (m) {
      var nome = (m.nome || '?').split(' ')[0];
      return `<th style="text-align:center;min-width:40px;">${esc(nome)}</th>`;
    }).join('');

    var rows = atividades.map(function (at) {
      var cells = membros.map(function (m) {
        var p = getPapel(at.id, m.id);
        if (!p) return `<td style="text-align:center;color:#ddd;">·</td>`;
        var c = PAPEL_COLOR[p] || '#999';
        return `<td style="text-align:center;"><span class="pill" style="background:${c};color:#fff;min-width:22px;display:inline-block;text-align:center;">${p}</span></td>`;
      }).join('');
      return `<tr><td style="max-width:180px;font-weight:500;">${esc(at.atividade)}</td>${cells}</tr>`;
    }).join('');

    var legendaHtml = `
      <div style="display:flex;gap:18px;margin-bottom:16px;flex-wrap:wrap;">
        ${Object.entries(PAPEL_COLOR).map(function ([p, c]) {
          return `<div style="display:flex;align-items:center;gap:6px;">
            <span class="pill" style="background:${c};color:#fff;">${p}</span>
            <span style="font-size:10px;color:#555;">${PAPEL_DESC[p]}</span>
          </div>`;
        }).join('')}
      </div>`;

    var html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>
      ${_baseCss(true)}
    </style>${_footerScript()}</head><body><div class="page">
      ${_headerHtml('Matriz RACI', 'Equipe: ' + esc(eqNome) + ' · ' + atividades.length + ' atividades · ' + membros.length + ' membros', '#E8603A')}
      ${legendaHtml}
      <table>
        <thead><tr>
          <th>Atividade</th>${headerCols}
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:16px;font-size:8px;color:#bbb;text-align:center;">capsula.dev · Sistema Gnosis · Plano Gerencial</div>
    </div></body></html>`;

    _imprimirPDF(html, 'raci-' + eqNome.replace(/\s+/g, '-').toLowerCase() + '.html');
  };

  // ── OKRs ─────────────────────────────────────────────────────

  window.pdfOKRs = function () {
    var objetivos = window._objetivos || [];
    var ciclo     = window._ciclo     || '';
    var equipes   = window._equipes   || [];

    if (!objetivos.length) { alert('Nenhum objetivo para exportar no ciclo atual.'); return; }

    function krProgress(kr) {
      var ini = Number(kr.valor_inicial || 0);
      var meta = Number(kr.valor_meta || 0);
      var atual = Number(kr.valor_atual || 0);
      if (meta === ini) return atual >= meta ? 100 : 0;
      var pct = ((atual - ini) / (meta - ini)) * 100;
      return Math.max(0, Math.min(100, Math.round(pct)));
    }

    function objProgress(obj) {
      var krs = obj.key_results || [];
      if (!krs.length) return 0;
      var totalW = 0, sumW = 0;
      krs.forEach(function (kr) { var w = Number(kr.peso || 1); sumW += krProgress(kr) * w; totalW += w; });
      return totalW ? Math.round(sumW / totalW) : 0;
    }

    function pctColor(pct) {
      if (pct >= 70) return '#2EC4A0';
      if (pct >= 40) return '#7c6af7';
      if (pct >= 15) return '#E8A03A';
      return '#E8603A';
    }

    function progressBar(pct, cor, h) {
      h = h || 6;
      return `<div style="background:#eee;border-radius:${h}px;height:${h}px;width:100%;overflow:hidden;">
        <div style="background:${cor};height:100%;width:${pct}%;border-radius:${h}px;"></div>
      </div>`;
    }

    var totalKR  = objetivos.reduce(function (s, o) { return s + (o.key_results ? o.key_results.length : 0); }, 0);
    var avgPct   = objetivos.length ? Math.round(objetivos.reduce(function (s, o) { return s + objProgress(o); }, 0) / objetivos.length) : 0;
    var avgColor = pctColor(avgPct);

    var statsHtml = `
      <div style="display:flex;gap:12px;margin-bottom:20px;">
        ${[
          ['Objetivos', objetivos.length, '#7c6af7'],
          ['Key Results', totalKR, '#1BA8D4'],
          ['Progresso Médio', avgPct + '%', avgColor],
          ['Ciclo', ciclo, '#555'],
        ].map(function (s) {
          return `<div style="background:#f5f5f7;border-radius:8px;padding:8px 14px;text-align:center;min-width:70px;">
            <div style="font-size:18px;font-weight:800;color:${s[2]};">${s[1]}</div>
            <div style="font-size:8px;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">${s[0]}</div>
          </div>`;
        }).join('')}
      </div>`;

    var objHtml = objetivos.map(function (o) {
      var pct    = objProgress(o);
      var cor    = pctColor(pct);
      var krs    = (o.key_results || []).slice().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
      var equipe = equipes.find(function (e) { return e.id === o.equipe_id; });
      var statusColor = o.status === 'concluido' ? '#2EC4A0' : o.status === 'cancelado' ? '#E8603A' : '#888';

      var krRows = krs.map(function (kr) {
        var kp  = krProgress(kr);
        var kc  = pctColor(kp);
        var bar = progressBar(kp, kc, 4);
        return `<tr>
          <td style="padding-left:20px;color:#444;">${esc(kr.titulo)}</td>
          <td style="text-align:center;font-family:monospace;font-size:10px;">${kr.valor_atual} / ${kr.valor_meta} ${esc(kr.unidade || '%')}</td>
          <td style="width:120px;">${bar}<span style="font-size:9px;color:${kc};font-weight:700;">${kp}%</span></td>
          <td style="color:#888;">${esc(kr.responsavel || '—')}</td>
          <td style="text-align:center;font-size:9px;color:#aaa;">${kr.peso > 1 ? 'x' + kr.peso : ''}</td>
        </tr>`;
      }).join('');

      return `
        <div style="margin-bottom:18px;border:1px solid #e0e0e8;border-radius:10px;overflow:hidden;break-inside:avoid;">
          <div style="background:linear-gradient(135deg,${o.cor || '#7c6af7'}18,#f8f8fc);padding:12px 14px;border-bottom:1px solid #eee;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:4px;">${esc(o.titulo)}</div>
                ${o.descricao ? `<div style="font-size:10px;color:#666;margin-bottom:6px;">${esc(o.descricao)}</div>` : ''}
                <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                  <span style="font-size:9px;background:rgba(124,106,247,0.1);color:#7c6af7;border:1px solid rgba(124,106,247,0.25);padding:2px 7px;border-radius:20px;">${esc(o.ciclo)}</span>
                  ${equipe ? `<span style="font-size:9px;background:rgba(46,196,160,0.08);color:#2EC4A0;border:1px solid rgba(46,196,160,0.2);padding:2px 7px;border-radius:20px;">${esc(equipe.nome)}</span>` : ''}
                  ${o.prazo ? `<span style="font-size:9px;color:#888;">📅 ${fmtDate(o.prazo)}</span>` : ''}
                  ${o.status !== 'ativo' ? `<span style="font-size:9px;color:${statusColor};font-weight:600;">${o.status === 'concluido' ? '✓ Concluído' : '× Cancelado'}</span>` : ''}
                </div>
              </div>
              <div style="text-align:center;min-width:52px;">
                <div style="font-size:22px;font-weight:800;color:${cor};">${pct}%</div>
                <div style="font-size:8px;color:#aaa;">${krs.length} KR${krs.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <div style="margin-top:8px;">${progressBar(pct, cor, 7)}</div>
          </div>
          ${krs.length ? `
          <table style="margin:0;">
            <thead><tr>
              <th>Key Result</th>
              <th style="text-align:center;">Valores</th>
              <th>Progresso</th>
              <th>Responsável</th>
              <th style="text-align:center;">Peso</th>
            </tr></thead>
            <tbody>${krRows}</tbody>
          </table>` : `<div style="padding:10px 14px;font-size:10px;color:#aaa;font-style:italic;">Nenhum Key Result cadastrado</div>`}
        </div>`;
    }).join('');

    var html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>
      ${_baseCss(false)}
    </style>${_footerScript()}</head><body><div class="page">
      ${_headerHtml('OKRs — Objectives & Key Results', 'Ciclo: ' + esc(ciclo), '#7c6af7')}
      ${statsHtml}
      ${objHtml}
      <div style="margin-top:16px;font-size:8px;color:#bbb;text-align:center;">capsula.dev · Sistema Gnosis · Plano Gerencial</div>
    </div></body></html>`;

    _imprimirPDF(html, 'okrs-' + esc(ciclo) + '.html');
  };

})();

// ══════════════════════════════════════
// AVALIAÇÕES REMOTAS (Plano Pro)
// ══════════════════════════════════════
const _RL_NOMES = {
  disc:'DISC', soar:'SOAR', ikigai:'Ikigai', ancoras:'Âncoras de Carreira',
  johari:'Janela de Johari', bigfive:'Big Five', pearson:'Pearson-Marr', tci:'TCI',
};
let _rlProEmail = '';

function rlInitSection(proEmail) {
  _rlProEmail = proEmail || '';
  const sec = document.getElementById('pro-remote-section');
  if (sec) sec.style.display = 'block';
  rlCarregarLinks();
  // Atualiza badge de "novos respondentes" em background (não bloqueia render)
  rlAtualizarBadgeNovos();
}

// Storage key por usuário pra rastrear o último respondente já visto
function _rlLastSeenKey() {
  return 'gnosis_last_seen_remote_results::' + (_rlProEmail || 'anon').toLowerCase();
}

async function rlAtualizarBadgeNovos() {
  if (!_rlProEmail) return;
  try {
    const links = await capsulaDB.getMyRemoteLinks(_rlProEmail) || [];
    if (!links.length) return;
    const arrays = await Promise.all(links.map(l => capsulaDB.getRemoteResults(l.token)));
    const todos = arrays.flat ? arrays.flat() : [].concat.apply([], arrays);
    if (!todos.length) return;
    const lastSeen = localStorage.getItem(_rlLastSeenKey()) || '';
    const novos = todos.filter(r => (r.completed_at || '') > lastSeen).length;
    const badge = document.getElementById('rl-novos-badge');
    if (!badge) return;
    if (novos > 0) {
      badge.textContent = novos > 99 ? '99+' : String(novos);
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  } catch (e) { /* badge é best-effort */ }
}

async function rlCriarLink() {
  if (!_rlProEmail) return;
  const matriz        = document.getElementById('rl-select-matriz').value;
  const etiqueta      = (document.getElementById('rl-input-etiqueta').value || '').trim();
  const btn           = document.getElementById('rl-btn-criar');
  const maxCompletions = (window._payments && (_payments.isGerencial() || _payments.isAdmin())) ? 9999 : 20;
  btn.disabled = true; btn.textContent = 'Gerando...';
  const { error, token } = await capsulaDB.createRemoteLink({ pro_email: _rlProEmail, matriz, etiqueta, max_completions: maxCompletions });
  btn.disabled = false; btn.textContent = '+ Gerar link';
  if (error) {
    console.error('[rlCriarLink] erro Supabase:', error);
    const isAuth  = error === 'offline' || (error && (error.code === 'auth' || error.message === 'session_expired'));
    const noTable = error && (error.code === '42P01' || (error.message || '').includes('does not exist'));
    const isRLS   = error && (error.code === '42501' || (error.message || '').toLowerCase().includes('row-level security'));
    if (isAuth) {
      if (confirm('Sessão expirada. Fazer login novamente?')) window.location.href = 'index.html';
    } else if (noTable) {
      alert('Tabela remote_links não encontrada.\nExecute a migration 003_remote_links.sql no Supabase.');
    } else if (isRLS) {
      alert('Permissão negada pelo banco (RLS).\nVerifique se as policies da migration 005 foram aplicadas.');
    } else {
      alert('Erro ao criar link: ' + (error.message || JSON.stringify(error)));
    }
    return;
  }
  document.getElementById('rl-input-etiqueta').value = '';
  // URL compartilhada passa por /api/r para gerar OG tags personalizadas no servidor
  const url = window.location.origin + '/api/r?token=' + token;
  rlMostrarBannerLink(url, matriz, etiqueta);
  // Após 2.5 s vai para "Meus links" e recarrega a lista completa
  setTimeout(function() {
    rlSwitchTab('lista');
  }, 2500);
}

function rlSwitchTab(tab) {
  const t = (tab === 'gerar' || tab === 'lista' || tab === 'respondentes') ? tab : 'gerar';
  const panels = {
    gerar:        document.getElementById('rl-panel-gerar'),
    lista:        document.getElementById('rl-panel-lista'),
    respondentes: document.getElementById('rl-panel-respondentes'),
  };
  const tabs = {
    gerar:        document.getElementById('rl-tab-gerar'),
    lista:        document.getElementById('rl-tab-lista'),
    respondentes: document.getElementById('rl-tab-respondentes'),
  };
  Object.keys(panels).forEach(function (k) {
    if (panels[k]) panels[k].style.display = (k === t) ? '' : 'none';
    if (tabs[k]) {
      tabs[k].style.borderBottomColor = (k === t) ? 'var(--accent)' : 'transparent';
      tabs[k].style.color             = (k === t) ? 'var(--text)'   : 'var(--muted)';
    }
  });
  if (t === 'lista')        rlCarregarLinks(true);
  if (t === 'respondentes') rlCarregarRespondentes(true);
}

function rlMostrarBannerLink(url, matriz, etiqueta) {
  const el = document.getElementById('rl-banner');
  if (!el) return;
  const nome = _RL_NOMES[matriz] || matriz;
  const label = etiqueta ? ' — ' + eqEsc(etiqueta) : '';
  el.style.display = '';
  el.innerHTML = [
    '<div style="background:rgba(46,196,160,0.07);border:1px solid rgba(46,196,160,0.35);',
    'border-radius:10px;padding:1.1rem 1.25rem;margin-bottom:0.85rem;">',
    '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.7rem;">',
    '<span style="font-size:0.8rem;color:#2EC4A0;font-weight:700;">✓ Link criado!</span>',
    '<span style="font-size:0.72rem;color:var(--muted);">',nome,label,'</span>',
    '<span style="font-size:0.65rem;color:var(--muted);margin-left:auto;font-family:var(--mono);">',
    'Indo para Meus links em 2s…</span>',
    '</div>',
    '<div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">',
    '<div style="flex:1;min-width:0;font-size:0.72rem;font-family:monospace;color:var(--muted);',
    'background:rgba(0,0,0,0.25);padding:0.45rem 0.75rem;border-radius:6px;',
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="',eqEsc(url),'">',eqEsc(url),'</div>',
    '<button onclick="rlCopiarLink(\''+url.replace(/'/g,"\\'")+"',this)\"",
    ' style="flex-shrink:0;padding:0.55rem 1.1rem;background:var(--accent);color:#fff;border:none;',
    'border-radius:8px;font-size:0.85rem;font-weight:700;cursor:pointer;white-space:nowrap;">',
    'Copiar link</button>',
    '</div>',
    '</div>',
  ].join('');
}

async function rlCarregarLinks(full) {
  if (!_rlProEmail) return;
  const links = await capsulaDB.getMyRemoteLinks(_rlProEmail);
  const arr = links || [];
  console.debug('[rl] rlCarregarLinks → arr.length =', arr.length, '| full =', !!full);
  // Atualiza badge de contagem
  const badge = document.getElementById('rl-count-badge');
  if (badge) {
    badge.textContent = arr.length;
    badge.style.display = arr.length ? '' : 'none';
  }
  rlRenderLinks(arr);
  if (full) rlRenderListaFull(arr);
}

function rlRenderLinks(links) {
  const el = document.getElementById('rl-links-list');
  if (!el) return;
  if (!links || !links.length) {
    // Só mostra placeholder se não há banner visível
    const banner = document.getElementById('rl-banner');
    if (!banner || banner.style.display === 'none') {
      el.innerHTML = '<div style="text-align:center;padding:2rem 1rem;color:var(--muted);font-size:0.85rem;">Nenhum link gerado ainda. Crie o primeiro acima.</div>';
    }
    return;
  }
  const origin = window.location.origin;
  el.innerHTML = links.filter(function(lk) { return lk.matriz; }).map(function(lk) {
    const url  = origin + '/api/r?token=' + lk.token;
    const full = lk.completion_count >= lk.max_completions;
    const etiq = lk.etiqueta ? '<span style="font-size:0.8rem;color:var(--text);font-weight:500;">' + eqEsc(lk.etiqueta) + '</span>' : '';
    return [
      '<div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;',
      'padding:1rem 1.25rem;margin-bottom:0.55rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">',
      '<div style="flex:1;min-width:200px;">',
      '<div style="display:flex;align-items:center;gap:0.45rem;margin-bottom:0.3rem;flex-wrap:wrap;">',
      '<span style="font-size:0.68rem;font-family:var(--mono);background:rgba(124,106,247,0.1);',
      'color:var(--accent);padding:0.1rem 0.5rem;border-radius:4px;text-transform:uppercase;">',
      (_RL_NOMES[lk.matriz]||lk.matriz),'</span>',etiq,
      full?'<span style="font-size:0.65rem;color:#ff6b6b;font-family:var(--mono);">LOTADO</span>':'',
      '</div>',
      '<div style="font-size:0.7rem;color:var(--muted);font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:320px;" title="',eqEsc(url),'">',eqEsc(url),'</div>',
      '</div>',
      '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">',
      '<button onclick="rlCopiarLink(\''+url.replace(/'/g,"\\'")+'\',this)" style="padding:0.42rem 0.8rem;background:rgba(124,106,247,0.1);border:1px solid rgba(124,106,247,0.2);border-radius:6px;color:var(--accent);font-size:0.78rem;font-weight:600;cursor:pointer;">Copiar</button>',
      '<button onclick="rlVerResultados(\''+lk.token+'\',\''+(_RL_NOMES[lk.matriz]||lk.matriz).replace(/'/g,"\\'")+( lk.etiqueta?' — '+lk.etiqueta.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;'):''  )+'\') " style="padding:0.42rem 0.8rem;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:6px;color:var(--muted);font-size:0.78rem;cursor:pointer;">Ver resultados (',lk.completion_count,')</button>',
      '</div></div>',
    ].join('');
  }).join('');
}

function rlRenderListaFull(links) {
  const el = document.getElementById('rl-lista-full');
  if (!el) return;
  const renderables = (links || []).filter(function(lk){ return lk.matriz; });
  console.debug('[rl] rlRenderListaFull → total =', (links||[]).length, '| com matriz =', renderables.length);
  if (!links || !links.length) {
    el.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--muted);font-size:0.85rem;">Nenhum link gerado ainda.<br><button onclick="rlSwitchTab(\'gerar\')" style="margin-top:0.75rem;padding:0.5rem 1.1rem;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit;">+ Gerar primeiro link</button></div>';
    return;
  }
  const origin = window.location.origin;
  el.innerHTML = links.filter(function(lk){return lk.matriz;}).map(function(lk) {
    const url   = origin + '/api/r?token=' + lk.token;
    const full  = lk.completion_count >= lk.max_completions;
    const pct   = lk.max_completions >= 9999 ? null : Math.min(100, Math.round((lk.completion_count / lk.max_completions) * 100));
    const dt    = lk.created_at ? new Date(lk.created_at).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '';
    const etiq  = lk.etiqueta ? eqEsc(lk.etiqueta) : '';
    const esc_token = lk.token.replace(/'/g,"\\'");
    const tituloModal = (_RL_NOMES[lk.matriz]||lk.matriz).replace(/'/g,"\\'")+( lk.etiqueta ? ' — '+lk.etiqueta.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;') : '');
    return [
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.1rem 1.25rem;margin-bottom:0.65rem;">',

      // Linha 1 — matriz + etiqueta + status + data
      '<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.6rem;">',
      '<span style="font-size:0.7rem;font-family:var(--mono);background:rgba(124,106,247,0.12);color:var(--accent);padding:0.12rem 0.55rem;border-radius:4px;text-transform:uppercase;font-weight:700;">',(_RL_NOMES[lk.matriz]||lk.matriz),'</span>',
      etiq ? '<span style="font-size:0.82rem;color:var(--text);font-weight:600;">'+etiq+'</span>' : '',
      full ? '<span style="font-size:0.65rem;color:#ff6b6b;background:rgba(255,107,107,0.1);padding:0.1rem 0.45rem;border-radius:4px;font-family:var(--mono);">LOTADO</span>'
           : '<span style="font-size:0.65rem;color:#2EC4A0;background:rgba(46,196,160,0.08);padding:0.1rem 0.45rem;border-radius:4px;font-family:var(--mono);">ATIVO</span>',
      '<span style="flex:1"></span>',
      dt ? '<span style="font-size:0.65rem;color:var(--muted);font-family:var(--mono);">'+dt+'</span>' : '',
      '</div>',

      // Linha 2 — URL copiável
      '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">',
      '<div style="flex:1;min-width:0;font-size:0.7rem;font-family:monospace;color:var(--muted);background:rgba(0,0,0,0.2);padding:0.4rem 0.65rem;border-radius:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="',eqEsc(url),'">',eqEsc(url),'</div>',
      '<button onclick="rlCopiarLink(\''+url.replace(/'/g,"\\'")+'\',this)" style="flex-shrink:0;padding:0.38rem 0.75rem;background:rgba(124,106,247,0.1);border:1px solid rgba(124,106,247,0.25);border-radius:6px;color:var(--accent);font-size:0.75rem;font-weight:600;cursor:pointer;white-space:nowrap;">Copiar</button>',
      '</div>',

      // Linha 3 — barra de progresso + botões
      '<div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">',
      pct !== null ? [
        '<div style="flex:1;min-width:80px;">',
        '<div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--muted);margin-bottom:0.25rem;font-family:var(--mono);">',
        '<span>Respostas</span><span>',lk.completion_count,'/',lk.max_completions,'</span></div>',
        '<div style="height:4px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;">',
        '<div style="height:100%;width:'+pct+'%;background:'+(full?'#ff6b6b':'var(--accent)')+';border-radius:2px;transition:width 0.6s;"></div>',
        '</div></div>',
      ].join('') : '<span style="font-size:0.72rem;color:var(--muted);font-family:var(--mono);">'+lk.completion_count+' respostas</span>',
      '<div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-left:auto;">',
      '<button onclick="rlVerResultados(\''+esc_token+'\',\''+tituloModal+'\')" style="padding:0.38rem 0.75rem;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:6px;color:var(--muted);font-size:0.75rem;cursor:pointer;" onmouseover="this.style.color=\'var(--text)\'" onmouseout="this.style.color=\'var(--muted)\'">Ver resultados ('+lk.completion_count+')</button>',
      '<button onclick="rlDeletarLink(\''+esc_token+'\')" style="padding:0.38rem 0.6rem;background:rgba(224,82,82,0.06);border:1px solid rgba(224,82,82,0.2);border-radius:6px;color:rgba(224,82,82,0.7);font-size:0.75rem;cursor:pointer;" onmouseover="this.style.color=\'#e05252\';this.style.borderColor=\'rgba(224,82,82,0.5)\'" onmouseout="this.style.color=\'rgba(224,82,82,0.7)\';this.style.borderColor=\'rgba(224,82,82,0.2)\'">Deletar</button>',
      '</div></div>',

      '</div>',
    ].join('');
  }).join('');
}

async function rlDeletarLink(token) {
  if (!confirm('Deletar este link? Os resultados já coletados também serão removidos.')) return;
  const { error } = await capsulaDB.deleteRemoteLink(token);
  if (error) { alert('Erro ao deletar: ' + (error.message || JSON.stringify(error))); return; }
  rlCarregarLinks(true);
}

async function rlCopiarLink(url, btnEl) {
  try {
    await navigator.clipboard.writeText(url);
    const orig = btnEl.textContent;
    btnEl.textContent = '✓ Copiado!';
    btnEl.style.color = 'var(--S)';
    setTimeout(function() { btnEl.textContent = orig; btnEl.style.color = ''; }, 2200);
  } catch(e) {
    prompt('Copie o link abaixo:', url);
  }
}

async function rlVerResultados(token, titulo) {
  const modal  = document.getElementById('rl-results-modal');
  const bodyEl = document.getElementById('rl-modal-results');
  document.getElementById('rl-modal-title').textContent = titulo;
  bodyEl.innerHTML = '<div style="text-align:center;color:var(--muted);padding:1.5rem;">Carregando...</div>';
  modal.style.display = 'flex';

  const results = await capsulaDB.getRemoteResults(token);
  if (!results || !results.length) {
    bodyEl.innerHTML = '<div style="text-align:center;color:var(--muted);padding:1.5rem;font-size:0.85rem;">Nenhum resultado ainda.</div>';
    return;
  }
  bodyEl.innerHTML = results.map(function(r) {
    const dt = new Date(r.completed_at).toLocaleString('pt-BR');
    const preview = (r.resultado && r.resultado.texto)
      ? r.resultado.texto.substring(0, 500) + (r.resultado.texto.length > 500 ? '…' : '')
      : '';
    return [
      '<div style="border:1px solid var(--border);border-radius:8px;padding:1rem 1.1rem;margin-bottom:0.65rem;">',
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:', preview?'0.6rem':'0', ';">',
      '<div><span style="font-weight:600;font-size:0.9rem;color:var(--text);">', eqEsc(r.respondente_nome), '</span>',
      r.respondente_email ? '<span style="font-size:0.76rem;color:var(--muted);margin-left:0.5rem;">' + eqEsc(r.respondente_email) + '</span>' : '',
      '</div>',
      '<span style="font-size:0.68rem;color:var(--muted);font-family:monospace;white-space:nowrap;margin-left:0.5rem;">', dt, '</span>',
      '</div>',
      preview ? '<div style="font-size:0.78rem;color:rgba(232,232,240,0.55);white-space:pre-wrap;max-height:110px;overflow-y:auto;background:rgba(0,0,0,0.25);padding:0.6rem 0.75rem;border-radius:6px;font-family:monospace;line-height:1.5;">' + preview.replace(/</g,'&lt;') + '</div>' : '',
      '</div>',
    ].join('');
  }).join('');
}

function rlFecharResultados() {
  document.getElementById('rl-results-modal').style.display = 'none';
}

// ── Aba "Respondentes" — agrega TODOS os resultados de TODOS os links ──
async function rlCarregarRespondentes(force) {
  if (!_rlProEmail) return;
  const el = document.getElementById('rl-respondentes-list');
  if (!el) return;
  if (force) el.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--muted);font-size:0.85rem;">Carregando...</div>';

  const links = await capsulaDB.getMyRemoteLinks(_rlProEmail) || [];
  if (!links.length) {
    el.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--muted);font-size:0.85rem;">Nenhum link gerado ainda.<br><button onclick="rlSwitchTab(\'gerar\')" style="margin-top:0.75rem;padding:0.5rem 1.1rem;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit;">+ Gerar primeiro link</button></div>';
    return;
  }

  const arrays = await Promise.all(links.map(function (l) {
    return capsulaDB.getRemoteResults(l.token).then(function (rs) {
      return (rs || []).map(function (r) {
        return Object.assign({}, r, { _matriz: l.matriz, _etiqueta: l.etiqueta || '', _token: l.token });
      });
    });
  }));
  const todos = (arrays.flat ? arrays.flat() : [].concat.apply([], arrays))
    .sort(function (a, b) { return (b.completed_at || '').localeCompare(a.completed_at || ''); });

  if (!todos.length) {
    el.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--muted);font-size:0.85rem;">Nenhum respondente ainda.<br><span style="font-size:0.75rem;">Compartilhe um link da aba <strong style="color:var(--text)">Meus links</strong> para começar a coletar respostas.</span></div>';
    rlMarcarRespondentesVistos(todos);
    return;
  }

  // Marca o timestamp do mais recente como "visto" e zera badge
  const lastSeenKey = _rlLastSeenKey();
  const prevLastSeen = localStorage.getItem(lastSeenKey) || '';

  el.innerHTML = todos.map(function (r) {
    const dt = new Date(r.completed_at).toLocaleString('pt-BR');
    const matrizNome = _RL_NOMES[r._matriz] || r._matriz;
    const isNovo = (r.completed_at || '') > prevLastSeen;
    const preview = (r.resultado && r.resultado.texto)
      ? r.resultado.texto.substring(0, 240) + (r.resultado.texto.length > 240 ? '…' : '')
      : '';
    return [
      '<div style="border:1px solid ', isNovo ? 'rgba(232,96,58,0.4)' : 'var(--border)', ';',
      'border-radius:10px;padding:1rem 1.15rem;margin-bottom:0.65rem;background:', isNovo ? 'rgba(232,96,58,0.04)' : 'transparent', ';">',
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;margin-bottom:', preview ? '0.65rem' : '0', ';flex-wrap:wrap;">',
      '<div style="flex:1;min-width:0;">',
      isNovo ? '<span style="display:inline-block;background:#E8603A;color:#fff;font-size:0.6rem;font-weight:700;padding:0.1rem 0.45rem;border-radius:10px;margin-right:0.5rem;font-family:var(--mono);text-transform:uppercase;letter-spacing:0.06em;">NOVO</span>' : '',
      '<span style="font-weight:600;font-size:0.92rem;color:var(--text);">', eqEsc(r.respondente_nome || '—'), '</span>',
      r.respondente_email ? '<div style="font-size:0.74rem;color:var(--muted);margin-top:0.15rem;">' + eqEsc(r.respondente_email) + '</div>' : '',
      '</div>',
      '<div style="text-align:right;flex-shrink:0;">',
      '<div style="display:inline-flex;align-items:center;gap:0.4rem;font-size:0.7rem;color:var(--accent);background:rgba(124,106,247,0.1);border:1px solid rgba(124,106,247,0.25);padding:0.2rem 0.55rem;border-radius:6px;font-family:var(--mono);">',
      eqEsc(matrizNome),
      r._etiqueta ? '<span style="color:var(--muted);">· ' + eqEsc(r._etiqueta) + '</span>' : '',
      '</div>',
      '<div style="font-size:0.66rem;color:var(--muted);font-family:monospace;margin-top:0.3rem;">', dt, '</div>',
      '</div>',
      '</div>',
      preview ? '<div style="font-size:0.78rem;color:rgba(232,232,240,0.55);white-space:pre-wrap;max-height:90px;overflow-y:auto;background:rgba(0,0,0,0.25);padding:0.55rem 0.75rem;border-radius:6px;font-family:monospace;line-height:1.5;">' + preview.replace(/</g,'&lt;') + '</div>' : '',
      '</div>',
    ].join('');
  }).join('');

  rlMarcarRespondentesVistos(todos);
}

function rlMarcarRespondentesVistos(todos) {
  if (!todos || !todos.length) return;
  // Persiste o completed_at máximo como "última visita"
  let max = '';
  for (let i = 0; i < todos.length; i++) {
    const t = todos[i].completed_at || '';
    if (t > max) max = t;
  }
  if (max) {
    try { localStorage.setItem(_rlLastSeenKey(), max); } catch (_) {}
  }
  const badge = document.getElementById('rl-novos-badge');
  if (badge) badge.style.display = 'none';
}


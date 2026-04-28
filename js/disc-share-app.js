const PROFILES = {
  D: { title:'O Executor', code:'Dominância', color:'#E8603A', archetype:'Perfil <strong>Dominante</strong> — orientado a resultados e liderança direta', traits:['Decidido','Competitivo','Direto','Corajoso','Independente','Orientado a metas'] },
  I: { title:'O Catalisador', code:'Influência', color:'#6C5FE6', archetype:'Perfil <strong>Influente</strong> — conectado, entusiasmado e persuasivo', traits:['Comunicativo','Entusiasmado','Persuasivo','Criativo','Otimista','Social'] },
  S: { title:'O Guardião', code:'Estabilidade', color:'#2EC4A0', archetype:'Perfil <strong>Estável</strong> — confiável, paciente e orientado ao grupo', traits:['Leal','Paciente','Confiável','Empático','Consistente','Colaborativo'] },
  C: { title:'O Analista', code:'Conformidade', color:'#1BA8D4', archetype:'Perfil <strong>Conformista</strong> — analítico, preciso e orientado à qualidade', traits:['Analítico','Preciso','Lógico','Organizado','Criterioso','Detalhista'] },
};
const LABELS = { D:'Dominância', I:'Influência', S:'Estabilidade', C:'Conformidade' };
const COLORS = { D:'#E8603A', I:'#6C5FE6', S:'#2EC4A0', C:'#1BA8D4' };

(function init() {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('d');
    if (!raw) throw new Error('no data');

    const json = atob(raw.replace(/-/g,'+').replace(/_/g,'/'));
    const data = JSON.parse(json);

    const { dominant, scores, completedAt, name } = data;
    if (!dominant || !scores) throw new Error('invalid');

    const profile = PROFILES[dominant];
    if (!profile) throw new Error('invalid profile');

    // Title
    document.getElementById('s-dot').textContent = dominant;
    document.getElementById('s-dot').style.background = profile.color;
    document.getElementById('s-title').textContent = (name ? name + ' — ' : '') + profile.title;
    document.getElementById('s-code').textContent = profile.code + ' · ' + (scores[dominant] || 0) + '%';

    // Scores
    const sg = document.getElementById('s-scores');
    ['D','I','S','C'].forEach(k => {
      const pct = Math.max(0, Math.min(100, Number(scores[k]) || 0));
      const item = document.createElement('div');
      item.className = 'score-item';
      item.innerHTML = `<div class="score-label">${LABELS[k]}</div>
        <div class="score-bar-wrap">
          <div class="score-bar"><div class="score-fill" style="width:${pct}%;background:${COLORS[k]};"></div></div>
          <span class="score-val" style="color:${COLORS[k]}">${pct}%</span>
        </div>`;
      sg.appendChild(item);
    });

    // Archetype
    document.getElementById('s-archetype').innerHTML = profile.archetype;

    // Traits
    const tr = document.getElementById('s-traits');
    profile.traits.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'trait-chip';
      chip.textContent = t;
      chip.style.borderColor = profile.color + '40';
      chip.style.color = profile.color;
      tr.appendChild(chip);
    });

    // Date
    if (completedAt) {
      const d = new Date(completedAt);
      document.getElementById('s-date').textContent = 'Realizado em ' + d.toLocaleDateString('pt-BR');
    }

    document.getElementById('result-card').style.display = 'block';
  } catch(e) {
    document.getElementById('error-state').style.display = 'block';
  }
})();
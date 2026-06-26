// ══════════════════════════════════════
// ENEAGRAMA — 9 tipos × 4 questões = 36 perguntas
// Mede afinidade com cada tipo no Eneagrama clássico.
// IMPORTANTE: este teste NÃO cruza com outros (DISC, BigFive, etc).
// Apenas o DNA Estratégico faz integração entre matrizes.
// ══════════════════════════════════════

let _autoAdvance;

// 36 questões — 4 por tipo (1..9), embaralhadas em blocos de 9 (uma de cada tipo por rodada)
const QUESTIONS = [
  // RODADA 1
  { type: 1, text: 'Tenho um padrão interno muito alto — percebo erros e imperfeições que outros ignoram.' },
  { type: 2, text: 'Costumo antecipar as necessidades das pessoas próximas e ofereço ajuda antes mesmo de me pedirem.' },
  { type: 3, text: 'Sou movido por metas e gosto de ser visto como alguém bem-sucedido no que faço.' },
  { type: 4, text: 'Sinto-me diferente da maioria das pessoas — busco autenticidade e identidade própria.' },
  { type: 5, text: 'Preciso de tempo sozinho para processar o mundo e recuperar energia.' },
  { type: 6, text: 'Costumo pensar nos cenários que podem dar errado antes de tomar uma decisão importante.' },
  { type: 7, text: 'Tenho muita curiosidade e me empolgo facilmente com novas ideias, lugares e experiências.' },
  { type: 8, text: 'Tenho presença forte — defendo o que penso e não me intimido com confronto.' },
  { type: 9, text: 'Prezo pela harmonia e prefiro ceder a entrar em discussão direta.' },

  // RODADA 2
  { type: 1, text: 'Sinto desconforto interno quando algo está fora do lugar ou contra os meus princípios.' },
  { type: 2, text: 'É difícil para mim pedir ajuda — prefiro ser a pessoa que ajuda os outros.' },
  { type: 3, text: 'Adapto minha imagem ao contexto para passar a melhor impressão possível em cada ambiente.' },
  { type: 4, text: 'Tenho consciência aguçada das minhas emoções — sinto tudo com profundidade e nuance.' },
  { type: 5, text: 'Antes de me posicionar, preciso entender o assunto a fundo e ter dados suficientes.' },
  { type: 6, text: 'Confio mais em pessoas e instituições que já provaram lealdade ao longo do tempo.' },
  { type: 7, text: 'Tenho dificuldade de focar em uma coisa só — minha mente já está pulando para a próxima.' },
  { type: 8, text: 'Protejo as pessoas mais fracas ou injustiçadas, mesmo que isso me coloque em conflito.' },
  { type: 9, text: 'Esqueço facilmente do que EU quero quando estou em grupo — vou na corrente.' },

  // RODADA 3
  { type: 1, text: 'Tenho uma voz crítica interna constante — ela me cobra mais do que qualquer pessoa externa.' },
  { type: 2, text: 'Sinto-me valorizado quando sou indispensável para alguém — preciso me sentir necessário.' },
  { type: 3, text: 'Tenho dificuldade de parar — quando paro, sinto que perco valor ou identidade.' },
  { type: 4, text: 'Sinto, com frequência, que falta algo em mim ou na minha vida que os outros parecem ter.' },
  { type: 5, text: 'Preservo minha energia e meu tempo com muito cuidado — sinto-me invadido quando demandam demais.' },
  { type: 6, text: 'Costumo procurar uma figura ou sistema de autoridade no qual posso me apoiar.' },
  { type: 7, text: 'Evito sentimentos pesados ou tristes — busco rapidamente algo que me anime de novo.' },
  { type: 8, text: 'Não tolero ser controlado ou manipulado — minha autonomia é inegociável.' },
  { type: 9, text: 'Procrastino tarefas que exigem confronto, decisão dura ou que me tirem da zona de conforto.' },

  // RODADA 4
  { type: 1, text: 'Reprimo impulsos e desejos que considero "errados" — vivo segundo o que deveria ser.' },
  { type: 2, text: 'Posso me ressentir silenciosamente quando dou muito e não recebo o reconhecimento esperado.' },
  { type: 3, text: 'Tenho dificuldade em conectar com o que realmente sinto — penso mais no que devo demonstrar.' },
  { type: 4, text: 'Idealizo o que está distante e desvalorizo o que já tenho — sempre falta algo.' },
  { type: 5, text: 'Acumulo conhecimento como forma de me sentir seguro — saber é minha defesa.' },
  { type: 6, text: 'Oscilo entre confiar demais e desconfiar de tudo — minha mente busca segurança o tempo todo.' },
  { type: 7, text: 'Tenho dificuldade em finalizar projetos — começar é fácil, terminar é tedioso.' },
  { type: 8, text: 'Mostro força mesmo quando estou vulnerável — não gosto que vejam minha fragilidade.' },
  { type: 9, text: 'Tenho dificuldade em identificar e expressar minha raiva — costumo só perceber depois.' },
];

const SCALE_HINTS = [
  'Não me descreve nada',
  'Me descreve pouco',
  'Me descreve em parte',
  'Me descreve bem',
  'Me descreve completamente',
];

// ══════════════════════════════════════
// PERFIS — 9 tipos
// Cada perfil tem: title, code, color, gradient, archetype, traits,
//                  strengths (fortalezas), challenges (fraquezas/sombras),
//                  recommendations (o que pode ser feito — caminho de crescimento),
//                  environment, communication
// Nenhum perfil menciona outros testes (DISC, SOAR, etc).
// ══════════════════════════════════════
const PROFILES = {
  1: {
    title: 'O Perfeccionista',
    code: 'Tipo 1 · Reformador',
    color: '#E8603A',
    gradient: 'linear-gradient(90deg, #E8603A, #F4845F)',
    archetype: 'Perfil <strong>Reformador</strong> — guiado por princípios, busca melhorar o mundo e a si mesmo',
    traits: ['Íntegro', 'Disciplinado', 'Crítico', 'Ético', 'Responsável', 'Idealista'],
    strengths: 'Você é uma pessoa de princípios — confiável, organizada e comprometida com o certo. Tem padrões altos, percebe falhas que outros não veem e luta por melhorias reais. Sua disciplina inspira respeito.',
    challenges: 'A voz crítica interna pode virar tirana — gerando exaustão, irritação reprimida e perfeccionismo paralisante. Você tende a julgar duramente a si e aos outros, e pode reprimir desejos legítimos achando que são "errados".',
    recommendations: 'Pratique reconhecer que "bom o suficiente" também é válido. Identifique uma área onde você se permitirá errar. Trabalhe a raiva reprimida — ela existe, e negar só a torna mais corrosiva. Crie momentos de prazer sem culpa: lazer não é fraqueza, é nutrição.',
    environment: 'Ambientes com padrões claros de qualidade, propósito ético e autonomia para fazer o trabalho bem feito. Sofre em culturas caóticas ou que priorizam aparência sobre substância.',
    communication: 'Receba bem feedback estruturado e baseado em fatos. Evite ironias ou ataques pessoais — eles te ferem mais que o normal. Reconheça o esforço, não só o resultado.',
  },
  2: {
    title: 'O Prestativo',
    code: 'Tipo 2 · Ajudador',
    color: '#F4845F',
    gradient: 'linear-gradient(90deg, #F4845F, #F2C14E)',
    archetype: 'Perfil <strong>Ajudador</strong> — sintonizado com as necessidades dos outros, generoso e relacional',
    traits: ['Empático', 'Generoso', 'Caloroso', 'Atento', 'Carismático', 'Servidor'],
    strengths: 'Você sente o que os outros precisam antes mesmo deles perceberem. Cria laços profundos, é o pilar emocional de muitas pessoas e tem dom genuíno para servir. Sua presença aquece os ambientes.',
    challenges: 'Você tende a se perder na vida dos outros e esquecer de si. Pode manipular sutilmente para se sentir indispensável, e acumular ressentimento quando o cuidado dado não é retribuído. Tem dificuldade em pedir ajuda — vê isso como fraqueza.',
    recommendations: 'Pergunte-se diariamente: "O que EU quero, sem pensar em mais ninguém?" Pratique receber sem retribuir imediatamente. Pratique dizer NÃO sem justificar excessivamente. Identifique se você ajuda por amor ou por necessidade de ser amado — isso muda tudo.',
    environment: 'Ambientes humanos, com vínculos próximos e reconhecimento afetivo. Adoece em culturas frias, transacionais ou que ignoram o lado emocional do trabalho.',
    communication: 'Reconheça o que essa pessoa faz por você de forma explícita e específica. Pergunte como ELA está antes de pedir algo. Evite tratá-la como recurso utilitário.',
  },
  3: {
    title: 'O Realizador',
    code: 'Tipo 3 · Performer',
    color: '#F2C14E',
    gradient: 'linear-gradient(90deg, #F2C14E, #9D7FE8)',
    archetype: 'Perfil <strong>Realizador</strong> — orientado a conquistas, imagem e eficiência',
    traits: ['Ambicioso', 'Eficiente', 'Carismático', 'Adaptável', 'Pragmático', 'Comunicativo'],
    strengths: 'Você entrega como ninguém. Sabe vender ideias, adaptar imagem ao contexto, e transformar visão em resultado concreto. É a pessoa que faz acontecer — sob pressão, em prazo, com qualidade.',
    challenges: 'Você corre o risco de virar a sua função — sem performance, quem você é? Tende a esconder ou silenciar emoções inconvenientes, e a confundir o que você projeta com o que sente. Pode entrar em burnout sem nem perceber.',
    recommendations: 'Reserve tempo de não-produtividade absoluta (sem celular, sem to-do). Pratique mostrar-se vulnerável para pessoas seguras — emoção verdadeira não te diminui. Pergunte-se: "Estou fazendo isso porque quero, ou porque vai parecer bem?" Falhe propositalmente em algo baixo risco — você não morre.',
    environment: 'Ambientes meritocráticos, com metas claras e reconhecimento de performance. Sofre em culturas burocráticas, lentas ou que recompensem por tempo de casa em vez de entrega.',
    communication: 'Vá direto ao ponto, reconheça resultados concretos, dê visibilidade. Evite críticas em público — preserva a imagem. Diferencie a pessoa do desempenho ao dar feedback.',
  },
  4: {
    title: 'O Individualista',
    code: 'Tipo 4 · Romântico',
    color: '#9D7FE8',
    gradient: 'linear-gradient(90deg, #9D7FE8, #6C5FE6)',
    archetype: 'Perfil <strong>Romântico</strong> — profundo, sensível, em busca de autenticidade e significado',
    traits: ['Sensível', 'Criativo', 'Autêntico', 'Introspectivo', 'Estético', 'Expressivo'],
    strengths: 'Você sente o mundo com profundidade rara. É capaz de gerar arte, beleza e verdades emocionais que outros nem percebem. Sua autenticidade é magnética — você não suporta o superficial e isso te diferencia.',
    challenges: 'Você tende a idealizar o que não tem e desvalorizar o que tem (o "vazio" como obsessão). Pode se afundar em melancolia ou drama interno, e se sentir incompreendido cronicamente — alimentando a sensação de ser "especial demais para este mundo".',
    recommendations: 'Pratique gratidão por coisas comuns — alimenta a parte sua que vê falta o tempo todo. Crie rotina e disciplina (sim, mesmo achando tedioso) — estabilidade é solo para a sensibilidade florescer sem te quebrar. Compartilhe sua arte/sentimento concretamente, não só internalize. Cuidado com a dependência da intensidade emocional.',
    environment: 'Ambientes que valorizem expressão pessoal, propósito e profundidade. Sofre em culturas padronizadas, impessoais ou que tratem pessoas como peças intercambiáveis.',
    communication: 'Demonstre interesse genuíno pelo mundo interno dessa pessoa. Não despreze a emoção dela como "exagero". Evite comparações superficiais — elas ferem mais que críticas.',
  },
  5: {
    title: 'O Investigador',
    code: 'Tipo 5 · Observador',
    color: '#6C5FE6',
    gradient: 'linear-gradient(90deg, #6C5FE6, #1BA8D4)',
    archetype: 'Perfil <strong>Investigador</strong> — pensador profundo, autossuficiente, guardião do próprio espaço',
    traits: ['Analítico', 'Curioso', 'Independente', 'Reservado', 'Profundo', 'Observador'],
    strengths: 'Você pensa onde os outros só reagem. Constrói expertise real, vê padrões complexos e mantém autonomia mesmo em ambientes caóticos. É a pessoa que entrega análise que sustenta decisões importantes.',
    challenges: 'Você tende a se isolar para preservar energia — e acabar viciado em retração. Pode acumular saber sem aplicar, evitar emoções tratando-as como desordenadas, e se distanciar das pessoas mesmo desejando proximidade. Avareza de tempo e energia vira solidão.',
    recommendations: 'Pratique se expor antes de sentir-se 100% preparado — perfeição é desculpa pra não aparecer. Aceite convites sociais mesmo quando preferiria recuar — você sempre pode sair antes. Pratique sentir antes de analisar o sentir. Compartilhe o que sabe — conhecimento guardado não rende.',
    environment: 'Ambientes com tempo de concentração protegido, espaço físico e mental, e respeito pela autonomia. Sofre em culturas de open-office barulhento, reuniões constantes e demandas urgentes desnecessárias.',
    communication: 'Marque encontros com pauta e horário definido — não invada. Dê tempo para resposta — não cobre reação imediata. Mensagens curtas e diretas, sem rodeios afetivos.',
  },
  6: {
    title: 'O Leal',
    code: 'Tipo 6 · Lealista',
    color: '#1BA8D4',
    gradient: 'linear-gradient(90deg, #1BA8D4, #4FC9A0)',
    archetype: 'Perfil <strong>Lealista</strong> — comprometido, vigilante, busca segurança e confiança',
    traits: ['Leal', 'Responsável', 'Cauteloso', 'Comprometido', 'Solidário', 'Antecipador'],
    strengths: 'Você antecipa o que pode dar errado e prepara o time para isso. É leal, persistente, e cria laços de confiança que duram décadas. Em crise, é a pessoa que aparece — não some quando aperta.',
    challenges: 'Sua mente vive em loops de "e se?" — ansiedade vira combustível e prisão. Você pode oscilar entre confiar demais (e idealizar autoridade) e desconfiar de tudo. Tende a procrastinar decisões por medo do erro, e a se autosabotar pra evitar visibilidade.',
    recommendations: 'Pratique agir com 70% de informação — esperar 100% é desculpa do medo. Identifique se a ameaça que sua mente está construindo é real ou imaginária — escreva isso no papel. Confie no próprio julgamento antes de buscar autoridade externa. Pratique tomar UMA decisão por dia sem consultar ninguém.',
    environment: 'Ambientes previsíveis, com regras claras, lideranças confiáveis e cultura de proteção mútua. Sofre em culturas politicamente instáveis, com mudanças bruscas ou lideranças erráticas.',
    communication: 'Seja consistente entre o que diz e o que faz — incoerência te derruba. Antecipe mudanças com aviso prévio. Reconheça contribuições explicitamente — você duvida do próprio valor.',
  },
  7: {
    title: 'O Entusiasta',
    code: 'Tipo 7 · Aventureiro',
    color: '#4FC9A0',
    gradient: 'linear-gradient(90deg, #4FC9A0, #2EC4A0)',
    archetype: 'Perfil <strong>Aventureiro</strong> — multifacetado, otimista, em busca de experiência e possibilidade',
    traits: ['Curioso', 'Otimista', 'Versátil', 'Inovador', 'Espontâneo', 'Inspirador'],
    strengths: 'Você vê possibilidade onde os outros veem limite. Energiza ambientes, conecta ideias díspares e mantém moral alto mesmo na adversidade. É o motor criativo que abre caminhos.',
    challenges: 'Você foge da dor — começa muitos projetos e termina poucos, e usa estímulo (viagem, comida, planos) pra evitar emoções pesadas. Pode parecer superficial ou inconstante, e ter dificuldade real com compromissos de longo prazo. Vício em planejar o próximo prazer.',
    recommendations: 'Pratique ficar com o desconforto sem buscar distração — sente, respira, espera. Escolha UM projeto e termine antes de começar outro — finalizar é mais difícil que começar, e mais transformador. Crie disciplina em uma área pequena (ex: meditação 10min/dia). Pergunte-se: "estou fugindo de algo agora?"',
    environment: 'Ambientes variados, com liberdade criativa, novidade frequente e propósito amplo. Sofre em culturas repetitivas, microgerenciadas ou de processos rígidos sem espaço pra experimentar.',
    communication: 'Apresente ideias com energia e variedade — você perde gente no monocórdico. Permita brainstorm aberto antes de focar. Lembre prazos concretos sem ser carrasco — você esquece, não desrespeita.',
  },
  8: {
    title: 'O Desafiador',
    code: 'Tipo 8 · Protetor',
    color: '#2EC4A0',
    gradient: 'linear-gradient(90deg, #2EC4A0, #8FA88A)',
    archetype: 'Perfil <strong>Protetor</strong> — forte, direto, defensor dos seus e dos vulneráveis',
    traits: ['Decidido', 'Protetor', 'Intenso', 'Justo', 'Direto', 'Corajoso'],
    strengths: 'Você assume o que ninguém quer assumir. É direto, protege os seus com ferocidade, e enfrenta autoridade quando ela está errada. Em crise, é a pessoa que segura a estrutura.',
    challenges: 'Sua intensidade pode atropelar pessoas mais sensíveis. Você tende a esconder vulnerabilidade até de si — vê fraqueza como ameaça. Pode confundir confronto com afeto e ser injusto em momentos de raiva. Excesso em tudo: trabalho, comida, conflito.',
    recommendations: 'Pratique mostrar vulnerabilidade pra UMA pessoa de confiança — é o passo mais difícil e o mais transformador. Antes de responder com força, pergunte: "isso é necessário ou é defesa automática?" Pratique escuta sem interromper. Reconheça o impacto que seu poder tem — peso de ser intenso é peso pros outros também.',
    environment: 'Ambientes diretos, com pessoas que sustentam confronto saudável e não se intimidam fácil. Sofre em culturas passivo-agressivas, políticas demais ou onde tem que medir cada palavra.',
    communication: 'Vá direto — rodeio te irrita. Diga o que pensa sem medo, mas firme em fatos. Reconheça quando você está certo (você gosta de ser justo). Não tente manipular — você sente na hora.',
  },
  9: {
    title: 'O Pacificador',
    code: 'Tipo 9 · Mediador',
    color: '#8FA88A',
    gradient: 'linear-gradient(90deg, #8FA88A, #E8603A)',
    archetype: 'Perfil <strong>Mediador</strong> — harmonizador natural, presença que acalma, dom para enxergar todos os lados',
    traits: ['Calmo', 'Receptivo', 'Empático', 'Mediador', 'Estável', 'Acolhedor'],
    strengths: 'Sua presença acalma sem esforço. Você consegue ver todos os lados de um conflito e mediar sem tomar partido. Cria espaços onde pessoas diferentes coexistem em paz — é raro e valioso.',
    challenges: 'Você se "esquece" de si pra manter a paz — adia sua agenda, suas opiniões, seus desejos. Tende a procrastinar o que importa, evita confronto até virar passivo-agressividade, e a raiva fica reprimida por anos. Pode sumir dentro da própria vida.',
    recommendations: 'Reserve 15min/dia pra perguntar: "o que EU quero hoje?" — sem filtro. Pratique discordar verbalmente quando discorda — mesmo de coisas pequenas. Identifique UMA tarefa importante que você adia e a faça primeiro do dia. Honre sua raiva — ela carrega informação sobre o que você valoriza.',
    environment: 'Ambientes estáveis, com vínculos longos, ritmo previsível e cultura de respeito mútuo. Sofre em ambientes conflituosos crônicos, com pressão constante ou que exijam autopromoção agressiva.',
    communication: 'Dê tempo pra processar antes de pedir resposta. Pergunte o que essa pessoa quer (ela não vai oferecer espontaneamente). Faça pedidos concretos — vagueza vira fuga. Reconheça o que ela faz silenciosamente.',
  },
};

// ══════════════════════════════════════
// STATE
// ══════════════════════════════════════
let currentQ   = 0;
let answers    = new Array(QUESTIONS.length).fill(null);
let scores     = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
let _isLoadingExisting = false;

// ══════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function startQuiz() {
  if (window.gnosisTrack) gnosisTrack('quiz_started', { matriz: 'eneagrama' });
  if (window.gnosisQuizSave) {
    const saved = gnosisQuizSave.restore('eneagrama');
    if (saved && saved.state && Array.isArray(saved.state.answers)) {
      const answered = saved.state.answers.filter(a => a !== null).length;
      if (answered > 0 && answered < QUESTIONS.length) {
        gnosisQuizSave.promptResume({
          matriz: 'eneagrama', label: 'Eneagrama',
          summary: answered + ' de ' + QUESTIONS.length + ' perguntas respondidas',
          onResume: function () {
            answers = saved.state.answers.slice();
            currentQ = typeof saved.state.currentQ === 'number' ? saved.state.currentQ : answered;
            if (currentQ >= QUESTIONS.length) currentQ = QUESTIONS.length - 1;
            showPage('page-quiz'); renderQuestion(currentQ);
          },
          onRestart: function () {
            currentQ = 0; answers = new Array(QUESTIONS.length).fill(null);
            showPage('page-quiz'); renderQuestion(0);
          },
        });
        return;
      }
    }
  }
  currentQ = 0;
  answers  = new Array(QUESTIONS.length).fill(null);
  showPage('page-quiz');
  renderQuestion(0);
}

function goBack() {
  if (currentQ === 0) {
    showPage('page-intro');
  } else {
    currentQ--;
    renderQuestion(currentQ);
  }
}

// ══════════════════════════════════════
// RENDER QUESTION
// ══════════════════════════════════════
function renderQuestion(idx) {
  const q   = QUESTIONS[idx];
  const profile = PROFILES[q.type];
  const pct = Math.round((idx / QUESTIONS.length) * 100);

  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('q-counter').textContent = `${idx + 1} de ${QUESTIONS.length}`;

  const card = document.getElementById('question-card');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = '';

  const selected = answers[idx];
  const color = profile.color;

  card.innerHTML = `
    <div class="q-category" style="--q-color:${color}; color:${color}; background:${color}18; border-color:${color}40;">
      <span class="q-dot" style="background:${color};box-shadow:0 0 6px ${color}"></span>
      Tipo ${q.type} · ${profile.title.replace('O ', '').replace('A ', '')}
    </div>
    <div class="question-text">${q.text}</div>
    <div class="scale-wrap">
      <div class="scale-labels">
        <span>Não me descreve</span>
        <span>Me descreve muito</span>
      </div>
      <div class="scale-buttons" style="--q-color:${color}" role="radiogroup" aria-label="Avalie de 1 (não me descreve) a 5 (me descreve muito)">
        ${[1,2,3,4,5].map(v => `
          <button
            class="scale-btn ${selected === v ? 'selected' : ''}"
            data-val="${v}"
            style="--q-color:${color}"
            onclick="selectAnswer(${idx}, ${v})"
            title="${SCALE_HINTS[v-1]}"
            role="radio"
            aria-checked="${selected === v ? 'true' : 'false'}"
            aria-label="Nota ${v} de 5"
          ></button>
        `).join('')}
      </div>
      <div class="scale-hint" id="scale-hint" aria-live="polite">
        ${selected ? SCALE_HINTS[selected - 1] : 'Selecione uma opção para continuar'}
      </div>
    </div>
    <div class="quiz-actions">
      <button
        class="btn-next ${selected !== null ? 'ready' : ''}"
        style="background:${color}; box-shadow:0 0 20px ${color}40"
        id="btn-next"
        onclick="nextQuestion()"
      >
        ${idx === QUESTIONS.length - 1 ? 'Ver meu resultado →' : 'Próxima →'}
      </button>
    </div>
  `;
}

// ══════════════════════════════════════
// SELECT ANSWER
// ══════════════════════════════════════
function selectAnswer(idx, val) {
  answers[idx] = val;
  if (window.gnosisQuizSave) gnosisQuizSave.save('eneagrama', { answers: answers, currentQ: idx });
  document.querySelectorAll('.scale-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.scale-btn[data-val="${val}"]`).classList.add('selected');
  document.getElementById('scale-hint').textContent = SCALE_HINTS[val - 1];
  const btn = document.getElementById('btn-next');
  if (btn) btn.classList.add('ready');
  clearTimeout(_autoAdvance);
  _autoAdvance = setTimeout(() => nextQuestion(), 650);
}

// ══════════════════════════════════════
// NEXT QUESTION
// ══════════════════════════════════════
function nextQuestion() {
  if (answers[currentQ] === null) return;
  currentQ++;
  if (currentQ >= QUESTIONS.length) {
    calculateResults();
    return;
  }
  renderQuestion(currentQ);
}

// ══════════════════════════════════════
// CALCULATE RESULTS
// ══════════════════════════════════════
function calculateResults() {
  if (window.gnosisQuizSave) gnosisQuizSave.clear('eneagrama');
  if (window.gnosisTrack) gnosisTrack('quiz_completed', { matriz: 'eneagrama' });
  scores = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
  QUESTIONS.forEach((q, i) => {
    const val = answers[i] || 3;
    scores[q.type] += val;
  });
  // Normaliza para 0-100 (4 perguntas × 5 pontos = 20 max por tipo)
  const maxPossible = 4 * 5;
  Object.keys(scores).forEach(k => {
    scores[k] = Math.round((scores[k] / maxPossible) * 100);
  });
  showResult();
}

// ══════════════════════════════════════
// SHOW RESULT
// ══════════════════════════════════════
async function showResult() {
  showPage('page-result');

  // Tipo dominante (maior pontuação)
  const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const profile  = PROFILES[dominant];

  document.getElementById('result-title').textContent    = profile.title;
  document.getElementById('result-archetype').innerHTML  = profile.archetype;
  document.getElementById('dna-card').style.setProperty('--result-gradient', profile.gradient);

  // BARS — ordenadas por pontuação descendente
  const barsEl = document.getElementById('disc-bars');
  const order  = Object.entries(scores).sort((a,b) => b[1]-a[1]);
  barsEl.innerHTML = order.map(([type, pct]) => {
    const p = PROFILES[type];
    return `
    <div class="bar-row">
      <span class="bar-letter" style="color:${p.color}">${type}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:0%; background:${p.color}; box-shadow:0 0 8px ${p.color};" data-pct="${pct}"></div>
      </div>
      <span class="bar-pct">${pct}%</span>
    </div>
    `;
  }).join('');

  setTimeout(() => {
    document.querySelectorAll('.bar-fill').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  }, 100);

  // TRAITS
  const traitsEl = document.getElementById('traits-wrap');
  traitsEl.innerHTML = profile.traits.map(t => `
    <span class="trait-tag" style="--tag-color:${profile.color}">${t}</span>
  `).join('');

  // PROFILE BLOCKS — 4 blocos: Fortalezas, Fraquezas/Atenção, Recomendações, Ambiente Ideal
  document.getElementById('profile-grid').innerHTML = `
    <div class="profile-block">
      <h4>💪 Fortalezas</h4>
      <p>${profile.strengths}</p>
    </div>
    <div class="profile-block">
      <h4>⚡ Fraquezas / Atenção</h4>
      <p>${profile.challenges}</p>
    </div>
    <div class="profile-block">
      <h4>🎯 O que pode ser feito</h4>
      <p>${profile.recommendations}</p>
    </div>
    <div class="profile-block">
      <h4>🏗️ Ambiente Ideal</h4>
      <p>${profile.environment}</p>
    </div>
  `;

  // PERSISTÊNCIA
  const _rawUser = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user') || '{}';
  const userData = JSON.parse(_rawUser);
  if (!userData.uid) {
    userData.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  if (!_isLoadingExisting) {
    const nowISO = new Date().toISOString();
    const prevHistory = (userData.eneagrama && Array.isArray(userData.eneagrama.history)) ? userData.eneagrama.history : [];
    const historyEntry = { dominant, scores: Object.assign({}, scores), completedAt: nowISO };
    const newHistory = [...prevHistory, historyEntry].slice(-10);
    userData.eneagrama = { dominant, scores, completedAt: nowISO, history: newHistory };
    capsulaDB.lsSetUser(userData);
    try { sessionStorage.setItem('capsula_user', JSON.stringify(userData)); } catch(_) {}

    await saveResultToSupabase(userData);

    // Sincroniza no array capsula_users[]
    try {
      const perfis = capsulaDB.lsGetUsers();
      const idx = perfis.findIndex(function(p) { return p.uid === userData.uid; });
      if (idx >= 0) {
        perfis[idx].eneagrama = userData.eneagrama;
        capsulaDB.lsSetUsers(perfis);
      }
    } catch(e) { /* silencioso */ }
  }

  // Bloco "E agora?" — compartilhar + próximo teste recomendado
  if (window.gnosisPostResult) {
    window.gnosisPostResult.render({
      fromKey: 'eneagrama',
      resultLabel: profile.title + ' (Tipo ' + dominant + ')',
      resultDetail: scores[dominant] + '%',
      containerId: 'page-result',
    });
  }
}

// ══════════════════════════════════════
// SUPABASE SYNC
// ══════════════════════════════════════
function getNomeExibido(userData) {
  if (!userData) return 'Usuário';
  if (userData.apelido && userData.apelido.trim()) return userData.apelido.trim();
  if (userData.nome && userData.nome.trim()) return userData.nome.trim();
  return 'Usuário';
}

async function saveResultToSupabase(userData) {
  try {
    if (!userData || !userData.email) {
      setSyncStatus('Salvo localmente ✓');
      return;
    }
    let hasSession = false;
    try {
      const { session } = await capsulaDB.authGetSession();
      hasSession = !!(session && session.user && session.user.email);
      if (hasSession && session.user.email.toLowerCase() !== userData.email.toLowerCase()) {
        setSyncStatus('Salvo localmente ✓');
        return;
      }
    } catch (e) { /* silencioso */ }

    if (!hasSession) {
      setSyncStatus('Salvo localmente ✓ (faça login pra sincronizar)');
      return;
    }
    const { error } = await capsulaDB.saveUser(userData);
    if (error && error !== 'offline') {
      const msg = error.message || JSON.stringify(error);
      if (msg.includes('permission') || error.code === '42501' || error.code === 'PGRST301') {
        setSyncStatus('Salvo localmente ✓ (sessão expirada — faça login)', true);
      } else {
        setSyncStatus('Erro ao sincronizar (resultado salvo localmente)', true);
      }
    } else {
      setSyncStatus('Resultado sincronizado ✓');
    }
  } catch (err) {
    if (window.capsulaUI) window.capsulaUI.toast('Erro ao salvar. Tente novamente.','error');
    setSyncStatus('Salvo localmente ✓ (erro de conexão)', true);
  }
}

function setSyncStatus(msg, isError) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  el.textContent = msg;
  el.style.color   = isError ? 'var(--danger, #e24b4a)' : 'var(--muted, #666)';
  el.style.opacity = '1';
  if (!isError) setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

// ══════════════════════════════════════
// ONBOARDING
// ══════════════════════════════════════
const OB_KEY = 'capsula_onboarding_done_eneagrama';

function obInit() {
  const _raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user');
  const _uid = _raw ? (JSON.parse(_raw).uid || '') : '';
  const _key = OB_KEY + (_uid ? '_' + _uid : '');
  const done = localStorage.getItem(_key);
  if (!done) document.getElementById('onboarding-overlay').classList.add('show');
}

function obNext(step) {
  document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`ob-step-${step}`).classList.add('active');
}

function obFinish() {
  const _raw = localStorage.getItem('capsula_user') || sessionStorage.getItem('capsula_user');
  const _uid = _raw ? (JSON.parse(_raw).uid || '') : '';
  const _key = OB_KEY + (_uid ? '_' + _uid : '');
  localStorage.setItem(_key, '1');
  document.getElementById('onboarding-overlay').classList.remove('show');
}

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
async function initPage() {
  let userData = null;
  try { userData = await capsulaDB.ensureUserData(); } catch(_) {}

  function _findEneagrama() {
    try {
      const u = capsulaDB.lsGetUser() || {};
      const sessionEmail = userData && userData.email ? userData.email.toLowerCase() : null;
      if (!sessionEmail) return null;
      if (u.email && u.email.toLowerCase() !== sessionEmail) return null;
      if (u.eneagrama && u.eneagrama.completedAt && u.eneagrama.scores) return u.eneagrama;
    } catch(_) {}
    return null;
  }

  const _saved = _findEneagrama();
  if (_saved) {
    scores = _saved.scores;
    _isLoadingExisting = true;
    showPage('page-result');
    showResult();
    return;
  }

  if (!userData) {
    window.location.href = 'index.html';
    return;
  }

  if (!userData.uid) {
    userData.uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    try { capsulaDB.lsSetUser(userData); } catch(_) {}
  }

  if (!localStorage.getItem('capsula_user') && sessionStorage.getItem('capsula_user')) {
    capsulaDB.lsSetRaw('capsula_user', sessionStorage.getItem('capsula_user'));
  }

  const nome = getNomeExibido(userData);
  const greeting = document.getElementById('eneagrama-greeting');
  if (greeting) {
    greeting.style.display = 'block';
    const span = greeting.querySelector('.js-user-name');
    if (span) span.textContent = nome;
  }

  obInit();
}

document.addEventListener('DOMContentLoaded', initPage);

// ══════════════════════════════════════
// GENERATE PDF — Eneagrama
// ══════════════════════════════════════
function generatePDF() {
  if (window._payments) {
    _payments.serverDebitCredit('eneagrama').then(function(ok) {
      if (!ok) { _payments.showPaywall('eneagrama'); return; }
      _generatePDFEneagrama();
    });
    return;
  }
  _generatePDFEneagrama();
}

function _generatePDFEneagrama() {
  const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const profile  = PROFILES[dominant];
  const user     = (capsulaDB.lsGetUser() || {});
  const nome     = getNomeExibido(user);
  const data     = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
  const sortedTypes = Object.keys(scores).sort((a,b) => (scores[b]||0) - (scores[a]||0));

  // Ranking dos 9 tipos como bloco custom (não cabe no dim-card padrão)
  const rankingHTML = '<div style="display:grid;gap:6px;">'
    + sortedTypes.map((t, i) => {
        const p = PROFILES[t];
        const pct = scores[t] || 0;
        const name = (p.title || '').replace(/^[OA] /, '');
        return '<div style="display:grid;grid-template-columns:24px 32px 1fr 100px 36px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #f4f4f5;">'
          + '<span style="font-family:IBM Plex Mono,monospace;font-size:10px;color:#a1a1aa;">'+String(i+1).padStart(2,'0')+'</span>'
          + '<div style="width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;background:#f4f4f5;border:1px solid #e4e4e7;font-family:IBM Plex Mono,monospace;font-size:11px;font-weight:600;color:#52525b;">'+t+'</div>'
          + '<span style="font-size:12px;font-weight:600;color:#18181b;">'+name+'</span>'
          + '<div style="height:5px;background:#f4f4f5;border-radius:3px;overflow:hidden;"><div style="width:'+pct+'%;height:100%;background:#a1a1aa;border-radius:3px;"></div></div>'
          + '<span style="font-family:IBM Plex Mono,monospace;font-size:11px;color:#52525b;text-align:right;">'+pct+'%</span>'
          + '</div>';
      }).join('')
    + '</div>';

  const customSection = '<div style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:0.12em;color:#7C6FF7;text-transform:uppercase;font-weight:500;margin-bottom:12px;">Ranking dos 9 tipos</div>' + rankingHTML;

  Gnosis.pdf.render({
    matrizName: 'Eneagrama',
    matrizSubname: 'Tipologia profunda',
    userName: nome,
    date: data,
    hero: {
      letter: dominant,
      eyebrow: 'Tipo Dominante',
      title: profile.title,
      subtitle: (profile.archetype || '').replace(/<\/?strong>/g,''),
    },
    analysisLabel: 'Análise do tipo dominante',
    analysisBlocks: [
      { eyebrow: 'Fortalezas',                title: 'O que te coloca em vantagem',  text: profile.strengths },
      { eyebrow: 'Pontos de atenção',         title: 'O que pode atrapalhar',        text: profile.challenges },
      { eyebrow: 'Caminho de crescimento',    title: 'O que pode ser feito',         text: profile.recommendations || '—' },
      { eyebrow: 'Ambiente ideal',            title: 'Onde você floresce',           text: profile.environment },
      { eyebrow: 'Como se comunicar',         title: 'Falar com este tipo',          text: profile.communication },
    ],
    customSection: customSection,
    citation: 'Riso, D. R., &amp; Hudson, R. (1999). <em>The Wisdom of the Enneagram.</em>',
    filename: 'eneagrama-resultado.html',
  });
}

// ══════════════════════════════════════
// SHARE
// ══════════════════════════════════════
function shareResult() {
  const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const profile  = PROFILES[dominant];
  const text = `Meu tipo no Eneagrama é ${profile.title} (Tipo ${dominant} - ${scores[dominant]}%) — Sistema Gnosis: www.sistema-gnosis.com.br`;
  if (navigator.share) {
    navigator.share({ title: 'Meu Tipo no Eneagrama', text, url: 'https://www.sistema-gnosis.com.br/eneagrama.html' });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showCopyToast('Resultado copiado!'));
  }
}

function showCopyToast(msg) {
  let t = document.getElementById('_copy-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_copy-toast';
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:var(--surface2,#1e1e1e);border:1px solid var(--border2,#333);border-radius:8px;padding:0.75rem 1.1rem;font-size:0.82rem;color:var(--text,#fff);z-index:9999;opacity:0;transform:translateY(12px);transition:opacity 0.25s,transform 0.25s;pointer-events:none;';
    document.body.appendChild(t);
  }
  t.textContent = '✓  ' + msg;
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(12px)'; }, 2800);
}

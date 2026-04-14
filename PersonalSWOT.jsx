import { useState, useEffect } from "react";

// ─── Paleta & estilos globais ────────────────────────────────────────────────
const COLORS = {
  strength:    { bg: "#0f2027", accent: "#00d4aa", label: "Forças",       icon: "⚡" },
  weakness:    { bg: "#1a0a2e", accent: "#a855f7", label: "Fraquezas",    icon: "🔍" },
  opportunity: { bg: "#0a1628", accent: "#3b82f6", label: "Oportunidades",icon: "🚀" },
  threat:      { bg: "#1f0a0a", accent: "#ef4444", label: "Ameaças",      icon: "⚠️" },
};

const QUADRANT_ORDER = ["strength", "weakness", "opportunity", "threat"];

// ─── Dados mock dos testes anteriores (viriam do Supabase / props) ───────────
const MOCK_TEST_RESULTS = {
  disc: { D: 82, I: 45, S: 30, C: 60, dominant: "D" },
  ocean: { O: 70, C: 55, E: 40, A: 65, N: 35 },
  soar: { strengths: ["Liderança", "Visão Estratégica"], opportunities: ["Mercado digital", "Networking"] },
};

// ─── Gerador de sugestões inteligentes baseado nos testes ───────────────────
function generateSmartSuggestions(tests) {
  const suggestions = { strength: [], weakness: [], opportunity: [], threat: [] };
  if (!tests) return suggestions;

  const { disc, ocean } = tests;

  // DISC → Forças e Fraquezas
  if (disc?.dominant === "D") {
    suggestions.strength.push("Tomada de decisão rápida e assertiva");
    suggestions.strength.push("Alta capacidade de liderança em situações de pressão");
    suggestions.weakness.push("Pode parecer impaciente ou autoritário(a) em equipe");
  }
  if (disc?.I > 60) {
    suggestions.strength.push("Habilidade de comunicação e influência interpessoal");
    suggestions.opportunity.push("Cargos de vendas, marketing ou representação");
  }
  if (disc?.C > 65) {
    suggestions.strength.push("Atenção a detalhes e precisão analítica");
    suggestions.weakness.push("Tendência à paralisia por análise excessiva");
  }

  // OCEAN → camadas mais profundas
  if (ocean?.O > 65)  suggestions.strength.push("Criatividade e abertura a novas ideias");
  if (ocean?.C > 60)  suggestions.strength.push("Disciplina e organização para entregar resultados");
  if (ocean?.N > 60)  suggestions.weakness.push("Sensibilidade emocional em ambientes de alta pressão");
  if (ocean?.E < 40)  suggestions.weakness.push("Dificuldade em ambientes muito colaborativos e sociais");
  if (ocean?.A > 70)  suggestions.opportunity.push("Papéis de mediação, RH ou gestão de pessoas");

  // Oportunidades genéricas de mercado
  suggestions.opportunity.push("Crescimento do mercado de inteligência artificial");
  suggestions.opportunity.push("Demanda por profissionais com visão estratégica + dados");

  // Ameaças
  suggestions.threat.push("Automação de funções operacionais pelo mercado");
  suggestions.threat.push("Concorrência crescente em mercados digitais");

  return suggestions;
}

// ─── Quadrante individual ───────────────────────────────────────────────────
function Quadrant({ type, items, onAdd, onRemove, suggestions, showSuggestions }) {
  const [input, setInput] = useState("");
  const cfg = COLORS[type];

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInput("");
  };

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.accent}33`,
      borderRadius: 16,
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      minHeight: 280,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{cfg.icon}</span>
        <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: cfg.accent, letterSpacing: 1, textTransform: "uppercase" }}>
          {cfg.label}
        </span>
        <span style={{ marginLeft: "auto", background: cfg.accent + "22", color: cfg.accent, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
          {items.length}
        </span>
      </div>

      {/* Itens */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: "#ffffff0a",
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}>
            <span style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.4 }}>{item}</span>
            <button onClick={() => onRemove(i)} style={{
              background: "none", border: "none", color: "#ffffff44", cursor: "pointer",
              fontSize: 16, padding: "0 2px", lineHeight: 1,
            }}>×</button>
          </div>
        ))}

        {/* Sugestões inteligentes */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <p style={{ fontSize: 11, color: "#ffffff44", marginBottom: 6, fontStyle: "italic" }}>
              💡 Sugestões baseadas nos seus testes:
            </p>
            {suggestions.filter(s => !items.includes(s)).slice(0, 3).map((s, i) => (
              <button key={i} onClick={() => onAdd(s)} style={{
                display: "block", width: "100%", textAlign: "left",
                background: cfg.accent + "11", border: `1px dashed ${cfg.accent}55`,
                borderRadius: 8, padding: "6px 10px", marginBottom: 5,
                color: cfg.accent + "cc", fontSize: 12, cursor: "pointer",
              }}>
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder={`Adicionar ${cfg.label.toLowerCase()}...`}
          style={{
            flex: 1, background: "#ffffff0d", border: `1px solid ${cfg.accent}33`,
            borderRadius: 8, padding: "8px 12px", color: "#e2e8f0",
            fontSize: 13, outline: "none",
          }}
        />
        <button onClick={handleAdd} style={{
          background: cfg.accent, border: "none", borderRadius: 8,
          color: "#fff", fontWeight: 700, padding: "8px 14px", cursor: "pointer",
          fontSize: 16,
        }}>+</button>
      </div>
    </div>
  );
}

// ─── Matriz de Confronto ─────────────────────────────────────────────────────
function ConfrontMatrix({ swot }) {
  const { strength, weakness, opportunity, threat } = swot;
  if (!strength.length && !opportunity.length) return null;

  const strategies = [];

  strength.slice(0, 2).forEach(s => {
    opportunity.slice(0, 2).forEach(o => {
      strategies.push({
        type: "ofensiva",
        color: "#00d4aa",
        icon: "🎯",
        label: "Estratégia Ofensiva",
        text: `Use "${s}" para aproveitar "${o}"`,
      });
    });
  });

  strength.slice(0, 1).forEach(s => {
    threat.slice(0, 2).forEach(t => {
      strategies.push({
        type: "defensiva",
        color: "#3b82f6",
        icon: "🛡️",
        label: "Estratégia Defensiva",
        text: `Aplique "${s}" para neutralizar "${t}"`,
      });
    });
  });

  weakness.slice(0, 1).forEach(w => {
    opportunity.slice(0, 1).forEach(o => {
      strategies.push({
        type: "crescimento",
        color: "#a855f7",
        icon: "📈",
        label: "Área de Crescimento",
        text: `Desenvolver "${w}" para capturar "${o}"`,
      });
    });
  });

  if (!strategies.length) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontFamily: "'Sora', sans-serif", color: "#e2e8f0", fontSize: 16, marginBottom: 16, letterSpacing: 0.5 }}>
        ⚙️ Matriz de Confronto — Insights Automáticos
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {strategies.map((s, i) => (
          <div key={i} style={{
            background: s.color + "11",
            border: `1px solid ${s.color}33`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              {s.icon} {s.label}
            </div>
            <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5, margin: 0 }}>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function PersonalSWOT({ testResults = MOCK_TEST_RESULTS }) {
  const suggestions = generateSmartSuggestions(testResults);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [swot, setSwot] = useState({ strength: [], weakness: [], opportunity: [], threat: [] });
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [tab, setTab] = useState("matrix"); // "matrix" | "analysis"

  const addItem = (type, text) =>
    setSwot(prev => ({ ...prev, [type]: [...prev[type], text] }));

  const removeItem = (type, idx) =>
    setSwot(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== idx) }));

  const totalItems = Object.values(swot).flat().length;

  async function generateAIAnalysis() {
    setLoadingAI(true);
    setTab("analysis");
    try {
      const prompt = `Você é um especialista em desenvolvimento de carreira. 
      Analise a SWOT pessoal abaixo e forneça uma análise profissional detalhada com:
      1. Diagnóstico do perfil profissional atual
      2. Três caminhos de carreira recomendados com base na SWOT
      3. Plano de ação em 90 dias com passos concretos
      4. Alertas importantes sobre as ameaças identificadas

      SWOT do usuário:
      Forças: ${swot.strength.join(", ") || "Não informado"}
      Fraquezas: ${swot.weakness.join(", ") || "Não informado"}
      Oportunidades: ${swot.opportunity.join(", ") || "Não informado"}
      Ameaças: ${swot.threat.join(", ") || "Não informado"}
      
      Perfil DISC: Dominância ${testResults?.disc?.D}%, Influência ${testResults?.disc?.I}%, Steadiness ${testResults?.disc?.S}%, Conscienciosidade ${testResults?.disc?.C}%
      Perfil OCEAN: Abertura ${testResults?.ocean?.O}, Conscienciosidade ${testResults?.ocean?.C}, Extroversão ${testResults?.ocean?.E}, Agradabilidade ${testResults?.ocean?.A}, Neuroticismo ${testResults?.ocean?.N}

      Responda em português brasileiro de forma direta, prática e motivadora. Use emojis estrategicamente.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("\n") || "Não foi possível gerar análise.";
      setAiAnalysis(text);
    } catch (e) {
      setAiAnalysis("Erro ao gerar análise. Verifique sua conexão com a API.");
    }
    setLoadingAI(false);
  }

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: "#080d14",
      minHeight: "100vh",
      padding: "32px 24px",
      color: "#e2e8f0",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #ffffff22; border-radius: 3px; }
        input::placeholder { color: #ffffff33; }
        input:focus { border-color: currentColor !important; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 960, margin: "0 auto 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
              Diagnóstico Profissional
            </p>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, background: "linear-gradient(90deg, #00d4aa, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Sua SWOT Pessoal
            </h1>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
              Baseada nos seus resultados de DISC + OCEAN + SOAR
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setShowSuggestions(p => !p)} style={{
              background: "#ffffff0d", border: "1px solid #ffffff1a",
              borderRadius: 8, padding: "8px 14px", color: "#94a3b8",
              fontSize: 13, cursor: "pointer",
            }}>
              {showSuggestions ? "🙈 Ocultar sugestões" : "💡 Ver sugestões"}
            </button>
            <button
              onClick={generateAIAnalysis}
              disabled={totalItems < 2 || loadingAI}
              style={{
                background: totalItems < 2 ? "#ffffff11" : "linear-gradient(135deg, #00d4aa, #3b82f6)",
                border: "none", borderRadius: 8, padding: "8px 18px",
                color: totalItems < 2 ? "#ffffff44" : "#fff",
                fontSize: 13, fontWeight: 700, cursor: totalItems < 2 ? "not-allowed" : "pointer",
              }}
            >
              {loadingAI ? "⏳ Analisando..." : "✨ Gerar Análise IA"}
            </button>
          </div>
        </div>

        {/* Abas */}
        <div style={{ display: "flex", gap: 4, marginTop: 24, borderBottom: "1px solid #ffffff11", paddingBottom: 0 }}>
          {[{ key: "matrix", label: "📊 Matriz SWOT" }, { key: "analysis", label: "🤖 Análise IA" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: "none", border: "none",
              padding: "8px 16px", fontSize: 13, cursor: "pointer",
              color: tab === t.key ? "#00d4aa" : "#64748b",
              fontWeight: tab === t.key ? 700 : 400,
              borderBottom: tab === t.key ? "2px solid #00d4aa" : "2px solid transparent",
              marginBottom: -1,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Tab: Matriz */}
        {tab === "matrix" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {QUADRANT_ORDER.map(type => (
                <Quadrant
                  key={type}
                  type={type}
                  items={swot[type]}
                  onAdd={text => addItem(type, text)}
                  onRemove={idx => removeItem(type, idx)}
                  suggestions={suggestions[type]}
                  showSuggestions={showSuggestions}
                />
              ))}
            </div>

            {/* Barra de progresso */}
            <div style={{ marginTop: 24, background: "#ffffff0a", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Completude da SWOT</span>
                <span style={{ fontSize: 12, color: "#00d4aa", fontWeight: 700 }}>{totalItems} itens</span>
              </div>
              <div style={{ background: "#ffffff0d", borderRadius: 999, height: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(100, totalItems * 8)}%`,
                  background: "linear-gradient(90deg, #00d4aa, #3b82f6)",
                  borderRadius: 999,
                  transition: "width 0.4s ease",
                }} />
              </div>
              {totalItems < 2 && (
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                  Adicione ao menos 2 itens para desbloquear a análise IA ✨
                </p>
              )}
            </div>

            <ConfrontMatrix swot={swot} />
          </>
        )}

        {/* Tab: Análise IA */}
        {tab === "analysis" && (
          <div style={{ background: "#0d1520", border: "1px solid #ffffff0f", borderRadius: 16, padding: 28, minHeight: 300 }}>
            {!aiAnalysis && !loadingAI && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <p style={{ fontSize: 40, marginBottom: 16 }}>🤖</p>
                <p style={{ color: "#64748b", fontSize: 14 }}>
                  Preencha sua SWOT e clique em "Gerar Análise IA" para receber<br />
                  um diagnóstico profissional personalizado.
                </p>
              </div>
            )}
            {loadingAI && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{
                  width: 40, height: 40, border: "3px solid #00d4aa33",
                  borderTop: "3px solid #00d4aa", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: "#64748b", fontSize: 14 }}>Analisando seu perfil completo...</p>
              </div>
            )}
            {aiAnalysis && !loadingAI && (
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 14, color: "#cbd5e1" }}>
                {aiAnalysis}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

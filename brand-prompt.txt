# Sistema Gnosis — Guia pra gerar logo via IA

Arquivo de referência pra criar logos profissionais usando ferramentas de IA generativa (DALL-E, Midjourney, Recraft, etc).

---

## 1. Identidade visual atual (pra usar nos prompts)

| Atributo | Valor |
|---|---|
| **Nome** | Sistema Gnosis |
| **Categoria** | Plataforma profissional de matrizes psicométricas |
| **ICP** | Coaches, RH, líderes, psicólogos org, indivíduos que buscam autoconhecimento |
| **Posicionamento** | Desenvolvimento pessoal + gestão de equipes, com método científico |
| **Slogan** | Descubra, Domine e Lidere |

### Paleta de cores

| Cor | Hex | Uso |
|---|---|---|
| **Preto profundo (BG)** | `#0A0A0F` | Fundo principal do site |
| **Roxo accent (primário)** | `#7C6FF7` | Botões, destaques, links |
| **Verde sucesso/Pro** | `#2EC4A0` | Plano Gerencial, sucesso |
| **Laranja DISC D** | `#E8603A` | Acentuação secundária |
| **Azul DISC C** | `#1BA8D4` | Detalhes técnicos |
| **Branco texto** | `#E8E8F0` | Textos primários |

**Gradiente principal:** `#7C6FF7 → #2EC4A0` (roxo → verde)

### Tipografia
- **Serif (display):** DM Serif Display — usada em headlines e logo
- **Sans (corpo):** Outfit — botões, navegação, corpo
- **Mono (labels):** Space Mono — labels técnicos, código

### Referências estéticas
- Linear (geometria clean, dark mode)
- Stripe (gradient suave, premium)
- Notion (símbolo abstrato + tipografia limpa)
- Vercel (triangulação minimalista)
- Brilliant.org (geometria + rigor científico)

---

## 2. Logo atual no ar

Arquivos disponíveis:
- `logo-gnosis.svg` — vetorial (768 B)
- `logo-gnosis-512.png` — alta resolução (24 KB)
- `logo-gnosis-256.png` — média (10 KB)
- `logo-gnosis-180.png` — apple-touch-icon (5 KB)

**Concept atual:** anel circular com gradiente roxo→verde, gap à direita formando um "G" geométrico, barra horizontal branca interna (similar ao apple-touch-icon legado, adaptado de C pra G).

Acesse em: `https://www.sistema-gnosis.com.br/logo-gnosis-512.png`

---

## 3. Prompt master pra IA

### Versão em inglês (mais eficaz nas IAs)

```
Minimalist logo design for "Sistema Gnosis" — a professional psychometric
assessment platform for personal development and team management.

Style: editorial dark-mode tech aesthetic, similar to Linear, Stripe, or
Notion. Clean geometric symbol, no taglines, no shadows.

Concept: monogram letter "G" interpreted as a geometric system — could be
an abstract glyph suggesting matrix, network, compass, eye of clarity, or
spiral of self-knowledge. Avoid: clichés like brain, lightbulb, gears,
puzzle pieces, or generic mandalas.

Color palette:
- Background: deep black #0A0A0F (rounded square or transparent)
- Primary gradient: purple #7C6FF7 → teal-green #2EC4A0
- Accent: white #FFFFFF (used sparingly for contrast)

Composition:
- Square format 1:1, 1024x1024 px
- Centered glyph occupies 65–75% of canvas
- Generous breathing room
- Sharp, vectorial-looking lines (not painterly)
- Single layer of meaning — readable at 32x32 px

Mood: serious, methodical, premium, slightly mysterious. Conveys
authority of science (psychometrics) without coldness — there should
be a hint of warmth or human curve.

Reference vibes: Linear app icon, Vercel triangle, Stripe gradient,
Brilliant.org star, occult-but-rigorous like Carl Jung archetype
diagrams reimagined for software.

Output: PNG with transparent background OR with the dark rounded square.
```

### Versão curta em português (fallback)

```
Logo minimalista pro "Sistema Gnosis", plataforma profissional de matrizes
psicométricas (DISC, Big Five, Ikigai). Símbolo geométrico abstrato,
estilo editorial dark-mode tipo Linear/Stripe. Letra G monograma OU
símbolo conceitual de "sistema/matriz/clareza".

Paleta: fundo preto #0A0A0F, gradiente roxo #7C6FF7 → verde #2EC4A0,
detalhes em branco. Formato quadrado 1:1, sem texto, sem sombras.
Sério, premium, científico mas com toque humano. Legível em 32x32 px.

Evitar: cérebro, lâmpada, engrenagens, quebra-cabeça, mandalas genéricas.
```

---

## 4. Variações de conceito (substitua o "Concept:" do prompt master)

### A. Monogram G geométrico

> *"Concept: stylized letter 'G' formed by a single continuous curve that loops back into itself, like a Möbius strip. The horizontal bar of the G suggests measurement, calibration, or a benchmark line."*

### B. Hexágono + bússola

> *"Concept: hexagonal frame containing a minimal compass needle at the center, pointing slightly off-vertical. The needle gradient and hexagon outline use the same gradient. Suggests system + direction."*

### C. Constelação humana (9 matrizes)

> *"Concept: 9 small dots arranged in a constellation that subtly suggests the silhouette of a human profile or the letter G. The 9 dots represent the 9 psychometric matrices. Connect 3 of them with thin gradient lines."*

### D. Iris / olho geométrico

> *"Concept: geometric iris — concentric octagonal rings with a small bright pupil at center. Conveys 'seeing yourself clearly' without being cliché. Each ring slightly thinner than the outer one."*

### E. Espiral DNA

> *"Concept: minimalist double-helix forming a vertical 'G' shape, with two strands crossing 3 times. Suggests transformation, system, code-of-self. Gradient flowing from top (purple) to bottom (teal)."*

### F. Nó górdio / trança modular

> *"Concept: a knot made of 3 interlocking ribbons that form an implicit G outline. Each ribbon uses a slightly different shade of the gradient. Suggests interconnected dimensions of personality."*

### G. Hexágono de matriz (DISC inspired)

> *"Concept: 4 connected hexagonal cells in a 2x2 grid, each with a single dot in the center. Mimics a Punnett square or psychometric matrix. The whole arrangement reads as a stylized G when viewed at small sizes."*

---

## 5. Ferramentas recomendadas

| Ferramenta | Free tier | Por que usar | Link |
|---|---|---|---|
| **Recraft.ai** ⭐ | 50/mês | Gera **SVG editável** direto. Ideal pra logo. | https://www.recraft.ai |
| **Ideogram.ai** | 40/dia | Excelente em prompts PT-BR; entende texto dentro de logos | https://ideogram.ai |
| **Adobe Firefly** | 25 créditos/mês | Vetorial, integra com Illustrator | https://firefly.adobe.com |
| **DALL-E 3 (ChatGPT Plus)** | $20/mês | Melhor compreensão de prompt detalhado | https://chatgpt.com |
| **Midjourney** | trial limitado | Estética refinada, exige iteração | https://midjourney.com |
| **Looka.com** | demo | Gerador específico pra logo (sai "marca pronta") | https://looka.com |

**Recomendação top 1:** **Recraft.ai** — gratuito, gera SVG (editável depois no Figma/Illustrator), e o resultado costuma ficar limpo e profissional.

**Recomendação top 2:** **Ideogram** — funciona bem em PT-BR, free tier generoso.

---

## 6. Passo a passo

### Pra gerar

1. Abrir a ferramenta escolhida (recomendo **Recraft.ai**)
2. Copiar o **prompt master em inglês** (seção 3 deste arquivo)
3. Gerar **3-5 variações**
4. Se nenhuma agradar, trocar o "Concept:" por uma das 7 variações (seção 4)
5. Iterar 2-3 vezes ajustando palavras como "minimal", "geometric", "futuristic", "vintage"

### Pra aplicar no site

Quando tiver um logo que aprovar, mandar o PNG/SVG pro Claude que ele aplica em 1 commit:

- Substitui `logo-gnosis.svg` + `.png` (todas as resoluções)
- Atualiza `apple-touch-icon.png` (favicon do iPhone)
- Atualiza `favicon.svg` (aba do navegador)
- Atualiza meta `og:image` em swot.html (e talvez outras se necessário)
- Atualiza no **Google OAuth Consent Screen** (instruções abaixo)

### Pra usar no Google Cloud Console

1. Abrir https://console.cloud.google.com
2. Selecionar o projeto do Sistema Gnosis
3. **APIs & Services** → **OAuth consent screen** → **Edit App**
4. Campo **"App logo"** → fazer upload do PNG 512×512
5. Outros campos sugeridos:
   - **App name:** `Sistema Gnosis`
   - **User support email:** `suporte@sistema-gnosis.com.br`
   - **Application home page:** `https://www.sistema-gnosis.com.br`
   - **Privacy policy link:** `https://www.sistema-gnosis.com.br/privacidade.html`
   - **Terms of service link:** `https://www.sistema-gnosis.com.br/termos.html`
   - **Authorized domains:** `sistema-gnosis.com.br`
   - **Developer contact email:** `daniloluis05@gmail.com`
6. **Save**

---

## 7. Checklist de qualidade (antes de aprovar)

- [ ] **Legível em 32×32 px** (zoom out na tela pra ver)
- [ ] **Funciona em fundo claro E escuro** (testa)
- [ ] **Sem texto/tagline** dentro do logo (deixar pro nome separado)
- [ ] **Não usa clichês** (cérebro, lâmpada, engrenagem, mandala genérica)
- [ ] **Coerente com a paleta** do site
- [ ] **Carrega sentido** (não é só decoração — sugere "sistema/clareza/mapa")
- [ ] **Vetorial** (SVG editável > PNG fixo)
- [ ] **Único** (não é template óbvio do Looka/Canva)

---

## 8. Variações que provavelmente vão funcionar bem

Baseado na identidade do Sistema Gnosis, **3 caminhos** prometem mais:

1. **Monograma G** (Variação A) — direto, escalável, fácil de aplicar
2. **Constelação humana** (C) — emocional, conta história das 9 matrizes
3. **Iris/olho geométrico** (D) — alude a autoconhecimento sem ser místico

Os outros (hexágono, espiral, nó) são bons mas mais arriscados — podem dar resultados genéricos.

---

**Atualizado em:** 2026-05-11
**Logo atual:** `logo-gnosis.svg` (G geométrico baseado no apple-touch-icon legado)

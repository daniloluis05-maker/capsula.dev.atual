# Handoff Sistema Gnosis — Estado Completo

**Última atualização**: 2026-05-06
**Branch atual**: `main` em `6c3fb7b`
**Domínio canônico**: `https://www.sistema-gnosis.com.br`

> Este documento é um snapshot do projeto pra retomar trabalho em outra
> conversa sem perder contexto. Leia top-down para entender o estado atual,
> o que foi feito recentemente, e o que ainda falta.

---

## 1. TL;DR — Estado atual

### ✅ Tudo funcionando
- Site no ar em `https://www.sistema-gnosis.com.br` (HTTPS Vercel, HSTS 2 anos)
- Apex `sistema-gnosis.com.br` faz 307 → www
- Vercel preview `capsula-dev-atualizado.vercel.app` continua respondendo (mesmo deploy)
- Pagamentos integrados (MP + Stripe), webhooks fail-closed e idempotentes
- 9 matrizes de avaliação indexáveis no Google (DISC, Big Five, Ikigai, Johari, Pearson, SOAR, TCI, Âncoras, SWOT)
- DNS Cloudflare (nameservers `holly.ns.cloudflare.com` + `lou.ns.cloudflare.com`)
- Email Routing Cloudflare ativo (forward `*@sistema-gnosis.com.br` → `lusantpaypal@gmail.com`)
- 16 migrations Supabase aplicadas (002→017)
- 5 edge functions deployadas

### ⏳ Pendente — só você (humano) pode fazer
1. **CNPJ / MEI** — Política de Privacidade ainda diz "em processo"
2. **Validar pagamento real** — comprar 1 crédito (R$ 29,90) e ver crédito aparecer
3. **GA4** — criar conta, copiar `G-XXXXXXXXXX`, colar em `js/config.js:gaMeasurementId`
4. **SMTP no Supabase** — apontar pra `noreply@sistema-gnosis.com.br` (segue `docs/smtp-setup-supabase.md`)
5. **GitHub Pages em `capsula.dev`** — investigar se ainda recebe tráfego, aposentar ou sincronizar

---

## 2. Stack & Infraestrutura

```
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare (DNS Free + Email Routing)                       │
│  ↓                                                            │
│  Registro.br: nameservers apontados pro Cloudflare           │
│  ↓                                                            │
│  Vercel (frontend hosting)                                    │
│   ├── A record → 76.76.21.21 (DNS only, sem proxy)           │
│   ├── CNAME www → cname.vercel-dns.com (DNS only)            │
│   └── api/r.js (Vercel serverless function)                   │
│  ↓                                                            │
│  Supabase (backend)                                           │
│   ├── PostgreSQL + Auth + RLS                                 │
│   ├── 5 Edge Functions                                        │
│   └── Project ref: dfnmofzbpdmnvlyowtmp                       │
│  ↓                                                            │
│  Mercado Pago + Stripe (pagamentos via webhook)               │
└─────────────────────────────────────────────────────────────┘
```

**Repositório**: github.com/daniloluis05-maker/capsula.dev.atual
**Vercel project**: capsula-dev-atualizado
**Conta Cloudflare**: daniloluis05@gmail.com

---

## 3. Domínios

| Domínio | Origem | Função |
|---|---|---|
| `www.sistema-gnosis.com.br` | Registro.br → Cloudflare → Vercel | **Canônico** (principal) |
| `sistema-gnosis.com.br` (apex) | Mesmo | 307 → www |
| `capsula-dev-atualizado.vercel.app` | Vercel auto-gerado | Preview/fallback (não desativar) |
| `capsula.dev` | (?) → GitHub Pages | **Pré-existente, código ANTIGO**. A investigar/aposentar |

### DNS no Cloudflare (zona `sistema-gnosis.com.br`)

| Tipo | Nome | Valor | Proxy |
|---|---|---|---|
| A | sistema-gnosis.com.br | 76.76.21.21 | DNS only (cinza) |
| CNAME | www | cname.vercel-dns.com | DNS only |
| TXT | sistema-gnosis.com.br | google-site-verification=DpSsR87f... | — |
| MX | sistema-gnosis.com.br | route1/2/3.mx.cloudflare.net | — |
| TXT | sistema-gnosis.com.br | v=spf1 include:_spf.mx.cloudflare.net ~all | — |

### Cloudflare Email Routing
- **Catch-all** → `lusantpaypal@gmail.com` (verificado)
- Regras adicionais: `suporte@`, `privacidade@`, `noreply@` também redirecionam pro mesmo Gmail

---

## 4. Migrations Supabase (todas aplicadas em produção)

| # | Arquivo | Resumo |
|---|---|---|
| 002 | payments.sql | Tabela usuarios + creditos jsonb + plano + plano_expira_em |
| 003 | remote_links.sql | Tabelas remote_links, remote_results, indicadores, registros_semanais, equipes, equipe_membros, equipe_dna |
| 004 | team_matrices.sql | Tabelas plano_acao_items, raci_atividades, raci_atribuicoes, swot_equipe_items |
| 005 | security_hardening.sql | RLS strict por usuário em todas tabelas + check_ai_rate_limit RPC |
| 006 | okrs.sql | Tabelas objetivos, key_results, kr_updates |
| 007 | debit_credit.sql | RPC debit_credit (com bug de cross-account, fixado em 011) |
| 008 | fix_remote_links_etiqueta.sql | Adiciona colunas faltantes em remote_links |
| 009 | rename_matrix_key_to_matriz.sql | matrix_key → matriz |
| 010 | add_created_at_remote_links.sql | Adiciona created_at em remote_links |
| **011** | fix_debit_credit_self_only.sql | 🚨 **FIX C1**: debit_credit verifica `auth.email() == p_email` |
| **012** | payment_idempotency.sql | Tabela `processed_payments(provider, external_id)` PK pra prevenir duplo crédito |
| **013** | remote_results_validation.sql | RLS em remote_results valida token + slot + expiração |
| **014** | plan_enforcement_and_column_lock.sql | Trigger anti-auto-promoção em usuarios + helpers `is_pro_or_higher()`, `is_gerencial_or_admin()` + RLS plan-aware em remote_links/equipes/indicadores/objetivos |
| **015** | fix_usuarios_rls_leak.sql | 🚨 **FIX B3**: força ENABLE+FORCE RLS em usuarios sem swallow + clean slate de policies |
| **016** | remote_links_rpc_only_lookup.sql | 🚨 **FIX B4**: remove SELECT anon de remote_links + cria RPC `get_remote_link_by_token` SECURITY DEFINER |
| **017** | fix_remote_results_rls_after_migration_016.sql | 🚨 **FIX**: cria `can_insert_remote_result()` SECURITY DEFINER porque migration 016 quebrou o EXISTS subquery do RLS de remote_results |

### Comandos úteis pra DB

```bash
# Aplicar migrations pendentes
supabase db push --include-all --project-ref dfnmofzbpdmnvlyowtmp

# Ver state das migrations (local vs remote)
supabase migration list

# Marcar migrations já aplicadas (se tracker dessincronizar)
supabase migration repair --status applied 007 008 009 010

# Pull schema do remoto pra local (se quiser)
supabase db pull
```

---

## 5. Edge Functions (Supabase)

| Função | Versão atual | Propósito |
|---|---|---|
| `mp-webhook` | v23+ | Webhook MP — valida assinatura + idempotência + credita usuário |
| `stripe-webhook` | v3+ | Webhook Stripe — assinatura timing-safe + idempotência |
| `create-mp-preference` | v27+ | Cria preferência MP (5 produtos: credito1/3/8, pro, gerencial) |
| `anthropic-proxy` | v41 | Proxy pra Claude API (DNA estratégico) |
| `groq-proxy` | v6 | Proxy pra Groq |

### Secrets configurados em Supabase

```
ANTHROPIC_API_KEY               (Claude API)
GROQ_API_KEY                    (Groq)
MP_ACCESS_TOKEN                 (token de produção MP)
MP_PUBLIC_KEY                   (APP_USR-...)
MP_WEBHOOK_SECRET               (anti-spoofing)
MP_REQUIRE_SIGNATURE = true     (fail-closed mode — promovido em 2026-04-29)
SITE_URL = https://www.sistema-gnosis.com.br
SUPABASE_URL, SUPABASE_ANON_KEY (auto)
SUPABASE_SERVICE_ROLE_KEY       (auto, bypassa RLS)
```

### Comandos úteis pra Edge Functions

```bash
# Deploy individual
supabase functions deploy mp-webhook --project-ref dfnmofzbpdmnvlyowtmp --no-verify-jwt

# Deploy via script (mp-webhook + create-mp-preference)
node scripts/deploy-edge.js

# Listar funções
supabase functions list --project-ref dfnmofzbpdmnvlyowtmp

# Download de função pra inspeção
supabase functions download mp-webhook --project-ref dfnmofzbpdmnvlyowtmp
```

---

## 6. Frontend — arquivos principais

### Configuração
- **`config.js` (raiz)** — `window.CAPSULA_CONFIG` com supabaseUrl + supabaseKey (PÚBLICA, anon)
- **`js/config.js`** — versão extendida com MP_PUBLIC_KEY, sentryDsn, gaMeasurementId
- **`js/db.js`** — Cliente Supabase singleton + helpers (saveUser, debitCredit, createRemoteLink, saveRemoteResult, etc.)

### Lógica de pagamento
- **`js/payments.js`** — `_payments` global: isPro(), isGerencial(), hasAccess(), serverDebitCredit(), openCheckout(), showPaywall()

### Fluxo de respondente remoto (CRÍTICO)
- **`js/remote-link.js`** — IIFE que detecta `?token=` na URL, mocka `_payments.isPro = () => true`, mocka `capsulaDB.ensureUserData`, mostra identification overlay, intercepta generatePDF, injeta botão "Enviar Resultado", substitui dashboard buttons.
  - **⚠️ Carregado em `<head>` das matrizes — todo acesso a `document.body` deve estar dentro de `init()` (DOMContentLoaded), nunca no nível IIFE.**

### Vercel serverless
- **`api/r.js`** — gera OG tags personalizadas (`og:title`, `og:image`) chamando RPC `get_remote_link_by_token` e redireciona pro `/{matriz}.html?token=...`. URL: `/api/r?token=xxx`.

### Páginas
- **`index.html`** — landing + signup modal + Schema.org (Organization + WebSite + FAQPage 6 perguntas)
- **`convite.html`** — formulário de signup standalone
- **`dashboard.html`** — dashboard do usuário logado (Pro/Gerencial veem seções extras)
- **`disc.html, bigfive.html, ikigai.html, johari.html, pearson.html, soar.html, tci.html, ancoras.html, swot.html`** — matrizes públicas (indexáveis)
- **`dna.html`** — DNA Estratégico (premium, noindex)
- **`5w2h.html, raci.html, okrs.html, swot-equipe.html, equipe.html`** — features Gerenciais (noindex)
- **`auth-callback.html, reset-password.html, pagamento-sucesso.html`** — flows transacionais

### Vercel config
- **`vercel.json`** — Headers de segurança (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) + Cache-Control granular por tipo de asset

---

## 7. Cronologia de bugs e correções

### Vulnerabilidades de segurança (auditoria sessão 1)

| ID | Severidade | Bug | Migration / Commit |
|---|---|---|---|
| **C1** | 🔴 CRÍTICO | RPC `debit_credit` aceitava qualquer email — qualquer authenticated debitava créditos de outras contas | Migration 011 |
| **C2** | 🔴 CRÍTICO | Webhooks MP/Stripe sem idempotência — retry duplicava crédito | Migration 012 + edits em mp-webhook/stripe-webhook |
| **C3** | 🟠 ALTO | RLS de `remote_results` aceitava INSERT anon sem validar token | Migration 013 (depois quebrada por 016, fix em 017) |
| **C4** | 🟠 ALTO | Webhook MP aceitava requests sem assinatura por default | Edit em mp-webhook (dual mode permissivo+estrito) |
| **C5** | 🟠 ALTO | HMAC comparado com string-equal (não constant-time) | Edit timingSafeEqual em ambos webhooks |
| **M1** | 🟡 MÉDIO | `IS_TEST` em payments.js sempre `false` (campo MP_PUBLIC_KEY estava ok mas detection broken) | Removido detection, usa `init_point \|\| sandbox_init_point` |
| **M2** | 🟡 MÉDIO | auth-callback retry de 3s curto demais pra 3G | MAX_ATTEMPTS = 10, backoff progressivo |
| **M3** | 🟡 MÉDIO | Anon key duplicada em api/r.js | process.env com fallback hardcoded |

### Vulnerabilidades de segurança (sessão 2 — auditoria pós-deploy)

| ID | Severidade | Bug | Migration |
|---|---|---|---|
| **B1** | 🟠 ALTO | Plan-gating só no UI — free user via console criava remote_links e equipes | Migration 014 |
| **B2** | 🔴 CRÍTICO | RLS de `usuarios` deixava usuário alterar `is_admin`, `creditos`, `plano` próprios via UPDATE | Migration 014 (trigger anti-auto-promoção) |
| **B3** | 🔴 CRÍTICO **LGPD** | RLS nunca foi habilitado em `usuarios` (DO ... EXCEPTION WHEN OTHERS THEN NULL silenciava erro). Anon listava todos emails+plano+creditos | Migration 015 |
| **B4** | 🟠 ALTO PII | `remote_links` enumerável por anon (USING true) — vazava pro_email e etiqueta | Migration 016 (RPC pontual) |
| **REGRESSÃO** | 🚨 | Migration 016 quebrou o EXISTS subquery em RLS de remote_results, bloqueando submissão de respondente | Migration 017 (SECURITY DEFINER) |

### Bugs UX / funcionais

| Sintoma | Root cause | Fix |
|---|---|---|
| Respondente caía em paywall antes de fazer teste | `isPro: () => false` patch em remote-link.js → matrizes (Big Five, Âncoras, etc.) com route protection disparavam showPaywall | Mudou patch pra `isPro: () => true` (commit 2045d4a) |
| Botão "Dashboard" no result page do respondente | swot.html usa `class="btn-green"` em vez de `.btn-dashboard` | Seletor amplificado pra `button[onclick*="dashboard"], a[href*="dashboard"]` (commits c92b819, 45f586a) |
| Modal de signup cropping em viewport curto | `align-items: center` sem `overflow-y: auto` | `align-items: flex-start` + `overflow-y: auto` + `margin: auto` no .modal (commit 6459995) |
| 9 matrizes com `noindex,nofollow` mesmo no sitemap | Leftover de staging | Trocado pra `index, follow` em 9 matrizes (commit 5e358df) |
| Emails apareciam como `@www.sistema-gnosis.com.br` (errado) | Find/replace anterior capturou o `www.` por engano | Corrigido em commit d02960e |
| **🚨 IIFE de remote-link.js bailing out** | `document.body.appendChild` no IIFE rodando em `<head>` (body=null) — TypeError silencioso, addEventListener nunca chamado | Adiou appendChild pra dentro de init() — commit 6c3fb7b |

### `watchForResult` defensivo

A versão atual (commit a32c995) usa **6 estratégias paralelas** pra detectar a result-page:
1. Check direto `#page-result.active`
2. Check qualquer `.result-actions` visível (offsetParent)
3. Check `.page.active` que contenha `.result-actions`
4. Hook em `window.showPage` (intercepta showPage('page-result'))
5. MutationObserver em body para mudanças de class/style/childList
6. Polling 500ms × 120 (60s fallback)

E `processDashboardElements()` roda 3 vezes:
- No init() (DOMContentLoaded)
- Continuamente via MutationObserver (childList+subtree)
- Dentro de injectSubmitButton

---

## 8. Setup do domínio (cronologia)

1. **Domínio comprado** em 2026-04-29 no Registro.br (`sistema-gnosis.com.br`)
2. **DNS configurado**: A apex + CNAME www na "Configurar zona DNS" do Registro.br
3. **Vercel custom domain**: `www.sistema-gnosis.com.br` adicionado, apex configurado pra 307 → www
4. **Find/replace 50 arquivos**: `sistemagnosis.com.br` → `capsula-dev-atualizado.vercel.app` (commit 6953bb6) — fase intermediária
5. **Find/replace 55 arquivos**: `capsula-dev-atualizado.vercel.app` → `www.sistema-gnosis.com.br` (commit 6459995)
6. **Search Console verificado** via TXT no Registro.br
7. **Sitemap submetido** (10 URLs após adicionar pearson.html)
8. **Cloudflare Email Routing**: nameservers do Registro.br trocados pra `holly.ns.cloudflare.com` + `lou.ns.cloudflare.com`
9. **Email catch-all configurado**: `*@sistema-gnosis.com.br` → `lusantpaypal@gmail.com`

---

## 9. Convenções e gotchas

### `remote-link.js` em `<head>`
- **NUNCA** acesse `document.body` no nível IIFE. Sempre dentro de `init()` ou outra função chamada em DOMContentLoaded.
- Patches a `window._payments`, `window.capsulaDB` no IIFE são OK (não tocam DOM).
- Se precisar criar elementos, faça `document.createElement` (orfão é OK), mas adie `.appendChild(...)` pra init().

### Ordem de scripts em matrizes
```html
<head>
  ...
  <script src="js/sentry-init.js"></script>
  <script src="js/db.js"></script>          ← capsulaDB definido aqui
  <script src="js/payments.js"></script>    ← _payments definido aqui
  <script src="js/remote-link.js"></script> ← patches dependem dos anteriores
</head>
<body>
  ...
  <script src="js/disc-app.js"></script>    ← matrix-app vê os patches
</body>
```

### Find/replace de domínio
- Quando trocar URL, use boundary específico: `\.com\.br|\.vercel\.app` no padrão sed pra evitar pegar emails (`@dominio` virou `@www.dominio`).

### Migrations com EXCEPTION
- **NUNCA** use `DO $$ ... EXCEPTION WHEN OTHERS THEN NULL; END $$` pra ENABLE RLS — silencia erro real e leak passa despercebido. Foi a causa de B3.

### Cloudflare Proxied vs DNS only
- Pra Vercel: SEMPRE use **DNS only (cinza)**. Proxied (laranja) causa SSL handshake errors com Vercel edge.

### LF vs CRLF (Windows)
- O git mostra warnings sobre LF→CRLF em quase todo commit. Inofensivo. Os arquivos são CRLF localmente, LF no repo.

---

## 10. Comandos úteis

### Deploy / Push
```bash
# Vercel auto-deploya em push pra main
git push origin main

# Verificar último deploy no Vercel via curl
curl -s "https://www.sistema-gnosis.com.br/" | grep -oE '<title>[^<]*</title>'

# Forçar revalidação de cache (Vercel)
# Cache-Control no vercel.json é must-revalidate, então browsers re-checam
```

### Validações rápidas
```bash
# 27 páginas HTTP smoke
for p in 404 5w2h ancoras auth-callback bigfive convite dashboard disc-share disc dna equipe gnosis-identity ikigai index johari okrs pagamento-sucesso pearson privacidade raci reset-password soar swot-equipe swot tci termos wizard; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://www.sistema-gnosis.com.br/$p.html")
  printf "%-25s %s\n" "$p.html" "$code"
done

# Sintaxe JS
for f in js/*.js; do node --check "$f" && echo "OK $f" || echo "FAIL $f"; done

# Smoke MP preferences
for prod in credito1 credito3 credito8 pro gerencial; do
  curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"product_key\":\"$prod\",\"email\":\"smoke@test.com\"}" \
    "https://dfnmofzbpdmnvlyowtmp.supabase.co/functions/v1/create-mp-preference" \
    | python -c "import sys,json; d=json.load(sys.stdin); print('$prod', 'OK' if 'init_point' in d else 'FAIL')"
done

# Anon não vê PII
curl -s -H "apikey: $ANON_KEY" \
  "https://dfnmofzbpdmnvlyowtmp.supabase.co/rest/v1/usuarios?select=email&limit=1"
# Esperado: {"code":"42501","message":"permission denied for table usuarios"}
```

### Rollback de emergência

```bash
# MP webhook em fail-open (se MP_REQUIRE_SIGNATURE=true romper)
supabase secrets unset MP_REQUIRE_SIGNATURE --project-ref dfnmofzbpdmnvlyowtmp

# Reverter commit
git revert <hash> && git push origin main

# Deletar uma policy ruim
supabase db push (após editar a migration)
```

---

## 11. Arquivos importantes em `docs/`

| Arquivo | Propósito |
|---|---|
| `HANDOFF.md` | **Este arquivo** — runbook completo |
| `security-validation-2026-05-01.md` | Checklist de validação MP_REQUIRE_SIGNATURE (já passou da data, mas roteiro ainda válido pra testar com pagamento real) |
| `zoho-mail-setup.md` | Setup Zoho Mail caso quisesse SMTP profissional (opção alternativa ao Cloudflare Routing) |
| `smtp-setup-supabase.md` | Configurar SMTP custom no Supabase Auth |

---

## 12. Pendências priorizadas

### 🔴 Bloqueadores legais
1. **CNPJ / MEI** — Política de Privacidade (`privacidade.html` linha ~39) declara "CNPJ em processo de regularização". Sem CNPJ:
   - MP aceita PF até R$ 5k/mês
   - Stripe Brasil exige PJ (atualmente bloqueado pra você)
   - LGPD exige Controlador identificado
   - NF-e impossível

### 🟠 Recomendado antes de scaling
2. **Validar pagamento real** — Comprar 1 crédito (R$ 29,90) com seu cartão → verificar log do mp-webhook (Supabase Dashboard → Functions → mp-webhook → Logs) → confirmar que o crédito apareceu no dashboard. Sem isso, o primeiro cliente real pode falhar silenciosamente.

3. **GA4** —
   - Cria propriedade em https://analytics.google.com
   - Copia o `Measurement ID` (formato `G-XXXXXXXXXX`)
   - Cola em `js/config.js`: `gaMeasurementId: 'G-XXXXXXXXXX'`
   - Push pro git → analytics começa a coletar com banner LGPD opt-in

4. **SMTP no Supabase Auth** — Atualmente os emails de "confirme conta" e "redefinir senha" saem do sender genérico `noreply@mail.app.supabase.io` (cai em spam). Setup em `docs/smtp-setup-supabase.md` (mas precisa de provedor que envie por você — Cloudflare Routing só recebe).
   - Alternativa: Resend.com (free 3000/mês) pra envio
   - Atualizar Supabase Auth → SMTP custom

5. **Promover MP_REQUIRE_SIGNATURE pra estrito** — Já está `true` em produção. Confirmar via log que webhooks reais passam, depois nada mais a fazer.

### 🟡 Nice-to-have
6. **GitHub Pages em capsula.dev** — investigar de onde serve (provavelmente outro repo ou branch). Aposentar ou sincronizar.
7. **Splitting CSS/JS inline em assets externos** — dashboard.html (81KB), index.html (54KB) têm muito inline. Refactor de 2-3h.

---

## 13. Resumo de commits da migração (últimos 30)

```
6c3fb7b fix(remote-link): IIFE não falha mais em <head> — root cause
a32c995 fix(remote-link): detector universal e defensivo de result-page
45f586a fix: respondente remoto consegue submeter resultado + dashboard btn no swot
4e27a98 feat(analytics+docs): GA4 opt-in + banner LGPD + setup docs do email
d02960e fix: corrige emails que viraram @www.sistema-gnosis.com.br após domain swap
5e358df seo+ux: desbloqueia indexação e adiciona Schema.org Service em todas matrizes
e2f26be seo(index): adiciona Schema.org JSON-LD (Organization + WebSite)
6f34bda feat(seo,security): headers de segurança + Schema.org JSON-LD
6459995 fix(ux): modal scroll + finaliza migração de domínio
c92b819 fix(remote-link): substitui Dashboard por "Criar conta" no fluxo respondente
2045d4a fix(remote-link): respondente passa pelo gate de rota das matrizes
41ee83b fix(api/r): usa RPC get_remote_link_by_token após fechamento RLS
b261702 fix(security): fecha 2 vazamentos de PII em usuarios e remote_links
14991f7 fix(security): plan enforcement + column lock em usuarios
6953bb6 chore(domain): troca sistemagnosis.com.br por capsula-dev-atualizado.vercel.app
5b5efdd docs(security): checklist de validação MP_REQUIRE_SIGNATURE em 2026-05-01
a3a4ccc fix(security): hardening de créditos, webhooks e RLS  ← inicial massivo
9434d31 fix(remote-link): bloqueia acesso direto às funções internas de PDF
9213390 feat(remote-link): respondente remoto faz teste grátis, PDF requer conta
```

---

## 14. Acessos / credentials referências

| Serviço | URL | Conta |
|---|---|---|
| Supabase Dashboard | https://supabase.com/dashboard/project/dfnmofzbpdmnvlyowtmp | (Danilo) |
| Vercel Dashboard | https://vercel.com/daniloluis05-4033s-projects/capsula-dev-atualizado | daniloluis05@gmail.com |
| Cloudflare Dashboard | https://dash.cloudflare.com | daniloluis05@gmail.com |
| Registro.br | https://registro.br | (conta do domínio) |
| Google Search Console | https://search.google.com/search-console | (verificado via TXT) |
| Mercado Pago | https://www.mercadopago.com.br/developers/panel/app | (PF/PJ do projeto) |
| GitHub repo | https://github.com/daniloluis05-maker/capsula.dev.atual | daniloluis05-maker |
| Email catch-all destination | `lusantpaypal@gmail.com` | (Gmail pessoal) |

---

## 15. Como retomar em outra conversa

1. Compartilhe este arquivo (ou cole o conteúdo) no início da nova conversa
2. Diga em qual frente quer continuar (ex: "validar pagamento real", "instalar GA4", "abrir MEI", etc.)
3. O assistente terá o contexto completo sem precisar varrer o repo

### Como o próximo Claude deve agir
- **Não recriar fixes** já feitos (lista acima é exaustiva)
- **Sempre rodar migrations via `supabase db push`** (não SQL Editor avulso)
- **Sempre testar em incognito** após deploy de JS (cache-control 1h must-revalidate)
- **Nunca acessar `document.body` em IIFE de scripts em `<head>`**
- **Antes de mudar RLS**: lembre que `EXISTS (SELECT FROM other_table)` em policies anon respeita RLS de other_table — use SECURITY DEFINER se precisar bypassar (vide migration 017)
- **Find/replace de domínio**: usar `grep -rl` + `sed`, mas sempre verificar se não capturou emails (`@dominio` quebra como `@www.dominio`)

---

**Documento gerado para handoff de sessão. Atualize com novas mudanças ou crie HANDOFF-vN.md em revisões maiores.**

# Configurar SMTP customizado no Supabase Auth

**Por quê:** hoje os emails de confirmação de conta e recuperação de senha que o Supabase manda vêm de um sender genérico (`noreply@mail.app.supabase.io`). Isso cai em spam frequentemente e gera desconfiança no usuário ("isso é golpe?").

**Resultado depois:** emails saem de `noreply@sistema-gnosis.com.br`, com sua marca, alta deliverability.

**Pré-requisito:** ter o domínio `sistema-gnosis.com.br` com email funcionando — seguir [zoho-mail-setup.md](./zoho-mail-setup.md) primeiro (ou Google Workspace).

---

## Passo 1 — Obter as credenciais SMTP do seu provedor

### Se você está usando **Zoho Mail (grátis)**

| Campo | Valor |
|---|---|
| **Host** | `smtp.zoho.com` |
| **Porta** | `587` |
| **Usuário** | `noreply@sistema-gnosis.com.br` (a conta que você criou) |
| **Senha** | Gere uma "App-Specific Password" em: Zoho Mail → Settings → Security → App Passwords |

⚠️ **NÃO use a senha normal da conta.** Gere uma App Password — Zoho exige isso para SMTP externo.

### Se você está usando **Google Workspace**

| Campo | Valor |
|---|---|
| **Host** | `smtp.gmail.com` |
| **Porta** | `587` |
| **Usuário** | `noreply@sistema-gnosis.com.br` |
| **Senha** | App Password gerada em https://myaccount.google.com/apppasswords (precisa ter 2FA ativo) |

---

## Passo 2 — Configurar no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard/project/dfnmofzbpdmnvlyowtmp)
2. **Authentication → Emails** (ou **Project Settings → Authentication → SMTP Settings**)
3. Ativar "**Enable Custom SMTP**"
4. Preencher os campos:
   - **Sender email:** `noreply@sistema-gnosis.com.br`
   - **Sender name:** `Sistema Gnosis`
   - **Host:** (do Passo 1)
   - **Port:** `587`
   - **Username:** (do Passo 1)
   - **Password:** (App Password do Passo 1)
   - **Minimum interval:** 60 (segundos — anti-spam)
5. Clica **Save**

---

## Passo 3 — Atualizar templates de email (opcional mas recomendado)

Em **Authentication → Email Templates**, personalize:

- **Confirm signup** — assunto e corpo do email de confirmação de conta
- **Reset password** — recuperação de senha
- **Magic link** — login passwordless (se ativado)

Use HTML simples com sua marca. Mínimo:
- Assunto claro: "Confirme sua conta no Sistema Gnosis"
- Corpo com logo/cor da marca
- Footer com link pra suporte e privacidade

---

## Passo 4 — Testar

1. Crie uma conta nova com um email seu (Gmail, Outlook) em `https://www.sistema-gnosis.com.br/convite.html`
2. Verifique se o email de confirmação chega:
   - **Inbox** (não Spam)
   - Sender: `Sistema Gnosis <noreply@sistema-gnosis.com.br>`
   - Link de confirmação funciona

Se cair em Spam: verifique no painel Zoho/Workspace se SPF, DKIM e DMARC estão configurados (eles fazem isso automaticamente para você).

---

## Troubleshooting

| Problema | Causa provável | Fix |
|---|---|---|
| Email não chega | SPF/DKIM ausente no DNS | Painel Zoho/Workspace → Domain Setup → seguir wizard |
| "535 Authentication failed" | Senha errada (não usou App Password) | Gerar App Password e usar essa |
| "550 Sender not authorized" | Email diferente da conta | Sender = exatamente o email da conta |
| Cai em Spam mesmo correto | Domínio sem reputação ainda | Manda emails de baixo volume por 1-2 semanas, reputação sobe |

---

## Custo

- **Zoho Mail Free:** R$ 0 — até 5 contas + 5GB cada
- **Zoho Mail Pago:** R$ 5/mês por conta — 50GB
- **Google Workspace:** R$ 30/mês por conta — gmail interface familiar
- **SMTP via Supabase:** sem custo extra (você paga só pro provedor de email)

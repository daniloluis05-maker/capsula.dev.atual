# Configurar Zoho Mail grátis no domínio `sistema-gnosis.com.br`

**Por quê:** receber emails em `suporte@sistema-gnosis.com.br` e `privacidade@sistema-gnosis.com.br` (referenciados no site), e enviar emails transacionais com sua marca.

**Custo:** R$ 0 (plano Forever Free do Zoho — 5 contas, 5GB cada).

**Tempo:** ~30 minutos (incluindo propagação DNS).

---

## Passo 1 — Cadastro no Zoho

1. Acesse https://www.zoho.com/mail/
2. Clica em "Sign Up Now" (canto direito)
3. Escolhe o plano **"Forever Free"** (rolar até o final, não o trial pago)
4. Preenche cadastro:
   - **Domain:** `sistema-gnosis.com.br` (sem www, sem https://)
   - Nome, email pessoal pra recuperação, senha forte
5. Confirma o email pessoal de cadastro

---

## Passo 2 — Verificar propriedade do domínio

Zoho vai pedir pra você provar que é dono do domínio. Vai mostrar 1 das 2 opções:

### Opção A — TXT verification (recomendada, mais fácil)

Zoho mostra algo tipo:

```
Type: TXT
Host: @ (ou em branco)
Value: zoho-verification=zb12345678.zmverify.zoho.com
```

**No Registro.br:**
1. Acessa registro.br → Meus Domínios → `sistema-gnosis.com.br`
2. Configurar zona DNS → "Modo Avançado" → "NOVA ENTRADA"
3. Preenche:
   - **TIPO:** TXT
   - **NOME:** deixar vazio
   - **DADOS:** cola o valor `zoho-verification=zb12345678.zmverify.zoho.com`
4. ADICIONAR → SALVAR ALTERAÇÕES
5. Volta no Zoho → "Verify"

### Opção B — CNAME (caso TXT não funcione)

Mesmo processo mas tipo CNAME. Zoho dá os valores.

---

## Passo 3 — Criar caixas de entrada

Depois da verificação:

1. **Crie:** `noreply@sistema-gnosis.com.br` — para emails transacionais (Supabase Auth, MP webhooks, etc.)
2. **Crie:** `suporte@sistema-gnosis.com.br` — para SAC (referenciado no site)
3. **Crie:** `privacidade@sistema-gnosis.com.br` — DPO/LGPD (referenciado na Privacidade)

> Plano grátis: até 5 contas. Use as 5 com sabedoria.

---

## Passo 4 — Configurar MX records (CRÍTICO — sem isso emails não chegam)

Zoho mostra a configuração MX. Algo tipo:

```
Type   Priority  Value
MX     10        mx.zoho.com.
MX     20        mx2.zoho.com.
MX     50        mx3.zoho.com.
```

**No Registro.br:**

1. Configurar zona DNS → "Modo Avançado"
2. **NOVA ENTRADA** (3 vezes — uma para cada MX):

Entry 1:
- TIPO: **MX**
- NOME: deixar vazio
- DADOS: `10 mx.zoho.com.` (com prioridade 10 e ponto no final)

Entry 2:
- TIPO: **MX**
- NOME: deixar vazio
- DADOS: `20 mx2.zoho.com.`

Entry 3:
- TIPO: **MX**
- NOME: deixar vazio
- DADOS: `50 mx3.zoho.com.`

3. SALVAR ALTERAÇÕES
4. Aguarda ~10-30 min pra propagação

> Se o Registro.br pedir o priority em campo separado, fica mais fácil. Se pedir tudo junto no DADOS, formata como `10 mx.zoho.com.`.

---

## Passo 5 — Configurar SPF e DKIM (anti-spam)

Zoho mostra os valores de SPF e DKIM. Adiciona no Registro.br:

### SPF (TXT no apex)

```
TIPO: TXT
NOME: vazio
DADOS: v=spf1 include:zoho.com ~all
```

### DKIM (TXT em subdomínio específico)

Zoho gera algo tipo:

```
TIPO: TXT
NOME: zmail._domainkey
DADOS: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4G...
```

(Cola o valor que o Zoho deu — vai ser uma string longa.)

### DMARC (TXT em subdomínio _dmarc)

```
TIPO: TXT
NOME: _dmarc
DADOS: v=DMARC1; p=quarantine; rua=mailto:postmaster@sistema-gnosis.com.br
```

---

## Passo 6 — Verificar

1. **Receber:** envie um email do seu Gmail pessoal pra `suporte@sistema-gnosis.com.br` → entra no inbox do Zoho
2. **Enviar:** mande um email do Zoho pra seu Gmail pessoal → não cai em spam (com SPF+DKIM configurados)

---

## Próximo passo: SMTP no Supabase

Veja `smtp-setup-supabase.md` neste mesmo diretório.

---

## Estado final do DNS no Registro.br após Zoho

Você deve ter (no mínimo):

| TIPO | NOME | DADOS |
|---|---|---|
| A | `sistema-gnosis.com.br` | `76.76.21.21` (Vercel — já configurado) |
| CNAME | `www.sistema-gnosis.com.br` | `cname.vercel-dns.com.` (Vercel — já configurado) |
| TXT | `sistema-gnosis.com.br` | `google-site-verification=...` (Search Console) |
| TXT | `sistema-gnosis.com.br` | `zoho-verification=...` |
| TXT | `sistema-gnosis.com.br` | `v=spf1 include:zoho.com ~all` |
| TXT | `zmail._domainkey.sistema-gnosis.com.br` | `v=DKIM1; k=rsa; p=...` |
| TXT | `_dmarc.sistema-gnosis.com.br` | `v=DMARC1; p=quarantine; ...` |
| MX | `sistema-gnosis.com.br` | `10 mx.zoho.com.` |
| MX | `sistema-gnosis.com.br` | `20 mx2.zoho.com.` |
| MX | `sistema-gnosis.com.br` | `50 mx3.zoho.com.` |

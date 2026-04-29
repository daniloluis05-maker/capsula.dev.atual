# Validação de Segurança — `MP_REQUIRE_SIGNATURE` em produção

**Data alvo:** 2026-05-01 (48h após o hardening)
**Tempo estimado:** 3 minutos
**Pré-requisito:** `supabase login` + projeto linkado (`dfnmofzbpdmnvlyowtmp`)

## Contexto

Em **2026-04-29**, o commit `a3a4ccc` (`fix(security): hardening de créditos, webhooks e RLS`) endureceu o pipeline de pagamento. Em sequência, o secret `MP_REQUIRE_SIGNATURE=true` foi promovido na função `mp-webhook` — webhooks Mercado Pago **sem assinatura válida agora retornam HTTP 400**.

Este documento valida que webhooks legítimos do MP continuam passando.

## Check 1 — Logs do mp-webhook (últimas 48h)

[Dashboard de logs](https://supabase.com/dashboard/project/dfnmofzbpdmnvlyowtmp/functions/mp-webhook/logs)

**Filtros:**
- Período: últimas 48h
- Search: `Invalid signature` OU `Missing signature` OU `MP_REQUIRE_SIGNATURE=true mas`

**Decisão:**

| Resultado | Status | Ação |
|---|---|---|
| 0 ocorrências | 🟢 GREEN | Tudo OK |
| Ocorrências SÓ com `live_mode=false` | 🟢 GREEN | Testes do painel MP — ignorar |
| Ocorrências com `live_mode=true` | 🔴 RED | Webhook real recusado — vá ao Rollback |

## Check 2 — Secrets ainda configurados

```bash
supabase secrets list --project-ref dfnmofzbpdmnvlyowtmp | grep -E "MP_REQUIRE|MP_WEBHOOK"
```

**Esperado:** ambas as linhas com hash:
```
MP_REQUIRE_SIGNATURE  | <hash>
MP_WEBHOOK_SECRET     | <hash>
```

Se faltar `MP_REQUIRE_SIGNATURE` → status amarelo, alguém removeu.

## Check 3 — Idempotência funcionando

[SQL Editor](https://supabase.com/dashboard/project/dfnmofzbpdmnvlyowtmp/sql/new):

```sql
SELECT
  count(*) FILTER (WHERE provider='mp')     AS mp_total_48h,
  count(*) FILTER (WHERE provider='stripe') AS stripe_total_48h,
  max(processed_at) FILTER (WHERE provider='mp')     AS ultimo_mp,
  max(processed_at) FILTER (WHERE provider='stripe') AS ultimo_stripe
FROM processed_payments
WHERE processed_at > now() - interval '48 hours';
```

**Decisão:**

| Resultado | Status | Interpretação |
|---|---|---|
| `mp_total_48h > 0` com timestamps recentes | 🟢 GREEN | Pagamentos MP processando |
| Tudo zero **e** houve venda no período | 🔴 RED | Webhook não creditando |
| Tudo zero **e** sem venda no período | 🟡 YELLOW | Re-checar em 7 dias |

## Rollback (se Check 1 = RED)

```bash
supabase secrets unset MP_REQUIRE_SIGNATURE --project-ref dfnmofzbpdmnvlyowtmp
```

Aplicação imediata, sem redeploy. Webhook volta ao modo permissivo.

### Investigação do mismatch de secret

1. Abrir [painel MP](https://www.mercadopago.com.br/developers/panel/app) → Webhooks → editar config do endpoint do Supabase.
2. Visualizar/regerar o "Webhook Secret".
3. Atualizar no Supabase:
   ```bash
   supabase secrets set MP_WEBHOOK_SECRET=<novo-valor> --project-ref dfnmofzbpdmnvlyowtmp
   ```
4. Re-promover modo estrito:
   ```bash
   supabase secrets set MP_REQUIRE_SIGNATURE=true --project-ref dfnmofzbpdmnvlyowtmp
   ```

## Sign-off

Após executar os 3 checks, registrar o resultado abaixo:

- [ ] Check 1: 🟢 / 🟡 / 🔴 — observações:
- [ ] Check 2: 🟢 / 🟡 / 🔴 — observações:
- [ ] Check 3: 🟢 / 🟡 / 🔴 — observações:
- [ ] **Conclusão:** manter `MP_REQUIRE_SIGNATURE=true` / fazer rollback
- [ ] Validado por: ______________ em ____ / ____ / 2026

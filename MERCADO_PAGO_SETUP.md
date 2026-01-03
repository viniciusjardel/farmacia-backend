# 🎯 Setup Mercado Pago - PIX Dinâmico

## 1. Obter Credenciais do Mercado Pago

### Passo a Passo:

1. **Crie uma conta** em https://www.mercadopago.com.br (se não tiver)
2. **Acesse o Dashboard** em https://www.mercadopago.com.br/developers
3. **Vá para Credenciais:**
   - No menu lateral, clique em **Credentials** (ou **Credenciais**)
   - Você verá duas abas: **Production** e **Sandbox**
   - Use **Sandbox** para testes (não cobra)

4. **Copie os valores:**
   - **Access Token** (começa com `APP_USR-`)
   - **Public Key** (começa com `APP_USR-`)

## 2. Configurar no Backend

### Editar `.env`:

```bash
# Mercado Pago
MP_ACCESS_TOKEN=seu_access_token_aqui
MP_PUBLIC_KEY=seu_public_key_aqui
```

**Exemplo:**
```bash
MP_ACCESS_TOKEN=APP_USR-123456789-abcdef
MP_PUBLIC_KEY=APP_USR-9876543210-xyzabc
```

## 3. Endpoints Disponíveis

### 🔵 POST `/payment/pix-dinamico`

Cria um novo pagamento PIX com QR Code dinâmico

**Request:**
```json
{
  "amount": 99.90,
  "customer_email": "cliente@example.com",
  "customer_name": "João Silva"
}
```

**Response:**
```json
{
  "payment_id": 12345678,
  "reference": "FARM_1704124800000_ABC123",
  "amount": 99.90,
  "status": "pending",
  "qr_code": "00020126580014...",
  "copy_paste": "00020126580014br.gov.bcb.pix...",
  "created_at": "2026-01-02T10:00:00.000Z",
  "expires_at": "2026-01-02T10:30:00.000Z"
}
```

### 🔵 GET `/payment/pix-dinamico/{payment_id}`

Verifica o status de um pagamento

**Response:**
```json
{
  "payment_id": 12345678,
  "status": "approved",
  "status_label": "aprovado",
  "amount": 99.90,
  "created_at": "2026-01-02T10:00:00.000Z",
  "paid_at": "2026-01-02T10:05:30.000Z"
}
```

## 4. Possíveis Status de Pagamento

| Status | Significado | Ação |
|--------|------------|------|
| `pending` | Aguardando pagamento | Mostrar QR Code |
| `approved` | Pagamento confirmado ✅ | Confirmar pedido |
| `in_process` | Processando | Aguardar |
| `rejected` | Pagamento rejeitado | Tentar novamente |
| `cancelled` | Cancelado | Criar novo |

## 5. Teste Rápido (Sandbox)

### Via Postman ou Terminal:

```bash
curl -X POST http://localhost:3000/payment/pix-dinamico \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "customer_email": "teste@farmacia.com",
    "customer_name": "Cliente Teste"
  }'
```

## 6. Webhook (Opcional - Próximo Passo)

Para receber notificação automática quando o PIX for pago:

1. No Dashboard do Mercado Pago
2. Vá para **Configurações > Webhooks**
3. Configure URL de callback: `https://seu-dominio.com/webhooks/mercadopago`
4. Selecione eventos: `payment.created` e `payment.updated`

## ⚠️ Importante

- **SANDBOX**: Use para testes (não cobra real)
- **PRODUCTION**: Use quando estiver 100% pronto
- Nunca compartilhe seu Access Token
- Mantenha credenciais no `.env` (nunca no git)

## 🐛 Troubleshooting

### Erro: "401 Unauthorized"
→ Access Token inválido ou expirado

### Erro: "400 Bad Request"
→ Verifique o formato do JSON enviado

### QR Code vazio
→ Mercado Pago pode estar offline (raro)

## 📚 Documentação Oficial

https://www.mercadopago.com.br/developers/pt/docs

---

**Status:** ✅ Integração Completa
**Testado em:** Sandbox (Mercado Pago)
**Próximo:** Confirmar pagamentos com webhook

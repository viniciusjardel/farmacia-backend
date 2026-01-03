# 🎨 INTERFACE - MODAL PIX COM MERCADO PAGO

## Como Ficará na Tela do Cliente

```
┌─────────────────────────────────────────────────┐
│  🎯 Pagamento PIX Dinâmico                  [X] │
├─────────────────────────────────────────────────┤
│                                                 │
│  Escaneie o QR Code com seu app de banco       │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  │     ███████████████████████████          │  │
│  │     ██         PIX QR CODE        ██     │  │
│  │     ██      (GERADO DINÂMICO)     ██     │  │
│  │     ██                            ██     │  │
│  │     ██    (Único por cliente)      ██     │  │
│  │     ██                            ██     │  │
│  │     ███████████████████████████████      │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Ou copie essa chave:                          │
│  ┌──────────────────────────────────────────┐  │
│  │ 00020126580014br.gov.bcb.pix0136811...  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│      [📋 Copiar Chave PIX]                     │
│                                                 │
│  Valor a transferir:                           │
│      R$ 99,90                                  │
│  (verde bem grande e destacado)                │
│                                                 │
│  ID da transação:                              │
│  FARM_1704124800000_ABC123                     │
│                                                 │
│  ⏱️ Código válido por 30 minutos               │
│  Após transferir, seu pedido será              │
│  confirmado automaticamente.                   │
│                                                 │
│     [Entendi, vou transferir agora]            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Fluxo do Cliente

```
1. CARRINHO
   [Produto 1: R$ 21.90]
   [Produto 2: R$ 78.00]
   ────────────────────
   Total: R$ 99.90

2. CHECKOUT
   ☐ Entrega
   ☐ Retirada
   
3. PAGAMENTO
   [PIX] ← Cliente clica aqui
   [Dinheiro na Entrega]

4. MODAL APARECE
   ┌─ PIX DINÂMICO ─┐
   │ QR CODE AQUI   │
   │ R$ 99.90       │
   │ [Copiar Chave] │
   └────────────────┘

5. CLIENTE PAGA
   ✓ Escaneia QR Code OU
   ✓ Copia e cola a chave

6. CONFIRMAÇÃO
   "Pagamento confirmado! ✅"
   "Seu pedido foi confirmado"
   "Prazo de entrega: 2-3 dias"
```

## Dados Dinâmicos por Cliente

Cada cliente recebe:

```javascript
{
  payment_id: 12345678,           // Único do Mercado Pago
  reference: "FARM_..._ABC123",   // Referência sua
  amount: 99.90,                  // DINÂMICO (do carrinho)
  status: "pending",              // Pendente
  qr_code: "00020126...",         // QR CODE DINÂMICO
  copy_paste: "00020126...",      // Para copiar/colar
  created_at: "2026-01-02T...",   // Quando foi criado
  expires_at: "2026-01-02T..."    // Válido por 30min
}
```

## Por Que é Profissional?

✅ **Dinâmico**
   - Cada cliente recebe seu próprio QR Code
   - Não usa a chave fixa do farmacêutico

✅ **Seguro**
   - Mercado Pago valida e protege
   - Não exponha dados bancários

✅ **Rastreável**
   - Cada transação tem ID único
   - Fácil encontrar pagamentos

✅ **Automático**
   - Webhook confirma em tempo real
   - Cliente não precisa esperar

✅ **Profissional**
   - Dashboard no Mercado Pago
   - Relatórios e análises
   - Suporte certificado

---

## Exemplo de Webhook (Próximo)

Quando cliente pagar:

```javascript
POST /webhooks/mercadopago
{
  "action": "payment.updated",
  "data": {
    "id": 12345678,
    "status": "approved",  // ← Cliente pagou! ✅
    "status_detail": "accredited",
    "transaction_amount": 99.90,
    "date_approved": "2026-01-02T10:05:30.000Z"
  }
}

// Seu servidor recebe e:
1. Marca pedido como PAGO
2. Envia email ao cliente
3. Notifica admin
4. Prepara entrega
```

---

**Resultado Final: Sistema de pagamento igual ao das maiores plataformas de e-commerce! 🚀**

# ❌ DIAGNÓSTICO: O Que Falta para PIX Funcionar

## 📊 Estado Atual

### ✅ O Que Já Existe

1. **Backend** - Dependências instaladas:
   - ✅ `mercadopago` v2.11.0
   - ✅ `qrcode` v1.5.4
   - ✅ Credenciais Mercado Pago no `.env`

2. **Frontend** - Funções implementadas:
   - ✅ `createPixPayment(amount)` - chama endpoint `/payment/pix-dinamico`
   - ✅ `checkPixPaymentStatus(paymentId)` - verifica status
   - ✅ Modal com QR Code
   - ✅ Botões de pagamento PIX

### ❌ O Que FALTA

---

## 🔴 PROBLEMA 1: Endpoint `/payment/pix-dinamico` NÃO Existe!

**Status:** ❌ CRITICO

**O que está acontecendo:**
- Frontend tenta chamar `POST /payment/pix-dinamico` 
- Backend SÓ tem o endpoint `/payment/pix` (com PIX fixo)
- Resultado: **A requisição falha com erro 404**

**O que existe hoje:**
```javascript
// ✅ Endpoint que EXISTE:
router.post('/pix', async (req, res) => { ... })  // PIX fixo da farmácia

// ❌ Endpoint que FALTA:
router.post('/pix-dinamico', async (req, res) => { ... })  // Mercado Pago
```

**Solução:** Implementar endpoint `/pix-dinamico` com integração REAL do Mercado Pago

---

## 🔴 PROBLEMA 2: Endpoint GET `/pix-dinamico/:id` Incompleto

**Status:** ❌ CRITICO

**O que está faltando:**
- Verificação real do status no Mercado Pago (está comentado/TODO)
- Webhook para notificar quando pagamento for confirmado
- Integração com banco de dados para armazenar pagamentos

**Código atual (não funciona):**
```javascript
router.get('/pix/:paymentId', async (req, res) => {
    // TODO: Verificar status no Mercado Pago
    res.json({ id: paymentId, status: 'pending' }); // Sempre retorna 'pending'
});
```

---

## 🔴 PROBLEMA 3: Webhook Não Configurado

**Status:** ❌ CRITICO

**O que é:**
- Mercado Pago precisa avisar seu servidor quando o PIX for pago
- Sem webhook, nunca saberá que o pagamento foi confirmado
- Cliente fica preso na tela do QR Code esperando

**O que precisa fazer:**
1. Criar endpoint `POST /payment/webhook`
2. Cadastrar URL do webhook no painel Mercado Pago
3. Validar assinatura da requisição
4. Atualizar status do pagamento no banco de dados

---

## 🔴 PROBLEMA 4: Banco de Dados

**Status:** ⚠️ NÃO OTIMIZADO

**O que falta:**
- Tabela para armazenar pagamentos PIX
- Associar pagamento com pedido
- Rastrear status (pending → paid → confirmed)

**SQL sugerido:**
```sql
CREATE TABLE IF NOT EXISTS pix_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    status ENUM('pending', 'paid', 'failed', 'expired') DEFAULT 'pending',
    qr_code LONGTEXT,
    mercado_pago_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    order_id INT,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## 📋 CHECKLIST: O Que Precisa Ser Feito

- [ ] **1. Criar endpoint `POST /payment/pix-dinamico`**
  - Integrar com SDK Mercado Pago
  - Criar preferência de pagamento
  - Retornar QR Code dinâmico

- [ ] **2. Criar endpoint `GET /payment/pix-dinamico/:id`**
  - Consultar status real no Mercado Pago
  - Buscar dados do banco de dados

- [ ] **3. Criar tabela `pix_payments` no banco**
  - Armazenar histórico de pagamentos
  - Vincular com pedidos

- [ ] **4. Implementar webhook `POST /payment/webhook`**
  - Receber notificação do Mercado Pago
  - Atualizar status no banco
  - Confirmar pedido automaticamente

- [ ] **5. Configurar webhook no Mercado Pago**
  - URL do webhook: `https://seu-dominio.com/payment/webhook`
  - Eventos: `payment.created`, `payment.updated`

- [ ] **6. Testar fluxo completo**
  - Criar pagamento
  - Escanear QR Code
  - Efetuar transferência de teste
  - Webhook notificar
  - Status atualizar no frontend

---

## ⚡ Resumo Executivo

### Por que PIX não funciona agora?

1. ❌ **Endpoint inexistente:** `/payment/pix-dinamico` não existe
2. ❌ **Sem integração real:** SDK Mercado Pago não está sendo usado
3. ❌ **Sem webhook:** Pagamentos confirmados nunca são notificados
4. ❌ **Sem persistência:** Pagamentos não são armazenados no banco

### O que funciona?

- ✅ UI/Frontend está pronto
- ✅ Dependências instaladas
- ✅ Credenciais Mercado Pago configuradas
- ✅ PIX fixo funciona (mas não é o ideal)

### Tempo estimado para corrigir:

- **Implementação básica:** 30-45 minutos
- **Com webhook e validações:** 1-2 horas
- **Testes completos:** 30 minutos
- **Total:** ~2-2.5 horas

---

## 🚀 Próximo Passo

Quer que eu implemente os endpoints que faltam? Posso fazer tudo automaticamente!

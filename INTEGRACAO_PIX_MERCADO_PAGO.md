# Integração PIX com Mercado Pago

## 📋 Visão Geral

O sistema agora suporta pagamentos via PIX e Dinheiro na Entrega. A integração com PIX foi estruturada para aceitar Mercado Pago, mas você pode adaptá-la para qualquer gateway de pagamento.

---

## 🔧 Configuração Inicial

### 1. Criar Conta Mercado Pago (se ainda não tiver)
- Acesse: https://www.mercadopago.com.br
- Crie uma conta como vendedor
- Vá para: Credenciais > API (ou Configurações > API)

### 2. Obter Credenciais
Você precisará de:
- **Public Key**: Chave pública para o frontend
- **Access Token**: Token de acesso para o backend

### 3. Instalar Biblioteca Mercado Pago (Backend)

No diretório `backend/`, execute:

```bash
npm install mercadopago
```

---

## 🎯 Implementação Completa

### Frontend (script.js)

Já está configurado com:
- ✅ Interface de seleção de método de pagamento (PIX/Dinheiro)
- ✅ Validação de CPF
- ✅ Modal com QR Code PIX
- ✅ Fallback para Dinheiro na Entrega

**Você precisa atualizar:**

Linha 14 em `frontend/script.js`:
```javascript
const MERCADO_PAGO_PUBLIC_KEY = 'SEU_PUBLIC_KEY_AQUI'; // Adicione sua chave pública
```

### Backend (payment.routes.js)

O arquivo `backend/src/routes/payment.routes.js` está pronto, mas você precisa:

1. **Instalar SDK Mercado Pago:**
```bash
cd backend
npm install mercadopago
```

2. **Adicionar suas credenciais** em `backend/.env`:
```env
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
```

3. **Implementar a integração real** em `backend/src/routes/payment.routes.js`:

Substitua a função POST `/payment/pix`:

```javascript
const mercadopago = require('mercadopago');

router.post('/pix', async (req, res) => {
    try {
        // Configurar SDK
        mercadopago.configure({
            access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
        });

        const { amount, cpf, description } = req.body;

        // Criar preferência de pagamento
        let preference = {
            items: [
                {
                    id: '1',
                    title: description,
                    description: description,
                    picture_url: 'https://seu-site.com/logo.png',
                    category_id: 'pharmacy',
                    quantity: 1,
                    unit_price: parseFloat(amount)
                }
            ],
            payer: {
                email: 'seu-email@seu-site.com',
                identification: {
                    type: 'CPF',
                    number: cpf.replace(/\D/g, '')
                }
            },
            payment_methods: {
                excluded_payment_types: [
                    { id: 'ticket' },
                    { id: 'atm' }
                ],
                installments: 1
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/success`,
                failure: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/failure`,
                pending: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/pending`
            },
            auto_return: 'approved',
            external_reference: `pedido_${Date.now()}`,
            expires: true,
            expiration_date_from: new Date().toISOString(),
            expiration_date_to: new Date(Date.now() + 30 * 60000).toISOString()
        };

        const response = await mercadopago.preferences.create(preference);

        // Retornar dados para o frontend
        res.json({
            id: response.id,
            amount: amount,
            cpf: cpf,
            init_point: response.init_point, // URL de checkout do MP
            sandbox_init_point: response.sandbox_init_point, // Para teste
            created_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({
            error: 'Erro ao processar pagamento'
        });
    }
});
```

---

## 🧪 Modo Teste

Mercado Pago oferece credenciais de teste:

1. Na dashboard do Mercado Pago, ative "Modo Teste"
2. Use as credenciais de teste (diferentes das reais)
3. CPF de teste: `12345678900`
4. Cartão de teste: `4111111111111111`

---

## 📱 Fluxo de Pagamento PIX

1. Cliente seleciona **PIX** como método de pagamento
2. Insere seu **CPF** (validado)
3. Sistema cria ordem de pagamento no Mercado Pago
4. **QR Code** aparece em modal
5. Cliente escaneia o QR code e paga via PIX
6. Pagamento é confirmado automaticamente
7. Pedido é processado

---

## 💳 Fluxo de Pagamento Dinheiro

1. Cliente seleciona **Dinheiro**
2. Completa dados de entrega/retirada
3. Clica "Finalizar Pedido"
4. Pedido é enviado via **WhatsApp**
5. **Observação**: "Pagamento ao receber (Dinheiro)"
6. Admin confirma entrega

---

## 🔗 Endpoints Backend

### POST `/payment/pix`
**Criar pagamento PIX**

```json
{
  "amount": 45.50,
  "cpf": "12345678900",
  "description": "Compra Victor Farma"
}
```

Resposta:
```json
{
  "id": "pix_1234567890",
  "amount": 45.50,
  "cpf": "12345678900",
  "init_point": "https://www.mercadopago.com.br/...",
  "created_at": "2025-01-02T10:30:00Z"
}
```

### GET `/payment/pix/:paymentId`
**Verificar status do pagamento**

---

## 🛠️ Próximas Implementações

### Webhook para Confirmar Pagamento
Configure webhooks no Mercado Pago para confirmar pagamentos automaticamente:

```javascript
app.post('/payment/webhook', (req, res) => {
    const payment = req.body;
    
    if (payment.type === 'payment') {
        const paymentData = payment.data;
        
        if (paymentData.status === 'approved') {
            // Pedido confirmado
            // Salvar no banco de dados
            // Enviar email de confirmação
        }
    }
    
    res.sendStatus(200);
});
```

### Armazenar Pagamentos no Banco
Adicione tabela `orders` para rastrear pagamentos:

```sql
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(255),
    cpf VARCHAR(11),
    amount DECIMAL(10,2),
    status ENUM('pending', 'approved', 'failed', 'refunded'),
    delivery_method ENUM('delivery', 'pickup'),
    delivery_address TEXT,
    items JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## ⚠️ Segurança

- ✅ CPF validado no frontend
- ✅ Valores enviados do backend são confiáveis
- ✅ Tokens armazenados em variáveis de ambiente
- ⚠️ Nunca exponha `ACCESS_TOKEN` no frontend

---

## 📞 Suporte

- Documentação Mercado Pago: https://www.mercadopago.com.br/developers/pt
- Status API: https://www.mercadopago.com.br/developers/pt/support/health

---

## ✅ Checklist de Implementação

- [ ] Criar conta Mercado Pago
- [ ] Obter Public Key e Access Token
- [ ] Adicionar Public Key no `script.js` (linha 14)
- [ ] Adicionar Access Token no `backend/.env`
- [ ] Instalar `npm install mercadopago` no backend
- [ ] Implementar integração real em `payment.routes.js`
- [ ] Testar com credenciais de teste
- [ ] Configurar webhooks (opcional)
- [ ] Migrar para produção com credenciais reais

---

**Status Atual:** ✅ Frontend pronto | ⏳ Backend aguardando credenciais Mercado Pago

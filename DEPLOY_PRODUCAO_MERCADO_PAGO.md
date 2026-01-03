# 🚀 GUIA COMPLETO: Deploy + Credenciais de Produção do Mercado Pago

## 📌 Situação Atual

- ✅ Código pronto para produção
- ✅ Credenciais de TESTE funcionando (TEST-...)
- ❌ Server em localhost (não acessível pela internet)
- ❌ Credenciais de PRODUÇÃO bloqueadas (precisam de URL pública)

---

## 🔄 Fluxo Necessário

```
Seu código local
    ↓
GitHub (backup + controle de versão)
    ↓
Render/Heroku (deploy automático)
    ↓
URL pública (ex: seu-site.onrender.com)
    ↓
Mercado Pago credenciais de PRODUÇÃO
    ↓
PIX real funcionando! ✅
```

---

## 📋 PLANO DE AÇÃO (Estimado: 1-2 horas)

1. ✅ **Criar conta GitHub** (5 min)
2. ✅ **Fazer upload do código** (10 min)
3. ✅ **Fazer deploy no Render** (15 min)
4. ✅ **Obter URL pública** (5 min)
5. ✅ **Configurar variáveis de ambiente** (10 min)
6. ✅ **Obter credenciais de produção Mercado Pago** (15 min)
7. ✅ **Configurar webhook** (10 min)
8. ✅ **Testar PIX real** (20 min)

---

## PASSO 1: Criar Conta GitHub (Se Ainda Não Tiver)

### 1.1 Registre-se
- Acesse: https://github.com/signup
- Use um email válido
- Crie uma senha forte
- Verifique o email

### 1.2 Opcionalmente, configure autenticação
```powershell
# Configure Git globalmente
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@gmail.com"
```

---

## PASSO 2: Fazer Upload do Backend no GitHub

### 2.1 Criar novo repositório

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name:** `farmacia-backend`
   - **Description:** `Backend da Farmácia - Node.js + MySQL`
   - **Visibility:** Escolha entre Private ou Public
   - Deixe desmarcado "Add a README"
3. Clique **"Create repository"**

### 2.2 Fazer push do código (PowerShell)

```powershell
# Navegue até a pasta backend
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Copia\backend"

# Inicializar repositório Git local
git init

# Criar .gitignore (para não enviar arquivos sensíveis)
@"
node_modules/
.env
.DS_Store
*.log
backups/
uploads/
dist/
"@ | Set-Content -Path ".gitignore"

# Adicionar todos os arquivos
git add .

# Ver o que vai ser enviado
git status

# Fazer commit
git commit -m "Initial commit - Backend da Farmácia"

# Adicionar repositório remoto (SUBSTITUA SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/farmacia-backend.git

# Renomear branch para main
git branch -M main

# Fazer push (pode pedir autenticação)
git push -u origin main
```

**💡 Nota:** Na primeira vez, pode pedir para você logar no GitHub. Use seu email e senha.

### 2.3 Verificar se funcionou

- Acesse: https://github.com/SEU_USUARIO/farmacia-backend
- Deve ver seus arquivos lá ✅

---

## PASSO 3: Deploy no Render

### 3.1 Criar conta Render

1. Acesse: https://render.com
2. Clique em **"Get Started"** ou **"Sign up"**
3. Escolha **"Sign up with GitHub"**
4. Autorize o Render a acessar seus repositórios

### 3.2 Criar novo serviço web

1. No dashboard Render, clique **"New +"** → **"Web Service"**
2. Selecione o repositório `farmacia-backend`
3. Preencha:
   - **Name:** `farmacia-backend`
   - **Runtime:** `Node`
   - **Build command:** `npm install`
   - **Start command:** `node index.js`
   - **Plan:** Escolha **"Free"** (tem limitações, mas é grátis)

### 3.3 Configurar variáveis de ambiente

1. Vá em **"Environment"**
2. Adicione as seguintes variáveis:

```
PORT=3000

DB_HOST=seu_host_mysql
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=farmacia_db

JWT_SECRET=FARMACIA_2025_9xKQ2L@S!#P

MP_ACCESS_TOKEN=TEST-5312018787444285-010219-11d42d8c0e91ac7b162cdf6a5e1aa4ed-3013647225
MP_PUBLIC_KEY=TEST-78695f03-4a0d-4994-be9b-985624dc632e
```

### 3.4 Deploy

1. Clique em **"Create Web Service"**
2. Renderizará começará a fazer deploy (leva 2-5 minutos)
3. Quando estiver pronto, mostrará uma URL como:
   ```
   https://farmacia-backend-xxxx.onrender.com
   ```

**🎉 Parabéns! Seu backend está na internet!**

---

## PASSO 4: Atualizar Frontend com Nova URL

### 4.1 Atualizar script.js

No arquivo `frontend/script.js`, linha 1-5, substitua:

```javascript
// ANTES (localhost)
const getAPIURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return `http://${window.location.hostname}:3000`;
};

// DEPOIS (com URL Render)
const getAPIURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  // Usar URL do Render em produção
  return 'https://farmacia-backend-xxxx.onrender.com'; // SUBSTITUA COM SUA URL
};
```

---

## PASSO 5: Obter Credenciais de Produção Mercado Pago

### 5.1 Acessar Painel Mercado Pago

1. Vá para: https://www.mercadopago.com.br
2. Faça login na sua conta
3. Vá em **"Configurações"** → **"Integrações"** → **"Credenciais"**

### 5.2 Encontrar Credenciais de Produção

1. Na tela de credenciais, procure por:
   - **Public Key (Produção)** - começa com `APP_USR-`
   - **Access Token (Produção)** - token longo

### 5.3 Atualizar no Render

1. Vá no dashboard do Render
2. Selecione o serviço `farmacia-backend`
3. Vá em **"Environment"**
4. Substitua:
   ```
   MP_ACCESS_TOKEN=SEU_TOKEN_PRODUCAO_AQUI
   MP_PUBLIC_KEY=SUA_PUBLIC_KEY_PRODUCAO_AQUI
   ```
5. Clique em **"Save"** (Render vai fazer redeploy automaticamente)

---

## PASSO 6: Configurar Webhook no Mercado Pago

### 6.1 Acessar configurações webhook

1. No painel Mercado Pago, vá em:
   **Configurações** → **Integrações** → **Webhooks**

### 6.2 Adicionar novo webhook

1. Clique em **"Adicionar novo webhook"** ou **"Add new webhook"**
2. Preencha:
   - **URL:** `https://farmacia-backend-xxxx.onrender.com/payment/webhook`
   - **Eventos:** Selecione `payment.created` e `payment.updated`
3. Clique em **"Salvar"**

### 6.3 Implementar endpoint webhook (se ainda não existir)

Seu arquivo de rotas de pagamento deve ter:

```javascript
router.post('/webhook', async (req, res) => {
    try {
        console.log('🔔 Webhook recebido:', req.body);
        
        const { action, data } = req.body;
        
        if (action === 'payment.updated') {
            const paymentId = data.id;
            const paymentStatus = data.status;
            
            console.log(`✅ Pagamento ${paymentId} atualizado para: ${paymentStatus}`);
            
            // Aqui você atualiza o banco de dados
            // Se status === 'approved', marcar pedido como pago
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('❌ Erro no webhook:', error);
        res.status(500).json({ error: error.message });
    }
});
```

---

## PASSO 7: Testar PIX Real

### 7.1 Usando cartão de teste Mercado Pago

Se ainda estiver em produção de teste, use cartões virtuais do Mercado Pago:
- https://www.mercadopago.com.br/developers/pt/reference/cards

### 7.2 Testar no seu site

1. Acesse seu site (via Netlify ou URL direta do frontend)
2. Faça uma compra
3. Escolha **PIX** como método de pagamento
4. Escaneie o QR Code gerado (será QR Code REAL agora)
5. Faça uma transferência PIX real
6. Webhook deve notificar seu servidor
7. Pedido deve mudar para "Pago" automaticamente

---

## 🐛 Troubleshooting

### "Erro 404 - Endpoint não encontrado"
- Verifique se a URL do API_URL está correta
- Verifique se o backend está rodando no Render

### "Mercado Pago retorna erro de autenticação"
- Verifique se as credenciais estão certas
- Confirme que está usando credenciais de PRODUÇÃO (não teste)

### "Webhook não está sendo chamado"
- Confirme a URL do webhook está registrada no Mercado Pago
- Verifique os logs no Render (deve aparecer requisição POST)

### "PIX não gera QR Code"
- Verifique se a biblioteca `qrcode` está instalada (`npm list qrcode`)
- Veja os logs do servidor para erros

---

## 📊 Resumo do Que Você Vai Ter

| Componente | Antes | Depois |
|-----------|-------|--------|
| **Backend** | localhost:3000 | farmacia-backend-xxxx.onrender.com |
| **Credenciais MP** | TESTE (funciona local) | PRODUÇÃO (funciona real) |
| **QR Code PIX** | Fixo ou de teste | Dinâmico REAL |
| **Webhook** | Nenhum | Ativo e funcionando |
| **Pedidos** | Não confirmados auto | Confirmados automaticamente |

---

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código feito push para GitHub
- [ ] Deploy feito no Render
- [ ] URL pública funcionando
- [ ] Credenciais de produção obtidas
- [ ] Variáveis de ambiente atualizadas
- [ ] Webhook configurado no Mercado Pago
- [ ] Frontend atualizado com URL do Render
- [ ] Teste PIX funcionando com dados reais

---

## 🆘 Precisa de Ajuda?

Se algo não funcionar:
1. Verifique os logs do Render
2. Verifique o console do navegador (F12)
3. Verifique os logs do Mercado Pago

**Quer que eu implemente o webhook também?**

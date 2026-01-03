# 🎉 DEPLOY 100% GRATUITO: Backend + Frontend + Banco de Dados

## 🏗️ Arquitetura Gratuita

```
┌────────────────────────────┐
│   NETLIFY (Frontend)       │
│   Seu-site.netlify.app     │
│   ✅ Gratuito              │
└──────────┬─────────────────┘
           │ API calls
           ↓
┌────────────────────────────┐
│   RENDER (Backend)         │
│   seu-api.onrender.com     │
│   ✅ Gratuito (com limite) │
└──────────┬─────────────────┘
           │ Conexão banco
           ↓
┌────────────────────────────┐
│   PlanetScale (Banco MySQL)│
│   ✅ Gratuito              │
│   (até 1 milhão queries/mês)
└────────────────────────────┘
```

---

## 💰 Custo Total Mensal: **R$ 0,00**

| Serviço | Gratuito | Pago | Recomendado |
|---------|----------|------|-------------|
| **Netlify** | ✅ Ilimitado | - | FREE |
| **Render** | ✅ 750h/mês | - | FREE |
| **PlanetScale** | ✅ Até 1M queries | - | FREE |
| **Total** | **✅ R$ 0** | - | **FREE** |

---

## 📋 PLANO (Tempo: ~2 horas)

1. ✅ GitHub (repositórios)
2. ✅ PlanetScale (banco de dados MySQL)
3. ✅ Render (backend)
4. ✅ Netlify (frontend)
5. ✅ Conectar tudo
6. ✅ Testar PIX

---

## PASSO 1: Preparar GitHub

### 1.1 Crie 2 repositórios vazios

**Repositório 1 - Backend:**
- Nome: `farmacia-backend`
- Deixe vazio (não add README)

**Repositório 2 - Frontend:**
- Nome: `farmacia-frontend`
- Deixe vazio (não add README)

### 1.2 Fazer push do Backend

```powershell
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Copia\backend"

git init
git add .
git commit -m "Initial commit - Backend"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/farmacia-backend.git
git push -u origin main
```

### 1.3 Fazer push do Frontend

```powershell
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Copia\frontend"

git init
git add .
git commit -m "Initial commit - Frontend"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/farmacia-frontend.git
git push -u origin main
```

---

## PASSO 2: Criar Banco de Dados (PlanetScale) 🆓

### 2.1 Registre-se no PlanetScale

1. Acesse: https://planetscale.com
2. Clique em **"Sign Up"**
3. Use GitHub para logar (recomendado)
4. Complemente o perfil

### 2.2 Criar banco de dados

1. No dashboard, clique **"Create a database"**
2. Preencha:
   - **Name:** `farmacia_db`
   - **Plan:** Escolha **"Free"** 🆓
   - **Region:** Escolha a mais próxima (ex: São Paulo)
3. Clique **"Create database"**

### 2.3 Obter credenciais de conexão

1. Na página do banco, clique em **"Connect"**
2. Escolha **"Node.js"**
3. Copie a CONNECTION STRING:
   ```
   mysql://username:password@aws.connect.psdb.cloud/farmacia_db?sslaccept=strict
   ```

### 2.4 Criar as tabelas

1. Na interface do PlanetScale, clique em **"Console"**
2. Cole o SQL abaixo:

```sql
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    total_amount DECIMAL(10, 2),
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('pix', 'money') DEFAULT 'pix',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Tabela de pagamentos PIX
CREATE TABLE IF NOT EXISTS pix_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2),
    status ENUM('pending', 'paid', 'failed', 'expired') DEFAULT 'pending',
    qr_code LONGTEXT,
    mercado_pago_id VARCHAR(255),
    order_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

3. Clique em **"Execute"**

---

## PASSO 3: Deploy do Backend (Render) 🆓

### 3.1 Acesse Render.com

1. Vá em: https://render.com
2. Clique em **"Sign up with GitHub"**
3. Autorize o Render

### 3.2 Criar Web Service

1. Clique em **"New +"** → **"Web Service"**
2. Selecione: `farmacia-backend`
3. Preencha:
   - **Name:** `farmacia-backend`
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `node index.js`
   - **Plan:** Free
4. Clique **"Create Web Service"**

### 3.3 Configurar Variáveis de Ambiente

Na página do serviço, vá em **"Environment"** e adicione:

```
PORT=3000

DB_HOST=aws.connect.psdb.cloud
DB_USER=SEU_USUARIO_PLANETSCALE
DB_PASSWORD=SUA_SENHA_PLANETSCALE
DB_NAME=farmacia_db

JWT_SECRET=FARMACIA_2025_9xKQ2L@S!#P

MP_ACCESS_TOKEN=TEST-5312018787444285-010219-11d42d8c0e91ac7b162cdf6a5e1aa4ed-3013647225
MP_PUBLIC_KEY=TEST-78695f03-4a0d-4994-be9b-985624dc632e
```

### 3.4 Deploy

O Render vai fazer deploy automaticamente. Espere 2-5 minutos.

**Resultado:** URL como `https://farmacia-backend-xxxx.onrender.com` ✅

---

## PASSO 4: Deploy do Frontend (Netlify) 🆓

### 4.1 Atualizar URL da API no Frontend

No arquivo `frontend/script.js`, substitua a função no início:

```javascript
const getAPIURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  // URL do Render (substituir pela sua)
  return 'https://farmacia-backend-xxxx.onrender.com';
};
```

### 4.2 Fazer push da atualização

```powershell
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Copia\frontend"

git add .
git commit -m "Update API URL to production"
git push origin main
```

### 4.3 Conectar ao Netlify

1. Vá em: https://netlify.com
2. Clique em **"Sign up"** com GitHub
3. Clique em **"New site from Git"**
4. Selecione `farmacia-frontend`
5. Preencha:
   - **Build command:** (deixe em branco - é HTML/CSS/JS puro)
   - **Publish directory:** `.` (raiz do projeto)
6. Clique **"Deploy site"**

### 4.4 Resultado

Você receberá uma URL como:
```
https://seu-farmacia.netlify.app
```

---

## PASSO 5: Testar a Integração

### 5.1 Verificar conexão do Backend com Banco

```powershell
# No terminal, faça uma requisição de teste
$response = Invoke-WebRequest -Uri "https://seu-api.onrender.com/products" -Method GET
$response.Content | ConvertFrom-Json
```

Deve retornar lista de produtos (vazia no início).

### 5.2 Testar no Frontend

1. Abra: `https://seu-farmacia.netlify.app`
2. Verifique se carrega os produtos
3. Teste adicionar um produto ao carrinho
4. Teste fazer uma compra com PIX

---

## 🚨 Limitações (Importante!)

### Render (Backend)
- ⏱️ **750 horas/mês** (aprox 1 mês contínuo)
- 🔌 Dorme após 15 min inatividade (primeira requisição demora 30s)
- ✅ Ideal para: Farmácia com poucos acessos

### PlanetScale (Banco)
- 📊 **1 milhão de queries/mês** 
- 💾 **10GB de armazenamento**
- ✅ Ideal para: Iniciar e crescer

### Netlify (Frontend)
- 📱 Ilimitado
- 🚀 Deploy automático ao fazer push
- ✅ Ideal para: Produção total

---

## ⚠️ Quando Considerar Pago?

Se houver:
- ❌ Mais de 1M queries de banco/mês
- ❌ Mais de 750h de processamento backend/mês
- ❌ Milhares de usuários simultâneos

**Então considere:**
- Backend pago: Heroku ($7/mês) ou Railway ($5/mês crédito)
- Banco pago: PlanetScale Pro ($39/mês)

Mas para começar, **gratuito é suficiente!**

---

## 📋 CHECKLIST FINAL

- [ ] 2 repositórios criados no GitHub
- [ ] Código feito push (backend + frontend)
- [ ] Banco criado no PlanetScale
- [ ] Tabelas criadas
- [ ] Backend deployado no Render
- [ ] URL do Render obtida
- [ ] Frontend atualizado com URL nova
- [ ] Frontend deployado no Netlify
- [ ] URL do Netlify funcionando
- [ ] PIX testado e funcionando

---

## 🎯 Resultado Final

| Item | URL | Status |
|------|-----|--------|
| **Frontend** | https://seu-farmacia.netlify.app | ✅ 100% Gratuito |
| **Backend** | https://farmacia-backend-xxxx.onrender.com | ✅ 100% Gratuito |
| **Banco de Dados** | PlanetScale | ✅ 100% Gratuito |
| **PIX Dinâmico** | Mercado Pago | ✅ Funcional |
| **Total Mensal** | - | **✅ R$ 0,00** |

---

## 🆘 Próximos Passos

Quer que eu:
- ✅ Implemente o endpoint `/payment/pix-dinamico` faltante?
- ✅ Configure o webhook automático?
- ✅ Crie o SQL para PlanetScale?
- ✅ Atualize script.js com URL correta?

**Qual você quer fazer primeiro?**

# 🚀 Guia de Deploy - Netlify + Render

## Arquitetura Final

```
┌─────────────────────────────────────────────┐
│         NETLIFY (Frontend)                  │
│  seu-dominio.netlify.app                    │
└────────────┬────────────────────────────────┘
             │ API calls
             ↓
┌─────────────────────────────────────────────┐
│         RENDER (Backend + BD)               │
│  seu-api.onrender.com                       │
└─────────────────────────────────────────────┘
```

---

## 🔴 PASSO 1: Preparar o Backend (JÁ FEITO!)

✅ Procfile criado
✅ .env.example criado
✅ init-db.js criado

---

## 🟡 PASSO 2: Criar Conta no GitHub

1. Vá para: https://github.com
2. Clique em "Sign up"
3. Complete o registro
4. **Você vai precisar de 2 repositórios:**
   - Um para o `backend`
   - Um para o `frontend`

---

## 🟢 PASSO 3: Upload do Backend no GitHub

### 3.1 - Criar repositório do backend

1. Vá para: https://github.com/new
2. Nome: `farmacia-backend`
3. Descrição: `Backend da Farmácia - Node.js + MySQL`
4. Deixe como **Private** (ou Public, como preferir)
5. **Não marque** "Add a README"
6. Clique em "Create repository"

### 3.2 - Fazer upload do código

Abra o **PowerShell** na pasta `backend`:

```powershell
# Navegar até o backend
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Copia\backend"

# Inicializar git
git init

# Adicionar todos os arquivos EXCETO node_modules e .env
git add .
git rm -r --cached node_modules
git status  # Verificar se aparece node_modules em vermelho

# Criar arquivo .gitignore para não enviar arquivos sensíveis
$gitignore = @"
node_modules/
.env
.DS_Store
*.log
backups/
uploads/
"@ | Set-Content -Path ".gitignore"

# Adicionar novamente
git add .gitignore

# Fazer commit
git commit -m "Initial commit - Backend setup"

# Adicionar repositório remoto (SUBSTITUA usuario/farmacia-backend)
git remote add origin https://github.com/SEU_USUARIO/farmacia-backend.git

# Fazer push para main
git branch -M main
git push -u origin main
```

---

## 🔵 PASSO 4: Deploy no Render

### 4.1 - Criar conta Render

1. Vá para: https://render.com
2. Clique em "Sign up"
3. Use sua conta GitHub
4. Autorize o Render a acessar seus repositórios

### 4.2 - Criar Web Service para o Backend

1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Selecione o repositório `farmacia-backend`
3. Configure:
   - **Name:** `farmacia-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (gratuito)

4. Clique em **"Create Web Service"** e aguarde

### 4.3 - Configurar Banco de Dados MySQL

1. No dashboard do Render, clique em **"New +"** → **"MySQL"**
2. Configure:
   - **Name:** `farmacia-db`
   - **MySQL Version:** 8
   - **Plan:** Free (gratuito)

3. Clique em **"Create Database"** e aguarde (pode levar 5 minutos)

### 4.4 - Adicionar variáveis de ambiente

**No Web Service `farmacia-api`:**

1. Vá para **Settings** → **Environment**
2. Adicione as variáveis (copiar do seu `.env`):
   ```
   PORT=3000
   DB_HOST=<copiar de "External Database URL" do MySQL>
   DB_USER=<nome de usuário do MySQL>
   DB_PASSWORD=<senha do MySQL>
   DB_NAME=farmacia_db
   JWT_SECRET=FARMACIA_2025_9xKQ2L@S!#P
   MP_ACCESS_TOKEN=<sua credencial de produção>
   MP_PUBLIC_KEY=<sua credencial de produção>
   ```

3. Salve as mudanças

### 4.5 - Executar inicialização do banco de dados

No Web Service:
1. Vá para **Shell**
2. Execute:
   ```
   node init-db.js
   ```
3. Se houver erro, verifique as credenciais do banco de dados

---

## 📱 PASSO 5: Preparar o Frontend

### 5.1 - Obter URL do Backend

Na página do Web Service no Render, copie a URL que aparece no topo (ex: `https://farmacia-api.onrender.com`)

### 5.2 - Atualizar URL do Backend

Abra `frontend/script.js` e encontre:

```javascript
const getAPIURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return `http://${window.location.hostname}:3000`;
};
```

Substitua por:

```javascript
const getAPIURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return 'https://farmacia-api.onrender.com'; // ← sua URL do Render
};
```

### 5.3 - Preparar repositório do Frontend

Abra o **PowerShell** na pasta `frontend`:

```powershell
# Navegar até o frontend
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Copia\frontend"

# Inicializar git
git init

# Criar .gitignore
$gitignore = @"
node_modules/
.DS_Store
*.log
.env
uploads/
"@ | Set-Content -Path ".gitignore"

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - Frontend setup"

# Adicionar repositório remoto (SUBSTITUA usuario/farmacia-frontend)
git remote add origin https://github.com/SEU_USUARIO/farmacia-frontend.git

# Fazer push para main
git branch -M main
git push -u origin main
```

---

## 🌐 PASSO 6: Deploy no Netlify

### 6.1 - Criar conta Netlify

1. Vá para: https://app.netlify.com
2. Clique em "Sign up"
3. Use sua conta GitHub
4. Autorize o Netlify a acessar seus repositórios

### 6.2 - Deploy automático

1. No dashboard do Netlify, clique em **"New site from Git"**
2. Selecione GitHub
3. Escolha o repositório `farmacia-frontend`
4. Configure:
   - **Build command:** (deixe vazio)
   - **Publish directory:** `.` (raiz da pasta)
5. Clique em **"Deploy site"** e aguarde

### 6.3 - Seu site está online! 🎉

Netlify vai gerar uma URL como: `https://nome-aleatorio.netlify.app`

Você pode depois criar um domínio customizado!

---

## ✅ Checklist Final

- [ ] Backend está no GitHub
- [ ] Backend está deployado no Render
- [ ] Banco de dados MySQL está criado no Render
- [ ] Variáveis de ambiente estão configuradas
- [ ] Frontend atualizado com URL do Render
- [ ] Frontend está no GitHub
- [ ] Frontend está deployado no Netlify
- [ ] Site está funcionando corretamente

---

## 🔧 Testando a Aplicação

1. Acesse: `https://seu-site.netlify.app`
2. Adicione um produto ao carrinho
3. Finalize a compra com PIX
4. Verifique se as credenciais aparecem corretamente

---

## ⚠️ Troubleshooting

### "Erro ao conectar ao banco de dados"
- Verifique as credenciais no Render
- Certifique-se de que o MySQL está rodando
- Execute `node init-db.js` novamente

### "API não encontrada"
- Verifique se a URL no script.js está correta
- Certifique-se de que o Render está rodando (verifique logs)

### "Site sem CSS/Images"
- Verifique o `_redirects` no Netlify (deve estar na raiz do frontend)

---

## 📞 Próximos Passos

Depois de tudo funcionando:
1. Registre um domínio personalizado
2. Configure HTTPS (automático no Netlify/Render)
3. Configure webhooks do Mercado Pago
4. Faça a primeira venda! 🎉

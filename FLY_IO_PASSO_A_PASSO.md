# 🎯 GUIA PASSO A PASSO: Instalação e Configuração Fly.io

## PARTE 1: INSTALAÇÃO

### Passo 1.1: Abrir o PowerShell

1. Pressione **Windows + R**
2. Digite: `powershell`
3. Pressione **Enter**

Você verá uma tela preta com `PS C:\Users\seu_usuario>`

### Passo 1.2: Copiar e Colar o Comando de Instalação

**Copie este código inteiro:**

```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**No PowerShell:**
1. Clique direito na tela
2. Selecione **"Paste"** (ou Ctrl+V)
3. Pressione **Enter**

**Vai começar a instalar (leva 1-2 minutos)**

Você verá mensagens como:
```
Downloading Fly CLI installer...
Installing...
Done!
```

### Passo 1.3: Verificar se Instalou Corretamente

Depois que terminar, **no mesmo PowerShell**, digite:

```powershell
flyctl version
```

Pressione **Enter**.

**Resultado esperado:**
```
flyctl v0.1.50 ...
```

Se mostrou uma versão, **instalação OK!** ✅

Se não funcionou, tente isto no PowerShell:
```powershell
choco install flyctl
```

---

## PARTE 2: FAZER LOGIN

### Passo 2.1: Login no Fly.io

No PowerShell, digite:

```powershell
flyctl auth login
```

Pressione **Enter**.

### Passo 2.2: Autorizar no Navegador

Vai abrir uma aba no navegador pedindo para fazer login:
- **Se não tiver conta:** Clique em "Sign Up" e crie com GitHub
- **Se tiver conta:** Clique em "Log In" e use GitHub

Depois volta para o PowerShell automaticamente.

**Você verá:**
```
✓ Logged in as seu_usuario
```

Se viu isso, **login OK!** ✅

---

## PARTE 3: CRIAR E CONFIGURAR O APP

### Passo 3.1: Navegar até a Pasta Backend

No PowerShell, digite exatamente isto:

```powershell
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Copia\backend"
```

Pressione **Enter**.

Você deve ver:
```
PS C:\Users\jarde\OneDrive\Desktop\Farmácia - Copia\backend>
```

### Passo 3.2: Criar o App no Fly.io

Digite:

```powershell
flyctl launch
```

Pressione **Enter**.

### Passo 3.3: Responder as Perguntas

O Fly.io vai fazer perguntas. **Aqui está como responder:**

**Pergunta 1: "App Name?"**
```
farmacia-backend
```
(ou qualquer nome que quiser, sem espaços)

Pressione **Enter**.

**Pergunta 2: "Region?"**
```
gig
```
(São Paulo)

Pressione **Enter**.

**Pergunta 3: "Would you like to set up a Postgresql database?"**
```
N
```
(Não, já temos Supabase)

Pressione **Enter**.

**Pergunta 4: "Deploy now?"**
```
N
```
(Não, vamos configurar as variáveis primeiro)

Pressione **Enter**.

### Passo 3.4: Resultado

Você verá mensagens de sucesso. Pronto! ✅

---

## PARTE 4: ADICIONAR VARIÁVEIS DE AMBIENTE

### Passo 4.1: Configurar Database URL

**Still no PowerShell**, na pasta backend, digite:

```powershell
flyctl secrets set DATABASE_URL="postgresql://postgres:victorguto1540@db.orkhgcydlvlnhmqvghuz.supabase.co:5432/postgres"
```

Pressione **Enter**.

Você verá:
```
✓ Created secret DATABASE_URL
```

### Passo 4.2: Configurar JWT Secret

Digite:

```powershell
flyctl secrets set JWT_SECRET="FARMACIA_2025_9xKQ2L@S!#P"
```

Pressione **Enter**.

Você verá:
```
✓ Created secret JWT_SECRET
```

### Passo 4.3: Configurar MP Access Token

Digite:

```powershell
flyctl secrets set MP_ACCESS_TOKEN="TEST-5312018787444285-010219-11d42d8c0e91ac7b162cdf6a5e1aa4ed-3013647225"
```

Pressione **Enter**.

Você verá:
```
✓ Created secret MP_ACCESS_TOKEN
```

### Passo 4.4: Configurar MP Public Key

Digite:

```powershell
flyctl secrets set MP_PUBLIC_KEY="TEST-78695f03-4a0d-4994-be9b-985624dc632e"
```

Pressione **Enter**.

Você verá:
```
✓ Created secret MP_PUBLIC_KEY
```

---

## PARTE 5: FAZER O DEPLOY

### Passo 5.1: Deploy

No PowerShell, ainda na pasta backend, digite:

```powershell
flyctl deploy
```

Pressione **Enter**.

### Passo 5.2: Aguardar Deploy

Vai começar a fazer o deploy. Você verá muitas mensagens:
```
Creating image ...
Pushing to registry ...
Building ...
Deploying ...
```

**AGUARDE 3-5 MINUTOS** (não cancele!)

Quando terminar, verá:
```
✓ Deployment complete
```

---

## PARTE 6: OBTER SUA URL

### Passo 6.1: Ver Informações do App

No PowerShell, digite:

```powershell
flyctl info
```

Pressione **Enter**.

### Passo 6.2: Copiar a URL

Você verá algo assim:
```
App
  Name     = farmacia-backend
  Status   = running
  Hostname = farmacia-backend.fly.dev
```

**A URL é:** `https://farmacia-backend.fly.dev`

(Pode ter um nome diferente se escolheu outro nome no passo 3.3)

---

## ✅ PRONTO!

Você tem:
- ✅ Fly.io CLI instalado
- ✅ Conta criada
- ✅ App criado
- ✅ Variáveis configuradas
- ✅ Deploy feito
- ✅ URL funcionando

---

## 📌 Próximo Passo

**Quando conseguir a URL, me avisa e vamos:**
1. Atualizar o frontend
2. Fazer deploy no Netlify
3. Implementar PIX dinâmico

**Qual é a URL que você recebeu?** 🚀

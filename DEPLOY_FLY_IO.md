# 🚀 Deploy no Fly.io (100% Gratuito)

## ✅ Vantagens
- ✅ Completamente GRATUITO (sem cartão)
- ✅ Não dorme (sempre rodando)
- ✅ Deploy automático do GitHub
- ✅ Rápido e confiável

---

## PASSO 1: Instalar o Fly.io CLI

### No PowerShell, execute:

```powershell
# Instalar Fly.io CLI
iwr https://fly.io/install.ps1 -useb | iex
```

Se não funcionar, tente:
```powershell
choco install flyctl
```

Se não tiver Chocolatey, execute antes:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Verificar instalação:
```powershell
flyctl version
```

Deve mostrar a versão (ex: v0.1.50)

---

## PASSO 2: Fazer Login no Fly.io

```powershell
flyctl auth login
```

Isso vai:
1. Abrir o navegador
2. Você faz login/signup com GitHub
3. Volta para o terminal automaticamente

---

## PASSO 3: Criar arquivo `fly.toml` no Backend

No PowerShell, navegue até a pasta backend e execute:

```powershell
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Copia\backend"

# Criar app no Fly.io
flyctl launch
```

Responda as perguntas:
- **App name:** `farmacia-backend` (ou qualquer nome único)
- **Region:** `gig` (São Paulo é melhor, mas qualquer um funciona)
- **Databases:** Não (já tem Supabase)
- **Deploy now:** `N` (vamos configurar variáveis primeiro)

Isso vai criar um arquivo `fly.toml`.

---

## PASSO 4: Configurar Variáveis de Ambiente

No PowerShell, ainda na pasta backend:

```powershell
flyctl secrets set DATABASE_URL="postgresql://postgres:victorguto1540@db.orkhgcydlvlnhmqvghuz.supabase.co:5432/postgres"

flyctl secrets set JWT_SECRET="FARMACIA_2025_9xKQ2L@S!#P"

flyctl secrets set MP_ACCESS_TOKEN="TEST-5312018787444285-010219-11d42d8c0e91ac7b162cdf6a5e1aa4ed-3013647225"

flyctl secrets set MP_PUBLIC_KEY="TEST-78695f03-4a0d-4994-be9b-985624dc632e"
```

---

## PASSO 5: Fazer Deploy

```powershell
flyctl deploy
```

Isso vai:
1. Fazer build do seu código
2. Criar imagem Docker
3. Enviar para Fly.io
4. Ligar a aplicação

Aguarde 2-3 minutos...

---

## PASSO 6: Obter a URL

Quando terminar, execute:

```powershell
flyctl open
```

Isso abre seu app no navegador. A URL será algo como:
```
https://farmacia-backend.fly.dev
```

**Ou veja no console:**
```powershell
flyctl info
```

---

## ✅ Resultado

Você terá sua URL final tipo:
```
https://farmacia-backend.fly.dev
```

**Salve essa URL!** Você vai usar no frontend e no Mercado Pago (webhook).

---

## 🐛 Troubleshooting

### "flyctl: command not found"
Feche e abra o PowerShell novamente, ou reinicie o PC.

### "Build failed"
Verifique se o `package.json` está correto e se tem `node_modules` instalados:
```powershell
npm install
```

### "Health check failed"
Pode levar alguns minutos. Tente:
```powershell
flyctl logs
```

Para ver o que está errado.

---

## 📋 Próximos Passos

Quando tiver a URL do Fly.io, você vai:
1. ✅ Atualizar o frontend com essa URL
2. ✅ Fazer deploy do frontend no Netlify
3. ✅ Implementar o PIX dinâmico
4. ✅ Configurar webhook

**Quando conseguir a URL, avisa aqui!** 🎉

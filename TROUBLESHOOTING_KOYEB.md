# 🔧 TROUBLESHOOTING - Deploy Koyeb & PostgreSQL

## 🆘 Erros Comuns e Soluções

### 1. "Error: connect ETIMEDOUT" ❌ → ✅ RESOLVIDO

**Erro Original:**
```
❌ Erro MySQL: Error: connect ETIMEDOUT
    at Connection._handleTimeoutError
```

**Causa:** Tentando conectar em MySQL quando credenciais são PostgreSQL

**Solução Aplicada:**
✅ Migração de `mysql2` para `pg`
✅ Atualizado `DATABASE_URL` para PostgreSQL
✅ Implementado conversor de placeholders

**Como confirmar:**
```bash
npm start
# Esperado: "✅ PostgreSQL pronto"
```

---

### 2. "permission denied, mkdir '/frontend/uploads'" ❌ → ✅ RESOLVIDO

**Erro Original:**
```
⚠️ Não foi possível criar pasta de uploads: EACCES: permission denied, mkdir '/frontend/uploads'
```

**Causa:** Koyeb não permite criar pastas em caminho absoluto `/frontend/`

**Solução Aplicada:**
✅ Usar `/tmp/farmacia-uploads` em produção
✅ Manter `frontend/uploads` em desenvolvimento
✅ Automático via `NODE_ENV`

**Código:**
```javascript
const uploadsDir = process.env.NODE_ENV === 'production' 
  ? path.join(os.tmpdir(), 'farmacia-uploads')
  : path.join(__dirname, '..', 'frontend', 'uploads');
```

---

### 3. "Cannot find module 'mysql2'" ❌ → ✅ RESOLVIDO

**Erro:**
```
Error: Cannot find module 'mysql2'
```

**Causa:** mysql2 foi removido de package.json

**Solução:** ✅ `npm install` já executado com `pg`

**Como confirmar:**
```bash
npm list pg
# Esperado: pg@8.11.3
```

---

### 4. "Dockerfile not found"

**Erro:**
```
Error: Dockerfile not found at backend/Dockerfile
```

**Solução:**
- ✅ Arquivo criado: `backend/Dockerfile`
- Verifique Build Context: `backend`
- Dockerfile Path: `Dockerfile` (não `backend/Dockerfile`)

---

### 5. "Port is already in use"

**Erro:**
```
Error: listen EADDRINUSE :::8000
```

**Local:**
```bash
# Matar processo na porta 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Koyeb:**
- Seu serviço anterior está rodando
- Pause ou delete antes de criar novo

---

## 📊 Checklist de Debug

### ✅ Dependências
```bash
cd backend
npm list pg          # Deve estar instalado
npm list mysql2      # NÃO deve estar
```

### ✅ Variáveis de Ambiente
```bash
# Linux/Mac
echo $DATABASE_URL

# Windows PowerShell
$env:DATABASE_URL
```

**Esperado:**
```
postgresql://postgres:victorguto1540@db.orkhgcydlvlnhmqvghuz.supabase.co:5432/postgres
```

### ✅ Teste de Conexão Local
```bash
npm start

# Esperado na saída:
# 🔥 BACKEND INICIADO 🔥
# 🚀 Backend rodando em http://localhost:8000
# ✅ PostgreSQL pronto (ou erro DNS se sem internet)
```

### ✅ Teste de Conexão PostgreSQL
```bash
psql "postgresql://postgres:victorguto1540@db.orkhgcydlvlnhmqvghuz.supabase.co:5432/postgres"

# Se conectar: \dt (listar tabelas)
# Se desconectar: \q
```

---

## 🔍 Logs no Koyeb

### Ver Logs em Tempo Real
1. Abra https://app.koyeb.com
2. Selecione seu serviço
3. Clique em "Logs"
4. Filtro: Últimas 24h

### Tipos de Log
```
STDERR    ❌ Erros
STDOUT    ℹ️ Informações
LOGS      📝 Custom console.log()
```

### Exemplos de Logs Esperados
```
✅ [STDOUT] 🔥 BACKEND INICIADO 🔥
✅ [STDOUT] 🚀 Backend rodando em http://localhost:8000
✅ [STDOUT] ✅ PostgreSQL pronto
✅ [STDOUT] ➡️ REQUISIÇÃO: GET /
```

### Exemplos de Erros
```
❌ [STDERR] Error: connect ETIMEDOUT          → Ver solução #1
❌ [STDERR] permission denied, mkdir          → Ver solução #2
❌ [STDERR] Cannot find module 'mysql2'       → Ver solução #3
```

---

## 🧪 Testes Pós-Deploy

### 1. Verificar se Backend está Rodando
```bash
curl https://seu-app.koyeb.app

# Esperado:
# {"message":"API da Farmácia está rodando"}
```

### 2. Listar Categorias
```bash
curl https://seu-app.koyeb.app/categories

# Esperado: Array JSON com categorias
```

### 3. Listar Produtos
```bash
curl https://seu-app.koyeb.app/products

# Esperado: Array JSON com produtos
```

### 4. Health Check
```bash
# Koyeb testa automaticamente
# Healthcheck a cada 30s
# Must respond 200 OK na porta 8000
```

---

## ⚡ Performance

### Otimizações Aplicadas

| Item | Status |
|------|--------|
| Node Alpine Image | ✅ Menor (20-alpine) |
| npm ci vs npm install | ✅ Mais rápido |
| .dockerignore | ✅ Sem node_modules |
| Healthcheck | ✅ Automático |
| SSL PostgreSQL | ✅ Configurado |

### Tempo de Deploy Esperado
- Build: 1-2 minutos
- Deploy: 1-2 minutos  
- **Total**: 3-5 minutos

---

## 🔐 Segurança

### ✅ Implementado

- [x] SSL PostgreSQL ativado
- [x] Variáveis sensitivas não em git
- [x] .env não trackado
- [x] .dockerignore configurado
- [x] Secrets no Koyeb (não em arquivo)

### ⚠️ NÃO FAÇA

```bash
# ❌ Nunca comitar .env
git add .env          # NÃO FAÇA

# ❌ Nunca expor credenciais em logs
console.log(process.env.DATABASE_URL)  # NÃO FAÇA

# ❌ Nunca usar credenciais em código
const url = 'postgresql://user:pass@...';  // NÃO FAÇA
```

---

## 📞 Suporte Adicional

### Se Problema Persistir

1. **Verificar .env no Koyeb**
   - Painel → Service → Settings → Env vars
   - DATABASE_URL deve estar presente

2. **Reconstruir Imagem Docker**
   - Painel → Service → Redeploy
   - Force rebuild ativado

3. **Limpar Cache**
   - Koyeb → Service → Restart
   - Esperar 30s

4. **Verificar Logs Detalhados**
   - `tail -f` dos logs
   - Procure por erros específicos

### Informações para Relatório

Se precisar pedir ajuda, forneça:

```
Koyeb Logs (últimas 50 linhas):
[PASTE AQUI]

Variáveis de Ambiente (sem credenciais):
DATABASE_URL: postgresql://...
NODE_ENV: production
PORT: 8000

Erro específico:
[DESCREVA AQUI]

Quando começou:
[DATA/HORA]
```

---

## ✨ Checklist Final Pré-Deploy

- [ ] `npm install` executado
- [ ] `npm start` testa localmente
- [ ] `Dockerfile` presente em `backend/`
- [ ] `.dockerignore` presente
- [ ] `DATABASE_URL` está correto
- [ ] `PORT=8000` no .env
- [ ] `NODE_ENV` não definido ou `development`
- [ ] Arquivo `.env` **não** está em git
- [ ] Koyeb secrets configurados
- [ ] GitHub repo atualizado

---

**Se ainda tiver problemas, consulte `KOYEB_DEPLOY_GUIA.md` ou teste localmente com `npm start`**

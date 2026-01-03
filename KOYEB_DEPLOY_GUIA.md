# 🚀 Guia de Deploy no Koyeb - PostgreSQL

## ✅ Mudanças Realizadas

Seu backend foi **atualizado para usar PostgreSQL (Supabase)** em vez de MySQL:

### 📦 Dependências
- ❌ Removido: `mysql2`
- ✅ Adicionado: `pg` (PostgreSQL client)

### 🔧 Arquivos Modificados
1. **package.json** - Dependências atualizadas
2. **src/config/database.js** - Novo wrapper para PostgreSQL
3. **backend/index.js** - Convertido para PostgreSQL com helper `pgQuery()`
4. **init-db.js** - Atualizado para PostgreSQL
5. **Dockerfile** - Criado para containerização

---

## 🎯 Deploy no Koyeb

### Passo 1: Push para Git
```powershell
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Copia"
git add .
git commit -m "🔄 Migrando de MySQL para PostgreSQL (Supabase)"
git push origin main
```

### Passo 2: Conectar Koyeb ao GitHub
1. Abra https://app.koyeb.com
2. Clique em "Create Service"
3. Selecione "GitHub"
4. Autorize e selecione seu repositório
5. Selecione branch: `main`

### Passo 3: Configurar Build
- **Dockerfile path**: `backend/Dockerfile`
- **Build context**: `backend`
- **Ports**: `8000`

### Passo 4: Variáveis de Ambiente

Adicione no Koyeb:

```
DATABASE_URL=postgresql://postgres:victorguto1540@db.orkhgcydlvlnhmqvghuz.supabase.co:5432/postgres

DB_HOST=db.orkhgcydlvlnhmqvghuz.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=victorguto1540
DB_NAME=postgres

JWT_SECRET=FARMACIA_2025_9xKQ2L@S!#P

MP_ACCESS_TOKEN=TEST-5312018787444285-010219-11d42d8c0e91ac7b162cdf6a5e1aa4ed-3013647225
MP_PUBLIC_KEY=TEST-78695f03-4a0d-4994-be9b-985624dc632e

NODE_ENV=production
PORT=8000
```

### Passo 5: Deploy
Clique em "Deploy" e aguarde 3-5 minutos.

---

## 🔍 Testando a Conexão

```bash
# Ver logs
koyeb logs --follow

# Testar endpoint
curl https://seu-app.koyeb.app

# Resposta esperada
{"message": "API da Farmácia está rodando"}
```

---

## ⚠️ Possíveis Problemas e Soluções

### 1. "Error: connect ETIMEDOUT"
- ✅ RESOLVIDO: Mudança de MySQL para PostgreSQL
- Verifique se `DATABASE_URL` está correto no `.env`

### 2. "permission denied, mkdir '/frontend/uploads'"
- ✅ RESOLVIDO: Backend usa `/tmp/farmacia-uploads` em produção
- Pasta local continua funcionando em desenvolvimento

### 3. SQL queries com "?"
- ✅ RESOLVIDO: Helper `pgQuery()` converte "?" para "$1, $2, ..."

---

## 📝 Próximos Passos

1. **Deploy Frontend no Netlify**
   - Atualize `.env` com nova URL do backend
   
2. **Testar Pagamentos**
   - Validar integração com Mercado Pago
   
3. **Monitorar Logs**
   - Veja logs em tempo real no painel Koyeb

---

## 🆘 Suporte

Se encontrar erros:

1. Verifique logs no Koyeb dashboard
2. Confirme variáveis de ambiente
3. Teste conexão PostgreSQL localmente:
   ```bash
   psql postgresql://postgres:victorguto1540@db.orkhgcydlvlnhmqvghuz.supabase.co:5432/postgres
   ```


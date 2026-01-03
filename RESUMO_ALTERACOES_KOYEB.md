# ✅ RESUMO DAS ALTERAÇÕES - DEPLOY KOYEB

## 🔴 PROBLEMAS ENCONTRADOS

Seu deploy no Koyeb apresentava 2 erros principais:

### 1. **Erro MySQL ETIMEDOUT**
```
❌ Erro MySQL: Error: connect ETIMEDOUT
```

**Causa**: O código estava usando `mysql2` mas suas credenciais no `.env` eram de **PostgreSQL (Supabase)**.

**Solução**: Migração completa para PostgreSQL com driver `pg`.

### 2. **Erro de Permissão em /frontend/uploads**
```
⚠️ Não foi possível criar pasta de uploads: EACCES: permission denied, mkdir '/frontend/uploads'
```

**Causa**: Koyeb não permite criar pastas em caminhos absolutos como `/frontend/`.

**Solução**: Usar pasta temporária do sistema (`/tmp/farmacia-uploads` em produção).

---

## ✨ ALTERAÇÕES REALIZADAS

### 📦 Dependências (package.json)
- ❌ Removido: `mysql2`
- ✅ Adicionado: `pg`

### 🔧 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `backend/package.json` | Removido `mysql2`, adicionado `pg` |
| `backend/.env` | Porta mudada: `3000` → `8000` |
| `backend/.env.example` | Atualizado com variáveis PostgreSQL |
| `backend/index.js` | Substituído MySQL por PostgreSQL Pool |
| `backend/init-db.js` | Atualizado para PostgreSQL |
| `backend/src/config/database.js` | Novo wrapper para PostgreSQL com conversão de placeholders |
| `backend/Dockerfile` | ✨ NOVO - Para containerização no Koyeb |
| `backend/.dockerignore` | ✨ NOVO - Para otimizar imagem Docker |
| `KOYEB_DEPLOY_GUIA.md` | ✨ NOVO - Guia completo de deploy |

---

## 🔑 Mudanças Técnicas Principais

### 1. Driver de Banco de Dados
```javascript
// ❌ ANTES (MySQL)
const mysql = require('mysql2');
const db = mysql.createConnection({...});
db.query(sql, params, callback);

// ✅ DEPOIS (PostgreSQL)
const { Pool } = require('pg');
const db = new Pool({...});
pgQuery(sql, params, callback); // com conversão de ?
```

### 2. Conversão de Placeholders
```javascript
// SQL MySQL: SELECT * FROM users WHERE id = ?
// SQL PostgreSQL: SELECT * FROM users WHERE id = $1

function pgQuery(sql, params, callback) {
  let pgSql = sql.replace(/\?/g, () => `$${++i}`);
  return db.query(pgSql, params, callback);
}
```

### 3. Pasta de Uploads
```javascript
// ✅ ANTES (em desenvolvimento)
const uploadsDir = path.join(__dirname, '..', 'frontend', 'uploads');

// ✅ DEPOIS (automático por ambiente)
const uploadsDir = process.env.NODE_ENV === 'production' 
  ? path.join(os.tmpdir(), 'farmacia-uploads')
  : path.join(__dirname, '..', 'frontend', 'uploads');
```

---

## 🚀 PRÓXIMOS PASSOS

### 1. Fazer Push para Git
```bash
git add .
git commit -m "🔄 Migração: MySQL -> PostgreSQL para Koyeb"
git push origin main
```

### 2. Deploy no Koyeb

**Opção A: Via Koyeb Dashboard**
1. Acesse https://app.koyeb.com
2. Clique em "Create Service"
3. Conecte seu repositório GitHub
4. Dockerfile path: `backend/Dockerfile`
5. Build context: `backend`
6. Adicione as variáveis de ambiente (ver guia KOYEB_DEPLOY_GUIA.md)
7. Clique em "Deploy"

**Opção B: Via CLI Koyeb**
```bash
koyeb service create --name farmacia-backend \
  --git-repo seu-usuario/seu-repo \
  --git-branch main \
  --build-dockerfile backend/Dockerfile \
  --build-context backend \
  --env-override PORT=8000 \
  --env-secret DATABASE_URL=postgresql://...
```

---

## ✅ Checklist Pré-Deploy

- [x] MySQL2 removido, PostgreSQL adicionado
- [x] Código convertido para PostgreSQL
- [x] Placeholders MySQL convertidos para PostgreSQL
- [x] Pasta de uploads usando /tmp em produção
- [x] Dockerfile criado
- [x] Variáveis de ambiente atualizadas
- [x] Dependencies instaladas localmente
- [x] Porta alterada para 8000

---

## 📊 Status do Backend

| Item | Status |
|------|--------|
| Driver DB | ✅ PostgreSQL (pg) |
| Conexão | ✅ Pool configurada |
| Containerização | ✅ Dockerfile pronto |
| Uploads | ✅ /tmp/farmacia-uploads |
| Porta | ✅ 8000 |
| Variáveis | ✅ Atualizadas |

---

## 🔍 Teste Local

Para testar localmente com conexão real ao Supabase:

```bash
cd backend
npm install
npm start
```

Esperado:
```
🔥 BACKEND INICIADO 🔥
🚀 Backend rodando em http://localhost:8000
✅ PostgreSQL pronto
```

---

## ⚠️ Notas Importantes

1. **Credenciais de Produção**: Nunca commit `.env` com credenciais reais. Use secrets no Koyeb.

2. **DATABASE_URL**: Primária (Supabase fornece). Se não setada, constrói a partir de DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.

3. **SSL**: PostgreSQL no Koyeb usa SSL. Já está configurado com `ssl: { rejectUnauthorized: false }`.

4. **Backup**: Para PostgreSQL/Supabase, use o painel do Supabase, não `backup.js`.

---

## 📞 Suporte

Se encontrar erros durante o deploy:

1. **Verificar logs do Koyeb**:
   - Vá ao dashboard → Service → Logs

2. **Erros comuns**:
   - `ETIMEDOUT`: Problema de conexão à rede Supabase
   - `permission denied`: Permissões de pasta (já corrigido)
   - `Placeholder $X not found`: SQL ainda com "?" (já corrigido)

3. **Teste de conexão PostgreSQL**:
   ```bash
   psql "postgresql://user:pass@host:5432/database"
   ```

---

## 📝 Histórico de Mudanças

- **2025-01-03**: Migração MySQL → PostgreSQL
- **2025-01-03**: Adicionado Dockerfile e guia Koyeb
- **2025-01-03**: Atualizado package.json e variáveis de ambiente

---

✨ **Pronto para fazer deploy no Koyeb!** 🚀

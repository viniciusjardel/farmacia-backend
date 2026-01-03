# 🔧 ANÁLISE: POR QUE ESTAVA DANDO ERRO

## ❌ Problema 1: MySQL ETIMEDOUT

**O que estava acontecendo:**
```javascript
const mysql = require('mysql2');  // ❌ Importava MySQL
const db = mysql.createConnection({
  host: 'db.orkhgcydlvlnhmqvghuz.supabase.co',  // ❌ Isso é PostgreSQL!
  user: 'postgres',
  password: '...',
  database: 'postgres'
});
```

**Por que dava erro:**
- Código tentava conectar com MySQL `createConnection()`
- Mas os dados (.env) apontavam para **PostgreSQL (Supabase)**
- Resultado: `ETIMEDOUT` (timeout tentando conectar a PostgreSQL como MySQL)

**Solução:**
```javascript
const { Pool } = require('pg');  // ✅ Usa PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,  // ✅ Usa URL PostgreSQL
  ssl: { rejectUnauthorized: false }
});
```

---

## ❌ Problema 2: Pasta de uploads negada

**O que estava acontecendo:**
```javascript
const uploadsDir = path.join(__dirname, '..', 'frontend', 'uploads');
// Tentava criar: /frontend/uploads (no container)
```

**Por que dava erro:**
- Container não tem permissão para criar pasta em `/frontend`
- Erro: `EACCES: permission denied, mkdir '/frontend/uploads'`

**Solução:**
```javascript
const uploadsDir = process.env.NODE_ENV === 'production' 
  ? path.join(os.tmpdir(), 'farmacia-uploads')  // ✅ /tmp (sempre permitido)
  : path.join(__dirname, '..', 'frontend', 'uploads');
```

---

## ✅ Mudanças Implementadas

### 1. **package.json**
```diff
- "mysql2": "^3.16.0"
+ "pg": "^8.11.3"
```

### 2. **backend/index.js**
```diff
- const mysql = require('mysql2');
+ const { Pool } = require('pg');

- const db = mysql.createConnection({...})
+ const db = new Pool({
+   connectionString: process.env.DATABASE_URL,
+   ssl: { rejectUnauthorized: false }
+ })

- db.query(sql, params, callback)
+ pgQuery(sql, params, callback)  // ✅ Wrapper que converte ? → $1
```

### 3. **backend/src/config/database.js**
```diff
- const mysql = require('mysql2/promise');
- const pool = mysql.createPool({...})
+ const { Pool } = require('pg');
+ const pool = new Pool({
+   connectionString: process.env.DATABASE_URL,
+   ssl: { rejectUnauthorized: false }
+ })
```

### 4. **backend/init-db.js**
```diff
- const mysql = require('mysql2/promise');
+ const { Pool } = require('pg');
```

### 5. **backend/check-db.js, backup.js, seed.js**
- Atualizados para usar `pg` em vez de `mysql2/promise`

### 6. **Dockerfile**
- Adicionado limpeza de cache NPM para evitar problemas de cache:
```dockerfile
RUN npm cache clean --force
RUN npm ci --only=production && npm cache clean --force
```

### 7. **.env**
- Sem mudanças (já tinha DATABASE_URL correto!)

---

## 🔍 Por que ficou tão confuso?

A `.env` tinha credenciais PostgreSQL:
```
DATABASE_URL=postgresql://...  ← PostgreSQL
DB_HOST=db.orkhgcydlvlnhmqvghuz.supabase.co  ← Supabase (PostgreSQL)
```

Mas o código usava MySQL:
```javascript
const db = mysql.createConnection({...})  ← MySQL
```

**Resultado:** Erro `ETIMEDOUT` (MySQL tentando conectar a PostgreSQL)

---

## ✨ Agora está correto

- ✅ Código usa PostgreSQL (`pg`)
- ✅ `.env` tem credenciais PostgreSQL
- ✅ Uploads usam `/tmp` (sempre permitido)
- ✅ PORT correto: `8000`
- ✅ Dockerfile limpo de cache

---

## 📊 Resumo das Dependências

**Antes (MySQL):**
- mysql2 ✅ (foi removido)
- bcrypt
- cors
- dotenv
- express
- jsonwebtoken
- mercadopago
- multer
- node-schedule
- qrcode

**Agora (PostgreSQL):**
- **pg** ✅ (foi adicionado)
- bcrypt
- cors
- dotenv
- express
- jsonwebtoken
- mercadopago
- multer
- node-schedule
- qrcode

---

## 🚀 Próximo Passo

1. **Redeploy no Koyeb** (vai instalar novo `package.json` com `pg`)
2. **Verificar logs** (deve aparecer "PostgreSQL conectado")
3. **Testar API**: `https://seu-app.koyeb.app/`

Veja `REDEPLOY_KOYEB.md` para instruções!

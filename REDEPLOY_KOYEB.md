# 🔄 REDEPLOY NO KOYEB - Depois das Mudanças

## ✅ Mudanças Realizadas

```
✅ MySQL2 → PostgreSQL (pg)
✅ Dockerfile melhorado (limpeza de cache)
✅ package.json atualizado
✅ index.js convertido para PostgreSQL
✅ init-db.js convertido
✅ check-db.js, backup.js, seed.js atualizados
```

---

## 🚀 Como Fazer o Redeploy

### Opção 1: Pelo Dashboard Koyeb (Recomendado)

1. Vá para https://app.koyeb.com
2. Clique no seu app **farmacia-backend**
3. Clique em **"Redeploy"** ou **"Force deploy"**
4. Aguarde 3-5 minutos

### Opção 2: Pelo Git (Se tiver GitHub)

```bash
git add .
git commit -m "Fix: Migração MySQL → PostgreSQL"
git push origin main
```

Koyeb vai fazer deploy automaticamente.

---

## ✨ Verá isso quando der certo

```
🔥 BACKEND INICIADO 🔥
🚀 Backend rodando em http://localhost:8000
✅ PostgreSQL conectado
✅ PostgreSQL pronto
⚠️ Não foi possível criar pasta de uploads: (isso é OK em produção!)
```

**SEM nenhum erro de MySQL ETIMEDOUT**

---

## ❌ Se ainda der erro

**Opção 1: Forçar rebuild da imagem**
1. Dashboard → App → Settings
2. Clique em **"Force build"**
3. Aguarde reconstrução completa

**Opção 2: Verificar variáveis de ambiente**
1. Dashboard → App → Environment
2. Confirme que está igualzinho:
   - `DATABASE_URL` (completa)
   - `PORT=8000`
   - `JWT_SECRET`
   - `MP_ACCESS_TOKEN`
   - `MP_PUBLIC_KEY`

**Opção 3: Ver logs**
1. Dashboard → App → Logs
2. Procure por "PostgreSQL" ou "Error"
3. Screenshot e me manda!

---

## 📝 Checklist Final

- [ ] App foi redepropido
- [ ] Logs mostram "PostgreSQL conectado"
- [ ] Sem erro "ETIMEDOUT"
- [ ] Sem erro "mysql2"
- [ ] Aplicação está "healthy"

---

## 🎉 Pronto!

Quando der certo, o app estará rodando em:
```
https://seu-app.koyeb.app
```

Teste uma requisição:
```bash
curl https://seu-app.koyeb.app/
```

Deve retornar:
```json
{"message":"API da Farmácia está rodando"}
```

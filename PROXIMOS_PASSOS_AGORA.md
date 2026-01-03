# 🚀 AÇÃO IMEDIATA - Próximos 5 Passos

## Passo 1: Fazer Commit (Se tiver Git)

```bash
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Copia"
git add .
git commit -m "Migração: MySQL → PostgreSQL para Koyeb"
git push origin main
```

**Se não tiver Git:** Pule para Passo 2

---

## Passo 2: Forçar Redeploy no Koyeb

**URL:** https://app.koyeb.com

1. Clique em **farmacia-backend**
2. Clique em **Redeploy** (ou Force Redeploy)
3. Aguarde aparecer **"Instance is healthy"**

---

## Passo 3: Verificar Logs

1. No Dashboard → Seu App → **Logs**
2. Procure por estas mensagens:
   ```
   ✅ PostgreSQL conectado
   ✅ PostgreSQL pronto
   🚀 Backend rodando em http://localhost:8000
   ```
3. **NÃO deve aparecer:**
   ```
   ❌ Erro MySQL
   ❌ mysql2
   ❌ ETIMEDOUT
   ```

---

## Passo 4: Testar a API

**URL do seu app:**
```
https://seu-app.koyeb.app
```

(Substitua "seu-app" pelo nome que você escolheu)

Teste no navegador ou cURL:
```bash
curl https://seu-app.koyeb.app/
```

**Resultado esperado:**
```json
{"message":"API da Farmácia está rodando"}
```

---

## Passo 5: Se Deu Erro

### ❌ Ainda tem "ETIMEDOUT"

1. Dashboard → App → **Settings**
2. Clique **Force rebuild**
3. Aguarde rebuild completo
4. Verifique logs novamente

### ❌ Erro "port already in use"

1. Verifique variáveis:
   ```
   PORT=8000  (EXATO)
   ```
2. Force redeploy novamente

### ❌ Erro de conexão PostgreSQL

1. Copie as variáveis novamente:
   ```
   DATABASE_URL=postgresql://postgres:victorguto1540@db.orkhgcydlvlnhmqvghuz.supabase.co:5432/postgres
   DB_HOST=db.orkhgcydlvlnhmqvghuz.supabase.co
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=victorguto1540
   DB_NAME=postgres
   ```
2. Force redeploy

---

## ✅ RESULTADO FINAL

Quando tudo funcionar:

- ✅ App está "healthy"
- ✅ Logs mostram "PostgreSQL conectado"
- ✅ `https://seu-app.koyeb.app/` retorna JSON
- ✅ Sem erros MySQL
- ✅ Pronto para usar!

---

## 📞 Dúvidas?

Leia em ordem:
1. `SOLUCAO_RESUMIDA_KOYEB.md` (1 minuto)
2. `ANALISE_ERRO_MYSQL_TIMEOUT.md` (5 minutos)
3. `REDEPLOY_KOYEB.md` (5 minutos)

---

**Tempo total: 30 minutos de redeploy**

Você consegue! 💪

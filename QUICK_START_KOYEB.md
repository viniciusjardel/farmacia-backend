# 🎯 QUICK START - Deploy Koyeb

## ✅ O que foi feito

Seu projeto foi **totalmente atualizado** para rodar no Koyeb com PostgreSQL:

```
✅ MySQL → PostgreSQL (Supabase)
✅ Dockerfile criado
✅ Variáveis de ambiente atualizadas
✅ Pasta de uploads configurada para /tmp
✅ Porta alterada para 8000
✅ npm install executado com sucesso
```

---

## 🚀 Próximo Passo: Deploy no Koyeb

### 1️⃣ Configure Koyeb

Acesse https://app.koyeb.com e crie um novo serviço:

**Configurações:**
- **Nome**: farmacia-backend
- **GitHub**: Selecione seu repositório
- **Branch**: main
- **Dockerfile**: `backend/Dockerfile`
- **Build Context**: `backend`
- **Port**: 8000

### 2️⃣ Adicione Variáveis de Ambiente

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

### 3️⃣ Deploy

Clique em **"Deploy"** e aguarde 3-5 minutos.

---

## ✨ Resultado Esperado

Depois do deploy:

- ✅ Backend rodando em: `https://seu-app.koyeb.app`
- ✅ PostgreSQL conectado
- ✅ Sem erros de MySQL ETIMEDOUT
- ✅ Uploads funcionando

---

## 🔗 URLs Úteis

- 📚 Documentação Koyeb: https://docs.koyeb.com
- 🗄️ Supabase Console: https://supabase.com/projects
- 📊 Dashboard Koyeb: https://app.koyeb.com
- 📝 Logs: Em Dashboard → Seu App → Logs

---

## ❓ Dúvidas?

**Erro de conexão?**
- Verifique se variáveis estão exatamente iguais
- Teste localmente: `npm start`

**Dockerfile não encontrado?**
- Confirme que está em `backend/Dockerfile`

**Porta errada?**
- Koyeb expõe porta 8000, confirme `PORT=8000` nas variáveis

---

**Você está pronto para fazer o deploy! 🎉**

Qualquer dúvida, consulte `KOYEB_DEPLOY_GUIA.md`

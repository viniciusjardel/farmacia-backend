# 🔍 DIAGNÓSTICO COMPLETO

## ⚠️ PROBLEMA 1: Formulário desaparece após upload de imagem

**O que está acontecendo?**
- Você seleciona uma imagem
- A imagem é enviada para `/frontend/uploads/` ✅
- **O FORMULÁRIO INTEIRO desaparece antes de clicar "Salvar Produto"** ❌

**Como diagnosticar:**

1. Abra http://localhost:3000/admin.html em seu navegador
2. Pressione **F12** para abrir a console do navegador
3. Faça login com:
   - Email: `admin@farmacia.com`
   - Senha: `admin123`
   - PIN: `1234`
4. **LIMPE A CONSOLE** (clique no ícone de proibição)
5. Selecione uma imagem para o produto
6. **IMEDIATAMENTE** cópie TODOS os logs que aparecerem
7. Execute no console: `debugFormState()`

**Logs esperados:**
```
🎬 UPLOAD EVENT: Arquivo selecionado
📸 Arquivo selecionado: [nome do arquivo]
✅ FormData criado com: imagem
🚀 Enviando upload...
✅ Response status: 200
✅ PONTO CRÍTICO: Verificando formulário...
✅ product-form ainda existe? ✅ EXISTE ou ❌ DESAPARECEU
✅ admin-content ainda visível? [display value]
```

**O que fazer com os logs:**
- Se vir `❌ DESAPARECEU` → o formulário foi **removido do HTML**
- Se vir error antes disso → há um **erro JavaScript**
- Se não vir os logs → há um **reload da página**

---

## ⚠️ PROBLEMA 2: Categorias não aparecem no site

**O que está acontecendo?**
- Backend tem 4 categorias no banco de dados ✅
- O site não mostra os botões das categorias ❌

**Como diagnosticar:**

1. Abra http://localhost:3000 em seu navegador
2. Pressione **F12** para abrir a console
3. **LIMPE A CONSOLE**
4. Aguarde o carregamento da página
5. Procure por logs começando com `📡 Iniciando requisição`
6. Copie TODOS os logs

**Logs esperados:**
```
📡 Iniciando requisição de categorias...
✅ Status: 200
✅ Dados recebidos: [...]
✅ Total de categorias: 4
✅ Carregando categoria: [nome]
```

**Ou logs de erro:**
```
❌ Erro ao carregar categorias: [mensagem de erro]
```

**Se não vir nada:**
- Significa que a função `loadCategories()` nunca foi chamada
- Pode estar um erro em `DOMContentLoaded`

---

## 🧪 TESTE 1: Produtos aparecem?

1. Abra http://localhost:3000
2. Procure por logs começando com `🔄 Carregando todos os produtos...`
3. Você deveria ver:
   ```
   🔄 Carregando todos os produtos...
   📊 Status produtos: 200
   ✅ Produtos carregados: [...]
   ✅ Total de produtos: 8
   ```

---

## 🧪 TESTE 2: Admin consegue fazer login?

1. Abra http://localhost:3000/login.html
2. Login com: `admin@farmacia.com` / `admin123`
3. Coloque PIN: `1234`
4. Verifique se consegue acessar o painel admin

---

## 📞 Próximos Passos

Após fazer esses testes:

1. **Cópie a console completa** (Ctrl+A no console, Ctrl+C)
2. **Me envie:**
   - Screenshots da console após upload
   - Resultado do comando `debugFormState()`
   - Se as categorias aparecem ou não
   - Se os produtos aparecem ou não

Com esses dados posso diagnosticar exatamente o problema!

---

## 🚀 Para rodar o servidor:

```bash
cd backend
npm install
node index.js
```

Você deveria ver:
```
✅ MySQL conectado!
✅ Servidor rodando em http://localhost:3000
```

Se receber erro de "EADDRINUSE" significa que a porta 3000 já está em uso.

---

## 🛠️ Funções disponíveis no console:

- `debugFormState()` - Verifica se o formulário e inputs ainda existem
- `debugUploadListener()` - Verifica se o event listener de upload está ativo

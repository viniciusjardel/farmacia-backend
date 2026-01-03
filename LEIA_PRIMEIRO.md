# 🚀 GUIA COMPLETO - COMO TESTAR E DIAGNOSTICAR OS PROBLEMAS

## 📌 RESUMO DOS PROBLEMAS

### ❌ Problema 1: Categorias não aparecem no site
- Você abre http://localhost:3000
- Não vê botões de categorias (Medicamentos, Vitaminas, etc)

### ❌ Problema 2: Formulário desaparece após upload
- Você seleciona uma imagem
- A imagem é enviada com sucesso (arquivo aparece em `/uploads`)
- **Mas o formulário inteiro desaparece** antes de clicar "Salvar Produto"

---

## 🎯 PLANO DE AÇÃO

### ETAPA 1: Iniciar o servidor (5 minutos)

1. Abra terminal/PowerShell
2. Navegue até a pasta `backend`:
   ```bash
   cd backend
   ```
3. Instale dependências (só precisa fazer uma vez):
   ```bash
   npm install
   ```
4. Inicie o servidor:
   ```bash
   node index.js
   ```

**Resultado esperado:**
```
✅ MySQL conectado!
✅ Servidor rodando em http://localhost:3000
```

Se receber erro, me avise imediatamente com a mensagem de erro completa.

---

### ETAPA 2: Usar a Ferramenta de Diagnóstico Visual (10 minutos)

1. Abra seu navegador em: **http://localhost:3000/diagnostico.html**
2. Você verá uma página com vários testes
3. Clique em cada botão para testar a API
4. **Copie os resultados** que aparecerem

---

### ETAPA 3: Testar o Site Principal (10 minutos)

1. **ABRA UMA ABA NOVA** do navegador
2. Vá para: **http://localhost:3000**
3. Pressione **F12** para abrir o Console
4. **PROCURE POR ESTES LOGS NA CONSOLE:**

   ✅ Se vir isto, está funcionando:
   ```
   🟢 Script iniciado com DOM carregado
   🌐 API_URL: http://localhost:3000
   📡 Iniciando requisição de categorias para: http://localhost:3000/categories
   📊 Status categorias: 200
   ✅ Categorias carregadas: [...]
   ✅ Total de categorias: 4
   ✅ Botões de categorias criados: 4
   🔄 Carregando todos os produtos...
   ✅ Total de produtos: 8
   ```

   ❌ Se vir isto, há erro:
   ```
   ❌ Erro ao carregar categorias: [mensagem de erro]
   ```

5. **Verifique se os botões aparecem** na página:
   - Medicamentos
   - Vitaminas
   - Higiene
   - Acessórios

6. **Se não vir os botões ou erros**, execute na console:
   ```javascript
   debugPageState()
   ```
   E copie o resultado

---

### ETAPA 4: Testar o Painel Admin (15 minutos)

1. **ABRA UMA ABA NOVA** do navegador
2. Vá para: **http://localhost:3000/admin.html**
3. Pressione **F12** para abrir a Console
4. **LIMPE A CONSOLE** (clique no ícone 🚫)

5. Faça login com:
   - **Email:** `admin@farmacia.com`
   - **Senha:** `admin123`
   - **PIN:** `1234`

6. Você deveria ver um formulário com:
   - Nome do Produto
   - Campo de upload de imagem
   - Outros campos

7. **AGORA O TESTE CRÍTICO:**
   - Clique em "Escolher imagem" (upload)
   - Selecione qualquer imagem do seu PC
   - **NÃO clique em nada depois disso**
   - **IMEDIATAMENTE cópie TODOS os logs da console**

8. **PROCURE POR ESTES LOGS:**
   ```
   🎬 UPLOAD EVENT: Arquivo selecionado
   📸 Arquivo selecionado: [nome do arquivo]
   🚀 Enviando upload...
   ✅ Response status: 200
   ✅ PONTO CRÍTICO: Verificando formulário...
   ✅ product-form ainda existe?
   ```

9. **EXECUTE ISTO NA CONSOLE:**
   ```javascript
   debugFormState()
   ```

10. **CÓPIE O RESULTADO** completo

---

## 📋 CHECKLIST - O QUE ME ENVIAR

Após completar as etapas acima, me envie:

### ✅ Do site principal (index.html):
- [ ] Screenshot ou cópia dos logs da console
- [ ] Se os botões de categorias aparecem (sim/não)
- [ ] Resultado de `debugPageState()`

### ✅ Do painel admin (admin.html):
- [ ] Screenshot ou cópia dos logs após upload
- [ ] Resultado de `debugFormState()`
- [ ] **MUITO IMPORTANTE:** Diga se o formulário:
  - [ ] Continua visível mas vazio
  - [ ] Desaparece completamente
  - [ ] Mostra mensagem de erro
  - [ ] Página parece reiniciar/recarregar

### ✅ Do servidor:
- [ ] Output completo do terminal quando rodou `node index.js`
- [ ] Se viu algum erro

---

## 🔧 TESTES MANUAIS NA CONSOLE

Se preferir fazer testes diretos, copie e execute na console (F12):

### Teste 1: Verificar API de categorias
```javascript
fetch('http://localhost:3000/categories')
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log('Categorias:', d))
  .catch(e => console.error('Erro:', e))
```

**Você deveria ver:** Um array com 4 categorias

### Teste 2: Verificar API de produtos
```javascript
fetch('http://localhost:3000/products')
  .then(r => r.json())
  .then(d => {
    console.log('Total de produtos:', d.length);
    console.log('Primeiros 2:', d.slice(0, 2));
  })
```

**Você deveria ver:** 8 produtos no total

### Teste 3: Verificar containers HTML
```javascript
console.log('Elemento #categories existe?', !!document.getElementById('categories'));
console.log('Elemento #products existe?', !!document.getElementById('products'));
console.log('Número de botões:', document.getElementById('categories')?.querySelectorAll('button').length);
```

### Teste 4: Ver estado do carrinho
```javascript
console.log('Carrinho:', carrinho);
console.log('Total de itens:', carrinho.length);
```

---

## 🆘 ERROS COMUNS E SOLUÇÕES

### ❌ Erro: "Cannot GET /diagnostico.html"
**Solução:** O servidor não está rodando ou não está na porta 3000
- Verifique se rodou `node index.js`
- Verifique se não há erro de porta já em uso

### ❌ Erro: "EADDRINUSE :::3000"
**Solução:** A porta 3000 já está sendo usada
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID [número] /F

# Ou simplesmente use outra porta no index.js
```

### ❌ Erro: "MySQL connection failed"
**Solução:** Verifique banco de dados
- MySQL está rodando?
- Credenciais estão corretas em `backend/src/config/database.js`?
- Database `farmacia` existe?

### ❌ Console mostra: "API_URL: http://localhost:3000" mas nada carrega
**Solução:** Probablemente erro de CORS ou servidor inoperante
- Verifique o console do servidor (terminal)
- Procure por mensagens de erro

### ❌ Categorias retornam vazio do backend
**Solução:** Execute seed para popular banco
```bash
cd backend
node seed.js reset
```

### ❌ Imagem é enviada (aparece em `/uploads`) mas formulário desaparece
**Este é o bug principal que estamos investigando!**
- Cole os LOGS COMPLETOS que você vir
- Execute `debugFormState()` e copie resultado
- Me envie TUDO

---

## 📞 COMO ME ENVIAR OS DADOS

Organize tudo num arquivo de texto com:

```
=== TESTE DO SITE PRINCIPAL ===
Logs da console quando abriu index.html:
[COLE AQUI]

Resultado de debugPageState():
[COLE AQUI]

Os botões aparecem? SIM / NÃO

=== TESTE DO ADMIN ===
Logs da console após selecionar imagem:
[COLE AQUI]

Resultado de debugFormState():
[COLE AQUI]

O formulário desaparece ou fica vazio? DESAPARECE / FICA VAZIO / OUTRO: _____

=== SERVER LOG ===
Output do terminal quando rodou node index.js:
[COLE AQUI]

=== OBSERVAÇÕES ===
Qualquer outra coisa que notou:
[COLE AQUI]
```

Com esses dados consigo identificar exatamente onde está o problema! 🔍

---

## ⏱️ TEMPO ESTIMADO

- Iniciar servidor: 1 min
- Testar diagnóstico: 5 min
- Testar site principal: 5 min
- Testar admin: 10 min
- Compilar dados: 3 min

**TOTAL: ~25 minutos**

Depois é só me enviar e consigo resolver rápido! 🚀

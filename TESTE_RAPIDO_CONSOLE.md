# ✅ TESTE RÁPIDO - COPIAR E COLAR NA CONSOLE

Copie cada comando abaixo, cole na console (F12) e veja os resultados:

## 🧪 TESTE 1: Verificar API
```javascript
fetch('http://localhost:3000/categories').then(r => r.json()).then(d => console.log('Categorias:', d))
```
**Você deveria ver:** Uma array com 4 categorias (id, name)

## 🧪 TESTE 2: Verificar Produtos
```javascript
fetch('http://localhost:3000/products').then(r => r.json()).then(d => console.log('Produtos:', d))
```
**Você deveria ver:** Uma array com 8 produtos

## 🧪 TESTE 3: Status das páginas
Na página **index.html** (site principal):
```javascript
debugPageState()
```
Você deveria ver:
- API_URL: http://localhost:3000
- Categorias container: true
- Produtos container: true
- Botões de categoria: 5 (ou mais, se carregou)

Na página **admin.html** (painel admin):
```javascript
debugFormState()
```
Você deveria ver:
- product-form: true (existe)
- image_file: true (existe)

## 🧪 TESTE 4: Carregar categorias manualmente
```javascript
location.reload()
```
Aguarde a página carregar e procure na console por:
- `📡 Iniciando requisição de categorias...`
- `✅ Total de categorias: 4`

Se não vir, significa que o script não iniciou corretamente.

## 🧪 TESTE 5: Upload manual no admin
1. Abra http://localhost:3000/admin.html
2. Abra console (F12)
3. Limpe os logs (clique no ícone 🚫)
4. Faça login
5. Selecione uma imagem
6. **Pausa e copie TODOS os logs que aparecer**
7. Execute na console:
```javascript
debugFormState()
```

## 📋 Se algo não funcionar:

**Erro: "API não respondendo"**
- Verifique se o servidor está rodando: `http://localhost:3000`
- Console do servidor deveria mostrar: `✅ Servidor rodando`

**Erro: "Cannot get /categories"**
- Backend não tem essa rota
- Verifique se backend/index.js tem `app.get('/categories'`

**Categorias mostram "Erro ao carregar categorias"**
- Problema na API ou resposta malformada
- Execute: `fetch('http://localhost:3000/categories').then(r => console.log('Status:', r.status, 'OK:', r.ok))`

---

## 🔧 Comandos úteis no console:

```javascript
// Ver estado completo da página
console.clear(); debugPageState();

// Ver HTML do container de categorias
document.getElementById('categories').innerHTML

// Ver número de botões
document.getElementById('categories').querySelectorAll('button').length

// Ver dados do carrinho
carrinho

// Limpar carrinho
carrinho = []; atualizarCarrinho();
```

---

## 💾 Salvando logs

Para copiar TUDO da console:
1. Clique com botão direito na console
2. "Save all as..." (ou parecido)
3. Me envie o arquivo

Ou use CTRL+A na console e CTRL+C para copiar tudo.

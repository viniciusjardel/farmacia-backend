# 🎯 GUIA RÁPIDO - DIAGNÓSTICO DE PROBLEMAS

```
┌─────────────────────────────────────────────────────────────────┐
│                   PROBLEMAS IDENTIFICADOS                       │
├─────────────────────────────────────────────────────────────────┤
│ ❌ PROBLEMA 1: Categorias não aparecem no site                  │
│ ❌ PROBLEMA 2: Formulário desaparece após upload de imagem     │
└─────────────────────────────────────────────────────────────────┘
```

## ⏱️ PLANO RÁPIDO (25 MINUTOS)

```
1. Iniciar servidor          → 1 min
   └─ cd backend && node index.js
   
2. Abrir ferramenta teste    → 1 min
   └─ http://localhost:3000/diagnostico.html
   
3. Testar site principal     → 5 min
   └─ http://localhost:3000
   └─ Procure logs de categorias
   
4. Testar painel admin       → 10 min
   └─ http://localhost:3000/admin.html
   └─ Faça upload de imagem
   └─ COPIE TODOS OS LOGS
   
5. Compilar dados            → 5 min
   └─ Copy logs + screenshots
   
6. Enviar resultado          → 3 min
   └─ Me envie os dados coletados
```

---

## 🎬 TESTE IMEDIATO (5 MINUTOS)

Se você quer testar AGORA sem seguir guias longos:

### 1️⃣ Terminal/PowerShell
```bash
cd backend
node index.js
```
Procure por: `✅ Servidor rodando em http://localhost:3000`

### 2️⃣ Navegador - Ferramenta Visual
Abra: http://localhost:3000/diagnostico.html

Clique em:
- ✅ Testar /categories
- ✅ Testar /products
- ✅ Testar /login

Veja os resultados na página.

### 3️⃣ Navegador - Site Principal (ABA NOVA)
Abra: http://localhost:3000

Procure na página por:
- Aparecem botões? (Medicamentos, Vitaminas, etc)
- Aparecem produtos?

Pressione F12, procure nos logs por:
- `📡 Iniciando requisição de categorias`
- `✅ Total de categorias: 4`

### 4️⃣ Navegador - Admin (ABA NOVA)
Abra: http://localhost:3000/admin.html

Faça login:
- Email: `admin@farmacia.com`
- Senha: `admin123`
- PIN: `1234`

Selecione uma imagem (F12 console aberta):
- **CÓPIE TODOS OS LOGS IMEDIATAMENTE**
- Execute na console: `debugFormState()`
- **CÓPIE O RESULTADO**

---

## 📋 DADOS A ENVIAR

Copie isto num arquivo de texto e me envie:

```
=== TESTE DA API ===
[Clique em "Testar /categories" na ferramenta]
Resultado: [COLE AQUI]

[Clique em "Testar /products" na ferramenta]
Resultado: [COLE AQUI]

=== TESTE DO SITE ===
Os botões de categorias aparecem? SIM / NÃO

Logs da console:
[COLE AQUI]

=== TESTE DO ADMIN ===
Logs após upload:
[COLE AQUI]

Resultado de debugFormState():
[COLE AQUI]

O formulário desaparece? SIM / NÃO / FICA VAZIO

=== SERVER LOG ===
Output do terminal:
[COLE AQUI]
```

---

## 🔧 FUNÇÕES CONSOLE DISPONÍVEIS

### No site principal (index.html):
```javascript
debugPageState()     // Ver estado geral
debugCategories()    // Ver categorias
debugProducts()      // Ver produtos
```

### No admin (admin.html):
```javascript
debugFormState()           // Ver se formulário existe
debugUploadListener()       // Ver se listener está ativo
```

---

## ❓ SE ALGO QUEBRAR

### Erro: "Cannot GET /diagnostico.html"
→ Servidor não está rodando
→ Rode: `node index.js` no terminal

### Erro: "EADDRINUSE :::3000"
→ Outra coisa está usando porta 3000
→ Feche outros navegadores/aplicações

### Erro: "Cannot connect to database"
→ MySQL não está rodando ou credenciais erradas
→ Verifique: `backend/src/config/database.js`

### Categorias não carregam
→ Veja logs na console (F12)
→ Execute: `fetch('http://localhost:3000/categories').then(r => r.json()).then(d => console.log(d))`

### Formulário desaparece
→ Este é o problema principal
→ **CÓPIE TODOS OS LOGS ANTES DE CONTINUAR**
→ Me envie os logs completos

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para guias mais detalhados:

- [LEIA_PRIMEIRO.md](LEIA_PRIMEIRO.md) - Guia passo-a-passo completo
- [STATUS_COMPLETO.md](STATUS_COMPLETO.md) - Resumo técnico de todas mudanças
- [TESTE_RAPIDO_CONSOLE.md](TESTE_RAPIDO_CONSOLE.md) - Testes via console
- [README_DIAGNOSTICO.md](README_DIAGNOSTICO.md) - Visão geral do diagnóstico

---

## ⚡ RESUMO

```
🚀 Você tem tudo pronto para:
   ✅ Testar a API
   ✅ Testar o site principal
   ✅ Testar o painel admin
   ✅ Diagnosticar problemas
   ✅ Enviar dados para resolução

🎯 Próximo passo: 
   1. Rode: node index.js
   2. Abra: http://localhost:3000/diagnostico.html
   3. Siga os testes
   4. Me envie os dados

💪 Pronto? Vamo lá!
```

---

## 🆘 PRECISA DE AJUDA?

Recolha:
1. **Console output completa** (F12, Ctrl+A, Ctrl+C)
2. **Screenshot das páginas**
3. **Output do terminal**
4. **Descrição do que acontece**

Com isso, consigo resolver rapidinho! 🚀

# 🐛 GUIA DE DEBUG - PROBLEMA DE UPLOAD DE IMAGEM

## Como Testar e Debugar

### Passo 1: Abrir o Painel Admin
1. Vá para: `http://localhost:3000/login.html`
2. Faça login:
   - Email: `admin@farmacia.com`
   - Senha: `admin123`
   - PIN: `1234`

### Passo 2: Abrir o Console do Navegador
- Pressione **F12** para abrir o DevTools
- Vá para a aba "Console"

### Passo 3: Fazer Upload de Imagem
1. No painel admin, selecione uma imagem
2. Observe os logs no console (devem começar com 🎬, 📸, ✅, ❌)
3. **IMPORTANTE**: Após o upload ser bem-sucedido (mensagem "✅ Imagem carregada!"):
   - Verifique no console: **"✅ Depois - imageUrlInput.value: /uploads/..."**
   - Se o valor aparecer, a imagem foi salva corretamente

### Passo 4: Verificar Se a Imagem Desaparece
Após o upload bem-sucedido:
1. **Antes de fazer nada mais**, abra o console novamente
2. Digite: `debugFormState()`
3. Pressione Enter
4. Verifique a saída:
   - "Forma existe?" deve ser ✅
   - "Input #image_url value:" deve mostrar a URL da imagem (ex: /uploads/foto_123456789.jpg)
   - Se não mostrar a URL, significa que ela foi limpa

### Logs que Você Deve Ver (em ordem)

```
🎬 UPLOAD EVENT DISPARADO - arquivo selecionado
📸 Arquivo selecionado: [nome do arquivo] [tamanho] bytes
✅ Elementos encontrados:
  - imageUrlInput: ✅
  - imagePreviewContainer: ✅
✅ Preview local carregado
🔐 Token encontrado, enviando para: http://localhost:3000/admin/upload
✅ Response status: 200
📥 Response: {"url":"/uploads/...","message":"..."}
✅ URL retornada: /uploads/[nome_arquivo_com_timestamp].jpg
✅ Antes - imageUrlInput.value: (valor anterior ou vazio)
✅ Depois - imageUrlInput.value: /uploads/[nome_arquivo].jpg
✅ Elemento image_url ainda existe? ✅
✅ Imagem adicionada!
```

### O Que Verificar
- ✅ A URL aparece nos logs?
- ✅ O arquivo aparece em `/frontend/uploads/`?
- ✅ Depois de alguns segundos, a imagem ainda aparece no preview?
- ✅ Você consegue preencher os outros campos e clicar em "Salvar Produto"?

### Se Algo Não Aparecer
1. Digite `debugFormState()` no console
2. Digite `debugUploadListener()` no console
3. Copie a saída
4. Envie para debug

## Possíveis Problemas

### 1. Imagem não envia
- **Causa**: Erro de conexão ou token inválido
- **Solução**: Verifique se está logado (token válido)
- **Debug**: Veja se aparecem os logs até "🔐 Token encontrado"

### 2. Upload bem-sucedido mas image_url fica vazio
- **Causa**: O input #image_url está sendo apagado ou não é atualizado
- **Debug**: Após upload, execute `debugFormState()` e veja se a URL aparece

### 3. Imagem aparece mas formulário fica vazio
- **Causa**: Possível recarregamento da página ou reset do formulário
- **Debug**: Veja nos logs se há múltiplos "UPLOAD EVENT DISPARADO"

### 4. Erro: "Resposta inválida"
- **Causa**: O backend retornou algo que não é JSON válido
- **Solução**: Verifique o servidor (console do Node.js)

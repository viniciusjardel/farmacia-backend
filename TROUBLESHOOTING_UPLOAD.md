# 📸 Troubleshooting - Upload de Imagens

## ⚙️ Configuração de Upload

### Limite de Tamanho
- **Máximo: 5MB** por arquivo
- Se a imagem for maior, você verá: `"Arquivo muito grande. Máximo: 5MB"`

### Formatos Aceitos
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WebP (.webp)
- ❌ Outros formatos serão rejeitados

## 🔍 Passos para Diagnóstico

### 1️⃣ Verificar Console do Navegador (F12)
```
Abra: F12 → Aba Console
Procure por mensagens de erro como:
- "Sessão expirada"
- "Arquivo muito grande"
- "HTTP 401" (autenticação falhou)
- "HTTP 500" (erro do servidor)
```

### 2️⃣ Testar Upload sem Autenticação
Se está tendo problemas com autenticação, teste sem login:

```bash
curl -F "image=@seu_arquivo.jpg" http://localhost:3000/test/upload
```

Resposta esperada:
```json
{
  "message": "Imagem enviada com sucesso (TEST)",
  "url": "/uploads/seu_arquivo_1234567890.jpg",
  "filename": "seu_arquivo_1234567890.jpg",
  "size": 245672,
  "mimetype": "image/jpeg"
}
```

### 3️⃣ Verificar Pasta de Uploads
A pasta deve estar em: `frontend/uploads/`

```bash
# Windows (PowerShell)
dir frontend\uploads\
```

Se a pasta não existir, o servidor a cria automaticamente na primeira requisição.

### 4️⃣ Verificar Token de Sessão
No console do navegador, execute:
```javascript
localStorage.getItem('token')
```

Se retornar `null`, você precisa fazer login novamente.

## ❌ Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "Sessão expirada" | Token não está no localStorage | Faça login novamente |
| "Arquivo muito grande" | Imagem > 5MB | Redimensione a imagem |
| "Apenas imagens são permitidas" | Tipo MIME não é imagem | Use JPEG, PNG, GIF ou WebP |
| "HTTP 401" | Token inválido ou expirado | Faça login novamente |
| "HTTP 500" | Erro do servidor | Verifique logs do backend |
| Imagem não aparece no formulário | Erro de upload silencioso | Abra Console (F12) para ver erro |

## ✅ Verificação Rápida

```javascript
// No console do navegador, teste assim:
const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
const formData = new FormData();
formData.append('image', file);

fetch('http://localhost:3000/admin/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  body: formData
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e));
```

## 📋 Informações de Upload

- **Destino**: `frontend/uploads/`
- **URL de Acesso**: `http://localhost:3000/uploads/[filename]`
- **Nomeação**: `[nome_original]_[timestamp].[extensão]`
- **Autenticação**: Requer token JWT válido
- **Método**: POST multipart/form-data

## 🚀 Reiniciar Servidor

Se alterou multer.js ou backend, reinicie:

```bash
# Parar processo node
Get-Process node | Stop-Process -Force

# Iniciar novamente
cd backend
npm start
```

## 📞 Debug Avançado

Se nada funcionar, adicione este código no `admin.js` para logs:

```javascript
// Adicione isto antes do evento de mudança do input de arquivo
const imageFileInput = document.getElementById('image_file');
imageFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  console.log('Arquivo selecionado:', {
    name: file.name,
    size: file.size,
    type: file.type,
    maxSize: 5 * 1024 * 1024,
    isSizeOK: file.size <= (5 * 1024 * 1024),
    isImageType: file.type.startsWith('image/')
  });
});
```

---

✅ Melhorias implementadas:
- Melhor tratamento de erros de multer
- Logs detalhados no console
- Endpoint de teste sem autenticação
- Validação de token antes do upload
- Mensagens de erro mais descritivas

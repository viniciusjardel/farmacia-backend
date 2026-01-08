#!/bin/bash

# Script para testar upload com curl

# Gerar um arquivo de teste
echo "Criando imagem de teste..."
# Criar um PNG mínimo (1x1 pixel, branco)
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x87\xee\xe0\xe5\x00\x00\x00\x00IEND\xaeB`\x82' > test-image.png

# Token (você precisa substituir por um token válido)
TOKEN="seu_token_aqui"

echo "Testando upload para http://localhost:3000/admin/upload"
echo "Token: $TOKEN"
echo "Arquivo: test-image.png"
echo ""

# Enviar requisição com curl
curl -v \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-image.png" \
  http://localhost:3000/admin/upload

echo ""
echo "Teste finalizado"

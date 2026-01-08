#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// Caminho do arquivo de teste
const testFile = path.join(__dirname, 'test-image.png');

// Criar uma imagem PNG mínima
const pngBytes = Buffer.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68, 65, 84, 8, 217, 99, 248, 15, 0, 0, 1, 1, 1, 0, 24, 204, 180, 22, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
]);

fs.writeFileSync(testFile, pngBytes);
console.log('✅ Arquivo PNG de teste criado\n');

// Token de teste (você precisa de um token válido)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBmYXJtYWNpYS5jb20iLCJpYXQiOjE3Njc3NzE0NTAsImV4cCI6MTc2Nzg1Nzg1MH0.rxpbMJ3kYA3GJh-yjl7E9IIzHwCEsqw1juFK5baXCiM';

// Criar FormData
const form = new FormData();
form.append('image', fs.createReadStream(testFile), 'test.png');

// Fazer requisição
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/admin/upload',
  method: 'POST',
  headers: {
    ...form.getHeaders(),
    'Authorization': `Bearer ${token}`
  }
};

console.log('📤 Enviando upload...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}\n`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Resposta:', data);
    fs.unlinkSync(testFile);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ Erro:', err);
  fs.unlinkSync(testFile);
  process.exit(1);
});

form.pipe(req);

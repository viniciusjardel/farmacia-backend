const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const https = require('http');

// Token válido
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBmYXJtYWNpYS5jb20iLCJpYXQiOjE3Njc3NzE0NTAsImV4cCI6MTc2Nzg1Nzg1MH0.rxpbMJ3kYA3GJh-yjl7E9IIzHwCEsqw1juFK5baXCiM';

// Criar arquivo de teste
const testImagePath = path.join(__dirname, 'test-image.png');
const pngBytes = Buffer.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68, 65, 84, 8, 217, 99, 248, 15, 0, 0, 1, 1, 1, 0, 24, 204, 180, 22, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
]);
fs.writeFileSync(testImagePath, pngBytes);
console.log('✅ Arquivo de teste criado:', testImagePath);

// Criar FormData
const form = new FormData();
form.append('image', fs.createReadStream(testImagePath), 'test-image.png');

// Fazer upload
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

console.log('\n📤 Enviando upload...');
console.log('Opções:', JSON.stringify(options, null, 2));

const req = https.request(options, (res) => {
  console.log('\n✅ Response status:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📦 Response body:', data);
    
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Parsed:', parsed);
    } catch (e) {
      console.log('❌ Erro ao fazer parse:', e.message);
    }

    // Limpar arquivo de teste
    fs.unlinkSync(testImagePath);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ Erro na requisição:', err);
  fs.unlinkSync(testImagePath);
  process.exit(1);
});

form.pipe(req);

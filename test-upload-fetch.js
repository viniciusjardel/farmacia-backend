// Script para testar upload via Node
const fs = require('fs');
const path = require('path');

// Criar um arquivo PNG mínimo
const testImagePath = path.join(__dirname, 'test-image-node.png');
const pngBytes = Buffer.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68, 65, 84, 8, 217, 99, 248, 15, 0, 0, 1, 1, 1, 0, 24, 204, 180, 22, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
]);
fs.writeFileSync(testImagePath, pngBytes);
console.log('✅ Arquivo de teste criado:', testImagePath);

// Token válido
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBmYXJtYWNpYS5jb20iLCJpYXQiOjE3Njc3NzE0NTAsImV4cCI6MTc2Nzg1Nzg1MH0.rxpbMJ3kYA3GJh-yjl7E9IIzHwCEsqw1juFK5baXCiM';

// Simular fetch do frontend
(async () => {
  try {
    const fileBuffer = fs.readFileSync(testImagePath);
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('image', blob, 'test-image.png');
    
    console.log('\n📤 Enviando upload...');
    const response = await fetch('http://localhost:3000/admin/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log(`✅ Status: ${response.status}`);
    const data = await response.json();
    console.log('📦 Resposta:', data);
    
    // Limpar
    fs.unlinkSync(testImagePath);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    fs.unlinkSync(testImagePath);
    process.exit(1);
  }
})();

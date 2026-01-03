const http = require('http');

// Teste simples de requisição HTTP
const data = JSON.stringify({ amount: 99.90 });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/payment/pix',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('📤 Enviando requisição...');
const req = http.request(options, (res) => {
  console.log(`✅ Resposta recebida: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('✅ PIX Key:', json.pix_key);
      console.log('✅ Nome:', json.pix_name);
      console.log('✅ Valor:', json.amount);
    } catch (e) {
      console.log('❌ Erro ao parsear:', e.message);
      console.log('Body:', body.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.log(`❌ Erro: ${e.message}`);
});

req.on('timeout', () => {
  console.log('❌ Timeout na requisição');
  req.destroy();
});

req.setTimeout(10000);
req.write(data);
req.end();

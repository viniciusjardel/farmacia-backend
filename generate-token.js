require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const payload = {
  id: 2,
  email: 'admin@farmacia.com'
};

const token = jwt.sign(payload, SECRET, { algorithm: 'HS256' });
console.log('✅ Token JWT gerado:');
console.log(token);
console.log('\n🧪 Teste rápido:');
console.log('Use este token no header:');
console.log(`Authorization: Bearer ${token}`);

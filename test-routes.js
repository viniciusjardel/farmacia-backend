require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./src/config/database');

const app = express();

console.log('✅ Express carregado');

app.use(cors());
console.log('✅ CORS registrado');

app.use(express.json());
console.log('✅ express.json() registrado');

// Testar uma rota simples primeiro
app.get('/test', (req, res) => {
  res.json({ message: 'Teste OK' });
});
console.log('✅ Rota /test registrada');

// Agora carregar as rotas
const productsRoutes = require('./src/routes/products.routes');
const categoriesRoutes = require('./src/routes/categories.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const adminRoutes = require('./src/routes/admin.routes');

console.log('✅ Todos os módulos de rota carregados');

app.use('/products', productsRoutes);
console.log('✅ /products registrada');

app.use('/categories', categoriesRoutes);
console.log('✅ /categories registrada');

app.use('/payment', paymentRoutes);
console.log('✅ /payment registrada');

app.use('/admin', adminRoutes);
console.log('✅ /admin registrada');

// Middleware 404
app.use((req, res) => {
  console.log('❌ Rota não encontrada:', req.method, req.path);
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

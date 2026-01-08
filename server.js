require('dotenv').config();

console.log('🔥 SERVIDOR INICIADO 🔥');

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// ROTAS DA API
// ===============================
const productsRoutes = require('./src/routes/products.routes');
const categoriesRoutes = require('./src/routes/categories.routes');
const paymentRoutes = require('./src/routes/payment.routes');

app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/payment', paymentRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: '🏥 API da Farmácia está rodando',
    version: '1.0.0',
    endpoints: {
      products: '/products',
      categories: '/categories',
      payment: '/payment'
    }
  });
});

// Servir arquivos estáticos do frontend DEPOIS das rotas da API
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// Servir index.html para rotas não encontradas (SPA)
app.use((req, res) => {
  const indexPath = path.join(frontendDir, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Página não encontrada' });
  }
});

// ===============================
// INICIAR SERVIDOR
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📂 Frontend: ${frontendDir}`);
  console.log(`📦 Banco: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Rota de teste antes de tudo
app.get('/test', (req, res) => {
  res.json({ message: 'Rota de teste funcionando' });
});

// Carregar rotas
console.log('Carregando rotas...');
const productsRoutes = require('./src/routes/products.routes');
console.log('✅ Rotas de produtos carregadas');

app.use('/products', productsRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

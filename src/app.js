const express = require('express');
const cors = require('cors');

const productsRoutes = require('./routes/products.routes');
const categoriesRoutes = require('./routes/categories.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API da Farmácia está rodando' });
});

module.exports = app;

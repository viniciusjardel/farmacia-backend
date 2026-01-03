const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// LISTAR PRODUTOS
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products WHERE active = true'
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// CRIAR PRODUTO
router.post('/', async (req, res) => {
  const { name, description, price, category_id, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, category_id, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, category_id, image_url]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      price,
      category_id,
      image_url,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// ATUALIZAR PRODUTO
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image_url = ? WHERE id = ?`,
      [name, description, price, category_id, image_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({
      id,
      name,
      description,
      price,
      category_id,
      image_url,
      message: 'Produto atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

module.exports = router;

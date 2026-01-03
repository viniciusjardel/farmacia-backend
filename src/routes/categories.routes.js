const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// ✅ LISTAR TODAS AS CATEGORIAS
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT id, name, description, active FROM categories WHERE active = true ORDER BY name'
    );
    res.json(categories);
  } catch (error) {
    console.error('❌ Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro ao listar categorias' });
  }
});

// ✅ CRIAR NOVA CATEGORIA
router.post('/', async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
  }

  try {
    // Verificar se a categoria já existe
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE name = ?',
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Esta categoria já existe' });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, description, active) VALUES (?, ?, true)',
      [name.trim(), description?.trim() || null]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      description: description?.trim() || null,
      active: true
    });
  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// ✅ ATUALIZAR CATEGORIA
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
  }

  try {
    // Verificar se a categoria existe
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Verificar se outro nome já existe
    const [duplicate] = await pool.query(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [name.trim(), id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Este nome de categoria já existe' });
    }

    await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description?.trim() || null, id]
    );

    res.json({
      id: parseInt(id),
      name: name.trim(),
      description: description?.trim() || null,
      active: true
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// ✅ EXCLUIR CATEGORIA (soft delete - marca como inativo)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se a categoria existe
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Marcar como inativo (soft delete)
    await pool.query(
      'UPDATE categories SET active = false WHERE id = ?',
      [id]
    );

    // Atualizar produtos com essa categoria para NULL
    await pool.query(
      'UPDATE products SET category_id = NULL WHERE category_id = ?',
      [id]
    );

    res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir categoria:', error);
    res.status(500).json({ error: 'Erro ao excluir categoria' });
  }
});

module.exports = router;

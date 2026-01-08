const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// ===============================
// 📋 AUDITORIA HELPER (Importado de admin.routes.js)
// ===============================
async function logAudit(userId, action, entity, entityId, beforeData = null, afterData = null) {
  try {
    const beforeDataStr = beforeData ? JSON.stringify(beforeData) : null;
    const afterDataStr = afterData ? JSON.stringify(afterData) : null;
    
    const query = 'INSERT INTO audit_logs (user_id, action, entity, entity_id, before_data, after_data, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    
    await pool.query(query, [
      userId, 
      action, 
      entity, 
      entityId, 
      beforeDataStr,
      afterDataStr
    ]);
    
    console.log(`✅ [LOGAUDIT] Registro de auditoria criado: ${action} - ${entity} #${entityId}`);
  } catch (err) {
    console.error(`❌ [LOGAUDIT ERROR] Falha ao registrar auditoria: ${err.message}`);
  }
}

// ✅ LISTAR TODAS AS CATEGORIAS
router.get('/', async (req, res) => {
  try {
    console.log('📂 Buscando categorias ativas...');
    const [categories] = await pool.query(
      'SELECT id, name, description, active FROM categories WHERE active = 1 ORDER BY name'
    );
    console.log(`✅ ${categories.length} categorias encontradas`);
    res.json(categories);
  } catch (error) {
    console.error('❌ Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro ao listar categorias', details: error.message });
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
      'INSERT INTO categories (name, description, active) VALUES (?, ?, 1)',
      [name.trim(), description?.trim() || null]
    );

    const categoryId = result.insertId;
    const categoryData = { name: name.trim(), description: description?.trim() || null };

    // Registrar auditoria
    await logAudit(
      req.user.id,
      'CREATE_CATEGORY',
      'categories',
      categoryId,
      null,
      categoryData
    );

    res.status(201).json({
      id: categoryId,
      name: name.trim(),
      description: description?.trim() || null,
      active: 1
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

    // Buscar dados antigos para auditoria
    const [beforeUpdate] = await pool.query(
      'SELECT name, description FROM categories WHERE id = ?',
      [id]
    );
    const beforeData = beforeUpdate.length > 0 ? beforeUpdate[0] : null;

    await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description?.trim() || null, id]
    );

    const afterData = { name: name.trim(), description: description?.trim() || null };

    // Registrar auditoria
    await logAudit(
      req.user.id,
      'UPDATE_CATEGORY',
      'categories',
      parseInt(id),
      beforeData,
      afterData
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

    const categoryData = existing[0];

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

    // Registrar auditoria
    await logAudit(
      req.user.id,
      'DELETE_CATEGORY',
      'categories',
      parseInt(id),
      categoryData,
      null
    );

    res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir categoria:', error);
    res.status(500).json({ error: 'Erro ao excluir categoria' });
  }
});

module.exports = router;

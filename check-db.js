#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('✅ Conectado ao PostgreSQL');

    // Verificar categorias
    const categories = await db.query('SELECT * FROM categories');
    console.log('\n📂 CATEGORIAS:');
    console.log('Total:', categories.rows.length);
    categories.rows.forEach(cat => {
      console.log(`  - ID: ${cat.id}, Nome: ${cat.name}, Ativo: ${cat.active}`);
    });

    // Verificar produtos
    const products = await db.query('SELECT id, name, price, active FROM products LIMIT 5');
    console.log('\n📦 PRODUTOS:');
    console.log('Total (primeiros 5):');
    products.rows.forEach(prod => {
      console.log(`  - ID: ${prod.id}, Nome: ${prod.name}, Preço: ${prod.price}, Ativo: ${prod.active}`);
    });

    console.log('\n✅ Banco de dados está OK!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
})();

#!/usr/bin/env node
require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao MySQL');

  // Verificar categorias
  db.query('SELECT * FROM categories', (err, categories) => {
    if (err) {
      console.error('❌ Erro ao buscar categorias:', err);
    } else {
      console.log('\n📂 CATEGORIAS:');
      console.log('Total:', categories.length);
      categories.forEach(cat => {
        console.log(`  - ID: ${cat.id}, Nome: ${cat.name}, Ativo: ${cat.active}`);
      });
    }

    // Verificar produtos
    db.query('SELECT id, name, price, active FROM products LIMIT 5', (err, produtos) => {
      if (err) {
        console.error('❌ Erro ao buscar produtos:', err);
      } else {
        console.log('\n📦 PRODUTOS:');
        console.log('Total (primeiros 5):');
        produtos.forEach(prod => {
          console.log(`  - ID: ${prod.id}, Nome: ${prod.name}, Preço: ${prod.price}, Ativo: ${prod.active}`);
        });
      }

      db.end();
      process.exit(0);
    });
  });
});

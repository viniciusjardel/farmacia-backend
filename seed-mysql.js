#!/usr/bin/env node

/**
 * 🌱 Script de Seed - Popula o banco com dados iniciais
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'farmacia',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    try {
      await connection.execute('DELETE FROM audit_logs');
      await connection.execute('DELETE FROM products');
      await connection.execute('DELETE FROM categories');
      await connection.execute('DELETE FROM admins');
    } catch (e) {
      // Ignorar se tabelas não existem
    }

    // Inserir categorias
    console.log('📂 Inserindo categorias...');
    const categories = [
      { name: 'Medicamentos', description: 'Medicamentos diversos' },
      { name: 'Vitaminas', description: 'Vitaminas e suplementos' },
      { name: 'Higiene', description: 'Produtos de higiene pessoal' },
      { name: 'Cosméticos', description: 'Produtos de beleza' }
    ];

    for (const cat of categories) {
      await connection.execute(
        'INSERT INTO categories (name, description, active, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())',
        [cat.name, cat.description]
      );
    }
    console.log(`✅ ${categories.length} categorias inseridas`);

    // Inserir produtos
    console.log('🛒 Inserindo produtos...');
    const products = [
      { name: 'Dipirona 500mg', description: 'Analgésico e anti-inflamatório', price: 15.50, category_id: 1 },
      { name: 'Vitamina C 1000mg', description: 'Vitamina C com 60 cápsulas', price: 28.90, category_id: 2 },
      { name: 'Protetor Solar SPF 50', description: 'Protetor solar 200ml', price: 45.00, category_id: 4 },
      { name: 'Álcool Gel 500ml', description: 'Álcool gel higienizante', price: 12.50, category_id: 3 },
      { name: 'Sabonete Líquido', description: 'Sabonete liquido antisséptico', price: 8.90, category_id: 3 },
      { name: 'Shampoo Neutro', description: 'Shampoo 400ml', price: 18.50, category_id: 4 }
    ];

    for (const prod of products) {
      await connection.execute(
        'INSERT INTO products (name, description, price, category_id, active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
        [prod.name, prod.description, prod.price, prod.category_id]
      );
    }
    console.log(`✅ ${products.length} produtos inseridos`);

    // Inserir admin
    console.log('👤 Inserindo administrador...');
    const bcrypt = require('bcrypt');
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    await connection.execute(
      'INSERT INTO admins (email, password, active, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())',
      ['admin@farmacia.com', passwordHash]
    );
    console.log('✅ Administrador inserido');
    console.log('   Email: admin@farmacia.com');
    console.log('   Senha: admin123');

    console.log('\n✅ Seed concluído com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();

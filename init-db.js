#!/usr/bin/env node

/**
 * 🗄️ Script de Inicialização do Banco de Dados
 * Executado automaticamente pelo Render antes de iniciar o servidor
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
};

async function initDatabase() {
  let connection;

  try {
    console.log('🔧 Conectando ao banco de dados...');
    
    // Conectar ao MySQL (sem banco de dados específico)
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Criar banco de dados se não existir
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('✅ Banco de dados criado ou já existe');
    await tempConnection.end();

    // Conectar ao banco de dados específico
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Conectado ao banco de dados');

    // Ler e executar schema
    const sqlPath = path.join(__dirname, 'database.sql');
    if (fs.existsSync(sqlPath)) {
      console.log('📂 Lendo schema do banco de dados...');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      // Executar cada statement separadamente
      const statements = sql.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await connection.execute(statement);
          } catch (error) {
            // Ignorar erros de tabelas que já existem
            if (!error.message.includes('already exists')) {
              console.warn('⚠️ Erro ao executar statement:', error.message);
            }
          }
        }
      }
      console.log('✅ Schema do banco de dados importado');
    } else {
      console.warn('⚠️ Arquivo database.sql não encontrado');
    }

    console.log('✅ Banco de dados inicializado com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();

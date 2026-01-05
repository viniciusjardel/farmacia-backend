#!/usr/bin/env node

/**
 * 🗄️ Script de Inicialização do Banco de Dados
 * Para MySQL
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'farmacia',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('🔧 Conectando ao banco de dados MySQL...');
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
            if (!error.message.includes('already exists') && !error.message.includes('Duplicate')) {
              console.warn('⚠️ Aviso:', error.message.split('\n')[0]);
            }
          }
        }
      }
      console.log('✅ Schema do banco de dados sincronizado');
    } else {
      console.warn('⚠️ Arquivo database.sql não encontrado - continuando sem inicialização');
    }

    console.log('✅ Banco de dados pronto!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();

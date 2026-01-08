#!/usr/bin/env node

/**
 * 🔄 Script de Restauração de Backup - MySQL
 * Restaura o banco de dados de um arquivo SQL
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function restoreBackup(backupFile) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  try {
    console.log(`📂 Lendo backup: ${backupFile}`);
    
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Arquivo não encontrado: ${backupFile}`);
    }

    const sql = fs.readFileSync(backupFile, 'utf8');
    
    console.log(`🔄 Restaurando banco de dados...`);
    
    // Primeiro, criar o banco se não existir
    const dbName = process.env.DB_NAME || 'farmacia';
    
    const adminConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    try {
      await adminConn.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
      console.log(`✅ Banco de dados criado/verificado`);
    } finally {
      await adminConn.end();
    }

    // Executar o SQL de restauração
    const statements = sql.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    
    let executed = 0;
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          executed++;
          if (executed % 10 === 0) {
            process.stdout.write(`.`);
          }
        } catch (error) {
          if (!error.message.includes('already exists') && !error.message.includes('Duplicate')) {
            console.warn(`\n⚠️  Aviso: ${error.message.split('\n')[0]}`);
          }
        }
      }
    }

    console.log(`\n✅ Restauração concluída! ${executed} comandos executados`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Obter o arquivo de backup mais recente
const backupDir = path.join(__dirname, 'backups');
const backupFiles = fs.readdirSync(backupDir)
  .filter(f => f.endsWith('.sql'))
  .sort()
  .reverse();

if (backupFiles.length === 0) {
  console.error('❌ Nenhum arquivo de backup encontrado em:', backupDir);
  process.exit(1);
}

const mostRecentBackup = path.join(backupDir, backupFiles[0]);
console.log(`🎯 Usando backup mais recente: ${backupFiles[0]}`);

restoreBackup(mostRecentBackup);

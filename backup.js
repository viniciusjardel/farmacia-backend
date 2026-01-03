#!/usr/bin/env node

/**
 * 💾 Script de Backup Automático do Banco de Dados
 * Uso: node backup.js [full|incremental]
 * 
 * Cria backups do banco de dados MySQL
 * - Full backup: Backup completo do banco
 * - Incremental: Apenas dados modificados (simulado com timestamp)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// ========================================
// CONFIGURAÇÃO
// ========================================
const BACKUP_DIR = path.join(__dirname, 'backups');
const BACKUP_LOG_FILE = path.join(BACKUP_DIR, 'backup.log');
const RETENTION_DAYS = 7; // Manter backups dos últimos 7 dias
const MAX_BACKUPS = 30; // Máximo de backups a manter

// Criar diretório se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Diretório criado: ${BACKUP_DIR}`);
}

// ========================================
// LOGGER
// ========================================
function log(message, level = 'INFO') {
  const timestamp = new Date().toLocaleString('pt-BR');
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  // Append ao arquivo de log
  fs.appendFileSync(BACKUP_LOG_FILE, logMessage + '\n', 'utf-8');
}

// ========================================
// CRIAR BACKUP FULL (Versão Node.js Pura)
// ========================================
async function createFullBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = path.join(BACKUP_DIR, `backup_full_${timestamp}.sql`);
  
  log(`🔄 Iniciando backup completo: ${path.basename(backupFile)}`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Obter informações de todas as tabelas
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
    );

    let sqlContent = `-- Backup de ${process.env.DB_NAME}\n`;
    sqlContent += `-- Data: ${new Date().toLocaleString('pt-BR')}\n`;
    sqlContent += `-- ================================================\n\n`;

    // Fazer dump de cada tabela
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      
      // Get CREATE TABLE statement
      const [createResult] = await connection.execute(`SHOW CREATE TABLE ${tableName}`);
      sqlContent += `\n-- Tabela: ${tableName}\n`;
      sqlContent += createResult[0]['Create Table'] + ';\n\n';

      // Get data
      const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        sqlContent += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`;
        
        const values = rows.map(row => {
          const vals = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return val ? 1 : 0;
            if (Buffer.isBuffer(val)) return `0x${val.toString('hex')}`;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          return `(${vals})`;
        }).join(',\n');
        
        sqlContent += values + ';\n\n';
      }
    }

    // Escrever arquivo
    fs.writeFileSync(backupFile, sqlContent, 'utf-8');
    const stats = fs.statSync(backupFile);
    const size = (stats.size / 1024 / 1024).toFixed(2);
    
    log(`✅ Backup completo criado: ${size} MB`);
    
    // Registrar no banco de dados
    try {
      await logBackupToDB(path.basename(backupFile), stats.size, 'success');
    } catch (dbError) {
      log(`⚠️  Erro ao registrar backup no BD: ${dbError.message}`, 'WARN');
    }

    await connection.end();
    return backupFile;
  } catch (error) {
    log(`❌ Erro ao criar backup: ${error.message}`, 'ERROR');
    throw error;
  }
}

// ========================================
// CRIAR BACKUP INCREMENTAL (Versão Node.js Pura)
// ========================================
async function createIncrementalBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = path.join(BACKUP_DIR, `backup_incremental_${timestamp}.sql`);
  
  log(`🔄 Iniciando backup incremental: ${path.basename(backupFile)}`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Para backup incremental, apenas os dados modificados (simulado com timestamp recente)
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
    );

    let sqlContent = `-- Backup Incremental de ${process.env.DB_NAME}\n`;
    sqlContent += `-- Data: ${new Date().toLocaleString('pt-BR')}\n`;
    sqlContent += `-- ================================================\n\n`;

    // Fazer dump apenas de tabelas com updated_at recente (últimas 24h)
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      
      // Verificar se tabela tem coluna updated_at
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      const hasUpdatedAt = columns.some(col => col.Field === 'updated_at');

      let rows;
      if (hasUpdatedAt) {
        // Apenas registros modificados nas últimas 24h
        const [result] = await connection.execute(
          `SELECT * FROM ${tableName} WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`
        );
        rows = result;
      } else {
        // Se não tem updated_at, pega tudo
        const [result] = await connection.execute(`SELECT * FROM ${tableName}`);
        rows = result;
      }

      if (rows.length > 0) {
        const columnsData = Object.keys(rows[0]);
        sqlContent += `\n-- Tabela: ${tableName}\n`;
        sqlContent += `INSERT INTO ${tableName} (${columnsData.join(', ')}) VALUES\n`;
        
        const values = rows.map(row => {
          const vals = columnsData.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return val ? 1 : 0;
            if (Buffer.isBuffer(val)) return `0x${val.toString('hex')}`;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          return `(${vals})`;
        }).join(',\n');
        
        sqlContent += values + ';\n';
      }
    }

    // Escrever arquivo
    fs.writeFileSync(backupFile, sqlContent, 'utf-8');
    const stats = fs.statSync(backupFile);
    const size = (stats.size / 1024 / 1024).toFixed(2);
    
    log(`✅ Backup incremental criado: ${size} MB`);
    
    try {
      await logBackupToDB(path.basename(backupFile), stats.size, 'success');
    } catch (dbError) {
      log(`⚠️  Erro ao registrar backup no BD: ${dbError.message}`, 'WARN');
    }

    await connection.end();
    return backupFile;
  } catch (error) {
    log(`❌ Erro ao criar backup incremental: ${error.message}`, 'ERROR');
    throw error;
  }
}

// ========================================
// REGISTRAR BACKUP NO BANCO
// ========================================
async function logBackupToDB(filename, size, status) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await connection.execute(
      'INSERT INTO database_backup_log (backup_file, backup_size, status) VALUES (?, ?, ?)',
      [filename, size, status]
    );
  } finally {
    await connection.end();
  }
}

// ========================================
// LIMPAR BACKUPS ANTIGOS
// ========================================
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Manter apenas os últimos MAX_BACKUPS
    const toDelete = files.slice(MAX_BACKUPS);
    
    if (toDelete.length > 0) {
      log(`🧹 Limpando ${toDelete.length} backups antigos`);
      
      toDelete.forEach(file => {
        try {
          fs.unlinkSync(file.path);
          log(`   Deletado: ${file.name}`, 'DEBUG');
        } catch (err) {
          log(`   Erro ao deletar ${file.name}: ${err.message}`, 'WARN');
        }
      });
    }

    // Também limpar backups com mais de RETENTION_DAYS dias
    const cutoffTime = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const expiredFiles = files.filter(f => f.mtime < cutoffTime);
    
    if (expiredFiles.length > 0) {
      log(`🗑️  Removendo ${expiredFiles.length} backups expirados (>${RETENTION_DAYS} dias)`);
      
      expiredFiles.forEach(file => {
        try {
          fs.unlinkSync(file.path);
          log(`   Deletado: ${file.name}`, 'DEBUG');
        } catch (err) {
          log(`   Erro ao deletar ${file.name}: ${err.message}`, 'WARN');
        }
      });
    }
  } catch (error) {
    log(`❌ Erro ao limpar backups antigos: ${error.message}`, 'ERROR');
  }
}

// ========================================
// RESTAURAR BACKUP (Versão Node.js Pura)
// ========================================
async function restoreBackup(backupFile) {
  const fullPath = path.join(BACKUP_DIR, backupFile);
  
  if (!fs.existsSync(fullPath)) {
    log(`❌ Arquivo de backup não encontrado: ${backupFile}`, 'ERROR');
    return false;
  }

  log(`🔄 Iniciando restauração: ${backupFile}`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Ler arquivo SQL
    const sqlContent = fs.readFileSync(fullPath, 'utf-8');
    
    // Dividir em statements individuais (simples divisão por ;)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Executar cada statement
    let count = 0;
    for (const statement of statements) {
      try {
        await connection.execute(statement);
        count++;
      } catch (error) {
        // Ignore alguns erros comuns
        if (!error.message.includes('already exists') && 
            !error.message.includes('Duplicate') &&
            !error.message.includes('DROP')) {
          log(`⚠️  Erro ao executar statement: ${error.message}`, 'WARN');
        }
      }
    }

    log(`✅ Backup restaurado com sucesso (${count} statements executados)`);
    
    try {
      await logBackupToDB(backupFile, 0, 'restored');
    } catch (dbError) {
      log(`⚠️  Erro ao registrar restauração no BD: ${dbError.message}`, 'WARN');
    }

    await connection.end();
    return true;
  } catch (error) {
    log(`❌ Erro ao restaurar backup: ${error.message}`, 'ERROR');
    throw error;
  }
}

// ========================================
// LISTAR BACKUPS
// ========================================
function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
      .map(f => {
        const fullPath = path.join(BACKUP_DIR, f);
        const stats = fs.statSync(fullPath);
        return {
          name: f,
          size: (stats.size / 1024 / 1024).toFixed(2),
          mtime: stats.mtime.toLocaleString('pt-BR')
        };
      })
      .sort((a, b) => new Date(b.mtime) - new Date(a.mtime));

    console.log('\n📋 Backups Disponíveis:\n');
    if (files.length === 0) {
      console.log('   Nenhum backup encontrado\n');
    } else {
      files.forEach(f => {
        console.log(`   📦 ${f.name}`);
        console.log(`      Tamanho: ${f.size} MB`);
        console.log(`      Data: ${f.mtime}\n`);
      });
    }
  } catch (error) {
    console.error(`❌ Erro ao listar backups: ${error.message}`);
  }
}

// ========================================
// MAIN
// ========================================
async function main() {
  const mode = process.argv[2] || 'full';
  
  log(`🚀 Iniciando backup (modo: ${mode})`);
  
  try {
    switch (mode.toLowerCase()) {
      case 'full':
        await createFullBackup();
        break;
      case 'incremental':
        await createIncrementalBackup();
        break;
      case 'list':
        listBackups();
        return;
      case 'restore':
        const backupFile = process.argv[3];
        if (!backupFile) {
          console.error('❌ Especifique o arquivo de backup: node backup.js restore <filename>');
          process.exit(1);
        }
        await restoreBackup(backupFile);
        break;
      default:
        console.error(`❌ Modo desconhecido: ${mode}`);
        console.error('Modos disponíveis: full, incremental, list, restore');
        process.exit(1);
    }
    
    // Limpar backups antigos após criar novo
    if (mode !== 'restore' && mode !== 'list') {
      cleanupOldBackups();
    }
    
    log(`✅ Operação concluída com sucesso`);
  } catch (error) {
    log(`❌ Erro na operação: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// ========================================
// AGENDADOR (CRON)
// ========================================
function setupScheduledBackup() {
  const schedule = require('node-schedule');
  
  // Backup diário às 2AM
  schedule.scheduleJob('0 2 * * *', async () => {
    log('⏰ Executando backup automático agendado');
    try {
      await createFullBackup();
      cleanupOldBackups();
      log('✅ Backup automático concluído');
    } catch (error) {
      log(`❌ Erro no backup automático: ${error.message}`, 'ERROR');
    }
  });
  
  log('📅 Backup automático agendado para 02:00 diariamente');
}

// Executar
if (require.main === module) {
  main().catch(error => {
    log(`❌ Erro fatal: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = {
  createFullBackup,
  createIncrementalBackup,
  restoreBackup,
  listBackups,
  setupScheduledBackup
};

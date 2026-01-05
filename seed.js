#!/usr/bin/env node

/**
 * 🌱 Script de Seed - Dados Iniciais
 * Uso: node seed.js [reset|init]
 * 
 * - reset: Limpa e recria as tabelas (⚠️ CUIDADO!)
 * - init: Apenas insere dados iniciais se vazio (padrão)
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// ========================================
// CONFIGURAÇÃO
// ========================================
const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: { rejectUnauthorized: false }
};

// ========================================
// LOGGER
// ========================================
function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️',
    debug: '🔧'
  };
  console.log(`${icons[type]} ${message}`);
}

// ========================================
// CRIAR TABELAS
// ========================================
async function createTables(connection) {
  log('Criando tabelas do banco de dados...', 'info');

  const tables = [
    // Categorias
    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      active TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Produtos
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      category_id INT NOT NULL,
      image_url VARCHAR(500),
      active TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_products_category 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Admins
    `CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      pin_hash VARCHAR(255) NOT NULL,
      active TINYINT DEFAULT 1,
      last_login TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Audit logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      action VARCHAR(50) NOT NULL,
      entity VARCHAR(100) NOT NULL,
      entity_id INT,
      before_data JSON,
      after_data JSON,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_audit_logs_user 
        FOREIGN KEY (user_id) 
        REFERENCES admins(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Backup log
    `CREATE TABLE IF NOT EXISTS database_backup_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      backup_file VARCHAR(255) NOT NULL,
      backup_size BIGINT,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];

  for (const sql of tables) {
    try {
      await connection.execute(sql);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  log('Tabelas criadas/verificadas', 'success');
}

// ========================================
// CRIAR ÍNDICES
// ========================================
async function createIndexes(connection) {
  log('Criando índices...', 'info');

  const indexes = [
    // Categories
    'ALTER TABLE categories ADD INDEX idx_categories_active (active)',
    'ALTER TABLE categories ADD INDEX idx_categories_name (name)',

    // Products
    'ALTER TABLE products ADD INDEX idx_products_active (active)',
    'ALTER TABLE products ADD INDEX idx_products_category_id (category_id)',
    'ALTER TABLE products ADD INDEX idx_products_name (name)',
    'ALTER TABLE products ADD INDEX idx_products_created_at (created_at)',

    // Admins
    'ALTER TABLE admins ADD INDEX idx_admins_email (email)',
    'ALTER TABLE admins ADD INDEX idx_admins_active (active)',

    // Audit logs
    'ALTER TABLE audit_logs ADD INDEX idx_audit_logs_user_id (user_id)',
    'ALTER TABLE audit_logs ADD INDEX idx_audit_logs_action (action)',
    'ALTER TABLE audit_logs ADD INDEX idx_audit_logs_entity (entity)',
    'ALTER TABLE audit_logs ADD INDEX idx_audit_logs_created_at (created_at)',
    'ALTER TABLE audit_logs ADD INDEX idx_audit_logs_composite (user_id, action, created_at)',

    // Backup log
    'ALTER TABLE database_backup_log ADD INDEX idx_backup_log_created_at (created_at)'
  ];

  for (const sql of indexes) {
    try {
      await connection.execute(sql);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        log(`  Erro ao criar índice: ${error.message}`, 'warn');
      }
    }
  }

  log('Índices criados/verificados', 'success');
}

// ========================================
// INSERIR DADOS
// ========================================
async function seedData(connection) {
  log('Inserindo dados iniciais...', 'info');

  // Verificar se já tem dados
  const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
  if (categories[0].count > 0) {
    log('Dados já existem, pulando seed', 'warn');
    return;
  }

  // 1️⃣ Categorias
  const categoriesData = [
    { name: 'Medicamentos', description: 'Medicamentos diversos' },
    { name: 'Vitaminas', description: 'Vitaminas e suplementos' },
    { name: 'Higiene', description: 'Higiene pessoal e limpeza' },
    { name: 'Acessórios', description: 'Acessórios para saúde' }
  ];

  for (const cat of categoriesData) {
    try {
      await connection.execute(
        'INSERT INTO categories (name, description, active) VALUES (?, ?, 1)',
        [cat.name, cat.description]
      );
      log(`  ✓ Categoria: ${cat.name}`, 'debug');
    } catch (error) {
      if (!error.message.includes('Duplicate entry')) {
        throw error;
      }
    }
  }

  // 2️⃣ Produtos
  const [cats] = await connection.execute('SELECT id, name FROM categories');
  const categoryMap = Object.fromEntries(cats.map(c => [c.name, c.id]));

  const productsData = [
    { name: 'Dipirona 500mg', description: 'Analgésico e antitérmico', price: 15.50, category: 'Medicamentos', image: 'dipirona.jpg' },
    { name: 'Vitamina C 1000mg', description: 'Fortalece a imunidade', price: 25.00, category: 'Vitaminas', image: 'vitamina-c.jpg' },
    { name: 'Álcool 70%', description: 'Desinfetante para limpeza', price: 8.90, category: 'Higiene', image: 'alcool.jpg' },
    { name: 'Termômetro Digital', description: 'Medidor de temperatura', price: 35.00, category: 'Acessórios', image: 'termometro.jpg' },
    { name: 'Paracetamol 500mg', description: 'Analgésico e antitérmico', price: 12.50, category: 'Medicamentos', image: 'paracetamol.jpg' },
    { name: 'Vitamina D3', description: 'Fortalece ossos e imunidade', price: 45.00, category: 'Vitaminas', image: 'vitamina-d3.jpg' },
    { name: 'Sabonete Antisséptico', description: 'Higiene diária com proteção', price: 6.50, category: 'Higiene', image: 'sabonete.jpg' },
    { name: 'Luvas Descartáveis', description: 'Caixa com 100 unidades', price: 28.00, category: 'Acessórios', image: 'luvas.jpg' }
  ];

  for (const prod of productsData) {
    try {
      const categoryId = categoryMap[prod.category];
      if (categoryId) {
        await connection.execute(
          'INSERT INTO products (name, description, price, category_id, image_url, active) VALUES (?, ?, ?, ?, ?, 1)',
          [prod.name, prod.description, prod.price, categoryId, prod.image]
        );
        log(`  ✓ Produto: ${prod.name}`, 'debug');
      }
    } catch (error) {
      if (!error.message.includes('Duplicate entry')) {
        throw error;
      }
    }
  }

  // 3️⃣ Admin padrão
  try {
    // Hash de "admin123"
    const passwordHash = await bcrypt.hash('admin123', 10);
    // Hash de "1234"
    const pinHash = await bcrypt.hash('1234', 10);

    await connection.execute(
      'INSERT INTO admins (email, password, pin_hash, active) VALUES (?, ?, ?, 1)',
      ['admin@farmacia.com', passwordHash, pinHash]
    );
    log('  ✓ Admin padrão criado: admin@farmacia.com (senha: admin123, PIN: 1234)', 'debug');
  } catch (error) {
    if (!error.message.includes('Duplicate entry')) {
      throw error;
    } else {
      log('  ✓ Admin padrão já existe', 'debug');
    }
  }

  log('Dados iniciais inseridos', 'success');
}

// ========================================
// RESET (LIMPAR TUDO)
// ========================================
async function resetDatabase(connection) {
  log('⚠️  ATENÇÃO: Isso vai limpar TODO o banco de dados!', 'warn');
  log('Resetando banco de dados...', 'info');

  // Drop em ordem reversa das dependências
  const drops = [
    'DROP TABLE IF EXISTS audit_logs',
    'DROP TABLE IF EXISTS products',
    'DROP TABLE IF EXISTS categories',
    'DROP TABLE IF EXISTS admins',
    'DROP TABLE IF EXISTS database_backup_log'
  ];

  for (const sql of drops) {
    try {
      await connection.execute(sql);
    } catch (error) {
      log(`  Erro: ${error.message}`, 'warn');
    }
  }

  log('Banco de dados resetado', 'success');
  
  // Recriar tudo
  await createTables(connection);
  await createIndexes(connection);
  await seedData(connection);
}

// ========================================
// MAIN
// ========================================
async function main() {
  let connection;

  try {
    log('🚀 Iniciando seed do banco de dados...', 'info');
    log(`Base de dados: ${DB_CONFIG.database}`, 'debug');
    
    connection = await mysql.createConnection(DB_CONFIG);
    log('Conectado ao MySQL', 'success');

    const mode = process.argv[2] || 'init';

    if (mode === 'reset') {
      // Confirmação
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('⚠️  Tem certeza? Digite "sim" para confirmar: ', async (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'sim') {
          await resetDatabase(connection);
          log('✅ Reset completado com sucesso!', 'success');
        } else {
          log('Operação cancelada', 'warn');
        }
        
        await connection.end();
        process.exit(0);
      });
    } else {
      // Init (padrão)
      await createTables(connection);
      await createIndexes(connection);
      await seedData(connection);
      log('✅ Seed concluído com sucesso!', 'success');
      await connection.end();
    }
  } catch (error) {
    log(`Erro: ${error.message}`, 'error');
    if (connection) await connection.end();
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { createTables, createIndexes, seedData, resetDatabase };

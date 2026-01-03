-- ========================================
-- 💊 Farmácia Database Schema
-- ========================================
-- Script de criação de tabelas com índices,
-- chaves estrangeiras e dados iniciais

-- ========================================
-- 1️⃣ TABELA: CATEGORIES
-- ========================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices em categories
CREATE INDEX idx_categories_active ON categories(active);
CREATE INDEX idx_categories_name ON categories(name);

-- ========================================
-- 2️⃣ TABELA: PRODUCTS
-- ========================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT NOT NULL,
  image_url VARCHAR(500),
  active TINYINT DEFAULT 1,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 🔗 Chave estrangeira com ON DELETE CASCADE
  CONSTRAINT fk_products_category 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices em products
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_created_at ON products(created_at);

-- ========================================
-- 3️⃣ TABELA: ADMINS
-- ========================================
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  active TINYINT DEFAULT 1,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices em admins
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_active ON admins(active);

-- ========================================
-- 4️⃣ TABELA: AUDIT_LOGS
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id INT,
  before_data JSON,
  after_data JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 🔗 Chave estrangeira com ON DELETE SET NULL
  CONSTRAINT fk_audit_logs_user 
    FOREIGN KEY (user_id) 
    REFERENCES admins(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices em audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_composite ON audit_logs(user_id, action, created_at);

-- ========================================
-- 📊 SEED - Dados Iniciais
-- ========================================

-- 🏥 Categorias
INSERT INTO categories (name, description, active) VALUES 
  ('Medicamentos', 'Medicamentos diversos', 1),
  ('Vitaminas', 'Vitaminas e suplementos', 1),
  ('Higiene', 'Higiene pessoal e limpeza', 1),
  ('Acessórios', 'Acessórios para saúde', 1)
ON DUPLICATE KEY UPDATE id=id;

-- 💊 Produtos de Exemplo
INSERT INTO products (name, description, price, category_id, image_url, active) VALUES 
  ('Dipirona 500mg', 'Analgésico e antitérmico', 15.50, 1, 'https://via.placeholder.com/300?text=Dipirona', 1),
  ('Vitamina C 1000mg', 'Fortalece a imunidade', 25.00, 2, 'https://via.placeholder.com/300?text=Vitamina+C', 1),
  ('Álcool 70%', 'Desinfetante para limpeza', 8.90, 3, 'https://via.placeholder.com/300?text=Alcool+70', 1),
  ('Termômetro Digital', 'Medidor de temperatura', 35.00, 4, 'https://via.placeholder.com/300?text=Termometro', 1),
  ('Paracetamol 500mg', 'Analgésico e antitérmico', 12.50, 1, 'https://via.placeholder.com/300?text=Paracetamol', 1),
  ('Vitamina D3', 'Fortalece ossos e imunidade', 45.00, 2, 'https://via.placeholder.com/300?text=Vitamina+D3', 1),
  ('Sabonete Antisséptico', 'Higiene diária com proteção', 6.50, 3, 'https://via.placeholder.com/300?text=Sabonete', 1),
  ('Luvas Descartáveis', 'Caixa com 100 unidades', 28.00, 4, 'https://via.placeholder.com/300?text=Luvas', 1)
ON DUPLICATE KEY UPDATE id=id;

-- 👨‍💼 Admin Padrão (email: admin@farmacia.com, senha: admin123, pin: 1234)
-- Senhas com bcrypt (10 rounds)
INSERT INTO admins (email, password, pin_hash, active) VALUES 
  ('admin@farmacia.com', '$2b$10$jTKmfBN7GGF8YKn/P7.L..nZiT/rIYUqPL6KV6Wqjh.H1wQ.xEzsy', '$2b$10$6jLT8h5OfQN2Tv3J3Kq5.ep7GxDQQV9FDBl8Nx6xLmf.Ofjyu6GGK', 1)
ON DUPLICATE KEY UPDATE id=id;

-- ========================================
-- 📋 TABELA: DATABASE_BACKUP_LOG (para rastrear backups)
-- ========================================
CREATE TABLE IF NOT EXISTS database_backup_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  backup_file VARCHAR(255) NOT NULL,
  backup_size BIGINT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_backup_log_created_at ON database_backup_log(created_at);

-- ========================================
-- ✅ FIM DO SCRIPT
-- ========================================
-- Execute este arquivo com:
-- mysql -u root -p farmacia_db < database.sql
-- ou use a ferramenta graphql para importar

-- Backup de farmacia_db
-- Data: 29/12/2025, 02:14:45
-- ================================================


-- Tabela: admins
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('SUPER','ADMIN') DEFAULT 'ADMIN',
  `pin_hash` varchar(255) NOT NULL,
  `pin_attempts` int DEFAULT '0',
  `pin_block_until` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_admins_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO admins (id, email, password, role, pin_hash, pin_attempts, pin_block_until) VALUES
(1, 'admin@farmacia.com', '$2b$10$HekqQ5LVPYMGrft6s7doKuU4JY2OCBh5q.L7CRZmdL8kCokT8eAKe', 'ADMIN', '$2b$10$Kn2YEG9j2dFtSTLbc3zDs.agmbnf1lQLuiQcwaBNrYZ29iJjHpnh2', 0, NULL);


-- Tabela: audit_logs
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(50) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `entity_id` int DEFAULT NULL,
  `before_data` json DEFAULT NULL,
  `after_data` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_user_id` (`user_id`),
  KEY `idx_audit_logs_action` (`action`),
  KEY `idx_audit_logs_entity` (`entity`),
  KEY `idx_audit_logs_created_at` (`created_at`),
  KEY `idx_audit_logs_composite` (`user_id`,`action`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO audit_logs (id, user_id, action, entity, entity_id, before_data, after_data, ip_address, created_at) VALUES
(1, 1, 'UPDATE_PRODUCT', 'products', 9, '[object Object]', '[object Object]', '::1', 'Fri Dec 26 2025 10:33:10 GMT-0300 (Horário Padrão de Brasília)'),
(2, 1, 'UPDATE_PRODUCT', 'products', 15, '[object Object]', '[object Object]', '::1', 'Fri Dec 26 2025 11:12:27 GMT-0300 (Horário Padrão de Brasília)'),
(3, 1, 'DELETE_PRODUCT', 'products', 15, '[object Object]', NULL, '::1', 'Fri Dec 26 2025 11:39:20 GMT-0300 (Horário Padrão de Brasília)'),
(4, 1, 'DELETE_PRODUCT', 'products', 11, '[object Object]', NULL, '::1', 'Fri Dec 26 2025 11:53:45 GMT-0300 (Horário Padrão de Brasília)'),
(5, 1, 'UPDATE_PRODUCT', 'products', 9, '[object Object]', '[object Object]', '::1', 'Fri Dec 26 2025 11:53:53 GMT-0300 (Horário Padrão de Brasília)'),
(6, 1, 'DELETE_PRODUCT', 'products', 18, '[object Object]', NULL, '::1', 'Mon Dec 29 2025 00:35:08 GMT-0300 (Horário Padrão de Brasília)'),
(7, 1, 'UPDATE_PRODUCT', 'products', 9, '[object Object]', '[object Object]', '::1', 'Mon Dec 29 2025 00:35:18 GMT-0300 (Horário Padrão de Brasília)'),
(8, 1, 'UPDATE_PRODUCT', 'products', 9, '[object Object]', '[object Object]', '::1', 'Mon Dec 29 2025 01:21:03 GMT-0300 (Horário Padrão de Brasília)'),
(9, 1, 'UPDATE_PRODUCT', 'products', 9, '[object Object]', '[object Object]', '::1', 'Mon Dec 29 2025 01:25:49 GMT-0300 (Horário Padrão de Brasília)'),
(10, 1, 'UPDATE_PRODUCT', 'products', 9, '[object Object]', '[object Object]', '::1', 'Mon Dec 29 2025 01:26:36 GMT-0300 (Horário Padrão de Brasília)'),
(11, 1, 'DELETE_PRODUCT', 'products', 19, '[object Object]', NULL, '::1', 'Mon Dec 29 2025 01:45:42 GMT-0300 (Horário Padrão de Brasília)'),
(12, 1, 'UPDATE_PRODUCT', 'products', 9, '[object Object]', '[object Object]', '::1', 'Mon Dec 29 2025 01:47:06 GMT-0300 (Horário Padrão de Brasília)');


-- Tabela: categories
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_categories_active` (`active`),
  KEY `idx_categories_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO categories (id, name, active) VALUES
(1, 'Analgésicos', 1),
(2, 'Anti-inflamatórios', 1),
(3, 'Vitaminas', 1),
(4, 'Antialérgicos', 1),
(6, 'Antibióticos', 1),
(7, 'Higiene', 1);


-- Tabela: database_backup_log
CREATE TABLE `database_backup_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `backup_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `backup_size` bigint DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_backup_log_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tabela: products
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_products_active` (`active`),
  KEY `idx_products_category_id` (`category_id`),
  KEY `idx_products_name` (`name`),
  KEY `idx_products_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO products (id, name, description, price, category, image_url, active, created_at, category_id) VALUES
(9, 'Prednisolona', '20mg', '24.99', NULL, 'https://images.tcdn.com.br/img/img_prod/1392382/prednisona_20mg_c_20_comp_neo_1_20250817182540_eae6ea6f9d6f.png', 1, 'Tue Dec 23 2025 23:36:06 GMT-0300 (Horário Padrão de Brasília)', 4),
(10, 'paracetamol', '500mg', '20.00', NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-eZcuH0mfM8bVWgrIuJmwqPU8ZSGeEgliYw&s', 1, 'Tue Dec 23 2025 23:46:36 GMT-0300 (Horário Padrão de Brasília)', 1),
(16, 'Nimesulida', '100mg', '14.99', NULL, 'https://d1jgmae0hcnr1i.cloudfront.net/Custom/Content/Products/89/79/89797_nimesulida-100mg-c-12cpr-p64252_m1_638283143491994824.webp', 1, 'Thu Dec 25 2025 22:31:02 GMT-0300 (Horário Padrão de Brasília)', 2),
(17, 'metoprolol', '25mg', '12.99', NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMwh63CPSf2X3Hs1fMA2xcvFhNr6D2pHotKg&s', 1, 'Sat Dec 27 2025 16:42:07 GMT-0300 (Horário Padrão de Brasília)', 3);


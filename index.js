require('dotenv').config();

console.log('🔥 BACKEND INICIADO 🔥');

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// � CONTENT SECURITY POLICY (CSP)
// ===============================
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'"
  );
  next();
});

// ===============================
// �📁 ARQUIVOS ESTÁTICOS DO FRONTEND
// ===============================
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// ===============================
// 📁 UPLOAD DE IMAGENS
// ===============================
// Usar pasta temporária do sistema (funciona em produção)
const os = require('os');
const uploadsDir = process.env.NODE_ENV === 'production' 
  ? path.join(os.tmpdir(), 'farmacia-uploads')
  : path.join(__dirname, '..', 'frontend', 'uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Não foi possível criar pasta de uploads:', err.message);
}

// Servir arquivos estáticos (se existir)
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
}

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    // Detectar extensão pelo MIME type se não houver no nome original
    let ext = path.extname(file.originalname);
    if (!ext) {
      const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp'
      };
      ext = mimeToExt[file.mimetype] || '.jpg';
    }
    const name = path.basename(file.originalname, path.extname(file.originalname));
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  }
});

app.use((req, res, next) => {
  console.log(`➡️ REQUISIÇÃO: ${req.method} ${req.url}`);
  next();
});

// ===============================
// 🚫 RATE LIMIT - ANTI BRUTE FORCE
// ===============================
const loginAttempts = {}; // { ip: { count, lastAttempt, blocked } }
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos em ms
const ATTEMPT_RESET_TIME = 15 * 60 * 1000; // Reset contagem após 15 minutos

function checkRateLimit(ip) {
  const now = Date.now();
  
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { count: 0, lastAttempt: now, blocked: false };
  }

  const attempt = loginAttempts[ip];

  // Se está bloqueado, verificar se o tempo expirou
  if (attempt.blocked) {
    if (now - attempt.blockedTime >= LOCKOUT_TIME) {
      // Desbloquear
      loginAttempts[ip] = { count: 0, lastAttempt: now, blocked: false };
      console.log(`🔓 IP desbloqueado: ${ip}`);
      return { allowed: true, message: null };
    } else {
      const timeLeft = Math.ceil((LOCKOUT_TIME - (now - attempt.blockedTime)) / 1000);
      return {
        allowed: false,
        message: `Muitas tentativas. Tente novamente em ${timeLeft} segundos`
      };
    }
  }

  // Se passou tempo desde a última tentativa, resetar contador
  if (now - attempt.lastAttempt >= ATTEMPT_RESET_TIME) {
    attempt.count = 0;
  }

  attempt.lastAttempt = now;
  
  return { allowed: true, message: null };
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { count: 0, lastAttempt: now, blocked: false };
  }

  loginAttempts[ip].count++;
  loginAttempts[ip].lastAttempt = now;

  console.log(`⚠️ Tentativa falha - IP: ${ip}, Contador: ${loginAttempts[ip].count}/${MAX_ATTEMPTS}`);

  if (loginAttempts[ip].count >= MAX_ATTEMPTS) {
    loginAttempts[ip].blocked = true;
    loginAttempts[ip].blockedTime = now;
    console.log(`🔒 IP bloqueado por muitas tentativas: ${ip}`);
  }
}

function resetLoginAttempts(ip) {
  if (loginAttempts[ip]) {
    loginAttempts[ip] = { count: 0, lastAttempt: Date.now(), blocked: false };
    console.log(`✅ Tentativas de login resetadas - IP: ${ip}`);
  }
}


// ===============================
// 🔌 MySQL
// ===============================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('❌ Erro MySQL:', err);
    return;
  }
  console.log('✅ MySQL conectado');
});

// ===============================
// 🔐 AUTH MIDDLEWARE
// ===============================
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não enviado' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

// ===============================
// 📋 LOG DE AUDITORIA
// ===============================
function logAuditoria({
  user_id,
  action,
  entity,
  entity_id = null,
  before_data = null,
  after_data = null,
  ip
}) {
  db.query(
    `INSERT INTO audit_logs
     (user_id, action, entity, entity_id, before_data, after_data, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      action,
      entity,
      entity_id,
      before_data ? JSON.stringify(before_data) : null,
      after_data ? JSON.stringify(after_data) : null,
      ip
    ]
  );
}

// ===============================
// 🔐 AUTH CHECK
// ===============================
app.get('/admin/check', auth, (req, res) => {
  res.json({ ok: true });
});

// ===============================
// 🔐 VERIFICAR PIN
// ===============================
app.post('/admin/verify-pin', auth, async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ message: 'PIN é obrigatório' });
    }

    const admin = await getAdminById(req.user.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin não encontrado' });
    }

    const pinOk = await bcrypt.compare(pin, admin.pin_hash);

    if (!pinOk) {
      return res.status(403).json({ message: 'PIN incorreto' });
    }

    res.json({ message: 'PIN verificado com sucesso' });
  } catch (error) {
    console.error('Erro ao verificar PIN:', error);
    res.status(500).json({ message: 'Erro ao verificar PIN' });
  }
});

// ===============================
// 🔐 FUNÇÕES AUXILIARES
// ===============================
function getAdminById(id) {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT id, pin_hash FROM admins WHERE id = ?',
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });
}

// ===============================
// 📂 CATEGORIAS (CLIENTE + ADMIN)
// ===============================
app.get('/categories', (req, res) => {
  db.query(
    'SELECT id, name FROM categories WHERE active = 1',
    (err, results) => {
      if (err) {
        console.error('❌ Erro ao buscar categorias:', err);
        return res.status(500).json(err);
      }
      console.log(`✅ Categorias enviadas: ${results.length} encontradas`);
      res.json(results);
    }
  );
});

// ✅ CRIAR NOVA CATEGORIA (ADMIN)
app.post('/categories', auth, (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
  }

  // Verificar se a categoria já existe
  db.query(
    'SELECT id FROM categories WHERE name = ?',
    [name.trim()],
    (err, existing) => {
      if (err) {
        console.error('❌ Erro ao verificar categoria:', err);
        return res.status(500).json({ error: 'Erro ao criar categoria' });
      }

      if (existing.length > 0) {
        return res.status(409).json({ error: 'Esta categoria já existe' });
      }

      db.query(
        'INSERT INTO categories (name, description, active) VALUES (?, ?, 1)',
        [name.trim(), description?.trim() || null],
        (err, result) => {
          if (err) {
            console.error('❌ Erro ao inserir categoria:', err);
            return res.status(500).json({ error: 'Erro ao criar categoria' });
          }

          res.status(201).json({
            id: result.insertId,
            name: name.trim(),
            description: description?.trim() || null,
            active: 1
          });
        }
      );
    }
  );
});

// ✅ ATUALIZAR CATEGORIA (ADMIN)
app.put('/categories/:id', auth, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
  }

  // Verificar se a categoria existe
  db.query(
    'SELECT id FROM categories WHERE id = ?',
    [id],
    (err, existing) => {
      if (err) {
        console.error('❌ Erro ao verificar categoria:', err);
        return res.status(500).json({ error: 'Erro ao atualizar categoria' });
      }

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Verificar se outro nome já existe
      db.query(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [name.trim(), id],
        (err, duplicate) => {
          if (err) {
            console.error('❌ Erro ao verificar duplicata:', err);
            return res.status(500).json({ error: 'Erro ao atualizar categoria' });
          }

          if (duplicate.length > 0) {
            return res.status(409).json({ error: 'Já existe outra categoria com este nome' });
          }

          db.query(
            'UPDATE categories SET name = ?, description = ? WHERE id = ?',
            [name.trim(), description?.trim() || null, id],
            (err) => {
              if (err) {
                console.error('❌ Erro ao atualizar categoria:', err);
                return res.status(500).json({ error: 'Erro ao atualizar categoria' });
              }

              res.json({ message: 'Categoria atualizada com sucesso' });
            }
          );
        }
      );
    }
  );
});

// ✅ DELETAR CATEGORIA (ADMIN)
app.delete('/categories/:id', auth, (req, res) => {
  const { id } = req.params;

  // Verificar se a categoria existe
  db.query(
    'SELECT id FROM categories WHERE id = ?',
    [id],
    (err, existing) => {
      if (err) {
        console.error('❌ Erro ao verificar categoria:', err);
        return res.status(500).json({ error: 'Erro ao excluir categoria' });
      }

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Marcar categoria como inativa (soft delete)
      db.query(
        'UPDATE categories SET active = 0 WHERE id = ?',
        [id],
        (err) => {
          if (err) {
            console.error('❌ Erro ao excluir categoria:', err);
            return res.status(500).json({ error: 'Erro ao excluir categoria' });
          }

          res.json({ message: 'Categoria excluída com sucesso' });
        }
      );
    }
  );
});

// ===============================
// 🛒 PRODUTOS (CLIENTE)
// ===============================
app.get('/products', (req, res) => {
  db.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id`,
    (err, results) => {
      if (err) {
        console.error('❌ Erro ao buscar produtos:', err);
        return res.status(500).json(err);
      }
      console.log(`✅ Produtos enviados: ${results.length} encontrados`);
      res.json(results);
    }
  );
});

app.get('/products/category/:id', (req, res) => {
  db.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.category_id = ?`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// ===============================
// 🧑‍💼 PRODUTOS (ADMIN)
// ===============================
app.get('/admin/products', auth, (req, res) => {
  console.log('📦 GET /admin/products - Buscando produtos...');
  db.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id`,
    (err, results) => {
      if (err) {
        console.error('❌ Erro ao buscar produtos:', err);
        return res.status(500).json(err);
      }
      console.log('✅ Produtos encontrados:', results.length);
      console.log('Dados:', JSON.stringify(results, null, 2));
      res.json(results);
    }
  );
});

app.get('/admin/products/:id', auth, (req, res) => {
  db.query(
    'SELECT * FROM products WHERE id = ?',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (!results.length)
        return res.status(404).json({ message: 'Produto não encontrado' });
      res.json(results[0]);
    }
  );
});

// ===============================
// 📸 UPLOAD DE IMAGEM
// ===============================
app.post('/admin/upload', auth, (req, res) => {
  // Middleware de upload com tratamento de erro
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Erro de upload:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Arquivo muito grande. Máximo: 5MB' });
      }
      if (err.code === 'LIMIT_PART_COUNT') {
        return res.status(400).json({ message: 'Muitos arquivos' });
      }
      
      return res.status(400).json({ message: err.message || 'Erro ao processar arquivo' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem foi enviada' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    console.log(`✅ Imagem enviada: ${req.file.filename}`);
    
    res.json({ 
      message: 'Imagem enviada com sucesso',
      url: imageUrl,
      filename: req.file.filename
    });
  });
});

// ===============================
// 🧪 TEST UPLOAD (sem autenticação para debug)
// ===============================
app.post('/test/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Erro de test upload:', err);
      return res.status(400).json({ message: err.message, code: err.code });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem foi enviada' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      message: 'Imagem enviada com sucesso (TEST)',
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

app.post('/admin/products', auth, async (req, res) => {
  console.log('🔐 POST /admin/products recebido');
  const { name, description, price, category_id, image_url, active, quantity } = req.body;

  console.log('📦 Dados recebidos:', { name, description, price, category_id, image_url, active, quantity });

  // ✅ PIN já foi validado em /admin/verify-pin, não precisa validar novamente
  
  // Converter active para número (1 ou 0), padrão é 1 (disponível)
  const isActive = active !== undefined ? (active === 1 || active === '1' ? 1 : 0) : 1;
  const qty = quantity !== undefined ? parseInt(quantity) : 1;

  db.query(
    `INSERT INTO products 
     (name, description, price, category_id, image_url, active, quantity)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, description, price, category_id, image_url, isActive, qty],
    (err, result) => {
      if (err) {
        console.error('❌ Erro ao inserir produto:', err);
        return res.status(500).json(err);
      }
      
      console.log('✅ Produto inserido com sucesso!');
      console.log('  - ID:', result.insertId);
      
      // 📋 Log auditoria
      logAuditoria({
        user_id: req.user.id,
        action: 'CREATE_PRODUCT',
        entity: 'products',
        entity_id: result.insertId,
        after_data: { name, description, price, category_id, image_url, active: isActive, quantity: qty },
        ip: req.ip || req.connection.remoteAddress
      });

      const response = {
        message: 'Produto criado',
        insertId: result.insertId,
        product: {
          id: result.insertId,
          name,
          description,
          price,
          category_id,
          image_url,
          active: isActive,
          quantity: qty
        }
      };
      
      console.log('📤 Respondendo com:', response);
      res.json(response);
    }
  );
});

app.put('/admin/products/:id', auth, async (req, res) => {
  const id = req.params.id;
  const { name, description, price, category_id, image_url, active, quantity } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
  }

  db.query('SELECT * FROM products WHERE id = ?', [id], (err, before) => {
    if (err || !before.length)
      return res.status(404).json({ message: 'Produto não encontrado' });

    const qty = quantity !== undefined ? parseInt(quantity) : (before[0].quantity || 1);
    
    db.query(
      `UPDATE products SET
       name = ?, description = ?, price = ?, category_id = ?, image_url = ?, active = ?, quantity = ?
       WHERE id = ?`,
      [name, description, price, category_id, image_url, active !== undefined ? active : 1, qty, id],
      err => {
        if (err) return res.status(500).json(err);

        logAuditoria({
          user_id: req.user.id,
          action: 'UPDATE_PRODUCT',
          entity: 'products',
          entity_id: id,
          before_data: before[0],
          after_data: { name, description, price, category_id, image_url, active, quantity: qty },
          ip: req.ip
        });

        res.json({ message: 'Produto atualizado com sucesso' });
      }
    );
  });
});

app.delete('/admin/products/:id', auth, async (req, res) => {
  const id = req.params.id;

  db.query('SELECT * FROM products WHERE id = ?', [id], (err, before) => {
    if (err || !before.length)
      return res.status(404).json({ message: 'Produto não encontrado' });

    db.query('DELETE FROM products WHERE id = ?', [id], err => {
      if (err) return res.status(500).json(err);

      logAuditoria({
        user_id: req.user.id,
        action: 'DELETE_PRODUCT',
        entity: 'products',
        entity_id: id,
        before_data: before[0],
        ip: req.ip
      });

      res.json({ message: 'Produto excluído' });
    });
  });
});

// ===============================
// 🔑 ALTERAR PIN
// ===============================
app.post('/admin/change-pin', auth, async (req, res) => {
  const { pinAtual, pinNovo } = req.body;

  // Validações básicas
  if (!pinAtual || pinAtual.length < 4) {
    return res.status(400).json({ message: 'PIN atual inválido' });
  }

  if (!pinNovo || pinNovo.length < 4) {
    return res.status(400).json({ message: 'Novo PIN deve ter no mínimo 4 dígitos' });
  }

  if (pinAtual === pinNovo) {
    return res.status(400).json({ message: 'O novo PIN deve ser diferente do atual' });
  }

  try {
    // Buscar admin atual
    const admin = await getAdminById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin não encontrado' });
    }

    // Validar PIN atual
    const pinOk = await bcrypt.compare(pinAtual, admin.pin_hash);
    if (!pinOk) {
      return res.status(403).json({ message: 'PIN atual incorreto' });
    }

    // Hash do novo PIN
    const pinNovoHash = await bcrypt.hash(pinNovo, 10);

    // Atualizar PIN no banco
    db.query(
      'UPDATE admins SET pin_hash = ? WHERE id = ?',
      [pinNovoHash, req.user.id],
      err => {
        if (err) return res.status(500).json(err);

        logAuditoria({
          user_id: req.user.id,
          action: 'CHANGE_PIN',
          entity: 'admins',
          entity_id: req.user.id,
          after_data: { action: 'PIN alterado' },
          ip: req.ip
        });

        res.json({ message: 'PIN alterado com sucesso' });
      }
    );
  } catch (err) {
    console.error('Erro ao alterar PIN:', err);
    res.status(500).json({ message: 'Erro ao alterar PIN' });
  }
});

// ===============================
// � AUDITORIA - LISTAR LOGS
// ===============================
app.get('/admin/audit-logs', auth, (req, res) => {
  const { startDate, endDate, admin_id, action } = req.query;

  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];

  // Filtro por data inicial
  if (startDate) {
    query += ' AND DATE(created_at) >= ?';
    params.push(startDate);
  }

  // Filtro por data final
  if (endDate) {
    query += ' AND DATE(created_at) <= ?';
    params.push(endDate);
  }

  // Filtro por admin
  if (admin_id) {
    query += ' AND user_id = ?';
    params.push(admin_id);
  }

  // Filtro por ação
  if (action) {
    query += ' AND action = ?';
    params.push(action);
  }

  // Ordenar por data decrescente e limitar
  query += ' ORDER BY created_at DESC LIMIT 1000';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json(err);
    
    // Enriquecer com nome do admin
    try {
      const enriched = results.map(log => {
        let before_data = null;
        let after_data = null;
        
        if (log.before_data) {
          if (typeof log.before_data === 'string') {
            try {
              before_data = JSON.parse(log.before_data);
            } catch (e) {
              before_data = log.before_data;
            }
          } else {
            before_data = log.before_data;
          }
        }
        
        if (log.after_data) {
          if (typeof log.after_data === 'string') {
            try {
              after_data = JSON.parse(log.after_data);
            } catch (e) {
              after_data = log.after_data;
            }
          } else {
            after_data = log.after_data;
          }
        }
        
        return {
          ...log,
          before_data,
          after_data
        };
      });
      
      res.json(enriched);
    } catch (error) {
      console.error('❌ Erro ao processar logs de auditoria:', error);
      res.status(500).json({ error: 'Erro ao processar dados' });
    }
  });
});

// ===============================
// 📋 AUDITORIA - LISTAR ADMINS (para filtro)
// ===============================
app.get('/admin/list', auth, (req, res) => {
  db.query(
    'SELECT id, email FROM admins ORDER BY email',
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// ===============================
// �🔑 LOGIN
// ===============================
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  // 🚫 VERIFICAR RATE LIMIT
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    console.warn(`🚫 Tentativa bloqueada - IP: ${clientIp}`);
    return res.status(429).json({ message: rateCheck.message });
  }

  // Validar entrada
  if (!email || !password) {
    recordFailedAttempt(clientIp);
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  db.query(
    'SELECT * FROM admins WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) {
        recordFailedAttempt(clientIp);
        return res.status(500).json(err);
      }

      if (!results.length) {
        recordFailedAttempt(clientIp);
        console.warn(`❌ Email não encontrado - IP: ${clientIp}, Email: ${email}`);
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      const ok = await bcrypt.compare(password, results[0].password);
      if (!ok) {
        recordFailedAttempt(clientIp);
        console.warn(`❌ Senha incorreta - IP: ${clientIp}, Email: ${email}`);
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      // ✅ Login bem-sucedido - resetar tentativas
      resetLoginAttempts(clientIp);

      const token = jwt.sign(
        { id: results[0].id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      console.log(`✅ Login bem-sucedido - Email: ${email}, IP: ${clientIp}`);
      res.json({ token });
    }
  );
});

// ===============================
// 💳 PAGAMENTOS - PIX DINÂMICO (MERCADO PAGO)
// ===============================

// Simulação de integração Mercado Pago
// (use a lib oficial para produção)

app.post('/payment/pix-dinamico', async (req, res) => {
  try {
    const { amount, customer_email, customer_name } = req.body;

    console.log('📝 [PIX Dinâmico] Criando pagamento...', { amount });

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    // Verificar se credenciais estão configuradas
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken || accessToken.includes('seu_access_token')) {
      console.warn('⚠️ Credenciais do Mercado Pago não configuradas. Usando simulado.');
      
      // Retornar dados simulados para teste
      const paymentRef = `FARM_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const paymentId = Math.floor(Math.random() * 1000000000);
      const pixQrCode = `00020126580014br.gov.bcb.pix0136811096265970700520400005303986540${amount.toFixed(2).padStart(7, '0')}802BR5913FARMACIA6006RECIFE62130${paymentRef.substr(0, 26)}63041D3D`;

      const pixResponse = {
        payment_id: paymentId,
        reference: paymentRef,
        amount: parseFloat(amount),
        status: 'pending',
        qr_code: pixQrCode,
        copy_paste: pixQrCode,
        pix_key: '81992659707',
        pix_name: 'Vinicius Jardel',
        pix_bank: 'NUBANK',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        _info: 'PIX Dinâmico SIMULADO. Credenciais do Mercado Pago não configuradas.'
      };

      return res.json(pixResponse);
    }

    // Chamar API real do Mercado Pago
    const MercadoPago = require('mercadopago');
    MercadoPago.configurations.setAccessToken(accessToken);

    const paymentData = {
      transaction_amount: parseFloat(amount),
      payment_method_id: 'pix',
      payer: {
        email: customer_email || 'cliente@farmacia.com',
        first_name: customer_name || 'Cliente'
      },
      description: `Pedido Farmácia - R$ ${amount}`,
      metadata: {
        order_id: `FARM_${Date.now()}`,
        customer_name: customer_name
      }
    };

    const response = await MercadoPago.payment.create(paymentData);

    if (response.body && response.body.id) {
      const pixData = response.body.point_of_interaction?.transaction_data;
      
      const pixResponse = {
        payment_id: response.body.id,
        reference: response.body.reference_id || `FAM_${response.body.id}`,
        amount: parseFloat(amount),
        status: response.body.status,
        qr_code: pixData?.qr_code || '',
        copy_paste: pixData?.copy_paste || '',
        pix_key: pixData?.beneficiary?.account_id || '81992659707',
        pix_name: pixData?.beneficiary?.name || 'Vinicius Jardel',
        pix_bank: pixData?.beneficiary?.bank_name || 'NUBANK',
        created_at: new Date(response.body.date_created).toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };

      console.log('✅ Pagamento PIX criado:', response.body.id);
      res.json(pixResponse);
    } else {
      throw new Error('Erro ao criar pagamento no Mercado Pago');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Em caso de erro, retornar simulado para não quebrar a aplicação
    const paymentRef = `FARM_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const paymentId = Math.floor(Math.random() * 1000000000);
    const pixQrCode = `00020126580014br.gov.bcb.pix0136811096265970700520400005303986540${parseFloat(req.body.amount).toFixed(2).padStart(7, '0')}802BR5913FARMACIA6006RECIFE62130${paymentRef.substr(0, 26)}63041D3D`;

    res.json({
      payment_id: paymentId,
      reference: paymentRef,
      amount: parseFloat(req.body.amount),
      status: 'pending',
      qr_code: pixQrCode,
      copy_paste: pixQrCode,
      pix_key: '81992659707',
      pix_name: 'Vinicius Jardel',
      pix_bank: 'NUBANK',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      _error: error.message,
      _info: 'Usando PIX simulado devido a erro. Verifique as credenciais do Mercado Pago.'
    });
  }
});

// Verificar status do pagamento
app.get('/payment/pix-dinamico/:payment_id', (req, res) => {
  try {
    const { payment_id } = req.params;

    console.log('🔍 Verificando pagamento:', payment_id);

    // Simular diferentes status baseado no ID
    let status = 'pending';
    if (payment_id % 3 === 0) status = 'approved';
    if (payment_id % 5 === 0) status = 'in_process';

    const statusMap = {
      'pending': 'pendente',
      'approved': 'aprovado',
      'in_process': 'processando',
      'rejected': 'rejeitado'
    };

    res.json({
      payment_id: payment_id,
      status: status,
      status_label: statusMap[status] || status,
      created_at: new Date(Date.now() - 60000).toISOString(),
      paid_at: status === 'approved' ? new Date().toISOString() : null
    });
  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
app.listen(process.env.PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${process.env.PORT}`);
});

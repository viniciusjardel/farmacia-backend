const express = require('express');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

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
// 📋 AUDITORIA HELPER
// ===============================
async function logAudit(adminId, adminEmail, action, tableName, recordId, details = null) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (admin_id, admin_email, action, table_name, record_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [adminId, adminEmail, action, tableName, recordId, details ? JSON.stringify(details) : null]
    );
    console.log(`✅ [AUDIT] ${adminEmail} - ${action} (${tableName}:${recordId})`);
  } catch (err) {
    console.error(`❌ [AUDIT ERROR] Falha ao registrar auditoria: ${err.message}`);
  }
}

// ===============================
// 🔑 LOGIN
// ===============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const [admins] = await pool.query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const admin = admins[0];
    const passwordOk = await bcrypt.compare(password, admin.password);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log(`✅ Login bem-sucedido: ${email}`);
    res.json({ token, admin: { id: admin.id, email: admin.email } });
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ===============================
// 🔐 VERIFICAR AUTENTICAÇÃO
// ===============================
router.get('/check', auth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// ===============================
// 🔐 VERIFICAR PIN
// ===============================
router.post('/verify-pin', auth, async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ message: 'PIN é obrigatório' });
    }

    const [admins] = await pool.query(
      'SELECT pin_hash FROM admins WHERE id = ?',
      [req.user.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: 'Admin não encontrado' });
    }

    const pinOk = await bcrypt.compare(pin, admins[0].pin_hash);

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
// 🔑 ALTERAR PIN
// ===============================
router.post('/change-pin', auth, async (req, res) => {
  try {
    const { pinAtual, pinNovo } = req.body;

    if (!pinAtual || pinAtual.length < 4) {
      return res.status(400).json({ message: 'PIN atual inválido' });
    }

    if (!pinNovo || pinNovo.length < 4) {
      return res.status(400).json({ message: 'Novo PIN deve ter no mínimo 4 dígitos' });
    }

    if (pinAtual === pinNovo) {
      return res.status(400).json({ message: 'O novo PIN deve ser diferente do atual' });
    }

    const [admins] = await pool.query(
      'SELECT pin_hash FROM admins WHERE id = ?',
      [req.user.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: 'Admin não encontrado' });
    }

    const pinOk = await bcrypt.compare(pinAtual, admins[0].pin_hash);
    if (!pinOk) {
      return res.status(403).json({ message: 'PIN atual incorreto' });
    }

    const pinNovoHash = await bcrypt.hash(pinNovo, 10);

    await pool.query(
      'UPDATE admins SET pin_hash = ? WHERE id = ?',
      [pinNovoHash, req.user.id]
    );

    // Registrar auditoria
    await logAudit(
      req.user.id,
      req.user.email,
      'CHANGE_PIN',
      'admins',
      req.user.id,
      null
    );

    res.json({ message: 'PIN alterado com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar PIN:', error);
    res.status(500).json({ message: 'Erro ao alterar PIN' });
  }
});

// ===============================
// 📂 PRODUTOS (ADMIN)
// ===============================
router.get('/products', auth, async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT id, name, description, price, category_id, image_url, active, quantity FROM products'
    );
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

router.post('/products', auth, async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, active, quantity } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, category_id, image_url, active, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, category_id, image_url, active || 1, quantity || 1]
    );

    const productId = result.insertId;
    
    // Registrar auditoria
    await logAudit(
      req.user.id,
      req.user.email,
      'CREATE_PRODUCT',
      'products',
      productId,
      { name, price, category_id }
    );

    res.status(201).json({
      id: productId,
      name,
      description,
      price,
      category_id,
      image_url,
      active: active || 1,
      quantity: quantity || 1
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

router.put('/products/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, image_url, active, quantity } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const [result] = await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, active = ?, quantity = ? WHERE id = ?',
      [name, description, price, category_id, image_url, active || 1, quantity || 1, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Registrar auditoria
    await logAudit(
      req.user.id,
      req.user.email,
      'UPDATE_PRODUCT',
      'products',
      id,
      { name, price, category_id }
    );

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

router.delete('/products/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Registrar auditoria
    await logAudit(
      req.user.id,
      req.user.email,
      'DELETE_PRODUCT',
      'products',
      id,
      null
    );

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

// ===============================
// 📁 UPLOAD DE IMAGEM
// ===============================
const uploadsDir = path.join(__dirname, '../../../frontend/uploads');

console.log('🔧 [MULTER SETUP] Verificando diretório de uploads...');
console.log(`  - __dirname: ${__dirname}`);
console.log(`  - Path calculado: ${uploadsDir}`);
console.log(`  - Existe? ${fs.existsSync(uploadsDir) ? '✅' : '❌'}`);

if (!fs.existsSync(uploadsDir)) {
  console.log('  - Criando diretório...');
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('  - ✅ Diretório criado com sucesso');
  } catch (err) {
    console.log(`  - ❌ ERRO ao criar diretório: ${err.message}`);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('\n🟢 [STORAGE-DEST] destination() chamado');
    console.log(`  - Arquivo: ${file.originalname}`);
    console.log(`  - Destino: ${uploadsDir}`);
    console.log(`  - Existe? ${fs.existsSync(uploadsDir) ? '✅' : '❌'}`);
    
    // Garantir que o diretório existe
    if (!fs.existsSync(uploadsDir)) {
      console.log(`  - Criando diretório...`);
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`  - ✅ Diretório criado`);
      } catch (mkdirErr) {
        console.log(`  - ❌ ERRO ao criar dir: ${mkdirErr.message}`);
        return cb(mkdirErr);
      }
    }
    
    console.log(`  - ✅ Chamando cb(null, '${uploadsDir}')`);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    console.log('🟢 [STORAGE-FILE] filename() chamado');
    console.log(`  - Arquivo original: ${file.originalname}`);
    
    try {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname) || '.jpg';
      const name = path.basename(file.originalname, ext);
      const filename = `${name}_${timestamp}${ext}`;
      console.log(`  - Filename gerado: ${filename}`);
      console.log(`  - ✅ Chamando cb(null, '${filename}')`);
      cb(null, filename);
    } catch (err) {
      console.log(`  - ❌ ERRO em filename(): ${err.message}`);
      cb(err);
    }
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log(`\n🟡 [FILEFILTER] Verificando arquivo: ${file.originalname}`);
    console.log(`  - Mimetype: ${file.mimetype}`);
    
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowed = allowedMimes.includes(file.mimetype);
    console.log(`  - Permitido? ${allowed ? '✅' : '❌'}`);
    
    if (allowed) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPEG, PNG, GIF e WebP são permitidas'));
    }
  }
});

// Aplicar upload como middleware ANTES do handler
router.post('/upload', (req, res, next) => {
  console.log('\n═══════════════════════════════════════');
  console.log('🔷 [UPLOAD ROTA] POST /admin/upload recebido');
  console.log('═══════════════════════════════════════');
  console.log('📊 Headers completos:');
  Object.entries(req.headers).forEach(([key, val]) => {
    console.log(`  - ${key}: ${val.substring ? val.substring(0, 100) : val}`);
  });
  console.log(`\n📦 req.body: ${JSON.stringify(req.body)}`);
  console.log(`📄 req.file ANTES de multer: ${req.file}`);
  console.log(`📁 req.files ANTES de multer: ${req.files}`);
  console.log('\nChamando multer.single("image")...\n');
  
  // Chamar multer aqui
  upload.single('image')(req, res, (err) => {
    console.log('\n═══════════════════════════════════════');
    console.log('🔶 [MULTER CALLBACK] Multer terminou');
    console.log('═══════════════════════════════════════');
    
    if (err) {
      console.log(`❌ Erro do multer: ${err.message}`);
      return res.status(400).json({ message: `Erro de upload: ${err.message}` });
    }

    console.log(`📄 req.file APÓS multer:`, req.file ? `✅ ${JSON.stringify({
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    })}` : '❌ undefined');
    
    // Verificar autenticação APÓS o multer ter processado
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      console.log('❌ [AUTH] Token não enviado');
      return res.status(401).json({ message: 'Token não enviado' });
    }

    console.log('✅ [AUTH] Token presente no header');
    const token = header.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ [AUTH] Token válido');
    } catch (e) {
      console.log(`❌ [AUTH] Token inválido: ${e.message}`);
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    if (!req.file) {
      console.log('❌ [FILE] req.file é UNDEFINED!');
      console.log('📊 [DEBUG] Estado da requisição:');
      console.log(`  - req.body: ${JSON.stringify(req.body)}`);
      console.log(`  - req.files: ${req.files}`);
      console.log(`  - req.file: ${req.file}`);
      console.log(`  - Content-Type: ${req.headers['content-type']}`);
      return res.status(400).json({ message: 'Nenhuma imagem foi enviada' });
    }

    console.log(`✅ [FILE] Arquivo recebido: ${req.file.originalname}`);
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log(`✅ [SUCCESS] Upload completo. URL: ${imageUrl}`);
    console.log('═══════════════════════════════════════\n');
    res.json({ url: imageUrl, filename: req.file.filename });
  });
});

// ===============================
// 👤 ADMINS (para listagem)
// ===============================
router.get('/admins', auth, async (req, res) => {
  try {
    const [admins] = await pool.query(
      'SELECT id, email, active FROM admins'
    );
    res.json(admins);
  } catch (error) {
    console.error('Erro ao listar admins:', error);
    res.status(500).json({ error: 'Erro ao listar admins' });
  }
});

// ===============================
// 📋 AUDITORIA
// ===============================
router.get('/audit-logs', auth, async (req, res) => {
  try {
    const { startDate, endDate, adminEmail, action, search } = req.query;
    
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

    // Filtro por email do admin
    if (adminEmail && adminEmail.trim()) {
      query += ' AND admin_email LIKE ?';
      params.push(`%${adminEmail}%`);
    }

    // Filtro por ação
    if (action && action.trim()) {
      query += ' AND action = ?';
      params.push(action);
    }

    // Busca geral (procura em todos os campos)
    if (search && search.trim()) {
      query += ' AND (admin_email LIKE ? OR action LIKE ? OR table_name LIKE ? OR record_id LIKE ? OR details LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT 500';

    console.log('🔍 [AUDIT-LOGS] Query:', query);
    console.log('📊 [AUDIT-LOGS] Params:', params);

    const [logs] = await pool.query(query, params);

    console.log(`✅ [AUDIT-LOGS] ${logs.length} registros encontrados`);
    res.json(logs);
  } catch (error) {
    console.error('❌ Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

module.exports = router;

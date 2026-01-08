require(`dotenv`).config();

console.log(` BACKEND INICIADO `);

const express = require(`express`);
const cors = require(`cors`);
const path = require(`path`);
const fs = require(`fs`);
const jwt = require(`jsonwebtoken`);
const bcrypt = require(`bcrypt`);
const pool = require(`./src/config/database`);

const app = express();

// Middlewares
app.use(cors());

// Log de requisições
app.use((req, res, next) => {
  if (req.path.includes('/admin/upload')) {
    console.log(`\n🔷 [MIDDLEWARE] Requisição recebida`);
    console.log(`  - Path: ${req.path}`);
    console.log(`  - Method: ${req.method}`);
    console.log(`  - Content-Type: ${req.headers['content-type']}`);
  }
  next();
});

// Parser JSON - express.json() automaticamente ignora multipart/form-data
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ===============================
// ROTAS
// ===============================
const productsRoutes = require(`./src/routes/products.routes`);
const categoriesRoutes = require(`./src/routes/categories.routes`);
const paymentRoutes = require(`./src/routes/payment.routes`);
const adminRoutes = require(`./src/routes/admin.routes`);

app.use(`/products`, productsRoutes);
app.use(`/categories`, categoriesRoutes);
app.use(`/payment`, paymentRoutes);
app.use(`/admin`, adminRoutes);

// Rota de login pública
app.post(`/login`, async (req, res) => {
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

// Servir arquivos estáticos do frontend DEPOIS das rotas da API
const frontendDir = path.join(__dirname, `..`, `frontend`);
app.use(express.static(frontendDir));

// Servir index.html para rotas não encontradas (SPA) - apenas para requisições HTML
app.use((req, res) => {
  // Se é uma requisição de API não encontrada, retornar 404 JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Rota API não encontrada' });
  }
  
  // Para outras rotas, servir index.html (SPA)
  const indexPath = path.join(frontendDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('❌ Erro ao enviar index.html:', err);
        res.status(500).json({ error: 'Erro ao carregar página' });
      }
    });
  } else {
    res.status(404).json({ error: 'Página não encontrada' });
  }
});

// ===============================
// INICIAR SERVIDOR
// ===============================
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(` Backend rodando em http://localhost:` + PORT);
  console.log(` Frontend: ` + frontendDir);
  console.log(` Banco: ` + process.env.DB_HOST + `:` + process.env.DB_PORT + `/` + process.env.DB_NAME);
});

// Tratamento de erros global
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Manter o servidor rodando
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

module.exports = app;

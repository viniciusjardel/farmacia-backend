# 🗄️ PLANETSCALE: Banco de Dados MySQL 100% Gratuito

## PASSO 1: Registre-se no PlanetScale

1. Acesse: https://planetscale.com/sign-up
2. Clique em **"Continue with GitHub"**
3. Autorize PlanetScale a acessar seu GitHub
4. Complete o perfil básico

---

## PASSO 2: Criar Banco de Dados

### 2.1 Na dashboard do PlanetScale

1. Clique em **"Create a new database"**
2. Preencha:
   - **Database name:** `farmacia_db`
   - **Plan:** Selecione **"Free"** (100% gratuito)
   - **Region:** Escolha mais próximo (ex: São Paulo/Brasil)
   - **Username:** Deixe padrão ou personalize
3. Clique **"Create database"**

### 2.2 Aguarde criação (2-3 minutos)

Você verá uma tela azul "We're setting things up..."

---

## PASSO 3: Obter Credenciais de Conexão

### 3.1 Quando ficar pronto, clique em **"Connect"**

Será mostrado um menu com opções:
- Chakra
- Drizzle
- Kysely
- Knex.js
- Sequelize
- Prisma
- **Node.js** ← Escolha esta

### 3.2 Copie a CONNECTION STRING

Você verá algo assim:
```
mysql://username:password@aws.connect.psdb.cloud/farmacia_db?sslaccept=strict
```

**Salve em um lugar seguro! Você precisará delas.**

---

## PASSO 4: Criar as Tabelas

### 4.1 Clique em **"Console"** (lado esquerdo da interface)

Abre um terminal SQL no navegador.

### 4.2 Cole e execute o SQL abaixo:

```sql
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    total_amount DECIMAL(10, 2),
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('pix', 'money') DEFAULT 'pix',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Tabela de pagamentos PIX
CREATE TABLE IF NOT EXISTS pix_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2),
    status ENUM('pending', 'paid', 'failed', 'expired') DEFAULT 'pending',
    qr_code LONGTEXT,
    mercado_pago_id VARCHAR(255),
    order_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### 4.3 Clique em **"Execute"** ou Ctrl+Enter

Deve aparecer: **"Query executed successfully"** ✅

---

## PASSO 5: Atualizar .env do Backend

### 5.1 Abra o arquivo `backend/.env`

Encontre ou crie estas variáveis:

```env
# PlanetScale MySQL
DB_HOST=aws.connect.psdb.cloud
DB_USER=USERNAME_DO_PLANETSCALE
DB_PASSWORD=PASSWORD_DO_PLANETSCALE
DB_NAME=farmacia_db
```

Substitua `USERNAME` e `PASSWORD` pelos valores da connection string!

### 5.2 Exemplo (não use, é só exemplo):

Se sua connection string é:
```
mysql://jarde_user:abc123xyz@aws.connect.psdb.cloud/farmacia_db?sslaccept=strict
```

Então seus .env seria:
```env
DB_HOST=aws.connect.psdb.cloud
DB_USER=jarde_user
DB_PASSWORD=abc123xyz
DB_NAME=farmacia_db
```

---

## PASSO 6: Testar Conexão Localmente (Opcional)

### 6.1 No PowerShell, na pasta backend:

```powershell
# Instalar mysql2 se ainda não tiver
npm install mysql2

# Testar conexão
node -e "
const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'aws.connect.psdb.cloud',
            user: 'SEU_USERNAME',
            password: 'SUA_PASSWORD',
            database: 'farmacia_db',
            ssl: 'Amazon RDS',
            waitForConnections: true
        });
        console.log('✅ Conectado ao PlanetScale!');
        await conn.end();
    } catch (err) {
        console.error('❌ Erro:', err.message);
    }
})();
"
```

Se mostrar **"✅ Conectado ao PlanetScale!"**, deu tudo certo!

---

## ✅ Checklist

- [ ] Conta criada no PlanetScale
- [ ] Banco `farmacia_db` criado (Plan: Free)
- [ ] Credenciais copiadas com segurança
- [ ] Tabelas criadas no Console SQL
- [ ] `.env` atualizado com credenciais
- [ ] Conexão testada (opcional)

---

## 📌 Próximo Passo: Deploy no Render

Quando terminar aqui, avise que está pronto para fazer o **passo 2 (Render)** 🚀

# 🚀 Rodar Projeto Localmente

## ✅ Pré-requisitos

### 1. MySQL instalado
- Baixe em: https://dev.mysql.com/downloads/mysql/
- Ou use: `choco install mysql` (se tiver Chocolatey)

### 2. Node.js instalado
- Mínimo: v16
- Baixe em: https://nodejs.org/

---

## 📋 Passo 1: Criar o Banco de Dados

### Windows PowerShell (como Administrador)

```powershell
# Conectar ao MySQL
mysql -u root -p

# Dentro do MySQL, digite:
CREATE DATABASE farmacia;
USE farmacia;
```

Se não tiver senha:
```powershell
mysql -u root
```

---

## 📦 Passo 2: Instalar Dependências

### Terminal PowerShell - Pasta Backend

```powershell
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Projeto Final  para deploy\backend"

# Instalar dependências
npm install
```

### Terminal PowerShell - Pasta Frontend

```powershell
# Abrir outro PowerShell

cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Projeto Final  para deploy\frontend"

# Se não tiver package.json, não precisa instalar
```

---

## 🚀 Passo 3: Rodar o Sistema

### Terminal 1 - Backend

```powershell
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Projeto Final  para deploy\backend"

# Iniciar backend
npm start
```

Você vai ver:
```
🔥 BACKEND INICIADO 🔥
✅ MySQL conectado
🚀 Backend rodando em http://localhost:3000
```

### Terminal 2 - Frontend

```powershell
cd "c:\Users\jarde\OneDrive\Desktop\Farmácia - Projeto Final  para deploy\frontend"

# Abrir com Live Server ou http-server
# Opção 1: Se tiver VS Code
# Clique com botão direito em index.html → Open with Live Server

# Opção 2: Com http-server
npm install -g http-server
http-server -p 8080

# Opção 3: Abrir direto no navegador
# C:\Users\jarde\OneDrive\Desktop\Farmácia - Projeto Final  para deploy\frontend\index.html
```

---

## 🧪 Testar

Abra no navegador:
```
http://localhost:3000
```

Ou se tiver Live Server:
```
http://127.0.0.1:5500
```

---

## 🔧 Configuração MySQL Alternativa

Se seu MySQL tiver **senha diferente**, edite o arquivo:

```
backend/.env
```

Altere:
```
DB_PASSWORD=sua_senha_mysql
```

---

## ❌ Erro: "Access denied for user 'root'"

Execute no PowerShell (como Administrador):
```powershell
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '';"
```

Isso remove a senha do root.

---

## ❌ Erro: "Cannot find module 'mysql2'"

No terminal do backend:
```powershell
npm install
```

---

## 📝 Estrutura de Pastas

```
Farmácia - Projeto Final para deploy/
├── backend/
│   ├── .env (MySQL local)
│   ├── index.js
│   ├── package.json
│   └── src/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
```

---

## ✨ Tudo Pronto!

Seu sistema está rodando **100% localmente** em MySQL! 🎉

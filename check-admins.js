require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAdmins() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [admins] = await connection.query('SELECT id, email FROM admins LIMIT 10');
    
    if (admins.length === 0) {
      console.log('❌ Nenhum admin encontrado!');
    } else {
      console.log('✅ Admins encontrados:');
      admins.forEach(admin => {
        console.log(`  - ID: ${admin.id}, Email: ${admin.email}`);
      });
    }

    await connection.end();
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

checkAdmins();

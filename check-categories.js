require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkCategories() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [categories] = await connection.query('SELECT * FROM categories LIMIT 5');
    
    if (categories.length === 0) {
      console.log('❌ Nenhuma categoria encontrada! Criando uma...');
      const [result] = await connection.query(
        'INSERT INTO categories (name) VALUES (?)',
        ['Teste']
      );
      console.log(`✅ Categoria criada com ID: ${result.insertId}`);
    } else {
      console.log('✅ Categorias encontradas:');
      categories.forEach(cat => {
        console.log(`  - ID: ${cat.id}, Nome: ${cat.name}`);
      });
    }

    await connection.end();
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

checkCategories();

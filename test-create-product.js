require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTestProduct() {
  console.log('🧪 Criando produto de teste para disparar logAudit...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Inserir produto de teste
    const productData = {
      name: 'Teste Auditoria Corrigido',
      description: 'Produto criado para testar logAudit com colunas corretas',
      price: 99.99,
      category_id: 5,
      image_url: 'https://via.placeholder.com/300',
      active: 1,
      quantity: 5
    };

    console.log('📤 Inserindo produto:');
    console.log(`  - Nome: ${productData.name}`);
    console.log(`  - Preço: R$ ${productData.price}`);

    const [result] = await connection.query(
      'INSERT INTO products (name, description, price, category_id, image_url, active, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [productData.name, productData.description, productData.price, productData.category_id, productData.image_url, productData.active, productData.quantity]
    );

    const productId = result.insertId;
    console.log(`✅ Produto criado com ID: ${productId}`);

    // Agora vamos chamar logAudit manualmente para simular o que deveria acontecer
    console.log('\n📋 Registrando auditoria...');
    
    const beforeData = null;
    const afterData = JSON.stringify(productData);
    const userId = 2; // ID do admin encontrado
    
    const [auditResult] = await connection.query(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, before_data, after_data, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, 'CREATE_PRODUCT', 'products', productId, beforeData, afterData]
    );

    console.log(`✅ Auditoria registrada com ID: ${auditResult.insertId}`);

    // Verificar registros
    console.log('\n📊 Verificando registros na auditoria...');
    const [audits] = await connection.query('SELECT COUNT(*) as total FROM audit_logs');
    console.log(`Total na tabela: ${audits[0].total} registros`);

    const [lastRecord] = await connection.query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1`
    );

    if (lastRecord.length > 0) {
      const record = lastRecord[0];
      console.log(`\n✅ Último registro:`);
      console.log(`  - ID: ${record.id}`);
      console.log(`  - Action: ${record.action}`);
      console.log(`  - Entity: ${record.entity}`);
      console.log(`  - Entity ID: ${record.entity_id}`);
      console.log(`  - User ID: ${record.user_id}`);
      console.log(`  - Created At: ${record.created_at}`);
    }

    await connection.end();
    console.log('\n✅ Teste concluído!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

createTestProduct();

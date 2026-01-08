require('dotenv').config();
const mysql = require('mysql2/promise');
const http = require('http');

async function testCategoryAudit() {
  console.log('🧪 Teste: Criar categoria e verificar auditoria...\n');
  
  try {
    // 1. Verificar auditoria ANTES
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [countBefore] = await connection.query('SELECT COUNT(*) as total FROM audit_logs WHERE action = "CREATE_CATEGORY"');
    const beforeCount = countBefore[0].total;
    console.log(`📊 Categorias criadas (antes): ${beforeCount}`);
    
    // 2. Criar categoria via INSERT direto
    console.log('\n📤 Criando categoria "Teste Auditoria Categorias ' + Date.now() + '"...');
    const categoryName = 'Teste Auditoria Categorias ' + Date.now();
    const [result] = await connection.query(
      'INSERT INTO categories (name, description, active) VALUES (?, ?, 1)',
      [categoryName, 'Categoria para testar logAudit']
    );

    const categoryId = result.insertId;
    console.log(`✅ Categoria criada com ID: ${categoryId}`);

    // 3. Registrar auditoria manualmente (simular o que deveria acontecer)
    const [auditResult] = await connection.query(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, before_data, after_data, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [
        2,
        'CREATE_CATEGORY',
        'categories',
        categoryId,
        null,
        JSON.stringify({ name: categoryName, description: 'Categoria para testar logAudit' })
      ]
    );

    console.log(`✅ Auditoria registrada com ID: ${auditResult.insertId}`);

    // 4. Verificar auditoria DEPOIS
    const [countAfter] = await connection.query(
      'SELECT COUNT(*) as total FROM audit_logs WHERE action = "CREATE_CATEGORY"'
    );
    const afterCount = countAfter[0].total;
    console.log(`\n📊 Categorias criadas (depois): ${afterCount}`);
    console.log(`   Diferença: ${afterCount - beforeCount} nova(s) categoria(s)`);

    // 5. Listar últimos registros de categoria
    const [latestAudits] = await connection.query(
      `SELECT id, action, entity, entity_id, after_data, created_at FROM audit_logs 
       WHERE action LIKE '%CATEGORY' 
       ORDER BY created_at DESC 
       LIMIT 3`
    );

    if (latestAudits.length > 0) {
      console.log(`\n✅ Últimos registros de categoria:`);
      latestAudits.forEach((audit, idx) => {
        console.log(`\n${idx + 1}. ${audit.action} - ${audit.entity} #${audit.entity_id}`);
        console.log(`   ID Auditoria: ${audit.id}`);
        if (audit.after_data) {
          try {
            const data = typeof audit.after_data === 'string' ? JSON.parse(audit.after_data) : audit.after_data;
            console.log(`   Dados: ${data.name || JSON.stringify(data)}`);
          } catch (e) {
            console.log(`   Dados: ${audit.after_data}`);
          }
        }
      });
    }

    await connection.end();
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

testCategoryAudit();

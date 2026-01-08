require('dotenv').config();
const mysql = require('mysql2/promise');
const http = require('http');

async function testLogAuditViaAPI() {
  console.log('🧪 Testando logAudit via API (Como se fosse uma requisição HTTP real)...\n');
  
  try {
    // Primeiro, vamos contar os registros ANTES
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [countBefore] = await connection.query('SELECT COUNT(*) as total FROM audit_logs');
    const beforeCount = countBefore[0].total;
    console.log(`📊 Registros de auditoria ANTES: ${beforeCount}`);
    
    await connection.end();

    // Agora fazer requisição POST para criar um produto
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBmYXJtYWNpYS5jb20ifQ.XwzM8j8i8h8I0JD_example';
    // Usar o token real seria melhor, mas vamos fazer de uma forma mais simples

    console.log('\n📤 Criando produto via requisição HTTP...');
    
    const productPayload = {
      name: 'Produto via API Test',
      description: 'Produto criado para testar logAudit via API',
      price: 49.99,
      category_id: 5,
      image_url: 'https://via.placeholder.com/300',
      quantity: 3,
      active: 1
    };

    const postData = JSON.stringify(productPayload);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/admin/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBmYXJtYWNpYS5jb20ifQ.XwzM8j8i8h8I0JD_wrong`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', async () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📥 Resposta: ${data.substring(0, 200)}...`);

        // Agora vamos contar os registros DEPOIS
        const connection2 = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME
        });

        const [countAfter] = await connection2.query('SELECT COUNT(*) as total FROM audit_logs');
        const afterCount = countAfter[0].total;
        console.log(`\n📊 Registros de auditoria DEPOIS: ${afterCount}`);
        console.log(`   Diferença: ${afterCount - beforeCount} novo(s) registro(s)`);

        if (afterCount > beforeCount) {
          console.log('✅ logAudit FUNCIONANDO! Novos registros foram criados!');
          
          const [latestRecords] = await connection2.query(
            `SELECT id, action, entity, entity_id, created_at FROM audit_logs ORDER BY id DESC LIMIT 1`
          );
          
          if (latestRecords.length > 0) {
            const record = latestRecords[0];
            console.log(`\n✅ Último registro criado:`);
            console.log(`  - Action: ${record.action}`);
            console.log(`  - Entity: ${record.entity}`);
            console.log(`  - Entity ID: ${record.entity_id}`);
          }
        } else {
          console.log('❌ logAudit NÃO funcionou. Nenhum novo registro foi criado.');
          console.log('   (Isto pode ser porque a requisição falhou por autenticação)');
        }

        await connection2.end();
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Erro na requisição: ${e.message}`);
    });

    req.write(postData);
    req.end();

  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

// Esperar um pouco para garantir que o servidor está rodando
setTimeout(testLogAuditViaAPI, 1000);

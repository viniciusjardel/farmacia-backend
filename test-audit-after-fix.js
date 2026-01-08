require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAudit() {
  console.log('🔍 Verificando auditoria após correção do logAudit...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Contar registros
    const [countResult] = await connection.query('SELECT COUNT(*) as total FROM audit_logs');
    const totalRecords = countResult[0].total;
    console.log(`📊 Total de registros na auditoria: ${totalRecords}`);

    if (totalRecords > 0) {
      console.log('\n📋 Últimos registros:');
      const [records] = await connection.query(
        `SELECT 
          id, 
          user_id, 
          action, 
          entity, 
          entity_id, 
          before_data, 
          after_data, 
          created_at 
         FROM audit_logs 
         ORDER BY created_at DESC 
         LIMIT 5`
      );

      records.forEach((record, idx) => {
        console.log(`\n${idx + 1}. ${record.action} - ${record.entity} #${record.entity_id}`);
        console.log(`   User ID: ${record.user_id}`);
        console.log(`   Data/Hora: ${record.created_at}`);
        if (record.after_data) {
          console.log(`   Dados: ${JSON.stringify(record.after_data)}`);
        }
      });
    } else {
      console.log('❌ Nenhum registro encontrado! logAudit ainda não está funcionando.');
    }

    await connection.end();
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

checkAudit();

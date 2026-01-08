const pool = require('./src/config/database');

(async () => {
  try {
    console.log('🔍 Verificando tabela audit_logs...\n');
    
    const [count] = await pool.query('SELECT COUNT(*) as total FROM audit_logs');
    console.log('📊 Total de registros:', count[0].total);
    
    if (count[0].total > 0) {
      console.log('\n📋 Últimos 5 registros:');
      const [logs] = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5');
      logs.forEach(log => {
        console.log(`
  - Admin: ${log.admin_email}
    Ação: ${log.action}
    Data: ${log.created_at}
    Tabela: ${log.table_name}`);
      });
    } else {
      console.log('⚠️ Nenhum registro de auditoria encontrado!');
      console.log('\n💡 Possível solução: executar algumas ações no painel (criar/editar produtos) para gerar registros');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();

const pool = require('./src/config/database');

(async () => {
  try {
    console.log('🔍 Verificando estrutura da tabela audit_logs...\n');
    
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'audit_logs' AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (columns.length === 0) {
      console.log('❌ Tabela audit_logs não encontrada!');
      process.exit(1);
    }
    
    console.log('✅ Colunas da tabela:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULLABLE' : 'NOT NULL'})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();

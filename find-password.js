#!/usr/bin/env node

/**
 * 🔍 Script para Descobrir a Senha do MySQL
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const passwords = [
  '',  // sem senha
  'victorguto1540',
  'admin123',
  'password',
  'root',
  '123456'
];

async function testPassword(password) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: password,
      port: 3306,
      connectTimeout: 3000
    });
    
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

async function findPassword() {
  console.log('🔍 Testando senhas do MySQL...\n');
  
  for (const pwd of passwords) {
    const display = pwd === '' ? '(sem senha)' : pwd;
    process.stdout.write(`Testando "${display}"... `);
    
    const success = await testPassword(pwd);
    
    if (success) {
      console.log('✅ ENCONTRADA!');
      console.log(`\n🎯 Senha do MySQL: "${pwd}"\n`);
      return pwd;
    } else {
      console.log('❌');
    }
  }
  
  console.log('❌ Nenhuma senha funcionou!');
  return null;
}

findPassword().then(pwd => {
  if (pwd !== null) {
    console.log('Atualize o .env com:');
    console.log(`DB_PASSWORD=${pwd}`);
    process.exit(0);
  } else {
    process.exit(1);
  }
});

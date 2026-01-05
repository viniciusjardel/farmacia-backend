const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'farmacia',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Wrapper para compatibilidade
const wrappedPool = {
  async query(sql, params = []) {
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.execute(sql, params);
      connection.release();
      return [rows, fields];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  
  async execute(sql, params = []) {
    return this.query(sql, params);
  },
  
  async getConnection() {
    const connection = await pool.getConnection();
    return {
      query: (sql, params) => connection.execute(sql, params),
      execute: (sql, params) => connection.execute(sql, params),
      release: () => connection.release(),
      end: () => connection.release()
    };
  },
  
  async end() {
    await pool.end();
  }
};

module.exports = wrappedPool;

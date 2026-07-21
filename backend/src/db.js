const mysql = require('mysql2/promise');
const dns   = require('dns');
require('dotenv').config();

// Force Google DNS — bypasses ISP/router DNS that may block aivencloud.com
dns.setServers(['8.8.8.8', '1.1.1.1']);

let poolConfig;

if (process.env.DATABASE_URL) {
  // Parse the DATABASE_URL manually so we can force SSL on
  // (mysql2 doesn't read ?ssl-mode=REQUIRED from the URI)
  const url = new URL(process.env.DATABASE_URL.replace('?ssl-mode=REQUIRED', ''));

  poolConfig = {
    host:     url.hostname,
    port:     parseInt(url.port) || 3306,
    user:     url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    ssl: {
      rejectUnauthorized: false, // Aiven uses a custom CA — disable strict verification
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
} else {
  // Local XAMPP — no SSL needed
  poolConfig = {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'booksdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

const pool = mysql.createPool(poolConfig);

pool.getConnection()
  .then((conn) => {
    console.log('✓ Database connected');
    conn.release();
  })
  .catch((err) => {
    console.error('✗ Database connection failed:', err.message);
  });

module.exports = pool;

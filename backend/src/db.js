const mysql = require('mysql2/promise');
require('dotenv').config();

let poolConfig;

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL.replace('?ssl-mode=REQUIRED', ''));
  poolConfig = {
    host:             url.hostname,
    port:             parseInt(url.port) || 3306,
    user:             url.username,
    password:         url.password,
    database:         url.pathname.replace('/', ''),
    ssl:              { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit:  5,   // lower limit for serverless
    queueLimit:       0,
  };
} else {
  poolConfig = {
    host:             process.env.DB_HOST     || 'localhost',
    port:             parseInt(process.env.DB_PORT) || 3306,
    user:             process.env.DB_USER     || 'root',
    password:         process.env.DB_PASSWORD || '',
    database:         process.env.DB_NAME     || 'booksdb',
    waitForConnections: true,
    connectionLimit:  10,
    queueLimit:       0,
  };
}

// Create pool lazily — do NOT call getConnection() at module load time
// Vercel serverless functions boot cold and a failed connection would crash the function
const pool = mysql.createPool(poolConfig);

module.exports = pool;

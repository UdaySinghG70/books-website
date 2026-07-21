// Run: node database/create_tables.js
// Creates all tables on the connected MySQL database (Aiven or local).

require('dotenv').config();
const mysql = require('mysql2/promise');
const dns   = require('dns');

// Force Google DNS — bypasses ISP/router DNS that may block aivencloud.com
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function run() {
  let config;

  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL.replace('?ssl-mode=REQUIRED', ''));
    config = {
      host:               url.hostname,
      port:               parseInt(url.port) || 3306,
      user:               url.username,
      password:           url.password,
      database:           url.pathname.replace('/', ''),
      ssl:                { rejectUnauthorized: false },
      multipleStatements: true,
    };
  } else {
    config = {
      host:               process.env.DB_HOST     || 'localhost',
      port:               parseInt(process.env.DB_PORT) || 3306,
      user:               process.env.DB_USER     || 'root',
      password:           process.env.DB_PASSWORD || '',
      database:           process.env.DB_NAME     || 'booksdb',
      multipleStatements: true,
    };
  }

  console.log(`Connecting to ${config.host}:${config.port} / ${config.database} ...`);
  const db = await mysql.createConnection(config);
  console.log('Connected.');

  await db.query(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\`         INT          NOT NULL AUTO_INCREMENT,
      \`name\`       VARCHAR(191) NOT NULL,
      \`email\`      VARCHAR(191) NOT NULL,
      \`password\`   VARCHAR(191) NOT NULL,
      \`role\`       ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
      \`created_at\` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`users_email_unique\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ users');

  await db.query(`
    CREATE TABLE IF NOT EXISTS \`categories\` (
      \`id\`        INT          NOT NULL AUTO_INCREMENT,
      \`name\`      VARCHAR(191) NOT NULL,
      \`level\`     TINYINT      NOT NULL,
      \`parent_id\` INT          NULL DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`categories_parent_id_idx\` (\`parent_id\`),
      CONSTRAINT \`categories_parent_fk\`
        FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\` (\`id\`)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ categories');

  await db.query(`
    CREATE TABLE IF NOT EXISTS \`books\` (
      \`id\`          INT          NOT NULL AUTO_INCREMENT,
      \`title\`       VARCHAR(191) NOT NULL,
      \`author\`      VARCHAR(191) NOT NULL,
      \`description\` TEXT         NULL,
      \`cover_image\` VARCHAR(512) NULL,
      \`category_id\` INT          NULL DEFAULT NULL,
      \`created_at\`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`books_category_id_idx\` (\`category_id\`),
      CONSTRAINT \`books_category_fk\`
        FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`)
        ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ books');

  await db.query(`
    CREATE TABLE IF NOT EXISTS \`favorites\` (
      \`id\`         INT      NOT NULL AUTO_INCREMENT,
      \`user_id\`    INT      NOT NULL,
      \`book_id\`    INT      NOT NULL,
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`favorites_user_book_unique\` (\`user_id\`, \`book_id\`),
      KEY \`favorites_book_id_idx\` (\`book_id\`),
      CONSTRAINT \`favorites_user_fk\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`favorites_book_fk\`
        FOREIGN KEY (\`book_id\`) REFERENCES \`books\` (\`id\`)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ favorites');

  await db.end();
  console.log('\n✓ All 4 tables created successfully!');
}

run().catch((err) => { console.error('Error:', err.message); process.exit(1); });

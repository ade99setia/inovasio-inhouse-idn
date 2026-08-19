require('dotenv').config();

const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

// Test database connection before starting
db.getConnection()
  .then(conn => {
    console.log('[DB] MySQL connected successfully.');
    conn.release();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   Inhouse Training - Order Management API v2    ║
  ╠══════════════════════════════════════════════════╣
  ║  Status  : Running                              ║
  ║  Port    : ${String(PORT).padEnd(5)}                            ║
  ║  Env     : ${(process.env.NODE_ENV || 'development').padEnd(15)}              ║
  ║  Health  : http://localhost:${PORT}/api/v1/health  ║
  ╚══════════════════════════════════════════════════╝
      `);
    });
  })
  .catch(err => {
    console.error('[DB] MySQL connection failed:', err.message);
    process.exit(1);
  });

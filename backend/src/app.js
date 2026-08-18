require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (development) ──────────────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── Health Check ───────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS status');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: rows[0].status === 1 ? 'connected' : 'error',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      message: error.message
    });
  }
});

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ─── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// ─── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ─── Start Server ───────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   Inhouse Training - Order Management API   ║
  ╠══════════════════════════════════════════════╣
  ║  Status  : Running                          ║
  ║  Port    : ${PORT}                             ║
  ║  Env     : ${(process.env.NODE_ENV || 'development').padEnd(15)}          ║
  ║  Health  : http://localhost:${PORT}/api/health  ║
  ╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;

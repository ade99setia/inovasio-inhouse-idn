const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ─── Security Middleware ────────────────────────────────────
app.use(helmet());
app.use(cors());

// ─── Rate Limiting ──────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    error: { code: 'RATE_LIMIT_EXCEEDED' }
  }
});
app.use('/api', limiter);

// ─── Body Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Request Logger (development) ──────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─── Health Check ───────────────────────────────────────────
app.get('/api/v1/health', async (req, res) => {
  const db = require('./config/database');
  try {
    const [rows] = await db.query('SELECT 1 AS status');
    res.json({
      success: true,
      message: 'Server is running.',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: rows[0].status === 1 ? 'connected' : 'error',
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable.',
      error: { code: 'SERVICE_UNAVAILABLE' }
    });
  }
});

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);

// ─── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found.`,
    error: { code: 'NOT_FOUND' }
  });
});

// ─── Centralized Error Handler ──────────────────────────────
app.use(errorHandler);

module.exports = app;

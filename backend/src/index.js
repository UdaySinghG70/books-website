const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes      = require('./routes/auth.routes');
const bookRoutes      = require('./routes/book.routes');
const categoryRoutes  = require('./routes/category.routes');
const favoriteRoutes  = require('./routes/favorite.routes');
const reportRoutes    = require('./routes/report.routes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// CLIENT_URL can be a single origin or a comma-separated list.
// e.g.  CLIENT_URL=https://my-books.vercel.app
// e.g.  CLIENT_URL=https://my-books.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ────────────────────────────────────────────────────────────
// NOTE: on Vercel/Railway the filesystem is ephemeral.
// Uploaded covers will not persist between deploys.
// For production, replace Multer with a cloud storage solution (e.g. Cloudinary).
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/books',      bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/favorites',  favoriteRoutes);
app.use('/api/reports',    reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Books API is running' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

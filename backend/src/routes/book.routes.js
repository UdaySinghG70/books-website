const express = require('express');
const router = express.Router();
const { getBooks, getBook, createBook, updateBook, deleteBook } = require('../controllers/book.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../utils/multer');

// Optional auth middleware - attaches user if token present but doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      // ignore invalid token for public route
    }
  }
  next();
};

router.get('/', getBooks);
router.get('/:id', optionalAuth, getBook);
router.post('/', authenticate, requireAdmin, upload.single('coverImage'), createBook);
router.put('/:id', authenticate, requireAdmin, upload.single('coverImage'), updateBook);
router.delete('/:id', authenticate, requireAdmin, deleteBook);

module.exports = router;

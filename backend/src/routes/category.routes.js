const express = require('express');
const router = express.Router();
const {
  getAll,
  getLeafCategories,
  create,
  update,
  remove,
} = require('../controllers/category.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.get('/', getAll);
router.get('/leaves', getLeafCategories);
router.post('/', authenticate, requireAdmin, create);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;

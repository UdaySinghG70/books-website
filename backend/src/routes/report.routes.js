const express = require('express');
const router = express.Router();
const { getFavoritesLastMonth, getFavoritesTimeline, getStats } = require('../controllers/report.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.get('/favorites-last-month', authenticate, requireAdmin, getFavoritesLastMonth);
router.get('/favorites-timeline', authenticate, requireAdmin, getFavoritesTimeline);
router.get('/stats', authenticate, requireAdmin, getStats);

module.exports = router;

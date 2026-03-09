const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getDashboardStats,
    getWeeklyAnalytics,
    getMonthlyAnalytics,
    getHeatmapData,
    getStreak,
    getInsights
} = require('../controllers/analyticsController');
const { getWeeklyFocusHours } = require('../controllers/timeController');

router.get('/dashboard', auth, getDashboardStats);
router.get('/weekly', auth, getWeeklyAnalytics);
router.get('/monthly', auth, getMonthlyAnalytics);
router.get('/heatmap', auth, getHeatmapData);
router.get('/streak', auth, getStreak);
router.get('/insights', auth, getInsights);
router.get('/focus-hours', auth, getWeeklyFocusHours);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getTasks,
    getTodayTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getCategories,
    getDailyHistory
} = require('../controllers/taskController');
const {
    startTimer,
    stopTimer,
    getTimeEntries,
    getRunningTimers
} = require('../controllers/timeController');

// Task routes
router.get('/', auth, getTasks);
router.get('/today', auth, getTodayTasks);
router.get('/categories', auth, getCategories);
router.get('/daily-history', auth, getDailyHistory);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.patch('/:id/status', auth, updateTaskStatus);
router.delete('/:id', auth, deleteTask);

// Time tracking routes
router.post('/:id/timer/start', auth, startTimer);
router.post('/:id/timer/stop', auth, stopTimer);
router.get('/:id/time', auth, getTimeEntries);
router.get('/timers/running', auth, getRunningTimers);

module.exports = router;

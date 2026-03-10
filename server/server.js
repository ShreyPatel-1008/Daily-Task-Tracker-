const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./config/db');
const seedDatabase = require('./config/seed');
const initDailyResetCron = require('./services/dailyReset');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const analyticsRoutes = require('./routes/analytics');
const noteRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database, seed default user, start cron jobs
connectDB().then(async () => {
    seedDatabase();
    initDailyResetCron();

    // One-time migration: mark existing tasks as daily so they persist across days
    try {
        const Task = require('./models/Task');
        const result = await Task.updateMany(
            { isDaily: { $ne: true } },
            { $set: { isDaily: true } }
        );
        if (result.modifiedCount > 0) {
            console.log(`🔄 Migrated ${result.modifiedCount} existing tasks to daily mode`);
        }
    } catch (err) {
        // Non-critical — skip silently
    }
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased for development
    message: { message: 'Too many requests, please try again later' }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notes', noteRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 TaskFlow Server running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
});

module.exports = app;

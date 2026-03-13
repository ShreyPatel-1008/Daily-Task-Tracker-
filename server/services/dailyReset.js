const cron = require('node-cron');
const Task = require('../models/Task');
const DailyHistory = require('../models/DailyHistory');

/**
 * Perform the daily reset:
 * 1. Save current status of all daily tasks to DailyHistory
 * 2. Reset all daily tasks to NOT_STARTED
 */
const performDailyReset = async (dateForHistory) => {
    const dailyTasks = await Task.find({ isDaily: true });

    if (dailyTasks.length === 0) {
        console.log('🔄 [RESET] No daily tasks found. Nothing to reset.');
        return;
    }

    // Save history records
    const historyRecords = dailyTasks.map(task => ({
        taskId: task._id,
        userId: task.userId,
        taskTitle: task.title,
        category: task.category,
        status: task.status,
        wasCompleted: task.status === 'COMPLETED',
        date: dateForHistory
    }));

    await DailyHistory.insertMany(historyRecords);
    console.log(`📝 [RESET] Saved ${historyRecords.length} daily history records for ${dateForHistory.toDateString()}`);

    // Reset all daily tasks to NOT_STARTED
    const result = await Task.updateMany(
        { isDaily: true },
        {
            $set: {
                status: 'NOT_STARTED',
                completedAt: null
            }
        }
    );

    console.log(`✅ [RESET] Reset ${result.modifiedCount} daily tasks to NOT_STARTED`);
};

/**
 * Check if a daily reset was missed (e.g., server was off at 4 AM).
 * Runs on server startup. Checks if there's a DailyHistory record
 * for yesterday. If not, performs the reset immediately.
 */
const checkMissedReset = async () => {
    try {
        console.log('🔍 [STARTUP] Checking for missed daily reset...');

        const now = new Date();
        // "Yesterday" = the last full day that should have been recorded
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        // Check if we already have history for yesterday
        const existingHistory = await DailyHistory.findOne({
            date: {
                $gte: yesterday,
                $lt: todayStart
            }
        });

        if (!existingHistory) {
            // No history for yesterday means the 4 AM reset was missed
            console.log('⚠️ [STARTUP] Missed daily reset detected! Running reset now...');
            await performDailyReset(yesterday);
            console.log('✅ [STARTUP] Missed reset completed successfully!');
        } else {
            console.log('✅ [STARTUP] Daily reset already ran. No action needed.');
        }
    } catch (error) {
        console.error('❌ [STARTUP] Missed reset check failed:', error.message);
    }
};

/**
 * Daily Task Reset Cron Job
 * Runs every day at 4:00 AM IST.
 */
const initDailyResetCron = () => {
    cron.schedule('0 4 * * *', async () => {
        console.log('🔄 [CRON] Daily task reset started at', new Date().toISOString());
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            await performDailyReset(yesterday);
            console.log('🔄 [CRON] Daily reset complete!');
        } catch (error) {
            console.error('❌ [CRON] Daily reset failed:', error.message);
        }
    }, {
        timezone: 'Asia/Kolkata'
    });

    console.log('⏰ Daily task reset scheduled: Every day at 4:00 AM IST');
};

module.exports = { initDailyResetCron, checkMissedReset };

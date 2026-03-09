const cron = require('node-cron');
const Task = require('../models/Task');
const DailyHistory = require('../models/DailyHistory');

/**
 * Daily Task Reset Cron Job
 * 
 * Runs every day at 4:00 AM (server time).
 * 
 * What it does:
 * 1. Finds all tasks marked as `isDaily: true`
 * 2. Saves each task's current status to DailyHistory (for analytics)
 * 3. Resets each daily task's status to NOT_STARTED
 * 4. Clears the completedAt timestamp
 */

const initDailyResetCron = () => {
    // Schedule: "0 4 * * *" = At 04:00 AM every day
    cron.schedule('0 4 * * *', async () => {
        console.log('🔄 [CRON] Daily task reset started at', new Date().toISOString());

        try {
            // Get yesterday's date (the day we're recording history for)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            // Find all daily tasks
            const dailyTasks = await Task.find({ isDaily: true });

            if (dailyTasks.length === 0) {
                console.log('🔄 [CRON] No daily tasks found. Nothing to reset.');
                return;
            }

            // Save history records for each daily task
            const historyRecords = dailyTasks.map(task => ({
                taskId: task._id,
                userId: task.userId,
                taskTitle: task.title,
                category: task.category,
                status: task.status,
                wasCompleted: task.status === 'COMPLETED',
                date: yesterday
            }));

            await DailyHistory.insertMany(historyRecords);
            console.log(`📝 [CRON] Saved ${historyRecords.length} daily history records`);

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

            console.log(`✅ [CRON] Reset ${result.modifiedCount} daily tasks to NOT_STARTED`);
            console.log('🔄 [CRON] Daily reset complete!');

        } catch (error) {
            console.error('❌ [CRON] Daily reset failed:', error.message);
        }
    }, {
        timezone: 'Asia/Kolkata' // IST timezone
    });

    console.log('⏰ Daily task reset scheduled: Every day at 4:00 AM IST');
};

module.exports = initDailyResetCron;

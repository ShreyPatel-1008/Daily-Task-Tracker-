const Task = require('../models/Task');
const TimeEntry = require('../models/TimeEntry');

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;

        const [total, completed, inProgress, notStarted] = await Promise.all([
            Task.countDocuments({ userId }),
            Task.countDocuments({ userId, status: 'COMPLETED' }),
            Task.countDocuments({ userId, status: 'IN_PROGRESS' }),
            Task.countDocuments({ userId, status: 'NOT_STARTED' })
        ]);

        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCompleted = await Task.countDocuments({
            userId,
            status: 'COMPLETED',
            completedAt: { $gte: today, $lt: tomorrow }
        });

        const todayCreated = await Task.countDocuments({
            userId,
            createdAt: { $gte: today, $lt: tomorrow }
        });

        // Category distribution
        const categoryDistribution = await Task.aggregate([
            { $match: { userId: req.user._id } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Priority distribution
        const priorityDistribution = await Task.aggregate([
            { $match: { userId: req.user._id } },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        res.json({
            total,
            completed,
            inProgress,
            notStarted,
            completionPercentage,
            todayCompleted,
            todayCreated,
            categoryDistribution,
            priorityDistribution
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Weekly analytics
exports.getWeeklyAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = [];

        for (let i = 0; i < 7; i++) {
            const dayStart = new Date(startOfWeek);
            dayStart.setDate(startOfWeek.getDate() + i);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayStart.getDate() + 1);

            const [completed, created, total] = await Promise.all([
                Task.countDocuments({ userId, completedAt: { $gte: dayStart, $lt: dayEnd } }),
                Task.countDocuments({ userId, createdAt: { $gte: dayStart, $lt: dayEnd } }),
                Task.countDocuments({ userId, createdAt: { $lt: dayEnd } })
            ]);

            weeklyData.push({
                day: days[i],
                date: dayStart.toISOString().split('T')[0],
                completed,
                created,
                total
            });
        }

        // Weekly productivity score
        const weekCompleted = await Task.countDocuments({
            userId,
            completedAt: { $gte: startOfWeek }
        });
        const weekTotal = await Task.countDocuments({
            userId,
            createdAt: { $gte: startOfWeek }
        });
        const productivityScore = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

        // Weekly time tracked
        const timeEntries = await TimeEntry.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    startTime: { $gte: startOfWeek },
                    isRunning: false
                }
            },
            { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
        ]);

        const focusHours = timeEntries.length > 0
            ? Math.round((timeEntries[0].totalDuration / 3600) * 10) / 10
            : 0;

        res.json({
            weeklyData,
            productivityScore,
            focusHours,
            weekCompleted,
            weekTotal
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Monthly analytics
exports.getMonthlyAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const year = parseInt(req.query.year) || now.getFullYear();
        const month = parseInt(req.query.month) || now.getMonth();

        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
        const daysInMonth = endOfMonth.getDate();

        const monthlyData = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const dayStart = new Date(year, month, day);
            const dayEnd = new Date(year, month, day + 1);

            const [completed, created] = await Promise.all([
                Task.countDocuments({ userId, completedAt: { $gte: dayStart, $lt: dayEnd } }),
                Task.countDocuments({ userId, createdAt: { $gte: dayStart, $lt: dayEnd } })
            ]);

            monthlyData.push({
                day,
                date: dayStart.toISOString().split('T')[0],
                completed,
                created
            });
        }

        // Monthly status distribution
        const statusDistribution = await Task.aggregate([
            {
                $match: {
                    userId,
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Monthly totals
        const monthCompleted = await Task.countDocuments({
            userId,
            completedAt: { $gte: startOfMonth, $lte: endOfMonth }
        });
        const monthCreated = await Task.countDocuments({
            userId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        res.json({
            monthlyData,
            statusDistribution,
            monthCompleted,
            monthCreated,
            productivityScore: monthCreated > 0 ? Math.round((monthCompleted / monthCreated) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Heatmap data (GitHub-style)
exports.getHeatmapData = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);

        const completedTasks = await Task.aggregate([
            {
                $match: {
                    userId,
                    completedAt: { $gte: startDate, $lte: now }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const heatmapData = {};
        completedTasks.forEach(item => {
            heatmapData[item._id] = item.count;
        });

        res.json({ heatmapData, startDate: startDate.toISOString(), endDate: now.toISOString() });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Task streak
exports.getStreak = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        let streak = 0;
        let currentDate = new Date(now);
        currentDate.setHours(0, 0, 0, 0);

        // Check today first
        const todayEnd = new Date(currentDate);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const todayCount = await Task.countDocuments({
            userId,
            completedAt: { $gte: currentDate, $lt: todayEnd }
        });

        // If no tasks completed today, start checking from yesterday
        if (todayCount === 0) {
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            streak = 1;
            currentDate.setDate(currentDate.getDate() - 1);
        }

        // Check previous days
        for (let i = 0; i < 365; i++) {
            const dayStart = new Date(currentDate);
            const dayEnd = new Date(currentDate);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const count = await Task.countDocuments({
                userId,
                completedAt: { $gte: dayStart, $lt: dayEnd }
            });

            if (count > 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Best streak (simplified - just return current)
        res.json({ currentStreak: streak, todayCompleted: todayCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Smart insights
exports.getInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const insights = [];
        const now = new Date();

        // Most productive day
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        const weeklyCompletion = await Task.aggregate([
            {
                $match: {
                    userId,
                    completedAt: { $gte: startOfWeek }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$completedAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        if (weeklyCompletion.length > 0) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const mostProductiveDay = dayNames[weeklyCompletion[0]._id - 1];
            insights.push({
                type: 'productive_day',
                icon: '📅',
                message: `You are most productive on ${mostProductiveDay}s`
            });
        }

        // Week over week comparison
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);

        const [thisWeekCount, lastWeekCount] = await Promise.all([
            Task.countDocuments({ userId, completedAt: { $gte: startOfWeek } }),
            Task.countDocuments({ userId, completedAt: { $gte: twoWeeksAgo, $lt: startOfWeek } })
        ]);

        if (lastWeekCount > 0) {
            const change = Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);
            if (change > 0) {
                insights.push({
                    type: 'improvement',
                    icon: '📈',
                    message: `You completed ${change}% more tasks than last week`
                });
            } else if (change < 0) {
                insights.push({
                    type: 'decline',
                    icon: '📉',
                    message: `Your task completion dropped ${Math.abs(change)}% from last week`
                });
            } else {
                insights.push({
                    type: 'steady',
                    icon: '➡️',
                    message: 'Your productivity is consistent with last week'
                });
            }
        }

        // Completion rate
        const totalTasks = await Task.countDocuments({ userId });
        const completedTasks = await Task.countDocuments({ userId, status: 'COMPLETED' });
        if (totalTasks > 0) {
            const rate = Math.round((completedTasks / totalTasks) * 100);
            insights.push({
                type: 'completion_rate',
                icon: '🎯',
                message: `Your overall completion rate is ${rate}%`
            });
        }

        // Category insight
        const topCategory = await Task.aggregate([
            { $match: { userId, status: 'COMPLETED' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        if (topCategory.length > 0) {
            insights.push({
                type: 'top_category',
                icon: '🏆',
                message: `"${topCategory[0]._id}" is your most completed category with ${topCategory[0].count} tasks`
            });
        }

        // Overdue tasks
        const overdueTasks = await Task.countDocuments({
            userId,
            status: { $ne: 'COMPLETED' },
            dueDate: { $lt: now }
        });

        if (overdueTasks > 0) {
            insights.push({
                type: 'overdue',
                icon: '⚠️',
                message: `You have ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}`
            });
        }

        // Focus time insight
        const weeklyTime = await TimeEntry.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    startTime: { $gte: startOfWeek },
                    isRunning: false
                }
            },
            { $group: { _id: null, total: { $sum: '$duration' } } }
        ]);

        if (weeklyTime.length > 0 && weeklyTime[0].total > 0) {
            const hours = Math.round((weeklyTime[0].total / 3600) * 10) / 10;
            insights.push({
                type: 'focus_time',
                icon: '⏱️',
                message: `You've tracked ${hours} focus hours this week`
            });
        }

        res.json({ insights });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const TimeEntry = require('../models/TimeEntry');
const Task = require('../models/Task');

// Start timer
exports.startTimer = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if there's already a running timer for this task
        const runningEntry = await TimeEntry.findOne({
            taskId: task._id,
            userId: req.userId,
            isRunning: true
        });

        if (runningEntry) {
            return res.status(400).json({ message: 'Timer is already running for this task' });
        }

        const entry = await TimeEntry.create({
            taskId: task._id,
            userId: req.userId,
            startTime: new Date(),
            isRunning: true
        });

        // Update task status to IN_PROGRESS if NOT_STARTED
        if (task.status === 'NOT_STARTED') {
            task.status = 'IN_PROGRESS';
            await task.save();
        }

        res.status(201).json({ timeEntry: entry, task });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Stop timer
exports.stopTimer = async (req, res) => {
    try {
        const entry = await TimeEntry.findOne({
            taskId: req.params.id,
            userId: req.userId,
            isRunning: true
        });

        if (!entry) {
            return res.status(404).json({ message: 'No running timer found for this task' });
        }

        entry.endTime = new Date();
        await entry.save();

        res.json({ timeEntry: entry });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get time entries for a task
exports.getTimeEntries = async (req, res) => {
    try {
        const entries = await TimeEntry.find({
            taskId: req.params.id,
            userId: req.userId
        }).sort({ startTime: -1 });

        const totalDuration = entries.reduce((sum, entry) => {
            if (!entry.isRunning) {
                return sum + entry.duration;
            }
            // For running entries, calculate current duration
            return sum + Math.floor((new Date() - entry.startTime) / 1000);
        }, 0);

        res.json({ entries, totalDuration });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all running timers
exports.getRunningTimers = async (req, res) => {
    try {
        const entries = await TimeEntry.find({
            userId: req.userId,
            isRunning: true
        }).populate('taskId', 'title');

        res.json({ entries });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get weekly focus hours
exports.getWeeklyFocusHours = async (req, res) => {
    try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyFocus = [];

        for (let i = 0; i < 7; i++) {
            const dayStart = new Date(startOfWeek);
            dayStart.setDate(startOfWeek.getDate() + i);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayStart.getDate() + 1);

            const result = await TimeEntry.aggregate([
                {
                    $match: {
                        userId: req.user._id,
                        startTime: { $gte: dayStart, $lt: dayEnd },
                        isRunning: false
                    }
                },
                { $group: { _id: null, total: { $sum: '$duration' } } }
            ]);

            dailyFocus.push({
                day: days[i],
                hours: result.length > 0 ? Math.round((result[0].total / 3600) * 10) / 10 : 0
            });
        }

        res.json({ dailyFocus });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

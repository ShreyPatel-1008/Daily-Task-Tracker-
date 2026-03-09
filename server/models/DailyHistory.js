const mongoose = require('mongoose');

const dailyHistorySchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    taskTitle: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    status: {
        type: String,
        enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
        required: true
    },
    wasCompleted: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for efficient lookups
dailyHistorySchema.index({ userId: 1, date: -1 });
dailyHistorySchema.index({ taskId: 1, date: -1 });

module.exports = mongoose.model('DailyHistory', dailyHistorySchema);

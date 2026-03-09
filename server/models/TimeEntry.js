const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
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
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // duration in seconds
        default: 0
    },
    isRunning: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
timeEntrySchema.index({ userId: 1, startTime: -1 });

// Calculate duration before saving
timeEntrySchema.pre('save', function (next) {
    if (this.endTime && this.startTime) {
        this.duration = Math.floor((this.endTime - this.startTime) / 1000);
        this.isRunning = false;
    }
    next();
});

module.exports = mongoose.model('TimeEntry', timeEntrySchema);

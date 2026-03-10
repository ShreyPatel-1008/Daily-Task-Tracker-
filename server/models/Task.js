const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
        default: ''
    },
    status: {
        type: String,
        enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
        default: 'NOT_STARTED'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    category: {
        type: String,
        trim: true,
        default: 'General',
        maxlength: [50, 'Category cannot exceed 50 characters']
    },
    dueDate: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    isDaily: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, completedAt: -1 });
taskSchema.index({ userId: 1, category: 1 });

// Pre-save middleware to set completedAt
taskSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'COMPLETED' && !this.completedAt) {
        this.completedAt = new Date();
    }
    if (this.isModified('status') && this.status !== 'COMPLETED') {
        this.completedAt = null;
    }
    next();
});

module.exports = mongoose.model('Task', taskSchema);

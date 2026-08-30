const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['announcement', 'alert', 'recommendation', 'system'],
        default: 'announcement'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    targetRole: {
        type: String,
        enum: ['all', 'student', 'recruiter', 'admin'],
        default: 'all'
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for common query patterns
notificationSchema.index({ targetRole: 1, createdAt: -1 });
notificationSchema.index({ targetUserId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

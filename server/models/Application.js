const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    skillMatch: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    hiringProbability: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    matchedSkills: [{
        type: String
    }],
    missingSkills: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['new', 'in-review', 'shortlisted', 'interview', 'selected', 'rejected'],
        default: 'new'
    },
    interviewDate: {
        type: Date
    },
    interviewNotes: {
        type: String,
        default: ''
    },
    interviewType: {
        type: String,
        enum: ['phone', 'video', 'onsite', 'technical', 'hr', ''],
        default: ''
    },
    meetingLink: {
        type: String,
        default: ''
    },
    roundName: {
        type: String,
        default: 'Technical Interview'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    statusUpdatedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate applications
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

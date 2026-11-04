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
    scorecard: {
        dsaRating: { type: Number, default: 0, min: 0, max: 5 },
        systemDesignRating: { type: Number, default: 0, min: 0, max: 5 },
        communicationRating: { type: Number, default: 0, min: 0, max: 5 },
        cultureFitRating: { type: Number, default: 0, min: 0, max: 5 },
        recommendation: { type: String, enum: ['strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire', ''], default: '' },
        notes: { type: String, default: '' },
        evaluatedAt: { type: Date }
    },
    aiScreening: {
        strengths: [{ type: String }],
        skillGaps: [{ type: String }],
        recommendationScore: { type: Number, default: 0 },
        summary: { type: String, default: '' },
        evaluatedAt: { type: Date }
    },
    assignedAssessment: {
        questionId: { type: String, default: '' },
        questionTitle: { type: String, default: '' },
        difficulty: { type: String, default: 'Medium' },
        assignedAt: { type: Date },
        dueDate: { type: Date },
        status: { type: String, enum: ['pending', 'completed', 'expired', ''], default: '' },
        score: { type: Number, default: 0 }
    },
    offerLetter: {
        salary: { type: String, default: '' },
        joiningDate: { type: Date },
        signingBonus: { type: String, default: '' },
        customNotes: { type: String, default: '' },
        generatedAt: { type: Date },
        status: { type: String, enum: ['draft', 'sent', 'accepted', 'declined', ''], default: '' }
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

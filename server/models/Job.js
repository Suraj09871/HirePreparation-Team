const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required']
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    requiredSkills: [{
        type: String,
        trim: true
    }],
    experienceRequired: {
        type: String,
        default: '0-1 years (Fresher)'
    },
    location: {
        type: String,
        default: 'Remote'
    },
    salary: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'draft'],
        default: 'active'
    },
    applicantCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for common query patterns
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);

const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    website: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    domain: {
        type: String,
        enum: ['product', 'service', 'startup'],
        default: 'product'
    },
    industry: {
        type: String,
        default: 'Technology'
    },
    size: {
        type: String,
        enum: ['startup', 'mid', 'enterprise'],
        default: 'enterprise'
    },
    headquarter: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    foundedYear: {
        type: Number,
        default: null
    },
    employeeCount: {
        type: String,
        default: ''
    },

    // HR / Contact Person Details
    hrName: {
        type: String,
        default: ''
    },
    hrEmail: {
        type: String,
        default: ''
    },
    hrPhone: {
        type: String,
        default: ''
    },

    // Verification Documents
    registrationNumber: {
        type: String,
        default: ''
    },
    linkedIn: {
        type: String,
        default: ''
    },
    companyEmail: {
        type: String,
        default: ''
    },

    // Verification Status
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verificationDoc: {
        type: String,
        default: ''
    },

    // Hiring Process & Selection Rounds
    hiringProcess: [{
        roundNumber: { type: Number, default: 1 },
        roundName: { type: String, default: 'Technical Interview' },
        roundType: { 
            type: String, 
            enum: ['online_assessment', 'technical_interview', 'system_design', 'managerial', 'hr_discussion', 'group_discussion', 'other'],
            default: 'technical_interview' 
        },
        description: { type: String, default: '' },
        durationMinutes: { type: Number, default: 45 },
        cutoffScore: { type: String, default: '' },
        mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' }
    }],
    hiringCriteria: {
        minCgpa: { type: Number, default: 0 },
        allowedBacklogs: { type: Number, default: 0 },
        eligibleDegrees: { type: [String], default: [] },
        eligibleBranches: { type: [String], default: [] },
        keyFocusSkills: { type: [String], default: [] },
        experienceRange: { type: String, default: 'All experience levels' }
    },

    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Keep isVerified in sync with verificationStatus
companySchema.pre('save', function(next) {
    this.isVerified = (this.verificationStatus === 'approved');
    next();
});

module.exports = mongoose.model('Company', companySchema);

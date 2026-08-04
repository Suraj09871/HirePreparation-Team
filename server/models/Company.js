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
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDoc: {
        type: String,
        default: ''
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

module.exports = mongoose.model('Company', companySchema);

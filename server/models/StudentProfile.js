const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    phone: {
        type: String,
        default: ''
    },
    education: {
        type: String,
        default: ''
    },
    experience: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    resumeUrl: {
        type: String,
        default: ''
    },
    resumeScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    skills: [{
        name: {
            type: String,
            required: true
        },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner'
        }
    }],
    projects: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        techStack: {
            type: String,
            default: ''
        }
    }],
    additionalDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate profile completion percentage
studentProfileSchema.methods.getCompletionPercentage = function() {
    let filled = 0;
    const totalFields = 6; // phone, education, experience, location, resume, skills

    if (this.phone) filled++;
    if (this.education) filled++;
    if (this.experience) filled++;
    if (this.location) filled++;
    if (this.resumeUrl) filled++;
    if (this.skills && this.skills.length > 0) filled++;

    return Math.round((filled / totalFields) * 100);
};

// Update the updatedAt timestamp
studentProfileSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);

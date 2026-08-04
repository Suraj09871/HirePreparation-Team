const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    template: { type: String, enum: ['modern', 'classic', 'minimal', 'creative'], default: 'modern' },
    data: {
        fullName: String,
        email: String,
        phone: String,
        location: String,
        title: String,
        summary: String,
        experience: [{
            company: String,
            position: String,
            startDate: String,
            endDate: String,
            description: String
        }],
        education: [{
            institution: String,
            degree: String,
            year: String,
            gpa: String
        }],
        skills: [String],
        projects: [{
            name: String,
            description: String,
            techStack: String,
            link: String
        }],
        certifications: [String],
        languages: [String]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

resumeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Resume', resumeSchema);

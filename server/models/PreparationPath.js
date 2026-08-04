const mongoose = require('mongoose');

const preparationPathSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    description: {
        type: String,
        default: ''
    },
    questionCount: {
        type: Number,
        default: 0
    },
    topicCount: {
        type: Number,
        default: 0
    },
    avgSalary: {
        type: String,
        default: ''
    },
    roles: [{
        type: String
    }],
    topics: [{
        title: {
            type: String,
            required: true
        },
        items: [{
            type: String
        }],
        order: {
            type: Number,
            default: 0
        }
    }],
    questions: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            default: ''
        },
        category: {
            type: String,
            default: 'General'
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PreparationPath', preparationPathSchema);

const mongoose = require('mongoose');

const savedInterviewQuestionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    shortAnswer: {
        type: String,
        required: true
    },
    longAnswer: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        default: []
    },
    correctAnswer: {
        type: String
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('SavedInterviewQuestion', savedInterviewQuestionSchema);

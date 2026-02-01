const mongoose = require('mongoose');

const SavedQuestionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    jobRole: { type: String, required: true },
    difficulty: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedQuestion', SavedQuestionSchema);

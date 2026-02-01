const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // In Test_Version, we might have a logged-in user or a demo user
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    resumeText: {
        type: String,
        required: true
    },
    resumeFileName: {
        type: String
    },
    atsScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    skillMatchScore: {
        type: Number,
        default: 0
    },
    keywordMatchScore: {
        type: Number,
        default: 0
    },
    roleRelevanceScore: {
        type: Number,
        default: 0
    },
    matchedSkills: [{
        type: String
    }],
    missingSkills: [{
        type: String
    }],
    matchedKeywordsPercent: {
        type: Number,
        default: 0
    },
    suggestions: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('ResumeAnalysis', analysisSchema);

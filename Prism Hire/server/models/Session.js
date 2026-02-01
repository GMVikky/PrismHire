const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionName: {
        type: String,
        required: true,
        trim: true
    },
    jobRole: {
        type: String,
        required: true
    },
    yearsOfExperience: {
        type: String, // String because user might type "5+" or "5 years"
        default: ""
    },
    topicsToFocus: {
        type: String,
        required: false,
        default: ""
    },
    jobDescription: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate metrics later if needed (e.g. questions answered in this session)

module.exports = mongoose.model('Session', sessionSchema);

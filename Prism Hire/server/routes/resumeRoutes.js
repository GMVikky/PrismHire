const express = require('express');
const upload = require('../config/multer');
const { parseResume } = require('../services/resumeParser');
const { calculateATSScore } = require('../services/atsScorer');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const fs = require('fs').promises;

const router = express.Router();

// Analyze resume endpoint
// Note: Using a fixed demo user ID if req.user is not populated, or rely on auth middleware
router.post('/analyze', upload.single('resume'), async (req, res) => {
    let filePath = null;

    try {
        // Fallback if no user is attached (though Test_Version has auth, we might want to support guest or handle it)
        const userId = req.user ? req.user._id : '000000000000000000000000';

        const { role, jobDescription } = req.body;

        // Validation
        if (!req.file) {
            return res.status(400).json({ error: 'Resume file is required' });
        }

        if (!role || !jobDescription) {
            return res.status(400).json({ error: 'Role and job description are required' });
        }

        filePath = req.file.path;

        // Step 1: Parse resume to extract text
        const { cleanedText, rawText } = await parseResume(filePath);

        if (!cleanedText || cleanedText.length < 50) {
            return res.status(400).json({
                error: 'Could not extract enough text from resume. Please ensure the file is readable.'
            });
        }

        // Step 2: Calculate ATS score
        const scoreResult = calculateATSScore(cleanedText, jobDescription, role);

        // Step 3: Save analysis to database
        const analysis = new ResumeAnalysis({
            userId: userId,
            role,
            jobDescription,
            resumeText: rawText.substring(0, 5000), // Store first 5000 chars
            resumeFileName: req.file.originalname,
            atsScore: scoreResult.atsScore,
            skillMatchScore: scoreResult.skillMatchScore,
            keywordMatchScore: scoreResult.keywordMatchScore,
            roleRelevanceScore: scoreResult.roleRelevanceScore,
            matchedSkills: scoreResult.matchedSkills,
            missingSkills: scoreResult.missingSkills,
            matchedKeywordsPercent: scoreResult.matchedKeywordsPercent,
            suggestions: scoreResult.suggestions
        });

        await analysis.save();

        // Step 4: Delete uploaded file
        try {
            await fs.unlink(filePath);
        } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError);
        }

        // Step 5: Return results
        res.json({
            success: true,
            analysisId: analysis._id,
            atsScore: scoreResult.atsScore,
            skillMatchScore: scoreResult.skillMatchScore,
            keywordMatchScore: scoreResult.keywordMatchScore,
            roleRelevanceScore: scoreResult.roleRelevanceScore,
            matchedSkills: scoreResult.matchedSkills,
            missingSkills: scoreResult.missingSkills,
            matchedKeywordsPercent: scoreResult.matchedKeywordsPercent,
            suggestions: scoreResult.suggestions,
            role,
            resumeFileName: req.file.originalname
        });

    } catch (error) {
        console.error('Analysis error:', error);

        // Clean up file on error
        if (filePath) {
            try {
                await fs.unlink(filePath);
            } catch (unlinkError) {
                console.error('Error deleting file after error:', unlinkError);
            }
        }

        res.status(500).json({
            error: error.message || 'Error analyzing resume. Please try again.'
        });
    }
});

module.exports = router;

const {
    extractSkills,
    extractKeywords,
    calculateMatchPercentage,
    findMissingSkills,
    extractRoleKeywords
} = require('./nlpService');

/**
 * Calculate ATS Score based on resume and job description
 * 
 * Scoring Formula:
 * - Skill Match: 50%
 * - Keyword Match: 30%
 * - Role Relevance: 20%
 */
function calculateATSScore(resumeText, jobDescription, role) {
    // Extract skills
    const resumeSkills = extractSkills(resumeText);
    const jdSkills = extractSkills(jobDescription);

    // Extract keywords
    const resumeKeywords = extractKeywords(resumeText);
    const jdKeywords = extractKeywords(jobDescription);

    // 1. Skill Match Score (50%)
    let skillMatchScore = 0;
    if (jdSkills.length > 0) {
        const matchedSkills = resumeSkills.filter(skill =>
            jdSkills.some(jdSkill => jdSkill.toLowerCase() === skill.toLowerCase())
        );
        skillMatchScore = (matchedSkills.length / jdSkills.length) * 50;
    }

    // 2. Keyword Match Score (30%)
    let keywordMatchScore = 0;
    if (jdKeywords.length > 0) {
        const matchedKeywords = resumeKeywords.filter(kw =>
            jdKeywords.some(jdkw => jdkw.toLowerCase() === kw.toLowerCase())
        );
        keywordMatchScore = (matchedKeywords.length / jdKeywords.length) * 30;
    }

    // 3. Role Relevance Score (20%)
    const roleAnalysis = extractRoleKeywords(role, resumeText);
    const roleRelevanceScore = (roleAnalysis.matchPercentage / 100) * 20;

    // Calculate final ATS score
    const atsScore = Math.round(skillMatchScore + keywordMatchScore + roleRelevanceScore);

    // Find matched and missing skills
    const matchedSkills = resumeSkills.filter(skill =>
        jdSkills.some(jdSkill => jdSkill.toLowerCase() === skill.toLowerCase())
    );

    const missingSkills = findMissingSkills(resumeSkills, jdSkills);

    // Calculate keyword match percentage
    const matchedKeywordsPercent = jdKeywords.length > 0
        ? Math.round((resumeKeywords.filter(kw =>
            jdKeywords.some(jdkw => jdkw.toLowerCase() === kw.toLowerCase())
        ).length / jdKeywords.length) * 100)
        : 0;

    // Generate suggestions
    const suggestions = generateSuggestions({
        atsScore,
        missingSkills,
        matchedSkills,
        jdSkills,
        roleAnalysis,
        skillMatchScore,
        keywordMatchScore,
        roleRelevanceScore
    });

    return {
        atsScore,
        skillMatchScore: Math.round(skillMatchScore),
        keywordMatchScore: Math.round(keywordMatchScore),
        roleRelevanceScore: Math.round(roleRelevanceScore),
        matchedSkills,
        missingSkills,
        matchedKeywordsPercent,
        suggestions
    };
}

/**
 * Generate actionable suggestions to improve resume
 */
function generateSuggestions(data) {
    const suggestions = [];
    const { atsScore, missingSkills, matchedSkills, jdSkills, roleAnalysis, skillMatchScore, keywordMatchScore } = data;

    // Overall score feedback
    if (atsScore < 50) {
        suggestions.push('Your ATS score is low. Consider major revisions to better align with the job description.');
    } else if (atsScore < 75) {
        suggestions.push('Your resume shows potential but needs improvement to pass ATS filters effectively.');
    } else {
        suggestions.push('Great! Your resume has a strong ATS compatibility score.');
    }

    // Skill-based suggestions
    if (skillMatchScore < 30) {
        suggestions.push('Add more technical skills mentioned in the job description to improve skill match.');
    }

    // Missing skills
    if (missingSkills.length > 0) {
        const topMissing = missingSkills.slice(0, 5).join(', ');
        suggestions.push(`Add these important skills to your resume: ${topMissing}`);

        if (missingSkills.length > 5) {
            suggestions.push('Consider adding projects or experience that demonstrate the missing skills.');
        }
    }

    // Keyword suggestions
    if (keywordMatchScore < 20) {
        suggestions.push('Include more keywords from the job description naturally throughout your resume.');
        suggestions.push('Add relevant industry terms and technologies mentioned in the JD.');
    }

    // Role-specific suggestions
    if (roleAnalysis.matchPercentage < 50) {
        suggestions.push(`Ensure your resume explicitly mentions the role title or related terms.`);
        suggestions.push('Tailor your resume summary to highlight experience relevant to this specific role.');
    }

    // Formatting suggestions
    suggestions.push('Use clear section headings (Skills, Experience, Education, Projects).');
    suggestions.push('List technical skills in a dedicated "Skills" or "Technical Skills" section.');

    // Experience suggestions
    if (matchedSkills.length < jdSkills.length * 0.5) {
        suggestions.push('Add specific projects or achievements that demonstrate your skills in action.');
        suggestions.push('Use action verbs and quantify your achievements where possible.');
    }

    return suggestions;
}

module.exports = {
    calculateATSScore,
    generateSuggestions
};

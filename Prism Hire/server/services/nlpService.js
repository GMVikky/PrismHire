const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Common technical skills dictionary
const SKILLS_DICTIONARY = [
    // Programming Languages
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'go', 'rust', 'typescript', 'scala', 'r', 'matlab', 'perl', 'html', 'css',

    // Frameworks & Libraries
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
    'laravel', 'rails', 'asp.net', 'fastapi', 'next.js', 'nuxt', 'svelte', 'jquery',
    'bootstrap', 'tailwind', 'material-ui', 'redux', 'mobx',

    // Databases
    'mongodb', 'mysql', 'postgresql', 'oracle', 'sql server', 'redis', 'elasticsearch',
    'cassandra', 'dynamodb', 'firebase', 'mariadb', 'sqlite', 'neo4j',

    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
    'ci/cd', 'devops', 'git', 'github', 'gitlab', 'bitbucket', 'heroku', 'vercel',
    'netlify', 'circleci', 'travis ci',

    // Tools & Technologies
    'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'jira', 'linux',
    'unix', 'bash', 'powershell', 'nginx', 'apache', 'webpack', 'vite', 'babel',
    'npm', 'yarn', 'maven', 'gradle',

    // Data & AI
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'pandas', 'numpy', 'data analysis', 'data science', 'nlp', 'computer vision',
    'opencv', 'keras',

    // Mobile
    'react native', 'flutter', 'ios', 'android', 'xamarin', 'ionic',

    // Other
    'oop', 'data structures', 'algorithms', 'testing', 'unit testing', 'jest',
    'mocha', 'selenium', 'cypress', 'api', 'authentication', 'security',
    'responsive design', 'ui/ux', 'figma', 'sketch', 'photoshop'
];

/**
 * Extract skills from text using dictionary matching
 */
function extractSkills(text) {
    const lowerText = text.toLowerCase();
    const foundSkills = new Set();

    SKILLS_DICTIONARY.forEach(skill => {
        // Check for exact match or word boundary match
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(lowerText)) {
            foundSkills.add(skill);
        }
    });

    return Array.from(foundSkills);
}

/**
 * Extract keywords from text (excluding common stopwords)
 */
function extractKeywords(text, minLength = 3) {
    const tokens = tokenizer.tokenize(text.toLowerCase());

    // Common stopwords
    const stopwords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
        'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'my', 'your', 'his', 'her', 'its', 'our', 'their'
    ]);

    const keywords = tokens.filter(token =>
        token.length >= minLength && !stopwords.has(token)
    );

    return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Calculate match percentage between two arrays
 */
function calculateMatchPercentage(source, target) {
    if (target.length === 0) return 0;

    const matchedItems = source.filter(item =>
        target.some(t => t.toLowerCase().includes(item.toLowerCase()))
    );

    return (matchedItems.length / target.length) * 100;
}

/**
 * Find missing skills (in JD but not in resume)
 */
function findMissingSkills(resumeSkills, jdSkills) {
    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());

    return jdSkills.filter(jdSkill =>
        !resumeSkillsLower.some(rs => rs.includes(jdSkill.toLowerCase()))
    );
}

/**
 * Extract role-specific keywords
 */
function extractRoleKeywords(role, text) {
    const roleTerms = role.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();

    const matchedTerms = roleTerms.filter(term => textLower.includes(term));

    return {
        matchedTerms,
        matchPercentage: (matchedTerms.length / roleTerms.length) * 100
    };
}

module.exports = {
    extractSkills,
    extractKeywords,
    calculateMatchPercentage,
    findMissingSkills,
    extractRoleKeywords,
    SKILLS_DICTIONARY
};

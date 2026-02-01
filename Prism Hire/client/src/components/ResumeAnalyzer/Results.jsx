import ScoreGauge from './ScoreGauge';

const Results = ({ results, onReset }) => {
    if (!results) return null;

    const {
        atsScore,
        skillMatchScore,
        keywordMatchScore,
        roleRelevanceScore,
        matchedSkills,
        missingSkills,
        suggestions,
        role,
        resumeFileName
    } = results;

    const getScoreLabel = (score) => {
        if (score >= 75) return { text: 'Excellent', color: 'text-green-400' };
        if (score >= 50) return { text: 'Good', color: 'text-yellow-400' };
        return { text: 'Needs Improvement', color: 'text-red-400' };
    };

    const scoreLabel = getScoreLabel(atsScore);

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
                <h1 className="text-3xl font-extrabold text-white mb-2">
                    Analysis Results
                </h1>
                <p className="text-gray-400">
                    Resume: <span className="font-medium text-gray-200">{resumeFileName}</span> • Role: <span className="font-medium text-gray-200">{role}</span>
                </p>
            </div>

            {/* Main Score Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-8 mb-8 animate-slide-up border border-gray-700">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Your ATS Score</h2>
                    <p className={`text-xl font-semibold ${scoreLabel.color}`}>{scoreLabel.text}</p>
                </div>

                <div className="flex justify-center mb-8">
                    <ScoreGauge score={atsScore} size={250} />
                </div>

                {/* Score Breakdown */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-700/50 p-6 rounded-xl shadow-sm border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">Skill Match</h3>
                            <span className="text-2xl font-bold text-brand-400">{skillMatchScore}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                                className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${skillMatchScore}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">50% weight in total score</p>
                    </div>

                    <div className="bg-gray-700/50 p-6 rounded-xl shadow-sm border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">Keyword Match</h3>
                            <span className="text-2xl font-bold text-blue-400">{keywordMatchScore}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${keywordMatchScore}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">30% weight in total score</p>
                    </div>

                    <div className="bg-gray-700/50 p-6 rounded-xl shadow-sm border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">Role Relevance</h3>
                            <span className="text-2xl font-bold text-purple-400">{roleRelevanceScore}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${roleRelevanceScore}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">20% weight in total score</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Matched Skills */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 animate-slide-up border border-gray-700">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white">Matched Skills</h2>
                        <span className="ml-auto bg-green-900/30 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                            {matchedSkills.length}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {matchedSkills.length > 0 ? (
                            matchedSkills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-green-900/30 text-green-300 px-3 py-1 rounded-full text-sm border border-green-800/50"
                                >
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">No skills matched</p>
                        )}
                    </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 animate-slide-up border border-gray-700">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white">Missing Skills</h2>
                        <span className="ml-auto bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                            {missingSkills.length}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {missingSkills.length > 0 ? (
                            missingSkills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-sm border border-red-800/50"
                                >
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">All required skills present!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Suggestions */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 animate-slide-up border border-gray-700">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Improvement Suggestions</h2>
                </div>

                <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start p-4 bg-blue-900/10 rounded-lg border border-blue-900/30 transition-colors duration-200">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                                {index + 1}
                            </div>
                            <p className="text-gray-300">{suggestion}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={onReset}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                >
                    Analyze Another Resume
                </button>
            </div>
        </div>
    );
};

export default Results;

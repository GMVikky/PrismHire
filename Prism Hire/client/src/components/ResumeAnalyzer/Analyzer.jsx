import { useState, useEffect } from 'react';
import api from '../../lib/api';

const Analyzer = ({ onAnalysisComplete, currentSession }) => {
    const [resumeFile, setResumeFile] = useState(null);
    const [role, setRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    // Auto-populate from session
    useEffect(() => {
        if (currentSession?.jobRole) {
            setRole(currentSession.jobRole);
            if (currentSession.jobDescription) {
                setJobDescription(currentSession.jobDescription);
            }
        }
    }, [currentSession]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        validateAndSetFile(file);
    };

    const validateAndSetFile = (file) => {
        if (file) {
            // Check file extension as MIME types can be unreliable
            const lowerName = file.name.toLowerCase();
            const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.odt'];

            const isValidExtension = validExtensions.some(ext => lowerName.endsWith(ext));

            if (isValidExtension) {
                setResumeFile(file);
                setError('');
            } else {
                setError('Please upload a supported file: PDF, DOCX, DOC, TXT, RTF, or ODT');
                setResumeFile(null);
            }
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!resumeFile) {
            setError('Please upload a resume file');
            return;
        }

        if (!role.trim() || !jobDescription.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            formData.append('role', role);
            formData.append('jobDescription', jobDescription);

            // Assuming proxy is set up or using localhost:5000
            const response = await api.post('/resume/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Pass results to parent component
            onAnalysisComplete(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Error analyzing resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
                <h1 className="text-3xl font-extrabold text-white mb-2">
                    Resume ATS Analyzer
                </h1>
                <p className="text-gray-400">
                    Upload your resume and job description to get your ATS score and improvement suggestions
                </p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-8 animate-slide-up">
                {error && (
                    <div className="mb-6 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* File Upload */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Upload Resume (PDF, DOCX, DOC, TXT, RTF)
                    </label>
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive
                            ? 'border-brand-500 bg-brand-900/20'
                            : 'border-gray-600 hover:border-brand-500 hover:bg-gray-700/30'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="resume"
                            accept=".pdf,.docx,.doc,.txt,.rtf,.odt"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {resumeFile ? (
                            <div className="flex items-center justify-center space-x-3">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-left">
                                    <p className="text-white font-medium">{resumeFile.name}</p>
                                    <p className="text-sm text-gray-400">{(resumeFile.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setResumeFile(null);
                                    }}
                                    className="ml-4 text-red-500 hover:text-red-400 p-2 hover:bg-red-900/20 rounded-full transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="resume" className="cursor-pointer block">
                                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="mt-3 text-sm text-gray-300">
                                    <span className="text-brand-400 font-medium">Click to upload</span> or drag and drop
                                </p>
                                <p className="mt-1 text-xs text-gray-400">PDF, DOCX, DOC, TXT, RTF, ODT (max 10MB)</p>
                            </label>
                        )}
                    </div>
                </div>

                {/* Job Role */}
                <div className="mb-6">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                        Job Role / Title
                    </label>
                    {currentSession ? (
                        <div className="w-full bg-brand-900/20 border border-brand-500/30 rounded-lg px-4 py-3 text-brand-400 font-bold flex items-center justify-between">
                            {currentSession.jobRole}
                            <div className="flex items-center gap-2 px-3 py-1 bg-brand-500/10 rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
                                <span className="text-[9px] text-brand-500/80 uppercase tracking-wider font-extrabold">Session Locked</span>
                            </div>
                        </div>
                    ) : (
                        <input
                            type="text"
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                            placeholder="e.g., Frontend Developer, Full Stack Engineer, DevOps Engineer"
                            required
                        />
                    )}
                </div>

                {/* Job Description */}
                <div className="mb-8">
                    <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-300 mb-2">
                        Job Description
                    </label>
                    <textarea
                        id="jobDescription"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={8}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                        placeholder="Paste the job description here. Include required skills, qualifications, and responsibilities..."
                        required
                    />
                    <p className="mt-2 text-xs text-gray-400">
                        Tip: Include the complete job description for better analysis
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing Resume...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            Analyze Resume
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Analyzer;

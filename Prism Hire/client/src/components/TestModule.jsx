import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Loader2, BrainCircuit, PlayCircle, Star, Sparkles, CheckCircle2, ChevronDown, FileText, Send, Briefcase } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';
import CustomSelect from './CustomSelect';

const TestModule = ({ onViewSaved, isSidebarCollapsed, autoStartSaved, currentSession }) => {
    const { theme } = useTheme();
    // Standalone mode: Internal state management
    const [jobRole, setJobRole] = useState('Full Stack Developer');
    const [difficulty, setDifficulty] = useState('Medium');
    const [questionsCount, setQuestionsCount] = useState('20');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [started, setStarted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [testMode, setTestMode] = useState('random'); // 'random' or 'saved'

    const [loadingMore, setLoadingMore] = useState(false);

    // New State for Selection
    const [selectedQuestions, setSelectedQuestions] = useState({});
    const [saving, setSaving] = useState(false);
    const [hasAutoStarted, setHasAutoStarted] = useState(false);

    // Sync with session if active
    useEffect(() => {
        if (currentSession) {
            setJobRole(currentSession.jobRole);
        }
    }, [currentSession]);

    const handleTakeSavedTest = async (roleFilter = null) => {
        setLoading(true);
        setError(null);
        setData(null);
        setAnswers({});
        setSelectedQuestions({});
        setShowResults(false);
        setTestMode('saved');

        try {
            const params = {};
            if (currentSession) {
                params.sessionId = currentSession._id;
            }
            const res = await api.get('/saved-questions', { params });
            let questions = res.data;

            if (roleFilter && typeof roleFilter === 'string') {
                questions = questions.filter(q => q.jobRole === roleFilter);
            }

            if (questions.length === 0) {
                setError(roleFilter ? `No saved questions found for ${roleFilter}.` : "No saved questions found.");
                setStarted(false);
                return;
            }
            // Format saved questions to match the test data structure
            setData({
                testId: 'saved-' + Date.now(),
                title: roleFilter && typeof roleFilter === 'string' ? `${roleFilter} Assessment` : "Saved Questions Assessment",
                questions: questions.map((q, idx) => ({
                    id: q._id || idx,
                    text: q.text,
                    type: q.type,
                    options: q.options,
                    correctAnswer: q.correctAnswer
                }))
            });
            setStarted(true);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch saved questions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoStartSaved && !hasAutoStarted) {
            handleTakeSavedTest(typeof autoStartSaved === 'string' ? autoStartSaved : null);
            setHasAutoStarted(true);
        }
    }, [autoStartSaved]);

    const jobRoles = [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "DevOps Engineer",
        "Data Scientist",
        "Mobile Developer",
        "QA Engineer",
        "Product Manager"
    ];

    const difficulties = ["Entry Level", "Junior", "Medium", "Senior", "Expert"];
    const questionCounts = ["5", "10", "15", "20", "25"];

    const handleGenerate = async () => {
        if (!jobRole || !difficulty) return;

        setLoading(true);
        setError(null);
        setData(null);
        setAnswers({});
        setSelectedQuestions({});
        setShowResults(false);

        try {
            // Generate AI Questions with hardcoded defaults for missing session params
            const res = await api.post('/generate-test', {
                jobRole,
                difficulty,
                count: questionsCount,
                yearsOfExperience: currentSession?.yearsOfExperience || "3",
                topicsToFocus: currentSession?.topicsToFocus || "",
                jobDescription: currentSession?.jobDescription || ""
            });
            setData(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to generate assessment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            const res = await api.post('/generate-test', {
                jobRole,
                difficulty,
                count: 5,
                yearsOfExperience: currentSession?.yearsOfExperience || "3",
                topicsToFocus: currentSession?.topicsToFocus || "",
                jobDescription: currentSession?.jobDescription || ""
            });
            setData(prev => ({
                ...prev,
                questions: [...prev.questions, ...res.data.questions]
            }));
        } catch (err) {
            console.error(err);
            setError("Failed to load more questions.");
        } finally {
            setLoadingMore(false);
        }
    };

    const handleOptionSelect = (qId, option) => {
        if (showResults) return;
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const handleSubmit = () => {
        setShowResults(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isCorrect = (q, userAns) => {
        if (!userAns) return false;
        if (q.correctAnswer === userAns) return true;

        // Robust Fallback: Check for letter-based matches (A, B, C, D)
        if (q.correctAnswer && q.correctAnswer.length === 1 && q.options) {
            const idx = q.correctAnswer.toUpperCase().charCodeAt(0) - 65;
            if (q.options[idx] === userAns) return true;
        }
        return false;
    };

    const toggleSelection = (qId) => {
        setSelectedQuestions(prev => ({
            ...prev,
            [qId]: !prev[qId]
        }));
    };

    const handleSaveSelected = async () => {
        const questionsToSave = data.questions
            .filter(q => selectedQuestions[q.id || data.questions.indexOf(q)])
            .map(q => ({
                sessionId: currentSession?._id || null,
                jobRole: jobRole,
                difficulty,
                text: q.text,
                type: q.type,
                options: q.options,
                correctAnswer: q.correctAnswer
            }));

        if (questionsToSave.length === 0) return;

        setSaving(true);
        try {
            await api.post('/save-questions', { questions: questionsToSave });
            alert("Selected questions saved successfully!");
            setSelectedQuestions({}); // Clear selection after save
        } catch (err) {
            console.error(err);
            alert("Failed to save questions.");
        } finally {
            setSaving(false);
        }
    };
    if (!started) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <div className="max-w-6xl w-full space-y-12 animate-in fade-in zoom-in duration-700">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <BrainCircuit className="w-8 h-8 text-brand-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">AI Assessment <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-purple">Center</span></h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-medium">
                            Choose your preferred testing method to evaluate your technical skills.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Random AI Test Card */}
                        <div className="group relative bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 hover:border-brand-500/30 transition-all overflow-hidden shadow-2xl flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[60px] -mr-16 -mt-16"></div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">AI Power Test</h2>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                        Generate a completely fresh assessment using real-time AI. Customize the job role, difficulty, and question count.
                                    </p>
                                </div>

                                <ul className="space-y-3">
                                    {[
                                        "Real-time content generation",
                                        "Industry specific patterns",
                                        "Customizable difficulty",
                                        "Detailed explanations"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => { setTestMode('random'); setStarted(true); }}
                                className="w-full h-14 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 mt-8"
                            >
                                Generate AI Test
                                <PlayCircle className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Saved Questions Test Card */}
                        <div className="group relative bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 hover:border-indigo-500/30 transition-all overflow-hidden shadow-2xl flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] -mr-16 -mt-16"></div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                                        <Star className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Saved Assessment</h2>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                        Access your hand-picked question bank, organized by job roles. Focus your practice on specific career paths.
                                    </p>
                                </div>

                                <ul className="space-y-3">
                                    {[
                                        "Organized by Job Roles",
                                        "Role-specific practice",
                                        "Personalized question bank",
                                        "Manage & Delete items"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={onViewSaved}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 mt-8"
                            >
                                View Saved Questions
                                <Star className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 animate-in fade-in duration-500 pb-24">
            {/* Header */}
            <div className="mb-8 px-4 md:px-8 pt-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {testMode === 'random' ? 'Configure Assessment' : 'Saved Questions Assessment'}
                    </h1>
                    <p className="text-sm text-slate-500 max-w-4xl leading-relaxed">
                        {testMode === 'random' ? 'Customize your evaluation parameters to begin.' : 'Evaluating based on your saved question bank.'}
                    </p>
                </div>
                <button
                    onClick={() => { setStarted(false); setData(null); }}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-brand-500 hover:text-white transition-all shadow-sm"
                >
                    &larr; Back to Modes
                </button>
            </div>

            {/* Controls Bar - Only show for random mode */}
            {testMode === 'random' && (
                <div className="mx-4 md:mx-8 mb-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 transition-all shadow-xl">
                    <div className="flex flex-col lg:flex-row items-end gap-6">
                        <div className="flex-1 w-full space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="w-4 h-4 text-brand-500" />
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Role</label>
                            </div>
                            {currentSession ? (
                                <div className="h-12 px-5 flex items-center bg-slate-800/30 border border-brand-500/30 rounded-xl text-sm font-bold text-brand-400 shadow-sm cursor-not-allowed">
                                    {currentSession.jobRole}
                                    <div className="ml-auto flex items-center gap-2 px-2 py-1 bg-brand-500/10 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
                                        <span className="text-[9px] text-brand-500/80 uppercase tracking-wider font-extrabold">Session Locked</span>
                                    </div>
                                </div>
                            ) : (
                                <CustomSelect
                                    value={jobRole}
                                    onChange={setJobRole}
                                    options={jobRoles}
                                    className="h-12 pl-5 pr-4 bg-slate-800/30 border border-slate-700/50 rounded-xl text-sm font-bold text-white shadow-sm hover:border-brand-500/50 outline-none transition-all"
                                />
                            )}
                        </div>

                        <div className="w-full lg:w-48 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Difficulty</label>
                            <CustomSelect
                                value={difficulty}
                                onChange={setDifficulty}
                                options={difficulties}
                                className="h-12 pl-5 pr-4 bg-slate-800/50 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 shadow-sm hover:border-brand-500/50 hover:text-brand-500 outline-none transition-all"
                            />
                        </div>

                        <div className="w-full lg:w-48 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Questions</label>
                            <CustomSelect
                                value={questionsCount}
                                onChange={setQuestionsCount}
                                options={questionCounts.map(c => ({ value: c, label: `${c} Questions` }))}
                                className="h-12 pl-5 pr-4 bg-slate-800/50 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 shadow-sm hover:border-brand-500/50 hover:text-brand-500 outline-none transition-all"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!jobRole || loading}
                            className="w-full lg:w-auto px-8 h-12 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Generate Test
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="px-4 md:px-8">
                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl text-center mb-8">
                        {error}
                    </div>
                )}

                {!data && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-700">
                        <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-brand-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Ready to test your skills?</h2>
                        <p className="text-slate-400 max-w-sm font-medium">
                            Configure your test parameters above and click "Generate Test" to begin your AI powered assessment.
                        </p>
                    </div>
                )}

                {data && showResults && (
                    <div className="mx-4 md:mx-8 mb-10 p-10 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-[2.5rem] text-center animate-in zoom-in duration-500 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">Test Complete!</h2>
                            <div className="flex items-center justify-center gap-8 mb-8">
                                <div className="text-center">
                                    <div className="text-4xl font-black text-white">
                                        {data.questions.reduce((acc, q) => acc + (isCorrect(q, answers[q.id || data.questions.indexOf(q)]) ? 1 : 0), 0)} / {data.questions.length}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Correct Answers</div>
                                </div>
                                <div className="w-px h-12 bg-slate-800"></div>
                                <div className="text-center">
                                    <div className="text-4xl font-black text-white">
                                        {Math.round((data.questions.reduce((acc, q) => acc + (isCorrect(q, answers[q.id || data.questions.indexOf(q)]) ? 1 : 0), 0) / data.questions.length) * 100)}%
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Overall Score</div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                className="px-10 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-brand-500/20 transition-all inline-flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <PlayCircle className="w-4 h-4" />
                                Retake Assessment
                            </button>
                        </div>
                    </div>
                )}

                {data && (
                    <div className="space-y-8">
                        {data.questions?.map((q, idx) => {
                            const qKey = q.id || idx;
                            const userAnswer = answers[qKey];
                            const correctAns = q.correctAnswer;
                            const answerIsCorrect = isCorrect(q, userAnswer);

                            return (
                                <div key={qKey} className={`bg-slate-900/40 border rounded-[2rem] p-8 md:p-10 transition-all hover:border-brand-500/30 relative overflow-hidden shadow-2xl ${selectedQuestions[qKey] ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-800'} ${showResults ? (answerIsCorrect ? 'border-emerald-500/30' : 'border-red-500/30') : ''}`}>
                                    {/* Selection logic - Floating Checkbox */}
                                    <div className="absolute top-6 right-8">
                                        <label className="flex items-center gap-2 cursor-pointer group/save">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedQuestions[qKey]}
                                                onChange={() => toggleSelection(qKey)}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900 transition-all"
                                            />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover/save:text-slate-300 transition-colors">Select to Save</span>
                                        </label>
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/30 shadow-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 space-y-8">
                                            <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                                                {q.text}
                                            </h3>

                                            <div className="grid gap-4">
                                                {q.options?.map((opt, optIdx) => {
                                                    const isSelected = answers[qKey] === opt;

                                                    // Robust Correctness Check
                                                    let isOptionCorrect = q.correctAnswer === opt;
                                                    if (!isOptionCorrect && q.correctAnswer && q.correctAnswer.length === 1) {
                                                        isOptionCorrect = (optIdx === q.correctAnswer.toUpperCase().charCodeAt(0) - 65);
                                                    }

                                                    let btnClass = isSelected
                                                        ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500 shadow-xl shadow-brand-500/10'
                                                        : 'border-slate-800 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-900/50';

                                                    if (showResults) {
                                                        if (isOptionCorrect) {
                                                            btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-500/10";
                                                        } else if (isSelected) {
                                                            btnClass = "border-red-500 bg-red-500/10 text-red-400 ring-1 ring-red-500/50 shadow-lg shadow-red-500/10";
                                                        } else {
                                                            btnClass = "border-slate-800 opacity-40 cursor-not-allowed";
                                                        }
                                                    }

                                                    return (
                                                        <button
                                                            key={optIdx}
                                                            onClick={() => handleOptionSelect(qKey, opt)}
                                                            disabled={showResults}
                                                            className={`group relative flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${btnClass}`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-brand-500' : 'border-slate-700 group-hover:border-slate-600'} ${showResults && isOptionCorrect ? 'border-emerald-500' : ''}`}>
                                                                {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${showResults ? (isOptionCorrect ? 'bg-emerald-500' : 'bg-red-500') : 'bg-brand-500'}`} />}
                                                                {!isSelected && showResults && isOptionCorrect && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                                            </div>
                                                            <span className={`text-[15px] font-semibold transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'} ${showResults && isOptionCorrect ? 'text-emerald-400 font-bold' : ''}`}>
                                                                <span className="mr-3 text-slate-500 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                                                {opt}
                                                            </span>

                                                            {showResults && isOptionCorrect && (
                                                                <div className="ml-auto bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> Correct Answer
                                                                </div>
                                                            )}
                                                            {showResults && isSelected && !isOptionCorrect && (
                                                                <div className="ml-auto bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full border border-red-500/30">
                                                                    Your Choice
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Load More Button - Only for random mode */}
                        {!showResults && testMode === 'random' && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="flex items-center gap-2 px-8 py-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl font-bold text-sm hover:border-brand-500 hover:text-brand-500 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl"
                                >
                                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                                    Generate 5 More Questions
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sticky Submission Bar */}
            {data && (
                <div className={`fixed bottom-0 ${isSidebarCollapsed ? 'left-0' : 'left-64'} right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/50 p-4 z-40 transition-all duration-500 px-8`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                Answered: <span className="text-white">{Object.keys(answers).length}</span> / {data.questions?.length}
                            </span>
                            <div className="hidden md:block w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-500 transition-all duration-500"
                                    style={{ width: `${(Object.keys(answers).length / data.questions?.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveSelected}
                                disabled={!Object.values(selectedQuestions).some(v => v) || saving}
                                className="h-11 px-6 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                                Save Selected
                            </button>
                            {!showResults && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={Object.keys(answers).length === 0}
                                    className="h-11 px-8 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                    Submit Assessment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TestModule;

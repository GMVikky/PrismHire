import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Loader2, Trash2, CheckCircle2, XCircle, Star, BrainCircuit, PlayCircle, Briefcase } from 'lucide-react';

const SavedQuestions = ({ onTakeTest, currentSession }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSavedQuestions();
    }, [currentSession]);

    const fetchSavedQuestions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (currentSession) {
                params.sessionId = currentSession._id;
            }
            const res = await api.get('/saved-questions', { params });
            setQuestions(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch saved questions.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        // We need a delete route in server.js. Let's assume it exists or I'll add it.
        // For now, let's just implement the UI and I'll add the route later if needed.
        try {
            await api.delete(`/saved-questions/${id}`);
            setQuestions(prev => prev.filter(q => q._id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete question.");
        }
    };

    // Group questions by job role
    const groupedQuestions = questions.reduce((acc, q) => {
        const role = q.jobRole || 'General';
        if (!acc[role]) acc[role] = [];
        acc[role].push(q);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-3">Saved Question <span className="text-brand-500">Bank</span></h1>
                    <p className="text-sm text-slate-500 max-w-2xl font-medium">
                        Your personalized collection of assessment items, organized by role.
                    </p>
                </div>
                {questions.length > 0 && (
                    <button
                        onClick={() => onTakeTest(null)} // Take all
                        className="px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-500/20 transition-all flex items-center gap-3 transform hover:-translate-y-1 active:translate-y-0"
                    >
                        <PlayCircle className="w-5 h-5" />
                        Take Master Test
                    </button>
                )}
            </div>

            <div className="space-y-16">
                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl text-center">
                        {error}
                    </div>
                )}

                {questions.length === 0 ? (
                    <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center">
                            <Star className="w-10 h-10 text-slate-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white">No saved questions yet</h2>
                            <p className="text-slate-500 max-w-xs font-medium">Questions you save during assessments will appear here organized by their job roles.</p>
                        </div>
                    </div>
                ) : (
                    Object.entries(groupedQuestions).map(([role, roleQuestions]) => (
                        <div key={role} className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{role}</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{roleQuestions.length} Saved Questions</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onTakeTest(role)}
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-brand-500 transition-all flex items-center gap-2"
                                >
                                    <PlayCircle className="w-4 h-4" />
                                    Practice Role
                                </button>
                            </div>

                            <div className="grid gap-6">
                                {roleQuestions.map((q, idx) => (
                                    <div key={q._id || idx} className="bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-8 md:p-10 transition-all hover:border-brand-500/30 relative overflow-hidden group shadow-2xl">
                                        <div className="absolute top-8 right-10">
                                            <button
                                                onClick={() => handleDelete(q._id)}
                                                className="p-2.5 text-slate-600 hover:text-red-500 transition-colors bg-slate-950/50 rounded-xl border border-slate-800 hover:border-red-500/30"
                                                title="Remove from bank"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex gap-8">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-slate-950 text-indigo-400 font-black flex items-center justify-center text-sm border border-slate-800 shadow-xl">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 space-y-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                            {q.difficulty}
                                                        </span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                                                            {q.type}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white leading-relaxed max-w-4xl">
                                                        {q.text}
                                                    </h3>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {q.options?.map((opt, optIdx) => {
                                                        const isCorrect = q.correctAnswer === opt;
                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                className={`p-5 rounded-2xl border transition-all flex items-center justify-between group/opt ${isCorrect
                                                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5'
                                                                    : 'bg-slate-950/30 border-slate-800/40 text-slate-500'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <span className={`text-[11px] font-black ${isCorrect ? 'text-emerald-400' : 'text-slate-700'}`}>{String.fromCharCode(65 + optIdx)}</span>
                                                                    <span className="text-[14px] font-semibold tracking-tight">{opt}</span>
                                                                </div>
                                                                {isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SavedQuestions;

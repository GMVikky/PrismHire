import { useState, useEffect } from 'react';
import { Plus, Trash2, Code2, Briefcase, FileText, Layers, X, Loader2 } from 'lucide-react';
import api from '../lib/api';

const SessionsModule = ({ onSelectSession, forceCreate = false }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(forceCreate); // Open immediately if forced
    const [formData, setFormData] = useState({
        sessionName: '',
        jobRole: '',
        topicsToFocus: '', // Tech Stack
        jobDescription: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    // Auto-open modal if forceCreate is true
    useEffect(() => {
        if (forceCreate) {
            setShowModal(true);
        }
    }, [forceCreate]);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/sessions');
            setSessions(res.data);
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
            setError("Failed to load sessions.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await api.post('/sessions', formData);
            setSessions([res.data, ...sessions]);
            setShowModal(false);
            setFormData({ sessionName: '', jobRole: '', topicsToFocus: '', jobDescription: '' });
        } catch (err) {
            console.error("Failed to create session:", err);
            setError(err.response?.data?.message || "Failed to create session.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSession = async (e, id) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm("Are you sure you want to delete this session?")) return;

        try {
            await api.delete(`/sessions/${id}`);
            setSessions(sessions.filter(s => s._id !== id));
        } catch (err) {
            console.error("Failed to delete session:", err);
            setError("Failed to delete session.");
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Sessions</h1>
                    <p className="text-slate-400">Manage your interview preparation workspaces</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white rounded-xl transition-all shadow-lg shadow-brand-500/20 font-medium"
                >
                    <Plus size={20} />
                    <span>New Session</span>
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl">
                    {error}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center">
                        <Layers className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-lg font-medium text-slate-400">No sessions found</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-brand-400 hover:text-brand-300 font-medium hover:underline"
                    >
                        Create your first session
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 overflow-y-auto pr-2 custom-scrollbar">
                    {sessions.map((session) => (
                        <div
                            key={session._id}
                            className="group relative bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 hover:border-brand-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 cursor-pointer flex flex-col"
                            onClick={async () => {
                                try {
                                    // Call activation API
                                    const res = await api.put(`/sessions/${session._id}/activate`);

                                    // Update local sessions state to reflect the change
                                    setSessions(sessions.map(s => ({
                                        ...s,
                                        isActive: s._id === session._id
                                    })));

                                    // Call parent callback with activated session
                                    if (onSelectSession) {
                                        onSelectSession(res.data);
                                    }
                                } catch (err) {
                                    console.error("Failed to activate session:", err);
                                    setError("Failed to activate session.");
                                }
                            }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-brand-500/10 rounded-xl group-hover:bg-brand-500/20 transition-colors">
                                    <Briefcase className="w-6 h-6 text-brand-400" />
                                </div>
                                <button
                                    onClick={(e) => handleDeleteSession(e, session._id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-300 transition-colors line-clamp-1">
                                {session.sessionName}
                            </h3>

                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Briefcase size={16} />
                                    <span className="font-medium">{session.jobRole}</span>
                                </div>
                                {session.topicsToFocus && (
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Code2 size={16} />
                                        <span className="truncate">{session.topicsToFocus}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-medium">
                                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                <span className={`px-2 py-1 rounded-md ${session.isActive ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                                    {session.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white">Create New Session</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSession} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5 ">
                                    Session Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
                                    placeholder="e.g. Frontend Master Prep"
                                    value={formData.sessionName}
                                    onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                    Job Role <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
                                    placeholder="e.g. Senior React Developer"
                                    value={formData.jobRole}
                                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                    Tech Stack (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
                                    placeholder="e.g. React, Node.js, TypeScript"
                                    value={formData.topicsToFocus}
                                    onChange={(e) => setFormData({ ...formData, topicsToFocus: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                    Job Description (Optional)
                                </label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600 min-h-[100px] resize-none"
                                    placeholder="Paste the JD here to tailor the session..."
                                    value={formData.jobDescription}
                                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <span>Create Session</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionsModule;

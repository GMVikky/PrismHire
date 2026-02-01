import { useState, useEffect } from 'react';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';
import TestModule from '../components/TestModule';
import SavedQuestions from '../components/SavedQuestions';
import AIHubModule from '../components/AI_HUB/AIHubModule';
import InterviewerModule from '../components/Interviewer/InterviewerModule';
import ResumeAnalyzerModule from '../components/ResumeAnalyzer/ResumeAnalyzerModule';
import SessionsModule from '../components/SessionsModule';
import { Construction } from 'lucide-react';

// ... imports

const Dashboard = () => {
    const [activeModule, setActiveModule] = useState('test');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [autoStartSaved, setAutoStartSaved] = useState(null); // null, true, or role name

    // New Session State
    const [currentSession, setCurrentSession] = useState(null);
    const [hasSessions, setHasSessions] = useState(true); // Track if user has any sessions
    const [sessionsLoading, setSessionsLoading] = useState(true);

    // Fetch active session on mount
    useEffect(() => {
        const fetchActiveSession = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await api.get('/sessions');

                // Check if user has any sessions
                if (response.data.length === 0) {
                    setHasSessions(false);
                    setActiveModule('sessions'); // Force redirect to sessions module
                } else {
                    setHasSessions(true);
                    // Find the active session
                    const activeSession = response.data.find(session => session.isActive);
                    if (activeSession) {
                        setCurrentSession(activeSession);
                    }
                }
            } catch (error) {
                console.error('Error fetching active session:', error);
            } finally {
                setSessionsLoading(false);
            }
        };

        fetchActiveSession();
    }, []);

    const handleSwitchModule = (moduleId) => {
        // Prevent navigation away from sessions if no sessions exist
        if (!hasSessions && moduleId !== 'sessions') {
            return;
        }
        setActiveModule(moduleId);
        setAutoStartSaved(null);
    };

    const handleSessionCreated = (session) => {
        setCurrentSession(session);
        setHasSessions(true);
        setActiveModule('test'); // Redirect to test module after session creation
    };

    return (
        <div className="min-h-screen bg-slate-950 flex transition-all duration-500 relative overflow-hidden">
            {/* Global Background Glows */}
            <div className="fixed inset-0 pointer-events-none -z-0">
                <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            <Sidebar
                currentModule={activeModule}
                setModule={handleSwitchModule}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                currentSession={currentSession}
                hasSessions={hasSessions}
            />

            {/* Full viewport modules (Interview & Resume) */}
            {(activeModule === 'resume' || activeModule === 'interview') && (
                <main className={`flex-1 min-h-screen relative transition-all duration-500 ${isSidebarCollapsed ? 'ml-0' : 'ml-64'}`}>
                    {activeModule === 'interview' ? (
                        <InterviewerModule currentSession={currentSession} />
                    ) : (
                        <ResumeAnalyzerModule currentSession={currentSession} />
                    )}
                </main>
            )}

            {/* Standard modules with sidebar margin and padding */}
            {!(activeModule === 'resume' || activeModule === 'interview') && (
                <main className={`flex-1 ${isSidebarCollapsed ? 'ml-0' : 'ml-64'} min-h-screen relative transition-all duration-500`}>
                    <div className={`py-8 lg:py-12 ${isSidebarCollapsed ? 'px-6 md:px-20' : 'px-8 md:px-12 lg:px-5'} overflow-y-auto h-screen`}>

                        {/* Session Indicator if active */}
                        {currentSession && activeModule !== 'sessions' && (
                            <div className="mb-6 flex items-center justify-between bg-slate-900/50 border border-brand-500/20 rounded-xl p-4 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Session</p>
                                        <h3 className="text-white font-bold text-sm tracking-tight">{currentSession.sessionName} <span className="text-slate-600">|</span> <span className="text-brand-400">{currentSession.jobRole}</span></h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveModule('sessions')}
                                    className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
                                >
                                    Change
                                </button>
                            </div>
                        )}

                        {activeModule === 'test' ? (
                            <TestModule
                                onViewSaved={() => handleSwitchModule('saved')}
                                isSidebarCollapsed={isSidebarCollapsed}
                                autoStartSaved={autoStartSaved}
                                currentSession={currentSession}
                            />
                        ) : activeModule === 'saved' ? (
                            <SavedQuestions
                                onTakeTest={(role) => { setAutoStartSaved(role || true); setActiveModule('test'); }}
                                currentSession={currentSession}
                            />
                        ) : activeModule === 'ai-hub' ? (
                            <AIHubModule />
                        ) : activeModule === 'sessions' ? (
                            <SessionsModule
                                onSelectSession={handleSessionCreated}
                                forceCreate={!hasSessions}
                            />
                        ) : (
                            <div className="h-[70vh] flex flex-col items-center justify-center text-slate-500 space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <Construction className="w-10 h-10 text-brand-500" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h2 className="text-xl font-bold text-white">Module Unavailable</h2>
                                    <p className="text-sm text-slate-500 max-w-xs font-medium">Only the Test Module is available in this version.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            )}
        </div>
    );
};
export default Dashboard;

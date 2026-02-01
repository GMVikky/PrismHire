import { useAuth } from '../context/AuthContext';
import {
    BrainCircuit,
    LogOut,
    ChevronLeft,
    Star,
    Sparkles,
    Mic,
    FileText
} from 'lucide-react';

const Sidebar = ({ currentModule, setModule, isCollapsed, setIsCollapsed, currentSession, hasSessions = true }) => {
    const { user, logout } = useAuth();

    const navItems = [
        { id: 'ai-hub', label: 'AI Hub', icon: Sparkles },
        { id: 'test', label: 'Test Module', icon: BrainCircuit },
        { id: 'resume', label: 'Resume ATS', icon: FileText },
        { id: 'interview', label: 'Interview', icon: Mic },
    ];

    const normalizedModule = currentModule === 'saved' ? 'test' : currentModule;
    const activeItem = navItems.find(item => item.id === normalizedModule);
    const ActiveIcon = activeItem ? activeItem.icon : BrainCircuit;

    return (
        <div
            onClick={() => isCollapsed && setIsCollapsed(false)}
            className={`transition-all duration-700 ease-in-out fixed left-0 top-0 z-50 flex flex-col 
            ${isCollapsed
                    ? 'w-16 h-16 m-4 rounded-full cursor-pointer hover:scale-110 shadow-xl border-brand-500/20'
                    : 'w-64 h-screen rounded-none shadow-2xl'
                } 
            bg-slate-900 border-r border-slate-800/50 overflow-hidden group`}
        >
            {/* Morphing Header / Logo */}
            <div className={`flex items-center transition-all duration-500 ${isCollapsed ? 'opacity-0 h-0 p-0' : 'p-6 justify-between'}`}>
                <div className="flex items-center gap-3">
                    <img
                        src="/prism-hire-logo.png"
                        alt="PRISM HIRE Logo"
                        className="w-8 h-8 object-contain"
                    />
                    <span className="text-white font-black tracking-tighter text-lg">PRISM HIRE</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCollapsed(true);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-brand-500 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>

            {/* Profile Picture / Active Icon - The Anchor for Morphing */}
            <div className={`flex flex-col items-center transition-all duration-700 ${isCollapsed ? 'p-0 w-full h-full justify-center' : 'px-6 py-10'}`}>
                <div className={`rounded-full overflow-hidden transition-all duration-700 flex items-center justify-center
                    ${isCollapsed
                        ? 'w-12 h-12 bg-brand-500 text-white shadow-lg shadow-brand-500/40'
                        : 'w-20 h-20 bg-gradient-to-br from-[#818CF8] to-[#C084FC] border-2 border-slate-800 mb-4'}`}
                >
                    {isCollapsed ? (
                        <ActiveIcon className="w-6 h-6 animate-in zoom-in duration-500" />
                    ) : (
                        user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover animate-in fade-in duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold animate-in fade-in duration-500">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )
                    )}
                </div>
                {!isCollapsed && (
                    <div className="text-center animate-in fade-in slide-in-from-top-2 duration-500 w-full px-4">
                        <button
                            onClick={() => setModule('sessions')}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-center shadow-sm hover:bg-slate-800 hover:border-brand-500/50 transition-all cursor-pointer group/profile"
                        >
                            <div className="flex flex-col items-center justify-center gap-0.5 text-white font-bold text-sm group-hover/profile:text-brand-400 transition-colors">
                                <span className="truncate max-w-[150px]">
                                    {currentSession ? currentSession.sessionName : (user?.name || "User")}
                                </span>
                                {currentSession && (
                                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold">Active Session</span>
                                )}
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation - Hidden when collapsed */}
            <div className={`flex-1 px-4 space-y-2 overflow-y-auto transition-all duration-500 ${isCollapsed ? 'opacity-0 pointer-events-none translate-x-[-20px]' : 'opacity-100'}`}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setModule(item.id)}
                        disabled={!hasSessions}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${!hasSessions
                                ? 'opacity-40 cursor-not-allowed text-slate-600'
                                : (normalizedModule === item.id)
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-brand-500'
                            }`}
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span className="font-bold text-[14px] tracking-tight whitespace-nowrap">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Bottom Actions - Hidden when collapsed */}
            <div className={`p-4 border-t border-slate-800/50 transition-all duration-500 ${isCollapsed ? 'opacity-0 h-0 p-0' : 'opacity-100'}`}>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500/80 transition-all font-bold text-[13px]"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};
export default Sidebar;

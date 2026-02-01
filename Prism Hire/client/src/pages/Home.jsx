import AuthForm from '../components/AuthForm';

const Home = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[400px] -left-[200px] w-[1000px] h-[1000px] rounded-full bg-brand-500/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-200px] right-[-200px] w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse delay-700" />
            </div>

            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 items-center">
                <div className="space-y-8 text-center lg:text-left">
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                        Build Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Technical Legacy</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        The ultimate platform for developer assessments. Secure, fast, and built with modern aesthetics.
                        Start your journey today by accessing our premium modules.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start opacity-80">
                        <div className="px-5 py-2.5 bg-slate-900/60 backdrop-blur-md rounded-full shadow-sm border border-slate-800 flex items-center gap-2 text-sm font-medium text-slate-300">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Enterprise Security
                        </div>
                        <div className="px-5 py-2.5 bg-slate-900/60 backdrop-blur-md rounded-full shadow-sm border border-slate-800 flex items-center gap-2 text-sm font-medium text-slate-300">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            React Powered
                        </div>
                    </div>
                </div>

                <div className="flex justify-center w-full">
                    <AuthForm />
                </div>
            </div>
        </div>
    )
}
export default Home;

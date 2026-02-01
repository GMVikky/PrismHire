import { useState } from 'react';
import Analyzer from './Analyzer';
import Results from './Results';

const ResumeAnalyzerModule = ({ currentSession }) => {
    const [view, setView] = useState('analyzer'); // 'analyzer' or 'results'
    const [results, setResults] = useState(null);

    const handleAnalysisComplete = (data) => {
        setResults(data);
        setView('results');
    };

    const handleReset = () => {
        setResults(null);
        setView('analyzer');
    };

    return (
        <div className="w-full h-screen overflow-y-auto custom-scrollbar bg-slate-900/50">
            {view === 'analyzer' ? (
                <div className="flex flex-col items-center justify-center min-h-full">
                    <Analyzer onAnalysisComplete={handleAnalysisComplete} currentSession={currentSession} />
                </div>
            ) : (
                <Results results={results} onReset={handleReset} />
            )}
        </div>
    );
};

export default ResumeAnalyzerModule;

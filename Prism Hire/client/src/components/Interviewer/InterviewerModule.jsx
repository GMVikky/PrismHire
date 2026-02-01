import React, { useState } from 'react';
import SetupPage from './Setup/SetupPage';
import InterviewLayout from './Interview/InterviewLayout';
import FeedbackPage from './Feedback/FeedbackPage';
import './interviewer.css';

const InterviewerModule = ({ currentSession }) => {
    const [screen, setScreen] = useState('setup'); // 'setup' | 'interview' | 'feedback'
    const [interviewConfig, setInterviewConfig] = useState(null);
    const [feedbackData, setFeedbackData] = useState(null);

    const handleStartInterview = (config) => {
        setInterviewConfig(config);
        setScreen('interview');
    };

    const handleEndInterview = (data) => {
        setFeedbackData(data);
        setScreen('feedback');
    };

    const handleRestart = () => {
        setScreen('setup');
        setInterviewConfig(null);
        setFeedbackData(null);
    };

    return (
        <div className="h-full w-full overflow-hidden text-slate-100 bg-slate-950">
            {screen === 'setup' && <SetupPage onStartInterview={handleStartInterview} currentSession={currentSession} />}
            {screen === 'interview' && (
                <InterviewLayout
                    config={interviewConfig}
                    onExit={handleEndInterview}
                />
            )}
            {screen === 'feedback' && (
                <FeedbackPage
                    feedbackData={feedbackData}
                    onRestart={handleRestart}
                />
            )}
        </div>
    );
};

export default InterviewerModule;

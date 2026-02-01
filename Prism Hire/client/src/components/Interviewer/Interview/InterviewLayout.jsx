import React, { useState, useEffect, useRef } from 'react';
import VideoStage from './VideoStage';
import DashboardPanel from './DashboardPanel';
import ControlBar from './ControlBar';

import useSpeechRecognition from '../../../hooks/useSpeechRecognition';
import useSpeechSynthesis from '../../../hooks/useSpeechSynthesis';
import useGemini from '../../../hooks/useGemini';

const InterviewLayout = ({ config, onExit }) => {
    const [messages, setMessages] = useState([
        { text: "Hello! I've reviewed your profile for the " + (config?.role || "position") + " role. To begin, could you please briefly introduce yourself and tell me about your relevant experience?", sender: 'bot' }
    ]);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [timeLeft, setTimeLeft] = useState((config?.duration || 15) * 60); // in seconds
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

    const {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        error: speechError
    } = useSpeechRecognition();

    const { speak, isSpeaking, cancel } = useSpeechSynthesis();
    // Initialize Gemini with the config context
    const { generateResponse, generateFeedback, loading: isThinking, error: aiError } = useGemini(config);

    const silenceTimer = useRef(null);
    const wasSpeakingRef = useRef(false);

    // Timer Logic
    useEffect(() => {
        const timerCallback = () => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleEndInterview(); // Time's up
                    return 0;
                }
                return prev - 1;
            });
        };
        const timerId = setInterval(timerCallback, 1000);
        return () => clearInterval(timerId);
    }, []);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Auto-start: Speak the greeting
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 10;

        const trySpeak = () => {
            if (attempts >= maxAttempts) {
                // If speech fails (e.g. browser blocked), just start listening
                startListening();
                return;
            }

            const greeting = messages[0].text;

            // Attempt to speak
            if (window.speechSynthesis.getVoices().length > 0) {
                speak(greeting);
                // Double check if speaking actually started after a tiny delay
                setTimeout(() => {
                    if (!window.speechSynthesis.speaking) {
                        attempts++;
                        setTimeout(trySpeak, 300);
                    }
                }, 100);
            } else {
                // Voices not loaded yet, wait a bit
                attempts++;
                setTimeout(trySpeak, 300);
            }
        };

        // Start trying
        const timer = setTimeout(trySpeak, 500);
        return () => clearTimeout(timer);
    }, []);

    // Stop listening when AI starts speaking
    useEffect(() => {
        if (isSpeaking && isListening) {
            stopListening();
        }
    }, [isSpeaking, isListening, stopListening]);

    // Silence Detection (1 second)
    useEffect(() => {
        if (isListening && (transcript || interimTranscript)) {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            silenceTimer.current = setTimeout(() => {
                stopListening();
            }, 3000);
        }
        return () => {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
        };
    }, [isListening, transcript, interimTranscript, stopListening]);

    // Auto-resume listening after AI finishes speaking
    useEffect(() => {
        if (wasSpeakingRef.current && !isSpeaking) {
            setTimeout(() => {
                startListening();
            }, 500);
        }
        wasSpeakingRef.current = isSpeaking;
    }, [isSpeaking, startListening]);

    // Handle User Voice Input
    useEffect(() => {
        if (!isListening && (transcript.trim().length > 0 || interimTranscript.trim().length > 0)) {
            const userMessage = (transcript + interimTranscript).trim();
            if (userMessage) {
                handleUserMessage(userMessage);
                resetTranscript();
            }
        }
    }, [isListening, transcript, interimTranscript, resetTranscript]);

    const handleUserMessage = async (text) => {
        if (isSpeaking || isThinking || isGeneratingFeedback) return;

        addMessage(text, 'user');
        const aiResponse = await generateResponse(text);
        addMessage(aiResponse, 'bot');
        speak(aiResponse);
    };

    const addMessage = (text, sender) => {
        setMessages(prev => [...prev, { text, sender }]);
    };

    const handleMicToggle = () => {
        if (isListening) {
            stopListening();
        } else {
            cancel();
            startListening();
        }
    };

    const handleCameraToggle = () => {
        setIsCameraOn(prev => !prev);
    };

    const handleEndInterview = async () => {
        // Prevent double trigger
        if (isGeneratingFeedback) return;

        setIsGeneratingFeedback(true);
        cancel(); // Stop speaking
        stopListening();
        setIsCameraOn(false);

        // Generate Feedback
        const feedback = await generateFeedback();

        if (onExit) {
            onExit(feedback);
        }
    };

    const handleManualSend = () => {
        stopListening();
    };

    if (isGeneratingFeedback) {
        return (
            <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(255,255,255,0.1)',
                    borderTopColor: 'var(--pk-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <h2 style={{ color: 'white', fontWeight: 600 }}>Analyzing Interview...</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Generating performance report.</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="interview-layout" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            maxWidth: '1600px',
            margin: '0 auto',
            padding: '1.5rem',
            gap: '1.5rem',
            position: 'relative'
        }}>

            {/* Timer Badge */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '2rem',
                background: timeLeft < 300 ? '#ef4444' : 'rgba(255,255,255,0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '99px',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: timeLeft < 60 ? 'pulse 1s infinite' : 'none'
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {formatTime(timeLeft)}
            </div>

            {/* Main Split Area */}
            <div style={{ flex: 1, display: 'flex', gap: '1.5rem', minHeight: 0, position: 'relative' }}>

                {/* Start Hint Overlay */}
                {!isListening && !isSpeaking && messages.length <= 1 && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none' // Let clicks pass through to controls if needed, but mostlyvisual
                    }}>
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(8px)',
                            padding: '2rem 3rem',
                            borderRadius: '24px',
                            border: '1px solid var(--pk-primary)',
                            textAlign: 'center',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            animation: 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'white' }}>Tap Microphone to Start</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                Auto-start blocked? Click the mic button below to begin.
                            </p>
                            <style>{`
                                @keyframes bounceIn {
                                    from { opacity: 0; transform: scale(0.8); }
                                    to { opacity: 1; transform: scale(1); }
                                }
                           `}</style>
                        </div>
                    </div>
                )}

                {/* Left: Video Stage */}
                <VideoStage
                    isSpeaking={isSpeaking}
                    isThinking={isThinking}
                    isCameraOn={isCameraOn}
                />

                {/* Right: Dashboard */}
                <DashboardPanel
                    messages={messages}
                    transcript={transcript || interimTranscript}
                    isListening={isListening}
                    onManualSend={handleManualSend}
                />
            </div>

            {/* Bottom: Controls */}
            <ControlBar
                isListening={isListening}
                onMicToggle={handleMicToggle}
                onEndInterview={handleEndInterview} // This now triggers async feedback
                isThinking={isThinking}
                isCameraOn={isCameraOn}
                onCameraToggle={handleCameraToggle}
            />
        </div>
    );
};

export default InterviewLayout;

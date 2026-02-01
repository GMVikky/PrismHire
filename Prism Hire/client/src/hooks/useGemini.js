import { useState, useCallback, useEffect } from 'react';

// Now pointing to our local backend
const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/interviewer';

const useGemini = (config = null) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessionId, setSessionId] = useState(null);

    // Initialize session when config provided
    useEffect(() => {
        if (!config) return;

        const initSession = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/start-chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ config })
                });
                const data = await res.json();
                if (data.sessionId) {
                    setSessionId(data.sessionId);
                } else {
                    console.error("No Session ID returned");
                }
            } catch (err) {
                console.error("Failed to start session:", err);
                setError("Failed to connect to AI server. ensure backend is running.");
            }
        };

        initSession();
    }, [config]);

    const generateResponse = useCallback(async (message) => {
        if (!sessionId) {
            return "Error: AI Session not established. Check backend connection.";
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, message })
            });

            if (!res.ok) throw new Error("Backend request failed");

            const data = await res.json();
            setLoading(false);
            return data.text;
        } catch (err) {
            console.error("Chat Error:", err);
            setError("Connection Error");
            setLoading(false);
            return "Error: I'm having trouble connecting to my brain server right now.";
        }
    }, [sessionId]);

    const generateFeedback = useCallback(async () => {
        if (!sessionId) return null;

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });

            const data = await res.json();
            setLoading(false);
            return data;

        } catch (err) {
            console.error("Feedback Generation Error:", err);
            setLoading(false);
            return {
                score: 0,
                summary: "Connection error during feedback generation.",
                strengths: [],
                weaknesses: [],
                resources: []
            };
        }
    }, [sessionId]);

    return { generateResponse, generateFeedback, loading, error };
};

export default useGemini;

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch sessions when user logs in
    useEffect(() => {
        if (user) {
            fetchSessions();
        } else {
            setSessions([]);
            setActiveSession(null);
        }
    }, [user]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/sessions');
            setSessions(res.data);
            const active = res.data.find(s => s.isActive);
            setActiveSession(active || null);
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
            setError("Failed to load sessions.");
        } finally {
            setLoading(false);
        }
    };

    const createSession = async (sessionData) => {
        setLoading(true);
        try {
            const res = await api.post('/sessions', sessionData);
            setSessions(prev => [res.data, ...prev]);
            setActiveSession(res.data); // Newly created session is active
            return res.data;
        } catch (err) {
            console.error("Failed to create session:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const switchSession = async (sessionId) => {
        // Optimistic update
        const targetSession = sessions.find(s => s._id === sessionId);
        if (targetSession) {
            setActiveSession(targetSession);
        }
    };

    const deleteSession = async (sessionId) => {
        try {
            await api.delete(`/sessions/${sessionId}`);
            setSessions(prev => prev.filter(s => s._id !== sessionId));
            if (activeSession?._id === sessionId) {
                setActiveSession(null);
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
            throw err;
        }
    };

    return (
        <SessionContext.Provider value={{
            sessions,
            activeSession,
            loading,
            error,
            createSession,
            switchSession,
            deleteSession,
            refreshSessions: fetchSessions
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

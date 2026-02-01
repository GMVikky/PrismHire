import React from 'react';

const DashboardPanel = ({ messages, transcript, isListening, onManualSend }) => {
    return (
        <div className="dashboard-panel" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            height: '100%',
            maxWidth: '450px',
            minWidth: '350px'
        }}>
            {/* Header Card */}
            <div className="card-surface" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Live Session</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Senior Frontend Developer</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ height: '8px', width: '8px', background: 'var(--pk-red)', borderRadius: '50%', boxShadow: '0 0 8px var(--pk-red)' }}></span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pk-red)', fontWeight: 500 }}>REC</span>
                </div>
            </div>

            {/* Transcript / Chat History */}
            <div className="card-surface" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1rem', borderBottom: 'var(--glass-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    TRANSCRIPT
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '100%',
                            background: msg.sender === 'user' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                {msg.sender === 'user' ? 'You' : 'AI Interviewer'}
                            </div>
                            <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{msg.text}</div>
                        </div>
                    ))}
                    {isListening && transcript && (
                        <div style={{ alignSelf: 'flex-end', opacity: 0.8, fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '2px solid var(--pk-primary)', paddingLeft: '0.5rem' }}>
                            {transcript}...
                        </div>
                    )}
                </div>

                {/* Send Button Area - Only visible when listening and has transcript */}
                {isListening && transcript && (
                    <div style={{ padding: '1rem', borderTop: 'var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={onManualSend}
                            style={{
                                background: 'var(--pk-green)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                color: 'white',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            Send Response
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPanel;

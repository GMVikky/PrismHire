import React from 'react';

const FeedbackPage = ({ feedbackData, onRestart }) => {
    if (!feedbackData) return <div className="flex-center" style={{ height: '100vh' }}>Loading Feedback...</div>;

    const { score, summary, strengths, weaknesses, resources } = feedbackData;

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            overflowY: 'auto',
            background: 'var(--bg-dark)',
            padding: '2rem 1rem',
            display: 'block'
        }}>
            <div className="flex-center" style={{ minHeight: '100%', paddingBottom: '2rem', flexDirection: 'column', gap: '2rem' }}>

                {/* Header Card */}
                <div className="card-surface" style={{
                    width: '100%',
                    maxWidth: '800px',
                    padding: '2rem',
                    textAlign: 'center',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white' }}>Interview Performance</h1>

                    {/* Score Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--pk-primary), var(--pk-accent))',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        margin: '1.5rem 0',
                        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.5)',
                        border: '4px solid rgba(255,255,255,0.2)'
                    }}>
                        {score || 0}
                    </div>

                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {summary}
                    </p>
                </div>

                {/* Grid for Strengths & Weaknesses */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '1.5rem',
                    width: '100%',
                    maxWidth: '800px'
                }}>
                    {/* Strengths */}
                    <div className="card-surface" style={{ padding: '2rem', borderTop: '4px solid var(--pk-green)' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--pk-green)' }}>💪</span> Key Strengths
                        </h2>
                        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {strengths?.map((item, i) => (
                                <li key={i} style={{ color: 'var(--text-primary)' }}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="card-surface" style={{ padding: '2rem', borderTop: '4px solid var(--pk-red)' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--pk-red)' }}>🎯</span> Areas for Improvement
                        </h2>
                        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {weaknesses?.map((item, i) => (
                                <li key={i} style={{ color: 'var(--text-primary)' }}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Recommended Resources */}
                <div className="card-surface" style={{
                    width: '100%',
                    maxWidth: '800px',
                    padding: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--pk-primary)' }}>📚</span> Recommended Learning Resources
                    </h2>
                    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {resources?.map((res, i) => (
                            <li key={i} style={{ color: 'var(--text-primary)' }}>
                                {res}
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={onRestart}
                    style={{
                        padding: '1rem 3rem',
                        borderRadius: '99px',
                        background: 'white',
                        color: 'var(--pk-navy)',
                        border: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                        marginTop: '1rem'
                    }}
                >
                    Start New Interview
                </button>

            </div>
        </div>
    );
};

export default FeedbackPage;

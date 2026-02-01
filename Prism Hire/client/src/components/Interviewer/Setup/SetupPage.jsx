import React, { useState, useEffect } from 'react';

const SetupPage = ({ onStartInterview, currentSession }) => {
    const [config, setConfig] = useState({
        role: '',
        jobDescription: '',
        resumeText: '',
        duration: 15
    });

    // Auto-populate role from session
    useEffect(() => {
        if (currentSession?.jobRole) {
            setConfig(prev => ({
                ...prev,
                role: currentSession.jobRole,
                jobDescription: currentSession.jobDescription || prev.jobDescription
            }));
        }
    }, [currentSession]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onStartInterview(config);
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            overflowY: 'auto', // Allow scrolling within this container
            background: 'var(--bg-dark)',
            padding: '2rem 1rem', // Added horizontal padding for mobile
            display: 'block' // Remove flex center to allow natural flow
        }}>
            <div className="flex-center" style={{ minHeight: '100%', paddingBottom: '2rem' }}>
                <div className="card-surface" style={{
                    width: '100%',
                    maxWidth: '800px',
                    padding: '3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    margin: 'auto' // Center vertically if space allows
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Interview Setup
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Configure your AI interview parameters below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            {/* Role */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Role</label>
                                {currentSession ? (
                                    <div style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        color: 'rgba(99, 102, 241, 1)',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        {currentSession.jobRole}
                                        <span style={{
                                            fontSize: '0.7rem',
                                            background: 'rgba(99, 102, 241, 0.2)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '99px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}>
                                            <div style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: 'rgba(99, 102, 241, 1)',
                                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                            }}></div>
                                            Session Locked
                                        </span>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        name="role"
                                        value={config.role}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior React Developer"
                                        required
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                )}
                            </div>

                            {/* Duration */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Duration (Minutes)</label>
                                <select
                                    name="duration"
                                    value={config.duration}
                                    onChange={handleChange}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 1rem center',
                                        backgroundSize: '0.8rem auto',
                                        paddingRight: '2.5rem'
                                    }}
                                >
                                    <option value={15} style={{ color: 'black' }}>15 Minutes</option>
                                    <option value={30} style={{ color: 'black' }}>30 Minutes</option>
                                    <option value={45} style={{ color: 'black' }}>45 Minutes</option>
                                    <option value={60} style={{ color: 'black' }}>60 Minutes</option>
                                </select>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Description</label>
                            {currentSession?.jobDescription ? (
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '0.95rem',
                                    minHeight: '150px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    position: 'relative',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.6'
                                }}>
                                    {currentSession.jobDescription}
                                    <div style={{
                                        position: 'sticky',
                                        bottom: '0.5rem',
                                        right: '0.5rem',
                                        float: 'right',
                                        fontSize: '0.7rem',
                                        background: 'rgba(99, 102, 241, 0.3)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '99px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        color: 'rgba(99, 102, 241, 1)',
                                        fontWeight: 700,
                                        marginTop: '0.5rem'
                                    }}>
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: 'rgba(99, 102, 241, 1)',
                                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                        }}></div>
                                        Session Locked
                                    </div>
                                </div>
                            ) : (
                                <textarea
                                    name="jobDescription"
                                    value={config.jobDescription}
                                    onChange={handleChange}
                                    placeholder="Paste the job description here..."
                                    rows={6}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        minHeight: '150px'
                                    }}
                                />
                            )}
                        </div>

                        {/* Resume */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Resume / Profile</label>
                            <textarea
                                name="resumeText"
                                value={config.resumeText}
                                onChange={handleChange}
                                placeholder="Paste your resume text or key skills here..."
                                rows={6}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    minHeight: '150px'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!config.role}
                            style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                borderRadius: '99px',
                                background: 'var(--pk-primary)',
                                color: 'white',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                opacity: config.role ? 1 : 0.5,
                                transition: 'all 0.2s ease',
                                boxShadow: config.role ? '0 0 20px rgba(99, 102, 241, 0.4)' : 'none'
                            }}
                        >
                            Start Interview
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SetupPage;

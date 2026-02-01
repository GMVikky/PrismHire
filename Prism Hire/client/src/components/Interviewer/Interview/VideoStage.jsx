import React, { useEffect, useRef, useState } from 'react';

const VideoStage = ({ isSpeaking, isThinking, isCameraOn }) => {
    const videoRef = useRef(null);
    const [hasCamera, setHasCamera] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [debugStatus, setDebugStatus] = useState("Initializing...");

    useEffect(() => {
        let stream = null;
        let mounted = true;

        const manageCamera = async () => {
            // console.log("Camera Requested. State:", isCameraOn);
            setDebugStatus("Requesting camera access...");
            setCameraError(null);

            if (isCameraOn) {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    setCameraError("Camera API not supported in this browser.");
                    return;
                }

                try {
                    // console.log("Calling getUserMedia...");
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });

                    if (!mounted) {
                        stream.getTracks().forEach(t => t.stop());
                        return;
                    }

                    // console.log("Stream acquired:", stream.id);
                    setDebugStatus("Stream acquired. Attaching...");

                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;

                        videoRef.current.onloadedmetadata = async () => {
                            setDebugStatus("MetaData loaded. Playing...");
                            try {
                                await videoRef.current.play();
                                setHasCamera(true);
                                setDebugStatus("Active");
                            } catch (e) {
                                console.error("Play error:", e);
                                setCameraError("Autoplay blocked: " + e.message);
                            }
                        };
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    let msg = err.message || "Unknown error";
                    if (err.name === 'NotAllowedError') msg = "Permission denied. Please allow camera access.";
                    if (err.name === 'NotFoundError') msg = "No camera found.";
                    if (err.name === 'NotReadableError') msg = "Camera is in use by another app.";
                    setCameraError(msg);
                    setHasCamera(false);
                }
            } else {
                // Stop all tracks if turned off
                setDebugStatus("Camera Off");
                setHasCamera(false);
                setCameraError(null);
            }
        };

        manageCamera();

        return () => {
            mounted = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isCameraOn]);

    return (
        <div className="video-stage card-surface" style={{
            position: 'relative',
            flex: 1,
            minHeight: '400px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        }}>
            {/* AI Avatar */}
            <div style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: isSpeaking ? 'var(--pk-primary)' : 'rgba(255,255,255,0.05)',
                boxShadow: isSpeaking ? '0 0 60px rgba(99, 102, 241, 0.6)' : 'none',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.1)'
            }}>
                {isThinking && (
                    <div className="flex space-x-1" style={{ display: 'flex', gap: '4px' }}>
                        <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
                        <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%', animation: 'pulse 1s infinite', animationDelay: '0.2s' }}></div>
                        <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%', animation: 'pulse 1s infinite', animationDelay: '0.4s' }}></div>
                    </div>
                )}
                {!isThinking && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
            </div>

            <div style={{ marginTop: '2rem', color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600 }}>
                {isSpeaking ? 'AI Interviewer Speaking...' : isThinking ? 'Processing...' : 'Listening'}
            </div>

            {/* Self View Overlay - Only visible if camera is ON */}
            {isCameraOn && (
                <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    right: '24px',
                    width: '240px',
                    height: '135px',
                    background: '#000',
                    borderRadius: '16px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)',
                            display: hasCamera ? 'block' : 'none'
                        }}
                    />

                    {/* Status/Error Layer */}
                    {!hasCamera && (
                        <div style={{ padding: '10px', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                            {cameraError ? (
                                <span style={{ color: '#ef4444' }}>{cameraError}</span>
                            ) : (
                                <span>{debugStatus}</span>
                            )}
                        </div>
                    )}

                    <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '12px',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: 'white',
                        backdropFilter: 'blur(4px)'
                    }}>
                        YOU
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoStage;

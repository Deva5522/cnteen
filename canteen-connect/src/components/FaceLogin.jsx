import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FaceLogin = ({ onCancel }) => {
    const webcamRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, scanning, success, error
    const [message, setMessage] = useState('Position your face in the frame');
    const { login } = useAuth();
    const navigate = useNavigate();

    const capture = useCallback(() => {
        setIsScanning(true);
        setStatus('scanning');
        setMessage('Verifying face...');

        // Simulate verification delay
        setTimeout(() => {
            const imageSrc = webcamRef.current?.getScreenshot();

            if (imageSrc) {
                // Simulate success rate (always success for demo unless specifically testing failure)
                const isSuccess = true;

                if (isSuccess) {
                    setStatus('success');
                    setMessage('Identity Verified!');

                    // Allow animation to finish
                    setTimeout(async () => {
                        // Normal login flow
                        const loginResult = await login('user', { id: 'user123', pass: 'demo' }, true);
                        if (loginResult.success) {
                            navigate('/user'); // Explicitly go to /user not /dashboard which might be unmapped
                        } else {
                            setStatus('error');
                            setMessage('Login failed after verification.');
                        }
                    }, 1000);
                } else {
                    setStatus('error');
                    setMessage('Verification failed. Try again.');
                    setIsScanning(false);
                }
            } else {
                setStatus('error');
                setMessage('Camera error. Please try again.');
                setIsScanning(false);
            }
        }, 2000); // 2 second scan simulation
    }, [webcamRef, login, navigate]);

    return (
        <div className="face-login-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
        }}>
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                height: '300px',
                backgroundColor: '#000',
                borderRadius: '1rem',
                overflow: 'hidden',
                marginBottom: '1rem',
                border: `3px solid ${status === 'success' ? 'var(--success)' : status === 'error' ? 'var(--destructive)' : status === 'scanning' ? 'var(--primary)' : 'var(--border)'}`,
                boxShadow: status === 'scanning' ? '0 0 20px var(--primary)' : 'none',
                transition: 'all 0.3s'
            }}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />

                {/* Scanning Overlay */}
                {status === 'scanning' && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.2), transparent)',
                        animation: 'scan 1.5s linear infinite',
                        borderBottom: '2px solid var(--primary)'
                    }} />
                )}

                {/* Status Overlay */}
                {status === 'success' && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircle size={64} className="text-green-500" />
                    </div>
                )}
            </div>

            <p style={{
                color: status === 'error' ? 'var(--destructive)' : status === 'success' ? 'var(--success)' : 'var(--text-muted)',
                marginBottom: '1.5rem',
                fontWeight: '500'
            }}>
                {message}
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
                {status === 'idle' || status === 'error' ? (
                    <button
                        onClick={capture}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Camera size={20} />
                        Scan Face
                    </button>
                ) : null}

                {status !== 'success' && (
                    <button
                        onClick={onCancel}
                        className="btn btn-outline"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
            `}</style>
        </div>
    );
};

export default FaceLogin;

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ScanFace } from 'lucide-react';
import FaceLogin from '../components/FaceLogin';

const SNACK_IMAGES = [
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80", // Chai
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", // Samosa
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80", // Dosa
    "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80", // Vada Pav
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80", // Rajma Rice
    "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500&q=80", // Cold Coffee
];

const Login = () => {
    console.log("Login Component Mounted");
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'user';
    const navigate = useNavigate();
    const { login } = useAuth();

    const [id, setId] = useState('');
    const [pass, setPass] = useState('');
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'face'
    const [error, setError] = useState('');

    useEffect(() => {
        // Clear error on mount
        setError('');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear prev error
        try {
            const res = await login(role, { id, pass });
            if (res.success) {
                navigate(role === 'admin' ? '/admin' : '/user');
            } else {
                console.error("Login Error:", res.message);
                setError(res.message || 'Login Failed');
            }
        } catch (err) {
            console.error("Login Crash:", err);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            backgroundColor: 'var(--bg-dark)',
            overflow: 'hidden'
        }}>
            {/* Left Side - Vertical Marquee & Welcome */}
            <div style={{
                flex: '1.2',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#000'
            }}>
                {/* Slanted Image Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                    padding: '2rem',
                    height: '150%', // Taller to cover rotation
                    width: '150%', // Wider to cover rotation
                    opacity: 0.9,
                    transform: 'rotate(-12deg) translate(-15%, -15%)', // Slant and center
                }}>
                    {SNACK_IMAGES.map((src, i) => (
                        <div key={i} style={{
                            borderRadius: '1rem',
                            overflow: 'hidden',
                            height: '240px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            transform: i % 2 === 0 ? 'translateY(2rem)' : 'translateY(-2rem)', // Stagger effect
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <img src={src} alt="" style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'contrast(1.1) saturate(1.1)' // Enhance visuals
                            }} />
                        </div>
                    ))}
                </div>

                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 10,
                    padding: '2rem',
                    pointerEvents: 'none'
                }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '2rem',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Home
                    </button>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'var(--bg-card)',
                boxShadow: '-10px 0 20px rgba(0,0,0,0.2)',
                zIndex: 100, // Boost z-index to ensure it sits above any animations
                position: 'relative'
            }}>
                <div style={{ width: '100%', maxWidth: '350px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="font-decorative" style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>
                            Canteen Connect
                        </h2>
                        <h3 style={{
                            fontSize: '1rem',
                            color: 'var(--text-muted)',
                            fontWeight: '500'
                        }}>
                            {role === 'admin' ? 'Admin Access' : 'Login to Account'}
                        </h3>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--danger)',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                            Sign Up
                        </Link>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        gap: '1rem'
                    }}>
                        <button
                            onClick={() => setLoginMethod('password')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: loginMethod === 'password' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: loginMethod === 'password' ? 'var(--primary)' : 'var(--text-muted)',
                                paddingBottom: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            <ScanFace size={18} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
                            Password
                        </button>
                        {role !== 'admin' && (
                            <button
                                onClick={() => setLoginMethod('face')}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: loginMethod === 'face' ? '2px solid var(--primary)' : '2px solid transparent',
                                    color: loginMethod === 'face' ? 'var(--primary)' : 'var(--text-muted)',
                                    paddingBottom: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                <ScanFace size={18} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
                                Face ID
                            </button>
                        )}
                    </div>

                    {loginMethod === 'password' ? (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <input
                                    type="text"
                                    className="input"
                                    value={id}
                                    onChange={e => setId(e.target.value)}
                                    placeholder={role === 'admin' ? 'Username' : 'User Name'}
                                    style={{
                                        backgroundColor: 'var(--bg-dark)',
                                        padding: '0.9rem',
                                        borderRadius: '0.75rem',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    className="input"
                                    value={pass}
                                    onChange={e => setPass(e.target.value)}
                                    placeholder="Password"
                                    style={{
                                        backgroundColor: 'var(--bg-dark)',
                                        padding: '0.9rem',
                                        borderRadius: '0.75rem',
                                        width: '100%'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    marginTop: '0.25rem',
                                    padding: '0.9rem',
                                    borderRadius: '0.75rem',
                                    fontSize: '1.1rem'
                                }}
                            >
                                {role === 'admin' ? 'Enter Dashboard' : 'Login'}
                            </button>
                        </form>
                    ) : (
                        <FaceLogin
                            mode="verify"
                            onCancel={() => setLoginMethod('password')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;

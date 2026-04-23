import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Car, ArrowLeft } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await signIn(email, password);
            navigate('/new-service');
        } catch (err) {
            setError('Failed to sign in: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/new-service`,
                },
            });
            if (error) throw error;
        } catch (err) {
            setError('Failed to sign in with Google: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="page-content">
                <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => navigate('/onboarding')} style={{ background: 'none', padding: '8px', marginLeft: '-8px', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}>
                        <ArrowLeft size={28} />
                    </button>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Car size={48} color="var(--color-primary)" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 'var(--spacing-xs)' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--color-text-body)' }}>Sign in to continue</p>
                </div>

                {error && (
                    <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ marginTop: 'var(--spacing-md)' }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-sm)' }}>
                        <Link to="/forgot-password" style={{ color: 'var(--color-text-secondary)', fontSize: '14px', textDecoration: 'underline' }}>Forgot Password?</Link>
                    </div>
                </form>

                <div style={{ margin: 'var(--spacing-xl) 0 var(--spacing-lg)', position: 'relative', textAlign: 'center' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--color-border)' }}></div>
                    <span style={{ position: 'relative', background: 'var(--color-bg-primary)', padding: '0 16px', color: 'var(--color-text-body)', fontSize: '14px', fontWeight: '500' }}>
                        OR
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: 'var(--color-text-heading)',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.86 16.8 15.69 17.58V20.34H19.26C21.35 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                        <path d="M12 23C14.97 23 17.46 22.02 19.26 20.34L15.69 17.58C14.71 18.24 13.46 18.66 12 18.66C9.17 18.66 6.78 16.75 5.9 14.18H2.23V17.03C4.04 20.62 7.71 23 12 23Z" fill="#34A853" />
                        <path d="M5.9 14.18C5.67 13.51 5.54 12.77 5.54 12C5.54 11.23 5.67 10.49 5.9 9.82V6.97H2.23C1.48 8.46 1.05 10.18 1.05 12C1.05 13.82 1.48 15.54 2.23 17.03L5.9 14.18Z" fill="#FBBC05" />
                        <path d="M12 5.34C13.62 5.34 15.06 5.89 16.21 6.99L19.34 3.86C17.46 2.11 14.97 1 12 1C7.71 1 4.04 3.38 2.23 6.97L5.9 9.82C6.78 7.25 9.17 5.34 12 5.34Z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center', fontSize: '14px' }}>
                    Don't have an account? <button onClick={() => navigate('/onboarding')} style={{ color: 'var(--color-primary)', fontWeight: '600', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Return to Onboarding</button>
                </div>
            </div>
        </div>
    );
};

export default Login;

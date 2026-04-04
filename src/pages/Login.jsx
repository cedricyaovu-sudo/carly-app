import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

                <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center', fontSize: '14px' }}>
                    Don't have an account? <button onClick={() => navigate('/onboarding')} style={{ color: 'var(--color-primary)', fontWeight: '600', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Return to Onboarding</button>
                </div>
            </div>
        </div>
    );
};

export default Login;

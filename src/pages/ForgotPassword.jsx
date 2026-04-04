import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showSuccess, showError } from '../components/ui/Toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setSuccessMessage('');
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login`,
            });
            
            if (error) {
                showError('Failed to send reset link: ' + error.message);
            } else {
                setSuccessMessage('Password reset link sent! Check your email.');
                showSuccess('Reset link sent to your email.');
            }
        } catch (err) {
            showError('An unexpected error occurred.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="page-content">
                <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => navigate('/login')} style={{ background: 'none', padding: '8px', marginLeft: '-8px', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}>
                        <ArrowLeft size={28} />
                    </button>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Car size={48} color="var(--color-primary)" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 'var(--spacing-xs)' }}>Reset Password</h1>
                    <p style={{ color: 'var(--color-text-body)' }}>Enter your email to receive a password reset link.</p>
                </div>

                {successMessage && (
                    <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)', fontSize: '14px', textAlign: 'center' }}>
                        {successMessage}
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
                            placeholder="your@email.com"
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
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center', fontSize: '14px' }}>
                    Remember your password? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

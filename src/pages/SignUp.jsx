import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Car, ArrowLeft } from 'lucide-react';

// --- Validation helpers ------------------------------------------------------
// Keep these pure so they're easy to reason about and unit-test later.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isValidEmail = (value) => {
    if (!value) return false;
    const trimmed = value.trim();
    if (trimmed.length > 254) return false;
    return EMAIL_REGEX.test(trimmed);
};

// Strip everything except digits, then require a US-style 10-digit number
// (optionally with a leading "1"). Covers the vast majority of real inputs
// without over-constraining international numbers.
const digitsOnly = (value) => (value || '').replace(/\D/g, '');

const isValidPhone = (value) => {
    const digits = digitsOnly(value);
    if (digits.length === 10) return true;
    if (digits.length === 11 && digits.startsWith('1')) return true;
    return false;
};

// Pretty format as the user types: (555) 123-4567.
const formatPhone = (value) => {
    const d = digitsOnly(value).slice(0, 11);
    const body = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
    if (body.length === 0) return '';
    if (body.length < 4) return `(${body}`;
    if (body.length < 7) return `(${body.slice(0, 3)}) ${body.slice(3)}`;
    return `(${body.slice(0, 3)}) ${body.slice(3, 6)}-${body.slice(6, 10)}`;
};

const isValidUsername = (value) => (value || '').trim().length >= 2;

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
const isValidPassword = (value) => PASSWORD_REGEX.test(value || '');

// --- Small field-error display component ------------------------------------

const FieldError = ({ children }) => (
    <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '6px' }}>
        {children}
    </div>
);

// --- SignUp page ------------------------------------------------------------

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [touched, setTouched] = useState({
        username: false,
        phoneNumber: false,
        email: false,
        password: false,
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const fieldErrors = {
        username: isValidUsername(username) ? '' : 'Please enter a valid username (at least 2 characters).',
        phoneNumber: isValidPhone(phoneNumber) ? '' : 'Please enter a valid phone number (e.g. (555) 123-4567).',
        email: isValidEmail(email) ? '' : 'Please enter a valid email address.',
        password: isValidPassword(password)
            ? ''
            : 'Password must be at least 8 characters, include one uppercase letter and one special character.',
    };

    const formIsValid = Object.values(fieldErrors).every((msg) => msg === '');

    const handlePhoneChange = (e) => {
        setPhoneNumber(formatPhone(e.target.value));
    };

    const markTouched = (field) => () =>
        setTouched((prev) => ({ ...prev, [field]: true }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Surface every error if they try to submit.
        setTouched({ username: true, phoneNumber: true, email: true, password: true });
        if (!formIsValid) {
            setError('Please fix the highlighted fields and try again.');
            return;
        }

        try {
            setLoading(true);

            const normalizedPhone = digitsOnly(phoneNumber);
            const e164Phone = normalizedPhone.length === 11
                ? `+${normalizedPhone}`
                : `+1${normalizedPhone}`;

            const { user } = await signUp(email.trim(), password, {
                username: username.trim(),
                phone_number: e164Phone,
            });

            if (user) {
                let retries = 5;
                let success = false;
                while (retries > 0 && !success) {
                    await new Promise((r) => setTimeout(r, 1000));
                    const { error: updateErr } = await supabase
                        .from('profiles')
                        .update({ onboarding_completed: true })
                        .eq('id', user.id);
                    if (!updateErr) success = true;
                    retries--;
                }

                if (refreshProfile) await refreshProfile(user.id);
                navigate('/new-service');
            }
        } catch (err) {
            setError('Failed to create account: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider) => {
        try {
            setLoading(true);
            setError('');
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/new-service`,
                },
            });
            if (error) throw error;
        } catch (err) {
            setError(`Failed to sign in with ${provider}: ` + err.message);
            setLoading(false);
        }
    };

    const inputBaseStyle = {
        width: '100%',
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        fontSize: '16px',
        outline: 'none',
    };

    const inputStyle = (fieldName) => {
        const showError = touched[fieldName] && fieldErrors[fieldName];
        return {
            ...inputBaseStyle,
            border: `1px solid ${showError ? '#DC2626' : 'var(--color-border)'}`,
            boxShadow: showError ? '0 0 0 3px rgba(220,38,38,0.12)' : 'none',
        };
    };

    return (
        <div className="container">
            <div className="page-content">
                <header style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', padding: 0, border: 'none', cursor: 'pointer' }}>
                        <ArrowLeft size={24} color="var(--color-text-heading)" />
                    </button>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Car size={48} color="var(--color-primary)" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 'var(--spacing-xs)' }}>Create Account</h1>
                    <p style={{ color: 'var(--color-text-body)' }}>Join Carly for total car care</p>
                </div>

                {error && (
                    <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onBlur={markTouched('username')}
                            required
                            autoComplete="username"
                            aria-invalid={Boolean(touched.username && fieldErrors.username)}
                            style={inputStyle('username')}
                        />
                        {touched.username && fieldErrors.username && (
                            <FieldError>{fieldErrors.username}</FieldError>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            onBlur={markTouched('phoneNumber')}
                            required
                            autoComplete="tel"
                            placeholder="(555) 123-4567"
                            inputMode="tel"
                            aria-invalid={Boolean(touched.phoneNumber && fieldErrors.phoneNumber)}
                            style={inputStyle('phoneNumber')}
                        />
                        {touched.phoneNumber && fieldErrors.phoneNumber && (
                            <FieldError>{fieldErrors.phoneNumber}</FieldError>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={markTouched('email')}
                            required
                            autoComplete="email"
                            inputMode="email"
                            placeholder="you@example.com"
                            aria-invalid={Boolean(touched.email && fieldErrors.email)}
                            style={inputStyle('email')}
                        />
                        {touched.email && fieldErrors.email && (
                            <FieldError>{fieldErrors.email}</FieldError>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={markTouched('password')}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            aria-invalid={Boolean(touched.password && fieldErrors.password)}
                            style={inputStyle('password')}
                        />
                        {touched.password && fieldErrors.password && (
                            <FieldError>{fieldErrors.password}</FieldError>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ marginTop: 'var(--spacing-md)' }}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ margin: 'var(--spacing-xl) 0', position: 'relative', textAlign: 'center' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--color-border)' }}></div>
                    <span style={{ position: 'relative', background: 'var(--color-bg-primary)', padding: '0 16px', color: 'var(--color-text-body)', fontSize: '14px', fontWeight: '500' }}>
                        Or sign in with
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 'var(--spacing-lg)' }}>
                    <button type="button" onClick={() => handleOAuth('google')} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.86 16.8 15.69 17.58V20.34H19.26C21.35 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                            <path d="M12 23C14.97 23 17.46 22.02 19.26 20.34L15.69 17.58C14.71 18.24 13.46 18.66 12 18.66C9.17 18.66 6.78 16.75 5.9 14.18H2.23V17.03C4.04 20.62 7.71 23 12 23Z" fill="#34A853" />
                            <path d="M5.9 14.18C5.67 13.51 5.54 12.77 5.54 12C5.54 11.23 5.67 10.49 5.9 9.82V6.97H2.23C1.48 8.46 1.05 10.18 1.05 12C1.05 13.82 1.48 15.54 2.23 17.03L5.9 14.18Z" fill="#FBBC05" />
                            <path d="M12 5.34C13.62 5.34 15.06 5.89 16.21 6.99L19.34 3.86C17.46 2.11 14.97 1 12 1C7.71 1 4.04 3.38 2.23 6.97L5.9 9.82C6.78 7.25 9.17 5.34 12 5.34Z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                    <button type="button" onClick={() => handleOAuth('apple')} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.15 16.924C11.523 16.924 10.638 16.48 9.61 16.48C8.188 16.48 6.84 17.307 6.104 18.597C4.545 21.312 5.684 25.32 7.21 27.526C7.946 28.583 8.814 29.771 9.946 29.742C11.05 29.712 11.485 29.049 12.802 29.049C14.119 29.049 14.502 29.742 15.666 29.712C16.859 29.684 17.618 28.611 18.36 27.526C19.223 26.257 19.585 25.019 19.6 24.956C19.571 24.94 18.375 24.484 18.355 23.084C18.336 21.91 19.297 21.325 19.345 21.294C18.736 20.395 17.788 19.923 17.391 19.882C16.035 19.74 14.654 20.675 13.987 20.675C13.311 20.675 12.186 19.794 11.026 19.824C11.394 18.428 12.528 17.359 13.684 16.923Z" transform="translate(0, -6)" />
                            <path d="M14.986 13.791C15.541 13.111 15.91 12.158 15.808 11.2C14.975 11.235 13.939 11.761 13.362 12.441C12.84 13.045 12.4 14.026 12.528 14.958C13.456 15.028 14.432 14.471 14.986 13.791Z" transform="translate(0, -6)" />
                        </svg>
                        Continue with Apple
                    </button>
                    <button type="button" onClick={() => handleOAuth('facebook')} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M23.998 12C23.998 5.373 18.626 0 12 0C5.373 0 0 5.373 0 12C0 17.989 4.388 22.954 10.125 23.854V15.469H7.078V12H10.125V9.356C10.125 6.349 11.917 4.688 14.658 4.688C15.971 4.688 17.344 4.922 17.344 4.922V7.875H15.831C14.34 7.875 13.875 8.8 13.875 9.75V12H17.203L16.672 15.469H13.875V23.854C19.613 22.954 23.998 17.989 23.998 12Z" />
                        </svg>
                        Continue with Facebook
                    </button>
                </div>

                <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center', fontSize: '14px' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;

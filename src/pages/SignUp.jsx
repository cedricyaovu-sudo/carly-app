import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Car, ArrowLeft, Mail, Phone, CheckCircle2 } from 'lucide-react';

// --- Validation helpers ------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isValidEmail = (value) => {
    if (!value) return false;
    const trimmed = value.trim();
    if (trimmed.length > 254) return false;
    return EMAIL_REGEX.test(trimmed);
};

const digitsOnly = (value) => (value || '').replace(/\D/g, '');

const isValidPhone = (value) => {
    const digits = digitsOnly(value);
    if (digits.length === 10) return true;
    if (digits.length === 11 && digits.startsWith('1')) return true;
    return false;
};

const formatPhone = (value) => {
    const d = digitsOnly(value).slice(0, 11);
    const body = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
    if (body.length === 0) return '';
    if (body.length < 4) return `(${body}`;
    if (body.length < 7) return `(${body.slice(0, 3)}) ${body.slice(3)}`;
    return `(${body.slice(0, 3)}) ${body.slice(3, 6)}-${body.slice(6, 10)}`;
};

const toE164 = (value) => {
    const digits = digitsOnly(value);
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return `+1${digits}`;
};

const isValidUsername = (value) => (value || '').trim().length >= 2;

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
const isValidPassword = (value) => PASSWORD_REGEX.test(value || '');

// --- Shared styles / small components ---------------------------------------

const FieldError = ({ children }) => (
    <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '6px' }}>
        {children}
    </div>
);

const InfoBanner = ({ tone = 'info', children }) => {
    const palette =
        tone === 'error'
            ? { bg: '#FEE2E2', fg: '#DC2626' }
            : tone === 'success'
            ? { bg: '#DCFCE7', fg: '#166534' }
            : { bg: '#EFF6FF', fg: '#1E40AF' };
    return (
        <div
            style={{
                background: palette.bg,
                color: palette.fg,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-md)',
                fontSize: '14px',
            }}
        >
            {children}
        </div>
    );
};

// --- Verification network helpers -------------------------------------------

const fnUrl = (name) =>
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`;

const authHeader = () => ({
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
});

const requestCode = async (target, targetType) => {
    const res = await fetch(fnUrl('send-verification-code'), {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ target, targetType }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');
    return data;
};

const verifyCode = async (target, targetType, code) => {
    const res = await fetch(fnUrl('verify-verification-code'), {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ target, targetType, code }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.verified) {
        throw new Error(data.error || 'Incorrect or expired code.');
    }
    return data;
};

// --- Verification row widget ------------------------------------------------

const VerifyRow = ({
    label,
    icon,
    targetDisplay,
    verified,
    disabled,
    status,
    onSendCode,
    onVerify,
}) => {
    const [code, setCode] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [localError, setLocalError] = useState('');
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const handleSend = async () => {
        setLocalError('');
        setSending(true);
        try {
            await onSendCode();
            setCooldown(45);
        } catch (err) {
            setLocalError(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleVerify = async () => {
        setLocalError('');
        setVerifying(true);
        try {
            await onVerify(code);
            setCode('');
        } catch (err) {
            setLocalError(err.message);
        } finally {
            setVerifying(false);
        }
    };

    const canVerify = code.trim().length === 6 && !verifying && !disabled;

    return (
        <div
            style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${verified ? '#16A34A' : 'var(--color-border)'}`,
                background: verified ? '#F0FDF4' : 'transparent',
                marginBottom: '12px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                {icon}
                <div style={{ fontWeight: 600 }}>{label}</div>
                {verified && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontSize: '13px', fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> Verified
                    </div>
                )}
            </div>

            <div style={{ fontSize: '13px', color: 'var(--color-text-body)', marginBottom: '12px' }}>
                {targetDisplay}
            </div>

            {!verified && (
                <>
                    {status === 'idle' ? (
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={sending || disabled}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            {sending ? 'Sending…' : `Send code`}
                        </button>
                    ) : (
                        <>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(digitsOnly(e.target.value).slice(0, 6))}
                                    placeholder="6-digit code"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '16px',
                                        letterSpacing: '4px',
                                        textAlign: 'center',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerify}
                                    disabled={!canVerify}
                                    className="btn btn-primary"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    {verifying ? 'Verifying…' : 'Verify'}
                                </button>
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={sending || cooldown > 0 || disabled}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: cooldown > 0 ? 'var(--color-text-body)' : 'var(--color-primary)',
                                        cursor: cooldown > 0 ? 'default' : 'pointer',
                                        padding: 0,
                                        fontSize: '13px',
                                    }}
                                >
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                                </button>
                            </div>
                        </>
                    )}
                    {localError && <FieldError>{localError}</FieldError>}
                </>
            )}
        </div>
    );
};

// --- SignUp page ------------------------------------------------------------

const SignUp = () => {
    const [step, setStep] = useState('form'); // 'form' | 'verify'

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

    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [emailStatus, setEmailStatus] = useState('idle'); // 'idle' | 'sent'
    const [phoneStatus, setPhoneStatus] = useState('idle');
    const [phoneUnsupported, setPhoneUnsupported] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const autoSentRef = useRef(false);

    const fieldErrors = {
        username: isValidUsername(username) ? '' : 'Please enter a valid username (at least 2 characters).',
        phoneNumber: isValidPhone(phoneNumber) ? '' : 'Please enter a valid phone number (e.g. (555) 123-4567).',
        email: isValidEmail(email) ? '' : 'Please enter a valid email address.',
        password: isValidPassword(password)
            ? ''
            : 'Password must be at least 8 characters, include one uppercase letter and one special character.',
    };

    const formIsValid = Object.values(fieldErrors).every((msg) => msg === '');

    const handlePhoneChange = (e) => setPhoneNumber(formatPhone(e.target.value));
    const markTouched = (field) => () =>
        setTouched((prev) => ({ ...prev, [field]: true }));

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhoneE164 = toE164(phoneNumber);

    // --- Step 1: validate form, move to verify -----------------------------
    const handleContinue = (e) => {
        e.preventDefault();
        setError('');
        setTouched({ username: true, phoneNumber: true, email: true, password: true });
        if (!formIsValid) {
            setError('Please fix the highlighted fields and try again.');
            return;
        }
        autoSentRef.current = false;
        setStep('verify');
    };

    // Auto-send email code + phone code the first time we enter the verify step.
    useEffect(() => {
        if (step !== 'verify' || autoSentRef.current) return;
        autoSentRef.current = true;

        (async () => {
            try {
                await requestCode(normalizedEmail, 'email');
                setEmailStatus('sent');
            } catch (err) {
                console.error('Auto email send failed:', err);
                setError(`Email: ${err.message}`);
            }

            try {
                await requestCode(normalizedPhoneE164, 'phone');
                setPhoneStatus('sent');
            } catch (err) {
                const msg = err.message || '';
                if (msg.toLowerCase().includes('not configured')) {
                    // Phone provider isn't set up — don't block signup on it.
                    setPhoneUnsupported(true);
                    setPhoneVerified(true);
                } else {
                    console.error('Auto phone send failed:', err);
                    setError((prev) => prev ? prev : `Phone: ${msg}`);
                }
            }
        })();
    }, [step, normalizedEmail, normalizedPhoneE164]);

    // --- Step 2 helpers -----------------------------------------------------
    const sendEmailCode = async () => {
        await requestCode(normalizedEmail, 'email');
        setEmailStatus('sent');
    };
    const verifyEmailCode = async (code) => {
        await verifyCode(normalizedEmail, 'email', code);
        setEmailVerified(true);
    };
    const sendPhoneCode = async () => {
        await requestCode(normalizedPhoneE164, 'phone');
        setPhoneStatus('sent');
    };
    const verifyPhoneCode = async (code) => {
        await verifyCode(normalizedPhoneE164, 'phone', code);
        setPhoneVerified(true);
    };

    // --- Step 2 submit: actually create the account ------------------------
    const finishSignup = async () => {
        setError('');
        if (!emailVerified) {
            setError('Please verify your email before continuing.');
            return;
        }
        if (!phoneVerified && !phoneUnsupported) {
            setError('Please verify your phone number before continuing.');
            return;
        }
        try {
            setLoading(true);

            const { user } = await signUp(normalizedEmail, password, {
                username: username.trim(),
                phone_number: normalizedPhoneE164,
            });

            if (user) {
                let retries = 5;
                let success = false;
                while (retries > 0 && !success) {
                    await new Promise((r) => setTimeout(r, 1000));
                    const { error: updateErr } = await supabase
                        .from('profiles')
                        .update({
                            onboarding_completed: true,
                            email_verified: true,
                            phone_verified: !phoneUnsupported,
                        })
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
                options: { redirectTo: `${window.location.origin}/new-service` },
            });
            if (error) throw error;
        } catch (err) {
            setError(`Failed to sign in with ${provider}: ` + err.message);
            setLoading(false);
        }
    };

    // --- Shared input styling ----------------------------------------------
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

    // --- Render -------------------------------------------------------------
    return (
        <div className="container">
            <div className="page-content">
                <header style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <button
                        onClick={() => (step === 'verify' ? setStep('form') : navigate('/'))}
                        style={{ background: 'none', padding: 0, border: 'none', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={24} color="var(--color-text-heading)" />
                    </button>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Car size={48} color="var(--color-primary)" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 'var(--spacing-xs)' }}>
                        {step === 'form' ? 'Create Account' : 'Verify your details'}
                    </h1>
                    <p style={{ color: 'var(--color-text-body)', textAlign: 'center' }}>
                        {step === 'form'
                            ? 'Join Carly for total car care'
                            : 'We sent you codes to confirm your email and phone.'}
                    </p>
                </div>

                {error && <InfoBanner tone="error">{error}</InfoBanner>}

                {step === 'form' && (
                    <>
                        <form onSubmit={handleContinue} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
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

                            <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
                                Continue
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
                    </>
                )}

                {step === 'verify' && (
                    <>
                        <VerifyRow
                            label="Email"
                            icon={<Mail size={18} color="var(--color-primary)" />}
                            targetDisplay={normalizedEmail}
                            verified={emailVerified}
                            status={emailStatus}
                            disabled={loading}
                            onSendCode={sendEmailCode}
                            onVerify={verifyEmailCode}
                        />

                        <VerifyRow
                            label="Phone"
                            icon={<Phone size={18} color="var(--color-primary)" />}
                            targetDisplay={
                                phoneUnsupported
                                    ? `${normalizedPhoneE164} (we'll verify at your first service)`
                                    : normalizedPhoneE164
                            }
                            verified={phoneVerified}
                            status={phoneStatus}
                            disabled={loading || phoneUnsupported}
                            onSendCode={sendPhoneCode}
                            onVerify={verifyPhoneCode}
                        />

                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ marginTop: 'var(--spacing-md)', width: '100%' }}
                            onClick={finishSignup}
                            disabled={loading || !emailVerified || (!phoneVerified && !phoneUnsupported)}
                        >
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>

                        <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center', fontSize: '13px' }}>
                            <button
                                type="button"
                                onClick={() => setStep('form')}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-primary)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                Edit email or phone
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SignUp;

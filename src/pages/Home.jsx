import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', position: 'relative', height: '100dvh', overflow: 'hidden' }}>
            {/* Background Image Placeholder - In real app, use actual image */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.8)), url("https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <div style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Car size={32} color="#007AFF" />
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'black' }}>Carly</span>
                </div>

                <h1 style={{ fontSize: '36px', marginBottom: 'var(--spacing-md)', lineHeight: 1.1, color: 'black' }}>
                    Total Car Care,<br />Simplified.
                </h1>
                <p style={{ fontSize: '16px', color: 'black', maxWidth: '300px' }}>
                    Schedule refueling, EV charging, detailing, and maintenance with a single tap.
                </p>
            </div>

            <div style={{ position: 'relative', zIndex: 1, padding: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
                {/* Social Login Placeholders */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                    {/* Google */}
                    <button style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </button>

                    {/* Apple */}
                    <button style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.93-.83 1.56.2 2.78.85 3.55 1.9-3.17 1.8-2.6 5.51.25 6.64-.67 1.74-1.54 3.2-2.81 4.52zm-5.17-13.6c.28-1.61 1.6-2.91 3.13-3.05.28 1.72-1.3 3.33-3.13 3.05z" />
                        </svg>
                    </button>

                    {/* Facebook */}
                    <button style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)', color: '#999', fontSize: '14px' }}>or</div>

                <button className="btn btn-primary" onClick={() => navigate('/signup')} style={{ marginBottom: 'var(--spacing-md)' }}>
                    Create Account
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.8)' }}>
                    Log In
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: 'var(--spacing-md)' }}>
                    By continuing you agree to our Terms of Service.
                </p>
            </div>
        </div>
    );
};

export default Home;

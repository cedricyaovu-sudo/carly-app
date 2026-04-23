import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Home, MessageSquare, MapPin, Gamepad2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { isDarkMode } = useTheme();

    // Simple title mapping based on path or state
    const getTitle = () => {
        if (location.pathname.includes('/new-service')) return 'New Service';
        if (location.pathname.includes('/details')) return 'Refueling Details';
        if (location.pathname.includes('/appointments')) return 'My Appointments';
        if (location.pathname.includes('/appointment')) return 'Appointment Details';
        if (location.pathname.includes('/select-date-time')) return 'Select Date & Time';
        if (location.pathname.includes('/checkout')) return 'Secure Checkout';
        if (location.pathname.includes('/payment-methods')) return 'Payment Methods';
        if (location.pathname.includes('/privacy-policy')) return 'Privacy Policy';
        if (location.pathname.includes('/my-vehicles')) return 'My Vehicles';
        if (location.pathname.includes('/add-vehicle')) return 'Add New Vehicle';
        if (location.pathname.includes('/notifications')) return 'Notifications';
        if (location.pathname.includes('/account')) return 'My Account';
        if (location.pathname.includes('/help')) return 'Help & Support';
        if (location.pathname.includes('/detailing')) return 'Detailing Service';
        if (location.pathname.includes('/ev-recharging')) return 'Electric Recharging';
        if (location.pathname.includes('/maintenance')) return 'Maintenance Service';
        if (location.pathname.includes('/mechanic')) return 'Mechanic Work';
        if (location.pathname.includes('/paint-correction')) return 'Paint Correction';
        if (location.pathname.includes('/ceramic-coating')) return 'Ceramic Coating';
        if (location.pathname.includes('/order-summary')) return 'Order Summary';
        if (location.pathname === '/chat') return 'Live Chat';
        if (location.pathname === '/meets') return 'Car Meets (Houston)';
        if (location.pathname === '/games') return 'Car Games';
        return '';
    };

    const title = getTitle();
    const showHeader = title !== '';

    // We only show the global bottom navigation tabs on the 4 top-level routes
    const showBottomNav = ['/new-service', '/chat', '/meets', '/games'].includes(location.pathname);

    return (
        <div className="container">
            <header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--spacing-lg)',
                    height: '44px',
                    flexShrink: 0,
                    visibility: showHeader ? 'visible' : 'hidden',
                    pointerEvents: showHeader ? 'auto' : 'none'
                }}
            >
                <div style={{ width: 32, display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', padding: 0, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <ArrowLeft size={24} color={isDarkMode ? "#F8FAFC" : "var(--color-text)"} />
                    </button>
                </div>
                <h1 style={{ fontSize: 'var(--font-size-lg)', margin: 0, textAlign: 'center', flex: 1 }}>{title}</h1>
                <div style={{ width: 32, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {location.pathname === '/new-service' && user && (
                        <div
                            onClick={() => navigate('/account')}
                            style={{
                                background: profile?.avatar_url ? 'transparent' : '#FFD7B5',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}
                        >
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <User size={20} color="#555" />
                            )}
                        </div>
                    )}
                    {location.pathname === '/appointments' && (
                        <button
                            onClick={() => navigate('/account')}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}
                        >
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <User size={24} color="var(--color-text)" />
                            )}
                        </button>
                    )}
                </div>
            </header>
            <main className="page-content">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            {showBottomNav && (
                <nav className="bottom-nav" style={{
                    background: isDarkMode ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                }}>
                    <button
                        onClick={() => navigate('/new-service')}
                        className="bottom-nav-item"
                        style={{ background: 'none', border: 'none', width: '100%', padding: '8px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/new-service' ? (isDarkMode ? 'var(--color-primary)' : '#007AFF') : (isDarkMode ? '#94A3B8' : '#475569') }}
                    >
                        <Home size={24} strokeWidth={location.pathname === '/new-service' ? 2.5 : 2} />
                        <span>Home</span>
                    </button>

                <button
                    onClick={() => navigate('/chat')}
                    className="bottom-nav-item"
                    style={{ background: 'none', border: 'none', width: '100%', padding: '8px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/chat' ? (isDarkMode ? 'var(--color-primary)' : '#007AFF') : (isDarkMode ? '#94A3B8' : '#475569') }}
                >
                    <MessageSquare size={24} strokeWidth={location.pathname === '/chat' ? 2.5 : 2} />
                    <span>Chat</span>
                </button>

                <button
                    onClick={() => navigate('/meets')}
                    className="bottom-nav-item"
                    style={{ background: 'none', border: 'none', width: '100%', padding: '8px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/meets' ? (isDarkMode ? 'var(--color-primary)' : '#007AFF') : (isDarkMode ? '#94A3B8' : '#475569') }}
                >
                    <MapPin size={24} strokeWidth={location.pathname === '/meets' ? 2.5 : 2} />
                    <span>Meets</span>
                </button>

                <button
                    onClick={() => navigate('/games')}
                    className="bottom-nav-item"
                    style={{ background: 'none', border: 'none', width: '100%', padding: '8px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/games' ? (isDarkMode ? 'var(--color-primary)' : '#007AFF') : (isDarkMode ? '#94A3B8' : '#475569') }}
                >
                    <Gamepad2 size={24} strokeWidth={location.pathname === '/games' ? 2.5 : 2} />
                    <span>Games</span>
                </button>
            </nav>
            )}
        </div>
    );
};

export default Layout;

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Car, CreditCard, Bell, HelpCircle, Shield, Bot, Moon, LogOut, X, Check, Camera, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { showSuccess, showError } from '../components/ui/Toast';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';

const MyAccount = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: '', phone_number: '' });
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const avatarInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setProfile(data);
            setEditForm({
                full_name: data?.full_name || '',
                phone_number: data?.phone_number || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            setSaving(true);
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editForm.full_name,
                    phone_number: editForm.phone_number,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            setProfile({ ...profile, ...editForm });
            setIsEditing(false);
            showSuccess('Profile updated!');
        } catch (error) {
            console.error('Error updating profile:', error);
            showError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (file) => {
        if (!file || !user) return;

        try {
            setUploadingAvatar(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('profile-images')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('profile-images')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: data.publicUrl, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setProfile({ ...profile, avatar_url: data.publicUrl });
            showSuccess('Profile picture updated!');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showError('Failed to upload picture');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        try {
            setIsLoggingOut(true);
            // Sign out from Supabase
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            // Always navigate away to ensure the user isn't stuck
            navigate('/', { replace: true });
        }
    };

    const menuItems = [
        { icon: <Car size={20} />, label: 'My Vehicles', sub: 'Manage your vehicles', path: '/my-vehicles' },
        { icon: <CreditCard size={20} />, label: 'Payment Methods', sub: 'Manage payment methods', path: '/payment-methods' },
        { icon: <Bot size={20} />, label: 'AI Car Assistant', sub: 'Diagnose issues & get advice', path: '#' },
        { icon: <Moon size={20} />, label: 'Dark Mode', type: 'toggle' },
        { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications' },
        { icon: <HelpCircle size={20} />, label: 'Help & Support', path: '/help' },
        { icon: <Shield size={20} />, label: 'Privacy Policy', path: '/privacy-policy' },
    ];

    return (
        <div
            style={{ paddingBottom: '100px' }}
        >
            {uploadingAvatar && <LoadingOverlay message="Uploading picture..." />}

            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ position: 'relative' }}>
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            marginRight: 'var(--spacing-md)',
                            background: '#E0F2FE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={() => avatarInputRef.current?.click()}
                    >
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" decoding="async" />
                        ) : (
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: '12px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        onClick={() => avatarInputRef.current?.click()}
                    >
                        <Camera size={12} color="white" />
                    </div>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAvatarUpload(file);
                        }}
                    />
                </div>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{profile?.full_name || 'User'}</h2>
                    <div style={{ color: '#666', fontSize: '14px' }}>{user?.email}</div>
                </div>
            </div>

            {/* Edit Profile Section */}
            {isEditing ? (
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Edit Profile</h3>
                        <button
                            onClick={() => setIsEditing(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                            <X size={20} color="#666" />
                        </button>
                    </div>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>Full Name</label>
                        <input
                            type="text"
                            value={editForm.full_name}
                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '16px' }}
                        />
                    </div>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>Phone Number</label>
                        <input
                            type="tel"
                            value={editForm.phone_number}
                            onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                            placeholder="(555) 123-4567"
                            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '16px' }}
                        />
                    </div>
                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Check size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    style={{ width: '100%', padding: '12px', background: '#F2F4F7', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '600', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-xl)', cursor: 'pointer' }}
                >
                    Edit Profile
                </button>
            )}

            {/* Bookings Section */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Bookings</h3>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--spacing-md)' }}>
                {['Upcoming', 'Past'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        style={{
                            padding: '8px 16px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.toLowerCase() ? '2px solid var(--color-primary)' : '2px solid transparent',
                            color: activeTab === tab.toLowerCase() ? 'var(--color-primary)' : '#666',
                            fontWeight: '600',
                            fontSize: '14px',
                            marginRight: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'upcoming' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                    <div onClick={() => navigate('/appointments')} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)' }}>
                            <Zap size={24} color="#333" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>View All Appointments</div>
                            <div style={{ color: '#666', fontSize: '12px' }}>Check status and details</div>
                        </div>
                        <ChevronRight size={20} color="#999" />
                    </div>
                </div>
            )}

            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            if (item.type === 'toggle') {
                                toggleTheme();
                            } else if (item.path) {
                                navigate(item.path);
                            }
                        }}
                        style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)' }}>
                            {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '16px' }}>{item.label}</div>
                            {item.sub && <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>{item.sub}</div>}
                        </div>
                        {item.type === 'toggle' ? (
                            <div style={{
                                width: '44px',
                                height: '24px',
                                background: isDarkMode ? '#007AFF' : '#E5E5EA',
                                borderRadius: '12px',
                                position: 'relative',
                                transition: 'none'
                            }}>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: isDarkMode ? '22px' : '2px',
                                    transition: 'none',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }} />
                            </div>
                        ) : (
                            <ChevronRight size={20} color="#999" />
                        )}
                    </div>
                ))}
            </div>

            <button
                className="btn btn-primary"
                style={{
                    background: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isLoggingOut ? 0.7 : 1,
                    cursor: isLoggingOut ? 'not-allowed' : 'pointer'
                }}
                onClick={handleLogout}
                disabled={isLoggingOut}
            >
                <LogOut size={20} />
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </button>
        </div>
    );
};

export default MyAccount;

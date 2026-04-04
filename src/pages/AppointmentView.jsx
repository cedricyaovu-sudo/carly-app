import { Fuel, Calendar, MapPin, Car, ArrowLeft, Zap, Wrench, Droplets, Sparkles, Shield, Minus, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { showSuccess, showError } from '../components/ui/Toast';
import { useTheme } from '../contexts/ThemeContext';

const AppointmentView = () => {
    const navigate = useNavigate();
    const locationState = useLocation();
    const { isDarkMode } = useTheme();
    const appointment = locationState.state?.appointment;

    const [isRecurring, setIsRecurring] = useState(appointment?.notes ? JSON.parse(appointment.notes).frequency === 'recurring' : false);
    const [timesPerWeek, setTimesPerWeek] = useState(appointment?.notes ? JSON.parse(appointment.notes).timesPerWeek || 1 : 1);
    const [updating, setUpdating] = useState(false);
    const [allowRecurring, setAllowRecurring] = useState(true);

    useEffect(() => {
        const fetchServiceConfig = async () => {
            if (!appointment?.service_type) return;
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('allow_recurring')
                    .eq('title', appointment.service_type)
                    .single();

                if (data && data.allow_recurring !== undefined) {
                    setAllowRecurring(data.allow_recurring);
                }
            } catch (err) {
                console.error('Error fetching service config:', err);
                // Default to true if fetch fails or column missing
            }
        };

        fetchServiceConfig();
    }, [appointment?.service_type]);

    if (!appointment) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>No appointment details found.</div>;
    }

    const handleUpdateRecurring = async (newRecurring, newTimes) => {
        setUpdating(true);
        try {
            const currentNotes = appointment.notes ? JSON.parse(appointment.notes) : {};
            const updatedNotes = {
                ...currentNotes,
                frequency: newRecurring ? 'recurring' : 'one-time',
                timesPerWeek: newRecurring ? newTimes : null
            };

            const { error } = await supabase
                .from('appointments')
                .update({ notes: JSON.stringify(updatedNotes) })
                .eq('id', appointment.id);

            if (error) throw error;

            setIsRecurring(newRecurring);
            setTimesPerWeek(newTimes);
            showSuccess(`Appointment updated to ${newRecurring ? 'recurring' : 'one-time'}`);
        } catch (error) {
            console.error('Error updating appointment:', error);
            showError('Failed to update appointment');
        } finally {
            setUpdating(false);
        }
    };

    const getIcon = (type) => {
        const props = { size: 32, color: "#007AFF" };
        switch (type?.toLowerCase()) {
            case 'refueling':
            case 'gas refueling': return <Fuel {...props} />;
            case 'ev recharging': return <Zap {...props} />;
            case 'maintenance': return <Wrench {...props} />;
            case 'detailing': return <Droplets {...props} />;
            case 'paint correction': return <Sparkles {...props} />;
            case 'ceramic coating': return <Shield {...props} />;
            default: return <Fuel {...props} />;
        }
    };

    return (
        <div style={{ padding: '16px', paddingBottom: '120px' }}>
            {/* Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={24} color="var(--color-text-heading)" />
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginLeft: 'var(--spacing-md)' }}>Appointment Details</h2>
            </div>

            {/* Status Card */}
            <div style={{ background: isDarkMode ? 'var(--color-surface)' : 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-md)', boxShadow: 'var(--shadow-sm)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-md)' }}>
                    {getIcon(appointment.service_type)}
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: isDarkMode ? 'white' : '#111827' }}>{appointment.service_type}</h2>
                <div style={{ color: '#34C759', fontWeight: '600', fontSize: '16px', textTransform: 'capitalize' }}>{appointment.status}</div>
            </div>

            {/* Details Card */}
            <div style={{ background: isDarkMode ? 'var(--color-surface)' : 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: isDarkMode ? '#1E293B' : '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)' }}>
                        <Calendar size={20} color={isDarkMode ? '#94A3B8' : "#374151"} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: isDarkMode ? 'white' : '#111827' }}>
                        {new Date(appointment.scheduled_time).toLocaleString()}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: isDarkMode ? '#1E293B' : '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)' }}>
                        <MapPin size={20} color={isDarkMode ? '#94A3B8' : "#374151"} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: isDarkMode ? 'white' : '#111827' }}>{appointment.location}</div>
                </div>

                {appointment.vehicle_name && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: isDarkMode ? '#1E293B' : '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)' }}>
                            <Car size={20} color={isDarkMode ? '#94A3B8' : "#374151"} />
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: isDarkMode ? 'white' : '#111827' }}>{appointment.vehicle_name}</div>
                    </div>
                )}
            </div>

            {/* Make Recurring Section */}
            {allowRecurring && (
                <div style={{ background: isDarkMode ? 'var(--color-surface)' : 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isRecurring ? 'var(--spacing-md)' : '0' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>Make Recurring</h3>
                            <p style={{ fontSize: '13px', color: '#666' }}>Schedule this service weekly</p>
                        </div>
                        <button
                            onClick={() => handleUpdateRecurring(!isRecurring, timesPerWeek)}
                            disabled={updating}
                            style={{
                                width: '44px',
                                height: '24px',
                                borderRadius: '12px',
                                background: isRecurring ? '#34C759' : '#E5E7EB',
                                position: 'relative',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                transition: 'none'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: 'white',
                                position: 'absolute',
                                left: isRecurring ? '22px' : '2px',
                                transition: 'none',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }} />
                        </button>
                    </div>

                    {isRecurring && (
                        <div style={{ borderTop: isDarkMode ? '1px solid #2A3650' : '1px solid #F2F4F7', paddingTop: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Times per week</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button
                                    onClick={() => handleUpdateRecurring(true, Math.max(1, timesPerWeek - 1))}
                                    disabled={updating}
                                    style={{ width: '24px', height: '24px', borderRadius: '50%', background: isDarkMode ? '#1E293B' : '#F2F4F7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <Minus size={14} color={isDarkMode ? '#94A3B8' : "#666"} />
                                </button>
                                <span style={{ fontSize: '16px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{timesPerWeek}</span>
                                <button
                                    onClick={() => handleUpdateRecurring(true, Math.min(7, timesPerWeek + 1))}
                                    disabled={updating}
                                    style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <Plus size={14} color="white" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Track Service Button */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'var(--spacing-md)',
                background: isDarkMode ? 'var(--color-background)' : 'white',
                borderTop: '1px solid var(--color-border)',
                zIndex: 10
            }}>
                <div className="container" style={{ minHeight: 'auto', padding: 0, margin: '0 auto' }}>
                    <button className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', height: '56px', fontSize: '18px', fontWeight: '700' }}>Track Service</button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentView;

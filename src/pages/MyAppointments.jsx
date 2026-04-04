import { useEffect, useState, useCallback } from 'react';
import { Zap, Fuel, Droplets, ChevronRight, Plus, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import PullToRefresh from '../components/ui/PullToRefresh';
import { LoadingSkeleton } from '../components/ui/LoadingSpinner';
import { showInfo } from '../components/ui/Toast';

const MyAppointments = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cache, updateCache } = useBooking();
    const [appointments, setAppointments] = useState(cache.appointments || []);
    const [loading, setLoading] = useState(!cache.appointments);
    const [activeTab, setActiveTab] = useState('upcoming');

    const fetchAppointments = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('user_id', user.id)
                .order('scheduled_time', { ascending: true });

            if (error) throw error;
            const appointmentsData = data || [];
            setAppointments(appointmentsData);
            updateCache('appointments', appointmentsData);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [user.id, updateCache]);

    useEffect(() => {
        if (user) {
            fetchAppointments();

            // Subscribe to realtime updates
            const subscription = supabase
                .channel('appointments-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'appointments',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('Realtime update:', payload);

                        if (payload.eventType === 'INSERT') {
                            setAppointments(prev => [...prev, payload.new]);
                        } else if (payload.eventType === 'UPDATE') {
                            setAppointments(prev =>
                                prev.map(app => app.id === payload.new.id ? payload.new : app)
                            );
                            // Show notification for status updates
                            if (payload.old.status !== payload.new.status) {
                                showInfo(`Status updated: ${getStatusLabel(payload.new.status)}`);
                            }
                        } else if (payload.eventType === 'DELETE') {
                            setAppointments(prev => prev.filter(app => app.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user, fetchAppointments]);

    const getServiceIcon = (type) => {
        const iconProps = { size: 24, color: "#007AFF" };
        switch (type?.toLowerCase()) {
            case 'refueling':
            case 'gas refueling': return <Fuel {...iconProps} />;
            case 'ev recharging':
            case 'charging': return <Zap {...iconProps} />;
            case 'detailing': return <Droplets {...iconProps} />;
            case 'maintenance': return <Wrench {...iconProps} />;
            default: return <Fuel {...iconProps} />;
        }
    };

    const getServiceTitle = (type) => {
        if (!type) return 'Service';
        // Handle both lowercase and title case
        const typeLC = type.toLowerCase();
        if (typeLC.includes('refueling') || typeLC.includes('gas')) return 'Re-fueling';
        if (typeLC.includes('ev') || typeLC.includes('charging')) return 'EV Recharging';
        if (typeLC.includes('detailing')) return 'Detailing';
        if (typeLC.includes('maintenance')) return 'Maintenance';
        return type;
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'driver_assigned': 'Driver Assigned',
            'driver_on_way': 'Driver on the Way',
            'in_progress': 'In Progress',
            'servicing': 'Servicing...',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': { bg: '#FEF3C7', text: '#92400E' },
            'confirmed': { bg: '#DBEAFE', text: '#1E40AF' },
            'driver_assigned': { bg: '#E0E7FF', text: '#3730A3' },
            'driver_on_way': { bg: '#FEE2E2', text: '#991B1B' },
            'in_progress': { bg: '#D1FAE5', text: '#065F46' },
            'servicing': { bg: '#D1FAE5', text: '#065F46' },
            'completed': { bg: '#D1D5DB', text: '#374151' },
            'cancelled': { bg: '#FEE2E2', text: '#991B1B' }
        };
        return colors[status] || { bg: '#E5E7EB', text: '#374151' };
    };

    const filteredAppointments = appointments.filter(app => {
        const appDate = new Date(app.scheduled_time);
        const now = new Date();
        if (activeTab === 'upcoming') {
            return appDate >= now && app.status !== 'completed' && app.status !== 'cancelled';
        } else {
            return appDate < now || app.status === 'completed' || app.status === 'cancelled';
        }
    });

    const handleRefresh = async () => {
        await fetchAppointments();
    };

    const handleAppointmentClick = (app) => {
        const type = app.service_type?.toLowerCase() || '';
        const path = type.includes('detailing') || type.includes('ceramic') || type.includes('paint')
            ? '/detailing-appointment-view'
            : '/appointment-view';

        navigate(path, { state: { appointment: app } });
    };

    if (loading) {
        return (
            <div style={{ padding: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>My Appointments</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {[1, 2, 3].map(i => (
                        <LoadingSkeleton key={i} height={80} borderRadius="var(--radius-lg)" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>My Appointments</h2>

                {/* Tabs */}
                <div style={{ padding: '4px', background: 'var(--color-surface)', borderRadius: '8px', display: 'flex', gap: '4px', marginBottom: 'var(--spacing-md)' }}>
                    {['Upcoming', 'Completed', 'Canceled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: activeTab === tab.toLowerCase() ? 'white' : 'transparent',
                                borderRadius: '6px',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: activeTab === tab.toLowerCase() ? 'black' : '#666',
                                boxShadow: activeTab === tab.toLowerCase() ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {filteredAppointments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: '#666' }}>
                            <p>No {activeTab} appointments found.</p>
                        </div>
                    ) : (
                        filteredAppointments.map((app) => {
                            const statusColors = getStatusColor(app.status);
                            return (
                                <div
                                    key={app.id}
                                    onClick={() => handleAppointmentClick(app)}
                                    style={{
                                        background: 'white',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: 'var(--spacing-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        boxShadow: 'var(--shadow-sm)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: '#E0F2FE',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 'var(--spacing-md)',
                                        flexShrink: 0
                                    }}>
                                        {getServiceIcon(app.service_type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '16px' }}>
                                                {getServiceTitle(app.service_type)}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    background: statusColors.bg,
                                                    color: statusColors.text
                                                }}
                                            >
                                                {getStatusLabel(app.status)}
                                            </span>
                                        </div>
                                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '2px' }}>
                                            {new Date(app.scheduled_time).toLocaleString()}
                                        </div>
                                        <div style={{ color: '#666', fontSize: '14px' }}>{app.location}</div>
                                    </div>
                                    <ChevronRight size={20} color="#999" />
                                </div>
                            );
                        })
                    )}
                </div >

                {/* Floating Action Button */}
                <button
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/new-service')}
                >
                    <Plus size={28} />
                </button>
            </div >
        </PullToRefresh >
    );
};

export default MyAppointments;

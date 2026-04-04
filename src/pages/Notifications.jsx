import { Calendar, Zap, CreditCard, Tag, Shield } from 'lucide-react';

const Notifications = () => {
    const notifications = [
        {
            id: 1,
            title: 'Appointment Confirmed',
            desc: 'Your detailing service is confirmed for Nov 22 at...',
            time: '5m ago',
            icon: <Calendar size={20} color="#007AFF" />,
            bg: '#E0F2FE',
            unread: true,
            section: 'Today'
        },
        {
            id: 2,
            title: 'Service Complete',
            desc: 'Your electric car recharge is complete and ready for...',
            time: '1h ago',
            icon: <Zap size={20} color="#007AFF" />,
            bg: '#E0F2FE',
            unread: false,
            section: 'Today'
        },
        {
            id: 3,
            title: 'Payment Successful',
            desc: 'Your payment of $45.50 for the car wash was...',
            time: 'Yesterday',
            icon: <CreditCard size={20} color="#007AFF" />,
            bg: '#E0F2FE',
            unread: true,
            section: 'This Week'
        },
        {
            id: 4,
            title: 'Exclusive 20% Off!',
            desc: 'Get 20% off your next interior detailing service. Offer ends...',
            time: '3d ago',
            icon: <Tag size={20} color="#34C759" />,
            bg: '#DCFCE7',
            unread: false,
            section: 'This Week'
        },
        {
            id: 5,
            title: 'Password Updated',
            desc: 'Your password was successfully updated on a...',
            time: '5d ago',
            icon: <Shield size={20} color="#007AFF" />,
            bg: '#E0F2FE',
            unread: false,
            section: 'This Week'
        }
    ];

    const grouped = notifications.reduce((acc, curr) => {
        (acc[curr.section] = acc[curr.section] || []).push(curr);
        return acc;
    }, {});

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-sm)' }}>
                <button style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '14px', background: 'none', border: 'none' }}>Clear All</button>
            </div>

            {Object.entries(grouped).map(([section, items]) => (
                <div key={section} style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>{section}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {items.map(item => (
                            <div key={item.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'start', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)', flexShrink: 0 }}>
                                    {item.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '600', fontSize: '16px' }}>{item.title}</span>
                                        <span style={{ color: '#999', fontSize: '12px' }}>{item.time}</span>
                                    </div>
                                    <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.4' }}>{item.desc}</div>
                                </div>
                                {item.unread && (
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF9500', marginTop: '6px', marginLeft: '8px' }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Notifications;

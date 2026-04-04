import { Calendar, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppointmentDetails = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: 'var(--spacing-xl) var(--spacing-md)', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Success Icon */}
            <div style={{
                width: '80px',
                height: '80px',
                background: '#E0F2FE',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-lg)'
            }}>
                <Check size={40} color="#007AFF" strokeWidth={3} />
            </div>

            {/* Success Message */}
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: 'var(--spacing-md)', color: '#1A1A1A' }}>All Set!</h1>
            <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', marginBottom: 'var(--spacing-xl)', maxWidth: '320px', margin: '0 auto var(--spacing-xl)' }}>
                Your appointment is booked. We've sent a confirmation and receipt to your email.
            </p>

            {/* Appointment Card */}
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-lg)',
                textAlign: 'left',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                marginBottom: 'var(--spacing-md)'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Premium Detailing</h2>
                <div style={{ color: '#666', fontSize: '14px', marginBottom: 'var(--spacing-lg)' }}>Honda Civic - Gray</div>

                <div style={{ borderTop: '1px solid #F2F4F7', paddingTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Calendar size={20} color="#1A1A1A" />
                        <span style={{ color: '#1A1A1A', fontWeight: '500' }}>Fri, October 27, 2024</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Clock size={20} color="#1A1A1A" />
                        <span style={{ color: '#1A1A1A', fontWeight: '500' }}>2:00 PM</span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--spacing-md)' }}>
                    <span style={{ color: '#666' }}>Total Paid</span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#1A1A1A' }}>$129.00</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '96px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <button
                    className="btn"
                    style={{ background: '#E0F2FE', color: '#007AFF', fontWeight: '700', border: 'none' }}
                    onClick={() => navigate('/appointments')}
                >
                    Track my appointment
                </button>
                <button
                    className="btn"
                    style={{ background: 'transparent', color: '#007AFF', fontWeight: '700' }}
                    onClick={() => navigate('/new-service')}
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default AppointmentDetails;

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, MessageSquare, Phone, Mail, ChevronRight } from 'lucide-react';
import { showSuccess } from '../components/ui/Toast';

const HelpSupport = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        { title: 'Account & Profile', content: 'Manage your personal details, password, and saved vehicles.' },
        { title: 'Scheduling a Service', content: 'Learn how to book, reschedule, or cancel your appointments.' },
        { title: 'Payments & Billing', content: 'Information about payment methods, receipts, and refunds.' },
        { title: 'Service Issues', content: 'Report a problem with a recent service or technician.' }
    ];

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ position: 'relative', marginBottom: 'var(--spacing-xl)' }}>
                <Search size={20} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="text"
                    placeholder="Search for help (e.g., 'payment issue')"
                    style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        borderRadius: 'var(--radius-lg)',
                        border: 'none',
                        fontSize: '16px',
                        background: 'white',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Frequently Asked Questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                {faqs.map((faq, index) => (
                    <div key={index} style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                        <button
                            onClick={() => toggleFaq(index)}
                            style={{ width: '100%', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                        >
                            <span style={{ fontWeight: '600', fontSize: '16px' }}>{faq.title}</span>
                            {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {openFaq === index && (
                            <div style={{ padding: '0 var(--spacing-md) var(--spacing-md) var(--spacing-md)', color: 'var(--color-text-body)', fontSize: '14px', lineHeight: '1.5' }}>
                                {faq.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Contact Us</h3>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', boxShadow: 'var(--shadow-sm)' }}>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: 'var(--spacing-lg)', lineHeight: '1.5' }}>
                    For immediate assistance, start a chat with our support team. We're here to help you 24/7.
                </p>
                <button className="btn btn-primary" disabled style={{ background: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'not-allowed', opacity: 0.7 }}>
                    <MessageSquare size={20} />
                    Start a Chat (Coming Soon)
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-border)', cursor: 'not-allowed', opacity: 0.6 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)' }}>
                        <Phone size={24} color="#64748B" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>Call Us (Coming Soon)</div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Mon-Fri, 9am - 5pm EST</div>
                    </div>
                </div>

                <div onClick={() => showSuccess('Please email us at support@gofuel.world!')} style={{ padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)' }}>
                        <Mail size={24} color="#166534" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>Send us an Email</div>
                        <div style={{ color: '#666', fontSize: '14px' }}>We'll reply within 24 hours</div>
                    </div>
                    <ChevronRight size={20} color="#999" />
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;

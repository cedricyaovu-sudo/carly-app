import { useState } from 'react';
import { ChevronDown, ChevronUp, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
    const [openSection, setOpenSection] = useState('collect');

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const sections = [
        {
            id: 'collect',
            title: 'Information We Collect',
            content: (
                <>
                    <p style={{ marginBottom: '12px' }}>To provide our services, we collect several types of information:</p>
                    <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li><strong>Personal Data:</strong> Name, email address, and contact information.</li>
                        <li><strong>Vehicle Information:</strong> Make, model, and VIN to match you with the right services.</li>
                        <li><strong>Location Data:</strong> To find nearby refueling, charging, and maintenance stations.</li>
                        <li><strong>Payment Information:</strong> Processed securely by our third-party partner (e.g., Stripe). We do not store your full card details.</li>
                        <li><strong>Usage Data:</strong> Information on how you interact with our app to help us improve your experience.</li>
                    </ul>
                </>
            )
        },
        {
            id: 'use',
            title: 'How We Use Your Information',
            content: 'We use your information to provide and improve our services, process payments, and communicate with you.'
        },
        {
            id: 'share',
            title: 'Data Sharing and Disclosure',
            content: 'We do not sell your personal data. We may share data with service providers who assist in our operations.'
        },
        {
            id: 'rights',
            title: 'Your Rights and Choices',
            content: 'You have the right to access, correct, or delete your personal information. Contact us for assistance.'
        }
    ];

    return (
        <div style={{ paddingBottom: '40px' }}>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: 'var(--spacing-md)' }}>Last Updated: October 26, 2023</p>

            <p style={{ marginBottom: 'var(--spacing-lg)', lineHeight: '1.6' }}>
                Welcome to GoFuel! Your privacy is important to us. This Privacy Policy explains how we collect, use, and share information about you when you use our app and services. By using GoFuel, you agree to the collection and use of information in accordance with this policy.
            </p>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', overflowX: 'auto', marginBottom: 'var(--spacing-lg)', paddingBottom: '4px' }}>
                {['Data We Collect', 'How We Use It', 'Data Sharing'].map((tag, i) => (
                    <div key={i} style={{ padding: '8px 16px', background: i === 0 ? '#E0F2FE' : '#F2F4F7', color: i === 0 ? 'var(--color-primary)' : 'var(--color-text-heading)', borderRadius: 'var(--radius-full)', fontSize: '14px', whiteSpace: 'nowrap', fontWeight: '500' }}>
                        {tag}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {sections.map((section) => (
                    <div key={section.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                        <button
                            onClick={() => toggleSection(section.id)}
                            style={{ width: '100%', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: 'none', textAlign: 'left' }}
                        >
                            <span style={{ fontWeight: '600', fontSize: '16px' }}>{section.title}</span>
                            {openSection === section.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {openSection === section.id && (
                            <div style={{ padding: '0 var(--spacing-md) var(--spacing-md) var(--spacing-md)', color: 'var(--color-text-body)', fontSize: '14px', lineHeight: '1.5' }}>
                                {section.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'var(--spacing-xl)', background: '#E0F2FE', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: 'var(--spacing-sm)' }}>Contact Us</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-md)' }}>
                    If you have any questions about this Privacy Policy, you can contact our Data Protection Officer.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-primary)', fontWeight: '500' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={16} color="white" />
                    </div>
                    support@gofuel.world
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

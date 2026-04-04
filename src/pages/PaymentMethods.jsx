import { Plus, MoreVertical } from 'lucide-react';

const PaymentMethods = () => {
    return (
        <div style={{ paddingBottom: '80px' }}>
            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: 'var(--spacing-md)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Saved Cards</div>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ width: '40px', height: '28px', background: '#F5F5F5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)' }}>
                        <div style={{ width: '20px', height: '12px', background: '#FF5F00', borderRadius: '2px' }}></div> {/* Mastercard placeholder */}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            •••• •••• •••• 8888
                            <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Default</span>
                        </div>
                        <div style={{ color: '#999', fontSize: '14px' }}>Expires 12/25</div>
                    </div>
                    <MoreVertical size={20} color="#999" />
                </div>

                <div style={{ padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '28px', background: '#F5F5F5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)' }}>
                        <div style={{ width: '20px', height: '12px', background: '#1A1F71', borderRadius: '2px' }}></div> {/* Visa placeholder */}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>•••• •••• •••• 5678</div>
                        <div style={{ color: '#999', fontSize: '14px' }}>Expires 08/26</div>
                    </div>
                    <MoreVertical size={20} color="#999" />
                </div>
            </div>

            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: 'var(--spacing-md)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Other Methods</div>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '40px', height: '28px', background: 'black', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)' }}>
                    <div style={{ color: 'white', fontSize: '10px' }}></div>
                </div>
                <div style={{ flex: 1, fontWeight: '600' }}>Apple Pay</div>
                <MoreVertical size={20} color="#999" />
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', background: 'white', borderTop: '1px solid var(--color-border)', zIndex: 10 }}>
                <div style={{ width: '100%', maxWidth: '565px', padding: 'var(--spacing-md)' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }}>
                        <Plus size={20} style={{ marginRight: '8px' }} />
                        Add New Method
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethods;

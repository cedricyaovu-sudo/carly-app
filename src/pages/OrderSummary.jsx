import { Trash2, Zap, Car, Fuel, Wrench, Sparkles, Droplets, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { usePricing } from '../hooks/usePricing';

const OrderSummary = () => {
    const navigate = useNavigate();
    const { bookingData, updateBooking } = useBooking();
    const { calculateSubtotal, fuelCostOnly, taxes, deliveryFee, detailedBreakdown, serviceFee, promoDiscount } = usePricing();

    const icons = {
        'Gas Refueling': <Fuel size={24} color="#007AFF" />,
        'EV Recharging': <Zap size={24} color="#007AFF" />,
        'Detailing': <Droplets size={24} color="#007AFF" />,
        'Maintenance': <Wrench size={24} color="#007AFF" />,
        'Mechanic Work': <Wrench size={24} color="#007AFF" />,
        'Paint Correction': <Sparkles size={24} color="#007AFF" />,
        'Ceramic Coating': <Shield size={24} color="#007AFF" />
    };

    const removeService = (serviceName) => {
        const remaining = bookingData.selectedServices.filter(s => s !== serviceName);
        const newServiceType = bookingData.serviceType === serviceName ? (remaining[0] || '') : bookingData.serviceType;

        // Reverse map of service display names to their add-on keys. detailedBreakdown
        // in usePricing re-adds anything in bookingData.details.addOns that isn't in
        // selectedServices, so we must also clear the matching addOn flag here.
        const addOnKeyMap = {
            'EV Recharging': ['recharging', 'ev-recharging', 'ev'],
            'Detailing': ['detailing'],
            'Maintenance': ['maintenance'],
            'Mechanic Work': ['mechanic'],
            'Gas Refueling': ['refueling', 'fuel'],
            'Paint Correction': ['paint-correction'],
            'Ceramic Coating': ['coating']
        };

        const clearedAddOns = { ...(bookingData.details?.addOns || {}) };
        (addOnKeyMap[serviceName] || []).forEach(key => {
            clearedAddOns[key] = 0;
        });

        updateBooking({
            selectedServices: remaining,
            serviceType: newServiceType,
            details: { addOns: clearedAddOns }
        });
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Selected Services</h2>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-xl)' }}>
                {detailedBreakdown.length > 0 ? detailedBreakdown.map((item, index) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', padding: 'var(--spacing-md)', borderBottom: index < detailedBreakdown.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)', flexShrink: 0 }}>
                            {icons[item.name.replace(/ \(x\d+\)$/, '')] || <Car size={24} color="#007AFF" />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{item.name}</div>
                            <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                                ${item.name === 'Gas Refueling' && fuelCostOnly > 0 
                                    ? (fuelCostOnly / 100).toFixed(2) 
                                    : (item.price / 100).toFixed(2)}
                                {item.surgeApplied && <span style={{ color: '#F59E0B', marginLeft: '8px', fontSize: '12px' }}>Peak Pricing Applied</span>}
                            </div>
                            <div style={{ color: '#999', fontSize: '12px' }}>{bookingData.serviceType === item.name.replace(/ \(x\d+\)$/, '') ? 'Primary Service' : 'Additional Service'}</div>
                        </div>
                        <button onClick={() => removeService(item.name.replace(/ \(x\d+\)$/, ''))} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
                            <Trash2 size={20} color="#EF4444" />
                        </button>
                    </div>
                )) : (
                    <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: '#999' }}>No services selected</div>
                )}
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Promo Code</h2>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                <input
                    type="text"
                    placeholder="Enter promo code"
                    value={bookingData.promoCode || ''}
                    onChange={(e) => updateBooking({ promoCode: e.target.value })}
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        fontSize: '16px',
                        outline: 'none'
                    }}
                />
                <button
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '0 24px', borderRadius: 'var(--radius-lg)' }}
                >
                    Apply
                </button>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Cost Breakdown</h2>
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                    <span style={{ color: '#666' }}>Subtotal</span>
                    <span style={{ fontWeight: '600' }}>${(calculateSubtotal / 100).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                    <span style={{ color: '#666' }}>Delivery Fee</span>
                    <span style={{ fontWeight: '600' }}>${(deliveryFee / 100).toFixed(2)}</span>
                </div>
                {serviceFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#666' }}>Service Fees</span>
                        <span style={{ fontWeight: '600' }}>${(serviceFee / 100).toFixed(2)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                    <span style={{ color: '#666' }}>Taxes</span>
                    <span style={{ fontWeight: '600' }}>${(taxes / 100).toFixed(2)}</span>
                </div>
                {promoDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'green' }}>
                        <span style={{ fontWeight: '500' }}>Promo Discount</span>
                        <span style={{ fontWeight: '600' }}>-${(promoDiscount / 100).toFixed(2)}</span>
                    </div>
                )}
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 'var(--spacing-md)', background: 'var(--color-background)', borderTop: '1px solid var(--color-border)', zIndex: 100 }}>
                <div style={{ minHeight: 'auto', padding: 0, margin: '0 auto', maxWidth: '565px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <span style={{ color: 'var(--color-text-heading)', fontSize: '18px', fontWeight: '700' }}>Total</span>
                        <span style={{ color: 'var(--color-primary)', fontSize: '24px', fontWeight: '700' }}>${((calculateSubtotal - promoDiscount + taxes + deliveryFee + (serviceFee || 0)) / 100).toFixed(2)}</span>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;

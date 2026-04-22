import { useState, useEffect } from 'react';
import { MapPin, Plus, Minus, Fuel, Car, Wrench, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useBooking } from '../contexts/BookingContext';
import { useServices } from '../hooks/useServices';
import { verifyAddressWithUSPS } from '../services/uspsService';
import { usePricing } from '../hooks/usePricing';
import AddressAutocomplete from '../components/AddressAutocomplete';

const EVRecharging = () => {
    const navigate = useNavigate();
    const { bookingData, updateBooking, markServiceVisited, getNextServiceRoute } = useBooking();
    const { isServiceVisible, isServiceComingSoon } = useServices();

    useEffect(() => {
        markServiceVisited('EV Recharging');

        // Full State Restoration
        if (bookingData.location) setAddress(bookingData.location);

        if (bookingData.details?.addOns) {
            setAddOns(prev => ({ ...prev, ...bookingData.details.addOns }));
        }

        const details = bookingData.details?.['EV Recharging'];
        if (details) {
            if (details.carCount) setCarCount(details.carCount);
            if (details.kwh) setKwh(details.kwh);
        }
    }, []);

    // Helper map to bridge add-on toggle IDs and service names
    const serviceNameMap = {
        'refueling': 'Gas Refueling',
        'detailing': 'Detailing',
        'maintenance': 'Maintenance',
        'mechanic': 'Mechanic Work',
        'paint-correction': 'Paint Correction'
    };

    const [carCount, setCarCount] = useState(1);
    const [address, setAddress] = useState(bookingData.location || '');
    const [addressError, setAddressError] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [addressErrorMessage, setAddressErrorMessage] = useState('Please enter an address');
    const [addOns, setAddOns] = useState({
        refueling: 0,
        detailing: 0,
        maintenance: 0,
        mechanic: 0,
        'paint-correction': 0,
        coating: 0
    });
    const [kwh, setKwh] = useState(50);

    const toggleAddOn = (key) => {
        const isComingSoon = isServiceComingSoon(key);
        if (isComingSoon) return;

        const serviceName = serviceNameMap[key];
        const isCurrentlySelected = addOns[key] > 0;

        // Update local state
        setAddOns(prev => ({ ...prev, [key]: isCurrentlySelected ? 0 : 1 }));

        // Update global selectedServices queue
        if (serviceName) {
            const currentServices = [...(bookingData.selectedServices || [])];
            if (!isCurrentlySelected) {
                // Add to queue
                updateBooking({
                    selectedServices: Array.from(new Set([...currentServices, serviceName])),
                    // Initialize carCount to 1 in the global state for this service
                    details: {
                        [serviceName]: { ...(bookingData.details?.[serviceName] || {}), carCount: 1 }
                    }
                });
            } else {
                // Remove from queue (if not primary serviceType)
                if (bookingData.serviceType !== serviceName) {
                    updateBooking({ selectedServices: currentServices.filter(s => s !== serviceName) });
                }
            }
        }
    };

    const handleAddOnCountChange = (key, count) => {
        const serviceName = serviceNameMap[key];
        const numCount = parseInt(count);
        setAddOns(prev => ({ ...prev, [key]: numCount }));

        if (serviceName) {
            updateBooking({
                details: {
                    [serviceName]: { ...(bookingData.details?.[serviceName] || {}), carCount: numCount }
                }
            });
        }
    };

    const { isDarkMode } = useTheme();

    const theme = {
        bg: isDarkMode ? 'var(--color-background)' : 'white',
        text: isDarkMode ? 'var(--color-text-heading)' : '#111827',
        textSecondary: isDarkMode ? 'var(--color-text-body)' : '#64748B',
        cardBg: isDarkMode ? 'var(--color-surface)' : '#E0F2FE',
        iconBoxBg: isDarkMode ? '#00C2CB' : '#BAE6FD',
        iconColor: isDarkMode ? 'white' : '#0284C7',
        inputBg: isDarkMode ? 'var(--color-input-bg)' : '#F8FAFC',
        border: isDarkMode ? 'var(--color-border)' : '#E5E7EB',
        dotInactive: isDarkMode ? '#374151' : '#E5E7EB',
        dotActive: isDarkMode ? '#00C2CB' : '#06B6D4',
        buttonBg: isDarkMode ? '#374151' : '#DBEAFE',
        buttonText: isDarkMode ? 'white' : '#1E40AF',
        primaryBtn: isDarkMode ? '#00C2CB' : '#007AFF'
    };

    const { calculateSubtotal } = usePricing();

    const handleNext = async () => {
        if (!address.trim()) {
            setAddressErrorMessage('Please enter an address');
            setAddressError(true);
            return;
        }

        setIsVerifying(true);
        const uspsResult = await verifyAddressWithUSPS(address);
        setIsVerifying(false);

        if (!uspsResult.isValid) {
            setAddressErrorMessage(uspsResult.message || 'Invalid address according to USPS');
            setAddressError(true);
            return;
        }

        updateBooking({
            serviceType: 'EV Recharging',
            location: address,
            details: {
                ...bookingData.details,
                'EV Recharging': {
                    ...(bookingData.details?.['EV Recharging'] || {}),
                    carCount,
                    kwh
                },
                addOns: { ...bookingData.details?.addOns, ...addOns }
            }
        });
        navigate(getNextServiceRoute());
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Progress Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.dotInactive }} />
                <div style={{ width: '24px', height: '8px', borderRadius: '4px', background: theme.dotActive }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.dotInactive }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.dotInactive }} />
            </div>

            {/* Car Count */}
            <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: theme.iconBoxBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Car size={20} color={theme.iconColor} />
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>Number of cars</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => setCarCount(Math.max(1, carCount - 1))}
                        style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', borderRadius: '50%', background: theme.buttonBg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: theme.buttonText, flexShrink: 0, padding: 0 }}
                    >
                        <Minus size={16} />
                    </button>
                    <span style={{ fontWeight: '600', fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>{carCount}</span>
                    <button
                        onClick={() => setCarCount(carCount + 1)}
                        style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', borderRadius: '50%', background: theme.primaryBtn, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0, padding: 0 }}
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: theme.textSecondary, fontSize: '14px', fontWeight: '500' }}>Service Location</label>
                <div style={{ position: 'relative' }}>
                    <AddressAutocomplete
                        placeholder="Enter your address"
                        value={address}
                        onChange={(val) => {
                            setAddress(val);
                            if (addressError) setAddressError(false);
                        }}
                        hasError={addressError}
                        mapPinColor={theme.primaryBtn}
                        style={{
                            width: '100%',
                            padding: '16px 48px 16px 16px',
                            borderRadius: 'var(--radius-lg)',
                            border: addressError ? '1px solid #EF4444' : `1px solid ${theme.border}`,
                            fontSize: '16px',
                            background: theme.inputBg,
                            color: theme.text
                        }}
                    />
                </div>
                {addressError && (
                    <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', marginTop: '4px', marginLeft: '4px' }}>
                        {addressErrorMessage}
                    </div>
                )}
            </div>



            {/* kWh Amount Slider */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ color: theme.textSecondary, fontSize: '14px', fontWeight: '500' }}>Charging Amount</label>
                    <span style={{ fontWeight: '700', color: theme.primaryBtn, fontSize: '18px' }}>{kwh} kWh</span>
                </div>
                <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={kwh}
                    onChange={(e) => setKwh(parseInt(e.target.value))}
                    style={{
                        width: '100%',
                        height: '6px',
                        background: theme.dotInactive,
                        borderRadius: '3px',
                        outline: 'none',
                        appearance: 'none',
                        cursor: 'pointer'
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: theme.textSecondary, fontSize: '12px', marginBottom: 'var(--spacing-lg)' }}>
                    <span>10 kWh</span>
                    <span>100 kWh</span>
                </div>

                <div style={{ textAlign: 'center', margin: 'var(--spacing-lg) 0' }}>
                    <span style={{ fontWeight: '800', fontSize: '16px', color: theme.textSecondary }}>OR</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <button
                        style={{
                            background: theme.cardBg,
                            color: theme.text,
                            border: `1px solid ${theme.border}`,
                            borderRadius: 'var(--radius-lg)',
                            padding: '16px',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        I don't know
                    </button>
                    <button
                        style={{
                            background: theme.cardBg,
                            color: theme.text,
                            border: `1px solid ${theme.border}`,
                            borderRadius: 'var(--radius-lg)',
                            padding: '16px',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        Just fill up my battery!
                    </button>
                </div>
            </div>

            {/* Cross-sell */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Want to add another service?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {[
                    { id: 'refueling', title: 'Refueling', desc: 'For your gas-powered vehicles', icon: <Fuel size={20} color={theme.iconColor} /> },
                    { id: 'detailing', title: 'Car Detailing', desc: 'Interior and exterior cleaning', icon: <Car size={20} color={theme.iconColor} /> },
                    { id: 'maintenance', title: 'Maintenance Check', desc: 'Fluid top-up and tire check', icon: <Wrench size={20} color={theme.iconColor} /> },
                    { id: 'mechanic', title: 'Mechanic Work', desc: 'General repairs & diagnostics', icon: <Wrench size={20} color={theme.iconColor} /> },
                    { id: 'paint-correction', title: 'Paint Correction', desc: 'Professional paint restoration', icon: <Sparkles size={20} color={theme.iconColor} /> },
                    { id: 'coating', title: 'Ceramic Coating', desc: "Protective layer for your car's paint", icon: <Shield size={20} color={theme.iconColor} /> }
                ].filter(s => isServiceVisible(s.id) && serviceNameMap[s.id] !== bookingData.serviceType).map((service) => {
                    const isComingSoon = isServiceComingSoon(service.id);
                    const serviceName = serviceNameMap[service.id];
                    const isVisited = serviceName && bookingData.visitedServices.includes(serviceName);

                    return (
                        <div key={service.id} style={{
                            background: theme.cardBg,
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: isComingSoon ? 0.6 : 1,
                            filter: isComingSoon ? 'grayscale(100%)' : 'none'
                        }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: theme.iconBoxBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)', flexShrink: 0 }}>
                                {service.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px', width: '180px' }}>{service.title}</div>
                                        {isComingSoon && (
                                            <span style={{ fontSize: '10px', fontWeight: '700', color: theme.textSecondary }}>COMING SOON</span>
                                        )}
                                    </div>
                                    {addOns[service.id] > 0 && (
                                        <select
                                            value={addOns[service.id] >= 11 ? '11+' : addOns[service.id]}
                                            onChange={(e) => handleAddOnCountChange(service.id, e.target.value === '11+' ? 11 : e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                padding: '2px 6px',
                                                borderRadius: 'var(--radius-sm)',
                                                border: '1px solid white',
                                                fontSize: '12px',
                                                background: 'transparent',
                                                color: theme.text,
                                                marginBottom: '4px'
                                            }}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '11+'].map(num => (
                                                <option key={num} value={num} style={{ color: 'black' }}>{num} Car{num !== 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div style={{ color: theme.textSecondary, fontSize: '14px' }}>{service.desc}</div>
                            </div>
                            <div
                                onClick={() => {
                                    if (!isComingSoon && !isVisited) {
                                        toggleAddOn(service.id);
                                    }
                                }}
                                style={{
                                    width: '50px',
                                    height: '30px',
                                    background: addOns[service.id] > 0 ? theme.primaryBtn : theme.dotInactive,
                                    borderRadius: '15px',
                                    position: 'relative',
                                    cursor: (isComingSoon || isVisited) ? 'not-allowed' : 'pointer',
                                    transition: 'none',
                                    opacity: isVisited ? 0.7 : 1
                                }}
                            >
                                <div style={{
                                    width: '26px',
                                    height: '26px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: addOns[service.id] > 0 ? '22px' : '2px',
                                    transition: 'none',
                                    boxShadow: 'var(--shadow-sm)'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Button - Floating */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', background: theme.bg, borderTop: `1px solid ${theme.border}`, zIndex: 10 }}>
                <div style={{ width: '100%', maxWidth: '565px', padding: 'var(--spacing-md)' }}>
                    <button
                        className="btn"
                        onClick={handleNext}
                        disabled={isVerifying}
                        style={{
                            width: '100%',
                            background: theme.primaryBtn,
                            color: 'white',
                            fontWeight: '700',
                            padding: '16px',
                            borderRadius: 'var(--radius-lg)',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        {getNextServiceRoute() === '/select-date-time' ? 'Continue to Select Date & Time' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EVRecharging;

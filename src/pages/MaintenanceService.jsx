import { useState, useEffect } from 'react';
import { MapPin, Plus, Minus, Fuel, Zap, Car, Sparkles, ChevronLeft, Wrench } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTheme } from '../contexts/ThemeContext';
import { useServices } from '../hooks/useServices';
import { usePricing } from '../hooks/usePricing';
import { verifyAddressWithUSPS } from '../services/uspsService';
import AddressAutocomplete from '../components/AddressAutocomplete';

const MaintenanceService = () => {
    const navigate = useNavigate();
    const locationPath = useLocation();
    const { bookingData, updateBooking, markServiceVisited, getNextServiceRoute } = useBooking();
    const { isServiceVisible, isServiceComingSoon } = useServices();

    useEffect(() => {
        const currentService = locationPath.pathname.includes('/mechanic') ? 'Mechanic Work' : 'Maintenance';
        markServiceVisited(currentService);

        // Full State Restoration
        if (bookingData.location) setLocation(bookingData.location);

        if (bookingData.details?.addOns) {
            setAddOns(prev => ({ ...prev, ...bookingData.details.addOns }));
        }

        const details = bookingData.details['Maintenance'];
        if (details) {
            if (details.carCount) setCarCount(details.carCount);
        }
    }, []);

    // Helper map to bridge add-on toggle IDs and service names
    const serviceNameMap = {
        'ev': 'EV Recharging',
        'recharging': 'EV Recharging',
        'fuel': 'Gas Refueling',
        'refueling': 'Gas Refueling',
        'detailing': 'Detailing',
        'paint-correction': 'Paint Correction',
        'maintenance': 'Maintenance',
        'mechanic': 'Mechanic Work'
    };

    const [carCount, setCarCount] = useState(1);
    const [location, setLocation] = useState(bookingData.location || '');
    const [showAddressError, setShowAddressError] = useState(false);
    const [addOns, setAddOns] = useState({
        fuel: 0,
        ev: 0,
        detailing: 0,
        'paint-correction': 0,
        ceramic: 0,
        maintenance: 0,
        mechanic: 0
    });
    const [isVerifying, setIsVerifying] = useState(false);
    const [addressErrorMessage, setAddressErrorMessage] = useState('Please enter an address');

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
                        [serviceName]: { ...bookingData.details[serviceName], carCount: 1 }
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
                    ...bookingData.details, // Preserve other details
                    [serviceName]: { ...bookingData.details[serviceName], carCount: numCount }
                }
            });
        }
    };

    const { isDarkMode } = useTheme();

    const theme = {
        bg: isDarkMode ? 'var(--color-background)' : 'white',
        text: isDarkMode ? 'var(--color-text-heading)' : '#111827',
        textSecondary: isDarkMode ? 'var(--color-text-body)' : '#64748B',
        cardBg: isDarkMode ? 'var(--color-surface)' : 'white',
        iconBoxBg: isDarkMode ? '#00C2CB' : '#E0F2FE',
        iconColor: isDarkMode ? 'white' : '#007AFF',
        inputBg: isDarkMode ? 'var(--color-input-bg)' : 'white',
        border: isDarkMode ? 'var(--color-border)' : '#E5E7EB',
        dotInactive: isDarkMode ? '#374151' : '#E5E7EB',
        dotActive: isDarkMode ? '#00C2CB' : '#06B6D4',
        buttonBg: isDarkMode ? '#374151' : '#F2F4F7',
        buttonText: isDarkMode ? 'white' : '#1E40AF',
        primaryBtn: isDarkMode ? '#00C2CB' : '#007AFF'
    };

    const { calculateSubtotal } = usePricing();

    const getPrice = () => {
        return calculateSubtotal / 100;
    };

    const handleNext = async () => {
        if (!location || location.trim() === '') {
            setAddressErrorMessage('Please enter an address');
            setShowAddressError(true);
            return;
        }

        setIsVerifying(true);
        const uspsResult = await verifyAddressWithUSPS(location);
        setIsVerifying(false);

        if (!uspsResult.isValid) {
            setAddressErrorMessage(uspsResult.message || 'Invalid address according to USPS');
            setShowAddressError(true);
            return;
        }

        const isMechanic = locationPath.pathname.includes('/mechanic');
        const currentService = isMechanic ? 'Mechanic Work' : 'Maintenance';
        updateBooking({
            serviceType: currentService,
            location: location || bookingData.location,
            details: {
                ...bookingData.details,
                [currentService]: { ...bookingData.details[currentService], carCount },
                addOns: { ...bookingData.details?.addOns, ...addOns }
            }
        });
        navigate(getNextServiceRoute());
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Car Count */}
            <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: theme.iconBoxBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDarkMode ? 'white' : 'var(--color-primary)' }}>
                        <Car size={24} color={isDarkMode ? 'white' : 'var(--color-primary)'} />
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '16px', color: theme.text }}>How many cars?</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => setCarCount(Math.max(1, carCount - 1))}
                        style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', borderRadius: '50%', background: theme.buttonBg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 }}
                    >
                        <Minus size={16} color={isDarkMode ? 'white' : '#666'} />
                    </button>
                    <span style={{ fontWeight: '600', fontSize: '16px', minWidth: '20px', textAlign: 'center', color: theme.text }}>{carCount}</span>
                    <button
                        onClick={() => setCarCount(carCount + 1)}
                        style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', borderRadius: '50%', background: theme.primaryBtn, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0, padding: 0 }}
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Service Location */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: theme.text }}>Service Location</h3>
                <div style={{ position: 'relative' }}>
                    <AddressAutocomplete
                        placeholder="Enter your address"
                        value={location}
                        onChange={(val) => {
                            setLocation(val);
                            if (showAddressError) setShowAddressError(false);
                        }}
                        hasError={showAddressError}
                        mapPinColor={theme.primaryBtn}
                        style={{
                            width: '100%',
                            padding: '16px 48px 16px 16px',
                            borderRadius: 'var(--radius-lg)',
                            border: showAddressError ? '1px solid #EF4444' : `1px solid ${theme.border}`,
                            fontSize: '16px',
                            background: theme.inputBg,
                            color: theme.text
                        }}
                    />
                </div>
            {showAddressError && (
                <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', marginTop: '4px', marginLeft: '4px', marginBottom: '8px' }}>
                    {addressErrorMessage}
                </div>
            )}

            <div style={{ borderTop: `1px solid ${theme.border}`, margin: '0 -16px var(--spacing-lg) -16px' }} />

            {/* Cross-sell */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)', color: theme.text }}>Want to add another service?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {[
                    { id: 'fuel', title: 'Fuel Top-up', desc: "We'll fill the tank.", icon: <Fuel size={24} color={isDarkMode ? 'white' : '#007AFF'} />, bg: theme.iconBoxBg },
                    { id: 'recharging', title: 'EV Charge', desc: 'Full recharge for your electric vehicle.', icon: <Zap size={24} color={isDarkMode ? 'white' : '#007AFF'} />, bg: theme.iconBoxBg },
                    { id: 'detailing', title: 'Car Detailing', desc: 'Interior & exterior cleaning.', icon: <Car size={24} color={isDarkMode ? 'white' : '#007AFF'} />, bg: theme.iconBoxBg },
                    { id: 'maintenance', title: 'Maintenance', desc: 'Fluid top-up and tire check.', icon: <Wrench size={24} color={isDarkMode ? 'white' : '#007AFF'} />, bg: theme.iconBoxBg },
                    { id: 'mechanic', title: 'Mechanic Work', desc: 'General repairs & diagnostics.', icon: <Wrench size={24} color={isDarkMode ? 'white' : '#007AFF'} />, bg: theme.iconBoxBg },
                    { id: 'paint-correction', title: 'Paint Correction', desc: 'Professional paint restoration.', icon: <Sparkles size={24} color={isDarkMode ? 'white' : '#007AFF'} />, bg: theme.iconBoxBg },
                    { id: 'coating', title: 'Ceramic Coating', desc: 'Long-lasting paint protection.', icon: <Sparkles size={24} color={isDarkMode ? 'white' : '#007AFF'} />, bg: theme.iconBoxBg }
                ].filter(s => isServiceVisible(s.id) && serviceNameMap[s.id] !== (bookingData.serviceType || 'Maintenance')).map((service) => {
                    const isComingSoon = isServiceComingSoon(service.id);
                    const serviceName = serviceNameMap[service.id];
                    const isVisited = serviceName && bookingData.visitedServices.includes(serviceName);

                    return (
                        <div key={service.id} style={{
                            background: theme.cardBg,
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            boxShadow: 'var(--shadow-sm)',
                            opacity: isComingSoon ? 0.6 : 1,
                            filter: isComingSoon ? 'grayscale(100%)' : 'none'
                        }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: service.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)', flexShrink: 0 }}>
                                {service.icon}
                            </div>
                            <div style={{ flex: 1, paddingTop: '2px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px', color: theme.text, maxWidth: '130px' }}>{service.title}</div>
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
                                                color: 'black',
                                                marginBottom: '4px',
                                                marginLeft: '8px'
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
                                    opacity: isVisited ? 0.7 : 1,
                                    marginTop: '8px'
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

            {/* Footer */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', background: isDarkMode ? theme.bg : 'var(--color-background)', borderTop: `1px solid ${theme.border}`, boxShadow: '0 -4px 12px rgba(0,0,0,0.05)', zIndex: 10 }}>
                <div style={{ width: '100%', maxWidth: '565px', padding: 'var(--spacing-md)' }}>
                    <button className="btn btn-primary" onClick={handleNext} style={{ width: '100%', background: theme.primaryBtn }} disabled={isVerifying}>
                        {isVerifying ? 'Verifying Address...' : (getNextServiceRoute() === '/select-date-time' ? 'Continue to Schedule' : 'Next')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceService;

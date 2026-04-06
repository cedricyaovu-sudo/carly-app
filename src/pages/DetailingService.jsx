import { useState, useEffect } from 'react';
import { MapPin, Plus, Minus, Fuel, Zap, Wrench, Sparkles, Info, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTheme } from '../contexts/ThemeContext';
import { useServices } from '../hooks/useServices';
import { verifyAddressWithUSPS } from '../services/uspsService';
import { usePricing } from '../hooks/usePricing';
import AddressAutocomplete from '../components/AddressAutocomplete';

const DetailingService = () => {
    const navigate = useNavigate();
    const { bookingData, updateBooking, markServiceVisited, getNextServiceRoute } = useBooking();
    const { isServiceVisible, isServiceComingSoon } = useServices();

    useEffect(() => {
        markServiceVisited('Detailing');

        // Full State Restoration
        if (bookingData.location) setAddress(bookingData.location);

        if (bookingData.details?.addOns) {
            setAddOns(prev => ({ ...prev, ...bookingData.details.addOns }));
        }

        const details = bookingData.details['Detailing'];
        if (details) {
            if (details.carCount) {
                // Use handleCarCountChange to sync vehicleTypes array size first
                handleCarCountChange(details.carCount);
            }
            // Override with actual saved values
            if (details.vehicleTypes) setVehicleTypes(details.vehicleTypes);

            // Check for ceramic coating (could be in details or addOns)
            if (bookingData.details?.addOns?.coating !== undefined) {
                setCeramicCoating(bookingData.details.addOns.coating);
            }
            if (details.isSemiTruck) setIsSemiTruck(true);
        }
    }, []);

    // Helper map to bridge add-on toggle IDs and service names
    const serviceNameMap = {
        'recharging': 'EV Recharging',
        'ev': 'EV Recharging',
        'detailing': 'Detailing',
        'maintenance': 'Maintenance',
        'mechanic': 'Mechanic Work',
        'paint-correction': 'Paint Correction'
    };

    const [carCount, setCarCount] = useState(1);
    const [vehicleTypes, setVehicleTypes] = useState(['Sedan']);
    const [ceramicCoating, setCeramicCoating] = useState(0);
    const [isSemiTruck, setIsSemiTruck] = useState(false);
    const [address, setAddress] = useState(bookingData.location || '');
    const [showAddressError, setShowAddressError] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [addressErrorMessage, setAddressErrorMessage] = useState('Please enter an address');
    const [addOns, setAddOns] = useState({
        detailing: 0,
        maintenance: 0,
        mechanic: 0,
        'paint-correction': 0
    });

    const { isDarkMode } = useTheme();

    const theme = {
        bg: isDarkMode ? 'var(--color-background)' : 'white',
        text: isDarkMode ? 'var(--color-text-heading)' : '#111827',
        textSecondary: isDarkMode ? 'var(--color-text-body)' : '#64748B',
        cardBg: isDarkMode ? 'var(--color-surface)' : 'white',
        inputBg: isDarkMode ? 'var(--color-input-bg)' : '#F8FAFC',
        border: isDarkMode ? 'var(--color-border)' : '#E5E7EB',
        buttonBg: isDarkMode ? '#374151' : '#F2F4F7',
        primaryBtn: isDarkMode ? '#00C2CB' : '#007AFF',
        iconBoxBg: isDarkMode ? '#00C2CB' : '#BAE6FD',
        iconColor: isDarkMode ? 'white' : '#0284C7',
    };

    const handleCarCountChange = (newCount) => {
        const count = Math.max(1, newCount);
        setCarCount(count);

        setVehicleTypes(prev => {
            const newTypes = [...prev];
            if (count > prev.length) {
                // Add default 'Sedan' for new cars
                while (newTypes.length < count) {
                    newTypes.push('Sedan');
                }
            } else {
                // Trim excess
                newTypes.length = count;
            }
            return newTypes;
        });
    };

    const handleVehicleTypeChange = (index, type) => {
        setIsSemiTruck(false);
        setVehicleTypes(prev => {
            const newTypes = [...prev];
            newTypes[index] = type;
            return newTypes;
        });
    };

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
                    [serviceName]: { ...bookingData.details[serviceName], carCount: numCount }
                }
            });
        }
    };

    const toggleCeramicCoating = () => {
        setCeramicCoating(prev => prev > 0 ? 0 : 1);
    };

    const handleCeramicCoatingCountChange = (count) => {
        setCeramicCoating(parseInt(count));
    };

    const { calculateSubtotal, getServicePrice } = usePricing();

    const getPrice = () => {
        return calculateSubtotal / 100;
    };

    const handleNext = async () => {
        if (!address || address.trim() === '') {
            setAddressErrorMessage('Please enter an address');
            setShowAddressError(true);
            return;
        }

        setIsVerifying(true);
        const uspsResult = await verifyAddressWithUSPS(address);
        setIsVerifying(false);

        if (!uspsResult.isValid) {
            setAddressErrorMessage(uspsResult.message || 'Invalid address according to USPS');
            setShowAddressError(true);
            return;
        }

        // Merge ceramic coating into addOns for checkout pricing
        const finalAddOns = { ...addOns };
        if (ceramicCoating > 0) {
            finalAddOns.coating = ceramicCoating;
        }

        updateBooking({
            serviceType: 'Detailing',
            location: address || bookingData.location,
            details: {
                ...bookingData.details,
                'Detailing': {
                    ...bookingData.details['Detailing'],
                    carCount,
                    vehicleTypes,
                    isSemiTruck
                },
                addOns: { ...bookingData.details?.addOns, ...finalAddOns }
            }
        });
        navigate(getNextServiceRoute());
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)', color: theme.text }}>Your Vehicle(s)</h2>

            {/* Car Count */}
            <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: theme.iconBoxBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Car size={20} color={theme.iconColor} />
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '16px', color: theme.text }}>How many cars?</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => handleCarCountChange(carCount - 1)}
                        style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', borderRadius: '50%', background: theme.buttonBg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 }}
                    >
                        <Minus size={16} color={isDarkMode ? 'white' : '#666'} />
                    </button>
                    <span style={{ fontWeight: '600', fontSize: '16px', minWidth: '20px', textAlign: 'center', color: theme.text }}>{carCount}</span>
                    <button
                        onClick={() => handleCarCountChange(carCount + 1)}
                        style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', borderRadius: '50%', background: theme.primaryBtn, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0, padding: 0 }}
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Vehicle Types */}
            {vehicleTypes.map((type, index) => (
                <div key={index} style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: theme.text }}>
                        {carCount > 1 ? `Vehicle Type ${index + 1}` : 'Vehicle Type'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
                        {['Sedan', 'SUV', 'Small Truck', 'Large Truck'].map(option => {
                            const optPrice = getServicePrice('Detailing', {
                                type: bookingData.details?.Detailing?.type || 'full',
                                vehicleTypes: [option]
                            }) / 100;
                            return (
                                <button
                                    key={option}
                                    onClick={() => handleVehicleTypeChange(index, option)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        background: type === option ? theme.primaryBtn : theme.inputBg,
                                        color: type === option ? 'white' : theme.textSecondary,
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        border: type === option ? 'none' : `1px solid ${theme.border}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <span>{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* OR Semi Truck */}
            <div style={{ textAlign: 'center', margin: '20px 0', color: theme.textSecondary, fontWeight: '600', fontSize: '14px' }}>OR</div>
            <button
                onClick={() => {
                    const next = !isSemiTruck;
                    setIsSemiTruck(next);
                    if (next) {
                        setVehicleTypes(prev => prev.map(() => null));
                    }
                }}
                style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSemiTruck ? theme.primaryBtn : theme.inputBg,
                    color: isSemiTruck ? 'white' : theme.textSecondary,
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    border: isSemiTruck ? 'none' : `1px solid ${theme.border}`,
                    marginBottom: 'var(--spacing-xl)',
                    boxShadow: isSemiTruck ? '0 4px 12px rgba(0, 122, 255, 0.2)' : 'var(--shadow-sm)'
                }}
            >
                18 wheeler / Semi truck
            </button>

            {/* Location */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-sm)', color: theme.text }}>Location</h3>
            <div style={{ display: 'block', marginBottom: '8px', color: theme.textSecondary, fontSize: '14px', fontWeight: '500' }}>Where should we meet you?</div>
            <div style={{ position: 'relative' }}>
                <AddressAutocomplete
                    placeholder="Enter your address"
                    value={address}
                    onChange={(val) => {
                        setAddress(val);
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
                <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', marginTop: '-12px', marginBottom: '16px', marginLeft: '4px' }}>
                    {addressErrorMessage}
                </div>
            )}

            {/* Premium Options */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Premium Options</h3>
            <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'flex-start', marginBottom: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: theme.iconBoxBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)', flexShrink: 0 }}>
                    <Sparkles size={24} color={theme.iconColor} />
                </div>
                <div style={{ flex: 1, paddingTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '180px' }}>
                            Add Ceramic Coating? <Info size={14} color="#999" />
                        </div>
                        {ceramicCoating > 0 && (
                            <select
                                value={ceramicCoating >= 11 ? '11+' : ceramicCoating}
                                onChange={(e) => handleCeramicCoatingCountChange(e.target.value === '11+' ? 11 : e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    padding: '2px 6px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '12px',
                                    background: 'var(--color-input-bg)',
                                    color: 'var(--color-text-heading)',
                                    marginBottom: '4px'
                                }}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '11+'].map(num => (
                                    <option key={num} value={num} style={{ color: 'black', background: 'white' }}>{num} Car{num !== 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.4' }}>Provides long-lasting protection and shine.</div>
                </div>
                <div
                    onClick={toggleCeramicCoating}
                    style={{
                        width: '50px',
                        height: '30px',
                        background: ceramicCoating > 0 ? 'var(--color-primary)' : '#E5E5EA',
                        borderRadius: '15px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'none',
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
                        left: ceramicCoating > 0 ? '22px' : '2px',
                        transition: 'none',
                        boxShadow: 'var(--shadow-sm)'
                    }} />
                </div>
            </div>

            {/* Cross-sell */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>While we're there...</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {[
                    { id: 'refueling', title: 'Refueling', desc: "We'll fill up your tank.", icon: <Fuel size={24} color={theme.iconColor} /> },
                    { id: 'recharging', title: 'EV Recharging', desc: 'Get a full charge for your electric vehicle.', icon: <Zap size={24} color={theme.iconColor} /> },
                    { id: 'maintenance', title: 'Maintenance Service', desc: 'Basic fluid and tire maintenance.', icon: <Wrench size={24} color={theme.iconColor} /> },
                    { id: 'mechanic', title: 'Mechanic Work', desc: 'General repairs & diagnostics.', icon: <Wrench size={24} color={theme.iconColor} /> },
                    { id: 'paint-correction', title: 'Paint Correction', desc: 'Professional paint restoration.', icon: <Sparkles size={24} color={theme.iconColor} /> }
                ].filter(s => isServiceVisible(s.id) && serviceNameMap[s.id] !== bookingData.serviceType).map((service) => {
                    const isComingSoon = isServiceComingSoon(service.id);
                    const serviceName = serviceNameMap[service.id];
                    const isVisited = serviceName && bookingData.visitedServices.includes(serviceName);

                    return (
                        <div key={service.id} style={{
                            background: 'var(--color-surface)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: 'var(--shadow-sm)',
                            opacity: isComingSoon ? 0.6 : 1,
                            filter: isComingSoon ? 'grayscale(100%)' : 'none'
                        }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: theme.iconBoxBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-md)', flexShrink: 0 }}>
                                {service.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px', width: '180px' }}>{service.title}</div>
                                        {isComingSoon && (
                                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#666' }}>COMING SOON</span>
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
                                                border: '1px solid #E5E7EB',
                                                fontSize: '12px',
                                                background: 'var(--color-input-bg)',
                                                color: 'var(--color-text-heading)',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '11+'].map(num => (
                                                <option key={num} value={num} style={{ color: 'black', background: 'white' }}>{num} Car{num !== 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div style={{ color: '#666', fontSize: '14px' }}>{service.desc}</div>
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
                                    background: addOns[service.id] > 0 ? 'var(--color-primary)' : '#E5E5EA',
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

            {/* Footer */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', background: 'var(--color-background)', borderTop: '1px solid var(--color-border)', zIndex: 10 }}>
                <div style={{ width: '100%', maxWidth: '565px', padding: 'var(--spacing-md)' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleNext} disabled={isVerifying}>
                        {isVerifying ? 'Verifying Address...' : (getNextServiceRoute() === '/select-date-time' ? 'Continue to Schedule' : 'Next')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailingService;

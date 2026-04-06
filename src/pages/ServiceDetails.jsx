import { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTheme } from '../contexts/ThemeContext';
import { useServices } from '../hooks/useServices';
import { usePricing } from '../hooks/usePricing';
import { verifyAddressWithUSPS } from '../services/uspsService';
import AddressAutocomplete from '../components/AddressAutocomplete';

const ServiceDetails = () => {
    const navigate = useNavigate();
    const { bookingData, updateBooking, markServiceVisited, getNextServiceRoute } = useBooking();
    // useTheme was omitted intentionally
    const { isServiceVisible, isServiceComingSoon } = useServices();

    useEffect(() => {
        markServiceVisited('Gas Refueling');

        // Full State Restoration
        if (bookingData.location) setAddress(bookingData.location);

        if (bookingData.details?.addOns) {
            setAddOns(prev => ({ ...prev, ...bookingData.details.addOns }));
        }

        const details = bookingData.details['Gas Refueling'];
        if (details) {
            if (details.carCount) {
                // Use handleCarCountChange to ensure arrays are initialized first
                handleCarCountChange(details.carCount);
            }
            // Override with saved values if they exist
            if (details.fuelTypes) setFuelTypes(details.fuelTypes);
            if (details.gallons) setGallonsArray(details.gallons);
        }
    }, []);

    // Helper map to bridge add-on toggle IDs and service names
    const serviceNameMap = {
        'recharging': 'EV Recharging',
        'ev': 'EV Recharging',
        'refueling': 'Gas Refueling',
        'fuel': 'Gas Refueling',
        'detailing': 'Detailing',
        'maintenance': 'Maintenance',
        'mechanic': 'Mechanic Work',
        'paint-correction': 'Paint Correction'
    };
    const [carCount, setCarCount] = useState(1);
    const [fuelTypes, setFuelTypes] = useState(['Regular (87 Octane)']);
    const [address, setAddress] = useState(bookingData.location || '');
    const [showAddressError, setShowAddressError] = useState(false);
    const [addOns, setAddOns] = useState({
        recharging: 0,
        detailing: 0,
        maintenance: 0,
        mechanic: 0,
        'paint-correction': 0,
        coating: 0
    });
    const [isVerifying, setIsVerifying] = useState(false);
    const [addressErrorMessage, setAddressErrorMessage] = useState('Please enter an address');
    const [gallonsArray, setGallonsArray] = useState([10]);
    const [placeholderType, setPlaceholderType] = useState(bookingData.details?.['Gas Refueling']?.placeholderType || null);

    const handleCarCountChange = (newCount) => {
        let count = newCount;
        if (newCount === '3+') count = 3;
        if (newCount === '11+') count = 11;

        setCarCount(count);

        // Adjust fuelTypes array size (ensure it matches carCount)
        setFuelTypes(prev => {
            const newFuelTypes = [...prev];
            while (newFuelTypes.length < count) {
                newFuelTypes.push('Regular (87 Octane)');
            }
            if (newFuelTypes.length > count) {
                newFuelTypes.length = count;
            }
            return newFuelTypes;
        });

        // Adjust gallonsArray size to match carCount
        setGallonsArray(prev => {
            const newGallons = [...prev];
            const lastValue = newGallons.length > 0 ? newGallons[newGallons.length - 1] : 10;
            while (newGallons.length < count) {
                newGallons.push(lastValue);
            }
            if (newGallons.length > count) {
                newGallons.length = count;
            }
            return newGallons;
        });
    };

    const handleFuelTypeChange = (index, value) => {
        setFuelTypes(prev => {
            const newTypes = [...prev];
            newTypes[index] = value;
            return newTypes;
        });
    };

    const handleGallonChange = (index, value) => {
        setGallonsArray(prev => {
            const newGallons = [...prev];
            newGallons[index] = value;
            return newGallons;
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

    const handleContinue = async () => {
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

        updateBooking({
            serviceType: 'Gas Refueling',
            details: {
                ...bookingData.details,
                'Gas Refueling': {
                    ...bookingData.details['Gas Refueling'],
                    carCount,
                    fuelTypes,
                    gallons: gallonsArray,
                    placeholderType
                },
                addOns: { ...bookingData.details?.addOns, ...addOns }
            },
            location: address || bookingData.location
        });
        navigate(getNextServiceRoute());
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Progress Indicator */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>Step 2 of 4</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4].map(step => (
                        <div
                            key={step}
                            style={{
                                flex: 1,
                                height: '4px',
                                background: step <= 2 ? 'var(--color-primary)' : '#E5E5EA',
                                borderRadius: '2px'
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Car Count */}
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>How many cars?</h3>
            <div style={{ display: 'flex', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)' }}>
                {[1, 2, '3+'].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleCarCountChange(num)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: (carCount === num || (num === '3+' && carCount >= 3)) ? 'var(--color-primary)' : 'transparent',
                            color: (carCount === num || (num === '3+' && carCount >= 3)) ? 'white' : 'var(--color-text-body)',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        {num}
                    </button>
                ))}
            </div>

            {/* Extended Car Count Dropdown */}
            {carCount >= 3 && (
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select exact number of cars</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={carCount >= 11 ? '11+' : carCount}
                            onChange={(e) => handleCarCountChange(e.target.value === '11+' ? '11+' : parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '16px',
                                background: 'var(--color-surface)',
                                appearance: 'none',
                                color: 'var(--color-text-heading)'
                            }}
                        >
                            {[3, 4, 5, 6, 7, 8, 9, 10, '11+'].map(num => (
                                <option key={num} value={num} style={{ background: 'white', color: 'black' }}>{num} Cars</option>
                            ))}
                        </select>
                        <ChevronDown size={20} color="#999" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                </div>
            )}

            {/* Location */}
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>Where should we meet you?</h3>
            <div style={{ position: 'relative', marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ position: 'relative' }}>
                    <AddressAutocomplete
                        placeholder="Enter location..."
                        value={address}
                        onChange={(val) => {
                            setAddress(val);
                            if (showAddressError) setShowAddressError(false);
                        }}
                        hasError={showAddressError}
                        mapPinColor="var(--color-primary)"
                        style={{
                            width: '100%',
                            padding: '16px 48px 16px 16px',
                            borderRadius: 'var(--radius-lg)',
                            border: showAddressError ? '1px solid #EF4444' : '1px solid var(--color-border)',
                            fontSize: '16px',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-heading)'
                        }}
                    />
                </div>
            </div>
            {showAddressError && (
                <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', marginTop: '-12px', marginBottom: '16px', marginLeft: '4px' }}>
                    {addressErrorMessage}
                </div>
            )}


            {/* Fuel Type Selection */}
            {fuelTypes.map((type, index) => (
                <div key={`fuel-${index}`} style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
                        {carCount > 1 ? `Fuel Type for Car ${index + 1}` : 'Fuel Type'}
                    </h3>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={type}
                            onChange={(e) => handleFuelTypeChange(index, e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-border)',
                                fontSize: '16px',
                                background: 'var(--color-surface)',
                                boxShadow: 'var(--shadow-sm)',
                                appearance: 'none',
                                color: 'var(--color-text-body)'
                            }}
                        >
                            <option>Regular (87 Octane)</option>
                            <option>Mid-Grade (89 Octane)</option>
                            <option>Premium (91-93 Octane)</option>
                            <option>Diesel</option>
                        </select>
                        <ChevronDown size={20} color="#999" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                </div>
            ))}



            {/* Fuel Amount Sliders */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                {gallonsArray.map((gallons, index) => (
                    <div key={`gallons-${index}`} style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                                {carCount > 1 ? `Gallons for Car ${index + 1}` : 'How many gallons?'}
                            </h3>
                            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-primary)' }}>{gallons} gal</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="30"
                            step="1"
                            value={gallons}
                            onChange={(e) => handleGallonChange(index, parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                height: '6px',
                                background: '#E5E5EA',
                                borderRadius: '3px',
                                outline: 'none',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#999', fontSize: '12px' }}>
                            <span>5 gal</span>
                            <span>30 gal</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', margin: 'var(--spacing-lg) 0' }}>
                <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--color-text-body)' }}>OR</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <button
                    className="card"
                    onClick={() => setPlaceholderType(prev => prev === 'unknown' ? null : 'unknown')}
                    style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        border: '1px solid var(--color-border)', 
                        background: placeholderType === 'unknown' ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: placeholderType === 'unknown' ? 'white' : 'var(--color-text-heading)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                    }}
                >
                    I don't know
                </button>
                <button
                    className="card"
                    onClick={() => setPlaceholderType(prev => prev === 'fill-up' ? null : 'fill-up')}
                    style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        border: '1px solid var(--color-border)', 
                        background: placeholderType === 'fill-up' ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: placeholderType === 'fill-up' ? 'white' : 'var(--color-text-heading)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                    }}
                >
                    Just fill up my tank!
                </button>
            </div>

            {/* Add-on Services */}
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '35px', marginBottom: '6px' }}>Add-on Services</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {[
                    { id: 'recharging', title: 'Electric Recharging' },
                    { id: 'detailing', title: 'Detailing' },
                    { id: 'maintenance', title: 'Maintenance' },
                    { id: 'mechanic', title: 'Mechanic Work' },
                    { id: 'paint-correction', title: 'Paint Correction' },
                    { id: 'coating', title: 'Ceramic Coating' }
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
                            justifyContent: 'space-between',
                            boxShadow: 'var(--shadow-sm)',
                            opacity: isComingSoon ? 0.6 : 1,
                            filter: isComingSoon ? 'grayscale(100%)' : 'none'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '500', fontSize: '16px', maxWidth: '130px' }}>{service.title}</span>
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
                                            padding: '4px 8px',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid white',
                                            fontSize: '14px',
                                            background: 'transparent',
                                            color: 'var(--color-text-heading)'
                                        }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '11+'].map(num => (
                                            <option key={num} value={num} style={{ color: 'black' }}>{num} Car{num !== 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                )}
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
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Button */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', background: 'var(--color-background)', borderTop: '1px solid var(--color-border)', zIndex: 10 }}>
                <div style={{ width: '100%', maxWidth: '565px', padding: 'var(--spacing-md)' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleContinue} disabled={isVerifying}>
                        {isVerifying ? 'Verifying Address...' : (getNextServiceRoute() === '/select-date-time' ? 'Continue to Schedule' : 'Next')}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default ServiceDetails;

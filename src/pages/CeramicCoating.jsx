import { useState, useEffect } from 'react';
import { Sparkles, Car, Shield, Check, ArrowRight, MapPin, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTheme } from '../contexts/ThemeContext';
import { useServices } from '../hooks/useServices';
import { usePricing } from '../hooks/usePricing';
import { verifyAddressWithUSPS } from '../services/uspsService';
import AddressAutocomplete from '../components/AddressAutocomplete';

const CeramicCoating = () => {
    const navigate = useNavigate();
    const { bookingData, updateBooking, markServiceVisited, getNextServiceRoute } = useBooking();
    const { isDarkMode } = useTheme();
    const { isServiceVisible } = useServices();

    const [carCount, setCarCount] = useState(1);
    const [vehicleTypes, setVehicleTypes] = useState(['sedan']);
    const [durations, setDurations] = useState(['2yr']);
    const [location, setLocation] = useState(bookingData.location || '');
    const [showAddressError, setShowAddressError] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [addressErrorMessage, setAddressErrorMessage] = useState('Please enter an address');

    useEffect(() => {
        markServiceVisited('Ceramic Coating');

        if (bookingData.location) setLocation(bookingData.location);

        const details = bookingData.details?.['Ceramic Coating'];
        if (details) {
            if (details.carCount) {
                setCarCount(details.carCount);
                if (details.vehicleTypes) setVehicleTypes(details.vehicleTypes);
                if (details.durations) setDurations(details.durations);
            } else if (details.vehicleType) {
                // Legacy support
                setCarCount(1);
                setVehicleTypes([details.vehicleType]);
                setDurations([details.duration || '2yr']);
            }
        }
    }, []);

    const handleCarCountChange = (newCount) => {
        const count = Math.max(1, newCount);
        setCarCount(count);

        setVehicleTypes(prev => {
            const next = [...prev];
            if (count > prev.length) {
                while (next.length < count) next.push('sedan');
            } else {
                next.length = count;
            }
            return next;
        });

        setDurations(prev => {
            const next = [...prev];
            if (count > prev.length) {
                while (next.length < count) next.push('2yr');
            } else {
                next.length = count;
            }
            return next;
        });
    };

    const handleVehicleTypeChange = (idx, type) => {
        setVehicleTypes(prev => {
            const next = [...prev];
            next[idx] = type;
            return next;
        });
    };

    const handleDurationChange = (idx, duration) => {
        setDurations(prev => {
            const next = [...prev];
            next[idx] = duration;
            return next;
        });
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
        updateBooking({
            location: location || bookingData.location,
            details: {
                ...bookingData.details,
                'Ceramic Coating': {
                    carCount,
                    vehicleTypes,
                    durations
                }
            }
        });
        navigate(getNextServiceRoute());
    };

    const vehicleTypeOptions = [
        { id: 'sedan', label: 'Sedan', icon: Car },
        { id: 'suv_truck', label: 'SUV/Truck', icon: Car },
        { id: 'exotic', label: 'Exotic', icon: Car },
        { id: 'semi_truck', label: '18 wheeler/Semi truck', icon: Car }
    ];

    const packageOptions = [
        {
            id: '2yr',
            name: '2-Year Protection',
            features: ['Single Layer Coating', 'Paint Correction Included', 'Hydrophobic Finish']
        },
        {
            id: '5yr',
            name: '5-Year Protection',
            features: ['Double Layer Coating', 'Multi-Stage Correction', 'Interior Protection', 'Glass Coating']
        }
    ];

    const theme = {
        bg: isDarkMode ? 'var(--color-background)' : 'white',
        text: isDarkMode ? 'var(--color-text-heading)' : '#111827',
        textSecondary: isDarkMode ? 'var(--color-text-body)' : '#64748B',
        cardBg: isDarkMode ? 'var(--color-surface)' : 'white',
        inputBg: isDarkMode ? 'var(--color-input-bg)' : '#F8FAFC',
        border: isDarkMode ? 'var(--color-border)' : '#E5E7EB',
        buttonBg: isDarkMode ? '#374151' : '#F2F4F7',
        primaryBtn: '#00C7BE',
        iconBoxBg: isDarkMode ? 'rgba(0, 199, 190, 0.1)' : '#E0F2F1',
        iconColor: '#00C7BE',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingBottom: '100px' }}>

            {/* Car Count */}
            <section>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-md)', color: theme.text }}>Your Vehicle(s)</h2>
                <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
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
            </section>

            {/* Location */}
            <section>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 'var(--spacing-sm)', color: theme.text }}>Location</h3>
                <div style={{ display: 'block', marginBottom: '8px', color: theme.textSecondary, fontSize: '14px', fontWeight: '500' }}>Where should we meet you?</div>
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
                    <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', marginTop: '4px', marginLeft: '4px' }}>
                        {addressErrorMessage}
                    </div>
                )}
            </section>

            {/* Dynamic Selectors */}
            {Array.from({ length: carCount }).map((_, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    {carCount > 1 && <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.primaryBtn }}>Vehicle {idx + 1}</h3>}

                    <section>
                        <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: theme.text }}>Vehicle Type</div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {vehicleTypeOptions.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => handleVehicleTypeChange(idx, type.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px 4px',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid',
                                        borderColor: vehicleTypes[idx] === type.id ? '#00C7BE' : 'transparent',
                                        background: vehicleTypes[idx] === type.id
                                            ? (isDarkMode ? 'rgba(0, 199, 190, 0.1)' : '#F0FDFA')
                                            : (isDarkMode ? 'var(--color-surface)' : '#F2F4F7'),
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'none'
                                    }}
                                >
                                    <type.icon size={22} color={vehicleTypes[idx] === type.id ? '#00C7BE' : '#666'} />
                                    <span style={{ fontSize: '10.5px', fontWeight: '700', textAlign: 'center', lineHeight: '1.2' }}>{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: theme.text }}>Protection Period</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {packageOptions.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    onClick={() => handleDurationChange(idx, pkg.id)}
                                    style={{
                                        padding: 'var(--spacing-lg)',
                                        borderRadius: '24px',
                                        border: '2px solid',
                                        borderColor: durations[idx] === pkg.id ? '#00C7BE' : 'transparent',
                                        background: theme.cardBg,
                                        boxShadow: 'var(--shadow-md)',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                                        <h4 style={{ fontSize: '17px', fontWeight: '700' }}>{pkg.name}</h4>
                                        {durations[idx] === pkg.id && (
                                            <div style={{ background: '#00C7BE', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Check size={16} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {pkg.features.map((f, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: theme.textSecondary }}>
                                                <Shield size={12} color="#00C7BE" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            ))}

            {/* Footer Action */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                background: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid var(--color-border)',
                zIndex: 100
            }}>
                <div style={{ width: '100%', maxWidth: '565px', padding: 'var(--spacing-md)' }}>
                    <button
                        onClick={handleNext}
                        disabled={isVerifying}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: 'var(--radius-lg)',
                            background: '#00C7BE',
                            color: 'white',
                            border: 'none',
                            fontSize: '18px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 14px 0 rgba(0, 199, 190, 0.2)',
                            cursor: 'pointer'
                        }}
                    >
                        {isVerifying ? 'Verifying...' : (getNextServiceRoute() === '/select-date-time' ? 'Continue to Schedule' : 'Next')}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CeramicCoating;

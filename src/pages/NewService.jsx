import { useState, useEffect } from 'react';
import { Fuel, Zap, Droplets, Wrench, Plus, Minus, Sparkles, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ICON_MAP = {
    'fuel': Fuel,
    'zap': Zap,
    'droplets': Droplets,
    'wrench': Wrench,
    'sparkles': Sparkles,
    'shield': Shield,
    'messagesquare': Plus
};

// Case-insensitive lookup
const getIcon = (name) => {
    if (!name) return Fuel;
    return ICON_MAP[name.toLowerCase()] || Fuel;
};

const CAROUSEL_NEWS = [
    {
        image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2070&auto=format&fit=crop',
        source: 'Reuters',
        time: '18h',
        title: 'Lamborghini shifts away from full EV plans'
    },
    {
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2070&auto=format&fit=crop',
        source: 'Car and Driver',
        time: '1d',
        title: 'Ferrari fixes its steering wheel design mistake'
    },
    {
        image: '/cool_service_bg.png',
        source: 'GoFuel',
        time: 'Just now',
        title: 'GoFuel: Car care that comes to you. Now in Houston, TX'
    },
    {
        image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=2070&auto=format&fit=crop',
        source: 'Le Guide de l\'auto',
        time: '2d',
        title: 'Audi expands aggressively with new models and motorsport'
    },
    {
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop',
        source: 'Wikipedia',
        time: '3d',
        title: 'Lamborghini debuts new race car at Sebring'
    }
];

const ImageCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % CAROUSEL_NEWS.length);
        }, 3250);
        return () => clearInterval(timer);
    }, []);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? CAROUSEL_NEWS.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % CAROUSEL_NEWS.length);
    };

    return (
        <div style={{ marginBottom: 'var(--spacing-lg)', height: '200px', background: '#e5e7eb', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
            <AnimatePresence initial={false}>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'absolute', inset: 0 }}
                >
                    <img
                        src={CAROUSEL_NEWS[currentIndex].image}
                        alt={`Slide ${currentIndex + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                        decoding="async"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: '28px', left: '48px', right: '48px', color: 'white', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '8px', background: '#00C2CB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white' }}>GF</div>
                            {CAROUSEL_NEWS[currentIndex].source} • {CAROUSEL_NEWS[currentIndex].time}
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.4', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {CAROUSEL_NEWS[currentIndex].title}
                        </h3>
                    </div>
                </motion.div>
            </AnimatePresence>

            <button
                onClick={handlePrevious}
                style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}
            >
                <ChevronLeft size={18} />
            </button>
            <button
                onClick={handleNext}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}
            >
                <ChevronRight size={18} />
            </button>

            <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                {CAROUSEL_NEWS.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        style={{
                            width: '40px',
                            height: '5px',
                            borderRadius: '3px',
                            background: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}
                    >
                        {idx === currentIndex && (
                            <motion.div
                                key={currentIndex}
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 3.25, ease: 'linear' }}
                                style={{
                                    height: '100%',
                                    background: 'white',
                                    borderRadius: '3px'
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SNACKS_IMAGES = [
    { id: 'snack1', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=2000&auto=format&fit=crop' }, // Chips
    { id: 'snack2', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=2000&auto=format&fit=crop' }, // Cookies
    { id: 'center', image: '/snacks-banner.png' }, // GoFuel Custom Banner
    { id: 'snack3', image: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=2000&auto=format&fit=crop' }, // Popcorn
    { id: 'snack4', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=2000&auto=format&fit=crop' }  // Crackers/Pretzels
];

const SnackCarousel = () => {
    // Start at index 2 (the center custom banner)
    const [currentIndex, setCurrentIndex] = useState(2);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % SNACKS_IMAGES.length);
        }, 3250);
        return () => clearInterval(timer);
    }, []);

    const navigate = useNavigate();

    const handlePrevious = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? SNACKS_IMAGES.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % SNACKS_IMAGES.length);
    };

    return (
        <div
            onClick={() => navigate('/snacks')}
            style={{ marginBottom: 'var(--spacing-lg)', height: '220px', background: '#e5e7eb', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
        >
            <AnimatePresence initial={false}>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'absolute', inset: 0 }}
                >
                    <img
                        src={SNACKS_IMAGES[currentIndex].image}
                        alt={`Snack ${currentIndex + 1}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            // Only apply specific object position to the custom center banner if needed, otherwise center is fine
                            objectPosition: currentIndex === 2 ? 'center 57%' : 'center',
                            transform: currentIndex === 2 ? 'scale(1.15)' : 'none',
                            display: 'block'
                        }}
                        loading="lazy"
                    />
                    {/* Dark gradient purely for the pagination visibility */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)', pointerEvents: 'none' }} />
                </motion.div>
            </AnimatePresence>

            <button
                onClick={handlePrevious}
                style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}
            >
                <ChevronLeft size={18} />
            </button>
            <button
                onClick={handleNext}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}
            >
                <ChevronRight size={18} />
            </button>

            <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                {SNACKS_IMAGES.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(idx);
                        }}
                        style={{
                            width: '40px',
                            height: '5px',
                            borderRadius: '3px',
                            background: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}
                    >
                        {idx === currentIndex && (
                            <motion.div
                                key={currentIndex}
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 3.25, ease: 'linear' }}
                                style={{
                                    height: '100%',
                                    background: 'white',
                                    borderRadius: '3px'
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const NewService = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.first_name || '';

    const navigate = useNavigate();
    const { resetBooking, updateBooking, cache, updateCache, bookingData } = useBooking();

    const [services, setServices] = useState(cache.services || []);
    const [loading, setLoading] = useState(!cache.services);
    const [frequency, setFrequency] = useState('one-time');
    const [timesPerWeek, setTimesPerWeek] = useState(1);

    // Frequency toggle should only show if at least one VISIBLE service supports recurring
    const shouldShowFrequencyToggle = services.some(s => {
        const isComingSoon = s.visible === false || String(s.visible) === 'false';
        return !isComingSoon && s.allow_recurring === true;
    });

    const handleServiceClick = (id) => {
        resetBooking(); // Clear previous session state

        // Find service to check recurring
        const service = services.find(s => s.id === id);

        updateBooking({
            serviceType: id,
            serviceFrequency: frequency, // Use the state from the toggle
            timesPerWeek: frequency === 'recurring' ? timesPerWeek : 1,
            selectedServices: [id]
        });

        // Dynamic routing based on ID
        const routes = {
            'Gas Refueling': '/details',
            'EV Recharging': '/ev-recharging',
            'Detailing': '/detailing',
            'Maintenance': '/maintenance',
            'Mechanic Work': '/mechanic',
            'Paint Correction': '/paint-correction',
            'Ceramic Coating': '/ceramic-coating'
        };

        navigate(routes[id] || '/details');
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (error) throw error;

                // Map icons case-insensitively
                let mappedServices = data.map(s => ({
                    ...s,
                    icon: getIcon(s.icon_name)
                }));

                setServices(mappedServices);
                updateCache('services', mappedServices);
                console.log('NewService: SUCCESS - Fetched from Supabase:', mappedServices.map(s => `${s.id}: visible=${s.visible}`));
            } catch (err) {
                console.error('NewService: ERROR - Fetch failed, using fallback:', err);
                if (!cache.services) {
                    // Minimized fallback
                    const fallbackServices = [
                        { id: 'Gas Refueling', title: 'Re-fueling', icon_name: 'Fuel', visible: true, is_active: true, sort_order: 1, allow_recurring: true },
                        { id: 'Detailing', title: 'Detailing', icon_name: 'Droplets', visible: true, is_active: true, sort_order: 2, allow_recurring: true },
                        { id: 'Maintenance', title: 'Maintenance', icon_name: 'Wrench', visible: true, is_active: true, sort_order: 3, allow_recurring: true },
                        { id: 'Paint Correction', title: 'Paint Correction', icon_name: 'Sparkles', visible: true, is_active: true, sort_order: 4, allow_recurring: false },
                        { id: 'Ceramic Coating', title: 'Ceramic Coating', icon_name: 'Shield', visible: true, is_active: true, sort_order: 5, allow_recurring: false },
                        { id: 'EV Recharging', title: 'EV Recharging', icon_name: 'Zap', visible: true, is_active: true, sort_order: 6, allow_recurring: true },
                    ].map(s => ({ ...s, icon: getIcon(s.icon_name) }));
                    setServices(fallbackServices);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchServices();

        const channel = supabase
            .channel('new-service-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (payload) => {
                console.log('NewService: Real-time update received:', payload);
                fetchServices();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [updateCache]); // Removed cache.services to prevent infinite loop

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {firstName && (
                <div style={{ fontSize: '14px', color: '#666', marginTop: '-6px', marginBottom: '18px', fontWeight: '500' }}>
                    Welcome back, {firstName}!
                </div>
            )}
            {shouldShowFrequencyToggle && (
                <>
                    <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>How often?</h2>
                    <div style={{
                        display: 'flex',
                        background: isDarkMode ? '#1E293B' : '#E2E8F0', // Slightly darker gray track resembling image
                        padding: '0', // Eliminate the space
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: frequency === 'recurring' ? '32px' : '48px'
                    }}>
                        <button
                            onClick={() => {
                                setFrequency('one-time');
                                updateBooking({ serviceFrequency: 'one-time', timesPerWeek: 1 });
                                setTimesPerWeek(1); // Reset when switching to one-time
                            }}
                            style={{
                                flex: 1,
                                padding: '12px 10px',
                                borderRadius: 'var(--radius-lg)',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: '600',
                                background: frequency === 'one-time' ? (isDarkMode ? '#00C7BE' : '#00C7BE') : 'transparent',
                                color: frequency === 'one-time' ? 'white' : (isDarkMode ? '#94A3B8' : '#5A6B82'),
                                cursor: 'pointer'
                            }}
                        >
                            One-Time
                        </button>
                        <button
                            onClick={() => {
                                setFrequency('recurring');
                                updateBooking({ serviceFrequency: 'recurring', timesPerWeek });
                            }}
                            style={{
                                flex: 1,
                                padding: '12px 10px',
                                borderRadius: 'var(--radius-lg)',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: '600',
                                background: frequency === 'recurring' ? (isDarkMode ? '#00C7BE' : '#00C7BE') : 'transparent',
                                color: frequency === 'recurring' ? 'white' : (isDarkMode ? '#94A3B8' : '#5A6B82'),
                                cursor: 'pointer'
                            }}
                        >
                            Recurring
                        </button>
                    </div>

                    {frequency === 'recurring' && (
                        <div style={{ marginBottom: '48px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px' }}>Select weekly frequency</h3>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: isDarkMode ? '#1E293B' : '#FFFFFF',
                                padding: '12px 16px',
                                borderRadius: '16px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <span style={{ fontSize: '15px', color: isDarkMode ? '#e2e8f0' : '#475569', fontWeight: '500' }}>Times per week</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <button
                                        onClick={() => {
                                            const newTimes = Math.max(1, timesPerWeek - 1);
                                            setTimesPerWeek(newTimes);
                                            updateBooking({ timesPerWeek: newTimes });
                                        }}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            minWidth: '32px',
                                            minHeight: '32px',
                                            padding: 0,
                                            flexShrink: 0,
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: isDarkMode ? '#334155' : '#f1f5f9',
                                            color: isDarkMode ? '#e2e8f0' : '#475569',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ fontSize: '16px', fontWeight: '600', width: '20px', textAlign: 'center' }}>{timesPerWeek}</span>
                                    <button
                                        onClick={() => {
                                            const newTimes = Math.min(7, timesPerWeek + 1);
                                            setTimesPerWeek(newTimes);
                                            updateBooking({ timesPerWeek: newTimes });
                                        }}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            minWidth: '32px',
                                            minHeight: '32px',
                                            padding: 0,
                                            flexShrink: 0,
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: '#00C7BE', // Always blue
                                            color: '#FFFFFF',      // Always white
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>What do you need today?</h2>

            <ImageCarousel />

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-md)',
                minHeight: '400px' // Prevent layout collapse
            }}>
                {loading ? (
                    // Match final card dimensions to prevent pop-in
                    services.length > 0 ? services.map((s, i) => (
                        <div key={i} className="card skeleton" style={{ height: '150px', gridColumn: (s.id === 'Ceramic Coating') ? 'span 2' : 'auto' }} />
                    )) : [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="card skeleton" style={{ height: '150px' }} />
                    ))
                ) : (
                    (() => {
                        const displayServices = [...services];
                        // Inject Mechanic Work if it doesn't exist
                        if (!displayServices.some(s => s.id === 'Mechanic Work')) {
                            displayServices.push({
                                id: 'Mechanic Work',
                                title: 'Mechanic Work',
                                description: "From diagnostics to full repairs.",
                                icon: getIcon('wrench'),
                                icon_name: 'Wrench',
                                visible: true,
                                is_active: true,
                                allow_recurring: false
                            });
                        }

                        // Unified, strict layout ordering to match exactly what the user wants:
                        // Row 1: Refueling, Detailing
                        // Row 2: Maintenance, Paint Correction
                        // Row 3: EV Recharging, Mechanic Work
                        // Row 4: Ceramic Coating (Full width)
                        const desiredOrder = [
                            'Gas Refueling',
                            'Detailing',
                            'Maintenance',
                            'Paint Correction',
                            'EV Recharging',
                            'Mechanic Work',
                            'Ceramic Coating'
                        ];

                        displayServices.sort((a, b) => {
                            const indexA = desiredOrder.indexOf(a.id);
                            const indexB = desiredOrder.indexOf(b.id);
                            // If both are in our desired list, sort by the list order
                            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                            // If only A is in list, it comes first
                            if (indexA !== -1) return -1;
                            // If only B is in list, it comes first
                            if (indexB !== -1) return 1;
                            // Otherwise keep original order
                            return 0;
                        });

                        return displayServices.map((service) => {
                            // Ensure we handle boolean appropriately, even if stored as string in some environments
                            const isComingSoon = service.visible === false || String(service.visible) === 'false';
                            const isVisible = !isComingSoon;

                            // ONLY Ceramic Coating is full-width now
                            const isFullWidth = service.id === 'Ceramic Coating';

                            // Maintenance and Paint Correction should be same size and side-by-side
                            // They are currently auto-sized in a 2-column grid.
                            const isMaintenance = service.id === 'Maintenance';
                            const isPaintCorrection = service.id === 'Paint Correction';

                            return (
                                <div
                                    key={service.id}
                                    onClick={() => isVisible && handleServiceClick(service.id)}
                                    className="card"
                                    style={{
                                        cursor: isVisible ? 'pointer' : 'default',
                                        border: '2px solid transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isFullWidth ? 'center' : 'stretch',
                                        textAlign: isFullWidth ? 'center' : 'left',
                                        height: '150px', // Standardized height for perfect pairing
                                        gridColumn: isFullWidth ? 'span 2' : 'auto',
                                        opacity: isVisible ? 1 : 0.8, // Brighter overall
                                        pointerEvents: isVisible ? 'auto' : 'none',
                                        position: 'relative',
                                        padding: 'var(--spacing-md)',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    {service.id === 'Ceramic Coating' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            background: 'rgba(0, 199, 190, 0.15)',
                                            color: '#00C7BE',
                                            padding: '4px 10px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '10px',
                                            fontWeight: '800',
                                            letterSpacing: '0.05em'
                                        }}>
                                            INCLUDES PAINT CORRECTION
                                        </div>
                                    )}
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <service.icon size={24} color={isVisible ? "#00C7BE" : "#475569"} />
                                    </div>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        marginBottom: 'var(--spacing-xs)',
                                        color: isVisible ? 'var(--color-text-heading)' : '#334155'
                                    }}>
                                        {service.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '12px',
                                        color: isVisible ? (isDarkMode ? '#94A3B8' : '#334155') : (isDarkMode ? '#64748b' : '#475569'),
                                        opacity: isVisible ? 1 : 0.9,
                                        marginBottom: !isVisible ? 'var(--spacing-sm)' : '0'
                                    }}>
                                        {service.description || service.desc}
                                    </p>
                                    {!isVisible && (
                                        <div style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: 'white',
                                            background: '#64748b',
                                            padding: '4px 12px',
                                            borderRadius: 'var(--radius-full)',
                                            marginTop: 'auto',
                                            alignSelf: isFullWidth ? 'center' : 'flex-start'
                                        }}>
                                            SOON
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    })())}
            </div>

            <div style={{ marginTop: '53px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Want some gas station snacks?</h2>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.4' }}>
                    Enjoy the ultimate convenience — we’ll bring snacks and drinks, directly to your vehicle.
                </p>
            </div>

            <SnackCarousel />
        </div>
    );
};

export default NewService;

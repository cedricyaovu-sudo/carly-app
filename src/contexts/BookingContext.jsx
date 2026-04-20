import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const BookingContext = createContext({});

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
    const [bookingData, setBookingData] = useState({
        serviceType: '', // 'refueling', 'charging', 'detailing', 'maintenance'
        frequency: 'one-time',
        selectedServices: [],
        visitedServices: [],
        details: {},
        vehicleId: null,
        dateTime: null,
        location: '',
        totalAmount: 0,
        promoCode: ''
    });

    const [cache, setCache] = useState({
        services: null,
        vehicles: null,
        appointments: null,
        lastUpdated: {}
    });

    const updateCache = useCallback((key, data) => {
        setCache(prev => ({
            ...prev,
            [key]: data,
            lastUpdated: { ...prev.lastUpdated, [key]: Date.now() }
        }));
    }, []);

    const getCache = useCallback((key) => {
        const lastUpd = cache.lastUpdated[key];
        if (!lastUpd || Date.now() - lastUpd > 5 * 60 * 1000) {
            return null;
        }
        return cache[key];
    }, [cache]);

    const updateBooking = useCallback((data) => {
        setBookingData(prev => {
            const newData = { ...prev, ...data };

            // Deep merge details one level deep (for service-specific objects like 'Detailing' or 'addOns')
            if (data.details) {
                const mergedDetails = { ...prev.details };
                Object.keys(data.details).forEach(key => {
                    if (typeof data.details[key] === 'object' && data.details[key] !== null && !Array.isArray(data.details[key])) {
                        mergedDetails[key] = { ...prev.details[key], ...data.details[key] };
                    } else {
                        mergedDetails[key] = data.details[key];
                    }
                });
                newData.details = mergedDetails;
            }

            // Auto-populate selectedServices if serviceType is set (primary service)
            if (data.serviceType && !prev.selectedServices.includes(data.serviceType)) {
                newData.selectedServices = Array.from(new Set([...prev.selectedServices, data.serviceType]));
            }

            return newData;
        });
    }, []);

    const markServiceVisited = useCallback((serviceId) => {
        setBookingData(prev => ({
            ...prev,
            visitedServices: Array.from(new Set([...prev.visitedServices, serviceId]))
        }));
    }, []);

    const getNextServiceRoute = useCallback(() => {
        const routes = {
            'Gas Refueling': '/details',
            'EV Recharging': '/ev-recharging',
            'Detailing': '/detailing',
            'Maintenance': '/maintenance',
            'Mechanic Work': '/mechanic',
            'Paint Correction': '/paint-correction',
            'Ceramic Coating': '/ceramic-coating'
        };

        const nextService = bookingData.selectedServices.find(s => !bookingData.visitedServices.includes(s));
        return nextService ? routes[nextService] : '/select-date-time';
    }, [bookingData.selectedServices, bookingData.visitedServices]);

    const resetBooking = useCallback(() => {
        setBookingData({
            serviceType: '',
            frequency: 'one-time',
            selectedServices: [],
            visitedServices: [],
            details: {},
            vehicleId: null,
            dateTime: null,
            location: '',
            totalAmount: 0,
            promoCode: ''
        });
    }, []);

    const value = useMemo(() => ({
        bookingData,
        updateBooking,
        resetBooking,
        markServiceVisited,
        getNextServiceRoute,
        cache,
        updateCache,
        getCache
    }), [bookingData, updateBooking, resetBooking, markServiceVisited, getNextServiceRoute, cache, updateCache, getCache]);

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};

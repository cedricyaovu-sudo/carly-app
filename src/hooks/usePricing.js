import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useBooking } from '../contexts/BookingContext';
import { getGasPrices } from '../services/gasPriceService';

// Static Constants
const FALLBACK_PRICES = {
    'Gas Refueling': 0,
    'EV Recharging': 2500,
    'Detailing': 10000,
    'Maintenance': 5000,
    'Paint Correction': 25000,
    'Ceramic Coating': 50000,
    'Mechanic Work': 7500,
    'Service': 2000,
    coating: 10000,
    mechanic: 4500,
    sun: 597, tos: 891, sma: 546, fri: 596, var: 2997, chz: 597, gfc: 507, dot: 972, waf: 296, fam: 866, aho: 581, rol: 371, rice: 417, pud: 600, mot: 1256, fru: 783, res: 375, awrb: 1293, pep: 900, preb: 900, c4e: 408, cel: 342, mon: 402, aln: 2997, red: 1617, gat: 1617, koo: 300, pop: 224, boo: 6365
};

const ADD_ON_MAP = {
    recharging: 'EV Recharging', 'ev-recharging': 'EV Recharging', detailing: 'Detailing', maintenance: 'Maintenance', coating: 'Ceramic Coating', mechanic: 'Mechanic Work', refueling: 'Gas Refueling', 'paint-correction': 'Paint Correction',
    sun: 'SunChips (7 oz)', tos: 'Tostitos Scoops (14.5 oz)', sma: 'Smash Kitchen Kettle Chips (6 oz)', fri: 'Fritos Corn Chips (9.25 oz)', var: 'Frito-Lay 42-pack chips', chz: 'Cheez-It Crackers (12.4 oz)', gfc: 'Gluten-free Cheez-It (9 oz)', dot: 'Dot’s Snack Mix (14 oz)', waf: 'Great Value Wafer Cookies (8 oz)', fam: 'Famous Amos (10-pack)', aho: 'Chips Ahoy (9.6 oz)', rol: 'Swiss Rolls (6 count)', rice: 'Rice Krispies Treats (8 ct)', pud: 'Snack Pack pudding (12 ct)', mot: 'Mott’s Fruit Snacks (40 pack)', fru: 'Fruit Roll-Ups variety pack', res: 'Reese’s King Size', awrb: 'A&W Root Beer (12-pack)', pep: 'Pepsi (12-pack)', preb: 'Prebiotic Pepsi (8-pack)', c4e: 'C4 Energy (16 oz can)', cel: 'CELSIUS (12 oz can)', mon: 'Monster Energy (16 oz)', aln: 'Alani Nu (12-pack)', red: 'Red Bull (4-pack)', gat: 'Gatorade variety pack (18-pack)', koo: 'Kool-Aid Bursts (6-pack)', pop: 'Poppi prebiotic soda', boo: 'BOOST nutritional drinks (24-pack)'
};

const DELIVERY_FEE_CENTS = 800;

export const usePricing = () => {
    const { bookingData } = useBooking();
    const [gasPrices, setGasPrices] = useState(null);
    const [servicePrices, setServicePrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [pricingConfig, setPricingConfig] = useState({});

    useEffect(() => {
        const fetchPrices = async () => {
            setLoading(true);
            try {
                // 1. Fetch Gas Prices (EIA)
                const gPrices = await getGasPrices();
                setGasPrices(gPrices);

                // 2. Fetch Service Prices (Supabase)
                const { data: services, error: sError } = await supabase
                    .from('services')
                    .select('id, price');

                if (!sError && services) {
                    const priceMap = {};
                    services.forEach(s => {
                        priceMap[s.id] = s.price;
                    });
                    setServicePrices(priceMap);
                }

                // 3. Dynamic Pricing Config
                const { data: configData, error: cError } = await supabase
                    .from('pricing_config')
                    .select('id, value');

                if (!cError && configData) {
                    const cfg = {};
                    configData.forEach(r => {
                        cfg[r.id] = Number(r.value);
                    });
                    setPricingConfig(cfg);
                }
            } catch (err) {
                console.error('usePricing: Error fetching prices:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
    }, []);

    // Helper Functions
    const getSurgeMultiplier = useCallback(() => 1.0, []);

    const getTaxRate = useCallback((location, cfg) => {
        if (!location) return (cfg.tax_rate_ga ?? 7.50) / 100;
        const loc = location.toUpperCase();
        if (loc.includes('TX') || loc.includes('TEXAS')) return (cfg.tax_rate_tx ?? 8.25) / 100;
        return (cfg.tax_rate_ga ?? 7.50) / 100;
    }, []);

    const getServicePrice = useCallback((serviceName, details = {}) => {
        const cfg = pricingConfig;
        let price = 0;
        const vTypeRaw = details.vehicleType || (details.isSemiTruck ? 'Semi Truck' : 'Sedan');
        const vType = vTypeRaw.toLowerCase().replace(/ /g, '_');

        if (serviceName === 'Ceramic Coating') {
            const duration = details.duration || '2yr';
            const key = `ceramic_coating_${vType}_${duration}`;
            price = (cfg[key] ?? cfg.ceramic_coating_base ?? 100.00) * 100;
        } else if (serviceName === 'Paint Correction') {
            const key = `paint_correction_${vType}`;
            price = (cfg[key] ?? cfg.paint_correction_base ?? 150.00) * 100;
        } else if (serviceName === 'Detailing') {
            const type = details.type || 'full';
            const vehicleKey = `detailing_${vType}`;
            const baseKey = `detailing_base_${type}`;
            price = (cfg[vehicleKey] ?? cfg[baseKey] ?? (type === 'interior' ? 49.99 : type === 'exterior' ? 39.99 : 79.99)) * 100;
        } else if (serviceName === 'EV Recharging') {
            price = (cfg.ev_charge_per_kwh ?? 0.35) * 100;
        } else if (serviceName === 'Maintenance') {
            price = (cfg.maintenance_base ?? 29.99) * 100;
        } else if (serviceName === 'Mechanic Work') {
            price = (cfg.mechanic_work_base ?? 75.00) * 100;
        } else {
            price = servicePrices[serviceName] ?? FALLBACK_PRICES[serviceName] ?? FALLBACK_PRICES['Service'];
        }
        return price;
    }, [pricingConfig, servicePrices]);

    const getServiceTotal = useCallback((serviceName, details = {}) => {
        const carCount = details.carCount || 1;
        if (['Detailing', 'Paint Correction', 'Ceramic Coating'].includes(serviceName)) {
            const cars = details.vehicleTypes || [details.vehicleType || 'Sedan'];
            const durations = details.durations || [];
            return cars.reduce((acc, car, idx) => {
                const carDuration = durations[idx] || details.duration || '2yr';
                return acc + getServicePrice(serviceName, { ...details, vehicleType: car, duration: carDuration });
            }, 0);
        }
        const unitPrice = getServicePrice(serviceName, details);
        if (serviceName === 'EV Recharging') return unitPrice * (details.kwh || 50) * carCount;
        return unitPrice * carCount;
    }, [getServicePrice]);

    const calculateSubtotal = useMemo(() => {
        const refuelDetails = bookingData.details?.['Gas Refueling'];
        if (refuelDetails?.placeholderType) return 0;

        const cfg = pricingConfig;
        let total = 0;

        const servicesToProcess = bookingData.selectedServices?.length > 0 
            ? bookingData.selectedServices 
            : (bookingData.serviceType ? [bookingData.serviceType] : []);

        // 1. Service Costs
        servicesToProcess.forEach(serviceName => {
            const details = bookingData.details?.[serviceName] || {};
            const serviceTotal = getServiceTotal(serviceName, details);
            
            const surge = getSurgeMultiplier(bookingData.dateTime, cfg);
            const multiplier = surge > 0 ? surge : 1.0;
            total += Math.round(serviceTotal * multiplier);
        });

        // 2. Fuel Cost
        if (servicesToProcess.includes('Gas Refueling')) {
            const refuelDetails = bookingData.details?.['Gas Refueling'];
            if (refuelDetails?.gallons && gasPrices) {
                const fuelTypes = refuelDetails.fuelTypes || [];
                const gallonsArray = Array.isArray(refuelDetails.gallons) ? refuelDetails.gallons : [refuelDetails.gallons];
                const markup = 1 + (cfg.fuel_markup_percent ?? 25) / 100;

                if (fuelTypes.length > 0) {
                    const avgFuelPrice = fuelTypes.reduce((sum, type) => sum + (gasPrices[type] || 0), 0) / fuelTypes.length;
                    const totalFuelCost = gallonsArray.reduce((acc, g) => acc + (avgFuelPrice * markup * g), 0);
                    total += Math.round(totalFuelCost);
                }
            }
        }

        // 3. Add-ons (Only those NOT already in selectedServices queue)
        if (bookingData.details?.addOns) {
            Object.entries(bookingData.details.addOns).forEach(([key, value]) => {
                if (value > 0 && key !== 'coating') {
                    const displayName = ADD_ON_MAP[key] || key;
                    if (!servicesToProcess.includes(displayName)) {
                        const price = servicePrices[displayName] ?? FALLBACK_PRICES[key] ?? 0;
                        total += price * value;
                    }
                }
            });
        }

        return total;
    }, [bookingData, gasPrices, servicePrices, pricingConfig, getServiceTotal, getSurgeMultiplier]);

    // Promo Discount Logic
    const promoDiscount = useMemo(() => {
        const cfg = pricingConfig;
        const subtotal = calculateSubtotal;
        
        // Only apply if a promo code is explicitly provided
        const promoCode = bookingData.promoCode; 
        if (!promoCode) return 0;

        let discountPercent = 0;
        const validCode = cfg.promo_new_user_code || 'NEWCAR15';
        
        if (promoCode.toUpperCase() === String(validCode).toUpperCase()) {
            discountPercent = cfg.promo_new_user_percent ?? 15;
        }
        
        if (discountPercent === 0) return 0;
        
        const capPercent = cfg.promo_cap_percent ?? 25;
        const capDollar = (cfg.promo_cap_dollar ?? 50) * 100;
        
        const actualPercent = Math.min(discountPercent, capPercent);
        let discountAmount = Math.round(subtotal * (actualPercent / 100));
        
        return Math.min(discountAmount, capDollar);
    }, [calculateSubtotal, pricingConfig, bookingData.promoCode]);

    const fuelCostOnly = useMemo(() => {
        const hasRefuel = bookingData.selectedServices?.includes('Gas Refueling') || bookingData.serviceType === 'Gas Refueling';
        const refuelDetails = bookingData.details?.['Gas Refueling'];
        if (hasRefuel && refuelDetails?.gallons && gasPrices) {
            const fuelTypes = refuelDetails.fuelTypes || [];
            const gallonsArray = Array.isArray(refuelDetails.gallons) ? refuelDetails.gallons : [refuelDetails.gallons];
            const markup = 1 + (pricingConfig.fuel_markup_percent ?? 25) / 100;

            if (fuelTypes.length > 0) {
                const avgFuelPrice = fuelTypes.reduce((sum, type) => sum + (gasPrices[type] || 0), 0) / fuelTypes.length;
                const totalFuelCost = gallonsArray.reduce((acc, g) => acc + (avgFuelPrice * markup * g), 0);
                return Math.round(totalFuelCost);
            }
        }
        return 0;
    }, [bookingData, gasPrices, pricingConfig]);

    const detailedBreakdown = useMemo(() => {
        const breakdown = [];
        const cfg = pricingConfig;
        const surge = getSurgeMultiplier(bookingData.dateTime, cfg);
        const multiplier = surge > 0 ? surge : 1.0;

        // 1. Sequential Services
        const servicesToProcess = bookingData.selectedServices?.length > 0 
            ? bookingData.selectedServices 
            : (bookingData.serviceType ? [bookingData.serviceType] : []);

        servicesToProcess.forEach(serviceName => {
            const details = bookingData.details?.[serviceName] || {};
            
            if (serviceName === 'Ceramic Coating') {
                const vehicleTypesList = details.vehicleTypes || ['Sedan'];
                const durations = details.durations || ['2yr'];
                
                vehicleTypesList.forEach((vType, idx) => {
                    const duration = durations[idx] || '2yr';
                    const durationLabel = duration === '2yr' ? '2-Year' : '5-Year';
                    const price = getServicePrice(serviceName, { ...details, vehicleType: vType, duration });
                    const finalPrice = Math.round(price * multiplier);
                    
                    breakdown.push({
                        name: `Vehicle ${idx + 1} (${vType} - ${durationLabel} Protection)`,
                        price: finalPrice,
                        basePrice: price,
                        surgeApplied: multiplier > 1
                    });
                });
            } else {
                const serviceTotal = getServiceTotal(serviceName, details);
                const carCount = details.carCount || 1;
                const displayName = serviceName === 'Gas Refueling' ? 'Refueling' : serviceName;
                let price = Math.round(serviceTotal * multiplier);
                
                // Merge fuel cost for Refueling
                if (serviceName === 'Gas Refueling') {
                    price += fuelCostOnly;
                }

                breakdown.push({
                    name: carCount > 1 ? `${displayName} (x${carCount})` : displayName,
                    price: price,
                    basePrice: serviceTotal + (serviceName === 'Gas Refueling' ? fuelCostOnly : 0),
                    surgeApplied: multiplier > 1
                });
            }
        });

        // 2. Add-ons (fallback for items NOT in the main queue)
        if (bookingData.details?.addOns) {
            Object.entries(bookingData.details.addOns).forEach(([key, value]) => {
                if (value > 0 && key !== 'coating') {
                    const displayName = ADD_ON_MAP[key] || key;
                    if (!servicesToProcess.includes(displayName)) {
                        const price = servicePrices[displayName] ?? FALLBACK_PRICES[key] ?? 0;
                        breakdown.push({
                            name: `${displayName} (x${value})`,
                            price: price * value,
                            basePrice: price,
                            count: value
                        });
                    }
                }
            });
        }

        return breakdown;
    }, [bookingData, servicePrices, pricingConfig, fuelCostOnly, getServiceTotal, getSurgeMultiplier, getServicePrice]);

    const taxRate = getTaxRate(bookingData.location, pricingConfig);
    const taxes = Math.round((calculateSubtotal - promoDiscount) * taxRate);
    const serviceFeeBase = Math.round(calculateSubtotal * ((pricingConfig.service_fee_percent ?? 0) / 100));

    const deliveryFee = (pricingConfig.fuel_delivery_fee ?? 8.00) * 100;
    const finalTotal = calculateSubtotal - promoDiscount + taxes + deliveryFee + serviceFeeBase;

    return {
        gasPrices,
        servicePrices,
        calculateSubtotal,
        promoDiscount,
        detailedBreakdown,
        getServicePrice,
        getServiceTotal,
        fuelCostOnly,
        taxes,
        deliveryFee,
        serviceFee: serviceFeeBase,
        finalTotal,
        loading,
        FALLBACK_PRICES,
        ADD_ON_MAP,
        pricingConfig,
        isPlaceholderActive: !!bookingData.details?.['Gas Refueling']?.placeholderType
    };
};

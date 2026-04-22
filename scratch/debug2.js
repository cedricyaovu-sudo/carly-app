const React = require('react');
const assert = require('assert');

// We simulate usePricing execution
const bookingData = {
    serviceType: '',
    selectedServices: [],
    location: '123 Test St, GA',
    details: {
        addOns: {
            pep: 1
        }
    }
};

const gasPrices = { regular: 3.50, premium: 4.20 };
const pricingConfig = { tax_rate_ga: 7.50, service_fee_percent: 5 };
const servicePrices = { 'Pepsi (12-pack)': 900 };

const getSurgeMultiplier = () => 1.0;
const getServicePrice = (name) => servicePrices[name] || 0;
const getServiceTotal = (name) => servicePrices[name] || 0;

// Simulate usePricing dependencies
const ADD_ON_MAP = { pep: 'Pepsi (12-pack)' };
const FALLBACK_PRICES = { pep: 900 };

// 1. calculateSubtotal
let total = 0;
const servicesToProcess = bookingData.selectedServices?.length > 0 
    ? bookingData.selectedServices 
    : (bookingData.serviceType ? [bookingData.serviceType] : []);

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
console.log("Subtotal:", total);

// 2. detailedBreakdown
const breakdown = [];
const cfg = pricingConfig;
const surge = getSurgeMultiplier();
const multiplier = surge > 0 ? surge : 1.0;

servicesToProcess.forEach(serviceName => {
    // ...
});

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
                    surgeApplied: false
                });
            }
        }
    });
}
console.log("Breakdown:", breakdown);

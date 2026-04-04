const EIA_API_KEY = import.meta.env.VITE_EIA_API_KEY;
const BASE_URL = 'https://api.eia.gov/v2/petroleum/pri/gnd/data/';
const CACHE_KEY = 'carly_gas_prices';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Default fallback prices in cents per gallon
const DEFAULT_PRICES = {
    'Regular (87 Octane)': 350,
    'Mid-Grade (89 Octane)': 390,
    'Premium (91-93 Octane)': 430,
    'Diesel': 410,
    'EV Recharging': 2500 // Not from EIA, keeping for consistency in service if needed
};

// Map EIA series/descriptions to our app's fuel types
const FUEL_MAPPING = {
    'U.S. Regular Gasoline, Weekly': 'Regular (87 Octane)',
    'U.S. Midgrade Gasoline, Weekly': 'Mid-Grade (89 Octane)',
    'U.S. Premium Gasoline, Weekly': 'Premium (91-93 Octane)',
    'U.S. No 2 Diesel, Weekly': 'Diesel'
};

export const getGasPrices = async () => {
    try {
        // Check cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                console.log('Using cached gas prices');
                return data;
            }
        }

        if (!EIA_API_KEY) {
            console.warn('EIA API key missing, using default prices');
            return DEFAULT_PRICES;
        }

        const url = `${BASE_URL}?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=100`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch from EIA');

        const json = await response.json();
        const data = json.response.data;

        const prices = { ...DEFAULT_PRICES };

        // Find the latest value for each mapped fuel type
        // The data is sorted by period desc, so the first match for each series is the latest
        const processedTypes = new Set();

        for (const item of data) {
            const mappedType = FUEL_MAPPING[item.seriesDescription] || FUEL_MAPPING[item.series];
            if (mappedType && !processedTypes.has(mappedType)) {
                // EIA values are usually in dollars per gallon, convert to cents
                prices[mappedType] = Math.round(parseFloat(item.value) * 100);
                processedTypes.add(mappedType);
            }

            // If we found all 4 types, we can stop
            if (processedTypes.size === 4) break;
        }

        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: prices,
            timestamp: Date.now()
        }));

        return prices;
    } catch (error) {
        console.error('Error fetching gas prices:', error);
        return DEFAULT_PRICES;
    }
};

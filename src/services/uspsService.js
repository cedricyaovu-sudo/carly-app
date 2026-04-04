import { supabase } from '../lib/supabase';

let lastFailedAddress = '';

export const verifyAddressWithUSPS = async (inputAddress) => {
    if (!inputAddress || typeof inputAddress !== 'string' || !inputAddress.trim()) {
        return { isValid: false, message: 'Please enter an address' };
    }

    try {
        const { data, error } = await supabase.functions.invoke('usps-verify', {
            body: { address: inputAddress }
        });

        if (error) {
            console.error("USPS Edge Function Error (Supabase):", error);
            // If the Edge Function itself fails (e.g. not deployed), fail open so user isn't stuck
            return { isValid: true };
        }

        if (data && !data.isValid) {
            if (lastFailedAddress !== inputAddress) {
                lastFailedAddress = inputAddress;
                return { isValid: false, message: data.message ? `${data.message} Click again to proceed anyway.` : 'Invalid address. Click again to proceed anyway.' };
            } else {
                // Bypass on second attempt
                return { isValid: true, message: 'Bypassed validation' };
            }
        }

        // Reset if success
        if (data && data.isValid) {
            lastFailedAddress = '';
        }

        return data; // Returns { isValid: boolean, message?: string, standardized?: object }
    } catch (e) {
        console.error("USPS Invocation Error:", e);
        return { isValid: true };
    }
};

export const searchAddressAutocomplete = async (query) => {
    if (!query || query.length < 3) return [];
    
    try {
        // Use free Nominatim OpenStreetMap API for autocomplete suggestions
        // This provides real-time "as user types" suggestions before USPS validation
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.append("q", query);
        url.searchParams.append("format", "json");
        url.searchParams.append("addressdetails", "1");
        url.searchParams.append("countrycodes", "us");
        url.searchParams.append("limit", "5");
        
        const response = await fetch(url.toString(), {
            headers: {
                "Accept-Language": "en-US,en;q=0.9",
                "User-Agent": "CarlyApp/1.0"
            }
        });
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.map(item => ({
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
            address: item.address
        }));
    } catch(e) {
        console.error("Autocomplete Error:", e);
        return [];
    }
};

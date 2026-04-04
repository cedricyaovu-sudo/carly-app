import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Get API keys from environment
const USPS_CLIENT_ID = Deno.env.get("USPS_CLIENT_ID") || "KhAYGNITpAGqIKQ0NmwMG2XmRnl1rToW3rOMMhyjN9PLzVwR";
const USPS_CLIENT_SECRET = Deno.env.get("USPS_CLIENT_SECRET") || "kPl8w8zUAUqKJTAyDyAkTonvnOAAPpVGvdO67lJxRYOJA4a6YP0u9trxfJPYAm3W";

let cachedToken = null;
let tokenExpiresAt = 0;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // allow frontend origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getUSPSToken = async () => {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    try {
        const response = await fetch("https://api.usps.com/oauth2/v3/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                client_id: USPS_CLIENT_ID,
                client_secret: USPS_CLIENT_SECRET,
                grant_type: "client_credentials"
            })
        });

        const data = await response.json();
        if (data.access_token) {
            cachedToken = data.access_token;
            // Token usually expires in ~1 hour (3599 seconds)
            tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
            return cachedToken;
        }
        throw new Error("Unable to fetch USPS token");
    } catch (e) {
        console.error("USPS Token Error:", e);
        return null;
    }
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { address } = await req.json();

        if (!address || typeof address !== 'string' || !address.trim()) {
            return new Response(
                JSON.stringify({ isValid: false, message: 'Please enter an address' }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

        const token = await getUSPSToken();
        if (!token) {
            return new Response(
                JSON.stringify({ isValid: false, message: 'USPS Service Unavailable' }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

        let street = "", city = "", state = "", zip = "";
        const parts = address.split(',').map(s => s.trim());
        
        if (parts.length >= 4) {
            street = parts[0];
            city = parts[1];
            state = parts[2];
            zip = parts[parts.length - 1]; // Assume last part is zip if fully comma separated
            
            // Clean up possible space in state if they typed "TX 77004" but also added trailing comma weirdness
            const stateZip = state.split(' ').filter(Boolean);
            if (stateZip.length > 1) {
                 state = stateZip[0];
                 zip = stateZip[1];
            }
        } else if (parts.length === 3) {
            street = parts[0];
            city = parts[1];
            const stateZip = parts[2].split(' ').filter(Boolean);
            state = stateZip[0];
            if (stateZip.length > 1) zip = stateZip[1];
        } else if (parts.length === 2) {
            street = parts[0];
            city = parts[1];
        } else {
            street = address; 
        }

        const url = new URL("https://api.usps.com/addresses/v3/address");
        url.searchParams.append("streetAddress", street);
        if (city) url.searchParams.append("city", city);
        if (state) url.searchParams.append("state", state);
        if (zip) url.searchParams.append("ZIPCode", zip);

        const addrRes = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!addrRes.ok) {
            // USPS returns 400 for bad addresses like "123 Fake Street, Faketown, FK"
            return new Response(
                JSON.stringify({ isValid: false, message: 'Invalid address.' }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

        const addrData = await addrRes.json();
        const addressMatch = addrData?.address || addrData?.matches?.[0];
        
        if (addressMatch) {
            return new Response(
                JSON.stringify({ isValid: true, standardized: addressMatch }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        } else {
            return new Response(
                JSON.stringify({ isValid: false, message: 'Address not found or incomplete.' }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

    } catch (error) {
        console.error("Error verifying address:", error);
        return new Response(
            JSON.stringify({ isValid: false, message: "Server error verifying address." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
        );
    }
})

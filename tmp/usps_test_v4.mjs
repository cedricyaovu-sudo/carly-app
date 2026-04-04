import fs from 'fs';

const USPS_CLIENT_ID = 'KhAYGNITpAGqIKQ0NmwMG2XmRnl1rToW3rOMMhyjN9PLzVwR';
const USPS_CLIENT_SECRET = 'kPl8w8zUAUqKJTAyDyAkTonvnOAAPpVGvdO67lJxRYOJA4a6YP0u9trxfJPYAm3W';

const getUSPSToken = async () => {
    const response = await fetch("https://api.usps.com/oauth2/v3/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: USPS_CLIENT_ID,
            client_secret: USPS_CLIENT_SECRET,
            grant_type: "client_credentials"
        })
    });
    const data = await response.json();
    return data.access_token;
};

const verify = async (address) => {
    const token = await getUSPSToken();
    let street = "", city = "", state = "", zip = "";
    const parts = address.split(',').map(s => s.trim());
    
    if (parts.length >= 3) {
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

    console.log("URL for", address, ":", url.toString());

    const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
    });
    
    try {
        const text = await res.text();
        console.log("Status:", res.status, "Body:", text);
    } catch(e) {}
}

async function run() {
    await verify("123 Fake Street, Faketown, FK");
    await verify("asdfasdfasdf");
    await verify("1600 Pennsylvania Ave NW, Washington, DC 20500");
}
run();

import fs from 'fs';
import https from 'https';

const USPS_CLIENT_ID = 'KhAYGNITpAGqIKQ0NmwMG2XmRnl1rToW3rOMMhyjN9PLzVwR';
const USPS_CLIENT_SECRET = 'kPl8w8zUAUqKJTAyDyAkTonvnOAAPpVGvdO67lJxRYOJA4a6YP0u9trxfJPYAm3W';

const getUSPSToken = async () => {
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
    return data.access_token;
};

const verify = async (address) => {
    const token = await getUSPSToken();
    console.log("Token:", token.substring(0, 10) + "...");
    const url = new URL("https://api.usps.com/addresses/v3/address");
    url.searchParams.append("streetAddress", address);

    const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
    });
    
    console.log("Status:", res.status, "for", address);
    try {
        const data = await res.json();
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch(e) {
        console.log("No JSON body");
    }
}

async function run() {
    await verify("123 Fake Street, Faketown, FK");
    await verify("asdfasdfasdf");
    await verify("1600 Pennsylvania Ave NW, Washington, DC 20500");
}
run();

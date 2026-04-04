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
    let street = address;

    const url = new URL("https://api.usps.com/addresses/v3/address");
    url.searchParams.append("streetAddress", street);

    const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
    });
    
    const text = await res.text();
    fs.appendFileSync('usps_res_v6.txt', `\n\n--- FOR PARTIAL: ${address} ---\nURL: ${url.toString()}\nStatus: ${res.status}\nBody: ${text}\n`);
}

async function run() {
    fs.writeFileSync('usps_res_v6.txt', '');
    await verify("1600 Penns");
}
run();

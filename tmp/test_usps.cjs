async function test() {
  const tokenRes = await fetch("https://api.usps.com/oauth2/v3/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: "KhAYGNITpAGqIKQ0NmwMG2XmRnl1rToW3rOMMhyjN9PLzVwR",
      client_secret: "kPl8w8zUAUqKJTAyDyAkTonvnOAAPpVGvdO67lJxRYOJA4a6YP0u9trxfJPYAm3W",
      grant_type: "client_credentials"
    })
  });
  const tokenData = await tokenRes.json();
  
  if (!tokenData.access_token) {
      console.log("No token", tokenData);
      return;
  }

  // Parse address
  const input = "1600 Pennsylvania Ave NW, Washington, DC 20500";
  // Attempt to split by commas or last spaces
  // Typical: "Street, City, State Zip"
  let street = "", city = "", state = "", zip = "";
  const parts = input.split(',').map(s => s.trim());
  if (parts.length >= 3) {
      street = parts[0];
      city = parts[1];
      const stateZip = parts[2].split(' ');
      state = stateZip[0];
      if (stateZip.length > 1) zip = stateZip[1];
  } else {
      street = input; // fallback
  }

  const url = new URL("https://api.usps.com/addresses/v3/address");
  url.searchParams.append("streetAddress", street);
  if (city) url.searchParams.append("city", city);
  if (state) url.searchParams.append("state", state);
  if (zip) url.searchParams.append("ZIPCode", zip);

  const addrRes = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${tokenData.access_token}`
    }
  });

  const addrData = await addrRes.json();
  console.log("Structured address response:", JSON.stringify(addrData, null, 2));
}

test();


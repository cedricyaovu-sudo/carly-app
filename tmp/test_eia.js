import fetch from 'node-fetch';

const EIA_API_KEY = 'L2HGj9F'; // From .env
const BASE_URL = 'https://api.eia.gov/v2/petroleum/pri/gnd/data/';

async function testEIA() {
    const url = `${BASE_URL}?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=10`;
    console.log('Fetching:', url);
    try {
        const res = await fetch(url);
        const json = await res.json();
        console.log('Status:', res.status);
        if (json.response && json.response.data) {
            console.log('Sample Data:', json.response.data.slice(0, 3));
        } else {
            console.log('Unexpected response:', json);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

testEIA();

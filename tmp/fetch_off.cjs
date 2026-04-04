const https = require('https');
const fs = require('fs');
const path = require('path');

const items = {
  'sun': 'SunChips',
  'tos': 'Tostitos Scoops',
  'sma': 'Kettle Brand Chips',
  'fri': 'Fritos',
  'var': 'Frito-Lay Variety',
  'chz': 'Cheez-It Original',
  'gfc': 'Gluten Free Cheez-It',
  'dot': 'Dots Pretzels',
  'waf': 'Wafer Cookies',
  'fam': 'Famous Amos',
  'aho': 'Chips Ahoy',
  'rol': 'Swiss Rolls',
  'rice': 'Rice Krispies Treats',
  'pud': 'Chocolate Pudding',
  'mot': 'Motts Fruit Snacks',
  'fru': 'Fruit Roll-Ups',
  'res': 'Reeses',
  'awrb': 'Root Beer',
  'pep': 'Pepsi',
  'preb': 'Olipop',
  'c4e': 'C4 Energy',
  'cel': 'CELSIUS',
  'mon': 'Monster Energy',
  'aln': 'Alani Nu',
  'red': 'Red Bull',
  'gat': 'Gatorade',
  'koo': 'Kool-Aid Bursts',
  'pop': 'Poppi',
  'boo': 'BOOST Drink'
};

async function fetchOffImage(query) {
  return new Promise((resolve) => {
    https.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`, {
      headers: { 'User-Agent': 'CarlyApp/1.0 (info@carlyapp.com)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.products && json.products.length > 0) {
            // Find first product with a front image URL
            const product = json.products.find(p => p.image_front_url);
            resolve(product ? product.image_front_url : null);
          } else {
            resolve(null);
          }
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  const map = {};
  for (const [id, query] of Object.entries(items)) {
    const url = await fetchOffImage(query);
    if (url) {
      map[id] = url;
    } else {
      map[id] = 'https://placehold.co/400x400/eeeeee/666666?text=' + encodeURIComponent(query);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  fs.writeFileSync(path.join(__dirname, 'tmp', 'off_images.json'), JSON.stringify(map, null, 2));
  console.log('DONE_FETCHING_OFF');
})();

const https = require('https');

const items = {
  'sun': 'SunChips Original 7oz bag',
  'tos': 'Tostitos Scoops 14.5 oz bag',
  'sma': 'Kettle Brand Potato Chips Sea Salt 7.5 oz',
  'fri': 'Fritos Original Corn Chips 9.25 oz bag',
  'var': 'Frito-Lay Variety Pack 42 count box',
  'chz': 'Cheez-It Original Crackers 12.4 oz box',
  'gfc': 'Gluten Free Cheez-It Crackers box',
  'dot': 'Dots Homestyle Pretzels 14 oz bag',
  'waf': 'Vanilla Wafer Cookies 8oz box',
  'fam': 'Famous Amos Chocolate Chip Cookies box',
  'aho': 'Chips Ahoy Original 9.6 oz',
  'rol': 'Little Debbie Swiss Rolls box',
  'rice': 'Rice Krispies Treats 8 ct box',
  'pud': 'Snack Pack Chocolate Pudding 12 ct',
  'mot': 'Motts Fruit Snacks 40 ct box',
  'fru': 'Fruit Roll-Ups variety pack box',
  'res': 'Reeses King Size wrapper',
  'awrb': 'A&W Root Beer 12 pack cans',
  'pep': 'Pepsi 12 pack cans',
  'preb': 'Olipop Vintage Cola can',
  'c4e': 'C4 Energy Drink can',
  'cel': 'CELSIUS Fitness Drink can',
  'mon': 'Monster Energy Drink can',
  'aln': 'Alani Nu Energy Drink 12 pack',
  'red': 'Red Bull Energy Drink 4 pack',
  'gat': 'Gatorade Variety Pack 18 count',
  'koo': 'Kool-Aid Bursts 6 pack',
  'pop': 'Poppi Prebiotic Soda can',
  'boo': 'BOOST Nutritional Drink 24 pack'
};

async function searchYahooImage(query) {
  return new Promise((resolve) => {
    https.get(`https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/imgurl=([^&]+)&amp;/);
        if (match) {
          resolve(decodeURIComponent(match[1]));
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  const map = {};
  for (const [id, query] of Object.entries(items)) {
    const url = await searchYahooImage(query);
    if (url) map[id] = url;
    await new Promise(r => setTimeout(r, 100));
  }
  console.log("JSON_START");
  console.log(JSON.stringify(map, null, 2));
  console.log("JSON_END");
})();

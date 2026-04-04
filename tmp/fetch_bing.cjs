const https = require('https');
const fs = require('fs');
const path = require('path');

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
  'preb': 'Poppi Classic Cola can',
  'c4e': 'C4 Energy Drink yellow can',
  'cel': 'CELSIUS Fitness Drink can',
  'mon': 'Monster Energy Drink black green can',
  'aln': 'Alani Nu Cosmic Stardust Energy Drink can',
  'red': 'Red Bull Energy Drink can',
  'gat': 'Gatorade bottle',
  'koo': 'Kool-Aid Bursts 6 pack',
  'pop': 'Poppi Strawberry Lemon can',
  'boo': 'BOOST High Protein Nutritional Drink bottle'
};

const outputDir = path.join(__dirname, 'public', 'snacks');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function searchBing(query) {
  return new Promise((resolve) => {
    https.get(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Find the absolute first murl (media url)
        const match = data.match(/murl&quot;:&quot;(http[^&]+)&quot;/);
        if (match) {
          resolve(match[1]);
        } else {
          // Fallback to thumbnail
          const tMatch = data.match(/src="([^"]*tse[0-9]\.mm\.bing\.net[^"]*)"/);
          resolve(tMatch ? tMatch[1] : null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function downloadImage(url, dest) {
  return new Promise((resolve) => {
    const req = url.startsWith('https') ? https : require('http');
    req.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }}, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) return resolve(false);
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => { fs.unlink(dest, ()=>{}); resolve(false); });
  });
}

(async () => {
  const map = {};
  for (const [id, query] of Object.entries(items)) {
    console.log(`Searching: ${query}`);
    const imgUrl = await searchBing(query);
    if (imgUrl) {
      const dest = path.join(outputDir, `${id}.jpg`);
      const success = await downloadImage(imgUrl, dest);
      if (success) {
        map[id] = `/snacks/${id}.jpg`;
        console.log(`Success: ${id}`);
      } else {
        console.log(`Failed download: ${id}`);
      }
    } else {
      console.log(`Not found: ${id}`);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'tmp', 'bing_images.json'), JSON.stringify(map, null, 2));
  console.log('DONE');
  process.exit(0);
})();

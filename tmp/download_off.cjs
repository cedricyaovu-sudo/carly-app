const https = require('https');
const fs = require('fs');
const path = require('path');

const items = {
  'sun': 'SunChips Original',
  'tos': 'Tostitos Scoops',
  'sma': 'Kettle Brand Potato Chips',
  'fri': 'Fritos Original',
  'var': 'Frito-Lay Variety Pack',
  'chz': 'Cheez-It Original',
  'gfc': 'Cheez-It Gluten Free',
  'dot': 'Dots Pretzels',
  'waf': 'Vanilla Wafer',
  'fam': 'Famous Amos',
  'aho': 'Chips Ahoy',
  'rol': 'Swiss Rolls',
  'rice': 'Rice Krispies Treats',
  'pud': 'Snack Pack Pudding',
  'mot': 'Motts Fruit Snacks',
  'fru': 'Fruit Roll-Ups',
  'res': 'Reeses',
  'awrb': 'A&W Root Beer',
  'pep': 'Pepsi cola',
  'preb': 'Olipop Strawberry Vanilla',
  'c4e': 'C4 Energy',
  'cel': 'CELSIUS Fitness',
  'mon': 'Monster Energy',
  'aln': 'Alani Nu Energy',
  'red': 'Red Bull Energy',
  'gat': 'Gatorade Thirst Quencher',
  'koo': 'Kool-Aid Bursts',
  'pop': 'Poppi Prebiotic Soda',
  'boo': 'BOOST Nutritional Drink'
};

const outputDir = path.join(__dirname, 'public', 'snacks');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'CarlyApp/1.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
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

async function run() {
  const map = {};
  for (const [id, query] of Object.entries(items)) {
    console.log(`Searching for: ${query}`);
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
    const data = await fetchJson(searchUrl);
    
    let imageUrl = null;
    if (data && data.products && data.products.length > 0) {
      const product = data.products.find(p => p.image_front_url);
      if (product) imageUrl = product.image_front_url;
    }
    
    if (imageUrl) {
      console.log(`Downloading image for ${query}...`);
      const dest = path.join(outputDir, `${id}.jpg`);
      const success = await downloadImage(imageUrl, dest);
      if (success) {
        map[id] = `/snacks/${id}.jpg`;
      } else {
        map[id] = 'ERROR';
      }
    } else {
      console.log(`No image found for ${query}`);
      map[id] = 'NOT_FOUND';
    }
    
    await new Promise(r => setTimeout(r, 200));
  }
  
  fs.writeFileSync(path.join(__dirname, 'tmp', 'downloaded_snacks.json'), JSON.stringify(map, null, 2));
  console.log('Finished downloading snacks!');
}

run();

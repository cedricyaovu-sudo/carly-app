const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
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

async function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return resolve(false);
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => { fs.unlink(dest, ()=>{}); resolve(false); });
  });
}

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const map = {};
  
  for (const [id, query] of Object.entries(items)) {
    console.log(`Searching: ${query}`);
    await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=images&iax=images`, {waitUntil: 'networkidle2'});
    
    try {
      await page.waitForSelector('.tile--img__img', { timeout: 8000 });
      const imgUrl = await page.evaluate(() => {
        const img = document.querySelector('.tile--img__img');
        return img ? img.src : null;
      });
      
      if (imgUrl) {
         let finalUrl = imgUrl.startsWith('//') ? 'https:' + imgUrl : imgUrl;
         const dest = path.join(outputDir, `${id}.jpg`);
         const success = await downloadImage(finalUrl, dest);
         if (success) { 
           map[id] = `/snacks/${id}.jpg`; 
           console.log(`Downloaded ${id}`); 
         }
      } else {
        console.log(`No image tag found for ${query}`);
      }
    } catch(e) {
      console.log(`Failed for ${query} (Timeout or error)`);
    }
  }
  
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'tmp', 'snack_images.json'), JSON.stringify(map, null, 2));
  console.log('DONE');
})();

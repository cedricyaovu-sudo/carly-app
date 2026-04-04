const fs = require('fs');
const path = require('path');

const items = {
  'sun': 'SunChips Original 7oz bag front',
  'tos': 'Tostitos Scoops bag front',
  'sma': 'Kettle Brand Potato Chips Sea Salt bag',
  'fri': 'Fritos Original Corn Chips bag',
  'var': 'Frito-Lay Variety Pack 42 count',
  'chz': 'Cheez-It Original Crackers box',
  'gfc': 'Cheez-It Gluten Free box',
  'dot': 'Dots Pretzels 14 oz bag',
  'waf': 'Vanilla Wafer Cookies Nilla box',
  'fam': 'Famous Amos Chocolate Chip Cookies box',
  'aho': 'Chips Ahoy Original box',
  'rol': 'Little Debbie Swiss Rolls box',
  'rice': 'Rice Krispies Treats 8 ct box',
  'pud': 'Snack Pack Chocolate Pudding 12 ct',
  'mot': 'Motts Fruit Snacks 40 ct box',
  'fru': 'Fruit Roll-Ups variety pack box',
  'res': 'Reeses King Size packaging',
  'awrb': 'A&W Root Beer 12 pack cans',
  'pep': 'Pepsi 12 pack cans',
  'preb': 'Poppi Classic Cola can',
  'c4e': 'C4 Energy Drink yellow can',
  'cel': 'CELSIUS Fitness Drink can',
  'mon': 'Monster Energy Drink black green can',
  'aln': 'Alani Nu Energy Drink Cosmic Stardust can',
  'red': 'Red Bull Energy Drink can',
  'gat': 'Gatorade bottle',
  'koo': 'Kool-Aid Bursts 6 pack',
  'pop': 'Poppi Strawberry Lemon can',
  'boo': 'BOOST High Protein bottle'
};

const outputDir = path.join(__dirname, 'public', 'snacks');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function searchDDG(query) {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
    const text = await res.text();
    // DuckDuckGo HTML stores image thumbnails in `<img src="//external-content.duckduckgo.com/iu/?u=..."`
    const match = text.match(/<img class="[^"]*" src="\/\/external-content\.duckduckgo\.com\/iu\/\?u=([^&"]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  } catch(e) {}
  return null;
}

async function download(url, dest) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(dest, buffer);
    return true;
  } catch(e) {
    return false;
  }
}

async function run() {
  const promises = Object.entries(items).map(async ([id, query]) => {
    let imgUrl = await searchDDG(query);
    if (!imgUrl) {
      // Fallback
      imgUrl = `https://placehold.co/400x400/eeeeee/666666?text=${encodeURIComponent(query.split(' ').slice(0, 2).join(' '))}`;
    }
    const dest = path.join(outputDir, `${id}.jpg`);
    await download(imgUrl, dest);
    console.log(`Saved ${id}.jpg`);
  });
  
  await Promise.all(promises);
  console.log('DONE');
}

run();

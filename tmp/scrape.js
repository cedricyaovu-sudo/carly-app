const urls = [
  'https://www.walmart.com/ip/Lays-Classic-Potato-Chips-8-oz/10450320',
  'https://www.walmart.com/ip/Pringles-Sour-Cream-Onion-5-5-oz/10293213',
  'https://www.walmart.com/ip/Tostitos-Scoops-Tortilla-Chips/10291045',
  'https://www.walmart.com/ip/Snack-Pack-Chocolate-Pudding-12-Pack/10403446'
];
(async () => {
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
      const text = await res.text();
      const match = text.match(/<meta property="og:image"\s+content="([^"]+)"/);
      if (match) console.log(match[1]);
      else console.log('No image found: ', url);
    } catch(e) {
      console.log('Error', url, e.message);
    }
  }
})();

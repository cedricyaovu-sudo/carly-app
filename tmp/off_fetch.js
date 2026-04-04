const items = [
  'SunChips original', 'Tostitos Scoops', 'Kettle chips', 'Fritos original', 'Frito-Lay variety',
  'Cheez-It original', 'Gluten free Cheez-It', 'Dots Pretzels',
  'Vanilla Wafer Cookies', 'Famous Amos cookies', 'Chips Ahoy original', 'Little Debbie Swiss Rolls',
  'Rice Krispies Treats', 'Snack Pack chocolate pudding', 'Motts Fruit Snacks', 'Fruit Roll-Ups', 'Reeses King Size',
  'A&W Root Beer', 'Pepsi', 'Prebiotic soda', 'C4 Energy', 'CELSIUS fitness drink', 'Monster Energy', 'Alani Nu', 'Red Bull',
  'Gatorade', 'Kool-Aid Bursts', 'Poppi', 'BOOST nutritional drink'
];

(async () => {
  for (const item of items) {
    try {
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(item)}&search_simple=1&action=process&json=1`);
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        const product = data.products.find(p => p.image_front_url);
        if (product) {
          console.log(`{ id: '', name: '${item}', image: '${product.image_front_url}' },`);
        } else {
          console.log(`// ${item} - No image`);
        }
      } else {
        console.log(`// ${item} - Not found`);
      }
    } catch (e) {
      console.log(`// ${item} - Error`);
    }
    await new Promise(r => setTimeout(r, 150));
  }
})();

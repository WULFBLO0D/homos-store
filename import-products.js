const fs = require('fs');

const csv = fs.readFileSync('C:/Users/wulfd/Downloads/products.csv', 'utf-8');
const lines = csv.trim().split('\n').slice(1);

const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

function categorize(name) {
  const n = name.toLowerCase();
  if (n.includes('screen protector')) return { type: 'screen', icon: 'fa-shield-alt', descEn: 'Premium screen protector', descAr: 'حافظ شاشة فاخر' };
  if (n.includes('buds')) return { type: 'earbuds', icon: 'fa-headphones-alt', descEn: 'Wireless earbuds', descAr: 'سماعات لاسلكية' };
  if (n.includes('cable') || n.includes('with cable')) return { type: 'charger', icon: 'fa-plug', descEn: 'Fast charging cable', descAr: 'كابل شحن سريع' };
  if (n.includes('no cable')) return { type: 'earbuds', icon: 'fa-headphones-alt', descEn: 'Wireless earbuds (no cable)', descAr: 'سماعات لاسلكية (بدون كابل)' };
  if (n.match(/^(sendem|snzou|eillie)\s+(m\d|og\d|t\d)/i)) return { type: 'charger', icon: 'fa-plug', descEn: 'Fast charger / cable', descAr: 'شاحن / كابل سريع' };
  if (n.match(/^(sendem|snzou|eillie)\s+\d+$/i)) return { type: 'case', icon: 'fa-mobile-alt', descEn: 'Premium phone case', descAr: 'جراب هاتف فاخر' };
  if (n.includes('vabi')) return { type: 'headphones', icon: 'fa-headphones', descEn: 'Wireless headphones', descAr: 'سماعات لاسلكية' };
  return { type: 'earbuds', icon: 'fa-headphones-alt', descEn: 'Premium accessory', descAr: 'إكسسوارات فاخرة' };
}

function getTag(price) {
  const p = parseFloat(price);
  if (p >= 1000) return { en: 'Premium', ar: 'فاخر' };
  if (p >= 500) return { en: 'Featured', ar: 'مميز' };
  if (p >= 300) return { en: 'Popular', ar: 'رائج' };
  return { en: 'New', ar: 'جديد' };
}

function isPopular(name, price, qty) {
  const p = parseFloat(price);
  const q = parseInt(qty);
  if (p >= 500) return true;
  if (q >= 10) return true;
  if (name.toLowerCase().includes('buds')) return true;
  return false;
}

const products = lines.map(line => {
  const parts = line.split(',');
  const name = parts[0].trim();
  const sku = parts[2];
  const cost = parts[5];
  const price = parts[7];
  const qty = parts[15] || '0';
  
  if (!name || !price) return null;
  
  const cat = categorize(name);
  const tag = getTag(price);
  const popular = isPopular(name, price, qty);
  
  const nameArMap = {
    'Snzou': 'سنزو',
    'EILLIE': 'إيلي',
    'Sendem': 'سيندم',
    'Vabi': 'فابي',
  };
  
  let nameAr = name;
  for (const [en, ar] of Object.entries(nameArMap)) {
    if (name.startsWith(en)) {
      nameAr = name.replace(en, ar);
      break;
    }
  }
  
  return {
    icon: cat.icon,
    titleEn: name,
    titleAr: nameAr,
    price: price.replace(/\.0$/, ''),
    tagEn: tag.en,
    tagAr: tag.ar,
    descEn: cat.descEn + ' - ' + name,
    descAr: cat.descAr + ' - ' + nameAr,
    popular: popular,
    barcode: parts[3] || '',
    sku: sku || '',
    quantity: parseInt(qty) || 0,
    cost: cost || '',
    brand: name.split(' ')[0]
  };
}).filter(Boolean);

data.products = products;

fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf-8');

console.log(`Imported ${products.length} products`);
console.log(`Popular: ${products.filter(p => p.popular).length}`);
console.log(`Brands: Snzou=${products.filter(p => p.titleEn.startsWith('Snzou')).length}, EILLIE=${products.filter(p => p.titleEn.startsWith('EILLIE')).length}, Sendem=${products.filter(p => p.titleEn.startsWith('Sendem')).length}, Vabi=${products.filter(p => p.titleEn.startsWith('Vabi')).length}`);

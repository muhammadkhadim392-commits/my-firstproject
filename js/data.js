/* ##########################################################################
   js/data.js  -  MASTER PRODUCT & PRICE LIST  (the ONE source of truth)
   Change a price or badge HERE and Home, Products, Quick View, Order, Deals and Cart
   all update. Prices are Rs per kg.
   cats  = categories used by the filters (beef | mutton | camel | minced | sheep)
   badge = BESTSELLER | POPULAR | FRESH | HOT DEAL | NEW | PREMIUM CUT
   featured = shown on the Home page      popular = shown in "Popular today" (empty cart)
   ########################################################################## */
(function (P) {
P.products = [
  { id: 'fresh-beef',      name: 'Fresh Beef',        cats: ['beef'],                    price: 1500, badge: 'Bestseller',  img: 'images/home/fresh-beef.jpeg',                      desc: 'Tender, hygienically processed everyday beef.',         sub: 'Popular choice', featured: true, popular: true },
  { id: 'beef-boneless',   name: 'Beef Boneless',     cats: ['beef', 'minced'],          price: 1500, badge: 'Popular',     img: 'images/products/beef-boneless.jpg',                desc: 'Clean-cut boneless beef, ready to cook.',               sub: 'Boneless cut' },
  { id: 'beef-mince',      name: 'Beef Mince',        cats: ['beef', 'minced'],          price: 1600, badge: 'Fresh',       img: 'images/products/premium-beef-mince.webp',          desc: 'Freshly minced beef for kebabs and keema.',             sub: 'Mince' },
  { id: 'fresh-mutton',    name: 'Fresh Mutton',      cats: ['mutton'],                  price: 2400, badge: 'Bestseller',  img: 'images/home/premium-mutton-meat.jpg',              desc: 'Naturally tender mutton, rich in flavour.',             sub: 'Popular choice', featured: true, popular: true },
  { id: 'mutton-boneless', name: 'Mutton Boneless',   cats: ['mutton', 'minced'],        price: 2650, badge: 'Premium Cut', img: 'images/products/mutton-cubes.webp',                desc: 'Carefully trimmed boneless mutton cubes.',              sub: 'Boneless cut',   featured: true },
  { id: 'mutton-mince',    name: 'Mutton Mince',      cats: ['mutton', 'minced'],        price: 2800, badge: 'Hot Deal',    img: 'images/home/premium-mutton-mince.jpg',             desc: 'Rich, finely minced mutton for kebabs.',                sub: 'Mince',          featured: true, popular: true },
  { id: 'mutton-chops',    name: 'Mutton Chops',      cats: ['mutton'],                  price: 3000, badge: 'Premium Cut', img: 'images/products/premium-mutton-chops.jpg',         desc: 'Flavourful chops, ready for the grill.',                sub: 'Chops' },
  { id: 'fresh-camel',     name: 'Fresh Camel',       cats: ['camel'],                   price: 1600, badge: 'New',         img: 'images/home/camel-meat.jpg',                       desc: 'Lean, healthy camel meat, carefully cut.',              sub: 'Lean meat',      featured: true },
  { id: 'camel-mince',     name: 'Camel Mince',       cats: ['camel', 'minced'],         price: 1800, badge: 'Fresh',       img: 'images/products/camel-mince.webp',                 desc: 'Freshly prepared camel mince.',                         sub: 'Mince' },
  { id: 'fresh-sheep',     name: 'Fresh Sheep',       cats: ['mutton', 'sheep'],         price: 2300, badge: 'Popular',     img: 'images/home/premium-sheep-meat.jpg',               desc: 'Tender sheep meat, perfect for all recipes.',           sub: 'Fresh cut',      featured: true },
  { id: 'sheep-mince',     name: 'Sheep Mince',       cats: ['mutton', 'sheep', 'minced'], price: 2600, badge: 'Hot Deal',  img: 'images/home/premium-sheep-mince.jpg',              desc: 'Freshly prepared sheep mince for karahi and kebabs.',   sub: 'Mince',          featured: true },
  { id: 'beef-tenderloin', name: 'Beef Tenderloin',   cats: ['beef'],                    price: 2000, badge: 'Premium Cut', img: 'images/order/beef-tenderloin.jpeg',                desc: 'Tender, premium beef tenderloin.',                      sub: 'Premium cut',    featured: true },
  { id: 'karahi-pack',     name: 'Karahi Cut Pack',   cats: ['mutton'],                  price: 2450, badge: 'New',         img: 'images/products/premium-karahi-cut-pack.webp',     desc: 'Cleaned, cut and ready for karahi.',                    sub: 'Ready to cook' },
  { id: 'biryani-pack',    name: 'Biryani Cut Pack',  cats: ['mutton'],                  price: 2350, badge: 'Popular',     img: 'images/products/mutton-biryani.jpg',               desc: 'Medium bone-in pieces for biryani.',                    sub: 'Ready to cook' },
  { id: 'nihari-pack',     name: 'Nihari Cut Pack',   cats: ['beef'],                    price: 1700, badge: 'Fresh',       img: 'images/products/nihari-cut-pack.avif',             desc: 'Shank and bone-in cuts for nihari.',                    sub: 'Ready to cook' },
  { id: 'shami-mix',       name: 'Shami Kebab Mix',   cats: ['minced'],                  price: 1900, badge: 'Hot Deal',    img: 'images/products/shami-kabab-mix.webp',             desc: 'Mince blend ready for shami kebabs.',                   sub: 'Ready to cook' }
];

/* ---- DEAL BUNDLES: price is CALCULATED from the master list (old price = sum of parts, new price = old price minus the discount) ---- */
P.deals = [
  { id: 'beef-bundle',    name: 'Premium Beef Bundle', img: 'images/products/beef-boneless.jpg',               desc: '3 kg Beef Boneless + 1 kg Beef Mince',            items: [['beef-boneless', 3], ['beef-mince', 1]],              off: 18 },
  { id: 'karahi-deal',    name: 'Mutton Karahi Pack',  img: 'images/products/premium-karahi-cut-pack.webp',    desc: '2 kg cleaned Karahi Cut Pack, ready to cook',     items: [['karahi-pack', 2]],                                   off: 8 },
  { id: 'bbq-combo',      name: 'BBQ Chops Combo',     img: 'images/products/premium-mutton-chops.jpg',        desc: '1.5 kg Mutton Chops + 1 kg Mutton Boneless',      items: [['mutton-chops', 1.5], ['mutton-boneless', 1]],        off: 12 }
];
/* ---- DEAL OF THE DAY popup: per-kg products with a % off the master price ---- */
P.dayDeals = [ { id: 'mutton-mince', off: 10 }, { id: 'fresh-beef', off: 10 }, { id: 'mutton-boneless', off: 8 }, { id: 'sheep-mince', off: 12 } ];

/* ---- HELPERS ---- */
P.byId = function (id) { return P.products.filter(function (p) { return p.id === id; })[0]; };    // find a product by id
P.dealPrice = function (d) {                                                                       // {old, price, save} for a bundle
  var old = d.items.reduce(function (a, it) { return a + P.byId(it[0]).price * it[1]; }, 0);
  var price = Math.round(old * (1 - d.off / 100) / 50) * 50;                                       // rounded to the nearest Rs 50
  return { old: old, price: price, save: old - price };
};
P.dayPrice = function (d) {                                                                        // {old, price, save} per kg for the popup
  var p = P.byId(d.id), price = Math.round(p.price * (1 - d.off / 100) / 10) * 10;
  return { p: p, old: p.price, price: price, save: p.price - price };
};

/* ---- SMART SEARCH SCORE (used by the Products search AND the suggestion dropdown) ----
   Words are matched from the START (prefix), so typing "b" finds BEEF first, then Boneless / Biryani.
   category word prefix = 100 points | name word prefix = 60 | other label word = 40 | description text (3+ letters) = 10
   Every typed word must match something; the highest total ranks first. 0 = no match. */
P.matchScore = function (p, q) {
  q = (q || '').toLowerCase().trim(); if (!q) return 1;
  var nameWords = p.name.toLowerCase().split(/\s+/), labelWords = (p.sub + ' ' + p.badge).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean), hay = (p.name + ' ' + p.desc).toLowerCase(), total = 0;
  var words = q.split(/\s+/);
  for (var i = 0; i < words.length; i++) {
    var w = words[i], s = 0;
    if (p.cats.some(function (c) { return c !== 'minced' && c.indexOf(w) === 0; })) s = 100;   // 'minced' is a grouping, not a meat, so "mince" matches names only
    else if (nameWords.some(function (t) { return t.indexOf(w) === 0; })) s = 60;
    else if (labelWords.some(function (t) { return t.indexOf(w) === 0; })) s = 40;
    else if (w.length >= 3 && hay.indexOf(w) > -1) s = 10;
    if (!s) return 0;                                                                       // a typed word matched nothing
    total += s;
  }
  return total;
};
})(window.PSH);

/* ##########################################################################
   js/config.js  -  SETTINGS + SHARED HELPERS  (must load FIRST)
   JS ARCHITECTURE (each file has ONE responsibility; they share the PSH object):
     config.js     settings + helpers          | ui.js        navbar, scroll, reveal, counters, toast
     cart.js       cart engine + cart page     | products.js  filters, search, quick view
     checkout.js   validation + WhatsApp order | calculator.js bulk quote calculator
     gallery.js    filters + lightbox          | main.js      contact form, deals, countdown, links
   ########################################################################## */
window.PSH = {
  WHATSAPP_NUMBER: '923081357658',   // <-- change your WhatsApp number HERE only (country code, no + or spaces)
  FREE_DELIVERY_OVER: 5000,          // free delivery when subtotal is above this (Rs)
  DELIVERY_FEE: 200,                 // flat delivery fee below that (Rs)
  MIN_KG: 0.25,                      // minimum order per item = 250 g

  $:  function (s, c) { return (c || document).querySelector(s); },                                   // short for querySelector
  $$: function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); },                 // querySelectorAll -> real array
  money: function (n) { return 'Rs ' + Math.round(n).toLocaleString(); },                             // 1500 -> "Rs 1,500"
  slug: function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }, // "Fresh Beef" -> "fresh-beef"
  page: (location.pathname.split('/').pop() || 'index.html').toLowerCase(),                           // current file, e.g. "products.html"
  fmtKg: function (q, unit) {                                                                         // 0.25 -> "250 g", 2 -> "2 kg", pack -> "1 pack"
    if (unit === 'pack') return q + (q === 1 ? ' pack' : ' packs');
    return q < 1 ? Math.round(q * 1000) + ' g' : (+q.toFixed(2)) + ' kg';
  },
  waLink: function (text) { return 'https://wa.me/' + this.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text); } // build a wa.me link
};

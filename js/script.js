/* ##########################################################################
   js/main.js  -  PAGE EXTRAS (load LAST): WhatsApp links, contact form,
   Deal-of-the-Day popup, deal countdowns
   ########################################################################## */
(function (P) {
var $ = P.$, $$ = P.$$;

/* ---- 1. Every <a data-wa> gets the WhatsApp number from config.js (+ optional data-msg text) ---- */
$$('[data-wa]').forEach(function (a) { a.href = P.waLink(a.dataset.msg || 'Hello Premium Slaughter House'); });

/* ---- 2. Contact form: validate, then send to WhatsApp ---- */
var cf = $('#contactForm');
if (cf) cf.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!cf.checkValidity()) { cf.classList.add('was-validated'); var bad = cf.querySelector(':invalid'); if (bad) bad.focus(); return; } // show errors
  var v = function (i) { return $('#' + i).value; };
  window.open(P.waLink('*Website Enquiry*\nName: ' + v('name') + '\nEmail: ' + v('email') + '\nPhone: ' + v('phone') + '\nSubject: ' + v('subject') + '\n\n' + v('message')), '_blank');
  P.toast('Opening WhatsApp\u2026'); cf.reset(); cf.classList.remove('was-validated');
});

/* ---- 3. Deal of the Day popup: opens 5 s after the FIRST visit; the floating button reopens it ---- */
var dm = $('#dealModal');
if (dm) {
  var m = new bootstrap.Modal(dm), fab = $('#dealFab'), car = $('#dealCar'), seen = false;
  try { seen = localStorage.getItem('dealSeen'); } catch (e) {}
  dm.addEventListener('shown.bs.modal', function () { bootstrap.Carousel.getOrCreateInstance(car).cycle(); fab.style.display = 'none'; });
  dm.addEventListener('hidden.bs.modal', function () { bootstrap.Carousel.getOrCreateInstance(car).pause(); fab.style.display = 'block'; });
  fab.onclick = function () { m.show(); };
  if (!seen) setTimeout(function () { m.show(); try { localStorage.setItem('dealSeen', '1'); } catch (e) {} }, 5000); else fab.style.display = 'block';
}

/* ---- 4. Deal countdowns: counts down to midnight (daily deal). ONLY keep this if the offer is genuinely time-limited. ---- */
var cds = $$('.countdown');
if (cds.length) {
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var tick = function () {
    var now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);                  // next midnight
    var s = Math.floor((end - now) / 1000), h = Math.floor(s / 3600), mi = Math.floor(s % 3600 / 60), se = s % 60;
    cds.forEach(function (c) { c.textContent = pad(h) + ':' + pad(mi) + ':' + pad(se); });
  };
  tick(); setInterval(tick, 1000);
}
})(window.PSH);
/* ##########################################################################
   js/cart.js  -  CART ENGINE (all pages) + CART LIST on order.html
   Stored in localStorage key 'cart' = [{id, name, price, qty, img, unit}]
   qty is in KG (0.25 = 250 g) unless unit === 'pack' (deal bundles).
   A backup copy lives in window.name so the cart also survives page changes when
   files are opened locally (file://) or storage is blocked.
   ########################################################################## */
(function (P) {
var $ = P.$, $$ = P.$$, money = P.money;

/* ---- 1. READ / WRITE ---- */
function get() {
  var s = null;
  try { s = localStorage.getItem('cart'); } catch (e) {}                                // main copy
  if (!s && window.name.indexOf('CART:') === 0) s = window.name.slice(5);               // backup copy
  try { return s ? JSON.parse(s) : []; } catch (e) { return []; }
}
function save(c) {
  var s = JSON.stringify(c);
  try { localStorage.setItem('cart', s); } catch (e) {}
  window.name = 'CART:' + s;
  badge(true);                                                                          // refresh counters with a tiny pop
  document.dispatchEvent(new Event('cart:changed'));                                    // lets checkout.js update the stepper
}

/* ---- 2. CART COUNTERS (navbar #cartBadgeCount + mobile bar #cartBadgeMobile) ---- */
function badge(bump) {
  var n = get().reduce(function (a, i) { return a + (i.unit === 'pack' ? 0 : i.qty); }, 0), packs = get().reduce(function (a, i) { return a + (i.unit === 'pack' ? i.qty : 0); }, 0);
  var label = (n ? +n.toFixed(2) : 0) + (packs ? '+' + packs : '');                    // e.g. "3.5" or "2+1"
  var b = $('#cartBadgeCount'), m = $('#cartBadgeMobile');
  if (m) m.textContent = label;
  if (b) { b.textContent = label; if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } }
}

/* ---- 3. ADD ITEM ---- */
function add(name, price, qty, img, unit) {
  unit = unit || 'kg';
  var c = get(), id = P.slug(name) + (unit === 'pack' ? '-pack' : ''), f = c.filter(function (i) { return i.id === id; })[0];
  if (f) f.qty += qty; else c.push({ id: id, name: name, price: +price, qty: qty, img: img || '', unit: unit });
  save(c);
  P.toast('\u2713 Added to cart: ' + P.fmtKg(qty, unit) + ' ' + name);                  // success feedback
}

/* ---- 4. TOTALS: subtotal, delivery rule, grand total ---- */
function totals(c) {
  var sub = c.reduce(function (a, i) { return a + i.price * i.qty; }, 0);
  var del = (!sub || sub > P.FREE_DELIVERY_OVER) ? 0 : P.DELIVERY_FEE;                 // free above Rs 5,000
  return { sub: sub, del: del, grand: sub + del };
}
P.cart = { get: get, save: save, add: add, totals: totals, badge: badge };
badge(false);                                                                           // correct number on every page load

/* ---- 5. "ADD" BUTTONS + CARD QUANTITY [-] [+] (one listener for the whole site) ---- */
document.addEventListener('click', function (e) {
  var a = e.target.closest('.add');
  if (a) {
    var card = a.closest('.pcard'), q = card && $('.qv', card) ? +$('.qv', card).textContent : 1; // kg chosen on the card (default 1)
    add(a.dataset.name, a.dataset.price, q, a.dataset.img, a.dataset.unit);
    if (!a.classList.contains('added')) {                                               // micro-interaction: Add -> Added -> Add
      var orig = a.innerHTML; a.classList.add('added'); a.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i> Added';
      setTimeout(function () { a.classList.remove('added'); a.innerHTML = orig; }, 1200);
    }
    if ($('#cartList')) render();
    return;
  }
  var m = e.target.closest('.qm,.qp');
  if (m) { var v = $('.qv', m.parentNode), n = +v.textContent + (m.classList.contains('qp') ? 1 : -1); v.textContent = Math.max(1, Math.min(100, n)); } // 1..100 kg
});

/* ---- 6. ORDER PAGE: draw the cart ---- */
function render() {
  var box = $('#cartList'); if (!box) return;
  var c = get(), t = totals(c);
  box.innerHTML = c.length ? c.map(function (i, k) {
    var u = i.unit === 'pack' ? 'pack' : 'kg';
    return '<div class="citem"><img src="' + i.img + '" alt="' + i.name + '" onerror="this.src=\'images/premium-beef.jpg\'">' +     // thumbnail
      '<div class="flex-fill"><div class="nm">' + i.name + '</div><small class="text-muted">' + money(i.price) + ' / ' + u + '</small></div>' + // name + unit price
      '<div class="qty"><button class="cq" data-k="' + k + '" data-d="-1" aria-label="Decrease weight of ' + i.name + '">&minus;</button><span class="qv" aria-live="polite">' + P.fmtKg(i.qty, i.unit) + '</span><button class="cq" data-k="' + k + '" data-d="1" aria-label="Increase weight of ' + i.name + '">+</button></div>' + // weight stepper
      '<b class="lt">' + money(i.price * i.qty) + '</b>' +                                                              // line subtotal
      '<button class="del" data-k="' + k + '" aria-label="Remove ' + i.name + '">&times;</button></div>';              // remove
  }).join('') : '<div class="empty"><i class="bi bi-cart-x" aria-hidden="true"></i><h4 class="mt-2">Your cart is empty</h4><p>Looks like you haven\'t added anything yet.</p><a href="products.html" class="btn btn-gold">Explore Products</a></div>'; // empty state
  $('#tSub').textContent = money(t.sub);
  $('#tDel').textContent = t.del ? money(t.del) : (t.sub ? 'FREE' : 'Rs 0');
  $('#tGrand').textContent = money(t.grand);
  $('#cartCount').textContent = c.length + (c.length === 1 ? ' item' : ' items');
  var fd = $('#freeDel');                                                                // free-delivery progress bar
  if (fd) {
    if (!t.sub) { fd.hidden = true; } else {
      fd.hidden = false; var left = P.FREE_DELIVERY_OVER - t.sub + 1;
      $('#freeTxt').innerHTML = t.del ? 'Add <b>' + money(left) + '</b> more for free delivery' : '\u2713 <b>You\'ve unlocked free delivery!</b>';
      $('#freeBar').style.width = Math.min(100, t.sub / P.FREE_DELIVERY_OVER * 100) + '%';
    }
  }
}
P.renderCart = render;
document.addEventListener('click', function (e) {                                       // weight +/- and remove
  var q = e.target.closest('.cq'), d = e.target.closest('.del'); if (!q && !d) return;
  var c = get();
  if (q) {
    var it = c[+q.dataset.k], dir = +q.dataset.d, pack = it.unit === 'pack';
    var step = pack ? 1 : (dir > 0 ? (it.qty < 2 ? .25 : .5) : (it.qty <= 2 ? .25 : .5)); // 250 g steps under 2 kg, else 500 g
    var next = Math.round((it.qty + dir * step) * 100) / 100;
    if (next < (pack ? 1 : P.MIN_KG)) { P.toast('Minimum quantity is ' + (pack ? '1 pack' : '250 g')); return; } // error state
    it.qty = next;
  }
  if (d) c.splice(+d.dataset.k, 1);
  save(c); render();
});
if ($('#cartList')) {                                                                    // deal links: order.html?product=...&price=...
  var p = new URLSearchParams(location.search);
  if (p.get('product')) { var c0 = get(), id0 = P.slug(p.get('product')); if (!c0.some(function (i) { return i.id === id0; })) { c0.push({ id: id0, name: p.get('product'), price: +p.get('price') || 0, qty: 1, img: '', unit: 'kg' }); save(c0); } history.replaceState(null, '', location.pathname); }
  render();
}
})(window.PSH);
/* ##########################################################################
   js/products.js  -  PRODUCT BROWSING: home chips, products-page filter + smart search
   (reads ?search= and ?category= from the URL), empty state, and Quick View modal
   ########################################################################## */
(function (P) {
var $ = P.$, $$ = P.$$, money = P.money;

/* ---- 1. HOME: category chips filter the "Most Loved Cuts" grid ---- */
$$('.chip[data-f]').forEach(function (c) {
  c.onclick = function () {
    $$('.chip[data-f]').forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
    c.classList.add('on'); c.setAttribute('aria-pressed', 'true');
    var f = c.dataset.f;
    $$('.pitem').forEach(function (p) {
      var show = f === 'all' || (' ' + p.dataset.c + ' ').indexOf(' ' + f + ' ') > -1; // card has this category?
      p.classList.toggle('hide', !show);
      if (show) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); }
    });
  };
});

/* ---- 2. PRODUCTS PAGE: category pills + smart live search ---- */
var box = $('#searchInput'), curCat = 'all';
function apply() {
  if (!box) return;
  var q = box.value.toLowerCase().trim(), words = q ? q.split(/\s+/) : [], n = 0;
  $$('.product-card-wrapper').forEach(function (card) {
    var cats = ' ' + card.getAttribute('data-category') + ' ';                           // e.g. " beef minced "
    var hay = (card.querySelector('.card-title').textContent + ' ' + (card.dataset.keywords || '')).toLowerCase(); // name + category + description words
    var ok = (curCat === 'all' || cats.indexOf(' ' + curCat + ' ') > -1) && words.every(function (w) { return hay.indexOf(w) > -1; }); // every typed word must match
    card.style.display = ok ? 'block' : 'none';
    if (ok) { n++; card.classList.add('in'); card.style.animation = 'none'; void card.offsetWidth; card.style.animation = 'fadeInUp 0.4s ease forwards'; }
  });
  var nr = $('#noRes'); if (nr) { nr.style.display = n ? 'none' : 'block'; var nq = $('#noQuery'); if (nq) nq.textContent = q || 'this category'; } // empty state with suggestions
  var cnt = $('#resCount'); if (cnt) cnt.textContent = n + (n === 1 ? ' product' : ' products'); // live result count
}
function setPill(cat) {                                                                  // highlight the pill that matches a category
  $$('.filter-btn').forEach(function (b) { var on = b.dataset.cat === cat; b.classList.toggle('active', on); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}
window.filterProducts = function (category) { curCat = category; setPill(category); apply(); };   // pills (onclick)
window.searchProducts = apply;                                                           // search box (oninput)
window.suggestSearch = function (t) { box.value = t; curCat = 'all'; setPill('all'); apply(); }; // suggestion buttons in the empty state
window.clearSearch = function () { box.value = ''; curCat = 'all'; setPill('all'); apply(); box.focus(); }; // "Clear search" button
if (box) {
  var u = new URLSearchParams(location.search), sp = u.get('search'), ct = u.get('category');
  if (ct && $('.filter-btn[data-cat="' + ct + '"]')) { curCat = ct; setPill(ct); }       // ?category=beef  (from home category cards / footer)
  if (sp) box.value = sp;                                                                // ?search=mutton  (from navbar search)
  apply();
}

/* ---- 3. QUICK VIEW MODAL (home + products): click image or "Quick View" ---- */
var qvEl = $('#quickView'), qvModal = null, qvCard = null, unit = 1, count = 1;         // unit = kg per pack (0.25 / 0.5 / 1), count = how many
function qvTotal() { $('#qvTotal').textContent = money(+qvCard.dataset.price * unit * count) + '  (' + count + ' \u00d7 ' + P.fmtKg(unit) + ')'; } // live total
function openQV(card) {
  qvCard = card; var d = card.dataset; unit = 1; count = 1;
  $('#qvImg').src = d.img; $('#qvImg').alt = d.name;
  $('#qvName').textContent = d.name;
  var r = +d.rating || 4.8;
  $('#qvStars').innerHTML = '<span class="stars" aria-hidden="true">' + '<i class="bi bi-star-fill"></i>'.repeat(Math.floor(r)) + (r % 1 >= .5 ? '<i class="bi bi-star-half"></i>' : '') + '</span> <small class="text-muted">' + r + ' rating</small>';
  $('#qvPrice').innerHTML = money(+d.price) + ' <small class="text-muted fs-6">/ kg</small>';
  $('#qvDesc').textContent = d.desc;
  $('#qvQty').textContent = 1;
  $$('#qvWeights .wchip').forEach(function (w) { var on = +w.dataset.kg === 1; w.classList.toggle('on', on); w.setAttribute('aria-pressed', on); }); // default 1 kg
  qvTotal();
  qvModal = qvModal || new bootstrap.Modal(qvEl);                                       // ESC key + backdrop click close it (Bootstrap)
  qvModal.show();
}
if (qvEl) document.addEventListener('click', function (e) {
  var o = e.target.closest('.qv-open'); if (o && o.closest('.pcard')) { openQV(o.closest('.pcard')); return; }  // open from card
  var w = e.target.closest('#qvWeights .wchip');                                         // weight chips [250g] [500g] [1kg]
  if (w) { unit = +w.dataset.kg; $$('#qvWeights .wchip').forEach(function (x) { var on = x === w; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); qvTotal(); return; }
  var s = e.target.closest('#qvMinus,#qvPlus');                                          // quantity stepper
  if (s) { count = Math.max(1, Math.min(20, count + (s.id === 'qvPlus' ? 1 : -1))); $('#qvQty').textContent = count; qvTotal(); return; }
  if (e.target.closest('#qvAdd')) { P.cart.add(qvCard.dataset.name, qvCard.dataset.price, unit * count, qvCard.dataset.img); qvModal.hide(); } // add + close
});
})(window.PSH);
/* ##########################################################################
   js/gallery.js  -  GALLERY: filters (fade + empty state) and lightbox
   (next / previous / close / ESC / arrow keys / swipe)
   ########################################################################## */
(function (P) {
var $ = P.$, $$ = P.$$;

/* ---- 1. Filters ---- */
$$('[data-gf]').forEach(function (b) {
  b.onclick = function () {
    $$('[data-gf]').forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
    b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
    var items = $$('.gal-item'); items.forEach(function (i) { i.classList.add('out'); });     // 1) fade out
    setTimeout(function () {
      var n = 0;
      items.forEach(function (i) { var show = b.dataset.gf === 'all' || i.dataset.cat === b.dataset.gf; i.classList.toggle('hide', !show); if (show) n++; }); // 2) swap
      var em = $('#galEmpty'); if (em) em.hidden = n > 0;                                      // empty state: "No images in this category."
      requestAnimationFrame(function () { items.forEach(function (i) { i.classList.remove('out'); }); }); // 3) fade in
    }, 280);
  };
});

/* ---- 2. Lightbox ---- */
var list = [], idx = 0, modal = null;
function show() {
  var el = list[idx]; if (!el) return; var img = $('#modalImage'); img.classList.add('swap');  // fade out
  setTimeout(function () {
    img.src = el.dataset.src; img.alt = el.dataset.title;
    $('#modalTitle').textContent = el.dataset.title; $('#modalDesc').textContent = el.dataset.desc;
    $('#modalCount').textContent = (idx + 1) + ' / ' + list.length;
    img.onload = function () { img.classList.remove('swap'); }; if (img.complete) img.classList.remove('swap'); // fade in
  }, 150);
}
window.openLightbox = function (el) {
  list = $$('.gal-item:not(.hide) .gi'); idx = Math.max(0, list.indexOf(el)); show();
  modal = modal || new bootstrap.Modal($('#galleryModal'));                                    // Bootstrap handles ESC + backdrop close + focus trap
  modal.show();
};
window.lbStep = function (d) { idx = (idx + d + list.length) % list.length; show(); };          // wraps around
document.addEventListener('keydown', function (e) {
  if (!$('#galleryModal.show')) return;
  if (e.key === 'ArrowRight') lbStep(1); if (e.key === 'ArrowLeft') lbStep(-1);
});
var gm = $('#galleryModal'), tx = 0;                                                            // swipe on phones
if (gm) { gm.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  gm.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1); }); }
})(window.PSH);
/* ##########################################################################
   js/calculator.js  -  SERVICES PAGE: interactive B2B bulk calculator
   Meat -> KG (number / slider / chips) -> itemised quote -> WhatsApp
   ########################################################################## */
(function (P) {
var $ = P.$, $$ = P.$$, money = P.money, b2 = $('#b2bForm'); if (!b2) return;
var TIERS = [{ min: 500, d: .12 }, { min: 250, d: .09 }, { min: 100, d: .06 }, { min: 50, d: .03 }]; // volume discount tiers (same as the table on the page)
function calc() {
  var base = +$('#b2bType').value, kg = Math.max(0, +$('#b2bKg').value || 0);
  var tier = TIERS.filter(function (t) { return kg >= t.min; })[0], d = tier ? tier.d : 0;            // highest tier reached
  var next = TIERS.slice().reverse().filter(function (t) { return t.min > kg; })[0];                  // next tier to unlock
  var sub = base * kg, off = sub * d, tot = sub - off, eff = kg ? tot / kg : base;
  $('#b2bOut').innerHTML =                                                                            // itemised receipt
    '<div><span>Base price</span><b>' + money(base) + ' / kg</b></div><div><span>Quantity</span><b>' + kg + ' kg</b></div>' +
    '<div><span>Subtotal</span><b>' + money(sub) + '</b></div><div class="disc"><span>Bulk discount (' + Math.round(d * 100) + '%)</span><b>- ' + money(off) + '</b></div>' +
    '<div class="tot"><span>Total</span><b>' + money(tot) + '</b></div><div><span>Effective price / kg</span><b>' + money(eff) + '</b></div>';
  var msg = $('#b2bMsg');
  if (kg < 10) { msg.className = 'calc-msg'; msg.textContent = '\u26a0 Minimum bulk order is 10 kg.'; }                       // error state
  else if (d) { msg.className = 'calc-msg win'; msg.textContent = '\u2713 You qualify for ' + Math.round(d * 100) + '% bulk discount' + (next ? ' \u2013 add ' + (next.min - kg) + ' kg more to reach ' + Math.round(next.d * 100) + '%' : ' (our best rate!)'); }
  else { msg.className = 'calc-msg'; msg.textContent = 'Order ' + (50 - kg) + ' kg more to unlock a 3% bulk discount.'; }
  $('#b2bBar').style.width = Math.min(100, next ? kg / next.min * 100 : 100) + '%';                    // progress to next tier
  $('#b2bRange').value = Math.min(kg, 1000);                                                          // keep slider in sync
  $('#b2bWa').href = P.waLink('Hello, bulk quote request:\n' + $('#b2bType').selectedOptions[0].text.split(' \u2013')[0] + ' \u2014 ' + kg + ' kg\nDiscount: ' + Math.round(d * 100) + '%\nEffective price/kg: ' + money(eff) + '\nEstimated total: ' + money(tot));
}
$('#b2bRange').addEventListener('input', function () { $('#b2bKg').value = this.value; calc(); });  // slider -> number box
$$('.kgchip').forEach(function (c) { c.onclick = function () { $('#b2bKg').value = c.dataset.kg; calc(); }; }); // quick chips
['input', 'change'].forEach(function (ev) { b2.addEventListener(ev, calc); }); calc();               // live + once at start
})(window.PSH);
/* ##########################################################################
   js/checkout.js  -  ORDER PAGE: saved customer details, validation (with error
   messages), progress stepper, professional WhatsApp order, success confirmation
   ########################################################################## */
(function (P) {
var $ = P.$, f = $('#orderForm'); if (!f) return;                                        // only runs on order.html
var ids = ['custName', 'custPhone', 'custCity', 'custArea', 'custAddress', 'custDate', 'custSlot', 'custPay'];

/* ---- 1. Customer details are remembered in localStorage (guest checkout - no account needed) ---- */
function load() { var s = {}; try { s = JSON.parse(localStorage.getItem('customer') || '{}'); } catch (e) {} ids.forEach(function (i) { var el = $('#' + i); if (el && s[i]) el.value = s[i]; }); }
function store() { var o = {}; ids.forEach(function (i) { var el = $('#' + i); if (el) o[i] = el.value; }); try { localStorage.setItem('customer', JSON.stringify(o)); } catch (e) {} return o; }
load();

/* ---- 2. Pakistani mobile validation: 11 digits starting with 03 ---- */
var ph = $('#custPhone'), re = /^03[0-9]{9}$/;
function checkPhone() {
  ph.value = ph.value.replace(/\D/g, '').slice(0, 11);                                   // digits only, max 11
  var ok = re.test(ph.value);
  ph.classList.toggle('is-valid', ok); ph.classList.toggle('is-invalid', !ok && ph.value.length > 0); // green / red
  ph.setCustomValidity(ok ? '' : 'Please enter a valid Pakistani mobile number.');
}
ph.addEventListener('input', checkPhone); checkPhone();
var dt = $('#custDate'); if (dt) dt.min = new Date().toISOString().split('T')[0];        // no past dates

/* ---- 3. Progress stepper: (1) Cart -> (2) Delivery -> (3) Confirm ---- */
var done3 = false;
function stepper() {
  var s1 = P.cart.get().length > 0, s2 = s1 && f.checkValidity();
  [['#stp1', s1, !s1], ['#stp2', s2, s1 && !s2], ['#stp3', done3, s2 && !done3]].forEach(function (x) { // [element, done?, current?]
    var el = $(x[0]); el.classList.toggle('done', x[1]); el.classList.toggle('now', x[2]);
  });
}
f.addEventListener('input', function () { store(); stepper(); });
f.addEventListener('change', function () { store(); stepper(); });
document.addEventListener('cart:changed', stepper); stepper();

/* ---- 4. Place order: validate -> WhatsApp message -> success message ---- */
window.checkoutViaWhatsApp = function (event) {
  event.preventDefault();
  var cart = P.cart.get();
  if (!cart.length) { P.toast('Your cart is empty - add items first'); return; }         // error: empty cart
  if (!f.checkValidity()) {                                                              // errors: show messages on every wrong field
    f.classList.add('was-validated');
    var bad = f.querySelector(':invalid'); if (bad) { bad.focus(); bad.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return;
  }
  var c = store(), t = P.cart.totals(cart), ref = 'PSH-' + Date.now().toString().slice(-6), m = P.money;
  var text = '*Premium Slaughter House*\n*New Order* (Ref: ' + ref + ')\n\n' +
    '*Customer:*\n' + c.custName + '\n\n*Phone:*\n' + c.custPhone + '\n\n*Order:*\n';
  cart.forEach(function (i) { text += '\u2022 ' + i.name + ' \u2014 ' + P.fmtKg(i.qty, i.unit) + ' (' + m(i.price * i.qty) + ')\n'; });
  text += '\n*Subtotal:* ' + m(t.sub) + '\n*Delivery:* ' + (t.del ? m(t.del) : 'FREE') + '\n*Total:* ' + m(t.grand) +
    '\n\n*Delivery:*\n' + c.custCity + '\n' + c.custArea + '\n' + c.custAddress +
    '\n\n*Date:* ' + c.custDate + '\n*Preferred time:* ' + c.custSlot + '\n*Payment:* ' + c.custPay;
  window.open(P.waLink(text), '_blank');                                                 // open WhatsApp with the receipt
  $('#okRef').textContent = ref; $('#okTotal').textContent = m(t.grand); $('#okName').textContent = c.custName;
  new bootstrap.Modal($('#successModal')).show();                                        // success state
  done3 = true; P.cart.save([]); P.renderCart(); f.classList.remove('was-validated'); stepper(); done3 = false; // empty cart, keep customer details
};
})(window.PSH);
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
/* ##########################################################################
   js/ui.js  -  GENERAL UI: toast, preloader, navbar, scroll effects, reveal,
   counters, timeline progress, newsletter, ticker, live-order notifications
   ########################################################################## */
(function (P) {
var $ = P.$, $$ = P.$$;

/* ---- 1. TOAST: small message box at the bottom ("added to cart" etc.) ---- */
var tt;
P.toast = function (m) {
  var t = $('#toast'); if (!t) return;                            // message box exists on every page
  t.textContent = m; t.classList.add('show');                     // show message
  clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, 2400); // hide after 2.4 s
};

/* ---- 2. PRELOADER: fade out the loading screen (CSS also auto-hides it as a safety net) ---- */
addEventListener('load', function () { setTimeout(function () { var l = $('#loader'); if (l) l.classList.add('done'); }, 400); });

/* ---- 3. NAVBAR: gold underline on current page + universal search ---- */
$$('.navbar .nav-link').forEach(function (a) {
  a.classList.toggle('active', (a.getAttribute('href') || '').toLowerCase() === P.page); // auto-mark the current page
});
var ns = $('#navSearch');
if (ns) ns.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;                                  // react only to Enter
  var term = ns.value.trim();
  if (P.page === 'products.html' && $('#searchInput')) { $('#searchInput').value = term; window.searchProducts(); } // already on Products: filter in place
  else location.href = 'products.html?search=' + encodeURIComponent(term);                                           // elsewhere: go to Products with ?search=
});

/* ---- 4. SCROLL EFFECTS: progress bar, navbar state, back-to-top, timeline progress ---- */
var bar = $('#progress'), nav = $('.navbar'), topBtn = $('#toTop'), tls = $$('.tlh');
function onScroll() {
  var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
  if (bar) bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';     // gold progress line
  if (nav) nav.classList.toggle('scrolled', y > 40);              // glass -> solid navbar (CSS transition makes it smooth)
  if (topBtn) topBtn.classList.toggle('show', y > 500);           // back-to-top after 500px
  tls.forEach(function (t) {                                      // About timeline line grows while scrolling
    var r = t.getBoundingClientRect(), p = (innerHeight * 0.75 - r.top) / (r.height + 120);
    t.style.setProperty('--p', Math.max(0, Math.min(1, p)));
  });
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();
if (topBtn) topBtn.onclick = function () { scrollTo({ top: 0, behavior: 'smooth' }); };

/* ---- 5. REVEAL ON SCROLL: subtle fade/slide using IntersectionObserver (data-d = stagger delay in ms) ---- */
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
$$('.reveal').forEach(function (e) { e.style.transitionDelay = (e.dataset.d || 0) + 'ms'; io.observe(e); });

/* ---- 6. ANIMATED COUNTERS (.counter-val[data-target] / [data-count]) ---- */
function animateCounters(el) {
  var end = +(el.dataset.target || el.dataset.count), suf = el.dataset.suf || '', t0 = null;
  if (!end) { el.textContent = '0' + suf; return; }               // target 0 stays 0
  (function f(t) {
    t0 = t0 || t; var p = Math.min((t - t0) / 1800, 1);           // 1.8 s ease-out
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * end).toLocaleString() + suf;
    if (p < 1) requestAnimationFrame(f);
  })(performance.now());
}
window.animateCounters = animateCounters;
var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { co.unobserve(e.target); animateCounters(e.target); } }); }, { threshold: 0.5 });
$$('.counter-val,[data-count]').forEach(function (e) { co.observe(e); });

/* ---- 7. NEWSLETTER FORM ---- */
var nf = $('#newsForm');
if (nf) nf.onsubmit = function (e) { e.preventDefault(); P.toast('Thank you for subscribing!'); nf.reset(); };

/* ---- 8. ANNOUNCEMENT TICKER: rotating live alerts ---- */
var tk = $('#ticker');
if (tk) {
  var msgs = ['Free Delivery on orders above Rs 5,000 | Pure Halal Cuts', 'Ahmed from DHA just ordered 3kg Beef', 'Usman from Raiwind just ordered 2kg Mutton', 'Fresh halal meat delivered daily'], ti = 0;
  tk.textContent = msgs[0];
  setInterval(function () { tk.style.opacity = 0; setTimeout(function () { ti = (ti + 1) % msgs.length; tk.textContent = msgs[ti]; tk.style.opacity = 1; }, 400); }, 4000);
}

/* ---- 9. LIVE ORDER NOTIFICATIONS (all pages): bottom-left toast every 12-15 s (SAMPLE messages) ---- */
(function () {
  var wrap = document.createElement('div');                       // build the toast container (no HTML needed in pages)
  wrap.className = 'toast-container position-fixed bottom-0 start-0 p-3'; wrap.style.zIndex = 1090;
  wrap.innerHTML = '<div id="liveToast" class="toast live-toast" role="status" aria-live="polite" data-bs-delay="5000"><div class="toast-body d-flex align-items-start gap-2"><i class="bi bi-bag-check-fill fs-4 text-warning" aria-hidden="true"></i><div><b class="text-warning small">LIVE ORDER</b><div id="toastBody"></div></div><button class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="Close notification"></button></div></div>';
  document.body.appendChild(wrap);
  var orders = ['Saad from Johar Town just ordered 2kg Mutton Boneless!', 'Usman from Johar Town just ordered 2kg Fresh Mutton!', 'Ahmed from DHA Lahore ordered 3kg Premium Beef', 'Ayesha from Gulberg ordered 1kg Mutton Mince', 'Hamza from Bahria Town ordered 5kg Fresh Beef'], le = $('#liveToast');
  function show() { $('#toastBody').textContent = orders[Math.floor(Math.random() * orders.length)]; if (window.bootstrap) bootstrap.Toast.getOrCreateInstance(le).show(); }
  function loop() { setTimeout(function () { show(); loop(); }, 12000 + Math.random() * 3000); }
  setTimeout(function () { show(); loop(); }, 7000);
})();

})(window.PSH);

/* ##########################################################################
   PREMIUM SLAUGHTER HOUSE - MAIN SCRIPT  (js/script.js, used by all 8 pages)
   Every block only runs if the elements it needs exist on the current page,
   so ONE file works everywhere. Every block below is commented.
   CONTENTS: 1 Settings | 2 Helpers | 3 WhatsApp links | 4 Preloader |
   5 Navbar (active link + search routing) | 6 Scroll effects | 7 Reveal |
   8 Counters | 9 Visual effects | 10 Toast | 11 Ticker | 12 CART engine |
   13 Home chips | 14 Products (URL search, filter, live search) |
   15 Order page (cart, fee, phone validation, WhatsApp receipt) |
   16 B2B calculator | 17 Gallery lightbox | 18 Contact form |
   19 Deal modal | 20 Live order notifications
   ########################################################################## */

/* ===== 1. SETTINGS - change your WhatsApp number HERE only (country code, no + or spaces) ===== */
var WHATSAPP_NUMBER = '923081357658';   // used by every WhatsApp button and the order receipt
var FREE_DELIVERY_OVER = 5000;          // client rule: free delivery when subtotal is above Rs 5,000
var DELIVERY_FEE = 200;                 // client rule: otherwise a flat Rs 200 fee

(function () {

/* ===== 2. HELPERS ===== */
var $  = function (s, c) { return (c || document).querySelector(s); };            // short for querySelector
var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); }; // querySelectorAll -> real array
var money = function (n) { return 'Rs ' + Math.round(n).toLocaleString(); };     // 1500 -> "Rs 1,500"
var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }; // "Fresh Beef" -> "fresh-beef" (used as item id)
var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();   // current file name, e.g. "products.html"

/* ===== 3. WHATSAPP LINKS: every <a data-wa> gets the number above (+ optional data-msg text) ===== */
$$('[data-wa]').forEach(function (a) {
  a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(a.dataset.msg || 'Hello Premium Slaughter House'); // build wa.me link
});

/* ===== 4. PRELOADER: hide the loading screen shortly after the page loads ===== */
addEventListener('load', function () {
  setTimeout(function () { var l = $('#loader'); if (l) l.classList.add('done'); }, 500); // fade out (CSS also auto-hides it as a safety net)
});

/* ===== 5. NAVBAR ===== */
/* 5a. Auto-underline the current page link (works even if the HTML 'active' class is missing) */
$$('.navbar .nav-link').forEach(function (a) {
  var file = (a.getAttribute('href') || '').toLowerCase();       // link target file
  a.classList.toggle('active', file === page || (page === '' && file === 'index.html')); // gold underline on match
});
/* 5b. Universal search: Enter key on the navbar search box */
var navSearch = $('#navSearch');                                  // the navbar search input
if (navSearch) {
  navSearch.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;                                // react only to the Enter key
    var term = navSearch.value.trim();                            // what the customer typed
    if (page === 'products.html') {                               // already on Products page...
      var box = $('#searchInput');                                // ...so filter the cards on the spot
      if (box) { box.value = term; window.searchProducts(); }     // copy text into page search + run filter (no reload)
    } else {                                                      // any other page...
      location.href = 'products.html?search=' + encodeURIComponent(term); // ...redirect with the search term in the URL
    }
  });
}

/* ===== 6. SCROLL EFFECTS: progress bar, shrinking navbar, back-to-top, parallax ===== */
var bar = $('#progress'), nav = $('.navbar'), topBtn = $('#toTop'), par = $$('[data-speed]'); // elements we update on scroll
function onScroll() {
  var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight; // current scroll + max scroll
  if (bar) bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';    // grow the gold progress line
  if (nav) nav.classList.toggle('scrolled', y > 40);              // slim navbar after 40px
  if (topBtn) topBtn.classList.toggle('show', y > 500);           // show back-to-top after 500px
  par.forEach(function (e) { e.style.transform = 'translateY(' + (y * e.dataset.speed) + 'px)'; }); // gentle parallax
}
addEventListener('scroll', onScroll, { passive: true });          // run on every scroll (passive = smooth)
onScroll();                                                       // run once on load
if (topBtn) topBtn.onclick = function () { scrollTo({ top: 0, behavior: 'smooth' }); }; // click = scroll to top

/* ===== 7. REVEAL-ON-SCROLL: fade/slide elements in when they enter the screen ===== */
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); // add .in once visible
}, { threshold: 0.12 });                                          // 12% visible = trigger
$$('.reveal').forEach(function (e) { e.style.transitionDelay = (e.dataset.d || 0) + 'ms'; io.observe(e); }); // stagger via data-d

/* ===== 8. ANIMATED COUNTERS: numbers count up when scrolled into view ===== */
function animateCounters(el) {
  var end = +(el.dataset.target || el.dataset.count), suf = el.dataset.suf || '', t0 = null; // target number + suffix (+, %)
  if (!end) { el.textContent = '0' + suf; return; }               // target 0 stays 0 (e.g. "0 temperature breakages")
  (function f(t) {
    t0 = t0 || t;                                                 // remember start time
    var p = Math.min((t - t0) / 1800, 1);                         // progress 0..1 over 1.8 seconds
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * end).toLocaleString() + suf; // ease-out count
    if (p < 1) requestAnimationFrame(f);                          // keep going until done
  })(performance.now());
}
window.animateCounters = animateCounters;                         // exposed so it can be called manually
var co = new IntersectionObserver(function (es) {
  es.forEach(function (e) { if (e.isIntersecting) { co.unobserve(e.target); animateCounters(e.target); } }); // start once
}, { threshold: 0.5 });
$$('.counter-val,[data-count]').forEach(function (e) { co.observe(e); }); // watch all counters

/* ===== 9. VISUAL EFFECTS: 3D tilt, magnetic buttons, cursor glow, hero embers ===== */
$$('.tilt').forEach(function (c) {                                // cards that lean toward the mouse
  c.addEventListener('mousemove', function (e) {
    var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; // mouse position inside card
    c.style.transform = 'perspective(800px) rotateY(' + x * 8 + 'deg) rotateX(' + -y * 8 + 'deg) translateY(-8px)'; // tilt + lift -8px
  });
  c.addEventListener('mouseleave', function () { c.style.transform = ''; }); // reset when mouse leaves
});
$$('.magnetic').forEach(function (b) {                            // buttons that drift toward the cursor
  b.addEventListener('mousemove', function (e) {
    var r = b.getBoundingClientRect();
    b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .25 + 'px,' + (e.clientY - r.top - r.height / 2) * .35 + 'px)';
  });
  b.addEventListener('mouseleave', function () { b.style.transform = ''; });
});
var g = $('#glow');                                               // soft light that follows the mouse
if (g && matchMedia('(hover:hover)').matches) {                   // only on devices with a real mouse
  addEventListener('mousemove', function (e) { g.style.opacity = 1; g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; });
}
var heroEl = $('.hero,.phero');                                   // hero section on any page
if (heroEl) {
  for (var i = 0; i < 22; i++) {                                  // create 22 tiny gold sparks
    var s = document.createElement('i'); s.className = 'ember';
    s.style.left = Math.random() * 100 + '%';                     // random horizontal position
    s.style.animationDuration = (6 + Math.random() * 8) + 's';    // random speed
    s.style.animationDelay = (Math.random() * 8) + 's';           // random start time
    heroEl.appendChild(s);
  }
}

/* ===== 10. TOAST MESSAGE (small "added to cart" popup) + wishlist hearts + newsletter ===== */
var tt;                                                           // timer handle
function toast(m) {
  var t = $('#toast'); if (!t) return;                            // bottom-centre message box
  t.textContent = m; t.classList.add('show');                     // show message
  clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, 2200); // hide after 2.2s
}
$$('.heart').forEach(function (b) {                               // wishlist heart toggle
  b.onclick = function () { b.classList.toggle('on'); b.innerHTML = b.classList.contains('on') ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>'; };
});
var nf = $('#newsForm');                                          // footer newsletter form
if (nf) nf.onsubmit = function (e) { e.preventDefault(); toast('Thank you for subscribing!'); nf.reset(); };

/* ===== 11. ANNOUNCEMENT BAR TICKER: rotating live alert messages ===== */
var tk = $('#ticker');
if (tk) {
  var msgs = ['Free Delivery on orders above Rs 5,000 | Pure Halal Cuts', 'Ahmed from DHA just ordered 3kg Beef', 'Usman from Raiwind just ordered 2kg Mutton', 'Fresh halal meat delivered daily', 'Bilal from Model Town ordered a Beef Combo'], ti = 0; // messages
  tk.textContent = msgs[0];                                       // start with the free-delivery alert
  setInterval(function () {
    tk.style.opacity = 0;                                         // fade out
    setTimeout(function () { ti = (ti + 1) % msgs.length; tk.textContent = msgs[ti]; tk.style.opacity = 1; }, 400); // swap text, fade in
  }, 4000);                                                       // every 4 seconds
}

/* ===== 12. CART ENGINE (shared by ALL pages) =====
   Stored in localStorage key 'cart' as [{id, name, price, qty, img}].
   A backup copy is kept in window.name so the cart also survives page switches
   when files are opened locally (file://) or storage is blocked. */
function getCart() {
  var s = null;
  try { s = localStorage.getItem('cart'); } catch (e) {}          // read from localStorage
  if (!s && window.name.indexOf('CART:') === 0) s = window.name.slice(5); // fallback copy
  try { return s ? JSON.parse(s) : []; } catch (e) { return []; } // parse safely
}
function saveCart(c) {
  var s = JSON.stringify(c);
  try { localStorage.setItem('cart', s); } catch (e) {}           // save main copy
  window.name = 'CART:' + s;                                      // save backup copy
  badge(true);                                                    // refresh header counter with pop animation
}
function badge(bump) {                                            // updates <span id="cartBadgeCount">
  var kg = getCart().reduce(function (a, i) { return a + i.qty; }, 0), b = $('#cartBadgeCount'); // total kg in cart
  if (b) { b.textContent = kg; if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } } // show number (+ pop)
}
function addToCart(name, price, qty, img) {
  var c = getCart(), id = slug(name), f = c.filter(function (i) { return i.id === id; })[0]; // existing item?
  if (f) f.qty += qty; else c.push({ id: id, name: name, price: +price, qty: qty, img: img || '' }); // add or increase
  saveCart(c); toast('\u2713 ' + qty + 'kg ' + name + ' added to cart'); // save + confirm
}
badge(false);                                                     // show correct count on every page load
document.addEventListener('click', function (e) {                 // one listener handles all Add / qty buttons
  var a = e.target.closest('.add');                               // "Add to Cart" clicked?
  if (a) {
    var card = a.closest('.pcard'), q = card && $('.qv', card) ? +$('.qv', card).textContent : 1; // quantity from card (default 1kg)
    addToCart(a.dataset.name, a.dataset.price, q, a.dataset.img); // put in cart
    if ($('#cartList')) renderCart();                             // refresh order page list if open
    return;
  }
  var m = e.target.closest('.qm,.qp');                            // [ - ] or [ + ] on a product card
  if (m) { var v = $('.qv', m.parentNode), n = +v.textContent + (m.classList.contains('qp') ? 1 : -1); v.textContent = Math.max(1, Math.min(100, n)); } // keep 1..100 kg
});

/* ===== 13. HOME PAGE: category chips filter the "Most Loved Cuts" grid ===== */
$$('.chip[data-f]').forEach(function (c) {
  c.onclick = function () {
    $$('.chip[data-f]').forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on'); // move highlight
    var f = c.dataset.f;                                          // chosen category
    $$('.pitem').forEach(function (p) {
      var show = f === 'all' || (' ' + p.dataset.c + ' ').indexOf(' ' + f + ' ') > -1; // match one of the card's categories
      p.classList.toggle('hide', !show);                          // hide non-matching
      if (show) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); } // replay fade
    });
  };
});

/* ===== 14. PRODUCTS PAGE: URL ?search=, category pills, live search ===== */
var curCat = 'all';                                               // currently selected pill
function applyProducts() {                                        // runs on every keystroke / pill click
  var box = $('#searchInput'), q = (box ? box.value : '').toLowerCase().trim(), n = 0; // search text
  $$('.product-card-wrapper').forEach(function (card) {
    var cats = ' ' + card.getAttribute('data-category') + ' ';    // card categories e.g. " beef minced "
    var ok = (curCat === 'all' || cats.indexOf(' ' + curCat + ' ') > -1) && card.querySelector('.card-title').innerText.toLowerCase().indexOf(q) > -1; // category AND text match
    card.style.display = ok ? 'block' : 'none';                   // show / hide
    if (ok) { n++; card.classList.add('in'); card.style.animation = 'none'; void card.offsetWidth; card.style.animation = 'fadeInUp 0.4s ease forwards'; } // replay fadeInUp 0.4s
  });
  var nr = $('#noRes'); if (nr) nr.style.display = n ? 'none' : 'block'; // "no results" message
}
window.filterProducts = function (category, event) {              // called by the pill buttons (onclick)
  $$('.filter-btn').forEach(function (b) { b.classList.remove('active', 'on'); }); // clear highlight
  if (event) event.currentTarget.classList.add('active', 'on');   // highlight clicked pill
  curCat = category; applyProducts();                             // filter
};
window.searchProducts = applyProducts;                            // called by the search input (oninput)
if ($('#searchInput')) {                                          // only on products.html
  var sp = new URLSearchParams(location.search).get('search');    // read ?search=beef from the URL
  if (sp) { $('#searchInput').value = sp; applyProducts(); }      // auto-fill the box + filter immediately
}

/* ===== 15. ORDER PAGE ===== */
/* 15a. Money maths: subtotal, delivery fee rule, grand total */
function totals(c) {
  var sub = c.reduce(function (a, i) { return a + i.price * i.qty; }, 0);            // sum of price x kg
  var del = (!sub || sub > FREE_DELIVERY_OVER) ? 0 : DELIVERY_FEE;                    // free over Rs 5,000, else Rs 200
  return { sub: sub, del: del, grand: sub + del };
}
/* 15b. Draw the cart list on the left column */
function renderCart() {
  var box = $('#cartList'); if (!box) return;                     // not on the order page
  var c = getCart();
  box.innerHTML = c.length ? c.map(function (i, k) {              // one row per item
    return '<div class="citem"><img src="' + i.img + '" alt="" onerror="this.src=\'images/premium-beef.jpg\'">' + // thumbnail
      '<div class="flex-fill"><div class="nm">' + i.name + '</div><small class="text-muted">' + money(i.price) + ' / kg</small></div>' + // name + unit price
      '<div class="qty"><button class="cq" data-k="' + k + '" data-d="-1">&minus;</button><span class="qv">' + i.qty + '</span><span class="qk">kg</span><button class="cq" data-k="' + k + '" data-d="1">+</button></div>' + // weight control
      '<b style="min-width:84px;text-align:right">' + money(i.price * i.qty) + '</b>' + // itemized total
      '<button class="del" data-k="' + k + '" aria-label="Remove item">&times;</button></div>'; // [ x ] remove button
  }).join('') : '<div class="empty"><i class="bi bi-cart-x"></i><p class="mt-2">Your cart is empty.</p><a href="products.html" class="btn btn-gold btn-sm">Browse Products</a></div>'; // empty state
  var t = totals(c);
  $('#tSub').textContent = money(t.sub);                          // subtotal
  $('#tDel').textContent = t.del ? money(t.del) : (t.sub ? 'FREE' : 'Rs 0'); // delivery fee (live)
  $('#tGrand').textContent = money(t.grand);                      // grand total
  $('#cartCount').textContent = c.reduce(function (a, i) { return a + i.qty; }, 0) + ' kg'; // total weight
}
window.renderCart = renderCart;
document.addEventListener('click', function (e) {                 // weight +/- and [x] remove on the order page
  var q = e.target.closest('.cq'), d = e.target.closest('.del'), c = getCart();
  if (q) { var it = c[+q.dataset.k]; it.qty = Math.max(1, it.qty + +q.dataset.d); saveCart(c); renderCart(); } // change kg
  if (d) { c.splice(+d.dataset.k, 1); saveCart(c); renderCart(); } // remove the item
});
/* 15c. Deal links (order.html?product=...&price=...) add that item once */
if ($('#cartList')) {
  var p = new URLSearchParams(location.search);
  if (p.get('product')) {
    var c0 = getCart(), pid = slug(p.get('product'));
    if (!c0.some(function (i) { return i.id === pid; })) { c0.push({ id: pid, name: p.get('product'), price: +p.get('price') || 0, qty: 1, img: '' }); saveCart(c0); }
    history.replaceState(null, '', location.pathname);            // clean the URL so refresh doesn't re-add
  }
  var dt = $('#custDate'); if (dt) dt.min = new Date().toISOString().split('T')[0]; // can't pick past dates
  renderCart();
}
/* 15d. Customer details are saved in localStorage as you type, and pre-filled next time */
var custFields = ['custName', 'custPhone', 'custCity', 'custArea', 'custAddress', 'custDate', 'custSlot', 'custPay']; // form field ids
function loadCustomer() {                                         // put saved values back into the form
  var saved = {}; try { saved = JSON.parse(localStorage.getItem('customer') || '{}'); } catch (e) {}
  custFields.forEach(function (id) { var el = $('#' + id); if (el && saved[id]) el.value = saved[id]; });
}
function saveCustomer() {                                         // store current form values
  var o = {}; custFields.forEach(function (id) { var el = $('#' + id); if (el) o[id] = el.value; });
  try { localStorage.setItem('customer', JSON.stringify(o)); } catch (e) {}
}
var of = $('#orderForm');
if (of) { loadCustomer(); of.addEventListener('input', saveCustomer); of.addEventListener('change', saveCustomer); } // restore + autosave
/* 15e. Pakistani mobile validation: 11 digits starting with 03 (pattern 03[0-9]{9}) with green/red border */
var ph = $('#custPhone');
if (ph) {
  var phRe = /^03[0-9]{9}$/;                                      // same rule as the HTML pattern
  var checkPhone = function () {
    ph.value = ph.value.replace(/\D/g, '').slice(0, 11);          // keep digits only, max 11
    var ok = phRe.test(ph.value);
    ph.classList.toggle('is-valid', ok);                          // green when valid
    ph.classList.toggle('is-invalid', !ok && ph.value.length > 0); // red when wrong
    ph.setCustomValidity(ok ? '' : 'Enter an 11-digit mobile number starting with 03 (e.g. 03001234567)'); // blocks submit if wrong
  };
  ph.addEventListener('input', checkPhone); checkPhone();
}
/* 15f. WhatsApp receipt: reads details + cart from localStorage, formats text, opens WhatsApp */
window.checkoutViaWhatsApp = function (event) {
  event.preventDefault();                                         // stop normal form submit
  saveCustomer();                                                 // make sure latest details are stored
  var cart = getCart();
  if (!cart.length) { alert('Your cart is empty!'); return; }     // nothing to order
  var cu = {}; try { cu = JSON.parse(localStorage.getItem('customer') || '{}'); } catch (e) {} // read customer from localStorage
  var t = totals(cart);                                           // subtotal / fee / total
  var text = '*NEW ORDER - PREMIUM SLAUGHTER HOUSE*\n\n' +        // receipt title
    '*Name:* ' + cu.custName + '\n*Phone:* ' + cu.custPhone + '\n' + // customer
    '*Address:* ' + cu.custAddress + ', ' + cu.custArea + ', ' + cu.custCity + '\n' + // address
    '*Delivery:* ' + cu.custDate + ' (' + cu.custSlot + ')\n*Payment:* ' + cu.custPay + '\n\n*Items Ordered:*\n'; // slot + payment
  cart.forEach(function (it, i) { text += (i + 1) + '. ' + it.name + ' (' + it.qty + 'kg) - Rs ' + (it.price * it.qty) + '\n'; }); // one line per item
  text += '\n*Subtotal:* Rs ' + t.sub + '\n*Delivery Fee:* Rs ' + t.del + '\n*Grand Total:* Rs ' + t.grand; // totals
  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank'); // open WhatsApp with the receipt
};

/* ===== 16. SERVICES PAGE: B2B bulk rate calculator ===== */
var b2 = $('#b2bForm');
if (b2) {
  var calc = function () {
    var base = +$('#b2bType').value, kg = Math.max(0, +$('#b2bKg').value || 0); // chosen rate + weight
    var d = kg >= 500 ? .12 : kg >= 250 ? .09 : kg >= 100 ? .06 : kg >= 50 ? .03 : 0; // tier discount
    var rate = base * (1 - d), tot = rate * kg;                   // discounted rate + estimated total
    $('#b2bOut').innerHTML = '<div><small>Rate / kg</small><b>' + money(rate) + '</b></div><div><small>Discount</small><b>' + Math.round(d * 100) + '%</b></div><div><small>Estimated Total</small><b>' + money(tot) + '</b></div>'; // show results
    $('#b2bWa').href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Hello, B2B quote request: ' + $('#b2bType').selectedOptions[0].text.split(' \u2013')[0] + ', ' + kg + ' kg, est. ' + money(tot) + ' (' + money(rate) + '/kg).'); // WhatsApp quote link
  };
  ['input', 'change'].forEach(function (ev) { b2.addEventListener(ev, calc); }); calc(); // recalc live + once at start
}

/* ===== 17. GALLERY: category filter tabs + fullscreen lightbox with next/prev ===== */
$$('[data-gf]').forEach(function (b) {                            // filter tab buttons
  b.onclick = function () {
    $$('[data-gf]').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); // move highlight
    $$('.gal-item').forEach(function (i) {
      var s = b.dataset.gf === 'all' || i.dataset.cat === b.dataset.gf; // matches category?
      i.classList.toggle('hide', !s); if (s) i.classList.add('in'); // show / hide
    });
  };
});
var lbList = [], lbIndex = 0, lbModal = null;                     // lightbox state
function lbShow() {                                               // draw the current image in the modal
  var el = lbList[lbIndex]; if (!el) return;
  $('#modalImage').src = el.dataset.src;                          // high-res image
  $('#modalImage').alt = el.dataset.title;                        // alt text
  $('#modalTitle').innerText = el.dataset.title;                  // image title
  $('#modalDesc').innerText = el.dataset.desc;                    // image description
  $('#modalCount').innerText = (lbIndex + 1) + ' / ' + lbList.length; // position counter
}
window.openLightbox = function (el) {                             // called by onclick on a thumbnail
  lbList = $$('.gal-item:not(.hide) .gi');                        // only the thumbnails currently visible
  lbIndex = lbList.indexOf(el); if (lbIndex < 0) lbIndex = 0;     // which one was clicked
  lbShow();
  lbModal = lbModal || new bootstrap.Modal($('#galleryModal'));   // create the Bootstrap modal once
  lbModal.show();                                                 // open it fullscreen
};
window.lbStep = function (d) { lbIndex = (lbIndex + d + lbList.length) % lbList.length; lbShow(); }; // next (+1) / previous (-1), wraps around
document.addEventListener('keydown', function (e) {               // keyboard arrows while lightbox is open
  if (!$('#galleryModal.show')) return;
  if (e.key === 'ArrowRight') lbStep(1); if (e.key === 'ArrowLeft') lbStep(-1);
});

/* ===== 18. CONTACT FORM: validates, then sends the message to WhatsApp ===== */
var cf = $('#contactForm');
if (cf) cf.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!cf.checkValidity()) { cf.classList.add('was-validated'); return; } // show red errors
  var v = function (i) { return $('#' + i).value; };              // read a field
  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('*Website Enquiry*\nName: ' + v('name') + '\nEmail: ' + v('email') + '\nPhone: ' + v('phone') + '\nSubject: ' + v('subject') + '\n\n' + v('message')), '_blank'); // open WhatsApp
  toast('Opening WhatsApp\u2026'); cf.reset(); cf.classList.remove('was-validated');
});

/* ===== 19. HOME: Deal of the Day modal - opens 5 seconds after the FIRST visit ===== */
var dm = $('#dealModal');
if (dm) {
  var m = new bootstrap.Modal(dm), fab = $('#dealFab'), car = $('#dealCar'), seen = false; // modal + floating button + slides
  try { seen = localStorage.getItem('dealSeen'); } catch (e) {}   // has the visitor seen it before?
  dm.addEventListener('shown.bs.modal', function () { bootstrap.Carousel.getOrCreateInstance(car).cycle(); fab.style.display = 'none'; }); // start slides
  dm.addEventListener('hidden.bs.modal', function () { bootstrap.Carousel.getOrCreateInstance(car).pause(); fab.style.display = 'block'; }); // show reopen button
  fab.onclick = function () { m.show(); };                        // reopen manually
  if (!seen) { setTimeout(function () { m.show(); try { localStorage.setItem('dealSeen', '1'); } catch (e) {} }, 5000); } // first visit: popup after 5s
  else { fab.style.display = 'block'; }                           // returning visitor: only the button
}

/* ===== 20. LIVE ORDER NOTIFICATIONS (all pages): bottom-left toast every 12-15 seconds ===== */
(function () {
  var wrap = document.createElement('div');                       // build the toast container ourselves (no HTML needed)
  wrap.className = 'toast-container position-fixed bottom-0 start-0 p-3'; wrap.style.zIndex = 1090;
  wrap.innerHTML = '<div id="liveToast" class="toast live-toast" role="alert" aria-live="polite" data-bs-delay="5000"><div class="toast-body d-flex align-items-start gap-2"><i class="bi bi-bag-check-fill fs-4 text-warning"></i><div><b class="text-warning small">LIVE ORDER</b><div id="toastBody"></div></div><button class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="Close"></button></div></div>';
  document.body.appendChild(wrap);                                // add to the page
  var orders = [                                                  // simulated customer activity
    'Saad from Johar Town just ordered 2kg Mutton Boneless!', 'Usman from Johar Town just ordered 2kg Fresh Mutton!',
    'Ahmed from DHA Lahore ordered 3kg Premium Beef', 'Bilal from Model Town ordered Beef Combo Pack',
    'Ayesha from Gulberg ordered 1kg Mutton Mince', 'Hamza from Bahria Town ordered 5kg Fresh Beef'];
  var le = $('#liveToast');
  function show() {
    $('#toastBody').innerText = orders[Math.floor(Math.random() * orders.length)]; // pick a random message
    bootstrap.Toast.getOrCreateInstance(le).show();               // slide it in
  }
  function loop() { setTimeout(function () { show(); loop(); }, 12000 + Math.random() * 3000); } // next one in 12-15 seconds
  setTimeout(function () { show(); loop(); }, 7000);              // first notification after 7 seconds
})();

})();
/* ##########################################################################
   js/cart.js  -  CART ENGINE (all pages) + CART LIST on order.html
   Stored in localStorage key 'cart' = [{id, name, price, qty, img, unit}]
   qty is in KG (0.25 = 250 g) unless unit === 'pack' (deal bundles).
   A backup copy lives in window.name so the cart also survives page changes when
   files are opened locally (file://) or storage is blocked.
   Public functions: addToCart(), removeFromCart(), updateQuantity(), calculateTotal()
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

/* ---- 2. TOTALS: subtotal, discount (hook), delivery rule, grand total ---- */
function calculateTotal(c) {
  c = c || get();
  var sub = c.reduce(function (a, i) { return a + i.price * i.qty; }, 0);
  var disc = 0;                                                                         // no promo codes in this demo (kept so the summary matches a real store)
  var del = (!sub || sub > P.FREE_DELIVERY_OVER) ? 0 : P.DELIVERY_FEE;                 // free above Rs 5,000
  return { sub: sub, disc: disc, del: del, grand: sub - disc + del };
}

/* ---- 3. COUNTERS (navbar #cartBadgeCount, mobile #cartBadgeMobile, products-page #miniCart) = number of items ---- */
function badge(bump) {
  var c = get(), n = c.length, b = $('#cartBadgeCount'), m = $('#cartBadgeMobile'), mc = $('#miniCart');
  if (m) m.textContent = n;
  if (b) { b.textContent = n; if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } }
  if (mc) mc.textContent = n ? n + (n === 1 ? ' item' : ' items') + ' \u00b7 ' + money(calculateTotal(c).sub) : 'Your cart is empty';
}

/* ---- 4. ADD / REMOVE / CHANGE QUANTITY ---- */
function addToCart(name, price, qty, img, unit) {
  unit = unit || 'kg';
  var c = get(), id = P.slug(name) + (unit === 'pack' ? '-pack' : ''), f = c.filter(function (i) { return i.id === id; })[0];
  if (f) f.qty = Math.round((f.qty + qty) * 100) / 100; else c.push({ id: id, name: name, price: +price, qty: qty, img: img || '', unit: unit });
  save(c);
  P.toast('\u2713 ' + name + ' added to cart');                                         // success feedback
}
function removeFromCart(k) { var c = get(); c.splice(k, 1); save(c); render(); }
function updateQuantity(k, dir) {
  var c = get(), it = c[k]; if (!it) return;
  var pack = it.unit === 'pack';
  var step = pack ? 1 : (dir > 0 ? (it.qty < 2 ? .25 : .5) : (it.qty <= 2 ? .25 : .5)); // 250 g steps under 2 kg, else 500 g
  var next = Math.round((it.qty + dir * step) * 100) / 100;
  if (next < (pack ? 1 : P.MIN_KG)) { P.toast('Minimum quantity is ' + (pack ? '1 pack' : '250 g')); return; } // error state
  it.qty = next; save(c); render();
}
P.cart = { get: get, save: save, add: addToCart, remove: removeFromCart, update: updateQuantity, totals: calculateTotal, badge: badge };
window.addToCart = addToCart; window.removeFromCart = removeFromCart; window.updateQuantity = updateQuantity; window.calculateTotal = calculateTotal;
badge(false);                                                                           // correct number on every page load

/* ---- 5. PRODUCT CARD CONTROLS: weight chips, quantity - 1 +, live total, Add ---- */
function cardKg(card) {                                                                 // weight x quantity = kg for this card
  var w = $('.wchip.on', card), u = w ? +w.dataset.kg : 1, n = +$('.qv', card).dataset.v || 1;
  return u * n;
}
function cardTotal(card) { var t = $('.ptot b', card); if (t) t.textContent = money(+card.dataset.price * cardKg(card)); } // Price/kg x weight x quantity
document.addEventListener('click', function (e) {
  var a = e.target.closest('.add');
  if (a) {
    var card = a.closest('.pcard');
    addToCart(a.dataset.name, a.dataset.price, card ? cardKg(card) : 1, a.dataset.img, a.dataset.unit);
    if (!a.classList.contains('added')) {                                               // micro-interaction: Add to Cart -> Added -> Add to Cart
      var orig = a.innerHTML; a.classList.add('added'); a.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i> Added';
      setTimeout(function () { a.classList.remove('added'); a.innerHTML = orig; }, 1500);
    }
    if ($('#cartList')) render();
    return;
  }
  var w = e.target.closest('.pcard .wchip');                                            // weight chip on a card
  if (w) { $$('.wchip', w.parentNode).forEach(function (x) { var on = x === w; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); cardTotal(w.closest('.pcard')); return; }
  var m = e.target.closest('.pcard .qm,.pcard .qp');                                    // quantity - / + (whole numbers 1..20)
  if (m) {
    var v = $('.qv', m.parentNode), n = Math.max(1, Math.min(20, (+v.dataset.v || 1) + (m.classList.contains('qp') ? 1 : -1)));
    v.dataset.v = n; v.textContent = n; cardTotal(m.closest('.pcard')); return;
  }
  var q = e.target.closest('.cq'), d = e.target.closest('.del');                        // order page: weight +/- and remove
  if (q) updateQuantity(+q.dataset.k, +q.dataset.d);
  if (d) removeFromCart(+d.dataset.k);
});

/* ---- 6. ORDER PAGE: draw the cart ---- */
function render() {
  var box = $('#cartList'); if (!box) return;
  var c = get(), t = calculateTotal(c);
  box.innerHTML = c.length ? '<div class="ct-head" aria-hidden="true"><span>Product</span><span>Qty</span><span>Price</span></div>' + c.map(function (i, k) {
    var u = i.unit === 'pack' ? 'pack' : 'kg';
    return '<div class="citem"><img src="' + i.img + '" alt="' + i.name + '" onerror="this.src=\'images/premium-beef.jpg\'">' +
      '<div class="flex-fill"><div class="nm">' + i.name + '</div><small class="text-muted">' + money(i.price) + ' / ' + u + '</small></div>' +
      '<div class="qty"><button class="cq" data-k="' + k + '" data-d="-1" aria-label="Decrease weight of ' + i.name + '">&minus;</button><span class="qv" aria-live="polite">' + P.fmtKg(i.qty, i.unit) + '</span><button class="cq" data-k="' + k + '" data-d="1" aria-label="Increase weight of ' + i.name + '">+</button></div>' +
      '<b class="lt">' + money(i.price * i.qty) + '</b>' +
      '<button class="del" data-k="' + k + '" aria-label="Remove ' + i.name + '">&times;</button></div>';
  }).join('') : '<div class="empty"><i class="bi bi-cart-x" aria-hidden="true"></i><h2 class="h4 mt-2">Your Cart Is Empty</h2><p>Your premium cuts are waiting for you.</p><a href="products.html" class="btn btn-gold">Browse Products</a><div class="popular-h">Popular today</div><div class="row g-2" id="popularToday"></div></div>'; // proper empty state + 3 popular cards
  if (!c.length && P.renderPopular) P.renderPopular($('#popularToday'));
  $('#tSub').textContent = money(t.sub);
  $('#tDisc').textContent = t.disc ? '- ' + money(t.disc) : 'Rs 0';
  $('#tDel').textContent = t.del ? money(t.del) : (t.sub ? 'FREE' : 'Rs 0');
  $('#tGrand').textContent = money(t.grand);
  $('#cartCount').textContent = c.length + (c.length === 1 ? ' item' : ' items');
  var fd = $('#freeDel');                                                               // free-delivery progress bar
  if (fd) {
    if (!t.sub) fd.hidden = true; else {
      fd.hidden = false; var left = P.FREE_DELIVERY_OVER - t.sub + 1;
      $('#freeTxt').innerHTML = t.del ? 'Add <b>' + money(left) + '</b> more for free delivery' : '\u2713 <b>You\'ve unlocked free delivery!</b>';
      $('#freeBar').style.width = Math.min(100, t.sub / P.FREE_DELIVERY_OVER * 100) + '%';
    }
  }
}
P.renderCart = render;
if ($('#cartList')) {                                                                   // deal links: order.html?product=...&price=...&img=...
  var p = new URLSearchParams(location.search);
  if (p.get('product')) { var c0 = get(), id0 = P.slug(p.get('product')); if (!c0.some(function (i) { return i.id === id0; })) { c0.push({ id: id0, name: p.get('product'), price: +p.get('price') || 0, qty: 1, img: p.get('img') || '', unit: 'kg' }); save(c0); } history.replaceState(null, '', location.pathname); }
  render();
}
})(window.PSH);

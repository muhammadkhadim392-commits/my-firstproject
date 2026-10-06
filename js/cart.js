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

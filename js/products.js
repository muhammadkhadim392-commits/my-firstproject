/* ##########################################################################
   js/products.js  -  PRODUCT BROWSING
   Home chips | Products page: search + category filter working TOGETHER, result
   counter, empty state | Quick View modal (0.5 kg steps, live total)
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
      var show = f === 'all' || (' ' + p.dataset.c + ' ').indexOf(' ' + f + ' ') > -1;
      p.classList.toggle('hide', !show);
      if (show) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); }
    });
  };
});

/* ---- 2. PRODUCTS PAGE: ONE function decides what is visible: (category) AND (search) -> matching products -> update counter ---- */
var box = $('#searchInput'), curCat = 'all';
var LABEL = { beef: 'Beef', mutton: 'Mutton', camel: 'Camel', minced: 'Minced & Boneless' };   // names used in the counter text
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }                           // 1 product / 3 products
function apply() {
  if (!box) return;
  var q = box.value.toLowerCase().trim(), cards = $$('.product-card-wrapper'), n = 0;
  cards.forEach(function (card) {
    var p = P.byId(card.querySelector('.pcard').dataset.id);                                    // the product behind this card (master list)
    var score = P.matchScore(p, q);                                                             // 0 = no match; higher = better (prefix + category first)
    var okCat = curCat === 'all' || p.cats.indexOf(curCat) > -1;                                // selected category pill?
    var ok = okCat && score > 0;                                                                // category AND search together
    card.style.display = ok ? 'block' : 'none';
    card.style.order = ok && q ? -score : '';                                                   // best matches first (typing "b" puts beef on top)
    if (ok) { n++; card.style.animation = 'none'; void card.offsetWidth; card.style.animation = 'fadeInUp 0.4s ease forwards'; }
  });
  var txt, cat = curCat !== 'all' ? LABEL[curCat] : '';
  if (!n) txt = 'No products found';
  else if (q && cat) txt = plural(n, cat + ' product') + ' found for \u201c' + q + '\u201d';
  else if (q) txt = plural(n, 'product') + ' found for \u201c' + q + '\u201d';
  else if (cat) txt = 'Showing ' + plural(n, cat + ' product');
  else txt = 'Showing ' + n + ' of ' + cards.length + ' products';
  var rc = $('#resCount'); if (rc) rc.textContent = txt;
  showEmpty(!n);
}
/* empty state is created only when needed (so it never appears in the page source / to crawlers) */
function showEmpty(show) {
  var nr = $('#noRes');
  if (!nr && show) {
    nr = document.createElement('div'); nr.id = 'noRes'; nr.className = 'nores';
    nr.innerHTML = '<i class="bi bi-search" aria-hidden="true"></i><h2 class="h4 mt-2">No products found</h2><p class="text-secondary">Try another search or category.</p><div class="d-flex gap-2 justify-content-center flex-wrap"><button class="chip" data-suggest="beef">Beef</button><button class="chip" data-suggest="mutton">Mutton</button><button class="chip" data-suggest="camel">Camel</button><button class="btn btn-crim btn-sm" data-clear>Clear search</button></div>';
    $('#productGrid').parentNode.appendChild(nr);
    $$('[data-suggest]', nr).forEach(function (b) { b.addEventListener('click', function () { box.value = b.dataset.suggest; setCat('all'); }); });
    $$('[data-clear]', nr).forEach(function (b) { b.addEventListener('click', function () { box.value = ''; setCat('all'); box.focus(); }); });
  }
  if (nr) nr.style.display = show ? 'block' : 'none';
}
function setPill(cat) {                                                                         // highlight the active pill
  $$('.filter-btn').forEach(function (b) { var on = b.dataset.cat === cat; b.classList.toggle('active', on); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}
function setCat(cat) { curCat = cat; setPill(cat); apply(); }
if (box) {
  $$('.filter-btn').forEach(function (b) { b.addEventListener('click', function () { setCat(b.dataset.cat); }); }); // pills (no inline JS)
  box.addEventListener('input', apply);                                                         // live search on every keystroke
  P.attachSuggest(box, function (p) { box.value = p.name; setCat('all'); });                    // suggestion dropdown (type "b" -> beef first)
  window.searchProducts = apply;                                                                // used by the navbar search (ui.js)
  var u = new URLSearchParams(location.search), sp = u.get('search'), ct = u.get('category');
  if (ct && $('.filter-btn[data-cat="' + ct + '"]')) { curCat = ct; setPill(ct); }              // ?category=beef  (home cards / footer)
  if (sp) box.value = sp;                                                                       // ?search=mutton  (navbar search)
  apply();
}

/* ---- 3. QUICK VIEW MODAL: image, name, description, halal, price/kg, weight chips, quantity, total, Add, close ----
   ESC, click outside and the X all close it (Bootstrap modal defaults). */
var qvEl = $('#quickView'), qvModal = null, qvCard = null, unit = 1, count = 1;           // unit = weight chip (0.25/0.5/1 kg), count = quantity
function qvKg() { return unit * count; }
function qvTotal() { $('#qvTotal').innerHTML = money(+qvCard.dataset.price) + ' \u00d7 ' + P.fmtKg(qvKg()) + ' = <b>' + money(+qvCard.dataset.price * qvKg()) + '</b>'; } // Rs 2,400 x 1.5 kg = Rs 3,600
function openQV(card) {
  qvCard = card; var d = card.dataset; unit = 1; count = 1;
  $('#qvImg').src = d.img; $('#qvImg').alt = d.name + ' - fresh halal meat';
  $('#qvName').textContent = d.name;
  $('#qvBadge').textContent = d.badge || ''; $('#qvSub').textContent = d.sub || '';      // badge + small text (no fake ratings)
  $('#qvPrice').innerHTML = money(+d.price) + ' <small class="text-muted fs-6">/ kg</small>';
  $('#qvDesc').textContent = d.desc;
  $('#qvQty').textContent = count;
  $$('#qvWeights .wchip').forEach(function (w) { var on = +w.dataset.kg === 1; w.classList.toggle('on', on); w.setAttribute('aria-pressed', on); });
  qvTotal();
  var ab = $('#qvAdd'); ab.classList.remove('added'); ab.innerHTML = '<i class="bi bi-cart-plus" aria-hidden="true"></i> Add to Cart';
  qvModal = qvModal || new bootstrap.Modal(qvEl);
  qvModal.show();
}
if (qvEl) document.addEventListener('click', function (e) {
  var o = e.target.closest('.qv-open'); if (o && o.closest('.pcard')) { openQV(o.closest('.pcard')); return; }  // open from a card
  var w = e.target.closest('#qvWeights .wchip');                                         // weight chips
  if (w) { unit = +w.dataset.kg; $$('#qvWeights .wchip').forEach(function (x) { var on = x === w; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); qvTotal(); return; }
  var s = e.target.closest('#qvMinus,#qvPlus');                                          // quantity - / +
  if (s) { count = Math.max(1, Math.min(20, count + (s.id === 'qvPlus' ? 1 : -1))); $('#qvQty').textContent = count; qvTotal(); return; }
  var a = e.target.closest('#qvAdd');
  if (a && !a.classList.contains('added')) {                                             // add, show "Added", then close
    P.cart.add(qvCard.dataset.name, qvCard.dataset.price, qvKg(), qvCard.dataset.img);
    a.classList.add('added'); a.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i> Added';
    setTimeout(function () { qvModal.hide(); }, 700);
  }
});
})(window.PSH);

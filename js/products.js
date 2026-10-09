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

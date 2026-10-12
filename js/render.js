/* ##########################################################################
   js/render.js  -  BUILDS THE PAGE CONTENT FROM THE MASTER LIST (js/data.js)
   One card template is used on Home, Products and (mini) Order, so every product
   looks and prices the same everywhere. Containers it fills (if present on the page):
     #grid (home featured) | #productGrid (all products) | #quickGrid (order quick add)
     #dealGrid (home deals) | #dealSlides + #dealInd (deal popup) | [data-cat-count]
   ########################################################################## */
(function (P) {
var $ = P.$, $$ = P.$$, money = P.money;
var FALLBACK = "this.onerror=null;this.src='images/premium-beef.jpg'";                   // shown if a product image is missing

/* ---- 1. THE PRODUCT CARD (same structure everywhere) ----
   Image + badge > name > small text > description > stock > price > weight [250g|500g|1kg] > quantity > Add > total */
function cardHTML(p, mode) {
  var wrapAttr = mode === 'shop'
    ? 'class="col-6 col-lg-3 product-card-wrapper" data-category="' + p.cats.join(' ') + '" data-keywords="' + (p.name + ' ' + p.cats.join(' ') + ' ' + p.desc + ' ' + p.sub).toLowerCase() + '"'
    : 'class="col-6 col-lg-3 pitem" data-c="' + p.cats.join(' ') + '"';                    // home grid uses data-c for its chips
  return '<div ' + wrapAttr + '><article class="pcard" data-id="' + p.id + '" data-name="' + p.name + '" data-price="' + p.price + '" data-img="' + p.img + '" data-desc="' + p.desc + '" data-badge="' + p.badge + '" data-sub="' + p.sub + '">' +
    '<div class="pimg qv-open"><span class="ptag">' + p.badge + '</span>' +                    // badge (BESTSELLER / POPULAR / FRESH ...)
    '<img src="' + p.img + '" alt="' + p.name + ' - fresh halal meat" loading="lazy" decoding="async" onerror="' + FALLBACK + '">' +
    '<button class="qv-ico qv-open" type="button" aria-label="Quick view ' + p.name + '"><i class="bi bi-eye" aria-hidden="true"></i></button>' +
    '<button class="qv-btn qv-open" type="button"><i class="bi bi-eye" aria-hidden="true"></i> Quick View</button></div>' +
    '<div class="pinfo"><h3 class="card-title">' + p.name + '</h3><div class="psub">' + p.sub + '</div>' +   // name + small secondary text (no fake ratings)
    '<p class="pdesc">' + p.desc + '</p>' +                                                  // 2-line description
    '<div class="phalal"><span class="stock"><i class="bi bi-circle-fill" aria-hidden="true"></i> In Stock</span> &middot; 100% Halal</div>' +
    '<div class="push"><div class="price">' + money(p.price) + ' <small>/kg</small></div>' + // price per kg
    '<div class="wchips" role="group" aria-label="Weight for ' + p.name + '"><button type="button" class="wchip" data-kg="0.25" aria-pressed="false">250g</button><button type="button" class="wchip" data-kg="0.5" aria-pressed="false">500g</button><button type="button" class="wchip on" data-kg="1" aria-pressed="true">1kg</button></div>' + // weight selector
    '<div class="acts"><div class="qty"><button class="qm" aria-label="Decrease quantity of ' + p.name + '">&minus;</button><span class="qv" data-v="1" aria-live="polite">1</span><button class="qp" aria-label="Increase quantity of ' + p.name + '">+</button></div>' + // quantity - 1 +
    '<button class="add" data-name="' + p.name + '" data-price="' + p.price + '" data-img="' + p.img + '"><i class="bi bi-cart-plus" aria-hidden="true"></i> Add to Cart</button></div>' +
    '<div class="ptot">Total <b>' + money(p.price) + '</b></div></div></div></article></div>';  // live total = price x weight x quantity
}
/* renderProducts(list, container, mode): the one function that draws cards */
function renderProducts(list, box, mode) { box.innerHTML = list.map(function (p) { return cardHTML(p, mode); }).join(''); $$('.pcard', box).forEach(function (c) { c.parentNode.classList.add('reveal', 'in'); }); }
window.renderProducts = renderProducts;

/* ---- 2. MINI CARD (order-page quick add + "Popular today" in the empty cart) ---- */
function miniHTML(p, cols) {
  return '<div class="' + cols + '"><div class="qa"><img src="' + p.img + '" alt="' + p.name + '" loading="lazy" onerror="' + FALLBACK + '"><b>' + p.name + '</b><small>' + money(p.price) + '/kg</small>' +
    '<button class="add" data-name="' + p.name + '" data-price="' + p.price + '" data-img="' + p.img + '">+ Add 1kg</button></div></div>';
}
P.renderPopular = function (box) { if (box) box.innerHTML = P.products.filter(function (p) { return p.popular; }).slice(0, 3).map(function (p) { return miniHTML(p, 'col-4'); }).join(''); };

/* ---- 3. FILL THE CONTAINERS ---- */
var g = $('#grid');       if (g) renderProducts(P.products.filter(function (p) { return p.featured; }).slice(0, 8), g, 'home');   // home: 8 featured
var pg = $('#productGrid'); if (pg) renderProducts(P.products, pg, 'shop');                                                     // products: everything
var qg = $('#quickGrid'); if (qg) qg.innerHTML = ['fresh-beef', 'fresh-mutton', 'mutton-mince', 'mutton-boneless'].map(function (id) { return miniHTML(P.byId(id), 'col-6 col-md-3'); }).join('');
$$('[data-cat-count]').forEach(function (el) { var k = el.dataset.catCount, n = P.products.filter(function (p) { return p.cats.indexOf(k) > -1; }).length; el.textContent = n + ' cuts'; }); // category card counts

/* ---- 4. DEAL BUNDLES (home) - prices calculated from the master list ---- */
var dg = $('#dealGrid');
if (dg) dg.innerHTML = P.deals.map(function (d) {
  var x = P.dealPrice(d);
  return '<div class="col-md-6 col-lg-4"><article class="dealc"><div class="di"><img src="' + d.img + '" alt="' + d.name + '" loading="lazy" onerror="' + FALLBACK + '"><span class="lim">LIMITED OFFER</span></div>' +
    '<div class="db"><h3>' + d.name + '</h3><p class="text-white-50 small mb-2">' + d.desc + '</p><div><span class="nw">' + money(x.price) + '</span><span class="od">' + money(x.old) + '</span></div><span class="sv align-self-start">Save ' + money(x.save) + '</span>' +
    '<div class="cd"><div class="cd-t">OFFER ENDS IN</div><div class="countdown"><span><b data-u="h">00</b><small>Hours</small></span><i>:</i><span><b data-u="m">00</b><small>Minutes</small></span><i>:</i><span><b data-u="s">00</b><small>Seconds</small></span></div></div>' +
    '<button class="btn btn-gold mt-auto add" data-name="' + d.name + '" data-price="' + x.price + '" data-img="' + d.img + '" data-unit="pack">Get Deal</button></div></article></div>';
}).join('');

/* ---- 5. DEAL OF THE DAY POPUP (home) ---- */
var ds = $('#dealSlides');
if (ds) {
  ds.innerHTML = P.dayDeals.map(function (d, i) {
    var x = P.dayPrice(d);
    return '<div class="carousel-item' + (i ? '' : ' active') + '"><div class="deal" style="background-image:url(\'' + x.p.img + '\')"><div class="deal-body"><span class="dbadge">DEAL OF THE DAY &bull; ' + d.off + '% OFF</span><h3>' + x.p.name + '</h3><p>' + x.p.desc + '</p>' +
      '<div class="dprice"><b>' + money(x.price) + '<small class="fs-6">/kg</small></b><s>' + money(x.old) + '</s></div><div class="dsave">You save ' + money(x.save) + ' per kg</div>' +
      '<a href="order.html?product=' + encodeURIComponent(x.p.name) + '&price=' + x.price + '&img=' + encodeURIComponent(x.p.img) + '" class="btn btn-gold">ORDER THIS DEAL <i class="bi bi-arrow-right" aria-hidden="true"></i></a> ' +
      '<a data-wa data-msg="Hello, I want this deal: ' + x.p.name + ' (' + money(x.price) + '/kg)" target="_blank" class="btn btn-wa"><i class="bi bi-whatsapp" aria-hidden="true"></i> Order on WhatsApp</a></div></div></div>';
  }).join('');
  $('#dealInd').innerHTML = P.dayDeals.map(function (d, i) { return '<button type="button" data-bs-target="#dealCar" data-bs-slide-to="' + i + '"' + (i ? '' : ' class="active" aria-current="true"') + ' aria-label="Deal ' + (i + 1) + '"></button>'; }).join('');
}
})(window.PSH);

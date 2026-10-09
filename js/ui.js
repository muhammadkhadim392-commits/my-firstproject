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

/* ---- 2b. SEARCH SUGGESTIONS: a dropdown under a search box (Arrow keys, Enter, Esc, mouse) ----
   Type "b" -> beef products appear first. onPick(product) decides what a click does. */
P.attachSuggest = function (input, onPick) {
  var box = document.createElement('div'); box.className = 'sug'; box.hidden = true; box.setAttribute('role', 'listbox');
  input.parentNode.appendChild(box); input.setAttribute('autocomplete', 'off');
  var items = [], act = -1;
  function mark() { $$('.sug-i', box).forEach(function (b, i) { b.classList.toggle('act', i === act); }); }
  function pick(p) { box.hidden = true; onPick(p); }
  function draw() {
    var q = input.value.trim(); if (!q) { box.hidden = true; return; }
    items = P.products.map(function (p) { return { p: p, s: P.matchScore(p, q) }; }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 6);
    box.innerHTML = items.length ? items.map(function (x, i) {
      return '<button type="button" class="sug-i" role="option" data-i="' + i + '"><img src="' + x.p.img + '" alt="" loading="lazy"><span><b>' + x.p.name + '</b><small>' + x.p.cats[0] + ' \u00b7 ' + x.p.sub + '</small></span><em>' + P.money(x.p.price) + '/kg</em></button>';
    }).join('') : '<div class="sug-none">No matching products</div>';
    box.hidden = false; act = -1;
  }
  input.addEventListener('input', draw); input.addEventListener('focus', draw);
  input.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(items.length - 1, act + 1); mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); mark(); }
    else if (e.key === 'Enter' && act > -1) { e.preventDefault(); pick(items[act].p); }       // choose the highlighted suggestion
    else if (e.key === 'Escape') box.hidden = true;
  });
  box.addEventListener('mousedown', function (e) { var b = e.target.closest('.sug-i'); if (b) { e.preventDefault(); pick(items[+b.dataset.i].p); } });
  document.addEventListener('click', function (e) { if (!input.parentNode.contains(e.target)) box.hidden = true; });
};

/* ---- 3. NAVBAR: gold underline on current page + universal search ---- */
$$('.navbar .nav-link').forEach(function (a) {
  a.classList.toggle('active', (a.getAttribute('href') || '').toLowerCase() === P.page); // auto-mark the current page
});
var ns = $('#navSearch');
if (ns) P.attachSuggest(ns, function (p) { location.href = 'products.html?search=' + encodeURIComponent(p.name); }); // suggestions in the navbar
if (ns) ns.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter' || e.defaultPrevented) return;                                  // react only to Enter
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

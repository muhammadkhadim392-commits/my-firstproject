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
  window.countdown = function () {
    var now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);                  // next midnight
    var s = Math.floor((end - now) / 1000), h = Math.floor(s / 3600), mi = Math.floor(s % 3600 / 60), se = s % 60;
    cds.forEach(function (c) { c.textContent = pad(h) + ':' + pad(mi) + ':' + pad(se); });
  };
  countdown(); setInterval(countdown, 1000);                                            // starts immediately - never shows --:--:--
}
})(window.PSH);

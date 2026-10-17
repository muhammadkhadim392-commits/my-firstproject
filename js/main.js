/* ##########################################################################
   js/main.js  -  PAGE EXTRAS (load LAST): WhatsApp links, contact form,
   WhatsApp links and contact form
   ########################################################################## */
(function (P) {
var $ = P.$, $$ = P.$$;

/* ---- 1. Every <a data-wa> gets the WhatsApp number from config.js (+ optional data-msg text) ---- */
$$('[data-wa]').forEach(function (a) { a.href = P.waLink(a.dataset.msg || 'Hello Premium Meat'); });

/* ---- 1b. External links open safely ---- */
$$('a[target="_blank"]').forEach(function (a) { a.rel = 'noopener noreferrer'; });

/* ---- 2. Contact form: validate, then send to WhatsApp ---- */
var cf = $('#contactForm');
if (cf) cf.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!cf.checkValidity()) { cf.classList.add('was-validated'); var bad = cf.querySelector(':invalid'); if (bad) bad.focus(); return; } // show errors
  var v = function (i) { return $('#' + i).value; };
  window.open(P.waLink('*Website Enquiry*\nName: ' + v('name') + '\nEmail: ' + v('email') + '\nPhone: ' + v('phone') + '\nSubject: ' + v('subject') + '\n\n' + v('message')), '_blank');
  P.toast('Opening WhatsApp\u2026'); cf.reset(); cf.classList.remove('was-validated');
});

/* ---- 3. Offers stay available in the page; never interrupt a first visit with a popup. ---- */

})(window.PSH);

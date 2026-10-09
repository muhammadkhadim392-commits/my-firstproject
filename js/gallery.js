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

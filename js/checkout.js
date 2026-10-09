/* ##########################################################################
   js/checkout.js  -  ORDER PAGE: saved customer details, validation (with error
   messages), progress stepper, professional WhatsApp order, success confirmation
   ########################################################################## */
(function (P) {
var $ = P.$, f = $('#orderForm'); if (!f) return;                                        // only runs on order.html
var ids = ['custName', 'custPhone', 'custCity', 'custArea', 'custAddress', 'custDate', 'custSlot', 'custPay'];

/* ---- 1. Customer details are remembered in localStorage (guest checkout - no account needed) ---- */
function load() { var s = {}; try { s = JSON.parse(localStorage.getItem('customer') || '{}'); } catch (e) {} ids.forEach(function (i) { var el = $('#' + i); if (el && s[i]) el.value = s[i]; }); }
function store() { var o = {}; ids.forEach(function (i) { var el = $('#' + i); if (el) o[i] = el.value; }); try { localStorage.setItem('customer', JSON.stringify(o)); } catch (e) {} return o; }
load();

/* ---- 2. Pakistani mobile validation: 11 digits starting with 03 ---- */
var ph = $('#custPhone'), re = /^03[0-9]{9}$/;
function checkPhone() {
  ph.value = ph.value.replace(/\D/g, '').slice(0, 11);                                   // digits only, max 11
  var ok = re.test(ph.value);
  ph.classList.toggle('is-valid', ok); ph.classList.toggle('is-invalid', !ok && ph.value.length > 0); // green / red
  ph.setCustomValidity(ok ? '' : 'Please enter a valid Pakistani mobile number.');
}
ph.addEventListener('input', checkPhone); checkPhone();
var dt = $('#custDate'); if (dt) dt.min = new Date().toISOString().split('T')[0];        // no past dates

/* ---- 3. Progress stepper: (1) Cart -> (2) Delivery -> (3) Confirm ---- */
var done3 = false;
function stepper() {
  var s1 = P.cart.get().length > 0, s2 = s1 && f.checkValidity();
  [['#stp1', s1, !s1], ['#stp2', s2, s1 && !s2], ['#stp3', done3, s2 && !done3]].forEach(function (x) { // [element, done?, current?]
    var el = $(x[0]); el.classList.toggle('done', x[1]); el.classList.toggle('now', x[2]);
  });
}
f.addEventListener('input', function () { store(); stepper(); });
f.addEventListener('change', function () { store(); stepper(); });
document.addEventListener('cart:changed', stepper); stepper();

/* ---- 4. Place order: validate -> WhatsApp message -> success message ---- */
window.checkoutViaWhatsApp = function (event) {
  event.preventDefault();
  var cart = P.cart.get();
  if (!cart.length) { P.toast('Your cart is empty - add items first'); return; }         // error: empty cart
  if (!f.checkValidity()) {                                                              // errors: show messages on every wrong field
    f.classList.add('was-validated');
    var bad = f.querySelector(':invalid'); if (bad) { bad.focus(); bad.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return;
  }
  var c = store(), t = P.cart.totals(cart), ref = 'PSH-' + Date.now().toString().slice(-6), m = P.money;
  var text = '*Premium Slaughter House*\n*New Order* (Ref: ' + ref + ')\n\n' +
    '*Customer:*\n' + c.custName + '\n\n*Phone:*\n' + c.custPhone + '\n\n*Order:*\n';
  cart.forEach(function (i) { text += '\u2022 ' + i.name + ' \u2014 ' + P.fmtKg(i.qty, i.unit) + ' (' + m(i.price * i.qty) + ')\n'; });
  text += '\n*Subtotal:* ' + m(t.sub) + '\n*Delivery:* ' + (t.del ? m(t.del) : 'FREE') + '\n*Total:* ' + m(t.grand) +
    '\n\n*Delivery:*\n' + c.custCity + '\n' + c.custArea + '\n' + c.custAddress +
    '\n\n*Date:* ' + c.custDate + '\n*Preferred time:* ' + c.custSlot + '\n*Payment:* ' + c.custPay;
  window.open(P.waLink(text), '_blank');                                                 // open WhatsApp with the receipt
  $('#okRef').textContent = ref; $('#okTotal').textContent = m(t.grand); $('#okName').textContent = c.custName;
  new bootstrap.Modal($('#successModal')).show();                                        // success state
  done3 = true; P.cart.save([]); P.renderCart(); f.classList.remove('was-validated'); stepper(); done3 = false; // empty cart, keep customer details
};
})(window.PSH);

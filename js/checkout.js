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

/* ---- 4. validateForm(): true only when the cart is not empty AND every field is valid (shows messages otherwise) ---- */
function validateForm() {
  if (!P.cart.get().length) { P.toast('Your cart is empty - add items first'); return false; }   // error: empty cart
  if (!f.checkValidity()) {
    f.classList.add('was-validated');                                                      // green / red feedback on every field
    var bad = f.querySelector(':invalid'); if (bad) { bad.focus(); bad.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return false;
  }
  return true;
}
/* ---- 5. generateOrder(): builds the professional WhatsApp text from the cart + customer details ---- */
function generateOrder() {
  var cart = P.cart.get(), c = store(), t = P.cart.totals(cart), ref = 'PSH-' + Date.now().toString().slice(-6), m = P.money;
  var text = '*Premium Slaughter House*\n*New Order* (Ref: ' + ref + ')\n\n*Customer:*\n' + c.custName + '\n\n*Phone:*\n' + c.custPhone + '\n\n*Order:*\n';
  cart.forEach(function (i) { text += '\u2022 ' + i.name + ' \u2014 ' + P.fmtKg(i.qty, i.unit) + ' (' + m(i.price * i.qty) + ')\n'; });
  text += '\n*Subtotal:* ' + m(t.sub) + '\n*Delivery:* ' + (t.del ? m(t.del) : 'FREE') + '\n*Total:* ' + m(t.grand) +
    '\n\n*Delivery:*\n' + c.custCity + '\n' + c.custArea + '\n' + c.custAddress + '\n\n*Date:* ' + c.custDate + '\n*Preferred time:* ' + c.custSlot + '\n*Payment:* ' + c.custPay;
  return { text: text, ref: ref, total: t.grand, name: c.custName };
}
/* ---- 6. sendToWhatsApp(text): opens WhatsApp with the message ---- */
function sendToWhatsApp(text) { window.open(P.waLink(text), '_blank'); }
window.validateForm = validateForm; window.generateOrder = generateOrder; window.sendToWhatsApp = sendToWhatsApp;

/* ---- 7. The form's submit handler: validate -> generate -> send -> success message -> clear cart ---- */
window.checkoutViaWhatsApp = function (event) {
  event.preventDefault();
  if (!validateForm()) return;
  var o = generateOrder(); sendToWhatsApp(o.text);
  $('#okRef').textContent = o.ref; $('#okTotal').textContent = P.money(o.total); $('#okName').textContent = o.name;
  new bootstrap.Modal($('#successModal')).show();                                          // success state
  done3 = true; P.cart.save([]); P.renderCart(); f.classList.remove('was-validated'); stepper(); done3 = false; // empty cart, keep customer details
};
})(window.PSH);

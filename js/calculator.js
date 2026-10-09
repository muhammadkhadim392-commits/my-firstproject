/* ##########################################################################
   js/calculator.js  -  SERVICES PAGE: interactive B2B bulk calculator
   Meat -> KG (number / slider / chips) -> itemised quote -> WhatsApp
   ########################################################################## */
(function (P) {
var $ = P.$, $$ = P.$$, money = P.money, b2 = $('#b2bForm'); if (!b2) return;
var TIERS = [{ min: 500, d: .12 }, { min: 250, d: .09 }, { min: 100, d: .06 }, { min: 50, d: .03 }]; // volume discount tiers (same as the table on the page)
function calc() {
  var base = +$('#b2bType').value, kg = Math.max(0, +$('#b2bKg').value || 0);
  var tier = TIERS.filter(function (t) { return kg >= t.min; })[0], d = tier ? tier.d : 0;            // highest tier reached
  var next = TIERS.slice().reverse().filter(function (t) { return t.min > kg; })[0];                  // next tier to unlock
  var sub = base * kg, off = sub * d, tot = sub - off, eff = kg ? tot / kg : base;
  $('#b2bOut').innerHTML =                                                                            // itemised receipt
    '<div><span>Base price</span><b>' + money(base) + ' / kg</b></div><div><span>Quantity</span><b>' + kg + ' kg</b></div>' +
    '<div><span>Subtotal</span><b>' + money(sub) + '</b></div><div class="disc"><span>Bulk discount (' + Math.round(d * 100) + '%)</span><b>- ' + money(off) + '</b></div>' +
    '<div class="tot"><span>Total</span><b>' + money(tot) + '</b></div><div><span>Effective price / kg</span><b>' + money(eff) + '</b></div>';
  var msg = $('#b2bMsg');
  if (kg < 10) { msg.className = 'calc-msg'; msg.textContent = '\u26a0 Minimum bulk order is 10 kg.'; }                       // error state
  else if (d) { msg.className = 'calc-msg win'; msg.textContent = '\u2713 You qualify for ' + Math.round(d * 100) + '% bulk discount' + (next ? ' \u2013 add ' + (next.min - kg) + ' kg more to reach ' + Math.round(next.d * 100) + '%' : ' (our best rate!)'); }
  else { msg.className = 'calc-msg'; msg.textContent = 'Order ' + (50 - kg) + ' kg more to unlock a 3% bulk discount.'; }
  $('#b2bBar').style.width = Math.min(100, next ? kg / next.min * 100 : 100) + '%';                    // progress to next tier
  $('#b2bRange').value = Math.min(kg, 1000);                                                          // keep slider in sync
  $('#b2bWa').href = P.waLink('Hello, bulk quote request:\n' + $('#b2bType').selectedOptions[0].text.split(' \u2013')[0] + ' \u2014 ' + kg + ' kg\nDiscount: ' + Math.round(d * 100) + '%\nEffective price/kg: ' + money(eff) + '\nEstimated total: ' + money(tot));
}
$('#b2bRange').addEventListener('input', function () { $('#b2bKg').value = this.value; calc(); });  // slider -> number box
$$('.kgchip').forEach(function (c) { c.onclick = function () { $('#b2bKg').value = c.dataset.kg; calc(); }; }); // quick chips
['input', 'change'].forEach(function (ev) { b2.addEventListener(ev, calc); }); calc();               // live + once at start
})(window.PSH);

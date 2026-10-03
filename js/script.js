/* ##########################################################################
   PREMIUM SLAUGHTER HOUSE - SHARED SCRIPT (all 8 pages)
   Sections: 1 WhatsApp links | 2 Preloader | 3 Scroll effects | 4 Reveal |
   5 Counters | 6 Tilt/magnetic/glow/embers | 7 Toast+wishlist+newsletter |
   8 Announcement ticker | 9 CART (shared) | 10 Home chips | 11 Products
   filter+search | 12 Order page + WhatsApp checkout | 13 B2B calculator |
   14 Gallery filters + lightbox | 15 Contact form | 16 Deal modal |
   17 Live order toast
   Every block only runs if its elements exist, so one file works everywhere.
   ########################################################################## */
/* ====== SET YOUR WHATSAPP NUMBER HERE (country code, no + or spaces) ====== */
var WHATSAPP_NUMBER='923081357658';
/* ========================================================================= */
(function(){
var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};
var money=function(n){return 'Rs '+Math.round(n).toLocaleString()};
/* ---- WhatsApp links: every <a data-wa> uses the number above (+ optional data-msg) ---- */
$$('[data-wa]').forEach(function(a){a.href='https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(a.dataset.msg||'Hello Premium Slaughter House')});
/* ---- Preloader (also auto-hidden by inline CSS failsafe) ---- */
addEventListener('load',function(){setTimeout(function(){var l=$('#loader');l&&l.classList.add('done')},500)});
/* ---- Scroll: progress bar, sticky navbar, back-to-top, parallax ---- */
var bar=$('#progress'),nav=$('.navbar'),topBtn=$('#toTop'),par=$$('[data-speed]');
function onScroll(){var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
bar.style.width=(y/h*100)+'%';nav.classList.toggle('scrolled',y>40);topBtn.classList.toggle('show',y>500);
par.forEach(function(e){e.style.transform='translateY('+(y*e.dataset.speed)+'px)'})}
addEventListener('scroll',onScroll,{passive:true});onScroll();
topBtn.onclick=function(){scrollTo({top:0,behavior:'smooth'})};
/* ---- Reveal-on-scroll with stagger ---- */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
$$('.reveal').forEach(function(e){e.style.transitionDelay=(e.dataset.d||0)+'ms';io.observe(e)});
/* ---- Animated counters (.counter-val[data-target] and [data-count]) ---- */
function animateCounters(el){var end=+(el.dataset.target||el.dataset.count),suf=el.dataset.suf||'',t0=null;
if(!end){el.textContent='0'+suf;return}
(function f(t){t0=t0||t;var p=Math.min((t-t0)/1800,1);el.textContent=Math.floor((1-Math.pow(1-p,3))*end).toLocaleString()+suf;if(p<1)requestAnimationFrame(f)})(performance.now())}
window.animateCounters=animateCounters;
var co=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){co.unobserve(e.target);animateCounters(e.target)}})},{threshold:.5});
$$('.counter-val,[data-count]').forEach(function(e){co.observe(e)});
/* ---- 3D tilt, magnetic buttons, cursor glow, embers ---- */
$$('.tilt').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(800px) rotateY('+x*10+'deg) rotateX('+-y*10+'deg) translateY(-6px)'});c.addEventListener('mouseleave',function(){c.style.transform=''})});
$$('.magnetic').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+(e.clientX-r.left-r.width/2)*.25+'px,'+(e.clientY-r.top-r.height/2)*.35+'px)'});b.addEventListener('mouseleave',function(){b.style.transform=''})});
var g=$('#glow');if(g&&matchMedia('(hover:hover)').matches){addEventListener('mousemove',function(e){g.style.opacity=1;g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'})}
var h=$('.hero,.phero');if(h){for(var i=0;i<22;i++){var s=document.createElement('i');s.className='ember';s.style.left=Math.random()*100+'%';s.style.animationDuration=(6+Math.random()*8)+'s';s.style.animationDelay=(Math.random()*8)+'s';h.appendChild(s)}}
/* ---- Toast + wishlist + newsletter ---- */
var tt;function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('show')},2200)}
$$('.heart').forEach(function(b){b.onclick=function(){b.classList.toggle('on');b.innerHTML=b.classList.contains('on')?'<i class="bi bi-heart-fill"></i>':'<i class="bi bi-heart"></i>'}});
var nf=$('#newsForm');if(nf)nf.onsubmit=function(e){e.preventDefault();toast('Thank you for subscribing!');nf.reset()};
/* ---- Announcement bar: rotating live-order ticker ---- */
var tk=$('#ticker');if(tk){var msgs=['Fresh halal meat delivered daily','Ahmed from DHA just ordered 3kg Beef','Usman from Raiwind just ordered 2kg Mutton','Free delivery on orders above Rs 5,000','Bilal from Model Town ordered a Beef Combo'],ti=0;
setInterval(function(){tk.style.opacity=0;setTimeout(function(){ti=(ti+1)%msgs.length;tk.textContent=msgs[ti];tk.style.opacity=1},400)},4000)}
/* ---- CART: shared by ALL pages --------------------------------------------
   Stored in localStorage key 'cart' = [{name,price,qty,img}].
   Fallback: a copy is also kept in window.name so the cart survives page
   switches even when pages are opened as local files (file://) or storage is blocked. */
function getCart(){var s=null;try{s=localStorage.getItem('cart')}catch(e){}
if(!s&&window.name.indexOf('CART:')===0)s=window.name.slice(5);
try{return s?JSON.parse(s):[]}catch(e){return[]}}
function saveCart(c){var s=JSON.stringify(c);try{localStorage.setItem('cart',s)}catch(e){}window.name='CART:'+s;badge(true)}
function badge(bump){var kg=getCart().reduce(function(a,i){return a+i.qty},0),b=$('.cart span');if(b){b.textContent=kg;if(bump){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}}}
function addToCart(name,price,qty,img){var c=getCart(),f=c.filter(function(i){return i.name===name})[0];if(f)f.qty+=qty;else c.push({name:name,price:+price,qty:qty,img:img||''});saveCart(c);toast('\u2713 '+qty+'kg '+name+' added to cart')}
badge(false);
document.addEventListener('click',function(e){
var a=e.target.closest('.add');if(a){var card=a.closest('.pcard'),q=card&&$('.qv',card)?+$('.qv',card).textContent:1;addToCart(a.dataset.name,a.dataset.price,q,a.dataset.img);if(a.closest('.qa')||$('#cartList'))renderCart();return}
var m=e.target.closest('.qm,.qp');if(m){var v=$('.qv',m.parentNode),n=+v.textContent+(m.classList.contains('qp')?1:-1);v.textContent=Math.max(1,Math.min(100,n))}});
/* ---- Index: category chips ---- */
$$('.chip[data-f]').forEach(function(c){c.onclick=function(){$$('.chip[data-f]').forEach(function(x){x.classList.remove('on')});c.classList.add('on');var f=c.dataset.f;
$$('.pitem').forEach(function(p){var show=f==='all'||(' '+p.dataset.c+' ').indexOf(' '+f+' ')>-1;p.classList.toggle('hide',!show);if(show){p.classList.remove('in');void p.offsetWidth;p.classList.add('in')}})}});
/* ---- Products page: category filter + live search (combined) ---- */
var curCat='all';
function applyProducts(){var q=($('#searchInput')||{value:''}).value.toLowerCase().trim(),n=0;
$$('.product-card-wrapper').forEach(function(card){var ok=(curCat==='all'||card.getAttribute('data-category')===curCat)&&card.querySelector('.card-title').innerText.toLowerCase().indexOf(q)>-1;
card.style.display=ok?'block':'none';if(ok){n++;card.classList.add('in');card.style.animation='none';void card.offsetWidth;card.style.animation='fadeInUp 0.4s ease forwards'}});
var nr=$('#noRes');if(nr)nr.style.display=n?'none':'block'}
window.filterProducts=function(category,event){$$('.filter-btn').forEach(function(b){b.classList.remove('active','on')});if(event){event.currentTarget.classList.add('active','on')}curCat=category;applyProducts()};
window.searchProducts=applyProducts;
/* ---- Order page: live cart, totals, delete, WhatsApp checkout ---- */
function totals(c){var sub=c.reduce(function(a,i){return a+i.price*i.qty},0),del=(sub>5000||!sub)?0:200;return{sub:sub,del:del,grand:sub+del}}
function renderCart(){var box=$('#cartList');if(!box)return;var c=getCart();
box.innerHTML=c.length?c.map(function(i,k){return '<div class="citem"><img src="'+i.img+'" alt="" onerror="this.src=\'images/premium-beef.jpg\'"><div class="flex-fill"><div class="nm">'+i.name+'</div><small class="text-muted">'+money(i.price)+' / kg</small></div><div class="qty"><button class="cq" data-k="'+k+'" data-d="-1">&minus;</button><span class="qv">'+i.qty+'</span><span class="qk">kg</span><button class="cq" data-k="'+k+'" data-d="1">+</button></div><b style="min-width:84px;text-align:right">'+money(i.price*i.qty)+'</b><button class="del" data-k="'+k+'" aria-label="Remove"><i class="bi bi-trash3"></i></button></div>'}).join(''):'<div class="empty"><i class="bi bi-cart-x"></i><p class="mt-2">Your cart is empty.</p><a href="products.html" class="btn btn-gold btn-sm">Browse Products</a></div>';
var t=totals(c);$('#tSub').textContent=money(t.sub);$('#tDel').textContent=t.del?money(t.del):'FREE';$('#tGrand').textContent=money(t.grand);$('#cartCount').textContent=c.reduce(function(a,i){return a+i.qty},0)+' kg'}
window.renderCart=renderCart;
document.addEventListener('click',function(e){var q=e.target.closest('.cq'),d=e.target.closest('.del');var c=getCart();
if(q){var it=c[+q.dataset.k];it.qty=Math.max(1,it.qty+ +q.dataset.d);saveCart(c);renderCart()}
if(d){c.splice(+d.dataset.k,1);saveCart(c);renderCart()}});
if($('#cartList')){var p=new URLSearchParams(location.search);if(p.get('product')){var c0=getCart();if(!c0.some(function(i){return i.name===p.get('product')})){c0.push({name:p.get('product'),price:+p.get('price')||0,qty:1,img:''});saveCart(c0)}history.replaceState(null,'',location.pathname)}
var dt=$('#custDate');if(dt)dt.min=new Date().toISOString().split('T')[0];renderCart()}
window.checkoutViaWhatsApp=function(event){event.preventDefault();var cart=getCart();if(!cart.length){alert('Your cart is empty!');return}
var v=function(id){return $('#'+id).value},t=totals(cart);
var text='*NEW ORDER - PREMIUM SLAUGHTER HOUSE*\n\n*Name:* '+v('custName')+'\n*Phone:* '+v('custPhone')+'\n*Address:* '+v('custAddress')+', '+v('custArea')+', '+v('custCity')+'\n*Delivery:* '+v('custDate')+' ('+v('custSlot')+')\n*Payment:* '+v('custPay')+'\n\n*Items Ordered:*\n';
cart.forEach(function(it,i){text+=(i+1)+'. '+it.name+' ('+it.qty+'kg) - Rs '+(it.price*it.qty)+'\n'});
text+='\n*Subtotal:* Rs '+t.sub+'\n*Delivery Fee:* Rs '+t.del+'\n*Grand Total:* Rs '+t.grand;
window.open('https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(text),'_blank')};
/* ---- Services: B2B bulk rate calculator ---- */
var b2=$('#b2bForm');if(b2){function calc(){var base=+$('#b2bType').value,kg=Math.max(0,+$('#b2bKg').value||0),d=kg>=500?.12:kg>=250?.09:kg>=100?.06:kg>=50?.03:0,rate=base*(1-d),tot=rate*kg;
$('#b2bOut').innerHTML='<div><small>Rate / kg</small><b>'+money(rate)+'</b></div><div><small>Discount</small><b>'+Math.round(d*100)+'%</b></div><div><small>Estimated Total</small><b>'+money(tot)+'</b></div>';
$('#b2bWa').href='https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent('Hello, B2B quote request: '+$('#b2bType').selectedOptions[0].text.split(' –')[0]+', '+kg+' kg, est. '+money(tot)+' ('+money(rate)+'/kg).')}
['input','change'].forEach(function(ev){b2.addEventListener(ev,calc)});calc()}
/* ---- Gallery: filters + lightbox ---- */
$$('[data-gf]').forEach(function(b){b.onclick=function(){$$('[data-gf]').forEach(function(x){x.classList.remove('on')});b.classList.add('on');
$$('.gal-item').forEach(function(i){var s=b.dataset.gf==='all'||i.dataset.cat===b.dataset.gf;i.classList.toggle('hide',!s);if(s){i.classList.add('in')}})}});
window.openLightbox=function(src,cap){$('#modalImage').src=src;$('#modalCaption').innerText=cap;new bootstrap.Modal($('#galleryModal')).show()};
/* ---- Contact form -> WhatsApp ---- */
var cf=$('#contactForm');if(cf)cf.addEventListener('submit',function(e){e.preventDefault();if(!cf.checkValidity()){cf.classList.add('was-validated');return}
var v=function(i){return $('#'+i).value};window.open('https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent('*Website Enquiry*\nName: '+v('name')+'\nEmail: '+v('email')+'\nPhone: '+v('phone')+'\nSubject: '+v('subject')+'\n\n'+v('message')),'_blank');toast('Opening WhatsApp…');cf.reset();cf.classList.remove('was-validated')});
/* ---- Home: Deal of the Day modal (5s after FIRST visit; button reopens it) ---- */
var dm=$('#dealModal');if(dm){var m=new bootstrap.Modal(dm),fab=$('#dealFab'),car=$('#dealCar'),seen=false;try{seen=localStorage.getItem('dealSeen')}catch(e){}
dm.addEventListener('shown.bs.modal',function(){bootstrap.Carousel.getOrCreateInstance(car).cycle();fab.style.display='none'});
dm.addEventListener('hidden.bs.modal',function(){bootstrap.Carousel.getOrCreateInstance(car).pause();fab.style.display='block'});
fab.onclick=function(){m.show()};
if(!seen){setTimeout(function(){m.show();try{localStorage.setItem('dealSeen','1')}catch(e){}},5000)}else{fab.style.display='block'}}
/* ---- Home: live order notification toast loop (every 12s) ---- */
var le=$('#liveToast');if(le){var sampleOrders=['Saad from Johar Town just ordered 2kg Mutton Boneless!','Ahmed from DHA Lahore ordered 3kg Premium Beef','Usman from Raiwind ordered 2kg Fresh Mutton','Bilal from Model Town ordered Beef Combo Pack'];
window.showOrderToast=function(){$('#toastBody').innerText=sampleOrders[Math.floor(Math.random()*sampleOrders.length)];bootstrap.Toast.getOrCreateInstance(le).show()};
setTimeout(showOrderToast,7000);setInterval(showOrderToast,12000)}
})();
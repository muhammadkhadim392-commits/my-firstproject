/* Premium Slaughter House – advanced UI animations */
/* ====== SET YOUR WHATSAPP NUMBER HERE (country code, no + or spaces) ====== */
var WHATSAPP_NUMBER='923081357658';
/* ========================================================================= */
(function(){
var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};
// whatsapp links: every <a data-wa> uses the number above (+ optional data-msg)
[].slice.call(document.querySelectorAll('[data-wa]')).forEach(function(a){a.href='https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(a.dataset.msg||'Hello Premium Slaughter House')});
// preloader
window.addEventListener('load',function(){setTimeout(function(){var l=$('#loader');l&&l.classList.add('done')},500)});
setTimeout(function(){var l=$('#loader');l&&l.classList.add('done')},3000);
// scroll: progress bar, navbar, back-to-top, parallax
var bar=$('#progress'),nav=$('.navbar'),top=$('#toTop'),par=$$('[data-speed]');
function onScroll(){var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
bar.style.width=(y/h*100)+'%';nav.classList.toggle('scrolled',y>40);top.classList.toggle('show',y>500);
par.forEach(function(e){e.style.transform='translateY('+(y*e.dataset.speed)+'px)'})}
addEventListener('scroll',onScroll,{passive:true});onScroll();
top.onclick=function(){scrollTo({top:0,behavior:'smooth'})};
// reveal on scroll (with stagger)
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
$$('.reveal').forEach(function(e,i){e.style.transitionDelay=(e.dataset.d||0)+'ms';io.observe(e)});
// counters
var co=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);
var el=e.target,end=+el.dataset.count,t0=null;(function f(t){t0=t0||t;var p=Math.min((t-t0)/1800,1);
el.textContent=Math.floor((1-Math.pow(1-p,3))*end).toLocaleString()+(el.dataset.suf||'');if(p<1)requestAnimationFrame(f)})(performance.now())})},{threshold:.6});
$$('[data-count]').forEach(function(e){co.observe(e)});
// 3D tilt cards
$$('.tilt').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
c.style.transform='perspective(800px) rotateY('+x*10+'deg) rotateX('+-y*10+'deg) translateY(-6px)'});
c.addEventListener('mouseleave',function(){c.style.transform=''})});
// magnetic buttons
$$('.magnetic').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();
b.style.transform='translate('+(e.clientX-r.left-r.width/2)*.25+'px,'+(e.clientY-r.top-r.height/2)*.35+'px)'});
b.addEventListener('mouseleave',function(){b.style.transform=''})});
// cursor glow
var g=$('#glow');if(g&&matchMedia('(hover:hover)').matches){addEventListener('mousemove',function(e){g.style.opacity=1;g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'})}
// floating embers in hero
var h=$('.hero,.phero');if(h){for(var i=0;i<22;i++){var s=document.createElement('i');s.className='ember';
s.style.left=Math.random()*100+'%';s.style.animationDuration=(6+Math.random()*8)+'s';s.style.animationDelay=(Math.random()*8)+'s';h.appendChild(s)}}
// product filter
$$('.chip').forEach(function(c){c.onclick=function(){$$('.chip').forEach(function(x){x.classList.remove('on')});c.classList.add('on');
var f=c.dataset.f;$$('.pitem').forEach(function(p){var show=f==='all'||p.dataset.c===f;p.classList.toggle('hide',!show);
if(show){p.classList.remove('in');void p.offsetWidth;p.classList.add('in')}})}});
// toast + cart + wishlist
var tt;function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('show')},2200)}
var n=0,cn=$('.cart span');
$$('.add').forEach(function(b){b.onclick=function(){n++;cn.textContent=n;cn.classList.remove('bump');void cn.offsetWidth;cn.classList.add('bump');toast('✓ '+b.dataset.name+' added to cart')}});
$$('.heart').forEach(function(b){b.onclick=function(){b.classList.toggle('on');b.innerHTML=b.classList.contains('on')?'<i class="bi bi-heart-fill"></i>':'<i class="bi bi-heart"></i>'}});
var nf=$('#newsForm');if(nf)nf.onsubmit=function(e){e.preventDefault();toast('Thank you for subscribing!');nf.reset()};
// deal popup (home only)
var dm=$('#dealModal');if(dm){var m=new bootstrap.Modal(dm),fab=$('#dealFab'),car=$('#dealCar');
dm.addEventListener('shown.bs.modal',function(){bootstrap.Carousel.getOrCreateInstance(car).cycle();fab.style.display='none'});
dm.addEventListener('hidden.bs.modal',function(){bootstrap.Carousel.getOrCreateInstance(car).pause();fab.style.display='block'});
fab.onclick=function(){m.show()};addEventListener('load',function(){setTimeout(function(){m.show()},1800)})}
})();
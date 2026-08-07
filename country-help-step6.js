
(function(){
 function n(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
 function score(el,terms){const t=n(el.textContent), a=terms.map(n).filter(Boolean);let s=0;for(const q of a){if(t.includes(q))s+=q.split(' ').length+2}return s}
 document.addEventListener('click',function(e){const a=e.target.closest('.country-help-step6 .ch6-route');if(!a)return;const terms=(a.dataset.terms||'').split('|');const candidates=[...document.querySelectorAll('h2,h3,h4,summary,.hub-title,.card-title')].filter(x=>!x.closest('.country-help-step6'));let best=null,bs=0;for(const el of candidates){const s=score(el,terms);if(s>bs){bs=s;best=el}}if(best&&bs>0){e.preventDefault();const d=best.closest('details');if(d)d.open=true;const target=best.closest('[id]')||best;document.querySelectorAll('.ch6-found').forEach(x=>x.classList.remove('ch6-found'));target.classList.add('ch6-found');target.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>target.classList.remove('ch6-found'),2500)}});
})();

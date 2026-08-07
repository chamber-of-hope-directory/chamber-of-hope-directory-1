(function(){
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function toast(msg){const n=document.createElement('div');n.className='coh-toast';n.textContent=msg;document.body.appendChild(n);setTimeout(()=>n.remove(),2600);}
  function currentFile(){return location.pathname.split('/').pop()||'index.html';}
  function saved(){try{return JSON.parse(localStorage.getItem('cohSavedPages')||'[]')}catch(e){return []}}
  function lastResource(){try{return JSON.parse(sessionStorage.getItem('cohLastResource')||'null')}catch(e){return null}}
  function reportHref(extra){
    const x=extra||lastResource()||{};const p=new URLSearchParams();
    p.set('page',x.page||location.href);p.set('title',x.pageTitle||document.title);
    if(x.resource)p.set('resource',x.resource);if(x.resourceUrl)p.set('resource_url',x.resourceUrl);
    if(x.section)p.set('section',x.section);if(x.type)p.set('type',x.type);
    return 'report_problem.html?'+p.toString();
  }
  function saveCurrent(){const items=saved(),url=location.href.split('#')[0];if(items.find(x=>x.url===url)){toast('This page is already in My Help List.');return;}items.unshift({title:document.title,url,added:new Date().toISOString(),note:''});localStorage.setItem('cohSavedPages',JSON.stringify(items.slice(0,75)));toast('Page saved to My Help List.');}
  function quickExit(){try{sessionStorage.clear()}catch(e){}location.replace('https://www.google.com/');}
  function isResourcePage(){const f=currentFile().toLowerCase();return /^state_[a-z]{2}\.html$/.test(f)||/^intl_[a-z0-9_]+\.html$/.test(f)||['usa.html','territories.html','global_helps.html','misc.html','misc_language.html','language_access.html'].includes(f);}
  function cleanHost(host){return String(host||'').toLowerCase().replace(/^www\./,'');}
  function isSearchOrLocator(u){const h=cleanHost(u.hostname),p=(u.pathname+u.search).toLowerCase();if((h==='google.com'||h.endsWith('.google.com'))&&(/\/maps\b|\/search\b|search\?/.test(p)))return true;if(h==='maps.apple.com'||h==='mapquest.com'||h.endsWith('.mapquest.com'))return true;if((h==='bing.com'||h.endsWith('.bing.com'))&&/search|maps/.test(p))return true;if(h==='duckduckgo.com'&&/\?q=/.test(p))return true;if((h==='yelp.com'||h.endsWith('.yelp.com'))&&/search/.test(p))return true;if(h==='findhelp.org'||h.endsWith('.findhelp.org'))return true;return false;}
  function isOfficialPublic(u){const h=cleanHost(u.hostname);if(!h)return false;if(h.endsWith('.gov')||h.includes('.gov.')||h.endsWith('.mil')||h.includes('.mil.'))return true;if(h.includes('.gouv.')||h.includes('.gob.')||h.includes('.go.')||h.includes('.gc.ca'))return true;const exact=new Set(['usa.gov','canada.ca','service-public.fr','service-public.gouv.fr','ameli.fr','nhs.uk','gov.uk','europa.eu','who.int','un.org','unhcr.org','unicef.org','ilo.org','worldbank.org','oecd.org','interpol.int','redcross.org','icrc.org']);if(exact.has(h))return true;return ['.gov.uk','.gc.ca','.gouv.fr','.gob.mx','.gob.es','.go.jp','.go.kr','.gov.au','.govt.nz','.gov.sg','.gov.za','.gov.in','.gov.ph','.gov.br','.gov.tr','.gov.il','.gov.ie','.gov.pt','.gov.gr','.gov.pl','.gov.se','.gov.no','.gov.dk','.gov.fi','.gov.nl','.gov.be','.gov.ch','.gov.tw','.gov.cn','.gov.hk','.gov.ae','.gov.sa','.gov.qa','.gov.bh','.gov.kw','.gov.om','.gov.jo','.gov.lb','.gov.eg','.gov.ma','.gov.ng','.go.ke','.gov.gh','.gov.et','.gov.my','.go.id','.go.th','.gov.vn','.gov.pk','.gov.ar','.gob.cl','.gov.co','.gob.pe','.gob.ec','.gob.pa','.go.cr','.gob.gt','.gob.hn','.gob.sv','.gob.do','.gob.ve','.gub.uy'].some(s=>h.endsWith(s));}
  function excludedExternal(a,u){if(a.closest('#coh-global-tools,#coh-global-footer,nav,header,footer'))return true;const f=currentFile().toLowerCase();if(['give_support.html','advertise.html','sponsorship_policy.html','privacy.html','terms.html','accessibility.html','corrections_policy.html','verification_policy.html','updates.html','report_problem.html','find_help.html','search.html','my_help_list.html','safety.html','thanks.html','404.html','index.html','international.html','full_directory.html','full_directory_help.html','chamber_helper.html','link.html'].includes(f))return true;const h=cleanHost(u.hostname),txt=(a.textContent+' '+(a.closest('li,section,div')?.textContent||'')).toLowerCase();if(['paypal.com','cash.app','venmo.com','stripe.com','buymeacoffee.com'].some(x=>h===x||h.endsWith('.'+x)))return true;if(/donate via|support the chamber|cash app|venmo|paypal donation|advertis|sponsor/.test(txt.slice(0,500)))return true;return false;}
  function nearestSectionHeading(el){let node=el;while(node&&node!==document.body){let p=node.previousElementSibling;while(p){if(/^H[234]$/.test(p.tagName))return p;const hs=p.querySelectorAll?.('h2,h3,h4');if(hs&&hs.length)return hs[hs.length-1];p=p.previousElementSibling;}node=node.parentElement;}return document.querySelector('h1,h2');}
  function headingText(h){return (h?.textContent||'Resources on this page').replace(/\s+/g,' ').trim().slice(0,180);}
  function linkName(a){let t=(a.textContent||'').replace(/\s+/g,' ').trim();if(!t||/^(website|learn more|click here|open|details)$/i.test(t)){t=(a.closest('li,p,div')?.textContent||t).replace(/\s+/g,' ').trim();}return t.slice(0,220)||a.hostname||'Resource listing';}
  function enhanceResourceLinks(){
    if(!isResourcePage())return;
    const anchors=document.querySelectorAll('a[href^="http://"],a[href^="https://"]');let marked=0;
    anchors.forEach(a=>{let u;try{u=new URL(a.href,location.href)}catch(e){return;}if(a.classList.contains('coh-resource-link')){marked++;return;}if(excludedExternal(a,u))return;let type='Organization or service website',cls='coh-type-resource';if(isSearchOrLocator(u)){type='Search, map, or locator starting point',cls='coh-type-search';}else if(isOfficialPublic(u)){type='Government or public source',cls='coh-type-official';}a.classList.add('coh-resource-link',cls);a.title=(a.title?a.title+' - ':'')+type;const h=nearestSectionHeading(a),section=headingText(h);a.addEventListener('click',()=>{try{sessionStorage.setItem('cohLastResource',JSON.stringify({page:location.href,pageTitle:document.title,resource:linkName(a),resourceUrl:a.href,section,type}))}catch(e){}},{passive:true});marked++;});
    if(!marked)return;
    const target=document.querySelector('h1,h2');
    if(target&&!document.querySelector('.coh-page-resource-note')){const note=document.createElement('div');note.className='coh-page-resource-note';note.innerHTML='Details may change. Contact the provider before traveling or sharing personal information. <a href="'+esc(reportHref())+'">Report incorrect information</a>.';target.insertAdjacentElement('afterend',note);}
    if(target&&!document.querySelector('.coh-resource-legend')){const legend=document.createElement('details');legend.className='coh-resource-legend';legend.innerHTML='<summary>About resource labels</summary><div class="coh-legend-body"><span class="coh-badge official">Official</span> government or public source <span class="coh-badge direct">Website</span> organization or service website <span class="coh-badge search">Search</span> search, map, or locator <a href="verification_policy.html">Read the resource guide</a></div>';const note=document.querySelector('.coh-page-resource-note');(note||target).insertAdjacentElement('afterend',legend);}
  }
  document.addEventListener('DOMContentLoaded',function(){
    const host=document.getElementById('coh-global-tools');
    if(host){host.innerHTML=`<div class="coh-globalbar" role="navigation" aria-label="Chamber of Hope tools">
      <a class="coh-brand" href="index.html">Chamber of Hope HELPS</a>
      <a class="coh-tool-link coh-emergency" href="safety.html">Emergency / Safety</a>
      <a class="coh-tool-link coh-find" href="find_help.html">Find My Help</a>
      <form action="search.html" method="get" role="search"><label class="sr-only" style="position:absolute;left:-9999px" for="coh-q">Search directory</label><input id="coh-q" name="q" placeholder="Search city, need, or resource" autocomplete="off"><button type="submit">Search</button></form>
      <details class="coh-more"><summary class="coh-tool-link">More tools ▾</summary><div class="coh-menu">
        <button type="button" id="coh-save-page">♡ Save this page</button>
        <a class="coh-tool-link" href="my_help_list.html">My Help List</a>
        <a class="coh-tool-link" href="${reportHref()}">Report a problem</a>
        <a class="coh-tool-link" href="verification_policy.html">Resource guide</a>
        <a class="coh-tool-link" href="updates.html">Directory updates</a>
        <button type="button" id="coh-print-page">Print this page</button>
      </div></details>
      <button class="coh-tool-link coh-exit" id="coh-quick-exit" type="button" title="Leaves this site for Google. Browser history may still remain.">Quick Exit</button>
    </div>`;}
    const foot=document.getElementById('coh-global-footer');
    if(foot){foot.className='coh-global-footer';foot.innerHTML=`<strong>Chamber of Hope - Worldwide HELPS Ministry Directory</strong><br>Find help. Share hope.<nav><a href="verification_policy.html">Resource guide</a><a href="corrections_policy.html">Corrections</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="accessibility.html">Accessibility</a><a href="sponsorship_policy.html">Advertising policy</a><a href="report_problem.html">Report a problem</a></nav>`;}
    document.getElementById('coh-save-page')?.addEventListener('click',saveCurrent);document.getElementById('coh-print-page')?.addEventListener('click',()=>window.print());document.getElementById('coh-quick-exit')?.addEventListener('click',quickExit);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&e.shiftKey)quickExit();});enhanceResourceLinks();
    if(document.querySelector('a[href^="javascript:setCity"]')){let resourceTimer=null;const observer=new MutationObserver(mutations=>{const hasNewExternal=mutations.some(m=>Array.from(m.addedNodes||[]).some(n=>n.nodeType===1&&((n.matches&&n.matches('a[href^="http://"],a[href^="https://"]'))||(n.querySelector&&n.querySelector('a[href^="http://"],a[href^="https://"]')))));if(!hasNewExternal)return;clearTimeout(resourceTimer);resourceTimer=setTimeout(enhanceResourceLinks,120);});observer.observe(document.body,{childList:true,subtree:true});}
  });
  window.COH={saved,saveCurrent,toast,esc,lastResource,reportHref};
})();

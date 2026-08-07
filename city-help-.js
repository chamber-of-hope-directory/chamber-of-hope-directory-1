/* Chamber of Hope Step 4: local city help finder */
(function(){
  function selected(form, cls){ return form.querySelector(cls); }
  document.addEventListener('submit', function(event){
    var form=event.target.closest('.coh-city-help-form');
    if(!form) return;
    event.preventDefault();
    var city=selected(form,'.coh-city-select');
    var need=selected(form,'.coh-city-need');
    if(!city || !city.value){ city && city.focus(); return; }
    var state=form.getAttribute('data-state') || '';
    var query=[city.value,state,need ? need.value : ''].filter(Boolean).join(' ');
    window.location.href='search.html?q='+encodeURIComponent(query);
  });
  document.addEventListener('click', function(event){
    var button=event.target.closest('.coh-city-open-button');
    if(!button) return;
    var form=button.closest('.coh-city-help-form');
    var city=selected(form,'.coh-city-select');
    if(!city || !city.value){ city && city.focus(); return; }
    var option=city.options[city.selectedIndex];
    var anchor=option.getAttribute('data-anchor');
    if(anchor){ window.location.hash=anchor; }
  });
})();

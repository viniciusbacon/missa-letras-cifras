(function(){
  function ir(seletor){
    var el = document.querySelector(seletor);
    if(el && !el.classList.contains('desabilitado') && el.getAttribute('href')){
      window.location.href = el.getAttribute('href');
    }
  }

  document.addEventListener('keydown', function(e){
    if(e.key === 'ArrowRight') ir('.nav-proxima');
    if(e.key === 'ArrowLeft') ir('.nav-anterior');
  });

  var inicioX = null;
  document.addEventListener('touchstart', function(e){
    inicioX = e.touches[0].clientX;
  }, {passive:true});

  document.addEventListener('touchend', function(e){
    if(inicioX === null) return;
    var fimX = e.changedTouches[0].clientX;
    var diff = fimX - inicioX;
    if(Math.abs(diff) > 70){
      if(diff < 0) ir('.nav-proxima');
      else ir('.nav-anterior');
    }
    inicioX = null;
  }, {passive:true});
})();

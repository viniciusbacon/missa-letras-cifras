(function(){
  var CHAVE = 'fonte_escala';
  var MIN = 80, MAX = 160, PASSO = 10;

  function ler(){
    var v = parseInt(localStorage.getItem(CHAVE), 10);
    return isNaN(v) ? 100 : v;
  }

  function salvar(v){
    localStorage.setItem(CHAVE, String(v));
  }

  function aplicar(v){
    document.documentElement.style.fontSize = v + '%';
    var mostrador = document.querySelector('.f-atual');
    if(mostrador) mostrador.textContent = v + '%';
  }

  document.addEventListener('DOMContentLoaded', function(){
    var escala = ler();
    aplicar(escala);

    var menos = document.querySelector('.f-menos');
    var mais = document.querySelector('.f-mais');
    var reset = document.querySelector('.f-reset');

    if(menos) menos.addEventListener('click', function(){
      escala = Math.max(MIN, escala - PASSO);
      salvar(escala);
      aplicar(escala);
    });

    if(mais) mais.addEventListener('click', function(){
      escala = Math.min(MAX, escala + PASSO);
      salvar(escala);
      aplicar(escala);
    });

    if(reset) reset.addEventListener('click', function(){
      escala = 100;
      salvar(escala);
      aplicar(escala);
    });
  });
})();

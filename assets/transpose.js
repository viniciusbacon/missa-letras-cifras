(function(){
  var NOTAS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  var BEMOL_PARA_SUSTENIDO = {
    'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B','Fb':'E'
  };

  function raizDoAcorde(texto){
    var m = texto.match(/^[A-G](#|b)?/);
    return m ? m[0] : null;
  }

  function transporNota(nota, semitons){
    if(BEMOL_PARA_SUSTENIDO[nota]) nota = BEMOL_PARA_SUSTENIDO[nota];
    var i = NOTAS.indexOf(nota);
    if(i === -1) return nota;
    i = (i + semitons + 1200) % 12;
    return NOTAS[i];
  }

  function transporAcorde(acorde, semitons){
    if(!acorde || semitons === 0) return acorde;
    return acorde.split('/').map(function(parte){
      var raiz = raizDoAcorde(parte);
      if(!raiz) return parte;
      var resto = parte.slice(raiz.length);
      return transporNota(raiz, semitons) + resto;
    }).join('/');
  }

  function musicaAtual(){
    return document.body.getAttribute('data-musica') || 'musica';
  }

  function chaveArmazenamento(){
    return 'transp_' + musicaAtual();
  }

  function lerSemitons(){
    var v = parseInt(localStorage.getItem(chaveArmazenamento()), 10);
    return isNaN(v) ? 0 : v;
  }

  function salvarSemitons(v){
    localStorage.setItem(chaveArmazenamento(), String(v));
  }

  function aplicar(semitons){
    var acordes = document.querySelectorAll('[data-acorde]');
    acordes.forEach(function(el){
      el.textContent = transporAcorde(el.getAttribute('data-acorde'), semitons);
    });
    var mostrador = document.querySelector('.t-atual');
    if(mostrador){
      mostrador.textContent = (semitons > 0 ? '+' : '') + semitons + ' tom' + (Math.abs(semitons) === 1 ? '' : 's');
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(!document.querySelector('[data-acorde]')) return;

    var semitons = lerSemitons();
    aplicar(semitons);

    var menos = document.querySelector('.t-menos');
    var mais = document.querySelector('.t-mais');
    var reset = document.querySelector('.t-reset');

    if(menos) menos.addEventListener('click', function(){
      semitons -= 1;
      salvarSemitons(semitons);
      aplicar(semitons);
    });

    if(mais) mais.addEventListener('click', function(){
      semitons += 1;
      salvarSemitons(semitons);
      aplicar(semitons);
    });

    if(reset) reset.addEventListener('click', function(){
      semitons = 0;
      salvarSemitons(semitons);
      aplicar(semitons);
    });
  });
})();

(function(){
  function escapeHtml(s){
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Quebra uma linha com marcadores [Acorde] em segmentos acorde+trecho.
  function renderizarLinha(texto){
    var partes = texto.split(/(\[[^\]]*\])/g).filter(function(s){ return s !== ''; });
    var html = '<div class="linha-cifra">';
    var acordePendente = null;
    var teveTexto = false;

    partes.forEach(function(parte){
      var m = parte.match(/^\[([^\]]*)\]$/);
      if(m){
        acordePendente = m[1];
        return;
      }
      teveTexto = true;
      html += '<span class="seg">' +
        '<span class="seg-acorde"' + (acordePendente ? ' data-acorde="' + escapeHtml(acordePendente) + '"' : '') + '>' +
          (acordePendente ? escapeHtml(acordePendente) : ' ') +
        '</span>' +
        '<span class="seg-texto">' + escapeHtml(parte) + '</span>' +
      '</span>';
      acordePendente = null;
    });

    // Acorde solto no fim da linha (ex: "...[E]")
    if(acordePendente){
      html += '<span class="seg">' +
        '<span class="seg-acorde" data-acorde="' + escapeHtml(acordePendente) + '">' + escapeHtml(acordePendente) + '</span>' +
        '<span class="seg-texto"> </span>' +
      '</span>';
      teveTexto = true;
    }

    html += '</div>';
    return teveTexto ? html : '';
  }

  function renderizarCifra(texto){
    var linhas = texto.replace(/\r\n/g, '\n').split('\n');
    var html = '';
    var ultimaFoiEspaco = true; // evita espaço duplicado no topo

    linhas.forEach(function(linhaBruta){
      var linha = linhaBruta.replace(/\s+$/,'');
      if(/^##\s?/.test(linha)){
        html += '<div class="rotulo">' + escapeHtml(linha.replace(/^##\s?/,'')) + '</div>';
        ultimaFoiEspaco = false;
      } else if(linha.trim() === ''){
        if(!ultimaFoiEspaco){
          html += '<div class="secao-espaco"></div>';
        }
        ultimaFoiEspaco = true;
      } else {
        html += renderizarLinha(linha);
        ultimaFoiEspaco = false;
      }
    });

    return html;
  }

  function slugAtual(){
    return document.body.getAttribute('data-musica') || 'musica';
  }

  function chaveTexto(){
    return 'cifra_texto_' + slugAtual();
  }

  function obterTextoOriginal(){
    var fonte = document.getElementById('cifra-original');
    return fonte ? fonte.textContent.replace(/^\n/, '').replace(/\n$/, '') : '';
  }

  function obterTextoAtual(){
    var salvo = localStorage.getItem(chaveTexto());
    return salvo !== null ? salvo : obterTextoOriginal();
  }

  function montar(texto){
    var alvo = document.getElementById('letra-render');
    if(!alvo) return;
    alvo.innerHTML = renderizarCifra(texto);
    if(window.CifraTranspose) window.CifraTranspose.reaplicar();
  }

  function status(msg){
    var el = document.querySelector('.editor-status');
    if(el){
      el.textContent = msg;
      clearTimeout(el._t);
      el._t = setTimeout(function(){ el.textContent = ''; }, 2500);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(!document.getElementById('letra-render')) return;

    var textoAtual = obterTextoAtual();
    montar(textoAtual);

    var botaoEditar = document.querySelector('.botao-editar');
    var painel = document.querySelector('.editor-wrap');
    var textarea = document.querySelector('.editor-textarea');
    var btnRestaurar = document.querySelector('.editor-restaurar');
    var btnCopiar = document.querySelector('.editor-copiar');
    var btnBaixar = document.querySelector('.editor-baixar');
    var btnSolicitar = document.querySelector('.editor-solicitar');

    if(textarea) textarea.value = textoAtual;

    if(botaoEditar && painel){
      botaoEditar.addEventListener('click', function(){
        painel.classList.toggle('aberto');
        botaoEditar.textContent = painel.classList.contains('aberto') ? '✖ Fechar edição' : '✏️ Editar cifra';
        if(painel.classList.contains('aberto') && textarea) textarea.focus();
      });
    }

    if(textarea){
      var debounce = null;
      textarea.addEventListener('input', function(){
        clearTimeout(debounce);
        debounce = setTimeout(function(){
          var novoTexto = textarea.value;
          localStorage.setItem(chaveTexto(), novoTexto);
          montar(novoTexto);
          status('Salvo neste navegador ✓');
        }, 200);
      });
    }

    if(btnRestaurar){
      btnRestaurar.addEventListener('click', function(){
        localStorage.removeItem(chaveTexto());
        var original = obterTextoOriginal();
        if(textarea) textarea.value = original;
        montar(original);
        status('Cifra original restaurada');
      });
    }

    if(btnCopiar){
      btnCopiar.addEventListener('click', function(){
        var texto = textarea ? textarea.value : obterTextoAtual();
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(texto).then(function(){
            status('Texto copiado ✓');
          }, function(){
            status('Não deu pra copiar automaticamente — selecione o texto manualmente.');
          });
        } else {
          status('Seu navegador não suporta copiar automático — selecione o texto manualmente.');
        }
      });
    }

    if(btnBaixar){
      btnBaixar.addEventListener('click', function(){
        var texto = textarea ? textarea.value : obterTextoAtual();
        var blob = new Blob([texto], {type: 'text/plain;charset=utf-8'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'cifra-' + slugAtual() + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    if(btnSolicitar){
      btnSolicitar.addEventListener('click', function(){
        var texto = textarea ? textarea.value : obterTextoAtual();
        var original = obterTextoOriginal();
        var tituloMusica = document.querySelector('.cabecalho-musica h2');
        tituloMusica = tituloMusica ? tituloMusica.textContent.trim() : slugAtual();

        var mudou = texto !== original;
        var titulo = 'Correção de cifra: ' + tituloMusica;
        var corpo = 'Sugestão de correção pra cifra desta música, feita direto no site (' + location.href + ').\n\n';

        if(mudou){
          corpo += '**Texto sugerido (editado):**\n```\n' + texto + '\n```\n\n**Texto original pra comparar:**\n```\n' + original + '\n```\n';
        } else {
          corpo += 'Não editei nada ainda, só quero avisar que tem algo errado nesta cifra — segue o texto atual pra referência:\n```\n' + texto + '\n```\n\n(Descreva aqui o que precisa corrigir.)\n';
        }

        var url = 'https://github.com/viniciusbacon/missa-letras-cifras/issues/new?title=' +
          encodeURIComponent(titulo) + '&body=' + encodeURIComponent(corpo);
        window.open(url, '_blank');
        status('Abrindo o GitHub pra enviar a correção...');
      });
    }
  });
})();

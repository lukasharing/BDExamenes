var pag = 1;
var page_limit = 0;

function split(val){ return val.split( /,\s*/ ); }

function extractLast( term ) {
  return split( term ).pop();
}

// He cambiado unas cosas, no sé si funcionará, pruebalo tú primero.
function mostrarResultados(numpag) {
  let args = `${split($(".search").val()).map((e,a)=>{return(`tag${a}=${encodeURI(e)}`);}).join("&")}&page=${numpag}`;
  // Comentario: Cuando te refieres a un único objeto, es más eficiente utilizar el tag **id** en vez del tag class.
  // Puesto que id es único y class pueden existir varios.
  // SOLUCION: .loading -> #loading; .results -> #results, etc. En html y css, class="loading" por id="loading"
  $(".loading").show();
  
  if(numpag == 1){
    $(".results").empty();
  }
  $.getJSON("php/getter.php", args, (data, status)=>{
    page_limit = Math.floor(data.num_r / 20) + 1;
    if(data.num_r > 0){
      delete data.num_r;
      $.each(data, (key, value)=>{
        if(value != null){
          $(".results").append(''+
            "<li>"+
              `<a href="${encodeURI(`${value[0]}/${key}`)}" target="_blank">`+
                `<img class="image" src="img/${value[1]}.jpg">`+
                `<div>${key}</div>`+
              "</a>"+
            "</li>"+
          '');
        }
      });
    }else{
      $(".results").html("<li>No hay nada que mostrar.</li>");
    }
  }).fail((error)=>{
    $(".results").html("<li>Error al intentar de obtener resultados.</li>");
  }).always(()=>{
    $(".loading").hide();
  });
}

$(document).ready(function() {
  $(window)
    .scroll(function(){
      if( ($(window).scrollTop()+$(window).height() > $(document).height() - 15 ) && pag <= page_limit){
        mostrarResultados(++pag);
      }
    });

  $(".buttom_up").click(function(){ 
    $("html, body").animate({ scrollTop: 0 });
  });

  $( '.icon' ).click(function(){
    mostrarResultados(1);
  });

  $('.search')
    .click(function(){
      this.select(); 
    })
    .keydown(function(event){
      if(event.keyCode == 13){ // press intro
          mostrarResultados(1);
      }
    })
    .autocomplete({
      minLength: 2,
      autoFocus: true,
      create: function( event, ui ) {
        $( '.search' ).val("");
        $.getJSON( "./php/tagger.php", 
          function(data, status){
            cache = data;
            for(var i=0; i<5 ; i++){
              var li = document.createElement('li');
              li.innerHTML = data[i];
              li.onclick = function(){
                var terms = split( $( '.search' ).val() );
                var pos = terms.indexOf(this.innerHTML);
                if(pos != -1){
                  terms.splice(pos, 1);
                }else{
                  if(terms[terms.length-1]==""){
                    terms.pop();
                  }
                  terms.push(this.innerHTML);
                  terms.push("");
                }
                $( '.search' ).val( terms.join( ", " ) );
                pag=1
                mostrarResultados(1);
              };
              $('.suggestions').append(li);
            }
          }
        );
      },
      source: function( request, response ) {
        var escapedString = $.ui.autocomplete.escapeRegex(extractLast( request.term ));
        escapedString = escapedString
          .replace(/[aá]/gi, '[aá]').replace(/[eé]/gi, '[eé]')
          .replace(/[ií]/gi, '[ií]').replace(/[oó]/gi, '[oó]');
        var matcher = new RegExp( "^" + escapedString, "i" );
        response( $.grep( cache, 
          function( item ){
            return matcher.test( item );
          }).slice(0, 10)
        );
      },
      select: function( event, ui) {
        pag=1;
        var terms = split( this.value );
        // remove the current input
        terms.pop();
        // add the selected item
        terms.push(ui.item.value);
        // add placeholder to get the comma-and-space at the end
        terms.push( "" );
        $( '.search' ).val(terms.join( ", " ));
        mostrarResultados(pag);
        return false;
      }
  });
});

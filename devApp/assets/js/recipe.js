'use strict';

(function() {

  // verificando se na tela existe esse elemento
  if($('.recipe-index .recipe-wrap .image-wrap img').length){

    // guardando ele em uma variável mais amigável
    var _this = $('.recipe-index .recipe-wrap .image-wrap img')[0];

    // pegando o src da imagem
    var recipeImage = _this.currentSrc;
    console.log('recipeImage', recipeImage);

    // removendo a imagem do DOM
    $(_this).remove();

    // colocando a imagem como fundo do container
    $('.recipe-index .recipe-wrap .image-wrap .image-container').css('background-image', 'url(' + recipeImage + ')');
  }

})();

'use strict';

(function(){

  $('nav.contact-type-list a').on('click', function(){
    $('nav.contact-type-list a').removeClass('active');
    $('nav.contact-type-list a').removeClass('no-shadow');
    
    $(this).addClass('active');
    $(this).prev('a').addClass('no-shadow');

    $('section.contact form').hide();
    $('section.contact form[name="' + $(this).data('form') + '"]').show();
  });

})();
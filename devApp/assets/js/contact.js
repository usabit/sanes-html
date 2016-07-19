'use strict';

(function(){

  $('nav.contact-type-list a').on('click', function(){
    $('nav.contact-type-list a').removeClass('active');
    
    $(this).addClass('active');

    $('section.contact form').hide();
    $('section.contact form[name="' + $(this).data('form') + '"]').show();
  });

})();
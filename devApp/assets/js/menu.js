'use strict';

$('.hamburger-menu-flex').click(function(event){
  event.preventDefault();
  $(this).toggleClass('open');
  $('#mobile-menu').toggleClass('open');
  $('body').toggleClass('no-scroll');
});

$('li.header-menu-item').clone().appendTo('ul.mobile-menu-list');

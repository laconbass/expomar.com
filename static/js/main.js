$(document).ready(function(){
  $('#messages > *').click(function(){ $(this).remove(); });
  // TODO custom scroll
  // see http://stackoverflow.com/questions/7600454/how-to-prevent-page-scrolling-when-scrolling-a-div-element
  $('#menu-top button, #menu-section button').click(function(){
    $(this).parent().focus().toggleClass('expanded');
  });
  var body = $('body');
  var intro = $('#intro');
  var wait = $('html').hasClass('cssanimations') && body.hasClass('portada');
  var ready = body.addClass.bind( body, 'ready' );
  var animationend = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';
  wait? intro.find('.futuro').one( animationend, introend ) : ready();
  function introend(){
    $('#intro').addClass('animated fadeOut').one( animationend, ready );
  }
});

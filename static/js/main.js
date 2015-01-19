$(document).ready(function(){
  $('#messages > *').click(function(){ $(this).remove(); });
  // TODO custom scroll
  // see http://stackoverflow.com/questions/7600454/how-to-prevent-page-scrolling-when-scrolling-a-div-element
  $('#menu-top button, #menu-section button').click(function(){
    $(this).parent().focus().toggleClass('expanded');
  });
  $('body').addClass('ready');
});


$(document).ready(function(){
  $('#messages > *').click(function(){ $(this).remove(); });
  var menu = $('#menu-top');
  $('#menu-top button').click(function(){
    menu.toggleClass('expanded');
  });
})

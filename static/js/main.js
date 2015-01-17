$(document).ready(function(){
  $('#messages > *').click(function(){ $(this).remove(); });
  var menu = $('#menu-top');
  var submenu = $('#menu-section');
  $('#menu-top button').click(function(){
    menu.toggleClass('expanded');
  });
  $('#menu-section button').click(function(){
    submenu.toggleClass('expanded');
  });
})

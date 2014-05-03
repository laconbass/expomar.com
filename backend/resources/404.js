var iai = require('iai');

module.exports = iai.item( __filename )
  .name( 'Page Not Found' )
  .layout( 'templates/404.swig.html' )
  .styles( 'styles/404.less' )
;

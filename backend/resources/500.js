var iai = require('iai');

module.exports = iai.item( __filename )
  .name( 'Internal Server Error' )
  .layout( 'templates/500.swig.html' )
;

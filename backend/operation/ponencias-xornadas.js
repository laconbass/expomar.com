var iai = require( '../../../iai' )
  , read = iai.project.require( 'backend/operation/read' )
  , f = require( 'util' ).format
;

var location = "files/%s/ponencias-xornadas-tecnicas";
exports.list = function( year, callback ){
  var path = f( location, year );
  read.dir( 'static', f( location, year ),  function( err, files ){
    if( err ){
      return callback( err );
    }
    files = files.map(function( file ){
      return f( '/'+location+'/%s', year, file );
    });
    callback( null, files );
  });
}

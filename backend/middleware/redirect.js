var Controller = require('./Controller');

module.exports = redirect;

function redirect( meta ){
  meta = meta || {};

  if( !meta.location ){
    throw new Error( 'redirect controller needs a location' );
  }

  function redirect( req, res, next ){
    res.redirect( meta.location );
  }

  return Controller( meta, redirect );
}

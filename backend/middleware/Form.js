var path = require('path');

var Controller = require('./Controller')
  , Layout = require( './Layout' )
;


module.exports = Form;

function Form( meta ){
  meta = meta || {};

  if( 'function' !== meta.action ){
    throw new Error( 'Form controller needs #action function' );
  }

  function form( req, res, next ){
    var doc = meta.document;

    res.locals.meta = meta;
    res.render( doc, function( err, html ){
      if( err ){
        return next( err );
      }
      res.locals.html = html;
      document.layout( req, res, next )
    });
  }

  form.layout = Layout( meta );

  return Controller( meta, document );
}

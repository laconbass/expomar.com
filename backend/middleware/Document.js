var iai = require('../../../iai')
  , path = require('path')
;

var Controller = iai.project.require('backend/middleware/Controller')
  , Layout = require( './Layout' )
;


module.exports = Document;

function Document( meta ){
  meta = meta || {};

  if( !meta.layout || !meta.document ){
    throw new Error( 'Document controller needs #layout and #document' );
  }

  function document( req, res, next ){
    var doc = meta.document;

    if( !!res.locals.lang ){
      var ext = path.extname( doc );
      doc = doc.slice( 0, -ext.length ) + '-' + res.locals.lang + ext;
    }

    res.render( doc, function( err, html ){
      if( err ){
        return next( err );
      }
      res.locals.html = html;
      document.layout( req, res, next )
    });
  }

  document.layout = Layout( meta );

  return Controller( meta, document );
}

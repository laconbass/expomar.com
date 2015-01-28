var path = require('path');

var View = require('./View')
  , Layout = require( './Layout' )
;


module.exports = Document;

function Document( meta ){
  meta = meta || {};

  if( !meta.layout || !meta.document ){
    throw new Error( 'Document controller needs #layout and #document' );
  }

  if( typeof meta.document != 'object' ){
      throw new Error( 'Document controller #document must be an object' );
  }

  function document( req, res, next ){
    var doc = meta.document;

    if( !res.locals.lang ){
      return next( Error('Document controller needs res.locals.lang') );
    }

    doc = doc[ res.locals.lang ];
    if ( ! doc ){
      doc = "public/non-traducido.swig.html";
    }

    res.locals.meta = meta;
    res.render( doc, function( err, html ){
      if( err ){
        return next( err );
      }
      res.locals.html = html;
      document.layout( req, res, next )
    });
  }

  document.layout = Layout( meta );

  return View.create( meta, document );
}

var iai = require( 'iai' )
  , swig = require( 'swig' )
  , f = require( 'util' ).format
  , debug = require( 'debug' )( 'iai:middleware:swig' )
;

swig = new swig.Swig({
  // see options [here](http://paularmstrong.github.io/swig/docs/api/#SwigOpts)
  autoescape: true,
  cache: iai.production? 'memory' : false,
  //loader: swig.loaders.fs( root.resolve() ),
  locals: {
    selected: function( condition ){
      return condition? ' class="selected"' : '';
    }
  }
});

module.exports = swigLayout;

/**
 * Middleware relative to layout
 */

function swigLayout( filename ){
  debug( 'layout created for "%s"', filename )
  return function( req, res, next ){
    res.render = function( msg ){
      if( msg ){
        res.message( msg );
      }
      swig.renderFile( filename, res.locals, function( err, output ){
        if( err ) return next( err );
        res.end( output );
      })
    };
    next();
  }
}

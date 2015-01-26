var sequence = require( '../sequence' )
  , View = require( './View' )
;

module.exports = Layout;

function Layout( meta ){
  meta = meta || {};

  if( !meta.layout ){
    throw new Error( "Layout controller must has #layout");
  }


  function layout( req, res, next ){
    res.locals.meta = meta;

    function finish(){
      if(  ! Array.isArray( meta.layout )  ){
        return res.render( meta.layout );
      }
      layout.render( meta.layout, req, res, next );
    }

    if( !meta.operation ){
      return finish();
    }
    meta.operation(function( err, data ){
      if( err ){
        return next( err );
      }
      res.locals.data = data;
      finish();
    });
  }

  layout.render = renderSequence;

  return View.create( meta, layout );
}

function renderSequence( layouts, req, res, next ){
  var parts = layouts.slice(1).reverse();
  if( !parts.length ){
    return res.render( layouts[0] );
  }
  sequence(
      layouts.slice(1).reverse(),
      function step( index, layout, done ){
        res.render( layout, function( err, html ){
          if( err ){
            return done( err );
          }
          res.locals.html = html;
          done();
        })
      },
      function complete( err ){
        if( err ){
          return next( err );
        }
        res.render( layouts[0] );
      }
    );
}

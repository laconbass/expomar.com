
module.exports = breadcumbs;

/**
 * builds breadcumbs from app.stack
 * request's breadcumbs are set on app.locals.breadcumbs
 */

function breadcumbs( app ){
  if( !app || !Array.isArray(app.stack) ){
    throw new Error( "expecting app to be an object having an array #stack" );
  }

  function search( stack, method, url ){
    var handle;

    stack
    .filter(function( desc ){
      // extract only routes and routers
      return !!desc.route || !!desc.handle.stack
    })
    .some(function( desc ){
      var match = url.match( desc.regexp );

      if( !match ){
        return false;
      }
      //console.log( stack.length, method, url, match );
      if( desc.route ){
        //console.log( "FOUND route");
        handle = desc.route.stack
          // check the method
          .filter(function( desc ){
            return desc.method == method.toLowerCase();
          })
          // get the handles
          .map(function( desc ){ return desc.handle; })
        ;
        if( handle.length > 1 ){
          throw new Error( "breadcumbs implementation could not resolve to 1 handle" );
        }
        handle = handle[0];
      }
      else if( desc.handle.stack ){
        //console.log("FOUND ROUTER", desc.handle.stack );
        handle = search(
          desc.handle.stack,
          method,
          url.slice( match[0].length ) || '/'
        );
      }
      else {
        throw new Error( "breadcumbs implementation could not resolve match" );
      }

      return true;
    });

    return handle;
  }

  return function breadcumbs( req, res, next ){
    res.locals.breadcumbs =
      (  (req.url == '/')? [''] : req.url.split('/')  )
      .map(function( curr, i, parts ){
        var url = parts.slice( 0, i+1 ).join('/') || '/';
        //console.log( "RESOLVE %s", url );
        return {
          view: search( app.stack, req.method, url ),
          url: url
        }
      })
    ;
    next();
  }
}

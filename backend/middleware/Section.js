var assert = require('assert');
var join = require('path').join;
var express = require('express');
var View = require('./View');
var isArray = Array.isArray;

//
// Express layer inspection utilities
//

// determine if an express layer is a express.Route
function isRoute( layer ){
  return !! layer.route;
}

// determine if an express layer is a express.Router
function isRouter( layer ){
  return !! layer.handle.stack;
}

// determine if an express layer is either Route or Router
function isRouteOrRouter( layer ){
  return !! layer.route || !! layer.handle.stack;
}

// determine if an express layer handles GET requests
// TODO save calls until isRoute or isRouter need advanced logic
// TODO ¿? rename to handlesGET ¿?
function isGetLayer( layer ){
  if( 'undefined' !== typeof layer.method ){
    return layer.method === 'get';
  }
  if( isRoute(layer) ){
    return layer.route.methods.get || layer.route.methods._all;
  }
  if( isRouter(layer) ){
    return layer.handle.stack.some( isGetLayer );
  }
  // TODO a layer can be a route and a router at time
  // return isRouteAndRouter(layer)? route && router : route || router;
  return false;
}

// determine if the handler of an express layer is decorated with a View
function isViewLayer( layer ){
  if( 'undefined' !== typeof layer.handle.view ){
    assert( layer.handle.view instanceof View, 'view overwrite hazard' );
    return true;
  }
  return false;
}

// determine if an express layer is view-decorated and handles GET requests
function isGetViewLayer( layer ){
  return isViewLayer(layer) && isGetLayer(layer);
}

// attempt to find a View instance in an express layer
function seekView( layer ){
  assert( layer, 'layer must be provided' );
  if( isViewLayer(layer) ){
    return layer.handle.view;
  }
  if( isRoute(layer) ){
    //console.log( 'seek view in route "%s"', layer.route.path );
    var view = seekViewIn( layer.route.stack );
    if( view !== null ) return view;
  }
  // NOTE: a layer can be a route and a router at time
  if( isRouter(layer) ){
    //console.log( 'seek view in router', layer.route );
    var view = seekViewIn( layer.handle.stack );
    if( view !== null ) return view;
  }
  return null;
}

// attempt to find a View instance in the express layer array `stack`
function seekViewIn( stack ){
  assert( isArray(stack), 'stack must be an array' );
  for( var n in stack ){
    var view = seekView( stack[n] );
    if( view !== null ) return view;
  }
  return null;
}

// creates an array of link data from the express layer array `stack`
function inspect( stack ){
  assert( isArray(stack), 'stack must be an array' );

  // TODO accurate name for this layer test
  return stack.filter(function isGetViewRouteLayer( layer ){
    // discard layers that aren't routes or routers
    if( ! isRouteOrRouter(layer) ) return false;

    // discard layers that don't accept GET http method
    if( ! isGetLayer(layer) ) return false;

    // tells whatever layer is a router mounted as middleware (with #use)
    var usecase = isRouter(layer) && ! isRoute(layer);

    // warn about child sections mounted with "use" rather than "all"
    if( usecase && isViewLayer(layer) ){
      console.error( 'WARN: Detected Section layer mounted with #use.' );
      console.error( '      This actually leads to a wrong inspection' );
      console.error( '      because mountpath cannot be determined so' );
      console.error( '      it will be discarded. Consider using #all' )
      //console.error( inspect(layer.handle.stack) );
      return false;
    }

    // TODO routers mounted with use
    if( usecase ){
      throw new Error('lacking implementation for "used" Routers');
      //console.log( inspect(layer.handle.stack) );
      return false;
    }

    // after here we know the layer is a Route.
    return !! layer.route.stack.filter( isGetViewLayer ).length;
  })
  // TODO this is actually a LinkVO constructor
  .map(function convertViewLayerToLinkData( layer ){
    var view = seekView( layer );
    assert( view instanceof View, 'non-view layer detected' );
    return {
      // TODO replace only if express router option `strict` is false
      "href": layer.route.path,
      "text": view.title,
      "title": view.description
    };
    // TODO if Router
    // - ¿? return array instead an object
    // - ¿? add a "submenu" property or something like that
  });
}

// determine the first view instance in an express layer array `stack`
// whose layer handle will match http `verb` and `url`
function seekViewByUrl( stack, verb, url ){
  assert( isArray(stack), 'stack must be an array' );

  console.log( "SEEK VIEW %s %s IN %d LAYERS", verb, url, stack.length );

  var view = null;
  stack.some(function( layer ){
    // discard layers that aren't routes or routers
    if( ! isRouteOrRouter(layer) ) return false;

    // discard layers not matching url
    var match = url.match( layer.regexp );
    if( !match ) return false;

    if( isRoute(layer) ){
      // TODO this should use #some and return the first layer matching verb
      // reduce the search to the route stack layers that match verb
      stack = layer.route.stack.filter(function( layer ){
        return layer.method !== verb;
      });
      //console.log( "FOUND ROUTE (%d LAYERS)", stack.length );
      assert( stack.length, 'matched route without view layers' );
      assert( stack.length === 1, 'matched route with too much layers' );
      // TODO deal with multiple view routes
      view = stack[0].handle.view;
    } else if( isRouter(layer) ){
      //console.log( "  FOUND ROUTER (%d LAYERS)", layer.handle.stack.length );
      //console.log( 'predicted the view will be the router' );
      view = layer.handle.view;
    } else {
      throw new Error("expecting only routes and routers");
    }
    // stop search on first match
    // ensure a instanceof View was found
    assert( view !== null, 'seek stoped prematurely (bad implementation)' );
    if( view instanceof View ){
      console.log( 'FOUND "%s" (%s)', view.title, view.description );
    } else {
      throw new Error( verb + ' ' + url + ' matched a non-view handle' )
    }
    assert( view instanceof View, 'matched non-view handle' );
    return true;
  });
  return view;
}

module.exports = Section;

function Section( father, details ){
  // TODO remove father arg as it's no longer need
  // TODO extra arg to pass options for express.Router()
  if( !father || !isArray(father.stack) ){
    throw new Error( "father must be an object having an array #stack" );
  }

  var instance = View.constructor.call( Section.prototype, details );
  //instance.father = father;
  instance.router = express.Router();
  instance.router.view = instance;

  // mount section middleware with use so it's skiped by seek algorithms
  return instance.router
  // TODO refactor this spliting middleware
  // - "inspector" middleware to reuse the instance.inspection() thing (cached)
  .use(function inspection( req, res, next ){
    // catched by default, inspection will execute only once
    instance.inspection( /* false */ );
    next();
  })
  .use(function breadcumbs( req, res, next ){
    // determine the view that will handle the request
    // TODO ¿? this should determine the end point?
    //res.locals.view = seekViewByUrl( instance.router.stack, req.method, req.url );

    /*console.log('MONKEY PATCH BREADCUMBS', req.url.split('/') );
    var parts = req.url.split('/'), url = '';
    while( parts.length ){
      url = join( url, parts.shift() || '/' );
      var view = seekViewByUrl( instance.router.stack, req.method, url );
      console.log( url, view );
    }*/
    next();
  })
  .use(function section_menus( req, res, next ){
    // initialize the `menus` local variable
    res.locals.menus = res.locals.menus || [];
    assert( isArray(res.locals.menus), '`menus` local var must be array');

    // save existing `menu` before overwriting it
    if( res.locals.menu ){
      assert( isArray(res.locals.menu), '`menu` local var must be array');
      res.locals.menus.push( res.locals.menu );
    }

    // determine this section menu converting layers to urls
    var base = req.originalUrl.slice( 0, -req.url.length );
    //console.log( 'Original: %s Base: %s Req:', req.originalUrl, base, req.url );
    res.locals.menu = instance.menu.map(function( link ){
      var link = Object.create(link);
      link.href = join( base, link.href );
      return link;
    });
    // push this section menu on menus
    res.locals.menus.push( res.locals.menu );
    next();
  });
}

Section.prototype = Object.create( View );
Section.prototype.constructor = Section;

/**
 *  inspects `this.router.stack` to determine:
 *    - `this.menu` (array): links to routes on router.stack being Views
 *  @param cached (bool): set to false to force the inspection to be done.
 *                        defaults to true when NODE_ENV is 'production'
 *  @returns (bool): whatever the inspection was done.
 */
Section.prototype.inspection = function inspection( cached ){
  cached = ! cached;
  //cached = !!( cached || process.env.NODE_ENV === 'production' );

  // inspect only once when cached is true
  if( cached && this.menu ){
    console.log( 'INSPECT %s CACHED', this.title );
    return false;
  }

  // determine this.menu
  console.log( '^=> INSPECTING SECTION "%s"', this.title );
  this.menu = inspect( this.router.stack );

  var s = '\n  '
  console.log(
    '$=> "%s" FOUND %d LINKS AMONG %d LAYERS:%s%s',
    this.title, this.menu.length, this.router.stack.length, s,
    this.menu.map(function( l ){ return l.href + " > " + l.text; }).join(s)
  );
  return true;
};


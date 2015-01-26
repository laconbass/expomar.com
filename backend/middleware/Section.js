var assert = require('assert');
var join = require('path').join;
var express = require('express');
var View = require('./View');
var isArray = Array.isArray;
var t = require('../translator');

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

// create a function that determines whatever given express layer handles
// requests whose http method is `verb`
// TODO save calls until isRoute or isRouter need advanced logic
function verbFilter( verb ){
  assert( 'string' === typeof verb, 'verb must be a string' );
  assert( verb, 'verb must be non-empty string' );
  verb = verb.toLowerCase();

  return function isVERBLayer( layer ){
    if( 'undefined' !== typeof layer.method ){
      return layer.method === verb;
    }
    if( isRoute(layer) ){
      return layer.route.methods[verb] || layer.route.methods._all;
    }
    if( isRouter(layer) ){
      return layer.handle.stack.some( isVERBLayer );
    }
    // TODO a layer can be a route and a router at time
    // return isRouteAndRouter(layer)? route && router : route || router;
    return false;
  };
}

// determine if an express layer handles GET requests
// TODO ¿? rename to handlesGET ¿?
var isGetLayer = verbFilter( 'get' );

// determine if the handler of an express layer is decorated with a View
function isViewLayer( layer ){
  if( 'undefined' !== typeof layer.handle.view ){
    assert( layer.handle.view instanceof View, 'view overwrite hazard' );
    return true;
  }
  return false;
}

// creates a function that determines whatever given express layer handle
// has been decorated with a property data descriptor named `name`
// If function `assert` is provided, it will be called when the property
// is found receiving the property value so it's a hook for aditional checks
// behaves exactly as "isViewLayer"
function propertyFilter( name, hook ){
  return function isDecorated( layer ){
    if( 'undefined' !== typeof layer.handle[ name ] ){
      'function' === typeof hook && hook( layer.handle[name] );
      return true;
    }
    return false;
  }
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
    var view = seekIn( layer.route.stack, seekView );
    if( view !== null ) return view;
  }
  // NOTE: a layer can be a route and a router at time
  if( isRouter(layer) ){
    //console.log( 'seek view in router', layer.route );
    var view = seekIn( layer.handle.stack, seekView );
    if( view !== null ) return view;
  }
  return null;
}


// attempt to find something in the array `stack` with the function `seek`
function seekIn( stack, seek ){
  assert( isArray(stack), 'stack must be an array' );
  assert( 'function' === typeof seek, 'seek must be a function' );
  for( var n in stack ){
    var data = seek( stack[n] );
    if( data !== null ) return data;
  }
  return null;
}

function propertySeeker( name, hook ){
  var isPropertyLayer = propertyFilter( name, hook );
  return function seekProperty( layer ){
    if( isPropertyLayer(layer) ){
      return layer.handle[ name ];
    }
    if( isRoute(layer) ){
      var data = seekIn( layer.route.stack, seekProperty );
      if( data !== null ) return data;
    }
    // NOTE: a layer can be a route and a router at time
    if( isRouter(layer) ){
      //console.log( 'seek view in router', layer.route );
      var data = seekIn( layer.handle.stack, seekProperty );
      if( data !== null ) return data;
    }
    return null;
  };
}

var seekMeta = propertySeeker('meta');

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
  .map(function( layer ){
    return kindOfViewLinkVO( layer.route.path, layer );
  })
}

function kindOfViewLinkVO( href, layer ){
  var view = seekView( layer );
  assert( view, 'expecting view layer' );
  return {
    "href": href,
    "text": view.title,
    "title": view.description
  };
  // TODO if Router
  // - ¿? return array instead an object
  // - ¿? add a "submenu" property or something like that
};

function kindOfMetaLinkVO( href, layer ){
  var meta = seekMeta( layer );
  assert( meta, 'expecting meta layer' );
  return {
    "href": href,
    "text": meta.name,
    "title": meta.desc
  };
};

// determine the first route in an express layer array `stack` that accepts
// the http method `verb` and whose regexp (layer.regexp) will match `url`.
function seekByUrl( stack, verb, url ){
  assert( isArray(stack), 'stack must be an array' );
  var result = null, isVerbLayer = verbFilter(verb);
  stack.some(function matches( layer ){
    // discard layers that aren't routes or routers
    if( ! isRouteOrRouter(layer) ) return false;

    // discard layers not matching url
    var match = url.match( layer.regexp );
    if( !match ) return false;

    // discard layers not matching verb
    if( ! isVerbLayer(layer) ) return false;

    if( isRoute(layer) ){
      result = layer;
      // stop iteration on match
      return true;
    }
    // search through Router's stack
    // reuse this function so it's no need a whole seekLayerByUrl call
    url = url.replace( RegExp('^' + match), '' );
    return layer.handle.stack.some( matches );
  });
  return result;
}

function linkTranslator( req, res ){
  var base = req.originalUrl.slice( 0, -req.url.length );
  var values = res.locals.view? res.locals.view.data : res.locals;
  return function( link ){
    var link = Object.create(link);
    link.href = join( base, link.href );
    link.text = res.locals.t(link.text, values);
    link.title = res.locals.t(link.title, values);
    return link;
  };
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
  .use(function breadcumbs( req, res, next ){
    // TODO could this simply push the view instance¿?
    // TODO sure, but it will skip non-sections unless some work is done
    // skip if breadcumbs were already built
    if( Array.isArray(res.locals.links) ) return next();

    var view, views, links = [], url = '', parts = req.url.split('/');
    while( parts.length ){
      url = join( url, parts.shift() || '/' );
      var layer = seekByUrl( instance.router.stack, req.method, url );
      view = seekView( layer );
      // TODO traducir cada link coa sua view, non coa view resultante da peticion
      if( view ){
        links.push( kindOfViewLinkVO(url, layer) );
      } else {
        view = seekMeta( layer );
        links.push( kindOfMetaLinkVO(url, layer) );
      }
    }
    // set view before so linkTranslator uses its data instead req.locals
    res.locals.view = view.translate? view.translate( res.locals.t ) : view;
    res.locals.links = links.map( linkTranslator(req, res) );
    //console.log('MONKEY PATCH BREADCUMBS', res.locals.links );
    next();
  })
  // - "inspector" middleware to reuse the instance.inspection() thing (cached)
  .use(function inspection( req, res, next ){
    // catched by default, inspection will execute only once
    instance.inspection( /* false */ );
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

    // determine this section menu translating instance.menu links
    res.locals.menu = instance.menu.map( linkTranslator(req, res) );
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


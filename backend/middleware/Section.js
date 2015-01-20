var assert = require('assert');
var express = require('express');
var View = require('./View');
var isArray = Array.isArray;

module.exports = Section;

function Section( father, details ){
  // TODO extra arg to pass options for express.Router()
  if( !father || !isArray(father.stack) ){
    throw new Error( "father must be an object having an array #stack" );
  }

  var instance = View.constructor.call( Section.prototype, details );
  instance.father = father;
  instance.router = express.Router();
  instance.router.view = instance;

  return instance.router.use(function section( req, res, next ){
    instance.inspection();
    // determine the view that will handle the request
    res.locals.view = instance.seekView( req.method, req.url );

    // initialize the `menus` local variable
    res.locals.menus = res.locals.menus || [];
    assert( isArray(res.locals.menus), '`menus` local var must be array');

    // save existing `menu` before overwriting it
    if( res.locals.menu ){
      assert( isArray(res.locals.menu), '`menu` local var must be array');
      res.locals.menus.push( res.locals.menu );
    }

    // determine this section menu converting layers to urls
    var usePath = instance.seekUse( req.method, req.url );
    res.locals.menu = instance.menu.map(function toLink( layer ){
      if( layer.route ){
        var view = layer.route.stack[0].handle.view;
        return {
          "href": usePath + layer.route.path,
          "text": view.title,
          "title": view.description
        };
      } else {
        throw new Error('lacking implementation for child routers');
      }
    });
    // push this section menu on menus
    res.locals.menus.push( res.locals.menu );
    next();
  });
}

Section.prototype = Object.create( View );
Section.prototype.constructor = Section;

/*
 *  inspects `this.father.stack` and `this.router.stack` to determine:
 *    - `this.uses` (array): layers on father.stack where router is "used"
 *    - `this.menu` (array): layers on router.stack being Views
 *  @param cached (bool): set to false to force the inspection to be done.
 *                        defaults to true when NODE_ENV is 'production'
 *  @returns (bool): whatever the inspection was done.
 */
Section.prototype.inspection = function inspection( cached ){
  cached = !!( cached || process.env.NODE_ENV === 'production' );
  // inspect only once when cached is true
  if( cached && this.uses && this.menu ){
    return false;
  }

  // determine this.uses
  this.uses = this.father.stack.filter(function( layer ){
    return layer.handle === this.router;
  }, this);
  console.log(
      "EXTRACTED %d USES AMONG %d LAYERS",
      this.uses.length,
      this.father.stack.length
  );

  // determine this.menu
  this.menu = this.router.stack.filter(function isView( layer ){
    // discard layers that aren't routes or routers
    if( !layer.route && !layer.handle.stack ) return false;

    // proceed with extraction
    if( layer.route ){
      // TODO this should extract a single handle really¿?
      // reduce the route stack to layers that are views
      var stack = layer.route.stack.filter(function( layer ){
        return layer.handle.view instanceof View;
      });
      // discard routes whose stack contains no view handles
      if( stack.length ){
        console.log( "EXTRACTED ROUTE (%d VIEW HANDLES)", stack.length );
      }
      return !!stack.length;
    }
    else if( layer.handle.stack ){
      console.log( "EXTRACT ROUTER", layer.handle.stack );
      throw new Error('lacking implementation for router extraction');
    }
  });
  console.log(
    "EXTRACTED %d VIEWS AMONG %d LAYERS",
    this.menu.length,
    this.router.stack.length
  );
  return true;
};

// determine the first mount path that matches method and url
Section.prototype.seekUse = function seekUse( method, url ){
  // inspection must be done and there must be some mount path
  assert( isArray(this.uses), 'inspection must be done' );
  assert( this.uses.length, 'there is no mount path' );

  method = method.toLowerCase();
  // TODO the section router could be mounted on more than 1 path
  if( this.uses.length > 1 ){
    throw new Error("lacking implementation for multiple 'uses'");
    // TODO determine what path is used on multiple 'uses' cases
    // use request method and url to do so
  }
  // TODO may include a parameter!!
  assert( !~this.uses[0].path.indexOf(':'), 'lacking params implementation');
  return this.uses[0].path;
}

// determine the first View in layer array that matches method and url
// stack defaults to this.menu
Section.prototype.seekView = function seekView( method, url, stack ){
  stack = isArray(stack)? stack : this.menu;
  assert( isArray(stack), 'inspection not done or stack is non-array');

  console.log( "SEEK VIEW %s %s IN %d LAYERS", method, url, stack.length );
  var view = null;
  stack.some(function( layer ){
    var match = url.match( layer.regexp );
    if( !match ){ return false; }

    if( layer.route ){
      // TODO this should use #some and return the first layer matching method
      // reduce the search to the route stack layers that match method
      stack = layer.route.stack.filter(function( layer ){
        return layer.method !== method;
      });
      //console.log( "FOUND ROUTE (%d LAYERS)", stack.length );
      assert( stack.length, 'matched route without view layers' );
      assert( stack.length === 1, 'matched route with too much layers' );
      // TODO deal with multiple view routes

      view = stack[0].handle.view;
      console.log( "FOUND VIEW", view );
    } else if( layer.handle.stack ){
      console.log( "FOUND ROUTER (%d LAYERS)", layer.handle.stack.length );
      // reduce the search to the router stack layers
      // TODO layer.handle.stack should be filtered to extract Views
      // see breadcumbs middleware for posible implementation
      view = seekView(
        method,
        url.slice( match[0].length ) || '/',
        layer.handle.stack
      );
    } else {
      throw new Error("expecting only routes and routers");
    }
    // stop search on first match
    assert( view !== null, 'seek stoped prematurely (bad implementation)' );
    assert( view instanceof View, 'matched non-view handle' );
    return true;
  });
  return view;
};


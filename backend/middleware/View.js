var Controller = require( './Controller' );
var assert = require( 'assert' );

module.exports = View;

function View( details ){
  details = details || {};
  if( !details.name || !details.desc ){
    throw new Error( "all views must have #name and #desc" );
  }

  var instance = Object.create( View.isPrototypeOf(this)? this : View );
  instance.title = details.name;
  instance.description = details.desc;
  instance.data = details.data || {};
  if( Object.prototype.toString.call(instance.data) !== '[object Object]' ){
    throw TypeError("detected a possible collision with old api style");
  }

  return instance;
}

View.constructor = View;
View.constructor.prototype = View;

View.create = function createViewHandle( meta, handle ){
  var handle = Controller( meta, handle );
  handle.view = View( meta );
  return handle;
};

View.translate = function translateView( t ){
  assert( 'function' === typeof t, 't must be a function' );
  // TODO Decide if create an empty object rather than reusing the view
  var result = Object.create(this);
  var o = Object.keys(this)
    .filter(function( p ){ return 'string' === typeof this[p]; }, this)
    .forEach(function( p ){ result[p] = t(this[p], this.data); }, this)
  ;
  return result;
};

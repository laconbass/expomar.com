var Controller = require( './Controller' );

module.exports = View;

function View( details ){
  details = details || {};
  if( !details.name || !details.desc ){
    throw new Error( "all views must have #name and #desc" );
  }

  var instance = Object.create( View.isPrototypeOf(this)? this : View );
  instance.title = details.name;
  instance.description = details.desc;
  return instance;
}

View.constructor = View;
View.constructor.prototype = View;

View.create = function createViewHandle( meta, handle ){
  var handle = Controller( meta, handle );
  handle.view = View( meta );
  return handle;
};

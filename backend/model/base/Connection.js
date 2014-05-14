var oop = require('../../../../iai').oop
  , Factory = require( './Factory' )
;

module.exports = createConnection;

function createConnection( options ){
  options = options || {};
  return Factory( options.engine, 'Connection' )( options );
}

var Connection = createConnection.prototype = {
  db: null,
  close: function close( callback ){
    throw new Error( "Implementations should override Connection#close" );
  },
  toString: function( ){
    return "[object Connection]";
  }
};

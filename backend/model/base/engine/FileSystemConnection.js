var oop = require( 'iai-oop' )
  , assert = require( 'assert' )
  , Connection = require( '../Connection' )
  , fs = require( 'fs' )
;

var exports = module.exports = createConnection;

function createConnection( options ){
  var connection = Object.create( exports.Connection )

  options = options || {};
  connection.db = new exports.Database( options.dirname );
  return connection;
}

exports.Connection = oop.extend( Connection, {
  db: null,
  close: function close( callback ){
    if( this.db === null ){
      return callback( new Error( this + 'already closed') );
    }
    this.db.close( callback );
    this.db = null;
  },
  toString: function( ){
    return "[object FileSystemConnection]";
  }
});

exports.Database = FileSystemDB

function FileSystemDB( dirname ){
  //TODO on "connection" callback?
  //TODO dirname => object providing both required and optional params?
  assert( dirname, 'dirname must be provided' );

  var instance = Object.create( FileSystemDB );
  instance.dirname = dirname;
  return instance;
}

FileSystemDB.constructor = FileSystemDB;
// TODO FileSystemDB should be an event emitter??
FileSystemDB.constructor.prototype = FileSystemDB;

FileSystemDB.close = function close( callback ){
  process.nextTick( callback );
  return true;
}

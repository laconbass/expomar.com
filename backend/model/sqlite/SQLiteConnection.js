var iai = require('../../../../iai')
  , oop = iai( 'oop' )
  , Connection = require( '../base/Connection' )
  , sqlite3 = require( 'sqlite3' )
;

module.exports = createConnection;

function createConnection( options ){
  var connection = Object.create( SQLiteConnection )

  options = options || {};
  connection.db = new sqlite3.Database( options.filename, options.mode, function(){
    console.log( "sqlite3 database (%s) opened successfully", options.filename );
  });
  /*connection.db.on('error', function( err ){
    err.message = 'SQLiteConnection!!: ' + err.message;
    throw err;
  })*/
  return connection;
}

var SQLiteConnection = oop.extend( Connection, {
  db: null,
  close: function close( callback ){
    if( this.db === null ){
      return callback( new Error('SQLiteConnection already closed') );
    }
    this.db.close( callback );
    this.db = null;
  },
  toString: function( ){
    return "[object SQLiteConnection]";
  }
});

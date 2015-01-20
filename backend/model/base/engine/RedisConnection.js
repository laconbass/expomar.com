var oop = require( 'iai-oop' )
  , Connection = require( '../Connection' )
  , redis = require( 'redis' )
;

module.exports = createRedisClient;

function createRedisClient( options ){
  var connection = Object.create( RedisConnection )

  options = options || {};
  connection.db = redis.createClient( options.port, options.host, options )
    /*.on('error', function( err ){
      err.message = 'RedisConnection!!: ' + err.message;
      throw err;
    })*/
  ;
  return connection;
}

var RedisConnection = oop.extend( Connection, {
  db: null,
  close: function close( callback ){
    if( this.db === null ){
      return callback( new Error('RedisConnection already closed') );
    }
    if( callback ){
      var db = this.db;
      db
        .once( 'error', function( err ){
          db.removeListener( 'end', callback );
          callback( err );
        })
        .once( 'end', function(){
          db.removeListener( 'error', callback );
          callback( null );
        })
        .end()
      ;
      delete db;
    }
    this.db = null;
  },
  toString: function( ){
    return "[object RedisConnection]";
  }
});

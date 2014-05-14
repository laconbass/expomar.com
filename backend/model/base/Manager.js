var oop = require( '../../../../iai' )( 'oop' )
  , Connection = require('./Connection')
  , Factory = require('./Factory')
;

var Manager = module.exports = {
  /**
   * Definition
   */
  uses: {},
  extend: function( prototype ){
    return oop.extend( this, prototype || {} );
  },
  /**
   * Connection control
   */
  dbControl: null,
  db: null,
  /**
   * @returns {function}: a bind for this.disconnect, for convenience
   */
  connect: function( ){
    if( ! Array.isArray(this.uses) ){
      this.dbControl = Connection( this.uses );
      this.db = this.dbControl.db;
      this.dao = Factory( this.uses.engine, 'DAO' );
    }
    else {
      throw new Error( "multiple uses not tested yet" );
      this.dbControl = this.uses.map(function( options ){
        return Connection( options );
      }, this);
      this.db = this.dbControl.map(function( connection ){
        return connection.db;
      });
      //this.dao = ??
    }
    return this.disconnect.bind( this );
  },
  disconnect: function( ){
    if( ! Array.isArray(this.uses) ){
      this.dbControl.close();
      this.dbControl = this.db = null;
      return;
    }

    throw new Error( "multiple uses not tested yet" );
    this.dbControl.forEach(function( connection ){
      connection.close();
    });
    this.dbControl.length = this.db.length = 0;
  },
  /**
   * Querying
   */
  // returns one entity
  read: function( pk, callback ){
    var disconnect = this.connect();

    this.dao.read( this.schema, this.db, pk, function( err, entity ){
      disconnect();
      callback( err, entity );
    });

    return this;
  },
  // returns array of entities
  find: function( filters, callback ){
    var disconnect = this.connect();

    this.dao.find( this.schema, this.db, filters, function( err, results ){
      disconnect();
      callback( err, results );
    });

    return this;
  },
  // counts entities
  count: function( ){
    throw new Error("not implemented yet");
  },
  // saves a new entity to db
  create: function( data, callback ){
    var disconnect = this.connect();

    this.dao.create( this.schema, this.db, data, function( err, entity ){
      disconnect();
      callback( err, entity );
    });

    return this;
  },
  // updates one entity
  update: function( data, callback ){
    var disconnect = this.connect();

    this.dao.update( this.schema, this.db, data, function( err, entity ){
      disconnect();
      callback( err, entity );
    });

    return this;
  },
  // fully removes one entity from db
  destroy: function( pk, callback ){
    var disconnect = this.connect();

    this.dao.destroy( this.schema, this.db, pk, function( err, success ){
      disconnect();
      callback( err, success );
    });

    return this;
  }
};

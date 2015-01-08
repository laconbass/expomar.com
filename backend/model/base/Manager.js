var oop = require( 'iai-oop' )
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
    if( ! this.db ){
      /*if( Array.isArray(this.uses) ){
        throw new Error( "multiple uses not tested yet" );
        this.dbControl = this.uses.map(function( options ){
          return Connection( options );
        }, this);
        this.db = this.dbControl.map(function( connection ){
          return connection.db;
        });
      }*/
      this.dbControl = Connection( this.uses );
      this.db = this.dbControl.db;
      this.dao = this.dao || Factory( this.uses.engine, 'DAO' );
    }
    return this;
    //return this.disconnect.bind( this );
  },
  disconnect: function( ){
    if( ! Array.isArray(this.uses) ){
      this.dbControl.close();
      this.dbControl = this.db = null;
      return;
    }
    /*throw new Error( "multiple uses not tested yet" );
    this.dbControl.forEach(function( connection ){
      connection.close();
    });
    this.dbControl.length = this.db.length = 0;*/
  },
  /**
   * BASIC QUERYING
   */
  // initializes the database
  initialize: function( insertions, callback ){
    if( arguments.length < 2 ){
      callback = insertions;
      insertions = [];
    }
    this.connect();
    this.dao.initialize( this.schema, this.db, insertions, callback );
    return this;
  },
  // saves a new entity to db
  create: function( data, callback ){
    this.connect();
    this.dao.create( this.schema, this.db, data, callback );
    return this;
  },
  // returns one entity
  read: function( pk, callback ){
    this.connect();
    this.dao.read( this.schema, this.db, pk, callback );
    return this;
  },
  // updates one entity
  update: function( data, callback ){
    this.connect();
    this.dao.update( this.schema, this.db, data, callback );
    return this;
  },
  // fully removes one entity from db
  destroy: function( pk, callback ){
    this.connect();
    this.dao.destroy( this.schema, this.db, pk, callback );
    return this;
  },
  /**
   * CONDITIONAL QUERYING
   */
  // callsback an array of entities
  find: function( filters, callback ){
    this.connect();
    this.dao.find( this.schema, this.db, filters, callback );
    return this;
  },
  // counts entities
  count: function( filters, callback ){
    this.connect();
    this.dao.count( this.schema, this.db, filters, callback );
    return this;
  },
  // finds ONE entity. If more than 1 entity is found, an error is thrown
  findOne: function( filters, callback ){
    this.connect();
    this.dao.findOne( this.schema, this.db, filters, callback );
    return this;
  },
  /**
   * Misc
   */
  toString: function(){
    return "Manager ("+this.schema._type+")";
  }
};

var oop = require( 'iai-oop' )
  , f = require( 'util' ).format
  , fs = require( 'fs-extra' )
  , DAO = require( '../DAO' )
  , async = require( 'async' )
;

module.exports = oop.extend( DAO, {
  initialize: function( schema, db, fixtures, callback ){
    if( arguments.length < 4 ){
      callback = fixtures;
      fixtures = [];
    }
    fixtures = Array.isArray(fixtures)? fixtures : [ fixtures ];

    var dao = this;
    function finish( err ){
      if( err ) return callback( err );
      fixtures.length
        ? dao.create( schema, db, fixtures.shift(), finish )
        : callback( null )
      ;
    }
    db.readdir(function( err, files ){
      if( err ){
        return callback( err );
      }
      if( files.length ){
        return callback( new Error('already initialized') );
      }
      finish();
    });
    return this;
  },
  /**
   * @function create: Saves an entity to the database
   *
   * fails if entity already exists
   *
   * semantic validation (i.e, Field.unique) makes sense here.
   */
  create: function( schema, db, input, callback ){
    // TODO validate input against schema prior to insert it
    input = schema.clean( input );

    // treat unique fields as dirnames inside db.dirname
    // TODO this is not the way to go. maybe a schema.nextPk(manager, input)
    var dirnames = schema
      .filter(function( field ){ return field.unique; })
      .map(function( key ){ return db.resolve( input[key] ); })
    ;

    async.waterfall([
      function checkUniques( callback ){
        async.some( dirnames, fs.exists, function( result ){
          // TODO way to identify what field is not unique?
          callback( result? new Error('not unique') : null );
        });
      },
      function createDirnames( callback ){
        async.each( dirnames, fs.ensureDir, callback );
      }
    ], function( err, result ){
      if( err ){
        return callback( err );
      }
      callback( null );
    });
    return this;
  },
  /**
   * @function read: Reads one entity from the database by primary key
   */
  read: function( schema, db, pk, callback ){
    db.readdir( pk, function( err, files ){
      if( err && err.code === 'ENOENT' ){
        // no entity found
        return callback( null, null );
      } else if( err ){
        return callback( err, null );
      }
      // TODO decouple Schema from DAO implementation
      callback( null, { year: pk } );
    })
    return this;
  },
  /**
   * @function update: Saves an entity to the database
   *
   * fails if entity does not exist
   */
  update: function( schema, db, input, callback ){
    // TODO sanitize pk to avoid injection
    var pk = input.pk;
    // TODO validate input data against schema before update entity
    input = schema.clean( input );
    throw new Error( 'not implemented yet' );
    return this;
  },
  /**
   * @function destroy: Deletes an entity from the database
   *
   * fails if entity does not exist
   */
  destroy: function( schema, db, pk, callback ){
    throw new Error( 'not implemented yet' );
    return this;
  },
  /**
   * # CONDITIONAL QUERYING
   */
  count: function( schema, db, filters, callback ){
    throw new Error( 'not implemented yet' );
    return this;
  },
  find: function( schema, db, filters, callback ){
    throw new Error( 'not implemented yet' );
    return this;
  },
  findOne: function( schema, db, filters, callback ){
    throw new Error( 'not implemented yet' );
    return this;
  },
  /**
   * # MISC
   */
  toString: function( ){
    return "[object FileSystemDAO]";
  }
});

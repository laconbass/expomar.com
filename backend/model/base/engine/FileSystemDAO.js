var oop = require( 'iai-oop' )
  , f = require( 'util' ).format
  , DAO = require( '../DAO' )
;

module.exports = oop.extend( DAO, {
  initialize: function( schema, db, insertions, callback ){
    throw new Error( 'not implemented yet' );
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

    throw new Error( 'not implemented yet' );
    return this;
  },
  /**
   * @function read: Reads one entity from the database by primary key
   */
  read: function( schema, db, pk, callback ){
    throw new Error( 'not implemented yet' );
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

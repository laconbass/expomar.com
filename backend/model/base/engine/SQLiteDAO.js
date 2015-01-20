var oop = require( 'iai-oop' )
  , f = require( 'util' ).format
  , DAO = require( '../DAO' )
;

module.exports = oop.extend( DAO, {
  initialize: function( schema, db, insertions, callback ){
    if( arguments.length < 4 ){
      callback = insertions;
      insertions = [];
    }
    if( !Array.isArray(insertions) ){
      insertions = [ insertions ];
    }

    //var SQL = "BEGIN TRANSACTION;\n";
    var SQL = "";
    SQL += f("CREATE TABLE %s (\n", schema._type);
    SQL += "    pk INTEGER PRIMARY KEY,\n";
    // extra fields from schema
    SQL += schema.keys().map(function( fname ){
      var field = schema[ fname ];
      // TODO: desc depends on field
      var desc = "TEXT COLLATE NOCASE DEFAULT NULL";
      if( field.unique ){
        desc += " UNIQUE";
      }
      return f("    %s %s", fname, desc);
    }).join(',\n');
    SQL += "\n);\n";
    //SQL += "COMMIT TRANSACTION;";

    // TODO log SQL query for debugging
    //console.log( SQL );
    db.run( SQL, finish);

    var dao = this;
    function finish( err ){
      if( err ){
        return callback( err );
      }
      if( insertions.length ){
        //console.log( "should insert %j", insertions[0] );
        return dao.create( schema, db, insertions.shift(), finish );
      }
      callback( null );
    }

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

    var keys = schema.keys();
    var names = keys.map(function( k ){ return "`"+k+"`"; }).join(', ');
    var vals = keys.map(function( k ){
      return input[k]? JSON.stringify(input[k]) : "NULL";
    }).join(', ');

    //var SQL = "BEGIN TRANSACTION;\n"
    var SQL = f("INSERT INTO `%s` (%s) VALUES (%s);\n", schema._type, names, vals);
    //SQL += "COMMIT;";

    // TODO log SQL query for debugging
    //console.log( SQL );
    db.run( SQL, function( err ){
      if( err ){
        return callback( err );
      }
      input.pk = this.lastID;
      callback( null, input );
    })
    return this;
  },
  /**
   * @function read: Reads one entity from the database by primary key
   */
  read: function( schema, db, pk, callback ){
    // TODO sanitize pk to avoid injection
    var SQL = f("SELECT * FROM `%s` WHERE pk = %d;", schema._type, pk);

    // TODO log SQL query for debugging
    //console.log( SQL );
    db.get(SQL, function( err, row ){
      if( err ){
        return callback( err );
      }
      if( "undefined" === typeof row ){
        return callback( null, null );
      }
      callback( err, row );
    });
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
    var vals = schema.keys().map(function( fname ){
      return f( "%s = %s", fname, input[fname]? JSON.stringify(input[fname]) : "NULL" );
    }).join(', ');
    var SQL = f( "UPDATE `%s` SET %s WHERE pk = %d;", schema._type, vals, pk );
    // TODO log SQL query for debugging
    // console.log( SQL );
    db.run( SQL, function( err ){
      if( err ){
        return callback( err );
      }
      if( this.changes === 1 ){
        input.pk = pk;
        return callback( err, input );
      }
      if( this.changes === 0 ){
        return callback( new Error("no changes were made") );
      }
      callback( new Error(this.changes+" changes were made!!!") );
    });
    return this;
  },
  /**
   * @function destroy: Deletes an entity from the database
   *
   * fails if entity does not exist
   */
  destroy: function( schema, db, pk, callback ){
    var SQL = f( "DELETE FROM `%s` WHERE pk = %d;", schema._type, pk );
    // TODO log SQL query for debugging
    //console.log( SQL );
    db.run( SQL, function( err ){
      if( err ){
        return callback( err );
      }
      if( this.changes === 1 ){
        return callback( err, true );
      }
      if( this.changes === 0 ){
        return callback( new Error("no changes were made") );
      }
      callback( new Error(this.changes+" changes were made!!!") );
    });
    return this;
  },
  /**
   * # CONDITIONAL QUERYING
   */
  filterOne: null,
  filterAny: null,
  filterAll: null,
  filters: function( schema, object ){
    return "";
  },
  count: function( schema, db, filters, callback ){
    // ¿?
    filters = this.filters( schema, filters );
    var SQL = f( "SELECT count(*) FROM `%s` %s;", schema._type, filters );
    // TODO log SQL query for debugging
    //console.log( SQL );
    db.get( SQL, function( err, row ){
      if( err ){
        return callback( err );
      }
      callback( err, row['count(*)'] );
    });
    return this;
  },
  find: function( schema, db, filters, callback ){
    // ¿?
    filters = this.filters( schema, filters );
    var SQL = f( "SELECT * FROM `%s`%s;", schema._type, filters );
    // TODO log SQL query for debugging
    //console.log( SQL );
    db.all( SQL, callback );
    return this;
  },
  findOne: function( schema, db, filters, callback ){

    var SQL = f( "SELECT * FROM `%s`", schema._type );
    filters = Object.keys(filters).map(function( fname ){
      if( schema[ fname ].unique ){
        return f( "%s = %s", fname, JSON.stringify(filters[fname]) );
      }
      throw Error( 'non-unique filters not implemented' );
    }).join( " AND ");
    if( filters ){
      SQL += f( " WHERE", filters );
    }
    SQL += ";";

    // TODO log SQL query for debugging
    //console.log( SQL );
    db.all( SQL, function( err, rows ){
      if( err ){
        return callback( err );
      }
      if( rows.length == 1 ){
        return callback( null, rows[0] );
      }
      if( rows.length < 1 ){
        return callback( null, null );
      }
      callback( Error(f('found %d results while expecting only one', rows.length)) );
    });
    return this;
  },
  /**
   * # MISC
   */
  toString: function( ){
    return "[object SQLiteDAO]";
  }
});

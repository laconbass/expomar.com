var oop = require( 'iai-oop' )
  , isNull = function( o ){ return o === null; }
  , f = require( 'util' ).format
  , DAO = require( '../DAO' )
;

module.exports = oop.extend( DAO, {
  /**
   * @function read: Reads an entity from the database
   */
  read: function( schema, db, pk, callback ){
    var keys = schema.keys();
    var args = keys.map(function( key ){
      return f("%s:%d:%s", schema._type, pk, key);
    });

    args.push(function( err, replies ){
      var user = { pk: pk };
      keys.forEach(function( key, index ){
        user[ key ] = replies[ index ];
      });

      if( !err && replies.every( isNull ) ){
        user = null
      } else if( !err && replies.some( isNull ) ){
        err = new Error( "malformed entity on database" );
      }

      callback( err, err? null : user );
    });

    db.MGET.apply( db, args );
  },
  /**
   * @function create: Saves an entity to the database
   *
   * fails if entity already exists
   *
   * semantic validation (i.e, Field.unique) makes sense here.
   */
  create: function( schema, db, input, callback ){
    var dao = this;
    // INCR to get the new pk
    db.INCR( "pk:"+schema._type, function( err, pk ){
      if( err ){
        return callback( err );
      }
      // delegate on #save, once we know the pk
      input.pk = pk;
      dao.save( schema, db, input, callback );
    });
  },
  /**
   * @function update: Saves an entity to the database
   *
   * fails if entity does not exist
   */
  update: function( schema, db, input, callback ){
    if( !input.pk ){
      return callback( new Error("can't update without knowing pk") );
    }
    var dao = this;
    db.EXISTS( f("%s:%d:pk", schema._type, input.pk), function( err, reply ){
      if( !reply ){
        return callback( new Error( f(
          "%s with pk '%d' does not exist", schema._type, input.pk
        ) ) )
      }
      // delegate on #save
      dao.save( schema, db, input, callback );
    })
  },
  /**
   * @internal {function} save: Saves an entity to the database
   *
   * does not care if the entity exist or not
   */
  save: function( schema, db, input, callback ){
    if( !input.pk ){
      return callback( new Error("can't save to db without knowing pk") );
    }
    var pk = input.pk;

    // MSET with field data
    // convention is $type:$pk:$field [$value]
    var args = [];
    for( var key in input ){
      args.push( f("%s:%d:%s", schema._type, pk, key) );
      args.push( input[ key ] );
    }
    // MSET can't fail
    args.push( callback.bind({}, null, input) );
    // save it for later
    var MSET = db.MSET.apply.bind( db.MSET, db, args );
    delete args;

    // HSETNX for lookup hashes (1 per unique field)
    // this both saves and validates "unique" fields are unique
    // convention is lookup:$type:$field [$value : $pk]
    var unique = schema.keys().filter(function( field ){
      return !!schema[ field ].unique;
    });
    // skip this step if there aren't unique fields
    if( !unique.length ){ return MSET(); }
    //
    // deletes on fail are not performed correcly!!
    //
    // MULTI HSETNX
    // MULTI HDEL
    db.MULTI( unique.map(function( field ){
      return [
        "HSETNX", f( "lookup:%s:%s", schema._type, field ),
        input[ field ], pk
      ];
    }) )
    .exec(function( err, replies ){
      if( err ){
        return callback( err );
      }
      if( replies.every(function( r ){ return r === 1; }) ){
        // no errors, run previously prepared MSET
        return MSET();
      }
      // if there are errors, delete all inserted fields
      db.MULTI(
        unique
        .filter(function( field, i ){ return replies[ i ] === 1; })
        .map(function( field ){
          return [
            "HDEL", f( "lookup:%s:%s", schema._type, field ), input[ field ]
          ];
        })
      ).exec(function( err, replies2 ){
        if( err ){
          return callback( err );
        }
        if( replies2.some(function( r ){ return r !== 1; }) ){
          return callback( new Error( "couldn't perform clean-up") );
        }
        // notify all non-valid fields
        err = new Error("");
        unique
          .filter(function( field, i ){ return replies[ i ] === 0; })
          .forEach(function( field, i, a ){
            err.message = err.message
              + f( "%s '%s' already exists", field, input[ field ] )
              + ( (i < a.length-1)? '\n' : '' )
            ;
          })
        ;
        callback( err, null );
      });
    })/*
    hkeys.forEach(function( hash, i ){
      works++;
      db.HSETNX( hash, values[i], pk, function( err, reply ){
        console.log( hash, values[i], pk, reply );
        // store field names where values are not valid
        if( !reply ){ errors.push( unique[i] ); }
        // check whatever we must finish or wait
        if( --works > 0 ){ return; }
        console.log( works, errors );
        // no errors, run previously prepared MSET
        if( ! errors.length ){ return MSET(); }
        // if there are errors, delete all keys
        // don't run previously prepared MSET
        // just callback error listing non-valid fields
        err = new Error("");
        errors.forEach(function( field, i ){
          err.message = err.message
            + f( "%s '%s' already exists", field, values[i] )
            + ( (i < errors.length-1)? '\n' : '' )
          ;
        })
        hkeys.push( callback.bind({}, err, null) );
        db.DEL.apply( db, hkeys );
      });
    });*/
  },
  destroy: function( schema, db, pk, callback ){
    var keys = schema.keys(), args = keys.map(function( key ){
      return f("%s:%d:%s", schema._type, pk, key);
    });

    args.push(function( err, reply ){
      if( !err && reply != keys.length ){
        err = new Error( "not completely destroyed" )
      }
      callback( err, !err );
    });

    db.DEL.apply( db, args );
  },
  find: function( schema, db, filters, callback ){
    var lists = {};
    console.log( filters );
    Object.keys( filters ).forEach(function( field, i, a ){
      var lookup = f( "lookup:%s:%s", schema._type, field )
        , filter = filters[ field ]
      ;
      console.log( field );
      filter = is.RegExp( filter )
        ? filter.test.bind( filter )
        : (function( value ){ return value === this; }).bind( filter )
      ;
      db.HKEYS( lookup, function( err, list ){
        console.log( list, i, a );
        lists[ field ] = list.filter(filter);
        if( i == a.length - 1 ){
          console.log( "last iteration");
          console.dir(lists);
        }
      })
    })
  },
  toString: function( ){
    return "[object RedisDAO]";
  }
});

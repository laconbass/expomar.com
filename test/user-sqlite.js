var assert = require('chai').assert
  , fs = require('fs')
  , iai = require('../../iai')
  , sqlite3 = require( 'sqlite3' )
  , testinput = { username: "testuser", password: "randompass", email: "test@testing.com" }
  , testdb = iai.project.resolve('data/testing.db')
;

describe( "User Manager", function(){
  var manager;
  before(function( done ){
    manager = iai.project.require( 'backend/model/user/UserManager' );
    // ensure we are not working with important data...
    assert.equal( manager.uses.filename, testdb );
    fs.unlink( testdb, function( err ){
      if( err ) return done(err);
      manager.connect();
      // ensure connection was created properly
      assert( manager.db instanceof sqlite3.Database, "bad connection" );
      done();
    });
  });

  describe( '#initialize', function(){
    it( 'should execute without errors on empty database', function( done ){
      manager.initialize( testinput, done );
    });
    it( 'should create the database table', function( done ){
      var SQL = "SELECT tbl_name FROM sqlite_master WHERE type = 'table';";
      manager.db.all(SQL, function( err, rows ){
        if( err ){
          return done( err );
        }
        assert( rows[0].tbl_name == 'user', "table not created" );
        done();
      });
    });
    it( 'should throw if table already exists', function( done ){
      manager.initialize(function( err ){
        assert( err !== null, "should receive an error" );
        done();
      });
    })
    it( 'should insert given data on the table with pk=1', function( done ){
      var SQL = "SELECT * FROM user;";
      manager.db.all(SQL, function( err, rows ){
        assert.isNull( err );
        assert( rows.length == 1, "should get only 1 row" );
        for( var key in testinput ){
          assert.equal( rows[0][ key ], testinput[ key ], "field "+key+ " should match" );
        }
        done();
      });
    });
  });

  describe( '#read', function(){
     it( 'should callback( null, null ) if not found', function( done ){
      manager.read( 2, function( err, user ){
        assert.isNull( err );
        assert.isNull( user );
        done();
      });
    });
    it( 'should get a user from the database', function( done ){
      manager.read( 1, function( err, user ){
        assert.isNull( err );
        assert.isNotNull( user );
        for( var key in testinput ){
          assert.equal( user[ key ], testinput[ key ], "field "+key+ " should match" );
        }
        done();
      });
    });
  });

  describe( '#create', function(){
    it( 'should add a new user to the database', function( done ){
      var data = { username: "testuser2", password: "testpass2", email: "email@domain.com" };
      manager.create( data, function( err, user ){
        assert.isNull( err );
        assert.isNotNull( user );
        assert.equal( user.pk, 2 );
        for( var key in data ){
          assert.equal( user[ key ], data[ key ], "field "+key+ " should match" );
        }
        done();
      })
    });
    it( 'should fail if username already exists on db', function( done ){
      var data = { username: "testuser2", password: "testpass2", email: "email123" };
      manager.create( data, function( err, user ){
        assert.instanceOf( err, Error );
        done();
      });
    })
    it( 'should fail if email already exists on db', function( done ){
      var data = { username: "testuser3", password: "testpass", email: "email@domain.com" };
      manager.create( data, function( err, user ){
        assert.instanceOf( err, Error );
        done();
      });
    })
  });

  describe( '#update', function(){
    it( 'should edit an user on the database', function( done ){
      var data = { pk: 1, username: "pepe", password: "domonte", email: "furado" };
      manager.update( data, function( err, user ){
        assert.isNull( err );
        assert.equal( user.pk, 1, "pk should be 1" );
        manager.read( user.pk, function( err, user ){
          assert.isNull( err );
          assert.equal( user.username, data.username, "name should match" );
          assert.equal( user.password, data.password, "pass should match" );
          assert.equal( user.email, data.email, "email should match" );
          done();
        });
      })
    });
    it( 'should fail if user does not exist', function( done ){
      var data = { pk: 100, username: "does", password: "not", email: "exist" };
      manager.update( data, function( err, user ){
        assert.instanceOf( err, Error );
        done()
      })
    })
  });

  describe( '#destroy', function(){
    it( 'should remove a user from the database', function( done ){
      manager.destroy( 1, function( err, success ){
        assert.isNull( err );
        assert.isTrue( success );
        manager.read( 1, function( err, user ){
          assert.isNull( err );
          assert.isNull( user, "next read should callback null" );
          done();
        });
      })
    });
    it( 'should fail if user does not exist', function( done ){
      manager.destroy( 100, function( err, user ){
        assert.instanceOf( err, Error );
        done();
      })
    })
  });

  describe( '#find', function(){
    it( 'should always callback an array', function( done ){
      manager.find( {}, function( err, results ){
        assert.isNull( err );
        assert.isArray( results );
        assert.equal( results.length, 1, "should retrieve all users if no filters" );
        done();
      })
    });
    it.skip( 'should retrieve only users matching $query if given', function( done ){
      var data = { username: "testuser3", password: "testpass3", email: "email3" };
      var data2 = { username: "rarename", password: "testpass", email: "email3332" };
      manager.create( data, function( err ){
        assert.isNull(err);
        manager.create( data2, function( err ){
          assert.isNull(err);
          manager.find( { $query: 'test' }, function( err, results ){
            assert.isNull( err );
            assert.isArray( results );
            assert.equal( results.length, 2 );
          })
        })
      })
    });
    it( 'should retrieve only 2 results if $limit set to 2' )
  });

  describe( '#count', function(){
    it( 'should always callback a number', function( done ){
      manager.count( {}, function( err, n ){
        assert.isNull(err);
        assert.isNumber(n);
        done();
      })
    });
    it( 'should retrieve all users count if no filters are given', function( done ){
      manager.count( {}, function( err, n ){
        assert.isNull( err );
        manager.find( {}, function( err, results ){
          assert.isNull( err );
          assert.equal( n, results.length );
          done();
        });
      });
    });
    it( 'should retrieve the count of users matching given filters' );
  });

})

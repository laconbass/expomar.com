var assert = require('chai').assert
  , fs = require('fs-extra')
  , resolve = require('path').resolve
  , fsdb = require('../backend/model/base/engine/FileSystemConnection').Database
;

var testdb = resolve( process.cwd(), 'data-test' );
var testinput = {
  year: 1994
};

/*function testUserData( input, output ){
  for( var key in input ){
    var method = key === 'password'? 'notEqual' : 'equal';
    assert[ method ]( output[ key ], input[ key ] );
  }
};*/

describe.only( "Feira Manager (filesystem)", function(){
  var manager;
  before(function( done ){
    manager = require( '../backend/model/feira/FeiraManager' );

    // ensure we are working with test data...
    fs.ensureDirSync( testdb );
    testdb = resolve( testdb, manager.schema._type );
    assert.equal( manager.uses.dirname, testdb );

    // delete the db directory to test #initialize
    try {
      fs.removeSync( testdb );
    } catch( e ){
      if( e.code !== 'ENOENT' ){
        throw e;
      }
    }
    manager.connect();
    // TODO ensure connection was created properly
    assert( manager.db instanceof fsdb, 'connection was not created' );
    done();
  });

  describe( '#initialize', function(){
    it( 'should execute without errors on empty database', function( done ){
      manager.initialize( testinput, done );
    });
    it( 'should create the directory structure', function( done ){
      fs.stat( testdb, function( err, stats ){
        assert.isNull( err, 'unexpected error' );
        assert( stats.isDirectory(), 'it should create a directory' );
        done();
      })
    });
    it( 'should throw if dirname already exists', function( done ){
      manager.initialize(function( err ){
        assert( err !== null, "should receive an error" );
        done();
      });
    })
    it( 'should create a directory whose name is the year', function( done ){
      fs.stat( resolve(testdb, ''+testinput.year), function( err, stats ){
        assert.isNull( err, 'unexpected error' );
        assert( stats.isDirectory(), 'it should create a directory' );
        done();
      })
    });
  });

  describe.skip( '#read', function(){
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
        testUserData( testinput, user );
        done();
      });
    });
  });

  describe.skip( '#create', function(){
    it( 'should add a new user to the database', function( done ){
      var data = { username: "testuser2", password: "testpass2", email: "email@domain.com" };
      manager.create( data, function( err, user ){
        assert.isNull( err );
        assert.isNotNull( user );
        assert.equal( user.pk, 2 );
        testUserData( data, user );
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

  describe.skip( '#update', function(){
    it( 'should edit an user on the database', function( done ){
      var data = { pk: 1, username: "pepe", password: "domonte", email: "furado" };
      manager.update( data, function( err, user ){
        assert.isNull( err );
        assert.equal( user.pk, 1, "pk should be 1" );
        manager.read( user.pk, function( err, user ){
          assert.isNull( err );
          testUserData( data, user );
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

  describe.skip( '#destroy', function(){
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
    });
  });

  describe.skip( '#find', function(){
    it( 'should always callback an array', function( done ){
      manager.find( {}, function( err, results ){
        assert.isNull( err );
        assert.isArray( results );
        assert.equal( results.length, 1, "should retrieve all users if no filters" );
        done();
      })
    });
    it.skip( 'should retrieve only users matching $query if given (maybe #search)', function( done ){
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

  describe.skip( '#count', function(){
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

  describe.skip( '#findOne', function(){
    it('should callback  null if no entity matchs filters', function( done ){
      manager.findOne({ username: 'unexistent' }, function( err, user ){
        assert.isNull( err );
        assert.isNull( user );
        done();
      });
    })
    it('should callback an user given an existent username', function( done ){
      var data = { username: "testuser5", password: "testpass", email: "bla@bal.com" };
      manager.create( data, function( err ){
        assert.isNull( err );
        manager.findOne({ username: data.username }, function( err, user ){
          assert.isNull( err );
          testUserData( data, user );
          done();
        });
      });
    });
  });

  describe.skip( '#authenticate', function(){
    it('should callback user given valid credentials', function( done ){
      manager.authenticate( 'testuser5', 'testpass', function( err, user ){
        assert.isNull( err );
        assert.isDefined( user.username );
        assert.isDefined( user.email );
        done();
      });
    });
    it('should callback false given existent user with bad password', function( done ){
      manager.authenticate( 'testuser5', 'badpass', function( err, user ){
        assert.isNull( err );
        assert.isFalse( user );
        done();
      });
    });
    it('should callback null given unexistant user', function( done ){
      manager.authenticate( 'unexistent', 'nomatter', function( err, user ){
        assert.isNull( err );
        assert.isNull( user );
        done();
      });
    });
  });
})

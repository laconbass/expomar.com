var assert = require('chai').assert
  , iai = require('../../iai')
  , schema = iai.project.require( 'backend/model/user/UserSchema' )
;

describe.skip( "User Manager (Redis)", function(){
  var manager;
  before(function( done ){
    manager = iai.project.require( 'backend/model/user/UserManager' );
    manager.connect();
    manager.db.KEYS( "*", function( err, keys ){
      if( err ){
        return done( err );
      }
      manager.disconnect();
      if( keys.length != 0 ){
        console.error( "" )
        console.error( "found %s keys on database", keys.length );
        console.error( "database for testing must be empty" );
        console.error( "will halt to avoid data loss" );
        console.error( "" )
        process.exit( 1 );
      }
      done();
    })
  })

  after(function(done){
    manager.connect();
    manager.db.KEYS( "*", function( err, keys ){
      console.log( "deleted the following keys from database after tests:" );
      console.dir( keys );
      keys.push(function(){
        manager.disconnect();
        done();
      });
      manager.db.DEL.apply( manager.db, keys );
    });
  })

  describe( '#read', function(){
    before(function(done){
      manager.connect();
      manager.db.MSET(
        "pk:user", 1,
        "user:1:pk", "1",
        "user:1:username", "testuser",
        "user:1:password", "randompass",
        "user:1:email", "test@testing.com",
        done
      );
    });
    it( 'should get a user from the database', function( done ){
      manager.read( 1, function( err, user ){
        assert.isNull( err );
        assert.equal( user.username, "testuser", "name should match" );
        assert.equal( user.password, "randompass", "pass should match" );
        assert.equal( user.email, "test@testing.com", "email should match" );
        done();
      });
    });
  });

  describe( '#create', function(){
    it( 'should add a new user to the database', function( done ){
      var data = { username: "testuser2", password: "testpass2", email: "email@domain.com" };
      manager.create( data, function( err, user ){
        assert.isNull( err );
        assert.isNotNull( user, "user should be an object" );
        assert.equal( user.pk, 2 );
        manager.read( user.pk, function( err, user ){
          assert.isNull( err );
          assert.isNotNull( user, "user should be found on database" );
          assert.equal( user.username, data.username, "name should match" );
          assert.equal( user.password, data.password, "pass should match" );
          assert.equal( user.email, data.email, "email should match" );
          done();
        });
      })
    });
    it( 'should fail if username already exists on db', function( done ){
      var data = { username: "testuser2", password: "testpass2", email: "email123" };
      manager.create( data, function( err, user ){
        assert.instanceOf( err, Error );
        assert.equal( err.message, "username 'testuser2' already exists" );
        done();
      });
    })
    it( 'should fail if email already exists on db', function( done ){
      var data = { username: "testuser3", password: "testpass", email: "email@domain.com" };
      manager.create( data, function( err, user ){
        assert.instanceOf( err, Error );
        assert.equal( err.message, "email 'email@domain.com' already exists" );
        done();
      });
    })
    it( 'should not increment pk:user when fails', function( done ){
      manager.connect();
      manager.db.GET( "pk:user", function( err, reply ){
        manager.disconnect();
        assert.isNull( err );
        assert.equal( reply, "2" );
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
    it( 'should fail if user does not exist' )
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
    it( 'should retrieve only users matching given filters', function( done ){
      var data = { username: "testuser3", password: "testpass3", email: "email3" };
      var data2 = { username: "rarename", password: "testpass", email: "email3332" };
      manager.create( data, function( err ){
        assert.isNull(err);
        manager.create( data2, function( err ){
          assert.isNull(err);
          manager.find( { username: /^test/ }, function( err, results ){
            assert.isNull( err );
            assert.isArray( results );
            assert.equal( results.length, 2 );
          })
        })
      })
    });
  });

  describe.skip( '#count', function(){
    it( 'should always callback a number', function( done ){
      manager.count( {}, function( err, n ){
        assert.isNull(err);
        assert.isNumber(n);
      })
    });
    it( 'should retrieve all users count if no filters are given' );
    it( 'should retrieve the count of users matching given filters' );
  });

})

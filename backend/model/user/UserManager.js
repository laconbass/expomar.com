var Manager = require('../base/Manager')
  , resolve = require('path').resolve
;

var exports = module.exports = Manager.extend({
  uses: {
    engine: 'SQLite',
    filename: resolve( process.cwd(), 'data/testing.db')
  },
  schema: require( './UserSchema' )
})

exports.authenticate = function( username, password, callback ){
  var pass = this.schema.clean({ password: password }).password;
  this.findOne({ username: username }, function( err, user ){
    if( err ){
      return callback( err );
    }
    // callbacks:
    //  null, if no user is found for `username`
    //  false, if user was found but `password` is not correct
    //  user object, if authentication was successfull
    user = ! user? null : user.password === pass? user : false;
    callback( null, user );
  });
};


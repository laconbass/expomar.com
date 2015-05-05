var Manager = require('../base/Manager')
  , resolve = require('path').resolve
;

var exports = module.exports = Manager.extend({
  uses: {
    engine: 'SQLite',
    filename: resolve( process.cwd(), 'data/testing.db')
  },
  schema: require( './UserSchema' )
});

exports.authenticate = function( username, password, callback ){
  var that = this;
  this.findOne({ username: username }, function( err, user ){
    if( err ){
      return callback( err );
    }
    var pass = that.schema.clean({ password: password }).password;
    user = ! user? null : user.password === pass? user : false;
    // callbacks:
    //  null, if no user is found for `username`
    //  false, if user was found but `password` is not correct
    //  user object, if authentication was successfull
    callback( null, user );
  });
};

/**
 * Password changer
 */

exports.changepwd = function( username, password, callback ){
  var that = this;
  // TODO require old password to change it? => use this.authenticate instead
  this.findOne({ username: username }, function( err, user ){
    if( err ){
      return callback( err );
    }
    user.password = password;
    that.update( user, callback );
  });
};

/**
 * Password reset trigger (depends on backend/mailer) service
 */
var mailer = require('../../mailer');
var tokens = {};

exports.resetpwd = function( username, callback ){
  this.findOne({ username: username }, function( err, user ){
    if( err ){
      return callback( err );
    }
    if( !user ){
      return callback( new Error('Ese usuario non existe') );
    }
    // generate link to the password reset form somehow
    var link = 'http://example.com';
    mailer.send({
      to: user.email,
      subject: 'Instruccións para recuperar o contrasinal',
      message: 'Visite a seguinte ligazón para cambiar o contrasinal: '+link
    }, callback );
  });
};

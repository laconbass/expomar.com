var manager = require('../backend/model/user/UserManager');

var newpwd = process.env.NEWPWD;
if( !newpwd ){
  throw 'You forgot defining a NEWPWD env variable';
}

manager.changepwd('lorenzogrv', newpwd, function( err, user ){
  if( err ){
    throw err;
  }
  console.log('password updated');
  var check = manager.schema.clean({ password: newpwd }).password;
  console.log( 'post-updating test:', user.password === check );
});

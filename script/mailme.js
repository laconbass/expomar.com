var UserManager = require('../backend/model/user/UserManager');

UserManager.resetpwd( 'lorenzogrv', function( err, info ){
  if( err ) throw err;
  // TODO accept a '-v' param
  //console.dir( info );
  console.log( 'Succeed!' );
});

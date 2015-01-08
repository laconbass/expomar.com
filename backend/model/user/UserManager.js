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
  callback( new Error('authenticate is not implemented') );
};

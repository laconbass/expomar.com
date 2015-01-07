var iai = require( '../../../../iai' )
  , Manager = require('../base/Manager')
;

module.exports = Manager.extend({
  uses: {
    engine: 'SQLite',
    filename: iai.project.resolve('data/testing.db')
  },
  schema: require( './UserSchema' )
})

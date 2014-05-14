var iai = require( '../../../../iai' )
  , Manager = require('../base/Manager')
;

module.exports = Manager.extend({
  uses: {
    engine: 'Redis'
  },
  schema: require( './UserSchema' )
})

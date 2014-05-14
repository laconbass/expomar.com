var oop = iai = require( '../../../../iai' )( 'oop' )
  , Schema = require( '../base/Schema' )
  , Field = Schema.Field
;

/**
 *
 *
 */

var User = module.exports = Schema();

User._type = "user";

User.username = Field({
  unique: true
});

User.password = Field({

});

User.email = Field({
  unique: true
});

var assert = require('chai').assert
  , iai = require('../../iai')
;

describe( "User Schema", function(){
  var schema;
  before("should be required without errors", function(){
    schema = iai.project.require( 'backend/model/user/UserSchema' );
  })
})

var oop = require('iai-oop')
  , Schema = require( '../base/Schema' )
  , Field = Schema.Field
;

/**
 *
 *
 */

var exports = module.exports = Schema();

exports._type = "feira";

exports.year = Field({
  unique: true
});


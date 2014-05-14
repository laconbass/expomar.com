var iai = require( '../../../../iai' )
  , oop = iai( 'oop' )
;

/**
 *
 * defines on the destination object as many non-enumerable, writable
 * data descriptors as the enumerable properties the source object has.
 */

function mixin( destination, source ){
  if( !source ){
    return destination;
  }

  destination = oop( destination )
  for( var property in source ){
    destination.internal( property, source[property] );
  }
  return destination.o;
}

function isBool( o ){
  return o === true || o === false;
}

// ----------------------------------------------------------------------------

/**
 * # Convention Notes about data validation
 *
 * validation: Action of performing asynchronous checks on some input data
 *             to determine if it's valid, resulting an error or the cleaned data.
 *
 *             The syntax is: validate( input, callback(err, data) )
 *
 * Validator:  function object that performs validations.
 *             The Component on a composite-like hirearchy of validators.
 * Field:      The Leaf on a composite-like hiearchy of validators
 * Schema:     The Composite on a composite-like hiearchy of validators
 *
 * By convention, each enumerable property (owned or inherited) represents either:
 *   - A parameter for validation, on Fields.
 *   - A field, on Schemas.
 */

// ----------------------------------------------------------------------------

/**
 * @builder {function} Validator: The interface for data validators
 * @param {object} prototype (optional): prototype to extend from.
 *
 * The extend functionality is based on oop.extend.
 * All properties inherited from prototype are set to internal - with
 * `oop().internal` - to avoid interferences with Validator properties
 * convention.
 *
 */

function createValidator( prototype ){
  var validator = function( input, callback ){
    validator.validate( input, callback );
  };

  mixin( validator, oop.extend(Validator, prototype) );

  return validator;
}

var Validator = {
  /**
   * @internal {string} _type: Human readable name of the data type
   */
  _type: "Validator",
  /**
   * @internal {function} validate: Determine whatever the input data is valid.
   * @param {*} input: the input data
   * @param {function(err, data)}: the callback function
   * @returns {undefined}
   *
   * Asynchronously, performs all necessary operations to determine if the
   * given data is valid and passes results on to the callback function.
   */
  validate: function( input, callback ){
    process.nextTick(
      callback.bind( null, Error('Implementations should override Validator#validate') )
    );
    return this;
  },
  /**
   * @function keys: Returns an array consisting of the enumerable properties
   * of this object, including those inherited from its prototype chain.
   */
  keys: function(){
    var keys = [];
    for( var property in this ){
      keys.push( property );
    }
    return keys;
  },
  /**
   * @function vals: Returns an array consisting of the stored values.
   */
  vals: function(){
    return this.keys().map(function(n){ return this[n]; }, this);
  },
  /**
   * @function toString: Returns a string representation of the structure.
   *
   * The convention is `<_type [trueBoolProp, property=value, property2=value]>`
   * where `_type` is the value of the internal self-named property.
   * Properties storing booleans appear on first place if are true, or doesn'to
   * appear at all if are false.
   */
  toString: function(){
    var keys = this.keys();
    return "<"+(this._type)+" ["
      + keys
        // filter booleans and remove properties being false
        .filter(function( n ){ return isBool( this[n] ); }, this)
        .filter(function( n ){ return this[n]; }, this)
        .join(', ')
      + keys
        .filter(function( n ){ return ! isBool( this[n] ); })
        .map(function( n ){ return n + '=' + this[n]; }, this)
        .join(', ')
      + "]>"
    ;
  }
};


function createField( params ){
  return createValidator( oop.extend(Field, params || {}) );
}

// Field's prototype
var Field = {
  // ensure each new entity has an unique value on this field
  // this validation can only be performed at DAO-level
  unique: false
};

function createSchema( name ){
  return createValidator( Schema );
}

// Schema's prototype
var Schema = {
  validate: function( input, callback ){
  }
};

/**
 * @exports
 */

var exports = module.exports = createSchema;
exports.Field = createField;

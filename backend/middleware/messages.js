var swig = require('swig')
  , f = require('util').format
;

module.exports = messages;

/**
 * Provides push-messaging system
 */

function messages(  ){
  return function messages( req, res, next ){
    res.locals.messages = [];
    res.message = function( msg ){
      msg = f.apply( f, arguments );
      msg = swig.render( msg , {
        autoescape: false,
        locals: res.locals
      });
      res.locals.messages.push( msg );
      return res;
    }
    next();
  };
}

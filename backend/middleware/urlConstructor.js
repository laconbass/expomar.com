
var iai = require('iai')
  , f = require('util').format
;

module.exports = urlConstructor;

/**
 * Helps constructing urls
 */

function urlConstructor(){
  return function( req, res, next ){
    res.locals.location = req.url;
    res.locals.url = function url( subdomain, path ){
      return f(
        'http://%s%s%s', subdomain? (subdomain+'.') : '',
        iai.production? iai.conf.domain : ( iai.conf.domain+':'+iai.conf.port ),
        path? ( path[0] == '/'? path : ('/'+path) ) : ''
      );
    };
    next();
  }
}

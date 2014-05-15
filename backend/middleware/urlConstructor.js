
module.exports = urlConstructor;

/**
 * Helps constructing urls
 */

function urlConstructor( fn ){
  return function( req, res, next ){
    res.locals.location = req.url;
    res.locals.url = fn;
    next();
  }
}

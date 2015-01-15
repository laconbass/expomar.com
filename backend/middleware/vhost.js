/**
 * Sighly modified version of connect's Vhost
 * http://www.senchalabs.org/connect/vhost.html
 */

var util = require( 'util' );

exports = module.exports = vhost;

exports.version = '2';
exports.stability = 3;

function vhost( hostname, server ) {
  if ( !hostname ) throw new Error('vhost hostname required');
  if ( !server ) throw new Error('vhost server required');

  if ( !util.isRegExp( hostname ) )
    hostname = new RegExp('^' + hostname.replace(/[*]/g, '(.*?)') + '$', 'i');

  var isApp = 'function' === typeof server.all;
  if( isApp ) server.use(function( req, res ){ res.sendStatus(404); });


  return function vhost(req, res, next) {
    if ( !req.headers.host ) return res.sendStatus(400);
    var host = req.headers.host.split(':')[0];
    if ( !hostname.test( host ) ) return next();
    if ( 'function' === typeof server )
      return server( req, res, isApp? next : end(res) );
    server.emit( 'request', req, res );
  };
}

function end( res ){
  return function end( err ){
    if( err ) return res.send(500, err.message);
    res.send(404)
  }
}

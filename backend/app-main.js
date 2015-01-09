var express = require( 'express' )
  , app = express()
  , swig = require('./swig')
  , marked = require( 'marked' )
  , readFile = require( 'fs' ).readFile
  , vhost = require( './middleware/vhost' )
  , morgan = require( 'morgan' )
  , bytes = require( 'bytes' )
  , resolve = require('path').resolve
  , production = process.env.NODE_ENV === 'production'
  , morganFormat = production? 'custom' : 'dev'
  , morganOpts = production? {} : { inmediate: true }
;

module.exports = app;

//
// Settings
//

app.engine( 'html', swig.renderFile );
app.engine( 'md', function( path, locals, callback ){
  readFile( path, 'utf8', function( err, md ){
    if( err ){
      return callback( err );
    }
    try {
      callback( null, marked( md ) );
    } catch( err ){
      callback( err );
    }
  });
});

app.disable('x-powered-by');
app.set( 'views', resolve( process.cwd(), 'templates') );
app.set( 'view engine', 'html' );

morgan.format( 'custom', function(tokens, req, res){
  var status = res.statusCode
    , len = parseInt(res.getHeader('Content-Length'), 10)
    , color = 32;

  if (status >= 500) color = 31
  else if (status >= 400) color = 33
  else if (status >= 300) color = 36;

  len = isNaN(len)
    ? ''
    : len = ' - ' + bytes(len);

  return '' + ( req.headers['x-forwarded-for'] || morgan['remote-addr'](req) )
    + ' \x1b[90m' + req.method
    + ' ' + req.host + (req.originalUrl || req.url) + ' '
    + '\x1b[' + color + 'm' + res.statusCode
    + ' \x1b[90m'
    + (new Date - req._startTime)
    + 'ms' + len
    + '\x1b[0m';
});

//
// Middleware & subdomain/path routing
//

app
  .use( require( 'static-favicon' )( resolve('static/favicon.ico') ) )
  .use( vhost( 'static.*', require('./app-static') ) )
  .use( morgan( morganFormat, morganOpts ) )
  .use( vhost( 'admin.*', require('./app-admin') ) )
  .use( require('./app-public') )
;

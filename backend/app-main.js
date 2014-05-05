var iai = require('../../iai')
  , project = iai.project
  , express = require( 'express' )
  , app = express()
  , swig = iai.project.require('backend/swig')
  , marked = require( 'marked' )
  , readFile = require( 'fs' ).readFile
  , vhost = iai( 'middleware/vhost' )
  , morgan = require( 'morgan' )
  , bytes = require( 'bytes' )
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

app.set( 'views', project.resolve('templates') );
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

  return '' + morgan['remote-addr']( req )
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
  .use( require( 'static-favicon' )( project.resolve('static/favicon.ico') ) )
  .use( vhost( 'static.*', project.require('backend/app-static') ) )
  .use( morgan( iai.production? 'custom' : 'dev' ) )
  .use( vhost( 'admin.*', project.require('backend/app-admin') ) )
  .use( project.require('backend/app-public') )
;

var iai = require('../../iai')
  , project = iai.project
  , express = require( 'express' )
  , app = express()
  , swig = iai.project.require('backend/swig')
  , marked = require( 'marked' )
  , readFile = require( 'fs' ).readFile
  , vhost = iai( 'middleware/vhost' )
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

//
// Middleware & subdomain/path routing
//

app
  .use( require( 'static-favicon' )( project.resolve('static/favicon.ico') ) )
  .use( vhost( 'static.*', project.require('backend/app-static') ) )
  .use( require( 'morgan' )( iai.production? ':remote-addr - :method :req[Host]:url - :status - :res[content-length] - :response-time ms' : 'dev' ) )
  .use( vhost( 'admin.*', project.require('backend/app-admin') ) )
  .use( project.require('backend/app-public') )
;

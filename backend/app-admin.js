var iai = require('../../iai')
  , project = iai.project
  , express = require( 'express' )
  , app = express.Router()
  , auth = require( 'basic-auth' )
 // , f = require('util').format
;

module.exports = app;

//
// Middleware
//

var user = process.env.ADMIN_USER
  , pass = process.env.ADMIN_PASS
;

if( iai.production && ( !user || !pass ) ){
  throw Error( 'Production mode requires ADMIN_USER and ADMIN_PASS to be set' );
} else {
  user = user || 'admin';
  pass = pass || 'admin';
}

app
  .use( function( req, res, next ){
    var login = auth( req );
    if( !login || login.name != user || login.pass != pass ){
      return res.set('www-authenticate', 'basic').send( 401 );
    }
    next();
  })
  .use( require('./middleware/messages')() )
  .use( require('./middleware/urlConstructor')( require('./utils').url ) )
  .use( require('./middleware/i18n')( 'gl', [] ) )
;

//
// Layout
//

function view( content ){
  content = content || {};

  return function view( req, res, next ){
    res.locals.content = content;

    if( !content.layout ){
      return res.render( 'admin.swig.html' )
    }

    res.render( content.layout, function( err, html ){
      if( err ){
        return next( err );
      }
      res.locals.html = html;
      res.render( 'admin.swig.html' )
    });
  }
}

//
// Routes
//

app
  .get( '/', view({
  }) )
  .get( '/actualidade', view({
  }) )
  .get( '*', view({
  }) )
;

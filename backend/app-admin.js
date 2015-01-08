var express = require( 'express' )
  , app = express.Router()
  , auth = require( './app-auth.js' )
 // , f = require('util').format
;

module.exports = app;

//
// Layout
//

var Layout = require( './middleware/Layout' );

var admin = [ 'admin.swig.html' ];

//
// Middleware
//

app
  .use( require('./middleware/messages')() )
  .use( require('./middleware/urlConstructor')( require('./utils').url ) )
  .use( require('./middleware/i18n')( 'gl', [] ) )
;


//
// Routes
//

app.use( auth(Layout({
  "name": "Identifíquese",
  "desc": "Páxina de acceso á interface de administración",
  "layout": admin.concat('login.swig.html')
})) )

app.get( '/', Layout({
  "name": "Panel de administración de expomar.com",
  "desc": "Páxina principal da interface de administración",
  "layout": admin
}) );
